
app.controller('againSubscriptionCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $location) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                subscriptionno: "",
                contractDocumentno: "",
                purchaser: "",
                clearing: [],
                clearingDetail: [],
                invoicenoInfo: [],
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                billstatus: 31,
                operateDate: new Date().format("yyyy-MM-dd"),
                clearingDate: new Date().format("yyyy-MM"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                dr: 0,
                amountType: 1,
                isRelife: "Y",
                collectAdvance: 'N',
                invoiceTotalMoney: 0,
                currency : 'CNY'
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "operate_year": parseInt(new Date().format("yyyy")),
                "id": $stateParams.id,
                "isRelife": "Y"
            }
        };
        $scope.funCode = "1307";
        $scope.QUERY = $scope.initQUERY();
        $scope.t1Flag = true;
        $scope.t2Flag = true;
        $scope.t3Flag = true;
    };

    $scope.economicContractRef =
        {
            id: $scope.$id,
            columnDefs: [
                {
                    field: 'CONTRACTNUMBER',
                    displayName: '合同编号'
                },
                {
                    field: 'CONTRACTNAME',
                    displayName: '合同名称'
                }
            ],
            data: ""
        };

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
        $scope.queryAllForGrid = function (data, fun, isPrint, etype) {
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.basePath + "subscription/queryAllForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData),
                isPrint: isPrint,
                etype: 0,//0：excel 1：pdf
            })
                .success(function (response) {
                    if (fun) fun(response);
                    if (isPrint) {
                        window.open(getURL(response.queryPath));
                    } else {
                        window.open($rootScope.basePath + "uploadFile/downLoadByUrl?url=" + encodeURI(encodeURI(response.downPath)));
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
            $http.post($scope.basePath + "subscription/queryForGrid", {
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
                    $http.post($scope.basePath + "subscription/discard", {pk: $scope.pk, billdef: $scope.billdef}).success(function (response) {
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
            // $http.post($scope.basePath + "subscription/findOne", {pk: pk}).success(function (response) {
            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {pk: pk, tableName: $scope.table_name, billdef: $scope.billdef}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    // $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;

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
            $scope.VO.clearing = $scope.clearingGridOptions.data; // 到账信息
            $scope.VO.clearingDetail = $scope.clearingDetailGridOptions.data;//已选结算信息
            $scope.VO.invoicenoInfo = $scope.invoicenoGridOptions.data;//发票信息
            // $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            // for(var i=0;i<$scope.VO.payment.length;i++){
            //     $scope.VO.payment[i].noPaymentMoney = parseFloat($scope.VO.payment[i].planMoney) - parseFloat($scope.VO.payment[i].factMoney);
            // }
            if ($scope.VO.billstatus == 37) {
                $scope.VO.billstatus = 31;
            }
            layer.load(2);
            $http.post($rootScope.basePath + "subscription/save", {data: angular.toJson($scope.VO), funCode: $scope.funCode})
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

                });
        };

        //打印资金到账通知单
        $scope.onPrintSignCheckBill = function (gridApi, htmlPathCheckBill, type) {
            // $scope.raq = "signCheckBill";
            $scope.raq = type;
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $scope.VO.operateDate = $scope.VO.clearing[0].transaction_date.substr(0, 10);
            $http.post($rootScope.basePath + 'subscription/signCheckBill', {
                data: angular.toJson($scope.VO),
                raq: $scope.raq,
                type: "PDF"
            }, {responseType: 'arraybuffer'}).success(function (response) {
                var files = new Blob([response], {type: "application/pdf", filename: response.name});
                var fileURL = URL.createObjectURL(files);
                $scope.content = $sce.trustAsResourceUrl(fileURL);
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

        // 计算已选到账信息中的金额
        // 计算已选财务信息中的人民币金额
        $scope.sumMoneyCNY = function () {
            if($scope.clearingDetailGridOptions.data != null && $scope.clearingDetailGridOptions.data.length >0){
                $scope.clearingGridOptions.data[0].matching_money = 0;
                for (var i = 0; i < $scope.clearingDetailGridOptions.data.length; i++) {
                    if($scope.clearingDetailGridOptions.data[i].againRateCNY) {
                        $scope.clearingDetailGridOptions.data[i].moneyCNY = parseFloat($scope.clearingDetailGridOptions.data[i].MATCHING_MONEY) * parseFloat($scope.clearingDetailGridOptions.data[i].againRateCNY);
                    }
                    if ($scope.clearingGridOptions.data.length > 0) {
                        $scope.clearingGridOptions.data[0].matching_money += parseFloat($scope.clearingDetailGridOptions.data[i].MATCHING_MONEY) * 1;
                        if ($scope.clearingGridOptions.data[0].againRateCNY) {
                            $scope.clearingGridOptions.data[0].matching_money_cny = parseFloat($scope.clearingGridOptions.data[0].matching_money) * parseFloat($scope.clearingGridOptions.data[0].againRateCNY)
                        }
                    }
                }
                $scope.clearingGridOptions.data[0].remain_money = $scope.clearingGridOptions.data[0].amount - $scope.clearingGridOptions.data[0].matching_money;
            }
        }
        //计算发票总金额
        $scope.suminvoiceTotalMoney = function () {
            if ($scope.invoicenoGridOptions.data != null && $scope.invoicenoGridOptions.data.length > 0) {
                let sumAmount = 0;
                for (let i = 0; i < $scope.invoicenoGridOptions.data.length; i++) {
                    sumAmount = parseFloat($scope.invoicenoGridOptions.data[i].totalPriceAndTax) + sumAmount;
                }
                $scope.VO.invoiceTotalMoney = sumAmount.toFixed(2);
            } else {
                $scope.VO.invoiceTotalMoney = 0;
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
            if (item && item.id) {
                $scope.onCard(item.id);
            }

        };

        //查询银行流水
        $scope.getClearing = function (id) {
            layer.load(2);
            $scope.subscriptionGridOptions.data = new Array();
            $http.post($scope.basePath + "subscription/lockClearing", {lock: "", unlock: angular.toJson($scope.clearingGridOptions.data)}).success(function (response) {
            });
            $scope.lockClearingDetail("", angular.toJson($scope.clearingDetailGridOptions.data));
            let param = {
                actualAccountDate: $scope.VO.actualAccountDate,
                queryAmount: $scope.VO.queryAmount,
                querylenderAmount: $scope.VO.querylenderAmount,
                queryName: $scope.VO.queryName,
                id: id,
                pkorg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                acountType: $scope.VO.amountType
            }
            $http.post($scope.basePath + "subscription/getClearing",
                {
                    params: angular.toJson(param),
                }).success(function (response) {
                if (response && response.code == "200") {
                    // angular.assignData($scope.VO, response.result);
                    $scope.subscriptionGridOptions.data = response.clearingList;
                    $scope.clearingGridOptions.data = new Array();
                    $scope.clearingDetailGridOptions.data = new Array();
                    $scope.clearingDetailSelectGridOptions.data = new Array();
                    // if(null!=id&&null!=$scope.subscriptionGridOptions.gridApi.selection){
                    //     $scope.subscriptionGridOptions.gridApi.selection.selectRowByVisibleIndex(0);
                    //     $scope.$apply();
                    // }
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

        //查询结算数据
        $scope.getClearingDetail = function (data) {
            var data = {};
            $scope.lockClearingDetail("", angular.toJson($scope.clearingDetailGridOptions.data));
            $scope.clearingDetailSelectGridOptions.data = new Array();
            $scope.clearingDetailGridOptions.data = new Array();
            $scope.clearingBGridOptions.data = new Array();
            if ($scope.clearingGridOptions.data.length == 0) {
                return;
            }
            data.pk_customer = $scope.clearingGridOptions.data[0].reciprocal_name;
            //测试
            data.pk_org = $rootScope.orgVO.pk;
            data.accountType = $scope.VO.amountType;
            if (!$scope.VO.queryClearNo && !$scope.VO.queryClearAmount && !$scope.VO.queryFactName && !$scope.VO.clearingDate) {
                layer.alert("请在结算编号、金额、实际往来对象、日期中至少输入一个查询条件", {skin: 'layui-layer-lan', closeBtn: 1});
                return;
            }

            data.queryClearNo = $scope.VO.queryClearNo;
            data.queryClearAmount = $scope.VO.queryClearAmount;
            data.queryFactName = $scope.VO.queryFactName;
            data.queryDate = $scope.VO.clearingDate;
            data.isRelife = $scope.VO.isRelife;
            data.collectAdvance = $scope.VO.collectAdvance;
            data.currency = $scope.VO.currency; //币种
            layer.load(2);
            $http.post($scope.basePath + "subscription/getClearingDetail", {params: angular.toJson(data)}).success(function (response) {
                if (response && response.code == "200") {
                    $scope.clearingDetailSelectGridOptions.data = response.clearingDetail;
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
                layer.closeAll('loading');
            });
        };


        $scope.getClearingB = function (pk) {
            //     if (response && response.code == "200") {
            //         if(response.clearing) {
            //             $scope.clearingBGridOptions.data = response.clearing.clearingB;
            //         }
            //     } else {
            //         if(response){
            //             if (response.msg) {
            //                 // e.g. 字符转换为Entity Name
            //                 response.msg = response.msg.replace(/(\D{1})/g, function(matched) {
            //                     var rs = asciiChartSet_c2en[matched];
            //                     return rs == undefined ? matched : rs;
            //                 });
            //                 layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
            //             }
            //         }
            //     }
            // });
        };
    };
    $scope.initWatch = function () {

        $scope.$watch('invoicenoGridOptions.data', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.suminvoiceTotalMoney();
                $scope.sumMoneyCNY();
            }
        }, true);
        $scope.$watch('clearingDetailGridOptions.data', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.sumMoneyCNY();
            }
        }, true);
        $scope.$watch('clearingGridOptions.data', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.sumMoneyCNY();
            }
        }, true);

        $scope.$watch('invoicenoGridOptions.data[0].invoicenoDate', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                for (var i = 0; i < $scope.invoicenoGridOptions.data.length; i++) {
                    if (null == $scope.invoicenoGridOptions.data[i].invoicenoDate) {
                        $scope.invoicenoGridOptions.data[i].invoicenoDate = $scope.invoicenoGridOptions.data[0].invoicenoDate;
                    }
                }
            }
        }, true);
        $scope.$watch('VO.querylenderAmount', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.getClearing();
            }
        }, true);
        $scope.$watch('VO.queryName', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.getClearing();
            }
        }, true);
        $scope.$watch('VO.amountType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.getClearing();
            }
        }, true);


        $scope.$watch('VO.queryClearNo', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.queryClearNo && $scope.VO.queryClearNo.length > 3) {
                    $scope.getClearingDetail();
                }
            }
        }, true);
        $scope.$watch('VO.queryClearAmount', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.getClearingDetail();
            }
        }, true);
        $scope.$watch('VO.queryFactName', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.getClearingDetail();
            }
        }, true);
        $scope.$watch('VO.clearingDate', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit)
                // if(!newVal) {
                //     $scope.VO.clearingDate=new Date().format("yyyy-MM");
                //     return angular.alert("结算日期不能为空！");
                // }else {
                $scope.getClearingDetail();
            // }

        }, true);
        //当切换页面时解锁
        window.onhashchange = function () {
            if ($scope.table_name == "lr_subscription" && $scope.isEdit) {
                $http.post($scope.basePath + "subscription/lockClearing", {lock: "", unlock: angular.toJson($scope.clearingGridOptions.data)}).success(function (response) {
                });
                $scope.lockClearingDetail("", angular.toJson($scope.clearingDetailGridOptions.data));
            }
        };
        //当关闭或者刷新页面时解锁
        window.onbeforeunload = function (ev) {
            if ($scope.table_name == "lr_subscription" && $scope.isEdit) {
                $http.post($scope.basePath + "subscription/lockClearing", {lock: "", unlock: angular.toJson($scope.clearingGridOptions.data)}).success(function (response) {
                });
                $scope.lockClearingDetail("", angular.toJson($scope.clearingDetailGridOptions.data));
            }
        };
        //流水信息加锁
        $scope.$watch('clearingGridOptions.data', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if (null == oldVal[0]) {
                    //加锁
                    $http.post($scope.basePath + "subscription/lockClearing", {lock: angular.toJson(newVal), unlock: ""}).success(function (response) {
                    });
                } else if (newVal.length == 0 && oldVal.length != 0) {
                    //解锁
                    $http.post($scope.basePath + "subscription/lockClearing", {lock: "", unlock: angular.toJson(oldVal)}).success(function (response) {
                    });
                } else if (newVal[0].id != oldVal[0].id) {
                    //加锁
                    $http.post($scope.basePath + "subscription/lockClearing", {lock: angular.toJson(newVal), unlock: angular.toJson(oldVal)}).success(function (response) {
                    });
                }
                if (newVal.length > 0) {
                    $scope.VO.purchaser = newVal[0].reciprocal_name;
                }
            }
        }, true);
        //结算信息加锁
        $scope.$watch('clearingDetailGridOptions.data', function (newVal, oldVal) {
            // TODO 改这里
            if (newVal === oldVal || newVal == undefined || newVal == null || newVal.length == oldVal.length) return;
            if ($scope.isEdit) {
                if (null != oldVal && oldVal.length > 0 && newVal.length > 0) {
                    //解锁
                    $scope.lockClearingDetail(angular.toJson(newVal), angular.toJson(oldVal));
                } else if ((null == oldVal || oldVal.length == 0) && newVal.length > 0) {
                    //解锁
                    $scope.lockClearingDetail(angular.toJson(newVal), "");
                } else if (null != oldVal && oldVal.length > 0 && newVal.length == 0) {
                    //加锁
                    $scope.lockClearingDetail("", angular.toJson(oldVal));
                }
            }
        }, true);
        //币种选择
        $scope.$watch('VO.currency', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null ) return;
            if ($scope.isEdit) {
                if(newVal =='CNY'){
                    $scope.VO.amountType = 1;
                }else if(newVal =='USD') {
                    $scope.VO.amountType = 8;
                }
                $scope.getClearing();
                $scope.getClearingDetail();
            }
        }, true);
        //是否预收
        $scope.$watch('VO.collectAdvance', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.getClearingDetail();
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
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
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
        /**
         * 结算信息加解锁
         * @param lock
         * @param unlock
         */
        $scope.lockClearingDetail = function (lock, unlock) {
            if ($scope.VO.isRelife == 'Y'){
                $http.post($scope.basePath + "subscription/lockClearing", {lock: lock, unlock: unlock}).success(function (response) {});
            }else{
                $http.post($scope.basePath + "subscription/lockClearingDetail", {lock: lock, unlock: unlock}).success(function (response) {});
            }
        }
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

        $scope.onAdd = function (id) {
            $scope.form = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isUploadAnytime = false;
            $scope.isClear = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            angular.assignData($scope.VO, $scope.initVO());
            $scope.clearingGridOptions.data = [];
            $scope.clearingDetailGridOptions.data = [];
            $scope.clearingDetailSelectGridOptions.data = [];
            $scope.getClearing(id);
            // $scope.getClearingDetail();
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
            $scope.VO.insuranceman = $scope.insurancemanGridOptions.data;
            $scope.VO.payment = $scope.paymentGridOptions.data;
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
            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {pk: id, tableName: $scope.table_name, billdef: $scope.billdef}).success(function (response) {
                if (response && response.code == "200") {
                    $scope.card = true;
                    angular.assignData($scope.VO, response.result);
                    $scope.clearingGridOptions.data = $scope.VO.clearing;
                    $scope.clearingDetailGridOptions.data = $scope.VO.clearingDetail;
                    // $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    angular.assignData($scope.VO, response.result);
                    if (!response.result.taskHis)
                        $scope.mess = false;
                    else
                        $scope.mess = true;
                    $scope.isBack = true;
                    $scope.isGrid = false;
                    $scope.isCard = true;
                    $scope.upOrDown = true;

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
                        if (null != rows[i].sapCustomernCode&&0 != rows[i].sapCustomernCode) {
                            return layer.alert("已经生成SAP凭证请勿删除!", {
                                skin: 'layui-layer-lan',
                                closeBtn: 1
                            });
                        }
                        ids.push(rows[i].id);
                    }
                    layer.load(2);
                    $http.post($scope.basePath + "subscription/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
            if ($scope.isClear) {
                $scope.VO = $scope.initVO();
            }
            $scope.isDisabled = true;
            $scope.isEdit = false;
            $scope.isBack = false;
            $scope.isType = true;
            if ($scope.VO.id == null) {
                //解锁
                $http.post($scope.basePath + "subscription/lockClearing", {lock: "", unlock: angular.toJson($scope.clearingGridOptions.data)}).success(function (response) {
                });
                $scope.lockClearingDetail("", angular.toJson($scope.clearingDetailGridOptions.data));
            }
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
            $scope.isUploadAnytime = false;
            //阻止页面渲染
            $scope.form = false;
            $scope.card = false;
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
                    if ($scope.clearingGridOptions.data.length == 0) {
                        return layer.alert("请选择到账信息!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.clearingDetailGridOptions.data.length == 0) {
                        return layer.alert("请选择结算信息!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if (parseFloat($scope.clearingGridOptions.data[0].matching_money) > parseFloat($scope.clearingGridOptions.data[0].amount)) {
                        return layer.alert("已选到账信息中，“匹配金额”不能大于“可用金额”!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.clearingGridOptions.data[0].matching_money == 0) {
                        return layer.alert("已选到账信息中“匹配金额”不能为0!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    for (var i = 0; i < $scope.clearingDetailGridOptions.data.length; i++) {
                        if (parseFloat($scope.clearingDetailGridOptions.data[i].MATCHING_MONEY) > parseFloat($scope.clearingDetailGridOptions.data[i].AMOUNT_MONEY)) {
                            return layer.alert("已选结算信息“匹配金额”不能大于“可用金额”!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if (parseFloat($scope.clearingDetailGridOptions.data[i].MATCHING_MONEY) <= 0) {
                            return layer.alert("已选结算信息“匹配金额”必须大于0!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if ($scope.invoicenoGridOptions.data.length == 0) {
                        return layer.alert("发票信息不能为空!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    } else {
                        for (var i = 0; i < $scope.invoicenoGridOptions.data.length; i++) {
                            if (null == $scope.invoicenoGridOptions.data[i].invoiceno || null == $scope.invoicenoGridOptions.data[i].totalPriceAndTax) {
                                return layer.alert("发票信息中不能有空行!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
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
            if (name == "clearingGridOptions") {
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: 'view/againSubscription/againSubscriptionRef.html',
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
                        for (var i = 0; i < value.length; i++) {
                            $scope[$scope.selectTabName].data.push(value[i]);
                        }
                    }
                }, function (reason) {
                });
            } else if (name == "clearingDetailGridOptions") {
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: 'view/againSubscription/clearingDetailRef.html',
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
                        for (var i = 0; i < value.length; i++) {
                            $scope[$scope.selectTabName].data.push(value[i]);
                        }
                    }
                }, function (reason) {
                });
            } else if ("invoicenoGridOptions" == name) {
                $scope[name].data.push({
                    "serialNumber": $scope.invoicenoGridOptions.data.length + 1,
                    "invoiceno": "",
                    "invoicenoDate": "",
                    "totalPriceAndTax": 0,
                    "invoiceMoney": 0,
                    "invoicePurchaser": ($scope.clearingDetailGridOptions.data != null && $scope.clearingDetailGridOptions.data.length > 0) ? $scope.clearingDetailGridOptions.data[0].ACTUALCOLLECTION : ""
                });
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
            if (name == "clearingGridOptions") {//解锁
                $http.post($scope.basePath + "subscription/lockClearing", {lock: "", unlock: angular.toJson(delRow)}).success(function (response) {
                });
            }
            if (name == "clearingDetailGridOptions") {
                if ($scope.clearingGridOptions.data.length > 0) {
                    $scope.clearingGridOptions.data[0].matching_money = 0;
                    for (var i = 0; i < $scope.clearingDetailGridOptions.data.length; i++) {
                        $scope.clearingGridOptions.data[0].matching_money += parseFloat($scope.clearingDetailGridOptions.data[i].MATCHING_MONEY) * 1;
                    }
                    $scope.sumMoneyCNY();
                }
                //解锁
                $scope.lockClearingDetail("", angular.toJson(delRow));
            }
        };
    };

    $scope.initPage = function () {
        $scope.form = false;
        $scope.isClear = false;
        $scope.card = false;
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
                {name: 'currency', displayName: '结算币种', width: 100,},
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

        //选择流水信息表
        $scope.subscriptionGridOptions = {
            enableRowSelection: true,
            enableSelectAll: false,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: false,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {
                    name: 'reciprocal_name.name', displayName: '对方账户名称', width: 300, enableCellEdit: false
                },
                {
                    name: 'reciprocal_account_view', displayName: '对方账号', enableCellEdit: false
                },
                {
                    name: 'lender_amount', displayName: '贷方金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'amount', displayName: '可用金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'transaction_name.unitname', displayName: '交易账户名称', width: 250, enableCellEdit: false
                },
                {
                    name: 'transaction_account_view', displayName: '交易账号', enableCellEdit: false
                },
                {
                    name: 'transaction_date', displayName: '到账日期', enableCellEdit: false, cellFilter: 'date:"yyyy-MM-dd"'
                }
            ],
        };
        $scope.subscriptionGridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.subscriptionGridOptions.gridApi = gridApi;

            //添加行头
            $scope.subscriptionGridOptions.gridApi.core.addRowHeaderColumn({
                name: 'rowHeaderCol',
                displayName: '',
                width: 30,
                cellTemplate: 'ui-grid/rowNumberHeader'
            });

            $scope.subscriptionGridOptions.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                if ($scope.isEdit) {
                    //行选中事件
                    var rows = $scope.subscriptionGridOptions.gridApi.selection.getSelectedRows();
                    if (rows.length == 0) {
                        $scope.clearingGridOptions.data = rows;
                        $scope.getClearingDetail();
                    } else if (rows.length > 0) {
                        //校验是否已经有锁
                        $http.post($scope.basePath + "subscription/ifUse", {pk: rows[0].id}).success(function (response) {
                            if (response && response.code == 200) {
                                delete rows[0].$$hashKey;
                                let newVO = {};
                                angular.assignData(newVO, rows[0]);
                                $scope.clearingGridOptions.data = [];
                                newVO.remain_money = newVO.amount;
                                $scope.clearingGridOptions.data.push(newVO);
                                $scope.getClearingDetail();
                            } else {
                                if (response) {
                                    return layer.alert("该流水已经被使用！", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }
                        });
                    }
                }
            });
        };

        $scope.selectTabName = 'clearingGridOptions';
        $scope.clearingGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: false,
            enableSelectAll: false,
            multiSelect: false,
            enableSorting: true,
            enableRowHeaderSelection: false,
            // showColumnFooter: true,
            columnDefs: [
                {
                    name: 'reciprocal_name.name', displayName: '对方账户名称', enableCellEdit: false
                },
                {
                    name: 'reciprocal_account_view', displayName: '对方账号', enableCellEdit: false
                },
                {
                    name: 'lender_amount', displayName: '贷方金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'amount', displayName: '可用金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'remain_money', displayName: '剩余金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'matching_money', displayName: '匹配金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'againRateCNY', displayName: '兑人民币汇率', enableCellEdit: true, cellFilter: 'RATE_FILTER',
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
            ],
            data: $scope.VO.clearing,
            onRegisterApi: function (gridApi) {
                $scope.clearingGridOptions.gridApi = gridApi;
                //添加行头
                $scope.clearingGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
                $scope.clearingGridOptions.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                    if ($scope.isEdit) {
                        var rows = $scope.clearingGridOptions.gridApi.selection.getSelectedRows();
                        if (rows != null) {
                            if ($scope.clearingGridOptions.data.length > 0) {
                                $scope.clearingGridOptions.data[0].matching_money = 0;
                                for (var i = 0; i < $scope.clearingDetailGridOptions.data.length; i++) {
                                    $scope.clearingGridOptions.data[0].matching_money += parseFloat($scope.clearingDetailGridOptions.data[i].MATCHING_MONEY) * 1;
                                    if($scope.clearingGridOptions.data[0].againRateCNY){
                                        $scope.clearingGridOptions.data[0].matching_money_cny = parseFloat($scope.clearingGridOptions.data[i].MATCHING_MONEY) *parseFloat($scope.clearingGridOptions.data[0].againRateCNY);
                                    }
                                }
                            }
                        }
                    }

                });
            }
        };
        //选择结算信息
        $scope.clearingDetailSelectGridOptions = {
            enableRowSelection: true,
            enableSelectAll: false,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {name: 'collectAdvance', displayName: '是否预收佣金', enableCellEdit: false,cellFilter: 'SELECT_YESNO'  },
                {name: 'inoutType', displayName: '结算类型', width: 100,cellFilter: 'SELECT_ITEMTYPE'},
                {name: 'VBILLNO', displayName: '结算单号', enableCellEdit: false},
                {name: 'ACTUALCOLLECTION', displayName: '实际往来对象', enableCellEdit: false},
                // {name: 'currency', displayName: '币种', enableCellEdit: false,cellFilter:'SELECT_CURRENCY'},
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
            ],
        };
        $scope.clearingDetailSelectGridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.clearingDetailSelectGridOptions.gridApi = gridApi;

            //添加行头
            $scope.clearingDetailSelectGridOptions.gridApi.core.addRowHeaderColumn({
                name: 'rowHeaderCol',
                displayName: '',
                width: 30,
                cellTemplate: 'ui-grid/rowNumberHeader'
            });

            $scope.clearingDetailSelectGridOptions.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                //行选中事件
                if ($scope.isEdit) {
                    var rows = $scope.clearingDetailSelectGridOptions.gridApi.selection.getSelectedRows();
                    if (rows != null) {
                        $scope.clearingDetailGridOptions.data = [];
                        for (let i = 0; i < rows.length; i++) {
                            delete rows[i].$$hashKey;
                            let newVO = {};
                            angular.assignData(newVO, rows[i]);
                            $scope.clearingDetailGridOptions.data.push(newVO);
                        }
                    }
                }
            });
        };
        $scope.selectTabName = 'clearingDetailGridOptions';
        $scope.clearingDetailGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: false,//多选
            enableSorting: true,
            enableRowHeaderSelection: true,
            // showColumnFooter: true,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            columnDefs: [
                {name: 'collectAdvance', displayName: '是否预收佣金', enableCellEdit: false,cellFilter: 'SELECT_YESNO'  },
                {name: 'inoutType', displayName: '结算类型', width: 100,cellFilter: 'SELECT_ITEMTYPE'},
                {
                    name: 'VBILLNO', displayName: '结算单号', enableCellEdit: false,
                },
                {   name: 'factactualcollection.name',
                    displayName: '实际往来对象',
                    // width: 100,
                    url: 'customerClearingRefController/queryForGrid',
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'factactualcollection',
                    enableCellEdit: true},
                {
                    name: 'FACT_MONEY', displayName: '结算金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'MATCHING_MONEY', displayName: '匹配金额 *', cellFilter: 'AMOUNT_FILTER',enableCellEdit: true,
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

            ],
            data: $scope.VO.clearingDetail,
            onRegisterApi: function (gridApi) {
                $scope.clearingDetailGridOptions.gridApi = gridApi;
                //添加行头
                $scope.clearingDetailGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if (colDef.name == "MATCHING_MONEY") {
                            $scope.clearingGridOptions.data[0].matching_money = 0;
                            for (var i = 0; i < $scope.clearingDetailGridOptions.data.length; i++) {
                                $scope.clearingGridOptions.data[0].matching_money += parseFloat($scope.clearingDetailGridOptions.data[i].MATCHING_MONEY) * 1;
                            }
                        }
                        $scope.$apply();
                    });
                    $scope.clearingDetailGridOptions.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                        //行选中事件
                        var rows = $scope.clearingDetailGridOptions.gridApi.selection.getSelectedRows();
                        if (rows != null && rows.length > 0) {
                            $scope.getClearingB(rows[0].PK_CLEARING);
                        } else {
                            $scope.clearingBGridOptions.data = new Array();
                        }
                    });

                }
            }
        };

        $scope.clearingBGridOptions = {
            enableCellEditOnFocus: false,
            enableRowSelection: false,
            enableSelectAll: false,
            multiSelect: false,
            enableSorting: true,
            enableRowHeaderSelection: false,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'pkInsurancebill.code', displayName: '保单信息编号', width: 100, enableCellEdit: false,
                },
                {name: 'c0Name.name', displayName: '计划往来对象', width: 100, enableCellEdit: false},
                {
                    name: 'pkInsurancebill.projectname', displayName: '项目名称', width: 100, enableCellEdit: false,
                },
                {
                    name: 'typeMoney', displayName: '收付款类型', width: 100, enableCellEdit: false

                },
                {
                    name: 'receiveperiod', displayName: '期数', width: 100, enableCellEdit: false

                },
                {
                    name: 'typeCompany', displayName: '收付款对象类型', width: 100, enableCellEdit: false
                },
                {
                    name: 'planDate', displayName: '计划时间', width: 100, cellFilter: 'date:"yyyy-MM-dd"',
                    enableCellEdit: false
                },
                {
                    name: 'planMoney', displayName: '本次计划金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    },
                    enableCellEdit: false
                },
                {
                    name: 'factDate', displayName: '结算日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'
                    , editableCellTemplate: 'ui-grid/refDate',
                    enableCellEdit: false
                },
                {
                    name: 'factMoney', displayName: '本次结算金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    },
                    enableCellEdit: false
                },
                {
                    name: 'noPaymentMoney', displayName: '未结算金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    },
                    enableCellEdit: false

                },
                {
                    name: 'factActualcollection.name',
                    displayName: '实际往来对象',
                    width: 100,
                    url: 'customerClearingRefController/queryForGrid'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'factActualcollection'
                    ,
                    enableCellEdit: false
                },
                {
                    name: 'cAccount', displayName: '银行卡号', width: 100
                    ,
                    enableCellEdit: false

                },
                {
                    name: 'cBank', displayName: '开户银行', width: 100
                    , enableCellEdit: false
                },
                {
                    name: 'billing', displayName: '是否开发票', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                    , enableCellEdit: false
                },
                {
                    name: 'vdef1', displayName: '备注', width: 100
                    , enableCellEdit: false
                },
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                $scope.clearingBGridOptions.gridApi = gridApi;
                $scope.clearingBGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
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
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            columnDefs: [
                {
                    name: 'serialNumber', displayName: '序号', width: 200, enableCellEdit: false
                },
                {
                    name: 'invoiceno', displayName: '发票号码', width: 200, enableCellEdit: !$scope.isEdit
                },
                {
                    name: 'invoicenoDate', displayName: '开票日期', editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"', width: 200, enableCellEdit: !$scope.isEdit
                },
                {
                    name: 'totalPriceAndTax', displayName: '价税合计（元）', width: 200, cellFilter: 'AMOUNT_FILTER', enableCellEdit: !$scope.isEdit,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'invoicePurchaser', displayName: '购买方名称', width: 400, enableCellEdit: !$scope.isEdit
                    /*name: 'invoicePurchaser.name', displayName: '购买方名称', width: 400,
                   url: 'customerClearingRefController/queryForGrid', placeholder: '请选择',editableCellTemplate: 'ui-grid/refEditor',popupModelField: 'invoicePurchaser'*/
                }
            ],
            data: $scope.VO.invoicenoInfo,
            onRegisterApi: function (gridApi) {
                $scope.invoicenoGridOptions.gridApi = gridApi;

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
        if ($stateParams.id) {
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
    $scope.billdef = "IssueNotice";
    $scope.beanName = "insurance.SubscriptionServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initworkflow($scope, $http, ngDialog);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);

    //获取url中的id
    function getQueryVariable() {
        let query = window.location.href;
        let vars = query.split("&");
        let pair = vars[0].split("=");
        if (pair.length > 1) {
            return pair[1];
        }
        return null;
    }

    if (null != getQueryVariable()) {
        $scope.onAdd(getQueryVariable());
    }
});
