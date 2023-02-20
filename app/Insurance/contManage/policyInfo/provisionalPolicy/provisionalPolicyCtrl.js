/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('provisionalPolicyCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $location) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                insuranceinfo: [],
                insurancedman: [],
                insuranceman: [],
                dealAttachmentB: [],
                partner: [],
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                billstatus: 31,
                insurancebillkindNO: $rootScope.SELECT.INSURANCEBILLKIND[0].id,
                dr: 0,
                insurancetype: "unlife",
                ifuhv: 0,
                vdef12: 0,
            };
        };
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
        $scope.funCode = '30209';
        $scope.param = {
            c_2_type: 0,
            pk_org_str: $rootScope.orgVO.pk,
            busi_type: "notNull"
        };
    };
    $scope.insurancebillRef =
        {
            id: $scope.$id,
            columnDefs: [
                {
                    field: 'insuranceno',
                    displayName: '保单编号'
                },
                {
                    field: 'insuranceinfono',
                    displayName: '保单信息编号'
                },
                {
                    field: 'pkProject.name',
                    displayName: '立项名称'
                }
            ],
            data: ""
        };

    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            if (!findImpData(data)) {
                return false;
            }
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "provisionalPolicy/queryForGrid", {
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

        $scope.findOne = function (pk, callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "provisionalPolicy/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.insuranceinfoGridOptions.data = $scope.VO.insuranceinfo;
                    $scope.insurancedmanGridOptions.data = $scope.VO.insurancedman;
                    $scope.insurancemanGridOptions.data = $scope.VO.insuranceman;
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    $scope.partnerGridOptions.data = $scope.VO.partner;
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
                }
            });
        };

        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $scope.VO.insurancedman = $scope.insurancedmanGridOptions.data;
            $http.post($rootScope.basePath + "provisionalPolicy/save", {data: angular.toJson($scope.VO), funCode: $scope.funCode})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        $scope.plDisabled = true;
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
                });
        };


        $scope.onCheckWithEIMS = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
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

                    $scope.VO.billstatus = 31;
                    $scope.VO.pkOperator = $rootScope.userVO;
                    $scope.VO.operateDate = new Date().format("yyyy-MM-dd");
                    $scope.VO.operateTime = new Date().format("yyyy-MM-dd HH:mm:ss");
                    $scope.VO.receivefeeperiod = null;
                    $scope.VO.insuranceinfono = null;
                    $scope.VO.insuranceno = null;
                    $scope.VO.id = null;

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

    $scope.initWatch = function () {

        $scope.$watch('VO.insurancebillkindNO', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['insurancebillkindNOName'] = $rootScope.SELECT.INSURANCEBILLKIND[newVal].name;
            }
        }, true);

        $scope.$watch('VO.vdef12', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['vdef12Name'] = $rootScope.SELECT.BUSINESSTYPE[newVal].name;
            }
        }, true);

        $scope.$watch('VO.vdef10NO', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.VO['vdef10NOName'] = $rootScope.SELECT.VDEF10[newVal].name;
            }
        }, true);

        //90的校验
        $scope.$watch('VO.startdate', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if ($scope.VO.pkProject.name != null && $scope.VO.startdate != null) {
                $scope.plDisabled = false;
            }
            // || (!angular.isUndefined($scope.VO.pkReport))
            if (newVal === oldVal || newVal == undefined || newVal == null) return;

            if ($scope.isEdit) {

                var olddatval = "";
                if (oldVal != null) {
                    olddatval = new Date(oldVal).format("yyyy-MM-dd");
                }
                var newdatval = "";
                if (newVal != null) {
                    newdatval = new Date(newVal).format("yyyy-MM-dd");
                }
                if (newdatval == olddatval) {
                    return;
                }
                var now = new Date().getTime();
                var selected = new Date(newVal).getTime();
                var dates = (new Date(newVal).setMonth(new Date(newVal).getMonth() + 3));
                $scope.VO.enddate = new Date(dates).setDate(new Date(dates).getDate() - 1);
                if ($scope.VO.pkReport) {
                    return;
                }
                var startDate = new Date($scope.VO.startdate).getTime();
                var endDate = new Date($scope.VO.enddate).getTime();
                var yearStart = new Date($scope.VO.startdate);
                var yearStart1 = new Date($scope.VO.startdate);
                var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                var time = yearEnd - yearStart.getTime();
                if ($scope.insuranceinfoGridOptions.data) {
                    for (var i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                        $scope.insuranceinfoGridOptions.data[i].insurancecharge = (parseFloat($scope.insuranceinfoGridOptions.data[i].insurancemoney) * parseFloat($scope.insuranceinfoGridOptions.data[i].chargerate) * parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000)).toFixed(2);
                    }
                }
            }
        }, true);
        $scope.$watch('VO.enddate', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            var olddatval = "";
            if (oldVal != null) {
                olddatval = new Date(oldVal).format("yyyy-MM-dd");
            }
            var newdatval = "";
            if (newVal != null) {
                newdatval = new Date(newVal).format("yyyy-MM-dd");
            }
            if (newdatval == olddatval) {
                return;
            }
            // || (!angular.isUndefined($scope.VO.pkReport))
            if (typeof (oldVal) == "object" || newVal === oldVal || olddatval == newdatval || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                var startDate = new Date($scope.VO.startdate).getTime();
                var endDate = new Date($scope.VO.enddate).getTime();
                var yearStart = new Date($scope.VO.startdate);
                var yearStart1 = new Date($scope.VO.startdate);
                var yearEnd = yearStart1.setFullYear(yearStart.getFullYear() + 1);
                var time = yearEnd - yearStart.getTime();
                if ($scope.insuranceinfoGridOptions.data) {
                    for (var i = 0; i < $scope.insuranceinfoGridOptions.data.length; i++) {
                        $scope.insuranceinfoGridOptions.data[i].insurancecharge = (parseFloat($scope.insuranceinfoGridOptions.data[i].insurancemoney) * parseFloat($scope.insuranceinfoGridOptions.data[i].chargerate) * parseFloat(((endDate - startDate) / 24 / 3600 / 1000) + 1) / 1000 / parseFloat(time / 24 / 3600 / 1000)).toFixed(2);
                    }
                }
            }
        }, true);

        $scope.$watch('VO.estimatepk.name', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.estimatepk.c_0_address) {
                    $scope.VO.estimateaddr = $scope.VO.estimatepk.c_0_address;
                } else {
                    $scope.VO.estimateaddr = "";
                }
                if ($scope.VO.estimatepk.pk) {
                    $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: $scope.VO.estimatepk.pk}).success(function (response) {
                        if (response && response.code == "200") {
                            if (response.result.linkman != null && response.result.linkman.length > 0) {
                                $scope.VO.estimatelinkman = response.result.linkman[0].name;
                                $scope.VO.estimatelinktel = response.result.linkman[0].tele;
                            }
                        }
                    });

                } else {
                    $scope.VO.estimatelinkman = "";
                    $scope.VO.estimatelinktel = "";

                }
            }
        }, true);

        $scope.$watch('VO.pkProject.name', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if ($scope.VO.pkProject.name != null && $scope.VO.startdate != null) {
                $scope.plDisabled = false;
            }
            $scope.VO.estimatepk = "";
            $scope.VO.estimateaddr = "";
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.pkProject.pk) {
                    $http.post($scope.basePath + "propertyProject/findOne", {pk: $scope.VO.pkProject.pk}).success(function (response) {
                        if (response && response.code == "200") {
                            if (response.result) {
                                $scope.VO.estimatepk = response.result.cinsureman;
                                $scope.VO.pkC0Tradetype = response.result.pkC0Tradetype;
                                $scope.VO.projectkind = response.result.pkC0Tradetype && response.result.pkC0Tradetype.name;
                                $scope.VO.busi_type = response.result.busi_type;
                                $scope.VO.temporaryPlan = response.result.temporaryPlan;
                            }
                        }
                    });
                } else {
                    $scope.VO.estimatelinkman = "";
                }
            }
        }, true);

        $scope.$watch('VO.insurancebill.insuranceno', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.insurancebill.id) {
                    $http.post($scope.basePath + "provisionalPolicy/findById", {id: $scope.VO.insurancebill.id}).success(function (response) {
                        if (response && response.code == "200") {
                            if (response.result) {
                                $scope.VO.insurancebill.insuranceno = response.result.insuranceno;
                                $scope.VO.insurancebill.insuranceinfono = response.result.insuranceinfono;
                                if (response.result.insuranceman != null) {
                                    $scope.insurancemanGridOptions.data = JSON.parse(response.result.insuranceman);
                                }
                                if (response.result.insuranceinfo != null) {
                                    $scope.insuranceinfoGridOptions.data = JSON.parse(response.result.insuranceinfo);
                                }
                                if (response.result.insurancedman != null) {
                                    $scope.insurancedmanGridOptions.data = JSON.parse(response.result.insurancedman);
                                }
                            }
                        }
                    });
                }
            }
        }, true);

        $scope.$watch('VO.insurancedman', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                var data = $rootScope.diffarray(newVal, oldVal);
                if (data && data.col == 'insurancedmanpk') {
                    if (data.row.insurancedmanpk) {
                        if (data.row.insurancedmanpk.pk) {
                            if (data.row.insurancedmanpk.c_0_address) {
                                data.row.insurancedmanaddr = data.row.insurancedmanpk.c_0_address;
                            } else {
                                data.row.insurancedmanaddr = '不详';
                            }
                            $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: data.row.insurancedmanpk.pk}).success(function (response) {
                                if (response && response.code == "200") {
                                    if (response.result.linkman != null && response.result.linkman.length > 0) {
                                        data.row.insurancedmanlinkman = response.result.linkman[0].name;
                                        data.row.insurancedmanlinktel = response.result.linkman[0].tele;
                                    } else {
                                        data.row.insurancedmanlinkman = '不详';
                                        data.row.insurancedmanlinktel = '不详';
                                    }
                                }
                            });
                        }
                    } else {
                        data.row.insurancedmanlinkman = '不详';
                        data.row.insurancedmanlinktel = '不详';
                    }
                }
            }
        }, true);
        $scope.$watch('VO.insuranceman', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                var data = $rootScope.diffarray(newVal, oldVal);
                if (data && data.col == 'insurancemanpk') {
                    if (data.row.insurancemanpk) {
                        if (data.row.insurancemanpk.pk && data.row.insurancemanpk.pk != data.oldValue.pk) {
                            if (data.row.insurancemanpk.c_0_address) {
                                data.row.insuranceaddr = data.row.insurancemanpk.c_0_address;
                            } else {
                                data.row.insuranceaddr = '不详';
                            }
                            $http.post($scope.basePath + "stateGridCustomer/findOne", {pk: data.row.insurancemanpk.pk}).success(function (response) {
                                if (response && response.code == "200") {
                                    if (response.result.linkman != null && response.result.linkman.length > 0) {
                                        data.row.insurancelinkman = response.result.linkman[0].name;
                                        data.row.insurancelinktel = response.result.linkman[0].tele;
                                    } else {
                                        data.row.insurancelinkman = '不详';
                                        data.row.insurancelinktel = '不详';
                                    }
                                }
                            });
                        } else {
                            data.row.insurancemanpk = '';
                        }
                    } else {
                        data.row.insurancelinkman = '';
                        data.row.insurancelinktel = '';
                    }
                }
            }
        }, true);

        //险种信息如果手动输入没有主键，此处不允许手动输入
        $scope.$watch('VO.insuranceinfo', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;

            if ($scope.isEdit && newVal.maininsurance != 'Y') {
                var data = $rootScope.diffarray(newVal, oldVal);
                if (data && oldVal && data.col == 'insurancepk') {
                    if (data.row.insurancepk) {
                        if (data.row.insurancepk.pk == undefined) {
                            data.row.insurancepk = '';
                        }
                        //如果第一次选择了，第二次手动输入判断
                        else if (data.newValue.pk == data.oldValue.pk) {
                            data.row.insurancepk = '';
                        }

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

                    //  第一次初始化成null，后台没值，应该【】
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
            $scope.isClear = true;
            $scope.form = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.plDisabled = true;
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
            //  控制字表按钮的显示

            $scope.isEdit = true;
            $scope.isClear = false;
            //$scope.childFlag = true;
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
            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            }
        };

        /**
         * 续暂保
         */
        $scope.onRenewal = function () {
            //  控制字表按钮的显示
            $scope.isClear = false;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行操作!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.isGrid = false;
                $scope.form = true;
                $scope.findOne(rows[0].id, function () {
                    $scope.VO.brokerageAgencyName = $rootScope.orgVO.name;
                    $scope.VO.dept = $rootScope.deptVO.name;
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.VO.billstatus = 31;
                    $scope.VO.pkOperator = $rootScope.userVO;
                    $scope.VO.operateDate = new Date().format("yyyy-MM-dd");
                    $scope.VO.operateTime = new Date().format("yyyy-MM-dd HH:mm:ss");
                    $scope.VO.insuranceinfono = null;
                    $scope.VO.startdate = null;
                    $scope.VO.enddate = null;
                    // $scope.VO.pkProject = null;
                    $scope.VO.id = null;
                    $scope.gridApi.selection.getSelectedRows()[0] = $scope.VO;
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
            $scope.VO.insuranceinfo = $scope.insuranceinfoGridOptions.data;
            $scope.VO.insuranceman = $scope.insurancemanGridOptions.data;
            $scope.VO.partner = $scope.partnerGridOptions.data;
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
            $scope.isBack = true;
            $scope.isGrid = false;
            $scope.isCard = true;
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
                    $http.post($scope.basePath + "provisionalPolicy/delete", {ids: angular.toJson(ids)}).success(function (response) {
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

        $scope.onCheckInsuranceno = function () {
            $http.post($scope.basePath + "provisionalPolicy/checkInsuranceno", {
                param: angular.toJson($scope.VO),
                "insureType": "unlife"
            }).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    if (response.msg) {
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                } else {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };

        /**
         * 返回业务签报批复编号查询URL
         */
        $scope.reportUrl = function (param) {
            return "reportRef/queryForGrid?pk_project=" + param;
        }
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
                if ($scope.VO.billstatus == 31) {
                    $scope.insuranceinfoGridOptions.data = [];
                    $scope.insurancedmanGridOptions.data = [];
                    $scope.insurancemanGridOptions.data = [];
                    $scope.partnerGridOptions.data = [];
                    $scope.dealAttachmentBGridOptions.data = [];
                } else {
                    $scope.VO = $scope.initVO();
                }
            }
            $scope.isDisabled = true;
            $scope.isEdit = false;
            $scope.isBack = false;
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
            //阻止页面渲染
            $scope.queryForGrid($scope.QUERY);
        };

        /**
         * 保存判断必输项
         */
        $scope.onSave = function () {
            if (!findImpData($scope.VO)) {
                return false;
            }
            if ($scope.isUploadAnytime) {
                $scope.onSaveVO();
                return;
            }

            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert(errEls[0].ngVerify.OPTS.message,
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    $scope.VO.insurancebillkindNOName = $rootScope.returnSelectName($scope.VO.insurancebillkindNO, "INSURANCEBILLKIND");
                    $scope.VO.vdef12Name = $rootScope.returnSelectName($scope.VO.vdef12, "BUSINESSTYPE");
                    $scope.VO.vdef10NOName = $rootScope.returnSelectName($scope.VO.vdef10NO, "VDEF10");
                    $scope.VO.vdef2Name = $rootScope.returnSelectName($scope.VO.vdef2, "YESNO");

                    $scope.childFlag = true;
                    //对当前日期与保单起始日期进行校验
                    if (!$scope.VO.pkReport) {
                        var now = new Date().getTime();
                        var selected = new Date($scope.VO.startdate).getTime();
                        var dates = (new Date($scope.VO.startdate).setFullYear(new Date($scope.VO.startdate).getFullYear() + 1));
                    }
                    if ($scope.insuranceinfoGridOptions.data.length == 0) {
                        return layer.alert("保险险种信息子表不能为空!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.insuranceinfoGridOptions.data.length > 0) {
                        $scope.VO.insuranceinfo = $scope.insuranceinfoGridOptions.data;
                        angular.forEach($scope.VO.insuranceinfo, function (item) {
                            if (!item.insurancepk && item.maininsurance == 'Y') {
                                $scope.childFlag = false;
                                return layer.alert("子表属性险种名称不可为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }

                            // if (!item.chargerate) {
                            //     $scope.childFlag = false;
                            //     return layer.alert("子表属性费率不可为空!",
                            //         {skin: 'layui-layer-lan', closeBtn: 1});
                            // }

                        })
                    }
                    var chiefmanY = 0;
                    if ($scope.childFlag) {
                        if ($scope.insurancedmanGridOptions.data.length == 0) {
                            return layer.alert("被保险人信息子表不能为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if ($scope.childFlag) {
                        if ($scope.insurancemanGridOptions.data.length == 0) {
                            return layer.alert("保险人信息子表不能为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if ($scope.insurancemanGridOptions.data.length > 0) {
                            var totalFeemount = 0;
                            $scope.VO.insuranceman = $scope.insurancemanGridOptions.data;
                            angular.forEach($scope.VO.insuranceman, function (item) {
                                if (item.feemount) {
                                    totalFeemount = totalFeemount + eval(item.feemount);
                                }
                                if (!item.insurancemanpk) {
                                    $scope.childFlag = false;
                                    chiefmanY = 1;
                                    return layer.alert("子表属性保险人名称不可为空!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                                if (item.chiefman == 'Y') {
                                    chiefmanY = chiefmanY + 1;
                                }

                                if (item.insurancemanpk.name == $scope.VO.estimatepk.name) {
                                    $scope.childFlag = false;
                                    chiefmanY = 1;
                                    return layer.alert("保险人与投保人不能相同!",
                                        {skin: 'layui-layer-lan', closeBtn: 1});
                                }
                            })

                        }
                        if (chiefmanY <= 0) {
                            $scope.childFlag = false;

                            return layer.alert("保险人信息子表必须有一个保险人主承保!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }

                    }
                    if ($scope.dealAttachmentBGridOptions.data.length == 0) {
                        return layer.alert("请上传附件！",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if ($scope.childFlag) {
                        if ($scope.childFlag) {
                            // 如果是暂存的数据时，需要修正单据状态
                            if ($scope.VO.billstatus == 37) {
                                $scope.VO.billstatus = 31;
                            }
                            $scope.onSaveVO();
                        }
                    }

                }
            }, true);
        };

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            if ($scope.QUERY["startdate^gte"] && $scope.QUERY["startdate^lte"]) {
                if (new Date($scope.QUERY["startdate^gte"]) > new Date($scope.QUERY["startdate^lte"])) {
                    return layer.alert("结束时间必须大于开始时间!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
            if ($scope.QUERY["enddate^gte"] && $scope.QUERY["enddate^lte"]) {
                if (new Date($scope.QUERY["enddate^gte"]) > new Date($scope.QUERY["enddate^lte"])) {
                    return layer.alert("结束时间必须大于开始时间!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
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
            if ($scope.selectTabName == 'insurancedmanGridOptions') {
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: 'view/batchProject/insureCustomerRef.html',
                    className: 'ngdialog-theme-formInfo',
                    controller: 'insurancedmanGridOptionsCtrl2',
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
                var data = {};
                if ($scope.selectTabName == 'insuranceinfoGridOptions') {//险种信息
                    if ($scope.insuranceinfoGridOptions.data.length == 0) {
                        data.maininsurance = 'Y';
                    }
                    data.chargerate = '0';
                } else if ($scope.selectTabName == 'insurancemanGridOptions') {//保险人
                    if ($scope.insuranceinfoGridOptions.data.length == 0) {
                        data.chiefman = 'N';
                        data.maininsurance = 'Y';
                    } else {
                        data.chiefman = 'N';
                    }
                    if ($scope.insurancemanGridOptions.data.length == 0) {
                        data.chiefman = 'Y';
                        data.insurancerate = 100;
                        var inData = $scope.insurancemanGridOptions.data;
                    }
                }
                $scope[$scope.selectTabName].data.push(data);
            }

        };

        // $scope.onAddLine = function () {
        //     var data = {};
        //     if ($scope.selectTabName == 'insuranceinfoGridOptions') {//险种信息
        //         if ($scope.insuranceinfoGridOptions.data.length == 0) {
        //             data.maininsurance = 'Y';
        //         }
        //         data.chargerate = '0';
        //     } else if ($scope.selectTabName == 'insurancemanGridOptions') {//保险人
        //         if ($scope.insuranceinfoGridOptions.data.length == 0) {
        //             data.chiefman = 'N';
        //             data.maininsurance = 'Y';
        //         } else {
        //             data.chiefman = 'N';
        //         }
        //         if ($scope.insurancemanGridOptions.data.length == 0) {
        //             data.chiefman = 'Y';
        //             var inData = $scope.insurancemanGridOptions.data;
        //         }
        //     }
        //     $scope[$scope.selectTabName].data.push(data);
        //
        // };


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
            var array = $scope.insuranceinfoGridOptions.data;
            $scope.VO.insurancetotalmoney = 0;
            if (array.length == 0) {
                $scope.VO.insurancetotalcharge = 0;
            } else {
                for (var i = 0; i < array.length; i++) {
                    $scope.VO.insurancetotalcharge = eval(parseFloat(array[i].insurancecharge).toFixed(2));
                    if (array[i].maininsurance == 'Y') {
                        $scope.VO.insurancetotalmoney = eval(parseFloat(array[i].insurancemoney).toFixed(2));
                    }
                }
            }
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
            exporterMenuCsv: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '暂保单.csv',
            columnDefs: [
                {name: 'insuranceinfono', displayName: '暂保单信息编号', width: 100,},
                {name: 'pkProject.name', displayName: '业务/项目名称', width: 100,},
                {name: 'pkProject.code', displayName: '立项号 ', width: 100,},
                {name: 'busi_type.name', displayName: '业务分类 ', width: 100,},
                {name: 'pkC0Tradetype.name', displayName: '客户产权关系 ', width: 100,},
                {name: 'insurancesPolicy', displayName: '保险公司暂保单号 ', width: 100,},
                {name: 'insuranceno', displayName: '暂保单名称', width: 100, cellFilter: 'CSV_FILTER'},
                {name: 'startdate', displayName: '保险起始日期', width: 100,},
                {name: 'enddate', displayName: '保险到期日期', width: 100,},
                {name: 'estimatepk.name', displayName: '投保人', width: 100,},
                {name: 'estimateaddr', displayName: '投保人地址', width: 100,},
                {name: 'estimatelinkman', displayName: '投保人联系人姓名', width: 100,},
                {name: 'estimatelinktel', displayName: '投保人联系人电话', width: 100,},
                {name: 'insurancebillkindNO', displayName: '保单性质', width: 100, cellFilter: 'SELECT_INSURANCEBILLKIND'},
                {name: 'vdef2', displayName: '是否有追溯期', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'insurancesum', displayName: '保单件数', width: 100,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator.name', displayName: '经办人', width: 100,},
                {name: 'operateDate', displayName: '制单日期', width: 100,},
                {name: 'operateTime', displayName: '制单时间', width: 100,},
                {name: 'pkChecker.name', displayName: '审批人', width: 100,},
                {name: 'checkDate', displayName: '审批日期', width: 100, cellFilter: 'date_cell_date'},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '部门', width: 100,},

            ],
            data: [],
            exporterAllDataFn: function () {
                $scope.queryAllForGrid($scope.QUERY).then(function () {
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
                    name: 'cMemo', displayName: '备注', width: 100,
                    enableCellEdit: true
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
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '被保险人子表.csv',
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            showColumnFooter: true,
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
                    params: {type: 'beibaoxianren'}, enableCellEdit: false
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
                    name: 'insurancemoney', displayName: '保险金额/赔偿限额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },

            ],
            data: $scope.VO.insurancedman,
            onRegisterApi: function (gridApi) {
                //添加行头
                gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
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
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            showColumnFooter: true,
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
                    name: 'insurancerate', displayName: '承保比例(%)', width: 100


                },
                {
                    name: 'insurancemoney', displayName: '保险金额/赔偿限额(元)', width: 100, cellFilter: 'AMOUNT_FILTER',
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
                //添加行头
                gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
                $scope.insurancemanGridOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        var array = $scope.insurancemanGridOptions.data;
                        if ('chiefman' == colDef.name) {
                            if (newValue == 'Y') {
                                for (var i = 0; i < array.length; i++) {
                                    if (array[i].$$hashKey != rowEntity.$$hashKey) {
                                        array[i].chiefman = 'N';
                                    }
                                }
                            }
                        }
                        $scope.$apply();
                    });
                }
            }
        };

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
                    name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false
                },
                {
                    name: 'cUpdate', displayName: '上传时间', width: 100, enableCellEdit: false
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
        }
    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();

        if ($scope.selectTabName == 'dealAttachmentBGridOptions') {
            $scope.upOrDown = true;
        } else {
            $scope.upOrDown = false;
        }

    };
    $scope.table_name = "lr_provisional";
    $scope.billdef = "ProvisionalPolicy";
    $scope.beanName = "insurance.ProvisionalPolicyServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();

    initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope, $rootScope);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);


});
app.controller('insuranceinfoGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('insurancedmanGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('insurancemanGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('partnerGridOptionsCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
});
app.controller('insurancedmanGridOptionsCtrl2', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {

    $scope.initQUERYChildren = function () {
        return {
            // insurancedmanpk:[]
        }
    };
    $scope.customerRef =
        {
            id: $scope.$id,
            columnDefs: [
                {
                    field: 'code',
                    displayName: '客户编号'
                },
                {
                    field: 'name',
                    displayName: '客户名称'
                }
            ],
            data: ""
        };
    $scope.QUERYCHILDREN = $scope.initQUERYChildren();

    $scope.QUERYCHILDREN.pk_org = 1;
    // $scope.QUERYCHILDREN.c_0_type = 1;
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
                {name: 'code', displayName: '客户编号', width: 100},
                {name: 'name', displayName: '客户名称', width: 100},
                {name: 'c1Institution', displayName: '组织机构代码', width: 100},
                {name: 'upCustomer_name', displayName: '集团名称', width: 100},
                {name: 'c_0_address', displayName: '集团地址', width: 100},
                // {name: 'enumEntkind_name', displayName: '单位性质', width: 100},
                {name: 'tradetype_name', displayName: '行业类别', width: 100},
                // {name: 'c1Province_name', displayName: '所属区域', width: 100},
                {name: 'pkOrg_name', displayName: '业务单位', width: 100},
                {name: 'pkDept_name', displayName: '业务部门', width: 100}
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

        if ($scope.QUERYCHILDREN.insurancedmanpk != null) {
            data['id'] = $scope.QUERYCHILDREN.insurancedmanpk.pk;
        }

        $http.post($scope.basePath + 'insuranceScheme/queryInsurancedmanByUp', {
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
        $scope.onSaveSelection = function (i) {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});
            for (var j = 0; j < rows.length; j++) {
                var insurancedmanpk = {
                    pk: rows[j].pk,
                    insurancedmanpk: {
                        pk: rows[j].pk,
                        name: rows[j].name,
                        enumEntkind_pk: rows[j].enumEntkind_name,
                        code: rows[j].code,
                        billstatus: rows[j].BILLSTATUS,
                        tradetype_name: rows[j].tradetype_name,
                        tradetype_code: rows[j].tradetype_name,
                        c1Province_name: rows[j].c1Province_name,
                        pk_org: rows[j].PK_ORG,
                        c_1_entkind: rows[j].C_1_ENTKIND,
                        c_0_upcostomer: rows[j].C_0_UPCOSTOMER,
                        enumEntkind_name: rows[j].enumEntkind_name,
                        c_1_province: rows[j].C_1_PROVINCE,
                        enumEntkind_code: rows[j].enumEntkind_name,
                        c_0_type: rows[j].C_0_TYPE,
                        c_1_institution: rows[j].C_1_INSTITUTION,
                        enum_entkind: rows[j].ENUM_ENTKIND,
                        tradetype_pk: rows[j].C_0_TRADETYPE
                    },
                    insurancedmanlinkman: rows[j].insurancedmanlinkman,
                    insurancedman: rows[j].name,
                    insurancedmanaddr: rows[j].c_0_address,
                };
                if (null == $scope.insurancedmanGridOptions.data) {
                    $scope.insurancedmanGridOptions.data = new Array();
                }
                var temp = true;
                for (var k = 0; k < $scope.insurancedmanGridOptions.data.length; k++) {
                    if ($scope.insurancedmanGridOptions.data.pk == insurancedmanpk.pk) {
                        temp = false;
                    }
                }
                if (temp) {
                    $scope.insurancedmanGridOptions.data.push(insurancedmanpk);
                }
            }
            ngDialog.close();
        };
        $scope.onCancel = function () {
            ngDialog.close();
        };

    };
    $scope.initData();
    $scope.initFunction();
    $scope.queryForGridChildren($scope.QUERYCHILDREN);
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
