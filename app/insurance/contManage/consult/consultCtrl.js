/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('consultCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                payment: [],
                assistant: [],
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                pkCorp: $rootScope.orgVO,
                builddept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                billstatus: 31,
                dr: 0,
                costscale: [],
                coomedium: []
            };
        };
        $scope.entityVO = 'nc.vo.busi.ConsultVO';
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
       $scope.initQUERY = function () {
            return { "operate_year": parseInt(new Date().format("yyyy")),
                "id": $stateParams.id
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode ='305';
    };

    $scope.projectRef =
        {
            id: $scope.$id,
            columnDefs: [
                {
                    field: 'vbillno',
                    displayName: '项目编号'
                },
                {
                    field: 'c_proname',
                    displayName: '项目名称'
                },
                {
                    field: 'c_0_code',
                    displayName: '投保人编号'
                },
                {
                    field: 'c_0_name',
                    displayName: '投保人'
                }

            ],
            data: ""
        };


    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "consult/queryForGrid", {
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
        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data) {
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData =  $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.basePath + "consult/queryAllForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            })
                .success(function (response) {
                    window.open($rootScope.basePath + "uploadFile/downLoadByUrl?url="+encodeURI(encodeURI(response.downPath)));
                    layer.closeAll('loading');
                }).error(function () {
                    layer.closeAll('loading');
                });
        };
        //作废
        $scope.onDiscard = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert("请选择一条数据!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.confirm('是否作废选中数据？', {
                    btn: ['作废', '返回'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消作废!', {
                            shift: 6,
                            icon: 11
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    layer.load(2);
                    $http.post($scope.basePath + "consult/discard",{pk:$scope.pk,billdef:$scope.billdef}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            if (response.code == 200) {
                                //调用查询方法刷新页面
                                $scope.queryForGrid($scope.QUERY);
                                return layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                                // layer.msg(response.msg, {
                                //     shift: 6,
                                //     icon: 1
                                // });
                            } else {
                                layer.msg('操作失败!', {
                                    shift: 6,
                                    icon: 11
                                });
                            }
                        }
                    });
                }
            );
        };
        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "consult/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
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
            $http.post($rootScope.basePath + "consult/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
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

        $scope.ctotalBlur = function () {
            if ($scope.VO.consultperiod != null && $scope.VO.pkCustomer != null) {
                $scope.VO.unpayconsulttotal = $scope.VO.ctotal;
                if (!$scope.isGrid) {
                    $http.post($scope.basePath + "consult/consultWatch", {data: angular.toJson($scope.VO)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            angular.assignData($scope.VO.payment, response.result.payment);

                        }

                    });
                }

            }
        }

    };

    $scope.initWatch = function () {

        $scope.$watch('VO.typeconsultNO', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['typeconsultNOName'] = $rootScope.SELECT.CONSULTTYPE[newVal - 1].name;
            }
        }, true);

        $scope.$watch('VO.pkProject.c_proname', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.pkProject.pk) {
                    $scope.VO.projectinfo =  $scope.VO.pkProject.c_procode;//立项号
                    $scope.VO.pkC0Tradetype =  $scope.VO.pkProject.c_protype;//客户产权关系
                    $http.post($scope.basePath + "propertyProject/findOne", {pk: $scope.VO.pkProject.pk}).success(function (response) {
                        if (response && response.code == "200") {
                            if (response.result) {
                                $scope.VO.pkCustomer = response.result.cinsureman;
                                $scope.VO.pkC0Tradetype = response.result.pkC0Tradetype;
                                $scope.VO.projectkind = response.result.pkC0Tradetype && response.result.pkC0Tradetype.name;
                                $scope.VO.busi_type = response.result.busi_type;
                                $scope.VO.temporaryPlan = response.result.temporaryPlan;
                                $scope.VO.customeraddr = response.result.cinsureman.c_0_address;//地址
                                $scope.VO.projectinfo = response.result.cprocode;//立项号
                            }else{
                                $http.post($scope.basePath + "assessorsProject/findOne", {pk: $scope.VO.pkProject.pk}).success(function (response) {
                                    if (response && response.code == "200") {
                                        if (response.result) {
                                            $scope.VO.pkCustomer = response.result.cInsureman;
                                            $scope.VO.pkC0Tradetype = response.result.cProtypepk;
                                            $scope.VO.busi_type = response.result.busi_type;
                                            $scope.VO.customeraddr = response.result.cProaddress;//地址
                                            $scope.VO.projectinfo = response.result.vbillno;//立项号
                                        }
                                    }
                                });
                            }
                        }
                    });
                    $http.post($scope.basePath + "consult/consultWatch", {data: angular.toJson($scope.VO)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            angular.assignData($scope.VO.payment, response.result.payment);
                            $scope.paymentGridOptions.data = $scope.VO.payment;
                        }
                    });
                }
            }
        }, true);

        $scope.$watch('VO.pkCustomer.name', function (newVal, oldValue) {
            if (newVal == oldValue || newVal == undefined || newVal == '') return;
            if ($scope.isEdit) {
                if ($scope.VO.consultperiod != null && $scope.VO.pkCustomer != null) {
                    if (!$scope.isGrid) {
                        $http.post($scope.basePath + "consult/consultWatch", {data: angular.toJson($scope.VO)}).success(function (response) {
                            layer.closeAll('loading');
                            if (response && response.code == "200") {
                                angular.assignData($scope.VO.payment, response.result.payment);
                                $scope.paymentGridOptions.data = $scope.VO.payment;
                            }

                        });
                    }

                }

            }
        }, true);

        $scope.$watch('VO.newdate', function (newVal, oldVal) {
            if(!$scope.isEdit){
                return;
            }
            if (newVal == undefined || newVal == null ) return;
            let newDate = new Date(newVal).format("yyyy-MM-dd");
            let oldDate = new Date(oldVal).format("yyyy-MM-dd");
            if(newDate === oldDate) return ;
            // var startDate = new Date($scope.VO.newdate);
            // var year = startDate.getFullYear() + 1;
            // $scope.VO.enddate = year + '-' + (startDate.getMonth() + 1) + '-' + startDate.getDate();
            //修改起始日期与结束日期的计算方式
            let dates = (new Date(newVal).setFullYear(new Date(newVal).getFullYear() + 1));
            let endDate = new Date(dates).setDate(new Date(dates).getDate() - 1);
            $scope.VO.enddate = new Date(endDate).format("yyyy-MM-dd");

        });

        $scope.$watch('VO.consultperiod', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.VO.consultperiod != null && $scope.VO.pkCustomer != null) {
                if (!$scope.isGrid) {
                    $http.post($scope.basePath + "consult/consultWatch", {data: angular.toJson($scope.VO)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.VO.payment.length=[];
                            angular.assignData($scope.VO.payment, response.result.payment);
                            $scope.paymentGridOptions.data = $scope.VO.payment;
                        }

                    });
                }

            }
        });

    };

    $scope.initButton = function () {

        $scope.onUploads = function () {
            $scope.isSubDisabled = false;
            $scope.array = $rootScope.arrayToTree($rootScope.SELECT.PERFAPPRAISALTYPE);
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
                            if ($scope.VO.fileType) {
                                item.file_type = $scope.VO.fileType.name;
                            }
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });

                    } else {
                        // $scope[selectTabName].data = [];
                        // $scope[selectTabName].data.push(value);
                        angular.forEach(value, function (item) {
                            if ($scope.VO.fileType) {
                                item.file_type = $scope.VO.fileType.id;
                            }
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


        /* $scope.onLinkAuditFlow = function () {
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
            $scope.isClear = true;
            $scope.isGrid = false;
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
            $scope.VO.payment = $scope.paymentGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            if (data) {
                data.pkBilltype = 1;
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

        /*$scope.onCard = function () {
         var rows = $scope.gridApi.selection.getSelectedRows();
         if (!rows || rows.length != 1)
         return layer.alert("请选择一条数据进行查看!", {
         skin: 'layui-layer-lan',
         closeBtn: 1
         });
         $scope.findOne(rows[0].id,function(){
         $scope.isBack = true;
         $scope.isGrid = false;
         $scope.isCard = true;
         });

         };*/
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
                    $http.post($scope.basePath + "consult/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
       /*
       * 附件管理
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

        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            if ($scope.isClear) {
                $scope.VO = $scope.initVO();
            }
            $scope.paymentGridOptions.data = [];
            $scope.isDisabled = true;
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
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    //风险咨询
                    if ($scope.typeconsultNO == 3) {
                        if ("1034" != $rootScope.orgVO.pk) {
                            $scope.typeconsultNO = null;
                            return layer.alert("仅风险公司下的业务才能选择风险咨询!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if ($scope.paymentGridOptions.data.length > 0) {
                        var paymentArr = $scope.paymentGridOptions.data;
                        var sum = 0;
                        for (var i = 0; i < paymentArr.length; i++) {
                            if (parseFloat(paymentArr[i].scaleMoney) < 0 || parseFloat(paymentArr[i].scaleMoney) > 100) {
                                return layer.alert("子表收付款比例不能小于0或者大于100!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            //时间判断
                            if (paymentArr[i].planDate == null || paymentArr[i].planDate == "") {
                                return layer.alert("计划日期不能为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            sum = sum + parseFloat(paymentArr[i].scaleMoney);
                        }
                        if (sum != 100) {
                            return layer.alert("收付款子表收付款比例加和不等于100",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }

                    if ($scope.dealAttachmentBGridOptions.data.length ==0){
                        return layer.alert("请上传附件!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    $scope.VO.payment = $scope.paymentGridOptions.data;
                    $scope.VO.typeconsultNOName = $rootScope.returnSelectName($scope.VO.typeconsultNO, "CONSULTTYPE");
                    // 如果是暂存的数据时，需要修正单据状态
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


        /**
         * 咨询业务档案管理推送数据
         * */
        $scope.onPushDate =  function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行推送!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            if (rows[0].billstatus!=34){
                return layer.alert("请选择审核通过的数据！",
                    {skin: 'layui-layer-lan', closeBtn: 1});
            }
            layer.load(2);
            $http.post($scope.archivesPath + "consultArchives/pushConsultProject",{vbillno:rows[0].vbillno}).success(function(response) {
                if(response.code == 200){
                    layer.alert("推送成功");
                }else {
                    layer.alert("推送失败");
                }
                layer.closeAll('loading');
            });

        }

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
        $scope.param = {pkOrg: $rootScope.orgVO};
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
            exporterCsvFilename: '咨询费管理.csv',
            columnDefs: [
                {name: 'vbillno', displayName: '合同信息编号', width: 100,},
                {name: 'pkProject.c_proname', displayName: '业务/项目名称', width: 100,},
                {name: 'consultinfo', displayName: '合同号', width: 100,},
                {name: 'projectinfo', displayName: '立项号', width: 100,},
                {name: 'pkC0Tradetype.name', displayName: '客户产权关系', width: 100},
                {name: 'busi_type.name', displayName: '业务分类', width: 100,},
                {name: 'typeconsultNO', displayName: '咨询类别', width: 100, cellFilter: 'SELECT_CONSULTTYPE'},
                {name: 'pkCustomer.name', displayName: '客户名称', width: 100,},
                {name: 'customeraddr', displayName: '客户地址', width: 100,},
                {name: 'newdate', displayName: '合同起始日期', width: 100,},
                {name: 'enddate', displayName: '合同结束日期', width: 100,},
                {name: 'consultperiod', displayName: '应收合同费总期数', width: 100,},
                {
                    name: 'ctotal', displayName: '咨询费总额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'unpayconsulttotal', displayName: '未收咨询费总额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'operateDate', displayName: '制单日期', width: 100,},
                {name: 'operateTime', displayName: '制单时间', width: 100,},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '部门', width: 100,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
            ],
            data: [],
            exporterAllDataFn: function(){
                $scope.queryAllForGrid($scope.QUERY);
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

        $scope.selectTabName = 'paymentGridOptions';
        $scope.paymentGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'stages', displayName: '期数', width: 100, enableCellEdit: false


                },
                {
                    name: 'typeMoneyNO', displayName: '收付款类型', width: 100, cellFilter: 'SELECT_TYPEMONEY'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.TYPEMONEY, enableCellEdit: false
                },
                {
                    name: 'company.name', displayName: '收付款对象名称', width: 100
                    , enableCellEdit: false
                },
                {
                    name: 'typeCompanyNO', displayName: '收付款对象类型', width: 100, cellFilter: 'SELECT_CUSTOMERTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.CUSTOMERTYPE, enableCellEdit: false
                },
                {
                    name: 'scaleMoney', displayName: '收付款比例%', width: 100


                },
                {
                    name: 'planDate', displayName: '计划日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'planMoney',
                    displayName: '计划金额',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'factMoney',
                    displayName: '已收咨询费金额',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'noPaymentMoney',
                    displayName: '未收咨询费金额',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                // {
                //     name: 'factDate', displayName: '已收款日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'
                //
                //     , type: 'date', enableCellEdit: false
                // },
                // {
                //     name: 'vsettlebillno', displayName: '业务结算编号', width: 100, enableCellEdit: false
                //
                //
                // },
            ],
            data: $scope.VO.payment,
            onRegisterApi: function (gridApi) {
                if (gridApi.edit) {
                    $scope.paymentGridOptions.gridApi = gridApi;
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        var array = $scope.paymentGridOptions.data;
                        if (!$scope.VO.ctotal) {
                            $scope.VO.ctotal = 0;
                        }
                        if ('scaleMoney' == colDef.name) {
                            if (rowEntity.scaleMoney) {
                                var fant = 0;
                                for (var i = 0; i < array.length; i++) {
                                    if (i == array.length - 1) {
                                        array[i].scaleMoney = 100 - parseFloat(fant);
                                        array[i].planMoney = parseFloat($scope.VO.ctotal) * parseFloat(array[i].scaleMoney) / 100;
                                        array[i].noPaymentMoney = array[i].planMoney;
                                        // noPaymentSum = parseFloat(noPaymentSum) + parseFloat(array[i].noPaymentMoney)
                                    } else {
                                        if (array[i].scaleMoney) {
                                            fant = parseFloat(fant) + parseFloat(array[i].scaleMoney);
                                            array[i].planMoney = parseFloat($scope.VO.ctotal) * parseFloat(array[i].scaleMoney) / 100;
                                            array[i].noPaymentMoney = array[i].planMoney;
                                        }
                                    }
                                }
                                // $scope.VO.unpayconsulttotal = noPaymentSum;
                            }

                        }
                        $scope.$apply();
                    });
                }
            }
        };
        // $scope.assistantGridOptions = {
        // enableCellEditOnFocus: true,
        // enableRowSelection: true,
        // enableSelectAll: true,
        // multiSelect: true,
        // enableSorting: true,
        // enableRowHeaderSelection: true,
        // showColumnFooter: false,
        // columnDefs: [
        //             {name: 'PKcType.name', displayName: '附件类型', width: 100,url:'ACCESSORYTYPEREF'
        //                 ,placeholder:'请选择' ,editableCellTemplate:'ui-grid/refEditor' ,popupModelField:'PKcType'
        //                 
        //                 },
        //             {name: 'pkPubBlob.name', displayName: '附件路径', width: 100, enableCellEdit:false
        //                 /*url:'INSURANCEBLOBREFMODEL'
        //                 ,placeholder:'请选择' ,editableCellTemplate:'ui-grid/refEditor' ,popupModelField:'pkPubBlob'*/
        //                 
        //                 },
        //             {name: 'button1', displayName: '操作', width: 100
        //                  
        //                 
        //                 },
        //             {name: 'cUpman.name', displayName: '上载人', width: 100, enableCellEdit:false
        //                 /*,url:'userRef/queryForGrid'
        //                 ,placeholder:'请选择' ,editableCellTemplate:'ui-grid/refEditor' ,popupModelField:'cUpman'*/
        //                 
        //                 },
        //             {name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit:false,cellFilter:'date:"yyyy-MM-dd"'
        //                  
        //                 ,type:'date' 
        //                 },
        //             {name: 'cMemo', displayName: '备注', width: 100
        //                  
        //                 
        //                 },
        // ],
        // data: $scope.VO.assistant,
        // onRegisterApi: function (gridApi) {
        // $scope.assistantGridOptions.gridApi = gridApi;
        // }
        // };
        $scope.dealAttachmentBGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,
            columnDefs: [
                {name: 'file_type', displayName: '附件类型', width: 120, enableCellEdit: true},

                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},
                {
                    name: 'upload_operator.name', displayName: '上载人', width: 100, enableCellEdit: false
                },
                {
                    name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                },
                {
                    name: 'cMemo', displayName: '备注', width: 100
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
        //获取财务联查时url中的id
        function getQueryVariable(){
            var query = window.location.href;
            var vars = query.split("&");
            var pair = vars[0].split("=");
            if(pair.length>1){
                return pair[1];
            }
            return null;
        }
        if (null!=getQueryVariable()) {
            $scope.onCard(getQueryVariable());
        }
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
    };
    $scope.table_name = "lr_consult";
    $scope.billdef = "Consult";
    $scope.beanName ="insurance.ExamineServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();

    initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope,$rootScope);
    initonlineView($scope,$rootScope,$sce,$http,ngDialog);


});
app.controller('paymentGridOptionsCtrl', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('assistantGridOptionsCtrl', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
