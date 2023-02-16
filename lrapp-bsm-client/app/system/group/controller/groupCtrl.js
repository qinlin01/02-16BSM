/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('groupCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                pk_operator: $rootScope.userVO.pk,
                pkDept: $rootScope.deptVO,
                operate_date: new Date().format("yyyy-MM-dd"),
                operate_time: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                dr: 0,
                group_code:"",
                group_name:"",
                pk_operator:"",
                pk_org:$rootScope.orgVO.pk,
                costscale: [],
                coomedium: []
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
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
            $http.post($scope.basePath + "group/queryForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize
            }).success(function (response) {
                if (response.code == 200) {
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            });
        };
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + "group/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
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
                   // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "group/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                    }
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
                    // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                });

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
    $scope.initButton = function () {
        /*
         分配资源
         */
        $scope.onAuthorization = function(){
            var rows = $scope.gridApi.selection.getSelectedRows();
            if(!rows || rows.length !=1 ) return layer.alert("请选择一条数据!", {skin: 'layui-layer-lan',closeBtn: 1});
            layer.load(2);
            ngDialog.openConfirm({
                template: 'view/group/modal/menuModal.html',
                controller: 'menuModalCtrl',
                data:{obj:rows[0]},
                closeByDocument: true,
                closeByEscape: true,
                cache:false
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

        $scope.onAdd = function () {
            $scope.form=true;
            $scope.isGrid = false;
            $scope.isEdit = true;
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
            $scope.isEdit = true;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form=true;
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
                        ids.push(rows[i].id);
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

        /*
         * 关联
         * */
        $scope.onLink = function () {

        };

        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            $scope.isDisabled = true;
            $scope.isEdit = false;
            $scope.isBack = false;
        };
        /**
         * 返回
         */
        $scope.onBack = function () {
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isDisabled = true;
            //阻止页面渲染
            $scope.form=false;
            $scope.card=false;
            $scope.queryForGrid($scope.QUERY);
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
            $scope.QUERY.id = null;
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
        $scope.form=false;
        $scope.card=false;

        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;

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
                {name: 'group_code', displayName: '角色编码', width: 100,},
                {name: 'group_name', displayName: '角色名称', width: 100,},
                {name: 'menuName', displayName: '资源名称',cellTooltip: true, headerTooltip: true, width: 150,},
                {name: 'pk_org_name', displayName: '所属机构', width: 100,},
                {name: 'pk_operator_name', displayName: '录入人', width: 100,},
                {name: 'operate_date', displayName: '录入日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'operate_time', displayName: '录入时间', width: 100,},
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


});

app.controller('menuModalCtrl', function ($rootScope,$scope, $http,$timeout,ngDialog,$compile) {
    $scope.roleobj = $scope.ngDialogData.obj;
    //列表查询
    $scope.queryForGridGroup = function (data) {
        layer.load(2);
        $http.post($scope.basePath + "menu/queryForGrid").success(function (response) {
            if (response.code == 200) {
                $scope.groupPowerGridOptions.data = response.result.Rows;
                $timeout(function() {
                    var menu = $scope.roleobj.menuName && $scope.roleobj.menuName.split(',');
                    for (var i = 0;i<$scope.groupPowerGridOptions.data.length&&menu != null;i++){
                        if(menu.indexOf($scope.groupPowerGridOptions.data[i].pk) != -1){
                            $scope.gridApi.selection.selectRow($scope.groupPowerGridOptions.data[i],false);
                        }
                    }
                },5);
            }
            layer.closeAll('loading');
        });
    };
    $scope.queryForGridGroup();
    $scope.groupPowerGridOptions= {
        enableRowSelection: true,
        enableSelectAll: true,
        enableFullRowSelection: true,//是否点击cell后 row selected
        enableRowHeaderSelection: true,
        multiSelect: true,//多选
        showTreeExpandNoChildren: true,
        useExternalPagination: true,
        enableFiltering: true,
        columnDefs: [
            {name: 'pk', displayName: '节点编码', width: 100,},
            {name: 'parent_name', displayName: '父节点名称', width: 120,},
            {name: 'menu_name', displayName: '节点名称', width: 120,},
        ],
        data: []
    };
    $scope.groupPowerGridOptions.onRegisterApi = function(gridApi){
        //set gridApi on scope
        $scope.gridApi = gridApi;
        //添加行头
        $scope.gridApi.core.addRowHeaderColumn( { name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'} );
        $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
            if ($scope.addGroupPowerGridOptions.data.indexOf(row.entity) == -1) {
                $scope.addGroupPowerGridOptions.data.push(row.entity);
            }
        });
    };
    $scope.addGroupPowerGridOptions= {
        enableRowSelection: true,
        enableSelectAll: true,
        enableFullRowSelection: true,//是否点击cell后 row selected
        enableRowHeaderSelection: true,
        multiSelect: true,//多选
        showTreeExpandNoChildren: true,
        useExternalPagination: true,
        enableFiltering: true,
        columnDefs: [
            {name: 'pk', displayName: '节点编码', width: 100,},
            {name: 'parent_name', displayName: '父节点名称', width: 120,},
            {name: 'menu_name', displayName: '节点名称', width: 120,},
        ],
        data: []
    };
    $scope.addGroupPowerGridOptions.onRegisterApi = function(gridApi){
        //set gridApi on scope
        $scope.addGroupPowerGridOptions.gridApi = gridApi;
        //添加行头
        $scope.addGroupPowerGridOptions.gridApi.core.addRowHeaderColumn( { name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'} );
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
            ids.push(rows[i].pk);
        }
        authority.menuId = ids;
        authority.role = $scope.roleobj.pk_group;
        layer.load(2);
        $http.post($rootScope.basePath + "menu/addGroupPwor",{data:angular.toJson(authority)})
            .success(function(response) {
                if (response.code == 200) {
                    $scope.$parent.confirm();
                    layer.alert("资源分配完成！", {skin: 'layui-layer-lan', closeBtn: 1});
                    ngDialog.close();
                }
            });
    };

    $scope.changeNav = function (dom,data) {
        if(data instanceof Array){
            var tindex = 0;
            for(var i =0 ;i<data.length; i++){
                var html = "";
                if(data[i].Icon == ""){
                    html = '<li ui-sref-active="active"> <a ui-sref="'+data[i].menu_url+'" class="auto"> <div class="item-content"> <div class="item-media"> <i class="'+data[i].Icon+'"></i> </div> <div class="item-inner" ng-click=clickMenu("'+ data[i].pk +'","'+ data[i].menu_url +'","'+ data[i].menu_name +'")><span class="title" >'+ data[i].menu_name+'</span> </div> </div> </a> </li>'
                }else{
                    html = '<li ng-class="{active:$state.includes('+data[i].menu_url+')}"> <a  class="auto"> <div class="item-content"><div class="item-media">  <i class="'+data[i].Icon+'"></i> </div> <div class="item-inner"> <span class="pull-right text-muted"><i class="fa fa-fw fa-angle-right text"></i><i class="fa fa-fw fa-angle-down text-active"></i></span><span class="title" >'+ data[i].menu_name+'</span> </div> </div> </a> </li>'
                }
                var dom1 = $(html);
                if(data[i].parentId != null && data[i].parentId != ""){
                    if(tindex == 0){
                        var html2 = '<ul class="sub-menu"></ul>'
                        var dom2 = $(html2);
                        dom2.append(dom1);
                        dom.append(dom2);
                    }else{
                        $(dom).find('ul').first().append(dom1);
                    }
                    tindex = 1;
                }else{
                    dom.append(dom1);
                }
                if(data[i].children && data[i].children.length != 0){
                    $scope.changeNav(dom1,data[i].children);
                }
            }
        }
        $scope.newElm = $compile($scope.newElm)($scope);
        return $scope.newElm;
    };

    $scope.onAllGroup = function(){
        $scope.addGroupPowerGridOptions.data = $scope.groupPowerGridOptions.data;
    }

    $scope.onPowerDelete = function () {
        var rows = $scope.addGroupPowerGridOptions.gridApi.selection.getSelectedRows();
        if (!rows || rows.length == 0) return layer.alert('请选择一行数据', {
            skin: 'layui-layer-lan',
            closeBtn: 1
        });

        $scope.deleteWithChildren(rows);

    }
    $scope.deleteWithChildren = function (rows) {
        for (var j = 0; j < rows.length; j++) {

            for (var i = 0; i < $scope.addGroupPowerGridOptions.data.length; i++) {
                if ($scope.addGroupPowerGridOptions.data[i].pk == rows[j].pk) {
                    $scope.addGroupPowerGridOptions.data.splice(i, 1);
                }
            }
            if (rows[j].children && rows[j].children.length > 0) {
                $scope.deleteWithChildren(rows[j].children)
            }


        }

    }
});


