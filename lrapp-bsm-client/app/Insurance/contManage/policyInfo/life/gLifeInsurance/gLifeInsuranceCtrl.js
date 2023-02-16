/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('gLifeInsuranceCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $location) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                insuranceinfo: [],
                insuranceman: [],
                partner: [],
                payment: [],
                assistant: [],
                insuranceGLifeData: [],
                isbudget: 'N',
                ifSubstitute: 'N',
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                dr: 0,
                billstatus: 31,
                insurancetotalmoney: 0,
                costscale: [],
                coomedium: [],
                insurancetype: "grouplife",
                isDianShang: "N",
                proofType: null,
                proofText: null,
            };
        };
        $scope.insuranceArr = ["010101", "010102", "010103", "010122", "010201", "010203"];
        $scope.entityVO = 'nc.vo.busi.InsurancebillVO';
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.funCode = '3020401';
        $scope.isProof = false;
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "operate_year": parseInt(new Date().format("yyyy")),
                "id": $stateParams.id
            }
        };
        $scope.firQuery = {
            pk: '',
            pk_event_type: '0001AA10000000007NHT',
            charge_off_status: 2
        };
        $scope.QUERY = $scope.initQUERY();

        $scope.param = {c_2_type: 1, c1type: 1, busi_type: 'notNull', customerType: '(1,2)'};
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

        $scope.projectEval = function (project){
            $scope.VO.estimatepk = project.cinsureman;
            $scope.VO.pkC0Tradetype = project.pkC0Tradetype;
            $scope.VO.busi_type = project.busi_type;
            $scope.VO.temporaryPlan = project.temporaryPlan;
            //校验出单通知书
            if ($scope.insuranceinfoGridOptions.data.length > 0) {
                $scope.VO.insuranceinfo = $scope.insuranceinfoGridOptions.data;
                $http.post($scope.basePath + "insuranceScheme/checkIfNeedIssueNotice", {data: angular.toJson($scope.VO)}).success(function (response) {
                    if (response && response.code == "400" && (null == $scope.VO.issueNoticeName || "" == $scope.VO.issueNoticeName)) {
                        return layer.alert("请选择出单通知书！",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                });
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
            return $http.post($rootScope.basePath + "gLifeInsurance/queryAllForGrid", {
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
            $http.post($scope.basePath + "gLifeInsurance/queryForGrid", {
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
        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "gLifeInsurance/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    // angular.assignData($scope.VO, response.result);
                    $scope.VO = response.result;
                    $scope.insuranceinfoGridOptions.data = $scope.VO.insuranceinfo;
                    //$scope.insurancedmanGridOptions.data = $scope.VO.insurancedman;
                    $scope.insurancemanGridOptions.data = $scope.VO.insuranceman;
                    if (!$scope.VO.dealAttachmentB) {
                        $scope.VO.dealAttachmentB = [];
                    }
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    $scope.partnerGridOptions.data = $scope.VO.partner;
                    $scope.paymentGridOptions.data = $scope.VO.payment;
                    if($scope.VO.proofType!=null && $scope.VO.proofType!=""){
                        $scope.proofTypeBox[parseInt($scope.VO.proofType)-1] = true;
                    }
                    $scope.changeAgentParamType();
                    //保单库被保人分页
                    if ($scope.VO.insuranceData && $scope.VO.insuranceData.beholderInfo) {
                        $scope.initTablePage($scope.VO.insuranceData.beholderInfo);
                    }
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
                    $http.post($scope.basePath + "gLifeInsurance/discard", {pk: $scope.pk, billdef: $scope.billdef}).success(function (response) {
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


        $scope.onCheckInsuranceno = function (insur) {
            $http.post($scope.basePath + "propertyInsurance/checkInsuranceno", {param: angular.toJson($scope.VO), "insureType": "grouplife"}).success(function (response) {
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
            $http.post($rootScope.basePath + "gLifeInsurance/checkWithEIMS", {data: angular.toJson($scope.VO)})
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

        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO.payment = $scope.paymentGridOptions.data;
            if (null != $scope.insuranceinfoGridOptions.data) {
                for (var i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                    //保险险种信息子表中的“佣金比例”为null---计算
                    //保险险种信息子表中的“佣金比例”不为null----保持填写数值
                    var insuranceinfoArray = $scope.insuranceinfoGridOptions.data[i];
                    if (insuranceinfoArray.commisionrate == undefined || insuranceinfoArray.commisionrate == 0) {
                        var commisionrate = parseFloat(insuranceinfoArray.commisionnum / insuranceinfoArray.insurancecharge * 100).toFixed(2);
                        var commisionnum = insuranceinfoArray.commisionnum;
                        insuranceinfoArray.commisionrate = commisionrate;
                        insuranceinfoArray.commisionnum = commisionnum;
                    } else if (insuranceinfoArray.commisionrate != null) {
                        var commisionrate = parseFloat(insuranceinfoArray.commisionrate);
                        var commisionnum = insuranceinfoArray.commisionnum;
                        insuranceinfoArray.commisionrate = commisionrate;
                        insuranceinfoArray.commisionnum = commisionnum;
                    }
                }
            }
            $scope.VO.insuranceinfo = $scope.insuranceinfoGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $http.post($rootScope.basePath + "gLifeInsurance/save", {data: angular.toJson($scope.VO), funCode: $scope.funCode})
                .success(function (response) {
                    if (response && response.code == "200") {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisableds = true;
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
                            let flag = response.flag;
                            if (flag == 1) {
                                $scope.isProof = true;
                            }
                        }
                    }
                });
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
        $scope.submit = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "gLifeInsurance/submit", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    layer.closeAll('loading');
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
                    if (response.code == 200) {
                        if ($scope.isGrid) {
                            $scope.queryForGrid($scope.QUERY);
                        } else {
                            $scope.findOne($scope.pk);
                        }
                    }
                });
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

        /**
         * 表格分页方法Start
         */
        $scope.initTablePage = function (sourceData) {
            $scope.tablePageDataAll = sourceData; //要分页的全部数据
            $scope.tablePageSize = 10;　　//分页大小，可以随意更改
            $scope.tablePages = Math.ceil($scope.tablePageDataAll.length / $scope.tablePageSize); //分页数
            $scope.tableNewPages = $scope.tablePages > 5 ? 5 : $scope.tablePages; //页面可选择的页数总数
            $scope.tablePagesList = []; //可选择的页数集合
            $scope.tablePageData = []; //当前显示的数据
            $scope.tableSelPage = 1; //初始页码
            $scope.setTableData();
            $scope.selectTablePage($scope.tableSelPage);
        }
        $scope.setTableData = function () {
            $scope.tablePageData = $scope.tablePageDataAll.slice(($scope.tablePageSize * ($scope.tableSelPage - 1)), ($scope.tableSelPage * $scope.tablePageSize));//通过当前页数筛选出表格当前显示数据
        };
        $scope.selectTablePage = function (page) {
            //不能小于1大于最大
            if (page < 1 || page > $scope.tablePages) return;
            //最多显示分页数5
            var newpageList = [];
            if (page <= 2) {
                for (var i = 0; i < $scope.tableNewPages; i++) {
                    newpageList.push(i + 1);
                }
            } else if (page > ($scope.tablePages - 3)) {
                for (var i = 4; i >= 0; i--) {
                    if($scope.tablePages - i > 0){
                        newpageList.push($scope.tablePages - i);
                    }
                }
            } else if (page > 2) {
                for (var i = (page - 3); i < ((page + 2) > $scope.tablePages ? $scope.tablePages : (page + 2)); i++) {
                    if ((i + 1) > 0) {
                        newpageList.push(i + 1);
                    }
                }
            }
            $scope.tablePagesList = newpageList;
            $scope.tableSelPage = page;
            $scope.setTableData();
            $scope.tableActivePage(page);
        }
        //设置当前选中页样式
        $scope.tableActivePage = function (page) {
            return $scope.tableSelPage == page;
        };
        //上一页
        $scope.tablePrevious = function () {
            $scope.selectTablePage($scope.tableSelPage - 1);
        };
        //下一页
        $scope.tableNext = function () {
            $scope.selectTablePage($scope.tableSelPage + 1);
        };
        /**
         * 表格分页方法End
         */
        $scope.beforeSave = function () {
            $http.post($scope.basePath + "insuranceScheme/checkIfNeedIssueNotice", {data: angular.toJson($scope.VO)}).success(function (response) {
                if (response && response.code == "400" && (null == $scope.VO.issueNoticeName || "" == $scope.VO.issueNoticeName)) {
                    return layer.alert("请选择出单通知书！",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    $scope.onSaveVO();
                }
            });
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
                    $scope.VO.informCode = response.result.IssueNoticeNo;
                    $scope.VO.pkInsureProject = response.result.insuranceSchemeId;
                    $scope.VO.insureProjectCode = response.result.insuranceSchemeCode;
                    $scope.VO.issueNoticeName = response.result.name;
                    $scope.insureType = response.result.insureType;
                    $scope.VO.ifuhv = response.result.ifuhv;
                    $scope.getInsureInfo();
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
        $scope.onRowDblClick = function (item) {
            if (item && item.id) {
                $scope.onCard(item.id);
            }
        };

        $scope.onSubmitSelf = function () {
            if (!$scope.VO.insuranceno) {
                return layer.alert("提交之前必须补充保单号", {skin: 'layui-layer-lan', closeBtn: 1});
            }
            if ($scope.dealAttachmentBGridOptions.data.length == 0) {
                return layer.alert("请上传附件！", {skin: 'layui-layer-lan', closeBtn: 1});
            }
            $scope.onCheckInsuranceno("Submit");
        }
        $scope.findOneData = function (pk) {
            //优先切换页面
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
            $scope.pk = pk;
            $rootScope.dataById = null;
            $scope.funCode = '3020401';
            layer.load(2);
            $http.post($scope.basePath + "insuranceData/changeInsurance", {pk: pk}).success(function (response) {
                if (response && response.code == "200") {
                    //数据赋值
                    $scope.VO = response.data;
                    $scope.insuranceinfoGridOptions.data = $scope.VO.insuranceinfo;
                    //保险公司
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

        $scope.$watch('VO.busi_type', function (newVal, oldVal) {
            if (!$scope.isEdit && !$scope.isUpdate) {
                return;
            }
            $scope.changeAgentParamType();
        }, true);

        $scope.$watch('VO.isDianShang', function (newVal, oldVal) {
            if (!$scope.isEdit && !$scope.isUpdate) {
                return;
            }
            if ($scope.VO != null && $scope.VO.isDianShang != null) {
                if ("Y" == $scope.VO.isDianShang) {
                    $scope.QUERY = {
                        "id": $stateParams.id,
                        "DATA ->> '$.isDianShang'": "Y"
                    }
                } else {
                    $scope.QUERY = $scope.initQUERY();
                }
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
        $scope.getInsureName = function (id) {
            var DWZCINSURANCETYPE = [{id: "caicyqx", name: "财产一切险"}, {id: "jianzazgcyqx", name: "建筑安装工程一切险"}, {id: "guzzrx", name: "雇主责任险"}, {id: "jiqshx", name: "机器损坏险"}, {
                id: "anzgcyqx",
                name: "安装工程一切险"
            }, {id: "jianagcx", name: "建筑工程一切险"}, {id: "gongdzrx", name: "供电责任险"}, {id: "gongzzrx", name: "公众责任险"}, {id: "kehxyx", name: "客户信用险"}, {id: "yingyzdx", name: "营业中断险"}, {
                id: "anqsczrx",
                name: "安全生产责任险"
            }, {id: "huanjwrzrx", name: "环境污染责任保险"}, {id: "chongdzzhbx", name: "充（换）电站综合保险"}, {id: "tuantywx", name: "团体人身意外伤害保险"}];
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
            }, {id: "huanjwrzrx", name: "环境污染责任保险"}, {id: "chongdzzhbx", name: "充（换）电站综合保险"}, {id: "tuantywx", name: "团体人身意外伤害保险"}];
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
                            insurancemoney: $scope.VO.insurancetotalcharge,
                            commisionrate: $scope.insureType[0].COMMISION_FEE_RATE,
                            chiefman: "N"
                        };
                        if (rows.length == 1) {
                            insurancedmanpk.chiefman = "Y";
                        }
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
                                $scope.insurancemanGridOptions.data[ins].vdef1 = $scope.company[be].underwritingRatio / 100 * $scope.ALL_FEE;
                                $scope.insurancemanGridOptions.data[ins].insurancemoney = ($scope.insurancemanGridOptions.data[ins].insurancerate / 100) * $scope.VO.insurancetotalcharge;
                            }
                        }
                    }
                }
                layer.closeAll('loading');
            });
        }

        // $scope.$watch('insuranceinfoGridOptions.data[0].insurancepk.name', function (newVal, oldVal) {
        $scope.getInsureInfo = function () {
            if (null != $scope.VO.pkProject && $scope.isDw || ($scope.VO.informCode != null && $scope.VO.informCode != "")) {
                var ids = "";
                var cids = "";
                var behoder = new Array();
                var company = new Array();
                if (null != $scope.insureType) {
                    for (var i = 0; i < $scope.insureType.length; i++) {
                        //判断选择的险种在出单通知书中是否存在
                        if ($scope.getInsureName($scope.insureType[i].INSURE_TYPE_ID) == "团体人身意外伤害保险") {
                            behoder = $scope.insureType[i].insurebeHolde;
                            company = $scope.insureType[i].insureCompany;
                            $scope.VO.insuranceGLifeData = $scope.insureType[i].insuranceGLifeData;
                            $scope.insuranceGLifeOptions.data = $scope.insureType[i].insuranceGLifeData;
                            $scope.ALL_FEE = $scope.insureType[i].ALL_FEE;
                            $scope.VO.insurancetotalmoney = $scope.insureType[i].ALL_FEE;

                            var insuranceGLifeData = $scope.insureType[i].insuranceGLifeData;
                            $scope.insuranceinfoGridOptions.data = new Array();

                            var insureFee = 0;
                            for (var g = 0; g < insuranceGLifeData.length; g++) {
                                insureFee += parseFloat(insuranceGLifeData[g].premiumAll);
                                var insuranceinfo = {
                                    vdef6: insuranceGLifeData[g].insuredType,
                                    insurancemoneyoneperson: insuranceGLifeData[g].insuranceMoneyEveryone,
                                    estimatenum: insuranceGLifeData[g].peopleAll,
                                    insurancemoney: insuranceGLifeData[g].insuranceMoneyAll,
                                    chargerate: insuranceGLifeData[g].rate,
                                    insurancecharge: insuranceGLifeData[g].premiumAll,
                                    franchise: insuranceGLifeData[g].deductible,
                                    maininsurance: "Y",
                                    vdef4: "N",
                                    vdef2: "N",
                                    insurancepk: {
                                        name: "团体人身意外伤害保险",
                                        pk: "0001A1100000000474IW",
                                        code: "020306",
                                        label: "团体人身意外伤害保险",
                                        parentId: "0001A11000000002JBUT"
                                    }
                                };
                                $scope.insuranceinfoGridOptions.data.push(insuranceinfo);
                            }
                            //先赋值时间，后赋值险种子表
                            $scope.VO.startdate = $scope.insureType[i].INSURE_START_DATE;
                            $scope.VO.enddate = $scope.insureType[i].INSURE_END_DATE;
                            $scope.VO.insuranceinfo = $scope.insuranceinfoGridOptions.data;
                            $scope.VO.insurancetotalcharge = insureFee;

                            for (var c = 0; c < $scope.insureType[i].insureCompany.length; c++) {
                                var cid = $scope.insureType[i].insureCompany[c].insureCompanyId;
                                if (c == $scope.insureType[i].insureCompany.length - 1) {
                                    cids += "-" + cid + "-";
                                } else {
                                    cids += "-" + cid + "-" + ",";
                                }
                            }
                            $scope.company = company;
                            $scope.getInsureCompany(cids);
                        } else {
                            $scope.VO.ids = new Array();
                            $scope.VO.ids.push("''");
                        }
                    }
                } else {
                    $scope.VO.ids = new Array();
                }
            }
        }
        // , true);


        $scope.$watch('VO.insurancebillkindNO', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['insurancebillkindNOName'] = $rootScope.SELECT.INSURANCEBILLKIND[newVal].name;
            }
        }, true);

        $scope.$watch('VO.vdef12', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['vdef12Name'] = $rootScope.SELECT.BUSINESSTYPE[newVal].name;
            }
        }, true);

        $scope.$watch('VO.c2PaymethodNO', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['c2PaymethodNOName'] = $rootScope.SELECT.PAYMETHODTYPE[newVal].name;
            }
        }, true);


        //90的校验
        $scope.$watch('VO.startdate', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            // || (!angular.isUndefined($scope.VO.pkReport))
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            //如果选了出单通知书，就不重新计算保险险种信息中的保费
            // if (($scope.VO.issueNoticeName != null || $scope.VO.issueNoticeName != "") && (oldVal == null || oldVal == undefined)) return;

            if ($scope.isEdit) {
                if ($scope.VO.pkReport) {
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
                var now = new Date().getTime();
                var selected = new Date(newVal).getTime();
                var dates = (new Date(newVal).setFullYear(new Date(newVal).getFullYear() + 1));
                //如果结束日期已经有值了，那就不改变结束日期的值
                $scope.VO.enddate = $scope.VO.enddate!=null ? $scope.VO.enddate : new Date(dates).setDate(new Date(dates).getDate() - 1);
                $scope.msgFlag = false;
                var startDate = new Date($scope.VO.startdate).getTime();
                var endDate = new Date($scope.VO.enddate).getTime();
                var yearStart = new Date($scope.VO.startdate);
                var yearStart1 = new Date($scope.VO.startdate);
                var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                var time = yearEnd - yearStart.getTime();
                let insurancemanData = $scope.insurancemanGridOptions.data
                if (insurancemanData) {
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
                        return layer.alert($scope.VO.estimatepk.name + " 客户协议信息已经过期，请录入新的协议信息!", {skin: 'layui-layer-lan', closeBtn: 1});
                    } else {
                        $scope.childFlag = true;
                    }
                }
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
            // || (!angular.isUndefined($scope.VO.pkReport))
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                var startDate = new Date($scope.VO.startdate).getTime();
                var endDate = new Date($scope.VO.enddate).getTime();
                // var yearStart = new Date(new Date($scope.VO.startdate).getFullYear(), 01, 01).getTime();
                // var yearEnd = new Date(new Date($scope.VO.startdate).getFullYear(), 12, 31).getTime();
                var yearStart = new Date($scope.VO.startdate);
                var yearStart1 = new Date($scope.VO.startdate);
                var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                var time = yearEnd - yearStart.getTime();
                if ($scope.insuranceinfoGridOptions.data) {
                    for (var i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                        if ($scope.insuranceinfoGridOptions.data[i].insurancecharge.length == 0) {
                            $scope.insuranceinfoGridOptions.data[i].insurancecharge = ($scope.insuranceinfoGridOptions.data[i].insurancemoney * $scope.insuranceinfoGridOptions.data[i].chargerate * (((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / (time / 24 / 3600 / 1000)).toFixed(2);

                        }
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

        $scope.$watch('insuranceinfoGridOptions.data', function (newVal, oldVal) {
                if (!$scope.isEdit) {
                    return;
                }
                //校验出单通知书
                if ($scope.insuranceinfoGridOptions.data.length > 0) {
                    $scope.VO.insuranceinfo = $scope.insuranceinfoGridOptions.data;
                    $http.post($scope.basePath + "insuranceScheme/checkIfNeedIssueNotice", {data: angular.toJson($scope.VO)}).success(function (response) {
                        if (response && response.code == "400" && (null == $scope.VO.issueNoticeName || "" == $scope.VO.issueNoticeName)) {
                            return layer.alert("请选择出单通知书！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    });
                }
            }
            , true);
        $scope.$watch('VO.pkProject.name', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if ($scope.VO.pkProject.name != null) {
                $scope.isDisableds = false;
            } else {
                $scope.isDisableds = true;
            }
            if ($scope.isEdit && $scope.VO.billstatus == 37) {
                $scope.msgFlag = false;
            }
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
        }, true);
        $scope.$watch('insurancemanGridOptions.data', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                var data = $rootScope.diffarray(newVal, oldVal);
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
                                data.row.insuranceaddr = '不详';
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
                                typeCompanyNO: 3,
                                vdef4: array[k].vdef4,
                                vdef2: array[k].vdef2
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
                            typeCompanyNO: 3,
                            typeCompany: '保险公司'
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
                                type_business: 1,
                                vdef4: array[k].vdef4,
                                vdef2: array[k].vdef2
                            };
                            reData.push(data);
                        }
                    }
                }
            }
            $scope.paymentGridOptions.data = reData;
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
                        url: $scope.basePath + 'propertyInsurance/upLoadFile',
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


        $scope.isClear = false;
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

        $scope.onCopy = function () {
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
        $scope.onUploads = function (selectTabName) {
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
            if (!rows || rows.length <= 0) return angular.alert("请选择一条单据进行操作！");
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
                ids.push(rows[i].pk_project_id);
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
        /* $scope.onQuery = function () {
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
                if (rows[0].billstatus != 37) return layer.alert("只有未上报状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 37) return layer.alert("只有未上报状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            $scope.submit();
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
            //津惠保订单跳转到团体寿险页面
            if ($scope.VO && $scope.VO.benefitInsuredStatus == 1 && $scope.VO.benefitInsuredStatus != null) {
                $rootScope.benefitInsuredData = null;
                $scope.form = true;
                $scope.isGrid = false;
                $scope.isClear = true;
                $scope.isEdit = true;
                $scope.isDisableds = true
                $scope.isDisabled = false;
                $scope.tabDisabled = true;
                $scope.isBack = true;
                $scope.isUploadAnytime = false;
                $scope.insuranceinfoGridOptions.data = $scope.VO.insuranceinfo;
                $scope.insurancemanGridOptions.data = $scope.VO.insuranceman;
                $scope.partnerGridOptions.data = [];
                $scope.paymentGridOptions.data = [];
                $scope.insuranceGLifeOptions.data = [];
            } else {
                $scope.form = true;
                $scope.isGrid = false;
                $scope.isClear = true;
                $scope.isEdit = true;
                $scope.isDisableds = true;
                $scope.isDisabled = false;
                $scope.tabDisabled = true;
                $scope.isBack = true;
                $scope.isUploadAnytime = false;
                $scope.agentParam = null;
                $scope.VO = $scope.initVO();
                //$scope.data = $scope.initData();
                $scope.initView();
                angular.assignData($scope.VO, $scope.initVO());
                $scope.insuranceinfoGridOptions.data = [];
                $scope.insurancemanGridOptions.data = [];
                $scope.partnerGridOptions.data = [];
                $scope.paymentGridOptions.data = [];
                $scope.insuranceGLifeOptions.data = [];
                //@zhangwj 【YDBXJJ-1940】 团体寿险保单录入第一个保单暂存或保存后，录入下一个时会带出前一个保单的附件
                $scope.dealAttachmentBGridOptions.data = [];
                $rootScope.onAddCheck($scope);
            }

        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            $scope.childFlag = true;
            $scope.isDisableds = false;
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
            $scope.VO.insuranceinfo = $scope.insuranceinfoGridOptions.data;
            $scope.VO.insuranceman = $scope.insurancemanGridOptions.data;
            $scope.VO.partner = $scope.partnerGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            if (data) {
                var tablename = $scope.table_name;
                $http.post($rootScope.basePath + "temporary/insert", {data: angular.toJson(data), tablename: tablename}).success(function (response) {
                    if (response.code == 200) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisableds = true;
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
                    $scope.VO = response.result;
                    $scope.insuranceinfoGridOptions.data = $scope.VO.insuranceinfo;
                    $scope.insurancemanGridOptions.data = $scope.VO.insuranceman;
                    $scope.partnerGridOptions.data = $scope.VO.partner;
                    $scope.paymentGridOptions.data = $scope.VO.payment;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
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

        /* $scope.onCard = function () {
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
                    $http.post($scope.basePath + "gLifeInsurance/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
            $scope.isDisableds = true;
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
                    return layer.alert(errEls[0].ngVerify.OPTS.message,
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    $scope.childFlag = true;
                    if ($scope.childFlag) {
                        if ($scope.insuranceinfoGridOptions.data.length > 0) {
                            angular.forEach($scope.insuranceinfoGridOptions.data, function (item) {
                                if (!item.insurancecharge || item.insurancecharge == "NaN") {
                                    $scope.childFlag = false;
                                    return layer.alert("保险险种信息子表保费不能为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            });
                        }
                    }
                    $scope.VO.insurancebillkindNOName = $rootScope.returnSelectName($scope.VO.insurancebillkindNO, "INSURANCEBILLKIND");

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
                    if ($scope.childFlag) {
                        if ($scope.insuranceinfoGridOptions.data.length == 0) {
                            return layer.alert("险种信息子表不能为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        $scope.VO.insuranceinfo = $scope.insuranceinfoGridOptions.data;
                        for (let i = 0; i < $scope.VO.insuranceinfo.length; i++) {
                            let item = $scope.VO.insuranceinfo[i];
                            if (!item.insurancepk) {
                                $scope.childFlag = false;
                                return layer.alert("险种子表中险种名称不可为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (!item.vdef6) {
                                $scope.childFlag = false;
                                return layer.alert("险种子表中具体险种不可为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});

                            }
                            if (!item.insurancemoneyoneperson) {
                                $scope.childFlag = false;
                                return layer.alert("险种子表中保险金额/赔偿限额(每人)不可为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (!item.estimatenum) {
                                $scope.childFlag = false;
                                return layer.alert("险种子表中投保人数不可为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                    }
                    if ($scope.childFlag) {
                        if ($scope.insurancemanGridOptions.data.length == 0) {
                            return layer.alert("保险人信息子表不能为空！", {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        $scope.VO.insuranceman = $scope.insurancemanGridOptions.data;
                        var chiefmanY = 0;
                        var totalFeemount = 0;
                        var result = 0;
                        let totalInsurancerate = 0;
                        for (let i = 0; i < $scope.VO.insuranceman.length; i++) {
                            let item = $scope.VO.insuranceman[i];
                            // angular.forEach($scope.insurancemanGridOptions.data, function (item) {
                            if (item.feemount) {
                                totalFeemount = parseFloat(totalFeemount) + eval(item.feemount);
                            }
                            if (!item.insurancemanpk) {
                                $scope.childFlag = false;
                                chiefmanY = 1;
                                return layer.alert("保险人子表中保险人名称不可为空!", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (!item.insuranceaddr) {
                                $scope.childFlag = false;
                                chiefmanY = 1;
                                return layer.alert("保险人子表中保险人地址不可为空!", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (!item.insurancelinkman) {
                                $scope.childFlag = false;
                                chiefmanY = 1;
                                return layer.alert("保险人子表中保险人联系人不可为空!", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (!item.insurancelinktel) {
                                $scope.childFlag = false;
                                chiefmanY = 1;
                                return layer.alert("保险人子表中保险人联系电话不可为空!", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if (item.insurancerate < 0 || item.insurancerate > 100) {
                                $scope.childFlag = false;
                                chiefmanY = 1;
                                return layer.alert("请检查保险人信息子表中的承保比例!", {skin: 'layui-layer-lan', closeBtn: 1});

                            }
                            //计算保险人信息子表中的保费
                            result = parseFloat(result) + parseFloat(item.insurancemoney);
                            //计算保险人信息子表中的承包比例加和
                            totalInsurancerate += parseFloat(item.insurancerate);
                        }
                        // )
                        //计算保险人信息子表中的承包比例加和
                        if (totalInsurancerate > 100 || totalInsurancerate < 100) {
                            return layer.alert("保险人信息子表中的承保比例加和应等于100!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if (parseFloat($scope.VO.commisiontotalnum).toFixed(2) != parseFloat(totalFeemount).toFixed(2)) {
                            $scope.childFlag = false;
                            return layer.alert("保险人信息子表佣金 加和不等于佣金总金额!", {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if (parseFloat($scope.VO.insurancetotalcharge).toFixed(2) != parseFloat(result).toFixed(2)) {
                            $scope.childFlag = false;
                            return layer.alert("保险人信息子表保费 加和不等于签单总保费!", {skin: 'layui-layer-lan', closeBtn: 1});
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
                            for (var i = 0; i < payment.length; i++) {
                                var pay = payment[i];
                                if (pay.stages == 1) {
                                    var count = 0;
                                    for (var k = 0; k < payment.length; k++) {
                                        var subpay = payment[k];
                                        if (subpay.typeMoneyNO == pay.typeMoneyNO && subpay.company.name == pay.company.name && subpay.vdef2 == pay.vdef2 && subpay.vdef4 == pay.vdef4) {
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
                                var arr = reg.exec((str));
                                if (angular.isDate(str)) {
                                    str = str.getFullYear() + '-' + (str.getMonth() + 1) + '-' + str.getDate();
                                }
                                if (!reg.test(str) && RegExp.$2 <= 12 && RegExp.$3 <= 31) {
                                    return layer.alert("子表属性计划日期格式错误",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }
                            //非互联业务部业务都需要录入保险金额并且保险金额不为0
                            if ($scope.VO.busi_type.code.substring(0, 3) != "2-6" && ($scope.VO.insurancetotalmoney == 0 || $scope.VO.insurancetotalmoney == 0.00 || $scope.VO.insurancetotalmoney == "NaN")) {
                                return layer.alert("金额信息中的保险金额/赔偿限额/(元)不能为0！", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if ($scope.insuranceinfoGridOptions.data.length > 0) {
                                let count1 = 0;
                                for (var i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                                    $scope.childFlag = false;
                                    //非互联网业务数据子表保险金额0提示信息
                                    //互联网业务的数据可以不录入保险金额或0
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
                                                // if ($scope.VO.billstatus == 37) {
                                                //     $scope.VO.billstatus = 31;
                                                // }
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
                            if ($scope.msgFlag) {
                                angular.alert($scope.msg);
                                $scope.childFlag = false;
                            }
                            if ($scope.VO.busi_type.name == '个人代理业务' && ($scope.VO.pkAgent == null || $scope.VO.pkAgent == '' || $scope.VO.pkAgent.name == null || $scope.VO.pkAgent.name == '')) {
                                return layer.alert("代理制项目必须选择执业人员！", {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            $scope.VO.insuranceinfo = $scope.insuranceinfoGridOptions.data;
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
                                            $scope.beforeSave();
                                        })
                                    }
                                });
                            }

                            if ($scope.childFlag) {
                                $scope.beforeSave();
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
                data.maininsurance = "Y";
                data.chargerate = '0';
                data.vdef4 = 'N';
                data.vdef2 = 'N';
                $scope.VO.receivefeeperiod = 0;
            } else if ($scope.selectTabName == 'insurancemanGridOptions') {
                data.replace = 'N';
                /* data.vdef4 = 'N';
                 data.vdef2 = 'N';*/
                data.pay = 'N';
                $scope.VO.receivefeeperiod = 0;
                if ($scope.insuranceinfoGridOptions.data.length == 0) {
                    data.chiefman = 'Y';
                    data.maininsurance = 'Y';
                } else {
                    data.chiefman = 'N';
                }

            }
            $scope[$scope.selectTabName].data.push(data);
        };
        /**
         * 子表删除
         */
        $scope.onDeleteLine = function (selectTabName) {

            let selectTabNameOld = '';
            if (selectTabName) {
                selectTabNameOld = $scope.selectTabName;
                $scope.selectTabName = selectTabName;
            }

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
            if ($scope.selectTabName == "insuranceinfoGridOptions") {
                var array = $scope.insuranceinfoGridOptions.data;
                $scope.VO.insurancetotalmoney = 0;
                $scope.VO.commisiontotalnum = 0;
                if (array.length == 0) {
                    $scope.VO.insurancetotalcharge = 0;
                    $scope.VO.commisiontotalnum = 0;
                } else {
                    $scope.VO.insurancetotalcharge = 0;
                    $scope.VO.insurancetotalmoney = 0;
                    $scope.VO.commisiontotalnum = 0;
                    for (var i = 0; i < array.length; i++) {
                        $scope.VO.insurancetotalcharge = (eval(parseFloat($scope.VO.insurancetotalcharge)) + eval(parseFloat(array[i].insurancecharge))).toFixed(2);
                        $scope.VO.insurancetotalmoney = (eval(parseFloat($scope.VO.insurancetotalmoney)) + eval(parseFloat(array[i].insurancemoney))).toFixed(2);
                        $scope.VO.commisiontotalnum = (eval(parseFloat($scope.VO.commisiontotalnum)) + eval(parseFloat(array[i].commisionnum))).toFixed(2);
                        $scope.VO.receivefeemount = $scope.VO.commisiontotalnum;
                    }
                    $scope.VO.receivefeeperiod = 0;
                }
            }
            if ($scope.selectTabName == 'insurancemanGridOptions') {
                $scope.VO.receivefeeperiod = 0;
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
        $scope.showBeholderInfo = false;
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
            showGridFooter: true,
            showColumnFooter: true,
            useExternalPagination: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '团体寿险信息.csv',
            columnDefs: [
                {name: 'billCheckBySelfState', displayName: '自查状态', width: 100,cellFilter: 'SELECT_BILLCHECKBYSELFSTATETYPE'},
                {name: 'insuranceinfono', displayName: '保单信息编号', width: 100, footerCellTemplate: '<div class="ui-grid-cell-contents">合计</div>>'},
                {name: 'pk_project_name', displayName: '业务/项目名称', width: 100,},
                {name: 'approval_number', displayName: '业务签报批复编号', width: 100,},
                {name: 'pk_project_code', displayName: '立项号 ', width: 100,},
                {name: 'busi_type_name', displayName: '业务分类 ', width: 100,},
                {name: 'pkC0Tradetype_name', displayName: '客户产权关系 ', width: 100,},
                {name: 'insuranceno', displayName: '投保单号', width: 100, cellFilter: 'CSV_FILTER'},
                {name: 'insuredDate', displayName: '投保时间', width: 100},
                {name: 'insurancebillkindNO', displayName: '保单性质', width: 100, cellFilter: 'SELECT_INSURANCEBILLKIND'},
                {name: 'estimatepk_name', displayName: '投保人', width: 100,},
                {name: 'c_2_mannum', displayName: '投保单位人数', width: 100,},
                {name: 'c_2_orgcodeno', displayName: '投保人组织机构', width: 100,},
                {name: 'estimateaddr', displayName: '投保人地址', width: 100,},
                {name: 'estimatelinkman', displayName: '投保人联系人姓名', width: 100,},
                {name: 'estimatelinktel', displayName: '投保人联系人电话', width: 100,},
                {name: 'c_2_Insurancenum', displayName: '投保人参保职工', width: 100,},
                {name: 'c_2_Inservicenum', displayName: '投保人在职职工', width: 100,},
                {name: 'c_2_retirenum', displayName: '投保人退休职工', width: 100,},
                {name: 'startdate', displayName: '保险起保日期/保险生效日期', width: 100,},
                {name: 'enddate', displayName: '保险到期日期', width: 100,},
                {name: 'c_2_payyear', displayName: '缴费年期', width: 100,},
                {name: 'c_2_paymethodNO', displayName: '缴费方式', width: 100, cellFilter: 'SELECT_PAYMETHODTYPE'},
                {
                    name: 'insurancetotalmoney', displayName: '保险金额/赔偿限额/(元)', width: 100, cellFilter: 'AMOUNT_FILTER', aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'insurancetotalcharge', displayName: '签单总保费(元)', width: 100, cellFilter: 'AMOUNT_FILTER', aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'commisiontotalnum', displayName: '佣金总金额(元)', width: 100, cellFilter: 'AMOUNT_FILTER ', aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    },
                },
                {name: 'receivefeeperiod', displayName: '应收佣金总期数', width: 100,},
                {
                    name: 'receivemount', displayName: '应收保费总额(元)', width: 100, cellFilter: 'AMOUNT_FILTER', aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'payperiod', displayName: '应解付保费总期数', width: 100,},
                {
                    name: 'paymount', displayName: '应解付总额(元)', width: 100, cellFilter: 'AMOUNT_FILTER', aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'receiveperiod', displayName: '应收保费总期数', width: 100,},
                {
                    name: 'receivefeemount', displayName: '应收佣金总额(元)', width: 100, cellFilter: 'AMOUNT_FILTER', aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'insurancesum', displayName: '保单件数', width: 100,},
                {name: 'c_2_managerate', displayName: '管理费率(%)', width: 100,},
                {name: 'd_2_personrate', displayName: '保费负担比例(员工)%', width: 100,},
                {name: 'd_2_personrate', displayName: '保费负担比例(单位)%', width: 100,},
                {
                    name: 'd_2_personmount', displayName: '计入个人账户金额', width: 100, cellFilter: 'AMOUNT_FILTER', aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'd_2_corpmount', displayName: '计入企业账户金额', width: 100, cellFilter: 'AMOUNT_FILTER', aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'c_2_distributemethod', displayName: '分红分配方式', width: 100,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator_name', displayName: '经办人', width: 100,},
                {name: 'operate_date', displayName: '制单日期', width: 100,},
                {name: 'operate_time', displayName: '制单时间', width: 100,},
                // {name: 'pkAuditor.name', displayName: '审核人', width: 100,},
                // {name: 'auditTime', displayName: '审核时间', width: 100,},
                // {name: 'auditDate.name', displayName: '审核日期', width: 100,},
                {name: 'pkOrg_name', displayName: '业务单位', width: 100,},
                {name: 'pkDept_name', displayName: '部门', width: 100,},
                {name: 'vdef12', displayName: '业务种类', width: 100, cellFilter: 'SELECT_BUSINESSTYPE'},
                {name: 'pkChecker_name', displayName: '审批人', width: 100,},
                {name: 'check_date', displayName: '审批日期', width: 100, cellFilter: 'date_cell_date'},
                {name: 'insurancepkName', displayName: '险种名称', width: 100, },
                {name: 'busiType1', displayName: '一级业务分类', width: 100,},
                {name: 'busiType2', displayName: '二级业务分类', width: 100,},
                {name: 'busiType3', displayName: '三级业务分类', width: 100,},
                {name: 'sumReceivemount', displayName: '已收保费总金额', width: 100,},
                {name: 'sumPayment', displayName: '已解付保费总金额', width: 100,},
                {name: 'sumReceivefeemount', displayName: '已收佣金总金额', width: 100,},

                // {name: 'checkTime', displayName: '复核时间', width: 100,},
                // {name: 'vapprovenote', displayName: '复核意见', width: 100,},
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
                    // angular.assignData($scope.VO, row.entity);
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
                    name: 'insurancepk.name',
                    displayName: '险种名称',
                    width: 100,
                    url: 'insuranceRef/queryForGrid',
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    isTree: true,
                    popupModelField: 'insurancepk',
                    params: {type: 'shouxian'}
                },
                {
                    name: 'vdef6', displayName: '具体险种', width: 100
                },
                {
                    name: 'insurancemoneyoneperson',
                    displayName: '保险金额/赔偿限额(每人)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'estimatenum', displayName: '投保人数', width: 100
                },
                {
                    name: 'insurancemoney', displayName: '保险金额/赔偿限额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'chargerate', displayName: '费率(‰)', width: 100, enableCellEdit: true,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
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
                },
                {
                    name: 'insurancecharge', displayName: '保费(含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'commisionrate', displayName: '佣金比例(%)', width: 100
                },
                {
                    name: 'commisionnum', displayName: '佣金金额(含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'franchise', displayName: '免赔额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
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

                        //@zhangwj 参照类单元格不可以手动输入
                        if(colDef.name.indexOf(".name") > 0){
                            let colName = colDef.name.replaceAll(".name","");
                            if(rowEntity[colName] == null ||rowEntity[colName].pk == null || rowEntity[colName].pk == ''){
                                rowEntity[colName] = {};
                            }
                        }

                        var array = $scope.insuranceinfoGridOptions.data;
                        $scope.totalmoney = function (array) {
                            $scope.VO.insurancetotalmoney = 0;
                            $scope.VO.insurancetotalcharge = 0;
                            $scope.VO.commisiontotalnum = 0;
                            for (var i = 0; i < array.length; i++) {
                                $scope.VO.insurancetotalmoney = parseFloat(isNaN($scope.VO.insurancetotalmoney) ? 0 : $scope.VO.insurancetotalmoney) + parseFloat(array[i].insurancemoney);
                                $scope.VO.insurancetotalcharge = eval(parseFloat($scope.VO.insurancetotalcharge)) + eval(parseFloat(isNaN(array[i].insurancecharge) ? 0 : array[i].insurancecharge).toFixed(2));
                                $scope.VO.commisiontotalnum = eval(parseFloat($scope.VO.commisiontotalnum)) + eval(parseFloat(isNaN(array[i].commisionnum) ? 0 : array[i].commisionnum).toFixed(2));
                                $scope.VO.receivefeemount = parseFloat($scope.VO.commisiontotalnum).toFixed(2);
                            }
                        };
                        if ('insurancemoney' == colDef.name) {
                            $scope.totalmoney(array);
                        } else if ('insurancemoneyoneperson' == colDef.name) {
                            if (newValue) {
                                rowEntity.insurancemoney = (parseFloat(newValue) * parseFloat(rowEntity.estimatenum)).toFixed(2);
                                var startDate = new Date($scope.VO.startdate).getTime();
                                var endDate = new Date($scope.VO.enddate).getTime();
                                // var yearStart = new Date(new Date($scope.VO.startdate).getFullYear(), 01, 01).getTime();
                                // var yearEnd = new Date(new Date($scope.VO.startdate).getFullYear(), 12, 31).getTime();
                                var yearStart = new Date($scope.VO.startdate);
                                var yearStart1 = new Date($scope.VO.startdate);
                                var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                                var time = yearEnd - yearStart.getTime();
                                rowEntity.insurancecharge = (parseFloat(rowEntity.insurancemoney) * parseFloat(rowEntity.chargerate) * parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000)).toFixed(2);
                                rowEntity.commisionnum = (parseFloat(rowEntity.insurancecharge) * parseFloat(rowEntity.commisionrate) / 100).toFixed(2);
                            }
                            $scope.VO.insurancetotalcharge = 0;
                            for (var i = 0; i < array.length; i++) {
                                $scope.VO.insurancetotalcharge = (parseFloat($scope.VO.insurancetotalcharge) + parseFloat(array[i].insurancecharge)).toFixed(2);
                            }
                            $scope.totalmoney(array);
                            if ($scope.VO.insuranceman.length > 0) {
                                for (var i = 0; i < $scope.VO.insuranceman.length; i++) {
                                    $scope.VO.insuranceman[i].vdef1 = (eval($scope.VO.insurancetotalmoney) * eval($scope.VO.insuranceman[i].insurancerate) / 100).toFixed(2);
                                    $scope.VO.insuranceman[i].insurancemoney = (eval($scope.VO.insurancetotalcharge) * eval($scope.VO.insuranceman[i].insurancerate) / 100).toFixed(2);
                                    $scope.VO.insuranceman[i].feemount = (eval($scope.VO.insuranceman[i].insurancemoney) * eval($scope.VO.insuranceman[i].commisionrate) / 100).toFixed(2);
                                }
                            }
                            if ($scope.VO.payment.length > 0) {
                                for (var i = 0; i < $scope.VO.payment.length; i++) {
                                    $scope.VO.payment[i].scaleMoney = '';
                                    $scope.VO.payment[i].planDate = '';
                                }
                            }
                        } else if ('estimatenum' == colDef.name) {
                            if (newValue) {
                                rowEntity.insurancemoney = (parseFloat(newValue) * parseFloat(rowEntity.insurancemoneyoneperson)).toFixed(2);
                                var startDate = new Date($scope.VO.startdate).getTime();
                                var endDate = new Date($scope.VO.enddate).getTime();
                                // var yearStart = new Date(new Date($scope.VO.startdate).getFullYear(), 01, 01).getTime();
                                // var yearEnd = new Date(new Date($scope.VO.startdate).getFullYear(), 12, 31).getTime();
                                var yearStart = new Date($scope.VO.startdate);
                                var yearStart1 = new Date($scope.VO.startdate);
                                var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                                var time = yearEnd - yearStart.getTime();
                                rowEntity.insurancecharge = (parseFloat(rowEntity.insurancemoney) * parseFloat(rowEntity.chargerate) * parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000)).toFixed(2);
                                rowEntity.commisionnum = (parseFloat(rowEntity.insurancecharge) * parseFloat(rowEntity.commisionrate) / 100).toFixed(2);
                            }
                            $scope.VO.insurancetotalcharge = 0;
                            for (var i = 0; i < array.length; i++) {
                                $scope.VO.insurancetotalcharge = (parseFloat($scope.VO.insurancetotalcharge) + parseFloat(array[i].insurancecharge)).toFixed(2);
                            }
                            $scope.totalmoney(array);
                            if ($scope.VO.insuranceman.length > 0) {
                                for (var i = 0; i < $scope.VO.insuranceman.length; i++) {
                                    $scope.VO.insuranceman[i].vdef1 = (eval($scope.VO.insurancetotalmoney) * eval($scope.VO.insuranceman[i].insurancerate) / 100).toFixed(2);
                                    $scope.VO.insuranceman[i].insurancemoney = (eval($scope.VO.insurancetotalcharge) * eval($scope.VO.insuranceman[i].insurancerate) / 100).toFixed(2);
                                    $scope.VO.insuranceman[i].feemount = (eval($scope.VO.insuranceman[i].insurancemoney) * eval($scope.VO.insuranceman[i].insurancerate) / 100).toFixed(2);
                                }

                            }
                            if ($scope.VO.payment.length > 0) {
                                for (var i = 0; i < $scope.VO.payment.length; i++) {
                                    $scope.VO.payment[i].scaleMoney = '';
                                    $scope.VO.payment[i].planDate = '';
                                }
                            }
                        } else if ('vdef4' == colDef.name) {
                            if (rowEntity.vdef4) {
                                if (rowEntity.vdef4 == 'Y') {
                                    angular.alert("系统将按照签单保费 /1.06来计算签单佣金，请确认!");
                                }
                            }
                        } else if ('vdef2' == colDef.name) {
                            if (rowEntity.vdef2) {
                                if (rowEntity.vdef2 == 'Y') {
                                    angular.alert("系统将按照实际佣金/1.06来计算签单佣金，请确认!");
                                }
                            }
                        } else if ('insurancecharge' == colDef.name) {
                            rowEntity.commisionnum = (parseFloat(newValue) * parseFloat(rowEntity.commisionrate)) / 100;
                            $scope.VO.insurancetotalcharge = 0;
                            for (var i = 0; i < array.length; i++) {
                                $scope.VO.insurancetotalcharge = (parseFloat($scope.VO.insurancetotalcharge) + parseFloat(array[i].insurancecharge)).toFixed(2);
                            }
                            if ($scope.VO.insuranceman.length > 0) {
                                for (var i = 0; i < $scope.VO.insuranceman.length; i++) {
                                    $scope.VO.insuranceman[i].insurancemoney = (eval($scope.VO.insurancetotalcharge) * eval($scope.VO.insuranceman[i].insurancerate) / 100).toFixed(2);
                                    $scope.VO.insuranceman[i].feemount = (eval($scope.VO.commisiontotalnum) * eval($scope.VO.insuranceman[i].insurancerate) / 100).toFixed(2);
                                }

                            }
                            if ($scope.VO.payment.length > 0) {
                                for (var i = 0; i < $scope.VO.payment.length; i++) {
                                    $scope.VO.payment[i].scaleMoney = '';
                                    $scope.VO.payment[i].planDate = '';
                                }
                            }
                        } else if ('commisionrate' == colDef.name) {
                            if (newValue) {
                                rowEntity.commisionnum = ((parseFloat(newValue) * parseFloat(rowEntity.insurancecharge)) / 100).toFixed(2);
                            }
                            /*  $scope.VO.commisiontotalnum = parseFloat($scope.VO.commisiontotalnum + eval(rowEntity.commisionnum)).toFixed(2);
                              $scope.VO.receivefeemount = $scope.VO.commisiontotalnum;*/
                            if ($scope.VO.payment.length > 0) {
                                for (var i = 0; i < $scope.VO.payment.length; i++) {
                                    $scope.VO.payment[i].scaleMoney = '';
                                    $scope.VO.payment[i].planDate = '';
                                }
                            }
                            $scope.totalmoney(array);
                        } else if ('chargerate' == colDef.name) {
                            if (newValue) {
                                var startDate = new Date($scope.VO.startdate).getTime();
                                var endDate = new Date($scope.VO.enddate).getTime();
                                // var yearStart = new Date(new Date($scope.VO.startdate).getFullYear(), 01, 01).getTime();
                                // var yearEnd = new Date(new Date($scope.VO.startdate).getFullYear(), 12, 31).getTime();
                                var yearStart = new Date($scope.VO.startdate);
                                var yearStart1 = new Date($scope.VO.startdate);
                                var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                                var time = yearEnd - yearStart.getTime();
                                // if(rowEntity.insurancecharge==null||rowEntity.insurancecharge.length==0){
                                rowEntity.insurancecharge = (parseFloat(rowEntity.insurancemoney) * parseFloat(rowEntity.chargerate) * parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000)).toFixed(2);
                                // }
                            }
                            $scope.VO.insurancetotalcharge = 0;
                            for (var i = 0; i < array.length; i++) {
                                $scope.VO.insurancetotalcharge = (parseFloat($scope.VO.insurancetotalcharge) + parseFloat(array[i].insurancecharge)).toFixed(2);
                            }
                            if ($scope.VO.insuranceman.length > 0) {
                                for (var i = 0; i < $scope.VO.insuranceman.length; i++) {
                                    $scope.VO.insuranceman[i].insurancemoney = (eval($scope.VO.insurancetotalcharge) * eval($scope.VO.insuranceman[i].insurancerate) / 100).toFixed(2);
                                    $scope.VO.insuranceman[i].feemount = (eval($scope.VO.commisiontotalnum) * eval($scope.VO.insuranceman[i].insurancerate) / 100).toFixed(2);
                                }

                            }
                            if ($scope.VO.payment.length > 0) {
                                for (var i = 0; i < $scope.VO.payment.length; i++) {
                                    $scope.VO.payment[i].scaleMoney = '';
                                    $scope.VO.payment[i].planDate = '';
                                }
                            }
                        }
                        if ('commisionnum' == colDef.name) {
                            let array = $scope.insuranceinfoGridOptions.data;
                            $scope.VO.commisiontotalnum = 0;
                            for (let i = 0; i < array.length; i++) {
                                $scope.VO.commisiontotalnum = parseFloat(eval($scope.VO.commisiontotalnum) + eval(array[i].commisionnum)).toFixed(2);
                            }
                            $scope.VO.receivefeemount = $scope.VO.commisiontotalnum;
                        }

                        if ('insurancecharge' == colDef.name || 'vdef4' == colDef.name || 'vdef2' == colDef.name || 'commisionrate' == colDef.name) {
                            var inData = $scope.insuranceinfoGridOptions.data;
                            if (rowEntity.commisionrate != null && rowEntity.commisionrate != "") {
                                if (rowEntity.insurancemoney) {
                                    rowEntity.commisionnum = rowEntity.insurancecharge;
                                }
                                if (rowEntity.vdef4 == 'Y') {
                                    rowEntity.commisionnum = rowEntity.commisionnum / 1.06;
                                }
                                if (rowEntity.vdef2 == 'Y') {
                                    rowEntity.commisionnum = rowEntity.commisionnum * 1.06;
                                }
                                if (rowEntity.commisionrate) {
                                    rowEntity.commisionnum = parseFloat((eval(rowEntity.commisionnum) * eval(rowEntity.commisionrate) / 100).toFixed(2)).toFixed(2);
                                    $scope.VO.paymount = $scope.calPay(inData);
                                }
                                if (rowEntity.commisionnum || !rowEntity.commisionnum) {
                                    var array = $scope.insuranceinfoGridOptions.data;
                                    $scope.VO.commisiontotalnum = 0;
                                    for (var i = 0; i < array.length; i++) {
                                        $scope.VO.commisiontotalnum = parseFloat(eval($scope.VO.commisiontotalnum) + eval(array[i].commisionnum)).toFixed(2);
                                    }
                                    $scope.VO.receivefeemount = $scope.VO.commisiontotalnum;
                                }
                                if ($scope.VO.payment.length > 0) {
                                    for (var j = 0; j < $scope.VO.payment.length; j++) {
                                        $scope.VO.payment[j].scaleMoney = '';
                                        $scope.VO.payment[j].planDate = '';
                                    }
                                }

                            }
                        }
                        $scope.$apply();
                    });
                }
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
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'pay', displayName: '是否全额解付', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'insurancerate', displayName: '承保比例(%)', width: 100
                },
                {
                    name: 'vdef1', displayName: '保险金额/赔偿限额(元)', width: 100, enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
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
                    name: 'feemount', displayName: '佣金金额(含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'chiefman', displayName: '是否主承保', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'memo', displayName: '备注', width: 100, enableCellEdit: true
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
                            if(rowEntity[colName].pk == null || rowEntity[colName].pk == ''){
                                rowEntity[colName] = {};
                            }
                        }

                        if ('insurancerate' == colDef.name) {
                            if (rowEntity.insurancerate) {
                                rowEntity.vdef1 = (eval($scope.VO.insurancetotalmoney) * eval(rowEntity.insurancerate) / 100).toFixed(2);
                                rowEntity.insurancemoney = (eval($scope.VO.insurancetotalcharge) * eval(rowEntity.insurancerate) / 100).toFixed(2);
                                rowEntity.feemount = (eval($scope.VO.commisiontotalnum) * eval(rowEntity.insurancerate) / 100).toFixed(2);
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
                        /*  if ('vdef4' == colDef.name) {
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
                          }*/
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
                    name: 'company.name', displayName: '收付款对象名称', width: 100, enableCellEdit: false


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
                    name: 'planDate',
                    displayName: '计划日期',
                    width: 100,
                    cellFilter: 'date:"yyyy-MM-dd"',
                    editableCellTemplate: 'ui-grid/refDate'
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
                                            && array[i].$$hashKey == rowEntity.$$hashKey && array[i].vdef4 == $scope.VO.insuranceman[j].vdef4 && array[i].vdef2 == $scope.VO.insuranceman[j].vdef2) {
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

        $scope.insuranceGLifeOptions = {
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
                    name: 'insured', displayName: '投保人员*', width: 100, enableCellEdit: $scope.isEdit, cellFilter: 'SELECT_INSURED'
                },
                {
                    name: 'insuredType', displayName: '投保险种*', width: 200, enableCellEdit: $scope.isEdit, cellFilter: 'SELECT_INSUREDTYPE'
                },

                {
                    name: 'InsuranceLiability', displayName: '保险责任', enableCellEdit: $scope.isEdit,
                },
                {
                    name: 'peopleAll', displayName: '人数*', enableCellEdit: $scope.isEdit
                },
                {
                    name: 'insuranceMoneyEveryone', displayName: '保险金额/人(元)', enableCellEdit: $scope.isEdit, cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'insuranceMoneyAll', displayName: '总保险金额(元)*', enableCellEdit: $scope.isEdit, cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'deductible', displayName: '免赔额(元)*', enableCellEdit: $scope.isEdit, cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'rate', displayName: '费率% *', enableCellEdit: $scope.isEdit
                },
                {
                    name: 'insurancePremiumEveryone', displayName: '保险费/人(元)', enableCellEdit: $scope.isEdit, cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'premiumAll', displayName: '总保费(元)*', enableCellEdit: $scope.isEdit, cellFilter: 'AMOUNT_FILTER'
                }
            ],
            data: $scope.VO.insuranceGLifeData,
            onRegisterApi: function (gridApi) {
                //添加行头
                gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
                $scope.insuranceGLifeOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if ((colDef.name == "insuranceMoneyEveryone" || colDef.name == "peopleAll") && null != rowEntity.peopleAll) {
                            rowEntity.insuranceMoneyAll = rowEntity.insuranceMoneyEveryone * rowEntity.peopleAll;
                        }
                        if ((colDef.name == "insuranceMoneyAll" || colDef.name == "peopleAll" || colDef.name == "rate" || colDef.name == "insuranceMoneyEveryone") && null != rowEntity.peopleAll && null != rowEntity.rate && null != rowEntity.insuranceMoneyAll) {
                            rowEntity.premiumAll = rowEntity.insuranceMoneyAll * rowEntity.rate / 1000;
                            rowEntity.insurancePremiumEveryone = rowEntity.premiumAll / rowEntity.peopleAll;
                        }
                        $scope.$apply();
                    });
                }
            }
        };


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
            columnDefs: [
                {
                    name: 'file_type', displayName: '附件类型', width: 100, enableCellEdit: true, cellFilter: 'SELECT_DOUCUMENTTYPE',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.DOUCUMENTTYPE
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


        //获取惠民保订单的json展开onEdit页面
        function getBenefitInsured() {
            let json = $rootScope.benefitInsuredData;
            if (json != null) {
                let benefitInsuredData = JSON.parse(json);
                if (benefitInsuredData) {
                    return benefitInsuredData;
                }
            }
            return null;
        }

        $scope.VO = getBenefitInsured();
        if ($scope.VO) {
            $scope.VO.benefitInsuredStatus = 1;
            $rootScope.funcode
            $scope.onAdd();
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
    $scope.table_name = "lr_insurancebill";
    $scope.billdef = "GLifeInsurance";
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
app.controller('insuranceinfoGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('insurancemanGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('partnerGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('paymentGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('assistantGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
