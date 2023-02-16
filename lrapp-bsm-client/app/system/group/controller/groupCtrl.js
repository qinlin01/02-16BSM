/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('groupCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller) {

    $controller('baseController', {
        $rootScope: $rootScope, $scope: $scope, $http: $http, ngVerify: ngVerify
    });

    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                dr: 0,
                groupCode: "",
                groupName: "",
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {"operate_year": new Date().format("yyyy")}
        };
        $scope.QUERY = $scope.initQUERY();
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            layer.load(2);
            $http.post($scope.basePath + "sys/group/queryForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize
            }).success(function (response) {
                if (response.code == 200) {
                    $scope.gridOptions.data = response.data.records;
                    $scope.gridOptions.totalItems = response.data.total;
                }
                layer.closeAll('loading');
            });
        };
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + "sys/group/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.data);
                } else {
                    if (response.msg) {
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                }
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "sys/group/save", {
                data: angular.toJson($scope.VO),
                funcCode: $scope.funcCode
            })
                .success(function (response) {
                    if (!response.code == 200) {
                        $scope.isGrid = false;
                        $scope.isForm = false;
                        $scope.isCard = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                    } else {
                        if (response.msg) {
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                });

        };
    };

    $scope.initFunction = function () {
    };
    $scope.initButton = function () {
        /*
         分配资源
         */
        $scope.onAuthorization = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.load(2);
            ngDialog.openConfirm({
                template: getURL('system/group/view/modal/menuModal.html'),
                controller: 'menuModalCtrl',
                className: 'ngdialog-theme-plain',
                width: 1000,
                height: 750,
                data: {obj: rows[0]},
                closeByDocument: false,
            }).then(function (value) {
                $scope.queryForGrid($scope.QUERY);
            }, function (reason) {
            });
        }
        /***
         * 查看
         */
        $scope.onView = function () {

            //  控制字表按钮的显示
            $scope.isForm = false;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                // layer.load(2);
                $scope.findOne(rows[0].pkGroup, function (response) {
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isForm = false;
                    $scope.isDisabled = true;
                });
            }
        };

        $scope.onAdd = function () {
            $scope.form = true;
            $scope.isGrid = false;
            $scope.isForm = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            // $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            $scope.isForm = true;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form = true;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].pkGroup);
                $scope.isBack = true;
                $scope.isForm = true;
                $scope.isDisabled = false;
            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isForm = true;
                $scope.isDisabled = false;
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
                        ids.push(rows[i].pkGroup);
                    }
                    layer.load(2);
                    $http.post($scope.basePath + "group/delete", {ids: angular.toJson(ids)}).success(function (response) {
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


        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            $scope.isGrid = true;
            $scope.isCard = false;
            $scope.isForm = false;
            $scope.isForm = false;
            $scope.bindData($scope.initVO());
        };
        /**
         * 返回
         */
        $scope.onBack = function () {
            //阻止页面渲染
            $scope.isGrid = true;
            $scope.isCard = false;
            $scope.isForm = false;
            $scope.isForm = false;
            $scope.initData();
            $scope.queryForGrid($scope.QUERY);
            angular.forEach($rootScope.currentTabs, function (item, index) {
                if ($scope.funcCode == item.pkGroup) {
                    item.billId = null;
                }
            });
        };
        /**
         * 保存判断必输项
         */
        $scope.onSave = function () {
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    $scope.onSaveVO();
                }
            }, true);
        };

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };
        $scope.onReset = function () {
            $scope.QUERY = $scope.initQUERY();
            $scope.QUERY.pkGroup = null;
        };

        /**
         * 子表新增
         */
        $scope.onAddLine = function () {
            $scope[$scope.selectTabName].data.push({});

        };
        /**
         * 子表删除
         */
        $scope.onDeleteLine = function () {
            var delRow = $scope[$scope.selectTabName].gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (var i = 0; i < $scope[$scope.selectTabName].data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope[$scope.selectTabName].data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope[$scope.selectTabName].data.splice(i, 1);
                    }
                }
            }
        };
    };

    $scope.initPage = function () {
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isForm = false;

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
            columnDefs: [
                {name: 'groupCode', displayName: '角色编码', width: 120,},
                {name: 'groupName', displayName: '角色名称', width: 170,},
                {name: 'menuName', displayName: '资源名称', cellTooltip: true, headerTooltip: true, width: 150,},
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
                $scope.queryForGrid($scope.QUERY);
            });
        };


        if ($stateParams.pk != null) {
            $scope.queryForGrid({});
        } /*else {
            $scope.queryForGrid();
        }*/
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
    };

    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initButton();
    $scope.initPage();
    $scope.onQuery();


});

