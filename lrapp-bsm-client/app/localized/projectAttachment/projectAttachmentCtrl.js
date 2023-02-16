app.controller('projectAttachmentCtrl', function ($rootScope, $scope, $sce, $http, $state, $window, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $location) {
    $scope.initData = function () {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                selectTerritorial :'',
                projectAttachment :'',
                selectTerritorialName : '',
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                createTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                dr: 0,
                billstatus: 31,
                ts: new Date().format("yyyy-MM-dd HH:mm:ss"),

            }
        }
        $scope.initQUERY = function () {
            return {
                "create_time_year":parseInt(new Date().format("yyyy"))
            }
        };
        //主表数据
        $scope.VO = $scope.initVO();

        $scope.QUERY = $scope.initQUERY();


    }
    $scope.initHttp = function () {

        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.localizedPath + "LocalProjectAttachment/queryForGrid", {
                params: angular.toJson(data),
                current: $scope.gridApi ? $scope.gridApi.page : 1,
                size: $scope.gridApi ? $scope.gridApi.pageSize : 100,
            }).success(function (response) {
                $scope.gridOptions.data = response.data.records;
                $scope.gridOptions.totalItems = response.data.total;
                layer.closeAll('loading');
            });
        };
        //保存
        $scope.onSaveVO = function () {
            layer.load(2);
            $http({
                method: "POST",
                url: $scope.localizedPath  + "LocalProjectAttachment/save",
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
            $http.post($scope.localizedPath + "LocalProjectAttachment/findOne", {id: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.data);
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.projectAttachment;
                    if($stateParams.id) {
                        $scope.onDownLoads();
                        window.history.back(-2);
                        return;
                    }

                }
            })};
    }
    $scope.initWatch = function () {

    }
    $scope.initButton = function () {

        //过滤查询
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
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
                    $http.post($scope.localizedPath  + "LocalProjectAttachment/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        //附件上传
        $scope.onUploads = function (selectTabName) {
            layer.load(2);
            $scope.isSubDisabled = true;
            $scope.isUploadAnytime = true;
            $scope.aVO = {};
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/common/attachment.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                preCloseCallback: function (value) {
                    if (value && value == "clear") {
                        //重置
                        return false;
                    }
                    //取消
                    return true;
                }
            }).then(function (value) {
                if (value != null) {
                    let attachmentList = [];
                    attachmentList = value;
                    if(attachmentList.length>9){
                        return layer.alert("批量上传最大个数为10！", {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        })
                    }
                    layer.load(2);
                    //调用后台保存接口
                    $http.post($scope.localizedPath + "LocalProjectAttachment/saveFiles", {
                        data: angular.toJson(value),
                    }).success(function (response) {
                        layer.closeAll('loading');
                        $scope.onQuery();
                        if (response && response.code == "200") {
                            layer.alert(response.msg, {
                                icon: 1
                            });
                        }else{
                            layer.msg(response.msg, {icon: 1});
                        }

                    });
                }
            }, function (reason) {

            });
        };
        //下载附件
        $scope.onDownLoads = function () {
            let rows = null;
            rows = $scope.VO.projectAttachment;
            if (!rows || rows.length <= 0) return angular.alert("没有附件信息！");
            let ids = [];
            for (let i = 0; i < rows.length; i++) {
                ids.push(rows[i].pk_project_id);
            }
            let exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };
        /**
         * 子表删除
         */
        $scope.onDeleteLine = function () {
            var delRow = $scope[$scope.selectTabName].gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (var i = 0; i < $scope[$scope.selectTabName].data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope[$scope.selectTabName].data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope[$scope.selectTabName].data.splice(i, 1);
                    }
                }
            }
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
                    if($scope.VO.projectAttachment == null || $scope.VO.projectAttachment == ''){
                        return layer.alert("请上传附件!",
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
        $scope.upOrDown = false;
        $scope.gridOptions = {
            rowTemplate: "<div ng-dblclick=\"grid.appScope.onRowDblClick(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>",
            enableRowSelection: true,
            enableSelectAll: true,
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
            exporterCsvFilename: '项目信息管理.csv',
            columnDefs: [
                {name: 'selectTerritorial.name', displayName: '公司名称', width: 200,},
                {name: 'attachment_name', displayName: '附件名称', width: 300,},
                {name: 'createTime', displayName: '上传时间', width: 200},
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

        //附件
        $scope.dealAttachmentBGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},
                {
                    name: 'upload_date', displayName: '上载时间', width: 100, enableCellEdit: false
                },
                {
                    name: 'pk_project_id',
                    displayName: ' ',
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ng-click="grid.appScope.onPreviewFile(row.entity.pk_project_id,row.entity.attachment_name)" class="btn btn-transparent btn-xs tooltips" tooltip-placement="top">在线预览&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i></a></div>'
                }
            ],
            data: $scope.VO.projectAttachment,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.dealAttachmentBGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.dealAttachmentBGridOptions.gridApi = gridApi;
                }
                $scope.dealAttachmentBGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };
        if($stateParams.id) {
            $scope.findOne($stateParams.id);
        }
    }
    $scope.initFunction = function () {

        $scope.onRowDblClick = function (item) {
            if(item && item.id){
                $scope.onCard(item.id);
            }
        };

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

    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {
            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }

    };
    $scope.funCode = '1508';
    $scope.table_name = "t_project_attachment";
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