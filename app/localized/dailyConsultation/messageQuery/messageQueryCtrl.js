app.controller('messageQueryCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog) {
    $scope.initData =function (data) {
        $scope.status = {open: true};
        $scope.initVO= function () {
            return{
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                dr:0,
            }
        };

        $scope.entityVO = 'nc.vo.busi.messageQueryVO';
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "id": $stateParams.id,
                "service_year":parseInt(new Date().format("yyyy"))
            }
        };
        $scope.QUERY = $scope.initQUERY();
    };

    $scope.initHttp=function(){
        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data, fun) {
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridOptions.columnDefs;
            }
            $http.post($scope.basePath + "messageQuery/queryAllForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                fields: angular.toJson($scope.queryData),
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
            }).success(function (response) {
                if (response.code == 200) {
                    if (fun) fun(response);
                    window.open($rootScope.basePath + "uploadFile/downLoadByUrl?url=" + encodeURI(encodeURI(response.downPath)));
                    layer.closeAll('loading');
                }
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
            $http.post($scope.basePath + "messageQuery/queryForGrid", {
                params: angular.toJson(data),
                query:angular.toJson($scope.QUERY),
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
                if (response.code == 500) {
                    return layer.alert(response.msg);
                }
                layer.closeAll('loading');
            });
        };

    };

    $scope.initFunction = function () {
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function(item){
            if(item && item.id){
                $scope.onCard(item.id);
            }

        };
    };


    $scope.initButton = function(){
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
    };


    $scope.initPage = function () {
        $scope.isClear = false;
        $scope.isShow = true;
        //阻止页面渲染
        $scope.form = false;
        $scope.card = false;
        //阻止页面渲染
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.isDisableds = false;
        $scope.isreplace = true;
        $scope.queryShow = true;
        //控制附件上传和下载
        $scope.upOrDown = true;
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
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '短信查询信息.csv',
            columnDefs: [
                {name: 'NAME', displayName: '项目名称/机构',width:300 },
                {name: 'INDUSTRY_NAME', displayName: '联系人类型',width:100},
                {name: 'CONNECTER', displayName: '联系人',width:100},
                {name: 'TEL', displayName: '联系人电话',width:100},
                {name: 'REGION_CODE', displayName: '联系人所在地',width:110},
                {name: 'RISK_NAME', displayName: '风险名称',width:100},
                {name: 'SEND_TIME', displayName: '发送日期',width:100},
                {name: 'sendDate', displayName: '发送时间',width:100},
                {name: 'SEND_STAT', displayName: '发送状态',width:100},
                {name: 'MESSAGE', displayName: '短信内容',width:1500},
            ],
            data: [],

            exporterAllDataFn: function () {
                $scope.queryAllForGrid($scope.QUERY);
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
                    $scope.findOne(rows[0].id);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });

        };
    };

    $scope.table_name = "T_WARN_INFO_HIS";
    $scope.billdef = "";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initButton();
    $scope.initPage();
    $scope.onQuery();
    initworkflow($scope, $http,ngDialog);
    initonlineView($scope,$rootScope,$sce,$http,ngDialog);
});