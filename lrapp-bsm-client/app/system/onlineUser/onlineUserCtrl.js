app.controller('onlineUserCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller ) {

    $controller('baseController', {
        $rootScope: $rootScope, $scope: $scope, $http: $http, ngVerify: ngVerify
    });
    $scope.initData = function (data) {
        $scope.initVO = function () {
            return {
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
       $scope.initQUERY = function () {
            return { };
        };
        $scope.QUERY = $scope.initQUERY();
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "sys/onlineUser/queryForGrid", {
                params: angular.toJson(data)
            }).success(function (response) {
                if (response.code == 200) {
                    $scope.gridOptions.data = response.data;
                }
                layer.closeAll('loading');
            });
        };
    };

    $scope.initFunction = function () {
        $scope.onRemoveUser = function (item) {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0 || rows.length != 1) return layer.alert("请选择用户进行踢出。", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.confirm('是否踢出选中的用户？', {
                    btn: ['确认', '返回'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消!', {
                            shift: 6,
                            icon: 11
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    var id =rows[0].id;
                    layer.load(2);
                    $http.post($scope.basePath + "sys/onlineUser/removeUser", {id: id}).success(function (response) {
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

    };

    $scope.initWatch = function () {

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
        };

        /**
         * 初始化参照
         */
        $scope.initView = function () {

        };
    };

    $scope.initPage = function () {

        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;

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
                {name: 'user_code', displayName: '用户编码', width: 100},
                {name: 'ip', displayName: '登陆IP地址', width: 100},
                {name: 'creation_time', displayName: '登陆时间', width: 200},
                {name: 'lastAccessedTimedate', displayName: '最近访问系统时间', width: 200},
                {name: 'ip', displayName: 'IP地址', width: 100},
                {name: 'fun_name', displayName: '打开节点', width: 100},
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

            $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (rows.length == 1) {
                    angular.assignData($scope.VO, row.entity);
                    // $scope.findOne(rows[0].id);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });


        };
    };

    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.queryForGrid();


});