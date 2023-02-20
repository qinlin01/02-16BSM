
app.controller('projectChangeCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller) {

    $controller('baseController', {
        $rootScope: $rootScope,
        $scope: $scope,
        $http: $http,
        ngVerify: ngVerify,
        stateParams: $stateParams,
        ngDialog: ngDialog
    });

    $scope.initVO = function () {
        return {
            dealAttachmentB: [],
            data: {},
            projectRef: {},
        }
    };
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

    $scope.url = function () {
        return "bsm/projectChange";
    };

    $scope.initView = function () {
        $scope.VO = $scope.initVO();
        $scope.deptRefUrl = function () {
            return "deptdoc/queryForRef?params=1002";
        };

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
                {name: 'pkProjectApply.name', displayName: '原项目名称', width: 300},
                {name: 'changeType', displayName: '项目变更类型', width: 150, cellFilter: 'SELECT_CHANGE_TYPE'},
                {name: 'createdOrg.name', displayName: '业务单位', width: 100},
                {name: 'createdDept.name', displayName: '业务部门', width: 100},
                {name: 'createdUser.name', displayName: '经办人', width: 100},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},

            ];
        };
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
                    name: 'busi.name', displayName: '业务单位', width: 150, url: 'org/queryForRef'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'busi'
                },
                {
                    name: 'projectCost', displayName: '项目金额（万元）', width: 150, cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'projectStart',
                    displayName: '项目周期（开始）',
                    width: 150,
                    editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'projectEnd',
                    displayName: '项目周期（截止）',
                    width: 150,
                    editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'planIncome', displayName: '预计收入（万元）', width: 150, cellFilter: 'AMOUNT_FILTER'
                },
            ],
            data: $scope.VO.data.memberEnterprise,
            onRegisterApi: function (gridApi) {
                $scope.memberEnterpriseGridOptions.gridApi = gridApi;
                $scope.memberEnterpriseGridOptions.data = $scope.VO.data.memberEnterprise;
            }
        };
    };
    $scope.initWatch = function () {

        $scope.$watch('VO.data.customerName', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isForm) {
                $scope.projectName();
            }
        }, true);
        $scope.$watch('VO.data.serviceContent', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isForm) {
                $scope.projectName();
            }
        }, true);

        $scope.$watch('VO.data.projectCost', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isForm) {
                var ishead = $rootScope.orgVO.pk == "1002";
                // 如果是总部项目，需要判断50万
                if (ishead) {
                    if (newVal > 50) {
                        $scope.VO.data.projectClass = 1;
                    } else {
                        $scope.VO.data.projectClass = 0;
                    }
                } else {
                    // 如果是总部项目，需要判断20万
                    if (newVal > 20) {
                        $scope.VO.data.projectClass = 1;
                    } else {
                        $scope.VO.data.projectClass = 0;
                    }
                }
            }
        }, true);

        $scope.$watch('VO.changeType', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;

            if ($scope.VO.changeType == 1) {
                $scope.VO.data = {};
            } else {
                layer.load(2);
                $http.post($scope.basePath +  "bsm/projectApply/findOne", {pk: $scope.VO.pkProjectApply.pk}).success(function (response) {
                    if (response.code == 200) {
                        $scope.VO.data = response.data;
                        $scope.costDetail = response.data.costDetail;

                    }
                    layer.closeAll('loading');
                });
            }
        }, true);
        $scope.$watch('VO.pkProjectApply.name', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isForm) {
                $scope.VO.changeType = null;

            }
        }, true);

        $scope.$watch('costDetail[0].detail', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            // 框架合同不处理
            if ($scope.VO.data.projectType == 1 && $scope.VO.data.projectEpibolyType == 1) {
                return;
            }
            if ($scope.isForm) {
                var params = $scope.costDetail[0].detail;
                $scope.costDetail[0].cost = 0;
                angular.forEach(params, function (obj, index) {
                    if (params[index].months && params[index].param) {
                        $scope.costDetail[0].cost = $scope.costDetail[0].cost + params[index].months * params[index].param;
                    }
                });
            }
        }, true);

        $scope.$watch('costDetail', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            // 框架合同不处理
            if ($scope.VO.data.projectType == 1 && $scope.VO.data.projectEpibolyType == 1) {
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
                $scope.costDetail[5].cost = sumCost;
                $scope.VO.data.projectCost = sumCost;
            }
        }, true);

    };


    $scope.initFunction = function() {
        $scope.transferDate = function (value) {

            var date = new Date(value);
            return date;
        }
    }
    $scope.initButton = function () {


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

        $scope.projectName = function () {

            var content = $scope.VO.data.serviceContent;
            var customerName = $scope.VO.data.customerName;
            if (content == null) {
                content = '';
            }
            if (customerName == null) {
                customerName = '';
            }
            var projectTypeName = "服务外包项目";
            // if ($scope.VO.projectType == 0) {
            //     projectTypeName = customerName + '研究咨询项目';
            // }
            if ($rootScope.orgVO.pk == '1002') {
                $scope.VO.data.projectName = moment().year() + '年' + $rootScope.deptVO.name + customerName + content + projectTypeName;
            } else {
                $scope.VO.data.projectName = moment().year() + '年' + $rootScope.orgVO.name + customerName + content + projectTypeName;
            }
        };
        $scope.checkDataBeforSave = function () {
            $scope.VO.data.costDetail = $scope.costDetail;
            if ($scope.VO.projectType == 1) {
                if ($scope.VO.planIncome < $scope.VO.projectCost) {
                    layer.alert("项目收入不能低于项目金额。", {skin: 'layui-layer-lan', closeBtn: 1});
                    layer.closeAll('loading');
                    return false;
                }
            }

            return true;
        }


        /**
         * 因为开始结束时间需要被转换成日期类型，在这里重写findOne，为了实现加载数据正常
         *
         * @param pk
         */
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + $scope.url() + "/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == 200) {
                    var periodStart = response.data.data.periodStart;
                    var periodEnd = response.data.data.periodEnd;
                    response.data.data.periodStart = new Date(periodStart);
                    response.data.data.periodEnd= new Date(periodEnd);

                    $scope.bindData(response.data);
                } else {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
    };


    $scope.initData();
    $scope.initView();
    $scope.initWatch();
    $scope.initButton();
    $scope.funcCode = "805";
    $scope.initPage();
    $scope.fromNav();
    $scope.onQuery();
});
