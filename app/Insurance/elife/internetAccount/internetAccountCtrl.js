app.controller('internetAccountCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $location) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                dr: 0
            }
        };

        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "year": parseInt(new Date().format("yyyy")),
                "system_type" : "yg",
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
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.basePath + "detail/queryAllForGrid", {
                params: angular.toJson(data),
                fields: angular.toJson($scope.queryData),
                fileName: "台账信息",
            }).success(function (response) {
                if (response.code == 200) {
                    window.open($rootScope.basePath + "uploadFile/downLoadByUrl?url=" + encodeURI(encodeURI(response.downPath)));
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
            $http.post($scope.basePath + "detail/queryForGrid", {
                params: angular.toJson(data),
                current: $scope.gridApi.page ? $scope.gridApi.page : 1,
                size: $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100,
            }).success(function (response) {
                $scope.gridOptions.data = response.data.records;
                $scope.gridOptions.totalItems = response.data.total;
                layer.closeAll('loading');
            });
        };

        //同步风险台帐
        $scope.onGetFxzxDetail = function () {
            layer.load(2);
            $http.post($scope.basePath + "detail/getFxzxDetail").success(function (response) {
                if (response.code == 200) {
                    layer.alert("同步成功！");
                }
                layer.closeAll('loading');
            });
        };

    };

    $scope.initFunction = function () {
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
    };


    $scope.initButton = function () {

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

        /**
         * 初始化参照
         */
        $scope.initView = function () {

        };

    };


    $scope.initPage = function () {
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
        $scope.isreplace = true;
        $scope.queryShow = true;
        //控制附件上传和下载
        $scope.upOrDown = true;
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
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '互联网台账信息.csv',
            columnDefs: [
                {name: 'insuranceinfono', displayName: '保单信息编号', width: 100,},
                {name: 'month', displayName: '月份', width: 100,},
                {name: 'insuranceno', displayName: '保单号', width: 100, cellFilter: 'CSV_FILTER'},
                {name: 'insurancecheckno', displayName: '批单号', width: 100,},
                {name: 'deptname', displayName: '保单建立部门', width: 100,},
                {name: 'projectname', displayName: '业务/项目名称', width: 100,},
                {name: 'estimatetopname', displayName: '上级客户', width: 100,},
                {name: 'estimatename', displayName: '投保人', width: 100,},
                {name: 'estimatenum', displayName: '投保人数/车辆台数', width: 100,},
                {name: 'insurancebillkind', displayName: '保单性质', width: 100,},
                {name: 'insurancemantopname', displayName: '上级保险机构名称', width: 100,},
                {name: 'chiefman', displayName: '是否出单', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'insurancerate', displayName: '承保比例(%)', width: 100,},
                {name: 'insurancename1', displayName: '一级险种名称', width: 100,},
                {name: 'insurancename2', displayName: '二级险种名称', width: 100,},
                {name: 'insurancename3', displayName: '三级险种名称', width: 100,},
                {name: 'startdate', displayName: '保险起始日期', width: 100,},
                {name: 'enddate', displayName: '保险到期日期', width: 100,},
                {name: 'insurancemoneyCal', displayName: '保险金额/赔偿限额(元)', width: 100, cellFilter: 'AMOUNT_FILTER'},
                {name: 'chargerate', displayName: '保险费率(‰)', width: 100,},
                {name: 'stages', displayName: '当期期数', width: 100,},
                {name: 'receivefeeperiod', displayName: '总期数', width: 100,},
                {name: 'cmInsurancemoney', displayName: '签单保费(元)', width: 100, cellFilter: 'AMOUNT_FILTER'},
                {name: 'receivemount', displayName: '应收保费(元)', width: 100, cellFilter: 'AMOUNT_FILTER'},
                {name: 'receivemounted', displayName: '已收保费(元)', width: 100, cellFilter: 'AMOUNT_FILTER'},
                {name: 'unreceivemount', displayName: '未收保费(元)', width: 100, cellFilter: 'AMOUNT_FILTER'},
                {name: 'commisionrate', displayName: '佣金比例(%)', width: 100,},
                {name: 'receivefeemount', displayName: '签单佣金(元)', width: 100, cellFilter: 'AMOUNT_FILTER'},
                {name: 'feemount', displayName: '应收佣金(元)', width: 100, cellFilter: 'AMOUNT_FILTER'},
                {name: 'receivefeemounted', displayName: '已收佣金(元)', width: 100, cellFilter: 'AMOUNT_FILTER'},
                {name: 'exclusiveTax', displayName: '已收佣金(元)(不含税)', width: 100, cellFilter: 'AMOUNT_FILTER'},
                {name: 'unreceivefeemount', displayName: '未收佣金(元)', width: 100, cellFilter: 'AMOUNT_FILTER'},
                {name: 'payperiod', displayName: '应付保费总期数', width: 100,},
                {name: 'paymount', displayName: '应付保费(元)', width: 100, cellFilter: 'AMOUNT_FILTER'},
                {name: 'paymounted', displayName: '已付保费(元)', width: 100, cellFilter: 'AMOUNT_FILTER'},
                {name: 'unpaymoun', displayName: '未付保费(元)', width: 100, cellFilter: 'AMOUNT_FILTER'},
                {name: 'ifreplace', displayName: '是否代收保费', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'pay', displayName: '是否全额解付', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'vbillno', displayName: '立项号', width: 100,},
                {name: 'endno', displayName: '结算号', width: 100,},
                {name: 'factDate', displayName: '结算日期', width: 100,},
                {name: 'costName', displayName: '成本中心', width: 100,},
                {name: 'voperatorname', displayName: '制单人姓名', width: 100,},
                {name: 'dmakedate', displayName: '制单日期', width: 100,},
                {name: 'vapprovename', displayName: '审核人姓名', width: 100,},
                {name: 'dapprovedate', displayName: '审核日期', width: 100,},
                {name: 'accountDate', displayName: '实际到款日期', width: 100,},
                {name: 'dualReceivemount', displayName: '已收佣金对应保费', width: 100, cellFilter: 'AMOUNT_FILTER'},
                {name: 'constomerproname', displayName: '客户产权关系', width: 100,},
                {name: 'level1Name', displayName: '一级业务分类', width: 100,},
                {name: 'level2Name', displayName: '二级业务分类', width: 100,},
                {name: 'level3Name', displayName: '三级业务分类', width: 100,},
                {name: 'level4Name', displayName: '四级业务分类', width: 100,},
                {name: 'level5Name', displayName: '五级业务分类', width: 100,},
                {name: 'projectkind4name', displayName: '档位', width: 100,},
                {name: 'cusProvince', displayName: '客户所在区域', width: 100,},
                {name: 'proProvince', displayName: '项目地址', width: 100,},
                {name: 'product', displayName: '产品类型', width: 100,},
                {name: 'customertype', displayName: '客户类型', width: 100,},
                {name: 'channeltype', displayName: '渠道', width: 100,},
            ],
            data: [],
            exporterAllDataFn: function () {
                $scope.queryAllForGrid($scope.QUERY);
            },
        };
        $scope.gridOptions.onRegisterApi = function (gridApi) {
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
        };
    };

    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initButton();
    $scope.initPage();
});
