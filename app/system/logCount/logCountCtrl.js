app.controller('logCountCtrl', function ($rootScope, $scope, $http) {
    $scope.initData = function (data) {

    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function () {
            layer.load(2);
            $http.post($scope.basePath + "logManager/countLog").success(function (response) {
                if (response.code == 200) {
                    $scope.gridOptions.data = response.result;
                }
                layer.closeAll('loading');
            });
        };
    };

    $scope.initFunction = function () {
    };

    $scope.initWatch = function () {

    };

    $scope.initButton = function () {

    };

    $scope.initPage = function () {

        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;

        $scope.gridOptions = {
            data: [],
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSize: 100,
            useExternalPagination: true,
            enableColumnMoving:true,
            enableGridMenu: true,
            exporterMenuCsv:true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '系统统计日志.csv',
            columnDefs: [
                {name: 'year_month', displayName: '年月', width: 100},
                {name: 'businessCount', displayName: '业务事件数量（次）', width: 100, cellFilter: 'nullToInt'},
                {name: 'systemCount', displayName: '系统事件数量（次）', width: 100, cellFilter: 'nullToInt'},
                {name: 'auditCount', displayName: '审批事件数量（次）', width: 100, cellFilter: 'nullToInt'},
            ],
            exporterAllDataFn: function(){
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

        };



        setTimeout($scope.queryForGrid());
    };

    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();


});

