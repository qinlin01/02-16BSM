'use strict';

angular.module('lrApp.version.version-directive', [])

.directive('appVersion', ['version', function(version) {
  return function(scope, elm, attrs) {
    console.log(version);
    elm.text(version);
  };
}]);
