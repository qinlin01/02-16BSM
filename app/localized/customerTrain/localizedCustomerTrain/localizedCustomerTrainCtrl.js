/**
 * Created by Aiko on 2020/8/27
 */
app.controller('localizedCustomerTrainCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $location,activitiModal, workFlowDialog) {
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
                billstatus:'37',
                dr: 0,
                trainPlanB: [],
                trainObjectB:[],
                dealAttachmentC:[],
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
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.localizedPath+ "LocalizedCustomerTrain/queryForGrid", {
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
            $http.post($scope.localizedPath + "LocalizedCustomerTrain/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.trainPlanGridOptions.data = $scope.VO.trainPlan;
                    $scope.trainPlanBGridOptions.data = $scope.VO.trainPlanB;
                    $scope.trainObjectBGridOptions.data = $scope.VO.trainObjectB;
                    $scope.dealAttachmentCGridOptions.data= $scope.VO.dealAttachmentC==undefined? [] :$scope.VO.dealAttachmentC;
                    $scope.trainObjectGridOptions.data = $scope.VO.trainObject;
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
            if(null==$scope.VO.trainCode||""==$scope.VO.trainCode){
                //获取编号
                $scope.VO.trainCode=$scope.trainCode;
            }
            $http.post($scope.localizedPath + "LocalizedCustomerTrain/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
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
            $scope.$watch('VO.trainObject', function (newVal, oldVal) {
                if (newVal === oldVal || newVal == undefined || newVal == null) return;
                if ($scope.isEdit) {
                    if($scope.VO.enumTrainType&&$scope.VO.trainObject&&$scope.VO.trainObject[0]&&$scope.VO.startdate) {
                        {
                            $scope.VO.trainTheme = $rootScope.orgVO.name +  "关于中国建筑" + $scope.VO.startdate + $rootScope.returnSelectName($scope.VO.enumTrainType, 'ENUMTRAINTYPE');
                        }
                    }
                }
            }, true);

        $scope.$watch('VO.enumTrainType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if($scope.VO.enumTrainType&&$scope.VO.trainObject&&$scope.VO.trainObject[0]&&$scope.VO.startdate) {
                    if($scope.VO.trainObject[0].customer_name)
                    {
                        $scope.VO.trainTheme = $rootScope.orgVO.name +  "关于中国建筑" + $scope.VO.startdate + $rootScope.returnSelectName($scope.VO.enumTrainType, 'ENUMTRAINTYPE');
                    }
                }
            }
        }, true);

        $scope.$watch('VO.startdate', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO.enddate=$scope.VO.startdate;
                if($scope.VO.enumTrainType&&$scope.VO.trainObject&&$scope.VO.trainObject[0]&&$scope.VO.startdate) {
                    if($scope.VO.trainObject[0].customer_name)
                    {
                        $scope.VO.trainTheme = $rootScope.orgVO.name +  "关于中国建筑" + $scope.VO.startdate + $rootScope.returnSelectName($scope.VO.enumTrainType, 'ENUMTRAINTYPE');
                    }
                }
            }
        }, true);
    };

    $scope.initButton = function () {
        //打印
        $scope.onPrintSignCheckBill = function (gridApi,htmlPathCheckBill,type) {
            $scope.raq = type;
            if($scope.raq != 'workPlan'){
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                layer.load(2);
                //微服务获取数据结构
                $http.post($scope.localizedPath + 'LocalizedCustomerTrain/signCheckBill', {
                    data: angular.toJson($scope.VO),
                    raq: $scope.raq
                }).success(function (response) {
                    if (response.code == 200) {
                        if (response.MapList) {
                            $http.post($rootScope.basePath + 'printCommonController/printCommon', {
                                data: angular.toJson(response.MapList),
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
                    }
                    if (response.code == 500) {
                        layer.alert(response.msg);
                    }
                });
            }else{
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                layer.load(2);
                $http.post($scope.localizedPath + 'LocalizedCustomerTrain/signCheckBill', {
                    data: angular.toJson($scope.VO),
                    raq: $scope.raq
                }).success(function (response) {
                    if (response.code == 200) {
                            $http.post($rootScope.basePath + 'printCommonController/mergePdf', {
                                data: angular.toJson(response.countPdfList)
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
                    if (response.code == 500) {
                        layer.alert(response.msg);
                    }
                });
            }
        }


        //打印台账
        $scope.onPrint = function (gridApi,htmlPathCheckBill,type) {
            $scope.raq = type;
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            //微服务获取数据结构
            $http.post($scope.localizedPath + 'LocalizedCustomerTrain/print', {
                data: angular.toJson($scope.VO),
                raq: $scope.raq
            }).success(function (response) {
                if (response.code == 200) {
                    if (response.MapList) {
                        $http.post($rootScope.basePath + 'printCommonController/printCommon', {
                            data: angular.toJson(response.MapList),
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
                }
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
                template: 'view/common/attachmentLocaltion.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                preCloseCallback: function (value) {
                    if (value && value == "clear") {
                        //重置
                        return false;
                    }
                    return true;
                }
            }).then(function (value) {
                if (value != null) {
                    if ($scope.dealAttachmentBGridOptions.data) {
                        angular.forEach(value, function (item) {
                            let dealAttachmentB ={};
                            dealAttachmentB.fileType=4;
                            dealAttachmentB.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
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
        $scope.onDownLoadBs = function () {
            var selectTabName = $scope.selectTabName;
            var rows = $scope[selectTabName].gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return angular.alert("请选择一条单据进行操作！");
            var ids = [];
            if (selectTabName == 'dealAttachmentCGridOptions') {
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
        $scope.onDownLoadsCard = function (id) {
            var ids = [];
            ids.push(id);
            var exportEx = $('#exproE');
            exportEx.attr('target','_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action',$rootScope.basePath+'uploadFile/downloadFiles');
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
        /**
         * 暂存
         */
        // $scope.onTemporary = function (data) {
        //     if (data) {
        //
        //         data.trainPlan = $scope.trainPlanGridOptions.data ;
        //         // data.trainCost = $scope.trainCostGridOptions.data ;
        //         data.trainObject = $scope.trainObjectGridOptions.data ;
        //         data.dealAttachmentB = $scope.dealAttachmentBGridOptions.data ;
        //
        //         var tablename = $scope.table_name;
        //         $http.post($rootScope.basePath + "temporary/insert", {
        //             data: angular.toJson(data),
        //             tablename: tablename
        //         }).success(function (response) {
        //             if (response.code == 200) {
        //                 $scope.isGrid = false;
        //                 $scope.isBack = false;
        //                 $scope.isEdit = false;
        //                 $scope.isDisabled = true;
        //                 angular.assignData($scope.VO, response.result);
        //                 layer.closeAll('loading');
        //                 $scope.isSubEdit = false;
        //                 return layer.alert('暂存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
        //             }
        //         });
        //     }
        // }

        $scope.onTemporary = function (func) {
            layer.load(2);
            if(null==$scope.VO.trainCode||""==$scope.VO.trainCode){
                //获取编号
                $scope.VO.trainCode=$scope.trainCode;
            }
            $http.post($scope.localizedPath + "LocalizedCustomerTrain/onTemporary", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
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





        $scope.onAdd = function () {
            $scope.isbusinessStatus = false;
            $scope.form=true;
            $scope.isClear = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            angular.assignData($scope.VO, $scope.initVO());
            //获取编号
            $scope.getSerno();
        };

        $scope.getSerno = function () {
            $http.post($scope.basePath + "common/genBusiSerialNumByRule", {tableName:$scope.table_name}).success(function (response)  {
                if (response && response.code == "200") {
                    $scope.trainCode = response.SerialNum;
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
        }
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
                $scope.isbusinessStatus = false;
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
            $http.post($scope.localizedPath + "LocalizedCustomerTrain/findOne", {pk:id,tableName:$scope.table_name,billdef:$scope.billdef}).success(function (response)  {
                if (response && response.code == "200") {
                    $scope.card=true;
                    angular.assignData($scope.VO, response.result);
                    $scope.trainPlanGridOptions.data = $scope.VO.trainPlan;
                    $scope.trainObjectGridOptions.data = $scope.VO.trainObject;
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
                    $http.post($scope.localizedPath  + "LocalizedCustomerTrain/delete", {ids: angular.toJson(ids)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg('删除成功!', {
                                icon: 1
                            });
                        }
                        if (response.code == 500) {
                            layer.alert(response.msg);
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
                    if( $scope.trainPlanGridOptions.data.length==0){
                        return layer.alert("请先填写培训课程信息!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }else if($scope.trainPlanGridOptions.data.length > 0){
                        for(let i=0;i<$scope.trainPlanGridOptions.data.length;i++){
                            if(!($scope.trainPlanGridOptions.data[i].trainContent&&$scope.trainPlanGridOptions.data[i].trainContent&&$scope.trainPlanGridOptions.data[i].pkExpert&&$scope.trainPlanGridOptions.data[i].pkExpert.name)){
                                return layer.alert("请先填写培训课程信息内容!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                    }

                    if( $scope.trainObjectGridOptions.data.length==0){
                        return layer.alert("请先填写项目信息!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }

                    if($scope.dealAttachmentBGridOptions.data.length <= 0){
                        return layer.alert("请上传附件!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    // 如果是暂存的数据时，需要修正单据状态
                    if ($scope.VO.billstatus == 37) {
                        $scope.VO.billstatus = 31;
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
                    template: 'view/localizedCustomerTrain/projectRef.html',
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
            exporterCsvFilename: '客户培训计划.csv',
            columnDefs: [
                // {name: 'trainCode', displayName: '培训编号'},
                {name: 'trainTheme', displayName: '培训名称'},
                {name: 'startdate', displayName: '培训起始日期'},
                {name: 'enddate', displayName: '培训结束日期'},
                {name: 'trainSite.name', displayName: '培训地点'},
                {name: 'enumTrainType', displayName: '培训模式',cellFilter: 'SELECT_ENUMTRAINTYPE'},
                {name: 'enumTrainModelType', displayName: '培训方式',cellFilter: 'SELECT_ENUMTRAINMODELTYPE'},
                {name: 'countObject', displayName: '项目数量'},
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
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
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
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
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
            cellEditableCondition: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,

            columnDefs: [
                {name: 'attachment_name', displayName: '附件名称'},
                {
                    name: 'fileType',
                    displayName: '附件类型',
                    enableCellEdit: true,
                    cellFilter: 'SELECT_LOCALIZEDTRAINTRANSLATEFILETYPE',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.LOCALIZEDTRAINTRANSLATEFILETYPE
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

        $scope.trainPlanBGridOptions= {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'trainDate', displayName: '日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , editableCellTemplate: 'ui-grid/refDate'
                },
                {
                    name: 'beginTime', displayName: '开始时间', width: 100


                },
                {
                    name: 'endTime', displayName: '结束时间', width: 100


                },
                {
                    name: 'enumTrainType', displayName: '培训形式', width: 100, cellFilter: 'SELECT_TRAINTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.TRAINTYPE
                },
                {
                    name: 'enumTrainContent', displayName: '内容', width: 100, cellFilter: 'SELECT_TRAINCONTENTTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.TRAINCONTENTTYPE
                },
                {
                    name: 'style', displayName: '专家类型', width: 100, cellFilter: 'SELECT_STYLE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.STYLE
                },
                {
                    name: 'pkExpert.name', displayName: '讲师', width: 100, url: 'EXPERTREF'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'pkExpert'

                },
                {
                    name: 'TechnicalSupportRequest', displayName: '讲师要求', width: 100


                },
            ],
            data: $scope.VO.trainPlanB,
            onRegisterApi: function (gridApi) {
                $scope.trainPlanBGridOptions.gridApi = gridApi;
            }
        };
        $scope.trainObjectBGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'pkCustomer.name', displayName: '单位名称', width: 100, url: 'GROUPCUSTOMERREF'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'pkCustomer'

                },
                {
                    name: 'trainNum', displayName: '培训人数', width: 100


                },
            ],
            data: $scope.VO.trainObjectB,
            onRegisterApi: function (gridApi) {
                $scope.trainObjectBGridOptions.gridApi = gridApi;
            }
        };
        $scope.dealAttachmentCGridOptions = {
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
                {name: 'attachment_name', displayName: '附件名称'},
            ],
            data: $scope.VO.dealAttachmentC,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.dealAttachmentCGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.dealAttachmentCGridOptions.gridApi = gridApi;
                }
                $scope.dealAttachmentCGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };

        if($stateParams.id) {
            if(($stateParams.id).split("NY").length>1){
                let id =($stateParams.id).split("NY")[1];
                $scope.isEdit = true;
                $scope.isClear = false;
                if ($scope.isGrid) {
                    $scope.isGrid = false;
                    $scope.form=true;
                    $scope.findOne(id);
                    $scope.isbusinessStatus = false;
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                } else {
                    $scope.isGrid = false;
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                }
            }else {
                $scope.isbusinessStatus = true;
                $http.post($scope.localizedPath + "projectInformation/findOne", {pk: $stateParams.id}).success(function (response) {
                    if (response && response.code == "200") {
                        $scope.trainObjectGridOptions.data.push(response.result);
                        $scope.isEdit = true;
                        $scope.isClear = false;
                        $scope.isGrid = false;
                        $scope.form=true;
                        $scope.isBack = true;
                        $scope.isEdit = true;
                        $scope.isDisabled = false;
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
            }
            // $scope.onCard($stateParams.id);
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
        if ($scope.selectTabName == 'dealAttachmentCGridOptions') {
            $scope.upOrDownB = true;
        } else {
            $scope.upOrDownB = false;
        }
    };
    $scope.table_name = "lr_localized_customer_train";
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
    initonlineView($scope,$rootScope,$sce,$http,ngDialog);
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
                {
                    name: 'territorial_organization.name', displayName: '属地服务机构', width: 200, enableCellEdit: false
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
        data.pkOrg=$scope.VO.pkOrg;
        data.pkDept=$scope.VO.pkDept;
        $http.post($scope.localizedPath + 'projectInformation/referTo', {
            data: angular.toJson(data),
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
app.controller('trainPlanBGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('trainObjectBGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
