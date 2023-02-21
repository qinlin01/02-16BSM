/**
 * @email 1476351171@qq.com
 * @author:Aiko
 * @date: 2020-08-07
 * @phone 15047424931
 */
app.controller('subscriptionAuditCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                subscriptionno:"",
                contractDocumentno:"",
                purchaser:"",
                clearing: [],
                clearingDetail: [],
                invoicenoInfo: [],
                dealAttachmentB: [],
                subjectGridOption: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                billstatus:31,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                dr:0,
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.isSend=false;
        //初始化查询
       $scope.initQUERY = function () {
            return {
                "operate_year": parseInt(new Date().format("yyyy")),
                "id":$stateParams.id
            }
        };
        $scope.funCode = "1002";
        $scope.QUERY = $scope.initQUERY();
        $scope.t1Flag = true;
        $scope.t2Flag = true;
        $scope.t3Flag = true;
    };

    $scope.uiPopupRef= {
        "id": $scope.$id,
        "columnDefs": [{
            field: 'CODE',
            displayName: '客户编码'
        },
            {
                field: 'NAME',
                displayName: '客户名称'
            }]
    }
    $scope.changeBillRef =
    {
        id: $scope.$id,
        columnDefs: [
            {
                field: 'code',
                displayName: '保单号'
            },
            {
                field: 'name',
                displayName: '险种'
            },
            {
                field: 'insuranceman',
                displayName: '保险公司'
            },
            {
                field: 'startdate',
                displayName: '开始日期'
            }
        ],
        data: ""
    };

    $scope.initHttp = function () {
        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data ,fun,isPrint,etype) {
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData =  $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.basePath + "subscriptionAudit/queryAllForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData),
                isPrint:isPrint,
                etype:0,//0：excel 1：pdf
            })
                .success(function (response) {
                    if(fun) fun(response);
                    if(isPrint){
                        window.open(getURL(response.queryPath));
                    }else{
                        window.open($rootScope.basePath + "uploadFile/downLoadByUrl?url="+encodeURI(encodeURI(response.downPath)));
                    }
                    layer.closeAll('loading');
                }).error(function () {
                    layer.closeAll('loading');
                });
        };
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "subscriptionAudit/queryForGrid", {
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


        //作废
        $scope.onDiscard = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert("请选择一条数据!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.confirm('是否作废选中数据？', {
                    btn: ['作废', '返回'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消作废!', {
                            shift: 6,
                            icon: 11
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    layer.load(2);
                    $http.post($scope.basePath + "subscriptionAudit/discard",{pk:$scope.pk,billdef:$scope.billdef}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            if (response.code == 200) {
                                //调用查询方法刷新页面
                                $scope.queryForGrid($scope.QUERY);
                                return layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                                // layer.msg(response.msg, {
                                //     shift: 6,
                                //     icon: 1
                                // });
                            } else {
                                layer.msg('操作失败!', {
                                    shift: 6,
                                    icon: 11
                                });
                            }
                        }
                    });
                }
            );
        };
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            layer.load(2);
            $http.post($scope.basePath + "subscriptionAudit/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.chilbTableReload();
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
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            $scope.VO.clearing = $scope.clearingGridOptions.data;
            $scope.VO.clearingDetail = $scope.clearingDetailGridOptions.data;
            $scope.VO.invoicenoInfo = $scope.invoicenoGridOptions.data;
            // $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            // for(var i=0;i<$scope.VO.payment.length;i++){
            //     $scope.VO.payment[i].noPaymentMoney = parseFloat($scope.VO.payment[i].planMoney) - parseFloat($scope.VO.payment[i].factMoney);
            // }
            if ($scope.VO.billstatus == 37) {
                $scope.VO.billstatus = 31;
            }
            layer.load(2);
            $http.post($rootScope.basePath + "subscriptionAudit/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                    } if(response){
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function(matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }

                });
        };

        //打印资金到账通知单
        $scope.onPrintSignCheckBill = function (gridApi,htmlPathCheckBill,type) {
            // $scope.raq = "signCheckBill";
            $scope.raq = type;
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);

            $http.post($rootScope.basePath + 'subscriptionAudit/signCheckBill', {
                data: angular.toJson($scope.VO),
                raq: $scope.raq,
                type: "PDF"
            },{responseType:'arraybuffer'}).success(function (response) {
                var files = new Blob([response],{type: "application/pdf",filename:response.name});
                var fileURL = URL.createObjectURL(files);
                $scope.content=$sce.trustAsResourceUrl(fileURL);
                $scope.type = "application/pdf";
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: 'pdfView.html',
                    className: 'ngdialog-theme-formInfo',
                    controller: 'pdfViewCtrl',
                    scope: $scope,
                    preCloseCallback: function (value) {
                        if (value && value == "clear") {
                            //重置
                            return false;
                        }
                        //取消
                        return true;
                    }
                })
            });
        }

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

        $scope.chilbTableReload = function () {

            if($scope.VO.isRelife && $scope.VO.isRelife=='Y'){
                $scope.clearingGridOptions.columnDefs = [
                    {
                        name: 'transaction_name.unitname', displayName: '交易账户名称', width: 200, enableCellEdit: false
                    },
                    {
                        name: 'transaction_date', displayName: '到账日期', width: 150, enableCellEdit: false, cellFilter: 'date:"yyyy-MM-dd"'
                    },
                    {
                        name: 'transaction_account_view', displayName: '付款账号', width: 150, enableCellEdit: false
                    },
                    {
                        name: 'reciprocal_name.name', displayName: '对方账户名称', width: 200, enableCellEdit: false
                    },
                    {
                        name: 'lender_amount', displayName: '贷方金额', width: 150, enableCellEdit: false,  cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'amount', displayName: '可用金额', width: 150, enableCellEdit: false,  cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'matching_money', displayName: '匹配金额', width: 150, enableCellEdit: false,  cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'againRateCNY', displayName: '兑人民币汇率', enableCellEdit: false, cellFilter: 'RATE_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'matching_money_cny', displayName: '人民币金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                ];
                $scope.clearingDetailGridOptions.columnDefs = [
                    {name: 'collectAdvance', displayName: '是否预收佣金', enableCellEdit: false,cellFilter: 'SELECT_YESNO'  },
                    {name: 'inoutType', displayName: '结算类型', width: 100,cellFilter: 'SELECT_ITEMTYPE',enableCellEdit: false},
                    {
                        name: 'VBILLNO', displayName: '结算单号', enableCellEdit: false,
                    },
                    {
                        name: 'factactualcollection.name', displayName: '实际往来对象', enableCellEdit: false
                    },
                    {
                        name: 'sapCustomerCode.NAME',
                        displayName: '财务客商名称',
                        width: 250,
                        url: 'sapCustomerRef/queryForGrid',
                        placeholder: '请选择',
                        editableCellTemplate: 'ui-grid/refEditor',
                        popupModelField: 'sapCustomerCode',
                        uiPopupRef: {
                            "id": $scope.$id, "columnDefs": [{
                                field: 'CODE',
                                displayName: '客户编码'
                            },
                                {
                                    field: 'NAME',
                                    displayName: '客户名称'
                                }]
                        },
                        enableCellEdit: true
                    },
                    {
                        name: 'FACT_MONEY', displayName: '结算金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'AMOUNT_MONEY', displayName: '可用金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'MATCHING_MONEY', displayName: '匹配金额', cellFilter: 'AMOUNT_FILTER',enableCellEdit: false,
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'againRateCNY', displayName: '兑人民币汇率', enableCellEdit: false, cellFilter: 'RATE_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'moneyCNY', displayName: '人民币金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                ]
            }else{
                $scope.clearingGridOptions.columnDefs = [
                    {
                        name: 'transaction_name.unitname', displayName: '交易账户名称', width: 200, enableCellEdit: false
                    },
                    {
                        name: 'transaction_date', displayName: '到账日期', width: 150, enableCellEdit: false, cellFilter: 'date:"yyyy-MM-dd"'
                    },
                    {
                        name: 'transaction_account_view', displayName: '付款账号', width: 150, enableCellEdit: false
                    },
                    {
                        name: 'reciprocal_name.name', displayName: '对方账户名称', width: 200, enableCellEdit: false
                    },
                    {
                        name: 'lender_amount', displayName: '贷方金额', width: 150, enableCellEdit: false,  cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'amount', displayName: '可用金额', width: 150, enableCellEdit: false,  cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'matching_money', displayName: '匹配金额', width: 150, enableCellEdit: false,  cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    }
                ];

                $scope.clearingDetailGridOptions.columnDefs = [
                    {
                        name: 'VBILLNO', displayName: '结算单号', enableCellEdit: false
                    },
                    {
                        name: 'ACTUALCOLLECTION', displayName: '实际往来对象', enableCellEdit: false
                    },
                    {
                        name: 'SAP_CUSTOMER_NAME', displayName: '财务客商名称', enableCellEdit: false
                    },
                    {
                        name: 'FACT_MONEY', displayName: '结算金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'AMOUNT_MONEY', displayName: '可用金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'MATCHING_MONEY', displayName: '匹配金额', cellFilter: 'AMOUNT_FILTER',enableCellEdit: false,
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                ]
            }

        }

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

        $scope.getClearing = function () {
            $http.post($scope.basePath + "subscriptionAudit/getClearing", {params:angular.toJson($rootScope.orgVO)}).success(function (response)  {
                if (response && response.code == "200") {
                    // angular.assignData($scope.VO, response.result);
                    $scope.clearingGridOptions.data =  response.clearingList;
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

        $scope.getClearingDetail = function (data) {
            $http.post($scope.basePath + "subscriptionAudit/getClearingDetail", {params:angular.toJson(data)}).success(function (response)  {
                if (response && response.code == "200") {
                    $scope.clearingDetailGridOptions.data =  response.clearingDetail;
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

        };
    $scope.indexNum = 0;
    $scope.initWatch = function () {
        $scope.$watch('clearingGridOptions.data', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
            }
        }, true);
    };

    $scope.initButton = function () {

        $scope.onUploads = function () {
            $scope.isSubDisabled = false;
            $scope.aVO = {};
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/common/attachments.html',
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
                            item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
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
            exportEx.attr('target','_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action',$rootScope.basePath+'uploadFile/downloadFiles');
            exportEx.submit();
        };
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
            $scope.VO.subjectGridOption = $scope.subjectGridOptions.data;
            $http.post($rootScope.basePath + "subscriptionAudit/sendVoucher", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    if ($scope.VO.isRelife=='Y'&&$scope.VO.replace=='Y'){
                        // 再保险并且是代收代付，进行人民币换算
                        for(var i=0;i<$scope.VO.clearingDetail.length;i++){
                            $scope.VO.againRateCNY = $scope.VO.clearingDetail[i].againRateCNY;
                            $scope.VO.clearingDetail[i].FACT_MONEY = Number.parseFloat($scope.VO.clearingDetail[i].FACT_MONEY_bak);
                            $scope.VO.clearingDetail[i].MATCHING_MONEY = Number.parseFloat($scope.VO.clearingDetail[i].MATCHING_MONEY_bak);
                        }
                        for(var i=0;i<$scope.VO.clearing.length;i++){
                            $scope.VO.clearing[i].matching_money = Number.parseFloat($scope.VO.clearing[i].matching_money_bak);
                        }
                    }
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
                            template: 'view/clearingAudit/voucher.html',
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
            $http.post($rootScope.basePath + "subscriptionAudit/viewvoucher", {data: angular.toJson($scope.VO)})
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
                            template: 'view/subscriptionAudit/voucher.html',
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

                    $http.post($scope.basePath + "subscriptionAudit/unpassVoucher", {data: angular.toJson($scope.VO)}).success(function (response) {
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
                    $http.post($scope.basePath + "subscriptionAudit/sendVoucherToSap", {data: angular.toJson($scope.VO)}).success(function (response) {
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
        }


        $scope.onAdd = function () {
            $scope.form=true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isUploadAnytime = false;
            $scope.isClear = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
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
        /**
         * 暂存
         */
        $scope.onTemporary = function (data) {
            $scope.VO.insuranceman=$scope.insurancemanGridOptions.data;
            $scope.VO.payment=$scope.paymentGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
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
        $scope.onCard = function (id,type) {
            if(!id){
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1)
                return layer.alert("请选择一条数据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                id = rows[0].id;
            }
            if(null!=type&&type==1){
                $scope.isSend=true;
            }else{
                $scope.isSend=false;
            }
            $http.post($scope.basePath + "subscriptionAudit/findOne", {pk: id}).success(function (response) {
                if (response && response.code == "200") {
                    $scope.card=true;
                    angular.assignData($scope.VO, response.result);
                    $scope.clearingGridOptions.data = $scope.VO.clearing;
                    $scope.clearingDetailGridOptions.data = $scope.VO.clearingDetail;
                    // $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    $scope.subjectGridOptions.data = [];

                    angular.assignData($scope.VO, response.result);
                    if ($scope.VO.isRelife=='Y'&&$scope.VO.replace=='Y'){
                        // 再保险并且是代收代付，进行人民币换算
                        for(var i=0;i<$scope.VO.clearingDetail.length;i++){
                            $scope.VO.againRateCNY = $scope.VO.clearingDetail[i].againRateCNY;
                            $scope.VO.clearingDetail[i].FACT_MONEY_bak = angular.copy(Number.parseFloat($scope.VO.clearingDetail[i].FACT_MONEY));
                            $scope.VO.clearingDetail[i].MATCHING_MONEY_bak = angular.copy(Number.parseFloat($scope.VO.clearingDetail[i].MATCHING_MONEY));
                            $scope.VO.clearingDetail[i].FACT_MONEY = Number.parseFloat($scope.VO.clearingDetail[i].FACT_MONEY)*Number.parseFloat($scope.VO.againRateCNY);
                            $scope.VO.clearingDetail[i].MATCHING_MONEY = Number.parseFloat($scope.VO.clearingDetail[i].MATCHING_MONEY)*Number.parseFloat($scope.VO.againRateCNY);
                            $scope.VO.clearingDetail[i].FACT_MONEY_cny = angular.copy($scope.VO.clearingDetail[i].FACT_MONEY);
                            $scope.VO.clearingDetail[i].MATCHING_MONEY_cny = angular.copy($scope.VO.clearingDetail[i].MATCHING_MONEY);
                        }
                        for(var i=0;i<$scope.VO.clearing.length;i++){
                            $scope.VO.clearing[i].matching_money_now = Number.parseFloat($scope.VO.clearing[i].matching_money);
                            $scope.VO.clearing[i].matching_money_bak = angular.copy(Number.parseFloat($scope.VO.clearing[i].matching_money));
                            $scope.VO.clearing[i].matching_money = Number.parseFloat($scope.VO.clearing[i].matching_money)*Number.parseFloat($scope.VO.againRateCNY);
                            $scope.VO.clearing[i].matching_money_cny = angular.copy($scope.VO.clearing[i].matching_money);
                        }
                    }

                    //根据对方户名自动匹配财务客商，若没有需要客户手动选择
                    $scope.caibSapCostCenterRefs($scope.VO);
                    if(null!=type&&type==1){
                        if(null==$scope.VO.factCustomer){
                            var data={name:$scope.VO.clearing[0].reciprocal_name.name};
                            //测试
                            // var data={name:"英大长安保险经纪有限公司"};
                            $http.post($scope.basePath + "sapCustomerRef/findOne", {
                                data: angular.toJson(data),
                            }).success(function (response) {
                                if (response.code == 200) {
                                    $scope.VO.factCustomer=response.data;
                                }
                            });
                        }
                        $scope.VO.sendDay=new Date().format("yyyy-MM-dd");
                        //查询结算数据SAP客户名称
                        //@zhangwj 再保险不查询
                        if(!$scope.VO.isRelife || $scope.VO.isRelife != 'Y'){
                            $http.post($scope.basePath + "subscriptionAudit/getSapCustomer", {
                                data: angular.toJson($scope.VO),
                            }).success(function (response) {
                                if (response.code == 200) {
                                    $scope.VO.clearingDetail=response.object.clearingDetail;
                                    $scope.clearingDetailGridOptions.data = $scope.VO.clearingDetail;
                                }
                            });
                        }
                    }
                    //匹配成本中心 根据
                    if(!response.result.taskHis)
                        $scope.mess=false;
                    else
                        $scope.mess=true;
                    $scope.isBack = true;
                    $scope.isGrid = false;
                    $scope.isCard = true;
                    $scope.upOrDown = true;

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
                    $http.post($scope.basePath + "subscriptionAudit/delete", {ids: angular.toJson(ids),rows: angular.toJson(rows)}).success(function (response) {
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

        $scope.onCancel = function () {
            if($scope.isClear){
                $scope.VO = $scope.initVO();
            }
            $scope.isDisabled = true;
            $scope.isEdit = false;
            $scope.isBack = false;
            $scope.isType=true;
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
        $scope.isType = true;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;
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
            exporterCsvFilename: '认领单信息.csv',
            columnDefs: [
                {name: 'subscriptionno', displayName: '认领单编号', width: 100,},
                {name: 'unitname', displayName: '交易账户名称', width: 100,},
                {name: 'reciprocal_account', displayName: '对方账号', width: 100,},
                {name: 'reciprocal_name', displayName: '对方户名', width: 100,},
                {
                    name: 'lender_amount', displayName: '到账总额', width: 100, cellFilter: 'AMOUNT_FILTER', cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'matching_money', displayName: '本次认领金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'amount', displayName: '到账单余额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'amount_count', displayName: '到账单数量', width: 100},
                {name: 'clearingDetail_count', displayName: '匹配结算单数量', width: 100},
                {name: 'currency', displayName: '币种', width: 100},
                {name: 'invoiceno', displayName: '发票编号', width: 100},
                {name: 'sapCustomernCode', displayName: 'SAP 凭证状态', width: 100, cellFilter: 'SELECT_SAPTYPE'},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator_name', displayName: '经办人', width: 100,},
                {name: 'operateTime', displayName: '制单时间', width: 100,},
                {name: 'pkOrg_name', displayName: '业务单位', width: 100,},
                {name: 'pkDept_name', displayName: '部门', width: 100,},

            ],
            data: $scope.VO,
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

        $scope.selectTabName = 'clearingGridOptions';
        $scope.clearingGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: true,
            columnDefs: [],
            data: $scope.VO.clearing,
            onRegisterApi: function (gridApi) {
                $scope.clearingGridOptions.gridApi = gridApi;
                $scope.clearingGridOptions.gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
                });
            }
        };
        $scope.selectTabName = 'clearingDetailGridOptions';
        $scope.clearingDetailGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: true,
            // cellEditableCondition:function($rootScope){
            //     if($scope.isEdit){
            //         return true;
            //     }else{
            //         return  false;
            //     }
            // },
            columnDefs: [],
            data: $scope.VO.clearingDetail,
            onRegisterApi: function (gridApi) {
                $scope.clearingDetailGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if(colDef.name=="MATCHING_MONEY"){
                            $scope.clearingGridOptions.data[0].matching_money=0;
                            for(var i=0;i<$scope.clearingDetailGridOptions.data.length;i++){
                                $scope.clearingGridOptions.data[0].matching_money+=$scope.clearingDetailGridOptions.data[i].MATCHING_MONEY*1;
                            }
                        }
                        $scope.$apply();
                    });
                }
            }
        };


        $scope.selectTabName = 'invoicenoGridOptions';
        $scope.invoicenoGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: true,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            columnDefs: [
                {
                    name: 'invoiceno', displayName: '发票号码', width: 200
                },
                {
                    name: 'invoicenoDate', displayName: '开票日期',  editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"', width: 200
                },
                {
                    name: 'totalPriceAndTax', displayName: '价税合计', width: 200,  cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                }, {
                    name: 'invoicePurchaser', displayName: '购买方名称', width: 400
                }
            ],
            data: $scope.VO.invoicenoInfo,
            onRegisterApi: function (gridApi) {
                $scope.invoicenoGridOptions.gridApi = gridApi;
            }
        };
        $scope.selectTabName = 'subjectGridOptions';
        $scope.subjectGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: false,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition:true,
            columnDefs: [
                {
                    name: 'subject', displayName: '总账科目', width: 100,
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownValueLabel: 'id',
                    editDropdownOptionsArray: getSelectOptionData.SUBJECTTYPE
                },
                {
                    name: 'subjectCode', displayName: '科目代码',  editableCellTemplate: 'ui-grid/refDate',  width: 100,cellEditableCondition:false
                },
                {
                    name: 'remark', displayName: '摘要', width: 200
                }, {
                    name: 'direction', displayName: '借贷方向', width: 100,cellFilter: 'SELECT_DIRECTIONTYPE'
                },
                {
                    name: 'sapCustomerCode.NAME',
                    displayName: '财务客商名称',
                    width: 250,
                    url: 'sapCustomerRef/queryForGrid',
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'sapCustomerCode',
                    uiPopupRef: {
                        "id": $scope.$id, "columnDefs": [{
                            field: 'CODE',
                            displayName: '客户编码'
                        },
                            {
                                field: 'NAME',
                                displayName: '客户名称'
                            }]
                    }
                },
                {
                    name: 'invoiceMoney', displayName: '金额', width: 100
                },
                {
                    name: 'againRate', displayName: '兑换人民币汇率', width: 100
                },
                {
                    name: 'invoiceMoneyCNY', displayName: '金额(人民币)', width: 100,enableCellEdit: true
                },
            ],
            // data: $scope.VO.invoicenoInfo,
            data: $scope.VO.subjectGridOption,
            onRegisterApi: function (gridApi) {
                $scope.subjectGridOptions.gridApi = gridApi;
            },
            onRegisterApi: function (gridApi) {
                $scope.subjectGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        //手动改摘要和人民币金额的话，不执行下边的变动
                        if ('remark' == colDef.name || 'invoiceMoneyCNY' == colDef.name) {
                            return;
                        }

                        if ('invoiceMoney' == colDef.name || 'againRate' == colDef.name) {
                            if(rowEntity.invoiceMoney && rowEntity.invoiceMoney!='' && rowEntity.againRate && rowEntity.againRate!=''){
                                rowEntity.invoiceMoneyCNY = (parseFloat(rowEntity.invoiceMoney) * parseFloat(rowEntity.againRate)).toFixed(2);
                            }
                        }

                        if ('subject' == colDef.name) {
                            for (let i = 0; i < getSelectOptionData.SUBJECTTYPE.length; i++) {
                                if( getSelectOptionData.SUBJECTTYPE[i].id==rowEntity.subject){
                                    rowEntity.subjectCode = getSelectOptionData.SUBJECTTYPE[i].name;
                                }
                            }
                        }
                        //@zhangwj 初始化摘要 以及 计算金额（人民币）字段
                        if(rowEntity.subject && rowEntity.subject!=''){
                            let remarkStr = "";
                            if(rowEntity.subjectCode != '6603040000'){
                                remarkStr = remarkStr + "确认含佣金的再保险费";
                            }else{
                                remarkStr = remarkStr + "确认手续费";
                            }
                            if(rowEntity.invoiceMoney && rowEntity.invoiceMoney!='' && rowEntity.againRate && rowEntity.againRate!=''){
                                if(rowEntity.subjectCode == '6711980000' || rowEntity.subjectCode == '6603040000'){
                                    remarkStr = remarkStr + "(" + rowEntity.invoiceMoney + "*" + rowEntity.againRate + ")";
                                }
                            }
                            rowEntity.remark = remarkStr;
                        }
                    });
                }
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
            columnDefs: [
                {
                    name: 'file_type', displayName: '附件类型', width: 100, enableCellEdit: false
                },

                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},

                {
                    name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                },
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
    $scope.table_name = "lr_subscription";
    $scope.billdef = "Changebillcheck";
    $scope.beanName ="insurance.SubscriptionServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initworkflow($scope, $http,ngDialog);
    initonlineView($scope,$rootScope,$sce,$http,ngDialog);
});



app.controller('clearingGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
    /**
     * 初始化页面变更方法
     */
    $scope.initQUERYChildren = function () {
        return {
            // insurancedmanpk:[]
        }
    };
    $scope.customerRef =
        {
            id: $scope.$id,
            columnDefs: [
                {
                    field: 'code',
                    displayName: '客户编号'
                },
                {
                    field: 'name',
                    displayName: '客户名称'
                }
            ],
            data: ""
        };
    $scope.QUERYCHILDREN = $scope.initQUERYChildren();
    $scope.initData = function () {
        $scope.subscriptionGridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: false,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {
                    name: 'transaction_name.unitname', displayName: '交易账户名称', width: 200
                },
                {
                    name: 'transaction_date', displayName: '到账日期', width: 150, enableCellEdit: false, cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'transaction_account', displayName: '付款账号', width: 150
                },
                {
                    name: 'lender_amount', displayName: '贷方金额', width: 150, enableCellEdit: false,  cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'amount', displayName: '可用金额', width: 150, enableCellEdit: false,  cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
            ],
        };
        $scope.subscriptionGridOptions.onRegisterApi = function (gridApi) {
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
                $scope.queryForGridChildren($scope.QUERYCHILDREN);
            });
        };
    };

    $scope.queryForGridChildren = function (data) {
        if (!$scope.queryData) {
            $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.customerGridOptions.columnDefs;
        }
        layer.load(2);

        // if ($scope.QUERYCHILDREN.insurancedmanpk!=null){
        //     data['id']=$scope.QUERYCHILDREN.insurancedmanpk.pk;
        // }
        if(null!=$scope.QUERY&&null!=$scope.QUERY.pk_corp){
            data.pk_corp=$scope.QUERY.pk_corp.pk;
        }
        $http.post($scope.basePath + 'subscriptionAudit/getClearing', {
            params: angular.toJson(data),
            page: 0,
            pageSize: 10000,
            fields: angular.toJson($scope.queryData)
        }).success(function (response) {
            if (response.code == 200) {
                if (!$scope.query) {
                    $scope.query = $scope.subscriptionGridOptions.columnDefs;
                }
                $scope.subscriptionGridOptions.data = response.clearingList;
                // $scope.subscriptionGridOptions.totalItems = response.result.Total;
            }
            layer.closeAll('loading');
        });
    };
    $scope.onQueryChildren = function () {
        $scope.queryForGridChildren($scope.QUERYCHILDREN);
    };
    $scope.onResetChildren = function () {
        $scope.QUERYCHILDREN = $scope.initQUERYChildren();
        $scope.QUERY= {};
    };
    $scope.initFunction = function () {
        /**
         * 确定
         */
        $scope.onSaveSelection = function (i) {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});
            $scope.clearingGridOptions.data=rows;
            ngDialog.close();
        };
        $scope.onCancel = function () {
            ngDialog.close();
        };
    };
    $scope.initData();
    $scope.initFunction();
    $scope.queryForGridChildren($scope.QUERYCHILDREN);
});


app.controller('clearingDetailGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
    /**
     * 初始化页面变更方法
     */
    $scope.initQUERYChildren = function () {
        return {
            // insurancedmanpk:[]
        }
    };
    $scope.customerRef =
        {
            id: $scope.$id,
            columnDefs: [
                {
                    field: 'code',
                    displayName: '客户编号'
                },
                {
                    field: 'name',
                    displayName: '客户名称'
                }
            ],
            data: ""
        };
    $scope.QUERYCHILDREN = $scope.initQUERYChildren();
    $scope.initData = function () {
        $scope.clearingDetailSelectGridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {
                    name: 'VBILLNO', displayName: '结算单号', width: 100
                },
                {
                    name: 'INSURANCEINFONO', displayName: '保单编号', width: 100
                },
                {
                    name: 'PROJECTNAME', displayName: '项目名称', width: 100
                },
                {
                    name: 'PLAN_CUSTOMER', displayName: '计划往来对象', width: 100
                },
                {
                    name: 'ACTUALCOLLECTION', displayName: '实际往来对象', width: 100
                },
                {
                    name: 'PLAN_DATE', displayName: '计划日期', width: 100
                },
                {
                    name: 'RECEIVEPERIOD', displayName: '期次', width: 100
                },
                {
                    name: 'FACT_MONEY', displayName: '结算金额', width: 100, enableCellEdit: true,  cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'AMOUNT_MONEY', displayName: '可用金额', width: 100, enableCellEdit: false,  cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
            ],
        };
        $scope.clearingDetailSelectGridOptions.onRegisterApi = function (gridApi) {
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
                $scope.queryForGridChildren($scope.QUERYCHILDREN);
            });
        };
    };

    $scope.queryForGridChildren = function (data) {
        if (!$scope.queryData) {
            $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.customerGridOptions.columnDefs;
        }
        layer.load(2);

        if(null!=$scope.clearingGridOptions.data[0]&&$scope.clearingGridOptions.data[0].reciprocal_name){
            // data.pk_customer=$scope.VO.purchaser.pk;
            data.pk_customer=$scope.clearingGridOptions.data[0].reciprocal_name.id;
        }else{
            return layer.alert("请选择到账信息!", {skin: 'layui-layer-lan', closeBtn: 1});
        }
        $http.post($scope.basePath + 'subscriptionAudit/getClearingDetail', {
            params: angular.toJson(data),
            page: 0,
            pageSize: 10000,
            fields: angular.toJson($scope.queryData)
        }).success(function (response) {
            if (response.code == 200) {
                if (!$scope.query) {
                    $scope.query = $scope.clearingDetailGridOptions.columnDefs;
                }
                $scope.clearingDetailSelectGridOptions.data = response.clearingDetail;
                // $scope.subscriptionGridOptions.totalItems = response.result.Total;
            }
            layer.closeAll('loading');
        });
    };
    $scope.onQueryChildren = function () {
        $scope.queryForGridChildren($scope.QUERYCHILDREN);
    };
    $scope.onResetChildren = function () {
        $scope.QUERYCHILDREN = $scope.initQUERYChildren();
    };
    $scope.initFunction = function () {
        /**
         * 确定
         */
        $scope.onSaveSelection = function (i) {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});
            var lockArray=new Array();
            for(var i=0;i<rows.length;i++){
                var temp=true;
                for(var j=0;j<$scope.clearingDetailGridOptions.data.length;j++){
                    if($scope.clearingDetailGridOptions.data[j].PK_CLEARING_B==rows[i].PK_CLEARING_B){
                        temp=false;
                    }
                }
                if(temp){
                    $scope.clearingDetailGridOptions.data.push(rows[i]);
                    lockArray.push(rows[i]);
                }
            }
            if($scope.clearingGridOptions.data.length>0){
                $scope.clearingGridOptions.data[0].matching_money=0;
                for(var i=0;i<$scope.clearingDetailGridOptions.data.length;i++){
                    $scope.clearingGridOptions.data[0].matching_money+=$scope.clearingDetailGridOptions.data[i].MATCHING_MONEY*1;
                }
            }
            ngDialog.close();
        };
        $scope.onCancel = function () {
            ngDialog.close();
        };
    };
    $scope.initData();
    $scope.initFunction();
    $scope.queryForGridChildren($scope.QUERYCHILDREN);
});