/**
 * Created by Aiko on 2020/8/27
 */
app.controller('localizedTrainTranslateCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                trainPlan: [],
                trainObject: [],
                dealAttachmentB:[],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                billstatus:31,
                dr: 0
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return { 
             "serviceYear": parseInt(new Date().format("yyyy")),
             "id":$stateParams.id
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.localizedCustomerTrainRef =
            {
                id: $scope.$id,
                columnDefs: [
                    {
                        field: 'trainCode',
                        displayName: '培训编号'
                    },
                    {
                        field: 'trainTheme',
                        displayName: '培训名称'
                    }
                ],
                data: ""
            };
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.localizedPath + "LocalizedTrainTranslate/queryForGrid", {
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
                if (response.code == 500) {
                    layer.alert(response.msg);
                }
                layer.closeAll('loading');
            });
        };
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.localizedPath + "LocalizedTrainTranslate/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.trainPlanGridOptions.data = $scope.VO.localizedCustomerTrain.trainPlan;
                    $scope.trainObjectGridOptions.data = $scope.VO.localizedCustomerTrain.trainObject;
                    $scope.dealAttachmentBGridOptions.data= $scope.VO.dealAttachmentB==undefined? [] :$scope.VO.dealAttachmentB;
                } else {
                    if (response.code == 500) {
                        layer.alert(response.msg);
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
                }
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function (func) {
            layer.load(2);
            $scope.VO.dealAttachmentB=$scope.dealAttachmentBGridOptions.data;
            $http.post($scope.localizedPath + "LocalizedTrainTranslate/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if(func){

                    }else if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                    }
                    if (response.code == 500) {
                        return layer.alert(response.msg);
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
                });
        };
        $scope.onTemporary = function (func) {
            layer.load(2);
            $scope.VO.dealAttachmentB=$scope.dealAttachmentBGridOptions.data;
            $http.post($scope.localizedPath + "LocalizedTrainTranslate/onTemporary", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if(func){

                    }else if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                    }
                    if (response.code == 500) {
                        return layer.alert(response.msg);
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
        $scope.dateMinus = function(start,end){
            var nowstart = new Date(start);
            var nowend = new Date(end);
            var days = nowend.getTime() - nowstart.getTime();
            var day = parseInt(days / (1000 * 60 * 60 * 24))+1;
            return day;
        }
    };

    $scope.initWatch = function () {
            $scope.$watch('VO.localizedCustomerTrain', function (newVal, oldVal) {
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                if ($scope.isEdit) {
                    $scope.trainObjectGridOptions.data=$scope.VO.localizedCustomerTrain.trainObject;
                    $scope.trainPlanGridOptions.data=$scope.VO.localizedCustomerTrain.trainPlan;
                    $scope.dealAttachmentBGridOptions.data=$scope.VO.localizedCustomerTrain.dealAttachmentB;
                }
            }, true);
    };

    $scope.initButton = function () {
        //打印资金到账通知单
        $scope.onPrintSignCheckBill = function (gridApi,htmlPathCheckBill,type) {
            $scope.raq = type;
            //feedBack
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);

            $http.post($scope.localizedPath + 'LocalizedTrainTranslate/signCheckBill', {
                data: angular.toJson($scope.VO),
                raq: $scope.raq,
                type: "PDF"
            },{responseType:'arraybuffer'}).success(function (response) {
                var files = new Blob([response],{type: "application/pdf",filename:response.name});
                var fileURL = URL.createObjectURL(files);
                $scope.content=$sce.trustAsResourceUrl(fileURL);
                $scope.type = "application/pdf";
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: 'pdfView.html',
                    className: 'ngdialog-theme-formInfo',
                    controller: 'pdfViewCtrl',
                    scope: $scope,
                    preCloseCallback: function (value) {
                        if (value && value == "clear") {
                            //重置
                            return false;
                        }
                        //取消
                        return true;
                    }
                })
            });
        }

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
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
   /*     $scope.onDownLoads = function () {
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
        };*/


       $scope.onDownLoadsCard = function(id){
           var data={};
           data.menu_Id="150302";
           data.id="2020JSPXGZJH000001";
           data.pk_project_id=id;

           test = JSON.stringify(data);
           tests = SM2Encrypt(test);
           console.log(tests);
           var exportEx = $('#exproE');
           $('#exproE #data').val(tests);
           exportEx.attr('target','_blank');
           exportEx.attr('action',$scope.localizedPath+'download/downloadFiles');
           exportEx.submit();
       };

      /*  $scope.onDownLoadsCard = function (id) {
            var ids = [];
            ids.push(id);
            var exportEx = $('#exproE');
            exportEx.attr('target','_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action',$rootScope.basePath+'uploadFile/downloadFiles');
            exportEx.submit();
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
            };
        };
        /**
         * 暂存
         */

        $scope.onAdd = function () {
            $scope.form=true;
            $scope.isClear = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            angular.assignData($scope.VO, $scope.initVO());
            $scope.trainPlanGridOptions.data = [];
            $scope.trainObjectGridOptions.data = [];
            $scope.dealAttachmentBGridOptions.data = [];
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
            $http.post($scope.localizedPath + "LocalizedTrainTranslate/findOne", {pk:id,tableName:$scope.table_name,billdef:$scope.billdef}).success(function (response)  {
                if (response && response.code == "200") {
                    $scope.card=true;
                    angular.assignData($scope.VO, response.result);
                    $scope.trainPlanGridOptions.data = $scope.VO.localizedCustomerTrain.trainPlan;
                    $scope.trainObjectGridOptions.data = $scope.VO.localizedCustomerTrain.trainObject;
                    $scope.dealAttachmentBGridOptions.data= $scope.VO.dealAttachmentB==undefined ? [] : $scope.VO.dealAttachmentB;
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
                }
            });
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
                    $http.post($scope.localizedPath + "LocalizedTrainTranslate/delete", {ids: angular.toJson(ids)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg('删除成功!', {
                                icon: 1
                            });
                        }
                        if (response.code == 500) {
                            return layer.alert(response.msg);
                        }
                    });
                }
            );
        };

        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            if($scope.isClear){
                $scope.VO = $scope.initVO();
                $scope.trainPlanGridOptions.data = $scope.VO.trainPlan;
                $scope.trainObjectGridOptions.data = $scope.VO.trainObject;
                $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB==undefined ? [] :$scope.VO.dealAttachmentB;
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
                    // 如果是暂存的数据时，需要修正单据状态
                    if ($scope.VO.billstatus == 37) {
                        $scope.VO.billstatus = 31;
                    }
                    if( $scope.dealAttachmentBGridOptions.data.length==0){
                        return layer.alert("请上传附件信息!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    for(var i=0;i<$scope.dealAttachmentBGridOptions.data.length;i++){
                        if(null==$scope.dealAttachmentBGridOptions.data[i].fileType){
                            return layer.alert("请选择附件类型信息!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    //校验所有附件类型
                    for(let i = 0 ; i < getSelectOptionData.LOCALIZEDTRAINTRANSLATEFILETYPE.length;i++) {
                            var flag = true;
                        for (let j = 0; j < $scope.dealAttachmentBGridOptions.data.length; j++) {
                            if(getSelectOptionData.LOCALIZEDTRAINTRANSLATEFILETYPE[i].id == $scope.dealAttachmentBGridOptions.data[j].fileType){
                                flag = false;
                            }
                        }
                        if(flag){
                            return layer.alert("请上传" +  getSelectOptionData.LOCALIZEDTRAINTRANSLATEFILETYPE[i].name + "附件类型!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
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

        $scope.initView = function () {
        };

        /**
         * 子表新增
         */
        $scope.onAddLine = function (selectTabName) {
            if(selectTabName=="trainObjectGridOptions"){
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: 'view/LocalizedTrainTranslate/projectRef.html',
                    className: 'ngdialog-theme-formInfo',
                    controller: 'projectGridOptionsCtrl',
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
                        for(var i=0; i<value.length;i++){
                            $scope[$scope.selectTabName].data.push(value[i]);
                        }
                    }
                }, function (reason) {
                });
            }else{
                $scope[selectTabName].data.push({});
            }
        };
        /**
         * 子表删除
         */
        $scope.onDeleteLine = function (selectTabName) {
            var delRow = $scope[selectTabName].gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (var i = 0; i < $scope[selectTabName].data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope[selectTabName].data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope[selectTabName].data.splice(i, 1);
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
        //设置默认讲师要求不可编辑
        $scope.ifTechnicalSupportDisable = true;
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
            exporterCsvFilename: '客户培训计划申报.csv',
            columnDefs: [
                // {name: 'localizedCustomerTrain.trainCode', displayName: '培训编号'},
                {name: 'localizedCustomerTrain.trainTheme', displayName: '培训名称'},
                {name: 'localizedCustomerTrain.startdate', displayName: '培训起始日期'},
                {name: 'localizedCustomerTrain.enddate', displayName: '培训结束日期'},
                {name: 'localizedCustomerTrain.trainSite.name', displayName: '培训地点'},
                {name: 'localizedCustomerTrain.enumTrainType', displayName: '培训方式', cellFilter: 'SELECT_ENUMTRAINTYPE'},
                // {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人'},
                {name: 'operateDate', displayName: '录入日期'},
                // {name: 'operateTime', displayName: '发起时间'},
                // {name: 'pkDept.name', displayName: '部门'},
                {name: 'pkOrg.name', displayName: '录入机构'},
                {name: 'billstatus', displayName: '单据状态',cellFilter:'SELECT_LOCALIZEDBILLSTATUS'},
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

        $scope.selectTabName = 'trainPlanGridOptions';
        $scope.trainPlanGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            cellEditableCondition:function($rootScope){
                return  false;
            },
            columnDefs: [
                {
                    name: 'trainContent', displayName: '培训课题', width: 200
                },
                {
                    name: 'trainCount', displayName: '课时', width: 200
                },
                {
                    name: 'pkExpert.name', displayName: '培训讲师', width: 200, url: 'expertRef/queryForGrid'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'pkExpert'
                    , enableCellEdit: true

                },
            ],
            data: $scope.VO.trainPlan,
            onRegisterApi: function (gridApi) {
                $scope.trainPlanGridOptions.gridApi = gridApi;
            }
        };
        $scope.trainObjectGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            cellEditableCondition:function($rootScope){
                return  false;
            },
            columnDefs: [
                {
                    name: 'project_name', displayName: '项目名称', width: 200,enableCellEdit: true
                },
                {
                    name: 'customer_name', displayName: '客户名称', width: 200, enableCellEdit: false
                },
                {
                    name: 'insurancetype.name', displayName: '险种', width: 200, enableCellEdit: false
                },
                {
                    name: 'territorial_organization.name', displayName: '属地服务机构', width: 200, enableCellEdit: false
                },
            ],
            data: $scope.VO.trainObject,
            onRegisterApi: function (gridApi) {
                $scope.trainObjectGridOptions.gridApi = gridApi;
            }
        };

        $scope.dealAttachmentBGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,

            columnDefs: [

                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},
                {
                    name: 'fileType',
                    displayName: '附件类型',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_LOCALIZEDTRAINTRANSLATEFILETYPE',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.LOCALIZEDTRAINTRANSLATEFILETYPE
                },
                {
                    name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                },
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
        if ($scope.selectTabName == 'trainCostGridOptions') {
            $scope.secChild = false;
        } else {
            $scope.secChild = true;
        }
    };
    $scope.table_name = "lr_localized_train_translate";
    $scope.billdef = "CustomerTrain";
    $scope.beanName = "insurance.CustomerTrainserviceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.onQuery();
    initworkflow($scope, $http,ngDialog);
});

app.controller('projectGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
    /**
     * 初始化页面变更方法
     */
    $scope.initQUERYChildren = function () {
        return {
            // insurancedmanpk:[]
        }
    };
    $scope.customerRef =
        {
            id: $scope.$id,
            columnDefs: [
                {
                    field: 'code',
                    displayName: '客户编号'
                },
                {
                    field: 'name',
                    displayName: '客户名称'
                }
            ],
            data: ""
        };
    $scope.QUERYCHILDREN = $scope.initQUERYChildren();
    $scope.initData = function () {
        $scope.projectGridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {
                    name: 'project_name', displayName: '项目名称', width: 200, enableCellEdit: false
                },
                {
                    name: 'customer_name', displayName: '客户名称', width: 200, enableCellEdit: false
                },
                {
                    name: 'insurancetype.name', displayName: '险种', width: 200, enableCellEdit: false
                },
            ],
        };
        $scope.projectGridOptions.onRegisterApi = function (gridApi) {
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
                $scope.queryForGridChildren($scope.QUERYCHILDREN);
            });
        };
    };

    $scope.queryForGridChildren = function (data) {
        if (!$scope.queryData) {
            $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.customerGridOptions.columnDefs;
        }
        layer.load(2);
        if(null!=$scope.QUERY&&null!=$scope.QUERY.pk_corp){
            data.pk_corp=$scope.QUERY.pk_corp.pk;
        }
        $http.post($scope.localizedPath + 'projectInformation/queryForGrid', {
            params: angular.toJson(data),
            // page: 0,
            // pageSize: 100,
            fields: angular.toJson($scope.queryData)
        }).success(function (response) {
            if (response.code == 200) {
                if (!$scope.query) {
                    $scope.query = $scope.projectGridOptions.columnDefs;
                }
                $scope.projectGridOptions.data = response.result.Rows;
            }
            layer.closeAll('loading');
        });
    };
    $scope.onQueryChildren = function () {
        $scope.queryForGridChildren($scope.QUERYCHILDREN);
    };
    $scope.onResetChildren = function () {
        $scope.QUERYCHILDREN = $scope.initQUERYChildren();
        $scope.QUERY= {};
    };
    $scope.initFunction = function () {
        /**
         * 确定
         */
        $scope.onSaveSelection = function (i) {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});
            // $scope.clearingGridOptions.data=rows;

            //push
            for(var i=0;i<rows.length;i++){
                var temp=true;
                for(var j=0;j<$scope.trainObjectGridOptions.data.length;j++){
                    if($scope.trainObjectGridOptions.data[j].id==rows[i].id){
                        temp=false;
                    }
                }
                if(temp){
                    $scope.trainObjectGridOptions.data.push(rows[i]);
                }
            }
            ngDialog.close();
        };
        $scope.onCancel = function () {
            ngDialog.close();
        };
    };
    $scope.initData();
    $scope.initFunction();
    $scope.queryForGridChildren($scope.QUERYCHILDREN);
});