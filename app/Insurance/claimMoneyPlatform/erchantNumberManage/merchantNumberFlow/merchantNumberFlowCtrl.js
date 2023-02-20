/**
 * Create By zhangwj
 * Create Time 2021-11-16
 */
app.controller('merchantNumberFlowCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, ngTableParams) {
    $scope.initData = function () {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                flowNo: null,
                thirdOrgType: null,
                accountNumber: null,
                tradeDate: null,
                inFlowAmount: 0,
                outFlowAmount: 0,
                flowAmount: 0,
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                createTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                balanceOrder: [],
                dealattachmentb: [],
                billstatus:31,
                dr: 0
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
        $scope.funCode = "180402";
        $scope.QUERY = $scope.initQUERY();
        $scope.accountNumberArray = [];
    };


    $scope.initHttp = function () {

        $scope.getAccountNumber = function (){
            $http.post($scope.basePath + "merchantNumber/findAccountNumber", {thirdOrgType: $scope.VO.thirdOrgType}).success(function (response) {
                if (response && response.code == "200") {
                    $scope.accountNumberArray = [];
                    for (let i = 0; i < response.data.length; i++) {
                        $scope.accountNumberArray.push({id:response.data[i],name:response.data[i]});
                    }
                }
            });
        }

        $scope.getOrderInfo = function () {
            $http.post($scope.basePath + "merchantNumberFlow/getOrderInfo", {accountNumber: $scope.VO.accountNumber,tradeDate: $scope.VO.tradeDate}).success(function (response) {
                if (response && response.code == "200") {
                    $scope.balanceOrderGridOption.data = response.data;
                    for (let i = 0; i < $scope.balanceOrderGridOption.data.length; i++) {
                        $scope.VO.balanceOrder.push($scope.balanceOrderGridOption.data[i]);
                    }
                    $scope.sumAmount();
                }
            });
        }

        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "merchantNumberFlow/queryForGrid", {
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
            $http.post($scope.basePath + "merchantNumberFlow/findOne", {id: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    $scope.VO = response.data;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealattachmentb;
                    $scope.getAccountNumber();
                    $scope.getOrderInfo();
                    if (callback) {
                        callback();
                    }
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
            $scope.VO.dealattachmentb = $scope.dealAttachmentBGridOptions.data;
            layer.load(2);
            $http({
                method: "POST",
                url: $rootScope.basePath + "merchantNumberFlow/save",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response.code == 200) {
                    $scope.VO = response.result;
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

        $scope.sumAmount = function (){
            $scope.VO.inFlowAmount = 0;
            $scope.VO.outFlowAmount = 0;
            $scope.VO.flowAmount = 0;
            for (let i = 0; i < $scope.VO.balanceOrder.length; i++) {
                //充值和订单支付时为资金流入
                if($scope.VO.balanceOrder[i].busiType == 1 || $scope.VO.balanceOrder[i].busiType == 2){
                    $scope.VO.inFlowAmount = $scope.VO.inFlowAmount + $scope.VO.balanceOrder[i].payment;
                }else{
                    $scope.VO.outFlowAmount = $scope.VO.outFlowAmount + Math.abs($scope.VO.balanceOrder[i].payment);
                }
            }
            $scope.VO.flowAmount = $scope.VO.inFlowAmount - $scope.VO.outFlowAmount;
        }

        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };

    };

    $scope.initWatch = function () {
        $scope.$watch('VO.thirdOrgType', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            $scope.getAccountNumber();
        }, true);
        $scope.$watch('VO.accountNumber', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            $scope.VO.balanceOrder = [];
            $scope.balanceOrderGridOption.data = [];
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if($scope.VO.accountNumber!=null && $scope.VO.accountNumber!='' && $scope.VO.tradeDate!=null && $scope.VO.tradeDate!=''){
                $scope.getOrderInfo();
            }
        }, true);
        $scope.$watch('VO.tradeDate', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            $scope.VO.balanceOrder = [];
            $scope.balanceOrderGridOption.data = [];
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if($scope.VO.accountNumber!=null && $scope.VO.accountNumber!='' && $scope.VO.tradeDate!=null && $scope.VO.tradeDate!=''){
                $scope.getOrderInfo();
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

        $scope.onAdd = function () {
            angular.assignData($scope.VO, $scope.initVO());
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
                $scope.findOne(rows[0].id,function (){
                    $scope.isGrid = false;
                    $scope.isCard = false;
                    $scope.isForm = true;
                });
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
                $scope.findOne(rows[0].id,function (){
                    $scope.isGrid = false;
                    $scope.isCard = true;
                    $scope.isForm = false;
                });
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
                    $http.post($scope.basePath + "merchantNumberFlow/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
                    if (!$scope.dealAttachmentBGridOptions.data) {
                        $scope.dealAttachmentBGridOptions.data = [];
                    }
                    angular.forEach(value, function (item) {
                        item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                        $scope.dealAttachmentBGridOptions.data.push(item);
                    });
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
            exporterCsvFilename: '商户号流水.csv',
            columnDefs: [
                {name: 'flowNo', displayName: '信息编号'},
                {name: 'thirdOrgType', displayName: '第三方支付机构名称',cellFilter: 'SELECT_THIRDORGTYPE'},
                {name: 'accountNumber', displayName: '账号'},
                {name: 'tradeDate', displayName: '交易日期'},
                {name: 'inFlowAmount', displayName: '当日流入总金额（元）', cellFilter: 'AMOUNT_FILTER'},
                {name: 'outFlowAmount', displayName: '当日流出总金额（元）', cellFilter: 'AMOUNT_FILTER'},
                {name: 'flowAmount', displayName: '当日净流入金额（元）', cellFilter: 'AMOUNT_FILTER'},
                {name: 'billstatus', displayName: '单据状态', cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人'},
                {name: 'createTime', displayName: '制单日期', cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'pkOrg.name', displayName: '业务单位'},
                {name: 'pkDept.name', displayName: '部门'},
                {name: 'pkChecker.name', displayName: '审核人'},
                {name: 'checkDate', displayName: '审核日期'},
                {name: 'pkAuditor.name', displayName: '最终审核人'},
                {name: 'auditDate', displayName: '最终审核日期'},
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

        //交易流水子表
        $scope.balanceOrderGridOption = {
            enableCellEditOnFocus: false,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,//不显示选中框
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '交易流水子表.csv',
            columnDefs: [
                {name: 'serialNo', displayName: '流水号'},
                {name: 'payment', displayName: '交易金额',cellFilter: 'AMOUNT_FILTER'},
                {name: 'paytime', displayName: '交易时间'},
                {name: 'busiType', displayName: '交易类型业务类型',cellFilter: "SELECT_ORDER_BUSI_TYPE"},
            ],
            data: [],
            onRegisterApi: function (gridApi) {
                $scope.balanceOrderGridOption.gridApi = gridApi;
                $scope.balanceOrderGridOption.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                });

                $scope.balanceOrderGridOption.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                    var rows = $scope.balanceOrderGridOption.gridApi.selection.getSelectedRows();
                    $scope.VO.balanceOrder = [];
                    for (let i = 0; i < rows.length; i++) {
                        $scope.VO.balanceOrder.push(rows[i]);
                    }
                    $scope.sumAmount();
                });
                $scope.balanceOrderGridOption.gridApi.selection.on.rowSelectionChangedBatch($scope, function (row, event) {
                    var rows = $scope.balanceOrderGridOption.gridApi.selection.getSelectedRows();
                    $scope.VO.balanceOrder = [];
                    for (let i = 0; i < rows.length; i++) {
                        $scope.VO.balanceOrder.push(rows[i]);
                    }
                    $scope.sumAmount();
                });
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

    //实体类审批流配置
    $scope.ifEntity = "true";
    $scope.entityVO = "lr.insurance.vo.MerchantNumberFlowVO";
    $scope.funCode = '140402';
    $scope.table_name = "t_merchant_number_flow";
    $scope.billdef = "MerchantNumberFlow";
    $scope.beanName = "merchantNumberFlowService";
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
