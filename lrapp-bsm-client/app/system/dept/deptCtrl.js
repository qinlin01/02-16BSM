app.controller('deptCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller, $timeout) {

    $controller('baseController', {
        $rootScope: $rootScope, $scope: $scope, $http: $http, ngVerify: ngVerify
    });

    $scope.orgTreeData = [];
    $scope.selectOrg = {};
    $scope.initVO = function () {
        return {};
    }
    $scope.url = function () {
        return "sys/deptdoc";
    }

    $scope.initData = function (data) {

        //主表数据
        $scope.VO = $scope.initVO();
//初始化查询
        $scope.initQUERY = function () {
            return {"dr": 0};
        };
        $scope.QUERY = $scope.initQUERY();
        $timeout(function () {
            $http.post($scope.basePath + "sys/org/orgTree").success(function (response) {
                if (response.code == 200) {
                    $scope.orgTreeData = response.data;
                }
            });
        });
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
                {name: 'deptcode', displayName: '部门编码', width: 100,},
                {name: 'deptname', displayName: '部门名称', width: 100,},
                {name: 'def4', displayName: '排序', width: 100,},

            ]
        };
    }

    $scope.initFunction = function () {
        $scope.selectItem = function (branch) {
            $scope.QUERY['pk_corp'] = branch.pk;
            $scope.onQuery();
            $scope.selectOrg = branch;
            return branch;
        };


        $scope.onAdd = function () {
            $scope.isGrid = false;
            $scope.isCard = false;
            $scope.isForm = true;
            $scope.isForm = true;
            $scope.initRefData();
            $scope.VO = $scope.initVO();
            $scope.VO.pkCorp = $scope.selectOrg.pk;
            $scope.bindData($scope.VO);
        };
        $scope.checkDataBeforSave = function () {
            return true;
        }
    }
    $scope.initData();
    $scope.initView();
    $scope.initPage();
    $scope.initFunction();
});
