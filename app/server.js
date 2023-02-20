/**
 * Created by wangdao on 2016/8/30.
 */
// 部署项目后台访问地址
var serverApi = "http://localhost:8080/";

// 前台访问地址
var htdocs = "http://localhost:8090/";

var activitiPath = "http://192.168.252.14:8082/act/";

var archivesPath = "http://localhost:8099/";

var localizedPath = "http://localhost:8080/";

var previewPath = "http://localhost:8012/";

// 控制中英文
/**
 * 空： 可配置中英文
 *  1： 不可配置，系统为中文
 *  2： 不可配置，系统为英文
 * @type {number}
 */
var sysLanguage = '1';