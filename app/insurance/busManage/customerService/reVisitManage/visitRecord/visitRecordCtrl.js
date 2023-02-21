/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('visitRecordCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                visitPerson: [],
                dealAttachmentB: [],
                visitClient: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                billstatus: 28,
                dr: 0,
                costscale: [],
                coomedium: []
            };
        };
        $scope.entityVO = 'nc.vo.busi.VisitRecordVO';

        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {"operate_year": parseInt(new Date().format("yyyy"))}
        };

        $scope.initHISVO = function () {
            return {}
        };
        $scope.HISVO = $scope.initHISVO();
        //初始化查询
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode = '2070302';
    };

    $scope.initHttp = function () {
        $scope.queryAllForGrid = function (data) {
            layer.load(2);
            return $http.post($rootScope.basePath + "visitRecord/queryAllForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            })
                .success(function (response) {
                    if (response.code == 200) {
                        if (!$scope.query) {
                            $scope.query = $scope.gridOptions.columnDefs;
                        }
                        $scope.gridOptions.data = response.result.Rows;
                        $scope.gridOptions.totalItems = response.result.Total;
                    }
                    layer.closeAll('loading');
                });
        };
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "visitRecord/queryForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response.code == 200) {
                    if (!$scope.query) {
                        $scope.query = $scope.gridOptions.columnDefs;
                    }
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            });
        };
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + "visitRecord/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.visitPersonGridOptions.data = $scope.VO.visitPerson;
                    $scope.visitClientGridOptions.data = $scope.VO.visitClient;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
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
                    //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "visitRecord/save", {
                data: angular.toJson($scope.VO),
                funCode: $scope.funCode
            }).success(function (response) {
                if (response && response.code == "200") {
                    $scope.VO = response.result;
                    $scope.onCard($scope.VO.id);
                    layer.closeAll('loading');
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
                //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
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

        $scope.onVisitHistory = function (pkCustomer) {
            $http.post($scope.basePath + "visitRecord/visitHistory", {
                pkCustomer: pkCustomer
            }).success(function (response) {
                if (response.code == 200) {
                    if (response.msg) {
                        return layer.alert(response.msg, {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                    }
                    angular.assignData($scope.HISVO, response.result);
                    ngDialog.open({
                        template: 'view/visitRecord/visitHistory.html',
                        className: 'ngdialog-theme-formInfo',
                        scope: $scope,
                        closeByDocument: true,
                        closeByEscape: true,
                        cache: false
                    });
                }
                layer.closeAll('loading');
            });
        };
        $scope.onVisitHistory2 = function (pkCustomer) {
            $http.post($scope.basePath + "visitRecord/visitHistory", {
                pkCustomer: $scope.VO.pkCustomer.pk
            }).success(function (response) {
                if (response.code == 200) {
                    if (response.msg) {
                        return layer.alert(response.msg, {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                    }
                    angular.assignData($scope.HISVO, response.result);
                    ngDialog.open({
                        template: 'view/visitRecord/visitHistory.html',
                        className: 'ngdialog-theme-formInfo',
                        scope: $scope,
                        closeByDocument: true,
                        closeByEscape: true,
                        cache: false
                    });
                }
                layer.closeAll('loading');
            });
        };
    };
    $scope.queryAllForGrid = function (data) {
        layer.load(2);
        return $http.post($rootScope.basePath + "visitRecord/queryForGrid", {
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
            if (item && item.id) {
                $scope.onCard(item.id);
            }

        };
    };

    $scope.initWatch = function () {

    };

    $scope.initButton = function () {

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

        /**
         * 上传
         */
        $scope.onUploads = function () {
            $scope.isSubDisabled = false;
            $scope.aVO = {};
            // $scope.array = $rootScope.arrayToTree($rootScope.SELECT.SUBMITTYPE);
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
                            item.submitDate = new Date().format("yyyy-MM-dd HH:mm:ss");
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });
                    }
                }
            }, function (reason) {

            });
        };
        /**
         * 下载
         * @returns {*}
         */
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
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
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
                if (rows[0].billstatus != 31) return layer.alert("只有未上报状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 31) return layer.alert("只有未上报状态可以提交!", {
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
        };

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
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isClear = true;
            $scope.isBack = true;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
            // $http.post($rootScope.basePath + "visitRecord/chacheck", {data: angular.toJson($scope.VO)});
        };
        /**
         * 修改
         */
        $scope.onEdit = function () {

            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            if ($scope.isGrid) {
                $scope.form = true;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1)
                    return layer.alert("请选择一条数据进行修改!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                $scope.findOne($scope.VO.id);
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
                $scope.isGrid = false;
                $scope.form = true;
                $scope.isCard = false;
            } else if ($scope.isCard) {
                $scope.findOne($scope.VO.id);
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
                $scope.isGrid = false;
                $scope.form = true;
                $scope.isCard = false;
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

            $scope.VO.visitPerson = $scope.visitPersonGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $scope.VO.visitClient = $scope.visitClientGridOptions.data;
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
                        $scope.isCard = true;
                        $scope.isBack = true;
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
        $scope.onCard = function () {
            $scope.isEdit = false;
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1)
                return layer.alert("请选择一条数据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            layer.load(2);
            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {
                pk: rows[0].id,
                tableName: $scope.table_name,
                billdef: $scope.billdef
            }).success(function (response) {
                if (response && response.code == "200") {
                    layer.closeAll('loading');
                    $scope.card = true;
                    angular.assignData($scope.VO, response.result);
                    $scope.isBack = true;
                    $scope.isGrid = false;
                    $scope.isCard = true;
                    $scope.isGrid = false;
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
                    $http.post($scope.basePath + "visitRecord/delete", {ids: angular.toJson(ids)}).success(function (response) {
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

        /**
         * 退回
         */
        $scope.onRollback = function () {

            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert("请选择数据进行退回!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.confirm('是否退回选中数据？', {
                    btn: ['退回', '取消'], //按钮
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
                    var ids = [];
                    for (var i = 0; i < rows.length; i++) {
                        ids.push(rows[i].id);
                    }
                    layer.load(2);

                    $http.post($scope.basePath + "visitRecord/rollback", {id: rows[0].id}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg('退回成功!', {
                                icon: 1
                            });
                        }

                    });
                }
            );
        };

        /**
         * 确认完成(提交页面)
         */
            $scope.onConfirm2 = function () {
            //var rows = $scope.gridApi.selection.getSelectedRows();
            // if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行确认!", {
            //     skin: 'layui-layer-lan',
            //     closeBtn: 1
            // });
            var id = "";
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行确认!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                id = rows[0].id;
            } else  {
                id = $scope.VO.id;
            }
            layer.load(2);
            $http.post($scope.basePath + "visitRecord/confirm", {
                id: id,
                funCode: $scope.funCode
            }).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    $scope.VO.billstatus = 45;
                    layer.msg('确认成功!', {
                        icon: 1
                    });
                    $scope.onBack();
                }else{
                    layer.msg('确认异常!', {
                        icon: 1
                    });
                    $scope.onBack();
                }

            });
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
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };

        /**
         * 保存判断必输项
         */
        $scope.onSave = function () {

            $scope.VO.visitPerson = $scope.visitPersonGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $scope.VO.visitClient = $scope.visitClientGridOptions.data;
            ngVerify.check('visitRecForm', function (errEls) {
                    if (errEls && errEls.length) {
                        return layer.alert("请先填写所有的必输项!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if (!$scope.VO.busiements && !$scope.VO.serviceImpr && !$scope.VO.opinionSugges && !$scope.VO.other) {
                        return layer.alert("'客户反馈问题'业务需求、服务提示、意见建议或其他不能同时为空", {skin: 'layui-layer-lan', closeBtn: 1});
                    }

                    var visit = $scope.VO.visitPerson;
                    if (!visit || visit.length == 0) {
                        return layer.alert("子表回访执行人不可为空！",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    for (var i = 0; i < visit.length; i++) {
                        if (!visit[i].roletype) {
                            return layer.alert("子表属性角色类型不可为空！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    $scope.VO.visitTypeName = $rootScope.returnSelectName($scope.VO.visitType, "VISITTYPE");
                    $scope.VO.isPlantedName = $rootScope.returnSelectName($scope.VO.isPlanted, "YESNO");
                    $scope.VO.visit1PurposeName = $rootScope.returnSelectName($scope.VO.visit1Purpose, "YESNO");
                    $scope.VO.visit2PurposeName = $rootScope.returnSelectName($scope.VO.visit2Purpose, "YESNO");
                    $scope.VO.visit3PurposeName = $rootScope.returnSelectName($scope.VO.visit3Purpose, "YESNO");
                    $scope.VO.visit4PurposeName = $rootScope.returnSelectName($scope.VO.visit4Purpose, "YESNO");
                    $scope.VO.visit5PurposeName = $rootScope.returnSelectName($scope.VO.visit5Purpose, "YESNO");
                    // 如果是暂存的数据时，需要修正单据状态
                    if ($scope.VO.billstatus == 37) {
                        $scope.VO.billstatus = 28;
                    }
                    $scope.onSaveVO();
                }
                , true);


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
    }
    ;

    $scope.initPage = function () {
        $scope.form = false;
        $scope.card = false;
        $scope.isClear = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;

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
            exporterCsvFilename: '客户回访记录.csv',
            columnDefs: [
                {name: 'serialNo', displayName: '客户回访编号', width: 100,},
                {name: 'visitType', displayName: '回访方式', width: 100, cellFilter: 'SELECT_VISITTYPE'},
                {name: 'isPlanted', displayName: '是否计划内', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'pkCustomer.code', displayName: '客户编号', width: 100,},
                {name: 'pkCustomer.name', displayName: '客户名称', width: 100,},
                {name: 'visitClidept', displayName: '客户相关单位/部门', width: 100,},
                {name: 'visitName', displayName: '客户联系人', width: 100,},
                {name: 'respondentTitle', displayName: '职务', width: 100,},
                {name: 'coninfor', displayName: '联系方式', width: 100,},
                {name: 'visitDate', displayName: '回访实施日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'visitAddress.name', displayName: '回访地点', width: 100,},
                {name: 'customerType.name', displayName: '客户类型', width: 100,},
                {name: 'visitAssign', displayName: '回访任务', width: 100,},
                {name: 'visitRecard', displayName: '回访情况记录', width: 100,},
                {name: 'charge', displayName: '回访负责人', width: 100,},
                {name: 'executor', displayName: '回访业务员', width: 100,},
                {name: 'busiements', displayName: '业务需求', width: 100,},
                {name: 'serviceImpr', displayName: '服务提升', width: 100,},
                {name: 'opinionSugges', displayName: '意见建议', width: 100,},
                {name: 'other', displayName: '其他', width: 100,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '业务部门', width: 100,},
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'operateDate', displayName: '制单日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'operateTime', displayName: '制单时间', width: 100,},
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

        $scope.selectTabName = 'visitPersonGridOptions';
        $scope.visitPersonGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'personName.org_name',
                    displayName: '回访人员单位',
                    width: 200,
                    url: 'ORGREF'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'pkOrg',
                    enableCellEdit: false

                },
                {
                    name: 'personName.deptname',
                    displayName: '回访人员部门',
                    width: 130,
                    url: 'DEPTTREEREF'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'pkDept',
                    enableCellEdit: false

                },
                {
                    name: 'personName.name', displayName: '回访人员姓名', width: 120, url: 'userRef/queryForGrid2'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'personName'

                },
                {
                    name: 'roletype',
                    displayName: '角色类型',
                    width: 130,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_ROLETYPE'
                    ,
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.ROLETYPE
                },
            ],
            data: $scope.VO.visitPerson,
            onRegisterApi: function (gridApi) {
                $scope.visitPersonGridOptions.gridApi = gridApi;
            }

        };
        $scope.visitClientGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'pkCustomer.name', displayName: '客户名称', width: 300, url: 'customerListRef/queryForGrid'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'pkCustomer',
                    params: {param: '1'}
                },
            ],
            data: $scope.VO.visitClient,
            onRegisterApi: function (gridApi) {
                $scope.visitClientGridOptions.gridApi = gridApi;
            }
        };

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
                    name: 'submitDate',
                    displayName: '提交日期',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'date:"yyyy-MM-dd"'

                    ,
                    type: 'date',
                    editableCellTemplate: 'ui-grid/refDate'
                },
                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},
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
                // $scope.dealAttachmentBGridOptions.gridApi.core.addRowHeaderColumn({
                //     name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                // });
            }
        };
        if ($stateParams.pk != null) {
            $scope.queryForGrid({});
        } /*else {
            $scope.queryForGrid();
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

    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    // initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope, $rootScope);
    $scope.table_name = "lr_visit_record";
    $scope.billdef = "VisitRecord";

})
;
app.controller('visitPersonGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('visitClientGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
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
        paginationPageSize: 100,
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