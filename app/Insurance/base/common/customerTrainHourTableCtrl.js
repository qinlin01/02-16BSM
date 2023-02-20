/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('customerTrainHourTableCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal) {
    $scope.initData = function (data) {
        $scope.status = {open: true};

        //初始化查询
       $scope.initQUERY = function () {
            return { "operate_year": new Date().format("yyyy")}
        };
        $scope.QUERY = $scope.initQUERY();
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            layer.load(2);
            $http.post($scope.basePath + "customerTrainHourTable/queryForGrid", {
                params: angular.toJson(data)
            }).success(function (response) {
                if (response.code == 200) {
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            });
        };

    };

    $scope.initFunction = function () {
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function (item) {
            if (item && item.pkProject) {
                $scope.findOne(item.pkProject, function (response) {
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isEdit = false;
                    $scope.isDisabled = true;
                });
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
            $http.post($rootScope.basePath + "blobRefModel/queryForGrid")
                .success(function (response) {
                    if (response.code == 200) {
                        $scope.BLOBREFMODEL = response.item;
                    }
                });
            $http.post($rootScope.basePath + "userRef/queryForGrid")
                .success(function (response) {
                    if (response.code == 200) {
                        $scope.USERREF = response.item;
                    }
                });
            $http.post($rootScope.basePath + "areaclTreeRef/queryForGrid")
                .success(function (response) {
                    if (response.code == 200) {
                        $scope.AREACLTREEREF = response.item;
                    }
                });
            $http.post($rootScope.basePath + "equityNatureRef/queryForGrid")
                .success(function (response) {
                    if (response.code == 200) {
                        $scope.EQUITYNATUREREF = response.item;
                    }
                });
            $http.post($rootScope.basePath + "companyTypeRef/queryForGrid")
                .success(function (response) {
                    if (response.code == 200) {
                        $scope.COMPANYTYPEREF = response.item;
                    }
                });
            $http.post($rootScope.basePath + "industryTypeRef/queryForGrid")
                .success(function (response) {
                    if (response.code == 200) {
                        $scope.INDUSTRYTYPEREF = response.item;
                    }
                });
            $http.post($rootScope.basePath + "customerRef/queryForGrid")
                .success(function (response) {
                    if (response.code == 200) {
                        $scope.CUSTOMERREF = response.item;
                    }
                });
            $http.post($rootScope.basePath + "userRef/queryForGrid")
                .success(function (response) {
                    if (response.code == 200) {
                        $scope.USERREF = response.item;
                    }
                });
            $http.post($rootScope.basePath + "userRef/queryForGrid")
                .success(function (response) {
                    if (response.code == 200) {
                        $scope.USERREF = response.item;
                    }
                });
            $http.post($rootScope.basePath + "orgRef/queryForGrid")
                .success(function (response) {
                    if (response.code == 200) {
                        $scope.ORGREF = response.item;
                    }
                });
            $http.post($rootScope.basePath + "deptTreeRef/queryForGrid")
                .success(function (response) {
                    if (response.code == 200) {
                        $scope.DEPTTREEREF = response.item;
                    }
                });

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
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {name: 'name', displayName: '主讲讲师姓名', width: 100,},
                {name: 'hours', displayName: '主讲讲师课时', width: 100,},
            ]

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
                    angular.assignData($scope.VO, row.entity);
                    // $scope.findOne(rows[0].pkProject,function (response){
                    //     // $scope.appGridOptions.data=response.a;
                    //     // $scope.infoGridOptions.data=response.b;
                    // });
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });


        };

        $scope.selectTabName = 'customerTrainVOGridOptions';
        $scope.customerTrainVOGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {name: 'org_name', displayName: '业务单位', width: 100},
                {name: 'train_theme', displayName: '项目名称', width: 100},
                {name: 'train_date', displayName: '培训日期', width: 100},
                {name: 'begin_time', displayName: '培训开始时间', width: 100},
                {name: 'end_time', displayName: '培训终止时间', width: 100},
                {name: 'hours', displayName: '课时', width: 100},
            ],
            data: '',
            onRegisterApi: function (gridApi) {
                $scope.customerTrainVOGridOptions.gridApi = gridApi;
            }
        };
        /* $scope.linkmanVOGridOptions = {
         enableCellEditOnFocus: true,
         enableRowSelection: true,
         enableSelectAll: true,
         multiSelect: true,
         enableSorting: true,
         enableRowHeaderSelection: true,
         showColumnFooter: false,
         columnDefs: [
         {name: 'linkmanType', displayName: '联系人类型', width: 100},
         {name: 'name', displayName: '联系人姓名', width: 100},
         {name: 'dept', displayName: '联系人部门', width: 100},
         {name: 'address', displayName: '联系人地址', width: 100},
         {name: 'post', displayName: '邮编', width: 100},
         {name: 'tele', displayName: '联系人电话', width: 100},
         {name: 'fax', displayName: '传真', width: 100},
         {name: 'mail', displayName: '电子邮箱', width: 100},
         {name: 'memo', displayName: '备注', width: 100},
         {name: 'pkOperator', displayName: '经办人', width: 100},
         {name: 'operateDate', displayName: '制单日期', width: 100},
         {name: 'pkOrg', displayName: '业务单位', width: 100},
         {name: 'pkDept', displayName: '业务部门', width: 100},
         ],
         data: $scope.VO.linkmanVO,
         onRegisterApi: function (gridApi) {
         $scope.linkmanVOGridOptions.gridApi = gridApi;
         }
         };
         $scope.customerDeptVOGridOptions = {
         enableCellEditOnFocus: true,
         enableRowSelection: true,
         enableSelectAll: true,
         multiSelect: true,
         enableSorting: true,
         enableRowHeaderSelection: true,
         showColumnFooter: false,
         columnDefs: [
         {name: 'dept', displayName: '部门名称', width: 100},
         {name: 'remark', displayName: '备注', width: 100},
         {name: 'pkOperator', displayName: '经办人', width: 100},
         {name: 'operateDate', displayName: '制单日期', width: 100},
         ],
         data: $scope.VO.customerDeptVO,
         onRegisterApi: function (gridApi) {
         $scope.customerDeptVOGridOptions.gridApi = gridApi;
         }
         };*/



    };


    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();

    $scope.initButton();
    $scope.initPage();


});
app.controller('customerTrainVOGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
    /**
     * 初始化页面变更方法
     */
    var bakData = {};
    $scope.initData = function () {
        $scope.initVO = function () {
            return {};
        };
        //子表数据
        $scope.accountVO = $scope.initVO();
    };

    $scope.initFunction = function () {
        /**
         * 保存
         */
        $scope.onSave = function () {
            $scope.$parent.confirm($scope.accountVO);
            ngDialog.close();
        };

        $scope.onCancel = function () {
            angular.assignData($scope.accountVO, bakData);
            ngDialog.close();
        };

    };
    $scope.initData();
    $scope.initFunction();
});
app.controller('linkmanVOGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
    /**
     * 初始化页面变更方法
     */
    var bakData = {};
    $scope.initData = function () {
        $scope.initVO = function () {
            return {};
        };
        //子表数据
        $scope.linkmanVO = $scope.initVO();
    };

    $scope.initFunction = function () {
        /**
         * 保存
         */
        $scope.onSave = function () {
            $scope.$parent.confirm($scope.linkmanVO);
            ngDialog.close();
        };

        $scope.onCancel = function () {
            angular.assignData($scope.linkmanVO, bakData);
            ngDialog.close();
        };

    };
    $scope.initData();
    $scope.initFunction();
});
app.controller('customerDeptVOGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
    /**
     * 初始化页面变更方法
     */
    var bakData = {};
    $scope.initData = function () {
        $scope.initVO = function () {
            return {};
        };
        //子表数据
        $scope.customerDeptVO = $scope.initVO();
    };

    $scope.initFunction = function () {
        /**
         * 保存
         */
        $scope.onSave = function () {
            $scope.$parent.confirm($scope.customerDeptVO);
            ngDialog.close();
        };

        $scope.onCancel = function () {
            angular.assignData($scope.customerDeptVO, bakData);
            ngDialog.close();
        };

    };
    $scope.initData();
    $scope.initFunction();
});
