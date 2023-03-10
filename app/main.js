var app = angular.module('lrApp', [
    "ui.router",
    'ui.grid',
    'ui.grid.pagination',
    'ui.grid.selection',
    'ui.grid.edit',
    'ui.grid.cellNav',
    'ui.grid.resizeColumns',
    'ui.grid.autoResize',
    'ui.grid.exporter',
    'ui.grid.treeView',
    'ui.grid.importer',
    'ui.grid.moveColumns',
    'ui.grid.pinning',
    'ui.bootstrap',
    'ngDialog',
    'uiCompile',
    'uiFormat',
    'pascalprecht.translate',
    'oc.lazyLoad',
    'uiPopup',
    'ngVerify',
    'ui.select',
    'datetimepicker',
    'ui.load',
    'angularFileUpload',
    'moment-picker',
    'angularMoment',
    'uiSwitch',
    'angularBootstrapNavTree'
]);
// var baseUrl = serverApi;
var fun_code = "";
var previewPath = previewPath;
var version = new Date().getTime();
var baseUrl = htdocs;
var archivesPath = archivesPath;
var localizedPath = localizedPath;


function getURL(url) {
    return "../" + url + "?" + version;
}
function getImgURL(url) {
    return baseUrl + url;
}

app.run(['$rootScope', '$state', '$stateParams', '$location', '$http', '$compile', 'ngDialog', '$window',
    function ($rootScope, $state, $stateParams, $location, $http, $compile, ngDialog, $window) {
        serverApi = $location.protocol() + "://" + $location.host() + ":8080/";
        baseUrl = serverApi;
        // $rootScope.basePath = serverApi;
        $rootScope.basePath = serverApi + '/insurance/';
        // $rootScope.localizedPath = serverApi;
        $rootScope.localizedPath = localizedPath + '/insurance/';
        $rootScope.previewPath = previewPath;

        $rootScope.getURL = function (url) {
            return getURL(url);
        };
        $rootScope.autoHeight = function (event) {
            var elem = getScope(event.$id);
            var autoheight = event.windowHeight - elem.firstElementChild.clientHeight - elem.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.firstElementChild.clientHeight - 400;
            return 'height:' + autoheight + 'px';
        }
        function getScope(id) {
            var elem;
            $('.ng-scope').each(function () {
                var s = angular.element(this).scope(),
                    sid = s.$id;
                if (sid == id) {
                    elem = this;
                    return false; // stop looking at the rest
                }
            });
            return elem;
        }
        $rootScope.returnSystem = function () {
            $window.history.go(-1);
        };
        $rootScope.returnSelectName = function (id, select) {
            var name = "";
            var arr = $rootScope.SELECT[select];
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].id === id) {
                    name = arr[i].name;
                }
            }
            return name;
        };
        FastClick.attach(document.body);
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        // GLOBAL APP SCOPE
        // set below basic information
        $rootScope.app = {
            name: '????????????', // name of your project
            author: '??????????????????????????????', // author's name or company name
            description: '??????????????????', // brief description
            version: '2.0', // current version
            year: ((new Date()).getFullYear()), // automatic current year (for copyright information)
            isMobile: (function () {// true if the browser is a mobile device
                var check = false;
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    check = true;
                }

                return check;
            })(),
            layout: {
                isNavbarFixed: true, //true if you want to initialize the template with fixed header
                isSidebarFixed: true, // true if you want to initialize the template with fixed sidebar
                isSidebarClosed: true, // true if you want to initialize the template with closed sidebar
                isFooterFixed: true, // true if you want to initialize the template with fixed footer
                theme: 'theme-lr', // indicate the theme chosen for your project
                logo: 'img/logo.png', // relative path of the project logo
            }
        };
        $rootScope.isAdmin = false;
        $rootScope.userVO = {};
        $rootScope.orgVO = {};
        $rootScope.deptVO = {};
        $rootScope.workDate = "";
        $rootScope.currentTabs = [];
        $rootScope.show = function (id, url, name) {

            var tab = {name: name, active: true, id: id, url: url, billId: ''};
            var isExsit = false;
            if ($rootScope.currentTabs == null) {
                $rootScope.currentTabs = [];
            }
            angular.forEach($rootScope.currentTabs, function (item, index) {
                if (url == item.url) {
                    item.active = true;
                    tab.billId = item.billId;
                    isExsit = true;
                } else {
                    item.active = false;
                }
            });
            if (!isExsit) {
                $rootScope.currentTabs.push(tab);
            }
            $rootScope.openMenu(url, tab.billId);
        };
        $rootScope.openMenu = function (url, id) {
            // if (isExsit) {
            //     return;
            // }
            if (id) {
                $state.go(url, {'pk': id});
            } else {
                $state.go(url);
            }

        };
        $rootScope.closeMenuTabs = function (item) {
            var tabs = [];
            if ($rootScope.currentTabs.length == 1) {
                return;
            }
            for (let i = 0; i < $rootScope.currentTabs.length; i++) {
                if (item.id != $rootScope.currentTabs[i].id) {
                    tabs.push($rootScope.currentTabs[i]);
                }
            }
            var size = tabs.length - 1;
            tabs[size].active = true;
            $rootScope.currentTabs = tabs;
            $rootScope.openMenu(tabs[size].url, tabs[size].billId);
        };
    //    ??????
        $rootScope.viewClause = function (gridApi, file) {
            var rows = gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("?????????????????????????????????!", {skin: 'layui-layer-lan', closeBtn: 1});
            signModal.open({
                param: {"object": rows[0]},
            })

        }

        $rootScope.chinaCost = function (input) {
            var numberValue = String(Math.round(input * 100)); // ????????????
            var chineseValue = ""; // ????????????????????????
            var String1 = "??????????????????????????????"; // ????????????
            var String2 = "?????????????????????????????????????????????"; // ????????????
            var len = numberValue.length; // numberValue ??????????????????
            var Ch1; // ?????????????????????
            var Ch2; // ????????????????????????
            var nZero = 0; // ????????????????????????????????????
            var String3; // ?????????????????????
            if (len > 15) {
                alert("??????????????????");
                return "";
            }
            if (numberValue == 0) {
                chineseValue = "?????????";
                return chineseValue;
            }

            String2 = String2.substr(String2.length - len, len); // ?????????????????????STRING2??????
            for (var i = 0; i < len; i++) {
                String3 = parseInt(numberValue.substr(i, 1), 10); // ?????????????????????????????????
                if (i != (len - 3) && i != (len - 7) && i != (len - 11) && i != (len - 15)) {
                    if (String3 == 0) {
                        Ch1 = "";
                        Ch2 = "";
                        nZero = nZero + 1;
                    } else if (String3 != 0 && nZero != 0) {
                        Ch1 = "???" + String1.substr(String3, 1);
                        Ch2 = String2.substr(i, 1);
                        nZero = 0;
                    } else {
                        Ch1 = String1.substr(String3, 1);
                        Ch2 = String2.substr(i, 1);
                        nZero = 0;
                    }
                } else { // ????????????????????????????????????????????????
                    if (String3 != 0 && nZero != 0) {
                        Ch1 = "???" + String1.substr(String3, 1);
                        Ch2 = String2.substr(i, 1);
                        nZero = 0;
                    } else if (String3 != 0 && nZero == 0) {
                        Ch1 = String1.substr(String3, 1);
                        Ch2 = String2.substr(i, 1);
                        nZero = 0;
                    } else if (String3 == 0 && nZero >= 3) {
                        Ch1 = "";
                        Ch2 = "";
                        nZero = nZero + 1;
                    } else {
                        Ch1 = "";
                        Ch2 = String2.substr(i, 1);
                        nZero = nZero + 1;
                    }
                    if (i == (len - 11) || i == (len - 3)) { // ????????????????????????????????????????????????
                        Ch2 = String2.substr(i, 1);
                    }
                }
                chineseValue = chineseValue + Ch1 + Ch2;
            }

            if (String3 == 0) { // ????????????????????????0?????????????????????
                chineseValue = chineseValue + "???";
            }

            return chineseValue;
        };

        /**
         * ????????????????????????????????????????????????????????????
         * @param gridApi
         * @param statusName    gridApi??????????????????
         * @param statusValue  ???gridApi???????????????????????????????????????????????????????????????
         * @param isSingle     ???????????????????????????????????????
         * @returns {boolean}  ?????????????????????????????????true??????????????????false???????????????
         */
        $rootScope.checkStatus = function (gridApi, statusName, statusValue, isSingle) {

            //   ???????????????
            if (!gridApi) return true;                                                 //   gridApi????????????????????????????????????
            if (isSingle === 'undefined' || isSingle === undefined) isSingle = true;   //   ??????????????????????????????
            var rows = gridApi.selection.getSelectedRows();
            if (!rows || rows.length === 0) return true;                               //   ???????????????0??????????????????????????????

            //  isSingle,??????????????????????????????
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
                    //@zhangwj ???YDBXJJ-1905???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? update line 175-196
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

            //   statusName ??? statusValue??????????????????isSingle??????
            return false;
        };

        /**
         * ?????????????????????????????????
         * @htmlPath ????????????
         * @param statusName    gridApi??????????????????
         * @param statusValue  ???gridApi???????????????????????????????????????????????????????????????
         * @param isSingle     ???????????????????????????????????????
         * @returns {boolean}  ?????????????????????????????????true??????????????????false???????????????
         */
        $rootScope.onPublicPrint = function (gridApi, htmlPath, $scope) {
            if (gridApi) {
                var selectRows = gridApi.selection.getSelectedRows();
                if (!selectRows || selectRows.length > 1) {
                    return layer.alert("???????????????????????????", {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }

            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: htmlPath,
                className: 'ngdialog-theme-formInfo',
                scope: $scope,
                controller: function ($scope, $timeout) {
                    if (gridApi) {
                        $scope.rows = gridApi.selection.getSelectedRows();
                    }
                    $scope.print = function () {
                        var winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
                        var linkTag = winPrint.document.createElement('link');
                        linkTag.setAttribute('rel', 'stylesheet');
                        linkTag.setAttribute('media', 'all');
                        linkTag.setAttribute('type', 'text/css');
                        var winPrintHead = winPrint.document.getElementsByTagName('head')[0];
                        linkTag.href = $rootScope.basePath + 'css/public.css';
                        winPrintHead.appendChild(linkTag);
                        winPrint.document.body.innerHTML = document.getElementById('printMonReport').innerHTML;
                        winPrint.focus();
                        $timeout(function () {
                            winPrint.window.print();
                            winPrint.close;
                        }, 300);
                    }

                },
                preCloseCallback: function (value) {
                    if (value && value == "clear") {
                        //??????
                        return false;
                    }
                    //??????
                    return true;
                }
            }).then(function (value) {
            }, function (reason) {
            });
        };

        $rootScope.checkShow = function (gridApi, statusName, statusValue, isSingle) {

            //   ???????????????
            if (!gridApi) return false;                                                 //   gridApi????????????????????????????????????
            if (isSingle === 'undefined' || isSingle === undefined) isSingle = false;   //   ??????????????????????????????
            var rows = gridApi.selection.getSelectedRows();
            if (!rows || rows.length === 0) return false;                               //   ???????????????0??????????????????????????????

            //  isSingle,??????????????????????????????
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
                    var i = 0;
                    if (statusValue instanceof Array) {
                        for (i = 0; i < rows.length; i++) {
                            for (j = 0; j < statusValue.length; j++) {
                                if (statusValue[j] == rows[0][statusName]) {
                                    return true;
                                }
                            }
                        }
                    }
                    for (i = 0; i < rows.length; i++) {
                        if (rows[i][statusName] != statusValue) {
                            return false;
                        }
                    }
                }
            }

            //   statusName ??? statusValue??????????????????isSingle??????
            return true;
        };
        $rootScope.autoHeight = function (event) {
            var elem = getScope(event.$id);
            var autoheight = event.windowHeight - elem.firstElementChild.clientHeight - elem.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.firstElementChild.clientHeight - 400;
            return 'height:' + autoheight + 'px';
        }

        function getScope(id) {
            var elem;
            $('.ng-scope').each(function () {
                var s = angular.element(this).scope(),
                    sid = s.$id;
                if (sid == id) {
                    elem = this;
                    return false; // stop looking at the rest
                }
            });
            return elem;
        }

        $rootScope.returnSystem = function () {
            $window.history.go(-1);
        };
        $rootScope.returnSelectName = function (id, select) {
            var name = "";
            var arr = $rootScope.SELECT[select];
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].id === id) {
                    name = arr[i].name;
                }
            }
            return name;
        };

        /**
         * add??????????????????????????????
         */
        $rootScope.onAddCheck = function ($scope) {
            // $http.post($rootScope.basePath + "temporary/queryForGrid").success(function (response) {
            //     if (response && response.code == "200") {
            //         layer.confirm('?????????????????????????????????????????????', {
            //             btn: ['??????','??????'] //??????
            //         }, function(){
            //             angular.assignData($scope.VO, response.result);
            //             $scope.$apply();//??????????????????
            //             layer.closeAll();
            //         });
            //         }
            //
            // });
        }

        $rootScope.diffarray = function (newValue, oldValue) {
            if (!newValue || !oldValue || newValue.length != oldValue.length || newValue.length == 0) {
                return undefined;
            }
            for (var i = 0; i < newValue.length; i++) {
                for (x in newValue[i]) {
                    if (x == '$$hashKey') continue;
                    if (JSON.stringify(newValue[i][x]) != JSON.stringify(oldValue[i][x])) {
                        return {row: newValue[i], col: x, newValue: newValue[i][x], oldValue: oldValue[i][x]};
                    }
                }
            }
            return undefined;
        }

        $rootScope.arrayToTree = function (array) {
            if (array) {
                for (var i = 0; i < array.length; i++) {
                    array[i].parentId = 0;
                    array[i].label = array[i].name;
                    array[i].children = [];
                }
            }
            return array;
        }

        $rootScope.btnPower = function (scope) {
            /*      $http.post($rootScope.basePath+"funcregister/getSessionParent").success(function (req) {
                    var elem = null;
                    // ??????scope???ID??????dom
                    $('.ng-scope').each(function(){
                      var s = angular.element(this).scope(),
                          sid = s.$id;
                      if(sid == scope.$id) {
                        elem = this;
                      }
                    });
                    // $(elem).append($compile(req.result)(scope));
                    $(elem).find(".btn-group").append($compile(req.result)(scope));
                  })*/
        }
        // Attach Fastclick for eliminating the 300ms delay between a physical tap and the firing of a click event on mobile browsers
        FastClick.attach(document.body);

        // Set some reference to access them from any scope
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;


        // GLOBAL APP SCOPE
        // set below basic information
        $rootScope.app = {
            name: '????????????', // name of your project
            author: '??????????????????????????????', // author's name or company name
            description: '??????????????????', // brief description
            version: '2.0', // current version
            year: ((new Date()).getFullYear()), // automatic current year (for copyright information)
            isMobile: (function () {// true if the browser is a mobile device
                var check = false;
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    check = true;
                }
                ;
                return check;
            })(),
            layout: {
                isNavbarFixed: true, //true if you want to initialize the template with fixed header
                isSidebarFixed: true, // true if you want to initialize the template with fixed sidebar
                isSidebarClosed: false, // true if you want to initialize the template with closed sidebar
                isFooterFixed: true, // true if you want to initialize the template with fixed footer
                theme: 'theme-lr', // indicate the theme chosen for your project
                logo: '../img/logo.png', // relative path of the project logo
            }
        };
        $rootScope.user = {
            name: 'Peter',
            job: 'ng-Dev',
            picture: 'app/img/user/02.jpg'
        };

        $http.post($rootScope.basePath + "account/getSession").success(function (response) {
            if (response.session != null) {
                window.sessionStorage.setItem("token", response.session);
                $rootScope.userVO = response.userVO;
                $rootScope.loginUser = $rootScope.userVO;
                $rootScope.orgVO = response.org;
                $rootScope.deptVO = response.dept;
                $rootScope.workDate = response.workDate;
                if (response.userVO.is_admin != 'N') {
                    $rootScope.isAdmin = true;
                } else {
                    $rootScope.isAdmin = false
                }
            } else if ($location.$$absUrl.includes("single")) {
                $location.path('/login/signLogin');
            } else {
                $location.path('/login/signin');
            }

        });

    }]);
