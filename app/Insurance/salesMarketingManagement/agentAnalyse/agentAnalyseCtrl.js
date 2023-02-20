/**
 * Created by 25152 on 2017/11/20.
 */
app.controller('agentAnalyseCtrl', function ($rootScope, $scope, $sce, $http, $state, $window, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $location) {
    $scope.initData = function () {
        $scope.initQuery = function (){
            return {
                businessYear : parseInt(new Date().format("yyyy"))
            };
        }
        //分公司详细数据
        $scope.orgData = {};
        //展示统计分析还是展示指定分公司人员
        $scope.ifAgentAnalyse = true;
        //代理制业务查询年度
        $scope.query = $scope.initQuery();
    };

    $scope.initHttp = function () {

        //代理制人员统计分析查询
        $scope.queryAgentAnalyse = function () {
            layer.load(2);
            $http.post($scope.basePath + "agentAnalyse/queryAgentAnalyse").success(function (response) {
                if (response.code == 200) {
                    $scope.agentAnalyseGridOptions.data = response.data;
                }
                layer.closeAll('loading');
            });
        };

        //代理制人员统计分析查询
        $scope.queryAgentAnalyseByOrgName = function (orgName) {
            if(orgName==null || orgName=='' || orgName == '汇总'){
                return;
            }
            layer.load(2);
            $http.post($scope.basePath + "agentAnalyse/queryAgentAnalyseByOrgName",{orgName:orgName}).success(function (response) {
                if (response.code == 200) {
                    $scope.orgData = response.data;
                    $scope.changeChild('all');
                    $scope.ifAgentAnalyse = false;
                }
                layer.closeAll('loading');
            });
        };

        //代理制业务统计分析查询
        $scope.queryAgentBusinessAnalyse = function (year) {
            if(year==null || year==''){
                return;
            }
            layer.load(2);
            $http.post($scope.basePath + "agentAnalyse/queryAgentBusinessAnalyse",{year:year}).success(function (response) {
                if (response.code == 200) {
                    $scope.agentBusinessAnalyseGridOptions.data = response.data;
                }
                layer.closeAll('loading');
            });
        };
    };

    $scope.initFunction = function () {
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
    };

    $scope.initWatch = function () {
        $scope.$watch('query', function (newVal, oldVal) {
            if(newVal.businessYear == null || newVal.businessYear == '' || newVal.businessYear.length !=4){
                return;
            }else{
                $scope.queryAgentBusinessAnalyse(newVal.businessYear);
            }
        }, true);
    };

    $scope.initButton = function () {

        $scope.exportData = function (grid){
            var uiGridExporterService = $scope[grid].gridApi.exporter;
            uiGridExporterService.csvExport("all","all");
        }

        $scope.changeChild = function (type){

            $scope.childType = type;

            if(type ==  'all' && $scope.orgData.all && $scope.orgData.all!=null && $scope.orgData.all.length > 0){
                $scope.initTablePage($scope.orgData.all);
                return;
            }
            if(type ==  'add' && $scope.orgData.add && $scope.orgData.add!=null && $scope.orgData.add.length > 0){
                $scope.initTablePage($scope.orgData.add);
                return;
            }
            if(type ==  'out' && $scope.orgData.out && $scope.orgData.out!=null && $scope.orgData.out.length > 0){
                $scope.initTablePage($scope.orgData.out);
                return;
            }
            $scope.initTablePage(new Array());
        }

        $scope.backToMain = function(){
            $scope.ifAgentAnalyse = true;
            $scope.orgData = {};
        }
    };

    $scope.initPage = function () {
        //列表界面
        $scope.isGrid = true;
        //卡片界面
        $scope.isCard = false;
        //编辑界面
        $scope.isForm = false;

        //代理制人员统计分析
        $scope.agentAnalyseGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '代理制人员统计分析.csv',
            columnDefs: [
                {name: 'orgName', displayName: '业务单位名称'},
                {name: 'allNum', displayName: '当前代理人总人数'},
                {name: 'yearAddNum', displayName: '本年度新增人数'},
                {name: 'yearOutNum', displayName: '本年度注销人数'},
                {name: 'monthAddNum', displayName: '本月新增人数'},
                {name: 'monthOutNum', displayName: '本月注销人数'},
                {name: 'retentionRate', displayName: '第十三个月留存率'},
            ],
            data: [],
            // exporterAllDataFn: function () {
            //     $scope.agentAnalyseGridOptions.data = $scope.agentAnalyseGridOptions.data;
            //     $scope.agentAnalyseGridOptions.totalItems = $scope.agentAnalyseGridOptions.data.length;
            // },
        };
        $scope.agentAnalyseGridOptions.onRegisterApi = function (gridApi) {
            $scope.agentAnalyseGridOptions.gridApi = gridApi;
        }
        //代理制业务统计分析
        $scope.agentBusinessAnalyseGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '代理制业务统计分析.csv',
            columnDefs: [
                {name: 'orgName', displayName: '业务单位名称'},
                {name: 'allAmount', displayName: '保费总金额'},
                {name: 'allFee', displayName: '佣金收入总金额'},
                {name: 'allCharge', displayName: '手续费支出总金额'},
                {name: 'avgFee', displayName: '人均收入'},
                {name: 'avgCharge', displayName: '人均手续费'},
                {name: 'iwmFee', displayName: '职域收入总金额'},
                {name: 'iwmCharge', displayName: '职域手续费支出总金额'},
                {name: 'lifeFee', displayName: '人身险佣金收入总金额'},
                {name: 'lifeCharge', displayName: '人身险手续费支出总金额'},
                {name: 'unlifeFee', displayName: '财产险佣金收入总金额'},
                {name: 'unlifeCharge', displayName: '财产险手续费支出总金额'},
            ],
            data: [],
            // exporterAllDataFn: function () {
            //     $scope.agentBusinessAnalyseGridOptions.data = $scope.agentAnalyseGridOptions.data;
            //     $scope.agentBusinessAnalyseGridOptions.totalItems = $scope.agentAnalyseGridOptions.data.length;
            // },
        };
        $scope.agentBusinessAnalyseGridOptions.onRegisterApi = function (gridApi) {
            $scope.agentBusinessAnalyseGridOptions.gridApi = gridApi;
        }
    };

    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.queryAgentAnalyse();
    $scope.queryAgentBusinessAnalyse($scope.query.businessYear);
});
