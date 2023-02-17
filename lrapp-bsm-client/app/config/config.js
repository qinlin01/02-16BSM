// var getCookie=function(name){
//   var value="";
//   var cookie = ";"+document.cookie.replace(/;\s+/g,";")+";"
//   var pos = cookie.indexOf(";"+name+"=");
//   if(pos>-1){
//     var start = cookie.indexOf("=",pos);
//     var end = cookie.indexOf(";",start);
//     value = unescape(cookie.substring(start+1,end));
//   }
//   return value;
// };

// config
app
    .config(
        ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$httpProvider', '$sceProvider',
            function ($controllerProvider, $compileProvider, $filterProvider, $provide, $httpProvider, $sceProvider) {
                // lazy com.lr.controller, directive and service
                app.controller = $controllerProvider.register;
                app.directive = $compileProvider.directive;
                app.filter = $filterProvider.register;
                app.factory = $provide.factory;
                app.service = $provide.service;
                app.constant = $provide.constant;
                app.value = $provide.value;
                // $httpProvider.interceptors.push('httpInterceptor');
                $sceProvider.enabled(false);

                $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
                $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
                // 跨域session共享问题
                $httpProvider.defaults.withCredentials = true;
                // Override $http service's default transformRequest
                $httpProvider.defaults.transformRequest = [function (data) {
                    /**
                     * The workhorse; converts an object to x-www-form-urlencoded serialization.
                     * @param {Object} obj
                     * @return {String}
                     */
                    var param = function (obj) {
                        var query = '';
                        var name, value, fullSubName, subName, subValue, innerObj, i;

                        for (name in obj) {
                            value = obj[name];

                            if (value instanceof Array) {
                                for (i = 0; i < value.length; ++i) {
                                    subValue = value[i];
                                    fullSubName = name + '[' + i + ']';
                                    innerObj = {};
                                    innerObj[fullSubName] = subValue;
                                    query += param(innerObj) + '&';
                                }
                            } else if (value instanceof Object) {
                                for (subName in value) {
                                    subValue = value[subName];
                                    fullSubName = name + '[' + subName + ']';
                                    innerObj = {};
                                    innerObj[fullSubName] = subValue;
                                    query += param(innerObj) + '&';
                                }
                            } else if (value !== undefined && value !== null) {
                                query += encodeURIComponent(name) + '='
                                    + encodeURIComponent(value) + '&';
                            }
                        }

                        return query.length ? query.substr(0, query.length - 1) : query;
                    };

                    return angular.isObject(data) && String(data) !== '[object File]'
                        ? param(data)
                        : data;
                }];
                //设置ui-grid的语言
                //设置ui-grid的语言
                $provide.decorator('GridOptions', ['$delegate', 'i18nService', '$q', '$interval', function ($delegate, i18nService, $q, $interval) {
                    i18nService.setCurrentLang('zh-cn');
                    var gridOptions = angular.copy($delegate);
                    gridOptions.initialize = function (options) {
                        var initOptions = {
                            // initOptions.rowTemplate="<div ng-dblclick=\"grid.appScope.onRowDblClick(row.entity)\" " +
                            //   "ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" " +
                            //   "class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell'. col.isRowHeader }\" " +
                            //   "ui-grid-cell dbl-click-row></div>",
                            enableFullRowSelection: true,
                            enableRowSelection: true,
                            enableSelectAll: true,
                            multiSelect: true,
                            // saveFocus: true,
                            // saveScroll: true,
                            // saveGroupingExpandedStates: true,
                            // modifierKeysToMultiSelect:true,
                            // modifierKeysToMultiSelectCells:true,
                            enableSorting: true,
                            enableRowHeaderSelection: true,
                            enableColumnResizing: true,
                            paginationPageSizes: [10, 20, 50, 100, 200],
                            paginationPageSize: 20,
                            useExternalPagination: true,
                            enableGridMenu: true,
                            enableColumnMoving: true,
                            exporterMenuCsv: true,
                            exporterMenuPdf: false,// angular.isIE(),
                            exporterOlderExcelCompatibility: true,
                            exporterCsvFilename: 'download.csv',
                            exporterCsvLinkElement: angular.element(document.querySelectorAll(".custom-csv-link-location")),
                            exporterFieldCallback: function (grid, row, col, input) {
                                if (col.cellFilter) {
                                    if ("AMOUNT_FILTER" == col.cellFilter && !input) {
                                        return 0;
                                    }
                                    if ("RATE_FILTER" == col.cellFilter) {
                                        var value = !input ? 0 : input;
                                        return (value * 100).toFixed(4) + '%';
                                    }
                                    if ("CSV_FILTER" == col.cellFilter) {
                                        return '\t' + input;
                                    }
                                    //  if("VOUCHER_FILTER" == col.cellFilter){
                                    //     var ends="";
                                    //     if(value){
                                    //         for (var i = 0; i < value.length; i++) {
                                    //             ends=ends+" 【"+value[i].keys+":"+value[i].values.NAME+"】";
                                    //         }
                                    //     }
                                    //     return ends;
                                    // }
                                    var datas = getSelectOptionData[col.cellFilter.replace('SELECT_', '')];
                                    var map = {};
                                    if (datas) {
                                        for (var i = 0; i < datas.length; i++) {
                                            map[datas[i]['id']] = datas[i]['name']
                                        }
                                        return map[input];
                                    }
                                }
                                return input;
                            },
                            exporterPdfDefaultStyle: {fontSize: 9},
                            exporterPdfTableStyle: {margin: [30, 30, 30, 30]},
                            exporterPdfTableHeaderStyle: {fontSize: 10, bold: true, italics: true, color: 'red'},
                            exporterPdfHeader: {text: "My Header", style: 'headerStyle'},
                            exporterPdfFooter: function (currentPage, pageCount) {
                                return {text: currentPage.toString() + ' of ' + pageCount.toString(), style: 'footerStyle'};
                            },
                            exporterPdfCustomFormatter: function (docDefinition) {
                                docDefinition.styles.headerStyle = {fontSize: 22, bold: true};
                                docDefinition.styles.footerStyle = {fontSize: 10, bold: true};
                                return docDefinition;
                            },
                            exporterPdfOrientation: 'portrait',
                            exporterPdfPageSize: 'LETTER',
                            exporterPdfMaxGridWidth: 500
                        };
                        angular.extend(initOptions, options);
                        if (initOptions.columnDefs) {
                            angular.forEach(initOptions.columnDefs, function (columnDef) {
                                if (columnDef.cellFilter) {
                                    if (columnDef.cellFilter.indexOf('SELECT_') >= 0) {
                                        columnDef['editDropdownValueLabel'] = 'name';
                                        columnDef['editableCellTemplate'] = 'ui-grid/dropdownEditor';
                                        columnDef['editDropdownOptionsArray'] = getSelectOptionData[columnDef.cellFilter.replace('SELECT_', '')];
                                    } else if (columnDef.cellFilter == 'date:"yyyy-MM-dd"') {
                                        columnDef['editableCellTemplate'] = 'ui-grid/refDate';
                                    }
                                }
                                if (columnDef.url) {
                                    columnDef['editableCellTemplate'] = 'ui-grid/refEditor';
                                }
                            });
                        }
                        var reOptions = $delegate.initialize(options);

                        angular.extend(reOptions, initOptions);
                        // initOptions.onRegisterApi =  function (gridApi) {
                        //       //添加行头
                        //       gridApi.core.addRowHeaderColumn({
                        //           name: 'rowHeaderCol',
                        //           displayName: '',
                        //           width: 30,
                        //           cellTemplate: 'ui-grid/rowNumberHeader'
                        //       });
                        //       if(options.onRegisterApi) options.onRegisterApi(gridApi);
                        // };
                        return reOptions;
                    };
                    //es is the language prefix you want
                    return gridOptions;
                }]);


                //addPrototype();
            }
        ]);


