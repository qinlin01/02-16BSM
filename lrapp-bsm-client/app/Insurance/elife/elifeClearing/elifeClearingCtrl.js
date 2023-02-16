/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('elifeClearingCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, ngTableParams) {
    $scope.initData = function () {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkCorp: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                createTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                sumReceivemount: 0,
                sumPaymount: 0,
                sumReceivefeemount: 0,
                vbillno: "",
                rechargeType: "",
                clearType: "",
                pkFactActualcollection: null,
                fictitiousBusinessType: "",
                bankNumber: "",
                bankName: "",
                taxpayersNumber: "",
                companyAddress: "",
                companyTel: "",
                sumPaymount: 0,
                sumReceivemount: 0,
                sumReceivefeemount: 0,
                sumActualAccountAmount: 0,
                clearingInsuranceList: [],
                clearingPaymentList: [],
                clearingActualaccountList: [],
                dealattachmentb : []
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "substr(create_time,1,4)0_0eq" : parseInt(new Date().format("yyyy")),
            }
        };
        $scope.QUERY = $scope.initQUERY();
    };
    $scope.clearingBParams = new ngTableParams({
        page: 1,
        count: 10,
    }, {
        counts: [10,50,100,200],// 样式原因，去掉每页条数选择
        getData: function ($defer, params) {
            // $scope.queryData(0, (params.page() - 1) * params.count(), params.count(), function (data, total) {
            //     params.total(total);
            //     $defer.resolve(data);
            // });
        }
    });
    $scope.initHttp = function () {

        //再次向财务管控发起请求
        $scope.sendReceiveInfoAgain = function (vo){
            layer.load(2);
            $http.post($rootScope.basePath + "clearingAudit/sendReceiveInfoAgain", {data: angular.toJson(vo),clearingAuditSource: 2}).success(function (response) {
                if(response && response.code == 200){
                    layer.alert("再次请求成功！")
                }else{
                    layer.alert("再次请求失败！")
                }
                layer.closeAll('loading');
            });
        }

        //获取银行流水
        $scope.getActualAccount = function (){
            let param ={
                actualAccountDate: $scope.VO.actualAccountDate,
                querylenderAmount: $scope.VO.querylenderAmount,
                queryName: $scope.VO.queryName,
                pkorg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                acountType : "2,5"
            }
            $http.post($scope.basePath + "subscription/getClearing",{ params :angular.toJson(param) }).success(function (response)  {
                if (response && response.code == "200") {
                    $scope.actualaccountAllGridOption.data =  response.clearingList;
                    if($scope.actualaccountAllGridOption.data.length ==0) {
                        $scope.actualaccountAllGridOption.data = new Array();
                    }
                } else {
                    if(response){
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function(matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                }
            });
        };

        //获取对账单下的收付款
        $scope.getPaymentList = function (value){
                let ids = [];
            for (let i = 0; i < value.length; i++) {
                ids[i] = value[i].pkFictitiousInsurance;
                }
            $http.post($rootScope.basePath + "webInsurance/getInsurancePayment", {
                ids: angular.toJson(ids),clearType: $scope.VO.clearType,rechargeType: $scope.VO.rechargeType
            }).success(function (response) {
                if (response && response.code == 200) {
                    if( response.data == null || response.data.length == 0){
                        $scope.paymentGridOption.data = [];
                    }else{
                        for (let i = 0; i < response.data.length; i++) {
                            $scope.paymentGridOption.data.push(response.data[i]);
                        }
                        //自动带出实际往来对象
                        if($scope.paymentGridOption.data.length >= 1){
                            if($scope.VO.clearType == 2 || $scope.VO.clearType == 3){
                                $scope.VO.pkFactActualcollection = $scope.paymentGridOption.data[0].pkFactCompany;
                            }
                        }
                    }
                    $scope.sumAmount();
                    $scope.initFactDate();
                }else{
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
                layer.closeAll('loading');
            }).error(function () {
                layer.closeAll('loading');
            });
        }
        $scope.getCustomer = function (id){
            layer.load(2);
            $http.post($rootScope.basePath + "propertyProject/findOne", {
                pk: id,
            }).success(function (response) {
                if (response && response.code == 200) {
                    $scope.VO.factCustomer = response.result.cinsureman;
                }else{
                    $scope.VO.factCustomer = null;
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
                layer.closeAll('loading');
            }).error(function () {
                layer.closeAll('loading');
            });
        }
        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data) {
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData =  $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.basePath + "elifeClearing/queryAllForGrid1", {
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
            $http.post($scope.basePath + "elifeClearing/queryForGrid", {
                params: angular.toJson(data),
                current: $scope.gridApi.page ? $scope.gridApi.page : 1,
                size: $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100,
            }).success(function (response) {
                $scope.gridOptions.data = response.data.records;
                $scope.gridOptions.totalItems = response.data.total;
                layer.closeAll('loading');
            });
        };
        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "elifeClearing/findOne", {id: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    if (callback) {
                        callback();
                    }
                    $scope.VO = response.data;
                    $scope.paymentGridOption.data = response.data.clearingPaymentList;
                    $scope.insuranceBillGridOption.data = response.data.clearingInsuranceList;
                    //初始化结算日期
                    if($scope.paymentGridOption.data != null && $scope.paymentGridOption.data.length > 0){
                        $scope.VO.factDate = $scope.paymentGridOption.data[0].factDate;
                    }
                    //线上带出银行流水
                    if(response.data.rechargeType == 1){
                        $scope.getActualAccount();
                        $scope.actualaccountSelectGridOption.data = response.data.clearingActualaccountList;
                    }
                } else {
                    if(response){
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function(matched) {
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
            $scope.VO.clearingInsuranceList = $scope.insuranceBillGridOption.data;
            $scope.VO.clearingPaymentList = $scope.paymentGridOption.data;
            $scope.VO.clearingActualaccountList = $scope.actualaccountSelectGridOption.data;
            $http.post($rootScope.basePath + "elifeClearing/save", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    if (response.code == 200) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        $scope.VO = response.vo;
                        $scope.isSubEdit = false;
                        layer.closeAll('loading');
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
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

        $scope.initFactDate = function (){
            if($scope.paymentGridOption.data != null && $scope.paymentGridOption.data.length > 0){
                for (let i = 0; i < $scope.paymentGridOption.data.length; i++) {
                    $scope.paymentGridOption.data[i].factDate = $scope.VO.factDate;
                }
            }
        }

        //合计已选择的银行流水金额
        $scope.sumActualAccountAmount = function (){
            if($scope.actualaccountSelectGridOption.data != null && $scope.actualaccountSelectGridOption.data.length > 0) {
                let sumAmount = 0;
                for (let i = 0; i < $scope.actualaccountSelectGridOption.data.length; i++) {
                    sumAmount = parseFloat($scope.actualaccountSelectGridOption.data[i].lenderAmount) + sumAmount;
                }
                $scope.VO.sumActualAccountAmount = sumAmount.toFixed(2);
            }else{
                $scope.VO.sumActualAccountAmount = 0;
            }
        };

        //判断已选择银行流水中是否已经选择该流水
        $scope.isSelectActualAccount = function (row){
            if($scope.actualaccountSelectGridOption.data != null && $scope.actualaccountSelectGridOption.data.length > 0){

                for (let i = 0; i < $scope.actualaccountSelectGridOption.data.length; i++) {
                    if($scope.actualaccountSelectGridOption.data[i].pkActualaccount == row.id){
                        return false;
                    }
                }

            }
            return true;
        }

        // 计算结算金额合计
        $scope.sumAmount = function (){
            //对账单金额合计
            let insuranceAmountSum = 0;
            for (let i = 0; i < $scope.insuranceBillGridOption.data.length; i++) {
                insuranceAmountSum = insuranceAmountSum + parseFloat($scope.insuranceBillGridOption.data[i].amount);
            }
            //收付款金额合计
            let paymentAmountSum = 0;
            for (let i = 0; i < $scope.paymentGridOption.data.length; i++) {
                paymentAmountSum = paymentAmountSum + parseFloat($scope.paymentGridOption.data[i].amount);
            }

            //应收保费
            if($scope.VO.clearType == 1){
                $scope.VO.sumReceivemount = insuranceAmountSum.toFixed(2);
            }
            //解付保费
            if($scope.VO.clearType == 2){
                $scope.VO.sumPaymount = insuranceAmountSum.toFixed(2);
            }
            //应收佣金
            if($scope.VO.clearType == 3){
                $scope.VO.sumReceivefeemount = insuranceAmountSum.toFixed(2);
            }

            if(insuranceAmountSum.toFixed(2) != paymentAmountSum.toFixed(2)){
                return layer.alert("对账单总金额不等于结算详情总金额!", {skin: 'layui-layer-lan',closeBtn: 1});
            }
        }
        //数据清空
        $scope.clearData = function (){
            $scope.paymentGridOption.data = [];
            $scope.insuranceBillGridOption.data = [];
            $scope.orderGridOption.data = [];
            $scope.netInsuranceBillGridOption.data = [];
            $scope.VO.sumReceivemount = 0;
            $scope.VO.sumPaymount = 0;
            $scope.VO.sumReceivefeemount = 0;
            $scope.isSelect = false;
        }
        //数据银行流水清空
        $scope.clearActualAccountData = function (){
            $scope.actualaccountAllGridOption.data = [];
            $scope.actualaccountSelectGridOption.data = [];
            $scope.VO.clearingActualaccountList = [];
        }
        $scope.changeOpen = function () {
             $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function (item) {
            if(item && item.id){
                $scope.onCard(item.id);
            }

        };


        /**
         * 获取订单信息
         */
        $scope.getOrderInfo = function (id) {
            layer.load(2);
            $http.post($rootScope.basePath + "elifeClearing/getOrderInfo", {id:id}).success(function (response) {
                layer.closeAll('loading');
                if(response.code == 200){
                    $scope.orderGridOption.data = response.data;
                }
            });

        };

        /**
         * 获取小保单信息
         */
        $scope.getNetInusuanceBill = function (id) {
            layer.load(2);
            $http.post($rootScope.basePath + "elifeClearing/getNetInusuanceBill", {id:id}).success(function (response) {
                layer.closeAll('loading');
                if(response.code == 200){
                    $scope.netInsuranceBillGridOption.data = response.data;
                }
            });

        };
    };

    $scope.initWatch = function () {

        $scope.$watch('VO.factDate', function (newVal, oldVal) {
            if(newVal == null || newVal == '' || !$scope.isEdit){
                return;
            }
            if(newVal == oldVal){
                return;
            }
            $scope.initFactDate();
        }, true);

        $scope.$watch('VO.clearType', function (newVal, oldVal) {
            if(newVal == null || newVal == '' || !$scope.isEdit){
                return;
            }
            if(newVal == oldVal){
                return;
            }
            $scope.VO.rechargeType = 1;
            $scope.clearData();
        }, true);

        $scope.$watch('VO.fictitiousBusinessType', function (newVal, oldVal) {
            if(newVal == null || newVal == '' || !$scope.isEdit){
                return;
            }
            if(newVal == oldVal){
                return;
            }
            if($scope.VO.clearType == 1){
                $scope.VO.rechargeType = 1;
            }else{
                $scope.VO.rechargeType = 1;
            }
            $scope.clearData();
        }, true);

        $scope.$watch('VO.rechargeType', function (newVal, oldVal) {
            if(newVal == null || newVal == '' || !$scope.isEdit){
                return;
            }
            if(newVal == oldVal){
                return;
            }
            $scope.clearData();
            //线上查询流水
            if(newVal == 1){
                $scope.getActualAccount();
            }else{
                $scope.clearActualAccountData();
            }
        }, true);

        $scope.$watch('VO.actualAccountDate', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.getActualAccount();
            }
        }, true);
        $scope.$watch('VO.querylenderAmount', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.getActualAccount();
            }
        }, true);
        $scope.$watch('VO.queryName', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.getActualAccount();
            }
        }, true);

        $scope.$watch('actualaccountSelectGridOption.data', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.sumActualAccountAmount();
            }
        }, true);

        $scope.$watch('VO.pkFactActualcollection', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit && $scope.paymentGridOption.data !=null && $scope.paymentGridOption.data.length > 0) {
                for (let i = 0; i < $scope.paymentGridOption.data.length; i++) {
                    $scope.paymentGridOption.data[i].pkFactCompany = $scope.VO.pkFactActualcollection;
                }
            }
        }, true);

    };

    $scope.initButton = function () {

        $scope.onSendReceiveInfoAgain = function (){
            //重新填写银行联行号，银行卡号，开户银行
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: getURL('insurance/view/elifeClearing/sendReceiveInfoAgain.html'),
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                preCloseCallback: function (value) {

                    return true;
                }
            }).then(function (value) {

            }, function (reason) {

            });
        }

        $scope.onSaveSendReceiveInfoAgain = function () {
            if($scope.VO.jointBankNum==null || $scope.VO.jointBankNum==""){
                return layer.alert("请填写银行联行号！");
            }
            if($scope.VO.accNum==null || $scope.VO.accNum==""){
                return layer.alert("请填写银行卡号！");
            }
            if($scope.VO.accBlank==null || $scope.VO.accBlank==""){
                return layer.alert("请填写开户银行！");
            }
            let vo = {
                id:$scope.VO.id,
                jointBankNum:$scope.VO.jointBankNum,
                accNum:$scope.VO.accNum,
                accBlank:$scope.VO.accBlank
            }
            $scope.sendReceiveInfoAgain(vo);
            ngDialog.close();
        }
        $scope.onCancelSendReceiveInfoAgain = function () {
            ngDialog.close();
        }

        $scope.onDeleteLinePayment = function (){
            var delRow = $scope.paymentGridOption.gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (var i = 0; i < $scope.paymentGridOption.data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope.paymentGridOption.data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope.paymentGridOption.data.splice(i, 1);
                    }
                }
            }
            //重新计算结算佣金
            let amount = 0;
            for (var i = 0; i < $scope.paymentGridOption.data.length; i++) {
                amount = amount + parseFloat($scope.paymentGridOption.data[i].amount);
            }
            $scope.VO.sumReceivefeemount = amount.toFixed(2);
        }

        /**
         * 打印代收/代付客户保险费通知书
         */
        $scope.onPrint = function (raq){
            $scope.raq = raq;
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (rows && rows.length == 1) {
                if(rows[0].clearType == 3){
                    return layer.msg("应收佣金不可以打印！", {
                        shift: 6,
                        icon: 11
                    });
                }
                if(rows[0].clearType == 1 && raq!='daiShou'){
                    return layer.msg("应收保费只可以打印代收客户保险费通知书！", {
                        shift: 6,
                        icon: 11
                    });
                }
                if(rows[0].clearType == 2 && raq!='daiFu'){
                    return layer.msg("解付保费只可以打印解付客户保险费通知书！", {
                        shift: 6,
                        icon: 11
                    });
                }
                layer.load(2);
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: 'view/elifeClearing/printReportChoose.html',
                    className: 'ngdialog-theme-formInfo',
                    scope: $scope,
                    preCloseCallback: function (value) {
                        $scope.queryForGrid($scope.QUERY);
                        layer.load(2);
                        return true;
                    }
                }).then(function (value) {
                    if (value != null) {
                        layer.load(2);
                    }

                }, function (reason) {

                });
            }else {
                return layer.msg("请选择一条数据进行打印！", {
                    shift: 6,
                    icon: 11
                });
            }
        }

        /**
         * 打印报表--业务收入确认书
         */
        $scope.onPrintYeWu = function () {
            $scope.raq = "yeWu";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            if(rows[0].clearType != 3){
                return layer.msg("应收佣金才可以打印！", {
                    shift: 6,
                    icon: 11
                });
            }
            layer.load(2);
            $http.post($rootScope.basePath + "elifeClearing/Print", {data: angular.toJson($scope.VO),raq:$scope.raq,type : "PDF"}).success(function (response) {
                layer.closeAll('loading');
                if(response.code == 200){
                    window.open(getURL(response.queryPath));
                }
            });

        };

        /**
         * 打印报表--发票开具申请书
         */
        $scope.onPrintFaPiao = function () {
            $scope.raq = "fapiao";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            if(rows[0].clearType != 3){
                return layer.msg("应收佣金才可以打印！", {
                    shift: 6,
                    icon: 11
                });
            }
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/elifeClearing/printReportChoose.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                preCloseCallback: function (value) {
                    $scope.queryForGrid($scope.QUERY);
                    layer.load(2);
                    return true;
                }
            }).then(function (value) {
                if (value != null) {
                    layer.load(2);
                }

            }, function (reason) {

            });
        };

        /**
         * 一键自动批单
         */
        $scope.onEndorsement = function (noPaymentMoney,pkClearingB,pk_insurancebill) {
            if(!$scope.isGrid&&$scope.isEdit){
                return layer.msg("保存之后才能点击一键自动批单！", {
                    shift: 6,
                    icon: 11
                });
            }
            if(!noPaymentMoney){
                noPaymentMoney = parseFloat(0);
            }
            $http.post($rootScope.basePath + "elifeClearing/endorsement", {pk: $scope.VO.id,noPaymentMoney: noPaymentMoney,pkClearingB:pkClearingB,pk_insurancebill:pk_insurancebill})
                .success(function (response) {
                    if (response.code == 200) {
                        if(response){
                            if (response.msg) {
                                // e.g. 字符转换为Entity Name
                                response.msg = response.msg.replace(/(\D{1})/g, function(matched) {
                                    var rs = asciiChartSet_c2en[matched];
                                    return rs == undefined ? matched : rs;
                                });
                                layer.msg(response.msg, {shift: 6, icon: 11});
                            }
                        }
                        // layer.msg(response.msg, {shift: 6, icon: 11});
                    }
                });
        }


        /**
         * 作废按钮
         */
        $scope.onInvalid = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            layer.confirm('请确认是否要作废此条数据？', {
                    btn: ['是', '否'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消操作!', {
                            shift: 6,
                            icon: 1
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    $http.post($rootScope.basePath + "elifeClearing/invalid", {pk: rows[0].id})
                        .success(function (response) {
                            if (response.code == 200) {
                                layer.msg('作废成功!', {
                                    shift: 6,
                                    icon: 1
                                });
                            } else {
                                layer.msg('操作失败!', {
                                    shift: 6,
                                    icon: 11
                                });
                            }
                        });
                }
            );
        }

        /**
         * 控制作废按钮
         */
        $scope.isInvalid = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (rows && rows.length == 1) {
                if (rows[0].sapVoucherStatus != null && ($rootScope.SELECT.SAPTYPE[2].id != rows[0].sapVoucherStatus) && 34 ==row[0].billstatus) {
                    return true;
                } else {
                    return false;
                }
            }
            return true;
        }



        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };


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

        $scope.audit = function () {
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
            $scope.form = true;
            $scope.isClear = true;
            $scope.initView();
            $scope.queryPath = 'queryForGrid';
            $scope.VO = $scope.initVO();
            $scope.isGrid = false;
            $scope.isCard = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.isSelect = false;
        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            $scope.queryPath = 'queryForGrid';
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
            $scope.findOne(id);
            $scope.card = true;
            $scope.isBack = true;
            $scope.isGrid = false;
            $scope.isForm = false;
            $scope.form = false;
            $scope.isCard = true;
        };
        $scope.onDelete = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
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
                    var ids = [];
                    for (var i = 0; i < rows.length; i++) {
                        ids.push(rows[i].id);
                    }
                    layer.load(2);
                    $http.post($scope.basePath + "elifeClearing/deleteVo", {ids: angular.toJson(ids)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response.code == 200) {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg(response.msg, {icon: 1 });
                        }
                        if (response.code == 900) {
                            layer.msg(response.msg, {icon: 1 });
                        }
                    });
                }
            );
        };

        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            if($scope.isClear){
                $scope.VO = $scope.initVO();
            }
            $scope.isDisabled = true;
            $scope.isEdit = false;
            $scope.isBack = false;
            $scope.isSelect = false;
        };
        /**
         * 返回
         */
        $scope.onBack = function () {
            if($stateParams.id) {
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
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
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
            $scope.QUERY.id = null;
        };

        /**
         * 初始化参照
         */
        $scope.initView = function () {
            $scope.dealAttachmentBGridOptions.data = [];
            $scope.actualaccountSelectGridOption.data = [];
            $scope.VO.dealattachmentb = [];
            $scope.VO.clearingActualaccountList = [];
        };

        $scope.onAddLine = function () {

            if($scope.VO.clearType == null || $scope.VO.clearType === '' || $scope.VO.fictitiousBusinessType == null || $scope.VO.fictitiousBusinessType === ''){
                return layer.alert("请选择结算类型和业务类型！");
            }

            if($scope.VO.clearType == 1 && $scope.VO.fictitiousBusinessType == 'tra' && ($scope.VO.rechargeType == null || $scope.VO.rechargeType === '')){
                return layer.alert("请选择结算方式！");
            }

            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: "view/elifeClearing/clearingBForm.html",
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
                    if (value instanceof Array) {
                        for (let i = 0; i < value.length; i++) {
                            $scope.insuranceBillGridOption.data.push(value[i]);
                        }
                        $scope.getPaymentList(value);
                    }
                }
            }, function (reason) {

            });
        };
        $scope.onDeleteLineInsuranceBill = function () {
            var delRow = $scope.insuranceBillGridOption.gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (var i = 0; i < $scope.insuranceBillGridOption.data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope.insuranceBillGridOption.data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope.insuranceBillGridOption.data.splice(i, 1);
                    }
                }
            }
            $scope.getPaymentList($scope.insuranceBillGridOption.data);
        };

        $scope.onDeleteLineActualAccount = function () {
            var delRow = $scope.actualaccountSelectGridOption.gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (var i = 0; i < $scope.actualaccountSelectGridOption.data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope.actualaccountSelectGridOption.data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope.actualaccountSelectGridOption.data.splice(i, 1);
                    }
                }
            }
        };

        $scope.onUploads = function () {
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
                    //  第一次初始化成null，后台没值，应该【】
                    if ($scope.dealAttachmentBGridOptions.data) {
                        angular.forEach(value, function (item) {
                            item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });

                    } else {
                        // $scope[selectTabName].data = [];
                        // $scope[selectTabName].data.push(value);
                        angular.forEach(value, function (item) {
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });
                    }


                }
            }, function (reason) {

            });
        };

        $scope.onDownLoads = function () {
            let rows = $scope.VO.dealattachmentb;
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

    };

    $scope.initPage = function () {
        $scope.form = false;
        $scope.card = false;
        $scope.isClear = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;
        $scope.isSelect = false;
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
            exporterCsvFilename: '财务结算.csv',
            columnDefs: [
                {name: 'vbillno', displayName: '结算编号', width: 100,footerCellTemplate: '<div class="ui-grid-cell-contents">合计</div>'},
                {name: 'clearType', displayName: '结算类型', width: 100,cellFilter:'SELECT_MONEYTYPE'},
                {name: 'fictitiousBusinessType', displayName: '业务类型', width: 100, cellFilter:'SELECT_PRODUCTTYPE'},
                {name: 'sumReceivemount', displayName: '应收保费合计', width: 100, cellFilter: 'AMOUNT_FILTER',aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }},
                {name: 'sumPaymount', displayName: '解付保费合计', width: 100, cellFilter: 'AMOUNT_FILTER',aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }},
                {name: 'sumReceivefeemount', displayName: '应收佣金合计', width: 100, cellFilter: 'AMOUNT_FILTER',aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }},
                {name: 'rechargeType', displayName: '结算方式', width: 100, cellFilter: 'SELECT_RECHARGETYPE'},
                {name: 'sapCustomernCode', displayName: '凭证状态', width: 100, cellFilter: 'SELECT_SAPTYPE'},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'createTime', displayName: '制单日期', width: 100,cellFilter:'date:"yyyy-MM-dd"'},
                {name: 'pkChecker.name', displayName: '审核人', width: 100,},
                {name: 'checkDate', displayName: '审核日期', width: 100,},
                {name: 'pkAuditor.name', displayName: '最终审核人', width: 100,},
                {name: 'auditDate', displayName: '最终审核日期', width: 100,},
                {name: 'sapDate', displayName: '到账日期', width: 100,},
            ],
            data: [],

            exporterAllDataFn: function(){
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
                    $scope.VO = row.entity;
                    $scope.findOne($scope.VO.id);
                } else {
                    $scope.chilbTable = false;
                    $scope.VO = $scope.initVO();
                }
            });


        };
        //对账单详细信息
        $scope.insuranceBillGridOption = {
            enableCellEditOnFocus: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '对账单信息.csv',
            columnDefs: [
                {name: 'insuranceinfono', displayName: '对账单信息编号',  enableCellEdit: false},
                {name: 'insuranceno', displayName: '对账单名称', enableCellEdit: false},
                {name: 'amount', displayName: '结算总额（元）', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER'},
                {name: 'insuranceNum', displayName: '包含保单数',enableCellEdit: false},
                {name: 'rechargeType', displayName: '支付方式',enableCellEdit: false, cellFilter: 'SELECT_RECHARGETYPE'},
                {name: 'uploadDate', displayName: '上传日期',enableCellEdit: false},
            ],
            data: $scope.VO.clearingInsuranceList,
            onRegisterApi: function (gridApi) {
                $scope.insuranceBillGridOption.gridApi = gridApi;
                $scope.insuranceBillGridOption.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                $scope.insuranceBillGridOption.gridApi.selection.on.rowSelectionChanged(
                    $scope,function(row,event) {

                });

            }
        };
        //对账单结算收付款
        $scope.paymentGridOption = {
            enableCellEditOnFocus: false,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,//不显示选中框
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '对账单结算收付款信息.csv',
            columnDefs: [
                {name: 'pkCompany.name', displayName: '计划往来对象',  enableCellEdit: false},
                {
                    name: 'pkFactCompany.name',
                    displayName: '实际往来对象',
                    enableCellEdit: true,
                    url: 'customerClearingRefController/queryForGrid',
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'pkFactCompany'
                },
                {name: 'planAmount', displayName: '计划结算金额（元）', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER'},
                {name: 'amount', displayName: '本次结算金额（元）', enableCellEdit: true, cellFilter: 'AMOUNT_FILTER',
                cellEditableCondition: function ($scope, row) {
                    if($scope.row.entity.typeMoneyNo == 3){
                        return true;
                    }else{
                        return false;
                    }
                }},
                {name: 'factDate', displayName: '结算日期', enableCellEdit: false},
                {name: 'sumRechargeRecord', displayName: '消费流水记录数（条）', enableCellEdit: false},
                {name: 'sumInsurance', displayName: '包含保/批单数（份）',enableCellEdit: false},
            ],
            data: $scope.VO.clearingPaymentList,
            onRegisterApi: function (gridApi) {
                $scope.paymentGridOption.gridApi = gridApi;
                $scope.paymentGridOption.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                $scope.paymentGridOption.gridApi.selection.on.rowSelectionChanged(
                    $scope,function(row,event) {
                        var rows = $scope.paymentGridOption.gridApi.selection.getSelectedRows();
                        if (rows.length == 1) {
                            if($scope.VO.rechargeType == 2){
                                $scope.getOrderInfo(row.entity.pkFictitiousPayment);
                            }
                            $scope.getNetInusuanceBill(row.entity.pkFictitiousPayment);
                            $scope.isSelect = true;
                        } else {
                            $scope.orderGridOption.data = [];
                            $scope.netInsuranceBillGridOption.data = [];
                            $scope.isSelect = false;
                        }
                });

                if($scope.paymentGridOption.gridApi.edit){
                    $scope.paymentGridOption.gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        //应收佣金调整本次结算金额后回写主表总金额
                        if ('amount' == colDef.name && $scope.VO.clearType == 3) {
                            for (let i = 0; i < $scope.insuranceBillGridOption.data.length; i++) {
                                if($scope.insuranceBillGridOption.data[i].pkFictitiousInsurance == rowEntity.pkFictitiousInsurance){
                                    $scope.insuranceBillGridOption.data[i].amount = newValue;
                                }
                            }
                            $scope.sumAmount();
                        }
                    });
                }

            }
        };

        //全部银行流水信息
        $scope.actualaccountAllGridOption = {
            enableCellEditOnFocus: false,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,//不显示选中框
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '银行流水信息.csv',
            columnDefs: [
                {name: 'serialnumber', displayName: '银行流水信息编号',  enableCellEdit: false},
                {name: 'reciprocal_account_view', displayName: '对方账户',  enableCellEdit: false},
                {name: 'reciprocal_name.name', displayName: '对方账户名称',  enableCellEdit: false},
                {name: 'transaction_account_view', displayName: '收款账户',  enableCellEdit: false},
                {name: 'transaction_name.unitname', displayName: '收款账户名称',  enableCellEdit: false},
                {name: 'lender_amount', displayName: '贷方金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER'},
                {name: 'transaction_date', displayName: '转入时间',  enableCellEdit: false},
                {name: 'abstract', displayName: '备注',  enableCellEdit: false},
            ],
            data: [],
            onRegisterApi: function (gridApi) {
                $scope.actualaccountAllGridOption.gridApi = gridApi;
                $scope.actualaccountAllGridOption.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                $scope.actualaccountAllGridOption.gridApi.selection.on.rowSelectionChanged(
                    $scope,function(row,event) {
                        let rows = $scope.actualaccountAllGridOption.gridApi.selection.getSelectedRows();
                        if(rows.length > 0){
                            for (let i = 0; i < rows.length; i++) {
                                //判断已选择银行流水中是否已经选择该流水
                                if($scope.isSelectActualAccount(rows[i])){
                                    let vo = {
                                        pkActualaccount : rows[i].id,
                                        serialnumber : rows[i].serialnumber,
                                        reciprocalAccount : rows[i].reciprocal_account_view,
                                        reciprocalName : rows[i].reciprocal_name.name,
                                        transactionAccount : rows[i].transaction_account_view,
                                        transactionName : rows[i].transaction_name.unitname,
                                        lenderAmount : rows[i].lender_amount,
                                        transactionDate : rows[i].transaction_date,
                                        digest : rows[i].abstract,
                                        dr : 0
                                    };
                                    if($scope.actualaccountSelectGridOption.data == null){
                                        $scope.actualaccountSelectGridOption.data = [];
                                    }
                                    $scope.actualaccountSelectGridOption.data.push(vo);
                                }
                            }
                        }
                    });
            }
        };


        //已选择银行流水信息
        $scope.actualaccountSelectGridOption = {
            enableCellEditOnFocus: false,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,//不显示选中框
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '银行流水信息.csv',
            columnDefs: [
                {name: 'serialnumber', displayName: '银行流水信息编号',  enableCellEdit: false},
                {name: 'reciprocalAccount', displayName: '对方账户',  enableCellEdit: false},
                {name: 'reciprocalName', displayName: '对方账户名称',  enableCellEdit: false},
                {name: 'transactionAccount', displayName: '收款账户',  enableCellEdit: false},
                {name: 'transactionName', displayName: '收款账户名称',  enableCellEdit: false},
                {name: 'lenderAmount', displayName: '贷方金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER'},
                {name: 'transactionDate', displayName: '转入时间',  enableCellEdit: false},
                {name: 'digest', displayName: '备注',  enableCellEdit: false},
            ],
            data: $scope.VO.clearingActualaccountList,
            onRegisterApi: function (gridApi) {
                $scope.actualaccountSelectGridOption.gridApi = gridApi;
                $scope.actualaccountSelectGridOption.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                $scope.actualaccountSelectGridOption.gridApi.selection.on.rowSelectionChanged(
                    $scope,function(row,event) {

                    });

            }
        };

        //订单信息
        $scope.orderGridOption = {
            enableCellEditOnFocus: false,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: false,//不显示选中框
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '订单信息.csv',
            columnDefs: [
                {name: 'rechargeNo', displayName: '充值流水号',  enableCellEdit: false},
                {name: 'rechargeAmount', displayName: '充值金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER'},
                {name: 'payment', displayName: '本次消费金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER'},
                {name: 'balance', displayName: '剩余金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER'},
            ],
            data: [],
            onRegisterApi: function (gridApi) {
                $scope.orderGridOption.gridApi = gridApi;
                $scope.orderGridOption.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                $scope.orderGridOption.gridApi.selection.on.rowSelectionChanged($scope,function(row,event) {

                });

            }
        };
        //小保单信息
        $scope.netInsuranceBillGridOption = {
            enableCellEditOnFocus: false,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: false,//不显示选中框
            showColumnFooter: false,
            useExternalPagination: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '小保单信息.csv',
            columnDefs: [
                {name: 'insuranceno', displayName: '保单号',  enableCellEdit: false},
                {name: 'stages', displayName: '本期期数',  enableCellEdit: false},
                {name: 'planMoney', displayName: '本期结算金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER'},
                {name: 'startDate', displayName: '保单起始时间',  enableCellEdit: false},
                {name: 'endDate', displayName: '保单结束时间',  enableCellEdit: false},
                {name: 'payMode', displayName: '支付方式',  enableCellEdit: false, cellFilter: 'SELECT_PAYMODE'},
            ],
            data: [],
            onRegisterApi: function (gridApi) {
                $scope.netInsuranceBillGridOption.gridApi = gridApi;
                $scope.netInsuranceBillGridOption.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                $scope.netInsuranceBillGridOption.gridApi.selection.on.rowSelectionChanged($scope,function(row,event) {

                });

            }
        };
        //附件
        $scope.dealAttachmentBGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},
                {
                    name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                },
                {
                    name:'pk_project_id',
                    displayName:' ',
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ng-click="grid.appScope.onPreviewFile(row.entity.pk_project_id,row.entity.attachment_name)" class="btn btn-transparent btn-xs tooltips" tooltip-placement="top">在线预览&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i></a></div>'
                }
            ],
            data: $scope.VO.dealattachmentb,
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

        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }

    };

    //实体类审批流配置
    $scope.ifEntity = "true";
    $scope.entityVO = "lr.insurance.entity.FictitiousClearingEntity";
    $scope.funCode = '903';
    $scope.table_name = "t_fictitious_clearing";
    $scope.billdef = "FictitiousClearing";
    $scope.beanName = "elifeclearingservice";
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
app.controller('clearingBCtrls', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {

    /**
     * 初始化页面变更方法
     */
    $scope.initQUERYChildren = function () {
        return {
            insuranceinfono: null,
            projectName: null,
            clearType: $scope.$parent.VO.clearType,
            rechargeType: $scope.$parent.VO.rechargeType,
            fictitiousBusinessType: $scope.$parent.VO.fictitiousBusinessType,
        }
    };
    $scope.QUERYCHILDREN = $scope.initQUERYChildren();

    $scope.initData = function () {
        $scope.VO.reportChildren = [];
        $scope.clearingBGridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            useExternalPagination: true,
            columnDefs: [
                {name: 'insuranceinfono', displayName: '对账单信息编号'},
                {name: 'insuranceno', displayName: '对账单名称'},
                {name: 'insuranceNum', displayName: '包含保单总数'},
                {name: 'projectName', displayName: '项目名称'},
                {name: 'insuranceManName', displayName: '保险公司'},
                {name: 'amount', displayName: '结算金额'},
                {name: 'uploadDate', displayName: '制单时间'},
            ],
            data: $scope.VO.reportChildren
        };
        $scope.clearingBGridOptions.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
            //添加行头
            $scope.gridApi.core.addRowHeaderColumn({
                name: 'rowHeaderCol',
                displayName: '',
                width: 30,
                cellTemplate: 'ui-grid/rowNumberHeader'
            });

            if(null!= gridApi.pagination){
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    $scope.gridApi.page = newPage;
                    $scope.gridApi.pageSize = pageSize;
                    $scope.queryForGridChildren($scope.QUERYCHILDREN);
                });
            }
        };
    };


    $scope.queryForGridChildren = function (data) {
        if (!$scope.queryData) {
            $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.clearingBGridOptions.columnDefs;
        }
        layer.load(2);

        //查询过滤已选择保单
        if ($scope.$parent.insuranceBillGridOption.data != null && $scope.$parent.insuranceBillGridOption.data.length > 0){
            let ids = [];
            for (let i = 0; i < $scope.$parent.insuranceBillGridOption.data.length; i++) {
                ids.push($scope.$parent.insuranceBillGridOption.data[i].pkFictitiousInsurance);
            }
            data.ids = ids;
        }
        $http.post($scope.basePath + 'webInsurance/getInsuranceForClearing', {
            data: angular.toJson(data)
        }).success(function (response) {
            if (response.code == 200) {
                $scope.clearingBGridOptions.data = response.data;
                $scope.clearingBGridOptions.totalItems = response.data.length;
            }
            layer.closeAll('loading');
        });
    };
    $scope.onQueryChildren = function () {
        $scope.queryForGridChildren($scope.QUERYCHILDREN);
    };
    $scope.onResetChildren = function () {
        $scope.QUERYCHILDREN = $scope.initQUERYChildren();
    };

    $scope.initFunction = function () {

        $scope.onSave = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            //新增
            $scope.$parent.confirm(rows);
            ngDialog.close();
        };
        $scope.onCancel = function () {
            ngDialog.close($scope.ngDialogId);
        };
    };
    $scope.initData();
    $scope.initFunction();
});
/**
 *  打印 弹窗
 */
