/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('assessorsProjectCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog,$location) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                costscale: [],
                member: [],
                follow: [],
                sign: [],
                consult: [],
                close: [],
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                pkCorp: $rootScope.orgVO,
                cProdep: $rootScope.deptVO,
                cServerdep: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                dr: 0,
                billstatus:31,
                c1Rente: 'N',
                costscale: [],
                coomedium: []
            };
        };
        $scope.entityVO = 'nc.vo.busi.TheprojectVO';
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.funCode ='30101';
        $scope.colEdit = true;
        //初始化查询
       $scope.initQUERY = function () {
            return { 
			"operate_year": parseInt(new Date().format("yyyy")),
                "id":$stateParams.id
            }
        };

        $scope.QUERY = $scope.initQUERY();
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "assessorsProject/queryForGrid", {
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
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + "assessorsProject/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    if (callback) callback();
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
                   // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO['trade_type'] = $scope.VO.cProtypepk.code
            $http.post($rootScope.basePath + "assessorsProject/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
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
                 //   layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
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

        $scope.$watch('VO.natureTypes', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['natureTypesName'] = $rootScope.SELECT.NATURETYPES[newVal-1].name;
            }
        }, true);

        $scope.$watch('VO.vdef1', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if($scope.VO.vdef1 == 4){
                    $scope.VO['vdef1Name'] = $rootScope.SELECT.PROJECTCUSTOMERTYPE[0].name;
                }else if($scope.VO.vdef1 == 3){
                    $scope.VO['vdef1Name'] = $rootScope.SELECT.PROJECTCUSTOMERTYPE[2].name;
                }else if($scope.VO.vdef1 == 1){
                    $scope.VO['vdef1Name'] = $rootScope.SELECT.PROJECTCUSTOMERTYPE[1].name;
                }
                $scope.VO.cInsureman = null;
                $scope.VO.c0Tradetype = null;
                if(newVal==3){
                    $scope.paramRef = {
                        c0Type1:3,
                        c0Type2: null
                    };
                }
                if(newVal==1) {
                    $scope.paramRef = {
                        c0Type1: 1,
                        c0Type2: 2
                    };
                }
                if(newVal==4) {
                    $scope.paramRef = {
                        c0Type1: 4,
                        c0Type2: null
                    };
                }
            }
        }, true);

        $scope.$watch('VO.cInsureman.name', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.cInsureman.c_0_address) {
                    $scope.VO.cProaddress = $scope.VO.cInsureman.c_0_address;
                } else {
                    $scope.VO.cProaddress = "";
                }
                if ($scope.VO.cInsureman.pk) {
                    $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: $scope.VO.cInsureman.pk}).success(function (response) {
                        if (response && response.code == "200") {
                            if (response.result.tradetype != null) {
                                $scope.VO.c0Tradetype = response.result.tradetype.name;
                            }
                        }
                    });
                } else {
                    $scope.VO.c0Tradetype = "";
                }
            }
          
        }, true);
        $scope.$watch('VO.cProtypepk', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.colEdit = false;
                if(newVal != oldVal ){
                    $scope.VO.busi_type = null;
                }
            }
        }, true);
    };

    $scope.initButton = function () {

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
                    // var data = $scope.getVOTms();

                    //  第一次初始化成null，后台没值，应该【】
                    if ($scope.dealAttachmentBGridOptions.data) {
                        angular.forEach(value, function (item) {
                            item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });

                    } else {
                        // $scope[selectTabName].data = [];
                        // $scope[selectTabName].data.push(value);
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
            exportEx.attr('target','_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action',$rootScope.basePath+'uploadFile/downloadFiles');
            exportEx.submit();
        };

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };


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
                $scope.findOne(rows[0].id);
                $scope.isBack = true;
                $scope.isGrid = false;
                $scope.isCard = true;
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
                if (rows[0].billstatus != 31) return layer.alert("只有未上报状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 31) return layer.alert("只有未上报状态可以提交!", {
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


       /* $scope.onLinkAuditFlow = function () {
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
        };*/

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

        $scope.onAdd = function () {
            $scope.form=true;
            $scope.isClear = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
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
        /**
         * 暂存
         */
        $scope.onTemporary = function (data) {
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            if (data) {
                var tablename = $scope.table_name;
                $http.post($rootScope.basePath + "temporary/insert", {
                    data: angular.toJson(data),
                    tablename: tablename
                }).success(function (response) {
                    if (response.code == 200) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                        return layer.alert('暂存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                });
            }
        }
        /**
         * 卡片
         */
        $scope.onCard = function (id) {
            if(!id){
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1)
                return layer.alert("请选择一条数据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                id = rows[0].id;
            }
            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {pk:id,tableName:$scope.table_name,billdef:$scope.billdef}).success(function (response)  {
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
                   // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };

        /*$scope.onCard = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1)
                return layer.alert("请选择一条数据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            $scope.findOne(rows[0].id);
            $scope.isBack = true;
            $scope.isGrid = false;
            $scope.isCard = true;
        };*/
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
                    $http.post($scope.basePath + "assessorsProject/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
            if($stateParams.id) {
                window.history.back(-2);
                return;
            }
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
                    $scope.VO.natureTypesName = $rootScope.returnSelectName($scope.VO.natureTypes,"NATURETYPES");
                    $scope.VO.vdef1Name = $rootScope.returnSelectName($scope.VO.vdef1,"PROJECTCUSTOMERTYPE");
                    $scope.VO.c1RenteName = $rootScope.returnSelectName($scope.VO.c1Rente,"YESNO");
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
         * 子表新增
         */
        $scope.onAddLine = function () {
            $scope[$scope.selectTabName].data.push({});

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
        $scope.isClear = false;
        $scope.card=false;
        $scope.ifShow = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;
        //控制附件上传和下载
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
            columnDefs: [
                {name: 'cProdep.name', displayName: '项目开发部门', width: 100,},
                {name: 'cServerdep.name', displayName: '项目服务部门', width: 100,},
                {name: 'cProaddress', displayName: '项目服务地址', width: 100,},
                {name: 'vbillno', displayName: '立项号', width: 100,},
                {name: 'vdef1', displayName: '立项对象类型', width: 100, cellFilter: 'SELECT_PROJECTCUSTOMERTYPE'},
                {name: 'cProname', displayName: '项目名称', width: 100,},
                {name: 'cInsureman.name', displayName: '客户名称', width: 100,},
                {name: 'cInsureman.c_0_address', displayName: '客户地址', width: 100,},
                {name: 'c0Tradetype', displayName: '所属行业', width: 100,},
                {name: 'cCommendinsure', displayName: '推介业务', width: 100,},
                {name: 'cperiod_new', displayName: '项目周期(月)', width: 100,},
                {name: 'fEstimateincome', displayName: '预计业务收入(元)', width: 100,},
                {name: 'cChargedep', displayName: '控股方', width: 100,},
                {name: 'cProintro', displayName: '项目介绍', width: 100,},
                {name: 'c0Insure', displayName: '社会保险情况', width: 100,},
                {name: 'businessTypes.name', displayName: '业务类型', width: 100,},
                {name: 'natureTypes', displayName: '业务性质', width: 100, cellFilter: 'SELECT_NATURETYPES'},
                {name: 'assessment.name', displayName: '主办公估师', width: 100,},
                {name: 'c1Rente', displayName: '建立企业年金情况', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'cMemo', displayName: '备注', width: 100,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'operateDate', displayName: '制单日期', width: 100,},
                {name: 'operateTime', displayName: '制单时间', width: 100,},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '部门', width: 100,},
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

        $scope.selectTabName = 'costscaleGridOptions';
        $scope.costscaleGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'cCommendinsurepk.name', displayName: '推介险种', width: 100, url: 'insuranceRef/queryForGrid'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'cCommendinsurepk',isTree: true

                },
                {
                    name: 'fProscale', displayName: '项目费用拨付比例(%)', width: 100


                },
                {
                    name: 'cComment', displayName: '审核评语', width: 100


                },
            ],
            data: $scope.VO.costscale,
            onRegisterApi: function (gridApi) {
                $scope.costscaleGridOptions.gridApi = gridApi;
            }
        };
        $scope.memberGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'cName', displayName: '姓名', width: 100


                },
                {
                    name: 'cPosition', displayName: '职位', width: 100


                },
                {
                    name: 'cRoleNO', displayName: '项目角色', width: 100, cellFilter: 'SELECT_PROJECTROLE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.PROJECTROLE
                },
            ],
            data: $scope.VO.member,
            onRegisterApi: function (gridApi) {
                $scope.memberGridOptions.gridApi = gridApi;
            }
        };
        $scope.followGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'cFollowtime', displayName: '开始日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'cFollowend', displayName: '终止日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'cPerson', displayName: '跟进人员', width: 100


                },
                {
                    name: 'cContent', displayName: '跟进内容', width: 100


                },
                {
                    name: 'cMemo', displayName: '备注', width: 100


                },
            ],
            data: $scope.VO.follow,
            onRegisterApi: function (gridApi) {
                $scope.followGridOptions.gridApi = gridApi;
            }
        };
        $scope.signGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'cContent', displayName: '签报内容', width: 100


                },
                {
                    name: 'cLimitdate', displayName: '签报处理时间', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , type: 'date'
                },
                {
                    name: 'cSigndate', displayName: '签报提交时间', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , type: 'date'
                },
                {
                    name: 'cTitle', displayName: '签报主题', width: 100


                },
                {
                    name: 'cType.name', displayName: '签报类型', width: 100, url: 'accessoryTypeRef/queryForGrid'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'cType'

                },
                {
                    name: 'dapprovedate', displayName: '审核日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'dmakedate',
                    displayName: '制单日期',
                    width: 100,
                    editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'


                },
                {
                    name: 'vapproveid.name', displayName: '审核人', width: 100, url: 'userRef/queryForGrid'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'vapproveid'

                },
                {
                    name: 'vapprovenote', displayName: '审核批语', width: 100


                },
                {
                    name: 'cMeno', displayName: '备注', width: 100


                },
                {
                    name: 'voperatorid.name', displayName: '操作员', width: 100, url: 'userRef/queryForGrid'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'voperatorid'

                },
                {
                    name: 'dbilldate', displayName: '业务时间', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , type: 'date'
                },
            ],
            data: $scope.VO.sign,
            onRegisterApi: function (gridApi) {
                $scope.signGridOptions.gridApi = gridApi;
            }
        };
        $scope.consultGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'builddept.name', displayName: '合同建立部门', width: 100, url: 'deptTreeRef/queryForGrid'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'builddept'

                },
                {
                    name: 'consultinfo', displayName: '合同号', width: 100


                },
                {
                    name: 'typeconsultNO', displayName: '咨询类别', width: 100, cellFilter: 'SELECT_CONSULTTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.CONSULTTYPE
                },
                {
                    name: 'newdate', displayName: '合同起始日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'enddate', displayName: '合同结束日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'consultperiod', displayName: '应收合同费总期数', width: 100


                },
                {
                    name: 'ctotal', displayName: '咨询费总额', width: 100


                },
                {
                    name: 'unpayconsulttotal', displayName: '未收咨询费总额', width: 100


                },
                {
                    name: 'vbillstatus', displayName: 'V单据状态', width: 100


                },
                {
                    name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.BILLSTATUS
                },
                {
                    name: 'pkOperator', displayName: '经办人', width: 100


                },
                {
                    name: 'operateDate',
                    displayName: '制单日期',
                    width: 100,
                    editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'


                },
                {
                    name: 'operateTime', displayName: '制单时间', width: 100


                },
                {
                    name: 'pkOrg', displayName: '业务单位', width: 100


                },
                {
                    name: 'pkDept.name', displayName: '部门', width: 100, url: 'deptTreeRef/queryForGrid'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'pkDept'

                },
            ],
            data: $scope.VO.consult,
            onRegisterApi: function (gridApi) {
                $scope.consultGridOptions.gridApi = gridApi;
            }
        };
        $scope.closeGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'cClosedate', displayName: '结算日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'cResult', displayName: '结算结果', width: 100


                },
                {
                    name: 'dapprovedate', displayName: '审核日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'voperatorid.name', displayName: '操作员', width: 100, url: 'userRef/queryForGrid'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'voperatorid'

                },
                {
                    name: 'dmakedate', displayName: '操作日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'pkBilltype', displayName: '单据类型', width: 100


                },
                {
                    name: 'vapproveid.name', displayName: '审核人', width: 100, url: 'userRef/queryForGrid'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'vapproveid'

                },
                {
                    name: 'vapprovenote', displayName: '审核批语', width: 100


                },
                {
                    name: 'cMemo', displayName: '备注', width: 100


                },
            ],
            data: $scope.VO.close,
            onRegisterApi: function (gridApi) {
                $scope.closeGridOptions.gridApi = gridApi;
            }
        };
        $scope.dealAttachmentBGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'file_type', displayName: '附件类型', width: 100, enableCellEdit: false
                },
                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},
                {
                    name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                },
                {
                    name:'pk_project_id',
                    displayName:' ',
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ng-click="grid.appScope.onPreviewFile(row.entity.pk_project_id,row.entity.attachment_name)" class="btn btn-transparent btn-xs tooltips" tooltip-placement="top">在线预览&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i></a></div>'
                }
            ],
            data: $scope.VO.dealAttachmentB,
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
            $scope.onCard($stateParams.id);
        }/*else{
            $scope.queryForGrid({});
        }*/
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
        if ($scope.selectTabName == 'costscaleGridOptions') {
            //立项拨付信息
            $scope.ifShow = true;
            $scope.upOrDown = false;
        }else if ($scope.selectTabName == 'memberGridOptions') {
            //成员信息
            $scope.ifShow = true;
            $scope.upOrDown = false;
        }else if ($scope.selectTabName == 'followGridOptions') {
            //跟进信息
            $scope.ifShow = true;
            $scope.upOrDown = false;
        }else if ($scope.selectTabName == 'signGridOptions') {
            //签报信息
            $scope.ifShow = false;
            $scope.upOrDown = false;
        }else if ($scope.selectTabName == 'consultGridOptions') {
            //咨询费管理
            $scope.ifShow = false;
            $scope.upOrDown = false;
        }else if ($scope.selectTabName == 'closeGridOptions') {
            //结项信息
            $scope.ifShow = false;
            $scope.upOrDown = false;
        }else if ($scope.selectTabName == 'dealAttachmentBGridOptions') {
            $scope.ifShow = true;
            $scope.upOrDown = true;
        }
    };
    $scope.table_name = "lr_project2";
    $scope.billdef = "AssessorsProject";
    $scope.beanName ="insurance.ExamineServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();

    initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope,$rootScope);


});
app.controller('costscaleGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('memberGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('followGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('signGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('consultGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('closeGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('assistantGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
