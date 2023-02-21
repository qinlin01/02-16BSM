/**
 * Create By zhangwj
 * Create Time 2021-11-16
 */
app.controller('agentClearingCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function () {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                clearingCode: null,
                clearingName: null,
                ifPay: 2, //默认 "否"
                ifPrint: 2, //默认 "否"
                withholding: 0,
                receiveFee: 0,
                planServiceCharge: 0,
                factServiceCharge: 0,
                insuranceAmount: 0,
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkCorp: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                createTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                dealattachmentb: [],
                agentClearingBList: [],
                planAmount: 0,
                noPayAmount: 0
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "substr(create_time,1,4)0_0eq": parseInt(new Date().format("yyyy")),
            }
        };
        $scope.funCode = "1805";
        $scope.QUERY = $scope.initQUERY();
    };


    $scope.initHttp = function () {

        $scope.getAllPaymentByChild = function (callback){
            if($scope.VO.agentClearingBList && $scope.VO.agentClearingBList.length > 0){
                for (let i = 0; i < $scope.VO.agentClearingBList.length; i++) {
                    $http.post($scope.basePath + 'agentPayment/getAllPaymentByChild', {
                        id: $scope.VO.agentClearingBList[i].pkAgentPayment.pk,
                    }).success(function (response) {
                        if (response.code == 200) {
                            $scope.VO.agentClearingBList[i].sourceBillCode = response.data.sourceBillCode;
                            $scope.VO.agentClearingBList[i].insuranceAmount = response.data.insuranceAmount;
                            $scope.VO.agentClearingBList[i].receiveFeeAmount = response.data.receiveFeeAmount;
                            $scope.VO.agentClearingBList[i].ratio = response.data.ratio;
                            $scope.VO.agentClearingBList[i].planServiceCharge = response.data.planServiceCharge;
                            $scope.VO.agentClearingBList[i].noPayServiceCharge = response.data.noPayServiceCharge;
                            $scope.VO.agentClearingBList[i].factServiceCharge = response.data.noPayServiceCharge;
                        }
                        layer.closeAll('loading');
                    });
                }
                if(callback){
                    callback();
                }
            }
        }

        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "agentClearing/queryForGrid", {
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
            $http.post($scope.basePath + "agentClearing/findOne", {id: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    $scope.VO = response.data;
                    $scope.agentClearingBGridOption.data = $scope.VO.agentClearingBList;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealattachmentb;
                    if (callback) {
                        callback();
                    }
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
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            $scope.VO.agentClearingBList = $scope.agentClearingBGridOption.data;
            $scope.VO.dealattachmentb = $scope.dealAttachmentBGridOptions.data;
            layer.load(2);
            $http({
                method: "POST",
                url: $rootScope.basePath + "agentClearing/save",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response.code == 200) {
                    $scope.VO = response.result;
                    $scope.agentClearingBGridOption.data = $scope.VO.agentClearingBList;
                    $scope.isGrid = false;
                    $scope.isCard = true;
                    $scope.isForm = false;
                    layer.closeAll('loading');
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
    };

    $scope.initFunction = function () {
        //合计子表金额
        $scope.combinedClearing = function () {
            if ($scope.agentClearingBGridOption.data != null && $scope.agentClearingBGridOption.data.length > 0) {
                let receiveFee = 0;
                let planServiceCharge = 0;
                let insuranceAmount = 0;
                let planAmount = 0;
                let noPayAmount = 0;
                for (let i = 0; i < $scope.agentClearingBGridOption.data.length; i++) {
                    //合计保费
                    insuranceAmount = parseFloat($scope.agentClearingBGridOption.data[i].insuranceAmount) + insuranceAmount;
                    //合计佣金
                    receiveFee = parseFloat($scope.agentClearingBGridOption.data[i].receiveFeeAmount) + receiveFee;
                    //合计本次结算手续费
                    planServiceCharge = parseFloat($scope.agentClearingBGridOption.data[i].factServiceCharge) + planServiceCharge;
                    //本次应结首手续费
                    planAmount = parseFloat($scope.agentClearingBGridOption.data[i].planServiceCharge) + planAmount;
                    //未结手续费
                    noPayAmount = parseFloat($scope.agentClearingBGridOption.data[i].noPayServiceCharge) + noPayAmount;
                }
                $scope.VO.receiveFee = receiveFee.toFixed(2);
                $scope.VO.insuranceAmount = insuranceAmount.toFixed(2);
                $scope.VO.planServiceCharge = planServiceCharge.toFixed(2);
                $scope.VO.factServiceCharge = ($scope.VO.planServiceCharge - $scope.VO.withholding).toFixed(2);
                //不存库展示
                $scope.VO.planAmount = planAmount.toFixed(2);
                $scope.VO.noPayAmount = noPayAmount.toFixed(2);
            }
        }
        // 查询代理人信息
        $scope.findAgentVO = function () {
            $http.post($scope.basePath + "agent/findOne", {pk: $scope.VO.pkAgent.pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    const bankNumber = response.result.bankNumber;
                    const bankName = response.result.bankName;
                    if ((!bankName||bankName==null||bankName==""||bankName=="undefined"||bankName=="null")
                        ||(!bankNumber||bankNumber==null||bankNumber==""||bankNumber=="undefined"||bankNumber=="null")){
                        layer.alert("请先在<b>【执业人员信息】</b>节点维护代理人<b>【"+response.result.agentName+"】</b>的<b>【银行卡号】</b>及<b>【开户行】</b>", {skin: 'layui-layer-lan', closeBtn: 1});
                        $scope.VO.pkAgent = null;
                    }
                } else {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        }
        //收付款弹窗
        $scope.openPaymentWindow = function () {
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/agentClearing/agentClearingBForm.html',
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
                    if (value instanceof Array) {
                        for (var i = 0; i < value.length; i++) {
                            //计划赋值给本次结算
                            value[i].factServiceCharge = value[i].noPayServiceCharge;
                            //字段转换
                            value[i].pkAgentPayment = {};
                            value[i].pkAgentPayment.pk = value[i].id;
                            value[i].id = null;
                            $scope.agentClearingBGridOption.data.push(value[i]);
                        }
                    }
                }
            }, function (reason) {

            });
        }

        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };

    };

    $scope.initWatch = function () {
        $scope.$watch('agentClearingBGridOption.data', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            $scope.combinedClearing();
        }, true)
        $scope.$watch('VO.withholding', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            $scope.combinedClearing();
        }, true)
        $scope.$watch('VO.pkAgent', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            //如果手动输入则驳回输入内容
            if($scope.VO.pkAgent == null || $scope.VO.pkAgent.pk == null){
                $scope.VO.pkAgent = null;
                return;
            }
            // 校验代理人“银行卡号”、“开户行”字段是否录入，如果未录入，需提示用户先进行数据维护；
            $scope.findAgentVO();
        }, true)
    };

    $scope.initButton = function () {

        $scope.changePay = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行操作!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            if(rows[0].billstatus != 34){
                return layer.alert("审核通过后才可以标记！", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            layer.confirm('确定标记为已支付吗？', {
                    btn: ['确定', '返回'], //按钮
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
                    $http.post($scope.basePath + "agentClearing/changePay", {id: rows[0].id}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            if (response.msg) {
                                response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                    var rs = asciiChartSet_c2en[matched];
                                    return rs == undefined ? matched : rs;
                                });
                                layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            $scope.queryForGrid($scope.QUERY);
                        }
                    });
                }
            );
        }

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };

        $scope.onAdd = function () {
            angular.assignData($scope.VO, $scope.initVO());
            $scope.isGrid = false;
            $scope.isCard = false;
            $scope.isForm = true;
        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id);
                //联查子表全部信息
                $scope.getAllPaymentByChild(function (){
                    $scope.isGrid = false;
                    $scope.isCard = false;
                    $scope.isForm = true;
                });
            }
        };

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
                $scope.findOne(rows[0].id,function (){
                    $scope.isGrid = false;
                    $scope.isCard = true;
                    $scope.isForm = false;
                });
            } else {

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
                        ids.push(rows[i].id);
                    }
                    layer.load(2);
                    $http.post($scope.basePath + "agentClearing/deleteVo", {ids: angular.toJson(ids)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response.code == 200) {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg(response.msg, {icon: 1});
                        }
                        if (response.code == 900) {
                            layer.msg(response.msg, {icon: 1});
                        }
                    });
                }
            );
        };

        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            if ($scope.VO.id && $scope.VO.id != '') {
                $scope.isGrid = false;
                $scope.isCard = true;
                $scope.isForm = false;
            } else {
                $scope.isGrid = true;
                $scope.isCard = false;
                $scope.isForm = false;
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
            $scope.isForm = false;
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
                    if ($scope.agentClearingBGridOption.data == null || $scope.agentClearingBGridOption.data.length <= 0) {
                        return layer.alert("手续费结算清单不可以为空！",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    } else {
                        for (let i = 0; i < $scope.agentClearingBGridOption.data.length; i++) {
                            let nopay = parseFloat($scope.agentClearingBGridOption.data[i].noPayServiceCharge).toFixed(2);
                            let fact = parseFloat($scope.agentClearingBGridOption.data[i].factServiceCharge).toFixed(2);
                            if (parseFloat(nopay) < parseFloat(fact)) {
                                return layer.alert("本次结算金额不可以大于未结手续费金额！",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                    }

                    $scope.onSaveVO();
                }
            }, true);
        };

        $scope.onReset = function () {
            $scope.QUERY = $scope.initQUERY();
            $scope.QUERY.id = null;
        };


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
                    //  第一次初始化成null，后台没值，应该【】
                    if ($scope.dealAttachmentBGridOptions.data) {
                        angular.forEach(value, function (item) {
                            item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
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

        $scope.onDownLoads = function () {
            let rows = $scope.VO.dealattachmentb;
            if (!rows || rows.length <= 0) return angular.alert("没有附件信息！");
            let ids = [];
            for (let i = 0; i < rows.length; i++) {
                ids.push(rows[i].pk_project_id);
            }
            let exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };

        /**
         * 子表新增
         */
        $scope.onAddLine = function (selectTabName) {
            let data = {};
            if ('agentClearingBGridOption' == selectTabName) {
                if ($scope.VO.pkAgent && $scope.VO.pkAgent.name != null && $scope.VO.pkAgent.name != '') {
                    $scope.openPaymentWindow();
                } else {
                    return layer.alert('请先选择代理人', {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
            } else {
                $scope[selectTabName].data.push(data);
            }
        }

        /**
         * 子表删除
         */
        $scope.onDeleteLine = function (selectTabName) {
            let delRow = $scope[selectTabName].gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });

            for (let i = 0; i < $scope[selectTabName].data.length; i++) {
                for (let j = 0; j < delRow.length; j++) {
                    if ($scope[selectTabName].data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope[selectTabName].data.splice(i, 1);
                    }
                }
            }
        };
        $scope.onPrint = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行打印!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            if (rows[0].billstatus != 34) {
                return layer.alert("审核通过后才可以打印！", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            // if (rows[0].ifPay == 1) {
            //     return layer.alert("标记为已支付后不可以进行打印！", {
            //         skin: 'layui-layer-lan',
            //         closeBtn: 1
            //     });
            // }
            if (rows[0].ifPrint == 1) {
                layer.confirm('当前结算单已打印过结算清单，是否确认重新打印？', {
                        btn: ['确定', '取消'], //按钮
                        btn2: function (index, layero) {

                        },
                        shade: 0.6,//遮罩透明度
                        shadeClose: true,//点击遮罩关闭层
                    },
                    function () {
                        layer.load(2);
                        id = rows[0].id;
                        $http.post($scope.basePath + "agentClearing/print", {id: id}).success(function (response) {
                            layer.closeAll('loading');
                            if (response.code == 200) {
                                window.open(getURL(response.queryPath));
                            }
                        });
                        layer.closeAll('dialog');
                    }
                );
            }else{
                layer.load(2);
                id = rows[0].id;
                $http.post($scope.basePath + "agentClearing/print", {id: id}).success(function (response) {
                    layer.closeAll('loading');
                    if (response.code == 200) {
                        window.open(getURL(response.queryPath));
                    }
                });
            }
        };
    };

    $scope.initPage = function () {
        //列表界面
        $scope.isGrid = true;
        //卡片界面
        $scope.isCard = false;
        //编辑界面
        $scope.isForm = false;
        //列表界面子表是否显示
        $scope.chilbTable = false;
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
            exporterMenuCsv: true,
            showGridFooter: true,
            showColumnFooter: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '手续费结算.csv',
            columnDefs: [
                {name: 'clearingCode', displayName: '手续费结算信息编号'},
                {name: 'clearingName', displayName: '结算单名称'},
                {name: 'pkAgent.name', displayName: '代理人名称'},
                {name: 'insuranceAmount', displayName: '保费含税总金额（元）', cellFilter: 'AMOUNT_FILTER'},
                {name: 'receiveFee', displayName: '佣金含税金额（元）', cellFilter: 'AMOUNT_FILTER'},
                {name: 'planServiceCharge', displayName: '应结手续费总金额（元）', cellFilter: 'AMOUNT_FILTER'},
                {name: 'withholding', displayName: '代扣款项合计（元）', cellFilter: 'AMOUNT_FILTER'},
                {name: 'factServiceCharge', displayName: '手续费实付总金额（元）', cellFilter: 'AMOUNT_FILTER'},
                {name: 'ifPay', displayName: '是否标记为已结算', cellFilter: 'SELECT_YESNONUMNEW'},
                {name: 'ifPrint', displayName: '是否打印结算清单', cellFilter: 'SELECT_YESNONUMNEW'},
                {name: 'billstatus', displayName: '单据状态', cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人'},
                {name: 'createTime', displayName: '制单日期', cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'pkOrg.name', displayName: '业务单位'},
                {name: 'pkDept.name', displayName: '部门'},
                {name: 'pkChecker.name', displayName: '审核人'},
                {name: 'checkDate', displayName: '审核日期'},
                {name: 'pkAuditor.name', displayName: '最终审核人'},
                {name: 'auditDate', displayName: '最终审核日期'},
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
                    $scope.VO = row.entity;
                    $scope.findOne($scope.VO.id);
                } else {
                    $scope.chilbTable = false;
                    $scope.VO = $scope.initVO();
                }
            });


        };

        //手续费子表
        $scope.agentClearingBGridOption = {
            enableCellEditOnFocus: false,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,//不显示选中框
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '手续费模板子表.csv',
            columnDefs: [
                {name: 'pkInsurancebill.insuranceinfono', displayName: '保/批单信息编号', width: 100,},
                {name: 'sourceBillCode', displayName: '保单号/批单号', enableCellEdit: false},
                {name: 'pkInsurance.name', displayName: '险种', enableCellEdit: false},
                {name: 'stages', displayName: '期数', enableCellEdit: false},
                {name: 'insuranceAmount', displayName: '保费（含税）', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER'},
                {name: 'receiveFeeAmount', displayName: '佣金（含税）', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER'},
                {name: 'ratio', displayName: '手续费比例（％）', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER'},
                {
                    name: 'planServiceCharge',
                    displayName: '应结手续费（含税）',
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'noPayServiceCharge',
                    displayName: '未结手续费金额（含税）',
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'factServiceCharge',
                    displayName: '本次结算手续费金额（含税）',
                    enableCellEdit: true,
                    cellFilter: 'AMOUNT_FILTER'
                },
            ],
            data: $scope.VO.agentClearingBList,
            onRegisterApi: function (gridApi) {
                $scope.agentClearingBGridOption.gridApi = gridApi;
                $scope.agentClearingBGridOption.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                    //修改本次结算金额
                    if ('factServiceCharge' == colDef.name) {
                        $scope.combinedClearing();
                    }
                });

                $scope.agentClearingBGridOption.gridApi.selection.on.rowSelectionChanged(
                    $scope, function (row, event) {

                    });
            }
        };


        //附件
        $scope.dealAttachmentBGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},
                {
                    name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                },
                {
                    name: 'pk_project_id',
                    displayName: ' ',
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ng-click="grid.appScope.onPreviewFile(row.entity.pk_project_id,row.entity.attachment_name)" class="btn btn-transparent btn-xs tooltips" tooltip-placement="top">在线预览&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i></a></div>'
                }
            ],
            data: $scope.VO.dealattachmentb,
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
        }

    };

    //实体类审批流配置
    $scope.ifEntity = "true";
    $scope.entityVO = "lr.insurance.vo.AgentClearingVO";
    $scope.funCode = '1805';
    $scope.table_name = "t_agent_clearing";
    $scope.billdef = "AgentClearing";
    $scope.beanName = "agentClearingService";
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

app.controller('agentClearingBCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
    /**
     * 初始化页面变更方法
     */
    $scope.initQUERYChildren = function () {
        return {
            pkAgent: $scope.$parent.VO.pkAgent,
        }
    };
    $scope.QUERYCHILDREN = $scope.initQUERYChildren();

    $scope.initData = function () {
        $scope.clearingBGridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            useExternalPagination: true,
            columnDefs: [
                {name: 'pkInsurancebill.insuranceinfono', displayName: '保/批单信息编号', width: 100,},
                {name: 'sourceBillCode', displayName: '保/批单号', width: 100,},
                {name: 'pkAgent.name', displayName: '代理人名称', width: 100,},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkInsurance.name', displayName: '险种', width: 100,},
                {name: 'stages', displayName: '期数', width: 100,},
                {
                    name: 'planServiceCharge', displayName: '应结算手续费金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'factServiceCharge', displayName: '已结算手续费金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'noPayServiceCharge', displayName: '未结算手续费金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'vsettlebillnos', displayName: '结算单号', width: 100,},
                // {name: 'factDate', displayName: '结算日期', width: 100,}
            ],
            data: $scope.VO.reportChildren
        };
        $scope.clearingBGridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;

            //添加行头
            $scope.gridApi.core.addRowHeaderColumn({
                name: 'rowHeaderCol',
                displayName: '',
                width: 30,
                cellTemplate: 'ui-grid/rowNumberHeader'
            });

            if (null != gridApi.pagination) {
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    $scope.gridApi.page = newPage;
                    $scope.gridApi.pageSize = pageSize;
                    $scope.queryForGridChildren($scope.QUERYCHILDREN);
                });
            }
        };
    };


    $scope.queryForGridChildren = function (data) {
        if (!$scope.queryData) {
            $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.clearingBGridOptions.columnDefs;
        }
        layer.load(2);
        $http.post($scope.basePath + 'agentPayment/queryForClearing', {
            data: angular.toJson(data),
            page: $scope.gridApi ? $scope.gridApi.page : $scope.clearingBGridOptions.page,
            pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.clearingBGridOptions.pageSize,
            fields: angular.toJson($scope.queryData)
        }).success(function (response) {
            if (response.code == 200) {
                if (!$scope.query) {
                    $scope.query = $scope.clearingBGridOptions.columnDefs;
                }
                $scope.clearingBGridOptions.data = response.data;
                $scope.clearingBGridOptions.totalItems = response.data.length;
            }
            layer.closeAll('loading');
        });
    };
    $scope.onQueryChildren = function () {
        $scope.queryForGridChildren($scope.QUERYCHILDREN, $scope.queryPath);
    };
    $scope.onResetChildren = function () {
        $scope.QUERYCHILDREN = $scope.initQUERYChildren();
    };

    $scope.initFunction = function () {

        /**
         * 保存
         */
        $scope.onSave = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});
            $scope.$parent.confirm(rows);
            ngDialog.close();
        };

        $scope.onCancel = function () {
            ngDialog.close($scope.ngDialogId);
        };


    };
    $scope.initData();
    $scope.initFunction();
});
