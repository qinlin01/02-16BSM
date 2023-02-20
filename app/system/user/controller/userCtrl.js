app.controller('userCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller, $timeout ) {

    $controller('baseController', {
        $rootScope: $rootScope, $scope: $scope, $http: $http, ngVerify: ngVerify
    });

    $scope.orgTreeData = [];
    $scope.selectOrg = {};

    $scope.initData = function (data) {
        $scope.initVO = function () {
            return {
                lockedTag: "N",
                loginTag: "N",
                userRole: 1,
                userType: 0,
                userStatus: 0,
                beginTime: "00:00:00",
                endTime: "24:00:00",
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return { "operate_year": ""}
        };
        $scope.QUERY = $scope.initQUERY();

        $timeout(function () {
            $http.post($scope.basePath + "sys/org/orgTree").success(function (response) {
                if (response.code == 200) {
                    $scope.orgTreeData = response.data;
                }
            });
        });

    };
    $scope.url = function () {
        return "sys/user";
    };

    $scope.initView = function() {

        $scope.deptRefUrl = function (param) {
            return "sys/deptdoc/pageRef?params=" + param;
        }
    }
    $scope.initWatch = function () {
        $scope.$watch('VO.userType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isForm) {
                var myDate = new Date();
                // 临时账户，只能开放3个月
                if (newVal == 1) {
                    var month = myDate.getMonth() + 3;
                    myDate.setMonth(month);
                    $scope.VO.endDate = myDate.format("yyyy-MM-dd");
                    $scope.disStartDate = true;
                } else {
                    $scope.VO.endDate = '';
                    $scope.disStartDate = true;
                }
            }
        }, true);
    };

    $scope.initButton = function () {
        $scope.selectItem = function (branch) {
            $scope.QUERY['pk_org'] = branch.pk;
            $scope.onQuery();
            $scope.selectOrg = branch;
            return branch;
        };

        $scope.onCard = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();

            if (!rows || rows.length != 1) {
                layer.msg("请选择一条数据进行查看!", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                return;
            } else {
                $http.post($scope.basePath + $scope.url() + "/findOne", {
                    pk: rows[0].pkUser
                }).success(function (response) {
                    if (response && response.code == 200) {
                        angular.assignData($scope.VO, response.data);
                        $scope.isGrid = false;
                        $scope.isCard = true;
                        $scope.isForm = false;
                        angular.forEach($rootScope.currentTabs, function (item, index) {
                            if ($scope.funcCode == item.id) {
                                item.billId = $scope.VO.id;
                            }
                        });
                    } else {
                        if (response) {
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                });
            }
        };

        /**
         * 修改
         */
        $scope.onEdit = function () {
            $scope.initRefData();
            //  控制字表按钮的显示
            $scope.isForm = true;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) {
                    return layer.msg("请选择一条数据进行修改!", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                } else {
                    $scope.isGrid = false;
                    $scope.isCard = false;
                    $scope.isForm = true;
                    $scope.findOne(rows[0].pkUser);
                }

            } else {
                $scope.findOne($scope.VO.pkUser);
                $scope.isGrid = false;
                $scope.isCard = false;
                $scope.isForm = true;
            }
        };
        $scope.onPasswordReset = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.load(2);
            $http.post($rootScope.basePath + "sys/user/passwordRest", {userCode: rows[0].pkUser})
                .success(function (response) {
                    layer.closeAll('loading');

                    layer.msg("密码重置成功", {icon: 1, time: 2000, shade: [0.5, '#000000', true]});
                });
        };
        //解锁
        $scope.onUnlock = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.load(2);
            $http.post($rootScope.basePath + "sys/user/lockOrUnlockAccount", {userCode: rows[0].pkUser, type: "N"})
                .success(function (response) {
                    layer.closeAll('loading');
                    layer.msg("解锁成功", {icon: 1, time: 2000, shade: [0.5, '#000000', true]});
                })
        };

        //锁定
        $scope.onLock = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.load(2);
            $http.post($rootScope.basePath + "sys/user/lockOrUnlockAccount", {userCode: rows[0].pkUser, type: "Y"})
                .success(function (response) {
                    layer.closeAll('loading');
                    layer.msg("用户被锁定", {icon: 1, time: 2000, shade: [0.5, '#000000', true]});

                })
        };

        /*
         分配权限
         */
        $scope.onAuthority = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.load(2);
            ngDialog.openConfirm({
                template: 'system/user/view/modal/roleModal.html',
                controller: 'roleCtrl',
                data: {obj: rows[0]},
                closeByDocument: true,
                closeByEscape: true,
                cache: false
            }).then(function (value) {
                $scope.queryForGrid($scope.QUERY);
            }, function (reason) {
            });
        }

        $scope.checkDataBeforSave = function () {
            if ($scope.VO.memo.length != 18 && $scope.VO.memo.length != 15) {
                 layer.alert("身份证号位数不匹配!",
                    {skin: 'layui-layer-lan', closeBtn: 1});
                 return false;
            }
            return $scope.doCheckIdCard($scope.VO.memo);
        }
        $scope.doCheckIdCard = function (code) {
            var city = {
                11: "北京",
                12: "天津",
                13: "河北",
                14: "山西",
                15: "内蒙古",
                21: "辽宁",
                22: "吉林",
                23: "黑龙江 ",
                31: "上海",
                32: "江苏",
                33: "浙江",
                34: "安徽",
                35: "福建",
                36: "江西",
                37: "山东",
                41: "河南",
                42: "湖北 ",
                43: "湖南",
                44: "广东",
                45: "广西",
                46: "海南",
                50: "重庆",
                51: "四川",
                52: "贵州",
                53: "云南",
                54: "西藏 ",
                61: "陕西",
                62: "甘肃",
                63: "青海",
                64: "宁夏",
                65: "新疆",
                71: "台湾",
                81: "香港",
                82: "澳门",
                91: "国外 "
            };
            var tip = "";
            var pass = true;

            if (code) {
                if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
                    tip = "身份证号格式错误,请重新输入：";
                    pass = false;
                } else if (!city[code.substr(0, 2)]) {
                    tip = "身份证号地址编码错误，请重新输入：";
                    pass = false;
                } else {
                    //18位身份证需要验证最后一位校验位
                    if (code.length == 18) {
                        code = code.split('');
                        //∑(ai×Wi)(mod 11)
                        //加权因子
                        var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
                        //校验位
                        var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
                        var sum = 0;
                        var ai = 0;
                        var wi = 0;
                        for (var i = 0; i < 17; i++) {
                            ai = code[i];
                            wi = factor[i];
                            sum += ai * wi;
                        }
                        var last = parity[sum % 11];
                        if (parity[sum % 11] != code[17].toUpperCase()) {
                            tip = "身份证号输入位数错误，请重新输入：";
                            pass = false;
                        }
                    }
                }
                if (!pass) {
                    layer.alert(tip,
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }
                return pass;
            } else {
                return false;
            }
        }
    };

    $scope.initPage = function () {
        $scope.form = false;
        $scope.card = false;

        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isForm = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;
        $scope.disStartDate = true;
        $scope.isCanEdit = true;

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
                {name: 'userCode', displayName: '用户编码', width: 100,},
                {name: 'userName', displayName: '用户名', width: 100,},
                {name: 'roleName', displayName: '关联角色', cellTooltip: true, headerTooltip: true, width: 100,},
                {name: 'userType', displayName: '用户类型', width: 100, cellFilter: 'SELECT_USER_TYPE'},
                {name: 'userRole', displayName: '用户角色', width: 100, cellFilter: 'SELECT_USER_ROLE'},
                {name: 'userStatus', displayName: '用户状态', width: 100, cellFilter: 'SELECT_USER_STATUS'},
                {name: 'loginTag', displayName: '登录标志', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'beginDate', displayName: '生效日期', width: 100,},
                {name: 'endDate', displayName: '失效日期', width: 100,},
                {name: 'orgName', displayName: '所属公司', width: 100,},
                {name: 'deptName', displayName: '所属部门', width: 100,},
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
            $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (rows.length == 1) {
                    if (!$scope.chilbTable) {
                        $scope.chilbTable = true;
                    }
                    angular.assignData($scope.VO, row.entity);
                    $scope.findOne(rows[0].pkUser);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });
        };


        if ($stateParams.pk != null) {
            $scope.queryForGrid({});
        }/* else {
            $scope.queryForGrid();
        }*/
    };

    $scope.initData();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
});

