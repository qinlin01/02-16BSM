app.controller('ReceivableAndUncollectedCtrl', function ($rootScope, $scope, $http) {
    $http.post($scope.basePath + "complianceReport/getPower", {}).success(function (response) {
        layer.load(2);
        if (response.code == 200) {
            $scope.src = "http://20.176.5.203:18088/webroot/decision/view/report?viewlet=report-HG-11.cpt&__bypagesize__=false&pk_org=" + response.power;
            // $scope.src="https://www.baidu.com/s?ie=UTF-8&wd="+response.power;
        }
        layer.closeAll('loading');
    });
    let iframe = document.getElementById("myframe");
    let height = document.body.clientHeight;
    iframe.height = height - 95 + "px";
});
app.controller('DelayedEntryOfInsurancePoliciesCtrl', function ($rootScope, $scope, $http) {
    $http.post($scope.basePath + "complianceReport/getPower", {}).success(function (response) {
        layer.load(2);
        if (response.code == 200) {
            $scope.src = "http://20.176.5.203:18088/webroot/decision/view/report?viewlet=report-HG-16.cpt&__bypagesize__=false&pk_org=" + response.power;
        }
        layer.closeAll('loading');
    });
    let iframe = document.getElementById("myframe");
    let height = document.body.clientHeight;
    iframe.height = height - 95 + "px";
});
app.controller('DelayedProjectInitiationCtrl', function ($rootScope, $scope, $http) {
    $http.post($scope.basePath + "complianceReport/getPower", {}).success(function (response) {
        layer.load(2);
        if (response.code == 200) {
            $scope.src = "http://20.176.5.203:18088/webroot/decision/view/report?viewlet=report-HG-15.cpt&__bypagesize__=false&pk_org=" + response.power;
        }
        layer.closeAll('loading');
    });
    let iframe = document.getElementById("myframe");
    let height = document.body.clientHeight;
    iframe.height = height - 95 + "px";
});
app.controller('DuplicatePolicyNoCtrl', function ($rootScope, $scope, $http) {
    $http.post($scope.basePath + "complianceReport/getPower", {}).success(function (response) {
        layer.load(2);
        if (response.code == 200) {
            $scope.src = "http://20.176.5.203:18088/webroot/decision/view/report?viewlet=report-HG-12-1.cpt&__bypagesize__=false&pk_org=" + response.power;
        }
        layer.closeAll('loading');
    });
    let iframe = document.getElementById("myframe");
    let height = document.body.clientHeight;
    iframe.height = height - 95 + "px";
});
app.controller('policiesWithoutAttachmentsCtrl', function ($rootScope, $scope, $http) {
    $http.post($scope.basePath + "complianceReport/getPower", {}).success(function (response) {
        layer.load(2);
        if (response.code == 200) {
            $scope.src = "http://20.176.5.203:18088/webroot/decision/view/report?viewlet=report-HG-14.cpt&__bypagesize__=false&pk_org=" + response.power;
        }
        layer.closeAll('loading');
    });
    let iframe = document.getElementById("myframe");
    let height = document.body.clientHeight;
    iframe.height = height - 95 + "px";
});
app.controller('StatisticsOfReceivableCtrl', function ($rootScope, $scope, $http) {
    $http.post($scope.basePath + "complianceReport/getPower", {}).success(function (response) {
        layer.load(2);
        if (response.code == 200) {
            $scope.src = "http://20.176.5.203:18088/webroot/decision/view/report?viewlet=report-HG-13.cpt&__bypagesize__=false&pk_org=" + response.power;
        }
        layer.closeAll('loading');
    });
    let iframe = document.getElementById("myframe");
    let height = document.body.clientHeight;
    iframe.height = height - 95 + "px";
});
//@zhangwj 2022-02-11
app.controller('AgainCtrl', function ($rootScope, $scope, $http) {
    $http.post($scope.basePath + "complianceReport/getPower", {}).success(function (response) {
        layer.load(2);
        if (response.code == 200) {
            $scope.src = "http://20.176.5.203:18088/webroot/decision/view/report?viewlet=BJH/report-FLHGB-3.cpt&op=write&pk_corp=" + response.power;
        }
        layer.closeAll('loading');
    });
    let iframe = document.getElementById("myframe");
    let height = document.body.clientHeight;
    iframe.height = height - 95 + "px";
});
app.controller('BasicSituationCtrl', function ($rootScope, $scope, $http) {
    $http.post($scope.basePath + "complianceReport/getPower", {}).success(function (response) {
        layer.load(2);
        if (response.code == 200) {
            $scope.src = "http://20.176.5.203:18088/webroot/decision/view/report?viewlet=BJH/report-FLHGB-1.cpt&op=write&pk_corp=" + response.power;
        }
        layer.closeAll('loading');
    });
    let iframe = document.getElementById("myframe");
    let height = document.body.clientHeight;
    iframe.height = height - 95 + "px";
});
app.controller('ConsultCtrl', function ($rootScope, $scope, $http) {
    $http.post($scope.basePath + "complianceReport/getPower", {}).success(function (response) {
        layer.load(2);
        if (response.code == 200) {
            $scope.src = "http://20.176.5.203:18088/webroot/decision/view/report?viewlet=BJH/report-FLHGB-4.cpt&op=write&pk_corp=" + response.power;
        }
        layer.closeAll('loading');
    });
    let iframe = document.getElementById("myframe");
    let height = document.body.clientHeight;
    iframe.height = height - 95 + "px";
});
app.controller('LiabilitiesCtrl', function ($rootScope, $scope, $http) {
    $http.post($scope.basePath + "complianceReport/getPower", {}).success(function (response) {
        layer.load(2);
        if (response.code == 200) {
            $scope.src = "http://20.176.5.203:18088/webroot/decision/view/report?viewlet=BJH/report-FLHGB-6.cpt&op=write&pk_corp=" + response.power;
        }
        layer.closeAll('loading');
    });
    let iframe = document.getElementById("myframe");
    let height = document.body.clientHeight;
    iframe.height = height - 95 + "px";
});
app.controller('LifeCtrl', function ($rootScope, $scope, $http) {
    $http.post($scope.basePath + "complianceReport/getPower", {}).success(function (response) {
        layer.load(2);
        if (response.code == 200) {
            $scope.src = "http://20.176.5.203:18088/webroot/decision/view/report?viewlet=BJH/report-FLHGB-2.cpt&op=write&pk_corp=" + response.power;
        }
        layer.closeAll('loading');
    });
    let iframe = document.getElementById("myframe");
    let height = document.body.clientHeight;
    iframe.height = height - 95 + "px";
});
app.controller('ProfitsCtrl', function ($rootScope, $scope, $http) {
    $http.post($scope.basePath + "complianceReport/getPower", {}).success(function (response) {
        layer.load(2);
        if (response.code == 200) {
            $scope.src = "http://20.176.5.203:18088/webroot/decision/view/report?viewlet=BJH/report-FLHGB-5.cpt&op=write&pk_corp=" + response.power;
        }
        layer.closeAll('loading');
    });
    let iframe = document.getElementById("myframe");
    let height = document.body.clientHeight;
    iframe.height = height - 95 + "px";
});
app.controller('UnlifeCtrl', function ($rootScope, $scope, $http) {
    $http.post($scope.basePath + "complianceReport/getPower", {}).success(function (response) {
        layer.load(2);
        if (response.code == 200) {
            $scope.src = "http://20.176.5.203:18088/webroot/decision/view/report?viewlet=BJH/report-FLHGB-7.cpt&op=write&pk_corp=" + response.power;
        }
        layer.closeAll('loading');
    });
    let iframe = document.getElementById("myframe");
    let height = document.body.clientHeight;
    iframe.height = height - 95 + "px";
});