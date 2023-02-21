app.controller('specialDataReviseCtrl', function ($rootScope, $scope,$sce, $http,$state,$window, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                dr: 0,
                billstatus:31,
                isContinue: 0,
                reviseData: [],
                dealAttachmentB: [],
                nodeTreeName:'',
            };
        };
        $scope.entityVO = 'nc.vo.busi.specialDataReviseVO';
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "id": $stateParams.id,
            }
        };
        $scope.funCode ="1601";
        $scope.QUERY = $scope.initQUERY();
    };

    $scope.initHttp = function () {

        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "specialDataRevise/queryForGrid", {
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
                layer.closeAll('loading');
            });
        };

        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "specialDataRevise/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.reviseDataGridOptions.data = $scope.VO.reviseData;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    if (callback) {
                        callback;
                    }
                    ;

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
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO.pkOperator = $rootScope.userVO;
            $scope.VO.reviseData = $scope.reviseDataGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $http.post($scope.basePath + "specialDataRevise/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        $scope.isDisableds = true;
                        $scope.isUpdate = false;
                        angular.assignData($scope.VO, response.result);
                        if ($rootScope.specialData!=null){
                            $rootScope.specialData=null;
                        }
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                    }
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
                });
        };
    };
    $scope.initFunction = function () {
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function (item) {
            if (item && item.id) {
                $scope.onCard(item.id);
            }

        };
    };

    $scope.initWatch = function () {

    };

    $scope.initButton = function () {

        $scope.onAdd = function () {
            $scope.form = true;
            $scope.isGrid = false;
            $scope.isClear = true;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.isBack = true;
            $scope.initView();

            angular.assignData($scope.VO, $scope.VO);
            $scope.VO.nodeTreeName = $scope.VO.nodeTreeName;
           // $scope.reviseDataGridOptions.data = [];
            $scope.dealAttachmentBGridOptions.data = [];
        };

        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isBack = false;
            $scope.isClear = false;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form = true;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id, function () {
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.isContinue = false;
                });

            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            }
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
                        angular.forEach(value, function (item) {
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });
                    }
                }
            }, function (reason) {

            });
        };

        $scope.onDownLoads = function () {
            var selectTabName = $scope.selectTabName;
            var rows = $scope[selectTabName].gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return angular.alert("请选择一条单据进行操作！");
            var ids = [];
            if (selectTabName == 'dealAttachmentBGridOptions') {
                for (var i = 0; i < rows.length; i++) {
                    ids.push(rows[i].pk_project_id);
                }
            }
            var exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
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
            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {
                pk: id,
                tableName: $scope.table_name,
                billdef: $scope.billdef
            }).success(function (response) {
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    if (!response.result.taskHis)
                        $scope.mess = false;
                    else
                        $scope.mess = true;
                    //查询是否修改过数据
                    $http.post($scope.basePath + "superUpdateContorller/findForView", {
                        specialId: $scope.VO.id,
                        billid: $scope.VO.reviseData[0].id
                    }).success(function (response) {
                        if (response.data) {
                            $scope.changeData = response.data;
                            $scope.VO.reviseType = 3;
                        }else{
                            $scope.changeData = null;
                        }
                        $scope.card = true;
                        $scope.isBack = true;
                        $scope.isGrid = false;
                        $scope.isCard = true;
                    })
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
         * 取消功能
         */
        $scope.onCancel = function () {
            if ($scope.isClear) {
                $scope.VO = $scope.initVO();
            }
            $scope.isDisabled = true;
            $scope.isDisableds = true;
            $scope.isEdit = false;
            $scope.isBack = false;
        };

        /**
         * 返回
         */
        $scope.onBack = function () {
            if ($stateParams.id) {
                window.history.back(-2);
                return;
            }
            //清空特殊修改数据
            $scope.changeData = null;
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
         * 暂存
         * */
        $scope.onTemporary = function (data) {
            $scope.VO.reviseData = $scope.reviseDataGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            if (data) {
                let tablename = $scope.table_name;
                $http.post($rootScope.basePath + "temporary/insert", {
                    data: angular.toJson(data),
                    tablename: tablename
                }).success(function (response) {
                    if (response.code == 200) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        $scope.isDisableds = true;
                        angular.assignData($scope.VO, response.result);
                        if ($rootScope.specialData!=null){
                            $rootScope.specialData=null;
                        }
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                        return layer.alert('暂存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                });
            }
        };


        /**
         * 保存 提交判断必输项
         * */
        $scope.onSave = function () {
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {

                    if ($scope.VO.reasons==null){
                        return layer.alert("请先填写修改原因!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.reviseDataGridOptions.data.length==0){
                        return layer.alert("修改数据列表不能为空",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.dealAttachmentBGridOptions.data.length==0){
                        return layer.alert("请上传附件",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    //判断修改数据列表中多条数据，单号是否有重复的。
                    var array = $scope.reviseDataGridOptions.data;
                    flag = true;   //假设不重复
                    if (array.length>1){
                        for (let i = 0; i < array.length-1; i++) {
                            for (let j = i+1; j < array.length; j++) {
                                if (array[i].addNumber == array[j].addNumber){
                                    flag = false;
                                    return layer.alert("修改数据列表中有多个重复的单号数据",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }

                        }
                    }
                      if ($scope.VO.billstatus == 37) {
                        $scope.VO.billstatus = 31;
                    }
                    $scope.onSaveVO();
                }
            }, true);
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


        /**
        * 修改数据
        * */
        $scope.onSpecialRevise = function (id) {
            //1.传按钮的id
            var app="";
            var id = id;
            //2.获取页面的节点名称，根据名称选择app
            var nodetreeName = $scope.VO.nodeTreeName;
            //3.根据节点名称拼接url
            if (nodetreeName == "客户培训计划申报"){
                app="app.busManage.customerService.trainManage.customerTrain";
            }else if (nodetreeName == "团体客户经纪业务立项"){
                app="app.busManage.busDevelop.busProject.propertyProject";
            }else if (nodetreeName == "个人客户业务立项"){
                app="app.busManage.busDevelop.busProject.personalProject";
            }else if (nodetreeName=="批量报送业务立项"){
                app="app.busManage.busDevelop.busProject.batchProject";
            }else if (nodetreeName=="业务签报管理"){
                app="app.busManage.busSign.report";
            }else if (nodetreeName=="批量业务签报管理"){
                app="app.busManage.busSign.batchReport";
            }else if (nodetreeName=="业务文件申报审批"){
                app="app.busManage.docDeclaration.businessExamine";
            }else if (nodetreeName=="客户培训总结"){
                app="app.busManage.customerService.trainManage.trainPlanSummarize";
            }else if (nodetreeName =="咨询费管理"){
                app="app.contManage.consult";
            }else if (nodetreeName=="股东业务月度计划"){
                app="app.busManage.monthlyPlanAndAccountsReceivable.sum1";
            }else if (nodetreeName == "非股东业务月度计划"){
                app="app.busManage.monthlyPlanAndAccountsReceivable.sum2";
            }else if (nodetreeName =="出单通知书"){
                app="app.contManage.issueNotice.issueNotice";
            }else if (nodetreeName =="团意险出单通知书"){
                app="app.contManage.issueNotice.issueNoticeGlife";
            }else if (nodetreeName =="电网资产保险方案"){
                app="app.busManage.docDeclaration.shareholders.insuranceScheme";
            }else if (nodetreeName =="电网资产团意险保险方案"){
                app="app.busManage.docDeclaration.shareholders.insuranceSchemeGlife";
            }else if (nodetreeName =="财产险保单信息"){
                app="app.contManage.policyInfo.property.propertyInsurance";
            }

            //先判断数据中是否含有"特殊修改状态"
            $http.post($scope.basePath + "specialDataRevise/judgeStatus",{
                id:id,
                nodetreeName:nodetreeName,
            }).success(function (response) {
                if (response.code == 200) {
                    //审核通过的单据才可以
                    if ($scope.VO.billstatus == 34){
                        var url=$state.href(app,{'ids':id},{});
                        $rootScope.specialById = id;
                        $rootScope.specialId = $scope.VO.id;
                        window.open(url,'_self');
                    }else {
                        return layer.alert("审核通过的单据才可以进行修改数据功能!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                }else {
                    return layer.alert("此数据已做过修改数据操作!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });

        };

        $scope.onDiscardData = function(){
            return layer.alert("审核通过的数据会直接作废!",
                {skin: 'layui-layer-lan', closeBtn: 1});
        };

        /**
         * 删除
        * */
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
                    $http.post($scope.basePath + "specialDataRevise/delete", {ids: angular.toJson(ids)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg('删除成功!', {
                                icon: 1
                            });
                        }

                    });
                }
            );
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
            exporterCsvFilename: '特殊修改信息.csv',
            columnDefs: [
                {name: 'billNumber', displayName: '单据编号'},
                {name: 'reviseType', displayName: '修改类型', cellFilter: 'SELECT_REVISETYPE'},
                {name: 'nodeTreeName', displayName: '节点名称',},
                {name: 'pkOrg.name', displayName: '发起机构名称',},
                {name: 'pkDept.name', displayName: '部门名称',},
                {name: 'pkOperator.name', displayName: '申请人',},
                {name: 'billstatus', displayName: '单据状态',cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkAuditor.name', displayName: '审核人',},
                {name: 'operateDate', displayName: '制单日期', cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'operateTime', displayName: '制单时间',},
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


        //特殊数据修改
        $scope.selectTabName = 'reviseDataGridOptions';
        $scope.reviseDataGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            rowHeight: 35,
            columnDefs: [
                {name: 'addNumber', displayName: '单号', },
                {name: 'billstatus', displayName: '单据状态',cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator_name', displayName: '录入人'},
                {name: 'operateDate', displayName: '录入日期', cellFilter: 'date:"yyyy-MM-dd"'},
                { name: 'pkChecker_name', displayName: '审核人',},
                {name: 'checkDate', displayName: '审核日期',cellFilter: 'date:"yyyy-MM-dd"'},

            ],
            data: $scope.VO.reviseData,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.reviseDataGridOptions = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.reviseDataGridOptions.gridApi = gridApi;
                    if (gridApi.edit) {
                        gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        })
                    }
                }
                $scope.reviseDataGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };


        //其他附件
        $scope.selectTabName = 'dealAttachmentBGridOptions';
        $scope.dealAttachmentBGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {name: 'attachment_name', displayName: '附件名称', enableCellEdit: false},
                {
                    name: 'cUpdate', displayName: '上载时间', enableCellEdit: false
                },
            ],
            data: $scope.VO.dealAttachmentB,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.dealAttachmentBGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.dealAttachmentBGridOptions.gridApi = gridApi;
                    if (gridApi.edit) {
                        gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        })
                    }
                }
                $scope.dealAttachmentBGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };

        //获取不同节点传来的值
        function getQueryVariable(){
            let json = $rootScope.specialData;
            if (json !=null){
                let specialData =JSON.parse(json);
                if (specialData.length>0){
                    return  specialData;
                }
            }
            return null;
        }

        if (null!=getQueryVariable()) {
            var jsons = getQueryVariable();
            $scope.reviseDataGridOptions.data=jsons;
            $scope.VO.nodeTreeName = jsons[0].nodeTreeName;
            $scope.onAdd(getQueryVariable());
        }
        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }

    };



    $scope.table_name = "lr_special_revise";
    $scope.billdef = "SpecialDataRevise";
    $scope.beanName = "insurance.SpecialDataReviseServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initworkflow($scope, $http,ngDialog);
    initonlineView($scope,$rootScope,$sce,$http,ngDialog);
});


app.controller('addQueryDataCtrl', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {
    /**
     * 初始化页面变更方法
     */
    $scope.initQUERYChildren = function () {
        return {

        }
    };
    $scope.QUERYCHILDREN = $scope.initQUERYChildren();

    $scope.initData = function () {
        //查询信息子表
        $scope.VO.queryData = [];
        $scope.queryDataGridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            useExternalPagination: true,
            columnDefs: [
                {name: 'addNumber', displayName: '单号',},
                {name: 'billstatus', displayName: '单据状态',cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator_name', displayName: '录入人',},
                {name: 'operateDate', displayName: '录入日期',},
                {name: 'pkChecker_name', displayName: '审核人',},
                {name: 'checkDate', displayName: '审核日期',},
            ],
            data: $scope.VO.queryData
        };
        $scope.queryDataGridOptions.onRegisterApi = function (gridApi) {
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


    $scope.queryForGridChildren = function (data, path) {
        if (!$scope.queryData) {
            $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.queryDataGridOptions.columnDefs;
        }
        layer.load(2);
        var params ={};
        var addNumbers = data.addNumbers;
        var nodeTreeName = $scope.VO.nodeTreeName;
        params.addNumbers = addNumbers;
        params.nodeTreeName = nodeTreeName;
        /*   params.push("addNumbers",addNumbers);
           params.push("nodeTreeName",nodeTreeName);*/
        if (nodeTreeName==null){
            return layer.alert("请根据页面中的节点名称进行单号查询!",
                {skin: 'layui-layer-lan', closeBtn: 1});
        }
        if (addNumbers==null){
            return layer.alert("请填写要查询的单号!",
                {skin: 'layui-layer-lan', closeBtn: 1});
        }
        $http.post($scope.basePath + "specialDataRevise/queryForId", {
            params: angular.toJson(params),
            page: $scope.gridApi ? $scope.gridApi.page : $scope.queryDataGridOptions.page,
            pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.queryDataGridOptions.pageSize,
            fields: angular.toJson($scope.queryData)
        }).success(function (response) {
            if (response.code == 200) {
                if (!$scope.query) {
                    $scope.query = $scope.queryDataGridOptions.columnDefs;
                }
                if (response.result.Rows.length==0){
                    return layer.alert("请检查该节点下此单号是否填写正确!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }else {
                    $scope.queryDataGridOptions.data = response.result.Rows;
                }

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
         * 保存
         */
        $scope.onConfirm = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows|| rows.length != 1) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});
            $scope.reviseDataGridOptions.data.push(rows[0]);
            $scope.VO.reviseData = $scope.reviseDataGridOptions.data;
            ngDialog.close();
        };

        $scope.onCancel = function () {
            ngDialog.close($scope.ngDialogId);
        };


    };
    $scope.initData();
    $scope.initFunction();
});


