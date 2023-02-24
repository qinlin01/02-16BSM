app.controller('projectExaminesCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller) {

    $controller('baseController', {
        $rootScope: $rootScope,
        $scope: $scope,
        $http: $http,
        ngVerify: ngVerify,
        stateParams: $stateParams,
        ngDialog: ngDialog
    });

    $scope.initVO = function () {
        return {
            dealAttachmentB: [],
        }
    };
    $scope.url = function () {
        return "bsm/projectExamines";
    };

    $scope.initView = function () {
        $scope.deptRefUrl = function () {
            return "deptdoc/queryForRef?params=1002";
        };
        $scope.VO = $scope.initVO();

    }
    $scope.initWatch = function () {
        $scope.$watch('VO.serviceContent', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isForm) {
                $scope.projectName();
            }
        }, true);

        $scope.$watch('VO.projectCost', function (newVal, oldVal) {
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isForm) {
                if (newVal > 20) {
                    $scope.VO.projectClass = 1;
                } else {
                    $scope.VO.projectClass = 0;
                }
            }
        }, true);
    };


    $scope.initButton = function () {


        $scope.onProjectApplyList = function () {

            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert('请至少选择一行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            var ids = [];
            for (var i = 0; i < rows.length; i++) {
                ids.push(rows[i].projectApplyRefVO.id);
            }

            $http.post($scope.basePath + "bsm/projectApply/projectApplyList", {data: angular.toJson(ids)}, {responseType: 'arraybuffer'}).success(function (data, status, headers) {
                layer.closeAll('loading');
                headers = headers();
                var contentType = headers['content-type'];
                var linkElement = document.createElement('a');
                var blob = new Blob([data], {type: contentType});
                var url = window.URL.createObjectURL(blob);
                linkElement.setAttribute('href', url);
                linkElement.setAttribute("download", "申报清单.xls");
                var clickEvent = new MouseEvent("click", {
                    "view": window,
                    "bubbles": true,
                    "cancelable": false
                });
                linkElement.dispatchEvent(clickEvent);
            });
        }

        $scope.onPrintBill = function () {

            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert('请至少选择一行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });

            layer.load(2);
            $http.post($scope.basePath + $scope.url() + "/printBill", {id: rows[0].id}).success(function (response) {
                layer.closeAll('loading');
                $scope.openPdf(response, "xxx.pdf");
            });
        }

        $scope.onExamineCheck = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) {
                return layer.alert("请选择一条数据进行查看!", {skin: 'layui-layer-lan', closeBtn: 1});
            }
            $scope.checkType = 0;
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: getURL('bsm/projectExamines/dialog/examnieDialog.html'),
                className: 'ngdialog-theme-plain',
                width: 650,
                height: 350,
                scope: $scope,
                closeByDocument: false,
            }).then(function (value) {
                console.log('点击确认按钮. Value: ', value);
                layer.load(2);
                $http.post($scope.basePath + $scope.url() + "/examineCheck", {
                    id: rows[0].id,
                    opinion: value.examineOpinion,
                    msg: value.examineMsg,
                    funCode: $scope.funcCode
                }).success(function (response) {
                    if (response.code == -1) {
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    $scope.onQuery();
                    layer.closeAll('loading');
                })
            }, function (reason) {
                console.log('非正常关闭. Reason: ', reason);
            });
        };

        $scope.onStrategicCheck = function () {

            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) {
                return layer.alert("请选择一条数据进行查看!", {skin: 'layui-layer-lan', closeBtn: 1});
            }
            $scope.checkType = 1;
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: getURL('bsm/projectExamines/dialog/examnieDialog.html'),
                className: 'ngdialog-theme-plain',
                width: 650,
                height: 450,
                scope: $scope,
                closeByDocument: false,
            }).then(function (value) {
                console.log('Modal promise resolved. Value: ', value);
                layer.load(2);
                $http.post($scope.basePath + $scope.url() + "/strategicCheck", {
                    id: rows[0].id,
                    opinion: value.examineOpinion,
                    msg: value.examineMsg,
                    funCode: $scope.funcCode
                }).success(function (response) {
                    if (response.code == -1) {
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    $scope.onQuery();
                    layer.closeAll('loading');
                })
            }, function (reason) {
                console.log('Modal promise rejected. Reason: ', reason);
            });
        };
    };


    $scope.columnDefs = function () {
        return [
            {
                name: 'opreation',
                displayName: '操作',
                width: 59,
                enableColumnMenu: false,
                cellFilter: 'enable',
                pinnedLeft: true,
                // cellTemplate:'<a href="#" ><span class="title label-primary">详情</span></a>'
                cellTemplate: '<div class="ui-grid-cell-contents text-center"><a  class="text-primary" ng-click="grid.appScope.onView(row.entity)"><i class="fa fa-file-text-o"></i>详情</a></div>'
            },
            {name: 'projectApplyRefVO.serialNumber', displayName: '项目编号', width: 170},
            {name: 'projectApplyRefVO.projectName', displayName: '项目名称', width: 280},
            {name: 'projectApplyRefVO.projectType', displayName: '项目类型', width: 100, cellFilter: 'SELECT_PROJECT_TYPE'},
            {name: 'projectApplyRefVO.projectCost', displayName: '项目费用（万元）', width: 120},
            {
                name: 'projectApplyRefVO.projectClass',
                displayName: '项目分类（规模）',
                width: 100,
                cellFilter: 'SELECT_PROJECT_CLASS'
            },
            {name: 'projectApplyRefVO.projectManger', displayName: '项目负责人', width: 100},
            {name: 'projectApplyRefVO.period', displayName: '项目周期', width: 120},
            {name: 'projectApplyRefVO.examineDept.name', displayName: '专业审查部门', width: 150},
            {name: 'examineOpinion', displayName: '专业审查部门意见', width: 150, cellFilter: 'SELECT_EXAMINIE_OPTION'},
            {name: 'strategicOpinion', displayName: '战略部意见', width: 150, cellFilter: 'SELECT_EXAMINIE_OPTION'},
            {name: 'createdOrg.name', displayName: '业务单位', width: 100},
            {name: 'createdDept.name', displayName: '业务部门', width: 100},
            {name: 'createdUser.name', displayName: '经办人', width: 100},
            {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},

        ];
    };

    $scope.initView();
//薪酬
    $scope.initData();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.funcCode = "802";
    $scope.onQuery();
});
