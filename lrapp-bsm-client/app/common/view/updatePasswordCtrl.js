app.controller('changePasswordCtrl', ['$scope', '$rootScope', '$http', 'ngDialog', 'ngVerify','$state', function ($scope, $rootScope, $http, ngDialog, ngVerify, $state) {
    $scope.btnDisabled = false;
    $scope.closeWin = function () {
        //关闭自己的窗口
        ngDialog.close(this.ngDialogId);
    };
    $scope.updatePwd = function () {
        if (!$scope.VO) {
             layer.msg("请输入信息", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
            return false;
        }
        if (!$scope.VO.oldPassword) {
            layer.msg("请输入原密码", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
            return false;
        }
        if (!$scope.VO.password) {
            layer.msg("请输入新密码", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
            return false;
        }
        if (!$scope.VO.confirmPassword) {
            layer.msg("请输入确认密码", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
            return false;
        }
        var userCode = $scope.response ? $scope.response.data.user.code : $scope.code;
        if ($scope.VO.password == $scope.VO.confirmPassword) {
            $http.post($scope.basePath + "sys/account/checkPassword", {password: encryptByDES($scope.VO.password, '12345678')}).success(function (response) {
                if (response.code != 200) {
                    return layer.msg(response.msg);
                }
                $http.post($scope.basePath + "sys/user/updatePassword", {
                    data: SM2Encrypt(angular.toJson({
                        userCode: userCode,
                        password: encryptByDES($scope.VO.password, '12345678'),
                        confirmPassword: encryptByDES($scope.VO.confirmPassword, '12345678'),
                        oldPassword: $scope.VO.oldPassword
                    }))
                }).success(function (response) {
                    if (response.code == 200) {
                        $http.post(serverApi + "sys/account/logout").success(function (response) {
                            window.sessionStorage.removeItem("token");
                            $state.go('login.signin');
                        })
                        ngDialog.closeAll();
                        return true;
                    } else {
                        layer.alert("系统更新密码失败。");
                        return false;
                    }
                });
            });
        } else {
             layer.alert("新密码与确认密码不匹配");
            return false;
        }
        return true;
    };
    $scope.initWatch = function () {
        $scope.process = {
            style: '',
            progress: 0,
            text: ''
        };
        $scope.$watch('VO.password', function (newVal) {
            if (newVal) {
                $http.post($scope.basePath + "sys/account/checkIntensity", {
                    password: encryptByDES(newVal, '12345678')
                }).success(function (response) {
                    if (response.intensity == '0' || response.intensity == '1') {
                        $scope.process.style = 'red';
                        $scope.process.progress = 20;
                        $scope.process.text = "弱";
                    } else if (response.intensity == '2') {
                        $scope.process.style = 'yellow';
                        $scope.process.progress = 40;
                        $scope.process.text = "中";
                    } else if (response.intensity == '3') {
                        $scope.process.style = 'green';
                        $scope.process.progress = 75;
                        $scope.process.text = "好";
                    } else if (response.intensity == '4') {
                        $scope.process.style = 'green';
                        $scope.process.progress = 80;
                        $scope.process.text = "强";
                    } else if (response.intensity == '5') {
                        $scope.process.style = 'green';
                        $scope.process.progress = 100;
                        $scope.process.text = "极好";
                    }
                });
            } else {
                $scope.process = {
                    style: '',
                    progress: 0,
                    text: ''
                };
            }
        });
    };

    $scope.initWatch();
}]);
