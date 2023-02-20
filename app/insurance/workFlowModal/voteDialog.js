/**
 * Created by jiaoshy on 2017/6/29.
 */
(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        // CommonJS
        if (typeof angular === 'undefined') {
            factory(require('angular'));
        } else {
            factory(angular);
        }
        module.exports = 'voteDialog';
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(['../../../bower_components/angular/angular'], factory);
    } else {
        // Global Variables
        factory(root.angular);
    }
}(this, function (angular) {
    var m = angular.module('voteDialog', []);

    m.provider('voteDialog', function () {

        this.$get = ['$document', '$templateCache', '$compile', '$q', '$http', '$rootScope', '$timeout', '$window', '$controller', '$injector', 'ngDialog',
            function ($document, $templateCache, $compile, $q, $http, $rootScope, $timeout, $window, $controller, $injector, ngDialog) {
                var $element = [];

                var defaultConfig = {
                    url: null,
                    taskId: null,                        //流程实例id
                    source_bill: null,                        //所选数据主键
                    source_name: null,                         //待办主键
                    resultHandler: null
                };

                var privateMethods = {};
                var publicMethods = {
                    __PRIVATE__: privateMethods,


                    open: function (opts) {
                        var _config = angular.merge(defaultConfig, opts)
                        var data = {data: _config};
                        // alert(msg)
                        $http.post($rootScope.basePath + "workFlowMadelController/queryVoteInfo", {data: angular.toJson(data)}).success(function (response) {
                            if (response && response.code == "200") {
                                var log = '';
                                if (response.result.tasks && response.result.tasks.length > 0) {
                                    for (var i = 0; i < response.result.tasks.length; i++) {
                                        var task = response.result.tasks[i];
                                        if (task.pk_process && task.opinion) {
                                            log = log + "审批人：" + task.name + "\r\n";
                                            log = log + "审批意见：" + task.opinion + "\r\n";
                                            log = log + "----------------------------\r\n";
                                        }
                                    }
                                }
                                //子表数据
                                var param = {
                                    submitData: response.result,
                                    submitVO: {
                                        nextNodeId: response.nextNodeId,
                                        curId: response.curId,
                                        tranId: response.tranId,
                                        taskId: response.taskId,
                                        vo: response.vo,
                                        nodeType: response.nodeType,
                                        unPassBusinessKey: _config.source_bill,
                                        log: log,
                                    },
                                    LEFT_DATA: response.result.LeftData,
                                    RIGHT_DATA: response.result.RightData,
                                    buttons: response.result.buttons,
                                    PASSES: response.result.passes,
                                    submitView: true,
                                    isAudit: response.result.type ? true : false,
                                };

                                ngDialog.open({
                                    template: '../insurance/view/workFlow/voteDialog.html',
                                    controller: 'voteController',
                                    data: {
                                        config: _config,
                                        param: param
                                    },
                                    closeByDocument: true,
                                    closeByEscape: true,
                                    cache: false,
                                    className: 'ngdialog-theme-formInfo'
                                });
                            } else {
                                angular.alert($rootScope.getDisName(response.msg, '', ''));
                            }
                        });
                    }
                }

                return publicMethods;
            }]
    });

    m.controller('voteController', ['$scope', '$rootScope', '$http', 'ngDialog', 'voteDialog', '$sce', '$location', 'unPassDialog', function ($scope, $rootScope, $http, ngDialog, voteDialog, $sce, $location, unPassDialog) {
        var _config = $scope.ngDialogData.config;
        angular.extend($scope, $scope.ngDialogData.param);
        $scope.initData = function () {
            $scope.initVO = function () {
                return {};
            };
        };
        $scope.initFunction = function () {
            /**
             * 保存
             */
            $scope.onSubmitConfirm = function () {

                if (!$scope.submitVO.comment) {
                    return angular.alert('请填写审批意见!', {skin: 'layui-layer-lan', closeBtn: 1});
                }
                if ($scope.RIGHT_DATA == null || $scope.RIGHT_DATA.length == 0) {
                    return angular.alert('请至少选择一个用户进行!', {skin: 'layui-layer-lan', closeBtn: 1});
                }
                $scope.submitVO.selects = angular.copy($scope.RIGHT_DATA);
                $scope.submitVO.source_bill = _config.source_bill;
                // $scope.$parent.confirm($scope.submitVO);
                $http.post($rootScope.basePath + "workFlowMadelController/SubmitConfirm", {data: angular.toJson($scope.submitVO)}).success(function (response) {
                    if (response && response.code == "200") {
                        angular.alert($rootScope.getDisName(response.msg, '', ''));
                        ngDialog.close();
                        $scope.ngDialogData.config.resultHandler();
                    }
                });

            };

            $scope.onSubmitCancel = function () {
                ngDialog.close();
                //$scope.ngDialogData.config.resultHandler();
            };

        };


        $scope.initClick = function () {
            $scope.onToRight = function () {
                if (!$scope.submitVO.leftSelects || $scope.submitVO.leftSelects.length != 1) {
                    return layer.alert("请选择一个用户!", {skin: 'layui-layer-lan', closeBtn: 1});
                }
                ;
                var select = $scope.submitVO.leftSelects[0];
                for (var i = 0; i < $scope.LEFT_DATA.length; i++) {
                    if (select == $scope.LEFT_DATA[i].loginId) {
                        $scope.RIGHT_DATA.push($scope.LEFT_DATA[i]);
                        $scope.LEFT_DATA.splice(i, 1);
                        $scope.submitVO.leftSelects = [];
                        break;
                    }
                }
            };
            $scope.onToRightAll = function () {
                if (!$scope.LEFT_DATA || $scope.LEFT_DATA.length == 0) {
                    return;
                }
                ;
                for (var i = 0; i <= $scope.LEFT_DATA.length; i++) {
                    $scope.RIGHT_DATA.push($scope.LEFT_DATA[i]);
                    $scope.LEFT_DATA.splice(i, 1);
                    $scope.onToRightAll();
                }
            };
            $scope.onToLeft = function () {
                if (!$scope.submitVO.rightSelects || $scope.submitVO.rightSelects.length != 1) {
                    return layer.alert("请选择一个用户!", {skin: 'layui-layer-lan', closeBtn: 1});
                }
                ;
                var select = $scope.submitVO.rightSelects[0];
                for (var i = 0; i < $scope.RIGHT_DATA.length; i++) {
                    if (select == $scope.RIGHT_DATA[i].loginId) {
                        $scope.LEFT_DATA.push($scope.RIGHT_DATA[i]);
                        $scope.RIGHT_DATA.splice(i, 1);
                        $scope.submitVO.rightSelects = [];
                        break;
                    }
                }
            };
            $scope.onToLeftAll = function () {
                if (!$scope.RIGHT_DATA || $scope.RIGHT_DATA.length == 0) {
                    return;
                }
                ;
                for (var i = 0; i <= $scope.RIGHT_DATA.length; i++) {
                    $scope.LEFT_DATA.push($scope.RIGHT_DATA[i]);
                    $scope.RIGHT_DATA.splice(i, 1);
                    $scope.onToLeftAll();
                }
            };
        };

        $scope.auditCallBack = function (val) {
            if (val == "onSubmitConfirm") {
                //确认
                $scope.onSubmitConfirm();
            } else if (val == "onSubmitCancel") {
                //取消
                $scope.onSubmitCancel();
            }
        }

        $scope.initData();
        $scope.initFunction();
        // $scope.initWatch();
        $scope.initClick();


    }]);

    return m;
}))
