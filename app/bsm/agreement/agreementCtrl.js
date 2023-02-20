app.controller('agreementCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller) {

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
            };
        };

        $scope.checkDataBeforSave = function () {
            $scope.VO.payments = $scope.paymentsGrid.data;
            if ($scope.VO.changePament == 1) {
                if ($scope.VO.payments.length == 0) {
                    layer.msg("当涉及到合同金额变更时，收付款信息不能为空。", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                    return false;
                }
                var paymentSum = 0;
                angular.forEach($scope.VO.payments, function (item, index) {
                    paymentSum = paymentSum + item.planAmount;
                });
                var sum = parseFloat($scope.contract.contractAmount) + parseFloat($scope.VO.agreementAmount);
                if (paymentSum - sum != 0) {
                    layer.msg("各期收付款的合计不等于合同金额+协议金额，请检查收款信息。", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                    return false;
                }
                // if (paymentSum != $scope.VO.agreementAmount) {
                //     layer.msg("各期收付款的合计不等于协议金额，请检查收款信息。", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                //     return false;
                // }
            }

            return true;
        }
        $scope.url = function () {
            return "bsm/agreement";
        }

        $scope.initWatch = function () {

            $scope.$watch('VO.pkRpaContract', function (newVal, oldVal) {
                if (!$scope.isForm) {
                    return;
                }
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                if (newVal != null) {
                    $scope.VO.agreementName = newVal.name;
                    $scope.VO.agreementAmount = newVal.money;
                } else {
                    $scope.VO.agreementName = "";
                    $scope.VO.agreementAmount = "";
                }
            }, true);

            $scope.$watch('VO.pkContract', function (newVal, oldVal) {
                if (!$scope.isForm) {
                    return;
                }
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                var id = $scope.VO.pkContract.pk;
                $scope.paymentsGrid.data = [];
                $scope.VO.changePament = null;
                // $http.post($scope.basePath + "bsm/contract/findOne", {pk: id}).success(function (response) {
                //     layer.closeAll('loading');
                //     if (response && response.code == 200) {
                //         $scope.VO.payments = response.data.payments;
                //     }
                // });
            }, true);
            $scope.$watch('VO.changePament', function (newVal, oldVal) {
                if (!$scope.isForm) {
                    return;
                }
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                var id = $scope.VO.pkContract.pk;
                $http.post($scope.basePath + "bsm/contract/findOne", {pk: id}).success(function (response) {
                    layer.closeAll('loading');
                    if (response && response.code == 200) {
                        $scope.contract = response.data;
                        $scope.paymentsGrid.data = [];
                        angular.forEach(response.data.payments, function (item, index) {
                            $scope.paymentsGrid.data.push(item);
                        });
                    }
                });
            }, true);
        };

        $scope.initButton = function () {

            $scope.beforEdit = function () {
                $http.post($scope.basePath + "bsm/contract/findOne", {pk: $scope.VO.pkContract.pk}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == 200) {
                            $scope.contract = response.data;
                        }
                    }
                );
            }

            /**
             * 子表新增
             */
            $scope.onAddPaymentLine = function () {
                $scope.paymentsGrid.data.push({});
                var array = $scope.paymentsGrid.data;
                for (var i = 0; i < array.length; i++) {
                    array[i].indexs = i + 1;
                    if (i == array.length) {
                        array[i].rate = 0;
                    }
                }
                $scope.paymentsGrid.data = array;

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
                    {name: 'pkProject.name', displayName: '项目名称', width: 270,},
                    {name: 'pkRpaContract.name', displayName: '协议名称', width: 230,},
                    {name: 'pkRpaContract.code', displayName: '协议编号', width: 170,},
                    {
                        name: 'agreementAmount', displayName: '合同金额（元）', width: 140,
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

            $scope.paymentsGrid = {
                enableCellEditOnFocus: true,
                enableSelectAll: true,
                enableSorting: false,
                enableRowHeaderSelection: true,
                showColumnFooter: false,
                columnDefs: [
                    {
                        name: 'stages',
                        displayName: '支付期次',
                        width: 125,
                        type: 'number',
                        cellEditableCondition: function ($scope, triggerEvent) {
                            console.log($scope.row.entity.clearingCode);
                            if ($scope.row.entity.clearingCode == undefined) {
                                return true;
                            }
                            return $scope.row.entity.clearingCode == '';
                        },
                    },
                    {
                        name: 'planRatio', displayName: '支付比例(%)', width: 120, type: 'radio',
                        cellClass: function () {
                            return "lr-text-right"
                        },
                        // enableCellEdit: true,
                        cellEditableCondition: function ($scope, triggerEvent) {
                            if ($scope.row.entity.clearingCode == undefined) {
                                return true;
                            }
                            return $scope.row.entity.clearingCode == '';
                        },
                    },
                    {
                        name: 'planAmount', displayName: '计划金额（元）', width: 120,
                        cellClass: function () {
                            return "lr-text-right"
                        },
                        cellEditableCondition: function ($scope, triggerEvent) {
                            if ($scope.row.entity.clearingCode == undefined) {
                                return true;
                            }
                            return $scope.row.entity.clearingCode == '';
                        },
                        type: 'number',
                    },
                    {
                        name: 'payConditions',
                        displayName: '支付条件',
                        width: 200,
                        enableCellEdit: true,
                        cellEditableCondition: function ($scope, triggerEvent) {
                            if ($scope.row.entity.clearingCode == undefined) {
                                return true;
                            }
                            return $scope.row.entity.clearingCode == '';
                        },
                    },
                    {
                        name: 'clearingCode',
                        displayName: '付款申请编号',
                        width: 200,
                        enableCellEdit: false,
                    },
                    {
                        name: 'isEnabled',
                        displayName: '',
                        width: 50,
                        enableColumnMenu: false,
                        cellFilter: 'enable',
                        cellEditableCondition: function ($scope, triggerEvent) {
                            if ($scope.row.entity.clearingCode == undefined) {
                                return true;
                            }
                            return $scope.row.entity.clearingCode == '';
                        },
                        cellTemplate:
                            '<div  ng-if="row.entity.clearingCode == undefined|| row.entity.clearingCode == \'\'" class="ui-grid-cell-contents lr-text-center"><a href="#" class="btn btn-transparent btn-xs" ng-click="grid.appScope.onDeleteLine(\'paymentsGrid\', row)"><i class="fa fa-times fa fa-white text-red"></i></a></div>'
                    },

                ],
                data: $scope.VO.payments,
                onRegisterApi: function (gridApi) {
                    $scope.paymentsGrid.gridApi = gridApi;
                    $scope.paymentsGrid.data = $scope.VO.payments;
                    // if (gridApi.edit) {
                    //     gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                    //         if ('planRatio' == colDef.name && $scope.VO.agreementAmount != null) {
                    //             rowEntity.planAmount = parseFloat((parseFloat($scope.VO.agreementAmount) * parseFloat(rowEntity.planRatio) / 100).toFixed(2));
                    //         }
                    //     });
                    // }
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
        $scope.funcCode = "811";
    }
)
;
