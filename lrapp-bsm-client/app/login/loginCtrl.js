/**
 * Created by wangdao on 2016/8/1.
 */
app.controller('LoginCtrl', function ($rootScope, $scope, $http, $location, $state, $compile, ngVerify, ngDialog) {
    $scope.language = 0;
    $scope.chooseLanguage = 0;
    //    2.language值改变时，重新保存到缓存
    $rootScope.app.layout.languageInfo = $scope.language;

    var code;
    $scope.createCode = function () {
        code = "";
        $scope.nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0",
            //'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'
        ];
        $scope.clearCanvas();
        $scope.drawCode();
    };

    $scope.clearCanvas = function () {
        var c = document.getElementById("verifyCanvas");
        var cxt = c.getContext("2d");
        cxt.fillStyle = "#000000";
        cxt.beginPath();
        cxt.fillRect(0, 0, c.width, c.height);
        cxt.closePath();
    };

    $scope.convertCanvasToImage = function (canvas) {
        document.getElementById("verifyCanvas").style.display = "none";
        var image = document.getElementById("code_img");
        image.src = canvas.toDataURL("image/png");
        return image;
    };

    // 随机点(所谓画点其实就是画1px像素的线，方法不再赘述)
    $scope.drawDot = function (canvas, context) {
        var px = Math.floor(Math.random() * canvas.width);
        var py = Math.floor(Math.random() * canvas.height);
        context.moveTo(px, py);
        context.lineTo(px + 1, py + 1);
        context.lineWidth = 0.2;
        context.stroke();
    };

    // 随机线
    $scope.drawline = function (canvas, context) {
        context.moveTo(Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height));             //随机线的起点x坐标是画布x坐标0位置，y坐标是画布高度的随机数
        context.lineTo(Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height));  //随机线的终点x坐标是画布宽度，y坐标是画布高度的随机数
        context.lineWidth = 0.5;                                                  //随机线宽
        context.strokeStyle = 'rgba(50,50,50,0.3)';                               //随机线描边属性
        context.stroke();
    };

    $scope.drawCode = function () {
        var canvas = document.getElementById("verifyCanvas");  //获取HTML端画布
        var context = canvas.getContext("2d");                 //获取画布2D上下文
        context.fillStyle = "cornflowerblue";                  //画布填充色
        context.fillRect(0, 0, canvas.width, canvas.height);   //清空画布
        context.fillStyle = "white";                           //设置字体颜色
        context.font = "42px Arial";                           //设置字体
        var rand = new Array();
        var x = new Array();
        var y = new Array();
        for (var i = 0; i < 5; i++) {
            rand[i] = $scope.nums[Math.floor(Math.random() * $scope.nums.length)];
            code += rand[i];
            x[i] = i * 25 + 15;
            y[i] = Math.random() * 15 + 30;
            context.fillText(rand[i], x[i], y[i]);
        }
        //画 8 条随机线
        for (var i = 0; i < 8; i++) {
            $scope.drawline(canvas, context);
        }
        // 画30个随机点
        for (var i = 0; i < 30; i++) {
            $scope.drawDot(canvas, context);
        }
        $scope.convertCanvasToImage(canvas);
    };

    $scope.validateCode = function () {
        if ($scope.loginVO == undefined || $scope.loginVO.userCode == undefined || $scope.loginVO.userCode.length <= 0) {
            layer.alert("请输入用户名！", {icon: 2, skin: 'layui-layer-lan', closeBtn: 1});
            return false;
        }
        if ($scope.loginVO == undefined || $scope.loginVO.accept == undefined || $scope.loginVO.accept.length <= 0) {
            layer.alert("请输入密码！", {icon: 2, skin: 'layui-layer-lan', closeBtn: 1});
            return false;
        }

        if ($scope.inputCode == undefined || $scope.inputCode.length <= 0) {
            layer.alert("请输入验证码！", {icon: 2, skin: 'layui-layer-lan', closeBtn: 1});
            return false;
        } else {
            return true;
        }
        return false;
    };
    $scope.createCode();

    $scope.enterKey = function (event) {
        var e = event ? event : (window.event ? window.event : null);
        if (e.keyCode == 13) {
            //回车检测到了调用登录 ;
            $scope.login();
        }
    };

    $scope.login = function () {
        var val = $scope.validateCode();
        if (!val) return;
        layer.load(2);
        $http.post($rootScope.basePath + "sys/account/checkRequestNum").success(function (response) {
            if (response.code == -1) {
                return layer.tips(response.msg, '#login')
            } else {
                $http.post($rootScope.basePath + "sys/account/ifLogin", {
                    userCode: $scope.loginVO.userCode
                }).success(function (response) {
                    if (response.code == -1) {

                        layer.confirm(response.msg, {
                                btn: ['是', '否'], //按钮
                                btn2: function (index, layero) {
                                    layer.msg('取消登录!', {
                                        shift: 6,
                                        icon: 11
                                    });
                                },
                                shade: 0.6,//遮罩透明度
                                shadeClose: true,//点击遮罩关闭层
                            },
                            function () {
                                layer.closeAll();
                                $scope.trueLogin();

                            }
                        );
                    } else {
                        $scope.trueLogin();
                    }
                })
            }
        }).then(function (nextFunction) {
        });
    };


    $scope.trueLogin = function () {

        layer.load(2);
        $http.post($rootScope.basePath + "sys/account/login", {
            data: SM2Encrypt(angular.toJson({
                userCode: $scope.loginVO.userCode,
                accept: SM2Encrypt($scope.loginVO.accept),
                inputCheckCode: $scope.inputCode,
                imgCheckCode: code,
                sessionid: $scope.sessionid,
                hostStr: window.location.host
            }))
        }).success(function (response) {
            if (response.code == -1) {
                // 提示错误信息前重新绘制验证码
                $scope.createCode();
                return layer.tips(response.msg, '#login');
            }

            window.sessionStorage.setItem("token", response.data.session);
            if (response.data.user.isAdmin == 'Y') {
                $rootScope.isAdmin = true;
            } else {
                $rootScope.isAdmin = false;
            }
            if (response.data.user.firstLogin == "Y") {
                $scope.VO = {}
                if (response.msg) {
                    $scope.VO.message = response.msg;
                }
                $scope.response = response;
                ngDialog.openConfirm({
                    showClose: false,
                    closeByDocument: false,
                    template: getURL('common/view/updatePassword.html'),
                    className: 'ngdialog-theme-plain',
                    scope: $scope,
                    width: 550,
                    height: 300,
                }).then(function (value) {

                }, function (reason) {
                    // $scope.loadMenu(response);
                });
            } else {
                $scope.loadMenu(response);
                // $scope.checkVersion();
            }
        });
    }

    //别的登录业管系统
    $scope.sysLogin = function (id, checkCode) {
        // 加锁，等待登录请求完毕
        window.localStorage.setItem("logindata_id", id);
        $scope.loginVO = {};
        $scope.loginVO.id = id;
        $scope.loginVO.checkCode = checkCode;
        $scope.inputCode = "0";
        if ($scope.isSysLogin) {

            $http.post(serverApi + "sys/account/logout").success(function successCallback(response) {
                window.sessionStorage.removeItem("token");
            }).error(function errorCallback() {
                window.sessionStorage.removeItem("token");
            });

            $http.post($rootScope.basePath + "sys/account/sso", {
                data: SM2Encrypt(angular.toJson({
                    id: id,
                    checkCode: checkCode,
                    inputCheckCode: code,
                    imgCheckCode: code,
                    sessionid: $scope.sessionid
                }))
            }).success(function (response) {
                //未授权拦截登录
                if (response.code == 500) {
                    layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                    return null;
                }
                if (response.msg) {
                    // return window.history.go(-1);
                    $state.go('login.signin', null, {
                        reload: false//判断是否重置
                    });
                    return layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
                // 登录完成，释放锁
                window.localStorage.removeItem('logindata_id');
                window.sessionStorage.setItem("token", response.data.session);
                if (response.data.user.isAdmin == 'Y') {
                    $rootScope.isAdmin = true;
                } else {
                    $rootScope.isAdmin = false;
                }
                $scope.loadMenu(response);
                $scope.isSysLogin = false;
            });
        }
    }

    //获取url中的信息
    function getQueryVariable(variable) {
        var query = window.location.href;
        var params = query.split("?")[1];
        if (params) {
            var vars = params.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == variable) {
                    return pair[1];
                }
            }
        }
        return null;
    }

    if (null != getQueryVariable("id") && null != getQueryVariable("checkCode")) {

        $scope.isSysLogin = true;

// 判断当前是否有锁，有锁不向下执行
        if (window.localStorage.getItem("logindata_id") === getQueryVariable("id")) {
            // return;
        }
        $scope.sysLogin(getQueryVariable("id"), getQueryVariable("checkCode"));
    }


    $http.post(serverApi + "sys/account/logout").success(function successCallback(response) {
        window.sessionStorage.removeItem("token");
    }).error(function errorCallback() {
        window.sessionStorage.removeItem("token");
    });
    //查看已读发版记录是否是最新
    $scope.checkVersion = function () {
        $http.post($scope.basePath + "versionNumber/versionContrast").success(function (response) {
            layer.closeAll('loading');
            if (response && response.code == "200") {
                $rootScope.list = response.result.Rows;
                ngDialog.openConfirm({
                    showClose: false,
                    closeByDocument: false,
                    template: 'view/versionNumber/versionNumberB.html',
                    className: 'ngdialog-theme-formInfo',
                    scope: $rootScope,
                    width: 200,
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
                    // $scope.loadMenu(response);
                });
            }
        });
    }
    $scope.loadMenu = function (response) {
        $http.post($scope.basePath + "sys/menuAndButToMongoDB/findOne").success(function (res) {
            layer.closeAll('loading');
            if (res && res.code != -1) {
                if (res.data) {
                    window.sessionStorage.setItem("menu", res.data.menu);
                }
                if ($scope.loginVO.urlType) {
                    $state.go(res.data.menu);
                } else {
                    $rootScope.show('0', 'app.dashboard', '首页');
                    // $state.go('app.dashboard');
                }
                $rootScope.userVO = response.data.userRef;
                $rootScope.loginUser = response.data.user;
                $rootScope.orgVO = response.data.user.pkOrg;
                $rootScope.deptVO = response.data.user.pkDept;
                $rootScope.workDate = response.data.workDate;
                var logoURL = '../img/logo.png';
                var hostStr = window.location.host;

                if (hostStr == 'nm.cms.caib.sgcc.com.cn') {
                    logoURL = 'img/logo_ydmd.png'
                }
                if (hostStr == 'sd.cms.caib.sgcc.com.cn') {
                    logoURL = 'img/logo_sdyd.png'
                }
                if (hostStr == 'xj.cms.caib.sgcc.com.cn') {
                    logoURL = 'img/logo_xjat.png'
                }
                $rootScope.logo = logoURL;
            } else {
                // 提示错误信息前重新绘制验证码
                $scope.createCode();
                return layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
            }
        });
    };
    $scope.changeNav = function (dom, data) {
        if (data instanceof Array) {
            var tindex = 0;
            for (var i = 0; i < data.length; i++) {
                var html = "";
                if (data[i].Icon == "") {
                    html = '<li ui-sref-active="active"> <a ui-sref="' + data[i].menu_url + '"> <div class="item-content"> <div class="item-media"> <i class="' + data[i].Icon + '"></i> </div> <div class="item-inner" ng-click=clickMenu("' + data[i].pk + '","' + data[i].menu_url + '","' + data[i].menu_name + '")> <span class="title" >' + data[i].menu_name + '</span> </div> </div> </a> </li>'
                } else {
                    html = '<li ng-class="{active:$state.includes(' + data[i].menu_url + ')}"> <a href="javascript:void(0)"> <div class="item-content"> <div class="item-media"> <i class="' + data[i].Icon + '"></i> </div> <div class="item-inner"> <span class="title" >' + data[i].menu_name + '</span> </div> </div> </a> </li>'
                }
                var dom1 = $(html);
                if (data[i].parentId != null && data[i].parentId != "") {
                    if (tindex == 0) {
                        var html2 = '<ul class="sub-menu"></ul>'
                        var dom2 = $(html2);
                        dom2.append(dom1);
                        dom.append(dom2);
                    } else {
                        $(dom).find('ul').first().append(dom1);
                    }
                    tindex = 1;
                } else {
                    dom.append(dom1);
                }
                if (data[i].children && data[i].children.length != 0) {
                    $scope.changeNav(dom1, data[i].children);
                }
            }
        }
        $scope.newElm = $compile($scope.newElm)($scope);
        return $scope.newElm;
    };
});

