app.controller('againPropertyProjectCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                costscale: [],
                coomedium: [],
                expertinfo: [],
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                c2Type :0,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                billstatus: 31,
                ifBid: getSelectOptionData.YESNO[1].id,
                //再保险立项独立出来，暂定c1type为21
                c1type: 21,
                ifReInsurance:1,
                isQuote: 'Y',
                customerDemand: '<p>保险需求：</p><p>服务要求：</p><p>其他：</p>'

            };
        };
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.entityVO = 'nc.vo.busi.ProjectVO';
        //初始化查询
       $scope.initQUERY = function () {
            return { "operate_year": parseInt(new Date().format("yyyy")),
                "id": $stateParams.id
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode ='1302';

    };

    $scope.initHttp = function () {
        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data) {
            layer.load(2);
            return $http.post($rootScope.basePath + "againPropertyProject/queryAllForGrid", {
                params: angular.toJson(data),
                //page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                //pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            })
                .success(function (response) {
                    if (response && response.code == 200) {
                        $scope.gridOptions.data = response.result.Rows;
                        $scope.gridOptions.totalItems = response.result.Total;
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
            $http.post($scope.basePath + "againPropertyProject/queryForGrid", {
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
                    //业务来源一级分类进行展示
                    //{VO.busiTypeDetailed}}/{{VO.busi_type.name}
                    var length = response.result.Rows.length;
					for (i = 0; i < length; i++) {
					var index = 0;
                        if (response.result.Rows[i].busi_type) {
                            var s = response.result.Rows[i].busi_type.parentName;
                            if (s != null && s != undefined) {
                                index = s.lastIndexOf(",") + 1;
                                var firstType = s.substr(index, length);
                                //var firstType =s.split("/")[0];
                                response.result.Rows[i].firstType = firstType;
                            }else{
								if (response.result.Rows[i].busiTypeDetailed) {
									var s = response.result.Rows[i].busiTypeDetailed;
									if (s != null) {
										index = s.lastIndexOf("/") + 1;
										var firstType = s.substr(index, length);
										//var firstType =s.split("/")[0];
										response.result.Rows[i].firstType = firstType;
									}
								}
							}
                        } 
                    }
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            });
        };
        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "againPropertyProject/findOne", {pk: pk}).success(function (response) {
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    if (callback) {
                        callback();
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
                    // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };


        $scope.onSubSaveVO = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "againPropertyProject/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        layer.closeAll('loading');
                        layer.alert("填写成功", {skin: 'layui-layer-lan', closeBtn: 1});
                        ngDialog.close();
                        $scope.queryForGrid($scope.QUERY);
                    }

                });
        };

        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO['trade_type'] = $scope.VO.pkC0Tradetype.code;
            $scope.VO.c2Type =0;
            $scope.VO.costscale = $scope.costscaleGridOptions.data;
            $scope.VO.coomedium = $scope.coomediumGridOptions.data;
            $scope.VO.expertinfo = $scope.expertinfoGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $http.post($rootScope.basePath + "againPropertyProject/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        $scope.isContinue = true;
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
        $scope.submit = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "againPropertyProject/submit", {data: angular.toJson($scope.VO)})
                .success(function (response) {
                    layer.closeAll('loading');
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
                    if (response.code == 200) {
                        if ($scope.isGrid) {
                            $scope.queryForGrid($scope.QUERY);
                        } else {
                            $scope.findOne($scope.pk);
                        }
                    }
                });
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
            if (item && item.id) {
                $scope.onCard(item.id);
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

        $scope.$watch('VO.busi_type', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.busi_type.parentName) {
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


        $scope.$watch('VO.customerType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.customerType == 4) {
                    $scope.VO['customerTypeName'] = $rootScope.SELECT.PROJECTCUSTOMERTYPE[0].name;
                } else if ($scope.VO.customerType == 3) {
                    $scope.VO['customerTypeName'] = $rootScope.SELECT.PROJECTCUSTOMERTYPE[2].name;
                } else if ($scope.VO.customerType == 1) {
                    $scope.VO['customerTypeName'] = $rootScope.SELECT.PROJECTCUSTOMERTYPE[1].name;
                }

            }
        }, true);

        $scope.$watch('VO.cinsureman.name', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.c2Type != null) {
                    var date = new Date;
                    var year = date.getFullYear();
                    var month = date.getMonth() + 1;
                    $scope.VO.cproname = year + "年" + month + "月" + newVal + $rootScope.returnSelectName($scope.VO.c2Type, 'MARKETTYPE');
                }
            }
        }, true);
        $scope.$watch('VO.customerType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.param = {customerType: $scope.VO.customerType};
                $scope.VO.cinsureman = "";
            }
        }, true);
        $scope.$watch('VO.c2Type', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.cinsureman && $scope.VO.cinsureman.name) {
                    var date = new Date;
                    var year = date.getFullYear();
                    var month = date.getMonth() + 1;
                    $scope.VO.cproname = year + "年" + month + "月" + $scope.VO.cinsureman.name + $rootScope.returnSelectName(newVal, 'MARKETTYPE');
                }
            }
        }, true);

        $scope.$watch('VO.ifBid', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if (newVal == 'Y') {
                    $scope.isBid = false;
                } else {
                    $scope.isBid = true;
                }
            }
        }, true);
        $scope.$watch('VO.pkC0Tradetype', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if (newVal.name == '网省公司') {
                    // 没有这个业务来源了，这里需要注掉对它的控制 yuzy @2018-07-20
                    // $scope.isBlanketType = false;
                    $scope.isCooperationType = true;
                } else {
                    $scope.isCooperationType = true;
                    // $scope.isBlanketType = true;
                }
                if (newVal.code) {
                    if (newVal.code.indexOf('002') < 0) {
                        $scope.isCooperationType = true;
                    } else {
                        $scope.isCooperationType = false;
                    }
                }

            }
        }, true);
    };

    $scope.initButton = function () {

        $scope.onPrintReportBill = function () {
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/againPropertyProject/printExecutableReport.html',
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                controller: function ($scope, $timeout) {
                    $scope.rows = $scope.gridApi.selection.getSelectedRows();
                    $scope.print = function () {
                        var winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
                        var linkTag = winPrint.document.createElement('link');
                        linkTag.setAttribute('rel', 'stylesheet');
                        linkTag.setAttribute('media', 'all');
                        linkTag.setAttribute('type', 'text/css');
                        var winPrintHead = winPrint.document.getElementsByTagName('head')[0];
                        linkTag.href = $rootScope.basePath + 'css/public.css';
                        winPrintHead.appendChild(linkTag);
                        winPrint.document.body.innerHTML = document.getElementById('printMonReport').innerHTML;
                        winPrint.focus();
                        $timeout(function () {
                            winPrint.window.print();
                            winPrint.close;
                        }, 300);
                    }

                },
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
        }
        /**
         * 查看批复单
         */
        $scope.onPrintSignCheckBill = function (gridApi,htmlPathCheckBill,type) {
            // $scope.raq = "signCheckBill";
            // $scope.raq = "projectReport";
            $scope.raq = type;
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);

            $http.post($rootScope.basePath + 'propertyProject/signCheckBill', {
                data: angular.toJson($scope.VO),
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
            // $http.post($scope.basePath + "propertyProject/signCheckBill", {
            //     data: angular.toJson($scope.VO),
            //     raq: $scope.raq,
            //     type: "PDF"
            // }).success(function (response) {
            //     layer.closeAll('loading');
            //     if (response.code == 200) {
            //         layer.closeAll('loading');
            //         // if(fun) fun(response);
            //         if (response.code == 200) {
            //             window.open(getURL(response.queryPath));
            //         }
            //     }
            //
            // });
        }

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
        /**
         * 发送立项信息至电网资产
         */
        $scope.onSendEmsByProject = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条要发送的立项数据！!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            $http.post($scope.basePath + "againPropertyProject/sendEmsByProject", {data: angular.toJson(rows[0])}).success(function (response) {
                if (response && response.code == "200") {
                } else {
                    layer.alert("操作失败！", {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });

        }

        /**
         * 查看立项历史
         */
        $scope.onProjectHis = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            $scope.projectsourceid = rows[0].projectsourceid;
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/againPropertyProject/propertyProjectHisGrid.html',
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
        }

        /**
         * 保单信息
         */
        $scope.onInsurance = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            $scope.pkProject = rows[0].id;
            layer.load(2);
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/againPropertyProject/caibInsuranceBillGrid.html',
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
            layer.load(2);
        }

        $scope.onSubCancel = function () {
            ngDialog.close();
        }

        /**
         * 终止项目
         */
        $scope.onEndProject = function () {
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/againPropertyProject/endProject.html',
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
        }

        /*
         * 续立项
         */
        $scope.onContinue = function () {

            //  控制字表按钮的显示

            var rows = $scope.gridApi.selection.getSelectedRows();
            $scope.findOne(rows[0].id, function () {
                $scope.form = true;
                $scope.VO.id = angular.copy(null);
                $scope.VO.oldCode = angular.copy($scope.VO.cprocode);
                $scope.VO.cprocode = angular.copy(null);
                $scope.VO.vbillno = angular.copy(null);
                $scope.VO.finallyOpinion = angular.copy(null);
                $scope.VO.planSucceedDate = angular.copy(null);
                $scope.VO.pkC0Tradetype = '';
                $scope.VO.isContinue = angular.copy($rootScope.SELECT.PROJECTPROPERTIESTYPE[1].id);
                $scope.VO.dr = $scope.SELECT.DRSTATUS[0].id;
                $scope.VO.billstatus = 31;
                $scope.VO.pkOperator = $rootScope.userVO;
                $scope.VO.pkOrg = $rootScope.orgVO;
                $scope.VO.pkDept = $rootScope.deptVO;
                $scope.VO.operateDate = new Date().format("yyyy-MM-dd");
                $scope.VO.operateTime = new Date().format("yyyy-MM-dd HH:mm:ss");
                $scope.isEdit = true;
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
                $scope.isContinue = false;
            });

        }
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
                // layer.load(2);
                $scope.findOne(rows[0].id, function (response) {
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isEdit = false;
                    $scope.isDisabled = true;
                    $scope.isContinue = true;
                });
            }
        };

        /**
         * 暂存
         */
        $scope.onTemporary = function (data) {
            $scope.VO.costscale = $scope.costscaleGridOptions.data;
            $scope.VO.coomedium = $scope.coomediumGridOptions.data;
            $scope.VO.expertinfo = $scope.expertinfoGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            if (data) {
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
        $scope.onSubmit = function () {
            var pk;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                if (rows[0].billstatus != 37) return layer.alert("只有暂存状态可以提交!", {skin: 'layui-layer-lan', closeBtn: 1});
                pk = rows[0].pk;
            }
            $scope.submit();
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
            }
            ;


        };

        $scope.onAdd = function () {
            $scope.form = true;
            $scope.isGrid = false;
            $scope.isClear = true;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.isContinue = false;
            $scope.tabDisabled = true;
            $scope.isCooperationType = true;
            $scope.isBlanketType = false;
            $scope.isBack = true;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
            $scope.costscaleGridOptions.data = [];
            $scope.coomediumGridOptions.data = [];
            $scope.expertinfoGridOptions.data = [];
            $scope.dealAttachmentBGridOptions.data = [];
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
                } else {
                    id = rows[0].id;
                }
            }
            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {
                pk: id,
                tableName: $scope.table_name,
                billdef: $scope.billdef
            }).success(function (response) {
                if (response && response.code == "200") {
                    $scope.card = true;
                    angular.assignData($scope.VO, response.result);
                    $scope.costscaleGridOptions.data = $scope.VO.costscale;
                    $scope.coomediumGridOptions.data = $scope.VO.coomedium;
                    $scope.expertinfoGridOptions.data = $scope.VO.expertinfo;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
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
                    $http.post($scope.basePath + "againPropertyProject/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
            if ($scope.isClear) {
                $scope.VO = $scope.initVO();
                $scope.costscaleGridOptions.data = [];
                $scope.coomediumGridOptions.data = [];
                $scope.expertinfoGridOptions.data = [];
                $scope.dealAttachmentBGridOptions.data = [];
            }
            $scope.isDisabled = true;
            $scope.isContinue = true;
            $scope.isEdit = false;
            $scope.isBack = false;
            $scope.isCooperationType = true;
            $scope.isBlanketType = false;
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
            $scope.isContinue = true;
            //阻止页面渲染
            $scope.form = false;
            $scope.card = false;
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
                    if ($scope.VO.assess.length > 250) {
                        return layer.alert("项目简介不可以超过250个字!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.VO.pkC0Tradetype.name == null || $scope.VO.pkC0Tradetype.name.length == 0) {
                        return layer.alert("业务来源不可为空!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    /* $scope.VO.c2TypeName = $rootScope.returnSelectName($scope.VO.c2Type,"MARKETTYPE");
                     $scope.VO.customerTypeName = $rootScope.returnSelectName($scope.VO.customerType,"PROJECTCUSTOMERTYPE");
                     $scope.VO.blanketTypeName = $rootScope.returnSelectName($scope.VO.blanketType,"BLANKETTYPE");
                     $scope.VO.cooperationTypeName = $rootScope.returnSelectName($scope.VO.cooperationType,"COOPERATIONTYPE");
                     $scope.VO.ifBidName = $rootScope.returnSelectName($scope.VO.ifBid,"YESNO");
                     $scope.VO.lifeStaffcountScopeName = $rootScope.returnSelectName($scope.VO.lifeStaffcountScope,"PERSONCOUNTTYPE");
                     $scope.VO.societyInsureName = $rootScope.returnSelectName($scope.VO.societyInsure,"CASETYPE");
                     $scope.VO.enumLifeBusinessInsureName = $rootScope.returnSelectName($scope.VO.enumLifeBusinessInsure,"CASETYPE");
                     $scope.VO.enumCoomediumName = $rootScope.returnSelectName($scope.VO.enumCoomedium,"CASETYPE");
                     $scope.VO.isContinueName = $rootScope.returnSelectName($scope.VO.isContinue,"PROJECTPROPERTIESTYPE");
                     $scope.VO.ceaseReasonName = $rootScope.returnSelectName($scope.VO.ceaseReason,"CEASEREASONTYPE");*/
                    if ($scope.VO.enumCoomedium == 1) {
                        var coomedium = $scope.coomediumGridOptions.data;
                        if (coomedium.length == 0) {
                            return layer.alert("请录入中介信息！",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        for (var i = 0; i < coomedium.length; i++) {
                            if (!coomedium[i].mediumName) {
                                return layer.alert("子表属性合作中介名称不可为空！",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                    }

                    if(37==$scope.VO.billstatus){
                        $scope.VO.billstatus=31;
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
            $scope.QUERY.id = null;
        };

        /**
         * 初始化参照
         */
        $scope.initView = function () {

        };

        /**
         * 子表新增
         */
        $scope.onAddLine = function () {
            $scope[$scope.selectTabName].data.push({});

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

        /**
         * 再保险业务档案管理推送数据
         * */
        $scope.onPushDate =  function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行推送!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            if (rows[0].billstatus!=34){
                return layer.alert("请选择审核通过的数据！",
                    {skin: 'layui-layer-lan', closeBtn: 1});
            }
            layer.load(2);
            $http.post($scope.archivesPath + "fileAdministration/pushDate",{id:rows[0].id,c_1_type:rows[0].c_1_type}).success(function(response) {
                if(response.code == 200){
                    layer.alert("推送成功");
                }else {
                    layer.alert("推送失败");
                }
                layer.closeAll('loading');
            });

        }


    };

    $scope.initPage = function () {
        $scope.form = false;
        $scope.card = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.isContinue = true;
        $scope.queryShow = true;
        $scope.htmlPathCheckBill = 'view/againPropertyProject/printCheckBill.html';
        $scope.htmlPathReportBill = 'view/againPropertyProject/printExecutableReport.html';
        //控制附件上传和下载
        $scope.upOrDown = false;
        //投标业务需总部配合准备资料 zhoul
        $scope.isBid = true;
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
            exporterCsvFilename: '团体客户经济业务立项.csv',
            columnDefs: [
                {name: 'c_procode', displayName: '立项编号', width: 100,},
                {name: 'customer_type', displayName: '立项对象类型', width: 100, cellFilter: 'SELECT_PROJECTCUSTOMERTYPE'},
                {name: 'if_re_insurance', displayName: '是否为再保险业务', width: 100, cellFilter: 'SELECT_YESNONUM'},
                {name: 'cinsureman_name', displayName: '客户名称', width: 100,},
                {name: 'cinsureman_code', displayName: '客户编号', width: 100,},
                {name: 'c_2_type', displayName: '业务类型', width: 100, cellFilter: 'SELECT_MARKETTYPE'},
                {name: 'busi_type_name', displayName: '业务分类', width: 100},
                {name: 'blanket_type', displayName: '签单方式', width: 100, cellFilter: 'SELECT_BLANKETTYPE'},
                {name: 'cooperation_type', displayName: '协作类型', width: 100, cellFilter: 'SELECT_COOPERATIONTYPE'},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'c_proname', displayName: '立项名称', width: 100,},
                {name: 'c_proaddress', displayName: '项目地址', width: 100,},
                {name: 'c_period_new', displayName: '项目周期(月)', width: 100,},
                {name: 'if_bid', displayName: '是否投标', width: 100, cellFilter: 'SELECT_YESNO'},
                {
                    name: 'f_1_assets', displayName: '资产规模(万元)', width: 100,
                    cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'property_holdshare', displayName: '控股方', width: 100,},
                {
                    name: 'f_estimateincome', displayName: '预计业务收入(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'life_staffcount_scope', displayName: '员工数量范围', width: 100, cellFilter: 'SELECT_PERSONCOUNTTYPE'},
                {name: 'society_insure', displayName: '社会保险情况', width: 100, cellFilter: 'SELECT_CASETYPE'},
                {name: 'enum_life_business_insure', displayName: '商业保险投保', width: 100, cellFilter: 'SELECT_CASETYPE'},
                {name: 'enum_coomedium', displayName: '合作中介情况', width: 100, cellFilter: 'SELECT_CASETYPE'},
                {name: 'is_continue', displayName: '立项性质', width: 100, cellFilter: 'SELECT_PROJECTPROPERTIESTYPE'},
                {name: 'cease_reason', displayName: '项目终结原因', width: 100, cellFilter: 'SELECT_CEASEREASONTYPE'},
                {name: 'pkOperator_name', displayName: '经办人', width: 100,},
                {name: 'operate_date', displayName: '制单日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'operate_time', displayName: '制单时间', width: 100,},
                {name: 'pkOrg_name', displayName: '业务单位', width: 100,},
                {name: 'pkDept_name', displayName: '业务部门', width: 100,},
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
                    $scope.findOne(rows[0].id);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });


        };

        $scope.selectTabName = 'costscaleGridOptions';
        $scope.costscaleGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'pkCommendinsure.name',
                    displayName: '推荐险种',
                    width: 100,
                    url: 'insuranceRef/queryForGrid'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'pkCommendinsure',
                    isTree: true
                },
            ],
            data: $scope.VO.costscale,
            onRegisterApi: function (gridApi) {
                $scope.costscaleGridOptions.gridApi = gridApi;
            }
        };
        $scope.coomediumGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'mediumName', displayName: '合作中介名称', width: 100


                },
                {
                    name: 'enumBailmedium', displayName: '委托中介类型', width: 100, cellFilter: 'SELECT_AGENCYCOMPTYPE'
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.AGENCYCOMPTYPE
                },
                {
                    name: 'memo', displayName: '备注', width: 100


                },
            ],
            data: $scope.VO.coomedium,
            onRegisterApi: function (gridApi) {
                $scope.coomediumGridOptions.gridApi = gridApi;
            }
        };
        $scope.expertinfoGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {
                    name: 'expertname.name', displayName: '专家姓名', width: 100, url: 'expertRef/queryForGrid'
                    , placeholder: '请选择', editableCellTemplate: 'ui-grid/refEditor', popupModelField: 'expertname'

                },
            ],
            data: $scope.VO.expertinfo,
            onRegisterApi: function (gridApi) {
                $scope.expertinfoGridOptions.gridApi = gridApi;
            }
        };
        //附件
        $scope.dealAttachmentBGridOptions = {
            enableCellEditOnFocus: true,
            cellEditableCondition: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,
            columnDefs: [
                {
                    name: 'file_type', displayName: '附件类型', width: 100, enableCellEdit: true
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

        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
        /*else{
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
    };

    $scope.table_name = "lr_project";
    $scope.billdef = "AgainPropertyProject";
    $scope.beanName ="insurance.ExamineServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();

    initworkflow($scope, $http, ngDialog);
    initonlineView($scope,$rootScope,$sce,$http,ngDialog);
    initPreviewFile($scope,$rootScope);

});
app.controller('costscaleGridOptionsCtrl', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('coomediumGridOptionsCtrl', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('insuranceMsgCtrl', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {

    //初始化查询
    $scope.initQUERYSUB = function () {
        return {
            pkProject: $scope.pkProject
        }
    };
    $scope.QUERYSUB = $scope.initQUERYSUB();

    /**
     * 过滤查询功能
     */
    $scope.onQuerySub = function () {
        $scope.queryForGrid($scope.QUERYSUB);
    };

    $scope.onResetSub = function () {
        $scope.QUERYSUB = $scope.initQUERYSUB();
    };

    $scope.insuranceMsg = {
        enableRowSelection: true,
        enableSelectAll: true,
        enableFullRowSelection: true,//是否点击cell后 row selected
        enableRowHeaderSelection: true,
        multiSelect: true,//多选
        useExternalPagination: true,
        columnDefs: [
            {name: 'insuranceno', displayName: '保单号', width: 100,},
            {name: 'cprocode', displayName: '立项编号', width: 100,},
            {name: 'cproname', displayName: '立项名称', width: 100,},

            {name: 'c_protype', displayName: '客户产权关系', width: 100,},
            {name: 'projectDate', displayName: '立项日期', width: 100,},

            {name: 'insurancename', displayName: '险种名称', width: 100},
            {name: 'estimate_name', displayName: '投保人', width: 100},
            {name: 'insurancetotalmoney', displayName: '总保额', width: 100},
            {name: 'insurancetotalcharge', displayName: '总保费', width: 100,},
            {name: 'receivefeemount', displayName: '佣金总额', width: 100,},
            {name: 'factMoney', displayName: '佣金结算金额', width: 100,},
            {name: 'unReceivefeemount', displayName: '未结算佣金金额', width: 100},
            {name: 'startdate', displayName: '保单起保时间', width: 100,},
            {name: 'enddate', displayName: '保单截止时间', width: 100,},
            {name: 'builddept.name', displayName: '建立部门', width: 100,},

        ],
        data: []
    };
    $scope.insuranceMsg.onRegisterApi = function (gridApi) {
        //set gridApi on scope
        $scope.gridApi = gridApi;

        //添加行头
        $scope.gridApi.core.addRowHeaderColumn({
            name: 'rowHeaderCol',
            displayName: '',
            width: 30,
            cellTemplate: 'ui-grid/rowNumberHeader'
        });

        $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (rows.length == 1) {
                if (!$scope.chilbTable) {
                    $scope.chilbTable = true;
                }
                $scope.findOneSub({pkInsurancebill: rows[0].id});
            } else {
                $scope.chilbTable = false;
            }
        });

    };

    //险种
    $scope.insuranceinfoGridOptions = {
        enableCellEditOnFocus: true,
        enableRowSelection: true,
        enableSelectAll: true,
        multiSelect: true,
        enableSorting: true,
        enableRowHeaderSelection: true,
        showColumnFooter: false,
        columnDefs: [
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
                params: {type: 'caichan'}
                ,
                cellEditableCondition: function ($scope, row) {
                    return $scope.row.entity.maininsurance == 'Y';
                }
            },
            {
                name: 'insurancemoney', displayName: '保险金额/赔偿限额(元)', width: 100, cellFilter: 'AMOUNT_FILTER'
            },
            {
                name: 'chargerate', displayName: '费率(‰)', width: 100, cellFilter: 'number:6'
            },
            {
                name: 'insurancecharge', displayName: '保费(元)', width: 100, cellFilter: 'AMOUNT_FILTER'
            },

        ],
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.insuranceinfoGridOptions.gridApi = gridApi;
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
                name: 'additioninsurancecharge', displayName: '保费(元)', width: 100, cellFilter: 'number:2'

            },
            {
                name: 'insurance_man_linkman', displayName: '保险专责姓名', width: 100,

            },
            {
                name: 'insurance_man_tel', displayName: '保险专责联系方式', width: 100, cellFilter: 'number:2'

            }
        ],
        data: $scope.VO.insurancedman,
        onRegisterApi: function (gridApi) {
            $scope.insurancedmanGridOptions.gridApi = gridApi;
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
        showColumnFooter: false,
        columnDefs: [
            {
                name: 'insuranceman', displayName: '保险公司', width: 100
            },
            {
                name: 'comm_kind', displayName: '承保性质', width: 100
            },
            {
                name: 'insurancerate', displayName: '承保比例(%)', width: 100
            },
            {
                name: 'insurancemoney', displayName: '保费', width: 100
            },
            {
                name: 'commisionrate', displayName: '佣金比例(%)', width: 100
            },
            {
                name: 'feemount', displayName: '佣金金额', width: 100
            },
            {
                name: 'insurancelinkman', displayName: '保险公司联系人', width: 100
            },
            {
                name: 'insurancelinktel', displayName: '保险公司联系电话', width: 100


            },

        ],
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.insurancemanGridOptions.gridApi = gridApi;
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
                name: 'planMoney', displayName: '计划金额', width: 100, cellFilter: 'number:2', enableCellEdit: false


            },
            {
                name: 'factMoney', displayName: '已结算金额', width: 100, cellFilter: 'number:2', enableCellEdit: false


            },
            {
                name: 'noPaymentMoney',
                displayName: '未结算金额',
                width: 100,
                cellFilter: 'number:2',
                enableCellEdit: false


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
        data: [],
        onRegisterApi: function (gridApi) {
            $scope.paymentGridOptions.gridApi = gridApi;
        }
    };


    $scope.findOneSub = function (pk, callback) {
        $http.post($scope.basePath + "caibInsurancebill/findOneByMsg", {params: angular.toJson(pk)}).success(function (response) {
            if (response && response.code == "200") {
                $scope.insuranceinfoGridOptions.data = response.result.insuranceinfo;
                $scope.insurancedmanGridOptions.data = response.result.insurancedman;
                $scope.insurancemanGridOptions.data = response.result.insuranceman;
                $scope.paymentGridOptions.data = response.result.payment;
                if (callback) {
                    callback();
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
                //layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
            }
        });
    };

    //列表查询
    $scope.queryForGrid = function (data) {
        $scope.gridOptions.useExternalPagination = true;
        $http.post($scope.basePath + "caibInsurancebill/queryForGridByMsg", {
            params: angular.toJson(data)
        }).success(function (response) {
            if (response.code == 200) {
                if (response.result && response.result.Rows > 0) {
                    $scope.insuranceMsg.data = response.result.Rows;
                    $scope.insuranceMsg.totalItems = response.result.Total;
                } else {
                    ngDialog.close();
                    return layer.alert("没有查找相关联的记录！", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
            }
            layer.closeAll('loading');
        });
    };
    $scope.queryForGrid($scope.QUERYSUB);


});

app.controller('propertyProjectHisCtrl', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {

    $scope.propertyProjectHis = {
        enableRowSelection: true,
        enableSelectAll: true,
        enableFullRowSelection: true,//是否点击cell后 row selected
        enableRowHeaderSelection: true,
        multiSelect: true,//多选
        paginationPageSizes: [100, 500, 1000],
        paginationPageSize: 100,
        useExternalPagination: true,
        columnDefs: [
            {name: 'cprocode', displayName: '立项编号', width: 100,},
            {name: 'cinsureman.name', displayName: '客户名称', width: 100,},
            {name: 'cinsureman.code', displayName: '客户编号', width: 100,},
            {name: 'cinsureman.c_1_Province_name', displayName: '客户所在区域', width: 100,},

            {name: 'cinsureman.tradetype_name', displayName: '行业类别', width: 100,},
            {name: 'cinsureman.enumEntkind_name', displayName: '企业性质', width: 100,},

            {name: 'blanketType', displayName: '签单方式', width: 100, cellFilter: 'SELECT_BLANKETTYPE'},
            {name: 'cooperationType', displayName: '协作类型', width: 100, cellFilter: 'SELECT_COOPERATIONTYPE'},
            {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
            {name: 'cproname', displayName: '立项名称', width: 100,},
            {name: 'cproaddress', displayName: '项目地址', width: 100,},
            {name: 'cperiod_new', displayName: '项目周期(月)', width: 100,},
            {name: 'ifBid', displayName: '是否投标', width: 100, cellFilter: 'SELECT_YESNO'},
            {name: 'f1Assets', displayName: '资产规模(万元)', width: 100,},
            {name: 'propertyHoldshare', displayName: '控股方', width: 100,},
            {name: 'festimateincome', displayName: '预计业务收入(元)', width: 100,},

            {name: 'lifeStaffcountScope', displayName: '员工数量范围', width: 100, cellFilter: 'SELECT_PERSONCOUNTTYPE'},
            {name: 'societyInsure', displayName: '社会保险情况', width: 100, cellFilter: 'SELECT_CASETYPE'},
            {name: 'enumLifeBusinessInsure', displayName: '商业保险投保', width: 100, cellFilter: 'SELECT_CASETYPE'},
            {name: 'c2Type', displayName: '业务类型', width: 100, cellFilter: 'SELECT_MARKETTYPE'},
            {name: 'pkOperator.name', displayName: '经办人', width: 100,},
            {name: 'operateDate', displayName: '制单日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'},
            {name: 'operateTime', displayName: '制单时间', width: 100,},
            {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
            {name: 'pkDept.name', displayName: '业务部门', width: 100,},
        ],
        data: []
    };
    $scope.propertyProjectHis.onRegisterApi = function (gridApi) {
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

    //列表查询
    $scope.queryForGrid = function (data) {
        $http.post($scope.basePath + "propertyProjectHis/queryForGrid", {
            params: angular.toJson(data),
            page: $scope.gridApi ? $scope.gridApi.page : $scope.propertyProjectHis.page,
            pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.propertyProjectHis.pageSize
        }).success(function (response) {
            if (response.code == 200) {
                if (response.result && response.result.Rows > 0) {
                    $scope.propertyProjectHis.data = response.result.Rows;
                    $scope.propertyProjectHis.totalItems = response.result.Total;
                } else {
                    ngDialog.close();
                    return layer.alert("没有查找相关联的记录！", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
            }
            layer.closeAll('loading');
        });
    };
    $scope.queryForGrid({projectsourceid: $scope.projectsourceid});


});
