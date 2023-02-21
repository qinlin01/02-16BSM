/**
 * Created by Aiko on 2020/11/04.
 */
app.controller('eLifeInsuranceCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                insuranceinfo: [],
                insuranceman: [],
                insurancedman: [],
                partner: [],
                payment: [],
                assistant: [],
                insuranceGLifeData: [],
                isbudget:'N',
                ifSubstitute:'N',
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                dr: 0,
                billstatus:31,
                insurancetotalmoney: 0,
                costscale: [],
                coomedium: [],
                insurancetype:"grouplife",
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "systype0_0eq":"tra"
            }
        };

        $scope.funCode = '901';
        $scope.QUERY = $scope.initQUERY();
    };



    $scope.initHttp = function () {

        //列表查询
        $scope.queryForGrid = function (data) {
            if($scope.selectType){
                $scope.gridOptions.useExternalPagination = true;
                if (!$scope.queryData) {
                    $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
                }
                layer.load(2);
                $http.post($scope.basePath + "eLifeInsurance/queryForGrid", {
                    params: angular.toJson(data),
                    current: $scope.gridApi.page ? $scope.gridApi.page : 1,
                    size: $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100,
                }).success(function (response) {
                    $scope.gridOptions.data = response.data.records;
                    $scope.gridOptions.totalItems = response.data.total;
                    layer.closeAll('loading');
                });
            }else{
                $scope.hmbGridOptions.useExternalPagination = true;
                if (!$scope.queryData) {
                    $scope.queryData = $scope.hmbGridApi ? $scope.hmbGridApi.columnDefs : $scope.hmbGridOptions.columnDefs;
                }
                layer.load(2);
                $http.post($scope.basePath + "benefitInsured/queryForGrid", {
                    params: angular.toJson(data),
                    page: $scope.hmbGridApi ? $scope.hmbGridApi.page : $scope.hmbGridOptions.page,
                    pageSize: $scope.hmbGridApi ? $scope.hmbGridApi.pageSize : $scope.hmbGridOptions.pageSize,
                    fields: angular.toJson($scope.queryData)
                }).success(function (response) {
                    if (response.code == 200) {
                        if (!$scope.query) {
                            $scope.query = $scope.hmbGridOptions.columnDefs;
                        }
                        if ($scope.QUERY.id) {
                            $scope.QUERY.id = null;
                        }
                        $scope.hmbGridOptions.data = response.Rows;
                        $scope.hmbGridOptions.totalItems = response.Total;
                    }
                    layer.closeAll('loading');
                });
            }
        };
        $scope.moveDianShangData=function () {
            $http.post($scope.basePath + "eLifeInsurance/moveDianShangData").success(function (response) {
            });
        }
        $scope.moveData=function () {
            $http.post($scope.basePath + "eLifeInsurance/moveData").success(function (response) {
            });
        }
        $scope.findOne = function (pk,callback) {
            if(!$scope.selectType){
                return $scope.hmbFindOne(pk,callback);
            }
            $scope.pk = pk;
            $http.post($scope.basePath + "eLifeInsurance/findOne", {id: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    if (callback) {
                        callback();
                    }
                    angular.assignData($scope.VO, response.data);
                    $scope.insurancemanGridOptions.data = $scope.VO.insuranceman;
                    $scope.insurancedmanGridOptions.data = $scope.VO.insurancedman;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    $scope.paymentGridOptions.data = $scope.VO.payment;
                    $scope.insuranceGLifeOptions.data=$scope.VO.insuranceinfo;
                    if (response.data.orderInfo !=null){
                        $scope.VO.orderInfo = response.data.orderInfo;
                    }else {
                        $scope.VO.orderInfo = ""
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


        $scope.hmbFindOne = function (pk,callback) {
            $http.post($scope.basePath + "benefitInsured/findOne", {params: angular.toJson($scope.VO),}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.insuranceinfosGridOptions.data = $scope.VO.insuranceinfo;
                    $scope.insurancemansGridOptions.data = $scope.VO.insuranceman;
                    if (callback) {
                        callback; };
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
        $scope.audit = function (pkProject, msg, selects, _pass, type) {
        };
    };

    $scope.initFunction = function () {

        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function (item) {
            if(item && item.id){
                $scope.onCard(item.id);
            }
        };
    };

    $scope.initWatch = function (){

        $scope.$watch('QUERY.systype0_0eq', function (newVal, oldVal) {
            if (newVal == "hmb") {
                $scope.selectType = false;
            }else{
                $scope.selectType = true;
            }
        }, true);

    }
    $scope.initButton = function () {

        $scope.isClear = false;

        /**
         * 卡片
         */
        $scope.onCard = function (id) {
            if(!$scope.selectType){
                return $scope.onHmbCard(id);
            }
            if(!id){
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1)
                    return layer.alert("请选择一条数据进行查看!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                id = rows[0].id;
            }
            $scope.findOne(id,function (){
                $scope.isBack = true;
                $scope.isGrid = false;
                $scope.isCard = true;
                $scope.card = true;
            });
        };

        $scope.onHmbCard = function (id) {
            if (!id) {
                var rows = $scope.hmbGridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1)
                    return layer.alert("请选择一条数据进行查看!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                id = rows[0].PK_CAIB_PRODUCT;
            }
            $http.post($scope.basePath + "benefitInsured/findOne", {params: angular.toJson($scope.VO),}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    $scope.card = true;
                    angular.assignData($scope.VO, response.result);
                    if (!response.result.taskHis)
                        $scope.mess = false;
                    else
                        $scope.mess = true;
                    $scope.isBack = true;
                    $scope.isGrid = false;
                    $scope.isHmbCard = true;

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

        /**
         * 返回
         */
        $scope.onBack = function () {
            if($stateParams.id) {
                window.history.back(-2);
                return;
            }
            $scope.isCard = false;
            $scope.isHmbCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isDisableds = true;
            $scope.isDisabled = true;
            //阻止页面渲染
            $scope.form=false;
            $scope.card=false;
            $scope.queryForGrid($scope.QUERY);
        };

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };
        $scope.onReset = function () {
            $scope.QUERY = $scope.initQUERY();
        };

        /**
         * 初始化参照
         */
        $scope.initView = function () {

        };
    };

    $scope.initPage = function () {
        $scope.form=false;
        $scope.card=false;
        $scope.isClear = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isHmbCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;
        $scope.isreplace = true;
        //互联网还是惠民保
        $scope.selectType = true;
        //控制附件上传和下载
        $scope.upOrDown = false;
        $scope.isUploadAnytime = false;
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
            exporterCsvFilename: '疗休养保险信息.csv',
            columnDefs: [
                {name: 'insuranceinfono', displayName: '保单信息编号', width: 100,},
                {name: 'formId', displayName: '订单号', width: 100, cellFilter: 'CSV_FILTER'},
                {name: 'insuranceno', displayName: '保单号', width: 100, cellFilter: 'CSV_FILTER'},
                {name: 'insurancebillkindno', displayName: '保单性质', width: 100, cellFilter: 'SELECT_INSURANCEBILLKIND'},
                {name: 'estimatepk.name', displayName: '投保人', width: 100,},
                {name: 'telephone', displayName: '投保人联系电话', width: 100,},
                {name: 'productName', displayName: '产品名称', width: 100,},
                {name: 'payType', displayName: '支付方式', width: 100,},
                {name: 'startDate', displayName: '保险起始日期', width: 100,},
                {name: 'endDate', displayName: '保险到期日期', width: 100,},
                {name: 'insurancetotalmoney', displayName: '保险金额/赔偿限额/(元)', width: 100,  cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }},
                {name: 'insurancetotalcharge', displayName: '保费(元)', width: 100,  cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }},
                {name: 'commisiontotalnum', displayName: '佣金总金额(元)', width: 100,  cellFilter: 'AMOUNT_FILTER ',
                    cellClass: function () {
                        return "lr-text-right"
                    },},
                // {name: 'c_2_distributemethod', displayName: '保险人', width: 100,},
                {name: 'vdef12', displayName: '业务种类', width: 100, cellFilter: 'SELECT_BUSINESSTYPE'},
                {name: 'operateDate', displayName: '制单日期', width: 100,},
                {name: 'operateTime', displayName: '制单时间', width: 100,},
                // {name: 'pkOrg_name', displayName: '业务单位', width: 100,},
                // {name: 'pkDept_name', displayName: '部门', width: 100,},
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
                    if(!$scope.chilbTable){
                        $scope.chilbTable=true;
                    }
                    angular.assignData($scope.VO, row.entity);
                    $scope.findOne(rows[0].id);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });


        };

        $scope.hmbGridOptions = {
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
            exporterCsvFilename: '惠民保订单列表.csv',
            columnDefs: [
                {name: 'INSURANCENO', displayName: '团体保单号'},
                {name: 'INSURANCE_ID', displayName: '订单号'},
                {name: 'PRODUCT_NAME', displayName: '产品名称',},
                {name: 'PAY_TYPE', displayName: '支付方式',cellFilter: 'SELECT_PAYTYPES'},
                {name: 'ESTIMATENAME', displayName: '投保人姓名',},
                {name: 'USER_MOBILE', displayName: '投保人联系方式',},
                // {name: 'ESTIMATE_SEX', displayName: '投保人性别',cellFilter: 'SELECT_GENDER'},
                // {name: 'USER_BIRTHDAY', displayName: '投保人生日',cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'INSURED_NUMBER', displayName: '参保人数',},
                {name: 'INSURANCETOTALCHARGE', displayName: '保险金额/赔偿限额(每人)',cellFilter: 'AMOUNT_FILTER'},
                {name: 'INSURANCETOTALCHARGE', displayName: '保费(每人)',cellFilter: 'AMOUNT_FILTER'},
                {name: 'INSURANCETOTALMONEY', displayName: '保险金额/赔偿限额(合计)',cellFilter: 'AMOUNT_FILTER'},
                {name: 'INSURANCETOTALCHARGE', displayName: '保费(合计)',cellFilter: 'AMOUNT_FILTER'},
                {name: 'RATE_NUMBER', displayName: '费率(‰)'},
                {name: 'STARTDATE', displayName: '保单起始日期'},
                {name: 'ENDDATE', displayName: '保单到期日期'},
                {name: 'INSURANCEBILLKIND', displayName: '保单性质',},

            ],
            data: [],
            exporterAllDataFn: function () {
                $scope.queryAllForGrid($scope.QUERY);
            },
        };
        $scope.hmbGridOptions.onRegisterApi = function (gridApi) {
            $scope.hmbGridApi = gridApi;
            //添加行头
            $scope.hmbGridApi.core.addRowHeaderColumn({
                name: 'rowHeaderCol',
                displayName: '',
                width: 30,
                cellTemplate: 'ui-grid/rowNumberHeader'
            });

            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                $scope.hmbGridApi.page = newPage;
                $scope.hmbGridApi.pageSize = pageSize;
                $scope.queryForGrid($scope.QUERY);
            });

            $scope.hmbGridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                var rows = $scope.hmbGridApi.selection.getSelectedRows();
                if (rows.length == 1) {
                    if (!$scope.chilbTable) {
                        $scope.chilbTable = true;
                    }
                    angular.assignData($scope.VO, row.entity);
                    var id = rows[0].PK_CAIB_PRODUCT;
                    $scope.findOne(id);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });

        };

        $scope.insurancemanGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'insuranceMan.name',
                    displayName: '保险人名称',
                    width: 100,
                    url: 'insuranceCustomerRef/queryForGrid'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'insuranceMan'
                },
                {
                    name: 'insurancerate', displayName: '承保比例(%)', width: 100
                },
                {
                    name: 'insurancemoney', displayName: '保险金额/赔偿限额(元)', width: 100, enableCellEdit: false,   cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'permium', displayName: '保险保费(元)', width: 100,   cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                // {
                //     name: 'permiumNoVAT', displayName: '保险保费(不含税)(元)', width: 100,   cellFilter: 'AMOUNT_FILTER',
                //     cellClass: function () {
                //         return "lr-text-right"
                //     }
                // },
                {
                    name: 'isReplace', displayName: '是否代收保费', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'pay', displayName: '是否全额解付', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },

                {
                    name: 'commisionrate', displayName: '佣金比例(%)', width: 100
                },
                {
                    name: 'commission', displayName: '佣金金额(含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER'
                },
                // {
                //     name: 'commissionNoVAT', displayName: '佣金金额(不含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER'
                // },
                {
                    name: 'chiefman', displayName: '是否主承保', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'memo', displayName: '备注', width: 100, enableCellEdit: true
                },
            ],
            data: $scope.VO.insuranceman,
            onRegisterApi: function (gridApi) {
                $scope.insurancemanGridOptions.gridApi = gridApi;
            }

        };
        //被保人
        $scope.insurancedmanGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '被保险人子表.csv',
            cellEditableCondition:function($rootScope){
                if($scope.isEdit||$scope.isUpdate){
                    return true;
                }else{
                    return  false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'insurancedMan.name',
                    displayName: '被保人',
                    width: 100,
                    // enableCellEdit: $scope.isDw,
                    url: 'customerInsuRef/queryForGrid'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'insurancedMan',
                    params: {type: 'beibaoxianren',
                    }
                },
                {
                    name: 'sex', displayName: '性别', width: 100,cellFilter: 'SELECT_GENDER'
                },
                {
                    name: 'certificatetype', displayName: '证件类型', width: 100,cellFilter: 'SELECT_CERTCODETYPE'
                },
                {
                    name: 'certificateno', displayName: '证件号码', width: 100
                },
                {
                    name: 'birthdate',
                    displayName: '出生日期',
                    width: 100,
                    cellFilter: 'date:"yyyy-MM-dd"',
                    editableCellTemplate: 'ui-grid/refDate'
                },
            ],
            data: $scope.VO.insurancedman,
            onRegisterApi: function (gridApi) {
                gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                $scope.insurancedmanGridOptions.gridApi = gridApi;
            }
        };
        //收付款信息
        $scope.paymentGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            columnDefs: [
                {
                    name: 'stages', displayName: '期数', width: 100, enableCellEdit: false


                },
                {
                    name: 'typeMoneyNo', displayName: '收付款类型', width: 100, cellFilter: 'SELECT_TYPEMONEY'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.TYPEMONEY, enableCellEdit: false
                },
                {
                    name: 'company.name', displayName: '收付款对象名称', width: 100, enableCellEdit: false
                },
                {
                    name: 'typeCompany',
                    displayName: '收付款对象类型',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'SELECT_CUSTOMERTYPE'
                },
                {
                    name: 'scaleMoney', displayName: '收付款比例', width: 100, cellFilter: 'number:2'
                },
                {
                    name: 'planDate',
                    displayName: '计划日期',
                    width: 100,
                    editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'planMoney',
                    displayName: '计划金额',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'factMoney',
                    displayName: '已结算金额',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'noPaymentMoney',
                    displayName: '未结算金额',
                    width: 100,

                    enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'factDate',
                    displayName: '结算日期',
                    width: 100,
                    enableCellEdit: false,
                    editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'vsettlebillno', displayName: '业务结算单号', width: 100, enableCellEdit: false

                },
            ],
            data: $scope.VO.payment,
            onRegisterApi: function (gridApi) {
                $scope.paymentGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if ('scaleMoney' == colDef.name) {
                            if (rowEntity.scaleMoney) {
                                var array = $scope.paymentGridOptions.data;
                                $scope.VO.insuranceman = $scope.insurancemanGridOptions.data;
                                for (var i = 0; i < array.length; i++) {
                                    if (rowEntity.typeMoneyNO == 1) {
                                        rowEntity.planMoney = parseFloat(eval($scope.VO.receivemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                        rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.receivemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                    }
                                    for (var j = 0; j < $scope.VO.insuranceman.length; j++) {
                                        if (array[i].company.name == $scope.VO.insuranceman[j].insurancemanpk.name
                                            && array[i].$$hashKey == rowEntity.$$hashKey) {
                                            if (rowEntity.typeMoneyNO == 3) {
                                                rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].feemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].feemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                            }
                                            if (rowEntity.typeMoneyNO == 2) {
                                                if ($scope.VO.insuranceman[j].pay != 'Y') {
                                                    if ($scope.VO.insuranceman.length > 1 && $scope.VO.insuranceman[j].chiefman != 'Y') {
                                                        rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    } else if ($scope.VO.insuranceman.length > 1 && $scope.VO.insuranceman[j].chiefman != 'Y') {
                                                        rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    } else {
                                                        rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    }

                                                } else {
                                                    rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);

                                                }

                                            }

                                        }
                                    }

                                }
                            }
                        }
                        $scope.$apply();
                    });
                }

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
                {
                    name: 'file_type',
                    displayName: '附件类型',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_DOUCUMENTTYPE',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.DOUCUMENTTYPE
                },

                // {name: 'pkPubBlob.name', displayName: '附件内容', width: 100,enableCellEdit:false
                //     /*url:'INSURANCEBLOBREFMODEL'
                //     ,placeholder:'请选择' ,editableCellTemplate:'ui-grid/refEditor' ,popupModelField:'pkPubBlob'*/
                //
                //     },
                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},

                // {name: 'cUpman.name', displayName: '上载人', width: 100,enableCellEdit:false
                //    /* ,url:'userRef/queryForGrid'
                //     ,placeholder:'请选择' ,editableCellTemplate:'ui-grid/refEditor' ,popupModelField:'cUpman'*/
                //
                //     },
                {
                    name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                },
                // {name: 'cMemo', displayName: '备注', width: 100
                //     },
            ],
            data: $scope.VO.dealAttachmentB,
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
        $scope.insuranceGLifeOptions={
                enableCellEditOnFocus: true,
                enableRowSelection: true,
                enableSelectAll: true,
                multiSelect: true,
                enableSorting: true,
                enableRowHeaderSelection: true,
                showColumnFooter: true,
                cellEditableCondition:function($rootScope){
                    if($scope.isEdit){
                        return true;
                    }else{
                        return  false;
                    }
                },
                columnDefs: [
                    {
                        name: 'insurance.name',
                        displayName: '险种名称',
                        width: 100,
                        url: 'insuranceRef/queryForGrid' ,
                        placeholder: '请选择',
                        editableCellTemplate: 'ui-grid/refEditor',
                        isTree: true,
                        popupModelField: 'insurancepk',
                        params:{type:'shouxian'}
                    },
                    {
                        name: 'insuranceAlias', displayName: '产品名称', width: 100
                    },
                    {
                        name: 'insurancemoney', displayName: '保险金额/赔偿限额(元)', width: 100,   cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'chargerate', displayName: '费率(‰)', width: 100,enableCellEdit: true,
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'insurancecharge', displayName: '保费(含税)(元)', width: 100,   cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'franchise', displayName: '免赔额(元)', width: 100,   cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'memo', displayName: '备注', width: 100
                    },
                ],
                data: $scope.VO.insuranceinfo,
                onRegisterApi: function (gridApi) {
                    //添加行头
                    gridApi.core.addRowHeaderColumn({
                        name: 'rowHeaderCol',
                        displayName: '',
                        width: 30,
                        cellTemplate: 'ui-grid/rowNumberHeader'
                    });
                    $scope.insuranceGLifeOptions.gridApi = gridApi;
                }
            };

        $scope.insuranceinfosGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'INFOR_NAME', displayName: '险种名称', width: 150, enableCellEdit: true
                },
                {
                    name: 'INFOR_NAME2', displayName: '具体险种', width: 150, enableCellEdit: true
                },
                {
                    name: 'INSURANCETOTALMONEY',
                    displayName: '保险金额/赔偿限额(每人)',
                    width: 150,
                    cellFilter: 'AMOUNT_FILTER'
                },

            ],
            data: $scope.VO.insuranceinfo,
            onRegisterApi: function (gridApi) {
                $scope.insuranceinfosGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                    });
                }
            }
        };

        $scope.insurancemansGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'INSURED_NAME', displayName: '被保险人', width: 150

                },
                // {
                //     name: 'USER_CDE_TYPE', displayName: '证件类型', width: 150
                // },
                {
                    name: 'USER_CARD_NO', displayName: '身份证号', width: 150
                },
                {
                    name: 'USER_BIRTHDAY', displayName: '生日', width: 150,cellFilter: 'date_cell_date'
                },
                {
                    name: 'INSURED_SEX', displayName: '性别', width: 150, cellFilter: 'SELECT_GENDER'
                },
            ],
            data: $scope.VO.insuranceman,
            onRegisterApi: function (gridApi) {
                $scope.insurancemansGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        $scope.$apply();
                    });
                }
            }
        };


        /**
         * 计算应收保费总额
         */
        $scope.calReceivemount = function (data) {
            var result = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i].replace == 'Y') {
                    if (!data[i].insurancemoney) {
                        data[i].insurancemoney = 0;
                    }
                    result = parseFloat(result) + parseFloat(data[i].insurancemoney);
                }
            }
            return result;
        }

        /**
         * 计算应解付总额
         * @param data
         */
        $scope.calPay = function (data) {
            var result = 0;
            var flag = false;
            for (var i = 0; i < data.length; i++) {
                var feemount = 0;
                var insurancemoney = 0;
                if (data[i].pay == 'Y') {
                    result = parseFloat(result) + parseFloat(data[i].insurancemoney);
                } else if (data[i].pay != 'Y' && data[i].replace == 'Y') {
                    if (data[i].feemount) {
                        feemount = parseFloat(feemount) + parseFloat(data[i].feemount);
                    }
                    if (data[i].insurancemoney) {
                        insurancemoney = parseFloat(insurancemoney) + parseFloat(data[i].insurancemoney);
                    }
                    flag = false;
                    result = result + (parseFloat(insurancemoney) - parseFloat(feemount));
                }
            }
            if (flag) {
                return 0;
            }
            return result;
        }
        //获取财务联查时url中的id
        function getQueryVariable(){
            var query = window.location.href;
            var vars = query.split("&");
            var pair = vars[0].split("=");
            if(pair.length>1){
                return pair[1];
            }
            return null;
        }
        if (null!=getQueryVariable()) {
            $scope.onCard(getQueryVariable());
        }
        if($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
        if ($scope.selectTabName == 'paymentGridOptions') {
            $scope.isShow = false;
        } else {
            $scope.isShow = true;
        }
        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {
            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }
    };

    $scope.table_name = "lr_insurancebill";
    $scope.billdef = "GLifeInsurance";
    $scope.beanName = "insurance.InsurancebillServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initworkflow($scope, $http,ngDialog);
    initonlineView($scope,$rootScope,$sce,$http,ngDialog);

});
