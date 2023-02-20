/**
 * Created by wangdao on 2016/8/4.
 */
'use strict';

angular
    .module('datetimepicker', [])

    .provider('datetimepicker', function () {
        var default_options = {
            locale: 'zh_cn',
            dayViewHeaderFormat: 'YYYY MMMM',
            format: 'YYYY-MM-DD'
        };

        this.setOptions = function (options) {
            default_options = options;
        };

        this.$get = function () {
            return {
                getOptions: function () {
                    return default_options;
                }
            };
        };
    })

    .directive('datetimepicker', [
        '$timeout',
        'datetimepicker',
        function ($timeout,
                  datetimepicker) {

            var default_options = datetimepicker.getOptions();

            return {
                require : '?ngModel',
                restrict: 'AE',
                scope   : {
                    datetimepickerOptions: '@'
                },
                link    : function ($scope, $element, $attrs, ngModelCtrl) {
                    var passed_in_options = $scope.$eval($attrs.datetimepickerOptions);
                    var options = jQuery.extend({}, default_options, passed_in_options);

                    $element
                        .on('dp.change', function (e) {
                            if (ngModelCtrl) {
                                $timeout(function () {
                                    ngModelCtrl.$setViewValue(e.target.value);
                                });
                            }
                        })
                        .datetimepicker(options);

                    function setPickerValue() {
                        var date = options.defaultDate || null;

                        if (ngModelCtrl && ngModelCtrl.$viewValue) {
                            date = ngModelCtrl.$viewValue;
                        }

                        $element
                            .data('DateTimePicker')
                            .date(date);
                    }

                    if (ngModelCtrl) {
                        ngModelCtrl.$render = function () {
                            setPickerValue();
                        };
                    }

                    setPickerValue();
                }
            };
        }
    ]);