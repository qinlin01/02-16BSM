app.controller('consultCompleteCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                dr: 0,
                billstatus: 31,
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.entityVO = 'nc.vo.busi.ProjectVO';
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
            return $http.post($rootScope.basePath + "consultComplete/queryAllForGrid", {
                params: angular.toJson(data),
                //page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                //pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response && response.code == 200) {
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            }).error(function () {
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
            $http.post($scope.basePath + "consultComplete/queryForGrid", {
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
            $http.post($scope.basePath + "consultComplete/findOne", {pk: pk}).success(function (response) {
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
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
                }
            });
        };


        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $http.post($rootScope.basePath + "consultComplete/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.onCard($scope.VO.id)
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


        /*
         * 提交
         * */
        $scope.submit = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "consultComplete/submit", {data: angular.toJson($scope.VO)})
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
                    //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
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


        $scope.changeButonStatus = function () {
            if ($scope.VO.pkConsultProject == null) {
                $scope.saveBtnName = "保存";
                $scope.launchEdit = false;
                $scope.VO.savetype = 0;
                return;
            }
            // 为了兼容后续总部修改项目立项信息做了34的判断
            if ($scope.VO.billstatus != 34) {
                // 如果是自行开展，只上传附件，立项审批后的附件由总部上传
                if ($scope.VO.pkConsultProject.pkOrg == '1002') {
                    $scope.launchEdit = true;
                    $scope.VO.replyName = $scope.VO.pkConsultProject.name;
                    $scope.VO.projectDate = new Date().format("yyyy-MM-dd");
                    $scope.VO.replyAmount = $scope.VO.pkConsultProject.amount;
                    $scope.VO.savetype = 1;
                    $scope.saveBtnName = "保存生效";
                    $scope.launchEdit = true;
                } else {
                    $scope.launchEdit = false;
                    $scope.saveBtnName = "保存";
                    $scope.launchEdit = false;
                    $scope.VO.savetype = 0;
                }
            } else {
                $scope.VO.savetype = 1;
                $scope.saveBtnName = "保存";
                $scope.launchEdit = true;
            }
        };
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function (item) {
            if (item && item.id) {
                $scope.onCard(item.id);
            }
        };

        $scope.initDealAttachment = function () {
            if (!$scope.isEdit || $scope.VO.pkConsultProject == null) {
                return;
            }
            var initdealGriddatas = [];
            if ($scope.VO.billstatus == 31) {
                if ($scope.VO.pkConsultProject.amount <= 20) {
                    if ($scope.VO.pkConsultProject.pkOrg == '1002') {
                        initdealGriddatas = [{file_type: 40,}, {file_type: 41,}, {file_type: 42,}, {file_type: 43,}, {file_type: 44,},];
                    } else {
                        initdealGriddatas = [{file_type: 40,}, {file_type: 41,}, {file_type: 42,},];
                    }
                } else if ($scope.VO.pkConsultProject.amount >= 20 && $scope.VO.pkConsultProject.amount < 100) {
                    if ($scope.VO.pkConsultProject.pkOrg == '1002') {
                        initdealGriddatas = [{file_type: 40,}, {file_type: 41,}, {file_type: 42,}, {file_type: 43,}, {file_type: 44,},];
                    } else {
                        initdealGriddatas = [{file_type: 40,}, {file_type: 41,}, {file_type: 42,},];
                    }
                } else if ($scope.VO.pkConsultProject.amount >= 100) {
                    if ($scope.VO.pkConsultProject.pkOrg == '1002') {
                        initdealGriddatas = [{file_type: 41,}, {file_type: 42,}, {file_type: 43,}, {file_type: 44,},];
                    } else {
                        initdealGriddatas = [{file_type: 40,}, {file_type: 41,}, {file_type: 42,},];
                    }
                }
            } else if ($scope.VO.billstatus == 34) {
                if ($scope.VO.pkConsultProject.pkOrg == '1002') {

                } else {
                    initdealGriddatas = [{file_type: 43,}, {file_type: 44,}];
                }
            }

            return initdealGriddatas;
        };

        $scope.validateDealAttachment = function () {
            var initdealGriddatas = $scope.initDealAttachment();
            var array = $scope.dealAttachmentBGridOptions.data;
            // 如果没有要求附件就不校验
            if (initdealGriddatas == null && (array == null || array.length == 0)) {
                return;
            }
            var emptyfiles = [];

            for (var i = 0; i < array.length; i++) {
                if (array[i].cUpdate == null) {
                    emptyfiles.push(array[i].file_type);
                }
            }
            var errorArry = [];
            for (var j = 0; j < initdealGriddatas.length; j++) {
                for (var k = 0; k < emptyfiles.length; k++) {
                    if (initdealGriddatas[j].file_type == emptyfiles[k]) {
                        errorArry.push(initdealGriddatas[j].file_type);
                    }
                }
            }

            var errmessge = "";
            for (var j = 0; j < errorArry.length; j++) {
                for (var k = 0; k < $rootScope.SELECT.CONTSULT_ATTACHMENT.length; k++) {
                    if ($rootScope.SELECT.CONTSULT_ATTACHMENT[k].id == errorArry[j]) {
                        errmessge = errmessge + "请上传" + $rootScope.SELECT.CONTSULT_ATTACHMENT[k].name + "附件。" + "<br/>";
                        break;
                    }
                }
            }
            return errmessge;
        };
    };


    $scope.initWatch = function () {

        $scope.$watch('VO.pkConsultProject.name', function (newVal, oldVal) {
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                if (!$scope.isEdit) {
                    return;
                }
                $http.post($scope.basePath + "consultResult/findOne", {pk: $scope.VO.pkConsultProject.pk}).success(function (response) {
                    if (response && response.code == "200") {
                        if (response.result.projectStatus == 4 || response.result.projectStatus == 3) {
                            $scope.isRunningFlag = true;
                            $scope.VO.payments = response.result.payments;
                            $scope.VO.contractNo = response.result.contractNo;
                            $scope.VO.contractName = response.result.contractName;
                            $scope.VO.contractAmount = parseFloat(response.result.contractAmount).toFixed(2);
                            $scope.VO.collaborator = response.result.collaborator;
                            $scope.VO.approvalName = response.result.approvalName;
                            $scope.changeButonStatus();
                            $scope.initView();
                        }
                    }
                });
            }, true
        );
    };

    $scope.initButton = function () {

        $scope.onChangeProjectInfo = function () {
            //  控制字表按钮的显示
            $scope.isClear = false;
            $scope.isCard = false;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form = true;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id, function () {
                    $scope.isEdit = true;
                    $scope.isBack = true;
                    $scope.isCard = false;

                    $scope.isChangeProjectInfo = false;
                    $scope.initView();
                });

            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isChangeProjectInfo = false;
                $scope.initView();
            }
            $scope.changeButonStatus();
        }

        $scope.onPrintReportBill = function () {
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/consultComplete/printExecutableReport.html',
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
        $scope.onPrintSignCheckBill = function () {

            $scope.raq = "signCheckBill";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $http.post($scope.basePath + "consultComplete/signCheckBill", {
                data: angular.toJson($scope.VO),
                raq: $scope.raq,
                type: "PDF"
            }).success(function (response) {
                layer.closeAll('loading');
                if (response.code == 200) {
                    layer.closeAll('loading');
                    // if(fun) fun(response);
                    if (response.code == 200) {
                        window.open(getURL(response.queryPath));
                    }
                }

            });
        }

        $scope.onUploads = function () {
            var selectTabName = $scope.selectTabName;
            var rows = $scope[selectTabName].gridApi.selection.getSelectedRows();
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
                    var selectedindex = 0;
                    var rowss = $scope[selectTabName].gridApi.selection.getSelectedRows();
                    if (rowss.length > 0) {
                        for (var i = 0; i < value.length; i++) {
                            value[i].cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                            if (i < rowss.length) {
                                var alldata = $scope.dealAttachmentBGridOptions.data;
                                for (var j = 0; j < alldata.length; j++) {
                                    if (rowss[i].$$hashKey == alldata[j].$$hashKey) {
                                        value[i].file_type = alldata[j].file_type;
                                        $scope.dealAttachmentBGridOptions.data[j] = value[i];
                                        break;
                                    }
                                }
                            } else {
                                $scope.dealAttachmentBGridOptions.data.push(value[i]);
                            }

                        }
                    } else {
                        for (var i = 0; i < value.length; i++) {
                            value[i].cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                            if ($scope.dealAttachmentBGridOptions.data[selectedindex + i] != null && $scope.dealAttachmentBGridOptions.data[selectedindex + i].file_type != null) {
                                value[i].file_type = $scope.dealAttachmentBGridOptions.data[selectedindex + i].file_type;
                                value[i].$$hashKey = $scope.dealAttachmentBGridOptions.data[selectedindex + i].$$hashKey;
                                $scope.dealAttachmentBGridOptions.data[selectedindex + i] = value[i];
                            } else {
                                $scope.dealAttachmentBGridOptions.data.push(value[i]);
                            }
                        }
                    }


                }
            }, function (reason) {

            });
        };

        $scope.onDownLoad = function (filename) {
            filename = filename + ".doc";
            $http.post($scope.basePath + "consultComplete/onDownLoad", {
                filename: filename,
            }, {responseType: 'arraybuffer'}).success(function (data) {
                var blob = new Blob([data], {type: "application/msword"});
                var downloadUrl = window.URL.createObjectURL(blob);
                var anchor = document.createElement('a');
                anchor.href = downloadUrl;
                anchor.download = filename;
                anchor.click();
            });
        }

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
         * 查看立项历史
         */
        $scope.onProjectHis = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            $scope.projectsourceid = rows[0].projectsourceid;
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/consultComplete/consultCompleteHisGrid.html',
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
         * 保单信息
         */
        $scope.onInsurance = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            $scope.pkProject = rows[0].id;
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/consultComplete/caibInsuranceBillGrid.html',
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
            layer.load(2);
        }

        $scope.onSubCancel = function () {
            ngDialog.close();
        }

        /**
         * 终止项目
         */
        $scope.onEndProject = function () {
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/consultComplete/endProject.html',
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

                });
            }
        };

        $scope.onSubmit = function () {
            var pk;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                if (rows[0].billstatus != 37) return layer.alert("只有暂存状态可以提交!", {skin: 'layui-layer-lan', closeBtn: 1});
                pk = rows[0].pk;
            }
            $scope.submit();
            $scope.queryFlowInfo(pkProject, function (response) {
            });
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
            $scope.isClear = true;
            $scope.isEdit = true;

            $scope.tabDisabled = true;
            $scope.isCooperationType = true;
            $scope.isBlanketType = false;
            $scope.isBack = true;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $scope.changeButonStatus();

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
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.isContinue = false;
                });

            } else if ($scope.isCard) {
                $scope.findOne($scope.VO.id, function () {
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.isContinue = false;
                    $scope.isCard = false;
                    $scope.form = true;
                });
            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
                $scope.isContinue = false;
            }
            $scope.changeButonStatus();
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
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
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
                if (!rows || rows.length != 1) {
                    return layer.alert("请选择一条数据进行查看!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                } else {
                    id = rows[0].id;
                }
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
                    $scope.isEdit = false;

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
                    $http.post($scope.basePath + "consultComplete/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;

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

                if ($scope.VO.billstatus == 34) {
                    if ($scope.VO.inspectedDate == null) {
                        return layer.alert("请选择结项日期!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                }
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    if ($scope.VO.billstatus == 37) {
                        $scope.VO.billstatus = 31;
                    }
                    var errmessge = $scope.validateDealAttachment();
                    if (errmessge && errmessge.length) {
                        return layer.alert(errmessge, {skin: 'layui-layer-lan', closeBtn: 1});
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
            $scope.QUERY.id = null;
        };

        /**
         * 初始化参照
         */
        $scope.initView = function () {
            var initdealGriddatas = $scope.initDealAttachment();
            if (initdealGriddatas == null) {
                return;
            }
            for (var i = 0; i < initdealGriddatas.length; i++) {
                $scope.dealAttachmentBGridOptions.data.push(initdealGriddatas[i]);
            }
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
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;

        $scope.queryShow = true;
        //控制附件上传和下载
        $scope.upOrDown = false;
        $scope.isBid = true;
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
            exporterCsvFilename: '项目验收明细.csv',
            columnDefs: [
                {name: 'approvalName', displayName: '项目名称', width: 200,},
                {
                    name: 'pkConsultProject.amount', displayName: '申报金额(万元)', width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'collaborator', displayName: '合作单位', width: 100,},
                {name: 'contractNo', displayName: '采购方式', width: 100, cellFilter: 'SELECT_PURCHASE'},
                {name: 'contractName', displayName: '合同名称', width: 100,},
                {name: 'contractAmount', displayName: '合同金额（元）', width: 100,},
                {
                    name: 'pkConsultProject.kindType',
                    displayName: '项目类型',
                    width: 100,
                    cellFilter: 'SELECT_CONTSULT_TYPE'
                },
                {name: 'pkConsultProject.isgroup', displayName: '集中申报', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'operateDate', displayName: '制单日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'operateTime', displayName: '制单时间', width: 100,},
                {name: 'pkChecker.name', displayName: '审批人', width: 100,},
                {name: 'checkDate', displayName: '审批日期', width: 100, cellFilter: 'date_cell_date'},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '业务部门', width: 100,},
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

        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }

        //附件
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
                {
                    name: 'file_type',
                    displayName: '附件类型',
                    width: 170,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_CONTSULT_ATTACHMENT'
                },
                {name: 'attachment_name', displayName: '附件名称', width: 180, enableCellEdit: false},
                {name: 'cUpdate', displayName: '上载时间', width: 180, enableCellEdit: false},
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
    };

    $scope.table_name = "lr_consult_complete";
    $scope.billdef = "ConsultComplete";
    $scope.beanName = "insurance.ConsultCompleteServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.onQuery();
    initworkflow($scope, $http, ngDialog);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);
});
