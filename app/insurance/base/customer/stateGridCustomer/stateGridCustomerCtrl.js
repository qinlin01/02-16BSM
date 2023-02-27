/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('stateGridCustomerCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog,ngVerify, $location, $timeout) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        // $scope.type = {code:1};
        $scope.initVO = function () {
            return {
                account: [],
                linkman: [],
                customerDept: [],
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                dr: 0,
                billstatus: 0,
                costscale: [],
                coomedium: []
            };
        };

        $scope.entityVO = 'nc.vo.busi.CustomerVO';
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "check_date^gte": "",
                "check_date^lte": "",
                "c_0_type": 1,
                "c_1_type": 1,
                "id": $stateParams.id
            }
        };
        $scope.upCusQuery = {
            dr: 0,
            billstatus: 1,
            c_0_type: 1,
            c_1_type: 1,
        }
        ;
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode = '10101';
        $scope.AccountList = [];
        $scope.initAccountList = function () {
            return {
                accType:'',
                accName:'',
                accNum:'',
                accBlank:'',
                jointBankNum:''
            };
        };
        $scope.LinkmanList = [];
        $scope.initLinkmanList = function () {
            return {
                linkmanType:'',
                name:'',
                dept:'',
                address:'',
                post:'',
                tele:'',
                fax:'',
                mail:'',
                memo:''
            };
        };
        $scope.CustomerDeptList = [];
        $scope.initCustomerDept = function () {
            return {
                dept:'',
                remark:'',
            };
        };
    };

    $scope.initHttp = function () {
        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data) {
            layer.load(2);
            return $http.post($rootScope.basePath + "stateGridCustomer/queryAllForGrid", {
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
            $http.post($scope.basePath + "stateGridCustomer/queryForGrid", {
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
        $scope.sendISC = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行发送!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            var pk = rows[0].id;
            layer.load(2);
            $http.post($scope.basePath + "stateGridCustomer/sendISC", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    layer.alert("成功", {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        }
        $scope.findOne = function (pk,ifDesensitize,callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: pk,ifDesensitize:ifDesensitize}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.AccountList = $scope.VO.account;
                    $scope.LinkmanList = $scope.VO.linkman;
                    $scope.CustomerDeptList = $scope.VO.customerDept;
                    $scope.accountGridOptions.data = $scope.VO.account;
                    $scope.linkmanGridOptions.data = $scope.VO.linkman;
                    $scope.customerDeptGridOptions.data = $scope.VO.customerDept;
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
            $scope.VO.account=$scope.AccountList;
            $scope.VO.linkman=$scope.LinkmanList;
            $scope.VO.customerDept =$scope.CustomerDeptList;
            // $scope.VO.account = $scope.AccountList;
            // $scope.VO.linkman = $scope.linkmanGridOptions.data;
            // $scope.VO.customerDept = $scope.customerDeptGridOptions.data;
            $http.post($rootScope.basePath + "stateGridCustomer/save", {data: angular.toJson($scope.VO), funCode: $scope.funCode})
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
        return $http.post($rootScope.basePath + "stateGridCustomer/queryForGrid", {
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
        /**
         * 监听注册号/统一社会信用代码是否存在
         */
        $scope.$watch('VO.c1Institution', function (newVal, oldVal) {
            if ($scope.form) {
                if ($scope.VO.c1Institution != null) {
                    if ($scope.VO.c1Institution != oldVal) {
                        //当value改变时执行的代码
                        $http.post($scope.basePath + "stateGridCustomer/checkIfExist", {c1Institution: $scope.VO.c1Institution, cName: $scope.VO.c0Name}).success(function (response) {
                            layer.closeAll('loading');
                            if (response && response.code != "200") {
                                return layer.alert("“注册号/统一社会信用代码”已存在",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        });
                    }
                }
            }
        });
        $scope.$watch('VO.upCustomer.name', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.upCustomer) {
                    $scope.VO.c1Level = $scope.VO.upCustomer.c_1_level + 1;
                }
            }

        }, true);
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

        $scope.onUploads = function () {
            $scope.isSubDisabled = false;

            $scope.aVO = {};
            /*else {
             $scope.bVO = {};
             }*/
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'insurance/base/customer/stateGridCustomer/attachments.html',
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
                $scope.findOne(rows[0].id,"Y", function (response) {
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
            $scope.AccountList = [];
            $scope.LinkmanList = [];
            $scope.CustomerDeptList = [];
            $scope.onAddAccount();
            $scope.onAddLinkman();
            $scope.onAddCustomerDept();
            $scope.VO = $scope.initVO();
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
            $scope.accountGridOptions.data = [];
            $scope.linkmanGridOptions.data = [];
            $scope.customerDeptGridOptions.data = [];
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
                $scope.findOne(rows[0].id,"N", function () {
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
        /*    $scope.onCard = function () {
         var rows = $scope.gridApi.selection.getSelectedRows();
         if (!rows || rows.length != 1)
         return layer.alert("请选择一条数据进行查看!", {
         skin: 'layui-layer-lan',
         closeBtn: 1
         });
         $scope.findOne(rows[0].id);
         $scope.isBack = true;
         $scope.isGrid = false;
         $scope.isCard = true;
         };*/
        /**
         * 卡片
         */
        $scope.onCard = function (id) {
            if (!id) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1)
                    return layer.alert("请选择一条数据进行查看!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                id = rows[0].id;
            }

            $scope.findOne(id,"Y",function (){
                $scope.isBack = true;
                $scope.isGrid = false;
                $scope.isCard = true;
                $scope.card = true;
            })
        };
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
                    $http.post($scope.basePath + "stateGridCustomer/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
            $scope.AccountList = [];
            $scope.LinkmanList = [];
            $scope.CustomerDeptList = [];

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
                } else {
                    if ($scope.dealAttachmentBGridOptions.data.length <= 0) {
                        return layer.alert("注册号/统一社会信用代码证附件 不能为空。",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    $scope.VO.linkman = $scope.LinkmanList;
                    $scope.isEmpty = true;
                    if ($scope.isEmpty) {
                        if ($scope.VO.linkman) {
                            if ($scope.VO.linkman.length == 0) {
                                return layer.alert("子表联系人信息不可为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            for (let i = 0; i < $scope.VO.linkman.length; i++) {
                                let item = $scope.VO.linkman [i];
                                if (!item.linkmanType || item.linkmanType.length == 0) {
                                    $scope.isEmpty = false;
                                    return layer.alert("子表属性联系人类型不可为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (!item.name || item.name.length == 0) {
                                    $scope.isEmpty = false;
                                    return layer.alert("子表属性联系人姓名不可为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (!item.tele || item.tele.length == 0) {
                                    $scope.isEmpty = false;
                                    return layer.alert("子表属性联系人电话不可为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (!item.address || item.address.length == 0) {
                                    $scope.isEmpty = false;
                                    return layer.alert("子表属性联系人地址不可为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }
                        }
                    }
                    if ($scope.isEmpty) {
                        //$scope.VO.billstatusName = $rootScope.returnSelectName($scope.VO.billstatus,"BILLSTATUS");
                        $scope.VO.c1LevelName = $rootScope.returnSelectName($scope.VO.c1Level, "CUSTOMERLEVELTYPE");
                        $scope.onSaveVO();
                    }
                }
            }, true);
        };

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            if ($scope.QUERY["check_date^gte"] && $scope.QUERY["check_date^lte"]) {
                if (new Date($scope.QUERY["check_date^gte"]) > new Date($scope.QUERY["check_date^lte"])) {
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
        /**
         * 子表信息增加
         */
        $scope.onAddAccount =function(){
            $scope.AccountList.push($scope.initAccountList());
        }
        $scope.onAddLinkman =function(){
            $scope.LinkmanList.push($scope.initLinkmanList());
        }
        $scope.onAddCustomerDept =function(){
            $scope.CustomerDeptList.push($scope.initCustomerDept());
        }
        /**
         * 子表信息删除
         */
        $scope.deletelistOptions=function(nowNumber,type){
            //type 1:账户信息 2：联系人信息 3：部门信息 4：注册号信息
            layer.confirm('请确认是否要删除此记录？', {
                    btn: ['确定', '取消'], //按钮
                    btn2: function (index, layero) {
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function (index) {
                if(type==1){
                    $scope.AccountList.splice(nowNumber,1);
                    $scope.$apply();
                    layer.close(layer.index);
                }
                if(type==2){
                    $scope.LinkmanList.splice(nowNumber,1);
                    $scope.$apply();
                    layer.close(layer.index);
                }
                if(type==3){
                    $scope.CustomerDeptList.splice(nowNumber,1);
                    $scope.$apply();
                    layer.close(layer.index);
                }
                }
            );
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
            exporterCsvFilename: '国网客户信息.csv',
            columnDefs: [
                {name: 'c0Code', displayName: '客户编号', width: 100,},
                {name: 'signcustomerno', displayName: '客户代码', width: 100,},
                {name: 'c0Name', displayName: '客户名称', width: 200,},
                {name: 'c1Institution', displayName: '注册号/统一社会信用代码', width: 150,},
                {name: 'tag', displayName: '客户标签', width: 100},
                {name: 'upCustomer.name', displayName: '上级管理单位', width: 200,},
                {name: 'c1Level', displayName: '客户级别', width: 80, cellFilter: 'SELECT_CUSTOMERLEVELTYPE'},
                {name: 'enumEntkind.name', displayName: '单位性质', width: 100,},
                {name: 'tradetype.name', displayName: '行业类别', width: 100,},
                {name: 'c1Province.name', displayName: '所在区域', width: 250,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人', width: 80,},
                {name: 'operateDate', displayName: '制单日期', width: 100,},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '业务部门', width: 100,},
                {name: 'pkChecker.name', displayName: '审批人', width: 80,},
                {name: 'checkDate', displayName: '审批日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'},
                // {name: 'checkTime', displayName: '复核时间', width: 100,},
                // {name: 'vapprovenote', displayName: '复核意见', width: 100,},
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
                    $scope.findOne(rows[0].id,"Y");
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });
        };

        $scope.selectTabName = 'dealAttachmentBGridOptions';
        $scope.accountGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'accType', displayName: '账户类型', width: 100, cellFilter: 'SELECT_ACCTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.ACCTYPE
                },
                {
                    name: 'accName', displayName: '开户名称', width: 100
                },
                {
                    name: 'accNum', displayName: '账号', width: 100
                },
                {
                    name: 'accBlank', displayName: '开户银行', width: 100
                },
                {
                    name: 'jointBankNum', displayName: '银行联行号', width: 100
                },
                // {
                //     name: 'pkOperator.name', displayName: '经办人', width: 100, enableCellEdit: false
                // },
                // {
                //     name: 'operateDate',
                //     displayName: '制单日期',
                //     width: 100,
                //     enableCellEdit: false,
                //     editableCellTemplate: 'ui-grid/refDate',
                //     cellFilter: 'date:"yyyy-MM-dd"'
                // },
                // {
                //     name: 'pkOrg.name', displayName: '业务单位', width: 100, enableCellEdit: false
                // },
                // {
                //     name: 'pkDept.name', displayName: '业务部门', width: 100, enableCellEdit: false
                // },
            ],
            data: $scope.VO.account,
            onRegisterApi: function (gridApi) {
                $scope.accountGridOptions.gridApi = gridApi;
            }
        };
        $scope.linkmanGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'linkmanType', displayName: '联系人类型', width: 100, cellFilter: 'SELECT_LINKMANTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.LINKMANTYPE
                },
                {name: 'name', displayName: '联系人姓名', width: 100},
                {name: 'dept', displayName: '联系人部门', width: 100},
                {name: 'address', displayName: '联系人地址', width: 100},
                {name: 'post', displayName: '邮编', width: 100},
                {name: 'tele', displayName: '联系人电话', width: 100},
                {name: 'fax', displayName: '传真', width: 100},
                {name: 'mail', displayName: '电子邮箱', width: 100},
                {name: 'memo', displayName: '备注', width: 100},
                // {name: 'pkOperator.name', displayName: '经办人', width: 100, enableCellEdit: false},
                // {name: 'operateDate', displayName: '制单日期', width: 100, enableCellEdit: false},
                // {name: 'pkOrg.name', displayName: '业务单位', width: 100, enableCellEdit: false},
                // {name: 'pkDept.name', displayName: '业务部门', width: 100, enableCellEdit: false},
            ],
            data: $scope.VO.linkman,
            onRegisterApi: function (gridApi) {
                $scope.linkmanGridOptions.gridApi = gridApi;
            }
        };
        $scope.customerDeptGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'dept', displayName: '部门名称', width: 100
                },
                {
                    name: 'remark', displayName: '备注', width: 100
                },
                // {
                //     name: 'pkOperator.name', displayName: '经办人', width: 100, enableCellEdit: false
                // },
                // {
                //     name: 'operateDate',
                //     displayName: '制单日期',
                //     width: 100,
                //     enableCellEdit: false,
                //     editableCellTemplate: 'ui-grid/refDate',
                //     cellFilter: 'date:"yyyy-MM-dd"'
                // },
            ],
            data: $scope.VO.customerDept,
            onRegisterApi: function (gridApi) {
                $scope.customerDeptGridOptions.gridApi = gridApi;
            }
        };
        $scope.customerChangeCompareGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'colName', displayName: '变更字段名称', width: 100, enableCellEdit: false


                },
                {
                    name: 'colOldVal', displayName: '变更前', width: 100, enableCellEdit: false


                },
                {
                    name: 'colNewVal', displayName: '变更后', width: 100, enableCellEdit: false


                },
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                $scope.customerChangeCompareGridOptions.gridApi = gridApi;
            }
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
                {
                    name: 'pk_project_id',
                    displayName: ' ',
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ng-click="grid.appScope.onPreviewFile(row.entity.pk_project_id,row.entity.attachment_name)" class="btn btn-transparent btn-xs tooltips" tooltip-placement="top">在线预览&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i></a></div>'
                }
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
    $scope.table_name = "lr_customer";
    $scope.billdef = "StateGridCustomer";
    $scope.beanName = "insurance.CustomerServiceImpl";
    $scope.child_table = angular.toJson({"account": "nc.vo.busi.AccountVO"});
    $scope.mainVoPath = "nc.vo.busi.CustomerVO";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope, $rootScope);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);
});
app.controller('accountGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('linkmanGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('customerDeptGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});


