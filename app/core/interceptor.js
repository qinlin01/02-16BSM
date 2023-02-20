/**
 * 拦截器
 */
app.factory("httpInterceptor", ["$q", "$location", function ($q, $location) {
    return {
        request: function (config) {
// do something on request success
//             config.headers['x-auth-token']=$rootScope.token;
            if (config.headers == undefined || config.headers['Content-Type'] == undefined) return config;

            var _config = config || $q.when(config);
            var token = window.sessionStorage.getItem("token");
            var url = config.url.split('?')[0];
            var pass = SG_sm3encrypt(url + token);
            _config.headers['x-auth-token'] = token;
            _config.headers['Vailcode'] = pass;
            if (_config.data != null && _config.data.funCode != null) {
                _config.headers['funCode'] = _config.data.funCode;
            }
            var dateStr = new Date().getTime();
            _config.headers['secret'] = dateStr;

            return config;
        },
        requestError: function (rejection) {
            layer.closeAll('loading');
            return $q.reject(rejection)
        },
        response: function (response) {
            layer.closeAll('loading');
            return response || $q.when(response);
        },
        responseError : function(rejection) {
            layer.closeAll('loading');
            if (rejection.status == 401) {
                $location.replace().path("login/signin").search({});
            }
            // if (rejection.status == -1) {
            //     $location.replace().path("login/signin").search({});
            // }
            if (rejection.status == 302) {
                $location.replace().path("login/signin").search({});
            }
            if (rejection.status == 405) {
                $location.replace().path("login/signin").search({});
            }
            if (rejection.status == 400) {
                layer.alert(rejection.data, {skin: 'layui-layer-lan', closeBtn: 1});
            }
            if (rejection.status == 404) {
                $location.replace().path("login/notfond").search({});
            }
            /* if (rejection.status == 500) {
                 $location.replace().path("login/error").search({});
             }*/
            if (rejection.data) {
                if (rejection.data.msg) {
                    // e.g. 字符转换为Entity Name
                    rejection.data.msg = rejection.data.msg.replace(/(\D{1})/g, function (matched) {
                        var rs = asciiChartSet_c2en[matched];
                        return rs == undefined ? matched : rs;
                    });
                    layer.alert(rejection.data.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                }
            }
            return $q.reject(rejection);
        }
    };
}]);
app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
}])
