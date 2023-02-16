'use strict';

app.config(['$stateProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider', 'JS_REQUIRES',
    function ($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, jsRequires) {
        app.controller = $controllerProvider.register;
        app.directive = $compileProvider.directive;
        app.filter = $filterProvider.register;
        app.factory = $provide.factory;
        app.service = $provide.service;
        app.constant = $provide.constant;
        app.value = $provide.value;

        // LAZY MODULES
        $ocLazyLoadProvider.config({
            debug: false,
            events: true,
            modules: jsRequires.modules
        });

        // APPLICATION ROUTES
        // -----------------------------------
        // For any unmatched url, redirect to /app/dashboard
        $urlRouterProvider.otherwise("/login/signin");

        //
        // Set up the states
        $stateProvider.state('app', {
            url: "/app",
            controller: 'navCtrl',
            templateUrl: getURL("nav/app.html"),
            //
            // resolve: loadSequence('navCtrl', 'modernizr', 'moment', 'angularMoment', 'uiSwitch', 'perfect-scrollbar-plugin', 'submitDialogCtrl','baseController'),
            resolve: {
                deps: ['uiLoad',
                    function (uiLoad) {
                        return uiLoad.load(['nav/navCtrl.js']);
                    }]
            },
            abstract: true
        }).state('app.dashboard', {
            url: "/dashboard",
            templateUrl: getURL('../nav/dashboard.html'),

            ncyBreadcrumb: {
                label: '桌面'
            },
            resolve: {
                deps: ['uiLoad',
                    function (uiLoad) {
                        return uiLoad.load(['nav/dashboardCtrl.js',
                            'bsm/projectApply/projectApplyCtrl.js',
                            'bsm/agreement/agreementCtrl.js',
                            'bsm/contract/contractCtrl.js',
                            'bsm/clearing/clearingCtrl.js',
                            'bsm/acceptance/acceptanceCtrl.js',
                            'bsm/agreement/agreementCtrl.js',
                            'bsm/projectChange/projectChangeCtrl.js',
                            'bsm/frameworkApply/frameworkApplyCtrl.js',
                            'common/workflow/submitDialogCtrl.js',
                            'bsm/common/projectInfoCtrl.js',
                            'bsm/stepInfo/stepInfoCtrl.js']);
                    }]
            },
            data: {
                requireLogin: true
            }
        })
            // Login routes
            .state('login', {
                url: '/login',
                template: '<div ui-view class="fade-in-right-big smooth"></div>',
                abstract: true
            })
            .state('login.signin', {
                url: '/signin',
                templateUrl: getURL("login/login.html"),
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['login/loginCtrl.js',
                                'common/view/updatePasswordCtrl.js']);
                        }]
                }
            })

            .state('app.corp', {
                url: '/corp',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '机构信息'
                }
            })
            .state('app.corp.dept', {
                url: '/dept',
                templateUrl: getURL('system/dept/dept.html'),
                ncyBreadcrumb: {
                    label: '用户管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('system/dept/deptCtrl.js');
                        }]
                }
            })
            .state('app.userManage', {
                url: '/userManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '用户管理'
                }
            })
            //用户
            .state('app.userManage.user', {
                url: '/user',
                templateUrl: getURL('system/user/view/user.html'),
                ncyBreadcrumb: {
                    label: '用户管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('system/user/controller/userCtrl.js');
                        }]
                }
            })
            //外部用户管理
            .state('app.userManage.externalUser', {
                url: '/externalUser',
                templateUrl: getURL('system/externalUser/externalUser.html'),
                ncyBreadcrumb: {
                    label: '外部用户管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('system/externalUser/externalUserCtrl.js');
                        }]
                }
            })
            //在线用户
            .state('app.userManage.onlineUser', {
                url: '/onlineUser',
                templateUrl: getURL('system/onlineUser/onlineUser.html'),
                ncyBreadcrumb: {
                    label: '在线用户'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('system/onlineUser/onlineUserCtrl.js');
                        }]
                }
            })
            .state('app.rightManage', {
                url: '/rightManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '权限管理'
                }
            })
            //角色管理
            .state('app.rightManage.group', {
                url: '/group',
                templateUrl: getURL('../system/group/view/group.html'),
                ncyBreadcrumb: {
                    label: '角色管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('../system/group/controller/groupCtrl.js');
                        }]
                }
            })
            .state('app.rightManage.menu', {
                url: '/menu',
                templateUrl: getURL('system/menu/view/menu.html'),
                ncyBreadcrumb: {
                    label: '节点管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('system/menu/controller/menuCtrl.js');
                        }]
                }
            })
            .state('app.config', {
                url: '/config',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '系统设置'
                }
            })
            .state('app.config.setting', {
                url: '/setting',
                templateUrl: getURL('system/setting/setting.html'),
                ncyBreadcrumb: {
                    label: '系统配置'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('system/setting/settingCtrl.js');
                        }]
                }
            })
            .state('app.logManager', {
                url: '/logManager',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '日志管理'
                }
            })
            .state('app.logManager.log', {
                url: '/log',
                templateUrl: getURL('system/logManager/logManager.html'),
                ncyBreadcrumb: {
                    label: '系统日志'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('system/logManager/logManagerCtrl.js');
                        }]
                }
            })

            .state('app.flowManger', {
                url: '/flowManger',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '流程设置'
                }
            })
            .state('app.flowManger.flow', {
                url: '/flow',
                templateUrl: getURL('system/flow/flow.html'),
                ncyBreadcrumb: {
                    label: '流程设置'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('system/flow/flowCtrl.js');
                        }]
                }
            })


            .state('app.bsm', {
                url: '/bsm',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '项目申报'
                }
            })
            .state('app.bsm.projectApply', {
                url: '/apply',
                params: {"pk": null},
                templateUrl: getURL('bsm/projectApply/projectApply.html'),
                ncyBreadcrumb: {
                    label: '项目申报'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['bsm/projectApply/projectApplyCtrl.js',
                                'common/view/inputFileUploader.js',
                                'common/workflow/submitDialogCtrl.js',
                            'bsm/frameworkApply/frameworkApplyCtrl.js']);
                        }]
                }
            })
            .state('app.bsm.projectExamines', {
                url: '/projectExamines',
                templateUrl: getURL('bsm/projectExamines/projectExamines.html'),
                ncyBreadcrumb: {
                    label: '专业评审'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['bsm/projectExamines/projectExaminesCtrl.js',
                                'bsm/projectExamines/dialog/examinieDialogCtrl.js',
                                'common/view/inputFileUploader.js',
                                'bsm/common/projectInfoCtrl.js']);
                        }]
                }
            })
            .state('app.bsm.projectReview', {
                url: '/projectReview',
                templateUrl: getURL('bsm/projectReview/projectReview.html'),
                ncyBreadcrumb: {
                    label: '立项评审'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['bsm/projectReview/projectReviewCtrl.js',
                                'bsm/projectReview/dialog/replyDialogCtrl.js',
                                'common/view/inputFileUploader.js',
                                'bsm/common/projectInfoCtrl.js']);
                        }]
                }
            })

            .state('app.bsm.projectReply', {
                url: '/projectReply',
                templateUrl: getURL('bsm/projectReply/projectReply.html'),
                ncyBreadcrumb: {
                    label: '立项批复'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['bsm/projectReply/projectReplyCtrl.js',
                                'common/view/inputFileUploader.js',
                                'bsm/projectReply/dialog/projectDialogCtrl.js']);
                        }]
                }
            })
            .state('app.bsm.projectChange', {
                url: '/projectChange',
                templateUrl: getURL('bsm/projectChange/projectChange.html'),
                ncyBreadcrumb: {
                    label: '项目变更'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['bsm/projectChange/projectChangeCtrl.js',
                                'common/view/inputFileUploader.js',
                                'bsm/common/projectInfoCtrl.js',
                                'common/workflow/submitDialogCtrl.js']);
                        }]
                }
            })
            .state('app.bsm.frameworkApply', {
                url: '/frameworkApply',
                templateUrl: getURL('bsm/frameworkApply/frameworkApply.html'),
                ncyBreadcrumb: {
                    label: '框架项目采购申请'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['bsm/frameworkApply/frameworkApplyCtrl.js',
                                'common/view/inputFileUploader.js',
                                'common/workflow/submitDialogCtrl.js']);
                        }]
                }
            })
            .state('app.bsm.contract', {
                url: '/contract',
                templateUrl: getURL('bsm/contract/contract.html'),
                ncyBreadcrumb: {
                    label: '合同信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['bsm/contract/contractCtrl.js',
                                'common/view/inputFileUploader.js',
                                'common/workflow/submitDialogCtrl.js']);
                        }]
                }
            })
            .state('app.bsm.agreement', {
                url: '/agreement',
                templateUrl: getURL('bsm/agreement/agreement.html'),
                ncyBreadcrumb: {
                    label: '协议管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['bsm/agreement/agreementCtrl.js',
                                'common/view/inputFileUploader.js',
                                'common/workflow/submitDialogCtrl.js',
                                'common/workflow/submitDialogCtrl.js']);
                        }]
                }
            })
            .state('app.bsm.clearing', {
                url: '/clearing',
                templateUrl: getURL('bsm/clearing/clearing.html'),
                ncyBreadcrumb: {
                    label: '结算信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['bsm/clearing/clearingCtrl.js',
                                'bsm/clearing/dialog/paymentDialogCtrl.js',
                                'common/view/inputFileUploader.js',
                                'common/workflow/submitDialogCtrl.js']);
                        }]
                }
            })
            .state('app.bsm.acceptance', {
                url: '/acceptance',
                templateUrl: getURL('bsm/acceptance/acceptance.html'),
                ncyBreadcrumb: {
                    label: '合同信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['bsm/acceptance/acceptanceCtrl.js',
                                'common/view/inputFileUploader.js',
                                'common/workflow/submitDialogCtrl.js']);
                        }]
                }
            })
            .state('app.bsm.detail', {
                url: '/detail',
                templateUrl: getURL('bsm/detail/detail.html'),
                ncyBreadcrumb: {
                    label: '数据查询'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['bsm/detail/detailCtrl.js','bsm/contract/contractCtrl.js']);
                        }]
                }
            })

            .state('app.bsm.stepDetail', {
                url: '/stepDetail',
                templateUrl: getURL('bsm/stepDetail/stepDetail.html'),
                ncyBreadcrumb: {
                    label: '季度执行情况'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['bsm/stepDetail/stepDetailCtrl.js',
                                'common/workflow/submitDialogCtrl.js']);
                        }]
                }
            })
            .state('app.bsm.stepInfo', {
                url: '/stepInfo',
                templateUrl: getURL('bsm/stepInfo/stepInfo.html'),
                ncyBreadcrumb: {
                    label: '季度执行情况'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['bsm/stepInfo/stepInfoCtrl.js']);
                        }]
                }
            })
            .state('app.bsm.help', {
                url: '/help',
                templateUrl: getURL('bsm/help/help.html'),
                ncyBreadcrumb: {
                    label: '帮助中心'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['bsm/help/helpCtrl.js']);
                        }]
                }
            })
            .state('app.bsm.download', {
                url: '/download',
                templateUrl: getURL('bsm/download/download.html'),
                ncyBreadcrumb: {
                    label: '下载中心'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['bsm/download/downloadCtrl.js']);
                        }]
                }
            })
        // Generates a resolve object previously configured in constant.JS_REQUIRES (config.constant.js)
        function loadSequence() {
            var _args = arguments;
            return {
                deps: ['$ocLazyLoad', '$q',
                    function ($ocLL, $q) {
                        var promise = $q.when(1);
                        for (var i = 0, len = _args.length; i < len; i++) {
                            promise = promiseThen(_args[i]);
                        }
                        return promise;

                        function promiseThen(_arg) {
                            if (typeof _arg == 'function')
                                return promise.then(_arg);
                            else
                                return promise.then(function () {
                                    var nowLoad = requiredData(_arg);
                                    if (!nowLoad)
                                        return $.error('Route resolve: Bad resource name [' + _arg + ']');
                                    return $ocLL.load(nowLoad);
                                });
                        }

                        function requiredData(name) {
                            if (jsRequires.modules)
                                for (var m in jsRequires.modules)
                                    if (jsRequires.modules[m].name && jsRequires.modules[m].name === name)
                                        return jsRequires.modules[m];
                            return jsRequires.scripts && jsRequires.scripts[name];
                        }
                    }]
            };
        }
    }])
;