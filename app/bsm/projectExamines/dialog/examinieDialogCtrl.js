app.controller('examinesDialogCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller) {

    $scope.initData = function () {

        $scope.examines = {
            examineOpinion: 1,
            examineMsg: "",
        };
        if ($scope.checkType == 1) {
            $scope.examines.examineMsg ="同意。";

        } else {
            // $scope.examines.examineMsg ="该项目因xx具有开展的必要性。经审查，该单位以前年度未开展类似项目，本年度其他单位未开展类似项目。";
        }
    }
    $scope.initFunction = function () {
        $scope.check = function () {
            if ($scope.examines.examineMsg == "") {
                layer.msg('请填写审查意见。', {icon: 2, time: 2000, shade: [0.5, '#000000', true]});
                return false;
            }
            if ($scope.checkType == 0 && $scope.examines.examineMsg.length < 10) {
                layer.msg('请正确描述该项目开展的必要性。', {icon: 2, time: 2000, shade: [0.5, '#000000', true]});
                return false;
            }
            return true;
        };
    };

    $scope.initwatch = function () {
        $scope.$watch('examines.examineOpinion', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if (newVal != 1) {
                $scope.examines.examineMsg = "";
            } else {
                if ($scope.checkType == 1) {
                    // 如果已经输入了意见，就不默认了
                    if ($scope.examines.examineMsg.length == 0) {
                        $scope.examines.examineMsg ="同意。";
                    }
                } else {
                    // $scope.examines.examineMsg ="该项目因xx具有开展的必要性。经审查，该单位以前年度未开展类似项目，本年度其他单位未开展类似项目。";
                }
            }
        }, true);
    };


    $scope.initData();
    $scope.initFunction();
    $scope.initwatch();
});