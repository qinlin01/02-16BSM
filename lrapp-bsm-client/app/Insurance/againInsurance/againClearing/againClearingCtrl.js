/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('againClearingCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                clearingB: [],
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkCorp: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                sapCustomernCode: 0,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                remainingAmount: 0,
                pkBilltype: '_9',
                billstatus: 31,
                currency: 'CNY',
                collectAdvance: 'N',
                aganinRateUSD: 1.0000,
                againRateCNY: 1.0000,
                dr: 0,
                voperatorid: $rootScope.userVO,
                vbillstatus: 0,
                billstatus: $rootScope.SELECT.BILLSTATUS[30].id,
                costscale: [],
                economicContract: '',
                coomedium: [],
                factActualcollection: '',
                sumReceivemount: 0,
                sumPaymount: 0,
                settlementAmount: 0,
                sumReceivefeemount: 0,
                sumReceivemountOld: 0,
                sumPaymountOld: 0,
                sumReceivefeemountOld: 0,
                bankFlow: [],
                isRelife: "Y"
            };
        };
        $scope.entityVO = 'nc.vo.busi.ClearingVO';
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.funCode = '1304';
        //子表已选择数据主键
        $scope.childrenId = [];
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "operate_year": parseInt(new Date().format("yyyy")),
                "id": $stateParams.id,
                "dr": 0,
                "isRelife": "Y",
            }
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
        $scope.QUERY = $scope.initQUERY();
        $scope.param = {
            pkOrg: $rootScope.pkOrg
        };
    };

    $scope.initQUERYChildren = function () {
        return {
            'id^notin': $scope.childrenId,
            inoutType: $scope.$parent.VO.inoutType
        }
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
                    angular.forEach(value, function (item) {
                        $scope.dealAttachmentBGridOptions.data.push(item);
                    });
                }


            }
        }, function (reason) {

        });
    };

    $scope.onDownLoads = function () {
        let rows = $scope.VO.dealAttachmentB;
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
    $scope.initHttp = function () {
        $scope.getClearing = function (id) {
            $http.post($scope.basePath + "subscription/lockClearing", {
                lock: "",
                unlock: angular.toJson($scope.clearingGridOptions.data)
            }).success(function (response) {
            });
            let param = {
                actualAccountDate: $scope.VO.actualAccountDate,
                queryAmount: $scope.VO.queryAmount,
                querylenderAmount: $scope.VO.querylenderAmount,
                queryName: $scope.VO.queryName,
                id: id,
                pkorg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                acountType: "2,5"
            }
            if ($scope.VO.currency=='CNY'){
                param.acountType = '2,5'
            }else{
                param.acountType = '8'
            }
            $http.post($scope.basePath + "subscription/getClearing",
                {
                    params: angular.toJson(param)
                }).success(function (response) {
                if (response && response.code == "200") {
                    // angular.assignData($scope.VO, response.result);
                    $scope.subscriptionGridOptions.data = response.clearingList;
                    if ($scope.clearingGridOptions.data.length == 0) {
                        $scope.clearingGridOptions.data = new Array();
                    }
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
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */

        $scope.onImportUploads = function (type) {
            if (type) {
                $("#inputFile").click();
            } else {
                var file = document.getElementById("inputFile").files[0];
                if (file != null) {
                    layer.load(2);
                    var form = new FormData();
                    form.append('file', file);
                    form.append('data',angular.toJson($scope.VO))
                    $http({
                        method: 'POST',
                        url: $scope.basePath + 'clearing/bulkClearing',
                        data: form,
                        headers: {'Content-Type': undefined, 'x-auth-token': window.sessionStorage.getItem("token")},
                        transformRequest: angular.identity
                    }).success(function (data) {
                        if (data.code == 200) {
                            //解决不能二次上传的问题
                            var obj = document.getElementById('inputFile');
                            obj.outerHTML = obj.outerHTML;
                            //处理返回的数据
                            layer.alert(data.msg, {skin: 'layui-layer-lan',closeBtn: 1});
                            angular.assignData($scope.VO, data.data);
                            $scope.clearingBGridOptions.data = $scope.VO.clearingB;
                        }
                    }).error(function (data) {
                        console.log(data.code);
                        layer.alert(data.msg, {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                    })
                }

            }
        };

        $scope.queryAllForGrid = function (data) {
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.basePath + "againClearing/queryAllForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            })
                .success(function (response) {
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
            $http.post($scope.basePath + "againClearing/queryForGrid", {
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
        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "againClearing/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    if (callback) {
                        callback();
                    }
                    angular.assignData($scope.VO, response.result);
                    $scope.clearingBGridOptions.data = $scope.VO.clearingB;
                    // var array = $scope.clearingBGridOptions.data;
                    // $scope.tableStatus(array);
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
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO.bankFlow = $scope.clearingGridOptions.data;
            if ($scope.VO.inoutType==2||$scope.VO.inoutType==3){
                for (var i = 0; i < $scope.clearingBGridOptions.data.length; i++) {
                    $scope.clearingBGridOptions.data[i].cAccount = $scope.VO.accNum;
                    $scope.clearingBGridOptions.data[i].cBank = $scope.VO.accBlank;
                }
            }
            $http.post($rootScope.basePath + "againClearing/save", {data: angular.toJson($scope.VO), funCode: $scope.funCode})
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

    $scope.findFactName = function (pks) {
        $http.post($scope.basePath + "customerClearingRefController/findOne", {pk: pks}).success(function (response) {
            if (response && response.code == "200") {
                if (response.result) {
                    // 同时更新结算子表
                    let array = $scope.VO.clearingB;
                    $scope.VO.accBlank = response.result.accBlank;
                    $scope.VO.accNum = response.result.accNum;
                    $scope.VO.factActualcollection = response.result;
                    $scope.VO.c1Institution = response.result.c1Institution;
                    $scope.VO.c_1_phone = response.result.c_1_phone;
                    $scope.VO.c_0_address = response.result.c_0_address;
                    for (let i = 0; i < array.length; i++) {
                        if (array[i].factActualcollection == null || array[i].factActualcollection == "") {
                            array[i].factActualcollection = response.result;
                        } else {
                            array[i].factActualcollection.name = response.result.name;
                            array[i].factActualcollection.c1Institution = response.result.c1Institution;
                            array[i].factActualcollection.c_1_phone = response.result.c_1_phone;
                            array[i].factActualcollection.c_0_address = response.result.c_0_address;
                        }
                        array[i].cBank = response.result.accBlank;
                        array[i].cAccount = response.result.accNum;
                    }
                }
            }
        });
    };


    $scope.initWatch = function () {

        $scope.$watch('VO.actualAccountDate', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.getClearing();
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
        $scope.$watch('VO.currency', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO.clearingB = [];
                $scope.clearingBGridOptions.data = $scope.VO.clearingB;
                $scope.getClearing();
                //币种调整就初始化汇率
                $scope.VO.aganinRateUSD = 1.0000;
                $scope.VO.againRateCNY = 1.0000;
            }
        }, true);
        $scope.$watch('VO.inoutType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO.clearingB = [];
                $scope.clearingBGridOptions.data = $scope.VO.clearingB;
                // $scope.childTableValueChanged();
                $scope.getClearing();
                //结算类型改变就初始化汇率
                $scope.VO.aganinRateUSD = 1.0000;
                $scope.VO.againRateCNY = 1.0000;
            }
        }, true);
        // 付款单位名称
        $scope.$watch('VO.factActualcollection.name', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                let pks = $scope.VO.factActualcollection.pk;
                if (pks != null) {
                    $scope.findFactName(pks);
                }
            }
        });

        //银行卡号 长度50位 cAccount
        $scope.$watch('VO.accNum', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                let array = $scope.VO.clearingB;
                for (let i = 0; i < array.length; i++) {
                    array[i].cAccount = newVal;
                }
            }
        });

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

        // 开户银行 cBank
        $scope.$watch('VO.accBlank', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                let array = $scope.VO.clearingB;
                for (let i = 0; i < array.length; i++) {
                    array[i].cBank = newVal;
                }
            }
        });
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
         * 一键自动批单
         */
        $scope.onAddBulk = function (){

        };

        $scope.onEndorsement = function (noPaymentMoney, pkClearingB, pk_insurancebill) {
            if (!$scope.isGrid && $scope.isEdit) {
                return layer.msg("保存之后才能点击一键自动批单！", {
                    shift: 6,
                    icon: 11
                });
            }
            if (!noPaymentMoney) {
                noPaymentMoney = parseFloat(0);
            }
            $http.post($rootScope.basePath + "againClearing/endorsement", {pk: $scope.VO.id, noPaymentMoney: noPaymentMoney, pkClearingB: pkClearingB, pk_insurancebill: pk_insurancebill})
                .success(function (response) {
                    if (response.code == 200) {
                        if (response) {
                            if (response.msg) {
                                // e.g. 字符转换为Entity Name
                                response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                    var rs = asciiChartSet_c2en[matched];
                                    return rs == undefined ? matched : rs;
                                });
                                layer.msg(response.msg, {shift: 6, icon: 11});
                            }
                        }
                        // layer.msg(response.msg, {shift: 6, icon: 11});
                    }
                });
        }


        /**
         * 作废按钮
         */
        $scope.onInvalid = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            layer.confirm('请确认是否要作废此条数据？', {
                    btn: ['是', '否'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消操作!', {
                            shift: 6,
                            icon: 1
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    $http.post($rootScope.basePath + "againClearing/invalid", {pk: rows[0].id})
                        .success(function (response) {
                            if (response.code == 200) {
                                layer.msg('作废成功!', {
                                    shift: 6,
                                    icon: 1
                                });
                            } else {
                                layer.msg('操作失败!', {
                                    shift: 6,
                                    icon: 11
                                });
                            }
                        });
                }
            );
        }

        /**
         * 控制作废按钮
         */
        $scope.isInvalid = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (rows && rows.length == 1) {
                if (rows[0].sapVoucherStatus != null && ($rootScope.SELECT.SAPTYPE[2].id != rows[0].sapVoucherStatus) && 34 == row[0].billstatus) {
                    return true;
                } else {
                    return false;
                }
            }
            return true;
        }


        /**
         * 关闭收付款
         */
        $scope.onClosePayment = function () {
            $scope.form = true;
            $scope.initView();
            $scope.queryPath = 'queryForGridByClose';
            $scope.childrenId = [];
            $scope.onAddLine(function () {
            });

        }

        /**
         * 开启收付款
         */
        $scope.onOpenPayment = function () {
            $scope.form = true;
            $scope.initView();
            $scope.queryPath = 'queryForGridByOpen';
            $scope.childrenId = [];
            angular.assignData($scope.VO, $scope.initVO());
            $scope.onAddLine(function () {
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
            $scope.childrenId = [];
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

        $scope.audit = function () {
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
            $scope.form = true;
            $scope.isClear = true;
            $scope.initView();
            $scope.queryPath = 'queryForGrid';
            $scope.childrenId = [];
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;

        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            $scope.queryPath = 'queryForGrid';
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
            if (data) {
                var tablename = $scope.table_name;
                data.isRelife = "Y";
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

            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {
                pk: id,
                tableName: $scope.table_name,
                billdef: $scope.billdef
            }).success(function (response) {
                if (response && response.code == "200") {
                    $scope.card = true;
                    angular.assignData($scope.VO, response.result);
                    $scope.clearingBGridOptions.data = $scope.VO.clearingB;
                    if (!response.result.taskHis)
                        $scope.mess = false;
                    else
                        $scope.mess = true;
                    $scope.isBack = true;
                    $scope.isGrid = false;
                    $scope.isCard = true;

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
                        ids.push(rows[i].id);
                    }
                    layer.load(2);
                    $http.post($scope.basePath + "againClearing/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
            $scope.clearingBGridOptions.data = [];
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
         * 保存判断必输项
         */
        $scope.onSave = function () {
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    var sum = 0;
                    if ($scope.clearingBGridOptions.data.length != 0) {
                        for (var i = 0; i < $scope.clearingBGridOptions.data.length; i++) {
                            if (($scope.clearingBGridOptions.data[i].typeMoney == "应收佣金" || $scope.clearingBGridOptions.data[i].typeMoney == "应收咨询费" || $scope.clearingBGridOptions.data[i].typeMoney == "应收公估费") && $scope.VO.factActualcollection.name == null && $scope.VO.factActualcollection.name == "") {
                                return layer.alert("请选择付款单位名称!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (!($scope.clearingBGridOptions.data[i].typeMoney == "应收保费") && $scope.VO.accNum != null && $scope.VO.accNum.length > 50) {
                                return layer.alert("银行卡号不能超过50位!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (!$scope.clearingBGridOptions.data[i].c0Name) {
                                return layer.alert("计划来往对象不能为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                    }
                    if ($scope.VO.billstatus == 37) {
                        $scope.VO.billstatus = 31;
                    }
                    if ($scope.dealAttachmentBGridOptions.data.length == 0) {
                        return layer.alert("请上传附件！",
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
        $scope.getGridTemplate = function () {
            return 'view/againClearing/againClearingBForm.html';
            // }
        };

        /**
         * 子表新增
         */
        $scope.onAddLine = function (callback) {
            if($scope.VO.inoutType == null || $scope.VO.inoutType == ''){
                return layer.alert('请选择收付款类型！', {skin: 'layui-layer-lan',closeBtn: 1});
            }
            // angular.assignData($scope.VO, $scope.initVO());
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: $scope.getGridTemplate(),
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
                        $http.post($rootScope.basePath + "againClearing/addPanment", {data: angular.toJson(value), voList: angular.toJson($scope.VO)})
                            .success(function (response) {
                                if (response) {
                                    angular.assignData($scope.VO, response.result);
                                    $scope.clearingBGridOptions.data = response.result.clearingB;
                                    //start @zhangwj 2022-10-26 处理字段，方便财务审核
                                    for (let i = 0; i < $scope.clearingBGridOptions.data.length; i++) {
                                        $scope.clearingBGridOptions.data[i].pkInsurancebill.code = $scope.clearingBGridOptions.data[i].pkInsurancebill.insuranceno;
                                    }
                                    //end
                                    $scope.childTableValueChanged();
                                }
                            });
                    } else {
                        $scope[$scope.selectTabName].data.push(value);
                    }
                    if (callback) {
                        callback();
                    }
                }
            }, function (reason) {

            });
        };
        /**
         * 子表删除
         */
        $scope.onDeleteLine = function (grid) {
            var delRow = $scope[grid].gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (var i = 0; i < $scope[grid].data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope[grid].data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope[grid].data.splice(i, 1);
                    }
                }
            }
            for (var i = 0; i < $scope.childrenId.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope.childrenId.indexOf(delRow[j].childId) != -1) {
                        $scope.childrenId.splice(i, 1);
                    }
                }
            }
            if (grid=='clearingBGridOptions'){
                $scope.VO.clearingB = $scope.clearingBGridOptions.data;
                $scope.childTableValueChanged();
            }
        };
        $scope.childTableValueChanged = function () {
            if (!($scope.VO.aganinRateUSD && Number.parseFloat($scope.VO.aganinRateUSD) > 0)) {
                $scope.VO.aganinRateUSD = 1;
                return;
            }
            if (!($scope.VO.againRateCNY && Number.parseFloat($scope.VO.againRateCNY) > 0)) {
                $scope.VO.againRateCNY = 1;
                return;
            }
            // if ($scope.VO.currency == 'CNY' || $scope.VO.currency == 'USD' || ($scope.VO.inoutType == 3 && $scope.VO.currency != 'CNY' && $scope.VO.replace == 'N')) {
            //     $scope.VO.aganinRate = 1;
            // }
            $http.post($rootScope.basePath + "againClearing/childTableValueChanged", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    if (response) {
                        // 人民币
                        $scope.VO.sumReceivemount = response.result.sumReceivemount;
                        $scope.VO.sumPaymount = response.result.sumPaymount;
                        $scope.VO.sumReceivefeemount = response.result.sumReceivefeemount;
                        // 原币
                        $scope.VO.sumReceivemountOld = response.result.sumReceivemountOld;
                        $scope.VO.sumPaymountOld = response.result.sumPaymountOld;
                        $scope.VO.sumReceivefeemountOld = response.result.sumReceivefeemountOld;
                        // 美元
                        $scope.VO.sumReceivemountUSD = response.result.sumReceivemountUSD;
                        $scope.VO.sumPaymountUSD = response.result.sumPaymountUSD;
                        $scope.VO.sumReceivefeemountUSD = response.result.sumReceivefeemountUSD;

                        $scope.VO.sumConsult = response.result.sumConsult;
                        $scope.VO.sumEvaluationfee = response.result.sumEvaluationfee;
                        $scope.clearingBGridOptions.data = response.result.clearingB;
                        $scope.VO.matching_money = Number.parseFloat('0').toFixed(2);
                        for (var j = 0; j < $scope.clearingBGridOptions.data.length; j++) {
                            $scope.VO.matching_money = (Number.parseFloat($scope.VO.matching_money) + Number.parseFloat($scope.clearingBGridOptions.data[j].factMoneyNow)).toFixed(2);
                        }
                    }
                });
        }
        $scope.onDownLoadsCard = function (id) {
            let ids = [];
            ids.push(id);
            let exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };
        /**
         * 打印报表--代收客户保险费上划通知书
         */
        $scope.onPrintDaiDn = function () {
            $scope.raq = "daiShouUp";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);

            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/againClearing/printReportChoose.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                preCloseCallback: function (value) {
                    // $scope.queryForGrid();
                    //layer.load(2);
                    return true;
                }
            }).then(function (value) {
                if (value != null) {
                    layer.load(2);
                }

            }, function (reason) {

            });

        };

        /**
         * 打印报表--代收客户保险费下划通知书
         */
        $scope.onPrintDaiUp = function () {
            $scope.raq = "daiShouDn";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/againClearing/printReportChoose.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                preCloseCallback: function (value) {
                    // $scope.queryForGrid();
                    //layer.load(2);
                    return true;
                }
            }).then(function (value) {
                if (value != null) {
                    layer.load(2);
                }

            }, function (reason) {

            });

        };

        /**
         * 打印报表--自行解付代收客户保费申请书
         */
        $scope.onPrintJieFu = function () {
            $scope.raq = "jieFu";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/againClearing/printReportChoose.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                preCloseCallback: function (value) {
                    // $scope.queryForGrid();
                    //layer.load(2);
                    return true;
                }
            }).then(function (value) {
                if (value != null) {
                    layer.load(2);
                }

            }, function (reason) {

            });

        };

        /**
         * 打印报表--代收通知书（分公司）
         */
        $scope.onPrintDaiS = function () {
            $scope.raq = "daiShouAgain";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/againClearing/printReportChoose.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                preCloseCallback: function (value) {
                    // $scope.queryForGrid();
                    //layer.load(2);
                    return true;
                }
            }).then(function (value) {
                if (value != null) {
                    layer.load(2);
                }

            }, function (reason) {

            });

        };

        /**
         * 打印报表--代付通知书（分公司）
         */
        $scope.onPrintDaiF = function () {
            $scope.raq = "daiFuAgain";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/againClearing/printReportChoose.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                preCloseCallback: function (value) {
                    // $scope.queryForGrid();
                    // layer.load(2);
                    return true;
                }
            }).then(function (value) {
                if (value != null) {
                    layer.load(2);
                }

            }, function (reason) {

            });

        };

        /**
         * 打印报表--业务收入确认书
         */
        $scope.onPrintYeWu = function () {
            $scope.raq = "yeWuAgain";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $http.post($rootScope.basePath + "againClearing/Print", {data: angular.toJson($scope.VO), raq: $scope.raq, type: "PDF"}).success(function (response) {
                layer.closeAll('loading');
                if (response.code == 200) {
                    window.open(getURL(response.queryPath));
                }
            });

        };

        /**
         * 打印报表--发票开具申请书
         */
        $scope.onPrintFaPiao = function () {
            $scope.raq = "fapiao";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/againClearing/printReportChoose.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                preCloseCallback: function (value) {
                    // $scope.queryForGrid();
                    // layer.load(2);
                    return true;
                }
            }).then(function (value) {
                if (value != null) {
                    layer.load(2);
                }

            }, function (reason) {

            });

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
                {
                    name: 'file_type',
                    displayName: '附件类型',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_CLEARINGDOUCUMENTTYPE',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.CLEARINGDOUCUMENTTYPE
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

        //选择流水信息表
        $scope.subscriptionGridOptions = {
            enableRowSelection: true,
            enableSelectAll: false,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {name: 'reciprocal_name.name', displayName: '对方账户名称', width: 300, enableCellEdit: false},
                {name: 'reciprocal_account_view', displayName: '对方账号', enableCellEdit: false},
                {name: 'account_type_name', displayName: '账户类型', enableCellEdit: false},
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
                {name: 'transaction_name.unitname', displayName: '交易账户名称', width: 250, enableCellEdit: false},
                {name: 'transaction_account_view', displayName: '交易账号', enableCellEdit: false},
                {name: 'transaction_date', displayName: '到账日期', enableCellEdit: false, cellFilter: 'date:"yyyy-MM-dd"'}
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
                        // $scope.VO.amount_money = Number.parseFloat('0').toFixed(2);
                    } else if (rows.length > 0) {
                        //校验是否已经有锁
                        $http.post($scope.basePath + "subscription/ifUse", {pk: rows[0].id}).success(function (response) {
                            if (response && response.code == 200) {
                                $scope.clearingGridOptions.data = angular.copy(rows);
                                $scope.VO.bankFlow = $scope.clearingGridOptions.data;
                                $scope.VO.matching_money = Number.parseFloat('0').toFixed(2);
                                for (var j = 0; j < $scope.clearingBGridOptions.data.length; j++) {
                                    $scope.VO.matching_money = (Number.parseFloat($scope.VO.matching_money) + Number.parseFloat($scope.clearingBGridOptions.data[j].factMoneyNow)).toFixed(2);
                                }
                                for (var i = 0; i < $scope.clearingGridOptions.data.length; i++) {
                                    let settlementAmounts = $scope.clearingGridOptions.data[i].settlementAmounts;
                                    settlementAmounts = settlementAmounts ?  Number.parseFloat(settlementAmounts) : Number.parseFloat('0').toFixed(2);
                                    $scope.clearingGridOptions.data[i].lender_amount = $scope.clearingGridOptions.data[i].amount;
                                    $scope.clearingGridOptions.data[i].remaining_amount = Number.parseFloat($scope.clearingGridOptions.data[i].lender_amount)-Number.parseFloat(settlementAmounts);
                                }
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
        $scope.gridOptions = {
            rowTemplate: "<div ng-dblclick=\"grid.appScope.onRowDblClick(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>",
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            showGridFooter: true,
            showColumnFooter: true,
            useExternalPagination: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '财务结算.csv',
            columnDefs: [
                {name: 'vbillno', displayName: '业务结算编号', width: 100,footerCellTemplate: '<div class="ui-grid-cell-contents">合计</div>'},

                {name: 'inoutType', displayName: '结算类型', width: 100,cellFilter: 'SELECT_ITEMTYPE'},
                {
                    name: 'sum_receivemount', displayName: '应收保费总额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },

                {
                    name: 'sum_paymount', displayName: '解付保费总额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'sum_receivefeemount', displayName: '应收佣金总额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'sum_consult', displayName: '应收咨询费总额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'sum_evaluationfee', displayName: '应收公估费总额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'sapCustomernCode', displayName: '凭证状态', width: 100, cellFilter: 'SELECT_SAPTYPE'},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOrg_name', displayName: '业务单位', width: 100,},
                {name: 'pkOperator_name', displayName: '经办人', width: 100,},
                {name: 'operate_date', displayName: '制单日期', width: 100,},
                {name: 'pkAuditor_name', displayName: '审核人', width: 100,},
                {name: 'check_date', displayName: '审核日期', width: 100,},
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

        $scope.selectTabName = 'clearingBGridOptions';
        $scope.clearingBGridOptions = {
            enableCellEditOnFocus: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'pkInsurancebill.insuranceno', displayName: '保单号', width: 100, enableCellEdit: false
                },
                {name: 'c0Name.name', displayName: '计划往来对象', enableCellEdit: false},
                {
                    name: 'pkInsurancebill.projectname', displayName: '项目名称', enableCellEdit: false
                },
                // {
                //     name: 'typeMoney', displayName: '收付款类型', enableCellEdit: false
                // },
                {
                    name: 'receiveperiod', displayName: '期数', enableCellEdit: false
                },
                // {
                //     name: 'typeCompany', displayName: '收付款对象类型', enableCellEdit: false
                // },
                {
                    name: 'planDate', displayName: '计划时间', cellFilter: 'date:"yyyy-MM-dd"',
                    enableCellEdit: false
                },
                {
                    name: 'planMoneyOld', displayName: '本次计划金额(原币种)', cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    },
                    enableCellEdit: false
                },
                {
                    name: 'planMoney', displayName: '本次计划金额(元)', cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    },
                    enableCellEdit: false
                },
                {
                    name: 'factDate', displayName: '结算日期', cellFilter: 'date:"yyyy-MM-dd"'
                    , editableCellTemplate: 'ui-grid/refDate',
                    enableCellEdit: false
                },
                {
                    name: 'factMoneyOld', displayName: '本次结算金额(原币种)', cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    },
                    enableCellEdit: true
                },
                {
                    name: 'factMoney', displayName: '本次结算金额(元)', cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    },
                    enableCellEdit: false
                },
                {
                    cellClass: function () {
                        return "lr-text-right"
                    },
                    name: 'noPaymentMoneyOld', displayName: '未结算金额(原币种)', cellFilter: 'AMOUNT_FILTER',
                    enableCellEdit: false
                },
                {
                    name: 'noPaymentMoney', displayName: '未结算金额(元)', cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    },
                    enableCellEdit: false
                },
                {
                    name: 'vdef1', displayName: '备注', width: 100
                    , enableCellEdit: true
                },
            ],
            data: $scope.VO.clearingB,
            onRegisterApi: function (gridApi) {
                $scope.clearingBGridOptions.gridApi = gridApi;
                $scope.clearingBGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
                if ($scope.clearingBGridOptions.gridApi.edit) {
                    $scope.clearingBGridOptions.gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        $scope.VO.clearingB = $scope.clearingBGridOptions.data;
                        var factactual = $scope.clearingBGridOptions.data[0].factActualcollection;
                        if (factactual != null) {
                            var datas = $scope.clearingBGridOptions.data.length;
                            if (datas > 1) {
                                for (var i = 1; i < $scope.clearingBGridOptions.data.length; i++) {
                                    $scope.clearingBGridOptions.data[i].factActualcollection = factactual;
                                }
                            }
                        }
                        if ('factMoneyOld' == colDef.name && $scope.VO.inoutType == '3') {
                            if (parseFloat(rowEntity.planMoneyOld) - parseFloat(rowEntity.factMoneyOld) < 0) {
                                layer.alert("本次结算的原币种金额必须小于原币种计划金额!", {
                                    skin: 'layui-layer-lan',
                                    closeBtn: 1
                                });
                                rowEntity.factMoneyOld = oldValue;
                                $scope.$apply();
                                return;
                            }
                            if (parseFloat(rowEntity.planMoneyOld) - parseFloat(rowEntity.factMoneyOld) > 0.02) {
                                layer.alert("本次结算的原币种金额不可和原币种计划金额相差0.02!", {
                                    skin: 'layui-layer-lan',
                                    closeBtn: 1
                                });
                                rowEntity.factMoneyOld = oldValue;
                                $scope.$apply();
                                return;
                            }
                        }
                        if ('factMoneyOld' == colDef.name) {
                            rowEntity.noPaymentMoney = parseFloat(rowEntity.planMoney) - parseFloat(rowEntity.factMoney);
                            rowEntity.noPaymentMoneyOld = parseFloat(rowEntity.planMoneyOld) - parseFloat(rowEntity.factMoneyOld);
                            $http.post($rootScope.basePath + "againClearing/childTableValueChanged", {data: angular.toJson($scope.VO)})
                                .success(function (response) {
                                    if (response) {
                                        angular.assignData($scope.VO, response.result);
                                        $scope.clearingBGridOptions.data = response.result.clearingB;
                                        $scope.VO.matching_money = Number.parseFloat('0').toFixed(2);
                                        for (var j = 0; j < $scope.clearingBGridOptions.data.length; j++) {
                                            $scope.VO.matching_money = (Number.parseFloat($scope.VO.matching_money) + Number.parseFloat($scope.clearingBGridOptions.data[j].factMoney)).toFixed(2);
                                        }
                                    }
                                });
                        }
                        if ('billing' == colDef.name && rowEntity.billing == 'Y') {
                            if ($scope.VO.clearingB.length > 0 && $scope.VO.clearingB[0].pkInsurancebill.code == rowEntity.pkInsurancebill.code) {

                                for (var i = 0; i < $scope.VO.clearingB.length; i++) {
                                    $scope.VO.clearingB[i].billing = 'Y';
                                }
                            }
                        }
                        $scope.$apply();
                    });
                }
            }
        };

        //已选银行流水
        $scope.clearingGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: false,
            enableSelectAll: false,
            multiSelect: false,
            enableSorting: true,
            enableRowHeaderSelection: false,
            // showColumnFooter: true,
            columnDefs: [
                {name: 'reciprocal_name.name', displayName: '对方账户名称', enableCellEdit: false},
                {name: 'reciprocal_account_view', displayName: '对方账号', enableCellEdit: false},
                {
                    name: 'lender_amount', displayName: '可用金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }, aggregationType: uiGridConstants.aggregationTypes.sum,
                },
                {name: 'transaction_name.unitname', displayName: '交易账户名称', width: 250, enableCellEdit: false},
                {name: 'transaction_account_view', displayName: '交易账号', enableCellEdit: false},
                {name: 'transaction_date', displayName: '到账日期', enableCellEdit: false, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'account_type_name', displayName: '账户类型', enableCellEdit: false},
                {name: 'settlementAmounts', displayName: '本次结算金额', enableCellEdit: true, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    },
                },
                {
                    name: 'remaining_amount', displayName: '剩余金额', enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    },
                },

            ],
            data: $scope.VO.bankFlow,
            onRegisterApi: function (gridApi) {
                $scope.clearingGridOptions.gridApi = gridApi;
                //添加行头
                $scope.clearingGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
                if ($scope.clearingGridOptions.gridApi.edit) {
                    $scope.clearingGridOptions.gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        // $scope.VO.amount_money = Number.parseFloat('0').toFixed(2);
                        for (var i = 0; i < $scope.clearingGridOptions.data.length; i++) {
                            let settlementAmounts = $scope.clearingGridOptions.data[i].settlementAmounts;
                            settlementAmounts = settlementAmounts ? Number.parseFloat(settlementAmounts) : Number.parseFloat('0').toFixed(2);

                            var remaining_amount = Number.parseFloat($scope.clearingGridOptions.data[i].lender_amount)-Number.parseFloat(settlementAmounts);
                            if (remaining_amount<0){
                                $scope.clearingGridOptions.data[i].settlementAmounts = oldValue;
                                return layer.alert("本次结算金额不能大于剩余金额!", {skin: 'layui-layer-lan', closeBtn: 1});;
                            }else {
                                $scope.clearingGridOptions.data[i].remaining_amount = remaining_amount;
                            }
                            // $scope.VO.amount_money = Number.parseFloat($scope.VO.amount_money) + Number.parseFloat(settlementAmounts);
                            // $scope.VO.amount_money = Number.parseFloat($scope.VO.amount_money).toFixed(2);
                        }
                    })
                }
            }
        };

        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
    };

    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
    };
    $scope.table_name = "lr_clearing";
    $scope.billdef = "AgainClearing";
    $scope.beanName = "insurance.ClearingServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.child_table = angular.toJson({"clearingB": "caib_clearing_b"});
    initworkflow($scope, $http, ngDialog);
});
app.controller('againClearingBCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {

    $scope.queryPath = 'query';

    $scope.insuranceinfonoRef = {
        id: $scope.$id,
        columnDefs: [
            {
                field: 'pk',
                displayName: '保单号'
            },
            {
                field: 'code',
                displayName: '单据编号'
            },
            {
                field: 'name',
                displayName: '项目名称'
            }
        ],
        data: ""
    }
    /**
     * 初始化页面变更方法
     */
    $scope.initQUERYChildren = function () {
        return {
            'id0_0notin': $scope.childrenId,
           // inoutType: $rootScope.SELECT.ITEMTYPE[0].id,
            type_money_no0_0eq: $scope.$parent.VO.inoutType,
            currency0_0eq: $scope.$parent.VO.currency,
            insurance_type0_0eq: 'relife'
        }
    };
    $scope.QUERYCHILDREN = $scope.initQUERYChildren();

    $scope.initData = function () {
        $scope.VO.reportChildren = [];
        $scope.clearingBGridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            useExternalPagination: true,

            columnDefs: [
                {name: 'billid', displayName: '来源单据信息编号', width: 100,},
                {name: 'partner.insuranceno', displayName: '保单号', width: 100,},
                {name: 'partner.estimatename', displayName: '投保人', width: 100,},
                {name: 'partner.projectname', displayName: '项目名称', width: 100,},
                // {name: 'partner.insurance', displayName: '险种信息', width: 100,},
                {name: 'typeMoney', displayName: '收付款类型', width: 100,},
                {name: 'company.name', displayName: '收付款对象名称', width: 100,},
                {name: 'stages', displayName: '期数', width: 100,},
                {
                    name: 'planMoney', displayName: '本期计划金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'planDate', displayName: '计划日期', width: 100,},
                {
                    name: 'factMoney', displayName: '已结算金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'noPaymentMoney', displayName: '未结算金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'vsettlebillno', displayName: '业务结算单号', width: 100,}

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
                    $scope.queryForGridChildren($scope.QUERYCHILDREN, $scope.queryPath);
                });
            }
        };
    };


    $scope.queryForGridChildren = function (data, path) {
        if (!$scope.queryData) {
            $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.clearingBGridOptions.columnDefs;
        }
        data.insurance_type0_0eq = 'relife';
        layer.load(2);
        $http.post($scope.basePath + 'paymentRef/' + path, {
            data: angular.toJson(data),
            page: $scope.gridApi ? $scope.gridApi.page : $scope.clearingBGridOptions.page,
            pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.clearingBGridOptions.pageSize,
            fields: angular.toJson($scope.queryData)
        }).success(function (response) {
            if (response.code == 200) {
                if (!$scope.query) {
                    $scope.query = $scope.clearingBGridOptions.columnDefs;
                }
                //财务结算，增行时，已选择的保单不要继续显示 @sucy 2019-5-30
                var resultArr = response.data.records;
                var clearingBArr2 = $scope.VO.clearingB;
                for (var i = resultArr.length - 1; i >= 0; i--) {
                    var resultPayment = resultArr[i];
                    for (var j = clearingBArr2.length - 1; j >= 0; j--) {
                        var psymentVO = clearingBArr2[j];
                        if (resultPayment.pkPayment == psymentVO.pkPayment) {
                            resultArr.splice(i, 1);
                            break;
                        }
                    }
                }
                $scope.clearingBGridOptions.data = resultArr;
                $scope.clearingBGridOptions.totalItems = response.data.total;
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
            if ($scope.queryPath == 'query') {
                //新增
                $scope.$parent.confirm(rows);
                ngDialog.close();

            } else if ($scope.queryPath == 'queryForGridByOpen') {
                $scope.pk_payment = rows[0].pk_payment;
                //开启收付款
                $http.post($rootScope.basePath + "againClearing/openPayment", {pk: $scope.pk_payment})
                    .success(function (response) {
                        if (!response.flag) {
                            ngDialog.close($scope.ngDialogId);
                            layer.msg('开启成功!', {
                                shift: 6,
                                icon: 11
                            });
                        }
                    });
            } else if ($scope.queryPath == 'queryForGridByClose') {
                //关闭收付款
                ngDialog.open({
                    showClose: true,
                    closeByDocument: true,
                    template: 'view/againClearing/closeClearing.html',
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
                    }
                }, function (reason) {
                });
            }

        };

        $scope.onCancel = function () {
            ngDialog.close($scope.ngDialogId);
        };


    };
    $scope.initData();
    $scope.initFunction();
    //$scope.queryForGridChildren($scope.QUERYCHILDREN, $scope.queryPath);

});


