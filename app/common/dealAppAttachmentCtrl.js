app.controller('dealAppAttachmentCtrl', ['$scope', '$rootScope', '$http', '$location', 'ngDialog', 'FileUploader', 'ngVerify', function ($scope, $rootScope, $http, $location, ngDialog, FileUploader, ngVerify) {
    /**
     * 初始化页面变更方法
     */
    $scope.initPage = function () {
        $scope.ref = {
            pk: '0001AA100000000GQYSH',
            code: 'YX000',
            name: '附件'
        };
        $scope.delVO = [];
        $scope.delItems = [];
        $scope.VOs = [];
        $scope.subData = {};
        $scope.isCanUpLoad = false;
        //  控制是否可以上传附件
        // if ($scope.VO.billstatus == $rootScope.SELECT.BILL_STATUS[2].id) {
        //     $scope.isCanUpLoad = true;
        // } else {
        //     $scope.isCanUpLoad = false;
        // }

    };

    /**
     * 初始化按钮事件
     */
    $scope.initButton = function () {
        /**
         * 保存
         */
        $scope.onSubSave = function () {
            ngVerify.check('dealAttachmentsForm', function (errEls) {
                if (errEls && errEls.length) {
                    return angular.alert($rootScope.getDisName("请先填写所有必输项", "!"),
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    if (!($scope.VOs.length > 0)) {
                        //   回写附件来源类型f
                        $scope.aVO.source_billtypeVO = {
                            bill_name: '国网客户信息',
                        };
                        //   回写附件上传人
                        $scope.aVO.upload_operator = {
                            name: $rootScope.userVO.name,
                            pk: $rootScope.userVO.pk
                        }
                        //   回写附件上传时间
                        /* $scope.aVO.operate_date = new Date().format('yyyy-MM-dd');*/
                        $scope.aVO.upload_date = $rootScope.workDate;
                        $scope.aVO.attachment_source = $rootScope.SELECT.ATTACHMENT_SOURCE[1].id;
                        $scope.$parent.confirm($scope.aVO);
                    } else {
                        /* if ($scope.delVO.length > 0) {
                             var index = 0;
                             for(var i=0;i<$scope.delVO.length;i++){
                                 if($scope.delVO[i]==null){
                                    index = index +1;
                                 }
                             }
                             if(index!=$scope.delVO.length){
                                 $scope.$parent.delVO;
                                 $scope.VOs=[];
                                 for(var i=0;i<$scope.delVO.length;i++){
                                     if($scope.delVO[i]!=null){
                                         $scope.VOs.push($scope.delVO[i]);
                                     }
                                 }
                             }

                         }*/
                        $scope.tmpVO = [];
                        angular.forEach($scope.VOs, function (item) {
                            $scope.flag=false;
                            for(var j=0;j<$scope.delItems.length;j++){
                                if(item.pk_project_id == $scope.delItems[j].pk_project_id){
                                    $scope.flag=true;
                                    return;
                                }
                            }
                            if($scope.flag==true){
                                //noinspection JSAnnotator
                                return;
                            }
                            if (item!=null&&item) {
                                item.source_billtypeVO = {
                                    bill_name: '国网客户信息'
                                };
                                item.upload_operator = {
                                    name: $rootScope.userVO.name,
                                    pk: $rootScope.userVO.pk
                                }
                                item.attachment_source = $rootScope.SELECT.ATTACHMENT_SOURCE[1].id;
                                item.upload_date = new Date().format("yyyy-MM-dd HH:mm:ss");
                                $scope.tmpVO.push(item);

                            }

                        });
                        $scope.VOs = [];
                        angular.assignData($scope.VOs,$scope.tmpVO)
                        $scope.$parent.confirm($scope.VOs);
                        $scope.VOs = [];
                    }
                    ngDialog.close();
                }
            }, true);

        };
        /**
         * 附件管理保存
         */
        $scope.onSubSaveAnyTime = function () {
            ngVerify.check('dealAttachmentsForm', function (errEls) {
                if (errEls && errEls.length) {
                    return angular.alert($rootScope.getDisName("请先填写所有必输项", "!"),
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    if (!($scope.VOs.length > 0)) {
                        //   回写附件来源类型f
                        $scope.aVO.source_billtypeVO = {
                            bill_name: '国网客户信息',
                        };
                        //   回写附件上传人
                        $scope.aVO.upload_operator = {
                            name: $rootScope.userVO.name,
                            pk: $rootScope.userVO.pk
                        }
                        //   回写附件上传时间
                        /* $scope.aVO.operate_date = new Date().format('yyyy-MM-dd');*/
                        $scope.aVO.upload_date = $rootScope.workDate;
                        $scope.aVO.attachment_source = $rootScope.SELECT.ATTACHMENT_SOURCE[1].id;
                        $scope.$parent.confirm($scope.aVO);
                    } else {
                        $scope.tmpVO = [];
                        angular.forEach($scope.VOs, function (item) {
                            $scope.flag=false;
                            for(var j=0;j<$scope.delItems.length;j++){
                                if(item.pk_project_id == $scope.delItems[j].pk_project_id){
                                    $scope.flag=true;
                                    return;
                                }
                            }
                            if($scope.flag==true){
                                //noinspection JSAnnotator
                                return;
                            }
                            if (item!=null&&item) {
                                item.source_billtypeVO = {
                                    bill_name: '国网客户信息'
                                };
                                item.upload_operator = {
                                    name: $rootScope.userVO.name,
                                    pk: $rootScope.userVO.pk
                                }
                                item.attachment_source = $rootScope.SELECT.ATTACHMENT_SOURCE[1].id;
                                item.upload_date = new Date().format("yyyy-MM-dd HH:mm:ss");
                                $scope.tmpVO.push(item);
                            }

                        });
                        $scope.VOs = [];
                        angular.assignData($scope.VOs,$scope.tmpVO)
                        for(let i=0;i<$scope.VOs.length;i++){
                            $scope.VO.dealAttachmentB.push($scope.VOs[i]);
                        }
                        angular.element(document.querySelector('[ng-controller=upLoadCtrls]')).scope().dealAttachmentBGridOptions.gridApi.core.refresh();
                    }
                }
            }, true);

        };

        $scope.removeAnyTime = function(item){
            for(let i=0;i<$scope.VO.dealAttachmentB.length;i++){
                if($scope.VO.dealAttachmentB[i].pk_project_id == item.pk_project_id){
                    $scope.VO.dealAttachmentB.splice(i, 1);
                }
            }
        }
        $scope.removeAllAnyTime = function(){
            for(let i=0;i<$scope.VOs.length;i++){
                for(let j=0;j<$scope.VO.dealAttachmentB.length;j++){
                    if($scope.VO.dealAttachmentB[j].pk_project_id == $scope.VOs[i].pk_project_id){
                        $scope.VO.dealAttachmentB.splice(j, 1);
                        break;
                    }
                }
            }
        }
        $scope.submitAnyTime = function(){
            $scope.VOs = [];
            $rootScope.submitAnyTime = true;
            ngDialog.close();
        };

        /**
         * 取消
         */
        $scope.onSubCancel = function () {
            angular.assignData($scope.aVO, $scope.subData);
            ngDialog.close();
        };
    };

    /**
     * 初始化弹窗form的VO
     */
    $scope.initVO = function () {
        if ($scope.$parent && $scope.$parent.aVO) {
            //载体类型
            // $scope.$parent.aVO.carrier_type = $rootScope.SELECT.CARRIER_TYPE[0].id;
            // $scope.$parent.aVO.doc_type = $rootScope.SELECT.DOC_TYPE[1].id;
            // $scope.$parent.aVO.attachment_source = $rootScope.SELECT.ATTACHMENT_SOURCE[1].id;
            $scope.subData = angular.copy($scope.$parent.aVO);
        } else {
            $scope.$parent.aVO = null;
            // $scope.$parent.aVO.carrier_type = $rootScope.SELECT.CARRIER_TYPE[0].id;
            // $scope.$parent.aVO.doc_type = $rootScope.SELECT.DOC_TYPE[1].id;
            // $scope.$parent.aVO.attachment_source = $rootScope.SELECT.ATTACHMENT_SOURCE[1].id;
            $scope.subData = angular.copy($scope.$parent.aVO);
        }
        return $scope.subData;
    };
    $scope.ifSession = function () {

    }
    // $scope.ifSession();
    $scope.initButton();
    $scope.initPage();
    $scope.aVO = $scope.initVO();

}]);