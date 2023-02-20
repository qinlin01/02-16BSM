app.controller('standingBookCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, activitiModal, workFlowDialog, $location) {
    $scope.initData =function (data) {
        $scope.status = {open: true};
        $scope.initVO= function () {
            return{
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                dr:0,
                id:'',
            }
        };

        $scope.entityVO = 'nc.vo.busi.standingBookVO';
        //主表数据
        $scope.VO = $scope.initVO();
        //初始化查询
        $scope.initQUERY = function () {
            return {
                "id": $stateParams.id,
                "serviceYear":parseInt(new Date().format("yyyy")),
                "customer_name":'',
                "project_name":'',
                "insurancetype":'',
                "insurance_no":'',
                "territorial_organization":'',
                "startMonth":null,
                "endMonth":null,
                "ifAcrossYears":"N",
            }
        };
        $scope.QUERY = $scope.initQUERY();
    };

    $scope.initHttp=function(){
        /**
         * Grid CSV全部导出，需查询所有数据
         * @param data
         */
        $scope.queryAllForGrid = function (data ,fun,isPrint,etype) {
            layer.load(2);
            if (!$scope.queryData) {
                $scope.queryData =  $scope.gridOptions.columnDefs;
            }
            return $http.post($rootScope.localizedPath + "standingBookController/queryAllForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData),
                isPrint:isPrint,
                etype:0,//0：excel 1：pdf
            })
                .success(function (response) {
                    response.fileName = "台账信息.xlsx";
                    let obj = response;
                    $http.post($rootScope.basePath + "printCommonController/downlodasCsv", {
                        data: angular.toJson(obj),
                        fields: angular.toJson($scope.queryData)
                    }).success(function (response) {
                            let data = angular.fromJson(SM2Decrypt(response));
                            if(fun) fun(data);
                            if(isPrint){
                                window.open(getURL(data.queryPath));
                            }else{
                                window.open($rootScope.basePath + "uploadFile/downLoadByUrl?url="+encodeURI(encodeURI(data.downPath)));
                            }
                            layer.closeAll('loading');
                        }).error(function () {
                        layer.closeAll('loading');
                    });
                }).error(function () {
                    layer.closeAll('loading');
                });
        };

        //列表查询
        $scope.queryForGrid = function (data) {
            $scope.gridOptions.useExternalPagination = true;
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.localizedPath  + "standingBookController/queryForGrid", {
                param: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize
            }).success(function (response) {
                if (response.code == 200) {
                    if (!$scope.query) {
                        $scope.query = $scope.gridOptions.columnDefs;
                    }
                    if ($scope.QUERY.id) {
                        $scope.QUERY.id = null;
                    }
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                if (response.code == 500) {
                    return layer.alert(response.msg);
                }
                layer.closeAll('loading');
            });
        };

    };

    $scope.initWatch = function () {

    }

    $scope.initFunction = function () {
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
/*
        $scope.onRowDblClick = function(item){
            if(item && item.id){
                $scope.onCard(item.id);
            }

        };
*/
    };


    $scope.initButton = function(){

        /**
        * 打印
        * */

        $scope.onPrint = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows) return layer.alert("请选择一条单据进行打印!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            layer.load(2);
            $scope.aVO ={PRINTlIST:[{id:1,name:"培训服务"},{id:2,name:"日常咨询"},{id:3,name:"保单维护"},{id:4,name:"防灾防损"},{id:5,name:"协助索赔"},{id:6,name:"联席会"}]};
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/standingBook/printPagesPop.html',
                styleUrls:['insurance/css/printPagesPop.css'],
                className: 'ngdialog-theme-formInfo',
                controller: 'printPagesPopCtrl',
                scope: $scope,
                rootScope: $rootScope,
                preCloseCallback: function (value) {
                    if (value && value == "clear") {
                        //重置
                        return false;
                    }
                    //取消
                    return true;
                }
            }).then(function (value) {

            }, function (reason) {

            });
        };


        $scope.onPrintPages = function(){
            var projectIdList =[];

            //获取多条数据的id
            var rows = $scope.gridApi.selection.getSelectedRows();
            for (let i = 0; i < rows.length; i++) {
                project_id = rows[i].id;
                projectIdList.push(project_id);
            }
            var startMonth = $scope.QUERY.startMonth;
            var endMonth = $scope.QUERY.endMonth;
            if(startMonth!=null&&endMonth==null){
                $scope.QUERY.endMonth ="12";
            }
            if (startMonth==null&&endMonth!=null){
                $scope.QUERY.startMonth ="01";
            }
            $scope.VO.projectIdList = JSON.stringify(projectIdList);
            $http.post($scope.localizedPath  + "standingBookController/getServiceSummaryRaqJson",{
                    pk_project_id: $scope.VO.projectIdList,
                    param:angular.toJson( $scope.QUERY),
                }).success(function (response) {
               if (response.code == 200) {
                        if (response.countPdfList) {
                            //主服务调用打印方法
                            $http.post($rootScope.basePath + 'printCommonController/mergePdf', {
                                data: angular.toJson(response.countPdfList)
                            },{responseType:'arraybuffer'}).success(function (response) {
                                var files = new Blob([response],{type: "application/pdf",filename:response.name});
                                var fileURL = URL.createObjectURL(files);
                                $scope.content=$sce.trustAsResourceUrl(fileURL);
                                $scope.type = "application/pdf";
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
                                })
                            });
                        }
                    }
                if (response.code == 500) {
                    return layer.alert(response.msg);
                }
                });

        };

        /**
         * 下载压缩包
         * */
        $scope.onDownloadZip = function() {
            //1.获取多条数据的id,项目名称
            var typeName=[{id:1,name:"培训服务"},{id:2,name:"日常咨询"},{id:3,name:"保单维护"},{id:4,name:"防灾防损"},{id:5,name:"协助索赔"},{id:6,name:"服务汇总"},{id:7,name:"联席会"}];
            let projectIdList = [];
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (rows.length == 0) return layer.alert("请选择一条数据进行下载!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            for (let i = 0; i < rows.length ; i++) {
                project_id = rows[i].id;
                projectIdList.push(project_id);
            }
            // 年份时间
            let startMonth = $scope.QUERY.startMonth;
            let endMonth = $scope.QUERY.endMonth;
            if(startMonth!=null&&endMonth==null){
                $scope.QUERY.endMonth ="12";
            }
            if (startMonth==null&&endMonth!=null){
                $scope.QUERY.startMonth ="01";
            }
             $scope.VO.projectIdList = projectIdList.toString();
            //通过id获取附件信息
            $http.post($scope.localizedPath  + "standingBookController/encapsulationFiles",{
                param:angular.toJson( $scope.QUERY),
                rows:angular.toJson(rows),
                typeName: angular.toJson(typeName),
            }).success(function (response) {
                if (response.code == 200){
                    if (response.result.result){
                        let param = JSON.stringify(response.result.result);
                        var exportEx = $('#exproE');
                        $('#exproE #fileId').val(param);
                        exportEx.attr("action",$rootScope.basePath + 'uploadFile/batchDownloadZip');
                        //提交表单，实现下载
                        exportEx.submit();
                    }
                }
            })
        };

        /**
         * 下载
         * */

        $scope.onDownLoads = function () {
            let rows = $scope.VO.dealAttachmentB;
            if (!rows || rows.length <= 0) return angular.alert("没有附件信息！");
            let ids = [];
            for (let i = 0; i < rows.length; i++) {
                ids.push(rows[i].pk_project_id);
            }
            let exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };

        $scope.onDownLoadsCard = function (id) {
            let ids = [];
            ids.push(id);
            let exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };


        /**
         * 控制字表按钮的显示
         * */

        $scope.onRenewal = function () {
            //  控制字表按钮的显示
            $scope.isClear = false;
            if ($scope.isGrid) {
                let rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.isGrid = false;
                $scope.form = true;
                $scope.findOne(rows[0].id, function () {
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.VO.pkOperator = $rootScope.userVO;
                    $scope.VO.operateDate = new Date().format("yyyy-MM-dd");
                    $scope.VO.operateTime = new Date().format("yyyy-MM-dd HH:mm:ss");
                    $scope.VO.id = null;
                    $scope.dealAttachmentBGridOptions.data = [];
                    $scope.gridApi.selection.getSelectedRows()[0] = $scope.VO;
                });

            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            }

        };

        $scope.onCopy = function () {
            //  控制字表按钮的显示
            $scope.isClear = false;
            if ($scope.isGrid) {
                let rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.isGrid = false;
                $scope.form = true;

                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
                $scope.VO.pkOperator = $rootScope.userVO;
                $scope.VO.operateDate = new Date().format("yyyy-MM-dd");
                $scope.VO.operateTime = new Date().format("yyyy-MM-dd HH:mm:ss");
                $scope.findOne(rows[0].id, function () {
                    $scope.isBack = true;
                    $scope.isEdit = true;
                    $scope.isDisabled = false;
                    $scope.VO.pkOperator = $rootScope.userVO;
                    $scope.VO.operateDate = new Date().format("yyyy-MM-dd");
                    $scope.VO.operateTime = new Date().format("yyyy-MM-dd HH:mm:ss");


                    $scope.VO.id = null;


                    $scope.gridApi.selection.getSelectedRows()[0] = $scope.VO;
                });
                $scope.VO.id = null;
            } else {

                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            }

        };



        /**
         * 返回
         */
        $scope.onBack = function () {
            if($stateParams.id) {
                window.history.back(-2);
                return;
            }
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isDisabled = true;
            $scope.isDisableds = true;
            //阻止页面渲染
            $scope.form = false;
            $scope.card = false;
            //阻止页面渲染
            $scope.queryForGrid($scope.QUERY);
        };



        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };
        $scope.onReset = function () {
            $scope.QUERY = $scope.initQUERY();
            $scope.QUERY.id = null;
        };


        /**
         * 初始化参照
         */
        $scope.initView = function () {

        };

    };


    $scope.initPage = function () {
        $scope.isClear = false;
        $scope.isShow = true;
        //阻止页面渲染
        $scope.form = false;
        $scope.card = false;
        //阻止页面渲染
        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
        $scope.isDisableds = false;
        $scope.isreplace = true;
        $scope.queryShow = true;
        //控制附件上传和下载
        $scope.upOrDown = true;
        $scope.gridOptions = {
            rowTemplate: "<div ng-dblclick=\"grid.appScope.onRowDblClick(row.entity)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell dbl-click-row></div>",
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            exporterMenuCsv: true,
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '台账信息.csv',
            columnDefs: [
                {name: 'customer_name', displayName: '客户名称'},
                {name: 'project_name', displayName: '项目名称'},
                {name: 'insurancetype', displayName: '投保险种'},
                {name: 'project_address', displayName: '项目地址'},
                {name: 'territorial_organization_name', displayName: '属地服务机构'},
                {name: 'begin_time', displayName: '保险起始日期'},
                {name: 'end_time', displayName: '保险到期日期'},
                {name: 'insurance_no', displayName: '保单号'},
                {name: 'localizedNum', displayName: '培训服务'},
                {name: 'serviceNum', displayName: '日常咨询'},
                {name: 'policyNum', displayName: '保单维护'},
                {name: 'count1', displayName: '防灾防损'},
                {name: 'assistclaimNum', displayName: '案件管理'},
                {name: 'associationNum', displayName: '联席会'},

            ],
            data: [],
            exporterAllDataFn: function () {
                $scope.queryAllForGrid($scope.QUERY);
            },
        };
        $scope.gridOptions.onRegisterApi = function (gridApi) {
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
                    if (!$scope.chilbTable) {
                        $scope.chilbTable = true;
                    }
                    angular.assignData($scope.VO, row.entity);
                 /*   $scope.findOne(rows[0].id);*/
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });

        };
    };

    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.onQuery();
    initworkflow($scope, $http,ngDialog);
    initonlineView($scope,$rootScope,$sce,$http,ngDialog);
});


