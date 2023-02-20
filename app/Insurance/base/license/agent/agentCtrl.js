/**
 * Created by 25152 on 2017/11/20.
 */
app.controller('agentCtrl', function ($rootScope, $scope, $sce, $http, $state, $window, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $location) {
    $scope.initData = function () {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                agentCode: null,
                agentName: null,
                telephoneNo: null,
                workNo: null,
                licensedName: null,
                licensedNo: null,
                licensedDate: null,
                bankNumber: null,
                bankName: null,
                workUnits: null,
                responsibleArea: null,
                documentCode: null,
                certType: null,
                ifPartTime: 'N',//是否兼职默认否
                ifInternal: 'Y',//是否内部员工默认是
                ifCancellation: 'N',//是否注销默认否
                ifMarketingTeam: 'N',
                ifRuralMarketingStaff: 'N',
                staffContractType: 3,
                agentState: 1,//默认在职
                agentType: 1,//默认内部员工
                inTheDate: null,
                outTheDate: null,
                referralCode: null,
                contStartDate: null,
                contEndDate: null,
                agreementStartDate: null,
                agreementEndDate: null,
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                dr: 0,
                billstatus: 37,
                rewardPunishmentList: [],
                trainingRecordList: [],
                agentPoundageList: [],
                contractList: [],
                dealattachmentb: [],
                compensationList: [],
                personalAgentBusinessRegistration: 'N', //是否独立个人保险代理人工商登记
                internetMarketingPublicity: 'N', //是否允许互联网营销宣传
                personalAgent: 'N', //是否独立个人保险代理人
                practiceRegistrationStatus: 'Y', //执业登记状态
                Affiliation: null, //所属机构
                licensedEndDate: null, //注销日期
                businessScope: null, //业务范围
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "id": $stateParams.id
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode ='11001';
    };

    $scope.initHttp = function () {

        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data) {
            layer.load(2);
            return $http.post($rootScope.basePath + "agent/queryAllForGrid", {
                params: angular.toJson(data),
                fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response && response.code == 200) {
                    $scope.queryForGrid($scope.QUERY);
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;

                }
                layer.closeAll('loading');

            }).error(function () {
                $scope.queryForGrid($scope.QUERY);
                layer.closeAll('loading');
            });
        };

        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "agent/queryForGrid", {
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
        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "agent/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.rewardPunishmentGridOptions.data = $scope.VO.rewardPunishmentList;
                    $scope.trainingRecordGridOptions.data = $scope.VO.trainingRecordList;
                    $scope.contractGridOptions.data = $scope.VO.contractList;
                    $scope.compensationGridOptions.data = $scope.VO.compensationList;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealattachmentb;
                    if (callback) {
                        callback();
                    }
                } else {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            $scope.VO.referralCode = $scope.VO.agentCode;
            $scope.VO.rewardPunishmentList = $scope.rewardPunishmentGridOptions.data;
            $scope.VO.trainingRecordList = $scope.trainingRecordGridOptions.data;
            $scope.VO.contractList = $scope.contractGridOptions.data;
            $scope.VO.compensationList = $scope.compensationGridOptions.data;
            $scope.VO.dealattachmentb = $scope.dealAttachmentBGridOptions.data;
            layer.load(2);
            $http.post($rootScope.basePath + "agent/save", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isCard = true;
                        $scope.isForm = false;
                        layer.closeAll('loading');
                        angular.assignData($scope.VO, response.result);
                    }
                    // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                });
        };

    };

    $scope.initFunction = function () {
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };

        /**
         * 用过合同模板下载
         */
        $scope.onTestDown = function (type){
            let exportEx = $('#exproE');//JS原生带的文件
            exportEx.attr('target', '_blank');//设置打开 新页面 所以要在过滤器中配置
            exportEx.attr('action', $rootScope.basePath + 'agent/testDown?type='+type);//设置控制层地址
            exportEx.submit();//提交
        }
    };

    $scope.initWatch = function () {
        $scope.$watch('VO.agentState', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.VO.agentState == 1) {
                $scope.VO.ifCancellation = 'N';
            } else if($scope.VO.agentState == 2){
                $scope.VO.ifCancellation = 'Y';
            }
        }, true)
        $scope.$watch('VO.ifInternal', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.VO.ifInternal == 'Y') {
                $scope.VO.agentType = 1;
            } else {
                $scope.VO.agentType = 2;
            }
        }, true)
        $scope.$watch('VO.agentType', function (newVal, oldVal) {
            if (!$scope.isForm) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.VO.agentType == 1) {
                $scope.VO.staffContractType = 3;
                $scope.staffContractTypeEdit = true;
            } else if($scope.VO.agentType == 2){
                $scope.VO.staffContractType = 1;
                $scope.staffContractTypeEdit = false;
            } else if($scope.VO.agentType == 3){
                $scope.VO.staffContractType = 4;
                $scope.staffContractTypeEdit = true;
            }
        }, true)
    };

    $scope.initButton = function () {
        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
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
                $scope.isGrid = false;
                $scope.isCard = true;
                $scope.isForm = false;
            } else {

            }
        };

        $scope.onAdd = function () {
            $scope.isGrid = false;
            $scope.isCard = false;
            $scope.isForm = true;
            $scope.initView();
            $scope.VO = $scope.initVO();
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
                $scope.findOne(rows[0].id);
                $scope.isGrid = false;
                $scope.isCard = false;
                $scope.isForm = true;
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
                    $http.post($scope.basePath + "agent/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
            if ($scope.VO.id && $scope.VO.id != '') {
                $scope.isGrid = false;
                $scope.isCard = true;
                $scope.isForm = false;
            } else {
                $scope.isGrid = true;
                $scope.isCard = false;
                $scope.isForm = false;
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
                    //如果该执业人员是注销状态，则执业登记状态为无效。
                    if($scope.VO.ifCancellation == 'Y'){
                        $scope.VO.practiceRegistrationStatus == 'N';

                    }
                    //如果“是否注销”字段为“是”，则执业登记注销日期必填
                    if($scope.VO.ifCancellation == 'Y'){
                        if($scope.VO.licensedEndDate == null || $scope.VO.licensedEndDate == ''){
                            return layer.alert("注销时必须填写执业登记注销日期！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }

                    }
                    //所属机构不允许出现特殊字符
                    var reg = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘'，。、]/im;
                    if(reg.test($scope.VO.Affiliation)){
                        return layer.alert("所属机构不允许出现特殊字符！",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    //业务范围不允许出现特殊字符
                    if(reg.test($scope.VO.businessScope)){
                        return layer.alert("业务范围不允许出现特殊字符！",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if($scope.VO.ifInternal == 'Y' || $scope.VO.agentType == 3){
                        if($scope.VO.contStartDate > $scope.VO.contEndDate){
                            return layer.alert("合同生效日期必须小于合同到期日期！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    //注销时必须填写离职日期
                    if($scope.VO.ifCancellation == 'Y' || $scope.VO.agentState == 2){
                        if($scope.VO.outTheDate == null || $scope.VO.outTheDate == ''){
                            return layer.alert("离职或注销时必须填写离职日期！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if($scope.VO.ifInternal == 'Y' || $scope.VO.agentType == 3){
                        if($scope.VO.contStartDate > $scope.VO.contEndDate){
                            return layer.alert("合同生效日期必须小于合同到期日期！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    //注销时必须填写离职日期
                    if($scope.VO.ifCancellation == 'Y' || $scope.VO.agentState == 2){
                        if($scope.VO.outTheDate == null || $scope.VO.outTheDate == ''){
                            return layer.alert("离职或注销时必须填写离职日期！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    //@zhangwj BUG 【YDBXJJ-2428】 必须上传签署版合同
                    let ifUp = true;
                    if($scope.dealAttachmentBGridOptions.data && $scope.dealAttachmentBGridOptions.data.length > 0){
                        for (let i = 0; i < $scope.dealAttachmentBGridOptions.data.length; i++) {
                            if($scope.dealAttachmentBGridOptions.data[i].file_type == 4){
                                ifUp = false;
                            }
                        }
                        if(ifUp){
                            return layer.alert("请上传附件且必须包含签署版合同！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }else{
                        return layer.alert("请上传附件且必须包含签署版合同！",
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
         * 初始化参照
         */
        $scope.initView = function () {

            $scope.rewardPunishmentGridOptions.data = [];
            $scope.trainingRecordGridOptions.data = [];
            $scope.contractGridOptions.data = [];
            $scope.compensationGridOptions.data = [];
            $scope.dealAttachmentBGridOptions.data = [];
        };

        /**
         * 子表新增
         */
        $scope.onAddLine = function (selectTabName) {
            let data = {};
            if($scope[selectTabName].data) {
                $scope[selectTabName].data.push(data);
            }else{
                $scope[selectTabName].data = [];
                $scope[selectTabName].data.push(data);

            }
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
        //列表界面
        $scope.isGrid = true;
        //卡片界面
        $scope.isCard = false;
        //编辑界面
        $scope.isForm = false;
        //列表界面子表是否显示
        $scope.chilbTable = false;
        //用工合同是否可编辑
        $scope.staffContractTypeEdit = true;
        $scope.gridOptions = {
            rowTemplate: "<div ng-dblclick=\"grid.appScope.onRowDblClick(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>",
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [50, 100, 500],
            paginationPageSize: 50,
            useExternalPagination: true,
            exporterMenuCsv: true,
            showGridFooter: true,
            showColumnFooter: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '执业人员信息.csv',
            columnDefs: [
                {name: 'agentCode', displayName: '执业人员信息编号', width: 75,},
                {name: 'agentName', displayName: '姓名', width: 75,},
                {name: 'agentType', displayName: '执业人员类型', cellFilter: 'SELECT_AGENTTYPE',width: 100},
                {name: 'gender', displayName: '性别', cellFilter: 'SELECT_SEXTYPE',width: 100},
                {name: 'certType', displayName: '证件类型', cellFilter: 'SELECT_CERTCODETYPE',width: 100},
                {name: 'documentCode', displayName: '证件号码',width: 100},
                {name: 'telephoneNo', displayName: '手机号',width: 100},
                {name: 'workNo', displayName: '工号',width: 100},
                {name: 'licensedNo', displayName: '执业证编号',width: 100},
                {name: 'licensedName', displayName: '执业证名称',cellFilter: 'SELECT_ZYZTYPE',width: 100},
                {name: 'responsibleArea', displayName: '执业区域',width: 100},
                {name: 'licensedDate', displayName: '执业登记日期',width: 100},
                {name: 'practiceRegistrationStatus', displayName: '执业登记状态',cellFilter: 'SELECT_PRACTICE_REGISTRATION_STATUS',width: 100},
                {name: 'licensedEndDate', displayName: '执业登记注销日期',width: 100},
                {name: 'personalAgentBusinessRegistration', displayName: '是否独立个人保险代理人工商登记', cellFilter: 'SELECT_YESNO',width: 100},
                {name: 'internetMarketingPublicity', displayName: '是否允许互联网营销宣传', cellFilter: 'SELECT_YESNO',width: 100},
                {name: 'personalAgent', displayName: '是否独立个人保险代理人', cellFilter: 'SELECT_YESNO',width: 100},
                {name: 'Affiliation', displayName: '所属机构',width: 100},
                {name: 'businessScope', displayName: '业务范围',width: 200},
                {name: 'workUnits', displayName: '工作单位',width: 100},
                {name: 'bankName', displayName: '开户行',width: 100},
                {name: 'agreementStartDate', displayName: '协议生效日期',width: 100},
                {name: 'agreementEndDate', displayName: '协议到期日期',width: 100},
                {name: 'bankNumber', displayName: '银行卡号',width: 100},
                {name: 'agentState', displayName: '职工状态', cellFilter: 'SELECT_STAFFTYPE',width: 100},
                {name: 'inTheDate', displayName: '入职日期',width: 100},
                {name: 'outTheDate', displayName: '离职日期',width: 100},
                {name: 'ifPartTime', displayName: '是否兼职', cellFilter: 'SELECT_YESNO',width: 100},
                {name: 'ifCancellation', displayName: '是否注销', cellFilter: 'SELECT_YESNO',width: 100},
                {name: 'pkOperator.name', displayName: '经办人',width: 100},
                {name: 'operateDate', displayName: '制单日期',width: 100, cellFilter: 'date_cell_date'},
                {name: 'operateTime', displayName: '制单时间',width: 100},
                {name: 'pkOrg.name', displayName: '业务单位',width: 100},
                {name: 'pkDept.name', displayName: '部门',width: 100},
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

        $scope.selectTabName = 'rewardPunishmentGridOptions';
        //奖惩记录
        $scope.rewardPunishmentGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'rewardPunishmentType',
                    displayName: '奖惩类型',
                    width: 150,
                    cellFilter: 'SELECT_REWARDPUNISHMENTTYPE'
                    ,
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: $rootScope.SELECT.REWARDPUNISHMENTTYPE,
                },
                {
                    name: 'acceptDate',
                    displayName: '日期',
                    width: 150,
                    editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'memo', displayName: '事项描述', width: 550
                },
            ],
            data: $scope.VO.rewardPunishmentList,
            onRegisterApi: function (gridApi) {
                $scope.rewardPunishmentGridOptions.gridApi = gridApi;
            }
        };
        //薪酬
        $scope.compensationGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'wage', displayName: '薪酬金额（元）', width: 150, cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'acceptDate',
                    displayName: '发放日期',
                    width: 150,
                    editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'memo', displayName: '说明', width: 550
                },
            ],
            data: $scope.VO.compensationList,
            onRegisterApi: function (gridApi) {
                $scope.compensationGridOptions.gridApi = gridApi;
            }
        };
        //岗前培训记录
        $scope.trainingRecordGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'file_type', displayName: '附件类型', width: 100
                },
                {
                    name: 'attachment_name', displayName: '附件名称', width: 100
                },
                {
                    name: 'cUpdate', displayName: '上传时间', width: 100, cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'startDate', displayName: '协议生效日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'endDate', displayName: '协议到期日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'pk_project_id',
                    displayName: ' ',
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ng-click="grid.appScope.onPreviewFile(row.entity.pk_project_id,row.entity.attachment_name)" class="btn btn-transparent btn-xs tooltips" tooltip-placement="top">在线预览&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i></a></div>'
                }
            ],
            data: $scope.VO.trainingRecordList,
            onRegisterApi: function (gridApi) {
                $scope.trainingRecordGridOptions.gridApi = gridApi;
            }
        };
        //合同信息
        $scope.contractGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'economicContract.code', displayName: '经法合同编号',

                    enableCellEdit: true,
                    url: 'economicContract/queryForClearing',
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    isTree: false,
                    popupModelField: 'economicContract',
                    enableCellEdit: true,
                },
                {
                    name: 'economicContract.name', displayName: '经法合同名称', enableCellEdit: false,
                },
                {
                    name: 'contStartDate', displayName: '协议生效日期', editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'contEndDate', displayName: '协议到期日期', editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'
                },
            ],
            data: $scope.VO.contractList,
            onRegisterApi: function (gridApi) {
                $scope.contractGridOptions.gridApi = gridApi;
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
                {
                    name: 'file_type',
                    displayName: '附件类型',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_AGENTFILETYPE',
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownValueLabel: 'name',
                    editDropdownOptionsArray: getSelectOptionData.DOUCUMENTTYPE
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
            data: $scope.VO.dealattachmentb,
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

        if ($stateParams.id) {
            $scope.queryForGrid($scope.QUERY);
        } else {
            $scope.queryForGrid({});
        }

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

    initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope, $rootScope);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);

});
