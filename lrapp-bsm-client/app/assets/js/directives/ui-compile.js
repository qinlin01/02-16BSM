'use strict';
var insurance = angular.module('uiCompile', ['smart-table']);
insurance.directive("addGridBtn", ['$rootScope', '$http', '$compile', function ($rootScope, $http, $compile) {
    return {
        replace: false,
        restrict: 'EA',
        scope: true,
        link: function (scope, element, iAttrs) {
            $http.post($rootScope.basePath + "sys/menuAndButToMongoDB/getSessionParent", {fun_code: scope.funcCode}).success(function (req) {
                if (req.code == 200) {
                    //     更换按钮样式
                    var htmlResult = "";
                    var subhtml = "<ul class='dropdown-menu' role='menu'>";
                    req.data.permissions.sort(function (a, b) {
                        return parseFloat(a.menu_order) - parseFloat(b.menu_order);
                    });
                    for (var i = 0; i < req.data.permissions.length; i++) {
                        // var click = req[i].menuName.split(",");
                        // ng-disabled=\"checkStatus(gridApi,'bill_status','0',true)\"
                        let reqElement = req.data.permissions[i];
                        if (reqElement.view_place == 1 || reqElement.view_place == -1) {
                            if (reqElement.childbuttons) {
                                reqElement.childbuttons.sort(function (a, b) {
                                    return parseFloat(a.menu_order) - parseFloat(b.menu_order);
                                });
                                var groupbutonhtml = "<div class='btn-group'><button type='button' class='btn btn-primary dropdown-toggle' data-toggle='dropdown'>" +
                                    "<i class='fa fa-angle-double-down'></i> " +
                                    "<span>" + reqElement.menu_name + "</span> </button>" +
                                    "<ul class='dropdown-menu' role='menu'> ";
                                for (var j = 0; j < reqElement.childbuttons.length; j++) {
                                    var childbutton = reqElement.childbuttons[j];
                                    if (!childbutton) {
                                        continue;
                                    }
                                    var subhtml = "<li><button class='btn lr-main-btn btn-sm'  ng-click=" + childbutton.menu_click + "  ng-disabled=" + childbutton.menu_check + "><i class='" + childbutton.Icon + "'></i>" + childbutton.menu_name + "</button><li class='divider'></li>";
                                    // var subhtml ="<li class='lr-child-btn'><button class='btn btn-azure' ng-click="+parentbutton.menu_click+" ng-disabled="+parentbutton.menu_check+"> <i class='"+parentbutton.Icon+"'></i>"+parentbutton.menu_name+"</button></li><li class='divider'></li>";
                                    groupbutonhtml += subhtml;
                                }
                                groupbutonhtml += "</ul></div> ";
                                htmlResult += groupbutonhtml;
                            } else {
                                var html = "<button class='btn btn-primary' ng-click=" + reqElement.menu_click + " ng-disabled=" + reqElement.menu_check + "> <i class='" + reqElement.Icon + "'></i>" + reqElement.menu_name + "</button> ";

                                htmlResult += html;
                            }
                        }
                    }
                    $(element).append($compile(htmlResult)(scope));

                    window.sessionStorage.setItem("token", req.data.session);
                    $rootScope.userVO = req.data.userRef;
                    $rootScope.orgVO = req.data.user.pkOrg;
                    $rootScope.deptVO = req.data.user.pkDept;
                    $rootScope.workDate = req.data.workDate;
                    if (req.data.user.isAdmin == 'Y') {
                        $rootScope.isAdmin = true;
                    } else {
                        $rootScope.isAdmin = false;
                    }
                    if ($rootScope.currentTabs.length == 0) {
                        var tab = {name: req.data.funcName, active: true, id: scope.funcCode, url: req.data.url, billId: ''};
                        var isExsit = false;
                        angular.forEach($rootScope.currentTabs, function (item, index) {
                            if (scope.funcCode == item.id) {
                                item.active = true;
                                tab.billId = item.billId;
                                isExsit = true;
                            } else {
                                item.active = false;
                            }
                        });
                        if (!isExsit) {
                            $rootScope.currentTabs.push(tab);
                        }
                    }
                }
            })
        }
    }
}]);

