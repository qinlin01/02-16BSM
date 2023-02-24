/**
 * Created by sjd on 2017-8-3.
 */
app.controller('upLoadCtrls', ['$scope', 'FileUploader', '$rootScope', '$location', '$http', 'ngVerify', 'ngDialog', function ($scope, FileUploader, $rootScope, $location, $http, ngVerify, ngDialog) {

    $scope.isDisDow = true;
    $scope.my_tree_selected = {};
    $scope.deltmp = [];

    // $scope.initData = function(){
    //     $("#filetype").val($scope.type.code); 
    // };
    // $scope.initData();
    $scope.getIfUploads = function () {
        var ifUploads = true;
        if ($scope.uploader.queue) {
            angular.forEach($scope.uploader.queue, function (item) {
                if (!item.isUploaded) {
                    ifUploads = true;
                } else {
                    ifUploads = false;
                }
            });
        }
        return ifUploads;
    };

    $scope.uploadById = function (id) {
        if ($scope.VOs.length == uploader.queue.length){
            var inputFile = $('#upload_file' + id);
            inputFile.click();
        }
    };

    var uploader = $scope.uploader = new FileUploader({
        url: $rootScope.basePath + 'uploadFile/upLoadFileMethod',
        data: {ss: $scope.aVO.pk_pub_blob},
        queueLimit: 100,  //文件个数
        removeAfterUpload: false,
        autoUpload: true,
        headers: {'x-auth-token': window.sessionStorage.getItem("token")},
    });


    // FILTERS

    uploader.filters.push({
        name: 'customFilter',
        fn: function () {
            return this.queue.length < 100;
        }
    });
    uploader.filters.push({
        name: 'imageFilter',
        fn: function (item/*{File|FileLikeObject}*/, options) {
            if (options){
                $scope.options=options;
            }
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            if (type == "||") {
                type = '|' + item.name.split('.')[item.name.split('.').length - 1] + '|';
            }
            if (/['"#$%&<>\^*]/.test(item.name)) {
                layer.alert("文件名称不允许包含特殊字符", {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
            if (item.size > 157286400 ) {
                layer.alert("请上传小于150M的文件", {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
            return true;
            if ('|plain|vnd.ms-excel|vnd.openxmlformats-officedocument.spreadsheetml.sheet|vnd.openxmlformats-officedocument.wordprocessingml.document|msword|x-zip-compressed|vnd.openxmlformats-officedocument.presentationml.presentation|rar|pdf|vnd.ms-powerpoint|jpeg|png|rar|zip'.indexOf(type) !== -1) {
                return true;
            } else {
                layer.alert("请上传有效文件(word,excel,txt,ppt,pdf,rar,zip)", {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
        }
    });
    /*    $scope.upLoadAll = function () {
     ngVerify.check('dealAttachmentsForm', function (errEls) {
     if (errEls && errEls.length) {
     return angular.alert($rootScope.getDisName("请先填写所有必输项","!"),
     {skin: 'layui-layer-lan', closeBtn: 1});
     } else {
     angular.forEach($scope.uploader.queue, function(item) {
     // if(!item.pk){
     if (!item.isUploaded){
     item.upload();
     // }
     // uploader.onBeforeUploadItem = function(item) {   //文件上传之前
     //     console.info('onBeforeUploadItem', item);
     // };

     }


     });
     }
     }, true);
     }*/
    uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
    };
    uploader.onAfterAddingFile = function (fileItem) {  //添加文件到上传队列后
        $http.post($rootScope.basePath + "account/getSession").success(function (response) {
            if (response.session != null) {
                /* window.sessionStorage.setItem("token", response.session);
                 $rootScope.userVO = response.userVO;
                 $rootScope.loginUser=$rootScope.userVO;
                 $rootScope.orgVO = response.org;
                 $rootScope.deptVO = response.dept;
                 if (response.userVO.is_admin != 'N'){
                 $rootScope.isAdmin = true;
                 } else {
                 $rootScope.isAdmin = false
                 }*/

            } else if ($location.$$absUrl.includes("single")) {
                ngDialog.close();
                $location.path('/login/signLogin');
            } else {
                ngDialog.close();
                $location.path('/login/signin');
            }

        });
    };
    uploader.onAfterAddingAll = function (addedFileItems) { //添加所选的所有文件到上传队列后
    };
    uploader.onBeforeUploadItem = function (item) {   //文件上传之前
        item.formData = [{"fileType": $scope.VO.fileType && $scope.VO.fileType.name}];
    };
    uploader.onProgressItem = function (fileItem, progress) {  //文件上传中
    };
    uploader.onProgressAll = function (progress) {   //上传队列的所有文件上传中
    };
    uploader.onSuccessItem = function (fileItem, response, status, headers) {   //文件上传成功后
        if (response.msg) {
            $scope.uploader.queue[0].remove();
            return angular.alert(response.msg,
                {skin: 'layui-layer-lan', closeBtn: 1});
        } else {
            var vo = {
                pk_pub_blob: response.result.pk_pub_blob,
                pk_project_id: response.result.pk_project_id,
                attachment_name: response.result.attachment_name,
                file_type: $scope.VO.fileType && $scope.VO.fileType.name,
                // options_type:$scope.options,
                pk_document_dir: fileItem.pk_document_dir ? {
                    pk: fileItem.pk_document_dir.pk,
                    name: fileItem.pk_document_dir.name
                } : null
            };
            Object.assign(vo, $scope.options)
            fileItem.pk_project_id = response.result.pk_project_id;
            fileItem.pk_pub_blob = response.result.pk_pub_blob;
            fileItem.attachment_name = response.result.attachment_name;
            fileItem.file_type = $scope.VO.fileType && $scope.VO.fileType.name;
            Object.assign(fileItem, $scope.options)
            $scope.VOs.push(vo);
        }

    };
    uploader.onRemove = function (items,delitem) { /*fileItem, response, status, headers*/
        var a = 1;
        if (items) {
            var tmp = [];
            // $scope.VOs = [];

            for (var i = 0; i < items.length; i++) {
                var vo = {
                    pk_pub_blob: items[i].pk_pub_blob,
                    pk_project_id: items[i].pk_project_id,
                    attachment_name: items[i].attachment_name,
                    file_type: $scope.VO.fileType && $scope.VO.fileType.name,
                    source_billtypeVO : {
                        bill_name: ''
                    },
                    fileItemupload_operator : {

                    },
                    fileItemattachment_source : null,
                    fileItemupload_date :'',
                    pk_document_dir:items[i].pk_document_dir ? {
                        pk: items[i].pk_document_dir.pk,
                        name: items[i].pk_document_dir.name
                    } : null
                };
                tmp.push(vo)
            }
            if (delitem){
                var vo = {
                    pk_pub_blob: delitem.pk_pub_blob,
                    pk_project_id: delitem.pk_project_id,
                    attachment_name: delitem.attachment_name,
                    file_type: $scope.VO.fileType && $scope.VO.fileType.name,
                    source_billtypeVO : {
                        bill_name: ''
                    },
                    fileItemupload_operator : {

                    },
                    fileItemattachment_source : null,
                    fileItemupload_date :'',
                    pk_document_dir:delitem.pk_document_dir ? {
                        pk: delitem.pk_document_dir.pk,
                        name: delitem.pk_document_dir.name
                    } : null
                };
                $scope.deltmp.push(vo)
            }
            angular.assignData($scope.delItems, $scope.deltmp);
            angular.assignData($scope.delVO, tmp);
        }
    }
    uploader.onErrorItem = function (fileItem, response, status, headers) {   //文件上传失败后
        fileItem.remove();
        return layer.alert("上传附件错误请重新登陆系统再上传!", {skin: 'layui-layer-lan', closeBtn: 1});
    };
    uploader.onCancelItem = function (fileItem, response, status, headers) {  //文件上传取消后

    };
    uploader.onCompleteItem = function (fileItem, response, status, headers) { //文件上传完成后

    };
    uploader.onCompleteAll = function () {//上传队列的所有文件上传完成后

    };
    // $scope.downloadFiles= function(){
    //     if (!$scope.aVO.pk_pub_blob.pk_object_id){
    //         $scope.aVO.pk_pub_blob.pk_object_id=$scope.aVO.pk_project_id
    //     }
    //     window.location.href=$rootScope.basePath+"uploadFile/downloadFileMethods?fileId="+$scope.aVO.pk_pub_blob.pk_object_id;
    // }
    $scope.my_tree_handler = function (branch) {
        if (!$scope.VO.fileType) $scope.VO.fileType = {};
        $scope.VO.fileType.name = branch.name;
    }

    $scope.$watch('aVO.attachment_name', function (newVal) {
        if (newVal) {
            $scope.isDisDow = false;
            $scope.isDisabled = true;
        }
        if (!newVal) {
            $scope.isDisDow = true;
            $scope.isDisabled = false;
        }

    }, true);

    $scope.onDeleteLine = function () {
        var delRow = $scope.dealAttachmentBGridOptions.gridApi.selection.getSelectedRows();

        if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
            skin: 'layui-layer-lan',
            closeBtn: 1
        });
        for (var i = 0; i < $scope.dealAttachmentBGridOptions.data.length; i++) {
            for (var j = 0; j < delRow.length; j++) {
                if ($scope.dealAttachmentBGridOptions.data[i].$$hashKey == delRow[j].$$hashKey) {
                    $scope.dealAttachmentBGridOptions.data.splice(i, 1);
                }
            }
        }
        $scope.VO.dealAttachmentB = $scope.dealAttachmentBGridOptions.data;
    };

    $scope.dealAttachmentBGridOptions = {
        enableCellEditOnFocus: true,
        enableRowSelection: true,
        enableSelectAll: true,
        multiSelect: true,
        enableSorting: false,
        enableRowHeaderSelection: true,
        selectionRowHeaderWidth: 35,
        rowHeight: 35,
        columnDefs: [
            {
                name: 'file_type',
                displayName: '附件类型',
                width: 100,
                enableCellEdit: true,
                cellFilter: $scope.filetype ? 'SELECT_' + $scope.filetype : null,
                editableCellTemplate: 'ui-grid/dropdownEditor'
                ,
                editDropdownValueLabel: 'name'
                ,
                editDropdownOptionsArray: $scope.filetype ? getSelectOptionData[$scope.filetype] : null
            },
            {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},
        ],
        data: $scope.VO.dealAttachmentB,
        onRegisterApi: function (gridApi) {
            if ($scope.downFlag) {
                $scope.dealAttachmentBGrid = gridApi;
                $scope.downFlag = false;
            } else {
                $scope.dealAttachmentBGridOptions.gridApi = gridApi;
            }
            $scope.dealAttachmentBGridOptions.gridApi.core.addRowHeaderColumn({
                name: 'rowHeaderCol', displayName: '', width: 30, cellTemplate: 'ui-grid/rowNumberHeader'
            });
        }
    };
}]);
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

