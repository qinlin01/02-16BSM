app.controller('logManagerCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                revertFileName:[]
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            //return {operateDate: new Date().format("yyyy-MM-dd")}
            // $http.post($scope.basePath + "validate/getlog", {
            //     data:encryptByDES('LogManagerController','12345678')
            // });
            return {
                sort_rule:'时间降序'
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
            // if(!findImpData(data)){
            //     return false;
            // }
            layer.load(2);
            $http.post($scope.basePath + "logManager/queryForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize
                // fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response.code == 200) {
                    if (!$scope.query) {
                        $scope.query = $scope.gridOptions.columnDefs;
                    }
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            });
        };
        $scope.queryAllForGrid = function (data) {
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.basePath + "logManager/queryAllForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData),
            }).success(function (response) {
                    let data = angular.fromJson(SM2Decrypt(response));
                    window.open($rootScope.basePath + "uploadFile/downLoadByUrl?url=" + encodeURI(encodeURI(data.downPath)));
                    layer.closeAll('loading');
                }).error(function () {
                    layer.closeAll('loading');
                });
        };
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + "user/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
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
                    //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
        $scope.onWatchRecordSize = function () {
            $http.post($scope.basePath + "logManager/onWatchRecordSize",{}).success(function (response) {
                if (response && response.code == "200") {
                    $scope.VO.currentSize = response.currentSize;
                }
            });
        };
        $scope.onBackup = function () {
            layer.load(2);
            $http.post($scope.basePath + "logManager/onBackUp",{}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
        $scope.onRevert = function () {
            // if ($scope.VO.revertFileName == null ||"" == $scope.VO.revertFileName) return layer.alert("请输入要还原的文件名!", {
            //     skin: 'layui-layer-lan',
            //     closeBtn: 1
            // });
            layer.load(2);
            $http.post($scope.basePath + "logManager/onBeforeRevert",{revertBeginDate: $scope.VO.revertBeginDate,revertEndDate:$scope.VO.revertEndDate}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };
    };

    $scope.initFunction = function () {
    };

    $scope.initWatch = function () {

    };

    $scope.initButton = function () {

        $scope.onImport = function () {
            $scope.isSubDisabled = false;

            $scope.aVO = {};
            /*else {
             $scope.bVO = {};
             }*/
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/common/attachmentLog.html',
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

            }, function (reason) {

            });
        };
        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };
        $scope.onReset = function () {
            $scope.onWatchRecordSize();
            $scope.QUERY = $scope.initQUERY();
            $scope.QUERY.id = null;
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
                    // var ids = [];
                    // for (var i = 0; i < rows.length; i++) {
                    //     ids.push(rows[i]._id);
                    // }
                    layer.load(2);
                    $http.post($scope.basePath + "logManager/delete", {ids: angular.toJson(rows)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg('删除成功!', {
                                icon: 1
                            });
                        } else {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg(response.msg, {
                                icon: 1
                            });
                        }

                    });
                }
            );
        };
    };

    $scope.initPage = function () {
        $scope.onWatchRecordSize();
        $scope.form = false;
        $scope.card = false;

        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;

        $scope.gridOptions = {
            rowTemplate: "<div ng-dblclick=\"grid.appScope.onRowDblClick(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>",
            data: [],
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [500, 1000],
            paginationPageSize: 500,
            useExternalPagination: true,
            enableColumnMoving: true,
            enableGridMenu: true,
            exporterMenuCsv: true,
            exporterOlderExcelCompatibility: false,
            exporterCsvFilename: '系统日志.csv',
            columnDefs: [
                {name: 'nodeName', displayName: '功能节点名称', width: 100},
                {name: 'describe', displayName: '亊件描述', width: 100},
                {name: 'exeResult', displayName: '亊件结果', width: 100,},
                {name: 'ip', displayName: '客户端IP', width: 100,},
                {name: 'pkOperator.name', displayName: '操作人', width: 100,},
                {name: 'pkOperator.code', displayName: '操作人编码', width: 100,},
                {name: 'operateDate', displayName: '亊件日期', width: 100,},
                {name: 'operateTime', displayName: '亊件时间', width: 100,},
                {name: 'pkOrg.name', displayName: '机构', width: 100,},
                {name: 'pkDept.name', displayName: '部门', width: 100,},
                {name: 'auditClassify', displayName: '事件类型', width: 100,},
                {name: 'operate', displayName: '操作类型', width: 100,cellFilter:'SELECT_OPERATE'},
                //{name: 'isBackUp', displayName: '是否已备份', width: 100,}
            ],
            exporterAllDataFn: function () {
                $scope.queryAllForGrid($scope.QUERY);
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
        };


        if ($stateParams.pk != null) {
            $scope.queryForGrid({});
        }

        $scope.queryForGrid();
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
    };

    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();


});
app.controller('dealAppAttachmentLogCtrl', ['$scope', '$rootScope', '$http', '$location', 'ngDialog', 'FileUploader', 'ngVerify', function ($scope, $rootScope, $http, $location, ngDialog, FileUploader, ngVerify) {
    /**
     * 初始化页面变更方法
     */
    $scope.initPage = function () {
        $scope.ref = {
            pk: '0001AA100000000GQYSH',
            code: 'YX000',
            name: '附件'
        };
        $scope.delVO = [];
        $scope.delItems = [];
        $scope.VOs = [];
        $scope.subData = {};
        $scope.isCanUpLoad = false;
        //  控制是否可以上传附件
        // if ($scope.VO.billstatus == $rootScope.SELECT.BILL_STATUS[2].id) {
        //     $scope.isCanUpLoad = true;
        // } else {
        //     $scope.isCanUpLoad = false;
        // }


    };

    /**
     * 初始化按钮事件
     */
    $scope.initButton = function () {
        /**
         * 保存
         */
        $scope.onSubSave = function () {
            ngVerify.check('dealAttachmentsForm', function (errEls) {
                if (errEls && errEls.length) {
                    return angular.alert($rootScope.getDisName("请先填写所有必输项", "!"),
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    if (!($scope.VOs.length > 0)) {
                        //   回写附件来源类型f
                        $scope.aVO.source_billtypeVO = {
                            bill_name: '国网客户信息',
                        };
                        //   回写附件上传人
                        $scope.aVO.upload_operator = {
                            name: $rootScope.userVO.name,
                            pk: $rootScope.userVO.pk
                        }
                        //   回写附件上传时间
                        /* $scope.aVO.operate_date = new Date().format('yyyy-MM-dd');*/
                        $scope.aVO.upload_date = $rootScope.workDate;
                        $scope.aVO.attachment_source = $rootScope.SELECT.ATTACHMENT_SOURCE[1].id;
                        $scope.$parent.confirm($scope.aVO);
                    } else {
                        /* if ($scope.delVO.length > 0) {
                         var index = 0;
                         for(var i=0;i<$scope.delVO.length;i++){
                         if($scope.delVO[i]==null){
                         index = index +1;
                         }
                         }
                         if(index!=$scope.delVO.length){
                         $scope.$parent.delVO;
                         $scope.VOs=[];
                         for(var i=0;i<$scope.delVO.length;i++){
                         if($scope.delVO[i]!=null){
                         $scope.VOs.push($scope.delVO[i]);
                         }
                         }
                         }

                         }*/
                        $scope.tmpVO = [];
                        angular.forEach($scope.VOs, function (item) {
                            $scope.flag = false;
                            for (var j = 0; j < $scope.delItems.length; j++) {
                                if (item.pk_project_id == $scope.delItems[j].pk_project_id) {
                                    $scope.flag = true;
                                    return;
                                }
                            }
                            if ($scope.flag == true) {
                                //noinspection JSAnnotator
                                return;
                            }
                            if (item != null && item) {
                                item.source_billtypeVO = {
                                    bill_name: '国网客户信息'
                                };
                                item.upload_operator = {
                                    name: $rootScope.userVO.name,
                                    pk: $rootScope.userVO.pk
                                }
                                item.attachment_source = $rootScope.SELECT.ATTACHMENT_SOURCE[1].id;
                                item.upload_date = new Date().format("yyyy-MM-dd HH:mm:ss");
                                $scope.tmpVO.push(item);

                            }

                        });
                        $scope.VOs = [];
                        angular.assignData($scope.VOs, $scope.tmpVO)
                        $scope.$parent.confirm($scope.VOs);
                        $scope.VOs = [];
                    }
                    ngDialog.close();
                }
            }, true);

        };
        /**
         * 取消
         */
        $scope.onSubCancel = function () {
            angular.assignData($scope.aVO, $scope.subData);
            ngDialog.close();
        };
    };

    /**
     * 初始化弹窗form的VO
     */
    $scope.initVO = function () {
        if ($scope.$parent && $scope.$parent.aVO) {
            //载体类型
            // $scope.$parent.aVO.carrier_type = $rootScope.SELECT.CARRIER_TYPE[0].id;
            // $scope.$parent.aVO.doc_type = $rootScope.SELECT.DOC_TYPE[1].id;
            // $scope.$parent.aVO.attachment_source = $rootScope.SELECT.ATTACHMENT_SOURCE[1].id;
            $scope.subData = angular.copy($scope.$parent.aVO);
        } else {
            $scope.$parent.aVO = null;
            // $scope.$parent.aVO.carrier_type = $rootScope.SELECT.CARRIER_TYPE[0].id;
            // $scope.$parent.aVO.doc_type = $rootScope.SELECT.DOC_TYPE[1].id;
            // $scope.$parent.aVO.attachment_source = $rootScope.SELECT.ATTACHMENT_SOURCE[1].id;
            $scope.subData = angular.copy($scope.$parent.aVO);
        }
        return $scope.subData;
    };
    $scope.ifSession = function () {

    }
    // $scope.ifSession();
    $scope.initButton();
    $scope.initPage();
    $scope.aVO = $scope.initVO();

}]);
