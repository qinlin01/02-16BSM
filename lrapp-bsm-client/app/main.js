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

// var imgUrl = serverApi.replace('\server', "")+htdocs;
var baseUrl = serverApi;
var fun_code = "";
var previewPath = previewPath;
// var baseUrl = "/";
var version = new Date().getTime();

function getURL(url) {
    return "../" + url + "?" + version;
}

function getImgURL(url) {
    return baseUrl + url;
}

app.run(['$rootScope', '$state', '$stateParams', '$location', '$http', '$compile', 'ngDialog', '$window',
    function ($rootScope, $state, $stateParams, $location, $http, $compile, ngDialog, $window) {
        //serverApi = $location.protocol() + "://" + $location.host() + ":" + $location.port() + "/";
        baseUrl = serverApi;

        $rootScope.basePath = serverApi;

        $rootScope.localizedPath = serverApi;
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

                return check;
            })(),
            layout: {
                isNavbarFixed: true, //true if you want to initialize the template with fixed header
                isSidebarFixed: true, // true if you want to initialize the template with fixed sidebar
                isSidebarClosed: false, // true if you want to initialize the template with closed sidebar
                isFooterFixed: false, // true if you want to initialize the template with fixed footer
                theme: 'theme-lr', // indicate the theme chosen for your project
                logo: 'img/logo.png', // relative path of the project logo
            }
        };
        $rootScope.isAdmin = false;
        $rootScope.userVO = {};
        $rootScope.orgVO = {};
        $rootScope.deptVO = {};
        $rootScope.workDate = "";
//         $http.post($rootScope.basePath + "sys/account/getSession").success(function (response) {
//             if (response.code != -1) {
// debugger;
//                 window.sessionStorage.setItem("token", response.data.session);
//                 $rootScope.userVO = response.data.userRef;
//                 $rootScope.orgVO = response.data.user.pkOrg;
//                 $rootScope.deptVO = response.data.user.pkDept;
//                 $rootScope.workDate = response.data.workDate;
//
//                 if (response.data.user.isAdmin != 'N') {
//                     $rootScope.isAdmin = true;
//                 } else {
//                     $rootScope.isAdmin = false
//                 }
//             } else if ($location.$$absUrl.includes("single")) {
//                 $location.path('/login/signLogin');
//             } else {
//                 $location.path('/login/signin');
//             }
//
//         });

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

    }]);


// app.controller('indexCtrl', ['$scope', '$http', '$rootScope', 'ngDialog', '$state', function ($scope, $http, $rootScope, ngDialog, $state) {
//     $scope.logout = function () {
//         $http.post($rootScope.basePath + "/account/clearSession").success(function (req) {
//             window.sessionStorage.setItem("token", "");
//             $state.go('login.signin');
//         })
//     };
//
// }]);

