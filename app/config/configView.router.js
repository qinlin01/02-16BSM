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
        $urlRouterProvider.otherwise("/app/dashboard");
        //
        // Set up the states
        $stateProvider.state('app', {
            url: "/app",
            controller: 'navCtrl',
            templateUrl: "../insurance/appView.html",
            resolve: loadSequence('navCtrl', 'modernizr', 'moment', 'angularMoment', 'uiSwitch', 'perfect-scrollbar-plugin', 'toaster', 'ngAside', 'vAccordion', 'sweet-alert', 'chartjs', 'tc.chartjs', 'oitozero.ngSweetAlert', 'chatCtrl', 'truncate', 'htmlToPlaintext', 'angular-notification-icons', 'angularBootstrapNavTree'),
            abstract: true
        }).state('app.dashboard', {
            url: "/dashboard",
            templateUrl: getURL('insurance/dashboard.html'),
            resolve: {
                deps: ['uiLoad',
                    function (uiLoad) {
                        return uiLoad.load(['insurance/controller/dashboardCtrl.js',
                            'insurance/controller/mainToDoManagementCtrl.js',
                            'insurance/controller/mainTradeRemindingCtrl.js',
                            'insurance/controller/mainBusStatisticsCtrl.js',
                            'insurance/controller/mainInfoEarlyWarningCtrl.js',
                            'insurance/controller/mainStatisticalChartCtrl.js',
                            'insurance/controller/mainShowTopMessageCtrl.js']);
                    }]
            },
            title: 'Dashboard',
            ncyBreadcrumb: {
                label: '桌面'
            }
        })
            // Login routes
            .state('login', {
                url: '/login',
                template: '<div ui-view class="fade-in-right-big smooth"></div>',
                abstract: true
            }).state('login.signin', {
            url: '/signin',
            templateUrl: "../insurance/login.html",
            resolve: loadSequence('loginCtrl'),
        }).state('login.forgot', {
            url: '/forgot',
            templateUrl: "../app/assets/views/login_forgot.html"
        }).state('login.registration', {
            url: '/registration',
            templateUrl: "../app/assets/views/login_registration.html"
        }).state('login.lockscreen', {
            url: '/lock',
            templateUrl: "../app/assets/views/login_lock_screen.html"
        })
            .state('app.basicDoc', {
                url: '/basicDoc',
                template: '<div ui-view class="fade-in-right-big smooth"></div>',
                abstract: true
            }).state('app.basicDoc.product', {
            url: '/product',
            templateUrl: 'assets/views/product/product.html',
            resolve: loadSequence('productCtrl'),
        })
            .state('app.base', {
                url: '/base',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '基础信息管理'
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

            .state('app.base.informationChange', {
                url: '/informationChange',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '信息变更管理'
                }
            })
            .state('app.base.business', {
                url: '/business',
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
                    label: '业务管理'
                }
            })

            .state('app.comInfo', {
                url: '/comInfo',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '综合信息查询'
                }
            })

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
                templateUrl: getURL('insurance/view/assessorsProject/assessorsProject.html'),
                ncyBreadcrumb: {
                    label: '立项信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/assessorsProjectCtrl.js',
                                'insurance/controller/upLoadCtrls.js']
                            );
                        }]
                }
            })

            .state('app.contManage', {
                url: '/contManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务合同信息录入及结算管理'
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
                templateUrl: getURL('insurance/view/assessorsProject/assessorsProject.html'),
                ncyBreadcrumb: {
                    label: '立项信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/assessorsProjectCtrl.js',
                                'insurance/controller/upLoadCtrls.js']
                            );
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

            .state('app.systemBusManage', {
                url: '/systemBusManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '系统业务设置'
                }
            })

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
                    label: '保单信息'
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

            .state('app.contManage.consulFeeManage', {
                url: '/consulFeeManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '咨询费管理'
                }
            })

            .state('app.contManage.otherManage', {
                url: '/otherManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '其他管理'
                }
            })

            .state('app.contManage.billingInfo', {
                url: '/billingInfo',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '结算信息'
                }
            })

            .state('app.contManage.billingInfo.clearing', {
                url: '/clearing',
                templateUrl: getURL('insurance/view/clearing/clearing.html'),
                ncyBreadcrumb: {
                    label: '财务结算'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/clearingCtrl.js');
                        }]
                }
            })

            .state('app.contManage.billingInfo.financialAudit', {
                url: '/financialAudit',
                templateUrl: getURL('insurance/view/financialAudit/financialAudit.html'),
                ncyBreadcrumb: {
                    label: '财务审核'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/financialAuditCtrl.js');
                        }]
                }
            })

            .state('app.contManage.busLedger', {
                url: '/busLedger',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务台账'
                }
            })

            .state('app.contManage.busLedger.queryTotal', {
                url: '/queryTotal',
                templateUrl: getURL('insurance/view/queryTotal/queryTotal.html'),
                ncyBreadcrumb: {
                    label: '总账查询'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/queryTotalCtrl.js');
                        }]
                }
            })

            .state('app.contManage.busLedger.queryDetail', {
                url: '/queryDetail',
                templateUrl: getURL('insurance/view/queryDetail/queryDetail.html'),
                ncyBreadcrumb: {
                    label: '明细账查询'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/queryDetailCtrl.js');
                        }]
                }
            })

            .state('app.contManage.busLedger.paymentQuery', {
                url: '/paymentQuery',
                templateUrl: getURL('insurance/view/paymentQuery/paymentQuery.html'),
                ncyBreadcrumb: {
                    label: '收付款查询'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/paymentQueryCtrl.js');
                        }]
                }
            })

            .state('app.contManage.busLedger.voucherHeader', {
                url: '/voucherHeader',
                templateUrl: getURL('insurance/view/voucherHeader/voucherHeader.html'),
                ncyBreadcrumb: {
                    label: '查询凭证'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/voucherHeaderCtrl.js');
                        }]
                }
            })


            .state('app.contManage.busLedger.queryReconciliation', {
                url: '/queryReconciliation',
                templateUrl: getURL('insurance/view/queryReconciliation/queryReconciliation.html'),
                ncyBreadcrumb: {
                    label: '系统间对账'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/queryReconciliationCtrl.js');
                        }]
                }
            })

            .state('app.contManage.busLedger.queryDetail2', {
                url: '/queryDetail2',
                templateUrl: getURL('insurance/view/queryDetail2/queryDetail2.html'),
                ncyBreadcrumb: {
                    label: '保单收付明细查询'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/queryDetail2Ctrl.js');
                        }]
                }
            })


            .state('app.busManage.busSign', {
                url: '/busSign',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务签报'
                }
            })

            .state('app.comInfo.form', {
                url: '/form',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '报表'
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
                templateUrl: getURL('insurance/view/accQuery/accQuery.html'),
                ncyBreadcrumb: {
                    label: '附件查询'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/accQueryCtrl.js');
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

            .state('app.comInfo.form.clientClass', {
                url: '/clientClass',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '客户类'
                }
            })


            .state('app.comInfo.form.clientClass.customerCount', {
                url: '/customerCount',
                templateUrl: getURL('insurance/view/customerCount/customerCount.html'),
                ncyBreadcrumb: {
                    label: '各单位客户数量统计'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/customerCountCtrl.js');
                        }]
                }
            })


            .state('app.comInfo.form.clientClass.customerBusCount', {
                url: '/customerBusCount',
                templateUrl: getURL('insurance/view/customerBusCount/customerBusCount.html'),
                ncyBreadcrumb: {
                    label: '客户业务工作量统计表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/customerBusCountCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.clientClass.customerStaCount', {
                url: '/customerStaCount',
                templateUrl: getURL('insurance/view/customerStaCount/customerStaCount.html'),
                ncyBreadcrumb: {
                    label: '客户状态统计表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/customerStaCountCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.clientClass.monCusCount', {
                url: '/monCusCount',
                templateUrl: getURL('insurance/view/monCusCount/monCusCount.html'),
                ncyBreadcrumb: {
                    label: '月度客户数量统计'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/monCusCountCtrl.js');
                        }]
                }
            })


            .state('app.comInfo.form.marketPlanForm', {
                url: '/marketPlanForm',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '营销计划报表'
                }
            })

            .state('app.comInfo.form.marketPlanForm.surinfStatistic', {
                url: '/surinfStatistic',
                templateUrl: getURL('insurance/view/surinfStatistic/surinfStatistic.html'),
                ncyBreadcrumb: {
                    label: '各单位市场调研报告完成情况统计'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/surinfStatisticCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.marketPlanForm.busFinish', {
                url: '/busFinish',
                templateUrl: getURL('insurance/view/busFinish/busFinish.html'),
                ncyBreadcrumb: {
                    label: '营销计划完成情况-业务来源'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/busFinishCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.marketPlanForm.insurFinish', {
                url: '/insurFinish',
                templateUrl: getURL('insurance/view/insurFinish/insurFinish.html'),
                ncyBreadcrumb: {
                    label: '统保险种营销计划完成情况'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/insurFinishCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.marketPlanForm.busPlanFinish', {
                url: '/busPlanFinish',
                templateUrl: getURL('insurance/view/busPlanFinish/busPlanFinish.html'),
                ncyBreadcrumb: {
                    label: '各单位营销方案编制完成情况统计'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/busPlanFinishCtrl.js');
                        }]
                }
            })


            .state('app.comInfo.form.initProjectForm', {
                url: '/initProjectForm',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '立项报表'
                }
            })

            .state('app.comInfo.form.initProjectForm.staShareholderProjectUnits', {
                url: '/staShareholderProjectUnits',
                templateUrl: getURL('insurance/view/staShareholderProjectUnits/staShareholderProjectUnits.html'),
                ncyBreadcrumb: {
                    label: '各单位股东业务立项统计表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/staShareholderProjectUnitsCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.initProjectForm.deptStatistic', {
                url: '/deptStatistic',
                templateUrl: getURL('insurance/view/deptStatistic/deptStatistic.html'),
                ncyBreadcrumb: {
                    label: '各单位立项统计表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/deptStatisticCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.initProjectForm.proStatistic', {
                url: '/proStatistic',
                templateUrl: getURL('insurance/view/proStatistic/proStatistic.html'),
                ncyBreadcrumb: {
                    label: '立项考核统计表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/proStatisticCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.initProjectForm.proQuery', {
                url: '/proQuery',
                templateUrl: getURL('insurance/view/proQuery/proQuery.html'),
                ncyBreadcrumb: {
                    label: '立项明细查询'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/proQueryCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.initProjectForm.incomeStatistic', {
                url: '/incomeStatistic',
                templateUrl: getURL('insurance/view/incomeStatistic/incomeStatistic.html'),
                ncyBreadcrumb: {
                    label: '收入按业务来源及行业统计'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/incomeStatisticCtrl.js');
                        }]
                }
            })


            .state('app.comInfo.form.busFileForm', {
                url: '/busFileForm',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务文件报表'
                }
            })

            .state('app.comInfo.form.clientService', {
                url: '/clientService',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '客户服务'
                }
            })

            .state('app.comInfo.form.checkReport', {
                url: '/checkReport',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '考核报表'
                }
            })

            .state('app.comInfo.form.checkReport.monthlyAssessment', {
                url: '/monthlyAssessment',
                templateUrl: getURL('insurance/view/monthlyAssessment/monthlyAssessment.html'),
                ncyBreadcrumb: {
                    label: '分公司月度考核评分统计表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/monthlyAssessmentCtrl.js');

                        }]
                }
            })

            .state('app.comInfo.form.perMonthReport', {
                url: '/perMonthReport',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '月度报表'
                }
            })

            .state('app.comInfo.form.policyEnquReport', {
                url: '/policyEnquReport',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '保单查询报表'
                }
            })

            .state('app.comInfo.form.policyEnquReport.delayInput', {
                url: '/delayInput',
                templateUrl: getURL('insurance/view/delayInput/delayInput.html'),
                ncyBreadcrumb: {
                    label: '保单延迟录入情况'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/delayInputCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.policyEnquReport.closeAccTable', {
                url: '/closeAccTable',
                templateUrl: getURL('insurance/view/closeAccTable/closeAccTable.html'),
                ncyBreadcrumb: {
                    label: '保单结算情况统计表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/closeAccTableCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.policyEnquReport.busStaTable', {
                url: '/busStaTable',
                templateUrl: getURL('insurance/view/busStaTable/busStaTable.html'),
                ncyBreadcrumb: {
                    label: '业务结算情况统计表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/busStaTableCtrl.js');
                        }]
                }
            })


            .state('app.comInfo.form.shareHolderReport', {
                url: '/shareHolderReport',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '股东业务收入营销计划情况表'
                }
            })

            .state('app.comInfo.form.shareHolderFinishReport', {
                url: '/shareHolderFinishReport',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '股东业务收入营销计划完成情况表'
                }
            })

            .state('app.comInfo.form.shareHolderManageReport', {
                url: '/shareHolderManageReport',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '股东业务管理情况阶段报表'
                }
            })

            .state('app.comInfo.form.shareHolderManageReport.busProTable', {
                url: '/busProTable',
                templateUrl: getURL('insurance/view/busProTable/busProTable.html'),
                ncyBreadcrumb: {
                    label: '股东业务立项情况表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/busProTableCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.shareHolderManageReport.busInvTable', {
                url: '/busInvTable',
                templateUrl: getURL('insurance/view/busInvTable/busInvTable.html'),
                ncyBreadcrumb: {
                    label: '股东业务调研报告情况表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/busInvTableCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.shareHolderManageReport.busArrTable', {
                url: '/busArrTable',
                templateUrl: getURL('insurance/view/busArrTable/busArrTable.html'),
                ncyBreadcrumb: {
                    label: '股东业务保险安排情况表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/busArrTableCtrl.js');
                        }]
                }
            })


            .state('app.comInfo.form.shareHolderBusAnaReport', {
                url: '/shareHolderBusAnaReport',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '股东统保业务分析阶段报表'
                }
            })

            .state('app.comInfo.form.marketReport', {
                url: '/marketReport',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '市场部报表'
                }
            })

            .state('app.comInfo.form.marketReport.addDetailTable', {
                url: '/addDetailTable',
                templateUrl: getURL('insurance/view/addDetailTable/addDetailTable.html'),
                ncyBreadcrumb: {
                    label: '新增市场客户明细表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/addDetailTableCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.marketReport.insExpTable', {
                url: '/insExpTable',
                templateUrl: getURL('insurance/view/insExpTable/insExpTable.html'),
                ncyBreadcrumb: {
                    label: '保单到期10个工作日（含）以上业务明细表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/insExpTableCtrl.js');
                        }]
                }
            })


            .state('app.comInfo.form.busPlanMarketReport', {
                url: '/busPlanMarketReport',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业管部+发策部+营销部月报表'
                }
            })

            .state('app.comInfo.form.busPlanMarketReport.contractSignTable', {
                url: '/contractSignTable',
                templateUrl: getURL('insurance/view/contractSignTable/contractSignTable.html'),
                ncyBreadcrumb: {
                    label: '合同签署情况统计表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/contractSignTableCtrl.js');
                        }]
                }
            })


            .state('app.comInfo.form.busManageDouReport', {
                url: '/busManageDouReport',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务管理系统对标报表'
                }
            })

            .state('app.comInfo.form.busManageDouReport.shareHolderBusPlanNorm', {
                url: '/shareHolderBusPlanNorm',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '股东业务开发及管理类指标'
                }
            })

            .state('app.comInfo.form.busManageDouReport.marketBusPlanNorm', {
                url: '/marketBusPlanNorm',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '市场业务开发及管理类指标'
                }
            })

            .state('app.comInfo.form.busManageDouReport.clientServiceNorm', {
                url: '/clientServiceNorm',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '客户服务工作类指标'
                }
            })


            .state('app.comInfo.form.clientService.comStaForm', {
                url: '/comStaForm',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '客户服务综合统计表'
                }
            })


            .state('app.busManage.makePlan', {
                url: '/makePlan',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '制定营销计划及方案'
                }
            })

            .state('app.busManage.busDevelop', {
                url: '/busDevelop',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务开发'
                }
            })

            .state('app.busManage.busQuality', {
                url: '/busQuality',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务质量管理'
                }
            })

            .state('app.busManage.expertManage', {
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

            .state('app.busManage.contractEnquiry.contractDetailFile_up', {
                url: '/contractDetailFile_up',
                templateUrl: getURL('insurance/view/contractDetailFile_up/contractDetailFile_up.html'),
                ncyBreadcrumb: {
                    label: '合同信息导入'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/contractDetailFile_upCtrl.js');
                        }]
                }
            })

            .state('app.busManage.contractEnquiry.ContractDetail', {
                url: '/ContractDetail',
                templateUrl: getURL('insurance/view/contractDetail/contractDetail.html'),
                ncyBreadcrumb: {
                    label: '合同信息查询'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(
                                ['insurance/controller/contractDetailCtrl.js',
                                    'insurance/controller/upLoadCtrls.js']);
                        }]
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

            .state('app.busManage.customerService.planManage', {
                url: '/planManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '客户服务计划管理'
                }
            })

            .state('app.busManage.customerService.planManage.cusServicePlan', {
                url: '/cusServicePlan',
                templateUrl: getURL('insurance/view/cusServicePlan/cusServicePlan.html'),
                ncyBreadcrumb: {
                    label: '客户服务计划管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/cusServicePlanCtrl.js');
                        }]
                }
            })


            .state('app.busManage.customerService.manualManage', {
                url: '/manualManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '客户服务手册管理'
                }
            })

            /*            .state('app.busManage.customerService.manualManage.manualManagement', {
             url: '/manualManagement',
             templateUrl: getURL('insurance/view/manualManagement/manualManagement.html'),
             ncyBreadcrumb: {
             label: '客户服务手册管理'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/manualManagementCtrl.js');
             }]
             }
             })*/

            .state('app.busManage.customerService.reVisitManage', {
                url: '/reVisitManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '客户回访管理'
                }
            })

            /*            .state('app.###.visitPlan', {
             url: '/visitPlan',
             templateUrl: getURL('insurance/view/visitPlan/visitPlan.html'),
             ncyBreadcrumb: {
             label: 'VisitPlan.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/visitPlanCtrl.js');
             }]
             }
             })*/

            .state('app.busManage.customerService.reVisitManage.visitPlan', {
                url: '/visitPlan',
                templateUrl: getURL('insurance/view/visitPlan/visitPlan.html'),
                ncyBreadcrumb: {
                    label: '客户回访计划管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/visitPlanCtrl.js');
                        }]
                }
            })
            //客户回访记录
            .state('app.busManage.customerService.reVisitManage.visitRecord', {
                url: '/visitRecord',
                templateUrl: getURL('insurance/view/visitRecord/visitRecord.html'),
                ncyBreadcrumb: {
                    label: '客户回访记录'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/visitRecordCtrl.js');
                        }]
                }
            })

            /* .state('app.busManage.customerService.reVisitManage.customerReturnRecord', {
             url: '/customerReturnRecord',
             templateUrl: getURL('insurance/view/manualManagement/customerReturnRecord.html'),
             ncyBreadcrumb: {
             label: '客户回访记录'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/customerReturnRecordCtrl.js');
             }]
             }
             })
             */

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
                templateUrl: getURL('insurance/view/trainPlanYear/trainPlanYear.html'),
                ncyBreadcrumb: {
                    label: '年度客户培训计划'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/trainPlanYearCtrl.js');
                        }]
                }
            })
            .state('app.busManage.customerService.trainManage.customerTrain', {
                url: '/customerTrain',
                templateUrl: getURL('insurance/view/customerTrain/customerTrain.html'),
                ncyBreadcrumb: {
                    label: '客户培训计划申报'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/customerTrainCtrl.js');
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

            .state('app.busManage.customerService.evaluateManage.insureServeAssess', {
                url: '/insureServeAssess',
                templateUrl: getURL('insurance/view/insureServeAssess/insureServeAssess.html'),
                ncyBreadcrumb: {
                    label: '保险公司服务质量评价管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/insureServeAssessCtrl.js');
                        }]
                }
            })

            .state('app.busManage.customerService.workReportManage', {
                url: '/workReportManage',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '客户服务工作报告管理'
                }
            })

            .state('app.busManage.customerService.workReportManage.customWorkReportManage', {
                url: '/customerService',
                params: {fileType: 2},
                templateUrl: getURL('insurance/view/customerService/customerService.html'),
                ncyBreadcrumb: {
                    label: '客户服务工作报告管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/customerServiceCtrl.js');
                        }]
                }
            })


            .state('app.busManage.busDevelop.busProject', {
                url: '/busProject',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务立项'
                }
            })


            .state('app.busManage.busDevelop.busPromotion', {
                url: '/busPromotion',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '业务推介'
                }
            })

            .state('app.busManage.busDevelop.signInsurance', {
                url: '/signInsurance',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '签署保险经纪业务委托协议'
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

            //财产险营销计划（股东）
            .state('app.busManage.makePlan.marketPlan.workPartner.propertyInsurancePlan', {
                url: '/propertyInsurancePlan',
                templateUrl: getURL('insurance/view/propertyInsurancePlan/propertyInsurancePlan.html'),
                ncyBreadcrumb: {
                    label: '财产险营销计划'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/propertyInsurancePlanCtrl.js');
                        }]
                }
            })

            //人身险营销计划(股东)
            .state('app.busManage.makePlan.marketPlan.workPartner.personaInsurancePlan', {
                url: '/personaInsurancePlan',
                templateUrl: getURL('insurance/view/personaInsurancePlan/personaInsurancePlan.html'),
                ncyBreadcrumb: {
                    label: '人身险营销计划'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/personaInsurancePlanCtrl.js');
                        }]
                }
            })


            .state('app.busManage.makePlan.marketPlan.marketBus', {
                url: '/marketBus',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '市场业务营销计划'
                }
            })

            //财产险营销计划(市场)
            .state('app.busManage.makePlan.marketPlan.marketBus.marketPropertyInsurancePlan', {
                url: '/marketPropertyInsurancePlan',
                templateUrl: getURL('insurance/view/marketPropertyInsurancePlan/marketPropertyInsurancePlan.html'),
                ncyBreadcrumb: {
                    label: '财产险营销计划'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/marketPropertyInsurancePlanCtrl.js');
                        }]
                }
            })

            //人身险营销计划(市场)
            .state('app.busManage.makePlan.marketPlan.marketBus.marketPersonalInsurancePlan', {
                url: '/marketPersonalInsurancePlan',
                templateUrl: getURL('insurance/view/marketPersonalInsurancePlan/marketPersonalInsurancePlan.html'),
                ncyBreadcrumb: {
                    label: '人身险营销计划'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/marketPersonalInsurancePlanCtrl.js');
                        }]
                }
            })

            //合作单位信息
            .state('app.base.cooperator.agencyCustomer', {
                url: '/agencyCustomer',
                templateUrl: getURL('insurance/view/agencyCustomer/agencyCustomer.html'),
                ncyBreadcrumb: {
                    label: '保险中介公司信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/agencyCustomerCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //合作单位信息变更
            .state('app.base.informationChange.agencyCustomerChange', {
                url: '/agencyCustomerChange',
                templateUrl: getURL('insurance/view/agencyCustomerChange/agencyCustomerChange.html'),
                ncyBreadcrumb: {
                    label: '保险中介公司信息变更'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/agencyCustomerChangeCtrl.js');
                        }]
                }
            })

            //单位信息合并
            .state('app.base.informationChange.unitConsolidation', {
                url: '/unitConsolidation',
                templateUrl: getURL('insurance/view/unitConsolidation/unitConsolidation.html'),
                ncyBreadcrumb: {
                    label: '单位信息合并'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/unitConsolidationCtrl.js');
                        }]
                }
            })

            //变更日志
            /*            .state('app.###.alteratelog', {
             url: '/alteratelog',
             templateUrl: getURL('insurance/view/alteratelog/alteratelog.html'),
             ncyBreadcrumb: {
             label: 'Alteratelog.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/alteratelogCtrl.js');
             }]
             }
             })*/
            //考核标准设置
            /*            .state('app.###.appraisalStandards', {
             url: '/appraisalStandards',
             templateUrl: getURL('insurance/view/appraisalStandards/appraisalStandards.html'),
             ncyBreadcrumb: {
             label: 'AppraisalStandards.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/appraisalStandardsCtrl.js');
             }]
             }
             })*/
            //地域
            /*            .state('app.###.areacl', {
             url: '/areacl',
             templateUrl: getURL('insurance/view/areacl/areacl.html'),
             ncyBreadcrumb: {
             label: 'Areacl.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/areaclCtrl.js');
             }]
             }
             })*/
            //保险安排
            .state('app.busManage.insuranceArrange.arrangementInfos', {
                url: '/arrangementInfos',
                templateUrl: getURL('insurance/view/arrangementInfos/arrangementInfos.html'),
                ncyBreadcrumb: {
                    label: '协助客户选择保险公司'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/arrangementInfosCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //绩效考核主表
            /*            .state('app.###.assesorPerformance', {
             url: '/assesorPerformance',
             templateUrl: getURL('insurance/view/assesorPerformance/assesorPerformance.html'),
             ncyBreadcrumb: {
             label: 'AssesorPerformance.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/assesorPerformanceCtrl.js');
             }]
             }
             })*/
            //绩效考核主表
            .state('app.assBusManage.formManage.perforAssess.assesorPerformance_one', {
                url: '/assesorPerformance_one',
                templateUrl: getURL('insurance/view/assesorPerformance_one/assesorPerformance_one.html'),
                ncyBreadcrumb: {
                    label: '公估师绩效考核表_开票金额'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/assesorPerformance_oneCtrl.js');
                        }]
                }
            })
            //绩效考核主表
            .state('app.assBusManage.formManage.perforAssess.assesorPerformance_two', {
                url: '/assesorPerformance_two',
                templateUrl: getURL('insurance/view/assesorPerformance_two/assesorPerformance_two.html'),
                ncyBreadcrumb: {
                    label: '公估师绩效考核表_到账金额'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/assesorPerformance_twoCtrl.js');
                        }]
                }
            })
            //员工管理
            .state('app.assBusManage.employeeManage.assessmentExpert', {
                url: '/assessmentExpert',
                templateUrl: getURL('insurance/view/assessmentExpert/assessmentExpert.html'),
                ncyBreadcrumb: {
                    label: '员工管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/assessmentExpertCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //v_assessment_projectcost
            .state('app.assBusManage.projectFeeManage.assessmentProjectcost', {
                url: '/assessmentProjectcost',
                templateUrl: getURL('insurance/view/assessmentProjectcost/assessmentProjectcost.html'),
                ncyBreadcrumb: {
                    label: '项目费用查询'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/assessmentProjectcostCtrl.js');
                        }]
                }
            })
            //项目费用确认、业务收入分配管理、档案管理主表信息
            .state('app.assBusManage.recordManage.assessorArchives', {
                url: '/assessorArchives',
                templateUrl: getURL('insurance/view/assessorArchives/assessorArchives.html'),
                ncyBreadcrumb: {
                    label: '档案管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/assessorArchivesCtrl.js');
                        }]
                }
            })
            //项目费用确认、业务收入分配管理、档案管理主表信息
            .state('app.assBusManage.busAllotManage.assessorBusiincome', {
                url: '/assessorBusiincome',
                templateUrl: getURL('insurance/view/assessorBusiincome/assessorBusiincome.html'),
                ncyBreadcrumb: {
                    label: '业务收入分配管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/assessorBusiincomeCtrl.js');
                        }]
                }
            })
            //项目费用确认、业务收入分配管理、档案管理主表信息
            .state('app.assBusManage.projectFeeManage.assessorProjectcharge', {
                url: '/assessorProjectcharge',
                templateUrl: getURL('insurance/view/assessorProjectcharge/assessorProjectcharge.html'),
                ncyBreadcrumb: {
                    label: '项目费用确认'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/assessorProjectchargeCtrl.js');
                        }]
                }
            })
            //项目费用确认、业务收入分配管理、档案管理主表信息
            /*            .state('app.###.assessorProjectchargeQuery', {
             url: '/assessorProjectchargeQuery',
             templateUrl: getURL('insurance/view/assessorProjectchargeQuery/assessorProjectchargeQuery.html'),
             ncyBreadcrumb: {
             label: 'AssessorProjectchargeQuery.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/assessorProjectchargeQueryCtrl.js');
             }]
             }
             })*/
            //项目费用管理
            .state('app.assBusManage.projectFeeManage.assessorProjectcost', {
                url: '/assessorProjectcost',
                templateUrl: getURL('insurance/view/assessorProjectcost/assessorProjectcost.html'),
                ncyBreadcrumb: {
                    label: '项目费用录入'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/assessorProjectcostCtrl.js');
                        }]
                }
            })
            //应收账款管理
            .state('app.assBusManage.receiveManage.assessorReality', {
                url: '/assessorReality',
                templateUrl: getURL('insurance/view/assessorReality/assessorReality.html'),
                ncyBreadcrumb: {
                    label: '已收账款录入'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/assessorRealityCtrl.js');
                        }]
                }
            })
            //应收未收项目查询主表
            .state('app.assBusManage.receiveManage.assessorReceivableProject', {
                url: '/assessorReceivableProject',
                templateUrl: getURL('insurance/view/assessorReceivableProject/assessorReceivableProject.html'),
                ncyBreadcrumb: {
                    label: '应收未收项目'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/assessorReceivableProjectCtrl.js');
                        }]
                }
            })
            //报告管理
            .state('app.assBusManage.reportManage.assessorReport', {
                url: '/assessorReport',
                templateUrl: getURL('insurance/view/assessorReport/assessorReport.html'),
                ncyBreadcrumb: {
                    label: '公估报告管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/assessorReportCtrl.js');
                        }]
                }
            })
            //报告管理
            .state('app.assBusManage.reportManage.assessorReportOther', {
                url: '/assessorReportOther',
                templateUrl: getURL('insurance/view/assessorReportOther/assessorReportOther.html'),
                ncyBreadcrumb: {
                    label: '其他报告管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/assessorReportOtherCtrl.js');
                        }]
                }
            })
            //报告管理
            .state('app.assBusManage.reportManage.assessorReportRisk', {
                url: '/assessorReportRisk',
                templateUrl: getURL('insurance/view/assessorReportRisk/assessorReportRisk.html'),
                ncyBreadcrumb: {
                    label: '风险报告管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/assessorReportRiskCtrl.js');
                        }]
                }
            })
            //立项信息
            /*        .state('app.assBusManage.initProjectManage.assessorsProject', {
             url: '/assessorsProject',
             templateUrl: getURL('insurance/view/assessorsProject/assessorsProject.html'),
             ncyBreadcrumb: {
             label: '立项信息'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/assessorsProjectCtrl.js');
             }]
             }
             })*/
            //审批业务数据
            /*            .state('app.###.auditData', {
             url: '/auditData',
             templateUrl: getURL('insurance/view/auditData/auditData.html'),
             ncyBreadcrumb: {
             label: 'AuditData.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/auditDataCtrl.js');
             }]
             }
             })*/
            //审批业务数据
            /*            .state('app.###.auditDataForm', {
             url: '/auditDataForm',
             templateUrl: getURL('insurance/view/auditDataForm/auditDataForm.html'),
             ncyBreadcrumb: {
             label: 'AuditDataForm.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/auditDataFormCtrl.js');
             }]
             }
             })*/
            //审核情况
            /*            .state('app.###.auditDataHis', {
             url: '/auditDataHis',
             templateUrl: getURL('insurance/view/auditDataHis/auditDataHis.html'),
             ncyBreadcrumb: {
             label: 'AuditDataHis.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/auditDataHisCtrl.js');
             }]
             }
             })*/
            //审核情况
            /*            .state('app.###.auditDataHisForMarPlan', {
             url: '/auditDataHisForMarPlan',
             templateUrl: getURL('insurance/view/auditDataHisForMarPlan/auditDataHisForMarPlan.html'),
             ncyBreadcrumb: {
             label: 'AuditDataHisForMarPlan.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/auditDataHisForMarPlanCtrl.js');
             }]
             }
             })*/
            //业务文件批量报送
            .state('app.busManage.docDeclaration.batchExamine', {
                url: '/batchExamine',
                templateUrl: getURL('insurance/view/batchExamine/batchExamine.html'),
                ncyBreadcrumb: {
                    label: '批量报送业务文件'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/batchExamineCtrl.js');
                        }]
                }
            })
            //批量报送业务立项主表
            .state('app.busManage.busDevelop.busProject.batchProject', {
                url: '/batchProject',
                templateUrl: getURL('insurance/view/batchProject/batchProject.html'),
                ncyBreadcrumb: {
                    label: '批量报送业务立项'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/batchProjectCtrl.js');
                        }]
                }
            })
            //批量业务签报主表
            .state('app.busManage.busSign.batchReport', {
                url: '/batchReport',
                templateUrl: getURL('insurance/view/batchReport/batchReport.html'),
                ncyBreadcrumb: {
                    label: '批量业务签报管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/batchReportCtrl.js');
                        }]
                }
            })
            //文档管理
            .state('app.base.business.branchDocuments', {
                url: '/branchDocuments',
                templateUrl: getURL('insurance/view/branchDocuments/branchDocuments.html'),
                ncyBreadcrumb: {
                    label: '分公司业务模板管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/branchDocumentsCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //BUSI_INSURANCE
            .state('app.contManage.policyInfo.busiInsurance', {
                url: '/busiInsurance',
                templateUrl: getURL('insurance/view/busiInsurance/busiInsurance.html'),
                ncyBreadcrumb: {
                    label: '校核保单'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/busiInsuranceCtrl.js');
                        }]
                }
            })
            //BUSI_INSURE_PROJECT
            .state('app.busManage.docDeclaration.busiInsureProject', {
                url: '/busiInsureProject',
                templateUrl: getURL('insurance/view/busiInsureProject/busiInsureProject.html'),
                ncyBreadcrumb: {
                    label: '电网资产保险方案信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/busiInsureProjectCtrl.js');
                        }]
                }
            })
            //业务文件审批管理
            .state('app.busManage.docDeclaration.businessExamine', {
                url: '/businessExamine',
                templateUrl: getURL('insurance/view/businessExamine/businessExamine.html'),
                ncyBreadcrumb: {
                    label: '业务文件申报审批'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/businessExamineCtrl.js');
                        }]
                }
            })
            //业务单位设置
            /*            .state('app.###.businessOrgSet', {
             url: '/businessOrgSet',
             templateUrl: getURL('insurance/view/businessOrgSet/businessOrgSet.html'),
             ncyBreadcrumb: {
             label: 'BusinessOrgSet.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/businessOrgSetCtrl.js');
             }]
             }
             })*/
            //业务日志
            /*            .state('app.###.business_log', {
             url: '/business_log',
             templateUrl: getURL('insurance/view/business_log/business_log.html'),
             ncyBreadcrumb: {
             label: 'Business_log.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/business_logCtrl.js');
             }]
             }
             })*/
            //保单报案信息
            /*            .state('app.###.caibInsurancebill', {
             url: '/caibInsurancebill',
             templateUrl: getURL('insurance/view/caibInsurancebill/caibInsurancebill.html'),
             ncyBreadcrumb: {
             label: 'CaibInsurancebill.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/caibInsurancebillCtrl.js');
             }]
             }
             })*/
            //批单信息
            .state('app.contManage.riderManage.changebillcheck', {
                url: '/changebillcheck',
                templateUrl: getURL('insurance/view/changebillcheck/changebillcheck.html'),
                ncyBreadcrumb: {
                    label: '财产险批单'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/changebillcheckCtrl.js',
                                'insurance/controller/upLoadCtrls.js']
                            );
                        }]
                }
            })
            //变更团体寿险信息
            /*            .state('app.###.changeCarInsurance', {
             url: '/changeCarInsurance',
             templateUrl: getURL('insurance/view/changeCarInsurance/changeCarInsurance.html'),
             ncyBreadcrumb: {
             label: 'ChangeCarInsurance.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/changeCarInsuranceCtrl.js');
             }]
             }
             })*/
            //变更团体寿险信息
            /*            .state('app.###.changeGLifeInsurance', {
             url: '/changeGLifeInsurance',
             templateUrl: getURL('insurance/view/changeGLifeInsurance/changeGLifeInsurance.html'),
             ncyBreadcrumb: {
             label: 'ChangeGLifeInsurance.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/changeGLifeInsuranceCtrl.js');
             }]
             }
             })*/
            //变更财产险信息
            /*            .state('app.###.changePropertyInsurance', {
             url: '/changePropertyInsurance',
             templateUrl: getURL('insurance/view/changePropertyInsurance/changePropertyInsurance.html'),
             ncyBreadcrumb: {
             label: 'ChangePropertyInsurance.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/changePropertyInsuranceCtrl.js');
             }]
             }
             })*/
            //协助索赔
            .state('app.busManage.customerService.claimManage.claimInfo', {
                url: '/claimInfo',
                templateUrl: getURL('insurance/view/claimInfo/claimInfo.html'),
                ncyBreadcrumb: {
                    label: '客服统计报表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/claimInfoCtrl.js');
                        }]
                }
            })

            //协助索赔子表
            /*            .state('app.###.claimInfoB', {
             url: '/claimInfoB',
             templateUrl: getURL('insurance/view/claimInfoB/claimInfoB.html'),
             ncyBreadcrumb: {
             label:     'ClaimInfoB.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/claimInfoBCtrl.js');
             }]
             }
             })*/
            //协助索赔案件报告单
            .state('app.busManage.customerService.claimManage.claimInfoReport', {
                url: '/claimInfoReport',
                templateUrl: getURL('insurance/view/claimInfoReport/claimInfoReport.html'),
                ncyBreadcrumb: {
                    label: '协助索赔案件报告单'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/claimInfoReportCtrl.js');
                        }]
                }
            })
            //busi_claim_process
            //报案信息管理
            .state('app.busManage.customerService.claimManage.claimProcess', {
                url: '/claimProcess',
                templateUrl: getURL('insurance/view/claimProcess/claimProcess.html'),
                ncyBreadcrumb: {
                    label: '报案信息管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/claimProcessCtrl.js');
                        }]
                }
            })
            //结算主表
            /*            .state('app.###.clearing', {
             url: '/clearing',
             templateUrl: getURL('insurance/view/clearing/clearing.html'),
             ncyBreadcrumb: {
             label: 'Clearing.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/clearingCtrl.js');
             }]
             }
             })*/
            //结算主表
            /*            .state('app.###.clearingAudit', {
             url: '/clearingAudit',
             templateUrl: getURL('insurance/view/clearingAudit/clearingAudit.html'),
             ncyBreadcrumb: {
             label: 'ClearingAudit.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/clearingAuditCtrl.js');
             }]
             }
             })*/
            //结算信息
            /*            .state('app.###.clearingInfos', {
             url: '/clearingInfos',
             templateUrl: getURL('insurance/view/clearingInfos/clearingInfos.html'),
             ncyBreadcrumb: {
             label: 'ClearingInfos.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/clearingInfosCtrl.js');
             }]
             }
             })*/
            //咨询费管理
            .state('app.contManage.consulFeeManage.consult', {
                url: '/consult',
                templateUrl: getURL('insurance/view/consult/consult.html'),
                ncyBreadcrumb: {
                    label: '咨询费管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(
                                ['insurance/controller/consultCtrl.js',
                                    'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //保险合同信息管理
            .state('app.busManage.busDevelop.signInsurance.contractAgentCoop', {
                url: '/contractAgentCoop',
                templateUrl: getURL('insurance/view/contractAgentCoop/contractAgentCoop.html'),
                ncyBreadcrumb: {
                    label: '签署保险经纪业务合作合同'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/contractAgentCoopCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //保险合同信息管理
            .state('app.busManage.busDevelop.signInsurance.contractAgentDetail', {
                url: '/contractAgentDetail',
                templateUrl: getURL('insurance/view/contractAgentDetail/contractAgentDetail.html'),
                ncyBreadcrumb: {
                    label: '签署保险经纪业务委托合同'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/contractAgentDetailCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //保险合同信息管理
            .state('app.busManage.busDevelop.signInsurance.contractAgentLetter', {
                url: '/contractAgentLetter',
                templateUrl: getURL('insurance/view/contractAgentLetter/contractAgentLetter.html'),
                ncyBreadcrumb: {
                    label: '签署保险经纪业务授权委托书'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/contractAgentLetterCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //保险合同信息管理
            .state('app.busManage.insuranceArrange.contractCooperation', {
                url: '/contractCooperation',
                templateUrl: getURL('insurance/view/contractCooperation/contractCooperation.html'),
                ncyBreadcrumb: {
                    label: '签署保险经纪业务合作协议'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/contractCooperationCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //保险合同信息管理
            /*            .state('app.###.contractDetail', {
             url: '/contractDetail',
             templateUrl: getURL('insurance/view/contractDetail/contractDetail.html'),
             ncyBreadcrumb: {
             label: 'ContractDetail.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/contractDetailCtrl.js');
             }]
             }
             })*/
            //文件导入表
            /*            .state('app.###.contractDetailFile_up', {
             url: '/contractDetailFile_up',
             templateUrl: getURL('insurance/view/contractDetailFile_up/contractDetailFile_up.html'),
             ncyBreadcrumb: {
             label: 'ContractDetailFile_up.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/contractDetailFile_upCtrl.js');
             }]
             }
             })*/
            //合同信息
            /*            .state('app.###.contractInf', {
             url: '/contractInf',
             templateUrl: getURL('insurance/view/contractInf/contractInf.html'),
             ncyBreadcrumb: {
             label: 'ContractInf.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/contractInfCtrl.js');
             }]
             }
             })*/
            //保险合同信息管理
            .state('app.busManage.insuranceArrange.contractOther', {
                url: '/contractOther',
                templateUrl: getURL('insurance/view/contractOther/contractOther.html'),
                ncyBreadcrumb: {
                    label: '其他业务合同管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/contractOtherCtrl.js');
                        }]
                }
            })
            //保险合同信息管理
            .state('app.busManage.insuranceArrange.contractTripartite', {
                url: '/contractTripartite',
                templateUrl: getURL('insurance/view/contractTripartite/contractTripartite.html'),
                ncyBreadcrumb: {
                    label: '签署三方合同'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/contractTripartiteCtrl.js');
                        }]
                }
            })
            //SAP科目对照表
            .state('app.basicFileManage.spaForm.contrasttable', {
                url: '/contrasttable',
                templateUrl: getURL('insurance/view/contrasttable/contrasttable.html'),
                ncyBreadcrumb: {
                    label: '科目管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/contrasttableCtrl.js');
                        }]
                }
            })
            //SAP科目对照表
            .state('app.basicFileManage.spaForm.contrasttableA', {
                url: '/contrasttableA',
                templateUrl: getURL('insurance/view/contrasttableA/contrasttableA.html'),
                ncyBreadcrumb: {
                    label: '登陆用户管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/contrasttableACtrl.js');
                        }]
                }
            })
            //立项费用显示开关表
            /*            .state('app.###.contrShowTarget', {
             url: '/contrShowTarget',
             templateUrl: getURL('insurance/view/contrShowTarget/contrShowTarget.html'),
             ncyBreadcrumb: {
             label: 'ContrShowTarget.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/contrShowTargetCtrl.js');
             }]
             }
             })*/
            //机构中间表
            /*            .state('app.###.corpContrasttable', {
             url: '/corpContrasttable',
             templateUrl: getURL('insurance/view/corpContrasttable/corpContrasttable.html'),
             ncyBreadcrumb: {
             label: 'CorpContrasttable.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/corpContrasttableCtrl.js');
             }]
             }
             })*/
            //风险咨询业务立项信息
            /*            .state('app.###.counselProject', {
             url: '/counselProject',
             templateUrl: getURL('insurance/view/counselProject/counselProject.html'),
             ncyBreadcrumb: {
             label: 'CounselProject.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/counselProjectCtrl.js');
             }]
             }
             })*/
            //客户服务计划
            /*            .state('app.###.cusServicePlan', {
             url: '/cusServicePlan',
             templateUrl: getURL('insurance/view/cusServicePlan/cusServicePlan.html'),
             ncyBreadcrumb: {
             label: 'CusServicePlan.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/cusServicePlanCtrl.js');
             }]
             }
             })*/
            //客户服务计划
            .state('app.comInfo.form.clientService.cusServicePlanB', {
                url: '/cusServicePlanB',
                templateUrl: getURL('insurance/view/cusServicePlanB/cusServicePlanB.html'),
                ncyBreadcrumb: {
                    label: '客户服务计划明细'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/cusServicePlanBCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.clientService.customerTrainHourTable', {
                url: '/customerTrainHourTable',
                templateUrl: getURL('insurance/view/customerTrainHourTable/customerTrainHourTable.html'),
                ncyBreadcrumb: {
                    label: '客户培训讲师课时统计表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/customerTrainHourTableCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.clientService.customerStaTable', {
                url: '/customerStaTable',
                templateUrl: getURL('insurance/view/customerStaTable/customerStaTable.html'),
                ncyBreadcrumb: {
                    label: '客户培训执行状态统计表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/customerStaTableCtrl.js');
                        }]
                }
            })


            //投保人中间表
            .state('app.basicFileManage.emsBusiForm2.customerContrasttable', {
                url: '/customerContrasttable',
                templateUrl: getURL('insurance/view/customerContrasttable/customerContrasttable.html'),
                ncyBreadcrumb: {
                    label: '投保人中间表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/customerContrasttableCtrl.js');
                        }]
                }
            })
            //客户业务开展明细查询
            /*            .state('app.###.customerdetail', {
             url: '/customerdetail',
             templateUrl: getURL('insurance/view/customerdetail/customerdetail.html'),
             ncyBreadcrumb: {
             label: 'customerdetail.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/customerdetailCtrl.js');
             }]
             }
             })*/
            //客户服务文件管理
            .state('app.busManage.customerService.manualManage.customerService', {
                url: '/customerService',
                params: {fileType: 1},
                templateUrl: getURL('insurance/view/customerService/customerService.html'),
                ncyBreadcrumb: {
                    label: '客户服务手册管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/customerServiceCtrl.js');
                        }]
                }
            })
            //客户服务文件管理
            .state('app.comInfo.form.clientService.customerServiceB', {
                url: '/customerServiceB',
                templateUrl: getURL('insurance/view/customerServiceB/customerServiceB.html'),
                ncyBreadcrumb: {
                    label: '客户服务手册明细'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/customerServiceBCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.clientService.customerServiceB1', {
                url: '/customerServiceB1',
                templateUrl: getURL('insurance/view/customerServiceB/customerServiceB.html'),
                ncyBreadcrumb: {
                    label: '客户服务工作报告管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/customerServiceBCtrl.js');
                        }]
                }
            })


            //客户培训管理
            .state('app.comInfo.form.clientService.customerTrainB', {
                url: '/customerTrainB',
                templateUrl: getURL('insurance/view/customerTrainB/customerTrainB.html'),
                ncyBreadcrumb: {
                    label: '客户培训申报明细'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/customerTrainBCtrl.js');
                        }]
                }
            })
            //客户合并
            /*            .state('app.###.customerUnite', {
             url: '/customerUnite',
             templateUrl: getURL('insurance/view/customerUnite/customerUnite.html'),
             ncyBreadcrumb: {
             label: 'CustomerUnite.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/customerUniteCtrl.js');
             }]
             }
             })*/
            //客户信息
            /*            .state('app.###.customerView', {
             url: '/customerView',
             templateUrl: getURL('insurance/view/customerView/customerView.html'),
             ncyBreadcrumb: {
             label: 'CustomerView.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/customerViewCtrl.js');
             }]
             }
             })*/
            //数据权限设置
            /*            .state('app.###.dataContr', {
             url: '/dataContr',
             templateUrl: getURL('insurance/view/dataContr/dataContr.html'),
             ncyBreadcrumb: {
             label: 'DataContr.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/dataContrCtrl.js');
             }]
             }
             })*/
            //基本档案
            /*            .state('app.###.defdoc', {
             url: '/defdoc',
             templateUrl: getURL('insurance/view/defdoc/defdoc.html'),
             ncyBreadcrumb: {
             label: 'Defdoc.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/defdocCtrl.js');
             }]
             }
             })*/
            //基本档案分类
            /*            .state('app.###.defdoclist', {
             url: '/defdoclist',
             templateUrl: getURL('insurance/view/defdoclist/defdoclist.html'),
             ncyBreadcrumb: {
             label: 'Defdoclist.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/defdoclistCtrl.js');
             }]
             }
             })*/
            //部门管理
            /*            .state('app.###.dept', {
             url: '/dept',
             templateUrl: getURL('insurance/view/dept/dept.html'),
             ncyBreadcrumb: {
             label: 'Dept.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/deptCtrl.js');
             }]
             }
             })*/
            //业务文件明细查询
            .state('app.comInfo.form.busFileForm.detailScen', {
                url: '/detailScen',
                templateUrl: getURL('insurance/view/detailScen/detailScen.html'),
                ncyBreadcrumb: {
                    label: '业务文件明细查询'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/detailScenCtrl.js');
                        }]
                }
            })

            .state('app.comInfo.form.busFileForm.statisticReport', {
                url: '/statisticReport',
                templateUrl: getURL('insurance/view/statisticReport/statisticReport.html'),
                ncyBreadcrumb: {
                    label: '各单位业务文件统计表'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/statisticReportCtrl.js');
                        }]
                }
            })
            //业务文件执行结果
            .state('app.busManage.insuranceDesign.documentResults', {
                url: '/documentResults',
                templateUrl: getURL('insurance/view/documentResults/documentResults.html'),
                ncyBreadcrumb: {
                    label: '提交风险评估报告'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/documentResultsCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //业务文件执行结果
            .state('app.busManage.insuranceDesign.documentResultsB', {
                url: '/documentResultsB',
                templateUrl: getURL('insurance/view/documentResultsB/documentResultsB.html'),
                ncyBreadcrumb: {
                    label: '提交保险建议书'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/documentResultsBCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })

            .state('app.busManage.insuranceDesign.confirmInsurance', {
                url: '/confirmInsurance',
                templateUrl: getURL('insurance/view/confirmInsurance/confirmInsurance.html'),
                ncyBreadcrumb: {
                    label: '确认保险方案'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/confirmInsuranceCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })

            //文档管理
            .state('app.base.business.documents', {
                url: '/documents',
                templateUrl: getURL('insurance/view/documents/documents.html'),
                ncyBreadcrumb: {
                    label: '模板管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/documentsCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //busi发送电网资产系统数据
            .state('app.basicFileManage.emsBusiForm2.ems', {
                url: '/ems',
                templateUrl: getURL('insurance/view/ems/ems.html'),
                ncyBreadcrumb: {
                    label: '接口发送接收日志'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/emsCtrl.js');
                        }]
                }
            })
            //公估业务立项信息
            /*            .state('app.###.evaluationProject', {
             url: '/evaluationProject',
             templateUrl: getURL('insurance/view/evaluationProject/evaluationProject.html'),
             ncyBreadcrumb: {
             label: 'EvaluationProject.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/evaluationProjectCtrl.js');
             }]
             }
             })*/
            //专家库基本信息
            //                 .state('app.###.expert', {
            //     url: '/expert',
            //     templateUrl: getURL('insurance/view/expert/expert.html'),
            //     ncyBreadcrumb: {
            //         label: 'Expert.xml'
            //     },
            //     resolve: {
            //         deps: ['uiLoad',
            //             function (uiLoad) {
            //                 return uiLoad.load('insurance/controller/expertCtrl.js');
            //             }]
            //     }
            // })


            .state('app.busManage.expertManage.expert', {
                url: '/expert',
                templateUrl: getURL('insurance/view/expert/expert.html'),
                ncyBreadcrumb: {
                    label: '专家库管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/expertCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })





            //专家项目评价表
            /*            .state('app.###.expertRecord', {
             url: '/expertRecord',
             templateUrl: getURL('insurance/view/expertRecord/expertRecord.html'),
             ncyBreadcrumb: {
             label: 'ExpertRecord.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/expertRecordCtrl.js');
             }]
             }
             })*/
            //费用拨付费率信息表
            /*            .state('app.###.feeRatio', {
             url: '/feeRatio',
             templateUrl: getURL('insurance/view/feeRatio/feeRatio.html'),
             ncyBreadcrumb: {
             label: 'FeeRatio.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/feeRatioCtrl.js');
             }]
             }
             })*/
            //团车信息
            .state('app.contManage.policyInfo.gCarInsurance', {
                url: '/gCarInsurance',
                templateUrl: getURL('insurance/view/gCarInsurance/gCarInsurance.html'),
                ncyBreadcrumb: {
                    label: '团体车险信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/gCarInsuranceCtrl.js',
                                'insurance/controller/upLoadCtrls.js']
                            );
                        }]
                }
            })
            //批单信息
            .state('app.contManage.riderManage.gLifeChangebillcheck', {
                url: '/gLifeChangebillcheck',
                templateUrl: getURL('insurance/view/gLifeChangebillcheck/gLifeChangebillcheck.html'),
                ncyBreadcrumb: {
                    label: '人身险批单'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/gLifeChangebillcheckCtrl.js',
                                'insurance/controller/upLoadCtrls.js']
                            );
                        }]
                }
            })
            //团体寿险信息
            .state('app.contManage.policyInfo.gLifeInsurance', {
                url: '/gLifeInsurance',
                templateUrl: getURL('insurance/view/gLifeInsurance/gLifeInsurance.html'),
                ncyBreadcrumb: {
                    label: '团体寿险信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/gLifeInsuranceCtrl.js',
                                'insurance/controller/upLoadCtrls.js']
                            );
                        }]
                }
            })
            //用户组
            .state('app.rightManage.group', {
                url: '/group',
                templateUrl: getURL('insurance/view/group/group.html'),
                ncyBreadcrumb: {
                    label: '角色管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/groupCtrl.js');
                        }]
                }
            })
            //用户组
            /*            .state('app.###.groupAlter', {
             url: '/groupAlter',
             templateUrl: getURL('insurance/view/groupAlter/groupAlter.html'),
             ncyBreadcrumb: {
             label: 'GroupAlter.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/groupAlterCtrl.js');
             }]
             }
             })*/
            //合作单位信息变更
            .state('app.base.informationChange.groupCustomerChange', {
                url: '/groupCustomerChange',
                templateUrl: getURL('insurance/view/groupCustomerChange/groupCustomerChange.html'),
                ncyBreadcrumb: {
                    label: '国网客户信息变更'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/groupCustomerChangeCtrl.js');
                        }]
                }
            })
            //行业类别
            /*            .state('app.###.industryType', {
             url: '/industryType',
             templateUrl: getURL('insurance/view/industryType/industryType.html'),
             ncyBreadcrumb: {
             label: 'IndustryType.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/industryTypeCtrl.js');
             }]
             }
             })*/
            //险种代码明细表_本地
            /*            .state('app.###.insrcDetail', {
             url: '/insrcDetail',
             templateUrl: getURL('insurance/view/insrcDetail/insrcDetail.html'),
             ncyBreadcrumb: {
             label: 'InsrcDetail.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/insrcDetailCtrl.js');
             }]
             }
             })*/
            //险种代码主信息表_本地
            /*            .state('app.###.insrcInfo', {
             url: '/insrcInfo',
             templateUrl: getURL('insurance/view/insrcInfo/insrcInfo.html'),
             ncyBreadcrumb: {
             label: 'InsrcInfo.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/insrcInfoCtrl.js');
             }]
             }
             })*/
            //险种信息
            /*            .state('app.###.insurance', {
             url: '/insurance',
             templateUrl: getURL('insurance/view/insurance/insurance.html'),
             ncyBreadcrumb: {
             label: 'Insurance.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/insuranceCtrl.js');
             }]
             }
             })*/
            //保险公司评价参数设置
            /*            .state('app.###.insuranceEvalSet', {
             url: '/insuranceEvalSet',
             templateUrl: getURL('insurance/view/insuranceEvalSet/insuranceEvalSet.html'),
             ncyBreadcrumb: {
             label: 'InsuranceEvalSet.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/insuranceEvalSetCtrl.js');
             }]
             }
             })*/
            //投保手续
            .state('app.busManage.insuranceArrange.insuranceProcedures', {
                url: '/insuranceProcedures',
                templateUrl: getURL('insurance/view/insuranceProcedures/insuranceProcedures.html'),
                ncyBreadcrumb: {
                    label: '保单维护管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/insuranceProceduresCtrl.js',
                                'insurance/controller/upLoadCtrls.js']
                            );
                        }]
                }
            })
            //投保手续
            .state('app.busManage.insuranceArrange.insuranceProceduresb', {
                url: '/insuranceProceduresb',
                templateUrl: getURL('insurance/view/insuranceProceduresb/insuranceProceduresb.html'),
                ncyBreadcrumb: {
                    label: '协助客户办理投保手续'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/insuranceProceduresbCtrl.js',
                                'insurance/controller/upLoadCtrls.js']
                            );
                        }]
                }
            })

            //协助客户选择保险公司
            /*            .state('app.busManage.insuranceArrange.InsuranceCompanyChoice', {
             url: '/InsuranceCompanyChoice',
             templateUrl: getURL('insurance/view/InsuranceCompanyChoice/InsuranceCompanyChoice.html'),
             ncyBreadcrumb: {
             label: '协助客户选择保险公司'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load(['insurance/controller/InsuranceCompanyChoiceCtrl.js',
             'insurance/controller/upLoadCtrls.js']
             );
             }]
             }
             })*/
            //合作单位信息
            .state('app.base.cooperator.insureCustomer', {
                url: '/insureCustomer',
                templateUrl: getURL('insurance/view/insureCustomer/insureCustomer.html'),
                ncyBreadcrumb: {
                    label: '保险公司信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/insureCustomerCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //合作单位信息变更
            .state('app.base.informationChange.insureCustomerChange', {
                url: '/insureCustomerChange',
                templateUrl: getURL('insurance/view/insureCustomerChange/insureCustomerChange.html'),
                ncyBreadcrumb: {
                    label: '保险公司信息变更'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/insureCustomerChangeCtrl.js');
                        }]
                }
            })
            //BUSI_INSURE_PROJECT
            .state('app.insurancePlanInfoManage.insureProject', {
                url: '/insureProject',
                templateUrl: getURL('insurance/view/insureProject/insureProject.html'),
                ncyBreadcrumb: {
                    label: '保险方案信息类_日志'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/insureProjectCtrl.js');
                        }]
                }
            })
            .state('app.comInfo.form.clientService.insuranceAssessB', {
                url: '/insuranceAssessB',
                templateUrl: getURL('insurance/view/insuranceAssessB/insuranceAssessB.html'),
                ncyBreadcrumb: {
                    label: '保险公司服务质量评价'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/insuranceAssessBCtrl.js');
                        }]
                }
            })
            //保险公司服务质量评价
            /*            .state('app.###.insureServeAssess', {
             url: '/insureServeAssess',
             templateUrl: getURL('insurance/view/insureServeAssess/insureServeAssess.html'),
             ncyBreadcrumb: {
             label: 'InsureServeAssess.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/insureServeAssessCtrl.js');
             }]
             }
             })*/
            //下发机构表
            /*            .state('app.###.issuedOrg', {
             url: '/issuedOrg',
             templateUrl: getURL('insurance/view/issuedOrg/issuedOrg.html'),
             ncyBreadcrumb: {
             label: 'IssuedOrg.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/issuedOrgCtrl.js');
             }]
             }
             })*/
            //寿险业务立项信息
            /*            .state('app.###.lifeProject', {
             url: '/lifeProject',
             templateUrl: getURL('insurance/view/lifeProject/lifeProject.html'),
             ncyBreadcrumb: {
             label: 'LifeProject.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/lifeProjectCtrl.js');
             }]
             }
             })*/
            //营销计划通知
            .state('app.busManage.makePlan.marketPlan.marInf', {
                url: '/marInf',
                templateUrl: getURL('insurance/view/marInf/marInf.html'),
                ncyBreadcrumb: {
                    label: '营销计划通知'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/marInfCtrl.js',
                                'insurance/controller/upLoadCtrls.js']
                            );
                        }]
                }
            })




            //合作单位信息
            .state('app.base.customer.marketCustomer', {
                url: '/marketCustomer',
                templateUrl: getURL('insurance/view/marketCustomer/marketCustomer.html'),
                ncyBreadcrumb: {
                    label: '市场客户信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/marketCustomerCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //合作单位信息变更
            .state('app.base.informationChange.marketCustomerChange', {
                url: '/marketCustomerChange',
                templateUrl: getURL('insurance/view/marketCustomerChange/marketCustomerChange.html'),
                ncyBreadcrumb: {
                    label: '市场客户信息变更'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/marketCustomerChangeCtrl.js');
                        }]
                }
            })
            //营销计划安排报表
            /*            .state('app.###.marketingPlan', {
             url: '/marketingPlan',
             templateUrl: getURL('insurance/view/marketingPlan/marketingPlan.html'),
             ncyBreadcrumb: {
             label: 'MarketingPlan.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/marketingPlanCtrl.js');
             }]
             }
             })*/
            //营销计划
            /*            .state('app.###.marPlan', {
             url: '/marPlan',
             templateUrl: getURL('insurance/view/marPlan/marPlan.html'),
             ncyBreadcrumb: {
             label: 'MarPlan.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/marPlanCtrl.js');
             }]
             }
             })*/
            //月度营销计划
            .state('app.busManage.makePlan.monthMarketReport.marPlanMon', {
                url: '/marPlanMon',
                templateUrl: getURL('insurance/view/marPlanMon/marPlanMon.html'),
                ncyBreadcrumb: {
                    label: '财产险月度计划'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/marPlanMonCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //月度营销计划
            .state('app.busManage.makePlan.monthMarketReport.marPlanMonLife', {
                url: '/marPlanMonLife',
                templateUrl: getURL('insurance/view/marPlanMonLife/marPlanMonLife.html'),
                ncyBreadcrumb: {
                    label: '人身险月度计划'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(
                                ['insurance/controller/marPlanMonLifeCtrl.js',
                                    'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //制定营销方案
            .state('app.busManage.makePlan.makeMarketPlan.marScheme', {
                url: '/marScheme',
                templateUrl: getURL('insurance/view/marScheme/marScheme.html'),
                ncyBreadcrumb: {
                    label: '制定年度营销方案'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/marSchemeCtrl.js');
                        }]
                }
            })
            //机构权限表
            /*            .state('app.###.orgpower', {
             url: '/orgpower',
             templateUrl: getURL('insurance/view/orgpower/orgpower.html'),
             ncyBreadcrumb: {
             label: 'Orgpower.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/orgpowerCtrl.js');
             }]
             }
             })*/
            //其他管理
            .state('app.contManage.otherManage.otherConsult', {
                url: '/otherConsult',
                templateUrl: getURL('insurance/view/otherConsult/otherConsult.html'),
                ncyBreadcrumb: {
                    label: '其他管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/otherConsultCtrl.js'
                                ,
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //合作单位信息
            .state('app.base.cooperator.otherCustomer', {
                url: '/otherCustomer',
                templateUrl: getURL('insurance/view/otherCustomer/otherCustomer.html'),
                ncyBreadcrumb: {
                    label: '其他合作单位信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/otherCustomerCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //其他合作单位信息变更
            .state('app.base.informationChange.otherCustomerChange', {
                url: '/otherCustomerChange',
                templateUrl: getURL('insurance/view/otherCustomerChange/otherCustomerChange.html'),
                ncyBreadcrumb: {
                    label: '其他合作单位信息变更'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/otherCustomerChangeCtrl.js');
                        }]
                }
            })
            //参数种类
            /*            .state('app.###.paramType', {
             url: '/paramType',
             templateUrl: getURL('insurance/view/paramType/paramType.html'),
             ncyBreadcrumb: {
             label: 'ParamType.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/paramTypeCtrl.js');
             }]
             }
             })*/
            //收付款信息
            /*            .state('app.###.paymentView', {
             url: '/paymentView',
             templateUrl: getURL('insurance/view/paymentView/paymentView.html'),
             ncyBreadcrumb: {
             label: 'PaymentView.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/paymentViewCtrl.js');
             }]
             }
             })*/
            //个人车险信息
            .state('app.contManage.policyInfo.pCarInsurance', {
                url: '/pCarInsurance',
                templateUrl: getURL('insurance/view/pCarInsurance/pCarInsurance.html'),
                ncyBreadcrumb: {
                    label: '个人车险信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/pCarInsuranceCtrl.js',
                                'insurance/controller/upLoadCtrls.js']
                            );
                        }]
                }
            })
            //绩效考核
            .state('app.busManage.busQuality.perfAppraisal', {
                url: '/perfAppraisal',
                templateUrl: getURL('insurance/view/perfAppraisal/perfAppraisal.html'),
                ncyBreadcrumb: {
                    label: '月度考核'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/perfAppraisalCtrl.js');
                        }]
                }
            })
            //月度考核打分
            .state('app.busManage.busQuality.perfAppraisalScore', {
                url: '/perfAppraisalScore',
                templateUrl: getURL('insurance/view/perfAppraisalScore/perfAppraisalScore.html'),
                ncyBreadcrumb: {
                    label: '月度考核打分'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/perfAppraisalScoreCtrl.js');
                        }]
                }
            })
            //绩效考核年度
            /*            .state('app.###.perfAppraisalYear', {
             url: '/perfAppraisalYear',
             templateUrl: getURL('insurance/view/perfAppraisalYear/perfAppraisalYear.html'),
             ncyBreadcrumb: {
             label: 'PerfAppraisalYear.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/perfAppraisalYearCtrl.js');
             }]
             }
             })*/
            //合作单位信息
            .state('app.base.customer.personalCustomer', {
                url: '/personalCustomer',
                templateUrl: getURL('insurance/view/personalCustomer/personalCustomer.html'),
                ncyBreadcrumb: {
                    label: '个人客户信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/personalCustomerCtrl.js');
                        }]
                }
            })
            //合作单位信息变更
            .state('app.base.informationChange.personalCustomerChange', {
                url: '/personalCustomerChange',
                templateUrl: getURL('insurance/view/personalCustomerChange/personalCustomerChange.html'),
                ncyBreadcrumb: {
                    label: '个人客户信息变更'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/personalCustomerChangeCtrl.js');
                        }]
                }
            })
            //产险业务立项信息
            .state('app.busManage.busDevelop.busProject.personalProject', {
                url: '/personalProject',
                templateUrl: getURL('insurance/view/personalProject/personalProject.html'),
                ncyBreadcrumb: {
                    label: '个人客户业务立项'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/personalProjectCtrl.js');
                        }]
                }
            })
            //个人寿险信息
            .state('app.contManage.policyInfo.pLifeInsurance', {
                url: '/pLifeInsurance',
                templateUrl: getURL('insurance/view/pLifeInsurance/pLifeInsurance.html'),
                ncyBreadcrumb: {
                    label: '个人寿险信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/pLifeInsuranceCtrl.js',
                                'insurance/controller/upLoadCtrls.js']
                            );
                        }]
                }
            })
            //权限变更
            /*            .state('app.###.powerAlterGrant', {
             url: '/powerAlterGrant',
             templateUrl: getURL('insurance/view/powerAlterGrant/powerAlterGrant.html'),
             ncyBreadcrumb: {
             label: 'PowerAlterGrant.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/powerAlterGrantCtrl.js');
             }]
             }
             })*/
            //权限变更
            /*            .state('app.###.powerAlterGroup', {
             url: '/powerAlterGroup',
             templateUrl: getURL('insurance/view/powerAlterGroup/powerAlterGroup.html'),
             ncyBreadcrumb: {
             label: 'PowerAlterGroup.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/powerAlterGroupCtrl.js');
             }]
             }
             })*/
            //权限变更
            /*            .state('app.###.powerAlterOrg', {
             url: '/powerAlterOrg',
             templateUrl: getURL('insurance/view/powerAlterOrg/powerAlterOrg.html'),
             ncyBreadcrumb: {
             label: 'PowerAlterOrg.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/powerAlterOrgCtrl.js');
             }]
             }
             })*/
            //权限变更
            /*            .state('app.###.powerAlterUser', {
             url: '/powerAlterUser',
             templateUrl: getURL('insurance/view/powerAlterUser/powerAlterUser.html'),
             ncyBreadcrumb: {
             label: 'PowerAlterUser.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/powerAlterUserCtrl.js');
             }]
             }
             })*/
            //专家项目评价表
            /*            .state('app.###.projectEva', {
             url: '/projectEva',
             templateUrl: getURL('insurance/view/projectEva/projectEva.html'),
             ncyBreadcrumb: {
             label: 'ProjectEva.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/projectEvaCtrl.js');
             }]
             }
             })*/
            //产险业务立项信息
            /*            .state('app.###.projectHis', {
             url: '/projectHis',
             templateUrl: getURL('insurance/view/projectHis/projectHis.html'),
             ncyBreadcrumb: {
             label: 'ProjectHis.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/projectHisCtrl.js');
             }]
             }
             })*/
            //业务来源
            /*            .state('app.###.projectkind', {
             url: '/projectkind',
             templateUrl: getURL('insurance/view/projectkind/projectkind.html'),
             ncyBreadcrumb: {
             label: 'Projectkind.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/projectkindCtrl.js');
             }]
             }
             })*/
            //v_all_project
            /*            .state('app.###.projectView', {
             url: '/projectView',
             templateUrl: getURL('insurance/view/projectView/projectView.html'),
             ncyBreadcrumb: {
             label: 'ProjectView.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/projectViewCtrl.js');
             }]
             }
             })*/
            //财产险保单信息
            .state('app.contManage.policyInfo.propertyInsurance', {
                url: '/propertyInsurance',
                templateUrl: getURL('insurance/view/propertyInsurance/propertyInsurance.html'),
                ncyBreadcrumb: {
                    label: '财产险保单信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/propertyInsuranceCtrl.js',
                                'insurance/controller/upLoadCtrls.js']
                            );
                        }]
                }
            })
            //产险业务立项信息
            .state('app.busManage.busDevelop.busProject.propertyProject', {
                url: '/propertyProject',
                templateUrl: getURL('insurance/view/propertyProject/propertyProject.html'),
                ncyBreadcrumb: {
                    label: '团体客户经纪业务立项'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/propertyProjectCtrl.js');
                        }]
                }
            })
            //产险业务立项信息
            /*            .state('app.###.propertyProjectHis', {
             url: '/propertyProjectHis',
             templateUrl: getURL('insurance/view/propertyProjectHis/propertyProjectHis.html'),
             ncyBreadcrumb: {
             label: 'PropertyProjectHis.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/propertyProjectHisCtrl.js');
             }]
             }
             })*/
            //月度营销计划
            .state('app.busManage.makePlan.monthMarketReport.propertyReality', {
                url: '/propertyReality',
                templateUrl: getURL('insurance/view/propertyReality/propertyReality.html'),
                ncyBreadcrumb: {
                    label: '财产险应收账款'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/propertyRealityCtrl.js',
                                'insurance/controller/upLoadCtrls.js']
                            );
                        }]
                }
            })
            //月度营销计划
            .state('app.busManage.makePlan.monthMarketReport.propertyRealityLife', {
                url: '/propertyRealityLife',
                templateUrl: getURL('insurance/view/propertyRealityLife/propertyRealityLife.html'),
                ncyBreadcrumb: {
                    label: '人身险应收账款'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/propertyRealityLifeCtrl.js',
                                'insurance/controller/upLoadCtrls.js']
                            );
                        }]
                }
            })
            //业务备案
            .state('app.busManage.filingManage.record', {
                url: '/record',
                templateUrl: getURL('insurance/view/record/record.html'),
                ncyBreadcrumb: {
                    // label: 'Record.xml'
                    label: '备案文件管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/recordCtrl.js');
                        }]
                }
            })
            //保单信息管理
            .state('app.contManage.policyInfo.reinsurance', {
                url: '/reinsurance',
                templateUrl: getURL('insurance/view/reinsurance/reinsurance.html'),
                ncyBreadcrumb: {
                    label: '再保险保单信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/reinsuranceCtrl.js');
                        }]
                }
            })
            //代领信息管理
            .state('app.contManage.policyInfo.replace', {
                url: '/replace',
                params: {"id": null},
                templateUrl: getURL('insurance/view/replace/replace.html'),
                ncyBreadcrumb: {
                    label: '代领信息管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/replaceCtrl.js');
                        }]
                }
            })
            //业务签报
            .state('app.busManage.busSign.report', {
                url: '/report',
                templateUrl: getURL('insurance/view/report/report.html'),
                ncyBreadcrumb: {
                    label: '业务签报'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/reportCtrl.js');
                        }]
                }
            })
            //审批业务数据
            /*            .state('app.###.reportAuditData', {
             url: '/reportAuditData',
             templateUrl: getURL('insurance/view/reportAuditData/reportAuditData.html'),
             ncyBreadcrumb: {
             label: 'ReportAuditData.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/reportAuditDataCtrl.js');
             }]
             }
             })*/
            //项目费用冲销
            .state('app.assBusManage.projectFeeManage.reverseProjectCost', {
                url: '/reverseProjectCost',
                templateUrl: getURL('insurance/view/reverseProjectCost/reverseProjectCost.html'),
                ncyBreadcrumb: {
                    label: '项目费用冲销'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/reverseProjectCostCtrl.js');
                        }]
                }
            })
            //确认保险方案
            /*            .state('app.###.schemeConfirms', {
             url: '/schemeConfirms',
             templateUrl: getURL('insurance/view/schemeConfirms/schemeConfirms.html'),
             ncyBreadcrumb: {
             label: 'SchemeConfirms.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/schemeConfirmsCtrl.js');
             }]
             }
             })*/
            //业务推介
            .state('app.busManage.busDevelop.busPromotion.spread', {
                url: '/spread',
                templateUrl: getURL('insurance/view/spread/spread.html'),
                ncyBreadcrumb: {
                    label: '业务推介'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/spreadCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //对标嵌入数据
            /*            .state('app.###.standard', {
             url: '/standard',
             templateUrl: getURL('insurance/view/standard/standard.html'),
             ncyBreadcrumb: {
             label: 'Standard.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/standardCtrl.js');
             }]
             }
             })*/
            //对标嵌入数据
            .state('app.comInfo.form.busManageDouReport.standardMonth', {
                url: '/standardMonth',
                templateUrl: getURL('insurance/view/standardMonth/standardMonth.html'),
                ncyBreadcrumb: {
                    label: '月度模板导入'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/standardMonthCtrl.js');
                        }]
                }
            })
            //合作单位信息
            .state('app.base.customer.stateGridCustomer', {
                url: '/stateGridCustomer',
                params: {"id": null},
                templateUrl: getURL('insurance/view/stateGridCustomer/stateGridCustomer.html'),
                ncyBreadcrumb: {
                    label: '国网客户信息'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/stateGridCustomerCtrl.js',
                                'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //合作单位信息变更
            /*            .state('app.###.stateGridCustomerChange', {
             url: '/stateGridCustomerChange',
             templateUrl: getURL('insurance/view/stateGridCustomerChange/stateGridCustomerChange.html'),
             ncyBreadcrumb: {
             label: 'StateGridCustomerChange.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/stateGridCustomerChangeCtrl.js');
             }]
             }
             })*/
            //市场调研通知
            .state('app.busManage.makePlan.markerSurvey.surInf', {
                url: '/surInf',
                templateUrl: getURL('insurance/view/surInf/surInf.html'),
                ncyBreadcrumb: {
                    label: '市场调研报告'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(['insurance/controller/surInfCtrl.js',
                                'insurance/controller/upLoadCtrls.js']
                            );
                        }]
                }
            })
            //市场调研记录
            .state('app.busManage.makePlan.markerSurvey.surRecord', {
                url: '/surRecord',
                templateUrl: getURL('insurance/view/surRecord/surRecord.html'),
                ncyBreadcrumb: {
                    label: '市场调研记录'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load(
                                ['insurance/controller/surRecordCtrl.js',
                                    'insurance/controller/upLoadCtrls.js']);
                        }]
                }
            })
            //协同业务申报审批单
            .state('app.contManage.colBusManage.synergybill', {
                url: '/synergybill',
                templateUrl: getURL('insurance/view/synergybill/synergybill.html'),
                ncyBreadcrumb: {
                    label: '协同业务申报'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/synergybillCtrl.js');
                        }]
                }
            })
            //协同业务申报
            .state('app.contManage.colBusManage.synergyreport', {
                url: '/synergyreport',
                templateUrl: getURL('insurance/view/synergyreport/synergyreport.html'),
                ncyBreadcrumb: {
                    label: '协同业务结果报告'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/synergyreportCtrl.js');
                        }]
                }
            })
            //单据管理
            /*            .state('app.###.systemUserManager', {
             url: '/systemUserManager',
             templateUrl: getURL('insurance/view/systemUserManager/systemUserManager.html'),
             ncyBreadcrumb: {
             label: 'SystemUserManager.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/systemUserManagerCtrl.js');
             }]
             }
             })*/
            //系统日终状态
            /*            .state('app.###.system_status', {
             url: '/system_status',
             templateUrl: getURL('insurance/view/system_status/system_status.html'),
             ncyBreadcrumb: {
             label: 'System_status.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/system_statusCtrl.js');
             }]
             }
             })*/
            //测试审批信息表
            /*            .state('app.###.testapp', {
             url: '/testapp',
             templateUrl: getURL('insurance/view/testapp/testapp.html'),
             ncyBreadcrumb: {
             label: 'Testapp.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/testappCtrl.js');
             }]
             }
             })*/
            //测试审批信息表
            /*            .state('app.###.testapp2', {
             url: '/testapp2',
             templateUrl: getURL('insurance/view/testapp2/testapp2.html'),
             ncyBreadcrumb: {
             label: 'Testapp2.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/testapp2Ctrl.js');
             }]
             }
             })*/
            //立项信息
            /*            .state('app.###.theproject', {
             url: '/theproject',
             templateUrl: getURL('insurance/view/theproject/theproject.html'),
             ncyBreadcrumb: {
             label: 'Theproject.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/theprojectCtrl.js');
             }]
             }
             })*/
            //客户培训费用
            /*            .state('app.###.trainCostMaintain', {
             url: '/trainCostMaintain',
             templateUrl: getURL('insurance/view/trainCostMaintain/trainCostMaintain.html'),
             ncyBreadcrumb: {
             label: 'TrainCostMaintain.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/trainCostMaintainCtrl.js');
             }]
             }
             })*/
            //客户培训总结
            .state('app.busManage.customerService.trainManage.trainPlanSummarize', {
                url: '/trainPlanSummarize',
                templateUrl: getURL('insurance/view/trainPlanSummarize/trainPlanSummarize.html'),
                ncyBreadcrumb: {
                    label: '客户培训总结'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/trainPlanSummarizeCtrl.js');
                        }]
                }
            })

            //用户
            .state('app.userManage.user', {
                url: '/user',
                templateUrl: getURL('insurance/view/user/user.html'),
                ncyBreadcrumb: {
                    label: '用户管理'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/userCtrl.js');
                        }]
                }
            })
            //用户
            /*            .state('app.###.userAlter', {
             url: '/userAlter',
             templateUrl: getURL('insurance/view/userAlter/userAlter.html'),
             ncyBreadcrumb: {
             label: 'UserAlter.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/userAlterCtrl.js');
             }]
             }
             })*/
            //用户
            /*            .state('app.###.userBranch', {
             url: '/userBranch',
             templateUrl: getURL('insurance/view/userBranch/userBranch.html'),
             ncyBreadcrumb: {
             label: 'UserBranch.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/userBranchCtrl.js');
             }]
             }
             })*/
            //用户
            /*            .state('app.###.userCaib', {
             url: '/userCaib',
             templateUrl: getURL('insurance/view/userCaib/userCaib.html'),
             ncyBreadcrumb: {
             label: 'UserCaib.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/userCaibCtrl.js');
             }]
             }
             })*/
            //用户中间表
            /*            .state('app.###.userContrasttable', {
             url: '/userContrasttable',
             templateUrl: getURL('insurance/view/userContrasttable/userContrasttable.html'),
             ncyBreadcrumb: {
             label: 'UserContrasttable.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/userContrasttableCtrl.js');
             }]
             }
             })*/
            //用户
            .state('app.base.userInfo.userInformation', {
                url: '/userInformation',
                templateUrl: getURL('insurance/view/userInformation/userInformation.html'),
                ncyBreadcrumb: {
                    label: '查看个人信息及身份证号录入'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/userInformationCtrl.js');
                        }]
                }
            })
            //客户回访记录
            /*            .state('app.###.visitInfo', {
             url: '/visitInfo',
             templateUrl: getURL('insurance/view/visitInfo/visitInfo.html'),
             ncyBreadcrumb: {
             label: 'VisitInfo.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/visitInfoCtrl.js');
             }]
             }
             })*/
            //客户回访计划
            /*            .state('app.###.visitPlan', {
             url: '/visitPlan',
             templateUrl: getURL('insurance/view/visitPlan/visitPlan.html'),
             ncyBreadcrumb: {
             label: 'VisitPlan.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/visitPlanCtrl.js');
             }]
             }
             })*/
            //客户回访计划
            .state('app.comInfo.form.clientService.visitPlanB', {
                url: '/visitPlanB',
                templateUrl: getURL('insurance/view/visitPlanB/visitPlanB.html'),
                ncyBreadcrumb: {
                    label: '客户回访计划明细'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/visitPlanBCtrl.js');
                        }]
                }
            })
            //客户回访记录
            /*            .state('app.###.visitRecord', {
             url: '/visitRecord',
             templateUrl: getURL('insurance/view/visitRecord/visitRecord.html'),
             ncyBreadcrumb: {
             label: 'VisitRecord.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/visitRecordCtrl.js');
             }]
             }
             })*/
            //客户回访记录
            .state('app.comInfo.form.clientService.visitRecordB', {
                url: '/visitRecordB',
                templateUrl: getURL('insurance/view/visitRecordB/visitRecordB.html'),
                ncyBreadcrumb: {
                    label: '客户回访记录明细'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/visitRecordBCtrl.js');
                        }]
                }
            })
            //回访设置
            /*            .state('app.###.visitSet', {
             url: '/visitSet',
             templateUrl: getURL('insurance/view/visitSet/visitSet.html'),
             ncyBreadcrumb: {
             label: 'VisitSet.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/visitSetCtrl.js');
             }]
             }
             })*/
            //工作日
            /*            .state('app.###.workday', {
             url: '/workday',
             templateUrl: getURL('insurance/view/workday/workday.html'),
             ncyBreadcrumb: {
             label: 'Workday.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/workdayCtrl.js');
             }]
             }
             })*/
            //工作日设置
            /*            .state('app.###.workday_set', {
             url: '/workday_set',
             templateUrl: getURL('insurance/view/workday_set/workday_set.html'),
             ncyBreadcrumb: {
             label: 'Workday_set.xml'
             },
             resolve: {
             deps: ['uiLoad',
             function (uiLoad) {
             return uiLoad.load('insurance/controller/workday_setCtrl.js');
             }]
             }
             })*/


            //  待办任务与消息
            .state('app.toDoTaskAndReadMsg', {
                url: '/insurance',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '待办任务与消息'
                }
            })
            //  待办任务
            .state('app.toDoTaskAndReadMsg.toDoTask', {
                url: '/toDoTask',
                templateUrl: getURL('insurance/view/toDoTask/toDoTask.html'),
                ncyBreadcrumb: {
                    label: '待办任务'
                },
                resolve: {
                    deps: ['uiLoad',
                        function (uiLoad) {
                            return uiLoad.load('insurance/controller/toDoTaskCtrl.js');
                        }]
                }
            })
            //  消息
            .state('app.toDoTaskAndReadMsg.pubMessageInfo', {
                url: '/pubMessageInfo',
                ncyBreadcrumb: {
                    label: '消息'
                },
                templateUrl: getURL('insurance/view/pubMessageInfo/pubMessageInfo.html'),
                resolve: {
                    deps: ['$ocLazyLoad', 'uiLoad',
                        function ($ocLazyLoad, uiLoad) {
                            return uiLoad.load('insurance/controller/pubMessageInfoCtrl.js');
                        }]
                }
            })
            // 代理人
            .state('app.agent', {
                url: '/agent',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '代理人信息管理'
                }
            })
            // 代理人
            .state('app.agent.record', {
                url: '/agent',
                template: '<div  ui-view style="height: 100%;"></div>',
                ncyBreadcrumb: {
                    label: '代理人信息管理'
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
    }]);