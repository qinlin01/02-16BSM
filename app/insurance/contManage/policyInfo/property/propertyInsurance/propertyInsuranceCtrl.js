/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('propertyInsuranceCtrl', function ($rootScope, $scope, $sce, $http, $state, $window, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                insuranceinfo: [],
                insurancedman: [],
                insuranceman: [],
                dealAttachmentB: [],
                partner: [],
                payment: [],
                assistant: [],
                policy: [],
                isbudget: 'N',
                ifSubstitute: 'N',
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                billstatus: 31,
                insurancebillkindNO: $rootScope.SELECT.INSURANCEBILLKIND[0].id,
                dr: 0,
                ifGetFee: 'N',
                costscale: [],
                coomedium: [],
                insurancetype: "unlife",
                vdef12: 0,
                ifuhv: 0,
                c1Execitem: "",
                c1ExecitemNum: 0,
                issueNotice: "",
                proofType: null,
                proofText: null,
                //ifApproval:0,
            };
        };
        $scope.insuranceArr = ["010101", "010102", "010103", "010122", "010201", "010203"];
        $scope.entityVO = 'nc.vo.busi.InsurancebillVO';
        $scope.isDw = false;
        $scope.insureClause = {};
        $scope.isProof = false;
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.SuperVOProxy = $scope.initVO();
        $scope.SuperVO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "operate_year": parseInt(new Date().format("yyyy")),
                "id": $stateParams.id
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.changeDataArray = new Set();
        $scope.interceptor = {
            set: function (receiver, property, value) {
                $scope.changeDataArray.add(property);
                // console.log(property, 'is changed to', value);
                receiver[property] = value;
                return Reflect.set(receiver, property, value);
            }
        };
        $scope.funCode = '3020301';
        $scope.param = {
            c_2_type: 0,
            // pk_org_str: $rootScope.orgVO.pk,
            busi_type: "notNull",
            customerType: '(1,2)'
        };
        $scope.proofTypeBox = [1,2,3];
        $scope.agentParam = null;
    };

    $scope.issueRef =
        {
            id: $scope.$id,
            columnDefs: [
                {
                    field: 'IssueNoticeNo',
                    displayName: '出单通知书编号'
                },
                {
                    field: 'name',
                    displayName: '出单通知书名称'
                }
            ],
            data: ""
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

        $scope.projectEval = function (project){
            $scope.VO.pkC0Tradetype = project.pkC0Tradetype;
            $scope.VO.projectkind = project.pkC0Tradetype && project.pkC0Tradetype.name;
            $scope.VO.busi_type = project.busi_type;
            $scope.VO.temporaryPlan = project.temporaryPlan;
            //校核投保人是否录入协议
            $http.post($scope.basePath + "agreement/checkCustomer", {pk: project.cinsureman.pk}).success(function (response) {
                if (response && response.code == "200") {
                    $scope.VO.estimatepk = project.cinsureman;
                }else{
                    return layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        }

        $scope.getEstimate = function (newVal, oldVal){
            $scope.VO.estimatepk = "";
            $scope.VO.estimateaddr = "";
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.pkProject.pk) {
                    $http.post($scope.basePath + "propertyProject/findOne", {pk: $scope.VO.pkProject.pk}).success(function (response) {
                        if (response && response.code == "200") {
                            if (response.result) {
                                let project = response.result;
                                //@zhangwj 市场业务校验保险方案
                                if(project.festimateincome > 100000 && project.isContinue == 0 && ((project.busi_type.code.indexOf("2-2") == 0 && project.busi_type.code!='2-2-4-1') || project.busi_type.code == '1-2-1-1')){
                                    $http.post($scope.basePath + "insuranceScheme/findByProject", {code: project.cprocode}).success(function (response) {
                                        if(response && response.code == 200){
                                            $scope.projectEval(project);
                                        }else{
                                            $scope.VO.pkProject = null;
                                            layer.alert("该立项还未录入保险方案，暂不可以录入保单！", {skin: 'layui-layer-lan', closeBtn: 1});
                                        }
                                    });
                                }else{
                                    $scope.projectEval(project);
                                }
                            }
                        }
                    });
                } else {
                    $scope.VO.estimatelinkman = "";
                }
            }
        }

        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data, fun, isPrint, etype) {
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.basePath + "propertyInsurance/queryAllForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData),
                isPrint: isPrint,
                etype: 0,//0：excel 1：pdf
            })
                .success(function (response) {
                    let data = angular.fromJson(SM2Decrypt(response));
                    if (fun) fun(data);
                    if (isPrint) {
                        window.open(getURL(data.queryPath));
                    } else {
                        window.open($rootScope.basePath + "uploadFile/downLoadByUrl?url=" + encodeURI(encodeURI(data.downPath)));
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
            $http.post($scope.basePath + "propertyInsurance/queryForGrid", {
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

        $scope.onCheckInsuranceno = function (insur) {
            $http.post($scope.basePath + "propertyInsurance/checkInsuranceno", {
                // pk: $scope.VO.insuranceno,
                // pkInsurancebill: $scope.pkInsurancebill
                param: angular.toJson($scope.VO),
                "insureType": "unlife"
            }).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200" && "" != response.msg) {
                    // angular.assignData($scope.VO, response.result);
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    return false;
                }
                if (insur && insur == "Submit") {
                    $scope.onSubmit();
                }
                return true;
                if (null == $scope.VO.informCode && null != response.insureType.insureType) {
                    $scope.insuranceinfoGridOptions.data = new Array();
                    $scope.insuranceinfoGridOptions.data.push(response.insureType.insureType[0]);
                }
                if (null == $scope.VO.informCode && null != response.insureType.insuranceman) {
                    $scope.insurancemanGridOptions.data = new Array();
                    $scope.insurancemanGridOptions.data.push(response.insureType.insuranceman[0]);
                }
            });
        };

        //作废
        $scope.onDiscard = function () {
            let rows = $scope.gridApi.selection.getSelectedRows();
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
                    $http.post($scope.basePath + "propertyInsurance/discard", {pk: $scope.pk, billdef: $scope.billdef}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            if (response.code == 200) {
                                //调用查询方法刷新页面
                                $scope.queryForGrid($scope.QUERY);
                                return layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
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
            $http.post($scope.basePath + "propertyInsurance/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    let type = "0";
                    if ($scope.VO.updateType == "1") {
                        type = "1";
                    }
                    if ($scope.ifGetFee() && $scope.VO.billstatus != 34) {
                        $scope.isreplace = false;
                    }
                    angular.assignData($scope.VO, response.result);
                    if (!$scope.VO.dealAttachmentB) {
                        $scope.VO.dealAttachmentB = [];
                    }
                    $scope.VO.updateType = type;
                    $scope.insuranceinfoGridOptions.data = $scope.VO.insuranceinfo;
                    $scope.insurancedmanGridOptions.data = $scope.VO.insurancedman;
                    $scope.insurancemanGridOptions.data = $scope.VO.insuranceman;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    $scope.partnerGridOptions.data = $scope.VO.partner;
                    $scope.paymentGridOptions.data = $scope.VO.payment;
                    $scope.provisionalPolicyGridOptions.data = $scope.VO.policy;
                    if($scope.VO.proofType!=null && $scope.VO.proofType!=""){
                        $scope.proofTypeBox[parseInt($scope.VO.proofType)-1] = true;
                    }
                    $scope.changeAgentParamType();
                    if (callback) callback();
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
        $scope.findOneSuper = function (pk) {
            $scope.specialId = $rootScope.specialId;
            $rootScope.specialById = null;
            $rootScope.specialId = null;
            $scope.pk = pk;
            $http.post($scope.basePath + "propertyInsurance/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    $scope.SuperVO = response.result;
                    $scope.VO.insuranceinfo = $scope.SuperVO.insuranceinfo;
                    $scope.VO.insurancedman = $scope.SuperVO.insurancedman;
                    $scope.VO.insuranceman = $scope.SuperVO.insuranceman;
                    $scope.VO.dealAttachmentB = $scope.SuperVO.dealAttachmentB;
                    $scope.VO.partner = $scope.SuperVO.partner;
                    $scope.VO.payment = $scope.SuperVO.payment;
                    $scope.VO.policy = $scope.SuperVO.policy;
                    $scope.insuranceinfoGridOptions.data = $scope.VO.insuranceinfo;
                    $scope.insurancedmanGridOptions.data = $scope.VO.insurancedman;
                    $scope.insurancemanGridOptions.data = $scope.VO.insuranceman;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    $scope.partnerGridOptions.data = $scope.VO.partner;
                    $scope.paymentGridOptions.data = $scope.VO.payment;
                    $scope.provisionalPolicyGridOptions.data = $scope.VO.policy;
                    $scope.SuperVOProxy = new Proxy($scope.SuperVO, $scope.interceptor);
                    $scope.SuperForm = true;
                    $scope.isGrid = false;
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    //子表可编辑
                    $scope.childTableEnable(true);
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
        $scope.findOneData = function (pk) {
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
            layer.load(2);
            $scope.pk = pk;
            $rootScope.dataById = null;
            $scope.funCode = '3020301';
            $http.post($scope.basePath + "insuranceData/changeInsurance", {pk: pk}).success(function (response) {
                if (response && response.code == "200") {
                    $scope.VO = response.data;
                    $scope.insuranceinfoGridOptions.data = $scope.VO.insuranceinfo;
                    $scope.insurancedmanGridOptions.data = $scope.VO.insurancedman;
                    $scope.insurancemanGridOptions.data = $scope.VO.insuranceman;
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
                layer.closeAll('loading');
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO.payment = $scope.paymentGridOptions.data;
            $scope.VO.insurancedman = $scope.insurancedmanGridOptions.data;
            $scope.VO.insuranceinfo = $scope.insuranceinfoGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $scope.VO.TEMP_INFOS = "";
            for (let i = 0; i < $scope.provisionalPolicyGridOptions.data.length; i++) {
                if (i == $scope.provisionalPolicyGridOptions.data.length - 1) {
                    $scope.VO.TEMP_INFOS += $scope.provisionalPolicyGridOptions.data[i].insuranceinfono;
                } else {
                    $scope.VO.TEMP_INFOS += $scope.provisionalPolicyGridOptions.data[i].insuranceinfono + ",";
                }
            }
            $http.post($rootScope.basePath + "propertyInsurance/save", {data: angular.toJson($scope.VO), funCode: $scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        $scope.isDisableds = true;
                        $scope.isUpdate = false;
                        $scope.isreplace = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                    }
                    if (response) {
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                let rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                            let flag = response.flag;
                            if (flag == 1) {
                                $scope.isProof = true;
                            }
                        }
                    }
                    // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                });
        };
        $scope.onCheckWithEIMS = function () {
            let rows = $scope.gridApi.selection.getSelectedRows();
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

        $scope.onRenewal = function () {
            //  控制字表按钮的显示
            $scope.isClear = false;
            if ($scope.isGrid) {
                let rows = $scope.gridApi.selection.getSelectedRows();
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
                    $scope.VO.pkReport = null;
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

        $scope.onCopy = function () {
            //  控制字表按钮的显示
            $scope.isClear = false;
            if ($scope.isGrid) {
                let rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.isGrid = false;
                $scope.form = true;

                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
                if ($scope.VO.billstatus != 31 || $scope.VO.billstatus != 37) {
                    $scope.VO.billstatus = 31;
                }
                $scope.VO.insuranceinfono = null;
                $scope.VO.pkOperator = $rootScope.userVO;
                $scope.VO.operateDate = new Date().format("yyyy-MM-dd");
                $scope.VO.operateTime = new Date().format("yyyy-MM-dd HH:mm:ss");
                $scope.findOne(rows[0].id, function () {
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    // $scope.VO.payment = [];
                    $scope.VO.billstatus = 31;
                    $scope.VO.pkOperator = $rootScope.userVO;
                    $scope.VO.operateDate = new Date().format("yyyy-MM-dd");
                    $scope.VO.operateTime = new Date().format("yyyy-MM-dd HH:mm:ss");
                    // $scope.VO.receivefeeperiod = null;
                    // $scope.VO.payperiod = null;
                    // $scope.VO.receiveperiod = null;
                    $scope.VO.insuranceinfono = null;
                    // $scope.VO.insuranceno = null;
                    $scope.VO.id = null;

                    // $scope.paymentGridOptions.data = [];
                    $scope.gridApi.selection.getSelectedRows()[0] = $scope.VO;
                });
                $scope.VO.id = null;
            } else {

                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            }

        };

        /*
         * 暂存
         * */
        /*$scope.onTemporary = function () {
         layer.load(2);
         $http.post($rootScope.basePath + "propertyInsurance/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
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
         return rs == undefined ? matched : rs;
         });
         layer.alert("暂存成功！", {skin: 'layui-layer-lan', closeBtn: 1});
         }
         }
         // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
         });
         };*/
    };

    $scope.initFunction = function () {
        $scope.changeAgentParamType = function () {
            if ($scope.VO.busi_type != null && $scope.VO.busi_type.name == '个人代理业务') {
                $scope.agentParam = {agentType: 2};
            } else {
                $scope.agentParam = null;
            }
        }
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

        //所有子表是否可编辑
        $scope.childTableEnable = function (yn) {
            for (let i = 0; i < $scope.paymentGridOptions.columnDefs.length; i++) {
                $scope.paymentGridOptions.columnDefs[i].enableCellEdit = yn;
            }
            for (let i = 0; i < $scope.provisionalPolicyGridOptions.columnDefs.length; i++) {
                $scope.provisionalPolicyGridOptions.columnDefs[i].enableCellEdit = yn;
            }
            for (let i = 0; i < $scope.partnerGridOptions.columnDefs.length; i++) {
                $scope.partnerGridOptions.columnDefs[i].enableCellEdit = yn;
            }
            for (let i = 0; i < $scope.dealAttachmentBGridOptions.columnDefs.length; i++) {
                $scope.dealAttachmentBGridOptions.columnDefs[i].enableCellEdit = yn;
            }
            for (let i = 0; i < $scope.insurancemanGridOptions.columnDefs.length; i++) {
                $scope.insurancemanGridOptions.columnDefs[i].enableCellEdit = yn;
            }
            for (let i = 0; i < $scope.insurancedmanGridOptions.columnDefs.length; i++) {
                $scope.insurancedmanGridOptions.columnDefs[i].enableCellEdit = yn;
            }
            for (let i = 0; i < $scope.insuranceinfoGridOptions.columnDefs.length; i++) {
                $scope.insuranceinfoGridOptions.columnDefs[i].enableCellEdit = yn;
            }
        }

        $scope.moveDianShangData = function () {
            $http.post($scope.basePath + "propertyInsurance/moveDianShangData").success(function (response) {
            });
        }

        // 下载模板
        $scope.onDownloadTemp = function () {
            let iframe = document.createElement("iframe")
            iframe.style.display = "none";
            iframe.src = 'view\\propertyInsurance\\temp.xlsx';
            document.body.appendChild(iframe);
        }
        $scope.getNowFormatDate = function () {
            var date = new Date();
            var seperator1 = "-";
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            var currentdate = year + seperator1 + month + seperator1 + strDate;
            return currentdate;
        }
        $scope.findIssueNotice = function (pk) {
            $scope.VO.ids = new Array();
            $http.post($scope.basePath + "issueNotice/findOne", {pk: pk}).success(function (response) {
                if (response && response.code == "200") {
                    var dezcBillstatus = response.result.dwzc_billstatus;
                    if(!"34"==dezcBillstatus){
                        return layer.alert('该出单通知书未在电网资产系统中审核通过，暂不能使用', {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    $scope.VO.pkInsureInform = pk;
                    $scope.VO.issueNotice = response.result;
                    if ($scope.VO.issueNotice != null) {
                        $scope.VO.informCode = $scope.VO.issueNotice.IssueNoticeNo;
                        $scope.VO.pkInsureProject = $scope.VO.issueNotice.insuranceSchemeId;
                        $scope.VO.insureProjectCode = $scope.VO.issueNotice.insuranceSchemeCode;
                        $scope.VO.issueNoticeName = $scope.VO.issueNotice.name;
                        $scope.insureType = $scope.VO.issueNotice.insureType;
                        $scope.VO.ifuhv = $scope.VO.issueNotice.ifuhv;
                    } else {
                        $scope.VO.informCode = "";
                        $scope.VO.pkInsureProject = "";
                        $scope.VO.insureProjectCode = "";
                        $scope.VO.issueNoticeName = "";
                        $scope.insureType = "";
                        $scope.VO.ifuhv = 0;
                    }
                    let ids = "";
                    let cids = "";
                    //@zhangwj 险种匹配上出单通知书后，被保人可以选择到
                    let ifMatching = false;
                    let behoder = new Array();
                    let company = new Array();
                    if ($scope.insuranceinfoGridOptions.data != null && $scope.insuranceinfoGridOptions.data.length != 0 || ($scope.VO.informCode != null && $scope.VO.informCode != "")) {
                        for (let i = 0; i < $scope.insureType.length; i++) {
                            if ($scope.insuranceinfoGridOptions.data.length > 0 && $scope.getInsureName($scope.insureType[i].INSURE_TYPE_ID) == $scope.insuranceinfoGridOptions.data[0].insurancepk.name) {
                                //已匹配
                                ifMatching = true;
                                $scope.hadDate = true;
                                if (null == $scope.VO.startdate) {
                                    $scope.VO.startdate = $scope.getNowFormatDate();
                                    $scope.VO.enddate = $scope.getNowFormatDate();
                                    $scope.hadDate = false;
                                }
                                behoder = $scope.insureType[i].insurebeHolde;
                                company = $scope.insureType[i].insureCompany;
                                $scope.ALL_FEE = $scope.insureType[i].ALL_FEE;
                                $scope.insuranceinfoGridOptions.data[0].insurancemoney = $scope.insureType[i].ALL_FEE;
                                $scope.VO.insurancetotalmoney = $scope.insureType[i].ALL_FEE;
                                $scope.insuranceinfoGridOptions.data[0].chargerate = $scope.insureType[i].INSURANCE_RATE_MIN;
                                // $scope.VO.startdate=$scope.insureType[i].INSURE_START_DATE;
                                // $scope.VO.enddate=$scope.insureType[i].INSURE_END_DATE;
                                for (let c = 0; c < $scope.insureType[i].insureCompany.length; c++) {
                                    let cid = $scope.insureType[i].insureCompany[c].insureCompanyId;
                                    if (c == $scope.insureType[i].insureCompany.length - 1) {
                                        cids += "-" + cid + "-";
                                    } else {
                                        cids += "-" + cid + "-" + ",";
                                    }
                                }
                                $scope.getInsureCompany(cids);
                                for (let d = 0; d < $scope.insureType[i].insurebeHolde.length; d++) {
                                    let id = $scope.insureType[i].insurebeHolde[d].BEHOLDER_ID;
                                    if (id.length > 20) {
                                        id = id.substr(id.length - 20, id.length);
                                    }
                                    if (d == $scope.insureType[i].insurebeHolde.length - 1) {
                                        ids += "-" + id + "-";
                                    } else {
                                        ids += "-" + id + "-" + ",";
                                    }
                                }
                                $scope.VO.behoder = behoder;
                                $scope.VO.ids = new Array();
                                $scope.VO.ids.push(ids);
                                let data = new Object();
                                data.ids = $scope.VO.ids[0];
                                $http.post($scope.basePath + 'insuranceScheme/queryInsurancedmanByUp', {
                                    data: angular.toJson(data),
                                    page: 0,
                                    pageSize: 100000,
                                    fields: angular.toJson($scope.queryData)
                                }).success(function (response) {
                                    if (response.code == 200) {
                                        rows = response.result.Rows;
                                        if (null == $scope.VO.updateType || $scope.VO.updateType != '1') {
                                            $scope.insurancedmanGridOptions.data = new Array();
                                        }
                                        for (let j = 0; j < rows.length; j++) {
                                            let insurancedmanpk = {
                                                pk: rows[j].pk,
                                                insurancedmanpk: {
                                                    pk: rows[j].pk,
                                                    name: rows[j].name,
                                                    enumEntkind_pk: rows[j].enumEntkind_name,
                                                    code: rows[j].code,
                                                    billstatus: rows[j].BILLSTATUS,
                                                    tradetype_name: rows[j].tradetype_name,
                                                    tradetype_code: rows[j].tradetype_name,
                                                    c1Province_name: rows[j].c1Province_name,
                                                    pk_org: rows[j].PK_ORG,
                                                    c_1_entkind: rows[j].C_1_ENTKIND,
                                                    c_0_upcostomer: rows[j].C_0_UPCOSTOMER,
                                                    enumEntkind_name: rows[j].enumEntkind_name,
                                                    c_1_province: rows[j].C_1_PROVINCE,
                                                    enumEntkind_code: rows[j].enumEntkind_name,
                                                    c_0_type: rows[j].C_0_TYPE,
                                                    c_1_institution: rows[j].C_1_INSTITUTION,
                                                    enum_entkind: rows[j].ENUM_ENTKIND,
                                                    tradetype_pk: rows[j].C_0_TRADETYPE
                                                },
                                                insurancedmanlinkman: rows[j].insurancedmanlinkman,
                                                insurancedman: rows[j].name,
                                                insurancedmanaddr: rows[j].c_0_address,
                                            };
                                            if (null == $scope.insurancedmanGridOptions.data) {
                                                $scope.insurancedmanGridOptions.data = new Array();
                                            }
                                            let temp = true;
                                            for (let k = 0; k < $scope.insurancedmanGridOptions.data.length; k++) {
                                                if ($scope.insurancedmanGridOptions.data[k].pk == insurancedmanpk.pk) {
                                                    temp = false;
                                                }
                                            }
                                            if (temp) {
                                                $scope.insurancedmanGridOptions.data.push(insurancedmanpk);
                                            }
                                        }
                                        for (let ins = 0; ins < $scope.insurancedmanGridOptions.data.length; ins++) {
                                            for (let be = 0; be < behoder.length; be++) {
                                                if ($scope.insurancedmanGridOptions.data[ins].pk == behoder[be].BEHOLDER_ID) {
                                                    if ($scope.VO.behoder[be].ASSETS_INSURE_VALUE) {
                                                        $scope.insurancedmanGridOptions.data[ins].insurancemoney = $scope.VO.behoder[be].ASSETS_INSURE_VALUE;
                                                    } else {
                                                        $scope.insurancedmanGridOptions.data[ins].insurancemoney = $scope.VO.behoder[be].BEHOLDER_INSURANCEMONEY;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (!$scope.hadDate) {
                                        $scope.VO.startdate = $scope.insureType[i].INSURE_START_DATE;
                                        $scope.VO.enddate = $scope.insureType[i].INSURE_END_DATE;
                                        if ($scope.insureType[i].INSURE_TYPE_ID == 'constructionPay') {
                                            $scope.VO.startdate = $scope.insureType[i].insurance_preiod_start;
                                            $scope.VO.enddate = $scope.insureType[i].insurance_preiod_end;
                                        }
                                    }
                                    layer.closeAll('loading');
                                });
                            } else {
                                if(!ifMatching){
                                    $scope.VO.ids = new Array();
                                    $scope.VO.ids.push("''");
                                }
                            }
                        }
                    } else {
                        $scope.VO.ids = new Array();
                    }
                    $scope.VO.issueNotice = null;
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
                }
            });
        };

        $scope.findIssueNoticeSuper = function (pk) {
            $scope.SuperVOProxy.ids = new Array();
            $http.post($scope.basePath + "issueNotice/findOne", {pk: pk}).success(function (response) {
                if (response && response.code == "200") {
                    $scope.SuperVOProxy.pkInsureInform = pk;
                    $scope.SuperVOProxy.informCode = response.result.IssueNoticeNo;
                    $scope.SuperVOProxy.pkInsureProject = response.result.insuranceSchemeId;
                    $scope.SuperVOProxy.insureProjectCode = response.result.insuranceSchemeCode;
                    $scope.SuperVOProxy.issueNoticeName = response.result.name;
                    $scope.insureType = response.result.insureType;
                    $scope.SuperVOProxy.ifuhv = response.result.ifuhv;
                    let ids = "";
                    let cids = "";
                    let behoder = new Array();
                    let company = new Array();
                    if ($scope.insuranceinfoGridOptions.data != null && $scope.insuranceinfoGridOptions.data.length != 0 || ($scope.SuperVOProxy.informCode != null && $scope.SuperVOProxy.informCode != "")) {
                        for (let i = 0; i < $scope.insureType.length; i++) {
                            if ($scope.insuranceinfoGridOptions.data.length > 0 && $scope.getInsureName($scope.insureType[i].INSURE_TYPE_ID) == $scope.insuranceinfoGridOptions.data[0].insurancepk.name) {
                                $scope.hadDate = true;
                                if (null == $scope.SuperVOProxy.startdate) {
                                    $scope.SuperVOProxy.startdate = $scope.getNowFormatDate();
                                    $scope.SuperVOProxy.enddate = $scope.getNowFormatDate();
                                    $scope.hadDate = false;
                                }
                                behoder = $scope.insureType[i].insurebeHolde;
                                company = $scope.insureType[i].insureCompany;
                                $scope.ALL_FEE = $scope.insureType[i].ALL_FEE;
                                $scope.insuranceinfoGridOptions.data[0].insurancemoney = $scope.insureType[i].ALL_FEE;
                                $scope.SuperVOProxy.insurancetotalmoney = $scope.insureType[i].ALL_FEE;
                                $scope.insuranceinfoGridOptions.data[0].chargerate = $scope.insureType[i].INSURANCE_RATE_MIN;
                                // $scope.SuperVOProxy.startdate=$scope.insureType[i].INSURE_START_DATE;
                                // $scope.SuperVOProxy.enddate=$scope.insureType[i].INSURE_END_DATE;
                                for (let c = 0; c < $scope.insureType[i].insureCompany.length; c++) {
                                    let cid = $scope.insureType[i].insureCompany[c].insureCompanyId;
                                    if (c == $scope.insureType[i].insureCompany.length - 1) {
                                        cids += "-" + cid + "-";
                                    } else {
                                        cids += "-" + cid + "-" + ",";
                                    }
                                }
                                $scope.getInsureCompany(cids);
                                for (let d = 0; d < $scope.insureType[i].insurebeHolde.length; d++) {
                                    let id = $scope.insureType[i].insurebeHolde[d].BEHOLDER_ID;
                                    if (id.length > 20) {
                                        id = id.substr(id.length - 20, id.length);
                                    }
                                    if (d == $scope.insureType[i].insurebeHolde.length - 1) {
                                        ids += "-" + id + "-";
                                    } else {
                                        ids += "-" + id + "-" + ",";
                                    }
                                }
                                $scope.SuperVOProxy.behoder = behoder;
                                $scope.SuperVOProxy.ids = new Array();
                                $scope.SuperVOProxy.ids.push(ids);
                                let data = new Object();
                                data.ids = $scope.SuperVOProxy.ids[0];
                                $http.post($scope.basePath + 'insuranceScheme/queryInsurancedmanByUp', {
                                    data: angular.toJson(data),
                                    page: 0,
                                    pageSize: 100000,
                                    fields: angular.toJson($scope.queryData)
                                }).success(function (response) {
                                    if (response.code == 200) {
                                        rows = response.result.Rows;
                                        if (null == $scope.SuperVOProxy.updateType || $scope.SuperVOProxy.updateType != '1') {
                                            $scope.insurancedmanGridOptions.data = new Array();
                                        }
                                        for (let j = 0; j < rows.length; j++) {
                                            let insurancedmanpk = {
                                                pk: rows[j].pk,
                                                insurancedmanpk: {
                                                    pk: rows[j].pk,
                                                    name: rows[j].name,
                                                    enumEntkind_pk: rows[j].enumEntkind_name,
                                                    code: rows[j].code,
                                                    billstatus: rows[j].BILLSTATUS,
                                                    tradetype_name: rows[j].tradetype_name,
                                                    tradetype_code: rows[j].tradetype_name,
                                                    c1Province_name: rows[j].c1Province_name,
                                                    pk_org: rows[j].PK_ORG,
                                                    c_1_entkind: rows[j].C_1_ENTKIND,
                                                    c_0_upcostomer: rows[j].C_0_UPCOSTOMER,
                                                    enumEntkind_name: rows[j].enumEntkind_name,
                                                    c_1_province: rows[j].C_1_PROVINCE,
                                                    enumEntkind_code: rows[j].enumEntkind_name,
                                                    c_0_type: rows[j].C_0_TYPE,
                                                    c_1_institution: rows[j].C_1_INSTITUTION,
                                                    enum_entkind: rows[j].ENUM_ENTKIND,
                                                    tradetype_pk: rows[j].C_0_TRADETYPE
                                                },
                                                insurancedmanlinkman: rows[j].insurancedmanlinkman,
                                                insurancedman: rows[j].name,
                                                insurancedmanaddr: rows[j].c_0_address,
                                            };
                                            if (null == $scope.insurancedmanGridOptions.data) {
                                                $scope.insurancedmanGridOptions.data = new Array();
                                            }
                                            let temp = true;
                                            for (let k = 0; k < $scope.insurancedmanGridOptions.data.length; k++) {
                                                if ($scope.insurancedmanGridOptions.data[k].pk == insurancedmanpk.pk) {
                                                    temp = false;
                                                }
                                            }
                                            if (temp) {
                                                $scope.insurancedmanGridOptions.data.push(insurancedmanpk);
                                            }
                                        }
                                        for (let ins = 0; ins < $scope.insurancedmanGridOptions.data.length; ins++) {
                                            for (let be = 0; be < behoder.length; be++) {
                                                if ($scope.insurancedmanGridOptions.data[ins].pk == behoder[be].BEHOLDER_ID) {
                                                    if ($scope.VO.behoder[be].ASSETS_INSURE_VALUE) {
                                                        $scope.insurancedmanGridOptions.data[ins].insurancemoney = $scope.VO.behoder[be].ASSETS_INSURE_VALUE;
                                                    } else {
                                                        $scope.insurancedmanGridOptions.data[ins].insurancemoney = $scope.VO.behoder[be].BEHOLDER_INSURANCEMONEY;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (!$scope.hadDate) {
                                        $scope.SuperVOProxy.startdate = $scope.insureType[i].INSURE_START_DATE;
                                        $scope.SuperVOProxy.enddate = $scope.insureType[i].INSURE_END_DATE;
                                        if ($scope.insureType[i].INSURE_TYPE_ID == 'constructionPay') {
                                            $scope.VO.startdate = $scope.insureType[i].insurance_preiod_start;
                                            $scope.VO.enddate = $scope.insureType[i].insurance_preiod_end;
                                        }
                                    }
                                    layer.closeAll('loading');
                                });
                            } else {
                                $scope.SuperVOProxy.ids = new Array();
                                $scope.SuperVOProxy.ids.push("''");
                            }
                        }
                    } else {
                        $scope.SuperVOProxy.ids = new Array();
                    }
                    $scope.SuperVOProxy.issueNotice = null;
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
                }
            });
        };

        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.ononRowDblClick = function (item) {
            if (item && item.id) {
                $scope.onCard(item.id);
            }
        };

        $scope.checkBusitype = function (busi_type) {
            $http.post($scope.basePath + "insuranceScheme/checkBusitype", {busi_type: busi_type}).success(function (response) {
                if (response && response.code == "200") {
                    if (response.flag) {
                        $scope.isDw = true;
                    } else {
                        $scope.isDw = false;
                    }
                }
            });
        };
        $scope.onSubmitSelf = function () {
            if (!$scope.VO.insuranceno) {
                return layer.alert("提交之前必须补充保单号", {skin: 'layui-layer-lan', closeBtn: 1});
            }

            if ($scope.dealAttachmentBGridOptions.data.length == 0) {
                return layer.alert($scope.ifGetFee() ? "请在附件子表中上传保费缴纳通知书!" : "请上传附件！",
                    {skin: 'layui-layer-lan', closeBtn: 1});
            }
            $scope.onCheckInsuranceno("Submit")
        }
    };

//附件批量上传
    $scope.onUploadss = function () {
        layer.load(2);
        $scope.isSubDisabled = true;
        $scope.isUploadAnytime = true;
        $scope.aVO = {};
        ngDialog.openConfirm({
            showClose: true,
            closeByDocument: false,
            template: 'view/common/attachment.html',
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
                layer.load(2);
                //调用后台保存接口
                $http.post($scope.basePath + "propertyInsurance/saveFiles", {data: angular.toJson(value)}).success(function (response) {
                    layer.closeAll('loading');
                    if (response && response.code == "200") {
                        layer.alert(response.msg, {
                            icon: 1
                        });
                    }

                });
            }
        }, function (reason) {
        });
    };


    $scope.initWatch = function () {
        $scope.$watch('VO.FREE_FEE_TYPE', function (newVal, oldVal) {
            if (!$scope.isEdit && !$scope.isUpdate) {
                return;
            }
            if (newVal != oldVal) {
                if($scope.VO.NUMBFREEFEE!=null || $scope.VO.WORDFREEFEE!=null){
                    if(newVal  == "1"){
                        $scope.VO.NUMBFREEFEE = null;
                        $scope.VO.INTFREEFEE = null;
                    }
                    if(newVal  == "0"){
                        $scope.VO.WORDFREEFEE = null;
                        $scope.VO.INTFREEFEE = null;
                    }
                    return layer.alert("相对免赔额与绝对免赔额只能保留一个数值!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
        }, true);

        $scope.$watch('VO.busi_type', function (newVal, oldVal) {
            if (!$scope.isEdit && !$scope.isUpdate) {
                return;
            }
            $scope.changeAgentParamType();
        }, true);
        $scope.$watch('VO.issueNotice', function (newVal, oldVal) {
            if (!$scope.isEdit && !$scope.isUpdate) {
                return;
            }
            if (newVal == "") {
                $scope.VO.informCode = "";
                $scope.VO.pkInsureProject = "";
                $scope.VO.insureProjectCode = "";
                $scope.VO.issueNoticeName = "";
                $scope.insureType = "";
                $scope.VO.ifuhv = 0;
            }
        }, true);

        $scope.$watch('VO.isDianShang', function (newVal, oldVal) {
            if ("Y" == $scope.VO.isDianShang) {
                $scope.QUERY["DATA ->> '$.isDianShang'"] = "Y";
                $scope.QUERY["DATA ->> '$.isDianShang'^is"] = null;
            } else {
                $scope.QUERY["DATA ->> '$.isDianShang'^is"] = "is null";
                $scope.QUERY["DATA ->> '$.isDianShang'"] = null;
            }
        }, true);

        $scope.$watch('VO.issueNotice.IssueNoticeNo', function (newVal, oldVal) {
            if (!$scope.isEdit && !$scope.isUpdate) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit || $scope.isUpdate) {
                if (null != $scope.VO.issueNotice && null != $scope.VO.issueNotice.id) {
                    $scope.findIssueNotice($scope.VO.issueNotice.id);
                }
            }
        }, true);
        $scope.$watch('SuperVOProxy.issueNotice.IssueNoticeNo', function (newVal, oldVal) {
            if (!$scope.SuperForm) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.SuperForm) {
                if (null != $scope.SuperVOProxy.issueNotice && null != $scope.SuperVOProxy.issueNotice.id) {
                    $scope.findIssueNoticeSuper($scope.SuperVOProxy.issueNotice.id);
                }
            }
        }, true);
        $scope.getInsureName = function (id) {
            let DWZCINSURANCETYPE = getSelectOptionData.DWZCINSURANCETYPE;
            let name = "";
            for (let i = 0; i < DWZCINSURANCETYPE.length; i++) {
                if (id == DWZCINSURANCETYPE[i].id) {
                    name = DWZCINSURANCETYPE[i].name;
                    return name;
                }
            }
            return name;
        }
        $scope.ifCheckFee = function () {
            if ($scope.ifGetFee() && ($scope.VO.ifGetFeeBill == 37 || $scope.VO.ifGetFeeBill == null)) {
                ngVerify.setOK("#insuranceno");
                if ($scope.isEdit) {
                    $scope.isreplace = false;
                }
                if (Number($scope.VO.receiveperiod) <= 0) {
                    ngVerify.setError("#receiveperiod", "请输入应收保费总期数");
                } else {
                    ngVerify.setOK("#receiveperiod");
                }
                if (Number($scope.VO.payperiod) <= 0) {
                    ngVerify.setError("#payperiod", "应解付保费总期数");
                } else {
                    ngVerify.setOK("#payperiod");
                }
                $("#insuranceno_lab").removeClass("lr-verify");
                $("#payperiod_lab").addClass("lr-verify");
                $("#receiveperiod_lab").addClass("lr-verify");
            } else {
                if ($scope.VO.insuranceno == null || $scope.VO.insuranceno == '') {
                    // ngVerify.setError("#insuranceno", "请输入保单号");
                } else {
                    ngVerify.setOK("#insuranceno");
                }
                if ($scope.isEdit) {
                    $scope.isreplace = true;
                }
                ngVerify.setOK("#receiveperiod");
                ngVerify.setOK("#payperiod");
                // $("#insuranceno_lab").addClass("lr-verify");
                $("#payperiod_lab").removeClass("lr-verify");
                $("#receiveperiod_lab").removeClass("lr-verify");
            }
        }
        $scope.getInsureByName = function (names) {
            let DWZCINSURANCETYPE = getSelectOptionData.DWZCINSURANCETYPE;
            let name = "";
            for (let i = 0; i < DWZCINSURANCETYPE.length; i++) {
                if (names == DWZCINSURANCETYPE[i].name) {
                    name = DWZCINSURANCETYPE[i].name;
                    return name;
                }
            }
            return name;
        }

        $scope.getInsureCompany = function (ids) {
            let data = new Object();
            data.ids = ids;
            $http.post($scope.basePath + 'insuranceScheme/queryInsurancedmanByUp', {
                data: angular.toJson(data),
                page: 0,
                pageSize: 100000,
                fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response.code == 200) {
                    rows = response.result.Rows;
                    if (null == $scope.VO.updateType || $scope.VO.updateType != '1') {
                        $scope.insurancemanGridOptions.data = new Array();
                    }
                    for (let j = 0; j < rows.length; j++) {
                        let insurancedmanpk = {
                            pk: rows[j].pk,
                            insurancemanpk: {
                                pk: rows[j].pk,
                                name: rows[j].name,
                                enumEntkind_pk: rows[j].enumEntkind_name,
                                code: rows[j].code,
                                billstatus: rows[j].BILLSTATUS,
                                tradetype_name: rows[j].tradetype_name,
                                tradetype_code: rows[j].tradetype_name,
                                c1Province_name: rows[j].c1Province_name,
                                pk_org: rows[j].PK_ORG,
                                c_1_entkind: rows[j].C_1_ENTKIND,
                                c_0_upcostomer: rows[j].C_0_UPCOSTOMER,
                                enumEntkind_name: rows[j].enumEntkind_name,
                                c_1_province: rows[j].C_1_PROVINCE,
                                enumEntkind_code: rows[j].enumEntkind_name,
                                c_0_type: rows[j].C_0_TYPE,
                                c_1_institution: rows[j].C_1_INSTITUTION,
                                enum_entkind: rows[j].ENUM_ENTKIND,
                                tradetype_pk: rows[j].C_0_TRADETYPE
                            },
                            insuranceman: rows[j].name,
                            vdef4: "N",
                            replace: "N",
                            pay: "N",
                            feemount: "0",
                            insurancelinktel: "",
                            insurancelinkman: "",
                            vdef2: "N",
                            insuranceaddr: rows[j].c_0_address,
                            vdef1: "",
                            insurancerate: rows[j].underwritingRatio,
                            insurancemoney: "",
                            commisionrate: "",
                            chiefman: "N"
                        };
                        if (rows.length == 1) {
                            insurancedmanpk.chiefman = "Y";
                        }
                        if (null == $scope.insurancemanGridOptions.data) {
                            $scope.insurancemanGridOptions.data = new Array();
                        }
                        let temp = true;
                        for (let k = 0; k < $scope.insurancemanGridOptions.data.length; k++) {
                            if ($scope.insurancemanGridOptions.data[k].pk == insurancedmanpk.pk) {
                                temp = false;
                            }
                        }
                        if (temp) {
                            $scope.insurancemanGridOptions.data.push(insurancedmanpk);
                        }
                    }
                    for (let ins = 0; ins < $scope.insurancemanGridOptions.data.length; ins++) {
                        for (let be = 0; be < $scope.company.length; be++) {
                            if ($scope.insurancemanGridOptions.data[ins].pk == $scope.company[be].insureCompanyId) {
                                $scope.insurancemanGridOptions.data[ins].insurancerate = $scope.company[be].underwritingRatio;
                                $scope.insurancemanGridOptions.data[ins].vdef1 = $scope.company[be].underwritingRatio / 100 * $scope.ALL_FEE;
                            }
                        }
                    }
                }
                layer.closeAll('loading');
            });
        }
        $scope.$watch('insuranceinfoGridOptions.data[0].insurancepk.name', function (newVal, oldVal) {
            if ($scope.SuperForm) {
                return;
            }
            if (!$scope.isEdit) {
                return;
            }
            if (null != $scope.VO.pkProject && $scope.isDw || ($scope.VO.informCode != null && $scope.VO.informCode != "")) {
                let ids = "";
                let cids = "";
                //@zhangwj 险种匹配上出单通知书后，被保人可以选择到
                let ifMatching = false;
                let behoder = new Array();
                let company = new Array();
                if ($scope.insuranceinfoGridOptions.data != null && $scope.insuranceinfoGridOptions.data.length != 0 && null != $scope.insureType) {
                    //@zhangwj 2022-12-07【YDBXJJ-2746】先校验选险种与通知书的险种是否符合
                    let ifExits = false;
                    var infoInsureType = $scope.insuranceinfoGridOptions.data[0].insurancepk.name;
                    for (let i = 0; i < $scope.insureType.length; i++) {
                        let name1 = $scope.getInsureName($scope.insureType[i].INSURE_TYPE_ID);
                        if (name1 == infoInsureType || (name1 == "网络安全保险" && infoInsureType == "网络信息安全特殊风险保险")) {
                            ifExits = true;
                        }
                    }
                    if(!ifExits){
                        return layer.alert("出单通知书中没有此险种!", {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    for (let i = 0; i < $scope.insureType.length; i++) {
                        var insuraneTypeName = $scope.getInsureName($scope.insureType[i].INSURE_TYPE_ID);
                        //判断选择的险种在出单通知书中是否存在
                        if (insuraneTypeName == infoInsureType || (insuraneTypeName == "网络安全保险" && infoInsureType == "网络信息安全特殊风险保险")) {
                            //已匹配
                            ifMatching = true;
                            $scope.hadDate = true;
                            if (null == $scope.VO.startdate) {
                                $scope.VO.startdate = $scope.getNowFormatDate();
                                $scope.VO.enddate = $scope.getNowFormatDate();
                                $scope.hadDate = false;
                            }
                            behoder = $scope.insureType[i].insurebeHolde;
                            company = $scope.insureType[i].insureCompany;
                            $scope.ALL_FEE = $scope.insureType[i].ALL_FEE;
                            $scope.VO.insurancetotalmoney = $scope.insureType[i].ALL_FEE;
                            $scope.insuranceinfoGridOptions.data[0].insurancemoney = $scope.insureType[i].ALL_FEE;
                            $scope.insuranceinfoGridOptions.data[0].chargerate = $scope.insureType[i].INSURANCE_RATE_MIN;
                            // $scope.VO.startdate=$scope.insureType[i].INSURE_START_DATE;
                            // $scope.VO.enddate=$scope.insureType[i].INSURE_END_DATE;
                            var additionalInsureVOList = $scope.insureType[i].additionalInsureGridData
                            if (additionalInsureVOList != undefined && additionalInsureVOList != null && additionalInsureVOList.length > 0) {
                                for (let j = 0; j < additionalInsureVOList.length; j++) {
                                    var insuranceinfoVO = {};
                                    insuranceinfoVO.maininsurance = 'N';
                                    insuranceinfoVO.vdef1 = additionalInsureVOList[j].insuranceName;
                                    insuranceinfoVO.insurancemoney = Number(additionalInsureVOList[j].insuranceMoney);
                                    insuranceinfoVO.chargerate = additionalInsureVOList[j].chargerate;
                                    $scope.insuranceinfoGridOptions.data.push(insuranceinfoVO);
                                }
                            }
                            var insuranceinfoArray = $scope.insuranceinfoGridOptions.data;
                            $scope.VO.insurancetotalcharge = 0;
                            for (let i = 0; i < insuranceinfoArray.length; i++) {
                                let startDate = new Date($scope.VO.startdate).getTime();
                                let endDate = new Date($scope.VO.enddate).getTime();
                                let yearStart = new Date($scope.VO.startdate);
                                let yearStart1 = new Date($scope.VO.startdate);
                                let yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                                let time = yearEnd - yearStart.getTime();
                                let datetime = (parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000));
                                if (!datetime) {
                                    return layer.alert("请先选择保险起期", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                insuranceinfoArray[i].insurancecharge = (parseFloat(insuranceinfoArray[i].insurancemoney) * parseFloat(insuranceinfoArray[i].chargerate) * datetime).toFixed(2);
                                $scope.VO.insurancetotalcharge = eval(parseFloat($scope.VO.insurancetotalcharge).toFixed(2)) + eval(parseFloat(insuranceinfoArray[i].insurancecharge).toFixed(2));
                            }
                            for (let c = 0; c < $scope.insureType[i].insureCompany.length; c++) {
                                let cid = $scope.insureType[i].insureCompany[c].insureCompanyId;
                                if (c == $scope.insureType[i].insureCompany.length - 1) {
                                    cids += "-" + cid + "-";
                                } else {
                                    cids += "-" + cid + "-" + ",";
                                }
                            }
                            $scope.getInsureCompany(cids);
                            for (let d = 0; d < $scope.insureType[i].insurebeHolde.length; d++) {
                                let id = $scope.insureType[i].insurebeHolde[d].BEHOLDER_ID;
                                if (id.length > 20) {
                                    id = id.substr(id.length - 20, id.length);
                                }
                                if (d == $scope.insureType[i].insurebeHolde.length - 1) {
                                    ids += "-" + id + "-";
                                } else {
                                    ids += "-" + id + "-" + ",";
                                }
                            }
                            $scope.VO.behoder = behoder;
                            $scope.company = company;
                            $scope.VO.ids = new Array();
                            $scope.VO.ids.push(ids);
                            let data = new Object();
                            data.ids = $scope.VO.ids[0];
                            $http.post($scope.basePath + 'insuranceScheme/queryInsurancedmanByUp', {
                                data: angular.toJson(data),
                                page: 0,
                                pageSize: 100000,
                                fields: angular.toJson($scope.queryData)
                            }).success(function (response) {
                                if (response.code == 200) {
                                    rows = response.result.Rows;
                                    if (null == $scope.VO.updateType || $scope.VO.updateType != '1') {
                                        $scope.insurancedmanGridOptions.data = new Array();
                                    }
                                    for (let j = 0; j < rows.length; j++) {
                                        let insurancedmanpk = {
                                            pk: rows[j].pk,
                                            insurancedmanpk: {
                                                pk: rows[j].pk,
                                                name: rows[j].name,
                                                enumEntkind_pk: rows[j].enumEntkind_name,
                                                code: rows[j].code,
                                                billstatus: rows[j].BILLSTATUS,
                                                tradetype_name: rows[j].tradetype_name,
                                                tradetype_code: rows[j].tradetype_name,
                                                c1Province_name: rows[j].c1Province_name,
                                                pk_org: rows[j].PK_ORG,
                                                c_1_entkind: rows[j].C_1_ENTKIND,
                                                c_0_upcostomer: rows[j].C_0_UPCOSTOMER,
                                                enumEntkind_name: rows[j].enumEntkind_name,
                                                c_1_province: rows[j].C_1_PROVINCE,
                                                enumEntkind_code: rows[j].enumEntkind_name,
                                                c_0_type: rows[j].C_0_TYPE,
                                                c_1_institution: rows[j].C_1_INSTITUTION,
                                                enum_entkind: rows[j].ENUM_ENTKIND,
                                                tradetype_pk: rows[j].C_0_TRADETYPE
                                            },
                                            insurancedmanlinkman: rows[j].insurancedmanlinkman,
                                            insurancedman: rows[j].name,
                                            insurancedmanaddr: rows[j].c_0_address,
                                        };
                                        if (null == $scope.insurancedmanGridOptions.data) {
                                            $scope.insurancedmanGridOptions.data = new Array();
                                        }
                                        let temp = true;
                                        for (let k = 0; k < $scope.insurancedmanGridOptions.data.length; k++) {
                                            if ($scope.insurancedmanGridOptions.data[k].pk == insurancedmanpk.pk) {
                                                temp = false;
                                            }
                                        }
                                        if (temp) {
                                            $scope.insurancedmanGridOptions.data.push(insurancedmanpk);
                                        }
                                    }
                                    for (let ins = 0; ins < $scope.insurancedmanGridOptions.data.length; ins++) {
                                        for (let be = 0; be < behoder.length; be++) {
                                            if ($scope.insurancedmanGridOptions.data[ins].pk == behoder[be].BEHOLDER_ID) {
                                                if ($scope.VO.behoder[be].ASSETS_INSURE_VALUE) {
                                                    $scope.insurancedmanGridOptions.data[ins].insurancemoney = $scope.VO.behoder[be].ASSETS_INSURE_VALUE;
                                                } else {
                                                    $scope.insurancedmanGridOptions.data[ins].insurancemoney = $scope.VO.behoder[be].BEHOLDER_INSURANCEMONEY;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (!$scope.hadDate) {
                                    $scope.VO.startdate = $scope.insureType[i].INSURE_START_DATE;
                                    $scope.VO.enddate = $scope.insureType[i].INSURE_END_DATE;
                                    if ($scope.insureType[i].INSURE_TYPE_ID == 'constructionPay') {
                                        $scope.VO.startdate = $scope.insureType[i].insurance_preiod_start;
                                        $scope.VO.enddate = $scope.insureType[i].insurance_preiod_end;
                                    }
                                }
                                layer.closeAll('loading');
                            });
                        } else {
                            if(!ifMatching){
                                $scope.VO.ids = new Array();
                                $scope.VO.ids.push("''");
                            }
                        }
                    }
                } else {
                    $scope.VO.ids = new Array();
                }
            }
        }, true);

        $scope.$watch('VO.insurancebillkindNO', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.SuperForm) {
                return;
            }
            if ($scope.isEdit) {
                $scope.VO['insurancebillkindNOName'] = $rootScope.SELECT.INSURANCEBILLKIND[newVal].name;
            }
        }, true);

        $scope.$watch('VO.vdef12', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.SuperForm) {
                return;
            }
            if ($scope.isEdit) {
                $scope.VO['vdef12Name'] = $rootScope.SELECT.BUSINESSTYPE[newVal].name;
            }
        }, true);

        $scope.$watch('VO.vdef10NO', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.SuperForm) {
                return;
            }
            if ($scope.isEdit) {
                $scope.VO['vdef10NOName'] = $rootScope.SELECT.VDEF10[newVal].name;
            }
        }, true);

        $scope.$watch('VO.ifGetFee', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.SuperForm) {
                return;
            }
            $scope.ifCheckFee();
        }, true);
        //90的校验
        $scope.$watch('VO.startdate', function (newVal, oldVal) {
            if ($scope.SuperForm) {
                return;
            }
            if (!$scope.isEdit) {
                return;
            }
            // || (!angular.isUndefined($scope.VO.pkReport))
            if (newVal === oldVal || newVal == undefined || newVal == null) return;

            if ($scope.isEdit) {

                let olddatval = "";
                if (oldVal != null) {
                    olddatval = new Date(oldVal).format("yyyy-MM-dd");
                    ;
                }
                let newdatval = "";
                if (newVal != null) {
                    newdatval = new Date(newVal).format("yyyy-MM-dd");
                    ;
                }
                if (newdatval == olddatval) {
                    return;
                }
                let now = new Date().getTime();
                let selected = new Date(newVal).getTime();
                let dates = (new Date(newVal).setFullYear(new Date(newVal).getFullYear() + 1));
                //如果结束日期已经有值了，那就不改变结束日期的值
                $scope.VO.enddate = $scope.VO.enddate!=null ? $scope.VO.enddate : new Date(dates).setDate(new Date(dates).getDate() - 1);
                if ($scope.VO.pkReport) {
                    return;
                }
                $scope.msgFlag = false;

                let startDate = new Date($scope.VO.startdate).getTime();
                let endDate = new Date($scope.VO.enddate).getTime();
                // let days = new Date($scope.VO.startdate).getFullYear();
                // let yearStart = new Date(new Date($scope.VO.startdate).getFullYear(), 01, 01).getTime();
                // let yearEnd = new Date(new Date($scope.VO.startdate).getFullYear(), 12, 31).getTime();
                let yearStart = new Date($scope.VO.startdate);
                let yearStart1 = new Date($scope.VO.startdate);
                let yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                let time = yearEnd - yearStart.getTime();
                let datetime = parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000);
                if (!datetime) {
                    return layer.alert("请先选择保险起期", {skin: 'layui-layer-lan', closeBtn: 1});
                }
                let insurancemanData = $scope.insurancemanGridOptions.data
                if (insurancemanData != null) {
                    for (let i = 0; i < insurancemanData.length; i++) {
                        let insurancemanDatas = insurancemanData[i];
                        if (insurancemanDatas.insurancemanpk) {
                            let agreementEnd = insurancemanDatas.insurancemanpk.agreement_end;
                            let agreementEndTime = new Date(agreementEnd).getTime();
                            if ((startDate - agreementEndTime) > 0) {
                                $scope.childFlag = false;
                                layer.alert(data.row.insurancemanpk.name + " 保险公司协议信息已经过期，请录入新的协议信息!", {skin: 'layui-layer-lan', closeBtn: 1});
                                data.row.insurancemanpk = null;
                                return;
                            } else {
                                $scope.childFlag = true;
                            }
                        }
                    }
                }
                if ($scope.VO.estimatepk) {
                    let agreementEnd = $scope.VO.estimatepk.agreement_end;
                    let agreementEndTime = new Date(agreementEnd).getTime();
                    if ((startDate - agreementEndTime) > 0) {
                        $scope.childFlag = false;
                        $scope.VO.estimatepk = null ;
                        return layer.alert($scope.VO.estimatepk.name + " 客户协议信息已经过期，请录入新的协议信息!", {skin: 'layui-layer-lan', closeBtn: 1});
                    } else {
                        $scope.childFlag = true;
                    }
                }
                if ($scope.insuranceinfoGridOptions.data) {
                    for (let i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                        $scope.insuranceinfoGridOptions.data[i].insurancecharge = (parseFloat($scope.insuranceinfoGridOptions.data[i].insurancemoney) * parseFloat($scope.insuranceinfoGridOptions.data[i].chargerate) * datetime).toFixed(2);
                    }
                }
            }
        }, true);
        $scope.$watch('VO.enddate', function (newVal, oldVal) {
            if ($scope.SuperForm) {
                return;
            }
            if (!$scope.isEdit) {
                return;
            }
            let olddatval = "";
            if (oldVal != null) {
                olddatval = new Date(oldVal).format("yyyy-MM-dd");
            }
            let newdatval = "";
            if (newVal != null) {
                newdatval = new Date(newVal).format("yyyy-MM-dd");
            }
            if (newdatval == olddatval) {
                return;
            }
            // || (!angular.isUndefined($scope.VO.pkReport))
            if (typeof (oldVal) == "object" || newVal === oldVal || olddatval == newdatval || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                let startDate = new Date($scope.VO.startdate).getTime();
                let endDate = new Date($scope.VO.enddate).getTime();
                let yearStart = new Date($scope.VO.startdate);
                let yearStart1 = new Date($scope.VO.startdate);
                let yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                let time = yearEnd - yearStart.getTime();
                let datetime = parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000);
                if (!datetime) {
                    return layer.alert("请先选择保险起期", {skin: 'layui-layer-lan', closeBtn: 1});
                }
                if ($scope.insuranceinfoGridOptions.data) {
                    for (let i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                        $scope.insuranceinfoGridOptions.data[i].insurancecharge = (parseFloat($scope.insuranceinfoGridOptions.data[i].insurancemoney) * parseFloat($scope.insuranceinfoGridOptions.data[i].chargerate) * datetime).toFixed(2);
                    }
                }
            }
        }, true);

        $scope.$watch('VO.estimatepk.name', function (newVal, oldVal) {
            if ($scope.SuperForm) {
                return;
            }
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.estimatepk.c_0_address) {
                    $scope.VO.estimateaddr = $scope.VO.estimatepk.c_0_address;
                } else {
                    $scope.VO.estimateaddr = "";
                }
                if ($scope.VO.startdate) {
                    if ($scope.VO.startdate > $scope.VO.estimatepk.agreement_end) {
                        $scope.childFlag = false;
                        $scope.VO.estimatepk = null;
                        return layer.alert($scope.VO.estimatepk.name + " 客户协议信息已经过期，请录入新的协议信息!", {skin: 'layui-layer-lan', closeBtn: 1});
                    } else {
                        $scope.childFlag = true;
                    }
                }
                if ($scope.VO.estimatepk.pk) {
                    $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: $scope.VO.estimatepk.pk}).success(function (response) {
                        if (response && response.code == "200") {
                            $scope.VO.estimateaddr = response.result.c0Address;
                            if (response.result.linkman != null && response.result.linkman.length > 0) {
								//2022-07-21 mx 投保人弹框
                                if (response.result.linkman.length == 1) {
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
                        }
                        //重置投保人地址为保单库地址
                        if($scope.VO.insuranceData && $scope.VO.insuranceData.POSTAL_ADDRESS && $scope.VO.insuranceData.POSTAL_ADDRESS!=''){
                            $scope.VO.estimateaddr = $scope.VO.insuranceData.POSTAL_ADDRESS;
                        }
                    });

                } else {
                    $scope.VO.estimatelinkman = "";
                    $scope.VO.estimatelinktel = "";

                }
            }
        }, true);
        $scope.$watch('VO.pkProject.name', function (newVal, oldVal) {
            if ($scope.SuperForm) {
                return;
            }
            if (!$scope.isEdit) {
                return;
            }
            if ($scope.VO.pkProject.name != null) {
                $scope.isDisableds = false;
            } else {
                $scope.VO.informCode = "";
                $scope.VO.pkInsureProject = "";
                $scope.VO.insureProjectCode = "";
                $scope.VO.issueNoticeName = "";
                $scope.insureType = "";
                $scope.VO.ifuhv = 0;
                $scope.isDisableds = true;
            }
            $scope.checkBusitype($scope.VO.pkProject.busi_type);
            //保单库跳转时没有带过来投保人的话，才带入立项的投保人
            if($scope.VO.insuranceData && $scope.VO.insuranceData.UUID && $scope.VO.insuranceData.UUID != ""){
                if(!$scope.VO.estimatepk || ($scope.VO.estimatepk && (!$scope.VO.estimatepk.pk || $scope.VO.estimatepk.pk ==""))){
                    $scope.getEstimate(newVal, oldVal);
                }else{
                    if ($scope.VO.pkProject.pk) {
                        $http.post($scope.basePath + "propertyProject/findOne", {pk: $scope.VO.pkProject.pk}).success(function (response) {
                            if (response && response.code == "200") {
                                if (response.result) {
                                    let project = response.result;
                                    $scope.projectEval(project);
                                }
                            }
                        });
                    }
                }
            }else{
                $scope.getEstimate(newVal, oldVal);
            }
        }, true);
        $scope.$watch('SuperVOProxy.pkProject.name', function (newVal, oldVal) {
            if (!$scope.SuperForm) {
                return;
            }
            if ($scope.SuperVOProxy.pkProject.name != null) {
                $scope.isDisableds = false;
            } else {
                $scope.isDisableds = true;
            }
            $scope.checkBusitype($scope.SuperVOProxy.pkProject.busi_type);
            $scope.SuperVOProxy.pkProject.name
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.SuperForm) {
                if ($scope.SuperVOProxy.pkProject.pk) {
                    $http.post($scope.basePath + "propertyProject/findOne", {pk: $scope.SuperVOProxy.pkProject.pk}).success(function (response) {
                        if (response && response.code == "200") {
                            if (response.result) {
                                if ($scope.SuperVOProxy.estimatepk == null || $scope.SuperVOProxy.estimatepk.pk == null || $scope.SuperVOProxy.estimatepk.pk == '') {
                                    $scope.SuperVOProxy.estimatepk = response.result.cinsureman;
                                }
                                $scope.SuperVOProxy.pkC0Tradetype = response.result.pkC0Tradetype;
                                $scope.SuperVOProxy.projectkind = response.result.pkC0Tradetype && response.result.pkC0Tradetype.name;
                                $scope.SuperVOProxy.busi_type = response.result.busi_type;
                                $scope.SuperVOProxy.temporaryPlan = response.result.temporaryPlan;
                            }
                        }
                    });
                } else {
                    $scope.SuperVOProxy.estimatelinkman = "";
                }
            }
        }, true);
        //应收佣金
        $scope.$watch('VO.receivefeeperiod', function (newVal, oldVal) {
            if ($scope.SuperForm) {
                return;
            }
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            let reData = new Array();
            if ($scope.isEdit) {
                //删除本类型子表信息
                let length = $scope.paymentGridOptions.data.length;
                for (let i = 0; i < length; i++) {
                    if ($scope.paymentGridOptions.data[i].typeMoneyNO != 3) {
                        reData.push($scope.paymentGridOptions.data[i]);
                    }
                }
                if (!isNaN(newVal)) {
                    let array = $scope.insurancemanGridOptions.data;
                    for (let k = 0; k < array.length; k++) {
                        for (let i = 1; i <= newVal; i++) {
                            let data = {
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
            }
            $scope.paymentGridOptions.data = reData;
            $scope.VO.payment = reData;
        }, true);
        $scope.$watch('SuperVOProxy.receivefeeperiod', function (newVal, oldVal) {
            if (!$scope.SuperForm) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.SuperForm) {
                //删除本类型子表信息
                let length = $scope.paymentGridOptions.data.length;
                let index = 0;
                for (let i = 0; i < length; i++) {
                    if ($scope.paymentGridOptions.data[i].typeMoneyNO == 3) {
                        index++;
                    }
                }
                if (!isNaN(newVal)) {
                    let array = $scope.insurancemanGridOptions.data;
                    if ((index / array.length) < newVal) {
                        let num = newVal - (index / array.length);
                        for (let k = 0; k < array.length; k++) {
                            for (let i = 1; i <= num; i++) {
                                let data = {
                                    stages: index / array.length + i,
                                    typeMoneyNO: 3,
                                    typeMoney: '应收佣金',
                                    company: array[k].insurancemanpk,
                                    typeCompany: '保险公司',
                                    typeCompanyNO: 3
                                };
                                $scope.paymentGridOptions.data[$scope.paymentGridOptions.data.length] = data;
                            }
                        }
                    }
                }
            }
            $scope.VO.payment = $scope.paymentGridOptions.data;
        }, true);
        //应收保费
        $scope.$watch('VO.receiveperiod', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            let reData = new Array();
            if ($scope.isEdit) {
                //删除本类型子表信息
                let length = $scope.paymentGridOptions.data.length;
                for (let i = 0; i < length; i++) {
                    if ($scope.paymentGridOptions.data[i].typeMoneyNO != 1) {
                        reData.push($scope.paymentGridOptions.data[i]);
                    }
                }
                if (!isNaN(newVal)) {
                    for (let i = 1; i <= newVal; i++) {
                        let data = {
                            stages: i,
                            typeMoneyNO: 1,
                            typeMoney: '应收保费',
                            company: $scope.VO.estimatepk,
                            typeCompany: '保险公司',
                            typeCompanyNO: 3
                        };
                        reData.push(data);
                    }
                }
            }
            $scope.paymentGridOptions.data = reData;
        }, true);

        $scope.$watch('SuperVOProxy.receiveperiod', function (newVal, oldVal) {
            if (!$scope.SuperForm) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.SuperForm) {
                //删除本类型子表信息
                let length = $scope.paymentGridOptions.data.length;
                let index = 0;
                for (let i = 0; i < length; i++) {
                    if ($scope.paymentGridOptions.data[i].typeMoneyNO == 1) {
                        index++;
                    }
                }
                if (!isNaN(newVal)) {
                    if (index < newVal) {
                        let num = newVal - index;
                        for (let i = 1; i <= num; i++) {
                            let data = {
                                stages: ++index,
                                typeMoneyNO: 1,
                                typeMoney: '应收保费',
                                company: $scope.SuperVOProxy.estimatepk,
                                typeCompany: '保险公司',
                                typeCompanyNO: 3
                            };
                            $scope.paymentGridOptions.data[$scope.paymentGridOptions.data.length] = data;
                        }
                    }
                }
            }
        }, true);
        //应解付保费总期数
        $scope.$watch('VO.payperiod', function (newVal, oldVal) {

            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            let reData = new Array();
            if ($scope.isEdit) {
                //删除本类型子表信息
                let length = $scope.paymentGridOptions.data.length;
                for (let i = 0; i < length; i++) {
                    if ($scope.paymentGridOptions.data[i].typeMoneyNO != 2) {
                        reData.push($scope.paymentGridOptions.data[i]);
                    }
                }
                if (!isNaN(newVal)) {
                    let array = $scope.insurancemanGridOptions.data;
                    for (let k = 0; k < array.length; k++) {
                        for (let i = 1; i <= newVal; i++) {
                            let data = {
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
            }
            $scope.paymentGridOptions.data = reData;
        }, true);
        $scope.$watch('SuperVOProxy.payperiod', function (newVal, oldVal) {

            if (!$scope.SuperForm) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.SuperForm) {
                //删除本类型子表信息
                let length = $scope.paymentGridOptions.data.length;
                let index = 0;
                for (let i = 0; i < length; i++) {
                    if ($scope.paymentGridOptions.data[i].typeMoneyNO == 2) {
                        index++;
                    }
                }
                if (!isNaN(newVal)) {
                    let array = $scope.insurancemanGridOptions.data;
                    if ((index / array.length) < newVal) {
                        let num = newVal - (index / array.length);
                        for (let k = 0; k < array.length; k++) {
                            for (let i = 1; i <= num; i++) {
                                let data = {
                                    stages: index / array.length + i,
                                    typeMoneyNO: 2,
                                    typeMoney: '解付保费',
                                    company: array[k].insurancemanpk,
                                    typeCompanyNO: 3,
                                    typeCompany: '保险公司',
                                    type_business: 1
                                };
                                $scope.paymentGridOptions.data[$scope.paymentGridOptions.data.length] = data;
                            }
                        }
                    }
                }
            }
        }, true);
        // 收付款变动
        $scope.$watch('VO.payment', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.SuperForm) {
                return;
            }
            //@zhangwj【YDBXJJ-1979】 财产险保单，财务处理结算单后，收付款信息中的“未结算金额”显示不正确 line 1383 & 1423
            if ($scope.isEdit) {
                let array = $scope.VO.payment;
                for (let i = 0; i < array.length; i++) {
                    var rowEntity = $scope.VO.payment[i];
                    if (rowEntity.typeMoneyNO == 1) {
                        rowEntity.planMoney = parseFloat(eval($scope.VO.receivemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                        rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.receivemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                    }
                    for (let j = 0; j < $scope.VO.insuranceman.length; j++) {
                        if (array[i].company.name == $scope.VO.insuranceman[j].insurancemanpk.name
                            && array[i].$$hashKey == rowEntity.$$hashKey) {
                            if (rowEntity.typeMoneyNO == 3) {
                                rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].feemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].feemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                            }
                            if (rowEntity.typeMoneyNO == 2) {
                                if ($scope.VO.insuranceman[j].pay != 'Y') {
                                    if ($scope.VO.insuranceman.length > 1 && $scope.VO.insuranceman[j].chiefman != 'Y') {
                                        rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                        rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                    } else if ($scope.VO.insuranceman.length > 1 && $scope.VO.insuranceman[j].chiefman != 'Y') {
                                        rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                        rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                    } else {
                                        rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                        rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                    }

                                } else {
                                    rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                    rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);

                                }

                            }

                        }
                    }

                }
            }
        }, true);

        $scope.$watch('insurancedmanGridOptions.data', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.SuperForm) {
                return;
            }
            if ($scope.isEdit) {
                let data = $rootScope.diffarray(newVal, oldVal);
                if (data && data.col == 'insurancedmanpk') {
                    if (data.row.insurancedmanpk) {
                        if (data.row.insurancedmanpk.pk) {
                            if (data.row.insurancedmanpk.c_0_address) {
                                data.row.insurancedmanaddr = data.row.insurancedmanpk.c_0_address;
                            } else {
                                // data.row.insurancedmanaddr = '不详';
                            }
                            $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: data.row.insurancedmanpk.pk}).success(function (response) {
                                if (response && response.code == "200") {
                                    data.row.insurancedmanaddr = response.result.c0Address;
                                    if (response.result.linkman != null && response.result.linkman.length > 0) {
										//2022-07-21 mx 被保人弹框
                                        if (response.result.linkman.length == 1) {
                                            data.row.insurancedmanlinkman = response.result.linkman[0].name;
                                            data.row.insurancedmanlinktel = response.result.linkman[0].tele;
                                            if(data.row.insurancedmanaddr == null || data.row.insurancedmanaddr == ''){
                                                data.row.insurancedmanaddr = response.result.linkman[0].address;
                                            }
                                        }else{
                                            $scope.linkManOptions.data = response.result.linkman;
                                            $scope.insurancemanhashKey = data.row.$$hashKey;
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
                                        data.row.insurancedmanlinkman = '不详';
                                        data.row.insurancedmanlinktel = '不详';
                                    }
                                }
                            });
                        }
                    } else {
                    }
                }
            }
        }, true);
        $scope.$watch('insurancemanGridOptions.data', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.SuperForm) {
                return;
            }
            if ($scope.isEdit) {
                let data = $rootScope.diffarray(newVal, oldVal);
                if (data && data.col == 'insurancemanpk') {
                    if (data.row.insurancemanpk) {
                        if ((data.row.insurancemanpk.pk && !data.oldValue) || data.row.insurancemanpk.pk != data.oldValue.pk) {
                            if ($scope.VO.startdate) {
                                if ($scope.VO.startdate > data.row.insurancemanpk.agreement_end) {
                                    $scope.childFlag = false;
                                    layer.alert(data.row.insurancemanpk.name + " 保险公司协议信息已经过期，请录入新的协议信息!", {skin: 'layui-layer-lan', closeBtn: 1});
                                    data.row.insurancemanpk = null;
                                    return;
                                } else {
                                    $scope.childFlag = true;
                                }
                            }
                            if (data.row.insurancemanpk.c_0_address) {
                                data.row.insuranceaddr = data.row.insurancemanpk.c_0_address;
                            } else {
                                // data.row.insuranceaddr = '不详';
                            }
                            $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: data.row.insurancemanpk.pk}).success(function (response) {
                                if (response && response.code == "200") {
                                    data.row.insuranceaddr = response.result.c0Address;
                                    if (response.result.linkman != null && response.result.linkman.length > 0) {
										//2022-07-21 mx 保险人弹框
                                        if (response.result.linkman.length == 1) {
                                            data.row.insurancelinkman = response.result.linkman[0].name;
                                            data.row.insurancelinktel = response.result.linkman[0].tele;
                                            if(data.row.insuranceaddr == null || data.row.insuranceaddr == ''){
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
                    let length = $scope.paymentGridOptions.data.length;
                    if (length > 0 && $scope.VO.receivefeeperiod > 0) {

                        //删除本类型子表信息
                        for (let i = 0; i < length; i++) {
                            for (let j = 0; j < oldVal.length; j++) {

                                if ($scope.paymentGridOptions.data[i].company.pk == oldVal[j].insurancemanpk.pk) {
                                    $scope.paymentGridOptions.data[i].company = newVal[j].insurancemanpk;
                                }

                            }
                        }

                    }
                }
                //@zhangwj【YDBXJJ-1979】 财产险保单，财务处理结算单后，收付款信息中的“未结算金额”显示不正确 line 1505 - 1535
                for (let i = 0; i < $scope.VO.insuranceman.length; i++) {
                    let inData = $scope.insurancemanGridOptions.data;
                    var rowEntity = $scope.VO.insuranceman[i];
                    var oldEntity = oldVal[i];
                    var newEntity = newVal[i];
                    if (oldEntity && oldEntity.feemount == newEntity.feemount) {
                        if (rowEntity.insurancemoney) {
                            rowEntity.feemount = parseFloat(rowEntity.insurancemoney).toFixed(2);
                        }
                        if (rowEntity.vdef4 == 'Y') {
                            rowEntity.feemount = parseFloat(rowEntity.feemount / 1.06).toFixed(2);
                        }
                        if (rowEntity.vdef2 == 'Y') {
                            rowEntity.feemount = parseFloat(rowEntity.feemount * 1.06).toFixed(2);
                        }
                        if (rowEntity.commisionrate) {
                            rowEntity.feemount = parseFloat(eval(rowEntity.feemount) * eval(rowEntity.commisionrate) / 100).toFixed(2);
                        }
                    }
                    if (rowEntity.commisionrate) {
                        $scope.VO.paymount = parseFloat($scope.calPay(inData)).toFixed(2);
                    }
                    if ((rowEntity.feemount || !rowEntity.feemount) && rowEntity.commisionrate != null && rowEntity.commisionrate != "") {
                        let array = $scope.insurancemanGridOptions.data;
                        $scope.VO.commisiontotalnum = 0;
                        for (let i = 0; i < array.length; i++) {
                            $scope.VO.commisiontotalnum = parseFloat(eval($scope.VO.commisiontotalnum) + eval(array[i].feemount));
                        }
                        $scope.VO.receivefeemount = parseFloat($scope.VO.commisiontotalnum).toFixed(2);
                    }
                }
            }
            ;
        }, true);

        //险种信息如果手动输入没有主键，此处不允许手动输入
        $scope.$watch('VO.insuranceinfo', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.SuperForm) {
                return;
            }
            if ($scope.isEdit && newVal.maininsurance != 'Y') {
                let data = $rootScope.diffarray(newVal, oldVal);
                if (data && oldVal && data.col == 'insurancepk') {
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

        //险种信息如果手动输入没有主键，此处不允许手动输入
        $scope.$watch('insurancemanGridOptions.data', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.SuperForm) {
                return;
            }
            if ($scope.isEdit) {
                let data = $rootScope.diffarray(newVal, oldVal);
                if (data && oldVal && data.col == 'insurancemanpk') {
                    if (data.row.insurancemanpk) {
                        if (data.row.insurancemanpk.pk == undefined) {
                            data.row.insurancemanpk = '';
                        }
                        //如果第一次选择了，第二次手动输入判断
                        else if (data.newValue.pk == data.oldValue.pk) {
                            data.row.insurancemanpk = '';
                        }
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
                    for (let i = 0; i < $scope.insurancedmanGridOptions.data.length; i++) {
                        if ($scope.insurancedmanGridOptions.data[i].$$hashKey == $scope.insurancemanhashKey){
                            $scope.insurancedmanGridOptions.data[i].insurancedmanlinkman = rows[0].name;
                            $scope.insurancedmanGridOptions.data[i].insurancedmanlinktel = rows[0].tele;
                        }
                    }
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

        //特殊修改确认修改方法
        $scope.onWriteBack = function () {
            if ($scope.supertData != null && $scope.supertData.id != null) {
                $http.post($rootScope.basePath + "superUpdateContorller/onWriteBack",
                    {data: angular.toJson($scope.supertData)}).success(function (response) {
                    if (response != null) {
                        layer.alert(response.msg);
                        if ($scope.superngDialog != null) {
                            ngDialog.close();
                            $scope.initPage();
                            $scope.isGrid = true;
                        }
                        $scope.SuperForm = false;
                        $scope.onCard(scope.supertData.billid);
                    }
                });
            }
        }

        $scope.onCloseSuperngDialog = function () {
            if ($scope.superngDialog != null) {
                ngDialog.close();
            }
        }

        $scope.onImportUploads = function (type) {
            if (type) {
                $("#inputFile").click();
            } else {
                let file = document.getElementById("inputFile").files[0];
                if (file != null) {
                    layer.load(2);
                    let form = new FormData();
                    form.append('file', file);
                    form.append('table', 'gLife');
                    $http({
                        method: 'POST',
                        url: $scope.basePath + 'propertyInsurance/upLoadFile',
                        data: form,
                        headers: {'Content-Type': undefined, 'x-auth-token': window.sessionStorage.getItem("token")},
                        transformRequest: angular.identity
                    }).success(function (data) {
                        let obj = document.getElementById('inputFile');
                        obj.outerHTML = obj.outerHTML;
                        $scope.queryForGrid($scope.QUERY);
                        console.log('upload success');
                        layer.closeAll('loading');
                        if (data.msg) {
                            return layer.alert(data.msg, {
                                skin: 'layui-layer-lan',
                                closeBtn: 1
                            });
                        }
                    }).error(function (data) {
                        layer.closeAll('loading');
                        console.log('upload fail');
                    })
                }

            }
        };


        $scope.onUploads = function (selectTabName) {
            $scope.isSubDisabled = false;
            $scope.isUploadAnytime = false;
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
                    angular.forEach(value, function (item) {
                        $scope.dealAttachmentBGridOptions.data.push(item);
                    });
                }
            }, function (reason) {

            });
        };

        $scope.onDownLoads = function () {
            let rows = null;
            rows = $scope.VO.dealAttachmentB;
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
        $scope.onDownLoadsCard = function (id) {
            let ids = [];
            ids.push(id);
            let exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };
        $scope.onAdd = function () {
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
            $scope.agentParam = null;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $scope.VO.insurancedman = [];
            $scope.VO.insuranceman = [];
            $scope.insurancemanGridOptions.data = [];
            $scope.insurancedmanGridOptions.data = [];
            $scope.insuranceinfoGridOptions.data = [];
            $rootScope.onAddCheck($scope);
        };
        $scope.onFeeEdit = function () {
            $scope.isGrid = false;
            $scope.isDisableds = false;
            $scope.isDisabled = false;
            $scope.isFeeEdit = true;
            $scope.isClear = true;
            $scope.isEdit = true;
            $scope.isreplace = true;
        }
        /**
         * 修改
         */
        $scope.onEdit = function (type) {

            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            $scope.childFlag = true;
            $scope.isDisableds = false;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form = true;
                $scope.isGrid = false;
                let rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id);
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
                //如果是投保修改type为1
                if (type == 1) {
                    $scope.isDisabled = true;
                    $scope.isDisableds = true;
                    $scope.isEdit = false;
                    $scope.isUpdate = true;
                    $scope.VO.updateType = "1";
                } else {
                    $scope.VO.updateType = "0";
                }
                if (type == 2) {
                    $scope.isreplace = true;
                }
            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            }
        };

        //超级修改
        $scope.OnSuperUpdate = function () {
            let rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            $scope.findOneSuper(rows[0].id);
            // $scope.findOne(rows[0].id);
        }

        /**
         * 暂存
         */
        $scope.onTemporary = function (data) {
            $scope.VO.payment = $scope.paymentGridOptions.data;
            $scope.VO.insuranceinfo = $scope.insuranceinfoGridOptions.data;
            $scope.VO.insuranceman = $scope.insurancemanGridOptions.data;
            $scope.VO.insurancedman = $scope.insurancedmanGridOptions.data;
            $scope.VO.partner = $scope.partnerGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $scope.VO.policy = $scope.provisionalPolicyGridOptions.data;
            if (data) {
                let tablename = $scope.table_name;
                $http.post($rootScope.basePath + "temporary/insert", {
                    data: angular.toJson(data),
                    tablename: tablename
                }).success(function (response) {
                    if (response.code == 200) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        $scope.isDisableds = true;
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
                let rows = $scope.gridApi.selection.getSelectedRows();
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
                    if (!response.result.taskHis)
                        $scope.mess = false;
                    else
                        $scope.mess = true;
                    $scope.isBack = true;
                    $scope.isGrid = false;
                    $scope.isCard = true;
                    let insuranceType;
                    for (let i of $scope.VO.insuranceinfo) {
                        if (i.maininsurance == "Y") {
                            insuranceType = i.insurancepk.code;
                        }
                    }
                    var insureType = response.result.issueNotice.insureType;
                    $http.post($scope.basePath + "propertyInsurance/findTypeCode", {
                        insureType: insuranceType
                    }).success(function (response) {
                        if (response && response.code == "200" && $scope.VO.issueNotice) {
                            let dwzc_typecode = response.dwzc_typecode
                            for (let i of insureType) {
                                if (dwzc_typecode == i.INSURE_TYPE_ID) {
                                    $scope.insureClause = i;
                                }
                            }
                        }
                    })
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
                    //layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
        $scope.onDelete = function () {
            let rows = $scope.gridApi.selection.getSelectedRows();
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
                    let ids = [];
                    for (let i = 0; i < rows.length; i++) {
                        ids.push(rows[i].id);
                    }
                    layer.load(2);
                    $http.post($scope.basePath + "propertyInsurance/delete", {ids: angular.toJson(ids)}).success(function (response) {
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

        /**
         * 返回业务签报批复编号查询URL
         */
        $scope.reportUrl = function (param) {
            return "reportRef/queryForGrid?pk_project=" + param;
        }
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
            $scope.isUploadAnytime = true;
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
            if ($scope.SuperForm) {
                $scope.SuperForm = false;
                $scope.isGrid = true;
                $scope.initPage();
            }
            $scope.isDisabled = true;
            $scope.isDisableds = true;
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
            $scope.SuperForm = false;
            $scope.isFeeEdit = false;
            $scope.isDisabled = true;
            $scope.isDisableds = true;
            //阻止页面渲染
            $scope.form = false;
            $scope.card = false;
            //阻止页面渲染
            $scope.queryForGrid($scope.QUERY);
        };

        /**
         * 保存判断必输项
         */
        $scope.onSave = function () {
            if ($scope.isUploadAnytime) {
                $scope.VO.isUploadAnytime = true;
                $scope.onSaveVO();
                return;
            }
            //@zhangwj 2022-03-04 投保修改直接保存。不校验
            if ($scope.VO.updateType == "1") {
                $scope.onSaveVO();
                return;
            }
            // $scope.ifCheckFee();
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert(errEls[0].ngVerify.OPTS.message,
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    $scope.VO.insurancebillkindNOName = $rootScope.returnSelectName($scope.VO.insurancebillkindNO, "INSURANCEBILLKIND");
                    $scope.VO.vdef12Name = $rootScope.returnSelectName($scope.VO.vdef12, "BUSINESSTYPE");
                    $scope.VO.vdef10NOName = $rootScope.returnSelectName($scope.VO.vdef10NO, "VDEF10");
                    $scope.VO.vdef2Name = $rootScope.returnSelectName($scope.VO.vdef2, "YESNO");
                    $scope.childFlag = true;
                    //对当前日期与保单起始日期进行校验
                    let startdate = new Date($scope.VO.startdate).getTime();
                    let enddate = new Date($scope.VO.enddate).getTime();
                    if (startdate > enddate) {
                        return layer.alert("开始日期不能大于结束日期!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.VO.pkReport) {
                        $scope.msgFlag = false;
                    }
                    // if (!$scope.VO.pkReport) {
                    //     let now = new Date().getTime();
                    //     let selected = new Date($scope.VO.startdate).getTime();
                    //     let dates = (new Date($scope.VO.startdate).setFullYear(new Date($scope.VO.startdate).getFullYear() + 1));
                    //     $scope.msgFlag = false;
                    //     if (parseInt(((now - selected) / 24 / 3600 / 1000)) > 90 && $scope.VO.updateType != "1") {
                    //         if ($scope.VO.pkReport == null || $scope.VO.pkReport == "") {
                    //             // $scope.VO.startdate = '2018-01-01';
                    //             if ($scope.VO.c_protype == '网省公司') {
                    //                 if ($scope.VO.insuranceinfo) {
                    //                     for (let i = 0; i < insuranceArr.length; i++) {
                    //                         for (let j = 0; j < $scope.VO.insuranceinfo.length; j++) {
                    //                             if (insuranceArr[i] == $scope.VO.insuranceinfo[j].code) {
                    //                                 $scope.msgFlag = true;
                    //                                 $scope.childFlag = false;
                    //                                 $scope.msg = "对于业务来源是【网省公司的非团车业务】并且子表保险险种信息的主险种在财产一切险、财产基本险、财产综合险、机器损坏险、供电责任险、公众责任险六个险种之内的，公司各单位经办人员应在保单起保日期之前及时将保单信息录入业务系统;对于超过时限录入系统，即“起保日期早于当前日期”的保单，需要通过业务签报管理页面进行报批，注意：选择签报类型时请选择【保单录入延时说明】进行报批！";
                    //                                 break;
                    //                             } else {
                    //                                 $scope.msgFlag = true;
                    //                                 $scope.childFlag = false;
                    //                                 $scope.msg = "对于业务来源是【非网省公司的非团车业务】，公司各单位经办人员应在保单起保日期后65个工作日(90个自然日)内及时将保单信息录入业务系统;对于超过时限录入系统，即“当前日期-起保日期>90日”的保单，需要通过业务签报管理页面进行报批，注意：选择签报类型时请选择【保单录入延时说明】进行报批！";
                    //                                 break;
                    //                             }
                    //                         }
                    //                     }
                    //                 }
                    //             } else {
                    //                 $scope.msgFlag = true;
                    //                 $scope.childFlag = false;
                    //                 $scope.msg = "对于业务来源是【非网省公司的非团车业务】，公司各单位经办人员应在保单起保日期后65个工作日(90个自然日)内及时将保单信息录入业务系统;对于超过时限录入系统，即“当前日期-起保日期>90日”的保单，需要通过业务签报管理页面进行报批，注意：选择签报类型时请选择【保单录入延时说明】进行报批！";
                    //             }
                    //             if ($scope.msgFlag) {
                    //                 angular.alert($scope.msg);
                    //             }
                    //         }
                    //     }
                    // }
                    if ($scope.insuranceinfoGridOptions.data.length == 0) {
                        return layer.alert("保险险种信息子表不能为空!", {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.insuranceinfoGridOptions.data.length > 0) {
                        $scope.VO.insuranceinfo = $scope.insuranceinfoGridOptions.data;
                        angular.forEach($scope.VO.insuranceinfo, function (item) {
                            if(item.maininsurance == '' && item.maininsurance == null){
                                $scope.childFlag = false;
                                return layer.alert("主险种信息填写不全!", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            //有改动 20220916
                            if(item.maininsurance == 'N' && (item.vdef1 == '' || item.vdef1 == null)){
                                $scope.childFlag = false;
                                return layer.alert("非主险种信息填写不全!", {skin: 'layui-layer-lan', closeBtn: 1});

                                if (!item.insurancepk && item.maininsurance == 'Y') {
                                    $scope.childFlag = false;
                                    return layer.alert("险种信息子表中险种名称不可为空!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (!item.chargerate && item.maininsurance == 'Y') {
                                    $scope.childFlag = false;
                                    return layer.alert("险种信息子表中费率不可为空!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }
                            if(item.maininsurance == 'Y' && (item.insurancepk == '' || item.insurancepk == null)) {
                                $scope.childFlag = false;
                                return layer.alert("主险种信息填写不全!", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        })
                    }
                    let result = 0;
                    let chiefmanY = 0;
                    if ($scope.childFlag) {
                        if ($scope.insurancedmanGridOptions.data.length == 0) {
                            return layer.alert("被保险人信息子表不能为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        $scope.VO.insurancedman = $scope.insurancedmanGridOptions.data;
                        for (let i = 0; i < $scope.VO.insurancedman.length; i++) {
                            let item = $scope.VO.insurancedman[i];
                            //angular.forEach($scope.VO.insurancedman, function (item) {
                            if (!item.insurancedmanpk || !item.insurancedmanpk.name) {
                                $scope.childFlag = false;
                                return layer.alert("被保人信息子表中被保人不能为空!", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (!item.insurancedmanaddr) {
                                $scope.childFlag = false;
                                return layer.alert("被保人信息子表中被保人地址不能为空!", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (!item.insurancedmanlinktel) {
                                $scope.childFlag = false;
                                return layer.alert("被保人信息子表中被保人联系人电话不能为空!", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }

                        if ($scope.insurancemanGridOptions.data.length == 0) {
                            return layer.alert("保险人信息子表不能为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.insurancemanGridOptions.data.length > 0) {
                            var totalFeemount = 0;
                            $scope.VO.insuranceman = $scope.insurancemanGridOptions.data;
                            for (let i = 0; i < $scope.VO.insuranceman.length; i++) {
                                let item = $scope.VO.insuranceman[i];
                                //angular.forEach($scope.VO.insuranceman, function (item) {
                                if (item.feemount) {
                                    totalFeemount = totalFeemount + eval(item.feemount);
                                }
                                if (!item.insurancemanpk || !item.insurancemanpk.name) {
                                    $scope.childFlag = false;
                                    chiefmanY = 1;
                                    return layer.alert("保险人子表中保险人名称不可为空!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (!item.insurancerate) {
                                    $scope.childFlag = false;
                                    chiefmanY = 1;
                                    return layer.alert("保险人子表中的承保比例不能为0.00%!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (!item.insurancelinkman) {
                                    $scope.childFlag = false;
                                    chiefmanY = 1;
                                    return layer.alert("保险人子表中的保险人联系人姓名不能为空!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (!item.insurancelinktel) {
                                    $scope.childFlag = false;
                                    chiefmanY = 1;
                                    return layer.alert("保险人子表中的保险人联系电话不能为空!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (item.insurancerate < 0 || item.insurancerate > 100) {
                                    $scope.childFlag = false;
                                    chiefmanY = 1;
                                    return layer.alert("请检查保险人信息中的承保比例!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (item.chiefman == 'Y') {
                                    chiefmanY = chiefmanY + 1;
                                }
                                result = parseFloat(result) + parseFloat(item.insurancerate);
                                if (item.insurancemanpk.name == $scope.VO.estimatepk.name) {
                                    $scope.childFlag = false;
                                    chiefmanY = 1;
                                    return layer.alert("保险人与投保人不能相同!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }
                            //计算保险人信息子表中的承包比例加和
                            let array = $scope.insurancemanGridOptions.data;
                            let totalInsurancerate = 0;
                            for (let i = 0; i < array.length; i++) {
                                totalInsurancerate += parseFloat(array[i].insurancerate);
                            }
                            if (totalInsurancerate.toFixed(2) > 100 || totalInsurancerate.toFixed(2) < 100) {
                                return layer.alert("保险人信息子表中的承保比例加和应等于100!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                        if (chiefmanY <= 0) {
                            $scope.childFlag = false;
                            return layer.alert("保险人信息子表必须有一个保险人主承保!", {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if (!$scope.ifGetFee() && parseFloat($scope.VO.commisiontotalnum).toFixed(2) != parseFloat(totalFeemount).toFixed(2)) {
                            $scope.childFlag = false;
                            return layer.alert("保险人子表佣金加和不等于佣金总金额!", {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if (result.toFixed(2) != 100) {
                            $scope.childFlag = false;
                            return layer.alert("保险人信息子表保险保费加和不等于签单总保费！", {skin: 'layui-layer-lan', closeBtn: 1});
                        }

                    }
                    if ($scope.childFlag) {
                        if (!$scope.ifGetFee() && $scope.paymentGridOptions.data.length <= 0) {
                            $scope.childFlag = false;
                            return layer.alert("收付款子表为空！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        } else {
                            let sum_Insurancemoney = 0;
                            let insuranceman = $scope.insurancemanGridOptions.data;
                            let payment = $scope.paymentGridOptions.data;
                            for (let i = 0; i < payment.length; i++) {
                                let pay = payment[i];
                                if (pay.stages == 1) {
                                    let count = 0;
                                    for (let k = 0; k < payment.length; k++) {
                                        let subpay = payment[k];
                                        if (subpay.typeMoneyNO == pay.typeMoneyNO && subpay.company.name == pay.company.name) {
                                            if (parseFloat(subpay.scaleMoney) > 100 || parseFloat(subpay.scaleMoney) < 0) {
                                                $scope.childFlag = false;
                                                return layer.alert("单项收付款比例不能小于0或者大于100!",
                                                    {skin: 'layui-layer-lan', closeBtn: 1});
                                            }
                                            count = parseFloat(count) + parseFloat(subpay.scaleMoney);
                                        }
                                    }
                                    //收付款比例
                                    if (count.toFixed(2) != 100) {
                                        return layer.alert("各收付款类型收付比例合计应等于100%!",
                                            {skin: 'layui-layer-lan', closeBtn: 1});
                                    }
                                }
                                if (!pay.planDate) {
                                    return layer.alert("子表属性计划日期不可为空！",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                let reg = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
                                let str = pay.planDate;
                                let arr = reg.exec((str));
                                if (angular.isDate(str)) {
                                    str = str.getFullYear() + '-' + (str.getMonth() + 1) + '-' + str.getDate();
                                }
                                if (!reg.test(str) && RegExp.$2 <= 12 && RegExp.$3 <= 31) {
                                    return layer.alert("子表属性计划日期格式错误", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }
                            //非互联业务部业务都需要录入保险金额并且保险金额不为0
                            if ($scope.VO.busi_type.code.substring(0, 3) != "2-6" && ($scope.VO.insurancetotalmoney == 0 || $scope.VO.insurancetotalmoney == 0.00 || $scope.VO.insurancetotalmoney == "NaN")) {
                                return layer.alert("金额信息中的保险金额/赔偿限额/(元)不能为0！", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if ($scope.insuranceinfoGridOptions.data.length > 0) {
                                let count1 = 0;
                                for (let i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                                    $scope.childFlag = false;
                                    //非互联网业务数据子表保险金额0提示信息
                                    // 互联网业务的数据可以不录入保险金额或0
                                    if (($scope.VO.busi_type.code.substring(0, 3) != "2-6" || $scope.VO.busi_type.code.substring(0, 3) == "2-6") && ($scope.insuranceinfoGridOptions.data[i].insurancemoney == 0 || $scope.insuranceinfoGridOptions.data[i].chargerate == 0)) {
                                        count1++;
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
                            if ($scope.VO.busi_type.name == '个人代理业务' && ($scope.VO.pkAgent == null || $scope.VO.pkAgent == '' || $scope.VO.pkAgent.name == null || $scope.VO.pkAgent.name == '')) {
                                return layer.alert("代理制项目必须选择执业人员！", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (!$scope.VO.informCode && $scope.isDw) {
                                return layer.alert("国网公司项目必须选择出单通知书！", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if ($scope.VO.informCode && !$scope.VO.FREE_FEE_TYPE && $scope.isDw) {
                                return layer.alert("请选择免赔额类型！", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            let temp = $scope.VO.informCode && !$scope.VO.INTFREEFEE && !$scope.VO.NUMBFREEFEE && $scope.isDw;
                            if (temp && $scope.VO.FREE_FEE_TYPE == 0 ) {
                                return layer.alert("请填写免赔额！", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if ($scope.msgFlag) {
                                angular.alert($scope.msg);
                                $scope.childFlag = false;
                            }

                            if ($scope.dealAttachmentBGridOptions.data.length == 0) {
                                // return layer.alert($scope.ifGetFee() ? "请在附件子表中上传保费缴纳通知书!" : "请上传附件！",
                                //     {skin: 'layui-layer-lan', closeBtn: 1});
                            } else if ($scope.ifGetFee()) {
                                var doucumentType = false;
                                for (let i = 0; i < $scope.dealAttachmentBGridOptions.data.length; i++) {
                                    if ($scope.dealAttachmentBGridOptions.data[i].file_type == 2) {
                                        doucumentType = true;
                                    }
                                }
                                if (!doucumentType) {
                                    return layer.alert("请在附件子表中上传保费缴纳通知书！",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }

                            let ifN = false;
                            if ($scope.insuranceinfoGridOptions.data != null) {
                                let ifN = false;
                                for (let i = 0; i < $scope.VO.insuranceinfo.length; i++) {
                                    if ($scope.VO.insuranceinfo[i].maininsurance == 'Y') {
                                        ifN = true;
                                    }
                                }
                                if (!ifN) {
                                    $scope.childFlag = false;
                                    return layer.alert("请选择主险种！", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }
                            //如果是保单库生成保单需要进行校验提示
                            if ($scope.VO.insuranceData && $scope.VO.insuranceData.UUID && $scope.VO.insuranceData.UUID != "") {
                                $scope.childFlag = false;
                                //进入后台判断
                                $http.post($rootScope.basePath + "propertyInsurance/checkInsuranceData", {data: angular.toJson($scope.VO)}).success(function (response) {
                                    if (response.msg) {
                                        layer.confirm(response.msg, {
                                            btn: ['是', '否'], //按钮
                                            btn2: function () {
                                                return layer.msg('取消保存!', {shift: 6, icon: 11});
                                            },
                                            shade: 0.6,//遮罩透明度
                                            shadeClose: true,//点击遮罩关闭层
                                        }, function () {
                                            $scope.onSaveVO();
                                        })
                                    }
                                });
                            }
                            if ($scope.childFlag) {
                                // 如果是暂存的数据时，需要修正单据状态
                                // if ($scope.VO.billstatus == 37) {
                                //     $scope.VO.billstatus = 31;
                                // }
                                $scope.onSaveVO();
                            }
                        }
                    }
                }
            }, true);
        };
        //超级修改保存
        $scope.onSuperSave = function () {
            if ($scope.SuperForm) {
                if ($scope.changeDataArray.size > 0) {
                    $http.post($rootScope.basePath + "superUpdateContorller/onSuperSave",
                        {
                            data: angular.toJson($scope.SuperVO),
                            changeDataArray: angular.toJson(Array.from($scope.changeDataArray)),
                            tableName: $scope.table_name,
                            specialId: $scope.specialId
                        }).success(function (response) {
                        if (response != null) {
                            $scope.updateChangeData = angular.fromJson(response.changeData);
                            $scope.supertData = angular.fromJson(response);
                            $scope.superngDialog = ngDialog.openConfirm({
                                showClose: true,
                                closeByDocument: true,
                                template: 'view/superUpdateOptions.html',
                                className: 'ngdialog-theme-formInfo',
                                scope: $scope,
                                preCloseCallback: function (value) {
                                    return true;
                                }
                            }).then(function (value) {
                                if (value != null) {
                                }
                            }, function (reason) {

                            });
                        } else {
                            layer.alert("修改数据异常！", {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    });
                }
            }
        }

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
        $scope.ifGetFee = function () {
            return $scope.VO.ifGetFee === 'Y' ? true : false;
        };
        $scope.onCount = function (data) {
            layer.load(2);
            $http.post($scope.basePath + "propertyInsurance/processData", {
                pageSize:600
            }).success(function (response) {
                if (response.code == 200) {
                    layer.alert("完成！", {skin: 'layui-layer-lan', closeBtn: 1});
                }
                layer.closeAll('loading');
            });
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
            let data = {};
            if ($scope.selectTabName == 'insuranceinfoGridOptions') {//险种信息
                if ($scope.insuranceinfoGridOptions.data.length == 0) {
                    data.maininsurance = 'Y';
                }
                data.chargerate = '0';
                $scope[$scope.selectTabName].data.push(data);
            } else if ($scope.selectTabName == 'insurancemanGridOptions') {//保险人
                data.replace = 'N';
                data.vdef4 = 'N';
                data.vdef2 = 'N';
                data.pay = 'N';
                if ($scope.ifGetFee()) {
                    data.replace = 'Y';
                    data.pay = 'Y';
                    $scope.isreplace = false;
                }
                $scope.VO.receivefeeperiod = 0;
                if ($scope.insuranceinfoGridOptions.data.length == 0) {
                    data.chiefman = 'N';
                    data.maininsurance = 'Y';
                } else {
                    data.chiefman = 'N';
                }
                if ($scope.insurancemanGridOptions.data.length == 0) {
                    data.insurancerate = '100';
                    data.chiefman = 'Y';
                    if ($scope.VO.insurancetotalmoney == undefined) {
                        $scope.VO.insurancetotalmoney = 0;
                    }
                    //保险人信息增第一行时需要的运算 2019年5月31日
                    data.vdef1 = parseFloat(eval($scope.VO.insurancetotalmoney) * eval(data.insurancerate) / 100).toFixed(2);
                    data.insurancemoney = parseFloat(eval($scope.VO.insurancetotalcharge) * eval(data.insurancerate) / 100).toFixed(2);

                    let inData = $scope.insurancemanGridOptions.data;
                    $scope.VO.paymount = $scope.calPay(inData);
                    $scope.VO.receivemount = $scope.calReceivemount(inData);
                    $scope.VO.receivefeeperiod = 0;
                    $scope.VO.payperiod = 0;
                    $scope.VO.receiveperiod = 0;
                    $scope.VO.payment = [];
                    $scope.paymentGridOptions.data = [];
                }
                $scope[$scope.selectTabName].data.push(data);
                if ($scope.ifGetFee()) {
                    $scope.VO.receivemount = 0;
                    let inData = $scope.insurancemanGridOptions.data;
                    $scope.VO.paymount = $scope.calPay(inData);
                    $scope.VO.receivemount = $scope.calReceivemount(inData);
                }
                // }else if($scope.selectTabName == 'insurancedmanGridOptions'&&null!=$scope.VO.pkProject&&""!=$scope.VO.pkProject&&($scope.VO.informCode!=null||$scope.VO.informCode!="")&& $scope.isDw||($scope.selectTabName == 'insurancedmanGridOptions'&&$scope.VO.informCode!=null&&$scope.VO.informCode!="")){
            } else if ($scope.selectTabName == 'insurancedmanGridOptions' && $scope.VO.pkProject && ($scope.VO.informCode || $scope.isDw)) {
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: 'view/batchProject/insureCustomerRef.html',
                    className: 'ngdialog-theme-formInfo',
                    controller: 'insurancedmanGridOptionsCtrl3',
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
                        for (let i = 0; i < value.length; i++) {
                            $scope[$scope.selectTabName].data.push(value[i]);
                        }
                    }
                }, function (reason) {
                });
            } else if ($scope.selectTabName == 'provisionalPolicyGridOptions') {
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: "view/propertyInsurance/policyForm.html",
                    className: 'ngdialog-theme-formInfo',
                    scope: $scope,
                    //policy: $scope.provisionalPolicyGridOptions.data,
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
                            for (let i = 0; i < value.length; i++) {
                                let row = {};
                                if (value[i].insuranceno) {
                                    row.insuranceinfono = value[i].insuranceinfono;
                                    row.insuranceno = value[i].insuranceno;
                                }
                                $scope[$scope.selectTabName].data.push(row);
                            }
                        } else {
                            $scope[$scope.selectTabName].data.push(value);
                        }
                    }
                }, function (reason) {

                });
            } else {
                $scope[$scope.selectTabName].data.push(data);
            }
        };

        $scope.onDeleteLines = function (delRow, tableData) {
            // let rowKey = delRow[0].rowKey;
            // let tableData = $scope[$scope.selectTabName].data;
            let ids = [];
            for (let i = 0; i < delRow.length; i++) {
                ids.push(delRow[i].$$hashKey);
            }
            let arr = [];
            for (let j = 0; j < tableData.data.length; j++) {
                if (ids.indexOf(tableData.data[j].$$hashKey) < 0) {
                    arr.push(tableData.data[j]);
                }
            }
            tableData.data = arr;
        }
        /**
         * 子表删除
         */
        $scope.onDeleteLine = function (selectTabName) {
            let selectTabNameOld = '';
            if (selectTabName) {
                selectTabNameOld = $scope.selectTabName;
                $scope.selectTabName = selectTabName;
            }
            let delRow = $scope[$scope.selectTabName].gridApi.selection.getSelectedRows();

            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            if ($scope.selectTabName == "insurancedmanGridOptions" && $scope.isUpdate) {
                $http.post($scope.basePath + "propertyInsurance/checkClaimxCase", {
                    insuranceno: $scope.VO.insuranceno,
                    beholderid: encodeURI(JSON.stringify(delRow), "UTF-8")
                }).success(function (response) {
                    if (response) {
                        if (response.deleteList) {
                            $scope.onDeleteLines(response.deleteList, $scope[$scope.selectTabName])
                        }
                        if (response.code == 200) {
                            return layer.alert("删除数据成功", {skin: 'layui-layer-lan', closeBtn: 1});
                        } else {
                            return layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                });
            } else {
                for (let i = 0; i < $scope[$scope.selectTabName].data.length; i++) {
                    for (let j = 0; j < delRow.length; j++) {
                        if ($scope[$scope.selectTabName].data[i].$$hashKey == delRow[j].$$hashKey) {
                            $scope[$scope.selectTabName].data.splice(i, 1);
                        }
                    }
                }
                if ($scope.selectTabName == "insuranceinfoGridOptions") {
                    let array = $scope.insuranceinfoGridOptions.data;
                    $scope.VO.insurancetotalmoney = 0;
                    if (array.length == 0) {
                        $scope.VO.insurancetotalcharge = 0;
                    } else {
                        $scope.VO.insurancetotalcharge = 0;
                        $scope.VO.insurancetotalmoney = 0;
                        for (let i = 0; i < array.length; i++) {
                            $scope.VO.insurancetotalcharge = eval(parseFloat($scope.VO.insurancetotalcharge)) + eval(parseFloat(array[i].insurancecharge).toFixed(2));
                            //@zhangwj 2022-12-06 保额计算时，不只计算主险种的，附加险种也要计算
                            // if (array[i].maininsurance == 'Y') {
                                $scope.VO.insurancetotalmoney = eval(parseFloat($scope.VO.insurancetotalmoney)) + eval(parseFloat(array[i].insurancemoney).toFixed(2));
                            // }
                        }
                    }
                }
            }
            if ($scope.selectTabName == "insurancemanGridOptions") {
                let array = $scope.insurancemanGridOptions.data;
                $scope.VO.commisiontotalnum = 0;
                if (array.length == 0) {
                    $scope.VO.feemount = 0;
                } else {
                    $scope.VO.commisiontotalnum = 0;
                    $scope.VO.feemount = 0;
                    for (let i = 0; i < array.length; i++) {
                        $scope.VO.commisiontotalnum = parseFloat(eval($scope.VO.commisiontotalnum) + eval(array[i].feemount));
                    }
                    $scope.VO.receivefeemount = parseFloat($scope.VO.commisiontotalnum).toFixed(2);
                    $scope.VO.receivefeeperiod = 0;

                }
            }
            if (selectTabName) {
                $scope.selectTabName = selectTabNameOld;
            }
        };
        $scope.onSpecial = function () {
            var app = "";
            app = "app.specialRevise.specialDataRevise";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length < 1) return layer.alert("请选择一条数据进行特殊修改!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (let i = 0; i < rows.length; i++) {
                if (rows[i].billstatus != 34) {
                    return layer.alert("请选择审批通过的数据进行特殊修改!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
                if (rows[i].specialStatus == "特殊修改") {
                    return layer.alert("选择的数据中包含已做过特殊修改的数据!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
            }
            //1.给特殊修改的数据添加数据修改标记
            $http.post($scope.basePath + "specialDataRevise/insertStatus", {
                data: JSON.stringify(rows),
                tableName: $scope.table_name
            }).success(function (response) {
                if (response.code == 200) {
                    var rowsData = response.rows;
                    var params = [];
                    for (let i = 0; i < rowsData.length; i++) {
                        var param = {};
                        var insuranceinfono = rows[i].insuranceinfono;
                        param.addNumber = insuranceinfono;
                        param.nodeTreeName = "财产险保单信息";
                        params.push(param);
                    }
                    if (rowsData[0].specialStatus == "特殊修改") {
                        //2.根据单号和节点名称封装
                        $http.post($scope.basePath + "specialDataRevise/queryForId", {
                            params: JSON.stringify(params),
                        }).success(function (response) {
                            if (response.code == 200) {
                                if (response.result.Rows != null) {
                                    var specialData = response.result.Rows;
                                    for (let i = 0; i < specialData.length; i++) {
                                        specialData[i].nodeTreeName = param.nodeTreeName;
                                    }
                                    var json = JSON.stringify(specialData);
                                    var url = $state.href(app, {'json': json}, {});
                                    $rootScope.specialData = json;
                                    $window.open(url, '_self');
                                } else {
                                    return layer.alert("请核实要查询的单号是否正确!", {
                                        skin: 'layui-layer-lan',
                                        closeBtn: 1
                                    });
                                }

                            }
                            layer.closeAll('loading');
                        });
                    }
                } else if (response.code == 500) {
                    return layer.alert("选择的数据中包含已做过特殊修改的数据!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
            });
        }

    };

    $scope.initPage = function () {
        $scope.isClear = false;
        $scope.isShow = true;
        //阻止页面渲染
        $scope.form = false;
        $scope.SuperForm = false;
        $scope.card = false;
        //阻止页面渲染
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.isDisableds = false;
        $scope.isreplace = true;
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
            useExternalPagination: true,
            exporterMenuCsv: true,
            showGridFooter: true,
            showColumnFooter: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '财产险保单信息.csv',
            columnDefs: [
                {name: 'billCheckBySelfState', displayName: '自查状态', width: 100,cellFilter: 'SELECT_BILLCHECKBYSELFSTATETYPE'},
                {name: 'insuranceinfono', displayName: '保单信息编号', width: 100, footerCellTemplate: '<div class="ui-grid-cell-contents">合计</div>>'},
                {name: 'pk_project_name', displayName: '业务/项目名称', width: 100,},
                {name: 'approval_number', displayName: '业务签报批复编号', width: 100,},
                {name: 'pk_project_code', displayName: '立项号 ', width: 100,},
                {name: 'busi_type_name', displayName: '业务分类 ', width: 100,},
                {name: 'pkC0Tradetype_name', displayName: '客户产权关系 ', width: 100,},
                {name: 'insuranceno', displayName: '保单号', width: 100, cellFilter: 'CSV_FILTER'},
                {name: 'informCode', displayName: '出单通知书编号 ', width: 100,},
                {name: 'startdate', displayName: '保险起始日期', width: 100,},
                {name: 'enddate', displayName: '保险到期日期', width: 100,},
                {name: 'vdef10NO', displayName: '签单方式', width: 100, cellFilter: 'SELECT_VDEF10'},
                {name: 'estimatepk_name', displayName: '投保人', width: 100,},
                {name: 'estimateaddr', displayName: '投保人地址', width: 100,},
                {name: 'estimatelinkman', displayName: '投保人联系人姓名', width: 100,},
                {name: 'estimatelinktel', displayName: '投保人联系人电话', width: 100,},
                {name: 'insurancebillkindNO', displayName: '保单性质', width: 100, cellFilter: 'SELECT_INSURANCEBILLKIND'},
                {
                    name: 'commisiontotalnum', displayName: '佣金总金额(含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER', aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'insurancetotalcharge', displayName: '签单总保费(含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER', aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'insurancetotalmoney', displayName: '保险金额/赔偿限额/(元)', width: 100, cellFilter: 'AMOUNT_FILTER', aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"

                    }
                },
                {
                    name: 'paymount', displayName: '应解付总额(元)', width: 100, cellFilter: 'AMOUNT_FILTER', aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'payperiod', displayName: '应解付保费总期数', width: 100,},
                {
                    name: 'receivefeemount', displayName: '应收佣金总额(元)', width: 100, cellFilter: 'AMOUNT_FILTER', aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'receivefeeperiod', displayName: '应收佣金总期数', width: 100,},
                {
                    name: 'receivemount', displayName: '应收保费总额(元)', width: 100, cellFilter: 'AMOUNT_FILTER', aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'receiveperiod', displayName: '应收保费总期数', width: 100,},
                {name: 'vdef2', displayName: '是否有追溯期', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'c1Compemountptimepperson', displayName: '累计赔偿限额', width: 100,},
                {name: 'insurancesum', displayName: '保单件数', width: 100,},
                {name: 'ifGetFee', displayName: '是否见费出单', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator_name', displayName: '经办人', width: 100,},
                {name: 'operate_date', displayName: '制单日期', width: 100,},
                {name: 'operate_time', displayName: '制单时间', width: 100,},
                {name: 'pkChecker_name', displayName: '审批人', width: 100,},
                {name: 'check_date', displayName: '审批日期', width: 100, cellFilter: 'date_cell_date'},

                // {name: 'checkTime', displayName: '复核时间', width: 100,},
                // {name: 'vapprovenote', displayName: '复核意见', width: 100,},
                {name: 'pkOrg_name', displayName: '业务单位', width: 100,},
                {name: 'pkDept_name', displayName: '部门', width: 100,},
                {name: 'vdef12', displayName: '业务种类', width: 100, cellFilter: 'SELECT_BUSINESSTYPE'},
                {name: 'ifGetFeeBill', displayName: '见费出单单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                // {name: 'pkCorp', displayName: '保单建立公司', width: 100,},
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
                let rows = $scope.gridApi.selection.getSelectedRows();
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

        $scope.selectTabName = 'insuranceinfoGridOptions';
        $scope.insuranceinfoGridOptions = {
            enableCellEditOnFocus: false,
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
                    , editDropdownOptionsArray: $rootScope.SELECT.YESNO,
                },
                {
                    name: 'insurancepk.name',
                    displayName: '险种名称',
                    width: 100,
                    url: 'insuranceRef/queryForGrid'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    isTree: true,
                    popupModelField: 'insurancepk',
                    params: {type: 'caichan'},
                    enableCellEdit: true,
                    cellEditableCondition: function ($scope, row) {
                        return $scope.row.entity.maininsurance == 'Y';
                    }
                },
                {
                    name: 'vdef1', displayName: '险种别称', width: 100,
                    enableCellEdit: true,
                    cellEditableCondition: function ($scope) {
                        return $scope.row.entity.maininsurance == 'N';
                    }
                },
                {
                    name: 'insurancemoney', displayName: '保险金额/赔偿限额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'chargerate', displayName: '费率(‰)', width: 100, cellFilter: 'number:6'
                },
                {
                    name: 'insurancecharge', displayName: '保费含税(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'franchise', displayName: '免赔额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    enableCellEdit: true,
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
                        if (newValue) {
                        }
                        //超级修改
                        if ($scope.SuperForm) {
                            $scope.SuperVOProxy.insuranceinfo = $scope.VO.insuranceinfo;
                            return;
                        }
                        let array = $scope.insuranceinfoGridOptions.data;

                        //@zhangwj 参照类单元格不可以手动输入
                        if(colDef.name.indexOf(".name") > 0){
                            let colName = colDef.name.replaceAll(".name","");
                            if(rowEntity[colName].pk == null || rowEntity[colName].pk == ''){
                                rowEntity[colName] = {};
                            }
                        }

                        if ('maininsurance' == colDef.name) {
                            if (newValue == 'Y') {
                                for (let i = 0; i < array.length; i++) {
                                    if (array[i].$$hashKey != rowEntity.$$hashKey) {
                                        array[i].maininsurance = 'N';
                                        array[i].insurancepk = {};
                                    } else {
                                        //如果insurancemoney为0，array中没有insurancemoney这个字段
                                        if (array[i].insurancemoney == null && (array[i].insurancemoney == undefined || array[i].insurancemoney == "")) {
                                            array[i].insurancemoney = 0.00;
                                            // $scope.VO.insurancetotalmoney = (parseFloat(array[i].insurancemoney)).toFixed(2);
                                        } else if (array[i].insurancemoney != null && array[i].insurancemoney != undefined && array[i].insurancemoney != "") {
                                            // $scope.VO.insurancetotalmoney = (parseFloat(array[i].insurancemoney)).toFixed(2);
                                        }
                                    }
                                }
                            } else if (newValue == 'N') {
                                $scope.VO.insurancetotalmoney = 0;
                                for (let i = 0; i < array.length; i++) {
                                    if (array[i].$$hashKey == rowEntity.$$hashKey) {
                                        array[i].insurancepk = {};
                                    } else if (array[i].maininsurance == 'Y') {
                                        //如果insurancemoney为0，array中没有insurancemoney这个字段
                                        if (array[i].insurancemoney == null && (array[i].insurancemoney == undefined || array[i].insurancemoney == "")) {
                                            array[i].insurancemoney = 0.00;
                                            // $scope.VO.insurancetotalmoney = (parseFloat(array[i].insurancemoney)).toFixed(2);
                                        } else if (array[i].insurancemoney != null && array[i].insurancemoney != undefined && array[i].insurancemoney != "") {
                                            // $scope.VO.insurancetotalmoney = (parseFloat(array[i].insurancemoney)).toFixed(2);
                                        }
                                    }
                                }
                            }
                        } else if ('insurancemoney' == colDef.name) {

                            if ($scope.insurancedmanGridOptions.data.length == 1) {
                                let length = $scope.insuranceinfoGridOptions.data.length;
                                let insedmanMoney = 0;
                                let insedmanFee = 0;
                                if (length > 0) {
                                    for (let i = 0; i < length; i++) {
                                        let insurancemoney = $scope.insuranceinfoGridOptions.data[i].insurancemoney;
                                        let insurancecharge = $scope.insuranceinfoGridOptions.data[i].insurancecharge;
                                        //如果insurancemoney为0，array中insurancemoney这个字段为“”
                                        if (insurancemoney == null && (insurancemoney == undefined || insurancemoney == "")) {
                                            $scope.insuranceinfoGridOptions.data[i].insurancemoney = 0.00;
                                            insedmanMoney = eval(insedmanMoney) + eval($scope.insuranceinfoGridOptions.data[i].insurancemoney);
                                        } else if (insurancemoney != null && insurancemoney != undefined && insurancemoney != "") {
                                            insedmanMoney = eval(insedmanMoney) + eval($scope.insuranceinfoGridOptions.data[i].insurancemoney);
                                        }
                                        //如果insurancecharge为0，array中insurancecharge这个字段为“”
                                        if (insurancecharge == null && (insurancecharge == undefined || insurancecharge == "")) {
                                            $scope.insuranceinfoGridOptions.data[i].insurancecharge = 0.00;
                                            insedmanFee = eval(insedmanFee) + eval($scope.insuranceinfoGridOptions.data[i].insurancecharge);
                                        } else if (insurancecharge != null && insurancecharge != undefined && insurancecharge != "") {
                                            insedmanFee = eval(insedmanFee) + eval($scope.insuranceinfoGridOptions.data[i].insurancecharge);
                                        }
                                    }
                                }
                            }

                            $scope.VO.insurancetotalcharge = 0.00;
                            // if (rowEntity.maininsurance == 'Y') {
                            //     if (newValue == "") {
                            //         let newValue = 0;
                            //         $scope.VO.insurancetotalmoney = newValue;
                            //         $scope.VO.insurancetotalmoney = (parseFloat($scope.VO.insurancetotalmoney)).toFixed(2);
                            //     } else {
                            //         $scope.VO.insurancetotalmoney = newValue;
                            //         $scope.VO.insurancetotalmoney = (parseFloat($scope.VO.insurancetotalmoney)).toFixed(2);
                            //     }
                            // }

                            //@zhangwj 2022-12-06 保额 = 主险保额 + 附加险保额
                            $scope.VO.insurancetotalmoney = 0;
                            for (let i = 0; i < array.length; i++) {
                                $scope.VO.insurancetotalmoney = $scope.VO.insurancetotalmoney + parseFloat(array[i].insurancemoney);
                            }
                            $scope.VO.insurancetotalmoney = $scope.VO.insurancetotalmoney.toFixed(2);
                            let startDate = new Date($scope.VO.startdate).getTime();
                            let endDate = new Date($scope.VO.enddate).getTime();
                            let yearStart = new Date($scope.VO.startdate);
                            let yearStart1 = new Date($scope.VO.startdate);
                            let yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                            let time = yearEnd - yearStart.getTime();
                            let datetime = parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000);
                            if (!datetime) {
                                return layer.alert("请先选择保险起期", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            rowEntity.insurancecharge = (parseFloat(rowEntity.insurancemoney) * parseFloat(rowEntity.chargerate) * datetime).toFixed(2);
                            if (rowEntity.insurancecharge != null && rowEntity.insurancecharge == "NAN") {
                                rowEntity.insurancecharge = 0.00;
                            }

                            for (let i = 0; i < array.length; i++) {
                                if (array[i].insurancecharge != null && array[i].insurancecharge == "") {
                                    array[i].insurancecharge = 0.00;
                                    $scope.VO.insurancetotalcharge = eval(parseFloat($scope.VO.insurancetotalcharge).toFixed(2)) + eval(parseFloat(array[i].insurancecharge).toFixed(2));
                                } else {
                                    $scope.VO.insurancetotalcharge = eval(parseFloat($scope.VO.insurancetotalcharge).toFixed(2)) + eval(parseFloat(array[i].insurancecharge).toFixed(2));
                                }
                            }
                            if ($scope.VO.insuranceman.length > 0) {
                                for (let j = 0; j < $scope.VO.insuranceman.length; j++) {
                                    $scope.VO.insuranceman[j].vdef1 = eval(parseFloat(eval($scope.VO.insurancetotalmoney) * eval($scope.VO.insuranceman[j].insurancerate) / 100).toFixed(2));
                                    $scope.VO.insuranceman[j].insurancemoney = eval(parseFloat(eval($scope.VO.insurancetotalcharge) * eval($scope.VO.insuranceman[j].insurancerate) / 100).toFixed(2));
                                    $scope.VO.insuranceman[j].feemount = eval(parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval($scope.VO.insuranceman[j].commisionrate) / 100).toFixed(2));
                                }
                            }
                            if ($scope.VO.payment.length > 0) {
                                for (let j = 0; j < $scope.VO.payment.length; j++) {
                                    $scope.VO.payment[j].scaleMoney = '';
                                    $scope.VO.payment[j].planDate = '';
                                }
                            }
                        } else if ('insurancecharge' == colDef.name) {
                            if ($scope.insurancedmanGridOptions.data.length == 1) {
                                let length = $scope.insuranceinfoGridOptions.data.length;
                                let insedmanMoney = 0;
                                let insedmanFee = 0;
                                if (length > 0) {
                                    for (let i = 0; i < length; i++) {
                                        insedmanMoney = eval(insedmanMoney) + eval($scope.insuranceinfoGridOptions.data[i].insurancemoney);
                                        insedmanFee = eval(insedmanFee) + eval($scope.insuranceinfoGridOptions.data[i].insurancecharge);
                                    }
                                    $scope.insurancedmanGridOptions.data[0].insurancemoney = insedmanMoney;
                                    $scope.insurancedmanGridOptions.data[0].insurancefee = insedmanFee;
                                }
                            }
                            $scope.VO.insurancetotalcharge = 0;
                            for (let i = 0; i < array.length; i++) {
                                $scope.VO.insurancetotalcharge = eval(parseFloat($scope.VO.insurancetotalcharge).toFixed(2)) + eval(parseFloat(array[i].insurancecharge).toFixed(2));
                            }
                            if ($scope.VO.insuranceman.length > 0) {
                                for (let j = 0; j < $scope.VO.insuranceman.length; j++) {
                                    $scope.VO.insuranceman[j].insurancemoney = eval(parseFloat(eval($scope.VO.insurancetotalcharge) * eval($scope.VO.insuranceman[j].insurancerate) / 100).toFixed(2));
                                    $scope.VO.insuranceman[j].feemount = eval(parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval($scope.VO.insuranceman[j].commisionrate) / 100).toFixed(2));
                                }
                            }
                            if ($scope.VO.payment.length > 0) {
                                for (let j = 0; j < $scope.VO.payment.length; j++) {
                                    $scope.VO.payment[j].scaleMoney = '';
                                    $scope.VO.payment[j].planDate = '';
                                }
                            }

                            rowEntity.insurancecharge = parseFloat(rowEntity.insurancecharge).toFixed(2)
                        } else if ('chargerate' == colDef.name) {
                            $scope.VO.insurancetotalcharge = 0.00;
                            let startDate = new Date($scope.VO.startdate).getTime();
                            let endDate = new Date($scope.VO.enddate).getTime();
                            let yearStart = new Date($scope.VO.startdate);
                            let yearStart1 = new Date($scope.VO.startdate);
                            let yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                            let time = yearEnd - yearStart.getTime();
                            let datetime = parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000);
                            if (!datetime) {
                                return layer.alert("请先选择保险起期", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (rowEntity.insurancemoney == "") {
                                rowEntity.insurancemoney = 0.00;
                            } else if (rowEntity.chargerate == "") {
                                rowEntity.chargerate = 0.00;
                            }
                            rowEntity.insurancecharge = (parseFloat(rowEntity.insurancemoney) * parseFloat(rowEntity.chargerate) * datetime).toFixed(2);
                            for (let i = 0; i < array.length; i++) {
                                $scope.VO.insurancetotalcharge = eval(parseFloat($scope.VO.insurancetotalcharge).toFixed(2)) + eval(parseFloat(array[i].insurancecharge).toFixed(2));
                            }
                            if ($scope.VO.insuranceman.length > 0) {
                                for (let j = 0; j < $scope.VO.insuranceman.length; j++) {
                                    $scope.VO.insuranceman[j].insurancemoney = parseFloat(eval($scope.VO.insurancetotalcharge) * eval($scope.VO.insuranceman[j].insurancerate) / 100).toFixed(2);
                                    $scope.VO.insuranceman[j].feemount = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval($scope.VO.insuranceman[j].commisionrate) / 100).toFixed(2);
                                }
                            }
                            if ($scope.VO.payment.length > 0) {
                                for (let j = 0; j < $scope.VO.payment.length; j++) {
                                    $scope.VO.payment[j].scaleMoney = '';
                                    $scope.VO.payment[j].planDate = '';
                                }
                            }
                        }

                        $scope.$apply();
                    });
                }
            }
        };
        //被保人
        $scope.insurancedmanGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '被保险人子表.csv',
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit || $scope.isUpdate) {
                    return true;
                } else {
                    return false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'insurancedmanpk.name',
                    displayName: '被保人',
                    width: 100,
                    // enableCellEdit: $scope.isDw,
                    url: 'customerInsuRef/queryForGrid',
                    openCustomerMore: true,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'insurancedmanpk',
                    params: {
                        type: 'beibaoxianren',
                    }
                },
                {
                    name: 'insurancedmanaddr', displayName: '被保人地址', width: 100


                },
                {
                    name: 'insurancedmanlinkman', displayName: '被保人联系人姓名', width: 100


                },
                {
                    name: 'insurancedmanlinktel', displayName: '被保人联系人电话', width: 100


                },
                {
                    name: 'insurancemoney',
                    displayName: '保险金额/赔偿限额(元)',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'insurancefee',
                    displayName: '主险保费(元)',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'additioninsurancecharge',
                    displayName: '附加险保费(元)',
                    enableCellEdit: true,
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
            ],
            data: $scope.VO.insurancedman,
            onRegisterApi: function (gridApi) {
                gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                $scope.insurancedmanGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        //超级修改
                        if ($scope.SuperForm) {
                            $scope.SuperVOProxy.insurancedman = $scope.VO.insurancedman;
                            return;
                        }

                        //@zhangwj 参照类单元格不可以手动输入
                        if(colDef.name.indexOf(".name") > 0){
                            let colName = colDef.name.replaceAll(".name","");
                            if(rowEntity[colName].pk == null || rowEntity[colName].pk == ''){
                                rowEntity[colName] = {};
                            }
                        }

                    });
                }
            }
        };
        //保险人
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
                    url: 'agreement/queryForGridRef',
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'insurancemanpk',
                    params: {customerType: '(3,4)'}
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
                    , editDropdownOptionsArray: getSelectOptionData.YESNO,
                },
                {
                    name: 'pay', displayName: '是否全额解付', width: 100, cellFilter: 'SELECT_YESNO'

                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO,
                    cellEditableCondition: function ($scope) {
                        return true;
                    },


                },
                {
                    name: 'vdef4', displayName: '保费金额不含增值税', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , enableCellEdit: true
                    , editDropdownOptionsArray: getSelectOptionData.YESNO,
                },
                {
                    name: 'vdef2', displayName: '佣金金额不含增值税', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , enableCellEdit: true
                    , editDropdownOptionsArray: getSelectOptionData.YESNO,

                },
                {
                    name: 'insurancerate', displayName: '承保比例(%)', width: 100


                },
                {
                    name: 'vdef1',
                    displayName: '保险金额/赔偿限额(元)',
                    width: 100,
                    enableCellEdit: false,
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
                    name: 'commisionrate', displayName: '佣金比例(%)', width: 100, cellFilter: 'number:2'


                },
                {
                    name: 'feemount', displayName: '佣金金额(含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
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
                        //超级修改
                        if ($scope.SuperForm) {
                            $scope.SuperVOProxy.insuranceman = $scope.VO.insuranceman;
                            return;
                        }

                        //@zhangwj 参照类单元格不可以手动输入
                        if(colDef.name.indexOf(".name") > 0){
                            let colName = colDef.name.replaceAll(".name","");
                            if(rowEntity[colName].pk == null || rowEntity[colName].pk == ''){
                                rowEntity[colName] = {};
                            }
                        }

                        if ('insurancerate' == colDef.name) {
                            if (rowEntity.insurancerate) {
                                if ($scope.VO.insurancetotalmoney == undefined) {
                                    $scope.VO.insurancetotalmoney = 0;
                                }
                                rowEntity.vdef1 = parseFloat(eval($scope.VO.insurancetotalmoney) * eval(rowEntity.insurancerate) / 100).toFixed(2);
                                rowEntity.insurancemoney = parseFloat(eval($scope.VO.insurancetotalcharge) * eval(rowEntity.insurancerate) / 100).toFixed(2);
                                rowEntity.feemount = parseFloat(eval(rowEntity.insurancemoney) * eval(rowEntity.commisionrate) / 100).toFixed(2);
                                if (rowEntity.feemount || !rowEntity.feemount) {
                                    let array = $scope.insurancemanGridOptions.data;
                                    $scope.VO.commisiontotalnum = 0;
                                    for (let i = 0; i < array.length; i++) {
                                        $scope.VO.commisiontotalnum = parseFloat(eval($scope.VO.commisiontotalnum) + eval(array[i].feemount));
                                    }
                                    $scope.VO.receivefeemount = parseFloat($scope.VO.commisiontotalnum).toFixed(2);
                                }
                            }
                            let inData = $scope.insurancemanGridOptions.data;
                            $scope.VO.paymount = $scope.calPay(inData);
                            $scope.VO.receivemount = $scope.calReceivemount(inData);
                            $scope.VO.receivefeeperiod = 0;
                            $scope.VO.payperiod = 0;
                            $scope.VO.receiveperiod = 0;
                            $scope.VO.payment = [];
                            $scope.paymentGridOptions.data = [];

                        }

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
                                $scope.VO.paymount = $scope.calPay(inData);
                                $scope.VO.receivemount = $scope.calReceivemount(inData);

                            }
                        }
                        if ('pay' == colDef.name) {
                            if (rowEntity.pay) {
                                let inData = $scope.insurancemanGridOptions.data;
                                $scope.VO.paymount = $scope.calPay(inData);
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
                            let inData = $scope.insurancemanGridOptions.data;
                            $scope.VO.paymount = 0;
                            $scope.VO.receivemount = 0;
                            $scope.VO.receivemount = $scope.calReceivemount(inData);
                            $scope.VO.paymount = $scope.calPay(inData);
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

                        if ('insurancemoney' == colDef.name || 'vdef4' == colDef.name || 'vdef2' == colDef.name || 'commisionrate' == colDef.name) {
                            let inData = $scope.insurancemanGridOptions.data;
                            if (rowEntity.commisionrate != null && rowEntity.commisionrate != "") {
                                if (rowEntity.insurancemoney) {
                                    rowEntity.feemount = parseFloat(rowEntity.insurancemoney).toFixed(2);
                                }
                                if (rowEntity.vdef4 == 'Y') {
                                    rowEntity.feemount = parseFloat(rowEntity.feemount / 1.06).toFixed(2);
                                }
                                if (rowEntity.vdef2 == 'Y') {
                                    rowEntity.feemount = parseFloat(rowEntity.feemount * 1.06).toFixed(2);
                                }
                                if (rowEntity.commisionrate) {
                                    rowEntity.feemount = parseFloat(eval(rowEntity.feemount) * eval(rowEntity.commisionrate) / 100).toFixed(2);
                                    $scope.VO.paymount = parseFloat($scope.calPay(inData)).toFixed(2);
                                }
                                if (rowEntity.feemount || !rowEntity.feemount) {
                                    let array = $scope.insurancemanGridOptions.data;
                                    $scope.VO.commisiontotalnum = 0;
                                    for (let i = 0; i < array.length; i++) {
                                        $scope.VO.commisiontotalnum = parseFloat(eval($scope.VO.commisiontotalnum) + eval(array[i].feemount));
                                    }
                                    $scope.VO.receivefeemount = parseFloat($scope.VO.commisiontotalnum).toFixed(2);
                                }
                            }
                            // if ($scope.VO.payment.length > 0) {
                            //     for (let j = 0; j < $scope.VO.payment.length; j++) {
                            //         $scope.VO.payment[j].scaleMoney = '';
                            //         $scope.VO.payment[j].planDate = '';
                            //     }
                            // }

                        }
                        if ('feemount' == colDef.name) {
                            //@zhangwj 【YDBXJJ-2492】 财产险保单中修改保险人信息中的佣金金额，收付款信息中的应收佣金 应该重新填写
                            $scope.VO.receivefeeperiod = 0;
                            $scope.VO.payperiod = 0;
                            $scope.VO.receiveperiod = 0;
                            $scope.VO.payment = [];
                            $scope.paymentGridOptions.data = [];
                            //end
                            let array = $scope.insurancemanGridOptions.data;
                            $scope.VO.commisiontotalnum = 0;
                            for (let i = 0; i < array.length; i++) {
                                $scope.VO.commisiontotalnum = parseFloat(eval($scope.VO.commisiontotalnum) + eval(array[i].feemount)).toFixed(2);
                            }
                            $scope.VO.receivefeemount = $scope.VO.commisiontotalnum;
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
            let result = 0;
            for (let i = 0; i < data.length; i++) {
                if (data[i].replace == 'Y') {
                    if (!data[i].insurancemoney) {
                        data[i].insurancemoney = 0;
                    }
                    result = parseFloat(result) + parseFloat(data[i].insurancemoney);
                }
            }
            return result;
        }

        /**
         * 计算应解付总额
         * @param data
         */
        $scope.calPay = function (data) {
            let result = 0;
            let flag = false;
            for (let i = 0; i < data.length; i++) {
                let feemount = 0;
                let insurancemoney = 0;
                if (data[i].pay == 'Y') {
                    result = parseFloat(result) + parseFloat(data[i].insurancemoney);
                } else if (data[i].pay != 'Y' && data[i].replace == 'Y') {
                    if (data[i].feemount) {
                        feemount = parseFloat(feemount) + parseFloat(data[i].feemount);
                    }
                    if (data[i].insurancemoney) {
                        insurancemoney = parseFloat(insurancemoney) + parseFloat(data[i].insurancemoney);
                    }
                    flag = false;
                    result = result + (parseFloat(insurancemoney) - parseFloat(feemount));
                }
            }
            if (flag) {
                return 0;
            }
            return result;
        }

        //合作伙伴
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
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        //超级修改
                        if ($scope.SuperForm) {
                            $scope.SuperVOProxy.partner = $scope.VO.partner;
                            return;
                        }
                    });
                }
            }
        };
        //收付款信息
        $scope.paymentGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            // showColumnFooter: false,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            columnDefs: [
                {
                    name: 'stages', displayName: '期数', width: 100, enableCellEdit: false
                },
                {
                    name: 'typeMoneyNO', displayName: '收付款类型', width: 100, cellFilter: 'SELECT_TYPEMONEY'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    // , editDropdownOptionsArray: getSelectOptionData.TYPEMONEY, enableCellEdit: false
                },
                // {
                //     name: 'company.name', displayName: '收付款对象名称', width: 100, enableCellEdit: false
                // },
                {
                    name: 'company.name',
                    displayName: '收付款对象名称',
                    width: 100,
                    url: 'insuranceCustomerRef/queryForGrid',
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
                    name: 'scaleMoney', displayName: '收付款比例(%)', width: 100, cellFilter: 'number:2'


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
            data: $scope.VO.payment,
            onRegisterApi: function (gridApi) {
                $scope.paymentGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        //超级修改
                        if ($scope.SuperForm) {
                            $scope.SuperVOProxy.payment = $scope.VO.payment;
                            return;
                        }
                        if ('scaleMoney' == colDef.name) {
                            if (rowEntity.scaleMoney) {
                                let array = $scope.paymentGridOptions.data;
                                $scope.VO.insuranceman = $scope.insurancemanGridOptions.data;
                                for (let i = 0; i < array.length; i++) {
                                    if (rowEntity.typeMoneyNO == 1) {
                                        rowEntity.planMoney = parseFloat(eval($scope.VO.receivemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                        rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.receivemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                    }
                                    for (let j = 0; j < $scope.VO.insuranceman.length; j++) {
                                        if (array[i].company.name == $scope.VO.insuranceman[j].insurancemanpk.name
                                            && array[i].$$hashKey == rowEntity.$$hashKey) {
                                            if (rowEntity.typeMoneyNO == 3) {
                                                rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].feemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].feemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                            }
                                            if (rowEntity.typeMoneyNO == 2) {
                                                if ($scope.VO.insuranceman[j].pay != 'Y') {
                                                    if ($scope.VO.insuranceman.length > 1 && $scope.VO.insuranceman[j].chiefman != 'Y') {
                                                        rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    } else if ($scope.VO.insuranceman.length > 1 && $scope.VO.insuranceman[j].chiefman != 'Y') {
                                                        rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    } else {
                                                        rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    }

                                                } else {
                                                    rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);

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
                    cellFilter: 'SELECT_DOUCUMENTTYPE',
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownValueLabel: 'name',
                    editDropdownOptionsArray: getSelectOptionData.DOUCUMENTTYPE
                },
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

        //暂保单
        $scope.provisionalPolicyGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            columnDefs: [
                {
                    name: 'insuranceinfono', displayName: '暂保单信息编号', width: 100,
                    enableCellEdit: false
                },
                {
                    name: 'insuranceno', displayName: '暂保单名称', width: 100,
                    enableCellEdit: false
                },
            ],

            data: $scope.VO.policy,
            onRegisterApi: function (gridApi) {
                $scope.provisionalPolicyGridOptions.gridApi = gridApi;
            }

        };

        //获取财务联查时url中的id
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
            $scope.onCard(getQueryVariable());
        }
        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
        /*else{
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
    $scope.billdef = "PropertyInsurance";
    $scope.beanName = "insurance.InsurancebillServiceImpl";
    $scope.child_table = angular.toJson({"srcBillno": "lr_insurancebill", "insuranceinfo": "lr_insuranceinfo"});
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();

    //根据特殊修改功能的id跳转到相应的onEdit()页面
    function getSpecialById() {
        let specialById = $rootScope.specialById;
        let specialId = $rootScope.specialId;
        if (specialById != null && specialId != null) {
            return specialById;
        }
        return null;
    }

    function getSpecialId() {
        let specialId = $rootScope.specialId;
        if (specialId != null) {
            return specialId;
        }
        return null;
    }

    if (null != getSpecialById()) {
        var formId = getSpecialById();
        $scope.findOneSuper(formId);
    }

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
app.controller('insuranceinfoGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('insurancedmanGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('insurancemanGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('partnerGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('paymentGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('assistantGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('provisionalPolicyGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('policyGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
    /**
     * 初始化页面变更方法
     */
    $scope.initQUERYChildren = function () {
        return {
            'id^notin': $scope.childrenId
        }
    };

    $scope.QUERYCHILDREN = $scope.initQUERYChildren();
    $scope.initData = function () {
        $scope.VO.reportChildren = [];
        $scope.childQuery = false;
        $scope.reportChildrenGridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {name: 'insuranceinfono', displayName: '暂保单信息编号', width: 100,},
                {name: 'pkProject.name', displayName: '业务/项目名称', width: 100,},
                {name: 'pkProject.code', displayName: '立项号 ', width: 100,},
                {name: 'busi_type.name', displayName: '业务分类 ', width: 100,},
                {name: 'pkC0Tradetype.name', displayName: '客户产权关系 ', width: 100,},
                {name: 'insuranceno', displayName: '暂保单名称', width: 100, cellFilter: 'CSV_FILTER'},
                {name: 'startdate', displayName: '保险起始日期', width: 100,},
                {name: 'enddate', displayName: '保险到期日期', width: 100,},
                {name: 'estimatepk.name', displayName: '投保人', width: 100,},
                {name: 'estimateaddr', displayName: '投保人地址', width: 100,},
                {name: 'estimatelinkman', displayName: '投保人联系人姓名', width: 100,},
                {name: 'estimatelinktel', displayName: '投保人联系人电话', width: 100,},
                {name: 'insurancebillkindNO', displayName: '保单性质', width: 100, cellFilter: 'SELECT_INSURANCEBILLKIND'},
                {name: 'vdef2', displayName: '是否有追溯期', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'insurancesum', displayName: '保单件数', width: 100,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'pkAgent.name', displayName: '执业人员', width: 100,},
                {name: 'operateDate', displayName: '制单日期', width: 100,},
                {name: 'operateTime', displayName: '制单时间', width: 100,},
                {name: 'pkChecker.name', displayName: '审批人', width: 100,},
                {name: 'checkDate', displayName: '审批日期', width: 100, cellFilter: 'date_cell_date'},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '部门', width: 100,},
            ],
            data: $scope.VO.reportChildren,
        };
        $scope.reportChildrenGridOptions.onRegisterApi = function (gridApi) {
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

        $scope.urlChildren = "";
        /*if($scope.provisionalPolicyGridOptions.data.length != 0) {
            $scope.urlChildren = "provisionalPolicy/queryForGridByinfo";
        }
        else {*/
        $scope.urlChildren = "provisionalPolicy/queryForGridChild";
        //}
        if (!$scope.queryData) {
            $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.policyGridOptionsCtrl.columnDefs;
        }

        if ($scope.provisionalPolicyGridOptions.data.length != 0) {
            for (let i = 0; i < $scope.provisionalPolicyGridOptions.data.length; i++) {
                delete $scope.VO.policy.$$hashKey;
                if ($scope.provisionalPolicyGridOptions.data[i].insuranceno) {
                    data['insuranceinfono' + i] = $scope.provisionalPolicyGridOptions.data[i].insuranceinfono;
                }
            }
            data['nub'] = $scope.provisionalPolicyGridOptions.data.length;
        }

        layer.load(2);
        $http.post($scope.basePath + $scope.urlChildren, {
            data: angular.toJson(data),
            page: $scope.gridApi ? $scope.gridApi.page : $scope.gridApi.page,
            pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridApi.pageSize,
            fields: angular.toJson($scope.queryData)
        }).success(function (response) {
            if (response.code == 200) {
                if (!$scope.query) {
                    $scope.query = $scope.reportChildrenGridOptions.columnDefs;
                }
                $scope.reportChildrenGridOptions.data = angular.fromJson(response.result.Rows);
                $scope.reportChildrenGridOptions.totalItems = response.result.Total;
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
         * 保存
         */
        $scope.onSave = function () {
            let rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});
            $scope.$parent.confirm(rows);
            ngDialog.close();
        };

        $scope.onCancel = function () {
            ngDialog.close();
        };

    };
    $scope.initData();
    $scope.initFunction();
});

app.controller('insurancedmanGridOptionsCtrl3', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
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
    if ($scope.tabName == "insureCompanyGridOptions") {
        $scope.QUERYCHILDREN.pk_org = 1;
        $scope.QUERYCHILDREN.c_0_type = 3;
    } else if (null == $scope.VO.updateType || $scope.VO.updateType != "1") {
        if ($scope.VO.ids != null && $scope.VO.ids.length > 0) {
            $scope.QUERYCHILDREN.ids = $scope.VO.ids[0];
        } else {
            $scope.QUERYCHILDREN.ids = "''";
            return layer.alert("请先选择出单通知书和保险险种!", {skin: 'layui-layer-lan', closeBtn: 1});
        }
        // $scope.QUERYCHILDREN.c_0_type=1;
    }
    $scope.initData = function () {
        $scope.customerGridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {name: 'CODE', displayName: '客户编号', width: 100},
                {name: 'NAME', displayName: '客户名称', width: 100},
                {name: 'C1INSTITUTION', displayName: '组织机构代码', width: 100},
                {name: 'UPCUSTOMER_NAME', displayName: '集团名称', width: 100},
                {name: 'C_0_ADDRESS', displayName: '集团地址', width: 100},
                // {name: 'ENUM_ENTKIND', displayName: '单位性质', width: 100},
                {name: 'C_0_TRADETYPE', displayName: '行业类别', width: 100},
                // {name: 'C_1_PROVINCE', displayName: '所属区域', width: 100},
                {name: 'PKORG_NAME', displayName: '业务单位', width: 100},
                {name: 'PKDEPT_NAME', displayName: '业务部门', width: 100}
            ],
        };
        $scope.customerGridOptions.onRegisterApi = function (gridApi) {
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
        }
        layer.load(2);

        if ($scope.QUERYCHILDREN.insurancedmanpk != null) {
            data['id'] = $scope.QUERYCHILDREN.insurancedmanpk.pk;
        }

        $http.post($scope.basePath + 'insuranceScheme/queryInsurancedmanByUp', {
            data: angular.toJson(data),
            page: 0,
            pageSize: 100000,
            fields: angular.toJson($scope.queryData)
        }).success(function (response) {
            if (response.code == 200) {
                if (!$scope.query) {
                    $scope.query = $scope.customerGridOptions.columnDefs;
                }
                $scope.customerGridOptions.data = response.result.Rows;
                $scope.customerGridOptions.totalItems = response.result.Total;
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
            let rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});
            for (let j = 0; j < rows.length; j++) {
                let insurancedmanpk = {
                    pk: rows[j].pk,
                    insurancedmanpk: {
                        pk: rows[j].pk,
                        name: rows[j].name,
                        enumEntkind_pk: rows[j].enumEntkind_name,
                        code: rows[j].code,
                        billstatus: rows[j].BILLSTATUS,
                        tradetype_name: rows[j].tradetype_name,
                        tradetype_code: rows[j].tradetype_name,
                        c1Province_name: rows[j].c1Province_name,
                        pk_org: rows[j].PK_ORG,
                        c_1_entkind: rows[j].C_1_ENTKIND,
                        c_0_upcostomer: rows[j].C_0_UPCOSTOMER,
                        enumEntkind_name: rows[j].enumEntkind_name,
                        c_1_province: rows[j].C_1_PROVINCE,
                        enumEntkind_code: rows[j].enumEntkind_name,
                        c_0_type: rows[j].C_0_TYPE,
                        c_1_institution: rows[j].C_1_INSTITUTION,
                        enum_entkind: rows[j].ENUM_ENTKIND,
                        tradetype_pk: rows[j].C_0_TRADETYPE
                    },
                    insurancedmanlinkman: rows[j].insurancedmanlinkman,
                    insurancedman: rows[j].name,
                    insurancedmanaddr: rows[j].c_0_address,
                };
                if (null == $scope.insurancedmanGridOptions.data) {
                    $scope.insurancedmanGridOptions.data = new Array();
                }
                let temp = true;
                for (let k = 0; k < $scope.insurancedmanGridOptions.data.length; k++) {
                    if ($scope.insurancedmanGridOptions.data[k].pk == insurancedmanpk.pk) {
                        temp = false;
                    }
                }
                if (temp) {
                    $scope.insurancedmanGridOptions.data.push(insurancedmanpk);
                }
            }
            if (null != $scope.VO.behoder) {
                for (let ins = 0; ins < $scope.insurancedmanGridOptions.data.length; ins++) {
                    for (let be = 0; be < $scope.VO.behoder.length; be++) {
                        if ($scope.insurancedmanGridOptions.data[ins].pk == $scope.VO.behoder[be].BEHOLDER_ID) {
                            if ($scope.VO.behoder[be].ASSETS_INSURE_VALUE) {
                                $scope.insurancedmanGridOptions.data[ins].insurancemoney = $scope.VO.behoder[be].ASSETS_INSURE_VALUE;
                            } else {
                                $scope.insurancedmanGridOptions.data[ins].insurancemoney = $scope.VO.behoder[be].BEHOLDER_INSURANCEMONEY;
                            }
                        }
                    }
                }
            }
            ngDialog.close();
        };
        $scope.onCtrl3Cancel = function () {
            ngDialog.close();
        };
    };
    $scope.initData();
    $scope.initFunction();
    $scope.queryForGridChildren($scope.QUERYCHILDREN);
});
//自定义过滤器 jsonDate
app.filter("jsonDate", function ($filter) {
    return function (input, format) {
        //先得到时间戳
        let timestamp = Number(input.replace(/\/Date\((\d+)\)\//, "$1"));

        //转成指定格式
        return $filter("date")(timestamp, format);
    }
});