function encryptByDES(message, key) {
    var keyHex = CryptoJS.enc.Utf8.parse(key);
    var encrypted = CryptoJS.DES.encrypt(message, keyHex, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

app.controller('versionNumberBCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog, ngVerify) {
    /**
     * 初始化页面变更方法
     */
    $scope.onCancel = function () {
        ngDialog.close($scope.ngDialogId);
        ngDialog.close();
    };
    $scope.initData = function () {
        $scope.list = $rootScope.list;
        //$scope.VO.reportChildren = [];
        $scope.versionNumberBGridOptions = {
            enableRowSelection: true,
            enableSelectAll: true,
            enableFullRowSelection: true,//是否点击cell后 row selected
            enableRowHeaderSelection: true,
            multiSelect: true,//多选
            useExternalPagination: true,
            columnDefs: [
                // {name: 'serialNo', displayName: '版本编号', width: 100,},
                {name: 'version', displayName: '版本号', width: 100,},
                {name: 'cusContent', displayName: '发版内容', width: 100,},
                {name: 'handbook', displayName: '是否下发操作手册', width: 100, cellFilter: 'SELECT_YESNO'},
                {name: 'ts', displayName: '发版时间', width: 100,},
            ],
            data: $scope.list
        };
        $scope.versionNumberBGridOptions.onRegisterApi = function (gridApi) {
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
                $scope.queryForGridChildren($scope.QUERYCHILDREN, $scope.queryPath);
            });
        };
    };

    $scope.initFunction = function () {
        $scope.downVersionFile = function () {
            $http.post($scope.basePath + "versionNumber/findNewFile").success(function (response) {
                if (response && response.code == "200") {
                    var ids = [];
                    ids.push(response.fileId);
                    var exportEx = $('#exproE');
                    exportEx.attr('target', '_blank');
                    $('#exproE input').val(ids);
                    exportEx.attr('action', $rootScope.basePath + 'uploadFile/downloadFiles');
                    exportEx.submit();
                } else {
                    if (response) {
                        layer.alert("当前版本无说明文档！", {skin: 'layui-layer-lan', closeBtn: 1});
                    }
                }
            });
        };

    };
    // $scope.initData();
    $scope.initFunction();
});