app.controller('printReportChooseCtrl', ['$rootScope', '$scope', '$sce', '$http', 'ngDialog', '$state', '$stateParams', 'ngVerify', function ($rootScope, $scope, $sce, $http, ngDialog, $state, $stateParams, ngVerify) {

    /**
     * 初始化页面变更方法
     */
    var initPage = function () {
        $scope.pVO = {};
        $scope.pVO.pay_date = $rootScope.workDate;
        $scope.pVO.charge_date = $rootScope.workDate;

        $scope.onCancels = function () {
            ngDialog.close();
        };

        $scope.onResets = function () {
            $scope.pVO.pay_date = '';
            $scope.pVO.charge_date = '';
            $scope.pVO.billno = '';
            $scope.pVO.account_no = '';
        };

        $scope.onSaves = function () {
                $http.post($rootScope.basePath + 'elifeClearing/PrintCommon', {
                    data: angular.toJson($scope.$parent.VO),
                    raq: $scope.$parent.raq,
                    type: "PDF",
                    query: angular.toJson($scope.pVO)
            }, {responseType: 'arraybuffer'}).success(function (response) {
                let resBlob = new Blob([response]);
                let reader = new FileReader();
                reader.readAsText(resBlob, "utf-8");
                reader.onload = () => {
                    if (!reader.result.startsWith("%PDF")) {
                        let res = JSON.parse(reader.result);
                        if (res.code && res.code == 500) {
                            return layer.alert(res.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    var files = new Blob([response], {type: "application/pdf", filename: $scope.$parent.VO.vbillno});
                    var fileURL = URL.createObjectURL(files);
                    $scope.content = $sce.trustAsResourceUrl(fileURL);
                    $scope.type = "application/pdf";
                    ngDialog.openConfirm({
                        showClose: true,
                        closeByDocument: true,
                        template: 'pdfView.html',
                        className: 'ngdialog-theme-formInfo',
                        controller: 'pdfViewCtrl',
                        scope: $scope,
                        preCloseCallback: function (value) {
                            if (value && value == "clear") {
                                //重置
                                return false;
                            }
                            //取消
                            return true;
                        }
                    })
                }
                });
            // }

        };

        $scope.initForm = function () {
            if ($scope.$parent.raq == 'daiShouUp' || $scope.$parent.raq == 'daiShouDn') {
                $scope.isPdateShow = true;
                $scope.isCdateShow = true;
                $scope.isBillShow = true;
                $scope.isBankShow = true;
            } else if ($scope.$parent.raq == 'jieFu') {
                $scope.isPdateShow = true;
                $scope.isCdateShow = true;
                $scope.isBillShow = false;
                $scope.isBankShow = false;
            } else if ($scope.$parent.raq == 'daiShou'
                || $scope.$parent.raq == 'daiFu'
                || $scope.$parent.raq == 'fapiao') {
                $scope.isPdateShow = true;
                $scope.isCdateShow = false;
                $scope.isBillShow = false;
                $scope.isBankShow = false;

            }

        };

        $scope.getTitle1 = function () {
            if ($scope.$parent.raq == 'daiShouUp' || $scope.$parent.raq == 'daiShouDn') {
                return "向保险公司支付日期"
            } else if ($scope.$parent.raq == 'jieFu') {
                return "合同约定付款日期"
            } else if ($scope.$parent.raq == 'daiShou') {
                return "到账日期"
            } else if ($scope.$parent.raq == 'daiFu') {
                return "付款日期"
            } else if ($scope.$parent.raq == 'fapiao') {
                return "发票开具日期"
            }
        };

        $scope.getTitle2 = function () {
            if ($scope.$parent.raq == 'daiShouUp' || $scope.$parent.raq == 'daiShouDn') {
                return "申请划回日期"
            } else if ($scope.$parent.raq == 'jieFu') {
                return "代收客户保费到期日期"
            }
        };
    };

    initPage();
    $scope.initForm();
}]);
