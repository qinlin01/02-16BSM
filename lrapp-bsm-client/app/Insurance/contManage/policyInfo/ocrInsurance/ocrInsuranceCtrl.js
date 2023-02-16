/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('ocrInsuranceCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $location) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                insuranceinfo: [],
                insurancedman: [],
                insuranceman: [],
                dealAttachmentB: [],
                partner: [],
                payment: [],
                assistant: [],
                isbudget: 'N',
                ifSubstitute: 'N',
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                billstatus: 31,
                insurancebillkindNO: $rootScope.SELECT.INSURANCEBILLKIND[0].id,
                dr: 0,
                costscale: [],
                coomedium: [],
                insurancetype: "unlife",
                vdef12: 0,
                //ifApproval:0,
            };
        };
        insuranceArr:["010101", "010102", "010103", "010122", "010201", "010203"];
        $scope.entityVO = 'nc.vo.busi.InsurancebillVO';
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "operate_year": parseInt(new Date().format("yyyy")),
                "id": $stateParams.id
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode = '30202';
        $scope.param = {
            c_2_type: 0,
            pk_org_str: $rootScope.orgVO.pk,
            busi_type: "notNull"
        };
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
                {
                    field: 'cinsureman_code',
                    displayName: '投保人编号'
                },
                {
                    field: 'cinsureman_name',
                    displayName: '投保人'
                }

            ],
            data: ""
        };

    $scope.reportRef =
        {
            id: $scope.$id,
            columnDefs: [
                {
                    field: 'approval_number',
                    displayName: '业务签报批复编号'
                },
                {
                    field: 'report_title',
                    displayName: '签报主题'
                },
                {
                    field: 'name',
                    displayName: '客户名称'
                }
            ],
            data: ""
        };


    $scope.initHttp = function () {
        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data, fun, isPrint, etype) {
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.basePath + "propertyInsurance/queryAllForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData),
                isPrint: isPrint,
                etype: 0,//0：excel 1：pdf
            })
                .success(function (response) {
                    if (fun) fun(response);
                    if (isPrint) {
                        window.open(getURL(response.queryPath));
                    } else {
                        window.open($rootScope.basePath + "uploadFile/downLoadByUrl?url=" + encodeURI(encodeURI(response.downPath)));
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
            $http.post($scope.basePath + "propertyInsurance/queryForGrid", {
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

        $scope.onCheckInsuranceno = function () {
            if ($scope.VO.pkInsurancebill != null) {
                $scope.pkInsurancebill = $scope.VO.pkInsurancebill
            } else {
                $scope.pkInsurancebill = '';
            }
            $http.post($scope.basePath + "propertyInsurance/checkInsuranceno", {
                pk: $scope.VO.insuranceno,
                pkInsurancebill: $scope.pkInsurancebill
            }).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    // angular.assignData($scope.VO, response.result);
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };

        //作废
        $scope.onDiscard = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert("请选择一条数据!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.confirm('是否作废选中数据？', {
                    btn: ['作废', '返回'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消作废!', {
                            shift: 6,
                            icon: 11
                        });
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    layer.load(2);
                    $http.post($scope.basePath + "propertyInsurance/discard", {pk: $scope.pk, billdef: $scope.billdef}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            if (response.code == 200) {
                                //调用查询方法刷新页面
                                $scope.queryForGrid($scope.QUERY);
                                return layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                                // layer.msg(response.msg, {
                                //     shift: 6,
                                //     icon: 1
                                // });
                            } else {
                                layer.msg('操作失败!', {
                                    shift: 6,
                                    icon: 11
                                });
                            }
                        }
                    });
                }
            );
        };
        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "propertyInsurance/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.insuranceinfoGridOptions.data = $scope.VO.insuranceinfo;
                    $scope.insurancedmanGridOptions.data = $scope.VO.insurancedman;
                    $scope.insurancemanGridOptions.data = $scope.VO.insuranceman;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    $scope.partnerGridOptions.data = $scope.VO.partner;
                    $scope.paymentGridOptions.data = $scope.VO.payment;
                    if (callback) callback();
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
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO.payment = $scope.paymentGridOptions.data;
            $scope.VO.insurancedman = $scope.insurancedmanGridOptions.data;
            $http.post($rootScope.basePath + "propertyInsurance/save", {data: angular.toJson($scope.VO), funCode: $scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;

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
                    }
                    // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                });
        };
        $scope.onCheckWithEIMS = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $scope.VO.payment = $scope.paymentGridOptions.data;
            $http.post($rootScope.basePath + "propertyInsurance/checkWithEIMS", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    if (response && response.code == "200") {
                        layer.alert(response.msg, {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                    }

                    // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                });
        };

        $scope.onRenewal = function () {
            //  控制字表按钮的显示
            $scope.isClear = false;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.isGrid = false;
                $scope.form = true;
                $scope.findOne(rows[0].id, function () {
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.VO.payment = [];

                    $scope.VO.billstatus = 31;
                    $scope.VO.pkOperator = $rootScope.userVO;
                    $scope.VO.operateDate = new Date().format("yyyy-MM-dd");
                    $scope.VO.operateTime = new Date().format("yyyy-MM-dd HH:mm:ss");
                    $scope.VO.receivefeeperiod = null;
                    $scope.VO.payperiod = null;
                    $scope.VO.receiveperiod = null;
                    $scope.VO.insuranceinfono = null;
                    $scope.VO.insuranceno = null;
                    $scope.VO.id = null;

                    $scope.paymentGridOptions.data = [];
                    $scope.gridApi.selection.getSelectedRows()[0] = $scope.VO;
                });


            } else {

                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            }

        };
    };

    $scope.initFunction = function () {
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.ononRowDblClick = function (item) {
            if (item && item.id) {
                $scope.onCard(item.id);
            }
        };

    };

