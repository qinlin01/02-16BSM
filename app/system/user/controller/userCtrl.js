
app.controller('userCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                operateDate: new Date().format("yyyy-MM-dd"),
                begin_date: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                pk_operator: $rootScope.userVO,
                isContinue: 0,
                dr: 0,
                locked_tag:"N",
                login_tag:"N",
                user_role:2,
                user_type:0,
                user_status:0,
                begin_time:"00:00:00",
                end_time:"24:00:00",
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
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "user/queryForGrid", {
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
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + "user/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    if ($scope.VO.begin_time == null) {
                        $scope.VO.begin_time ="00:00:00";
                    }
                    if ($scope.VO.end_time == null) {
                        $scope.VO.end_time ="24:59:59";
                    }
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
                  //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "user/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        $scope.disStartDate = true;
                        $scope.isCanEdit = true;
                        if(response.result){
                            angular.assignData($scope.VO, response.result);
                        }
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;

                    }
                    if(response){

                        // var user = response.result;
                        // var authority = {};
                        // authority.role = ["default"];
                        // authority.account = $scope.VO.id;
                        // layer.load(2);
                        //
                        // $http.post($rootScope.basePath + "user/addUserRole",{data:angular.toJson(authority)})
                        //     .success(function(response) {
                        //         if(response.code == 200){
                        //             if(response.data){
                        //                 $scope.html='<ul class="main-navigation-menu"></ul>'
                        //                 $scope.newElm  = $($scope.html);
                        //                 $scope.changeNav($scope.newElm,response.data);
                        //                 var data = {data:$($scope.html).append($scope.newElm).html(),userId:authority.account};
                        //                 $http.post($rootScope.basePath + "menuAndButToMongoDB/save",{data:angular.toJson(data)})
                        //                     .success(function(response) {
                        //                         if(response.code == 200){
                        //                             $scope.$parent.confirm();
                        //                             layer.alert("功能注册成功！", {skin: 'layui-layer-lan', closeBtn: 1});
                        //                         }
                        //                         layer.closeAll('loading');
                        //                         ngDialog.close();
                        //                     });
                        //             }
                        //         }
                        //     });
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function(matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                  //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                });
        };
    };

    $scope.initFunction = function () {


        /**
         * 返回业务签报批复编号查询URL
         */
        $scope.reportUrl = function (param) {
            return "deptTreeRef/queryForGrid?pk_org=" + param;
        }

        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function (item) {
            if(item && item.id){
                $scope.onCard(item.id);
            }

        };
    };
    $scope.disStartDate = true;
    $scope.isCanEdit = true;
    $scope.initWatch = function () {
        $scope.$watch('VO.user_type', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                var myDate = new Date();
                // 临时账户，只能开放3个月
                if (newVal == 1) {
                    var month =  myDate.getMonth() + 3;
                    myDate.setMonth(month);
                    $scope.VO.end_date = myDate.format("yyyy-MM-dd");
                    $scope.disStartDate = true;
                } else {
                    $scope.VO.end_date = '';
                    $scope.disStartDate = true;
                }
            }
        }, true);
    };

    $scope.initButton = function () {

        $scope.onPasswordReset = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if(!rows || rows.length !=1 ) return layer.alert("请选择一条单据!", {skin: 'layui-layer-lan',closeBtn: 1});
            layer.load(2);
            $http.post($rootScope.basePath + "user/passwordRest", {userCode: rows[0].user_code})
                .success(function (response) {
                    layer.closeAll('loading');

                    layer.alert(response.msg);
                });
        };
        //解锁
        $scope.onUnlock = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if(!rows || rows.length !=1 ) return layer.alert("请选择一条单据!", {skin: 'layui-layer-lan',closeBtn: 1});
            layer.load(2);
            $http.post($rootScope.basePath + "user/lockOrUnlockAccount",{userCode: rows[0].pk_user, type: "N"})
                .success(function (response) {
                    layer.closeAll('loading');
                    layer.alert(response.msg);
                    $scope.queryForGrid($scope.QUERY);

                })
        };

        //锁定
        $scope.onLock = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if(!rows || rows.length !=1 ) return layer.alert("请选择一条单据!", {skin: 'layui-layer-lan',closeBtn: 1});
            layer.load(2);
            $http.post($rootScope.basePath + "user/lockOrUnlockAccount",{userCode: rows[0].pk_user, type: "Y"})
                .success(function (response) {
                    layer.closeAll('loading');
                    layer.alert(response.msg);
                    $scope.queryForGrid($scope.QUERY);

                })
        };
        
        /*
         分配权限
         */
        $scope.onAuthority = function(){
            var rows = $scope.gridApi.selection.getSelectedRows();
            if(!rows || rows.length !=1 ) return layer.alert("请选择一条单据!", {skin: 'layui-layer-lan',closeBtn: 1});
            layer.load(2);
            ngDialog.openConfirm({
                template: 'view/user/modal/roleModal.html',
                controller: 'roleCtrl',
                data:{obj:rows[0]},
                closeByDocument: true,
                closeByEscape: true,
                cache:false
            }).then(function (value) {
                $scope.queryForGrid($scope.QUERY);
            }, function (reason) {
            });
        }
        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };


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

        $scope.onSubmit = function () {
            var pkProject;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                if (rows[0].billstatus != 31) return layer.alert("只有未上报状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 31) return layer.alert("只有未上报状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            $scope.queryFlowInfo(pkProject, function (response) {
            });
            // // alert(msg)
            // ngDialog.open({
            //     template: '../app/activiti-modal/tpl/approval.html',
            //     className: 'ngdialog-theme-formInfo',
            //     controller: 'approvalController',
            //     data: {
            //         config: _config
            //     },
            //     closeByDocument: true,
            //     closeByEscape: true,
            //     cache:false
            // });
        };


        $scope.onLinkAuditFlow = function () {
            var pkProject;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
            }
            ;
        };

        $scope.onAudit = function () {
            var pkProject;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                if (rows[0].billstatus != 33 && rows[0].billstatus != 36) return layer.alert("只有审批中或驳回状态可以审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 33 && rows[0].billstatus != 36) return layer.alert("只有审批中或驳回状态可以审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            ;


        };

        $scope.onAdd = function () {
            $scope.form=true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.isCanEdit = false;
            $scope.disStartDate = false;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form = true;
                $scope.disStartDate = false;
                $scope.isCanEdit = true;
                $scope.isDisabled = false;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id, function () {
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.isContinue = false;
                });

            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
                $scope.isContinue = false;
            }

        };
        $scope.onCheck = function () {

            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert("请选择需要复核的数据!", {skin: 'layui-layer-lan', closeBtn: 1});
                $scope.onSave();
        };

        $scope.onDelete = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert("请选择数据进行销户!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.confirm('是否要对选中的用户进行销户操作吗？', {
                    btn: ['销户', '返回'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消操作!', {
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
                    $http.post($scope.basePath + "user/delete", {ids: angular.toJson(ids)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg('操作成功!', {
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
        $scope.memo = '';
        $scope.tel_no = '';

        $scope.onCancel = function () {
            $scope.memo = $scope.VO.memo;
            if($scope.VO.memo){
                var rs = $scope.memo.substr(0,5);
                rs += "******";
                rs += $scope.memo.substr($scope.memo.length-2);
                $scope.VO.memo = rs ;
            }

            if($scope.VO.tel_no){
                $scope.tel_no = $scope.VO.tel_no;
                rs = $scope.tel_no.substr(0,3);
                rs += "******";
                rs += $scope.tel_no.substr($scope.tel_no.length-2);
                $scope.VO.tel_no = rs ;
            }


            $scope.isDisabled = true;
            $scope.isEdit = false;
            $scope.isBack = false;
            $scope.isDisabled = true;
            $scope.disStartDate = true;
            $scope.isCanEdit = true;
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
                    return layer.alert(errEls[0].ngVerify.OPTS.message,
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    if($scope.VO.memo.length != 18 && $scope.VO.memo.disableNativeTableHandles != 15){
                        return layer.alert("身份证号位数不匹配!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }else {
                        if ($scope.doCheckIdCard($scope.VO.memo)){
                            $scope.onSaveVO();

                            $scope.findOne($scope.VO.id);
                        }

                    }
                }
            }, true);
        };
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
                }

                else if (!city[code.substr(0, 2)]) {
                    tip = "身份证号地址编码错误，请重新输入：";
                    pass = false;
                }
                else {
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
            if (!delRow || delRow.length == 0) return layer.alert('请至少选择一行数据', {
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
                {name: 'user_code', displayName: '用户编码', width: 100,},
                {name: 'user_name', displayName: '用户名', width: 100,},
                {name: 'role_name', displayName: '关联角色',cellTooltip: true, headerTooltip: true, width: 100,},
                {name: 'user_type', displayName: '用户类型', width: 100, cellFilter: 'SELECT_USER_TYPE'},
                {name: 'user_role', displayName: '用户角色', width: 100, cellFilter: 'SELECT_USER_ROLE'},
                {name: 'user_status', displayName: '用户状态', width: 100, cellFilter: 'SELECT_USER_STATUS'},
                {name: 'login_tag', displayName: '登录标志', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'begin_date', displayName: '生效日期', width: 100,},
                {name: 'end_date', displayName: '失效日期', width: 100,},
                {name: 'email', displayName: '邮箱', width: 100,},
                {name: 'tel_no', displayName: '联系电话', width: 100, cellFilter: 'phoneFilter'},
                {name: 'memo', displayName: '身份证号', width: 200,cellFilter: 'memoFilter'},
                {name: 'org_name', displayName: '所属公司', width: 100,},
                {name: 'deptname', displayName: '所属部门', width: 100,},
                {name: 'pk_operate', displayName: '录入人', width: 100,},
                // {name: 'operate_date', displayName: '录入日期', width: 100,},
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
            $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (rows.length == 1) {
                    if(!$scope.chilbTable){
                        $scope.chilbTable=true;
                    }
                    angular.assignData($scope.VO, row.entity);
                    $scope.findOne(rows[0].id);
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

app.controller('roleCtrl', function ($rootScope,$scope, $http,$timeout,ngDialog,$compile) {
    $scope.userobj = $scope.ngDialogData.obj;
    //列表查询
    $scope.queryForGridGroup = function (data) {
        layer.load(2);
        $http.post($rootScope.basePath + "group/queryAll",{data:angular.toJson(data)})
            .success(function(response) {
                if(response.code == 200){
                    $scope.groupGridOptions.data = response.result.Rows;
                    $timeout(function() {
                        if($scope.userobj.role_name){
                            var role = $scope.userobj.role_name.split(',');
                            for (var i = 0;i<$scope.groupGridOptions.data.length;i++){
                                if(role.indexOf($scope.groupGridOptions.data[i].group_name) != -1){
                                    $scope.gridApi.selection.selectRow($scope.groupGridOptions.data[i],false);
                                }
                            }
                        }
                    },5);
                }
                layer.closeAll('loading');
            });
    };
    $scope.queryForGridGroup();
    $scope.groupGridOptions= {
        enableRowSelection: true,
        enableSelectAll: true,
        enableFullRowSelection:true,//是否点击cell后 row selected
        enableRowHeaderSelection: true,
        multiSelect : true,//多选
        useExternalPagination: true,
        columnDefs : [
            {name: 'group_code', displayName: '角色编码', width: 100,},
            {name: 'group_name', displayName: '角色名称', width: 100,},
            {name: 'pk_org_name', displayName: '所属机构', width: 100,},
            {name: 'pk_operator_name', displayName: '录入人', width: 100,},
            {name: 'operate_date', displayName: '录入日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'},
            {name: 'operate_time', displayName: '录入时间', width: 100,},
        ],
        data:[]
    };
    $scope.groupGridOptions.onRegisterApi = function(gridApi){
        //set gridApi on scope
        $scope.gridApi = gridApi;
        //添加行头
        $scope.gridApi.core.addRowHeaderColumn( { name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'} );
    };
    $scope.saveAuthority = function () {
        var rows = $scope.gridApi.selection.getSelectedRows();
        var authority = {};
        var ids = [];
        for (var i = 0; i < rows.length; i++) {
            ids.push(rows[i].pk_group);
        }
        authority.role = ids;
        authority.account = $scope.userobj.id;
        layer.load(2);
        $http.post($rootScope.basePath + "user/addUserRole",{data:angular.toJson(authority)})
            .success(function(response) {
                if(response.code == 200){
                    layer.alert("功能注册成功！", {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
    }
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
});

app.controller('passwordRestCtrl',['$scope', '$rootScope', '$http', 'ngDialog', 'FileUploader', 'ngVerify', function ($scope, $rootScope, $http, ngDialog, FileUploader, ngVerify) {
    $scope.btnDisabled = false;
    $scope.VO.password = "";
    $scope.closeWin = function () {
        //关闭自己的窗口
        ngDialog.close(this.ngDialogId);
    };
    $scope.confirm = function () {
        if ($scope.VO.password == $scope.VO.confirmPassword) {
            $http.post($scope.basePath + "user/passwordRest", {
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
        $scope.$watch('VO.password',function (newVal){
            if(newVal){
                $http.post($scope.basePath + "account/checkIntensity", {
                    password: encryptByDES(newVal, '12345678')
                }).success(function (response) {
                    if (response.intensity == '0' || response.intensity == '1') {
                        $scope.process.style = 'red';
                        $scope.process.progress = 25;
                        $scope.process.text = "弱";
                    } else if (response.intensity == '2'){
                        $scope.process.style = 'yellow';
                        $scope.process.progress = 50;
                        $scope.process.text = "中";
                    } else if (response.intensity == '3'){
                        $scope.process.style = 'green';
                        $scope.process.progress = 75;
                        $scope.process.text = "强";
                    } else if (response.intensity == '4'){
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
//校验当前登录人密码
app.controller('checkPasswordCtrl',['$scope', '$rootScope', '$http', 'ngDialog', 'FileUploader', 'ngVerify', function ($scope, $rootScope, $http, ngDialog, FileUploader, ngVerify) {
    $scope.btnDisabled = false;
    $scope.closeWin = function () {
        //关闭自己的窗口
        ngDialog.close(this.ngDialogId);
    };
    $scope.confirm = function () {
        $scope.ngDialogId = this.ngDialogId;
        $http.post($scope.basePath + "user/checkPassword", {
            userCode: "",
            password: encryptByDES($scope.VO.password, '12345678'),
            confirmPassword: encryptByDES($scope.VO.confirmPassword, '12345678')
        }).success(function (response) {
            if (response.code == 200) {
                $scope.$parent.confirm(response);
                layer.msg(response.msg);
                ngDialog.close();

            } else {
                layer.alert(response.msg);
            }
        });
    };
}]);