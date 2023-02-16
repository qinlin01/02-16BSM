/**
 * Created by sunlikun on 2020/7/2.`
 */
app.controller('economicContractCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $location) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.entityVO = 'nc.vo.busi.InsurancebillVO';
        //主表数据
        $scope.VO = {
            counterpart:[],
            payment:[]
        };
        //初始化查询
        $scope.initQUERY = function () {
            return {}
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.param = {};
        $scope.funCode = '402';
    };

    $scope.initHttp = function () {
        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data, fun, isPrint, etype) {
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.basePath + "economicContract/queryAllForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize
            }).success(function (response) {
                if (fun) fun(response);
                if (isPrint) {
                    window.open(getURL(response.queryPath));
                } else {
                    window.open($rootScope.basePath + "uploadFile/downLoadByUrl?url=" + encodeURI(encodeURI(response.downPath)));
                }
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
            $http.post($scope.basePath + "economicContract/queryForGrid", {
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
            $http.post($scope.basePath + "economicContract/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.paymentGridOptions.data = $scope.VO.payment;
                    $scope.counterpartGridOptions.data = $scope.VO.counterpart;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    if (callback) callback();
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
        $scope.onDeleteFile = function (text_url,id) {
            layer.confirm('是否删除该附件？', {
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
                    layer.load(2);
                    $http.post($scope.basePath + "economicContract/deleteFile", {url: text_url,id:id}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == 200) {
                            layer.msg('删除成功!', {
                                icon: 1
                            });
                            $scope.findOne($scope.pk)
                        }
                    });
                }
            );
        }
        $scope.onUpload = function () {
            $scope.aVO = {};
            var fileList = [];
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/common/form_upload.html',
                className: 'ngdialog-theme-default',
                scope: $scope,
                rootScope: $rootScope,
            }).then(function (value) {
                if (value != null) {
                    angular.forEach(value, function (item) {
                        item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                        fileList.push(item);
                    });
                    layer.load(2);
                    $http.post($scope.basePath + "economicContract/saveFile", {contractnumber: $scope.pk,fileList:angular.toJson(fileList)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == 200) {
                            $scope.findOne($scope.pk)
                        }
                    });
                }
            }, function (reason) {

            });
        };
    };

    $scope.initFunction = function () {
        $scope.getSelectDetail = function () {
            var rows = $scope.changeGridOptions.gridApi.selection.getSelectedRows();
            if (rows[0] != null && rows[0].vbillno != null) {
                $scope.getDetail(rows[0].vbillno);
            }
        }
    };

    $scope.initButton = function () {
        $scope.onDownLoads = function () {
            var rows = $scope.VO.dealAttachmentB;
            if (!rows || rows.length <= 0) return angular.alert("没有附件信息！");
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
                ids.push(rows[i].pk_project_id);
            }
            var exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };
        $scope.onDownLoadsCard = function (TEXT_URL) {
            var exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(TEXT_URL);
            // exportEx.attr('action', 'http://172.16.3.122:8080/hdfs/fileDownload?filePath='+TEXT_URL);
            exportEx.attr('action', $rootScope.basePath + 'economicContract/downloadFileMethod?filePath='+TEXT_URL);
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
                id = rows[0].CONTRACTNUMBER;
            }
            $http.post($scope.basePath + "economicContract/findOne", {
                pk: id
            }).success(function (response) {
                if (response && response.code == "200") {
                    $scope.card = true;
                    angular.assignData($scope.VO, response.result);
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
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            if ($scope.QUERY["startdate^gte"] && $scope.QUERY["startdate^lte"]) {
                if (new Date($scope.QUERY["startdate^gte"]) > new Date($scope.QUERY["startdate^lte"])) {
                    return layer.alert("结束时间必须大于开始时间!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
            if ($scope.QUERY["enddate^gte"] && $scope.QUERY["enddate^lte"]) {
                if (new Date($scope.QUERY["enddate^gte"]) > new Date($scope.QUERY["enddate^lte"])) {
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
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '经法合同信息.csv',
            columnDefs: [
                {name: 'CONTRACTNAME', displayName: '合同名称', width: 300,},
                {name: 'CONTRACTNUMBER', displayName: '合同编号', width: 180,},
                {name: 'TYPEOFCONTRACT', displayName: '合同类型 ', width: 250,cellFilter: 'JF_WORDS'},
                {name: 'UNDERTAKINGDEPARTMENT', displayName: '承办部门 ', width: 120,},
                {name: 'UNDERTAKER', displayName: '承办人', width: 100,},
                {name: 'CNTIME', displayName: '合同编号时间', width: 100,},
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
                    $scope.findOne(rows[0].CONTRACTNUMBER);
                }
            });

        };
        $scope.selectTabName = 'paymentGridOptions';
        $scope.paymentGridOptions = {
            enableCellEditOnFocus: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'type', displayName: '款项性质', width: 200,
                    enableCellEdit: true,
                    cellEditableCondition: function ($scope) {
                        return $scope.row.entity.maininsurance == 'N';
                    }
                },
                {
                    name: 'ratio', displayName: '支付比例（%）', width: 200, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'payment', displayName: '支付金额（元）', width: 200, cellFilter: 'number:6'
                },
                {
                    name: 'paymentDate', displayName: '计划支付日期', width: 200,
                    cellClass: function () {
                        return "lr-text-right"
                    }
                }
            ],
            data: $scope.VO.payment,
            onRegisterApi: function (gridApi) {
                $scope.paymentGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                    });
                }
            }
        };
        //合同对方
        $scope.counterpartGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit || $scope.isUpdate) {
                    return true;
                } else {
                    return false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'contractCounterpartInformation', displayName: '合同对方', width: 200
                },
                {
                    name: 'YNReceivingSide', displayName: '是否收款方', width: 200
                },
                {
                    name: 'bankAccount', displayName: '银行账号', width: 200
                },
            ],
            data: $scope.VO.counterpart,
            onRegisterApi: function (gridApi) {
                gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });

                $scope.counterpartGridOptions.gridApi = gridApi;
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
                // {
                //     name: 'file_type',
                //     displayName: '附件类型',
                //     width: 100,
                //     enableCellEdit: true,
                //     cellFilter: 'SELECT_DOUCUMENTTYPE',
                //     editableCellTemplate: 'ui-grid/dropdownEditor'
                //     ,
                //     editDropdownValueLabel: 'name'
                //     ,
                //     editDropdownOptionsArray: getSelectOptionData.DOUCUMENTTYPE
                // },

                {name: 'TEXT_NAME', displayName: '附件名称', width: 200, enableCellEdit: false},
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

        function getQueryVariable() {
            let query = window.location.href;
            let vars = query.split("&");
            let pair = vars[0].split("=");
            if (pair.length > 1) {
                return pair[1];
            }
            return null;
        }

        if (null != getQueryVariable()) {
            $scope.onCard(getQueryVariable());
        }

        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
        /*else{
         $scope.queryForGrid({});
         }*/
    };

    $scope.table_name = "lr_insurancebill";
    $scope.billdef = "PropertyInsurance";
    $scope.beanName = "insurance.InsurancebillServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initButton();
    $scope.initPage();
});