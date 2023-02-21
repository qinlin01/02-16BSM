/**
 * Created by jiaoshy on 2017/3/20.
 */
app.controller('personalProjectCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, $location, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.initVO = function () {
            return {
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                c1type: 0,
                isQuote: 'Y',
                billstatus:31,
                cperiod: '12',
                costscale: [],
                ifReInsurance:0,
                ifJobDomain:'',
                coomedium: [],
                assess:"",
                assessNum:0,
                ifFictitious: 'N'
            };
        };
        $scope.entityVO = 'nc.vo.busi.ProjectVO';
        //主表数据
        $scope.VO = $scope.initVO();
        $scope.colEdit = true;
        //初始化查询
        $scope.initQUERY = function () {
            return { 
            "operate_year": parseInt(new Date().format("yyyy")),
            "id":$stateParams.id
            }
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode ='2030102';
    };

    $scope.changeText = function () {
        $scope.VO.assessNum = $scope.VO.assess.length;
    };
    $scope.initHttp = function () {

        $scope.getBusiTypeByCustomer = function (customer) {
            $http.post($scope.basePath + "config/getBusiTypeByCustomer", {
                data: angular.toJson(customer),
            }).success(function (response) {
                if (response.code == 200) {
                    if(response.data && response.data.length > 0){
                        $scope.busiTypeGridOptions.data = response.data;
                        ngDialog.openConfirm({
                            showClose: true,
                            closeByDocument: false,
                            template: 'view/propertyProject/choseBusiType.html',
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
                    }else{
                        layer.alert("未查询到对应客户的业务分类！", {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                }
            });
        };

        //查询历史
        $scope.onProjectHis = function () {
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: "view/personalProject/projectHisForm.html",
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

        //列表查询
        $scope.queryForGrid = function (data) {
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "personalProject/queryForGrid", {
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
        $scope.findOne = function (pk,callback) {
            $scope.pk = pk;
            $http.post($scope.basePath + "personalProject/findOne", {pk: pk}).success(function (response)  {
                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    if(callback){
                        callback();
                    }
                } else {
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
                   // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };

        $scope.onSubSaveVO = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "personalProject/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
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
            $scope.VO['trade_type'] = $scope.VO.pkC0Tradetype.code;
            layer.load(2);
            $http.post($rootScope.basePath + "personalProject/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
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
                    if(response){
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function(matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            if($scope.VO.festimateincome > 100000 && $scope.VO.isContinue == 0 && (($scope.VO.busi_type.code.indexOf("2-2") == 0 && $scope.VO.busi_type.code!='2-2-4-1') || $scope.VO.busi_type.code == '1-2-1-1')){
                                layer.alert("业务分类为市场业务部部分业务时，并且预计业务收入大于十万元的立项，请在业务文件申报审批节点录入保险方案！", {skin: 'layui-layer-lan', closeBtn: 1});
                            }else{
                                layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                    }
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

        /**
         * 判断是否子公司录单
         */
        $scope.isSubsidiary = function () {
            $scope.ifSubsidiary = false;
            const orgPk = $rootScope.orgVO.pk;
            $http.post($scope.basePath + "config/getSubsidiaryList").success(function (response) {
                if(response.code == 200){
                    if(response.data.indexOf(orgPk) >= 0){
                        $scope.ifSubsidiary = true;
                    }else{
                        $scope.ifSubsidiary = false;
                    }
                }
            });
        };

        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function (item) {
            if(item && item.id){
                $scope.onCard(item.id);
            }

        };
    };

    $scope.initWatch = function () {

        $scope.$watch('VO.pkC0Tradetype', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                $scope.colEdit = false;
                if(newVal != oldVal && !$scope.ifSubsidiary){
                    $scope.VO.busi_type = null;
                    $scope.VO.busiTypeDetailed = null;
                }
            }
        }, true);

        $scope.$watch('VO.busi_type', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if($scope.VO.busi_type.code){
                    var ltype = $scope.VO.busi_type.parentName.split(",");
                    $scope.VO.busiTypeDetailed = "";
                    var len = ltype.length > 3 ? 3 : ltype.length;
                    for(var i = 0;i< len ; i ++){
                        if(i==len-1){
                            $scope.VO.busiTypeDetailed  +=ltype[i];
                        }else{
                            $scope.VO.busiTypeDetailed  +=ltype[i]+ "/";
                        }
                    }
                }
            }
        }, true);

        $scope.$watch('VO.projectType', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                var date = new Date();
                $scope.VO['projectTypeName'] = $rootScope.SELECT.MARKETTYPE[newVal].name;
                $scope.VO.cproname = date.getFullYear()+"年"+date.getMonth()+"月"+$scope.VO.cinsureman.name+ $scope.VO.projectTypeName;
            }
        }, true);

        $scope.$watch('VO.cinsureman.name', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.c2Type!=null) {
                    var date = new Date;
                    var year = date.getFullYear();
                    var month = date.getMonth()+1;
                    $scope.VO.cproname = year + "年" + month +"月" + newVal + $rootScope.returnSelectName($scope.VO.c2Type, 'MARKETTYPE');
                }
                //子公司自动带出业务分类客户产权关系
                if ($scope.ifSubsidiary) {
                    $scope.getBusiTypeByCustomer($scope.VO.cinsureman);
                }
            }
        }, true);
        $scope.$watch('VO.c2Type', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.cinsureman && $scope.VO.cinsureman.name) {
                    var date = new Date;
                    var year = date.getFullYear();
                    var month = date.getMonth()+1;
                    $scope.VO.cproname = year + "年" + month +"月" + $scope.VO.cinsureman.name + $rootScope.returnSelectName(newVal, 'MARKETTYPE');
                }
            }
        }, true);
    };

    $scope.initButton = function () {

        $scope.onChonseBusiType = function (){
            var rows = $scope.busiTypeGridOptions.gridApi.selection.getSelectedRows();
            if(rows && rows.length == 1){
                $scope.VO.pkC0Tradetype = rows[0].pkC0Tradetype;
                $scope.VO.busi_type = rows[0].busiType;
                ngDialog.close();
            }else {
                layer.alert("只能选择一条业务分类!", {skin: 'layui-layer-lan', closeBtn: 1});
            }
        }

        $scope.onCancelBusiType = function (){
            ngDialog.close();
        }

        $scope.onSubCancel = function(){
            ngDialog.close();
        }

        /**
         * 终止项目
         */
        $scope.onEndProject = function(){
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/personalProject/endProject.html',
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
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };

        /*
        * 续立项
         */
        $scope.onContinue = function(){

            //  控制字表按钮的显示

            var rows = $scope.gridApi.selection.getSelectedRows();
            $scope.findOne(rows[0].id,function(){
                $scope.form = true;
                $scope.VO.id = angular.copy(null);
                $scope.VO.pkC0Tradetype = angular.copy(null);
                $scope.VO.busi_type = angular.copy(null);
                $scope.VO.cprocode = angular.copy(null);
                $scope.VO.pkC0Tradetype = '';
                $scope.VO.isContinue = angular.copy($rootScope.SELECT.PROJECTPROPERTIESTYPE[1].id);
                $scope.VO.dr=$scope.SELECT.DRSTATUS[0].id;
                $scope.VO.busi_type_name = angular.copy(null);
                $scope.VO.busiTypeDetailed = angular.copy(null);
                $scope.VO.billstatus = 31;
                $scope.VO.pkAuditor = angular.copy(null);
                $scope.VO.pkChecker = angular.copy(null);
                $scope.VO.auditDate = angular.copy(null);
                $scope.VO.auditTime = angular.copy(null);
                $scope.VO.checkDate = angular.copy(null);
                $scope.VO.checkTime = angular.copy(null);
                $scope.VO.pkOperator =$rootScope.userVO;
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
            });

        }


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
            $scope.isSubsidiary();
            $scope.form=true;
            $scope.isGrid = false;
            $scope.isClear = true;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.isContinue = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.initView();
            angular.assignData($scope.VO, $scope.initVO());
            $rootScope.onAddCheck($scope);
            $http.post($scope.basePath + "personalCustomerRef/queryForGridByAdd", {data: null}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    $scope.VO.cinsureman = angular.copy(response.result);
                }

            });
        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            $scope.isSubsidiary();
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form=true;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id,function(){
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
         * 暂存
         */
        $scope.onTemporary = function (data) {
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
            if(!id){
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1)
                    return layer.alert("请选择一条数据进行查看!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                id = rows[0].id;
            }
            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {pk:id,tableName:$scope.table_name,billdef:$scope.billdef}).success(function (response)  {
                if (response && response.code == "200") {
                    $scope.card=true;
                    angular.assignData($scope.VO, response.result);
                    if(!response.result.taskHis)
                        $scope.mess=false;
                    else
                        $scope.mess=true;
                    $scope.isBack = true;
                    $scope.isGrid = false;
                    $scope.isCard = true;

                } else {
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
                   // layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };


        /**
         * 卡片
         */
        /*$scope.onCard = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1)
                return layer.alert("请选择一条数据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            $scope.findOne(rows[0].id,function(){
                $scope.isBack = true;
                $scope.isGrid = false;
                $scope.isCard = true;
            });

        };*/
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
                    $http.post($scope.basePath + "personalProject/delete", {ids: angular.toJson(ids)}).success(function (response) {
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
            if($scope.isClear){
                $scope.VO = $scope.initVO();
            }
            $scope.isDisabled = true;
            $scope.isContinue = true;
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
            $scope.isContinue = true;
            //阻止页面渲染
            $scope.form=false;
            $scope.card=false;
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
                    if ($scope.VO.busi_type.name == null || $scope.VO.busi_type.name.length == 0) {
                        return layer.alert("业务分类不可为空!",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    $scope.VO.c2TypeName = $rootScope.returnSelectName($scope.VO.c2Type,"MARKETTYPE");
                    if ($scope.VO.billstatus ==37) {
                        $scope.VO.billstatus = 31;
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
         * 个险业务档案管理推送数据
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
            $http.post($scope.archivesPath + "personalInsuranceArchives/pushPersonalData",{id:rows[0].id,c_1_type:rows[0].c_1_type}).success(function(response) {
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
        $scope.ifSubsidiary = false;
        $scope.form=false;
        $scope.card=false;
        $scope.isClear = false;
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.queryShow = true;
        $scope.isContinue = true;
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
            exporterCsvFilename: '个人客户业务立项.csv',
            columnDefs: [
                {name: 'c_procode', displayName: '立项编号', width: 100,},
                {name: 'cinsureman_name', displayName: '客户名称', width: 100,},
                {name: 'if_re_insurance', displayName: '是否为再保险业务', width: 100, cellFilter: 'SELECT_YESNONUM'},
                {name: 'project_type', displayName: '业务类型', width: 100, cellFilter: 'SELECT_MARKETTYPE'},
                {name: 'busi_type_name', displayName: '业务分类', width: 100},
                {name: 'c_proname', displayName: '立项名称', width: 100,},
                {name: 'pkC0Tradetype_name', displayName: '客户产权关系', width: 100,},//解决列表不显示
                {name: 'assess', displayName: '项目简介', width: 100,},
                {name: 'cperiod_new', displayName: '项目周期', width: 100,},
                {name: 'is_continue', displayName: '立项性质', width: 100, cellFilter: 'SELECT_PROJECTPROPERTIESTYPE'},
                {name: 'cease_reason', displayName: '项目终结原因', width: 100, cellFilter: 'SELECT_CEASEREASONTYPE'},
                {name: 'pkOperator_name', displayName: '经办人', width: 100,},
                {name: 'operate_date', displayName: '制单日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'operate_time', displayName: '制单时间', width: 100,},
                {name: 'pkOrg_name', displayName: '业务单位', width: 100,},
                {name: 'pkDept_name', displayName: '业务部门', width: 100,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
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
                    angular.assignData($scope.VO, row.entity);
                    $scope.findOne(rows[0].id);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });


        };
        if($stateParams.id) {
            $scope.onCard($stateParams.id);
        }/*else{
            $scope.queryForGrid({});
        }*/

        //客户对应业务分类
        $scope.busiTypeGridOptions = {
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
                {name: 'pkC0Tradetype.name', displayName: '客户产权关系',width:150},
                {name: 'busiType.name', displayName: '业务分类',width:200},
                {name: 'busiType.parentName', displayName: '业务分类(详细)',width:500},
            ],
            data:[],
            onRegisterApi: function (gridApi) {
                $scope.busiTypeGridOptions.gridApi = gridApi;
            }
        };

    };
    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
    };
    $scope.table_name = "lr_project";
    $scope.billdef = "PersonalProject";
    $scope.beanName ="insurance.ExamineServiceImpl";
    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initworkflow($scope, $http,ngDialog);
});

app.controller('prjectHisGridOptionsCtrl', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {
    /**
     * 初始化页面变更方法
     */
/*    $scope.initQUERYChildren = function () {
        return {
            'id^notin': $scope.childrenId
        }
    };*/
    // $scope.QUERYCHILDREN = $scope.initQUERYChildren();
    $scope.initData = function () {
        $scope.childQuery = false;
        $scope.prjectHisGridOptions = {
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
                {name: 'cinsureman.code', displayName: '客户编号', width: 100,},
                {name: 'cinsureman.name', displayName: '客户名称', width: 100,},
                {name: 'cproname', displayName: '立项名称', width: 100,},
                {name: 'assess', displayName: '项目简介', width: 100,},
                {name: 'pkOperator_name', displayName: '经办人', width: 100,},
                {name: 'operateDate', displayName: '制单日期', width: 100,},
                {name: 'operateTime', displayName: '制单时间', width: 100,},
                {name: 'pkOrg.name', displayName: '业务单位', width: 100,},
                {name: 'pkDept.name', displayName: '业务部门', width: 100,},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
            ],
            data: []
        };
        $scope.prjectHisGridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;

            //添加行头
           /* $scope.gridApi.core.addRowHeaderColumn({
                name: 'rowHeaderCol',
                displayName: '',
                width: 30,
                cellTemplate: 'ui-grid/rowNumberHeader'
            });*/

            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                $scope.gridApi.page = newPage;
                $scope.gridApi.pageSize = pageSize;
                $scope.queryForGridChildren($scope.QUERYCHILDREN);
            });
        };
    };

    $scope.queryForGridChildren = function () {
        var rows = $scope.gridApi.selection.getSelectedRows();
        /*if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行历史!", {
            skin: 'layui-layer-lan',
            closeBtn: 1
        });
        layer.load(2);*/
        $http.post($scope.basePath + "personalProject/queryHis", {soruceid:rows[0].id
        }).success(function (response) {
            if (response.code == 200) {
                // if (!$scope.query) {
                //     $scope.query = $scope.gridOptions.columnDefs;
                // }
                $scope.prjectHisGridOptions.data = response.Rows;
            }
            layer.closeAll('loading');
        });
    };

    $scope.initData();
    $scope.queryForGridChildren();
});
