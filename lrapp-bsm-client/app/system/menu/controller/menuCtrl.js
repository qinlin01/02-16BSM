/**
 */
app.controller('menuCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller) {


    $controller('baseController', {
        $rootScope: $rootScope, $scope: $scope, $http: $http, ngVerify: ngVerify
    });

    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {};
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {"operate_year": ""}
        };
        $scope.QUERY = $scope.initQUERY();
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            layer.load(2);
            $http.post($scope.basePath + "sys/menu/queryForGrid").success(function (response) {
                if (response.code == 200) {
                    $scope.gridOptions.data = response.data;
                }
                layer.closeAll('loading');
            });
        };
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + "sys/menu/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.data);
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
                    //layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "sys/menu/save", {data: angular.toJson($scope.VO), funcCode: $scope.funcCode})
                .success(function (response) {
                    if (response.code == 200) {
                        $scope.isGrid = true;
                        $scope.isForm = false;
                        $scope.isCard = false;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                    } else {
                        // e.g. 字符转换为Entity Name
                        response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                            var rs = asciiChartSet_c2en[matched];
                            return rs == undefined ? matched : rs;
                        });
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                });
        };

    };

    $scope.initFunction = function () {
        $scope.onRowDblClick = function (item) {
            if (item && item.pkProject) {
                $scope.findOne(item.menuId, function (response) {
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isForm = false;
                    $scope.isDisabled = true;
                });
            }

        };
    };

    $scope.initWatch = function () {

    };
    /**
     * 初始化参照
     */
    $scope.initView = function () {

    };
    $scope.initButton = function () {
        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };

    };

    $scope.onAdd = function () {
        $scope.isGrid = false;
        $scope.isForm = true;
        $scope.initView();
        angular.assignData($scope.VO, $scope.initVO());
        var rows = $scope.gridApi.selection.getSelectedRows();
        if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
            skin: 'layui-layer-lan',
            closeBtn: 1
        });
        $scope.VO.parentId = rows[0].menuId;
        $scope.VO.parentName = rows[0].menuName;


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
            $scope.findOne(rows[0].menuId);
            $scope.isForm = true;
        } else {
            $scope.isGrid = false;
            $scope.isForm = true;
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
                    ids.push(rows[i].menuId);
                }
                layer.load(2);
                $http.post($scope.basePath + "sys/menu/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
        $scope.isForm = false;
        $scope.isGrid = true;
        $scope.isCard = false;
    };
    /**
     * 返回
     */
    $scope.onBack = function () {

        $scope.isForm = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        //阻止页面渲染
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

    $scope.initPage = function () {

        $scope.isForm = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.queryShow = true;

        $scope.gridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            showTreeExpandNoChildren: false,
            useExternalPagination: true,
            columnDefs: [
                {name: 'menuId', displayName: '节点编码', width: 100,},
                {name: 'parentId', displayName: '父节点编码', width: 100,},
                {name: 'parentName', displayName: '父节点名称', width: 200,},
                {name: 'menuName', displayName: '节点名称', width: 200,},
                {name: 'menuUrl', displayName: '节点路径', width: 150,},
                {name: 'menuOrder', displayName: '节点排序', width: 100,},
                {name: 'icon', displayName: '图标', width: 100,},
                {name: 'menuCheck', displayName: '控制方法', width: 200,},
                {name: 'menuClick', displayName: '点击方法', width: 150,},
                {name: 'isButton', displayName: '是否按钮', width: 100, cellFilter: 'SELECT_YESNONUM'},
                {name: 'operate', displayName: '响应事件', width: 100,}
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
        };


        if ($stateParams.pk != null) {
            $scope.queryForGrid({});
        } /*else {
            $scope.queryForGrid();
        }*/
    };

    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.onQuery();


})
;
