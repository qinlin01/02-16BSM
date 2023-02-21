app.controller('fileAdministrationCtrl', function ($rootScope, $scope,$sce, $http, $stateParams,$state, uiGridConstants, ngDialog, ngVerify,$window) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                fbillstatus: 0,
                dr: 0,
                isContinue: 0,
                baseFiles: [],
                junctionFiles: [],
                appendices:[],
                uploadContractFile:[],
                mainContract:[],
                insuranceScheme:[],
                issueNotice:[],
                projectInsurance: [],
                changeBillCheck:[],
                provisionalPolicy:[],
                dealAttachmentB:[],
                customerService:[],
                billApply:[],
            };
        };
        $scope.entityVO = 'nc.vo.busi.fileAdministrationVO';
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "id": $stateParams.id,
                "wideArea": "",
                "tradetype": "",
                "c_2_type": null,
                // "period":parseInt(new Date().format("yyyy")),
                "pk_project_code": "",
                "pk_project_name": "",
                "fbillno": "",
                "fbillstatus": null,
                "audit_date": "",
                "pkOrg_name": "",
            }
        };
        $scope.funCode = '20801';
        $scope.QUERY = $scope.initQUERY();
        $scope.QUERYtrainingMaterials = {};
    };
    $scope.projectRef =
        {
            id: $scope.$id,
            columnDefs: [
                {
                    field: 'code',
                    displayName: '项目编号'
                },
                {
                    field: 'name',
                    displayName: '项目名称'
                },
            ],
            data: ""
        };

    $scope.initHttp = function () {

        $scope.queryTradetype = function (data) {
            $http.post($rootScope.basePath + "projectKindTreeRef/queryForGrid",{
                page: 1,
                pageSize: 999
            }).success(function (response) {
                if (response.code == 200) {
                    $scope.tradetypeList=response.result.Rows;
                }
            })
        };

        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data, fun, isPrint, etype) {
            data.nodeType="601";
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.basePath + "common/queryAllForGrid", {
                params: angular.toJson(data),
                fileName: '经纪业务档案管理信息.xls',
                tableName: angular.toJson($scope.table_name),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData),
                isPrint: isPrint,
                etype: 0,//0：excel 1：pdf
            }).success(function (response) {
                let data = angular.fromJson(SM2Decrypt(response));
                if (fun) fun(data);
                if (isPrint) {
                    window.open(getURL(data.queryPath));
                } else {
                    window.open($rootScope.basePath + "uploadFile/downLoadByUrl?url=" + encodeURI(encodeURI(data.downPath)));
                }
                layer.closeAll('loading');
            }).error(function () {
                layer.closeAll('loading');
            });
        };
        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.archivesPath + "fileAdministration/queryForGrid",{
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
        $scope.queryForGridChildren = function (data, path) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.appendicesPagesGridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "economicContract/queryForGrid",{
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.appendicesPagesGridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.appendicesPagesGridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response.code == 200) {
                    if (!$scope.query) {
                        $scope.query = $scope.appendicesPagesGridOptions.columnDefs;
                    }
                    $scope.appendicesPagesGridOptions.data = response.result.Rows;
                    $scope.appendicesPagesGridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            });
        };

        $scope.onQueryChildren = function () {
            $scope.queryForGridChildren($scope.QUERYCHILDREN, $scope.queryPath);
        };
        $scope.onResetChildren = function () {
            $scope.QUERYCHILDREN = $scope.initQUERYChildren();
        };

        $scope.onUploadsChildren = function () {
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
                    if ($scope.uploadContractFileGridOptions.data) {
                        angular.forEach(value, function (item) {
                            let appendices = {};
                            appendices.source = "上传";
                            appendices.TEXT_NAME = item.attachment_name;
                            appendices.pk_project_id = item.pk_project_id;
                            $scope.uploadContractFileGridOptions.data.push(appendices);
                        });
                        $scope.VO.uploadContractFile = $scope.uploadContractFileGridOptions.data;
                    } else {
                        angular.forEach(value, function (item) {
                            $scope.uploadContractFileGridOptions.data.push(item);
                        });
                        $scope.VO.uploadContractFile = $scope.uploadContractFileGridOptions.data;
                    }
                }
            }, function (reason) {

            });
        };

        $scope.findOne = function (id,callback) {
            $scope.id = id;
            $http.post($scope.archivesPath + "fileAdministration/findOne",{pk: id}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200"){
                    angular.assignData($scope.VO,response.result);
                    if ($scope.VO.fbillstatus!=null && $scope.VO.fbillstatus==0){
                        $scope.VO.fbillstatus=1;
                    }
                    if ($scope.isEdit == true && ($scope.VO.bussinessStatus == 1 || $scope.VO.bussinessStatus == null)) {
                        if (response.result.insuranceScheme != null) {
                            response.result.fileStatusList.insuranceSchemes = response.result.insuranceScheme.length;
                        }
                        if (response.result.projectInsurance != null) {
                            response.result.fileStatusList.insurancePolicy = response.result.projectInsurance.length;
                        }
                        if (response.result.issueNotice != null) {
                            response.result.fileStatusList.issueNotices = response.result.issueNotice.length;
                        }
                        if (response.result.changeBillCheck != null) {
                            response.result.fileStatusList.endorsement = response.result.changeBillCheck.length;

                        }
                        if (response.result.provisionalPolicy != null) {
                            response.result.fileStatusList.coverNote = response.result.provisionalPolicy.length;
                        }
                    }
                    $scope.initField();
                    if (callback) {
                        callback;
                    }
                    ;

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

        /**
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO.pkOperator=$rootScope.userVO;
            $scope.VO.baseFiles = $scope.baseFilesGridOptions.data;
            $scope.VO.junctionFiles = $scope.junctionFilesGridOptions.data;
            // $scope.VO.appendices = $scope.appendicesGridOptions.data;
            $scope.VO.issueNotice = $scope.issueNoticeGridOptions.data;
            $scope.VO.projectInsurance = $scope.projectInsuranceGridOptions.data;
            $scope.VO.changeBillCheck = $scope.changeBillCheckGridOptions.data;
            $scope.VO.provisionalPolicy = $scope.provisionalPolicyGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $http.post($scope.archivesPath + "fileAdministration/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        $scope.isDisableds = true;
                        $scope.isUpdate = false;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                    }
                    if (response) {
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }});
        };
        /**
         * 刷新数据
         * */
        $scope.onRefresh = function () {
            let rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert("请选择数据进行刷新!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.confirm('是否刷新选中数据？', {
                    btn: ['确定', '返回'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消刷新!', {
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
                    $http.post($scope.archivesPath + "fileAdministration/refresh", {ids: angular.toJson(ids)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg('刷新成功!', {
                                icon: 1
                            });
                        }

                    });
                }
            );
        };
        /**
         * 刷新全量数据
         * */
        $scope.onRefreshAll = function () {
            layer.confirm('刷新全量数据有风险，建议做好数据备份。是否进行全量刷新？', {
                    btn: ['确定', '返回'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消刷新!', {
                            shift: 6,
                            icon: 11
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    layer.load(2);
                    $http.post($scope.archivesPath + "fileAdministration/refreshAll").success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg('刷新成功!', {
                                icon: 1
                            });
                        }
                    });
                }
            );
        };
    };
    $scope.initFunction = function () {

        //@zhangwj 新增字段不在后台配置了
        $scope.initField = function (){
            //保费缴纳通知书
            if(!$scope.VO.fileStatusList.premiumNotice){
                $scope.VO.fileStatusList.premiumNotice = 0;
            }
            //资金到账通知书
            if(!$scope.VO.fileStatusList.receiptNoitce){
                $scope.VO.fileStatusList.receiptNoitce = 0;
            }
            //客户服务相关字段
            if(!$scope.VO.customerServiceList){
                $scope.VO.customerServiceList = {};
                $scope.VO.customerServiceList.schedule = 0;
                $scope.VO.customerServiceList.workReport = 0;
                $scope.VO.customerServiceList.trainingMaterials = 0;
            }else{
                if(!$scope.VO.customerServiceList.schedule){
                    $scope.VO.customerServiceList.schedule = 0;
                }
                if(!$scope.VO.customerServiceList.workReport){
                    $scope.VO.customerServiceList.workReport = 0;
                }
                if(!$scope.VO.customerServiceList.trainingMaterials){
                    $scope.VO.customerServiceList.trainingMaterials = 0;
                }
            }
            //暂保申请
            if(!$scope.VO.fileStatusList.coverNoteApply){
                $scope.VO.fileStatusList.coverNoteApply = 0;
            }
            //保单批改申请书
            if(!$scope.VO.fileStatusList.insuranceChangeApply){
                $scope.VO.fileStatusList.insuranceChangeApply = 0;
            }
            //保险单
            if(!$scope.VO.fileStatusList.insuranceBill){
                $scope.VO.fileStatusList.insuranceBill = 0;
            }
        }

        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function(item){
            if(item && item.id){
                $scope.onCard(item.id);
            }
        };

        $scope.countFileStatusList = function () {
            //基础档案
            var baseFilesGridOptionsArray = $scope.baseFilesGridOptions.data;
            $scope.baseFiles = $scope.baseFilesGridOptions.data;
            $scope.VO.fileStatusList.customerNotification = 0;
            $scope.VO.fileStatusList.insuranceExpire = 0;
            $scope.VO.fileStatusList.markNotice = 0;
            $scope.VO.fileStatusList.insurScheme = 0;
            for (var i = 0; i < baseFilesGridOptionsArray.length; i++) {
                if (baseFilesGridOptionsArray[i].file_type == 1) {
                    $scope.VO.fileStatusList.customerNotification = $scope.VO.fileStatusList.customerNotification + 1;
                }
                if (baseFilesGridOptionsArray[i].file_type == 2) {
                    $scope.VO.fileStatusList.insurScheme = $scope.VO.fileStatusList.insurScheme + 1;
                }
                if (baseFilesGridOptionsArray[i].file_type == 3) {
                    $scope.VO.fileStatusList.insuranceExpire = $scope.VO.fileStatusList.insuranceExpire + 1;
                }
                if (baseFilesGridOptionsArray[i].file_type == 4) {
                    $scope.VO.fileStatusList.markNotice = $scope.VO.fileStatusList.markNotice + 1;
                }

                $scope.VO.fileStatusList.customerNotification = $scope.VO.fileStatusList.customerNotification;
            }

            //结算档案
            var junctionFilesGridOptionsArray = $scope.junctionFilesGridOptions.data;
            $scope.junctionFiles = $scope.junctionFilesGridOptions.data;
            $scope.VO.fileStatusList.companyStatement = 0;
            $scope.VO.fileStatusList.businessIncome = 0;
            $scope.VO.fileStatusList.billApplication = 0;
            $scope.VO.fileStatusList.packingList = 0;
            $scope.VO.fileStatusList.premiumNotice = 0;
            $scope.VO.fileStatusList.receiptNoitce = 0;
            for (var i = 0; i < junctionFilesGridOptionsArray.length; i++) {
                if (junctionFilesGridOptionsArray[i].file_type == 1) {
                    $scope.VO.fileStatusList.companyStatement = $scope.VO.fileStatusList.companyStatement + 1;
                }
                if (junctionFilesGridOptionsArray[i].file_type == 2) {
                    $scope.VO.fileStatusList.businessIncome = $scope.VO.fileStatusList.businessIncome + 1;
                }
                if (junctionFilesGridOptionsArray[i].file_type == 3) {
                    $scope.VO.fileStatusList.billApplication = $scope.VO.fileStatusList.billApplication + 1;
                }
                if (junctionFilesGridOptionsArray[i].file_type == 4) {
                    $scope.VO.fileStatusList.packingList = $scope.VO.fileStatusList.packingList + 1;
                }
                if (junctionFilesGridOptionsArray[i].file_type == 5) {
                    $scope.VO.fileStatusList.premiumNotice = $scope.VO.fileStatusList.premiumNotice + 1;
                }
                if (junctionFilesGridOptionsArray[i].file_type == 6) {
                    $scope.VO.fileStatusList.receiptNoitce = $scope.VO.fileStatusList.receiptNoitce + 1;
                }
            }

            //合同附件
            var mainContractGridOptionsArray = $scope.mainContractGridOptions.data;
            $scope.mainContract = $scope.mainContractGridOptions.data;
            $scope.VO.fileStatusList.mandate = 0;
            $scope.VO.fileStatusList.economicCooperation = 0;
            $scope.VO.fileStatusList.economicTripartite = 0;

            for (var i = 0; i < mainContractGridOptionsArray.length; i++) {
                if (mainContractGridOptionsArray[i].file_type == 1) {
                    $scope.VO.fileStatusList.mandate = $scope.VO.fileStatusList.mandate + 1;
                }
                if (mainContractGridOptionsArray[i].file_type == 2) {
                    $scope.VO.fileStatusList.economicCooperation = $scope.VO.fileStatusList.economicCooperation + 1;
                }
                if (mainContractGridOptionsArray[i].file_type == 3) {
                    $scope.VO.fileStatusList.economicTripartite = $scope.VO.fileStatusList.economicTripartite + 1;
                }
            }

            var uploadContractFileGridOptionsArray = $scope.uploadContractFileGridOptions.data;
            $scope.uploadContractFile = $scope.uploadContractFileGridOptions.data;
            for (var i = 0; i < uploadContractFileGridOptionsArray.length; i++) {
                if (uploadContractFileGridOptionsArray[i].file_type == 1) {
                    $scope.VO.fileStatusList.mandate = $scope.VO.fileStatusList.mandate + 1;
                }
                if (uploadContractFileGridOptionsArray[i].file_type == 2) {
                    $scope.VO.fileStatusList.economicCooperation = $scope.VO.fileStatusList.economicCooperation + 1;
                }
                if (uploadContractFileGridOptionsArray[i].file_type == 3) {
                    $scope.VO.fileStatusList.economicTripartite = $scope.VO.fileStatusList.economicTripartite + 1;
                }
            }

            //保险方案
            $scope.insuranceScheme = $scope.insuranceSchemeGridOptions.data;
            $scope.VO.fileStatusList.insuranceSchemes = $scope.insuranceSchemeGridOptions.data.length;

            //出单通知书
            $scope.projectInsurance = $scope.projectInsuranceGridOptions.data;
            $scope.VO.fileStatusList.insurancePolicy = $scope.projectInsuranceGridOptions.data.length;

            //保单附件
            $scope.projectInsurance = $scope.projectInsuranceGridOptions.data;
            $scope.VO.fileStatusList.insurancePolicy = $scope.projectInsuranceGridOptions.data.length;

            //批单附件
            $scope.changeBillCheck = $scope.changeBillCheckGridOptions.data;
            $scope.VO.fileStatusList.endorsement = $scope.changeBillCheckGridOptions.data.length;

            //暂保单附件
            $scope.provisionalPolicy = $scope.provisionalPolicyGridOptions.data;
            $scope.VO.fileStatusList.coverNote = $scope.provisionalPolicyGridOptions.data.length;

            //其他附件
            var dealAttachmentBGridOptionsArray = $scope.dealAttachmentBGridOptions.data;
            $scope.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $scope.VO.fileStatusList.drawReward = 0;
            $scope.VO.fileStatusList.otherAttachments = 0;
            $scope.VO.fileStatusList.boxPictures = 0;
            for (var i = 0; i < dealAttachmentBGridOptionsArray.length; i++) {
                if (dealAttachmentBGridOptionsArray[i].file_type == 1) {
                    $scope.VO.fileStatusList.drawReward = $scope.VO.fileStatusList.drawReward + 1;
                }
                if (dealAttachmentBGridOptionsArray[i].file_type == 2) {
                    $scope.VO.fileStatusList.otherAttachments = $scope.VO.fileStatusList.otherAttachments + 1;
                }
                if (dealAttachmentBGridOptionsArray[i].file_type == 3) {
                    $scope.VO.fileStatusList.boxPictures = $scope.VO.fileStatusList.boxPictures + 1;
                }
            }

            //客户服务档案附件
            var customerServiceGridOptionsArray = $scope.customerServiceGridOptions.data;
            $scope.VO.customerServiceList.schedule = 0;
            $scope.VO.customerServiceList.workReport = 0;
            $scope.VO.customerServiceList.trainingMaterials = 0;
            for (var i = 0; i < customerServiceGridOptionsArray.length; i++) {
                if (customerServiceGridOptionsArray[i].file_type == 1) {
                    $scope.VO.customerServiceList.schedule = $scope.VO.customerServiceList.schedule + 1;
                }
                if (customerServiceGridOptionsArray[i].file_type == 2) {
                    $scope.VO.customerServiceList.workReport = $scope.VO.customerServiceList.workReport + 1;
                }
                if (customerServiceGridOptionsArray[i].file_type == 3) {
                    $scope.VO.customerServiceList.trainingMaterials = $scope.VO.customerServiceList.trainingMaterials + 1;
                }
            }

            //单据档案
            var billApplyGridOptionsArray = $scope.billApplyGridOptions.data;
            $scope.VO.fileStatusList.coverNoteApply = 0;
            $scope.VO.fileStatusList.insuranceChangeApply = 0;
            $scope.VO.fileStatusList.insuranceBill = 0;
            for (var i = 0; i < billApplyGridOptionsArray.length; i++) {
                if (billApplyGridOptionsArray[i].file_type == 5) {
                    $scope.VO.fileStatusList.coverNoteApply = $scope.VO.fileStatusList.coverNoteApply + 1;
                }
                if (billApplyGridOptionsArray[i].file_type == 6) {
                    $scope.VO.fileStatusList.insuranceChangeApply = $scope.VO.fileStatusList.insuranceChangeApply + 1;
                }
                if (billApplyGridOptionsArray[i].file_type == 7) {
                    $scope.VO.fileStatusList.insuranceBill = $scope.VO.fileStatusList.insuranceBill + 1;
                }
            }

        };
    };

    $scope.initWatch = function () {

        $scope.$watch('VO.c2Type', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['c2TypeName'] = $rootScope.SELECT.MARKETTYPE[newVal].name;
            }
        }, true);

        $scope.$watch('VO.pkProject.name', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null||oldVal==undefined) return;
            $scope.findOne($scope.VO.pkProject.id);
        }, true);

        $scope.$watch('VO.busi_type', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.busi_type.code) {
                    if($scope.VO.busi_type.code.substr(0,1)=="1"){
                        $scope.VO.pkC0Tradetype=$scope.busi_type_gudong;
                    }else{
                        $scope.VO.pkC0Tradetype=$scope.busi_type_shichang;
                    }
                    var ltype = $scope.VO.busi_type.parentName.split(",");
                    $scope.VO.busiTypeDetailed = "";
                    var len = ltype.length > 3 ? 3 : ltype.length;
                    for (var i = 0; i < len; i++) {
                        if (i == len - 1) {
                            $scope.VO.busiTypeDetailed += ltype[i];
                        } else {
                            $scope.VO.busiTypeDetailed += ltype[i] + "/";
                        }
                    }
                }
            }
        }, true);

        $scope.$watch('VO.bussinessStatus', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['bussinessStatusName'] = $rootScope.SELECT.BUSSINESSSTATUS[newVal].name;
            }
        }, true);

    };

    $scope.initButton = function () {

        $scope.onConfirmTrainingMaterials = function () {
            let rows = $scope.trainingMaterialsGridOptions.gridApi.selection.getSelectedRows();
            if(!rows || rows.length <= 0){
                layer.msg("请选择至少一条数据！")
                return
            }
            for (let i = 0; i < rows.length; i++) {
                if(rows[i].allFile || rows[i].allFile.length > 0){
                    for (let j = 0; j < rows[i].allFile.length; j++) {
                        let item = rows[i].allFile[j];
                        item.cUpdate = rows[i].allFile[j].upload_date;
                        item.file_type = 3;
                        $scope.customerServiceGridOptions.data.push(item);
                    }
                }
            }
            $scope.countFileStatusList();
            ngDialog.close();
        }

        $scope.onCancelTrainingMaterials = function () {
            ngDialog.close();
        }

        $scope.onQueryTrainingMaterials = function () {
            if(!$scope.QUERYtrainingMaterials.operateYear || $scope.QUERYtrainingMaterials.operateYear == ''){
                return layer.alert("请选择年度后再进行查询！");
            }
            layer.load(2);
            $http.post($scope.basePath + "trainPlanSummarize/queryForGridToFileAdministration",{
                params: angular.toJson($scope.QUERYtrainingMaterials),
                page: $scope.trainingMaterialsGridOptions.gridApi ? $scope.trainingMaterialsGridOptions.gridApi.page : $scope.trainingMaterialsGridOptions.page,
                pageSize: $scope.trainingMaterialsGridOptions.gridApi ? $scope.trainingMaterialsGridOptions.gridApi.pageSize : $scope.trainingMaterialsGridOptions.pageSize,
            }).success(function (response) {
                if (response.code == 200) {
                    $scope.trainingMaterialsGridOptions.data = response.result.Rows;
                    $scope.trainingMaterialsGridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            });
        }
        
        $scope.onGetTrainingMaterials = function (){

            //初始化客户培训总结查询条件以及对象
            $scope.QUERYtrainingMaterials = {
                customerName: $scope.VO.pkProject.cinsureman_name,
                serialNo: null,
                trainName: null,
                operateYear: $scope.VO.period,
            };

            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: getURL('insurance/view/fileAdministration/trainingMaterials.html'),
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                rootScope: $rootScope,
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
                    for (var i = 0; i < value.length; i++) {
                    }
                }

            }, function (reason) {

            });
        }

        /**
         * 确定
         * */
        $scope.onConfirms = function () {
            if($("appendicesIdGrid").selected=true){
                var rows = $scope.gridApiChilder.selection.getSelectedRows();
                if (!rows) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});
                // 新的合同子表
                for (let i = 0; i < rows.length; i++) {
                    $scope.mainContractGridOptions.data.push(rows[i]);
                }

                ngDialog.close();
            }

        };
        $scope.onCancels = function () {
            ngDialog.close($scope.ngDialogId);
        };

        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isBack = false;
            $scope.isClear = false;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form = true;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行整理!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id, function () {
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.isContinue = false;
                });

            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
                $scope.isContinue = false;
            }
        };

        $scope.relationPage = function (name) {
            $scope.selectTabName = name;
            if(name == "mainContractGridOptions") {
                $scope.isSubDisabled = false;
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: false,
                    template: 'view/fileAdministration/associatedPage.html',
                    className: 'ngdialog-theme-formInfo',
                    scope: $scope,
                    rootScope: $rootScope,
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
                        for (var i = 0; i < value.length; i++) {
                            // $scope.appendicesGridOptions.data.push(value[i]);
                        }
                    }

                }, function (reason) {

                });
            }
            if(name == "uploadContractFileGridOptions") {
                $scope.onUploadsChildren();
            }
        };

        $scope.showContract = function (number) {
            //@zhangwj 2022-02-10 BUG【YDBXJJ-2471】
            var url = $state.href("app.comInfo.economicContract", {'id': number}, {});
            $window.open(url + "?id=" + number);
            // $state.go("app.comInfo.economicContract",{'id':number},{
            //     reload:true
            // });
        }

        $scope.onUploads = function (name) {
            $scope.selectTabName = name;
            if ($scope.selectTabName == "baseFilesGridOptions"){
                $scope.aVO = {"nameArray":[{id:1,name:"客户告知书",title:"（新增客户必须上传）"},{id:2,name:"保险方案确认函",title:"（股东业务必留存）"},{id:3,name:"保险到期提示函",title:"（续保业务必须上传）"},{id:4,name:"中标通知书"}] };
            }else if ($scope.selectTabName == "junctionFilesGridOptions"){
                $scope.aVO = {"nameArray":[{id:1,name:"保险公司结算单"},{id:2,name:"业务收入确认书"},{id:3,name:"发票开具申请单"},{id:4,name:"发票扫描件"},{id: 5,name: "保费缴纳通知书"},{id: 6,name: "资金到账通知书"}] };
            }else if ($scope.selectTabName == "dealAttachmentBGridOptions"){
                $scope.aVO = {"nameArray": [{id: 1, name: "领取报酬情况表"}, {id: 2, name: "其他附件"}, {id: 3, name: "装盒照片"}]};
            }else if ($scope.selectTabName == "customerServiceGridOptions"){
                $scope.aVO = {"nameArray": [{id: 1, name: "客户服务计划表"}, {id: 2, name: "客户服务工作报告"}]};
            }else if ($scope.selectTabName == "billApplyGridOptions"){
                $scope.aVO = {"nameArray": [{id: 5, name: "暂保申请"}, {id: 6, name: "保单批改申请书"},{id: 7, name: "保险单"}]};
            }

            $scope.isSubDisabled = false;
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: getURL('insurance/view/fileAdministration/attachment.html'),
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
                if ($scope.selectTabName == "baseFilesGridOptions") {
                    if (value != null) {
                        //  第一次初始化成null，后台没值，应该【】
                        if ($scope.baseFilesGridOptions.data) {
                            angular.forEach(value, function (item) {
                                item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                                $scope.baseFilesGridOptions.data.push(item);
                            });
                        } else {
                            angular.forEach(value, function (item) {
                                $scope.baseFilesGridOptions.data.push(item);
                            });
                        }
                        for (var i = 0; i < value.length; i++) {
                            if(value[i].file_type==1){
                                $scope.VO.fileStatusList.customerNotification  = $scope.VO.fileStatusList.customerNotification + 1;
                            }
                            if (value[i].file_type == 2){
                                $scope.VO.fileStatusList.insurScheme  = $scope.VO.fileStatusList.insurScheme + 1;
                            }
                            if (value[i].file_type == 3){
                                $scope.VO.fileStatusList.insuranceExpire  = $scope.VO.fileStatusList.insuranceExpire + 1;
                            }
                            if (value[i].file_type == 4){
                                $scope.VO.fileStatusList.markNotice  = $scope.VO.fileStatusList.markNotice + 1;
                            }

                        }
                    }
                } else if ($scope.selectTabName == "junctionFilesGridOptions") {
                    if (value !=null){
                        //  第一次初始化成null，后台没值，应该【】
                        if ($scope.junctionFilesGridOptions.data) {
                            angular.forEach(value, function (item) {
                                item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                                $scope.junctionFilesGridOptions.data.push(item);
                            });
                        } else {
                            angular.forEach(value, function (item) {
                                $scope.junctionFilesGridOptions.data.push(item);
                            });
                        }
                        for (var i = 0; i < value.length; i++) {
                            if(value[i].file_type==1){
                                $scope.VO.fileStatusList.companyStatement  = $scope.VO.fileStatusList.companyStatement + 1;
                            }
                            if (value[i].file_type == 2){
                                $scope.VO.fileStatusList.businessIncome  = $scope.VO.fileStatusList.businessIncome + 1;
                            }
                            if (value[i].file_type == 3){
                                $scope.VO.fileStatusList.billApplication  = $scope.VO.fileStatusList.billApplication + 1;
                            }
                            if (value[i].file_type == 4){
                                $scope.VO.fileStatusList.packingList  = $scope.VO.fileStatusList.packingList + 1;
                            }
                            if (value[i].file_type == 5) {
                                $scope.VO.fileStatusList.premiumNotice = $scope.VO.fileStatusList.premiumNotice + 1;
                            }
                            if (value[i].file_type == 6) {
                                $scope.VO.fileStatusList.receiptNoitce = $scope.VO.fileStatusList.receiptNoitce + 1;
                            }
                        }
                    }

                }else if ($scope.selectTabName == "projectInsuranceGridOptions") {
                    if ($scope.projectInsuranceGridOptions.data) {
                        angular.forEach(value, function (item) {
                            item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                            $scope.projectInsuranceGridOptions.data.push(item);
                        });
                    } else {
                        angular.forEach(value, function (item) {
                            $scope.projectInsuranceGridOptions.data.push(item);
                        });
                    }
                }else if ($scope.selectTabName == "changeBillCheckGridOptions") {
                    if ($scope.changeBillCheckGridOptions.data) {
                        angular.forEach(value, function (item) {
                            item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                            $scope.changeBillCheckGridOptions.data.push(item);
                        });
                    } else {
                        angular.forEach(value, function (item) {
                            $scope.changeBillCheckGridOptions.data.push(item);
                        });
                    }
                }else if ($scope.selectTabName == "provisionalPolicyGridOptions") {
                    if ($scope.provisionalPolicyGridOptions.data) {
                        angular.forEach(value, function (item) {
                            item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                            $scope.provisionalPolicyGridOptions.data.push(item);
                        });
                    } else {
                        angular.forEach(value, function (item) {
                            $scope.provisionalPolicyGridOptions.data.push(item);
                        });
                    }
                }else if ($scope.selectTabName == "dealAttachmentBGridOptions") {
                    if (value != null) {
                        if ($scope.dealAttachmentBGridOptions.data) {
                            angular.forEach(value, function (item) {
                                item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                                $scope.dealAttachmentBGridOptions.data.push(item);
                            });
                        } else {
                            angular.forEach(value, function (item) {
                                $scope.dealAttachmentBGridOptions.data.push(item);
                            });
                        }
                        for (var i = 0; i < value.length; i++) {
                            if (value[i].file_type == 1) {
                                $scope.VO.fileStatusList.drawReward = $scope.VO.fileStatusList.drawReward + 1;
                            }
                            if (value[i].file_type == 2) {
                                $scope.VO.fileStatusList.otherAttachments = $scope.VO.fileStatusList.otherAttachments + 1;
                            }
                            if (value[i].file_type == 3) {
                                $scope.VO.fileStatusList.boxPictures = $scope.VO.fileStatusList.boxPictures + 1;
                            }
                        }
                    }
                }else if($scope.selectTabName == "customerServiceGridOptions"){
                    if (value != null) {
                        if ($scope.customerServiceGridOptions.data) {
                            angular.forEach(value, function (item) {
                                item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                                $scope.customerServiceGridOptions.data.push(item);
                            });
                        } else {
                            angular.forEach(value, function (item) {
                                $scope.customerServiceGridOptions.data.push(item);
                            });
                        }
                        for (var i = 0; i < value.length; i++) {
                            if (value[i].file_type == 1) {
                                $scope.VO.customerServiceList.schedule = $scope.VO.customerServiceList.schedule + 1;
                            }
                            if (value[i].file_type == 2) {
                                $scope.VO.customerServiceList.workReport = $scope.VO.customerServiceList.workReport + 1;
                            }
                            if (value[i].file_type == 3) {
                                $scope.VO.customerServiceList.trainingMaterials = $scope.VO.customerServiceList.trainingMaterials + 1;
                            }
                        }
                    }
                }else if($scope.selectTabName == "billApplyGridOptions"){
                    if (value != null) {
                        if ($scope.billApplyGridOptions.data) {
                            angular.forEach(value, function (item) {
                                item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                                $scope.billApplyGridOptions.data.push(item);
                            });
                        } else {
                            angular.forEach(value, function (item) {
                                $scope.billApplyGridOptions.data.push(item);
                            });
                        }
                        for (var i = 0; i < value.length; i++) {
                            if (value[i].file_type == 5) {
                                $scope.VO.fileStatusList.coverNoteApply = $scope.VO.fileStatusList.coverNoteApply + 1;
                            }
                            if (value[i].file_type == 6) {
                                $scope.VO.fileStatusList.insuranceChangeApply = $scope.VO.fileStatusList.insuranceChangeApply + 1;
                            }
                            if (value[i].file_type == 7) {
                                $scope.VO.fileStatusList.insuranceBill = $scope.VO.fileStatusList.insuranceBill + 1;
                            }
                        }
                    }
                }
            }, function (reason) {

            });

        };


        $scope.onUploads1 = function (name) {
            $scope.selectTabName = name;
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
                if ($scope.selectTabName == "insuranceSchemeGridOptions") {
                    angular.forEach(value, function (item) {
                    let insuranceScheme = {};
                    insuranceScheme.source="上传";
                    insuranceScheme.insuranceSchemeName="保险方案";
                    insuranceScheme.cUpdate=new Date().format("yyyy-MM-dd HH:mm:ss");
                    insuranceScheme.pk_project_id=item.pk_project_id;
                    insuranceScheme.attachment_name=item.attachment_name;
                    $scope.insuranceSchemeGridOptions.data.push(insuranceScheme);
                    });
                    $scope.VO.fileStatusList.insuranceSchemes = $scope.insuranceSchemeGridOptions.data.length;
                }else if ($scope.selectTabName == "issueNoticeGridOptions") {
                    angular.forEach(value, function (item) {
                        let issueNotice = {};
                        issueNotice.source = "上传";
                        issueNotice.name = "出单通知书";
                        issueNotice.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                        issueNotice.pk_project_id = item.pk_project_id;
                        issueNotice.attachment_name = item.attachment_name;
                        $scope.issueNoticeGridOptions.data.push(issueNotice);
                    });
                    $scope.VO.fileStatusList.issueNotices = $scope.issueNoticeGridOptions.data.length;
                }
                }, function (reason) {

                });
        };

        $scope.onDownLoads = function(id){
            var data =[];
            if ($scope.downCommon($scope.VO.baseFiles,0)||$scope.downCommon($scope.VO.junctionFiles,1)||$scope.downCommon($scope.VO.appendices,2)||$scope.downCommon($scope.VO.dealAttachmentB,3)||$scope.downCommon($scope.VO.insuranceScheme,4)||$scope.downCommon($scope.VO.issueNotice,5)||$scope.downCommon($scope.VO.projectInsurance,6)||$scope.downCommon($scope.VO.changeBillCheck,7)||$scope.downCommon($scope.VO.provisionalPolicy,8)){

                data.push($scope.downCommon($scope.VO.baseFiles,0),$scope.downCommon($scope.VO.junctionFiles,1),$scope.downCommon($scope.VO.appendices,2),$scope.downCommon($scope.VO.dealAttachmentB,3),$scope.downCommon($scope.VO.insuranceScheme,4),$scope.downCommon($scope.VO.issueNotice,5),$scope.downCommon($scope.VO.projectInsurance,6),$scope.downCommon($scope.VO.changeBillCheck,7),$scope.downCommon($scope.VO.provisionalPolicy,8));
            }
            test = JSON.stringify(data);

            var fileNames = $scope.VO.pkProject.name;
            var exportEx = $('#exproE');
            $('#exproE #fileId').val(test);
            $('#exproE #fileName').val(fileNames);
            exportEx.attr("action",$rootScope.basePath + 'uploadFile/batchDownloadFiles');
            //提交表单，实现下载
            exportEx.submit();
        };
        $scope.downCommon = function(row,type){
            var tableName=["基础档案","结算档案","合同附件","其他附件","保险方案附件","出单通知书附件","保单附件","批单附件","暂保单附件"];
            var fileName=[[{id:1,name:"客户告知书"},{id:2,name:"保险方案确认函"},{id:3,name:"保险到期提示函"},{id:4,name:"中标通知书"}],[{id:1,name:"保险公司结算单"},{id:2,name:"业务收入确认书"},{id:3,name:"发票开具申请单"},{id:4,name:"发票扫描件"}],[{id:1,name:"经纪业务委托合同"},{id:2,name:"经纪业务合作协议"},{id:3,name:"经纪业务三方协议"}],[{id:1,name:"领取报酬情况表"},{id:2,name:"其他附件"},{id:3,name:"装盒照片"}]];
            var returnData={};
            returnData.name=tableName[type];
            returnData.value=[];
            var fileList = fileName[type];
            for (var i = 0; i < row.length; i++) {
                if (type==0||type==1||type==2||type==3){
                    for (var j = 0; j <fileList.length; j++) {
                        if (fileList[j].id==row[i].file_type){
                            var jsonData ={};
                            jsonData.name=fileList[j].name;
                            var ids={};
                            ids.pk_project_id = row[i].pk_project_id;
                            ids.attachment_name = row[i].attachment_name;
                            ids.file_type = row[i].file_type;
                            jsonData.value=[];
                            jsonData.value.push(ids);
                            var ifAdd=true;
                            for (var k = 0; k < returnData.value.length; k++){
                                if (returnData.value[k].name==fileList[j].name){
                                    returnData.value[k].value.push(ids);
                                    ifAdd=false;
                                }
                            }
                            if (ifAdd){
                                returnData.value.push(jsonData);
                            }
                        }
                    }
                }
                if (type==4||type==5||type==6||type==7||type==8){
                    var ids={};
                    ids.pk_project_id = row[i].pk_project_id;
                    ids.attachment_name = row[i].attachment_name;
                    ids.file_type = row[i].file_type;
                    returnData.value.push(ids);
                }
            }
            return returnData;
        };


        $scope.onDownLoadsCard = function (id) {
            var ids = [];
            ids.push(id);
            var exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };

        //合同拉取附件下载
        $scope.onDownLoadsByAppendice = function (TEXT_URL) {
            var exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(TEXT_URL);
            exportEx.attr('action', $rootScope.basePath + 'economicContract/downloadFileMethod?filePath='+TEXT_URL);
            exportEx.submit();
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
                id = rows[0].id;
            }
            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {
                pk: id,
                tableName: $scope.table_name,
                billdef: $scope.billdef
            }).success(function (response) {
                if (response && response.code == "200") {
                    $scope.card = true;
                    angular.assignData($scope.VO, response.result);
                    $scope.VO.appendices = $scope.VO.appendices.filter((item) => {
                        return item.source=='上传';
                    })
                    if (!response.result.taskHis)
                        $scope.mess = false;
                    else
                        $scope.mess = true;
                    $scope.isBack = true;
                    $scope.isGrid = false;
                    $scope.isCard = true;
                    if($scope.VO.billstatus==34&&$scope.VO.checkDate!=null&&$scope.VO.checkDate!=''&&$scope.VO.checkDate.format('yyyy-MM-dd')<'2022-09-13'){
                        $scope.isOld = true;
                    }else{
                        $scope.isOld = false;
                    }
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
         * 取消功能
         */
        $scope.onCancel = function () {
            if ($scope.isClear) {
                $scope.VO = $scope.initVO();
            }
            $scope.isDisabled = true;
            $scope.isDisableds = true;
            $scope.isEdit = false;
            $scope.isBack = false;
        };

        /**
         * 返回
         */
        $scope.onBack = function () {
            if($stateParams.id) {
                window.history.back(-2);
                return;
            }
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isDisabled = true;
            $scope.isDisableds = true;
            //阻止页面渲染
            $scope.form = false;
            $scope.card = false;
            //阻止页面渲染
            $scope.queryForGrid($scope.QUERY);
        };

        /**
         * 拉取
         * */
        $scope.onPullData = function () {
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/fileAdministration/pullDataPage.html',
                className: 'ngdialog-theme-formInfo',
                controller: 'pullDataPageCtrl',
                scope: $scope,
                rootScope: $rootScope,
                preCloseCallback: function (value) {
                    if (value && value == "clear") {
                        //重置
                        return false;
                    }
                    //取消
                    return true;
                }
            }).then(function (value) {

            }, function (reason) {

            });
            layer.load(2);
        };


        /**
         * 保存
         * */

        $scope.onSave = function (data) {
            $scope.VO.baseFiles = $scope.baseFilesGridOptions.data;
            $scope.VO.junctionFiles = $scope.junctionFilesGridOptions.data;
            $scope.VO.mainContract = $scope.mainContractGridOptions.data;
            $scope.VO.uploadContractFile = $scope.uploadContractFileGridOptions.data;
            $scope.VO.issueNotice = $scope.issueNoticeGridOptions.data;
            $scope.VO.projectInsurance = $scope.projectInsuranceGridOptions.data;
            $scope.VO.changeBillCheck = $scope.changeBillCheckGridOptions.data;
            $scope.VO.provisionalPolicy = $scope.provisionalPolicyGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;

            //保存生成档案编号时先判断档案编号是否为null，
            if($scope.VO.fbillno == null) {
                var tableName = $scope.table_name;
                $http.post($scope.basePath + "common/genBusiSerialNumByRule", {
                    tableName: tableName
                }).success(function (response) {
                    if (response.code == 200){
                        $scope.VO.fbillno = response.SerialNum;
                        $scope.onSaveVO();
                    }
                });
            }
            if (data) {
                data=$scope.VO;
                data.fbillstatus=1;
                var tablename = $scope.table_name;
                $http.post($scope.archivesPath  + "fileAdministration/save",{data:angular.toJson(data),tablename:tablename}).success(function(response) {
                    if(response.code == 200){
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = true;
                        $scope.isShow = true;
                        $scope.isDisabled = false;
                        // angular.assignData($scope.VO, response.result);
                        $scope.isSubEdit = false;
                        layer.confirm("保存成功，您可以继续编辑或者退出",{
                            btn: ['确定'],
                        }, function (btn) {
                            layer.close(btn);
                        });
                    }
                });

            }

        };

        $scope.fileSubmit = function () {
            var oneItem = $scope.isGrid ? ($scope.gridApi.selection.getSelectedRows())[0] : $scope.VO;
            var twoItem = {};
            twoItem.id= oneItem.id;
            twoItem.pkOrg= oneItem.pkOrg;
            twoItem.pkDept= oneItem.pkDept;
            $http.post($scope.basePath + "common/startWorkFlow", {item: angular.toJson(twoItem),billdef:$scope.billdef}).success(function (response) {
                if (response.code==200){
                    $scope.onSubmit()
                }
            });
        };

        $scope.genBusiSerialNumByRule =function(){
            if($scope.VO.fbillno==null||$scope.VO.fbillno=="") {
                var tableName = $scope.table_name;
                $http.post($scope.basePath + "common/genBusiSerialNumByRule", {
                    tableName: tableName
                }).success(function (response) {
                    if (response.code == 200){
                        $scope.VO.fbillno = response.SerialNum;
                        $scope.onSaveVO();
                        $scope.fileSubmit();
                    }
                });
            }else {
                $scope.onSaveVO();
                $scope.fileSubmit();
            }
        };

        /**
         * 保存 提交判断必输项
         * */
        $scope.onFileSubmit = function () {
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }else {
                    ifN = false;
                    if ($scope.VO.bussinessStatus == null || $scope.VO.bussinessStatus.length == 0) {
                        ifN =true;
                        return layer.alert("业务状态不可为空!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.VO.bussinessStatus == 2) {
                        if ($scope.VO.c1Execitem == undefined){
                            ifN =true;
                            return layer.alert("业务状态为终止时，请填写备注!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }

                    }
                    if ($scope.VO.bussinessStatus == 1){
                        if ($scope.VO.fileStatusList.customerNotification == 0 && $scope.VO.fileStatusList.insuranceExpire == 0) {
                            ifN =true;
                            return layer.alert("客户告知书、保险到期提示函，二者必有一才可以保存!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.fileStatusList.drawReward == 0) {
                            ifN =true;
                            return layer.alert("请上传领取报酬情况表!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.fileStatusList.boxPictures == 0) {
                            ifN = true;
                            return layer.alert("请上传装盒照片!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.fileStatusList.insurScheme == 0) {
                            ifN =true;
                            return layer.alert("请上传保险方案确认函!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        /*      if ($scope.VO.fileStatusList.companyStatement == 0) {
                                  ifN =true;
                                  return layer.alert("请上传保险公司结算单!",
                                      {skin: 'layui-layer-lan', closeBtn: 1});
                              }*/
                        if ($scope.VO.fileStatusList.businessIncome == 0) {
                            ifN =true;
                            return layer.alert("请上传业务收入确认书!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.fileStatusList.receiptNoitce == 0) {
                            ifN =true;
                            return layer.alert("请上传资金到账通知书!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.fileStatusList.premiumNotice == 0) {
                            ifN =true;
                            return layer.alert("请上传保费缴纳通知书!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        /*  if ($scope.VO.fileStatusList.packingList == 0) {
                              ifN =true;
                              return layer.alert("请上传发票扫描件!",
                                  {skin: 'layui-layer-lan', closeBtn: 1});
                          }*/
                        if ($scope.VO.fileStatusList.economicCooperation == 0) {
                            ifN =true;
                            return layer.alert("请上传经纪业务合作协议!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.fileStatusList.insurancePolicy == 0) {
                            ifN =true;
                            return layer.alert("请上传保单!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.customerServiceList.schedule == 0) {
                            ifN =true;
                            return layer.alert("请上传客户服务计划表!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.customerServiceList.workReport == 0) {
                            ifN =true;
                            return layer.alert("请上传客户服务工作报告!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        // if ($scope.VO.fileStatusList.customerNotification == 0) {
                        //     ifN =true;
                        //     return layer.alert("请上传客户告知书!",
                        //         {skin: 'layui-layer-lan', closeBtn: 1});
                        // }
                        // if ($scope.VO.fileStatusList.insuranceExpire == 0) {
                        //     ifN =true;
                        //     return layer.alert("请上传保险到期提示函!",
                        //         {skin: 'layui-layer-lan', closeBtn: 1});
                        // }
                        if($scope.VO.appendices){
                            for (let i =0 ;i<$scope.VO.appendices.length;i++){
                                if($scope.VO.appendices[i].file_type==""){
                                    return layer.alert("请选择合同类型!",{skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if ($scope.VO.appendices[i].source == "上传" && $scope.VO.appendices[i].CONTRACTNAME == "") {
                                    return layer.alert("请填写合同名称!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if ($scope.VO.appendices[i].source == "上传" && $scope.VO.appendices[i].CONTRACTCOUNTERPARTINFORMATION == "") {
                                    return layer.alert("请填写合同对方信息!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }
                        }
                        if( $scope.VO.fileStatusList.billApplication ==0){
                            ifN=true;
                            return layer.alert("请上发票开具申请单!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        //股东业务校验
                        if($scope.VO.pkProject.tradetype_name == "股东业务"){
                            let countNum = $scope.VO.fileStatusList.insuranceChangeApply + $scope.VO.fileStatusList.coverNoteApply + $scope.VO.fileStatusList.issueNotices;
                            if(!countNum || countNum <= 0){
                                ifN =true;
                                return layer.alert("出单通知书，暂保申请，保单批改申请书三者至少上传其中一个!",{skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            countNum = $scope.VO.fileStatusList.insurancePolicy + $scope.VO.fileStatusList.endorsement + $scope.VO.fileStatusList.coverNote + $scope.VO.fileStatusList.insuranceBill;
                            if(!countNum || countNum <= 0){
                                ifN =true;
                                return layer.alert("保单，批单，暂保单，保险单四者至少上传其中一个!",{skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                    }
                    // 如果是整理中的数据时，需要修正单据状态

                    //判断档案所属期与当前立项名称年份是否相同，给出提示
                    if ($scope.VO.period !=null){
                        let pkProject = $scope.VO.pkProject.name;
                        if (pkProject.length>0){
                            var pkProjectYear = Number(pkProject.substring(0,4));
                            if (pkProjectYear=="NaN"){
                                var pkProjectYear = Number($scope.VO.pkProject.planSucceedDate.substring(0,4));
                            }
                        }
                        let period = $scope.VO.period;
                        if (pkProjectYear!=null && pkProjectYear != period){
                            ifN=false;
                            layer.confirm('请核实基本信息中“档案所属期”和“立项”年份，是否需要修改', {
                                btn: ['是', '否'], //按钮
                                btn2: function() {
                                    //提交生成档案编号时先判断档案编号是否为null，
                                    //$scope.genBusiSerialNumByRule();
                                    },
                                shade: 0.6,//遮罩透明度
                                shadeClose: true,//点击遮罩关闭层
                            }, function () {
                                ifN = true;
                                if (ifN==true){
                                    layer.msg('取消提交!', {
                                        shift: 6,
                                        icon: 11
                                    });
                                }
                            })
                        }


                    }
                    if (!ifN){
                        $scope.genBusiSerialNumByRule();
                    }

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
         * 子表删除
         */
        $scope.onDeleteLine = function (name) {
            $scope.selectTabName = name;
            var delRow = $scope[$scope.selectTabName].gridApi.selection.getSelectedRows();

            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (var i = 0; i < $scope[$scope.selectTabName].data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope[$scope.selectTabName].data[i].$$hashKey == delRow[j].$$hashKey) {
                        if($scope[$scope.selectTabName].data[i].source=="上传"){
                            $scope[$scope.selectTabName].data.splice(i, 1);
                        }else if($scope.selectTabName != "insuranceSchemeGridOptions" && $scope.selectTabName != "issueNoticeGridOptions" ){
                            $scope[$scope.selectTabName].data.splice(i, 1);
                        }
                    }
                }
            }
            $scope.countFileStatusList();
        };
    };
    $scope.initPage = function () {
        $scope.isClear = false;
        $scope.isShow = true;
        //阻止页面渲染
        $scope.form = false;
        $scope.card = false;
        //阻止页面渲染
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isOld= false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.isDisableds = false;
        $scope.isreplace = true;
        $scope.queryShow = true;
        //控制附件上传和下载
        $scope.upOrDown = true;
        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
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
            exporterMenuCsv: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '经纪业务档案管理信息.csv',
            columnDefs: [
                {name: 'pk_project_code', displayName: '立项编号', },
                {name: 'pk_project_name', displayName: '立项名称', },
                {name: 'fbillno', displayName: '经纪业务档案编号',},
                {name: 'period', displayName: '所属期'},
                {name: 'fbillstatus', displayName: '档案状态', cellFilter: 'SELECT_BUSSINESFILESSTATUS',},
                {name: 'tradetype_name', displayName: '客户产权关系'},
                {name: 'c_2_type', displayName: '业务类型', cellFilter: 'SELECT_MARKETTYPE'},
                {name: 'pkAuditor_name', displayName: '审核人',},
                {name: 'audit_date', displayName: '封存时间',},
                {name: 'pkOrg_name', displayName: '业务单位',},
                {name: 'billstatus', displayName: '单据状态', cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'cinsureman_name', displayName: '客户名称',},
                {name: 'bussinessStatus', displayName: '业务状态',cellFilter: 'SELECT_BUSSINESSSTATUS'},
                {name: 'pkProject_pkOperator', displayName: '立项经办人',},
                {name: 'pkOperator_name', displayName: '档案经办人',},
                {name: 'c1Execitem', displayName: '备注',},
            ],
            data: [],
            exporterAllDataFn: function () {
                $scope.queryAllForGrid($scope.QUERY);
            },
        };
        $scope.gridOptions.onRegisterApi = function (gridApi) {
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
                if($("gridGrid").selected=true){
                    var rows = $scope.gridApi.selection.getSelectedRows();
                    if (rows.length == 1) {
                        if (!$scope.chilbTable) {
                            $scope.chilbTable = true;
                        }
                        angular.assignData($scope.VO, row.entity);
                        $scope.findOne(rows[0].id);
                    } else {
                        angular.assignData($scope.VO, $scope.initVO());
                    }
                }

            });

        };

        //基础档案
        $scope.baseFilesGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'file_type',
                    displayName: '档案类型',
                    enableCellEdit: true,
                    cellFilter: 'SELECT_FILETYPE1',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.DOUCUMENTTYPE
                },

                {
                    name: 'attachment_name', displayName: '档案名称', enableCellEdit: false
                },

                {
                    name: 'cUpdate', displayName: '上载时间',enableCellEdit: false
                },
            ],
            data: $scope.VO.baseFiles,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.baseFilesGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.baseFilesGridOptions.gridApi = gridApi;
                    if (gridApi.edit){
                        gridApi.edit.on.afterCellEdit($scope,function (rowEntity, colDef, newValue, oldValue) {
                            if ('file_type' == colDef.name){
                                $scope.countFileStatusList();
                            }
                        })
                    }
                }
                $scope.baseFilesGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };

        //结算档案
        $scope.junctionFilesGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'file_type',
                    displayName: '档案类型',
                    enableCellEdit: true,
                    cellFilter: 'SELECT_FILETYPE2',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.DOUCUMENTTYPE
                },
                {
                    name: 'attachment_name', displayName: '档案名称', enableCellEdit: false
                },

                {
                    name: 'cUpdate', displayName: '上载时间', enableCellEdit: false
                },
            ],
            data: $scope.VO.junctionFiles,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.baseFilesGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.junctionFilesGridOptions.gridApi = gridApi;
                    if (gridApi.edit){
                        gridApi.edit.on.afterCellEdit($scope,function (rowEntity, colDef, newValue, oldValue) {
                            if ('file_type' == colDef.name){
                                $scope.countFileStatusList();
                            }
                        })
                    }
                }
                $scope.junctionFilesGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };

        //合同附件
        // $scope.appendicesGridOptions = {
        //     enableCellEditOnFocus: true,
        //     cellEditableCondition: false,
        //     enableRowSelection: true,
        //     enableSelectAll: true,
        //     multiSelect: true,
        //     enableSorting: false,
        //     enableRowHeaderSelection: true,
        //     selectionRowHeaderWidth: 35,
        //     cellEditableCondition: function ($rootScope) {
        //         if ($scope.isEdit) {
        //             return true;
        //         } else {
        //             return false;
        //         }
        //     },
        //     rowHeight: 35,
        //     columnDefs: [
        //         {
        //             name: 'file_type',
        //             displayName: '合同类型',
        //             enableCellEdit: true,
        //             cellFilter: 'SELECT_FILETYPE4',
        //             editableCellTemplate: 'ui-grid/dropdownEditor'
        //             ,
        //             editDropdownValueLabel: 'name'
        //             ,
        //             editDropdownOptionsArray: getSelectOptionData.DOUCUMENTTYPE
        //         },
        //
        //         {
        //             name: 'CONTRACTNUMBER', displayName: '合同编号',
        //             enableCellEdit: true,
        //             cellEditableCondition: function ($scope, row) {
        //                 return $scope.row.entity.source == '上传';
        //             }
        //         },
        //
        //         {
        //             name: 'CONTRACTNAME', displayName: '合同名称',
        //             enableCellEdit: true,
        //             cellEditableCondition: function ($scope, row) {
        //                 return $scope.row.entity.source == '上传';
        //             }
        //         },
        //         {
        //             name: 'CONTRACTCOUNTERPARTINFORMATION', displayName: '合同对方信息',
        //             enableCellEdit: true,
        //             cellEditableCondition: function ($scope, row) {
        //                 return $scope.row.entity.source == '上传';
        //             }
        //         },
        //         {
        //             name: 'TEXT_NAME', displayName: '附件名称', enableCellEdit: false
        //         },
        //         {
        //             name: 'source', displayName: '附件来源', enableCellEdit: false
        //         },
        //     ],
        //     data: $scope.VO.appendices,
        //     onRegisterApi: function (gridApi) {
        //         if ($scope.downFlag) {
        //             $scope.baseFilesGrid = gridApi;
        //             $scope.downFlag = false;
        //         } else {
        //             $scope.appendicesGridOptions.gridApi = gridApi;
        //             if (gridApi.edit) {
        //                 gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
        //                     if ('file_type' == colDef.name) {
        //                         $scope.countFileStatusList();
        //                     }
        //                 })
        //             }
        //         }
        //         $scope.appendicesGridOptions.gridApi.core.addRowHeaderColumn({
        //             name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
        //         });
        //     }
        // };
        // 其他合同附件
        $scope.uploadContractFileGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'file_type',
                    displayName: '合同类型',
                    enableCellEdit: true,
                    cellFilter: 'SELECT_FILETYPE4',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.DOUCUMENTTYPE
                },

                {
                    name: 'CONTRACTNUMBER', displayName: '合同编号',
                    enableCellEdit: true,
                    cellEditableCondition: function ($scope, row) {
                        return $scope.row.entity.source == '上传';
                    }
                },

                {
                    name: 'CONTRACTNAME', displayName: '合同名称',
                    enableCellEdit: true,
                    cellEditableCondition: function ($scope, row) {
                        return $scope.row.entity.source == '上传';
                    }
                },
                {
                    name: 'CONTRACTCOUNTERPARTINFORMATION', displayName: '合同对方信息',
                    enableCellEdit: true,
                    cellEditableCondition: function ($scope, row) {
                        return $scope.row.entity.source == '上传';
                    }
                },
                {
                    name: 'TEXT_NAME', displayName: '附件名称', enableCellEdit: false
                },
                {
                    name: 'source', displayName: '附件来源', enableCellEdit: false
                },
            ],
            data: $scope.VO.uploadContractFile,
            onRegisterApi: function (gridApi) {
                $scope.uploadContractFileGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if ('file_type' == colDef.name) {
                            $scope.countFileStatusList();
                        }
                    })
                }
                $scope.uploadContractFileGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };

        //主表合同信息
        $scope.mainContractGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'file_type',
                    displayName: '合同类型',
                    enableCellEdit: true,
                    cellFilter: 'SELECT_FILETYPE4',
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownValueLabel: 'name',
                    editDropdownOptionsArray: getSelectOptionData.DOUCUMENTTYPE
                },
                {name: 'CONTRACTNUMBER', displayName: '合同编号',enableCellEdit: false},
                {name: 'CONTRACTNAME', displayName: '合同名称',enableCellEdit: false},
                {name: 'CONTRACTCOUNTERPARTINFORMATION', displayName: '合同对方',enableCellEdit: false},
                // {name: 'TYPEOFCONTRACT', displayName: '合同类型', cellFilter: 'JF_WORDS',enableCellEdit: false},
                {name: 'CNTIME', displayName: '合同编号时间',enableCellEdit: false,cellFilter: 'date'},
            ],
            data: $scope.VO.mainContract,
            onRegisterApi: function (gridApi) {
                $scope.mainContractGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if ('file_type' == colDef.name) {
                            $scope.countFileStatusList();
                        }
                    })
                }
                $scope.mainContractGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };

        //合同类型
      /*  $scope.insuranceGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'TYPEOFCONTRACT', displayName: '合同类型', enableCellEdit: false
                },

                {
                    name: 'CONTRACTNUMBER', displayName: '合同编号', enableCellEdit: false
                },

                {
                    name: 'CONTRACTNAME', displayName: '合同名称', enableCellEdit: false
                },
                {
                    name: 'CONTRACTCOUNTERPARTINFORMATION', displayName: '合同对方信息', enableCellEdit: false
                },
                {
                    name: 'file_type', displayName: '附件类型', enableCellEdit: false
                },
                {
                    name: 'source', displayName: '附件来源', enableCellEdit: false
                },
            ],
            data: $scope.VO.insuranceGridOptions,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.baseFilesGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.insuranceGridOptions.gridApi = gridApi;
                }
                $scope.appendicesGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };*/


        //保险方案附件
        $scope.insuranceSchemeGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'insuranceSchemeCode', displayName: '保险方案/保险建议书编号',enableCellEdit: false
                },

                {
                    name: 'insuranceSchemeName', displayName: '保险方案/保险建议书名称', enableCellEdit: true
                },

                {
                    name: 'attachment_name', displayName: '保险方案/保险建议书附件', enableCellEdit: false
                },
                {
                    name: 'source', displayName: '附件来源', enableCellEdit: false
                },
                {
                    name: 'cUpdate', displayName: '上载时间', enableCellEdit: false
                },
            ],
            data: $scope.VO.insuranceScheme,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.baseFilesGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.insuranceSchemeGridOptions.gridApi = gridApi;
                    if (gridApi.edit){
                        gridApi.edit.on.afterCellEdit($scope,function (rowEntity, colDef, newValue, oldValue) {
                            $scope.countFileStatusList();
                        })
                    }

                }
                $scope.insuranceSchemeGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };

        //出单通知书
        $scope.issueNoticeGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'IssueNoticeNo', displayName: '出单通知书编号', enableCellEdit: false
                },

                {
                    name: 'name', displayName: '出单通知书名称', enableCellEdit: true
                },

                {
                    name: 'attachment_name', displayName: '出单通知书附件',enableCellEdit: false
                },
                {
                    name: 'insuranceSchemeName', displayName: '关联的保险方案', enableCellEdit: false
                },
                {
                    name: 'source', displayName: '附件来源',enableCellEdit: false
                },

                {
                    name: 'cUpdate', displayName: '上载时间', enableCellEdit: false
                },
            ],
            data: $scope.VO.issueNotice,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.baseFilesGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.issueNoticeGridOptions.gridApi = gridApi;
                    if (gridApi.edit){
                        gridApi.edit.on.afterCellEdit($scope,function (rowEntity, colDef, newValue, oldValue) {
                            $scope.countFileStatusList();
                        })
                    }
                }
                $scope.issueNoticeGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };

        //保单附件
        $scope.projectInsuranceGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'insuranceinfono', displayName: '保单信息编号', enableCellEdit: false
                },

                {
                    name: 'insuranceno', displayName: '保单号', enableCellEdit: false
                },

                {
                    name: 'attachment_name', displayName: '保单附件', enableCellEdit: false
                },
                {
                    name: 'issueNoticeName', displayName: '关联的出单通知书名称',enableCellEdit: false
                },

                {
                    name: 'cUpdate', displayName: '上载时间',enableCellEdit: false
                },
            ],
            data: $scope.VO.projectInsurance,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.baseFilesGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.projectInsuranceGridOptions.gridApi = gridApi;
                    if (gridApi.edit){
                        gridApi.edit.on.afterCellEdit($scope,function (rowEntity, colDef, newValue, oldValue) {
                            $scope.countFileStatusList();
                        })
                    }
                }
                $scope.projectInsuranceGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };

        //批单附件
        $scope.changeBillCheckGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'vbillno', displayName: '批单信息编号', enableCellEdit: false
                },

                {
                    name: 'insurancecheckno', displayName: '批单号', enableCellEdit: false
                },

                {
                    name: 'attachment_name', displayName: '批单附件', enableCellEdit: false
                },
                {
                    name: 'insuranceno', displayName: '关联的保单号', enableCellEdit: false
                },
                {
                    name: 'cUpdate', displayName: '上载时间', enableCellEdit: false
                },
            ],
            data: $scope.VO.changeBillCheck,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.baseFilesGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.changeBillCheckGridOptions.gridApi = gridApi;
                    if (gridApi.edit){
                        gridApi.edit.on.afterCellEdit($scope,function (rowEntity, colDef, newValue, oldValue) {
                            $scope.countFileStatusList();


                        })
                    }
                }
                $scope.changeBillCheckGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };

        //暂保单附件
        $scope.provisionalPolicyGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'insuranceinfono', displayName: '暂保单编号', enableCellEdit: false
                },

                {
                    name: 'insurancesPolicy', displayName: '暂保单号',enableCellEdit: false
                },
                {
                    name: 'attachment_name', displayName: '暂保单附件',enableCellEdit: false
                },
                {
                    name: 'cUpdate', displayName: '上载时间', enableCellEdit: false
                },
            ],
            data: $scope.VO.provisionalPolicy,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.baseFilesGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.provisionalPolicyGridOptions.gridApi = gridApi;
                    if (gridApi.edit){
                        gridApi.edit.on.afterCellEdit($scope,function (rowEntity, colDef, newValue, oldValue) {
                            $scope.countFileStatusList();
                        })
                    }
                }
                $scope.provisionalPolicyGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
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
                    cellFilter: 'SELECT_FILETYPE3',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.DOUCUMENTTYPE
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
                            if ('file_type' == colDef.name){
                                $scope.countFileStatusList();
                            }
                        })
                    }
                }
                $scope.dealAttachmentBGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };

        //客户服务档案附件
        $scope.customerServiceGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'file_type',
                    displayName: '档案类型',
                    enableCellEdit: false,
                    cellFilter: 'SELECT_CUSTOMERSERVICETYPE',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.CUSTOMERSERVICETYPE
                },
                {
                    name: 'attachment_name', displayName: '档案名称', enableCellEdit: false
                },

                {
                    name: 'cUpdate', displayName: '上载时间', enableCellEdit: false
                },
            ],
            data: $scope.VO.customerService,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.baseFilesGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.customerServiceGridOptions.gridApi = gridApi;
                    if (gridApi.edit){
                        gridApi.edit.on.afterCellEdit($scope,function (rowEntity, colDef, newValue, oldValue) {
                            $scope.countFileStatusList();
                        })
                    }
                }
                $scope.customerServiceGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };

        //单据档案中的申请
        $scope.billApplyGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'file_type',
                    displayName: '档案类型',
                    enableCellEdit: false,
                    cellFilter: 'SELECT_FILETYPE1',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.FILETYPE1
                },
                {
                    name: 'attachment_name', displayName: '档案名称', enableCellEdit: false
                },

                {
                    name: 'cUpdate', displayName: '上载时间', enableCellEdit: false
                },
            ],
            data: $scope.VO.billApply,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.baseFilesGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.billApplyGridOptions.gridApi = gridApi;
                    if (gridApi.edit){
                        gridApi.edit.on.afterCellEdit($scope,function (rowEntity, colDef, newValue, oldValue) {
                            $scope.countFileStatusList();
                        })
                    }
                }
                $scope.billApplyGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };

        //合同子表
        $scope.VO.appendicesPagesChildren = [];
        $scope.appendicesPagesGridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationCurrentPage: 1,
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {name: 'CONTRACTNUMBER', displayName: '合同编号',},
                {name: 'CONTRACTNAME', displayName: '合同名称',},
                {name: 'CONTRACTCOUNTERPARTINFORMATION', displayName: '合同对方',},
                {name: 'TYPEOFCONTRACT', displayName: '合同类型', cellFilter: 'JF_WORDS'},
                {name: 'CNTIME', displayName: '合同编号时间',},
            ],
        };
        $scope.appendicesPagesGridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApiChilder = gridApi;

            //添加行头
            $scope.gridApiChilder.core.addRowHeaderColumn({
                name: 'rowHeaderCol',
                displayName: '',
                width: 30,
                cellTemplate: 'ui-grid/rowNumberHeader'
            });

            if(null!= gridApi.pagination){
                gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                    $scope.gridApiChilder.page = newPage;
                    $scope.gridApiChilder.pageSize = pageSize;
                    $scope.queryForGridChildren($scope.QUERYCHILDREN, $scope.queryPath);
                });
            }
        };

        //客户培训总结附件信息
        $scope.trainingMaterialsGridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [20, 50, 100],
            paginationCurrentPage: 1,
            paginationPageSize: 20,
            useExternalPagination: true,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'serialNo', displayName: '培训总结编号', enableCellEdit: false
                },
                {
                    name: 'trainName', displayName: '培训总结标题', enableCellEdit: false
                },

                {
                    name: 'fileNames', displayName: '包含附件', enableCellEdit: false, cellFilter: 'StringFilter'
                },
            ],
            data: [],
            onRegisterApi: function (gridApi) {
                $scope.trainingMaterialsGridOptions.gridApi = gridApi;
                $scope.trainingMaterialsGridOptions.gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
                });
            }
        };

    };

    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
        if ($scope.selectTabName == 'baseFilesGridOptions'){
            $scope.isShow  = true;
        }
    };

    $scope.initQUERYChildren = function () {
        return {
        }
    };
    $scope.QUERYCHILDREN = $scope.initQUERYChildren();


    $scope.table_name = "lr_file_administration";
    $scope.billdef = "FileAdministration";
    $scope.beanName = "insurance.SmallServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.queryTradetype();
    initworkflow($scope, $http,ngDialog);
    initonlineView($scope,$rootScope,$sce,$http,ngDialog);
    initPreviewFile($scope,$rootScope);
});


