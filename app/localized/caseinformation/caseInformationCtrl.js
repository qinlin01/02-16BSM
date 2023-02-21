app.controller('caseInformationCtrl', function ($rootScope, $scope, $http, $sce, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function () {
        $scope.status = {open: true};
        //初始化查询
        $scope.initVO = function () {
            return {
                project_information:'',
                case_no:'',
                lossoccurred_time:'',
                claim_amount:'',
                case_name:'',
                lossoccurred_reason:'',
                lossoccurred_reason_shorthand:'',
                contact:'',
                contact_tel:'',
                undo_time:'',
                indemnity_time:'',
                indemnity_amount:'',
                work_matters:0,
                workType:0,
                entry_organization:$rootScope.orgVO,
                year:'',
                month:'',
                id:'',
                dr:0,
                payout_percentage:0,   //支付比例
                billstatus:'37',
                dealAttachmentB:[],
                remark:'',
            };
        };
        $scope.initAssistclaimworkrecord = function () {
            return {
                case_infomation:'',
                work_date:'',
                work_matters:'',
                work_content:'',
                undo_time:'',
                indemnity_time:'',
                indemnity_amount:'',
                ts:'',
                id:'',
                dr:0
            };
        };
        $scope.initQUERY = function () {
            return {
                "case_name":"",
                "insurance_no":"",
                "insurancetype":"",
                "lossoccurred_time":"",
                "lossoccurred_reason_shorthand":"",
                "contact":"",
                "contact_tel":"",
                "wideArea":"",
                "work_matters":"",
                "project_type":"",
                "operate_Date_year":parseInt(new Date().format("yyyy"))
            }
        };
        $scope.initAssistclaimworkrecordListFlag = function (){
            return {
                isCancelCase : false,
                isOverCase : false,
                isSelect : false,
            }
        }
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.assistclaimworkrecordList = [];
        $scope.assistclaimworkrecordListFlag = [];
        $scope.QUERY = $scope.initQUERY();

        $scope.issueRef =
            {
                id: $scope.$id,
                columnDefs: [
                    {
                        field: 'insurance_no',
                        displayName: '保单号'
                    },
                    {
                        field: 'project_name',
                        displayName: '项目名称'
                    }
                ],
                data: ""
            };
        $scope.WORKTYPE = [];
        $scope.WORKTYPETEXT_rsx = {
            1:"准备索赔材料，确认无误提交承保公司后，支付服务费的50%",
            4:"督促承保公司按约定将赔款划至银行账户后，支付服务费的50%",
        }

        $scope.WORKTYPETEXT = {
            1:"准备索赔材料，确认无误提交承保公司后，支付服务费的20%",
            2:"密切跟踪保险公司理赔进度，督促保险公司反时给予核定结果，校定结果初步确定后。支付服务费的20%",
            3:"协助我定《保险赔付协议》，签订协议后，支付服务费的 50%",
            4:"督促承保公司按约定将赔款划至银行账户后，支付服务费的10%",
        }
    };
    $scope.initHttp = function () {

        $scope.onDeleteLine = function () {
            var delRow = $scope.dealAttachmentBGridOptions.gridApi.selection.getSelectedRows();

            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (var i = 0; i < $scope.dealAttachmentBGridOptions.data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope.dealAttachmentBGridOptions.data[i].$$hashKey == delRow[j].$$hashKey) {
                        $scope.dealAttachmentBGridOptions.data.splice(i, 1);
                    }
                }
            }
        };

        $scope.onUploads = function (selectTabName) {
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
                    //  第一次初始化成null，后台没值，应该【】
                    if (!$scope.dealAttachmentBGridOptions.data) {
                        $scope.dealAttachmentBGridOptions.data = [];
                    }
                    angular.forEach(value, function (item) {
                        let dealAttachmentB ={};
                        dealAttachmentB.file_type=6;
                        dealAttachmentB.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                        dealAttachmentB.pk_project_id=item.pk_project_id;
                        dealAttachmentB.attachment_name=item.attachment_name;
                        $scope.dealAttachmentBGridOptions.data.push(dealAttachmentB);
                    });
                }
            }, function (reason) {

            });
        };

        /**
         * 查询案件向下的协助索赔日志
         * @param id
         */
        $scope.findAssistclaimworkrecord = function (id,callback){
            $http.post($scope.localizedPath  + "assistclaimworkrecord/getAssistclaimworkrecordByCaseId",{id: id,}).success(function (response) {
                if (response && response.code == "200"){
                    angular.assignData($scope.assistclaimworkrecordList,response.result);
                    for (let i = 0; i < $scope.assistclaimworkrecordList.length; i++) {

                        $scope.assistclaimworkrecordListFlag[i] = $scope.initAssistclaimworkrecordListFlag();

                        if($scope.assistclaimworkrecordList[i].work_matters == 6){
                            $scope.assistclaimworkrecordListFlag[i].isCancelCase = true;
                        }
                        if($scope.assistclaimworkrecordList[i].work_matters == 7){
                            $scope.assistclaimworkrecordListFlag[i].isOverCase = true;
                        }
                        $scope.assistclaimworkrecordListFlag[i].isSelect = true;
                    }
                    if(callback){
                        callback();
                    }
                }
            });
        }
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.localizedPath + "caseInformation/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
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
        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.localizedPath + "caseInformation/queryForGrid", {
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
                if (response.code == 500) {
                    layer.alert(response.msg);
                }
                layer.closeAll('loading');
            });
        };

    };
    $scope.initButton = function () {
        $scope.onEdit = function (){
            let rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            if($scope.VO.project_information.insurance_type == "财产险"){
                $scope.WORKTYPE = getSelectOptionData.WORKTYPEUNILFE;
            }
            if($scope.VO.project_information.insurance_type == "人身寿险"){
                $scope.WORKTYPE = getSelectOptionData.WORKTYPEILFE;
            }
            $scope.findAssistclaimworkrecord(rows[0].id,function (){
                $scope.isGrid = false;
                $scope.isCard = false;
                $scope.isForm = true;
                $scope.isUpdate = true;
            });

        }

        $scope.onBack = function(){
            if ($stateParams.id) {
                window.history.back(-2);
                return;
            }
            $scope.isGrid = true;
            $scope.isCard = false;
            $scope.isForm = false;
            $scope.isAdd = false;
            $scope.isUpdate = false;
            $scope.VO = $scope.initVO();
            $scope.assistclaimworkrecordList = [];
            $scope.QUERY = $scope.initQUERY();
            $scope.queryForGrid($scope.QUERY);
        }

        $scope.onAdd = function(){
            $scope.isGrid = false;
            $scope.isCard = false;
            $scope.isForm = true;
            $scope.isAdd = true;
            $scope.VO = $scope.initVO();
            $scope.assistclaimworkrecordList = [];
        }

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
            $scope.findOne(id);
            $scope.findAssistclaimworkrecord(id,function (){
                $scope.isGrid = false;
                $scope.isCard = true;
                $scope.isForm = false;
            });
        }

        $scope.onSave = function() {
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请填写所有必输项！",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    //结案时判断赔款日期和赔款金额是否为null
                    for (let i = 0; i < $scope.assistclaimworkrecordList.length; i++) {
                        if($scope.assistclaimworkrecordList[i].work_matters == 7){
                            if($scope.assistclaimworkrecordList[i].indemnity_time == "" || $scope.assistclaimworkrecordList[i].indemnity_time == null ){
                                return layer.alert("请填写赔款日期！",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if($scope.assistclaimworkrecordList[i].indemnity_amount == "" || $scope.assistclaimworkrecordList[i].indemnity_amount == null ){
                                return layer.alert("请填写赔款金额！",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                    }
                    if($scope.VO.project_information.projectType == null || $scope.VO.project_information.projectType =="" || $scope.VO.project_information.projectType === 1){
                        return layer.alert("项目类型未选择！",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    //携带协助索赔到后台
                    $scope.VO.assistclaimworkrecordList = $scope.assistclaimworkrecordList;
                    $http.post($scope.localizedPath + "caseInformation/onSave", {
                        data: angular.toJson($scope.VO)
                    }).success(function (response) {
                        if (response.code == 200) {
                            //回写数据到界面上
                            $scope.VO = response.VO;
                            $scope.assistclaimworkrecordList = response.VO.assistclaimworkrecordList;
                            layer.alert(response.msg,
                                {skin: 'layui-layer-lan', closeBtn: 1});
                            $scope.onBack();
                        }
                        if (response.code == 500) {
                            layer.alert(response.msg,
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        layer.closeAll('loading');
                    });
                }
            })
        }

        $scope.onTemporary = function() {
            //携带协助索赔到后台
            $scope.VO.assistclaimworkrecordList = $scope.assistclaimworkrecordList;
            $http.post($scope.localizedPath + "caseInformation/onTemporary", {
                data: angular.toJson($scope.VO)
            }).success(function (response) {
                if (response.code == 200) {
                    //回写数据到界面上
                    $scope.VO = response.VO;
                    $scope.assistclaimworkrecordList = response.VO.assistclaimworkrecordList;
                    layer.alert(response.msg,
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }
                if (response.code == 500) {
                    layer.alert(response.msg,
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }
                layer.closeAll('loading');
            });


        }

        $scope.onDelete = function(){
            let rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return layer.alert("请至少选择一条数据进行删除!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for(let i=0;i<rows.length;i++){
                $http.post($scope.localizedPath + "caseInformation/delete", {
                    data: angular.toJson(rows[i])
                }).success(function (response) {
                    if(response.code==200){
                        if(response.msg){
                            layer.alert(response.msg, {
                                skin: 'layui-layer-lan',
                                closeBtn: 1
                            });
                        }
                        $scope.queryForGrid($scope.QUERY);
                    }
                    if (response.code == 500) {
                        layer.alert(response.msg);
                    }
                }).error(function (data) {
                    layer.alert("系统异常", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                })
            }
            layer.alert("删除成功", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
        }
        $scope.onUpdate = function() {
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert(errEls[0].ngVerify.OPTS.message,
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    //结案时判断赔款日期和赔款金额是否为null
                    for (let i = 0; i < $scope.assistclaimworkrecordList.length; i++) {
                        if($scope.assistclaimworkrecordList[i].work_matters == 7){
                            if($scope.assistclaimworkrecordList[i].indemnity_time == "" || $scope.assistclaimworkrecordList[i].indemnity_time == null ){
                                return layer.alert("请填写赔款日期！",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if($scope.assistclaimworkrecordList[i].indemnity_amount == "" || $scope.assistclaimworkrecordList[i].indemnity_amount == null ){
                                return layer.alert("请填写赔款金额！",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if($scope.assistclaimworkrecordList[i].indemnity_amount == "0" || $scope.assistclaimworkrecordList[i].indemnity_amount == 0 ){
                                if ($scope.assistclaimworkrecordList[i].remark == "" || $scope.assistclaimworkrecordList[i].remark == null){
                                    return layer.alert("赔款金额为0，需要填写备注！",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }
                        }
                    }

                    if($scope.VO.project_information.projectType == null || $scope.VO.project_information.projectType =="" || $scope.VO.project_information.projectType === 1){
                        return layer.alert("项目类型未选择！",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    $scope.VO.assistclaimworkrecordList = $scope.assistclaimworkrecordList;
                    $http.post($scope.localizedPath + "caseInformation/update", {
                        data: angular.toJson($scope.VO)
                    }).success(function (response) {
                        if (response.code == 200) {
                            //回写数据到界面上
                            $scope.VO = response.VO;
                            $scope.assistclaimworkrecordList = response.VO.assistclaimworkrecordList;
                            layer.alert(response.msg,
                                {skin: 'layui-layer-lan', closeBtn: 1});
                            $scope.onBack();
                        }
                        if (response.code == 500) {
                            layer.alert(response.msg);
                        }
                        layer.closeAll('loading');
                    });
                }
            })
        }

        $scope.onAddassistclaimworkrecord =function(){
            $scope.assistclaimworkrecordList.push($scope.initAssistclaimworkrecord());
        }

        $scope.deletelistOptions=function(nowNumber){
            layer.confirm('请确认是否要删除此条协助索赔记录？', {
                    btn: ['确定', '取消'], //按钮
                    btn2: function (index, layero) {
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function (index) {
                    //如果存库了，数据库删除
                    let id = $scope.assistclaimworkrecordList[nowNumber].id;
                    if(id!=null && id!=""){
                        $http.post($scope.localizedPath + "assistclaimworkrecord/delete", {
                            data: angular.toJson($scope.assistclaimworkrecordList[nowNumber])
                        }).success(function (response) {
                            if(response.code==200){
                                //防止回写数据，导致数据相差版本，重新查一下主表
                                $scope.VO = response.caseInfo;
                            }
                            if (response.code == 500) {
                                layer.alert(response.msg);
                            }
                        }).error(function (data) {
                            layer.alert("系统异常", {
                                skin: 'layui-layer-lan',
                                closeBtn: 1
                            });
                        })
                    }
                    $scope.assistclaimworkrecordList.splice(nowNumber,1);
                    $scope.assistclaimworkrecordListFlag.splice(nowNumber,1);
                    $scope.$apply();
                    layer.close(layer.index);
                }
            );
        };

        $scope.onSelect = function (index) {
            let id =  $scope.assistclaimworkrecordList[index].work_matters;
            $scope.assistclaimworkrecordListFlag[index] = $scope.initAssistclaimworkrecordListFlag();
            if(id!=null && id>=0){
                $scope.assistclaimworkrecordListFlag[index].isSelect = true;
                //撤案
                if(id == 6){
                    $scope.assistclaimworkrecordListFlag[index].isCancelCase = true;
                }else{
                    $scope.assistclaimworkrecordListFlag[index].isCancelCase = false;
                    $scope.assistclaimworkrecordList[index].undo_time = '';
                }
                //结案
                if(id == 7){
                    $scope.assistclaimworkrecordListFlag[index].isOverCase = true;
                }else{
                    $scope.assistclaimworkrecordListFlag[index].isOverCase = false;
                    $scope.assistclaimworkrecordList[index].indemnity_amount = '';
                    $scope.assistclaimworkrecordList[index].indemnity_time = '';
                }
            }else{
                $scope.assistclaimworkrecordListFlag[index].isSelect = false;
                $scope.assistclaimworkrecordListFlag[index].isCancelCase = false;
                $scope.assistclaimworkrecordListFlag[index].isOverCase = false;
                $scope.assistclaimworkrecordList[index].work_date = '';
                $scope.assistclaimworkrecordList[index].work_content = '';
                $scope.assistclaimworkrecordList[index].indemnity_amount = '';
                $scope.assistclaimworkrecordList[index].indemnity_time = '';
                $scope.assistclaimworkrecordList[index].undo_time = '';
            }
        }

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };
        $scope.onReset = function () {
            $scope.QUERY = $scope.initQUERY();
        };
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };

        //打印
        $scope.onPrint = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length < 1) return layer.alert("请选择一条数据进行打印!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            //只有一条案件信息直接返回PDF
            if(rows[0].billstatus==34){
                layer.load(2);
            if(rows.length==1){
                //微服务获取数据结构
                $http.post($scope.localizedPath + "assistclaimworkrecord/getRaqJson", {
                    data: angular.toJson(rows[0])
                }).success(function (response) {
                    if (response.code == 200) {
                        if (response.MapList) {
                            //主服务调用打印方法
                            $http.post($rootScope.basePath + 'printCommonController/printCommon', {
                                data: angular.toJson(response.MapList),
                                raq: "workingFile",
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
                    }
                    if(response.code == 500){
                        layer.alert(response.msg);
                    }
                });
            }
            //案件信息大于一条返回PDF  ZIP包
            if(rows.length > 1){
                $http.post($scope.localizedPath + "assistclaimworkrecord/getZipRaqJson", {
                    data: angular.toJson(rows)
                }).success(function (response) {
                    if(response.code == 200){
                        let exportEx = $('#exproE');
                        exportEx.attr('target', '_blank');
                        $('#exproE input').val(angular.toJson(response.result));
                        exportEx.attr('action', $rootScope.basePath + 'printCommonController/downlodasPdf');
                        exportEx.submit();
                    }
                    if (response.code == 500) {
                        layer.alert(response.msg);
                    }
                });
            }
            }else if(rows[0].billstatus==37){
                layer.alert("当前数据为暂存数据");
            }else{
                layer.alert("该数据不可打印工作档案");
            }
        }

    };
    $scope.initPage = function () {
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isForm = false;
        $scope.isUpdate = false;
        $scope.isAdd = false;
        $scope.assistclaimworkrecordList = [];
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
            exporterCsvFilename: '案件信息.csv',
            columnDefs: [
                {name: 'project_information.project_name', displayName: '项目名称',width:300},
                {name: 'case_name', displayName: '赔案名称',width:300},
                {name: 'project_information.insurance_no', displayName: '保单号',width:100},
                {name: 'project_information.insurancetype.name', displayName: '投保险种',width:100},
                {name: 'case_no', displayName: '报案号',width:100},
                {name: 'lossoccurred_time', displayName: '出险时间',width:100},
                {name: 'lossoccurred_reason_shorthand', displayName: '出险原因',cellFilter:'SELECT_LOSSOCCURREDREASONSHORTHAND',width:100},
                {name: 'claim_amount', displayName: '损失金额',width:100},
                {name: 'contact', displayName: '联系人',width:100},
                {name: 'contact_tel', displayName: '联系人电话',width:100},
                {name: 'work_matters', displayName: '项目状态',cellFilter:'SELECT_WORKRECORDKINDSHOW',width:100},
                {name: 'undo_time', displayName: '撤案日期',width:100},
                {name: 'indemnity_time', displayName: '结案日期',width:100},
                {name: 'indemnity_amount', displayName: '赔付金额',width:100},
                {name: 'lossoccurred_reason', displayName: '具体原因',width:200},
                {name: 'project_information.projectType', displayName: '索赔类型',cellFilter:'SELECT_PROJECTTYPES',width:100},
                {name: 'xckcNum', displayName: '现场勘查（次）',width:130},
                {name: 'cxtzsNum', displayName: '出险通知书（次）',width:135},
                {name: 'zfpkNum', displayName: '支付赔款（次）',width:130},
                {name: 'tpNum', displayName: '谈判（次）',width:100},
                {name: 'qtNum', displayName: '其它（次）',width:100},
                {name: 'entry_organization.name', displayName: '录入机构',width:150},
                {name: 'operate_Date', displayName: '录入日期',width:100},
                {name: 'billstatus', displayName: '单据状态',cellFilter:'SELECT_LOCALIZEDBILLSTATUS',width:100},
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
                    angular.assignData($scope.VO, row.entity);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });
        };

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
            data: $scope.VO.dealAttachmentB,
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

        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
    };
    $scope.initFunction = function (){
        $scope.selectTab = function (name) {
            $scope.selectTabName = name.toString();
            if ($scope.selectTabName == 'dealAttachmentBGridOptions') {
                $scope.upOrDown = true;
            } else {
                $scope.upOrDown = false;
            }
        };
    }
    $scope.initWatch = function () {

        $scope.$watch('VO.project_information', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isForm) {
                $scope.VO.contact = $scope.VO.project_information.project_contact;
                $scope.VO.contact_tel = $scope.VO.project_information.project_contactway;
                if($scope.VO.project_information.insurance_type == "财产险"){
                    $scope.WORKTYPE = getSelectOptionData.WORKTYPEUNILFE;
                }
                if($scope.VO.project_information.insurance_type == "人身寿险"){
                    $scope.WORKTYPE = getSelectOptionData.WORKTYPEILFE;
                }
            }
        }, true);

        $scope.$watch('assistclaimworkrecordList[assistclaimworkrecordList.length-1].workType', function (newVal, oldVal) {
            if ($scope.isForm) {
                if($scope.VO.project_information.projectType == 2){
                    let pay = 0;
                    let cldjNum = 0;
                    let cbhdjgNum = 0;
                    let cysptpNum = 0;
                    let pkdzNum = 0;
                    for (let i = 0; i < $scope.assistclaimworkrecordList.length; i++) {
                        if($scope.assistclaimworkrecordList[i].workType == 1){
                            cldjNum++;
                            if(cldjNum<=1){
                                if($scope.VO.project_information.insurance_type == '人身险'){
                                    $scope.VO.payout_percentage = pay + 50;
                                    pay = parseInt($scope.VO.payout_percentage);
                                }else{
                                    $scope.VO.payout_percentage = pay + 20;
                                    pay = parseInt($scope.VO.payout_percentage);
                                }

                            }
                        }
                        if($scope.assistclaimworkrecordList[i].workType == 2){
                            cbhdjgNum++;
                            if(cbhdjgNum<=1) {
                                $scope.VO.payout_percentage = pay + 20;
                                pay = parseInt($scope.VO.payout_percentage);
                            }
                        }
                        if($scope.assistclaimworkrecordList[i].workType == 3){
                            cysptpNum++;
                            if(cysptpNum<=1) {
                                $scope.VO.payout_percentage = pay + 50;
                                pay = parseInt($scope.VO.payout_percentage);
                            }

                        }
                        if($scope.assistclaimworkrecordList[i].workType == 4){
                            pkdzNum++;
                            if(pkdzNum<=1) {
                                if($scope.VO.project_information.insurance_type == '人身险'){
                                    $scope.VO.payout_percentage = pay + 50;
                                    pay = parseInt($scope.VO.payout_percentage);
                                }else{
                                    $scope.VO.payout_percentage = pay + 10;
                                    pay = parseInt($scope.VO.payout_percentage);
                                }
                            }

                        }
                    }
                }
            }
        }, true);

    $scope.$watch('VO.lossoccurred_time', function (newVal, oldVal) {
        if (newVal === oldVal || newVal == undefined || newVal == null) return;
        if ($scope.isForm) {
            if($scope.VO.lossoccurred_time&&$scope.VO.project_information.project_name&&$scope.VO.lossoccurred_reason_shorthand) {
                var time = $scope.VO.lossoccurred_time.split("-");
                var lossoccurred_reason_shorthand = "";
                for(let i = 0; i<getSelectOptionData.LOSSOCCURREDREASONSHORTHAND.length;i++){
                    if(getSelectOptionData.LOSSOCCURREDREASONSHORTHAND[i].id == $scope.VO.lossoccurred_reason_shorthand){
                        lossoccurred_reason_shorthand = getSelectOptionData.LOSSOCCURREDREASONSHORTHAND[i].name;
                    }
                }
                $scope.VO.case_name = time[0] + "年" + time[1] + "月" + $scope.VO.project_information.project_name + lossoccurred_reason_shorthand + "案件";
            }
        }
    }, true);
    $scope.$watch('VO.project_information.project_name', function (newVal, oldVal) {
        if (newVal === oldVal || newVal == undefined || newVal == null) return;
        if ($scope.isForm) {
            if($scope.VO.lossoccurred_time&&$scope.VO.project_information.project_name&&$scope.VO.lossoccurred_reason_shorthand) {
                var time = $scope.VO.lossoccurred_time.split("-");
                var lossoccurred_reason_shorthand = "";
                for(let i = 0; i<getSelectOptionData.LOSSOCCURREDREASONSHORTHAND.length;i++){
                    if(getSelectOptionData.LOSSOCCURREDREASONSHORTHAND[i].id == $scope.VO.lossoccurred_reason_shorthand){
                        lossoccurred_reason_shorthand = getSelectOptionData.LOSSOCCURREDREASONSHORTHAND[i].name;
                    }
                }
                $scope.VO.case_name = time[0] + "年" + time[1] + "月" + $scope.VO.project_information.project_name + lossoccurred_reason_shorthand + "案件";
            }
        }
    }, true);
    $scope.$watch('VO.lossoccurred_reason_shorthand', function (newVal, oldVal) {
        if (newVal === oldVal || newVal == undefined || newVal == null) return;
        if ($scope.isForm) {
            if($scope.VO.lossoccurred_time&&$scope.VO.project_information.project_name&&$scope.VO.lossoccurred_reason_shorthand) {
                var time = $scope.VO.lossoccurred_time.split("-");
                var lossoccurred_reason_shorthand = "";
                for(let i = 0; i<getSelectOptionData.LOSSOCCURREDREASONSHORTHAND.length;i++){
                    if(getSelectOptionData.LOSSOCCURREDREASONSHORTHAND[i].id == $scope.VO.lossoccurred_reason_shorthand){
                        lossoccurred_reason_shorthand = getSelectOptionData.LOSSOCCURREDREASONSHORTHAND[i].name;
                    }
                }
                $scope.VO.case_name = time[0] + "年" + time[1] + "月" + $scope.VO.project_information.project_name + lossoccurred_reason_shorthand + "案件";
            }
        }
    }, true);
    };

    initonlineView($scope,$rootScope,$sce,$http,ngDialog);
    $scope.initFunction();
    $scope.initData();
    $scope.initHttp();
    $scope.initButton();
    $scope.initPage();
    $scope.onQuery();
    $scope.initWatch();
});