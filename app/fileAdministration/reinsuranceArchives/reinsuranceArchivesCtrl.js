app.controller('reinsuranceArchivesCtrl', function ($rootScope, $scope,$sce, $http, $stateParams,$state, uiGridConstants, ngDialog, ngVerify,$window) {

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
                projectInsurance: [],
                uploadContractFile:[],
                mainContract:[],
                changeBillCheck:[],
                dealAttachmentB:[],
                // billApply:[]
            };
        };
        $scope.entityVO = 'nc.vo.busi.fileAdministrationVO';
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "id": $stateParams.id,
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode = '20802';
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
            data.nodeType="602";
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.basePath + "common/queryAllForGrid", {
                params: angular.toJson(data),
                fileName: '再保险业务档案管理.xls',
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

        //onGeneratePolicy()
        /**
        * 列表查询
        * */

        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.archivesPath + "reinsuranceArchives/queryForGrid",{
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

        $scope.findOne = function (id,callback) {
            $scope.id = id;
            $http.post($scope.archivesPath + "reinsuranceArchives/findOne",{pk: id}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200"){
                    angular.assignData($scope.VO,response.result);
                    if ($scope.VO.fbillstatus!=null && $scope.VO.fbillstatus==0){
                        $scope.VO.fbillstatus=1;
                    };
                    if ($scope.isEdit == true && ($scope.VO.bussinessStatus == 1 || $scope.VO.bussinessStatus == null)) {
                        if (response.result.projectInsurance != null) {
                            response.result.fileStatusList.reGuarantee = response.result.projectInsurance.length;
                        }
                        if (response.result.changeBillCheck != null) {
                            response.result.fileStatusList.reinsuranceEndorsement = response.result.changeBillCheck.length;
                        }
                    }
                    $scope.initField();
                    if (callback) {
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

        /**
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO.pkOperator=$rootScope.userVO;
            $scope.VO.baseFiles = $scope.baseFilesGridOptions.data;
            $scope.VO.junctionFiles = $scope.junctionFilesGridOptions.data;
            $scope.VO.projectInsurance = $scope.projectInsuranceGridOptions.data;
            $scope.VO.changeBillCheck = $scope.changeBillCheckGridOptions.data;
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
        /**
         * 合同查询
         * */
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

        /**
         * 合同的查询
         * */
        $scope.onQueryChildren = function () {
            $scope.queryForGridChildren($scope.QUERYCHILDREN, $scope.queryPath);
        };
        /**
         * 合同的重置
         * */
        $scope.onResetChildren = function () {
            $scope.QUERYCHILDREN = $scope.initQUERYChildren();
        };

        /**
         * 合同的上传功能
         * */
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

    };
    $scope.initFunction = function () {

        //@zhangwj 新增字段不在后台配置了
        $scope.initField = function (){
            //资金到账通知书
            if(!$scope.VO.fileStatusList.accountIssueNotice){
                $scope.VO.fileStatusList.accountIssueNotice = 0;
            }
            //账单
            // if(!$scope.VO.fileStatusList.bill){
            //     $scope.VO.fileStatusList.bill = 0;
            // }
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
            $scope.VO.fileStatusList.reinsuranceScheme = 0;
            $scope.VO.fileStatusList.reinsuranceBill = 0;
            $scope.VO.fileStatusList.bussinessApproval = 0;
            //file_type:1再保险方案 2 再保账单 3业务立项批复单
            for (var i = 0; i < baseFilesGridOptionsArray.length; i++) {
                if (baseFilesGridOptionsArray[i].file_type == 1) {
                    $scope.VO.fileStatusList.reinsuranceScheme = $scope.VO.fileStatusList.reinsuranceScheme + 1;
                }
                if (baseFilesGridOptionsArray[i].file_type == 2) {
                    $scope.VO.fileStatusList.reinsuranceBill = $scope.VO.fileStatusList.reinsuranceBill + 1;
                }
                if (baseFilesGridOptionsArray[i].file_type == 3) {
                    $scope.VO.fileStatusList.bussinessApproval = $scope.VO.fileStatusList.bussinessApproval + 1;
                }
            }

            //结算档案
            var junctionFilesGridOptionsArray = $scope.junctionFilesGridOptions.data;
            $scope.junctionFiles = $scope.junctionFilesGridOptions.data;
            $scope.VO.fileStatusList.receiptNotification = 0;
            $scope.VO.fileStatusList.receiptIndemnity = 0;
            $scope.VO.fileStatusList.incomeConfirmation = 0;
            $scope.VO.fileStatusList.invoiceIssueApplication = 0;
            $scope.VO.fileStatusList.invoiceScanning = 0;
            $scope.VO.fileStatusList.accountIssueNotice = 0;
            //file_type：1 代收代付保费通知书 2.代收代付赔款 3.业务收入确认书 4.发票开具申请单、5.发票扫描件、6.资金到账通知书
            for (var i = 0; i < junctionFilesGridOptionsArray.length; i++) {
                if (junctionFilesGridOptionsArray[i].file_type == 1) {
                    $scope.VO.fileStatusList.receiptNotification = $scope.VO.fileStatusList.receiptNotification + 1;
                }
                if (junctionFilesGridOptionsArray[i].file_type == 2) {
                    $scope.VO.fileStatusList.receiptIndemnity = $scope.VO.fileStatusList.receiptIndemnity + 1;
                }
                if (junctionFilesGridOptionsArray[i].file_type == 3) {
                    $scope.VO.fileStatusList.incomeConfirmation = $scope.VO.fileStatusList.incomeConfirmation + 1;
                }
                if (junctionFilesGridOptionsArray[i].file_type == 4) {
                    $scope.VO.fileStatusList.invoiceIssueApplication = $scope.VO.fileStatusList.invoiceIssueApplication + 1;
                }
                if (junctionFilesGridOptionsArray[i].file_type == 5) {
                    $scope.VO.fileStatusList.invoiceScanning = $scope.VO.fileStatusList.invoiceScanning + 1;
                }
                if (junctionFilesGridOptionsArray[i].file_type == 6) {
                    $scope.VO.fileStatusList.accountIssueNotice = $scope.VO.fileStatusList.accountIssueNotice + 1;
                }
            }
            //合同附件
            var mainContractGridOptionsArray = $scope.mainContractGridOptions.data;
            $scope.mainContract = $scope.mainContractGridOptions.data;
            $scope.VO.fileStatusList.economicCooperation = 0;
            $scope.VO.fileStatusList.economicTripartite = 0;
            //file_type: 1.经纪业务合作协议 2.经纪业务三方协议
            for (var i = 0; i < mainContractGridOptionsArray.length; i++) {
                if (mainContractGridOptionsArray[i].file_type == 1) {
                    $scope.VO.fileStatusList.economicCooperation = $scope.VO.fileStatusList.economicCooperation + 1;
                }
                if (mainContractGridOptionsArray[i].file_type == 2) {
                    $scope.VO.fileStatusList.economicTripartite = $scope.VO.fileStatusList.economicTripartite + 1;
                }
            }

            var uploadContractFileGridOptionsArray = $scope.uploadContractFileGridOptions.data;
            $scope.uploadContractFile = $scope.uploadContractFileGridOptions.data;
            for (var i = 0; i < uploadContractFileGridOptionsArray.length; i++) {
                if (uploadContractFileGridOptionsArray[i].file_type == 1) {
                    $scope.VO.fileStatusList.economicCooperation = $scope.VO.fileStatusList.economicCooperation + 1;
                }
                if (uploadContractFileGridOptionsArray[i].file_type == 2) {
                    $scope.VO.fileStatusList.economicTripartite = $scope.VO.fileStatusList.economicTripartite + 1;
                }
            }

            //保单附件
            $scope.projectInsurance = $scope.projectInsuranceGridOptions.data;
            $scope.VO.fileStatusList.reGuarantee = $scope.projectInsuranceGridOptions.data.length;

            //批单附件
            $scope.changeBillCheck = $scope.changeBillCheckGridOptions.data;
            $scope.VO.fileStatusList.reinsuranceEndorsement = $scope.changeBillCheckGridOptions.data.length;

            //其他附件
            var dealAttachmentBGridOptionsArray = $scope.dealAttachmentBGridOptions.data;
            $scope.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $scope.VO.fileStatusList.otherAdministration = 0;
            $scope.VO.fileStatusList.reinsuranceAgreement = 0;
            $scope.VO.fileStatusList.projectDescription = 0;
            //file_type 1其他档案 2.分保协议 3.项目服务人员及领取报酬情况说明
            for (var i = 0; i < dealAttachmentBGridOptionsArray.length; i++) {
                if (dealAttachmentBGridOptionsArray[i].file_type == 1) {
                    $scope.VO.fileStatusList.otherAdministration = $scope.VO.fileStatusList.otherAdministration + 1;
                }
                if (dealAttachmentBGridOptionsArray[i].file_type == 2) {
                    $scope.VO.fileStatusList.reinsuranceAgreement = $scope.VO.fileStatusList.reinsuranceAgreement + 1;
                }
                if (dealAttachmentBGridOptionsArray[i].file_type == 3) {
                    $scope.VO.fileStatusList.projectDescription = $scope.VO.fileStatusList.projectDescription + 1;
                }
            }

            //单据档案
            // var billApplyGridOptionsArray = $scope.billApplyGridOptions.data;
            // $scope.VO.fileStatusList.bill = 0;
            // for (var i = 0; i < billApplyGridOptionsArray.length; i++) {
            //     if (billApplyGridOptionsArray[i].file_type == 8) {
            //         $scope.VO.fileStatusList.bill = $scope.VO.fileStatusList.bill + 1;
            //     }
            // }

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

        /**
        * 合同子页面
        * */
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
                            $scope.mainContractGridOptions.data.push(value[i]);
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
                $scope.aVO = {"nameArray":[{id:1,name:"再保险方案"},{id:2,name:"再保账单"},{id:3,name:"业务立项批复单"}] };
            }else if ($scope.selectTabName == "junctionFilesGridOptions"){
                $scope.aVO = {"nameArray":[{id:1,name:"代收代付保费通知书"},{id:2,name:"代收代付赔款"},{id:3,name:"业务收入确认书"},{id:4,name:"发票开具申请单"},{id:5,name:"发票扫描件"},{id: 6, name: "资金到账通知书"}] };
            }else if ($scope.selectTabName == "dealAttachmentBGridOptions"){
                $scope.aVO = {"nameArray": [{id: 1, name: "其他档案"}, {id: 2, name: "分保协议"}, {id: 3, name: "项目服务人员及领取报酬情况说明"}]};
            }
            // else if ($scope.selectTabName == "billApplyGridOptions"){
            //     $scope.aVO = {"nameArray": [{id: 8, name: "账单"}]};
            // }

            $scope.isSubDisabled = false;
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/fileAdministration/attachment.html',
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
                                $scope.VO.fileStatusList.reinsuranceScheme  = $scope.VO.fileStatusList.reinsuranceScheme + 1;
                            }
                            if (value[i].file_type == 2){
                                $scope.VO.fileStatusList.reinsuranceBill  = $scope.VO.fileStatusList.reinsuranceBill + 1;
                            }
                            if (value[i].file_type == 3){
                                $scope.VO.fileStatusList.bussinessApproval  = $scope.VO.fileStatusList.bussinessApproval + 1;
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
                                $scope.VO.fileStatusList.receiptNotification  = $scope.VO.fileStatusList.receiptNotification + 1;
                            }
                            if (value[i].file_type == 2){
                                $scope.VO.fileStatusList.receiptIndemnity  = $scope.VO.fileStatusList.receiptIndemnity + 1;
                            }
                            if (value[i].file_type == 3){
                                $scope.VO.fileStatusList.incomeConfirmation  = $scope.VO.fileStatusList.incomeConfirmation + 1;
                            }
                            if (value[i].file_type == 4){
                                $scope.VO.fileStatusList.invoiceIssueApplication  = $scope.VO.fileStatusList.invoiceIssueApplication + 1;
                            }
                            if (value[i].file_type == 5){
                                $scope.VO.fileStatusList.invoiceScanning  = $scope.VO.fileStatusList.invoiceScanning + 1;
                            }
                            if (value[i].file_type == 6){
                                $scope.VO.fileStatusList.accountIssueNotice  = $scope.VO.fileStatusList.accountIssueNotice + 1;
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
                }else if ($scope.selectTabName == "dealAttachmentBGridOptions") {
                    if (value !=null){
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
                                $scope.VO.fileStatusList.otherAdministration  = $scope.VO.fileStatusList.otherAdministration + 1;
                            }
                            if (value[i].file_type == 2) {
                                $scope.VO.fileStatusList.reinsuranceAgreement  = $scope.VO.fileStatusList.reinsuranceAgreement + 1;
                            }
                            if (value[i].file_type == 3) {
                                $scope.VO.fileStatusList.projectDescription = $scope.VO.fileStatusList.projectDescription + 1;
                            }
                        }
                    }
                }
                // else if($scope.selectTabName == "billApplyGridOptions"){
                //     if (value != null) {
                //         if ($scope.billApplyGridOptions.data) {
                //             angular.forEach(value, function (item) {
                //                 item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                //                 $scope.billApplyGridOptions.data.push(item);
                //             });
                //         } else {
                //             angular.forEach(value, function (item) {
                //                 $scope.billApplyGridOptions.data.push(item);
                //             });
                //         }
                //         for (var i = 0; i < value.length; i++) {
                //             if (value[i].file_type == 8) {
                //                 $scope.VO.fileStatusList.bill = $scope.VO.fileStatusList.bill + 1;
                //             }
                //         }
                //     }
                // }
            }, function (reason) {});
        };

        $scope.onDownLoads = function(id){
            var data =[];
            if ($scope.downCommon($scope.VO.baseFiles,0)||$scope.downCommon($scope.VO.junctionFiles,1)||$scope.downCommon($scope.VO.appendices,2)||$scope.downCommon($scope.VO.dealAttachmentB,3)||$scope.downCommon($scope.VO.projectInsurance,4)||$scope.downCommon($scope.VO.changeBillCheck,5)){

                data.push($scope.downCommon($scope.VO.baseFiles,0),$scope.downCommon($scope.VO.junctionFiles,1),$scope.downCommon($scope.VO.appendices,2),$scope.downCommon($scope.VO.dealAttachmentB,3),$scope.downCommon($scope.VO.projectInsurance,4),$scope.downCommon($scope.VO.changeBillCheck,5));
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
            var tableName=["基础档案","结算档案","合同附件","其他附件","保单附件","批单附件"];
            var fileName=[[{id:1,name:"再保险方案"},{id:2,name:"再保账单"},{id:3,name:"业务立项批复单"}],[{id:1,name:"代收代付保费通知书"},{id:2,name:"代收代付赔款"},{id:3,name:"业务收入确认书"},{id:4,name:"发票开具申请单"},{id:5,name:"发票扫描件"}],[{id:1,name:"经纪业务合作协议"},{id:2,name:"经纪业务三方协议"}],[{id: 1, name: "其他档案"}, {id: 2, name: "分保协议"}, {id: 3, name: "项目服务人员及领取报酬情况说明"}]];
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
                if (type==4||type==5){
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
                template: 'view/reinsuranceArchives/pullReinsuranceData.html',
                className: 'ngdialog-theme-formInfo',
                controller: 'pullReinsuranceDataCtrl',
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
            $scope.VO.projectInsurance = $scope.projectInsuranceGridOptions.data;
            $scope.VO.changeBillCheck = $scope.changeBillCheckGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;

            //保存生成再保险档案编号时先判断档案编号是否为null，
            if($scope.VO.fbillno == null) {
                var tableName = $scope.table_name;
                $http.post($scope.basePath + "common/genBusiSerialNumByRules", {
                    tableName: tableName,
                    data: angular.toJson($scope.VO)
                }).success(function (response) {
                    if (response.code == 200){
                        $scope.VO.fbillno = response.SerialNum;
                        $scope.onSaveVO();
                    }
                });
            }
            if (data) {
                data=$scope.VO;
                data.fbillstatus="1";
                var tablename = $scope.table_name;
                $http.post($scope.archivesPath  + "reinsuranceArchives/save",{data:angular.toJson($scope.VO),tablename:tablename}).success(function(response) {
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

        $scope.genBusiSerialNumByRule = function(){
            if($scope.VO.fbillno==null||$scope.VO.fbillno=="") {
                var tableName = $scope.table_name;
                $http.post($scope.basePath + "common/genBusiSerialNumByRules", {
                    tableName: tableName,
                    data: angular.toJson($scope.VO)
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
        }

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
                        if ($scope.VO.fileStatusList.reinsuranceScheme == 0) {
                            ifN =true;
                            return layer.alert("请上传再保险方案!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.fileStatusList.reinsuranceBill == 0) {
                            ifN =true;
                            return layer.alert("请上传再保账单!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.fileStatusList.bussinessApproval == 0) {
                            ifN =true;
                            return layer.alert("请上传业务立项批复单!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }

                        if ($scope.VO.fileStatusList.incomeConfirmation == 0) {
                            ifN =true;
                            return layer.alert("请上传业务收入确认书!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.fileStatusList.accountIssueNotice == 0) {
                            ifN =true;
                            return layer.alert("请上传资金到账通知书!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.fileStatusList.receiptNotification == 0) {
                            ifN =true;
                            return layer.alert("请上传代收代付保费通知书!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.fileStatusList.invoiceIssueApplication == 0) {
                            ifN = true;
                            return layer.alert("请上传发票开具申请单!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.fileStatusList.invoiceScanning == 0) {
                            ifN =true;
                            return layer.alert("请上传发票扫描件!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }

                        if ($scope.VO.fileStatusList.reGuarantee == 0) {
                            ifN =true;
                            return layer.alert("请上传再保条及账单!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }

                        if ($scope.VO.fileStatusList.projectDescription == 0) {
                            ifN =true;
                            return layer.alert("请上传项目服务人员及领取报酬情况说明!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }

                        if($scope.VO.appendices){
                            for (let i =0 ;i<$scope.VO.appendices.length;i++){
                                if($scope.VO.appendices[i].file_type==""){
                                    return layer.alert("请选择合同类型!",{skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if ($scope.VO.appendices[i].source == "上传" && $scope.VO.appendices[i].CONTRACTNAME == "") {
                                    return layer.alert("请填写合同编号!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if ($scope.VO.appendices[i].source == "上传" && $scope.VO.appendices[i].CONTRACTCOUNTERPARTINFORMATION == "") {
                                    return layer.alert("请填写合同对方信息!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
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
                            ifN=true;
                            layer.confirm('请核实基本信息中“档案所属期”和“立项”年份，是否需要修改', {
                                btn: ['是', '否'], //按钮
                                btn2: function() {
                                    //提交生成档案编号时先判断档案编号是否为null，
                                    $scope.genBusiSerialNumByRule();
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
                        //提交生成再保险业务档案编号时先判断档案编号是否为null，
                        $scope.genBusiSerialNumByRule();
                        // if($scope.VO.fbillno==null||$scope.VO.fbillno=="") {
                        //     var tableName = $scope.table_name;
                        //     $http.post($scope.basePath + "common/genBusiSerialNumByRules", {
                        //         tableName: tableName,
                        //         data: angular.toJson($scope.VO)
                        //     }).success(function (response) {
                        //         if (response.code == 200){
                        //             $scope.VO.fbillno = response.SerialNum;
                        //             $scope.onSaveVO();
                        //             $scope.fileSubmit();
                        //         }
                        //     });
                        // }else {
                        //     $scope.onSaveVO();
                        //     $scope.fileSubmit();
                        // }
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
        $scope.initView = function () {};

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
                        $scope[$scope.selectTabName].data.splice(i, 1);
                    }
                }
            }
            if ($scope.selectTabName =="baseFilesGridOptions"){
                var array = $scope.baseFilesGridOptions.data;
                $scope.baseFiles = $scope.baseFilesGridOptions.data;
                $scope.VO.fileStatusList.reinsuranceScheme = 0;
                $scope.VO.fileStatusList.reinsuranceBill = 0;
                $scope.VO.fileStatusList.bussinessApproval  =0;
                for (var i = 0; i < array.length; i++) {
                    if (array[i].file_type == 1){
                        $scope.VO.fileStatusList.reinsuranceScheme = $scope.VO.fileStatusList.reinsuranceScheme + 1;
                    }
                    if (array[i].file_type == 2){
                        $scope.VO.fileStatusList.reinsuranceBill  = $scope.VO.fileStatusList.reinsuranceBill +1;
                    }
                    if (array[i].file_type == 3){
                        $scope.VO.fileStatusList.bussinessApproval  = $scope.VO.fileStatusList.bussinessApproval+1;
                    }
                }
            }
            if ($scope.selectTabName =="junctionFilesGridOptions"){
                var array = $scope.junctionFilesGridOptions.data;
                $scope.junctionFiles = $scope.junctionFilesGridOptions.data;
                $scope.VO.fileStatusList.receiptNotification=0;
                $scope.VO.fileStatusList.receiptIndemnity=0;
                $scope.VO.fileStatusList.incomeConfirmation=0;
                $scope.VO.fileStatusList.invoiceIssueApplication=0;
                $scope.VO.fileStatusList.invoiceScanning=0;
                for (var i = 0; i < array.length; i++) {
                    if (array[i].file_type == 1){
                        $scope.VO.fileStatusList.receiptNotification  = $scope.VO.fileStatusList.receiptNotification + 1;
                    }
                    if (array[i].file_type == 2){
                        $scope.VO.fileStatusList.receiptIndemnity  = $scope.VO.fileStatusList.receiptIndemnity + 1;
                    }
                    if (array[i].file_type == 3){
                        $scope.VO.fileStatusList.incomeConfirmation  = $scope.VO.fileStatusList.incomeConfirmation + 1;
                    }
                    if (array[i].file_type == 4){
                        $scope.VO.fileStatusList.invoiceIssueApplication  = $scope.VO.fileStatusList.invoiceIssueApplication + 1;
                    }
                    if (array[i].file_type == 5){
                        $scope.VO.fileStatusList.invoiceScanning  = $scope.VO.fileStatusList.invoiceScanning + 1;
                    }
                }
            }
            if ($scope.selectTabName =="mainContractGridOptions"||$scope.selectTabName =="uploadContractFileGridOptions"){
                var array = $scope.mainContractGridOptions.data;
                $scope.mainContract = $scope.mainContractGridOptions.data;
                $scope.VO.fileStatusList.economicCooperation=0;
                $scope.VO.fileStatusList.economicTripartite=0;
                for (var i = 0; i < array.length; i++) {
                    if (array[i].file_type == 1){
                        $scope.VO.fileStatusList.economicCooperation  = $scope.VO.fileStatusList.economicCooperation + 1;
                    }
                    if (array[i].file_type == 2){
                        $scope.VO.fileStatusList.economicTripartite  = $scope.VO.fileStatusList.economicTripartite +1;
                    }
                }
                var upload = $scope.uploadContractFileGridOptions.data;
                for (var i = 0; i < upload.length; i++) {
                    if (upload[i].file_type == 1){
                        $scope.VO.fileStatusList.economicCooperation  = $scope.VO.fileStatusList.economicCooperation + 1;
                    }
                    if (upload[i].file_type == 2){
                        $scope.VO.fileStatusList.economicTripartite  = $scope.VO.fileStatusList.economicTripartite +1;
                    }
                }
            }
            //批单
            if ($scope.selectTabName == "changeBillCheckGridOptions"){
                $scope.changeBillCheck = $scope.changeBillCheckGridOptions.data;
                $scope.VO.reinsuranceEndorsement = $scope.changeBillCheckGridOptions.data.length;
            }
            //保单
            if ($scope.selectTabName == "projectInsuranceGridOptions"){
                $scope.projectInsurance = $scope.projectInsuranceGridOptions.data;
                $scope.VO.fileStatusList.reGuarantee = $scope.projectInsuranceGridOptions.data.length;
            }
            if ($scope.selectTabName == "dealAttachmentBGridOptions"){
                var array = $scope.dealAttachmentBGridOptions.data;
                $scope.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
                $scope.VO.fileStatusList.otherAdministration = 0;
                $scope.VO.fileStatusList.reinsuranceAgreement = 0;
                $scope.VO.fileStatusList.projectDescription = 0;
                for (var i = 0; i < array.length; i++) {
                    if (array[i].file_type == 1){
                        $scope.VO.fileStatusList.otherAdministration  = $scope.VO.fileStatusList.otherAdministration + 1;
                    }
                    if (array[i].file_type == 2){
                        $scope.VO.fileStatusList.reinsuranceAgreement  = $scope.VO.fileStatusList.reinsuranceAgreement + 1;
                    }
                    if (array[i].file_type == 3) {
                        $scope.VO.fileStatusList.projectDescription = $scope.VO.fileStatusList.projectDescription + 1;
                    }
                }
            }
        };

        /**
         * 合同子页面确定
         * */
        $scope.onConfirms = function () {
            if($("appendicesIdGrid").selected=true){
                var rows = $scope.gridApiChilder.selection.getSelectedRows();
                if (!rows) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});
                // 新的合同子表
                $scope.VO.mainContract = rows;
                $scope.mainContractGridOptions.data = rows;
                ngDialog.close();
            }
        };

        /**
        * 合同子页面 取消
        * */
        $scope.onCancels = function () {
            ngDialog.close($scope.ngDialogId);
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
        $scope.isOld = false;
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
            exporterCsvFilename: '再保险业务档案管理信息.csv',
            columnDefs: [
                {name: 'pk_project_code', displayName: '立项编号', },
                {name: 'pk_project_name', displayName: '立项名称', },
                {name: 'fbillno', displayName: '再保险档案编号',},
                {name: 'period', displayName: '所属期',},
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
                    cellFilter: 'SELECT_REINSURANCEFILETYPE1',
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
                    cellFilter: 'SELECT_REINSURANCEFILETYPE2',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.REINSURANCEFILETYPE2
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
                    $scope.junctionFilesGrid = gridApi;
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
                    cellFilter: 'SELECT_REINSURANCEFILETYPE3',
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
                    cellFilter: 'SELECT_REINSURANCEFILETYPE3',
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
            /*    {
                    name: 'issueNoticeName', displayName: '关联的出单通知书名称',enableCellEdit: false
                },*/

                {
                    name: 'cUpdate', displayName: '上载时间',enableCellEdit: false
                },
            ],
            data: $scope.VO.projectInsurance,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.projectInsuranceGrid = gridApi;
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
                    $scope.changeBillCheckGrid = gridApi;
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
                    cellFilter: 'SELECT_REINSURANCEFILETYPE4',
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

        // //单据档案中的申请
        // $scope.billApplyGridOptions = {
        //     enableCellEditOnFocus: true,
        //     cellEditableCondition: false,
        //     enableRowSelection: true,
        //     enableSelectAll: true,
        //     multiSelect: true,
        //     enableSorting: false,
        //     enableRowHeaderSelection: true,
        //     selectionRowHeaderWidth: 35,
        //     cellEditableCondition:function($rootScope){
        //         if($scope.isEdit){
        //             return true;
        //         }else{
        //             return  false;
        //         }
        //     },
        //     rowHeight: 35,
        //     columnDefs: [
        //         {
        //             name: 'file_type',
        //             displayName: '档案类型',
        //             enableCellEdit: false,
        //             cellFilter: 'SELECT_FILETYPE1',
        //             editableCellTemplate: 'ui-grid/dropdownEditor'
        //             ,
        //             editDropdownValueLabel: 'name'
        //             ,
        //             editDropdownOptionsArray: getSelectOptionData.FILETYPE1
        //         },
        //         {
        //             name: 'attachment_name', displayName: '档案名称', enableCellEdit: false
        //         },
        //
        //         {
        //             name: 'cUpdate', displayName: '上载时间', enableCellEdit: false
        //         },
        //     ],
        //     data: $scope.VO.billApply,
        //     onRegisterApi: function (gridApi) {
        //         if ($scope.downFlag) {
        //             $scope.baseFilesGrid = gridApi;
        //             $scope.downFlag = false;
        //         } else {
        //             $scope.billApplyGridOptions.gridApi = gridApi;
        //             if (gridApi.edit){
        //                 gridApi.edit.on.afterCellEdit($scope,function (rowEntity, colDef, newValue, oldValue) {
        //                     $scope.countFileStatusList();
        //                 })
        //             }
        //         }
        //         $scope.billApplyGridOptions.gridApi.core.addRowHeaderColumn({
        //             name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
        //         });
        //     }
        // };

    };

    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
    /*    if ($scope.selectTabName == 'baseFilesGridOptions'){
            $scope.isShow  = true;
        }*/
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


app.controller('pullReinsuranceDataCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
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

        $http.post($scope.archivesPath + "reinsuranceArchives/queryReinsuranceDatas", {
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
            debugger
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});
            if (rows.length>0){
                $http.post($scope.archivesPath + "reinsuranceArchives/updatePullDatePage", {
                    datas: angular.toJson($scope.VO),
                    params: angular.toJson(rows),
                }).success(function (response) {
                    if (response.code == 200) {
                        $scope.baseFilesGridOptions.data = response.VO.baseFiles;
                        $scope.junctionFilesGridOptions.data = response.VO.junctionFiles;
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
