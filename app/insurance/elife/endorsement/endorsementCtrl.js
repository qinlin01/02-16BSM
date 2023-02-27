app.controller('endorsementCtrl', function ($rootScope, $scope,$sce,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                payments:[],
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                billstatus: 31,
                dr: 0,
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.entityVO = 'nc.vo.busi.endorsementsVO';
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "id": $stateParams.id
            }
        };
        $scope.funCode = '907';
        $scope.QUERY = $scope.initQUERY();
    };
    /**
    * 对账单参照
    * */
    $scope.internetPolicyRef =
        {
            id: $scope.$id,
            columnDefs: [
                {
                    field: 'insuranceno',
                    displayName: '保单号'
                },
                {
                    field: 'insuranceinfono',
                    displayName: '保单信息编号'
                },
            ],
            data: ""
        };
    $scope.initHttp = function () {
        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data) {
            layer.load(2);
            return $http.post($rootScope.basePath + "endorsements/queryAllForGrid", {
                params: angular.toJson(data),
                fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response && response.code == 200) {
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            }).error(function () {
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
            $http.post($scope.basePath + "endorsements/queryForGrid", {
                params:angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
            }).success(function (response) {
                if (response.code == 200){
                    $scope.gridOptions.data = response.data.Rows;
                    $scope.gridOptions.totalItems = response.data.total;
                    layer.closeAll('loading');
                }
            }).error(function () {
                    layer.closeAll('loading');
            });
        };

        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "endorsements/findOne", {id: pk}).success(function (response) {
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.data);
                    $scope.VO.endorsementType = response.data.endorsementType;
                    if (response.data.payments!=null){
                        $scope.paymentStatus = true;
                        $scope.paymentGridOptions.data = response.data.payments;
                    }
                    if (response.data.dealAttachmentB!=null){
                        $scope.dealAttachmentStatus = true;
                        $scope.dealAttachmentBGridOptions.data = response.data.dealAttachmentB;
                    }
                    if (callback)  callback();
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
        $scope.$watch('VO.webInsurance.insurance_code', function (newVal, oldValue) {
            if (newVal == oldValue || newVal == undefined || newVal == '') return;
            if ($scope.isEdit) {
                layer.load(2);
                $http.post($scope.basePath + "endorsements/webInsurance", {data: angular.toJson($scope.VO)}).success(function (response) {
                    if (response) {
                        if (response.code ==200){
                            $scope.VO.webInsurance = response.webInsurance;
                            $scope.VO.webInsurance.insurance_code= response.webInsurance.insuranceCode;
                            $scope.VO.insurancemoneychange = response.webInsurance.paymount;
                            $scope.VO.insurancechargechange = response.webInsurance.receivemount;
                            $scope.VO.feechange = response.webInsurance.receiveFeeMount;
                        } else if(response.code == 500){
                            return layer.alert(response.msg, {
                                skin: 'layui-layer-lan',
                                closeBtn: 1
                            });
                        }
                    }

                })
            }
        }, true);
    };

    $scope.initButton = function () {
        /**
         * 暂存
         */
        $scope.onTemporary = function (data) {
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
                $http({
                    method: "POST",
                    url: $rootScope.basePath + "endorsements/temporarySave",
                    data: angular.toJson($scope.VO),
                    headers: {'Content-Type': 'application/json;charset=UTF-8'},
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
                    $scope.VO.dealAttachmentB= $scope.dealAttachmentBGridOptions.data ;
                    if($scope.VO.dealAttachmentB.length == 0){
                        return layer.alert("请上传附件!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.VO.billstatus == 37) {
                        $scope.VO.billstatus = 31;
                    }
                    $scope.onSaveVO();
                }
            }, true);
        };
        /**
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $http({
                method: "POST",
                url: $rootScope.basePath + "endorsements/save",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response && response.code == 200) {
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isEdit = false;
                    $scope.isDisabled = true;
                    $scope.isDisableds = true;
                    $scope.isUpdate = false;
                    angular.assignData($scope.VO, response.result);
                    layer.closeAll('loading');
                    return layer.alert('保存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
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
            $scope.QUERY.id = null;
        };

        $scope.onSubCancel = function () {
            ngDialog.close();
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
            if ($stateParams.id) {
                window.history.back(-2);
                return;
            }
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isDisabled = true;
            //阻止页面渲染
            $scope.form = false;
            $scope.card = false;
            $scope.queryForGrid($scope.QUERY);
        };

        /**
        * 互联网增加功能
        * */
        $scope.onAdd = function () {
            $scope.form = true;
            $scope.isGrid = false;
            $scope.isClear = true;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            angular.assignData($scope.VO, $scope.initVO());
            $scope.VO.vdef1no = 1;
            $rootScope.onAddCheck($scope);
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
        /**
         * 卡片
         */
        $scope.onCard = function (id) {
            if (!id) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) {
                    return layer.alert("请选择一条数据进行查看!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                } else {
                    id = rows[0].id;
                }
            }
            $http.post($scope.basePath + "endorsements/findOne", {id: id}).success(function (response) {
                if (response && response.code == "200") {
                    $scope.card=true;
                    angular.assignData($scope.VO, response.data);
                    $scope.VO.endorsementType = response.data.endorsementType;
                    if (response.data.payments!=null){
                        $scope.paymentStatus = true;
                        $scope.paymentGridOptions.data = response.data.payments;
                    }
                    if (response.data.dealAttachmentB!=null){
                        $scope.dealAttachmentStatus = true;
                        $scope.dealAttachmentBGridOptions.data = response.data.dealAttachmentB;
                    }
                    if(!response.data.taskHis)
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
                    $http.post($scope.basePath + "endorsements/delete", {ids: angular.toJson(ids)}).success(function (response) {
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


            /*
             * 关联
             * */
            $scope.onLink = function () {

            };


        };


        /**
         * 子表删除
         */
        $scope.onDeleteLine = function () {
            let delRow = $scope[$scope.selectTabName].gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (let i = 0; i < $scope[$scope.selectTabName].data.length; i++) {
                for (let j = 0; j < delRow.length; j++) {
                    if ($scope[$scope.selectTabName].data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope[$scope.selectTabName].data.splice(i, 1);
                    }
                }
            }
        };
        /**
        * 附件上传
        * */
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
                    //  第一次初始化成null，后台没值，应该【】
                    if ($scope.dealAttachmentBGridOptions.data) {
                        angular.forEach(value, function (item) {
                            item.file_name = item.attachment_name;
                            item.ts = new Date().format("yyyy-MM-dd HH:mm:ss");
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });

                    } else {
                        angular.forEach(value, function (item) {
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });
                    }


                }
            }, function (reason) {

            });
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
        };

    };
    $scope.initPage = function () {
        $scope.form = false;
        $scope.card = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        //控制附件上传和下载
        $scope.upOrDown = false;
        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
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
            exporterCsvFilename: '互联网批单.csv',
            columnDefs: [
                {name: 'vbillno', displayName: '批单信息编号', },
                {name: 'insurancecheckno', displayName: '批单编号', },
                {name: 'vdef1no', displayName: '批单类型', cellFilter: 'SELECT_CHANGEBILLCHECKTYPE1'},
                {name: 'insuranceinfono', displayName: '保单信息编号'},
                {name: 'insuranceno', displayName: '保单号' },
                {name: 'endorsement_type', displayName: '批单类型',cellFilter: 'SELECT_CORRECTINGREASONSTYPE_1'},
                // {name: 'serial_no', displayName: '订单流水'},
                // {name: 'busi_type', displayName: '交易类型',cellFilter: 'SELECT_ORDER_BUSI_TYPE'},
                // {
                //     name: 'amount', displayName: '订单金额',  cellFilter: 'AMOUNT_FILTER',
                //     cellClass: function () {
                //         return "lr-text-right"
                //     }
                // },
                // {
                //     name: 'payment', displayName: '消费金额',  cellFilter: 'AMOUNT_FILTER',
                //     cellClass: function () {
                //         return "lr-text-right"
                //     }
                // },
                {
                    name: 'feechange', displayName: '佣金变更',  cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'insurancechargechange', displayName: '保费变更',  cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'insurancemoneychange', displayName: '保险金额变更',  cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'billstatus', displayName: '单据状态',  cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'create_time', displayName: '制单时间', },
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
                    angular.assignData($scope.VO, row.entity);
                    $scope.findOne(rows[0].id);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });


        };

        //收付款信息
        $scope.paymentGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            columnDefs: [
                {
                    name: 'stages', displayName: '期数', width: 100, enableCellEdit: false


                },
                {
                    name: 'tradingChannel',
                    displayName: '渠道',
                    width: 100,
                    cellFilter: 'SELECT_PAYMODE',
                    enableCellEdit: false
                },
                {
                    name: 'rechargeType',
                    displayName: '交易方式',
                    width: 100,
                    cellFilter: 'SELECT_RECHARGETYPE',
                    enableCellEdit: false
                },
                {
                    name: 'typeMoneyNo', displayName: '收付款类型', width: 100, cellFilter: 'SELECT_TYPEMONEY'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.TYPEMONEY, enableCellEdit: false
                },
                {
                    name: 'pkCompany.name', displayName: '收付款对象名称', width: 100, enableCellEdit: false
                },
                {
                    name: 'scaleMoney', displayName: '收付款比例', width: 100, cellFilter: 'number:2'
                },
                {
                    name: 'planDate',
                    displayName: '计划日期',
                    width: 100,
                    editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'planMoney',
                    displayName: '计划金额',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'factMoney',
                    displayName: '已结算金额',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'noPaymentMoney',
                    displayName: '未结算金额',
                    width: 100,

                    enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'factDate',
                    displayName: '结算日期',
                    width: 100,
                    enableCellEdit: false,
                    editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'vsettlebillno', displayName: '业务结算单号', width: 100, enableCellEdit: false

                },
            ],
            data: $scope.VO.payments,
            onRegisterApi: function (gridApi) {
                $scope.paymentGridOptions.gridApi = gridApi;
            }
        };

        //附件
        $scope.dealAttachmentBGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            columnDefs: [
                {name: 'file_name', displayName: '附件名称',enableCellEdit: false},
                {
                    name: 'ts', displayName: '上载时间',  enableCellEdit: false
                },
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
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();

        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {
            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }

    };
    $scope.table_name = "t_fictitious_endorsements";
    $scope.billdef = "Changebillcheck";
    $scope.beanName ="insurance.ExamineServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initPreviewFile($scope,$rootScope);
    initworkflow($scope, $http, ngDialog);
    initonlineView($scope,$rootScope,$sce,$http,ngDialog);

});
