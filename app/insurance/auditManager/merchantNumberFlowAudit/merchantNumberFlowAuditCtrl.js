/**
 * Create By zhangwj
 * Create Time 2022-02-18
 */
app.controller('merchantNumberFlowAuditCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                flowNo: null,
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkCorp: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                createTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                dealattachmentb: [],
                balanceOrder: [],
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "substr(create_time,1,4)0_0eq": parseInt(new Date().format("yyyy")),
                "billstatus":34
            }
        };
        $scope.funCode = "1005";
        $scope.QUERY = $scope.initQUERY();

        $scope.uiPopupRef = {
            "id": $scope.$id, "columnDefs": [{
                field: 'CODE',
                displayName: '客户编码'
            },
                {
                    field: 'NAME',
                    displayName: '客户名称'

                }]
        }

    };

    $scope.initHttp = function () {

        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "merchantNumberFlow/queryForGrid", {
                params: angular.toJson(data),
                current: $scope.gridApi.page ? $scope.gridApi.page : 1,
                size: $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100,
            }).success(function (response) {
                $scope.gridOptions.data = response.data.records;
                $scope.gridOptions.totalItems = response.data.total;
                layer.closeAll('loading');
            });
        };

        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "merchantNumberFlow/findOne", {id: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.data);
                    $scope.balanceOrderGridOption.data = $scope.VO.balanceOrder;
                } else {
                    if (response) {
                        if (response.msg) {
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                }
                if (callback) {
                    callback();
                }
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

        Array.prototype.indexOf = function (val) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == val) return i;
            }
            return -1;
        };

        Array.prototype.remove = function (val) {
            var index = this.indexOf(val);
            if (index > -1) {
                this.splice(index, 1);
            }
        };

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

    };

    $scope.initButton = function () {

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

        $scope.caibSapCostCenterRef = {
            id: $scope.$id,
            columnDefs: [
                {
                    field: 'CODE',
                    displayName: '客户编号'
                },
                {
                    field: 'NAME',
                    displayName: '客户名称'
                }
            ],
            data: ""
        }
        $scope.sendvoucher = function () {
            if(null==$scope.VO.sapCenter){
                return layer.alert("请先选择成本中心!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            if(null==$scope.VO.factCustomer){
                return layer.alert("请先选择财务客商!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            $http.post($rootScope.basePath + "merchantNumberFlow/sendVoucher", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    if (response.code == 456) {
                        //layer.msg(response.msg);
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if (response.code == 200) {
                        // angular.assignData($scope.VO, response.VO);
                        $scope.VO.sapCustomerCode = 4;
                        $scope.isGrid = false;
                        // $scope.onCard();
                        $scope.isCard = true;
                        $scope.isBack = true;
                        $scope.isEdit = false;
                        $scope.isDisabled = false;
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                        $scope.html = response.result;
                        ngDialog.openConfirm({
                            showClose: true,
                            closeByDocument: false,
                            template: 'view/merchantNumberFlowAudit/voucher.html',
                            className: 'ngdialog-theme-formInfo',
                            scope: $scope,
                            preCloseCallback: function (value) {
                                if (value && value == "clear") {
                                    //重置
                                    return false;
                                }
                                return true;
                            }
                        }).then(function (value) {

                        }, function (reason) {
                            // $scope.isBack = false;
                        });
                    }
                });

        };

        $scope.viewvoucher = function () {
            if(null==$scope.VO.sapCenter){
                return layer.alert("请先选择成本中心!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            if(null==$scope.VO.factCustomer){
                return layer.alert("请先选择财务客商!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            $http.post($rootScope.basePath + "merchantNumberFlow/viewvoucher", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    if (response.code == 456) {
                        //layer.msg(response.msg);
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if (response.code == 200) {
                        // angular.assignData($scope.VO, response.VO);
                        $scope.VO.sapCustomerCode = 4;
                        $scope.isGrid = false;
                        // $scope.onCard();
                        $scope.isCard = true;
                        $scope.isBack = true;
                        $scope.isEdit = false;
                        $scope.isDisabled = false;
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                        $scope.html = response.result;
                        ngDialog.openConfirm({
                            showClose: true,
                            closeByDocument: false,
                            template: 'view/merchantNumberFlowAudit/voucherView.html',
                            className: 'ngdialog-theme-formInfo',
                            scope: $scope,
                            preCloseCallback: function (value) {
                                if (value && value == "clear") {
                                    //重置
                                    return false;
                                }
                                return true;
                            }
                        }).then(function (value) {

                        }, function (reason) {
                            // $scope.isBack = false;
                        });
                    }
                });

        };

        /**
         * 凭证审核不通过
         */
        $scope.onVoucherUnPass = function () {
            layer.confirm('确认当前结算数据不准确吗？窗口将关闭', {
                    btn: ['是', '否'], //按钮
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

                    $http.post($scope.basePath + "merchantNumberFlow/unpassVoucher", {data: angular.toJson($scope.VO)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            layer.msg('完成!', {
                                shift: 6,
                                icon: 11
                            });
                        } else {
                            layer.msg('处理失败！', {
                                icon: 1
                            });
                        }
                        ngDialog.close();

                    });

                }
            );
        }

        /**
         * 凭证审核通过
         */
        $scope.onVoucherPass = function () {
            layer.confirm('确认发送当前的凭证到SAP吗？', {
                    btn: ['是', '否'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消发送!', {
                            shift: 6,
                            icon: 11
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function (index) {
                    layer.close(index);
                    layer.load(2);
                    $http.post($scope.basePath + "merchantNumberFlow/sendVoucherToSap", {data: angular.toJson($scope.VO)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == 200) {
                            //关闭SAP凭证的窗口
                            ngDialog.close();
                            //刷新页面数据
                            $scope.findOne($scope.VO.id);
                            if (response) {
                                if (response.msg) {
                                    // e.g. 字符转换为Entity Name
                                    response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                        var rs = asciiChartSet_c2en[matched];
                                        return rs == undefined ? matched : rs;
                                    });
                                    layer.closeAll('loading');
                                    layer.msg(response.msg, {icon: 1});
                                }
                            }
                            //  layer.msg(response.msg, {icon: 1});
                        } else {
                            layer.closeAll('loading');
                            return layer.alert(response.msg.msg, {
                                skin: 'layui-layer-lan',
                                closeBtn: 1
                            });
                        }

                    });
                }
            );
        }

        /**
         * 取消
         */
        $scope.onVoucherCancel = function () {
            ngDialog.close();
            layer.load(2);
            if($scope.VO.sapCustomernCode==null){
                $scope.VO.sapCustomernCode = 4;
            }
            $http({
                method: "POST",
                url: $rootScope.basePath + "merchantNumberFlow/save",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response.code == 200) {
                    angular.assignData($scope.VO, response.result);
                    $scope.isGrid = false;
                    $scope.isCard = true;
                    $scope.isForm = false;
                    layer.closeAll('loading');
                    layer.alert("保存成功!", {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
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
            $scope.findOne(id,function (){
                $scope.card=true;
                $scope.isBack = true;
                $scope.isGrid = false;
                $scope.isCard = true;
                $scope.upOrDown = true;
                $scope.isAudit = false;
            });
        };

        /**
         * 审核
         */
        $scope.onMerchantNumberFlowAudit = function (){

            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1)
                return layer.alert("请选择一条数据进行审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });

            $scope.findOne(rows[0].id,function (){
                $scope.card=true;
                $scope.isBack = true;
                $scope.isGrid = false;
                $scope.isCard = true;
                $scope.upOrDown = true;
                $scope.isAudit = true;
                //准备审核前的数据
                //过账日期
                $scope.VO.sendDay=new Date().format("yyyy-MM-dd");
                //成本中心
                $scope.caibSapCostCenterRefs($scope.VO);
                //根据对方户名自动匹配财务客商，若没有需要客户手动选择
                if($scope.VO.factCustomer==null){
                    var data={name:$scope.VO.customer.name};
                    $http.post($scope.basePath + "sapCustomerRef/findOne", {
                        data: angular.toJson(data),
                    }).success(function (response) {
                        if (response.code == 200) {
                            $scope.VO.factCustomer=response.data;
                        }
                    });
                }
            });
        }

        $scope.caibSapCostCenterRefs = function (data) {
            $http.post($scope.basePath + "caibSapCostCenterRef/findByPkdept", {data: angular.toJson(data)}).success(function (response) {
                if (response && response.code == "200") {
                    if (response.result.length>0){
                        $scope.VO.sapCenter = response.result[0];
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
                }
            });
        };

        /*
         * 关联
         * */
        $scope.onLink = function () {
        };

        $scope.onCancel = function () {
            if($scope.isClear){
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
            if($stateParams.id) {
                window.history.back(-2);
                return;
            }
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isDisabled = true;
            $scope.isUploadAnytime = false;
            //阻止页面渲染
            $scope.form=false;
            $scope.card=false;
            $scope.queryForGrid($scope.QUERY);
            $scope.initPage();
        };
        /*
         * 随时上传附件功能
         * */
        $scope.onUploadAnyTime = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            $scope.isUploadAnytime = true;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form = true;
                $scope.isGrid = false;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id);
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = true;
                $scope.isDisableds = true;
            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = true;
                $scope.isDisableds = true;
            }

        }
        /**
         * 保存判断必输项
         */
        $scope.onSave = function () {
            if ($scope.isUploadAnytime) {
                $scope.onSaveVO();
                $scope.isUploadAnytime = false;
                return;
            }
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    if($scope.clearingGridOptions.data.length==0){
                        return layer.alert("请录入到账信息!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if($scope.clearingDetailGridOptions.data.length==0){
                        return layer.alert("请录入结算信息!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if($scope.clearingGridOptions.data[0].matching_money>$scope.clearingGridOptions.data[0].amount){
                        return layer.alert("到账信息匹配金额不能大于可用金额!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    for(var i=0;i<$scope.clearingDetailGridOptions.data.length;i++){
                        if($scope.clearingDetailGridOptions.data[i].MATCHING_MONEY>$scope.clearingDetailGridOptions.data[i].AMOUNT_MONEY){
                            return layer.alert("结算信息匹配金额不能大于可用金额!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if($scope.invoicenoGridOptions.data.length==0){
                        return layer.alert("请录入发票信息!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
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
         * 初始化参照
         */
        $scope.initView = function () {

        };

        /**
         * 子表新增
         */
        $scope.onAddLine = function (name) {
            if(name=="clearingGridOptions"){
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: 'view/subscriptionAudit/subscriptionRef.html',
                    className: 'ngdialog-theme-formInfo',
                    controller: 'clearingGridOptionsCtrl',
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
                        for(var i=0; i<value.length;i++){
                            $scope[$scope.selectTabName].data.push(value[i]);
                        }
                    }
                }, function (reason) {
                });
            }else if(name=="clearingDetailGridOptions"){
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: 'view/subscriptionAudit/clearingDetailRef.html',
                    className: 'ngdialog-theme-formInfo',
                    controller: 'clearingDetailGridOptionsCtrl',
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
                        for(var i=0; i<value.length;i++){
                            $scope[$scope.selectTabName].data.push(value[i]);
                        }
                    }
                }, function (reason) {
                });
            } else{
                $scope[name].data.push({});
            }

        };
        /**
         * 子表删除
         */
        $scope.onDeleteLine = function (name) {
            var delRow = $scope[name].gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (var i = 0; i < $scope[name].data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope[name].data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope[name].data.splice(i, 1);
                    }
                }
            }
        };
    };

    $scope.initPage = function () {
        $scope.form=false;
        $scope.isClear = false;
        $scope.card=false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;
        $scope.isAudit = false;
        //控制附件上传和下载
        $scope.upOrDown = false;
        $scope.isUploadAnytime = false;
        $scope.gridOptions = {
            rowTemplate: "<div ng-dblclick=\"grid.appScope.onRowDblClick(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>",
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            //导出功能
            useExternalPagination: true,
            exporterMenuCsv: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '商户号流水审核.csv',
            columnDefs: [
                {name: 'flowNo', displayName: '信息编号'},
                {name: 'thirdOrgType', displayName: '第三方支付机构名称',cellFilter: 'SELECT_THIRDORGTYPE'},
                {name: 'accountNumber', displayName: '账号'},
                {name: 'tradeDate', displayName: '交易日期'},
                {name: 'inFlowAmount', displayName: '当日流入总金额（元）', cellFilter: 'AMOUNT_FILTER'},
                {name: 'outFlowAmount', displayName: '当日流出总金额（元）', cellFilter: 'AMOUNT_FILTER'},
                {name: 'flowAmount', displayName: '当日净流入金额（元）', cellFilter: 'AMOUNT_FILTER'},
                {name: 'sapCustomernCode', displayName: 'SAP凭证状态', cellFilter: 'SELECT_SAPTYPE'},
                {name: 'billstatus', displayName: '单据状态', cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人'},
                {name: 'createTime', displayName: '制单日期', cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'pkOrg.name', displayName: '业务单位'},
                {name: 'pkDept.name', displayName: '部门'},
                {name: 'pkChecker.name', displayName: '审核人'},
                {name: 'checkDate', displayName: '审核日期',cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'pkAuditor.name', displayName: '最终审核人'},
                {name: 'auditDate', displayName: '最终审核日期',cellFilter: 'date:"yyyy-MM-dd"'},
            ],
            data: [],
            exporterAllDataFn: function () {
                $scope.queryAllForGrid($scope.QUERY);
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


        //订单流水
        $scope.balanceOrderGridOption = {
            enableCellEditOnFocus: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,//不显示选中框
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '订单流水.csv',
            columnDefs: [
                {name: 'serialNo', displayName: '流水号'},
                {name: 'payment', displayName: '交易金额',cellFilter: 'AMOUNT_FILTER'},
                {name: 'paytime', displayName: '交易时间'},
                {name: 'busiType', displayName: '交易类型业务类型',cellFilter: "SELECT_ORDER_BUSI_TYPE"},
            ],
            data: $scope.VO.balanceOrder,
            onRegisterApi: function (gridApi) {
                $scope.balanceOrderGridOption.gridApi = gridApi;
                $scope.balanceOrderGridOption.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                $scope.balanceOrderGridOption.gridApi.selection.on.rowSelectionChanged(
                    $scope, function (row, event) {

                    });
            }
        };

        if($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
    };

    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initworkflow($scope, $http,ngDialog);
    initonlineView($scope,$rootScope,$sce,$http,ngDialog);
});
