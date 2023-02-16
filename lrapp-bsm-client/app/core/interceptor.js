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
            if (_config.data != null && _config.data.funcCode != null) {
                _config.headers['funcCode'] = _config.data.funcCode;
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
        responseError: function (rejection) {

            layer.closeAll('loading');
            switch (rejection.status) {
                case 404:
                    layer.alert("页面丢失了，请联系系统管理员。", {icon: 2, skin: 'layui-layer-lan', closeBtn: 1});
                    break;
                case 403:
                    layer.alert("您无权访问该界面，请联系系统管理员。", {icon: 2, skin: 'layui-layer-lan', closeBtn: 1});
                    break;
                case 500:
                    layer.alert("系统访问后台失败。", {icon: 2, skin: 'layui-layer-lan', closeBtn: 1});
                    break;
                case 401:
                    layer.msg("系统登录时间超时或者没有权限，请重新登录!", {icon: 2, time: 2000, shade: [0.5, '#000', true]});
                    localStorage.clear();
                    window.sessionStorage.removeItem("token");
                    window.sessionStorage.removeItem("menu");
                    window.location.href='/index.html';
                    break;
                default:
                    layer.alert("系统访问后台失败。", {icon: 2, skin: 'layui-layer-lan', closeBtn: 1});
                    break;
            }
            return $q.reject(rejection);
        }
    };
}]);
app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
}])
