/**
 * Created by gongpf on 2019/10/28.
 */

var initonlineView = function ($scope, $rootScope, $sce, $http, ngDialog) {
    /**
     * 查询附件io流信息
     */
    $scope.onRowDblClicks = function (rows) {
        if (!rows || rows.length <= 0) return angular.alert("请选择一条单据进行操作！");
        var ids = [];
        var types = "";
        ids.push(rows.pk_project_id);
        var name = rows.attachment_name.toLowerCase();
        if (name.indexOf(".pdf") > -1) {
            types = "application/pdf";
        } else if (name.indexOf(".jpg") > -1) {
            types = "image/jpeg";
        } else if (name.indexOf(".txt") > -1) {
            types = "text/plain";
        } else if (name.indexOf(".png") > -1) {
            types = "image/jpeg";
        } else {
            var exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
            return;
        }
        $http.post($rootScope.basePath + 'uploadFile/downloadFilesView', {
            data: angular.toJson(ids),
        }, {responseType: 'arraybuffer'}).success(function (response) {
            var files = new Blob([response], {type: types});
            var fileURL = URL.createObjectURL(files);
            $scope.content = $sce.trustAsResourceUrl(fileURL);
            $scope.content = $scope.content;
            $scope.type = types;
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'pdfView.html',
                className: 'ngdialog-theme-formInfo',
                controller: 'pdfViewCtrl',
                scope: $scope,
                preCloseCallback: function (value) {
                    if (value && value == "clear") {
                        //重置
                        return false;
                    }
                    //取消
                    return true;
                }
            }).then(function (value) {
                if (value != null) {
                    for (var i = 0; i < value.length; i++) {
                        $scope[$scope.selectTabName].data.push(value[i]);
                    }
                }
            }, function (reason) {
            });
        });
    }

    $scope.onViewMp4 = function () {
        if (null == $scope.VO.mp4Name) {
            return;
        }
        ngDialog.openConfirm({
            showClose: true,
            closeByDocument: true,
            template: 'mp4View.html',
            className: 'ngdialog-theme-formInfo',
            controller: 'mp4ViewCtrl',
            scope: $scope,
            preCloseCallback: function (value) {
                if (value && value == "clear") {
                    //重置
                    return false;
                }
                //取消
                return true;
            }
        })
    }

    //添加附件界面双击预览事件
    // if ($scope.dealAttachmentBGridOptions && !$scope.isForm) {
    //     $scope.dealAttachmentBGridOptions.rowTemplate =
    //         "<a><div ng-dblclick=\"grid.appScope.onRowDblClicks(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div></a>";
    // }
    // if ($scope.assistantGridOptions && !$scope.isForm) {
    //     $scope.assistantGridOptions.rowTemplate =
    //         "<a><div ng-dblclick=\"grid.appScope.onRowDblClicks(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div></a>";
    // }
    app.controller('pdfViewCtrl', function ($sce, $scope, $stateParams, $http) {
        $scope.content = $scope.content;
        $scope.type = $scope.type;
    });

    app.controller('mp4ViewCtrl', function ($scope) {
    });
}


//在线预览
var initPreviewFile = function ($scope, $rootScope) {
    $scope.onPreviewFile = function (id, name) {
        var sm2url = SM2EncryptOnlinePreview($rootScope.basePath + "uploadFile/previewFile?id=" + id + "&fullfilename=" + name);
        var post_form = document.createElement("form");
        post_form.action = $rootScope.previewPath + 'onlinePreview';
        post_form.target = "_blank";
        post_form.method = "post";
        post_form.style.display = "none";
        var param = document.createElement("textarea");
        param.name = "url";
        param.value = sm2url;
        post_form.appendChild(param);
        document.body.appendChild(post_form);
        post_form.submit();
        // window.open($rootScope.previewPath + 'onlinePreview?url=' + url);
    };
    //卡片下载
    $scope.onDownLoadsCard = function (id) {
        let ids = [];
        ids.push(id);
        let exportEx = $('#exproE');
        exportEx.attr('target', '_blank');
        $('#exproE input').val(ids);
        exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
        exportEx.submit();
    };
}