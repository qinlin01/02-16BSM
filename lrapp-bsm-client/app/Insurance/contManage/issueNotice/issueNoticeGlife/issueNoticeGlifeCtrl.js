/**
 * 出单通知书
 **/
app.controller('issueNoticeGlifeCtrl', function ($rootScope, $scope,$sce, $http, $stateParams, uiGridConstants, ngDialog, ngVerify, $location, activitiModal) {
    //@zhangwj【YDBXJJ-1984】 页面跳至页面顶端 line 6
    document.documentElement.style.overflow = 'hidden';
    $scope.table_name = "lr_issuenoticebill";
    $scope.billdef = "IssueNotice";
    $scope.initData = function (data) {
        $scope.status = {open: true};
        $scope.downLoadDate;
        $scope.isAdd=false;
        $scope.ifGdzc=true;
        $scope.initVO = function () {
            return {
                insureType: [
                    {
                        downLoadDate:'',
                        applyArticle:'',
                        specialPromise:'',
                        justiceManage:'',
                        PROJ_INSURETYPE_ID:'',
                        INSURANCE_RATE_MAX:"",
                        INSURANCE_RATE_MIN:"",
                        FORECAST_FEE_MAX:"",
                        FORECAST_FEE_MIN:"",
                        COMMISION_FEE_RATE:"",
                        // PAY_WAY_CONTRACT:"",
                        accept_base:"",
                        forecast_sale_income:"",
                        add_quota:"",
                        pay_for_scale:"",
                        guarantee_wait:"",

                        average_ele_profit:"",
                        forecast_sale_ele:"",
                        forecast_sale_profit:"",
                        max_pay_time:"",
                        relative_contract:"",

                        INSURE_START_DATE:"",
                        INSURE_END_DATE:"",
                        JZAZ_START_DATE:"",
                        JZAZ_END_DATE:"",
                        GUARANTEE_START_DATE:"",
                        GUARANTEE_END_DATE:"",
                        INSURE_START_HOUR:"",
                        INSURE_END_HOUR:"",
                        INSURE_DAYS:"",
                        OTHER_RELATION:"",
                        INSURE_PROJECT_NAME:"",
                        INSURE_PROJECT_ADDR:"",
                        EMPLOYER_SORT_SIGN:"",
                        PAY_SUM:"",
                        DIE_PAY:"",
                        ACCEPT_SORT:"",
                        DEFORMITY_PAY:"",
                        INSURE_PEOPLE_NUM:"",
                        insurebeHolde: [],
                        APPLY_ARTICLE: [],
                        SPECIAL_PROMISE: [],
                        JUSTICE_MANAGE: [],
                        insurebeItems: [],
                        // insurebeExt: [],
                        insuranceItems: [],
                        insureCompany:[],
                        insuranceSpecialDangerGridData: [],
                        insuranceThirdResponsibilityridData: [],
                        insuranceCategoryApproachGridData: [],
                        insureNoGdzc: [],
                        placeScopeGridData: [],
                        additionalInsureGridData: [],
                        freightInsureMoneyGridData: [],
                        insureAmountGridData:[],
                        supportProjectGridData: [],
                        insureMoneyGridData: [],
                    }],
                HOLDER_ID:"",
                insuranceSchemeName:"",
                insuranceSchemeId:"",
                insuranceSchemeCode:"",
                dealAttachmentB:[],
                HOLDER_ADDR:"",
                HOLDER_NAME:"",
                pkOrg: $rootScope.orgVO,
                pkOperator: $rootScope.userVO,
                pkDept: $rootScope.deptVO,
                billstatus: 31,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                ifuhv: 0
            };
        };
        $scope.btDisabled=true;
        $scope.projectRef =
            {
                id: $scope.$id,
                columnDefs: [
                    {
                        field: 'insuranceschemeNo',
                        displayName: '保险方案编号'
                    },
                    {
                        field: 'name',
                        displayName: '保险方案名称'
                    }/*,
                    {
                        field: 'cinsureman_code',
                        displayName: '投保人编号'
                    },
                    {
                        field: 'cinsureman_name',
                        displayName: '投保人'
                    }*/

                ],
                data: ""
            };

        //主表数据
        $scope.VO = $scope.initVO();
        $scope.listOptions = [];
        $scope.nowNumber = -1;
        $scope.initList=function(){
            $scope.nowNumber = -1;
            $scope.listOptions = [];
            $scope.addlistOptions();
        }
        $scope.addlistOptions=function(){
            $scope.nowNumber++;
            $scope.listOptions.push({
                "insurebeHoldeGridOptions":$scope.initPageinsurebeHolde($scope.nowNumber),
                "insuranceItemsAndAmountsGridOptions":$scope.initPageinsuranceItemsAndAmounts($scope.nowNumber),
                "insuranceSpecialDangerGridOptions":$scope.initPageinsuranceSpecialDanger($scope.nowNumber),
                "insuranceThirdResponsibilityridOptions":$scope.initPageInsuranceG($scope.nowNumber),
                "insuranceCategoryApproachGridOptions":$scope.initPageinsuranceCategoryApproach($scope.nowNumber),
                "insuranceSpecialClausesridOptions":$scope.initPageInsuranceJ($scope.nowNumber),
                "insuranceItemsOptions":$scope.initPageInsurance($scope.nowNumber),
                "insuranceItemsNoGdzcOptions":$scope.initPageNoGdzc($scope.nowNumber),
                "insureCompanyGridOptions":$scope.initPageinsureCompany($scope.nowNumber),
                "placeScopeGridOptions":$scope.initPagePlaceScope($scope.nowNumber),
                "additionalInsureGridOptions":$scope.initPageAdditionalInsure($scope.nowNumber),
                "freightInsureMoneyGridOptions":$scope.initPageFreightInsureMoney($scope.nowNumber),
                "insureAmountGridOptions":$scope.initPageInsureAmount($scope.nowNumber),
                "supportProjectGridOptions":$scope.initPageSupportProject($scope.nowNumber),
                "insureMoneyGridOptions":$scope.initPageInsureMoney($scope.nowNumber),
                "insuranceGLifeOptions":$scope.initPageGLife($scope.nowNumber),
            })
        };
        $scope.deletelistOptions=function(nowNumber){
            layer.confirm('请确认是否要删除此险种？', {
                    btn: ['确定', '取消'], //按钮
                    btn2: function (index, layero) {
                    },
                    shade: 0.6,//遮罩透明度
                    shadeClose: true,//点击遮罩关闭层
                },
                function () {
                    $scope.VO.insureType.splice(nowNumber,1);
                    $scope.listOptions.splice(nowNumber,1);
                    $scope.nowNumber--;
                    $scope.$apply();
                    layer.close(layer.index);
                }
            );

        };
        $scope.initList();
        //初始化查询
       $scope.initQUERY = function () {
            return { "operate_year": parseInt(new Date().format("yyyy"))}
        };
        $scope.QUERY = $scope.initQUERY();
        $scope.funCode = '30102';
        $scope.onMoneyDetail = false;
    };
    $scope.opts={
        dirSelectable:false
    };
    $scope.initHttp = function () {
        //列表查询
        $scope.queryForGrid = function (data) {
            if(!findImpData(data)){
                return false;
            }
            if (!$scope.queryData) {
                $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.gridOptions.columnDefs;
            }
            layer.load(2);
            $http.post($scope.basePath + "issueNoticeGlife/queryForGrid", {
                params: angular.toJson(data),
                page: $scope.gridApi ? $scope.gridApi.page : $scope.gridOptions.page,
                pageSize: $scope.gridApi ? $scope.gridApi.pageSize : $scope.gridOptions.pageSize,
                fields: angular.toJson($scope.queryData)
            }).success(function (response) {
                if (response.code == 200) {
                    if (!$scope.query) {
                        $scope.query = $scope.gridOptions.columnDefs;
                    }
                    $scope.gridOptions.data = response.result.Rows;
                    $scope.gridOptions.totalItems = response.result.Total;
                }
                layer.closeAll('loading');
            });
        };

        $scope.findOne = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + "issueNoticeGlife/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');

                if (response && response.code == "200") {
                    angular.assignData($scope.VO, response.result);
                    $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    $scope.listOptions = [];
                    $scope.nowNumber=-1;
                    for(var j=0;j<response.result.insureType.length;j++){

                        //险种信息：财产一切险
                        $scope.addlistOptions();
                        $scope.VO.insureType[j].INSURANCE_RATE_MAX=response.result.insureType[j].INSURANCE_RATE_MAX;
                        $scope.VO.insureType[j].INSURANCE_RATE_MIN=response.result.insureType[j].INSURANCE_RATE_MIN;
                        $scope.VO.insureType[j].FORECAST_FEE_MAX=response.result.insureType[j].FORECAST_FEE_MAX;
                        $scope.VO.insureType[j].FORECAST_FEE_MIN=response.result.insureType[j].FORECAST_FEE_MIN;
                        $scope.VO.insureType[j].COMMISION_FEE_RATE=response.result.insureType[j].COMMISION_FEE_RATE;
                        $scope.VO.insureType[j].FREE_FEE=response.result.insureType[j].FREE_FEE;
                        $scope.VO.insureType[j].PAY_WAY_CONTRACT=response.result.insureType[j].PAY_WAY_CONTRACT;

                        //险种信息：建筑安装工程一切险
                        $scope.VO.insureType[j].INSURE_START_DATE=response.result.insureType[j].INSURE_START_DATE;
                        $scope.VO.insureType[j].INSURE_END_DATE=response.result.insureType[j].INSURE_END_DATE;
                        $scope.VO.insureType[j].INSURE_START_HOUR=response.result.insureType[j].INSURE_START_HOUR;
                        $scope.VO.insureType[j].INSURE_END_HOUR=response.result.insureType[j].INSURE_END_HOUR;
                        $scope.VO.insureType[j].INSURE_DAYS=response.result.insureType[j].INSURE_DAYS;
                        $scope.VO.insureType[j].OTHER_RELATION=response.result.insureType[j].OTHER_RELATION;
                        $scope.VO.insureType[j].INSURE_PROJECT_NAME=response.result.insureType[j].INSURE_PROJECT_NAME;
                        $scope.VO.insureType[j].INSURE_PROJECT_ADDR=response.result.insureType[j].INSURE_PROJECT_ADDR;

                        //险种信息：雇主险
                        $scope.VO.insureType[j].EMPLOYER_SORT_SIGN=response.result.insureType[j].EMPLOYER_SORT_SIGN;
                        $scope.VO.insureType[j].PAY_SUM=response.result.insureType[j].PAY_SUM;
                        $scope.VO.insureType[j].DIE_PAY=response.result.insureType[j].DIE_PAY;
                        $scope.VO.insureType[j].DEFORMITY_PAY=response.result.insureType[j].DEFORMITY_PAY;
                        $scope.VO.insureType[j].INSURE_PEOPLE_NUM=response.result.insureType[j].INSURE_PEOPLE_NUM;
                        $scope.listOptions[j].insuranceItemsOptions.data = response.result.insureType[j].insurebeItems;
                        $scope.listOptions[j].insurebeHoldeGridOptions.data = response.result.insureType[j].insurebeHolde;
                        //特别条款
                        $scope.VO.insureType[j].insurebeExt= response.result.insureType[j].insurebeExt;
                        $scope.VO.insureType[j].applyArticle="";
                        for(var ap=0;ap<response.result.insureType[j].APPLY_ARTICLE.length;ap++){
                            $scope.VO.insureType[j].applyArticle+=response.result.insureType[j].APPLY_ARTICLE[ap].APPLY_ARTICLE;
                        }
                        $scope.VO.insureType[j].specialPromise="";
                        for(var sp=0;sp<response.result.insureType[j].SPECIAL_PROMISE.length;sp++){
                            $scope.VO.insureType[j].specialPromise+=response.result.insureType[j].SPECIAL_PROMISE[sp].SPECIAL_PROMISE;
                        }
                        $scope.VO.insureType[j].justiceManage="";
                        for(var sm=0;sm<response.result.insureType[j].JUSTICE_MANAGE.length;sm++){
                            $scope.VO.insureType[j].justiceManage+=response.result.insureType[j].JUSTICE_MANAGE[sm].JUSTICE_MANAGE;
                        }

                        $scope.listOptions[j].insuranceItemsAndAmountsGridOptions.data=response.result.insureType[j].insuranceItems;
                        $scope.listOptions[j].insuranceSpecialDangerGridOptions.data=response.result.insureType[j].insuranceSpecialDangerGridData;
                        $scope.listOptions[j].insuranceThirdResponsibilityridOptions.data=response.result.insureType[j].insuranceThirdResponsibilityridData;
                        $scope.listOptions[j].insuranceCategoryApproachGridOptions.data=response.result.insureType[j].insuranceCategoryApproachGridData;
                        $scope.listOptions[j].insureCompanyGridOptions.data=response.result.insureType[j].insureCompany;
                        $scope.listOptions[j].placeScopeGridOptions.data=response.result.insureType[j].placeScopeGridData;
                        $scope.listOptions[j].additionalInsureGridOptions.data=response.result.insureType[j].additionalInsureGridData;
                        $scope.listOptions[j].freightInsureMoneyGridOptions.data=response.result.insureType[j].freightInsureMoneyGridData;
                        $scope.listOptions[j].insureAmountGridOptions.data=response.result.insureType[j].insureAmountGridData;
                        $scope.listOptions[j].supportProjectGridOptions.data=response.result.insureType[j].supportProjectGridData;
                        $scope.listOptions[j].insureMoneyGridOptions.data=response.result.insureType[j].insureMoneyGridData;
                        $scope.listOptions[j].insuranceGLifeOptions.data=response.result.insureType[j].insuranceGLifeData;
                    }
                } else {
                    if (response) {
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                }
            });
        };
        $scope.onAddinsureType =function(){
            // $scope.nowNumber++;
            $scope.VO.insureType.push({
                insurebeHolde: [],
                insuranceItems: [],
                insuranceSpecialDangerGridData: [],
                insuranceThirdResponsibilityridData: [],
                insuranceCategoryApproachGridData: [],
                APPLY_ARTICLE: [],
                // insurebeExt: [],
                JUSTICE_MANAGE: [],
                SPECIAL_PROMISE: [],
                insurebeItems: [],
                placeScopeGridData: [],
                additionalInsureGridData: [],
                freightInsureMoneyGridData: [],
                insureAmountGridData:[],
                supportProjectGridData: [],
                insureMoneyGridData: [],
            });
            $scope.addlistOptions();
            $scope.countALL_FEE();
        }
        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            if($scope.VO.estimatepk!=null){
                $scope.VO.HOLDER_ID=  $scope.VO.estimatepk.pk;
                $scope.VO.HOLDER_ADDR=$scope.VO.estimatepk.c1Province_name;
                $scope.VO.HOLDER_NAME=$scope.VO.estimatepk.name;
            }
            for (var i=0;i<  $scope.listOptions.length;i++){
                //适用条款
                $scope.VO.insureType[i].APPLY_ARTICLE= new Array();
                $scope.VO.insureType[i].APPLY_ARTICLE.push({"APPLY_ARTICLE":$scope.VO.insureType[i].applyArticle});
                //特殊约定
                $scope.VO.insureType[i].SPECIAL_PROMISE= new Array();
                $scope.VO.insureType[i].SPECIAL_PROMISE.push({"SPECIAL_PROMISE":$scope.VO.insureType[i].specialPromise});
                //司法管辖
                $scope.VO.insureType[i].JUSTICE_MANAGE= new Array();
                $scope.VO.insureType[i].JUSTICE_MANAGE.push({"JUSTICE_MANAGE":$scope.VO.insureType[i].justiceManage});

                if($scope.listOptions[i].insuranceItemsOptions.data){
                    for (var it=0;it<$scope.listOptions[i].insuranceItemsOptions.data.length;it++){
                        var data = $scope.listOptions[i].insuranceItemsOptions.data[it];
                        // if(null==data.assetsOldValue||null==data.assetscode||null==data.insureValue||null==data.addsCale){
                        if(null==data.assetscode){
                            layer.closeAll('loading');
                            return layer.alert("子表保险标的存在空内容!");
                        }
                    }
                }
                if($scope.listOptions[i].insuranceGLifeOptions.data){
                    for (var it=0;it<$scope.listOptions[i].insuranceGLifeOptions.data.length;it++){
                        var data = $scope.listOptions[i].insuranceGLifeOptions.data[it];
                        // if(null==data.assetsOldValue||null==data.assetscode||null==data.insureValue||null==data.addsCale){
                        if(null==data.insured||""==data.insured){
                            layer.closeAll('loading');
                            return layer.alert("请选择保险责任子表投保人员!");
                        }
                        if(null==data.insuredType||""==data.insuredType){
                            layer.closeAll('loading');
                            return layer.alert("请选择保险责任子表投保险种!");
                        }
                        if(null==data.peopleAll||""==data.peopleAll){
                            layer.closeAll('loading');
                            return layer.alert("保险责任子表人数不能为空!");
                        }
                        if(null==data.deductible||""==data.deductible){
                            layer.closeAll('loading');
                            return layer.alert("保险责任子表免赔额不能为空!");
                        }
                        if(null==data.rate||""==data.rate){
                            layer.closeAll('loading');
                            return layer.alert("保险责任子表费率不能为空!");
                        }
                        if(!data.premiumAll||""==data.premiumAll||"NaN"==data.premiumAll){
                            layer.closeAll('loading');
                            return layer.alert("保险责任子表总保费不能为空!");
                        }
                        if(!data.insuranceMoneyAll||""==data.insuranceMoneyAll||"NaN"==data.insuranceMoneyAll){
                            layer.closeAll('loading');
                            return layer.alert("保险责任子表总保险金额不能为空!");
                        }
                    }
                }
                $scope.VO.insureType[i].insureCompany=  $scope.listOptions[i].insureCompanyGridOptions.data;
                $scope.VO.insureType[i].insurebeItems=  $scope.listOptions[i].insuranceItemsOptions.data;
                $scope.VO.insureType[i].insurebeHolde=  $scope.listOptions[i].insurebeHoldeGridOptions.data;
                // $scope.VO.insureType[i].insurebeExt=  $scope.listOptions[i].insuranceSpecialClausesridOptions.data;
                $scope.VO.insureType[i].insuranceItems=  $scope.listOptions[i].insuranceItemsAndAmountsGridOptions.data;

                $scope.VO.insureType[i].insuranceCategoryApproachGridData=  $scope.listOptions[i].insuranceCategoryApproachGridOptions.data;
                $scope.VO.insureType[i].insuranceThirdResponsibilityridData=  $scope.listOptions[i].insuranceThirdResponsibilityridOptions.data;
                $scope.VO.insureType[i].insuranceSpecialDangerGridData=  $scope.listOptions[i].insuranceSpecialDangerGridOptions.data;
                $scope.VO.insureType[i].placeScopeGridData=  $scope.listOptions[i].placeScopeGridOptions.data;
                $scope.VO.insureType[i].additionalInsureGridData=  $scope.listOptions[i].additionalInsureGridOptions.data;
                $scope.VO.insureType[i].freightInsureMoneyGridData=  $scope.listOptions[i].freightInsureMoneyGridOptions.data;
                $scope.VO.insureType[i].insureAmountGridData=  $scope.listOptions[i].insureAmountGridOptions.data;
                $scope.VO.insureType[i].supportProjectGridData=  $scope.listOptions[i].supportProjectGridOptions.data;
                $scope.VO.insureType[i].insureMoneyGridData=  $scope.listOptions[i].insureMoneyGridOptions.data;
                $scope.VO.insureType[i].insuranceGLifeData=  $scope.listOptions[i].insuranceGLifeOptions.data;
            }
            $scope.VO.pkOrg=$rootScope.orgVO;
            $scope.VO.pkOperator= $rootScope.userVO;
            $scope.VO.pkDept=$rootScope.deptVO;
            $scope.VO.billstatus=31;
            $scope.VO.operateDate=new Date().format("yyyy-MM-dd");
            $scope.VO.operateTime= new Date().format("yyyy-MM-dd HH:mm:ss");
            $http.post($rootScope.basePath + "issueNoticeGlife/save", {data: SM2Encrypt(angular.toJson($scope.VO))})
                .success(function (response) {
                    if (!response.flag) {
                        $scope.isAdd=false;
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                    }
                    if (response) {
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                });
        };

        /**
         * 查询审批流信息
         */
        $scope.queryWorkFlow = function (pkProject, fun) {
        };
        /**
         * 查询审批流信息
         */
        $scope.queryFlowInfo = function (pkProject, fun) {

        };
        /**
         * 查询审批流信息
         */
        $scope.queryAuditFlowInfo = function (pkProject, fun) {
        };
        /*
         * 提交
         * */
        $scope.submit = function (pkProject, msg, selects, _pass) {
        };
        /*
         * 提交
         * */
        $scope.audit = function (pkProject, msg, selects, _pass, type) {
        };
    };

    $scope.initFunction = function () {
        $scope.countALL_FEE =function(){
            for(var i=0;i<$scope.VO.insureType.length;i++){
                $scope.VO.insureType[i].ALL_FEE=0;
                $scope.VO.insureType[i].ALL_FEE=$scope.VO.insureType[i].ALL_FEE*0;
                if ($scope.VO.insureType[i].INSURE_TYPE_ID=="caicyqx"||$scope.VO.insureType[i].INSURE_TYPE_ID=="jiqshx"){
                    for (var it=0;it<$scope.listOptions[i].insuranceItemsOptions.data.length;it++){
                        var data = $scope.listOptions[i].insuranceItemsOptions.data[it];
                        if(data.insureValue!=null){
                            $scope.VO.insureType[i].ALL_FEE+=data.insureValue*1;
                        }
                    }
                }
                if ($scope.VO.insureType[i].INSURE_TYPE_ID=="jianzazgcyqx"||$scope.VO.insureType[i].INSURE_TYPE_ID=="anzgcyqx"||$scope.VO.insureType[i].INSURE_TYPE_ID=="jianagcx"){
                    for (var it=0;it<$scope.listOptions[i].insuranceItemsAndAmountsGridOptions.data.length;it++) {
                        var data = $scope.listOptions[i].insuranceItemsAndAmountsGridOptions.data[it];
                        if (data.commitTargetType != null) {
                            $scope.VO.insureType[i].ALL_FEE += data.commitTargetType * 1;
                        }
                    }
                }

                if ($scope.VO.insureType[i].INSURE_TYPE_ID=="tuantywx"){
                    for (var it=0;it<$scope.listOptions[i].insuranceGLifeOptions.data.length;it++) {
                        var data = $scope.listOptions[i].insuranceGLifeOptions.data[it];
                        if (data.insuranceMoneyAll != null) {
                            $scope.VO.insureType[i].ALL_FEE += data.insuranceMoneyAll;
                        }
                    }
                }

                if ($scope.VO.insureType[i].INSURE_TYPE_ID=="anqsczrx"||$scope.VO.insureType[i].INSURE_TYPE_ID=="gongzzrx"||$scope.VO.insureType[i].INSURE_TYPE_ID=="gongdzrx"||$scope.VO.insureType[i].INSURE_TYPE_ID=="canycszrbx"||$scope.VO.insureType[i].INSURE_TYPE_ID=="chuanbwrzrbx"||$scope.VO.insureType[i].INSURE_TYPE_ID=="susbqzrbx"){
                    if(null!=$scope.listOptions[i].insuranceThirdResponsibilityridOptions.data){
                        for (var it=0;it<$scope.listOptions[i].insuranceThirdResponsibilityridOptions.data.length;it++){
                            var data = $scope.listOptions[i].insuranceThirdResponsibilityridOptions.data[it];
                            // if(data.commitTargetType!=null){
                            //     $scope.VO.insureType[i].ALL_FEE+=data.commitTargetType*1;
                            // }
                            if(data.commitType=='累计赔偿限额'){
                                $scope.VO.insureType[i].ALL_FEE=data.commitTargetType*1;
                                break;
                            }
                        }
                    }
                }
                if ($scope.VO.insureType[i].INSURE_TYPE_ID=="yingyzdx"){
                    if($scope.VO.insureType[i].forecast_sale_profit!=null) {
                        $scope.VO.insureType[i].ALL_FEE += $scope.VO.insureType[i].forecast_sale_profit * 1;
                    }
                }
                if ($scope.VO.insureType[i].INSURE_TYPE_ID=="chuanbx"){
                    for(let it = 0 ; it<$scope.listOptions[i].additionalInsureGridOptions.data.length;it++) {
                        let data = $scope.listOptions[i].additionalInsureGridOptions.data[it];
                        $scope.VO.insureType[i].ALL_FEE += Number(data.insuranceMoney);
                    }
                }
                if ($scope.VO.insureType[i].INSURE_TYPE_ID=="feijdcdszzrx"){
                    for(let it = 0 ; it<$scope.listOptions[i].insureAmountGridOptions.data.length;it++) {
                        let data = $scope.listOptions[i].insureAmountGridOptions.data[it];
                        $scope.VO.insureType[i].ALL_FEE += (Number(data.unitMoney)+Number(data.insuranceMoney))*Number(data.number);
                    }
                }
                if ($scope.VO.insureType[i].INSURE_TYPE_ID=="jisyqxjzrx"){
                    for(let it = 0 ; it<$scope.listOptions[i].insureMoneyGridOptions.data.length;it++) {
                        let data = $scope.listOptions[i].insureMoneyGridOptions.data[it];
                        $scope.VO.insureType[i].ALL_FEE += Number(data.insuranceMoney);
                    }
                }
                if ($scope.VO.insureType[i].INSURE_TYPE_ID=="huoyx"){
                    for(let it = 0 ; it<$scope.listOptions[i].freightInsureMoneyGridOptions.data.length;it++) {
                        let data = $scope.listOptions[i].freightInsureMoneyGridOptions.data[it];
                        $scope.VO.insureType[i].ALL_FEE += Number(data.insuranceMoney);
                    }
                }
                if ($scope.VO.insureType[i].INSURE_TYPE_ID=="wanglaqbx"){
                    for(let it = 0 ; it<$scope.listOptions[i].supportProjectGridOptions.data.length;it++) {
                        let data = $scope.listOptions[i].supportProjectGridOptions.data[it];
                        $scope.VO.insureType[i].ALL_FEE += Number(data.money);
                    }
                }
                if ($scope.VO.insureType[i].INSURE_TYPE_ID=="kehxyx"){
                    if (null!=$scope.VO.insureType[i].forecast_sale_income)
                        $scope.VO.insureType[i].ALL_FEE+=$scope.VO.insureType[i].forecast_sale_income*1;
                }
                if ($scope.VO.insureType[i].INSURE_TYPE_ID=="guzzrx"){
                    if($scope.VO.insureType[i].EMPLOYER_SORT_SIGN==1&&null!=$scope.VO.insureType[i].PAY_SUM){
                        $scope.VO.insureType[i].ALL_FEE+=$scope.VO.insureType[i].PAY_SUM;
                    }
                    if($scope.VO.insureType[i].EMPLOYER_SORT_SIGN==2){
                        for (var it=0;it<$scope.listOptions[i].insuranceCategoryApproachGridOptions.data.length;it++){
                            var data = $scope.listOptions[i].insuranceCategoryApproachGridOptions.data[it];
                            if (null!=data.commitTargetType3){
                                $scope.VO.insureType[i].ALL_FEE+=data.commitTargetType3*1;
                            }
                        }
                    }
                }
            }
        }
        var indexs;
        $scope.findInsuranceScheme = function (pk) {
            $scope.ids=new Array();
            // $scope.pk = pk;
            $http.post($scope.basePath + "insuranceScheme/findOne", {pk: pk}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    
                    if(null!=response.result.insuranceschemeNo){
                        var insuranceSchemeCode=response.result.insuranceschemeNo;
                    }
                    if(null!=response.result.name){
                        var insuranceSchemeName=response.result.name;
                    }
                    // response.result.id =null;
                    // delete response.result.id;
                    response.result.id=$scope.VO.id;
                    response.result.name =$scope.VO.name;
                    response.result.insuranceschemeNo =null;
                    response.result.operateDate=new Date().format("yyyy-MM-dd");
                    response.result.operateTime= new Date().format("yyyy-MM-dd HH:mm:ss");
                    angular.assignData($scope.VO, response.result);
                    $scope.VO.insuranceSchemeId=pk;
                    $scope.VO.insuranceSchemeCode=insuranceSchemeCode;
                    $scope.VO.insuranceSchemeName=insuranceSchemeName;
                    // $scope.dealAttachmentBGridOptions.data = $scope.VO.dealAttachmentB;
                    $scope.listOptions = [];
                    $scope.nowNumber=-1;
                    for(var j=0;j<response.result.insureType.length;j++){
                        //险种信息：财产一切险
                        $scope.addlistOptions();
                        var INSURANCE_RATE_MAX=response.result.insureType[j].INSURANCE_RATE_MAX;
                        var INSURANCE_RATE_MIN=response.result.insureType[j].INSURANCE_RATE_MIN;
                        var FORECAST_FEE_MAX=response.result.insureType[j].FORECAST_FEE_MAX;
                        var FORECAST_FEE_MIN=response.result.insureType[j].FORECAST_FEE_MIN;

                        $scope.INSURANCE_RATE_MAX=INSURANCE_RATE_MAX;
                        $scope.INSURANCE_RATE_MIN=INSURANCE_RATE_MIN;
                        $scope.FORECAST_FEE_MAX=FORECAST_FEE_MAX;
                        $scope.FORECAST_FEE_MIN=FORECAST_FEE_MIN;
                        if (response.result.insureType[j].INSURANCE_RATE_MAX==response.result.insureType[j].INSURANCE_RATE_MIN){
                            $scope.VO.insureType[j].INSURANCE_RATE_MAX=response.result.insureType[j].INSURANCE_RATE_MAX;
                            $scope.VO.insureType[j].INSURANCE_RATE_MIN=response.result.insureType[j].INSURANCE_RATE_MIN;
                        }else {
                            $scope.VO.insureType[j].INSURANCE_RATE_MAX=null;
                            $scope.VO.insureType[j].INSURANCE_RATE_MIN=null;
                        }
                        if (response.result.insureType[j].FORECAST_FEE_MAX==response.result.insureType[j].FORECAST_FEE_MIN){
                            $scope.VO.insureType[j].FORECAST_FEE_MAX=response.result.insureType[j].FORECAST_FEE_MAX;
                            $scope.VO.insureType[j].FORECAST_FEE_MIN=response.result.insureType[j].FORECAST_FEE_MIN;
                        }else {
                            $scope.VO.insureType[j].FORECAST_FEE_MAX=null;
                            $scope.VO.insureType[j].FORECAST_FEE_MIN=null;
                        }

                        $scope.VO.insureType[j].COMMISION_FEE_RATE=response.result.insureType[j].COMMISION_FEE_RATE;
                        $scope.VO.insureType[j].FREE_FEE=response.result.insureType[j].FREE_FEE;
                        $scope.VO.insureType[j].PAY_WAY_CONTRACT=response.result.insureType[j].PAY_WAY_CONTRACT;

                        //险种信息：建筑安装工程一切险
                        $scope.VO.insureType[j].INSURE_START_DATE=response.result.insureType[j].INSURE_START_DATE;
                        $scope.VO.insureType[j].INSURE_END_DATE=response.result.insureType[j].INSURE_END_DATE;
                        $scope.VO.insureType[j].INSURE_START_HOUR=response.result.insureType[j].INSURE_START_HOUR;
                        $scope.VO.insureType[j].INSURE_END_HOUR=response.result.insureType[j].INSURE_END_HOUR;
                        $scope.VO.insureType[j].INSURE_DAYS=response.result.insureType[j].INSURE_DAYS;
                        $scope.VO.insureType[j].OTHER_RELATION=response.result.insureType[j].OTHER_RELATION;
                        $scope.VO.insureType[j].INSURE_PROJECT_NAME=response.result.insureType[j].INSURE_PROJECT_NAME;
                        $scope.VO.insureType[j].INSURE_PROJECT_ADDR=response.result.insureType[j].INSURE_PROJECT_ADDR;

                        //险种信息：雇主险
                        $scope.VO.insureType[j].EMPLOYER_SORT_SIGN=response.result.insureType[j].EMPLOYER_SORT_SIGN;
                        $scope.VO.insureType[j].PAY_SUM=response.result.insureType[j].PAY_SUM;
                        $scope.VO.insureType[j].DIE_PAY=response.result.insureType[j].DIE_PAY;
                        $scope.VO.insureType[j].DEFORMITY_PAY=response.result.insureType[j].DEFORMITY_PAY;
                        $scope.VO.insureType[j].INSURE_PEOPLE_NUM=response.result.insureType[j].INSURE_PEOPLE_NUM;
                        $scope.listOptions[j].insuranceItemsOptions.data = response.result.insureType[j].insurebeItems;
                        for(var ib=0;ib<response.result.insureType[j].insurebeHolde.length;ib++){
                            if(response.result.insureType[j].insurebeHolde[ib].BEHOLDER_ID.length>20){
                                response.result.insureType[j].insurebeHolde[ib].BEHOLDER_ID=response.result.insureType[j].insurebeHolde[ib].BEHOLDER_ID.substr(response.result.insureType[j].insurebeHolde[ib].BEHOLDER_ID.length-20,response.result.insureType[j].insurebeHolde[ib].BEHOLDER_ID.length);
                            }
                        }
                        $scope.listOptions[j].insurebeHoldeGridOptions.data = response.result.insureType[j].insurebeHolde;
                        var ids="";
                        for(var d=0;d<response.result.insureType[j].insurebeHolde.length;d++){
                            if(d==response.result.insureType[j].insurebeHolde.length-1){
                                ids+="'"+response.result.insureType[j].insurebeHolde[d].BEHOLDER_ID+"'";
                            }else {
                                ids+="'"+response.result.insureType[j].insurebeHolde[d].BEHOLDER_ID+"'"+",";
                            }
                        }
                        $scope.ids[j]=ids;
                        //特别条款
                        $scope.VO.insureType[j].insurebeExt = response.result.insureType[j].insurebeExt;
                        $scope.VO.insureType[j].applyArticle="";
                        for(var ap=0;ap<response.result.insureType[j].APPLY_ARTICLE.length;ap++){
                            $scope.VO.insureType[j].applyArticle+=response.result.insureType[j].APPLY_ARTICLE[ap].APPLY_ARTICLE;
                        }
                        $scope.VO.insureType[j].specialPromise="";
                        for(var sp=0;sp<response.result.insureType[j].SPECIAL_PROMISE.length;sp++){
                            $scope.VO.insureType[j].specialPromise+=response.result.insureType[j].SPECIAL_PROMISE[sp].SPECIAL_PROMISE;
                        }
                        $scope.VO.insureType[j].justiceManage="";
                        for(var sm=0;sm<response.result.insureType[j].JUSTICE_MANAGE.length;sm++){
                            $scope.VO.insureType[j].justiceManage+=response.result.insureType[j].JUSTICE_MANAGE[sm].JUSTICE_MANAGE;
                        }

                        $scope.listOptions[j].insuranceItemsAndAmountsGridOptions.data=response.result.insureType[j].insuranceItems;
                        $scope.listOptions[j].insuranceSpecialDangerGridOptions.data=response.result.insureType[j].insuranceSpecialDangerGridData;
                        $scope.listOptions[j].insuranceThirdResponsibilityridOptions.data=response.result.insureType[j].insuranceThirdResponsibilityridData;
                        $scope.listOptions[j].insuranceCategoryApproachGridOptions.data=response.result.insureType[j].insuranceCategoryApproachGridData;
                        //创新险种
                        $scope.listOptions[j].placeScopeGridOptions.data=response.result.insureType[j].placeScopeGridData;
                        $scope.listOptions[j].additionalInsureGridOptions.data=response.result.insureType[j].additionalInsureGridData;
                        $scope.listOptions[j].freightInsureMoneyGridOptions.data=response.result.insureType[j].freightInsureMoneyGridData;
                        $scope.listOptions[j].insureAmountGridOptions.data=response.result.insureType[j].insureAmountGridData;
                        $scope.listOptions[j].supportProjectGridOptions.data=response.result.insureType[j].supportProjectGridData;
                        $scope.listOptions[j].insureMoneyGridOptions.data=response.result.insureType[j].insureMoneyGridData;
                        $scope.listOptions[j].insuranceGLifeOptions.data=response.result.insureType[j].insuranceGLifeData;
                    }
                    $scope.VO.brokerageAgencyName=$rootScope.orgVO.name;
                    $scope.VO.dept=$rootScope.deptVO.name;
                } else {
                    if (response) {
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                }
            });
        };

        $scope.onImportUploadFile = function () {
            $("#inputFile").click();
        }
        //上传资产数据
        $scope.onImportUploads = function (index) {
            if(index!=null){
                indexs=index;
            }
            if(null==$scope.VO.insureType[indexs].downLoadDate||$scope.VO.insureType[indexs].downLoadDate==""){
                return layer.alert('上传时系统将查询资产，请选择资产日期!', {skin: 'layui-layer-lan', closeBtn: 1});
            }
            var file = document.getElementById("inputFile").files[0];
            if(null==file){
                return ;
            }
            if(null==$scope.VO.insureType[indexs].downLoadDate||$scope.VO.insureType[indexs].downLoadDate==""){
                return layer.alert('请选择资产日期!', {skin: 'layui-layer-lan', closeBtn: 1});
            }
            var date = $scope.VO.insureType[indexs].downLoadDate;
            date=date.replace(/[^0-9]/ig,"");
                if(file!=null){
                layer.load(2);
                var form = new FormData();
                form.append('file', file);
                form.append('projectcodepk', 'projectcodepk');
                form.append('insuretypeid', 'insuretypeid');
                form.append('count', $scope.listOptions[indexs].insurebeHoldeGridOptions.data.length);
                form.append('pks', angular.toJson($scope.listOptions[indexs].insurebeHoldeGridOptions.data));
                form.append('date', date);
                $http({
                    method: 'POST',
                    url: $scope.basePath + "issueNoticeGlife/uploadAssets",
                    data: form,
                    headers: {'Content-Type': undefined,'x-auth-token': window.sessionStorage.getItem("token")},
                    transformRequest: angular.identity
                }).success(function (data) {
                    var obj = document.getElementById('inputFile') ;
                    obj.outerHTML=obj.outerHTML;
                    $scope.queryForGrid($scope.QUERY);
                    console.log('upload success');
                    layer.closeAll('loading');
                    if(data.msg){
                        return layer.alert(data.msg, {
                            skin: 'layui-layer-lan',
                            closeBtn: 1
                        });
                    }

                    var detaiil=data.derid;
                    $scope.treedata = detaiil;
                    if(null!=data.oldAssetsList){
                        $scope.VO.insureType[indexs].oldAssetsList = data.oldAssetsList;
                    }
                    $scope.VO.insureType[indexs].detaiil = data;
                    //关联被保人资产数据和日期s
                    for(var h=0;h<$scope.listOptions[indexs].insurebeHoldeGridOptions.data.length;h++){
                        for (var d=0;d<detaiil.length;d++){
                            if ($scope.listOptions[indexs].insurebeHoldeGridOptions.data[h].BEHOLDER_NAME==detaiil[d].assetsName.substr(0,detaiil[d].assetsName.indexOf("-"))){
                                $scope.listOptions[indexs].insurebeHoldeGridOptions.data[h].ASSETS_OLD_VALUE=detaiil[d].children[0].assetsOldValue;
                                $scope.listOptions[indexs].insurebeHoldeGridOptions.data[h].ASSETS_INSURE_VALUE=detaiil[d].children[0].insureValue;
                            }
                        }
                        $scope.listOptions[indexs].insurebeHoldeGridOptions.data[h].ASSETS_DATE=$scope.VO.insureType[indexs].downLoadDate;
                    }

                    // var zj={assetscode:"zjgc",assetsOldValue:"0",addsCale:"0",insureValue:"0"};
                    // var ch={assetscode:"cunhuo",assetsOldValue:"0",addsCale:"0",insureValue:"0"};
                    // $scope.listOptions[indexs].insuranceItemsOptions.data=new Array();
                    // $scope.listOptions[indexs].insuranceItemsOptions.data.push(zj);
                    // $scope.listOptions[indexs].insuranceItemsOptions.data.push(ch);
                    // if( $scope.listOptions[indexs].insurebeHoldeGridOptions.data!=null){
                    //     $scope.getProjectdetail2($scope.listOptions[indexs].insurebeHoldeGridOptions.data,"CH",$scope.VO.insureType[indexs].downLoadDate,indexs);
                    //     $scope.getProjectdetail2($scope.listOptions[indexs].insurebeHoldeGridOptions.data,"ZJ",$scope.VO.insureType[indexs].downLoadDate,indexs);
                    // }


                    var returnMap=data.returntMap;
                    returnMap.id=data.id;
                    returnMap.assetscode='gdzc';
                    if(null==$scope.listOptions[indexs].insuranceItemsOptions.data||$scope.listOptions[indexs].insuranceItemsOptions.data.length==0){
                        $scope.listOptions[indexs].insuranceItemsOptions.data=new Array();
                        $scope.listOptions[indexs].insuranceItemsOptions.data.push(returnMap);
                    }else{
                        for (var i=0;i< $scope.listOptions[indexs].insuranceItemsOptions.data.length;i++){
                            if($scope.listOptions[indexs].insuranceItemsOptions.data[i].assetscode=='gdzc'){
                                $scope.listOptions[indexs].insuranceItemsOptions.data[i]=returnMap;
                                break;
                            }
                            if (i== $scope.listOptions[indexs].insuranceItemsOptions.data.length-1){
                                $scope.listOptions[indexs].insuranceItemsOptions.data.push(returnMap);
                            }
                        }
                    }
                    // $scope.onUpSaveVO();
                }).error(function (data) {
                    layer.closeAll('loading');
                    console.log('upload fail');
                })
            }

        } ;
        } ;


    $scope.getAssetsData = function ( fun,isPrint,i,type) {
        var pks=new Array();
        if(null==$scope.VO.insureType[i].downLoadDate||$scope.VO.insureType[i].downLoadDate==""){
            return layer.alert('请选择资产日期!', {skin: 'layui-layer-lan', closeBtn: 1});
        }
        var date = $scope.VO.insureType[i].downLoadDate;
        var insureTypeId = $scope.VO.insureType[i].PROJ_INSURETYPE_ID;
        date=date.replace(/[^0-9]/ig,"");
        var downPath="";
        var oldAssetsList="";
        if(type=="big"){
            downPath="issueNoticeGlife/downBigAssetsData";
        }else{
            if(null!= $scope.VO.insureType[i].oldAssetsList){
                oldAssetsList=angular.toJson($scope.VO.insureType[i].oldAssetsList);
            }else{
                return layer.alert('请先上传资产大类明细!', {skin: 'layui-layer-lan', closeBtn: 1});
            }
            downPath="issueNoticeGlife/downAssetsData";
        }
        layer.load(2);
        $http.post($scope.basePath + downPath, {pks: angular.toJson($scope.listOptions[i].insurebeHoldeGridOptions.data),date:date,insuranceTypeId:insureTypeId,assetsList:oldAssetsList}).success(function (response) {
            layer.closeAll('loading');
                if (response) {

                    if(fun) fun(response);
                    if(isPrint){
                        window.open(getURL(response.queryPath));
                    }else{
                        window.open($rootScope.basePath + "uploadFile/downLoadByUrl?url="+encodeURI(encodeURI(response.downPath)));
                    }
                    layer.closeAll('loading');
                } else {
                }
            });
        };

        $scope.getProjectdetail = function (pk) {
            $scope.pk = pk;
            $http.post($scope.basePath + "insuranceScheme/getProjectdetail", {pk: pk}).success(function (response) {
                layer.closeAll('loading');

                if (response && response.code == "200") {
                    var treedatas=  response.result.derid;
                    $scope.treedata = treedatas;
                }
            });
        };
    $scope.getProjectdetail2 = function (data,name,date,index) {
        date=date.replace("-","");
        $http.post($scope.basePath + "insuranceScheme/getProjectdetail2", {pk:angular.toJson( data),name:name,date:date}).success(function (response) {
            layer.closeAll('loading');

            if (response && response.code == "200") {
                if(response.result!=null){
                    $scope.listOptions[index].insuranceItemsNoGdzcOptions.data = new Array();
                    var  insureValues=0;
                    for (var i =0 ; i<response.result.result.length;i++){
                        var itemsData = {
                            BEHOLDER_NAME :response.result.result[i].BEHOLDER_NAME,
                            insureValue:response.result.result[i].ASSET_VALUE,
                            assetsName:response.result.result[i].assetsName
                        }
                        insureValues+=response.result.result[i].ASSET_VALUE;
                        $scope.listOptions[index].insuranceItemsNoGdzcOptions.data.push(itemsData);
                    }
                    for (var j=0;j<$scope.listOptions[index].insuranceItemsOptions.data.length;j++){
                        if( $scope.listOptions[index].insuranceItemsOptions.data[j].assetscode==response.assetscode){
                            $scope.listOptions[index].insuranceItemsOptions.data[j].insureValue=insureValues;
                            $scope.listOptions[index].insuranceItemsOptions.data[j].assetsOldValue=insureValues;
                        }
                    }
                }
                var zcDetail=$scope.listOptions[index].insuranceItemsNoGdzcOptions.data;
                //关联被保人资产数据和日期
                for(var h=0;h<$scope.listOptions[index].insurebeHoldeGridOptions.data.length;h++){
                    for (var zc=0;zc<zcDetail.length;zc++){
                        if ($scope.listOptions[index].insurebeHoldeGridOptions.data[h].BEHOLDER_NAME==zcDetail[zc].BEHOLDER_NAME&&zcDetail[zc].assetsName=="ZJ"){
                            $scope.listOptions[index].insurebeHoldeGridOptions.data[h].ZAIJGC_YZ=zcDetail[zc].insureValue;
                        }
                        if ($scope.listOptions[index].insurebeHoldeGridOptions.data[h].BEHOLDER_NAME==zcDetail[zc].BEHOLDER_NAME&&zcDetail[zc].assetsName=="CH"){
                            $scope.listOptions[index].insurebeHoldeGridOptions.data[h].CUNHUO_YZ=zcDetail[zc].insureValue;
                        }
                    }
                    $scope.listOptions[index].insurebeHoldeGridOptions.data[h].ASSETS_DATE=$scope.VO.insureType[index].downLoadDate;

                }
            }
        });
    };
        $scope.changeOpen = function () {
            $scope.status.open = !$scope.status.open;
        };
        $scope.onRowDblClick = function (item) {
            if (item && item.id) {
                $scope.onCard(item.id);
            }
        };

    $scope.findHistoryData = function (i) {
        if ($scope.VO.insureType[i].INSURE_TYPE_ID == null ||null==$scope.VO.estimatepk|| $scope.VO.estimatepk.pk == null) return;
        $http.post($scope.basePath + "insuranceScheme/findHistoryData",
            {data: angular.toJson({holderId:$scope.VO.estimatepk.pk,insuretypeId:$scope.VO.insureType[i].INSURE_TYPE_ID})}).

        success(function (response) {
            layer.closeAll('loading');
            if (response && response.code == "200") {
                var applyArticleArray = new Array();
                var specialPromiseArray = new Array();
                var justiceManageArray = new Array();
                for(var j=0;j<response.ROWS.insureType.length;j++){
                    if($scope.VO.insureType[i].INSURE_TYPE_ID == response.ROWS.insureType[j].INSURE_TYPE_ID){
                        //险种信息：财产一切险
                        $scope.VO.insureType[i].INSURANCE_RATE_MAX=response.ROWS.insureType[j].INSURANCE_RATE_MAX;
                        $scope.VO.insureType[i].INSURANCE_RATE_MIN=response.ROWS.insureType[j].INSURANCE_RATE_MIN;
                        $scope.VO.insureType[i].FORECAST_FEE_MAX=response.ROWS.insureType[j].FORECAST_FEE_MAX;
                        $scope.VO.insureType[i].FORECAST_FEE_MIN=response.ROWS.insureType[j].FORECAST_FEE_MIN;
                        $scope.VO.insureType[i].COMMISION_FEE_RATE=response.ROWS.insureType[j].COMMISION_FEE_RATE;
                        $scope.VO.insureType[i].FREE_FEE=response.ROWS.insureType[j].FREE_FEE;
                        $scope.VO.insureType[i].PAY_WAY_CONTRACT=response.ROWS.insureType[j].PAY_WAY_CONTRACT;
                        $scope.VO.insureType[i].PROJ_INSURETYPE_ID=response.ROWS.insureType[j].PROJ_INSURETYPE_ID;
                        //险种信息：建筑安装工程一切险
                        $scope.VO.insureType[i].INSURE_START_DATE=response.ROWS.insureType[j].INSURE_START_DATE;
                        $scope.VO.insureType[i].INSURE_END_DATE=response.ROWS.insureType[j].INSURE_END_DATE;
                        $scope.VO.insureType[i].INSURE_START_HOUR=response.ROWS.insureType[j].INSURE_START_HOUR;
                        $scope.VO.insureType[i].INSURE_END_HOUR=response.ROWS.insureType[j].INSURE_END_HOUR;
                        $scope.VO.insureType[i].INSURE_DAYS=response.ROWS.insureType[j].INSURE_DAYS;
                        $scope.VO.insureType[i].OTHER_RELATION=response.ROWS.insureType[j].OTHER_RELATION;
                        $scope.VO.insureType[i].INSURE_PROJECT_NAME=response.ROWS.insureType[j].INSURE_PROJECT_NAME;
                        $scope.VO.insureType[i].INSURE_PROJECT_ADDR=response.ROWS.insureType[j].INSURE_PROJECT_ADDR;

                        //险种信息：雇主险
                        $scope.VO.insureType[i].EMPLOYER_SORT_SIGN=response.ROWS.insureType[j].EMPLOYER_SORT_SIGN;
                        $scope.VO.insureType[i].PAY_SUM=response.ROWS.insureType[j].PAY_SUM;
                        $scope.VO.insureType[i].DIE_PAY=response.ROWS.insureType[j].DIE_PAY;
                        $scope.VO.insureType[i].DEFORMITY_PAY=response.ROWS.insureType[j].DEFORMITY_PAY;
                        $scope.VO.insureType[i].INSURE_PEOPLE_NUM=response.ROWS.insureType[j].INSURE_PEOPLE_NUM;

                        $scope.listOptions[i].insurebeHoldeGridOptions.data = response.ROWS.insureType[j].insurebeHolde;
                        //适用条款
                        var  APPLY_ARTICLE={
                            APPLY_ARTICLE:response.ROWS.insureType[j].APPLY_ARTICLE
                        };
                        applyArticleArray.push(APPLY_ARTICLE);
                        //特别约定
                        var SPECIAL_PROMISE={
                            SPECIAL_PROMISE : response.ROWS.insureType[j].SPECIAL_PROMISE
                        }
                        specialPromiseArray.push(SPECIAL_PROMISE);
                        //司法管辖
                        var JUSTICE_MANAGE={
                            JUSTICE_MANAGE : response.ROWS.insureType[j].JUSTICE_MANAGE
                        }
                        justiceManageArray.push(JUSTICE_MANAGE);

                        $scope.listOptions[i].insuranceItemsOptions.data = [];
                        var items = response.ROWS.insureType[j].insurebeItems ;
                        for(var w =0 ; w<items.length;w++){
                            var itemss ={
                                id:   items[w].ITEM_ID,
                                assetscode:items[w].ASSETS_NAME,
                                assetsOldValue:items[w].ASSETS_INSURE_VALUE,
                                addsCale:items[w].ADD_SCALE,
                                insureValue:items[w].ALL_FEE
                            }
                            $scope.listOptions[i].insuranceItemsOptions.data.push(itemss);
                        }
                        //特别条款
                        if(null!=response.ROWS.insureType[j].insurebeExt){
                            var insurebeExt="";
                            var insurebeExts=response.ROWS.insureType[j].insurebeExt;
                            if(insurebeExts instanceof Array){
                                insurebeExts.sort(function(a,b){
                                    if(parseInt(a.ARTICLE_NAME)<parseInt(b.ARTICLE_NAME)){
                                        return -1;
                                    }else if(parseInt(a.ARTICLE_NAME)>parseInt(b.ARTICLE_NAME)){
                                        return 1;
                                    }
                                    return 0;
                                });
                                for(var k=0;k<insurebeExts.length;k++){
                                    insurebeExt+=insurebeExts[k].ARTICLE_NAME+":"+insurebeExts[k].ARTICLE_CON+"\n";
                                }
                            }else{
                                insurebeExt= insurebeExts;
                            }

                        }
                        $scope.VO.insureType[i].insurebeExt = insurebeExt;

                    }
                }

                    //特别条款  ARTICLE_NAME 名称 ARTICLE_CON 内容 list
                    // $scope.listOptions[i].insuranceSpecialClausesridOptions.data =insurebeExt;
                    //特别约定
                    // $scope.listOptions[i].insuranceSpecialPromiseOptions.data =SPECIAL_PROMISE;
                    //司法管辖
                    // $scope.listOptions[i].insurancejusticeManageOptions.data =JUSTICE_MANAGE;
                }
                // layer.alert(response.msg, {
                //     icon: 1
                // });

            });
        }

        /*
                * 上传保存VO
                * */
    //     $scope.onUpSaveVO = function () {
    //         if($scope.VO.estimatepk!=null){
    //             $scope.VO.HOLDER_ID=  $scope.VO.estimatepk.pk;
    //             $scope.VO.HOLDER_ADDR=$scope.VO.estimatepk.c1Province_name;
    //             $scope.VO.HOLDER_NAME=$scope.VO.estimatepk.name;
    //         }
    //         for (var i=0;i<  $scope.listOptions.length;i++){
    //             //适用条款
    //             if(null!=$scope.listOptions[i].insuranceApplyArticleOptions.data){
    //                 $scope.VO.insureType[i].APPLY_ARTICLE=  $scope.listOptions[i].insuranceApplyArticleOptions.data;
    //             }
    //             //特殊约定
    //             if(null!=$scope.listOptions[i].insuranceSpecialPromiseOptions.data){
    //                 $scope.VO.insureType[i].SPECIAL_PROMISE=  $scope.listOptions[i].insuranceSpecialPromiseOptions.data;
    //             }
    //             //司法管辖
    //             $scope.VO.insureType[i].JUSTICE_MANAGE=  $scope.listOptions[i].insurancejusticeManageOptions.data;
    //             $scope.VO.insureType[i].insurebeItems=  $scope.listOptions[i].insuranceItemsOptions.data;
    //             $scope.VO.insureType[i].insurebeHolde=  $scope.listOptions[i].insurebeHoldeGridOptions.data;
    //             $scope.VO.insureType[i].insurebeExt=  $scope.listOptions[i].insuranceSpecialClausesridOptions.data;
    //             $scope.VO.insureType[i].insuranceItems=  $scope.listOptions[i].insuranceItemsAndAmountsGridOptions.data;
    //
    //             $scope.VO.insureType[i].insuranceCategoryApproachGridData=  $scope.listOptions[i].insuranceCategoryApproachGridOptions.data;
    //             $scope.VO.insureType[i].insuranceThirdResponsibilityridData=  $scope.listOptions[i].insuranceThirdResponsibilityridOptions.data;
    //             $scope.VO.insureType[i].insuranceSpecialDangerGridData=  $scope.listOptions[i].insuranceSpecialDangerGridOptions.data;
    //
    //         }
    //         $http.post($rootScope.basePath + "issueNoticeGlife/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
    //             .success(function (response) {
    //
    //                 $scope.VO.id=response.result.id;
    //             });
    //     };
    //
    // };

    $scope.initWatch = function () {
        $(document).on('change', 'div[name="insuranceItemsOptions"]', function () {

            var data1 =this.childNodes[2].childNodes[6].childNodes[2].childNodes[1].childNodes;
            var dataArray=new Array();
            for(var i=1;i<data1.length;i++){
                var data2=data1[i].childNodes[0].childNodes;
                // for (var j=1;j<data2.length;j++){
                var data3=data2[1].firstChild.childNodes[0].data;
                if(dataArray.length==0){
                    dataArray.push(data3);
                    i+=1;
                    continue;
                }
                for (var k = 0; k < dataArray.length; k++) {
                    if (dataArray[k] == data3) {
                        this.childNodes[2].childNodes[6].childNodes[2].childNodes[1].childNodes[i].childNodes[0].childNodes[1].firstChild.childNodes[0].data='';
                        this.childNodes[2].childNodes[6].childNodes[2].childNodes[1].childNodes[i].childNodes[0].childNodes[1].childNodes[1].childNodes[0].dataset.ngAnimate='';
                        dataArray=[];
                        return layer.alert("保险项目请勿重复录入!");
                    }
                    if (k == dataArray.length - 1) {
                        dataArray.push(data3);
                        break;
                    }
                }
                // j+=1;
                // }
                i+=1;
            }
        });

        $scope.$watch('VO.insuranceScheme.name', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.insuranceScheme.id) {
                    $scope.findInsuranceScheme($scope.VO.insuranceScheme.id);
                }
            }
        }, true);
        $scope.$watch('VO.pkProject.name', function (newVal, oldVal) {
            if (!$scope.isEdit) {
                return;
            }
            if (newVal === oldVal || newVal == undefined || newVal == null) return;
            if ($scope.isEdit) {
                if ($scope.VO.pkProject.pk) {
                    $http.post($scope.basePath + "propertyProject/findOne", {pk: $scope.VO.pkProject.pk}).success(function (response) {
                        if (response && response.code == "200") {
                            if (response.result) {
                                $scope.VO.pkC0Tradetype = response.result.pkC0Tradetype;
                                $scope.VO.projectkind = response.result.pkC0Tradetype && response.result.pkC0Tradetype.name;
                                $scope.VO.busi_type = response.result.busi_type;
                                $scope.VO.temporaryPlan = response.result.temporaryPlan;
                                $scope.VO.name="关于"+response.result.cproname+"出单通知书";
                            }
                        }
                    });
                } else {
                    $scope.VO.estimatelinkman = "";
                }
            }
        }, true);
        $scope.watchDate=function (index) {
            var date=new Date($scope.VO.insureType[index].INSURE_START_DATE);
            date.setFullYear(date.getFullYear()+1);
            date.setDate(date.getDate()-1);
            $scope.VO.insureType[index].INSURE_END_DATE=date;
        }
        $scope.$watch('item.INSURE_TYPE_ID', function (newVal, oldVal) {

        }, true);
    };

    $scope.initButton = function () {

        /**
         * 过滤查询功能
         */
        $scope.onQuery = function () {
            $scope.queryForGrid($scope.QUERY);
        };


        /***
         * 查看
         */
        $scope.onView = function () {

            //  控制字表按钮的显示
            $scope.isEdit = false;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id, function (response) {
                    $scope.isGrid = false;
                    $scope.isBack = false;
                    $scope.isEdit = false;
                    $scope.isDisabled = true;
                });
            }
        };

        $scope.onSubmit = function () {
            var pkProject;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                if (rows[0].billstatus != 31) return layer.alert("只有未上报状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 31) return layer.alert("只有未上报状态可以提交!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }

            $scope.queryFlowInfo(pkProject, function (response) {
            });
        };


        $scope.onLinkAuditFlow = function () {
            var pkProject;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行查看!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
            }
            ;
        };

        $scope.onAudit = function () {
            var pkProject;
            if ($scope.isGrid) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                if (rows[0].billstatus != 33 && rows[0].billstatus != 36) return layer.alert("只有审批中或驳回状态可以审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                pkProject = rows[0].pkProject;
            } else {
                pkProject = $scope.VO.pkProject;
                if ($scope.VO.billstatus != 33 ) return layer.alert("只有审批中或驳回状态可以审核!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            }
            ;


        };

        $scope.onUploads = function () {
            $scope.isSubDisabled = false;
            $scope.aVO = {};
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: false,
                template: 'view/common/attachments.html',
                className: 'ngdialog-theme-formInfo',
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
                    // var data = $scope.getVOTms();

                    //  第一次初始化成null，后台没值，应该【】
                    if ($scope.dealAttachmentBGridOptions.data) {
                        angular.forEach(value, function (item) {
                            item.cUpdate = new Date().format("yyyy-MM-dd HH:mm:ss");
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });

                    } else {
                        // $scope[selectTabName].data = [];
                        // $scope[selectTabName].data.push(value);
                        angular.forEach(value, function (item) {
                            $scope.dealAttachmentBGridOptions.data.push(item);
                        });
                    }


                }
            }, function (reason) {

            });
        };

        /*
         * 随时上传附件功能
         * */
        $scope.onUploadAnyTime = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            $scope.isClear = false;
            $scope.isUploadAnytime = true;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form = true;
                $scope.isGrid = false;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id);
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = true;
            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = true;
            }

        }


        $scope.onDownLoads = function () {
            var selectTabName = 'dealAttachmentBGridOptions';
            var rows = $scope[selectTabName].gridApi.selection.getSelectedRows();
            if (!rows || rows.length <= 0) return angular.alert("请选择一条单据进行操作！");
            var ids = [];
            if (selectTabName == 'dealAttachmentBGridOptions') {
                for (var i = 0; i < rows.length; i++) {
                    ids.push(rows[i].pk_project_id);
                }
            }
            var exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };
        $scope.onDownLoadsCard = function (pk_project_id) {
            var ids = [];
            ids.push(pk_project_id);
            var exportEx = $('#exproE');
            exportEx.attr('target', '_blank');
            $('#exproE input').val(ids);
            exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
            exportEx.submit();
        };

        $scope.onAdd = function () {
            $scope.form = true;
            $scope.isGrid = false;
            $scope.isEdit = true;
            $scope.isDisabled = false;
            $scope.tabDisabled = true;
            $scope.isBack = true;
            $scope.treedata="";
            $scope.initView();
            $scope.isAdd=true;
            for (var i=0;i< $scope.VO.insureType.length;i++){
                $scope.VO.insureType[i]=[];
            }
            angular.assignData($scope.VO, $scope.initVO());

            $scope.VO.brokerageAgencyName=$rootScope.orgVO.name;
            $scope.VO.dept=$rootScope.deptVO.name;
            $scope.listOptions=[];
            $scope.initList();
            $rootScope.onAddCheck($scope);
        };
        /**
         * 修改
         */
        $scope.onEdit = function () {
            //  控制字表按钮的显示
            $scope.isEdit = true;
            if ($scope.isGrid) {
                $scope.isGrid = false;
                $scope.form = true;
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1) return layer.alert("请选择一条数据进行修改!", {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
                $scope.findOne(rows[0].id);
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            } else {
                $scope.isGrid = false;
                $scope.isBack = true;
                $scope.isEdit = true;
                $scope.isDisabled = false;
            }
        };
        /**
         * 卡片
         */
        $scope.onCard = function (id) {
            if (!id) {
                var rows = $scope.gridApi.selection.getSelectedRows();
                if (!rows || rows.length != 1)
                    return layer.alert("请选择一条数据进行查看!", {
                        skin: 'layui-layer-lan',
                        closeBtn: 1
                    });
                id = rows[0].id;
            }
            $scope.treedata="";
            $http.post($scope.basePath + "workFlow/findOneFlowInfo", {
                pk: id,
                tableName: $scope.table_name,
                billdef: $scope.billdef
            }).success(function (response) {
                if (response && response.code == "200") {
                    $scope.card = true;
                    angular.assignData($scope.VO, response.result);
                    if (!response.result.taskHis)
                        $scope.mess = false;
                    else
                        $scope.mess = true;
                    $scope.isBack = true;
                    $scope.isGrid = false;
                    $scope.isCard = true;

                } else {
                    if (response) {
                        if (response.msg) {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                }
            });
        };
        /**
         * 暂存
         */
        $scope.onTemporary = function (data) {
            if(data){
                if($scope.VO.estimatepk!=null){
                    $scope.VO.HOLDER_ID=  $scope.VO.estimatepk.pk;
                    $scope.VO.HOLDER_ADDR=$scope.VO.estimatepk.c1Province_name;
                    $scope.VO.HOLDER_NAME=$scope.VO.estimatepk.name;
                }
                for (var i=0;i<  $scope.listOptions.length;i++){
                    //适用条款
                    $scope.VO.insureType[i].APPLY_ARTICLE= new Array();
                    $scope.VO.insureType[i].APPLY_ARTICLE.push({"APPLY_ARTICLE":$scope.VO.insureType[i].applyArticle});
                    //特殊约定
                    $scope.VO.insureType[i].SPECIAL_PROMISE= new Array();
                    $scope.VO.insureType[i].SPECIAL_PROMISE.push({"SPECIAL_PROMISE":$scope.VO.insureType[i].specialPromise});
                    //司法管辖
                    $scope.VO.insureType[i].JUSTICE_MANAGE= new Array();
                    $scope.VO.insureType[i].JUSTICE_MANAGE.push({"JUSTICE_MANAGE":$scope.VO.insureType[i].justiceManage});

                    if($scope.listOptions[i].insuranceItemsOptions.data){
                        for (var it=0;it<$scope.listOptions[i].insuranceItemsOptions.data.length;it++){
                            var data = $scope.listOptions[i].insuranceItemsOptions.data[it];
                        }
                    }
                    $scope.VO.insureType[i].insureCompany=  $scope.listOptions[i].insureCompanyGridOptions.data;
                    $scope.VO.insureType[i].insurebeItems=  $scope.listOptions[i].insuranceItemsOptions.data;
                    $scope.VO.insureType[i].insurebeHolde=  $scope.listOptions[i].insurebeHoldeGridOptions.data;
                    // $scope.VO.insureType[i].insurebeExt=  $scope.listOptions[i].insuranceSpecialClausesridOptions.data;
                    $scope.VO.insureType[i].insuranceItems=  $scope.listOptions[i].insuranceItemsAndAmountsGridOptions.data;

                    $scope.VO.insureType[i].insuranceCategoryApproachGridData=  $scope.listOptions[i].insuranceCategoryApproachGridOptions.data;
                    $scope.VO.insureType[i].insuranceThirdResponsibilityridData=  $scope.listOptions[i].insuranceThirdResponsibilityridOptions.data;
                    $scope.VO.insureType[i].insuranceSpecialDangerGridData=  $scope.listOptions[i].insuranceSpecialDangerGridOptions.data;
                    $scope.VO.insureType[i].insuranceGLifeData=  $scope.listOptions[i].insuranceGLifeOptions.data;
                }
                data=$scope.VO;
                data.billstatus="37";
                data.dr="0";
                var tablename = $scope.table_name;
                $scope.VO.operateDate=new Date().format("yyyy-MM-dd");
                $scope.VO.operateTime= new Date().format("yyyy-MM-dd HH:mm:ss");
                $http.post($rootScope.basePath + "temporary/insert",{data:angular.toJson(data),tablename:tablename}).success(function(response) {
                    if(response.code == 200){
                        $scope.isGrid = false;
                        $scope.isBack = false;
                        $scope.isEdit = false;
                        $scope.isDisabled = true;
                        angular.assignData($scope.VO, response.result);
                        layer.closeAll('loading');
                        $scope.isSubEdit = false;
                        return layer.alert('暂存成功!', {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                });
            }
        }
        $scope.onDelete = function () {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows || rows.length == 0) return layer.alert("请选择数据进行删除!", {skin: 'layui-layer-lan', closeBtn: 1});
            layer.confirm('是否删除选中数据？', {
                    btn: ['删除', '返回'], //按钮
                    btn2: function (index, layero) {
                        layer.msg('取消删除!', {
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
                    $http.post($scope.basePath + "issueNoticeGlife/delete", {ids: angular.toJson(ids)}).success(function (response) {
                        layer.closeAll('loading');
                        if (response && response.code == "200") {
                            $scope.queryForGrid($scope.QUERY);
                            layer.msg('删除成功!', {
                                icon: 1
                            });
                        }

                    });
                }
            );
        };
        /**
         * 取消功能
         */
        $scope.onCancel = function () {
            $scope.isDisabled = true;
            $scope.isEdit = false;
            $scope.isBack = false;

            // if($scope.isAdd==true&&$scope.VO.id!=null){
            //     var ids=new Array();
            //     ids.push($scope.VO.id)
            //     $http.post($scope.basePath + "issueNoticeGlife/delete", {ids: angular.toJson( ids)}).success(function (response) {
            //         $scope.VO.id=null;
            //     });
            // }
        };
        /**
         * 返回
         */
        $scope.onBack = function () {
            if($stateParams.id) {
                window.history.back(-2);
                return;
            }
            $scope.isAdd=false;
            $scope.isCard = false;
            $scope.isGrid = true;
            $scope.isEdit = false;
            $scope.isDisabled = true;
            //阻止页面渲染
            $scope.form = false;
            $scope.card = false;
            $scope.queryForGrid($scope.QUERY);
        };
        /**
         * 保存判断必输项
         */
        $scope.onSave = function () {
            $scope.countALL_FEE();
            ngVerify.check('appForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert("请先填写所有的必输项!",
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    var  ary = new Array();
                    for (var i=0;i< $scope.VO.insureType.length;i++){
                        ary.push($scope.VO.insureType[i].INSURE_TYPE_ID);
                        if($scope.VO.insureType[i].INSURE_START_DATE>$scope.VO.insureType[i].INSURE_END_DATE){
                            return layer.alert("保险起始日期不能大于保险到期日期!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if($scope.VO.insureType[i].COMMISION_FEE_RATE>100){
                            return layer.alert("佣金率不能大于100%!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }


                        // if($scope.VO.insureType[i].INSURANCE_RATE_MIN<=$scope.INSURANCE_RATE_MIN){
                        //     return layer.alert("保险费率不能小于预计费率!",
                        //         {skin: 'layui-layer-lan', closeBtn: 1});
                        // }
                        // if($scope.VO.insureType[i].FORECAST_FEE_MIN<=$scope.FORECAST_FEE_MIN){
                        //     return layer.alert("保费不能小于预计保费!",
                        //         {skin: 'layui-layer-lan', closeBtn: 1});
                        // }
                        // if($scope.VO.insureType[i].INSURANCE_RATE_MIN>=$scope.INSURANCE_RATE_MAX){
                        //     return layer.alert("保险费率不能大于预计费率!",
                        //         {skin: 'layui-layer-lan', closeBtn: 1});
                        // }
                        // if($scope.VO.insureType[i].FORECAST_FEE_MIN>=$scope.FORECAST_FEE_MAX){
                        //     return layer.alert("保费不能大于预计保费!",
                        //         {skin: 'layui-layer-lan', closeBtn: 1});
                        // }


                        var count=0;
                        if(null==$scope.listOptions[i].insureCompanyGridOptions.data){
                            return layer.alert("请选择承保公司!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if($scope.VO.insureType[i].INSURE_TYPE_ID=="tuantywx"&&$scope.listOptions.length>0){
                            let totalPremiumAll = 0;
                            for (let j = 0; j < $scope.listOptions[0].insuranceGLifeOptions.data.length ; j++) {
                                totalPremiumAll += parseFloat($scope.listOptions[0].insuranceGLifeOptions.data[j].premiumAll);
                            }
                            if(parseFloat(totalPremiumAll).toFixed(2)!=parseFloat($scope.VO.insureType[0].FORECAST_FEE_MIN).toFixed(2)){
                                return layer.alert("请检查保费与保险责任中的总保费值是否相等!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                        for(var ic=0;ic<$scope.listOptions[i].insureCompanyGridOptions.data.length;ic++){
                            count+=parseFloat($scope.listOptions[i].insureCompanyGridOptions.data[ic].underwritingRatio);
                        }
                        if (count!=100){
                            return layer.alert("承保比例必须合计等于100%!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if(null==$scope.VO.insureType[i].applyArticle){
                            return layer.alert("必填适用条款信息不能为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if(null==$scope.VO.insureType[i].specialPromise){
                            return layer.alert("特别约定内容信息不能为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if(null==$scope.listOptions[i].insurebeHoldeGridOptions.data||0==$scope.listOptions[i].insurebeHoldeGridOptions.data.length){
                            return layer.alert("被保险人信息不能为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if(null==$scope.VO.insureType[i].justiceManage){
                            return layer.alert("司法管辖信息不能为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if(null==$scope.VO.insureType[i].insurebeExt||0==$scope.VO.insureType[i].insurebeExt.length){
                            return layer.alert("扩展条款及内容信息不能为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if(null==$scope.VO.insureType[i].applyArticle|| 0==$scope.VO.insureType[i].applyArticle.length){
                            return layer.alert("适用条款及内容不能为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if($scope.VO.insureType[i].INSURE_TYPE_ID!="tuantywx"&&(null==$scope.VO.insureType[i].FREE_FEE||0==$scope.VO.insureType[i].FREE_FEE.length)){
                            return layer.alert("免赔额信息不能为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if($scope.VO.insureType[i].INSURE_TYPE_ID!="tuantywx"&&(null==$scope.VO.insureType[i].PAY_WAY_CONTRACT||0==$scope.VO.insureType[i].PAY_WAY_CONTRACT.length)){
                            return layer.alert("付款及赔偿方式约定信息不能为空!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                        if($scope.VO.insureType[i].INSURE_TYPE_ID=="caicyqx"){
                            if(null==$scope.listOptions[i].insuranceItemsOptions.data||0==$scope.listOptions[i].insuranceItemsOptions.data.length){
                                return layer.alert("保险标的及保险金额信息不能为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                        if($scope.VO.insureType[i].INSURE_TYPE_ID=="canycszrbx"){
                            if(null==$scope.listOptions[i].placeScopeGridOptions.data||0==$scope.listOptions[i].placeScopeGridOptions.data.length){
                                return layer.alert("承保场所范围不能为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                        if($scope.VO.insureType[i].INSURE_TYPE_ID=="chuanbx"){
                            if(null==$scope.listOptions[i].additionalInsureGridOptions.data||0==$scope.listOptions[i].additionalInsureGridOptions.data.length){
                                return layer.alert("附加险不能为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                        if($scope.VO.insureType[i].INSURE_TYPE_ID=="jisyqxjzrx"){
                            if(null==$scope.listOptions[i].flightArea){
                                return layer.alert("飞行区域不能为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if(null==$scope.listOptions[i].aircraftUse){
                                return layer.alert("航空器用途不能为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if(null==$scope.listOptions[i].insureMoneyGridOptions.data||0==$scope.listOptions[i].insureMoneyGridOptions.data.length){
                                return layer.alert("保险标的不能为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                        if($scope.VO.insureType[i].INSURE_TYPE_ID=="feijdcdszzrx"){
                            if(null==$scope.listOptions[i].insureAmountGridOptions.data||0==$scope.listOptions[i].insureAmountGridOptions.data.length){
                                return layer.alert("保险金额不能为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                        if($scope.VO.insureType[i].INSURE_TYPE_ID=="huoyx"){
                            if(null==$scope.listOptions[i].freightInsureMoneyGridOptions.data||0==$scope.listOptions[i].freightInsureMoneyGridOptions.data.length){
                                return layer.alert("保险金额不能为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                        if($scope.VO.insureType[i].INSURE_TYPE_ID=="wanglaqbx"){
                            if(null==$scope.listOptions[i].supportProjectGridOptions.data||0==$scope.listOptions[i].supportProjectGridOptions.data.length){
                                return layer.alert("保障项目不能为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                        if($scope.VO.insureType[i].INSURE_TYPE_ID=="jianzazgcyqx"||$scope.VO.insureType[i].INSURE_TYPE_ID=="anzgcyqx"||$scope.VO.insureType[i].INSURE_TYPE_ID=="jianagcx"){
                            if(null==$scope.listOptions[i].insuranceThirdResponsibilityridOptions.data||0==$scope.listOptions[i].insuranceThirdResponsibilityridOptions.data.length){
                                return layer.alert("第三者责任--赔偿限额信息不能为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if(null==$scope.listOptions[i].insuranceItemsAndAmountsGridOptions.data||0==$scope.listOptions[i].insuranceItemsAndAmountsGridOptions.data.length){
                                return layer.alert("保险项目及保险金额/赔偿限额/物质损失--保险项目及金额信息不能为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                        if($scope.VO.insureType[i].INSURE_TYPE_ID=="gongdzrx"||$scope.VO.insureType[i].INSURE_TYPE_ID=="gongzzrx"||$scope.VO.insureType[i].INSURE_TYPE_ID=="anqsczrx"){
                            if(null==$scope.listOptions[i].insuranceThirdResponsibilityridOptions.data||0==$scope.listOptions[i].insuranceThirdResponsibilityridOptions.data.length){
                                return layer.alert("赔偿限额信息不能为空!",
                                    {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                        }
                    }
                    var nary=ary.slice().sort();
                    for(var a=0;a<ary.length;a++){
                        if (nary[a]==nary[a+1]){
                            return layer.alert("请勿添加相同险种!",
                                {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                    if($scope.dealAttachmentBGridOptions.data == null ||$scope.dealAttachmentBGridOptions.data.length == 0 ){
                        return layer.alert("附件不可为空！",
                            {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                    if(null!=$scope.VO.pkProject){
                        $scope.VO.pkProject_project_typeName = $rootScope.returnSelectName($scope.VO.pkProject.project_type, "MARKETTYPE");
                    }
                    if(!findImpData($scope.VO)){
                        return false;
                    }
                    $scope.onSaveVO();
                }
            }, true);
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

        $scope.getGridTemplate = function () {

        };
        $scope.changeInsurebeHolde = function (data,indexs) {
            $http.post($scope.basePath + "issueNoticeGlife/changeInsurebeHolde", {
                data: angular.toJson(data),
            }).success(function (response) {
                if (response) {
                    
                    var treedatas=  response.derid;
                    $scope.treedata = treedatas;

                    var returnMap=response.returntMap;
                    returnMap.id=data.id;
                    returnMap.assetscode='gdzc';
                    if(null==$scope.listOptions[indexs].insuranceItemsOptions.data||$scope.listOptions[indexs].insuranceItemsOptions.data.length==0){
                        $scope.listOptions[indexs].insuranceItemsOptions.data=new Array();
                        $scope.listOptions[indexs].insuranceItemsOptions.data.push(returnMap);
                    }else{
                        for (var i=0;i< $scope.listOptions[indexs].insuranceItemsOptions.data.length;i++){
                            if($scope.listOptions[indexs].insuranceItemsOptions.data[i].assetscode=='gdzc'){
                                $scope.listOptions[indexs].insuranceItemsOptions.data[i]=returnMap;
                                break;
                            }
                            if (i== $scope.listOptions[indexs].insuranceItemsOptions.data.length-1){
                                $scope.listOptions[indexs].insuranceItemsOptions.data.push(returnMap);
                            }
                        }
                    }
                }
            });
        };

        /**
         * 子表新增
         */
        $scope.onAddLine = function (selectTabName,number) {

            if(selectTabName=="insurebeHoldeGridOptions"||selectTabName=="insureCompanyGridOptions"){
                $scope.numBer = number;
                $scope.tabName = selectTabName;
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: 'view/batchProject/insureCustomerRef.html',
                    className: 'ngdialog-theme-formInfo',
                    controller: 'projectGridOptionsCtrl1',
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
                        for(var i=0; i<value.length;i++){
                            $scope[$scope.selectTabName].data.push(value[i]);
                        }
                    }
                }, function (reason) {
                });
            }else if(selectTabName=="insuranceItemsOptions"&&null!=$scope.listOptions[number].insuranceItemsOptions.data&&$scope.listOptions[number].insuranceItemsOptions.data.length==3){
                return layer.alert('已选择所有项目类型，请勿重复添加', {
                    skin: 'layui-layer-lan',
                    closeBtn: 1
                });
            } else{
                if($scope.listOptions[number][selectTabName].data==null){
                    $scope.listOptions[number][selectTabName].data=new Array();
                }
                $scope.listOptions[number][selectTabName].data.push({});
            }
        };
        /**
         * 子表删除
         */
        $scope.onDeleteLine = function (selectTabName,number) {
            if(selectTabName=='dealAttachmentBGridOptions'){
                var delRow = $scope[selectTabName].gridApi.selection.getSelectedRows();            }
            else{
                var delRow = $scope.listOptions[number][selectTabName].gridApi.selection.getSelectedRows();
            }
            if (!delRow || delRow.length == 0) return layer.alert('请选择行数据', {
                skin: 'layui-layer-lan',
                closeBtn: 1
            });
            if(selectTabName=='dealAttachmentBGridOptions'){
                for (var i = 0; i < $scope[selectTabName].data.length; i++) {
                    for (var j = 0; j < delRow.length; j++) {
                        if ($scope[selectTabName].data[i].$$hashKey == delRow[j].$$hashKey) {
                            $scope[selectTabName].data.splice(i, 1);
                        }
                    }
                }
            }else if(selectTabName=='insurebeHoldeGridOptions'){
                for (var i = 0; i < $scope.listOptions[number][selectTabName].data.length; i++) {
                    for (var j = 0; j < delRow.length; j++) {
                        if ($scope.listOptions[number][selectTabName].data[i].$$hashKey == delRow[j].$$hashKey) {
                            $scope.listOptions[number][selectTabName].data.splice(i, 1);
                        }
                    }
                }
                var gdzc;
                for(var gd=0;gd<$scope.listOptions[number].insuranceItemsOptions.data.length;gd++){
                    if($scope.listOptions[number].insuranceItemsOptions.data[gd].assetscode=='gdzc'){
                        gdzc=$scope.listOptions[number].insuranceItemsOptions.data[gd];
                    }
                }
                var data ={"id":gdzc.id,"insurebeHolde":$scope.listOptions[number].insurebeHoldeGridOptions.data};
                $scope.changeInsurebeHolde(data,number);
            } else{
                for (var i = 0; i < $scope.listOptions[number][selectTabName].data.length; i++) {
                    for (var j = 0; j < delRow.length; j++) {
                        if ($scope.listOptions[number][selectTabName].data[i].$$hashKey == delRow[j].$$hashKey) {
                            if (selectTabName=='insuranceItemsOptions'&&$scope.listOptions[number][selectTabName].data[i].assetscode=="gdzc"){
                                $scope.treedata = null;
                            }
                            $scope.listOptions[number][selectTabName].data.splice(i, 1);
                        }
                    }
                }
            }

        };
    };
    $scope.initPageinsuranceItemsAndAmounts = function (i) {
        return {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            columnDefs: [
                {
                    name: 'commitType', displayName: '保险项目'
                },
                {
                    name: 'commitTargetType', displayName: '保险金额', width: 200,cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'commitTargetType1', displayName: '备注'
                },
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                $scope.listOptions[i].insuranceItemsAndAmountsGridOptions.gridApi = gridApi;
            }
        }
    }
    $scope.initPageinsuranceSpecialDanger = function (i) {
        return {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            columnDefs: [
                {
                    name: 'commitType', displayName: '危险种类',width: 300
                },
                {
                    name: 'commitTargetType', displayName: '赔偿限额',width: 200,cellFilter: 'AMOUNT_FILTER'
                },
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                $scope.listOptions[i].insuranceSpecialDangerGridOptions.gridApi = gridApi;
            }
        }
    }
    $scope.initPageInsuranceG = function (i) {
        return {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            columnDefs: [
                {
                    name: 'commitType', displayName: '名称', width: 300
                },
                {
                    name: 'commitTargetType', displayName: '赔偿限额(元)', width: 200,cellFilter: 'AMOUNT_FILTER'
                },
            ],
            data: [{"commitType":"累计赔偿限额"}],
            onRegisterApi: function (gridApi) {
                $scope.listOptions[i].insuranceThirdResponsibilityridOptions.gridApi = gridApi;
            }
        }
    }
    $scope.initPageinsuranceCategoryApproach = function (i) {
        return {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            columnDefs: [
                {
                    name: 'commitType', displayName: '工种'
                },
                {
                    name: 'commitTargetType', displayName: '保险项目',
                },
                {
                    name: 'commitTargetType1', displayName: '每人赔偿限额',cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'commitTargetType2', displayName: '人数',
                },
                {
                    name: 'commitTargetType3', displayName: '累计赔偿限额',cellFilter: 'AMOUNT_FILTER'
                },
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                $scope.listOptions[i].insuranceCategoryApproachGridOptions.gridApi = gridApi;
            }
        }
    }
    $scope.initPageInsuranceI = function (i) {
        return {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            columnDefs: [
                {
                    name: 'APPLY_ARTICLE', displayName: '条款内容',
                }
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                $scope.listOptions[i].insuranceApplyArticleOptions.gridApi = gridApi;
            }
        }
    }
    $scope.initPageInsuranceJ = function (i) {
        return {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            columnDefs: [
                {
                    name: 'ARTICLE_NAME', displayName: '条款名称',width:'300'
                },
                {
                    name: 'ARTICLE_CON', displayName: '条款内容',
                },
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                $scope.listOptions[i].insuranceSpecialClausesridOptions.gridApi = gridApi;
            }
        }
    }
    $scope.initPageInsuranceK = function (i) {
        return {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            columnDefs: [
                {
                    name: 'SPECIAL_PROMISE', displayName: '特别约定'
                },
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                $scope.listOptions[i].insuranceSpecialPromiseOptions.gridApi = gridApi;
            }
        }
    }
    $scope.initPageInsuranceL = function (i) {
        return {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            columnDefs: [
                {
                    name: 'JUSTICE_MANAGE', displayName: '内容'
                },
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                $scope.listOptions[i].insurancejusticeManageOptions.gridApi = gridApi;
            }
        }
    }
    $scope.initPageInsurance = function (i) {
        return {
            enableCellEditOnFocus: true,
            cellEditableCondition: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: false,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            rowHeight: 35,
            columnDefs: [
                {name: 'assetscode', displayName: '保险项目',cellFilter: 'SELECT_BDTYPE'},
                {name: 'assetsOldValue', displayName: '资产原值',cellFilter: 'AMOUNT_FILTER',enableCellEdit: false,},
                {name: 'addsCale', displayName: '加成比例',cellFilter: 'AMOUNT_FILTER',enableCellEdit: false,},
                {name: 'insureValue', displayName: '投保金额',cellFilter: 'AMOUNT_FILTER',enableCellEdit: false,},
            ],
            data: new Array(),

            onRegisterApi: function (gridApi) {
                $scope.listOptions[i].insuranceItemsOptions.gridApi = gridApi;
                $scope.listOptions[i].insuranceItemsOptions.gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
                    //行选中事件

                    var rows =  $scope.listOptions[i].insuranceItemsOptions.gridApi.selection.getSelectedRows();
                    if (rows.length ==1) {
                        if(rows[0].assetscode=="gdzc") {
                            // if(rows[0].id!=null){
                            //     $scope.getProjectdetail(rows[0].id);
                            // }
                            if(rows[0].id!=null){
                                var data ={"id":rows[0].id,"insurebeHolde":$scope.listOptions[i].insurebeHoldeGridOptions.data};
                                $scope.changeInsurebeHolde(data,i);
                                $scope.ifGdzc=true;
                            }
                        }
                        if(rows[0].assetscode=="zjgc"){
                            if(null==$scope.VO.insureType[i].downLoadDate||$scope.VO.insureType[i].downLoadDate==""){
                                return layer.alert('请选择资产日期!', {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if( $scope.listOptions[i].insurebeHoldeGridOptions.data!=null){
                                $scope.getProjectdetail2($scope.listOptions[i].insurebeHoldeGridOptions.data,"ZJ",$scope.VO.insureType[i].downLoadDate,i);
                            }
                            $scope.ifGdzc=false;
                        }
                        if(rows[0].assetscode=="cunhuo"){
                            if(null==$scope.VO.insureType[i].downLoadDate||$scope.VO.insureType[i].downLoadDate==""){
                                return layer.alert('请选择资产日期!', {skin: 'layui-layer-lan', closeBtn: 1});
                            }
                            if( $scope.listOptions[i].insurebeHoldeGridOptions.data!=null){
                                $scope.getProjectdetail2($scope.listOptions[i].insurebeHoldeGridOptions.data,"CH",$scope.VO.insureType[i].downLoadDate,i);
                            }
                            $scope.ifGdzc=false;
                        }
                    }
                });
            }
        }
    }
    $scope.initPageNoGdzc = function (i) {
        return {
            enableCellEditOnFocus: true,
            cellEditableCondition: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            rowHeight: 35,
            columnDefs: [
                {name: 'BEHOLDER_NAME', displayName: '被保险人名称',enableCellEdit: false,},
                {name: 'insureValue', displayName: '投保资产',enableCellEdit: false,},
            ],
            data: new Array(),

            onRegisterApi: function (gridApi) {
                $scope.listOptions[i].insuranceItemsNoGdzcOptions.gridApi = gridApi;
                $scope.listOptions[i].insuranceItemsNoGdzcOptions.gridApi.selection.on.rowSelectionChanged($scope,function(row,event){
                    //行选中事件
                    var rows =  $scope.listOptions[i].insuranceItemsNoGdzcOptions.gridApi.selection.getSelectedRows();
                    if (rows.length ==1) {

                    }
                });
            }
        }
    }
    $scope.initPagePlaceScope = function (i) {
        return {
            enableCellEditOnFocus: true,
            cellEditableCondition: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            columnDefs: [
                {name: 'companyName', displayName: '单位简称', enableCellEdit: true,},
                {name: 'addr', displayName: '地址', enableCellEdit: true,},
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                $scope.listOptions[i].placeScopeGridOptions.gridApi = gridApi;
            }
        }
    }
    /**
     * 保障项目（网络安全保险）
     */
    $scope.initPageSupportProject = function (i) {
        return {
            enableCellEditOnFocus: true,
            cellEditableCondition: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            columnDefs: [
                {name: 'projectName', displayName: '项目名称', enableCellEdit: true,},
                {name: 'money', displayName: '保险金额（元）',cellFilter: 'AMOUNT_FILTER', enableCellEdit: true,},
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                $scope.listOptions[i].supportProjectGridOptions.gridApi = gridApi;
            }
        }
    }
    /**
     * 保险标的（机身一切险及责任险）
     */
    $scope.initPageInsureMoney = function (i) {
        return {
            enableCellEditOnFocus: true,
            cellEditableCondition: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            columnDefs: [
                {name: 'responsibility', displayName: '保险责任', enableCellEdit: true,},
                {name: 'deviceNO', displayName: '设备编号', enableCellEdit: true,},
                {name: 'insuranceMoney', displayName: '保险金额（元）', cellFilter: 'AMOUNT_FILTER', enableCellEdit: true,},
                {name: 'chargerate', displayName: '费率‰', cellFilter: 'number:6', enableCellEdit: true,},
                {name: 'insurancecharge', displayName: '保险费', cellFilter: 'AMOUNT_FILTER', enableCellEdit: true,},
                {name: 'franchise', displayName: '免赔额（率％）', cellFilter: 'number:6', enableCellEdit: true,},
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                $scope.listOptions[i].insureMoneyGridOptions.gridApi = gridApi;
            }
        }
    }
    /**
     * 保险金额（非机动车第三者责任险）
     */
    $scope.initPageInsureAmount = function (i) {
        return {
            enableCellEditOnFocus: true,
            cellEditableCondition: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            columnDefs: [
                {name: 'responsibility', displayName: '保险标的', enableCellEdit: true,},
                {name: 'number', displayName: '数量（辆）', enableCellEdit: true,},
                {name: 'unitPrice', displayName: '单价（元）', cellFilter: 'AMOUNT_FILTER', enableCellEdit: true,},
                {name: 'unitMoney', displayName: '盗抢险保险金额（元/辆）', cellFilter: 'AMOUNT_FILTER', enableCellEdit: true,},
                {name: 'insuranceMoney', displayName: '第三者责任险赔偿限额（元/辆）', cellFilter: 'AMOUNT_FILTER', enableCellEdit: true,},
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                $scope.listOptions[i].insureAmountGridOptions.gridApi = gridApi;
            }
        }
    }
    /**
     * 保险金额（货运险）
     */
    $scope.initPageFreightInsureMoney = function (i) {
        return {
            enableCellEditOnFocus: true,
            cellEditableCondition: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            columnDefs: [
                {name: 'freightName', displayName: '货物名称',enableCellEdit: true,},
                {name: 'insuranceMoney', displayName: '保险金额（元）',cellFilter: 'AMOUNT_FILTER',enableCellEdit: true,},
            ],
            data:  new Array(),
            onRegisterApi: function (gridApi) {
                $scope.listOptions[i].freightInsureMoneyGridOptions.gridApi = gridApi;
            }
        }
    }
    /**
     * 附加险（船舶险）
     */
    $scope.initPageAdditionalInsure = function (i) {
        return {
            enableCellEditOnFocus: true,
            cellEditableCondition: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: false,
            enableRowHeaderSelection: true,
            selectionRowHeaderWidth: 35,
            rowHeight: 35,
            cellEditableCondition: function ($rootScope) {
                if ($scope.isEdit) {
                    return true;
                } else {
                    return false;
                }
            },
            columnDefs: [
                {
                    name: 'insuranceName',
                    displayName: '险别',
                    enableCellEdit: true
                },
                {
                    name: 'insuranceMoney',
                    displayName: '保险金额/赔偿限额（元）',
                    cellFilter: 'AMOUNT_FILTER',
                    enableCellEdit: true,
                },
                {name: 'chargerate', displayName: '费率%', cellFilter: 'number:6', enableCellEdit: true,},
                {name: 'insurancecharge', displayName: '保险费', cellFilter: 'AMOUNT_FILTER', enableCellEdit: true,},
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                $scope.listOptions[i].additionalInsureGridOptions.gridApi = gridApi;
            }
        }
    }
    $scope.initPageinsurebeHolde = function (i) {
        return  {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            columnDefs: [
                {
                    name: 'BEHOLDER_NAME', displayName: '被保人名称', width: 200,enableCellEdit: false,
                },
                {
                    name: 'BEHOLDER_ADDR', displayName: '地址',
                },
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                //添加行头
                gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
                $scope.listOptions[i].insurebeHoldeGridOptions.gridApi = gridApi;
            }
        };
    }
    $scope.initPageGLife = function (i) {
        return  {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: true,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            columnDefs: [
                {
                    name: 'insured', displayName: '投保人员*', width: 100,enableCellEdit:  $scope.isEdit,cellFilter: 'SELECT_INSURED'
                },
                {
                    name: 'insuredType', displayName: '投保险种*',width: 200,enableCellEdit: $scope.isEdit,cellFilter: 'SELECT_INSUREDTYPE'
                },
                // {
                //     name: 'insurancepk.name',
                //     displayName: '投保险种',
                //     width: 100,
                //     url: 'insuranceScheme/queryInsurancepk' ,
                //     placeholder: '请选择',
                //     editableCellTemplate: 'ui-grid/refEditor',
                //     isTree: true,
                //     popupModelField: 'insurancepk'
                // },
                {
                    name: 'InsuranceLiability', displayName: '保险责任',enableCellEdit: $scope.isEdit,cellFilter: 'SELECT_INSURANCELIABILITY'
                },
                {
                    name: 'peopleAll', displayName: '人数*',enableCellEdit: $scope.isEdit,cellFilter: 'INT_FILTER'
                },
                {
                    name: 'insuranceMoneyEveryone', displayName: '保险金额/人(元)',enableCellEdit: $scope.isEdit,cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'insuranceMoneyAll', displayName: '总保险金额(元)*',enableCellEdit: false,cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'deductible', displayName: '免赔额(元)*',enableCellEdit: $scope.isEdit
                },
                {
                    name: 'rate', displayName: '费率‰ *',enableCellEdit: false
                },
                {
                    name: 'insurancePremiumEveryone', displayName: '保险费/人(元)',enableCellEdit: $scope.isEdit,cellFilter: 'AMOUNT_FILTER'
                },
                {
                    name: 'premiumAll', displayName: '总保费(元)*',enableCellEdit: $scope.isEdit,cellFilter: 'AMOUNT_FILTER'
                }
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                //添加行头
                gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
                $scope.listOptions[i].insuranceGLifeOptions.gridApi = gridApi;
                if (gridApi.edit) {
                    gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                        if (rowEntity.peopleAll ==undefined||rowEntity.peopleAll==null ||rowEntity.peopleAll=="NaN"){ rowEntity.peopleAll = 0;}
                        if (rowEntity.insuranceMoneyEveryone ==undefined ||rowEntity.insuranceMoneyEveryone ==null ||rowEntity.insuranceMoneyEveryone=="NaN"){ rowEntity.insuranceMoneyEveryone = 0;}
                        if (rowEntity.insurancePremiumEveryone ==undefined||rowEntity.insurancePremiumEveryone ==null||rowEntity.insurancePremiumEveryone =="NaN"){ rowEntity.insurancePremiumEveryone = 0;}
                        if (rowEntity.premiumAll ==undefined||rowEntity.premiumAll=="0.00"||rowEntity.premiumAll=="NaN"){rowEntity.premiumAll=0};
                        if (rowEntity.insuranceMoneyAll ==undefined||rowEntity.insuranceMoneyAll=="0.00"||rowEntity.insuranceMoneyAll=="NaN"){rowEntity.insuranceMoneyAll=0};

                        // 如果修改人数时peopleAll
                        if(colDef.name=="peopleAll"){
                            rowEntity.insuranceMoneyAll =  (parseFloat(rowEntity.peopleAll) * parseFloat(rowEntity.insuranceMoneyEveryone)).toFixed(2);
                            rowEntity.premiumAll  =  (parseFloat(rowEntity.peopleAll) * parseFloat(rowEntity.insurancePremiumEveryone)).toFixed(2);
                            if (rowEntity.premiumAll!=0 &&rowEntity.insuranceMoneyAll!=0){
                                rowEntity.rate = (parseFloat(rowEntity.premiumAll)/parseFloat(rowEntity.insuranceMoneyAll)*1000).toFixed(2);
                            }else {
                                rowEntity.rate = parseFloat("0.00").toFixed(2);
                            }
                        }

                        // 如果保险金额/人(元) insuranceMoneyEveryone
                        if (colDef.name=="insuranceMoneyEveryone"){
                            rowEntity.insuranceMoneyAll =  (parseFloat(rowEntity.peopleAll) * parseFloat(rowEntity.insuranceMoneyEveryone)).toFixed(2);
                            if (rowEntity.premiumAll!=0 &&rowEntity.insuranceMoneyAll!=0){
                                rowEntity.rate = (parseFloat(rowEntity.premiumAll)/parseFloat(rowEntity.insuranceMoneyAll)*1000).toFixed(2);
                            }else {
                                rowEntity.rate = parseFloat("0.00").toFixed(2);
                            }
                        }

                        // 如果修改 '保险费/人(元)' insurancePremiumEveryone
                        if (colDef.name == "insurancePremiumEveryone"){
                            rowEntity.premiumAll  =  (parseFloat(rowEntity.peopleAll) * parseFloat(rowEntity.insurancePremiumEveryone)).toFixed(2);
                            if (rowEntity.premiumAll!=0 &&rowEntity.insuranceMoneyAll!=0){
                                rowEntity.rate = (parseFloat(rowEntity.premiumAll)/parseFloat(rowEntity.insuranceMoneyAll)*1000).toFixed(2);
                            }else {
                                rowEntity.rate = parseFloat("0.00").toFixed(2);
                            }
                        }
                        // 如果修改 总保费(元) premiumAll
                        if (colDef.name=="premiumAll"){
                            if (rowEntity.peopleAll!=0&&rowEntity.premiumAll!=0){
                                rowEntity.insurancePremiumEveryone = parseFloat(rowEntity.premiumAll/rowEntity.peopleAll).toFixed(2);
                            }else {
                                rowEntity.insurancePremiumEveryone = parseFloat("0.00").toFixed(2);
                            }
                            //计算费率
                            if (rowEntity.peopleAll!=0&&rowEntity.insuranceMoneyAll!=0&&rowEntity.premiumAll!=0){
                                rowEntity.rate = (parseFloat(rowEntity.premiumAll)/parseFloat(rowEntity.insuranceMoneyAll)*1000).toFixed(2);
                            }else {
                                rowEntity.rate = parseFloat("0.00").toFixed(2);
                            }

                        }

                /*        if((colDef.name=="insuranceMoneyEveryone"||colDef.name=="peopleAll")&&null!=rowEntity.peopleAll){
                            rowEntity.insuranceMoneyAll=rowEntity.insuranceMoneyEveryone*rowEntity.peopleAll;
                        }
                        if((colDef.name=="insuranceMoneyAll"||colDef.name=="peopleAll"||colDef.name=="rate"||colDef.name=="insuranceMoneyEveryone")&&null!=rowEntity.peopleAll&&null!=rowEntity.rate&&null!=rowEntity.insuranceMoneyAll){
                            rowEntity.premiumAll=rowEntity.insuranceMoneyAll*rowEntity.rate/1000;
                            rowEntity.insurancePremiumEveryone=rowEntity.premiumAll/rowEntity.peopleAll;
                        }*/
                        // if(null!=rowEntity.insurancepk){
                        //     if(rowEntity.insurancepk.code.substr(0,2)=='01'){
                        //         rowEntity.insured=1;
                        //     }else if(rowEntity.insurancepk.code.substr(0,2)=='02'){
                        //         rowEntity.insured=2;
                        //     }else{
                        //         rowEntity.insured=3;
                        //     }
                        // }
                        $scope.$apply();
                    });
                }
            }
        };
    }
    $scope.initPageinsureCompany = function (i) {
        return  {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            columnDefs: [
                {
                    name: 'insureCompanyName', displayName: '承保公司名称', width: 200,enableCellEdit: false,
                },
                {
                    name: 'underwritingRatio', displayName: '承保比例（%）',
                },
            ],
            data: new Array(),
            onRegisterApi: function (gridApi) {
                //添加行头
                gridApi.core.addRowHeaderColumn({
                    name: 'rowHeaderCol',
                    displayName: '',
                    width: 30,
                    cellTemplate: 'ui-grid/rowNumberHeader'
                });
                $scope.listOptions[i].insureCompanyGridOptions.gridApi = gridApi;
            }
        };
    }

    // $scope.selectTabName = 'initPage';
    $scope.initPage = function () {
        $scope.form = false;
        $scope.card = false;

        $scope.isGrid = true;
        $scope.isCard = false;
        $scope.isEdit = false;
        $scope.isDisabled = true;
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
            cellEditableCondition:function($rootScope){
                if($scope.isEdit){
                    return true;
                }else{
                    return  false;
                }
            },
            exporterOlderExcelCompatibility: true,
            exporterCsvFilename: '出单通知书信息.csv',
            columnDefs: [
                {name: 'IssueNoticeNo', displayName: '出单通知书信息编号', width: 100,},
                {name: 'name', displayName: '出单通知书信息名称', width: 100,},
                {name: 'insuranceSchemeCode', displayName: '保险方案编号', width: 100,},
                {name: 'insuranceSchemeName', displayName: '保险方案名称', width: 100,},
                {name: 'estimatepk_name', displayName: '投保人名称', width: 100,},
                {name: 'estimatepk_code', displayName: '投保人编号', width: 100,},
                {name: 'pkProject_code', displayName: '立项编号', width: 100,},
                {name: 'pkProject_name', displayName: '立项名称', width: 100,},
                {name: 'busi_typename', displayName: '业务分类', width: 100,},
                // {name: 'pkProject.cinsureman_name', displayName: '客户名称', width: 100,},
                {name: 'project_type', displayName: '业务类型', width: 100, cellFilter: 'SELECT_MARKETTYPE'},
                {name: 'billstatus', displayName: '单据状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'dwzc_billstatus', displayName: '电网资产系统审核状态', width: 100, cellFilter: 'SELECT_BILLSTATUS'},
                {name: 'pkOperator_name', displayName: '经办人', width: 100,},
                {name: 'pkOrg_name', displayName: '业务单位', width: 100,},
                {name: 'pkDept_name', displayName: '业务部门', width: 100,},
                {name: 'operate_date', displayName: '制单日期', width: 100, cellFilter: 'date:"yyyy-MM-dd"'},
                {name: 'operateTime', displayName: '制单时间', width: 100,},
            ],
            data: []
        };

        $scope.dealAttachmentBGridOptions = {
            enableCellEditOnFocus: true,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [

                {name: 'attachment_name', displayName: '附件名称', width: 120, enableCellEdit: false},
                {
                    name: 'issueFileType',
                    displayName: '附件类型',
                    width: 100,
                    enableCellEdit: true,
                    cellFilter: 'SELECT_CDFILETYPE',
                    editableCellTemplate: 'ui-grid/dropdownEditor'
                    ,
                    editDropdownValueLabel: 'name'
                    ,
                    editDropdownOptionsArray: getSelectOptionData.CDFILETYPE
                },
                {
                    name: 'cUpdate', displayName: '上载时间', width: 100, enableCellEdit: false
                },
                {
                    name:'pk_project_id',
                    displayName:' ',
                    width: 120,
                    cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ng-click="grid.appScope.onPreviewFile(row.entity.pk_project_id,row.entity.attachment_name)" class="btn btn-transparent btn-xs tooltips" tooltip-placement="top">在线预览&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-eye"></i></a></div>'
                }
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
                    if (!$scope.chilbTable) {
                        $scope.chilbTable = true;
                    }
                    angular.assignData($scope.VO, row.entity);
                    $scope.findOne(rows[0].id);
                } else {
                    angular.assignData($scope.VO, $scope.initVO());
                }
            });
        };

        if ($stateParams.pk != null) {
            $scope.queryForGrid({});
        }
        if ($stateParams.id) {
            $scope.onCard($stateParams.id);
        }
    };

    $scope.initData();
    $scope.initHttp();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initButton();
    $scope.initPage();
    $scope.beanName = "insurance.IssueNoticeServiceImpl";
    initworkflow($scope, $http, ngDialog);
    initPreviewFile($scope,$rootScope);
    initonlineView($scope,$rootScope,$sce,$http,ngDialog);

});
app.controller('projectGridOptionsCtrl1', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
    /**
     * 初始化页面变更方法
     */
    $scope.initQUERYChildren = function () {
        return {
            // insurancedmanpk:[]
        }
    };
    $scope.customerRef =
        {
            id: $scope.$id,
            columnDefs: [
                {
                    field: 'code',
                    displayName: '客户编号'
                },
                {
                    field: 'name',
                    displayName: '客户名称'
                }
            ],
            data: ""
        };
    $scope.QUERYCHILDREN = $scope.initQUERYChildren();
    if($scope.tabName=="insureCompanyGridOptions"){
        $scope.QUERYCHILDREN.pk_org=1;
        $scope.QUERYCHILDREN.c_0_type=3;
    }else {
        if($scope.ids!=null){
            $scope.QUERYCHILDREN.ids=$scope.ids[$scope.numBer];
        }else {
            $scope.QUERYCHILDREN.ids="''";
            return layer.alert("请先选择一条保险方案记录!", {skin: 'layui-layer-lan', closeBtn: 1});
        }
        // $scope.QUERYCHILDREN.c_0_type=1;
    }
    $scope.initQUERYChildren();
    $scope.initData = function () {
        $scope.customerGridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            paginationPageSizes: [100, 500, 1000],
            paginationPageSize: 100,
            useExternalPagination: true,
            columnDefs: [
                {name: 'CODE', displayName: '客户编号', width: 100},
                {name: 'NAME', displayName: '客户名称', width: 100},
                {name: 'C1INSTITUTION', displayName: '组织机构代码', width: 100},
                {name: 'UPCUSTOMER_NAME', displayName: '集团名称', width: 100},
                {name: 'C_0_ADDRESS', displayName: '集团地址', width: 100},
                // {name: 'ENUM_ENTKIND', displayName: '单位性质', width: 100},
                {name: 'C_0_TRADETYPE', displayName: '行业类别', width: 100},
                // {name: 'C_1_PROVINCE', displayName: '所属区域', width: 100},
                {name: 'PKORG_NAME', displayName: '业务单位', width: 100},
                {name: 'PKDEPT_NAME', displayName: '业务部门', width: 100}
            ],
        };
        $scope.customerGridOptions.onRegisterApi = function (gridApi) {
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
                $scope.queryForGridChildren($scope.QUERYCHILDREN);
            });
        };
    };

    $scope.queryForGridChildren = function (data) {
        if (!$scope.queryData) {
            $scope.queryData = $scope.gridApi ? $scope.gridApi.columnDefs : $scope.customerGridOptions.columnDefs;
        }
        layer.load(2);

        if ($scope.QUERYCHILDREN.insurancedmanpk!=null){
            data['id']=$scope.QUERYCHILDREN.insurancedmanpk.pk;
        }

        $http.post($scope.basePath + 'insuranceScheme/queryInsurancedmanByUp', {
            data: angular.toJson(data),
            page: 0,
            pageSize: 10000,
            fields: angular.toJson($scope.queryData)
        }).success(function (response) {
            if (response.code == 200) {
                if (!$scope.query) {
                    $scope.query = $scope.customerGridOptions.columnDefs;
                }
                $scope.customerGridOptions.data = response.result.Rows;
                $scope.customerGridOptions.totalItems = response.result.Total;
            }
            layer.closeAll('loading');
        });
    };
    $scope.onQueryChildren = function () {
        $scope.queryForGridChildren($scope.QUERYCHILDREN);
    };
    $scope.onResetChildren = function () {
        $scope.QUERYCHILDREN = $scope.initQUERYChildren();
    };
    $scope.initFunction = function () {
        /**
         * 确定
         */
        $scope.onSaveSelection = function (i) {
            var rows = $scope.gridApi.selection.getSelectedRows();
            if (!rows) return layer.alert("请选择一条记录!", {skin: 'layui-layer-lan', closeBtn: 1});
            for( var j = 0;j<rows.length;j++){
                if($scope.tabName=="insurebeHoldeGridOptions"){
                    var BEHOLDER ={
                        BEHOLDER_ID:rows[j].pk,
                        BEHOLDER_NAME:rows[j].name,
                        BEHOLDER_ADDR : rows[j].c_0_address
                    };
                    if(null==$scope.listOptions[$scope.numBer].insurebeHoldeGridOptions.data){
                        $scope.listOptions[$scope.numBer].insurebeHoldeGridOptions.data=new Array();
                    }
                    var temp=true;
                    for(var k=0;k<$scope.listOptions[$scope.numBer].insurebeHoldeGridOptions.data.length;k++){
                        if($scope.listOptions[$scope.numBer].insurebeHoldeGridOptions.data[k].BEHOLDER_ID==BEHOLDER.BEHOLDER_ID){
                            temp=false;
                        }
                    }
                    if(temp){
                        $scope.listOptions[$scope.numBer].insurebeHoldeGridOptions.data.push(BEHOLDER);
                    }
                }else {
                    if (j==0&&rows.length==1&&(null==$scope.listOptions[$scope.numBer].insureCompanyGridOptions.data||$scope.listOptions[$scope.numBer].insureCompanyGridOptions.data.length==0)){
                        var insureCompany ={
                            insureCompanyId:rows[j].pk,
                            insureCompanyName:rows[j].name,
                            underwritingRatio:100
                        };
                    }else {
                        if(null!=$scope.listOptions[$scope.numBer].insureCompanyGridOptions.data&&$scope.listOptions[$scope.numBer].insureCompanyGridOptions.data.length==1){
                            $scope.listOptions[$scope.numBer].insureCompanyGridOptions.data[0].underwritingRatio=0;
                        }
                        var insureCompany ={
                            insureCompanyId:rows[j].pk,
                            insureCompanyName:rows[j].name,
                            underwritingRatio:0
                        };
                    }
                    if (null==$scope.listOptions[$scope.numBer].insureCompanyGridOptions.data){
                        $scope.listOptions[$scope.numBer].insureCompanyGridOptions.data=new Array();
                    }
                    var temp=true;
                    for(var k=0;k<$scope.listOptions[$scope.numBer].insureCompanyGridOptions.data.length;k++){
                        if($scope.listOptions[$scope.numBer].insureCompanyGridOptions.data[k].insureCompanyId==insureCompany.insureCompanyId){
                            temp=false;
                        }
                    }
                    if(temp){
                        $scope.listOptions[$scope.numBer].insureCompanyGridOptions.data.push(insureCompany);
                    }
                }

            }
            ngDialog.close();
            
            var gdzc;
            for(var gd=0;gd<$scope.listOptions[$scope.numBer].insuranceItemsOptions.data.length;gd++){
                if($scope.listOptions[$scope.numBer].insuranceItemsOptions.data[gd].assetscode=='gdzc'){
                    gdzc=$scope.listOptions[$scope.numBer].insuranceItemsOptions.data[gd];
                }
            }
            if(null!=gdzc){
                var data ={"id":gdzc.id,"insurebeHolde":$scope.listOptions[$scope.numBer].insurebeHoldeGridOptions.data};
                $scope.changeInsurebeHolde(data,$scope.numBer);
            }
        };
        $scope.onCancel = function () {
            ngDialog.close();
        };
    };
    $scope.initData();
    $scope.initFunction();
    $scope.queryForGridChildren($scope.QUERYCHILDREN);
});