app.run(
    ['$rootScope', '$filter', '$sce', '$http', 'ngDialog',
        function ($rootScope, $filter, $sce, $http, ngDialog) {
            $rootScope.getDisName = function (key, obj, replace) {
                var str = !obj ? "" : obj;
                var result;
                if (!$rootScope.EN_CN || !$rootScope.EN_CN[key] || !$rootScope.app.layout.languageInfo) {
                    result = key + str
                } else {
                    result = $rootScope.EN_CN[key][$rootScope.app.layout.languageInfo] + str;
                }
                if (replace) {
                    for (var obj in replace) {
                        result = result.replace(obj, replace[obj]);
                    }
                }
                return result;
            };

            $rootScope.getGridHtmlStyle = function (heightId, subHeightId, sub, mul) {
                var winowHeight = window.innerHeight; //获取窗口高度
                var headerHeight = angular.element(subHeightId ? subHeightId : ".lr-grid-html-query").height();
                ;
                var footerHeight = 20;

                if (sub == undefined || sub == null) {
                    sub = 0;
                }
                var showHeight = winowHeight - 50 - headerHeight - footerHeight - sub;
                var style = {'height': showHeight + 'px'};
                return style;
            };
            $rootScope['style'] = {};
            //获取消息
            var msg = getAlertMsg();
            $rootScope['ALERT_MSG'] = msg;
            //添加下拉框数据
            var selectData = getSelectOptionData;
            $rootScope['SELECT'] = selectData;

            for (var key in selectData) {
                var items = selectData[key];
                //var items = [{ id: 0, name: '3%' },{ id: 1, name: '6%' },{ id: 2, name: '17%' },{ id: 3, name: '0%' }];
                var map = {};
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    map[item.id] = item.name;
                }
                addSelectFilter("SELECT_" + key, map);
                /**
                 * 放在这里 回掉函数里面的map永远是最后一个 放在方法中引用地址会改变 所以放在方法里面
                 */
                //app.filter(key,function() {
                //    return function (input) {
                //        if (!input && input !=0) {
                //            return '';
                //        } else {
                //            return map[input];
                //        }
                //    };
                //});
            }
            addFilter($filter, $rootScope, $sce);
            addPrototype($rootScope);
            initFunction($rootScope, $http, ngDialog);
        }
    ]
);

app.run(function ($rootScope, $templateCache) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        if (typeof (current) !== 'undefined') {
            $templateCache.remove(current.templateUrl);
        }
    });
});


