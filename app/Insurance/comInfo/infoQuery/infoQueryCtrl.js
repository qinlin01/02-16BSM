/**
 * Created by Lenovo on 2018-1-16.
 */
app.controller('infoQueryCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                mainInsurance: [],
                insurancedMan: [],
                insuranceMan: [],
                payment: []
            };
        };
        $scope.VO = $scope.initVO();
        //初始化查询
       $scope.initQUERY = function () {
            return {
                year:new Date().getFullYear(),month:new Date().getMonth()+1,month1:new Date().getMonth()+1,
                "operate_year": new Date().format("yyyy")
            }
        };
        $scope.QUERY = $scope.initQUERY();
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            layer.load(2);
            $http.post($scope.basePath + "infoQuery/queryForGrid", {
                params: angular.toJson(data),
            }).success(function (response) {
                if (response.code == 200) {
                    $scope.gridOptions.data = response.result.Rows;
                }
                layer.closeAll('loading');
            });
        };
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + "infoQuery/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    angular.assignData($scope.VO.mainInsurance, response.result.listChildOne);
                    angular.assignData($scope.VO.insurancedMan, response.result.listChildTwo);
                    angular.assignData($scope.VO.insuranceMan, response.result.listChildThree);
                    angular.assignData($scope.VO.payment, response.result.listChildFour);
                   /* $scope.mainInsuranceGridOptions = response.result.listChildOne;
                    $scope.insurancedManGridOptions = response.result.listChildTwo;
                    $scope.insuranceManGridOptions = response.result.listChildThree;
                    $scope.paymentGridOptions = response.result.listChildFour;*/
                } else {
                    if(response){
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function(matched) {
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
    };

    $scope.initPage = function () {
        $scope.isGrid = true;
        $scope.gridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选

            columnDefs: [
                {name: 'insuranceno', displayName: '保单号', width: 100,},
                {name: 'c_procode', displayName: '立项编号', width: 100,},
                {name: 'c_proname', displayName: '立项名称', width: 100,},
                {name: 'c_protype', displayName: '客户产权关系', width: 100,},
                {name: 'project_date', displayName: '立项日期', width: 100,},
                {name: 'insurancename', displayName: '险种名称', width: 100,},
                {name: 'estimate_name', displayName: '投保人', width: 100,},
                {name: 'insurancetotalmoney', displayName: '总保额', width: 100,},
                {name: 'insurancetotalcharge', displayName: '总保费', width: 100,},
                {name: 'receivefeemount', displayName: '佣金总额', width: 100,},
                {name: 'fact_money', displayName: '佣金结算金额', width: 100,},
                {name: 'startdate', displayName: '保单起保时间', width: 100,},
                {name: 'enddate', displayName: '保单截止时间', width: 100,},
                {name: 'builddept', displayName: '建立部门', width: 100,},
            ],
            data: []
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
                    if(!$scope.chilbTable){
                        $scope.chilbTable=true;
                    }
                    angular.assignData($scope.VO, row.entity);
                    $scope.findOne(rows[0].pk_insurancebill);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });
        };

        $scope.selectTabName = 'mainInsuranceGridOptions';
        $scope.mainInsuranceGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'insurancename', displayName: '险种名称', width: 100
                },
                {
                    name: 'insurancemoney', displayName: '保险金额/赔偿限额', width: 100,
                },
                {
                    name: 'chargerate',
                    displayName: '费率(‰)',
                    width: 100
                },
                {
                    name: 'insurancecharge', displayName: '保费', width: 100
                },

            ],
            data: $scope.VO.mainInsurance,
            onRegisterApi: function (gridApi) {
                $scope.mainInsuranceGridOptions.gridApi = gridApi;
            }
        };

        $scope.selectTabName = 'insurancedManGridOptions';
        $scope.insurancedManGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'c_0_name', displayName: '被保险人', width: 100
                },
                {
                    name: 'insurancedmanaddr', displayName: '被保险人地址', width: 100
                },
                {
                    name: 'additioninsurancecharge',
                    displayName: '保费',
                    width: 100
                },
                {
                    name: 'insurance_man_linkman', displayName: '保险专责姓名', width: 100
                },
                {
                    name: 'insurance_man_tel', displayName: '保险专责联系方式', width: 100
                },

            ],
            data: $scope.VO.insurancedMan,
            onRegisterApi: function (gridApi) {
                $scope.insurancedManGridOptions.gridApi = gridApi;
            }
        };

        $scope.selectTabName = 'insuranceManGridOptions';
        $scope.insuranceManGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'insuranceman', displayName: '保险公司', width: 100
                },
                {
                    name: 'comm_kind', displayName: '承包性质', width: 100
                },
                {
                    name: 'insurancerate', displayName: '承包比例（%）', width: 100
                },
                {
                    name: 'insurancemoney',
                    displayName: '保费',
                    width: 100
                },
                {
                    name: 'commisionrate', displayName: '佣金比例（%）', width: 100
                },
                {
                    name: 'feemount', displayName: '佣金金额', width: 100
                },
                {
                    name: 'insurancelinkman', displayName: '保险公司联系人', width: 100
                },
                {
                    name: 'insurancelinktel', displayName: '保险公司联系方式', width: 100
                },

            ],
            data: $scope.VO.insuranceMan,
            onRegisterApi: function (gridApi) {
                $scope.insuranceManGridOptions.gridApi = gridApi;
            }
        };



        $scope.selectTabName = 'paymentGridOptions';
        $scope.paymentGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'src_type', displayName: '收付款来源类型', width: 100
                },
                {
                    name: 'type_money', displayName: '收付款类型', width: 100
                },
                {
                    name: 'cname',
                    displayName: '收付款对象',
                    width: 100
                },
                {
                    name: 'stages',
                    displayName: '期次',
                    width: 100
                },
                {
                    name: 'plan_date', displayName: '计划日期', width: 100
                },
                {
                    name: 'plan_money', displayName: '计划金额', width: 100
                },
                {
                    name: 'fact_money', displayName: '结算金额', width: 100
                },
                {
                    name: 'un_money', displayName: '未结算金额', width: 100
                },

            ],
            data: $scope.VO.payment,
            onRegisterApi: function (gridApi) {
                $scope.paymentGridOptions.gridApi = gridApi;
            }
        };

    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();

    };
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initButton();
    $scope.initPage();
});
