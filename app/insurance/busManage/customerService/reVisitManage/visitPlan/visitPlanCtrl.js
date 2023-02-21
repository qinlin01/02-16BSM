/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('visitPlanCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                visitPlanB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                dr: 0,
                billstatus:28,
                planYear: parseInt(new Date().getFullYear()),
                planMonth: parseInt(new Date().getMonth() + 1),
                costscale: [],
                coomedium: []
            };
        };
        $scope.entityVO = 'nc.vo.busi.VisitPlanVO';
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
       $scope.initQUERY = function () {
            return { "operate_year": new Date().format("yyyy")}
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode ='2070301';
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "visitPlan/queryForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response.code == 200) {
                    if (!$scope.query) {
                        $scope.query = $scope.gridOptions.columnDefs;
                    }
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            });
        };
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + "visitPlan/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                } else {
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
                    //layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };

        /*
         * 保存VO
         * */
        $scope.onConfirmVO = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "visitPlan/confirm", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    if (response) {
                        if($scope.isCard){
                            $scope.onCard();
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }else{
                            $scope.isGrid = false;
                            $scope.isBack = false;
                            $scope.isEdit = false;
                            $scope.isDisabled = true;
                            angular.assignData($scope.VO, response.result);
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                            layer.closeAll('loading');
                            $scope.isSubEdit = false;
                        }

                    }
                });
        };

        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {

            layer.load(2);
            $http.post($rootScope.basePath + "visitPlan/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
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
                  //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                });
        };

        /**
         * 查询审批流信息
         */
        $scope.queryWorkFlow = function (pkProject, fun) {
        };
        /**
         * 查询审批流信息
         */
        $scope.queryFlowInfo = function (pkProject, fun) {

        };
        /**
         * 查询审批流信息
         */
        $scope.queryAuditFlowInfo = function (pkProject, fun) {
        };
        /*
         * 提交
         * */
        $scope.submit = function (pkProject, msg, selects, _pass) {
        };
        /*
         * 提交
         * */
        $scope.audit = function (pkProject, msg, selects, _pass, type) {
        };
    };

    $scope.initFunction = function () {
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function (item) {
            if(item && item.id){
                $scope.onCard(item.id);
            }

        };
    };

    $scope.initWatch = function () {

        $scope.$watch('VO.planYear', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                layer.load(2);
                $http.post($scope.basePath + "visitPlan/saveBefore", {data: angular.toJson($scope.VO)}).success(function (response) {
                    layer.closeAll('loading');
                    if (response && response.code == "200") {
                        $scope.visitPlanBGridOptions.data = response.result;
                    }

                });
            }
        }, true);

        $scope.$watch('VO.planMonth', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                layer.load(2);
                $http.post($scope.basePath + "visitPlan/saveBefore", {data: angular.toJson($scope.VO)}).success(function (response) {
                    layer.closeAll('loading');
                    if (response && response.code == "200") {
                        $scope.visitPlanBGridOptions.data = response.result;
                    }

                });
            }
        }, true);
    };

    $scope.initButton = function () {
        /**
         * 打印
         * @returns {*}
         */
        $scope.onPrint = function() {
            $scope.raq = "visitPlan";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $http.post($rootScope.basePath + "visitPlan/print", {data: angular.toJson(rows[0]),raq:$scope.raq,type : "PDF"}).success(function (response) {
                layer.closeAll('loading');
                // if(fun) fun(response);
                if(response.code == 200){
                    window.open(getURL(response.queryPath));
                }
            });

        }

        /**
         * 退回
         */
        $scope.onRollback = function(){
            var result;
            layer.confirm('是否确定退回此信息？', {
                    btn: ['是', '否'], //按钮
                    btn2: function (index, layero) {
                        layer.closeAll('loading');
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    if($scope.isGrid){
                        var row = $scope.gridApi.selection.getSelectedRows();
                        if (!row || row.length != 1)
                            return layer.alert("请选择一条数据进行操作!", {
                                skin: 'layui-layer-lan',
                                closeBtn: 1
                            });
                        result = row[0];
                    }else{
                        result = $scope.VO;
                    }
                    $http.post($scope.basePath + "visitPlan/rollback", {data: angular.toJson(result)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            if($scope.isGrid){
                                $scope.queryForGrid($scope.QUERY);
                            }else if(!$scope.isGrid&&!$scope.isCard){
                                $scope.findOne(response.result.id);
                            }else{
                                $scope.onCard();
                            }

                            layer.alert('操作成功！', {skin: 'layui-layer-lan', closeBtn: 1});
                        }

                    });
                }
            );
        }

        /**
         * 确认完成
         */
        $scope.onConfirm = function(){
            layer.confirm('点击【确认完成】按钮后，数据生效并且不能进行修改和删除操作，是否继续？', {
                    btn: ['是', '否'], //按钮
                    btn2: function (index, layero) {
                        layer.closeAll('loading');
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    $scope.flag = true;
                    if($scope.visitPlanBGridOptions.data){
                        angular.forEach($scope.visitPlanBGridOptions.data,function (item) {
                            if (!item.visitDate||!item.visitors){
                                $scope.flag = false;
                                return;
                            }
                        })
                    }else {
                        $scope.flag = false;
                    }
                    if($scope.flag){
                        $scope.VO.visitPlanB = $scope.visitPlanBGridOptions.data;
                        $scope.onConfirmVO();
                        layer.closeAll('loading');
                    }
                    else {
                        return layer.alert("子表属性回访日期或回访执行人不能为空!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                }
            );
        }

        /**
         * 过滤查询功能
         */
        /*$scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };*/


        /***
         * 查看
         */
        $scope.onView = function () {

            //  控制字表按钮的显示
            $scope.isEdit = false;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                // layer.load(2);
                $scope.findOne(rows[0].id, function (response) {
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isEdit = false;
                    $scope.isDisabled = true;
                });
            }
        };

        $scope.onSubmit = function () {
            var pkProject;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                if (rows[0].billstatus != 37) return layer.alert("只有暂存状态可以提交!", {skin: 'layui-layer-lan', closeBtn: 1});
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 37) return layer.alert("只有暂存状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            $scope.queryFlowInfo(pkProject, function (response) {
            });
            // // alert(msg)
            // ngDialog.open({
            //     template: '../app/activiti-modal/tpl/approval.html',
            //     className: 'ngdialog-theme-formInfo',
            //     controller: 'approvalController',
            //     data: {
            //         config: _config
            //     },
            //     closeByDocument: true,
            //     closeByEscape: true,
            //     cache:false
            // });
        };


        $scope.onLinkAuditFlow = function () {
            var pkProject;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
            }
            ;
        };

        $scope.onAudit = function () {
            var pkProject;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                if (rows[0].billstatus != 33 && rows[0].billstatus != 36) return layer.alert("只有审批中或驳回状态可以审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 33 && rows[0].billstatus != 36) return layer.alert("只有审批中或驳回状态可以审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            ;


        };
        $scope.onCard = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1)
                return layer.alert("请选择一条数据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {pk:rows[0].id,tableName:$scope.table_name,billdef:$scope.billdef}).success(function (response)  {
                if (response && response.code == "200") {
                    $scope.card=true;
                    angular.assignData($scope.VO, response.result);
                    if(!response.result.taskHis)
                        $scope.mess=false;
                    else
                        $scope.mess=true;
                    $scope.isBack = true;
                    $scope.isGrid = false;
                    $scope.isCard = true;

                } else {
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
                  //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };

        $scope.onAdd = function () {
            $scope.form=true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.isClear = true;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
            layer.load(2);
            $http.post($scope.basePath + "visitPlan/saveBefore", {data: angular.toJson($scope.VO)}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    $scope.visitPlanBGridOptions.data = response.result;
                }

            });
        };
        /**
         * 修改
         */
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
                    $http.post($scope.basePath + "visitPlan/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
        /*
         * 关联
         * */
        $scope.onLink = function () {

        };

        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            if($scope.isClear){
                $scope.VO = $scope.initVO();
            }
            $scope.isDisabled = true;
            $scope.isEdit = false;
            $scope.isBack = false;
        };
        /**
         * 返回
         */
        $scope.onBack = function () {
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isDisabled = true;
            //阻止页面渲染
            $scope.form=false;
            $scope.card=false;
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
                    $scope.flag = true;
                    if($scope.visitPlanBGridOptions.data){
                        angular.forEach($scope.visitPlanBGridOptions.data,function (item) {
                            if (!item.visitDate||!item.visitors){
                                $scope.flag = false;
                                return;
                            }
                        })
                    }else {
                        $scope.flag = false;
                    }
                    if($scope.flag){
                        $scope.VO.visitPlanB = $scope.visitPlanBGridOptions.data;
                        $scope.onSaveVO();
                    }
                    else {
                        return layer.alert("子表属性回访日期或回访执行人不能为空!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }

                }
            }, true);
        };

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            if($scope.QUERY["operate_date^gte"]&&$scope.QUERY["operate_date^lte"]){
                if(new Date($scope.QUERY["operate_date^gte"]) > new Date($scope.QUERY["operate_date^lte"])){
                    return layer.alert("结束时间必须大于开始时间!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
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
         * 子表新增
         */
        $scope.onAddLine = function () {
            $scope[$scope.selectTabName].data.push({
                scopeType: $rootScope.SELECT.VISITSCOPETYPE[1].id
            });

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
    };

    $scope.initPage = function () {
        $scope.form=false;
        $scope.card=false;
        $scope.isClear = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;

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
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '客户回访计划管理.csv',
            columnDefs: [
                {name: 'serialNo', displayName: '客户回访计划编号', width: 100,},
                {name: 'planYear', displayName: '回访计划年度', width: 100, cellFilter: 'SELECT_BUSIYEAR'},
                {name: 'planMonth', displayName: '回访计划月度', width: 100, cellFilter: 'SELECT_MARMONTH'},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '业务部门', width: 100,},
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'operateDate', displayName: '制单日期', width: 100,},
                {name: 'operateTime', displayName: '制单时间', width: 100,},
            ],
            data: []
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
                    if(!$scope.chilbTable){
                        $scope.chilbTable=true;
                    }
                    angular.assignData($scope.VO, row.entity);
                    $scope.findOne(rows[0].id);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });


        };

        $scope.selectTabName = 'visitPlanBGridOptions';
        $scope.VO.visitPlanB = [];
        $scope.visitPlanBGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'scopeType', displayName: '考核范围', width: 100, cellFilter: 'SELECT_VISITSCOPETYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.VISITSCOPETYPE,enableCellEdit: false
                },
                {
                    name: 'pkCustomer.name', displayName: '客户名称', width: 100, url: 'customerAgentRef/queryForGridS'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'pkCustomer', cellEditableCondition: function ($scope) {
                    if($scope.row.entity.scopeType==1){
                        return false;
                    }else {
                        return true;
                    }
                }

                },
                {
                    name: 'customerDept', displayName: '客户相关部门/单位', width: 100


                },
                {

                    name: 'visitDate', displayName: '回访日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , editableCellTemplate: 'ui-grid/refDate'


                },
                {
                    name: 'visitors', displayName: '回访执行人', width: 100


                },
                {
                    name: 'visitTask', displayName: '回访任务', width: 100


                },
                {
                    name: 'remarks', displayName: '备注', width: 100


                }
            ],
            data: $scope.VO.visitPlanB,
            onRegisterApi: function (gridApi) {
                $scope.visitPlanBGridOptions.gridApi = gridApi;
            }
        };


        if ($stateParams.pk != null) {
            $scope.queryForGrid({});
        } /*else {
            $scope.queryForGrid();
        }*/
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
    };

    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.table_name = "lr_visit_plan";
    $scope.billdef = "VisitPlan";

});
app.controller('printCtrl', function ($scope, $rootScope, $http, ngDialog, FileUploader, ngVerify, $compile,$timeout) {

    $scope.queryPrint = function () {
        $http.post($scope.basePath + "visitPlan/print", {data: angular.toJson($scope.VO)}).success(function (response) {
            layer.closeAll('loading');
            if (response.code == 200) {
                var html = $compile(response.result)($scope);
                html.appendTo('#printHtml');
                // $scope.$parent.confirm(response);
                // layer.msg(response.msg);

            }

        });
    }
    $scope.queryPrint();
    $scope.print = function () {
        $scope.print = function(){
            
            //获取当前页的html代码
            var bodyhtml = window.document.body.innerHTML;
            //设置打印开始区域、结束区域
            var startFlag = "<!--startprint-->";
            var endFlag = "<!--endprint-->";
            // 要打印的部分
            var printhtml = bodyhtml.substring(bodyhtml.indexOf(startFlag),
                bodyhtml.indexOf(endFlag));
            // 生成并打印ifrme
            var f = document.getElementById('printf');
            f.contentDocument.write(printhtml);
            f.contentDocument.close();
            f.contentWindow.print();
        }
    }
    $scope.onPrint = function () {
        $scope.print();
    }
});