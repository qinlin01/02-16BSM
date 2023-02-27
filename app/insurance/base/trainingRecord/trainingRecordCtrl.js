app.controller('trainingRecordCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {

    $scope.initData = function () {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                dealattachmentb: [],
                trainingName: null,
                startDate: null,
                endDate: null,
                pkAreacl: null,
                address: null,
                trainingType: null,
                linkman: null,
                contactPhone: null,
                agents: [],
                trainingRecordBVOS: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "substr(create_time,1,4)0_0eq": parseInt(new Date().format("yyyy")),
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode ='111';

        $scope.param = {
            c_2_type: 0,
            pk_org_str: $rootScope.orgVO.pk,
            busi_type: "notNull"
        };
    };

    $scope.initHttp = function () {
        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function () {
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.basePath + "trainingRecord/queryForAllGrid", {
                current: $scope.gridApi.page ? $scope.gridApi.page : 1,
                size: $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100,
            }).success(function (response) {
                $scope.gridOptions.data = response.data.records;
                $scope.gridOptions.totalItems = response.data.total;
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
            return $http.post($rootScope.basePath + "trainingRecord/queryForGrid", {
                params: angular.toJson(data),
                current: $scope.gridApi.page ? $scope.gridApi.page : 1,
                size: $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100,
            }).success(function (response) {
                $scope.gridOptions.data = response.data.records;
                $scope.gridOptions.totalItems = response.data.total;
                layer.closeAll('loading');
            }).error(function () {
                layer.closeAll('loading');
            });
        };

        $scope.findOne = function (id, callback) {
            $scope.id = id;
            $http.post($scope.basePath + "trainingRecord/findOne", {id: id}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.data);
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealattachmentb;
                    if (callback) callback();
                } else {
                    if (response) {
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                let rs = asciiChartSet_c2en[matched];
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
            $scope.VO.dealattachmentb = $scope.dealAttachmentBGridOptions.data;
            $scope.VO.trainingRecordBVOS = $scope.trainingRecordsGridOptions.data;

            $http({
                method: "POST",
                url: $rootScope.basePath + "trainingRecord/save",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response && response.code == 200) {
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isEdit = false;
                    angular.assignData($scope.VO, response.result);
                    layer.closeAll('loading');
                    return layer.alert('保存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
    };

    $scope.initFunction = function () {
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
    };

    $scope.initWatch = function () {

    };

    $scope.initButton = function () {

        $scope.onDownLoadsCard = function (id) {
            let ids = [];
            ids.push(id);
            let exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };
        $scope.onAdd = function () {
            $scope.isClear = true;
            $scope.form = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isBack = true;
            $scope.isUploadAnytime = false;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $scope.dealAttachmentBGridOptions.data = [];
            $scope.trainingRecordsGridOptions.data = [];
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
                $scope.isGrid = false;
                let rows = $scope.gridApi.selection.getSelectedRows();
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
         * 一会再弄
         */
        $scope.onFindCache = function () {
            $http.post($scope.basePath + "trainingRecord/findCache").success(function (response) {
                if (response && response.code == 200) {
                    angular.assignData($scope.VO, response.result);
                    $scope.$apply();//需要手动刷新
                    layer.closeAll();
                }
            });
        }

        /**
         * 暂存
         */
        $scope.onTemporary = function () {
            $scope.VO.dealattachmentb = $scope.dealAttachmentBGridOptions.data;
            $scope.VO.trainingRecordBVOS = $scope.trainingRecordsGridOptions.data;
            $http({
                method: "POST",
                url: $rootScope.basePath + "trainingRecord/temporarySave",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response && response.code == 200) {
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isEdit = false;
                    $scope.isDisabled = true;
                    $scope.isDisableds = true;
                    angular.assignData($scope.VO, response.result);
                    layer.closeAll('loading');
                    return layer.alert('暂存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        }

        /**
         * 卡片
         */
        $scope.onCard = function (id) {
            if (!id) {
                let rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1)
                    return layer.alert("请选择一条数据进行查看!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                id = rows[0].id;
            }
            $scope.findOne(id);
            $scope.mess = true;
            $scope.isBack = true;
            $scope.isGrid = false;
            $scope.isCard = true;
            $scope.card = true;
        };
        $scope.onDelete = function () {
            let rows = $scope.gridApi.selection.getSelectedRows();
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
                    let ids = [];
                    for (let i = 0; i < rows.length; i++) {
                        ids.push(rows[i].id);
                    }
                    layer.load(2);
                    $http.post($scope.basePath + "trainingRecord/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
         * 取消功能
         */
        $scope.onCancel = function () {
            // if ($scope.isClear) {
            //     layer.confirm('是否暂存本条数据？', {
            //             btn: ['确定', '取消'], //按钮
            //             btn2: function (index, layero) {
            //                  $scope.VO = $scope.initVO();
            //             },
            //             shade: 0.6,//遮罩透明度
            //             shadeClose: true,//点击遮罩关闭层
            //         },
            //         function () {
            //             // 暂存
            //             $scope.onTemporary();
            //             $scope.VO = $scope.initVO();
            //         }
            //     );
            //
            // }
            $scope.isDisabled = true;
            $scope.isDisableds = true;
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
            $scope.isFeeEdit = false;
            $scope.isDisabled = true;
            $scope.isDisableds = true;
            //阻止页面渲染
            $scope.form = false;
            $scope.card = false;
            //阻止页面渲染
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
                    if($scope.trainingRecordsGridOptions.data == null || $scope.trainingRecordsGridOptions.data.length == 0){
                        return layer.alert("培训课程信息不可为空！",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    for (let i = 0; i < $scope.trainingRecordsGridOptions.data.length; i++) {
                        if($scope.trainingRecordsGridOptions.data[i].topic == null || $scope.trainingRecordsGridOptions.data[i].topic == ''){
                            return layer.alert("培训课程信息中的培训课题不可为空！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if($scope.trainingRecordsGridOptions.data[i].classHour == null || $scope.trainingRecordsGridOptions.data[i].classHour == ''){
                            return layer.alert("培训课程信息中的课时不可为空！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if($scope.trainingRecordsGridOptions.data[i].lecturer == null || $scope.trainingRecordsGridOptions.data[i].lecturer == ''){
                            return layer.alert("培训课程信息中的讲师不可为空！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if($scope.VO.startDate > $scope.VO.endDate){
                        return layer.alert("开始日期必须小于结束日期！",
                            {skin: 'layui-layer-lan', closeBtn: 1});
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
        };

        /**
         * 初始化参照
         */
        $scope.initView = function () {

        };
        /**
         * 子表新增
         */
        $scope.onAddLine = function (selectTabName) {
            $scope[selectTabName].data.push({});
        };


        /**
         * 子表删除
         */
        $scope.onDeleteLine = function (selectTabName) {
            let delRow = $scope[selectTabName].gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });

            for (let i = 0; i < $scope[selectTabName].data.length; i++) {
                for (let j = 0; j < delRow.length; j++) {
                    if ($scope[selectTabName].data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope[selectTabName].data.splice(i, 1);
                    }
                }
            }
        };

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
            let rows = $scope.VO.dealattachmentb;
            if (!rows || rows.length <= 0) return angular.alert("没有附件信息！");
            let ids = [];
            for (let i = 0; i < rows.length; i++) {
                ids.push(rows[i].pk_project_id);
            }
            let exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };

    };

    $scope.initPage = function () {
        $scope.ifupload = true;
        $scope.isClear = false;
        $scope.isShow = true;
        //阻止页面渲染
        $scope.form = false;
        $scope.card = false;
        //阻止页面渲染
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.isDisableds = false;
        $scope.queryShow = true;
        //控制附件上传和下载
        $scope.upOrDown = false;
        $scope.isUploadAnytime = false;
        //日期同步标志
        $scope.planDateSyn = true;
        $scope.planDateValue = null;
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
            exporterMenuCsv: true,
            showGridFooter: true,
            showColumnFooter: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '培训记录.csv',
            columnDefs: [
                {name: 'trainingName', displayName: '培训名称', width: 100,},
                {name: 'startDate', displayName: '开始日期', width: 100,},
                {name: 'endDate', displayName: '结束日期 ', width: 100,},
                {name: 'pkAreacl.name', displayName: '培训地点 ', width: 100,},
                {name: 'trainingType', displayName: '培训方式 ', width: 100, cellFilter: 'SELECT_ENUMTRAINTYPE'},
                // {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'createTime', displayName: '制单时间', width: 100,},
                // {name: 'pkChecker.name', displayName: '审批人', width: 100,},
                // {name: 'checkTime', displayName: '审批日期', width: 100, cellFilter: 'date_cell_date'},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '部门', width: 100,},
            ],
            data: [],
            exporterAllDataFn: function () {
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
                let rows = $scope.gridApi.selection.getSelectedRows();
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
        $scope.selectTabName = 'trainingRecordsGridOptions';
        $scope.trainingRecordsGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {name: 'topic', displayName: '培训课题', width: 280,},
                {name: 'classHour', displayName: '课时(单位：小时)',type: 'number', width: 150,},
                {name: 'lecturer', displayName: '讲师', width: 130,},
            ],
            data: $scope.VO.trainingRecordBVOS,
            onRegisterApi: function (gridApi) {
                $scope.trainingRecordsGridOptions.gridApi = gridApi;
            }
        };

        $scope.selectTabName = 'agentsGridOptions';
        $scope.agentsGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'agent.name', displayName: '执业人员姓名',
                    enableCellEdit: true,
                    url: 'commonRef/queryAgentRef',
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    isTree: false,
                    popupModelField: 'agent',
                    enableCellEdit: true,
                },
            ],
            data: $scope.VO.agents,
            onRegisterApi: function (gridApi) {
                $scope.agentsGridOptions.gridApi = gridApi;
            }
        };

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
            data: $scope.VO.dealattachmentb,
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
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();

        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {

            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }

    };
    //实体类审批流配置
    $scope.ifEntity = "true";
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
