'use strict';
/**
 * Clip-Two Main Controller
 *  首页配置的controller
 */
app.controller('indexCtrl', ['$rootScope', '$scope', '$state', '$translate', '$localStorage', '$window', '$document', '$timeout', 'cfpLoadingBar','$http', 'ngDialog',
function($rootScope, $scope, $state, $translate, $localStorage, $window, $document, $timeout, cfpLoadingBar,$http, ngDialog) {

	// Loading bar transition
	// -----------------------------------
	// $scope.logout = function() {
	// 	$http.post(serverApi + "/account/logout").success(function (response) {
	// 	    window.sessionStorage.setItem("token","");
	// 	    window.sessionStorage.removeItem("menu");
	// 		$state.go('login.signin');
	// 	})
	// };

    $scope.changePwd = function () {
        $scope.code = $scope.$parent.userVO.code;
        $scope.isShow = true;
        ngDialog.openConfirm({
            showClose: false,
            closeByDocument: false,
            template: getURL('common/view/updatePassword.html'),
            className: 'ngdialog-theme-default',
            scope: $scope,
            width: 600,
            height: 300,
            preCloseCallback: function (value) {
                if (value && value == "clear") {
                    //重置
                    return false;
                }
                return true;
            }

        }).then(function (value) {

        }, function (reason) {
        });
    };

	var $win = $($window);

    console.log("mainctrl doing3……");
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
		//start loading bar on stateChangeStart
		cfpLoadingBar.start();

	});
	
	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

		//stop loading bar on stateChangeSuccess
		event.targetScope.$watch("$viewContentLoaded", function() {

			cfpLoadingBar.complete();
		});

		// scroll top the page on change state
		$('#app .main-content').css({
			position : 'relative',
			top : 'auto'
		});
		
		$('footer').show();
		
		window.scrollTo(0, 0);

		if (angular.element('.email-reader').length) {
			angular.element('.email-reader').animate({
				scrollTop : 0
			}, 0);
		}

		// Save the route title
		$rootScope.currTitle = $state.current.title;
	});

	// State not found
	$rootScope.$on('$stateNotFound', function(event, unfoundState, fromState, fromParams) {
		//$rootScope.loading = false;
		console.log(unfoundState.to);
		// "lazy.state"
		console.log(unfoundState.toParams);
		// {a:1, b:2}
		console.log(unfoundState.options);
		// {inherit:false} + default options
	});

    $scope.pageTitle = function() {
        var title = $rootScope.app.name + ' - ' + ( $rootScope.app.description);
	    console.log(title);
		return title;
	};

	// save settings to local storage
	if (angular.isDefined($localStorage.layout)) {
		$scope.app.layout = $localStorage.layout;

	} else {
		$localStorage.layout = $scope.app.layout;
	}
	$scope.$watch('app.layout', function() {
		// save to local storage
		$localStorage.layout = $scope.app.layout;
	}, true);

	//global function to scroll page up
	$scope.toTheTop = function() {

		$document.scrollTopAnimated(0, 600);

	};

	// angular translate
	// ----------------------


	// Function that find the exact height and width of the viewport in a cross-browser way
	var viewport = function() {
		var e = window, a = 'inner';
		if (!('innerWidth' in window)) {
			a = 'client';
			e = document.documentElement || document.body;
		}
		return {
			width : e[a + 'Width'],
			height : e[a + 'Height']
		};
	};
	// function that adds information in a scope of the height and width of the page
	$scope.getWindowDimensions = function() {
		return {
			'h' : viewport().height,
			'w' : viewport().width
		};
	};
	// Detect when window is resized and set some variables
	$scope.$watch($scope.getWindowDimensions, function(newValue, oldValue) {
		$scope.windowHeight = newValue.h;
		$scope.windowWidth = newValue.w;
		
		if (newValue.w >= 992) {
			$scope.isLargeDevice = true;
		} else {
			$scope.isLargeDevice = false;
		}
		if (newValue.w < 992) {
			$scope.isSmallDevice = true;
		} else {
			$scope.isSmallDevice = false;
		}
		if (newValue.w <= 768) {
			$scope.isMobileDevice = true;
		} else {
			$scope.isMobileDevice = false;
		}
	}, true);
	// Apply on resize
	$win.on('resize', function() {
		
		$scope.$apply();
		if ($scope.isLargeDevice) {
			$('#app .main-content').css({
				position : 'relative',
				top : 'auto',
				width: 'auto'
			});
			$('footer').show();
		}
	});
}]);

