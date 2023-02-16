/**
 * Created by sunlikun on 2021/3/25.
 */
app.controller('endorsementsConsolidationCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, FileUploader) {
    const uploader = $scope.uploader = new FileUploader({
        url: $rootScope.basePath + 'endorsementsConsolidation/upLoadExcel',
        queueLimit: 100,  //文件个数
            removeAfterUpload: false,
            autoUpload: true,
        headers: {'x-auth-token': window.sessionStorage.getItem("token")},
    });
    uploader.onBeforeUploadItem = function (item) {   //文件上传之前
        item.formData = [{"data": angular.toJson($scope.VO)}];
    };
    uploader.onProgressItem = function (fileItem, progress) {
        layer.load(2);
    };
    uploader.filters.push({
        name: 'customFilter',
        fn: function (item, options) {
            if (!$scope.VO.fictitiousBusinessType || $scope.VO.fictitiousBusinessType == "") {
                layer.alert("请先选择互联网产品类别", {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            if (type == "||") {
                type = '|' + item.name.split('.')[item.name.split('.').length - 1] + '|';
            }
            if (/['"#$%&<>\^*]/.test(item.name)) {
                layer.alert("文件名称不允许包含特殊字符", {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
            if ('|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|'.indexOf(type) !== -1) {
                return true;
            } else {
                layer.alert("请上传Excel文件", {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
        }
    });
    uploader.onSuccessItem = function (fileItem, response, status, headers) {
        layer.closeAll('loading');
        if (response.code == "200") {
            response.data.pkFictitiousInsurance.type = response.data.fictitiousBusinessType;
            angular.assignData($scope.VO, response.data);
            $scope.dealAttachmentBGridOptions.data = $scope.VO.dealattachmentb;
            $scope.paymentGridOptions.data = $scope.VO.webPaymentList;
            layer.msg('匹配完成，是否查看详情？', {
                time: 0 //不自动关闭
                , btn: ['是', '否']
                , yes: function (index) {
                    layer.close(index);
                    $scope.onDetail();
                }
            });
        } else {
            layer.alert("失败", {skin: 'layui-layer-lan', closeBtn: 1});
        }
    }

    uploader.onErrorItem = function (fileItem, response, status, headers) {
        layer.closeAll();
    };

    $scope.initData = function () {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                webPaymentList: [],
                dealattachmentb: [],
                endorsementsCode: null,
                endorsementsType: null,
                // endorsementsReasonType: null,
                fictitiousBusinessType: null,
                // pkFictitiousInsurance: null,
                endorsementsReason: null,
                remark: null,
                insurancetotalmoney: 0,
                receiveperiod: 0,
                payperiod: 0,
                receivefeeperiod: 0,
                receivemount: 0,
                paymount: 0,
                receivefeemount: 0,
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                createTime: new Date().format("yyyy-MM-dd HH:mm:ss")
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "substr(create_time,1,4)0_0eq" : parseInt(new Date().format("yyyy")),
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.param = {
            c_2_type: 0,
            pk_org_str: $rootScope.orgVO.pk,
            busi_type: "notNull"
        };
    };

    $scope.fictitiousInsuranceRef = {
        id: $scope.$id,
        columnDefs: [
            {
                field: 'code',
                displayName: '保单对账单信息编号'
            },
            {
                field: 'name',
                displayName: '保单对账单名称'
            },
            {
                field: 'type_ref',
                displayName: '产品类型',
                cellFilter: 'SELECT_PRODUCTTYPE'
            }
        ],
        data: ""
    }

    $scope.initHttp = function () {

        $scope.onResetDetailHttp = function () {
            layer.load(2);
            $http({
                method: "POST",
                url: $rootScope.basePath + "endorsementsConsolidation/resetDetail",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == 200) {
                    layer.msg('重置成功');
                    response.data.pkFictitiousInsurance.type = response.data.fictitiousBusinessType;
                    angular.assignData($scope.VO, response.data);
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealattachmentb;
                    $scope.paymentGridOptions.data = $scope.VO.webPaymentList;
                }
            })
        }

        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function () {
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.basePath + "endorsementsConsolidation/queryForAllGrid", {
                current: $scope.gridApi.page ? $scope.gridApi.page : 1,
                size: $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100,
            }).success(function (response) {
                $scope.gridOptions.data = response.data.records;
                $scope.gridOptions.totalItems = response.data.total;
                layer.closeAll('loading');
            }).error(function () {
                layer.closeAll('loading');
            });
        };
        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            return $http.post($rootScope.basePath + "endorsementsConsolidation/queryForGrid", {
                params: angular.toJson(data),
                current: $scope.gridApi.page ? $scope.gridApi.page : 1,
                size: $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100,
            }).success(function (response) {
                $scope.gridOptions.data = response.data.records;
                $scope.gridOptions.totalItems = response.data.total;
                layer.closeAll('loading');
            }).error(function () {
                layer.closeAll('loading');
            });
        };

        $scope.findOne = function (id, callback) {
            $scope.id = id;
            layer.load(2);
            $http.post($scope.basePath + "endorsementsConsolidation/findOne", {id: id}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.data);
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealattachmentb;
                    $scope.paymentGridOptions.data = $scope.VO.webPaymentList;
                    if (callback) callback();
                } else {
                    if (response) {
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                let rs = asciiChartSet_c2en[matched];
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
            $scope.VO.webPaymentList = $scope.paymentGridOptions.data;
            $scope.VO.dealattachmentb = $scope.dealAttachmentBGridOptions.data;
            $http({
                method: "POST",
                url: $rootScope.basePath + "endorsementsConsolidation/save",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response && response.code == 200) {
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isEdit = false;
                    $scope.isDisabled = true;
                    $scope.isDisableds = true;
                    $scope.isUpdate = false;
                    angular.assignData($scope.VO, response.result);
                    layer.closeAll('loading');
                    return layer.alert('保存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
    };

    $scope.initFunction = function () {
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        //查看保单详细信息
        $scope.onDetail = function () {
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/endorsementsConsolidation/insuranceBill.html',
                className: 'ngdialog-theme-formInfo',
                controller: 'enInsuranceBillCtrl',
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

            }, function (reason) {

            });
        };

        $scope.onResetDetail = function () {
            layer.msg('重置将清除掉所有导入的信息，是否继续？', {
                time: 0 //不自动关闭
                , btn: ['是', '否']
                , yes: function (index) {
                    layer.close(index);
                    $scope.onResetDetailHttp();
                }
            });
        }
    };

    $scope.initWatch = function () {
        $scope.$watch('VO.pkFictitiousInsurance', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if($scope.VO.pkFictitiousInsurance!=null){
                $scope.VO.fictitiousBusinessType = $scope.VO.pkFictitiousInsurance.type;
            }
        }, true);
    };

    $scope.initButton = function () {

        $scope.onDownLoads = function () {
            let rows = $scope.VO.dealattachmentb;
            if (!rows || rows.length <= 0) return angular.alert("没有附件信息！");
            let ids = [];
            for (let i = 0; i < rows.length; i++) {
                ids.push(rows[i].pk_object_id);
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
        $scope.onAdd = function () {
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
        };

        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            $scope.childFlag = true;
            $scope.isDisableds = false;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form = true;
                $scope.isGrid = false;
                let rows = $scope.gridApi.selection.getSelectedRows();
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
        $scope.onTemporary = function () {
            layer.load(2);
            $scope.VO.webPaymentList = $scope.paymentGridOptions.data;
            $scope.VO.dealattachmentb = $scope.dealAttachmentBGridOptions.data;
            $http({
                method: "POST",
                url: $rootScope.basePath + "endorsementsConsolidation/temporarySave",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response && response.code == 200) {
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isEdit = false;
                    $scope.isDisabled = true;
                    $scope.isDisableds = true;
                    angular.assignData($scope.VO, response.result);
                    layer.closeAll('loading');
                    return layer.alert('暂存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        }

        /**
         * 卡片
         */
        $scope.onCard = function (id) {
            if (!id) {
                let rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1)
                    return layer.alert("请选择一条数据进行查看!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                id = rows[0].id;
            }
            $scope.findOne(id);
            $scope.mess = true;
            $scope.isBack = true;
            $scope.isGrid = false;
            $scope.isCard = true;
            $scope.card = true;
        };
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
                    $http.post($scope.basePath + "endorsementsConsolidation/delete", {ids: angular.toJson(ids)}).success(function (response) {
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

        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            if ($scope.isClear) {
                var lock=false;//默认未锁定
                layer.confirm('是否暂存本条数据？', {
                        btn: ['确定', '取消'], //按钮
                        btn2: function (index, layero) {
                            if(!lock){
                                //加锁
                                lock = true;
                                $http.post($scope.basePath + "endorsementsConsolidation/cancel", {id: $scope.VO.id}).success(function (response) {
                                    if (response && response.code == 200) {
                                        $scope.SUM_NUM = response.data;
                                        $scope.VO = $scope.initVO();
                                    }
                                });
                            }
                        },
                        shade: 0.6,//遮罩透明度
                        shadeClose: true,//点击遮罩关闭层
                    },
                    function () {
                        if(!lock) {
                            //加锁
                            lock = true;
                            // 暂存
                            $scope.onTemporary();
                        }
                    }
                );

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
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isFeeEdit = false;
            $scope.isDisabled = true;
            $scope.isDisableds = true;
            //阻止页面渲染
            $scope.form = false;
            $scope.card = false;
            //阻止页面渲染
            $scope.queryForGrid($scope.QUERY);
        };

        /**
         * 保存判断必输项
         */
        $scope.onSave = function () {
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
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
            let data = {};
            $scope[$scope.selectTabName].data.push(data);
        };

        $scope.onDeleteLines = function (delRow, tableData) {
            let ids = [];
            for (let i = 0; i < delRow.length; i++) {
                ids.push(delRow[i].$$hashKey);
            }
            let arr = [];
            for (let j = 0; j < tableData.data.length; j++) {
                if (ids.indexOf(tableData.data[j].$$hashKey) < 0) {
                    arr.push(tableData.data[j]);
                }
            }
            tableData.data = arr;
        }
        /**
         * 子表删除
         */
        $scope.onDeleteLine = function () {
            let delRow = $scope[$scope.selectTabName].gridApi.selection.getSelectedRows();

            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (let i = 0; i < $scope[$scope.selectTabName].data.length; i++) {
                for (let j = 0; j < delRow.length; j++) {
                    if ($scope[$scope.selectTabName].data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope[$scope.selectTabName].data.splice(i, 1);
                    }
                }
            }
        };
    };

    $scope.initPage = function () {
        $scope.ifupload = true;
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
        $scope.queryShow = true;
        //控制附件上传和下载
        $scope.upOrDown = false;
        $scope.isUploadAnytime = false;
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
            exporterCsvFilename: '批单对账单信息.csv',
            columnDefs: [
                {
                    name: 'endorsementsCode',
                    displayName: '批单对账单信息编号',
                    width: 100,
                    footerCellTemplate: '<div class="ui-grid-cell-contents">合计</div>'
                },
                {name: 'endorsementsType', displayName: '批单类型', width: 100,cellFilter: 'SELECT_CHANGEBILLCHECKTYPE'},
                {name: 'pkFictitiousInsurance.code', displayName: '保单对账单信息编号', width: 100,},
                {name: 'fictitiousBusinessType', displayName: '互联网产品类型', cellFilter: 'SELECT_PRODUCTTYPE', width: 100,},
                {
                    name: 'insurancetotalmoney',
                    displayName: '保险金额/赔偿限额/(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'paymount',
                    displayName: '应解付总额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'receivefeemount',
                    displayName: '应收佣金总额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'receivemount',
                    displayName: '应收保费总额(元)',
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    aggregationType: uiGridConstants.aggregationTypes.sum,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'createTime', displayName: '制单时间', width: 100,},
                {name: 'pkChecker.name', displayName: '审批人', width: 100,},
                {name: 'checkTime', displayName: '审批日期', width: 100, cellFilter: 'date_cell_date'},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '部门', width: 100,},
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
                let rows = $scope.gridApi.selection.getSelectedRows();
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
        //收付款信息
        $scope.paymentGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '批单对账单收付款信息.csv',
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            columnDefs: [
                {
                    name: 'stages', displayName: '期数', width: 100, enableCellEdit: false
                },
                {
                    name: 'tradingChannel',
                    displayName: '渠道',
                    width: 100,
                    cellFilter: 'SELECT_PAYMODE',
                    enableCellEdit: false
                },
                {
                    name: 'rechargeType',
                    displayName: '交易方式',
                    width: 100,
                    cellFilter: 'SELECT_RECHARGETYPE',
                    enableCellEdit: false
                },
                {
                    name: 'typeMoneyNo', displayName: '收付款类型', width: 100, cellFilter: 'SELECT_MONEYTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.MONEYTYPE, enableCellEdit: false
                },
                {
                    name: 'pkCompany.name', displayName: '收付款对象名称', width: 100, enableCellEdit: false
                },
                {
                    name: 'scaleMoney', displayName: '收付款比例', width: 100, cellFilter: 'number:2', enableCellEdit: true
                },
                {
                    name: 'planDate',
                    displayName: '计划日期',
                    width: 100,
                    editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"',
                    enableCellEdit: true
                },
                {
                    name: 'planMoney',
                    displayName: '计划金额',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'factMoney',
                    displayName: '已结算金额',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'noPaymentMoney',
                    displayName: '未结算金额',
                    width: 100,
                    enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'factDate',
                    displayName: '结算日期',
                    width: 100,
                    enableCellEdit: false,
                    editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'vsettlebillno', displayName: '业务结算单号', width: 100, enableCellEdit: false
                },
            ],
            data: $scope.VO.webPaymentList,
            onRegisterApi: function (gridApi) {
                $scope.paymentGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if ('planDate' == colDef.name) {
                            if($scope.planDateSyn && rowEntity.planDate){
                                $scope.planDateValue = rowEntity.planDate;
                                layer.msg('是否同步所有收付款计划日期？', {
                                    time: 0 //不自动关闭
                                    , btn: ['是', '否']
                                    , yes: function (index) {
                                        $scope.planDateSyn = false;
                                        layer.close(index);
                                        for (let i = 0; i < $scope.paymentGridOptions.data.length; i++) {
                                            $scope.paymentGridOptions.data[i].planDate = $scope.planDateValue;
                                        }
                                    }
                                });
                            }
                        }
                        $scope.paymentGridOptions.gridApi.core.refresh();
                    });
                }

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
                    name: 'upload_date', displayName: '上载时间', width: 100, enableCellEdit: false
                },
                {
                    name: 'pk_object_id',
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
    $scope.entityVO = "lr.insurance.vo.EndorsementsConsolidationVO";
    $scope.funCode = '902';
    $scope.table_name = "t_fictitious_endorsements_consolidation";
    $scope.billdef = "FictitiousInsurance";
    $scope.beanName = "endorsementsConsolidationService";
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
app.controller('enInsuranceBillCtrl', ["$scope", "ngTableParams", "$rootScope", "$http", function ($scope, ngTableParams, $rootScope, $http) {

    $scope.goodDataParams = new ngTableParams({
        page: 1,
        count: 10,
    }, {
        counts: [],// 样式原因，去掉每页条数选择
        getData: function ($defer, params) {
            $scope.queryData(1, (params.page() - 1) * params.count(), params.count(), function (data, total) {
                params.total(total);
                $defer.resolve(data);
            });
        }
    });

    $scope.badDataParams = new ngTableParams({
        page: 1,
        count: 10,
    }, {
        counts: [],// 样式原因，去掉每页条数选择
        getData: function ($defer, params) {
            $scope.queryData(2, (params.page() - 1) * params.count(), params.count(), function (data, total) {
                params.total(total);
                $defer.resolve(data);
            });
        }
    });

    $scope.queryData = function (type, page, pageSize, callback) {
        layer.load(2);
        $http.post($rootScope.basePath + "endorsementsConsolidation/queryDetailTabs", {
            id: $scope.VO.id,
            type: type,
            page: page,
            pageSize: pageSize
        }).success(function (response) {
            if (response.code == 200) {
                callback(response.data, response.count);
            }
            layer.closeAll('loading');
        }).error(function () {
            layer.closeAll('loading');
        });
    }
}]);