angular.module('ui.grid').run(['$templateCache', function ($templateCache) {
    'use strict';

    $templateCache.put('ui-grid/refEditor',
        '<input  type="text" ui-grid-editor ng-class="\'colt\' + col.uid"  ' +
        ' ui-popup-grid-ref="" ng-click=""  ' +
        'ng-model="MODEL_COL_FIELD" />');

    $templateCache.put('ui-grid/refDate',
        '<input  type="text" ui-grid-editor ng-class="\'colt\' + col.uid" ng-model="MODEL_COL_FIELD" wdate-picker-grid/>');
    $templateCache.put('ui-grid/cellEditor',
        "<div><form name=\"inputForm\"><input type=\"INPUT_TYPE\" ng-class=\"'colt' + col.uid\" ui-grid-editor ng-model=\"MODEL_COL_FIELD\" key-down></form></div>"
    );
    $templateCache.put('ui-grid/rowNumberHeader',
        '<div style="text-align:center;padding:5px">{{grid.renderContainers.body.visibleRowCache.indexOf(row)+1}}</div>');
    $templateCache.put('ui-grid/queryDocumentTemplate',
        '<div style="text-align:center;padding:5px">' +
        '    <a ng-click="grid.appScope.onQueryDocumentHeader(row.entity)">' +
        '        <span class="ng-binding">在线查看</span>' +
        '    </a>' +
        '</div>');
    //{{ getDisName(col.displayName) CUSTOM_FILTERS }}
    /*    $templateCache.put('ui-grid/uiGridHeaderCell',
            "<div role=\"columnheader\" ng-class=\"{ 'sortable': sortable }\" " + ' style="color: #1b1c1d" ' +
            "ui-grid-one-bind-aria-labelledby-grid=\"col.uid + '-header-text ' + col.uid + '-sortdir-text'\" " +
            "aria-sort=\"{{col.sort.direction == asc ? 'ascending' : ( col.sort.direction == desc ? 'descending' : (!col.sort.direction ? 'none' : 'other'))}}\">" +
                "<div role=\"button\" tabindex=\"0\" class=\"ui-grid-cell-contents ui-grid-header-cell-primary-focus\" col-index=\"renderIndex\" title=\"TOOLTIP\">" +
                  "<span class=\"ui-grid-header-cell-label\" ui-grid-one-bind-id-grid=\"col.uid + '-header-text'\" ng-bind=\"grid.appScope.getDisName(col.displayName)\"></span>" +
                  " <span ui-grid-one-bind-id-grid=\"col.uid + '-sortdir-text'\" ui-grid-visible=\"col.sort.direction\" aria-label=\"{{getSortDirectionAriaLabel()}}\">" +
                      "<i ng-class=\"{ 'ui-grid-icon-up-dir': col.sort.direction == asc, 'ui-grid-icon-down-dir': col.sort.direction == desc, 'ui-grid-icon-blank': !col.sort.direction }\" " +
                      "title=\"{{isSortPriorityVisible() ? i18n.headerCell.priority + ' ' + ( col.sort.priority + 1 )  : null}}\" aria-hidden=\"true\"></i> " +
                      "<sub ui-grid-visible=\"isSortPriorityVisible()\" class=\"ui-grid-sort-priority-number\">{{col.sort.priority + 1}}</sub>" +
                  "</span>" +
                "</div>" +
            "<div role=\"button\" tabindex=\"0\" ui-grid-one-bind-id-grid=\"col.uid + '-menu-button'\" class=\"ui-grid-column-menu-button\" ng-if=\"grid.options.enableColumnMenus && !col.isRowHeader  && col.colDef.enableColumnMenu !== false\" ng-click=\"toggleMenu($event)\" ng-class=\"{'ui-grid-column-menu-button-last-col': isLastCol}\" ui-grid-one-bind-aria-label=\"i18n.headerCell.aria.columnMenuButtonLabel\" aria-haspopup=\"true\"><i class=\"ui-grid-icon-angle-down\" aria-hidden=\"true\">&nbsp;</i></div><div ui-grid-filter></div></div>"
        );*/

}]);

//设置ui-grid的语言

