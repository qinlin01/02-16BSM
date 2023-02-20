/**
 * Created by WJ on 2017/10/25.
 */

app.controller('queryReconciliationCtrl', function ($rootScope, $scope, $http,$compile) {
    $scope.status={open : true};
    //初始化查询
    $scope.initQUERY = function () {
        return {
            year:new Date().getFullYear(),month:new Date().getMonth()+1,reconciliationType:001,HKONT:001
        }
    };
    $scope.funCode = '30805';
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
    //列表查询
    /* $scope.queryForGrid = function (data) {
     layer.load(2);
     $http.post($scope.basePath + "paymentQueryRef/queryForGrid", {
     params: angular.toJson(data)
     }).success(function (response) {
     if (response.code == 200) {
     $scope.data = response.result;
     }
     layer.closeAll('loading');
     });
     };
     */
    $scope.queryForGrid = function (data) {
        layer.load(2);
        $http.post($scope.basePath + "queryReconciliation/queryForReport", {
            params: angular.toJson(data)
        }).success(function (response) {
            if (response.code == 200) {
                //$scope.data = response.result;
                var html = $compile(response.result)($scope);
                html.appendTo('#queryReconciliation');
            }
            layer.closeAll('loading');
        });
    };

    /* $scope.queryForGrid = function (data) {


     $http.post($rootScope.basePath + "report5Analysis/queryForReport", {
     reportId : "QueryTotal"
     })
     .success(function (response) {
     if (response.code == 200) {
     var html = $compile(response.result)($scope);
     html.appendTo('.reportShow');
     layer.alert($rootScope.getDisName("查询完成","!"), {skin: 'layui-layer-lan', closeBtn: 1});
     }
     layer.closeAll('loading');
     });
     };*/
});

