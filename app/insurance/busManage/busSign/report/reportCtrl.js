/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('reportCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, $location, uiGridConstants, ngDialog, ngVerify) {

    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                pkOperator: $rootScope.userVO,
                dealAttachmentB: [],
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                billstatus: 31,
                instancyType: getSelectOptionData.INSTANCYTYPE[2].id,
                dr: 0,
                costscale: [],
                reportContent: "",
                coomedium: []
            };
        };
        $scope.entityVO = 'nc.vo.busi.ReportVO';

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
        // $scope.param = {type:'reportType',c_0_type1:3}
        $scope.funCode = '20101';

    };
    $scope.initHttp = function () {

        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */

        $scope.queryAllForGrid = function (data) {
            layer.load(2);
            $http.post($scope.basePath + "report/queryAllForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response.code == 200) {
                    if ($scope.QUERY.id) {
                        $scope.QUERY.id = null;
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

            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "report/queryForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData),
                funCode: $scope.funCode,
            }).success(function (response) {
                if (response.code == 200) {
                    if ($scope.QUERY.id) {
                        $scope.QUERY.id = null;
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
            $http.post($scope.basePath + "report/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    if (callback) {
                        callback();
                    }
                    ;
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
            $http.post($rootScope.basePath + "report/save", {data: angular.toJson($scope.VO), funCode: $scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        layer.closeAll('loading');
                        $scope.isEdit = false;
                        $scope.onCard($scope.VO.id)
                    }
                    if (response && response.code) {
                        //保存成功后回写数据
                        $scope.VO = response.result;
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
            $http.post($rootScope.basePath + "report/submit", {data: angular.toJson($scope.VO)})
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
                    //layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
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
    };

    $scope.initWatch = function () {
        //限制文本字数 超过2000字符长度改变颜色
        $scope.$watch('VO.reportContent', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if (2000 >= $scope.VO.reportContent.length) {
                    $("#info_limit").css({"color": "#666666"});
                    $("#praiseName").css({"color": "black"});
                } else {
                    $("#info_limit").css({"color": "red"});
                    $("#praiseName").css({"color": "red"});
                }
            }
        }, true);

        $scope.$watch('VO.enumReportType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['enumReportTypeName'] = $rootScope.SELECT.REPORTTYPE[newVal - 1].name;
                if (newVal != 6) {
                    $scope.VO.pkProject = "";
                }
                if (newVal == 6) {
                    layer.alert("自2022年2月起，保单延迟不需要提交“保单录入延时说明”，只需要在保单中上传“佐证材料”即可", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                    $scope.VO.enumReportType = "";
                    $scope.VO['enumReportTypeName'] = "";
                }
            }
        }, true);

        $scope.$watch('VO.instancyType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['instancyTypeName'] = $rootScope.SELECT.INSTANCYTYPE[newVal - 1].name;
            }
        }, true);

        $scope.$watch('VO.itemName', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.enumReportType != null) {
                    var date = new Date;
                    var year = date.getFullYear();
                    $scope.VO.reportTitle = "关于" + year + "年" + newVal + $rootScope.returnSelectName($scope.VO.enumReportType, 'REPORTTYPE') + "签报";
                }
            }
        }, true);
        $scope.$watch('VO.enumReportType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                /*     if($scope.VO.enumReportType == $rootScope.SELECT.REPORTTYPE[3].id || $scope.VO.enumReportType == $rootScope.SELECT.REPORTTYPE[5].id){
                         $scope.VO.pkDeliverUnit ={};
                         $scope.VO.pkDeliverUnit.pk = '1002AA10000000000365';
                         $scope.VO.pkDeliverUnit.code = '1009';
                         $scope.VO.pkDeliverUnit.name = '客服管理部';


                     }else{
                         $scope.VO.pkDeliverUnit ={};
                     }*/
                if ($scope.VO.enumReportType == $rootScope.SELECT.REPORTTYPE[3].id) {
                    $scope.isDisOrg = true;
                    $scope.VO.pkDeliverUnit = {};
                    $scope.VO.pkDeliverUnit.pk = '1002AA10000000000365';
                    $scope.VO.pkDeliverUnit.code = '1009';
                    $scope.VO.pkDeliverUnit.name = '客服管理部';

                } else if ($scope.VO.enumReportType == $rootScope.SELECT.REPORTTYPE[5].id) {
                    $scope.VO.pkDeliverUnit = {};
                    $scope.VO.pkDeliverUnit.pk = '1002A110000000015WUN';
                    $scope.VO.pkDeliverUnit.code = '1008';
                    $scope.VO.pkDeliverUnit.name = '合规部';
                } else {
                    $scope.VO.pkDeliverUnit = {};
                    $scope.isDisOrg = false;
                }


                if ($scope.VO.itemName != null) {
                    var date = new Date;
                    var year = date.getFullYear();
                    $scope.VO.reportTitle = "关于" + year + "年" + $scope.VO.itemName + $rootScope.returnSelectName(newVal, 'REPORTTYPE') + "签报";
                }
            }
        }, true);
        $scope.$watch('VO.pkProject.name', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.pkProject.pk) {
                    $http.post($scope.basePath + "propertyProject/findOne", {pk: $scope.VO.pkProject.pk}).success(function (response) {
                        if (response && response.code == "200") {
                            if (response.result) {
                                $scope.VO.pkInsureman = {};
                                $scope.VO.pkInsureman.pk = response.result.cinsureman.pk;
                                $scope.VO.pkInsureman.name = $scope.VO.pkProject.cinsureman_name;
                                $scope.VO.pkInsureman.code = $scope.VO.pkProject.cinsureman_code;
                            }
                        }
                    });
                } else {
                    $scope.VO.pkInsureman = {};
                }
            }
        }, true);
    };

    $scope.initButton = function () {


        /**
         * 查看批复单
         */
        $scope.onPrintSignCheckBill = function (gridApi, htmlPathCheckBill, type) {
            // $scope.raq = "reportSignCheckBill";
            // $scope.raq = "reportReport";
            $scope.raq = type;
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $http.post($rootScope.basePath + 'report/signCheckBill', {
                data: angular.toJson($scope.VO),
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


        $scope.onUploads = function () {
            $scope.isSubDisabled = false;
            $scope.aVO = {};
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
            if (!$scope.VO.exec) {
                return layer.alert('执行结果不能为空！', {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            } else {
                $scope.VO.execResult = $scope.VO.exec;
                $http.post($rootScope.basePath + "report/save", {
                    data: angular.toJson($scope.VO),
                    funCode: $scope.funCode
                })
                    .success(function (response) {
                        if (!response.flag) {
                            $scope.onCard($scope.VO.id);
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
         * 查看签报单
         */
        $scope.onPrintReportBill = function () {
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/report/printReportBill.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                controller: function ($scope, $timeout) {
                    $scope.rows = $scope.gridApi.selection.getSelectedRows();
                    $scope.print = function () {
                        var winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
                        var linkTag = winPrint.document.createElement('link');
                        linkTag.setAttribute('rel', 'stylesheet');
                        linkTag.setAttribute('media', 'all');
                        linkTag.setAttribute('type', 'text/css');
                        var winPrintHead = winPrint.document.getElementsByTagName('head')[0];
                        linkTag.href = $rootScope.basePath + 'css/public.css';
                        winPrintHead.appendChild(linkTag);
                        winPrint.document.body.innerHTML = document.getElementById('printMonReport').innerHTML;
                        winPrint.focus();
                        $timeout(function () {
                            winPrint.window.print();
                            winPrint.close;
                        }, 300);
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
        $scope.onPrintCheckBill = function () {
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/report/printCheckBill.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                controller: function ($scope, $timeout) {
                    $scope.rows = $scope.gridApi.selection.getSelectedRows();
                    $scope.print = function () {
                        var winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
                        var linkTag = winPrint.document.createElement('link');
                        linkTag.setAttribute('rel', 'stylesheet');
                        linkTag.setAttribute('media', 'all');
                        linkTag.setAttribute('type', 'text/css');
                        var winPrintHead = winPrint.document.getElementsByTagName('head')[0];
                        linkTag.href = $rootScope.basePath + 'css/public.css';
                        winPrintHead.appendChild(linkTag);
                        winPrint.document.body.innerHTML = document.getElementById('printMonReport').innerHTML;
                        winPrint.focus();
                        $timeout(function () {
                            winPrint.window.print();
                            winPrint.close;
                        }, 300);
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
                    if ($scope.VO.execResult && $scope.VO.billstatus == $rootScope.SELECT.BILLSTATUS[33].id) {
                        $scope.isExecute = false;
                    }
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
            $scope.submit();
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
                if (rows[0].billstatus != 33 && rows[0].billstatus != 36 && rows[0].billstatus != 32) return layer.alert("只有审批中或驳回状态可以审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 33 && rows[0].billstatus != 36 && rows[0].billstatus != 32) return layer.alert("只有审批中或驳回状态可以审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            ;


        };

        $scope.onAdd = function () {
            $scope.VO.reportContent.length = "0";
            $scope.form = true;
            $scope.isClear = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.isUploadAnytime = false;
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
                $scope.form = true;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1)
                    return layer.alert("请选择一条数据进行修改!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                $scope.findOne(rows[0].id, function () {
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.isGrid = false;
                });
            } else if ($scope.isCard) {
                $scope.findOne($scope.VO.id, function () {
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.isCard = false;
                    $scope.form = true;
                });
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
                    $http.post($scope.basePath + "report/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
         * 限制输入框内容 控制字数
         */


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

        };
        /**
         * 暂存
         */
        $scope.onTemporary = function (data) {

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
         * 取消功能
         */
        $scope.onCancel = function () {
            if ($scope.isEdit && $scope.VO.id != null) {
                $scope.onCard($scope.VO.id);
            } else {
                $scope.isGrid = true;
                $scope.isEdit = false;
                $scope.isCard = false;
            }
        };
        /**
         * 返回
         */
        $scope.onBack = function () {
            if ($stateParams.id) {
                window.history.back(-2);
                return;
            }
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isCard = false;
            $scope.isDisabled = true;
            //阻止页面渲染
            $scope.form = false;
            $scope.card = false;
            $scope.queryForGrid($scope.QUERY);
        };


        /*        /!**
                 * 卡片
                 *!/
                $scope.onCard = function () {
                    var rows = $scope.gridApi.selection.getSelectedRows();
                    if (!rows || rows.length != 1)
                        return layer.alert("请选择一条数据进行查看!", {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                    $scope.findOne(rows[0].id,function(){
                        $scope.card=true;
                        $scope.isBack = true;
                        $scope.isGrid = false;
                        $scope.isCard = true;
                    });

                };*/

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
                    if ($scope.VO.enumReportType == 6) {//保单录入延时说明
                        if (!$scope.VO.pkProject) {
                            return layer.alert("当签报类型为保单延迟说明时，立项名称不能为空！!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    //点击填写执行结果时 isRes变为true  暂时没有做此按钮的功能
                    if ($scope.isRes) {
                        if (!$scope.VO.execResult) {
                            return layer.alert("执行结果不能为空！");
                        } else {
                            if ($scope.VO.execResult.toString().length > 200) {
                                return layer.alert("执行结果录入不能多于200个字符！");
                            }
                        }
                    }
                    if (!$scope.VO.reportContent && $scope.VO.reportContent != '') {
                        return layer.alert("签报内容不能为空！");
                    } else if ($scope.VO.reportContent.length > 2000) {
                        return layer.alert("签报内容不能超过2000个字符！");
                    }
                    $scope.VO.instancyTypeName = $rootScope.returnSelectName($scope.VO.instancyType, "INSTANCYTYPE");
                    $scope.VO.enumReportTypeName = $rootScope.returnSelectName($scope.VO.enumReportType, "REPORTTYPE");
                    $scope.VO.billstatusName = $rootScope.returnSelectName($scope.VO.billstatus, "BILLSTATUS");

                    if ($scope.VO.billstatus == 37) {
                        $scope.VO.pkOperator = $rootScope.userVO;
                        $scope.VO.pkOrg = $rootScope.orgVO;
                        $scope.VO.pkDept = $rootScope.deptVO;
                        $scope.VO.billstatus = 31;
                        $scope.VO.operateDate = new Date().format("yyyy-MM-dd");
                        $scope.VO.operateTime = new Date().format("yyyy-MM-dd HH:mm:ss");
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
        $scope.isDisOrg = false;
        $scope.isClear = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;
        $scope.isUploadAnytime = false;
        $scope.htmlPathReportBill = 'view/report/printReportBill.html';
        $scope.htmlPathCheckBill = 'view/report/printCheckBill.html';
        $scope.isRes = false;
        $scope.isExecuteEdit = true;
        $scope.isExecute = true;
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

        $scope.gridOptions = {
            rowTemplate: "<div ng-dblclick=\"grid.appScope.onRowDblClick(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>",
            data: [],
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            enableColumnMoving: true,
            enableGridMenu: true,
            exporterMenuCsv: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '业务签报.csv',
            columnDefs: [
                {name: 'reportCode', displayName: '签报编码', width: 180,},
                {name: 'reportTitle', displayName: '主题', width: 300,},
                {name: 'itemName', displayName: '事项名称', width: 260,},
                {name: 'enumReportType', displayName: '签报类型', width: 100, cellFilter: 'SELECT_REPORTTYPE'},
                {name: 'approvalNumber', displayName: '批复单编号', width: 100,},
                {name: 'pkProject.name', displayName: '立项名称', width: 100,},
                {name: 'pkInsureman.name', displayName: '客户名称', width: 260,},
                {name: 'pkInsureman.code', displayName: '客户编号', width: 100,},
                {name: 'pkDeliverUnit.name', displayName: '主送单位', width: 200,},
                {name: 'instancyType', displayName: '缓急程度', width: 100, cellFilter: 'SELECT_INSTANCYTYPE'},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '发起人', width: 100,},
                {name: 'operateDate', displayName: '制单日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'operateTime', displayName: '制单时间', width: 100,},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '业务部门', width: 100,},
            ],
            exporterAllDataFn: function () {
                return $scope.queryAllForGrid($scope.QUERY).then(function () {
                    $scope.gridOptions.useExternalPagination = true;
                });
            },
            onRegisterApi: function (gridApi) {
                //set gridApi on scope
                $scope.gridApi = gridApi;
                //添加行头
                $scope.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                //设置默认值
                $scope.gridApi.page = $scope.gridOptions.paginationCurrentPage;
                $scope.gridApi.pageSize = $scope.gridOptions.paginationPageSize;

                //分页按钮事件
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    $scope.gridOptions.useExternalPagination = true;
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

                // {name: 'pkPubBlob.name', displayName: '附件内容', width: 100,enableCellEdit:false
                //     /*url:'INSURANCEBLOBREFMODEL'
                //     ,placeholder:'请选择' ,editableCellTemplate:'ui-grid/refEditor' ,popupModelField:'pkPubBlob'*/
                //
                //     },
                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},

                // {name: 'cUpman.name', displayName: '上载人', width: 100,enableCellEdit:false
                //    /* ,url:'userRef/queryForGrid'
                //     ,placeholder:'请选择' ,editableCellTemplate:'ui-grid/refEditor' ,popupModelField:'cUpman'*/
                //
                //     },
                {
                    name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                },
                {
                    name: 'pk_project_id',
                    displayName: ' ',
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ng-click="grid.appScope.onPreviewFile(row.entity.pk_project_id,row.entity.attachment_name)" class="btn btn-transparent btn-xs tooltips" tooltip-placement="top">在线预览&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i></a></div>'
                }
                // {name: 'cMemo', displayName: '备注', width: 100
                //     },
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
        }/*else{
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
    $scope.table_name = "lr_report";
    $scope.billdef = "Report";
    $scope.beanName = "insurance.report5ServiceImpl";
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