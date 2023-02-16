app.controller('baseController', function ($rootScope, $scope, $http, ngVerify, $stateParams, ngDialog, $sce) {


    //列表查询
    $scope.queryForGrid = function (data) {
        if (!$scope.queryData) {
            $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
        }
        layer.load(2);
        $http.post($scope.basePath + $scope.url() + "/queryForGrid", {
            params: angular.toJson(data),
            current: $scope.gridApi ? $scope.gridApi.page : 1,
            size: $scope.gridApi ? $scope.gridApi.pageSize : 100
        }).success(function (response) {
            if (response.code == 200) {
                $scope.gridOptions.data = response.data.records;
                $scope.gridOptions.totalItems = response.data.total;
                layer.closeAll('loading');
            } else {
                layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                layer.closeAll('loading');
            }
            layer.closeAll('loading');
        });
    };

    /**
     * 工具方法，绑定数据
     * @param resData
     */
    $scope.bindData = function (resData) {
        angular.assignData($scope.VO, resData);
    };
    /**
     * 查询数据
     * @param pk
     */
    $scope.findOne = function (pk) {
        $scope.pk = pk;
        $http.post($scope.basePath + $scope.url() + "/findOne", {pk: pk}).success(function (response) {
            layer.closeAll('loading');
            if (response && response.code == 200) {
                $scope.bindData(response.data);
            } else {
                layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
            }
        });
    };

    /**
     * 保存判断必输项
     */
    $scope.onSave = function () {
        ngVerify.check('appForm', function (errEls) {
            if (errEls && errEls.length) {
                for (let i = 0; i < errEls.length; i++) {
                    var item = errEls[i];
                    console.log(item);
                }
                return layer.msg("请检查标记的输入项的正确性。", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
            }
            if ($scope.checkDataBeforSave()) {
                $scope.saveVO();
            }
        });
        console.log("sucess");
    };

    $scope.saveVO = function () {
        layer.load(2);
        $http.post($rootScope.basePath + $scope.url() + "/save", {
            data: angular.toJson($scope.VO),
            funcCode: $scope.funcCode
        })
            .success(function (response) {
                if (response.code != -1) {
                    $scope.isGrid = false;
                    $scope.isForm = false;
                    $scope.isCard = true;
                    $scope.isForm = false;
                    if (response.data) {
                        $scope.bindData(response.data);
                    }
                    layer.closeAll('loading');
                } else {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
    };

    $scope.onRowDblClick = function (item) {
        if (item && item.id) {
            $scope.onCard(item.id);
        }

    };


    /**
     * 过滤查询功能
     */
    $scope.onQuery = function () {
        $scope.queryForGrid($scope.QUERY);
    };
    $scope.onReset = function () {
        $scope.QUERY = $scope.initQUERY();
    };

    /**
     * 子表新增
     */
    $scope.onAddLine = function (selectTabName) {
        let data = {};
        $scope[selectTabName].data.push(data);

    };

    /**
     * 子表删除
     */
    $scope.onDeleteLine = function (gridname, row) {

        let delRow = row;
        if (!delRow || delRow.length == 0) return layer.msg('请选择行数据', {
            skin: 'layui-layer-lan',
            closeBtn: 1
        });
        for (let i = 0; i < $scope[gridname].data.length; i++) {
            if ($scope[gridname].data[i].$$hashKey == delRow.entity.$$hashKey) {
                $scope[gridname].data.splice(i, 1);
            }
        }
    };

    $scope.selectTab = function (name) {
        $scope.selectTabName = name.toString();
    };


    $scope.onCancel = function () {
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isForm = false;
        $scope.isForm = false;
        $scope.bindData($scope.initVO());
    };
    /**
     * 返回
     */
    $scope.onBack = function () {
        //阻止页面渲染
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isForm = false;
        $scope.isForm = false;
        $scope.initData();
        $scope.queryForGrid($scope.QUERY);
        angular.forEach($rootScope.currentTabs, function (item, index) {
            if ($scope.funcCode == item.id) {
                item.billId = null;
            }
        });
    };

    $scope.onDelete = function () {
        var rows = $scope.gridApi.selection.getSelectedRows();
        if (!rows || rows.length == 0) return layer.msg("请选择需要删除的数据!", {
            icon: 2,
            time: 2000,
            shade: [0.5, '#000', true]
        });

        layer.confirm('<span class="text-red">是否删除选中的数据？</span>', {
                btn: ['确认', '取消'], //按钮
                btn2: function (index, layero) {
                    layer.msg('取消操作!', {
                        shift: 6,
                        icon: 11
                    });
                },
                shade: 0.6,//遮罩透明度
                shadeClose: true,//点击遮罩关闭层
            },
            function () {
                var ids = [];
                for (var i = 0; i < rows.length; i++) {
                    ids.push(rows[i].id);
                }
                layer.load(2);
                $http.post($scope.basePath + $scope.url() + "/delete", {ids: angular.toJson(ids)}).success(function (response) {
                    layer.closeAll('loading');
                    if (response && response.code == 200) {
                        $scope.queryForGrid($scope.QUERY);
                        layer.msg('操作成功!', {icon: 1, time: 2000, shade: [0.5, '#000', true]});
                    }

                });
            }
        );
    };
    $scope.initRefData = function () {

    }

    $scope.beforEdit = function () {

    }
    /**
     * 修改
     */
    $scope.onEdit = function () {
        $scope.initRefData();
        //  控制字表按钮的显示
        $scope.isForm = true;
        if ($scope.isGrid) {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) {
                return layer.msg("请选择一条数据进行修改!", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
            } else {
                $scope.isGrid = false;
                $scope.isCard = false;
                $scope.isForm = true;
                $scope.findOne(rows[0].id);
                $scope.beforEdit();
            }

        } else {
            $scope.findOne($scope.VO.id);
            $scope.isGrid = false;
            $scope.isCard = false;
            $scope.isForm = true;
            $scope.beforEdit();
        }
    };


    $scope.onAdd = function () {
        $scope.isGrid = false;
        $scope.isCard = false;
        $scope.isForm = true;
        $scope.isForm = true;
        $scope.initRefData();
        $scope.bindData($scope.initVO());
    };


    /**
     * 过滤查询功能
     */
    $scope.onQuery = function () {
        $scope.queryForGrid($scope.QUERY);
    };


    $scope.onCard = function () {
        var rows = $scope.gridApi.selection.getSelectedRows();

        if (!rows || rows.length != 1) {
            layer.msg("请选择一条数据进行查看!", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
            return;
        } else {
            $http.post($scope.basePath + $scope.url() + "/findOne", {
                pk: rows[0].id
            }).success(function (response) {
                if (response && response.code == 200) {
                    angular.assignData($scope.VO, response.data);
                    $scope.isGrid = false;
                    $scope.isCard = true;
                    $scope.isForm = false;
                    angular.forEach($rootScope.currentTabs, function (item, index) {
                        if ($scope.funcCode == item.id) {
                            item.billId = $scope.VO.id;
                        }
                    });
                } else {
                    if (response) {
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                }
            });
        }
    };

    $scope.onView = function (item) {
        if (item == null)
            return layer.msg("请选择一条数据进行查看!", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
        $http.post($scope.basePath + $scope.url() + "/findOne", {
            pk: item.id
        }).success(function (response) {
            if (response && response.code == 200) {
                angular.assignData($scope.VO, response.data);
                $scope.isGrid = false;
                $scope.isCard = true;
                $scope.isForm = false;
                $scope.isForm = false;
                angular.forEach($rootScope.currentTabs, function (item, index) {
                    if ($scope.funcCode == item.id) {
                        item.billId = $scope.VO.id;
                    }
                });
            } else {
                if (response) {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
        });
    };


    $scope.initPage = function () {
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isForm = false;
        $scope.isForm = false;

        $scope.gridOptions = {
            // rowTemplate: "<div ng-dblclick=\"grid.appScope.onRowDblClick(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>",
            enableRowSelection: true,
            // enableSelectAll: true,
            // enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: $scope.columnDefs(),
            data: []
        };
        $scope.gridOptions.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;

            //添加行头
            $scope.gridApi.core.addRowHeaderColumn({
                name: 'rowHeaderCol',
                displayName: '',
                width: 30,
                cellTemplate: 'ui-grid/rowNumberHeader'
            });

            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                $scope.gridApi.page = newPage;
                $scope.gridApi.pageSize = pageSize;
                $scope.queryForGrid($scope.QUERY);
            });
            $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row, event) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (rows.length == 1) {
                    $scope.findOne(rows[0].id);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });
        };

    };

    $scope.initData = function (data) {

        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {};
        };
        $scope.QUERY = $scope.initQUERY();
    };

    /**
     * 此公共函数用于动态判断列表页按钮是否可用
     * @param gridApi
     * @param statusName    gridApi的某个数据项
     * @param statusValue  与gridApi的某个数据项，比较的值（多个值，可用数组）
     * @param isSingle     决定可不可以选取多条行数据
     * @returns {boolean}  按钮是否可编辑的状态（true：不可编辑，false：可编辑）
     */
    $scope.checkStatus = function (gridApi, statusName, statusValue, isSingle) {

        //   默认的情况
        if (!gridApi) return true;                                                 //   gridApi为假，肯定直接按钮不可用
        if (isSingle === 'undefined' || isSingle === undefined) isSingle = true;   //   不填默认只能选取单行
        var rows = gridApi.selection.getSelectedRows();
        if (!rows || rows.length === 0) return true;                               //   所选行数为0，肯定直接按钮不可用

        //  isSingle,决定可不可以选取多行
        if (!!isSingle) {
            if (rows.length != 1) return true;
            if (!!(statusName)) {   //&& statusValue
                if (statusValue instanceof Array) {
                    return !(statusValue.indexOf(rows[0][statusName]) > -1 || statusValue.indexOf('') > -1);
                }
                return !(rows[0][statusName] == statusValue);
            }
        } else {
            if (!!(statusName)) {  //&& statusValue
                //@zhangwj 【YDBXJJ-1905】如果选择一条未上报数据然后再选择一条审核通过的数据，删除按钮就可以点击了，删除已审批通过的单据 update line 175-196
                var result;
                if (statusValue instanceof Array) {
                    for (i = 0; i < rows.length; i++) {
                        for (j = 0; j < statusValue.length; j++) {
                            if (statusValue[j] == rows[i][statusName]) {
                                result = false;
                                break;
                            } else {
                                result = true;
                            }
                        }
                        if (result) {
                            return result;
                        }
                    }
                } else {
                    for (i = 0; i < rows.length; i++) {
                        if (rows[i][statusName] != statusValue) {
                            return true;
                        }
                    }
                }
            }
        }

        //   statusName 与 statusValue没值，直接由isSingle决定
        return false;
    };

    $scope.fromNav = function () {
        if ($stateParams.pk != null) {
            $scope.findOne($stateParams.pk);
            $scope.isForm = false;
            $scope.isGrid = false;
            $scope.isCard = true;
        } else {
            //$scope.onQuery();
        }
    }


    /**
     * 查询审批流信息
     */
    $scope.queryWorkFlow = function (id, fun) {
        layer.load(2);
        $http.post($scope.basePath + "sys/flow/linkWorkFlow", {pk: id, funcCode: $scope.funcCode})
            .success(function (response) {
                if (fun) fun(response);
            });
    };

    /**
     * 查询审批流信息
     */
    $scope.queryFlowInfoForAudit = function (id, fun) {
        var entityVOPath = "";
        if (!angular.isUndefined($scope.entityVO)) {
            entityVOPath = $scope.entityVO;
        }
        var jsonObject = angular.toJson($scope.VO);
        layer.load(2);
        $http.post($scope.basePath + "sys/flow/getTransitions", {id: id, vo: jsonObject})
            .success(function (response) {
                if (response.code == 200) {
                    if (fun) fun(response);
                } else {
                    if (!$scope.isGrid) {
                        $scope.findOne($scope.VO.id);
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    } else {
                        $scope.queryForGrid($scope.QUERY);
                        layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    }

                }
            });

    };

    $scope.onSubmit = function () {
        var id;
        if ($scope.isGrid) {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1)
                return layer.msg("请选择一条单据进行提交!", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
            id = rows[0].id;
        } else {
            id = $scope.VO.id;
        }
        if (!id) {
            return layer.msg('当前数据没有保存，请保存之后进行此操作！', {icon: 2, time: 2000, shade: [0.5, '#000', true]});
        }
        layer.load(2);
        $scope.queryFlowInfoForAudit(id, function (response) {
            $scope.submitData = response.data.sort(function (a, b) {
                if (a.order == null) {
                    a.order = 99;
                }
                if (b.order == null) {
                    b.order = 99;
                }
                return parseFloat(a.order) - parseFloat(b.order);
            });
            ;
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: getURL('common/workflow/submitDialog.html'),
                className: 'ngdialog-theme-plain',
                width: 700,
                height: 450,
                controller: 'submitDialogCtrl',
                scope: $scope
            }).then(function (value) {
                console.log('Modal promise resolved. Value: ', value);
                layer.load(2);
                $scope.submit(value);
            }, function (reason) {
                console.log('Modal promise rejected. Reason: ', reason);
                if (reason && reason != '$closeButton') {

                }
            });
        });
    };
    $scope.onLinkAuditFlow = function () {
        var id;
        if ($scope.isGrid) {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.msg("请选择一条数据进行查看!", {
                icon: 2,
                time: 2000,
                shade: [0.5, '#000', true]
            });
            id = rows[0].id;
        } else {
            id = $scope.VO.id;
        }
        layer.load(2);
        $scope.queryWorkFlow(id, function (response) {
            if (response.code != 200) return layer.alert(response.msg, {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            $scope.tasks = response.data.tasks;
            $scope.imgUrl = response.data.img;
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: getURL('common/workflow/linkAuditFlow.html'),
                className: 'ngdialog-theme-plain',
                width: 750,
                height: 500,
                scope: $scope,
            });
        });
    };

    /**
     * 更新常用审批语
     */
    $scope.updateMsg = function () {
        $http.post($scope.basePath + "sys/flow/updateMsg", {id: ""}).success(function (response) {
        });
    };


    $scope.onAudit = function () {
        $scope.onSubmit();
    };


    /*
     * 清空审批流）
     * */
    $scope.onClearWorkflow = function () {
        var id;
        if ($scope.isGrid) {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.msg("请选择一条单据进行操作!", {
                icon: 2,
                time: 2000,
                shade: [0.5, '#000', true]
            });
            id = rows[0].id;
        } else {
            id = $scope.VO.id;
        }
        if (null == $scope.VO.id || $scope.VO.id == "") {
            return layer.msg("请选择一条数据进行处理!", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
        }
        layer.confirm('是否清理选中数据的流程图？', {
                btn: ['清理', '返回'], //按钮
                btn2: function (index, layero) {
                    layer.msg('取消清理!', {
                        shift: 6,
                        icon: 11
                    });
                },
                shade: 0.6,//遮罩透明度
                shadeClose: true,//点击遮罩关闭层
            },
            function () {
                layer.load(2);
                $http.post($scope.basePath + "sys/flow/clearWorkflow", {id: id, funcCode: $scope.funcCode})
                    .success(function (response) {
                        layer.closeAll('loading');
                        if (response.code == 200) {
                            //layer.msg(response.msg);
                            layer.msg("流程图清理成功。", {
                                icon: 1
                            });
                            if ($scope.isGrid) {
                                $scope.queryForGrid($scope.QUERY);
                            } else {
                                $scope.findOne($scope.VO.id);
                            }
                        } else {
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});

                        }
                    });
            }
        );
    };

    $scope.onRecall = function () {

        var id;
        if ($scope.isGrid) {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.msg("请选择一条单据进行撤回!", {
                icon: 2,
                time: 2000,
                shade: [0.5, '#000', true]
            });
            if (rows[0].billstatus != 33 && rows[0].billstatus != 32) return layer.msg("只有审批中状态可以撤回!", {
                icon: 2,
                time: 2000,
                shade: [0.5, '#000', true]
            });
            id = rows[0].id;
        } else {
            id = $scope.VO.id;
            if (rows[0].billstatus != 33 && rows[0].billstatus != 32) return layer.msg("只有审批中状态可以撤回!", {
                icon: 2,
                time: 2000,
                shade: [0.5, '#000', true]
            });
        }

        layer.confirm('是否撤回选中数据？', {
                btn: ['撤回', '取消'], //按钮
                btn2: function (index, layero) {
                    layer.msg('取消撤回!', {
                        shift: 6,
                        icon: 11
                    });
                },
                shade: 0.6,//遮罩透明度
                shadeClose: true,//点击遮罩关闭层
            },
            function () {
                layer.load(2);
                $http.post($scope.basePath + "sys/flow/recall", {
                    id: id, funcCode: $scope.funcCode
                })
                    .success(function (response) {
                        layer.closeAll('loading');
                        layer.msg('撤回成功。', {icon: 1, time: 1000, shade: [0.5, '#000', true]});
                        if ($scope.isGrid) {
                            $scope.queryForGrid($scope.QUERY);
                        } else {
                            $scope.findOne(id);
                        }
                    });
            }
        )
    }

    /*
    * 提交
    * */
    $scope.submit = function (auditResult) {
        var jsonObject = angular.toJson($scope.VO);
        layer.closeAll('loading')

        layer.load(2);
        var data = {};
        data.billData = $scope.VO;
        data.curBillPk = $scope.VO.id;
        data.funcCode = $scope.funcCode;
        data.auditResult = auditResult.auditResult;
        data.selectedTran = auditResult.auditResult.primaryKey;
        data.auditOpinon = auditResult.msg;
        data.auditUser = auditResult.rightSelects;
        $http.post($scope.basePath + "sys/flow/audit", {data: angular.toJson(data), funcCode: $scope.funcCode})
            .success(function (response) {
                layer.closeAll('loading');
                if (response.code == 200) {
                    layer.msg("单据审批成功。", {icon: 1, time: 2000, shade: [0.5, '#000', true]});
                    if ($scope.isGrid) {
                        $scope.queryForGrid($scope.QUERY);
                    } else {
                        $scope.findOne($scope.VO.id);
                    }
                } else {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            });
    };

    /**
     * 在线预览
     *
     * @param id
     * @param name
     */
    $scope.onPreviewFile = function (id, name) {
        $http.post($scope.basePath + "sys/uploadFile/preview", {
            id: id,
            fileName: name,
        }).success(function (response) {
            if (response.code == 200) {
                window.open(response.data, '_blank');
            }
        })
    };

    /**
     * 在线预览
     *
     * @param id
     * @param name
     */
    $scope.onDownLoadFile = function (id, name) {
        $http.post($scope.basePath + "sys/uploadFile/download", {
            id: id,
            fileName: name
        }, {responseType: 'arraybuffer'}).success(function (data, status, headers) {
            headers = headers();
            var contentType = headers['content-type'];
            var linkElement = document.createElement('a');
            try {
                var blob = new Blob([data], {type: contentType});
                var url = window.URL.createObjectURL(blob);
                linkElement.setAttribute('href', url);
                linkElement.setAttribute("download", name);
                var clickEvent = new MouseEvent("click", {
                    "view": window,
                    "bubbles": true,
                    "cancelable": false
                });
                linkElement.dispatchEvent(clickEvent);
            } catch (ex) {
                console.log(ex);
            }
        }).error(function (data) {
            console.log(data);
        })
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

    $scope.openPdf = function (response, pdfName) {

        if (response.code == -1) {
            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
            return;
        }
        //这个⽅法在ie内核下⽆法正常解析。
        var raw = window.atob(response);
        var rawLength = raw.length;
        var array = new Uint8Array(new ArrayBuffer(rawLength));
        for (i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i) & 0xff;
        }
        var files = new Blob([array], {type: "application/pdf", fileName: pdfName});
        var fileURL = URL.createObjectURL(files);
        $scope.content = $sce.trustAsResourceUrl(fileURL);
        $scope.type = "application/pdf";
        $scope.file = fileURL;
        ngDialog.openConfirm({
            showClose: true,
            closeByDocument: false,
            template: getURL('common/view/pdfView.html'),
            className: 'ngdialog-theme-plain',
            width: 750,
            height: 800,
            scope: $scope,
        });
    }

})
;
