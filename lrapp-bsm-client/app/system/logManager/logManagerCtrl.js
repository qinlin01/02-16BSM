app.controller('logManagerCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                revertFileName: []
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            //return {operateDate: new Date().format("yyyy-MM-dd")}
            // $http.post($scope.basePath + "validate/getlog", {
            //     data:encryptByDES('LogManagerController','12345678')
            // });
            return {
                sort_rule: '时间降序'
            }
        };
        $scope.QUERY = $scope.initQUERY();
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            // if(!findImpData(data)){
            //     return false;
            // }
            layer.load(2);
            $http.post($scope.basePath + "sys/logManager/queryForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize
                // fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response.code == 200) {
                    if (!$scope.query) {
                        $scope.query = $scope.gridOptions.columnDefs;
                    }
                    $scope.gridOptions.data = response.data.records;
                    $scope.gridOptions.totalItems = response.data.total;
                }
                layer.closeAll('loading');
            });
        };
        $scope.onWatchRecordSize = function () {
            $http.post($scope.basePath + "sys/logManager/onWatchRecordSize", {}).success(function (response) {
                if (response && response.code == "200") {
                    $scope.VO.currentSize = response.currentSize;
                }
            });
        };
        $scope.onBackup = function () {
            layer.load(2);
            $http.post($scope.basePath + "sys/logManager/onBackUp", {}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
        $scope.onRevert = function () {
            // if ($scope.VO.revertFileName == null ||"" == $scope.VO.revertFileName) return layer.alert("请输入要还原的文件名!", {
            //     skin: 'layui-layer-lan',
            //     closeBtn: 1
            // });
            layer.load(2);
            $http.post($scope.basePath + "sys/logManager/onBeforeRevert", {
                revertBeginDate: $scope.VO.revertBeginDate,
                revertEndDate: $scope.VO.revertEndDate
            }).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
    };

    $scope.initFunction = function () {
    };

    $scope.initWatch = function () {

    };

    $scope.initButton = function () {

        $scope.onImport = function () {
            $scope.isSubDisabled = false;

            $scope.aVO = {};
            /*else {
             $scope.bVO = {};
             }*/
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/common/attachmentLog.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                preCloseCallback: function (value) {
                    if (value && value == "clear") {
                        //重置
                        return false;
                    }
                    //取消
                    return true;
                }
            }).then(function (value) {

            }, function (reason) {

            });
        };
        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };
        $scope.onReset = function () {
            $scope.onWatchRecordSize();
            $scope.QUERY = $scope.initQUERY();
            $scope.QUERY.id = null;
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
                    // var ids = [];
                    // for (var i = 0; i < rows.length; i++) {
                    //     ids.push(rows[i]._id);
                    // }
                    layer.load(2);
                    $http.post($scope.basePath + "logManager/delete", {ids: angular.toJson(rows)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg('删除成功!', {
                                icon: 1
                            });
                        } else {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg(response.msg, {
                                icon: 1
                            });
                        }

                    });
                }
            );
        };
    };

    $scope.initPage = function () {
        $scope.onWatchRecordSize();
        $scope.form = false;
        $scope.card = false;

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
            paginationPageSizes: [500, 1000],
            paginationPageSize: 500,
            useExternalPagination: true,
            enableColumnMoving: true,
            enableGridMenu: true,
            exporterMenuCsv: true,
            exporterOlderExcelCompatibility: false,
            exporterCsvFilename: '系统日志.csv',
            columnDefs: [
                {name: 'funcName', displayName: '功能节点名称', width: 100},
                {name: 'type', displayName: '事件类型', width: 100, cellFilter: 'SELECT_LOG_TYPE'},
                {name: 'title', displayName: '亊件描述', width: 200},
                {name: 'requestUri', displayName: '请求地址', width: 230},
                {name: 'exception', displayName: '异常信息', width: 230},
                {name: 'exceptionType', displayName: '异常类型', width: 100, cellFilter: 'SELECT_LOG_EXCEPTION'},
                {name: 'clientIp', displayName: '客户端IP', width: 100,},
                {name: 'createBy', displayName: '操作人', width: 100,},
                {name: 'createTime', displayName: '亊件日期', width: 150, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'operationName', displayName: '操作类型', width: 100},
                //{name: 'isBackUp', displayName: '是否已备份', width: 100,}
            ],
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
        };


        if ($stateParams.pk != null) {
            $scope.queryForGrid({});
        }

        $scope.queryForGrid();
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
    };

    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();


});
``