/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('againInsuranceCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
        $scope.initData = function (data) {
            $scope.status = {open: true};
            $scope.initVO = function () {
                return {
                    insuranceinfo: [],
                    insurancedman: [],
                    insuranceman: [],
                    partner: [],
                    payment: [],
                    dealAttachmentB: [],
                    isbudget: 'N',
                    ifSubstitute: 'N',
                    currency: 'CNY',
                    billstatus: 31,
                    pkOperator: $rootScope.userVO,
                    pkOrg: $rootScope.orgVO,
                    pkDept: $rootScope.deptVO,
                    operateDate: new Date().format("yyyy-MM-dd"),
                    operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                    isContinue: 0,
                    dr: 0,
                    costscale: [],
                    coomedium: [],
                    insurancetype: "relife",
                    c1Execitem: "",
                    c1ExecitemNum: 0,
                    proofType: null,
                    proofText: null,
                };
            };
            $scope.entityVO = 'nc.vo.busi.InsurancebillVO';
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
            $scope.funCode = '130301';
            $scope.param = {
                pk_org_str: $rootScope.orgVO.pk,
                busi_type: "notNull"
            };
            $scope.proofTypeBox = [1,2,3];
        };

        $scope.projectRef =
            {
                id: $scope.$id,
                columnDefs: [
                    {
                        field: 'code',
                        displayName: '项目编号'
                    },
                    {
                        field: 'name',
                        displayName: '项目名称'
                    },
                    {
                        field: 'cinsureman_code',
                        displayName: '投保人编号'
                    },
                    {
                        field: 'cinsureman_name',
                        displayName: '投保人'
                    }

                ],
                data: ""
            };
        $scope.reportRef =
            {
                id: $scope.$id,
                columnDefs: [
                    {
                        field: 'approval_number',
                        displayName: '业务签报批复编号'
                    },
                    {
                        field: 'report_title',
                        displayName: '签报主题'
                    },
                    {
                        field: 'name',
                        displayName: '客户名称'
                    }
                ],
                data: ""
            };
        $scope.changeText = function () {
            $scope.VO.c1ExecitemNum = $scope.VO.c1Execitem.length;
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
                $http.post($rootScope.basePath + "propertyInsurance/checkWithEIMS", {data: angular.toJson($scope.VO)})
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
            $scope.onMove = function () {
                layer.load(2);
                $scope.VO.payment = $scope.paymentGridOptions.data;
                $http.post($rootScope.basePath + "againInsurance/mvPayment", {data: angular.toJson($scope.VO)})
                    .success(function (response) {
                        layer.closeAll('loading');
                    });
            };
            /**
             * Grid CSV全部导出，需查询所有数据
             * @param data
             */
            $scope.queryAllForGrid = function (data, fun, isPrint, etype) {
                layer.load(2);
                if (!$scope.queryData) {
                    $scope.queryData = $scope.gridOptions.columnDefs;
                }
                return $http.post($rootScope.basePath + "againInsurance/queryAllForGrid", {
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
                $scope.gridOptions.useExternalPagination = true;
                if (!$scope.queryData) {
                    $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
                }
                layer.load(2);
                $http.post($scope.basePath + "againInsurance/queryForGrid", {
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
                // if($scope.VO.pkInsurancebill!=null){
                //     $scope.pkInsurancebill  = $scope.VO.pkInsurancebill
                // }else {
                //     $scope.pkInsurancebill = '';
                // }
                $http.post($scope.basePath + "propertyInsurance/checkInsuranceno", {param: angular.toJson($scope.VO), "insureType": "relife"}).success(function (response) {
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
                        $http.post($scope.basePath + "againInsurance/discard", {pk: $scope.pk, billdef: $scope.billdef}).success(function (response) {
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
                $http.post($scope.basePath + "againInsurance/findOne", {pk: pk}).success(function (response) {
                    layer.closeAll('loading');
                    if (response && response.code == "200") {
                        angular.assignData($scope.VO, response.result);
                        $scope.insuranceinfoGridOptions.data = $scope.VO.insuranceinfo;
                        $scope.insurancedmanGridOptions.data = $scope.VO.insurancedman;
                        $scope.insurancemanGridOptions.data = $scope.VO.insuranceman;
                        $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                        $scope.partnerGridOptions.data = $scope.VO.partner;
                        $scope.paymentGridOptions.data = $scope.VO.payment;
                        if($scope.VO.proofType!=null && $scope.VO.proofType!=""){
                            $scope.proofTypeBox[parseInt($scope.VO.proofType)-1] = true;
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
                        //   layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                });
            };
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
            /*
             * 保存VO
             * */
            $scope.onSaveVO = function () {
                layer.load(2);
                $scope.VO.payment = $scope.paymentGridOptions.data;
                $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
                $http.post($rootScope.basePath + "againInsurance/save", {data: angular.toJson($scope.VO), funCode: $scope.funCode})
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

            $scope.checkboxChoosed = function (value) {
                $scope.VO.proofType = null;
                $scope.VO.proofText = null;
                for (let i = 0; i < 3; i++) {
                    if($scope.proofTypeBox[i] && value == i){
                        $scope.VO.proofType = value + 1;
                    }else{
                        $scope.proofTypeBox[i] = false;
                    }
                }
            }

            $scope.whetherMsg = function (startDate) {
                var now = new Date().getTime();
                var selected = new Date(startDate).getTime();
                var date = new Date(startDate);
                date.setFullYear(date.getFullYear() + 1);
                date.setDate(date.getDate() - 1);
                if($scope.VO.enddate == null || $scope.VO.enddate == ''){
                    $scope.VO.enddate = date;
                }
                // var dates = (new Date(startDate).setFullYear(new Date(startDate).getFullYear() + 1));
                // $scope.VO.enddate = new Date(dates).setDate(new Date(dates).getDate() - 1);
                if ($scope.VO.pkReport) {
                    return;
                }
                $scope.msgFlag = false;
                if (parseInt(((now - selected) / 24 / 3600 / 1000)) > 90) {
                    if ($scope.VO.pkReport == null || $scope.VO.pkReport == "") {
                        // $scope.VO.startdate = '2018-01-01';
                        if ($scope.VO.c_protype == '网省公司') {
                            if ($scope.VO.insuranceinfo) {
                                for (var i = 0; i < insuranceArr.length; i++) {
                                    for (var j = 0; j < $scope.VO.insuranceinfo.length; j++) {
                                        if (insuranceArr[i] == $scope.VO.insuranceinfo[j].code) {
                                            $scope.msgFlag = true;
                                            $scope.msg = "对于业务来源是【网省公司的非团车业务】并且子表保险险种信息的主险种在财产一切险、财产基本险、财产综合险、机器损坏险、供电责任险、公众责任险六个险种之内的，公司各单位经办人员应在保单起保日期之前及时将保单信息录入业务系统;对于超过时限录入系统，即“起保日期早于当前日期”的保单，需要通过业务签报管理页面进行报批，注意：选择签报类型时请选择【保单录入延时说明】进行报批！";
                                            break;
                                        } else {
                                            $scope.msgFlag = true;
                                            $scope.msg = "对于业务来源是【非网省公司的非团车业务】，公司各单位经办人员应在保单起保日期后65个工作日(90个自然日)内及时将保单信息录入业务系统;对于超过时限录入系统，即“当前日期-起保日期>60日”的保单，需要通过业务签报管理页面进行报批，注意：选择签报类型时请选择【保单录入延时说明】进行报批！";
                                            break;
                                        }
                                    }

                                }
                            }
                        } else {
                            $scope.msgFlag = true;
                            $scope.msg = "对于业务来源是【非网省公司的非团车业务】，公司各单位经办人员应在保单起保日期后65个工作日(90个自然日)内及时将保单信息录入业务系统;对于超过时限录入系统，即“当前日期-起保日期>90日”的保单，需要通过业务签报管理页面进行报批，注意：选择签报类型时请选择【保单录入延时说明】进行报批！";
                        }
                        if ($scope.msgFlag) {
                            $scope.childFlag = false;
                            angular.alert($scope.msg);
                        }

                    }
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
        };

        $scope.initWatch = function () {


            //险种信息如果手动输入没有主键，此处不允许手动输入
            $scope.$watch('VO.insuranceinfo', function (newVal, oldVal) {
                if (newVal === oldVal || newVal == undefined || newVal == null) return;

                if ($scope.isEdit && newVal.maininsurance != 'Y') {
                    var data = $rootScope.diffarray(newVal, oldVal);
                    if (data && data.col == 'insurancepk') {
                        if (data.row.insurancepk) {
                            if (data.row.insurancepk.pk == undefined) {
                                data.row.insurancepk = '';
                            }
                            //如果第一次选择了，第二次手动输入判断
                            else if (data.newValue.pk == data.oldValue.pk) {
                                data.row.insurancepk = '';
                            }

                        }
                    }
                }
            }, true);

            $scope.$watch('VO.vdef19', function (newVal, oldVal) {
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                if ($scope.isEdit) {
                    $scope.VO['vdef19Name'] = $rootScope.SELECT.REINSURANCETYPE[newVal].name;
                }
            }, true);

            $scope.$watch('VO.vdef13', function (newVal, oldVal) {
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                if ($scope.isEdit) {
                    $scope.VO['vdef13Name'] = $rootScope.SELECT.REINSURANCEBUSINESSTYPE[newVal].name;
                }
            }, true);

            $scope.$watch('VO.vdef12', function (newVal, oldVal) {
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                if ($scope.isEdit) {
                    $scope.VO['vdef12Name'] = $rootScope.SELECT.BUSINESSTYPE[newVal].name;
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

                    if ($scope.VO.estimatepk.pk) {
                        $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: $scope.VO.estimatepk.pk}).success(function (response) {
                            if (response && response.code == "200") {
                                if (response.result.linkman != null && response.result.linkman.length > 0) {
                                    $scope.VO.estimatelinkman = response.result.linkman[0].name;
                                    $scope.VO.estimatelinktel = response.result.linkman[0].tele;
                                }
                            }
                        });

                    } else {
                        $scope.VO.estimatelinkman = "";
                        $scope.VO.estimatelinktel = "";

                    }


                }
            }, true);
            $scope.$watch('VO.pkProject.name', function (newVal, oldVal) {
                if (!$scope.isEdit) {
                    return;
                }
                // $scope.VO.estimatepk = "";
                // $scope.VO.estimateaddr = "";
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                if ($scope.isEdit) {
                    if ($scope.VO.pkProject.pk) {
                        $http.post($scope.basePath + "propertyProject/findOne", {pk: $scope.VO.pkProject.pk}).success(function (response) {
                            if (response && response.code == "200") {
                                if (response.result) {
                                    $scope.VO.estimatepk = response.result.cinsureman;
                                    $scope.VO.pkC0Tradetype = response.result.pkC0Tradetype;
                                    $scope.VO.projectkind = response.result.pkC0Tradetype && response.result.pkC0Tradetype.name;
                                    $scope.VO.busi_type = response.result.busi_type;
                                    $scope.VO.temporaryPlan = response.result.temporaryPlan;
                                }
                            }
                        });
                    } else {
                        $scope.VO.estimatelinkman = "";
                    }
                }
            }, true);
            //应收保费
            $scope.$watch('VO.receiveperiod', function (newVal, oldVal) {
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                if ($scope.isEdit) {
                    var reData = new Array();
                    //删除本类型子表信息
                    var length = $scope.paymentGridOptions.data.length;
                    for (var i = 0; i < length; i++) {
                        if ($scope.paymentGridOptions.data[i].typeMoneyNO != 1) {
                            reData.push($scope.paymentGridOptions.data[i]);
                        }
                    }
                    if (!isNaN(newVal)) {
                        for (var i = 1; i <= newVal; i++) {
                            var data = {stages: i, typeMoneyNO: 1, typeMoney: '应收保费', company: $scope.VO.estimatepk, typeCompanyNO: 3, typeCompany: '保险公司'};
                            reData.push(data);
                        }
                    }
                    $scope.paymentGridOptions.data = reData;
                }
            }, true);
            //应解付保费总期数
            $scope.$watch('VO.payperiod', function (newVal, oldVal) {
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                if ($scope.isEdit) {
                    var reData = new Array();
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
                            if (array[k].replace == "Y") {
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
                }
            }, true);

            //90的校验
            $scope.$watch('VO.startdate', function (newVal, oldVal) {
                if (!$scope.isEdit) {
                    return;
                }
                // || (!angular.isUndefined($scope.VO.pkReport))
                if (newVal === oldVal || newVal == undefined || newVal == null) return;

                if ($scope.isEdit) {

                    var olddatval = "";
                    if (oldVal != null) {
                        olddatval = new Date(oldVal).format("yyyy-MM-dd");
                    }
                    var newdatval = "";
                    if (newVal != null) {
                        newdatval = new Date(newVal).format("yyyy-MM-dd");
                    }
                    if (newdatval == olddatval) {
                        return;
                    }
                    var parameterDate = newVal;
                    $scope.whetherMsg(parameterDate);

                    var startDate = new Date($scope.VO.startdate).getTime();
                    var endDate = new Date($scope.VO.enddate).getTime();
                    // var days = new Date($scope.VO.startdate).getFullYear();
                    // var yearStart = new Date(new Date($scope.VO.startdate).getFullYear(), 01, 01).getTime();
                    // var yearEnd = new Date(new Date($scope.VO.startdate).getFullYear(), 12, 31).getTime();
                    var yearStart = new Date($scope.VO.startdate);
                    var yearStart1 = new Date($scope.VO.startdate);
                    var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                    var time = yearEnd - yearStart.getTime();
                    if ($scope.insuranceinfoGridOptions.data) {
                        var insurancechargeNumber = 0;
                        for (var i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                            insurancechargeNumber = ($scope.insuranceinfoGridOptions.data[i].insurancemoney * $scope.insuranceinfoGridOptions.data[i].chargerate * (((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / (time / 24 / 3600 / 1000)).toFixed(2);
                            if (insurancechargeNumber != 0) {
                                $scope.insuranceinfoGridOptions.data[i].insurancecharge = insurancechargeNumber;
                            }
                        }
                    }
                }
            }, true);

            $scope.$watch('VO.enddate', function (newVal, oldVal) {
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                if ($scope.isEdit) {
                    var startDate = new Date($scope.VO.startdate).getTime();
                    var endDate = new Date($scope.VO.enddate).getTime();
                    var yearStart = new Date($scope.VO.startdate);
                    var yearStart1 = new Date($scope.VO.startdate);
                    var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                    var time = yearEnd - yearStart.getTime();
                    if ($scope.insuranceinfoGridOptions.data) {
                        var insurancechargeNumber = 0;
                        for (var i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                            insurancechargeNumber = ($scope.insuranceinfoGridOptions.data[i].insurancemoney * $scope.insuranceinfoGridOptions.data[i].chargerate * (((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / (time / 24 / 3600 / 1000)).toFixed(2);
                            if (insurancechargeNumber != 0) {
                                $scope.insuranceinfoGridOptions.data[i].insurancecharge = insurancechargeNumber;
                            }
                        }
                    }
                }
            }, true);
            $scope.$watch('VO.insurancedman', function (newVal, oldVal) {
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                if ($scope.isEdit) {
                    var data = $rootScope.diffarray(newVal, oldVal);
                    if (data && data.col == 'insurancedmanpk') {
                        if (data.row.insurancedmanpk) {
                            if (data.row.insurancedmanpk.pk && data.row.insurancedmanpk.pk != data.oldValue.pk) {
                                if (data.row.insurancedmanpk.c_0_address) {
                                    data.row.insurancedmanaddr = data.row.insurancedmanpk.c_0_address;
                                } else {
                                    data.row.insurancedmanaddr = '不详';
                                }
                                $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: data.row.insurancedmanpk.pk}).success(function (response) {
                                    if (response && response.code == "200") {
                                        if (response.result.linkman != null && response.result.linkman.length > 0) {
                                            data.row.insurancedmanlinkman = response.result.linkman[0].name;
                                            data.row.insurancedmanlinktel = response.result.linkman[0].tele;
                                        } else {
                                            data.row.insurancedmanlinkman = '不详';
                                            data.row.insurancedmanlinktel = '不详';
                                        }
                                    }
                                });
                            } else {
                                data.row.insurancedmanpk = '';
                            }
                        } else {
                            data.row.insurancedmanlinkman = '不详';
                            data.row.insurancedmanlinktel = '不详';
                        }
                    }
                }
            }, true);
            $scope.$watch('VO.insuranceman', function (newVal, oldVal) {
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                if ($scope.isEdit) {
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
                                        if (response.result.linkman != null && response.result.linkman.length > 0) {
                                            data.row.insurancelinkman = response.result.linkman[0].name;
                                            data.row.insurancelinktel = response.result.linkman[0].tele;
                                        } else {
                                            data.row.insurancelinkman = '不详';
                                            data.row.insurancelinktel = '不详';
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

                            //删除本类型子表信息
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
            //应收佣金
            $scope.$watch('VO.receivefeeperiod', function (newVal, oldVal) {
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                if ($scope.isEdit) {
                    var reData = new Array();
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


            /**
             * 返回业务签报批复编号查询URL
             */
            $scope.reportUrl = function (param) {
                return "reportRef/queryForGrid?pk_project=" + param;
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
                $scope.isClear = true;
                $scope.form = true;
                $scope.isGrid = false;
                $scope.isEdit = true;
                $scope.isDisabled = false;
                $scope.tabDisabled = true;
                $scope.isBack = true;
                $scope.isUploadAnytime = false;
                $scope.initView();
                angular.assignData($scope.VO, $scope.initVO());
                $rootScope.onAddCheck($scope);
                // $http.post($rootScope.basePath + "againInsurance/mvPayment")
                //     .success(function (response) {
                //         layer.closeAll('loading');
                //     });
            };
            /**
             * 修改
             */
            $scope.onEdit = function () {
                //  控制字表按钮的显示
                $scope.isEdit = true;
                $scope.isClear = false;
                $scope.childFlag = true;
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
                $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
                if (data) {
                    var tablename = $scope.table_name;
                    $http.post($rootScope.basePath + "temporary/insert", {data: angular.toJson(data), tablename: tablename}).success(function (response) {
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
                $http.post($scope.basePath + "workFlow/findOneFlowInfo", {pk: id, tableName: $scope.table_name}).success(function (response) {
                    layer.closeAll('loading');
                    if (response && response.code == "200") {
                        $scope.card = true;
                        if (!response.result.taskHis)
                            $scope.mess = false;
                        else
                            $scope.mess = true;
                        // angular.assignData($scope.VO, response.result);
                        $scope.findOne(id);
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
                $scope.isBack = true;
                $scope.isGrid = false;
                $scope.isCard = true;
            };
            $scope.onDelete = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length == 0) return layer.alert("请选择数据进行删除!", {skin: 'layui-layer-lan', closeBtn: 1});
                layer.alert('是否删除选中数据？', {
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
                        $http.post($scope.basePath + "againInsurance/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
                } else {
                    $scope.isGrid = false;
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = true;
                }

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
                if ($scope.isUploadAnytime) {
                    $scope.onSaveVO();
                    return;
                }
                ngVerify.check('appForm', function (errEls) {
                    if (errEls && errEls.length) {
                        return layer.alert("请先填写所有的必输项!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    } else {

                        $scope.VO.vdef19Name = $rootScope.returnSelectName($scope.VO.vdef19, "REINSURANCETYPE");
                        $scope.VO.vdef13Name = $rootScope.returnSelectName($scope.VO.vdef13, "REINSURANCEBUSINESSTYPE");
                        $scope.VO.vdef12Name = $rootScope.returnSelectName($scope.VO.vdef12, "BUSINESSTYPE");
                        $scope.childFlag = true;
                        //对当前日期与保单起始日期进行校验
                        var startdate = new Date($scope.VO.startdate).getTime();
                        var enddate = new Date($scope.VO.enddate).getTime();
                        if (startdate > enddate) {
                            return layer.alert("开始日期不能大于结束日期!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.pkReport) {
                            $scope.msgFlag = false;
                        }
                        if (!$scope.VO.pkReport || $scope.VO.pkReport == "") {
                            $scope.whetherMsg($scope.VO.startdate);
                        }
                        if ($scope.insuranceinfoGridOptions.data.length > 0) {
                            var maininsurance = 'N';
                            angular.forEach($scope.insuranceinfoGridOptions.data, function (item) {
                                if (item.maininsurance == 'Y') {
                                    maininsurance = 'Y';
                                }
                                if (!item.insurancepk && item.maininsurance == 'Y') {
                                    $scope.childFlag = false;
                                    return layer.alert("险种名称不能为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});

                                }
                            })
                            if (maininsurance == 'N') {
                                $scope.childFlag = false;
                                return layer.alert("保险险种信息子表中必须至少有一个主险种!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }

                        } else {
                            $scope.childFlag = false;
                            return layer.alert("请录再保险险种信息!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.childFlag) {
                            if ($scope.insurancedmanGridOptions.data.length > 0) {
                                angular.forEach($scope.insurancedmanGridOptions.data, function (item) {
                                    if (!item.insurancedmanpk) {
                                        $scope.childFlag = false;
                                        return layer.alert("子表属性再保险分出人不可为空！!",
                                            {skin: 'layui-layer-lan', closeBtn: 1});
                                    }

                                })
                            } else {
                                $scope.childFlag = false;
                                return layer.alert("请录入再保险分出人信息!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                        if ($scope.childFlag) {
                            if ($scope.insurancemanGridOptions.data.length > 0) {
                                //计算再保险接受人信息子表中的承包比例加和
                                /*    let array = $scope.insurancemanGridOptions.data;
                                    let totalInsurancerate =0;
                                    for (let i = 0; i < array.length; i++) {
                                        totalInsurancerate += parseFloat(array[i].insurancerate);
                                    }
                                    if (totalInsurancerate>100 || totalInsurancerate<100){
                                        return layer.alert("再保险接收人信息中的分保比例加和应等于100!",
                                            {skin: 'layui-layer-lan', closeBtn: 1});
                                    }*/
                                angular.forEach($scope.insurancemanGridOptions.data, function (item) {
                                    if (!item.insurancemanpk) {
                                        $scope.childFlag = false;
                                        return layer.alert("子表属性再保险接受人名称不可为空!",
                                            {skin: 'layui-layer-lan', closeBtn: 1});
                                    }
                                    if (item.insurancerate < 0 || item.insurancerate > 100) {
                                        $scope.childFlag = false;
                                        return layer.alert("请检查再保险接收人信息中的分保比例",
                                            {skin: 'layui-layer-lan', closeBtn: 1});

                                    }
                                    if (!item.chiefman) {
                                        $scope.childFlag = false;
                                        return layer.alert("保险人信息子表必须有一个保险人主承保!",
                                            {skin: 'layui-layer-lan', closeBtn: 1});
                                    }
                                })
                            } else {
                                $scope.childFlag = false;
                                return layer.alert("请录入再保险接受人信息!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }

                        if ($scope.childFlag) {
                            if ($scope.paymentGridOptions.data.length <= 0) {
                                $scope.childFlag = false;
                                return layer.alert("收付款子表为空！",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            } else {
                                var percent = 0;
                                for (var i = 0; i < $scope.paymentGridOptions.data; i++) {
                                    if (i = 0) {
                                        percent = eval(array[i].scaleMoney);
                                        continue;
                                    }
                                    if (array[i].company.name == array[i - 1].company.name) {
                                        percent = eval(percent) + eval(array[i].scaleMoney);
                                    } else {
                                        if (percent != 100) {
                                            $scope.childFlag = false;
                                            return layer.alert("保险人信息子表保险保费加和不等于签单总保费!",
                                                {skin: 'layui-layer-lan', closeBtn: 1});
                                        } else {
                                            percent = 0;
                                        }
                                    }
                                }
                                //非互联业务部业务都需要录入保险金额并且保险金额不为0
                                if ($scope.VO.busi_type.parentName.substring(0, 7) != "互联业务部业务" && ($scope.VO.insurancetotalmoneyOther == 0 || $scope.VO.insurancetotalmoneyOther == 0.00)) {
                                    return layer.alert("金额信息中的保险金额/赔偿限额/(元)不能为0！", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if ($scope.insuranceinfoGridOptions.data.length > 0) {
                                    let count1 = 0;
                                    let count2 = 0;
                                    $scope.childFlag = false;
                                    for (var i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                                        //非互联网业务数据子表保险金额0提示信息
                                        if ($scope.VO.busi_type.parentName.substr(0, 7) != "互联业务部业务" && ($scope.insuranceinfoGridOptions.data[i].insurancemoney == 0 || $scope.insuranceinfoGridOptions.data[i].chargerate == 0)) {
                                            count1++;
                                        }
                                        //互联网业务的数据可以不录入保险金额或0
                                        if ($scope.VO.busi_type.parentName.substr(0, 7) == "互联业务部业务" && ($scope.insuranceinfoGridOptions.data[i].insurancemoney == 0 || $scope.insuranceinfoGridOptions.data[i].chargerate == 0)) {
                                            count2++;
                                        }
                                        if (count1 > 0) {
                                            layer.confirm('请核实子表中“保险金额/赔偿限额”和“费率”信息，是否需要修改', {
                                                btn: ['是', '否'], //按钮
                                                btn2: function () {
                                                    if ($scope.msgFlag) {
                                                        angular.alert($scope.msg);
                                                        $scope.childFlag = false;
                                                    }
                                                    $scope.childFlag = true;
                                                    if ($scope.VO.billstatus == 37) {
                                                        $scope.VO.billstatus = 31;
                                                    }
                                                    if ($scope.childFlag) {
                                                        $scope.onSaveVO();
                                                    }
                                                },
                                                shade: 0.6,//遮罩透明度
                                                shadeClose: true,//点击遮罩关闭层
                                            }, function () {
                                                $scope.childFlag = false;
                                                if ($scope.childFlag == false) {
                                                    layer.msg('取消保存!', {
                                                        shift: 6,
                                                        icon: 11
                                                    });
                                                }
                                            })
                                        } else if (count2 > 0) {
                                            layer.confirm('请核实子表中“保险金额/赔偿限额”和“费率”信息，是否需要修改', {
                                                btn: ['是', '否'], //按钮
                                                btn2: function () {
                                                    if ($scope.msgFlag) {
                                                        angular.alert($scope.msg);
                                                        $scope.childFlag = false;
                                                    }
                                                    $scope.childFlag = true;
                                                    if ($scope.VO.billstatus == 37) {
                                                        $scope.VO.billstatus = 31;
                                                    }
                                                    if ($scope.childFlag) {
                                                        $scope.onSaveVO();
                                                    }
                                                },
                                                shade: 0.6,//遮罩透明度
                                                shadeClose: true,//点击遮罩关闭层
                                            }, function () {
                                                $scope.childFlag = false;
                                                if ($scope.childFlag == false) {
                                                    layer.msg('取消保存!', {
                                                        shift: 6,
                                                        icon: 11
                                                    });
                                                }
                                            })

                                        } else {
                                            $scope.childFlag = true;
                                        }

                                    }
                                }
                                if ($scope.dealAttachmentBGridOptions.data.length == 0) {
                                    return layer.alert("请上传附件！",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if ($scope.childFlag) {
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

            /**
             * 子表新增
             */
            $scope.onAddLine = function () {
                var data = {};
                if ($scope.selectTabName == 'insuranceinfoGridOptions') {
                    if ($scope.insuranceinfoGridOptions.data.length == 0) {
                        data.maininsurance = 'Y';
                    } else {
                        data.maininsurance = 'N';
                    }
                    data.chargerate = '0';
                    data.insurancecharge = '0';
                } else if ($scope.selectTabName == 'insurancemanGridOptions') {
                    data.replace = 'N';
                    data.vdef4 = 'N';
                    data.vdef2 = 'N';
                    data.pay = 'N';
                    data.ifIncludeCommission = 'Y';
                    $scope.VO.receivefeeperiod = 0;
                    if ($scope.insurancemanGridOptions.data.length == 0) {
                        data.chiefman = 'Y';
                    } else {
                        data.chiefman = 'N';
                    }
                } else if($scope.selectTabName == 'insurancedmanGridOptions'){
                    data.insurancemoney = 0;
                    data.insurancefee = 0;
                    data.additioninsurancecharge = 0;
                    for (let i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                        if($scope.insuranceinfoGridOptions.data[i].maininsurance == 'Y'){
                            data.insurancefee = data.insurancefee + parseFloat($scope.insuranceinfoGridOptions.data[i].insurancecharge);
                        }else{
                            data.additioninsurancecharge = data.additioninsurancecharge + parseFloat($scope.insuranceinfoGridOptions.data[i].insurancecharge);
                        }
                        data.insurancemoney = data.insurancemoney + parseFloat($scope.insuranceinfoGridOptions.data[i].insurancemoney);
                    }
                }
                $scope[$scope.selectTabName].data.push(data);

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
                if ($scope.selectTabName == "insurancemanGridOptions") {
                    var array = $scope.insurancemanGridOptions.data;
                    $scope.VO.insurancetotalchargeOther = 0;
                    $scope.VO.commisiontotalnum = 0;
                    if (array.length == 0) {
                        $scope.insurancemoney = 0;
                        $scope.feemount = 0;
                    } else {
                        $scope.insurancetotalcharge = 0;
                        $scope.insurancemoney = 0;

                        $scope.VO.commisiontotalnum = 0;
                        $scope.feemount = 0;
                        for (var j = 0; j < array.length; j++) {
                            $scope.VO.insurancetotalchargeOther = eval(parseFloat($scope.VO.insurancetotalchargeOther)) + eval(parseFloat(array[j].insurancemoney));
                            $scope.VO.commisiontotalnum = eval(parseFloat($scope.VO.commisiontotalnum)) + eval(parseFloat(array[j].feemount));

                        }
                    }
                    $scope.VO.insurancetotalchargeOther = $scope.VO.insurancetotalchargeOther.toFixed(2);
                    $scope.VO.receivefeemountOther = $scope.VO.commisiontotalnum.toFixed(2);
                    $scope.VO.receivefeeperiod = 0;
                }
                if ($scope.selectTabName == "insuranceinfoGridOptions") {
                    var array = $scope.insuranceinfoGridOptions.data;
                    $scope.VO.insurancetotalmoneyOther = 0;
                    if (array.length == 0) {
                        $scope.VO.insurancetotalchargeOldOther = 0;
                    } else {
                        $scope.VO.insurancetotalchargeOldOther = 0;
                        $scope.VO.insurancetotalmoneyOther = 0;
                        for (var i = 0; i < array.length; i++) {
                            $scope.VO.insurancetotalchargeOldOther = eval(parseFloat($scope.VO.insurancetotalchargeOldOther)) + eval(parseFloat(array[i].insurancecharge).toFixed(2));
                            if (array[i].maininsurance == 'Y') {
                                $scope.VO.insurancetotalmoneyOther = eval(parseFloat($scope.VO.insurancetotalmoneyOther)) + eval(parseFloat(array[i].insurancemoney).toFixed(2));
                            }
                        }
                    }
                }
            };
        };

        $scope.initPage = function () {
            $scope.form = false;
            $scope.isreplace = true;
            $scope.card = false;
            $scope.isClear = false;
            $scope.isGrid = true;
            $scope.isCard = false;
            $scope.isEdit = false;
            $scope.isDisabled = true;
            $scope.isShow = true;
            $scope.queryShow = true;
            $scope.upOrDown = false;
            $scope.isUploadAnytime = false;
            $scope.isreplace = true;
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
                exporterCsvFilename: '再保险保单信息.csv',
                columnDefs: [
                    {name: 'billCheckBySelfState', displayName: '自查状态', width: 100,cellFilter: 'SELECT_BILLCHECKBYSELFSTATETYPE'},
                    {name: 'insuranceinfono', displayName: '保单信息编号', width: 100,},
                    // {name: 'vdef16_name', displayName: '原保单号', width: 100,},
                    {name: 'pk_project_name', displayName: '业务/项目名称', width: 100,},
                    {name: 'approval_number', displayName: '业务签报批复编号', width: 100,},
                    {name: 'pk_project_code', displayName: '立项号 ', width: 100,},
                    {name: 'busi_type_name', displayName: '业务分类 ', width: 100,},
                    {name: 'pkC0Tradetype_name', displayName: '客户产权关系 ', width: 100,},
                    {name: 'insuranceno', displayName: '原/再保险保单号', width: 100, cellFilter: 'CSV_FILTER'},
                    {name: 'startdate', displayName: '保险起始日期', width: 100,},
                    {name: 'enddate', displayName: '保险到期日期', width: 100,},
                    {name: 'estimatepk_name', displayName: '投保人', width: 100,},
                    {name: 'estimateaddr', displayName: '投保人地址', width: 100,},
                    {name: 'estimatelinkman', displayName: '投保人联系人姓名', width: 100,},
                    {name: 'estimatelinktel', displayName: '投保人联系人电话', width: 100,},
                    {name: 'currency', displayName: '币种', width: 100, cellFilter: 'SELECT_CURRENCY'},
                    // {
                    //     name: 'commisiontotalnum', displayName: '佣金总金额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    //     cellClass: function () {
                    //         return "lr-text-right"
                    //     }
                    // },
                    {
                        name: 'receivefeemount_other', displayName: '佣金总金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'insurancetotalcharge_other', displayName: '签单总保费', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'insurancetotalmoney_other', displayName: '保险金额/赔偿限额', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'paymount_other', displayName: '应解付总额', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {name: 'payperiod', displayName: '应解付再保费总期数', width: 100,},
                    {
                        name: 'receivefeemount_other', displayName: '应收再保险佣金总额', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {name: 'receivefeeperiod', displayName: '应收再保险佣金总期数', width: 100,},
                    {
                        name: 'receivemount_other', displayName: '应收再保险保费总额', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {name: 'receiveperiod', displayName: '应收再保险保费总期数', width: 100,},
                    {name: 'vdef2', displayName: '是否有追溯期', width: 100, cellFilter: 'SELECT_YESNO'},
                    {
                        name: 'c1Compemountptimepperson', displayName: '累计赔偿限额', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {name: 'insurancesum', displayName: '保单件数', width: 100,},
                    // {name: 'c1Execitem', displayName: '执行条款', width: 100,},
                    {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                    {name: 'pkOperator_name', displayName: '经办人', width: 100,},
                    {name: 'operate_date', displayName: '制单日期', width: 100,},
                    {name: 'operate_time', displayName: '制单时间', width: 100,},
                    {name: 'pkChecker_name', displayName: '审批人', width: 100,},
                    {name: 'check_date', displayName: '审批日期', width: 100, cellFilter: 'date_cell_date'},
                    {name: 'pkOrg_name', displayName: '业务单位', width: 100,},
                    {name: 'pkDept_name', displayName: '部门', width: 100,},
                    {name: 'vdef12', displayName: '业务种类', width: 100, cellFilter: 'SELECT_BUSINESSTYPE'},
                    {name: 'vdef13', displayName: '业务类型', width: 100, cellFilter: 'SELECT_REINSURANCEBUSINESSTYPE'},
                    // {name: 'vdef17', displayName: '是否代收再保险费', width: 100, cellFilter: 'SELECT_YESNO'},
                    // {name: 'vdef18', displayName: '是否全额解付再保险费', width: 100, cellFilter: 'SELECT_YESNO'},
                    {name: 'vdef19', displayName: '再保险类型', width: 100, cellFilter: 'SELECT_REINSURANCETYPE'},
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

            $scope.selectTabName = 'insuranceinfoGridOptions';
            $scope.insuranceinfoGridOptions = {
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
                        name: 'maininsurance', displayName: '主险种', width: 100, cellFilter: 'SELECT_YESNO'
                        , editableCellTemplate: 'ui-grid/dropdownEditor'
                        , editDropdownValueLabel: 'name'
                        , editDropdownOptionsArray: getSelectOptionData.YESNO
                    },
                    {
                        name: 'insurancepk.name',
                        displayName: '险种名称',
                        width: 100,
                        url: "insuranceRef/queryForGrid",
                        params: {type: 'caichan'},
                        placeholder: '请选择',
                        editableCellTemplate: 'ui-grid/refEditor',
                        isTree: true,
                        popupModelField: 'insurancepk'
                        , cellEditableCondition: function ($scope, row) {
                            return $scope.row.entity.maininsurance == 'Y';
                        }
                    },
                    {
                        name: 'vdef1', displayName: '险种名称', width: 100, cellEditableCondition: function ($scope) {
                            return $scope.row.entity.maininsurance == 'N';
                        }
                    },
                    {
                        name: 'insurancemoney', displayName: '保险金额/赔偿限额', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'chargerate', displayName: '费率(‰)', width: 100, cellFilter: 'number:4'
                    },
                    {
                        name: 'insurancecharge', displayName: '保费含税', width: 100, cellFilter: 'AMOUNT_FILTER', enableCellEdit: true,
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'franchise', displayName: '免赔额', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'cMemo', displayName: '备注', width: 100
                    },
                ],
                data: $scope.VO.insuranceinfo,
                onRegisterApi: function (gridApi) {
                    $scope.insuranceinfoGridOptions.gridApi = gridApi;
                    if (gridApi.edit) {
                        gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                            var array = $scope.insuranceinfoGridOptions.data;
                            if ('maininsurance' == colDef.name) {
                                if (newValue == 'Y') {
                                    for (var i = 0; i < array.length; i++) {
                                        if (array[i].$$hashKey != rowEntity.$$hashKey) {
                                            array[i].maininsurance = 'N';
                                            array[i].insurancepk = {};
                                        } else {
                                            $scope.VO.insurancetotalmoneyOther = array[i].insurancemoney;
                                        }
                                    }
                                } else if (newValue == 'N') {
                                    for (var i = 0; i < array.length; i++) {
                                        if (array[i].$$hashKey == rowEntity.$$hashKey) {
                                            array[i].insurancepk = {};
                                        }
                                    }
                                }
                                // rowEntity.insurancecharge = rowEntity.insurancemoney*rowEntity.chargerate/1000;
                                $scope.VO.insurancetotalchargeOldOther = 0;
                                for (var i = 0; i < $scope.VO.insuranceinfo.length; i++) {
                                    $scope.VO.insurancetotalchargeOldOther = eval(parseFloat($scope.VO.insurancetotalchargeOldOther).toFixed(2)) + eval(parseFloat($scope.VO.insuranceinfo[i].insurancecharge).toFixed(2));
                                }
                                if ($scope.VO.insuranceman.length > 0) {
                                    for (var i = 0; i < $scope.VO.insuranceman.length; i++) {
                                        $scope.VO.insuranceman[i].vdef1 = ($scope.VO.insuranceman[i].insurancerate * $scope.VO.insurancetotalmoneyOther / 100).toFixed(2);
                                        $scope.VO.insuranceman[i].insurancemoney = ($scope.VO.insuranceman[i].insurancerate * $scope.VO.insurancetotalchargeOldOther / 100).toFixed(2);
                                    }
                                }
                                if ($scope.VO.payment.length > 0) {
                                    for (var i = 0; i < $scope.VO.payment.length; i++) {
                                        $scope.VO.payment[i].scaleMoney = '';
                                        $scope.VO.payment[i].planDate = '';
                                    }
                                }
                            } else if ('insurancemoney' == colDef.name) {
                                var startDate = new Date($scope.VO.startdate).getTime();
                                var endDate = new Date($scope.VO.enddate).getTime();
                                var yearStart = new Date($scope.VO.startdate);
                                var yearStart1 = new Date($scope.VO.startdate);
                                var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                                var time = yearEnd - yearStart.getTime();
                                rowEntity.insurancecharge = ((parseFloat(rowEntity.insurancemoney) * parseFloat(rowEntity.chargerate) * parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000))).toFixed(2);

                                if (rowEntity.maininsurance == 'Y') {
                                    $scope.VO.insurancetotalmoneyOther = newValue;
                                }
                                $scope.VO.insurancetotalchargeOldOther = 0;
                                for (var i = 0; i < array.length; i++) {
                                    $scope.VO.insurancetotalchargeOldOther = eval(parseFloat($scope.VO.insurancetotalchargeOldOther).toFixed(2)) + eval(parseFloat(array[i].insurancecharge).toFixed(2));
                                }
                                if ($scope.VO.insuranceman.length > 0) {
                                    for (var i = 0; i < $scope.VO.insuranceman.length; i++) {
                                        $scope.VO.insuranceman[i].vdef1 = ($scope.VO.insuranceman[i].insurancerate * $scope.VO.insurancetotalmoneyOther / 100).toFixed(2);
                                        $scope.VO.insuranceman[i].insurancemoney = ($scope.VO.insuranceman[i].insurancerate * $scope.VO.insurancetotalchargeOldOther / 100).toFixed(2);
                                    }
                                }
                                if ($scope.VO.payment.length > 0) {
                                    for (var i = 0; i < $scope.VO.payment.length; i++) {
                                        $scope.VO.payment[i].scaleMoney = '';
                                        $scope.VO.payment[i].planDate = '';
                                    }
                                }
                            } else if ('insurancecharge' == colDef.name) {
                                $scope.VO.insurancetotalchargeOldOther = 0;
                                for (var i = 0; i < array.length; i++) {
                                    $scope.VO.insurancetotalchargeOther = eval(parseFloat($scope.VO.insurancetotalchargeOldOther).toFixed(2)) + eval(parseFloat(array[i].insurancecharge).toFixed(2));
                                }
                                if ($scope.VO.insuranceman.length > 0) {
                                    for (var i = 0; i < $scope.VO.insuranceman.length; i++) {
                                        $scope.VO.insuranceman[i].vdef1 = (eval($scope.VO.insuranceman[i].insurancerate) * eval($scope.VO.insurancetotalmoneyOther) / 100).toFixed(2);
                                        $scope.VO.insuranceman[i].insurancemoney = (eval($scope.VO.insuranceman[i].insurancerate) * eval($scope.VO.insurancetotalchargeOther) / 100).toFixed(2);
                                        $scope.VO.insuranceman[i].feemount = (eval($scope.VO.insuranceman[i].commisionrate) * eval($scope.VO.insuranceman[i].insurancemoney) / 100).toFixed(2);
                                    }
                                }
                                if ($scope.VO.payment.length > 0) {
                                    for (var i = 0; i < $scope.VO.payment.length; i++) {
                                        $scope.VO.payment[i].scaleMoney = '';
                                        $scope.VO.payment[i].planDate = '';
                                    }
                                }
                            } else if ('chargerate' == colDef.name) {
                                var startDate = new Date($scope.VO.startdate).getTime();
                                var endDate = new Date($scope.VO.enddate).getTime();
                                var yearStart = new Date($scope.VO.startdate);
                                var yearStart1 = new Date($scope.VO.startdate);
                                var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                                var time = yearEnd - yearStart.getTime();
                                rowEntity.insurancecharge = (parseFloat(rowEntity.insurancemoney) * parseFloat(rowEntity.chargerate) * parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000)).toFixed(2);
                                $scope.VO.insurancetotalchargeOldOther = 0;
                                for (var i = 0; i < array.length; i++) {
                                    $scope.VO.insurancetotalchargeOldOther = eval(parseFloat($scope.VO.insurancetotalchargeOldOther).toFixed(2)) + eval(parseFloat(array[i].insurancecharge).toFixed(2));
                                }
                                if ($scope.VO.insuranceman.length > 0) {
                                    for (var i = 0; i < $scope.VO.insuranceman.length; i++) {
                                        $scope.VO.insuranceman[i].vdef1 = (eval($scope.VO.insuranceman[i].insurancerate) * eval($scope.VO.insurancetotalmoneyOther) / 100).toFixed(2);
                                        $scope.VO.insuranceman[i].insurancemoney = (eval($scope.VO.insuranceman[i].insurancerate) * eval($scope.VO.insurancetotalchargeOldOther) / 100).toFixed(2);
                                    }
                                }
                                if ($scope.VO.payment.length > 0) {
                                    for (var i = 0; i < $scope.VO.payment.length; i++) {
                                        $scope.VO.payment[i].scaleMoney = '';
                                        $scope.VO.payment[i].planDate = '';
                                    }
                                }
                            }
                            $scope.$apply();
                        });
                    }
                }
            };
            $scope.insurancedmanGridOptions = {
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
                        name: 'insurancedmanpk.name', displayName: '再保险分出人', width: 150, url: 'insuranceCustomerRef/queryForGrid'
                        , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'insurancedmanpk'
                    },
                    {
                        name: 'insurancedmanaddr', displayName: '再保险分出人地址', width: 150
                    },
                    {
                        name: 'insurancedmanlinkman', displayName: '再保险分出人联系人姓名', width: 150
                    },
                    {
                        name: 'insurancedmanlinktel', displayName: '再保险分出人联系人电话', width: 150
                    },
                    {
                        name: 'insurancemoney', displayName: '保险金额/赔偿限额', width: 150, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'insurancefee', displayName: '主险保费', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                    {
                        name: 'additioninsurancecharge', displayName: '附加险保费', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                    },
                ],
                data: $scope.VO.insurancedman,
                onRegisterApi: function (gridApi) {
                    $scope.insurancedmanGridOptions.gridApi = gridApi;
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
                        result = parseFloat(result) + parseFloat(data[i].insurancemoney);
                        //分保费包含佣金时，解付保费应收保费去除相应佣金
                        if(data[i].ifIncludeCommission == 'Y'){
                            result = result - parseFloat(data[i].feemount);
                        }
                    }
                }
                return result;
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
                        //分保费包含佣金时，解付保费应收保费去除相应佣金
                        if(data[i].ifIncludeCommission == 'Y'){
                            result = result - parseFloat(data[i].feemount);
                        }
                    } else if (data[i].pay != 'Y' && data[i].replace == 'Y') {
                        if (data[i].feemount) {
                            feemount = parseFloat(feemount) + parseFloat(data[i].feemount);
                        }
                        if (data[i].insurancemoney) {
                            insurancemoney = parseFloat(insurancemoney) + parseFloat(data[i].insurancemoney);
                        }
                        flag = false;
                        result = result + (eval(parseFloat(insurancemoney).toFixed(2)) - eval(parseFloat(feemount).toFixed(2)));
                        //分保费包含佣金时，解付保费应收保费去除相应佣金
                        if(data[i].ifIncludeCommission == 'Y'){
                            result = result - parseFloat(data[i].feemount);
                        }
                    }
                }
                if (flag) {
                    return 0;
                }
                return result;
            }
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
                        name: 'insurancemanpk.name', displayName: '再保险接受人名称', width: 100, url: 'insuranceCustomerRef/queryForGrid'
                        , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'insurancemanpk'

                    },
                    {
                        name: 'insuranceaddr', displayName: '再保险接受人地址', width: 100


                    },
                    {
                        name: 'insurancelinkman', displayName: '再保险接受人联系人姓名', width: 100


                    },
                    {
                        name: 'insurancelinktel', displayName: '再保险接受人联系电话', width: 100


                    },
                    {
                        name: 'vdef4', displayName: '保费金额不含增值税', width: 100, cellFilter: 'SELECT_YESNO'
                        , editableCellTemplate: 'ui-grid/dropdownEditor'
                        , editDropdownValueLabel: 'name'
                        , editDropdownOptionsArray: getSelectOptionData.YESNO,
                    },
                    {
                        name: 'vdef2', displayName: '佣金金额不含增值税', width: 100, cellFilter: 'SELECT_YESNO'
                        , editableCellTemplate: 'ui-grid/dropdownEditor'
                        , editDropdownValueLabel: 'name'
                        , editDropdownOptionsArray: getSelectOptionData.YESNO,
                    },
                    {
                        name: 'insurancerate', displayName: '分保比例(%)', width: 100


                    },
                    {
                        name: 'chiefman', displayName: '是否主承保', width: 100, cellFilter: 'SELECT_YESNO'
                        , editableCellTemplate: 'ui-grid/dropdownEditor'
                        , editDropdownValueLabel: 'name'
                        , editDropdownOptionsArray: getSelectOptionData.YESNO
                    }, {
                        name: 'replace', displayName: '是否代收保费', width: 100, cellFilter: 'SELECT_YESNO'
                        , editableCellTemplate: 'ui-grid/dropdownEditor'
                        , editDropdownValueLabel: 'name'
                        , editDropdownOptionsArray: getSelectOptionData.YESNO,
                    },
                    {
                        name: 'pay', displayName: '是否全额解付', width: 100, cellFilter: 'SELECT_YESNO'
                        , editableCellTemplate: 'ui-grid/dropdownEditor'
                        , editDropdownValueLabel: 'name'
                        , editDropdownOptionsArray: getSelectOptionData.YESNO,
                    },
                    {
                        name: 'ifIncludeCommission', displayName: '分保费是否含佣金', width: 100, cellFilter: 'SELECT_YESNO'
                        , editableCellTemplate: 'ui-grid/dropdownEditor'
                        , editDropdownValueLabel: 'name'
                        , editDropdownOptionsArray: getSelectOptionData.YESNO,
                    },
                    {
                        name: 'vdef1', displayName: '保险金额/赔偿限额', width: 100, enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }


                    },
                    {
                        name: 'insurancemoney', displayName: '分保费(含税)', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }


                    },
                    {
                        name: 'vdef3', displayName: '分保手续费', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }


                    },
                    {
                        name: 'commisionrate', displayName: '分保佣金比例(%)', width: 100, cellFilter: 'number:4'


                    },
                    {
                        name: 'feemount', displayName: '分保佣金金额(含税)', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
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
                            var array = $scope.insurancemanGridOptions.data;
                            if ('replace' == colDef.name) {
                                if (rowEntity.replace) {
                                    $scope.VO.receivemountOther = 0;
                                    var inData = $scope.insurancemanGridOptions.data;
                                    if (rowEntity.replace == 'Y') {
                                        angular.alert("确认代收保费，并确认代收金额!");
                                        $scope.isreplace = false;
                                    } else {
                                        rowEntity.pay = 'N';
                                        $scope.isreplace = true;
                                    }
                                    $scope.VO.paymountOther = $scope.calPay(inData);
                                    $scope.VO.receivemountOther = $scope.calReceivemount(inData);

                                }
                            }
                            if ('insurancerate' == colDef.name) {
                                rowEntity.vdef1 = ($scope.VO.insurancetotalmoneyOther * rowEntity.insurancerate / 100).toFixed(2);
                                rowEntity.insurancemoney = ($scope.VO.insurancetotalchargeOldOther * rowEntity.insurancerate / 100).toFixed(2);
                                rowEntity.feemount = ((rowEntity.insurancemoney - rowEntity.vdef3) * rowEntity.commisionrate / 100).toFixed(2);
                                $scope.VO.receivefeeperiod = 0;
                                $scope.VO.payperiod = 0;
                                $scope.VO.receiveperiod = 0;
                                $scope.VO.payment = [];
                            }
                            if ('pay' == colDef.name) {
                                if (rowEntity.pay) {
                                    var inData = $scope.insurancemanGridOptions.data;
                                    $scope.VO.paymountOther = $scope.calPay(inData);
                                    $scope.VO.receivemountOther = $scope.calReceivemount(inData);
                                }
                            }
                            if ('vdef4' == colDef.name) {
                                if (rowEntity.vdef4) {
                                    if (rowEntity.vdef4 == 'Y') {
                                        angular.alert("系统将按照签单保费 /1.06来计算签单佣金，请确认!");
                                    }
                                }
                            }
                            if ('vdef2' == colDef.name) {
                                if (rowEntity.vdef2) {
                                    if (rowEntity.vdef2 == 'Y') {
                                        angular.alert("系统将按照实际佣金/1.06来计算签单佣金，请确认!");
                                    }
                                }
                            }
                            if ('insurancemoney' == colDef.name) {
                                var inData = $scope.insurancemanGridOptions.data;
                                $scope.VO.paymountOther = 0;
                                $scope.VO.receivemountOther = 0;
                                $scope.VO.receivemountOther = $scope.calReceivemount(inData);
                                $scope.VO.paymountOther = $scope.calPay(inData);
                                $scope.VO.receivefeeperiod = 0;
                                $scope.VO.payperiod = 0;
                                $scope.VO.receiveperiod = 0;
                                $scope.VO.payment = [];
                                $scope.paymentGridOptions.data = [];
                            }
                            if ('commisionrate' == colDef.name) {
                                $scope.VO.receivefeeperiod = 0;
                                $scope.VO.payperiod = 0;
                                $scope.VO.receiveperiod = 0;
                                $scope.VO.payment = [];
                                $scope.paymentGridOptions.data = [];
                            }

                            if ('insurancemoney' == colDef.name || 'vdef4' == colDef.name || 'vdef2' == colDef.name || 'commisionrate' == colDef.name /*|| 'vdef3' == colDef.name*/) {
                                var inData = $scope.insurancemanGridOptions.data;
                                if (rowEntity.commisionrate != null && rowEntity.commisionrate != "") {
                                    if (rowEntity.insurancemoney) {
                                        rowEntity.feemount = parseFloat(rowEntity.insurancemoney).toFixed(2);
                                    }
                                    if (rowEntity.vdef4 == 'Y') {
                                        rowEntity.feemount = (rowEntity.feemount / 1.06).toFixed(2);
                                    }
                                    if (rowEntity.vdef2 == 'Y') {
                                        rowEntity.feemount = (rowEntity.feemount * 1.06).toFixed(2);
                                    }
                                    if (rowEntity.commisionrate) {
                                        rowEntity.feemount = (eval(rowEntity.feemount) * eval(rowEntity.commisionrate) / 100).toFixed(2);
                                        $scope.VO.paymountOther = $scope.calPay(inData);
                                        $scope.VO.receivemountOther = $scope.calReceivemount(inData);
                                    }
                                    if (rowEntity.feemount || !rowEntity.feemount) {
                                        var array = $scope.insurancemanGridOptions.data;
                                        $scope.VO.commisiontotalnum = 0;
                                        for (var i = 0; i < array.length; i++) {
                                            $scope.VO.commisiontotalnum = eval(parseFloat($scope.VO.commisiontotalnum).toFixed(2)) + eval(parseFloat(array[i].feemount).toFixed(2));
                                        }
                                        $scope.VO.receivefeemountOther = $scope.VO.commisiontotalnum.toFixed(2);
                                    }

                                    if ($scope.VO.payment.length > 0) {
                                        for (var j = 0; j < $scope.VO.payment.length; j++) {
                                            $scope.VO.payment[j].scaleMoney = '';
                                            $scope.VO.payment[j].planDate = '';
                                        }
                                    }
                                }

                            }
                            if (rowEntity.insurancemoney || !rowEntity.insurancemoney) {
                                var array = $scope.insurancemanGridOptions.data;
                                $scope.VO.insurancetotalchargeOther = 0;
                                for (var j = 0; j < array.length; j++) {
                                    $scope.VO.insurancetotalchargeOther = eval(parseFloat($scope.VO.insurancetotalchargeOther)) + eval(parseFloat(array[j].insurancemoney));
                                }

                                $scope.VO.insurancetotalchargeOther = $scope.VO.insurancetotalchargeOther.toFixed(2);
                            }
                            if ('feemount' == colDef.name || 'ifIncludeCommission' == colDef.name) {
                                let array = $scope.insurancemanGridOptions.data;
                                $scope.VO.commisiontotalnum = 0;
                                for (let i = 0; i < array.length; i++) {
                                    $scope.VO.commisiontotalnum = parseFloat(eval($scope.VO.commisiontotalnum) + eval(array[i].feemount)).toFixed(2);
                                }
                                $scope.VO.receivefeemountOther = $scope.VO.commisiontotalnum;
                                $scope.VO.paymountOther = $scope.calPay(array);
                                $scope.VO.receivemountOther = $scope.calReceivemount(array);
                                $scope.VO.receivefeeperiod = 0;
                                $scope.VO.payperiod = 0;
                                $scope.VO.receiveperiod = 0;
                                $scope.VO.payment = [];
                                $scope.paymentGridOptions.data = [];
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
                        name: 'stages', displayName: '期数', width: 100, enableCellEdit: false
                    },
                    {
                        name: 'typeMoneyNO', displayName: '收付款类型', width: 100, cellFilter: 'SELECT_TYPEMONEY'
                        , editableCellTemplate: 'ui-grid/dropdownEditor'
                        , editDropdownValueLabel: 'name'
                        , editDropdownOptionsArray: getSelectOptionData.TYPEMONEY
                        , enableCellEdit: false
                    },
                    {
                        name: 'company.name', displayName: '收付款对象名称', width: 100, enableCellEdit: false
                    },
                    {
                        name: 'typeCompanyNO', displayName: '收付款对象类型', width: 100, cellFilter: 'SELECT_CUSTOMERTYPE'
                        , editableCellTemplate: 'ui-grid/dropdownEditor'
                        , editDropdownValueLabel: 'name'
                        , editDropdownOptionsArray: getSelectOptionData.CUSTOMERTYPE
                        , enableCellEdit: false
                    },
                    {
                        name: 'scaleMoney', displayName: '收付款比例', width: 100
                    },
                    {
                        name: 'planDate', displayName: '计划日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"', editableCellTemplate: 'ui-grid/refDate'
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
                        , enableCellEdit: false
                    },
                    {
                        name: 'noPaymentMoney', displayName: '未结算金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                        , enableCellEdit: false
                    },
                    {
                        name: 'planMoneyCny', displayName: '计划金额（人民币）', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        } , enableCellEdit: false
                    },
                    {   name: 'factMoneyCny', displayName: '已结算金额（人民币）', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                        , enableCellEdit: false
                    },
                    {
                        name: 'noPaymentMoneyCny', displayName: '未结算金额（人民币）', width: 100, cellFilter: 'AMOUNT_FILTER',
                        cellClass: function () {
                            return "lr-text-right"
                        }
                        , enableCellEdit: false
                    },
                    {
                        name: 'factDate', displayName: '结算日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'
                        , editableCellTemplate: 'ui-grid/refDate', enableCellEdit: false
                    },
                    {
                        name: 'vsettlebillno', displayName: '业务结算单号', width: 100, enableCellEdit: false
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
                                        //应收保费
                                        if (rowEntity.typeMoneyNO == 1) {
                                            rowEntity.planMoney = parseFloat(eval($scope.VO.receivemountOther) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                            rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.receivemountOther) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                        }
                                        for (var j = 0; j < $scope.VO.insuranceman.length; j++) {
                                            if (array[i].company.name == $scope.VO.insuranceman[j].insurancemanpk.name
                                                && array[i].$$hashKey == rowEntity.$$hashKey) {
                                                //应收佣金
                                                if (rowEntity.typeMoneyNO == 3) {
                                                    rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].feemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].feemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                }
                                                //解付保费
                                                if (rowEntity.typeMoneyNO == 2) {
                                                    if ($scope.VO.insuranceman[j].pay != 'Y') {
                                                        if ($scope.VO.insuranceman.length > 1 && $scope.VO.insuranceman[j].chiefman != 'Y') {
                                                            rowEntity.planMoney = parseFloat((eval($scope.VO.insuranceman[j].insurancemoney) - eval($scope.VO.insuranceman[j].feemount)) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                            rowEntity.noPaymentMoney = parseFloat((eval($scope.VO.insuranceman[j].insurancemoney) - eval($scope.VO.insuranceman[j].feemount)) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        } else if ($scope.VO.insuranceman.length > 1 && $scope.VO.insuranceman[j].chiefman != 'Y') {
                                                            rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                            rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        } else {
                                                            rowEntity.planMoney = parseFloat((eval($scope.VO.insuranceman[j].insurancemoney) - eval($scope.VO.insuranceman[j].feemount)) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                            rowEntity.noPaymentMoney = parseFloat((eval($scope.VO.insuranceman[j].insurancemoney) - eval($scope.VO.insuranceman[j].feemount)) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        }

                                                    } else {
                                                        //代收代付时
                                                        //分保费包含佣金时，解付保费应收保费去除相应佣金
                                                        if($scope.VO.insuranceman[j].ifIncludeCommission == 'Y'){
                                                            rowEntity.planMoney = parseFloat((eval($scope.VO.insuranceman[j].insurancemoney) - eval($scope.VO.insuranceman[j].feemount)) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                            rowEntity.noPaymentMoney = parseFloat((eval($scope.VO.insuranceman[j].insurancemoney) - eval($scope.VO.insuranceman[j].feemount)) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        }else {
                                                            rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                            rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        }
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
                        name: 'PKcType.name', displayName: '附件类型', width: 100, url: 'industryTypeRef/pageData'
                        , isTree: true, placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'PKcType'

                    },
                    {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},

                    {
                        name: 'upload_operator.name', displayName: '上载人', width: 100, enableCellEdit: false
                        , url: 'userRef/queryForGrid'
                        , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'cUpman'

                    },
                    {
                        name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                    },
                    {
                        name: 'cMemo', displayName: '备注', width: 100, enableCellEdit: true


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
                    $scope.dealAttachmentBGridOptions.gridApi = gridApi;
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
        $scope.table_name = "lr_insurancebill";
        // $scope.fun_code="0001030209";
        //$scope.fun_code = "0001010101";
        $scope.billdef = "Reinsurance";
        $scope.beanName = "insurance.InsurancebillServiceImpl";
        $scope.initData();
        $scope.initHttp();
        $scope.initFunction();
        $scope.initWatch();
        $scope.initButton();
        $scope.initPage();


        initworkflow($scope, $http, ngDialog);
        initonlineView($scope, $rootScope, $sce, $http, ngDialog);
        initPreviewFile($scope, $rootScope);

    }
)
;
app.controller('insuranceinfoGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('insurancedmanGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('insurancemanGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('partnerGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('paymentGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('dealAttachmentBGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