app.controller('printPagesPopCtrl', function ($rootScope, $scope,$sce, $http, uiGridConstants, ngDialog, ngVerify) {


    $scope.onCheckBox = function(){
        if($("#checkAll").is(':checked')){
            $("input[name='tagName']").prop("checked",true);
        }else {
            $("input[name='tagName']").prop("checked",false);
        }

    };

    /**
     * 确定按钮
     * */
    $scope.onConfirm = function(data){
           var pagesId = [];
           var projectIdList =[];
             if($("#checkAll").is(':checked')){
                 var boxArray = $scope.aVO.PRINTlIST;
                 for (let i = 0; i <boxArray.length; i++) {
                     pagesId.push(boxArray[i].id)
                 }
             }else {
                 //判断选中checkbox的id
                 $("input[name='tagName']").each(function () {
                     if( $(this).is(':checked')){
                         pagesId.push($(this).val());
                     }
                 });
             }

      for (var i = 0; i <pagesId.length; i++) {
           $scope.VO.pagesId = pagesId[i];
     }
      $scope.VO.pagesIdList = pagesId.toString();
        if (pagesId.length==0){
            return layer.alert("请选择下载的类型!", {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
        }

        //获取多条数据的id
        var rows = $scope.gridApi.selection.getSelectedRows();
        for (var i = 0; i < rows.length; i++) {
            project_id = rows[i].id;
            projectIdList.push(project_id);
        }
        var startMonth = $scope.QUERY.startMonth;
        var endMonth = $scope.QUERY.endMonth;
        if(startMonth!=null&&endMonth==null){
            $scope.QUERY.endMonth ="12";
        }
        if (startMonth==null&&endMonth!=null){
            $scope.QUERY.startMonth ="01";
        }
        $scope.VO.projectIdList = JSON.stringify(projectIdList);
        if (pagesId.length!=0){
              $http.post($scope.localizedPath  + "standingBookController/getServiceRapJson",{
                  param:angular.toJson( $scope.QUERY),
                  id: $scope.VO.pagesIdList,
                  pk_project_id: $scope.VO.projectIdList
              }).success(function (response) {
                  if (response.code == 200) {
                      if (response.countPdfList) {
                          //主服务调用打印方法
                          $http.post($rootScope.basePath + 'printCommonController/mergePdf', {
                              data: angular.toJson(response.countPdfList)
                          },{responseType:'arraybuffer'}).success(function (response) {
                              var files = new Blob([response],{type: "application/pdf",filename:response.name});
                              var fileURL = URL.createObjectURL(files);
                              $scope.content=$sce.trustAsResourceUrl(fileURL);
                              $scope.type = "application/pdf";
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
                              })
                          });
                      }
                  }
                  if (response.code == 500) {
                      return layer.alert(response.msg);
                  }
              });

      }
   };

    $scope.onCancel = function () {
        ngDialog.close($scope.ngDialogId);
    };

 
});

