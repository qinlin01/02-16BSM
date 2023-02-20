app.controller('customerPropertyRightCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $location, activitiModal, workFlowDialog) {
                $scope.initData = function (data) {
                        $scope.status = {open: true};
                $scope.initVO = function () {
                        return {
                                pkOperator: $rootScope.userVO,
                                pkOrg: $rootScope.orgVO,
                                pkDept: $rootScope.deptVO,
                                operateDate: new Date().format("yyyy-MM-dd"),
                                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                                isContinue: 0,
                                dr: 0,
                        };
                };
                //主表数据
                $scope.VO = $scope.initVO();
                //初始化查询
                $scope.initQUERY = function () {
                      return {
                      }
                };
                $scope.QUERY = $scope.initQUERY();
        };

        $scope.initHttp = function () {
                //导出全部
                $scope.queryAllForGrid = function (data, fun, isPrint, etype) {
                        layer.load(2);
                        if (!$scope.queryData) {
                                $scope.queryData = $scope.gridOptions.columnDefs;
                        }
                        return $http.post($rootScope.basePath + "customerPropertyRight/queryAllForGrid", {
                                params: angular.toJson(data),
                                fileName : "客户产权关系管理",
                                // current: $scope.gridApi.page ? $scope.gridApi.page : 1,
                                // size: $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100,
                                fields: angular.toJson($scope.queryData),
                                isPrint: isPrint,
                                etype: 0,//0：excel 1：pdf
                        })
                            .success(function (response) {
                                    let data = angular.fromJson(response);
                                    if (fun) fun(data);
                                    if (isPrint) {
                                            window.open(getURL(data.queryPath));
                                    } else {
                                            window.open($rootScope.basePath + "uploadFile/downLoadByUrl?url=" + encodeURI(encodeURI(data.downPath)));
                                    }
                                    layer.closeAll('loading');
                            }).error(function () {
                                    layer.closeAll('loading');
                            });
                };
                //列表查询
                $scope.queryForGrid = function (data) {
                        $http.post($scope.basePath + "customerPropertyRight/queryForGrid", {
                                params: angular.toJson(data),
                                current: $scope.gridApi.page ? $scope.gridApi.page : 1,
                                size: $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100,
                        }).success(function (response) {
                                $scope.gridOptions.data = response.data.records;
                                $scope.gridOptions.totalItems = response.data.total;
                                layer.closeAll('loading');
                        });
                };

                //findone
                $scope.findOne = function (pk) {
                        $scope.pk = pk;
                        $http.post($scope.basePath + "customerPropertyRight/findOne", {id: pk}).success(function (response) {
                                layer.closeAll('loading');
                                if (response && response.code == "200") {
                                        angular.assignData($scope.VO, response.data);
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
                //增加=================================
                $scope.onSaveVO = function () {
                        layer.load(2);
                        $http({
                                method: "POST",
                                url: $rootScope.basePath + "customerPropertyRight/save",
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
                //删除=================================================
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
                                    $http.post($scope.basePath + "customerPropertyRight/delete", {ids: angular.toJson(ids)}).success(function (response) {
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

        };
        $scope.initButton = function () {
                /**
                 *过滤查询
                 */
                $scope.onQuery = function () {
                        $scope.queryForGrid($scope.QUERY);
                };
                /**
                 *重置
                 */
                $scope.onReset = function () {
                        $scope.QUERY = $scope.initQUERY();
                        $scope.QUERY.id = null;
                };
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
                /**
                 * 复制
                 */
                $scope.onCopy = function () {
                        //  控制字表按钮的显示
                        if ($scope.isGrid) {
                                var rows = $scope.gridApi.selection.getSelectedRows();
                                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行复制!", {
                                        skin: 'layui-layer-lan',
                                        closeBtn: 1
                                });
                                $scope.VO.id=null;
                                $scope.VO.customer=null;
                                // $scope.findOne(id);
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

                        $scope.isGrid = false;
                        $scope.isCard = true;
                        $scope.isForm = false;
                };
                //增加
                $scope.onAdd = function () {
                        $scope.isIF=0;
                        $scope.isClear = true;
                        $scope.isForm = true;
                        $scope.isGrid = false;
                        $scope.isEdit = true;
                        $scope.isDisabled = false;
                        $scope.tabDisabled = true;
                        $scope.isBack = true;
                        $scope.initView();
                        angular.assignData($scope.VO, $scope.initVO());
                        $rootScope.onAddCheck($scope);
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
                                $scope.isGrid = false;
                                $scope.isCard = false;
                                $scope.isForm = true;

                        }
                };
                /**
                 * 取消功能
                 */
                $scope.onCancel = function () {
                        $scope.isGrid = true;
                        $scope.isCard = false;
                        $scope.isForm = false;
                };
                /**
                 * 返回
                 */
                $scope.onBack = function () {
                        $scope.isGrid = true;
                        $scope.isEdit = false;
                        $scope.isCard = false;
                        $scope.isDisabled = true;
                        //阻止页面渲染
                        $scope.isForm = false;
                        $scope.queryForGrid($scope.QUERY);
                };

                /**
                 * 初始化参照
                 */
                $scope.initView = function () {

                };
        };

        $scope.initPage = function () {
                $scope.isForm = false;
                $scope.card = false;
                $scope.isClear = false;
                $scope.isGrid = true;
                $scope.isCard = false;
                $scope.isEdit = false;
                $scope.isDisabled = true;
                $scope.queryShow = true;
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
                        exporterCsvFilename: '客户产权关系.csv',
                        columnDefs: [
                                {name: 'customerName', displayName: '客户名称', width: 300,},
                                {name: 'customerPr', displayName: '客户产权关系', width: 200,},
                                {name: 'busiTypeName', displayName: '业务分类', width: 400},
                                {name: 'pkCorp', displayName: '所属子公司', width: 200,},
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
        };
        $scope.selectTab = function (name) {
                $scope.selectTabName = name.toString();
                if ($scope.selectTabName == 'dealAttachmentBGridOptions') {
                        $scope.upOrDown = true;
                } else {
                        $scope.upOrDown = false;
                }
        };
        $scope.table_name = "t_config_customer_busi_type";
        $scope.billdef = "AgencyCustomer";
        $scope.beanName = "insurance.ExamineServiceImpl";
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