function initFunction($rootScope, $http, ngDialog) {

    $rootScope.onQueryDocumentHeader = function (row, isEdit) {
        if (!row || !row.pk_pub_blob) return angular.alert("没有查询到附件!");
        $rootScope.isPdf = true;
        /*if(row.attachment_name.indexOf("pdf")>=0){
          $rootScope.isPdf = true;
        } else if(!(row.attachment_name.indexOf("doc")>=0||row.attachment_name.indexOf("docx")>=0)){
          return angular.alert("只有word可以在线查看！");
        }*/
        // $rootScope.getURL;
        if (!row.pk_pub_blob.pk_object_id) {
            row.pk_pub_blob.pk_object_id = row.pk_project_id;
        }
        // window.open($rootScope.basePath+"uploadFile/downloadFileMethod?fileId="+row.pk_pub_blob.pk_object_id);
        $http.post($rootScope.basePath + "queryDocument/queryDocumentPDF", {pk_pub_blob: row.pk_pub_blob.pk_object_id, name: row.attachment_name, url: serverApi}).success(function (response) {
            layer.closeAll('loading');
            if (response.code == 200) {
                /*pdf 打开方式*/
                if (row.attachment_name.indexOf(".pdf") >= 0 || row.attachment_name.indexOf(".png") >= 0) {
                    window.open(getURL(response.result));
                }
                if (row.attachment_name.indexOf(".xlsx") >= 0 || row.attachment_name.indexOf(".xls") >= 0) {
                    var excel = new ActiveXObject("Excel.Application");
                    excel.Visible = true;
                    excel.Workbooks.Open($rootScope.basePath + "uploadFile/downloadFileMethod?fileId=" + row.pk_pub_blob.pk_object_id);
                } else {
                    /*// window.open(getURL(response.result));
                    var word = new ActiveXObject("Wps.Application");
                    word.Visible = true;
                    word.Documents.Open($rootScope.basePath+"uploadFile/downloadFileMethod?fileId="+row.pk_pub_blob.pk_object_id);*/
                    window.open($rootScope.basePath + "uploadFile/downloadFileMethod?fileId=" + row.pk_pub_blob.pk_object_id);
                }
            }
        });
        /*if($rootScope.isPdf==true){

        }else {
          $http.post($rootScope.basePath + "queryDocument/queryDocument", {pk_pub_blob: row.pk_pub_blob.pk_pub_blob,isEdit:isEdit}).success(function (response) {
            layer.closeAll('loading');
            if(response.code == 200){
              if(angular.isIE()){
                // window.href = response.result;
                window.open(response.result);

              } else {
                // window.href = response.result;
                window.open(response.result);
              }
            }
          });
        }*/


    };


    /**
     * 联查凭证统一接口
     */
    $rootScope.onLinkVoucher = function (data) {
        ngDialog.openConfirm({
            showClose: true,
            closeByDocument: true,
            template: 'view/voucher/voucher.html',
            className: 'ngdialog-theme-formInfo',
            data: {bill_key: data}
        });
    };

    /**
     * 联查会计平台数据
     * @param data
     * @returns {*}
     */
    $rootScope.onLinkGenVoucher = function (data) {
        if (angular.isEmpty(data)) return angular.alert("业务单据主键不能为空");
        var url = baseUrl + "factoring/view.html#/?pk_org=" + $rootScope.pk_org + "&pk_user=" + $rootScope.loginUser.pk + "&fun_code=" + $rootScope.SELECT.BL_FUN[0].id + "&source_bill=" + data;
        window.open(url);
    };

    $rootScope.onLinkAuditFlow = function (gridApi, func) {
        var oneItem = gridApi.selection.getSelectedRows()[0];
        workFlowDialog.linkAuditFlow({
            source_bill: oneItem.primaryKey,
            source_name: angular.toJson(oneItem),
            resultHandler: function (actionType) {
                // $scope.queryForGrid();
                if (func) func(actionType);
            }
        })

    };
    $rootScope.onGenDocument = function (gridApi, fun, conFun) {
        if (!gridApi) return true;                                                 //   gridApi为假，肯定直接按钮不可用
        var rows = gridApi.selection.getSelectedRows();
        if (!rows || rows.length != 1) return angular.alert($rootScope.getDisName($rootScope['ALERT_MSG'].GENDOCUMENT_ONE_SELECT_MSG, "！"));
        layer.load(2);
        $http.post($rootScope.basePath + "document/onGenDocument", {data: angular.toJson(rows[0])}).success(function (response) {
            layer.closeAll('loading');
            if (!response.result || !response.result.length) return angular.alert($rootScope.getDisName($rootScope['ALERT_MSG'].DOCUMENT_DOC_MSG, "！"));
            $rootScope.contractRules = response.result;
            ngDialog.openConfirm({
                showClose: true,
                closeByDocument: true,
                template: 'view/common/documentSelect/documentSelect.html',
                className: 'ngdialog-theme-formInfo-min',
                scope: $rootScope,
                preCloseCallback: function (value) {
                    if (value && value == "clear") {
                        //重置
                        // $scope.query = {};
                        return false;
                    }
                    //取消
                    return true;
                }
            }).then(function (value) {
                if (value != null) {
                    layer.load();
                    $http.post($rootScope.basePath + "document/genDocument",
                        {
                            vo: angular.toJson(rows[0]),
                            item: angular.toJson(value.item),
                            data: angular.toJson(value.result)
                        }
                    ).success(function (response) {
                        layer.closeAll('loading');
                    });
                }
            }, function (reason) {

            });
        });
    }

    $rootScope.toDoTaskFly = function ($scope, pk, fun) {
        var scope = this;
        scope.findOne(pk, function () {
            scope.isWorkFlow = true;
            scope.isDisabled = true;
            scope.isGrid = false;
            if (fun) fun();
        });
        $http.post($rootScope.basePath + "workFlowMadelController/checkAutoAudit", {
            data: pk
        }).success(function (response) {
            layer.closeAll('loading');
            scope.isChangeAudit = response;
        });


    };
}

/**
 * 新增或重写 js对象属性 方法
 */
