app.controller('projectReviewCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller) {

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
            dealAttachmentB: {sheet: [], bill: [], list: [], report: []}
        }
    };
    $scope.url = function () {
        return "bsm/projectReview";
    };

    $scope.initView = function () {
        $scope.deptRefUrl = function () {
            return "deptdoc/queryForRef?params=1002";
        };
        $scope.VO = $scope.initVO();

    }
    $scope.initWatch = function () {
        $scope.$watch('VO.serviceContent', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isForm) {
                $scope.projectName();
            }
        }, true);

        $scope.$watch('VO.projectCost', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isForm) {
                if (newVal > 20) {
                    $scope.VO.projectClass = 1;
                } else {
                    $scope.VO.projectClass = 0;
                }
            }
        }, true);
    };


    $scope.initButton = function () {
        $scope.onReview = function () {

            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) {
                return layer.msg("请选择一条数据进行操作!", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
            }

            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: getURL('bsm/projectReview/dialog/replyDialog.html'),
                className: 'ngdialog-theme-plain',
                width: 750,
                height: 900,
                scope: $scope
            }).then(function (value) {
                console.log('Modal promise resolved. Value: ', value);
                layer.load(2);
                $http.post($scope.basePath + $scope.url() + "/review", {
                    data: angular.toJson($scope.VO),
                    opinion: value.opinion
                }).success(function (response) {
                    if (response.code == -1) {
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    layer.closeAll('loading');
                    $scope.onQuery();
                })
            }, function (reason) {
                console.log('do nothing. Reason: ', reason);
            });
        };

        /**
         * 查询数据
         * @param pk
         */
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $scope.projectStatus = -1;
            $http.post($scope.basePath + $scope.url() + "/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == 200) {
                    $http.post($scope.basePath + $scope.url() + "/queryProjectStatus", {id: response.data.pkProjectApply}).success(function (res) {
                        $scope.projectStatus = res.data;
                    });
                    $scope.bindData(response.data);
                } else {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
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
            {name: 'projectApplyRefVO.serialNumber', displayName: '项目编号', width: 170},
            {name: 'projectApplyRefVO.projectName', displayName: '项目名称', width: 280},
            {name: 'projectApplyRefVO.projectType', displayName: '项目类型', width: 100, cellFilter: 'SELECT_PROJECT_TYPE'},
            // {name: 'serviceContent', displayName: '服务内容', width: 100},
            // {name: 'customerName', displayName: '客户名称', width: 100},
            {name: 'projectApplyRefVO.projectCost', displayName: '项目费用（万元）', width: 135},
            {
                name: 'projectApplyRefVO.projectClass',
                displayName: '项目分类（规模）',
                width: 135,
                cellFilter: 'SELECT_PROJECT_CLASS'
            },
            {name: 'projectApplyRefVO.projectManger', displayName: '项目负责人', width: 135},
            {name: 'projectApplyRefVO.period', displayName: '项目周期', width: 135},
            {name: 'projectApplyRefVO.examineDept.name', displayName: '专业审查部门', width: 150},
            {name: 'createdOrg.name', displayName: '业务单位', width: 100},
            {name: 'createdDept.name', displayName: '业务部门', width: 100},
            {name: 'createdUser.name', displayName: '经办人', width: 100},
            {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},

        ];
    };

    $scope.initView();
//薪酬
    $scope.initData();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.funcCode = "803";
    $scope.onQuery();
});
