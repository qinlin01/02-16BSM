app.controller('projectApplyCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller, $sce) {

    $controller('baseController', {
        $rootScope: $rootScope,
        $scope: $scope,
        $http: $http,
        $sce: $sce,
        ngVerify: ngVerify,
        stateParams: $stateParams,
        ngDialog: ngDialog
    });

    $scope.funcCode = "801";
    // 不知道为什么在VO中定义这个结构体不能被前台绑定，所以把该参数抽取出来，在保存的时候给VO赋值
    $scope.initCostDetail = function () {
        return [
            {
                cost: 0,
                detail: [{param: 0, months: 0}, {param: 0, months: 0}, {param: 0, months: 0}, {param: 0, months: 0},],
                memo: ""
            },
            {cost: 0, detail: [], memo: ""},
            {cost: 0, detail: [], memo: ""},
            {cost: 0, detail: [], memo: ""},
            {cost: 0, detail: [], memo: ""},
            {cost: 0, detail: [], memo: ""}];
    };

    $scope.initVO = function () {
        return {
            dealAttachmentB: [],
            memberEnterprise: [],
            costDetail: [],
            ifPlanIncome: 0,
            customerName: '',
            serviceContent: '',
            unitAccount: 0,
            planIncome: null
        }
    };

    $scope.beforEdit = function () {

        $scope.initForm();
        $scope.costDetail = $scope.VO.costDetail;
    }
    $scope.url = function () {
        return "bsm/projectApply";
    };

    $scope.initForm = function () {
        $scope.memberEnterpriseGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'isEnabled',
                    displayName: '',
                    width: 50,
                    enableColumnMenu: false,
                    cellFilter: 'enable',
                    enableCellEdit: false,
                    cellTemplate: '<div class="ui-grid-cell-contents text-center"><a href="#" class="btn btn-transparent btn-xs" ng-click="grid.appScope.onDeleteLine(\'clearingBGridOptions\', row)"><i class="fa fa-times fa fa-white text-red"></i></a></div>'
                },
                {
                    name: 'busi.name', displayName: '业务单位', width: 150, url: 'sys/org/queryForRef'
                    , placeholder: '请选择业务单位', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'busi'
                },
                {
                    name: 'projectCost', displayName: '项目金额（万元）', width: 150, cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'period',
                    displayName: '项目周期',
                    width: 150,
                },
                {
                    name: 'planIncome', displayName: '预计收入（万元）', width: 150, cellFilter: 'AMOUNT_FILTER'
                },
            ],
            data: $scope.VO.memberEnterprise,
            // onRegisterApi: function (gridApi) {
            //     $scope.memberEnterpriseGridOptions.gridApi = gridApi;
            // }
        };
    }
    $scope.initView = function () {

        $scope.columnDefs = function () {
            return [
                {
                    name: 'opreation',
                    displayName: '操作',
                    width: 59,
                    enableColumnMenu: false,
                    cellFilter: 'enable',
                    pinnedLeft: true,
                    // cellTemplate:'<a href="#" ><span class="title label-primary">详情</span></a>'
                    cellTemplate: '<div class="ui-grid-cell-contents text-center"><a  class="text-primary" ng-click="grid.appScope.onView(row.entity)"><i class="fa fa-file-text-o"></i>详情</a></div>'
                },
                {name: 'serialNumber', displayName: '项目编号', width: 200},
                {name: 'projectName', displayName: '项目名称', width: 280},
                {name: 'projectType', displayName: '项目类型', width: 100, cellFilter: 'SELECT_PROJECT_TYPE'},
                {name: 'projectCost', displayName: '项目费用（万元）', width: 120},
                {name: 'projectClass', displayName: '项目分类（规模）', width: 120, cellFilter: 'SELECT_PROJECT_CLASS'},
                {name: 'projectManger', displayName: '项目负责人', width: 100},
                {name: 'period', displayName: '项目周期', width: 120},
                {name: 'examineDept.name', displayName: '专业审查部门', width: 130},
                {name: 'projectYears', displayName: '申报年月', width: 100},
                {name: 'createdOrg.name', displayName: '业务单位', width: 100},
                {name: 'createdDept.name', displayName: '业务部门', width: 100},
                {name: 'createdUser.name', displayName: '经办人', width: 100},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'examinesCheck.checker.name', displayName: '专业审查驳回人', width: 100},
                {name: 'examinesCheck.msg', displayName: '专业审查驳回意见', width: 100},

            ];
        };
    };
    $scope.initWatch = function () {
        $scope.$watch('VO.customerName', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isForm) {
                $scope.projectName();
            }
        }, true);
        $scope.$watch('VO.serviceContent', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isForm) {
                $scope.projectName();
            }
        }, true);

        $scope.$watch('VO.projectCost', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isForm) {
                var ishead = $rootScope.orgVO.pk == "1002";
                if ($scope.VO.projectType == 1 && ($scope.VO.projectEpibolyType == null || $scope.VO.projectEpibolyType == 1)) {
                    return;
                }
                // 如果是总部项目，需要判断50万
                // if (ishead) {
                    if ($scope.VO.projectCost > 50) {
                        $scope.VO.projectClass = 1;
                    } else {
                        $scope.VO.projectClass = 0;
                    }
                // } else {
                //     // 如果是总部项目，需要判断20万
                //     if ($scope.VO.projectCost > 20) {
                //         $scope.VO.projectClass = 1;
                //     } else {
                //         $scope.VO.projectClass = 0;
                //     }
                // }
            }
        }, true);

        $scope.$watch('costDetail[0].detail', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            // 框架合同不处理
            if ($scope.VO.projectType == 1 && $scope.VO.projectEpibolyType == 1) {
                return;
            }
            if ($scope.isForm) {
                var params = $scope.costDetail[0].detail;
                $scope.costDetail[0].cost = 0;
                angular.forEach(params, function (obj, index) {
                    if (params[index].months && params[index].param) {
                        $scope.costDetail[0].cost += params[index].months * params[index].param;
                    }
                });
            }
        }, true);

        $scope.$watch('costDetail', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            // 框架合同不处理
            if ($scope.VO.projectType == 1 && $scope.VO.projectEpibolyType == 1) {
                return;
            }
            if ($scope.isForm) {
                var sumCost = 0;
                var params = $scope.costDetail;
                angular.forEach(params, function (obj, index) {
                    // 最后一行是合计行，少循环一次
                    if (index != 5) {
                        sumCost = sumCost + $scope.costDetail[index].cost;
                    }
                });
                $scope.costDetail[5].cost = parseFloat(sumCost.toFixed(4));
                $scope.VO.projectCost = parseFloat(sumCost.toFixed(4));
            }
        }, true);

        $scope.$watch('VO.memberEnterprise', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;

            if ($scope.isForm) {
                // 框架合同不处理
                if ($scope.VO.memberEnterprise.length == 0) {
                    return;
                }
                var members = $scope.VO.memberEnterprise;
                var projectCost = 0;
                var planIncome = 0;
                angular.forEach(members, function (obj, index) {
                    if (members[index].projectCost) {
                        projectCost += parseFloat(members[index].projectCost);
                    }
                    if (members[index].planIncome) {
                        planIncome += parseFloat(members[index].planIncome);
                    }

                    if (members[index].planIncome < members[index].projectCost) {
                        members[index].tags = "项目收入低于项目金额";
                    }
                });
                $scope.VO.projectCost = projectCost;
                $scope.VO.planIncome = planIncome;
                $scope.VO.ifPlanIncome = 1;
            }
        }, true);

    };


    $scope.initButton = function () {
        $scope.projectName = function () {

            var content = $scope.VO.serviceContent;
            var customerName = $scope.VO.customerName;
            if (content == null) {
                content = '';
            }
            if (customerName == null) {
                customerName = '';
            }
            var projectTypeName = "服务外包项目";
            if ($scope.VO.projectType == 0) {
                projectTypeName = customerName + '研究咨询项目';
            }
            var projectYear = moment().year();
            // 如果是10月份以后申报的项目，项目名称显示次年的年
            if (moment().month() >= 9) {
                projectYear = projectYear + 1;
            }
            if ($rootScope.orgVO.pk == '1002') {
                $scope.VO.projectName = projectYear + '年' + $scope.deptShortName + customerName + content + projectTypeName;
            } else {
                $scope.VO.projectName = projectYear + '年' + $scope.orgVO.name + customerName + content + projectTypeName;
            }
        };


        $scope.onProjectApplyList = function () {

            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert('请至少选择一行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
                ids.push(rows[i].id);
            }

            $http.post($scope.basePath + $scope.url() + "/projectApplyList", {data: angular.toJson(ids)}, {responseType: 'arraybuffer'}).success(function (data, status, headers) {
                layer.closeAll('loading');
                headers = headers();
                var contentType = headers['content-type'];
                var linkElement = document.createElement('a');
                    var blob = new Blob([data], {type: contentType});
                    var url = window.URL.createObjectURL(blob);
                    linkElement.setAttribute('href', url);
                    linkElement.setAttribute("download", "申报清单.xls");
                    var clickEvent = new MouseEvent("click", {
                        "view": window,
                        "bubbles": true,
                        "cancelable": false
                    });
                    linkElement.dispatchEvent(clickEvent);
            });
        }
        $scope.onPrintBill = function () {

            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert('请至少选择一行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $http.post($scope.basePath + $scope.url() + "/printBill", {id: rows[0].id}).success(function (response) {
                layer.closeAll('loading');
                $scope.openPdf(response);
            });
        }
        $scope.onAddGeneral = function () {

            $scope.onAdd();
            $scope.VO.projectType = 1;
            $scope.VO.projectEpibolyType = 0;
            $http.post($scope.basePath + "sys/deptdoc/findOne", {pkDeptdoc: $rootScope.deptVO.pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == 200) {
                    $scope.deptShortName = response.data.def2;
                    $scope.projectName();
                }
            });
            $scope.costDetail = $scope.initCostDetail();
            $scope.bindData($scope.VO);
        }

        $scope.onAddFramework = function () {

            $scope.isGrid = false;
            $scope.isCard = false;
            $scope.isForm = true;
            $scope.isForm = true;
            $scope.VO = $scope.initVO();
            $scope.VO.projectType = 1;
            $scope.VO.projectEpibolyType = 1;
            $scope.VO.projectClass = 1;
            $scope.costDetail = $scope.initCostDetail();
            $http.post($scope.basePath + "sys/deptdoc/findOne", {pkDeptdoc: $rootScope.deptVO.pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == 200) {
                    $scope.deptShortName = response.data.def2;
                    $scope.projectName();
                }
            });


            $scope.initRefData();
            $scope.bindData($scope.VO);

        }

        $scope.onAddMain = function () {


            $scope.onAdd();
            $scope.VO.projectType = 1;
            $scope.VO.projectEpibolyType = 2;
            $scope.costDetail = $scope.initCostDetail();
            $http.post($scope.basePath + "sys/deptdoc/findOne", {pkDeptdoc: $rootScope.deptVO.pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == 200) {
                    $scope.deptShortName = response.data.def2;
                    $scope.projectName();
                }
            });

            $scope.bindData($scope.VO);
            $scope.initForm();
            var busi = {busi: $rootScope.orgVO, projectCost: 0, period: "", planIncome: 0};
            $scope.memberEnterpriseGridOptions.data.push(busi);
        }

        $scope.onAddFrameworkApply = function () {
            // var rows = $scope.gridApi.selection.getSelectedRows();
            // if (!rows || rows.length != 1) {
            //     return layer.alert("请选择一条数据进行操作!", {skin: 'layui-layer-lan', closeBtn: 1});
            // }
            $scope.openSrc = 'confirm';
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: getURL('bsm/frameworkApply/frameworkApply.html'),
                className: 'ngdialog-theme-plain',
                width: 800,
                height: 1000,
                scope: $scope,
                closeByDocument: false,
            }).then(function (value) {
                console.log('点击确认按钮. Value: ', value);
            }, function (reason) {
                console.log('非正常关闭. Reason: ', reason);
            });
        }
        $scope.onAddConsult = function () {

            $scope.onAdd();
            $scope.VO.projectType = 0;
            $http.post($scope.basePath + "sys/deptdoc/findOne", {pkDeptdoc: $rootScope.deptVO.pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == 200) {
                    $scope.deptShortName = response.data.def2;
                    $scope.projectName();
                }
            });
            $scope.costDetail = $scope.initCostDetail();
            $scope.bindData($scope.VO);
        }
        $scope.checkDataBeforSave = function () {
            if (!($scope.VO.projectType == 1 && ($scope.VO.projectEpibolyType == 1 || $scope.VO.projectEpibolyType == 2))) {

                var costSum = 0;
                for (let i = 0; i < $scope.costDetail.length; i++) {
                    let detail = $scope.costDetail[i];
                    if (detail.cost == null) {
                        costSum = 0;
                    }
                    costSum = costSum + detail.cost;
                }
                // 如果明细表都是零就提示不能通过
                if (costSum == 0) {
                    layer.msg("费用估算表中信息不完整，请检查是否正确!", {
                        icon: 2,
                        time: 2000,
                        shade: [0.5, '#000', true]
                    });
                    return false;
                }
            }

            $scope.VO.costDetail = $scope.costDetail;
            // 框架项目项目不参与该字段的判断
            if ($scope.VO.planIncome != null && $scope.VO.planIncome < $scope.VO.projectCost) {
                $scope.VO.tags = "项目收入低于项目金额";
                // layer.msg("项目收入不能低于项目金额。", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                layer.closeAll('loading');
            } else {
                $scope.VO.tags = "";
            }
            if ($scope.VO.projectEpibolyType == 2) {
                var members = $scope.VO.memberEnterprise;
                if (members.length == 0) {
                    layer.closeAll('loading');
                    layer.msg("项目成员单位不能为空。", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                    return false;
                }
                angular.forEach(members, function (obj, index) {
                    if (members[index].planIncome < members[index].projectCost) {
                        members[index].tags = "项目收入低于项目金额";
                    } else {
                        members[index].tags = "";
                    }
                });
            }
            if ($scope.VO.projectEpibolyType == 2 && $scope.VO.dealAttachmentB.length == 0) {
                layer.msg("主项目必须上传各单位的费用估算表!", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                layer.closeAll('loading');
                return false;
            }
            return true;
        }

        /**
         * 保存判断必输项
         */
        $scope.onSave = function () {
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    for (let i = 0; i < errEls.length; i++) {
                        var item = errEls[i];
                        console.log(item);
                    }
                    return layer.msg("请检查标记的输入项的正确性。", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                }
                if ($scope.checkDataBeforSave()) {
                    if ($scope.VO.planIncome != null && $scope.VO.planIncome < $scope.VO.projectCost) {
                        layer.confirm('<span class="text-red text-bold">项目收入低于项目金额,是否需要继续保存？</span>', {
                                btn: ['确认', '取消'], //按钮
                                btn1: function () {
                                    $scope.saveVO();
                                },
                                btn2: function (index, layero) {
                                    layer.msg('取消保存!', {shift: 6, icon: 11});
                                },
                                shade: 0.6,//遮罩透明度
                                shadeClose: true,//点击遮罩关闭层
                                title: '提示'
                            }
                        );
                    } else {
                        $scope.saveVO();
                    }
                }
            });
        };

        $scope.openHelp = function (key) {
            if (key == 'projectName') {
                if ($scope.VO.projectType == 0) {
                    return layer.tips('项目名称生成规则：xx(单位/部门)+项目事由+研究咨询项目', '#' + key, {tips: 1})
                } else {
                    return layer.tips('项目名称生成规则：xx(单位/部门)+客户+服务内容+研究咨询项目', '#' + key, {tips: 1})
                }
            } else if (key == 'serviceContent') {
                return layer.tips('用于生成项目名称', '#' + key, {tips: 1})

            } else if (key == 'customerName') {
                return layer.tips('用于生成项目名称', '#' + key, {tips: 1})

            }
        }


        $scope.onSubmit = function () {
            var id;
            var examinie;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1)
                    return layer.msg("请选择一条单据进行提交!", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                id = rows[0].id;
                examinie = rows[0].examinesCheck
            } else {
                id = $scope.VO.id;
                examinie = $scope.VO.examinesCheck
            }
            if (!id) {
                return layer.msg('当前数据没有保存，请保存之后进行此操作！', {
                    icon: 2,
                    time: 2000,
                    shade: [0.5, '#000', true]
                });
            }
            layer.load(2);
            if (examinie != null) {
                $http.post($scope.basePath + $scope.url() + "/submitExamine", {id: id}).success(function (response) {
                    layer.closeAll('loading');
                    if (response && response.code == 200) {
                        return layer.msg('单据提交成功。', {icon: 1});
                    }
                });
            } else {
                $scope.queryFlowInfoForAudit(id, function (response) {
                    $scope.submitData = response.data.sort(function (a, b) {
                        if (a.order == null) {
                            a.order = 99;
                        }
                        if (b.order == null) {
                            b.order = 99;
                        }
                        return parseFloat(a.order) - parseFloat(b.order);
                    });
                    ;
                    ngDialog.openConfirm({
                        showClose: true,
                        closeByDocument: false,
                        template: getURL('common/workflow/submitDialog.html'),
                        className: 'ngdialog-theme-plain',
                        width: 700,
                        height: 450,
                        controller: 'submitDialogCtrl',
                        scope: $scope
                    }).then(function (value) {
                        layer.load(2);
                        $scope.submit(value);
                    }, function (reason) {
                        if (reason && reason != '$closeButton') {

                        }
                    });
                });
            }
            ;
        }

    };

    $scope.initRefData = function () {
        $scope.deptDocData = [];
        $http.post($scope.basePath + "sys/deptdoc/queryForRef?params=1002").success(function (response) {
            layer.closeAll('loading');
            if (response && response.code == 200) {
                $scope.deptDocData = response.data;
            }
        });
    };


    layer.load(2);
    $scope.initData();
    $scope.initView();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.fromNav();
    $scope.onQuery();
});
