app.controller('projectInformationCtrl', function ($rootScope, $scope, $http, $sce, $stateParams, uiGridConstants, ngDialog,$state,ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        //初始化查询
        $scope.initVO = function () {
            return {
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                customer_name:'',
                project_name:'',
                insurancetype:'',
                project_address:'',
                // service_organizati:'',
                begin_time:'',
                end_time:'',
                insurance_no:'',
                project_state:'',
                territorial_organization:'',
                // service_year:'',
                service_income:'',
                project_contact:'',
                project_contactway:'',
                contact:'',
                contactway:'',
                insurance_contact:'',
                insurance_contactway:'',
                id:'',
                insurance_type:'',
                selectTerritorial:'',
                dr:0,
                service_fee_receivable:'',
                service_charge_received:'',
                unpaid_service_charge:'',
                dealAttachmentB:[]
            };
        };
        $scope.initQUERY = function () {
            return {
                "customer_name":"",
                "project_name":"",
                "project_address":"",
                "insurance_no":"",
                // "service_year":parseInt(new Date().format("yyyy")),
                "insurancetype":"",
                "wideArea":"",
                "service_incomeType":0,
                "import_time_year":parseInt(new Date().format("yyyy")),
            }
        };
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.QUERY = $scope.initQUERY();
        $scope.issueRef =
            {
                id: $scope.$id,
                columnDefs: [
                    {
                        field: 'personName',
                        displayName: '联系人姓名'
                    },
                    {
                        field: 'personTel',
                        displayName: '联系人电话'
                    }
                ],
                data: ""
            };
        $scope.param = {
            start_date0_0le:new Date().format("yyyy-MM-dd"),
            end_date0_0ge:new Date().format("yyyy-MM-dd"),
            billstatus:34,
        }
        $scope.tempRef =
            {
                id: $scope.$id,
                columnDefs: [
                    {
                        field: 'templateId',
                        displayName: '模板编号'
                    },
                    {
                        field: 'templateName',
                        displayName: '模板名称'
                    },
                    {
                        field: 'services',
                        displayName: '模板名称',

                    }
                ],
                data: ""
            };
        $scope.caseList = [];
    };
    //导入查询模板条件
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

        $scope.onUploadsProject = function () {
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

        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.localizedPath + "projectInformation/queryForGrid", {
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

        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.localizedPath + "projectInformation/findOne", {pk: pk}).success(function (response) {
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

        $scope.findCase = function (pk) {
            $scope.pk = pk;
            $http.post($scope.localizedPath + "projectInformation/findCase", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {

                    $scope.caseList = response.result;
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

    };

    $scope.initButton = function () {
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

        //附件上传
        $scope.onUploads = function (selectTabName) {
            layer.load(2);
            $scope.isSubDisabled = true;
            $scope.isUploadAnytime = true;
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
                    let attachmentList = [];
                    attachmentList = value;
                    if(attachmentList.length>9){
                        return layer.alert("批量上传最大个数为10！", {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        })
                    }
                    layer.load(2);
                    //调用后台保存接口
                    $http.post($scope.localizedPath + "LocalProjectAttachment/saveFiles", {
                        data: angular.toJson(value),
                    }).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {

                            layer.alert(response.msg, {
                                icon: 1
                            });
                        }

                    });
                }
            }, function (reason) {
            });
        };
        $scope.ImportFile = function(){
            layer.load(2);
            $http({
                method: 'POST',
                url: $scope.localizedPath + 'projectInformation/importExcel',
                data: $scope.form,
                headers: {'Content-Type': undefined,'x-auth-token': window.sessionStorage.getItem("token")},
                transformRequest: angular.identity
            }).success(function (data) {
                layer.closeAll('loading');
                if(data.code == 200){
                    layer.alert(data.msg, {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                    var obj = document.getElementById('inputFile');
                    obj.outerHTML=obj.outerHTML;
                    $scope.VO.Temp = null;
                    $scope.VO.file_name = null;
                    $scope.queryForGrid();
                }
                if(data.code = 500){
                    layer.alert(data.msg);
                }

            }).error(function (data) {
                layer.alert(data.msg, {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            })
            ngDialog.closeAll();
        }
        //导入
        $scope.onImportUploads= function (type) {
            if(type){
                $("#inputFile").click();
            }else{
                var file = document.getElementById("inputFile").files[0];
                if(file!=null){
                    $scope.form = new FormData();
                    $scope.$apply(function (){
                        $scope.VO.file_name = file.name;
                    });
                    var deptVO = $rootScope.deptVO;
                    var orgVO = $rootScope.orgVO;
                    var userVO = $rootScope.userVO;
                    var tempVO = $scope.VO.Temp;
                    var data ={deptVO,orgVO,userVO,tempVO};
                    $scope.form.append('file', file);
                    $scope.form.append('data',angular.toJson(data));

                }

            }
        } ;

        $scope.ImportExcel = function () {
            if($scope.VO.Temp == null || $scope.VO.Temp == ""){
                return layer.alert("请先选择模板", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            var inputFile = $('#inputFile');
            inputFile.click();
        };

        $scope.onUpdate = function (){
            let rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });

            //字段控制
            if($scope.VO.begin_time == "" || $scope.VO.begin_time == null){
                $scope.isBegin_time = false;
            }
            if($scope.VO.end_time == "" || $scope.VO.end_time == null){
                $scope.isEnd_time = false;
            }
            if($scope.VO.insurancetype==null || $scope.VO.insurancetype == "" || $scope.VO.insurancetype.name == "" || $scope.VO.insurancetype.name == null){
                $scope.isInsurancetype = false;
            }
            if($scope.VO.insurance_no == "" || $scope.VO.insurance_no == null){
                $scope.isInsurance_no = false;
            }
            $scope.isGrid = false;
            $scope.isForm = true;
            $scope.form = true;
            $scope.isCard = false;
        }
        $scope.onDelete = function(){
            let rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return layer.alert("请至少选择一条数据进行删除!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for(let i=0;i<rows.length;i++){
                $http.post($scope.localizedPath + "projectInformation/delete", {
                    data: angular.toJson(rows[i])
                }).success(function (response) {
                    if(response.code==200){
                        if(response.msg){
                            layer.alert(response.msg, {
                                skin: 'layui-layer-lan',
                                closeBtn: 1
                            });
                        }
                    }
                    if(response.code == 500){
                        layer.alert(response.msg, {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                    }
                    $scope.queryForGrid($scope.QUERY);
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

        $scope.onSave = function(VOdata){
            var form = new FormData();
            if(VOdata){
                form.append('data',angular.toJson(VOdata));
                $http({
                    method: 'POST',
                    url: $scope.localizedPath + 'projectInformation/update',
                    data: form,
                    headers: {'Content-Type': undefined,'x-auth-token': window.sessionStorage.getItem("token")},
                    transformRequest: angular.identity
                }).success(function (data) {
                    if($stateParams.id!=null){
                        $scope.queryForGrid($scope.queryParam);
                    }

                }).error(function (data) {
                    layer.alert(data.msg, {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                })
                return layer.alert("修改成功", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }else {
                ngVerify.check('appForm', function (errEls) {
                    if (errEls && errEls.length) {
                        return layer.alert("请填写所有必填项！",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }else{

                        if($scope.VO.begin_time >= $scope.VO.end_time){
                            return layer.alert("项目起始时间必须小于结束时间",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }

                        layer.confirm('投保险种，保单号，项目开始期日，项目到期期日一旦保存，以后无法修改，请仔细核对后再提交!', {
                                btn: ['是', '否'], //按钮
                                btn2: function (index, layero) {
                                    layer.msg('取消!', {
                                        shift: 6,
                                        icon: 11
                                    });
                                },
                                shade: 0.6,//遮罩透明度
                                shadeClose: true,//点击遮罩关闭层
                            },
                            function () {
                                form.append('data',angular.toJson($scope.VO));
                                $http({
                                    method: 'POST',
                                    url: $scope.localizedPath + 'projectInformation/update',
                                    data: form,
                                    headers: {'Content-Type': undefined,'x-auth-token': window.sessionStorage.getItem("token")},
                                    transformRequest: angular.identity
                                }).success(function (data) {
                                    layer.alert(data.msg, {
                                        skin: 'layui-layer-lan',
                                        closeBtn: 1
                                    });
                                    if($stateParams.id!=null){
                                        $scope.queryForGrid($scope.queryParam);
                                    }
                                    $scope.isBegin_time = true;
                                    $scope.isEnd_time = true;
                                    $scope.isInsurance_no = true;
                                    $scope.isInsurancetype = true;
                                }).error(function (data) {
                                    console.log(data.code);
                                    layer.alert(data.msg, {
                                        skin: 'layui-layer-lan',
                                        closeBtn: 1
                                    });
                                });

                            }
                        );
                    }
                });
            }
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
            // $scope.findOne(id);
            if($scope.VO.insurance_type!=null&&$scope.VO.insurance_type!=""&&$scope.VO.insurance_type=="人身险"){
                $scope.isRsx= true;
            }
            $scope.findCase(id);
            $scope.isGrid = false;
            $scope.isCard = true;
            $scope.isForm = false;
            $scope.isSuperForm = false;
            $scope.form = false;
        };

        /**
         * 返回
         */
        $scope.onBack = function () {
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isForm = false;
            $scope.isSuperForm = false;
            $scope.form = false;
            $scope.isBegin_time = true;
            $scope.isEnd_time = true;
            $scope.isInsurance_no = true;
            $scope.isInsurancetype = true;
            $scope.VO = $scope.VO();
            $scope.QUERY = $scope.initQUERY();
            $scope.queryForGrid($scope.QUERY);
        };

        $scope.onDistribution = function(){
            let rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return layer.alert("请至少选择一条数据进行分配!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/localized/onDistributionForm.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                preCloseCallback: function (value) {
                    if (value && value == "clear") {
                        //重置
                        $scope.VO.selectTerritorial = '';
                        return false;
                    }
                    //取消
                    $scope.VO.selectTerritorial = '';
                    return true;
                }
            })
        }
        $scope.onSelect = function(){
            var selectVO = $scope.VO.selectTerritorial;
            let rows = $scope.gridApi.selection.getSelectedRows();
            if(!selectVO){
                return layer.alert("请选择属地服务机构", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            if (!rows || rows.length <= 0) return layer.alert("请至少选择一条数据进行分配!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            //回写
            for(var i=0;i<rows.length;i++){
                var dataVO = rows[i];
                dataVO.territorial_organization = selectVO;
                $scope.onSave(dataVO);
            }
        }
        //下载附件
        $scope.onDownLoadsCard = function (id) {
            let ids = [];
            ids.push(id);
            let exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };
        //选择附件上传所属公司
        // $scope.onAttachment = function(){
        //     ngDialog.openConfirm({
        //         showClose: true,
        //         closeByDocument: true,
        //         template: 'view/localized/onAttachmentForm.html',
        //         className: 'ngdialog-theme-formInfo',
        //         scope: $scope,
        //         preCloseCallback: function (value) {
        //             if (value && value == "clear") {
        //                 //重置
        //                 $scope.VO.selectTerritorial = '';
        //                 return false;
        //             }
        //             //取消
        //             $scope.VO.selectTerritorial = '';
        //             return true;
        //         }
        //     })
        // }
        // $scope.onAttachmentSelect = function(){
        //     $rootScope.selectTerritorial = $scope.VO.selectTerritorial;
        //     if(!$rootScope.selectTerritorial){
        //         return layer.alert("请选择公司", {
        //             skin: 'layui-layer-lan',
        //             closeBtn: 1
        //         });
        //     }
        //     $scope.onUploads();
        //
        // }

        //查看详情
        $scope.onViewCase = function (id) {
            var app = "app.localized.caseinformation";
            var id = id;
            var fun_code = "1502";
            $http.post($scope.basePath + "account/setFunCode", {fun_code:fun_code}).success(function (response) {
                $state.go(app,{'id':id},{
                    reload:true
                });
            });
        };
        //一键生成报案信息
        $scope.onOneKeyGeneration = function (){
            let rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return layer.alert("请至少选择一条数据进行生成!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for(let i=0;i<rows.length;i++){
                if(rows[i].project_state != 1){
                    return layer.alert("请选择项目状态为服务中的数据!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    })
                }else{
                    if(rows[i].tempServices == null || rows[i].tempServices == ""){
                        return layer.alert("项目服务内容需为案件管理!", {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        })
                    }else{
                        for (let j = 0; j < rows[i].tempServices.length; j++) {
                            if(rows[i].tempServices[j].pk != 1) {
                                return layer.alert("项目服务内容需为案件管理!", {
                                    skin: 'layui-layer-lan',
                                    closeBtn: 1
                                })
                            }else{
                                $http.post($scope.localizedPath + "caseInformation/oneKeySave", {
                                    data: angular.toJson(rows[i])
                                }).success(function (response) {
                                    layer.closeAll('loading');
                                    if(response.code==200){
                                        if(response.msg){
                                            layer.alert(response.msg, {
                                                skin: 'layui-layer-lan',
                                                closeBtn: 1
                                            });
                                        }
                                    }
                                    if(response.code == 500){
                                        layer.alert(response.msg, {
                                            skin: 'layui-layer-lan',
                                            closeBtn: 1
                                        });
                                    }
                                    $scope.queryForGrid($scope.QUERY);
                                }).error(function (data) {
                                    layer.alert("系统异常", {
                                        skin: 'layui-layer-lan',
                                        closeBtn: 1
                                    });
                                })
                            }
                            break;
                        }

                    }
                }
            }
        }

        $scope.onDistributionTemp = function(){
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/localized/onTemplateForm.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                preCloseCallback: function (value) {
                    if (value && value == "clear") {
                        //重置
                        $scope.VO.Temp = '';
                        $scope.VO.file_name = '';
                        return false;
                    }
                    //取消
                    $scope.VO.Temp = '';
                    $scope.VO.file_name = '';
                    return true;
                }
            })
        }
        $scope.onSelectTemp = function(){
            var Temp = $scope.VO.Temp;
            if(!Temp){
                return layer.alert("请选择模板", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            var fileName = $scope.VO.file_name;
            if(!fileName){
                return layer.alert("请导入项目文件", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            $scope.ImportFile();
        }
        $scope.onClear = function (){
            return true;
        }
        $scope.onSuperUpdate = function(){
            let rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            $scope.isSuperForm = true;
            $scope.isGrid = false;
            $scope.isForm = false;
            $scope.form = false;
            $scope.isCard = false;
        }
    };

    $scope.initPage = function () {
        $scope.isCard = false;
        $scope.form = false;
        $scope.isGrid = true;
        $scope.isForm = false;
        $scope.isSuperForm = false;
        $scope.isBegin_time = true;
        $scope.isEnd_time = true;
        $scope.isInsurance_no = true;
        $scope.isInsurancetype = true;
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
            exporterCsvFilename: '项目信息管理.csv',
            columnDefs: [
                {name: 'customer_name', displayName: '客户名称'},
                {name: 'project_name', displayName: '项目名称'},
                {name: 'project_address', displayName: '项目地址'},
                {name: 'insurance_no', displayName: '保单号'},
                {name: 'insurancetype.name', displayName: '投保险种'},
                {name: 'begin_time', displayName: '保险起始日期'},
                {name: 'end_time', displayName: '保险到期日期'},
                {name: 'project_state', displayName: '项目状态',cellFilter: 'SELECT_PROJECTINFORMATIONSTATETYPE'},
                {name: 'import_time', displayName: '导入时间'},
                {name: 'territorial_organization.name', displayName: '属地服务机构'},
                {name: 'service_fee_receivable', displayName: '应收服务费'},
                {name: 'service_charge_received', displayName: '已结服务费'},
                {name: 'unpaid_service_charge', displayName: '未收服务费'},
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

        $scope.dealAttachmentBGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
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
        if($stateParams.id) {
            $scope.onQueryParam = function () {
                return {
                    "project_state":3,
                    'territorial_organization_name':$rootScope.orgVO.name,
                    'business_pk':$stateParams.id,
                }
            };
            $scope.queryParam = $scope.onQueryParam();
            $scope.queryForGrid($scope.queryParam);
            // $http.post($rootScope.localizedPath + "projectInformation/updateBusiness", {pk:$stateParams.id}).success(function (response) {});
        }else{
            $scope.onQuery();
        }
    };

    $scope.initWatch = function () {
        $scope.$watch('VO.project_contact', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if($scope.VO.project_contact!=null|| !$scope.VO.project_contact ==""){
                $scope.VO.person.personName=$scope.VO.project_contact;
            }else {
                if($scope.form = ture){
                    return layer.alert("请添写项目联系人", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });}

            }
        }, true);
        $scope.$watch('VO.ProPerson', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
                $scope.VO.project_contact= $scope.VO.ProPerson.personName;
                $scope.VO.project_contactway=$scope.VO.ProPerson.personTel;
        }, true);
        $scope.$watch('VO.CusPerson', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
                $scope.VO.contact=$scope.VO.CusPerson.personName
                $scope.VO.contactway=$scope.VO.CusPerson.personTel;
        }, true);
        $scope.$watch('VO.InsPerson', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            $scope.VO.insurance_contact=$scope.VO.InsPerson.personName
            $scope.VO.insurance_contactway=$scope.VO.InsPerson.personTel;
        }, true);



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

        $scope.ExportExcel = function (){
            var exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            exportEx.attr('action', $scope.localizedPath + 'projectInformation/execleTemplate');
            exportEx.submit();
        }
    }




    $scope.initFunction();
    $scope.initData();
    $scope.initHttp();
    $scope.initButton();
    $scope.initPage();
    $scope.initWatch();

});