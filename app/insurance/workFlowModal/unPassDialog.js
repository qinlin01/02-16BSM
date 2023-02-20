/**
 * Created by jiaoshy on 2017/6/14.
 */
(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        // CommonJS
        if (typeof angular === 'undefined') {
            factory(require('angular'));
        } else {
            factory(angular);
        }
        module.exports = 'unPassDialog';
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(['../../../bower_components/angular/angular'], factory);
    } else {
        // Global Variables
        factory(root.angular);
    }
}(this, function (angular) {
    var m = angular.module('unPassDialog', []);

    m.provider('unPassDialog', function () {

        this.$get = ['$document', '$templateCache', '$compile', '$q', '$http', '$rootScope', '$timeout', '$window', '$controller', '$injector', 'ngDialog',
            function ($document, $templateCache, $compile, $q, $http, $rootScope, $timeout, $window, $controller, $injector, ngDialog) {
                var $element = [];

                var defaultConfig = {
                    url: null,
                    taskId: null,                        //流程实例id
                    source_bill: null,                        //所选数据主键
                    source_name: null,                         //待办主键
                    resultHandler: null,
                    data:null                       //父节点弹窗数据
                };

                var privateMethods = {};

                var publicMethods = {
                    __PRIVATE__: privateMethods,

                    open: function (opts) {
                        var _config = angular.merge(defaultConfig, opts)

                        // alert(msg)
                        ngDialog.open({
                            template: '../insurance/view/workFlow/unPassDialog.html',
                            controller: 'unPassController',
                            data: {
                                config: _config
                            },
                            closeByDocument: true,
                            closeByEscape: true,
                            cache: false
                        });
                    }
                }

                return publicMethods;
            }]
    });

    m.controller('unPassController', ['$scope', '$rootScope', '$http', 'ngDialog', 'unPassDialog', '$sce', '$location', function ($scope, $rootScope, $http, ngDialog, unPassDialog, $sce, $location) {
        var _config = $scope.ngDialogData.config;

        $scope.init = function () {
            $http.post($rootScope.basePath + "workFlowMadelController/unPassInfo", {data: _config.data}).success(function (response) {
                if (response && response.code == "200") {
                    $scope.executeInfoGridOptions.data = response.result.Rows;
                    $scope.executeInfoGridOptions.totalItems = response.result.Total;
                } else {
                    angular.alert($rootScope.getDisName(response.msg, '', ''));
                }
            });


        };
        
        $scope.initData  = function () {
           
            $scope.initVO = function () {
                return {};
            }
            
            $scope.unPassVO = $scope.initVO();
        }

        $scope.executeInfoGridOptions = {
            enableCellEditOnFocus: true,
            enableCellEdit: false,
            enableRowSelection: true,
            enableSelectAll: false,
            multiSelect: false,
            enableSorting: true,
            enableRowHeaderSelection: true,
            enableFullRowSelection:false,

            columnDefs: [
                {name: 'id', displayName: '任务', width: 180},
                {name: 'name', displayName: '任务名称', width: 180},
                {name: 'user_name', displayName: '提交人', width: 180},
                {name: 'time', displayName: '提交时间', width: 180}

            ],
            onRegisterApi: function (gridApi) {
                $scope.executeInfoGridOptions.gridApi = gridApi;
            }
        };

        $scope.onSubCancel = function () {
            ngDialog.close();
            $scope.ngDialogData.config.resultHandler();
            ngDialog.close($scope.$parent.ngDialogId);
            ngDialog.close($scope.ngDialogId);
        };

        $scope.onSubConfirm = function () {
            if($scope.unPassVO.comment == null || $scope.unPassVO.comment == ""){
                return angular.msg($rootScope.getDisName("请填写审批意见","!"), {
                    icon: 1
                });
            }
            var row = $scope.executeInfoGridOptions.gridApi.selection.getSelectedRows();
            if(row.length == 0){
                return angular.msg($rootScope.getDisName("请选择要驳回的节点","!"), {
                    icon: 1
                });
            }
            var data = {row:row,comment:$scope.unPassVO.comment,businessKey:_config.data};
            
            $http.post($rootScope.basePath + "workFlowMadelController/unPass", {data: angular.toJson(data)}).success(function (response) {
                if (response && response.code == "200") {
                    angular.alert($rootScope.getDisName(response.msg, '', ''));
                    ngDialog.close();
                    $scope.ngDialogData.config.resultHandler();
                    ngDialog.close($scope.$parent.ngDialogId);
                    ngDialog.close($scope.ngDialogId);
                } else {
                    angular.alert($rootScope.getDisName(response.msg, '', ''));
                }
            });




        }
        
        
        

        $scope.init();
        $scope.initData();

    }]);

    return m;
}))
