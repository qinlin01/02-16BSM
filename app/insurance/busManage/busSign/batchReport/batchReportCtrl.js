/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('batchReportCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, $location, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                report: [],
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                billstatus: 31,
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                costscale: [],
                dr: $rootScope.SELECT.DRSTATUS[0].id,
                coomedium: [],
            };
        };
        $scope.entityVO = 'nc.vo.busi.BatchReportVO';
        //主表数据
        $scope.VO = $scope.initVO();
        //子表已选择数据主键
        $scope.childrenId = [];
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "operate_year": parseInt(new Date().format("yyyy")),
                "id": $stateParams.id
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode = '20102';
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "batchReport/queryForGrid", {
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
            $http.post($scope.basePath + "batchReport/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    // fun(response);
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
            $http.post($rootScope.basePath + "batchReport/save", {data: angular.toJson($scope.VO), funCode: $scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        $scope.isControl = true;
                        angular.assignData($scope.VO, response.result);
                        angular.copy(response.result.report, $scope.reportGridOptions.data);
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

    };

    $scope.initWatch = function () {


        $scope.$watch('VO.instancyType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['instancyTypeName'] = $rootScope.SELECT.INSTANCYTYPE[newVal - 1].name;
            }
        }, true);

        $scope.$watch('VO.report', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                var data = $rootScope.diffarray(newVal, oldVal);
                if (data && data.col == 'itemName') {
                    if ($scope.VO.enumBatchReportType != null && data.row.itemName) {
                        var arr = $scope.reportGridOptions.data;
                        for (var i = 0; i < arr.length; i++) {
                            if (arr[i].$$hashKey == data.row.$$hashKey) {
                                var date = new Date;
                                var year = date.getFullYear();
                                arr[i].reportTitle = "关于" + year + "年" + data.row.itemName + $rootScope.returnSelectName($scope.VO.enumBatchReportType, 'REPORTTYPE') + "签报";
                            }
                        }
                    }
                }
            }
        }, true);

        $scope.$watch('VO.enumBatchReportType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['enumBatchReportTypeName'] = $rootScope.SELECT.REPORTTYPE[newVal - 1].name;
                if ($scope.VO.enumBatchReportType == $rootScope.SELECT.REPORTTYPE[3].id) {
                    $scope.VO.pkDeliverUnit = {};
                    $scope.VO.pkDeliverUnit.pk = '1002AA10000000000365';
                    $scope.VO.pkDeliverUnit.code = '1009';
                    $scope.VO.pkDeliverUnit.name = '客服管理部';
                    $scope.isControl = true;

                } else if ($scope.VO.enumBatchReportType == $rootScope.SELECT.REPORTTYPE[5].id) {
                    $scope.isControl = true;
                    if (newVal == 6) {
                        layer.alert("自2022年2月起，保单延迟不需要提交“保单录入延时说明”，只需要在保单中上传“佐证材料”即可", {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                        $scope.VO.enumBatchReportType = "";
                        $scope.VO['enumBatchReportTypeName'] = "";
                    }
                } else {
                    $scope.VO.pkDeliverUnit = {};
                    $scope.isControl = false;
                }
                $scope.reportGridOptions.data.length = 0;
                var array = $scope.reportGridOptions.data;
                for (var i = 0; i < array.length; i++) {

                    if (array[i].itemName != null) {
                        var date = new Date;
                        var year = date.getFullYear();
                        array[i].reportTitle = "关于" + year + "年" + array[i].itemName + $rootScope.returnSelectName(newVal, 'REPORTTYPE') + "签报";
                    }
                }

            }
        }, true);
    };
    $scope.initButton = function () {
        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };
        $scope.onPrintSignCheckBill = function (gridApi, htmlPathCheckBill, type) {
            // $scope.raq = "reportSignCheckBill";
            // $scope.raq = "reportReport";
            $scope.raq = type;
            // var rows = $scope.gridApi.selection.getSelectedRows();
            var rows = $scope.reportGridOptions.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $http.post($rootScope.basePath + 'report/signCheckBill', {
                data: angular.toJson(rows[0]),
                raq: $scope.raq,
                type: "PDF"
            }, {responseType: 'arraybuffer'}).success(function (response) {
                var files = new Blob([response], {type: "application/pdf", filename: response.name});
                var fileURL = URL.createObjectURL(files);
                $scope.content = $sce.trustAsResourceUrl(fileURL);
                $scope.type = "application/pdf";
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: 'pdfView.html',
                    className: 'ngdialog-theme-formInfo',
                    controller: 'pdfViewCtrl',
                    scope: $scope,
                    preCloseCallback: function (value) {
                        if (value && value == "clear") {
                            //重置
                            return false;
                        }
                        //取消
                        return true;
                    }
                })
            });
        }
        // $scope.onPrintReportBill = function () {
        //     ngDialog.openConfirm({
        //         showClose: true,
        //         closeByDocument: true,
        //         template: 'view/report/printReportBill.html',
        //         className: 'ngdialog-theme-formInfo',
        //         scope: $scope,
        //         controller: function ($scope, $timeout) {
        //             $scope.rows = $scope.gridApi.selection.getSelectedRows();
        //             $scope.print = function () {
        //                 var winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
        //                 var linkTag = winPrint.document.createElement('link');
        //                 linkTag.setAttribute('rel', 'stylesheet');
        //                 linkTag.setAttribute('media', 'all');
        //                 linkTag.setAttribute('type', 'text/css');
        //                 var winPrintHead = winPrint.document.getElementsByTagName('head')[0];
        //                 linkTag.href = $rootScope.basePath + 'css/public.css';
        //                 winPrintHead.appendChild(linkTag);
        //                 winPrint.document.body.innerHTML = document.getElementById('printMonReport').innerHTML;
        //                 winPrint.focus();
        //                 $timeout(function () {
        //                     winPrint.window.print();
        //                     winPrint.close;
        //                 }, 300);
        //             }
        //
        //         },
        //         preCloseCallback: function (value) {
        //             if (value && value == "clear") {
        //                 //重置
        //                 return false;
        //             }
        //             //取消
        //             return true;
        //         }
        //     }).then(function (value) {
        //     }, function (reason) {
        //     });
        // }
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
            $scope.isClear = true;
            $scope.form = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isUploadAnytime = false;
            $scope.isBack = true;
            $scope.initView();
            $scope.reportGridOptions.data = [];
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
        };
        /**
         * 修改
         */
        $scope.onEdit = function () {

            $scope.isUploadAnytime = false;
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
            $scope.VO.report = $scope.reportGridOptions.data;
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
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
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
                    //layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
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
                    $http.post($scope.basePath + "batchReport/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
            $scope.isDisabled = true;
            $scope.isEdit = false;
            $scope.isBack = false;
        };
        /**
         * 返回
         */
        $scope.onBack = function () {
            if ($stateParams.id) {
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
                    if ($scope.reportGridOptions.data.length == 0) {
                        return layer.alert("请填写子表信息!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    $scope.VO.instancyTypeName = $rootScope.returnSelectName($scope.VO.instancyType, "INSTANCYTYPE");
                    $scope.VO.enumBatchReportTypeName = $rootScope.returnSelectName($scope.VO.enumBatchReportType, "REPORTTYPE");

                    var rgodatas = $scope.reportGridOptions.data;
                    for (var i = 0; i < rgodatas.length; i++) {
                        if (!rgodatas[i].itemName) {
                            return layer.alert("子表属性事项名称（必填）不可为空！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if (!rgodatas[i].reportContent) {
                            return layer.alert("子表属性签报内容（必填）不可为空！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    $scope.VO.report = $scope.reportGridOptions.data;
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
            if (!$scope.VO.instancyType) {
                return angular.alert('请填写缓急程度！', {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                })
            }
            if (!$scope.VO.enumBatchReportType) {
                return angular.alert('请填写签报类型！', {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                })
            }
            if (!$scope.VO.pkDeliverUnit.name) {
                return angular.alert('请填写主送单位！', {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                })
            }
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: "view/batchReport/reportForm.html",
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
                    if (value instanceof Array) {
                        for (var i = 0; i < value.length; i++) {
                            var row = {};
                            if (value[i].c0Code) {
                                row.pkInsureman = {};
                                row.pkInsureman.code = value[i].c0Code;
                                row.pkInsureman.name = value[i].c0Name;
                                row.pkInsureman.pk = value[i].pk;
                            }
                            if (value[i].cinsureman) {
                                row.pkInsureman = {};
                                row.pkInsureman.code = value[i].cinsureman.code;
                                row.pkInsureman.name = value[i].cinsureman.name;
                                row.pkInsureman.pk = value[i].cinsureman.pk;
                            }
                            if (value[i].cproname) {
                                row.pkProject = {};
                                row.pkProject.code = value[i].cprocode;
                                row.pkProject.name = value[i].cproname;
                                row.pkProject.pk = value[i].pk;
                            }
                            row.billstatus = 34;
                            row.childId = value[i].id;
                            $scope.childrenId.push(value[i].id);
                            $scope[$scope.selectTabName].data.push(row);
                        }
                    } else {
                        $scope[$scope.selectTabName].data.push(value);
                    }
                }
            }, function (reason) {

            });
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

        $scope.onSubCancel = function () {
            ngDialog.close();
        }

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
            for (var i = 0; i < $scope.childrenId.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope.childrenId.indexOf(delRow[j].childId) != -1) {
                        $scope.childrenId.splice(i, 1);
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
        $scope.isControl = false;
        $scope.queryShow = true;
        $scope.isUploadAnytime = false;

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
            exporterCsvFilename: '批量业务签报管理.csv',
            columnDefs: [
                {name: 'batch_report_code', displayName: '批量业务签报编码', width: 200,},
                {name: 'enum_batch_report_type', displayName: '签报类型', width: 160, cellFilter: 'SELECT_REPORTTYPE'},
                {name: 'pkDeliverUnit_name', displayName: '主送单位', width: 200,},
                {name: 'instancy_type', displayName: '缓急程度', width: 100, cellFilter: 'SELECT_INSTANCYTYPE'},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator_name', displayName: '制单人', width: 100,},
                {name: 'operate_date', displayName: '制单日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'operate_time', displayName: '制单时间', width: 100,},
                {name: 'pkOrg_name', displayName: '业务单位（机构）', width: 100,},
                {name: 'pkDept_name', displayName: '业务部门', width: 100,},
            ],
            data: []
        };
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on
            // scope
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

        $scope.selectTabName = 'reportGridOptions';
        $scope.reportGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'reportCode', displayName: '签报编码', width: 100, enableCellEdit: false


                },
                {
                    name: 'approvalNumber', displayName: '批复单编号', width: 100, enableCellEdit: false


                },
                {
                    name: 'pkProject.name',
                    displayName: '立项名称',
                    width: 100,
                    url: 'projectRef/queryForGrid'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'pkProject',
                    enableCellEdit: false

                },
                {
                    name: 'pkInsureman.name',
                    displayName: '客户名称',
                    width: 100,
                    url: 'customerInsrcRef/queryForGridByReport'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'pkInsureman'

                },
                {
                    name: 'pkInsureman.code', displayName: '客户编号', width: 100, enableCellEdit: false


                },
                {
                    name: 'itemName', displayName: '事项名称（必填）', width: 100, enableCellEdit: true


                },
                {
                    name: 'reportTitle', displayName: '主题', width: 100

                },
                {
                    name: 'reportContent', displayName: '签报内容（必填）', width: 100, enableCellEdit: true
                },
            ],
            data: $scope.VO.report,
            onRegisterApi: function (gridApi) {
                $scope.reportGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if ('itemName' == colDef.name) {
                            if (rowEntity.itemName) {
                                var date = new Date;
                                var year = date.getFullYear();
                                rowEntity.reportTitle = "关于" + year + "年" + rowEntity.itemName + $rootScope.returnSelectName($scope.VO.enumBatchReportType, 'REPORTTYPE') + "签报";
                                //arr[i].reportTitle
                            }

                        }
                    });
                }
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
        }
        /*else{
         $scope.queryForGrid({});
         }*/
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
        $scope.selectTabName = name.toString();
        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {

            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }
    };
    $scope.table_name = "lr_batch_report";
    $scope.billdef = "BatchReport";
    $scope.beanName = "insurance.BatchReportServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initPreviewFile($scope, $rootScope);

    initworkflow($scope, $http, ngDialog);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);


});
app.controller('reportGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
    /**
     * 初始化页面变更方法
     */
    $scope.initQUERYChildren = function () {
        return {
            'id^notin': $scope.childrenId
        }
    };
    $scope.QUERYCHILDREN = $scope.initQUERYChildren();
    $scope.initData = function () {
        $scope.VO.reportChildren = [];
        if (6 == $scope.VO.enumBatchReportType) {
            $scope.childQuery = true;
            $scope.reportChildrenGridOptions = {
                enableRowSelection: true,
                enableSelectAll: true,
                enableFullRowSelection: true,//是否点击cell后 row selected
                enableRowHeaderSelection: true,
                multiSelect: true,//多选
                paginationPageSizes: [100, 500, 1000],
                paginationPageSize: 100,
                useExternalPagination: true,
                columnDefs: [
                    {name: 'cprocode', displayName: '立项编号', width: 100,},
                    {name: 'cproname', displayName: '立项名称', width: 100,},
                    {name: 'cinsureman.name', displayName: '客户名称', width: 100,},
                    {name: 'cinsureman.code', displayName: '客户编号', width: 100,},
                    {name: 'customerType', displayName: '立项对象类型', width: 100, cellFilter: 'SELECT_PROJECTCUSTOMERTYPE'},
                    {name: 'c2Type', displayName: '业务类型', width: 100, cellFilter: 'SELECT_MARKETTYPE'},
                    {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                    {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                    {name: 'pkDept.name', displayName: '业务部门', width: 100,},
                ],
                data: $scope.VO.reportChildren
            };
        } else {
            $scope.childQuery = false;
            $scope.reportChildrenGridOptions = {
                enableRowSelection: true,
                enableSelectAll: true,
                enableFullRowSelection: true,//是否点击cell后 row selected
                enableRowHeaderSelection: true,
                multiSelect: true,//多选
                paginationPageSizes: [100, 500, 1000],
                paginationPageSize: 100,
                useExternalPagination: true,
                columnDefs: [
                    {name: 'c0Code', displayName: '客户编号', width: 100,},
                    {name: 'c0Name', displayName: '客户名称', width: 100,},
                    {name: 'c1Institution', displayName: '组织机构代码', width: 100,},
                    {name: 'upCustomer.name', displayName: '集团名称', width: 100,},
                    {name: 'enumEntkind.name', displayName: '单位性质', width: 100,},
                    {name: 'tradetype.name', displayName: '行业类别', width: 100,},
                    {name: 'c1Province.name', displayName: '所在区域', width: 100,},
                    {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                    {name: 'pkDept.name', displayName: '业务部门', width: 100,},
                ],
                data: $scope.VO.reportChildren,
            };
        }
        $scope.reportChildrenGridOptions.onRegisterApi = function (gridApi) {
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
                $scope.queryForGridChildren($scope.QUERYCHILDREN);
            });
        };
    };

    $scope.queryForGridChildren = function (data) {
        $scope.urlChildren = "";
        if (6 == $scope.VO.enumBatchReportType) {
            if (!$scope.QUERYCHILDREN['pkC0Tradetype']) {
                return layer.alert("请填写客户产权关系！", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            if (angular.isUndefined($scope.QUERYCHILDREN['c_2_Type'])) {
                return layer.alert("请填写业务类型！", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            if (angular.isUndefined($scope.QUERYCHILDREN['customer_type'])) {
                return layer.alert("请填写立项对象类型！", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            data['c1Type'] = 1;
            data['busiTypeNotNull'] = "Y";
            data['cinsureman'] = data['cinsureman_name'];
            $scope.urlChildren = "projectRef/queryForGridDialog";
        } else {
            $scope.urlChildren = "stateGridCustomer/queryForGridChild";
        }
        if (!$scope.queryData) {
            $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.reportChildrenGridOptions.columnDefs;
        }
        layer.load(2);
        $http.post($scope.basePath + $scope.urlChildren, {
            data: angular.toJson(data),
            page: $scope.gridApi ? $scope.gridApi.page ? $scope.gridApi.page : 1 : 1,
            pageSize: $scope.gridApi ? $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100 : 100,
            fields: angular.toJson($scope.queryData)
        }).success(function (response) {
            if (response.code == 200) {
                if (!$scope.query) {
                    $scope.query = $scope.reportChildrenGridOptions.columnDefs;
                }
                $scope.reportChildrenGridOptions.data = angular.fromJson(response.result.Rows);
                $scope.reportChildrenGridOptions.totalItems = response.result.Total;
            }
            layer.closeAll('loading');
        });
    };
    $scope.onQueryChildren = function () {
        $scope.queryForGridChildren($scope.QUERYCHILDREN);
    };
    $scope.onResetChildren = function () {
        $scope.QUERYCHILDREN = $scope.initQUERYChildren();
    };
    $scope.initFunction = function () {
        /**
         * 保存
         */
        $scope.onSave = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});
            $scope.$parent.confirm(rows);
            ngDialog.close();
        };

        $scope.onCancel = function () {
            ngDialog.close();
        };

    };
    $scope.initData();
    $scope.initFunction();
});
