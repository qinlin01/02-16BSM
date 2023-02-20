app.controller('professionalLiabilityInsuranceCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $location) {

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
                year:parseInt(new Date().format("yyyy")),
                dealAttachmentB: [],//附件
                billstatus:4,//已确认
                insuranceno:'',//保单号
                insurer:'',//保险人
                applicant:'',//投保人
                insured:[],//被保险人
                start_date:null,//保险开始时间
                end_date:null,//保险结束时间
                premium:'',//保险费
                insurance:'职业责任险',//保险费
                compensationInfo:[]//子表
            }
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "id": $stateParams.id,
                "year":parseInt(new Date().format("yyyy")),
                "dr":0
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode = '3020601';
    };

    $scope.initHttp=function(){
        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($rootScope.basePath  + "professionalLiabilityInsurance/queryForGrid", {
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

    };

    $scope.initFunction = function () {
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.initVOData = function () {
            $scope.VO =  $scope.initVO();
            $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
            $scope.compensationInfoGridOptions.data = $scope.VO.compensationInfo;
            $scope.insuredGridOptions.data = $scope.VO.insured;
        }
    };

    $scope.initButton = function(){
        /**
         * 修改
         * */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isBack = false;
            $scope.isDisabled=false;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.isCard = false;
                $scope.isEdit = true;
                $scope.isDisabled = false;
                $scope.isBack = false;
                let rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id);
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
                    $http.post($rootScope.basePath  + "professionalLiabilityInsurance/delete", {ids: angular.toJson(ids)}).success(function (response) {
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

        $scope.findOne = function (pk,callback) {
            $scope.pk = pk;
            $http.post($rootScope.basePath + "professionalLiabilityInsurance/findOne",{pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200"){
                    angular.assignData($scope.VO,response.result);
                    if (callback){
                        callback;
                    };

                }else {
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


        $scope.onAdd = function () {
            $scope.initVOData();
            $scope.isGrid = false;
            $scope.isCard = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.isBack = false;
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
                        let dealAttachmentB ={};
                        dealAttachmentB.file_type="其他";
                        dealAttachmentB.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                        angular.forEach(value, function (item) {
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
            $http.post( $rootScope.basePath + "professionalLiabilityInsurance/findOne",{
                pk: id
            }).success(function (response) {
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
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
            $scope.initVOData();
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isBack= false;
            $scope.isDisabled = true;
            //阻止页面渲染
            $scope.queryForGrid($scope.QUERY);
        };
        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            $scope.isDisabled = true;
            $scope.isBack = true;
        };

        /**
         * 保存
         * */
        $scope.onSave = function () {
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $scope.VO.compensationInfo = $scope.compensationInfoGridOptions.data;
            $scope.VO.insured= $scope.insuredGridOptions.data;
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }else{
                    if ($scope.VO.dealAttachmentB.length==0){
                        return layer.alert("请上传附件!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.VO.compensationInfo.length==0){
                        return layer.alert("请填写赔偿限额!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.VO.insured.length==0){
                        return layer.alert("请填写被保险人!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }

                    for(let i =0;i<$scope.insuredGridOptions.data.length;i++){
                        if(!$scope.insuredGridOptions.data[i].insurancedmanpk){
                            return layer.alert("请选择被保险人!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }

                    for(let i =0;i<$scope.compensationInfoGridOptions.data.length;i++){
                        if(!$scope.compensationInfoGridOptions.data[i].onceCompensation){
                            return layer.alert("赔偿限额不可为0!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if(!$scope.compensationInfoGridOptions.data[i].allCompensation){
                            return layer.alert("赔偿限额不可为0!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if($scope.compensationInfoGridOptions.data[i].onceCompensation==0 || $scope.compensationInfoGridOptions.data[i].allCompensation==0){
                            return layer.alert("赔偿限额不可为0!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if(!$scope.VO.premium){
                        return layer.alert("请填写保险费!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if(!($scope.VO.premium>0)){
                        return layer.alert("保险费必大于0!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if($scope.VO.start_date >= $scope.VO.end_date){
                        return layer.alert("保险结束日期必须大于保险开始日期!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    layer.load(2);
                        $http.post( $rootScope.basePath  + "professionalLiabilityInsurance/save",{data:angular.toJson($scope.VO)}).success(function(response) {
                            if(response.code == 200){
                                $scope.isBack = true;
                                $scope.isDisabled = true;
                                angular.assignData($scope.VO, response.result);
                                layer.confirm("保存成功",{
                                    btn: ['确定'],
                                }, function (btn) {
                                    layer.close(btn);
                                });
                                layer.closeAll('loading');

                            }
                        });
                }
            });

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
        $scope.onDeleteLine = function () {
            let delRow = $scope[$scope.selectTabName].gridApi.selection.getSelectedRows();

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
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.chilbTable = true;
        //代办
        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
        //主表
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
            exporterCsvFilename: '职业责任保险.csv',
            columnDefs: [
                {name: 'insuranceno', displayName: '保单号', cellFilter: 'CSV_FILTER'},
                {name: 'insurance', displayName: '险种', cellFilter: 'CSV_FILTER'},
                {name: 'insurer.name', displayName: '保险人'},
                {name: 'applicant.name', displayName: '投保人'},
                {name: 'premium', displayName: '保险费', cellFilter: 'AMOUNT_FILTER'},
                {name: 'start_date', displayName: '保险起始日期'},
                {name: 'end_date', displayName: '保险到期日期'},
                {name: 'billstatus', displayName: '单据状态', cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '制单人'},
                {name: 'operateDate', displayName: '制单时间'},
                {name: 'pkOrg.name', displayName: '制单部门'}
            ],
            data: [],
            exporterAllDataFn: function(){
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
                    angular.assignData($scope.VO, row.entity);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });
        };
        //子表
        $scope.compensationInfoGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {name: 'allCompensation', displayName: '累计赔偿限额', width: 200,cellFilter: 'AMOUNT_FILTER'},
                {name: 'onceCompensation', displayName: '每次事故赔偿限额', width: 200,cellFilter: 'AMOUNT_FILTER'},
            ],
            data: $scope.VO.compensationInfo,
            onRegisterApi: function (gridApi) {
                $scope.compensationInfoGridOptions.gridApi = gridApi;
                $scope.compensationInfoGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };
        //被保险人
        $scope.insuredGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'insurancedmanpk.name',
                    displayName: '被保人',
                    width: 250,
                    // enableCellEdit: $scope.isDw,
                    url: 'customerInsuRef/queryForGrid'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'insurancedmanpk',
                    params: {type: 'beibaoxianren',
                    }
                }
            ],
            data: $scope.VO.insured,
            onRegisterApi: function (gridApi) {
                $scope.insuredGridOptions.gridApi = gridApi;
                $scope.insuredGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };
        //附件
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
                {name: 'file_type', displayName: '附件类型', width: 100, enableCellEdit: false},
                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},
                {name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false},
            ],
            data: $scope.VO.dealAttachmentB,
            onRegisterApi: function (gridApi) {
                $scope.dealAttachmentBGridOptions.gridApi = gridApi;
                $scope.dealAttachmentBGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };
    };

    $scope.initWatch = function(){
        $scope.$watch('VO.start_date', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            // || (!angular.isUndefined($scope.VO.pkReport))
            if (newVal === oldVal || newVal == undefined || newVal == null) return;

            if ($scope.isEdit) {

                let olddatval = "";
                if (oldVal != null) {
                    olddatval = new Date(oldVal).format("yyyy-MM-dd");
                    ;
                }
                let newdatval = "";
                if (newVal != null) {
                    newdatval = new Date(newVal).format("yyyy-MM-dd");
                    ;
                }
                if (newdatval == olddatval) {
                    return;
                }
                let now = new Date().getTime();
                let selected = new Date(newVal).getTime();
                let dates = (new Date(newVal).setFullYear(new Date(newVal).getFullYear() + 1));
                $scope.VO.end_date = new Date(dates).setDate(new Date(dates).getDate() - 1);
                let startDate = new Date($scope.VO.start_date).getTime();
                let endDate = new Date($scope.VO.end_date).getTime();
                let yearStart = new Date($scope.VO.start_date);
                let yearStart1 = new Date($scope.VO.start_date);
                let yearEnd = yearStart1.setFullYear(yearStart.getFullYear()+1);
                let time = yearEnd - yearStart.getTime();
                let datetime = parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000);
                if (!datetime) {
                    return layer.alert("请先选择保险起始日期",{skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
        }, true);
        $scope.$watch('VO.end_date', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            let olddatval = "";
            if (oldVal != null) {
                olddatval = new Date(oldVal).format("yyyy-MM-dd");
            }
            let newdatval = "";
            if (newVal != null) {
                newdatval = new Date(newVal).format("yyyy-MM-dd");
            }
            if (newdatval == olddatval) {
                return;
            }
            if (typeof(oldVal) == "object" || newVal === oldVal || olddatval == newdatval || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                let startDate = new Date($scope.VO.start_date).getTime();
                let endDate = new Date($scope.VO.end_date).getTime();
                let yearStart = new Date($scope.VO.start_date);
                let yearStart1 = new Date($scope.VO.start_date);
                let yearEnd = yearStart1.setFullYear(yearStart.getFullYear()+1);
                let time = yearEnd - yearStart.getTime();
                let datetime = parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000);
                if (!datetime) {
                    return layer.alert("请先选择保险起期",{skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
        }, true);
    }

    $scope.onAddLine = function () {
        let data = {};
        if ($scope.selectTabName == 'compensationInfoGridOptions') {//赔偿限额
            $scope[$scope.selectTabName].data.push(data);
        }
        if ($scope.selectTabName == 'insuredGridOptions') {//赔偿限额
            $scope[$scope.selectTabName].data.push(data);
        }
    };



    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();

        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {
            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }
    };
    $scope.selectTabName = "compensationInfoGridOptions";
    $scope.billdef = "ProfessionalLiabilityInsurance";
    $scope.table_name = " lr_professionalLiabilityInsurance";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initButton();
    $scope.initPage();
    $scope.initWatch();
    initworkflow($scope, $http,ngDialog);
    initonlineView($scope,$rootScope,$sce,$http,ngDialog);
});