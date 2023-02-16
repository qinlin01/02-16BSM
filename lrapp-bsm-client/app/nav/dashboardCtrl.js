/**
 * Created by chenxc on 2017/1/17.
 */
app.controller('dashboardCtrl', ['$scope', '$http', 'ngDialog', '$state', '$stateParams', '$rootScope', '$timeout', function ($scope, $http, ngDialog, $state, $stateParams, $rootScope, $timeout) {
    /**
     * 初始化页面变更方法 0代办  1已办
     */
    $scope.initData = function () {
        $scope.queryForList(0);
    }

    $scope.queryForList = function (process_status) {
        $http.post($rootScope.basePath + "bsm/task/queryForGrid", {
            process_status: process_status
        }).success(function (response) {
            if (response.code == 200) {
                $scope.listTask = response.data;
            }
        })
    };
    /**
     *
     * @param row
     * @returns {*}
     */
    $scope.onView = function (funcCode, id) {
        layer.load(2);
        $http.post($scope.basePath + "sys/menu/findOne", {pk: funcCode}).success(function (response) {
            layer.closeAll("loading");
            var temp = "";

            if (response.code == 200) {
                if (funcCode == 811) {
                    temp = "bsm/agreement/agreement.html";
                } else if (funcCode == 801) {
                    temp = "bsm/projectApply/projectApply.html";
                } else if (funcCode == 807) {
                    temp = "bsm/contract/contract.html";
                } else if (funcCode == 811) {
                    temp = "bsm/acceptance/acceptance.html";
                } else if (funcCode == 808) {
                    temp = "bsm/clearing/clearing.html";
                } else if (funcCode == 809) {
                    temp = "bsm/acceptance/acceptance.html";
                } else if (funcCode == 810) {
                    temp = "bsm/frameworkApply/frameworkApply.html";
                } else if (funcCode == 811) {
                    temp = "bsm/agreement/agreement.html";
                }else if (funcCode == 805) {
                    temp = "bsm/projectChange/projectChange.html";
                }else if (funcCode == 812) {
                    temp = "bsm/stepInfo/stepInfo.html";
                }
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: false,
                    template: getURL(temp),
                    className: 'ngdialog-theme-plain',
                    width: 1250,
                    scope: $scope,
                    resolve: {
                        $stateParams: function () {
                            $stateParams.pk = id;
                            return $stateParams;
                        }
                    }
                }).then(function (value) {

                }, function (reason) {
                    $scope.queryForList(0);
                });
                // $state.go(response.data.menuUrl, {'id': id, 'funcCode': funcCode}, {
                //     reload: true
                // });
            }

        });
    };

    $scope.initData();
}]);

