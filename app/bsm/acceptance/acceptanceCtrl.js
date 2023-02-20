app.controller('acceptanceCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, FileUploader, $controller) {

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
            dealAttachment: {
                report: [],//经营服务项目验收报告
                final: [], //经营服务项目费用决算表
                reviewSheet: [], //经营服务项目验收评审意见表
                reviewReport: [],//经营服务项目验收评审意见书
                achievement: [] //项目成果
            },
            accDate: null,
            pkProject: null,
        };
    };

    $scope.initFunction = function () {

        $scope.checkDataBeforSave = function () {
            if ($scope.VO.dealAttachment.length == 0) {
                layer.msg(response.msg, {icon: 2, time: 2000, shade: [0.5, '#000000', true]});
                return false;
            }
            if ($scope.VO.dealAttachment.report.length == 0) {

                layer.msg("请上传《经营服务项目验收报告》", {icon: 2, time: 2000, shade: [0.5, '#000000', true]});
                return false;
            }
            if ($scope.VO.dealAttachment.final.length == 0) {

                layer.msg("请上传《经营服务项目费用决算表》", {icon: 2, time: 2000, shade: [0.5, '#000000', true]});
                return false;
            }
            if ($scope.VO.dealAttachment.reviewSheet.length == 0) {

                layer.msg("请上传《经营服务项目验收评审意见表》", {icon: 2, time: 2000, shade: [0.5, '#000000', true]});
                return false;
            }
            if ($scope.VO.dealAttachment.reviewReport.length == 0) {

                layer.msg("请上传《经营服务项目验收评审意见书》", {icon: 2, time: 2000, shade: [0.5, '#000000', true]});
                return false;
            }
            if ($scope.VO.dealAttachment.achievement.length == 0) {

                layer.msg("请上传《项目成果》", {icon: 2, time: 2000, shade: [0.5, '#000000', true]});
                return false;
            }
            return true;
        }
        $scope.url = function () {
            return "bsm/acceptance";
        }

    };
    $scope.initWatch = function () {

        $scope.$watch('VO.pkProject.name', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if (!$scope.isForm) {
                return;
            }
            if (newVal != null) {

                $http.post($scope.basePath + $scope.url() + "/checkforAcc", {
                    projectId: $scope.VO.pkProject.pk
                }).success(function (response) {
                    if (response.code != 200) {
                        layer.closeAll('loading');
                        $scope.VO.pkProject = null;
                        layer.msg(response.msg, {icon: 2, time: 2000, shade: [0.5, '#000000', true]});
                    }
                });
            }

        }, true);
    }
    $scope.initView = function () {
        $scope.columnDefs = function () {
            return [
                {
                    name: 'isEnabled',
                    displayName: '操作',
                    width: 59,
                    enableColumnMenu: false,
                    cellFilter: 'enable',
                    pinnedLeft: true,
                    cellTemplate: '<div class="ui-grid-cell-contents text-center"><a  class="text-primary" ng-click="grid.appScope.onView(row.entity)"><i class="fa fa-file-text-o"></i>详情</a></div>'
                },
                {name: 'pkProject.name', displayName: '项目名称', width: 230,},
                {name: 'accDate', displayName: '验收日期', width: 170,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'createdUser.name', displayName: '经办人', width: 100,},
                {name: 'createdTime', displayName: '制单日期', width: 90, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'createdOrg.name', displayName: '业务单位', width: 100,},
                {name: 'createdDept.name', displayName: '业务部门', width: 120,},

            ]
        };
    }

    $scope.initData();
    $scope.initView();
    $scope.initPage();
    $scope.initFunction();
    $scope.initWatch();
    // $scope.onQuery();
    $scope.funcCode = "809";
    $scope.fromNav();
    $scope.onQuery();
});
