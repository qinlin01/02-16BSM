/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('batchExamineCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                businessExamineB: [],
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                emergencyScale: 3,
                billstatus: 31,
                customerType: 0,
                c2Type: 0,
                costscale: [],
                coomedium: [],

            };

        };
        $scope.entityVO = 'nc.vo.busi.BatchExamineVO';
        $scope.initQUERYChildren = function () {
            return {
                c2Type: 0,
                customerType: 0,
                busiTypeCode : 3

        }
        };
        $scope.QUERYCHILDREN = $scope.initQUERYChildren();
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
       $scope.initQUERY = function () {
            return {
                "operate_year": parseInt(new Date().format("yyyy")),
                "id": $stateParams.id
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode ='20402';
    };

    $scope.initHttp = function () {


        /**
         * 已阅
         */
        $scope.onRead = function () {
            layer.load(2);
            $http.post($scope.basePath + "batchExamine/read", {data: angular.toJson($scope.VO)}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    $scope.onCard();
                }
            });
        }

        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "batchExamine/queryForGrid", {
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

        //弹框列表查询
        $scope.queryForGridDialog = function (data) {
            layer.load(2);
            $http.post($scope.basePath + "projectRef/queryForGridDialog", {
                data: angular.toJson(data),
                page: $scope.projectGridApi ?  $scope.projectGridApi.page?$scope.projectGridApi.page:1:1,
                pageSize: $scope.projectGridApi ? $scope.projectGridApi.pageSize ?$scope.projectGridApi.pageSize:100:100,
            }).success(function (response) {
                if (response.code == 200) {
                    $scope.projectGridOptions.data = angular.fromJson(response.result.Rows);
                    $scope.projectGridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            });
        };


        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "batchExamine/findOne",{pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    $scope.businessExamineBGridOptions.data = $scope.VO.businessExamineB;
                    if (callback) {
                        callback();
                    }
                } else {
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
                }
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "batchExamine/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        angular.assignData($scope.VO, response.result);
                        $scope.businessExamineBGridOptions.data = $scope.VO.businessExamineB;
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
                    //layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                });
        };

        /**
         * 查询审批流信息
         */
        $scope.queryWorkFlow = function (pkProject, fun) {
        };
        /**
         * 查询审批流信息
         */
        $scope.queryFlowInfo = function (pkProject, fun) {

        };
        /**
         * 查询审批流信息
         */
        $scope.queryAuditFlowInfo = function (pkProject, fun) {
        };
        /*
         * 提交
         * */
        $scope.submit = function (pkProject, msg, selects, _pass) {
        };
        /*
         * 提交
         * */
        $scope.audit = function (pkProject, msg, selects, _pass, type) {
        };
    };

    $scope.initFunction = function () {
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function (item) {
            if (item && item.id) {
                $scope.onCard(item.id);
            }

        };

        $scope.checkProjectType = function () {
            var temp = false;
            for (var i = 0; i < $scope.businessExamineBGridOptions.data.length; i++) {
                if ($scope.businessExamineBGridOptions.data[i].pkProject.c_protype == '股东' && ($scope.businessExamineBGridOptions.data[i].pkProject.busi_typecode.indexOf("1-1") == 0 && $scope.businessExamineBGridOptions.data[i].pkProject.busi_typecode.indexOf("1-1-3") != 0)&&$scope.businessExamineBGridOptions.data[i].pkProject.project_type==0) {
                    temp = true;
                    break;
                }
            }
            if ($scope.VO.enumDocType == '3' && $scope.VO.ifContainScheme == 'Y' && temp) {
                $scope.VO.enumDocType = null;
                $scope.VO.ifContainScheme = 'N';
                 layer.alert("请在【电网资产保险方案】菜单录入和提交保险方案信息！", {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }else if ($scope.VO.enumDocType=='5' && temp){
                $scope.VO.enumDocType = null;
                 layer.alert("请在【电网资产保险方案】菜单录入和提交保险方案信息！", {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
            return true

        }

    };

    $scope.initWatch = function () {
        $scope.$watch('VO.enumDocType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if (newVal == 3) {
                    $scope.colEdit = false;
                } else {
                    $scope.colEdit = true;
                }
                // if(!$scope.checkProjectType()){
                //     return;
                // }
                $http.post($rootScope.basePath + "batchExamine/enumDocTypeWatch", {data: angular.toJson($scope.VO)})
                    .success(function (response) {
                        if (!response.flag) {
                            angular.assignData($scope.VO, response.result);
                            $scope.businessExamineBGridOptions.data = $scope.VO.businessExamineB;
                        }
                    });
            }
        }, true);
        // $scope.$watch('VO.ifContainScheme', function (newVal, oldVal) {
        //     if ($scope.isEdit) {
        //         if(!$scope.checkProjectType()){
        //             return;
        //         }
        //     }
        // }, true);
    };

    $scope.initButton = function () {
        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };

        /**
        * 暂存
        * */
        $scope.onTemporary = function (data) {
            $scope.VO.businessExamineB = $scope.businessExamineBGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            if(data){
                var tablename = $scope.table_name;
                $http.post($rootScope.basePath + "temporary/insert",{data:angular.toJson(data),tablename:tablename}).success(function(response) {
                    if(response.code == 200){
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                        return layer.alert('暂存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                });
            }
        }

        $scope.isExecute = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) {
                return true
            } else if (rows[0].billstatus == 34 && rows[0].execResult == null && rows[0].pkOperator.name == $rootScope.loginUser.name) {
                return false;
            }
            return true
        }
        /**
         * 填写执行结果
         */
        $scope.onExecute = function () {
            $scope.VO.exec = null;
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/report/execute.html',
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
            }, function (reason) {

            });
        }

        $scope.saveExecResult = function () {
            var data;
            if (!$scope.VO.exec) {
                return layer.alert('执行结果不能为空！', {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            } else {
                if ($scope.isGrid) {
                    $scope.gridApi.selection.getSelectedRows()[0].execResult = $scope.VO.exec;
                    data = $scope.gridApi.selection.getSelectedRows()[0];
                } else {
                    $scope.VO.execResult = $scope.VO.exec;
                    data = $scope.VO;
                }
                $http.post($rootScope.basePath + "batchExamine/save", {data: angular.toJson(data)})
                    .success(function (response) {
                        if (!response.flag) {
                            if ($scope.isGrid) {
                                $scope.queryForGrid($scope.QUERY);
                            } else {
                                $scope.onCard($scope.VO.id);
                            }

                            ngDialog.closeAll();
                        }
                        layer.closeAll('loading');
                    });
            }
        }


        $scope.saveCancel = function () {
            ngDialog.closeAll();

        }

        /**
         * 过滤查询功能
         */
        $scope.onQueryDialog = function () {
            if (!$scope.QUERYCHILDREN['pkC0Tradetype']) {
                return layer.alert("请填写业务来源！", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            } else {
                $scope.queryForGridDialog($scope.QUERYCHILDREN);
            }

        };


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

        $scope.onSubmit = function () {
            var pkProject;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                if (rows[0].billstatus != 37) return layer.alert("只有暂存状态可以提交!", {skin: 'layui-layer-lan', closeBtn: 1});
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 37) return layer.alert("只有暂存状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            $scope.queryFlowInfo(pkProject, function (response) {
            });
            // // alert(msg)
            // ngDialog.open({
            //     template: '../app/activiti-modal/tpl/approval.html',
            //     className: 'ngdialog-theme-formInfo',
            //     controller: 'approvalController',
            //     data: {
            //         config: _config
            //     },
            //     closeByDocument: true,
            //     closeByEscape: true,
            //     cache:false
            // });
        };


        /*$scope.onLinkAuditFlow = function () {
         var pkProject;
         if ($scope.isGrid) {
         var rows = $scope.gridApi.selection.getSelectedRows();
         if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行查看!", {
         skin: 'layui-layer-lan',
         closeBtn: 1
         });
         pkProject = rows[0].pkProject;
         } else {
         pkProject = $scope.VO.pkProject;
         }
         ;
         };
         */
        $scope.onAudit = function () {
            var pkProject;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                if (rows[0].billstatus != 33 && rows[0].billstatus != 36) return layer.alert("只有审批中或驳回状态可以审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 33 && rows[0].billstatus != 36) return layer.alert("只有审批中或驳回状态可以审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            ;


        };

        $scope.onAdd = function () {
            $scope.form = true;
            $scope.returnDta = [];
            $scope.isClear = true;
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/batchExamine/batchExamineDiaForm.html',
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
               var a=1;
            }, function (reason) {
                $scope.isGrid = false;
                $scope.isCard = false;
                $scope.isEdit = true;
                $scope.isDisabled = false;
                $scope.tabDisabled = true;
                $scope.isBack = true;
               // $scope.VO = $scope.initVO();
                $scope.VO.pkDeliverUnit = {};
                $scope.VO.pkDeliverUnit.pk

                    = '1002AA10000000000364';
                $scope.VO.pkDeliverUnit.code = '1008';
                $scope.VO.pkDeliverUnit.name

                    = '业务管理部';
                $scope.VO.pkC0Tradetype = {};
                $scope.VO.pkC0Tradetype.pk = $scope.returnDta[0].pkC0Tradetype.pk;
                $scope.VO.pkC0Tradetype.name = $scope.returnDta[0].pkC0Tradetype.name;
                $scope.VO.pkC0Tradetype.code = $scope.returnDta[0].pkC0Tradetype.code;
                var businessExamineBGridOptions =  $scope.businessExamineBGridOptions.data;
                if(businessExamineBGridOptions.length > 0) {
                    for(var i =0 ; i<$scope.returnDta.length ;i++){
                        var returnDtnPk = $scope.returnDta[i].pkProject.busi_typePk;
                        var parentPk = businessExamineBGridOptions[0].pkProject.busi_typePk;
                        if (returnDtnPk!=parentPk){
                            return layer.alert("要增加的数据与已增加数据的业务分类不同，因此不能同时提交，请核实!");
                        }else {
                            businessExamineBGridOptions.push($scope.returnDta[i]);
                        }
                    }

                }else{
                    businessExamineBGridOptions= $scope.returnDta;
                }
                $scope.VO.businessExamineB = businessExamineBGridOptions;
                $scope.businessExamineBGridOptions.data = businessExamineBGridOptions;
                $scope.initView();
            });
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
                $scope.findOne(rows[0].id);
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            }
        };
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
            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {
                pk: id,
                tableName: $scope.table_name,
                billdef: $scope.billdef
            }).success(function (response) {
                if (response && response.code == "200") {
                    $scope.card = true;
                    angular.assignData($scope.VO, response.result);
                    if (!response.result.taskHis)
                        $scope.mess = false;
                    else
                        $scope.mess = true;
                    $scope.isBack = true;
                    $scope.isGrid = false;
                    $scope.isCard = true;

                } else {
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
                }
            });
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
                    $http.post($scope.basePath + "batchExamine/delete", {ids: angular.toJson(ids)}).success(function (response) {
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


        $scope.onUploads = function () {
            $scope.isSubDisabled = false;
            $scope.aVO = {};
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
                            item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
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
        };

        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            if ($scope.isClear) {
                $scope.VO = $scope.initVO();
            }
            $scope.isDisabled = true;
            $scope.businessExamineBGridOptions.data = [];
            $scope.isEdit = false;
            $scope.isBack = false;
        };
        /**
         * 返回
         */
        $scope.onBack = function () {
            if($stateParams.id) {
                window.history.back(-2);
                return;
            }
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
            ngVerify.check('batcExamineForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    if ($scope.businessExamineBGridOptions.data.length == 0) {
                        return layer.alert("请填写子表信息!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    $scope.VO.enumDocTypeName = $rootScope.returnSelectName($scope.VO.enumDocType, "BUSINESSEXAMINEDOCTYPE");
                    $scope.VO.emergencyScaleName = $rootScope.returnSelectName($scope.VO.emergencyScale, "INSTANCYTYPE");
                    $scope.VO.ifContainRiskName = $rootScope.returnSelectName($scope.VO.ifContainRisk, "YESNO");
                    $scope.VO.ifContainSchemeName = $rootScope.returnSelectName($scope.VO.ifContainScheme, "YESNO");
                    $scope.VO.c2TypeName = $rootScope.returnSelectName($scope.VO.c2Type, "MARKETTYPE");
                    $scope.VO.customerTypeName = $rootScope.returnSelectName($scope.VO.customerType, "PROJECTCUSTOMERTYPE");
                    $scope.onSaveVO();
                }
            }, true);
        };

        $scope.onSaveDialog = function () {
            var len = $scope.projectGridApi.selection.getSelectedRows().length;
            if(!len){
                return layer.alert("请选择立项信息!");
            }
            angular.assignData($scope.VO, $scope.initVO());
            for (var i = 0; i < len; i++) {
                var datas = {
                    pkProject: {
                        c_procode: $scope.projectGridApi.selection.getSelectedRows()[i].cprocode,
                        code: $scope.projectGridApi.selection.getSelectedRows()[i].cprocode,
                        C_2_type: $scope.projectGridApi.selection.getSelectedRows()[i].c2Type,
                        C_0_CODE: $scope.projectGridApi.selection.getSelectedRows()[i].cinsureman.code,
                        C_0_NAME: $scope.projectGridApi.selection.getSelectedRows()[i].cinsureman.name,
                        pk_customer: $scope.projectGridApi.selection.getSelectedRows()[i].cinsureman.pk,
                        name: $scope.projectGridApi.selection.getSelectedRows()[i].cproname,
                        trade_name: $scope.projectGridApi.selection.getSelectedRows()[i].pkC0Tradetype.name,
                        pkC0Tradetype_name: $scope.projectGridApi.selection.getSelectedRows()[i].pkC0Tradetype.name,
                        c_protype: $scope.projectGridApi.selection.getSelectedRows()[i].pkC0Tradetype.name,
                        c_2_type: $scope.projectGridApi.selection.getSelectedRows()[i].c2Type,
                        pk: $scope.projectGridApi.selection.getSelectedRows()[i].pk,
                        project_type: $scope.projectGridApi.selection.getSelectedRows()[i].c2Type,
                        busi_typecode: $scope.projectGridApi.selection.getSelectedRows()[i].busi_type.code,
                        busi_typename: $scope.projectGridApi.selection.getSelectedRows()[i].busi_type.name,
                        busi_typePk: $scope.projectGridApi.selection.getSelectedRows()[i].busi_type.pk
                    },
                    pkC0Tradetype: {
                        pk: $scope.projectGridApi.selection.getSelectedRows()[0].pkC0Tradetype.pk,
                        name: $scope.projectGridApi.selection.getSelectedRows()[0].pkC0Tradetype.name,
                        code: $scope.projectGridApi.selection.getSelectedRows()[0].pkC0Tradetype.code
                    }
                }
                $scope.returnDta.push(datas);
            }
            ngDialog.close();
        };

        $scope.onCancelDialog = function () {
            ngDialog.close();
        };

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };
        $scope.onReset = function () {
            $scope.QUERY = $scope.initQUERY();
            $scope.QUERY.id = null;
        };

        $scope.onResetDialog = function () {
            $scope.QUERYCHILDREN = $scope.initQUERYChildren();
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
            $scope.onAdd();

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
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;

        $scope.projectGridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {name: 'cprocode', displayName: '立项编号', width: 100},
                {name: 'cproname', displayName: '项目名称', width: 100},
                {name: 'cinsureman.name', displayName: '客户名称', width: 100},
                {name: 'pkC0Tradetype.name', displayName: '客户产权关系', width: 100},
                {name: 'customerType', displayName: '立项对象类型', width: 100, cellFilter: 'SELECT_PROJECTCUSTOMERTYPE'},
                {name: 'c2Type', displayName: '业务类型', width: 100, cellFilter: 'SELECT_MARKETTYPE'},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100},
                {name: 'pkDept.name', displayName: '业务部门', width: 100}
            ],
        };
        $scope.projectGridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.projectGridApi = gridApi;

            //添加行头
            $scope.projectGridApi.core.addRowHeaderColumn({
                name: 'rowHeaderCol',
                displayName: '',
                width: 30,
                cellTemplate: 'ui-grid/rowNumberHeader'
            });

            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                $scope.projectGridApi.page = newPage;
                $scope.projectGridApi.pageSize = pageSize;
                $scope.queryForGridDialog($scope.QUERYCHILDREN);
            });

        };

        $scope.gridOptions = {
            rowTemplate: "<div ng-dblclick=\"grid.appScope.onRowDblClick(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>",
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '批量保送业务文件.csv',
            columnDefs: [
                {name: 'docCode', displayName: '批量报送文件编号', width: 100,},
                {name: 'enumDocType', displayName: '文件类型', width: 100, cellFilter: 'SELECT_BUSINESSEXAMINEDOCTYPE'},
                {name: 'emergencyScale', displayName: '缓急程度', width: 100, cellFilter: 'SELECT_INSTANCYTYPE'},
                {name: 'ifContainRisk', displayName: '是否列示风险评估内容', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'ifContainScheme', displayName: '是否包含保险方案', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'pkDeliverUnit.name', displayName: '主送单位', width: 100,},
                {name: 'pkC0Tradetype.name', displayName: '客户产权关系', width: 100,},
                {name: 'c2Type', displayName: '立项业务类型', width: 100, cellFilter: 'SELECT_MARKETTYPE'},
                {name: 'customerType', displayName: '立项对象类型', width: 100, cellFilter: 'SELECT_PROJECTCUSTOMERTYPE'},
                {name: 'finallyOpinion', displayName: '最终批复意见', width: 100,},
                {name: 'execResult', displayName: '发起人执行结果', width: 100,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '业务部门', width: 100,},
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'operateDate', displayName: '制单日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'operateTime', displayName: '制单时间', width: 100,},
            ],
            data: []
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

        $scope.selectTabName = 'businessExamineBGridOptions';
        $scope.businessExamineBGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'docCode', displayName: '文件编号', width: 100, enableCellEdit: false

                },
                {
                    name: 'pkProject.code',
                    displayName: '立项编号',
                    width: 100,
                    url: 'projectRef/queryForGrid'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'pkProject',
                    params: {busi_type: 'notNull'},
                    uiPopupRef: {
                        "id": $scope.$id, "columnDefs": [{
                            field: 'code',
                            displayName: '项目编号'
                        },
                            {
                                field: 'name',
                                displayName: '项目名称'

                            },
                            {
                                field: 'cinsureman_code',
                                displayName: '投保人编号'

                            },
                            {
                                field: 'cinsureman_name',
                                displayName: '投保人'

                            }]
                    }
                },
                {
                    name: 'pkProject.C_0_CODE', displayName: '客户编号', width: 100, enableCellEdit: false


                },
                {
                    name: 'pkProject.C_0_NAME', displayName: '客户名称', width: 100, enableCellEdit: false


                },
                {
                    name: 'pkProject.name', displayName: '立项名称', width: 100, enableCellEdit: false


                },
                {
                    name: 'pkProject.c_protype', displayName: '客户产权关系', width: 100, enableCellEdit: false

                },
                {
                    name: 'pkProject.busi_typename', displayName: '业务分类', width: 100, enableCellEdit: false

                },
                {
                    name: 'pkProject.c_2_type', displayName: '业务类型', width: 100, cellFilter: 'SELECT_MARKETTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name', enableCellEdit: false
                    , editDropdownOptionsArray: getSelectOptionData.MARKETTYPE
                },
                {
                    name: 'docTitle', displayName: '文件标题', width: 100


                },
            ],
            data: $scope.VO.businessExamineB,
            onRegisterApi: function (gridApi) {
                $scope.businessExamineBGridOptions.gridApi = gridApi;
            }
        };
        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
        /*else {
         $scope.queryForGrid({});
         }*/

        //附件
        $scope.dealAttachmentBGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'file_type',
                    displayName: '附件类型',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_DOUCUMENTTYPE',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.DOUCUMENTTYPE
                },

                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},

                {
                    name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                },
                {
                    name:'pk_project_id',
                    displayName:' ',
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
    };

    /*else{
     $scope.queryForGrid({});
     }*/
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();

        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {

            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }
    };
    $scope.table_name = "lr_batch_examine";
    $scope.billdef = "BatchExamine";
    $scope.beanName = "insurance.BatchExamineserviceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initPreviewFile($scope,$rootScope);
    initworkflow($scope, $http, ngDialog);
    initonlineView($scope,$rootScope,$sce,$http,ngDialog);

});


app.controller('businessExamineBGridOptionsCtrl', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {

});
