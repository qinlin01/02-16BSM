/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('changebillcheckCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                payment: [],
                assistant: [],
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                billstatus: 31,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                dr: 0,
                isContinue: 0,
                costscale: [],
                coomedium: [],
                insuranceman: []
            };
        };
        $scope.entityVO = 'nc.vo.busi.ChangebillcheckVO';
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "operate_year": parseInt(new Date().format("yyyy")),
                "id": $stateParams.id
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.t1Flag = true;
        $scope.t2Flag = true;
        $scope.t3Flag = true;
        $scope.funCode = '30401';
    };

    $scope.changeBillRef =
        {
            id: $scope.$id,
            columnDefs: [
                {
                    field: 'insuranceinfono',
                    displayName: '保单信息编号'
                },
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
            return $http.post($rootScope.basePath + "changebillcheck/queryAllForGrid", {
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
            $http.post($scope.basePath + "changebillcheck/queryForGrid", {
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

        $scope.onCheckInsuranceno = function () {
            $http.post($scope.basePath + "changebillcheck/checkInsuranceno", {
                param: angular.toJson($scope.VO),
                "insureType": "unlife"
            }).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200" && "" != response.msg) {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    $scope.ishad = true;
                } else {
                    $scope.ishad = false;
                }
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
                    $http.post($scope.basePath + "changebillcheck/discard", {
                        pk: $scope.pk,
                        billdef: $scope.billdef
                    }).success(function (response) {
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
            $http.post($scope.basePath + "changebillcheck/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    var type = "0";
                    if ($scope.VO.updateType == "1") {
                        type = "1";
                    }
                    if (null != response.result && null != response.result.insuranceman) {
                        $scope.insurancemanGridOptions.data = response.result.insuranceman;
                    }
                    angular.assignData($scope.VO, response.result);
                    $scope.VO.updateType = type;
                    $scope.paymentGridOptions.data = $scope.VO.payment;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
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
            //发票冲销前生成正向数据
            if ($scope.VO.srcBillno != null && $scope.VO.correctingReasons != null && $scope.VO.correctingReasons == 1) {
                let grid_new = [];
                for (let i = 0; i < $scope.paymentGridOptions.data.length; i++) {
                    let obj = {};
                    obj.stages = $scope.paymentGridOptions.data[i].stages;
                    obj.typeMoneyNO = $scope.paymentGridOptions.data[i].typeMoneyNO;
                    obj.company = $scope.paymentGridOptions.data[i].company;
                    obj.typeCompanyNO = $scope.paymentGridOptions.data[i].typeCompanyNO;
                    obj.scaleMoney = $scope.paymentGridOptions.data[i].scaleMoney;
                    obj.planMoney = $scope.paymentGridOptions.data[i].planMoney * -1;
                    obj.factMoney = $scope.paymentGridOptions.data[i].factMoney;
                    obj.noPaymentMoney = $scope.paymentGridOptions.data[i].noPaymentMoney * -1;
                    obj.planDate = $scope.paymentGridOptions.data[i].planDate;
                    grid_new[i] = obj;
                }
                for (let i = 0; i < grid_new.length; i++) {
                    $scope.paymentGridOptions.data.push(grid_new[i]);
                }
            }
            $scope.VO.payment = $scope.paymentGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            for (var i = 0; i < $scope.VO.payment.length; i++) {
                $scope.VO.payment[i].noPaymentMoney = parseFloat($scope.VO.payment[i].planMoney) - parseFloat($scope.VO.payment[i].factMoney);
            }
            $scope.VO.insuranceman = $scope.insurancemanGridOptions.data;
            if ($scope.VO.billstatus == 37) {
                $scope.VO.billstatus = 31;
            }
            layer.load(2);
            $http.post($rootScope.basePath + "changebillcheck/save", {data: angular.toJson($scope.VO), funCode: $scope.funCode})
                .success(function (response) {
                    if (response && response.code && response.code == 500) {
                        return layer.alert(response.msg);
                    }
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        // angular.assignData($scope.VO, response.result);
                        $scope.VO = response.result;
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                        $scope.paymentGridOptions.data = response.result.payment;
                    }
                    if (response) {
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            if ($scope.VO.srcBillno != null && $scope.VO.correctingReasons != null && $scope.VO.correctingReasons == 1) {
                                layer.alert("已经为您自动生成发票冲销的正数单据，您可使用该批单下的正数单据继续结算！");
                            } else {
                                layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                        angular.assignData($scope.VO, response.result);
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

        $scope.checkBillCanChangeInsuranceMan = function (insuranceinfono){

            if($scope.VO.vdef1no == 2 && $scope.VO.correctingReasons == 2 && $scope.VO.changebillType == 1){
                layer.load(2);
                $http.post($scope.basePath + "changebillcheck/checkBillCanChangeInsuranceMan", {insuranceinfono: insuranceinfono}).success(function (response) {
                    layer.closeAll('loading');
                    if(response.code == 500){
                        layer.alert(response.msg);
                    }
                })
            }
        }

        //退保带数
        $scope.surrender = function () {
            //选择退保原因&&选择保单
            if ($scope.VO.srcBillno != null && $scope.VO.correctingReasons != null && $scope.VO.correctingReasons == 4) {
                //保险金额变更
                $scope.VO.insurancemoneychange = -$scope.VO.srcBillno.insurancetotalmoney;
                //保费变更
                $scope.VO.insurancechargechange = -$scope.VO.srcBillno.insurancetotalcharge;
                //佣金变更
                $scope.VO.feechange = -$scope.VO.srcBillno.receivefeemount;
                $scope.watchfeechange();
                //应收保费变更
                $scope.VO.vdef2 = -$scope.VO.srcBillno.receivemount;
                $scope.watchvdef2change();
                //应解付保费变更
                $scope.VO.vdef3 = -$scope.VO.srcBillno.paymount;
                $scope.watchvvdef3change();
            }
        }
        //发票冲销带数
        $scope.nvoiceSterilisation = function () {
            if ($scope.VO.srcBillno != null && $scope.VO.correctingReasons != null && $scope.VO.correctingReasons == 1) {
                $http.post($rootScope.basePath + "changebillcheck/nvoiceSterilisation", {data: angular.toJson($scope.VO.srcBillno)})
                    .success(function (response) {
                        if (response.code == 200) {
                            $scope.paymentGridOptions.data = response.clearingB;
                        } else if (response.code == 500) {
                            layer.alert(response.msg);
                        }
                    });
            }
        }
        //清空带数
        $scope.clearData = function () {
            $scope.VO.srcBillno = null;
            $scope.paymentGridOptions.data = null;
            $scope.insurancemanGridOptions.data = null;
            $scope.dealAttachmentBGridOptions.data = null;
            $scope.VO.dueDate = null;
            $scope.VO.vdef5 = null;
            $scope.VO.insurancemoneychange = null;
            $scope.VO.insurancechargechange = null;
            $scope.VO.feechange = null;
            $scope.VO.vdef2 = null;
            $scope.VO.vdef3 = null;
            $scope.VO.content = null;
            $scope.VO.cmemo = null;
        }
        $scope.putPayment = function (response, typeNum) {

            if (response) {

                if ($scope.paymentGridOptions.data.length == 0) {
                    $scope.paymentGridOptions.data = angular.fromJson(response.payment);
                    $scope.VO.payment = angular.fromJson(response.payment);
                } else {
                    var length = $scope.paymentGridOptions.data.length;
                    var i = 0;
                    var flags = 0;
                    for (var j = 0; j < length; j++) {
                        typeMoneyNO = $scope.paymentGridOptions.data[j].typeMoneyNO;
                        if (typeMoneyNO == typeNum) {
                            $scope.paymentGridOptions.data[j] = angular.fromJson(response.payment[i]);
                            i++;
                            flags = 1;
                        }
                    }
                    if (flags == 0) {
                        for (var i = 0; i < response.payment.length; i++) {
                            var paymentData = angular.fromJson(response.payment[i]);
                            $scope.paymentGridOptions.data.push(paymentData);
                        }
                    }
                }
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

    };


    $scope.indexNum = 0;

    //佣金变更
    function watchfeechange() {
        if (!$scope.isEdit) {
            return;
        }
        if ($scope.isEdit) {
            layer.load(2);
            $http.post($scope.basePath + "changebillcheck/feechangeWatch", {data: angular.toJson($scope.VO)}).success(function (response) {
                $scope.putPayment(response, 3);

            })

        }
    };
    $scope.initWatch = function () {

        $scope.$watch('VO.correctingReasons', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                //清空带数
                $scope.clearData();
                //退保带数
                $scope.surrender();
                //发票冲销
                $scope.nvoiceSterilisation();
            }
        }, true);

        $scope.$watch('VO.changebillType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                //清空带数
                $scope.clearData();
            }
        }, true);
        $scope.$watch('VO.vdef1no', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                //清空所有下拉选项
                $scope.VO.correctingReasons = null;
                $scope.VO.changebillType = null;
                $scope.VO['vdef1noName'] = $rootScope.SELECT.CHANGEBILLCHECKTYPE[newVal - 1].name;
            }
        }, true);

        $scope.$watch('VO.srcBillno.insuranceinfono', function (newVal, oldValue) {
            if (newVal == oldValue || newVal == undefined || newVal == '') return;
            if ($scope.isEdit) {
                layer.load(2);
                $http.post($scope.basePath + "changebillcheck/srcBillnoWatch", {data: angular.toJson($scope.VO)}).success(function (response) {
                    if (response) {

                        if (response.code == 500) {
                            return layer.alert(response.msg, {
                                skin: 'layui-layer-lan',
                                closeBtn: 1
                            });
                        }

                        if (null != response.result.msg) {
                            $scope.VO.srcBillno.code = null;
                            return layer.alert(response.result.msg, {
                                skin: 'layui-layer-lan',
                                closeBtn: 1
                            });
                        } else {
                            $scope.VO.srcBillno = response.result.srcBillno;
                        }
                        $scope.VO.srcType = response.result.srcType;
                        $scope.VO.insurancemoneychange = response.result.insurancemoneychange;
                        $scope.VO.insurancechargechange = response.result.resultinsurancechargechange;
                        $scope.VO.feechange = response.result.feechange;
                        $scope.VO.vdef2 = response.result.vdef2;
                        $scope.VO.vdef3 = response.result.vdef3;
                        $scope.VO.payment = response.result.payment;
                        $scope.paymentGridOptions.data = angular.fromJson(response.result.payment);
                        if ($scope.VO.changebillType == '1') {
                            $scope.insurancemanGridOptions.data = angular.fromJson($scope.VO.srcBillno.insurancemans);
                        }
                        //退保带数
                        $scope.surrender();
                        //发票冲销
                        $scope.nvoiceSterilisation();
                        //变更保险人校验
                        $scope.checkBillCanChangeInsuranceMan($scope.VO.srcBillno.insuranceinfono);
                        //@zhangwj 【收付款无法填写计划日期的问题】
                        if($scope.paymentGridOptions.data && $scope.paymentGridOptions.data.length > 0){
                            for (let i = 0; i < $scope.paymentGridOptions.data.length; i++) {
                                if(!$scope.paymentGridOptions.data[i].planDate){
                                    $scope.paymentGridOptions.data[i].planDate = null;
                                }
                            }
                        }
                    }

                })
            }
        }, true);

        $scope.$watch('VO.vdef1no', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if (newVal && $scope.isEdit) {
                if (newVal == $rootScope.SELECT.CHANGEBILLCHECKTYPE[1].id || newVal == $rootScope.SELECT.CHANGEBILLCHECKTYPE[2].id) {
                    $scope.isType = true;
                    $scope.VO.insurancecheckno = null;
                } else {
                    $scope.isType = false;
                }
            }
        });
        $scope.$watch('VO.estimatepk.name', function (newVal, oldVal) {

            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if (newVal && $scope.isEdit) {
                if ($scope.VO.estimatepk.c_0_address) {
                    $scope.VO.estimateaddr = $scope.VO.estimatepk.c_0_address;
                } else {
                    $scope.VO.estimateaddr = '不详';
                }

                if ($scope.VO.estimatepk.name) {
                    $scope.VO.estimatelinkman = $scope.VO.estimatepk.name;
                } else {
                    $scope.VO.estimatelinkman = '不详';
                }

                if ($scope.VO.estimatepk.c_tele) {
                    $scope.VO.estimatelinktel = $scope.VO.estimatepk.c_tele;
                } else {
                    $scope.VO.estimatelinktel = '不详';
                }


            }
        });

        //佣金变更
        $scope.watchfeechange = function () {
            if (!$scope.isEdit) {
                return;
            }
            if ($scope.isEdit) {
                layer.load(2);
                $http.post($scope.basePath + "changebillcheck/feechangeWatch", {data: angular.toJson($scope.VO)}).success(function (response) {
                    $scope.putPayment(response, 3);

                })

            }
        };

        //应收保费变更
        $scope.watchvdef2change = function () {
            if (!$scope.isEdit) {
                return;
            }
            layer.load(2);
            $http.post($scope.basePath + "changebillcheck/vdef2Watch", {data: angular.toJson($scope.VO)}).success(function (response) {
                $scope.putPayment(response, 1);

            })
        };

        //应解付保费变更
        $scope.watchvvdef3change = function () {
            if (!$scope.isEdit) {
                return;
            }
            layer.load(2);
            $http.post($scope.basePath + "changebillcheck/vdef3Watch", {data: angular.toJson($scope.VO)}).success(function (response) {
                $scope.putPayment(response, 2);

            })
        };
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
                    //  第一次初始化成null，后台没值，应该【】
                    if ($scope.dealAttachmentBGridOptions.data) {
                        angular.forEach(value, function (item) {
                            item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                            //合同信息类型
                            if ($scope.VO.vdef1no == 3) {
                                item.file_type = 1;
                            }
                            //财务资料类型
                            if ($scope.VO.vdef1no == 4) {
                                item.file_type = 2;
                            }
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });

                    } else {
                        $scope.dealAttachmentBGridOptions.data = [];
                        angular.forEach(value, function (item) {
                            item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                            //合同信息类型
                            if ($scope.VO.vdef1no == 3) {
                                item.file_type = 1;
                            }
                            //财务资料类型
                            if ($scope.VO.vdef1no == 4) {
                                item.file_type = 2;
                            }
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
         };
 */
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
            $scope.form = true;
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
        $scope.onEdit = function (id) {
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
                //判断是否是保险公司
                if ($scope.VO.vdef1no == 1) {
                    $scope.isType = false;
                }
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            } else {
                $scope.findOne(id);
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
            //没有选保单就不暂存
            if (!$scope.VO.srcBillno) {
                return layer.alert('请填写保单号!', {skin: 'layui-layer-lan', closeBtn: 1});
            }
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
            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {
                pk: id,
                tableName: $scope.table_name,
                billdef: $scope.billdef
            }).success(function (response) {
                if (response && response.code == "200") {
                    $scope.card = true;
                    angular.assignData($scope.VO, response.result);
                    $scope.insurancemanGridOptions.data = $scope.VO.insuranceman;
                    $scope.paymentGridOptions.data = $scope.VO.payment;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    if (null != response.result && null != response.result.insuranceman) {
                        $scope.insurancemanGridOptions.data = response.result.insuranceman;

                    }
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
                    // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };

        /*$scope.onCard = function () {
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
                    $http.post($scope.basePath + "changebillcheck/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
        /*  $scope.onCancel = function () {
              if($scope.isClear){
                  $scope.VO = $scope.initVO();
              }
              $scope.findOne();
              $scope.isDisabled = true;
              $scope.isEdit = false;
              $scope.isBack = false;
          };*/
        $scope.onCancel = function () {
            if ($scope.isClear) {
                $scope.VO = $scope.initVO();
            }
            $scope.isDisabled = true;
            $scope.isEdit = false;
            $scope.isBack = false;
            $scope.isType = true;
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
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $scope.isSubDisabled = false;
            $scope.aVO = {};
            $http.post($scope.basePath + "common/getFileType", {
                id: rows[0].id,
                tableName: $scope.table_name
            }).success(function (response) {
                $scope.VO = response.data;
                $scope.filetype = response.filetype;
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: false,
                    template: 'view/uploadAnyTime.html',
                    className: 'ngdialog-theme-formInfo',
                    scope: $scope,
                    rootScope: $rootScope,
                    preCloseCallback: function (value) {
                        layer.load(2);
                        if ($rootScope.submitAnyTime) {
                            $http.post($scope.basePath + "common/uploadAnyTime", {
                                data: angular.toJson($scope.VO),
                                tableName: $scope.table_name
                            }).success(function (response) {
                                layer.closeAll('loading');
                                if (response && response.code == 200) {
                                    layer.alert("附件上传成功！")
                                }
                                if (response && response.code == 500) {
                                    layer.alert("系统异常！")
                                }
                            });
                            rows[0] = $scope.VO;
                            $rootScope.submitAnyTime = false;
                        }
                        $scope.VO = $scope.initVO();
                        layer.closeAll('loading');
                        return true;
                    }
                }).then(function (value) {
                }, function (reason) {
                });
            });
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

                    if ($scope.VO.vdef1no == 2 && $scope.VO.correctingReasons == 9) {
                        //调整尾差校验±100
                        if (($scope.VO.vdef3 * 1) > 100 || ($scope.VO.vdef3 * 1) < -100) {
                            return layer.alert("应解付保费尾差调整不能超过100元，超出此金额请选择“保单录入错误”",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if (($scope.VO.vdef2 * 1) > 100 || ($scope.VO.vdef2 * 1) < -100) {
                            return layer.alert("应收保费尾差调整不能超过100元，超出此金额请选择“保单录入错误”",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if (($scope.VO.feechange * 1) > 100 || ($scope.VO.feechange * 1) < -100) {
                            return layer.alert("佣金尾差调整不能超过100元，超出此金额请选择“保单录入错误”",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        //收付款子表校验大于0
                        if ($scope.paymentGridOptions.data == null || $scope.paymentGridOptions.data.length == 0) {
                            return layer.alert("请填写要调整的尾差！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }

                    $scope.VO.vdef1noName = $rootScope.returnSelectName($scope.VO.vdef1no, "CHANGEBILLCHECKTYPE");
                    if ($scope.paymentGridOptions.data.length) {
                        for (var i = 0; i < $scope.paymentGridOptions.data.length; i++) {
                            if (!$scope.paymentGridOptions.data[i].planDate) {
                                return layer.alert("子表属性计划日期不可为空！",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                    }
                    // 其他（财务资料），合同变更 校验收付款子表不为空
                    if ($scope.VO.vdef1no == 3 || $scope.VO.vdef1no == 4) {
                        if ($scope.paymentGridOptions.data.length == null || $scope.paymentGridOptions.data.length == 0) {
                            return layer.alert("收付款子表不可为空！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if (null == $scope.VO.content || $scope.VO.content == "") {
                        if (!($scope.VO.vdef1no == 2 && $scope.VO.correctingReasons == 9)) {
                            return layer.alert("请填写具体原因！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    //保险期延长
                    if ($scope.VO.vdef1no == 1 && $scope.VO.correctingReasons == 3) {
                        if ($scope.VO.dueDate == null || ($scope.VO.dueDate <= $scope.VO.srcBillno.enddate)) {
                            return layer.alert("到期日变更字段必须大于保单到期日期！保单到期日期为:" + $scope.VO.srcBillno.enddate,
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if ((!$scope.dealAttachmentBGridOptions.data) || $scope.dealAttachmentBGridOptions.data.length == 0) {
                        // if (!($scope.VO.vdef1no == 2 && $scope.VO.correctingReasons == 9)) {
                            return layer.alert("请上传附件！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        // }
                    }
                    //合同变更校验附件类型
                    if ($scope.VO.vdef1no == 3) {
                        let isMsg = true;
                        for (let i = 0; i < $scope.dealAttachmentBGridOptions.data.length; i++) {
                            if ($scope.dealAttachmentBGridOptions.data[i].file_type == 1) {
                                isMsg = false;
                            }
                        }
                        if (isMsg) {
                            return layer.alert("附件类型请选择合同信息！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    //财务资料校验附件类型
                    if ($scope.VO.vdef1no == 4) {
                        let isMsg = true;
                        for (let i = 0; i < $scope.dealAttachmentBGridOptions.data.length; i++) {
                            if ($scope.dealAttachmentBGridOptions.data[i].file_type == 2) {
                                isMsg = false;
                            }
                        }
                        if (isMsg) {
                            return layer.alert("附件类型请选择财务信息！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if (($scope.VO.vdef1no == 1 || $scope.VO.vdef1no == 2) && ($scope.VO.correctingReasons == 8 || $scope.VO.correctingReasons == 4 || $scope.VO.correctingReasons == 1 || $scope.VO.correctingReasons == 6) && $scope.paymentGridOptions.data.length == 0) {
                        return layer.alert("收付款信息不能为空！",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    //公司内部修改金额特殊处理
                    if ($scope.VO.vdef1no == 2 && $scope.VO.correctingReasons == 2 && $scope.VO.changebillType == 0) {

                        if (($scope.VO.feechange != 0 || $scope.VO.vdef2 != 0 || $scope.VO.vdef3 != 0) && $scope.paymentGridOptions.data.length == 0) {
                            return layer.alert("收付款信息不能为空！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if (($scope.VO.vdef1no == 2 && $scope.VO.correctingReasons == 2 && $scope.VO.changebillType == 1) && $scope.insurancemanGridOptions.data.length == 0) {
                        return layer.alert("被保险人信息不能为空！",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.VO.vdef1no == 2 && $scope.VO.correctingReasons == 2 && $scope.VO.changebillType == 1) {

                        for (var i = 0; i < $scope.insurancemanGridOptions.data.length; i++) {
                            if ($scope.insurancemanGridOptions.data[i].insurancemanpk == null || $scope.insurancemanGridOptions.data[i].insurancemanpk == '' || $scope.insurancemanGridOptions.data[i].insurancemanpk.name == null || $scope.insurancemanGridOptions.data[i].insurancemanpk.name == '') {
                                return layer.alert("原被保险人姓名不能为空！",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if ($scope.insurancemanGridOptions.data[i].insurancemanpknew == null || $scope.insurancemanGridOptions.data[i].insurancemanpknew == '' || $scope.insurancemanGridOptions.data[i].insurancemanpknew.name == null || $scope.insurancemanGridOptions.data[i].insurancemanpknew.name == '') {
                                return layer.alert("新保险人名称不能为空！",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }

                    }
                    if ($scope.VO.changebillType == "0" && $scope.VO.feechange != 0 && $scope.paymentGridOptions.data.length != 0) {
                        var count = 0;
                        for (var i = 0; i < $scope.VO.payment.length; i++) {
                            if ($scope.VO.payment[i].typeMoneyNO == 3) {
                                count++;
                            }
                        }
                        if (count == 0) {
                            return layer.alert("应收佣金收付款信息不能为空！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if ($scope.VO.changebillType == "0" && $scope.VO.vdef2 != 0 && $scope.paymentGridOptions.data.length != 0) {
                        var count = 0;
                        for (var i = 0; i < $scope.VO.payment.length; i++) {
                            if ($scope.VO.payment[i].typeMoneyNO == 1) {
                                count++;
                            }
                        }
                        if (count == 0) {
                            return layer.alert("应收保费收付款信息不能为空！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if ($scope.VO.changebillType == "0" && $scope.VO.vdef3 != 0 && $scope.paymentGridOptions.data.length != 0) {
                        var count = 0;
                        for (var i = 0; i < $scope.VO.payment.length; i++) {
                            if ($scope.VO.payment[i].typeMoneyNO == 2) {
                                count++;
                            }
                        }
                        if (count == 0) {
                            return layer.alert("解付保费收付款信息不能为空！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }

                    if ($scope.VO.changebillType == "0" && $scope.VO.feechange != 0 && $scope.paymentGridOptions.data.length != 0) {
                        var count = 0;
                        for (var i = 0; i < $scope.VO.payment.length; i++) {
                            if ($scope.VO.payment[i].typeMoneyNO == 3) {
                                count = eval(parseFloat(count)) + eval(parseFloat($scope.VO.payment[i].planMoney));
                            }
                        }
                        if (parseFloat(count.toFixed(2)) != parseFloat($scope.VO.feechange)) {
                            return layer.alert("应收佣金收付款信息加和不等于佣金变更！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }

                    if ($scope.VO.changebillType == "0" && $scope.VO.vdef2 != 0 && $scope.paymentGridOptions.data.length != 0) {
                        var count = 0;
                        for (var i = 0; i < $scope.VO.payment.length; i++) {
                            if ($scope.VO.payment[i].typeMoneyNO == 1) {
                                count = eval(parseFloat(count)) + eval(parseFloat($scope.VO.payment[i].planMoney));
                            }
                        }
                        if (parseFloat(count.toFixed(2)) != parseFloat($scope.VO.vdef2)) {
                            return layer.alert("应收保费收付款信息加和不等于应收保费变更！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }

                    if ($scope.VO.changebillType == "0" && $scope.VO.vdef3 != 0 && $scope.paymentGridOptions.data.length != 0) {
                        var count = 0;
                        for (var i = 0; i < $scope.VO.payment.length; i++) {
                            if ($scope.VO.payment[i].typeMoneyNO == 2) {
                                count = eval(parseFloat(count)) + eval(parseFloat($scope.VO.payment[i].planMoney));
                            }
                        }
                        if (parseFloat(count.toFixed(2)) != parseFloat($scope.VO.vdef3)) {
                            return layer.alert("解付保费收付款信息加和不等于应解付保费变更！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if (null != $scope.VO.changebillType && $scope.VO.changebillType == "2") {
                        $scope.onCheckInsuranceno();
                        if ($scope.ishad) {
                            return;
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
        $scope.onAddLine = function () {
            $scope[$scope.selectTabName].data.push({});

        };
        /**
         * 子表删除
         */
        $scope.onDeleteLineinsurancemanGridOptions = function () {
            var delRow = $scope.insurancemanGridOptions.gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (var i = 0; i < $scope.insurancemanGridOptions.data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope.insurancemanGridOptions.data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope.insurancemanGridOptions.data.splice(i, 1);
                    }
                }
            }
        };
        $scope.onDeleteLinepaymentGridOptions = function () {
            var delRow = $scope.paymentGridOptions.gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            //防止保存后直接修改时导致paymentGridOptions.data丢失
            if (!$scope.paymentGridOptions.data) {
                $scope.paymentGridOptions.data = $scope.VO.payment;
            }
            //发票冲销特殊处理
            if ($scope.VO.srcBillno != null && $scope.VO.correctingReasons != null && $scope.VO.correctingReasons == 1) {
                for (var i = 0; i < $scope.paymentGridOptions.data.length; i++) {
                    for (var j = 0; j < delRow.length; j++) {
                        if (delRow[j].pkClearingB == $scope.paymentGridOptions.data[i].pkClearingB) {
                            $scope.paymentGridOptions.data.splice(i, 1);
                            i = -1;
                            break;
                        }
                    }
                }
                return;
            }
            for (var i = 0; i < $scope.paymentGridOptions.data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope.paymentGridOptions.data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope.paymentGridOptions.data.splice(i, 1);
                    }
                }
            }
        };
        $scope.onDeleteLinedealAttachmentBGridOptions = function () {
            var delRow = $scope.dealAttachmentBGridOptions.gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (var i = 0; i < $scope.dealAttachmentBGridOptions.data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope.dealAttachmentBGridOptions.data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope.dealAttachmentBGridOptions.data.splice(i, 1);
                    }
                }
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
            exporterCsvFilename: '财产险批单信息.csv',
            columnDefs: [
                {name: 'vbillno', displayName: '批单信息编号', width: 100,},
                {name: 'insurancecheckno', displayName: '批单编号', width: 100,},
                {name: 'vdef1no', displayName: '批单类型', width: 100, cellFilter: 'SELECT_CHANGEBILLCHECKTYPE'},
                {name: 'srcBillno.insuranceinfono', displayName: '保单信息编号', width: 100,},
                {name: 'srcBillno.code', displayName: '保单号', width: 100,},
                {
                    name: 'feechange', displayName: '佣金变更', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'insurancechargechange', displayName: '保费变更', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'insurancemoneychange', displayName: '保险金额变更', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'vdef2', displayName: '应收保费变更', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'vdef3', displayName: '应解付保费变更', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'changebillType', displayName: '修改类型', width: 100, cellFilter: 'SELECT_CHANGEBILLTYPE'},
                {
                    name: 'correctingReasons',
                    displayName: '批改原因',
                    width: 100,
                    cellFilter: 'SELECT_CORRECTINGREASONSTYPE'
                },
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'operateTime', displayName: '制单时间', width: 100,},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '部门', width: 100,},
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

        $scope.selectTabName = 'paymentGridOptions';
        $scope.paymentGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'stages', displayName: '期数', width: 100, enableCellEdit: false
                },
                {
                    name: 'typeMoneyNO', displayName: '收付款类型', width: 100, cellFilter: 'SELECT_TYPEMONEY'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.TYPEMONEY, enableCellEdit: false
                },
                {
                    name: 'company.name',
                    displayName: '收付款对象名称',
                    width: 100,
                    url: 'customerAgentRef/queryForGrid'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'company',
                    enableCellEdit: false
                },
                {
                    name: 'typeCompanyNO', displayName: '收付款对象类型', width: 100, cellFilter: 'SELECT_CUSTOMERTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.CUSTOMERTYPE, enableCellEdit: false
                },
                {
                    name: 'scaleMoney', displayName: '收付款比例%', width: 100
                },
                {
                    name: 'planDate', displayName: '计划日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'
                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'planMoney', displayName: '计划金额', width: 100, cellFilter: 'AMOUNT_FILTER',
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
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'factDate', displayName: '已收款日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'
                    , editableCellTemplate: 'ui-grid/refDate', enableCellEdit: false
                },
                {
                    name: 'vsettlebillno', displayName: '业务结算编号', width: 100, enableCellEdit: false
                },
            ],
            data: $scope.VO.payment,
            onRegisterApi: function (gridApi) {
                $scope.paymentGridOptions.gridApi = gridApi;
            }
        };
        $scope.selectTabName = 'insurancemanGridOptions';
        $scope.insurancemanGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'insurancemanpk.name', displayName: '原保险人名称', width: 100
                },
                {
                    name: 'insurancemanpknew.name',
                    displayName: '新保险人名称',
                    width: 100,
                    url: 'insuranceCustomerRef/queryForGrid',
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'insurancemanpknew',
                },

            ],
            data: $scope.VO.insuranceman,
            onRegisterApi: function (gridApi) {
                $scope.insurancemanGridOptions.gridApi = gridApi;
            }
        };
        $scope.dealAttachmentBGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'file_type',
                    displayName: '附件类型',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_TYPEOFCONTRACT',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.TYPEOFCONTRACT
                },
                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},
                {
                    name: 'upload_date', displayName: '上载时间', width: 100, enableCellEdit: false
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

//获取财务联查时url中的id
        function getQueryVariable() {
            var query = window.location.href;
            var vars = query.split("&");
            var pair = vars[0].split("=");
            if (pair.length > 1) {
                return pair[1];
            }
            return null;
        }

        if (null != getQueryVariable()) {
            $scope.onCard(getQueryVariable());
        }
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
    $scope.table_name = "lr_changebillcheck";
    $scope.child_table = angular.toJson({"srcBillno": "lr_insurancebill"});
    $scope.billdef = "Changebillcheck";
    $scope.beanName = "insurance.ChangebillcheckServiceImpl";
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
app.controller('paymentGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('assistantGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
