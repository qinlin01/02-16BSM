app.controller('benefitInsuredOrderCtrl', function ($rootScope, $scope,$sce, $http,$state,$window, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog,) {

    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                dr: 0,
                billstatus:31,
                isContinue: 0,
            };
        };
        $scope.initGliftVO = function () {
            return {
                insuranceinfo: [],
                insuranceman: [],
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
        $scope.entityVO = 'nc.vo.busi.benefitInsuredOrderVO';
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

        $scope.moveDianShangData = function () {
            $http.post($scope.basePath + "punlifeInsurance/moveDianShangData").success(function (response) {
            });
        }

        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data, fun, isPrint, etype) {
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.basePath + "common/queryAllForGrid", {
                params: angular.toJson(data),
                fileName: '惠民保订单列表.xls',
                tableName: angular.toJson($scope.table_name),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData),
                isPrint: isPrint,
                etype: 0,//0：excel 1：pdf
            }).success(function (response) {
                let data = angular.fromJson(SM2Decrypt(response));
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
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "benefitInsured/queryForGrid", {
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
                    $scope.gridOptions.data = response.Rows;
                    $scope.gridOptions.totalItems = response.Total;
                }
                layer.closeAll('loading');
            });
        };

        $scope.findOne = function (pk,callback) {
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
        $scope.initView = function () {};

        /**
        * 生成保单
        * */
        $scope.onGeneratePolicy = function () {
            var app="";
            app="app.contManage.policyInfo.life.gLifeInsurance";
            var initData = $scope.initGliftVO();
            $http.post($scope.basePath + "getHMBDataController/getHMBData", {params: "GCM015",data:angular.toJson(initData)}).success(function (response) {
                if (response && response.code=="200"){
                    var VOData = response.result;
                    var url=$state.href(app,{'json':VOData},{});
                    $rootScope.benefitInsuredData=VOData;
                    $window.open(url,'_self');
                }
                if (response && response.code=="501"){
                    return layer.alert(response.msg, {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
            })
        };

        $scope.onCard = function (id) {
            if (!id) {
                var rows = $scope.gridApi.selection.getSelectedRows();
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

        /**
         * 返回
         */
        $scope.onBack = function () {
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isCard = false;
            $scope.isDisabled = true;
            //阻止页面渲染
            $scope.form=false;
            $scope.card=false;
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

            $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                var rows = $scope.gridApi.selection.getSelectedRows();
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

        $scope.selectTabName = 'insuranceinfosGridOptions';
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

    };



    $scope.table_name = "";
    $scope.billdef = "";
    $scope.beanName = "";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initButton();
    $scope.initPage();
});