app.controller('closeClearingCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
    $scope.onSureClose = function (pk) {
        ngDialog.close($scope.$parent.ngDialogId);
        ngVerify.check('closeClearing', function (errEls) {
            if (errEls && errEls.length) {
                return layer.alert("请先填写所有的必输项!",
                    {skin: 'layui-layer-lan', closeBtn: 1});
            } else {
                layer.confirm('是否作废选定收付款？', {
                        btn: ['是', '否'], //按钮
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
                        $http.post($rootScope.basePath + "againClearing/closePayment", {pk: pk, vdef1: $scope.vdef1})
                            .success(function (response) {
                                if (!response.flag) {
                                    ngDialog.close($scope.ngDialogId);
                                    layer.msg('作废成功!', {
                                        shift: 6,
                                        icon: 1
                                    });
                                }
                            });
                    }
                );
            }
        }, true);

    }

    $scope.onCancelClose = function () {
        ngDialog.close($scope.ngDialogId);
    };

});

/**
 *  打印 弹窗
 */
app.controller('printReportChooseCtrl', ['$rootScope', '$scope', '$sce', '$http', 'ngDialog', '$state', '$stateParams', 'ngVerify', function ($rootScope, $scope, $sce, $http, ngDialog, $state, $stateParams, ngVerify) {

    /**
     * 初始化页面变更方法
     */
    var initPage = function () {
        $scope.pVO = {};
        $scope.pVO.pay_date = $rootScope.workDate;
        $scope.pVO.charge_date = $rootScope.workDate;
        $scope.onCancels = function () {
            ngDialog.close();
        };

        $scope.onResets = function () {
            $scope.pVO.pay_date = '';
            $scope.pVO.charge_date = '';
            $scope.pVO.billno = '';
            $scope.pVO.account_no = '';
        };

        $scope.onSaves = function () {
            $http.post($rootScope.basePath + "againClearing/Print",
                {data: angular.toJson($scope.$parent.VO), raq: $scope.$parent.raq, type: "PDF", query: angular.toJson($scope.pVO)})
                .success(function (response) {
                    layer.closeAll('loading');
                    if (response.code == 200) {
                        window.open(getURL(response.queryPath));
                    }
                    ngDialog.close();
                });

        };

        $scope.initForm = function () {
            if ($scope.$parent.raq == 'daiShouUp' || $scope.$parent.raq == 'daiShouDn') {
                $scope.isPdateShow = true;
                $scope.isCdateShow = true;
                $scope.isBillShow = true;
                $scope.isBankShow = true;
            } else if ($scope.$parent.raq == 'jieFu') {
                $scope.isPdateShow = true;
                $scope.isCdateShow = true;
                $scope.isBillShow = false;
                $scope.isBankShow = false;
            } else if ($scope.$parent.raq == 'daiShouAgain'
                || $scope.$parent.raq == 'daiFuAgain'
                || $scope.$parent.raq == 'fapiao') {
                $scope.isPdateShow = true;
                $scope.isCdateShow = false;
                $scope.isBillShow = false;
                $scope.isBankShow = false;

            }

        };

        $scope.getTitle1 = function () {
            if ($scope.$parent.raq == 'daiShouUp' || $scope.$parent.raq == 'daiShouDn') {
                return "向保险公司支付日期"
            } else if ($scope.$parent.raq == 'jieFu') {
                return "合同约定付款日期"
            } else if ($scope.$parent.raq == 'daiShouAgain') {
                return "到账日期"
            } else if ($scope.$parent.raq == 'daiFuAgain') {
                return "付款日期"
            } else if ($scope.$parent.raq == 'fapiao') {
                return "发票开具日期"
            }
        };

        $scope.getTitle2 = function () {
            if ($scope.$parent.raq == 'daiShouUp' || $scope.$parent.raq == 'daiShouDn') {
                return "申请划回日期"
            } else if ($scope.$parent.raq == 'jieFu') {
                return "代收客户保费到期日期"
            }
        };
    };




    initPage();
    $scope.initForm();
}]);