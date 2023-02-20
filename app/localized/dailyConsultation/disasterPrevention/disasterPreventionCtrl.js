app.controller('disasterPreventionCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $location) {
    $scope.initData =function (data) {
        $scope.status = {open: true};
        $scope.initVO= function () {
            return{
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                dr:0,
                dealAttachmentB: [],
                projectInfo:[],
                serviceName:'',
                serviceDate:'',
                serviceType:'',
                billstatus:'37',
            }
        };

        $scope.entityVO = 'nc.vo.busi.disasterPreventionVO';
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "id": $stateParams.id,
                "year":parseInt(new Date().format("yyyy"))
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.projectRef =
            {
                id: $scope.$id,
                columnDefs: [
                    {
                        field: 'insurance_no',
                        displayName: '保单号'
                    },
                    {
                        field: 'project_name',
                        displayName: '项目名称'
                    }
                ],
                data: ""
            };

    };

    $scope.initHttp=function(){
        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post(localizedPath  + "disasterPreventionController/queryForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response.code == 200) {
                    if (!$scope.query) {
                        $scope.query = $scope.gridOptions.columnDefs;
                    }
                    if ($scope.QUERY.id) {
                        $scope.QUERY.id = null;
                    }
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                if (response.code == 500) {
                    return layer.alert(response.msg);
                }
                layer.closeAll('loading');
            });
        };

    };

    $scope.initFunction = function () {
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function(item){
            if(item && item.id){
                $scope.onCard(item.id);
            }

        };
    };


    $scope.initButton = function(){
        /**
         * 修改
         * */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form=true;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id);
                $scope.isbusinessStatus = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            }
        };
        /**
         * 删除
         * */
        $scope.onDelete = function () {
            let rows = $scope.gridApi.selection.getSelectedRows();
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
                    let ids = [];
                    for (let i = 0; i < rows.length; i++) {
                        ids.push(rows[i].id);
                    }
                    layer.load(2);
                    $http.post(localizedPath  + "disasterPreventionController/delete", {ids: angular.toJson(ids)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg('删除成功!', {
                                icon: 1
                            });
                        }else{
                            if (response.code == 500) {
                                return layer.alert(response.msg);
                            }
                            return layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }

                    });
                }
            );

        };


        $scope.findOne = function (pk,callback) {
            $scope.pk = pk;
            $http.post(localizedPath  + "disasterPreventionController/findOne",{pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200"){
                    angular.assignData($scope.VO,response.result);
                    if (callback){
                        callback;
                    };

                }else {
                    if (response.code == 500) {
                        return layer.alert(response.msg);
                    }
                    if(response){
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function(matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }

                }
            });
        };

        //项目信息关联页面
        $scope.relationPage = function (name) {
            $scope.selectTabName = name;
            if(name == "projectInfoGridOptions") {
                $scope.isSubDisabled = false;
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: false,
                    template: 'view/disasterPrevention/projectInfoPage.html',
                    className: 'ngdialog-theme-formInfo',
                    controller: 'projectInfoPageCtrl',
                    scope: $scope,
                    rootScope: $rootScope,
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
                        for (var i = 0; i < value.length; i++) {
                            $scope.projectInfoGridOptions.data.push(value[i]);
                        }
                    }

                }, function (reason) {

                });
            }
        };


        $scope.onAdd = function () {
            $scope.isbusinessStatus = false;
            $scope.isClear = true;
            $scope.form = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.isDisableds = true;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.isUploadAnytime = false;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            // $rootScope.onAddCheck($scope);
        };
        /**
         * 上传
         * */
        $scope.onUploads = function () {
            $scope.isSubDisabled = false;
            $scope.aVO = {};
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/common/attachmentLocaltion.html',
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
                            let dealAttachmentB ={};
                            dealAttachmentB.file_type=6;
                            dealAttachmentB.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                            dealAttachmentB.pk_project_id=item.pk_project_id;
                            dealAttachmentB.attachment_name=item.attachment_name;
                            $scope.dealAttachmentBGridOptions.data.push(dealAttachmentB);
                        });

                    } else {
                        angular.forEach(value, function (item) {
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });
                    }


                }
            }, function (reason) {

            });
        };


        /**
         * 下载
         * */

        $scope.onDownLoads = function () {
            let rows = $scope.VO.dealAttachmentB;
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

        $scope.onDownLoadsCard = function (id) {
            let ids = [];
            ids.push(id);
            let exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };

        /**
         * 控制字表按钮的显示
         * */

        $scope.onRenewal = function () {
            //  控制字表按钮的显示
            $scope.isClear = false;
            if ($scope.isGrid) {
                let rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.isGrid = false;
                $scope.form = true;
                $scope.findOne(rows[0].id, function () {
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.VO.pkOperator = $rootScope.userVO;
                    $scope.VO.operateDate = new Date().format("yyyy-MM-dd");
                    $scope.VO.operateTime = new Date().format("yyyy-MM-dd HH:mm:ss");
                    $scope.VO.id = null;
                    $scope.dealAttachmentBGridOptions.data = [];
                    $scope.gridApi.selection.getSelectedRows()[0] = $scope.VO;
                });

            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            }

        };

        $scope.onCopy = function () {
            //  控制字表按钮的显示
            $scope.isClear = false;
            if ($scope.isGrid) {
                let rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.isGrid = false;
                $scope.form = true;

                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
                $scope.VO.pkOperator = $rootScope.userVO;
                $scope.VO.operateDate = new Date().format("yyyy-MM-dd");
                $scope.VO.operateTime = new Date().format("yyyy-MM-dd HH:mm:ss");
                $scope.findOne(rows[0].id, function () {
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.VO.pkOperator = $rootScope.userVO;
                    $scope.VO.operateDate = new Date().format("yyyy-MM-dd");
                    $scope.VO.operateTime = new Date().format("yyyy-MM-dd HH:mm:ss");


                    $scope.VO.id = null;


                    $scope.gridApi.selection.getSelectedRows()[0] = $scope.VO;
                });
                $scope.VO.id = null;
            } else {

                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            }

        };



        /**
         * 卡片
         * */

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
            $http.post( localizedPath  + "disasterPreventionController/findOne",{
                pk: id,
                tableName: $scope.table_name,
                billdef: $scope.billdef
            }).success(function (response) {
                if (response && response.code == "200") {
                    $scope.card = true;
                    angular.assignData($scope.VO, response.result);
                    if (!response.result.taskHis)
                        $scope.mess = false;
                    else
                        $scope.mess = true;
                    $scope.isBack = true;
                    $scope.isGrid = false;
                    $scope.isCard = true;
                } else {
                    if (response) {
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
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


        /**
         * 返回
         */
        $scope.onBack = function () {
            if($stateParams.id) {
                window.history.back(-2);
                return;
            }
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isDisabled = true;
            $scope.isDisableds = true;
            //阻止页面渲染
            $scope.form = false;
            $scope.card = false;
            //阻止页面渲染
            $scope.queryForGrid($scope.QUERY);
        };


        /**
         * 保存
         * */
        $scope.onSave = function (data) {
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $scope.VO.projectInfo = $scope.projectInfoGridOptions.data;
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }else{
                    if ($scope.VO.projectInfo ==""){
                        return layer.alert("请选择项目信息!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if($scope.VO.dealAttachmentB.length <= 0){
                        return layer.alert("请上传附件!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    for(let i = 0 ; i < $scope.VO.dealAttachmentB.length;i++){
                        if(!$scope.VO.dealAttachmentB[i].file_type || $scope.VO.dealAttachmentB[i].file_type==""){
                            return layer.alert("请选择第 "+ i+1 +"个附件的附件类型!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if (data) {
                        data=$scope.VO;
                        var tablename = $scope.table_name;
                        $http.post( localizedPath  + "disasterPreventionController/save",{data:angular.toJson(data),tablename:tablename}).success(function(response) {
                            if(response.code == 200){
                                $scope.isGrid = false;
                                $scope.isBack = false;
                                $scope.isEdit = false;
                                $scope.isShow = true;
                                $scope.isDisabled = false;
                                angular.assignData($scope.VO, response.result);
                                $scope.isSubEdit = false;
                                layer.confirm("保存成功",{
                                    btn: ['确定'],
                                }, function (btn) {
                                    layer.close(btn);
                                });
                            }
                            if (response.code == 500) {
                                return layer.alert(response.msg);
                            }
                        });

                    }
                }
            });



        };


        $scope.onTemporary = function (data) {
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $scope.VO.projectInfo = $scope.projectInfoGridOptions.data;
            if (data) {
                data=$scope.VO;
                var tablename = $scope.table_name;
                $http.post( localizedPath  + "disasterPreventionController/onTemporary",{data:angular.toJson(data),tablename:tablename}).success(function(response) {
                    if(response.code == 200){
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isShow = true;
                        $scope.isDisabled = false;
                        angular.assignData($scope.VO, response.result);
                        $scope.isSubEdit = false;
                        layer.confirm("暂存成功",{
                            btn: ['确定'],
                        }, function (btn) {
                            layer.close(btn);
                        });
                    }
                    if (response.code == 500) {
                        return layer.alert(response.msg);
                    }
                });

            }



        };
        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };
        $scope.onReset = function () {
            $scope.QUERY = $scope.initQUERY();
            $scope.QUERY.id = null;
        };


        /**
         * 初始化参照
         */
        $scope.initView = function () {

        };

        /**
         * 子表删除
         */
        $scope.onDeleteLine = function (name) {
            $scope.selectTabName = name;
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



    };


    $scope.initPage = function () {
        $scope.isClear = false;
        $scope.isShow = true;
        //阻止页面渲染
        $scope.form = false;
        $scope.card = false;
        //阻止页面渲染
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.isDisableds = false;
        $scope.isreplace = true;
        $scope.queryShow = true;
        //控制附件上传和下载
        $scope.upOrDown = true;
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
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '日常咨询信息.csv',
            columnDefs: [
                {name: 'serviceName', displayName: '服务名称' },
                {name: 'serviceType', displayName: '服务方式',cellFilter: 'SELECT_SERVICETYPE'},
                {name: 'serviceDate', displayName: '服务日期'},
                {name: 'year', displayName: '服务年度'},
                {name: 'projectNum', displayName: '项目数量'},
                {name: 'pkOperator.name', displayName: '经办人'},
                {name: 'operateDate', displayName: '录入日期'},
                {name: 'territorial_organization_name', displayName: '属地服务机构'},
                {name: 'consultationReply', displayName: '服务内容'},
                {name: 'billstatus', displayName: '单据状态',cellFilter:'SELECT_LOCALIZEDBILLSTATUS'},
            ],
            data: [],
        };
        $scope.gridOptions.onRegisterApi = function (gridApi) {
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



        //项目信息
        $scope.projectInfoGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: false,
            enableRowSelection: false,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            rowHeight: 35,
            columnDefs: [
                {name: 'customer_name', displayName: '客户名称'},
                {name: 'project_name', displayName: '项目名称'},
                {name: 'insurancetype.name', displayName: '投保险种'},
            ],
            data:$scope.VO.projectInfo,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.projectInfo = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.projectInfoGridOptions.gridApi = gridApi;
                    if (gridApi.edit){
                        gridApi.edit.on.afterCellEdit($scope,function (rowEntity, colDef, newValue, oldValue) {
                            $scope.projectNum = $scope.projectInfoGridOptions.data.length;
                            $scope.territorial_organization = $scope.projectInfoGridOptions.data[0].territorial_organization.name;
                            $scope.service_year = $scope.projectInfoGridOptions.data[0].service_year;
                        })
                    }
                }
                $scope.projectInfoGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };


        //其他附件
        $scope.dealAttachmentBGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'file_type',
                    displayName: '附件类型',
                    enableCellEdit: true,
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownValueLabel: 'name',
                    editDropdownOptionsArray: getSelectOptionData.SERVICETYPEFILE,
                    cellFilter: 'SELECT_SERVICETYPEFILE',
                },

                {name: 'attachment_name', displayName: '附件名称', enableCellEdit: false},
                {
                    name: 'cUpdate', displayName: '上载时间',enableCellEdit: false
                },
            ],
            data: $scope.VO.dealAttachmentB,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.dealAttachmentBGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.dealAttachmentBGridOptions.gridApi = gridApi;
                    if (gridApi.edit){
                        gridApi.edit.on.afterCellEdit($scope,function (rowEntity, colDef, newValue, oldValue) {
                        })
                    }
                }
                $scope.dealAttachmentBGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };
        if($stateParams.id) {
            $scope.isbusinessStatus = true;
            $http.post($scope.localizedPath + "projectInformation/findOne", {pk: $stateParams.id}).success(function (response) {
                if (response && response.code == "200") {
                    $scope.projectInfoGridOptions.data.push(response.result);
                    $scope.isEdit = true;
                    $scope.isClear = false;
                    $scope.isGrid = false;
                    $scope.form=true;
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                } else {
                    if (response.code == 500) {
                        layer.alert(response.msg);
                    }
                    if(response){
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function(matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                }
            });
        }
    };
    //监听数据变化
    $scope.initWatch = function () {
        $scope.$watch('VO.projectInfo', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if($scope.VO.projectInfo&&$scope.VO.serviceDate&&$scope.VO.serviceType) {
                    var serviceType = "";
                    for(let i = 0; i<getSelectOptionData.SERVICETYPE.length;i++){
                        if(getSelectOptionData.SERVICETYPE[i].id == $scope.VO.serviceType){
                            serviceType = getSelectOptionData.SERVICETYPE[i].name;
                        }
                    }
                    if($scope.VO.projectInfo.length > 1){
                        $scope.VO.serviceName = $rootScope.orgVO.name +  "关于中国建筑" + $scope.VO.serviceDate + "的" + serviceType + "服务";
                    }
                    if($scope.VO.projectInfo.length == 1){
                        $scope.VO.serviceName = $rootScope.orgVO.name +  "关于中国建筑" + $scope.VO.serviceDate + "的" + serviceType + "服务";
                    }
                }
            }
        }, true);
        $scope.$watch('VO.serviceDate', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if($scope.VO.serviceDate){
                    $scope.VO.year = $scope.VO.serviceDate.split("-")[0];
                }
                if($scope.VO.projectInfo&&$scope.VO.serviceDate&&$scope.VO.serviceType) {
                    var serviceType = "";
                    for(let i = 0; i<getSelectOptionData.SERVICETYPE.length;i++){
                        if(getSelectOptionData.SERVICETYPE[i].id == $scope.VO.serviceType){
                            serviceType = getSelectOptionData.SERVICETYPE[i].name;
                        }
                    }
                    if($scope.VO.projectInfo.length > 1){
                        $scope.VO.serviceName = $rootScope.orgVO.name +  "关于中国建筑" + $scope.VO.serviceDate + "的" + serviceType + "服务";
                    }
                    if($scope.VO.projectInfo.length == 1){
                        $scope.VO.serviceName = $rootScope.orgVO.name +  "关于中国建筑" + $scope.VO.serviceDate + "的" + serviceType + "服务";
                    }
                }
            }
        }, true);
        $scope.$watch('VO.serviceType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if($scope.VO.projectInfo&&$scope.VO.serviceDate&&$scope.VO.serviceType) {
                    var serviceType = "";
                    for(let i = 0; i<getSelectOptionData.SERVICETYPE.length;i++){
                        if(getSelectOptionData.SERVICETYPE[i].id == $scope.VO.serviceType){
                            serviceType = getSelectOptionData.SERVICETYPE[i].name;
                        }
                    }
                    if($scope.VO.projectInfo.length > 1){
                        $scope.VO.serviceName = $rootScope.orgVO.name +  "关于中国建筑" + $scope.VO.serviceDate + "的" + serviceType + "服务";
                    }
                    if($scope.VO.projectInfo.length == 1){
                        $scope.VO.serviceName = $rootScope.orgVO.name +  "关于中国建筑" + $scope.VO.serviceDate + "的" + serviceType + "服务";
                    }
                }
            }
        }, true);
    }

    $scope.table_name = " lr_disaster_prevention";
    $scope.billdef = "DisasterPrevention";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initButton();
    $scope.initPage();
    $scope.initWatch();
    $scope.onQuery();
    initworkflow($scope, $http,ngDialog);
    // initonlineView($scope,$rootScope,$sce,$http,ngDialog);
});


