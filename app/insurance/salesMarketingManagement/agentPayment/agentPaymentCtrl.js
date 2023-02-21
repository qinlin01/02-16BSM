/**
 * Create By zhangwj
 * Create Time 2021-11-16
 */
app.controller('agentPaymentCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function () {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkCorp: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                createTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
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
    };


    $scope.initHttp = function () {


        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "agentPayment/queryForGrid", {
                params: angular.toJson(data),
                current: $scope.gridApi.page ? $scope.gridApi.page : 1,
                size: $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100,
            }).success(function (response) {
                $scope.gridOptions.data = response.data.records;
                $scope.gridOptions.totalItems = response.data.total;
                layer.closeAll('loading');
            });
        };

        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "agentPayment/findOne", {id: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    if (callback) {
                        callback();
                    }
                    $scope.VO = response.data;
                } else {
                    if (response) {
                        if (response.msg) {
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
            $http({
                method: "POST",
                url: $rootScope.basePath + "agentPayment/save",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response.code == 200) {
                    $scope.VO = response.vo;
                    $scope.isGrid = false;
                    $scope.isCard = true;
                    $scope.isForm = false;
                    layer.closeAll('loading');
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
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
        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };

        $scope.onAdd = function () {
            $scope.VO = $scope.initVO();
            $scope.isGrid = false;
            $scope.isCard = false;
            $scope.isForm = true;
        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id);
                $scope.isGrid = false;
                $scope.isCard = false;
                $scope.isForm = true;
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
                $scope.isGrid = false;
                $scope.isCard = true;
                $scope.isForm = false;
            } else {

            }
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
                    $http.post($scope.basePath + "agentPayment/deleteVo", {ids: angular.toJson(ids)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response.code == 200) {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg(response.msg, {icon: 1});
                        }
                        if (response.code == 900) {
                            layer.msg(response.msg, {icon: 1});
                        }
                    });
                }
            );
        };

        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            if ($scope.VO.id && $scope.VO.id != '') {
                $scope.isGrid = false;
                $scope.isCard = true;
                $scope.isForm = false;
            } else {
                $scope.isGrid = true;
                $scope.isCard = false;
                $scope.isForm = false;
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
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isForm = false;
            //阻止页面渲染
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

                    $scope.VO.agentPaymentBList = $scope.agentPaymentBGridOption.data;
                    $scope.onSaveVO();
                }
            }, true);
        };

        $scope.onReset = function () {
            $scope.QUERY = $scope.initQUERY();
            $scope.QUERY.id = null;
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

        /**
         * 子表新增
         */
        $scope.onAddLine = function (selectTabName) {
            let data = {};
            $scope[selectTabName].data.push(data);
        }

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

    };

    $scope.initPage = function () {
        //列表界面
        $scope.isGrid = true;
        //卡片界面
        $scope.isCard = false;
        //编辑界面
        $scope.isForm = false;
        //列表界面子表是否显示
        $scope.chilbTable = false;
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
            exporterCsvFilename: '手续费模板.csv',
            columnDefs: [

                // {name: 'sourceBillType', displayName: '来源单据类型;'},
                {name: 'year', displayName: '年'},
                {name: 'month', displayName: '月'},
                {name: 'pkInsurancebill.insuranceinfono', displayName: '来源单据信息编号'},
                {name: 'sourceBillCode', displayName: '来源单据编号'},
                {name: 'pkInsurance.name', displayName: '险种'},
                {name: 'stages', displayName: '期数'},
                {name: 'pkAgent.name', displayName: '代理人'},
                {name: 'insuranceAmount', displayName: '保费(含税)', cellFilter: 'AMOUNT_FILTER'},
                {name: 'receiveFeeAmount', displayName: '佣金金额（含税）', cellFilter: 'AMOUNT_FILTER'},
                {name: 'planServiceCharge', displayName: '手续费', cellFilter: 'AMOUNT_FILTER'},
                {name: 'ratio', displayName: '手续费比例'},
                {name: 'factServiceCharge', displayName: ' 已结算手续费金额', cellFilter: 'AMOUNT_FILTER'},
                // {name: 'withholdingAmount', displayName: '代扣款项合计'},
                {name: 'vsettlebillnos', displayName: '结算单号'},
                // {name: 'billstatus', displayName: '单据状态', cellFilter: 'SELECT_BILLSTATUS'},
                // {name: 'pkOperator.name', displayName: '经办人'},
                {name: 'createTime', displayName: '制单日期', cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'pkOrg.name', displayName: '业务单位'},
                {name: 'pkDept.name', displayName: '部门'},
                // {name: 'pkChecker.name', displayName: '审核人'},
                // {name: 'checkDate', displayName: '审核日期'},
                // {name: 'pkAuditor.name', displayName: '最终审核人'},
                // {name: 'auditDate', displayName: '最终审核日期'},
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
                    $scope.VO = row.entity;
                    $scope.findOne($scope.VO.id);
                } else {
                    $scope.chilbTable = false;
                    $scope.VO = $scope.initVO();
                }
            });


        };
    };

    //实体类审批流配置
    $scope.ifEntity = "true";
    $scope.entityVO = "lr.insurance.vo.ServiceTemplateVO";
    $scope.funCode = '180401';
    $scope.table_name = "t_service_template";
    $scope.billdef = "Clearing";
    $scope.beanName = "poundageTemplateService";
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