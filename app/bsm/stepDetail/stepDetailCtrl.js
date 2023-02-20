app.controller('stepDetailCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller) {

    $controller('baseController', {
        $rootScope: $rootScope,
        $scope: $scope,
        $http: $http,
        ngVerify: ngVerify,
        stateParams: $stateParams,
        ngDialog: ngDialog
    });

    $scope.initVO = function () {
        return {}
    };
    $scope.url = function () {
        return "bsm/stepInfo";
    };

    $scope.initView = function () {


        $scope.VO = $scope.initVO();

        $scope.columnDefs = function () {
            return [
                {name: 'reportYear', displayName: '申报年度', width: 170},
                {name: 'reportQuarter', displayName: '申报季度', width: 170, cellFilter: 'SELECT_QUARTER'},
                {name: 'pkProjectApplay.code', displayName: '项目编号', width: 170},
                {name: 'pkProjectApplay.name', displayName: '项目名称', width: 280},
                {name: 'examineDept.name', displayName: '专业审查部门', width: 150},
                {name: 'customer', displayName: '客户名称', width: 280, enableCellEdit: true},
                {name: 'projectCost', displayName: '项目费用（万元）', width: 135, enableCellEdit: true},
                {name: 'income', displayName: '业务收入水平', width: 135, enableCellEdit: true},
                {name: 'projectStatus', displayName: '开展阶段', width: 135, cellFilter: 'SELECT_PROJECT_STATUS',},
                {name: 'contractStatus', displayName: '合同签订情况', width: 135, enableCellEdit: true},
                {name: 'contractAmount', displayName: '合同金额', width: 135, enableCellEdit: true},
                {name: 'payAmount', displayName: '已支付金额', width: 135, enableCellEdit: true},
                {name: 'nextPlan', displayName: '下一步计划', width: 135, enableCellEdit: true},
                {name: 'expectedResults', displayName: '预计成果', width: 135, enableCellEdit: true},
                {name: 'doneInfo', displayName: '预计年内是否完成并说明原因', width: 135, enableCellEdit: true},
                {name: 'changeInfo', displayName: '是否进行预算调整', width: 135, enableCellEdit: true},
                {name: 'storeInfo', displayName: '明年项目储备计划', width: 135, enableCellEdit: true},

            ];
        };

    }
    $scope.initWatch = function () {
    };


    $scope.initButton = function () {

        $scope.export = function () {
            $scope.gridApi.exporter.csvExport('all', 'all', $scope.gridOptions.data);
        };

        //列表查询
        $scope.queryForGrid = function (data) {
            layer.load(2);
            $http.post($scope.basePath + $scope.url() + "/detail", {
                params: angular.toJson(data)
            }).success(function (response) {
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


    $scope.initView();
    $scope.initData();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.funcCode = "302";
    $scope.onQuery();
});
