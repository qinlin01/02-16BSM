/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('personalCustomerCtrl', function ($rootScope, $scope, $http, $stateParams, $location, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                account: [],
                linkman: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                dr: 0,
                costscale: [],
                coomedium: [],
                billstatus: 0,
                c0Ifele: 'N'
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.entityVO = 'nc.vo.busi.CustomerVO';
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "operate_year": parseInt(new Date().format("yyyy")),
                "c_0_type": 2,
                "id": $stateParams.id
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode = '10103';
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "personalCustomer/queryForGrid", {
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
        $scope.findOne = function (pk,ifDesensitize) {
            $scope.pk = pk;
            $http.post($scope.basePath + "personalCustomer/findOne", {pk: pk,ifDesensitize:ifDesensitize}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.accountGridOptions.data = $scope.VO.account;
                    $scope.linkmanGridOptions.data = $scope.VO.linkman;
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
                    //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "personalCustomer/save", {data: angular.toJson($scope.VO), funCode: $scope.funCode})
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
                    // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
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
            if (item && item.id) {
                $scope.onCard(item.id);
            }

        };
    };

    $scope.initWatch = function () {
        $scope.$watch('VO.enumCerttype', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['enumCerttypeName'] = $rootScope.SELECT.CERTCODETYPE[newVal - 1].name;
            }
        }, true);
        $scope.$watch('VO.enumSex', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['enumSexName'] = $rootScope.SELECT.SEXTYPE[newVal - 1].name;
            }
        }, true);
    };

    $scope.initButton = function () {
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
                $scope.findOne(rows[0].id, "Y");
            }
        };

        $scope.onSubmit = function () {
            var pkProject;
            var rows = $scope.gridApi.selection.getSelectedRows();
            if ($scope.isGrid) {
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                if (rows[0].billstatus != 37) return layer.alert("只有未上报状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 37) return layer.alert("只有未上报状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            $http.post($scope.basePath + "personalCustomer/submit", {data: angular.toJson(rows[0])}).success(function (response) {
                if (response && response.code == 200) {
                    $scope.queryForGrid($scope.QUERY);
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
                    //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
            // $scope.queryFlowInfo(pkProject,function (response) {
            // });
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

        $scope.onAdd = function () {
            $scope.form = true;
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
                $scope.form = true;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id,"N");
                $scope.isBack = true;
                $scope.isEdit = true;
                if ($scope.VO.billstatus == 34 || $scope.VO.billstatus == 33) {
                    $scope.isDisabled = true;
                } else {
                    $scope.isDisabled = false;
                }
            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                if ($scope.VO.billstatus == 34 || $scope.VO.billstatus == 33) {
                    $scope.isDisabled = true;
                } else {
                    $scope.isDisabled = false;
                }
            }
        };
        /**
         * 卡片
         */
        $scope.onCard = function () {
               var rows = $scope.gridApi.selection.getSelectedRows();
               if (!rows || rows.length != 1)
                   return layer.alert("请选择一条数据进行查看!", {
                       skin: 'layui-layer-lan',
                       closeBtn: 1
                   });
               $scope.findOne(rows[0].id,"Y");
               $scope.isBack = true;
               $scope.isGrid = false;
               $scope.isCard = true;
               $scope.card = true;
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
                    $http.post($scope.basePath + "personalCustomer/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
            if ($scope.isClear) {
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
            $scope.form = false;
            $scope.card = false;
            $scope.queryForGrid($scope.QUERY);
        };
        /**
         * 保存判断必输项
         */
        $scope.onSave = function () {
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert(errEls[0].ngVerify.OPTS.message,
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    $scope.isEmpty = true;
                    if ($scope.isEmpty) {
                        $scope.VO.enumCerttypeName = $rootScope.returnSelectName($scope.VO.enumCerttype, "CERTCODETYPE");
                        $scope.VO.c0IfeleName = $rootScope.returnSelectName($scope.VO.c0Ifele, "YESNO");
                        $scope.VO.enumSexName = $rootScope.returnSelectName($scope.VO.enumSex, "SEXTYPE");

                        //证件类型效验
                        let regArray = [{id:1,reg:/^[0-9]{17}[0-9A-Z]{1}$/},{id:2,reg:/^[0-9]{18}$/},{id:3,reg:/^[0-9]{9}$/},{id:4,reg:/^[\u4E00-\u9FFF]{1}[0-9]{5,7}$/},{id:5,reg:/^[0-9]{20}$/}];

                        for (let i = 0; i < regArray.length; i++) {
                            if (regArray[i].id == $scope.VO.enumCerttype){
                                if(!regArray[i].reg.test($scope.VO.c1Certcode)){
                                    if(regArray[i].id==1){
                                        return layer.alert("身份证号码格式不正确,正确格式为18位,最后一位为数字或X");
                                    }
                                    if(regArray[i].id==2){
                                        return layer.alert("驾照号码格式不正确,正确格式为18位数字！");
                                    }
                                    if(regArray[i].id==3){
                                        return layer.alert("护照号码格式不正确,正确格式为9位数字！");
                                    }
                                    if(regArray[i].id==4){
                                        return layer.alert("军官证号码格式不正确,正确格式为一个汉字与5到7位数字！");
                                    }
                                    if(regArray[i].id==5){
                                        return layer.alert("公估资格证号码格式不正确,正确格式为20位数字！");
                                    }
                                }
                            }
                        }

                        $scope.onSaveVO();
                    }
                }
            }, true);
        };

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            if ($scope.QUERY["check_date^gte"] && $scope.QUERY["check_date^lte"]) {
                if (new Date($scope.QUERY["check_date^gte"]) > new Date($scope.QUERY["check_date^lte"])) {
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
            if ($scope.selectTabName == 'accountGridOptions' || $scope.selectTabName == 'linkmanGridOptions') {
                $scope[$scope.selectTabName].data.push({
                    pkOperator: $rootScope.userVO,
                    operateDate: new Date().format("yyyy-MM-dd"),
                    pkDept: $rootScope.deptVO,
                    pkOrg: $rootScope.orgVO
                });
            } else if ($scope.selectTabName == 'customerDeptGridOptions') {
                $scope[$scope.selectTabName].data.push({
                    pkOperator: $rootScope.userVO,
                    operateDate: new Date().format("yyyy-MM-dd")
                });
            }
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
        $scope.form = false;
        $scope.card = false;
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
            exporterCsvFilename: '个人客户信息.csv',
            columnDefs: [
                {name: 'c0Code', displayName: '客户编号', width: 100,},
                {name: 'c0Name', displayName: '个人客户名称', width: 100,},
                {name: 'enumSex', displayName: '性别', width: 100, cellFilter: 'SELECT_SEXTYPE'},
                {name: 'enumCerttype', displayName: '证件类型', width: 100, cellFilter: 'SELECT_CERTCODETYPE'},
                {name: 'c1Certcode', displayName: '证件号码', width: 100,},
                {name: 'tag', displayName: '客户标签', width: 100},
                {name: 'c1Phone', displayName: '联系电话', width: 100,},
                {name: 'c0Address', displayName: '联系地址', width: 100,},
                {name: 'c0Ifele', displayName: '是否公司员工', width: 100, cellFilter: 'SELECT_YESNO'},

                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'operateDate', displayName: '制单日期', width: 100,},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '业务部门', width: 100,},
                // {name: 'pkChecker.name', displayName: '审批人', width: 100,},
                // {name: 'checkDate', displayName: '审批日期', width: 100, cellFilter: 'date_cell_date'},
                // {name: 'checkTime', displayName: '复核时间', width: 100,},
                // {name: 'vapprovenote', displayName: '复核意见', width: 100,},
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
                    if (!$scope.chilbTable) {
                        $scope.chilbTable = true;
                    }
                    $scope.findOne(rows[0].id,"Y");
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });


        };

        $scope.linkManOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationCurrentPage: 1,
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {name: 'name', displayName: '联系人姓名',width:150},
                {name: 'tele', displayName: '联系人电话',width:150},
            ],
            data:[],
            onRegisterApi: function (gridApi) {
                $scope.linkManOptions.gridApi = gridApi;
            }
        };

        $scope.selectTabName = 'accountGridOptions';
        $scope.accountGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'accType', displayName: '账户类型', width: 100, cellFilter: 'SELECT_ACCTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.ACCTYPE
                },
                {
                    name: 'accName', displayName: '开户名称', width: 100


                },
                {
                    name: 'accNum', displayName: '账号', width: 100


                },
                {
                    name: 'accBlank', displayName: '开户银行', width: 100


                },
                {
                    name: 'jointBankNum', displayName: '银行联行号', width: 100
                },
                // {
                //     name: 'pkOperator.name', displayName: '经办人', width: 100, enableCellEdit: false
                //
                //
                // },
                // {
                //     name: 'operateDate',
                //     displayName: '制单日期',
                //     width: 100,
                //     enableCellEdit: false,
                //     editableCellTemplate: 'ui-grid/refDate',
                //     cellFilter: 'date:"yyyy-MM-dd"'
                //
                //
                // },
                // {
                //     name: 'pkOrg.name', displayName: '业务单位', width: 100, enableCellEdit: false
                //
                //
                // },
                // {
                //     name: 'pkDept.name', displayName: '业务部门', width: 100, enableCellEdit: false
                //
                //
                // },
            ],
            data: $scope.VO.account,
            onRegisterApi: function (gridApi) {
                $scope.accountGridOptions.gridApi = gridApi;
            }
        };
        $scope.linkmanGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'name', displayName: '紧急联系人', width: 100


                },
                {
                    name: 'tele', displayName: '紧急联系人电话', width: 100


                },
                {
                    name: 'mobile', displayName: '紧急联系人手机', width: 100


                },
                // {
                //     name: 'pkOperator.name', displayName: '经办人', width: 100, enableCellEdit: false
                //
                //
                // },
                // {
                //     name: 'operateDate', displayName: '制单日期', width: 100, enableCellEdit: false,
                //     editableCellTemplate: 'ui-grid/refDate',
                //     cellFilter: 'date:"yyyy-MM-dd"'
                //
                //
                // },
                // {
                //     name: 'pkOrg.name', displayName: '业务单位', width: 100, enableCellEdit: false
                //
                //
                // },
                // {
                //     name: 'pkDept.name', displayName: '业务部门', width: 100, enableCellEdit: false
                //
                //
                // },
            ],
            data: $scope.VO.linkman,
            onRegisterApi: function (gridApi) {
                $scope.linkmanGridOptions.gridApi = gridApi;
            }
        };
        $scope.customerChangeCompareGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'colName', displayName: '变更字段名称', width: 100, enableCellEdit: false


                },
                {
                    name: 'colOldVal', displayName: '变更前', width: 100, enableCellEdit: false


                },
                {
                    name: 'colNewVal', displayName: '变更后', width: 100, enableCellEdit: false


                },
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                $scope.customerChangeCompareGridOptions.gridApi = gridApi;
            }
        };

        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }/*else{
            $scope.queryForGrid({});
        }*/
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
    };
    $scope.table_name = "lr_customer";
    $scope.billdef = "PersonalCustomer";
    $scope.beanName = "insurance.ExamineServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope, $rootScope);

});
app.controller('accountGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('linkmanGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