app.controller('pullDataPageCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
    /**
     * 初始化页面变更方法
     */
    $scope.initQUERYChildren = function () {
        return {
        }
    };
    $scope.QUERYCHILDREN = $scope.initQUERYChildren();

    $scope.initData = function () {
        $scope.VO.pullDataPage = [];
        $scope.pullDataPageGridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: false,//多选
            useExternalPagination: true,
            columnDefs: [
                {name: 'pk_project_name', displayName: '立项名称',},
                {name: 'pk_project_code', displayName: '立项编号',},
                {name: 'fbillno', displayName: '档案编号',},
                {name: 'cinsureman_name', displayName: '客户名称',},
                {name: 'period', displayName: '所属期',},
                {name: 'c_2_type', displayName: '险种分类'},
            ],
        };

        $scope.pullDataPageGridOptions.onRegisterApi = function (gridApi) {
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
                $scope.queryForGridChildrens($scope.QUERYCHILDREN);
            });
        };
    };

    $scope.queryForGridChildrens = function () {
        //var rows = $scope.gridApi.selection.getSelectedRows();
        var row = $scope.VO.pkProject;

        if (!$scope.queryData) {
            $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.pullDataPageGridOptions.columnDefs;
        }
        layer.load(2);

        $http.post($scope.archivesPath + "fileAdministration/queryForPullDataGrid", {
            params: angular.toJson(row),
            fields: angular.toJson($scope.queryData)
        }).success(function (response) {
            if (response.code == 200) {
                if (!$scope.query) {
                    $scope.query = $scope.pullDataPageGridOptions.columnDefs;
                }
                $scope.pullDataPageGridOptions.data = response.result.Rows;
                $scope.pullDataPageGridOptions.totalItems = response.result.Total;
            }
            layer.closeAll('loading');
        });
    };

    $scope.initFunction = function () {

        /**
         * 确定
         * */
        $scope.onConfirm = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});
            if (rows.length>0){
                $http.post($scope.archivesPath + "fileAdministration/updatePullDatePage", {
                    datas: angular.toJson($scope.VO),
                    params: angular.toJson(rows),
                }).success(function (response) {
                    if (response.code == 200) {
                        $scope.baseFilesGridOptions.data = response.VO.baseFiles;
                        // $scope.appendicesGridOptions.data = response.VO.appendices;
                        $scope.junctionFilesGridOptions.data = response.VO.junctionFiles;
                        $scope.insuranceSchemeGridOptions.data = response.VO.insuranceScheme;
                        $scope.issueNoticeGridOptions.data = response.VO.issueNotice;
                        $scope.dealAttachmentBGridOptions.data = response.VO.dealAttachmentB;
                        $scope.countFileStatusList();
                        //拉取数据更新业务分类状态为“正常”
                        $scope.VO.bussinessStatus = 1;
                        return layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                });
            }
            ngDialog.close();

        };
        $scope.onCancel = function () {
            ngDialog.close($scope.ngDialogId);
        };


    };

    $scope.queryForGridChildrens();
    $scope.initData();
    $scope.initFunction();

});