function addPrototype($rootScope) {

    /**
     * js Date 格式化 不会因为浏览器而生成不同格式
     * @param vo
     * @param newData
     */
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时
            "H+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        var week = {
            "0": "/u65e5",
            "1": "/u4e00",
            "2": "/u4e8c",
            "3": "/u4e09",
            "4": "/u56db",
            "5": "/u4e94",
            "6": "/u516d"
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[this.getDay() + ""]);
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    };

    /**
     * 赋值方法 newData 赋值给 vo
     * @param vo
     * @param newData
     */
    angular.extend(angular, {
        /**
         * 空判断（业务运用场景【枚举值】）
         */
        isNull: function (value) {
            return !value && value != 0;
        },
        /**
         * 空判断（业务运用场景【枚举值】）
         */
        isNotNull: function (value) {
            return !angular.isNull(value);
        },
        isIE: function () {
            var u = navigator.userAgent;
            return u.indexOf('Trident') > -1;
        },
        /**
         * 空判断（业务运用场景【0，'',[]】）
         */
        isEmpty: function (value) {
            if (angular.isNull(value)) return true;
            if ("number" == typeof (value)) return value === 0;
            if ("string" == typeof (value)) return value.length === 0;
            if ("boolean" == typeof (value)) return value;
            if ("boolean" == typeof (value) && value instanceof Array) return value.length === 0;
            return false;
        },
        /**
         * 提示框
         * @param msg 提示信息
         * @param option 提示框定义
         * @param c
         * @param obj 提示信息拼接
         * @param replace
         */
        alert: function (msg, option, c, obj, replace) {
            layer.alert($rootScope.getDisName(msg, obj, replace), option ? option : {
                title: $rootScope.getDisName('信息'),
                skin: 'layui-layer-lan',
                closeBtn: 1,
                btn: [$rootScope.getDisName('确定')]
            }, c);
        },
        choose: function (msg, str, btn, fun1, fun2) {
            layer.confirm($rootScope.getDisName(msg, str), {
                btn: btn //按钮
            }, function () {
                fun1();
            }, function () {
                fun2();
            });
        },
        confirm: function (msg, option, c, g) {
            if (!option) return console.error("option 不能为空!");
            if (option.title) {
                option.title = $rootScope.getDisName(option.title)
            } else {
                option.title = $rootScope.getDisName('信息')
            }
            layer.confirm($rootScope.getDisName(msg), option, c, g);
        },
        msg: function (msg, option, c) {
            layer.msg(msg, option ? option : {shift: 6, icon: 1}, c);
        },
        /**
         * 空判断（业务运用场景【0，'',[]】）
         */
        isNotEmpty: function (value) {
            return !angular.isEmpty(value);
        },
        /**
         * 判断str是不是 yyyy-MM-dd格式
         * @param str
         * @returns {boolean}
         */
        isDateString: function (str) {
            if (!/^(\d{4})\-(\d{1,2})\-(\d{1,2})$/.test(str))
                return false;
            var year = RegExp.$1 - 0;
            var month = RegExp.$2 - 1;
            var date = RegExp.$3 - 0;
            var obj = new Date(year, month, date);
            return !!(obj.getFullYear() == year && obj.getMonth() == month && obj.getDate() == date);
        },
        /**
         * 赋值方法 newData 赋值给 vo
         * @param vo
         * @param newData
         */
        assignData: function (vo, newData) {
            for (var key in vo) {
                if (angular.isDefined(newData[key])) {
                    if (vo[key] instanceof Array) {
                        vo[key].length = 0;
                        if (newData[key] == null || newData[key].length == 0) continue;
                        for (var i = 0; i < newData[key].length; i++) {
                            if (typeof (newData[key][i]) == 'object') {
                                for (var filed in newData[key][i]) {
                                    if (this.isDateString(newData[key][i][filed])) newData[key][i][filed] = new Date(newData[key][i][filed]);
                                }
                            }
                            vo[key].push(newData[key][i]);
                        }
                    } else {
                        if (this.isDateString(newData[key])) {
                            vo[key] = new Date(newData[key]);
                        } else {
                            vo[key] = newData[key]
                        }
                    }
                } else {
                    if (vo[key] instanceof Array) {
                        vo[key].length = 0;
                    } else {
                        vo[key] = null;
                    }
                }
            }
            for (var newKey in newData) {
                if (angular.isUndefined(vo[newKey])) {
                    if (vo[newKey] instanceof Array) {
                        vo[newKey] = newData[newKey];
                        if (vo[newKey] == null || vo[newKey].length == 0) continue;
                        for (var i = 0; i < vo[newKey].length; i++) {
                            if (typeof (vo[newKey][i]) == 'object') {
                                for (var filed in vo[newKey][i]) {
                                    if (this.isDateString(vo[newKey][i][filed])) vo[newKey][i][filed] = new Date(vo[newKey][i][filed]);
                                }
                            }
                        }
                    } else {
                        if (this.isDateString(newData[newKey])) {
                            vo[newKey] = new Date(newData[newKey]);
                        } else {
                            vo[newKey] = newData[newKey];
                        }
                    }
                }
            }
        },
        /**
         * 日期格式化
         */
        toJson: function (obj, pretty) {
            if (typeof obj === 'undefined' || (!obj && obj != 0)) return undefined;
            if (!this.isNumber(pretty)) {
                pretty = pretty ? 2 : null;
            }
            Date.prototype.toJSON = function () {
                return this.format('yyyy-MM-dd');
            };
            var json = JSON.stringify(obj, this.toJsonReplacer, pretty);
            return json ? json.replace(/\$\$hashKey/g, "hashKey") : undefined;
        },
        /**
         * 生成主键
         */
        getUUID: function () {
            return parseInt((Math.random(1) * (10000000 - 1000000) + 1000000) + "") + "" + new Date().getTime();
        },
        /**
         * 判断对象是否为空
         */
        isEmptyObject: function (e) {
            var t;
            for (t in e)
                return !1;
            return !0
        }
    });
    // angular.extend(Date,{toJSON:function () {
    //     return this.format('yyyy-MM-dd');
    // }});
    // Date.prototype.toJSON = function () {
    //     return this.format('yyyy-MM-dd');
    // }
}


