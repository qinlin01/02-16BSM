/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('voucherHeaderCtrl', function ($rootScope, $scope, $http,$compile) {
    $scope.status={open : true};
    $scope.initVO = function () {
        return {
            pkOperator: $rootScope.userVO,
            pkOrg:$rootScope.orgVO,
            pkDept:$rootScope.deptVO,
            operateDate:new Date().format("yyyy-MM-dd"),
            operateTime:new Date().format("yyyy-MM-dd HH:mm:ss"),
        };
    };
    $scope.VO = $scope.initVO();
    //初始化查询
    $scope.initQUERY = function () {
        return {
            year:new Date().getFullYear(),month:new Date().getMonth()+1

        }
    };
    $scope.funCode = '30804';
    $scope.QUERY = $scope.initQUERY();
    $scope.onQuery = function () {
        $scope.queryForGrid($scope.QUERY);
    };
    $scope.onReset = function () {
        $scope.QUERY = $scope.initQUERY();
    };
    $scope.changeOpen = function () {
        $scope.status.open = !$scope.status.open;
    };

    $scope.queryForGrid = function (data) {
        layer.load(2);
        $http.post($scope.basePath + "voucherHeader/queryForGrid", {
            params: angular.toJson(data)
        }).success(function (response) {
            if (response.code == 200) {
                $scope.data = response.result;
                $scope.gridOptions.data = response.result.Rows;
                $scope.gridOptions.totalItems = response.result.Total;
                // var html = $compile(response.result)($scope);
                // html.appendTo('#paymentQuery');
/*                layer.alert("查询完成！", {skin: 'layui-layer-lan', closeBtn: 1});*/
            }
            layer.closeAll('loading');
        });
    };

    $scope.findOne = function (pk) {
        $scope.pk = pk;
        $http.post($scope.basePath + "voucherHeader/findOne", {pk: pk}).success(function (response) {
            layer.closeAll('loading');
            if (response && response.code == "200") {
                angular.assignData($scope.VO, response.result);
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
              //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
            }
        });
    };



    $scope.initPage = function () {

        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;
        $scope.gridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [20,50,100],
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {name: 'serial_number', displayName: '业务系统凭证号', width: 100,},
                {name: 'belnr_sap', displayName: 'SAP凭证号', width: 100,},
                {name: 'vbillno', displayName: '结算单号', width: 100,},
                {name: 'gjahr', displayName: '会计年度', width: 100,},
                {name: 'monat', displayName: '会计期间', width: 100,},
                {name: 'budat', displayName: '记账日期', width: 100,},
                {name: 'bldat', displayName: '凭证日期', width: 100,},
                {name: 'waers', displayName: '货币代码', width: 100,},
                {name: 'usnam', displayName: '凭证创建人', width: 100,},
                {name: 'voucher_type', displayName: '凭证类型', width: 100,},
                {name: 'deptname', displayName: '保单建立部门', width: 100,},
                {name: 'is_rollback', displayName: '是否被冲销', width: 100,},
                {name: 'voucher_status', displayName: '凭证状态', width: 100,},
                {name: 'summoney', displayName: '金额合计', width: 100,},
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
                if(rows.length == 1) {
                    $http.post($scope.basePath + "voucherHeader/findChildByPk", {pk: rows[0].pk_caib_sap_voucher}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.accountGridOptions.data = response.result;
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
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });
        };
        $scope.selectTabName = 'accountGridOptions';
         $scope.accountGridOptions = {
         enableCellEditOnFocus: true,
         enableRowSelection: true,
         enableSelectAll: true,
         multiSelect: true,
         enableSorting: true,
         enableRowHeaderSelection: true,
         showColumnFooter: false,
         columnDefs: [
         {name: 'DESCRIPTION', displayName: '分录描述', width: 100},
         {name: 'HKONT_NAME', displayName: '科目', width: 100},
         {name: 'SHKZG', displayName: '借方/贷方标识', width: 100},
         {name: 'WRBTR', displayName: '凭证货币金额', width: 100,},
         {name: 'KDNUM', displayName: '往来单位', width: 100,},
         {name: 'NAMEA', displayName: '供应商名称', width: 100,},
         {name: 'KOSTL', displayName: 'SAP成本中心代码', width: 100,},
         {name: 'KOSTL_NAME', displayName: 'SAP成本中心名称', width: 100,},
         {name: 'RSTGR', displayName: '现金流量标识代码', width: 100,},
         ],
         data: [],
         onRegisterApi: function (gridApi) {
         $scope.accountGridOptions.gridApi = gridApi;
         }
         };



    };

    $scope.initPage();
});
