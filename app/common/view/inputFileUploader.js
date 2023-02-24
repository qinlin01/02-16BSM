angular.module("lrApp")
    .directive("inputFileUploader", [function () {
        return {
            restrict: 'AE',
            templateUrl: 'common/view/inputFileUploader.html',
            scope: {
                modelData: '=modelData',
                funcCode: '=funcCode',
                instructions: '=instructions',
            },
            link: function ($scope, $elem) {

            },
            controller: ["$scope", "$rootScope", "FileUploader", "$http", function ($scope, $rootScope, FileUploader, $http) {

                var uidPrefix = 'fileUploader-' + new Date().getTime();
                $scope.uid = uidPrefix;

                var url =$rootScope.basePath + 'uploadFile/upLoadFileMethod';
                var token = window.sessionStorage.getItem("token");
                var pass = SG_sm3encrypt(url + token);
                console.log(url + token);
                var dateStr = new Date().getTime();
                $scope.maxSize = 100; // 限制上传文件的大小
                var uploaderList = $scope.uploaderList = new FileUploader({
                    url: $rootScope.basePath +'uploadFile/upLoadFileMethod',
                    queueLimit: 100,  //文件个数
                    removeAfterUpload: true,
                    autoUpload: true,
                    withCredentials: true,//这个很关键，解决跨域访问
                    headers: {
                        'x-auth-token': token,
                        'Vailcode': pass,
                        'funcCode': $scope.funcCode,
                        'secret': dateStr
                    },
                    formData: [{funcCode: $scope.funcCode}, {instructions: $scope.instructions}],
                });

                uploaderList.filters.push({
                    name: 'sizeFilter',
                    fn: function (item) {
                        //$scope.maxSize是指令传过来的参数
                        var fileSizeValid = item.size <= $scope.maxSize * 1024 * 1024; //文件大小限制；
                        return fileSizeValid;
                    }
                });

                uploaderList.filters.push({
                    name: 'customerFilter',
                    fn: function (item/*{File|FileLikeObject}*/) {
                        var fileName = item.name.substr(item.name.lastIndexOf('.') + 1);
                        var type = '|' + angular.lowercase(fileName) + '|';
                        var filters = '|jpeg|jpg|png|pdf|doc|docx|xls|xlsx|ppt|pptx|vsdx|vsd|wps|wpt|et|txt|bpm|ofd|ceb|';
                        return filters.indexOf(type) != -1;
                    }
                });

                uploaderList.filters.push({
                    name: 'fileNameFilter',
                    fn: function (item/*{File|FileLikeObject}*/) {
                        var checked = true;
                        for (let i = 0; i < $scope.modelData?.length; i++) {
                            if ($scope.modelData[i].fileName = item.name) {
                                checked = false;
                                break;
                            }
                        }
                        return checked;
                    }
                });
                uploaderList.onAfterAddingFile  = function(fileItem) {

                };
                uploaderList.onBeforeUploadItem = function (item) {
                    if ($scope.modelData == null) {
                        $scope.modelData = [];
                    }
                    layer.load(2);
                };

                uploaderList.onWhenAddingFileFailed = function (item/*{File|FileLikeObject}*/, filter, options) {
                    if (filter.name == "sizeFilter") {
                        layer.msg('只能上传小于' + $scope.maxSize + 'MB的文件，请重新选择。', {icon: 5});
                    }
                    if (filter.name == "customerFilter") {
                        layer.msg('只能上传pdf、office、wps、图片等非压缩文件，请重新选择。', {icon: 5});
                    }
                    if (filter.name == "fileNameFilter") {
                        layer.msg(item.name + '文件名重复，请重新选择。', {icon: 5});
                    }
                };
                uploaderList.onSuccessItem = function (fileItem, response, status, headers) {
                    layer.closeAll('loading');

                    if (response.code == 200) {
                        console.log(fileItem);
                        response.data.$$hashKey = fileItem.$$hashKey;
                        $scope.modelData.push(response.data);
                    } else {
                        layer.msg('文件上传后台处理失败，请联系系统运维人员。', {icon: 5});
                    }
                };
                uploaderList.onError = function (fileItem, response, status, headers) {
                    layer.closeAll('loading');
                    layer.msg('上传文件失败，请检查文件格式是否正确。', {icon: 5});

                }
                $scope.removeFile = function (fileItem) {
                    if (fileItem == null) {
                        layer.msg('请选择要删除的文件', {icon: 7});
                    }
                    layer.load(2);
                    if (uploaderList.queue.length > 0) {
                        // 从队列中删除上传的文件
                        for (let i = 0; i < uploaderList.queue.length; i++) {
                            if (uploaderList.queue[i].$$hashKey == fileItem.$$hashKey) {
                                uploaderList.queue[i].remove();
                            }
                        }
                    }

                    var newFiles = [];
                    for (let i = 0; i < $scope.modelData.length; i++) {
                        if ($scope.modelData[i].id != fileItem.id) {
                            newFiles.push($scope.modelData[i]);
                        }
                    }
                    $scope.modelData = [];
                    for (let i = 0; i < newFiles.length; i++) {
                        $scope.modelData.push(newFiles[i]);
                    }
                    $http.post($rootScope.basePath + "sys/uploadFile/remove", {id: fileItem.id})
                        .success(function (response) {
                            if (response.code == 200) {
                                layer.closeAll('loading');
                                layer.msg("附件删除成功。");
                            }
                        });

                }
            }]
        }
    }]);