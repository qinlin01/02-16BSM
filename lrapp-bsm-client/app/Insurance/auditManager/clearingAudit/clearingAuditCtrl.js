/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('clearingAuditCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, $state, $window) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                clearingB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                againRateCNY: 1,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                dr: 0,
                costscale: [],
                coomedium: [],
                rate: 0.06,
                rateKey: 'A5',
                advancePremiums: []
            };
        };
        $scope.entityVO = 'nc.vo.busi.ClearingVO';
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                operate_year: parseInt(new Date().format("yyyy")),
                dr: 0,
                clearingAuditSource: 1
            }
        };
        $scope.factCustomerRef = {
            "id": $scope.$id,
            "columnDefs": [{
                field: 'CODE',
                displayName: '客户编码'
            },
                {
                    field: 'NAME',
                    displayName: '客户名称'
                }]
        }
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode = '1001';
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "clearingAudit/queryForGrid", {
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
            $http.post($scope.basePath + "clearingAudit/findOne", {pk: pk, clearingAuditSource: $scope.QUERY.clearingAuditSource}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    if (callback) {
                        callback();
                    }
                    angular.assignData($scope.VO, response.result);
                    $scope.caibSapCostCenterRefs($scope.VO);
                    $scope.advancePremiumsGridOptions.data = $scope.VO.advancePremiums;
                    //重新加载子表表格
                    $scope.childTableReload();
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

        $scope.caibSapCostCenterRefs = function (data) {
            $http.post($scope.basePath + "caibSapCostCenterRef/findByPkdept", {data: angular.toJson(data)}).success(function (response) {
                if (response && response.code == "200") {
                    if (response.result.length > 0) {
                        $scope.VO.sapCenter = response.result[0];
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

        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            if ($scope.VO.rate == 0.06) {
                $scope.VO.rateKey = 'A5'
            } else if ($scope.VO.rate == 0.01) {
                $scope.VO.rateKey = 'AK'
            } else if ($scope.VO.rate == 0.03) {
                $scope.VO.rateKey = 'A2'
            }
            $scope.VO.clearingAuditSource = $scope.QUERY.clearingAuditSource;
            $http.post($rootScope.basePath + "clearingAudit/save", {data: angular.toJson($scope.VO), funCode: $scope.funCode})
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
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
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

        $scope.childTableReload = function () {
            if($scope.VO.isRelife && $scope.VO.isRelife == 'Y'){
                $scope.clearingBGridOptions.columnDefs = [
                    {
                        name: 'pkInsurancebill.code', displayName: '保单号', width: 100, enableCellEdit: false,
                        cellTemplate: '<div ng-dblclick=\"grid.appScope.onRowDblClicks(row.entity,1)\" >{{row.entity.pkInsurancebill.code}}</div>'
                    },
                    {
                        name: 'c0Name.name',
                        displayName: '客户名称',
                        width: 200,
                        url: 'CUSTOMERREF',
                        placeholder: '请选择',
                        editableCellTemplate: 'ui-grid/refEditor',
                        popupModelField: 'c0Name',
                        enableCellEdit: false
                    },
                    {
                        name: 'pkInsurancebill.projectname', displayName: '项目名称', width: 200, enableCellEdit: false,
                        cellTemplate: '<div ng-dblclick=\"grid.appScope.onRowDblClicks(row.entity,2)\" >{{row.entity.pkInsurancebill.projectname}}</div>'
                    },
                    {
                        name: 'typeMoney', displayName: '收付款类型', width: 80, enableCellEdit: false
                    },
                    {
                        name: 'receiveperiod', displayName: '期数', width: 50, enableCellEdit: false
                    },
                    {
                        name: 'actualcollection',
                        displayName: '收付款对象名称',
                        width: 200,
                        url: 'CUSTOMERREF',
                        placeholder: '请选择',
                        editableCellTemplate: 'ui-grid/refEditor',
                        popupModelField: 'actualcollectionpk', enableCellEdit: false
                    },
                    {
                        name: 'typeCompany', displayName: '收付款对象类型', width: 80, enableCellEdit: false
                    },
                    {
                        name: 'sapCustomerCode.NAME',
                        displayName: '财务客商名称',
                        width: 250,
                        url: 'sapCustomerRef/queryForGrid',
                        placeholder: '请选择',
                        editableCellTemplate: 'ui-grid/refEditor',
                        popupModelField: 'sapCustomerCode',
                        uiPopupRef: {
                            "id": $scope.$id, "columnDefs": [{
                                field: 'CODE',
                                displayName: '客户编码'
                            },
                                {
                                    field: 'NAME',
                                    displayName: '客户名称'
                                }]
                        }
                    },
                    {
                        name: 'planDate',
                        displayName: '计划时间',
                        width: 80,
                        cellFilter: 'date:"yyyy-MM-dd"',
                        enableCellEdit: false,
                        type: 'date'
                    },
                    {
                        name: 'planMoneyOld',
                        displayName: '本次计划金额(原币种)',
                        width: 100,
                        enableCellEdit: false,
                        cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'planMoney',
                        displayName: '本次计划金额(元)',
                        width: 100,
                        enableCellEdit: false,
                        cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'factDate',
                        displayName: '结算日期',
                        width: 100,
                        cellFilter: 'date:"yyyy-MM-dd"',
                        enableCellEdit: false,
                        type: 'date'
                    },
                    {
                        name: 'factMoneyOld',
                        displayName: '本次结算金额(原币种)',
                        width: 100,
                        enableCellEdit: false,
                        cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'factMoney',
                        displayName: '本次结算金额(元)',
                        width: 100,
                        enableCellEdit: false,
                        cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'noPaymentMoneyOld',
                        displayName: '未结算金额(原币种)',
                        width: 100,
                        enableCellEdit: false,
                        cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'noPaymentMoney',
                        displayName: '未结算金额(元)',
                        width: 100,
                        enableCellEdit: false,
                        cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'factActualcollection.name',
                        displayName: '实际往来对象',
                        width: 200,
                        url: 'CUSTOMERREF',
                        placeholder: '请选择',
                        editableCellTemplate: 'ui-grid/refEditor',
                        popupModelField: 'factActualcollection', enableCellEdit: false
                    },
                    {
                        name: 'cAccount', displayName: '银行卡号', width: 200, enableCellEdit: false
                    },
                    {
                        name: 'cBank', displayName: '开户银行', width: 200, enableCellEdit: false
                    },
                    {
                        name: 'billing', displayName: '是否开发票', width: 80, cellFilter: 'SELECT_YESNO'
                        , editableCellTemplate: 'ui-grid/dropdownEditor'
                        , editDropdownValueLabel: 'name'
                        , editDropdownOptionsArray: getSelectOptionData.YESNO, enableCellEdit: false
                    },
                    {
                        name: 'economicContract.code', displayName: '经法合同信息', url: 'economicContract/queryForClearing',
                        placeholder: '请选择',
                        width: 150,
                        editableCellTemplate: 'ui-grid/refEditor',
                        popupModelField: 'economicContract',
                        enableCellEdit: true,
                        cellTemplate: '<div ng-dblclick=\"grid.appScope.onRowDblClicks(row.entity,3)\" >{{row.entity.economicContract.code}}</div>'
                    },
                    {
                        name: 'sapCodeYinS', displayName: '应收保费凭证号', width: 100, enableCellEdit: true
                    },
                    {
                        name: 'vdef1', displayName: '备注', width: 100
                    },
                ]
            }else{
                $scope.clearingBGridOptions.columnDefs = [
                    {
                        name: 'pkInsurancebill.code', displayName: '保单号', width: 100, enableCellEdit: false,
                        cellTemplate: '<div ng-dblclick=\"grid.appScope.onRowDblClicks(row.entity,1)\" >{{row.entity.pkInsurancebill.code}}</div>'
                    },
                    {
                        name: 'c0Name.name',
                        displayName: '客户名称',
                        width: 200,
                        url: 'CUSTOMERREF',
                        placeholder: '请选择',
                        editableCellTemplate: 'ui-grid/refEditor',
                        popupModelField: 'c0Name',
                        enableCellEdit: false
                    },
                    {
                        name: 'pkInsurancebill.projectname', displayName: '项目名称', width: 200, enableCellEdit: false,
                        cellTemplate: '<div ng-dblclick=\"grid.appScope.onRowDblClicks(row.entity,2)\" >{{row.entity.pkInsurancebill.projectname}}</div>'
                    },
                    {
                        name: 'typeMoney', displayName: '收付款类型', width: 80, enableCellEdit: false
                    },
                    {
                        name: 'receiveperiod', displayName: '期数', width: 50, enableCellEdit: false
                    },
                    {
                        name: 'actualcollection',
                        displayName: '收付款对象名称',
                        width: 200,
                        url: 'CUSTOMERREF',
                        placeholder: '请选择',
                        editableCellTemplate: 'ui-grid/refEditor',
                        popupModelField: 'actualcollectionpk', enableCellEdit: false
                    },
                    {
                        name: 'typeCompany', displayName: '收付款对象类型', width: 80, enableCellEdit: false
                    },
                    {
                        name: 'sapCustomerCode.NAME',
                        displayName: '财务客商名称',
                        width: 250,
                        url: 'sapCustomerRef/queryForGrid',
                        placeholder: '请选择',
                        editableCellTemplate: 'ui-grid/refEditor',
                        popupModelField: 'sapCustomerCode',
                        uiPopupRef: {
                            "id": $scope.$id, "columnDefs": [{
                                field: 'CODE',
                                displayName: '客户编码'
                            },
                                {
                                    field: 'NAME',
                                    displayName: '客户名称'
                                }]
                        }
                    },
                    {
                        name: 'planDate',
                        displayName: '计划时间',
                        width: 80,
                        cellFilter: 'date:"yyyy-MM-dd"',
                        enableCellEdit: false,
                        type: 'date'
                    },
                    {
                        name: 'planMoney',
                        displayName: '本次计划金额(元)',
                        width: 100,
                        enableCellEdit: false,
                        cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'factDate',
                        displayName: '结算日期',
                        width: 100,
                        cellFilter: 'date:"yyyy-MM-dd"',
                        enableCellEdit: false,
                        type: 'date'
                    },
                    {
                        name: 'factMoney',
                        displayName: '本次结算金额(元)',
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
                        enableCellEdit: false,
                        cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'factActualcollection.name',
                        displayName: '实际往来对象',
                        width: 200,
                        url: 'CUSTOMERREF',
                        placeholder: '请选择',
                        editableCellTemplate: 'ui-grid/refEditor',
                        popupModelField: 'factActualcollection', enableCellEdit: false
                    },
                    {
                        name: 'cAccount', displayName: '银行卡号', width: 200, enableCellEdit: false
                    },
                    {
                        name: 'cBank', displayName: '开户银行', width: 200, enableCellEdit: false
                    },
                    {
                        name: 'billing', displayName: '是否开发票', width: 80, cellFilter: 'SELECT_YESNO'
                        , editableCellTemplate: 'ui-grid/dropdownEditor'
                        , editDropdownValueLabel: 'name'
                        , editDropdownOptionsArray: getSelectOptionData.YESNO, enableCellEdit: false
                    },
                    {
                        name: 'economicContract.code', displayName: '经法合同信息', url: 'economicContract/queryForClearing',
                        placeholder: '请选择',
                        width: 150,
                        editableCellTemplate: 'ui-grid/refEditor',
                        popupModelField: 'economicContract',
                        enableCellEdit: true,
                        cellTemplate: '<div ng-dblclick=\"grid.appScope.onRowDblClicks(row.entity,3)\" >{{row.entity.economicContract.code}}</div>'
                    },
                    {
                        name: 'sapCodeYinS', displayName: '应收保费凭证号', width: 100, enableCellEdit: true
                    },
                    {
                        name: 'vdef1', displayName: '备注', width: 100
                    },
                ]
            }
        }

        $scope.onRowDblClicks = function (rows, type) {
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
            } else if (type == 2) {
                app = "app.busManage.busDevelop.busProject.propertyProject";
                id = rows.pkInsurancebill.pk_project;
                fun_code = "2030101";
            } else if (type == 3) {
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

        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function (item) {
            if (item && item.id) {
                $scope.onCard(item.id);
            }
        };
        $scope.tableStatus = function (array) {
            $scope.clearingGridOptions.data = $scope.VO.bankFlow;
            if (array.length > 0) {
                $scope.VO.matching_money = 0;
                $scope.VO.typeMoney = null;
                for (let i = 0; i < array.length; i++) {
                    $scope.VO.typeMoney = array[i].typeMoney;
                    if (array[i].typeMoney != null && array[i].typeMoney != "应收保费") {
                        if ((array[i].typeMoney == "应收佣金" || array[i].typeMoney == "应收咨询费" || array[i].typeMoney == "应收公估费")) {
                            $scope.showSubscription = false;
                            break;
                        }
                    } else if (array[i].typeMoney != null && array[i].typeMoney == "应收保费") {
                        if (i == array.length - 1) {
                            if ($scope.QUERY.clearingAuditSource == 2 && $scope.VO.rechargeType != null && $scope.VO.rechargeType == 2) {
                                $scope.showSubscription = false;
                                break;
                            }
                            $scope.showSubscription = true;
                            break;
                        }
                    }
                }
            }
        };
    }

    $scope.initWatch = function () {
        $scope.$watch('VO.sapCenter.NAME', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO.sapCustomernCode = 4;
                $scope.VO.sapVoucherStatus = '已生成SAP凭证';
            }
        }, true);
    };

    $scope.initButton = function () {


        /**
         * 凭证审核不通过
         */
        $scope.onVoucherUnPass = function () {
            layer.confirm('确认当前结算数据不准确吗？窗口将关闭', {
                    btn: ['是', '否'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消!', {
                            shift: 6,
                            icon: 11
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    $scope.VO.clearingAuditSource = $scope.QUERY.clearingAuditSource;
                    $http.post($scope.basePath + "clearingAudit/unpassVoucher", {data: angular.toJson($scope.VO)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            layer.msg('完成!', {
                                shift: 6,
                                icon: 11
                            });
                        } else {
                            layer.msg('处理失败！', {
                                icon: 1
                            });
                        }
                        ngDialog.close();

                    });

                }
            );
        }

        /**
         * 凭证审核通过
         */
        $scope.onVoucherPass = function () {
            layer.confirm('确认发送当前的凭证到SAP吗？', {
                    btn: ['是', '否'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消发送!', {
                            shift: 6,
                            icon: 11
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function (index) {
                    layer.close(index);
                    layer.load(2);
                    $scope.VO.clearingAuditSource = $scope.QUERY.clearingAuditSource;
                    $http.post($scope.basePath + "clearingAudit/sendVoucherToSap", {data: angular.toJson($scope.VO)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == 200) {
                            //关闭SAP凭证的窗口
                            ngDialog.close();
                            //刷新页面数据
                            $scope.findOne($scope.VO.id);
                            if (response) {
                                if (response.msg) {
                                    // e.g. 字符转换为Entity Name
                                    response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                        var rs = asciiChartSet_c2en[matched];
                                        return rs == undefined ? matched : rs;
                                    });
                                    layer.closeAll('loading');
                                    layer.msg(response.msg, {icon: 1});
                                }
                            }
                            //  layer.msg(response.msg, {icon: 1});
                        } else {
                            layer.closeAll('loading');
                            layer.msg(response.msg, {
                                icon: 1
                            });
                        }

                    });
                }
            );
        }

        /**
         * 取消
         */
        $scope.onVoucherCancel = function () {
            ngDialog.close();
            $scope.onSaveVO();
        }

        /**
         * 冲销凭证
         */
        $scope.onReverse = function () {
            $http.post($rootScope.basePath + "clearingAudit/reverseVoucher", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    if (response.code == 200) {
                        $scope.isGrid = false;
                        $scope.isBack = true;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                        $scope.html = response.result;
                        ngDialog.openConfirm({
                            showClose: true,
                            closeByDocument: false,
                            template: 'view/clearingAudit/voucher.html',
                            className: 'ngdialog-theme-formInfo',
                            scope: $scope,
                            preCloseCallback: function (value) {
                                if (value && value == "clear") {
                                    //重置
                                    return false;
                                }
                                return true;
                            }
                        }).then(function (value) {

                        }, function (reason) {

                        });
                    }
                });
        }

        /**
         * 控制凭证审核按钮是否显示
         */
        $scope.isAuditVoucher = function () {
            if ($scope.VO.sapVoucherStatus) {
                return true;
            }
            return false;
        }

        /**
         * 控制冲销凭证按钮是否显示
         */
        $scope.isReverse = function () {
            if (!($scope.VO.sapVoucherStatus && $rootScope.SELECT.SAPTYPE[2].id != $scope.VO.sapVoucherStatus &&
                $rootScope.SELECT.SAPTYPE[0].id != $scope.VO.sapVoucherStatus)) {
                return true;
            }
            return false;
        }

        /**
         * 控制发送凭证按钮是否显示
         */
        $scope.isSendVoucher = function () {
            if ($rootScope.SELECT.SAPTYPE[2].id != $scope.VO.sapVoucherStatus &&
                $rootScope.SELECT.SAPTYPE[0].id != $scope.VO.sapVoucherStatus &&
                $rootScope.SELECT.SAPTYPE[1].id != $scope.VO.sapVoucherStatus) {
                return true;
            }
            return false;
        }

        /**
         * 发送凭证
         */
        $scope.onSendVoucher = function () {
            if (null == $scope.VO.factCustomer && $scope.VO.ifEpay == "Y") {
                return layer.alert("请选择往来对象名称!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            if ($scope.QUERY.clearingAuditSource == 2 && $scope.VO.rechargeType != null && $scope.VO.rechargeType == 2) {
                //校验保险公司是否选择
                if ($scope.VO.sapCustomerCode == null || $scope.VO.sapCustomerCode.NAME == null || $scope.VO.sapCustomerCode.CODE == null) {
                    return layer.alert("请选择保险公司!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
            }
            //发送凭证时增加单据来源判断
            $scope.VO.clearingAuditSource = $scope.QUERY.clearingAuditSource;
            if ($scope.VO.rate == 0.06) {
                $scope.VO.rateKey = 'A5'
            } else if ($scope.VO.rate == 0.01) {
                $scope.VO.rateKey = 'AK'
            } else if ($scope.VO.rate == 0.03) {
                $scope.VO.rateKey = 'A2'
            }
            if ($scope.VO.isRelife == 'Y') {
                $scope.VO.sumPaymount_bak = angular.copy($scope.VO.sumPaymount);
                $scope.VO.sumReceivefeemount_bak = angular.copy($scope.VO.sumReceivefeemount);
                for (let i = 0; i < $scope.VO.bankFlow.length; i++) {
                    $scope.VO.bankFlow[i].lender_amount_bak = $scope.VO.bankFlow[i].lender_amount;
                    $scope.VO.bankFlow[i].settlementAmounts_bak = $scope.VO.bankFlow[i].settlementAmounts;
                    $scope.VO.bankFlow[i].lender_amount = $scope.VO.bankFlow[i].lender_amount_CNY;
                    $scope.VO.bankFlow[i].settlementAmounts = $scope.VO.bankFlow[i].settlementAmounts_CNY;
                }
            }
            $http.post($rootScope.basePath + "clearingAudit/sendVoucher", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    if (response.code == 456) {
                        //layer.msg(response.msg);
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if (response.code == 200) {
                        if ($scope.VO.isRelife == 'Y') {
                            response.VO.sumPaymount = $scope.VO.sumPaymount_bak;
                            response.VO.sumReceivefeemount = $scope.VO.sumReceivefeemount_bak;
                            for (let i = 0; i < response.VO.bankFlow.length; i++) {
                                response.VO.bankFlow[i].lender_amount = response.VO.bankFlow[i].lender_amount_bak;
                                response.VO.bankFlow[i].settlementAmounts = response.VO.bankFlow[i].settlementAmounts_bak;
                            }
                        }
                        angular.assignData($scope.VO, response.VO);
                        $scope.VO.sapCustomernCode = 4;
                        $scope.isGrid = false;
                        $scope.isBack = true;
                        $scope.isEdit = false;
                        $scope.isDisabled = false;
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                        $scope.html = response.result;
                        ngDialog.openConfirm({
                            showClose: true,
                            closeByDocument: false,
                            template: 'view/clearingAudit/voucher.html',
                            className: 'ngdialog-theme-formInfo',
                            scope: $scope,
                            preCloseCallback: function (value) {
                                if (value && value == "clear") {
                                    //重置
                                    return false;
                                }
                                return true;
                            }
                        }).then(function (value) {

                        }, function (reason) {
                            $scope.isBack = false;
                        });
                    }
                });
        }

        /**
         * 查看凭证
         */
        $scope.onViewVoucher = function () {
            $http.post($rootScope.basePath + "clearingAudit/sendVoucher", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    if (response.code == 456) {
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if (response.code == 200) {
                        angular.assignData($scope.VO, response.VO);
                        $scope.isGrid = false;
                        $scope.isBack = true;
                        $scope.isEdit = false;
                        $scope.isDisabled = false;
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                        $scope.html = response.result;
                        ngDialog.openConfirm({
                            showClose: true,
                            closeByDocument: false,
                            template: 'view/clearingAudit/voucherView.html',
                            className: 'ngdialog-theme-formInfo',
                            scope: $scope,
                            preCloseCallback: function (value) {
                                if (value && value == "clear") {
                                    //重置
                                    return false;
                                }
                                return true;
                            }
                        }).then(function (value) {

                        }, function (reason) {
                            $scope.isBack = false;
                        });
                    }
                });
        }
        /**
         * 过滤查询功能
         */
        /*$scope.onQuery = function () {
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
                if (rows[0].billstatus != 37) return layer.alert("只有暂存状态可以提交!", {skin: 'layui-layer-lan', closeBtn: 1});
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 37) return layer.alert("只有暂存状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            $scope.queryFlowInfo(pkProject, function (response) {
            });

        };


        $scope.onLinkAuditFlow = function () {
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
        };

        $scope.onAudit = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行财务审核!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            if(rows[0].isRelife && 'Y'==rows[0].isRelife && '1'==rows[0].inoutType){
                return layer.alert("再保险应收保费不需要发送凭证!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            if(rows[0].isRelife && 'Y'==rows[0].isRelife && '3'==rows[0].inoutType && (rows[0].collectAdvance && rows[0].collectAdvance == 'Y' && (rows[0].subscriptionno == null || rows[0].subscriptionno == ''))){
                return layer.alert("再保险预收佣金时，需要先认款才能发送凭证!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            layer.load(2);
            $http.post($scope.basePath + "clearingAudit/audit", {data: angular.toJson($scope.VO)}).success(function (response) {
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.feeGridOptions.data = $scope.VO.payTypeDetail;
                    //初始化税率
                    if ($scope.VO.sumReceivefeemount != null && $scope.VO.sumReceivefeemount > 0 && $scope.VO.rate == null) {
                        $scope.VO.rate = 0.06;
                    }
                    //线下自动带出财务客商
                    if ($scope.QUERY.clearingAuditSource == 2 && $scope.VO.rechargeType != null && $scope.VO.rechargeType == 2) {
                        for (let i = 0; i < $scope.clearingBGridOptions.data.length; i++) {
                            //形成函数作用域
                            (function (i) {
                                $http.post($scope.basePath + "sapCustomerRef/findOne", {
                                    data: angular.toJson({name: $scope.clearingBGridOptions.data[i].c0Name.name}),
                                }).success(function (response) {
                                    if (response.code == 200) {
                                        $scope.clearingBGridOptions.data[i].sapCustomerCode = response.data;
                                    }
                                });
                            })(i);
                        }
                    }
                    $scope.isGrid = false;
                    $scope.form = true;
                    $scope.isBack = true;
                    $scope.isDisabled = false;
                    $scope.isEdit = true;
                    $scope.tableStatus($scope.VO.clearingB);
                    //@zhangwj 2022-10-26 只有再保险才计算
                    if($scope.VO.isRelife && $scope.VO.isRelife == 'Y'){
                        // $scope.childTableValueChanged();
                    }
                }
            });
            layer.closeAll('loading');
        };

        $scope.onAuditForm = function () {
            layer.load(2);
            $http.post($scope.basePath + "clearingAudit/audit", {data: angular.toJson($scope.VO)}).success(function (response) {
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.isGrid = false;
                    $scope.form = true;
                    $scope.isBack = false;
                    $scope.isDisabled = false;
                    $scope.isEdit = true;
                }
                layer.closeAll('loading');
            });

        };

        $scope.onAdd = function () {
            $scope.form = true;
            $scope.isClear = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
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
         * 卡片
         */
        $scope.onCard = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1)
                return layer.alert("请选择一条数据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            $scope.findOne(rows[0].id, function () {
                $scope.card = true;
                $scope.isBack = true;
                $scope.isGrid = false;
                $scope.isCard = true;
                $scope.tableStatus($scope.VO.clearingB);
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
                    $http.post($scope.basePath + "clearingAudit/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    $scope.onSaveVO();
                }
            }, true);
        };
        $scope.childTableValueChanged = function () {
            if (!($scope.VO.againRateCNY && Number.parseFloat($scope.VO.againRateCNY) > 0)) {
                $scope.VO.againRateCNY = 1;
            }
            // 计算美元兑人民币结算金额
            for (var i = 0; i < $scope.clearingBGridOptions.data.length; i++) {
                let planMoney = $scope.clearingBGridOptions.data[i].planMoney;
                let factMoney = $scope.clearingBGridOptions.data[i].factMoney;
                $scope.clearingBGridOptions.data[i].planMoney = (Number.parseFloat(planMoney) * Number.parseFloat($scope.VO.againRateCNY)).toFixed(2);
                $scope.clearingBGridOptions.data[i].factMoney = (Number.parseFloat(factMoney) * Number.parseFloat($scope.VO.againRateCNY)).toFixed(2);
            }
            // 计算美元兑人民币到账金额
            for (var i = 0; i < $scope.clearingGridOptions.data.length; i++) {
                let lender_amount = $scope.clearingGridOptions.data[i].lender_amount;
                let settlementAmounts = $scope.clearingGridOptions.data[i].settlementAmounts;
                $scope.clearingGridOptions.data[i].lender_amount_CNY = (Number.parseFloat(lender_amount) * Number.parseFloat($scope.VO.againRateCNY)).toFixed(2);
                $scope.clearingGridOptions.data[i].settlementAmounts_CNY = (Number.parseFloat(settlementAmounts) * Number.parseFloat($scope.VO.againRateCNY)).toFixed(2);
            }
            // 人民币
            $scope.VO.sumPaymountCNY = (parseFloat($scope.VO.sumPaymount) * parseFloat($scope.VO.againRateCNY)).toFixed(2);
            $scope.VO.sumReceivemountCNY = (parseFloat($scope.VO.sumReceivemount) * parseFloat($scope.VO.againRateCNY)).toFixed(2);
            $scope.VO.sumReceivefeemountCNY = (parseFloat($scope.VO.sumReceivefeemount) * parseFloat($scope.VO.againRateCNY)).toFixed(2);
        }
        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            if ($scope.QUERY["operate_date^gte"] && $scope.QUERY["operate_date^lte"]) {
                if (new Date($scope.QUERY["operate_date^gte"]) > new Date($scope.QUERY["operate_date^lte"])) {
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
            $scope[$scope.selectTabName].data.push({});

        };
        /**
         * 子表删除
         */
        $scope.onDeleteLine = function () {
            var delRow = $scope[$scope.selectTabName].gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (var i = 0; i < $scope[$scope.selectTabName].data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope[$scope.selectTabName].data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope[$scope.selectTabName].data.splice(i, 1);
                    }
                }
            }
        };
    };

    $scope.initPage = function () {
        $scope.isClear = false;
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
        $scope.form = false;
        $scope.card = false;

        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;

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
            columnDefs: [
                {name: 'vbillno', displayName: '业务结算编号'},
                {name: 'inoutType', displayName: '结算类型', width: 100,cellFilter: 'SELECT_ITEMTYPE'},
                {
                    name: 'sum_receivemount', displayName: '应收保费总额(元)', cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }, aggregationType: uiGridConstants.aggregationTypes.sum,
                },
                {
                    name: 'sum_paymount', displayName: '解付保费总额(元)', cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }, aggregationType: uiGridConstants.aggregationTypes.sum,
                },
                {
                    name: 'sum_receivefeemount', displayName: '应收佣金总额(元)', cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }, aggregationType: uiGridConstants.aggregationTypes.sum,
                },
                {
                    name: 'sum_consult', displayName: '应收咨询费总额', cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }, aggregationType: uiGridConstants.aggregationTypes.sum,
                },
                {
                    name: 'sum_evaluationfee', displayName: '应收公估费总额', cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }, aggregationType: uiGridConstants.aggregationTypes.sum,
                },
                {name: 'recharge_type', displayName: '结算方式', width: 100, cellFilter: 'SELECT_RECHARGEAUDITTYPE'},
                {name: 'inoutType', displayName: '结算类型', width: 100,cellFilter: 'SELECT_ITEMTYPE'},
                {name: 'sapCustomernCode', displayName: 'SAP 凭证状态', cellFilter: 'SELECT_SAPTYPE'},
                {name: 'sapCenter_name', displayName: '成本中心',},
                {name: 'billstatus', displayName: '单据状态', cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOrg_name', displayName: '业务单位',},
                {name: 'pkOperator_name', displayName: '经办人',},
                {name: 'operate_date', displayName: '制单日期',},
                {name: 'pkAuditor_name', displayName: '审核人',},
                {name: 'check_date', displayName: '审核日期',},
                {name: 'sapDate', displayName: '到账日期',},
            ],
            data: []
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
                    var pkClearing = rows[0].id;
                    if (pkClearing == null) {
                        pkClearing = rows[0].pkClearing;
                    }
                    $scope.findOne(pkClearing);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });


        };

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
                {
                    name: 'lender_amount_CNY', displayName: '贷方金额(人民币)', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    },
                },
                {name: 'settlementAmounts', displayName: '本次结算金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    },
                },
                {name: 'settlementAmounts_CNY', displayName: '本次结算金额(人民币)', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    },
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

        $scope.selectTabName = 'clearingBGridOptions';
        $scope.clearingBGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [],
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
                        if (!($scope.QUERY.clearingAuditSource == 2 && $scope.VO.rechargeType != null && $scope.VO.rechargeType == 2)) {
                            var sapcustomer = $scope.clearingBGridOptions.data[0].sapCustomerCode;
                            if (sapcustomer != null) {
                                var datas = $scope.clearingBGridOptions.data.length;
                                if (datas > 1) {
                                    for (var i = 1; i < $scope.clearingBGridOptions.data.length; i++) {
                                        if (!$scope.clearingBGridOptions.data[i].sapCustomerCode) {
                                            $scope.clearingBGridOptions.data[i].sapCustomerCode = sapcustomer;
                                        }
                                    }
                                }
                            }
                        }
                    });
                }
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
                {name: 'advanceNo', displayName: '预收保费信息编号', enableCellEdit: false},
                {name: 'accountStatement[0].reciprocal_name.name', displayName: '对方账户名称', enableCellEdit: false},
                {name: 'accountStatement[0].reciprocal_account_view', displayName: '对方账号', enableCellEdit: false},
                {
                    name: 'accountStatement[0].lender_amount', displayName: '贷方金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }, aggregationType: uiGridConstants.aggregationTypes.sum,
                },
                {
                    name: 'allMoney', displayName: '可用金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }, aggregationType: uiGridConstants.aggregationTypes.sum,
                },
                {
                    name: 'noPaymentMoney', displayName: '剩余金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
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
                        for (let i = 0; i < $scope.advancePremiumsGridOptions.data.length; i++) {
                            $scope.VO.amount_money = $scope.VO.amount_money + Number.parseFloat($scope.advancePremiumsGridOptions.data[i].clearingMoney);
                        }
                    });
                }
            }
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
                {name: 'insurancetotalcharge', displayName: '支付金额', enableCellEdit: false},
                {name: 'fee', displayName: '手续费', enableCellEdit: false},
                {name: 'company.name', displayName: '实际往来对象', enableCellEdit: false},
            ],
            data: $scope.VO.payTypeDetail
        };

        if ($stateParams.id) {
            $scope.findOne($stateParams.id);
            $scope.isBack = true;
            $scope.isGrid = false;
            $scope.isCard = true;
        }
        /*else {
         $scope.queryForGrid({});
         }*/
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
    };

    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();


});
app.controller('clearingBGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
