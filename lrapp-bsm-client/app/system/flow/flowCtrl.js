/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('flowCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller) {

    $controller('baseController', {
        $rootScope: $rootScope, $scope: $scope, $http: $http, ngVerify: ngVerify
    });

    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                dr: 0,
                groupCode: "",
                groupName: "",
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {"operate_year": new Date().format("yyyy")}
        };
        $scope.QUERY = $scope.initQUERY();
    };

    $scope.initHttp = function () {


        //列表查询
        $scope.queryForGrid = function (data) {
            layer.load(2);
            $http.post($scope.basePath + $scope.url() + "/queryForGrid").success(function (response) {
                if (response.code == 200) {
                    $scope.gridOptions.data = response.data;
                    layer.closeAll('loading');
                } else {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    layer.closeAll('loading');
                }
                layer.closeAll('loading');
            });
        };

    };

    $scope.initFunction = function () {
        $scope.url = function () {
            return "sys/flow";
        }
        $scope.checkDataBeforSave = function () {
            return true;
        }
    };
    $scope.initPage = function () {
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isForm = false;
        $scope.isForm = false;
        $scope.gridOptions = {
            enableRowSelection: true,
            enableRowHeaderSelection: true,
            multiSelect: false,//多选
            useExternalPagination: true,
            columnDefs: [{
                name: 'opreation',
                displayName: '操作',
                width: 59,
                enableColumnMenu: false,
                cellFilter: 'enable',
                pinnedLeft: true,
                // cellTemplate:'<a href="#" ><span class="title label-primary">详情</span></a>'
                cellTemplate: '<div class="ui-grid-cell-contents text-center"><a  class="text-primary" ng-click="grid.appScope.onView(row.entity)"><i class="fa fa-file-text-o"></i>详情</a></div>'
            },
                {name: 'systemType', displayName: '系统标识', width: 200},
                {name: 'flowCode', displayName: '流程编号', width: 200},
                {name: 'flowName', displayName: '流程名称', width: 280}],
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

            $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (rows.length == 1) {
                    $scope.findOne(rows[0].id);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });
        };
    }
    $scope.initButton = function () {
    };


    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initButton();
    $scope.initPage();
    $scope.onQuery();


});


