/**
 * Create By zhangwj
 * Create Time 2021-11-16
 */
app.controller('assessmentManagementCtrl', function ($rootScope, $scope, $sce, $http, $state, $window, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $location) {
    $scope.initData = function () {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                assessmentCode: null,
                year: new Date().format("yyyy"),
                levelPremiums: 0,
                levelPlanMoney: 0,
                levelFactMoney: 0,
                countPremiums: 0,
                countPlanMoney: 0,
                countFactMoney: 0,
                pkOperator: $rootScope.userVO,
                createTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                assessmentManagementBList: [],
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "substr(create_time,1,4)0_0eq": new Date().format("yyyy"),
            }
        };
        $scope.QUERY = $scope.initQUERY();
        //编辑页面年度选择框
        $scope.formYear = [];
        var year = parseInt(new Date().format("yyyy"));
        for (let i = 2; i >= -2; i--) {
            $scope.formYear[$scope.formYear.length] = {"id":(year+i)+"","name":(year+i)+""};
        }
        //列表界面年度选择框
        $scope.gridYear = [];
        $scope.getAllYear = function(){
            layer.load(2);
            $http.post($scope.basePath + "assessmentManagement/getAllYear").success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == 200) {
                    for (let i = 0; i < response.data.length; i++) {
                        $scope.gridYear[i] = {"id":response.data[i],"name":response.data[i]};
                    }
                }
            });
        }
        $scope.getAllYear();
    };


    $scope.initHttp = function () {

        $scope.getDetailData = function(year){
            layer.load(2);
            $http.post($scope.basePath + "assessmentManagement/getDetailData", {year: year}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == 200) {
                    angular.assignData($scope.VO, response.data);
                    if($scope.VO.pkOperator == null || $scope.VO.pkOperator == ""){
                        $scope.VO.pkOperator = $rootScope.userVO;
                        $scope.VO.createTime = new Date().format("yyyy-MM-dd HH:mm:ss");
                    }
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
            $http.post($scope.basePath + "assessmentManagement/queryForGrid", {
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
            $http.post($scope.basePath + "assessmentManagement/findOne", {id: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    if (callback) {
                        callback();
                    }
                    angular.assignData($scope.VO, response.data);
                    $scope.assessmentManagementBGridOption.data = $scope.VO.assessmentManagementBList;
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
            layer.load(2);
            $http({
                method: "POST",
                url: $rootScope.basePath + "assessmentManagement/save",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response.code == 200) {
                    angular.assignData($scope.VO, response.data);
                    $scope.assessmentManagementBGridOption.data = $scope.VO.assessmentManagementBList;
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

        $scope.$watch('VO.year', function (newVal, oldVal) {
                if (!$scope.isForm) {
                    return;
                }
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                $scope.getDetailData($scope.VO.year);
            }, true
        );

        $scope.$watch('assessmentManagementBGridOption.data', function (newVal, oldVal) {
                if (!$scope.isForm) {
                    return;
                }
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                let premiums = 0;
                let planMoney = 0;
                let factMoney = 0;
                for (let i = 0; i < $scope.assessmentManagementBGridOption.data.length; i++) {
                    premiums = premiums + parseFloat($scope.assessmentManagementBGridOption.data[i].premiums);
                    planMoney = planMoney + parseFloat($scope.assessmentManagementBGridOption.data[i].planMoney);
                    factMoney = factMoney + parseFloat($scope.assessmentManagementBGridOption.data[i].factMoney);
                }
                $scope.VO.countPremiums = premiums;
                $scope.VO.countPlanMoney = planMoney;
                $scope.VO.countFactMoney = factMoney;
            }, true
        );

    };

    $scope.initButton = function () {

        $scope.onWriteLevel = function (){

            layer.confirm('各业务单位指标值将被覆盖为设置的标准值！<br/>确认覆盖吗？', {
                    btn: ['确认', '取消'], //按钮
                    btn2: function (index, layero) {
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    for (let i = 0; i < $scope.assessmentManagementBGridOption.data.length; i++) {
                        $scope.assessmentManagementBGridOption.data[i].premiums = $scope.VO.levelPremiums;
                        $scope.assessmentManagementBGridOption.data[i].planMoney = $scope.VO.levelPlanMoney;
                        $scope.assessmentManagementBGridOption.data[i].factMoney = $scope.VO.levelFactMoney;
                    }
                    $scope.$apply();
                    layer.closeAll();
                }
            );
        }

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };

        $scope.onAdd = function () {
            angular.assignData($scope.VO, $scope.initVO());
            //获取当前年份详细的数据
            $scope.getDetailData($scope.VO.year);
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
                    $http.post($scope.basePath + "assessmentManagement/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
            exporterCsvflename: '考核指标管理.csv',
            columnDefs: [
                {name: 'assessmentCode', displayName: '考核指标管理信息编号'},
                {name: 'year', displayName: '考核年度'},
                {name: 'countPremiums', displayName: '应收保费总金额（万元）',cellFilter: 'AMOUNT_FILTER'},
                {name: 'countPlanMoney', displayName: '应开票总金额（万元）',cellFilter: 'AMOUNT_FILTER'},
                {name: 'countFactMoney', displayName: '实际开票总金额（万元）',cellFilter: 'AMOUNT_FILTER'},
                {name: 'pkOperator.name', displayName: '经办人'},
                {name: 'createTime', displayName: '制单日期', cellFilter: 'date:"yyyy-MM-dd"'},
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

        //考核指标配置
        $scope.assessmentManagementBGridOption = {
            enableCellEditOnFocus: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,//不显示选中框
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '考核指标配置.csv',
            columnDefs: [
                {name: 'orgName', displayName: '业务单位名称', enableCellEdit: false},
                {name: 'deptName', displayName: '部门名称', enableCellEdit: false},
                {name: 'premiums', displayName: '应收保费金额（万元）', enableCellEdit: true, cellFilter: 'AMOUNT_FILTER'},
                {name: 'planMoney', displayName: '应开票金额（万元）', enableCellEdit: true, cellFilter: 'AMOUNT_FILTER'},
                {name: 'factMoney', displayName: '实际开票金额（万元）', enableCellEdit: true, cellFilter: 'AMOUNT_FILTER'},
            ],
            data: $scope.VO.assessmentManagementBList,
            onRegisterApi: function (gridApi) {
                $scope.assessmentManagementBGridOption.gridApi = gridApi;
                $scope.assessmentManagementBGridOption.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                $scope.assessmentManagementBGridOption.gridApi.selection.on.rowSelectionChanged(
                    $scope, function (row, event) {

                    });
            }
        };

    };

    //实体类审批流配置
    $scope.ifEntity = "true";
    $scope.entityVO = "lr.insurance.vo.AssessmentManagementVO";
    $scope.funCode = '40401';
    $scope.table_name = "t_assessment_management";
    $scope.billdef = "AssessmentManagement";
    $scope.beanName = "assessmentManagementService";
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