app.controller('menuModalCtrl', function ($rootScope, $scope, $http, $timeout, ngDialog, $compile) {
    $scope.roleobj = $scope.ngDialogData.obj;
    $scope.roles = [];
    $scope.findGroupRole = function () {
        $http.post($scope.basePath + "sys/menu/findGroupRole", {pk: $scope.roleobj.pkGroup}).success(function (response) {
            if (response.code == 200) {
                // angular.forEach(response.data, function (obj, index) {
                //     $scope.roles.push(obj);
                // });
                $scope.addGroupPowerGridOptions.data = response.data;
                $scope.queryForGridGroup();
            }
        });
    }
    //列表查询
    $scope.queryForGridGroup = function (data) {
        layer.load(2);
        $http.post($scope.basePath + "sys/menu/queryForGrid").success(function (response) {
            if (response.code == 200) {
                $scope.groupPowerGridOptions.data = response.data;
                // $timeout(function () {
                //     var menu = $scope.roles.toString();
                //     for (var i = 0; i < $scope.roles.length && menu != null; i++) {
                //         angular.forEach($scope.groupPowerGridOptions.data, function (obj, index) {
                //             if (menu.indexOf(obj.menuId) != -1) {
                //                 $scope.gridApi.selection.selectRow($scope.groupPowerGridOptions.data[i], false);
                //             }
                //         });
                //
                //     }
                // }, 5);
            }
            layer.closeAll('loading');
        });
    };
    $scope.findGroupRole();
    $scope.groupPowerGridOptions = {
        enableRowSelection: true,
        enableSelectAll: true,
        enableFullRowSelection: true,//是否点击cell后 row selected
        enableRowHeaderSelection: true,
        multiSelect: true,//多选
        showTreeExpandNoChildren: false,
        useExternalPagination: true,
        // enableFiltering: true,
        columnDefs: [
            {name: 'menuId', displayName: '节点编码', width: 100,},
            {name: 'parentName', displayName: '父节点名称', width: 120,},
            {name: 'menuName', displayName: '节点名称', width: 120,},
        ],
        data: []
    };
    $scope.groupPowerGridOptions.onRegisterApi = function (gridApi) {
        //set gridApi on scope
        $scope.gridApi = gridApi;
        //添加行头
        $scope.gridApi.core.addRowHeaderColumn({
            name: 'rowHeaderCol',
            displayName: '',
            width: 30,
            cellTemplate: 'ui-grid/rowNumberHeader'
        });
        $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
            // var rows = $scope.gridApi.selection.getSelectedRows();
            var rows = row.entity;
            if (row.isSelected) {
                $scope.pushChildren(rows);
            }
            // angular.forEach(rows.children, function (obj, index) {
            //     $scope.pushChildren(obj);
            // });
        });
    };
    $scope.addGroupPowerGridOptions = {
        enableRowSelection: true,
        enableSelectAll: true,
        enableFullRowSelection: true,//是否点击cell后 row selected
        enableRowHeaderSelection: true,
        multiSelect: true,//多选
        showTreeExpandNoChildren: false,
        useExternalPagination: true,
        // enableFiltering: true,
        columnDefs: [
            {name: 'menuId', displayName: '节点编码', width: 100,},
            {name: 'parentName', displayName: '父节点名称', width: 120,},
            {name: 'menuName', displayName: '节点名称', width: 120,},
        ],
        data: []
    };
    $scope.addGroupPowerGridOptions.onRegisterApi = function (gridApi) {
        //set gridApi on scope
        $scope.addGroupPowerGridOptions.gridApi = gridApi;
        //添加行头
        $scope.addGroupPowerGridOptions.gridApi.core.addRowHeaderColumn({
            name: 'rowHeaderCol',
            displayName: '',
            width: 30,
            cellTemplate: 'ui-grid/rowNumberHeader'
        });
    };
    $scope.saveAuthority = function () {
        var rows = $scope.addGroupPowerGridOptions.data;
        if (!rows || rows.length == 0) return layer.alert('请选择一行数据', {
            skin: 'layui-layer-lan',
            closeBtn: 1
        });
        var authority = {};
        var ids = [];
        for (var i = 0; i < rows.length; i++) {
            ids.push(rows[i].menuId);
        }
        authority.menuId = ids;
        authority.role = $scope.roleobj.pkGroup;
        layer.load(2);
        $http.post($rootScope.basePath + "sys/menu/addGroupPwor", {data: angular.toJson(authority)})
            .success(function (response) {
                if (response.code == 200) {
                    $scope.$parent.confirm();
                    layer.alert("资源分配完成！", {skin: 'layui-layer-lan', closeBtn: 1});
                    ngDialog.close();
                }
            });
    };

    $scope.onAllGroup = function () {
        $scope.addGroupPowerGridOptions.data = [];
        angular.forEach($scope.groupPowerGridOptions.data, function (obj, index) {
            $scope.addGroupPowerGridOptions.data.push(obj);
        });
        // $scope.addGroupPowerGridOptions.data = $scope.groupPowerGridOptions.data;
    }

    $scope.onPowerDelete = function () {
        var rows = $scope.addGroupPowerGridOptions.gridApi.selection.getSelectedRows();
        if (!rows || rows.length == 0) return layer.alert('请选择一行数据', {
            skin: 'layui-layer-lan',
            closeBtn: 1
        });

        $scope.deleteWithChildren(rows);

    }

    $scope.pushChildren = function (rows) {

        var rowdata = rows;
        var isselect = false;
        for (let i = 0; i < $scope.addGroupPowerGridOptions.data.length; i++) {
            if ($scope.addGroupPowerGridOptions.data[i].menuId == rowdata.menuId) {
                isselect = true;
                break;
            }
        }
        if (isselect) {
            return;
        }
        $scope.addGroupPowerGridOptions.data.push(rowdata);
        if (rows.children && rows.children.length > 0) {
            angular.forEach(rows.children, function (obj, index) {
                $scope.pushChildren(obj);
            });
        }
    }

    $scope.deleteWithChildren = function (rows) {
        for (var j = 0; j < rows.length; j++) {

            for (var i = 0; i < $scope.addGroupPowerGridOptions.data.length; i++) {
                if ($scope.addGroupPowerGridOptions.data[i].menuId == rows[j].menuId) {
                    $scope.addGroupPowerGridOptions.data.splice(i, 1);
                }
            }
            if (rows[j].children && rows[j].children.length > 0) {
                $scope.deleteWithChildren(rows[j].children)
            }


        }

    }
});


