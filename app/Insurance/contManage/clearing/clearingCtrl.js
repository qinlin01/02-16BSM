/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('clearingCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $state, $window) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                clearingB: [],
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkCorp: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                sapCustomernCode: 0,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                pkBilltype: '_9',
                billstatus: 31,
                dr: 0,
                voperatorid: $rootScope.userVO,
                vbillstatus: 0,
                billstatus: $rootScope.SELECT.BILLSTATUS[30].id,
                costscale: [],
                economicContract: '',
                factActualcollection: '',
                ifEpay: 'N',
                coomedium: [],
                payTypeDetail: [],
                bankFlow: [],
                amount_money: 0,
                ifAdvance : 'N',
                advancePremiums: [],
            };
        };
        $scope.entityVO = 'nc.vo.busi.ClearingVO';
        //主表数据
        $scope.VO = $scope.initVO();
        //子表已选择数据主键
        $scope.childrenId = [];
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "operate_year": parseInt(new Date().format("yyyy")),
                "id": $stateParams.id,
                "dr": 0,
                "isRelife^is": "null",

            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode = '307';

        $scope.advancePremiumsParam = {
            "billstatus": 34,
            "sap_customern_code": 3,
            "sap_customern_code": 3,
            "no_payment_money0_0gt": 0,
            "advance_no": null,
            "account_statement0_0Ref_[0].lender_amount": null,
            "account_statement0_0Ref_[0].reciprocal_account": null,
        };

    };
    $scope.param = {
        pkOrg: $rootScope.pkOrg
    };
    $scope.economicContractRef =
        {
            id: $scope.$id,
            columnDefs: [
                {
                    field: 'CONTRACTNUMBER',
                    displayName: '合同编号'
                },
                {
                    field: 'CONTRACTNAME',
                    displayName: '合同名称'
                }
            ],
            data: ""
        };
    $scope.caibSapCostCenterRef = {
        id: $scope.$id,
        columnDefs: [
            {
                field: 'CODE',
                displayName: '客户编号'
            },
            {
                field: 'NAME',
                displayName: '客户名称'
            }
        ],
        data: ""
    }
    $scope.initHttp = function () {

        //再次向财务管控发起请求
        $scope.sendReceiveInfoAgain = function (vo){
            layer.load(2);
            $http.post($rootScope.basePath + "clearingAudit/sendReceiveInfoAgain", {data: angular.toJson(vo),clearingAuditSource: 1}).success(function (response) {
                if(response && response.code == 200){
                    layer.alert("再次请求成功！")
                }else{
                    layer.alert("再次请求失败！")
                }
                layer.closeAll('loading');
            });
        }

        $scope.findSapCustomer = function (name){

            if(($scope.VO.inoutType == 1 && $scope.VO.sumReceivemount < 0) || $scope.VO.inoutType == 2){
                let param = {name:name};
                layer.load(2);
                $http.post($scope.basePath + "sapCustomerRef/findOne", {data:angular.toJson(param)}).success(function (response) {
                    if (response.code == 200) {
                        $scope.VO.sapCustomer=response.data;
                    }
                    layer.closeAll('loading');
                });
            }
        }

        /**
         * 查询预收保费单据
         */
        $scope.queryAdvancePremiumsInfo = function(){
            layer.load(2);
            $http.post($scope.basePath + "advancePremiums/queryForGrid", {
                params: angular.toJson($scope.advancePremiumsParam),
                current: 1,
                size: 10000,
            }).success(function (response) {
                for (let i = 0; i < response.data.records.length; i++) {
                    response.data.records[i].noPaymentMoneyCal = response.data.records[i].noPaymentMoney;
                }
                $scope.advancePremiumsInfoGridOptions.data = response.data.records;
                $scope.advancePremiumsInfoGridOptions.totalItems = response.data.total;
                layer.closeAll('loading');
            });
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
                    form.append('data',angular.toJson($scope.VO))
                    $http({
                        method: 'POST',
                        url: $scope.basePath + 'clearing/bulkClearing',
                        data: form,
                        headers: {'Content-Type': undefined, 'x-auth-token': window.sessionStorage.getItem("token")},
                        transformRequest: angular.identity
                    }).success(function (data) {
                        if (data.code == 200) {
                            //解决不能二次上传的问题
                            var obj = document.getElementById('inputFile');
                            obj.outerHTML = obj.outerHTML;
                            //处理返回的数据
                            layer.alert(data.msg, {skin: 'layui-layer-lan',closeBtn: 1});
                            angular.assignData($scope.VO, data.data);
                            $scope.clearingBGridOptions.data = $scope.VO.clearingB;
                            let array = $scope.clearingBGridOptions.data;
                            $scope.tableStatus(array);
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

        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data) {
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.basePath + "clearing/queryAllForGrid", {
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
            $http.post($scope.basePath + "clearing/queryForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response.code == 200) {
                    if (!$scope.query) {
                        $scope.query = $scope.gridOptions.columnDefs;
                    }
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            });
        };
        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "clearing/findOne", {pk: pk})
                .success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    if (callback) {
                        callback();
                    }

                    angular.assignData($scope.VO, response.result);
                    //导出数据保单号科学计数法
                    let arrayClearB = $scope.VO.clearingB;
                    for (let i = 0; i <arrayClearB.length ; i++) {
                        let clearingBElement = arrayClearB[i];
                        clearingBElement.pkInsurancebill.name = clearingBElement.pkInsurancebill.name+'\xa0';
                    }
                    $scope.clearingBGridOptions.data = $scope.VO.clearingB;
                    var array = $scope.clearingBGridOptions.data;
                    $scope.tableStatus(array);
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
            $scope.VO.bankFlow = $scope.clearingGridOptions.data;
            $scope.VO.clearingB = $scope.clearingBGridOptions.data;
            if ($scope.VO.factActualcollection) {
                let array = $scope.VO.clearingB;
                for (let i = 0; i < array.length; i++) {
                    array[i].cAccount = $scope.VO.factActualcollection.accNum;
                    array[i].cBank = $scope.VO.factActualcollection.accBlank;
                    array[i].factActualcollection = $scope.VO.factActualcollection;
                }
            }

            $http.post($rootScope.basePath + "clearing/save", {data: angular.toJson($scope.VO), funCode: $scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
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
                            if ($scope.isDelay == true) {
                                layer.alert("保存成功！已生成暂存的延迟录入签报，请前往业务签报页面完成签报提交及审批流程!如处理完成请提交！", {
                                    skin: 'layui-layer-lan',
                                    closeBtn: 1
                                });
                            } else {
                                layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
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
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function (item) {
            if (item && item.id) {
                $scope.onCard(item.id);
            }
        };
        $scope.tableStatus = function (array) {
            if (array.length > 0) {
                $scope.VO.matching_money = 0;
                $scope.VO.typeMoney = null;
                let i = 0;
                $scope.VO.typeMoney = array[i].typeMoney;
                    if (array[i].typeMoney != null && array[i].typeMoney == "应收保费") {
                    if ($scope.isEdit) {
                        $scope.getClearing();
                    }
                }
            }
        }

        $scope.getClearing = function (id) {
            $http.post($scope.basePath + "subscription/lockClearing", {
                lock: "",
                unlock: angular.toJson($scope.clearingGridOptions.data)
            }).success(function (response) {
            });
            let param = {
                actualAccountDate: $scope.VO.actualAccountDate,
                queryAmount: $scope.VO.queryAmount,
                querylenderAmount: $scope.VO.querylenderAmount,
                queryName: $scope.VO.queryName,
                id: id,
                pkorg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                acountType: "2,5"
            }

            $http.post($scope.basePath + "subscription/getClearing",
                {
                    params: angular.toJson(param)
                }).success(function (response) {
                if (response && response.code == "200") {
                    // angular.assignData($scope.VO, response.result);
                    $scope.subscriptionGridOptions.data = response.clearingList;
                    if ($scope.clearingGridOptions.data.length == 0) {
                        $scope.clearingGridOptions.data = new Array();
                    }
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
                }
            });
        };


        $scope.findFactName = function (pks) {
            $http.post($scope.basePath + "customerClearingRefController/findOne", {pk: pks}).success(function (response) {
                if (response && response.code == "200") {
                    if (response.result) {
                        // 2022-07-21 mx 银行账户信息
                        if (response.result.account != null && response.result.account.length > 0){
                            var  accountNewArray = new Array();
                            for (let j = 0; j < response.result.account.length; j++) {
                                let accountArray = response.result.account[j];
                                if (accountArray.accType != "" && accountArray.accType != null){
                                    if ($scope.VO.inoutType == accountArray.accType){
                                        accountNewArray.push(accountArray);
                                    }
                                }else {
                                    accountNewArray.push(accountArray);
                                }
                            }
                            if(accountNewArray != null && accountNewArray.length > 0){
                                if (accountNewArray.length==1){
                                    $scope.VO.factActualcollection.cBank = accountNewArray[0].accBlank;
                                    $scope.VO.factActualcollection.cAccount = accountNewArray[0].accNum;
                                    $scope.VO.factActualcollection.jointBankNum = accountNewArray[0].jointBankNum;
                                }else{
                                    $scope.accountOptions.data = accountNewArray;
                                    ngDialog.openConfirm({
                                        showClose: true,
                                        closeByDocument: false,
                                        template: 'view/clearing/choseAccount.html',
                                        className: 'ngdialog-theme-formInfo',
                                        scope: $scope,
                                        preCloseCallback: function (value) {

                                            return true;
                                        }
                                    }).then(function (value) {

                                    }, function (reason) {

                                    });
                                }
                            }else{
                                accountNewArray = "";
                            }
                        }
                        // 同时更新结算子表
                        let array = $scope.VO.clearingB;
                        $scope.VO.factActualcollection = response.result;
                        for (let i = 0; i < array.length; i++) {
                            if (array[i].factActualcollection == null || array[i].factActualcollection == "") {
                                array[i].factActualcollection = response.result;
                            } else {
                                array[i].factActualcollection.name = response.result.name;
                                array[i].factActualcollection.c1Institution = response.result.c1Institution;
                                array[i].factActualcollection.c_1_phone = response.result.c_1_phone;
                                array[i].factActualcollection.c_0_address = response.result.c_0_address;
                            }
                        }
                        $scope.VO.clearingB = array;
                    }
                }
            });
        };
    };

    $scope.initWatch = function () {

        // 预收保费查询条件
        $scope.$watch('advancePremiumsParam["advance_no"]', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.queryAdvancePremiumsInfo();
            }
        });
        $scope.$watch('advancePremiumsParam["account_statement0_0Ref_[0].lender_amount"]', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.queryAdvancePremiumsInfo();
            }
        });
        $scope.$watch('advancePremiumsParam["account_statement0_0Ref_[0].reciprocal_account"]', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.queryAdvancePremiumsInfo();
            }
        });

        // 是否预收
        $scope.$watch('VO.ifAdvance', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if($scope.VO.ifAdvance == 'Y'){
                    //已选流水子表清空
                    $scope.clearingGridOptions.data = [];
                    //收付款数量不等于一条的话清空
                    if($scope.clearingBGridOptions.data.length != 1){
                        $scope.clearingGridOptions.data = [];
                        $scope.clearingBGridOptions.data = [];
                        $scope.VO.clearingB = [];
                    }
                    $scope.queryAdvancePremiumsInfo();
                }else{
                    $scope.advancePremiumsInfoGridOptions.data = [];
                    $scope.advancePremiumsGridOptions.data = [];
                }
            }
        });
        // 付款单位名称
        $scope.$watch('VO.factActualcollection.name', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                let pks = $scope.VO.factActualcollection.pk;
                if (pks != null) {
                    $scope.findFactName(pks);
                    //获取相对应的财务客商
                    $scope.findSapCustomer($scope.VO.factActualcollection.name);
                }
            }
        });
        $scope.$watch('VO.productType', function (newVal, oldVal) {
            var pkInsurancebill = null;
            $scope.VO.payTypeDetail = [];
            $scope.feeGridOptions.data = [];
            for (let i = 0; i < $scope.VO.clearingB.length; i++) {
                var clearB = $scope.VO.clearingB[i];
                if (clearB.typeMoney == "应收保费") {
                    pkInsurancebill = clearB.pkInsurancebill.pk
                }
            }
            if (pkInsurancebill != null) {
                // 如果是津惠保，带出手续费
                if ($scope.VO.productType == 0) {
                    layer.load(2);
                    $http.post($scope.basePath + "gLifeInsurance/findOne", {pk: pkInsurancebill}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.VO.payTypeDetail = response.result.payTypeDetail;
                            $scope.feeGridOptions.data = response.result.payTypeDetail;
                        }
                    });
                }
            }
        });
        $scope.$watch('VO.actualAccountDate', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.getClearing();
            }
        }, true);
        $scope.$watch('VO.querylenderAmount', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.getClearing();
            }
        }, true);
        $scope.$watch('VO.queryName', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.getClearing();
            }
        }, true);
        $scope.$watch('VO.inoutType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {

                if ( newVal != null && newVal != 1) {
                    if ((newVal == 3 || newVal == 4 )) {
                        $scope.contactInformation = false;
                        $scope.showInformation = true;
                        $scope.contactproject = false;
                        $scope.showSubscription = false;
                    } else {
                        $scope.contactInformation = true;
                        $scope.showInformation = false;
                        $scope.contactproject = false;
                        $scope.showSubscription = false;
                    }
                } else if (newVal != null && newVal == 1) {
                    // $scope.VO.matching_money = $scope.VO.matching_money + Number.parseFloat(array[i].factMoney);
                    $scope.contactproject = false;
                    $scope.contactInformation = false;
                    $scope.showInformation = false;
                    $scope.showSubscription = true;
                    $scope.getClearing();
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
                template: getURL('insurance/view/clearing/sendReceiveInfoAgain.html'),
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
            if($scope.VO.factActualcollection.jointBankNum==null || $scope.VO.factActualcollection.jointBankNum==""){
                return layer.alert("请填写银行联行号！");
            }
            if($scope.VO.factActualcollection.accNum==null || $scope.VO.factActualcollection.accNum==""){
                return layer.alert("请填写银行卡号！");
            }
            if($scope.VO.factActualcollection.accBlank==null || $scope.VO.factActualcollection.accBlank==""){
                return layer.alert("请填写开户银行！");
            }
            let vo = {
                id:$scope.VO.id,
                jointBankNum:$scope.VO.factActualcollection.jointBankNum,
                accNum:$scope.VO.factActualcollection.accNum,
                accBlank:$scope.VO.factActualcollection.accBlank
            }
            $scope.sendReceiveInfoAgain(vo);
            ngDialog.close();
        }
        $scope.onCancelSendReceiveInfoAgain = function () {
            ngDialog.close();
        }

		//2022-07-21 mx 新增确定按钮
        $scope.onChonseBusiType = function (){
            var rows = $scope.accountOptions.gridApi.selection.getSelectedRows();
            if(rows && rows.length == 1){
                $scope.VO.factActualcollection.accNum = rows[0].accNum;
                $scope.VO.factActualcollection.accBlank = rows[0].accBlank;
                $scope.VO.factActualcollection.jointBankNum = rows[0].jointBankNum;
                ngDialog.close();
            }else {
                layer.alert("只能选择一条银行账户信息!", {skin: 'layui-layer-lan', closeBtn: 1});
            }
        }
		//取消按钮
        $scope.onCancelBusiType = function (){
            ngDialog.close();
        }

        /**
         * 批量结算
         */
        $scope.onAddBulk = function (){

            if($scope.VO.inoutType == null || $scope.VO.inoutType == ''){
                return layer.alert('请选择收付款类型！', {skin: 'layui-layer-lan',closeBtn: 1});
            }

            var inputFile = $('#inputFile');
            inputFile.click();
        };

        /**
         * 一键自动批单
         */
        $scope.onEndorsement = function (noPaymentMoney, pkClearingB, pk_insurancebill) {
            if (!$scope.isGrid && $scope.isEdit) {
                return layer.msg("保存之后才能点击一键自动批单！", {
                    shift: 6,
                    icon: 11
                });
            }
            if (!noPaymentMoney) {
                noPaymentMoney = parseFloat(0);
            }
            $http.post($rootScope.basePath + "clearing/endorsement", {
                pk: $scope.VO.id,
                noPaymentMoney: noPaymentMoney,
                pkClearingB: pkClearingB,
                pk_insurancebill: pk_insurancebill
            })
                .success(function (response) {
                    if (response.code == 200) {
                        if (response) {
                            if (response.msg) {
                                // e.g. 字符转换为Entity Name
                                response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
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
                    $http.post($rootScope.basePath + "clearing/invalid", {pk: rows[0].id})
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
                if (rows[0].sapVoucherStatus != null && ($rootScope.SELECT.SAPTYPE[2].id != rows[0].sapVoucherStatus) && 34 == row[0].billstatus) {
                    return true;
                } else {
                    return false;
                }
            }
            return true;
        }


        /**
         * 关闭收付款
         */
        $scope.onClosePayment = function () {
            $scope.form = true;
            $scope.initView();
            $scope.queryPath = 'queryForGridByClose';
            $scope.childrenId = [];
            $scope.onAddLine(function () {
            }, "clearingBGridOptions");

        }

        /**
         * 开启收付款
         */
        $scope.onOpenPayment = function () {
            $scope.form = true;
            $scope.initView();
            $scope.queryPath = 'queryForGridByOpen';
            $scope.childrenId = [];
            angular.assignData($scope.VO, $scope.initVO());
            $scope.onAddLine(function () {
            }, "clearingBGridOptions");
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
            $scope.queryPath = 'queryForGrids';
            $scope.childrenId = [];
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;

        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            $scope.queryPath = 'queryForGrids';
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
            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {
                pk: id,
                tableName: $scope.table_name,
                billdef: $scope.billdef
            }).success(function (response) {
                if (response && response.code == "200") {
                    $scope.card = true;
                    angular.assignData($scope.VO, response.result);
                    $scope.clearingBGridOptions.data = $scope.VO.clearingB;
                    var array = $scope.clearingBGridOptions.data;
                    $scope.tableStatus(array);
                    //针对卡片页面的数据为应收佣金类型，显示开票信息
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
                }
            });
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
                    $http.post($scope.basePath + "clearing/delete", {ids: angular.toJson(ids)}).success(function (response) {
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

        /*
         * 关联
         * */
        $scope.onLink = function () {

        };

        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            if ($scope.isClear) {
                $scope.VO = $scope.initVO();
            }
            $scope.clearingBGridOptions.data = [];
            $scope.isDisabled = true;
            $scope.isEdit = false;
            $scope.isBack = false;
            $scope.contactInformation = false;
            $scope.showInformation = false;
            $scope.contactproject = false;
            $scope.showSubscription = false;
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
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    if ($scope.clearingBGridOptions.data.length != 0) {
                        for (var i = 0; i < $scope.clearingBGridOptions.data.length; i++) {
                            if (($scope.clearingBGridOptions.data[i].typeMoney == "应收佣金" || $scope.clearingBGridOptions.data[i].typeMoney == "应收咨询费" || $scope.clearingBGridOptions.data[i].typeMoney == "应收公估费")) {
                                if ($scope.VO.factActualcollection.name == null && $scope.VO.factActualcollection.name == "") {
                                    return layer.alert("请选择付款单位名称!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (!$scope.clearingBGridOptions.data[i].economicContract || !$scope.clearingBGridOptions.data[i].economicContract.code) {
                                    return layer.alert("请选择经法合同信息!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }
                            if (!($scope.clearingBGridOptions.data[i].typeMoney == "应收保费") && $scope.VO.accNum != null && $scope.VO.accNum.length > 50) {
                                return layer.alert("银行卡号不能超过50位!", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (!$scope.clearingBGridOptions.data[i].c0Name) {
                                return layer.alert("计划来往对象不能为空!", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if ($scope.clearingBGridOptions.data[i].typeMoney == "应收保费") {
                                if (!$scope.VO.matching_money || $scope.VO.matching_money == 0) {
                                    return layer.alert("本次结算金额不能为0，请双击结算子表中“本次结算”信息，重新计算金额！", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if ($scope.VO.matching_money > 0) {
                                    if (!$scope.VO.amount_money || Math.abs(Number.parseFloat($scope.VO.matching_money) - Number.parseFloat($scope.VO.amount_money)).toFixed(2) > 0.02) {
                                        return layer.alert("已选到账金额与本次结算金额不一致，请修改本次结算金额！", {skin: 'layui-layer-lan', closeBtn: 1});
                                    }
                                }
                                if($scope.VO.ifAdvance == 'Y'){
                                    for (let j = 0; j < $scope.advancePremiumsGridOptions.data.length; j++) {
                                        if(Number.parseFloat($scope.advancePremiumsGridOptions.data[i].noPaymentMoney) - Number.parseFloat($scope.advancePremiumsGridOptions.data[i].clearingMoney) < 0){
                                            return layer.alert("已选到账金额中的匹配金额不可大于可用金额！", {skin: 'layui-layer-lan', closeBtn: 1});
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if ($scope.VO.billstatus == 37) {
                        $scope.VO.billstatus = 31;
                    }
                    //津惠宝校验子表
                    if ($scope.VO.productType == 0) {
                        if ($scope.VO.payTypeDetail && $scope.feeGridOptions.data) {
                            for (let i = 0; i < $scope.feeGridOptions.data.length; i++) {
                                if ((!$scope.feeGridOptions.data[i].fee) || (!$scope.feeGridOptions.data[i].company)) {
                                    return layer.alert($scope.feeGridOptions.data[i].name + "的手续费或实际往来对象不可为空！",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }
                        } else {
                            return layer.alert("津惠宝支付方式子表不可为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    $scope.onSaveVO();
                }
            }, true)
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

        };

        $scope.getGridTemplate = function (selecttabName) {
            // var selectTabName = $scope.selectTabName;
            var template = "";
            if (selecttabName == 'clearingBGridOptions') {
                template = 'view/clearing/clearingBForm.html';
            }
            return template;
        };

        /**
         * 子表新增
         */
        $scope.onAddLine = function (callback, selecttabName) {

            if($scope.VO.inoutType == null || $scope.VO.inoutType == ''){
                return layer.alert('请选择收付款类型！', {skin: 'layui-layer-lan',closeBtn: 1});
            }

            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: $scope.getGridTemplate(selecttabName),
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
                        $http.post($rootScope.basePath + "clearing/addPanment", {
                            data: angular.toJson(value),
                            voList: angular.toJson($scope.VO)
                        })
                            .success(function (response) {
                                if (response) {
                                    //如果是预收保费类型，只能选择一条结算信息
                                    if($scope.VO.ifAdvance == 'Y' && $scope.VO.inoutType == 1){
                                        if(response.result.clearingB.length > 1){
                                            return layer.alert("预收保费时只能选择一条收付款信息！");
                                        }
                                    }
                                    angular.assignData($scope.VO, response.result);
                                    $scope.clearingBGridOptions.data = response.result.clearingB;
                                    let array = $scope.clearingBGridOptions.data;
                                    $scope.tableStatus(array);
                                }
                            });
                    } else {
                        $scope[$scope.selectTabName].data.push(value);
                    }
                    if (callback) {
                        callback();
                    }
                }
            }, function (reason) {

            });
        };
        /**
         * 子表删除
         */
        $scope.onDeleteLine = function (selectTable) {
            if(selectTable){
                var delRow = $scope[selectTable].gridApi.selection.getSelectedRows();
                if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                for (var i = 0; i < $scope[selectTable].data.length; i++) {
                    for (var j = 0; j < delRow.length; j++) {
                        if ($scope[selectTable].data[i].$$hashKey == delRow[j].$$hashKey) {
                            $scope[selectTable].data.splice(i, 1);
                        }
                    }
                }
                return ;
            }
            var delRow = $scope['clearingBGridOptions'].gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (var i = 0; i < $scope['clearingBGridOptions'].data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope['clearingBGridOptions'].data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope['clearingBGridOptions'].data.splice(i, 1);
                    }
                }
            }
            for (var i = 0; i < $scope.childrenId.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope.childrenId.indexOf(delRow[j].childId) != -1) {
                        $scope.childrenId.splice(i, 1);
                    }
                }
            }
            $scope.VO.clearingB = $scope.clearingBGridOptions.data;
            $http.post($rootScope.basePath + "clearing/childTableValueChanged", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    if (response) {
                        $scope.VO.sumReceivemount = response.result.sumReceivemount;
                        $scope.VO.sumPaymount = response.result.sumPaymount;
                        $scope.VO.sumReceivefeemount = response.result.sumReceivefeemount;
                        $scope.VO.sumConsult = response.result.sumConsult;
                        $scope.VO.sumEvaluationfee = response.result.sumEvaluationfee;
                        $scope.clearingBGridOptions.data = response.result.clearingB;
                    }
                });

        };

        /**
         * 打印报表--代收客户保险费上划通知书
         */
        $scope.onPrintDaiDn = function () {
            $scope.raq = "daiShouUp";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return layer.alert("请至少选择一条单据进行打印!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
                if(rows[i].inoutType != 1){
                    return layer.alert("只有应收保费才可以打印代收客户保险费上划通知书!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
                ids.push(rows[i].id);
            }
            $scope.ids = ids;
            $scope.filename = "代收客户保险费上划通知书";
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/clearing/printReportChoose.html',
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
         * 打印报表--代收客户保险费下划通知书
         */
        $scope.onPrintDaiUp = function () {
            $scope.raq = "daiShouDn";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return layer.alert("请至少选择一条单据进行打印!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
                if(rows[i].inoutType != 1){
                    return layer.alert("只有应收保费才可以打印代收客户保险费下划通知书!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
                ids.push(rows[i].id);
            }
            $scope.ids = ids;
            $scope.filename = "代收客户保险费下划通知书";
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/clearing/printReportChoose.html',
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
         * 打印报表--自行解付代收客户保费申请书
         */
        $scope.onPrintJieFu = function () {
            $scope.raq = "jieFu";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return layer.alert("请至少选择一条单据进行打印!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
                if(rows[i].inoutType != 2){
                    return layer.alert("只有解付保费才可以打印自行解付代收客户保费申请书!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
                ids.push(rows[i].id);
            }
            $scope.ids = ids;
            $scope.filename = "自行解付代收客户保费申请书";
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/clearing/printReportChoose.html',
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
         * 打印报表--代收通知书（分公司）
         */
        $scope.onPrintDaiS = function () {
            $scope.raq = "daiShou";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return layer.alert("请至少选择一条单据进行打印!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
                if(rows[i].inoutType != 1){
                    return layer.alert("只有应收保费才可以打印代收通知书!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
                ids.push(rows[i].id);
            }
            $scope.ids = ids;
            $scope.filename = "代收通知书";
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/clearing/printReportChoose.html',
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
         * 打印报表--代付通知书（分公司）
         */
        $scope.onPrintDaiF = function () {
            $scope.raq = "daiFu";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return layer.alert("请至少选择一条单据进行打印!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
                if(rows[i].inoutType != 2){
                    return layer.alert("只有解付保费才可以打印代付通知书!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
                ids.push(rows[i].id);
            }
            $scope.ids = ids;
            $scope.filename = "代付通知书";
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/clearing/printReportChoose.html',
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
         * 打印报表--业务收入确认书
         */
        $scope.onPrintYeWu = function () {
            $scope.raq = "yeWu";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return layer.alert("请至少选择一条单据进行打印!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
                if(rows[i].inoutType != 3 && rows[i].inoutType != 4){
                    return layer.alert("只有应收佣金或应收咨询费才可以打印业务收入确认书!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
                ids.push(rows[i].id);
            }
            layer.load(2);
            $http.post($rootScope.basePath + "clearing/Print", {
                data: angular.toJson(ids),
                raq: $scope.raq,
                type: "PDF"
            },{responseType:'arraybuffer'}).success(function (response) {
                var files = new Blob([response],{type: "application/pdf",filename:"业务收入确认书"});
                var fileURL = URL.createObjectURL(files);
                $scope.content=$sce.trustAsResourceUrl(fileURL);
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
            });

        };

        /**
         * 打印报表--发票开具申请书
         */
        $scope.onPrintFaPiao = function () {
            $scope.raq = "fapiao";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return layer.alert("请至少选择一条单据进行打印!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
                if(rows[i].inoutType != 3 && rows[i].inoutType != 4){
                    return layer.alert("只有应收佣金或应收咨询费才可以打印发票开具申请书!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
                ids.push(rows[i].id);
            }
            $scope.ids = ids;
            $scope.filename = "发票开具申请书";
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/clearing/printReportChoose.html',
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
         * 打印报表--资金到账通知书
         */
        $scope.onPrintNoticeFunds = function () {
            $scope.raq = "clearingNoticeFunds";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return layer.alert("请至少选择一条单据进行打印!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
                if(rows[i].inoutType != 1){
                    return layer.alert("只有应收保费才可以打印资金到账通知书!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
                ids.push(rows[i].id);
            }
            $scope.ids = ids;
            $scope.filename = "资金到账通知书";
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/clearing/printReportChoose.html',
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
         * 更新客户表mysql、oracle数据
         * */
        $scope.onUpdate = function () {
            $http.post($scope.basePath + "clearing/updateCustomer", {
                data: angular.toJson($scope.VO)
            }).success(function (response) {
                if (response && response.code == "200") {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
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
                }
            });
        }
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
        $scope.upOrDown = false;

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
                {
                    name: 'vbillno',
                    displayName: '业务结算编号',
                    width: 100,
                    footerCellTemplate: '<div class="ui-grid-cell-contents">合计</div>'
                },
                {name: 'inoutType', displayName: '结算类型', width: 100,cellFilter: 'SELECT_ITEMTYPE'},
                {
                    name: 'sum_receivemount',
                    displayName: '应收保费总额',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'sum_paymount',
                    displayName: '解付保费总额',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'sum_receivefeemount',
                    displayName: '应收佣金总额',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'sum_consult',
                    displayName: '应收咨询费总额',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'sum_evaluationfee',
                    displayName: '应收公估费总额',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'sapCustomernCode', displayName: '凭证状态', width: 100, cellFilter: 'SELECT_SAPTYPE'},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOrg_name', displayName: '业务单位', width: 100,},
                {name: 'pkOperator_name', displayName: '经办人', width: 100,},
                {name: 'operate_date', displayName: '制单日期', width: 100,},
                {name: 'pkAuditor_name', displayName: '审核人', width: 100,},
                {name: 'check_date', displayName: '审核日期', width: 100,},
                {name: 'sapDate', displayName: '到账日期', width: 100,},
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

        $scope.feeGridOptions = {
            rowTemplate: "<div ng-dblclick=\"grid.appScope.onRowDblClick(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>",
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '财务结算.csv',
            columnDefs: [
                {name: 'name', displayName: '支付方式', enableCellEdit: false},
                {name: 'insurancetotalcharge', displayName: '支付金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER'},
                {name: 'fee', displayName: '手续费', cellFilter: 'AMOUNT_FILTER'},
                {
                    name: 'company.name',
                    displayName: '实际往来对象',
                    url: 'customerClearingRefController/queryForGrid',
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'company',
                    enableCellEdit: true
                }
            ],
            data: $scope.VO.payTypeDetail
        };
        $scope.onRowDblClickType = function (rows, type) {
            // debugger
            if ($scope.isEdit) {
                return;
            }
            var app = "";
            var id = "";
            var fun_code = "";
            if (type == 1) {
                if (rows.pkInsurancebill.insurancetype == "zixunfei") {
                    app = "app.contManage.consult";
                    fun_code = "301";
                } else if (rows.pkInsurancebill.insurancetype == "unlife" && rows.pkInsurancebill.type_payment == "保单") {
                    app = "app.contManage.policyInfo.property.propertyInsurance";
                    fun_code = "3020301";
                } else if (rows.pkInsurancebill.insurancetype == "grouplife" && rows.pkInsurancebill.type_payment == "保单") {
                    app = "app.contManage.policyInfo.life.gLifeInsurance";
                    fun_code = "3020401";
                } else if (rows.pkInsurancebill.insurancetype == "groupcar" && rows.pkInsurancebill.type_payment == "保单") {
                    app = "app.contManage.policyInfo.car.gCarInsurance";
                    fun_code = "3020502";
                } else if (rows.pkInsurancebill.insurancetype == "personallife" && rows.pkInsurancebill.type_payment == "保单") {
                    app = "app.contManage.policyInfo.life.pLifeInsurance";
                    fun_code = "3020402";
                } else if (rows.pkInsurancebill.insurancetype == "personalcar" && rows.pkInsurancebill.type_payment == "保单") {
                    app = "app.contManage.policyInfo.car.pCarInsurance";
                    fun_code = "3020501";
                } else if (rows.pkInsurancebill.insurancetype == "relife" && rows.pkInsurancebill.type_payment == "保单") {
                    app = "app.againInsurance.policyInfo.reinsurance";
                    fun_code = "130301";
                } else if (rows.pkInsurancebill.insurancetype == "grouplife" && rows.pkInsurancebill.type_payment == "批单") {
                    app = "app.contManage.riderManage.gLifeChangebillcheck";
                    fun_code = "30402";
                } else if (rows.pkInsurancebill.insurancetype == "unlife" && rows.pkInsurancebill.type_payment == "批单") {
                    app = "app.contManage.riderManage.changebillcheck";
                    fun_code = "30401";
                } else if (rows.pkInsurancebill.insurancetype == "relife" && rows.pkInsurancebill.type_payment == "批单") {
                    app = "app.againInsurance.policyInfo.againchangebillcheck";
                    fun_code = "1306";
                } else if (rows.pkInsurancebill.insurancetype == "personallife" && rows.pkInsurancebill.type_payment == "批单") {
                    app = "app.contManage.policyInfo.life.pLifeInsurance";
                    fun_code = "3020402";
                }
                id = rows.pkInsurancebill.pk;
            } else if (type == 2){
                app = "app.busManage.busDevelop.busProject.propertyProject";
                id = rows.pkInsurancebill.pk_project;
                fun_code = "2030101";
            } else if (type == 3){
                app = "app.comInfo.economicContract";
                id = rows.economicContract.code;
                fun_code = "402";
            }
            layer.load(2);
            $http.post($scope.basePath + "account/setFunCode", {funCode: fun_code}).success(function (response) {
                layer.closeAll("loading");
                // $state.go(app,{'id':id},{
                //     reload:true
                // });
                var url = $state.href(app, {'id': id}, {});
                $window.open(url + "?id=" + id);
            });
        }
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
            let rows = $scope.VO.dealAttachmentB;
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

        $scope.accountOptions = {
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
                {
                    name: 'accType', displayName: '账户类型', width: 150, cellFilter: 'SELECT_ACCTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.ACCTYPE
                },
                {name: 'accNum', displayName: '银行卡号',width:150},
                {name: 'accBlank', displayName: '开户银行',width:150},
                {name: 'jointBankNum', displayName: '银行联行号',width:150},
            ],
            data:[],
            onRegisterApi: function (gridApi) {
                $scope.accountOptions.gridApi = gridApi;
            }
        };

        $scope.selectTabName = 'clearingBGridOptions';
        $scope.clearingBGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '财务结算子表.csv',
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            columnDefs: [
                {
                    name: 'pkInsurancebill.code', displayName: '保单信息编号', enableCellEdit: false,
                    cellTemplate: '<div ng-dblclick=\"grid.appScope.onRowDblClickType(row.entity,1)\" >{{row.entity.pkInsurancebill.code}}</div>'
                },
                {name: 'pkInsurancebill.name', displayName: '保单号', enableCellEdit: false},
                {name: 'pkInsurancebill.estimatename', displayName: '投保人', enableCellEdit: false},
                {name: 'pkInsurancebill.insurance', displayName: '险种', enableCellEdit: false},
                {name: 'c0Name.name', displayName: '计划往来对象', enableCellEdit: false},
                {
                    name: 'pkInsurancebill.projectname', displayName: '项目名称', enableCellEdit: false,
                    cellTemplate: '<div ng-dblclick=\"grid.appScope.onRowDblClickType(row.entity,2)\" >{{row.entity.pkInsurancebill.projectname}}</div>'
                },
                {
                    name: 'typeMoney', displayName: '收付款类型', enableCellEdit: false
                },
                {
                    name: 'receiveperiod', displayName: '期数', enableCellEdit: false
                },
                {
                    name: 'typeCompany', displayName: '收付款对象类型', enableCellEdit: false
                },
                {
                    name: 'planDate', displayName: '计划时间', cellFilter: 'date:"yyyy-MM-dd"',
                    enableCellEdit: false
                },
                {
                    name: 'planMoney',
                    displayName: '本次计划金额',
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    },
                    enableCellEdit: false
                },
                {
                    name: 'factDate', displayName: '结算日期', cellFilter: 'date:"yyyy-MM-dd"'
                    , editableCellTemplate: 'ui-grid/refDate',
                    enableCellEdit: false
                },
                {
                    name: 'factMoney',
                    displayName: '本次结算金额',
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'noPaymentMoney',
                    displayName: '未结算金额',
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    },
                    enableCellEdit: false
                },
                {
                    name: 'factActualcollection.name',
                    displayName: '实际往来对象',
                    url: 'customerClearingRefController/queryForGrid'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'factActualcollection'
                    , enableCellEdit: false
                },
                // {
                //     name: 'cAccount', displayName: '银行卡号', enableCellEdit: false
                //
                // },
                // {
                //     name: 'cBank', displayName: '开户银行', enableCellEdit: false
                // },
                {
                    name: 'billing', displayName: '是否开发票', cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                    , enableCellEdit: false
                },
                {
                    name: 'economicContract.code', displayName: '经法合同信息', url: 'economicContract/queryForClearing',
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'economicContract',
                    enableCellEdit: true,
                    cellTemplate: '<div ng-dblclick=\"grid.appScope.onRowDblClickType(row.entity,3)\" >{{row.entity.economicContract.code}}</div>'
                },
                {
                    name: 'vdef1', displayName: '备注', enableCellEdit: true
                },
            ],
            data: $scope.VO.clearingB,
            onRegisterApi: function (gridApi) {
                $scope.clearingBGridOptions.gridApi = gridApi;
                $scope.clearingBGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
                if ($scope.clearingBGridOptions.gridApi.edit) {
                    $scope.clearingBGridOptions.gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if ('economicContract.code' == colDef.name) {
                            var economicContract = $scope.clearingBGridOptions.data[0].economicContract;
                            if (economicContract != null) {
                                var datas = $scope.clearingBGridOptions.data.length;
                                if (datas > 1) {
                                    for (var i = 1; i < $scope.clearingBGridOptions.data.length; i++) {
                                        if (!$scope.clearingBGridOptions.data[i].economicContract) {
                                            $scope.clearingBGridOptions.data[i].economicContract = economicContract;
                                        }
                                    }
                                }
                            }
                        }
                        if ('factMoney' == colDef.name) {
                            rowEntity.noPaymentMoney = (parseFloat(rowEntity.planMoney) - parseFloat(rowEntity.factMoney)).toFixed(2);
                            $http.post($rootScope.basePath + "clearing/childTableValueChanged", {data: angular.toJson($scope.VO)})
                                .success(function (response) {
                                    if (response) {
                                        angular.assignData($scope.VO, response.result);
                                        response.result.clearingB.pkInsurancebill.name = $scope.VO.clearingB.pkInsurancebill.name+'\xa0';
                                        $scope.clearingBGridOptions.data = response.result.clearingB;
                                        $scope.VO.matching_money = 0;
                                        for (let i = 0; i < $scope.clearingBGridOptions.data.length; i++) {
                                            $scope.VO.matching_money = $scope.VO.matching_money + Number.parseFloat($scope.clearingBGridOptions.data[i].factMoney);
                                        }
                                        $scope.VO.matching_money = $scope.VO.matching_money.toFixed(2);
                                    }
                                });
                        }
                        if ('billing' == colDef.name && rowEntity.billing == 'Y') {
                            if ($scope.VO.clearingB.length > 0 && $scope.VO.clearingB[0].pkInsurancebill.code == rowEntity.pkInsurancebill.code) {

                                for (var i = 0; i < $scope.VO.clearingB.length; i++) {
                                    $scope.VO.clearingB[i].billing = 'Y';
                                }
                            }
                        }
                        $scope.$apply();
                    });
                }


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
                {
                    name: 'file_type',
                    displayName: '附件类型',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_CLEARINGDOUCUMENTTYPE',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.CLEARINGDOUCUMENTTYPE
                },

                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},

                {
                    name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                },
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
        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        } /*else {
            $scope.queryForGrid($scope.QUERY);
        }*/

        //选择流水信息表
        $scope.subscriptionGridOptions = {
            enableRowSelection: true,
            enableSelectAll: false,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {name: 'reciprocal_name.name', displayName: '对方账户名称', width: 300, enableCellEdit: false},
                {name: 'reciprocal_account_view', displayName: '对方账号', enableCellEdit: false},
                {
                    name: 'lender_amount', displayName: '贷方金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'amount', displayName: '可用金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'transaction_name.unitname', displayName: '交易账户名称', width: 250, enableCellEdit: false},
                {name: 'transaction_account_view', displayName: '交易账号', enableCellEdit: false},
                {name: 'transaction_date', displayName: '到账日期', enableCellEdit: false, cellFilter: 'date:"yyyy-MM-dd"'}
            ],
        };
        $scope.subscriptionGridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.subscriptionGridOptions.gridApi = gridApi;

            //添加行头
            $scope.subscriptionGridOptions.gridApi.core.addRowHeaderColumn({
                name: 'rowHeaderCol',
                displayName: '',
                width: 30,
                cellTemplate: 'ui-grid/rowNumberHeader'
            });
            $scope.subscriptionGridOptions.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                if ($scope.isEdit) {
                    //行选中事件
                    var rows = $scope.subscriptionGridOptions.gridApi.selection.getSelectedRows();
                    if (rows.length == 0) {
                        $scope.clearingGridOptions.data = rows;
                        $scope.VO.amount_money = 0;

                    } else if (rows.length > 0) {
                        //校验是否已经有锁
                        $http.post($scope.basePath + "subscription/ifUse", {pk: rows[0].id}).success(function (response) {
                            if (response && response.code == 200) {
                                $scope.clearingGridOptions.data = rows;
                                $scope.VO.bankFlow = $scope.clearingGridOptions.data;
                                $scope.VO.amount_money = 0;
                                //重新计算匹配金额
                                for (var i = 0; i < $scope.clearingGridOptions.data.length; i++) {
                                    $scope.VO.amount_money = $scope.VO.amount_money + Number.parseFloat($scope.clearingGridOptions.data[i].lender_amount);
                                }
                                $scope.VO.amount_money = $scope.VO.amount_money.toFixed(2);
                            } else {
                                if (response) {
                                    return layer.alert("该流水已经被使用！", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }
                        });
                    }
                }
            });
        };
        // $scope.selectTabName = 'clearingGridOptions';
        //已选银行流水
        $scope.clearingGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: false,
            enableSelectAll: false,
            multiSelect: false,
            enableSorting: true,
            enableRowHeaderSelection: false,
            // showColumnFooter: true,
            columnDefs: [
                {name: 'reciprocal_name.name', displayName: '对方账户名称', enableCellEdit: false},
                {name: 'reciprocal_account_view', displayName: '对方账号', enableCellEdit: false},
                {
                    name: 'lender_amount', displayName: '贷方金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }, aggregationType: uiGridConstants.aggregationTypes.sum,
                },
                {name: 'transaction_name.unitname', displayName: '交易账户名称', width: 250, enableCellEdit: false},
                {name: 'transaction_account_view', displayName: '交易账号', enableCellEdit: false},
                {name: 'transaction_date', displayName: '到账日期', enableCellEdit: false, cellFilter: 'date:"yyyy-MM-dd"'}
            ],
            data: $scope.VO.bankFlow,
            onRegisterApi: function (gridApi) {
                $scope.clearingGridOptions.gridApi = gridApi;
                //添加行头
                $scope.clearingGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
                $scope.clearingGridOptions.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                });
            }
        };

        //预收保费列表
        $scope.advancePremiumsInfoGridOptions = {
            enableRowSelection: true,
            enableSelectAll: false,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {name: 'advanceNo', displayName: '预收保费信息编号',enableCellEdit: false},
                {name: 'accountStatement[0].reciprocal_name.name', displayName: '对方账户名称',enableCellEdit: false},
                {name: 'accountStatement[0].reciprocal_account_view', displayName: '对方账号',enableCellEdit: false},
                {
                    name: 'accountStatement[0].lender_amount', displayName: '贷方金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }, aggregationType: uiGridConstants.aggregationTypes.sum,
                },
                {
                    name: 'noPaymentMoney', displayName: '可用金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }, aggregationType: uiGridConstants.aggregationTypes.sum,
                },
                {name: 'accountStatement[0].transaction_name.unitname', displayName: '交易账户名称', width: 250, enableCellEdit: false},
                {name: 'accountStatement[0].transaction_account_view', displayName: '交易账号', enableCellEdit: false},
                {name: 'accountStatement[0].transaction_date', displayName: '到账日期', enableCellEdit: false, cellFilter: 'date:"yyyy-MM-dd"'},
            ],
            data: [],
            onRegisterApi: function (gridApi) {
                $scope.advancePremiumsInfoGridOptions.gridApi = gridApi;
                //添加行头
                $scope.advancePremiumsInfoGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
                $scope.advancePremiumsInfoGridOptions.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                    var rows = $scope.advancePremiumsInfoGridOptions.gridApi.selection.getSelectedRows();
                    $scope.VO.amount_money = 0;
                    if(rows!=null && rows.length > 0){
                        for (let i = 0; i < rows.length; i++) {
                            rows[i].clearingMoney = rows[i].noPaymentMoney;
                            rows[i].noPaymentMoneyCal = 0;
                            $scope.VO.amount_money = $scope.VO.amount_money + Number.parseFloat(rows[i].noPaymentMoney);
                        }
                        $scope.VO.advancePremiums = rows;
                        $scope.advancePremiumsGridOptions.data = rows;
                    }else{
                        $scope.VO.accountStatement = [];
                        $scope.advancePremiumsGridOptions.data = [];
                    }
                });
            }
        };
        //已选择的预收保费列表
        $scope.advancePremiumsGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: false,
            enableSelectAll: false,
            multiSelect: false,
            enableSorting: true,
            enableRowHeaderSelection: false,
            columnDefs: [
                {name: 'advanceNo', displayName: '预收保费信息编号',enableCellEdit: false},
                {name: 'accountStatement[0].reciprocal_name.name', displayName: '对方账户名称',enableCellEdit: false},
                {name: 'accountStatement[0].reciprocal_account_view', displayName: '对方账号',enableCellEdit: false},
                {
                    name: 'accountStatement[0].lender_amount', displayName: '贷方金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }, aggregationType: uiGridConstants.aggregationTypes.sum,
                },
                {
                    name: 'noPaymentMoney', displayName: '可用金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }, aggregationType: uiGridConstants.aggregationTypes.sum,
                },
                {
                    name: 'noPaymentMoneyCal', displayName: '剩余金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }, aggregationType: uiGridConstants.aggregationTypes.sum,
                },
                {name: 'accountStatement[0].transaction_name.unitname', displayName: '交易账户名称', width: 250, enableCellEdit: false},
                {name: 'accountStatement[0].transaction_account_view', displayName: '交易账号', enableCellEdit: false},
                {name: 'accountStatement[0].transaction_date', displayName: '到账日期', enableCellEdit: false, cellFilter: 'date:"yyyy-MM-dd"'},
                {
                    name: 'clearingMoney', displayName: '匹配金额', enableCellEdit: true, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }, aggregationType: uiGridConstants.aggregationTypes.sum,
                },
            ],
            data: $scope.VO.advancePremiums,
            onRegisterApi: function (gridApi) {
                $scope.advancePremiumsGridOptions.gridApi = gridApi;
                //添加行头
                $scope.advancePremiumsGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
                $scope.advancePremiumsGridOptions.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                });
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        $scope.VO.amount_money = 0;
                        for (let i = 0; i < $scope.advancePremiumsGridOptions.data.length ; i++) {
                            $scope.VO.amount_money = $scope.VO.amount_money + Number.parseFloat($scope.advancePremiumsGridOptions.data[i].clearingMoney);
                            $scope.advancePremiumsGridOptions.data[i].noPaymentMoneyCal = Number.parseFloat($scope.advancePremiumsGridOptions.data[i].noPaymentMoney) - Number.parseFloat($scope.advancePremiumsGridOptions.data[i].clearingMoney);
                        }
                    });
                }
            }
        };
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {
            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }
    };
    $scope.table_name = "lr_clearing";
    $scope.billdef = "Clearing";
    $scope.beanName = "insurance.ClearingServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.child_table = angular.toJson({"clearingB": "caib_clearing_b"});
    initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope, $rootScope);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);
})
;
app.controller('clearingBCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
    $scope.insuranceinfonoRef = {
        id: $scope.$id,
        columnDefs: [
            {
                field: 'pk',
                displayName: '保单号'
            },
            {
                field: 'code',
                displayName: '单据编号'
            },
            {
                field: 'name',
                displayName: '项目名称'
            }
        ],
        data: ""
    }
    /**
     * 初始化页面变更方法
     */
    $scope.initQUERYChildren = function () {
        return {
            'id^notin': $scope.childrenId,
            inoutType: $scope.$parent.VO.inoutType
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
                {name: 'billid', displayName: '来源单据信息编号', width: 100,},
                {name: 'pkPartner.name', displayName: '保单号', width: 100,},
                {name: 'pkPartner.estimatename', displayName: '投保人', width: 100,},
                {name: 'pkPartner.projectname', displayName: '项目名称', width: 100,},
                {name: 'pkPartner.insurance', displayName: '险种信息', width: 100,},
                {name: 'typeMoney', displayName: '收付款类型', width: 100,},
                {name: 'company.name', displayName: '收付款对象名称', width: 100,},
                {name: 'stages', displayName: '期数', width: 100,},
                {
                    name: 'planMoney', displayName: '本期计划金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'planDate', displayName: '计划日期', width: 100,},
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
                {name: 'vsettlebillno', displayName: '业务结算单号', width: 100,}
            ],
            data: $scope.VO.reportChildren
        };
        $scope.clearingBGridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;

            //添加行头
            $scope.gridApi.core.addRowHeaderColumn({
                name: 'rowHeaderCol',
                displayName: '',
                width: 30,
                cellTemplate: 'ui-grid/rowNumberHeader'
            });

            if (null != gridApi.pagination) {
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    $scope.gridApi.page = newPage;
                    $scope.gridApi.pageSize = pageSize;
                    $scope.queryForGridChildren($scope.QUERYCHILDREN, $scope.queryPath);
                });
            }
        };
    };


    $scope.queryForGridChildren = function (data, path) {
        if (!$scope.queryData) {
            $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.clearingBGridOptions.columnDefs;
        }
        layer.load(2);
        $http.post($scope.basePath + 'paymentRef/' + path, {
            data: angular.toJson(data),
            page: $scope.gridApi ? $scope.gridApi.page : $scope.clearingBGridOptions.page,
            pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.clearingBGridOptions.pageSize,
            fields: angular.toJson($scope.queryData)
        }).success(function (response) {
            if (response.code == 200) {
                if (!$scope.query) {
                    $scope.query = $scope.clearingBGridOptions.columnDefs;
                }
                //财务结算，增行时，已选择的保单不要继续显示 @sucy 2019-5-30
                var resultArr = response.result.Rows;
                var clearingBArr2 = $scope.VO.clearingB;
                for (var i = resultArr.length - 1; i >= 0; i--) {
                    var resultPayment = resultArr[i];
                    for (var j = clearingBArr2.length - 1; j >= 0; j--) {
                        var psymentVO = clearingBArr2[j];
                        if (resultPayment.pkPayment == psymentVO.pkPayment) {
                            resultArr.splice(i, 1);
                            break;
                        }
                    }
                }
                $scope.clearingBGridOptions.data = resultArr;
                $scope.clearingBGridOptions.totalItems = response.result.Total;
            }
            layer.closeAll('loading');
        });
    };
    $scope.onQueryChildren = function () {
        $scope.queryForGridChildren($scope.QUERYCHILDREN, $scope.queryPath);
    };
    $scope.onResetChildren = function () {
        $scope.QUERYCHILDREN = $scope.initQUERYChildren();
    };

    $scope.initFunction = function () {

        /**
         * 保存
         */
        $scope.onSave = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});

            if ($scope.queryPath == 'queryForGrids') {
                //新增
                $scope.$parent.confirm(rows);
                ngDialog.close();

            } else if ($scope.queryPath == 'queryForGridByOpen') {
                $scope.pk_payment = rows[0].pk_payment;
                //开启收付款
                $http.post($rootScope.basePath + "clearing/openPayment", {pk: $scope.pk_payment})
                    .success(function (response) {
                        if (!response.flag) {
                            ngDialog.close($scope.ngDialogId);
                            layer.msg('开启成功!', {
                                shift: 6,
                                icon: 11
                            });
                        }
                    });

            } else if ($scope.queryPath == 'queryForGridByClose') {
                //关闭收付款
                ngDialog.open({
                    showClose: true,
                    closeByDocument: true,
                    template: 'view/clearing/closeClearing.html',
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

                    }
                }, function (reason) {

                });

            }

        };

        $scope.onCancel = function () {
            ngDialog.close($scope.ngDialogId);
        };
    };
    $scope.initData();
    $scope.initFunction();
    //$scope.queryForGridChildren($scope.QUERYCHILDREN, $scope.queryPath);

});


app.controller('closeClearingCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
    $scope.onSureClose = function (pk) {
        ngDialog.close($scope.$parent.ngDialogId);
        ngVerify.check('closeClearing', function (errEls) {
            if (errEls && errEls.length) {
                return layer.alert("请先填写所有的必输项!",
                    {skin: 'layui-layer-lan', closeBtn: 1});
            } else {
                layer.confirm('是否作废选定收付款？', {
                        btn: ['是', '否'], //按钮
                        btn2: function (index, layero) {
                            layer.msg('取消操作!', {
                                shift: 6,
                                icon: 11
                            });
                        },
                        shade: 0.6,//遮罩透明度
                        shadeClose: true,//点击遮罩关闭层
                    },
                    function () {
                        $http.post($rootScope.basePath + "clearing/closePayment", {pk: pk, vdef1: $scope.vdef1})
                            .success(function (response) {
                                if (!response.flag) {
                                    ngDialog.close($scope.ngDialogId);
                                    layer.msg('作废成功!', {
                                        shift: 6,
                                        icon: 1
                                    });
                                }
                            });
                    }
                );
            }
        }, true);

    }

    $scope.onCancelClose = function () {
        ngDialog.close($scope.ngDialogId);
    };

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
            $http.post($rootScope.basePath + "clearing/Print",
                {
                    data: angular.toJson($scope.$parent.ids),
                    raq: $scope.$parent.raq,
                    type: "PDF",
                    query: angular.toJson($scope.pVO)
                },{responseType:'arraybuffer'})
                .success(function (response) {
                    var files = new Blob([response],{type: "application/pdf",filename:$scope.$parent.filename});
                    var fileURL = URL.createObjectURL(files);
                    $scope.content=$sce.trustAsResourceUrl(fileURL);
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
                });

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
            if($scope.$parent.raq == 'clearingNoticeFunds'){
                $scope.isPdateShow = true;
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
            }else if($scope.$parent.raq == 'clearingNoticeFunds'){
                return "打印日期"
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