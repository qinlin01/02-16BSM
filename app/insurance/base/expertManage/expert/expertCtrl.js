/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('expertCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                expertTecl: [{datastatus:0}],
                expertReport: [{datastatus:0}],
                expertProject: [{datastatus:0}],
                expertEmployed: [{datastatus:0}],
                expertProjectExperience: [{datastatus:0}],
                expertCaibno: [{datastatus:0}],
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                dr: 0,
                datastatus:0,
                billstatus:31,
                costscale: [],
                coomedium: []
            };
        };
        $scope.entityVO = 'nc.vo.busi.ExpertVO';
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
       $scope.initQUERY = function () {
            return {
                "operate_year": parseInt(new Date().format("yyyy")),
                "id":$stateParams.id
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode ='10601';
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "expert/queryForGrid", {
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
            $http.post($scope.basePath + "expert/findOne", {pk: pk}).success(function (response) {
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
                   // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "expert/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
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

        $scope.onPrint = function() {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            $http.post($scope.basePath + "expert/print", {data: angular.toJson(rows[0])}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    $scope.result = angular.copy(response.result);
                    $rootScope.onPublicPrint(null,$scope.htmlPath,$scope);

                }

            });
        }
    };

    $scope.initWatch = function () {
        $scope.$watch('VO.style', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['styleName'] = $rootScope.SELECT.STYLE[newVal-1].name;
            }
        }, true);

        $scope.$watch('VO.certtype', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['certtypeName'] = $rootScope.SELECT.CERTCODETYPE[newVal-1].name;
            }
        }, true);

        $scope.$watch('VO.education', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['educationName'] = $rootScope.SELECT.EDUCATIONTYPE[newVal-1].name;
            }
        }, true);

        $scope.$watch('VO.filetype', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['filetypeName'] = $rootScope.SELECT.PHOTOTYPE[newVal-1].name;
            }
        }, true);

    };

    $scope.initButton = function () {
        $scope.onUploads = function () {
            $scope.isSubDisabled = false;

            $scope.aVO = {};
            /*else {
             $scope.bVO = {};
             }*/
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


        /*$scope.onLinkAuditFlow = function () {
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
                    $http.post($scope.basePath + "expert/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
                    $scope.VO.styleName = $rootScope.returnSelectName($scope.VO.style,"STYLE");
                    $scope.VO.adjunctinstructorName = $rootScope.returnSelectName($scope.VO.adjunctinstructor,"YESNONUM");
                    $scope.VO.certtypeName = $rootScope.returnSelectName($scope.VO.certtype,"CERTCODETYPE");
                    $scope.VO.genderName = $rootScope.returnSelectName($scope.VO.gender,"SEXTYPE");
                    $scope.VO.educationName = $rootScope.returnSelectName($scope.VO.education,"EDUCATIONTYPE");
                    $scope.VO.filetypeName = $rootScope.returnSelectName($scope.VO.filetype,"PHOTOTYPE");
                    //校验是否填写了"是否为兼职讲师",否则提交时有问题
                    if ($scope.VO.adjunctinstructor == null || $scope.VO.adjunctinstructor == undefined) {
                        return layer.alert("请选择是否为兼职讲师!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
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
         * 子表新增
         */
        $scope.onAddLine = function () {

            if ($scope.selectTabName == 'expertProjectGridOptions') {
                $scope[$scope.selectTabName].data.push({
                    pkOrg: $rootScope.orgVO
                });
            }
            else{
                $scope[$scope.selectTabName].data.push({});
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
        $scope.form=false;
        $scope.card=false;
        $scope.isClear = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;
        //控制附件上传和下载
        $scope.upOrDown = false;
        $scope.htmlPath = 'view/expert/expertPrint.html';
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
            exporterCsvFilename: '专家库管理.csv',
            columnDefs: [
                {name: 'style', displayName: '类型', width: 100, cellFilter: 'SELECT_STYLE'},
                {name: 'adjunctinstructor', displayName: '是否为兼职讲师', width: 100, cellFilter: 'SELECT_YESNONUM'},
                {name: 'name', displayName: '姓名', width: 100,},
                {name: 'gender', displayName: '性别', width: 100, cellFilter: 'SELECT_SEXTYPE'},
                {name: 'birthday', displayName: '出生年月', width: 100,},
                {name: 'age', displayName: '年龄', width: 100,},
                {name: 'certtype', displayName: '证件类型', width: 100, cellFilter: 'SELECT_CERTCODETYPE'},
                {name: 'certcode', displayName: '证件号码', width: 100,},
                {name: 'education', displayName: '学历', width: 100, cellFilter: 'SELECT_EDUCATIONTYPE'},
                {name: 'nativeplace', displayName: '籍贯', width: 100,},
                {name: 'nation', displayName: '民族', width: 100,},
                {name: 'graDate', displayName: '毕业日期', width: 100,},
                {name: 'graSchool', displayName: '毕业学校', width: 100,},
                {name: 'subject', displayName: '所学专业', width: 100,},
                {name: 'workDate', displayName: '参加工作日期', width: 100,},
                {name: 'job', displayName: '职务', width: 100,},
                {name: 'rank', displayName: '职级', width: 100,},
                {name: 'caibno', displayName: '保险经纪从业人员执业证书编号', width: 100,},
                {name: 'yearsofworking', displayName: '从事相关工作年限', width: 100,},
                {name: 'filetype', displayName: '照片类型', width: 100, cellFilter: 'SELECT_PHOTOTYPE'},
                {name: 'workDep', displayName: '工作单位', width: 100,},
                {name: 'phone', displayName: '办公电话', width: 100,},
                {name: 'telepho', displayName: '手机', width: 100,},
                {name: 'mail', displayName: '电子邮箱', width: 100,},
                {name: 'address', displayName: '通讯地址', width: 100,},
                {name: 'post', displayName: '邮编', width: 100,},
                {name: 'foundperson.name', displayName: '建立人', width: 100,},
                {name: 'fileNum', displayName: '附件数量', width: 100,},
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'operateDate', displayName: '制单日期', width: 100,},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '业务部门', width: 100,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
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

        $scope.selectTabName = 'expertTeclGridOptions';
        $scope.expertTeclGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'etDate', displayName: '日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , type: 'date' , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'etName', displayName: '名称', width: 100


                },
                {
                    name: 'department', displayName: '授予部门', width: 100


                },
            ],
            data: $scope.VO.expertTecl,
            onRegisterApi: function (gridApi) {
                $scope.expertTeclGridOptions.gridApi = gridApi;
            }
        };
        $scope.expertReportGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'erDate', displayName: '日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , type: 'date' , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'erName', displayName: '发表学术刊物名称', width: 100


                },
                {
                    name: 'duty', displayName: '担任的职务', width: 100


                },
            ],
            data: $scope.VO.expertReport,
            onRegisterApi: function (gridApi) {
                $scope.expertReportGridOptions.gridApi = gridApi;
            }
        };
        $scope.expertProjectGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                /*{
                    name: 'pkExpert', displayName: '专家主键', width: 100


                },
                {
                    name: 'pkExpertProject', displayName: '主键', width: 100


                },*/
                {
                    name: 'startDate', displayName: '开始日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , type: 'date' , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'endDate', displayName: '结束日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , type: 'date' , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'proName', displayName: '立项名称', width: 100


                },
                {
                    name: 'role', displayName: '担任角色', width: 100


                },
                {
                    name: 'workCont', displayName: '具体工作内容', width: 100


                },
                {
                    name: 'isChangan', displayName: '是否在长安公司', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'pkOrg.name', displayName: '业务单位', width: 100, enableCellEdit: false


                },
                {
                    name: 'averages', displayName: '平均分数', width: 100, enableCellEdit: false


                },
                {
                    name: 'button1', displayName: '项目评价', width: 100


                },
            ],
            data: $scope.VO.expertProject,
            onRegisterApi: function (gridApi) {
                $scope.expertProjectGridOptions.gridApi = gridApi;
            }
        };
        $scope.expertEmployedGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'startDate', displayName: '开始日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , type: 'date' , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'endDate', displayName: '结束日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , type: 'date' , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'empContract.name', displayName: '聘用合同附件', width: 100, url: 'BLOBREFMODEL'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'empContract'

                },
                {
                    name: 'button1', displayName: '操作', width: 100


                },
            ],
            data: $scope.VO.expertEmployed,
            onRegisterApi: function (gridApi) {
                $scope.expertEmployedGridOptions.gridApi = gridApi;
            }
        };
        $scope.expertProjectExperienceGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'projectname', displayName: '项目名称', width: 100


                },
                {
                    name: 'projecttype.name', displayName: '行业类别', width: 100, url: 'industryTypeRef/queryForGrid'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'projecttype',isTree: true

                },
                {
                    name: 'projectjob', displayName: '项目中任职', width: 100


                },
                {
                    name: 'projecttext', displayName: '项目内容', width: 100


                },
                {
                    name: 'startDate', displayName: '项目开始日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , type: 'date' , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'endDate', displayName: '项目结束日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , type: 'date' , editableCellTemplate: 'ui-grid/refDate'
                },
            ],
            data: $scope.VO.expertProjectExperience,
            onRegisterApi: function (gridApi) {
                $scope.expertProjectExperienceGridOptions.gridApi = gridApi;
            }
        };
        $scope.expertCaibnoGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'caibnotime', displayName: '时间', width: 100, editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'caibnoname', displayName: '资格证书名称', width: 100


                },
                {
                    name: 'grantunit', displayName: '授予单位', width: 100


                },
            ],
            data: $scope.VO.expertCaibno,
            onRegisterApi: function (gridApi) {
                $scope.expertCaibnoGridOptions.gridApi = gridApi;
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
            //selectionRowHeaderWidth: 35,
            //rowHeight: 35,
            //showGridFooter:false,
            columnDefs: [
                // {name: 'source_billtypeVO.bill_name', displayName: '表单来源类型', width: 120},
                // {name: 'pk_document_dir.name', displayName: '文档分类', width: 120},
                {name: 'attachment_name', displayName: '附件名称', width: 120},
                {
                    name:'pk_project_id',
                    displayName:' ',
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ng-click="grid.appScope.onPreviewFile(row.entity.pk_project_id,row.entity.attachment_name)" class="btn btn-transparent btn-xs tooltips" tooltip-placement="top">在线预览&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i></a></div>'
                }
                // // {name: 'pk_object_id.name', displayName: '附件', width: 120},
                // {name: 'upload_operator.name', displayName: '上传人姓名', width: 120},
                // {name: 'upload_date', displayName: '上传日期', width: 120, cellFilter: 'date:"yyyy-MM-dd"'},
                // {name: 'attachment_source', displayName: '附件来源', width: 120, cellFilter: 'SELECT_ATTACHMENT_SOURCE'},
                // {name: 'carrier_type', displayName: '载体类型', width: 120, cellFilter: 'SELECT_CARRIER_TYPE'},
                // {name: 'carrier_desc', displayName: '附件存放位置', width: 120},
                // {name: 'memo', displayName: '备注', width: 120}
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
        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {
            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }
    };
    $scope.table_name = "lr_expert";
    $scope.billdef = "Expert";
    $scope.beanName ="insurance.ExamineServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initPreviewFile($scope,$rootScope);

    initworkflow($scope, $http,ngDialog);
    initonlineView($scope,$rootScope,$sce,$http,ngDialog);

});
app.controller('expertTeclGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('expertReportGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('expertProjectGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('expertEmployedGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('expertProjectExperienceGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('expertCaibnoGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
