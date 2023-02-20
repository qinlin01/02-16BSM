/**
 * Created by chenxc on 2017/1/17.
 */
app.controller('businessCtrl', ['$scope', '$http', 'ngDialog', '$state', '$stateParams', '$rootScope','$timeout', function ($scope, $http, ngDialog, $state, $stateParams, $rootScope,ngVerify,uiGridConstants,$timeout) {


    $scope.initData = function () {
        layer.load(2);
        $scope.queryForGroup();
    }
    $scope.result ;
    $scope.queryForGroup= function () {
        $http.post($rootScope.basePath + "business/queryBusiness").success(function (response) {
            if (response.code == 200) {
                $scope.result = response.msgRemind;
                $scope.msgRemind = response.msgRemind;
                $scope.msgRemindList = response.msgRemind[Object.keys(response.msgRemind)[0]];
            }else{
                $state.go('login.signin');
            }
            layer.closeAll('loading');
        })
    };
    $scope.initData();
    $scope.itemSelect = function (item) {
        angular.forEach($scope.result, function(value, key) {
            if(key == item){
                $scope.msgRemindList = value;
            }
        });
    }

    /**
     * 查看由立项触发的流程
     * @param row
     * @returns {*}
     */
    $scope.onView = function (row) {
        var app = row.menuUrl;
        var id = row.id;
        fun_code = row.funCode;
        $http.post($scope.basePath + "account/setFunCode", {fun_code:row.funCode}).success(function (response) {
            $state.go(app,{'id':id},{
                reload:true
            });
        });
    };


}]);

