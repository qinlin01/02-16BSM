/**
 * Created by chenxc on 2017/4/17.
 */

'use strict';

/* Controllers */
// user_table controller
app.controller('oftenUsedCtrl', ['$scope','$http','$rootScope','$state','$compile', function($scope,$http,$rootScope,$state,$compile) {

    $scope.nav = function(){
        $scope.html = $scope.addOftenUsedNode();
        var newOftenNavDom = $compile($scope.html)($scope);
        $("#lr-recent-info").after(newOftenNavDom);
    };

    /**
     * 加载常用功能
     * @returns {string}
     */
    $scope.addOftenUsedNode = function () {

        var nodeArr = $rootScope.app.layout.oftenUsedNode;
        // var oftenHtml = '<ul class="main-navigation-menu" id="lr-right-trees">';
        //  var oftenHtml =  '<li id="lr-recent-visit" style="list-style-type:none;" ng-class="{' + "'" + 'active open' + "'" +': true}"> <a ng-click="reLoadNode()" href="javascript:void(0)"> <div class="item-content"> <div class="item-media"> <i class="ti-timer"></i> </div> <div class="item-inner"> <span class="title" >查看最近浏览节点</span><i class="icon-arrow"></i> </div> </div> </a>';
        var oftenHtml = "";
        if(nodeArr && nodeArr.length > 0){
            oftenHtml += '<li id="lr-recent-visit" class="lr-li-style">';
            oftenHtml += '<ul>';
            for(var i = 0; i < nodeArr.length; i++){
                oftenHtml += '<li ui-sref-active="active" ng-click=clickMenu("'+ nodeArr[i].parentId +'","'+ nodeArr[i].nodeUrl +'","'+ nodeArr[i].name +'") style="list-style-type:none;margin-left: 0;margin-top: 8px;"><i class="fa fa-history"></i> <a href="javascript:void(0)" style="font-size:14px;"> <span class="title"> '+nodeArr[i].name+'</span> </a> </li>';
            }
            oftenHtml += '</ul>';
            oftenHtml += '</li>';
            // oftenHtml += '</ul>'; 
            // ui-sref="' + nodeArr[i].nodeUrl + '"
        }
        return oftenHtml;
    };


}]);