/**
 * 给app添加过滤器
 * @param key
 * @param map
 */
function addSelectFilter(key, map) {
    //app['SELECT']={};
    //app['SELECT'].filter = app.filter;
    app/*['SELECT']*/.filter(key, function () {
        return function (input) {
            if (!input && input != 0) {
                return '';
            } else {
                return map[input];
            }
        };
    });
}

/**
 * 给app添加过滤器
 * @param key
 * @param map
 */
function addFilter($filter, $rootScope, $sce) {

    //标签过滤器
    app.filter('LABEL_FILTER', function () {
        return function (input, ids) {
            if (input.fieldType == $rootScope.SELECT.FIELD_TYPE[0].id) {
                //金额
                input = ' <input ng-model="SVO.' + input.fieldName.code + '" class="form-control" type="text" ng-verify placeholder="必输项" format-number required>';
            } else if (input.fieldType == $rootScope.SELECT.FIELD_TYPE[1].id) {
                //参照字段
                input = '<input class="form-control" ui-popup-ref ng-click="" ng-verify placeholder="必输项" popup-model="SVO" ng-model="SVO.' + input.fieldName.code + '.name" url=' + '"' + "'" + input.parameterValues + "'" + '"' + 'popup-model-field=' + '"' + "'" + input.fieldName.code + "'" + '"' + ' type="text" placeholder="" required>';
            } else if (input.fieldType == $rootScope.SELECT.FIELD_TYPE[2].id) {
                //下拉字段
                input = ' <select class="form-control" ng-model="SVO.' + input.fieldName.code + '" ng-options="item.id as item.name for item in SELECT.' + input.parameterValues + '"> <option value="">&#45;&#45;请选择&#45;&#45;</option> </select>';
            } else if (input.fieldType == $rootScope.SELECT.FIELD_TYPE[3].id) {
                //日期文本
                input = '<input type="text" class="form-control" required ng-model="SVO.' + input.fieldName.code + '" show-button-bar="false" datepicker-popup ng-click="opened=true" is-open="opened" required/>';
            } else if (input.fieldType == $rootScope.SELECT.FIELD_TYPE[4].id) {
                //利率
                input = ' <input class="form-control" type="text" ng-model="SVO.' + input.fieldName.code + '" format-ratio>';
            } else if (input.fieldType == $rootScope.SELECT.FIELD_TYPE[5].id) {
                //普通字段
                input = '<input class="form-control" type="text" ng-model="SVO.' + input.fieldName.code + '" ng-verify >';
            }
            return $sce.trustAsHtml(input);
        };
    });

    //字符串转html
    app.filter('strToHtml', ['$sce', function ($sce) {
        return function (val) {
            return $sce.trustAsHtml(val);
        };
    }])

    //字符串转html
    app.filter('nullToInt', function () {
        return function (input) {
            if (!input) {
                input = 0;
            }
            return input;
        };
    })

    //     节点名称的过滤器
    app.filter('node_filter', function () {

        return function (input) {
            var nodeNameArr = [];

            if (!input || input.length === 0) {
                return nodeNameArr;
            }

            if (!$rootScope.app.layout.languageInfo || $rootScope.app.layout.languageInfo === $rootScope.SELECT.CN_EN[0].id) {
                return input;
            } else {
                for (var i = 0; i < input.length; i++) {
                    var nodeName = $rootScope.getDisName(input[i]);
                    nodeNameArr.push(nodeName);
                }
            }
            return nodeNameArr;
        };

    });

    // 控制报告单位换行
    app.filter('MEMO', function () {
        return function (input) {
            if (input) {
                var br = input.indexOf("\\n")
                var html = null;
                html = '<span>' + input.substring(0, input.indexOf("正在进行的工作：")) + '</span>';
                html = html + '<br/>' + '<span>' + input.substring(input.indexOf("正在进行的工作："), input.indexOf("遇到的困难：")) + '</span>';
                html = html + '<br/>' + '<span>' + input.substring(input.indexOf("遇到的困难："), input.length) + '</span>';
            }
            return $sce.trustAsHtml(html);
        };

    });
//大文本换行显示
    app.filter('TEXTAREA', function () {
        return function (input) {
            var result;
            if (!input) {
                return $sce.trustAsHtml(input);
            } else if (input.indexOf('data-indent="1"') > 0) {
                result = input.replace('data-indent="1"', 'style="margin-left: 40px;"')
            } else if (input.indexOf('data-indent="2"') > 0) {
                result = input.replace('data-indent="1"', 'style="margin-left: 80px;"')
            } else if (input.indexOf('data-indent="3"') > 0) {
                result = input.replace('data-indent="1"', 'style="margin-left: 120px;"')
            } else if (input.indexOf('data-indent="4"') > 0) {
                result = input.replace('data-indent="1"', 'style="margin-left: 160px;"')
            } else if (input.indexOf('data-indent="5"') > 0) {
                result = input.replace('data-indent="1"', 'style="margin-left: 200px;"')
            } else if (input.indexOf('data-indent="6"') > 0) {
                result = input.replace('data-indent="1"', 'style="margin-left: 240px;"')
            } else {
                result = input;
            }
            return $sce.trustAsHtml(result);
        };

    });
    app.filter('ntobr', function () {
        var filter = function (input) {
            if (input == null || "" == input) {
                return input;
            } else {
                return input.replace(/\n/g, "<\/br>").replace(/ /g, "&nbsp;");
            }
        };
        return filter;
    });

    app.filter('trustHtml', function ($sce) {
        return function (input) {
            return $sce.trustAsHtml(input);
        }
    });

    //   下拉选项
    app.filter('SELECT_ZCN', function () {

        return function (input) {
            if (input) {
                for (var i = 0; i < input.length; i++) {
                    var map = input[i];
                    map.name = $rootScope.getDisName(map.name);
                }
            }
            return input;
        };

    });

    //借贷金额过滤
    app.filter('LEANLOAN_FILTER', function () {
        return function (input, ids) {
            if (input) {
                if (input == 'a') {
                    input = ""
                }
            }
            return input;
        };
    });

    //借贷金额过滤
    app.filter('changelanguage', function () {
        return function (input) {
            if (input && $rootScope.app.layout.languageInfo) {
                var mapSource = {
                    login_name: {1: "用户登录", 2: "Sign in"},
                    company_code: {1: "集团编号/企业编号", 2: "Company code"},
                    user_name: {1: "用户名", 2: "User name"},
                    password: {1: "密码", 2: "Password"},
                    login: {1: "登  陆", 2: "Login"}
                };

                var map = mapSource[input];
                return map[$rootScope.app.layout.languageInfo];
            } else {
                return ""
            }
        };
    });

    //凭证辅助核算过滤
    app.filter('VOUCHER_FILTER', function () {
        return function (input, ids) {
            var ends = "";
            if (input) {
                for (var i = 0; i < input.length; i++) {
                    ends = ends + " 【" + input[i].keys + ":" + input[i].values.NAME + "】";
                }
            }
            return ends;
        };
    });

    //枚举项过滤
    app.filter('ITEMS_FILTER', function () {
        return function (input, ids) {
            for (var i = 0; i < input.length; i++) {
                if (ids.indexOf(input[i].id) >= 0) input.splice(i, 1);
            }
            return input;
        };
    });
    //枚举项(显示)
    app.filter('ITEMS_VIEW', function () {
        return function (input, ids) {
            for (var i = 0; i < input.length; i++) {
                if (ids.indexOf(input[i].id) < 0) input.splice(i, 1);
            }
            return input;
        };
    });
    //保单号过滤,CSV导出加制表符
    app.filter('CSV_FILTER', function () {
        return function (input) {
            if (input) input = "\t" + input;
            return input;
        };
    });
    //金额过滤器
    app.filter('AMOUNT_FILTER', function () {
        return function (input) {
            if (!input) input = 0;
            return $filter('number')(parseFloat(input), 2);
        };
    });
    //汇率过滤器
    app.filter('RATE_FILTER', function () {
        return function (input) {
            if (!input) input = 0;
            return $filter('number')(parseFloat(input), 4);
        };
    });

    //整数过滤器
    app.filter('INT_FILTER', function () {
        return function (input) {
            if (!input) input = 0;
            return $filter('number')(parseInt(input));
        };
    });

    app.filter('REF_FILTER', function () {
        return function (input) {
            if (!input) input = "";
            return "";
        };
    });

    //比例过滤器
    app.filter('RATIO_FILTER', function () {
        return function (input) {
            if (!input) input = 0;
            var editInput = input.toString();
            if (editInput.indexOf('.') < 0 || editInput.split('.')[0] != 0) {
                //当数值没有小数点或者小数点前不等于0
                input = input / 100;
            }
            return (input * 100).toFixed(2) + '%';
        };
    });

    //比例过滤器
    app.filter('TAX_RATE_FILTER', function () {
        return function (input) {
            if (!input) input = 0;
            var editInput = input.toString();
            if (editInput.indexOf('.') < 0 || editInput.split('.')[0] != 0) {
                //当数值没有小数点或者小数点前不等于0
                input = input / 100;
            }
            return parseInt(input * 100).toString() + '%';
        };
    });

    //比例过滤器
    app.filter('STRING_TO_INT', function () {
        return function (input) {
            return parseInt(input);
        };
    });

    // app.filter('SELECT_BILL_STATUS',function() {
    //     var map = {0:'初始',1:'审核中',2:'待初审',3:'待签证'};
    //     return function (input) {
    //         if (!input && input !=0) {
    //             return '';
    //         } else {
    //             return map[input];
    //         }
    //     };
    // });
    // app.filter('SELECT_MARKETING_CHANNEL',function() {
    //     var map = {0:'个险',1:'附加险'};
    //     return function (input) {
    //         if (!input && input !=0) {
    //             return '';
    //         } else {
    //             return map[input];
    //         }
    //     };
    // });
    //日期过滤器
    app.filter('date_cell_date', function () {
        return function (input) {
            if (input)
                return input==""?"" : new Date(input).format("yyyy-MM-dd");
            // return input.toString().substring(0,input.toString().lastIndexOf('"'));
        };
    });
    //经法合同信息过滤器
    app.filter('JF_WORDS', function () {
        return function (input) {
            if (input) {
                input = input.replace("[ 查看 ]", "");
                input = input.replace("[ 合同类型说明 ]", "");
                return input;
            }
        };
    });

    //身份证过滤器
    app.filter('memoFilter', function () {
        return function (input) {
            if (input) {
                var rs = input.substr(0, 5);
                rs += "******";
                rs += input.substr(input.length - 2);
                return rs;
            }
        };
    });

    //身份证过滤器
    app.filter('phoneFilter', function () {
        return function (input) {
            if (input) {
                var rs = input.substr(0, 3);
                rs += "******";
                rs += input.substr(input.length - 2);
                return rs;
            }
        };
    });

    //金额过滤器（针对粘贴的数值，去掉逗号(电网资产保险方案和出单通知书)）
    app.filter('AMOUNT_FILTER2', function () {
        return function (input) {
            if (!input) input = 0;
            if (input != null && input != 0) {
                var editInput = input.toString();
                //当数值中含有逗号，去掉
                editInput = editInput.replaceAll(/,/g, "");
                var input = parseFloat(editInput).toFixed(2);
            }
            return $filter('number')(parseFloat(input), 2);
        };
    });

    //去掉字符串的  [ ] "
    app.filter('StringFilter', function () {
        return function (input) {
            if (input) {
                input = input.replaceAll("[","");
                input = input.replaceAll("]","");
                input = input.replaceAll("\"","");
                return input;
            }
        };
    });

}