app.controller('roleCtrl', function ($rootScope, $scope, $http, $timeout, ngDialog, $compile) {
    $scope.userobj = $scope.ngDialogData.obj;
    //列表查询
    $scope.queryForGridGroup = function (data) {
        layer.load(2);
        $http.post($rootScope.basePath + "sys/group/queryAll", {data: angular.toJson(data)})
            .success(function (response) {
                if (response.code == 200) {
                    $scope.groupGridOptions.data = response.data;
                    $timeout(function () {
                        if ($scope.userobj.roleName) {
                            var role = $scope.userobj.roleName.split(',');
                            for (var i = 0; i < $scope.groupGridOptions.data.length; i++) {
                                if (role.indexOf($scope.groupGridOptions.data[i].groupName) != -1) {
                                    $scope.gridApi.selection.selectRow($scope.groupGridOptions.data[i], false);
                                }
                            }
                        }
                    }, 5);
                }
                layer.closeAll('loading');
            });
    };
    $scope.queryForGridGroup();
    $scope.groupGridOptions = {
        enableRowSelection: true,
        enableSelectAll: true,
        enableFullRowSelection: true,//是否点击cell后 row selected
        enableRowHeaderSelection: true,
        multiSelect: true,//多选
        useExternalPagination: true,
        columnDefs: [
            {name: 'groupCode', displayName: '角色编码', width: 100,},
            {name: 'groupName', displayName: '角色名称', width: 200,},
        ],
        data: []
    };
    $scope.groupGridOptions.onRegisterApi = function (gridApi) {
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
    $scope.saveAuthority = function () {
        var rows = $scope.gridApi.selection.getSelectedRows();
        var authority = {};
        var ids = [];
        for (var i = 0; i < rows.length; i++) {
            ids.push(rows[i].pkGroup);
        }
        authority.role = ids;
        authority.account = $scope.userobj.pkUser;
        layer.load(2);
        $http.post($rootScope.basePath + "sys/user/addUserRole", {data: angular.toJson(authority)})
            .success(function (response) {
                if (response.code == 200) {
                    layer.msg("功能注册成功", {icon: 1, time: 2000, shade: [0.5, '#000000', true]});
                }
            });
    }
});

app.controller('passwordRestCtrl', ['$scope', '$rootScope', '$http', 'ngDialog', 'FileUploader', 'ngVerify', function ($scope, $rootScope, $http, ngDialog, FileUploader, ngVerify) {
    $scope.btnDisabled = false;
    $scope.VO.password = "";
    $scope.closeWin = function () {
        //关闭自己的窗口
        ngDialog.close(this.ngDialogId);
    };
    $scope.confirm = function () {
        if ($scope.VO.password == $scope.VO.confirmPassword) {
            $http.post($scope.basePath + "sys/user/passwordRest", {
                userCode: $scope.VO.user_code,
                password: encryptByDES($scope.VO.password, '12345678'),
                confirmPassword: encryptByDES($scope.VO.confirmPassword, '12345678')
            }).success(function (response) {
                if (response.code == 200) {
                    layer.msg(response.msg);
                    ngDialog.close();
                } else {
                    layer.alert(response.msg);
                }
            });
        } else {
            layer.alert("新密码与确认密码不匹配");
        }
    };
    $scope.initWatch = function () {
        $scope.process = {
            style: '',
            progress: 0,
            text: ''
        };
        $scope.$watch('VO.password', function (newVal) {
            if (newVal) {
                $http.post($scope.basePath + "sys/account/checkIntensity", {
                    password: encryptByDES(newVal, '12345678')
                }).success(function (response) {
                    if (response.intensity == '0' || response.intensity == '1') {
                        $scope.process.style = 'red';
                        $scope.process.progress = 25;
                        $scope.process.text = "弱";
                    } else if (response.intensity == '2') {
                        $scope.process.style = 'yellow';
                        $scope.process.progress = 50;
                        $scope.process.text = "中";
                    } else if (response.intensity == '3') {
                        $scope.process.style = 'green';
                        $scope.process.progress = 75;
                        $scope.process.text = "强";
                    } else if (response.intensity == '4') {
                        $scope.process.style = 'green';
                        $scope.process.progress = 100;
                        $scope.process.text = "极好";
                    }
                });
            } else {
                $scope.process = {
                    style: '',
                    progress: 0,
                    text: ''
                };
            }
        });
    };

    $scope.initWatch();
}]);
