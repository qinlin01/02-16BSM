/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('marketCustomerCtrl', function ($rootScope, $scope, $sce, $http, ngDialog, $stateParams, $location, $state, ngVerify, uiGridConstants) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                account: [],
                linkman: [],
                customerDept: [],
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                dr: 0,
                c0HasCustomerTop: 'N',
                costscale: [],
                coomedium: [],
                billstatus: 0
            };
        };
        $scope.entityVO = 'nc.vo.busi.CustomerVO';
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.funCode = '10102';
        $scope.AccountList = [];
        $scope.initAccountList = function () {
            return {
                accType:'',
                accName:'',
                accNum:'',
                accBlank:'',
                jointBankNum:''
            };
        };
        $scope.LinkmanList = [];
        $scope.initLinkmanList = function () {
            return {
                linkmanType:'',
                name:'',
                dept:'',
                address:'',
                post:'',
                tele:'',
                fax:'',
                mail:'',
                memo:''
            };
        };
        $scope.CustomerDeptList = [];
        $scope.initCustomerDept = function () {
            return {
                dept:'',
                remark:'',
            };
        };
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "c_0_type": 1,
                "c_1_type": 2,
                "id": $stateParams.id
            }
        };
        $scope.groupQuery = {
            dr: 0,
            billstatus: 1,
            c_0_type: 1,
            c_1_type: 2
        };
        $scope.QUERY = $scope.initQUERY();
    };

    $scope.initHttp = function () {
        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            layer.load(2);
            return $http.post($rootScope.basePath + "marketCustomer/queryAllForGrid", {
                params: angular.toJson(data),
                //page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                //pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            })
                .success(function (response) {
                    if (response.code == 200) {
                        if (!$scope.query) {
                            $scope.query = $scope.gridOptions.columnDefs;
                        }
                        if ($scope.QUERY.id) {
                            $scope.QUERY.id = null;
                        }
                        $scope.gridOptions.data = response.result.Rows;
                        $scope.gridOptions.totalItems = response.result.Total;
                    }
                    layer.closeAll('loading');
                });
        };
        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "marketCustomer/queryForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response.code == 200) {
                    if (!$scope.query) {
                        $scope.query = $scope.gridOptions.columnDefs;
                    }
                    if ($scope.QUERY.id) {
                        $scope.QUERY.id = null;
                    }
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            });
        };
        $scope.findOne = function (pk,ifDesensitize, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "marketCustomer/findOne", {pk: pk,ifDesensitize:ifDesensitize}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.AccountList = $scope.VO.account;
                    $scope.LinkmanList = $scope.VO.linkman;
                    $scope.CustomerDeptList = $scope.VO.customerDept;
                    $scope.accountGridOptions.data = $scope.VO.account;
                    $scope.linkmanGridOptions.data = $scope.VO.linkman;
                    $scope.customerDeptGridOptions.data = $scope.VO.customerDept;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;

                }
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $scope.VO.account=$scope.AccountList;
            $scope.VO.linkman=$scope.LinkmanList;
            $scope.VO.customerDept =$scope.CustomerDeptList;
            $http.post($rootScope.basePath + "marketCustomer/save", {data: angular.toJson($scope.VO), funCode: $scope.funCode})
                .success(function (response) {
                    if (response && response.code == 200) {
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

        /**
         * 查询审批流信息
         */
        $scope.queryWorkFlow = function (pkProject, fun) {
        };
        /**
         * 查询审批流信息
         */
        $scope.queryFlowInfo = function (pkProject, fun) {

        };
        /**
         * 查询审批流信息
         */
        $scope.queryAuditFlowInfo = function (pkProject, fun) {
        };
        /*
         * 提交
         * */
        $scope.submit = function (pkProject, msg, selects, _pass) {
        };
        /*
         * 提交
         * */
        $scope.audit = function (pkProject, msg, selects, _pass, type) {
        };
    };

    $scope.initFunction = function () {
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function (item) {
            if (item && item.id) {
                $scope.onCard(item.id);
            }

        };
    };

    $scope.initWatch = function () {
        /**
         * 监听注册号/统一社会信用代码是否存在
         */
        $scope.$watch('VO.c1Institution', function (newVal, oldVal) {
            if ($scope.form) {
                if ($scope.VO.c1Institution != null) {
                    if ($scope.VO.c1Institution != oldVal) {
                        //当value改变时执行的代码
                        $http.post($scope.basePath + "marketCustomer/checkIfExist", {c1Institution: $scope.VO.c1Institution, cName: $scope.VO.c0Name}).success(function (response) {
                            layer.closeAll('loading');
                            if (response && response.code != "200") {
                                return layer.alert("“注册号/统一社会信用代码”已存在",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        });
                    }
                }
            }
        });
        $scope.$watch('VO.c0HasCustomerTop', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if (newVal) {
                if (newVal == 'N') {
                    $scope.isMember = true;
                    $scope.VO.upCustomer = {};
                } else {
                    $scope.isMember = false;

                }
            }
        });
        $scope.$watch($scope.isEdit, function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if (newVal) {
                if (newVal == 'N') {
                    $scope.isMember = true;
                    $scope.VO.upCustomer = {};
                } else {
                    $scope.isMember = false;

                }
            }
        });

    };

    $scope.initButton = function () {
        //上传文件
        $scope.onUploads = function () {
            $scope.isSubDisabled = false;
            $scope.aVO = {};
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'insurance/base/customer/stateGridCustomer/attachments.html',
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
                if (value != null) {
                    // var data = $scope.getVOTms();

                    //  第一次初始化成null，后台没值，应该【】
                    if ($scope.dealAttachmentBGridOptions.data) {
                        angular.forEach(value, function (item) {
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });

                    } else {
                        // $scope[selectTabName].data = [];
                        // $scope[selectTabName].data.push(value);
                        angular.forEach(value, function (item) {
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });
                    }


                }
            }, function (reason) {

            });
        };
        //下载文件
        $scope.onDownLoads = function () {
            var selectTabName = $scope.selectTabName;
            var rows = $scope[selectTabName].gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return angular.alert("请选择一条单据进行操作！");
            var ids = [];
            if (selectTabName == 'dealAttachmentBGridOptions') {
                for (var i = 0; i < rows.length; i++) {
                    ids.push(rows[i].pk_project_id);
                }
            }
            var exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };
        /**
         * 过滤查询功能
         */
        /*$scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };*/


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
                $scope.findOne(rows[0].id,"Y", function (response) {
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isEdit = false;
                    $scope.isDisabled = true;
                });
            }
        };

        $scope.onSubmit = function () {
            var pkProject;
            var rows = $scope.gridApi.selection.getSelectedRows();
            if ($scope.isGrid) {
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                if (rows[0].billstatus != 37) return layer.alert("只有未上报状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 37) return layer.alert("只有未上报状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            $http.post($scope.basePath + "marketCustomer/submit", {data: angular.toJson(rows[0])}).success(function (response) {
                if (response && response.code == 200) {
                    $scope.queryForGrid($scope.QUERY);
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
                }
            });
            // $scope.queryFlowInfo(pkProject,function (response) {
            // });
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


        /* $scope.onLinkAuditFlow = function () {
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
         };*/

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
            $scope.AccountList = [];
            $scope.LinkmanList = [];
            $scope.CustomerDeptList = [];
            $scope.onAddAccount();
            $scope.onAddLinkman();
            $scope.onAddCustomerDept();
            $scope.form = true;
            $scope.isGrid = false;
            $scope.isClear = true;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.initView();
            $scope.VO = $scope.initVO();
            angular.assignData($scope.VO, $scope.initVO());
            $scope.accountGridOptions.data = [];
            $scope.linkmanGridOptions.data = [];
            $scope.customerDeptGridOptions.data = [];
            $scope.dealAttachmentBGridOptions.data = [];
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
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id,"N", function () {
                    $scope.isGrid = false;
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                });
            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
                $scope.dealAttachmentBGridOptions.columnDefs.removeAttribute();
            }

            $scope.isGrid = false;
            $scope.isBack = true;
            $scope.isEdit = true;
            $scope.isDisabled = false;
        };
        /**
         * 卡片
         */
        /*   $scope.onCard = function () {
               var rows = $scope.gridApi.selection.getSelectedRows();
               if (!rows || rows.length != 1)
                   return layer.alert("请选择一条数据进行查看!", {
                       skin: 'layui-layer-lan',
                       closeBtn: 1
                   });
               $scope.findOne(rows[0].id);
               $scope.isBack = true;
               $scope.isGrid = false;
               $scope.isCard = true;
           };*/
        $scope.onCard = function (id) {
            if (!id) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1)
                    return layer.alert("请选择一条数据进行查看!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                id = rows[0].id;
            }
            $scope.findOne(id,"Y");
            $scope.isBack = true;
            $scope.isGrid = false;
            $scope.isCard = true;
            $scope.card = true;
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
                    $http.post($scope.basePath + "marketCustomer/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
            if ($scope.isClear) {
                $scope.VO = $scope.initVO();
            }
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
            $scope.form = false;
            $scope.card = false;
            $scope.AccountList = [];
            $scope.LinkmanList = [];
            $scope.CustomerDeptList = [];
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
                    if ($scope.dealAttachmentBGridOptions.data.length <= 0) {
                        return layer.alert("注册号/统一社会信用代码证附件 不能为空。",
                            {skin: 'layui-layer-lan', closeBtn: 1});

                    }
                    if ($scope.VO.c0HasCustomerTop == 'Y' && $scope.VO.upCustomer == null) {
                        return layer.alert("请录入集团名称!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    $scope.isEmpty = true;
                    // if ($scope.VO.account) {
                    //     for (let i = 0; i < $scope.VO.account.length; i++) {
                    //         let item = $scope.VO.account[i];
                    //         if (!item.accName) {
                    //             $scope.isEmpty = false;
                    //             return layer.alert("子表属性开户名称不可为空!",
                    //                 {skin: 'layui-layer-lan', closeBtn: 1});
                    //         }
                    //         if (!item.accNum) {
                    //             $scope.isEmpty = false;
                    //             return layer.alert("子表属性账号不可为空!",
                    //                 {skin: 'layui-layer-lan', closeBtn: 1});
                    //         }
                    //         if (!item.accBlank) {
                    //             $scope.isEmpty = false;
                    //             return layer.alert("子表属性开户银行不可为空!",
                    //                 {skin: 'layui-layer-lan', closeBtn: 1});
                    //         }
                    //     }
                    // }
                    $scope.VO.linkman = $scope.LinkmanList;
                    if ($scope.isEmpty) {
                        if ($scope.VO.linkman) {
                            if ($scope.VO.linkman.length == 0) {
                                return layer.alert("子表联系人信息不可为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            for (let i = 0; i < $scope.VO.linkman.length; i++) {
                                let item = $scope.VO.linkman [i];
                                if (!item.linkmanType || item.linkmanType.length == 0) {
                                    $scope.isEmpty = false;
                                    return layer.alert("子表属性联系人类型不可为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (!item.name || item.name.length == 0) {
                                    $scope.isEmpty = false;
                                    return layer.alert("子表属性联系人姓名不可为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (!item.tele || item.tele.length == 0) {
                                    $scope.isEmpty = false;
                                    return layer.alert("子表属性联系人电话不可为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (!item.address || item.address.length == 0) {
                                    $scope.isEmpty = false;
                                    return layer.alert("子表属性联系人地址不可为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }
                        }
                    }
                    if ($scope.isEmpty) {
                        $scope.VO.c0HasCustomerTopName = $rootScope.returnSelectName($scope.VO.c0HasCustomerTop, "YESNO");
                        $scope.onSaveVO();
                    }
                }
            }, true);
        };

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            if ($scope.QUERY["check_date^gte"] && $scope.QUERY["check_date^lte"]) {
                if (new Date($scope.QUERY["check_date^gte"]) > new Date($scope.QUERY["check_date^lte"])) {
                    return layer.alert("结束时间必须大于开始时间!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
            $scope.queryForGrid($scope.QUERY);
        };
        $scope.onReset = function () {
            $scope.QUERY = $scope.initQUERY();
            $scope.QUERY.id = null;
            $scope.VO.pkOrgGrid = "";
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
            if ($scope.selectTabName == 'accountGridOptions' || $scope.selectTabName == 'linkmanGridOptions') {
                $scope[$scope.selectTabName].data.push({
                    pkOperator: $rootScope.userVO,
                    operateDate: new Date().format("yyyy-MM-dd"),
                    pkDept: $rootScope.deptVO,
                    pkOrg: $rootScope.orgVO
                });
            } else if ($scope.selectTabName == 'customerDeptGridOptions') {
                $scope[$scope.selectTabName].data.push({
                    pkOperator: $rootScope.userVO,
                    operateDate: new Date().format("yyyy-MM-dd")
                });
            }
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
        /**
         * 子表信息增加
         */
        $scope.onAddAccount =function(){
            $scope.AccountList.push($scope.initAccountList());
        }
        $scope.onAddLinkman =function(){
            $scope.LinkmanList.push($scope.initLinkmanList());
        }
        $scope.onAddCustomerDept =function(){
            $scope.CustomerDeptList.push($scope.initCustomerDept());
        }
        /**
         * 子表信息删除
         */
        $scope.deletelistOptions=function(nowNumber,type){
            //type 1:账户信息 2：联系人信息 3：部门信息 4：注册号信息
            layer.confirm('请确认是否要删除此记录？', {
                    btn: ['确定', '取消'], //按钮
                    btn2: function (index, layero) {
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function (index) {
                    if(type==1){
                        $scope.AccountList.splice(nowNumber,1);
                        $scope.$apply();
                        layer.close(layer.index);
                    }
                    if(type==2){
                        $scope.LinkmanList.splice(nowNumber,1);
                        $scope.$apply();
                        layer.close(layer.index);
                    }
                    if(type==3){
                        $scope.CustomerDeptList.splice(nowNumber,1);
                        $scope.$apply();
                        layer.close(layer.index);
                    }
                    if(type==4){
                        $scope.LinkmanList.splice(nowNumber,1);
                        $scope.$apply();
                        layer.close(layer.index);
                    }
                }
            );
        };
    };

    $scope.initPage = function () {
        $scope.form = false;
        $scope.card = false;
        $scope.isClear = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;
        $scope.isMember = false;
        $scope.gridOptions = {
            rowTemplate: "<div ng-dblclick=\"grid.appScope.onRowDblClick(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>",

            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [20, 50, 100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '市场客户信息.csv',
            columnDefs: [
                {name: 'c0Code', displayName: '客户编号', width: 100,},
                {name: 'signcustomerno', displayName: '客户代码', width: 100,},
                {name: 'c0Name', displayName: '客户名称', width: 100,},
                {name: 'c1Institution', displayName: '注册号/统一社会信用代码', width: 100,},
                {name: 'tag', displayName: '客户标签', width: 100},
                {name: 'upCustomer.name', displayName: '集团名称', width: 100,},
                {name: 'enumEntkind.name', displayName: '单位性质', width: 100,},
                {name: 'tradetype.name', displayName: '行业类别', width: 100,},
                {name: 'c1Province.name', displayName: '所在区域', width: 100,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'operateDate', displayName: '制单日期', width: 100,},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '业务部门', width: 100,},
                {name: 'pkChecker.name', displayName: '审批人', width: 100,},
                {name: 'checkDate', displayName: '审批日期', width: 100, cellFilter: 'date_cell_date'},
                // {name: 'checkTime', displayName: '复核时间', width: 100,},
                // {name: 'vapprovenote', displayName: '复核意见', width: 100,},
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
                    $scope.findOne(rows[0].id,"Y");
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });


        };

        $scope.selectTabName = 'accountGridOptions';
        $scope.accountGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'accType', displayName: '账户类型', width: 100, cellFilter: 'SELECT_ACCTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.ACCTYPE
                },
                {
                    name: 'accName', displayName: '开户名称', width: 100
                },
                {
                    name: 'accNum', displayName: '账号', width: 100
                },
                {
                    name: 'accBlank', displayName: '开户银行', width: 100
                },
                {
                    name: 'jointBankNum', displayName: '银行联行号', width: 100
                },
                // {
                //     name: 'pkOperator.name', displayName: '经办人', width: 100, enableCellEdit: false
                // },
                // {
                //     name: 'operateDate', displayName: '制单日期', width: 100, enableCellEdit: false,
                //     editableCellTemplate: 'ui-grid/refDate',
                //     cellFilter: 'date:"yyyy-MM-dd"'
                // },
                // {
                //     name: 'pkOrg.name', displayName: '业务单位', width: 100, enableCellEdit: false
                // },
                // {
                //     name: 'pkDept.name', displayName: '业务部门', width: 100, enableCellEdit: false
                // },
            ],
            data: $scope.VO.account,
            onRegisterApi: function (gridApi) {
                $scope.accountGridOptions.gridApi = gridApi;
            }
        };
        $scope.linkmanGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'linkmanType', displayName: '联系人类型', width: 100, cellFilter: 'SELECT_LINKMANTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.LINKMANTYPE
                },
                {
                    name: 'name', displayName: '联系人姓名', width: 100
                },
                {
                    name: 'dept', displayName: '联系人部门', width: 100
                },
                {
                    name: 'address', displayName: '联系人地址', width: 100
                },
                {
                    name: 'post', displayName: '邮编', width: 100
                },
                {
                    name: 'tele', displayName: '联系人电话', width: 100
                },
                {
                    name: 'fax', displayName: '传真', width: 100
                },
                {
                    name: 'mail', displayName: '电子邮箱', width: 100
                },
                // {
                //     name: 'pkOperator.name', displayName: '经办人', width: 100, enableCellEdit: false
                // },
                // {
                //     name: 'operateDate', displayName: '制单日期', width: 100, enableCellEdit: false,
                //     editableCellTemplate: 'ui-grid/refDate',
                //     cellFilter: 'date:"yyyy-MM-dd"'
                // },
                // {
                //     name: 'pkOrg.name', displayName: '业务单位', width: 100, enableCellEdit: false
                // },
                // {
                //     name: 'pkDept.name', displayName: '业务部门', width: 100, enableCellEdit: false
                // },
            ],
            data: $scope.VO.linkman,
            onRegisterApi: function (gridApi) {
                $scope.linkmanGridOptions.gridApi = gridApi;
            }
        };
        $scope.customerDeptGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'dept', displayName: '部门名称', width: 100


                },
                {
                    name: 'remark', displayName: '备注', width: 100


                },
                // {
                //     name: 'pkOperator.name', displayName: '经办人', width: 100, enableCellEdit: false
                //
                //
                // },
                // {
                //     name: 'operateDate', displayName: '制单日期', width: 100, enableCellEdit: false,
                //     editableCellTemplate: 'ui-grid/refDate',
                //     cellFilter: 'date:"yyyy-MM-dd"'
                //
                //
                // },
            ],
            data: $scope.VO.customerDept,
            onRegisterApi: function (gridApi) {
                $scope.customerDeptGridOptions.gridApi = gridApi;
            }
        };
        $scope.customerChangeCompareGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'colName', displayName: '变更字段名称', width: 100, enableCellEdit: false


                },
                {
                    name: 'colOldVal', displayName: '变更前', width: 100, enableCellEdit: false


                },
                {
                    name: 'colNewVal', displayName: '变更后', width: 100, enableCellEdit: false


                },
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                $scope.customerChangeCompareGridOptions.gridApi = gridApi;
            }
        };
        $scope.dealAttachmentBGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,
            //selectionRowHeaderWidth: 35,
            //rowHeight: 35,
            //showGridFooter:false,
            columnDefs: [
                // {name: 'source_billtypeVO.bill_name', displayName: '表单来源类型', width: 120},
                // {name: 'pk_document_dir.name', displayName: '文档分类', width: 120},
                {name: 'attachment_name', displayName: '附件名称', width: 120},
                // // {name: 'pk_object_id.name', displayName: '附件', width: 120},
                // {name: 'upload_operator.name', displayName: '上传人姓名', width: 120},
                // {name: 'upload_date', displayName: '上传日期', width: 120, cellFilter: 'date:"yyyy-MM-dd"'},
                // {name: 'attachment_source', displayName: '附件来源', width: 120, cellFilter: 'SELECT_ATTACHMENT_SOURCE'},
                // {name: 'carrier_type', displayName: '载体类型', width: 120, cellFilter: 'SELECT_CARRIER_TYPE'},
                // {name: 'carrier_desc', displayName: '附件存放位置', width: 120},
                // {name: 'memo', displayName: '备注', width: 120}
                {
                    name: 'documentHeaderCol', displayName: '操作', cellTemplate: 'ui-grid/queryDocumentTemplate',
                    width: 120
                },
                {
                    name: 'pk_project_id',
                    displayName: ' ',
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ng-click="grid.appScope.onPreviewFile(row.entity.pk_project_id,row.entity.attachment_name)" class="btn btn-transparent btn-xs tooltips" tooltip-placement="top">在线预览&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i></a></div>'
                }
            ],
            data: $scope.VO.dealAttachmentB,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.dealAttachmentBGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.dealAttachmentBGridOptions.gridApi = gridApi;
                }
                $scope.dealAttachmentBGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };

        /* if ($stateParams.pk != null) {
             $scope.queryForGrid({});
         } else {
             $scope.queryForGrid($scope.QUERY);
         }*/
        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
            $scope.card = true;

        }
        /*else{
                    $scope.queryForGrid({});
                }*/
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {
            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }
    };
    $scope.table_name = "lr_customer";
    $scope.billdef = "MarketCustomer";
    $scope.beanName = "insurance.ExamineServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();

    initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope, $rootScope);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);

});
app.controller('accountGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('linkmanGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('customerDeptGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});