app.controller('projectInfoPageCtrl', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {
    /**
     * 初始化页面变更方法
     */
    $scope.initQUERYChildren = function () {
        return {
        }
    };
    $scope.QUERYCHILDREN = $scope.initQUERYChildren();

    $scope.initData = function () {
        $scope.VO.projectInfoPagesChildren = [];
        $scope.projectInfoPagesChildren = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            useExternalPagination: true,
            columnDefs: [
                {name: 'customer_name', displayName: '客户名称'},
                {name: 'project_name', displayName: '项目名称'},
                {name: 'insurancetype.name', displayName: '投保险种'},
            ],
        };
        $scope.projectInfoPagesChildren.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;

            //添加行头
            $scope.gridApi.core.addRowHeaderColumn({
                name: 'rowHeaderCol',
                displayName: '',
                width: 30,
                cellTemplate: 'ui-grid/rowNumberHeader'
            });

            if(null!= gridApi.pagination){
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    $scope.gridApi.page = newPage;
                    $scope.gridApi.pageSize = pageSize;
                    $scope.queryForGridChildren($scope.QUERYCHILDREN, $scope.queryPath);
                });
            }
        };
    };


    $scope.queryForGridChildren = function (data, path) {
        if (!$scope.queryData) {
            $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.projectInfoPagesChildren.columnDefs;
        }
        layer.load(2);
        $http.post($scope.localizedPath + "projectInformation/referTo",{
            data: angular.toJson(data),
            page: $scope.gridApi ? $scope.gridApi.page : $scope.projectInfoPagesChildren.page,
            pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.projectInfoPagesChildren.pageSize,
            fields: angular.toJson($scope.queryData)
        }).success(function (response) {
            if (response.code == 200) {
                if (!$scope.query) {
                    $scope.query = $scope.projectInfoPagesChildren.columnDefs;
                }
                $scope.projectInfoPagesChildren.data = response.result.Rows;
                $scope.projectInfoPagesChildren.totalItems = response.result.Total;
            }
            layer.closeAll('loading');
        });
    };
    $scope.onQueryChildren = function () {
        $scope.queryForGridChildren($scope.QUERYCHILDREN, $scope.queryPath);
    };
    $scope.onResetChildren = function () {
        $scope.QUERYCHILDREN = $scope.initQUERYChildren();
    };


    $scope.initFunction = function () {

        /**
         * 确定
         * */
        $scope.onConfirm = function () {

            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});
            // var ids = [];
            // for (var i = 0; i < rows.length; i++) {
            //     ids.push(rows[i].CONTRACTNUMBER);
            // }
            // $http.post($scope.basePath + "economicContract/fileFindOne",{
            //     pks: angular.toJson(ids),
            // }).success(function (response) {
            //     if (response.code==200){
            //         if(response.result&&response.result.length>0){
            //             for (let j = 0; j <response.result.length ; j++) {
            //                 $scope.projectInfoGridOptions.data.push(response.result[j]);
            //             }
            //         }
            //     }
            // });
            $scope.projectInfoGridOptions.data = rows;
            $scope.VO.projectInfo = $scope.projectInfoGridOptions.data;
            ngDialog.close();
        };
        $scope.onCancel = function () {
            ngDialog.close($scope.ngDialogId);
        };


    };
    //监听数据变化
    $scope.initWatch = function () {
        $scope.$watch('VO.projectInfo', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if($scope.VO.projectInfo&&$scope.VO.serviceDate&&$scope.VO.serviceType) {
                    var serviceType = "";
                    for(let i = 0; i<getSelectOptionData.SERVICETYPE.length;i++){
                        if(getSelectOptionData.SERVICETYPE[i].id == $scope.VO.serviceType){
                            serviceType = getSelectOptionData.SERVICETYPE[i].name;
                        }
                    }
                    if($scope.VO.projectInfo.length > 1){
                        $scope.VO.serviceName = $scope.VO.projectInfo[0].customer_name + "等" + $scope.VO.serviceDate + "的" + serviceType + "服务";
                    }
                    if($scope.VO.projectInfo.length == 1){
                        $scope.VO.serviceName = $scope.VO.projectInfo[0].customer_name + $scope.VO.serviceDate + "的" + serviceType + "服务";
                    }
                }
            }
        }, true);
        $scope.$watch('VO.serviceDate', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if($scope.VO.projectInfo&&$scope.VO.serviceDate&&$scope.VO.serviceType) {
                    var serviceType = "";
                    for(let i = 0; i<getSelectOptionData.SERVICETYPE.length;i++){
                        if(getSelectOptionData.SERVICETYPE[i].id == $scope.VO.serviceType){
                            serviceType = getSelectOptionData.SERVICETYPE[i].name;
                        }
                    }
                    if($scope.VO.projectInfo.length > 1){
                        $scope.VO.serviceName = $scope.VO.projectInfo[0].customer_name + "等" + $scope.VO.serviceDate + "的" + serviceType + "服务";
                    }
                    if($scope.VO.projectInfo.length == 1){
                        $scope.VO.serviceName = $scope.VO.projectInfo[0].customer_name + $scope.VO.serviceDate + "的" + serviceType + "服务";
                    }
                }
            }
        }, true);
        $scope.$watch('VO.serviceType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if($scope.VO.projectInfo&&$scope.VO.serviceDate&&$scope.VO.serviceType) {
                    var serviceType = "";
                    for(let i = 0; i<getSelectOptionData.SERVICETYPE.length;i++){
                        if(getSelectOptionData.SERVICETYPE[i].id == $scope.VO.serviceType){
                            serviceType = getSelectOptionData.SERVICETYPE[i].name;
                        }
                    }
                    if($scope.VO.projectInfo.length > 1){
                        $scope.VO.serviceName = $scope.VO.projectInfo[0].customer_name + "等" + $scope.VO.serviceDate + "的" + serviceType + "服务";
                    }
                    if($scope.VO.projectInfo.length == 1){
                        $scope.VO.serviceName = $scope.VO.projectInfo[0].customer_name + $scope.VO.serviceDate + "的" + serviceType + "服务";
                    }
                }
            }
        }, true);
    }
    $scope.initData();
    $scope.initFunction();
    $scope.initWatch();
});
