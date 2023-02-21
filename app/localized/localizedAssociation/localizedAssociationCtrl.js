/**
 * Created by xlb on 2022/10/26
 */
app.controller('localizedAssociationCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                associationText:'',
                associationName:'',
                pkProject:'',
                dealattachmentb:[],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                billstatus:'',
                dr: 0,
                num:'0',
            };
        };


        //主表数据
        $scope.VO = $scope.initVO();
        $scope.edit=false;

        //初始化查询
        $scope.initQUERY = function () {
            return {
                // "person_name":"",
                // "person_tel":"",
                // "person_type":"",
                "wideArea":"",
            }
        };
        $scope.initAssistclaimworkrecordListFlag = function (){
            return {
                isCancelCase : false,
                isOverCase : false,
                isSelect : false,
            }
        }
        $scope.assistclaimworkrecordList = [];
        $scope.assistclaimworkrecordListFlag = [];




        $scope.QUERY = $scope.initQUERY();
        $scope.issueRef =
            {
                id: $scope.$id,
                columnDefs: [
                    {
                        field: 'insurance_no',
                        displayName: '培训编号'
                    },
                    {
                        field: 'project_name',
                        displayName: '培训名称'
                    }
                ],
                data: ""
            };


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

        $scope.onUploads = function () {
            $scope.isSubDisabled = false;
            $scope.aVO = {};
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/common/attachmentLocaltion.html',
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
                        let dealattachmentb ={};
                        dealattachmentb.file_type=6;
                        dealattachmentb.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                        dealattachmentb.pk_project_id=item.pk_project_id;
                        dealattachmentb.attachment_name=item.attachment_name;
                        $scope.dealAttachmentBGridOptions.data.push(dealattachmentb);
                    });
                }
            }, function (reason) {

            });
        };



        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            layer.load(2);
            $http.post($scope.localizedPath + "localizedAssociation/queryForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                $scope.gridOptions.data = response.data.records;
                $scope.gridOptions.totalItems = response.data.total;
                layer.closeAll('loading');
            });
        };



        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.localizedPath + "localizedAssociation/findOne", {id: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    if (callback) {
                        callback();
                    }
                    angular.assignData($scope.VO, response.data);

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

        $scope.onSaveVO = function () {
            $scope.VO.dealattachmentb = $scope.dealAttachmentBGridOptions.data;
                $http.post($scope.localizedPath + "localizedAssociation/save",{
                    data:angular.toJson($scope.VO),
                    contentType:'application/json',
                    dataType:'json',
                    headers: {'Content-Type': 'application/json;charset=UTF-8'}
                }).success(function(response) {
                    if(response.code == 200){
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = true;
                        $scope.isShow = true;
                        $scope.isDisabled = false;
                        angular.assignData($scope.VO, response.result);
                        $scope.isSubEdit = false;
                        layer.confirm("保存成功",{
                            btn: ['确定'],
                        }, function (btn) {
                            layer.close(btn);
                        });
                    }
                    if (response.code == 500) {
                        return layer.alert(response.msg);
                    }
                    $scope.onBack();



                });



        };



        $scope.onTemporary = function () {
            $scope.VO.dealattachmentb = $scope.dealAttachmentBGridOptions.data;
            $http.post($scope.localizedPath + "localizedAssociation/onTemporary",{
                data:angular.toJson($scope.VO),
                contentType:'application/json',
                dataType:'json',
                headers: {'Content-Type': 'application/json;charset=UTF-8'}
            }).success(function(response) {
                if(response.code == 200){
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isEdit = true;
                    $scope.isShow = true;
                    $scope.isDisabled = false;
                    angular.assignData($scope.VO, response.result);
                    $scope.isSubEdit = false;
                    layer.confirm("暂存成功",{
                        btn: ['确定'],
                    }, function (btn) {
                        layer.close(btn);
                    });
                }
                if (response.code == 500) {
                    return layer.alert(response.msg);
                }
                $scope.onBack();



            });



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

        $scope.changeText = function () {
            var length = $scope.VO.associationText.length;
            $scope.VO.num = length;
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


    };

    $scope.initButton = function () {
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
        $scope.onUploads = function () {
            $scope.isSubDisabled = false;
            $scope.aVO = {};
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/common/attachmentLocaltion.html',
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
                        let dealattachmentb ={};
                        dealattachmentb.file_type=6;
                        dealattachmentb.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                        dealattachmentb.pk_project_id=item.pk_project_id;
                        dealattachmentb.attachment_name=item.attachment_name;
                        $scope.dealAttachmentBGridOptions.data.push(dealattachmentb);
                    });
                }
            }, function (reason) {

            });
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

        $scope.onImportUploads= function (type) {
            if(type){
                $("#inputFile").click();
            }else{
                var file = document.getElementById("inputFile").files[0];
                if(file!=null){
                    layer.load(2);
                    var form = new FormData();
                    form.append('file', file);
                    form.append('table', 'gLife');
                    $http({
                        method: 'POST',
                        url: $scope.localizedPath + 'localizedAssociation/importExcel',
                        data: form,
                        headers: {'Content-Type': undefined,'x-auth-token': window.sessionStorage.getItem("token")},
                        transformRequest: angular.identity
                    }).success(function (data) {
                        console.log(data.code);
                        layer.alert(data.msg, {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                        if(data.code == 200){
                            var obj = document.getElementById('inputFile') ;
                            obj.outerHTML=obj.outerHTML;
                        }
                    }).error(function (data) {
                        console.log(data.code);
                        layer.alert(data.msg, {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                    })
                }

            }
        } ;



        $scope.ImportExcel = function () {
            layer.load(2);
            var inputFile = $('#inputFile');
            inputFile.click();
        }



        $scope.onAdd = function () {
            $scope.form=true;
            $scope.isClear = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.assistclaimworkrecordList = [];
            angular.assignData($scope.VO, $scope.initVO());
            // $scope.trainPlanGridOptions.data = [];
        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            $scope.edit=true;
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
            $scope.isGrid = false;
            $scope.isCard = true;
            $scope.isForm = false;
            $scope.isBack = true;
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
                    $http.post($scope.localizedPath + "localizedAssociation/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
        // $scope.onCancel = function () {
        //     if($scope.isClear){
        //         $scope.VO = $scope.initVO();
        //         $scope.trainPlanGridOptions.data = $scope.VO.trainPlan;
        //         $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB==undefined ? [] :$scope.VO.dealAttachmentB;
        //     }
        //     $scope.isDisabled = true;
        //     $scope.isEdit = false;
        //     $scope.isBack = false;
        // };
        $scope.onCancel = function () {
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
         * 返回
         */
        $scope.onBack = function () {
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isDisabled = true;
            $scope.edit=false;
            //阻止页面渲染
            $scope.assistclaimworkrecordList = [];

            $scope.form=false;
            $scope.card=false;
            $scope.queryForGrid($scope.QUERY);
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
        $scope.initView = function () {};

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
        $scope.assistclaimworkrecordList = [];
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
            exporterCsvFilename: '联系人信息录入.csv',
            columnDefs: [
                // {name: 'personType', displayName: '联系人类型',cellFilter:'SELECT_localizedAssociationTYPE'},
                {name: 'associationName', displayName: '主题'},
                {name: 'project_information.project_name', displayName: '项目名称'},
                {name: 'project_information.customer_name', displayName: '客户名称'},
                {name: 'createTime', displayName: '制单日期', cellFilter: 'date:"yyyy-MM-dd"'},
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
            data: $scope.VO.dealattachmentb,
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



        if($stateParams.id) {
            $scope.onCard($stateParams.id);
        }/*else{
            $scope.queryForGrid({});
        }*/
    };
    // $scope.selectTab = function (name) {
    //
    //     $scope.selectTabName = name.toString();
    //     if ($scope.selectTabName == 'dealAttachmentBGridOptions') {
    //         $scope.upOrDown = true;
    //     } else {
    //         $scope.upOrDown = false;
    //     }
    //     if ($scope.selectTabName == 'trainCostGridOptions') {
    //         $scope.secChild = false;
    //     } else {
    //         $scope.secChild = true;
    //     }
    // };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {
            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }
    };


    $scope.table_name = "t_local_association";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.onQuery();
    initworkflow($scope, $http,ngDialog);
});
