app.controller('replyDialogCtrl', function ($rootScope, $scope, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $controller, FileUploader) {

    $scope.initData = function () {
        $scope.reviewData = {
            opinion: 1,
        };
    }
    $scope.initFunction = function () {

        $scope.check = function () {
            if ($scope.VO.dealAttachmentB == null) {
                layer.alert('请上传附件!', {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
            if ($scope.VO.projectApplyRefVO.projectCost < 50) {

                if ($scope.VO.dealAttachmentB.sheet.length == 0) {
                    layer.alert('请上传《项目评审委员会立项评审资料》!', {skin: 'layui-layer-lan', closeBtn: 1});
                    return false;
                }
                if ($scope.VO.dealAttachmentB.bill.length == 0) {
                    layer.alert('请上传《经营服务项目可研评审意见书》!', {skin: 'layui-layer-lan', closeBtn: 1});
                    return false;
                }
                if ($scope.VO.dealAttachmentB.list.length == 0) {
                    layer.alert('请上传《经营服务项目可研评审小组成员名单》!', {skin: 'layui-layer-lan', closeBtn: 1});
                    return false;
                }
            } else {
                if ($scope.VO.dealAttachmentB.report.length == 0) {
                    layer.alert('请上传《项目可研评审意见表》!', {skin: 'layui-layer-lan', closeBtn: 1});
                    return false;
                }
            }
            return true;
        }
    }

    $scope.initData();
    $scope.initFunction();
});