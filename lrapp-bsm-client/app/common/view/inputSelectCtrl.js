angular.module("lrApp")
    .directive("insertSelect", [function () {
        return {
            restrict: 'AE',
            templateUrl: 'common/view/inputSelect.html',
            scope: {
                modelData: '=modelData',
                optionList: '=optionList',
                placeholder: '=placeholder',    //placeholder 可由引入页面传入
            },
            link: function ($scope, $elem) {
                //
            },
            controller: ["$scope", function ($scope) {

            }]
        }
    }]);