app.directive('decimal', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {

            ngModel.$parsers.push(function (value) {
                return parseFloat('' + value);
            });
            ngModel.$formatters.push(function (value) {
                return parseFloat(parseFloat(value).toFixed(2));
            });
        }
    };
});
app.controller('submitCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
    $scope.initData = function () {
        $scope.initVO = function () {
            $scope.comment = "?????????";
            return {};
        };
        //????????????
        $scope.submitVO = $scope.initVO();
        var log = '';
        if ($scope.submitData.tasks && $scope.submitData.tasks.length > 0) {
            for (var i = 0; i < $scope.submitData.tasks.length; i++) {
                var task = $scope.submitData.tasks[i];
                if (task.pk_process && task.opinion) {
                    log = log + "????????????" + task.pk_process.name + "\r\n";
                    log = log + "???????????????" + task.opinion + "\r\n";
                    log = log + "----------------------------\r\n";
                }
            }
        }
        $scope.submitVO.log = log;
        $scope.LEFT_DATA = $scope.submitData.LeftData;
        $scope.RIGHT_DATA = $scope.submitData.RightData;
        $scope.PASSES = $scope.submitData.passes;
        if ($scope.PASSES && $scope.PASSES.length > 0) {
            for (var i = 0; i < $scope.PASSES.length; i++) {
                //type==3 ????????????,???????????????????????????????????????
                if ($scope.PASSES[i] && ($scope.PASSES[i].transitionType == 0 || $scope.PASSES[i].transitionType == 6 || $scope.PASSES[i].transitionType == 1 || $scope.PASSES[i].transitionType == 3)) {
                    $scope.submitVO.pass = $scope.PASSES[i].transitionCode;
                    if ($scope.PASSES[i].transitionType == 6) {
                        $scope.connmitDisable = true;
                        $scope.comment = "";
                    }
                    break;
                }
            }
        }
        $scope.submitView = true;
        if ($scope.submitData.type) {
            $scope.isAudit = true;
        } else {
            $scope.isAudit = false;
        }
    };
    $scope.initFunction = function () {
        /**
         * ?????????????????????
         */
        $scope.updateMsg = function () {
            layer.load(2);
            $http.post($scope.basePath + "workFlow/updateMsg", {
                id: "",
                funCode: $scope.funCode
            }).success(function (response) {
                $scope.submitVO.selects = angular.copy($scope.RIGHT_DATA);
                $scope.$parent.confirm($scope.submitVO);
                ngDialog.close();
            });
        };
        $scope.$watch('submitVO.selectMsg', function (newVal, oldVal) {
            if (null != $scope.submitVO.selectMsg) {
                $scope.submitVO.msg = $scope.submitVO.selectMsg[0];
            }
        }, true);
        /**
         * ??????
         */
        $scope.onSubmitConfirm = function () {
            // if($scope.isAudit){
            //     $scope.submitVO.rightSelects = [$scope.RIGHT_DATA[0]];
            // } else {
            //     $scope.submitVO.rightSelects = [$scope.LEFT_DATA[0]];
            // }
            if (!$scope.submitVO.msg && $scope.comment != "") {
                return layer.alert('?????????????????????!', {skin: 'layui-layer-lan', closeBtn: 1});
            }
            if (!$scope.submitVO.pass) return layer.alert('?????????????????????!', {skin: 'layui-layer-lan', closeBtn: 1});
            if ($scope.submitVO.pass.indexOf("_pass") >= 0 && ($scope.RIGHT_DATA == null || $scope.RIGHT_DATA.length != 1)) {
                return layer.alert('????????????????????????????????????!', {skin: 'layui-layer-lan', closeBtn: 1});
            }
            //?????????????????????
            $scope.updateMsg();
        };

        $scope.onSubmitCancel = function () {
            angular.assignData($scope.appVO, $scope.initVO());
            ngDialog.close();
            layer.closeAll('loading');
        };

        $scope.getSubmitView = function () {
            return $scope.submitVO.pass && ($scope.submitVO.pass.transitionType == 0 || $scope.submitVO.pass.transitionType == 6 || $scope.PASSES[i].transitionType == 1);
        };

    };
    $scope.initWatch = function () {
        /**
         * ??????????????? ?????????????????????
         */
        $scope.$watch('submitVO.pass', function (newVal, oldVal) {
            if (newVal == undefined || newVal == null) return;
            if (!newVal) {
                $scope.submitView = false;
            } else {
                $scope.LEFT_DATA = $scope.submitData.userPassList && $scope.submitData.userPassList[newVal] && $scope.submitData.userPassList[newVal].LeftData;
                $scope.RIGHT_DATA = $scope.submitData.userPassList && $scope.submitData.userPassList[newVal] && $scope.submitData.userPassList[newVal].RightData;
                if ($scope.PASSES && $scope.PASSES.length > 0) {
                    for (var i = 0; i < $scope.PASSES.length; i++) {
                        if (newVal == $scope.PASSES[i].transitionCode) {
                            if ($scope.PASSES[i].transitionType == 0 || $scope.PASSES[i].transitionType == 6 || $scope.PASSES[i].transitionType == 1 || $scope.PASSES[i].transitionType == 4) {
                                $scope.submitView = true;
                            } else {
                                $scope.submitView = false;
                            }
                            break;
                        }
                    }
                }
            }
        });
    };
    $scope.initClick = function () {
        $scope.onToRight = function () {
            if (!$scope.submitVO.leftSelects || $scope.submitVO.leftSelects.length != 1) {
                return layer.alert("?????????????????????!", {skin: 'layui-layer-lan', closeBtn: 1});
            }
            ;
            var select = $scope.submitVO.leftSelects[0];
            for (var i = 0; i < $scope.LEFT_DATA.length; i++) {
                if (select == $scope.LEFT_DATA[i].pk) {
                    $scope.RIGHT_DATA.push($scope.LEFT_DATA[i]);
                    $scope.LEFT_DATA.splice(i, 1);
                    $scope.submitVO.leftSelects = [];
                    break;
                }
            }
        };
        $scope.onToRightAll = function () {
            if (!$scope.LEFT_DATA || $scope.LEFT_DATA.length == 0) {
                return;
            }
            ;
            for (var i = 0; i < $scope.LEFT_DATA.length; i++) {
                $scope.RIGHT_DATA.push($scope.LEFT_DATA[i]);
                $scope.LEFT_DATA.splice(i, 1);
            }
        };
        $scope.onToLeft = function () {
            if (!$scope.submitVO.rightSelects || $scope.submitVO.rightSelects.length != 1) {
                return layer.alert("?????????????????????!", {skin: 'layui-layer-lan', closeBtn: 1});
            }
            ;
            var select = $scope.submitVO.rightSelects[0];
            for (var i = 0; i < $scope.RIGHT_DATA.length; i++) {
                if (select == $scope.RIGHT_DATA[i].pk) {
                    $scope.LEFT_DATA.push($scope.RIGHT_DATA[i]);
                    $scope.RIGHT_DATA.splice(i, 1);
                    $scope.submitVO.rightSelects = [];
                    break;
                }
            }
        };
        $scope.onToLeftAll = function () {
            if (!$scope.RIGHT_DATA || $scope.RIGHT_DATA.length == 0) {
                return;
            }
            ;
            for (var i = 0; i < $scope.RIGHT_DATA.length; i++) {
                $scope.LEFT_DATA.push($scope.RIGHT_DATA[i]);
                $scope.RIGHT_DATA.splice(i, 1);
            }
        };
    };

    $scope.initData();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initClick();
});
app.controller('linkAuditFlowCtril', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {

    $scope.initData = function () {
        // $scope.imgUrl = getURL("insurance/img/projectAppGroup.png");

    };
    $scope.initPage = function () {
        $scope.linkAuditFlowGridOptions = {
            // enableCellEdit: $scope.isEdit,
            enableRowSelection: true,
            enableSelectAll: true,
            multiSelect: true,
            enableSorting: true,
            enableRowHeaderSelection: true,
            showColumnFooter: false,
            columnDefs: [
                {name: 'task_id', displayName: '?????????', width: 100},
                {name: 'operate_name', displayName: '?????????', width: 100, cellTooltip: true, headerTooltip: true},
                {name: 'pk_submitter.name', displayName: '?????????', width: 100, cellTooltip: true, headerTooltip: true},
                {name: 'submit_time', displayName: '????????????', width: 150},
                {name: 'pk_process.name', displayName: '?????????', width: 100, cellTooltip: true, headerTooltip: true},
                {name: 'result', displayName: '????????????', width: 100, cellTooltip: true, headerTooltip: true},
                {name: 'opinion', displayName: '????????????', width: 100, cellTooltip: true, headerTooltip: true},
                {name: 'process_time', displayName: '????????????', width: 150},
                {name: 'process_status', displayName: '????????????', cellFilter: 'SELECT_WORKFLOW_PROCESS_STATUS', width: 100},
                {name: 'durationLabel', displayName: '????????????', width: 100}
            ],
            data: $scope.tasks,
            onRegisterApi: function (gridApi) {
                $scope.linkAuditFlowGridOptions.gridApi = gridApi;
            }
        };
    };
    $scope.initFunction = function () {
        /**
         * ??????
         */
        $scope.onSubmitConfirm = function () {
            $scope.$parent.confirm($scope.submitVO);
            ngDialog.close();
        };

        $scope.onSubmitCancel = function () {
            angular.assignData($scope.appVO, $scope.initVO());
            ngDialog.close();
        };

    };
    $scope.initData();
    $scope.initPage();
    $scope.initFunction();
});
app.controller('AppCtrl', ['$scope', '$http', '$rootScope', 'ngDialog', '$state', function ($scope, $http, $rootScope, ngDialog, $state) {
    $scope.logout = function () {
        $http.post($rootScope.basePath + "/account/clearSession").success(function (req) {
            window.sessionStorage.setItem("token", "");
            $state.go('login.signin');
        })
    };

}]);


