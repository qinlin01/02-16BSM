/**
 * Created by gongpf on 2020/2/28.`
 */
app.controller('pUnlifeInsuranceCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $location) {
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
                costscale: [],
                coomedium: [],
                insurancetype: "unlife",
                vdef12: 0,
                ifuhv: 0,
                //ifApproval:0,
            };
        };
        insuranceArr:["010101", "010102", "010103", "010122", "010201", "010203"];
        $scope.entityVO = 'nc.vo.busi.InsurancebillVO';
        $scope.isDw = false;
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "id": $stateParams.id,
                "operate_year": new Date().format("yyyy")
            }
        };
        $scope.QUERY = $scope.initQUERY();

        $scope.param = {
            c_2_type: 0,
            pk_org_str: $rootScope.orgVO.pk,
            busi_type: "notNull"
        };
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
            return $http.post($rootScope.basePath + "punlifeInsurance/queryAllForGrid", {
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
            $http.post($scope.basePath + "punlifeInsurance/queryForGrid", {
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
            // if ($scope.VO.id != null) {
            //     $scope.pkInsurancebill = $scope.VO.id
            // } else {
            //     $scope.pkInsurancebill = '';
            // }
            $http.post($scope.basePath + "punlifeInsurance/checkInsuranceno", {
                // pk: $scope.VO.insuranceno,
                // pkInsurancebill: $scope.pkInsurancebill
                param: angular.toJson($scope.VO),
                "insureType": "unlife"
            }).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200" && "" != response.msg) {
                    // angular.assignData($scope.VO, response.result);
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
                if (null != response.insureType.insureType) {
                    $scope.insuranceinfoGridOptions.data = new Array();
                    $scope.insuranceinfoGridOptions.data.push(response.insureType.insureType[0]);
                }
                if (null != response.insureType.insuranceman) {
                    $scope.insurancemanGridOptions.data = new Array();
                    $scope.insurancemanGridOptions.data.push(response.insureType.insuranceman[0]);
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
                    $http.post($scope.basePath + "punlifeInsurance/discard", {pk: $scope.pk, billdef: $scope.billdef}).success(function (response) {
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
            $http.post($scope.basePath + "punlifeInsurance/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    var type = "0";
                    if ($scope.VO.updateType == "1") {
                        type = "1";
                    }
                    angular.assignData($scope.VO, response.result);
                    $scope.VO.updateType = type;
                    $scope.insuranceinfoGridOptions.data = $scope.VO.insuranceinfo;
                    $scope.insurancedmanGridOptions.data = $scope.VO.insurancedman;
                    $scope.insurancemanGridOptions.data = $scope.VO.insuranceman;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    $scope.partnerGridOptions.data = $scope.VO.partner;
                    $scope.paymentGridOptions.data = $scope.VO.payment;
                    $scope.provisionalPolicyGridOptions.data = $scope.VO.policy;
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
            $scope.VO.insurancedman = $scope.insurancedmanGridOptions.data;
            $scope.VO.TEMP_INFOS = "";
            for (var i = 0; i < $scope.provisionalPolicyGridOptions.data.length; i++) {
                if (i == $scope.provisionalPolicyGridOptions.data.length - 1) {
                    $scope.VO.TEMP_INFOS += $scope.provisionalPolicyGridOptions.data[i].insuranceinfono;
                } else {
                    $scope.VO.TEMP_INFOS += $scope.provisionalPolicyGridOptions.data[i].insuranceinfono + ",";
                }
            }
            $http.post($rootScope.basePath + "punlifeInsurance/save", {data: angular.toJson($scope.VO), funCode: $scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        $scope.isDisableds = true;
                        $scope.isUpdate = false;

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
        $scope.onCheckWithEIMS = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $scope.VO.payment = $scope.paymentGridOptions.data;
            $http.post($rootScope.basePath + "punlifeInsurance/checkWithEIMS", {data: angular.toJson($scope.VO)})
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
         * 暂存
         * */
        /*$scope.onTemporary = function () {
         layer.load(2);
         $http.post($rootScope.basePath + "punlifeInsurance/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
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
         layer.alert("暂存成功！", {skin: 'layui-layer-lan', closeBtn: 1});
         }
         }
         // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
         });
         };*/
    };

    $scope.initFunction = function () {

        $scope.moveDianShangData = function () {
            $http.post($scope.basePath + "punlifeInsurance/moveDianShangData").success(function (response) {
            });
        }

        $scope.findIssueNotice = function (pk) {
            $scope.VO.ids = new Array();
            $http.post($scope.basePath + "issueNotice/findOne", {pk: pk}).success(function (response) {
                if (response && response.code == "200") {

                    $scope.VO.pkInsureInform = pk;
                    $scope.VO.informCode = response.result.IssueNoticeNo;
                    $scope.VO.pkInsureProject = response.result.insuranceSchemeId;
                    $scope.VO.insureProjectCode = response.result.insuranceSchemeCode;
                    $scope.VO.issueNoticeName = response.result.name;
                    $scope.insureType = response.result.insureType;
                    $scope.VO.ifuhv = response.result.ifuhv;
                    var ids = "";
                    var cids = "";
                    var behoder = new Array();
                    var company = new Array();
                    if ($scope.insuranceinfoGridOptions.data != null && $scope.insuranceinfoGridOptions.data.length != 0 && $scope.isDw || ($scope.VO.informCode != null && $scope.VO.informCode != "")) {
                        for (var i = 0; i < $scope.insureType.length; i++) {
                            if ($scope.getInsureName($scope.insureType[i].INSURE_TYPE_ID) == $scope.insuranceinfoGridOptions.data[0].insurancepk.name) {
                                behoder = $scope.insureType[i].insurebeHolde;
                                company = $scope.insureType[i].insureCompany;
                                $scope.insuranceinfoGridOptions.data[0].insurancemoney = $scope.insureType[i].ALL_FEE;
                                $scope.insuranceinfoGridOptions.data[0].chargerate = $scope.insureType[i].INSURANCE_RATE_MIN;
                                $scope.VO.startdate = $scope.insureType[i].INSURE_START_DATE;
                                $scope.VO.enddate = $scope.insureType[i].INSURE_END_DATE;
                                for (var c = 0; c < $scope.insureType[i].insureCompany.length; c++) {
                                    var cid = $scope.insureType[i].insureCompany[c].insureCompanyId;
                                    if (c == $scope.insureType[i].insureCompany.length - 1) {
                                        cids += "'" + cid + "'";
                                    } else {
                                        cids += "'" + cid + "'" + ",";
                                    }
                                }
                                $scope.getInsureCompany(cids);
                                for (var d = 0; d < $scope.insureType[i].insurebeHolde.length; d++) {
                                    var id = $scope.insureType[i].insurebeHolde[d].BEHOLDER_ID;
                                    if (id.length > 20) {
                                        id = id.substr(id.length - 20, id.length);
                                    }
                                    if (d == $scope.insureType[i].insurebeHolde.length - 1) {
                                        ids += "'" + id + "'";
                                    } else {
                                        ids += "'" + id + "'" + ",";
                                    }
                                }
                                $scope.VO.behoder = behoder;
                                $scope.VO.ids = new Array();
                                $scope.VO.ids.push(ids);
                                var data = new Object();
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
                                        for (var j = 0; j < rows.length; j++) {
                                            var insurancedmanpk = {
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
                                            var temp = true;
                                            for (var k = 0; k < $scope.insurancedmanGridOptions.data.length; k++) {
                                                if ($scope.insurancedmanGridOptions.data[k].pk == insurancedmanpk.pk) {
                                                    temp = false;
                                                }
                                            }
                                            if (temp) {
                                                $scope.insurancedmanGridOptions.data.push(insurancedmanpk);
                                            }
                                        }
                                        for (var ins = 0; ins < $scope.insurancedmanGridOptions.data.length; ins++) {
                                            for (var be = 0; be < behoder.length; be++) {
                                                if ($scope.insurancedmanGridOptions.data[ins].pk == behoder[be].BEHOLDER_ID) {
                                                    $scope.insurancedmanGridOptions.data[ins].insurancemoney = behoder[be].ASSETS_INSURE_VALUE;
                                                }
                                            }
                                        }
                                    }
                                    layer.closeAll('loading');
                                });
                            } else {
                                $scope.VO.ids = new Array();
                                $scope.VO.ids.push("''");
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
                                var rs = asciiChartSet_c2en[matched];
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
    };

//附件批量上传
    $scope.onUploadss = function () {
        layer.load(2);
        $scope.isSubDisabled = false;
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
                $http.post($scope.basePath + "punlifeInsurance/saveFiles", {data: angular.toJson(value)}).success(function (response) {
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

        // $scope.$watch('selectTabName', function (newVal, oldVal) {
        //     if(null!=$scope.VO.updateType&&$scope.VO.updateType=='1'&&$scope.selectTabName == 'insurancedmanGridOptions'){
        //         $scope.isUpdate=true;
        //     }else{
        //         $scope.isUpdate=false;
        //     }
        // }, true);

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
        $scope.getInsureName = function (id) {
            var DWZCINSURANCETYPE = [{id: "caicyqx", name: "财产一切险"}, {id: "jianzazgcyqx", name: "建筑安装工程一切险"}, {id: "guzzrx", name: "雇主责任险"}, {id: "jiqshx", name: "机器损坏险"}, {
                id: "anzgcyqx",
                name: "安装工程一切险"
            }, {id: "jianagcx", name: "建筑工程一切险"}, {id: "gongdzrx", name: "供电责任险"}, {id: "gongzzrx", name: "公众责任险"}, {id: "kehxyx", name: "客户信用险"}, {id: "yingyzdx", name: "营业中断险"}, {
                id: "anqsczrx",
                name: "安全生产责任险"
            }, {id: "huanjwrzrx", name: "环境污染责任保险"}, {id: "chongdzzhbx", name: "充（换）电站综合保险"}];
            var name = "";
            for (var i = 0; i < DWZCINSURANCETYPE.length; i++) {
                if (id == DWZCINSURANCETYPE[i].id) {
                    name = DWZCINSURANCETYPE[i].name;
                    return name;
                }
            }
            return name;
        }
        $scope.getInsureByName = function (names) {
            var DWZCINSURANCETYPE = [{id: "caicyqx", name: "财产一切险"}, {id: "jianzazgcyqx", name: "建筑安装工程一切险"}, {id: "guzzrx", name: "雇主责任险"}, {id: "jiqshx", name: "机器损坏险"}, {
                id: "anzgcyqx",
                name: "安装工程一切险"
            }, {id: "jianagcx", name: "建筑工程一切险"}, {id: "gongdzrx", name: "供电责任险"}, {id: "gongzzrx", name: "公众责任险"}, {id: "kehxyx", name: "客户信用险"}, {id: "yingyzdx", name: "营业中断险"}, {
                id: "anqsczrx",
                name: "安全生产责任险"
            }, {id: "huanjwrzrx", name: "环境污染责任保险"}, {id: "chongdzzhbx", name: "充（换）电站综合保险"}];
            var name = "";
            for (var i = 0; i < DWZCINSURANCETYPE.length; i++) {
                if (names == DWZCINSURANCETYPE[i].name) {
                    name = DWZCINSURANCETYPE[i].name;
                    return name;
                }
            }
            return name;
        }

        $scope.getInsureCompany = function (ids) {
            var data = new Object();
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
                    for (var j = 0; j < rows.length; j++) {
                        var insurancedmanpk = {
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
                        if (null == $scope.insurancemanGridOptions.data) {
                            $scope.insurancemanGridOptions.data = new Array();
                        }
                        var temp = true;
                        for (var k = 0; k < $scope.insurancemanGridOptions.data.length; k++) {
                            if ($scope.insurancemanGridOptions.data[k].pk == insurancedmanpk.pk) {
                                temp = false;
                            }
                        }
                        if (temp) {
                            $scope.insurancemanGridOptions.data.push(insurancedmanpk);
                        }
                    }
                    for (var ins = 0; ins < $scope.insurancemanGridOptions.data.length; ins++) {
                        for (var be = 0; be < $scope.company.length; be++) {
                            if ($scope.insurancemanGridOptions.data[ins].pk == $scope.company[be].insureCompanyId) {
                                $scope.insurancemanGridOptions.data[ins].insurancerate = $scope.company[be].underwritingRatio;
                            }
                        }
                    }
                }
                layer.closeAll('loading');
            });
        }

        $scope.$watch('insuranceinfoGridOptions.data[0].insurancepk.name', function (newVal, oldVal) {
            if ($scope.VO.pkProject != null && $scope.VO.pkProject != "" && ($scope.VO.pkProject.busi_typecode.indexOf("1-1") == 0 && $scope.VO.pkProject.busi_typecode.indexOf("1-1-3") != 0 && $scope.VO.pkProject.busi_typecode.indexOf("1-1-4") != 0)
                && $scope.insuranceinfoGridOptions.data != null && $scope.insuranceinfoGridOptions.data.length != 0
                && $scope.getInsureByName($scope.insuranceinfoGridOptions.data[0].insurancepk.name) != "") {
                $scope.isDw = true;
            } else {
                $scope.isDw = false;
            }

            if (null != $scope.VO.pkProject && ($scope.VO.pkProject.busi_typecode.indexOf("1-1") == 0 && $scope.VO.pkProject.busi_typecode.indexOf("1-1-3") != 0 && $scope.VO.pkProject.busi_typecode.indexOf("1-1-4") != 0) && ($scope.VO.informCode != null || $scope.VO.informCode != "") && $scope.isDw || ($scope.VO.informCode != null && $scope.VO.informCode != "")) {
                var ids = "";
                var cids = "";
                var behoder = new Array();
                var company = new Array();
                if ($scope.insuranceinfoGridOptions.data != null && $scope.insuranceinfoGridOptions.data.length != 0 && null != $scope.insureType) {
                    for (var i = 0; i < $scope.insureType.length; i++) {
                        if ($scope.getInsureName($scope.insureType[i].INSURE_TYPE_ID) == $scope.insuranceinfoGridOptions.data[0].insurancepk.name) {
                            behoder = $scope.insureType[i].insurebeHolde;
                            company = $scope.insureType[i].insureCompany;
                            $scope.insuranceinfoGridOptions.data[0].insurancemoney = $scope.insureType[i].ALL_FEE;
                            $scope.insuranceinfoGridOptions.data[0].chargerate = $scope.insureType[i].INSURANCE_RATE_MIN;
                            $scope.VO.startdate = $scope.insureType[i].INSURE_START_DATE;
                            $scope.VO.enddate = $scope.insureType[i].INSURE_END_DATE;

                            for (var c = 0; c < $scope.insureType[i].insureCompany.length; c++) {
                                var cid = $scope.insureType[i].insureCompany[c].insureCompanyId;
                                if (c == $scope.insureType[i].insureCompany.length - 1) {
                                    cids += "'" + cid + "'";
                                } else {
                                    cids += "'" + cid + "'" + ",";
                                }
                            }
                            $scope.getInsureCompany(cids);
                            for (var d = 0; d < $scope.insureType[i].insurebeHolde.length; d++) {
                                var id = $scope.insureType[i].insurebeHolde[d].BEHOLDER_ID;
                                if (id.length > 20) {
                                    id = id.substr(id.length - 20, id.length);
                                }
                                if (d == $scope.insureType[i].insurebeHolde.length - 1) {
                                    ids += "'" + id + "'";
                                } else {
                                    ids += "'" + id + "'" + ",";
                                }
                            }
                            $scope.VO.behoder = behoder;
                            $scope.company = company;
                            $scope.VO.ids = new Array();
                            $scope.VO.ids.push(ids);
                            var data = new Object();
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
                                    for (var j = 0; j < rows.length; j++) {
                                        var insurancedmanpk = {
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
                                        var temp = true;
                                        for (var k = 0; k < $scope.insurancedmanGridOptions.data.length; k++) {
                                            if ($scope.insurancedmanGridOptions.data[k].pk == insurancedmanpk.pk) {
                                                temp = false;
                                            }
                                        }
                                        if (temp) {
                                            $scope.insurancedmanGridOptions.data.push(insurancedmanpk);
                                        }
                                    }

                                    for (var ins = 0; ins < $scope.insurancedmanGridOptions.data.length; ins++) {
                                        for (var be = 0; be < behoder.length; be++) {
                                            if ($scope.insurancedmanGridOptions.data[ins].pk == behoder[be].BEHOLDER_ID) {
                                                $scope.insurancedmanGridOptions.data[ins].insurancemoney = behoder[be].ASSETS_INSURE_VALUE;
                                            }
                                        }
                                    }
                                }
                                layer.closeAll('loading');
                            });
                        } else {
                            $scope.VO.ids = new Array();
                            $scope.VO.ids.push("''");
                        }
                    }
                } else {
                    $scope.VO.ids = new Array();
                }
            }
        }, true);

        //YDBXJJ-910 被保人保险金额和主险险费不自动带出
        // $scope.$watch('insurancedmanGridOptions.data', function (newVal, oldVal) {
        //     if (newVal === oldVal || newVal == undefined || newVal == null) return;
        //     if ($scope.isEdit) {
        //         if($scope.insurancedmanGridOptions.data.length == 1){
        //             var length = $scope.insuranceinfoGridOptions.data.length;
        //             var insedmanMoney = 0 ;
        //             var insedmanFee = 0;
        //             var insedmanAdditionInsureCharge = 0;
        //             if(length> 0){
        //                 for(var i = 0; i< length; i ++){
        //                     if($scope.insuranceinfoGridOptions.data[i].maininsurance == 'Y'){
        //                         insedmanFee = $scope.insuranceinfoGridOptions.data[i].insurancecharge;
        //                         insedmanMoney = eval(insedmanMoney) + eval($scope.insuranceinfoGridOptions.data[i].insurancemoney);
        //                     }else {
        //                         insedmanMoney = eval(insedmanMoney) + eval($scope.insuranceinfoGridOptions.data[i].insurancemoney);
        //                         insedmanAdditionInsureCharge = eval(insedmanAdditionInsureCharge) + eval($scope.insuranceinfoGridOptions.data[i].insurancecharge);
        //                     }
        //                 }
        //                 //保险金额
        //                 $scope.insurancedmanGridOptions.data[0].insurancemoney = insedmanMoney;
        //                 //主险保费
        //                 $scope.insurancedmanGridOptions.data[0].insurancefee = insedmanFee;
        //                 //附加险保费
        //                 $scope.insurancedmanGridOptions.data[0].additioninsurancecharge = insedmanAdditionInsureCharge;
        //             }
        //         }
        //     }
        // }, true);


        $scope.$watch('VO.insurancebillkindNO', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['insurancebillkindNOName'] = $rootScope.SELECT.INSURANCEBILLKIND[newVal].name;
            }
        }, true);

        $scope.$watch('VO.vdef12', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['vdef12Name'] = $rootScope.SELECT.BUSINESSTYPE[newVal].name;
            }
        }, true);

        $scope.$watch('VO.vdef10NO', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['vdef10NOName'] = $rootScope.SELECT.VDEF10[newVal].name;
            }
        }, true);
        // $scope.$watch('VO.pkReport', function (newVal, oldVal) {
        //     if (newVal === oldVal || newVal == undefined || newVal == null) return;
        //     if ($scope.isEdit && $scope.VO.billstatus == 37) {
        //         $scope.msgFlag = false;
        //     }
        // }, true);


        //28的校验
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
                    ;
                }
                var newdatval = "";
                if (newVal != null) {
                    newdatval = new Date(newVal).format("yyyy-MM-dd");
                    ;
                }
                if (newdatval == olddatval) {
                    return;
                }
                var now = new Date().getTime();
                var selected = new Date(newVal).getTime();
                var dates = (new Date(newVal).setFullYear(new Date(newVal).getFullYear() + 1));
                $scope.VO.enddate = new Date(dates).setDate(new Date(dates).getDate() - 1);
                if ($scope.VO.pkReport) {
                    return;
                }
                $scope.msgFlag = false;
                // if ((now - selected) / 24 / 3600 / 1000 > 28) {
                //     if ($scope.VO.pkReport == null) {
                //         // $scope.VO.startdate = '2018-01-01';
                //         if ($scope.VO.c_protype == '网省公司') {
                //             if ($scope.VO.insuranceinfo) {
                //                 for (var i = 0; i < insuranceArr.length; i++) {
                //                     for (var j = 0; j < $scope.VO.insuranceinfo.length; j++) {
                //                         if (insuranceArr[i] == $scope.VO.insuranceinfo[j].code) {
                //                             $scope.msgFlag = true;
                //                             $scope.msg = "对于业务来源是【网省公司的非团车业务】并且子表保险险种信息的主险种在财产一切险、财产基本险、财产综合险、机器损坏险、供电责任险、公众责任险六个险种之内的，公司各单位经办人员应在保单起保日期之前及时将保单信息录入业务系统;对于超过时限录入系统，即“起保日期早于当前日期”的保单，需要通过业务签报管理页面进行报批，注意：选择签报类型时请选择【保单录入延时说明】进行报批！";
                //                             break;
                //                         } else {
                //                             $scope.msgFlag = true;
                //                             $scope.msg = "对于业务来源是【非网省公司的非团车业务】，公司各单位经办人员应在保单起保日期后20个工作日(28个自然日)内及时将保单信息录入业务系统;对于超过时限录入系统，即“当前日期-起保日期>28日”的保单，需要通过业务签报管理页面进行报批，注意：选择签报类型时请选择【保单录入延时说明】进行报批！";
                //                             break;
                //                         }
                //                     }
                //
                //                 }
                //             }
                //         } else {
                //             $scope.msgFlag = true;
                //             $scope.msg = "对于业务来源是【非网省公司的非团车业务】，公司各单位经办人员应在保单起保日期后20个工作日(28个自然日)内及时将保单信息录入业务系统;对于超过时限录入系统，即“当前日期-起保日期>28日”的保单，需要通过业务签报管理页面进行报批，注意：选择签报类型时请选择【保单录入延时说明】进行报批！";
                //         }
                //         if ($scope.msgFlag) {
                //             angular.alert($scope.msg);
                //         }
                //
                //     }
                // }
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
                    for (var i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                        $scope.insuranceinfoGridOptions.data[i].insurancecharge = (parseFloat($scope.insuranceinfoGridOptions.data[i].insurancemoney) * parseFloat($scope.insuranceinfoGridOptions.data[i].chargerate) * parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000)).toFixed(2);
                    }
                }
            }
        }, true);
        $scope.$watch('VO.enddate', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
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
            // || (!angular.isUndefined($scope.VO.pkReport))
            if (typeof (oldVal) == "object" || newVal === oldVal || olddatval == newdatval || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
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
                    for (var i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                        $scope.insuranceinfoGridOptions.data[i].insurancecharge = (parseFloat($scope.insuranceinfoGridOptions.data[i].insurancemoney) * parseFloat($scope.insuranceinfoGridOptions.data[i].chargerate) * parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000)).toFixed(2);
                    }
                }
            }
        }, true);

        $scope.$watch('VO.estimatepk.name', function (newVal, oldVal) {
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
            if ($scope.VO.pkProject.name != null) {
                $scope.isDisableds = false;
            } else {
                $scope.isDisableds = true;
            }
            if ($scope.VO.pkProject != null && $scope.VO.pkProject != "" && ($scope.VO.pkProject.busi_typecode.indexOf("1-1") == 0 && $scope.VO.pkProject.busi_typecode.indexOf("1-1-3") != 0 && $scope.VO.pkProject.busi_typecode.indexOf("1-1-4") != 0)
                && $scope.insuranceinfoGridOptions.data != null && $scope.insuranceinfoGridOptions.data.length != 0
                && $scope.getInsureByName($scope.insuranceinfoGridOptions.data[0].insurancepk.name) != "") {
                $scope.isDw = true;
            } else {
                $scope.isDw = false;
            }
            $scope.VO.pkProject.name
            $scope.VO.estimatepk = "";
            $scope.VO.estimateaddr = "";
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
        //TODO
        // $scope.$watch('VO.ifApproval', function (newVal, oldVal) {
        //     if (!$scope.isEdit) {
        //         return;
        //     }
        //     if (newVal === oldVal || newVal == undefined || newVal == null) return;
        //     if ($scope.isEdit) {
        //         if(newVal == 0){
        //             $scope.VO.pkReport.approval_number = "";
        //         }
        //         if ($scope.VO.pkProject.pk && $scope.VO.ifApproval == 1) {
        //             $http.post($scope.basePath + "reportRef/queryForGrid", {pk_project: $scope.VO.pkProject.pk}).success(function (response) {
        //                 if (response && response.code == "200") {
        //                     if (response.result && !response.result.Rows.length > 1) {
        //                         $scope.VO.pkReport = response.result.Rows[0];
        //                     }else {
        //                         angular.element("#withClick").click();
        //
        //                     }
        //                 }
        //             });
        //         }
        //     }
        // }, true);
        //应收佣金
        $scope.$watch('VO.receivefeeperiod', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
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
            }
            $scope.paymentGridOptions.data = reData;
        }, true);
        //应收保费
        $scope.$watch('VO.receiveperiod', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
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
                            typeCompany: '保险公司',
                            typeCompanyNO: 3
                        };
                        reData.push(data);
                    }
                }
            }
            $scope.paymentGridOptions.data = reData;
        }, true);
        //应解付保费总期数
        $scope.$watch('VO.payperiod', function (newVal, oldVal) {

            if (!$scope.isEdit) {
                return;
            }
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
            }
            $scope.paymentGridOptions.data = reData;
        }, true);

        $scope.$watch('VO.insurancedman', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                var data = $rootScope.diffarray(newVal, oldVal);
                if (data && data.col == 'insurancedmanpk') {
                    if (data.row.insurancedmanpk) {
                        if (data.row.insurancedmanpk.pk) {
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

        //险种信息如果手动输入没有主键，此处不允许手动输入
        $scope.$watch('VO.insuranceinfo', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;

            if ($scope.isEdit && newVal.maininsurance != 'Y') {
                var data = $rootScope.diffarray(newVal, oldVal);
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
    };

    $scope.initButton = function () {


        $scope.onImportUploads = function (type) {
            if (type) {
                $("#inputFile").click();
            } else {
                var file = document.getElementById("inputFile").files[0];
                if (file != null) {
                    layer.load(2);
                    var form = new FormData();
                    form.append('file', file);
                    form.append('table', 'gLife');
                    $http({
                        method: 'POST',
                        url: $scope.basePath + 'punlifeInsurance/upLoadFile',
                        data: form,
                        headers: {'Content-Type': undefined, 'x-auth-token': window.sessionStorage.getItem("token")},
                        transformRequest: angular.identity
                    }).success(function (data) {
                        var obj = document.getElementById('inputFile');
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


        // $scope.onSelectReport = function () {
        //     data.push(pk_project:$scope.VO.pkProject.pk);
        //     if ( $scope.VO.ifReport == true){
        //         $http.get($rootScope.basePath + "reportRef/queryForGrid", {
        //             //pk_project:$scope.pkProject.pk,
        //
        //             data: angular.toJson(data),
        //         }).success(function (response) {
        //             if (response.code == 200) {
        //                 angular.assignData($scope.VO, response.result);
        //                 layer.closeAll('loading');
        //                 $scope.isSubEdit = false;
        //                 return layer.alert('暂存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
        //             }
        //         });
        //     }else {
        //
        //     }
        // }
        $scope.onAdd = function () {
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
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
        };

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
                var rows = $scope.gridApi.selection.getSelectedRows();
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
            $scope.VO.insuranceinfo = $scope.insuranceinfoGridOptions.data;
            $scope.VO.insuranceman = $scope.insurancemanGridOptions.data;
            $scope.VO.partner = $scope.partnerGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $scope.VO.policy = $scope.provisionalPolicyGridOptions.data;
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
                    //layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
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
                    $http.post($scope.basePath + "punlifeInsurance/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
         * 取消功能
         */
        $scope.onCancel = function () {
            if ($scope.isClear) {
                $scope.VO = $scope.initVO();
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
                $scope.onSaveVO();
                return;
            }

            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert(errEls[0].ngVerify.OPTS.message,
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    // $scope.onCheckInsuranceno();
                    $scope.VO.insurancebillkindNOName = $rootScope.returnSelectName($scope.VO.insurancebillkindNO, "INSURANCEBILLKIND");
                    $scope.VO.vdef12Name = $rootScope.returnSelectName($scope.VO.vdef12, "BUSINESSTYPE");
                    $scope.VO.vdef10NOName = $rootScope.returnSelectName($scope.VO.vdef10NO, "VDEF10");
                    $scope.VO.vdef2Name = $rootScope.returnSelectName($scope.VO.vdef2, "YESNO");

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
                    if (!$scope.VO.pkReport) {
                        var now = new Date().getTime();
                        var selected = new Date($scope.VO.startdate).getTime();
                        var dates = (new Date($scope.VO.startdate).setFullYear(new Date($scope.VO.startdate).getFullYear() + 1));
                        $scope.msgFlag = false;
                        if ((now - selected) / 24 / 3600 / 1000 > 28) {
                            if ($scope.VO.pkReport == null || $scope.VO.pkReport == "") {
                                // $scope.VO.startdate = '2018-01-01';
                                if ($scope.VO.c_protype == '网省公司') {
                                    if ($scope.VO.insuranceinfo) {
                                        for (var i = 0; i < insuranceArr.length; i++) {
                                            for (var j = 0; j < $scope.VO.insuranceinfo.length; j++) {
                                                if (insuranceArr[i] == $scope.VO.insuranceinfo[j].code) {
                                                    $scope.msgFlag = true;
                                                    $scope.childFlag = false;
                                                    $scope.msg = "对于业务来源是【网省公司的非团车业务】并且子表保险险种信息的主险种在财产一切险、财产基本险、财产综合险、机器损坏险、供电责任险、公众责任险六个险种之内的，公司各单位经办人员应在保单起保日期之前及时将保单信息录入业务系统;对于超过时限录入系统，即“起保日期早于当前日期”的保单，需要通过业务签报管理页面进行报批，注意：选择签报类型时请选择【保单录入延时说明】进行报批！";
                                                    break;
                                                } else {
                                                    $scope.msgFlag = true;
                                                    $scope.childFlag = false;
                                                    $scope.msg = "对于业务来源是【非网省公司的非团车业务】，公司各单位经办人员应在保单起保日期后20个工作日(28个自然日)内及时将保单信息录入业务系统;对于超过时限录入系统，即“当前日期-起保日期>28日”的保单，需要通过业务签报管理页面进行报批，注意：选择签报类型时请选择【保单录入延时说明】进行报批！";
                                                    break;
                                                }
                                            }

                                        }
                                    }
                                } else {
                                    $scope.msgFlag = true;
                                    $scope.childFlag = false;
                                    $scope.msg = "对于业务来源是【非网省公司的非团车业务】，公司各单位经办人员应在保单起保日期后20个工作日(28个自然日)内及时将保单信息录入业务系统;对于超过时限录入系统，即“当前日期-起保日期>28日”的保单，需要通过业务签报管理页面进行报批，注意：选择签报类型时请选择【保单录入延时说明】进行报批！";
                                }
                                if ($scope.msgFlag) {
                                    angular.alert($scope.msg);
                                }

                            }
                        }
                    }
                    if ($scope.insuranceinfoGridOptions.data.length == 0) {
                        return layer.alert("保险险种信息子表不能为空!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.insuranceinfoGridOptions.data.length > 0) {
                        $scope.VO.insuranceinfo = $scope.insuranceinfoGridOptions.data;
                        angular.forEach($scope.VO.insuranceinfo, function (item) {
                            if (!item.insurancepk && item.maininsurance == 'Y') {
                                $scope.childFlag = false;
                                return layer.alert("子表属性险种名称不可为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }

                            if (!item.chargerate) {
                                $scope.childFlag = false;
                                return layer.alert("子表属性费率不可为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }

                        })
                    }
                    var result = 0;
                    var chiefmanY = 0;
                    if ($scope.childFlag) {
                        if ($scope.insurancedmanGridOptions.data.length == 0) {
                            return layer.alert("被保险人信息子表不能为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if ($scope.childFlag) {
                        if ($scope.insurancemanGridOptions.data.length == 0) {
                            return layer.alert("保险人信息子表不能为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.insurancemanGridOptions.data.length > 0) {
                            var totalFeemount = 0;
                            $scope.VO.insuranceman = $scope.insurancemanGridOptions.data;
                            angular.forEach($scope.VO.insuranceman, function (item) {
                                if (item.feemount) {
                                    totalFeemount = totalFeemount + eval(item.feemount);
                                }
                                if (!item.insurancemanpk) {
                                    $scope.childFlag = false;
                                    chiefmanY = 1;
                                    return layer.alert("子表属性保险人名称不可为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (!item.insurancerate) {
                                    $scope.childFlag = false;
                                    chiefmanY = 1;
                                    return layer.alert("子表保险人信息中的承担比例不能为0.00%!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});

                                }
                                if (item.insurancerate < 0 || item.insurancerate > 100) {
                                    $scope.childFlag = false;
                                    chiefmanY = 1;
                                    return layer.alert("保险人信息子表保险保费加和不等于签单总保费!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (item.chiefman == 'Y') {
                                    chiefmanY = chiefmanY + 1;

                                }
                                result = parseFloat(result) + parseFloat(item.insurancerate);

                                if (item.insurancemanpk.name == $scope.VO.estimatepk.name) {
                                    $scope.childFlag = false;
                                    chiefmanY = 1;
                                    return layer.alert("保险人与投保人不能相同!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            })

                        }
                        if (chiefmanY <= 0) {
                            $scope.childFlag = false;

                            return layer.alert("保险人信息子表必须有一个保险人主承保!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        /*else {
                         $scope.childFlag = true;
                         }*/
                        if (parseFloat($scope.VO.commisiontotalnum).toFixed(2) != parseFloat(totalFeemount).toFixed(2)) {
                            $scope.childFlag = false;
                            return layer.alert("险种信息子表佣金加和不等于佣金总金额!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        /*else {
                         $scope.childFlag = false;
                         return layer.alert("险种信息子表佣金 加和不等于佣金总金额!",
                         {skin: 'layui-layer-lan', closeBtn: 1});
                         }*/
                        if (result != 100) {
                            $scope.childFlag = false;
                            return layer.alert("保险人信息子表保险保费加和不等于签单总保费！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }

                    }
                    if ($scope.childFlag) {
                        if ($scope.paymentGridOptions.data.length <= 0) {
                            $scope.childFlag = false;
                            return layer.alert("收付款子表为空！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        } else {
                            var sum_Insurancemoney = 0;
                            var insuranceman = $scope.insurancemanGridOptions.data;
                            var payment = $scope.paymentGridOptions.data;
                            /*for (var k = 0; k < insuranceman.length; k++) {
                             if (insuranceman[k].insurancemoney) {
                             sum_Insurancemoney = parseFloat(sum_Insurancemoney) + parseFloat(insuranceman[k].insurancemoney);
                             }
                             if (sum_Insurancemoney != $scope.VO.insurancetotalcharge) {
                             return layer.alert("保险人信息子表保险保费加和不等于签单总保费!",
                             {skin: 'layui-layer-lan', closeBtn: 1});
                             }
                             }*/

                            for (var i = 0; i < payment.length; i++) {
                                var pay = payment[i];
                                if (pay.stages == 1) {
                                    var count = 0;
                                    for (var k = 0; k < payment.length; k++) {
                                        var subpay = payment[k];
                                        if (subpay.typeMoneyNO == pay.typeMoneyNO && subpay.company.name == pay.company.name) {
                                            if (parseFloat(subpay.scaleMoney) > 100 || parseFloat(subpay.scaleMoney) < 0) {
                                                $scope.childFlag = false;
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
                                //str = str.format("yyyy-MM-dd")
                                var arr = reg.exec((str));
                                // var strDate = new Date(str);
                                // strDateMothon = strDate.getMonth();
                                // strDateDay = strDate.getDay();
                                //return Object.prototype.toString.call(obj) === '[object Array]';
                                //str=str.getFullYear() + '-' + (str.getMonth() + 1) + '-' + str.getDate() //+ ' ' + str.getHours() + ':' + str.getMinutes() + ':' + str.getSeconds();
                                //后端传回的时间格式 str = Fri Apr 26 2019 08:00:00 GMT+0800 (中国标准时间) {} ,此处校验有可能出错,不知道为什么,所以此处先将时间格式转换成字符串格式 2019年5月21日 苏长友
                                if (angular.isDate(str)) {
                                    str = str.getFullYear() + '-' + (str.getMonth() + 1) + '-' + str.getDate();
                                }
                                if (!reg.test(str) && RegExp.$2 <= 12 && RegExp.$3 <= 31) {
                                    return layer.alert("子表属性计划日期格式错误",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }

                            if ($scope.insuranceinfoGridOptions.data.length > 0) {
                                var count = 0;
                                $scope.childFlag = false;
                                for (var i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                                    if ($scope.insuranceinfoGridOptions.data[i].insurancemoney == 0 || $scope.insuranceinfoGridOptions.data[i].chargerate == 0) {
                                        count++;
                                    }
                                    if (count > 0) {
                                        layer.confirm('请核实子表中“保险金额/赔偿限额”和“费率”信息，是否需要修改', {
                                                btn: ['否', '是'], //按钮
                                                btn2: function (index, layero) {
                                                    layer.msg('取消保存!', {
                                                        shift: 6,
                                                        icon: 11
                                                    });
                                                },
                                                shade: 0.6,//遮罩透明度
                                                shadeClose: true,//点击遮罩关闭层
                                            },
                                            function () {
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
                                            })
                                    } else {
                                        $scope.childFlag = true;
                                    }

                                }
                            }
                            if (($scope.VO.pkProject.busi_typecode.indexOf("1-1") == 0 && $scope.VO.pkProject.busi_typecode.indexOf("1-1-3") != 0 && $scope.VO.pkProject.busi_typecode.indexOf("1-1-4") != 0) && ($scope.VO.informCode == null || $scope.VO.informCode == "") && $scope.isDw) {
                                return layer.alert("国网公司项目必须选择出单通知书！",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (($scope.VO.informCode != null || $scope.VO.informCode != undefined) && ($scope.VO.FREE_FEE_TYPE == null || $scope.VO.FREE_FEE_TYPE == "") && $scope.isDw) {
                                return layer.alert("请选择免赔额类型！",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (($scope.VO.informCode != null || $scope.VO.informCode != undefined) && $scope.VO.FREE_FEE_TYPE == 0 && ($scope.VO.INTFREEFEE == "" || $scope.VO.INTFREEFEE == null) && ($scope.VO.NUMBFREEFEE == "" || $scope.VO.NUMBFREEFEE == null) && $scope.isDw) {
                                return layer.alert("请填写免赔额！",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (($scope.VO.informCode != null || $scope.VO.informCode != undefined) && $scope.VO.FREE_FEE_TYPE == 1 && ($scope.VO.INTFREEFEE == "" || $scope.VO.INTFREEFEE == null) && ($scope.VO.WORDFREEFEE == "" || $scope.VO.WORDFREEFEE == null) && $scope.isDw) {
                                return layer.alert("请填写免赔额！",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if ($scope.msgFlag) {
                                angular.alert($scope.msg);
                                $scope.childFlag = false;
                            }
                            if ($scope.childFlag) {
                                // 如果是暂存的数据时，需要修正单据状态
                                if ($scope.VO.billstatus == 37) {
                                    $scope.VO.billstatus = 31;
                                }
                                $scope.onSaveVO();
                            }
                            /*if ($scope.childFlag) {
                             $scope.onSaveVO();
                             }*/
                        }
                    }

                    // if ($scope.msgFlag) {
                    //     angular.alert($scope.msg);
                    //     $scope.childFlag = false;
                    // }

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

                    var inData = $scope.insurancemanGridOptions.data;
                    $scope.VO.paymount = $scope.calPay(inData);
                    $scope.VO.receivemount = $scope.calReceivemount(inData);
                    $scope.VO.receivefeeperiod = 0;
                    $scope.VO.payperiod = 0;
                    $scope.VO.receiveperiod = 0;
                    $scope.VO.payment = [];
                    $scope.paymentGridOptions.data = [];
                }
                $scope[$scope.selectTabName].data.push(data);
            } else if ($scope.selectTabName == 'insurancedmanGridOptions' && null != $scope.VO.pkProject && "" != $scope.VO.pkProject && ($scope.VO.pkProject.busi_typecode.indexOf("1-1") == 0 && $scope.VO.pkProject.busi_typecode.indexOf("1-1-3") != 0 && $scope.VO.pkProject.busi_typecode.indexOf("1-1-4") != 0) && ($scope.VO.informCode != null || $scope.VO.informCode != "") && $scope.isDw || ($scope.selectTabName == 'insurancedmanGridOptions' && $scope.VO.informCode != null && $scope.VO.informCode != "")) {
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
                        for (var i = 0; i < value.length; i++) {
                            $scope[$scope.selectTabName].data.push(value[i]);
                        }
                    }
                }, function (reason) {
                });
            } else if ($scope.selectTabName == 'provisionalPolicyGridOptions') {
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: "view/punlifeInsurance/policyForm.html",
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
                            for (var i = 0; i < value.length; i++) {
                                var row = {};
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
                        if ($scope.selectTabName == "insurancedmanGridOptions" && $scope.isUpdate) {
                            $http.post($scope.basePath + "punlifeInsurance/checkClaimxCase", {
                                insuranceno: $scope.VO.insuranceno,
                                beholderid: $scope[$scope.selectTabName].data[i].pk
                            }).success(function (response) {
                                debugger
                                if (response && response.isOut == false) {
                                    $scope[$scope.selectTabName].data.splice(i, 1);
                                } else {
                                    return layer.alert("该被保险人已经出险无法删除!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            });
                        } else {
                            $scope[$scope.selectTabName].data.splice(i, 1);
                        }
                        if ($scope.selectTabName == 'paymentGridOptions') {
                            var inData = $scope.insurancemanGridOptions.data;
                            $scope.VO.paymount = $scope.calPay(inData);
                            $scope.VO.receivemount = $scope.calReceivemount(inData);
                        }
                    }
                }
            }
            var array = $scope.insuranceinfoGridOptions.data;
            $scope.VO.insurancetotalmoney = 0;
            if (array.length == 0) {
                $scope.VO.insurancetotalcharge = 0;
            } else {
                for (var i = 0; i < array.length; i++) {
                    $scope.VO.insurancetotalcharge = eval(parseFloat(array[i].insurancecharge).toFixed(2));
                    if (array[i].maininsurance == 'Y') {
                        $scope.VO.insurancetotalmoney = eval(parseFloat(array[i].insurancemoney).toFixed(2));
                    }
                }
            }
        };
    };

    $scope.initPage = function () {
        $scope.isClear = false;
        $scope.isShow = true;
        //阻止页面渲染
        $scope.form = false;
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
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '财产险保单信息.csv',
            columnDefs: [
                {name: 'insuranceinfono', displayName: '保单信息编号', width: 100,},
                {name: 'pk_project_name', displayName: '业务/项目名称', width: 100,},
                {name: 'approval_number', displayName: '业务签报批复编号', width: 100,},
                {name: 'pk_project_code', displayName: '立项号 ', width: 100,},
                {name: 'busi_type_name', displayName: '业务分类 ', width: 100,},
                {name: 'pkC0Tradetype_name', displayName: '客户产权关系 ', width: 100,},
                {name: 'insuranceno', displayName: '保单号', width: 100, cellFilter: 'CSV_FILTER'},
                {name: 'startdate', displayName: '保险起始日期', width: 100,},
                {name: 'enddate', displayName: '保险到期日期', width: 100,},
                {name: 'vdef10NO', displayName: '签单方式', width: 100, cellFilter: 'SELECT_VDEF10'},
                {name: 'estimatepk_name', displayName: '投保人', width: 100,},
                {name: 'estimateaddr', displayName: '投保人地址', width: 100,},
                {name: 'estimatelinkman', displayName: '投保人联系人姓名', width: 100,},
                {name: 'estimatelinktel', displayName: '投保人联系人电话', width: 100,},
                {name: 'insurancebillkindNO', displayName: '保单性质', width: 100, cellFilter: 'SELECT_INSURANCEBILLKIND'},
                {
                    name: 'commisiontotalnum', displayName: '佣金总金额(含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'insurancetotalcharge', displayName: '签单总保费(含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'insurancetotalmoney', displayName: '保险金额/赔偿限额/(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'paymount', displayName: '应解付总额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'payperiod', displayName: '应解付保费总期数', width: 100,},
                {
                    name: 'receivefeemount', displayName: '应收佣金总额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'receivefeeperiod', displayName: '应收佣金总期数', width: 100,},
                {
                    name: 'receivemount', displayName: '应收保费总额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'receiveperiod', displayName: '应收保费总期数', width: 100,},
                {name: 'vdef2', displayName: '是否有追溯期', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'c1Compemountptimepperson', displayName: '累计赔偿限额', width: 100,},
                {name: 'insurancesum', displayName: '保单件数', width: 100,},
                {name: 'c1Execitem', displayName: '执行条款', width: 100,},
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
                // {name: 'pkCorp', displayName: '保单建立公司', width: 100,},
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
        /*        $scope.clickaaa = function () {
         angular.element($('.ui-grid-row').css("height","100%"));
         angular.element($('.ui-grid-cell').css("height","100%"));
         angular.element($('.ui-grid-cell-contents').css("white-space","pre-line"));
         angular.element($('.ui-grid-cell-contents').css("word-break","break-all"));
         angular.element($('.ui-grid-cell-contents').css("word-wrap","break-word"));
         }
         $scope.clickbbb = function () {
         angular.element($('.ui-grid-row').css("height",""));
         angular.element($('.ui-grid-cell').css("height",""));
         angular.element($('.ui-grid-cell-contents').css("white-space",""));
         angular.element($('.ui-grid-cell-contents').css("word-break",""));
         angular.element($('.ui-grid-cell-contents').css("word-wrap",""));
         }*/
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
                    name: 'vdef1', displayName: '险种名称', width: 100,
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
                    name: 'insurancecharge', displayName: '保费含税(元)', width: 100, cellFilter: 'number:2',
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
                        var array = $scope.insuranceinfoGridOptions.data;
                        if ('maininsurance' == colDef.name) {
                            if (newValue == 'Y') {
                                for (var i = 0; i < array.length; i++) {
                                    if (array[i].$$hashKey != rowEntity.$$hashKey) {
                                        array[i].maininsurance = 'N';
                                        array[i].insurancepk = {};
                                    } else {
                                        $scope.VO.insurancetotalmoney = (parseFloat(array[i].insurancemoney)).toFixed(2);
                                    }
                                }
                            } else if (newValue == 'N') {
                                $scope.VO.insurancetotalmoney = 0;
                                for (var i = 0; i < array.length; i++) {
                                    if (array[i].$$hashKey == rowEntity.$$hashKey) {
                                        array[i].insurancepk = {};
                                    } else if (array[i].maininsurance == 'Y') {
                                        $scope.VO.insurancetotalmoney = (parseFloat(array[i].insurancemoney)).toFixed(2);
                                    }
                                }
                            }
                        } else if ('insurancemoney' == colDef.name) {

                            if ($scope.insurancedmanGridOptions.data.length == 1) {
                                var length = $scope.insuranceinfoGridOptions.data.length;
                                var insedmanMoney = 0;
                                var insedmanFee = 0;
                                if (length > 0) {
                                    for (var i = 0; i < length; i++) {
                                        insedmanMoney = eval(insedmanMoney) + eval($scope.insuranceinfoGridOptions.data[i].insurancemoney);
                                        insedmanFee = eval(insedmanFee) + eval($scope.insuranceinfoGridOptions.data[i].insurancecharge);
                                    }
                                    $scope.insurancedmanGridOptions.data[0].insurancemoney = insedmanMoney;
                                    $scope.insurancedmanGridOptions.data[0].insurancefee = insedmanFee;
                                }
                            }

                            $scope.VO.insurancetotalcharge = 0.00;
                            if (rowEntity.maininsurance == 'Y') {
                                $scope.VO.insurancetotalmoney = newValue;
                                $scope.VO.insurancetotalmoney = (parseFloat($scope.VO.insurancetotalmoney)).toFixed(2);
                            }
                            var startDate = new Date($scope.VO.startdate).getTime();
                            var endDate = new Date($scope.VO.enddate).getTime();
                            // var yearStart = new Date(new Date($scope.VO.startdate).getFullYear(), 01, 01).getTime();
                            // var yearEnd = new Date(new Date($scope.VO.startdate).getFullYear(), 12, 31).getTime();
                            var yearStart = new Date($scope.VO.startdate);
                            var yearStart1 = new Date($scope.VO.startdate);
                            var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                            var time = yearEnd - yearStart.getTime();
                            rowEntity.insurancecharge = (parseFloat(rowEntity.insurancemoney) * parseFloat(rowEntity.chargerate) * parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000)).toFixed(2);
                            for (var i = 0; i < array.length; i++) {
                                // if (array[i].$$hashKey == rowEntity.$$hashKey) {
                                //     array[i].insurancecharge = array[i].insurancemoney * array[i].chargerate * 0.001;
                                //
                                // }
                                $scope.VO.insurancetotalcharge = eval(parseFloat($scope.VO.insurancetotalcharge).toFixed(2)) + eval(parseFloat(array[i].insurancecharge).toFixed(2));
                            }
                            if ($scope.VO.insuranceman.length > 0) {
                                for (var j = 0; j < $scope.VO.insuranceman.length; j++) {
                                    $scope.VO.insuranceman[j].vdef1 = eval(parseFloat(eval($scope.VO.insurancetotalmoney) * eval($scope.VO.insuranceman[j].insurancerate) / 100).toFixed(2));
                                    $scope.VO.insuranceman[j].insurancemoney = eval(parseFloat(eval($scope.VO.insurancetotalcharge) * eval($scope.VO.insuranceman[j].insurancerate) / 100).toFixed(2));
                                    $scope.VO.insuranceman[j].feemount = eval(parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval($scope.VO.insuranceman[j].commisionrate) / 100).toFixed(2));
                                }
                            }
                            if ($scope.VO.payment.length > 0) {
                                for (var j = 0; j < $scope.VO.payment.length; j++) {
                                    $scope.VO.payment[j].scaleMoney = '';
                                    $scope.VO.payment[j].planDate = '';
                                }
                            }
                        } else if ('insurancecharge' == colDef.name) {
                            if ($scope.insurancedmanGridOptions.data.length == 1) {
                                var length = $scope.insuranceinfoGridOptions.data.length;
                                var insedmanMoney = 0;
                                var insedmanFee = 0;
                                if (length > 0) {
                                    for (var i = 0; i < length; i++) {
                                        insedmanMoney = eval(insedmanMoney) + eval($scope.insuranceinfoGridOptions.data[i].insurancemoney);
                                        insedmanFee = eval(insedmanFee) + eval($scope.insuranceinfoGridOptions.data[i].insurancecharge);
                                    }
                                    $scope.insurancedmanGridOptions.data[0].insurancemoney = insedmanMoney;
                                    $scope.insurancedmanGridOptions.data[0].insurancefee = insedmanFee;
                                }
                            }
                            $scope.VO.insurancetotalcharge = 0;
                            for (var i = 0; i < array.length; i++) {
                                $scope.VO.insurancetotalcharge = eval(parseFloat($scope.VO.insurancetotalcharge).toFixed(2)) + eval(parseFloat(array[i].insurancecharge).toFixed(2));
                            }
                            if ($scope.VO.insuranceman.length > 0) {
                                for (var j = 0; j < $scope.VO.insuranceman.length; j++) {
                                    $scope.VO.insuranceman[j].insurancemoney = eval(parseFloat(eval($scope.VO.insurancetotalcharge) * eval($scope.VO.insuranceman[j].insurancerate) / 100).toFixed(2));
                                    $scope.VO.insuranceman[j].feemount = eval(parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval($scope.VO.insuranceman[j].commisionrate) / 100).toFixed(2));
                                }
                            }
                            if ($scope.VO.payment.length > 0) {
                                for (var j = 0; j < $scope.VO.payment.length; j++) {
                                    $scope.VO.payment[j].scaleMoney = '';
                                    $scope.VO.payment[j].planDate = '';
                                }
                            }

                            rowEntity.insurancecharge = parseFloat(rowEntity.insurancecharge).toFixed(2)
                        } else if ('chargerate' == colDef.name) {
                            $scope.VO.insurancetotalcharge = 0.00;
                            var startDate = new Date($scope.VO.startdate).getTime();
                            var endDate = new Date($scope.VO.enddate).getTime();
                            // var days = new Date($scope.VO.startdate).getFullYear();
                            // var yearStart = new Date(new Date($scope.VO.startdate).getFullYear(), 01, 01).getTime();
                            // var yearEnd = new Date(new Date($scope.VO.startdate).getFullYear(), 12, 31).getTime();
                            var yearStart = new Date($scope.VO.startdate);
                            var yearStart1 = new Date($scope.VO.startdate);
                            var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                            var time = yearEnd - yearStart.getTime();
                            rowEntity.insurancecharge = (parseFloat(rowEntity.insurancemoney) * parseFloat(rowEntity.chargerate) * parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000)).toFixed(2);
                            for (var i = 0; i < array.length; i++) {
                                // if (array[i].$$hashKey == rowEntity.$$hashKey) {
                                //     array[i].insurancecharge = array[i].insurancemoney * array[i].chargerate * 0.001;
                                // }
                                $scope.VO.insurancetotalcharge = eval(parseFloat($scope.VO.insurancetotalcharge).toFixed(2)) + eval(parseFloat(array[i].insurancecharge).toFixed(2));
                            }
                            if ($scope.VO.insuranceman.length > 0) {
                                for (var j = 0; j < $scope.VO.insuranceman.length; j++) {
                                    $scope.VO.insuranceman[j].insurancemoney = parseFloat(eval($scope.VO.insurancetotalcharge) * eval($scope.VO.insuranceman[j].insurancerate) / 100).toFixed(2);
                                    $scope.VO.insuranceman[j].feemount = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval($scope.VO.insuranceman[j].commisionrate) / 100).toFixed(2);
                                }
                            }
                            if ($scope.VO.payment.length > 0) {
                                for (var j = 0; j < $scope.VO.payment.length; j++) {
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
                    url: 'customerInsuRef/queryForGrid'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'insurancedmanpk',
                    params: {
                        type: 'beibaoxianren',
                    }
                },
                {
                    name: 'sex', displayName: '被保人性别', width: 100, cellFilter: 'SELECT_SEXTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.SEXTYPE
                },
                {
                    name: 'birthdate', displayName: '被保人出生日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'certificatetype', displayName: '被保人证件类型', width: 100, cellFilter: 'SELECT_CERTCODETYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.CERTCODETYPE
                },
                {
                    name: 'certificateno', displayName: '被保人证件编码', width: 100


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
                /*            gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
                 if('insurancedmanpk.name' == colDef.name){
                 if(rowEntity.insurancedmanpk){
                 if(rowEntity.insurancedmanpk.pk){
                 if(rowEntity.insurancedmanpk.c_0_address){
                 rowEntity.insurancedmanaddr = rowEntity.insurancedmanpk.c_0_address;
                 }else{
                 rowEntity.insurancedmanaddr = '';
                 }
                 $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: rowEntity.insurancedmanpk.pk}).success(function (response) {
                 if (response && response.code == "200") {
                 if(response.result.linkman != null && response.result.linkman.length >0){
                 rowEntity.insurancedmanlinkman = response.result.linkman[0].name;
                 rowEntity.insurancedmanlinktel = response.result.linkman[0].tele;
                 }else{
                 rowEntity.insurancedmanlinkman = '';
                 rowEntity.insurancedmanlinktel = '';
                 }
                 }
                 });
                 }
                 }else{
                 rowEntity.insurancedmanlinkman = '';
                 rowEntity.insurancedmanlinktel = '';
                 }
                 }
                 $scope.$apply();
                 });*/
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
                    url: 'insuranceCustomerRef/queryForGrid',
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'insurancemanpk',
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
                        if ('insurancerate' == colDef.name) {
                            if (rowEntity.insurancerate) {
                                if ($scope.VO.insurancetotalmoney == undefined) {
                                    $scope.VO.insurancetotalmoney = 0;
                                }
                                rowEntity.vdef1 = parseFloat(eval($scope.VO.insurancetotalmoney) * eval(rowEntity.insurancerate) / 100).toFixed(2);
                                rowEntity.insurancemoney = parseFloat(eval($scope.VO.insurancetotalcharge) * eval(rowEntity.insurancerate) / 100).toFixed(2);
                            }
                            var inData = $scope.insurancemanGridOptions.data;
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
                                var inData = $scope.insurancemanGridOptions.data;
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
                                var inData = $scope.insurancemanGridOptions.data;
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
                            var inData = $scope.insurancemanGridOptions.data;
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
                            var inData = $scope.insurancemanGridOptions.data;
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
                                var array = $scope.insurancemanGridOptions.data;
                                $scope.VO.commisiontotalnum = 0;
                                for (var i = 0; i < array.length; i++) {
                                    $scope.VO.commisiontotalnum = parseFloat(eval($scope.VO.commisiontotalnum) + eval(array[i].feemount)).toFixed(2);
                                }
                                $scope.VO.receivefeemount = parseFloat($scope.VO.commisiontotalnum).toFixed(2);
                            }
                            if ($scope.VO.payment.length > 0) {
                                for (var j = 0; j < $scope.VO.payment.length; j++) {
                                    $scope.VO.payment[j].scaleMoney = '';
                                    $scope.VO.payment[j].planDate = '';
                                }
                            }

                        }
                        if ('feemount' == colDef.name) {
                            var array = $scope.insurancemanGridOptions.data;
                            $scope.VO.commisiontotalnum = 0;
                            for (var i = 0; i < array.length; i++) {
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
            var result = 0;
            for (var i = 0; i < data.length; i++) {
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
            var result = 0;
            var flag = false;
            for (var i = 0; i < data.length; i++) {
                var feemount = 0;
                var insurancemoney = 0;
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
                    name: 'stages', displayName: '期数', width: 100, enableCellEdit: false


                },
                {
                    name: 'typeMoneyNO', displayName: '收付款类型', width: 100, cellFilter: 'SELECT_TYPEMONEY'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.TYPEMONEY, enableCellEdit: false
                },
                {
                    name: 'company.name', displayName: '收付款对象名称', width: 100, enableCellEdit: false


                },
                {
                    name: 'typeCompanyNO', displayName: '收付款对象类型', width: 100, cellFilter: 'SELECT_CUSTOMERTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.CUSTOMERTYPE, enableCellEdit: false
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
                                        rowEntity.planMoney = parseFloat(eval($scope.VO.receivemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                        rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.receivemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                    }
                                    for (var j = 0; j < $scope.VO.insuranceman.length; j++) {
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
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.DOUCUMENTTYPE
                },

                // {name: 'pkPubBlob.name', displayName: '附件内容', width: 100,enableCellEdit:false
                //     /*url:'INSURANCEBLOBREFMODEL'
                //     ,placeholder:'请选择' ,editableCellTemplate:'ui-grid/refEditor' ,popupModelField:'pkPubBlob'*/
                //
                //     },
                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},

                // {name: 'cUpman.name', displayName: '上载人', width: 100,enableCellEdit:false
                //    /* ,url:'userRef/queryForGrid'
                //     ,placeholder:'请选择' ,editableCellTemplate:'ui-grid/refEditor' ,popupModelField:'cUpman'*/
                //
                //     },
                {
                    name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                },
                // {name: 'cMemo', displayName: '备注', width: 100
                //     },
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

    initworkflow($scope, $http, ngDialog);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);


});
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
app.controller('assistantGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('provisionalPolicyGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('policyGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
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
            for (var i = 0; i < $scope.provisionalPolicyGridOptions.data.length; i++) {
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
            var rows = $scope.gridApi.selection.getSelectedRows();
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


app.controller('insurancedmanGridOptionsCtrl3', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
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
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});
            for (var j = 0; j < rows.length; j++) {
                var insurancedmanpk = {
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
                var temp = true;
                for (var k = 0; k < $scope.insurancedmanGridOptions.data.length; k++) {
                    if ($scope.insurancedmanGridOptions.data[k].pk == insurancedmanpk.pk) {
                        temp = false;
                    }
                }
                if (temp) {
                    $scope.insurancedmanGridOptions.data.push(insurancedmanpk);
                }
            }
            if (null != $scope.VO.behoder) {
                for (var ins = 0; ins < $scope.insurancedmanGridOptions.data.length; ins++) {
                    for (var be = 0; be < $scope.VO.behoder.length; be++) {
                        if ($scope.insurancedmanGridOptions.data[ins].pk == $scope.VO.behoder[be].BEHOLDER_ID) {
                            $scope.insurancedmanGridOptions.data[ins].insurancemoney = $scope.VO.behoder[be].ASSETS_INSURE_VALUE;
                        }
                    }
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
//自定义过滤器 jsonDate
app.filter("jsonDate", function ($filter) {
    return function (input, format) {
        //先得到时间戳
        var timestamp = Number(input.replace(/\/Date\((\d+)\)\//, "$1"));

        //转成指定格式
        return $filter("date")(timestamp, format);
    }
});
