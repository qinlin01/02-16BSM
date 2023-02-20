/**
 * Created by jiaoshy on 2017/6/8.
 */
(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        // CommonJS
        if (typeof angular === 'undefined') {
            factory(require('angular'));
        } else {
            factory(angular);
        }
        module.exports = 'traceInstModal';
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(['../../../bower_components/angular/angular'], factory);
    } else {
        // Global Variables
        factory(root.angular);
    }
}(this, function (angular) {
    var m = angular.module('traceInstModal', []);

    m.provider('traceInstModal', function () {

        this.$get = ['$document', '$templateCache', '$compile', '$q', '$http', '$rootScope', '$timeout', '$window', '$controller', '$injector', 'ngDialog',
            function ($document, $templateCache, $compile, $q, $http, $rootScope, $timeout, $window, $controller, $injector, ngDialog) {
                var $element = [];

                var defaultConfig = {
                    url: null,
                    taskId:null,                        //流程实例id
                    source_bill:null,                        //所选数据主键
                    source_name:null,                         //待办主键
                    resultHandler: null,
                };

                var privateMethods = {};

                var publicMethods = {
                    __PRIVATE__: privateMethods,

                    open: function (opts) {
                        var _config = angular.merge(defaultConfig, opts)

                        // alert(msg)
                        ngDialog.open({
                            template: '../insurance/view/workFlow/traceInst.html',
                            controller: 'traceInstController',
                            data: {
                                config: _config
                            },
                            closeByDocument: false,
                            closeByEscape: true,
                            cache:false
                        });
                    }
                };

                return publicMethods;
            }]
    });

    m.controller('traceInstController', ['$scope','$rootScope','$http', 'ngDialog','traceInstModal','$sce','$location',function ($scope,$rootScope,$http,ngDialog,traceInstModal,$sce,$location) {
        var _config = $scope.ngDialogData.config;

        $scope.init = function () {

            $scope.executeInfoGridOptions = {
                enableCellEditOnFocus: true,
                enableCellEdit: false,
                enableRowSelection: true,
                enableSelectAll: true,
                multiSelect: true,
                enableSorting: true,
                enableRowHeaderSelection: true,

                columnDefs: [
                    {name: 'TASK_ID', displayName: '流程号', width: 180},
                    {name: 'OPERATE_NAME', displayName: '操作名称', width: 180},
                    {name: 'USER_NAME', displayName: '提交人', width: 180},
                    {name: 'SUBMIT_TIME', displayName: '提交时间', width: 180},
                    {name: 'WAIT_USER_NAME', displayName: '处理人', width: 180},
                    {name: 'TO_USER_NAME', displayName: '待处理人', width: 180},
                    {name: 'RESULT', displayName: '审批结果', width: 180},
                    {name: 'OPINION', displayName: '审批意见', width: 180},
                    {name: 'TS', displayName: '处理时间', width: 180},
                    {name: 'PROCESS_STATUS', displayName: '处理状态', width: 180,cellFilter:'SELECT_WORK_FLOW_STATUS'},
                    {name: 'LEAST_TIME', displayName: '持续时间', width: 180}
                ],
                onRegisterApi: function (gridApi) {
                    $scope.executeInfoGridOptions.gridApi = gridApi;
                }
            };
            
            var data = {data:_config};
            $http.post($rootScope.basePath + "workFlowMadelController/traceInst", {data: angular.toJson(data)}).success(function (response) {
                if (response && response.code == "200") {
                    var processDefinitionId = response.processDefinitionId;
                    var processInstanceId = response.processInstanceId;

                    var src = $rootScope.activtiyPath+'/service/editor/traceInst?processDefinitionId='+processDefinitionId+"&processInstanceId="+processInstanceId;
                    $scope.myURL = $sce.trustAsResourceUrl(src);
                    $scope.executeInfoGridOptions.data = response.result.Rows;
                    $scope.executeInfoGridOptions.totalItems = response.result.Total;
                } else {
                    angular.alert($rootScope.getDisName(response.msg,'',''));
                }
            });
          /*  var src = 'http://localhost:8082/act/service/editor/traceInst?processDefinitionId=proc-1:2:872511&processInstanceId=1055043';
            $scope.myURL = $sce.trustAsResourceUrl(src);*/


        };



        $scope.onSubCancel = function () {
            ngDialog.close();
        };

        $scope.onSubSave = function () {
            ngDialog.close();
        }


    }]);

    return m;
})
);