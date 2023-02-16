/**
 * Created by wangdao on 2016/7/30.
 */
angular.module("lrApp")
  .directive("reference", function () {
    return {
      restrict: 'AECM',
      // template: '<div>hello my directive</div>',

      link: function (scope, element, attrs) {

        // $('[data-toggle="popover"]').popover();


        element.bind("focus", [ "$tooltip", function ($tooltip) {
           $tooltip("popoverHtmlUnsafe", "popover", "click");
        }]);
      }
    };
  });