/**
 * Created by WJ on 2017/10/26.
 */

app.controller('againQueryDetailCtrl', function ($rootScope, $scope, $http) {
    $scope.status = {open: true};
    $scope.initVO = function () {
        return {
            pkOperator: $rootScope.userVO,
            pkOrg: $rootScope.orgVO,
            pkDept: $rootScope.deptVO,
            operateDate: new Date().format("yyyy-MM-dd"),
            operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
        };
    };
    $scope.VO = $scope.initVO();
    $scope.funCode = "130502";
    //初始化查询
    $scope.initQUERY = function () {
        return {
            year: new Date().getFullYear(), if_forword: 'N', insurancetype: "relife"
        }
    };
    $scope.QUERY = $scope.initQUERY();
    $scope.onQuery = function () {
        $scope.queryForGrid($scope.QUERY);
    };
    $scope.onReset = function () {
        $scope.QUERY = $scope.initQUERY();
    };
    $scope.changeOpen = function () {
        $scope.status.open = !$scope.status.open;
    };

    $scope.queryForGrid = function (data) {
        layer.load(2);
        if (data.pk_dept != null) {
            data.pk_dept_str = data.pk_dept.pk;
        } else {
            data.pk_dept_str = null;
        }
        if (data.pk_corp != null) {
            data.pk_org_str = data.pk_corp.pk;
        } else {
            data.pk_org_str = null;
        }
        $http.post($scope.basePath + "againQueryDetail/queryForReport", {
            params: angular.toJson(data),
            page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
            pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
        }).success(function (response) {
            if (response.code == 200) {
                //$scope.data = response.result;
                $scope.gridOptions.data = response.result.Rows;
                $scope.gridOptions.totalItems = response.result.Total;

                // var html = $compile(response.result)($scope);
                // html.appendTo('#paymentQuery');
                /*                layer.alert("查询完成！", {skin: 'layui-layer-lan', closeBtn: 1});*/
            }
            layer.closeAll('loading');
        });
    };

    $scope.queryAllForGrid = function (data) {
        layer.load(2);
        if (!$scope.queryData) {
            $scope.queryData = $scope.gridOptions.columnDefs;
        }
        $http.post($scope.basePath + "againQueryDetail/queryAllForGrid", {
            params: angular.toJson(data),
            page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
            fields: angular.toJson($scope.queryData),
            pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
        }).success(function (response) {
            if (response.code == 200) {
                window.open($rootScope.basePath + "uploadFile/downLoadByUrl?url=" + encodeURI(encodeURI(response.downPath)));
                layer.closeAll('loading');
            }
            layer.closeAll('loading');
        });
    };

    $scope.findOne = function (pk) {
        $scope.pk = pk;
        $http.post($scope.basePath + "queryDetail2/findOne", {pk: pk}).success(function (response) {
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
            }
        });
    };


    $scope.initPage = function () {

        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;


        $scope.gridOptions = {
            rowTemplate: "<div ng-dblclick=\"grid.appScope.onRowDblClick(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>",
            data: [],
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSize: 100,
            useExternalPagination: true,
            enableColumnMoving: true,
            enableGridMenu: true,
            exporterMenuCsv: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '明细账查询.csv',
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
                // {name: 'projectkind1name', displayName: '一级业务来源名称', width: 100,},
                {name: 'projectkind4name', displayName: '四级业务来源名称', width: 100,},
                {name: 'insurancebillkind', displayName: '保单性质', width: 100,},
                {name: 'insurancemantopname', displayName: '上级保险机构名称', width: 100,},
                {name: 'chiefman', displayName: '是否出单', width: 100,},
                {name: 'insurancerate', displayName: '承保比例(%)', width: 100,},
                {name: 'insurancename1', displayName: '一级险种名称', width: 100,},
                {name: 'insurancename2', displayName: '二级险种名称', width: 100,},
                {name: 'insurancename3', displayName: '三级险种名称', width: 100,},
                {name: 'startdate', displayName: '保险起始日期', width: 100,},
                {name: 'enddate', displayName: '保险到期日期', width: 100,},
                {name: 'insurancemoney_cal', displayName: '保险金额/赔偿限额(元)', width: 100,},
                {name: 'chargerate', displayName: '保险费率(‰)', width: 100,},
                {name: 'stages', displayName: '当期期数', width: 100,},
                {name: 'receivefeeperiod', displayName: '总期数', width: 100,},
                {name: 'cm_insurancemoney', displayName: '分出保费(元)', width: 100,},
                {name: 'receivemount', displayName: '应收保费(元)', width: 100,},
                {name: 'receivemounted', displayName: '已收保费(元)', width: 100,},
                {name: 'commisionrate', displayName: '佣金比例(%)', width: 100,},
                {name: 'receivefeemount', displayName: '签单佣金(元)', width: 100,},
                {name: 'feemount', displayName: '应开票收入(元)', width: 100,},
                {name: 'receivefeemounted', displayName: '已开票收入(元)', width: 100,},
                {name: 'exclusive_tax', displayName: '已开票收入(元)(不含税)', width: 100,},
                {name: 'payperiod', displayName: '应付保费总期数', width: 100,},
                {name: 'paymount', displayName: '应付保费(元)', width: 100,},
                {name: 'paymounted', displayName: '已付保费(元)', width: 100,},
                {name: 'ifreplace', displayName: '是否代收保费', width: 100,},
                {name: 'pay', displayName: '是否全额解付', width: 100,},
                {name: 'vbillno', displayName: '立项号', width: 100,},
                {name: 'endno', displayName: '结算号', width: 100,},
                {name: 'fact_date', displayName: '结算日期', width: 100,},
                {name: 'voperatorname', displayName: '制单人姓名', width: 100,},
                {name: 'dmakedate', displayName: '制单日期', width: 100,},
                {name: 'vapprovename', displayName: '审核人姓名', width: 100,},
                {name: 'dapprovedate', displayName: '审核日期', width: 100,},
                {name: 'dual_receivemount', displayName: '已开票收入对应保费', width: 100,},
                {name: 'level1_name', displayName: '一级业务分类', width: 100,},
                {name: 'level2_name', displayName: '二级业务分类', width: 100,},
                {name: 'level3_name', displayName: '三级业务分类', width: 100,},
                {name: 'level4_name', displayName: '四级业务分类', width: 100,},
                {name: 'level5_name', displayName: '五级业务分类', width: 100,},
                {name: 'cus_province', displayName: '客户所在区域', width: 100,},
                {name: 'pro_province', displayName: '项目地址', width: 100,},
            ],
            exporterAllDataFn: function () {
                $scope.queryAllForGrid($scope.QUERY);
            },
            onRegisterApi: function (gridApi) {
                //set gridApi on scope
                $scope.gridApi = gridApi;
                //添加行头
                $scope.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                //设置默认值
                $scope.gridApi.page = $scope.gridOptions.paginationCurrentPage;
                $scope.gridApi.pageSize = $scope.gridOptions.paginationPageSize;

                //分页按钮事件
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    $scope.gridOptions.useExternalPagination = true;
                    $scope.gridApi.page = newPage;
                    $scope.gridApi.pageSize = pageSize;
                    $scope.queryForGrid($scope.QUERY);
                });

            }
        };
    };

    $scope.initPage();
});
