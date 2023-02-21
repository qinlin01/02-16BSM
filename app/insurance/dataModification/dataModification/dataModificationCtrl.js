/**
 * Create By zhangwj
 * Create Time 2021-11-16
 */
app.controller('dataModificationCtrl', function ($rootScope, $scope, $sce, $http, $state, $window, $stateParams, uiGridConstants, ngDialog, ngVerify) {

    if ($stateParams.type && $stateParams.funCode) {
        $scope.menuType = $stateParams.type;
        $scope.funCode = $stateParams.funCode;
    }else{
        layer.alert("页面加载异常，请联系管理员！", {skin: 'layui-layer-lan', closeBtn: 1});
    }

    $scope.initData = function () {
        //当前所有支持特殊修改的节点
        $scope.tableNameArray = [];
        $scope.configDataModificationList = null;
        $scope.getAllTableName = function(){
            layer.load(2);
            $http.post($scope.basePath + "dataModification/getAllTableName").success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == 200) {
                    for (let i = 0; i < response.data.length; i++) {
                        $scope.tableNameArray[i] = {"id":response.data[i].tableName,"name":response.data[i].tableNameCn};
                    }
                    $scope.configDataModificationList = response.data;
                }
            });
        }
        $scope.getAllTableName();

        //初始化全局动态参数
        $scope.fieldSearch = null;
        $scope.ocTime = null;
        $scope.executeData = null;
        $scope.changDataList = [];
        $scope.showUpdateResult = false;
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                code:null,
                dataCode:null,
                tableName:null,
                tableNameCn:null,
                content:null,
                reason:null,
                executeState:0,
                executeDate:null,
                billType:'add',
                dataId:null,
                oldData:null,
                newData:null,
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkCorp: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                createTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                dealattachmentb: [],
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "substr(create_time,1,4)0_0eq": parseInt(new Date().format("yyyy")),
                "bill_type0_0eq": $scope.menuType ,
            }
        };
        $scope.funCode = "19";
        $scope.QUERY = $scope.initQUERY();
    };


    $scope.initHttp = function () {

        $scope.onExecuteSql = function (){
            $scope.onCloseDetailDialog();
            layer.load(2);
            $http.post($scope.basePath + "dataModification/executeSql",
                {
                    changDataList: angular.toJson($scope.changDataList),
                    executeData: angular.toJson($scope.executeData),
                    vo: angular.toJson($scope.VO)
                }).success(function (response) {
                if(response.code == 200){
                    if(response.data.msg){
                        layer.alert(response.data.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }else{
                        $scope.findOne($scope.VO.id,function (){
                            //切换到卡片页面
                            $scope.isGrid = false;
                            $scope.isCard = true;
                            $scope.isForm = false;
                            $scope.isExecute = false;
                            $scope.changTableName();
                        });
                        $scope.changDataList = response.data.changDataList;
                        $scope.showUpdateResult = true;
                        $scope.detailDialog = ngDialog.openConfirm({
                            showClose: true,
                            closeByDocument: true,
                            template: getURL('insurance/view/dataModification/dataModificationDetail.html'),
                            className: 'ngdialog-theme-formInfo',
                            scope: $scope,
                            preCloseCallback: function (value) {
                                return true;
                            }
                        }).then(function (value) {
                            if (value != null) {
                            }
                        }, function (reason) {

                        });
                    }
                }
                layer.closeAll('loading');
            });
        }

        $scope.onPrepareExecute = function () {
            layer.load(2);
            $http.post($scope.basePath + "dataModification/prepareExecute",
                {
                    executeData: angular.toJson($scope.executeData),
                    vo: angular.toJson($scope.VO)
                }).success(function (response) {
                if(response.code == 200){
                    if(response.data.msg){
                        layer.alert(response.data.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }else{
                        $scope.changDataList = response.data.changDataList;
                        $scope.showUpdateResult = false;
                        $scope.detailDialog = ngDialog.openConfirm({
                            showClose: true,
                            closeByDocument: true,
                            template: getURL('insurance/view/dataModification/dataModificationDetail.html'),
                            className: 'ngdialog-theme-formInfo',
                            scope: $scope,
                            preCloseCallback: function (value) {
                                return true;
                            }
                        }).then(function (value) {
                            if (value != null) {
                            }
                        }, function (reason) {

                        });
                    }
                }
                layer.closeAll('loading');
            });
        }
        
        $scope.getExecuteFieldData = function (tableName, billid) {
            layer.load(2);
            $http.post($scope.basePath + "dataModification/getExecuteFieldData",
                {
                    tableName: tableName,
                    billid: billid
                }).success(function (response) {
                if(response.code == 200){
                    $scope.executeData = response.data;
                }
                layer.closeAll('loading');
            });
        }

        $scope.searchData = function () {
            if($scope.VO.tableName!=null && $scope.VO.tableName!=''){
                layer.load(2);
                $http.post($scope.basePath + "dataModification/getDataByTableName",
                    {
                        tableName: $scope.VO.tableName,
                        dataCode: $scope.VO.dataCode
                    }).success(function (response) {
                    if(response.code == 200){
                        $scope.dataListGridOption.data = response.data;
                    }
                    layer.closeAll('loading');
                });
            }else{
                layer.alert("请先选择数据节点名称再进行查询！", {skin: 'layui-layer-lan', closeBtn: 1});
            }
        }

        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "dataModification/queryForGrid", {
                params: angular.toJson(data),
                current: $scope.gridApi.page ? $scope.gridApi.page : 1,
                size: $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100,
            }).success(function (response) {
                $scope.gridOptions.data = response.data.records;
                $scope.gridOptions.totalItems = response.data.total;
                layer.closeAll('loading');
            });
        };

        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "dataModification/findOne", {id: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.data);
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealattachmentb;
                    if (callback) {
                        callback();
                    }
                } else {
                    if (response) {
                        if (response.msg) {
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                }
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $http({
                method: "POST",
                url: $rootScope.basePath + "dataModification/save",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response.code == 200) {
                    angular.assignData($scope.VO, response.result);
                    $scope.isGrid = false;
                    $scope.isCard = true;
                    $scope.isForm = false;
                    layer.closeAll('loading');
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
    };

    $scope.initFunction = function () {

        $scope.changTableName = function () {
            if($scope.VO.tableName!=null && $scope.VO.tableName!=''){
                //获取信息编号字段名称
                for (let i = 0; i < $scope.configDataModificationList.length; i++) {
                    if($scope.configDataModificationList[i].tableName == $scope.VO.tableName){
                        //生成子表信息以及字段
                        $scope.fieldSearch = $scope.configDataModificationList[i].fieldSearch;
                        $scope.ocTime = $scope.configDataModificationList[i].tableType=='json'?'operateTime':'createTime';
                        $scope.VO.tableNameCn = $scope.configDataModificationList[i].tableNameCn;
                        $scope.dataListGridOption.columnDefs = [
                            {name: $scope.fieldSearch, displayName: '信息编号'},
                            {name: 'billstatus', displayName: '单据状态', cellFilter: 'SELECT_BILLSTATUS'},
                            {name: 'pkOperator.name', displayName: '经办人'},
                            {name: $scope.ocTime, displayName: '制单日期', cellFilter: 'date:"yyyy-MM-dd"'},
                            {name: 'pkOrg.name', displayName: '业务单位'},
                            {name: 'pkDept.name', displayName: '部门'},
                            {name: 'pkChecker.name', displayName: '审核人'},
                            {name: 'checkDate', displayName: '审核日期'},
                            {name: 'pkAuditor.name', displayName: '最终审核人'},
                            {name: 'auditDate', displayName: '最终审核日期'},
                        ];
                        //显示组件
                        $scope.ifChoseTable = true;
                    }
                }
            }
        }

        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };

    };

    $scope.initWatch = function () {
        $scope.$watch('VO.tableName', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            $scope.changTableName();
        }, true)
    }
    ;

    $scope.initButton = function () {

        $scope.onShowExecuteResult = function () {
            $scope.changDataList = $scope.VO.changDataList;
            $scope.showUpdateResult = true;
            $scope.detailDialog = ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: getURL('insurance/view/dataModification/dataModificationDetail.html'),
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                preCloseCallback: function (value) {
                    return true;
                }
            }).then(function (value) {
                if (value != null) {
                }
            }, function (reason) {

            });
        }

        $scope.onCloseDetailDialog = function () {
            if ($scope.detailDialog != null) {
                $scope.showUpdateResult = false;
                ngDialog.close();
            }
        }

        $scope.onExecute = function () {
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行执行!", {skin: 'layui-layer-lan', closeBtn: 1});
                if (rows[0].executeState != 0) return layer.alert("已经执行过的数据不可再次执行!", {skin: 'layui-layer-lan', closeBtn: 1});
                $scope.findOne(rows[0].id,function (){
                    $scope.isGrid = false;
                    $scope.isCard = false;
                    $scope.isForm = false;
                    $scope.isExecute = true;
                    $scope.changTableName();
                });
                //获取执行区域数据
                $scope.getExecuteFieldData($scope.VO.tableName,$scope.VO.dataId);
            }
        };

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };

        $scope.onAdd = function () {
            angular.assignData($scope.VO, $scope.initVO());
            $scope.dealAttachmentBGridOptions.data = $scope.VO.dealattachmentb;
            $scope.isGrid = false;
            $scope.isCard = false;
            $scope.isExecute = false;
            $scope.isForm = true;
            //初始化全局动态参数
            $scope.fieldSearch = null;
            $scope.ocTime = null;
            $scope.ifChoseTable = false;
        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id,function (){
                    $scope.isGrid = false;
                    $scope.isCard = false;
                    $scope.isForm = true;
                    $scope.isExecute = false;
                    $scope.changTableName();
                });
            }
        };

        /**
         * 卡片
         */
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
            $scope.findOne(id,function (){
                $scope.isGrid = false;
                $scope.isCard = true;
                $scope.isForm = false;
                $scope.isExecute = false;
                $scope.changTableName();
            });
        };
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
                    $http.post($scope.basePath + "dataModification/delete", {ids: angular.toJson(ids)}).success(function (response) {
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

        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            if ($scope.VO.id && $scope.VO.id != '') {
                $scope.isGrid = false;
                $scope.isCard = true;
                $scope.isForm = false;
                $scope.isExecute = false;
            } else {
                $scope.isGrid = true;
                $scope.isCard = false;
                $scope.isForm = false;
                $scope.isExecute = false;
            }
        };
        /**
         * 返回
         */
        $scope.onBack = function () {
            if ($stateParams.id) {
                window.history.back(-2);
                return;
            }
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isForm = false;
            $scope.isExecute = false;
            //阻止页面渲染
            $scope.queryForGrid($scope.QUERY);
        };
        /**
         * 保存判断必输项
         */
        $scope.onSave = function () {
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {

                    if ($scope.dealAttachmentBGridOptions.data.length == 0) {
                        return layer.alert("数据修改申请，必须上传佐证材料!", {skin: 'layui-layer-lan', closeBtn: 1});
                    }

                    $scope.onSaveVO();
                }
            }, true);
        };

        $scope.onReset = function () {
            $scope.QUERY = $scope.initQUERY();
            $scope.QUERY.id = null;
        };


        $scope.onUploads = function () {
            $scope.isSubDisabled = false;
            $scope.aVO = {};
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/common/attachments.html',
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
                    //  第一次初始化成null，后台没值，应该【】
                    if ($scope.dealAttachmentBGridOptions.data) {
                        angular.forEach(value, function (item) {
                            item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });

                    } else {
                        $scope.dealAttachmentBGridOptions.data = [];
                        angular.forEach(value, function (item) {
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });
                    }


                }
            }, function (reason) {

            });
        };

        $scope.onDownLoads = function () {
            let rows = $scope.VO.dealattachmentb;
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
         * 子表新增
         */
        $scope.onAddLine = function (selectTabName) {
            let data = {};
            $scope[selectTabName].data.push(data);
        }

        /**
         * 子表删除
         */
        $scope.onDeleteLine = function (selectTabName) {
            let delRow = $scope[selectTabName].gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });

            for (let i = 0; i < $scope[selectTabName].data.length; i++) {
                for (let j = 0; j < delRow.length; j++) {
                    if ($scope[selectTabName].data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope[selectTabName].data.splice(i, 1);
                    }
                }
            }
        };

    };

    $scope.initPage = function () {
        //是否选择节点
        $scope.ifChoseTable = false;
        //列表界面
        $scope.isGrid = true;
        //卡片界面
        $scope.isCard = false;
        //编辑界面
        $scope.isForm = false;
        //执行界面
        $scope.isExecute = false;
        //列表界面子表是否显示
        $scope.chilbTable = false;
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
            exporterCsvFilename: '数据修改.csv',
            columnDefs: [
                {name: 'code', displayName: '申报信息编号'},
                {name: 'tableNameCn', displayName: '数据节点名称'},
                {name: 'dataCode', displayName: '数据信息编号'},
                {name: 'reason', displayName: '申报原因'},
                {name: 'content', displayName: '申报内容'},
                {name: 'executeState', displayName: '执行状态', cellFilter: 'SELECT_TASKSTATE'},
                {name: 'executeDate', displayName: '执行日期', cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'billstatus', displayName: '单据状态', cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人'},
                {name: 'createTime', displayName: '制单日期', cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'pkOrg.name', displayName: '业务单位'},
                {name: 'pkDept.name', displayName: '部门'},
                {name: 'pkChecker.name', displayName: '审核人'},
                {name: 'checkDate', displayName: '审核日期'},
                {name: 'pkAuditor.name', displayName: '最终审核人'},
                {name: 'auditDate', displayName: '最终审核日期'},
            ],
            data: [],

            exporterAllDataFn: function () {
                return $scope.queryAllForGrid($scope.QUERY).then(function () {
                    $scope.gridOptions.useExternalPagination = false;
                });
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
                    $scope.VO = row.entity;
                    $scope.findOne($scope.VO.id);
                } else {
                    $scope.chilbTable = false;
                    $scope.VO = $scope.initVO();
                }
            });


        };

        //展示查询的数据结果
        $scope.dataListGridOption = {
            enableCellEditOnFocus: false,
            multiSelect: false,
            enableSorting: true,
            enableRowHeaderSelection: true,//不显示选中框
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '查询数据结果.csv',
            columnDefs: [],
            data: [],
            onRegisterApi: function (gridApi) {
                $scope.dataListGridOption.gridApi = gridApi;
                $scope.dataListGridOption.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                $scope.dataListGridOption.gridApi.selection.on.rowSelectionChanged(
                    $scope, function (row, event) {
                        if(row.isSelected){
                            $scope.VO.oldData = row.entity;
                            $scope.VO.dataId = $scope.VO.oldData.id;
                        }else{
                            $scope.VO.oldData = null;
                            $scope.VO.dataId = null;
                        }

                    });
            }
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
                    name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                },
                {
                    name: 'pk_project_id',
                    displayName: ' ',
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ng-click="grid.appScope.onPreviewFile(row.entity.pk_project_id,row.entity.attachment_name)" class="btn btn-transparent btn-xs tooltips" tooltip-placement="top">在线预览&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i></a></div>'
                }
            ],
            data: $scope.VO.dealattachmentb,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.dealAttachmentBGridOptions = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.dealAttachmentBGridOptions.gridApi = gridApi;
                }
                $scope.dealAttachmentBGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };

        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
    };

    //实体类审批流配置
    $scope.ifEntity = "true";
    $scope.entityVO = "lr.insurance.vo.DataModificationVO";
    $scope.table_name = "t_data_modification";
    $scope.billdef = "DataModification";
    $scope.beanName = "dataModificationService";
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