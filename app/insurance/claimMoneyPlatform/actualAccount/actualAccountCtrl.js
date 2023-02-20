app.controller('actualAccountCtrl', function ($rootScope, $scope, $http, $sce, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog,$state,$window) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "c_0_reciprocal_name":"",
                "c_0_transaction_date_f":"",
                "c_0_transaction_date_l":"",
                "c_0_amount_l":"",
                "c_0_amount_f":""
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.SV = {getdate:'20210224'};
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            if(null!=data.c_0_transaction_date_f&&null!=data.c_0_transaction_date_l&&""!=data.c_0_transaction_date_l
            &&data.c_0_transaction_date_l<data.c_0_transaction_date_f){
                return layer.alert("交易期间结束时间不能小于开始时间!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            if(null!=data.c_0_amount_f&&null!=data.c_0_amount_l
                &&parseFloat(data.c_0_amount_f)>parseFloat(data.c_0_amount_l)){
                return layer.alert("对账余额区间起不能大于止!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            layer.load(2);
            $http.post($scope.basePath + "actualAccount/queryForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response.code == 200) {
                    if (!$scope.query) {
                        $scope.query = $scope.gridOptions.columnDefs;
                    }
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            });
        };
    };


    $scope.initButton = function () {
        /**
         * 匹配
         */
        $scope.onAdd = function () {
            var app = "app.claimMoneyPlatform.subscription";
            var fun_code = "1402";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行匹配!", {skin: 'layui-layer-lan', closeBtn: 1});
            var id = rows[0].id;
            let param ={
                id: id,
                pkorg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                acountType : "1,5"
            }
            $http.post($scope.basePath + "subscription/getClearing", {
                params:param
            }).success(function (response)  {
                if (response && response.code == "200") {
                    $http.post($scope.basePath + "account/setFunCode", {funCode:fun_code}).success(function (response) {
                        layer.closeAll("loading");
                        var url=$state.href(app,{'id':id},{});
                        $window.open(url+"?id="+id);
                    });
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
                }
            });
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

        $scope.onImportUploads= function (type) {
            if(type){
                $("#inputFile").click();
            }else{
                var file = document.getElementById("inputFile").files[0];
                if(file!=null){
                    layer.load(2);
                    var form = new FormData();
                    form.append('file', file);
                    form.append('table', 'gLife');
                    $http({
                        method: 'POST',
                        url: $scope.basePath + 'actualAccount/importExcel',
                        data: form,
                        headers: {'Content-Type': undefined,'x-auth-token': window.sessionStorage.getItem("token")},
                        transformRequest: angular.identity
                    }).success(function (data) {
                        console.log(data.code);
                        layer.alert(data.msg, {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                        if(data.code == 200){
                            var obj = document.getElementById('inputFile') ;
                            obj.outerHTML=obj.outerHTML;
                        }
                    }).error(function (data) {
                        console.log(data.code);
                        layer.alert(data.msg, {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                    })
                }

            }
        } ;

        $scope.onImport = function () {
            var inputFile = $('#inputFile');
            inputFile.click();
        };

    };

    $scope.initPage = function () {
        $scope.form = false;
        $scope.card = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.isContinue = true;
        $scope.queryShow = true;
        //控制附件上传和下载
        $scope.upOrDown = false;
        //投标业务需总部配合准备资料 zhoul

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
            exporterCsvFilename: '实际到账流水.csv',
            columnDefs: [
                {name: 'serialnumber', displayName: '流水号'},
                {name: 'transaction_date', displayName: '交易日期'},
                // {name: 'transaction_time', displayName: '交易时间', width: 100,},
                {name: 'transaction_account', displayName: '交易账号'},
                {name: 'transaction_name.unitname', displayName: '交易账户名称'},
                {name: 'reciprocal_account', displayName: '对方账号'},
                {name: 'reciprocal_name.name', displayName: '对方户名'},
                {name: 'lender_amount', displayName: '贷方金额', cellFilter: 'AMOUNT_FILTER'},
                // {name: 'currency', displayName: '币种', width: 75,},
                {name: 'borrower_amount', displayName: '借方金额', cellFilter: 'AMOUNT_FILTER'},
                {name: 'amount', displayName: '余额',  cellFilter: 'AMOUNT_FILTER'},
                {name: 'matchingState', displayName: '匹配状态',  cellFilter: 'SELECT_MATCHINGSTATE'},
                // {name: 'transactionType', displayName: '交易类型',  cellFilter: 'SELECT_TRANSACTIONTYPE'},
                {name: 'abstract', displayName: '摘要'},
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
                    angular.assignData($scope.VO, row.entity);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });
        };
        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
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
                    if(rows[i].matchingState=="0"||rows[i].matchingState=="1"){
                        return layer.alert("已经认领匹配完成或匹配中途则不允许删除!", {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                    }
                    ids.push(rows[i].id);
                }
                layer.load(2);
                $http.post($scope.basePath + "actualAccount/delete", {ids: angular.toJson(ids),rows: angular.toJson(rows)}).success(function (response) {
                    layer.closeAll('loading');
                    if (response && response.code == "200") {
                        $scope.queryForGrid($scope.QUERY);
                        layer.msg('删除成功!', {
                            icon: 1
                        });
                    }

                });
            }
        );
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {
            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }
    };



    $scope.onExcel = function (){
        var exportEx = $('#exproE');
        exportEx.attr('target', '_blank');
        exportEx.attr('action', $rootScope.basePath + 'actualAccount/execleTemplate');
        exportEx.submit();
    }

    $scope.table_name = "lr_actualaccount";
    $scope.billdef = "actualAccount";
    $scope.initData();
    $scope.initHttp();
    $scope.initButton();
    $scope.initPage();
    $scope.onQuery();
    initworkflow($scope, $http, ngDialog);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);
});