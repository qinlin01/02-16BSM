app.controller('downloadCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller, $sce) {

    $controller('baseController', {
        $rootScope: $rootScope,
        $scope: $scope,
        $http: $http,
        $sce: $sce,
        ngVerify: ngVerify,
        stateParams: $stateParams,
        ngDialog: ngDialog
    });

    $scope.funcCode = "401";

    $scope.url = function () {
        return "sys/uploadFile";
    };

    $scope.initPage = function () {

        $http.post($scope.basePath + $scope.url() + "/getFile", {
            sourceId: 'system-download'
        }).success(function (response) {
            if (response.code == 200) {
                $scope.files = response.data;
                layer.closeAll('loading');
            } else {
                layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                layer.closeAll('loading');
            }
            layer.closeAll('loading');
        });
    }


    $scope.initPage();
});
