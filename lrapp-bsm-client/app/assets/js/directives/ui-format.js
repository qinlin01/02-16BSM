'use strict';
var format = angular.module('uiFormat',[]);
format.directive('formatRatio', function($filter) {
    function outputFormatter(modelValue, decimals) {
        var length = decimals || 2;
        if (modelValue != null) {
            return $filter('number')(parseFloat(modelValue) * 100 , length) + '%';
        } else {
            return 0.00+'%';
        }
    };

    function focusFormatter(modelValue, decimals) {
        var length = decimals || 2;
        if (modelValue != null) {
            return $filter('number')(parseFloat(modelValue) * 100 , length);
        } else {
            return null;
        }
    };

    function inputParser(viewValue, decimals) {
        var length = decimals || 4;
        if (viewValue || viewValue == 0) {
            return $filter('number')(parseFloat(viewValue) / 100, length);
        } else {
            return undefined;
        }

    };

    function isWithinBounds(value, upper, lower) {
        if (value >= lower && value <= upper) {
            return true;
        } else {
            return false;
        }
    };

    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            formatbit: '@' 
        },
        link: function(scope, element, attrs, ctrl) {

            var bit = (scope.formatbit !==  undefined  && !isNaN(scope.formatbit) )?  parseInt(scope.formatbit) : 2;
             bit = bit >= 0 ? bit : 2;
            ctrl.$parsers.unshift(function(viewValue) {
                // confirm the input from the view contains numbers, before parsing

                viewValue = viewValue.replace(/%/g,'');
                if(isNaN(viewValue)) return 0;
                var numericStatus = viewValue.match(/(\d+)/),
                    min = parseFloat(attrs.pctMin) || -100,
                    max = parseFloat(attrs.pctMax) || 100,
                    // decimals = parseFloat(attrs.pctDecimals) || 4,

                    //    计算的位数，由传入的参数决定
                    decimals = bit + 2,
                    bounded = isWithinBounds(viewValue, max, min);
                if (numericStatus !== null && bounded) {
                    ctrl.$setValidity('percentage', true);
                    // round to max four digits after decimal
                    return inputParser(viewValue, decimals);
                } else {
                    ctrl.$setValidity('percentage', true);
                    return inputParser(0, decimals);
                }
            });

            ctrl.$formatters.unshift(function (modelValue) {
                var length = bit || 2;
                if (modelValue != null) {
                    return $filter('number')(parseFloat(modelValue) * 100 , length) + '%';
                } else {
                    return 0.00+'%';
                }
            });

            // we have to watch for changes, and run the formatter again afterwards
            element.on('change', function(e) {
                var element = e.target;
                element.value = outputFormatter(ctrl.$modelValue, bit);
            });
            element.on('focus', function(e) {
                var element = e.target;
                element.value = focusFormatter(ctrl.$modelValue, bit);
            });
            element.on('blur', function(e) {
                var element = e.target;
                element.value = outputFormatter(ctrl.$modelValue, bit);
            });
        }
    };
});


format.directive('formatNumber', function($filter) {
    function inputParser(viewValue, decimals) {
        if(!viewValue || isNaN(viewValue) && viewValue != 0 ) return '';
        var length = decimals || 2;
        return parseFloat(viewValue).toFixed(length);
    }
    function outputFormatter(modelValue, decimals) {
        var length = decimals || 2;
        if (modelValue != null) {
            return $filter('number')(parseFloat(modelValue), length);
        } else {
            return '';
        }
    };
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                // confirm the input from the view contains numbers, before parsing
                if(isNaN(viewValue)) return 0;
                var numericStatus = viewValue.match(/(\d+)/);
                if (numericStatus !== null) {
                    ctrl.$setValidity('percentage', true);
                    return inputParser(viewValue, attrs.pctDecimals);
                } else {
                    ctrl.$setValidity('percentage', false);
                    return ''
                }
            });

            ctrl.$formatters.unshift(outputFormatter);

            element.on('change', function(e) {
                var element = e.target;
                element.value = outputFormatter(ctrl.$modelValue, attrs.pctDecimals);
            });
            element.on('focus', function(e) {
                if(isNaN(ctrl.$modelValue)) return 0;
                var element = e.target;
                element.value = inputParser(ctrl.$modelValue, attrs.pctDecimals);
            });
            element.on('blur', function(e) {
                if(isNaN(ctrl.$modelValue)) return 0;
                var element = e.target;
                element.value = outputFormatter(ctrl.$modelValue, attrs.pctDecimals);
            });
        }
    };
});