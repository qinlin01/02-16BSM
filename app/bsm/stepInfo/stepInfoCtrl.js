app.controller('stepInfoCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller) {

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
            projects: [],
            reportYear: moment().year(),
            reportQuarter: "",
            billstatus: 32,
        }
    };
    $scope.url = function () {
        return "bsm/stepInfo";
    };

    $scope.initView = function () {


        $scope.VO = $scope.initVO();

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

                {name: 'reportYear', displayName: '申报年度', width: 170},
                {name: 'reportQuarter', displayName: '申报季度', width: 170, cellFilter: 'SELECT_QUARTER'},
                {name: 'createdOrg.name', displayName: '业务单位', width: 100},
                {name: 'createdDept.name', displayName: '业务部门', width: 100},
                {name: 'createdUser.name', displayName: '经办人', width: 100},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},

            ];
        };

        $scope.projectsGrid = {
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
                    cellTemplate: '<div class="ui-grid-cell-contents text-center"><a href="#" class="btn btn-transparent btn-xs" ng-click="grid.appScope.onDeleteLine(\'projectsGrid\', row)"><i class="fa fa-times fa fa-white text-red"></i></a></div>'
                },
                {name: 'pkProjectApplay.code', displayName: '项目编号', width: 170, enableCellEdit: false},
                {name: 'pkProjectApplay.name', displayName: '项目名称', width: 280, enableCellEdit: false},
                // {name: 'examineDept.name', displayName: '专业审查部门', width: 150, enableCellEdit: false},
                // {name: 'customer', displayName: '客户名称', width: 280, enableCellEdit: false},
                // {name: 'projectCost', displayName: '项目费用（万元）', width: 135, enableCellEdit: false},
                // {name: 'income', displayName: '业务收入水平', width: 135, enableCellEdit: false},
                {
                    name: 'projectStatus', displayName: '开展阶段', width: 200, cellFilter: 'SELECT_PROJECT_STATUS',
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownValueLabel: 'name',
                    editDropdownIdLabel: 'id',
                    editDropdownOptionsArray: getSelectOptionData().PROJECT_STATUS, cellClass: 'lr-cell-green'
                },
                {
                    name: 'contractStatus',
                    displayName: '合同签订情况',
                    width: 135,
                    enableCellEdit: true,
                    cellClass: 'lr-cell-green', cellClass: 'lr-cell-green'
                },
                {
                    name: 'contractAmount',
                    displayName: '合同金额（元）',
                    width: 135,
                    enableCellEdit: true,
                    cellClass: 'lr-cell-green'
                },
                {name: 'payAmount', displayName: '已支付金额（元）', width: 135, enableCellEdit: true, cellClass: 'lr-cell-green'},
                {name: 'nextPlan', displayName: '下一步计划', width: 135, enableCellEdit: true, cellClass: 'lr-cell-green'},
                {
                    name: 'expectedResults',
                    displayName: '预计成果',
                    width: 135,
                    enableCellEdit: true,
                    cellClass: 'lr-cell-green'
                },
                {
                    name: 'doneInfo',
                    displayName: '预计年内是否完成并说明原因',
                    width: 280,
                    enableCellEdit: true,
                    cellClass: 'lr-cell-green'
                },
                {
                    name: 'changeInfo',
                    displayName: '是否进行预算调整',
                    width: 280,
                    enableCellEdit: true,
                    cellClass: 'lr-cell-green'
                },
                {name: 'storeInfo', displayName: '明年项目储备计划', width: 280, enableCellEdit: true},
            ],
            data: $scope.VO.projects,
            onRegisterApi: function (gridApi) {
                $scope.projectsGridApi = gridApi;
                $scope.projectsGrid.data = $scope.VO.projects;
                //添加行头
                $scope.projectsGridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };
    }
    $scope.initWatch = function () {
    };


    $scope.initButton = function () {


        $scope.onAdd = function () {

            $http.post($scope.basePath + $scope.url() + "/reportApplays").success(function (response) {
                if (response && response.code == 200) {
                    $scope.isGrid = false;
                    $scope.isCard = false;
                    $scope.isForm = true;
                    $scope.isForm = true;
                    $scope.initRefData();
                    $scope.VO = response.data;
                    $scope.VO.reportYear = moment().year();
                    // $scope.bindData($scope.VO);
                    $scope.projectsGrid.data = response.data.projects;
                    // angular.forEach(response.data, function (item, index) {
                    //     var project = {};
                    //     project.pkProjectApplay = {};
                    //     project.pkProjectApplay.pk = item.id;
                    //     project.pkProjectApplay.code = item.serialNumber;
                    //     project.pkProjectApplay.name = item.projectName;
                    //     project.examineDept = item.examineDept;
                    //
                    //     project.customer = item.customerName;
                    //     project.projectCost = item.projectCost;
                    //     project.income = item.planIncome;
                    //     $scope.VO.projects.push(project);
                    //     $scope.projectsGrid.data = $scope.VO.projects;
                    // });

                } else {
                    if (response) {
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                }
            });
        };

        $scope.checkDataBeforSave = function () {

            var msg = "";
            angular.forEach($scope.VO.projects, function (item, index) {
                if (item.projectStatus == null) {
                    msg = msg + "开展阶段、";
                }
                if (item.contractStatus == null) {

                    msg = msg + "合同签订情况、";
                }
                if (item.contractAmount == null) {

                    msg = msg + "合同金额、";
                }
                if (item.payAmount == null) {

                    msg = msg + "已支付金额、";
                }
                if (item.nextPlan == null) {

                    msg = msg + "下一步计划、";
                }
                if (item.expectedResults == null) {

                    msg = msg + "预计成果、";
                }
                if (item.doneInfo == null) {

                    msg = msg + "预计年内是否完成并说明原因、";
                }
                if (item.changeInfo == null) {
                    msg = msg + "是否进行预算调整、";
                }
            });

            if (msg.length != 0) {
                layer.alert("请输入一下信息：" + msg, {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
            return true;

        }
    };


    $scope.initView();
    $scope.initData();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.funcCode = "812";
    $scope.fromNav();
    $scope.onQuery();
});
