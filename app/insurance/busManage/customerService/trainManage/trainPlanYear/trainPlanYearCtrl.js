/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('trainPlanYearCtrl', function ($rootScope, $scope, $http, $stateParams, $location,  uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $location) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                trainPlanYearB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                billstatus: 0,
                dr: 0,
                trainPlanYear: parseInt(new Date().getFullYear()),
                costscale: [],
                coomedium: []
            };
        };
        $scope.entityVO = 'nc.vo.busi.TrainPlanYearVO';
        $scope.funCode = '2070401';
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
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "trainPlanYear/queryForGrid", {
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
            $http.post($scope.basePath + "trainPlanYear/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
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
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            var length = $scope.trainPlanYearBGridOptions.data.length;
            for (var i = 0; i < length; i++) {
                if (!$scope.trainPlanYearBGridOptions.data[i].pkCustomer) {
                    layer.closeAll('loading');
                    return layer.alert('子表客户名称不可为空！', {skin: 'layui-layer-lan', closeBtn: 1});

                }

            }

            $http.post($rootScope.basePath + "trainPlanYear/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        angular.assignData($scope.VO, response.result);

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
        $scope.$watch('VO.trainPlanYear', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.addChildren(newVal);
            }

        }, true);
        $scope.$watch('VO.trainPlanYearB', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                var data = $rootScope.diffarray(newVal, oldVal);
                if (data && data.col == 'pkCustomer') {
                    if (data.row.pkCustomer) {
                        if (data.row.pkCustomer.pk) {
                            if (data.row.pkCustomer.totalreceivefee) {
                                data.row.insureCommission = data.row.pkCustomer.totalreceivefee;
                            } else {
                                data.row.insureCommission = '';
                            }
                            if (data.row.pkCustomer.train_number) {
                                data.row.trainNumber = data.row.pkCustomer.train_number;
                            } else {
                                data.row.trainNumber = 0;
                            }
                        }
                    } else {
                        data.row.insureCommission = 0;
                        data.row.trainNumber = 0;
                    }
                }
            }

        }, true);
    };

    $scope.initButton = function () {
        /**
         * 打印
         * @returns {*}
         */
        $scope.onPrint = function () {
            $scope.raq = "trainPlanYear";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $http.post($rootScope.basePath + "trainPlanYear/print", {
                data: angular.toJson(rows[0]),
                raq: $scope.raq,
                type: "PDF"
            }).success(function (response) {
                layer.closeAll('loading');
                // if(fun) fun(response);
                if (response.code == 200) {
                    window.open(getURL(response.queryPath));
                }
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
            $scope.isBack = true;

            $scope.trainPlanYearBGridOptions.data = [];
            angular.assignData($scope.VO, $scope.initVO());
            $scope.initView();
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

        /* $scope.onCard = function () {
             var rows = $scope.gridApi.selection.getSelectedRows();
             if (!rows || rows.length != 1)
                 return layer.alert("请选择一条数据进行查看!", {
                     skin: 'layui-layer-lan',
                     closeBtn: 1
                 });
             $scope.findOne(rows[0].id);
             $scope.isBack = true;
             $scope.isGrid = false;
             $scope.isCard = true;
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
                    $http.post($scope.basePath + "trainPlanYear/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
            if ($scope.isClear) {
                $scope.VO = $scope.initVO();
                $scope.trainPlanYearBGridOptions.data = [];
            }
            $scope.isDisabled = true;
            $scope.isEdit = false;
            $scope.isBack = false;
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
                    $scope.VO.trainPlanYearName = $rootScope.returnSelectName($scope.VO.trainPlanYear, "BUSIYEAR");
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
        $scope.addChildren = function (year) {
            layer.load(2);
            $scope.trainPlanYearBGridOptions.data = [];
            $http.post($scope.basePath + "trainPlanYear/addChildren", {year: year}).success(function (response) {
                if (response && response.code == "200") {
                    $scope.trainPlanYearBGridOptions.data.length = 0;
                    for (var i = 0; i < response.result.length; i++) {
                        var child = {};
                        var obj = response.result[i];
                        child.pkCustomer = obj.pkCustomer;
                        child.trainNumber = obj.train_number;
                        child.insureCommission = obj.totalreceivefee;
                        $scope.trainPlanYearBGridOptions.data.push(child);
                    }
                }
            });
        }
        /**
         * 初始化参照
         */
        $scope.initView = function () {
            //初始化字表
            $scope.addChildren();
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
        $scope.htmlPath = 'view/report/printReportBill.html';
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;
        $scope.isClear = false;
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
            exporterCsvFilename: '年度客户培训计划.csv',
            columnDefs: [
                {name: 'serialNo', displayName: '流水号', width: 100,},
                {name: 'trainPlanYear', displayName: '年度', width: 100, cellFilter: 'SELECT_BUSIYEAR'},
                {name: 'sumTotalAmount', displayName: '年度培训预算总金额', width: 100,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '业务部门', width: 100,},
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'operateDate', displayName: '制单日期', width: 100,},
                {name: 'operateTime', displayName: '制单时间', width: 100,},
                {name: 'pkChecker.name', displayName: '审批人', width: 100,},
                {name: 'checkDate', displayName: '审批日期', width: 100,},
                {name: 'checkTime', displayName: '复核时间', width: 100,},
                {name: 'vapprovenote', displayName: '复核意见', width: 100,},
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

        $scope.selectTabName = 'trainPlanYearBGridOptions';
        $scope.trainPlanYearBGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'pkCustomer.name', displayName: '客户名称', width: 100, url: 'customerRef/queryForGrid'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'pkCustomer'

                },
                {
                    name: 'insureCommission',
                    displayName: '上年签单收入',
                    width: 100,
                    cellFilter: 'number:2',
                    enableCellEdit: false


                },
                {
                    name: 'trainNumber', displayName: '上年培训总人数', width: 100, enableCellEdit: false


                },
                {
                    name: 'plan1DateType', displayName: '第一次培训月度', width: 100, cellFilter: 'SELECT_MARMONTH'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.MARMONTH
                },
                {
                    name: 'plan2DateType', displayName: '第二次培训月度', width: 100, cellFilter: 'SELECT_MARMONTH'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.MARMONTH
                },
                {
                    name: 'plan3DateType', displayName: '第三次培训月度', width: 100, cellFilter: 'SELECT_MARMONTH'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.MARMONTH
                },
                {
                    name: 'plan4DateType', displayName: '第四次培训月度', width: 100, cellFilter: 'SELECT_MARMONTH'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.MARMONTH
                },
                {
                    name: 'budgetTotalAmount', displayName: '预算总金额', width: 100, cellFilter: 'number:2'


                },
            ],
            data: $scope.VO.trainPlanYearB,
            onRegisterApi: function (gridApi) {
                $scope.trainPlanYearBGridOptions.gridApi = gridApi;
                gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                    var array = $scope.trainPlanYearBGridOptions.data;
                    $scope.VO.sumTotalAmount = 0;
                    for (var i = 0; i < array.length; i++) {
                        if (array[i].budgetTotalAmount) {
                            $scope.VO.sumTotalAmount += Number(array[i].budgetTotalAmount);
                        }
                    }
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
    };
    $scope.table_name = "lr_train_plan_year";
    $scope.billdef = "TrainPlanYear";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initworkflow($scope, $http, ngDialog);
    $scope.onQuery();
});
app.controller('trainPlanYearBGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('printCtrl', function ($scope, $rootScope, $http, ngDialog, FileUploader, ngVerify, $compile, $timeout) {

    $scope.queryPrint = function () {
        $http.post($scope.basePath + "trainPlanYear/print", {data: angular.toJson($scope.VO)}).success(function (response) {
            layer.closeAll('loading');
            if (response.code == 200) {
                var html = $compile(response.result)($scope);
                html.appendTo('#printHtml');
                // $scope.$parent.confirm(response);
                // layer.msg(response.msg);

            }

        });
    }
    $scope.queryPrint();
    $scope.print = function () {
        $scope.print = function () {

            //获取当前页的html代码
            var bodyhtml = window.document.body.innerHTML;
            //设置打印开始区域、结束区域
            var startFlag = "<!--startprint-->";
            var endFlag = "<!--endprint-->";
            // 要打印的部分
            var printhtml = bodyhtml.substring(bodyhtml.indexOf(startFlag),
                bodyhtml.indexOf(endFlag));
            // 生成并打印ifrme
            var f = document.getElementById('printf');
            f.contentDocument.write(printhtml);
            f.contentDocument.close();
            f.contentWindow.print();
        }
    }
    $scope.onPrint = function () {
        $scope.print();
    }
});