/**
 * Created by 孙立坤 on 2021/12/22.
 */
app.controller('tripartiteAgreementCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                dealattachmentb: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                ourUser: $rootScope.userVO,
                ourOrg: $rootScope.orgVO,
                ourDept: $rootScope.deptVO,
                agreementOrg: $rootScope.orgVO,
                billstatus: 31,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                createTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                customerType: 3,
                term: 0,
                ifContainChildren: 0,
                ifLongTime :1,
                contract: null,
                customer: null,
                agreementStart: null,
                agreementEnd: null,
                effectiveRange: {},
                remark: null,
                dr: 0,
                billType: 'tripartite',
                effectiveRangeAll: false,
                tripartiteCustomerType: 1,
                tripartiteCustomer: null,
                tripartiteIfContainChildren: 0,
                cooperationCustomerArray: [{customerType: 3, ifContainChildren: 0, canDel: false}]
            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.orgRows = [];
        //续签信息
        $scope.renewRows = [];
        $scope.c1Type = 1;
        //初始化查询
        $scope.initQUERY = function () {
            return {
                bill_type: 'tripartite',
            }
        };
        $scope.funCode ='21503';
        $scope.QUERY = $scope.initQUERY();
        $scope.isXq = true;
        $scope.onReset = function () {
            $scope.QUERY = $scope.initQUERY();
        };
    };

    $scope.initHttp = function () {

        //更新数据
        $scope.onGenerateData = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert("请选择至少一条数据进行更新!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
                ids.push(rows[i].id);
            }
            layer.load(2);
            $http.post($scope.basePath + "agreement/generateData",{ids:angular.toJson(ids)}).success(function (response) {
                layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                layer.closeAll('loading');
            });
        };

        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "agreement/queryForGrid", {
                params: angular.toJson(data),
                current: $scope.gridApi.page ? $scope.gridApi.page : 1,
                size: $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100,
            }).success(function (response) {
                if (response.code == 200) {
                    $scope.gridOptions.data = response.data.records;
                    $scope.gridOptions.totalItems = response.data.total;
                }
                layer.closeAll('loading');
            });
        };
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + "agreement/findOne", {id: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.data);
                    $scope.VO.effectiveRange = angular.fromJson($scope.VO.effectiveRange)
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
        $scope.orgRef = function () {
            $http.post($scope.basePath + "orgRef/queryForGridAll", {pageSize: 1000}).success(function (response) {
                if (response && response.code == 200 && response.result) {
                    $scope.orgRows = response.result.Rows;
                    // $scope.sumEffectiveRange();
                    $scope.changeCheckbox();
                } else {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        }
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $http({
                method: "POST",
                url: $rootScope.basePath + "agreement/save",
                data: angular.toJson($scope.VO),
                headers: {'Content-Type': 'application/json;charset=UTF-8'},
            }).success(function (response) {
                if (response && response.code == 200) {
                    $scope.isXq = true;
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isEdit = false;
                    $scope.isDisabled = true;
                    angular.assignData($scope.VO, response.result);
                    $scope.VO.effectiveRange = angular.fromJson($scope.VO.effectiveRange);
                    $scope.changeCheckbox();
                    layer.closeAll('loading');
                    $scope.isSubEdit = false;
                    $scope.onCard($scope.VO.id);
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
                }
            });
        };
        /**
         * 暂存
         */
        $scope.onTemporary = function (data) {
            if (data) {
                $scope.VO.billstatus = 37;
                $scope.onSaveVO();
            }
        }
    };

    $scope.initFunction = function () {

        $scope.checkboxChoosed = function (item) {
            if($scope.VO.effectiveRange[item.pk]){
                for (let i = 0; i < $scope.orgRows.length; i++) {
                    if($scope.orgRows[i].pk != item.pk){
                        $scope.VO.effectiveRange[$scope.orgRows[i].pk] = false;
                    }
                }
            }
        }

        $scope.stringToDate = function (dateStr) {
            if (!dateStr || !angular.isString(dateStr)) {
                return;
            }
            var dateStr = dateStr.replace(/-/g, "/");//现将yyyy-MM-dd类型转换为yyyy/MM/dd
            var dateTime = Date.parse(dateStr);//将日期字符串转换为表示日期的秒数
            //注意：Date.parse(dateStr)默认情况下只能转换：月/日/年 格式的字符串，但是经测试年/月/日格式的字符串也能被解析
            var data = new Date(dateTime);//将日期秒数转换为日期格式
            return data;
        }
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function (item) {
            if (item && item.id) {
                $scope.isXq = false;
                $scope.onCard(item.id);
            }
        };
    };
    $scope.ifChangeCheckbox = false;
    $scope.ifsumEffectiveRange = false;
    $scope.sumEffectiveRange = function () {
        if (!$scope.ifChangeCheckbox) {
            $scope.ifsumEffectiveRange = true;
            if ($scope.VO.effectiveRangeAll) {
                angular.forEach($scope.orgRows, function (item) {
                    $scope.VO.effectiveRange[item.pk] = true;
                });
            } else {
                angular.forEach($scope.orgRows, function (item) {
                    $scope.VO.effectiveRange[item.pk] = false;
                });
            }
        }
        $scope.ifChangeCheckbox = false;
    }
    $scope.changeCheckbox = function () {
        if (!$scope.ifsumEffectiveRange) {
            var ifAll = true;
            angular.forEach($scope.orgRows, function (item) {
                if (!$scope.VO.effectiveRange[item.pk]) {
                    ifAll = false;
                }
            });
            $scope.ifChangeCheckbox = true;
            $scope.VO.effectiveRangeAll = ifAll;
        }
        $scope.ifsumEffectiveRange = false;
    }
    $scope.initWatch = function () {

        $scope.$watch('VO.effectiveRangeAll', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.sumEffectiveRange();
            }
        }, true);

        $scope.$watch('VO.effectiveRange', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                // $scope.changeCheckbox();
            }
        }, true);

        $scope.$watch('VO.tripartiteCustomerType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            $scope.VO.tripartiteCustomer = null;
            if (newVal == 1) {
                $scope.c1Type = 1;
            } else {
                $scope.c1Type = 2;
            }
        }, true);

        $scope.$watch('VO.agreementStart', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.changeDate();
            }
        }, true);

        $scope.$watch('VO.agreementEnd', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.changeDate();
            }
        }, true);

        $scope.changeDate = function () {
            var endDateTime = $scope.stringToDate($scope.VO.agreementEnd);
            var startDateTime = $scope.stringToDate($scope.VO.agreementStart);
            $scope.VO.term = parseInt(parseInt(Math.abs(endDateTime - startDateTime) / 1000 / 60 / 60 / 24) / 30);
        }
    };

    $scope.initButton = function () {

        /**
         * 删除一个合作单位
         */
        $scope.cooperationCustomer = function (nowNumber) {
            layer.confirm('请确认是否要删除此合作单位？', {
                    btn: ['确定', '取消'], //按钮
                    btn2: function (index, layero) {
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    $scope.VO.cooperationCustomerArray.splice(nowNumber,1);
                    $scope.$apply();
                    layer.close(layer.index);
                }
            );
        };

        /**
         * 增加一个合作单位
         */
        $scope.onAddCooperationCustomer = function (){
            var cooperationCustomer = {
                customerType:3,
                ifContainChildren:0,
                canDel:true
            };
            $scope.VO.cooperationCustomerArray.push(cooperationCustomer);
        }

        /*
         * 随时上传附件功能
         * */
        $scope.onUploadAnyTime = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $scope.isSubDisabled = false;
            $scope.aVO = {};
            $http.post($scope.basePath + "common/getFileType", {
                id: rows[0].id,
                tableName: $scope.table_name,
                ifEntity: $scope.ifEntity,
                entityVO: $scope.entityVO
            }).success(function (response) {
                $scope.VO = response.data;
                //实体类字段同步
                $scope.VO.dealAttachmentB = $scope.VO.dealattachmentb;
                $scope.filetype = response.filetype;
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: false,
                    template: 'view/uploadAnyTime.html',
                    className: 'ngdialog-theme-formInfo',
                    scope: $scope,
                    rootScope: $rootScope,
                    preCloseCallback: function (value) {
                        layer.load(2);
                        if ($rootScope.submitAnyTime) {
                            $http.post($scope.basePath + "common/uploadAnyTime", {
                                data: angular.toJson($scope.VO),
                                tableName: $scope.table_name,
                                ifEntity: $scope.ifEntity
                            }).success(function (response) {
                                layer.closeAll('loading');
                                if (response && response.code == 200) {
                                    layer.alert("附件上传成功！")
                                }
                                if (response && response.code == 500) {
                                    layer.alert("系统异常！")
                                }
                            });
                            rows[0] = $scope.VO;
                            $rootScope.submitAnyTime = false;
                        }
                        $scope.VO = $scope.initVO();
                        layer.closeAll('loading');
                        return true;
                    }
                }).then(function (value) {
                }, function (reason) {
                });
            });
        };

        $scope.onUploads = function () {
            $scope.isSubDisabled = false;
            $scope.array = $rootScope.arrayToTree($rootScope.SELECT.DOUCUMENTTYPE);
            $scope.aVO = {};
            /*else {
             $scope.bVO = {};
             }*/
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
                            if ($scope.VO.fileType) {
                                item.file_type = $scope.VO.fileType.id;
                            }
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });
                    } else {
                        angular.forEach(value, function (item) {
                            if ($scope.VO.fileType) {
                                item.file_type = $scope.VO.fileType.id;
                            }
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });
                    }


                }
            }, function (reason) {

            });
        };

        $scope.onDownLoads = function () {
            var rows = $scope.dealAttachmentBGridOptions.gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return angular.alert("请选择一条数据进行操作！");
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
                ids.push(rows[i].pk_project_id);
            }
            var exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };
        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
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
                $scope.findOne(rows[0].id, function (response) {
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isEdit = false;
                    $scope.isDisabled = true;
                });
            }
        };

        $scope.onAdd = function () {
            $scope.form = true;
            $scope.isClear = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.orgRef();
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
            if($scope.VO.pkOrg.pk != '1002'){
                $scope.VO.effectiveRange[$scope.VO.pkOrg.pk] = true;
            }
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
                $scope.form = true;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id);
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
                $scope.orgRef();
            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            }
        };
        /**
         * 卡片
         */
        $scope.onCard = function (id) {
            if (!id) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) {
                    return layer.alert("请选择一条数据进行查看!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
                id = rows[0].id;
            }
            $scope.orgRef();
            //查看协议状态
            $http.post($scope.basePath + "agreement/findXqStatus", {id: id}).success(function (response) {
                if (response && response.code == "200") {
                    $scope.isXq = false;
                    if(response.msg == "400"){
                        $scope.isXq = true;
                    }
                }
            });

            $http.post($scope.basePath + "agreement/findOne", {id: id}).success(function (response) {
                if (response && response.code == "200") {
                    $scope.card = true;
                    angular.assignData($scope.VO, response.data);
                    $scope.renewRows = response.data.renewArray;
                    $scope.VO.effectiveRange = angular.fromJson($scope.VO.effectiveRange)
                    $scope.isBack = false;
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
        $scope.onRenew = function (){
            // 获取 要修改的 id $stateParams.id  通过路由的方法
            //控制页面只能编辑到期时间
            $scope.findOne($stateParams.id);

            layer.confirm('是否续签？', {
                    btn: ['续签', '返回'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消续签!', {
                            shift: 6,
                            icon: 11
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    //获取当前对象结束时间的时间戳并加上一年
                    let endDate = $scope.VO.agreementEnd.valueOf() + 31536000000;
                    //转换格式
                    $scope.VO.agreementEnd= new Date(endDate).format("yyyy-MM-dd");
                    alert($scope.VO.agreementEnd);
                    $scope.onSaveVO();
                }
            );
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
                    $http.post($scope.basePath + "agreement/delete", {ids: angular.toJson(ids)}).success(function (response) {
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

        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            if ($scope.isClear) {
                $scope.VO = $scope.initVO();
            }
            $scope.isDisabled = true;
            $scope.isEdit = false;
            $scope.isBack = false;
        };
        /**
         * 返回
         */
        $scope.onBack = function () {
            if($stateParams.id) {
                $scope.isXq = true;
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
        };
        /**
         * 保存判断必输项
         */
        $scope.onSave = function () {
            ngVerify.check('tripartiteAgreement', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    if ($scope.VO.ourOrg.pk == '1002' && $scope.VO.effectiveRange != null) {
                        var effectiveRange = false;
                        Object.keys($scope.VO.effectiveRange).forEach((key) => {
                            if ($scope.VO.effectiveRange[key] == true) {
                                effectiveRange = true;
                            }
                        });
                        if (!effectiveRange) {
                            return layer.alert("请选择协议范围!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    // layer.confirm('保存成功之后协议内容将不可变更，是否进行保存？', {
                    //         btn: ['保存', '取消'], //按钮
                    //         btn2: function (index, layero) {
                    //         },
                    //         shade: 0.6,//遮罩透明度
                    //         shadeClose: true,//点击遮罩关闭层
                    //     },
                    //     function () {
                    //         layer.load(2);
                    //         $scope.VO.billstatus = 1;
                    //         $scope.onSaveVO();
                    //     }
                    // );
                    $scope.VO.billstatus = 31;
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

        /**
         * 子表删除
         */
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
    };

    $scope.initPage = function () {
        $scope.isXq = true;
        $scope.form = false;
        $scope.card = false;
        $scope.isClear = false;
        //控制附件上传和下载
        $scope.upOrDown = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;

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
            exporterCsvFilename: '签署保险经济业务委托合同.csv',
            columnDefs: [
                {name: 'contract.code', displayName: '协议编号', width: 200,},
                {name: 'contract.name', displayName: '协议名称', width: 200,},
                {name: 'agreementStart', displayName: '协议起始日期', width: 100,},
                {name: 'agreementEnd', displayName: '协议结束日期', width: 100,},
                {name: 'term', displayName: '有效期(月)', width: 100,},
                {name: 'tripartiteCustomerType', displayName: '客户类型', width: 100, cellFilter: 'SELECT_CUSTOMERAGREEMENTTYPE'},
                {name: 'tripartiteCustomer.name', displayName: '客户名称', width: 200},
                {name: 'tripartiteCustomer.code', displayName: '客户信息编码', width: 150},
                {name: 'tripartiteIfContainChildren', displayName: '是否包含下级单位', width: 100, cellFilter: 'SELECT_ISEQUALZERO'},
                {name: 'billstatus', displayName: '数据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'signDate', displayName: '签署日期', width: 100,},
                {name: 'effctDate', displayName: '生效日期', width: 100,},
                {name: 'ourOrg.name', displayName: '业务单位', width: 100,},
                {name: 'ourDept.name', displayName: '业务部门', width: 100,},
                {name: 'ourUser.name', displayName: '业务经办人', width: 100,},

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
                    if (!$scope.chilbTable) {
                        $scope.chilbTable = true;
                    }
                    angular.assignData($scope.VO, row.entity);
                    $scope.findOne(rows[0].id);
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
                {
                    name: 'file_type',
                    displayName: '附件类型',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_TRAGREEMENTFILETYPE',
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownValueLabel: 'name',
                    editDropdownOptionsArray: getSelectOptionData.DOUCUMENTTYPE
                },
                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},
                {name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false},
                {
                    name: 'pk_project_id',
                    displayName: '操作',
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ng-click="grid.appScope.onPreviewFile(row.entity.pk_project_id,row.entity.attachment_name)" class="btn btn-transparent btn-xs tooltips" tooltip-placement="top">在线预览&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i></a></div>'
                }
            ],
            data: $scope.VO.dealattachmentb,
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

        if ($stateParams.pk != null) {
            $scope.queryForGrid($scope.QUERY);
        }
        if ($stateParams.id) {
            $scope.isXq = false;
            $scope.onCard($stateParams.id);
        }
    };

    $scope.ifEntity = "true";
    $scope.entityVO = "lr.insurance.vo.AgreementVO";
    $scope.funCode = '21503';
    $scope.table_name = "t_agreement";
    $scope.billdef = "Agreement";
    $scope.beanName = "agreementService";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initPreviewFile($scope, $rootScope);
    initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope, $rootScope);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);
});
