app.controller('sum2Ctrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog) {

    $scope.initData = function () {
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
                recordType: 11, //非股东业务业务应收账款
                recordMonth: '',
                accountPlanFlag: 1,
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
            {name: 'sumDef2', displayName: '电网业务部小计', type: 'number', enableCellEdit: false},
            {name: 'verf3', displayName: '内蒙古电力公司', type: 'number', enableCellEdit: $scope.isOther},
            {name: 'verf5', displayName: '内蒙古电力公司下属单位', type: 'number', enableCellEdit: $scope.isOther},
            {name: 'verf6', displayName: '其他地方电网企业', type: 'number', enableCellEdit: $scope.isOther},
            {name: 'verf7', displayName: '国网省公司下属上市公司', type: 'number', enableCellEdit: $scope.isOther},
            {name: 'sumDef3', displayName: '市场业务部小计', type: 'number', enableCellEdit: false},
            {name: 'verf9', displayName: '国网直属单位下属上市公司', type: 'number', enableCellEdit: $scope.isOther},
            {name: 'verf10', displayName: '国网系统集体企业', type: 'number', enableCellEdit: $scope.isOther},
            {name: 'verf11', displayName: '电源、电建企业', type: 'number', enableCellEdit: $scope.isOther},
            {name: 'verf12', displayName: '保险同业咨询', type: 'number', enableCellEdit: $scope.isOther},
            {name: 'verf13', displayName: '其他市场企业', type: 'number', enableCellEdit: $scope.isOther},
            {name: 'sumDef4', displayName: '个险业务部小计', type: 'number', enableCellEdit: false},
            // {name: 'verf15', displayName: '中国能源集团及下属单位', type: 'number', enableCellEdit: false},
            {name: 'verf16', displayName: '个人代理业务', type: 'number', enableCellEdit: $scope.isOther},
            {name: 'verf17', displayName: '直付理赔业务', type: 'number', enableCellEdit: $scope.isOther},
            {name: 'verf18', displayName: '其他个险业务', type: 'number', enableCellEdit: $scope.isOther},
            {name: 'sumDef5', displayName: '新能源业务部小计', type: 'number', enableCellEdit: false},
            {name: 'verf20', displayName: '新能源企业', type: 'number', enableCellEdit: $scope.isOther},
            {name: 'sumDef6', displayName: '国际业务部（再保险部）小计', type: 'number', enableCellEdit: false},
            {name: 'verf22', displayName: '国际业务', type: 'number', enableCellEdit: $scope.isgj},
            {name: 'verf23', displayName: '电网资产再保险业务', type: 'number', enableCellEdit: $scope.isgj},
            {name: 'verf24', displayName: '其他再保险业务', type: 'number', enableCellEdit: $scope.isgj},
            {name: 'sumDef7', displayName: '互联网业务部小计', type: 'number', enableCellEdit: false},
            {name: 'verf26', displayName: '个人直营平台业务', type: 'number', enableCellEdit: $scope.isWeb},
            {name: 'verf27', displayName: '个人合作平台业务', type: 'number', enableCellEdit: $scope.isWeb},
            {name: 'verf28', displayName: '企业互联网保险业务（直营平台）', type: 'number', enableCellEdit: $scope.isWeb},
            {name: 'verf29', displayName: '企业互联网保险业务（合作平台）', type: 'number', enableCellEdit: $scope.isWeb}
        ];

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
            data : $scope.VO.monthRecordB,
            //编辑事件begin
            onRegisterApi: function (gridApi) {
                if (!$scope.isEdit) {
                    return;
                }
                $scope.childgridOptions.gridApi = gridApi;
                $scope.childgridOptions.gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {

                    // layer.alert(str, {skin: 'layui-layer-lan', closeBtn: 1});

                    //修改列总计
                    var colNum = 0;
                    var sumNum = 0;
                    var summix = 0;
                    for (var i = 0; i <= 9; i++) {
                        if (colDef.name == "verf3"||colDef.name == "verf5"||colDef.name == "verf6"||colDef.name == "verf7") {
                            colNum = $scope.childgridOptions.data[i].verf3*1+$scope.childgridOptions.data[i].verf5*1+$scope.childgridOptions.data[i].verf6*1+$scope.childgridOptions.data[i].verf7*1;
                            $scope.childgridOptions.data[i].sumDef2 = colNum.toFixed(2);
                        }
                        if (colDef.name == "verf9"||colDef.name == "verf10"||colDef.name == "verf11"||colDef.name == "verf12"||colDef.name == "verf13") {
                            colNum = $scope.childgridOptions.data[i].verf9*1+$scope.childgridOptions.data[i].verf10*1+$scope.childgridOptions.data[i].verf11*1+$scope.childgridOptions.data[i].verf12*1+$scope.childgridOptions.data[i].verf13*1;
                            $scope.childgridOptions.data[i].sumDef3 = colNum.toFixed(2);
                        }
                        if (colDef.name == "verf15"||colDef.name == "verf16"||colDef.name == "verf17"||colDef.name == "verf18") {
                            colNum = $scope.childgridOptions.data[i].verf15*1+$scope.childgridOptions.data[i].verf16*1+$scope.childgridOptions.data[i].verf17*1+$scope.childgridOptions.data[i].verf18*1;
                            $scope.childgridOptions.data[i].sumDef4 = colNum.toFixed(2);
                        }
                        if (colDef.name == "verf20") {
                            colNum = $scope.childgridOptions.data[i].verf20*1;
                            $scope.childgridOptions.data[i].sumDef5 = colNum.toFixed(2);
                        }
                        if (colDef.name == "verf22"||colDef.name == "verf23"||colDef.name == "verf24") {
                            colNum = $scope.childgridOptions.data[i].verf22*1+$scope.childgridOptions.data[i].verf23*1+$scope.childgridOptions.data[i].verf24*1;
                            $scope.childgridOptions.data[i].sumDef6 = colNum.toFixed(2);
                        }
                        if (colDef.name == "verf27"||colDef.name == "verf28"||colDef.name == "verf29") {
                            colNum = $scope.childgridOptions.data[i].verf27*1+$scope.childgridOptions.data[i].verf28*1+$scope.childgridOptions.data[i].verf29*1;
                            $scope.childgridOptions.data[i].verf26 = colNum.toFixed(2);
                        }
                        if (colDef.name == "verf3"||colDef.name == "verf5"||colDef.name == "verf6"||colDef.name == "verf7") {
                            sumNum = sumNum*1+  $scope.childgridOptions.data[i].verf3*1+$scope.childgridOptions.data[i].verf5*1+$scope.childgridOptions.data[i].verf6*1+$scope.childgridOptions.data[i].verf7*1;
                            $scope.childgridOptions.data[10].sumDef2 = sumNum.toFixed(2);
                        }
                        if (colDef.name == "verf9"||colDef.name == "verf10"||colDef.name == "verf11"||colDef.name == "verf12"||colDef.name == "verf13") {
                            sumNum = sumNum*1+  $scope.childgridOptions.data[i].verf9*1+$scope.childgridOptions.data[i].verf10*1+$scope.childgridOptions.data[i].verf11*1+$scope.childgridOptions.data[i].verf12*1+$scope.childgridOptions.data[i].verf13*1;
                            $scope.childgridOptions.data[10].sumDef3 = sumNum.toFixed(2);
                        }
                        if (colDef.name == "verf15"||colDef.name == "verf16"||colDef.name == "verf17"||colDef.name == "verf18") {
                            sumNum = sumNum*1+ $scope.childgridOptions.data[i].verf15*1+$scope.childgridOptions.data[i].verf16*1+$scope.childgridOptions.data[i].verf17*1+$scope.childgridOptions.data[i].verf18*1;
                            $scope.childgridOptions.data[10].sumDef4 = sumNum.toFixed(2);
                        }
                        if (colDef.name == "verf20") {
                            sumNum = sumNum*1+$scope.childgridOptions.data[i].verf20*1;
                            $scope.childgridOptions.data[10].sumDef5 = sumNum.toFixed(2);
                        }
                        if (colDef.name == "verf22"||colDef.name == "verf23"||colDef.name == "verf24") {
                            sumNum = sumNum*1+ $scope.childgridOptions.data[i].verf22*1+$scope.childgridOptions.data[i].verf23*1+$scope.childgridOptions.data[i].verf24*1;
                            $scope.childgridOptions.data[10].sumDef6 = sumNum.toFixed(2);
                        }
                        if (colDef.name == "verf27"||colDef.name == "verf28"||colDef.name == "verf29") {
                            sumNum = sumNum*1+ $scope.childgridOptions.data[i].verf27*1+$scope.childgridOptions.data[i].verf28*1+$scope.childgridOptions.data[i].verf29*1;
                            $scope.childgridOptions.data[10].verf26 = sumNum.toFixed(2);
                        }

                        if (colDef.name == "verf3") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf3*1;
                            $scope.childgridOptions.data[10].verf3 = summix.toFixed(2);
                        }
                        if (colDef.name == "verf5") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf5*1;
                            $scope.childgridOptions.data[10].verf5 = summix.toFixed(2);
                        }
                        if (colDef.name == "verf6") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf6*1;
                            $scope.childgridOptions.data[10].verf6 = summix.toFixed(2);
                        }
                        if (colDef.name == "verf7") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf7*1;
                            $scope.childgridOptions.data[10].verf7 = summix.toFixed(2);
                        }
                        if (colDef.name == "verf9") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf9*1;
                            $scope.childgridOptions.data[10].verf9 = summix.toFixed(2);
                        }
                        if (colDef.name == "verf10") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf10*1;
                            $scope.childgridOptions.data[10].verf10 = summix.toFixed(2);
                        }
                        if (colDef.name == "verf11") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf11*1;
                            $scope.childgridOptions.data[10].verf11 = summix.toFixed(2);
                        }
                        if (colDef.name == "verf12") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf12*1;
                            $scope.childgridOptions.data[10].verf12 = summix.toFixed(2);
                        }
                        if (colDef.name == "verf13") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf13*1;
                            $scope.childgridOptions.data[10].verf13 = summix.toFixed(2);
                        }
                        if (colDef.name == "verf15") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf15*1;
                            $scope.childgridOptions.data[10].verf15 = summix.toFixed(2);
                        } if (colDef.name == "verf16") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf16*1;
                            $scope.childgridOptions.data[10].verf16 = summix.toFixed(2);
                        } if (colDef.name == "verf17") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf17*1;
                            $scope.childgridOptions.data[10].verf17 = summix.toFixed(2);
                        } if (colDef.name == "verf18") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf18*1;
                            $scope.childgridOptions.data[10].verf18 = summix.toFixed(2);
                        } if (colDef.name == "verf20") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf20*1;
                            $scope.childgridOptions.data[10].verf20 = summix.toFixed(2);
                        } if (colDef.name == "verf22") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf22*1;
                            $scope.childgridOptions.data[10].verf22 = summix.toFixed(2);
                        } if (colDef.name == "verf23") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf23*1;
                            $scope.childgridOptions.data[10].verf23 = summix.toFixed(2);
                        } if (colDef.name == "verf24") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf24*1;
                            $scope.childgridOptions.data[10].verf24 = summix.toFixed(2);
                        } if (colDef.name == "verf26") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf26*1;
                            $scope.childgridOptions.data[10].verf26 = summix.toFixed(2);
                        }
                        if (colDef.name == "verf27") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf27*1;
                            $scope.childgridOptions.data[10].verf27 = summix.toFixed(2);
                        }
                        if (colDef.name == "verf28") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf28*1;
                            $scope.childgridOptions.data[10].verf28 = summix.toFixed(2);
                        }
                        if (colDef.name == "verf29") {
                            summix = summix*1+$scope.childgridOptions.data[i].verf29*1;
                            $scope.childgridOptions.data[10].verf29 = summix.toFixed(2);
                        }

                        //修改行总计
                        var rowNum = $scope.childgridOptions.data[rowEntity.id].sumDef2*1 + $scope.childgridOptions.data[rowEntity.id].sumDef3*1 + $scope.childgridOptions.data[rowEntity.id].sumDef4*1+ $scope.childgridOptions.data[rowEntity.id].sumDef5*1+ $scope.childgridOptions.data[rowEntity.id].sumDef6*1+ $scope.childgridOptions.data[rowEntity.id].verf26*1;
                        $scope.childgridOptions.data[rowEntity.id].sumDef1 = rowNum.toFixed(2);
                    }

                    //修改第10行的总计
                    var sumDef1RowNum = eval($scope.childgridOptions.data[10].sumDef2) + eval($scope.childgridOptions.data[10].sumDef3) + eval($scope.childgridOptions.data[10].sumDef4)+ eval($scope.childgridOptions.data[10].sumDef5)+ eval($scope.childgridOptions.data[10].sumDef6)+ eval($scope.childgridOptions.data[10].verf26);
                    $scope.childgridOptions.data[10].sumDef1 = eval(sumDef1RowNum).toFixed(2);

                    var sumDef1 = eval($scope.childgridOptions.data[10].sumDef1);
                    $scope.VO.sumDef1 = parseFloat(sumDef1.toFixed(2)).toFixed(2);
                    //修改市场合计   除去股东都是市场合计
                    var verf3 =eval($scope.childgridOptions.data[10].sumDef2);
                    $scope.VO.sumDef2 = parseFloat(verf3.toFixed(2)).toFixed(2);
                    var sumDef3 =eval($scope.childgridOptions.data[10].sumDef3);
                    $scope.VO.sumDef3 = parseFloat(sumDef3.toFixed(2)).toFixed(2);
                    var sumDef4 =eval($scope.childgridOptions.data[10].sumDef4);
                    $scope.VO.sumDef4 = parseFloat(sumDef4.toFixed(2)).toFixed(2);
                    var sumDef5 =eval($scope.childgridOptions.data[10].sumDef5);
                    $scope.VO.sumDef5 = parseFloat(sumDef5.toFixed(2)).toFixed(2);
                    var sumDef6 =eval($scope.childgridOptions.data[10].sumDef6);
                    $scope.VO.sumDef6 = parseFloat(sumDef6.toFixed(2)).toFixed(2);
                    var sumDef7=eval($scope.childgridOptions.data[10].verf26);
                    $scope.VO.sumDef7 = parseFloat(sumDef7.toFixed(2)).toFixed(2);
                });
            }
            //编辑事件over
        };

        //初始化模糊查询
        $scope.search = {
            ACCOUNT_PLAN_FLAG: 1,
            record_type: 11,
            DR: 0
        };
        $scope.QUERY = $scope.search;
        //初始化列表
    }

    $scope.initPage=function () {
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
            exporterCsvFilename: '电力能源业务月度计划.csv',
            columnDefs: [
                {name: 'serialNo', displayName: '流水号', width: 65,},
                {name: 'recordYear', displayName: '年', width: 65,},
                {name: 'recordMonth', displayName: '月', width: 65,},
                {name: 'sumDef1', displayName: '非股东业务计划总额(万元)', width: 65,},
                {name: 'sumDef2', displayName: '电网业务部小计(万元)', width: 65,},
                {name: 'sumDef3', displayName: '市场业务部小计(万元)', width: 65,},
                {name: 'sumDef4', displayName: '个险业务部小计(万元)', width: 65,},
                {name: 'sumDef5', displayName: '新能源业务部小计(万元)', width: 65,},
                {name: 'sumDef6', displayName: '国际业务部（再保险部）(万元)', width: 65,},
                {name: 'sumDef7', displayName: '互联网业务部小计(万元)', width: 65,},
                {name: 'billstatus', displayName: '单据状态', width: 65, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOrg.name', displayName: '业务单位', width: 65,},
                {name: 'pkOperator.name', displayName: '操作人', width: 65,},
                {name: 'operateDate', displayName: '操作日期', width: 65,},
                {name: 'operateTime', displayName: '操作时间', width: 65,},
                {name: 'pkChecker.name', displayName: '审核人', width: 65,},
                {name: 'auditDate', displayName: '审核日期', width: 65,},
                {name: 'finallyOpinion', displayName: '审核意见', width: 65,},
                {name: 'auditTime', displayName: '审核时间', width: 65,},
                ///{name: 'ts', displayName: '时间戳', width: 65,}
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
    };

    $scope.onReset = function () {
        $scope.initData();
    };

    $scope.initHttp = function () {

        //查询月度状态
        $scope.queryStatus = function () {
            $http.post($scope.basePath + "sumDef/queryStatus", {
            }).success(function (response) {
                if(response=="1"){
                    $scope.isShow = true;
                }
                if(response=="0"){
                    $scope.isShow = false;
                }
            });
        }
        //更新数据库状态
        $scope.onOpenStatus = function (){
            $http.post($scope.basePath + "sumDef/updateStatus", {

            }).success(function (response) {

            });
        }

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

        //开启

        $scope.onOpen = function () {
            $scope.isShow = false;
            $scope.onOpenStatus();
        }
        //关闭
        $scope.onClose = function (){
            $scope.isShow = true;
            $scope.onOpenStatus();
        }

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
                }
            });
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
                        $scope.isreplace = true;
                        $scope.isSubEdit = false;
                        angular.assignData($scope.VO, response.result);
                        $scope.childgridOptions.data=response.result.monthRecordB;
                    }
                });
        };

        //修改状态
        $scope.changeBillstatus = function (rows, status) {
            var saveDate = new Date();
            $scope.VO.ts = saveDate.toLocaleDateString();
            $scope.VO.billstatus = status;
            $scope.VO.sumDef1 = rows.sumDef1;
            $scope.VO.verf3 = rows.verf3;
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
        $scope.columnDefs = function () {
            $scope.isWeb=false;
            $scope.isgj=false;
            $scope.isOther=false;
            if($rootScope.deptVO.name=="互联网业务部"){
                $scope.isWeb=true;
            }else if($rootScope.deptVO.name=="国际业务部"){
                $scope.isgj=true;
            }else{
                $scope.isOther=true;
            }
            $scope.childgridOptions.columnDefs = [
                {name: 'insuranceName', displayName: '险种', enableCellEdit: false,width: 65},
                {name: 'sumDef1', displayName: '合计（万元）', type: 'number', enableCellEdit: false,width: 65},
                {name: 'sumDef2', displayName: '电网业务部小计', type: 'number', enableCellEdit: false,width: 65},
                {name: 'verf3', displayName: '内蒙古电力公司', type: 'number', enableCellEdit: $scope.isOther,width: 65},
                {name: 'verf5', displayName: '内蒙古电力公司下属单位', type: 'number', enableCellEdit: $scope.isOther,width: 65},
                {name: 'verf6', displayName: '其他地方电网企业', type: 'number', enableCellEdit: $scope.isOther,width: 65},
                {name: 'verf7', displayName: '国网省公司下属上市公司', type: 'number', enableCellEdit: $scope.isOther,width: 65},
                {name: 'sumDef3', displayName: '市场业务部小计', type: 'number', enableCellEdit: false,width: 65},
                {name: 'verf9', displayName: '国网直属单位下属上市公司', type: 'number', enableCellEdit: $scope.isOther,width: 65},
                {name: 'verf10', displayName: '国网系统集体企业', type: 'number', enableCellEdit: $scope.isOther,width: 65},
                {name: 'verf11', displayName: '电源、电建企业', type: 'number', enableCellEdit: $scope.isOther,width: 65},
                {name: 'verf12', displayName: '保险同业咨询', type: 'number', enableCellEdit: $scope.isOther,width: 65},
                {name: 'verf13', displayName: '其他市场企业', type: 'number', enableCellEdit: $scope.isOther,width: 65},
                {name: 'sumDef4', displayName: '个险业务部小计', type: 'number', enableCellEdit: false,width: 65},
                // {name: 'verf15', displayName: '中国能源集团及下属单位', type: 'number', enableCellEdit: false},
                {name: 'verf16', displayName: '个人代理业务', type: 'number', enableCellEdit: $scope.isOther,width: 65},
                {name: 'verf17', displayName: '直付理赔业务', type: 'number', enableCellEdit: $scope.isOther,width: 65},
                {name: 'verf18', displayName: '其他个险业务', type: 'number', enableCellEdit: $scope.isOther,width: 65},
                {name: 'sumDef5', displayName: '新能源业务部小计', type: 'number', enableCellEdit: false,width: 65},
                {name: 'verf20', displayName: '新能源企业', type: 'number', enableCellEdit: $scope.isOther,width: 65},
                {name: 'sumDef6', displayName: '国际业务部（再保险部）小计', type: 'number', enableCellEdit: false,width: 65},
                {name: 'verf22', displayName: '国际业务', type: 'number', enableCellEdit: $scope.isgj,width: 65},
                {name: 'verf23', displayName: '电网资产再保险业务', type: 'number', enableCellEdit: $scope.isgj,width: 65},
                {name: 'verf24', displayName: '其他再保险业务', type: 'number', enableCellEdit: $scope.isgj,width: 65},
                {name: 'sumDef7', displayName: '互联网业务部小计', type: 'number', enableCellEdit: false,width: 65},
                {name: 'verf26', displayName: '个人直营平台业务', type: 'number', enableCellEdit: $scope.isWeb,width: 65},
                {name: 'verf27', displayName: '个人合作平台业务', type: 'number', enableCellEdit: $scope.isWeb,width: 65},
                {name: 'verf28', displayName: '企业互联网保险业务（直营平台）', type: 'number', enableCellEdit: $scope.isWeb,width: 65},
                {name: 'verf29', displayName: '企业互联网保险业务（合作平台）', type: 'number', enableCellEdit: $scope.isWeb,width: 65}
            ];
        }
        //增加按钮
        $scope.onAdd = function () {
            // angular.assignData($scope.VO, $scope.initVO());
            $scope.isClear = true;
            $scope.VO = $scope.initVO();
            $scope.isDisabled = false;
            $scope.columnDefs();
            var zero=0;
            zero=zero.toFixed(2);
            var insuranceType = [
                {
                    id: 0,
                    insuranceName: "财产险",
                    sumDef1: zero,
                    sumDef2: zero,
                    verf3: null,
                    verf5: null,
                    verf6: null,
                    verf7: null,
                    sumDef3: zero,
                    verf9: null,
                    verf10: null,
                    verf11: null,
                    verf12: null,
                    verf13: null,
                    sumDef4: zero,
                    verf15: null,
                    verf16: null,
                    verf17: null,
                    verf18: null,
                    sumDef5: zero,
                    verf20: null,
                    sumDef6: zero,
                    verf22: null,
                    verf23: null,
                    verf24: null,
                    sumDef7: zero,
                    verf26: null,
                    verf27: null,
                    verf28: null,
                    verf29: null
                },
                {
                    id: 1,
                    insuranceName: "机器损坏险",
                    sumDef1: zero,
                    sumDef2: zero,
                    verf3: null,
                    verf5: null,
                    verf6: null,
                    verf7: null,
                    sumDef3: zero,
                    verf9: null,
                    verf10: null,
                    verf11: null,
                    verf12: null,
                    verf13: null,
                    sumDef4: zero,
                    verf15: null,
                    verf16: null,
                    verf17: null,
                    verf18: null,
                    sumDef5: zero,
                    verf20: null,
                    sumDef6: zero,
                    verf22: null,
                    verf23: null,
                    verf24: null,
                    sumDef7: zero,
                    verf26: null,
                    verf27: null,
                    verf28: null,
                    verf29: null
                },
                {
                    id: 2,
                    insuranceName: "供电责任险",
                    sumDef1: zero,
                    sumDef2: zero,
                    verf3: null,
                    verf5: null,
                    verf6: null,
                    verf7: null,
                    sumDef3: zero,
                    verf9: null,
                    verf10: null,
                    verf11: null,
                    verf12: null,
                    verf13: null,
                    sumDef4: zero,
                    verf15: null,
                    verf16: null,
                    verf17: null,
                    verf18: null,
                    sumDef5: zero,
                    verf20: null,
                    sumDef6: zero,
                    verf22: null,
                    verf23: null,
                    verf24: null,
                    sumDef7: zero,
                    verf26: null,
                    verf27: null,
                    verf28: null,
                    verf29: null
                },
                {
                    id: 3,
                    insuranceName: "团体人身意外险",
                    sumDef1: zero,
                    sumDef2: zero,
                    verf3: null,
                    verf5: null,
                    verf6: null,
                    verf7: null,
                    sumDef3: zero,
                    verf9: null,
                    verf10: null,
                    verf11: null,
                    verf12: null,
                    verf13: null,
                    sumDef4: zero,
                    verf15: null,
                    verf16: null,
                    verf17: null,
                    verf18: null,
                    sumDef5: zero,
                    verf20: null,
                    sumDef6: zero,
                    verf22: null,
                    verf23: null,
                    verf24: null,
                    sumDef7: zero,
                    verf26: null,
                    verf27: null,
                    verf28: null,
                    verf29: null
                },
                {
                    id: 4,
                    insuranceName: "公众责任险",
                    sumDef1: zero,
                    sumDef2: zero,
                    verf3: null,
                    verf5: null,
                    verf6: null,
                    verf7: null,
                    sumDef3: zero,
                    verf9: null,
                    verf10: null,
                    verf11: null,
                    verf12: null,
                    verf13: null,
                    sumDef4: zero,
                    verf15: null,
                    verf16: null,
                    verf17: null,
                    verf18: null,
                    sumDef5: zero,
                    verf20: null,
                    sumDef6: zero,
                    verf22: null,
                    verf23: null,
                    verf24: null,
                    sumDef7: zero,
                    verf26: null,
                    verf27: null,
                    verf28: null,
                    verf29: null
                },
                {
                    id: 5,
                    insuranceName: "安全生产责任险",
                    sumDef1: zero,
                    sumDef2: zero,
                    verf3: null,
                    verf5: null,
                    verf6: null,
                    verf7: null,
                    sumDef3: zero,
                    verf9: null,
                    verf10: null,
                    verf11: null,
                    verf12: null,
                    verf13: null,
                    sumDef4: zero,
                    verf15: null,
                    verf16: null,
                    verf17: null,
                    verf18: null,
                    sumDef5: zero,
                    verf20: null,
                    sumDef6: zero,
                    verf22: null,
                    verf23: null,
                    verf24: null,
                    sumDef7: zero,
                    verf26: null,
                    verf27: null,
                    verf28: null,
                    verf29: null
                },
                {
                    id: 6,
                    insuranceName: "机动车辆险",
                    sumDef1: zero,
                    sumDef2: zero,
                    verf3: null,
                    verf5: null,
                    verf6: null,
                    verf7: null,
                    sumDef3: zero,
                    verf9: null,
                    verf10: null,
                    verf11: null,
                    verf12: null,
                    verf13: null,
                    sumDef4: zero,
                    verf15: null,
                    verf16: null,
                    verf17: null,
                    verf18: null,
                    sumDef5: zero,
                    verf20: null,
                    sumDef6: zero,
                    verf22: null,
                    verf23: null,
                    verf24: null,
                    sumDef7: zero,
                    verf26: null,
                    verf27: null,
                    verf28: null,
                    verf29: null
                },
                {
                    id: 7,
                    insuranceName: "在建工程险",
                    sumDef1: zero,
                    sumDef2: zero,
                    verf3: null,
                    verf5: null,
                    verf6: null,
                    verf7: null,
                    sumDef3: zero,
                    verf9: null,
                    verf10: null,
                    verf11: null,
                    verf12: null,
                    verf13: null,
                    sumDef4: zero,
                    verf15: null,
                    verf16: null,
                    verf17: null,
                    verf18: null,
                    sumDef5: zero,
                    verf20: null,
                    sumDef6: zero,
                    verf22: null,
                    verf23: null,
                    verf24: null,
                    sumDef7: zero,
                    verf26: null,
                    verf27: null,
                    verf28: null,
                    verf29: null
                },
                {
                    id: 8,
                    insuranceName: "其他保险",
                    sumDef1: zero,
                    sumDef2: zero,
                    verf3: null,
                    verf5: null,
                    verf6: null,
                    verf7: null,
                    sumDef3: zero,
                    verf9: null,
                    verf10: null,
                    verf11: null,
                    verf12: null,
                    verf13: null,
                    sumDef4: zero,
                    verf15: null,
                    verf16: null,
                    verf17: null,
                    verf18: null,
                    sumDef5: zero,
                    verf20: null,
                    sumDef6: zero,
                    verf22: null,
                    verf23: null,
                    verf24: null,
                    sumDef7: zero,
                    verf26: null,
                    verf27: null,
                    verf28: null,
                    verf29: null
                },
                {
                    id: 9,
                    insuranceName: "咨询费",
                    sumDef1: zero,
                    sumDef2: zero,
                    verf3: null,
                    verf5: null,
                    verf6: null,
                    verf7: null,
                    sumDef3: zero,
                    verf9: null,
                    verf10: null,
                    verf11: null,
                    verf12: null,
                    verf13: null,
                    sumDef4: zero,
                    verf15: null,
                    verf16: null,
                    verf17: null,
                    verf18: null,
                    sumDef5: zero,
                    verf20: null,
                    sumDef6: zero,
                    verf22: null,
                    verf23: null,
                    verf24: null,
                    sumDef7: zero,
                    verf26: null,
                    verf27: null,
                    verf28: null,
                    verf29: null
                },
                {
                    id: 10,
                    insuranceName: "合计（万元）",
                    sumDef1: zero,
                    sumDef2: zero,
                    verf3: null,
                    verf5: null,
                    verf6: null,
                    verf7: null,
                    sumDef3: zero,
                    verf9: null,
                    verf10: null,
                    verf11: null,
                    verf12: null,
                    verf13: null,
                    sumDef4: zero,
                    verf15: null,
                    verf16: null,
                    verf17: null,
                    verf18: null,
                    sumDef5: zero,
                    verf20: null,
                    sumDef6: zero,
                    verf22: null,
                    verf23: null,
                    verf24: null,
                    sumDef7: zero,
                    verf26: null,
                    verf27: null,
                    verf28: null,
                    verf29: null
                }];
            $scope.isGrid = false;
            $scope.isForm = true;
            $scope.form = true;
            $scope.isEdit = true;
            // $scope.onCancel = false;
            //获取当前时间
            var nowDate = new Date();
            var year = nowDate.getFullYear();
            var month = nowDate.getMonth()+1;
            //初始化主表信息
            if(month==12){
                year=year+1;
                month=1;
                $scope.VO.recordYear = year
                $scope.VO.recordMonth = month
            }else {
                $scope.VO.recordYear = year
                $scope.VO.recordMonth = month + 1;
            }
            $scope.VO.sumDef1 = 0;
            $scope.VO.verf3 = 0;
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
            $scope.columnDefs();
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
            }};
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
        /*$scope.onCancel = function () {
            if ($scope.isClear) {
                $scope.VO = $scope.initVO();
                $scope.childgridOptions.data = [];
            }
            $scope.isDisabled = true;
            $scope.isContinue = true;
            $scope.isEdit = false;
            $scope.isBack = false;
            $scope.isCooperationType = true;
            $scope.isBlanketType = false;
        }*/
        //查询条件开启关闭
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        //查询
        $scope.onSearch = function () {
            $scope.queryForGrid($scope.search);
        }

        if($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
    }
    $scope.table_name = "busi_month_record";
    $scope.billdef = "MonthReport";
    $scope.beanName ="insurance.SumDefServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initPage();

    initworkflow($scope, $http, ngDialog);
    initonlineView($scope,$rootScope,$sce,$http,ngDialog);
});