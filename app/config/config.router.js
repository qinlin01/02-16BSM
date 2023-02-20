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
                        return uiLoad.load([
                            'nav/dashboardCtrl.js',
                            'common/workflow/submitDialogCtrl.js',
                           ]);
                    }]
            },
            data: {
                requireLogin: true
            }
        })
        .state('app.business', {
                url: "/business",
                templateUrl: getURL('mainView/businessStatistics/business.html'),
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['mainView/businessStatistics/businessCtrl.js']);
                        }]
                },
                ncyBreadcrumb: {
                    label: '常规审批事项'
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
        //    业管
        // .state('login', {
        //         url: '/login',
        //         template: '<div ui-view class="fade-in-right-big smooth"></div>',
        //         abstract: true
        //     }).state('login.signin', {
        //     url: '/signin',
        //     templateUrl: getURL("login/login.html"),
        //     resolve: loadSequence('loginCtrl'),
        // }).state('login.signLogin', {
        //     url: '/signLogin',
        //     templateUrl: getURL("login/signLogin.html"),
        //     resolve: loadSequence('signLoginCtrl'),
        // }).state('login.comptroller', {
        //     url: '/comptroller',
        //     templateUrl: getURL("login/comptroller.html"),
        //     resolve: loadSequence('loginCtrl'),
        // })
        //     .state('login.zongguan', {
        //         url: '/zongguan',
        //         templateUrl: getURL("../insurance/loginyeguan.html"),
        //         resolve: loadSequence('loginCtrl'),
        //     })
        //     .state('login.admin', {
        //         url: '/admin',
        //         templateUrl: getURL("../insurance/admin.html"),
        //         resolve: loadSequence('loginCtrl'),
        //     }).state('login.registration', {
        //     url: '/registration',
        //     templateUrl: getURL("../app/assets/views/login_registration.html")
        // }).state('login.lockscreen', {
        //     url: '/lock',
        //     templateUrl: getURL("../app/assets/views/login_lock_screen.html")
        // })
        //     .state('login.notfond', {
        //         url: '/notfond',
        //         templateUrl: getURL("../app/assets/views/utility_404.html")
        //     })
        //     .state('login.error', {
        //         url: '/error',
        //         templateUrl: getURL("../app/assets/views/utility_500.html")
        //     })
            .state('app.basicDoc', {
                url: '/basicDoc',
                template: '<div ui-view class="fade-in-right-big smooth"></div>',
                abstract: true
            }).state('app.basicDoc.product', {
            url: '/product',
            templateUrl: getURL('product/product.html'),
            resolve: loadSequence('productCtrl'),
        })
            .state('app.base', {
                url: '/base',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '基本信息管理'
                }
            })
            .state('app.base.customer', {
                url: '/customer',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '客户信息管理'
                }
            })
            .state('app.base.cooperator', {
                url: '/cooperator',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '合作单位信息管理'
                }
            })
            .state('app.base.license', {
                url: '/license',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '执业人员管理'
                }
            })
            .state('app.base.informationChange', {
                url: '/informationChange',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '信息变更管理'
                }
            })
            .state('app.base.business', {
                url: '/business',
                params: {"id": null},
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '模板管理'
                }
            })
            .state('app.base.userInfo', {
                url: '/userInfo',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '个人信息管理'
                }
            })
            .state('app.busManage', {
                url: '/busManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务信息管理'
                }
            })
            .state('app.comInfo', {
                url: '/comInfo',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '综合信息查询'
                }
            })
            /**
             * 咨询项目开始
             */
            .state('app.consultProject', {
                url: '/consultProject',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '咨询项目管理'
                }
            })
            .state('app.consultProject.consultApply', {
                url: '/consultApply',
                params: {"id": null},
                templateUrl: getURL('insurance/consultingProject/consultApply/consultApply.html'),
                ncyBreadcrumb: {
                    label: '项目申报'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/consultingProject/consultApply/consultApplyCtrl.js');
                        }]
                }
            })
            .state('app.consultProject.consultApproval', {
                url: '/consultApproval',
                params: {"id": null},
                templateUrl: getURL('insurance/consultingProject/consultApproval/consultApproval.html'),
                ncyBreadcrumb: {
                    label: '项目立项'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/consultingProject/consultApproval/consultApprovalCtrl.js');
                        }]
                }
            })
            .state('app.consultProject.consultRun', {
                url: '/consultRun',
                params: {"id": null},
                templateUrl: getURL('insurance/consultingProject/consultRun/consultRun.html'),
                ncyBreadcrumb: {
                    label: '项目实施'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/consultingProject/consultRun/consultRunCtrl.js');
                        }]
                }
            })
            .state('app.consultProject.consultComplete', {
                url: '/consultComplete',
                params: {"id": null},
                templateUrl: getURL('insurance/consultingProject/consultComplete/consultComplete.html'),
                ncyBreadcrumb: {
                    label: '项目验收'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/consultingProject/consultComplete/consultCompleteCtrl.js');
                        }]
                }
            })
            .state('app.consultProject.consultOut', {
                url: '/consultOut',
                params: {"id": null},
                templateUrl: getURL('insurance/consultingProject/consultOut/consultOut.html'),
                ncyBreadcrumb: {
                    label: '项目终止'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/consultingProject/consultOut/consultOutCtrl.js');
                        }]
                }
            })
            .state('app.consultProject.consultHelper', {
                url: '/consultHelper',
                params: {"id": null},
                templateUrl: getURL('insurance/consultingProject/consultHelper/consultHelper.html'),
                ncyBreadcrumb: {
                    label: '帮助中心'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/consultingProject/consultHelper/consultHelper.js');
                        }]
                }
            })
            .state('app.consultProject.consultResult', {
                url: '/consultResult',
                params: {"id": null},
                templateUrl: getURL('insurance/consultingProject/consultResult/consultResult.html'),
                ncyBreadcrumb: {
                    label: '查询台账'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/consultingProject/consultResult/consultResultCtrl.js');
                        }]
                }
            })
            //咨询项目结束
            .state('app.assBusManage', {
                url: '/assBusManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '公估业务管理'
                }
            })
            .state('app.assBusManage.employeeManage', {
                url: '/employeeManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '员工管理'
                }
            })
            .state('app.assBusManage.initProjectManage', {
                url: '/initProjectManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '立项管理'
                }
            })
            .state('app.assBusManage.initProjectManage.assessorsProject', {
                url: '/assessorsProject',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/busDevelop/busProject/assessorsProject/assessorsProject.html'),
                ncyBreadcrumb: {
                    label: '立项信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/busDevelop/busProject/assessorsProject/assessorsProjectCtrl.js');
                        }]
                }
            })
            .state('app.contManage', {
                url: '/contManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '经纪业务管理'
                }
            })
            .state('app.elife', {
                url: '/elife',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '互联网业务管理'
                }
            })
            //互联网保单信息
            // .state('app.elife.webInsurance', {
            //     url: '/webInsurance',
            //     template: '<div  ui-view style="height: 100%;"></div>',
            //     ncyBreadcrumb: {
            //         label: '对账单'
            //     }
            // })
            .state('app.elife.webInsurance', {
                url: '/webInsurance',
                params: {"id": null,"refArray":['PRODUCTTYPE']},
                templateUrl: getURL('insurance/elife/webInsurance/webInsurance.html'),
                ncyBreadcrumb: {
                    label: '对账单信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/elife/webInsurance/webInsuranceCtrl.js');
                        }]
                }
            })
            .state('app.elife.endorsementsConsolidation', {
                url: '/endorsementsConsolidation',
                params: {"id": null,"refArray":['PRODUCTTYPE']},
                templateUrl: getURL('insurance/elife/endorsementsConsolidation/endorsementsConsolidation.html'),
                ncyBreadcrumb: {
                    label: '批单对账单信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/elife/endorsementsConsolidation/endorsementsConsolidationCtrl.js');
                        }]
                }
            })
            .state('app.contManage.policyInfo.property', {
                url: '/property',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '财产险'
                }
            })
            .state('app.contManage.policyInfo.life', {
                url: '/life',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '人身险'
                }
            })
            .state('app.contManage.policyInfo.car', {
                url: '/car',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '车险'
                }
            })
            //保单信息
            .state('app.elife.eLifeInsurance', {
                url: '/eLifeInsurance',
                params: {"id": null,"refArray":['INTERNETQUERYTYPE']},
                templateUrl: getURL('insurance/elife/eLifeInsurance/eLifeInsurance.html'),
                ncyBreadcrumb: {
                    label: '保单信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/elife/eLifeInsurance/eLifeInsuranceCtrl.js');
                        }]
                }
            })
            //长安一家保险信息
            // .state('app.elife.policyInfo.caejBidInsurance', {
            //     url: '/caejBidInsurance',
            //     params: {"id": null},
            //     templateUrl: getURL('insurance/view/caejBidInsurance/caejBidInsurance.html'),
            //     ncyBreadcrumb: {
            //         label: '投标履约保险信息'
            //     },
            //     resolve: {
            //         deps: ['uiLoad',
            //             function (uiLoad) {
            //                 return uiLoad.load('insurance/controller/caejBidInsuranceCtrl.js');
            //             }]
            //     }
            // })
            //长安一家保险信息
            // .state('app.elife.policyInfo.caejUnbidInsurance', {
            //     url: '/caejUnbidInsurance',
            //     params: {"id": null},
            //     templateUrl: getURL('insurance/view/caejUnbidInsurance/caejUnbidInsurance.html'),
            //     ncyBreadcrumb: {
            //         label: '长安一家保险信息'
            //     },
            //     resolve: {
            //         deps: ['uiLoad',
            //             function (uiLoad) {
            //                 return uiLoad.load('insurance/controller/caejUnbidInsuranceCtrl.js');
            //             }]
            //     }
            // })
            // .state('app.elife.elifeClearing', {
            //     url: '/elifeClearing',
            //     template: '<div  ui-view style="height: 100%;"></div>',
            //     ncyBreadcrumb: {
            //         label: '结算信息'
            //     }
            // })
            //互联网业务结算
            .state('app.elife.elifeClearing', {
                url: '/elifeClearing',
                params: {"id": null,"refArray":['PRODUCTTYPE','PAYSTATETYPE']},
                templateUrl: getURL('insurance/elife/elifeClearing/elifeClearing.html'),
                ncyBreadcrumb: {
                    label: '业务结算信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/elife/elifeClearing/elifeClearingCtrl.js');
                        }]
                }
            })
            .state('app.elife.endorsement', {
                url: '/endorsement',
                params: {"id": null},
                templateUrl: getURL('insurance/elife/endorsement/endorsement.html'),
                ncyBreadcrumb: {
                    label: '批单信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/elife/endorsement/endorsementCtrl.js');
                        }]
                }
            })
            .state('app.elife.rechargeManage', {
                url: '/rechargeManage',
                params: {"id": null},
                templateUrl: getURL('insurance/elife/rechargeManage/rechargeManage.html'),
                ncyBreadcrumb: {
                    label: '充值管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/elife/rechargeManage/rechargeManageCtrl.js');
                        }]
                }
            })
            .state('app.elife.subscriptionManage', {
                url: '/subscriptionManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '互联网实际到账认领'
                }
            })
            // 互联网实际到账认领
            .state('app.elife.subscriptionManage.realityStream', {
                url: '/realityStream',
                params: {"id": null},
                templateUrl: getURL('insurance/elife/realityStream/realityStream.html'),
                ncyBreadcrumb: {
                    label: '实际到账认领'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/elife/realityStream/realityStreamCtrl.js');
                        }]
                }
            })
            // 互联网实际到账认领
            .state('app.elife.subscriptionManage.subscriptionManages', {
                url: '/subscriptionManages',
                params: {"id": null},
                templateUrl: getURL('insurance/elife/subscriptionManages/subscriptionManages.html'),
                ncyBreadcrumb: {
                    label: '认款管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/elife/subscriptionManages/subscriptionManagesCtrl.js');
                        }]
                }
            })
            .state('app.elife.internetAccount', {
                url: '/internetAccount',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '互联网台账'
                }
            })
            .state('app.elife.internetAccount.internetAccount', {
                url: '/internetAccount',
                params: {"id": null},
                templateUrl: getURL('insurance/elife/internetAccount/internetAccount.html'),
                ncyBreadcrumb: {
                    label: '互联网台账'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/elife/internetAccount/internetAccountCtrl.js');
                        }]
                }
            })
            .state('app.contManage.initProjectManage', {
                url: '/initProjectManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '立项管理'
                }
            })
            .state('app.contManage.initProjectManage.assessorsProject', {
                url: '/assessorsProject',
                templateUrl: getURL('insurance/busManage/busDevelop/busProject/assessorsProject/assessorsProject.html'),
                ncyBreadcrumb: {
                    label: '立项信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/busDevelop/busProject/assessorsProject/assessorsProjectCtrl.js');
                        }]
                }
            })
            .state('app.assBusManage.projectFeeManage', {
                url: '/projectFeeManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '项目费用管理'
                }
            })
            .state('app.assBusManage.reportManage', {
                url: '/reportManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '报告管理'
                }
            })
            .state('app.assBusManage.receiveManage', {
                url: '/receiveManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '已收账款管理'
                }
            })
            .state('app.assBusManage.busAllotManage', {
                url: '/busAllotManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务收入分配管理'
                }
            })
            .state('app.assBusManage.recordManage', {
                url: '/recordManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '档案管理'
                }
            })
            .state('app.assBusManage.formManage', {
                url: '/formManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '报表管理'
                }
            })
            .state('app.busSet', {
                url: '/busSet',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务设置'
                }
            })
            .state('app.insurancePlanInfoManage', {
                url: '/insurancePlanInfoManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '保险方案信息管理'
                }
            })
            .state('app.userManage', {
                url: '/userManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '用户管理'
                }
            })
            .state('app.rightManage', {
                url: '/rightManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '权限管理'
                }
            })
            .state('app.systemManage', {
                url: '/systemManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '系统管理'
                }
            })
            .state('app.systemManage.workFlow', {
                url: '/workFlow',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '审批流配置'
                }
            })
            .state('app.systemManage.workFlow.flowdef', {
                url: '/flowdef',
                templateUrl: getURL('insurance/flowdef/flowdef.html'),
                ncyBreadcrumb: {
                    label: '流程定义'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/flowdef/flowdefCtrl.js'
                            );
                        }]
                }
            })
            .state('app.systemManage.workFlow.flowset', {
                url: '/flowset',
                templateUrl: getURL('insurance/view/flowset/flowset.html'),
                ncyBreadcrumb: {
                    label: '流程配置'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/flowsetCtrl.js'
                            );
                        }]
                }
            })
            .state('app.systemManage.logManager', {
                url: '/logManager',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '日志管理'
                }
            })
            .state('app.systemManage.logManager.log', {
                url: '/log',
                templateUrl: getURL('system/logManager/logManager.html'),
                ncyBreadcrumb: {
                    label: '日志管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('system/logManager/logManagerCtrl.js'
                            );
                        }]
                }
            })
            .state('app.systemManage.logManager.logCount', {
                url: '/logCount',
                templateUrl: getURL('system/logCount/logCount.html'),
                ncyBreadcrumb: {
                    label: '日志统计'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('system/logCount/logCountCtrl.js'
                            );
                        }]
                }
            })
            .state('app.systemManage.strategy', {
                url: '/strategy',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '系统配置'
                }
            })
            .state('app.systemManage.strategy.cipherStrategy', {
                url: '/cipherStrategy',
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
            .state('app.systemBusManage', {
                url: '/systemBusManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '系统业务设置'
                }
            })
            //发版记录管理模块
            //一级菜单
            .state('app.versionControl', {
                url: '/versionControl',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '发版记录管理'
                }
            })
            //二级菜单
            .state('app.versionControl.upgrateLog', {
                url: '/upgrateLog',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '发版记录管理'
                }
            })
            //发版记录
            .state('app.versionControl.upgrateLog.versionNumber', {
                url: '/versionNumber',
                params: {"id": null},
                templateUrl: getURL('insurance/flowdef/versionNumber.html'),
                ncyBreadcrumb: {
                    label: '发版记录'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/versionNumber/versionNumberCtrl.js');
                        }]
                }
            })
            //再保险业务管理模块
            //一级菜单
            .state('app.againInsurance', {
                url: '/againInsurance',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '再保险业务管理'
                }
            })
            .state('app.againInsurance.policyInfo', {
                url: '/policyInfo',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '保单管理'
                }
            })
            .state('app.againInsurance.busLedger', {
                url: '/busLedger',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务台账管理'
                }
            })
            //三级菜单
            //业务签报
            // .state('app.againInsurance.againReport', {
            //     url: '/againReport',
            //     params: {"id": null},
            //     templateUrl: getURL('insurance/view/againReport/againReport.html'),
            //     ncyBreadcrumb: {
            //         label: '业务签报'
            //     },
            //     resolve: {
            //         deps: ['uiLoad',
            //             function (uiLoad) {
            //                 return uiLoad.load('insurance/controller/againReportCtrl.js');
            //             }]
            //     }
            // })
            //业务文件申报审批
            .state('app.againInsurance.againBusinessExamine', {
                url: '/againBusinessExamine',
                params: {"id": null},
                templateUrl: getURL('insurance/againInsurance/againBusinessExamine/againBusinessExamine.html'),
                ncyBreadcrumb: {
                    label: '再保险业务文件申报审批'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/againInsurance/againBusinessExamine/againBusinessExamineCtrl.js');
                        }]
                }
            })
            //业务立项
            .state('app.againInsurance.propertyProject', {
                url: '/againPropertyProject',
                params: {"id": null},
                templateUrl: getURL('insurance/againInsurance/againPropertyProject/againPropertyProject.html'),
                ncyBreadcrumb: {
                    label: '业务立项'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/againInsurance/againPropertyProject/againPropertyProjectCtrl.js');
                        }]
                }
            })
            //保单录入
            .state('app.againInsurance.policyInfo.reinsurance', {
                url: '/againInsurance',
                params: {"id": null},
                templateUrl: getURL('insurance/againInsurance/policyInfo/againInsurance/againInsurance.html'),
                ncyBreadcrumb: {
                    label: '保单信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/againInsurance/policyInfo/againInsurance/againInsuranceCtrl.js');
                        }]
                }
            })
            //再保险批单
            .state('app.againInsurance.againchangebillcheck', {
                url: '/againchangebillcheck',
                params: {"id": null},
                templateUrl: getURL('insurance/againInsurance/againchangebillcheck/againchangebillcheck.html'),
                ncyBreadcrumb: {
                    label: '再保险批单'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/againInsurance/againchangebillcheck/againchangebillcheckCtrl.js');
                        }]
                }
            })
            //再保险结算信息
            .state('app.againInsurance.clearing', {
                url: '/againClearing',
                params: {"id": null},
                templateUrl: getURL('insurance/againInsurance/againClearing/againClearing.html'),
                ncyBreadcrumb: {
                    label: '再保险结算信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/againInsurance/againClearing/againClearingCtrl.js');
                        }]
                }
            })
            .state('app.againInsurance.busLedger.queryDetail', {
                url: '/againQueryDetail',
                templateUrl: getURL('insurance/againInsurance/busLedger/againQueryDetail/againQueryDetail.html'),
                ncyBreadcrumb: {
                    label: '明细账查询'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/againInsurance/busLedger/againQueryDetail/againQueryDetailCtrl.js');
                        }]
                }
            })
            //再保险中的认款管理
            .state('app.againInsurance.againSubscription', {
                url: '/againSubscription',
                params: {"id": null},
                templateUrl: getURL('insurance/againInsurance/againSubscription/againSubscription.html'),
                ncyBreadcrumb: {
                    label: '认款管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/againInsurance/againSubscription/againSubscription.js');
                        }]
                }
            })
            // 再保险业务菜单结束
            .state('app.basicFileManage', {
                url: '/basicFileManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '基本档案管理'
                }
            })
            .state('app.basicFileManage.spaForm', {
                url: '/spaForm',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: 'SAP对照表'
                }
            })
            .state('app.basicFileManage.emsBusiForm2', {
                url: '/emsBusiForm2',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: 'EMS与busi对照表'
                }
            })
            .state('app.systemBusManage.flowSet', {
                url: '/flowSet',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '流程设置'
                }
            })
            .state('app.busSet.workFlowSet', {
                url: '/workFlowSet',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '流程设置'
                }
            })
            .state('app.busSet.emsBusReport', {
                url: '/emsBusReport',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: 'EMS与busi对照表'
                }
            })
            .state('app.assBusManage.formManage.incomeStatistic', {
                url: '/incomeStatistic',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '收入统计'
                }
            })
            .state('app.assBusManage.formManage.intakeStatistic', {
                url: '/intakeStatistic',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '接案统计'
                }
            })
            .state('app.assBusManage.formManage.settleStatistic', {
                url: '/settleStatistic',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '结案统计'
                }
            })
            .state('app.assBusManage.formManage.accountIncome', {
                url: '/accountIncome',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '到账收入'
                }
            })
            .state('app.assBusManage.formManage.receiveCredit', {
                url: '/receiveCredit',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '应收账款'
                }
            })
            .state('app.assBusManage.formManage.perforAssess', {
                url: '/perforAssess',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '绩效考核'
                }
            })
            .state('app.contManage.policyInfo', {
                url: '/policyInfo',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '保单管理'
                }
            })
            .state('app.contManage.colBusManage', {
                url: '/colBusManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '协同业务管理'
                }
            })
            .state('app.contManage.riderManage', {
                url: '/riderManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '批单管理'
                }
            })
            .state('app.contManage.otherManage', {
                url: '/otherManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '其他管理'
                }
            })
            .state('app.contManage.clearing', {
                url: '/clearing',
                params: {"id": null,"refArray":['PAYSTATETYPE']},
                templateUrl: getURL('bsm/clearing/clearing.html'),
                ncyBreadcrumb: {
                    label: '业务结算信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('bsm/clearing/clearingCtrl.js');
                        }]
                }
            })
            .state('app.contManage.issueNotice', {
                url: '/issueNotice',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '出单通知书'
                }
            })
            .state('app.contManage.issueNotice.issueNotice', {
                url: '/issueNotice',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/issueNotice/issueNotice/issueNotice.html'),
                ncyBreadcrumb: {
                    label: '财产险出单通知书'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/issueNotice/issueNotice/issueNoticeCtrl.js');
                        }]
                }
            })
            .state('app.contManage.issueNotice.issueNoticeGlife', {
                url: '/issueNoticeGlife',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/issueNotice/issueNoticeGlife/issueNotice.html'),
                ncyBreadcrumb: {
                    label: '团意险出单通知书'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/issueNotice/issueNoticeGlife/issueNoticeGlifeCtrl.js');
                        }]
                }
            })
            //认款平台一级菜单
            .state('app.claimMoneyPlatform', {
                url: '/claimMoneyPlatform',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '实际到账认领'
                }
            })
            //认款平台二级菜单
            .state('app.claimMoneyPlatform.actualAccount', {
                url: '/actualAccount',
                params: {"id": null},
                templateUrl: getURL('insurance/claimMoneyPlatform/actualAccount/actualAccount.html'),
                ncyBreadcrumb: {
                    label: '实际到账流水'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/claimMoneyPlatform/actualAccount/actualAccountCtrl.js');
                        }]
                }
            })
            .state('app.claimMoneyPlatform.subscription', {
                url: '/subscription',
                params: {"id": null},
                templateUrl: getURL('insurance/claimMoneyPlatform/subscription/subscription.html'),
                ncyBreadcrumb: {
                    label: '认款管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/claimMoneyPlatform/subscription/subscriptionCtrl.js');
                        }]
                }
            })
            .state('app.contManage.busLedger', {
                url: '/busLedger',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务台账管理'
                }
            })
            .state('app.contManage.busLedger.queryTotal', {
                url: '/queryTotal',
                templateUrl: getURL('insurance/contManage/busLedger/queryTotal/queryTotal.html'),
                ncyBreadcrumb: {
                    label: '总账查询'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/busLedger/queryTotal/queryTotalCtrl.js');
                        }]
                }
            })
            .state('app.contManage.busLedger.queryDetail', {
                url: '/queryDetail',
                templateUrl: getURL('insurance/againInsurance/busLedger/againQueryDetail/againQueryDetail.html'),
                ncyBreadcrumb: {
                    label: '明细账查询'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/againInsurance/busLedger/againQueryDetail/againQueryDetailCtrl.js');
                        }]
                }
            })
            .state('app.contManage.busLedger.voucherHeader', {
                url: '/voucherHeader',
                templateUrl: getURL('insurance/contManage/busLedger/voucherHeader/voucherHeader.html'),
                ncyBreadcrumb: {
                    label: '查询凭证'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/busLedger/voucherHeader/voucherHeaderCtrl.js');
                        }]
                }
            })
            .state('app.contManage.busLedger.queryReconciliation', {
                url: '/queryReconciliation',
                templateUrl: getURL('insurance/contManage/busLedger/queryReconciliation/queryReconciliation.html'),
                ncyBreadcrumb: {
                    label: '系统间对账'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/busLedger/queryReconciliation/queryReconciliationCtrl.js');
                        }]
                }
            })
            .state('app.busManage.monthlyPlanAndAccountsReceivable', {
                url: '/monthlyPlanAndAccountsReceivable',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务月度计划'
                }
            })
            .state('app.busManage.monthlyPlanAndAccountsReceivable.sum1', {
                url: '/sum1',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/monthlyPlanAndAccountsReceivable/sum1/sum_def1.html'),
                ncyBreadcrumb: {
                    label: '股东业务月度计划'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/monthlyPlanAndAccountsReceivable/sum1/sum1Ctrl.js');
                        }]
                }
            })
            //BUSI_INSURANCE
            .state('app.busManage.monthlyPlanAndAccountsReceivable.sum2', {
                url: '/sum2',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/monthlyPlanAndAccountsReceivable/sum2/sum_def2.html'),
                ncyBreadcrumb: {
                    label: '非股东业务月度计划'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/monthlyPlanAndAccountsReceivable/sum2/sum_def2Ctrl.js');
                        }]
                }
            })
            .state('app.contManage.monthlyPlanAndAccountsReceivable.accountsReceivable', {
                url: '/accountsReceivable',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '应收账款'
                }
            })
            //BUSI_INSURANCE
            .state('app.contManage.monthlyPlanAndAccountsReceivable.accountsReceivable.sum_def8', {
                url: '/sum_def8',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/monthlyPlanAndAccountsReceivable/sum_def8/sum_def8.html'),
                ncyBreadcrumb: {
                    label: '电网业务应收账款'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/monthlyPlanAndAccountsReceivable/sum_def8/sum_def8Ctrl.js');
                        }]
                }
            })
            //BUSI_INSURANCE
            .state('app.contManage.monthlyPlanAndAccountsReceivable.accountsReceivable.sum_def9', {
                url: '/sum_def9',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/monthlyPlanAndAccountsReceivable/sum_def9/sum_def9.html'),
                ncyBreadcrumb: {
                    label: '电力能源业务应收账款'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/monthlyPlanAndAccountsReceivable/sum_def9/sum_def9Ctrl.js');
                        }]
                }
            })
            //BUSI_INSURANCE
            .state('app.contManage.monthlyPlanAndAccountsReceivable.accountsReceivable.sum_def10', {
                url: '/sum_def10',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/monthlyPlanAndAccountsReceivable/sum_def10/sum_def10.html'),
                ncyBreadcrumb: {
                    label: '社会市场业务应收账款'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/monthlyPlanAndAccountsReceivable/sum_def10/sum_def10Ctrl.js');
                        }]
                }
            })
            //BUSI_INSURANCE
            .state('app.contManage.monthlyPlanAndAccountsReceivable.accountsReceivable.sum_def11', {
                url: '/sum_def11',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/monthlyPlanAndAccountsReceivable/sum_def11/sum_def11.html'),
                ncyBreadcrumb: {
                    label: '创新业务应收账款'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/monthlyPlanAndAccountsReceivable/sum_def11/sum_def11Ctrl.js');
                        }]
                }
            })
            //BUSI_INSURANCE
            .state('app.contManage.monthlyPlanAndAccountsReceivable.accountsReceivable.sum_def12', {
                url: '/sum_def12',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/monthlyPlanAndAccountsReceivable/sum_def12/sum_def12.html'),
                ncyBreadcrumb: {
                    label: '互联网业务应收账款'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/monthlyPlanAndAccountsReceivable/sum_def12/sum_def12Ctrl.js');
                        }]
                }
            })
            //BUSI_INSURANCE
            .state('app.contManage.monthlyPlanAndAccountsReceivable.accountsReceivable.sum_def13', {
                url: '/sum_def13',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/monthlyPlanAndAccountsReceivable/sum_def13/sum_def13.html'),
                ncyBreadcrumb: {
                    label: '风险管理咨询业务应收账款'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/monthlyPlanAndAccountsReceivable/sum_def13/sum_def13Ctrl.js');
                        }]
                }
            })
            //BUSI_INSURANCE
            .state('app.contManage.monthlyPlanAndAccountsReceivable.accountsReceivable.sum_def14', {
                url: '/sum_def14',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/monthlyPlanAndAccountsReceivable/sum_def14/sum_def14.html'),
                ncyBreadcrumb: {
                    label: '国际业务应收账款'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/monthlyPlanAndAccountsReceivable/sum_def14/sum_def14Ctrl.js');
                        }]
                }
            })
            //BUSI_INSURANCE
            .state('app.busManage.busSign', {
                url: '/busSign',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务签报管理'
                }
            })
            .state('app.comInfo.form', {
                url: '/form',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '报表管理'
                }
            })
            .state('app.comInfo.attachQuery', {
                url: '/attachQuery',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '附件查询'
                }
            })
            .state('app.comInfo.attachQuery.accQuery', {
                url: '/accQuery',
                templateUrl: getURL('insurance/comInfo/accQuery/accQuery.html'),
                ncyBreadcrumb: {
                    label: '附件查询'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/accQuery/accQueryCtrl.js');
                        }]
                }
            })
            .state('app.comInfo.policyInfoQuery', {
                url: '/policyInfoQuery',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '保单信息查询'
                }
            })
            .state('app.comInfo.infoQuery', {
                url: '/infoQuery',
                templateUrl: getURL('insurance/comInfo/infoQuery/infoQuery.html'),
                ncyBreadcrumb: {
                    label: '保单信息查询'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/infoQuery/infoQueryCtrl.js');
                        }]
                }
            })
            .state('app.busManage.agreement', {
                url: '/agreement',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '协议管理'
                }
            })
            .state('app.busManage.agreement.entrustment', {
                url: '/entrustmentAgreement',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/agreement/entrustmentAgreement/entrustmentAgreement.html'),
                ncyBreadcrumb: {
                    label: '委托协议'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/agreement/entrustmentAgreement/entrustmentAgreementCtrl.js');
                        }]
                }
            })
            .state('app.busManage.agreement.cooperation', {
                url: '/cooperationAgreement',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/agreement/cooperationAgreement/cooperationAgreement.html'),
                ncyBreadcrumb: {
                    label: '合作协议'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/agreement/cooperationAgreement/cooperationAgreementCtrl.js');
                        }]
                }
            })
            .state('app.busManage.agreement.tripartite', {
                url: '/tripartiteAgreement',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/agreement/tripartiteAgreement/tripartiteAgreement.html'),
                ncyBreadcrumb: {
                    label: '三方协议'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/agreement/tripartiteAgreement/tripartiteAgreementCtrl.js');
                        }]
                }
            })
            .state('app.busManage.busDevelop', {
                url: '/busDevelop',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务开发管理'
                }
            })
            .state('app.busManage.busQuality', {
                url: '/busQuality',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务质量管理'
                }
            })
            .state('app.base.expertManage', {
                url: '/expertManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '专家库管理'
                }
            })
            .state('app.busManage.filingManage', {
                url: '/filingManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '备案文件管理'
                }
            })
            .state('app.busManage.contractEnquiry', {
                url: '/contractEnquiry',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务合同查询'
                }
            })
            .state('app.busManage.docDeclaration', {
                url: '/docDeclaration',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务文件申报审批'
                }
            })
            .state('app.busManage.insuranceDesign', {
                url: '/insuranceDesign',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '保险方案设计'
                }
            })
            .state('app.busManage.insuranceArrange', {
                url: '/insuranceArrange',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '保险安排'
                }
            })
            .state('app.busManage.customerService', {
                url: '/customerService',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '客户服务管理'
                }
            })
            .state('app.busManage.customerService.cusServicePlan', {
                url: '/cusServicePlan',
                templateUrl: getURL('insurance/busManage/customerService/cusServicePlan/cusServicePlan.html'),
                ncyBreadcrumb: {
                    label: '客户服务计划'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/customerService/cusServicePlan/cusServicePlanCtrl.js');
                        }]
                }
            })
            .state('app.busManage.customerService.reVisitManage', {
                url: '/reVisitManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '客户回访管理'
                }
            })
            .state('app.busManage.customerService.reVisitManage.visitPlan', {
                url: '/visitPlan',
                templateUrl: getURL('insurance/busManage/customerService/reVisitManage/visitPlan/visitPlan.html'),
                ncyBreadcrumb: {
                    label: '回访计划信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/customerService/reVisitManage/visitPlan/visitPlanCtrl.js');
                        }]
                }
            })
            //客户回访记录
            .state('app.busManage.customerService.reVisitManage.visitRecord', {
                url: '/visitRecord',
                templateUrl: getURL('insurance/busManage/customerService/reVisitManage/visitRecord/visitRecord.html'),
                ncyBreadcrumb: {
                    label: '回访记录信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/customerService/reVisitManage/visitRecord/visitRecordCtrl.js');
                        }]
                }
            })
            .state('app.busManage.customerService.trainManage', {
                url: '/trainManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '客户培训管理'
                }
            })
            //客户培训年度计划
            .state('app.busManage.customerService.trainManage.trainPlanYear', {
                url: '/trainPlanYear',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/customerService/trainManage/trainPlanYear/trainPlanYear.html'),
                ncyBreadcrumb: {
                    label: '年度客户培训计划'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/customerService/trainManage/trainPlanYear/trainPlanYearCtrl.js');
                        }]
                }
            })
            .state('app.busManage.customerService.trainManage.customerTrain', {
                url: '/customerTrain',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/customerService/trainManage/customerTrain/customerTrain.html'),
                ncyBreadcrumb: {
                    label: '客户培训计划申报'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/customerService/trainManage/customerTrain/customerTrainCtrl.js');
                        }]
                }
            })
            .state('app.busManage.customerService.claimManage', {
                url: '/claimManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '协助索赔管理'
                }
            })
            .state('app.busManage.customerService.evaluateManage', {
                url: '/evaluateManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '保险公司服务质量评价管理'
                }
            })
            .state('app.busManage.busDevelop.busProject', {
                url: '/busProject',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务立项'
                }
            })
            .state('app.busManage.docDeclaration.shareholders', {
                url: '/shareholders',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '股东业务保险方案'
                }
            })
            .state('app.busManage.busDevelop.busPromotion', {
                url: '/busPromotion',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务推介'
                }
            })
            .state('app.busManage.makePlan.markerSurvey', {
                url: '/markerSurvey',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '市场调研'
                }
            })
            .state('app.busManage.makePlan.marketPlan', {
                url: '/marketPlan',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '营销计划'
                }
            })
            .state('app.busManage.makePlan.makeMarketPlan', {
                url: '/makeMarketPlan',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '制定营销方案'
                }
            })
            .state('app.busManage.makePlan.monthMarketReport', {
                url: '/monthMarketReport',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '月度营销填报'
                }
            })
            .state('app.busManage.makePlan.marketPlan.workPartner', {
                url: '/workPartner',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '股东业务营销计划'
                }
            })
            //保险中介公司信息
            .state('app.base.cooperator.agencyCustomer', {
                url: '/agencyCustomer',
                params: {"id": null},
                templateUrl: getURL('insurance/base/cooperator/agencyCustomer/agencyCustomer.html'),
                ncyBreadcrumb: {
                    label: '保险中介公司信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/base/cooperator/agencyCustomer/agencyCustomerCtrl.js');
                        }]
                }
            })
            //保险中介公司信息变更
            .state('app.base.informationChange.agencyCustomerChange', {
                url: '/agencyCustomerChange',
                templateUrl: getURL('insurance/base/informationChange/agencyCustomerChange/agencyCustomerChange.html'),
                ncyBreadcrumb: {
                    label: '保险中介公司信息变更'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/base/informationChange/agencyCustomerChange/agencyCustomerChangeCtrl.js');
                        }]
                }
            })
            //业务文件批量报送
            .state('app.busManage.docDeclaration.batchExamine', {
                url: '/batchExamine',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/docDeclaration/batchExamine/batchExamine.html'),
                ncyBreadcrumb: {
                    label: '批量报送业务文件'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/docDeclaration/batchExamine/batchExamineCtrl.js');
                        }]
                }
            })
            //批量报送业务立项主表
            .state('app.busManage.busDevelop.busProject.batchProject', {
                url: '/batchProject',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/busDevelop/busProject/batchProject/batchProject.html'),
                ncyBreadcrumb: {
                    label: '批量报送业务立项'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/busDevelop/busProject/batchProject/batchProjectCtrl.js');
                        }]
                }
            })
            //批量业务签报
            .state('app.busManage.busSign.batchReport', {
                url: '/batchReport',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/busSign/batchReport/batchReport.html'),
                ncyBreadcrumb: {
                    label: '批量业务签报'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/busSign/batchReport/batchReportCtrl.js');
                        }]
                }
            })
            //分公司业务模板管理
            .state('app.busManage.docDeclaration.shareholders.insuranceScheme', {
                url: '/insuranceScheme',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/docDeclaration/shareholders/insuranceScheme/insuranceScheme.html'),
                ncyBreadcrumb: {
                    label: '财产险保险方案'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/docDeclaration/shareholders/insuranceScheme/insuranceSchemeCtrl.js');
                        }]
                }
            })
            .state('app.busManage.docDeclaration.shareholders.insuranceSchemeGlife', {
                url: '/insuranceSchemeGlife',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/docDeclaration/shareholders/insuranceSchemeGlife/insuranceSchemeGlife.html'),
                ncyBreadcrumb: {
                    label: '团意险保险方案'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/docDeclaration/shareholders/insuranceSchemeGlife/insuranceSchemeGlifeCtrl.js');
                        }]
                }
            })
            //业务文件申报审批
            .state('app.busManage.docDeclaration.businessExamine', {
                url: '/businessExamine',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/docDeclaration/businessExamine/businessExamine.html'),
                ncyBreadcrumb: {
                    label: '业务文件申报审批'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/docDeclaration/businessExamine/businessExamineCtrl.js');
                        }]
                }
            })
            .state('app.auditManager', {
                url: '/auditManager',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '财务审核管理'
                }
            })
            //结算主表
            .state('app.auditManager.clearing', {
                url: '/clearing',
                params: {"id": null,"refArray":['RECHARGEAUDITTYPE','PAYSTATETYPE']},
                templateUrl: getURL('insurance/auditManager/clearingAudit/clearingAudit.html'),
                ncyBreadcrumb: {
                    label: '财务审核信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/auditManager/clearingAudit/clearingAuditCtrl.js');
                        }]
                }
            })
            .state('app.auditManager.subscriptionAudit', {
                url: '/subscriptionAudit',
                    params: {"id": null,"refArray":['DIRECTIONTYPE','SUBJECTTYPE']},
                    templateUrl: getURL('insurance/auditManager/subscriptionAudit/subscriptionAudit.html'),
                    ncyBreadcrumb: {
                        label: '财务认款确认'
                    },
                    resolve: {
                        deps: ['uiLoad',
                            function (uiLoad) {
                                return uiLoad.load('insurance/auditManager/subscriptionAudit/subscriptionAuditCtrl.js');
                            }]
                    }
            })
            .state('app.auditManager.rechargeManageAudit', {
                url: '/rechargeManageAudit',
                params: {"id": null},
                templateUrl: getURL('insurance/auditManager/rechargeManageAudit/rechargeManageAudit.html'),
                ncyBreadcrumb: {
                    label: '互联网充值确认'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/auditManager/rechargeManageAudit/rechargeManageAuditCtrl.js');
                        }]
                }
            })
            //咨询费管理
            .state('app.contManage.consult', {
                url: '/consult',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/consult/consult.html'),
                ncyBreadcrumb: {
                    label: '咨询费信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/consult/consultCtrl.js');
                        }]
                }
            })
            //客户服务计划
            .state('app.comInfo.form.clientService.cusServicePlanB', {
                url: '/cusServicePlanB',
                templateUrl: getURL('insurance/busManage/customerService/reVisitManage/visitPlan/visitPlanBVOForm.html'),
                ncyBreadcrumb: {
                    label: '客户服务计划明细'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/insurance/busManage/customerService/reVisitManage/visitPlan/visitPlanCtrl.js');
                        }]
                }
            })
            //客户服务文件管理
            .state('app.busManage.customerService.customerService', {
                url: '/customerService',
                params: {fileType: 1},
                templateUrl: getURL('insurance/busManage/customerService/customerService/customerService.html'),
                ncyBreadcrumb: {
                    label: '客户服务手册'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/customerService/customerService/customerServiceCtrl.js');
                        }]
                }
            })
            //客户服务文件管理
            .state('app.comInfo.form.clientService.customerServiceB', {
                url: '/customerServiceB',
                templateUrl: getURL('insurance/busManage/customerService/customerServiceB/customerServiceB.html'),
                ncyBreadcrumb: {
                    label: '客户服务手册明细'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/customerService/customerServiceB/customerServiceBCtrl.js');
                        }]
                }
            })
            .state('app.comInfo.form.clientService.customerServiceB1', {
                url: '/customerServiceB1',
                templateUrl: getURL('insurance/busManage/customerService/customerServiceB/customerServiceB.html'),
                ncyBreadcrumb: {
                    label: '客户服务工作报告'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/customerService/customerServiceB/customerServiceBCtrl.js');
                        }]
                }
            })
            //业务模板管理
            .state('app.base.business.documents', {
                url: '/documents',
                templateUrl: getURL('insurance/base/business/documents/documents.html'),
                ncyBreadcrumb: {
                    label: '业务模板管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/base/business/documents/documentsCtrl.js');
                        }]
                }
            })
            //busi发送电网资产系统数据
            .state('app.basicFileManage.emsBusiForm2.ems', {
                url: '/ems',
                templateUrl: getURL('insurance/ems/ems.html'),
                ncyBreadcrumb: {
                    label: '接口发送接收日志'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/ems/emsCtrl.js');
                        }]
                }
            })
            //专家人员信息
            .state('app.base.expertManage.expert', {
                url: '/expert',
                params: {"id": null},
                templateUrl: getURL('insurance/base/expertManage/expert/expert.html'),
                ncyBreadcrumb: {
                    label: '专家人员信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/base/expertManage/expert/expertCtrl.js');
                        }]
                }
            })
            //团车信息
            .state('app.contManage.policyInfo.car.gCarInsurance', {
                url: '/gCarInsurance',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/policyInfo/car/gCarInsurance/gCarInsurance.html'),
                ncyBreadcrumb: {
                    label: '团体车险保单信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/policyInfo/car/gCarInsurance/gCarInsuranceCtrl.js');
                        }]
                }
            })
            //批单信息
            .state('app.contManage.riderManage.gLifeChangebillcheck', {
                url: '/gLifeChangebillcheck',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/riderManage/gLifeChangebillcheck/gLifeChangebillcheck.html'),
                ncyBreadcrumb: {
                    label: '人身险批单'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/riderManage/gLifeChangebillcheck/gLifeChangebillcheckCtrl.js');
                        }]
                }
            })
            .state('app.contManage.riderManage.changebillcheck', {
                url: '/changebillcheck',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/riderManage/changebillcheck/changebillcheck.html'),
                ncyBreadcrumb: {
                    label: '财产险批单'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/riderManage/changebillcheck/changebillcheckCtrl.js');
                        }]
                }
            })
            //团体寿险信息
            .state('app.contManage.policyInfo.life.gLifeInsurance', {
                url: '/gLifeInsurance',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/policyInfo/life/gLifeInsurance/gLifeInsurance.html'),
                ncyBreadcrumb: {
                    label: '团体寿险保单信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/policyInfo/life/gLifeInsurance/gLifeInsuranceCtrl.js');
                        }]
                }
            })
            //疗休养保险信息
            .state('app.contManage.policyInfo.eLifeInsurance', {
                url: '/eLifeInsurance',
                params: {"id": null},
                templateUrl: getURL('insurance/elife/eLifeInsurance/eLifeInsurance.html'),
                ncyBreadcrumb: {
                    label: '疗休养保险信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/elife/eLifeInsurance/eLifeInsuranceCtrl.js');
                        }]
                }
            })
            //用户组
            .state('app.rightManage.group', {
                url: '/group',
                templateUrl: getURL('system/group/view/group.html'),
                ncyBreadcrumb: {
                    label: '角色管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('system/group/controller/groupCtrl.js');
                        }]
                }
            })
            //用户组
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
            //国网客户信息变更
            .state('app.base.informationChange.groupCustomerChange', {
                url: '/groupCustomerChange',
                params: {"id": null},
                templateUrl: getURL('insurance/base/informationChange/groupCustomerChange/groupCustomerChange.html'),
                ncyBreadcrumb: {
                    label: '国网客户信息变更'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/base/informationChange/groupCustomerChange/groupCustomerChangeCtrl.js');
                        }]
                }
            })
            //保险公司信息
            .state('app.base.cooperator.insureCustomer', {
                url: '/insureCustomer',
                params: {"id": null},
                templateUrl: getURL('insurance/base/cooperator/insureCustomer/insureCustomer.html'),
                ncyBreadcrumb: {
                    label: '保险公司信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/base/cooperator/insureCustomer/insureCustomerCtrl.js');
                        }]
                }
            })
            //保险公司信息变更
            .state('app.base.informationChange.insureCustomerChange', {
                url: '/insureCustomerChange',
                params: {"id": null},
                templateUrl: getURL('insurance/base/informationChange/insureCustomerChange/insureCustomerChange.html'),
                ncyBreadcrumb: {
                    label: '保险公司信息变更'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/base/informationChange/insureCustomerChange/insureCustomerChangeCtrl.js');
                        }]
                }
            })
            //市场客户信息
            .state('app.base.customer.marketCustomer', {
                url: '/marketCustomer',
                params: {"id": null},
                templateUrl: getURL('insurance/base/customer/marketCustomer/marketCustomer.html'),
                ncyBreadcrumb: {
                    label: '市场客户信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/base/customer/marketCustomer/marketCustomerCtrl.js');
                        }]
                }
            })
            //市场客户信息变更
            .state('app.base.informationChange.marketCustomerChange', {
                url: '/marketCustomerChange',
                params: {"id": null},
                templateUrl: getURL('insurance/base/informationChange/marketCustomerChange/marketCustomerChange.html'),
                ncyBreadcrumb: {
                    label: '市场客户信息变更'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/base/informationChange/marketCustomerChange/marketCustomerChangeCtrl.js');
                        }]
                }
            })
            //其他合作单位信息
            .state('app.base.cooperator.otherCustomer', {
                url: '/otherCustomer',
                params: {"id": null},
                templateUrl: getURL('insurance/base/cooperator/otherCustomer/otherCustomer.html'),
                ncyBreadcrumb: {
                    label: '其他合作单位信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/base/cooperator/otherCustomer/otherCustomerCtrl.js');
                        }]
                }
            })
            //其他合作单位信息变更
            .state('app.base.informationChange.otherCustomerChange', {
                url: '/otherCustomerChange',
                params: {"id": null},
                templateUrl: getURL('insurance/base/informationChange/otherCustomerChange/otherCustomerChange.html'),
                ncyBreadcrumb: {
                    label: '其他合作单位信息变更'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/base/informationChange/otherCustomerChange/otherCustomerChangeCtrl.js');
                        }]
                }
            })
            //个人车险信息
            .state('app.contManage.policyInfo.car.pCarInsurance', {
                url: '/pCarInsurance',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/policyInfo/car/pCarInsurance/pCarInsurance.html'),
                ncyBreadcrumb: {
                    label: '个人车险保单信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/policyInfo/car/pCarInsurance/pCarInsuranceCtrl.js');
                        }]
                }
            })
            //个人客户信息
            .state('app.base.customer.personalCustomer', {
                url: '/personalCustomer',
                params: {"id": null},
                templateUrl: getURL('insurance/base/customer/personalCustomer/personalCustomer.html'),
                ncyBreadcrumb: {
                    label: '个人客户信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/base/customer/personalCustomer/personalCustomerCtrl.js');
                        }]
                }
            })
            //个人客户信息变更
            .state('app.base.informationChange.personalCustomerChange', {
                url: '/personalCustomerChange',
                params: {"id": null},
                templateUrl: getURL('insurance/base/informationChange/personalCustomerChange/personalCustomerChange.html'),
                ncyBreadcrumb: {
                    label: '个人客户信息变更'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/base/informationChange/personalCustomerChange/personalCustomerChangeCtrl.js');
                        }]
                }
            })
            //个人客户业务立项
            .state('app.busManage.busDevelop.busProject.personalProject', {
                url: '/personalProject',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/busDevelop/busProject/personalProject/personalProject.html'),
                ncyBreadcrumb: {
                    label: '个人客户业务立项'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/busDevelop/busProject/personalProject/personalProjectCtrl.js');
                        }]
                }
            })
            //个人寿险信息
            .state('app.contManage.policyInfo.life.pLifeInsurance', {
                url: '/pLifeInsurance',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/policyInfo/life/pLifeInsurance/pLifeInsurance.html'),
                ncyBreadcrumb: {
                    label: '个人寿险保单信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/policyInfo/life/pLifeInsurance/pLifeInsuranceCtrl.js');
                        }]
                }
            })
            //个人寿险批量业务
            .state('app.contManage.policyInfo.life.pLifeInsuranceBulk', {
                url: '/pLifeInsuranceBulk',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/policyInfo/life/pLifeInsuranceBulk/pLifeInsuranceBulk.html'),
                ncyBreadcrumb: {
                    label: '个人寿险批量业务'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/policyInfo/life/pLifeInsuranceBulk/pLifeInsuranceBulkCtrl.js');
                        }]
                }
            })
            //财产险保单信息
            .state('app.contManage.policyInfo.property.propertyInsurance', {
                url: '/propertyInsurance',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/policyInfo/property/propertyInsurance/propertyInsurance.html'),
                ncyBreadcrumb: {
                    label: '财产险保单信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/policyInfo/property/propertyInsurance/propertyInsuranceCtrl.js');
                        }]
                }
            })
            //财产险保单信息
            .state('app.contManage.policyInfo.pUnlifeInsurance', {
                url: '/pUnlifeInsurance',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/policyInfo/property/propertyInsurance/pUnlifeInsurance/pUnlifeInsurance.html'),
                ncyBreadcrumb: {
                    label: '个人财产险保单信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/policyInfo/property/propertyInsurance/pUnlifeInsurance/pUnlifeInsuranceCtrl.js');
                        }]
                }
            })
            //保单变更台账信息
            .state('app.contManage.policyInfo.changebillInsurance', {
                url: '/changebillInsurance',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/policyInfo/changebillInsurance/changebillInsurance.html'),
                ncyBreadcrumb: {
                    label: '保单变更台账信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/policyInfo/changebillInsurance/changebillInsuranceCtrl.js');
                        }]
                }
            })
            //保单变更台账信息
            .state('app.againInsurance.policyInfo.againChangebillInsurance', {
                url: '/againChangebillInsurance',
                params: {"id": null},
                templateUrl: getURL('insurance/againInsurance/policyInfo/againChangebillInsurance/againChangebillInsurance.html'),
                ncyBreadcrumb: {
                    label: '保单变更台账信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/againInsurance/policyInfo/againChangebillInsurance/againChangebillInsuranceCtrl.js');
                        }]
                }
            })
            //经法合同信息
            .state('app.comInfo.economicContract', {
                url: '/economicContract',
                params: {"id": null},
                templateUrl: getURL('insurance/comInfo/economicContract/economicContract.html'),
                ncyBreadcrumb: {
                    label: '经法合同信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/economicContract/economicContractCtrl.js');
                        }]
                }
            })
            //保单识别信息
            .state('app.contManage.policyInfo.ocrInsurance', {
                url: '/OcrInsurance',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/policyInfo/ocrInsurance/ocrInsurance.html'),
                ncyBreadcrumb: {
                    label: '保单识别'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/policyInfo/ocrInsurance/ocrInsuranceCtrl.js');
                        }]
                }
            })
            //团体客户经纪业务立项
            .state('app.busManage.busDevelop.busProject.propertyProject', {
                url: '/propertyProject',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/busDevelop/busProject/propertyProject/propertyProject.html'),
                ncyBreadcrumb: {
                    label: '团体客户经纪业务立项'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/busDevelop/busProject/propertyProject/propertyProjectCtrl.js');
                        }]
                }
            })
            // //保单信息管理
            // .state('app.contManage.policyInfo.reinsurance', {
            //     url: '/reinsurance',
            //     params: {"id": null},
            //     templateUrl: getURL('insurance/view/reinsurance/reinsurance.html'),
            //     ncyBreadcrumb: {
            //         label: '再保险保单信息'
            //     },
            //     resolve: {
            //         deps: ['uiLoad',
            //             function (uiLoad) {
            //                 return uiLoad.load('insurance/controller/reinsuranceCtrl.js');
            //             }]
            //     }
            // })
            // //代领信息管理
            // .state('app.contManage.policyInfo.replace', {
            //     url: '/replace',
            //     params: {"id": null},
            //     templateUrl: getURL('insurance/view/replace/replace.html'),
            //     ncyBreadcrumb: {
            //         label: '代领信息管理'
            //     },
            //     resolve: {
            //         deps: ['uiLoad',
            //             function (uiLoad) {
            //                 return uiLoad.load('insurance/controller/replaceCtrl.js');
            //             }]
            //     }
            // })
            .state('app.contManage.policyInfo.insuranceWarehouse', {
                url: '/insuranceWarehouse',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '保单库'
                }
            })
            //保单库保单
            .state('app.contManage.policyInfo.insuranceWarehouse.insuranceData', {
                url: '/insuranceData',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/policyInfo/insuranceWarehouse/insuranceData/insuranceData.html'),
                ncyBreadcrumb: {
                    label: '保单库保单'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/policyInfo/insuranceWarehouse/insuranceData/insuranceDataCtrl.js');
                        }]
                }
            })
             //保单库批单
            .state('app.contManage.policyInfo.insuranceWarehouse.warehouseChangebillcheck', {
                url: '/warehouseChangebillcheck',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/policyInfo/insuranceWarehouse/warehouseChangebillcheck/warehouseChangebillcheck.html'),
                ncyBreadcrumb: {
                    label: '保单库批单'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/policyInfo/insuranceWarehouse/warehouseChangebillcheck/warehouseChangebillcheckCtrl.js');
                        }]
                }
            })
            //保单库产品库
            .state('app.contManage.policyInfo.insuranceWarehouse.productData', {
                url: '/productData',
                params: {"id": null,"refArray":['PRODUCTTYPE']},
                templateUrl: getURL('insurance/contManage/policyInfo/insuranceWarehouse/productData/productData.html'),
                ncyBreadcrumb: {
                    label: '产品库'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/policyInfo/insuranceWarehouse/productData/productDataCtrl.js');
                        }]
                }
            })
            //暂保单
            .state('app.contManage.policyInfo.provisionalPolicy', {
                url: '/provisionalPolicy',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/policyInfo/provisionalPolicy/provisionalPolicy.html'),
                ncyBreadcrumb: {
                    label: '暂保单'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/policyInfo/provisionalPolicy/provisionalPolicyCtrl.js');
                        }]
                }
            })
            //业务签报
            .state('app.busManage.busSign.report', {
                url: '/report',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/busSign/report/report.html'),
                ncyBreadcrumb: {
                    label: '业务签报'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/busSign/report/reportCtrl.js');
                        }]
                }
            })
            //国网客户信息
            .state('app.base.customer.stateGridCustomer', {
                url: '/stateGridCustomer',
                params: {"id": null},
                templateUrl: getURL('insurance/base/customer/stateGridCustomer/stateGridCustomer.html'),
                ncyBreadcrumb: {
                    label: '国网客户信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/base/customer/stateGridCustomer/stateGridCustomerCtrl.js');
                        }]
                }
            })
            //客户培训总结
            .state('app.busManage.customerService.trainManage.trainPlanSummarize', {
                url: '/trainPlanSummarize',
                params: {"id": null},
                templateUrl: getURL('insurance/busManage/customerService/trainManage/trainPlanSummarize/trainPlanSummarize.html'),
                ncyBreadcrumb: {
                    label: '客户培训总结'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/busManage/customerService/trainManage/trainPlanSummarize/trainPlanSummarizeCtrl.js');
                        }]
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
            //用户
            .state('app.userManage.onlineUser', {
                url: '/onlineUser',
                templateUrl: getURL('system/onlineUser/onlineUser.html'),
                ncyBreadcrumb: {
                    label: '在线用户统计'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('system/onlineUser/onlineUserCtrl.js');
                        }]
                }
            })
            //  待办任务与消息
            .state('app.toDoTaskAndReadMsg', {
                url: '/insurance',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '待办任务与消息'
                }
            })
            .state('app.comInfo.form.complianceReport', {
                url: '/complianceReport',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务内控信息监测表'
                }
            })
            .state('app.comInfo.form.complianceReport.ReceivableAndUncollected', {
                url: '/ReceivableAndUncollected',
                params: {"id": null},
                templateUrl: getURL('insurance/comInfo/form/complianceReport/ReceivableAndUncollected/ReceivableAndUncollected.html'),
                ncyBreadcrumb: {
                    label: '应收未收佣金统计表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/form/common/complianceReportCtrl.js');
                        }]
                }
            })
            .state('app.comInfo.form.complianceReport.StatisticsOfReceivable', {
                url: '/StatisticsOfReceivable',
                params: {"id": null},
                templateUrl: getURL('insurance/comInfo/form/complianceReport/StatisticsOfReceivable/StatisticsOfReceivable.html'),
                ncyBreadcrumb: {
                    label: '应收未收咨询费统计表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/form/common/complianceReportCtrl.js');
                        }]
                }

            })
            .state('app.comInfo.form.complianceReport.DuplicatePolicyNo', {
                url: '/DuplicatePolicyNo',
                params: {"id": null},
                templateUrl: getURL('insurance/comInfo/form/complianceReport/DuplicatePolicyNo/DuplicatePolicyNo.html'),
                ncyBreadcrumb: {
                    label: '重复保单号统计表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/form/common/complianceReportCtrl.js');
                        }]
                }
            })
            .state('app.comInfo.form.complianceReport.policiesWithoutAttachments', {
                url: '/policiesWithoutAttachments',
                params: {"id": null},
                templateUrl: getURL('insurance/comInfo/form/complianceReport/policiesWithoutAttachments/policiesWithoutAttachments.html'),
                ncyBreadcrumb: {
                    label: '无附件保单情况表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/form/common/complianceReportCtrl.js');
                        }]
                }
            })
            .state('app.comInfo.form.complianceReport.DelayedProjectInitiation', {
                url: '/DelayedProjectInitiation',
                params: {"id": null},
                templateUrl: getURL('insurance/comInfo/form/complianceReport/DelayedProjectInitiation/DelayedProjectInitiation.html'),
                ncyBreadcrumb: {
                    label: '立项不及时情况表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/form/common/complianceReportCtrl.js');
                        }]
                }
            })
            .state('app.comInfo.form.complianceReport.DelayedEntryOfInsurancePolicies', {
                url: '/DelayedEntryOfInsurancePolicies',
                params: {"id": null},
                templateUrl: getURL('insurance/view/zgxt/DelayedEntryOfInsurancePolicies.html'),
                ncyBreadcrumb: {
                    label: '延时录入保单情况表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/form/common/complianceReportCtrl.js');
                        }]
                }
            })
            .state('app.comInfo.form.businessStatisticalAnalysis', {
                url: '/businessStatisticalAnalysis',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '银保监会业务统计分析'
                }
            })
            .state('app.comInfo.form.businessStatisticalAnalysis.basicSituation', {
                url: '/basicSituation',
                params: {"id": null},
                templateUrl: getURL('insurance/comInfo/form/businessStatisticalAnalysis/basicSituation/basicSituation.html'),
                ncyBreadcrumb: {
                    label: '保险专业中介机构基本情况表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/form/common/complianceReportCtrl.js');
                        }]
                }
            })
            .state('app.comInfo.form.businessStatisticalAnalysis.unlife', {
                url: '/unlife',
                params: {"id": null},
                templateUrl: getURL('insurance/comInfo/form/businessStatisticalAnalysis/unlife/unlife.html'),
                ncyBreadcrumb: {
                    label: '保险经纪机构业务报表-产险业务'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/form/common/complianceReportCtrl.js');
                        }]
                }
            })
            .state('app.comInfo.form.businessStatisticalAnalysis.life', {
                url: '/life',
                params: {"id": null},
                templateUrl: getURL('insurance/comInfo/form/businessStatisticalAnalysis/life/life.html'),
                ncyBreadcrumb: {
                    label: '保险经纪机构业务报表-人身险业务'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/form/common/complianceReportCtrl.js');
                        }]
                }
            })
            .state('app.comInfo.form.businessStatisticalAnalysis.again', {
                url: '/again',
                params: {"id": null},
                templateUrl: getURL('insurance/comInfo/form/businessStatisticalAnalysis/again/again.html'),
                ncyBreadcrumb: {
                    label: '保险经纪机构业务报表-再保险业务'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/form/common/complianceReportCtrl.js');
                        }]
                }
            })
            .state('app.comInfo.form.businessStatisticalAnalysis.consult', {
                url: '/consult',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/consult/consult.html'),
                ncyBreadcrumb: {
                    label: '保险经纪机构业务报表-咨询业务'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/form/common/complianceReportCtrl.js');
                        }]
                }
            })
            .state('app.comInfo.form.businessStatisticalAnalysis.profits', {
                url: '/profits',
                params: {"id": null},
                templateUrl: getURL('insurance/comInfo/form/businessStatisticalAnalysis/profits/profits.html'),
                ncyBreadcrumb: {
                    label: '保险专业中介公司利润表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/form/common/complianceReportCtrl.js');
                        }]
                }
            })
            .state('app.comInfo.form.businessStatisticalAnalysis.liabilities', {
                url: '/liabilities',
                params: {"id": null},
                templateUrl: getURL('insurance/comInfo/form/businessStatisticalAnalysis/liabilities/liabilities.html'),
                ncyBreadcrumb: {
                    label: '保险专业中介公司资产负债表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/form/common/complianceReportCtrl.js');
                        }]
                }
            })
            .state('app.contManage.policyInfo.liability', {
                url: '/liability',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '职业责任险'
                }
            })
            .state('app.contManage.policyInfo.liability.professionalLiabilityInsurance', {
                url: '/professionalLiabilityInsurance',
                params: {"id": null},
                templateUrl: getURL('insurance/contManage/policyInfo/liability/pliView/professionalLiabilityInsurance.html'),
                ncyBreadcrumb: {
                    label: '职业责任险保单信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/contManage/policyInfo/liability/pliView/professionalLiabilityInsuranceCtrl.js');
                        }]
                }
            })
            //属地化服务一级菜单
            .state('app.localized', {
                url: '/localized',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '属地化服务'
                }
            })
            //服务记录
            .state('app.localized.dailyConsultation', {
                url: '/dailyConsultation',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '服务记录'
                }
            })
            .state('app.localized.dailyConsultation.dailyConsultation', {
                url: '/dailyConsultation',
                params: {"id": null},
                templateUrl: getURL('localized/dailyConsultation/dailyConsultation/dailyConsultation.html'),
                ncyBreadcrumb: {
                    label: '日常咨询'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('localized/dailyConsultation/dailyConsultation/dailyConsultationCtrl.js');
                        }]
                }
            })
            .state('app.localized.dailyConsultation.disasterPrevention', {
                url: '/disasterPrevention',
                params: {"id": null},
                templateUrl: getURL('localized/dailyConsultation/disasterPrevention/disasterPrevention.html'),
                ncyBreadcrumb: {
                    label: '防灾防损'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('localized/dailyConsultation/disasterPrevention/disasterPreventionCtrl.js');
                        }]
                }
            })
            //短信查询
            .state('app.localized.dailyConsultation.messageQuery', {
                url: '/messageQuery',
                params: {"id": null},
                templateUrl: getURL('localized/dailyConsultation/messageQuery/messageQuery.html'),
                ncyBreadcrumb: {
                    label: '短信查询'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('localized/dailyConsultation/messageQuery/messageQueryCtrl.js');
                        }]
                }
            })
            //台账信息
            .state('app.localized.standingBook', {
                url: '/standingBook',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '台账信息'
                }
            })
            .state('app.localized.standingBook.standingBook', {
                url: '/standingBook',
                params: {"id": null},
                templateUrl: getURL('localized/standingBook/standingBook.html'),
                ncyBreadcrumb: {
                    label: '台账信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('localized/standingBook/standingBookCtrl.js');
                        }]
                }
            })
            //属地化服信息管理
            .state('app.localized.projectInformation', {
                url: '/projectInformation',
                params: {"id": null},
                templateUrl: getURL('localized/projectInformation/projectInformation.html'),
                ncyBreadcrumb: {
                    label: '项目管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('localized/projectInformation/projectInformationCtrl.js');
                        }]
                }
            })
            .state('app.localized.caseinformation', {
                url: '/caseinformation',
                params: {"id": null, "refArray":['PROJECTTYPES','CLAIMTYPE','WORKTYPEUNILFE','WORKTYPEILFE']},
                templateUrl: getURL('localized/caseinformation/caseInformation.html'),
                ncyBreadcrumb: {
                    label: '案件管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('localized/caseinformation/caseInformationCtrl.js');
                        }]
                }
            })
            //属地化服务附件管理
            .state('app.localized.projectAttachment', {
                url: '/projectAttachment',
                params: {"id": null},
                templateUrl: getURL('localized/projectAttachment/projectAttachment.html'),
                ncyBreadcrumb: {
                    label: '项目附件管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('localized/projectAttachment/projectAttachmentCtrl.js');
                        }]
                }
            })
            //客户产权关系管理
            .state('app.specialRevise.customerPropertyRight', {
                url: '/customerPropertyRight',
                params: {"id": null, "refArray":['PKCORPZIGS','CUSTOMERPR']},
                templateUrl: getURL('insurance/specialRevise/customerPropertyRight/customerPropertyRight.html'),
                ncyBreadcrumb: {
                    label: '客户产权关系管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/specialRevise/customerPropertyRight/customerPropertyRightCtrl.js');
                        }]
                }
            })
            //数据修改
            .state('app.specialRevise.dataModification', {
                url: '/policyReplacement',
                params: {"id": null},
                templateUrl: getURL('insurance/specialRevise/policyReplacement/policyReplacement.html'),
                ncyBreadcrumb: {
                    label: '数据修改'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/specialRevise/policyReplacement/policyReplacementCtrl.js');
                        }]
                }
            })
            .state('app.localized.customerTrain', {
                url: '/customerTrain',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '培训工作管理'
                }
            })
            .state('app.localized.customerTrain.localizedCustomerTrain', {
                url: '/localizedCustomerTrain',
                params: {"id": null},
                templateUrl: getURL('localized/customerTrain/localizedCustomerTrain/localizedCustomerTrain.html'),
                ncyBreadcrumb: {
                    label: '培训工作计划'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('localized/customerTrain/localizedCustomerTrain/localizedCustomerTrainCtrl.js');
                        }]
                }
            })
            .state('app.localized.customerTrain.localizedTrainTranslate', {
                url: '/localizedTrainTranslate',
                params: {"id": null},
                templateUrl: getURL('localized/customerTrain/localizedTrainTranslate/localizedTrainTranslate.html'),
                ncyBreadcrumb: {
                    label: '培训工作总结'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('localized/customerTrain/localizedTrainTranslate/localizedTrainTranslateCtrl.js');
                        }]
                }
            })
            //联系人管理
            .state('app.localized.localizedPerson', {
                url: '/localizedPerson',
                params: {"id": null},
                templateUrl: getURL('localized/localizedPerson/localizedPerson.html'),
                ncyBreadcrumb: {
                    label: '联系人管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('localized/localizedPerson/localizedPersonCtrl.js');
                        }]
                }
            })
            //联席会
            .state('app.localized.customerTrain.localizedAssociation', {
                url: '/localizedAssociation',
                params: {"id": null},
                templateUrl: getURL('localized/localizedAssociation/localizedAssociation.html'),
                ncyBreadcrumb: {
                    label: '联席会'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('localized/localizedAssociation/localizedAssociationCtrl.js');
                        }]
                }
            })
            //服务评价
            .state('app.localized.serviceEvaluate', {
                url: '/serviceEvaluate',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '服务评价'
                }
            })
            //属地化模板管理
            .state('app.localized.template', {
                url: '/localImportConfig',
                params: {"id": null, "refArray":['PROJECTTYPES']},
                templateUrl: getURL('localized/localImportConfig/localImportConfig.html'),
                ncyBreadcrumb: {
                    label: '模板管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('localized/localImportConfig/localImportConfigCtrl.js');
                        }]
                }
            })
            //保险公司服务质量评价管理
            .state('app.localized.serviceEvaluate.insurerServiceEvaluate', {
                url: '/insurerServiceEvaluate',
                params: {"id": null},
                templateUrl: getURL('localized/insurerServiceEvaluate/insurerServiceEvaluate.html'),
                ncyBreadcrumb: {
                    label: '保险公司服务质量评价管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('localized/insurerServiceEvaluate/insurerServiceEvaluateCtrl.js');
                        }]
                }
            })
            //客户服务工作报告管理
            .state('app.localized.serviceEvaluate.customerServiceEvaluate', {
                url: '/customerServiceEvaluate',
                params: {"id": null},
                templateUrl: getURL('localized/customerServiceEvaluate/customerServiceEvaluate.html'),
                ncyBreadcrumb: {
                    label: '客户服务工作报告管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('localized/customerServiceEvaluate/customerServiceEvaluateCtrl.js');
                        }]
                }
            })
            //保单中心
            .state('app.billCenter', {
                url: '/benefitInsured',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '保单中心'
                }
            })
            //惠民保一级菜单
            .state('app.billCenter.benefitInsured', {
                url: '/benefitInsured',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '津惠保'
                }
            })
            //惠民保订单列表
            .state('app.billCenter.benefitInsured.benefitInsuredOrder', {
                url: '/benefitInsuredOrder',
                params: {"id": null},
                templateUrl: getURL('insurance/benefitInsured/benefitInsuredOrder/benefitInsuredOrder.html'),
                ncyBreadcrumb: {
                    label: '津惠保订单'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/benefitInsured/benefitInsuredOrder/benefitInsuredOrderCtrl.js');
                        }]
                }
            })
            .state('app.busManage.fileAdministration', {
                url: '/fileAdministration',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务档案管理'
                }
            })
            // 经纪业务档案
            .state('app.busManage.fileAdministration.fileAdministration', {
                url: '/fileAdministration',
                params: {"id": null},
                templateUrl: getURL('fileAdministration/fileAdministration/fileAdministration.html'),
                ncyBreadcrumb: {
                    label: '经纪业务档案'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('fileAdministration/fileAdministration/fileAdministrationCtrl.js');
                        }]
                }
            })
            //再保险档案
            .state('app.busManage.fileAdministration.reinsuranceArchives', {
                url: '/reinsuranceArchives',
                params: {"id": null},
                templateUrl: getURL('fileAdministration/reinsuranceArchives/reinsuranceArchives.html'),
                ncyBreadcrumb: {
                    label: '再保险业务档案'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('fileAdministration/reinsuranceArchives/reinsuranceArchivesCtrl.js');
                        }]
                }
            })
            //风险咨询业务档案管理
            // .state('app.busManage.fileAdministration.riskConsulationArchives', {
            //     url: '/riskConsulationArchives',
            //     params: {"id": null},
            //     templateUrl: getURL('insurance/view/riskConsulationArchives/riskConsulationArchives.html'),
            //     ncyBreadcrumb: {
            //         label: '风险咨询业务档案管理'
            //     },
            //     resolve: {
            //         deps: ['uiLoad',
            //             function (uiLoad) {
            //                 return uiLoad.load('insurance/controller/riskConsulationArchivesCtrl.js');
            //             }]
            //     }
            // })
            //咨询业务档案
            .state('app.busManage.fileAdministration.consultArchives', {
                url: '/consultArchives',
                params: {"id": null},
                templateUrl: getURL('fileAdministration/consultArchives/consultArchives.html'),
                ncyBreadcrumb: {
                    label: '咨询业务档案'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('fileAdministration/consultArchives/consultArchivesCtrl.js');
                        }]
                }
            })
            // 互联网业务档案
            .state('app.busManage.fileAdministration.fictitiousArchives', {
                url: '/fictitiousArchives',
                params: {"id": null,"refArray":['PRODUCTTYPE','CLEARINGFILETYPE','BASEARCHIVESTEMPLATETYPE']},
                templateUrl: getURL('fileAdministration/fictitiousArchives/fictitiousArchives.html'),
                ncyBreadcrumb: {
                    label: '互联网业务档案'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('fileAdministration/fictitiousArchives/fictitiousArchivesCtrl.js');
                        }]
                }
            })
            //系统业务管理
            .state('app.specialRevise', {
                url: '/specialRevise',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '系统业务管理'
                }
            })
            //特殊修改
            .state('app.specialRevise.specialDataRevise', {
                url: '/specialDataRevise',
                params: {"id": null},
                templateUrl: getURL('insurance/specialRevise/specialDataRevise/specialDataRevise.html'),
                ncyBreadcrumb: {
                    label: '特殊修改'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/specialRevise/specialDataRevise/specialDataReviseCtrl.js');
                        }]
                }
            })
            //参照管理
            .state('app.specialRevise.referToManage', {
                url: '/referToManage',
                params: {"id": null},
                templateUrl: getURL('insurance/specialRevise/referToManage/referToManage.html'),
                ncyBreadcrumb: {
                    label: '参照管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/specialRevise/referToManage/referToManageCtrl.js');
                        }]
                }
            })
            // 个险业务档案管理
            .state('app.busManage.fileAdministration.personalInsuranceArchives', {
                url: '/personalInsuranceArchives',
                params: {"id": null},
                templateUrl: getURL('fileAdministration/personalInsuranceArchives/personalInsuranceArchives.html'),
                ncyBreadcrumb: {
                    label: '个险业务档案'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('fileAdministration/personalInsuranceArchives/personalInsuranceArchivesCtrl.js');
                        }]
                }
            })
            .state('app.salesMarketingManagement', {
                url: '/salesMarketingManagement',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '销售及营销管理'
                }
            })
            .state('app.base.license.agent', {
                url: '/agent',
                templateUrl: getURL('insurance/base/license/agent/agent.html'),
                ncyBreadcrumb: {
                    label: '执业人员信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/base/license/agent/agentCtrl.js');
                        }]
                }
            })
            .state('app.base.trainingRecord', {
                url: '/trainingRecord',
                templateUrl: getURL('insurance/base/trainingRecord/trainingRecord.html'),
                ncyBreadcrumb: {
                    label: '培训管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/base/trainingRecord/trainingRecordCtrl.js');
                        }]
                }
            })
            .state('app.salesMarketingManagement.agentPayment', {
                url: '/agentPayment',
                templateUrl: getURL('insurance/salesMarketingManagement/agentPayment/agentPayment.html'),
                ncyBreadcrumb: {
                    label: '手续费明细信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/salesMarketingManagement/agentPayment/agentPaymentCtrl.js');
                        }]
                }
            })
            .state('app.salesMarketingManagement.poundage', {
                url: '/poundage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '手续费管理'
                }
            })
            .state('app.salesMarketingManagement.poundage.serviceTemplate', {
                url: '/serviceTemplate',
                templateUrl: getURL('insurance/salesMarketingManagement/poundage/serviceTemplate/serviceTemplate.html'),
                ncyBreadcrumb: {
                    label: '手续费模板信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/salesMarketingManagement/poundage/serviceTemplate/serviceTemplateCtrl.js');
                        }]
                }
            })
            .state('app.salesMarketingManagement.poundage.agentRule', {
                url: '/agentRule',
                params: {"id": null},
                templateUrl: getURL('insurance/salesMarketingManagement/poundage/agentRule/agentRule.html'),
                ncyBreadcrumb: {
                    label: '代理人手续费信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/salesMarketingManagement/poundage/agentRule/agentRuleCtrl.js');
                        }]
                }
            })
            .state('app.salesMarketingManagement.poundage.agentClearing', {
                url: '/agentClearing',
                params: {"id": null},
                templateUrl: getURL('insurance/salesMarketingManagement/agentClearing/agentClearing.html'),
                ncyBreadcrumb: {
                    label: '手续费结算信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/salesMarketingManagement/agentClearing/agentClearingCtrl.js');
                        }]
                }
            })
            .state('app.salesMarketingManagement.agentAnalyse', {
                url: '/agentAnalyse',
                templateUrl: getURL('insurance/salesMarketingManagement/agentAnalyse/agentAnalyse.html'),
                ncyBreadcrumb: {
                    label: '代理制业务统计分析'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/salesMarketingManagement/agentAnalyse/agentAnalyseCtrl.js');
                        }]
                }
            })
            .state('app.base.foreignSubmitFile', {
                url: '/foreignSubmitFile',
                params: {"id": null},
                templateUrl: getURL('insurance/base/foreignSubmitFile/foreignSubmitFile.html'),
                ncyBreadcrumb: {
                    label: '对外报送文件管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/base/foreignSubmitFile/foreignSubmitFileCtrl.js');
                        }]
                }
            })
            .state('app.claimMoneyPlatform.advancePremiums', {
                url: '/advancePremiums',
                params: {"id": null},
                templateUrl: getURL('insurance/claimMoneyPlatform/advancePremiums/advancePremiums.html'),
                ncyBreadcrumb: {
                    label: '车险预收保费'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/claimMoneyPlatform/advancePremiums/advancePremiumsCtrl.js');
                        }]
                }
            })
            .state('app.auditManager.advancePremiumsAudit', {
                url: '/advancePremiumsAudit',
                params: {"id": null},
                templateUrl: getURL('insurance/auditManager/advancePremiumsAudit/advancePremiumsAudit.html'),
                ncyBreadcrumb: {
                    label: '车险预收保费确认'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/auditManager/advancePremiumsAudit/advancePremiumsAuditCtrl.js');
                        }]
                }
            })
            .state('app.comInfo.bussinessAssessmentManagement', {
                url: '/bussinessAssessmentManagement',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务考核管理'
                }
            })
            .state('app.comInfo.bussinessAssessmentManagement.assessmentManagement', {
                url: '/assessmentManagement',
                templateUrl: getURL('insurance/comInfo/bussinessAssessmentManagement/assessmentManagement/assessmentManagement.html'),
                ncyBreadcrumb: {
                    label: '考核指标管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/bussinessAssessmentManagement/assessmentManagement/assessmentManagementCtrl.js');
                        }]
                }
            })
            .state('app.comInfo.bussinessAssessmentManagement.bussinessAssessmentReport', {
                url: '/bussinessAssessmentReport',
                templateUrl: getURL('insurance/comInfo/bussinessAssessmentManagement/bussinessAssessmentReport/bussinessAssessmentReport.html'),
                ncyBreadcrumb: {
                    label: '业务考核报表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/comInfo/bussinessAssessmentManagement/bussinessAssessmentReport/bussinessAssessmentReportCtrl.js');
                        }]
                }
            })
            .state('app.claimMoneyPlatform.merchantNumberManage', {
                url: '/erchantNumberManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '商户号管理'
                }
            })
            .state('app.claimMoneyPlatform.merchantNumberManage.merchantNumber', {
                url: '/merchantNumber',
                params: {"id": null,"refArray":['THIRDORGTYPE','USINGTYPE']},
                templateUrl: getURL('insurance/claimMoneyPlatform/erchantNumberManage/merchantNumber/merchantNumber.html'),
                ncyBreadcrumb: {
                    label: '商户号列表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/claimMoneyPlatform/erchantNumberManage/merchantNumber/merchantNumberCtrl.js');
                        }]
                }
            })
            .state('app.claimMoneyPlatform.merchantNumberManage.merchantNumberFlow', {
                url: '/merchantNumberFlow',
                params: {"id": null,"refArray":['THIRDORGTYPE']},
                templateUrl: getURL('insurance/claimMoneyPlatform/erchantNumberManage/merchantNumberFlow/merchantNumberFlow.html'),
                ncyBreadcrumb: {
                    label: '商户号流水管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/claimMoneyPlatform/erchantNumberManage/merchantNumberFlow/merchantNumberFlowCtrl.js');
                        }]
                }
            })
            .state('app.auditManager.merchantNumberFlowAudit', {
                url: '/merchantNumberFlowAudit',
                params: {"id": null,"refArray":['THIRDORGTYPE']},
                templateUrl: getURL('insurance/auditManager/merchantNumberFlowAudit/merchantNumberFlowAudit.html'),
                ncyBreadcrumb: {
                    label: '商户号流水审核'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/auditManager/merchantNumberFlowAudit/merchantNumberFlowAuditCtrl.js');
                        }]
                }
            })
            .state('app.dataModification', {
                url: '/dataModification',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '数据修改申请'
                }
            })
            .state('app.dataModification.self', {
                url: '/dataModificationSelf',
                params: {"id": null,"type":"self","funCode":"1901"},
                templateUrl: getURL('insurance/dataModification/dataModification/dataModification.html'),
                ncyBreadcrumb: {
                    label: '自查数据修改申请'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/dataModification/dataModification/dataModificationCtrl.js');
                        }]
                }
            })
            .state('app.dataModification.add', {
                url: '/dataModificationAdd',
                params: {"id": null,"type":"add","funCode":"1902"},
                templateUrl: getURL('insurance/dataModification/dataModification/dataModification.html'),
                ncyBreadcrumb: {
                    label: '业务工单'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/dataModification/dataModification/dataModificationCtrl.js');
                        }]
                }
            })
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
    }]);