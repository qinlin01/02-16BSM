app.controller('settingCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $location, $compile) {
    $scope.initData = function (data) {
        $scope.VO = {
            batchCount: 70,
            batchStart: 0
        };
        layer.load(2);
        $http.post($scope.basePath + "setting/findOne").success(function (response) {
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
            }
        });
    };

    $scope.initHttp = function () {
        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + "insurance/setting/findOne").success(function (response) {
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
                }
            });
        };
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "setting/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {

                    if (response) {
                        $scope.isEdit = false;
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
    };

    $scope.initButton = function () {

        /**
         * 分配权限
         */
        $scope.onAuthority = function () {
            layer.load(2);
            $http.post($scope.basePath + "authority/getAllUser", {
                data: angular.toJson({
                    batchCount: $scope.VO.batchCount,
                    batchStart: $scope.VO.batchStart
                })
            }).success(function (response) {
                if (response.code == 200) {
                    if (response.data) {
                        layer.alert("分配完成", {skin: 'layui-layer-lan', closeBtn: 1});
                        layer.closeAll('loading');
                    }
                }
            });
        }

        $scope.changeNav = function (dom, data) {
            if (data instanceof Array) {
                var tindex = 0;
                for (var i = 0; i < data.length; i++) {
                    var html = "";
                    if (data[i].Icon == "") {
                        html = '<li ui-sref-active="active"> <a ui-sref="' + data[i].menu_url + '"> <div class="item-content"> <div class="item-media"> <i class="' + data[i].Icon + '"></i> </div> <div class="item-inner" ng-click=clickMenu("' + data[i].pk + '","' + data[i].menu_url + '","' + data[i].menu_name + '")> <span class="title" >' + data[i].menu_name + '</span> </div> </div> </a> </li>'
                    } else {
                        html = '<li ng-class="{active:$state.includes(' + data[i].menu_url + ')}"> <a href="javascript:void(0)"> <div class="item-content"> <div class="item-media"> <i class="' + data[i].Icon + '"></i> </div> <div class="item-inner"> <span class="title" >' + data[i].menu_name + '</span> </div> </div> </a> </li>'
                    }
                    var dom1 = $(html);
                    if (data[i].parentId != null && data[i].parentId != "") {
                        if (tindex == 0) {
                            var html2 = '<ul class="sub-menu"></ul>'
                            var dom2 = $(html2);
                            dom2.append(dom1);
                            dom.append(dom2);
                        } else {
                            $(dom).find('ul').first().append(dom1);
                        }
                        tindex = 1;
                    } else {
                        dom.append(dom1);
                    }
                    if (data[i].children && data[i].children.length != 0) {
                        $scope.changeNav(dom1, data[i].children);
                    }
                }
            }
            $scope.newElm = $compile($scope.newElm)($scope);
            return $scope.newElm;
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
                    $scope.onSaveVO();
                }
            }, true);
        };
        $scope.onCancel = function () {
            $scope.isEdit = false;
        };
        $scope.onEdit = function () {
            $scope.isEdit = true;
        };
    }

    $scope.initData();
    $scope.initHttp();
    $scope.initButton();
});