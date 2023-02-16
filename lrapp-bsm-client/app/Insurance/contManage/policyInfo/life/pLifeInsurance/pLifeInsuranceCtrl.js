/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('pLifeInsuranceCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $filter, activitiModal, workFlowDialog, $location) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                insuranceinfo: [],
                insurancedman: [],
                insuranceman: [],
                partner: [],
                payment: [],
                beneficiary: [],
                isbudget: 'N',
                ifSubstitute: 'N',
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                dr: 0,
                billstatus: 31,
                costscale: [],
                coomedium: [],
                insurancetype: "personallife",
                proofType: null,
                proofText: null,
            };
        };
        $scope.entityVO = 'nc.vo.busi.InsurancebillVO';
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "operate_year": parseInt(new Date().format("yyyy")),
                "id": $stateParams.id
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode = '3020402';
        $scope.isProof = false;
        $scope.param = {person: 'yes', busi_type: 'notNull'};
        $scope.proofTypeBox = [1,2,3];
        $scope.agentParam = null;
    };

    $scope.reportRef =
        {
            id: $scope.$id,
            columnDefs: [
                {
                    field: 'approval_number',
                    displayName: '业务签报批复编号'
                },
                {
                    field: 'report_title',
                    displayName: '签报主题'
                },
                {
                    field: 'name',
                    displayName: '客户名称'
                }
            ],
            data: ""
        };

    $scope.initHttp = function () {

        $scope.projectEval = function (project){
            $scope.VO.pkC0Tradetype = project.pkC0Tradetype;
            $scope.VO.projectkind = project.pkC0Tradetype && project.pkC0Tradetype.name;
            $scope.VO.busi_type = project.busi_type;
            $scope.VO.temporaryPlan = project.temporaryPlan;
        }

        $scope.getEstimate = function (newVal, oldVal){
            $scope.VO.estimatepk = "";
            $scope.VO.estimateaddr = "";
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.pkProject.pk) {
                    $http.post($scope.basePath + "propertyProject/findOne", {pk: $scope.VO.pkProject.pk}).success(function (response) {
                        if (response && response.code == "200") {
                            if (response.result) {
                                let project = response.result;
                                //@zhangwj 市场业务校验保险方案
                                if(project.festimateincome > 100000 && project.isContinue == 0 && ((project.busi_type.code.indexOf("2-2") == 0 && project.busi_type.code!='2-2-4-1') || project.busi_type.code == '1-2-1-1')){
                                    $http.post($scope.basePath + "insuranceScheme/findByProject", {code: project.cprocode}).success(function (response) {
                                        if(response && response.code == 200){
                                            $scope.projectEval(project);
                                        }else{
                                            $scope.VO.pkProject = null;
                                            layer.alert("该立项还未录入保险方案，暂不可以录入保单！", {skin: 'layui-layer-lan', closeBtn: 1});
                                        }
                                    });
                                }else{
                                    $scope.projectEval(project);
                                }
                            }
                        }
                    });
                } else {
                    $scope.VO.estimatelinkman = "";
                }
            }
        }

        $scope.onImportUploads = function (type) {
            if (type) {
                $("#inputFile").click();
            } else {
                var file = document.getElementById("inputFile").files[0];
                if (file != null) {
                    layer.load(2);
                    var form = new FormData();
                    form.append('file', file);
                    form.append('table', 'gLife');
                    $http({
                        method: 'POST',
                        url: $scope.basePath + 'pLifeInsurance/importExcel',
                        data: form,
                        headers: {'Content-Type': undefined, 'x-auth-token': window.sessionStorage.getItem("token")},
                        transformRequest: angular.identity
                    }).success(function (data) {
                        console.log(data.code);
                        layer.alert(data.msg, {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                        if (data.code == 200) {
                            var obj = document.getElementById('inputFile');
                            obj.outerHTML = obj.outerHTML;
                        }
                    }).error(function (data) {
                        console.log(data.code);
                        layer.alert(data.msg, {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                    })
                }

            }
        };

        $scope.onCheckWithEIMS = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $scope.VO.payment = $scope.paymentGridOptions.data;
            $http.post($rootScope.basePath + "pLifeInsurance/checkWithEIMS", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    if (response && response.code == "200") {
                        layer.alert(response.msg, {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                    }

                    // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                });
        };
        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data) {
            layer.load(2);
            return $http.post($rootScope.basePath + "pLifeInsurance/queryAllForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            })
                .success(function (response) {
                    if (response && response.code == 200) {
                        $scope.gridOptions.data = response.result.Rows;
                        $scope.gridOptions.totalItems = response.result.Total;
                    }
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
            $http.post($scope.basePath + "pLifeInsurance/queryForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response.code == 200) {
                    if (!$scope.query) {
                        $scope.query = $scope.gridOptions.columnDefs;
                    }
                    if ($scope.QUERY.id) {
                        $scope.QUERY.id = null;
                    }
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            });
        };
        $scope.onCheckInsuranceno = function (insur) {
            $http.post($scope.basePath + "propertyInsurance/checkInsuranceno", {
                param: angular.toJson($scope.VO),
                "insureType": "personallife"
            }).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200" && "" != response.msg) {
                    // angular.assignData($scope.VO, response.result);
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    return false;
                }
                if(insur && insur=="Submit"){
                    $scope.onSubmit();
                }
                return true;
            });
        };
        //作废
        $scope.onDiscard = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert("请选择一条数据!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.confirm('是否作废选中数据？', {
                    btn: ['作废', '返回'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消作废!', {
                            shift: 6,
                            icon: 11
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    layer.load(2);
                    $http.post($scope.basePath + "pLifeInsurance/discard", {
                        pk: $scope.pk,
                        billdef: $scope.billdef
                    }).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            if (response.code == 200) {
                                //调用查询方法刷新页面
                                $scope.queryForGrid($scope.QUERY);
                                return layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                                // layer.msg(response.msg, {
                                //     shift: 6,
                                //     icon: 1
                                // });
                            } else {
                                layer.msg('操作失败!', {
                                    shift: 6,
                                    icon: 11
                                });
                            }
                        }
                    });
                }
            );
        };
        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "pLifeInsurance/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    if (!$scope.VO.dealAttachmentB) {
                        $scope.VO.dealAttachmentB = [];
                    }
                    $scope.insuranceinfoGridOptions.data = $scope.VO.insuranceinfo;
                    $scope.insurancedmanGridOptions.data = $scope.VO.insurancedman;
                    $scope.insurancemanGridOptions.data = $scope.VO.insuranceman;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    $scope.partnerGridOptions.data = $scope.VO.partner;
                    $scope.paymentGridOptions.data = $scope.VO.payment;
                    $scope.beneficiaryGridOptions.data = $scope.VO.beneficiary;
                    if($scope.VO.proofType!=null && $scope.VO.proofType!=""){
                        $scope.proofTypeBox[parseInt($scope.VO.proofType)-1] = true;
                    }
                    $scope.changeAgentParamType();
                    if (callback) callback();
                } else {
                    if (response) {
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO.payment = $scope.paymentGridOptions.data;
            $scope.VO.insuranceinfo = $scope.insuranceinfoGridOptions.data;
            $http.post($rootScope.basePath + "pLifeInsurance/save", {
                data: angular.toJson($scope.VO),
                funCode: $scope.funCode
            })
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        $scope.isreplace = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                    }
                    if (response) {
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                            let flag = response.flag;
                            if(flag == 1){
                                $scope.isProof =true;
                            }
                        }
                    }
                    // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                });
        };

        /**
         * 查询审批流信息
         */
        $scope.queryWorkFlow = function (pkProject, fun) {
        };
        /**
         * 查询审批流信息
         */
        $scope.queryFlowInfo = function (pkProject, fun) {

        };
        /**
         * 查询审批流信息
         */
        $scope.queryAuditFlowInfo = function (pkProject, fun) {
        };
        /*
         * 提交
         * */
        $scope.submit = function (pkProject, msg, selects, _pass) {
        };
        /*
         * 提交
         * */
        $scope.audit = function (pkProject, msg, selects, _pass, type) {
        };
    };

    $scope.initFunction = function () {

        $scope.changeAgentParamType = function () {
            if ($scope.VO.busi_type != null && $scope.VO.busi_type.name == '个人代理业务') {
                $scope.agentParam = {agentType: 2};
            } else {
                $scope.agentParam = null;
            }
        }

        $scope.checkboxChoosed = function (value) {
            $scope.VO.proofType = null;
            $scope.VO.proofText = null;
            for (let i = 0; i < 3; i++) {
                if($scope.proofTypeBox[i] && value == i){
                    $scope.VO.proofType = value + 1;
                }else{
                    $scope.proofTypeBox[i] = false;
                }
            }
        }

        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function (item) {
            if (item && item.id) {
                $scope.onCard(item.id);
            }

        };
        $scope.onSubmitSelf = function (){
            if(!$scope.VO.insuranceno){
                return  layer.alert("提交之前必须补充保单号", {skin: 'layui-layer-lan', closeBtn: 1});
            }
            if ($scope.dealAttachmentBGridOptions.data.length == 0) {
                return layer.alert( "请上传附件！",
                    {skin: 'layui-layer-lan', closeBtn: 1});
            }
            $scope.onCheckInsuranceno('Submit');
        }
        $scope.findOneData = function (pk) {
            $scope.isDw = false;
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
            layer.load(2);
            $scope.pk = pk;
            $rootScope.dataById = null;
            $scope.funCode ='3020402';
            $http.post($scope.basePath + "insuranceData/changeInsurance", {pk: pk}).success(function (response) {
                if (response && response.code == "200") {
                    $scope.VO = response.data;
                    $scope.insuranceinfoGridOptions.data = $scope.VO.insuranceinfo;
                    $scope.insurancedmanGridOptions.data = $scope.VO.insurancedman;
                    //保险公司
                    $scope.insurancemanGridOptions.data = $scope.VO.insuranceman;
                    //受益人
                    $scope.beneficiaryGridOptions.data = $scope.VO.beneficiary;
                    if($scope.VO.msg){
                        layer.alert($scope.VO.msg, {skin: 'layui-layer-lan', closeBtn: 1});
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
                    //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
                layer.closeAll('loading');
            });
        };
    };

    $scope.initWatch = function () {

        $scope.$watch('VO.busi_type', function (newVal, oldVal) {
            if (!$scope.isEdit && !$scope.isUpdate) {
                return;
            }
            $scope.changeAgentParamType();
        }, true);

        $scope.$watch('VO.beneficiary', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                var data = $rootScope.diffarray(newVal, oldVal);
                if (data && data.col == 'beneficiarypk') {
                    if (data.row.beneficiarypk) {
                        if (data.row.beneficiarypk.pk) {
                            if (data.row.beneficiarypk.c_0_address) {
                                data.row.beneficiaryaddr = data.row.beneficiarypk.c_0_address;
                            } else {
                                data.row.beneficiaryaddr = '';
                            }
                            $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: data.row.beneficiarypk.pk}).success(function (response) {
                                if (response && response.code == "200") {
                                    data.row.beneficiaryaddr = response.result.c0Address;
                                    if (response.result.linkman != null && response.result.linkman.length > 0) {
                                        data.row.beneficiarylinkman = response.result.linkman[0].name;
                                        data.row.beneficiarylinktel = response.result.linkman[0].tele;
                                        if(data.row.beneficiaryaddr == null || data.row.beneficiaryaddr == ''){
                                            data.row.beneficiaryaddr = response.result.linkman[0].address;
                                        }
                                    } else {
                                        data.row.beneficiarylinkman = '';
                                        data.row.beneficiarylinktel = '';
                                    }
                                }
                            });
                        }
                    } else {
                        data.row.beneficiarylinkman = '';
                        data.row.beneficiarylinktel = '';
                    }
                }
            }
        }, true);

        $scope.$watch('VO.isDianShang', function (newVal, oldVal) {
            if ("Y" == $scope.VO.isDianShang) {
                $scope.QUERY["DATA ->> '$.isDianShang'"] = "Y";
                $scope.QUERY["DATA ->> '$.isDianShang'^is"] = null;
            } else {
                $scope.QUERY["DATA ->> '$.isDianShang'^is"] = "is null";
                $scope.QUERY["DATA ->> '$.isDianShang'"] = null;
            }
        }, true);
        $scope.$watch('insurancedmanGridOptions.data', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.SuperForm) {
                return;
            }
            if ($scope.isEdit) {
                let data = $rootScope.diffarray(newVal, oldVal);
                if (data && data.col == 'insurancedmanpk') {
                    if (data.row.insurancedmanpk) {
                        if (data.row.insurancedmanpk.pk) {
                            if (data.row.insurancedmanpk.c_0_address) {
                                data.row.insurancedmanaddr = data.row.insurancedmanpk.c_0_address;
                            } else {
                                // data.row.insurancedmanaddr = '不详';
                            }
                            $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: data.row.insurancedmanpk.pk}).success(function (response) {
                                if (response && response.code == "200") {
                                    data.row.insurancedmanaddr = response.result.c0Address;
                                    if (response.result.linkman != null && response.result.linkman.length > 0) {
                                        data.row.insurancedmanlinkman = response.result.linkman[0].name;
                                        data.row.insurancedmanlinktel = response.result.linkman[0].tele;
                                        if(data.row.insurancedmanaddr == null || data.row.insurancedmanaddr == ''){
                                            data.row.insurancedmanaddr = response.result.linkman[0].address;
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            }
        }, true);
        $scope.$watch('insurancemanGridOptions.data', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                var data = $rootScope.diffarray(newVal, oldVal);
                if (data && data.col == 'insurancemanpk') {
                    if (data.row.insurancemanpk) {
                        if ((data.row.insurancemanpk.pk&&!data.oldValue) || data.row.insurancemanpk.pk != data.oldValue.pk ) {
                            if($scope.VO.startdate){
                                if($scope.VO.startdate > data.row.insurancemanpk.agreement_end){
                                    $scope.childFlag = false;
                                    layer.alert(data.row.insurancemanpk.name + " 保险公司协议信息已经过期，请录入新的协议信息!", {skin: 'layui-layer-lan', closeBtn: 1});
                                    data.row.insurancemanpk = null;
                                    return;
                                }else{
                                    $scope.childFlag = true;
                                }
                            }
                            if (data.row.insurancemanpk.c_0_address) {
                                data.row.insuranceaddr = data.row.insurancemanpk.c_0_address;
                            } else {
                                data.row.insuranceaddr = '不详';
                            }
                            $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: data.row.insurancemanpk.pk}).success(function (response) {
                                if (response && response.code == "200") {
                                    data.row.insuranceaddr = response.result.c0Address;
                                    if (response.result.linkman != null && response.result.linkman.length > 0) {
                                        if (response.result.linkman.length == 1){
                                            data.row.insurancelinkman = response.result.linkman[0].name;
                                            data.row.insurancelinktel = response.result.linkman[0].tele;
                                            if(data.row.insuranceaddr == null || data.row.insuranceaddr == ''){
                                                data.row.insuranceaddr = response.result.linkman[0].address;
                                            }
                                        }else{
                                            $scope.linkManOptions.data = response.result.linkman;
                                            $scope.insurancemanhashKey = data.row.$$hashKey;
                                            $scope.linkmanType = 'insurancemanOne';
                                            ngDialog.openConfirm({
                                                showClose: true,
                                                closeByDocument: false,
                                                template: 'view/pCarInsurance/choseLinkMan.html',
                                                className: 'ngdialog-theme-formInfo',
                                                scope: $scope,
                                                preCloseCallback: function (value) {

                                                    return true;
                                                }
                                            }).then(function (value) {

                                            }, function (reason) {

                                            });
                                        }

                                    } else {
                                        data.row.insurancelinkman = '不详';
                                        data.row.insurancelinktel = '不详';
                                    }
                                }
                            });
                        } else {
                            data.row.insurancemanpk = '';
                        }
                    } else {
                        data.row.insurancelinkman = '';
                        data.row.insurancelinktel = '';
                    }
                    //收付款对象随保险人更改要求更新 2019年5月21日 苏长友
                    var length = $scope.paymentGridOptions.data.length;
                    if (length > 0 && $scope.VO.receivefeeperiod > 0) {

                        //删除本类型子表信息
                        for (var i = 0; i < length; i++) {
                            for (var j = 0; j < oldVal.length; j++) {

                                if ($scope.paymentGridOptions.data[i].company.pk == oldVal[j].insurancemanpk.pk) {
                                    $scope.paymentGridOptions.data[i].company = newVal[j].insurancemanpk;
                                }

                            }
                        }

                    }
                }
            }
        }, true);

        $scope.$watch('VO.insurancebillkindNO', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['insurancebillkindNOName'] = $rootScope.SELECT.INSURANCEBILLKIND[newVal].name;
            }
        }, true);

        $scope.$watch('VO.pkProject', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.isEdit && $scope.VO.billstatus == 37) {
                    $scope.msgFlag = false;
                }
                //保单库跳转时没有带过来投保人的话，才带入立项的投保人
                if($scope.VO.insuranceData && $scope.VO.insuranceData.UUID && $scope.VO.insuranceData.UUID != ""){
                    if(!$scope.VO.estimatepk || ($scope.VO.estimatepk && (!$scope.VO.estimatepk.pk || $scope.VO.estimatepk.pk ==""))){
                        $scope.getEstimate(newVal, oldVal);
                    }else{
                        if ($scope.VO.pkProject.pk) {
                            $http.post($scope.basePath + "propertyProject/findOne", {pk: $scope.VO.pkProject.pk}).success(function (response) {
                                if (response && response.code == "200") {
                                    if (response.result) {
                                        let project = response.result;
                                        //立项信息带出
                                        $scope.projectEval(project);
                                    }
                                }
                            });
                        }
                    }
                }else{
                    $scope.getEstimate(newVal, oldVal);
                }
            }
        }, true);

        $scope.$watch('VO.c2PaymethodNO', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['c2PaymethodNOName'] = $rootScope.SELECT.PAYMETHODTYPE[newVal].name;
            }
        }, true);


        //90的校验
        $scope.$watch('VO.startdate', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            // || (!angular.isUndefined($scope.VO.pkReport))
            if (newVal === oldVal || newVal == undefined || newVal == null) return;

            if ($scope.isEdit) {
                if ($scope.VO.pkReport) {
                    return;
                }
                var olddatval = "";
                if (oldVal != null) {
                    olddatval = new Date(oldVal).format("yyyy-MM-dd");
                }
                var newdatval = "";
                if (newVal != null) {
                    newdatval = new Date(newVal).format("yyyy-MM-dd");
                }
                if (newdatval == olddatval) {
                    return;
                }
                var now = new Date().getTime();
                var selected = new Date(newVal).getTime();
                var dates = (new Date(newVal).setFullYear(new Date(newVal).getFullYear() + 1));
                //如果结束日期已经有值了，那就不改变结束日期的值
                $scope.VO.enddate = $scope.VO.enddate!=null ? $scope.VO.enddate : new Date(dates).setDate(new Date(dates).getDate() - 1);
                $scope.msgFlag = false;
                var startDate = new Date($scope.VO.startdate).getTime();
                var endDate = new Date($scope.VO.enddate).getTime();
                var yearStart = new Date($scope.VO.startdate);
                var yearStart1 = new Date($scope.VO.startdate);
                var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                var time = yearEnd - yearStart.getTime();
                let insurancemanData = $scope.insurancemanGridOptions.data
                if(insurancemanData!=null){
                    for(let i =0 ; i <insurancemanData.length;i++){
                        let insurancemanDatas  = insurancemanData[i];
                        if(insurancemanDatas.insurancemanpk) {
                            let agreementEnd = insurancemanDatas.insurancemanpk.agreement_end;
                            let agreementEndTime = new Date(agreementEnd).getTime();
                            if (( startDate - agreementEndTime) > 0) {
                                $scope.childFlag = false;
                                layer.alert(data.row.insurancemanpk.name + " 保险公司协议信息已经过期，请录入新的协议信息!", {skin: 'layui-layer-lan', closeBtn: 1});
                                data.row.insurancemanpk = null;
                                return;
                            }else{
                                $scope.childFlag = true;
                            }
                        }
                    }
                }
                if ($scope.insuranceinfoGridOptions.data) {
                    for (var i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                        $scope.insuranceinfoGridOptions.data[i].insurancecharge = (parseFloat($scope.insuranceinfoGridOptions.data[i].insurancemoney) * parseFloat($scope.insuranceinfoGridOptions.data[i].chargerate) * parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000)).toFixed(2);
                    }
                }
            }
        }, true);

        $scope.$watch('VO.enddate', function (newVal, oldVal) {
            // || (!angular.isUndefined($scope.VO.pkReport))
            var oldDate = $filter('date')(oldVal, 'yyyy-MM-dd');
            var newDate = $filter('date')(newVal, 'yyyy-MM-dd');
            if (newVal === oldVal || newVal == undefined || newVal == null || newDate == oldDate) return;
            if ($scope.isEdit) {
                var startDate = new Date($scope.VO.startdate).getTime();
                var endDate = new Date($scope.VO.enddate).getTime();
                var yearStart = new Date($scope.VO.startdate);
                var yearStart1 = new Date($scope.VO.startdate);
                var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                var time = yearEnd - yearStart.getTime();
                if ($scope.insuranceinfoGridOptions.data) {
                    for (var i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                        $scope.insuranceinfoGridOptions.data[i].insurancecharge = $scope.insuranceinfoGridOptions.data[i].insurancemoney * $scope.insuranceinfoGridOptions.data[i].chargerate * (((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / (time / 24 / 3600 / 1000);
                    }
                }
            }
        }, true);
        $scope.$watch('VO.estimatepk.name', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.estimatepk.pk) {
                    $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: $scope.VO.estimatepk.pk}).success(function (response) {
                        if (response && response.code == "200") {
                            if (response.result != null) {
                                $scope.VO.certType = response.result.enumCerttype;
                                $scope.VO.documentCode = response.result.c1Certcode;
                                $scope.VO.vdef11 = response.result.c1Phone;
                                $scope.VO.estimateMail = response.result.c1Mail;
                                $scope.VO.estimateaddr = response.result.c0Address;
                                if (response.result.linkman != null && response.result.linkman.length > 0) {
                                    if ($scope.VO.estimateaddr == null || $scope.VO.estimateaddr == '') {
                                        $scope.VO.estimateaddr = response.result.linkman[0].address;
                                    }
                                }
                            }
                        }
                        //重置投保人地址为保单库地址
                        if($scope.VO.insuranceData && $scope.VO.insuranceData.POSTAL_ADDRESS && $scope.VO.insuranceData.POSTAL_ADDRESS!=''){
                            $scope.VO.estimateaddr = $scope.VO.insuranceData.POSTAL_ADDRESS;
                        }
                    });

                } else {
                    $scope.VO.certType = "";
                    $scope.VO.documentCode = "";
                    $scope.VO.vdef11 = "";
                    $scope.VO.estimateMail = "";
                    $scope.VO.estimateaddr = "";
                }
            }
        }, true);

        //应收佣金
        $scope.$watch('VO.receivefeeperiod', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            var reData = new Array();
            if ($scope.isEdit) {
                //删除本类型子表信息
                var length = $scope.paymentGridOptions.data.length;
                for (var i = 0; i < length; i++) {
                    if ($scope.paymentGridOptions.data[i].typeMoneyNO != 3) {
                        reData.push($scope.paymentGridOptions.data[i]);
                    }
                }
                if (!isNaN(newVal)) {
                    var array = $scope.insurancemanGridOptions.data;
                    for (var k = 0; k < array.length; k++) {
                        for (var i = 1; i <= newVal; i++) {
                            var data = {
                                stages: i,
                                typeMoneyNO: 3,
                                typeMoney: '应收佣金',
                                company: array[k].insurancemanpk,
                                typeCompany: '保险公司',
                                typeCompanyNO: 3
                            };
                            reData.push(data);
                        }
                    }
                }
                $scope.paymentGridOptions.data = reData;
            }
        }, true);
        //应收保费
        $scope.$watch('VO.receiveperiod', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            var reData = new Array();
            if ($scope.isEdit) {
                //删除本类型子表信息
                var length = $scope.paymentGridOptions.data.length;
                for (var i = 0; i < length; i++) {
                    if ($scope.paymentGridOptions.data[i].typeMoneyNO != 1) {
                        reData.push($scope.paymentGridOptions.data[i]);
                    }
                }
                if (!isNaN(newVal)) {
                    for (var i = 1; i <= newVal; i++) {
                        var data = {
                            stages: i,
                            typeMoneyNO: 1,
                            typeMoney: '应收保费',
                            company: $scope.VO.estimatepk,
                            typeCompanyNO: 3,
                            typeCompany: '保险公司'
                        };
                        reData.push(data);
                    }
                }
                $scope.paymentGridOptions.data = reData;
            }
        }, true);
        //应解付保费总期数
        $scope.$watch('VO.payperiod', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            var reData = new Array();
            if ($scope.isEdit) {
                //删除本类型子表信息
                var length = $scope.paymentGridOptions.data.length;
                for (var i = 0; i < length; i++) {
                    if ($scope.paymentGridOptions.data[i].typeMoneyNO != 2) {
                        reData.push($scope.paymentGridOptions.data[i]);
                    }
                }
                if (!isNaN(newVal)) {
                    var array = $scope.insurancemanGridOptions.data;
                    for (var k = 0; k < array.length; k++) {
                        for (var i = 1; i <= newVal; i++) {
                            var data = {
                                stages: i,
                                typeMoneyNO: 2,
                                typeMoney: '解付保费',
                                company: array[k].insurancemanpk,
                                typeCompanyNO: 3,
                                typeCompany: '保险公司',
                                type_business: 1
                            };
                            reData.push(data);
                        }
                    }
                }
                $scope.paymentGridOptions.data = reData;
            }
        }, true);
    };

    $scope.initButton = function () {

        //数据自核功能（数据修改节点）
        $scope.onBillCheckBySelf = function () {

            if($scope.VO.id==null || $scope.VO.id==''){
                layer.msg("数据无效，请刷新页面再试！", {shift: 6,icon: 11});
            }

            layer.confirm('请确认自核是否通过！', {
                    btn: ['失败', '通过'], //按钮
                    btn2: function (index, layero) {
                        layer.load(2);
                        $http.post($scope.basePath + "dataModification/billCheckBySelf",
                            {
                                tableName: $scope.table_name,
                                id: $scope.VO.id,
                                state: 0,
                            }).success(function (response) {
                            layer.closeAll('loading');
                            if (response && response.code == 200) {

                                if(response.data.writeBack){
                                    $scope.VO.billCheckBySelfState = response.data.writeBack;
                                }

                                if(response.data.msg){
                                    layer.msg(response.data.msg, {shift: 6,icon: 11});
                                }
                            }
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    layer.load(2);
                    $http.post($scope.basePath + "dataModification/billCheckBySelf",
                        {
                            tableName: $scope.table_name,
                            id: $scope.VO.id,
                            state: 1,
                        }).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == 200) {

                            if(response.data.writeBack){
                                $scope.VO.billCheckBySelfState = response.data.writeBack;
                            }

                            if(response.data.msg){
                                layer.msg(response.data.msg, {shift: 6,icon: 11});
                            }
                        }
                    });
                }
            );
        }

        //联系人弹框确定按钮
        $scope.onChonseBusiType = function (){
            var rows = $scope.linkManOptions.gridApi.selection.getSelectedRows();
            if("insurancemanOne" == $scope.linkmanType){
                if (rows && rows.length == 1) {
                    for (let i = 0; i < $scope.insurancemanGridOptions.data.length; i++) {
                        if ($scope.insurancemanGridOptions.data[i].$$hashKey == $scope.insurancemanhashKey){
                            $scope.insurancemanGridOptions.data[i].insurancelinkman = rows[0].name;
                            $scope.insurancemanGridOptions.data[i].insurancelinktel = rows[0].tele;
                        }
                    }
                    ngDialog.close();
                } else {
                    layer.alert("只能选择一条保险人联系人信息!", {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }

        }

        $scope.onCancelBusiType = function (){
            ngDialog.close();
        }

        $scope.onImport = function () {
            var inputFile = $('#inputFile');
            inputFile.click();
        };

        $scope.onRenewal = function () {
            //  控制字表按钮的显示
            $scope.isClear = false;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.isGrid = false;
                $scope.form = true;
                $scope.findOne(rows[0].id, function () {
                    $scope.form = true;
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.VO.payment = [];

                    $scope.VO.billstatus = 31;
                    $scope.VO.pkOperator = $rootScope.userVO;
                    $scope.VO.operateDate = new Date().format("yyyy-MM-dd");
                    $scope.VO.operateTime = new Date().format("yyyy-MM-dd HH:mm:ss");
                    $scope.VO.receivefeeperiod = null;
                    $scope.VO.payperiod = null;
                    $scope.VO.receiveperiod = null;
                    $scope.VO.insuranceinfono = null;
                    $scope.VO.insuranceno = null;
                    $scope.VO.id = null;
                    $scope.paymentGridOptions.data = [];
                    $scope.dealAttachmentBGridOptions.data = [];
                    $scope.gridApi.selection.getSelectedRows()[0] = $scope.VO;
                });


            } else {

                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            }

        };

        $scope.onUploads = function (selectTabName) {
            $scope.isSubDisabled = false;
            $scope.aVO = {};
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/common/attachments.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                preCloseCallback: function (value) {
                    if (value && value == "clear") {
                        //重置
                        return false;
                    }
                    //取消
                    return true;
                }
            }).then(function (value) {
                if (value != null) {
                    angular.forEach(value, function (item) {
                        $scope.dealAttachmentBGridOptions.data.push(item);
                    });
                }
            }, function (reason) {

            });
        };

        $scope.onDownLoad = function () {
            var selectTabName = $scope.selectTabName;
            var rows = $scope[selectTabName].gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return angular.alert("请选择一条单据进行操作！");
            var ids = [];
            if (selectTabName == 'dealAttachmentBGridOptions') {
                for (var i = 0; i < rows.length; i++) {
                    ids.push(rows[i].pk_project_id);
                }
            }
            var exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };

        $scope.onDownLoads = function () {
            let rows = null;
            rows = $scope.VO.dealAttachmentB;
            if (!rows || rows.length <= 0) return angular.alert("没有附件信息！");
            let ids = [];
            for (let i = 0; i < rows.length; i++) {
                ids.push(rows[i].pk_project_id);
            }
            let exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };
        /**
         * 过滤查询功能
         */
        /* $scope.onQuery = function () {
             $scope.queryForGrid($scope.QUERY);
         };*/


        /***
         * 查看
         */
        $scope.onView = function () {

            //  控制字表按钮的显示
            $scope.isEdit = false;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                // layer.load(2);
                $scope.findOne(rows[0].id, function (response) {
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isEdit = false;
                    $scope.isDisabled = true;
                });
            }
        };

        $scope.onSubmit = function () {
            var pkProject;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                if (rows[0].billstatus != 31) return layer.alert("只有未上报状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 31) return layer.alert("只有未上报状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            $scope.queryFlowInfo(pkProject, function (response) {
            });
            // // alert(msg)
            // ngDialog.open({
            //     template: '../app/activiti-modal/tpl/approval.html',
            //     className: 'ngdialog-theme-formInfo',
            //     controller: 'approvalController',
            //     data: {
            //         config: _config
            //     },
            //     closeByDocument: true,
            //     closeByEscape: true,
            //     cache:false
            // });
        };


        /* $scope.onLinkAuditFlow = function () {
             var pkProject;
             if ($scope.isGrid) {
                 var rows = $scope.gridApi.selection.getSelectedRows();
                 if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行查看!", {
                     skin: 'layui-layer-lan',
                     closeBtn: 1
                 });
                 pkProject = rows[0].pkProject;
             } else {
                 pkProject = $scope.VO.pkProject;
             }
             ;
         };*/

        $scope.onAudit = function () {
            var pkProject;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                if (rows[0].billstatus != 33 && rows[0].billstatus != 36) return layer.alert("只有审批中或驳回状态可以审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 33 && rows[0].billstatus != 36) return layer.alert("只有审批中或驳回状态可以审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            ;


        };

        $scope.onAdd = function () {
            $scope.isClear = true;
            $scope.form = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.isUploadAnytime = false;
            $scope.agentParam = null;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            $scope.childFlag = true;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form = true;
                var rows = $scope.gridApi.selection.getSelectedRows();
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
         * 暂存
         */
        $scope.onTemporary = function (data) {
            $scope.VO.payment = $scope.paymentGridOptions.data;
            $scope.VO.insuranceinfo = $scope.insuranceinfoGridOptions.data;
            if (data) {
                var tablename = $scope.table_name;
                $http.post($rootScope.basePath + "temporary/insert", {
                    data: angular.toJson(data),
                    tablename: tablename
                }).success(function (response) {
                    if (response.code == 200) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                        return layer.alert('暂存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                });
            }
        }
        /**
         * 卡片
         */
        $scope.onCard = function (id) {
            if (!id) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1)
                    return layer.alert("请选择一条数据进行查看!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                id = rows[0].id;
            }
            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {
                pk: id,
                tableName: $scope.table_name,
                billdef: $scope.billdef
            }).success(function (response) {
                if (response && response.code == "200") {
                    $scope.card = true;
                    angular.assignData($scope.VO, response.result);
                    if (!response.result.taskHis)
                        $scope.mess = false;
                    else
                        $scope.mess = true;
                    $scope.isBack = true;
                    $scope.isGrid = false;
                    $scope.isCard = true;

                } else {
                    if (response) {
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };

        /*$scope.onCard = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1)
                return layer.alert("请选择一条数据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            $scope.findOne(rows[0].id);
            $scope.isBack = true;
            $scope.isGrid = false;
            $scope.isCard = true;
        };*/
        $scope.onDelete = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert("请选择数据进行删除!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.alert('是否删除选中数据？', {
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
                    var ids = [];
                    for (var i = 0; i < rows.length; i++) {
                        ids.push(rows[i].id);
                    }
                    layer.load(2);
                    $http.post($scope.basePath + "pLifeInsurance/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
         * 返回业务签报批复编号查询URL
         */
        $scope.reportUrl = function (param) {
            return "reportRef/queryForGrid?pk_project=" + param;
        }
        /*
         * 关联
         * */
        $scope.onLink = function () {

        };
        /*
        * 随时上传附件功能
        * */
        $scope.onUploadAnyTime = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $scope.isSubDisabled = false;
            $scope.isUploadAnytime = true;
            $scope.aVO = {};
            $http.post($scope.basePath + "common/getFileType", {
                id: rows[0].id,
                tableName: $scope.table_name
            }).success(function (response) {
                $scope.VO = response.data;
                $scope.filetype = response.filetype;
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: false,
                    template: 'view/uploadAnyTime.html',
                    className: 'ngdialog-theme-formInfo',
                    scope: $scope,
                    rootScope: $rootScope,
                    preCloseCallback: function (value) {
                        layer.load(2);
                        if ($rootScope.submitAnyTime) {
                            $http.post($scope.basePath + "common/uploadAnyTime", {
                                data: angular.toJson($scope.VO),
                                tableName: $scope.table_name
                            }).success(function (response) {
                                layer.closeAll('loading');
                                if (response && response.code == 200) {
                                    layer.alert("附件上传成功！")
                                }
                                if (response && response.code == 500) {
                                    layer.alert("系统异常！")
                                }
                            });
                            rows[0] = $scope.VO;
                            $rootScope.submitAnyTime = false;
                        }
                        $scope.VO = $scope.initVO();
                        layer.closeAll('loading');
                        return true;
                    }
                }).then(function (value) {
                }, function (reason) {
                });
            });
        }

        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            if ($scope.isClear) {
                $scope.VO = $scope.initVO();
                $scope.insuranceinfoGridOptions.data = [];
                $scope.insurancedmanGridOptions.data = [];
                $scope.beneficiaryGridOptions.data = [];
                $scope.insurancemanGridOptions.data = [];
                $scope.partnerGridOptions.data = [];
                $scope.paymentGridOptions.data = [];
                $scope.dealAttachmentBGridOptions.data = [];
            }
            $scope.isDisabled = true;
            $scope.isEdit = false;
            $scope.isBack = false;
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
            $scope.isDisabled = true;
            //阻止页面渲染
            $scope.form = false;
            $scope.card = false;
            $scope.queryForGrid($scope.QUERY);
        };
        /**
         * 保存判断必输项
         */
        $scope.onSave = function () {
            if ($scope.isUploadAnytime) {
                $scope.onSaveVO();
                return;
            }
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    $scope.VO.insurancebillkindNOName = $rootScope.returnSelectName($scope.VO.insurancebillkindNO, "INSURANCEBILLKIND");
                    $scope.VO.c2PaymethodNOName = $rootScope.returnSelectName($scope.VO.c2PaymethodNO, "PAYMETHODTYPE");
                    $scope.VO.insurancebillkindNOName = $rootScope.returnSelectName($scope.VO.insurancebillkindNO, "INSURANCEBILLKIND");
                    // $scope.VO.vdef12Name = $rootScope.returnSelectName($scope.VO.vdef12,"BUSINESSTYPE");
                    // $scope.VO.c2PaymethodNOName = $rootScope.returnSelectName($scope.VO.c2PaymethodNO,"PAYMETHODTYPE");
                    $scope.childFlag = true;

                    //对当前日期与保单起始日期进行校验
                    var startdate = new Date($scope.VO.startdate).getTime();
                    var enddate = new Date($scope.VO.enddate).getTime();
                    if (startdate > enddate) {
                        return layer.alert("开始日期不能大于结束日期!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.VO.pkReport) {
                        $scope.msgFlag = false;
                    }
                    if ($scope.insuranceinfoGridOptions.data.length > 0) {
                        let insuranceinfoData = $scope.insuranceinfoGridOptions.data;
                        for(let i =0 ;i<insuranceinfoData.length ; i++){
                            let item = insuranceinfoData[i];
                            if (!item.insurancepk) {
                                $scope.childFlag = false;
                                return layer.alert("险种子表中名称不可为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (!item.vdef6) {
                                $scope.childFlag = false;
                                return layer.alert("险种子表中具体险种不可为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});

                            }
                            if (!item.commisionrate) {
                                $scope.childFlag = false;
                                return layer.alert("险种子表中佣金比例不可为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (!item.commisionnum) {
                                $scope.childFlag = false;
                                return layer.alert("险种子表中佣金不可为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }

                        }
                    } else {
                        $scope.childFlag = false;
                        return layer.alert("保险险种不可为空!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.childFlag) {
                        if ($scope.insurancedmanGridOptions.data.length == 0) {
                            return layer.alert("被保险人信息子表不能为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if ($scope.childFlag) {
                        if ($scope.beneficiaryGridOptions.data.length == 0) {
                            return layer.alert("受益人信息子表不能为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if ($scope.childFlag) {
                        if ($scope.VO.insurancedman.length > 0) {
                            angular.forEach($scope.VO.insurancedman, function (item) {
                                if (!item.insurancedman) {
                                    $scope.childFlag = false;
                                    return layer.alert("子表属性被保人名称不可为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            })
                        } else {
                            $scope.childFlag = false;
                            return layer.alert("请录入被保人信息!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }

                    if ($scope.childFlag) {
                        if ($scope.VO.beneficiary.length > 0) {
                            //计算受益人比率
                            let arry = $scope.beneficiaryGridOptions.data;
                            let totalBeneficiaryRatio = 0;
                            let beneficiarytypeSet = new Set();
                            for (let i = 0; i < arry.length; i++) {
                                if (arry[i].beneficiaryRatio && arry[i].beneficiaryRatio != '' && arry[i].beneficiarytype == 2) {
                                    totalBeneficiaryRatio += parseFloat(arry[i].beneficiaryRatio);
                                }
                                beneficiarytypeSet.add(arry[i].beneficiarytype);
                            }
                            if (beneficiarytypeSet.size != 1) {
                                return layer.alert("受益人信息子表中的受益人类型只能有一种！",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            } else {
                                if (beneficiarytypeSet[0] == 2) {

                                    angular.forEach($scope.VO.beneficiary, function (item) {
                                        if (!item.beneficiary || item.beneficiary == '') {
                                            $scope.childFlag = false;
                                            return layer.alert("受益人名称不可为空!",
                                                {skin: 'layui-layer-lan', closeBtn: 1});
                                        }
                                    });

                                    if (totalBeneficiaryRatio > 100 || totalBeneficiaryRatio < 100) {
                                        return layer.alert("受益人信息子表中的受益比例加和应等于100!",
                                            {skin: 'layui-layer-lan', closeBtn: 1});
                                    }
                                }
                            }
                        } else {
                            $scope.childFlag = false;
                            return layer.alert("请录入受益人信息!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }

                    }

                    if ($scope.childFlag) {
                        if ($scope.VO.insuranceman.length > 0) {
                            var chiefmanY = 0;
                            var totalFeemount = 0;
                            var result = 0;

                            for(let i =0 ;i<$scope.VO.insuranceman.length;i++){
                                let item = $scope.VO.insuranceman[i];
                            // }
                                if (item.feemount) {
                                    totalFeemount = totalFeemount + eval(item.feemount);
                                }
                                if (!item.insurancemanpk) {
                                    $scope.childFlag = false;
                                    return layer.alert("保险人子表中名称不可为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (item.insurancerate < 0 || item.insurancerate > 100) {
                                    $scope.childFlag = false;
                                    chiefmanY = 1;
                                    return layer.alert("请检查保险人信息子表中的承保比例!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (item.insurancerate < 0 || item.insurancerate > 100) {
                                    $scope.childFlag = false;
                                    chiefmanY = 1;
                                    return layer.alert("保险人信息子表保险保费加和不等于签单总保费!",  {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if(!item.insuranceaddr){
                                    $scope.childFlag = false;
                                    return layer.alert("保险人子表中地址不能为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if(!item.insuranceaddr){
                                    $scope.childFlag = false;
                                    return layer.alert("保险人子表中地址不能为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if(!item.insurancelinkman){
                                    $scope.childFlag = false;
                                    return layer.alert("保险人子表中联系人姓名不能为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if(!item.insurancelinktel){
                                    $scope.childFlag = false;
                                    return layer.alert("保险人子表中联系人电话不能为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (item.chiefman == 'Y') {
                                    chiefmanY = chiefmanY + 1;
                                }
                                result = parseFloat(result) + parseFloat(item.insurancerate);
                            };

                            //计算保险人信息子表中的承包比例加和
                            let array = $scope.insurancemanGridOptions.data;
                            let totalInsurancerate = 0;
                            for (let i = 0; i < array.length; i++) {
                                totalInsurancerate += parseFloat(array[i].insurancerate);
                            }
                            if (totalInsurancerate > 100 || totalInsurancerate < 100) {
                                return layer.alert("保险人信息子表中的承保比例加和应等于100!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }

                            if (parseFloat($scope.VO.commisiontotalnum).toFixed(2) != parseFloat(totalFeemount).toFixed(2)) {
                                $scope.childFlag = false;
                                return layer.alert("保险人信息子表佣金 加和不等于佣金总金额!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (chiefmanY == 0) {
                                $scope.childFlag = false;
                                return layer.alert("保险人信息子表必须有一个保险人主承保!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (result != 100) {
                                $scope.childFlag = false;
                                return layer.alert("保险人信息子表保险保费加和不等于签单总保费！",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        } else {
                            $scope.childFlag = false;
                            return layer.alert("请录入保险人信息!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }

                    if ($scope.childFlag) {
                        if ($scope.paymentGridOptions.data.length <= 0) {
                            $scope.childFlag = false;
                            return layer.alert("收付款子表为空！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        } else {
                            var sum_Insurancemoney = 0;
                            var insuranceman = $scope.insurancemanGridOptions.data;
                            var payment = $scope.paymentGridOptions.data;
                            for (var i = 0; i < payment.length; i++) {
                                var pay = payment[i];
                                if (pay.stages == 1) {
                                    var count = 0;
                                    for (var k = 0; k < payment.length; k++) {
                                        var subpay = payment[k];
                                        if (subpay.typeMoneyNO == pay.typeMoneyNO && subpay.company.name == pay.company.name) {
                                            if (parseFloat(subpay.scaleMoney) > 100 || parseFloat(subpay.scaleMoney) < 0) {
                                                $scope.childFlag = false;
                                                return layer.alert("单项收付款比例不能小于0或者大于100!",
                                                    {skin: 'layui-layer-lan', closeBtn: 1});
                                            }
                                            count = parseFloat(count) + parseFloat(subpay.scaleMoney);
                                        }
                                    }
                                    if (count.toFixed(2) != 100) {
                                        return layer.alert("各收付款类型收付比例合计应等于100%!",
                                            {skin: 'layui-layer-lan', closeBtn: 1});
                                    }
                                }
                                if (!pay.planDate) {
                                    return layer.alert("子表属性计划日期不可为空！",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                var reg = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
                                var str = pay.planDate;
                                var arr = reg.exec((str));
                                if (angular.isDate(str)) {
                                    str = str.getFullYear() + '-' + (str.getMonth() + 1) + '-' + str.getDate();
                                }
                                if (!reg.test(str) && RegExp.$2 <= 12 && RegExp.$3 <= 31) {
                                    return layer.alert("子表属性计划日期格式错误",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }
                            if ($scope.insuranceinfoGridOptions.data.length > 0) {
                                var count = 0;
                                $scope.childFlag = false;
                                for (var i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                                    if ($scope.insuranceinfoGridOptions.data[i].insurancemoney == 0 || $scope.insuranceinfoGridOptions.data[i].chargerate == 0) {
                                        count++;
                                    }
                                    if (count > 0) {
                                        layer.confirm('请核实子表中“保险金额/赔偿限额”和“费率”信息，是否需要修改', {
                                                btn: ['否', '是'], //按钮
                                                btn2: function (index, layero) {
                                                    layer.msg('取消保存!', {
                                                        shift: 6,
                                                        icon: 11
                                                    });
                                                },
                                                shade: 0.6,//遮罩透明度
                                                shadeClose: true,//点击遮罩关闭层
                                            },
                                            function () {
                                                $scope.childFlag = true;
                                                if ($scope.msgFlag) {
                                                    angular.alert($scope.msg);
                                                    $scope.childFlag = false;
                                                }
                                                // if ($scope.VO.billstatus == 37) {
                                                //     $scope.VO.billstatus = 31;
                                                // }
                                                if ($scope.childFlag) {
                                                    $scope.onSaveVO();
                                                }
                                            })
                                    } else {
                                        $scope.childFlag = true;
                                    }

                                }
                            }
                            if ($scope.msgFlag) {
                                angular.alert($scope.msg);
                                $scope.childFlag = false;
                            }
                            if ($scope.VO.busi_type.name == '个人代理业务' && ($scope.VO.pkAgent == null || $scope.VO.pkAgent == '' || $scope.VO.pkAgent.name ==null || $scope.VO.pkAgent.name =='')){
                                return layer.alert("代理制项目必须选择执业人员！", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            // if ($scope.dealAttachmentBGridOptions.data.length == 0) {
                            //     return layer.alert("请上传附件！",
                            //         {skin: 'layui-layer-lan', closeBtn: 1});
                            // }
                            if ($scope.childFlag) {
                                //被保人如果是本人，回写本人信息
                                for (var i = 0; i < $scope.insurancedmanGridOptions.data.length; i++) {
                                    if ($scope.insurancedmanGridOptions.data[i].withPolicyholder == 1) {
                                        $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: $scope.VO.estimatepk.pk}).success(function (response) {
                                            if (response && response.code == "200") {
                                                if (response.result != null) {
                                                    $scope.insurancedmanGridOptions.data[i].sex = response.result.enumSex;
                                                    $scope.insurancedmanGridOptions.data[i].birthdate = response.result.c1Birthday;
                                                } else {
                                                    $scope.insurancedmanGridOptions.data[i].sex = '';
                                                    $scope.insurancedmanGridOptions.data[i].birthdate = '';
                                                }
                                            }
                                        });

                                        $scope.insurancedmanGridOptions.data[i].insurancedman = $scope.VO.estimatepk.name;
                                        $scope.insurancedmanGridOptions.data[i].certificatetype = $scope.VO.certType;
                                        $scope.insurancedmanGridOptions.data[i].certificateno = $scope.VO.documentCode;
                                        $scope.insurancedmanGridOptions.data[i].insurancedmanaddr = $scope.VO.estimateaddr;
                                        $scope.insurancedmanGridOptions.data[i].insurancedmanphone = $scope.VO.vdef11;
                                    }
                                }

                                //受益人与被保人关系是本人，回写投保人信息
                                for (var i = 0; i < $scope.beneficiaryGridOptions.data.length; i++) {
                                    if ($scope.beneficiaryGridOptions.data[i].beneficiaryWithPolicyholder == 1 && $scope.beneficiaryGridOptions.data[i].beneficiarytype == 2) {
                                        $scope.beneficiaryGridOptions.data[i].beneficiary = $scope.VO.estimatepk.name;
                                        $scope.beneficiaryGridOptions.data[i].beneficiaryCertificatetype = $scope.VO.certType;
                                        $scope.beneficiaryGridOptions.data[i].beneficiaryCertificateno = $scope.VO.documentCode;
                                        $scope.beneficiaryGridOptions.data[i].beneficiaryContactInformation = $scope.VO.vdef11;
                                        $scope.beneficiaryGridOptions.data[i].beneficiaryContactAddress = $scope.VO.estimateaddr;
                                    }
                                }
                                // 如果是暂存的数据时，需要修正单据状态
                                if ($scope.VO.billstatus == 37) {
                                    $scope.VO.billstatus = 31;
                                }
                                //如果是保单库生成保单需要进行校验提示
                                if($scope.VO.insuranceData && $scope.VO.insuranceData.UUID && $scope.VO.insuranceData.UUID != ""){
                                    $scope.childFlag = false;
                                    //进入后台判断
                                    $http.post($rootScope.basePath + "pLifeInsurance/checkInsuranceData", {data: angular.toJson($scope.VO)}).success(function (response) {
                                        if(response.msg){
                                            layer.confirm(response.msg, {
                                                btn: ['是', '否'], //按钮
                                                btn2: function () {
                                                    return layer.msg('取消保存!', {shift: 6,icon: 11});
                                                },
                                                shade: 0.6,//遮罩透明度
                                                shadeClose: true,//点击遮罩关闭层
                                            }, function () {
                                                $scope.onSaveVO();
                                            })
                                        }
                                    });
                                }
                                if($scope.childFlag){
                                    $scope.onSaveVO();
                                }
                            }
                        }
                    }
                }
            }, true);
        };

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            if ($scope.QUERY["startdate^gte"] && $scope.QUERY["startdate^lte"]) {
                if (new Date($scope.QUERY["startdate^gte"]) > new Date($scope.QUERY["startdate^lte"])) {
                    return layer.alert("结束时间必须大于开始时间!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
            if ($scope.QUERY["enddate^gte"] && $scope.QUERY["enddate^lte"]) {
                if (new Date($scope.QUERY["enddate^gte"]) > new Date($scope.QUERY["enddate^lte"])) {
                    return layer.alert("结束时间必须大于开始时间!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
            $scope.queryForGrid($scope.QUERY);
        };
        $scope.onReset = function () {
            $scope.QUERY = $scope.initQUERY();
            $scope.QUERY.id = null;
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
            var data = {};
            if ($scope.selectTabName == 'insuranceinfoGridOptions') {
                data.maininsurance = 'Y';
                data.chargerate = '0';
                data.vdef4 = 'N';
                data.vdef2 = 'N';
                data.insurancetotalcharge = '0';
                $scope.VO.receivefeeperiod = 0;
            }
            if ($scope.selectTabName == 'insurancedmanGridOptions') {
                if ($scope.VO.insurancedman.length <= 0) {
                    $scope[$scope.selectTabName].data.push(data);
                } else {
                    return layer.alert('仅可拥有一条被保人信息！', {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
            } else if ($scope.selectTabName == 'beneficiaryGridOptions') {
                if ($scope.beneficiaryGridOptions.data.length <= 0) {
                    $scope[$scope.selectTabName].data.push(data);
                } else {
                    if ($scope.beneficiaryGridOptions.data[0].beneficiarytype == 1) {
                        return layer.alert('法定受益人仅可拥有一条！', {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                    } else {
                        $scope[$scope.selectTabName].data.push(data);
                    }
                }
            } else if ($scope.selectTabName == 'insurancemanGridOptions') {
                data.replace = 'N';
                // data.vdef4 = 'N';
                // data.vdef2 = 'N';
                data.pay = 'N';
                $scope.VO.receivefeeperiod = 0;
                if ($scope.insuranceinfoGridOptions.data.length == 0) {
                    data.chiefman = 'N';
                    data.maininsurance = 'Y';
                } else {
                    data.chiefman = 'N';
                }
                $scope[$scope.selectTabName].data.push(data);
            } else {
                $scope[$scope.selectTabName].data.push(data);
            }
            if ($scope.insurancemanGridOptions.data.length == 0) {
                data.insurancerate = '100';
                data.chiefman = 'Y';
            }
        };
        /**
         * 子表删除
         */
        $scope.onDeleteLine = function (selectTabName) {
            let selectTabNameOld = '';
            if(selectTabName){
                selectTabNameOld =  $scope.selectTabName;
                $scope.selectTabName = selectTabName;
            }
            var delRow = $scope[$scope.selectTabName].gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (var i = 0; i < $scope[$scope.selectTabName].data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope[$scope.selectTabName].data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope[$scope.selectTabName].data.splice(i, 1);
                        if ($scope.selectTabName == 'paymentGridOptions') {
                            var inData = $scope.insurancemanGridOptions.data;
                            $scope.VO.paymount = $scope.calPay(inData);
                            $scope.VO.receivemount = $scope.calReceivemount(inData);
                        }
                    }
                }
            }
            if ($scope.selectTabName == "insuranceinfoGridOptions") {
                var array = $scope.insuranceinfoGridOptions.data;
                $scope.VO.insurancetotalmoney = 0;
                $scope.VO.commisiontotalnum = 0;
                if (array.length == 0) {
                    $scope.VO.insurancetotalcharge = 0;
                    $scope.VO.commisiontotalnum = 0;
                } else {
                    $scope.VO.insurancetotalcharge = 0;
                    $scope.VO.insurancetotalmoney = 0;
                    $scope.VO.commisiontotalnum = 0;
                    for (var i = 0; i < array.length; i++) {
                        $scope.VO.insurancetotalcharge = eval(parseFloat($scope.VO.insurancetotalcharge)) + eval(parseFloat(array[i].insurancecharge));
                        $scope.VO.insurancetotalmoney = eval(parseFloat($scope.VO.insurancetotalmoney)) + eval(parseFloat(array[i].insurancemoney));
                        $scope.VO.commisiontotalnum = eval(parseFloat($scope.VO.commisiontotalnum) + eval(parseFloat(array[i].commisionnum)));
                        $scope.VO.receivefeemount = parseFloat($scope.VO.commisiontotalnum).toFixed(2);
                    }
                }
                $scope.VO.receivefeeperiod = 0;
            }
            if ($scope.selectTabName == 'insurancemanGridOptions') {
                $scope.VO.receivefeeperiod = 0;
            }
            if(selectTabName){
                $scope.selectTabName = selectTabNameOld;
            }
        };
    };

    $scope.initPage = function () {
        $scope.form = false;
        $scope.card = false;
        $scope.isClear = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.isreplace = true;
        $scope.queryShow = true;
        //控制附件上传和下载
        $scope.upOrDown = false;
        $scope.isUploadAnytime = false;
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
            showGridFooter: true,
            showColumnFooter: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '个人寿险信息.csv',
            columnDefs: [
                {name: 'billCheckBySelfState', displayName: '自查状态', width: 100,cellFilter: 'SELECT_BILLCHECKBYSELFSTATETYPE'},
                {
                    name: 'insuranceinfono',
                    displayName: '保单信息编号',
                    width: 100,
                    footerCellTemplate: '<div class="ui-grid-cell-contents">合计</div>>'
                },
                {name: 'pk_project_name', displayName: '业务/项目名称', width: 100,},
                {name: 'approval_number', displayName: '业务签报批复编号', width: 100,},
                {name: 'pk_project_code', displayName: '立项号 ', width: 100,},
                {name: 'pkC0Tradetype_name', displayName: '客户产权关系 ', width: 100,},
                {name: 'busi_type_name', displayName: '业务分类 ', width: 100,},
                {name: 'insuranceno', displayName: '保单号', width: 100, cellFilter: 'CSV_FILTER'},
                {name: 'insurancebillkindNO', displayName: '保单性质', width: 100, cellFilter: 'SELECT_INSURANCEBILLKIND'},

                {name: 'estimatepk_name', displayName: '投保人', width: 100,},

                {name: 'vdef11', displayName: '投保人联系电话', width: 100,},
                {name: 'estimateaddr', displayName: '投保人地址', width: 100,},
                {name: 'startdate', displayName: '保险起始日期', width: 100,},
                {name: 'enddate', displayName: '保险到期日期', width: 100,},
                {name: 'c_2_payyear', displayName: '缴费年期', width: 100,},
                {name: 'c_2_paymethodNO', displayName: '缴费方式', width: 100, cellFilter: 'SELECT_PAYMETHODTYPE'},
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
                    name: 'commisiontotalnum',
                    displayName: '佣金总金额(元)',
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
                {name: 'payperiod', displayName: '应解付保费总期数', width: 100,},
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
                {name: 'receiveperiod', displayName: '应收保费总期数', width: 100,},
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
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator_name', displayName: '经办人', width: 100,},
                {name: 'operate_date', displayName: '制单日期', width: 100,},
                {name: 'operate_time', displayName: '制单时间', width: 100,},
                // {name: 'pkAuditor.name', displayName: '审核人', width: 100,},
                // {name: 'auditDate.name', displayName: '审核日期', width: 100,},
                // {name: 'auditTime', displayName: '审核时间', width: 100,},
                {name: 'pkOrg_name', displayName: '业务单位', width: 100,},
                {name: 'pkDept_name', displayName: '部门', width: 100,},
                {name: 'pkChecker_name', displayName: '审批人', width: 100,},
                {name: 'check_date', displayName: '审批日期', width: 100, cellFilter: 'date_cell_date'},
                {name: 'insurancepkName', displayName: '险种名称', width: 100, },
                {name: 'busiType1', displayName: '一级业务分类', width: 100,},
                {name: 'busiType2', displayName: '二级业务分类', width: 100,},
                {name: 'busiType3', displayName: '三级业务分类', width: 100,},
                {name: 'sumReceivemount', displayName: '已收保费总金额', width: 100,},
                {name: 'sumPayment', displayName: '已解付保费总金额', width: 100,},
                {name: 'sumReceivefeemount', displayName: '已收佣金总金额', width: 100,},

                // {name: 'checkTime', displayName: '复核时间', width: 100,},
                // {name: 'vapprovenote', displayName: '复核意见', width: 100,},
            ],
            data: [],
            exporterAllDataFn: function () {
                return $scope.queryAllForGrid($scope.QUERY).then(function () {
                    $scope.gridOptions.useExternalPagination = false;
                });
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
                var rows = $scope.gridApi.selection.getSelectedRows();
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

        $scope.linkManOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationCurrentPage: 1,
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {name: 'name', displayName: '联系人姓名',width:150},
                {name: 'tele', displayName: '联系人电话',width:150},
            ],
            data:[],
            onRegisterApi: function (gridApi) {
                $scope.linkManOptions.gridApi = gridApi;
            }
        };

        $scope.selectTabName = 'insuranceinfoGridOptions';
        $scope.insuranceinfoGridOptions = {
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
                    name: 'insurancepk.name', displayName: '险种名称', width: 100, url: 'insuranceRef/queryForGrid'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'insurancepk'
                    , params: {type: 'shouxian'}, isTree: true, enableCellEdit: true
                },
                {
                    name: 'vdef6', displayName: '具体险种', width: 100, enableCellEdit: true


                },
                {
                    name: 'insurancemoneyoneperson',
                    displayName: '保险金额/赔偿限额(每人)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'estimatenum', displayName: '投保人数', width: 100
                },
                {
                    name: 'insurancemoney', displayName: '保险金额/赔偿限额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'chargerate', displayName: '费率(‰)', width: 100


                },
                {
                    name: 'vdef4', displayName: '保费金额不含增值税', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'vdef2', displayName: '佣金金额不含增值税', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'insurancecharge', displayName: '保费含税(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'commisionrate', displayName: '佣金比例（%）', width: 100


                },
                {
                    name: 'commisionnum', displayName: '佣金金额(含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'franchise', displayName: '免赔额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'cMemo', displayName: '备注', width: 100


                },
            ],
            data: $scope.VO.insuranceinfo,
            onRegisterApi: function (gridApi) {
                $scope.insuranceinfoGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {

                        //@zhangwj 参照类单元格不可以手动输入
                        if(colDef.name.indexOf(".name") > 0){
                            let colName = colDef.name.replaceAll(".name","");
                            if(rowEntity[colName] == null ||rowEntity[colName].pk == null || rowEntity[colName].pk == ''){
                                rowEntity[colName] = {};
                            }
                        }

                        var array = $scope.insuranceinfoGridOptions.data;
                        $scope.totalmoney = function (array) {
                            $scope.VO.insurancetotalmoney = 0;
                            $scope.VO.insurancetotalcharge = 0;
                            $scope.VO.commisiontotalnum = 0;
                            for (var i = 0; i < array.length; i++) {
                                //此处计算保险金额、赔偿金额要判断insurancemoney的值
                                //$scope.VO.insurancetotalmoney = eval(parseFloat(isNaN($scope.VO.insurancetotalmoney) ? 0 : $scope.VO.insurancetotalmoney).toFixed(2)) + eval(parseFloat(array[i].insurancemoney).toFixed(2));
                                $scope.VO.insurancetotalmoney = eval(parseFloat(isNaN($scope.VO.insurancetotalmoney) ? 0 : $scope.VO.insurancetotalmoney).toFixed(2)) + eval(parseFloat(isNaN(array[i].insurancemoney) ? 0 : array[i].insurancemoney).toFixed(2));
                                //$scope.VO.insurancetotalcharge = parseFloat( $scope.VO.insurancetotalcharge)+ parseFloat(array[i].insurancecharge).toFixed(2);
                                $scope.VO.insurancetotalcharge = eval(parseFloat($scope.VO.insurancetotalcharge)) + eval(parseFloat(isNaN(array[i].insurancecharge) ? 0 : array[i].insurancecharge).toFixed(2));
                                //计算佣金
                                $scope.VO.commisiontotalnum = eval(parseFloat($scope.VO.commisiontotalnum)) + eval(parseFloat(isNaN(array[i].commisionnum) ? 0 : array[i].commisionnum).toFixed(2));
                                $scope.VO.receivefeemount = parseFloat($scope.VO.commisiontotalnum).toFixed(2);
                            }

                            if ($scope.VO.insuranceman.length > 0) {
                                for (var i = 0; i < $scope.VO.insuranceman.length; i++) {
                                    $scope.VO.insuranceman[i].vdef1 = (eval($scope.VO.insurancetotalmoney) * eval($scope.VO.insuranceman[i].insurancerate) / 100).toFixed(2);
                                    $scope.VO.insuranceman[i].insurancemoney = (eval($scope.VO.insurancetotalcharge) * eval($scope.VO.insuranceman[i].insurancerate) / 100).toFixed(2);
                                    $scope.VO.insuranceman[i].feemount = (eval($scope.VO.commisiontotalnum) * eval($scope.VO.insuranceman[i].commisionrate) / 100).toFixed(2);
                                    /*  $scope.VO.insuranceman[i].feemount = (eval($scope.VO.insuranceman[i].insurancemoney) * eval($scope.VO.insuranceman[i].commisionrate) / 100).toFixed(2);
                                      if ($scope.VO.insuranceman[i].vdef4 == 'Y') {
                                          $scope.VO.insuranceman[i].feemount = ($scope.VO.insuranceman[i].feemount / 1.06).toFixed(2);
                                      }
                                      if ($scope.VO.insuranceman[i].vdef2 == 'Y') {
                                          $scope.VO.insuranceman[i].feemount = ($scope.VO.insuranceman[i].feemount * 1.06).toFixed(2);
                                      }*/

                                }
                            }
                            if ($scope.VO.payment.length > 0) {
                                for (var i = 0; i < $scope.VO.payment.length; i++) {
                                    $scope.VO.payment[i].scaleMoney = '';
                                    $scope.VO.payment[i].planDate = '';
                                }
                            }
                        };
                        if ('insurancemoney' == colDef.name) {
                            $scope.totalmoney(array);
                        } else if ('insurancemoneyoneperson' == colDef.name) {
                            if (newValue) {
                                rowEntity.insurancemoney = (parseFloat(newValue) * parseFloat(rowEntity.estimatenum)).toFixed(2);
                            }
                            rowEntity.insurancecharge = (parseFloat(rowEntity.insurancemoney) * parseFloat(rowEntity.chargerate) / 1000).toFixed(2);
                            rowEntity.commisionnum = (parseFloat(rowEntity.insurancecharge) * parseFloat(rowEntity.commisionrate) / 100).toFixed(2);

                            for (let i = 0; i < array.length; i++) {
                                $scope.VO.commisiontotalnum = parseFloat(eval($scope.VO.commisiontotalnum) + eval(array[i].commisionnum)).toFixed(2);
                            }
                            $scope.totalmoney(array);
                        } else if ('estimatenum' == colDef.name) {
                            if (newValue) {
                                rowEntity.insurancemoney = (parseFloat(newValue) * parseFloat(rowEntity.insurancemoneyoneperson)).toFixed(2);
                            }
                            rowEntity.insurancecharge = (parseFloat(rowEntity.insurancemoney) * parseFloat(rowEntity.chargerate) / 1000).toFixed(2);
                            rowEntity.commisionnum = (parseFloat(rowEntity.insurancecharge) * parseFloat(rowEntity.commisionrate) / 100).toFixed(2);
                            $scope.totalmoney(array);
                        } else if ('chargerate' == colDef.name) {
                            if (rowEntity.chargerate != 0) {
                                rowEntity.insurancecharge = (parseFloat(rowEntity.insurancemoney) * parseFloat(rowEntity.chargerate) / 1000).toFixed(2);
                                rowEntity.commisionnum = (parseFloat(rowEntity.insurancecharge) * parseFloat(rowEntity.commisionrate) / 100).toFixed(2);
                                $scope.totalmoney(array);
                            } else if (rowEntity.chargerate == 0) {
                                for (var i = 0; i < array.length; i++) {
                                    rowEntity.insurancecharge = parseFloat(array[i].insurancecharge).toFixed(2);
                                    rowEntity.commisionnum = (parseFloat(rowEntity.insurancecharge) * parseFloat(rowEntity.commisionrate) / 100).toFixed(2);
                                }
                                $scope.totalmoney(array);
                            }
                        } else if ('vdef4' == colDef.name) {
                            if (rowEntity.vdef4) {
                                if (rowEntity.vdef4 == 'Y') {
                                    angular.alert("系统将按照签单保费 /1.06来计算签单佣金，请确认!");
                                }
                            }
                        } else if ('vdef2' == colDef.name) {
                            if (rowEntity.vdef2) {
                                if (rowEntity.vdef2 == 'Y') {
                                    angular.alert("系统将按照实际佣金/1.06来计算签单佣金，请确认!");
                                }
                            }
                        } else if ('insurancecharge' == colDef.name) {
                            rowEntity.commisionnum = ((parseFloat(newValue) * parseFloat(rowEntity.commisionrate)) / 100).toFixed(2);
                            $scope.VO.insurancetotalcharge = 0;
                            for (var i = 0; i < array.length; i++) {
                                $scope.VO.insurancetotalcharge = parseFloat($scope.VO.insurancetotalcharge) + parseFloat(array[i].insurancecharge);
                            }
                            rowEntity.commisionnum = (parseFloat(rowEntity.insurancecharge) * parseFloat(rowEntity.commisionrate) / 100).toFixed(2);
                            $scope.totalmoney(array);
                        } else if ('commisionrate' == colDef.name) {
                            if (newValue) {
                                rowEntity.commisionnum = ((parseFloat(newValue) * parseFloat(rowEntity.insurancecharge)) / 100).toFixed(2);
                            }
                            if ($scope.VO.payment.length > 0) {
                                for (var i = 0; i < $scope.VO.payment.length; i++) {
                                    $scope.VO.payment[i].scaleMoney = '';
                                    $scope.VO.payment[i].planDate = '';
                                }
                            }
                            $scope.totalmoney(array);
                        }
                        if ('commisionnum' == colDef.name) {
                            let array = $scope.insuranceinfoGridOptions.data;
                            $scope.VO.commisiontotalnum = 0;
                            for (let i = 0; i < array.length; i++) {
                                $scope.VO.commisiontotalnum = parseFloat(eval($scope.VO.commisiontotalnum) + eval(array[i].commisionnum)).toFixed(2);
                            }
                            $scope.VO.receivefeemount = $scope.VO.commisiontotalnum;
                        }


                        if ('insurancecharge' == colDef.name || 'vdef4' == colDef.name || 'vdef2' == colDef.name || 'commisionrate' == colDef.name) {
                            var inData = $scope.insuranceinfoGridOptions.data;
                            if (rowEntity.commisionrate != null && rowEntity.commisionrate != "") {
                                if (rowEntity.insurancemoney) {
                                    rowEntity.commisionnum = rowEntity.insurancecharge;
                                }
                                if (rowEntity.vdef4 == 'Y') {
                                    rowEntity.commisionnum = rowEntity.commisionnum / 1.06;
                                }
                                if (rowEntity.vdef2 == 'Y') {
                                    rowEntity.commisionnum = rowEntity.commisionnum * 1.06;
                                }
                                if (rowEntity.commisionrate) {
                                    rowEntity.commisionnum = parseFloat((eval(rowEntity.commisionnum) * eval(rowEntity.commisionrate) / 100).toFixed(2)).toFixed(2);
                                    $scope.VO.paymount = $scope.calPay(inData);
                                }
                                if (rowEntity.commisionnum || !rowEntity.commisionnum) {
                                    var array = $scope.insuranceinfoGridOptions.data;
                                    $scope.VO.commisiontotalnum = 0;
                                    for (var i = 0; i < array.length; i++) {
                                        $scope.VO.commisiontotalnum = parseFloat(eval($scope.VO.commisiontotalnum) + eval(array[i].commisionnum)).toFixed(2);
                                    }
                                    $scope.VO.receivefeemount = $scope.VO.commisiontotalnum;
                                }
                                if ($scope.VO.payment.length > 0) {
                                    for (var j = 0; j < $scope.VO.payment.length; j++) {
                                        $scope.VO.payment[j].scaleMoney = '';
                                        $scope.VO.payment[j].planDate = '';
                                    }
                                }
                            }

                        }
                        $scope.$apply();
                    });
                }
            }
        };
        $scope.insurancedmanGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    if (($rootScope.col.grid.rows[0].entity.withPolicyholder == null || $rootScope.col.grid.rows[0].entity.withPolicyholder == '') && $rootScope.col.name == 'withPolicyholder') {
                        return true;
                    }
                    if ($rootScope.col.grid.rows[0].entity.withPolicyholder == 1) {
                        if ($rootScope.col.name == 'withPolicyholder' || $rootScope.col.name == 'insurancemoney' || $rootScope.col.name == 'insurancefee' || $rootScope.col.name == 'additioninsurancecharge') {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'withPolicyholder', displayName: '与投保人关系', width: 100, cellFilter: 'SELECT_PERSONNELRELATIONS'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.PERSONNELRELATIONS
                },
                {
                    name: 'insurancedman', displayName: '姓名', width: 100,
                },
                {
                    name: 'sex', displayName: '性别', width: 100, cellFilter: 'SELECT_SEXTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.SEXTYPE
                },
                {
                    name: 'birthdate', displayName: '出生日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'certificatetype', displayName: '证件类型', width: 100, cellFilter: 'SELECT_CERTCODETYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.CERTCODETYPE
                },
                {
                    name: 'certificateno', displayName: '证件号码', width: 100


                },
                {
                    name: 'insurancedmanaddr', displayName: '详细地址', width: 100


                },
                {
                    name: 'insurancedmanphone', displayName: '联系电话', width: 100,
                },
                {
                    name: 'insurancemoney', displayName: '保险金额/赔偿限额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'insurancefee', displayName: '主险保费(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'additioninsurancecharge', displayName: '附加险保费(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
            ],
            data: $scope.VO.insurancedman,
            onRegisterApi: function (gridApi) {
                $scope.insurancedmanGridOptions.gridApi = gridApi;

                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {

                        if ('withPolicyholder' == colDef.name) {

                            //如果被保人与投保人关系为本人  自动获取
                            if (rowEntity.withPolicyholder == 1 && $scope.VO.estimatepk && $scope.VO.estimatepk.pk) {

                                $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: $scope.VO.estimatepk.pk}).success(function (response) {
                                    if (response && response.code == "200") {
                                        if (response.result != null) {
                                            rowEntity.sex = response.result.enumSex;
                                            rowEntity.birthdate = response.result.c1Birthday;
                                        } else {
                                            rowEntity.sex = '';
                                            rowEntity.birthdate = '';
                                        }
                                    }
                                });

                                rowEntity.insurancedman = $scope.VO.estimatepk.name;
                                rowEntity.certificatetype = $scope.VO.certType;
                                rowEntity.certificateno = $scope.VO.documentCode;
                                rowEntity.insurancedmanaddr = $scope.VO.estimateaddr;
                                rowEntity.insurancedmanphone = $scope.VO.vdef11;

                            }
                        }
                    });
                }
            }
        };

        $scope.beneficiaryGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    if (($rootScope.col.grid.rows[0].entity.beneficiarytype == null || $rootScope.col.grid.rows[0].entity.beneficiarytype == '') && $rootScope.col.name == 'beneficiarytype') {
                        return true;
                    }
                    if ($rootScope.col.grid.rows[0].entity.beneficiarytype == 1) {
                        if ($rootScope.col.name != 'beneficiarytype') {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'beneficiarytype', displayName: '受益人类型', width: 100, cellFilter: 'SELECT_BENEFICIARYTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.BENEFICIARYTYPE
                },
                {
                    name: 'beneficiarySort', displayName: '受益顺序', width: 100
                },
                {
                    name: 'beneficiaryWithPolicyholder',
                    displayName: '与被保人关系',
                    width: 100,
                    cellFilter: 'SELECT_PERSONNELRELATIONS'
                    ,
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.PERSONNELRELATIONS
                },
                {
                    name: 'beneficiary', displayName: '姓名', width: 100
                },
                {
                    name: 'beneficiaryRatio', displayName: '受益比例(%)', width: 100, cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'beneficiaryCertificatetype',
                    displayName: '证件类型',
                    width: 100,
                    cellFilter: 'SELECT_CERTCODETYPE'
                    ,
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.CERTCODETYPE
                },
                {
                    name: 'beneficiaryCertificateno', displayName: '证件号码', width: 100
                },
                {
                    name: 'beneficiaryContactInformation', displayName: '联系方式', width: 100
                },
                {
                    name: 'beneficiaryContactAddress', displayName: '联系地址', width: 100
                },

            ],
            data: $scope.VO.beneficiary,
            onRegisterApi: function (gridApi) {
                $scope.beneficiaryGridOptions.gridApi = gridApi;

                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        //如果关系为本人
                        if ('beneficiaryWithPolicyholder' == colDef.name) {
                            if (rowEntity.beneficiaryWithPolicyholder == 1 && rowEntity.beneficiarytype == 2) {
                                rowEntity.beneficiary = $scope.VO.estimatepk.name;
                                rowEntity.beneficiaryCertificatetype = $scope.VO.certType;
                                rowEntity.beneficiaryCertificateno = $scope.VO.documentCode;
                                rowEntity.beneficiaryContactInformation = $scope.VO.vdef11;
                                rowEntity.beneficiaryContactAddress = $scope.VO.estimateaddr;
                            }
                        }
                    });
                }
            }

        };

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
                    name: 'insurancemanpk.name',
                    displayName: '保险人名称',
                    width: 100,
                    url: 'agreement/queryForGridRef',
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'insurancemanpk',
                    params : {customerType :'(3,4)'}
                },
                {
                    name: 'insuranceaddr', displayName: '保险人地址', width: 100
                },
                {
                    name: 'insurancelinkman', displayName: '保险人联系人姓名', width: 100
                },
                {
                    name: 'insurancelinktel', displayName: '保险人联系电话', width: 100
                },
                {
                    name: 'replace', displayName: '是否代收保费', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'pay', displayName: '是否全额解付', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                /* {
                     name: 'vdef4', displayName: '保费金额不含增值税', width: 100, cellFilter: 'SELECT_YESNO'
                     , editableCellTemplate: 'ui-grid/dropdownEditor'
                     , editDropdownValueLabel: 'name'
                     , editDropdownOptionsArray: getSelectOptionData.YESNO
                 },
                 {
                     name: 'vdef2', displayName: '佣金金额不含增值税', width: 100, cellFilter: 'SELECT_YESNO'
                     , editableCellTemplate: 'ui-grid/dropdownEditor'
                     , editDropdownValueLabel: 'name'
                     , editDropdownOptionsArray: getSelectOptionData.YESNO
                 },*/
                {
                    name: 'insurancerate', displayName: '承保比例(%)', width: 100
                },
                {
                    name: 'vdef1',
                    displayName: '保险金额/赔偿限额(元)',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'insurancemoney', displayName: '保险保费(含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'feemount', displayName: '佣金金额(含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'chiefman', displayName: '是否主承保', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'memo', displayName: '备注', width: 100
                },
            ],
            data: $scope.VO.insuranceman,
            onRegisterApi: function (gridApi) {
                $scope.insurancemanGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if ('insurancerate' == colDef.name) {
                            if (rowEntity.insurancerate) {
                                rowEntity.vdef1 = (eval($scope.VO.insurancetotalmoney) * eval(rowEntity.insurancerate) / 100).toFixed(2);
                                rowEntity.insurancemoney = (eval($scope.VO.insurancetotalcharge) * eval(rowEntity.insurancerate) / 100).toFixed(2);
                                rowEntity.feemount = (eval($scope.VO.commisiontotalnum) * eval(rowEntity.insurancerate) / 100).toFixed(2);
                            }
                            var inData = $scope.insurancemanGridOptions.data;
                            $scope.VO.paymount = $scope.calPay(inData);
                            $scope.VO.receivemount = $scope.calReceivemount(inData);
                            $scope.VO.receivefeeperiod = 0;
                            $scope.VO.payperiod = 0;
                            $scope.VO.receiveperiod = 0;
                            $scope.VO.payment = [];
                            $scope.paymentGridOptions.data = [];
                        }

                        if ('replace' == colDef.name) {
                            if (rowEntity.replace) {
                                $scope.VO.receivemount = 0;
                                var inData = $scope.insurancemanGridOptions.data;
                                if (rowEntity.replace == 'Y') {
                                    angular.alert("确认代收保费，并确认代收金额!");
                                    $scope.isreplace = false;
                                } else {
                                    rowEntity.pay = 'N';
                                    $scope.isreplace = true;
                                }
                                /*$scope.VO.paymount = $scope.calPay(inData);
                                $scope.VO.receivemount = $scope.calReceivemount(inData);*/

                            }
                        }

                        if ('insurancemoney' == colDef.name) {
                            var inData = $scope.insurancemanGridOptions.data;
                            $scope.VO.paymount = 0;
                            $scope.VO.receivemount = 0;
                            $scope.VO.receivemount = $scope.calReceivemount(inData);
                            $scope.VO.paymount = $scope.calPay(inData);
                            $scope.VO.receivefeeperiod = 0;
                            $scope.VO.payperiod = 0;
                            $scope.VO.receiveperiod = 0;
                            $scope.VO.payment = [];
                            $scope.paymentGridOptions.data = [];
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
            var result = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i].replace == 'Y') {
                    if (!data[i].insurancemoney) {
                        data[i].insurancemoney = 0;
                    }
                    result = eval(parseFloat(result).toFixed(2)) + eval(parseFloat(data[i].insurancemoney).toFixed(2));
                }
            }
            return result;
        }

        /**
         * 计算应解付总额
         * @param data
         */
        $scope.calPay = function (data) {
            var result = 0;
            var flag = false;
            for (var i = 0; i < data.length; i++) {
                var feemount = 0;
                var insurancemoney = 0;
                if (data[i].pay == 'Y') {
                    result = eval(parseFloat(result).toFixed(2)) + eval(parseFloat(data[i].insurancemoney).toFixed(2));
                } else if (data[i].pay != 'Y' && data[i].replace == 'Y') {
                    if (data[i].feemount) {
                        feemount = eval(parseFloat(feemount).toFixed(2)) + eval(parseFloat(data[i].feemount).toFixed(2));
                    }
                    if (data[i].insurancemoney) {
                        insurancemoney = eval(parseFloat(insurancemoney).toFixed(2)) + eval(parseFloat(data[i].insurancemoney).toFixed(2));
                    }
                    flag = false;
                    result = result + eval((parseFloat(insurancemoney).toFixed(2) - parseFloat(feemount)).toFixed(2));
                }
            }
            if (flag) {
                return 0;
            }
            return result;
        }
        $scope.partnerGridOptions = {
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
                    name: 'cooperativer', displayName: '合作伙伴', width: 100
                },
                {
                    name: 'cooperativeraddr', displayName: '合作伙伴地址', width: 100
                },
                {
                    name: 'cooperativerlinkman', displayName: '合作伙伴联系人姓名', width: 100
                },
                {
                    name: 'cooperativerlinktel', displayName: '合作伙伴联系人电话', width: 100
                },
                {
                    name: 'memo', displayName: '备注', width: 100
                },
            ],
            data: $scope.VO.partner,
            onRegisterApi: function (gridApi) {
                $scope.partnerGridOptions.gridApi = gridApi;
            }
        };
        $scope.paymentGridOptions = {
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
                    name: 'stages', displayName: '期数', width: 100
                },
                {
                    name: 'typeMoneyNO', displayName: '收付款类型', width: 100, cellFilter: 'SELECT_TYPEMONEY'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.TYPEMONEY
                },
                {
                    name: 'company.name', displayName: '收付款对象名称', width: 100
                },
                {
                    name: 'typeCompanyNO', displayName: '收付款对象类型', width: 100, cellFilter: 'SELECT_CUSTOMERTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.CUSTOMERTYPE
                },
                {
                    name: 'scaleMoney', displayName: '收付款比例(%)', width: 100
                },
                {
                    name: 'planDate', displayName: '计划日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'
                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'planMoney', displayName: '计划金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'factMoney', displayName: '已结算金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'noPaymentMoney', displayName: '未结算金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'factDate', displayName: '结算日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'
                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'vsettlebillno', displayName: '业务结算单号', width: 100
                },
            ],
            data: $scope.VO.payment,
            onRegisterApi: function (gridApi) {
                $scope.paymentGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if ('scaleMoney' == colDef.name) {
                            if (rowEntity.scaleMoney) {
                                var array = $scope.paymentGridOptions.data;
                                $scope.VO.insuranceman = $scope.insurancemanGridOptions.data;
                                for (var i = 0; i < array.length; i++) {
                                    if (rowEntity.typeMoneyNO == 1) {
                                        rowEntity.planMoney = (eval($scope.VO.receivemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                        rowEntity.noPaymentMoney = (eval($scope.VO.receivemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                    }
                                    for (var j = 0; j < $scope.VO.insuranceman.length; j++) {
                                        if (array[i].company.name == $scope.VO.insuranceman[j].insurancemanpk.name
                                            && array[i].$$hashKey == rowEntity.$$hashKey) {
                                            if (rowEntity.typeMoneyNO == 3) {
                                                rowEntity.planMoney = (eval($scope.VO.insuranceman[j].feemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                rowEntity.noPaymentMoney = (eval($scope.VO.insuranceman[j].feemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                            }
                                            if (rowEntity.typeMoneyNO == 2) {
                                                if ($scope.VO.insuranceman[j].pay != 'Y') {
                                                    if ($scope.VO.insuranceman.length > 1 && $scope.VO.insuranceman[j].chiefman != 'Y') {
                                                        rowEntity.planMoney = (eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        rowEntity.noPaymentMoney = (eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    } else if ($scope.VO.insuranceman.length > 1 && $scope.VO.insuranceman[j].chiefman != 'Y') {
                                                        rowEntity.planMoney = (eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        rowEntity.noPaymentMoney = (eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    } else {
                                                        rowEntity.planMoney = (eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        rowEntity.noPaymentMoney = (eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    }

                                                } else {
                                                    rowEntity.planMoney = (eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    rowEntity.noPaymentMoney = (eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                }
                                            }
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
        $scope.dealAttachmentBGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'file_type', displayName: '附件类型', width: 100, enableCellEdit: false
                },
                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},
                {
                    name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                },
                {
                    name: 'pk_project_id',
                    displayName: ' ',
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ng-click="grid.appScope.onPreviewFile(row.entity.pk_project_id,row.entity.attachment_name)" class="btn btn-transparent btn-xs tooltips" tooltip-placement="top">在线预览&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i></a></div>'
                }
            ],
            data: $scope.VO.dealAttachmentB,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.dealAttachmentBGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.dealAttachmentBGridOptions.gridApi = gridApi;
                }
                $scope.dealAttachmentBGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };


//获取财务联查时url中的id
        function getQueryVariable() {
            var query = window.location.href;
            var vars = query.split("&");
            var pair = vars[0].split("=");
            if (pair.length > 1) {
                return pair[1];
            }
            return null;
        }

        if (null != getQueryVariable()) {
            $scope.onCard(getQueryVariable());
        }
        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        } /*else {
            $scope.queryForGrid($scope.QUERY);
        }*/
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();

        if ($scope.selectTabName == 'paymentGridOptions') {
            $scope.isShow = false;
        } else {
            $scope.isShow = true;
        }
        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {
            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }
    };
    $scope.table_name = "lr_insurancebill";
    $scope.billdef = "PLifeInsurance";
    $scope.beanName = "insurance.InsurancebillServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();

    if (null != getDataById()) {
        var formId = getDataById();
        $scope.findOneData(formId);
    }
    function getDataById() {
        let dataById = $rootScope.dataById;
        if (dataById != null ) {
            return dataById;
        }
        return null;
    }
    initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope, $rootScope);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);

});
app.controller('insuranceinfoGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('insurancedmanGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('insurancemanGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('partnerGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('paymentGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('assistantGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
