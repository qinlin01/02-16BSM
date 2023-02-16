/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('customerTrainCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $location,activitiModal, workFlowDialog) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                trainPlan: [],
                trainCost: [],
                trainObject: [],
                dealAttachmentB:[],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                billstatus:31,
                dr: 0,
                ifTechnicalSupport:'N',
                localizedCustomerTrain:'N',
                trainYear:new Date().getFullYear(),
                costscale: [],
                coomedium: [],
                changeType:0,
                executeType:1
            };
        };
        $scope.entityVO = 'nc.vo.busi.CustomerTrainVO';

        $scope.isReupdate = true;
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
        $scope.funCode ='2070402';
    };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "customerTrain/queryForGrid", {
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
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + "customerTrain/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.trainPlanGridOptions.data = $scope.VO.trainPlan;
                    // $scope.trainCostGridOptions.data = $scope.VO.trainCost;
                    $scope.trainObjectGridOptions.data = $scope.VO.trainObject;
                    $scope.dealAttachmentBGridOptions.data= $scope.VO.dealAttachmentB==undefined? [] :$scope.VO.dealAttachmentB;
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
//作废
//         $scope.onDiscard = function () {
//             layer.confirm('是否作废选中数据？', {
//                     btn: ['作废', '返回'], //按钮
//                     btn2: function (index, layero) {
//                         layer.msg('取消作废!', {
//                             shift: 6,
//                             icon: 11
//                         });
//                     },
//                     shade: 0.6,//遮罩透明度
//                     shadeClose: true,//点击遮罩关闭层
//                 },
//                 function () {
//                     layer.load(2);
//                     $http.post($scope.basePath + "customerTrain/discard",{pk:$scope.pk}).success(function (response) {
//                         layer.closeAll('loading');
//                         if (response && response.code == "200") {
//                             if (response.code == 200) {
//                                 layer.msg('作废成功!', {
//                                     shift: 6,
//                                     icon: 1
//                                 });
//                             } else {
//                                 layer.msg('操作失败!', {
//                                     shift: 6,
//                                     icon: 11
//                                 });
//                             }
//                         }
//                     });
//                 }
//             );
//         };


        /*
         * 保存VO
         * */
        $scope.onSaveVO = function (func) {
            layer.load(2);
            $http.post($rootScope.basePath + "customerTrain/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
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
                  //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
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
        $scope.$watch('VO.pkCustomer.name', function (newVal, oldVal) {
            if (newVal === oldVal) return;
            if (newVal ==undefined || newVal==null){
                $scope.VO.trainTheme ="";
                return;
            }
            if ($scope.isEdit) {
                if($scope.VO.pkCustomer){
                    $scope.VO.trainSite = {};
                    $scope.VO.trainSite.name = $scope.VO.pkCustomer.c_0_address;
                    $scope.VO.trainObject.splice(0, 1, {pkCustomer:$scope.VO.pkCustomer});
                    $http.post($scope.basePath + "customerTrain/getLowerCustomer",{pk: $scope.VO.pkCustomer.pk}).success(function (response) {
                        //layer.closeAll('loading');
                        if (response && response.code == "200") {
                            for(var i = 0; i < response.result.length ; i ++){
                                response.result[i].name = response.result[i].c_0_name;
                                $scope.VO.trainObject.splice(i+1, i+2, {pkCustomer:response.result[i]});
                            }
                            //$scope.VO.trainObject = $scope.VO.trainObject.concat(response.result);
                            //response.result;
                        }
                    });
                    if($scope.VO.projectType!=null && $scope.VO.projectType!=="")
                    {
                        $scope.VO.trainTheme=$scope.VO.trainYear+$scope.VO.pkCustomer.name+$rootScope.returnSelectName($scope.VO.projectType,'CUSTOMERTRAINTYPE');
                    }else if ($scope.VO.projectType==null &&$scope.VO.projectType ===""){
                        $scope.VO.trainTheme="";
                    }
                }
            }
        }, true);

            $scope.$watch('VO.projectType', function (newVal, oldVal) {
                if (newVal === oldVal) return;
                if (newVal==undefined || newVal==null){ $scope.VO.trainTheme=""; return; }
                if ($scope.isEdit) {
                    if($scope.VO.pkCustomer){
                        if($scope.VO.pkCustomer.name)
                        {
                            $scope.VO.trainTheme=$scope.VO.trainYear+$scope.VO.pkCustomer.name+$rootScope.returnSelectName($scope.VO.projectType,'CUSTOMERTRAINTYPE');
                        }
                    }
                }
            }, true);
        $scope.$watch('VO.trainPlan', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null)return;
            if ($scope.isEdit) {
                var array = $scope.trainPlanGridOptions.data;
                var data = $rootScope.diffarray(newVal, oldVal);
                for(var i=0;i<array.length;i++){
                    var item = array[i];
                    if(item.trainContent=='报到'){
                        $scope.start = item.trainDate;
                    }else if(item.trainContent=='结束'){
                        $scope.end = item.trainDate;
                    }
                }
                if($scope.start&&$scope.end){
                    $scope.VO.trainDayNum = $scope.dateMinus($scope.start,$scope.end);
                }
                if (data && data.col == 'trainDate') {
                    if (data.row.trainDate) {
                        //现在需求说已第一行作为开始时间，最后一行作为结束时间 2019-6-27
                        // var itemStart = array[0];
                        // $scope.start = itemStart.trainDate;
                        // var itemEnd = array[array.length -1];
                        // $scope.end = itemEnd.trainDate;

                        if($scope.start){
                            var st=new Date($scope.start);
                            var newval=new Date(data.row.trainDate);
                            if(newval<st){
                                data.row.trainDate = "";
                                return layer.alert("时间不能小于报到的时间!", {
                                    skin: 'layui-layer-lan',
                                    closeBtn: 1
                                });
                            }
                        }
                    }
                }
                if (data && data.col == 'trainContent') {
                    if (data.row.trainDate) {
                        for(var i=0;i<array.length;i++){
                            var item = array[i];
                            if(item.trainContent=='报到'){
                                $scope.start = item.trainDate;
                            }else if(item.trainContent=='结束'){
                                $scope.end = item.trainDate;
                            }
                        }
                        if($scope.start&&$scope.end){
                            $scope.VO.trainDayNum = $scope.dateMinus($scope.start,$scope.end);
                        }
                        if($scope.start){
                            var st=new Date($scope.start);
                            var newval=new Date(data.row.trainDate);
                            if(newval<st){
                                data.row.trainDate = "";
                                return layer.alert("时间不能小于报到的时间!", {
                                    skin: 'layui-layer-lan',
                                    closeBtn: 1
                                });
                            }
                        }
                    }
                }
                var innerCount = 0;
                for (var i = 0; i < array.length; i++) {
                    var item = array[i];
                    if (item && item.pkExpert && item.pkExpert.style == 1) {
                        innerCount +=1;
                    }
                }
                if ($scope.VO.trainCost) {
                    for (var j = 0; j < $scope.VO.trainCost.length; j ++) {
                        if ($scope.VO.trainCost[j].cost_code == "1001101") {
                            $scope.VO.trainCost[j].countLecturer = innerCount;
                        }
                    }
                }
            }
        }, true);
        $scope.$watch('VO.trainObject', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null)return;
            if ($scope.isEdit) {
                var array = newVal;
                var total = 0;
                for (var i = 0;i<array.length;i++){
                    if(array[i].trainNum){
                        total += Number(array[i].trainNum);
                    }
                }
                $scope.VO.trainPersNum = total;
                if($scope.VO.trainCost && $scope.VO.trainCost[$scope.VO.trainCost.length - 1]){
                    $scope.VO.trainCost[$scope.VO.trainCost.length - 1].countLecturer = total;
                }
            }
        }, true);
        $scope.$watch('VO.trainCost', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null)return;
            if ($scope.isEdit) {
                var data = $rootScope.diffarray(newVal, oldVal);
                if(data){
                    if(data && typeof Number(data.row.countLecturer) == 'number' && typeof Number(data.row.countHour) == 'number' && typeof Number(data.row.costUnit) == 'number'){
                        var params = {person:data.row.countLecturer,day:data.row.countHour,costUnit:data.row.costUnit,formula:data.row.formula};
                        $http.post($scope.basePath + "customerTrain/trainCost", {data: angular.toJson(params)}).success(function (response) {
                            if (response.result) {
                                data.row.costSubtotal = response.result;
                            }
                        });
                    }
                    if(data.col == 'costSubtotal'){
                        var array = newVal;
                        var totalCos = 0;
                        for(var i = 0;i<array.length-1;i++){
                            var number = Number(array[i].costSubtotal);
                            if(number){
                                totalCos += number;
                            }
                        }
                        $scope.VO.trainCost[$scope.VO.trainCost.length - 1].costSubtotal = totalCos;
                        // $scope.VO.realityTrainCost = totalCos;
                        // $scope.VO.checkTrainCost = totalCos;
                    }
                    if(data.col == 'countHour'){
                        var array = newVal;
                        var totalHour = 0;
                        for(var i = 0;i<array.length-1;i++){
                            var number = Number(array[i].countHour);
                            if(number){
                                totalHour += number;
                            }

                        }
                        $scope.VO.trainCost[$scope.VO.trainCost.length - 1].countHour = totalHour;
                    }
                }
            }
        }, true);
        $scope.$watch('VO.ifTechnicalSupport', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if($scope.VO.ifTechnicalSupport == 'Y'){
                    $scope.ifTechnicalSupportDisable = false;
                }else{
                    $scope.ifTechnicalSupportDisable = true;
                }
            }
        }, true);
    };

    $scope.initButton = function () {

        $scope.onPrintReport = function () {
            alert("反应");
            $scope.raq = "customerReport";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $http.post($rootScope.basePath + "customerTrain/print", {data: angular.toJson($scope.VO),raq:$scope.raq,type : "PDF"}).success(function (response) {
                layer.closeAll('loading');
                // if(fun) fun(response);
                if(response.code == 200){
                    window.open(getURL(response.queryPath));
                }
            });

        }

        $scope.onPrintCheck = function () {
            $scope.raq = "signCustomerCheckBill";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $http.post($rootScope.basePath + "customerTrain/print", {data: angular.toJson($scope.VO),raq:$scope.raq,type : "PDF"}).success(function (response) {
                layer.closeAll('loading');
                // if(fun) fun(response);
                if(response.code == 200){
                    window.open(getURL(response.queryPath));
                }
            });
        }

        /**
         * 打印
         * @returns {*}
         */
        $scope.onPrintCost = function() {
            $scope.raq = "trainCost";
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $http.post($rootScope.basePath + "customerTrain/print", {data: angular.toJson($scope.VO),raq:$scope.raq,type : "PDF"}).success(function (response) {
                layer.closeAll('loading');
                // if(fun) fun(response);
                if(response.code == 200){
                    window.open(getURL(response.queryPath));
                }
            });

        }
        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };
        $scope.onUploadPhoto = function () {
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
                    return true;
                }
            }).then(function (value) {
                if (value != null) {
                    $scope.gridOptions.data.handoutsAccessory=value;
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

                $scope.onSaveVO(function () {
                    $scope.photo=true;
                });
                }
            }, function (reason) {

            });
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
                    return true;
                }
            }).then(function (value) {
                if (value != null) {
                    $scope.gridOptions.data.handoutsAccessory=value;
                    var lecture = "";
                    var length =$scope.gridOptions.data.handoutsAccessory.length;
                    for(var i = 0; i < length; i ++){
                        if(i == length - 1){
                            lecture = lecture + $scope.gridOptions.data.handoutsAccessory[i].attachment_name;
                        }else{
                            lecture = lecture + $scope.gridOptions.data.handoutsAccessory[i].attachment_name + ",";
                        }
                    }
                    $scope.VO.handoutsAccessory ={pk:$scope.gridOptions.data.handoutsAccessory[0].pk_pub_blob.pk_pub_blob,name:lecture} ;
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
        };
*/
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
        $scope.onTemporary = function (data) {
            if (data) {

                data.trainPlan = $scope.trainPlanGridOptions.data ;
                // data.trainCost = $scope.trainCostGridOptions.data ;
                data.trainObject = $scope.trainObjectGridOptions.data ;
                data.dealAttachmentB = $scope.dealAttachmentBGridOptions.data ;

                var tablename = $scope.table_name;
                $http.post($rootScope.basePath + "temporary/insert", {
                    data: angular.toJson(data),
                    tablename: tablename
                }).success(function (response) {
                    if (response.code == 200) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                        return layer.alert('暂存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                });
            }
        }

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
            $scope.PK_CUS_DEPT=$rootScope.SELECT.PK_CUS.PK_CUS_DEPT;
            $scope.data={
                pk:$scope.PK_CUS_DEPT,
            }
            $http.post($scope.basePath + "deptTreeRef/queryForGrid", {
                data: angular.toJson($scope.data),
            }).success(function (response) {
                if (response && response.code == "200") {
                    $scope.VO.pkDeliverUnit=response.result.Rows[0];
                }
            });

            //初始化子表
            for(var i =0;i<7;i++){
                var trainContent = "";
                if(i == 0){
                    trainContent = "报到";
                }
                if(i == 6){
                    trainContent = "结束";
                }
                $scope.VO.trainPlan.push({beginTimeEnum:17,endTimeEnum:17,trainContent:trainContent});
            }
            $http.post($scope.basePath + "customerTrain/addChildren").success(function (response) {
                if (response && response.code == "200") {
                    for(var i = 0;i<response.result.length;i++){
                        $scope.VO.trainCost.push(response.result[i]);
                    }
                }
            });
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
        $scope.onReupdate = function () {
            //  控制字表按钮的显示
            // $scope.isEdit = true;
            $scope.isGrid = false;
            $scope.form=true;
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行操作!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            $scope.findOne(rows[0].id);
            $scope.isBack = true;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.isReupdate = false;
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
            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {pk:id,tableName:$scope.table_name,billdef:$scope.billdef}).success(function (response)  {
                if (response && response.code == "200") {
                    $scope.card=true;
                    angular.assignData($scope.VO, response.result);

                    $scope.trainPlanGridOptions.data = $scope.VO.trainPlan;
                    // $scope.trainCostGridOptions.data = $scope.VO.trainCost;
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
                   // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
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
                    $http.post($scope.basePath + "customerTrain/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
                $scope.trainPlanGridOptions.data = $scope.VO.trainPlan;
                // $scope.trainCostGridOptions.data = $scope.VO.trainCost;
                $scope.trainObjectGridOptions.data = $scope.VO.trainObject;
                $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB==undefined ? [] :$scope.VO.dealAttachmentB;
            }
            $scope.isDisabled = true;
            $scope.isEdit = false;
            $scope.isBack = false;
            $scope.isReupdate = true;
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
            $scope.isReupdate = true;
            $scope.trainPlanGridOptions.data =[];
            $scope.trainObjectGridOptions.data =[];
            $scope.dealAttachmentBGridOptions.data= [];
        };
        $scope.onBack = function () {
            if($stateParams.id) {
                window.history.back(-2);
                return;
            }
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isDisabled = true;
            //阻止页面渲染
            $scope.form = false;
            $scope.card = false;
            $scope.queryForGrid($scope.QUERY);
            $scope.isReupdate = true;
        };
        /**
         * 保存判断必输项
         */
        $scope.onSave = function () {
            if($scope.VO.ifTechnicalSupport == 'Y' && ($scope.VO.technicalSupportRequest == undefined ||
                $scope.VO.technicalSupportRequest == "")){
                return layer.alert("需要技术支持时，请填写讲师要求!",
                    {skin: 'layui-layer-lan', closeBtn: 1});
            }
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    $scope.firChildFlag = true;
                    if(!$scope.VO.trainDayNum){
                        return layer.alert("培训计划时间子表属性【内容】缺少“报到”和“结束”标识!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if($scope.VO.trainPlan){
                        angular.forEach($scope.VO.trainPlan,function (item) {
                            if(!item.trainDate){
                                $scope.firChildFlag = false;
                                return layer.alert("子表属性培训日期不可为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if(!item.trainContent){
                                $scope.firChildFlag = false;
                                return layer.alert("子表培训内容不可为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        });
                    }
                    if($scope.firChildFlag){
                        if($scope.VO.trainObject){
                            angular.forEach($scope.VO.trainObject,function (item) {
                                if(!item.pkCustomer){
                                    $scope.firChildFlag = false;
                                    return layer.alert("子表属性培训对象不可为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            });
                        }
                    }
                    if($scope.dealAttachmentBGridOptions.data.length==0){
                        return layer.alert("请上传讲义文件!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.firChildFlag){
                        $scope.VO.trainYearName = $rootScope.returnSelectName($scope.VO.trainYear,"BUSIYEAR");
                        $scope.VO.projectTypeName = $rootScope.returnSelectName($scope.VO.projectType,"CUSTOMERTRAINTYPE");
                        $scope.VO.enumTrainTypeName = $rootScope.returnSelectName($scope.VO.enumTrainType,"TRAINTYPE");
                        $scope.VO.ifTechnicalSupportName = $rootScope.returnSelectName($scope.VO.ifTechnicalSupport,"YESNO");
                        $scope.VO.changeTypeName = $rootScope.returnSelectName($scope.VO.changeType,"CUSTOMERTRAINCHANGETYPE");
                        $scope.VO.executeTypeName = $rootScope.returnSelectName($scope.VO.executeType,"TRAINEXECUTETYPE");
                        // 如果是暂存的数据时，需要修正单据状态
                        if ($scope.VO.billstatus == 37) {
                            $scope.VO.billstatus = 31;
                        }
                        $scope.onSaveVO();
                    }/*else {
                        return layer.alert("子表属性培训日期不可为空!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }*/
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
        $scope.onAddLine = function () {

            $scope[$scope.selectTabName].data.push({});
            // //培训计划时间子表增行时确保最下面一行显示为结束时间 2019-6-27
            // if($scope.selectTabName == "trainPlanGridOptions"){
            //     var length = $scope.trainPlanGridOptions.data.length;
            //     for(var i = 0; i <length;i++){
            //         var item =$scope.trainPlanGridOptions.data[i];
            //         if(item.trainContent == "结束"){
            //             item.trainContent = '';
            //             delete item["trainContent"];
            //         }
            //     }
            //     $scope[$scope.selectTabName].data.push({"trainContent":"结束"});
            // }else{
            //     $scope[$scope.selectTabName].data.push({});
            // }

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
                {name: 'trainCode', displayName: '申报编号', width: 100,},
                {name: 'trainYear', displayName: '培训年度', width: 100, cellFilter: 'SELECT_BUSIYEAR'},
                {name: 'pkCustomer.code', displayName: '客户编号', width: 100,},
                {name: 'pkCustomer.name', displayName: '客户名称', width: 100,},
                {name: 'projectType', displayName: '业务类型', width: 100, cellFilter: 'SELECT_CUSTOMERTRAINTYPE'},
                {name: 'trainTheme', displayName: '培训主题', width: 100,},
                {name: 'trainSite.name', displayName: '培训地点', width: 100,},
                {name: 'pkDeliverUnit.name', displayName: '报送单位', width: 100,},
                {name: 'trainGoal', displayName: '培训目的', width: 100,},
                {name: 'trainDayNum', displayName: '培训天数', width: 100,},
                {name: 'enumTrainType', displayName: '培训形式', width: 100, cellFilter: 'SELECT_TRAINTYPE'},
                {name: 'trainPersNum', displayName: '培训参加人数', width: 100,},
                // {name: 'realityTrainCost', displayName: '预算费用', width: 100,},
                // {name: 'actualTrainCost', displayName: '实际费用', width: 100,},
                // {name: 'checkTrainCost', displayName: '复核费用', width: 100,},
                {name: 'ifTechnicalSupport', displayName: '是否需要技术支持', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'technicalSupportRequest', displayName: '讲师要求', width: 100,},
                {name: 'changeType', displayName: '单据类型', width: 100, cellFilter: 'SELECT_CUSTOMERTRAINCHANGETYPE'},
                {name: 'endReasonText', displayName: '变更原因', width: 100,},
                {name: 'executeType', displayName: '执行状态', width: 100, cellFilter: 'SELECT_TRAINEXECUTETYPE'},
                {name: 'handoutsAccessory.name', displayName: '讲义文件', width: 100,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '发起人', width: 100,},
                {name: 'operateDate', displayName: '发起日期', width: 100,},
                {name: 'operateTime', displayName: '发起时间', width: 100,},
                {name: 'pkOrg.name', displayName: '发起单位', width: 100,},
                {name: 'pkDept.name', displayName: '部门', width: 100,},
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
            columnDefs: [
                {
                    name: 'trainDate', displayName: '培训日期', width: 100,
                    editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'
                    , enableCellEdit: true
                },
                {
                    name: 'beginTimeEnum', displayName: '开始时间', width: 100, cellFilter: 'SELECT_TIMEENUMTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.TIMEENUMTYPE
                    , enableCellEdit: true
                },
                {
                    name: 'endTimeEnum', displayName: '结束时间', width: 100, cellFilter: 'SELECT_TIMEENUMTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.TIMEENUMTYPE
                    , enableCellEdit: true
                },
                {
                    name: 'trainContent', displayName: '内容', width: 100


                },
                {
                    name: 'pkExpert.name', displayName: '讲师', width: 100, url: 'expertRef/queryForGrid'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'pkExpert'
                    , enableCellEdit: true

                },
                {
                    name: 'pkExpert.style', displayName: '专家类型', width: 100, cellFilter: 'SELECT_STYLE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.STYLE
                    , enableCellEdit: false
                },
            ],
            data: $scope.VO.trainPlan,
            onRegisterApi: function (gridApi) {
                $scope.trainPlanGridOptions.gridApi = gridApi;
            }
        };
        $scope.trainCostGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'projectLevel1', displayName: '一级项目', width: 100
                    , enableCellEdit: false

                },
                {
                    name: 'projectLevel2', displayName: '二级项目', width: 100
                    , enableCellEdit: false

                },
                {
                    name: 'countLecturer', displayName: '人数', width: 100
                    , enableCellEdit: true

                },
                {
                    name: 'countHour', displayName: '天数/小时', width: 100
                    , enableCellEdit: true
                },
                {
                    name: 'costUnit', displayName: '单价(元)', width: 100
                    , cellFilter: 'number:2'
                    , enableCellEdit: true
                },
                {
                    name: 'costSubtotal', displayName: '预算费用', width: 100
                    , cellFilter: 'number:2'
                    , enableCellEdit: true
                },
                {
                    name: 'memo', displayName: '备注', width: 100
                    , enableCellEdit: true
                },
            ],
            data: $scope.VO.trainCost,
            onRegisterApi: function (gridApi) {
                $scope.trainCostGridOptions.gridApi = gridApi;
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
            columnDefs: [
                {
                    name: 'pkCustomer.name', displayName: '单位名称', width: 100, url: 'customerAgentRef/queryForGrid'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'pkCustomer'

                },
                {
                    name: 'trainNum', displayName: '培训人数', width: 100
                    , enableCellEdit: true
                },
                {
                    name: 'memo', displayName: '备注', width: 100
                    , enableCellEdit: true
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
                {name: 'attachment_name', displayName: '附件名称', width: 120},
                {
                    name:'pk_project_id',
                    displayName:' ',
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ng-click="grid.appScope.onPreviewFile(row.entity.pk_project_id,row.entity.attachment_name)" class="btn btn-transparent btn-xs tooltips" tooltip-placement="top">在线预览&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i></a></div>'
                }
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
    $scope.table_name = "lr_customer_train";
    $scope.billdef = "CustomerTrain";
    $scope.beanName = "insurance.CustomerTrainserviceImpl";
    $scope.initData();
    initPreviewFile($scope,$rootScope);
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();

    initworkflow($scope, $http,ngDialog);
    initonlineView($scope,$rootScope,$sce,$http,ngDialog);
});
app.controller('trainPlanGridOptionsCtrl', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('trainCostGridOptionsCtrl', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('trainObjectGridOptionsCtrl', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('printCtrl', function ($scope, $rootScope, $http, ngDialog, FileUploader, ngVerify, $compile,$timeout) {

    $scope.queryPrint = function () {
        $http.post($scope.basePath + "customerTrain/print", {data: angular.toJson($scope.VO),raq:$scope.raq}).success(function (response) {
            layer.closeAll('loading');
            if (response.code == 200) {
                var html = $compile(response.result)($scope);
                html.appendTo('#printHtml');
                // $scope.$parent.confirm(response);
                // layer.msg(response.msg);

            }

        });
    }
    $scope.queryPrint();
    $scope.print = function () {
        $scope.print = function(){

            //获取当前页的html代码
            var bodyhtml = window.document.body.innerHTML;
            //设置打印开始区域、结束区域
            var startFlag = "<!--startprint-->";
            var endFlag = "<!--endprint-->";
            // 要打印的部分
            var printhtml = bodyhtml.substring(bodyhtml.indexOf(startFlag),
                bodyhtml.indexOf(endFlag));
            // 生成并打印ifrme
            var f = document.getElementById('printf');
            f.contentDocument.write(printhtml);
            f.contentDocument.close();
            f.contentWindow.print();
        }
    }
    $scope.onPrint = function () {
        $scope.print();
    }
});
