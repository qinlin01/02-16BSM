/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('pCarInsuranceCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $filter, $location, activitiModal, workFlowDialog) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                insuranceinfo: [{
                    maininsurance: 'Y',
                    vdef4: 'N',
                    vdef2: 'N',
                    chargerate: '0',
                    //2022-07-07 mx 改为后台查询车险及下级
                    insurancepk: null,
                }],
                autoInfo: [{
                    engineNumber: "",
                    ifFarm: "N",
                    vin: "",
                    licenseNumber: "",
                    modelType: "",
                    ifOnline: "N"
                }],
                insuranceman: [],
                partner: [],
                payment: [],
                dealAttachmentB: [],
                isbudget: 'N',
                ifSubstitute: 'N',
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                dr: 0,
                receivefeeperiod: 0,
                billstatus: 31,
                insuranceStatus: 1,
                costscale: [],

                coomedium: [],
                insurancetype: "personalcar",
            };
        };

        $scope.entityVO = 'nc.vo.busi.InsurancebillVO';
        $scope.funCode = '3020501';
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

        $scope.param = {person: 'yes', busi_type: 'notNull'};
        $scope.agentParam = null;
    };

    $scope.initHttp = function () {

        $scope.onCheckWithEIMS = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $scope.VO.payment = $scope.paymentGridOptions.data;
            $http.post($rootScope.basePath + "pCarInsurance/checkWithEIMS", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    if (response && response.code == "200") {
                        layer.alert(response.msg, {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                    }

                    // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                });
        };
        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data) {
            layer.load(2);
            return $http.post($rootScope.basePath + "pCarInsurance/queryAllForGrid", {
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
            $http.post($scope.basePath + "pCarInsurance/queryForGrid", {
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
            $http.post($scope.basePath + "propertyInsurance/checkInsuranceno", {
                param: angular.toJson($scope.VO),
                "insureType": "personalcar"
            }).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200" && "" != response.msg) {
                    // angular.assignData($scope.VO, response.result);
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
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
                    $http.post($scope.basePath + "pCarInsurance/discard", {
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
        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "pCarInsurance/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.paymentGridOptions.data = $scope.VO.payment;
                    $scope.changeAgentParamType();
                    if (callback) callback();
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
                    //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };

        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO.payment = $scope.paymentGridOptions.data;
            $scope.VO.insuranceman = $scope.insurancemanGridOptions.data;
            $scope.VO.partner = $scope.partnerGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $scope.VO.autoInfo = $scope.autoInfoGridOptions.data;
            for (var i = 0; i < $scope.VO.insuranceinfo.length; i++) {
                if ($scope.VO.insuranceinfo[i].insurancemoney == 0 && $scope.VO.insuranceinfo[i].insurancecharge == 0 && $scope.VO.insuranceinfo[i].commisionnum == 0) {
                    $scope.VO.insuranceinfo.splice(i, 1);
                }
            }
            $http.post($rootScope.basePath + "pCarInsurance/save", {
                data: angular.toJson($scope.VO),
                funCode: $scope.funCode
            })
                .success(function (response) {
                    if (response && response.code == 200) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        $scope.isreplace = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                        $scope.onCard();
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

        //新增险种信息
        $scope.onAddinsureType =function(){
            if ($scope.VO.insuranceinfo.length >= 1) {
                $scope.addDisabled = true;
                $scope.delDisabled=false;
            }
            var insuranceinfoArray = {
                maininsurance: 'Y',
                vdef4: 'N',
                vdef2: 'N',
                insurancepk:null,
            };
            $scope.VO.insuranceinfo.push(insuranceinfoArray);
        }
        //删除新增险种信息
        $scope.deletelistOptions=function(nowNumber){
            if ($scope.VO.insuranceinfo.length >= 1) {
                $scope.addDisabled = false;
                $scope.delDisabled = true;
            }
            layer.confirm('请确认是否要删除此险种？', {
                    btn: ['确定', '取消'], //按钮
                    btn2: function (index, layero) {
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function (index) {
                    $scope.VO.insuranceinfo.splice(nowNumber,1);
                    $scope.insurceInfoChange();
                    $scope.$apply();
                    layer.close(layer.index);
                }
            );
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

        $scope.changeAgentParamType = function () {
            if ($scope.VO.busi_type != null && $scope.VO.busi_type.name == '个人代理业务') {
                $scope.agentParam = {agentType: 2};
            } else {
                $scope.agentParam = null;
            }
        }

        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function (item) {
            if (item && item.id) {
                $scope.onCard(item.id);
            }
        };
        $scope.findOneData = function (pk) {
            layer.load(2);
            $scope.pk = pk;
            $rootScope.dataById = null;
            $scope.funCode = '3020501';
            $http.post($scope.basePath + "insuranceData/changeInsurance", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    $scope.VO = response.data;
                    $scope.insuranceinfoGridOptions.data = $scope.VO.insuranceinfo;
                    $scope.insurancedmanGridOptions.data = $scope.VO.insurancedman;
                    //保险公司
                    $scope.insurancemanGridOptions.data = $scope.VO.insuranceman;
                    //受益人
                    $scope.beneficiaryGridOptions.data = $scope.VO.beneficiary;
                    //子表可编辑
                    // $scope.childTableEnable(true);
                    $scope.isDw = false;
                    $scope.isClear = true;
                    $scope.form = true;
                    $scope.isGrid = false;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.isDisableds = true;
                    $scope.tabDisabled = true;
                    $scope.isBack = true;
                    $scope.isUploadAnytime = false;
                    $scope.initView();
                    if ($scope.VO.msg) {
                        layer.alert($scope.VO.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                } else {
                    if (response) {
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                let rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
    };

    $scope.initWatch = function () {

        $scope.$watch('VO.busi_type', function (newVal, oldVal) {
            if (!$scope.isEdit && !$scope.isUpdate) {
                return;
            }
            $scope.changeAgentParamType();
        }, true);

        $scope.$watch('VO.insuranceman', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.pkReport) {
                    return;
                }
                var data = $rootScope.diffarray(newVal, oldVal);
                if (data && data.col == 'insurancemanpk') {
                    if (data.row.insurancemanpk) {
                        if (data.row.insurancemanpk.pk && data.row.insurancemanpk.pk != data.oldValue.pk) {
                            if (data.row.insurancemanpk.c_0_address) {
                                data.row.insuranceaddr = data.row.insurancemanpk.c_0_address;
                            } else {
                                data.row.insuranceaddr = '不详';
                            }
                            $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: data.row.insurancemanpk.pk}).success(function (response) {
                                if (response && response.code == "200") {
                                    data.row.insuranceaddr = response.result.c0Address;
                                    if (response.result.linkman != null && response.result.linkman.length > 0) {
                                        if (response.result.linkman.length == 1){
                                            data.row.insurancelinkman = response.result.linkman[0].name;
                                            data.row.insurancelinktel = response.result.linkman[0].tele;
                                            if(data.row.insuranceaddr == null || data.row.insuranceaddr == '') {
                                                data.row.insuranceaddr = response.result.linkman[0].address;
                                            }
                                        }else{
                                            $scope.linkManOptions.data = response.result.linkman;
                                            $scope.insurancemanhashKey = data.row.$$hashKey;
                                            $scope.linkmanType = 'insurancemanOne';
                                            ngDialog.openConfirm({
                                                showClose: true,
                                                closeByDocument: false,
                                                template: 'view/pCarInsurance/choseLinkMan.html',
                                                className: 'ngdialog-theme-formInfo',
                                                scope: $scope,
                                                preCloseCallback: function (value) {

                                                    return true;
                                                }
                                            }).then(function (value) {

                                            }, function (reason) {

                                            });
                                        }
                                    }else{
                                        data.row.insurancelinkman = "";
                                        data.row.insurancelinktel = "";
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
                        } else {
                            data.row.insurancemanpk = '';
                        }
                    } else {
                        data.row.insurancelinkman = '';
                        data.row.insurancelinktel = '';
                    }
                    //收付款对象随保险人更改要求更新 2019年5月21日 苏长友
                    var length = $scope.paymentGridOptions.data.length;
                    if (length > 0 && $scope.VO.receivefeeperiod > 0) {

                        for (var i = 0; i < length; i++) {
                            for (var j = 0; j < oldVal.length; j++) {

                                if ($scope.paymentGridOptions.data[i].company.pk == oldVal[j].insurancemanpk.pk) {
                                    $scope.paymentGridOptions.data[i].company = newVal[j].insurancemanpk;
                                }

                            }
                        }

                    }
                }
            }
        }, true);

        $scope.$watch('VO.insurancebillkindNO', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['insurancebillkindNOName'] = $rootScope.SELECT.INSURANCEBILLKIND[newVal].name;
            }
        }, true);

        $scope.$watch('VO.estimatepk.name', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.estimatepk.c_0_address) {
                    $scope.VO.estimateaddr = $scope.VO.estimatepk.c_0_address;
                } else {
                    $scope.VO.estimateaddr = "";
                }
                //2022-07-21 mx 投保人弹框
                if ($scope.VO.estimatepk.pk) {
                    $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: $scope.VO.estimatepk.pk}).success(function (response) {
                        if (response && response.code == "200") {
                            $scope.VO.estimateaddr = response.result.c0Address;
                            if (response.result.linkman != null && response.result.linkman.length > 0) {
                                if (response.result.linkman.length == 1){
                                    $scope.VO.estimatelinkman = response.result.linkman[0].name;
                                    $scope.VO.estimatelinktel = response.result.linkman[0].tele;
                                    if($scope.VO.estimateaddr == null || $scope.VO.estimateaddr == ''){
                                        $scope.VO.estimateaddr = response.result.linkman[0].address;
								    }
                                }else{
                                    $scope.linkManOptions.data = response.result.linkman;
                                    $scope.linkmanType = 'estimatelinkmanOne';
                                    ngDialog.openConfirm({
                                        showClose: true,
                                        closeByDocument: false,
                                        template: 'view/pCarInsurance/choseLinkMan.html',
                                        className: 'ngdialog-theme-formInfo',
                                        scope: $scope,
                                        preCloseCallback: function (value) {

                                            return true;
                                        }
                                    }).then(function (value) {

                                    }, function (reason) {

                                    });
                                }
                            }else{
                                $scope.VO.estimatelinkman = "";
                                $scope.VO.estimatelinktel = "";
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
                        //重置投保人地址为保单库地址
                        if($scope.VO.insuranceData && $scope.VO.insuranceData.POSTAL_ADDRESS && $scope.VO.insuranceData.POSTAL_ADDRESS!=''){
                            $scope.VO.estimateaddr = $scope.VO.insuranceData.POSTAL_ADDRESS;
                        }
                    });
                }
            }
        }, true);


        $scope.$watch('VO.c4Insurancedmanpk.name', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;

			//2022-07-21 mx 被保人弹框
            if ($scope.isEdit) {
                    $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: $scope.VO.c4Insurancedmanpk.pk}).success(function (response) {
                        if (response && response.code == "200") {
                            $scope.VO.c4Insurancedmanaddr = response.result.c0Address;
                            if (response.result.linkman != null && response.result.linkman.length > 0) {
                                if (response.result.linkman.length == 1) {
                                    $scope.VO.c4Insurancedlinkman = response.result.linkman[0].name;
                                    $scope.VO.c4Insurancedlinktel = response.result.linkman[0].tele;
                                    if($scope.VO.c4Insurancedmanaddr == null || $scope.VO.c4Insurancedmanaddr == '') {
                                        $scope.VO.c4Insurancedmanaddr = response.result.linkman[0].address;
                                    }
                                }else{
                                    $scope.linkManOptions.data = response.result.linkman;
                                    $scope.linkmanType = 'c4InsurancedlinkmanOne';
                                    ngDialog.openConfirm({
                                        showClose: true,
                                        closeByDocument: false,
                                        template: 'view/pCarInsurance/choseLinkMan.html',
                                        className: 'ngdialog-theme-formInfo',
                                        scope: $scope,
                                        preCloseCallback: function (value) {

                                            return true;
                                        }
                                    }).then(function (value) {

                                    }, function (reason) {

                                    });
                                }
                            }else{
                                $scope.VO.c4Insurancedlinkman = "";
                                $scope.VO.c4Insurancedlinktel = "";
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
            }

        });
        $scope.$watch('VO.startdate', function (newVal, oldVal) {
            var oldDate = $filter('date')(oldVal, 'yyyy-MM-dd');
            var newDate = $filter('date')(newVal, 'yyyy-MM-dd');
            if (newVal === oldVal || newVal == undefined || newVal == null || newDate == oldDate) return;
            if ($scope.isEdit) {
                var now = new Date().getTime();
                var selected = new Date(newVal).getTime();
                var dates = (new Date(newVal).setFullYear(new Date(newVal).getFullYear() + 1));
                //如果结束日期已经有值了，那就不改变结束日期的值
                $scope.VO.enddate = $scope.VO.enddate!=null ? $scope.VO.enddate : new Date(dates).setDate(new Date(dates).getDate() - 1);
                var startDate = new Date($scope.VO.startdate).getTime();
                var endDate = new Date($scope.VO.enddate).getTime();
                var yearStart = new Date($scope.VO.startdate);
                var yearStart1 = new Date($scope.VO.startdate);
                var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                var time = yearEnd - yearStart.getTime();

            }
        }, true);
        /**
         * 保险人信息子表数据的监听事件  每次保险人信息子表有数值改变就要重新计算佣金总金额
         */
        $scope.$watch('insurancemanGridOptions.data', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            else {
                var array = $scope.insurancemanGridOptions.data;
                $scope.VO.receivefeemount = 0;
                for (var i = 0; i < array.length; i++) {
                    $scope.VO.receivefeemount = (eval($scope.VO.receivefeemount) + eval(array[i].feemount)).toFixed(2);
                }
            }


        }, true);
        $scope.$watch('VO.enddate', function (newVal, oldVal) {
            // || (!angular.isUndefined($scope.VO.pkReport))
            var oldDate = $filter('date')(oldVal, 'yyyy-MM-dd');
            var newDate = $filter('date')(newVal, 'yyyy-MM-dd');
            if (newVal === oldVal || newVal == undefined || newVal == null || newDate == oldDate) return;
            if ($scope.isEdit) {
                var startDate = new Date($scope.VO.startdate).getTime();
                var endDate = new Date($scope.VO.enddate).getTime();
                var yearStart = new Date($scope.VO.startdate);
                var yearStart1 = new Date($scope.VO.startdate);
                var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                var time = yearEnd - yearStart.getTime();

            }
        }, true);
        //应收佣金
        $scope.$watch('VO.receivefeeperiod', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            var reData = new Array();
            if ($scope.isEdit) {
                //删除本类型子表信息
                var length = $scope.paymentGridOptions.data.length;
                for (var i = 0; i < length; i++) {
                    if ($scope.paymentGridOptions.data[i].typeMoneyNO != 3) {
                        reData.push($scope.paymentGridOptions.data[i]);
                    }
                }
                if (!isNaN(newVal)) {
                    var array = $scope.insurancemanGridOptions.data;
                    for (var k = 0; k < array.length; k++) {
                        for (var i = 1; i <= newVal; i++) {
                            var data = {
                                stages: i,
                                typeMoneyNO: 3,
                                typeMoney: '应收佣金',
                                company: array[k].insurancemanpk,
                                typeCompany: '保险公司',
                                typeCompanyNO: 3
                            };
                            reData.push(data);
                        }
                    }
                }
                $scope.paymentGridOptions.data = reData;
            }
        }, true);
        $scope.$watch('VO.pkProject', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.pkProject.pk) {
                    $http.post($scope.basePath + "propertyProject/findOne", {pk: $scope.VO.pkProject.pk}).success(function (response) {
                        if (response && response.code == "200") {
                            if (response.result) {
                                $scope.VO.estimatepk = response.result.cinsureman;
                                $scope.VO.pkC0Tradetype = response.result.pkC0Tradetype;
                                $scope.VO.busi_type = response.result.busi_type;
                                $scope.VO.temporaryPlan = response.result.temporaryPlan;
                            }
                        }
                    });
                }
            }
        }, true);
        //应收保费
        $scope.$watch('VO.receiveperiod', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            var reData = new Array();
            if ($scope.isEdit) {
                //删除本类型子表信息
                var length = $scope.paymentGridOptions.data.length;
                for (var i = 0; i < length; i++) {
                    if ($scope.paymentGridOptions.data[i].typeMoneyNO != 1) {
                        reData.push($scope.paymentGridOptions.data[i]);
                    }
                }
                if (!isNaN(newVal)) {
                    for (var i = 1; i <= newVal; i++) {
                        var data = {
                            stages: i,
                            typeMoneyNO: 1,
                            typeMoney: '应收保费',
                            company: $scope.VO.estimatepk,
                            typeCompanyNO: 3,
                            typeCompany: '保险公司'
                        };
                        reData.push(data);
                    }
                }
                $scope.paymentGridOptions.data = reData;
            }
        }, true);
        //应解付保费总期数
        $scope.$watch('VO.payperiod', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            var reData = new Array();
            if ($scope.isEdit) {
                //删除本类型子表信息
                var length = $scope.paymentGridOptions.data.length;
                for (var i = 0; i < length; i++) {
                    if ($scope.paymentGridOptions.data[i].typeMoneyNO != 2) {
                        reData.push($scope.paymentGridOptions.data[i]);
                    }
                }
                if (!isNaN(newVal)) {
                    var array = $scope.insurancemanGridOptions.data;
                    for (var k = 0; k < array.length; k++) {
                        for (var i = 1; i <= newVal; i++) {
                            var data = {
                                stages: i,
                                typeMoneyNO: 2,
                                typeMoney: '解付保费',
                                company: array[k].insurancemanpk,
                                typeCompanyNO: 3,
                                typeCompany: '保险公司',
                                type_business: 1
                            };
                            reData.push(data);
                        }
                    }
                }
                $scope.paymentGridOptions.data = reData;
            }
        }, true);
        $scope.$watch('VO.insuranceinfo', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                let data = $rootScope.diffarray(newVal, oldVal);
                if (data && (data.col == 'insurancemoney' || data.col == 'vdef4' || data.col == 'insurancecharge' || data.col == 'commisionrate')) {
                    $scope.insurceInfoChange();
                }
                //单独修改佣金
                if(data && data.col == 'commisionnum'){
                    $scope.VO.commisiontotalnum = 0;
                    for (var i = 0; i < $scope.VO.insuranceinfo.length; i++) {
                        $scope.VO.commisiontotalnum = Number($scope.VO.commisiontotalnum) + Number($scope.VO.insuranceinfo[i].commisionnum);
                    }
                }
            }
        }, true);
    };

    $scope.initButton = function () {

        //数据自核功能（数据修改节点）
        $scope.onBillCheckBySelf = function () {

            if($scope.VO.id==null || $scope.VO.id==''){
                layer.msg("数据无效，请刷新页面再试！", {shift: 6,icon: 11});
            }

            layer.confirm('请确认自核是否通过！', {
                    btn: ['失败', '通过'], //按钮
                    btn2: function (index, layero) {
                        layer.load(2);
                        $http.post($scope.basePath + "dataModification/billCheckBySelf",
                            {
                                tableName: $scope.table_name,
                                id: $scope.VO.id,
                                state: 0,
                            }).success(function (response) {
                            layer.closeAll('loading');
                            if (response && response.code == 200) {

                                if(response.data.writeBack){
                                    $scope.VO.billCheckBySelfState = response.data.writeBack;
                                }

                                if(response.data.msg){
                                    layer.msg(response.data.msg, {shift: 6,icon: 11});
                                }
                            }
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    layer.load(2);
                    $http.post($scope.basePath + "dataModification/billCheckBySelf",
                        {
                            tableName: $scope.table_name,
                            id: $scope.VO.id,
                            state: 1,
                        }).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == 200) {

                            if(response.data.writeBack){
                                $scope.VO.billCheckBySelfState = response.data.writeBack;
                            }

                            if(response.data.msg){
                                layer.msg(response.data.msg, {shift: 6,icon: 11});
                            }
                        }
                    });
                }
            );
        }

        //联系人弹框确定按钮
        $scope.onChonseBusiType = function (){
            var rows = $scope.linkManOptions.gridApi.selection.getSelectedRows();
            if("estimatelinkmanOne" == $scope.linkmanType){
                if(rows && rows.length == 1){
                    $scope.VO.estimatelinkman = rows[0].name;
                    $scope.VO.estimatelinktel = rows[0].tele;
                    ngDialog.close();
                }else {
                    layer.alert("只能选择一条投保人联系人信息!", {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
            if("c4InsurancedlinkmanOne" == $scope.linkmanType){
                if(rows && rows.length == 1){
                    $scope.VO.c4Insurancedlinkman = rows[0].name;
                    $scope.VO.c4Insurancedlinktel = rows[0].tele;
                    ngDialog.close();
                }else {
                    layer.alert("只能选择一条被保人联系人信息!", {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
            if("insurancemanOne" == $scope.linkmanType){
                if (rows && rows.length == 1) {
                    for (let i = 0; i < $scope.insurancemanGridOptions.data.length; i++) {
                        if ($scope.insurancemanGridOptions.data[i].$$hashKey == $scope.insurancemanhashKey){
                            $scope.insurancemanGridOptions.data[i].insurancelinkman = rows[0].name;
                            $scope.insurancemanGridOptions.data[i].insurancelinktel = rows[0].tele;
                        }
                    }
                    ngDialog.close();
                } else {
                    layer.alert("只能选择一条保险人联系人信息!", {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }

        }

        $scope.onCancelBusiType = function (){
            ngDialog.close();
        }

        $scope.onRenewal = function () {
            //  控制字表按钮的显示
            $scope.isClear = false;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.isGrid = false;
                $scope.form = true;
                $scope.findOne(rows[0].id, function () {
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.VO.payment = [];

                    $scope.VO.billstatus = 31;
                    $scope.VO.pkOperator = $rootScope.userVO;
                    $scope.VO.operateDate = new Date().format("yyyy-MM-dd");
                    $scope.VO.operateTime = new Date().format("yyyy-MM-dd HH:mm:ss");
                    $scope.VO.receivefeeperiod = null;
                    $scope.VO.payperiod = null;
                    $scope.VO.receiveperiod = null;
                    $scope.VO.insuranceinfono = null;
                    $scope.VO.insuranceno = null;
                    $scope.VO.id = null;

                    $scope.paymentGridOptions.data = [];
                    $scope.dealAttachmentBGridOptions.data = [];
                    $scope.gridApi.selection.getSelectedRows()[0] = $scope.VO;
                });


            } else {

                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
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
        /*  $scope.onQuery = function () {
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
            $scope.form = true;
            $scope.isClear = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.isUploadAnytime = false;
            $scope.agentParam = null;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
            //2022-07-07 mx 初始化删除险种按钮不可用
            $scope.delDisabled=true;
        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            //2022-07-07 mx 增加、删除险种按钮是否可用
            if($scope.VO.insuranceinfo.length>=2){
                $scope.addDisabled = true;
                $scope.delDisabled = false;
            }
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            $scope.saveEmpty = true;
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
            $scope.VO.payment = $scope.paymentGridOptions.data;
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
                    $scope.paymentGridOptions.data = response.result.payment;
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
                    $http.post($scope.basePath + "pCarInsurance/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
         * 保存判断必输项
         */
        $scope.onSave = function () {
            $scope.VO.insuranceStatus = 1;
            if ($scope.isUploadAnytime) {
                $scope.onSaveVO();
                return;
            }
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    $scope.onCheckInsuranceno();
                    //2022-07-07 mx 判断险种是否重复
                    if ($scope.VO.insuranceinfo.length>1){
                        if ($scope.VO.insuranceinfo[0].insurancepk.name == null || $scope.VO.insuranceinfo[0].insurancepk.name == '' || $scope.VO.insuranceinfo[1].insurancepk.name == null || $scope.VO.insuranceinfo[1].insurancepk.name == ''){
                            return layer.alert("险种名称不可为空！", {skin: 'layui-layer-lan', closeBtn: 1});
                        }else if($scope.VO.insuranceinfo[0].insurancepk.name == $scope.VO.insuranceinfo[1].insurancepk.name ){
                            return layer.alert("只能选择一个交强险，一个商业险！", {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }else if($scope.VO.insuranceinfo[0].insurancepk.name == null || $scope.VO.insuranceinfo[0].insurancepk.name == ''){
                        return layer.alert("险种名称不可为空！", {skin: 'layui-layer-lan', closeBtn: 1});
                    }

                    $scope.VO.insurancebillkindNOName = $rootScope.returnSelectName($scope.VO.insurancebillkindNO, "INSURANCEBILLKIND");
                    if ($scope.dealAttachmentBGridOptions.data.length == 0) {
                        return layer.alert("请上传附件！",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    $scope.saveEmpty = true;
                    var startdate = new Date($scope.VO.startdate).getTime();
                    var enddate = new Date($scope.VO.enddate).getTime();
                    if (startdate > enddate) {
                        return layer.alert("开始日期不能大于结束日期!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    var operateDate = new Date($scope.VO.operateDate).format("yyyy-MM-dd");//制单日期
                    var arr1 = operateDate.split('-');
                    var arr2 = $scope.VO.startdate.split('-');//保险起始日期
                    arr1[1] = parseInt(arr1[1]);
                    arr1[2] = parseInt(arr1[2]);
                    arr2[1] = parseInt(arr2[1]);
                    arr2[2] = parseInt(arr2[2]);
                    var flag = true;
                    if (arr1[0] == arr2[0]){
                        if (arr2[1] - arr1[1] > 3){
                            flag = false;
                        }else if(arr2[1] - arr1[1] == 3){
                            if (arr2[2] > arr1[2]){
                                flag = false;
                            }
                        }
                    }else{
                        if (arr2[0] - arr1[0] > 1){
                            flag = false;
                        }else if(arr2[0]-arr1[0] == 1){
                            if (arr1[1]<10){
                                flag= false;
                            }else if(arr1[1] + 3 - arr2[1] < 12){
                                flag = false;
                            }else if(arr1[1] + 3 - arr2[1] == 12){
                                if (arr2[2] > arr1[2]){
                                    flag = false;
                                }
                            }
                        }
                    }
                    if (!flag){
                        return layer.alert("保单开始日期不能大于录入日期三个月", {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if (!$scope.VO.commisiontotalnum || $scope.VO.commisiontotalnum == 0) {
                        $scope.saveEmpty = false;
                        return layer.alert("交强险和商业险中二者其中一个佣金金额不能为空", {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if (!$scope.VO.insurancetotalcharge || $scope.VO.insurancetotalcharge == 0) {
                        $scope.saveEmpty = false;
                        return layer.alert("交强险和商业险中二者其中一个保费含税不能为空", {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.saveEmpty) {
                        if ($scope.insurancemanGridOptions.data.length > 0) {
                            var chiefmanY = 0;
                            var result = 0;
                            var totalFeemount = 0;
                            $scope.insuranceman = $scope.insurancemanGridOptions.data;
                            angular.forEach($scope.VO.insuranceman, function (item) {
                                if (item.feemount) {
                                    totalFeemount = eval(totalFeemount) + eval(item.feemount);
                                }
                                if (!item.insurancemanpk) {
                                    $scope.saveEmpty = false;
                                    return layer.alert("请录入保险人信息!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (item.chiefman == 'Y') {
                                    chiefmanY = chiefmanY + 1;

                                }
                                if (!item.insurancerate) {
                                    $scope.saveEmpty = false;
                                    chiefmanY = 1;
                                    return layer.alert("子表保险人信息中的承担比例不能为0.00%!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});

                                }
                                if (item.insurancerate < 0 || item.insurancerate > 100) {
                                    $scope.saveEmpty = false;
                                    chiefmanY = 1;
                                    return layer.alert("保险人信息子表保险保费加和不等于签单总保费!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                result = parseFloat(result) + parseFloat(item.insurancerate);
                            });
                            if (chiefmanY <= 0) {
                                $scope.saveEmpty = false;
                                return layer.alert("保险人信息子表必须有一个保险人主承保!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }/*else {
                                $scope.saveEmpty = true;
                            }*/
                            if (parseFloat($scope.VO.commisiontotalnum).toFixed(2) != parseFloat(totalFeemount).toFixed(2)) {
                                $scope.saveEmpty = false;
                                return layer.alert("险种信息子表佣金 加和不等于佣金总金额!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }/*else {

                            }*/
                            if (result != 100) {
                                $scope.saveEmpty = false;
                                return layer.alert("保险人信息子表保险保费加和不等于签单总保费！",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        } else {
                            $scope.saveEmpty = false;
                            return layer.alert("请录入保险人信息!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if ($scope.saveEmpty) {
                        if ($scope.paymentGridOptions.data.length <= 0) {
                            $scope.saveEmpty = false;
                            return layer.alert("收付款子表为空！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        } else {
                            var sum_Insurancemoney = 0;
                            var insuranceman = $scope.insurancemanGridOptions.data;
                            var payment = $scope.paymentGridOptions.data;
                            for (var i = 0; i < payment.length; i++) {
                                var pay = payment[i];
                                if (pay.stages == 1) {
                                    var count = 0;
                                    for (var k = 0; k < payment.length; k++) {
                                        var subpay = payment[k];
                                        if (subpay.typeMoneyNO == pay.typeMoneyNO && subpay.company.name == pay.company.name) {
                                            if (parseFloat(subpay.scaleMoney) > 100 || parseFloat(subpay.scaleMoney) < 0) {
                                                $scope.saveEmpty = false;
                                                return layer.alert("单项收付款比例不能小于0或者大于100!",
                                                    {skin: 'layui-layer-lan', closeBtn: 1});
                                            }
                                            count = parseFloat(count) + parseFloat(subpay.scaleMoney);
                                        }
                                    }
                                    if (count.toFixed(2) != 100) {
                                        return layer.alert("各收付款类型收付比例合计应等于100%!",
                                            {skin: 'layui-layer-lan', closeBtn: 1});
                                    }
                                }
                                if (!pay.planDate) {
                                    return layer.alert("子表属性计划日期不可为空！",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                var reg = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
                                var str = pay.planDate;
                                var arr = reg.exec((str));
                                if (angular.isDate(str)) {
                                    str = str.getFullYear() + '-' + (str.getMonth() + 1) + '-' + str.getDate();
                                }
                                if (!reg.test(str) && RegExp.$2 <= 12 && RegExp.$3 <= 31) {
                                    return layer.alert("子表属性计划日期格式错误",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }
                            if ($scope.VO.busi_type.name == '个人代理业务' && ($scope.VO.pkAgent == null || $scope.VO.pkAgent == '' || $scope.VO.pkAgent.name == null || $scope.VO.pkAgent.name == '')) {
                                return layer.alert("代理制项目必须选择执业人员！", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            //车辆信息校验
                            if (!$scope.VO.autoInfo[0].businessInsuranceno && !$scope.VO.autoInfo[0].mandatoryInsuranceno) {
                                return layer.alert("车辆基本信息必须填写交强险或商业险保单号！", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if ($scope.VO.autoInfo[0].licenseNumber == null || $scope.VO.autoInfo[0].licenseNumber == '') {
                                return layer.alert("车辆基本信息必须填写车辆牌照！", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if ($scope.VO.autoInfo[0].modelType == null || $scope.VO.autoInfo[0].modelType == '') {
                                return layer.alert("车辆基本信息必须填写车辆型号！", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if ($scope.VO.autoInfo[0].engineNumber == null || $scope.VO.autoInfo[0].engineNumber == '') {
                                return layer.alert("车辆基本信息必须填写发动机号！", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if ($scope.VO.autoInfo[0].vin == null || $scope.VO.autoInfo[0].vin == '') {
                                return layer.alert("车辆基本信息必须填写车架号！", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if ($scope.saveEmpty) {
                                // 如果是暂存的数据时，需要修正单据状态
                                if ($scope.VO.billstatus == 37) {
                                    $scope.VO.billstatus = 31;
                                }
                                $scope.onSaveVO();
                            }

                        }
                    }


                }
            }, true);
        };

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            if ($scope.QUERY["startdate^gte"] && $scope.QUERY["startdate^lte"]) {
                if (new Date($scope.QUERY["startdate^gte"]) > new Date($scope.QUERY["startdate^lte"])) {
                    return layer.alert("结束时间必须大于开始时间!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
            if ($scope.QUERY["enddate^gte"] && $scope.QUERY["enddate^lte"]) {
                if (new Date($scope.QUERY["enddate^gte"]) > new Date($scope.QUERY["enddate^lte"])) {
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
        $scope.insurceInfoChange = function () {

            $scope.VO.insurancetotalmoney = 0;
            $scope.VO.insurancetotalcharge = 0;
            $scope.VO.commisiontotalnum = 0;

            //修改险种信息表 保险金额 赔偿限额 后清空收付款信息 重新增加
            $scope.VO.receivefeeperiod = 0;
            for (var i = 0; i < $scope.VO.insuranceinfo.length; i++) {
                if (!$scope.VO.insuranceinfo[i].insurancemoney) {
                    $scope.VO.insuranceinfo[i].insurancemoney = 0;
                }
                //费率 = 保费/保额 * 1000
                if ($scope.VO.insuranceinfo[i].insurancecharge == '00' || $scope.VO.insuranceinfo[i].insurancemoney == '00') {
                    $scope.VO.insuranceinfo[i].chargerate = 0;
                } else {
                    $scope.VO.insuranceinfo[i].chargerate = Number(($scope.VO.insuranceinfo[i].insurancecharge / $scope.VO.insuranceinfo[i].insurancemoney * 1000).toFixed(2));
                }
                //保费不含税 = 保费/1.06
                $scope.VO.insuranceinfo[i].noTaxInsuranceCharge = Number(($scope.VO.insuranceinfo[i].insurancecharge / 1.06).toFixed(2));
                //佣金计算 = 保费 * 佣金率 / 100
                if ($scope.VO.insuranceinfo[i].vdef4 == 'Y') {
                    if($scope.VO.insuranceinfo[i].noTaxInsuranceCharge != 0){
                        if($scope.VO.insuranceinfo[i].commisionrate != 0){
                            $scope.VO.insuranceinfo[i].commisionnum = Number((($scope.VO.insuranceinfo[i].commisionrate)/100) * $scope.VO.insuranceinfo[i].noTaxInsuranceCharge).toFixed(2);
                        }else{
                            $scope.VO.insuranceinfo[i].commisionnum = 0;
                        }
                    }else{
                        $scope.VO.insuranceinfo[i].commisionnum = 0;
                        $scope.VO.insuranceinfo[i].commisionrate = 0;
                    }
                } else {
                    if($scope.VO.insuranceinfo[i].insurancecharge != 0){
                        if($scope.VO.insuranceinfo[i].commisionrate != 0){
                            $scope.VO.insuranceinfo[i].commisionnum = Number((($scope.VO.insuranceinfo[i].commisionrate)/100) * $scope.VO.insuranceinfo[i].insurancecharge).toFixed(2);
                        }else{
                            $scope.VO.insuranceinfo[i].commisionnum = 0;
                        }
                    }else{
                        $scope.VO.insuranceinfo[i].commisionnum = 0;
                        $scope.VO.insuranceinfo[i].commisionrate = 0;
                    }
                }
                $scope.VO.insurancetotalmoney = Number($scope.VO.insurancetotalmoney) + Number($scope.VO.insuranceinfo[i].insurancemoney);
                $scope.VO.insurancetotalcharge = Number($scope.VO.insurancetotalcharge) + Number($scope.VO.insuranceinfo[i].insurancecharge);
                $scope.VO.commisiontotalnum = Number($scope.VO.commisiontotalnum) + Number($scope.VO.insuranceinfo[i].commisionnum);

                //增加车船税金额
                if (!$scope.isreplace) {
                    if($scope.VO.insuranceinfo[i].vehicleVesselTax){
                        $scope.VO.insurancetotalcharge = parseFloat($scope.VO.insurancetotalcharge) + parseFloat($scope.VO.insuranceinfo[i].vehicleVesselTax);
                    }
                }
            }
            if ($scope.VO.payment.length > 0) {
                for (var i = 0; i < $scope.VO.payment.length; i++) {
                    $scope.VO.payment[i].scaleMoney = '';
                    $scope.VO.payment[i].planDate = '';
                }
            }

        };

        /**
         * 子表新增
         */
        $scope.onAddLine = function () {
            var data = {};

            if ($scope.selectTabName == 'insurancemanGridOptions') {
                data.replace = 'N';
                data.vdef4 = 'N';
                data.vdef2 = 'N';
                data.pay = 'N';
                if ($scope.insurancemanGridOptions.data.length == 0) {
                    data.chiefman = 'Y';
                    data.maininsurance = 'Y';
                } else {
                    data.chiefman = 'N';
                }
                $scope[$scope.selectTabName].data.push(data);
            } else {
                $scope[$scope.selectTabName].data.push(data);
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
        $scope.isreplace = true;
        //控制附件上传和下载
        $scope.upOrDown = false;

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
            showGridFooter: true,
            showColumnFooter: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '个人车险信息.csv',
            columnDefs: [
                {name: 'billCheckBySelfState', displayName: '自查状态', width: 100,cellFilter: 'SELECT_BILLCHECKBYSELFSTATETYPE'},
                {
                    name: 'insuranceinfono',
                    displayName: '保单信息编号',
                    width: 100,
                    footerCellTemplate: '<div class="ui-grid-cell-contents">合计</div>>'
                },
                {name: 'pk_project_name', displayName: '业务/项目名称', width: 100,},
                {name: 'pk_project_code', displayName: '立项号 ', width: 100,},
                {name: 'pkC0Tradetype_name', displayName: '客户产权关系 ', width: 100,},
                {name: 'busi_type_name', displayName: '业务分类 ', width: 100,},
                {name: 'insuranceno', displayName: '保单名称', width: 100,},
                {name: 'insurancebillkindNO', displayName: '保单性质', width: 100, cellFilter: 'SELECT_INSURANCEBILLKIND'},
                {name: 'estimatepk_name', displayName: '投保人', width: 100,},
                {name: 'estimateaddr', displayName: '投保人地址', width: 100,},
                {name: 'estimatelinkman', displayName: '投保人联系人姓名', width: 100,},
                {name: 'estimatelinktel', displayName: '投保人联系人电话', width: 100,},
                {name: 'c_4_insurancedmanpk_name', displayName: '被保人', width: 100,},
                // {name: 'c4Insurancedlinkman', displayName: '被保人联系人', width: 100,},
                // {name: 'c4Insurancedmanaddr', displayName: '被保人地址', width: 100,},
                // {name: 'c4Insurancedlinktel', displayName: '被保人联系人电话', width: 100,},
                {name: 'vdef1', displayName: '车辆台数', width: 100,},
                {name: 'startdate', displayName: '保险起始日期', width: 100,},
                {name: 'enddate', displayName: '保险到期日期', width: 100,},
                {
                    name: 'insurancetotalmoney',
                    displayName: '保险金额/赔偿限额/(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'insurancetotalcharge',
                    displayName: '签单总保费(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'commisiontotalnum',
                    displayName: '佣金总金额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'receivefeeperiod', displayName: '应收佣金总期数', width: 100,},
                {
                    name: 'receivemount',
                    displayName: '应收保费总额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'payperiod', displayName: '应解付保费总期数', width: 100,},
                {
                    name: 'paymount',
                    displayName: '应解付总额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'paymount',
                    displayName: '应解付总额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'receiveperiod', displayName: '应收保费总期数', width: 100,},
                {
                    name: 'receivefeemount',
                    displayName: '应收佣金总额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'c_4_cartaxmount',
                    displayName: '应收车船税总额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'c_4_uncartaxmount',
                    displayName: '未收车船税总额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'c_4_paycartaxmount',
                    displayName: '应解付车船税总额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'c_4_unpaycartaxmount',
                    displayName: '未解付车船税总额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'c_4_cartaxfeemount',
                    displayName: '应收车船税手续费总额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'c_4_uncartaxfeemount',
                    displayName: '未收车船税手续费总额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator_name', displayName: '经办人', width: 100,},
                {name: 'operate_date', displayName: '制单日期', width: 100,},
                {name: 'operate_time', displayName: '制单时间', width: 100,},
                {name: 'pkAuditor_name', displayName: '审核人', width: 100,},
                {name: 'audit_date', displayName: '审核日期', width: 100,},
                {name: 'audit_time', displayName: '审核时间', width: 100,},
                {name: 'pkOrg_name', displayName: '业务单位', width: 100,},
                {name: 'pkDept_name', displayName: '部门', width: 100,},
                {name: 'insurancepkName', displayName: '险种名称', width: 100, },
                {name: 'busiType1', displayName: '一级业务分类', width: 100,},
                {name: 'busiType2', displayName: '二级业务分类', width: 100,},
                {name: 'busiType3', displayName: '三级业务分类', width: 100,},
                {name: 'sumReceivemount', displayName: '已收保费总金额', width: 100,},
                {name: 'sumPayment', displayName: '已解付保费总金额', width: 100,},
                {name: 'sumReceivefeemount', displayName: '已收佣金总金额', width: 100,},
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

        $scope.linkManOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationCurrentPage: 1,
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {name: 'name', displayName: '联系人姓名',width:150},
                {name: 'tele', displayName: '联系人电话',width:150},
            ],
            data:[],
            onRegisterApi: function (gridApi) {
                $scope.linkManOptions.gridApi = gridApi;
            }
        };

        $scope.autoInfoGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'businessInsuranceno', displayName: '商业险保单号', width: 100,
                },
                {
                    name: 'mandatoryInsuranceno', displayName: '交强险保单号', width: 100,
                },
                {
                    name: 'licenseNumber', displayName: '车辆牌照', width: 100,
                },

                {name: 'modelType', displayName: '车辆型号', width: 100},
                {
                    name: 'engineNumber', displayName: '发动机号', width: 100
                },
                {
                    name: 'vin', displayName: '车架号', width: 100
                },
                {
                    name: 'ifOnline', displayName: '互联网标识', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'ifFarm', displayName: '涉农标识', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO


                },
            ],
            data: $scope.VO.autoInfo,
            onRegisterApi: function (gridApi) {
                $scope.autoInfoGridOptions.gridApi = gridApi;
            }
        };

        $scope.insurancemanGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'insurancemanpk.name',
                    displayName: '保险人名称',
                    width: 100,
                    url: 'insuranceCustomerRef/queryForGrid'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'insurancemanpk'

                },
                {
                    name: 'insuranceaddr', displayName: '保险人地址', width: 100


                },
                {
                    name: 'insurancelinkman', displayName: '保险人联系人姓名', width: 100


                },
                {
                    name: 'insurancelinktel', displayName: '保险人联系电话', width: 100


                },
                {
                    name: 'replace', displayName: '是否代收保费', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'pay', displayName: '是否全额解付', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                /*            {
                                name: 'vdef4', displayName: '保费金额不含增值税', width: 100, cellFilter: 'SELECT_YESNO'
                                , editableCellTemplate: 'ui-grid/dropdownEditor'
                                , editDropdownValueLabel: 'name'
                                , editDropdownOptionsArray: getSelectOptionData.YESNO
                            },
                            {
                                name: 'vdef2', displayName: '佣金金额不含增值税', width: 100, cellFilter: 'SELECT_YESNO'
                                , editableCellTemplate: 'ui-grid/dropdownEditor'
                                , editDropdownValueLabel: 'name'
                                , editDropdownOptionsArray: getSelectOptionData.YESNO
                            },*/

                {
                    name: 'insurancerate', displayName: '承保比例(%)', width: 100


                },
                {
                    name: 'vdef1',
                    displayName: '保险金额/赔偿限额(元)',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }

                },
                {
                    name: 'insurancemoney', displayName: '保险保费(含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'feemount', displayName: '佣金金额(含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                /*  {
                      name: 'commisionrate', displayName: '佣金比例(%)', width: 100, cellFilter: 'number:2'


                  },
                  {
                      name: 'feemount', displayName: '佣金金额(含税)(元)', width: 100,   cellFilter: 'AMOUNT_FILTER',
                      cellClass: function () {
                          return "lr-text-right"
                      }


                  },*/
                {
                    name: 'chiefman', displayName: '是否主承保', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'memo', displayName: '备注', width: 100


                },
            ],
            data: $scope.VO.insuranceman,
            onRegisterApi: function (gridApi) {
                $scope.insurancemanGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {

                        //@zhangwj 参照类单元格不可以手动输入
                        if(colDef.name.indexOf(".name") > 0){
                            let colName = colDef.name.replaceAll(".name","");
                            if(rowEntity[colName] == null ||rowEntity[colName].pk == null || rowEntity[colName].pk == ''){
                                rowEntity[colName] = {};
                            }
                        }

                        if (rowEntity.insurancerate == null) {
                            rowEntity.insurancerate = 0;
                        }
                        rowEntity.vdef1 = (eval($scope.VO.insurancetotalmoney) * eval(rowEntity.insurancerate) / 100).toFixed(2);
                        rowEntity.insurancemoney = (eval($scope.VO.insurancetotalcharge) * eval(rowEntity.insurancerate) / 100).toFixed(2);
                        rowEntity.feemount = ($scope.VO.commisiontotalnum * eval(rowEntity.insurancerate) / 100).toFixed(2);
                        if ($scope.VO.payment.length > 0) {
                            for (var i = 0; i < $scope.VO.payment.length; i++) {
                                $scope.VO.payment[i].scaleMoney = '';
                                $scope.VO.payment[i].planDate = '';
                            }
                        }
                        var inData = $scope.insurancemanGridOptions.data;
                        $scope.VO.paymount = $scope.calPay(inData);
                        $scope.VO.receivemount = $scope.calReceivemount(inData);

                        $scope.VO.receivefeemount = 0;
                        for (var i = 0; i < inData.length; i++) {
                            $scope.VO.receivefeemount = $scope.VO.receivefeemount + parseFloat(inData[i].feemount);
                        }
                        $scope.VO.receivefeeperiod = 0;
                        $scope.VO.payperiod = 0;
                        $scope.VO.receiveperiod = 0;
                        $scope.VO.payment = [];
                        $scope.paymentGridOptions.data = [];

                        if ('replace' == colDef.name) {
                            if (rowEntity.replace) {
                                $scope.VO.receivemount = 0;
                                let inData = $scope.insurancemanGridOptions.data;
                                if (rowEntity.replace == 'Y') {
                                    angular.alert("确认代收保费，并确认代收金额!");
                                    $scope.isreplace = false;
                                } else {
                                    $scope.VO.receiveperiod = 0;//应收保费总期数
                                    $scope.VO.payperiod = 0;//应解付保费总期数
                                    rowEntity.pay = 'N';
                                    $scope.isreplace = true;
                                }
                                $scope.insurceInfoChange();
                                $scope.VO.paymount = $scope.calPay(inData);
                                $scope.VO.receivemount = $scope.calReceivemount(inData);
                            }
                        }

                        $scope.$apply();
                    });
                }
            }
        };
        $scope.partnerGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'cooperativer', displayName: '合作伙伴', width: 100


                },
                {
                    name: 'cooperativeraddr', displayName: '合作伙伴地址', width: 100


                },
                {
                    name: 'cooperativerlinkman', displayName: '合作伙伴联系人姓名', width: 100


                },
                {
                    name: 'cooperativerlinktel', displayName: '合作伙伴联系人电话', width: 100


                },
                {
                    name: 'memo', displayName: '备注', width: 100


                },
            ],
            data: $scope.VO.partner,
            onRegisterApi: function (gridApi) {
                $scope.partnerGridOptions.gridApi = gridApi;
            }
        };
        $scope.paymentGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'stages', displayName: '期数', width: 100


                },
                {
                    name: 'typeMoneyNO', displayName: '收付款类型', width: 100, cellFilter: 'SELECT_TYPEMONEY'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.TYPEMONEY
                },
                {
                    name: 'company.name', displayName: '收付款对象名称', width: 100


                },
                {
                    name: 'typeCompanyNO', displayName: '收付款对象类型', width: 100, cellFilter: 'SELECT_CUSTOMERTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.CUSTOMERTYPE
                },
                {
                    name: 'scaleMoney', displayName: '收付款比例(%)', width: 100


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
                {
                    name: 'factDate', displayName: '结算日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'vsettlebillno', displayName: '业务结算单号', width: 100


                },
            ],
            data: $scope.VO.payment,
            onRegisterApi: function (gridApi) {
                $scope.paymentGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if ('scaleMoney' == colDef.name) {
                            if (rowEntity.scaleMoney) {
                                var array = $scope.paymentGridOptions.data;
                                $scope.VO.insuranceman = $scope.insurancemanGridOptions.data;
                                for (var i = 0; i < array.length; i++) {
                                    if (rowEntity.typeMoneyNO == 1) {
                                        rowEntity.planMoney = (eval($scope.VO.receivemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                        rowEntity.noPaymentMoney = (eval($scope.VO.receivemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                    }
                                    for (var j = 0; j < $scope.VO.insuranceman.length; j++) {
                                        if (array[i].company.name == $scope.VO.insuranceman[j].insurancemanpk.name
                                            && array[i].$$hashKey == rowEntity.$$hashKey) {
                                            if (rowEntity.typeMoneyNO == 3) {
                                                rowEntity.planMoney = (eval($scope.VO.insuranceman[j].feemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                rowEntity.noPaymentMoney = (eval($scope.VO.insuranceman[j].feemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                            }
                                            if (rowEntity.typeMoneyNO == 2) {
                                                if ($scope.VO.insuranceman[j].pay != 'Y') {
                                                    if ($scope.VO.insuranceman.length > 1 && $scope.VO.insuranceman[j].chiefman != 'Y') {
                                                        rowEntity.planMoney = (eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        rowEntity.noPaymentMoney = (eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    } else if ($scope.VO.insuranceman.length > 1 && $scope.VO.insuranceman[j].chiefman != 'Y') {
                                                        rowEntity.planMoney = (eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        rowEntity.noPaymentMoney = (eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    } else {
                                                        rowEntity.planMoney = (eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        rowEntity.noPaymentMoney = (eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    }

                                                } else {
                                                    rowEntity.planMoney = (eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    rowEntity.noPaymentMoney = (eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                }
                                            }
                                        }
                                    }

                                }
                            }
                        }
                        $scope.$apply();
                    });
                }
            }
        };
        /**
         * 计算应收保费总额
         */
        $scope.calReceivemount = function (data) {
            var result = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i].replace == 'Y') {
                    if (!data[i].insurancemoney) {
                        data[i].insurancemoney = 0;
                    }
                    result = eval(parseFloat(result).toFixed(2)) + eval(parseFloat(data[i].insurancemoney).toFixed(2));
                }
            }
            return result.toFixed(2);
        }

        /**
         * 计算应解付总额
         * @param data
         */
        $scope.calPay = function (data) {
            var result = 0;
            var flag = false;
            for (var i = 0; i < data.length; i++) {
                var feemount = 0;
                var insurancemoney = 0;
                if (data[i].pay == 'Y') {
                    result = eval(parseFloat(result).toFixed(2)) + eval(parseFloat(data[i].insurancemoney).toFixed(2));
                } else if (data[i].pay != 'Y' && data[i].replace == 'Y') {
                    if (data[i].feemount) {
                        feemount = parseFloat(feemount) + parseFloat(data[i].feemount);
                    }
                    if (data[i].insurancemoney) {
                        insurancemoney = parseFloat(insurancemoney) + parseFloat(data[i].insurancemoney);
                    }
                    flag = false;
                    result = result + eval((parseFloat(insurancemoney) - parseFloat(feemount)).toFixed(2));
                }
            }
            if (flag) {
                return 0;
            }
            return result;
        }
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

        if ($scope.selectTabName == 'paymentGridOptions') {
            $scope.isShow = false;
        } else {
            $scope.isShow = true;
        }


        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {

            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }
    };
    $scope.selectTabName = "insurancemanGridOptions";
    $scope.table_name = "lr_insurancebill";
    $scope.billdef = "PCarInsurance";
    $scope.beanName = "insurance.InsurancebillServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();

    if (null != getDataById()) {
        var formId = getDataById();
        $scope.findOneData(formId);
    }

    function getDataById() {
        let dataById = $rootScope.dataById;
        if (dataById != null) {
            return dataById;
        }
        return null;
    }

    initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope, $rootScope);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);

});
app.controller('insurancemanGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('partnerGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('paymentGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('assistantGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
