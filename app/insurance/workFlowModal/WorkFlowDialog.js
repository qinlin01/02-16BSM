/**
 * Created by jiaoshy on 2017/6/13.
 */
(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        // CommonJS
        if (typeof angular === 'undefined') {
            factory(require('angular'));
        } else {
            factory(angular);
        }
        module.exports = 'workFlowDialog';
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(['../../../bower_components/angular/angular'], factory);
    } else {
        // Global Variables
        factory(root.angular);
    }
}(this, function (angular) {
    var m = angular.module('workFlowDialog', []);

    m.provider('workFlowDialog', function () {

        this.$get = ['$document', '$templateCache', '$compile', '$q', '$http', '$rootScope', '$timeout', '$window', '$controller', '$injector', 'ngDialog',
            function ($document, $templateCache, $compile, $q, $http, $rootScope, $timeout, $window, $controller, $injector, ngDialog) {
                var $element = [];

                var defaultConfig = {
                    url: null,
                    taskId: null,                        //流程实例id
                    source_bill: null,                        //所选数据主键
                    source_name: null,                         //待办主键
                    resultHandler: null,
                    submitOrGoOn:null                //标识 判断弹窗是直接往下走 还是调用提交之后往下走
                };

                var privateMethods = {};
                var publicMethods = {
                    __PRIVATE__: privateMethods,
                    open: function (opts) {
                        var _config = angular.merge(defaultConfig, opts)
                        var data = {data: _config};
                        // alert(msg)
                        $http.post($rootScope.basePath + "workFlowMadelController/queryFlowInfo", {data: angular.toJson(data)}).success(function (response) {
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
                                /*            var bean_name = "";
                                 var taskId = response.taskId;
                                 var token = $rootScope.getToken();
                                 var source_bill = response.source_bill;
                                 //如果source_bill 不为空 则传过去后台查询的source_bill   否则传 前台传过来的值
                                 if (source_bill != "") {
                                 var params = {
                                 source_bill: source_bill,
                                 token: token
                                 };
                                 } else {
                                 var params = {
                                 source_bill: _config.source_bill,
                                 token: token
                                 };
                                 }*/
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
                                    userMaps: response.userMaps,
                                    submitView: true,
                                    oldUserMaps:response.userMaps,
                                    type:response.type,
                                    submitOrGoOn:response.submitOrGoOn,
                                    isAudit: response.result.type ? true : false,
                                };
                                //
                                // layer.open({
                                //     type: 2,
                                //     area: ['700px', '450px'],
                                //     fixed: false, //不固定
                                //     maxmin: true,
                                //     content: getURL('insurance/view/workFlow/workFlowDialog.html')
                                // });

                                ngDialog.open({
                                    template: getURL('insurance/view/workFlow/workFlowDialog.html'),
                                    controller: 'workFlowController',
                                    data: {
                                        config: _config,
                                        param: param
                                    },
                                    closeByDocument: false,
                                    closeByEscape: false,
                                    cache: false,
                                    className: 'ngdialog-theme-formInfo'
                                });
                            } else {
                                angular.alert($rootScope.getDisName(response.msg, '', ''));
                            }
                        });
                    },
                    submit: function (opts) {
                        var _config = angular.merge(defaultConfig, opts)
                        var data = {data: _config};
                        layer.load(2);
                        $http.post($rootScope.basePath + "workFlowMadelController/submit", {data: angular.toJson(data)}).success(function (response) {
                            if(_config.resultHandler){
                                _config.resultHandler(response);
                            }
                            layer.closeAll('loading');
                        });
                    },
                    linkAuditFlow: function (opts) {
                        var _config = angular.merge(defaultConfig, opts)

                        // alert(msg)
                        ngDialog.openConfirm({
                            template: '../insurance/view/workFlow/traceInst.html',
                            controller: 'traceInstController',
                            data: {
                                config: _config
                            },
                            closeByDocument: false,
                            closeByEscape: false,
                            cache:false
                        }).then(function (value) {
                            if(_config.resultHandler){
                                _config.resultHandler(value);
                            }
                        }, function (reason) {

                        });
                    }
                };
                return publicMethods;
            }]
    });

    m.controller('workFlowController', ['$scope', '$rootScope', '$http', 'ngDialog',
        function ($scope, $rootScope, $http, ngDialog) {
        var _config = $scope.ngDialogData.config;
        angular.extend($scope, $scope.ngDialogData.param);
        $rootScope.oldUserMap = $scope.userMaps;
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
                //if(!$scope.submitVO.pass)  return layer.alert('请选择处理方式!', {skin: 'layui-layer-lan', closeBtn: 1});
                /*     if($scope.submitVO.pass.indexOf("_pass") >= 0 && ($scope.RIGHT_DATA == null || $scope.RIGHT_DATA.length != 1)){
                 return layer.alert('只能选择一个用户进行提交!', {skin: 'layui-layer-lan', closeBtn: 1});
                 }*/
                if ($scope.PASSES.length == 1) {
                    $scope.submitVO.pass = $scope.PASSES[0].transitionCode;
                }
                //判断是否是会签
                if ($scope.submitVO.nodeType == "voteNode") {
                    if($scope.LEFT_DATA !=null){
                        if ($scope.LEFT_DATA.length != 0) {
                            if ($scope.RIGHT_DATA == null || $scope.RIGHT_DATA.length == 0) {
                                return angular.alert('请选择一个用户进行提交!', {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                    }

                } else {
                    if ($scope.LEFT_DATA != null) {
                        if ($scope.LEFT_DATA.length != 0) {
                            if ($scope.RIGHT_DATA == null || $scope.RIGHT_DATA.length != 1) {
                                return angular.alert('请选择一个用户进行提交!', {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                    }

                }

                $scope.submitVO.selects = angular.copy($scope.RIGHT_DATA);
                $scope.submitVO.source_bill = _config.source_bill;
                $scope.submitVO.submitOrGoOn = _config.submitOrGoOn;
                // $scope.$parent.confirm($scope.submitVO);
                $http.post($rootScope.basePath + "workFlowMadelController/Confirm", {data: angular.toJson($scope.submitVO)}).success(function (response) {
                    if (response && response.code == "200") {
                        angular.alert($rootScope.getDisName(response.msg, '', ''));
                        ngDialog.close();

                        //  add by chenxc 回写待办信息
                        //utilValue.work_complete = Math.random();

                        $scope.ngDialogData.config.resultHandler();

                    }
                });

            };

            $scope.onSubmitCancel = function () {
                ngDialog.close();
                /*$scope.ngDialogData.config.resultHandler();*/
            };

            /*
             * 审核不通过
             * */
            $scope.onEnd = function () {
                if (!$scope.submitVO.comment) {
                    return angular.alert('请填写审批意见!', {skin: 'layui-layer-lan', closeBtn: 1});
                }

                $http.post($rootScope.basePath + "workFlowMadelController/onEnd", {data: angular.toJson($scope.submitVO)}).success(function (response) {
                    if (response && response.code == "200") {
                        angular.alert($rootScope.getDisName(response.msg, '', ''));
                        ngDialog.close();
                        //  add by chenxc 回写待办信息
                        //utilValue.work_complete = Math.random();

                        $scope.ngDialogData.config.resultHandler();
                    } else {
                        angular.alert($rootScope.getDisName("审核失败!", '', ''));
                    }
                });
            };

            /*
             * 会签
             * */
      /*      $scope.onCountersign = function () {
                voteDialog.open({
                    url: "",
                    source_bill: _config.source_bill,
                    source_name: "primaryKey",
                    data: angular.toJson($scope.submitVO),
                    resultHandler: function (actionType) {
                        $scope.ngDialogData.config.resultHandler();
                    },
                })

            }

            /!*
             * 加签
             * *!/
            $scope.onEndorse = function () {
                endorseDialog.open({
                    url: "",
                    source_bill: _config.source_bill,
                    source_name: "primaryKey",
                    data: angular.toJson($scope.submitVO),
                    resultHandler: function (actionType) {
                        $scope.ngDialogData.config.resultHandler();
                    },
                })
            }*/


            $scope.getSubmitView = function () {
                return $scope.submitVO.pass && $scope.submitVO.pass.transitionType == 0;
            };

        };

        /*
         * 驳回
         * */
 /*       $scope.unPass = function () {
            unPassDialog.open({
                url: "",
                source_bill: "",
                source_name: "primaryKey",
                data: angular.toJson($scope.submitVO),
                resultHandler: function (actionType) {
                    $scope.ngDialogData.config.resultHandler();
                },
            })
        };*/

        $scope.initWatch = function () {
            $scope.$watch('submitVO.pass', function (newVal) {
                console.log(newVal);
               if($scope.type != 'parallelGateway'){
                   if($scope.RIGHT_DATA.length!=0){
                       if($scope.LEFT_DATA.length==0){
                           $scope.LEFT_DATA = $scope.RIGHT_DATA;
                       }else {
                           $scope.onToLeftAll();
                       }
                   }

                   if (newVal) {
                       var condition = $scope.userMaps;
                       var userList = condition[newVal];
                       if(userList.length == 1){
                           $scope.LEFT_DATA = [];
                           $scope.RIGHT_DATA = condition[newVal];
                       }else {
                           $scope.LEFT_DATA = condition[newVal];
                           $scope.RIGHT_DATA = [];
                       }

                   }
               }
                console.log($scope.userMaps);
            }, true);
        };
        $scope.initClick = function () {
            for(var i=0;i<$scope.PASSES.length;i++){
                var pass = $scope.PASSES[i];
                if(pass['flag'] == 0){
                    $scope.submitVO.pass = pass['transitionCode']
                }
            }
           // $scope.submitVO.pass = $scope.PASSES[$scope.PASSES.length - 1].transitionCode;  //默认赋值
            $scope.onToRight = function () {
                if (!$scope.submitVO.leftSelects || $scope.submitVO.leftSelects.length != 1) {
                    return layer.alert("请选择一个用户!", {skin: 'layui-layer-lan', closeBtn: 1});
                };
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
                };
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
            } else if (val == "onEnd") {
                //直接终止
                $scope.onEnd();
            } else if (val == "unPass") {
                //驳回
                $scope.unPass();
            } else if (val == "countersign") {
                //会签
                $scope.onCountersign();
            } else if (val == "endorse") {
                //加签
                $scope.onEndorse();
            }
        }

        $scope.initData();
        $scope.initFunction();
        $scope.initWatch();
        $scope.initClick();


    }]);
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
}))



