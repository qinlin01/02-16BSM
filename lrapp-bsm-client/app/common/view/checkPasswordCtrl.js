//校验当前登录人密码
app.controller('checkPasswordCtrl', ['$scope', '$rootScope', '$http', 'ngDialog', 'FileUploader', 'ngVerify', function ($scope, $rootScope, $http, ngDialog, FileUploader, ngVerify) {
    $scope.btnDisabled = false;
    $scope.closeWin = function () {
        //关闭自己的窗口
        ngDialog.close(this.ngDialogId);
    };
    $scope.confirm = function () {
        $scope.ngDialogId = this.ngDialogId;
        $http.post($scope.basePath + "sys/user/checkPassword", {
            userCode: "",
            password: encryptByDES($scope.VO.password, '12345678'),
            confirmPassword: encryptByDES($scope.VO.confirmPassword, '12345678')
        }).success(function (response) {
            if (response.code == 200) {
                $scope.$parent.confirm(response);
                layer.msg(response.msg);
                ngDialog.close();

            } else {
                layer.alert(response.msg);
            }
        });
    };
}]);