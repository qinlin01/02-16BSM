/**
 * Created by xlb on 2022/10/12
 */
app.controller('localizedPersonCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                personTypeName:'项目名称',
                personTel:'',
                personName:'',
                personType:1,
                projectName:'',
                insurerName:'',
                customerName:'',
                projectAddress:null,
                customerAddress:null,
                insurerAddress:null,
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                billStatus:31,
                dr: 0,
                person_name:'',
                person_tel:'',
                person_type:'',
                billstatus:'',
            };
        };
        $scope.nameTypeXm = true;
        //主表数据
        $scope.VO = $scope.initVO(

        );

        //初始化查询
        $scope.initQUERY = function () {
            return {
                "person_name":"",
                "person_tel":"",
                "person_type":"",
                "wideArea":"",
            }
        };
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
        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.localizedPath + "LocalPerson/queryForGrid", {
                params: angular.toJson(data),
                current: $scope.gridApi? $scope.gridApi.page : 1,
                size: $scope.gridApi ? $scope.gridApi.pageSize : 100,
            }).success(function (response) {
                for (let i = 0; i < response.data.records.length; i++) {
                    if(response.data.records[i].address!=null&&response.data.records[i].address!=""){
                        if(response.data.records[i].address.parent!=null&&response.data.records[i].address.parent!=""){
                            if(response.data.records[i].address.parent.parentName == "天津市"){
                                response.data.records[i].address.name = "天津市";
                            }
                            if(response.data.records[i].address.parent.parentName == "重庆市"){
                                response.data.records[i].address.name = "重庆市";
                            }
                            if(response.data.records[i].address.parent.parentName == "上海市"){
                                response.data.records[i].address.name = "上海市";
                            }
                            if(response.data.records[i].address.parent.parentName == "北京市"){
                                response.data.records[i].address.name = "北京市";
                            }
                        }
                    }
                }
                $scope.gridOptions.data = response.data.records;
                $scope.gridOptions.totalItems = response.data.total;
                layer.closeAll('loading');
            });
        };



        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.localizedPath + "LocalPerson/findOne", {id: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    if (callback) {
                        callback();
                    }
                    if(response.data.personType==1){
                        $scope.VO.personTypeName = "项目名称";
                        $scope.nameTypeKh = false;
                        $scope.nameTypeXm = true;
                        $scope.nameTypeBx = false;
                    }
                    if(response.data.personType==2){
                        $scope.VO.personTypeName = '公司名称';
                        $scope.nameTypeKh = true;
                        $scope.nameTypeXm = false;
                        $scope.nameTypeBx = false;
                    }
                    if(response.data.personType==3){
                        $scope.VO.personTypeName = '保险人名称';
                        $scope.nameTypeKh = false;
                        $scope.nameTypeXm = false;
                        $scope.nameTypeBx = true;
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
        $scope.onSaveVO = function () {
            layer.load(2);
            $http({
                method: "POST",
                url: $rootScope.localizedPath + "LocalPerson/save",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response.code == 200) {
                    angular.assignData($scope.VO, response.result);
                    $scope.isGrid = true;
                    $scope.isCard = false;
                    $scope.isForm = false;
                    layer.closeAll('loading');
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    $scope.onBack();
                }
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
        $scope.dateMinus = function(start,end){
            var nowstart = new Date(start);
            var nowend = new Date(end);
            var days = nowend.getTime() - nowstart.getTime();
            var day = parseInt(days / (1000 * 60 * 60 * 24))+1;
            return day;
        }
    };

    $scope.initWatch = function () {
        $scope.$watch('VO.LocalPerson', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.trainPlanGridOptions.data=$scope.VO.LocalPerson.trainPlan;
                $scope.dealAttachmentBGridOptions.data=$scope.VO.LocalPerson.dealAttachmentB;
            }
        }, true);
        $scope.$watch('VO.personType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if(newVal==2){
                $scope.nameTypeKh = true;
                $scope.nameTypeXm = false;
                $scope.nameTypeBx = false;
                if($scope.form){
                    $scope.VO.projectName="";
                    $scope.VO.insurerName="";
                    $scope.VO.customerName="";
                    $scope.VO.projectAddress=null;
                    $scope.VO.customerAddress=null;
                    $scope.VO.insurerAddress=null;
                }
                $scope.VO.personTypeName = '公司名称';
            }
            if(newVal==1){
                $scope.nameTypeKh = false;
                $scope.nameTypeXm = true;
                $scope.nameTypeBx = false;
                if($scope.form){
                    $scope.VO.projectName="";
                    $scope.VO.insurerName="";
                    $scope.VO.customerName="";
                    $scope.VO.projectAddress=null;
                    $scope.VO.customerAddress=null;
                    $scope.VO.insurerAddress=null;
                }
                $scope.VO.personTypeName = '项目名称';

            }
            if(newVal==3){
                $scope.nameTypeKh = false;
                $scope.nameTypeXm = false;
                $scope.nameTypeBx = true;
                if($scope.form){
                    $scope.VO.projectName="";
                    $scope.VO.insurerName="";
                    $scope.VO.customerName="";
                    $scope.VO.projectAddress=null;
                    $scope.VO.customerAddress=null;
                    $scope.VO.insurerAddress=null;
                }
                $scope.VO.personTypeName = '保险人名称';
            }
        }, true);
        $scope.$watch('VO.projectInformation', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            $scope.VO.projectName= $scope.VO.projectInformation.project_name;
        }, true);

    };

    $scope.initButton = function () {

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
        $scope.onTemporary = function () {
            layer.load(2);
            $http({
                method: "POST",
                url: $rootScope.localizedPath + "LocalPerson/temporary",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response.code == 200) {
                    angular.assignData($scope.VO, response.result);
                    $scope.isGrid = true;
                    $scope.isCard = false;
                    $scope.isForm = false;
                    layer.closeAll('loading');
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    $scope.onBack();
                }
            });
        };

        $scope.onImportUploads= function (type) {
            if(type){
                $("#inputFile").click();
            }else{
                if($scope.ImportExcelType == "XM"){
                    var file = document.getElementById("inputFile").files[0];
                    if(file!=null){
                        var form = new FormData();
                        form.append('file', file);
                        form.append('table', 'gLife');
                        layer.load(2);
                        $http({
                            method: 'POST',
                            url: $scope.localizedPath + 'LocalPerson/importExcelXM',
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
                                layer.closeAll('loading');
                                var obj = document.getElementById('inputFile') ;
                                obj.outerHTML=obj.outerHTML;
                            }
                            $scope.onBack();
                        }).error(function (data) {
                            console.log(data.code);
                            layer.alert(data.msg, {
                                skin: 'layui-layer-lan',
                                closeBtn: 1
                            });
                        })
                    }
                }
                if($scope.ImportExcelType == "KH"){
                    var file = document.getElementById("inputFile").files[0];
                    if(file!=null){
                        var form = new FormData();
                        form.append('file', file);
                        form.append('table', 'gLife');
                        layer.load(2);
                        $http({
                            method: 'POST',
                            url: $scope.localizedPath + 'LocalPerson/importExcelKH',
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
                                layer.closeAll('loading');
                                var obj = document.getElementById('inputFile') ;
                                obj.outerHTML=obj.outerHTML;
                            }
                            $scope.onBack();
                        }).error(function (data) {
                            console.log(data.code);
                            layer.alert(data.msg, {
                                skin: 'layui-layer-lan',
                                closeBtn: 1
                            });
                        })
                    }
                }
                if($scope.ImportExcelType == "BX"){
                    var file = document.getElementById("inputFile").files[0];
                    if(file!=null){
                        var form = new FormData();
                        form.append('file', file);
                        form.append('table', 'gLife');
                        layer.load(2);
                        $http({
                            method: 'POST',
                            url: $scope.localizedPath + 'LocalPerson/importExcelBX',
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
                                layer.closeAll('loading');
                                var obj = document.getElementById('inputFile') ;
                                obj.outerHTML=obj.outerHTML;
                            }
                            $scope.onBack();
                        }).error(function (data) {
                            console.log(data.code);
                            layer.alert(data.msg, {
                                skin: 'layui-layer-lan',
                                closeBtn: 1
                            });
                        })
                    }
                }
            }
        } ;



        $scope.ImportExcel = function () {
            layer.load(2);
            var inputFile = $('#inputFile');
            inputFile.click();
            layer.closeAll('loading');
        }
        $scope.ImportExcelXM = function () {
            var inputFile = $('#inputFile');
            $scope.ImportExcelType = "XM";
            inputFile.click();
        }
        $scope.ImportExcelKH = function () {
            var inputFile = $('#inputFile');
            $scope.ImportExcelType = "KH";
            inputFile.click();
        }
        $scope.ImportExcelBX = function () {
            var inputFile = $('#inputFile');
            $scope.ImportExcelType = "BX";
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
            angular.assignData($scope.VO, $scope.initVO());
        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            if ($scope.isGrid) {

                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id);

                $scope.isGrid = false;
                $scope.form=true;
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
                    $http.post($scope.localizedPath + "LocalPerson/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
                    return layer.alert(errEls[0].ngVerify.OPTS.message,
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    if($scope.VO.personType==1){
                        if($scope.VO.projectAddress.name==null&&$scope.VO.projectAddress.name==''){
                            return layer.alert("请填写项目所在地!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if($scope.VO.projectName == null||$scope.VO.projectName == ''){
                            return layer.alert("请填写项目名称!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if($scope.VO.personType==3){
                        if($scope.VO.insurerAddress.name==null&&$scope.VO.insurerAddress.name==''){
                            return layer.alert("请填写保险公司所在地!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if($scope.VO.insurerName == null||$scope.VO.insurerName == ''){
                            return layer.alert("请填写保险人名称!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if($scope.VO.personType==2){
                        if($scope.VO.customerAddress.name==null&&$scope.VO.customerAddress.name==''){
                            return layer.alert("请填写公司所在地!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if($scope.VO.customerName == null||$scope.VO.customerName == ''){
                            return layer.alert("请填写公司名称!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if($scope.VO.personTel==""||$scope.VO.personTel==null){
                        return layer.alert("请填写联系人电话!",
                            {skin: 'layui-layer-lan', closeBtn: 1});

                    }
                    $scope.onSaveVO();
                }
            }, true);
        };
        $scope.MessageSending = function() {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert("请选择数据进行操作!", {skin: 'layui-layer-lan', closeBtn: 1});
            // for (var i = 0; i < rows.length; i++) {
            //     if(rows[i].billstatus!=34){return layer.alert("只有保存生效的数据可以进行该操作", {skin: 'layui-layer-lan', closeBtn: 1});}
            // }
            layer.confirm('是否给选中数据加入风险信息加入名单？', {
                    btn: ['确定', '返回'], //按钮
                    btn2: function (index, layero) {layer.msg('取消加入!', {shift: 6, icon: 11});},
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    var data = [];
                    // for (var i = 0; i < rows.length; i++) {
                    //     var obj = {
                    //         "agentId":"J00122",
                    //         "connecter":rows[i].personName,
                    //         "curName":rows[i].projectName,
                    //         "dimId":"S00021",
                    //         "flag":"S0001",
                    //         "industryId":"D4420",
                    //         "industryName":"中建英大",
                    //         "mainFlag":rows[i].projectAddress.name,
                    //         "orgName":"中建英大",
                    //         "regionCode":rows[i].projectAddress.code,
                    //         "riskLevel":"Red,Orange",
                    //         "roadId":"SMS",
                    //         "tel":rows[i].personTel,
                    //         "useFlag":1
                    //         //    是否再用
                    //     };
                    //     data.push(obj);
                    // };
                    for (var i = 0; i < rows.length; i++) {
                        if(rows[i].billstatus==34){
                            data.push(rows[i]);
                        }
                    };
                    layer.load(2);
                    $http.post($scope.localizedPath + "WarnConnecter/save", {data: angular.toJson(data)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg('加入风险发送信息成功!', {
                                icon: 1
                            });
                        }else{
                            // response.msg[0].tel
                            if(typeof(response.msg)=='string'){
                                return layer.alert(response.msg);
                            }else {
                                return layer.alert(response.msg.length+"条数据发送失败");
                            }
                        }
                    });
                }
            );
        };
        $scope.MessageBack = function (){
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert("请选择数据进行操作!", {skin: 'layui-layer-lan', closeBtn: 1});
            // for (var i = 0; i < rows.length; i++) {
            //     if(rows[0].billstatus!=34){return layer.alert("只有保存生效的数据可以进行该操作", {skin: 'layui-layer-lan', closeBtn: 1});
            //     }
            // }
            layer.confirm('是否给选中数据加入风险信息取消加入名单？', {
                    btn: ['确定', '返回'], //按钮
                    btn2: function (index, layero) {layer.msg('取消!', {shift: 6, icon: 11});},
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    var data = [];
                    for (var i = 0; i < rows.length; i++) {
                        if(rows[i].billstatus==34){
                        var obj = {
                            "curName":rows[i].projectName,
                            "tel":rows[i].personTel,
                        };
                        data.push(obj);
                    }

                    };
                    layer.load(2);
                    $http.post($scope.localizedPath + "WarnConnecter/deleteByTel", {data: angular.toJson(data)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg('取消加入风险发送信息成功!', {
                                icon: 1
                            });
                        }else{
                            return layer.alert(response.msg);
                        }
                    });
                }
            );
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
                // {name: 'personType', displayName: '联系人类型',cellFilter:'SELECT_LOCALIZEDPERSONTYPE'},
                {name: 'personTypeName', displayName: '联系人类型'},
                {name: 'projectName', displayName: '项目名称'},
                {name: 'customerName', displayName: '公司名称'},
                {name: 'insurerName', displayName: '保险人名称'},
                {name: 'personName', displayName: '联系人'},
                {name: 'personTel', displayName: '联系电话'},
                // {name: 'projectAddress.name', displayName: '项目地址'},
                // {name: 'customerAddress.name', displayName: '客户地址'},
                // {name: 'insurerAddress.name', displayName: '保险公司地址'},
                {name: 'address.parent.parentName', displayName: '省'},
                {name: 'address.name', displayName: '市'},
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
    $scope.table_name = "t_local_person";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.onQuery();
    initworkflow($scope, $http,ngDialog);
});
