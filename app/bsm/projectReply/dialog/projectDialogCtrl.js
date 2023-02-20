app.controller('ProjectDialogCtrl',
    function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog,  $controller) {

        $scope.queryData = {};
        $scope.selectProjectInfos = [];
        $scope.initView = function () {

            $scope.projectInfoGridOptions = {
                enableRowSelection: true,
                enableSelectAll: true,
                enableFullRowSelection: true,//是否点击cell后 row selected
                enableRowHeaderSelection: true,
                multiSelect: true,//多选
                useExternalPagination: true,
                columnDefs: [
                    {name: 'projectName', displayName: '项目名称', width: 150},
                    {
                        name: 'projectType',
                        displayName: '项目类型',
                        width: 100,
                        cellFilter: 'SELECT_PROJECT_TYPE'
                    },
                    {name: 'projectCost', displayName: '项目费用（万元）', width: 100},
                    {
                        name: 'projectClass',
                        displayName: '项目分类（规模）',
                        width: 100,
                        cellFilter: 'SELECT_PROJECT_CLASS'
                    },
                    {name: 'projectManger', displayName: '项目负责人', width: 100},
                    {name: 'period', displayName: '项目周期', width: 100},
                    {name: 'examineDept.name', displayName: '专业审查部门', width: 100},
                ]
            };
            $scope.projectInfoGridOptions.onRegisterApi = function (gridApi) {
                //set gridApi on scope
                $scope.gridApi = gridApi;

                //添加行头
                $scope.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
            };
        };

        $scope.initFunction = function(){

            $scope.onRefQuery = function () {

                layer.load(2);
                $http.post($scope.basePath + "bsm/projectApply/projectReply", {
                    status:3,
                    params: angular.toJson($scope.queryData)
                }).success(function (response) {
                    if (response.code == 200) {
                        $scope.projectInfoGridOptions.data = response.data;
                        layer.closeAll('loading');
                    } else {
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        layer.closeAll('loading');
                    }
                });
            };

            $scope.onCheck = function () {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows) {
                    return layer.alert("请选择一条数据进行修改!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                    return false;
                }

                $scope.selectProjectInfos = rows;
                return true;
            }
        }
        $scope.initView();
        $scope.initFunction();
        $scope.onRefQuery();
    }
)