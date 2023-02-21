app.controller('batchProjectCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                project: [],
                dealAttachmentB: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                billstatus: 0,
                //业务来源字段被删除 保存时报错，暂时设置name为空
                pkC0Tradetype: {name: null},
                c1Type: 1,
                ifReInsurance: 0,
                costscale: [],
                coomedium: [],
                cMemo: "",
                cMemoNum: 0
            };
        };
        $scope.entityVO = 'nc.vo.busi.BatchProjectVO';
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.colEdit = true;
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "operate_year": parseInt(new Date().format("yyyy")),
                "id": $stateParams.idini
            }
        };
        $scope.busi_type_gudong = {
            code: "001",
            children: [],
            name: "股东",
            pk: "0001AA1000000004GPSU",
            label: "股东",
            docname: "股东",
            type: 1,
            parentId: null,
            doccode: "001",
            expanded: false,
            classes: ["leaf"],
            selected: true,
            parentName: "股东"
        };
        $scope.busi_type_shichang = {
            code: "002",
            children: [],
            name: "非股东",
            pk: "0001AA1000000004GPSV",
            label: "非股东",
            docname: "非股东",
            type: 2,
            parentId: null,
            doccode: "002",
            expanded: false,
            classes: ["leaf"],
            selected: true,
            parentName: "非股东"
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode = '2030103';
    };
    $scope.changeText = function () {
        $scope.VO.cMemoNum = $scope.VO.cMemo.length;
    };
    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "batchProject/queryForGrid", {
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
                            } else {
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
            layer.load(2);
            $scope.pk = pk;
            $http.post($scope.basePath + "batchProject/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.projectGridOptions.data = response.result.project;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;

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
                    //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };

        $scope.onSubSaveVO = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "batchProject/save", {
                data: angular.toJson($scope.VO),
                funCode: $scope.funCode
            })
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
            //业务立项信息
            var dataLength = $scope.projectGridOptions.data.length;
            $scope.isNeedcoomedium = false;
            for (var i = 0; i < dataLength; i++) {
                if (!$scope.projectGridOptions.data[i].cproname) {
                    return layer.alert("子表属性立项名称（必填）不可为空!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
                /* if($scope.projectGridOptions.data[i].ifReInsurance==null){
                     return layer.alert("子表属性是否为再保险业务（必填）不可为空!", {
                         skin: 'layui-layer-lan',
                         closeBtn: 1
                     });
                 }*/
                if (!$scope.projectGridOptions.data[i].c1Province) {
                    return layer.alert("子表属性项目所在区域（必填）不可为空!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }

                if (!$scope.projectGridOptions.data[i].cproaddress) {
                    return layer.alert("子表属性项目地址（必填）不可为空!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
                if (!$scope.projectGridOptions.data[i].f1Assets) {
                    return layer.alert("子表属性资产规模(万元)(必填)不可为空！", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
                if (!$scope.projectGridOptions.data[i].propertyHoldshare) {
                    return layer.alert("子表属性控股方(必填)不可为空！", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
                if (!$scope.projectGridOptions.data[i].festimateincome) {
                    return layer.alert("子表属性预计业务收入(元)(必填)不可为空！", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
                if (!$scope.projectGridOptions.data[i].assess) {
                    return layer.alert("子表属性项目简介(必填)不可为空！", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
                if (!$scope.projectGridOptions.data[i].enumCoomedium) {
                    return layer.alert("子表属性合作中介情况(必填)不可为空！", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }

                if (!$scope.projectGridOptions.data[i].planSucceedDate) {
                    return layer.alert("请填写子表立项中“预计业务成功开发时间“", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }
                /*var reg = /^[1-9]\d{3}-([0-9]{1,12})-(0[1-9]|[1-2][0-9]|3[0-1])$/;//月份是1-9时候正则通不过
                var regExp = new RegExp(reg);
                if(angular.isDate($scope.projectGridOptions.data[i].planSucceedDate)){
                    str=$scope.projectGridOptions.data[i].planSucceedDate.getFullYear() + '-' + ($scope.projectGridOptions.data[i].planSucceedDate.getMonth() + 1) + '-' + $scope.projectGridOptions.data[i].planSucceedDate.getDate();
                }else{
                    str=$scope.projectGridOptions.data[i].planSucceedDate.getFullYear() + '-' + ($scope.projectGridOptions.data[i].planSucceedDate.getMonth() + 1) + '-' + $scope.projectGridOptions.data[i].planSucceedDate.getDate();
                }
                if ( !regExp.test(str)){
                    return layer.alert("子表立项中“预计业务成功开发时间“格式错误", {
                        skin: 'layui-layer-lan', closeBtn: 1
                        });
                }*/


                if (!$scope.projectGridOptions.data[i].riskAssess) {
                    return layer.alert("请填写子表立项中“业务风险综合评价”", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }

                if (!$scope.projectGridOptions.data[i].serveContentType) {
                    return layer.alert("请填写子表立项中“提供服务的内容”", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }

                if (!$scope.projectGridOptions.data[i].customerMemo) {
                    return layer.alert("请填写子表立项中“客户简介”", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }

                if (!$scope.projectGridOptions.data[i].customerMemo) {
                    return layer.alert("请填写子表立项中“客户简介”", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }

                // if(!$scope.projectGridOptions.data[i].customerDemand){
                //     return layer.alert("请填写子表立项中“客户意向及需求”", {
                //         skin: 'layui-layer-lan',
                //         closeBtn: 1
                //     });
                // }

                if ($scope.projectGridOptions.data[i].enumCoomedium == 1) {
                    $scope.isNeedcoomedium = true;
                }
            }

            var dataCooLength = $scope.coomediumGridOptions.data.length;

            if ($scope.isNeedcoomedium && dataCooLength == 0) {
                return layer.alert("请在子表信息的【合作中介信息】中录入中介信息！", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            layer.load(2);
            $scope.VO['trade_type'] = $scope.VO.pkC0Tradetype.code;
            $scope.VO.project = $scope.projectGridOptions.data;
            $scope.VO.costscale = $scope.costscaleGridOptions.data;
            $scope.VO.coomedium = $scope.coomediumGridOptions.data;
            $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
            $http.post($rootScope.basePath + "batchProject/save", {
                data: angular.toJson($scope.VO),
                funCode: $scope.funCode
            })
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        angular.assignData($scope.VO, response.result);
                        $scope.isSubEdit = false;
                    }
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
            if (item && item.id) {
                $scope.onCard(item.id);
            }
        };

    };

    $scope.initWatch = function () {

        // $scope.$watch('$scope.projectGridOptions.gridApi.selection.getSelectedRows()', function (newVal, oldVal) {
        //     if (newVal === oldVal || newVal == undefined || newVal == null) return;
        //     if ($scope.isGrid) {
        //         var rows = $scope.projectGridOptions.gridApi.selection.getSelectedRows();
        //     }
        // }
        // var rows = $scope.projectGridOptions.gridApi.selection.getSelectedRows();
        // //此处将子表的值改成了当前选中的子表值，可能影响到后续操作
        // //$scope.VO2 = $scope.VO;
        // $scope.VO2.project = rows;
        // if (!rows || rows.length != 1) return layer.alert("请选择一条子表数据进行查看!", {
        //     skin: 'layui-layer-lan',
        //     closeBtn: 1
        // });

        $scope.$watch('VO.busi_type', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.busi_type.code) {
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

        $scope.$watch('VO.projecttype', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['projecttypeName'] = $rootScope.SELECT.MARKETTYPE[newVal].name;
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

        $scope.$watch('VO.projecttype', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                var array = $scope.projectGridOptions.data;
                if (array.length > 0) {
                    for (var i = 0; i < array.length; i++) {
                        if (array[i].cinsureman && array[i].cinsureman.name) {
                            var date = new Date;
                            var year = date.getFullYear();
                            var month = date.getMonth() + 1;
                            array[i].cproname = year + "年" + month + "月" + array[i].cinsureman.name + $rootScope.returnSelectName($scope.VO.projecttype, 'MARKETTYPE');
                        }

                    }
                }
            }
        }, true);


        $scope.$watch('VO.pkC0Tradetype.name', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.colEdit = false;
                if (newVal != oldVal) {
                    $scope.VO.busi_type = null;
                    $scope.VO.busiTypeDetailed = null;
                }
                if ($scope.VO.pkC0Tradetype.name) {
                    $http.post($scope.basePath + "batchProject/pkC0TradetypeWatch", {data: angular.toJson($scope.VO)}).success(function (response) {
                        $scope.VO.blanketType = response.result.blanketType;
                        $scope.VO.cooperationType = response.result.cooperationType;
                        $scope.cooperationType_disabled = response.result.cooperationType_disabled;
                        $scope.blanketType_diabled = response.result.blanketType_diabled;
                    });
                } else {
                    $scope.cooperationType_disabled = true;
                    $scope.blanketType_diabled = true;
                }


            }
        }, true);

        $scope.$watch('VO.project', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                var data = $rootScope.diffarray(newVal, oldVal);
                if (data && data.col == 'cinsureman') {
                    if (data.row.cinsureman.name && $scope.VO.projecttype != null) {
                        var array = $scope.projectGridOptions.data;
                        for (var i = 0; i < array.length; i++) {
                            if (array[i].$$hashKey == data.row.$$hashKey) {
                                var date = new Date;
                                var year = date.getFullYear();
                                var month = date.getMonth() + 1;
                                array[i].cproname = year + "年" + month + "月" + data.row.cinsureman.name + $rootScope.returnSelectName($scope.VO.projecttype, 'MARKETTYPE');
                            }
                        }
                    }
                }
            }
        }, true);
        //预计成功开发时间格式验证，手动输入格式不为yyyy-MM-dd格式的，不允许手动输入
        //2019年8月7日16:15:42王若石
        $scope.$watch('VO.project', function (newVal, oldVal) {

            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                var dataLength = $scope.projectGridOptions.data.length;
                for (var i = 0; i < dataLength; i++) {
                    var reg = /^[1-9]\d{3}-([0-9]{1,12})-(0[1-9]|[1-2][0-9]|3[0-1])$/;//月份是1-9时候正则通不过
                    var regExp = new RegExp(reg);
                    if (angular.isDate($scope.projectGridOptions.data[i].planSucceedDate)) {
                        str = $scope.projectGridOptions.data[i].planSucceedDate.getFullYear() + '-' + ($scope.projectGridOptions.data[i].planSucceedDate.getMonth() + 1) + '-' + $scope.projectGridOptions.data[i].planSucceedDate.getDate();
                    } else {
                        str = $scope.projectGridOptions.data[i].planSucceedDate;
                    }
                    if (!regExp.test(str)) {
                        $scope.projectGridOptions.data[i].planSucceedDate = "";
                    }
                }

            }
        }, true);

    };

    $scope.initButton = function () {


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
        //查看业务立项报告
        $scope.onPublicPrintBill = function (){
            $scope.raq = "PublicPrintBill";

            var rows = $scope.projectGridOptions.gridApi.selection.getSelectedRows();

            if (!rows || rows.length != 1) return layer.alert("请选择一条子表数据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $http.post($scope.basePath + "batchProject/PublicPrintBill", {
                data: angular.toJson(rows[0]),
                raq: $scope.raq,
                type: "PDF"
            }).success(function (response) {
                layer.closeAll('loading');
                if (response.code == 200) {
                    layer.closeAll('loading');
                    // if(fun) fun(response);
                    if (response.code == 200) {
                        window.open(getURL(response.queryPath));
                    }
                }

            });
        }
        /**
         * 查看批复单
         */
        $scope.onPrintSignCheckBill = function () {

            $scope.raq = "signCheckBill";
            //var rows = $scope.gridApi.selection.getSelectedRows();
            var rows = $scope.projectGridOptions.gridApi.selection.getSelectedRows();
            //此处将子表的值改成了当前选中的子表值，可能影响到后续操作
            var VO2 = $scope.VO;
            //angular.assignData($scope.VO2, $scope.VO);
            VO2.project = rows;

            if (!rows || rows.length != 1) return layer.alert("请选择一条子表数据进行查看!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });

            layer.load(2);
            $http.post($scope.basePath + "batchProject/signCheckBill", {
                data: angular.toJson(VO2),
                raq: $scope.raq,
                type: "PDF"
            }).success(function (response) {
                layer.closeAll('loading');
                if (response.code == 200) {
                    layer.closeAll('loading');
                    // if(fun) fun(response);
                    if (response.code == 200) {
                        window.open(getURL(response.queryPath));
                    }
                }

            });
        }

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
                template: 'view/batchProject/endProject.html',
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
                $scope.VO.vbillno = angular.copy(null);
                $scope.VO.finallyOpinion = angular.copy(null);
                $scope.VO.finallyGatherDate = angular.copy(null);
                $scope.VO.finallyGatherPeople = angular.copy(null);
                $scope.VO.approvalNumber = angular.copy(null);
                $scope.VO.busi_type = angular.copy(null);
                $scope.VO.busiTypeDetailed = angular.copy(null);
                $scope.VO.pkC0Tradetype = angular.copy(null);
                $scope.VO.pkC0Tradetype = '';
                $scope.VO.isContinue = angular.copy($rootScope.SELECT.PROJECTPROPERTIESTYPE[1].id);
                $scope.VO.dr = $scope.SELECT.DRSTATUS[0].id;
                $scope.VO.dealAttachmentB = [];
                $scope.VO.busi_type_name = angular.copy(null);
                $scope.VO.busiTypeDetailed = angular.copy(null);
                $scope.VO.billstatus = 31;
                $scope.VO.pkAuditor = angular.copy(null);
                $scope.VO.pkChecker = angular.copy(null);
                $scope.VO.auditDate = angular.copy(null);
                $scope.VO.auditTime = angular.copy(null);
                $scope.VO.checkDate = angular.copy(null);
                $scope.VO.checkTime = angular.copy(null);
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
                $scope.VO.ifReInsurance = 0;
                for (var i = 0; i < $scope.projectGridOptions.data.length; i++) {
                    $scope.projectGridOptions.data[i].planSucceedDate = angular.copy(null);
                }
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
                if (rows[0].billstatus != 37) return layer.alert("只有暂存状态可以提交!", {skin: 'layui-layer-lan', closeBtn: 1});
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 37) return layer.alert("只有暂存状态可以提交!", {
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


        /* $scope.onLinkAuditFlow = function () {
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
         };*/

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
            $scope.isClear = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.isContinue = false;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
            $scope.costscaleGridOptions.data = [];
            $scope.projectGridOptions.data = [];
            $scope.coomediumGridOptions.data = [];
        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            if ($scope.isGrid) {
                $scope.form = true;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1)
                    return layer.alert("请选择一条数据进行修改!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                $scope.findOne(rows[0].id, function () {
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.isGrid = false;
                });
            } else if ($scope.isCard) {
                $scope.findOne($scope.VO.id, function () {
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.isCard = false;
                    $scope.form = true;
                });
            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            }
        };

        /**
         * 暂存
         */
        $scope.onTemporary = function (data) {
            $scope.VO.project = $scope.projectGridOptions.data;
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
        /**
         * 卡片
         */
        /*  $scope.onCard = function () {
              var rows = $scope.gridApi.selection.getSelectedRows();
              if (!rows || rows.length != 1)
                  return layer.alert("请选择一条数据进行查看!", {
                      skin: 'layui-layer-lan',
                      closeBtn: 1
                  });
              $scope.findOne(rows[0].id);
              $scope.isBack = true;
              $scope.isGrid = false;
              $scope.isCard = true;
          };*/
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
                    $scope.costscaleGridOptions.data = $scope.VO.costscale;
                    $scope.coomediumGridOptions.data = $scope.VO.coomedium;
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
                    //  layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
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
                    $http.post($scope.basePath + "batchProject/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
         * 发送立项信息至电网资产
         */
        $scope.onSendEmsByProject = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条要发送的立项数据！!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });

            layer.load(2);

            $http.post($rootScope.basePath + "batchProject/sendEmsByProject", {data: angular.toJson(rows[0])}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    layer.alert("发送成功！", {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    layer.alert("操作失败！", {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });

        }
        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            if ($scope.isClear) {
                $scope.VO = $scope.initVO();
                $scope.costscaleGridOptions.data = [];
                $scope.projectGridOptions.data = [];
                $scope.coomediumGridOptions.data = [];
            }
            if ($scope.isEdit && $scope.VO.id != null) {
                $scope.onCard($scope.VO.id);
            } else {
                $scope.isGrid = true;
                $scope.isEdit = false;
                $scope.isCard = false;
            }
        };
        /**
         * 返回
         */
        $scope.onBack = function () {
            if ($stateParams.id) {
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
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    if ($scope.projectGridOptions.data.length > 0) {
                        $scope.VO.c1typeName = $rootScope.returnSelectName($scope.VO.c1type, "PROJECTTYPE");
                        $scope.VO.projecttypeName = $rootScope.returnSelectName($scope.VO.projecttype, "MARKETTYPE");
                        $scope.VO.customerTypeName = $rootScope.returnSelectName($scope.VO.customerType, "PROJECTCUSTOMERTYPE");
                        $scope.VO.blanketTypeName = $rootScope.returnSelectName($scope.VO.blanketType, "BLANKETTYPE");
                        $scope.VO.isContinueName = $rootScope.returnSelectName($scope.VO.isContinue, "PROJECTPROPERTIESTYPE");
                        $scope.VO.cooperationTypeName = $rootScope.returnSelectName($scope.VO.cooperationType, "COOPERATIONTYPE");
                        $scope.VO.ceaseReasonName = $rootScope.returnSelectName($scope.VO.ceaseReason, "CEASEREASONTYPE");
                        $scope.projectGridOptions.data
                        if ($scope.VO.busi_type.name == null || $scope.VO.busi_type.name.length == 0) {
                            return layer.alert("业务分类不可为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        // 预计开发成功时间
                        $scope.VO.project = $scope.projectGridOptions.data;
                        var array = $scope.VO.project;
                        for (let i = 0; i < array.length; i++) {
                            var planSucceedDatess = array[i].planSucceedDate;
                            var planSucceedDates = new Date(Date.parse(planSucceedDatess));
                            var planSucceedDate = planSucceedDates.getFullYear() + '-' + (planSucceedDates.getMonth() + 1) + '-' + planSucceedDates.getDate();
                            temp = planSucceedDate.split('-');
                            var planSucceedDate_year = temp[0];
                            var planSucceedDate_month = parseInt(temp[1], 10);
                            var planSucceedDate_day = parseInt(temp[2], 10);
                            var strDateS = new Date(planSucceedDate_year, planSucceedDate_month - 1, planSucceedDate_day);
                            var date = new Date;
                            var year = date.getFullYear();
                            var month = date.getMonth() + 1;
                            var day = date.getDate();
                            var strDateE = new Date(year, month - 1, day);//把相差的毫秒数转换为天数
                            var days = parseInt((strDateS - strDateE) / 1000 / 60 / 60 / 24);
                            if (($scope.VO.billstatus == 31 || $scope.VO.billstatus == 37) && ($scope.VO.isContinueName != null && $scope.VO.isContinueName == "新增立项") && days < 0) {
                                return layer.alert("预计业务开发成功时间应大于等于当前系统时间!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            var operateDatess = $scope.VO.operateDate;
                            var operateDates = new Date(Date.parse(operateDatess));
                            var operateDate = operateDates.getFullYear() + '-' + (operateDates.getMonth() + 1) + '-' + operateDates.getDate();
                            temp = operateDate.split('-');
                            var operateDate_year = temp[0];
                            var operateDate_month = parseInt(temp[1], 10);
                            var operateDate_day = parseInt(temp[2], 10);
                            var strDateS1 = new Date(operateDate_year, operateDate_month - 1, operateDate_day);
                            var days = parseInt((strDateS - strDateS1) / 1000 / 60 / 60 / 24);
                            if ($scope.VO.billstatus == 31 && $scope.VO.isContinueName != null && $scope.VO.isContinueName == "续立项" && days < 0) {
                                return layer.alert("预计业务开发成功时间不能小于“制单日期”!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }


                        if ($scope.VO.billstatus == 37) {
                            $scope.VO.billstatus = 31;
                        }
                        // // 如果是暂存的数据时，需要修正单据状态
                        //如果已经有了批量立项编号就暂存就不更改状态
                        /*if( $scope.VO.vbillno ==null){
                            if ($scope.VO.billstatus==31) {
                                $scope.VO.billstatus=37;
                            }
                        }*/

                        $scope.onSaveVO();
                    } else {
                        return layer.alert("请先填写子表信息!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
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
         * 子表新增
         */
        $scope.onAddLine = function () {


            layer.load(2);
            if ($scope.selectTabName == 'projectGridOptions') {
                if ($scope.VO.projecttype || $scope.VO.projecttype == 0) {
                    if ($scope.VO.customerType) {
                        ngDialog.openConfirm({
                            showClose: true,
                            closeByDocument: true,
                            template: 'view/batchProject/batchProjectBForm.html',
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
                                for (var i = 0; i < value.length; i++) {
                                    $scope[$scope.selectTabName].data.push(value[i]);
                                }

                            }
                        }, function (reason) {
                        });
                    } else {
                        layer.closeAll('loading');
                        return layer.alert("请选择立项对象类型!", {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                    }


                } else {
                    layer.closeAll('loading');
                    return layer.alert("请选择业务类型!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                }

            } else {
                layer.closeAll('loading');
                $scope[$scope.selectTabName].data.push({});
            }
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
        $scope.form = false;
        $scope.card = false;
        $scope.isClear = false;
        $scope.cooperationType_disabled = true;
        $scope.blanketType_diabled = true;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;
        $scope.isNeedcoomedium = false;
        $scope.isContinue = true;
        $scope.upOrDown = false;
        $scope.htmlPathReportBill = 'view/batchProject/printExecutableReport.html'
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
            exporterCsvFilename: '批量报送业务立项.csv',
            columnDefs: [
                {name: 'vbillno', displayName: '批量立项编号', width: 100,},
                {name: 'c_1_type', displayName: '立项类型', width: 100, cellFilter: 'SELECT_PROJECTTYPE'},
                {name: 'projecttype', displayName: '业务类型', width: 100, cellFilter: 'SELECT_MARKETTYPE'},
                {name: 'busi_type_name', displayName: '业务分类', width: 100},
                {name: 'customer_type', displayName: '立项对象类型', width: 100, cellFilter: 'SELECT_PROJECTCUSTOMERTYPE'},
                {name: 'cooperation_type', displayName: '协作类型', width: 100, cellFilter: 'SELECT_COOPERATIONTYPE'},
                {name: 'isContinue', displayName: '立项性质', width: 100, cellFilter: 'SELECT_PROJECTPROPERTIESTYPE'},
                {name: 'pkOperator_name', displayName: '经办人', width: 100,},
                {name: 'pkOrg_name', displayName: '业务单位', width: 100,},
                {name: 'pkDept_name', displayName: '业务部门', width: 100,},
                {name: 'operate_date', displayName: '操作日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkAuditor_name', displayName: '审核人', width: 100,},
                {name: 'audit_date', displayName: '审核日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'audit_time', displayName: '审核时间', width: 100,},
                {name: 'finally_opinion', displayName: '最终批复意见', width: 100,},
                {name: 'cease_reason', displayName: '项目终结原因', width: 100, cellFilter: 'SELECT_CEASEREASONTYPE'},
                {name: 'if_re_insurance', displayName: '是否为再保险业务', width: 100, cellFilter: 'SELECT_YESNONUM'},
                {name: 'c_memo', displayName: '备注', width: 100,},
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

        $scope.selectTabName = 'projectGridOptions';
        $scope.projectGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '批量立项子项.csv',
            columnDefs: [
                {
                    name: 'cprocode', displayName: '立项编号', width: 100, enableCellEdit: true
                },
                {
                    name: 'cinsureman.name',
                    displayName: '客户名称',
                    width: 100,
                    enableCellEdit: true,
                    url: 'customerListRef/queryForGrid'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'cinsureman'
                },
                {
                    name: 'cinsureman.code', displayName: '客户编号', width: 100, enableCellEdit: false
                },
                {
                    name: 'cinsureman.trade_type.name', displayName: '行业类别', width: 100, enableCellEdit: false
                },
                {
                    name: 'cinsureman.enum_entkind.name', displayName: '单位性质', width: 100, enableCellEdit: false
                },
                {
                    name: 'cproname', displayName: '立项名称(必填)', width: 100, enableCellEdit: true
                },
                {
                    name: 'cinsureman.province.name', displayName: '客户所在区域', width: 100, enableCellEdit: false
                },
                {
                    name: 'c1Province.name',
                    displayName: '项目所在区域（必填）',
                    width: 100,
                    url: 'deptTreeRef/queryForGridForm'
                    ,
                    placeholder: '请选择',
                    editableCellTemplate: 'ui-grid/refEditor',
                    popupModelField: 'c1Province',
                    isTree: true,
                    enableCellEdit: true
                },
                {
                    name: 'cproaddress', displayName: '项目地址（必填）', width: 100, enableCellEdit: true
                },
                {
                    name: 'cperiod_new', displayName: '项目周期(月)', width: 100, enableCellEdit: true
                },
                {
                    name: 'ifBid', displayName: '是否投标', width: 100, cellFilter: 'SELECT_YESNO'
                    , enableCellEdit: true
                    , editableCellTemplate: 'ui-grid/dropdownEditor'
                    , editDropdownValueLabel: 'name'
                    , editDropdownOptionsArray: getSelectOptionData.YESNO
                },
                {
                    name: 'f1Assets', displayName: '资产规模(万元)(必填)', width: 100, enableCellEdit: true


                },
                {
                    name: 'propertyHoldshare', displayName: '控股方(必填)', width: 100, enableCellEdit: true


                },
                {
                    name: 'festimateincome', displayName: '预计业务收入(元)(必填)', width: 100, enableCellEdit: true


                },
                {
                    name: 'planSucceedDate', displayName: '预计业务开发成功时间(必填)', width: 100, cellFilter: 'date:"yyyy-MM-dd"'

                    , type: 'date', editableCellTemplate: 'ui-grid/refDate', enableCellEdit: true

                },
                {
                    name: 'riskAssess', displayName: '业务风险综合评价(必填)', width: 100, enableCellEdit: true


                },
                {
                    name: 'serveContentType', displayName: '提供服务的内容(必填)', width: 100, enableCellEdit: true


                },
                {
                    name: 'customerDemand', displayName: '客户意向及需求', width: 100, enableCellEdit: true


                },
                {
                    name: 'assess', displayName: '项目简介(必填)', width: 100, enableCellEdit: true


                },
                {
                    name: 'customerMemo', displayName: '客户简介(必填)', width: 100, enableCellEdit: true


                },
                {
                    name: 'lifeStaffcountScope',
                    displayName: '员工数量范围',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_PERSONCOUNTTYPE'
                    ,
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.PERSONCOUNTTYPE
                },
                {
                    name: 'societyInsure',
                    displayName: '社会保险情况',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_CASETYPE'
                    ,
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.CASETYPE
                },
                {
                    name: 'enumLifeBusinessInsure',
                    displayName: '商业保险投保',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_CASETYPE'
                    ,
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.CASETYPE
                },
                {
                    name: 'enumCoomedium',
                    displayName: '合作中介情况(必填)',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_CASETYPE'
                    ,
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.CASETYPE
                },
                {
                    name: 'tenderInformation', displayName: '投标业务需总部配合准备资料', width: 100, enableCellEdit: true


                },
                {
                    name: 'ceaseReason',
                    displayName: '项目终结原因',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_CEASEREASONTYPE'
                    ,
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.CEASEREASONTYPE
                },
            ],
            data: $scope.VO.project,
            onRegisterApi: function (gridApi) {
                $scope.projectGridOptions.gridApi = gridApi;
            }
        };
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
                    enableCellEdit: true,
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
                    name: 'mediumName', displayName: '合作中介名称', width: 100, enableCellEdit: true


                },
                {
                    name: 'enumBailmedium',
                    displayName: '委托中介类型',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_AGENCYCOMPTYPE'
                    ,
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.AGENCYCOMPTYPE
                },
                {
                    name: 'memo', displayName: '备注', width: 100, enableCellEdit: true


                },
            ],
            data: $scope.VO.coomedium,
            onRegisterApi: function (gridApi) {
                $scope.coomediumGridOptions.gridApi = gridApi;
            }
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
                    cellFilter: 'SELECT_DOUCUMENTTYPE',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.DOUCUMENTTYPE
                },

                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},

                {
                    name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                },
                {
                    name: 'pk_project_id',
                    displayName: ' ',
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
    };
    $scope.table_name = "lr_batch_project";
    $scope.billdef = "BatchProject";
    $scope.beanName = "insurance.BatchProjectServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initPreviewFile($scope, $rootScope);

    initworkflow($scope, $http, ngDialog);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);
});
app.controller('projectGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
    /**
     * 初始化页面变更方法
     */
    $scope.initQUERYChildren = function () {
        return {}
    };
    $scope.QUERYCHILDREN = $scope.initQUERYChildren();
    $scope.initData = function () {
        $scope.customerGridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {name: 'c0Code', displayName: '客户编号', width: 100},
                {name: 'c0Name', displayName: '客户名称', width: 100},
                {name: 'c1Institution', displayName: '组织机构代码', width: 100},
                {name: 'upCustomer.name', displayName: '集团名称', width: 100},
                {name: 'enumEntkind.name', displayName: '单位性质', width: 100},
                {name: 'tradetype.name', displayName: '行业类别', width: 100},
                {name: 'c1Province.name', displayName: '所属区域', width: 100},
                {name: 'pkOperator_name', displayName: '经办人', width: 100,},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100},
                {name: 'pkDept.name', displayName: '业务部门', width: 100}
            ],
        };
        $scope.customerGridOptions.onRegisterApi = function (gridApi) {
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
                $scope.queryForGridChildren($scope.QUERYCHILDREN);
            });
        };
    };

    $scope.queryForGridChildren = function (data) {
        if (!$scope.queryData) {
            $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.customerGridOptions.columnDefs;
        }
        layer.load(2);
        if (data) {
            data['c_0_type'] = $scope.VO.c0Type;
        } else {
            data = {c_0_type: $scope.VO.c0Type};
        }
        $http.post($scope.basePath + 'customerRef/queryForGridDialog', {
            data: angular.toJson(data),
            page: $scope.gridApi ? $scope.gridApi.page ? $scope.gridApi.page : 1 : 1,
            pageSize: $scope.gridApi ? $scope.gridApi.pageSize ? $scope.gridApi.pageSize : 100 : 100,
            fields: angular.toJson($scope.queryData)
        }).success(function (response) {
            if (response.code == 200) {
                if (!$scope.query) {
                    $scope.query = $scope.customerGridOptions.columnDefs;
                }
                $scope.customerGridOptions.data = response.result.Rows;
                $scope.customerGridOptions.totalItems = response.result.Total;
            }
            layer.closeAll('loading');
        });
    };
    $scope.onQueryChildren = function () {
        $scope.queryForGridChildren($scope.QUERYCHILDREN);
    };
    $scope.onResetChildren = function () {
        $scope.QUERYCHILDREN = $scope.initQUERYChildren();
    };
    $scope.initFunction = function () {
        /**
         * 确定
         */
        $scope.onSaveSelection = function () {
            layer.load(2);
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});


            $http.post($scope.basePath + 'batchProject/saveSub', {
                data: angular.toJson(rows), c1Type: $scope.VO.c1Type, projecttype: $scope.VO.projecttype
            }).success(function (response) {
                layer.closeAll('loading');
                if (response.code == 200) {
                    //$scope.$parent.confirm(response.result);
                    //将弹出窗口点击确定后的子表数据写入$scope.projectGridOptions.data后面再从子表中进行限制
                    //2019年8月15日为了让增行时不清之前的子表数据，进行了返回值的拼接
                    var stitchingData = response.result;
                    stitchingData = stitchingData.concat($scope.VO.project);
                    angular.assignData($scope.VO.project, stitchingData);
                    $scope.projectGridOptions.data = $scope.VO.project;
                    ngDialog.close();
                } else {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });


        };

        $scope.onCancel = function () {
            ngDialog.close();
        };

    };
    $scope.initData();
    $scope.initFunction();
    $scope.queryForGridChildren($scope.QUERYCHILDREN);
});
app.controller('costscaleGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('coomediumGridOptionsCtrl', function ($rootScope, $scope, $sce, $http, uiGridConstants, ngDialog, ngVerify) {
});
