app.controller('frameworkApplyCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller, $sce) {

    $controller('baseController', {
        $rootScope: $rootScope,
        $scope: $scope,
        $http: $http,
        $sce: $sce,
        ngVerify: ngVerify,
        stateParams: $stateParams,
        ngDialog: ngDialog
    });

    $scope.funcCode = "810";

    $scope.initVO = function () {
        return {
            dealAttachmentB: [],
            partners: [],
        }
    };

    $scope.url = function () {
        return "bsm/frameworkApply";
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
                    cellTemplate: '<div class="ui-grid-cell-contents text-center"><a  class="text-primary" ng-click="grid.appScope.onView(row.entity)"><i class="fa fa-file-text-o"></i>详情</a></div>'
                },
                {name: 'projectName', displayName: '项目名称', width: 280},
                {name: 'createdOrg.name', displayName: '业务单位', width: 100},
                {name: 'createdDept.name', displayName: '业务部门', width: 100},
                {name: 'createdUser.name', displayName: '经办人', width: 100},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},

            ];
        };
        $scope.patnersGrid = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'partnerName', displayName: '服务商名称', width: 300, enableCellEdit: true
                },
                {
                    name: 'isEnabled',
                    displayName: '',
                    width: 50,
                    enableColumnMenu: false,
                    cellFilter: 'enable',
                    enableCellEdit: false,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" class="btn btn-transparent btn-xs" ng-click="grid.appScope.onDeleteLine(\'patnersGrid\', row)"><i class="fa fa-times fa fa-white"></i></a></div>'
                },
            ],
            data: $scope.VO.partners,
            onRegisterApi: function (gridApi) {
                $scope.patnersGrid.gridApi = gridApi;
                $scope.patnersGrid.data = $scope.VO.partners;
            }
        };
    };
    $scope.initWatch = function () {

        $scope.$watch('VO.pkProject', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if (!$scope.isForm) {
                return;
            }
            $http.post($scope.basePath + $scope.url() + "/partners", {projectId: $scope.VO.pkProject.pk}).success(function (response) {
                if (response.code == 200) {

                    if (response.data != null) {
                        angular.forEach(response.data, function (item, index) {
                            $scope.VO.partners.push(item);
                        });
                    }

                }
                layer.closeAll('loading');
            });

        }, true);
    };


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
                $scope.openPdf(response, "xxx.pdf");
            });
        }
        $scope.checkDataBeforSave = function () {
            // $scope.VO.memberEnterprise = $scope.memberEnterpriseGridOptions.data;
            if ($scope.VO.partners.length == 0) {
                layer.msg("请输入供应商名单。", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                return false;
            }
            return true;
        }
    };

    $scope.initRefData = function () {
        $scope.projectRefData = [];
        $http.post($scope.basePath + $scope.url() +"/queryFramworkProject").success(function (response) {
            layer.closeAll('loading');
            if (response && response.code == 200) {
                $scope.projectRefData = response.data;
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
    // if ($scope.openSrc != null) {
    //     $scope.onAdd();
    // } else {
    //     $scope.onQuery();
    // }
        $scope.onQuery();
});
