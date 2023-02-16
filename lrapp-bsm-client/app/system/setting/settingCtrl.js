app.controller('settingCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller ) {

    $controller('baseController', {
        $rootScope: $rootScope, $scope: $scope, $http: $http, ngVerify: ngVerify
    });
    $scope.initData = function (data) {
        $scope.VO = {
        };
        layer.load(2);
        $http.post($scope.basePath + "sys/setting/findOne").success(function (response) {
            layer.closeAll('loading');
            if (response && response.code == "200") {
                angular.assignData($scope.VO, response.data);
            } else {
                if (response) {
                    if (response.msg) {
                        // e.g. 字符转换为Entity Name
                        response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                            var rs = asciiChartSet_c2en[matched];
                            return rs == undefined ? matched : rs;
                        });
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                }
            }
        });
    };

    $scope.initHttp = function () {
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + "sys/setting/findOne").success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.data);
                } else {
                    if (response) {
                        if (response.msg) {
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                }
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "sys/setting/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if (response) {
                        $scope.isEdit = false;
                        if (response.msg) {
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        } else {
                            $scope.findOne();
                        }
                    }
                });
        };
    };

    $scope.initButton = function () {
        /**
         * 保存判断必输项
         */
        $scope.onSave = function () {
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    $scope.onSaveVO();
                }
            }, true);
        };
        $scope.onCancel = function () {
            $scope.isEdit = false;
        };
        $scope.onEdit = function () {
            $scope.isEdit = true;
        };
    }

    $scope.initData();
    $scope.initHttp();
    $scope.initButton();
});