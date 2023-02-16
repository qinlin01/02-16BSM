app.controller('localImportConfigCtrl', function ($rootScope, $scope, $sce, $http, $state, $window, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $location) {
    $scope.initData = function () {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                id:'',
                template_name:'',
                project_type:'',
                start_date:'',
                end_date:'',
                service_type:null,
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                create_time:new Date().format("yyyy-MM-dd HH:mm:ss"),
                ts:new Date().format("yyyy-MM-dd HH:mm:ss"),
                dr:0,
                billstatus:31,
                services:null
            }
        }

        $scope.VO = $scope.initVO();
        //服务内容
        $scope.servicesTypeBox = {};

        //初始化查询
        $scope.initQUERY = function () {
            return {
                "create_time_year":parseInt(new Date().format("yyyy"))
            }
        };
        $scope.QUERY = $scope.initQUERY();

        $scope.orgRows = [
            {pk:1,name: '案件管理'},
            {pk:2,name: '培训工作管理'},
            {pk:3,name: '服务记录',serviceRows:[
                    {pk:4,name: '日常咨询'},
                    {pk:5,name: '防损防灾'},
                    {pk:6,name: '短信查询'},
                ]},
        ];
    }
    $scope.initHttp = function () {

        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.localizedPath + "LocalImportConfig/queryForGrid", {
                params: angular.toJson(data),
                current: $scope.gridApi ? $scope.gridApi.page : 1,
                size: $scope.gridApi ? $scope.gridApi.pageSize : 100,
            }).success(function (response) {
                console.log(response.data.records);
                $scope.gridOptions.data = response.data.records;
                $scope.gridOptions.totalItems = response.data.total;
                layer.closeAll('loading');
            });
        };
        //保存
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO.services = null;
            $http({
                method: "POST",
                url: $scope.localizedPath  + "LocalImportConfig/save",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response.code == 200) {
                    layer.closeAll('loading');
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    $scope.onBack();
                }
            });
        };
        $scope.findOne = function (pk) {
            
            $scope.pk = pk;
            $http.post($scope.localizedPath + "LocalImportConfig/findOne", {id: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.data);
                }
            })};
    }
    $scope.initWatch = function () {

    }
    $scope.initButton = function () {

        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        //过滤查询
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };
        //修改
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });

                $scope.findOne(rows[0].id);
                if($scope.VO.billstatus != '37' && $scope.VO.serviceType != null){
                    //回显按钮
                    let type = $scope.VO.serviceType;
                    for (let i = 0; i < $scope.orgRows.length; i++){
                        for (let j = 0; j < type.length; j++) {
                            if(type[j].pk>2){
                                if(type[j].pk == 3){
                                    $scope.servicesTypeBox[3] = true;
                                }else{
                                    $scope.isService = true;
                                    let serviceRow = $scope.orgRows[2].serviceRows
                                    for (let k = 0; k < serviceRow.length; k++) {
                                        for (let l = 0; l < type.length; l++) {
                                            if (serviceRow[k].pk == type[l].pk){
                                                $scope.servicesTypeBox[serviceRow[k].pk] = true;
                                                break;
                                            }else{
                                                $scope.servicesTypeBox[serviceRow[k].pk] = false;
                                                continue;
                                            }
                                        }
                                    }
                                }
                            }else{
                                $scope.isService = false;
                                if(type[j].pk==$scope.orgRows[i].pk){
                                    $scope.servicesTypeBox[$scope.orgRows[i].pk] = true;
                                    break;
                                }else{
                                    $scope.servicesTypeBox[$scope.orgRows[i].pk] = false;
                                    continue;
                                }
                            }
                        }
                    }
                }
                $scope.isGrid = false;
                $scope.isCard = false;
                $scope.isForm = true;
            }
        };
        /**
         * 暂存
         */
        $scope.onTemporary = function () {
            layer.load(2);
            $scope.VO.services = null;
            $http({
                method: "POST",
                url: $rootScope.localizedPath + "LocalImportConfig/temporary",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response.code == 200) {
                    angular.assignData($scope.VO, response.result);
                    $scope.isGrid = true;
                    $scope.isCard = false;
                    $scope.isForm = false;
                    layer.closeAll('loading');
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    $scope.onBack();
                }
            });
        };
        //删除
        $scope.onDelete = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert("请选择数据进行删除!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.confirm('是否删除选中数据？', {
                    btn: ['删除', '返回'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消删除!', {
                            shift: 6,
                            icon: 11
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    var ids = [];
                    for (var i = 0; i < rows.length; i++) {
                        ids.push(rows[i].id);
                    }
                    layer.load(2);
                    $http.post($scope.localizedPath  + "LocalImportConfig/delete", {ids: angular.toJson(ids)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response.code == 200) {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg(response.msg, {icon: 1});
                        }
                        if (response.code == 900) {
                            layer.msg(response.msg, {icon: 1});
                        }
                    });
                }
            );
        };
        //卡片
        $scope.onCard = function (id) {
            if (!id) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1)
                    return layer.alert("请选择一条数据进行查看!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                id = rows[0].id;
            }
            $scope.findOne(id);
            $scope.isGrid = false;
            $scope.isCard = true;
            $scope.isForm = false;
        };
        //重置
        $scope.onReset = function () {
            $scope.QUERY = $scope.initQUERY();
            $scope.QUERY.id = null;
        };
        //保存
        $scope.onSave = function () {
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    if($scope.VO.serviceType==null || $scope.VO.serviceType == ''){
                        return layer.alert("服务内容不能为空!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    $scope.onSaveVO();
                }
            }, true);
        };
        //增加
        $scope.onAdd = function () {
            $scope.isForm=true;
            $scope.isClear = true;
            $scope.isGrid = false;
            $scope.isCard = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.isUploadAnytime = false;

            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
        };
        //返回
        $scope.onBack = function () {
            if ($stateParams.id) {
                window.history.back(-2);
                return;
            }
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isUploadAnytime = false;
            $scope.isDisabled = true;
            //阻止页面渲染
            $scope.isForm = false;
            $scope.queryForGrid($scope.QUERY);
            $scope.initPage();
        };
    }
    $scope.initPage = function () {

        $scope.isForm = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.gridOptions = {
            rowTemplate: "<div ng-dblclick=\"grid.appScope.onRowDblClick(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>",
            enableRowSelection: true,
            enableSelectAll: true,
            queryshow:true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            exporterMenuCsv: true,
            showGridFooter: true,
            showColumnFooter: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '模板管理.csv',
            columnDefs: [
                {name: 'templateName', displayName: '模板名称'},
                {name: 'projectType', displayName: '项目类型', width: 100,cellFilter: 'SELECT_PROJECTTYPES'},
                {name: 'templateId', displayName: '项目编号'},
                {name: 'startDate', displayName: '生效日期', width: 100},
                {name: 'endDate', displayName: '结束日期', width: 100},
                {name: 'services', displayName: '服务内容',cellFilter: 'StringFilter'},
                {name: 'billstatus', displayName: '单据状态',width: 100,cellFilter:'SELECT_LOCALIZEDBILLSTATUS'},
            ],
            data: [],
            exporterAllDataFn: function () {
                $scope.queryAllForGrid($scope.QUERY);
            },
        };
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;

            //添加行头
            $scope.gridApi.core.addRowHeaderColumn({
                name: 'rowHeaderCol',
                displayName: '',
                width: 30,
                cellTemplate: 'ui-grid/rowNumberHeader'
            });

            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                $scope.gridApi.page = newPage;
                $scope.gridApi.pageSize = pageSize;
                $scope.queryForGrid($scope.QUERY);
            });

            $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (rows.length == 1) {
                    if (!$scope.chilbTable) {
                        $scope.chilbTable = true;
                    }
                    angular.assignData($scope.VO, row.entity);
                    $scope.findOne(rows[0].id);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });
        };
    }
    $scope.initFunction = function () {


        $scope.checkboxChoosed = function () {
            $scope.VO.serviceType = [];
            $scope.isService = false;
            for (let i = 0; i < $scope.orgRows.length; i++) {

                if($scope.servicesTypeBox[$scope.orgRows[i].pk]){
                    //服务记录
                    if($scope.orgRows[i].pk==3&&$scope.servicesTypeBox[$scope.orgRows[2].pk]){
                        $scope.isService = true;
                        for (let i = 0; i < $scope.orgRows[2].serviceRows.length; i++) {
                            if($scope.servicesTypeBox[$scope.orgRows[2].serviceRows[i].pk]){
                                $scope.VO.serviceType.push($scope.orgRows[2].serviceRows[i]);
                            }
                        }
                    }else{
                        $scope.isService = false;
                    }
                    $scope.VO.serviceType.push($scope.orgRows[i]);
                }
            }
        }
    }
    $scope.funCode = '1507';
    $scope.table_name = "t_local_import_config";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.onQuery();


    initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope, $rootScope);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);
})