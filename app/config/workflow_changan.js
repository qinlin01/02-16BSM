/**
 * Created by 25152 on 2017/11/9.
 */

var initworkflow =function ($scope, $http, ngDialog, $location, $stateParams,beanName ) {

    /**
     * 查询审批流信息
     */
    $scope.queryWorkFlow = function (pkProject,fun) {
        layer.load(2);
        $http.post($scope.basePath + "workFlow/queryWorkFlow", {pk:pkProject, funCode: $scope.funCode})
            .success(function (response) {
                if(fun) fun(response);
            });
    };
    /**
     * 查询审批流信息
     */
    $scope.queryFlowInfo = function (pkProject,fun) {
        // var defaultConfig = {
        //     url: null,
        //     taskId: null,                        //流程实例id
        //     source_bill: null,                        //所选数据主键
        //     source_name: null,                         //待办主键
        //     resultHandler: null,
        //     submitOrGoOn:null                //标识 判断弹窗是直接往下走 还是调用提交之后往下走
        // };
       // var oneItem = ($scope.gridApi.selection.getSelectedRows())[0];


        // var _config = angular.merge(defaultConfig, opts)
        // var data = {data: _config};
        var entityVOPath = "";
        if(!angular.isUndefined($scope.entityVO)){
            entityVOPath =  $scope.entityVO;
        }
        var jsonObject = angular.toJson($scope.VO);
        layer.load(2);
        $http.post($scope.basePath + "workFlow/queryFlowInfo", {pk: pkProject,tableName:$scope.table_name,billdef:$scope.billdef,billstatus:$scope.VO.billstatus,entityVO:entityVOPath,jsonObject:jsonObject, funCode: $scope.funCode,ifEntity:$scope.ifEntity})
            .success(function (response) {
                if(response.code == 200){
                    if(fun) fun(response);
                } else {
                    if(!$scope.isGrid){
                        $scope.findOne($scope.VO.id);
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }else {
                        $scope.queryForGrid($scope.QUERY);
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }

                }
            });

    };
    /**
     * 查询审批流信息
     */
    $scope.queryAuditFlowInfo = function (pkProject,fun) {
        var entityVOPath = "";
        if(!angular.isUndefined($scope.entityVO)){
            entityVOPath =  $scope.entityVO;
        }
        var jsonObject = angular.toJson($scope.VO);
        layer.load(2);
        $http.post($scope.basePath + "workFlow/queryAuditFlowInfo", {pk:pkProject,tableName:$scope.table_name,billdef:$scope.billdef,billstatus:$scope.VO.billstatus,entityVO:entityVOPath,jsonObject:jsonObject, funCode: $scope.funCode,ifEntity:$scope.ifEntity})
            .success(function (response) {
                if(response.code == 200){
                    if(fun) fun(response);
                } else {
                    $scope.queryForGrid($scope.QUERY);
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
    };
    /*
     * 提交
     * */
    $scope.submit = function (pkProject,msg,selects,_pass) {
        var jsonObject = angular.toJson($scope.VO);
        layer.closeAll('loading')
        if(JSON.stringify(selects) === '[]'){
            return layer.alert("请选择审核人进行提交!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });

        }

        var entityVOPath = "";
        if(!angular.isUndefined($scope.entityVO)){
            entityVOPath =  $scope.entityVO;
        }

        layer.load(2);
        $http.post($scope.basePath + "workFlow/submit", {pk:pkProject,msg: msg,data:angular.toJson(selects),_pass:_pass,tableName:$scope.table_name,jsonObject:jsonObject,beanName:$scope.beanName,ifEntity:$scope.ifEntity,entityVO:entityVOPath,funCode: $scope.funCode})
            .success(function (response) {
                layer.closeAll('loading');
                if (response.code == 200) {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    if($scope.isGrid){
                        $scope.queryForGrid($scope.QUERY);
                    } else {
                        $scope.findOne($scope.VO.id);
                    }
                } else {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
    };



    /*
     * 审核
     * className 调运业务代码的 实现类 类名
     * */
    $scope.audit = function (pkProject,msg,selects,_pass,type) {
        var child_table = "";
        if(!angular.isUndefined($scope.child_table)){
            child_table =  $scope.child_table;
        }
        var mainVoPath = "";
        if(!angular.isUndefined($scope.mainVoPath)){
            mainVoPath =  $scope.mainVoPath;
        }
        var entityVOPath = "";
        if(!angular.isUndefined($scope.entityVO)){
            entityVOPath =  $scope.entityVO;
        }
        var jsonObject = angular.toJson($scope.VO);
        layer.load(2);
        $http.post($scope.basePath + "workFlow/auditBulk", {datas:angular.toJson(data),msg: msg,data:angular.toJson(selects),_pass:_pass,type:type,tableName:$scope.table_name,childTable:child_table,beanName:$scope.beanName,mainVoPath:mainVoPath, funCode: $scope.funCode,ifEntity:$scope.ifEntity,entityVO:entityVOPath})
            .success(function (response) {
                layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                if (response.code == 200) {
                    $scope.queryForGrid($scope.QUERY);
                }
                return true;
            });
    };

    $scope.onSubmit = function () {
        var pkProject;
        if($scope.isGrid){
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行提交!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            //if(rows[0].billstatus != 37) return layer.alert("只有暂存状态可以提交!", {skin: 'layui-layer-lan',closeBtn: 1});
            pkProject = rows[0].id;
        } else {
            pkProject = $scope.VO.id;
            //if($scope.VO.billstatus != 37) return layer.alert("只有暂存状态可以提交!", {skin: 'layui-layer-lan',closeBtn: 1});
        }
        if(!pkProject){
            return layer.alert('当前数据没有保存，请保存之后进行此操作！', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
        }
        $scope.getMsg();
        layer.load(2);
        $scope.queryFlowInfo(pkProject,function (response) {
            $scope.submitData = response.result;
            ngDialog.openConfirm({
                showClose:false,
                closeByDocument:false,
                template:'common/workflowDef/submitDialog.html',
                className:'ngdialog-theme-formInfo',
                controller: 'submitCtrl',
                scope:$scope,
                preCloseCallback: function(value) {
                    layer.load(2);
                    if(value && value=="clear" ){
                        return false;
                    }
                    //取消
                    return true;
                }
            }).then(function (value) {
                layer.load(2);
                $scope.submit(pkProject,value.msg,value.selects,value.pass);
            }, function (reason){
                var bbbb=1;
            });
        });
    };

    $scope.onLinkAuditFlow = function () {
        var pkProject;
        if($scope.isGrid){
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            pkProject = rows[0].id;
        } else {
            pkProject = $scope.VO.id;
        }
        layer.load(2);
        $scope.queryWorkFlow(pkProject,function(response) {
            if(response.code != 200) return layer.alert(response.msg, {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            $scope.tasks = response.result;
            $scope.imgUrl = getImgURL(response.imgUrl);
            ngDialog.openConfirm({
                showClose:true,
                closeByDocument:true,
                template:'common/workflowDef/linkAuditFlow.html',
                className:'ngdialog-theme-formInfo',
                controller: 'linkAuditFlowCtril',
                scope:$scope,
                preCloseCallback: function(value) {
                    if(value && value=="clear" ){
                        return false;
                    }
                    //取消
                    return true;
                }
            }).then(function (value) {
                $scope.onSubmit(value.msg);
            }, function (reason){

            });
        });
    };

    /**
     * 更新常用审批语
     */
    $scope.updateMsg = function () {
        $http.post($scope.basePath + "workFlow/updateMsg", {id: ""}).success(function (response) {});
    };
    /**
     * 获取常用审批语
     */
    $scope.getMsg = function () {
        $scope.msg=null;
        $http.post($scope.basePath + "workFlow/getMsg", {id: ""}).success(function (response) {
            $scope.msg=response.msgList;
        });
    };

    $scope.onAudit = function () {
        var pkProject;
        if($scope.isGrid){
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行审核!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            if (rows[0].ifGetFeeBill!=32&&rows[0].billstatus != 33 && rows[0].billstatus != 32 && rows[0].billstatus != 40) return layer.alert("只有审批中或驳回状态可以审核!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            pkProject = rows[0].id;
        } else {
            pkProject = $scope.VO.id;
            if($scope.VO.ifGetFeeBill!=32&&$scope.VO.billstatus != 33 && $scope.VO.billstatus != 32&&$scope.VO.billstatus!=40) return layer.alert("只有审批中或驳回状态可以审核!", {skin: 'layui-layer-lan',closeBtn: 1});
        }
        //查询常用语
        $scope.getMsg();
        layer.load(2);
        $scope.queryAuditFlowInfo(pkProject,function (response) {
            $scope.submitData = response.result;
            $scope.submitData['type'] = 1;
            ngDialog.openConfirm({
                showClose:true,
                closeByDocument:true,
                template:'common/workflowDef/submitDialog.html',
                className:'ngdialog-theme-formInfo',
                controller: 'submitCtrl',
                scope:$scope,
                preCloseCallback: function(value) {
                    if(value && value=="clear" ){
                        return false;
                    }
                    //取消
                    return true;
                }
            }).then(function (value) {

                layer.load(2);
                if($scope.audit(pkProject,value.msg,value.selects,value.pass,value.type)){
                    layer.closeAll('loading');
                }
            }, function (reason){

            });
        });
    };

    $scope.onRecallBefor = function (pkProject,fun) {
        layer.load(2);
        $http.post($scope.basePath + "workFlow/onRecallBefor", {pk:pkProject, funCode: $scope.funCode})
            .success(function (response) {
                if(response.code == 200){
                    if(fun) fun(response);
                } else {
                    $scope.queryForGrid($scope.QUERY);
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
    };

    $scope.onRecall = function () {
        layer.confirm('是否撤回选中数据？', {
            btn: ['撤回', '取消'], //按钮
            btn2: function (index, layero) {
                layer.msg('取消撤回!', {
                    shift: 6,
                    icon: 11
                });
            },
            shade: 0.6,//遮罩透明度
            shadeClose: true,//点击遮罩关闭层
        },
            function () {
                var pkProject;
                if($scope.isGrid){
                    var rows = $scope.gridApi.selection.getSelectedRows();
                    if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行撤回!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                    //if(rows[0].billstatus != 33) return layer.alert("只有审批中状态可以撤回!", {skin: 'layui-layer-lan',closeBtn: 1});
                    pkProject = rows[0].id;
                } else {
                    pkProject = $scope.VO.id;
                    //if($scope.VO.billstatus != 33) return layer.alert("只有审批中状态可以撤回!", {skin: 'layui-layer-lan',closeBtn: 1});
                }

                var entityVOPath = "";
                if(!angular.isUndefined($scope.entityVO)){
                    entityVOPath =  $scope.entityVO;
                }

                layer.load(2);
                $scope.onRecallBefor(pkProject,function (response) {
                    $http.post($scope.basePath + "workFlow/onRecallAfter", {tableName:$scope.table_name,pk:pkProject,ifEntity:$scope.ifEntity,entityVO:entityVOPath})
                        .success(function (response) {
                            layer.closeAll('loading');
                            $scope.queryForGrid($scope.QUERY);
                            $scope.findOne(pkProject);
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        });
                });
            }
        )
    }
    /**
     * 退回
     * @param pkProject
     * @param msg
     * @param selects
     * @param _pass
     */

    $scope.onRollback = function (pkProject,msg,selects,_pass) {

        var pkProject;
        if($scope.isGrid){
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行退回!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            /*if(rows[0].billstatus != 37) return layer.alert("只有暂存状态可以提交!", {skin: 'layui-layer-lan',closeBtn: 1});*/
            pkProject = rows[0].id;
        }
        layer.confirm('请确认该保单是否有结算，如有，则不能退回!!!是否确定退回此信息？', {
                btn: ['是', '否'], //按钮
                btn2: function (index, layero) {
                    layer.msg('取消退回!', {
                        shift: 6,
                        icon: 11
                    });
                },
                shade: 0.6,//遮罩透明度
                shadeClose: true,//点击遮罩关闭层
            },
            function () {
                layer.load(2);
                $http.post($scope.basePath + "workFlow/rollback", {pk:pkProject,tableName:$scope.table_name, funCode: $scope.funCode})
                    .success(function (response) {
                        layer.closeAll('loading');
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        if (response.code == 200) {
                            if($scope.isGrid){
                                $scope.queryForGrid($scope.QUERY);
                            } else {
                                $scope.findOne($scope.VO.id);
                            }
                        }
                    });
            }
        );

    };
    $scope.onConfirm = function (pkProject,msg,selects,_pass) {

        var pkProject;
        if($scope.isGrid){
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行确认!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            /*if(rows[0].billstatus != 37) return layer.alert("只有暂存状态可以提交!", {skin: 'layui-layer-lan',closeBtn: 1});*/
            pkProject = rows[0].id;
        }else{
            pkProject = $scope.VO.id;
        }

        layer.confirm('点击【确认完成】按钮后，数据生效并且不能进行修改和删除操作，是否继续？', {
                btn: ['是', '否'], //按钮
                btn2: function (index, layero) {
                    layer.msg('取消确认!', {
                        shift: 6,
                        icon: 11
                    });
                },
                shade: 0.6,//遮罩透明度
                shadeClose: true,//点击遮罩关闭层
            },
            function () {

                layer.load(2);
                $http.post($scope.basePath + "workFlow/confirm", {pk:pkProject,tableName:$scope.table_name, funCode: $scope.funCode})
                    .success(function (response) {
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        if (response.code == 200) {
                            if($scope.isGrid){
                                $scope.queryForGrid($scope.QUERY);
                            } else {
                                $scope.findOne($scope.VO.id);
                            }
                        }
                    });
            }
        );
    };

    /**
     * 查看签报单
     */

    $scope.onPrintReportBill = function(){
        ngDialog.openConfirm({
            showClose: true,
            closeByDocument: true,
            template: 'view/report/printReportBill.html',
            className: 'ngdialog-theme-formInfo',
            scope: $scope,
            controller:function($scope,$timeout){
                $scope.rows = $scope.gridApi.selection.getSelectedRows();
                $scope.print = function(){
                    var winPrint = window.open('','','left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
                    var linkTag = winPrint.document.createElement('link');
                    linkTag.setAttribute('rel','stylesheet');
                    linkTag.setAttribute('media','all');
                    linkTag.setAttribute('type','text/css');
                    var winPrintHead = winPrint.document.getElementsByTagName('head')[0];
                    linkTag.href = $rootScope.basePath+'css/public.css';
                    winPrintHead.appendChild(linkTag);
                    winPrint.document.body.innerHTML = document.getElementById('printMonReport').innerHTML;
                    winPrint.focus();
                    $timeout(function() {
                        winPrint.window.print();
                        winPrint.close;
                    },300);
                }

            },
            preCloseCallback: function (value) {
                if (value && value == "clear") {
                    //重置
                    return false;
                }
                //取消
                return true;
            }
        }).then(function (value) {
        }, function (reason) {
        });
    }

    /**
     * 查看批复单
     */
    $scope.onPrintCheckBill = function(){
        ngDialog.openConfirm({
            showClose: true,
            closeByDocument: true,
            template: 'view/report/printCheckBill.html',
            className: 'ngdialog-theme-formInfo',
            scope: $scope,
            controller:function($scope,$timeout){
                $scope.rows = $scope.gridApi.selection.getSelectedRows();
                $scope.print = function(){
                    var winPrint = window.open('','','left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
                    var linkTag = winPrint.document.createElement('link');
                    linkTag.setAttribute('rel','stylesheet');
                    linkTag.setAttribute('media','all');
                    linkTag.setAttribute('type','text/css');
                    var winPrintHead = winPrint.document.getElementsByTagName('head')[0];
                    linkTag.href = $rootScope.basePath+'css/public.css';
                    winPrintHead.appendChild(linkTag);
                    winPrint.document.body.innerHTML = document.getElementById('printMonReport').innerHTML;
                    winPrint.focus();
                    $timeout(function() {
                        winPrint.window.print();
                        winPrint.close;
                    },300);
                }

            },
            preCloseCallback: function (value) {
                if (value && value == "clear") {
                    //重置
                    return false;
                }
                //取消
                return true;
            }
        }).then(function (value) {
        }, function (reason) {
        });
    }
    /*
     * 清空审批流）
     * */
    $scope.onClearWorkflow = function () {
        var jsonObject = angular.toJson($scope.VO);
        if(null==$scope.VO.id||$scope.VO.id==""){
            return layer.alert("请选择一条数据进行处理!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
        }
        layer.confirm('是否清理选中数据的流程图？', {
                btn: ['清理', '返回'], //按钮
                btn2: function (index, layero) {
                    layer.msg('取消清理!', {
                        shift: 6,
                        icon: 11
                    });
                },
                shade: 0.6,//遮罩透明度
                shadeClose: true,//点击遮罩关闭层
            },
            function () {
                layer.load(2);
                $http.post($scope.basePath + "workFlow/clearWorkflow", {id: $scope.VO.id, tableName: $scope.table_name, funCode: $scope.funCode,ifEntity:$scope.ifEntity,beanName:$scope.beanName})
                    .success(function (response) {
                        layer.closeAll('loading');
                        if (response.code == 200) {
                            //layer.msg(response.msg);
                            layer.msg(response.msg, {
                                icon: 1
                            });
                            if ($scope.isGrid) {
                                $scope.queryForGrid($scope.QUERY);
                            } else {
                                $scope.findOne($scope.VO.id);
                            }
                        } else {
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});

                        }
                    });
            }
        );
    };

    /*
     * 退回（清空审批流）
     * */
    $scope.onClear = function () {

        var jsonObject = angular.toJson($scope.VO);
        layer.comfirm

        layer.confirm('是否退回选中数据？', {
                btn: ['退回', '返回'], //按钮
                btn2: function (index, layero) {
                    layer.msg('取消退回!', {
                        shift: 6,
                        icon: 11
                    });
                },
                shade: 0.6,//遮罩透明度
                shadeClose: true,//点击遮罩关闭层
            },
            function () {
                layer.load(2);
                $http.post($scope.basePath + "workFlow/clear", {id:$scope.VO.id,jsonObject:jsonObject,tableName:$scope.table_name, funCode: $scope.funCode})
                    .success(function (response) {
                        layer.closeAll('loading');
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        if (response.code == 200) {
                            if($scope.isGrid){
                                layer.load(2);
                                $scope.queryForGrid($scope.QUERY);
                            } else {
                                layer.load(2);
                                $scope.findOne($scope.VO.id);
                            }
                        }
                    });
            }
        );
    };

}
