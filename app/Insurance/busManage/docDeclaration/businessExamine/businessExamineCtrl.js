/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('businessExamineCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                ifRead: 1,
                ifContainScheme: "N",
                billstatus: 31,
                emergencyScale: 3,
                costscale: [],
                dealAttachmentB: [],
                coomedium: [],
                pkDeliverUnit: {pk: '1001AA100000000000HW', name: '业务管理部'},
                ifuhv: 0,
                isRelife: "N",
            };
        };
        $scope.colEdit = true;
        $scope.entityVO = 'nc.vo.busi.BusinessExamineVO';
        $scope.param = {pk_org_str: $rootScope.orgVO.pk}
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "isRelife": "N",
                "operate_year": parseInt(new Date().format("yyyy")),
                "id": $stateParams.id
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode ='20401';
    };

    $scope.initHttp = function () {

        /**
         * 已阅
         */
        $scope.onRead = function () {
            layer.load(2);
            $http.post($scope.basePath + "businessExamine/read", {data: angular.toJson($scope.VO)}).success(function (response) {
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
            $http.post($scope.basePath + "businessExamine/queryForGrid", {
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
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + "businessExamine/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
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

        $scope.projectRef =
            {
                id: $scope.$id,
                columnDefs: [
                    {
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
                    }

                ],
                data: ""
            };


        /**
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "businessExamine/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        $scope.colEdit = true;
                        $scope.isDisableds = true;
                        $scope.isUpdate = false;

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
        $scope.submit = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "businessExamine/submit", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    layer.closeAll('loading');
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
                    if (response.code == 200) {
                        if ($scope.isGrid) {
                            $scope.queryForGrid($scope.QUERY);
                        } else {
                            $scope.findOne($scope.pk);
                        }
                    }
                });
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
        $scope.check = function () {
            if ("" != $scope.VO.pkProject && $scope.VO.pkProject) {
                if ( $scope.VO.enumDocType == '3' && ($scope.VO.pkProject.busi_typecode.indexOf("1-1") == 0 && $scope.VO.pkProject.busi_typecode.indexOf("1-1-3") != 0) && $scope.VO.ifContainScheme == 'Y'&&$scope.VO.pkProject.project_type==0) {
                    $scope.VO.enumDocType = null;
                    $scope.VO.ifContainScheme = 'N';
                    layer.alert("请在【电网资产保险方案】菜单录入和提交保险方案信息！", {skin: 'layui-layer-lan', closeBtn: 1});
                } else if ( $scope.VO.enumDocType == '5' && ($scope.VO.pkProject.busi_typecode.indexOf("1-1") == 0 && $scope.VO.pkProject.busi_typecode.indexOf("1-1-3") != 0)&&$scope.VO.pkProject.project_type==0) {
                    $scope.VO.enumDocType = null;
                    layer.alert("请在【电网资产保险方案】菜单录入和提交保险方案信息！", {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
        }

    };

    $scope.initWatch = function () {
        $scope.$watch('VO.pkProject.name', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.pkProject.pk) {
                    $http.post($scope.basePath + "propertyProject/findOne", {pk: $scope.VO.pkProject.pk}).success(function (response) {
                        if (response && response.code == "200") {
                            if (response.result) {
                                $scope.VO.pkProject.busi_typename=response.result.busi_type.name;
                                $scope.VO.pkProject.C_0_CODE=$scope.VO.pkProject.cinsureman_code;
                                $scope.VO.pkProject.C_0_NAME=$scope.VO.pkProject.cinsureman_name;
                                $scope.VO.pkProject.busi_type = response.result.busi_type;
                                $scope.VO.pkProject.project_type = $scope.VO.pkProject.c2Type;
                                $scope.VO.pkProject.c2Type = response.result.c2Type;
                                $scope.VO.pkProject.c_2_type = $scope.VO.pkProject.c2Type;
                                $scope.VO.pkProject.pkCustomer = response.result.cinsureman.pk;
                            }
                        }
                    });
                } else {
                    $scope.VO.pkInsureman = {};
                }
            }
        }, true);

        $scope.$watch('VO.enumDocType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if (newVal == 3) {
                    $scope.colEdit = false;
                } else {
                    $scope.colEdit = true;
                }
                // $scope.check();
                if (newVal &&null!=$scope.VO.pkProject&&$scope.VO.pkProject.code) {
                    var year = new Date().format("yyyy");
                    $scope.VO.docTitle = '关于' + year + '年' + $scope.VO.pkProject.cinsureman_name
                        + '  ' + $rootScope.returnSelectName(newVal, 'BUSINESSEXAMINEDOCTYPE')
                        + '签报';
                    var year = $scope.VO.docTitle.substr(2,4);
                    if(year!=$scope.VO.pkProject.name.substr(0,4)){
                        angular.alert("请确认文件标题中年度是否正确！");
                    }
                }

            }
        }, true);
        // $scope.$watch('VO.docTitle', function (newVal, oldVal) {
        //     if (newVal === oldVal || newVal == undefined || newVal == null) return;
        //     if ($scope.isEdit) {
        //         if (newVal &&null!=$scope.VO.pkProject&&$scope.VO.pkProject.code) {
        //             var year = $scope.VO.docTitle.substr(2,4);
        //             if(year!=$scope.VO.pkProject.name.substr(0,4)){
        //                 angular.alert("请确认文件标题中年度是否正确！");
        //             }
        //         }
        //
        //     }
        // }, true);
        $(document).on('change', '#docTitle', function () {
            if (null!=$scope.VO.pkProject&&$scope.VO.pkProject.code) {
                var year = $scope.VO.docTitle.substr(2,4);
                if(year!=$scope.VO.pkProject.name.substr(0,4)){
                    angular.alert("请确认文件标题中年度是否正确！");
                }
            }
        });
        //文件类型控制‘是否列示风险评估报告内容’和‘是否包含保险方案’
        /* $scope.$watch = function () {
         $scope.$watch('VO.enumDocType', function (newVal, oldVal) {
         if (newVal === oldVal || newVal == undefined || newVal == null) return;
         if ($scope.isEdit) {
         alert(newVal);
         }
         }, true);
         */

        $scope.$watch('VO.pkProject.code', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if (newVal && $scope.VO.enumDocType) {
                    var year = new Date().format("yyyy");
                    $scope.VO.docTitle = '关于' + year + '年' + $scope.VO.pkProject.cinsureman_name
                        + '  ' + $rootScope.returnSelectName($scope.VO.enumDocType, 'BUSINESSEXAMINEDOCTYPE')
                        + '签报';
                    var year = $scope.VO.docTitle.substr(2,4);
                    if(year!=$scope.VO.pkProject.name.substr(0,4)){
                        angular.alert("请确认文件标题中年度是否正确！");
                    }
                }
            }
        }, true);

        // $scope.$watch('VO.pkProject.busi_typename', function (newVal, oldVal) {
        //     $scope.check();
        // }, true);
        // $scope.$watch('VO.enumDocType', function (newVal, oldVal) {
        //
        // }, true);
        // $scope.$watch('VO.ifContainScheme', function (newVal, oldVal) {
        //     $scope.check();
        // }, true);
    };

    $scope.initButton = function () {

        /**
         * 发送数据至电网系统
         */
        $scope.onSendEmd = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行操作!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $http.post($scope.basePath + "businessExamine/sendEmd", {id: rows[0].id}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    if (response.msg) {
                        // e.g. 字符转换为Entity Name
                        response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                            var rs = asciiChartSet_c2en[matched];
                            return rs == undefined ? matched : rs;
                        });
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                }
            });
        }

        /**
         * 查看附件
         */
        $scope.onViewAttachment = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行操作!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            $scope.object = rows[0];
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/businessExamine/attachment.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                preCloseCallback: function (value) {
                    if (value && value == "clear") {
                        //重置
                        return false;
                    }
                    return true;
                }
            }).then(function (value) {
                if (value != null) {

                }
            }, function (reason) {

            });
        }

        $scope.onViewdoc = function () {
            var selectTabName = $scope.selectTabName;
            var rows = $scope[selectTabName].gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return angular.alert("请选择一条单据进行操作！");
        }

        /*
         * 随时上传附件功能
         * */
        $scope.onUploadAnyTime = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            $scope.isUploadAnytime = true;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form = true;
                $scope.isGrid = false;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id);
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = true;
            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = true;
            }

        }

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
                    return true;
                }
            }).then(function (value) {
                if (value != null) {
                    $scope.gridOptions.data.handoutsAccessory = value;
                    $scope.VO.handoutsAccessory = {
                        pk: $scope.gridOptions.data.handoutsAccessory[0].pk_pub_blob,
                        name: $scope.gridOptions.data.handoutsAccessory[0].attachment_name
                    };
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
        };

        /**
         * 保单信息
         */
        $scope.onInsurance = function () {
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/businessExamine/InsuranceBill.html',
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
        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };

        $scope.isExecute = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) {
                return true
            } else if (rows[0].billstatus == 34 && rows[0].execResult == null && rows[0].pkOperator.name == $rootScope.userVO.name) {
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
                $http.post($rootScope.basePath + "businessExamine/save", {data: angular.toJson(data)})
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
            $scope.submit();
            $scope.queryFlowInfo(pkProject, function (response) {
            });

        };

        /*
         $scope.onLinkAuditFlow = function () {
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
         };*/

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
            $scope.isUploadAnytime = false;
            $scope.form = true;
            $scope.isGrid = false;
            $scope.isClear = true;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            $scope.isUploadAnytime = false;
            if ($scope.VO.enumDocType == 3) {
                $scope.colEdit = false;
            } else {
                $scope.colEdit = true;
            }
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
         * 暂存
         */
        $scope.onTemporary = function (data) {
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            if (data) {
                var tablename = $scope.table_name;
                $http.post($rootScope.basePath + "temporary/insert", {
                    data: angular.toJson(data),
                    tablename: tablename
                }).success(function (response) {
                    if (response.code == 200) {
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
                    $http.post($scope.basePath + "businessExamine/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
            $scope.colEdit = true;
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
            if ($scope.isUploadAnytime) {
                $scope.onSaveVO();
                return;
            }
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    $scope.VO.pkProject_project_typeName = $rootScope.returnSelectName($scope.VO.pkProject.project_type, "MARKETTYPE");
                    $scope.VO.enumDocTypeName = $rootScope.returnSelectName($scope.VO.enumDocType, "BUSINESSEXAMINEDOCTYPE");
                    $scope.VO.emergencyScaleName = $rootScope.returnSelectName($scope.VO.emergencyScale, "INSTANCYTYPE");
                    $scope.VO.ifContainRiskName = $rootScope.returnSelectName($scope.VO.ifContainRisk, "YESNO");
                    $scope.VO.ifContainSchemeName = $rootScope.returnSelectName($scope.VO.ifContainScheme, "YESNO");
                    if ($scope.VO.billstatus == 37) {
                        $scope.VO.billstatus = 31;
                    }
                    $scope.onSaveVO();
                }
            }, true);
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

        /**
         * 初始化参照
         */
        $scope.initView = function () {

        };

        /**
         * 子表新增
         */
        $scope.onAddLine = function () {
            $scope[$scope.selectTabName].data.push({});

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
        $scope.htmlPathCheckBill = 'view/businessExamine/printCheckBill.html';
        $scope.htmlPathReportBill = 'view/businessExamine/printReportBill.html';
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;
        $scope.isUploadAnytime = false;

        $scope.gridOptions = {
            rowTemplate: "<div ng-dblclick=\"grid.appScope.onRowDblClick(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>",
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [20, 50, 100],
            paginationPageSize: 20,
            useExternalPagination: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '业务文件申报审批.csv',
            columnDefs: [
                {name: 'docCode', displayName: '文件编号', width: 100,},
                {name: 'pkProject.code', displayName: '立项编号', width: 100,},
                {name: 'pkProject.C_0_CODE', displayName: '客户编号', width: 100,},
                {name: 'pkProject.name', displayName: '立项名称', width: 100,},
                {name: 'pkProject.project_type', displayName: '业务类型', width: 100, cellFilter: 'SELECT_MARKETTYPE'},
                {name: 'docTitle', displayName: '文件标题', width: 100,},
                {name: 'pkProject.C_0_NAME', displayName: '客户名称', width: 100,},
                {name: 'ifContainRisk', displayName: '是否列示风险评估内容', width: 100, cellFilter: 'SELECT_YESNO'},
                // {name: 'pkDeliverUnit.name', displayName: '主送单位', width: 100,},
                {name: 'enumDocType', displayName: '文件类型', width: 100, cellFilter: 'SELECT_BUSINESSEXAMINEDOCTYPE'},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'emergencyScale', displayName: '缓急程度', width: 100, cellFilter: 'SELECT_INSTANCYTYPE'},
                {name: 'finallyOpinion', displayName: '最终批复意见', width: 100,},
                {name: 'execResult', displayName: '发起人执行结果', width: 100,},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '业务部门', width: 100,},
                {name: 'ifContainScheme', displayName: '是否包含保险方案', width: 100, cellFilter: 'SELECT_YESNO'},
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
                    $scope.pk_project = rows[0].pkProject.pk;
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


        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
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
        if ($scope.selectTabName == 'trainCostGridOptions') {
            $scope.secChild = false;
        } else {
            $scope.secChild = true;
        }
    };
    $scope.table_name = "lr_business_examine";
    $scope.billdef = "BusinessExamine";
    $scope.beanName = "insurance.BusinessExamineSeviceImpl";
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


//附件
app.controller('attachmentCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify, $compile) {

    $scope.onRowDblClick = function (item) {
        if (item) {
            if (item.attachment_name.indexOf(".wps") > 0) {
                $http.post($scope.basePath + "businessExamine/openWidget", {
                    data: angular.toJson(item)
                }).success(function (response) {
                    if (response.code == 200) {
                    }
                    layer.closeAll('loading');
                });
            } else {
                return layer.alert("只可在线查看.wps文件，其他文件请下载后查看！", {skin: 'layui-layer-lan', closeBtn: 1});
            }
        }

    };

    $scope.gridOptions = {
        rowTemplate: "<div ng-dblclick=\"grid.appScope.onRowDblClick(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>",
        enableRowSelection: true,
        enableSelectAll: true,
        enableFullRowSelection: true,//是否点击cell后 row selected
        enableRowHeaderSelection: true,
        multiSelect: true,//多选
        paginationPageSizes: [5, 10, 20],
        paginationPageSize: 20,
        useExternalPagination: true,
        columnDefs: [
            {name: 'attachment_name', displayName: '附件名称', pinnedLeft: true, width: 400},
            {name: 'upload_operator.name', displayName: '上传人', pinnedLeft: true, width: 100},
            {name: 'upload_date', displayName: '上传时间', pinnedLeft: true, width: 200}
        ],
        data: $scope.object.dealAttachmentB
    };
    $scope.gridOptions.onRegisterApi = function (gridApi) {
        $scope.gridApi = gridApi;
        $scope.gridApi.core.addRowHeaderColumn({
            name: 'rowHeaderCol',
            displayName: '',
            width: 30,
            cellTemplate: 'ui-grid/rowNumberHeader'
        });
    };
    $scope.onDownload = function () {
        var rows = $scope.gridApi.selection.getSelectedRows();
        if (rows.length <= 0) {
            return layer.alert("请选择一行数据", {skin: 'layui-layer-lan', closeBtn: 1});
        } else {
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
                ids.push(rows[i].pk_project_id);
            }
            var exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        }
    }
    $scope.queryForGrid($scope.childQuery);
})
;

app.controller('insuranceBillCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify, $compile) {
    //初始化查询
    $scope.initDoc = function () {
        return {
            "pk_project": $scope.pk_project
        }
    }
    $scope.childQuery = $scope.initDoc();
    $scope.templateGridOptions = {
        enableRowSelection: true,
        enableSelectAll: true,
        enableFullRowSelection: true,//是否点击cell后 row selected
        enableRowHeaderSelection: true,
        multiSelect: true,//多选
        paginationPageSizes: [20, 50, 100],
        paginationPageSize: 20,
        useExternalPagination: true,
        columnDefs: [
            {name: 'insuranceno', displayName: '保单号', width: 100},
            {name: 'c_procode', displayName: '立项编号', width: 100},
            {name: 'c_proname', displayName: '立项名称', width: 100},
            {name: 'c_protype', displayName: '客户产权关系', width: 100},
            {name: 'project_date', displayName: '立项日期', width: 100},
            {name: 'finalInsuranceName', displayName: '险种名称', width: 100},
            {name: 'estimate_name', displayName: '投保人', width: 100},
            {name: 'insurancetotalmoney', displayName: '总保额', width: 100},
            {name: 'insurancetotalcharge', displayName: '总保费', width: 100},
            {name: 'receivefeemount', displayName: '佣金总额', width: 100},
            {name: 'fact_money', displayName: '佣金结算金额', width: 100},
            {name: 'un_receivefeemount', displayName: '未结算佣金金额', width: 100},
            {name: 'startdate', displayName: '保单起保时间', width: 100},
            {name: 'enddate', displayName: '保单截止时间', width: 100},
            {name: 'builddept', displayName: '建立部门', width: 100},
        ],
        data: []
    };
    $scope.templateGridOptions.onRegisterApi = function (gridApi) {
        //set gridApi on scope
        $scope.templateGridOptions.gridApi = gridApi;
    };

    $scope.queryForGrid = function (data) {
        layer.load(2);
        $http.post($scope.basePath + "businessExamine/queryInsuranceBill", {
            data: angular.toJson(data)
        }).success(function (response) {
            if (response.code == 200) {
                $scope.templateGridOptions.data = response.result;
            }
            layer.closeAll('loading');
        });
    };
    $scope.onQuery = function () {
        $scope.queryForGrid($scope.childQuery);
    }
    $scope.queryForGrid($scope.childQuery);
});