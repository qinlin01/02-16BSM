app.controller('sum_def12Ctrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $location, activitiModal) {

    $scope.initData = function (data) {
        $scope.isGrid = true;
        $scope.isForm = false;
        $scope.form = false;
        $scope.status = {open: true};
        $scope.queryTotal = false;
        $scope.isEdit = false;
        // $scope.onCancel = false;
        //初始化界面按钮
        $scope.btn = {
            btnUpdate: false,
            btnSubmit: false,
            btnCheck: false,
            btnCheckno: false,
            btnBack: false
        };
        //初始化主表信息
        //ACCOUNT_PLAN_FLAG 1 月度计划 2 应收账款     sum_def1 股东合计   sum_def2 市场合计
        $scope.initVO = function () {
            return {
                id: '',
                serialNo: '',
                recordYear: '',
                recordType: 6,//互联网业务应收账款
                recordMonth: '',
                accountPlanFlag: 2,
                sumDef1: 0,
                sumDef2: 0,
                sumDef3: 0,
                sumDef4: 0,
                sumDef5: 0,
                sumDef6: 0,
                sumDef7: 0,
                sumDef8: 0,
                sumDef9: 0,
                sumDef10: 0,
                sumDef11: 0,
                sumDef12: 0,
                sumDef13: 0,
                sumDef14: 0,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                pkOperator: $rootScope.userVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                pkAuditor: '',
                auditDate: '',
                auditTime: '',
                pkChecker: '',
                check_date: '',
                vapprovenote: '',
                checkTime: '',
                ts: '',
                billstatus: 31,
                dr: 0,
                monthRecordB: []
            }
        };
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.entityVO = 'nc.vo.busi.MonthRecordVO';
        //获取当前时间
        var nowDate = new Date();
        var year = nowDate.getFullYear();
        var month = nowDate.getMonth();
        //初始化主表信息
        $scope.VO.recordYear = year;
        $scope.VO.recordMonth = month + 2;

        //初始化子表信息
        //列
        var columnDefsDtata = [
            {name: 'insuranceName', displayName: '险种', enableCellEdit: false},
            {name: 'sumDef1', displayName: '合计（万元）', type: 'number', enableCellEdit: false},
            {name: 'verf31', displayName: '生活服务', type: 'number', enableCellEdit: true},
            {name: 'verf32', displayName: '金融服务', type: 'number', enableCellEdit: true},
            {name: 'verf33', displayName: '理财型保险', type: 'number', enableCellEdit: true},
            {name: 'verf34', displayName: '保障型保险', type: 'number', enableCellEdit: true},
            {name: 'verf35', displayName: '企业保险服务', type: 'number', enableCellEdit: true},
            {name: 'verf36', displayName: '外部合作业务', type: 'number', enableCellEdit: true},
            {name: 'verf30', displayName: '国网系统合作业务', type: 'number', enableCellEdit: true}
        ];
        //险种
        var insuranceType = [
            {
                id: 0,
                insuranceName: "业务收入",
                sumDef1: 0,
                verf31: 0,
                verf32: 0,
                verf33: 0,
                verf34: 0,
                verf35: 0,
                verf36: 0,
                verf30: 0
            },
            {
                id: 1,
                insuranceName: "合计（万元）",
                sumDef1: 0,
                verf31: 0,
                verf32: 0,
                verf33: 0,
                verf34: 0,
                verf35: 0,
                verf36: 0,
                verf30: 0
            }];
        $scope.childgridOptions = {
            enablePagination: false,//不分页
            enablePaginationControls: false,//不使用底部的分页
            enableRowHeaderSelection: false,//不显示选中框
            enableCellEditOnFocus: true,
            enableCellEdit: true,
            columnDefs: columnDefsDtata,//列名
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            data: $scope.VO.monthRecordB,//数据
            //编辑事件begin
            onRegisterApi: function (gridApi) {
                if (!$scope.isEdit) {
                    return;
                }
                $scope.childgridOptions.gridApi = gridApi;
                $scope.childgridOptions.gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                    //修改列总计

                    $scope.childgridOptions.data[1].verf31 = $scope.childgridOptions.data[0].verf31.toFixed(2);
                    $scope.childgridOptions.data[1].verf32 = $scope.childgridOptions.data[0].verf32.toFixed(2);
                    $scope.childgridOptions.data[1].verf33 = $scope.childgridOptions.data[0].verf33.toFixed(2);
                    $scope.childgridOptions.data[1].verf34 = $scope.childgridOptions.data[0].verf34.toFixed(2);
                    $scope.childgridOptions.data[1].verf35 = $scope.childgridOptions.data[0].verf35.toFixed(2);
                    $scope.childgridOptions.data[1].verf36 = $scope.childgridOptions.data[0].verf36.toFixed(2);
                    $scope.childgridOptions.data[1].verf30 = $scope.childgridOptions.data[0].verf30.toFixed(2);

                    //修改第13行的总计
                    var sumDef1RowNum = eval($scope.childgridOptions.data[1].verf31) + eval($scope.childgridOptions.data[1].verf32) + eval($scope.childgridOptions.data[1].verf33) + eval($scope.childgridOptions.data[1].verf34) +
                        eval($scope.childgridOptions.data[1].verf35) + eval($scope.childgridOptions.data[1].verf36) + eval($scope.childgridOptions.data[1].verf30);
                    $scope.childgridOptions.data[1].sumDef1 = eval(sumDef1RowNum).toFixed(2);
                    //修改行总计
                    $scope.childgridOptions.data[0].sumDef1 = eval(sumDef1RowNum).toFixed(2);
                    //修改股东合计
                    //               国网直属单位及下属企业（不含鲁能集团、国能生物）verf4
                    //               网省电力公司直属非供电企业                    verf7
                    //               国网统保单位（不含西藏电力及下属单位）         verf18
                    //               国网西藏电力有限公司及下属单位                verf19
                    //               网省电力公司直属供电单位及下属企业            verf20
                    var sum_def1 = 0;
                    $scope.VO.sumDef1 = parseFloat(sum_def1.toFixed(2));
                    //修改市场合计   除去股东都是市场合计
                    $scope.VO.sumDef2 = eval(sumDef1RowNum).toFixed(2);
                });
            }
            //编辑事件over
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
                    //$scope.childgridOptions.data = $scope.VO.child;
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
                }
            });
        };
        //初始化模糊查询
        $scope.search = {
            ACCOUNT_PLAN_FLAG: 2,
            record_type: 6,
            DR: 0
        };
        $scope.QUERY = $scope.search;
    };
    $scope.initPage = function () {
        //初始化列表
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
            exporterCsvFilename: '互联网业务应收账款.csv',
            columnDefs: [
                {name: 'serialNo', displayName: '流水号', width: 100,},
                {name: 'recordYear', displayName: '年', width: 100,},
                {name: 'recordMonth', displayName: '月', width: 100,},
                {name: 'sumDef1', displayName: '股东合计(万元)', width: 100,},
                {name: 'sumDef2', displayName: '市场合计(万元)', width: 100,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkOperator.name', displayName: '操作人', width: 100,},
                {name: 'operateDate', displayName: '操作日期', width: 100,},
                {name: 'operateTime', displayName: '操作时间', width: 100,},
                {name: 'pkChecker.name', displayName: '审核人', width: 100,},
                {name: 'auditDate', displayName: '审核日期', width: 100,},
                {name: 'finallyOpinion', displayName: '审核意见', width: 100,},
                {name: 'auditTime', displayName: '审核时间', width: 100,},
                //{name: 'ts', displayName: '时间戳', width: 100,}
            ],
            data: []
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
                $scope.queryForGrid($scope.search);
            });

            $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (rows.length == 1) {
                    $scope.chilbTable = true;
                    $scope.ChildVO = $scope.initVO();
                    angular.assignData($scope.ChildVO, row.entity);
                    $scope.childgridOptions.data = $scope.ChildVO.monthRecordB;
                    //分按钮权限
                    var billstatus = rows[0].billstatus;
                    if (billstatus == 0 || billstatus == 46 || billstatus == 2) {
                        $scope.btn.btnUpdate = true;
                        $scope.btn.btnSubmit = true;
                    }
                    if (billstatus == 40) {
                        $scope.btn.btnCheck = true;
                        $scope.btn.btnCheckno = true;
                    }
                    if (billstatus == 1) {
                        $scope.btn.btnBack = true;
                    }
                    $scope.VO = rows[0];
                } else {
                    $scope.btn.btnUpdate = false;
                    $scope.btn.btnSubmit = false;
                    $scope.btn.btnCheck = false;
                    $scope.btn.btnCheckno = false;
                    $scope.btn.btnBack = false;
                    $scope.childgridOptions.data = insuranceType;
                }
            });
        };

    }
    $scope.onReset = function () {
        $scope.initData();
    };

    $scope.initHttp = function () {

        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "sumDef/queryForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response.code == 200) {
                    if (!$scope.query) {
                        $scope.query = $scope.gridOptions.columnDefs;
                    }
                    $scope.VO = response.result.Rows;
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            });
        };

        $scope.onRowDblClick = function (item) {
            if (item && item.id) {
                $scope.onCard(item.id);
            }
        };

        //保存
        $scope.onSaveVO = function () {
            var saveDate = new Date();
            if ($scope.VO.id == null || $scope.VO.id == '') {
                $scope.VO.operateDate = saveDate.getFullYear() + "-" + (saveDate.getMonth() + 1) + "-" + saveDate.getDate();
                $scope.VO.operateTime = (saveDate.getHours()) + ":" + (saveDate.getMinutes() + 1) + ":" + (saveDate.getSeconds() + 1);
            }
            $scope.VO.ts = saveDate.toLocaleDateString();
            layer.load(2);
            $http.post($rootScope.basePath + "sumDef/save", {
                data: angular.toJson($scope.VO),
                childData: angular.toJson($scope.childgridOptions.data)
            })
                .success(function (response) {
                    //将后台返回的id赋值给VO参数
                    $scope.VO.id=response.result.id;
                    if (response && response.code == 200) {
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        $scope.isSubEdit = false;
                        angular.assignData($scope.VO, response.result);
                    }
                });
        };

        //修改状态
        $scope.changeBillstatus = function (rows, status) {
            var saveDate = new Date();
            $scope.VO.ts = saveDate.toLocaleDateString();
            $scope.VO.billstatus = status;
            $scope.VO.sumDef1 = rows.sumDef1;
            $scope.VO.sumDef2 = rows.sumDef2;
            $scope.VO.recordMonth = rows.recordMonth;
            $scope.VO.recordYear = rows.recordYear;
            $scope.VO.serialNo = rows.serialNo;
            $scope.VO.operateDate = rows.operateDate;
            $scope.VO.operateTime = rows.operateTime;
            $scope.VO.id = rows.id;
            $scope.childgridOptions.data = rows.monthRecordB;
            layer.load(2);
            $http.post($rootScope.basePath + "sumDef/save", {
                data: angular.toJson($scope.VO),
                childData: angular.toJson($scope.childgridOptions.data)
            })
                .success(function (response) {
                    if (response && response.code == 200) {
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        $scope.onBack();
                        $scope.queryForGrid($scope.search);
                    }
                });
        }
    }

    $scope.initFunction = function () {

        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "sumDef/findOne", {pk: pk}).success(function (response) {
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
                }
            });
        };

        //增加按钮
        $scope.onAdd = function () {
            $scope.isClear = true;
            $scope.VO = $scope.initVO();
            $scope.isDisabled = false;
            var insuranceType = [
                {
                    id: 1,
                    insuranceName: "咨询业务",
                    sumDef1: 0,
                    verf31: 0,
                    verf32: 0,
                    verf33: 0,
                    verf34: 0,
                    verf35: 0,
                    verf36: 0,
                    verf30: 0
                },
                {
                    id: 2,
                    insuranceName: "合计（万元）",
                    sumDef1: 0,
                    verf31: 0,
                    verf32: 0,
                    verf33: 0,
                    verf34: 0,
                    verf35: 0,
                    verf36: 0,
                    verf30: 0
                }];
            $scope.isGrid = false;
            $scope.isForm = true;
            $scope.form = true;
            $scope.isEdit = true;
            // $scope.onCancel = false;
            //获取当前时间
            var nowDate = new Date();
            var year = nowDate.getFullYear();
            var month = nowDate.getMonth() + 1;
            //初始化主表信息
            if (month == 12) {
                year = year + 1;
                month = 1;
                $scope.VO.recordYear = year
                $scope.VO.recordMonth = month
            } else {
                $scope.VO.recordYear = year
                $scope.VO.recordMonth = month + 1;
            }
            $scope.VO.sumDef1 = 0;
            $scope.VO.sumDef2 = 0;
            $scope.VO.serialNo = '';
            $scope.childgridOptions.data = insuranceType;
        }
        //删除
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
                    $http.post($scope.basePath + "sumDef/delete", {ids: angular.toJson(ids)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.queryForGrid($scope.search);
                            layer.msg('删除成功!', {
                                icon: 1
                            });
                        }

                    });
                }
            );
        };
        //修改
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            var rows = $scope.gridApi.selection.getSelectedRows();
            $scope.isGrid = false;
            $scope.isForm = true;
            $scope.form = true;
            $scope.isEdit = true;
            $scope.childFlag = true;
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
        $scope.onChangeStatus = function (status) {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请先选择一条数据!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            $scope.changeBillstatus(rows[0], status);
        }
        //返回
        $scope.onBack = function () {
            $scope.isGrid = true;
            $scope.isForm = false;
            $scope.form = false;
            $scope.isCard = false;
            $scope.isEdit = false;
            $scope.queryForGrid($scope.search);
        }
        //取消
        $scope.onCancel = function () {
            if ($scope.isClear) {
                $scope.VO = $scope.initVO();
                $scope.childgridOptions.data = [];
            }
            $scope.isDisabled = true;
            $scope.isEdit = false;
            $scope.isreplace = true;
            $scope.isBack = false;

        }
        //查询条件开启关闭
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        //查询
        $scope.onSearch = function () {
            $scope.queryForGrid($scope.search);
        }
        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
    }
    $scope.table_name = "busi_month_record";
    $scope.billdef = "MonthReport";
    $scope.beanName ="insurance.SumDefServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initPage();
    $scope.initFunction();

    initworkflow($scope, $http, ngDialog);
});