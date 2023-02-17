app.controller('realityStreamCtrl', function ($rootScope, $scope, $http, $sce, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog,$state,$window) {
    $scope.initData = function (data) {
        $scope.initVO = function () {
            return {
            };
        };
        $scope.status = {open: true};
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "c_0_reciprocal_name":"",
                "c_0_transaction_date_f":"",
                "c_0_transaction_date_l":"",
                "c_0_amount_l":"",
                "c_0_amount_f":""
            }
        };
        $scope.QUERY = $scope.initQUERY();
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            if(null!=data.c_0_transaction_date_f&&null!=data.c_0_transaction_date_l&&""!=data.c_0_transaction_date_l
                &&(data.c_0_transaction_date_l<data.c_0_transaction_date_f)){
                return layer.alert("交易期间结束时间不能小于开始时间!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            if(null!=data.c_0_amount_f&&null!=data.c_0_amount_l
                &&(parseFloat(data.c_0_amount_f)>parseFloat(data.c_0_amount_l))){
                return layer.alert("对账余额区间起不能大于止!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            layer.load(2);
            $http.post($scope.basePath + "realityStream/queryForGrid", {
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

    };


    $scope.initButton = function () {
        /**
         * 匹配
         */
        $scope.onAdd = function () {
            var app = "app.internetBusiness.subscriptionManage.subscriptionManages";
            var fun_code = "180502";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行匹配!", {skin: 'layui-layer-lan', closeBtn: 1});
            var id = rows[0].id;
            $http.post($scope.basePath + "subscriptionManages/getClearing", {params:angular.toJson($rootScope.orgVO),pkDepts:angular.toJson($rootScope.deptVO),id:id}).success(function (response)  {
                if (response && response.code == "200") {
                    $http.post($scope.basePath + "account/setFunCode", {funCode:fun_code}).success(function (response) {
                        layer.closeAll("loading");
                        var url=$state.href(app,{'id':id},{});
                        $window.open(url+"?id="+id);
                    });
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
        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };
        $scope.onReset = function () {
            $scope.QUERY = $scope.initQUERY();
        };

    };

    $scope.initPage = function () {
        $scope.form = false;
        $scope.card = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.isContinue = true;
        $scope.queryShow = true;
        //控制附件上传和下载
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
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '互联网实际到账流水.csv',
            columnDefs: [
                {name: 'transaction_date', displayName: '交易日期'},
                {name: 'transaction_account', displayName: '交易账号'},
                {name: 'transaction_name.unitname', displayName: '交易账户名称'},
                {name: 'reciprocal_account', displayName: '对方账号'},
                {name: 'reciprocal_name.name', displayName: '对方户名'},
                {name: 'bank_name', displayName: '开户行名称'},
                {name: 'borrower_amount', displayName: '贷方金额', cellFilter: 'AMOUNT_FILTER'},
                {name: 'matchingState', displayName: '匹配状态',  cellFilter: 'SELECT_MATCHINGSTATE'},
            ],
            data: [],
            exporterAllDataFn: function () {
                return $scope.queryAllForGrid($scope.QUERY).then(function () {
                    $scope.gridOptions.useExternalPagination = false;
                });
            },
        };
        $scope.gridOptions.onRegisterApi = function (gridApi) {
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
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });
        };
        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
    };


    $scope.table_name = "lr_realitystream";
    $scope.billdef = "actualAccount";
    $scope.initData();
    $scope.initHttp();
    $scope.initButton();
    $scope.initPage();
    $scope.onQuery();
    initworkflow($scope, $http, ngDialog);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);
});