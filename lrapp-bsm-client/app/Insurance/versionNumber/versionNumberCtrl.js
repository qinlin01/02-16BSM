/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('versionNumberCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog,
                                                  traceInstModal, workFlowDialog, ngVerify, $location, $timeout) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        // $scope.type = {code:1};
        $scope.initVO = function () {
            return {
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                dr: 0,
                billstatus: 0,
            };
        };

        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
       $scope.initQUERY = function () {
            return { 
                "id": $stateParams.id
            }
        };
        $scope.QUERY = $scope.initQUERY();
    };

    $scope.initHttp = function () {
        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data) {
            layer.load(2);
            return $http.post($rootScope.basePath + "versionNumber/queryAllForGrid", {
                params: angular.toJson(data),
                //page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                //pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            })
                .success(function (response) {
                    if (response.code == 200) {
                        if (!$scope.query) {
                            $scope.query = $scope.gridOptions.columnDefs;
                        }
                        if ($scope.QUERY.id) {
                            $scope.QUERY.id = null;
                        }
                        $scope.gridOptions.data = response.result.Rows;
                        $scope.gridOptions.totalItems = response.result.Total;
                    }
                    layer.closeAll('loading');
                });
        };
        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "versionNumber/queryForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response.code == 200) {
                    if (!$scope.query) {
                        $scope.query = $scope.gridOptions.columnDefs;
                    }
                    if ($scope.QUERY.id) {
                        $scope.QUERY.id = null;
                    }
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            });
        };
        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "versionNumber/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    if (callback) {
                        callback();
                    }
                } else {
                    if (response) {
                        if (callback) {
                            callback();
                        }
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                }
            });
        };


                /*
                 * 保存VO
                 * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $http.post($rootScope.basePath + "versionNumber/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if (response && response.code == 200) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                    }
                    if (response) {
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                });
        };

        // /**
        //  * 查询审批流信息
        //  */
        // $scope.queryWorkFlow = function (pkProject,fun) {
        //     layer.load(2);
        //     $http.post($rootScope.basePath + "stateGridCustomer/queryWorkFlow", {pk:pkProject})
        //         .success(function (response) {
        //             layer.closeAll('loading');
        //             if(fun) fun(response);
        //         });
        // };
        // /**
        //  * 查询审批流信息
        //  */
        // $scope.queryFlowInfo = function (pkProject,fun) {
        //     var defaultConfig = {
        //         url: null,
        //         taskId: null,                        //流程实例id
        //         source_bill: null,                        //所选数据主键
        //         source_name: null,                         //待办主键
        //         resultHandler: null,
        //         submitOrGoOn:null                //标识 判断弹窗是直接往下走 还是调用提交之后往下走
        //     };
        //     var oneItem = ($scope.gridApi.selection.getSelectedRows())[0];
        //
        //     var _config = angular.merge(defaultConfig, opts)
        //     var data = {data: _config};
        //     layer.load(2);
        //     $http.post($rootScope.basePath + "workFlowMadelController/queryFlowInfo", {data: angular.toJson(data)},{fun_code:"0001010101"})
        //         .success(function (response) {
        //             if(response.code == 200){
        //                 if(fun) fun(response);
        //             } else {
        //                 layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
        //             }
        //             layer.closeAll('loading');
        //         });
        //
        //     layer.closeAll('loading');
        //
        // };
        // /**
        //  * 查询审批流信息
        //  */
        // $scope.queryAuditFlowInfo = function (pkProject,fun) {
        //     layer.load(2);
        //     $http.post($rootScope.basePath + "workFlowMadelController/queryAuditFlowInfo", {pk:pkProject,tableName:"lr_customer"})
        //         .success(function (response) {
        //             layer.closeAll('loading');
        //             if(response.code == 200){
        //                 if(fun) fun(response);
        //             } else {
        //                 layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
        //             }
        //         });
        // };
        // /*
        //  * 提交
        //  * */
        // $scope.submit = function (pkProject,msg,selects,_pass) {
        //     layer.load(2);
        //     $http.post($rootScope.basePath + "workFlowMadelController/submit", {pk:pkProject,msg: msg,data:angular.toJson(selects),_pass:_pass,tableName:"lr_customer"})
        //         .success(function (response) {
        //             layer.closeAll('loading');
        //             layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
        //             if (response.code == 200) {
        //                 if($scope.isGrid){
        //                     $scope.queryForGrid($scope.QUERY);
        //                 } else {
        //                     $scope.findOne($scope.VO.id);
        //                 }
        //             }
        //         });
        // };
        // /*
        //  * 提交
        //  * */
        // $scope.audit = function (pkProject,msg,selects,_pass,type) {
        //     layer.load(2);
        //     $http.post($rootScope.basePath + "workFlowMadelController/Confirm", {pk:pkProject,msg: msg,data:angular.toJson(selects),_pass:_pass,type:type,tableName:"lr_customer"})
        //         .success(function (response) {
        //             layer.closeAll('loading');
        //             layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
        //             if (response.code == 200) {
        //                 if($scope.isGrid){
        //                     $scope.queryForGrid($scope.QUERY);
        //                 } else {
        //                     $scope.findOne($scope.VO.id);
        //                 }
        //             }
        //         });
        // };
    };
    /**
     * Grid CSV全部导出，需查询所有数据
     * @param data
     */
    $scope.queryAllForGrid = function (data) {
        layer.load(2);
        return $http.post($rootScope.basePath + "versionNumber/queryForGrid", {
            params: angular.toJson(data),
            ifExport: true
        })
            .success(function (response) {
                if (response && response.code == 200) {
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            }).error(function () {
                layer.closeAll('loading');
            });
    };
    $scope.initFunction = function () {
        /**
         * 确认已执行
         */
        $scope.onConfirms = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行确认!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $http.post($scope.basePath + "versionNumber/confirm", {id: rows[0].id}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    $scope.queryForGrid($scope.QUERY);
                    layer.msg('确认成功!', {
                        icon: 1
                    });
                }

            });
        };

        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function (item) {
            if (item && item.pkProject) {
                $scope.findOne(item.pkProject, function (response) {
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isEdit = false;
                    $scope.isDisabled = true;
                });
            }

        };

    };
    $scope.initWatch = function () {
    };


    $scope.initButton = function () {
        /**
         * 提交
         */
        // $scope.onSubmit = function () {
        //     var oneItem = $scope.isGrid ? ($scope.gridApi.selection.getSelectedRows())[0] : $scope.VO;
        //     //调用审批流页面
        //     workFlowDialog.submit({
        //         source_bill: oneItem.primaryKey,
        //         source_name: angular.toJson(oneItem),
        //         fun_code:'stateGridCustomer',
        //         resultHandler: function (actionType) {
        //             //     add by chenxc  启动审批流的第一人，提交与审核合并
        //             if(actionType.code == 200){
        //                 workFlowDialog.open({
        //                     source_bill: oneItem.primaryKey,
        //                     source_name: angular.toJson(oneItem),
        //                     submitOrGoOn: true,
        //                     resultHandler: function (actionType) {
        //                         if($scope.isGrid){
        //                             $scope.queryForGrid($scope.QUERY);
        //                             angular.alert("提交成功！");
        //                         }else{
        //                             $scope.chargeFormBtn(oneItem);
        //                         }
        //                     }
        //                 });
        //             }else{
        //                 if($scope.isGrid){
        //                     $scope.queryForGrid($scope.QUERY);
        //                     angular.alert("提交成功！");
        //                 }else{
        //                     $scope.chargeFormBtn(oneItem);
        //                 }
        //             }
        //         }
        //     });
        // };
        // $scope.onLinkAuditFlow = function () {
        //     var oneItem = $scope.isGrid ? ($scope.gridApi.selection.getSelectedRows())[0] : $scope.VO;
        //     workFlowDialog.linkAuditFlow({
        //         source_bill: oneItem.primaryKey,
        //         source_name: angular.toJson(oneItem),
        //         resultHandler: function (actionType) {
        //         }
        //     })
        // };
        // /**
        //  * 审核
        //  */
        // $scope.onAudit = function () {
        //     var oneItem = $scope.isGrid ? ($scope.gridApi.selection.getSelectedRows())[0] : $scope.VO;
        //     workFlowDialog.open({
        //         source_bill: oneItem.primaryKey,
        //         source_name: angular.toJson(oneItem),
        //         submitOrGoOn: null,
        //         resultHandler: function (actionType) {
        //             if($scope.isGrid){
        //                 $scope.queryForGrid($scope.QUERY);
        //                 angular.alert("审核成功！");
        //             }else{
        //                 $scope.chargeFormBtn(oneItem);
        //             }
        //         }
        //     });
        // };
        /**
         * 确认已执行
         */
        $scope.onConfirm = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行确认!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $http.post($scope.basePath + "versionNumber/confirm", {id: rows[0].id}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    $scope.queryForGrid($scope.QUERY);
                    layer.msg('确认成功!', {
                        icon: 1
                    });
                }

            });
        };

        $scope.onUploads = function () {
            $scope.isSubDisabled = false;

            $scope.aVO = {};
            /*else {
             $scope.bVO = {};
             }*/
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/common/attachments.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                preCloseCallback: function (value) {
                    if (value && value == "clear") {
                        //重置
                        return false;
                    }
                    //取消
                    return true;
                }
            }).then(function (value) {
                if (value != null) {
                    // var data = $scope.getVOTms();

                    //  第一次初始化成null，后台没值，应该【】
                    if ($scope.dealAttachmentBGridOptions.data) {
                        angular.forEach(value, function (item) {
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });

                    } else {
                        // $scope[selectTabName].data = [];
                        // $scope[selectTabName].data.push(value);
                        angular.forEach(value, function (item) {
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });
                    }


                }
            }, function (reason) {

            });
        };

        $scope.onDownLoads = function () {
            var selectTabName = $scope.selectTabName;
            var rows = $scope[selectTabName].gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return angular.alert("请选择一条单据进行操作！");
            var ids = [];
            if (selectTabName == 'dealAttachmentBGridOptions') {
                for (var i = 0; i < rows.length; i++) {
                    ids.push(rows[i].pk_project_id);
                }
            }
            var exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
            /*            layer.load(2);
             window.location.href = $rootScope.basePath + "uploadFile/downloadFiles?isUser="+window.sessionStorage.getItem("token")+"&fileId=" + ids;
             layer.closeAll('loading');*/
        };
        /**
         * 过滤查询功能
         */
        /*$scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };*/
        /***
         * 查看
         */
        $scope.onView = function () {

            //  控制字表按钮的显示
            $scope.isEdit = false;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                // layer.load(2);
                $scope.findOne(rows[0].id, function (response) {
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isEdit = false;
                    $scope.isDisabled = true;
                });
            }
        };
        // $scope.onSubmit = function () {
        //     var pkProject;
        //     if($scope.isGrid){
        //         var rows = $scope.gridApi.selection.getSelectedRows();
        //         if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行提交!", {
        //             skin: 'layui-layer-lan',
        //             closeBtn: 1
        //         });
        //         if(rows[0].billstatus != 37) return layer.alert("只有暂存状态可以提交!", {skin: 'layui-layer-lan',closeBtn: 1});
        //         pkProject = rows[0].id;
        //     } else {
        //         pkProject = $scope.VO.id;
        //         if($scope.VO.billstatus != 37) return layer.alert("只有暂存状态可以提交!", {skin: 'layui-layer-lan',closeBtn: 1});
        //     }
        //     $scope.queryFlowInfo(pkProject,function (response) {
        //         $scope.submitData = response.result;
        //         ngDialog.openConfirm({
        //             showClose:true,
        //             closeByDocument:true,
        //             template:'view/workflowDef/submitDialog.html',
        //             className:'ngdialog-theme-formInfo',
        //             controller: 'submitCtrl',
        //             scope:$scope,
        //             preCloseCallback: function(value) {
        //                 if(value && value=="clear" ){
        //                     return false;
        //                 }
        //                 //取消
        //                 return true;
        //             }
        //         }).then(function (value) {
        //             $scope.submit(pkProject,value.msg,value.selects,value.pass);
        //         }, function (reason){
        //
        //         });
        //     });
        // };
        //
        // $scope.onLinkAuditFlow = function () {
        //     var pkProject;
        //     if($scope.isGrid){
        //         var rows = $scope.gridApi.selection.getSelectedRows();
        //         if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行查看!", {
        //             skin: 'layui-layer-lan',
        //             closeBtn: 1
        //         });
        //         pkProject = rows[0].id;
        //     } else {
        //         pkProject = $scope.VO.id;
        //     }
        //     $scope.queryWorkFlow(pkProject,function(response) {
        //         if(response.code != 200) return layer.alert(response.msg, {
        //             skin: 'layui-layer-lan',
        //             closeBtn: 1
        //         });
        //         $scope.tasks = response.result;
        //         $scope.imgUrl = getImgURL(response.imgUrl);
        //         ngDialog.openConfirm({
        //             showClose:true,
        //             closeByDocument:true,
        //             template:'view/workflowDef/linkAuditFlow.html',
        //             className:'ngdialog-theme-formInfo',
        //             controller: 'linkAuditFlowCtril',
        //             scope:$scope,
        //             preCloseCallback: function(value) {
        //                 if(value && value=="clear" ){
        //                     return false;
        //                 }
        //                 //取消
        //                 return true;
        //             }
        //         }).then(function (value) {
        //             $scope.onSubmit(value.msg);
        //         }, function (reason){
        //
        //         });
        //     });
        // };
        //
        // $scope.onAudit = function () {
        //     var pkProject;
        //     if($scope.isGrid){
        //         var rows = $scope.gridApi.selection.getSelectedRows();
        //         if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行审核!", {
        //             skin: 'layui-layer-lan',
        //             closeBtn: 1
        //         });
        //         if(rows[0].billstatus != 33 && rows[0].billstatus != 36) return layer.alert("只有审批中或驳回状态可以审核!", {skin: 'layui-layer-lan',closeBtn: 1});
        //         pkProject = rows[0].id;
        //     } else {
        //         pkProject = $scope.VO.id;
        //         if($scope.VO.billstatus != 33 && rows[0].billstatus != 36) return layer.alert("只有审批中或驳回状态可以审核!", {skin: 'layui-layer-lan',closeBtn: 1});
        //     }
        //     $scope.queryFlowInfo(pkProject,function (response) {
        //         $scope.submitData = response.result;
        //         $scope.submitData['type'] = 1;
        //         ngDialog.openConfirm({
        //             showClose:true,
        //             closeByDocument:true,
        //             template:'view/workflowDef/submitDialog.html',
        //             className:'ngdialog-theme-formInfo',
        //             controller: 'submitCtrl',
        //             scope:$scope,
        //             preCloseCallback: function(value) {
        //                 if(value && value=="clear" ){
        //                     return false;
        //                 }
        //                 //取消
        //                 return true;
        //             }
        //         }).then(function (value) {
        //             $scope.audit(pkProject,value.msg,value.selects,value.pass,value.type);
        //         }, function (reason){
        //
        //         });
        //     });
        // };

        $scope.onAdd = function () {
            $scope.isClear = true;
            $scope.form = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $scope.dealAttachmentBGridOptions.data = [];
            $rootScope.onAddCheck($scope);

        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form = true;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id, function () {
                    $scope.isGrid = false;
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                });

            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;

            }

            $scope.isGrid = false;
            $scope.isBack = true;
            $scope.isEdit = true;
            $scope.isDisabled = false;
        };
        /**
         * 卡片
         */
         //   $scope.onCard = function () {
         // var rows = $scope.gridApi.selection.getSelectedRows();
         // if (!rows || rows.length != 1)
         // return layer.alert("请选择一条数据进行查看!", {
         // skin: 'layui-layer-lan',
         // closeBtn: 1
         // });
         // $scope.findOne(rows[0].id);
         // $scope.isBack = true;
         // $scope.isGrid = false;
         // $scope.isCard = true;
         // };
        /**
         * 卡片
         */
        $scope.onCard = function (id) {
            if(!id){
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1)
                    return layer.alert("请选择一条数据进行查看!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                id = rows[0].id;
            }
            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {pk:id,tableName:$scope.table_name,billdef:$scope.billdef}).success(function (response)  {
                if (response && response.code == "200") {
                    $scope.card=true;
                    angular.assignData($scope.VO, response.result);
                    if(!response.result.taskHis)
                        $scope.mess=false;
                    else
                        $scope.mess=true;
                    $scope.isBack = true;
                    $scope.isGrid = false;
                    $scope.isCard = true;

                } else {
                    if(response){
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function(matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
            /*---------------------*/
            $scope.isBack = true;
            $scope.isGrid = false;
            $scope.isCard = true;
        };
           /*
           删除
            */
        $scope.onDelete = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert("请选择数据进行删除!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.confirm('是否删除选中数据？', {
                    btn: ['删除', '返回'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消删除!', {
                            shift: 6,
                            icon: 11
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    var ids = [];
                    for (var i = 0; i < rows.length; i++) {
                        ids.push(rows[i].id);
                    }
                    layer.load(2);
                    $http.post($scope.basePath + "versionNumber/delete", {ids: angular.toJson(ids)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg('删除成功!', {
                                icon: 1
                            });
                        }

                    });
                }
            );
        };
        /*
         * 关联
         * */
        $scope.onLink = function () {
        };

        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            if ($scope.isClear) {
                $scope.VO = $scope.initVO();
            }
            $scope.isDisabled = true;
            $scope.isEdit = false;
            $scope.isBack = false;
        };
        /**
         * 返回
         */
        $scope.onBack = function () {
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isDisabled = true;
            //阻止页面渲染
            $scope.form = false;
            $scope.card = false;
            $scope.queryForGrid($scope.QUERY);
        };
        /**
         * 保存判断必输项
         */
        $scope.onSave = function () {
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert(errEls[0].ngVerify.OPTS.message,
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else if($scope.VO.handbook=='Y'&&$scope.dealAttachmentBGridOptions.data.length==0){
                    return layer.alert("请上传附件！", {skin: 'layui-layer-lan', closeBtn: 1});
                }else {
                        $scope.onSaveVO();
                }
            }, true);
        };

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            if($scope.QUERY["check_date^gte"]&&$scope.QUERY["check_date^lte"]){
                if(new Date($scope.QUERY["check_date^gte"]) > new Date($scope.QUERY["check_date^lte"])){
                    return layer.alert("结束时间必须大于开始时间!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
            $scope.queryForGrid($scope.QUERY);
        };
        $scope.onReset = function () {
            $scope.QUERY = $scope.initQUERY();
            $scope.QUERY.id = null;
        };

        /**
         * 初始化参照
         */
        $scope.initView = function () {

        };

        /**
         * 子表新增
         */
        $scope.onAddLine = function () {
            $scope[$scope.selectTabName].data.push({
                pkOperator: $rootScope.userVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                pkDept: $rootScope.deptVO,
                pkOrg: $rootScope.orgVO
            })
        };
        /**
         * 子表删除
         */
        $scope.onDeleteLine = function () {
            var delRow = $scope[$scope.selectTabName].gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (var i = 0; i < $scope[$scope.selectTabName].data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope[$scope.selectTabName].data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope[$scope.selectTabName].data.splice(i, 1);
                    }
                }
            }
        };
    };

    $scope.initPage = function () {
        $scope.form = false;
        $scope.card = false;
        $scope.isClear = false;
        //layer.alert($stateParams.id);

        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;
        //控制附件上传和下载
        $scope.upOrDown = false;
        $scope.gridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [20, 50, 100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '发版记录.csv',
            columnDefs: [
                // {name: 'serialNo', displayName: '版本编号', width: 100,},
                {name: 'version', displayName: '版本号', width: 100,},
                {name: 'innerContent', displayName: '发版内容', width: 100,},
                {name: 'cusContent', displayName: '对外显示内容', width: 100,},
                {name: 'handbook', displayName: '是否下发操作手册', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'ts', displayName: '发版时间', width: 100,},
            ],
            data: [],
            exporterAllDataFn: function () {
                return $scope.queryAllForGrid($scope.QUERY).then(function () {
                    $scope.gridOptions.useExternalPagination = false;
                });
            },
        };
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;

            //添加行头
            $scope.gridApi.core.addRowHeaderColumn({
                name: 'rowHeaderCol',
                displayName: '',
                width: 30,
                cellTemplate: 'ui-grid/rowNumberHeader'
            });

            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                $scope.gridApi.page = newPage;
                $scope.gridApi.pageSize = pageSize;
                $scope.queryForGrid($scope.QUERY);
            });

            $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (rows.length == 1) {
                    if (!$scope.chilbTable) {
                        $scope.chilbTable = true;
                    }
                    angular.assignData($scope.VO, row.entity);
                    $scope.findOne(rows[0].id);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });
        };

        $scope.dealAttachmentBGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,
            columnDefs: [
                {name: 'attachment_name', displayName: '附件名称', width: 120},
            ],
            data: $scope.VO.dealAttachmentB,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.dealAttachmentBGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.dealAttachmentBGridOptions.gridApi = gridApi;
                }
                $scope.dealAttachmentBGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };

        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
            $scope.card = true;
        }
        /*else{
         $scope.queryForGrid({});
         }*/
    };

    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {
            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }
    };
    $scope.table_name = "lr_version_control";
    $scope.billdef = "VersionNumber";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initworkflow($scope, $http, ngDialog);    initonlineView($scope,$rootScope,$sce,$http,ngDialog);

});
app.controller('accountGridOptionsCtrl', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('linkmanGridOptionsCtrl', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('customerDeptGridOptionsCtrl', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {
});