insurance.directive("addCardBtn", ['$rootScope', '$http', '$compile', function ($rootScope, $http, $compile) {
    return {
        replace: false,
        restrict: 'EA',
        scope: true,
        link: function (scope, element, iAttrs) {
            $http.post($rootScope.basePath + "sys/menuAndButToMongoDB/getSessionParent", {fun_code: scope.funcCode}).success(function (req) {
                if (req.code = 200) {
                    //     更换按钮样式
                    var htmlResult = "";
                    for (var i = 0; i < req.data.permissions.length; i++) {
                        let reqElement = req.data.permissions[i];
                        if (reqElement.view_place == 2 || reqElement.view_place == -1) {
                            var html = "<button class='btn btn-primary' ng-click=" + reqElement.menu_click + " ng-disabled=" + reqElement.menu_check + "> <i class='" + reqElement.Icon + "'></i>" + reqElement.menu_name + "</button> ";
                            htmlResult += html;
                        }
                    }
                    htmlResult += "<button class='btn btn-primary btn-sm' ng-click='onEdit()' ng-if='(VO.billstatus==31||VO.billstatus==36||VO.billstatus==37)'> <i class='fa fa-edit'></i> <span>修 改</span> </button> ";
                    htmlResult += "<button class='btn btn-primary btn-sm' ng-click='onAudit()' ng-if='VO.billstatus==33||VO.billstatus==32'> <i class='fa  fa-check-square-o'></i>  <span>审 核</span> </button> ";
                    htmlResult += "<button class='btn btn-default btn-o btn-sm' ng-click='onBack()'> <i class='fa fa-chevron-left'></i> <span>返 回</span> </button>";
                    $(element).append($compile(htmlResult)(scope));

                    window.sessionStorage.setItem("token", req.data.session);
                    $rootScope.userVO = req.data.userRef;
                    $rootScope.orgVO = req.data.user.pkOrg;
                    $rootScope.deptVO = req.data.user.pkDept;
                    $rootScope.workDate = req.data.workDate;
                    if (req.data.user.isAdmin == 'Y') {
                        $rootScope.isAdmin = true;
                    } else {
                        $rootScope.isAdmin = false;
                    }
                }
            })
        }
    }
}]);
insurance.directive("addFormBtn", ['$rootScope', '$http', '$compile', function ($rootScope, $http, $compile) {
    return {
        replace: false,
        restrict: 'EA',
        scope: true,
        link: function (scope, element, iAttrs) {
            $http.post($rootScope.basePath + "sys/menuAndButToMongoDB/getSessionParent", {fun_code: scope.funcCode}).success(function (req) {
                if (req.code == 200) {
                    //     更换按钮样式
                    var htmlResult = "";
                    for (var i = 0; i < req.data.permissions.length; i++) {
                        let reqElement = req.data.permissions[i];
                        if (reqElement.view_place == 3 || reqElement.view_place == -1) {
                            var html = "<button class='btn btn-primary' ng-click=" + reqElement.menu_click + " ng-disabled=" + reqElement.menu_check + "> <i class='" + reqElement.Icon + "'></i>" + reqElement.menu_name + "</button> ";
                            htmlResult += html;
                        }

                    }
                    htmlResult +="<button class='btn  btn-default btn-sm' ng-click='onCancel()'> <i class='fa fa-undo'></i>取 消 </button> ";
                    htmlResult += "<button class='btn btn-sm btn-primary ' type='button' ng-click='onSave()'> <i class='fa fa-save'></i>保 存 </button>";
                    $(element).append($compile(htmlResult)(scope));

                    window.sessionStorage.setItem("token", req.data.session);
                    $rootScope.userVO = req.data.userRef;
                    $rootScope.orgVO = req.data.user.pkOrg;
                    $rootScope.deptVO = req.data.user.pkDept;
                    $rootScope.workDate = req.data.workDate;
                    if (req.data.user.isAdmin == 'Y') {
                        $rootScope.isAdmin = true;
                    } else {
                        $rootScope.isAdmin = false;
                    }
                }
            })
        }
    }
}]);