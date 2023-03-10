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
            name: '保险经纪', // name of your project
            author: '北京立融软件有限公司', // author's name or company name
            description: '业务管理系统', // brief description
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
    //    业管
        $rootScope.viewClause = function (gridApi, file) {
            var rows = gridApi.selection.getSelectedRows();
            if (!rows || rows.length != 1) return layer.alert("请选择一条单据进行查看!", {skin: 'layui-layer-lan', closeBtn: 1});
            signModal.open({
                param: {"object": rows[0]},
            })

        }

        $rootScope.chinaCost = function (input) {
            var numberValue = String(Math.round(input * 100)); // 数字金额
            var chineseValue = ""; // 转换后的汉字金额
            var String1 = "零壹贰叁肆伍陆柒捌玖"; // 汉字数字
            var String2 = "万仟佰拾亿仟佰拾万仟佰拾元角分"; // 对应单位
            var len = numberValue.length; // numberValue 的字符串长度
            var Ch1; // 数字的汉语读法
            var Ch2; // 数字位的汉字读法
            var nZero = 0; // 用来计算连续的零值的个数
            var String3; // 指定位置的数值
            if (len > 15) {
                alert("超出计算范围");
                return "";
            }
            if (numberValue == 0) {
                chineseValue = "零元整";
                return chineseValue;
            }

            String2 = String2.substr(String2.length - len, len); // 取出对应位数的STRING2的值
            for (var i = 0; i < len; i++) {
                String3 = parseInt(numberValue.substr(i, 1), 10); // 取出需转换的某一位的值
                if (i != (len - 3) && i != (len - 7) && i != (len - 11) && i != (len - 15)) {
                    if (String3 == 0) {
                        Ch1 = "";
                        Ch2 = "";
                        nZero = nZero + 1;
                    } else if (String3 != 0 && nZero != 0) {
                        Ch1 = "零" + String1.substr(String3, 1);
                        Ch2 = String2.substr(i, 1);
                        nZero = 0;
                    } else {
                        Ch1 = String1.substr(String3, 1);
                        Ch2 = String2.substr(i, 1);
                        nZero = 0;
                    }
                } else { // 该位是万亿，亿，万，元位等关键位
                    if (String3 != 0 && nZero != 0) {
                        Ch1 = "零" + String1.substr(String3, 1);
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
                    if (i == (len - 11) || i == (len - 3)) { // 如果该位是亿位或元位，则必须写上
                        Ch2 = String2.substr(i, 1);
                    }
                }
                chineseValue = chineseValue + Ch1 + Ch2;
            }

            if (String3 == 0) { // 最后一位（分）为0时，加上“整”
                chineseValue = chineseValue + "整";
            }

            return chineseValue;
        };

        /**
         * 此公共函数用于动态判断列表页按钮是否可用
         * @param gridApi
         * @param statusName    gridApi的某个数据项
         * @param statusValue  与gridApi的某个数据项，比较的值（多个值，可用数组）
         * @param isSingle     决定可不可以选取多条行数据
         * @returns {boolean}  按钮是否可编辑的状态（true：不可编辑，false：可编辑）
         */
        $rootScope.checkStatus = function (gridApi, statusName, statusValue, isSingle) {

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

        /**
         * 此公共函数用于实现打印
         * @htmlPath 页面路径
         * @param statusName    gridApi的某个数据项
         * @param statusValue  与gridApi的某个数据项，比较的值（多个值，可用数组）
         * @param isSingle     决定可不可以选取多条行数据
         * @returns {boolean}  按钮是否可编辑的状态（true：不可编辑，false：可编辑）
         */
        $rootScope.onPublicPrint = function (gridApi, htmlPath, $scope) {
            if (gridApi) {
                var selectRows = gridApi.selection.getSelectedRows();
                if (!selectRows || selectRows.length > 1) {
                    return layer.alert("只能选择一条数据！", {skin: 'layui-layer-lan', closeBtn: 1});
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

        $rootScope.checkShow = function (gridApi, statusName, statusValue, isSingle) {

            //   默认的情况
            if (!gridApi) return false;                                                 //   gridApi为假，肯定直接按钮不可用
            if (isSingle === 'undefined' || isSingle === undefined) isSingle = false;   //   不填默认只能选取单行
            var rows = gridApi.selection.getSelectedRows();
            if (!rows || rows.length === 0) return false;                               //   所选行数为0，肯定直接按钮不可用

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

            //   statusName 与 statusValue没值，直接由isSingle决定
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
         * add前查看是否有暂存数据
         */
        $rootScope.onAddCheck = function ($scope) {
            // $http.post($rootScope.basePath + "temporary/queryForGrid").success(function (response) {
            //     if (response && response.code == "200") {
            //         layer.confirm('当前节点有暂存数据，是否使用？', {
            //             btn: ['确定','取消'] //按钮
            //         }, function(){
            //             angular.assignData($scope.VO, response.result);
            //             $scope.$apply();//需要手动刷新
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
                    // 根据scope的ID找到dom
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
            name: '保险经纪', // name of your project
            author: '北京立融软件有限公司', // author's name or company name
            description: '业务管理系统', // brief description
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
            $scope.comment = "必输项";
            return {};
        };
        //子表数据
        $scope.submitVO = $scope.initVO();
        var log = '';
        if ($scope.submitData.tasks && $scope.submitData.tasks.length > 0) {
            for (var i = 0; i < $scope.submitData.tasks.length; i++) {
                var task = $scope.submitData.tasks[i];
                if (task.pk_process && task.opinion) {
                    log = log + "审批人：" + task.pk_process.name + "\r\n";
                    log = log + "审批意见：" + task.opinion + "\r\n";
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
                //type==3 审核通过,现在有审核通过默认审核通过
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
         * 更新常用审批语
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
         * 保存
         */
        $scope.onSubmitConfirm = function () {
            // if($scope.isAudit){
            //     $scope.submitVO.rightSelects = [$scope.RIGHT_DATA[0]];
            // } else {
            //     $scope.submitVO.rightSelects = [$scope.LEFT_DATA[0]];
            // }
            if (!$scope.submitVO.msg && $scope.comment != "") {
                return layer.alert('请填写审批意见!', {skin: 'layui-layer-lan', closeBtn: 1});
            }
            if (!$scope.submitVO.pass) return layer.alert('请选择处理方式!', {skin: 'layui-layer-lan', closeBtn: 1});
            if ($scope.submitVO.pass.indexOf("_pass") >= 0 && ($scope.RIGHT_DATA == null || $scope.RIGHT_DATA.length != 1)) {
                return layer.alert('只能选择一个用户进行提交!', {skin: 'layui-layer-lan', closeBtn: 1});
            }
            //更新常用审批语
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
         * 由项目经理 带出其部门名称
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
                return layer.alert("请选择一个用户!", {skin: 'layui-layer-lan', closeBtn: 1});
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
                return layer.alert("请选择一个用户!", {skin: 'layui-layer-lan', closeBtn: 1});
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
                {name: 'task_id', displayName: '流程号', width: 100},
                {name: 'operate_name', displayName: '操作人', width: 100, cellTooltip: true, headerTooltip: true},
                {name: 'pk_submitter.name', displayName: '提交人', width: 100, cellTooltip: true, headerTooltip: true},
                {name: 'submit_time', displayName: '提交时间', width: 150},
                {name: 'pk_process.name', displayName: '处理人', width: 100, cellTooltip: true, headerTooltip: true},
                {name: 'result', displayName: '审批结果', width: 100, cellTooltip: true, headerTooltip: true},
                {name: 'opinion', displayName: '审批意见', width: 100, cellTooltip: true, headerTooltip: true},
                {name: 'process_time', displayName: '处理时间', width: 150},
                {name: 'process_status', displayName: '处理状态', cellFilter: 'SELECT_WORKFLOW_PROCESS_STATUS', width: 100},
                {name: 'durationLabel', displayName: '持续时间', width: 100}
            ],
            data: $scope.tasks,
            onRegisterApi: function (gridApi) {
                $scope.linkAuditFlowGridOptions.gridApi = gridApi;
            }
        };
    };
    $scope.initFunction = function () {
        /**
         * 保存
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


