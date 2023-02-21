/**
 * Created by Aiko on 2020/11/04.
 */
app.controller('warehouseChangebillcheckCtrl', function ($rootScope, $scope,$sce, $http,$state, $stateParams, uiGridConstants, ngDialog) {
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
            }
        };

        $scope.funCode = '901';
        $scope.QUERY = $scope.initQUERY();
    };



    $scope.initHttp = function () {

        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "warehouseChangebillcheck/queryForGrid", {
                params: angular.toJson(data),
                current: $scope.gridApi.page ? $scope.gridApi.page : 1,
                size: $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100,
            }).success(function (response) {
                $scope.gridOptions.data = response.data.RESULT.Rows;
                $scope.gridOptions.totalItems = response.data.RESULT.TOTAL;
                layer.closeAll('loading');
            });
        };
        $scope.moveDianShangData=function () {
            $http.post($scope.basePath + "warehouseChangebillcheck/moveDianShangData").success(function (response) {
            });
        }
        $scope.findOne = function (pk,callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "warehouseChangebillcheck/findOne", {id: pk}).success(function (response) {
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
        // 完善保单信息，跳转到录入页面
        $scope.onPerfect = function (){
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1)
                return layer.alert("请选择一条数据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            let id = rows[0].UUID;
            let flag =rows[0].FLAG;
            let esName =rows[0].NAME;
            let app ;
            let fun_code = '';
            if("财产险" == flag){
                app="app.contManage.policyInfo.property.propertyInsurance";
                fun_code ="3020301";
            }else if("人身险"==flag ){
                if(esName.indexOf("*") >-1){
                    // 个人寿险
                    app="app.contManage.policyInfo.life.pLifeInsurance";
                    fun_code ="3020402";
                }else{
                    app="app.contManage.policyInfo.life.gLifeInsurance";
                    fun_code ="3020401";
                }
            }else if("车险" ==  flag){
                    app ="app.contManage.policyInfo.car.pCarInsurance";
                    fun_code ="3020501";
            }

            $http.post($scope.basePath + "account/setFunCode", {funCode: fun_code}).success(function (response) {
                layer.closeAll("loading");
                var url=$state.href(app,{'ids':id},{});
                $rootScope.dataById = id;
                window.open(url,'_self');
            });

            // var url=$state.href(app,{'ids':id},{});
            // $rootScope.dataById = id;
            // window.open(url,'_self');

        }

    };

    $scope.initWatch = function (){

    }
    $scope.initButton = function () {

        $scope.isClear = false;

        /**
         * 卡片
         */
        $scope.onCard = function (id) {
            if(!id){
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1)
                    return layer.alert("请选择一条数据进行查看!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                id = rows[0].UUID;
            }
            $scope.findOne(id);
                $scope.isBack = true;
                $scope.isGrid = false;
                $scope.isCard = true;
                $scope.card = true;
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
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;
        $scope.isreplace = true;
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
                {name: 'CORR_INFO_NUM', displayName: '批单号', width: 200,},
                {name: 'CHG_INFO_NUM', displayName: '保单号', width: 200,  },
                {name: 'CORR_INFO_DATE', displayName: '批单生效时间', width: 100, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'CHG_INSURE_START_DATE', displayName: '起始日期', width: 200, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'CHG_INSURE_END_DATE', displayName: '到期日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'CHG_PAY_NUM', displayName: '保费总期数', width: 100,},
                {name: 'CHG_ALL_FEE', displayName: '保险金额/赔偿限额(元)', width: 150,cellFilter: 'AMOUNT_FILTER',  cellClass: function () { return "lr-text-right"}},
                {name: 'CHG_INSURE_FEE', displayName: '签单保费(元)', width: 150,cellFilter: 'AMOUNT_FILTER',  cellClass: function () { return "lr-text-right"}},
                {name: 'CHG_BROKER_NAME', displayName: '经纪公司名称', width: 100,},
                {name: 'COMPANY_INFO', displayName: '保险公司', width: 100,},
                {name: 'CHG_POST_TIME', displayName: '推送时间', width: 100,cellFilter: 'date:"yyyy-MM-dd"'},
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
                    $scope.findOne(rows[0].UUID);
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
                {
                    name: 'permiumNoVAT', displayName: '保险保费(不含税)(元)', width: 100,   cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
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
                {
                    name: 'commissionNoVAT', displayName: '佣金金额(不含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER'
                },
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
                    cellFilter: 'date:"yyyy-MM-dd"',  editableCellTemplate: 'ui-grid/refDate'
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

                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},

                {
                    name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                },
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
