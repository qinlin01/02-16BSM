'use strict';

/* Controllers */

// user_table controller
app.controller('navCtrl', ['$scope', '$http', '$rootScope', '$state', '$compile', '$location', '$window', '$stateParams','ngDialog', function ($scope, $http, $rootScope, $state, $compile, $location, $window, $stateParams, ngDialog) {
    $scope.nav = function () {
        //防止刷新丢失logo问题
        var logoURL = 'img/logo.png';
        var hostStr = window.location.host;

        if (hostStr == 'nm.cms.caib.sgcc.com.cn') {
            logoURL = 'img/logo_ydmd.png'
        }
        if (hostStr == 'sd.cms.caib.sgcc.com.cn') {
            logoURL = 'img/logo_sdyd.png'
        }
        if (hostStr == 'xj.cms.caib.sgcc.com.cn') {
            logoURL = 'img/logo_xjat.png'
        }
        $scope.logo = logoURL;
        if (window.sessionStorage.getItem("menu") != null &&
            window.sessionStorage.getItem("menu") != "null") {
            $scope.newElm = $compile(window.sessionStorage.getItem("menu"))($scope);
            $("#navtree").after($scope.newElm);
        }
    };
    $scope.clickMenu = function (id, url, name) {
        fun_code = id;
        // $http.post($scope.basePath + "sys/account/setFunCode", {funCode: id, funName: name}).success(function (response) {
        // });
        //    判断是否在新的窗口打开
        if (url != "app.dashboard" && $rootScope.app.layout.isOpenNewWindow) {
            var loginInfo = $rootScope.userVO;
            var urlStrArr = url.split(".");

            var desStr = "insurance/";
            //    获取本地访问的绝对路径
            var begin = $location.$$absUrl.indexOf(desStr);
            var openWindowUrl = $location.$$absUrl.slice(0, begin + desStr.length);

            openWindowUrl += "view.html#/";
            //     根据路由拼接URL
            for (var count = 0; count < urlStrArr.length; count++) {
                openWindowUrl += urlStrArr[count];
                if (count != urlStrArr.length - 1) {
                    openWindowUrl += '/';
                } else {

                }
            }
            $window.open(openWindowUrl);
        } else {
            if (!$scope.tabs) {
                $scope.tabs = [];
            }
            $scope.show(id, url, name);
            // var newTab = {  title: 'Tab ' + ($scope.tabs.length + 1) };
            // $scope.tabs.push(newTab);
            // $scope.activeTabIndex = ($scope.tabs.length - 1);
            // $state.go(url);

        }

        //    保存上一次路由
        $rootScope.app.layout.nearestNode = {
            nodeUrl: url,
        };

        //    保存最近打开的5个节点
        if (!$rootScope.app.layout.oftenUsedNode) {
            $rootScope.app.layout.oftenUsedNode = [];
        }

        if (url != "app.dashboard") {
            var nodeArr = $rootScope.app.layout.oftenUsedNode;
            var nodeObj = {
                name: name,
                nodeUrl: url,
                parentId: id
            };
            if ((angular.toJson(nodeArr)).indexOf(angular.toJson(nodeObj)) == -1) {
                nodeArr.push(nodeObj);
            }
            if (nodeArr.length > 3) {
                nodeArr.shift()
            }
            //     刷新最近浏览的dom,如果有先删除再刷新
            if ($("#lr-recent-visit") && $("#lr-recent-visit").length > 0) {
                $("#lr-recent-visit").remove();
            }
            if (nodeArr && nodeArr.length > 0) {
                var topHtml = '<ol>';
                var oftenHtml = '<li id="lr-recent-visit" class="lr-li-style">';
                oftenHtml += '<ul>';
                for (var i = 0; i < nodeArr.length; i++) {
                    oftenHtml += '<li ui-sref-active="active" ng-click=clickMenu("' + nodeArr[i].parentId + '","' + nodeArr[i].nodeUrl + '","' + nodeArr[i].name + '") style="list-style-type:none;margin-left: 0;margin-top: 8px;"><i class="fa fa-history"></i> <a href="javascript:void(0)" style="font-size:14px;"> <span class="title"> ' + nodeArr[i].name + '</span> </a> </li>';
                    topHtml += '<li ui-sref-active="active" ng-click=clickMenu("' + nodeArr[i].parentId + '","' + nodeArr[i].nodeUrl + '","' + nodeArr[i].name + '") style="list-style-type:none;display: inline-block;padding: 0 10px;"><i class="fa fa-history"></i> <a href="javascript:void(0)" style="font-size:14px;"> <span class="title"> ' + nodeArr[i].name + '</span> </a> </li>';
                }
                oftenHtml += '</ul>';
                oftenHtml += '</li>';
                topHtml += '</ol>';
                var oftenHtmlNew = $compile(oftenHtml)($scope);
                var topHtmlNew = $compile(topHtml)($scope);
                $("#lr-recent-info").after(oftenHtmlNew);
                $(".lr-title-menu li").remove();
                $(".lr-title-menu").append(topHtmlNew);
            }
        }

    };

    $scope.logout = function() {
        $http.post(serverApi + "sys/account/logout").success(function (response) {
            window.sessionStorage.removeItem("token");
            window.sessionStorage.removeItem("menu");
            $rootScope.currentTabs = null;
            $state.go('login.signin');
        })
    };


    $scope.changePwd = function () {
        $scope.code = $scope.$parent.userVO.code;
        $scope.isShow = true;
        ngDialog.openConfirm({
            showClose: false,
            closeByDocument: false,
            template: getURL('common/view/updatePassword.html'),
            className: 'ngdialog-theme-plain',
            scope: $scope,
            width: 600,
            height: 300,
            preCloseCallback: function (value) {
                if (value && value == "clear") {
                    //重置
                    return false;
                }
                return true;
            }

        }).then(function (value) {

        }, function (reason) {
        });
    };
}]);
