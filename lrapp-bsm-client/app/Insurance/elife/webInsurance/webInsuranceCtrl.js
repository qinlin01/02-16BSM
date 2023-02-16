/**
 * Created by sunlikun on 2021/3/25.
 */
app.controller('webInsuranceCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, FileUploader) {
    const uploader = $scope.uploader = new FileUploader({
        url: $rootScope.basePath + 'webInsurance/upLoadExcel',
        queueLimit: 100,  //文件个数
        removeAfterUpload: false,
        autoUpload: true,
        headers: {'x-auth-token': window.sessionStorage.getItem("token")},
    });
    uploader.onBeforeUploadItem = function (item) {   //文件上传之前
        if ($scope.VO.id) {
            item.formData = [{"id": $scope.VO.id}];
        } else {
            layer.alert("数据没有id", {skin: 'layui-layer-lan', closeBtn: 1});
        }
    };
    uploader.onProgressItem = function (fileItem, progress) {
        layer.load(2);
    };
    uploader.filters.push({
        name: 'customFilter',
        fn: function (item, options) {
            if (!$scope.VO.pkProject) {
                layer.alert("请先选择立项", {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
            if (!$scope.VO.fictitiousBusinessType) {
                layer.alert("立项中未带出产品类型，请排查！", {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            if (type == "||") {
                type = '|' + item.name.split('.')[item.name.split('.').length - 1] + '|';
            }
            if (/['"#$%&<>\^*]/.test(item.name)) {
                layer.alert("文件名称不允许包含特殊字符", {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
            console.log(type);
            if ('|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|'.indexOf(type) !== -1) {
                return true;
            } else {
                layer.alert("请上传Excel文件", {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
        }
    });
    uploader.onSuccessItem = function (fileItem, response, status, headers) {
        $scope.onShowSumNum();
        if (response.code == "200") {
            $scope.VO.fileList.push(response.data);
            $scope.VO.receiveperiod = 1;
            $scope.fileGridOptions.data = $scope.VO.fileList;
            layer.msg('匹配完成，是否查看详情？', {
                time: 0 //不自动关闭
                , btn: ['是', '否']
                , yes: function (index) {
                    layer.close(index);
                    $scope.onDetail();
                }
            });
        } else {
            layer.alert("失败", {skin: 'layui-layer-lan', closeBtn: 1});
        }
    }

    uploader.onErrorItem = function (fileItem, response, status, headers) {
        layer.closeAll();
    };

    $scope.initData = function () {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                webInsuranceInfoList: [],
                webInsuranceManList: [],
                webPaymentList: [],
                internetBillList: [],
                fileList: [],
                insuranceinfono: "",
                insuranceName: "",
                pkProject: null,
                businessType: 0,
                pkBusiType: "",
                pkProjectKind: "",
                ifRetroactive: "",
                signingWay: 0,
                fictitiousBusinessType: null,
                insuranceNum: 0,
                insurancetotalmoney: 0,
                receiveperiod: 1,
                receivemount: 0,
                insurancetotalcharge: 0,
                isReplace: "Y",
                isPay: "Y",
                paymount: 0,
                payperiod: 1,
                receivefeeperiod: 1,
                receivefeemount: 0,
                onlinePartyAmount: 0,
                offlinePaymentAmount: 0,
                settlementOnlineMount: 0,
                settlementOfflineMount: 0,
                settlementPaymount: 0,
                settlementFeemount: 0,
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                receivefeemRate: 0,
                id:null
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.SUM_NUM = {
            goodDataNum: 0,
            disDataNum: 0,
            changeDataNum: 0,
            badDataNum: 0,
            detailTotal: 0
        }
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "substr(create_time,1,4)0_0eq" : parseInt(new Date().format("yyyy")),
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode = '910';
        $scope.param = {
            c_2_type: 0,
            pk_org_str: $rootScope.orgVO.pk,
            busi_type: "notNull"
        };
    };

    $scope.projectRef =
        {
            id: $scope.$id,
            columnDefs: [
                {
                    field: 'code',
                    displayName: '项目编号'
                },
                {
                    field: 'name',
                    displayName: '项目名称'
                },
                {
                    field: 'cinsureman_code',
                    displayName: '投保人编号'
                },
                {
                    field: 'cinsureman_name',
                    displayName: '投保人'
                }

            ],
            data: ""
        };

    $scope.initHttp = function () {

        $scope.getReceivemountAndPayPayment = function (typeMoneyNo){
            $http({
                method: "POST",
                url: $rootScope.basePath + "webInsurance/generatePyament",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response && response.code == 200) {
                    for (let i = 0; i < response.result.length; i++) {
                        if (response.result[i].typeMoneyNo == typeMoneyNo) {
                            $scope.paymentGridOptions.data.push(response.result[i]);
                        }
                    }
                }
            });

        };

        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function () {
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.basePath + "webInsurance/queryForAllGrid", {
                current: $scope.gridApi.page ? $scope.gridApi.page : 1,
                size: $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100,
            }).success(function (response) {
                $scope.gridOptions.data = response.data.records;
                $scope.gridOptions.totalItems = response.data.total;
                layer.closeAll('loading');
            }).error(function () {
                layer.closeAll('loading');
            });
        };
        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            return $http.post($rootScope.basePath + "webInsurance/queryForGrid", {
                params: angular.toJson(data),
                current: $scope.gridApi.page ? $scope.gridApi.page : 1,
                size: $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100,
            }).success(function (response) {
                $scope.gridOptions.data = response.data.records;
                $scope.gridOptions.totalItems = response.data.total;
                layer.closeAll('loading');
            }).error(function () {
                layer.closeAll('loading');
            });
        };

        $scope.findOne = function (id, callback) {
            $scope.id = id;
            $http.post($scope.basePath + "webInsurance/findOne", {id: id}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    $scope.onShowSumNumEdit();
                    angular.assignData($scope.VO, response.data);
                    $scope.insuranceinfoGridOptions.data = $scope.VO.webInsuranceInfoList;
                    $scope.insurancemanGridOptions.data = $scope.VO.webInsuranceManList;
                    $scope.fileGridOptions.data = $scope.VO.fileList;
                    $scope.paymentGridOptions.data = $scope.VO.webPaymentList;
                    if (callback) callback();
                    //判断是否代收代付
                    for (let i = 0; i < $scope.insurancemanGridOptions.data.length; i++) {
                        if($scope.insurancemanGridOptions.data[i].ifReplace == 'Y' && $scope.insurancemanGridOptions.data[i].pay == 'Y'){
                            //页面应收解付保费期数可编辑
                            $scope.isReplace = false;
                        }else{
                            $scope.isReplace = true;
                        }
                    }
                } else {
                    if (response) {
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                let rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                }
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO.webPaymentList = $scope.paymentGridOptions.data;
            $scope.VO.webInsuranceManList = $scope.insurancemanGridOptions.data;
            $scope.VO.webInsuranceInfoList = $scope.insuranceinfoGridOptions.data;
            $scope.VO.fileList = $scope.fileGridOptions.data;
            $http({
                method: "POST",
                url: $rootScope.basePath + "webInsurance/save",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response && response.code == 200) {
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isEdit = false;
                    $scope.isDisabled = true;
                    $scope.isDisableds = true;
                    $scope.isUpdate = false;
                    angular.assignData($scope.VO, response.result);
                    layer.closeAll('loading');
                    return layer.alert('保存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };

        /**
         * 重置账单
         */
        $scope.onResetBill = function () {
            let rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert("请选择一条数据进行重置!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.confirm('是否重置选中数据？', {
                    btn: ['重置', '返回'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消重置!', {
                            shift: 6,
                            icon: 11
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    layer.load(2);
                    $http.post($scope.basePath + "webInsurance/resetBill", {id: rows[0].id}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg('重置成功!', {
                                icon: 1
                            });
                        }else if (response && response.code == "100"){
                            layer.msg(response.msg, {
                                icon: 1
                            });
                        }

                    });
                }
            );
        };
    };

    $scope.initFunction = function () {

        /**
         * 重新生成payment
         */
         $scope.generatePyament = function(typeMoneyNo){
             var newPaymentData = new Array();
             var oldPaymentData = $scope.paymentGridOptions.data;
             if(typeMoneyNo == 3){
                 //应收佣金
                 if($scope.VO.receivefeeperiod != null && $scope.VO.receivefeeperiod!='' && $scope.VO.receivefeeperiod > 0){
                     var receivefeePayment = new Array();
                     //把应收佣金第一期都拿出来
                     for (let i = 0; i < oldPaymentData.length; i++) {
                         if(oldPaymentData[i].typeMoneyNo == 3 && oldPaymentData[i].stages == 1){
                             receivefeePayment.push(oldPaymentData[i]);
                         }
                     }
                     //生成应收佣金收付款
                     for (let i = 1; i <= $scope.VO.receivefeeperiod; i++) {
                         for (let j = 0; j < receivefeePayment.length; j++) {
                             var temporaryData = {};
                             temporaryData = JSON.parse(JSON.stringify(receivefeePayment[j]));
                             //清空hashKey
                             delete temporaryData["$$hashKey"];
                             //期数变更
                             temporaryData.stages = i;
                             //收付款比例清空
                             temporaryData.scaleMoney = null;
                             //金额清空
                             temporaryData.planMoney = null;
                             temporaryData.noPaymentMoney = null;
                             temporaryData.factMoney = null;
                             //主键清空
                             temporaryData.id = null;
                             //放入收付款中
                             newPaymentData.push(temporaryData);
                         }
                     }
                 }
             }
             if(typeMoneyNo == 1){
                 //应收保费
                 if($scope.VO.receiveperiod != null && $scope.VO.receiveperiod!='' && $scope.VO.receiveperiod > 0){
                     var receivemountPayment = new Array();
                     //把应收保费第一期都拿出来
                     for (let i = 0; i < oldPaymentData.length; i++) {
                         if(oldPaymentData[i].typeMoneyNo == 1 && oldPaymentData[i].stages == 1){
                             receivemountPayment.push(oldPaymentData[i]);
                         }
                     }
                     //如果没有原来应收解付去后台查
                     if(receivemountPayment.length == 0){
                         $scope.getReceivemountAndPayPayment(typeMoneyNo);
                         return;
                     }
                     //生成应收保费收付款
                     for (let i = 1; i <= $scope.VO.receiveperiod; i++) {
                         for (let j = 0; j < receivemountPayment.length; j++) {
                             var temporaryData = JSON.parse(JSON.stringify(receivemountPayment[j]));
                             //清空hashKey
                             delete temporaryData["$$hashKey"];
                             //期数变更
                             temporaryData.stages = i;
                             //收付款比例清空
                             temporaryData.scaleMoney = null;
                             //金额清空
                             temporaryData.planMoney = null;
                             temporaryData.noPaymentMoney = null;
                             temporaryData.factMoney = null;
                             //主键清空
                             temporaryData.id = null;
                             //放入收付款中
                             newPaymentData.push(temporaryData);
                         }
                     }
                 }
             }
             if(typeMoneyNo == 2){
                 //解付保费
                 if($scope.VO.payperiod != null && $scope.VO.payperiod!='' && $scope.VO.payperiod > 0){
                     var payPayment = new Array();
                     //把解付保费第一期都拿出来
                     for (let i = 0; i < oldPaymentData.length; i++) {
                         if(oldPaymentData[i].typeMoneyNo == 2 && oldPaymentData[i].stages == 1){
                             payPayment.push(oldPaymentData[i]);
                         }
                     }
                     //如果没有原来应收解付去后台查
                     if(payPayment.length == 0){
                         $scope.getReceivemountAndPayPayment(typeMoneyNo);
                         return;
                     }
                     //生成解付保费收付款
                     for (let i = 1; i <= $scope.VO.payperiod; i++) {
                         for (let j = 0; j < payPayment.length; j++) {
                             var temporaryData = JSON.parse(JSON.stringify(payPayment[j]));
                             //清空hashKey
                             delete temporaryData["$$hashKey"];
                             //期数变更
                             temporaryData.stages = i;
                             //收付款比例清空
                             temporaryData.scaleMoney = null;
                             //金额清空
                             temporaryData.planMoney = null;
                             temporaryData.noPaymentMoney = null;
                             temporaryData.factMoney = null;
                             //主键清空
                             temporaryData.id = null;
                             //放入收付款中
                             newPaymentData.push(temporaryData);
                         }
                     }
                 }
             }
             for (let i = 0; i < $scope.paymentGridOptions.data.length; i++) {
                 delete  $scope.paymentGridOptions.data[i]["$$hashKey"];
                 if($scope.paymentGridOptions.data[i].typeMoneyNo != typeMoneyNo){
                     newPaymentData.push($scope.paymentGridOptions.data[i]);
                 }
             }
             $scope.VO.webPaymentList = newPaymentData;
             $scope.paymentGridOptions.data = $scope.VO.webPaymentList;
        }

        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
    };
    //查看保单详细信息
    $scope.onDetail = function () {
        ngDialog.openConfirm({
            showClose: true,
            closeByDocument: false,
            template: 'view/webInsurance/insuranceBill.html',
            className: 'ngdialog-theme-formInfo',
            controller: 'insuranceBillCtrl',
            scope: $scope,
            rootScope: $rootScope,
            preCloseCallback: function (value) {
                if (value && value == "clear") {
                    //重置
                    return false;
                }
                //取消
                return true;
            }
        }).then(function (value) {

        }, function (reason) {

        });
    };

    $scope.onResetDetail = function () {
        layer.msg('重置将清除掉所有导入的信息，是否继续？', {
            time: 0 //不自动关闭
            , btn: ['是', '否']
            , yes: function (index) {
                layer.close(index);
                $scope.onResetDetailHttp(true);
            }
        });
    }

    $scope.onResetDetailHttp = function (showMsg) {
        layer.load(2);
        $http.post($scope.basePath + "webInsurance/resetDetail", {id: $scope.VO.id}).success(function (response) {
            layer.closeAll('loading');
            if (response && response.code == 200) {
                if (showMsg) {
                    layer.msg('重置成功');
                }
                $scope.onShowSumNum();
                $scope.VO.fileList = [];
                $scope.fileGridOptions.data = $scope.VO.fileList;
            }
        })
    }

    $scope.idIfNull = function () {
        if (!$scope.VO.id || $scope.VO.id == null || $scope.VO.id == "") {
            return true;
        }
        return false;
    }

    $scope.initWatch = function () {
        $scope.$watch('VO.pkProject.name', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if($scope.VO.pkProject.pk == null || $scope.VO.pkProject.pk == ''){
                $scope.VO.pkProject = {};
                return;
            }
            if ($scope.VO.pkProject && $scope.VO.pkProject.name != null) {
                $scope.isDisableds = false;
            } else {
                $scope.isDisableds = true;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $http.post($scope.basePath + "propertyProject/findOne", {pk: $scope.VO.pkProject.pk}).success(function (response) {
                    if (response && response.code == "200") {
                        if (response.result) {
                            $scope.VO.pkProjectKind = {
                                pk: response.result.pkC0Tradetype.pk,
                                code: response.result.pkC0Tradetype.code,
                                name: response.result.pkC0Tradetype.name
                            }
                            $scope.VO.pkBusiType = {
                                pk: response.result.busi_type.pk,
                                code: response.result.busi_type.code,
                                name: response.result.busi_type.name
                            }
                            $scope.VO.pkProject.cinsureman = response.result.cinsureman;
                            if (response.result.ifFictitious == null || response.result.ifFictitious != 'Y') {
                                layer.alert('该立项不属于互联网立项，请确认立项信息，或选择互联网业务项目名称!', {
                                    skin: 'layui-layer-lan',
                                    closeBtn: 1
                                });
                            }
                            // $scope.VO.fictitiousBusinessType = (Number)(response.result.fictitiousBusinessType);
                        }
                    }
                });

            }
        }, true);
        //应收佣金总期数
        $scope.$watch('VO.receivefeeperiod', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            $scope.generatePyament(3);
        }, true);

        //解付保费总期数
        $scope.$watch('VO.payperiod', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            $scope.generatePyament(2);
        }, true);

        //应收保费总期数
        $scope.$watch('VO.receiveperiod', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            $scope.generatePyament(1);
        }, true);

        //是否代收保费
        $scope.$watch('VO.isReplace', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;

            if (newVal === "Y") {
                $scope.VO.receivemount = $scope.VO.insurancetotalcharge;
                $scope.VO.receiveperiod = 1;
            } else {
                $scope.VO.receivemount = 0;
                $scope.VO.receiveperiod = 0;
            }

        }, true);
        //是否解付
        $scope.$watch('VO.isPay', function (newVal, oldVal) {

            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;

            if (newVal === "Y") {
                $scope.VO.paymount = $scope.VO.insurancetotalcharge;
                $scope.VO.payperiod = 1;
            } else {
                $scope.VO.paymount = 0;
                $scope.VO.payperiod = 0;
            }
        }, true);
        $scope.$watch('VO.fictitiousBusinessType', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;

            if (newVal) {
                if ($scope.idIfNull()) {
                    //如果选择了立项，缓存，获取主键
                    $scope.onCache();
                }
            }

        });

    };

    $scope.initButton = function () {

        $scope.checkId = function (){
            if ($scope.VO.id == null || $scope.VO.id == ''){
                $scope.ifupload = true;
            }else{
                $scope.ifupload = false;
            }
        };

        $scope.onDownLoads = function () {
            let rows = $scope.VO.fileList;
            if (!rows || rows.length <= 0) return angular.alert("没有附件信息！");
            let ids = [];
            for (let i = 0; i < rows.length; i++) {
                ids.push(rows[i].pk_object_id);
            }
            let exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };
        $scope.onDownLoadsCard = function (id) {
            let ids = [];
            ids.push(id);
            let exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };
        $scope.onAdd = function () {
            $scope.isClear = true;
            $scope.form = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.isDisableds = true;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.isUploadAnytime = false;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $scope.onResetDetailHttp();
            $scope.VO.webInsuranceManList = [];
            $scope.insurancemanGridOptions.data = [];
        };

        /**
         * 修改
         */
        $scope.onEdit = function () {
            $scope.checkId();
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            $scope.childFlag = true;
            $scope.isDisableds = false;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form = true;
                $scope.isGrid = false;
                let rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id);
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            }
        };


        /**
         * 一会再弄
         */
        $scope.onFindCache = function () {
            $http.post($scope.basePath + "webInsurance/findCache").success(function (response) {
                if (response && response.code == 200) {
                    angular.assignData($scope.VO, response.result);
                    $scope.$apply();//需要手动刷新
                    layer.closeAll();
                }
            });
        }

        /**
         * 修改只进行查询数量
         */
        $scope.onShowSumNumEdit = function () {
            $http.post($scope.basePath + "webInsurance/sumNum", {
                id: $scope.VO.id,
            }).success(function (response) {
                if (response && response.code == 200) {
                    $scope.SUM_NUM = response.data;
                }
            });
        }

        /**
         * 初始化匹配
         */
        $scope.onShowSumNum = function () {
            $http.post($scope.basePath + "webInsurance/sumNum", {
                id: $scope.VO.id,
            }).success(function (response) {
                if (response && response.code == 200) {
                    $scope.SUM_NUM = response.data;
                    $scope.VO.insurancetotalcharge = response.data.insuranceFeeExcel;
                    $scope.VO.paymount = response.data.paymount;
                    $scope.VO.receivemount = response.data.receivemount;
                    $scope.VO.receivemountBill = response.data.insuranceFee;
                    $scope.VO.receivefeemount = response.data.receiveFeeMount;
                    $scope.VO.receivefeemountBill = response.data.receiveFeeMount;
                    $scope.VO.insurancetotalmoney = response.data.insuranceMoney;
                    // $scope.VO.endorsementsInsuranceFee = parseFloat(response.data.insuranceFee) - parseFloat(response.data.insuranceFeeExcel);
                    // $scope.VO.endorsementsReceiveFee = parseFloat(response.data.receiveFeeMount) - parseFloat(response.data.receiveFeeMountExcel);
                    $scope.VO.insuranceNum = response.data.insuranceNum;
                    $scope.VO.onlinePartyAmount = response.data.onlinePartyAmount;
                    $scope.VO.offlinePaymentAmount = response.data.offlinePaymentAmount;

                    $scope.VO.webInsuranceManList = response.data.webInsuranceMan;
                    $scope.insurancemanGridOptions.data = $scope.VO.webInsuranceManList;
                    $scope.VO.webInsuranceInfoList = response.data.webInsuranceInfo;
                    $scope.insuranceinfoGridOptions.data = $scope.VO.webInsuranceInfoList;
                    $scope.VO.webPaymentList = response.data.webPayment;
                    $scope.paymentGridOptions.data = $scope.VO.webPaymentList;
                }
            });
        }

        /**
         * 暂存
         */
        $scope.onTemporary = function (func) {
            $scope.VO.webPaymentList = $scope.paymentGridOptions.data;
            $scope.VO.webInsuranceManList = $scope.insurancemanGridOptions.data;
            $scope.VO.webInsuranceInfoList = $scope.insuranceinfoGridOptions.data;
            $scope.VO.fileList = $scope.fileGridOptions.data;
            $http({
                method: "POST",
                url: $rootScope.basePath + "webInsurance/temporarySave",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response && response.code == 200) {
                    if(func){
                        func();
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        return layer.alert('暂存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
                    }else{
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        $scope.isDisableds = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        return layer.alert('暂存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                }
            });
        }

        /**
         * 缓存
         */
        $scope.onCache = function () {
            $http({
                method: "POST",
                url: $rootScope.basePath + "webInsurance/cache",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response && response.code == 200) {
                    $scope.VO.id = response.result.id;
                    $scope.checkId();
                }
            });
        }

        /**
         * 卡片
         */
        $scope.onCard = function (id) {
            if (!id) {
                let rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1)
                    return layer.alert("请选择一条数据进行查看!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                id = rows[0].id;
            }
            $scope.findOne(id);
            $scope.mess = true;
            $scope.isBack = true;
            $scope.isGrid = false;
            $scope.isCard = true;
            $scope.card = true;
        };
        $scope.onDelete = function () {
            let rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert("请选择数据进行删除!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.confirm('是否删除选中数据？', {
                    btn: ['删除', '返回'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消删除!', {
                            shift: 6,
                            icon: 11
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    let ids = [];
                    for (let i = 0; i < rows.length; i++) {
                        ids.push(rows[i].id);
                    }
                    layer.load(2);
                    $http.post($scope.basePath + "webInsurance/delete", {ids: angular.toJson(ids)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg('删除成功!', {
                                icon: 1
                            });
                        }

                    });
                }
            );
        };

        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            if ($scope.isClear) {
                var lock=false;//默认未锁定
                layer.confirm('是否暂存本条数据？', {
                        btn: ['确定', '取消'], //按钮
                        btn2: function (index, layero) {
                            if(!lock) {
                                //加锁
                                lock = true;
                                $scope.isDisabled = true;
                                $scope.isDisableds = true;
                                $scope.isEdit = false;
                                $scope.isBack = false;

                                if ($scope.idIfNull()) {
                                    return;
                                }
                                $http.post($scope.basePath + "webInsurance/cancel", {id: $scope.VO.id}).success(function (response) {
                                    if (response && response.code == 200) {
                                        $scope.SUM_NUM = response.data;
                                        $scope.VO = $scope.initVO();
                                    }
                                });
                            }
                        },
                        shade: 0.6,//遮罩透明度
                        shadeClose: true,//点击遮罩关闭层
                    },
                    function () {
                        if(!lock) {
                            //加锁
                            lock = true;
                            // 暂存
                            $scope.onTemporary(function () {
                                $scope.isDisabled = true;
                                $scope.isDisableds = true;
                                $scope.isEdit = false;
                                $scope.isBack = false;
                            });
                        }
                    }
                );

            }else{
                $scope.isDisabled = true;
                $scope.isDisableds = true;
                $scope.isEdit = false;
                $scope.isBack = false;
            }
        };
        /**
         * 返回
         */
        $scope.onBack = function () {
            if ($stateParams.id) {
                window.history.back(-2);
                return;
            }
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isFeeEdit = false;
            $scope.isDisabled = true;
            $scope.isDisableds = true;
            //阻止页面渲染
            $scope.form = false;
            $scope.card = false;
            //阻止页面渲染
            $scope.queryForGrid($scope.QUERY);
        };

        /**
         * 保存判断必输项
         */
        $scope.onSave = function () {
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert(errEls[0].ngVerify.OPTS.message,
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    $scope.onSaveVO();
                }
            }, true);
        };
        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };
        $scope.onReset = function () {
            $scope.QUERY = $scope.initQUERY();
        };

        /**
         * 初始化参照
         */
        $scope.initView = function () {

        };
        /**
         * 子表新增
         */
        $scope.onAddLine = function () {
            let data = {};
            if ($scope.selectTabName == 'insuranceinfoGridOptions') {//险种信息
                if ($scope.insuranceinfoGridOptions.data.length == 0) {
                    data.maininsurance = 'Y';
                }
                data.chargerate = '0';
                $scope[$scope.selectTabName].data.push(data);
            } else if ($scope.selectTabName == 'insurancemanGridOptions') {//保险人
                data.replace = 'N';
                data.vdef4 = 'N';
                data.vdef2 = 'N';
                data.pay = 'N';
                $scope.VO.receivefeeperiod = 0;
                if ($scope.insuranceinfoGridOptions.data.length == 0) {
                    data.chiefman = 'N';
                    data.maininsurance = 'Y';
                } else {
                    data.chiefman = 'N';
                }
                if ($scope.insurancemanGridOptions.data.length == 0) {
                    data.insurancerate = '100';
                    data.chiefman = 'Y';
                    if ($scope.VO.insurancetotalmoney == undefined) {
                        $scope.VO.insurancetotalmoney = 0;
                    }
                    //保险人信息增第一行时需要的运算 2019年5月31日
                    data.vdef1 = parseFloat(eval($scope.VO.insurancetotalmoney) * eval(data.insurancerate) / 100).toFixed(2);
                    data.insurancemoney = parseFloat(eval($scope.VO.insurancetotalcharge) * eval(data.insurancerate) / 100).toFixed(2);

                    let inData = $scope.insurancemanGridOptions.data;
                    $scope.VO.paymount = $scope.calPay(inData);
                    $scope.VO.receivemount = $scope.calReceivemount(inData);
                    $scope.VO.receivefeeperiod = 0;
                    $scope.VO.payperiod = 0;
                    $scope.VO.receiveperiod = 0;
                    $scope.VO.payment = [];
                    $scope.paymentGridOptions.data = [];
                }
                $scope[$scope.selectTabName].data.push(data);
                if ($scope.ifGetFee()) {
                    $scope.VO.receivemount = 0;
                    let inData = $scope.insurancemanGridOptions.data;
                    $scope.VO.paymount = $scope.calPay(inData);
                    $scope.VO.receivemount = $scope.calReceivemount(inData);
                }
            } else {
                $scope[$scope.selectTabName].data.push(data);
            }
        };

        $scope.onDeleteLines = function (delRow, tableData) {
            let ids = [];
            for (let i = 0; i < delRow.length; i++) {
                ids.push(delRow[i].$$hashKey);
            }
            let arr = [];
            for (let j = 0; j < tableData.data.length; j++) {
                if (ids.indexOf(tableData.data[j].$$hashKey) < 0) {
                    arr.push(tableData.data[j]);
                }
            }
            tableData.data = arr;
        }
        /**
         * 子表删除
         */
        $scope.onDeleteLine = function () {
            let delRow = $scope[$scope.selectTabName].gridApi.selection.getSelectedRows();

            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (let i = 0; i < $scope[$scope.selectTabName].data.length; i++) {
                for (let j = 0; j < delRow.length; j++) {
                    if ($scope[$scope.selectTabName].data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope[$scope.selectTabName].data.splice(i, 1);
                    }
                }
            }
            if ($scope.selectTabName == "insuranceinfoGridOptions") {
                let array = $scope.insuranceinfoGridOptions.data;
                $scope.VO.insurancetotalmoney = 0;
                if (array.length == 0) {
                    $scope.VO.insurancetotalcharge = 0;
                } else {
                    $scope.VO.insurancetotalcharge = 0;
                    $scope.VO.insurancetotalmoney = 0;
                    for (let i = 0; i < array.length; i++) {
                        $scope.VO.insurancetotalcharge = eval(parseFloat($scope.VO.insurancetotalcharge)) + eval(parseFloat(array[i].insurancecharge).toFixed(2));
                        if (array[i].maininsurance == 'Y') {
                            $scope.VO.insurancetotalmoney = eval(parseFloat($scope.VO.insurancetotalmoney)) + eval(parseFloat(array[i].insurancemoney).toFixed(2));
                        }
                    }
                }
            }
            if ($scope.selectTabName == "insurancemanGridOptions") {
                let array = $scope.insurancemanGridOptions.data;
                $scope.VO.commisiontotalnum = 0;
                if (array.length == 0) {
                    $scope.VO.feemount = 0;
                } else {
                    $scope.VO.commisiontotalnum = 0;
                    $scope.VO.feemount = 0;
                    for (let i = 0; i < array.length; i++) {
                        $scope.VO.commisiontotalnum = parseFloat(eval($scope.VO.commisiontotalnum) + eval(array[i].feemount));
                    }
                    $scope.VO.receivefeemount = parseFloat($scope.VO.commisiontotalnum).toFixed(2);
                    $scope.VO.receivefeeperiod = 0;

                }
            }

        };
    };

    $scope.initPage = function () {
        $scope.ifupload = true;
        $scope.isClear = false;
        $scope.isShow = true;
        //阻止页面渲染
        $scope.form = false;
        $scope.card = false;
        //阻止页面渲染
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.isDisableds = false;
        $scope.queryShow = true;
        //控制附件上传和下载
        $scope.upOrDown = false;
        $scope.isUploadAnytime = false;
        //日期同步标志
        $scope.planDateSyn = true;
        $scope.planDateValue = null;
        //应收解付保费输入标志
        $scope.isReplace = true;
        $scope.gridOptions = {
            rowTemplate: "<div ng-dblclick=\"grid.appScope.onRowDblClick(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>",
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            exporterMenuCsv: true,
            showGridFooter: true,
            showColumnFooter: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '互联网保单信息.csv',
            columnDefs: [
                {
                    name: 'insuranceinfono',
                    displayName: '互联网对账单信息编号',
                    width: 100,
                    footerCellTemplate: '<div class="ui-grid-cell-contents">合计</div>'
                },
                {name: 'insuranceno', displayName: '对账单名称', width: 100,},
                {name: 'pkProject.name', displayName: '业务/项目名称', width: 100,},
                {name: 'pkProject.code', displayName: '立项号 ', width: 100,},
                {name: 'pkBusiType.name', displayName: '业务分类 ', width: 100,},
                {name: 'pkProjectKind.name', displayName: '客户产权关系 ', width: 100,},
                {name: 'fictitiousBusinessType', displayName: '产品名称', cellFilter: 'SELECT_PRODUCTTYPE', width: 100,},
                {
                    name: 'insurancetotalcharge',
                    displayName: '签单总保费(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'insurancetotalmoney',
                    displayName: '保险金额/赔偿限额/(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'paymount',
                    displayName: '应解付总额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'payperiod', displayName: '应解付保费总期数', width: 100,},
                {
                    name: 'receivefeemount',
                    displayName: '应收佣金总额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'receivefeeperiod', displayName: '应收佣金总期数', width: 100,},
                {
                    name: 'receivemount',
                    displayName: '应收保费总额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'receiveperiod', displayName: '应收保费总期数', width: 100,},
                {name: 'ifRetroactive', displayName: '是否有追溯期', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'insuranceNum', displayName: '保单件数', width: 100,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'createTime', displayName: '制单时间', width: 100,},
                {name: 'pkChecker.name', displayName: '审批人', width: 100,},
                {name: 'checkTime', displayName: '审批日期', width: 100, cellFilter: 'date_cell_date'},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '部门', width: 100,},
                {name: 'businessType', displayName: '业务种类', width: 100, cellFilter: 'SELECT_BUSINESSTYPE'},
            ],
            data: [],
            exporterAllDataFn: function () {
                $scope.queryAllForGrid($scope.QUERY);
            },
        };
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;

            //添加行头
            $scope.gridApi.core.addRowHeaderColumn({
                name: 'rowHeaderCol',
                displayName: '',
                width: 30,
                cellTemplate: 'ui-grid/rowNumberHeader'
            });

            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                $scope.gridApi.page = newPage;
                $scope.gridApi.pageSize = pageSize;
                $scope.queryForGrid($scope.QUERY);
            });

            $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                let rows = $scope.gridApi.selection.getSelectedRows();
                if (rows.length == 1) {
                    if (!$scope.chilbTable) {
                        $scope.chilbTable = true;
                    }
                    angular.assignData($scope.VO, row.entity);
                    $scope.findOne(rows[0].id);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });

        };
        $scope.selectTabName = 'insuranceinfoGridOptions';
        $scope.insuranceinfoGridOptions = {
            enableCellEditOnFocus: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'pkInsurance.name',
                    displayName: '险种名称',
                    width: 100,
                    url: 'insuranceRef/queryForGrid'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    isTree: true,
                    popupModelField: 'insurance',
                    params: {type: 'caichan'},
                    enableCellEdit: false,
                },
                {
                    name: 'insuranceAlias', displayName: '具体险种', width: 100,
                    enableCellEdit: false,
                },
                {
                    name: 'insurancemoney',
                    displayName: '保险金额/赔偿限额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    enableCellEdit: false,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'chargerate', displayName: '费率(‰)', width: 100, cellFilter: 'number:6', enableCellEdit: false,
                },
                {
                    name: 'insurancecharge',
                    displayName: '保费(元)',
                    width: 100,
                    cellFilter: 'number:2',
                    enableCellEdit: false,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'franchise', displayName: '免赔额', width: 100, enableCellEdit: false,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
            ],
            data: $scope.VO.webInsuranceInfoList,
            onRegisterApi: function (gridApi) {
                $scope.insuranceinfoGridOptions.gridApi = gridApi;
            }
        };
        //保险人
        $scope.insurancemanGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'pkInsuranceMan.name',
                    displayName: '保险人名称',
                    width: 100,
                    url: 'insuranceCustomerRef/queryForGrid',
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'pkInsuranceMan', enableCellEdit: false,
                },
                {
                    name: 'ifReplace', displayName: '是否代收保费', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO,
                    enableCellEdit: false,
                },
                {
                    name: 'pay', displayName: '是否全额解付', width: 100, cellFilter: 'SELECT_YESNO'
                    , enableCellEdit: false
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO,
                    cellEditableCondition: function ($scope) {
                        return true;
                    },
                },
                {
                    name: 'insurancemoney',
                    displayName: '保险金额/赔偿限额(元)',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'insuranceFee',
                    displayName: '保险保费(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    enableCellEdit: false,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'commisionrate',
                    displayName: '佣金比例(%)',
                    width: 100,
                    cellFilter: 'number:2',
                    enableCellEdit: true,
                },
                {
                    name: 'feemount',
                    displayName: '佣金金额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    enableCellEdit: false,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
            ],
            data: $scope.VO.webInsuranceManList,
            onRegisterApi: function (gridApi) {
                $scope.insurancemanGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        let array = $scope.insuranceinfoGridOptions.data;
                        if ('insurancemoney' == colDef.name || 'feemount' == colDef.name) {
                            for (let i = 0; i < array.length; i++) {
                                array[i].chargerate = (parseFloat(array[i].feemount) / parseFloat(array[i].insuranceFee) * 100).toFixed(2)
                            }
                        }
                        //佣金比例变更后重新计算页面全部佣金
                        if ('commisionrate' == colDef.name) {
                            if (rowEntity.commisionrate != null && rowEntity.commisionrate != "") {
                                let allFeemount = 0;
                                for (let i = 0; i < $scope.insurancemanGridOptions.data.length; i++) {
                                    let feemount = parseFloat($scope.insurancemanGridOptions.data[i].commisionrate) / 100 * parseFloat($scope.insurancemanGridOptions.data[i].insuranceFee);
                                    $scope.insurancemanGridOptions.data[i].feemount = feemount.toFixed(2);
                                    allFeemount = allFeemount + feemount;
                                }
                                $scope.VO.receivefeemountBill = allFeemount.toFixed(2);
                                $scope.VO.receivefeemount = allFeemount.toFixed(2);
                            }
                        }
                        //是否代收代付
                        if ('ifReplace' == colDef.name) {
                            if (rowEntity.ifReplace) {
                                //代收代付
                                if(rowEntity.ifReplace == 'Y'){
                                    //所有保险公司都代收代付
                                    for (let i = 0; i < $scope.insurancemanGridOptions.data.length; i++) {
                                        $scope.insurancemanGridOptions.data[i].ifReplace = 'Y';
                                        $scope.insurancemanGridOptions.data[i].pay = 'Y';
                                    }
                                    //页面应收解付保费期数可编辑
                                    $scope.isReplace = false;
                                    //初始化1期
                                    $scope.VO.payperiod = 1;
                                    $scope.VO.receiveperiod = 1;
                                    //初始化金额
                                    $scope.VO.receivemount = $scope.VO.insurancetotalcharge;
                                    $scope.VO.paymount = $scope.VO.insurancetotalcharge;
                                //非代收代付
                                }else if(rowEntity.ifReplace == 'N'){
                                    //所有保险公司都代收代付
                                    for (let i = 0; i < $scope.insurancemanGridOptions.data.length; i++) {
                                        $scope.insurancemanGridOptions.data[i].ifReplace = 'N';
                                        $scope.insurancemanGridOptions.data[i].pay = 'N';
                                    }
                                    //页面应收解付保费期数不可编辑
                                    $scope.isReplace = true;
                                    //初始化0期
                                    $scope.VO.payperiod = 0;
                                    $scope.VO.receiveperiod = 0;
                                    //初始化金额
                                    $scope.VO.receivemount = 0;
                                    $scope.VO.paymount = 0;
                                    //初始化payment
                                    for (let i = 0; i < $scope.paymentGridOptions.data.length; i++) {
                                        if ($scope.paymentGridOptions.data[i].typeMoneyNo == 1 || $scope.paymentGridOptions.data[i].typeMoneyNo == 2) {
                                            $scope.paymentGridOptions.data.splice(i, 1);
                                        }
                                    }
                                }
                            }
                        }
                        $scope.$apply();
                    });
                }
            }
        };

        /**
         * 计算应收保费总额
         */
        $scope.calReceivemount = function (data) {
            let result = 0;
            for (let i = 0; i < data.length; i++) {
                if (data[i].replace == 'Y') {
                    if (!data[i].insurancemoney) {
                        data[i].insurancemoney = 0;
                    }
                    result = parseFloat(result) + parseFloat(data[i].insurancemoney);
                }
            }
            return result;
        }

        /**
         * 计算应解付总额
         * @param data
         */
        $scope.calPay = function (data) {
            let result = 0;
            let flag = false;
            for (let i = 0; i < data.length; i++) {
                let feemount = 0;
                let insurancemoney = 0;
                if (data[i].pay == 'Y') {
                    result = parseFloat(result) + parseFloat(data[i].insurancemoney);
                } else if (data[i].pay != 'Y' && data[i].replace == 'Y') {
                    if (data[i].feemount) {
                        feemount = parseFloat(feemount) + parseFloat(data[i].feemount);
                    }
                    if (data[i].insurancemoney) {
                        insurancemoney = parseFloat(insurancemoney) + parseFloat(data[i].insurancemoney);
                    }
                    flag = false;
                    result = result + (parseFloat(insurancemoney) - parseFloat(feemount));
                }
            }
            if (flag) {
                return 0;
            }
            return result;
        }

        //收付款信息
        $scope.paymentGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '互联网对账单收付款信息.csv',
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            columnDefs: [
                {
                    name: 'stages', displayName: '期数', width: 100, enableCellEdit: false
                },
                {
                    name: 'tradingChannel',
                    displayName: '渠道',
                    width: 100,
                    cellFilter: 'SELECT_PAYMODE',
                    enableCellEdit: false
                },
                {
                    name: 'rechargeType',
                    displayName: '交易方式',
                    width: 100,
                    cellFilter: 'SELECT_RECHARGETYPE',
                    enableCellEdit: false
                },
                {
                    name: 'typeMoneyNo', displayName: '收付款类型', width: 100, cellFilter: 'SELECT_MONEYTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.MONEYTYPE, enableCellEdit: false
                },
                {
                    name: 'pkCompany.name', displayName: '收付款对象名称', width: 100, enableCellEdit: false
                },
                {
                    name: 'scaleMoney', displayName: '收付款比例', width: 100, cellFilter: 'number:2', enableCellEdit: true
                },
                {
                    name: 'planDate',
                    displayName: '计划日期',
                    width: 100,
                    editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"',
                    enableCellEdit: true
                },
                {
                    name: 'planMoney',
                    displayName: '计划金额',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'factMoney',
                    displayName: '已结算金额',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'noPaymentMoney',
                    displayName: '未结算金额',
                    width: 100,
                    enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'factDate',
                    displayName: '结算日期',
                    width: 100,
                    enableCellEdit: false,
                    editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'vsettlebillno', displayName: '业务结算单号', width: 100, enableCellEdit: false
                },
            ],
            data: $scope.VO.webPaymentList,
            onRegisterApi: function (gridApi) {
                $scope.paymentGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if ('planDate' == colDef.name) {
                            if($scope.planDateSyn && rowEntity.planDate){
                                $scope.planDateValue = rowEntity.planDate;
                                layer.msg('是否同步所有收付款计划日期？', {
                                    time: 0 //不自动关闭
                                    , btn: ['是', '否']
                                    , yes: function (index) {
                                        $scope.planDateSyn = false;
                                        layer.close(index);
                                        for (let i = 0; i < $scope.paymentGridOptions.data.length; i++) {
                                            $scope.paymentGridOptions.data[i].planDate = $scope.planDateValue;
                                        }
                                    }
                                });
                            }
                        }
                        $scope.paymentGridOptions.gridApi.core.refresh();
                    });
                }

            }
        };
        //附件
        $scope.fileGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {name: 'file_name', displayName: '附件名称', width: 120, enableCellEdit: false},
                {
                    name: 'ts', displayName: '上载时间', width: 100, enableCellEdit: false, cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'pk_object_id',
                    displayName: ' ',
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ng-click="grid.appScope.onPreviewFile(row.entity.pk_project_id,row.entity.attachment_name)" class="btn btn-transparent btn-xs tooltips" tooltip-placement="top">在线预览&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i></a></div>'
                }
            ],
            data: $scope.VO.fileList,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.fileGridOptions = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.fileGridOptions.gridApi = gridApi;
                }
                $scope.fileGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };
        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();

        if ($scope.selectTabName == 'paymentGridOptions') {
            $scope.isShow = false;
        } else {
            $scope.isShow = true;
        }

        if ($scope.selectTabName == 'fileGridOptions') {

            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }

    };

    //实体类审批流配置
    $scope.ifEntity = "true";
    $scope.entityVO = "lr.insurance.entity.FictitiousInsuranceEntity";
    $scope.funCode = '91001';
    $scope.table_name = "t_fictitious_insurance";
    $scope.billdef = "FictitiousInsurance";
    $scope.beanName = "webInsuranceServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope, $rootScope);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);
});
app.controller('insuranceBillCtrl', ["$scope", "ngTableParams", "$rootScope", "$http", function ($scope, ngTableParams, $rootScope, $http) {

    $scope.goodDataParams = new ngTableParams({
        page: 1,
        count: 10,
    }, {
        counts: [],// 样式原因，去掉每页条数选择
        getData: function ($defer, params) {
            $scope.queryData(0, (params.page() - 1) * params.count(), params.count(), function (data, total) {
                params.total(total);
                $defer.resolve(data);
            });
        }
    });

    $scope.disDataParams = new ngTableParams({
        page: 1,
        count: 10,
    }, {
        counts: [],// 样式原因，去掉每页条数选择
        getData: function ($defer, params) {
            $scope.queryData(1, (params.page() - 1) * params.count(), params.count(), function (data, total) {
                params.total(total);
                $defer.resolve(data);
            });
        }
    });

    $scope.changeDataParams = new ngTableParams({
        page: 1,
        count: 10,
    }, {
        counts: [],// 样式原因，去掉每页条数选择
        getData: function ($defer, params) {
            $scope.queryData(2, (params.page() - 1) * params.count(), params.count(), function (data, total) {
                params.total(total);
                $defer.resolve(data);
            });
        }
    });

    $scope.badDataParams = new ngTableParams({
        page: 1,
        count: 10,
    }, {
        counts: [],// 样式原因，去掉每页条数选择
        getData: function ($defer, params) {
            $scope.queryData(3, (params.page() - 1) * params.count(), params.count(), function (data, total) {
                params.total(total);
                $defer.resolve(data);
            });
        }
    });

    $scope.queryData = function (type, page, pageSize, callback) {
        layer.load(2);
        $http.post($rootScope.basePath + "webInsurance/queryDetailTabs", {
            id: $scope.VO.id,
            type: type,
            page: page,
            pageSize: pageSize
        }).success(function (response) {
            if (response.code == 200) {
                callback(response.data, response.count);
            }
            layer.closeAll('loading');
        }).error(function () {
            layer.closeAll('loading');
        });
    }

    $scope.onCreateChange = function () {
        layer.load(2);
        $http.post($rootScope.basePath + "webInsurance/createChange", {
            id: $scope.VO.id
        }).success(function (response) {
            if (response.code == 200) {
                layer.msg("生成成功");
                $scope.changeDataParams.reload();
            }
            layer.closeAll('loading');
        }).error(function () {
            layer.closeAll('loading');
        });
    }
}]);