//附件批量上传
    $scope.onUploadss = function () {
        layer.load(2);
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
                if (value.length > 3) {
                    layer.alert('识别文件不能大于3个', {icon: 1});
                    return;
                }
                var url = "";
                if (value.length == 1) {
                    url = "ocrInsurance/saveFiles";
                } else {
                    url = "ocrInsurance/saveFilessThread";
                }
                layer.load(2);
                //调用后台保存接口
                $http.post($scope.basePath + url, {data: angular.toJson(value)}).success(function (response) {
                    layer.closeAll('loading');
                    if (response && response.code == "200") {
                        $scope.gridOptions.data = response.ROWS;
                        layer.alert(response.msg, {
                            icon: 1
                        });

                    }
                    layer.closeAll('loading');

                });
            }
        }, function (reason) {
        });
    };


    $scope.initWatch = function () {
    };

    $scope.initButton = function () {


        $scope.onImportUploads = function (type) {
            if (type) {
                $("#inputFile").click();
            } else {
                var file = document.getElementById("inputFile").files[0];
                if (file != null) {
                    layer.load(2);
                    var form = new FormData();
                    form.append('file', file);
                    form.append('table', 'gLife');
                    $http({
                        method: 'POST',
                        url: $scope.basePath + 'propertyInsurance/upLoadFile',
                        data: form,
                        headers: {'Content-Type': undefined, 'x-auth-token': window.sessionStorage.getItem("token")},
                        transformRequest: angular.identity
                    }).success(function (data) {
                        var obj = document.getElementById('inputFile');
                        obj.outerHTML = obj.outerHTML;
                        $scope.queryForGrid($scope.QUERY);
                        console.log('upload success');
                        layer.closeAll('loading');
                        if (data.msg) {
                            return layer.alert(data.msg, {
                                skin: 'layui-layer-lan',
                                closeBtn: 1
                            });
                        }
                    }).error(function (data) {
                        layer.closeAll('loading');
                        console.log('upload fail');
                    })
                }

            }
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
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };


        // $scope.onSelectReport = function () {
        //     data.push(pk_project:$scope.VO.pkProject.pk);
        //     if ( $scope.VO.ifReport == true){
        //         $http.get($rootScope.basePath + "reportRef/queryForGrid", {
        //             //pk_project:$scope.pkProject.pk,
        //
        //             data: angular.toJson(data),
        //         }).success(function (response) {
        //             if (response.code == 200) {
        //                 angular.assignData($scope.VO, response.result);
        //                 layer.closeAll('loading');
        //                 $scope.isSubEdit = false;
        //                 return layer.alert('暂存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
        //             }
        //         });
        //     }else {
        //
        //     }
        // }
        $scope.onAdd = function () {
            $scope.isClear = true;
            $scope.form = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.isUploadAnytime = false;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
        };

        /**
         * 修改
         */
        $scope.onEdit = function () {
        };


        /**
         * 暂存
         */
        $scope.onTemporary = function (data) {
        }

        /**
         * 卡片
         */
        $scope.onCard = function (id) {
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
                    $http.post($scope.basePath + "propertyInsurance/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
        /*
         * 随时上传附件功能
         * */
        $scope.onUploadAnyTime = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            $scope.isUploadAnytime = true;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form = true;
                $scope.isGrid = false;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id);
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = true;
            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = true;
            }

        }

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
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isDisabled = true;
            //阻止页面渲染
            $scope.form = false;
            $scope.card = false;
            //阻止页面渲染
            $scope.queryForGrid($scope.QUERY);
        };

        /**
         * 保存判断必输项
         */
        $scope.onSave = function () {
            if ($scope.isUploadAnytime) {
                $scope.onSaveVO();
                return;
            }
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
        $scope.isreplace = true;
        $scope.queryShow = true;
        //控制附件上传和下载
        $scope.upOrDown = false;
        $scope.isUploadAnytime = false;
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
            columnDefs: [
                {name: 'insurancetype', displayName: '保单类型', width: 100, cellFilter: 'SELECT_INSURANCEBILLTYPENAME'},
                {name: 'insuranceno', displayName: '保单号', width: 100, cellFilter: 'CSV_FILTER'},
                {name: 'insuranceinfono', displayName: '保单信息编号', width: 100,},
                {name: 'pkProject.name', displayName: '业务/项目名称', width: 100,},
                {name: 'insuranceno', displayName: '保单号', width: 100, cellFilter: 'CSV_FILTER'},
                {name: 'startdate', displayName: '保险起始日期', width: 100,},
                {name: 'enddate', displayName: '保险到期日期', width: 100,},
                {name: 'estimatepk.name', displayName: '投保人', width: 100,},
                {name: 'estimateaddr', displayName: '投保人地址', width: 100,},
                {name: 'estimatelinkman', displayName: '投保人联系人姓名', width: 100,},
                {name: 'insurancebillkindNO', displayName: '保单性质', width: 100, cellFilter: 'SELECT_INSURANCEBILLKIND'},
                {
                    name: 'commisiontotalnum', displayName: '佣金总金额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'insurancetotalcharge', displayName: '签单总保费(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'insurancetotalmoney', displayName: '保险金额/赔偿限额/(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'paymount', displayName: '应解付总额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'payperiod', displayName: '应解付保费总期数', width: 100,},
                {
                    name: 'receivefeemount', displayName: '应收佣金总额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'receivefeeperiod', displayName: '应收佣金总期数', width: 100,},
                {
                    name: 'receivemount', displayName: '应收保费总额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'receiveperiod', displayName: '应收保费总期数', width: 100,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'operateDate', displayName: '制单日期', width: 100,},
                {name: 'operateTime', displayName: '制单时间', width: 100,},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '部门', width: 100,},
            ],
            data: [],
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

        $scope.selectTabName = 'insuranceinfoGridOptions';
        $scope.insuranceinfoGridOptions = {
            enableCellEditOnFocus: false,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'maininsurance', displayName: '主险种', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: $rootScope.SELECT.YESNO,
                },
                {
                    name: 'insurancepk.name',
                    displayName: '险种名称',
                    width: 100,
                    url: 'insuranceRef/queryForGrid'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    isTree: true,
                    popupModelField: 'insurancepk',
                    params: {type: 'caichan'},
                    enableCellEdit: true,
                    cellEditableCondition: function ($scope, row) {
                        return $scope.row.entity.maininsurance == 'Y';
                    }
                },
                {
                    name: 'vdef1', displayName: '险种名称', width: 100,
                    enableCellEdit: true,
                    cellEditableCondition: function ($scope) {
                        return $scope.row.entity.maininsurance == 'N';
                    }
                },
                {
                    name: 'insurancemoney', displayName: '保险金额/赔偿限额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'chargerate', displayName: '费率(‰)', width: 100, cellFilter: 'number:6'
                },
                {
                    name: 'insurancecharge', displayName: '保费(元)', width: 100, cellFilter: 'number:2',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'franchise', displayName: '免赔额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    enableCellEdit: true,
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'cMemo', displayName: '备注', width: 100


                },
            ],
            data: $scope.VO.insuranceinfo,
            onRegisterApi: function (gridApi) {
                $scope.insuranceinfoGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if (newValue) {

                        }
                        var array = $scope.insuranceinfoGridOptions.data;
                        if ('maininsurance' == colDef.name) {
                            if (newValue == 'Y') {
                                for (var i = 0; i < array.length; i++) {
                                    if (array[i].$$hashKey != rowEntity.$$hashKey) {
                                        array[i].maininsurance = 'N';
                                        array[i].insurancepk = {};
                                    } else {
                                        $scope.VO.insurancetotalmoney = (parseFloat(array[i].insurancemoney)).toFixed(2);
                                    }
                                }
                            } else if (newValue == 'N') {
                                $scope.VO.insurancetotalmoney = 0;
                                for (var i = 0; i < array.length; i++) {
                                    if (array[i].$$hashKey == rowEntity.$$hashKey) {
                                        array[i].insurancepk = {};
                                    } else if (array[i].maininsurance == 'Y') {
                                        $scope.VO.insurancetotalmoney = (parseFloat(array[i].insurancemoney)).toFixed(2);
                                    }
                                }
                            }
                        } else if ('insurancemoney' == colDef.name) {

                            if ($scope.insurancedmanGridOptions.data.length == 1) {
                                var length = $scope.insuranceinfoGridOptions.data.length;
                                var insedmanMoney = 0;
                                var insedmanFee = 0;
                                if (length > 0) {
                                    for (var i = 0; i < length; i++) {
                                        insedmanMoney = eval(insedmanMoney) + eval($scope.insuranceinfoGridOptions.data[i].insurancemoney);
                                        insedmanFee = eval(insedmanFee) + eval($scope.insuranceinfoGridOptions.data[i].insurancecharge);
                                    }
                                    $scope.insurancedmanGridOptions.data[0].insurancemoney = insedmanMoney;
                                    $scope.insurancedmanGridOptions.data[0].insurancefee = insedmanFee;
                                }
                            }

                            $scope.VO.insurancetotalcharge = 0.00;
                            if (rowEntity.maininsurance == 'Y') {
                                $scope.VO.insurancetotalmoney = newValue;
                                $scope.VO.insurancetotalmoney = (parseFloat($scope.VO.insurancetotalmoney)).toFixed(2);
                            }
                            var startDate = new Date($scope.VO.startdate).getTime();
                            var endDate = new Date($scope.VO.enddate).getTime();
                            // var yearStart = new Date(new Date($scope.VO.startdate).getFullYear(), 01, 01).getTime();
                            // var yearEnd = new Date(new Date($scope.VO.startdate).getFullYear(), 12, 31).getTime();
                            var yearStart = new Date($scope.VO.startdate);
                            var yearStart1 = new Date($scope.VO.startdate);
                            var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                            var time = yearEnd - yearStart.getTime();
                            rowEntity.insurancecharge = (parseFloat(rowEntity.insurancemoney) * parseFloat(rowEntity.chargerate) * parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000)).toFixed(2);
                            for (var i = 0; i < array.length; i++) {
                                // if (array[i].$$hashKey == rowEntity.$$hashKey) {
                                //     array[i].insurancecharge = array[i].insurancemoney * array[i].chargerate * 0.001;
                                //
                                // }
                                $scope.VO.insurancetotalcharge = eval(parseFloat($scope.VO.insurancetotalcharge).toFixed(2)) + eval(parseFloat(array[i].insurancecharge).toFixed(2));
                            }
                            if ($scope.VO.insuranceman.length > 0) {
                                for (var j = 0; j < $scope.VO.insuranceman.length; j++) {
                                    $scope.VO.insuranceman[j].vdef1 = eval(parseFloat(eval($scope.VO.insurancetotalmoney) * eval($scope.VO.insuranceman[j].insurancerate) / 100).toFixed(2));
                                    $scope.VO.insuranceman[j].insurancemoney = eval(parseFloat(eval($scope.VO.insurancetotalcharge) * eval($scope.VO.insuranceman[j].insurancerate) / 100).toFixed(2));
                                    $scope.VO.insuranceman[j].feemount = eval(parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval($scope.VO.insuranceman[j].commisionrate) / 100).toFixed(2));
                                }
                            }
                            if ($scope.VO.payment.length > 0) {
                                for (var j = 0; j < $scope.VO.payment.length; j++) {
                                    $scope.VO.payment[j].scaleMoney = '';
                                    $scope.VO.payment[j].planDate = '';
                                }
                            }
                        } else if ('insurancecharge' == colDef.name) {
                            if ($scope.insurancedmanGridOptions.data.length == 1) {
                                var length = $scope.insuranceinfoGridOptions.data.length;
                                var insedmanMoney = 0;
                                var insedmanFee = 0;
                                if (length > 0) {
                                    for (var i = 0; i < length; i++) {
                                        insedmanMoney = eval(insedmanMoney) + eval($scope.insuranceinfoGridOptions.data[i].insurancemoney);
                                        insedmanFee = eval(insedmanFee) + eval($scope.insuranceinfoGridOptions.data[i].insurancecharge);
                                    }
                                    $scope.insurancedmanGridOptions.data[0].insurancemoney = insedmanMoney;
                                    $scope.insurancedmanGridOptions.data[0].insurancefee = insedmanFee;
                                }
                            }
                            $scope.VO.insurancetotalcharge = 0;
                            for (var i = 0; i < array.length; i++) {
                                $scope.VO.insurancetotalcharge = eval(parseFloat($scope.VO.insurancetotalcharge).toFixed(2)) + eval(parseFloat(array[i].insurancecharge).toFixed(2));
                            }
                            if ($scope.VO.insuranceman.length > 0) {
                                for (var j = 0; j < $scope.VO.insuranceman.length; j++) {
                                    $scope.VO.insuranceman[j].insurancemoney = eval(parseFloat(eval($scope.VO.insurancetotalcharge) * eval($scope.VO.insuranceman[j].insurancerate) / 100).toFixed(2));
                                    $scope.VO.insuranceman[j].feemount = eval(parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval($scope.VO.insuranceman[j].commisionrate) / 100).toFixed(2));
                                }
                            }
                            if ($scope.VO.payment.length > 0) {
                                for (var j = 0; j < $scope.VO.payment.length; j++) {
                                    $scope.VO.payment[j].scaleMoney = '';
                                    $scope.VO.payment[j].planDate = '';
                                }
                            }

                            rowEntity.insurancecharge = parseFloat(rowEntity.insurancecharge).toFixed(2)
                        } else if ('chargerate' == colDef.name) {
                            $scope.VO.insurancetotalcharge = 0.00;
                            var startDate = new Date($scope.VO.startdate).getTime();
                            var endDate = new Date($scope.VO.enddate).getTime();
                            // var days = new Date($scope.VO.startdate).getFullYear();
                            // var yearStart = new Date(new Date($scope.VO.startdate).getFullYear(), 01, 01).getTime();
                            // var yearEnd = new Date(new Date($scope.VO.startdate).getFullYear(), 12, 31).getTime();
                            var yearStart = new Date($scope.VO.startdate);
                            var yearStart1 = new Date($scope.VO.startdate);
                            var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                            var time = yearEnd - yearStart.getTime();
                            rowEntity.insurancecharge = (parseFloat(rowEntity.insurancemoney) * parseFloat(rowEntity.chargerate) * parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000)).toFixed(2);
                            for (var i = 0; i < array.length; i++) {
                                // if (array[i].$$hashKey == rowEntity.$$hashKey) {
                                //     array[i].insurancecharge = array[i].insurancemoney * array[i].chargerate * 0.001;
                                // }
                                $scope.VO.insurancetotalcharge = eval(parseFloat($scope.VO.insurancetotalcharge).toFixed(2)) + eval(parseFloat(array[i].insurancecharge).toFixed(2));
                            }
                            if ($scope.VO.insuranceman.length > 0) {
                                for (var j = 0; j < $scope.VO.insuranceman.length; j++) {
                                    $scope.VO.insuranceman[j].insurancemoney = parseFloat(eval($scope.VO.insurancetotalcharge) * eval($scope.VO.insuranceman[j].insurancerate) / 100).toFixed(2);
                                    $scope.VO.insuranceman[j].feemount = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval($scope.VO.insuranceman[j].commisionrate) / 100).toFixed(2);
                                }
                            }
                            if ($scope.VO.payment.length > 0) {
                                for (var j = 0; j < $scope.VO.payment.length; j++) {
                                    $scope.VO.payment[j].scaleMoney = '';
                                    $scope.VO.payment[j].planDate = '';
                                }
                            }
                        }

                        $scope.$apply();
                    });
                }
            }
        };
        //被保人
        $scope.insurancedmanGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'insurancedmanpk.name',
                    displayName: '被保人',
                    width: 100,
                    url: 'customerInsuRef/queryForGrid'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'insurancedmanpk',
                    params: {type: 'beibaoxianren'}
                },
                {
                    name: 'insurancedmanaddr', displayName: '被保人地址', width: 100


                },
                {
                    name: 'insurancedmanlinkman', displayName: '被保人联系人姓名', width: 100


                },
                {
                    name: 'insurancedmanlinktel', displayName: '被保人联系人电话', width: 100


                },
                {
                    name: 'insurancemoney',
                    displayName: '保险金额/赔偿限额(元)',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'insurancefee',
                    displayName: '主险保费(元)',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'additioninsurancecharge',
                    displayName: '附加险保费(元)',
                    enableCellEdit: true,
                    width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
            ],
            data: $scope.VO.insurancedman,
            onRegisterApi: function (gridApi) {
                $scope.insurancedmanGridOptions.gridApi = gridApi;
                /*            gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
                 if('insurancedmanpk.name' == colDef.name){
                 if(rowEntity.insurancedmanpk){
                 if(rowEntity.insurancedmanpk.pk){
                 if(rowEntity.insurancedmanpk.c_0_address){
                 rowEntity.insurancedmanaddr = rowEntity.insurancedmanpk.c_0_address;
                 }else{
                 rowEntity.insurancedmanaddr = '';
                 }
                 $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: rowEntity.insurancedmanpk.pk}).success(function (response) {
                 if (response && response.code == "200") {
                 if(response.result.linkman != null && response.result.linkman.length >0){
                 rowEntity.insurancedmanlinkman = response.result.linkman[0].name;
                 rowEntity.insurancedmanlinktel = response.result.linkman[0].tele;
                 }else{
                 rowEntity.insurancedmanlinkman = '';
                 rowEntity.insurancedmanlinktel = '';
                 }
                 }
                 });
                 }
                 }else{
                 rowEntity.insurancedmanlinkman = '';
                 rowEntity.insurancedmanlinktel = '';
                 }
                 }
                 $scope.$apply();
                 });*/
            }
        };
        //保险人
        $scope.insurancemanGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'insurancemanpk.name',
                    displayName: '保险人名称',
                    width: 100,
                    url: 'insuranceCustomerRef/queryForGrid',
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'insurancemanpk',
                },
                {
                    name: 'insuranceaddr', displayName: '保险人地址', width: 100
                },
                {
                    name: 'insurancelinkman', displayName: '保险人联系人姓名', width: 100
                },
                {
                    name: 'insurancelinktel', displayName: '保险人联系电话', width: 100


                },
                {
                    name: 'replace', displayName: '是否代收保费', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO,
                },
                {
                    name: 'pay', displayName: '是否全额解付', width: 100, cellFilter: 'SELECT_YESNO'

                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO,
                    cellEditableCondition: function ($scope) {
                        return true;
                    },


                },
                {
                    name: 'vdef4', displayName: '保费金额不含增值税', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , enableCellEdit: true
                    , editDropdownOptionsArray: getSelectOptionData.YESNO,

                },
                {
                    name: 'vdef2', displayName: '佣金金额不含增值税', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , enableCellEdit: true
                    , editDropdownOptionsArray: getSelectOptionData.YESNO,

                },
                {
                    name: 'insurancerate', displayName: '承保比例(%)', width: 100


                },
                {
                    name: 'vdef1',
                    displayName: '保险金额/赔偿限额(元)',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'insurancemoney', displayName: '保险保费(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'commisionrate', displayName: '佣金比例(%)', width: 100, cellFilter: 'number:2'


                },
                {
                    name: 'feemount', displayName: '佣金金额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'chiefman', displayName: '是否主承保', width: 100, cellFilter: 'SELECT_YESNO'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'memo', displayName: '备注', width: 100


                },
            ],
            data: $scope.VO.insuranceman,
            onRegisterApi: function (gridApi) {
                $scope.insurancemanGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if ('insurancerate' == colDef.name) {
                            if (rowEntity.insurancerate) {
                                if ($scope.VO.insurancetotalmoney == undefined) {
                                    $scope.VO.insurancetotalmoney = 0;
                                }
                                rowEntity.vdef1 = parseFloat(eval($scope.VO.insurancetotalmoney) * eval(rowEntity.insurancerate) / 100).toFixed(2);
                                rowEntity.insurancemoney = parseFloat(eval($scope.VO.insurancetotalcharge) * eval(rowEntity.insurancerate) / 100).toFixed(2);
                            }
                            var inData = $scope.insurancemanGridOptions.data;
                            $scope.VO.paymount = $scope.calPay(inData);
                            $scope.VO.receivemount = $scope.calReceivemount(inData);
                            $scope.VO.receivefeeperiod = 0;
                            $scope.VO.payperiod = 0;
                            $scope.VO.receiveperiod = 0;
                            $scope.VO.payment = [];
                            $scope.paymentGridOptions.data = [];

                        }

                        if ('replace' == colDef.name) {
                            if (rowEntity.replace) {
                                $scope.VO.receivemount = 0;
                                var inData = $scope.insurancemanGridOptions.data;
                                if (rowEntity.replace == 'Y') {
                                    angular.alert("确认代收保费，并确认代收金额!");
                                    $scope.isreplace = false;
                                } else {
                                    $scope.VO.receiveperiod = 0;//应收保费总期数
                                    $scope.VO.payperiod = 0;//应解付保费总期数
                                    rowEntity.pay = 'N';
                                    $scope.isreplace = true;
                                }
                                $scope.VO.paymount = $scope.calPay(inData);
                                $scope.VO.receivemount = $scope.calReceivemount(inData);

                            }
                        }
                        if ('pay' == colDef.name) {
                            if (rowEntity.pay) {
                                var inData = $scope.insurancemanGridOptions.data;
                                $scope.VO.paymount = $scope.calPay(inData);
                            }
                        }
                        if ('vdef4' == colDef.name) {
                            if (rowEntity.vdef4) {
                                if (rowEntity.vdef4 == 'Y') {
                                    angular.alert("系统将按照签单保费 /1.06来计算签单佣金，请确认!");
                                }
                            }
                        }
                        if ('vdef2' == colDef.name) {
                            if (rowEntity.vdef2) {
                                if (rowEntity.vdef2 == 'Y') {
                                    angular.alert("系统将按照实际佣金/1.06来计算签单佣金，请确认!");
                                }
                            }
                        }
                        if ('insurancemoney' == colDef.name) {
                            var inData = $scope.insurancemanGridOptions.data;
                            $scope.VO.paymount = 0;
                            $scope.VO.receivemount = 0;
                            $scope.VO.receivemount = $scope.calReceivemount(inData);
                            $scope.VO.paymount = $scope.calPay(inData);
                            $scope.VO.receivefeeperiod = 0;
                            $scope.VO.payperiod = 0;
                            $scope.VO.receiveperiod = 0;
                            $scope.VO.payment = [];
                            $scope.paymentGridOptions.data = [];
                        }
                        if ('commisionrate' == colDef.name) {
                            $scope.VO.receivefeeperiod = 0;
                            $scope.VO.payperiod = 0;
                            $scope.VO.receiveperiod = 0;
                            $scope.VO.payment = [];
                            $scope.paymentGridOptions.data = [];
                        }

                        if ('insurancemoney' == colDef.name || 'vdef4' == colDef.name || 'vdef2' == colDef.name || 'commisionrate' == colDef.name) {
                            var inData = $scope.insurancemanGridOptions.data;
                            if (rowEntity.insurancemoney) {
                                rowEntity.feemount = parseFloat(rowEntity.insurancemoney).toFixed(2);
                            }
                            if (rowEntity.vdef4 == 'Y') {
                                rowEntity.feemount = parseFloat(rowEntity.feemount / 1.06).toFixed(2);
                            }
                            if (rowEntity.vdef2 == 'Y') {
                                rowEntity.feemount = parseFloat(rowEntity.feemount * 1.06).toFixed(2);
                            }
                            if (rowEntity.commisionrate) {
                                rowEntity.feemount = parseFloat(eval(rowEntity.feemount) * eval(rowEntity.commisionrate) / 100).toFixed(2);
                                $scope.VO.paymount = parseFloat($scope.calPay(inData)).toFixed(2);
                            }
                            if (rowEntity.feemount || !rowEntity.feemount) {
                                var array = $scope.insurancemanGridOptions.data;
                                $scope.VO.commisiontotalnum = 0;
                                for (var i = 0; i < array.length; i++) {
                                    $scope.VO.commisiontotalnum = parseFloat(eval($scope.VO.commisiontotalnum) + eval(array[i].feemount)).toFixed(2);
                                }
                                $scope.VO.receivefeemount = parseFloat($scope.VO.commisiontotalnum).toFixed(2);
                            }
                            if ($scope.VO.payment.length > 0) {
                                for (var j = 0; j < $scope.VO.payment.length; j++) {
                                    $scope.VO.payment[j].scaleMoney = '';
                                    $scope.VO.payment[j].planDate = '';
                                }
                            }

                        }
                        if ('feemount' == colDef.name) {
                            var array = $scope.insurancemanGridOptions.data;
                            $scope.VO.commisiontotalnum = 0;
                            for (var i = 0; i < array.length; i++) {
                                $scope.VO.commisiontotalnum = parseFloat(eval($scope.VO.commisiontotalnum) + eval(array[i].feemount)).toFixed(2);
                            }
                            $scope.VO.receivefeemount = $scope.VO.commisiontotalnum;


                        }
                        $scope.$apply();
                    });
                }
            }
        };

        /**
         * 计算应收保费总额
         */
        $scope.calReceivemount = function (data) {
            var result = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i].replace == 'Y') {
                    if (!data[i].insurancemoney) {
                        data[i].insurancemoney = 0;
                    }
                    result = parseFloat(result) + parseFloat(data[i].insurancemoney);
                }
            }
            return result;
        }

        /**
         * 计算应解付总额
         * @param data
         */
        $scope.calPay = function (data) {
            var result = 0;
            var flag = false;
            for (var i = 0; i < data.length; i++) {
                var feemount = 0;
                var insurancemoney = 0;
                if (data[i].pay == 'Y') {
                    result = parseFloat(result) + parseFloat(data[i].insurancemoney);
                } else if (data[i].pay != 'Y' && data[i].replace == 'Y') {
                    if (data[i].feemount) {
                        feemount = parseFloat(feemount) + parseFloat(data[i].feemount);
                    }
                    if (data[i].insurancemoney) {
                        insurancemoney = parseFloat(insurancemoney) + parseFloat(data[i].insurancemoney);
                    }
                    flag = false;
                    result = result + (parseFloat(insurancemoney) - parseFloat(feemount));
                }
            }
            if (flag) {
                return 0;
            }
            return result;
        }

        //合作伙伴
        $scope.partnerGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'cooperativer', displayName: '合作伙伴', width: 100


                },
                {
                    name: 'cooperativeraddr', displayName: '合作伙伴地址', width: 100


                },
                {
                    name: 'cooperativerlinkman', displayName: '合作伙伴联系人姓名', width: 100


                },
                {
                    name: 'cooperativerlinktel', displayName: '合作伙伴联系人电话', width: 100


                },
                {
                    name: 'memo', displayName: '备注', width: 100


                },
            ],
            data: $scope.VO.partner,
            onRegisterApi: function (gridApi) {
                $scope.partnerGridOptions.gridApi = gridApi;
            }
        };
        //收付款信息
        $scope.paymentGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            columnDefs: [
                {
                    name: 'stages', displayName: '期数', width: 100, enableCellEdit: false


                },
                {
                    name: 'typeMoneyNO', displayName: '收付款类型', width: 100, cellFilter: 'SELECT_TYPEMONEY'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.TYPEMONEY, enableCellEdit: false
                },
                {
                    name: 'company.name', displayName: '收付款对象名称', width: 100, enableCellEdit: false


                },
                {
                    name: 'typeCompanyNO', displayName: '收付款对象类型', width: 100, cellFilter: 'SELECT_CUSTOMERTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.CUSTOMERTYPE, enableCellEdit: false
                },
                {
                    name: 'scaleMoney', displayName: '收付款比例', width: 100, cellFilter: 'number:2'


                },
                {
                    name: 'planDate',
                    displayName: '计划日期',
                    width: 100,
                    editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'planMoney',
                    displayName: '计划金额',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'factMoney',
                    displayName: '已结算金额',
                    width: 100,
                    enableCellEdit: false,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'noPaymentMoney',
                    displayName: '未结算金额',
                    width: 100,

                    enableCellEdit: false, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }


                },
                {
                    name: 'factDate',
                    displayName: '结算日期',
                    width: 100,
                    enableCellEdit: false,
                    editableCellTemplate: 'ui-grid/refDate',
                    cellFilter: 'date:"yyyy-MM-dd"'
                },
                {
                    name: 'vsettlebillno', displayName: '业务结算单号', width: 100, enableCellEdit: false


                },
            ],
            data: $scope.VO.payment,
            onRegisterApi: function (gridApi) {
                $scope.paymentGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if ('scaleMoney' == colDef.name) {
                            if (rowEntity.scaleMoney) {
                                var array = $scope.paymentGridOptions.data;
                                $scope.VO.insuranceman = $scope.insurancemanGridOptions.data;
                                for (var i = 0; i < array.length; i++) {
                                    if (rowEntity.typeMoneyNO == 1) {
                                        rowEntity.planMoney = parseFloat(eval($scope.VO.receivemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                        rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.receivemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                    }
                                    for (var j = 0; j < $scope.VO.insuranceman.length; j++) {
                                        if (array[i].company.name == $scope.VO.insuranceman[j].insurancemanpk.name
                                            && array[i].$$hashKey == rowEntity.$$hashKey) {
                                            if (rowEntity.typeMoneyNO == 3) {
                                                rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].feemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].feemount) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                            }
                                            if (rowEntity.typeMoneyNO == 2) {
                                                if ($scope.VO.insuranceman[j].pay != 'Y') {
                                                    if ($scope.VO.insuranceman.length > 1 && $scope.VO.insuranceman[j].chiefman != 'Y') {
                                                        rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    } else if ($scope.VO.insuranceman.length > 1 && $scope.VO.insuranceman[j].chiefman != 'Y') {
                                                        rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    } else {
                                                        rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                        rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(1 - $scope.VO.insuranceman[j].commisionrate / 100) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    }

                                                } else {
                                                    rowEntity.planMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);
                                                    rowEntity.noPaymentMoney = parseFloat(eval($scope.VO.insuranceman[j].insurancemoney) * eval(rowEntity.scaleMoney) / 100).toFixed(2);

                                                }

                                            }

                                        }
                                    }

                                }
                            }
                        }
                        $scope.$apply();
                    });
                }

            }
        };
        //附件
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
                    cellFilter: 'SELECT_DOUCUMENTTYPE',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.DOUCUMENTTYPE
                },

                // {name: 'pkPubBlob.name', displayName: '附件内容', width: 100,enableCellEdit:false
                //     /*url:'INSURANCEBLOBREFMODEL'
                //     ,placeholder:'请选择' ,editableCellTemplate:'ui-grid/refEditor' ,popupModelField:'pkPubBlob'*/
                //
                //     },
                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},

                // {name: 'cUpman.name', displayName: '上载人', width: 100,enableCellEdit:false
                //    /* ,url:'userRef/queryForGrid'
                //     ,placeholder:'请选择' ,editableCellTemplate:'ui-grid/refEditor' ,popupModelField:'cUpman'*/
                //
                //     },
                {
                    name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                },
                // {name: 'cMemo', displayName: '备注', width: 100
                //     },
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
        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
        /*else{
         $scope.queryForGrid({});
         }*/
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();

        if ($scope.selectTabName == 'paymentGridOptions') {
            $scope.isShow = false;
        } else {
            $scope.isShow = true;
        }


        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {

            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }
    };
    $scope.table_name = "lr_insurancebill";
    $scope.billdef = "PropertyInsurance";
    $scope.child_table = angular.toJson({"srcBillno": "lr_insurancebill", "insuranceinfo": "lr_insuranceinfo"});
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();

    initworkflow($scope, $http, ngDialog);


});
app.controller('insuranceinfoGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('insurancedmanGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('insurancemanGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('partnerGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('paymentGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('assistantGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});

//自定义过滤器 jsonDate
app.filter("jsonDate", function ($filter) {
    return function (input, format) {
        //先得到时间戳
        var timestamp = Number(input.replace(/\/Date\((\d+)\)\//, "$1"));

        //转成指定格式
        return $filter("date")(timestamp, format);
    }
});