app.controller('changePasswordCtrl',['$scope', '$rootScope', '$http', 'ngDialog', 'FileUploader', 'ngVerify', function ($scope, $rootScope, $http, ngDialog, FileUploader, ngVerify) {
    $scope.btnDisabled = false;
    $scope.closeWin = function () {
        //关闭自己的窗口
        ngDialog.close(this.ngDialogId);
    };
    $scope.confirm = function () {
        if (!$scope.VO){
            return layer.msg("请输入信息");
        }
        if (!$scope.VO.oldPassword){
            return layer.msg("请输入原密码");
        }
        if (!$scope.VO.password){
            return layer.msg("请输入新密码");
        }
        if (!$scope.VO.confirmPassword){
            return layer.msg("请输入确认密码");
        }
        var userCode = $scope.response?$scope.response.userVO.code:$scope.code;
    	$scope.ngDialogId = this.ngDialogId;
        if ($scope.VO.password == $scope.VO.confirmPassword) {
            $http.post($scope.basePath + "sys/account/checkPassword", {password: encryptByDES($scope.VO.password, '12345678')}).success(function (response) {
                if (response.code != 200&&(response.msg==null||response.msg=="")){
                    return layer.msg(response.message);
                }
                $http.post($scope.basePath + "sys/user/updatePassword", {data:SM2Encrypt(angular.toJson({
                        userCode: userCode,
                        password: encryptByDES($scope.VO.password, '12345678'),
                        confirmPassword: encryptByDES($scope.VO.confirmPassword, '12345678'),
                        oldPassword:$scope.VO.oldPassword
                    }))}).success(function (response) {
                    if (response.code == 200) {
                        layer.msg(response.msg);
                        ngDialog.close($scope.ngDialogId);
                    } else {
                        layer.alert(response.msg);
                    }
                });
            });
        } else {
            layer.alert("新密码与确认密码不匹配");
        }
    };
    $scope.initWatch = function () {
        $scope.process = {
            style: '',
            progress: 0,
            text: ''
        };
        $scope.$watch('VO.password',function (newVal){
            if(newVal){
                $http.post($scope.basePath + "sys/account/checkIntensity", {
                    password: encryptByDES(newVal, '12345678')
                }).success(function (response) {
                    if (response.intensity == '0' || response.intensity == '1') {
                        $scope.process.style = 'red';
                        $scope.process.progress = 25;
                        $scope.process.text = "弱";
                    } else if (response.intensity == '2'){
                        $scope.process.style = 'yellow';
                        $scope.process.progress = 50;
                        $scope.process.text = "中";
                    } else if (response.intensity == '3'){
                        $scope.process.style = 'green';
                        $scope.process.progress = 75;
                        $scope.process.text = "强";
                    } else if (response.intensity == '4'){
                        $scope.process.style = 'green';
                        $scope.process.progress = 100;
                        $scope.process.text = "极好";
                    }
                });
            } else {
                $scope.process = {
                    style: '',
                    progress: 0,
                    text: ''
                };
            }
        });
    };

    $scope.initWatch();
}]);
function encryptByDES(message, key) {
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}
function findImpData(message) {
    var keywords = new Array("master", "truncate", "insert", "select", "delete", "update", "declare", "alert",
        "create", "drop","and","exec","execute","count","\\*","chr","char","asc","mid","substring"
        ,"truncate","backup","net+user","net+localgroup+administrators","netlocalgroupadministrators"
        ,"netuser","like'","table","from","grant","use","column_name","group_concat","information_schema.columns"
        ,"table_schema","union","where","order","by","join","modify","+","--","into","substr"
        ,"ascii","'","%27","%28","%29","%25","having","javascript","script ","function","jscript","vbscript"
        ,"onfocus","onblur","location","document","window","onclick","href","<!--","--","->","/\\\\\\*","\\\\*/"
        ,"onfocus","confirm","prompt","()","//","onerror","/*","data:","\\u003e"+"\u003c","eval","url","expr","URLUnencoded","referrer","write"
        ,"writeln","body.innerHtml","execScript","setInterval","setTimeout","open","navigate","srcdoc"," %0a","iframe","body","form","base","img"
        ,"src","style","div","object","meta","link","input","comment","br"," &nbsp;"," &quot; &amp;"," &#x27;"," &#x2F;"," &lt;"," &gt;"," &AElig;"
        ," &Aacute;"," &Acirc;"," &Agrave;"," &Aring;"," &Atilde;"," &Auml;"," &Ccedil;"," &ETH;"," &Eacute;"," &Ecirc;"," &Egrave;"," &Euml;"
        ," &Iacute;"," &Icirc;"," &Igrave;"," &Iuml;"," &Ntilde;"," &Oacute;"," &Ocirc;"," &Ograve;"," &Oslash;"," &Otilde;"," &Ouml;"," &THORN;"
        ," &Uacute;"," &Ucirc;"," &Ugrave;"," &Uuml;"," &Yacute;"," &aacute;"," &acirc;"," &aelig;"," &agrave;"," &aring;"," &atilde;"," &auml;"
        ," &ccedil;"," &eacute;"," &ecirc;"," &egrave;"," &eth;"," &euml;"," &iacute;"," &icirc;"," &igrave;"," &iuml;"," &ntilde;"," &oacute;"
        ," &ocirc;"," &ograve;"," &oslash;"," &otilde;"," &ouml;"," &szlig;"," &thorn;"," &uacute;"," &ucirc;"," &ugrave;"," &uuml;"," &yacute;"
        ," &yuml;"," &cent;","&#39"
    );
    var info="";
    for(var p in message){
        keywords.forEach(function(value,i){
            if(Object.prototype.toString.call(message[p]) != '[object Object]'&&Object.prototype.toString.call(message[p]) != '[object Array]'){
                if (message[p]!=undefined&&JSON.stringify(message[p]).indexOf(value)!=-1) {
                    info+="【"+value+"】";
                }
            }
        })
    }
    if(info==""||info==null){
        return true;
    }else{
        layer.alert("存在敏感词"+info+"请修改",
            {skin: 'layui-layer-lan', closeBtn: 1});
        return false;
    }
}
function doCheckIdCard(code) {
    var city = {
        11: "北京",
        12: "天津",
        13: "河北",
        14: "山西",
        15: "内蒙古",
        21: "辽宁",
        22: "吉林",
        23: "黑龙江 ",
        31: "上海",
        32: "江苏",
        33: "浙江",
        34: "安徽",
        35: "福建",
        36: "江西",
        37: "山东",
        41: "河南",
        42: "湖北 ",
        43: "湖南",
        44: "广东",
        45: "广西",
        46: "海南",
        50: "重庆",
        51: "四川",
        52: "贵州",
        53: "云南",
        54: "西藏 ",
        61: "陕西",
        62: "甘肃",
        63: "青海",
        64: "宁夏",
        65: "新疆",
        71: "台湾",
        81: "香港",
        82: "澳门",
        91: "国外 "
    };
    var tip = "";
    var pass = true;

    if (code) {
        if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
            tip = "身份证号格式错误,请重新输入：";
            pass = false;
        }

        else if (!city[code.substr(0, 2)]) {
            tip = "身份证号地址编码错误，请重新输入：";
            pass = false;
        }
        else {
            //18位身份证需要验证最后一位校验位
            if (code.length == 18) {
                code = code.split('');
                //∑(ai×Wi)(mod 11)
                //加权因子
                var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
                //校验位
                var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
                var sum = 0;
                var ai = 0;
                var wi = 0;
                for (var i = 0; i < 17; i++) {
                    ai = code[i];
                    wi = factor[i];
                    sum += ai * wi;
                }
                var last = parity[sum % 11];
                if (parity[sum % 11] != code[17].toUpperCase()) {
                    tip = "身份证号输入位数错误，请重新输入：";
                    pass = false;
                }
            }
        }
        if (!pass) {
            layer.alert(tip,
                {skin: 'layui-layer-lan', closeBtn: 1});
        }
        return pass;
    } else {
        return false;
    }
}
function doCheckPhone(code) {
    var phone = /^1(3|4|5|7|8)\d{9}$/;
    if(code==null||code==undefined||code==""){
        return true;
    }
    if(!phone.test(code)){
        return false;
    }else{
        return true;
    }
}
function doSM3(msg) {
    var msgData = CryptoJS.enc.Utf8.parse(msg);
    var md;
    var sm3keycur = new SM3Digest();
    msgData = sm3keycur.GetWords(msgData.toString());
    // console.log(msgData);
    sm3keycur.BlockUpdate(msgData, 0, msgData.length);
    // console.log(msgData);
    var c3 = new Array(32);
    sm3keycur.DoFinal(c3, 0);
    return sm3keycur.GetHex(c3).toString();
}