//.config(['$translateProvider', function($translateProvider){
//  // Register a loader for the static files
//  // So, the module will search missing translation tables under the specified urls.
//  // Those urls are [prefix][langKey][suffix].
//  $translateProvider.useStaticFilesLoader({
//    prefix: 'lib/other/l10n/',
//    suffix: '.js'
//  });
//  //// Tell the module what language to use by default
//  $translateProvider.preferredLanguage('en');
//  //// Tell the module to store the language in the local storage
//  $translateProvider.useLocalStorage();
//}]);
//app.factory('SecurityHttpInterceptor', function($q) {
//    return function (promise) {
//        return promise.then(function (response) {
//                return response;
//            },
//            function (response) {
//                if (response.status === 500) {
//                    //DO WHAT YOU WANT
//                }
//                return $q.reject(response);
//            });
//    };
//});

/**
 *uiGridSelectionService 内方法重写
 * @param uiGridExporterService
 */
/*
function changeUIGridSelectionServiceFunction(uiGridSelectionService) {
  uiGridSelectionService.setClipboard = function (grid) {
    // if(!this.clipboard){
    var rowButs = document.querySelectorAll('.ui-grid-selection-row-header-buttons');
    this.clipboard = new Clipboard(rowButs, {
      // 点击copy按钮，直接通过text直接返回复印的内容
      text: function() {
        if (grid.api.selection.getSelectedRows().length > 0) {
          var text = "";
          var names = grid.api.grid.columns;
          var values = grid.api.selection.getSelectedRows();
          for (var i = 0; i < names.length; i++) {
            if (names[i].displayName == "" || names[i].displayName == null) {
              continue;
            }
            text += names[i].displayName + "\t";
          }
          text += "\r";
          for (var k = 0; k < values.length; k++) {
            for (var i = 0; i < names.length; i++) {
              if (names[i].displayName == "" || names[i].displayName == null) {
                continue;
              }
              var nameValue = "";
              if(names[i].name.split(".").length>1){
                var arr = names[i].name.split(".");
                var nameValue = values[k];
                for(var p = 0;p<arr.length;p++){
                  if(nameValue == undefined){
                    nameValue = "";
                  }else{
                    nameValue = nameValue[arr[p]];
                  }
                }
              }else{
                nameValue = values[k][names[i].name];
              }
              if("VOUCHER_FILTER" == names[i].cellFilter){
                // var ends="";
                // if(nameValue instanceof Array){
                //     for (var i = 0; i < nameValue.length; i++) {
                //         ends=ends+" 【"+nameValue[i].keys+":"+nameValue[i].values.NAME+"】";
                //     }
                //     nameValue = ends;
                // }
              } else {
                var firarr = getSelectOptionData[names[i].cellFilter&&names[i].cellFilter.replace('SELECT_','')];
                if(firarr){
                  if(nameValue != ""){
                    for (var m = 0;m<firarr.length;m++){
                      if(firarr[m].id === nameValue){
                        nameValue = firarr[m].name;
                      }
                    }
                  }
                }
              }
              text += nameValue == undefined?"\t":nameValue + "\t";
            }
            text += "\r";
          }
          return text;
        }

      }
    });
    // }
  }
  uiGridSelectionService.toggleRowSelection = function (grid, row, evt, multiSelect, noUnselect) {
    var selected = row.isSelected;
    this.setClipboard(grid);
    if (row.enableSelection === false && !selected) {
      return;
    }
    var selectedRows;
    if (!multiSelect && !selected) {
      this.clearSelectedRows(grid, evt);
    } else if (!multiSelect && selected) {
      selectedRows = this.getSelectedRows(grid);
      if (selectedRows.length > 1) {
        selected = false; // Enable reselect of the row
        this.clearSelectedRows(grid, evt);
      }
    }
    if (selected && noUnselect) {
    } else {
      row.setSelected(!selected);
      if (row.isSelected === true) {
        grid.selection.lastSelectedRow = row;
      }
      selectedRows = this.getSelectedRows(grid);
      grid.selection.selectAll = grid.rows.length === selectedRows.length;
      grid.api.selection.raise.rowSelectionChanged(row, evt);
    }
  }
};

*/
