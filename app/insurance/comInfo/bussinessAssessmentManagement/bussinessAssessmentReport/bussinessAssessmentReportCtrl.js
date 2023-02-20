/**
 * Create By zhangwj
 * Create Time 2021-11-16
 */
app.controller('bussinessAssessmentReportCtrl', function ($rootScope, $scope, $sce, $http, $state, $window, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $location) {
    $scope.initData = function () {
        //列表界面年度选择框
        $scope.gridYear = [];
        $scope.getAllYear = function(){
            layer.load(2);
            $http.post($scope.basePath + "assessmentManagement/getAllYear").success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == 200) {
                    for (let i = 0; i < response.data.length; i++) {
                        $scope.gridYear[i] = {"id":response.data[i],"name":response.data[i]};
                    }
                }
            });
        }
        $scope.getAllYear();
        // $scope.selectYear = new Date().format("yyyy");
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "selectYear": new Date().format("yyyy"),
            }
        };
        $scope.QUERY = $scope.initQUERY();
    };


    $scope.initHttp = function () {
        $scope.getBussinessAssessmentReport = function(){
            layer.load(2);
            $http.post($scope.basePath + "assessmentManagement/getBussinessAssessmentReport", {year:$scope.QUERY.selectYear}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == 200) {
                    $scope.bussinessAssessmentReportGridOptions.data = response.data;
                }
            });
        }
    };

    $scope.initFunction = function () {

    };

    $scope.initWatch = function () {

    };

    $scope.initButton = function () {
        $scope.exportData = function (grid){
            var uiGridExporterService = $scope[grid].gridApi.exporter;
            uiGridExporterService.csvExport("all","all");
        }
    };

    $scope.initPage = function () {
        $scope.isGrid = true;
        //业务单位年度考核报表
        $scope.bussinessAssessmentReportGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '业务单位年度考核报表.csv',
            columnDefs: [
                {name: 'orgName', displayName: '业务单位名称'},
                {name: 'deptName', displayName: '部门名称'},
                {name: 'premiums', displayName: '应收保费总金额（元）'},
                {name: 'premiumsCompletion', displayName: '应收保费完成率（％）'},
                {name: 'planMoney', displayName: '应开票总金额（元）'},
                {name: 'planMoneyCompletion', displayName: '应开票金额完成率（％）'},
                {name: 'factMoney', displayName: '已开票总金额（元）'},
                {name: 'factMoneyCompletion', displayName: '已开票金额完成率（％）'},
            ],
            data: [],
        };
        $scope.bussinessAssessmentReportGridOptions.onRegisterApi = function (gridApi) {
            $scope.bussinessAssessmentReportGridOptions.gridApi = gridApi;
        }
    };

    $scope.funCode = '40402';
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope, $rootScope);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);
})
;