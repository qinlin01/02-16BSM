app.controller('contractCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller) {

        $controller('baseController', {
            $rootScope: $rootScope,
            $scope: $scope,
            $http: $http,
            ngVerify: ngVerify,
            stateParams: $stateParams,
            ngDialog: ngDialog
        });

        $scope.initVO = function () {
            return {
                payments: [],
                dealAttachmentB: [],
                contractAmount: 0,
            };
        };

        $scope.checkDataBeforSave = function () {

            if ($scope.VO.ifFramework == 0) {
                if ($scope.VO.payments.length == 0) {
                    layer.msg("合同的收付款信息不能为空，请输入。", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                    return false;
                }
                var paymentSum = 0;
                var payConditions = true;
                angular.forEach($scope.VO.payments, function (item, index) {
                    paymentSum = paymentSum + parseFloat(item.planAmount);
                    // 只要有一个付款条件是空，就要返回false
                    if (payConditions == false || item.payConditions == null) {
                        payConditions = false;
                    }
                });
                if (payConditions == false) {
                    layer.msg("收付款中的付款条件不能为空，请检查。", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                    return false;
                }
                if ($scope.VO.contractAmount != paymentSum) {
                    layer.msg("收付款中的计划金额合计与合同金额不符。", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                    return false;
                }
            }

            if ($scope.VO.dealAttachmentB.length == 0) {
                layer.msg("请上传合同扫描件。", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                return false;
            }
            return true;
        }
        $scope.url = function () {
            return "bsm/contract";
        }

        $scope.initWatch = function () {

            $scope.$watch('VO.pkProject', function (newVal, oldVal) {
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                if (!$scope.isForm) {
                    return;
                }

                $http.post($scope.basePath + "bsm/project/getById", {pk: $scope.VO.pkProject.pk}).success(function (response) {
                    if (response.code == 200) {
                        if (response.data.projectEpibolyType != null && response.data.projectEpibolyType == 1) {
                            $scope.VO.ifFramework = 1;
                            $scope.VO.payments = [];
                        } else {
                            $scope.VO.ifFramework = 0;
                        }

                    }
                    layer.closeAll('loading');
                });

            }, true);

            $scope.$watch('VO.pkRpaContract', function (newVal, oldVal) {
                if (!$scope.isForm) {
                    return;
                }
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                if (newVal != null) {
                    $scope.VO.contractCode = newVal.code;
                    $scope.VO.contractName = newVal.name;
                    $scope.VO.contractAmount = newVal.money;
                    $scope.VO.partner = newVal.partner;
                } else {
                    $scope.VO.contractCode = "";
                    $scope.VO.contractName = "";
                    $scope.VO.contractAmount = "";
                    $scope.VO.partner = "";
                }
            }, true);
        };

        $scope.initButton = function () {

            $scope.onView = function (item) {
                if (item == null)
                    return layer.msg("请选择一条数据进行查看!", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                $http.post($scope.basePath + $scope.url() + "/findOne", {
                    pk: item.id
                }).success(function (response) {
                    if (response && response.code == 200) {
                        angular.assignData($scope.VO, response.data);
                        $scope.isGrid = false;
                        $scope.isCard = true;
                        $scope.isForm = false;
                        angular.forEach($rootScope.currentTabs, function (item, index) {
                            if ($scope.funcCode == item.id) {
                                item.billId = $scope.VO.id;
                            }
                        });
                        $http.post($scope.basePath + "bsm/agreement/findByContract", {
                            contractId: item.id
                        }).success(function (res) {
                            if (res && res.code == 200) {
                                $scope.agreements = res.data;
                            }
                        });
                    } else {
                        if (response) {
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                });
            }

            /**
             * 子表新增
             */
            $scope.onAddPaymentLine = function () {
                $scope.paymentsGridOptions.data.push({});
                var array = $scope.paymentsGridOptions.data;
                for (var i = 0; i < array.length; i++) {
                    array[i].indexs = i + 1;
                    if (i == array.length) {
                        array[i].rate = 0;
                    }
                }
                $scope.paymentsGridOptions.data = array;

            };

        };

        $scope.initView = function () {
            $scope.columnDefs = function () {
                return [
                    {
                        name: 'isEnabled',
                        displayName: '操作',
                        width: 59,
                        enableColumnMenu: false,
                        cellFilter: 'enable',
                        pinnedLeft: true,
                        cellTemplate: '<div class="ui-grid-cell-contents text-center"><a  class="text-primary" ng-click="grid.appScope.onView(row.entity)"><i class="fa fa-file-text-o"></i>详情</a></div>'
                    },
                    {name: 'pkProject.code', displayName: '项目编号', width: 270,},
                    {name: 'pkProject.name', displayName: '项目名称', width: 270,},
                    {name: 'contractName', displayName: '合同名称', width: 230,},
                    {name: 'contractCode', displayName: '合同编号', width: 190,},
                    {name: 'ifFramework', displayName: '合同类型', width: 170, cellFilter: 'SELECT_CONTRACT_TYPE'},
                    {name: 'partner', displayName: '合作单位', width: 170,},
                    {name: 'purchaseType', displayName: '采购方式', width: 100, cellFilter: 'SELECT_PURCHASE'},
                    {
                        name: 'contractAmount', displayName: '合同金额（元）', width: 140,
                        cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                    {name: 'createdUser.name', displayName: '经办人', width: 100,},
                    {name: 'createdTime', displayName: '制单日期', width: 90, cellFilter: 'date:"yyyy-MM-dd"'},
                    {name: 'createdOrg.name', displayName: '业务单位', width: 100,},
                    {name: 'createdDept.name', displayName: '业务部门', width: 100,},
                ]
            };

            $scope.paymentsGridOptions = {
                enableCellEditOnFocus: true,
                enableSelectAll: true,
                enableSorting: false,
                enableRowHeaderSelection: true,
                showColumnFooter: false,
                columnDefs: [
                    {name: 'stages', displayName: '支付期次', width: 125, type: 'number'},
                    {
                        name: 'planRatio', displayName: '支付比例(%)', width: 120, type: 'radio',
                        cellClass: function () {
                            return "lr-text-right"
                        },
                        enableCellEdit: true,
                    },
                    {
                        name: 'planAmount', displayName: '计划金额（元）', width: 120,
                        cellClass: function () {
                            return "lr-text-right"
                        },
                        enableCellEdit: true, type: 'number',
                    },
                    {name: 'payConditions', displayName: '支付条件', width: 200, enableCellEdit: true,},
                    {
                        name: 'isEnabled',
                        displayName: '',
                        width: 50,
                        enableColumnMenu: false,
                        cellFilter: 'enable',
                        enableCellEdit: false,
                        cellTemplate: '<div class="ui-grid-cell-contents text-center"><a href="#" class="btn btn-transparent btn-xs" ng-click="grid.appScope.onDeleteLine(\'clearingBGridOptions\', row)"><i class="fa fa-times fa fa-white text-red"></i></a></div>'
                    },
                ],

                onRegisterApi: function (gridApi) {
                    $scope.paymentsGridOptions.gridApi = gridApi;
                    $scope.paymentsGridOptions.data = $scope.VO.payments;
                    if (gridApi.edit) {
                        gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                            if ('planRatio' == colDef.name && $scope.VO.contractAmount != null) {
                                rowEntity.planAmount = (parseFloat($scope.VO.contractAmount) * parseFloat(rowEntity.planRatio) / 100).toFixed(2);
                            }
                        });
                    }
                }
            };
        };


        $scope.initRefData = function () {
            $scope.projectRefData = [];
            $http.post($scope.basePath + "bsm/project/projectRef").success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == 200) {
                    $scope.projectRefData = response.data;
                }
            });
        };

        $scope.initData();
        $scope.initView();
        $scope.initWatch();
        $scope.initButton();
        $scope.initPage();
        $scope.fromNav();
        $scope.onQuery();
        $scope.funcCode = "807";
        $scope.instructions = "合同相关文件";
    }
)
;
