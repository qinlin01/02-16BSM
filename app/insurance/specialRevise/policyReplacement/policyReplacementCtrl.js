app.controller('policyReplacementCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $location, activitiModal, workFlowDialog) {
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.informationAll = [];
        $scope.initMode = function (){
            return {
                insuranceinfono:'',
                projectcode:'',
                insuranceno:'',
            }
        }
        $scope.informationAll.push($scope.initMode());
        $scope.delDisabled = true;
    };

    $scope.initHttp = function () {
        //修改
        $scope.onUpdate = function () {
            layer.load(2);
            $http.post($scope.basePath + "policyReplacement/update", {information:angular.toJson($scope.informationAll)}).success(function (response) {
                if(response&&response.code == "200") {
                    layer.alert("修改成功");
                    layer.closeAll('loading');
                }
            });
        };
        //导入数据
        $scope.onImportUploads = function (type) {
            var file = document.getElementById("updateData").files[0];
            if (file != null) {
                layer.load(2);
                var form = new FormData();
                form.append('file', file);
                $http({
                    method: 'POST',
                    url: $scope.basePath + 'policyReplacement/updateData',
                    data: form,
                    headers: {'Content-Type': undefined, 'x-auth-token': window.sessionStorage.getItem("token")},
                    transformRequest: angular.identity
                }).success(function (response) {
                    if(response&&response.code == "200"){
                        layer.alert("修改成功")
                        layer.closeAll('loading');
                    }
                })
            }
        };
    };

    $scope.initFunction = function () {

        $scope.onRowDblClick = function (item) {
            if (item && item.id) {
                $scope.onCard(item.id);
            }
        };
    };

    $scope.initWatch = function () {

    };
    $scope.initButton = function () {
        //修改
        $scope.onEdit = function () {
            for (let i = 0; i < $scope.informationAll.length; i++) {
                if ($scope.informationAll[i].insuranceinfono == null || $scope.informationAll[i].insuranceinfono == "" &&
                    $scope.informationAll[i].projectcode == null || $scope.informationAll[i].projectcode == ""
                )return layer.alert("请输入必填项!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            $scope.onUpdate();

        };
        //批量导入
        $scope.onImprotDataInfo = function (){
            $("#updateData").click();
        }

        //新增一条可修改数据
        $scope.onAddInformation =function() {
            if ($scope.informationAll.length < 5) {
                $scope.informationAll.push($scope.initMode());
            } else {
                layer.alert("最多5个")
            }
        }

        //删除一条可修改数据
        $scope.deletelistOptions=function(nowNumber){
            if($scope.informationAll.length > 1){
                $scope.informationAll.splice(nowNumber, 1);
            }
        };

        }
    $scope.initPage = function () {
        $scope.isForm = true;
    }

    $scope.initView = function () {
    };

    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    initPreviewFile($scope, $rootScope);
    initworkflow($scope, $http, ngDialog);
    initonlineView($scope, $rootScope, $sce, $http, ngDialog);
});