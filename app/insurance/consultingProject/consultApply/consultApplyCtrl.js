app.controller('consultApplyCtrl', function ($rootScope, $scope, $http, $sce, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog) {
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
                billstatus: 31,
                pkDeliverUnit: null,
                approvalYear: 'Y',
                approvalName: '',
                backgrounds: '',
                aim: '',
                memo: '',
                dr: 0,
                approvalYear: '',
                projectStatus: 0
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.entityVO = 'nc.vo.busi.ConsultApplyProjectVO';
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "id": $stateParams.id
            }
        };
        $scope.QUERY = $scope.initQUERY();
        /**
         * 初始化参照
         */
        $scope.initView = function () {

            // 先初始化一下附件内容
            $scope.dealAttachmentBGridOptions.data = [];
            $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;

            var initdealGriddatas = $scope.initDealAttachment();
            if (initdealGriddatas == null) {
                return;
            }
            for (var i = 0; i < initdealGriddatas.length; i++) {
                $scope.dealAttachmentBGridOptions.data.push(initdealGriddatas[i]);
            }

        };
    };

    $scope.initHttp = function () {
        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data) {
            layer.load(2);
            return $http.post($rootScope.basePath + "consultApply/queryAllForGrid", {
                params: angular.toJson(data),
                fields: angular.toJson($scope.queryData)
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
        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "consultApply/queryForGrid", {
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
            $http.post($scope.basePath + "consultApply/findOne", {pk: pk}).success(function (response) {
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
         */
        $scope.onSaveVO = function () {

            layer.load(2);
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $http.post($rootScope.basePath + "consultApply/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
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

                        angular.assignData($scope.VO, response.result);
                        $scope.onCard($scope.VO.id);
                    }

                });
        };

        /*
         * 提交
         * */
        $scope.submit = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "consultApply/submit", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    layer.closeAll('loading');
                    if (response) {
                        if (response.msg) {
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if (response.code == 200) {
                        if ($scope.isGrid) {
                            $scope.queryForGrid($scope.QUERY);
                        } else {
                            $scope.findOne($scope.pk);
                        }
                    }
                });
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

        $scope.validateDealAttachment = function () {
            var initdealGriddatas = $scope.initDealAttachment();
            var array = $scope.dealAttachmentBGridOptions.data;
            // 如果没有要求附件就不校验
            if (initdealGriddatas == undefined || initdealGriddatas == null) {
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

        $scope.$watch('VO.kindType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                for (var i = 0; i < $rootScope.SELECT.CONTSULT_TYPE.length; i++) {
                    if ($rootScope.SELECT.CONTSULT_TYPE[i].id == newVal) {
                        $scope.VO.kindTypeName = $rootScope.SELECT.CONTSULT_TYPE[i].name;
                        break;
                    }
                }
            }
        }, true);
        $scope.$watch('VO.group', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {

                if ($scope.VO.group != null && $scope.VO.group == 'N') {
                    $scope.param = {};
                    if ($rootScope.orgVO.pk == '1002') {
                        $scope.param = {DEPTCODE: '1018'};
                    } else {
                        $scope.param = {};
                    }
                } else {
                    $scope.param = {};
                }
                for (var i = 0; i < $rootScope.SELECT.YESNO.length; i++) {
                    if ($rootScope.SELECT.YESNO[i].id == newVal) {
                        $scope.VO.groupName = $rootScope.SELECT.YESNO[i].name;
                        break;
                    }
                }
                $scope.VO.pkDeliverUnit = null;
            }
        }, true);
    };

    $scope.initButton = function () {

        $scope.onChangeProjectInfo = function () {
            // 控制字表按钮的显示
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
                    $scope.isEdit = true;
                    $scope.isBack = true;
                    $scope.isDisabled = true;
                    $scope.isChangeProjectInfo = true;
                    $scope.initView();
                });

            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = true;
                $scope.isChangeProjectInfo = true;
                $scope.initView();
            }
        }

        $scope.onUploads = function () {
            var selectTabName = $scope.selectTabName;
            // var rows = $scope[selectTabName].gridApi.selection.getSelectedRows();
            // if (!rows || rows.length <= 0) return angular.alert("请选择要上传的附件类型！");
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

        $scope.onAdd = function () {
            $scope.form = true;
            $scope.isGrid = false;
            $scope.isClear = true;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.isContinue = false;
            $scope.tabDisabled = true;
            $scope.isCooperationType = true;
            $scope.isBlanketType = false;
            $scope.isBack = true;
//            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
            var now = new Date();
            var curyear = now.format("yyyy")
            for (var i = 0; i < $rootScope.SELECT.BUSIYEAR.length; i++) {
                if ($rootScope.SELECT.BUSIYEAR[i].id == curyear) {
                    $scope.VO.approvalYear = $rootScope.SELECT.BUSIYEAR[i].id;
                    break;
                }
            }
            var curmonth = now.getMonth() + 1;
            if (curmonth == 10) {
                $scope.VO.group = 'Y';
            } else {
                $scope.VO.group = 'N';
                $scope.param = {DEPTCODE: '1018'};
            }
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
                $scope.isCard = false;
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
                $scope.isCard = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
                $scope.isContinue = false;
            }
        };
        $scope.onAmountChange = function () {
            if ($scope.isEdit) {
                $scope.dataTransfer();
            }
        };

        $scope.dataTransfer = function () {
            $scope.VO.launchName = "";
            if ($scope.VO.amount <= 20) {
                $scope.VO.launch = 1;
                $scope.launchMemo = "预计批复金额20万元（含）以下的咨询项目，为自行管理项目，由承办单位自行组织评审。";
            } else if ($scope.VO.amount > 20 && $scope.VO.amount < 100) {
                if ($scope.VO.pkOrg.pk == '1002') {
                    $scope.VO.launch = 1;
                } else {
                    $scope.VO.launch = 2;
                }
                $scope.launchMemo = "预计批复金额20万元（不含）-100万元（不含）以下的咨询项目，承办部门为本部门的，由承办单位组织立项评审，承办单位为分（子）公司的，由对口专业部门组织立项评审。";
            } else {
                if ($scope.VO.pkOrg.pk == '1002') {
                    $scope.VO.launch = 1;
                } else {
                    $scope.VO.launch = 2;
                }
                $scope.launchMemo = "预计批复金额100万元（含）以上的咨询项目，承办部门为本部门的，由承办单位组织立项评审，承办单位为分（子）公司的，由对口专业部门组织立项评审。";
            }
            for (var i = 0; i < $rootScope.SELECT.LAUNCH.length; i++) {
                if ($rootScope.SELECT.LAUNCH[i].id == $scope.VO.launch) {

                    $scope.VO.launchName = $rootScope.SELECT.LAUNCH[i].name;
                    break;
                }
            }
            // 加工是否综合计划
            for (var i = 0; i < $rootScope.SELECT.YESNO.length; i++) {
                if ($rootScope.SELECT.YESNO[i].id == $scope.VO.group) {
                    $scope.VO.groupName = $rootScope.SELECT.YESNO[i].name;
                    break;
                }
            }
            // 加工项目类型
            for (var i = 0; i < $rootScope.SELECT.CONTSULT_TYPE.length; i++) {
                if ($rootScope.SELECT.CONTSULT_TYPE[i].id == $scope.VO.kindType) {
                    $scope.VO.kindTypeName = $rootScope.SELECT.CONTSULT_TYPE[i].name;
                    break;
                }
            }
        }
        /**
         * 用于处理审核通过后需要修改项目信息的情况
         *
         * @returns {*}
         */
        $scope.onSendBack = function () {
            var jsonObject = angular.toJson($scope.VO);
            if (null == $scope.VO.id || $scope.VO.id == "") {
                return layer.alert("请选择一条数据进行处理!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            layer.confirm('是否确定要退回修改？', {
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
                    $http.post($scope.basePath + "consultApply/sendBack", {ids: $scope.VO.id})
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
                    $http.post($scope.basePath + "consultApply/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
        $scope.onPrint = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $http.post($rootScope.basePath + "consultApply/print", {
                ids: angular.toJson(rows)
            }, {responseType: 'arraybuffer'}).success(function (response) {
                var files = new Blob([response], {type: 'application/pdf'});
                var fileURL = URL.createObjectURL(files);
                $scope.content = $sce.trustAsResourceUrl(fileURL);
                $scope.content = $scope.content;

                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: 'view/common/pdfView.html',
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

            })
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
                    if ($scope.VO.backgrounds.length > 2000) {
                        return layer.alert("项目简介不可以超过2000个字!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.VO.contexts.length > 2000) {
                        return layer.alert("项目内容简述不可以超过2000个字!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.VO.aim.length > 2000) {
                        return layer.alert("预期目标与结果不可以超过2000个字!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.VO.memo != undefined && $scope.VO.memo.length > 2000) {
                        return layer.alert("备注不可以超过2000个字!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.VO.billstatus == 37) {
                        $scope.VO.billstatus = 31;
                    }
                    var errmessge = $scope.validateDealAttachment();
                    if (errmessge && errmessge.length) {
                        return layer.alert(errmessge, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    // 防止点击了修改直接保存的情况
                    $scope.dataTransfer();
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
        $scope.initDealAttachment = function () {
            var initdealGriddatas = [
                {file_type: 1,},
                {file_type: 2,},
                {file_type: 3,}];
            if ($scope.VO.billstatus == 31) {
                return initdealGriddatas;
            }
            if ($scope.VO.billstatus == 34) {
                if ($scope.VO.group != null && $scope.VO.group == 'N') {
                    initdealGriddatas = [];
                    initdealGriddatas = [{file_type: 25,}];
                    return initdealGriddatas;
                }
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
        $scope.isDisabled = true;
        $scope.isContinue = true;
        $scope.queryShow = true;
        //控制附件上传和下载
        $scope.upOrDown = false;
        //投标业务需总部配合准备资料 zhoul

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
            exporterCsvFilename: '项目申报明细.csv',
            columnDefs: [
                {name: 'serialNo', displayName: '项目申报编号', width: 135,},
                {name: 'approvalYear', displayName: '申报年度', width: 100, cellFilter: 'SELECT_BUSIYEAR'},
                {name: 'approvalName', displayName: '项目名称', width: 200,},
                {
                    name: 'amount', displayName: '申报金额(万元)', width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'pkDeliverUnit.name', displayName: '项目管理部门', width: 130,},
                {name: 'kindType', displayName: '项目类型', width: 100, cellFilter: 'SELECT_CONTSULT_TYPE'},
                {name: 'launchName', displayName: '开展类型', width: 100,},
                {name: 'group', displayName: '集中申报', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'planed', displayName: '是否纳入综合计划', width: 100, cellFilter: 'SELECT_YESNO'},
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
            enableSorting: true,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'file_type',
                    displayName: '附件类型',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_CONTSULT_ATTACHMENT'
                },
                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},
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
    };

    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {
            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }
    };

    $scope.table_name = "lr_consult_apply";
    $scope.billdef = "ConsultApply";
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