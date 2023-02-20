'use strict';
var insurance = angular.module('uiCompile', ['smart-table']);
insurance.directive("addGridBtn", ['$rootScope', '$http', '$compile', function ($rootScope, $http, $compile) {
    return {
        replace: false,
        restrict: 'EA',
        scope:true,
        link: function (scope, element, iAttrs) {
            $http.post($rootScope.basePath + "user/getSessionParent",{fun_code:fun_code}).success(function (req) {
                if(req){
                    //     更换按钮样式
                    var htmlResult = "";
                    var subhtml = "<ul class='dropdown-menu' role='menu'>";
                    for(var i = 0;i<req.length;i++){
                        // var click = req[i].menuName.split(",");
                        // ng-disabled=\"checkStatus(gridApi,'bill_status','0',true)\"
                        if(req[i].menu_name.indexOf("(卡片)") == -1 && req[i].menu_name.indexOf("(表单)") == -1){
                            if (req[i].childbuttons){
                                var groupbutonhtml = "<div class='btn-group'><button type='button' class='btn btn-azure ng-scope dropdown-toggle' data-toggle='dropdown'>" +
                                    "<i class='fa fa-angle-double-down'></i> " +
                                    "<span>"+ req[i].menu_name+"</span> </button>"+
                                    "<ul class='dropdown-menu' role='menu'> ";
                                for(var j = 0;j<req[i].childbuttons.length;j++){
                                    var parentbutton = req[i].childbuttons[j];
                                    if (!parentbutton) {
                                        continue;
                                    }
                                    var subhtml ="<li class='lr-child-btn'><button class='btn lr-main-btn'  ng-click="+parentbutton.menu_click+"  ng-disabled="+parentbutton.menu_check+"><i class="+parentbutton.Icon+"></i>"+parentbutton.menu_name+"</button><li class='divider'></li>";
                                    // var subhtml ="<li class='lr-child-btn'><button class='btn btn-azure' ng-click="+parentbutton.menu_click+" ng-disabled="+parentbutton.menu_check+"> <i class='"+parentbutton.Icon+"'></i>"+parentbutton.menu_name+"</button></li><li class='divider'></li>";
                                    groupbutonhtml += subhtml;
                                }
                                groupbutonhtml += "</ul></div>";
                                htmlResult += groupbutonhtml;
                            } else {
                                var html ="<button class='btn btn-azure' ng-click="+req[i].menu_click+" ng-disabled="+req[i].menu_check+"> <i class='"+req[i].Icon+"'></i>"+req[i].menu_name+"</button>";

                                htmlResult += html;
                            }
                        }
                    }
                    $(element).append($compile(htmlResult)(scope));
                }
            })
        }
    }
}]);

insurance.directive("addCardBtn", ['$rootScope', '$http', '$compile', function ($rootScope, $http, $compile) {
    return {
        replace: false,
        restrict: 'EA',
        scope:true,
        link: function (scope, element, iAttrs) {
            $http.post($rootScope.basePath + "user/getSessionParent",{fun_code:fun_code}).success(function (req) {
                if(req){
                    //     更换按钮样式
                    var htmlResult = "";
                    for(var i = 0;i<req.length;i++){
                        if(req[i].menu_name.indexOf("(卡片)") != -1){
                            var html ="<button class='btn btn-azure' ng-click="+req[i].menu_click+" ng-if="+req[i].menu_check+"> <i class='"+req[i].Icon+"'></i>"+req[i].menu_name.split("(")[0]+"</button>";
                            htmlResult += html;
                        }
                    }
                    $(element).append($compile(htmlResult)(scope));
                }
            })
        }
    }
}]);
insurance.directive("addFormBtn", ['$rootScope', '$http', '$compile', function ($rootScope, $http, $compile) {
    return {
        replace: false,
        restrict: 'EA',
        scope:true,
        link: function (scope, element, iAttrs) {
            $http.post($rootScope.basePath + "user/getSessionParent",{fun_code:fun_code}).success(function (req) {
                if(req){
                    //     更换按钮样式
                    var htmlResult = "";
                    for(var i = 0;i<req.length;i++){
                        if(req[i].menu_name.indexOf("(表单)") != -1){
                            var html ="<button class='btn btn-azure' ng-click="+req[i].menu_click+" ng-if="+req[i].menu_check+"> <i class='"+req[i].Icon+"'></i>"+req[i].menu_name.split("(")[0]+"</button>";
                            htmlResult += html;
                        }
                    }
                    $(element).append($compile(htmlResult)(scope));
                }
            })
        }
    }
}]);