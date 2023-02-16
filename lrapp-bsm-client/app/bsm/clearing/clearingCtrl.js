app.controller('clearingCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller) {

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
            clearingB: [],
            dealAttachmentB: [],
            partner: null,
            /** 统一社会信用代码 */
            partnerCode: null,
            /** 账号 */
            partnerAccount: null,
            /** 开户行 */
            partnerBank: null,
            /** 开户行联号 */
            partnerBankNo: null,
            /** 支付金额合计 */
            sumAmount: null,
            /** 计划付款日期 */
            planPayDate: null,
            clearingType: 2,
            taxRate: 0.06,
            invoiceType: 0,
        };
    };

    $scope.initFunction = function () {

        $scope.onAdd = function () {
            $scope.isGrid = false;
            $scope.isCard = false;
            $scope.isForm = true;
            $scope.initRefData();
            $scope.bindData($scope.initVO());

            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: getURL('bsm/clearing/dialog/paymentDialog.html'),
                className: 'ngdialog-theme-plain',
                width: 920,
                height: 500,
                scope: $scope,
            }).then(function (value) {
                $scope.VO.pkPayment = value[0];
                $scope.VO.planAmount = value[0].planAmount;
                if ($scope.VO.pkPayment.creditStatus == 1) {
                    $scope.VO.clearingType = 3;
                    $scope.VO.sumAmount = $scope.VO.pkPayment.creditAmount;
                    $scope.VO.payAmount = $scope.VO.pkPayment.creditAmount;
                }
                console.log(value);
            }, function (reason) {
                console.log(reason);
            });
        }
        $scope.checkDataBeforSave = function () {

            if ($scope.VO.dealAttachmentB.length == 0) {
                layer.msg("请上传付款相关的扫描件。", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                return false;
            }
            // 挂账时，计划金额和发票合计必须相等
            if ($scope.VO.clearingType == 1) {
                if ($scope.VO.sumAmount != $scope.VO.pkPayment.planAmount) {
                    layer.msg("发票合计与合同收付款的金额不符，请检查。", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                    return false;
                }
            }

            if ($scope.VO.clearingType == 2) {
                if ($scope.VO.payAmount != $scope.VO.pkPayment.planAmount) {
                    layer.msg("付款金额与合同收付款的金额不符，请检查。", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                    return false;
                }
            }
            return true;
        }
        $scope.url = function () {
            return "bsm/clearing";
        }

    };
    $scope.initWatch = function () {
        $scope.$watch('VO.pkPayment', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            $scope.VO.partnerCode = "";
            $scope.VO.partner = "";
            $scope.VO.partnerAccount = "";
            $scope.VO.partnerBank = "";
            $scope.VO.partnerBankNo = "";
            $http.post($scope.basePath + $scope.url() + "/customerRef", {
                contractId: $scope.VO.pkPayment.pkContract.pk,
            }).success(function (response) {
                if (response.code == 200) {
                    $scope.VO.partnerCode = response.data.partnerCode;
                    $scope.VO.partner = response.data.partner;
                    $scope.VO.partnerAccount = response.data.partnerAccount;
                    $scope.VO.partnerBank = response.data.partnerBank;
                    $scope.VO.partnerBankNo = response.data.partnerBankNo;
                }
            });
        }, true);
        $scope.$watch('VO.clearingB', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            var params = $scope.VO.clearingB;
            $scope.VO.sumAmount = 0;

            angular.forEach(params, function (obj, index) {
                if (params[index] && params[index].data && params[index].data.leviedTotal) {
                    $scope.VO.sumAmount += parseFloat(params[index].data.leviedTotal);
                }
            });
        }, true);
    }
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
                {name: 'serialNumber', displayName: '付款编号', width: 200},
                {name: 'clearingName', displayName: '付款名称', width: 250},
                {name: 'clearingType', displayName: '付款类型', width: 100, cellFilter: 'SELECT_CLEARING_TYPE'},
                {name: 'pkContract.code', displayName: '合同编号', width: 200},
                {name: 'pkContract.name', displayName: '合同名称', width: 250},
                {name: 'pkPayment.stages', displayName: '付款期次', width: 120},
                {name: 'planPayDate', displayName: '付款日期', width: 170,},
                {name: 'partner', displayName: '合作单位', width: 230,},
                {
                    name: 'sumAmount', displayName: '付款申请金额', width: 170, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'payAmount', displayName: '本次付款金额', width: 170, cellFilter: 'AMOUNT_FILTER',
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

        $scope.clearingBGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'isEnabled',
                    displayName: '',
                    width: 50,
                    enableColumnMenu: false,
                    cellFilter: 'enable',
                    enableCellEdit: false,
                    cellTemplate: '<div class="ui-grid-cell-contents text-center"><a href="#" class="btn btn-transparent btn-xs" ng-click="grid.appScope.onDeleteLine(\'clearingBGridOptions\', row)"><i class="fa fa-times fa fa-white text-red"></i></a></div>'
                },
                {
                    name: 'data.invoiceNo',
                    displayName: '发票号',
                    width: 120,
                    enableCellEdit: true,
                },
                {
                    name: 'data.leviedTotal',
                    displayName: '价税合计',
                    width: 120,
                    enableCellEdit: true,
                    cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'data.tax',
                    displayName: '税额',
                    width: 120,
                    enableCellEdit: true,
                    cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'data.taxExclusive',
                    displayName: '不含税',
                    width: 120,
                    enableCellEdit: true,
                    cellFilter: 'AMOUNT_FILTER'
                }, {
                    name: 'data.memo',
                    displayName: '说明',
                    width: 300,
                    enableCellEdit: true,
                },
            ],
            onRegisterApi: function (gridApi) {
                $scope.clearingBGridOptions.gridApi = gridApi;
                $scope.clearingBGridOptions.data = $scope.VO.clearingB;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if (rowEntity.data && 'data.leviedTotal' == colDef.name && $scope.VO.taxRate != null) {
                            rowEntity.data.taxExclusive = (parseFloat(rowEntity.data.leviedTotal) / (1 + parseFloat($scope.VO.taxRate))).toFixed(2);
                            rowEntity.data.tax = (rowEntity.data.leviedTotal - rowEntity.data.taxExclusive).toFixed(2);
                        }
                    });
                }
            }
        };

    }


    $scope.initData();
    $scope.initView();
    $scope.initPage();
    $scope.initFunction();
    $scope.initWatch();
    // $scope.onQuery();
    $scope.funcCode = "808";
    $scope.fromNav();
    $scope.onQuery();
});
