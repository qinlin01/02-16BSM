/**
 * Create By zhangwj
 * Create Time 2021-11-16
 */
app.controller('pLifeInsuranceBulkCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, ngTableParams) {
    $scope.initData = function () {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                bulkCode: null,
                insurancebillkind: null,
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkCorp: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                createTime: new Date().format("yyyy-MM-dd"),
                dealattachmentb: [],
                insuranceBillList: []
            };
        };
        $scope.initChildVO = function () {
            return {
                insuranceinfo: [],
                insurancedman: [],
                insuranceman: [],
                payment: [],
                beneficiary: [],
                dealAttachmentB: [],
                documentCode: ""
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //子表对象初始化
        $scope.billVO = $scope.initChildVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "substr(create_time,1,4)0_0eq": parseInt(new Date().format("yyyy")),
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode = '3020403';

        $scope.reportRef =
            {
                id: $scope.$id,
                columnDefs: [
                    {
                        field: 'approval_number',
                        displayName: '业务签报批复编号'
                    },
                    {
                        field: 'report_title',
                        displayName: '签报主题'
                    },
                    {
                        field: 'name',
                        displayName: '客户名称'
                    }
                ],
                data: ""
            };

    };


    $scope.initHttp = function () {

        $scope.onImportUploads = function (type) {
            if (type) {
                $("#inputFile").click();
            } else {
                var file = document.getElementById("inputFile").files[0];
                if (file != null) {
                    layer.load(2);
                    var form = new FormData();
                    form.append('file', file);
                    form.append('insuranceType', 'personallife');
                    form.append('data', angular.toJson($scope.VO))
                    $http({
                        method: 'POST',
                        url: $scope.basePath + 'insuranceBillBulk/importExcel',
                        data: form,
                        headers: {'Content-Type': undefined, 'x-auth-token': window.sessionStorage.getItem("token")},
                        transformRequest: angular.identity
                    }).success(function (data) {
                        layer.alert(data.msg, {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                        $scope.VO = data.bulkVO;
                        $scope.insurancebillGridOption.data = data.data;
                        if (data.code == 200) {
                            var obj = document.getElementById('inputFile');
                            obj.outerHTML = obj.outerHTML;
                        }
                        $scope.onCard($scope.VO.id);
                    }).error(function (data) {
                        var obj = document.getElementById('inputFile');
                        obj.outerHTML = obj.outerHTML;
                        console.log(data.code);
                        layer.alert(data.msg, {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                    })
                }

            }
        };

        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "insuranceBillBulk/queryForGrid", {
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
            $http.post($scope.basePath + "insuranceBillBulk/findOne", {id: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    $scope.VO = response.data;
                    if ($scope.insurancebillGridOption.data == null) {
                        $scope.insurancebillGridOption.data = [];
                    }
                    $scope.dealAttachmentBGridOptions.data= $scope.VO.dealattachmentb==undefined? [] :$scope.VO.dealattachmentb;
                    $scope.insurancebillGridOption.data = $scope.VO.insuranceBillList;
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
            $scope.VO.billNum = $scope.insurancebillGridOption.data.length;
            $scope.VO.insuranceBillList = $scope.insurancebillGridOption.data;
            $scope.VO.dealattachmentb=$scope.dealAttachmentBGridOptions.data;
            layer.load(2);
            $http({
                method: "POST",
                url: $rootScope.basePath + "insuranceBillBulk/save",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response.code == 200) {
                    $scope.VO = response.result;
                    $scope.isGrid = false;
                    $scope.isCard = true;
                    $scope.isForm = false;
                    $scope.childIsEdit = false;
                    layer.closeAll('loading');
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
    };

    $scope.initFunction = function () {

        $scope.writeBackToBill = function (billVO) {
            for (let i = 0; i < $scope.insurancebillGridOption.data.length; i++) {
                if ($scope.insurancebillGridOption.data[i].id == billVO.id) {
                    angular.assignData($scope.insurancebillGridOption.data[i], billVO);
                }
            }
        }

        /**
         * 返回业务签报批复编号查询URL
         */
        $scope.reportUrl = function (param) {
            return "reportRef/queryForGrid?pk_project=" + param;
        }

        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
    };

    $scope.initWatch = function () {
        $scope.$watch('VO.pkProject.name', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if (!$scope.isForm || $scope.VO.pkProject.name == null || $scope.VO.pkProject.name == '') {
                return;
            }
            if ($scope.VO.pkProject.pk) {
                $http.post($scope.basePath + "propertyProject/findOne", {pk: $scope.VO.pkProject.pk}).success(function (response) {
                    if (response && response.code == "200") {
                        if (response.result) {
                            $scope.VO.pkProjectKind = response.result.pkC0Tradetype;
                            $scope.VO.busiType = response.result.busi_type;
                        }
                    }
                });
            } else {
                $scope.VO.estimatelinkman = "";
            }
        }, true);

        $scope.$watch('billVO', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if (!$scope.isForm || $scope.billVO.id == null || $scope.billVO.id == '') {
                return;
            }
            //重写投保人信息
            $scope.billVO.estimatename = $scope.billVO.estimatepk.name;
            $scope.writeBackToBill($scope.billVO);
        }, true);
    };

    $scope.initButton = function () {

        $scope.onSubmitSelf = function () {
            var id;
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
                id = rows[0].id;
            } else {
                id = $scope.VO.id;
                if ($scope.VO.billstatus != 31) return layer.alert("只有未上报状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }

            //提交前数据校验
            $http.post($scope.basePath + "insuranceBillBulk/checkChild", {id: id}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    $scope.onSubmit();
                }
            });
        };


        //附件批量上传
        $scope.onUploadss = function () {
            if ($scope.insurancebillGridOption.data == null || !$scope.insurancebillGridOption || $scope.insurancebillGridOption.data.length == 0) {
                return layer.alert("请先导入保单数据，再导入保单附件！", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }

            layer.load(2);
            $scope.isSubDisabled = false;
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
                    layer.load(2);
                    //调用后台保存接口
                    $http.post($scope.basePath + "propertyInsurance/saveFiles", {data: angular.toJson(value)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            layer.alert(response.msg, {
                                icon: 1
                            });
                            if($scope.VO.id!=null){
                                $scope.findOne($scope.VO.id);
                            }
                        }
                    });
                }
            }, function (reason) {
            });
        };

        $scope.selectTab = function (name) {
            $scope.selectTabName = name.toString();
            if ($scope.selectTabName == 'dealAttachmentBChildGridOptions'|| $scope.selectTabName == 'dealAttachmentBGridOptions'){
                $scope.upOrDown = true;
            } else {
                $scope.upOrDown = false;
            }
        };
        /**
         * 上传Excel
         */
        $scope.onImport = function () {

            if ($scope.VO.pkProject == null || $scope.VO.pkProject.name == '') {
                return layer.alert("请先选择立项！", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }

            var inputFile = $('#inputFile');
            inputFile.click();
        };

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };

        $scope.onAdd = function () {
            angular.assignData($scope.VO, $scope.initVO());
            $scope.insurancebillGridOption.data = $scope.VO.insuranceBillList;
            $scope.billVO = null;
            $scope.isGrid = false;
            $scope.isCard = false;
            $scope.isForm = true;
            $scope.childIsEdit = false;
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
                $scope.findOne(rows[0].id, function () {
                    $scope.isGrid = false;
                    $scope.isCard = false;
                    $scope.isForm = true;
                    $scope.childIsEdit = true;
                });
            } else if ($scope.isCard) {
                $scope.findOne($scope.VO.id, function () {
                    $scope.isGrid = false;
                    $scope.isCard = false;
                    $scope.isForm = true;
                    $scope.childIsEdit = true;
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
                $scope.findOne(rows[0].id, function () {
                    $scope.isGrid = false;
                    $scope.isCard = true;
                    $scope.isForm = false;
                    $scope.childIsEdit = false;
                });
            } else {
                $scope.findOne(id, function () {
                    $scope.isGrid = false;
                    $scope.isCard = true;
                    $scope.isForm = false;
                    $scope.childIsEdit = false;
                });
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
                    $http.post($scope.basePath + "insuranceBillBulk/deleteVo", {ids: angular.toJson(ids)}).success(function (response) {
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
                $scope.childIsEdit = false;
            } else {
                $scope.isGrid = true;
                $scope.isCard = false;
                $scope.isForm = false;
                $scope.childIsEdit = false;
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
            $scope.childIsEdit = false;
            $scope.billVO = $scope.initChildVO();
            $scope.VO = $scope.initVO();

            $scope.isEdit = false;
            //阻止页面渲染
            $scope.form = false;
            $scope.card = false;
            $scope.insuranceinfoGridOptions.data = [];
            $scope.insurancedmanGridOptions.data = [];
            $scope.beneficiaryGridOptions.data = [];
            $scope.insurancemanGridOptions.data = [];
            $scope.paymentGridOptions.data = [];
            $scope.dealAttachmentBChildGridOptions.data = [];
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
                    $scope.onSaveVO();
                }
            }, true);
        };
        /**
         * 导入模板下载
         */
        $scope.onTestDown = function (type){
            let exportEx = $('#exproE');//JS原生带的文件
            exportEx.attr('target', '_blank');//设置打开 新页面 所以要在过滤器中配置
            exportEx.attr('action', $rootScope.basePath + 'insuranceBillBulk/testDown');//设置控制层地址
            exportEx.submit();//提交
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
            if (selectTabName == null || selectTabName == '') {
                selectTabName = $scope.selectTabName;
            }
            let data = {};
            if ('agentClearingBGridOption' == selectTabName) {
                if ($scope.VO.pkAgent && $scope.VO.pkAgent.name != null && $scope.VO.pkAgent.name != '') {
                    $scope.openPaymentWindow();
                } else {
                    return layer.alert('请先选择代理人', {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
            } else {
                $scope[selectTabName].data.push(data);
            }
        }

        /**
         * 子表删除
         */
        $scope.onDeleteLine = function (selectTabName) {
            if (selectTabName == null || selectTabName == '') {
                selectTabName = $scope.selectTabName;
            }
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
        //列表界面
        $scope.isGrid = true;
        //卡片界面
        $scope.isCard = false;
        //编辑界面
        $scope.isForm = false;
        //列表界面子表是否显示
        $scope.chilbTable = false;
        //子表是否可编辑
        $scope.childIsEdit = false;
        //默认选中子表
        $scope.selectTabName = 'insuranceinfoGridOptions';
        //子表附件按钮显示
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
            exporterCsvFilename: '个人寿险批量业务.csv',
            columnDefs: [
                {name: 'bulkCode', displayName: '批量业务信息编号'},
                {name: 'insurancebillkind', displayName: '保单性质', cellFilter: 'SELECT_INSURANCEBILLKIND'},
                {name: 'billNum', displayName: '包含保单数量'},
                {name: 'pkProject.code', displayName: '立项号'},
                {name: 'pkProject.name', displayName: '业务/项目名称'},
                {name: 'busiType.name', displayName: '业务分类'},
                {name: 'pkProjectKind.name', displayName: '客户产权关系'},
                {name: 'pkReport.approval_number', displayName: '业务签报批复编号'},
                {name: 'billstatus', displayName: '单据状态', cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人'},
                {name: 'createTime', displayName: '制单日期'},
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

        //保单子表
        $scope.insurancebillGridOption = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '手续费模板子表.csv',
            cellEditableCondition: function ($rootScope) {
                return $scope.childIsEdit;
            },
            columnDefs: [
                {name: 'insuranceno', displayName: '保单号', enableCellEdit: true},
                {name: 'approval_number', displayName: '批单号', enableCellEdit: true},
                {name: 'insuredDate', displayName: '投保日期', enableCellEdit: true, cellFilter: 'date_cell_date'},
                {name: 'startdate', displayName: '保险起始日期', enableCellEdit: true, cellFilter: 'date_cell_date'},
                {name: 'enddate', displayName: '保险到期日期', enableCellEdit: true, cellFilter: 'date_cell_date'},
                // {
                //     name: 'estimatepk.name', displayName: '投保人',
                //     enableCellEdit: true,
                //     url: 'customerInsuRef/queryForGrid',
                //     placeholder: '请选择',
                //     editableCellTemplate: 'ui-grid/refEditor',
                //     isTree: false,
                //     popupModelField: 'estimatepk'
                // },
                {name: 'c2Payyear', displayName: '缴费年期', enableCellEdit: true},
                {name: 'c2PaymethodNO', displayName: '缴费方式', enableCellEdit: true, cellFilter: 'SELECT_PAYMETHODTYPE'},
                {
                    name: 'pkAgent.NAME', displayName: '执业人员姓名',
                    enableCellEdit: true,
                    url: 'commonRef/queryAgentRef',
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    isTree: false,
                    popupModelField: 'pkAgent',
                },
                {name: 'pkAgent.CODE', displayName: '代理人推荐码', enableCellEdit: false},
                {name: 'insurancetotalmoney', displayName: '保险金额/赔付限额（元）', enableCellEdit: true, cellFilter: 'AMOUNT_FILTER'},
                {name: 'insurancetotalcharge', displayName: '保费总金额（元）', enableCellEdit: true, cellFilter: 'AMOUNT_FILTER'},
                {name: 'receivefeemount', displayName: '佣金总金额（元）', enableCellEdit: true, cellFilter: 'AMOUNT_FILTER'},
                {name: 'receivefeeperiod', displayName: '应收佣金总期数', enableCellEdit: true},
                {name: 'PremiumAET', displayName: '保费金额不含税', enableCellEdit: true},
                {name: 'CommissionAET', displayName: '佣金金额不含税', enableCellEdit: true},

            ],
            data: $scope.VO.insuranceBillList,
            onRegisterApi: function (gridApi) {
                $scope.insurancebillGridOption.gridApi = gridApi;
                $scope.insurancebillGridOption.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {

                    });
                }
                $scope.insurancebillGridOption.gridApi.selection.on.rowSelectionChanged(
                    $scope, function (row, event) {
                        $scope.billVO = $scope.initChildVO();
                        angular.assignData($scope.billVO, row.entity);
                        // $scope.billVO = row.entity;
                        $scope.insuranceinfoGridOptions.data = $scope.billVO.insuranceinfo;
                        $scope.insurancedmanGridOptions.data = $scope.billVO.insurancedman;
                        $scope.beneficiaryGridOptions.data = $scope.billVO.beneficiary;
                        $scope.insurancemanGridOptions.data = $scope.billVO.insuranceman;
                        $scope.paymentGridOptions.data = $scope.billVO.payment;
                        $scope.dealAttachmentBChildGridOptions.data = $scope.billVO.dealAttachmentB;
                    });
            }
        };


        //附件
        // $scope.dealAttachmentBGridOptions = {
        //     enableCellEditOnFocus: true,
        //     enableRowSelection: true,
        //     enableSelectAll: true,
        //     multiSelect: true,
        //     enableSorting: true,
        //     enableRowHeaderSelection: true,
        //     showColumnFooter: false,
        //     columnDefs: [
        //         {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},
        //         {
        //             name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
        //         },
        //         {
        //             name: 'pk_project_id',
        //             displayName: ' ',
        //             width: 120,
        //             cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ng-click="grid.appScope.onPreviewFile(row.entity.pk_project_id,row.entity.attachment_name)" class="btn btn-transparent btn-xs tooltips" tooltip-placement="top">在线预览&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i></a></div>'
        //         }
        //     ],
        //     data: $scope.VO.dealattachmentb,
        //     onRegisterApi: function (gridApi) {
        //         if ($scope.downFlag) {
        //             $scope.dealAttachmentBGrid = gridApi;
        //             $scope.downFlag = false;
        //         } else {
        //             $scope.dealAttachmentBGridOptions.gridApi = gridApi;
        //         }
        //         $scope.dealAttachmentBGridOptions.gridApi.core.addRowHeaderColumn({
        //             name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
        //         });
        //     }
        // };
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
                    editDropdownOptionsArray: getSelectOptionData.CASERECORDTYPE,
                    cellFilter: 'SELECT_CASERECORDTYPE'
                },

                {name: 'attachment_name', displayName: '附件名称', enableCellEdit: false},
                {
                    name: 'cUpdate', displayName: '上载时间',enableCellEdit: false
                },
            ],
            data: $scope.VO.f,
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

        //险种子表
        $scope.insuranceinfoGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'insurancepk.name', displayName: '险种名称', width: 100, url: 'insuranceRef/queryForGrid'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'insurancepk'
                    , params: {type: 'shouxian'}, isTree: true, enableCellEdit: true
                },
                {
                    name: 'vdef6', displayName: '具体险种', width: 100, enableCellEdit: true


                },
                {
                    name: 'insurancemoneyoneperson',
                    displayName: '保险金额/赔偿限额(每人)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'estimatenum', displayName: '投保人数', width: 100


                },
                {
                    name: 'insurancemoney', displayName: '保险金额/赔偿限额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'chargerate', displayName: '费率(‰)', width: 100


                },
                {
                    name: 'vdef4', displayName: '保费金额不含增值税', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'vdef2', displayName: '佣金金额不含增值税', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'insurancecharge', displayName: '保费含税(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'commisionrate', displayName: '佣金比例（%）', width: 100


                },
                {
                    name: 'commisionnum', displayName: '佣金金额(含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'franchise', displayName: '免赔额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'cMemo', displayName: '备注', width: 100


                },
            ],
            data: $scope.billVO.insuranceinfo,
            onRegisterApi: function (gridApi) {
                $scope.insuranceinfoGridOptions.gridApi = gridApi;
                gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                    $scope.writeBackToBill($scope.billVO);
                });
            }
        };
        //被保人子表
        $scope.insurancedmanGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition: function ($rootScope) {
                if ($scope.childIsEdit) {
                    if (($rootScope.col.grid.rows[0].entity.withPolicyholder == null || $rootScope.col.grid.rows[0].entity.withPolicyholder == '') && $rootScope.col.name == 'withPolicyholder') {
                        return true;
                    }
                    if ($rootScope.col.grid.rows[0].entity.withPolicyholder == 1) {
                        if ($rootScope.col.name == 'withPolicyholder' || $rootScope.col.name == 'insurancemoney' || $rootScope.col.name == 'insurancefee' || $rootScope.col.name == 'additioninsurancecharge') {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'withPolicyholder', displayName: '与投保人关系', width: 100, cellFilter: 'SELECT_PERSONNELRELATIONS'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.PERSONNELRELATIONS
                },
                {
                    name: 'insurancedman', displayName: '姓名', width: 100

                },
                {
                    name: 'sex', displayName: '性别', width: 100, cellFilter: 'SELECT_SEXTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.SEXTYPE
                },
                {
                    name: 'birthdate', displayName: '出生日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'certificatetype', displayName: '证件类型', width: 100, cellFilter: 'SELECT_CERTCODETYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.CERTCODETYPE
                },
                {
                    name: 'certificateno', displayName: '证件号码', width: 100


                },
                {
                    name: 'insurancedmanaddr', displayName: '详细地址', width: 100


                },
                {
                    name: 'insurancedmanphone', displayName: '联系电话', width: 100,
                },
                {
                    name: 'insurancemoney', displayName: '保险金额/赔偿限额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'insurancefee', displayName: '主险保费(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'additioninsurancecharge', displayName: '附加险保费(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
            ],
            data: $scope.billVO.insurancedman,
            onRegisterApi: function (gridApi) {
                $scope.insurancedmanGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if ('withPolicyholder' == colDef.name) {

                            //如果被保人与投保人关系为本人  自动获取
                            if (rowEntity.withPolicyholder == 1 && $scope.billVO.estimatepk && $scope.billVO.estimatepk.pk) {

                                $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: $scope.billVO.estimatepk.pk}).success(function (response) {
                                    if (response && response.code == "200") {
                                        if (response.result != null) {
                                            rowEntity.sex = response.result.enumSex;
                                            rowEntity.birthdate = response.result.c1Birthday;
                                            rowEntity.insurancedman = $scope.billVO.estimatepk.name;
                                            rowEntity.certificatetype = response.result.enumCerttype;
                                            rowEntity.certificateno = response.result.c1Certcode;
                                            rowEntity.insurancedmanaddr = response.result.c0Address;
                                            rowEntity.insurancedmanphone = response.result.c1Phone;
                                        } else {
                                            rowEntity.sex = '';
                                            rowEntity.birthdate = '';
                                            rowEntity.insurancedman = '';
                                            rowEntity.certificatetype = '';
                                            rowEntity.certificateno = '';
                                            rowEntity.insurancedmanaddr = '';
                                        }
                                    }
                                });


                            }
                        }
                        $scope.writeBackToBill($scope.billVO);
                    });
                }
            }
        };

        //受益人
        $scope.beneficiaryGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition: function ($rootScope) {
                if ($scope.childIsEdit) {
                    if (($rootScope.col.grid.rows[0].entity.beneficiarytype == null || $rootScope.col.grid.rows[0].entity.beneficiarytype == '') && $rootScope.col.name == 'beneficiarytype') {

                        return true;
                    }else{

                        return true;
                    }
                    if ($rootScope.col.grid.rows[0].entity.beneficiarytype == 1) {
                        if ($rootScope.col.name != 'beneficiarytype') {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                } else {
                    return false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'beneficiarytype', displayName: '受益人类型', width: 100, cellFilter: 'SELECT_BENEFICIARYTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.BENEFICIARYTYPE
                },
                {
                    name: 'beneficiaryWithPolicyholder',
                    displayName: '与被保人关系',
                    width: 100,
                    cellFilter: 'SELECT_PERSONNELRELATIONS'
                    ,
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.PERSONNELRELATIONS
                },
                {
                    name: 'beneficiary', displayName: '姓名', width: 100
                },
                {
                    name: 'beneficiaryRatio', displayName: '受益比例(%)', width: 100, cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'beneficiaryCertificatetype',
                    displayName: '证件类型',
                    width: 100,
                    cellFilter: 'SELECT_CERTCODETYPE'
                    ,
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.CERTCODETYPE
                },
                {
                    name: 'beneficiaryCertificateno', displayName: '证件号码', width: 100
                },
                {
                    name: 'beneficiaryContactInformation', displayName: '联系方式', width: 100
                },
                {
                    name: 'beneficiaryContactAddress', displayName: '联系地址', width: 100
                },

            ],
            data: $scope.billVO.beneficiary,
            onRegisterApi: function (gridApi) {
                $scope.beneficiaryGridOptions.gridApi = gridApi;

                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        //如果关系为本人
                        if ('beneficiaryWithPolicyholder' == colDef.name) {
                            if (rowEntity.beneficiaryWithPolicyholder == 1 && rowEntity.beneficiarytype == 2) {
                                rowEntity.beneficiary = $scope.billVO.estimatepk.name;
                                rowEntity.beneficiaryCertificatetype = $scope.billVO.certType;
                                rowEntity.beneficiaryCertificateno = $scope.billVO.documentCode;
                                rowEntity.beneficiaryContactInformation = $scope.billVO.vdef11;
                                rowEntity.beneficiaryContactAddress = $scope.billVO.estimateaddr;
                            }
                        }
                        $scope.writeBackToBill($scope.billVO);
                    });
                }
            }

        };
        //保险人
        $scope.insurancemanGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'insurancemanpk.name',
                    displayName: '保险人名称',
                    width: 100,
                    url: 'insuranceCustomerRef/queryForGrid'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'insurancemanpk'
                },
                {
                    name: 'insuranceaddr', displayName: '保险人地址', width: 100
                },
                {
                    name: 'insurancelinkman', displayName: '保险人联系人姓名', width: 100
                },
                {
                    name: 'insurancelinktel', displayName: '保险人联系电话', width: 100
                },
                {
                    name: 'replace', displayName: '是否代收保费', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'pay', displayName: '是否全额解付', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'insurancerate', displayName: '承保比例(%)', width: 100
                },
                {
                    name: 'vdef1',
                    displayName: '保险金额/赔偿限额(元)',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'insurancemoney', displayName: '保险保费(含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'feemount', displayName: '佣金金额(含税)(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'chiefman', displayName: '是否主承保', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'memo', displayName: '备注', width: 100
                },
            ],
            data: $scope.billVO.insuranceman,
            onRegisterApi: function (gridApi) {
                $scope.insurancemanGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        $scope.writeBackToBill($scope.billVO);
                    });
                }
            }
        };
        //收付款信息
        $scope.paymentGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'stages', displayName: '期数', width: 100
                },
                {
                    name: 'typeMoneyNO', displayName: '收付款类型', width: 100, cellFilter: 'SELECT_TYPEMONEY'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.TYPEMONEY
                },
                {
                    name: 'company.name', displayName: '收付款对象名称', width: 100
                },
                {
                    name: 'typeCompanyNO', displayName: '收付款对象类型', width: 100, cellFilter: 'SELECT_CUSTOMERTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.CUSTOMERTYPE
                },
                {
                    name: 'scaleMoney', displayName: '收付款比例', width: 100
                },
                {
                    name: 'planDate', displayName: '计划日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'
                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'planMoney', displayName: '计划金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'factMoney', displayName: '已结算金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'noPaymentMoney', displayName: '未结算金额', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'factDate', displayName: '结算日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'
                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'vsettlebillno', displayName: '业务结算单号', width: 100
                },
            ],
            data: $scope.billVO.payment,
            onRegisterApi: function (gridApi) {
                $scope.paymentGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        $scope.writeBackToBill($scope.billVO);
                    });
                }
            }
        };
        //子表附件
        $scope.dealAttachmentBChildGridOptions = {
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
                    name: 'pk_project_id',
                    displayName: ' ',
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ng-click="grid.appScope.onPreviewFile(row.entity.pk_project_id,row.entity.attachment_name)" class="btn btn-transparent btn-xs tooltips" tooltip-placement="top">在线预览&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i></a></div>'
                }
            ],
            data: $scope.billVO.dealAttachmentB,
            onRegisterApi: function (gridApi) {
                $scope.dealAttachmentBChildGridOptions.gridApi = gridApi;
                $scope.dealAttachmentBChildGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };
    };

    //实体类审批流配置
    $scope.ifEntity = "true";
    $scope.entityVO = "lr.insurance.vo.InsuranceBillBulkVO";
    $scope.funCode = '30210';
    $scope.table_name = "t_insurancebill_bulk";
    // $scope.billdef = "InsurancebillBulk";
    $scope.billdef = "PropertyInsurance";
    $scope.beanName = "insurancebillBulkServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope, $rootScope);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);
});
