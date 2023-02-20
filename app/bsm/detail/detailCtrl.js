app.controller('detailCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller, $sce) {

    layer.load(2);
    $controller('baseController', {
        $rootScope: $rootScope,
        $scope: $scope,
        $http: $http,
        $sce: $sce,
        ngVerify: ngVerify,
        stateParams: $stateParams,
        ngDialog: ngDialog
    });

    $scope.funcCode = "301";
    // 不知道为什么在VO中定义这个结构体不能被前台绑定，所以把该参数抽取出来，在保存的时候给VO赋值

    $scope.initVO = function () {
        return {};
    };

    $scope.beforEdit = function () {

        $scope.initForm();

    }
    $scope.url = function () {
        return "bsm/project";
    };

    $scope.initForm = function () {
    }
    $scope.initView = function () {

        $scope.columnDefs = function () {
            return [
                {
                    name: 'opreation',
                    displayName: '操作',
                    width: 59,
                    enableColumnMenu: false,
                    pinnedLeft: true,
                    cellTemplate: '<div class="ui-grid-cell-contents text-center"><a  class="text-primary" ng-click="grid.appScope.onView(row.entity)"><i class="fa fa-file-text-o"></i>详情</a></div>',
                },
                {name: 'projectYears', displayName: '申报年月', width: 100},
                {name: 'serialNumber', displayName: '项目编号', width: 200, cellTooltip: true},
                {name: 'projectName', displayName: '项目名称', width: 280, cellTooltip: true},
                {name: 'projectType', displayName: '项目类型', width: 100, cellFilter: 'SELECT_PROJECT_TYPE'},
                {name: 'projectClass', displayName: '项目分类(规模)', width: 120, cellFilter: 'SELECT_PROJECT_CLASS'},
                {name: 'projectEpibolyType', displayName: '项目类型', width: 120, cellFilter: 'SELECT_PROJECT_EPIBOLY_TYPE'},
                {name: 'applyType', displayName: '申报类型', width: 120, cellFilter: 'SELECT_APPLY_TYPE'},
                {
                    name: 'projectCost', displayName: '申报费用(万元)', width: 140, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'replyProjectCost', displayName: '批复金额(万元)', width: 140, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'contractAmount', displayName: '合同金额(元)', width: 140, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {
                    name: 'payAmount', displayName: '支付金额(元)', width: 140, cellFilter: 'AMOUNT_FILTER',
                    cellClass: function () {
                        return "lr-text-right"
                    }
                },
                {name: 'projectManger', displayName: '项目负责人', width: 100},
                {name: 'period', displayName: '项目周期', width: 120},
                {name: 'projectStatus', displayName: '项目状态', width: 120, cellFilter: 'SELECT_PROJECT_STATUS'},
                {name: 'examineDept.name', displayName: '专业审查部门', width: 130},
                {name: 'createdOrg.name', displayName: '业务单位', width: 100},
                {name: 'createdDept.name', displayName: '业务部门', width: 100},
                {name: 'createdUser.name', displayName: '经办人', width: 100},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},

            ];
        };
    };
    $scope.initWatch = function () {

    };


    $scope.initButton = function () {


        $scope.openProject = function (pk) {
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: getURL('bsm/detail/detail.html'),
                className: 'ngdialog-theme-plain',
                width: 1250,
                scope: $scope,
                resolve: {
                    $stateParams: function () {
                        $stateParams.pk = pk;
                        return $stateParams;
                    }
                }
            })
        }


        $scope.openContract = function (pk) {
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: getURL('bsm/contract/contract.html'),
                className: 'ngdialog-theme-plain',
                width: 1250,
                scope: $scope,
                resolve: {
                    $stateParams: function () {
                        $stateParams.pk = pk;
                        return $stateParams;
                    }
                }
            })
        }

        /**
         * 查询数据
         * @param pk
         */
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + $scope.url() + "/findProjectApply", {id: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == 200) {
                    $scope.bindData(response.data);
                } else {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
        };

        $scope.export = function () {
            $scope.gridApi.exporter.csvExport('all', 'all', $scope.gridOptions.data);
        };

        $scope.downloadBatch = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.msg("请选择需要下载的数据!", {
                icon: 2,
                time: 2000,
                shade: [0.5, '#000', true]
            });
            layer.load(2);
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
                ids.push(rows[i].id);
            }

            $http.post($scope.basePath + $scope.url() + "/downloadBatch", {
                ids: angular.toJson(ids)
            }, {responseType: 'arraybuffer'}).success(function (data, status, headers, config, statusText) {
                    layer.closeAll('loading');
                    if (status == 200) {
                        var fileName = "立项申报表.zip";
                        var blob = new Blob([data], {type: "application/octet-stream"});
                        var reader = new FileReader();
                        reader.readAsDataURL(blob);    // 转换为base64，可以直接放入a表情href
                        reader.onload = function (e) {
                            // 转换完成，创建一个a标签用于下载
                            var a = document.createElement('a');
                            a.download = fileName;
                            a.href = e.target.result;
                            $("body").append(a);
                            a.click();
                            $(a).remove();
                        }
                    }
                }
            );
        };

        $scope.onView = function (item) {
            if (item == null)
                return layer.msg("请选择一条数据进行查看!", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
            $http.post($scope.basePath + $scope.url() + "/findProjectApply", {
                id: item.id
            }).success(function (response) {
                if (response && response.code == 200) {
                    angular.assignData($scope.VO, response.data);
                    $scope.isGrid = false;
                    $scope.isCard = true;
                    $scope.isForm = false;
                    $scope.isForm = false;
                    angular.forEach($rootScope.currentTabs, function (item, index) {
                        if ($scope.funcCode == item.id) {
                            item.billId = $scope.VO.id;
                        }
                    });
                    $http.post($scope.basePath + $scope.url() + "/queryPayment", {
                        projectId: item.id
                    }).success(function (res) {
                        if (res && res.code == 200) {
                            $scope.clearing = res.data;
                            $scope.payAmount = 0;
                            angular.forEach(res.data, function (item) {
                                $scope.payAmount += item.payAmount;
                            });
                        }
                    });
                    $http.post($scope.basePath + $scope.url() + "/attachments", {
                        projectId: item.id
                    }).success(function (res) {
                        if (res && res.code == 200) {
                            $scope.attachments = res.data;
                        }
                    });
                    $http.post($scope.basePath + "bsm/contract/findByProject", {
                        projectId: item.id
                    }).success(function (res) {
                        if (res && res.code == 200) {
                            $scope.contracts = res.data;
                            var sum = 0;
                            angular.forEach(res.data, function (item) {
                                sum += item.contractAmount;
                            });
                            $scope.contractSum = sum;
                        }
                    });
                    $http.post($scope.basePath + "bsm/agreement/findByProject", {
                        projectId: item.id
                    }).success(function (res) {
                        if (res && res.code == 200) {
                            $scope.agreements = res.data;
                        }
                    });
                    $http.post($scope.basePath + $scope.url() + "/querySubProjects", {
                        projectId: item.id
                    }).success(function (res) {
                        if (res && res.code == 200) {
                            $scope.subProjects = res.data;
                        }
                    });
                    $http.post($scope.basePath + "bsm/frameworkApply/queryByProject", {
                        projectId: item.id
                    }).success(function (res) {
                        if (res && res.code == 200) {
                            $scope.frameworkApply = res.data;
                        }
                    });
                } else {
                    if (response) {
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                }
            });
        }
    };

    $scope.initRefData = function () {
    };


    $scope.initData();
    $scope.initView();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.fromNav();
    $scope.onQuery();
});
