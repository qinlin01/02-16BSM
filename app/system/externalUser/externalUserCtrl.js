app.controller('externalUserCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller ) {

    $controller('baseController', {
        $rootScope: $rootScope, $scope: $scope, $http: $http, ngVerify: ngVerify
    });

    $scope.initData = function (data) {
        $scope.initVO = function () {
            return {
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
    };
    $scope.url = function () {
        return "sys/externalUser";
    };

    $scope.initView = function() {

    }
    $scope.initWatch = function () {
    };

    $scope.initButton = function () {


        $scope.checkDataBeforSave = function () {
            return true;
        }
    };

    $scope.initPage = function () {
        $scope.form = false;
        $scope.card = false;

        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isForm = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;
        $scope.disStartDate = true;
        $scope.isCanEdit = true;

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
                {name: 'userCode', displayName: '用户编码', width: 100,},
                {name: 'externalUser', displayName: '外系统用户编码', width: 150,},
                {name: 'sysCode', displayName: '系统编号', width: 150,},
                {name: 'urlType', displayName: '外系统访问地址', width: 200, },
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
                    angular.assignData($scope.VO, row.entity);
                    $scope.findOne(rows[0].pkUser);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });
        };


    };

    $scope.initData();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.onQuery();
});
