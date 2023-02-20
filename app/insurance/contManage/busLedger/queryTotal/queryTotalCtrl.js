/**
 * Created by WJ on 2017/10/24.
 */

app.controller('queryTotalCtrl', function ($rootScope, $scope, $http, $compile) {
    $scope.status={open : true};
    //初始化查询
    var month=new Date().getMonth()+1;
    month =(month<10 ? "0"+month:month);
    $scope.initQUERY = function () {
        return {
            year:new Date().getFullYear(),month:month,pro:'insurancename1'
        }
    };
    $scope.funCode = '30801';
    $scope.QUERY = $scope.initQUERY();
    $scope.onQuery = function () {
        $scope.queryForGrid($scope.QUERY);
    };
    $scope.onReset = function () {
        $scope.QUERY = $scope.initQUERY();
    };
    $scope.changeOpen = function () {
        $scope.status.open = !$scope.status.open;
    };
    //导出
    $scope.onExport = function () {
        $scope.downFile($scope.QUERY,null,false,$rootScope.SELECT.EXPORT_TYPE[0].id);
    }

    $rootScope.downFile = function (data,fun,isPrint,etype) {
        layer.load(2);
        $http.post($rootScope.basePath + "queryTotal/createFile", {
            params: angular.toJson(data),
            isPrint:isPrint,
            etype:etype,//0：excel 1：pdf
        }).success(function (response) {
            layer.closeAll('loading');
            if(fun) fun(response);
            if(isPrint){
                window.open(getURL(response.queryPath));
            }else{
                window.open($rootScope.basePath + "uploadFile/downLoadByUrl?url="+encodeURI(encodeURI(response.downPath)));
            }
        });
    };
    
    $scope.queryForGrid = function (data) {
        layer.load(2);
        $http.post($scope.basePath + "queryTotal/queryForReport", {
            params: angular.toJson(data)
        }).success(function (response) {
            if (response.code == 200) {
                //$scope.data = response.result;
                var html = $compile(response.result)($scope);
                //html.appendTo('#queryTotal');
                $('#queryTotal').html(html);
/*                layer.alert("查询完成！", {skin: 'layui-layer-lan', closeBtn: 1});*/
            }
            layer.closeAll('loading');
        });
    };
});
