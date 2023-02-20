angular.module("lrApp")
    .directive("projectInfo", [function () {
        return {
            restrict: 'AE',
            templateUrl: 'bsm/common/commonProject.html',
            scope: {
                data: '=data',
            },
            link: function ($scope, $elem) {
                //
            },
            controller: ["$scope", function ($scope) {

            }]
        }
    }]);