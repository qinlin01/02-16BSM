app.controller('fictitiousArchivesCtrl', function ($rootScope, $scope,$sce, $http, $stateParams,$state, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog,$window) {
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
                insuranceProduct:[],
                baseFiles:[],
                otherBaseFiles:[],
                fictitiousClearing:[],
                clearingFiles:[],
                mainContract:[],
                uploadContractFile:[],
                internetBillFiles:[],
                endorsementFiles:[],
                dealAttachmentB:[],
                baseArchives:[],
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
        $scope.funCode = '20805';
        $scope.QUERY = $scope.initQUERY();
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
                fileName: '互联网业务档案.xls',
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
            $http.post($scope.archivesPath + "fictitiousArchives/queryForGrid",{
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

        $scope.findOne = function (id,callback) {
            $scope.id = id;
            $http.post($scope.archivesPath + "fictitiousArchives/findOne",{pk: id}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200"){
                    angular.assignData($scope.VO,response.result);
                    if (callback) {
                        callback;
                    };
                    //初始化分页
                    $scope.initTablePage($scope.VO.internetBillFiles,'internetBillFilesContainer');
                    $scope.initTablePage($scope.VO.endorsementFiles,'endorsementFilesContainer');
                    $scope.initField();
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
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $http.post($scope.archivesPath + "fictitiousArchives/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
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
            //保险经纪业务委托协议模板
            if(!$scope.VO.fileStatusList.entrustmentAgreementTemplate){
                $scope.VO.fileStatusList.entrustmentAgreementTemplate = 0;
            }
            //客户告知书模板
            if(!$scope.VO.fileStatusList.customerNotificationTemplate){
                $scope.VO.fileStatusList.customerNotificationTemplate = 0;
            }
            //保险建议书
            if(!$scope.VO.fileStatusList.insuranceProposal){
                $scope.VO.fileStatusList.insuranceProposal = 0;
            }
            //保险方案
            if(!$scope.VO.fileStatusList.insurancePlan){
                $scope.VO.fileStatusList.insurancePlan = 0;
            }
            //资金到账通知书
            if(!$scope.VO.fileStatusList.receiptNoitce){
                $scope.VO.fileStatusList.receiptNoitce = 0;
            }
            //保险公司合作谈判文件
            if(!$scope.VO.fileStatusList.cooperationTalkFile){
                $scope.VO.fileStatusList.cooperationTalkFile = 0;
            }
            //风险合规会审查材料
            if(!$scope.VO.fileStatusList.riskComplianceFile){
                $scope.VO.fileStatusList.riskComplianceFile = 0;
            }
        }

        /**
         * 表格分页方法Start
         */
        $scope.initTablePage = function (sourceData,DataContainerName) {
            $scope[DataContainerName] = {};//初始化容器
            $scope[DataContainerName].tablePageDataAll = sourceData; //要分页的全部数据
            $scope[DataContainerName].tablePageSize = 10;　　//分页大小，可以随意更改
            $scope[DataContainerName].tablePages = Math.ceil($scope[DataContainerName].tablePageDataAll.length / $scope[DataContainerName].tablePageSize); //分页数
            $scope[DataContainerName].tableNewPages = $scope[DataContainerName].tablePages > 5 ? 5 : $scope[DataContainerName].tablePages; //页面可选择的页数总数
            $scope[DataContainerName].tablePagesList = []; //可选择的页数集合
            $scope[DataContainerName].tablePageData = []; //当前显示的数据
            $scope[DataContainerName].tableSelPage = 1; //初始页码
            $scope.setTableData(DataContainerName);
            $scope.selectTablePage($scope[DataContainerName].tableSelPage,DataContainerName);
        }
        $scope.setTableData = function (DataContainerName) {
            $scope[DataContainerName].tablePageData = $scope[DataContainerName].tablePageDataAll.slice(($scope[DataContainerName].tablePageSize * ($scope[DataContainerName].tableSelPage - 1)), ($scope[DataContainerName].tableSelPage * $scope[DataContainerName].tablePageSize));//通过当前页数筛选出表格当前显示数据
        };
        $scope.selectTablePage = function (page,DataContainerName) {
            //不能小于1大于最大
            if (page < 1 || page > $scope[DataContainerName].tablePages) return;
            //最多显示分页数5
            var newpageList = [];
            if (page <= 2) {
                for (var i = 0; i < $scope[DataContainerName].tableNewPages; i++) {
                    newpageList.push(i + 1);
                }
            } else if (page > ($scope[DataContainerName].tablePages - 3)) {
                for (var i = 4; i >= 0; i--) {
                    if($scope[DataContainerName].tablePages - i > 0){
                        newpageList.push($scope[DataContainerName].tablePages - i);
                    }
                }
            } else if (page > 2) {
                for (var i = (page - 3); i < ((page + 2) > $scope[DataContainerName].tablePages ? $scope[DataContainerName].tablePages : (page + 2)); i++) {
                    if ((i + 1) > 0) {
                        newpageList.push(i + 1);
                    }
                }
            }
            $scope[DataContainerName].tablePagesList = newpageList;
            $scope[DataContainerName].tableSelPage = page;
            $scope.setTableData(DataContainerName);
            $scope.tableActivePage(page,DataContainerName);
        }
        //设置当前选中页样式
        $scope.tableActivePage = function (page,DataContainerName) {
            return $scope[DataContainerName].tableSelPage == page;
        };
        //上一页
        $scope.tablePrevious = function (DataContainerName) {
            $scope.selectTablePage($scope[DataContainerName].tableSelPage - 1,DataContainerName);
        };
        //下一页
        $scope.tableNext = function (DataContainerName) {
            $scope.selectTablePage($scope[DataContainerName].tableSelPage + 1,DataContainerName);
        };
        /**
         * 表格分页方法End
         */

        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function(item){
            if(item && item.id){
                $scope.onCard(item.id);
            }
        };

        $scope.countFileStatusList = function () {
            //结算档案
            $scope.VO.clearingFiles = $scope.clearingFilesGridOptions.data;
            $scope.VO.fileStatusList.collectPremiumAdviceForClients = 0;
            $scope.VO.fileStatusList.noticeOfPremiumPaymentOnBehalfOfCustomer = 0;
            $scope.VO.fileStatusList.businessIncomeConfirmation = 0;
            $scope.VO.fileStatusList.invoiceApplicationForm = 0;
            $scope.VO.fileStatusList.scannedInvoice = 0;
            $scope.VO.fileStatusList.receiptNoitce = 0;
            for (let i = 0; i < $scope.VO.clearingFiles.length; i++) {
                if($scope.VO.clearingFiles[i].file_type == 1) $scope.VO.fileStatusList.collectPremiumAdviceForClients++;
                if($scope.VO.clearingFiles[i].file_type == 2) $scope.VO.fileStatusList.noticeOfPremiumPaymentOnBehalfOfCustomer++;
                if($scope.VO.clearingFiles[i].file_type == 3) $scope.VO.fileStatusList.businessIncomeConfirmation++;
                if($scope.VO.clearingFiles[i].file_type == 4) $scope.VO.fileStatusList.invoiceApplicationForm++;
                if($scope.VO.clearingFiles[i].file_type == 5) $scope.VO.fileStatusList.scannedInvoice++;
                if($scope.VO.clearingFiles[i].file_type == 6) $scope.VO.fileStatusList.receiptNoitce++;
            }

            //合同附件
            var mainContractGridOptionsArray = $scope.mainContractGridOptions.data;
            var uploadContractFileGridOptionsArray = $scope.uploadContractFileGridOptions.data;
            $scope.mainContract = $scope.mainContractGridOptions.data;
            $scope.VO.fileStatusList.entrustmentContract = 0;
            $scope.VO.fileStatusList.cooperationAgreement = 0;
            $scope.VO.fileStatusList.tripartiteAgreement = 0;
            for (var i = 0; i < mainContractGridOptionsArray.length; i++) {
                if (mainContractGridOptionsArray[i].file_type == 1) $scope.VO.fileStatusList.entrustmentContract++;
                if (mainContractGridOptionsArray[i].file_type == 2) $scope.VO.fileStatusList.cooperationAgreement++;
                if (mainContractGridOptionsArray[i].file_type == 3) $scope.VO.fileStatusList.tripartiteAgreement++;
            }
            for (var i = 0; i < uploadContractFileGridOptionsArray.length; i++) {
                if (uploadContractFileGridOptionsArray[i].file_type == 1) $scope.VO.fileStatusList.entrustmentContract++;
                if (uploadContractFileGridOptionsArray[i].file_type == 2) $scope.VO.fileStatusList.cooperationAgreement++;
                if (uploadContractFileGridOptionsArray[i].file_type == 3) $scope.VO.fileStatusList.tripartiteAgreement++;
            }

            //其他附件
            var dealAttachmentBGridOptionsArray = $scope.dealAttachmentBGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $scope.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $scope.VO.fileStatusList.drawReward = 0;
            $scope.VO.fileStatusList.otherAttachments = 0;
            $scope.VO.fileStatusList.boxPictures = 0;
            $scope.VO.fileStatusList.cooperationTalkFile = 0;
            $scope.VO.fileStatusList.riskComplianceFile = 0;
            for (var i = 0; i < dealAttachmentBGridOptionsArray.length; i++) {
                if (dealAttachmentBGridOptionsArray[i].file_type == 1) $scope.VO.fileStatusList.drawReward++;
                if (dealAttachmentBGridOptionsArray[i].file_type == 2) $scope.VO.fileStatusList.otherAttachments++;
                if (dealAttachmentBGridOptionsArray[i].file_type == 3) $scope.VO.fileStatusList.boxPictures++;
                if (dealAttachmentBGridOptionsArray[i].file_type == 4) $scope.VO.fileStatusList.cooperationTalkFile++;
                if (dealAttachmentBGridOptionsArray[i].file_type == 5) $scope.VO.fileStatusList.riskComplianceFile++;
            }
            //其他合同附件
            $scope.VO.uploadContractFile = $scope.uploadContractFileGridOptions.data;
            //基础档案

            var baseArchivesGridOptionsArray = $scope.baseArchivesGridOptions.data;
            $scope.VO.baseArchives = $scope.baseArchivesGridOptions.data;
            $scope.VO.fileStatusList.entrustmentAgreementTemplate = 0;
            $scope.VO.fileStatusList.customerNotificationTemplate = 0;
            $scope.VO.fileStatusList.insuranceProposal = 0;
            $scope.VO.fileStatusList.insurancePlan = 0;
            for (var i = 0; i < baseArchivesGridOptionsArray.length; i++) {
                if (baseArchivesGridOptionsArray[i].file_type == 1) $scope.VO.fileStatusList.entrustmentAgreementTemplate++;
                if (baseArchivesGridOptionsArray[i].file_type == 2) $scope.VO.fileStatusList.customerNotificationTemplate++;
                if (baseArchivesGridOptionsArray[i].file_type == 3) $scope.VO.fileStatusList.insuranceProposal++;
                if (baseArchivesGridOptionsArray[i].file_type == 4) $scope.VO.fileStatusList.insurancePlan++;
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
                $scope.isSubDisabled = false;
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: false,
                    template: 'view/fictitiousArchives/associatedPage.html',
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
            if(!name){
                name = 'dealAttachmentBGridOptions';
            }

            if (name == "clearingFilesGridOptions"){
                $scope.aVO = {"nameArray":getSelectOptionData.CLEARINGFILETYPE };
            }else if (name == "uploadContractFileGridOptions"){
                $scope.aVO = {"nameArray":getSelectOptionData.FILETYPE4 };
            }else if(name == "baseArchivesGridOptions"){
                $scope.aVO = {"nameArray":getSelectOptionData.BASEARCHIVESTEMPLATETYPE};
            }else if(name == "dealAttachmentBGridOptions"){
                $scope.aVO = {"nameArray":getSelectOptionData.FILETYPE3};
            }else{
                $scope.aVO = {};
            }

            $scope.isSubDisabled = false;
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: getURL('insurance/view/fictitiousArchives/attachment.html'),
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
                    if (!$scope[name].data) {
                        $scope[name].data = [];
                    }
                    angular.forEach(value, function (item) {
                        if(name == 'uploadContractFileGridOptions'){
                            let appendices = {};
                            appendices.source = "手动上传";
                            appendices.TEXT_NAME = item.attachment_name;
                            appendices.pk_project_id = item.pk_project_id;
                            appendices.file_type = item.file_type;
                            $scope[name].data.push(appendices);
                        }else{
                            item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                            $scope[name].data.push(item);
                        }
                    });
                    $scope.countFileStatusList();
                }
            }, function (reason) {

            });

        };

        $scope.onDownLoads = function(id){
            var data =[];
            if ($scope.downCommon($scope.VO.baseArchives,0)||$scope.downCommon($scope.VO.clearingFiles,1)||$scope.downCommon($scope.VO.uploadContractFile,2)||$scope.downCommon($scope.VO.dealAttachmentB,3)){
                data.push($scope.downCommon($scope.VO.baseArchives,0,true),$scope.downCommon($scope.VO.clearingFiles,1,true),$scope.downCommon($scope.VO.uploadContractFile,2,false),$scope.downCommon($scope.VO.dealAttachmentB,3,false));
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
        $scope.downCommon = function(row,type,grouping){
            var tableName=["基础档案","结算档案","其他合同附件","其他附件"];
            var fileName=[getSelectOptionData.BASEARCHIVESTEMPLATETYPE,getSelectOptionData.CLEARINGFILETYPE,getSelectOptionData.FILETYPE4,getSelectOptionData.FILETYPE3];
            var returnData={};
            returnData.name=tableName[type];
            returnData.value=[];
            var fileList = fileName[type];
            for (var i = 0; i < row.length; i++) {
                if (grouping) {
                    for (var j = 0; j < fileList.length; j++) {
                        if (fileList[j].id == row[i].file_type) {
                            var jsonData = {};
                            jsonData.name = fileList[j].name;
                            var ids = {};
                            ids.pk_project_id = row[i].pk_project_id;
                            ids.attachment_name = row[i].attachment_name;
                            ids.file_type = row[i].file_type;
                            jsonData.value = [];
                            jsonData.value.push(ids);
                            var ifAdd = true;
                            for (var k = 0; k < returnData.value.length; k++) {
                                if (returnData.value[k].name == fileList[j].name) {
                                    returnData.value[k].value.push(ids);
                                    ifAdd = false;
                                }
                            }
                            if (ifAdd) {
                                returnData.value.push(jsonData);
                            }
                        }
                    }
                } else {
                    var ids = {};
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
         * 更新相关所有数据
         * */
        $scope.onPullData = function (data) {
            if(data && data.id){
                layer.load(2);
                $http.post($scope.archivesPath + "fictitiousArchives/updateData", {
                    id: data.id
                }).success(function (response) {
                    layer.closeAll('loading');
                    if (response.code == 200){
                        $scope.findOne(data.id);
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                });
            }else{
                layer.alert("所选更新的数据无效！", {skin: 'layui-layer-lan', closeBtn: 1});
            }
        };


        /**
         * 保存
         * */

        $scope.onSave = function (data) {
            $scope.countFileStatusList();
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
                layer.load(2);
                data=$scope.VO;
                data.fbillstatus=1;
                var tablename = $scope.table_name;
                $http.post($scope.archivesPath  + "fictitiousArchives/save",{data:angular.toJson(data),tablename:tablename}).success(function(response) {
                    layer.closeAll('loading');
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
                        if ($scope.VO.c1Execitem == undefined || $scope.VO.c1Execitem == ''){
                            ifN =true;
                            return layer.alert("业务状态为终止时，请填写备注!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }

                    }
                    if ($scope.VO.bussinessStatus == 1){
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
                        if ($scope.VO.fileStatusList.receiptNoitce == 0) {
                            ifN = true;
                            return layer.alert("请上传资金到账通知书!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.fileStatusList.customerNotificationTemplate == 0) {
                            ifN = true;
                            return layer.alert("请上传客户告知书模板!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.fileStatusList.entrustmentAgreementTemplate == 0) {
                            ifN = true;
                            return layer.alert("请上传保险经纪业务委托协议模板!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.VO.fileStatusList.cooperationTalkFile == 0) {
                            ifN = true;
                            return layer.alert("请上传保险公司合作谈判文件!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if($scope.VO.uploadContractFile){
                            for (let i =0 ;i<$scope.VO.uploadContractFile.length;i++){
                                if($scope.VO.uploadContractFile[i].file_type==""){
                                    return layer.alert("请选择合同类型!",{skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if ($scope.VO.uploadContractFile[i].source == "手动上传" && $scope.VO.uploadContractFile[i].CONTRACTNAME == "") {
                                    return layer.alert("请填写合同名称!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if ($scope.VO.uploadContractFile[i].source == "手动上传" && $scope.VO.uploadContractFile[i].CONTRACTCOUNTERPARTINFORMATION == "") {
                                    return layer.alert("请填写合同对方信息!", {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            }
                        }
                        if($scope.VO.fileStatusList.businessIncomeConfirmation < $scope.VO.fileStatusList.fictitiousClearing || $scope.VO.fileStatusList.invoiceApplicationForm < $scope.VO.fileStatusList.fictitiousClearing){
                            return layer.alert("“业务收入确认书”和“发票开具申请单”各自的份数必须大于或等于结算对账单的总份数!", {skin: 'layui-layer-lan', closeBtn: 1});
                        }

                        let countNum = 0;
                        countNum = $scope.VO.fileStatusList.insurancePlan + $scope.VO.fileStatusList.insuranceProposal + $scope.VO.fileStatusList.insuranceClause;
                        if(!countNum || countNum <= 0){
                            return layer.alert("保险条款，保险建议书，保险方案三者至少上传其中一个!", {skin: 'layui-layer-lan', closeBtn: 1});
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
            var delRow = $scope[name].gridApi.selection.getSelectedRows();
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (var i = 0; i < $scope[name].data.length; i++) {
                for (var j = 0; j < delRow.length; j++) {
                    if ($scope[name].data[i].$$hashKey == delRow[j].$$hashKey) {
                            $scope[name].data.splice(i, 1);
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

        //保险产品
        $scope.insuranceProductGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '保险产品.csv',
            columnDefs: [
                {name: 'fictitiousBusinessType', displayName: '互联网产品类型'},
                {name: 'insuranceManProduct', displayName: '产品名称'},
                {name: 'insuranceMan', displayName: '保险公司'},
                {name: 'startDate', displayName: '生效日期'},
                {name: 'endDate', displayName: '失效日期'},
            ],
            data: $scope.VO.insuranceProduct,
        };
        $scope.insuranceProductGridOptions.onRegisterApi = function (gridApi) {
            $scope.insuranceProductGridOptions.gridApi = gridApi;
        }

        //基础档案
        $scope.baseFilesGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '保险产品.csv',
            columnDefs: [
                {name: 'archivesType', displayName: '档案类型'},
                {name: 'archivesName', displayName: '档案名称'},
                {name: 'fictitiousBusinessType', displayName: '互联网产品类型'},
                {name: 'insuranceManProduct', displayName: '产品名称'},
            ],
            data: $scope.VO.baseFiles,
        };
        $scope.baseFilesGridOptions.onRegisterApi = function (gridApi) {
            $scope.baseFilesGridOptions.gridApi = gridApi;
        }

        //其他基础档案
        $scope.otherBaseFilesGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '保险产品.csv',
            columnDefs: [
                {name: 'archivesType', displayName: '档案类型'},
                {name: 'archivesName', displayName: '档案名称'},
                {name: 'updateTime', displayName: '更新时间'},
            ],
            data: $scope.VO.otherBaseFiles,
        };
        $scope.otherBaseFilesGridOptions.onRegisterApi = function (gridApi) {
            $scope.otherBaseFilesGridOptions.gridApi = gridApi;
        }

        //结算对账单
        $scope.fictitiousClearingGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '结算对账单.csv',
            columnDefs: [
                {name: 'archivesName', displayName: '档案名称'},
                {name: 'updateTime', displayName: '上载时间'},
            ],
            data: $scope.VO.fictitiousClearing,
        };
        $scope.fictitiousClearingGridOptions.onRegisterApi = function (gridApi) {
            $scope.fictitiousClearingGridOptions.gridApi = gridApi;
        }

        //保单附件
        $scope.internetBillFilesGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '保单附件.csv',
            columnDefs: [
                {name: 'insuranceinfono', displayName: '保单信息编号'},
                {name: 'insuranceno', displayName: '保单号'},
                {name: 'fileName', displayName: '保单附件'},
                {name: 'fictitiousBillName', displayName: '关联的对账单名称'},
                {name: 'fictitiousBusinessType', displayName: '互联网产品类型'},
            ],
            data: $scope.VO.internetBillFiles,
        };
        $scope.internetBillFilesGridOptions.onRegisterApi = function (gridApi) {
            $scope.internetBillFilesGridOptions.gridApi = gridApi;
        }

        //批单附件
        $scope.endorsementFilesGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '批单附件.csv',
            columnDefs: [
                {name: 'vbillno', displayName: '批单信息编号'},
                {name: 'insurancecheckno', displayName: '批单号'},
                {name: 'fileName', displayName: '批单附件'},
                {name: 'insuranceno', displayName: '关联保单号'},
                {name: 'endorsementsCode', displayName: '批单对账单信息编号'},
                {name: 'fictitiousBusinessType', displayName: '互联网产品类型'},
            ],
            data: $scope.VO.endorsementFiles,
        };
        $scope.endorsementFilesGridOptions.onRegisterApi = function (gridApi) {
            $scope.endorsementFilesGridOptions.gridApi = gridApi;
        }

        //结算档案
        $scope.clearingFilesGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '结算档案.csv',
            columnDefs: [
                {
                    name: 'file_type',
                    displayName: '档案类型',
                    enableCellEdit: false,
                    cellFilter: 'SELECT_CLEARINGFILETYPE',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.CLEARINGFILETYPE
                },
                {name: 'attachment_name', displayName: '档案名称', enableCellEdit: false},
                {
                    name: 'cUpdate', displayName: '上载时间',enableCellEdit: false
                },
            ],
            data: $scope.VO.clearingFiles,
        };
        $scope.clearingFilesGridOptions.onRegisterApi = function (gridApi) {
            $scope.clearingFilesGridOptions.gridApi = gridApi;
        }

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
                    editDropdownOptionsArray: getSelectOptionData.FILETYPE4
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
                    enableCellEdit: false,
                    cellFilter: 'SELECT_FILETYPE4',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.FILETYPE4
                },

                {
                    name: 'CONTRACTNUMBER', displayName: '合同编号',
                    enableCellEdit: true,
                    cellEditableCondition: function ($scope, row) {
                        return $scope.row.entity.source == '手动上传';
                    }
                },

                {
                    name: 'CONTRACTNAME', displayName: '合同名称',
                    enableCellEdit: true,
                    cellEditableCondition: function ($scope, row) {
                        return $scope.row.entity.source == '手动上传';
                    }
                },
                {
                    name: 'CONTRACTCOUNTERPARTINFORMATION', displayName: '合同对方信息',
                    enableCellEdit: true,
                    cellEditableCondition: function ($scope, row) {
                        return $scope.row.entity.source == '手动上传';
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
                    enableCellEdit: false,
                    cellFilter: 'SELECT_FILETYPE3',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.FILETYPE3
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
        //合同弹窗
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

        //基础档案
        $scope.baseArchivesGridOptions = {
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
                    cellFilter: 'SELECT_BASEARCHIVESTEMPLATETYPE',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.BASEARCHIVESTEMPLATETYPE
                },
                {
                    name: 'attachment_name', displayName: '档案名称', enableCellEdit: false
                },

                {
                    name: 'cUpdate', displayName: '上载时间', enableCellEdit: false
                },
            ],
            data: $scope.VO.baseArchives,
            onRegisterApi: function (gridApi) {
                if ($scope.downFlag) {
                    $scope.baseFilesGrid = gridApi;
                    $scope.downFlag = false;
                } else {
                    $scope.baseArchivesGridOptions.gridApi = gridApi;
                    if (gridApi.edit){
                        gridApi.edit.on.afterCellEdit($scope,function (rowEntity, colDef, newValue, oldValue) {
                            $scope.countFileStatusList();
                        })
                    }
                }
                $scope.baseArchivesGridOptions.gridApi.core.addRowHeaderColumn({
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
