/**
 * Create By zhangwj
 * Create Time 2021-11-16
 */
app.controller('rechargeManageCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function () {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                rechargeNo: null,
                currency: "CNY",
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkCorp: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                createTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                dealattachmentb: [],
                rechargeRecord: [],
                accountStatement: [],
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
        $scope.accountStatementQuery = {"actualAccountDate":new Date().format("yyyy-MM")};
        $scope.rechargeRecordQuery = {};
    };


    $scope.initHttp = function () {

        //打印资金到账通知单
        $scope.onPrintSignCheckBill = function (gridApi,htmlPathCheckBill,type) {
            $scope.raq = type;
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行打印!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $http.post($rootScope.basePath + 'rechargeManage/signCheckBill', {
                data: angular.toJson($scope.VO),
                raq: $scope.raq,
                type: "PDF"
            },{responseType:'arraybuffer'}).success(function (response) {
                var files = new Blob([response],{type: "application/pdf",filename:response.name});
                var fileURL = URL.createObjectURL(files);
                $scope.content=$sce.trustAsResourceUrl(fileURL);
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

        $scope.getRechargeRecordList = function (){
            layer.load(2);
            $http.post($scope.basePath + "rechargeManage/getRechargeRecordList", {
                params: angular.toJson($scope.rechargeRecordQuery),
            }).success(function (response) {
                $scope.rechargeRecordGridOption.data = response.data;
                layer.closeAll('loading');
            });
        }

        $scope.getAccountStatementList = function (){

            let param = {
                actualAccountDate: $scope.accountStatementQuery.actualAccountDate,
                queryAmount: $scope.accountStatementQuery.queryAmount,
                querylenderAmount: $scope.accountStatementQuery.querylenderAmount,
                queryName: $scope.accountStatementQuery.queryName,
                pkorg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                account_code: "1036",
                acountType: '2,5,7'
            }
            layer.load(2);
            $http.post($scope.basePath + "subscription/getClearing",
                {
                    params: angular.toJson(param),
                }).success(function (response) {
                if (response && response.code == "200") {
                    $scope.accountStatementGridOption.data = response.clearingList;
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
                layer.closeAll('loading');
            });
        }

        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "rechargeManage/queryForGrid", {
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
            $http.post($scope.basePath + "rechargeManage/findOne", {id: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    if (callback) {
                        callback();
                    }
                    angular.assignData($scope.VO, response.data);
                    $scope.rechargeRecordGridOption.data = $scope.VO.rechargeRecord;
                    $scope.accountStatementGridOption.data = $scope.VO.accountStatement;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealattachmentb;
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
            if($scope.dealAttachmentBGridOptions.data){
                $scope.VO.dealattachmentb = $scope.dealAttachmentBGridOptions.data;
            }
            layer.load(2);
            $http({
                method: "POST",
                url: $rootScope.basePath + "rechargeManage/save",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response.code == 200) {
                    angular.assignData($scope.VO, response.result);
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

        $scope.$watch('rechargeRecordQuery.rechargeNo', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            $scope.getRechargeRecordList();
        }, true);
        $scope.$watch('rechargeRecordQuery.rechargeMoney', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            $scope.getRechargeRecordList();
        }, true);
        $scope.$watch('rechargeRecordQuery.rechargeTime', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            $scope.getRechargeRecordList();
        }, true);

        $scope.$watch('accountStatementQuery.actualAccountDate', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            $scope.getAccountStatementList();
        }, true);
        $scope.$watch('accountStatementQuery.querylenderAmount', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            $scope.getAccountStatementList();
        }, true);
        $scope.$watch('accountStatementQuery.queryName', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            $scope.getAccountStatementList();
        }, true);

    }
    ;

    $scope.initButton = function () {
        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };

        $scope.onAdd = function () {
            $scope.VO = $scope.initVO();
            $scope.rechargeRecordGridOption.data = $scope.VO.rechargeRecord;
            $scope.accountStatementGridOption.data = $scope.VO.accountStatement;
            $scope.dealAttachmentBGridOptions.data = $scope.VO.dealattachmentb;
            $scope.isGrid = false;
            $scope.isCard = false;
            $scope.isForm = true;
            //银行流水
            $scope.getAccountStatementList();
            //充值流水
            $scope.getRechargeRecordList();
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
                id = rows[0].id;
            }
            $scope.findOne(id);
            $scope.isGrid = false;
            $scope.isCard = true;
            $scope.isForm = false;
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
                    $http.post($scope.basePath + "rechargeManage/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
                    if ($scope.dealAttachmentBGridOptions.data) {
                        angular.forEach(value, function (item) {
                            item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });

                    } else {
                        $scope.dealAttachmentBGridOptions.data = [];
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
            exporterCsvFilename: '充值业务.csv',
            columnDefs: [
                {name: 'rechargeNo', displayName: '认款信息编号'},
                {name: 'rechargeRecord[0].rechargeNo', displayName: '充值流水号'},
                {name: 'rechargeRecord[0].rechargeMoney', displayName: '充值金额'},
                {name: 'rechargeRecord[0].rechargeTime', displayName: '充值时间', cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'accountStatement[0].serialnumber', displayName: '银行流水号'},
                {name: 'accountStatement[0].transaction_name.unitname', displayName: '交易账户名称'},
                {name: 'accountStatement[0].reciprocal_name.name', displayName: '对方账户名称'},
                {name: 'accountStatement[0].lender_amount', displayName: '匹配金额', cellFilter: 'AMOUNT_FILTER'},
                {name: 'currency', displayName: '币种', cellFilter: 'SELECT_CURRENCY'},
                {name: 'sapCustomernCode', displayName: 'SAP凭证状态', cellFilter: 'SELECT_SAPTYPE'},
                {name: 'billstatus', displayName: '单据状态', cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人'},
                {name: 'createTime', displayName: '制单日期', cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'pkOrg.name', displayName: '业务单位'},
                {name: 'pkDept.name', displayName: '部门'},
                {name: 'pkChecker.name', displayName: '审核人'},
                {name: 'checkDate', displayName: '审核日期',cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'pkAuditor.name', displayName: '最终审核人'},
                {name: 'auditDate', displayName: '最终审核日期',cellFilter: 'date:"yyyy-MM-dd"'},
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

        //银行流水
        $scope.accountStatementGridOption = {
            enableCellEditOnFocus: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,//不显示选中框
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '手续费模板子表.csv',
            columnDefs: [
                {name: 'serialnumber', displayName: '银行流水号 ', enableCellEdit: false,width: 250},
                {
                    name: 'reciprocal_name.name', displayName: '对方账户名称', width: 200, enableCellEdit: false
                },
                {
                    name: 'reciprocal_account', displayName: '对方账号', width: 150, enableCellEdit: false
                },
                {
                    name: 'transaction_name.unitname', displayName: '交易账户名称', width: 200, enableCellEdit: false
                },
                {
                    name: 'transaction_account', displayName: '交易账号', width: 150, enableCellEdit: false
                },
                {
                    name: 'lender_amount', displayName: '贷方金额', width: 150, enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'amount', displayName: '可用金额', width: 150, enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'transaction_date', displayName: '到账日期', width: 150, enableCellEdit: false, cellFilter: 'date:"yyyy-MM-dd"'
                },
            ],
            data: [],
            onRegisterApi: function (gridApi) {
                $scope.accountStatementGridOption.gridApi = gridApi;
                $scope.accountStatementGridOption.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                $scope.accountStatementGridOption.gridApi.selection.on.rowSelectionChanged(
                    $scope, function (row, event) {
                        var rows = $scope.accountStatementGridOption.gridApi.selection.getSelectedRows();
                        if(rows.length == 1){
                            $scope.VO.accountStatement = rows;
                        }else{
                            $scope.VO.accountStatement = [];
                        }
                    });
            }
        };

        //充值流水
        $scope.rechargeRecordGridOption = {
            enableCellEditOnFocus: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,//不显示选中框
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '手续费模板子表.csv',
            columnDefs: [
                {name: 'rechargeNo', displayName: '充值流水号 ', enableCellEdit: false},
                {name: 'remittancesAccount', displayName: '汇款/转账账号', enableCellEdit: false},
                {name: 'travelAgencyName', displayName: '旅行社名称', enableCellEdit: false},
                {name: 'paymentAccount', displayName: '支付账户名称', enableCellEdit: false},
                {name: 'openingBank', displayName: '开户行', enableCellEdit: false},
                {name: 'rechargeMoney', displayName: '充值金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER'},
                {name: 'rechargeTime', displayName: '充值时间', enableCellEdit: false, cellFilter: 'date:"yyyy-MM-dd"'},
            ],
            data: $scope.VO.rechargeRecord,
            onRegisterApi: function (gridApi) {
                $scope.rechargeRecordGridOption.gridApi = gridApi;
                $scope.rechargeRecordGridOption.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                $scope.rechargeRecordGridOption.gridApi.selection.on.rowSelectionChanged(
                    $scope, function (row, event) {
                        var rows = $scope.rechargeRecordGridOption.gridApi.selection.getSelectedRows();
                        if(rows.length == 1){
                            $scope.VO.rechargeRecord = rows;
                        }else{
                            $scope.VO.rechargeRecord = [];
                        }
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
                    name: 'upload_date', displayName: '上载时间', width: 100, enableCellEdit: false
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
                    $scope.dealAttachmentBGridOptions = gridApi;
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
    $scope.entityVO = "lr.insurance.vo.RechargeManageVO";
    $scope.funCode = '911';
    $scope.table_name = "t_recharge_manage";
    // $scope.billdef = "RechargeManage";
    $scope.billdef = "AgentRule";
    $scope.beanName = "rechargeManageService";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope, $rootScope);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);
})
;