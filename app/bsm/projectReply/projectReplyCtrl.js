app.controller('projectReplyCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller) {

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
            dealAttachmentB: {decision: [], reply: []},
            applys: []
        }
    };
    $scope.url = function () {
        return "bsm/projectReply";
    };

    $scope.initView = function () {
        $scope.deptRefUrl = function () {
            return "deptdoc/queryForRef?params=1002";
        };
        $scope.VO = $scope.initVO();

    }
    $scope.initWatch = function () {

    };


    $scope.onAdd = function () {
        $scope.isGrid = false;
        $scope.isCard = false;
        $scope.isForm = true;
        $scope.isForm = true;
        $scope.initRefData();
        $http.post($scope.basePath + $scope.url() + "/serialNo").success(function (response) {
            if (response.code = 200) {
                $scope.VO.approvalCode = response.data;
            }
        });

        $scope.bindData($scope.initVO());
        $scope.applysGridOptions.data = [];
    };

    $scope.initButton = function () {

        $scope.onAddProjectInfo = function () {

            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: getURL('bsm/projectReply/dialog/projectDialog.html'),
                className: 'ngdialog-theme-plain',
                width: 750,
                height: 500,
                scope: $scope,
                closeByDocument: false,
            }).then(function (value) {
                for (let i = 0; i < value.length; i++) {
                    var detail = {projectApplyRefVO: {}};
                    detail.projectApplyRefVO = value[i];
                    detail.replyCost = value[i].projectCost;
                    $scope.VO.applys.push(detail);
                    $scope.applysGridOptions.data = $scope.VO.applys;
                }
            }, function (reason) {
            });
        };

        $scope.checkDataBeforSave = function () {

            if ($scope.VO.dealAttachmentB.decisionlength == 0) {
                layer.alert("请上传项目的批复文件。", {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
            if ($scope.VO.dealAttachmentB.reply == 0) {
                layer.alert("请上传项目的决策文件。", {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
            if ($scope.VO.applys.length == 0) {
                layer.alert("请选择需要批复的项目信息。", {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
            return true;
        }
    };


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
                {name: 'approvalCode', displayName: '批复编号', width: 150},
                {name: 'approvalDate', displayName: '批复日期', width: 100},
                {name: 'projectNames', displayName: '项目名称', width: 250},
                {name: 'createdOrg.name', displayName: '业务单位', width: 100},
                {name: 'createdDept.name', displayName: '业务部门', width: 100},
                {name: 'createdUser.name', displayName: '经办人', width: 100},

            ];
        };

        $scope.applysGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {name: 'projectApplyRefVO.serialNumber', displayName: '项目编号', width: 170},
                {name: 'projectApplyRefVO.projectName', displayName: '项目名称', width: 150, enableCellEdit: false},
                {
                    name: 'projectApplyRefVO.projectType',
                    displayName: '项目类型',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'SELECT_PROJECT_TYPE'
                },
                {name: 'projectApplyRefVO.projectCost', displayName: '项目费用（万元）', width: 100, enableCellEdit: false},
                {
                    name: 'projectApplyRefVO.projectClass',
                    displayName: '项目分类（规模）',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'SELECT_PROJECT_CLASS'
                },
                {name: 'projectApplyRefVO.projectManger', displayName: '项目负责人', width: 100, enableCellEdit: false},
                {name: 'projectApplyRefVO.period', displayName: '项目周期', width: 100, enableCellEdit: false},
                {name: 'projectApplyRefVO.examineDept.name', displayName: '专业审查部门', width: 100, enableCellEdit: false},
                {name: 'replyCost', displayName: '批复金额', width: 100, enableCellEdit: true, cellClass: 'text-red'},

                {
                    name: 'applyType',
                    displayName: '申报类型',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_APPLY_TYPE',
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownValueLabel: 'name',
                    editDropdownIdLabel: 'id',
                    editDropdownOptionsArray: getSelectOptionData().APPLY_TYPE,
                    cellClass: 'text-red'
                },
                {
                    name: 'isEnabled',
                    displayName: '',
                    width: 50,
                    enableColumnMenu: false,
                    cellFilter: 'enable',
                    enableCellEdit: false,
                    cellTemplate: '<div class="ui-grid-cell-contents text-center"><a href="#" class="btn btn-transparent btn-xs" ng-click="grid.appScope.onDeleteLine(\'applysGridOptions\', row)"><i class="fa fa-times fa fa-white text-red"></i></a></div>'
                },
            ],
            data: $scope.VO.applys,
            onRegisterApi: function (gridApi) {
                $scope.applysGridApi = gridApi;

                //添加行头
                $scope.applysGridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };
    }
    $scope.initData();
    $scope.initView();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.funcCode = "804";
    $scope.onQuery();
});
