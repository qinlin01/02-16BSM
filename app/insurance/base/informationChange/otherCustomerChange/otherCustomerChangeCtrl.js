/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('otherCustomerChangeCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                customerChangeCompare: [],
                pkOperator: $rootScope.userVO,
                dealAttachmentB: [],
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                dr: 0,
                cusChangeType: 0,
                costscale: [],
                coomedium: [],
                billstatus:0
            };
        };
        $scope.entityVO = 'nc.vo.busi.CustomerChangeVO';
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
       $scope.initQUERY = function () {
            return { "operate_year": parseInt(new Date().format("yyyy")),
                "id":$stateParams.id
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode ='10307';
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "otherCustomerChange/queryForGrid", {
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
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + "otherCustomerChange/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    angular.assignData($scope.VO, response.result);
                    if($scope.VO.update){
                        $scope.update =$scope.VO.update;
                    }else {
                        $scope.update = [];
                        $scope.update.push({
                            colName: '国网客户名称',
                            colOldVal: response.result.c0Name,
                            colNewVal: '',
                            colNewVals: 'c0Name'
                        });
                        $scope.update.push({
                            colName: '注册号/统一社会信用代码',
                            colOldVal: response.result.c1Institution,
                            colNewVal: '',
                            colNewVals: 'c1Institution'
                        });
                        $scope.update.push({
                            colName: '是否集团成员单位',
                            colOldVal: response.result.c0HasCustomerTop,
                            colNewVal: '',
                            colNewVals: 'c0HasCustomerTop'
                        });
                        $scope.update.push({
                            colName: '上级管理单位',
                            colOldVal:  response.result.upCustomerSw.name,
                            colNewVal: '',
                            colNewVals: 'upCustomerSw'
                        });
                        $scope.update.push({
                            colName: '所在区域',
                            colOldVal: response.result.c1Province && response.result.c1Province.name,
                            colNewVal: '',
                            colNewVals: 'c1Province'
                        });
                        $scope.update.push({
                            colName: '地址',
                            colOldVal: response.result.c0Address,
                            colNewVals: '',
                            colNewVal: 'c0Address'
                        });
                        $scope.update.push({colName: '传真', colOldVal: response.result.c1Fax, colNewVal: '', colNewVals: 'c1Fax'});
                        $scope.update.push({colName: '公司电话', colOldVal: response.result.c1Phone, colNewVal: '', colNewVals: 'c1Phone'});
                    }
                    if ($scope.isGrid){
                        $scope.customerChangeCompareGridOptions.data = response.result.customerChangeCompare;
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
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            layer.load(2);
            $http.post($rootScope.basePath + "otherCustomerChange/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        $scope.isUse = true;
                        $scope.isProvince = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                    }
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
            if(item && item.id){
                $scope.onCard(item.id);
            }

        };
    };

    $scope.initWatch = function () {
        $scope.$watch('VO.cusChangeType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO = $scope.initVO();
                $scope.VO.cusChangeType = newVal;
                /*if (newVal && '国网转市场' == $rootScope.returnSelectName(newVal, 'GWCHANGETYPE')) {
                 $scope.isGroup = false;
                 } else {
                 $scope.isGroup = true;
                 }*/
                if(newVal == 1|| newVal == 2){
                    $scope.isUse = true;

                }else {
                    $scope.isUse = false;
                    $scope.isProvince = true;
                }

            }
        }, true);
        $scope.$watch('VO.c0HasCustomerTop', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO.upCustomerSw = {};
                $scope.VO.c0Code = '';
                $scope.VO.c0HasCustomerTop = newVal;
                /*if (newVal && '国网转市场' == $rootScope.returnSelectName(newVal, 'GWCHANGETYPE')) {
                 $scope.isGroup = false;
                 } else {
                 $scope.isGroup = true;
                 }*/
                if(newVal == 'Y'){
                    $scope.isProvince = false;

                }else {
                    $scope.isProvince = true;
                }

            }
        }, true);
        $scope.$watch('VO.pkCustomer.name', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if (newVal) {
                    $http.post($scope.basePath + "otherCustomer/findOne", {pk: $scope.VO.pkCustomer.pk}).success(function (response) {
                        if (response && response.code == "200") {
                            $scope.VO.c0Code = response.result.c0Code;
                            $scope.VO.c0Name = response.result.c0Name;
                            $scope.VO.c1Institution = response.result.c1Institution;
                            $scope.VO.c0HasCustomerTop = response.result.c0HasCustomerTop;
                            $scope.VO.upCustomerSw = response.result.upCustomer;
                            $scope.VO.c1Province = response.result.c1Province;
                            $scope.VO.c0Address = response.result.c0Address;
                            $scope.VO.c1Fax = response.result.c1Fax;
                            $scope.VO.c1Phone = response.result.c1Phone;
                            $scope.update = [];
                            $scope.update.push({
                                colName: '国网客户名称',
                                colOldVal: response.result.c0Name,
                                colNewVal: '',
                                colNewVals: 'c0Name'
                            });
                            $scope.update.push({
                                colName: '注册号/统一社会信用代码',
                                colOldVal: response.result.c1Institution,
                                colNewVal: '',
                                colNewVals: 'c1Institution'
                            });
                            $scope.update.push({
                                colName: '是否集团成员单位',
                                colOldVal: response.result.c0HasCustomerTop,
                                colNewVal: '',
                                colNewVals: 'c0HasCustomerTop'
                            });
                            $scope.update.push({
                                colName: '上级管理单位',
                                colOldVal:  response.result.upCustomerSw.name,
                                colNewVal: '',
                                colNewVals: 'upCustomerSw'
                            });
                            $scope.update.push({
                                colName: '所在区域',
                                colOldVal: response.result.c1Province && response.result.c1Province.name,
                                colNewVal: '',
                                colNewVals: 'c1Province'
                            });
                            $scope.update.push({
                                colName: '地址',
                                colOldVal: response.result.c0Address,
                                colNewVals: '',
                                colNewVal: 'c0Address'
                            });
                            $scope.update.push({colName: '传真', colOldVal: response.result.c1Fax, colNewVal: '', colNewVals: 'c1Fax'});
                            $scope.update.push({colName: '公司电话', colOldVal: response.result.c1Phone, colNewVal: '', colNewVals: 'c1Phone'});
                        }
                    });

                }
            }
        }, true);
    };
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
        /*            layer.load(2);
         window.location.href = $rootScope.basePath + "uploadFile/downloadFiles?isUser="+window.sessionStorage.getItem("token")+"&fileId=" + ids;
         layer.closeAll('loading');*/
    };

    $scope.initButton = function () {
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
            $scope.form=true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.isUse = false;
            $scope.dealAttachmentBGridOptions.data = [];
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
            $scope.customerChangeCompareGridOptions.data = [];
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
            if($scope.VO.cusChangeType == 1|| $scope.VO.cusChangeType == 2){
                $scope.isUse = true;

            }else {
                $scope.isUse = false;
                $scope.isProvince = true;
            }
        };
        $scope.onUploads = function () {
            $scope.isSubDisabled = false;

            $scope.aVO = {};
            /*else {
             $scope.bVO = {};
             }*/
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
        /**
         * 暂存
         */
        $scope.onTemporary = function (data) {
            $scope.VO.c0Type = '5';
            $scope.VO.update=$scope.update;
            if (data) {
                var tablename = $scope.table_name;
                $http.post($rootScope.basePath + "temporary/insert", {
                    data: angular.toJson(data),
                    tablename: tablename
                }).success(function (response) {
                    if (response.code == 200) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                        return layer.alert('暂存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                });
            }
        }
        /**
         * 卡片
         */
        $scope.onCard = function (id) {
            if(!id){
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1)
                return layer.alert("请选择一条数据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                id = rows[0].id;
            }
            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {pk:id,tableName:$scope.table_name,billdef:$scope.billdef}).success(function (response)  {
                if (response && response.code == "200") {
                    $scope.card=true;
                    angular.assignData($scope.VO, response.result);
                    if(!response.result.taskHis)
                        $scope.mess=false;
                    else
                        $scope.mess=true;
                    $scope.isBack = true;
                    $scope.isGrid = false;
                    $scope.isCard = true;

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
                    $http.post($scope.basePath + "otherCustomerChange/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
            $scope.isUse = true;
            $scope.isProvince = true;
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
                    if ($scope.dealAttachmentBGridOptions.data.length <= 0) {
                        return layer.alert("注册号/统一社会信用代码证附件 不能为空。",
                            {skin: 'layui-layer-lan', closeBtn: 1});

                    }
                    $scope.customerChangeCompareGridOptions.data = [];
                    if ($scope.update) {
                        for (var i = 0; i < $scope.update.length; i++) {
                            var value = "";
                            if ($scope.update[i].colOldVal == undefined || $scope.update[i].colOldVal == null) {
                                $scope.update[i].colOldVal = "";
                            }
                            if($scope.VO[$scope.update[i].colNewVals]){
                                if (typeof $scope.VO[$scope.update[i].colNewVals] == "object") {
                                    value = $scope.VO[$scope.update[i].colNewVals]['name'];
                                } else {
                                    if ($scope.VO[$scope.update[i].colNewVals] == undefined || $scope.VO[$scope.update[i].colNewVals] == null) {
                                        value = "";
                                    } else {
                                        value = $scope.VO[$scope.update[i].colNewVals];
                                    }
                                }
                            }
                            $scope.update[i].colNewVal = value;
                        }
                        for (var i = 0; i < $scope.update.length; i++) {
                            if ($scope.update[i].colOldVal != $scope.update[i].colNewVal) {
                                $scope.customerChangeCompareGridOptions.data.push($scope.update[i]);
                                // $scope.VO.customerChangeCompare.push($scope.update[i]);
                            }
                        }
                        $scope.VO.customerChangeCompare=$scope.customerChangeCompareGridOptions.data;
                    }
                    $scope.VO.update=$scope.update;
                    $scope.VO.cusChangeTypeName = $rootScope.returnSelectName($scope.VO.cusChangeType,"CUSCHANGETYPE");
                    $scope.VO.c0HasCustomerTopName = $rootScope.returnSelectName($scope.VO.c0HasCustomerTop,"YESNO");

                    $scope.onSaveVO();
                }
            }, true);
        };

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            if($scope.QUERY["check_date^gte"]&&$scope.QUERY["check_date^lte"]){
                if(new Date($scope.QUERY["check_date^gte"]) > new Date($scope.QUERY["check_date^lte"])){
                    return layer.alert("结束时间必须大于开始时间!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
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
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '其他合作单位信息变更.csv',
            columnDefs: [
                {name: 'serial', displayName: '变更流水号', width: 100,},
                {name: 'c0Code', displayName: '单位编码', width: 100,},
                {name: 'c0Name', displayName: '单位名称', width: 100,},
                {name: 'c1Institution', displayName: '注册号/统一社会信用代码', width: 100,},
                {name: 'enumEntkind', displayName: '企业性质', width: 100, cellFilter: 'SELECT_ENTKINDTYPE'},
                {name: 'c1Province.name', displayName: '所在区域', width: 100,},
                {name: 'c0Address', displayName: '地址', width: 100,},
                {name: 'c1Phone', displayName: '公司电话', width: 100,},
                {name: 'cusChangeType', displayName: '变更类型', width: 100, cellFilter: 'SELECT_CUSCHANGETYPE'},
                {name: 'sealReason', displayName: '变更原因', width: 100,},
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
            columnDefs: [
                {name: 'attachment_name', displayName: '附件名称', width: 120},
                {
                    name:'pk_project_id',
                    displayName:' ',
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
        $scope.selectTabName = 'customerChangeCompareGridOptions';
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
                    name: 'colName', displayName: '变更字段名称', width: 100


                },
                {
                    name: 'colOldVal', displayName: '变更前', width: 100


                },
                {
                    name: 'colNewVal', displayName: '变更后', width: 100


                },
            ],
            data: $scope.VO.customerChangeCompare,
            onRegisterApi: function (gridApi) {
                $scope.customerChangeCompareGridOptions.gridApi = gridApi;
            }
        };


       /* if ($stateParams.pk != null) {
            $scope.queryForGrid({});
        } else {
            $scope.queryForGrid($scope.QUERY);
        }*/
        if($stateParams.id) {
            $scope.onCard($stateParams.id);
        }/*else{
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
    $scope.table_name = "lr_customer_change";
    $scope.billdef = "OtherCustomerChange";
    $scope.beanName = "insurance.CustomerServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initPreviewFile($scope,$rootScope);

    initworkflow($scope, $http,ngDialog);


});
app.controller('customerChangeCompareGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
