app.controller('paymentDialogCtrl',
    function ($rootScope, $scope, $http, $q) {

        $scope.queryData = {partner: $scope.VO.partner};
        $scope.payments = [];
        $scope.initView = function () {

            $scope.paymentGridOptions = {
                enableRowSelection: true,
                enableSelectAll: true,
                enableFullRowSelection: true,//是否点击cell后 row selected
                enableRowHeaderSelection: true,
                multiSelect: true,//多选
                useExternalPagination: false,
                columnDefs: [
                    {name: 'contractCode', displayName: '合同编号', width: 180},
                    {
                        name: 'contractName',
                        displayName: '合同名称',
                        width: 280
                    },
                    {name: 'stages', displayName: '期次', width: 75},
                    {name: 'planAmount', displayName: '计划金额（万元）', cellFilter: 'AMOUNT_FILTER', width: 130},
                    {
                        name: 'creditStatus', displayName: '挂账状态', width: 130,
                        cellFilter: 'SELECT_CREDIT_STATUS',
                    },
                ]
            };
            $scope.paymentGridOptions.onRegisterApi = function (gridApi) {
                //set gridApi on scope
                $scope.paymentGridOptions = gridApi;

                //添加行头
                $scope.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
            };
        };

        $scope.initFunction = function () {

            $scope.onRefQuery = function () {

                layer.load(2);
                $http.post($scope.basePath + "bsm/contract/paymentForClearing", {
                    params: angular.toJson($scope.queryData)
                }).success(function (response) {
                    if (response.code == 200) {
                        $scope.paymentGridOptions.data = response.data;
                        layer.closeAll('loading');
                    } else {
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        layer.closeAll('loading');
                    }
                });
            };

            $scope.onCheck = function () {
                var rows = $scope.paymentGridOptions.selection.getSelectedRows();
                if (!rows) {
                    return layer.alert("请选择一条数据进行修改!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                    return false;
                }
                if (rows.length != 1) {
                    return layer.alert("只能选择一条记录进行结算!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }

                $http.post($scope.basePath + "bsm/clearing/checkClearing", {
                    params: angular.toJson(rows)
                }).success(function (response) {
                    if (response.code != 200) {
                        layer.closeAll('loading');
                        layer.msg(response.msg, {icon: 2, time: 2000, shade: [0.5, '#000000', true]});
                    } else {
                        $scope.payments = rows;
                        $scope.confirm(rows);
                    }
                });
            };
        }
        $scope.initView();
        $scope.initFunction();
        $scope.onRefQuery();
    }
)