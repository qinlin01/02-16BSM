'use strict';
var pub = angular.module('uiPopup', ['smart-table']);


pub.directive('uiPopupDate', function ($compile) {
    return {
        scope: {
            uiPopupDate: '=', /*配置日期弹出框的属性*/
            popupModel: '=', /*存日期的上层对象*/
            popupModelField: '=', /*日期在上层对象存放的属性名称*/
            pubIsNgGrid: '='/*是否是ng-grid中默认不是*/
        },
        controller: function ($scope, $filter) {
            var config = $scope.uiPopupDate;
            if (!config) return;
            //var parentDom = getScopeDomById(config.scopeId);
            //日期弹出框初始化
            var divScope;
            $scope.pubDateInit = function (config) {
                var parentScope = getScopeById(config.scopeId);
                divScope = parentScope.$new(true);
                $scope.divScope = divScope;
                divScope.pubDateOpened = false;
                divScope.inputDateFormats = ['yyyy-MM-dd', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                if (angular.isDefined($scope.popupModel) || $scope.popupModel == null || $scope.popupModel == ''
                    || angular.isDefined($scope.popupModel[$scope.popupModelField]) || $scope.popupModel[$scope.popupModelField] == null
                    || $scope.popupModel[$scope.popupModelField] == '') {
                    divScope.pubDateModel = new Date();
                } else {
                    divScope.pubDateModel = $scope.popupModel[$scope.popupModelField];
                }
                divScope.datePickerOptions = angular.isDefined(config.datePickerOptions) ?
                    config.datePickerOptions : {formatYear: 'yyyy', startingDay: 1, class: 'datepicker'};
                divScope.inputDateFormat = angular.isDefined(config.datePickerOptions) ? config.format : $scope.inputDateFormats[0];
                $scope.inputDateFormat = angular.isDefined(config.datePickerOptions) ? config.format : $scope.inputDateFormats[0];
                if (angular.isUndefined($scope.pubDateMinDate))
                    divScope.pubDateMinDate = angular.isDefined(config.minDate) ? config.config.minDate : null;
                if (angular.isUndefined($scope.pubDateMaxDate))
                    divScope.pubDateMaxDate = angular.isDefined(config.maxDate) ? config.config.maxDate : null;
                divScope.pubDateClick = function () {
                    $scope.popupModel[$scope.popupModelField] = $filter('date')(divScope.pubDateModel, $scope.inputDateFormat);
                    divScope.pubDateShow = false;
                }
            };
            /*初始化*/
            $scope.pubDateInit(config);
            /*日期清除*/
            $scope.pubDateClear = function () {
                divScope.pubDateModel = null;
            };
            // Disable weekend selection
            $scope.pubDateDisabled = function (date, mode) {
                return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
            };
            //设置最小日期
            $scope.setPubDateMinDate = function (pubDateMinDate) {
                divScope.pubDateMinDate = pubDateMinDate;
            };
            //设置最大日期
            $scope.setPubDateMaxDate = function (pubDateMaxDate) {
                divScope.pubDateMaxDate = pubDateMaxDate;
            };
        },
        link: function (scope, element, attrs) {
            //if(angular.isUndefined(element.attr('datepicker-options'))){
            //    element.attr({'datepicker-options':'dateOptions'});
            //}
            //if(angular.isUndefined(element.attr('is-open'))){
            //    element.attr('is-open','pubDateOpened');
            //}
            //if(angular.isUndefined(element.attr('datepicker-popup'))) {
            //    element.attr('datepicker-popup', '{{inputDateFormat}}');
            //}
            var divScope = scope.divScope;
            var config = scope.uiPopupDate;
            if (!config) return;
            var parentDom = getScopeDomById(config.scopeId);
            var dom;
            if (scope.pubIsNgGrid) {
                dom = document.getElementById('uiPopupDateIdGrid');
                if (angular.isDefined(dom) && dom != null && dom != '') {
                    dom.parentNode.removeChild(dom);
                }
            }
            var maxDate = angular.isDefined(scope.pubDateMaxDate) ? 'max-date="pubDateMaxDate"' : '';
            var minDate = angular.isDefined(scope.pubDateMinDate) ? 'min-date="pubDateMinDate"' : '';
            var uiPopupDateId = scope.pubIsNgGrid ? ' id="uiPopupDateId" ' : '';
            var html = '<div ng-click="" ng-mouseleave=""  ng-show="pubDateShow" style="border:1px solid #eaeff0;background-color:#fff;position: absolute;z-index:1">' +
                ' <datepicker  ui-popup-date-click="pubDateClick()" ng-model="pubDateModel"' + uiPopupDateId + ' ' + maxDate + ' ' + minDate + ' class="datepicker">' +
                ' </datepicker></div>';
            var newElm = $compile(html)(divScope);

            parentDom.append(newElm);
            newElm.bind('mouseleave', function () {
                divScope.popupRefShow = false;
            });
            newElm.bind('click', function () {
                element.focus();
            });

            element.bind('click', function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                divScope.pubDateOpened = true;
                //var newElm = angular.element(document.getElementById('uiPopupDateId'));
                var e = $event.currentTarget;
                var x = e.offsetLeft;
                var y = e.offsetTop;
                var offsetheight = e.offsetHeight;
                while (e = e.offsetParent) {
                    x += e.offsetLeft;
                    y += e.offsetTop;
                }

                e = parentDom[0];
                var x2 = 0;
                var y2 = 0;

                while (e = e.offsetParent) {
                    x2 += e.offsetLeft;
                    y2 += e.offsetTop;
                }

                newElm.css("top", y - y2 + offsetheight + "px");
                newElm.css("left", x - x2 + "px");
                if (divScope.pubDateShow == null || divScope.pubDateShow == false) {
                    divScope.pubDateShow = true;
                } else {
                    divScope.pubDateShow = false;
                }


            });

        }
    }
});
pub.directive("uiPopupRef", function ($compile, $filter, $http, $timeout) {
    return {
        scope: {
            uiPopupRef: '=',//配置 里面必须带parentScope 哪个controller调用就传哪个
            popupModel: '=',//文本框存放的上层对象
            popupModelField: '=',//model对象的属性名称 文本框本身的.namecolumnDefs
            popupModelValue: '=',
            url: '=',
            isSearch: '=',                  //是否需要查询
            isMultiple: '=',        //是否多选
            isTree: '=',              //是不是树
            openCustomerMore: '=',              //是否打开更多按钮（客户信息调用远程）
            data: '=',                //静态数据
            popupInit: '=',        //是否多选
            ngModel:'=',
            ngSearchField: '='   //查询时查询那个字段，默认name
        },
        controller: function ($scope,ngDialog) {
            if($scope.popupInit) $scope.popupModel[$scope.popupModelField] = angular.copy($scope.popupInit);
            //根据scopeId获取scope
            var config = $scope.uiPopupRef;
            var parentScope = $scope;
            var divScope = parentScope.$new(true);
            if ($scope.isTree) {
                divScope.isTree = true;
            } else {
                divScope.isTree = false;
            }
            if ($scope.openCustomerMore) {
                divScope.openCustomerMore = true;
            } else {
                divScope.openCustomerMore = false;
            }
            $scope.divScope = divScope;
            // 定义多选数组
            divScope.arr = [];
            // divScope.popupRefData = config.data;
            $scope.columnDefs = [
                {
                    field: 'code',
                    displayName: '编号'
                },
                {
                    field: 'name',
                    displayName: '名称'

                }
            ];
            if (config) {
                $scope.columnDefs = config.columnDefs;
            }

            if ($scope.data) {
                divScope.data = $scope.data;
            }

            divScope.pagination = {
                total: 0,
                current: 1
            }

            divScope.url = $scope.url;
            divScope.popupModelValue = $scope.popupModelValue;
            divScope.mousein = true;
            divScope.mousein = false;

            divScope.selectRow = function (row, num) {
                if (divScope.isMultiple) {
                    if ($("#" + num).prop('checked')) {
                        $("#" + num).prop('checked', false);
                    } else {
                        $("#" + num).prop('checked', true);
                    }
                } else {
                    if (row&&row.$$hashKey) {
                        delete row.$$hashKey
                    }
                    $scope.popupModel[$scope.popupModelField] = row;
                    $scope.ngModel;
                    divScope.value = angular.copy(row);
                    divScope.popupRefShow = false;
                    $("#" + divScope.popupRefId).hide();
                }


            };
            var isWatch = false;
            var isClick = false;
            divScope.my_tree_click = function () {
                if (isClick) {
                    isClick = false;
                    $("#" + divScope.popupRefId).hide();
                }
            }


            divScope.closes = function () {
                $(document).click(function (e) {
                    var v_id = $(e.target).attr('id');
                    if (v_id != "queryButton" && v_id != "inputId") {
                        $("#" + divScope.popupRefId).hide();
                    }
                })
            }
            divScope.my_tree_handler = function (row) {
                divScope.popupRefShow = false;
                if (row.children && row.children.length != 0) {
                    return;
                }
                var object = row;
                $scope.popupModel[$scope.popupModelField] = object;
                if ($scope.popupModel[$scope.popupModelField]) {
                    $scope.popupModel[$scope.popupModelField].parentName = divScope.getParentName($scope.popupModel[$scope.popupModelField], $scope.popupModel[$scope.popupModelField].name);
                }
                if (isWatch) {
                    isWatch = false;
                    return;
                }
                $("#" + divScope.popupRefId).hide();
            };
            divScope.hidepopup = function (event) {
                divScope.popupRefShow = false;
            }
            divScope.searchDataFocus = function () {
                this.searchData = null;
            };
            divScope.filterData = function () {
                var newVal = this.searchData;
                var data = [];
                angular.copy(divScope.popupRefData, data);
                if (!newVal || newVal == null || newVal == "") {
                    //$scope.popupModel[$scope.popupModelField]={};
                    divScope.popupRefData_show = data;
                } else {
                    var newData = [];
                    for (var i = 0; i < data.length; i++) {
                        var isAdd = false;
                        if (data[i] != null && data[i] != undefined) {
                            for (var col in data[i]) {
                                if (col == '_id' || col == 'pk') continue;
                                var value = data[i][col] == null || angular.isUndefined(data[i][col]) ? '' : data[i][col].toString();
                                if (value.indexOf(newVal) != -1) {
                                    isAdd = true;
                                    break;
                                }
                            }
                        }

                        if (isAdd) {
                            newData.push(data[i]);
                        }
                    }
                    divScope.popupRefData_show = newData;
                    // divScope.popupRefShow=false;
                }
            };

            function makePage(number, isActive) {
                return {
                    number: number,
                    isActive: isActive
                }
            }


            divScope.generatePagination = function (current) {
                var _total = divScope.pagination.total;

                var _totalPage = Math.ceil(_total / 5);

                var _startPage = (current - 2) <= 0 ? 1 : (current - 2);
                var _endPage = _startPage + 4 > _totalPage ? _totalPage : _startPage + 4;
                if (_endPage == _totalPage) {
                    _startPage = _endPage - 4 <= 0 ? 1 : _endPage - 4;
                }

                divScope.pages = [];

                for (var number = _startPage; number <= _endPage; number++) {
                    var page = makePage(number, number === current);

                    divScope.pages.push(page);
                }

            }

            divScope.close = function (num) {
                if (num == 1) {
                    $scope.popupModel[$scope.popupModelField] = "";
                }
                $("#" + divScope.popupRefId).hide();
            }
            divScope.popupClickAll = function () {
                if ($("#popuptable input:eq(0)").prop('checked')) {
                    $("#popuptable input").prop('checked', true);
                } else {
                    $("#popuptable input").prop('checked', false);
                }
            }
            divScope.multiple = function () {
                divScope.arr = [];
                var obj = $("#popuptbody :checked");
                for (var i = 0; i < obj.length; i++) {
                    divScope.arr.push(obj[i].value);
                    alert(obj[i].value);
                }
            }
            if ($scope.isSearch == undefined) {
                divScope.isSearch = true;
            } else {
                divScope.isSearch = $scope.isSearch;
            }
            if (divScope.isMultiple) {
                divScope.isMultiple = $scope.isMultiple;
            } else {
                divScope.isMultiple = false;
            }
            divScope.$watch("popupSearch", function (newVal, oldVal, scope) {
                if (newVal === oldVal || newVal == "" || !divScope.isTree) {
                    isClick = false;
                    return;
                }
                var branch = divScope.selectBranch(divScope.popupRefData_show[0], newVal);
                if (branch == null || branch == undefined) return;
                var parent = divScope.getParent(branch);
                var first = divScope.popupRefData_show[0];
                divScope.popupRefData_show[divScope.findIndex(parent)] = first;
                divScope.popupRefData_show[0] = parent;
                isWatch = true;
                $timeout(function () {
                    var array = document.getElementsByClassName('lr-ref-body-table');
                    for (var k = 0, length = array.length; k < length; k++) {
                        array[k].scrollTop = 0;
                    }
                    isClick = true;
                    divScope.my_tree.select_branch(branch);
                    $scope.$apply();
                }, 2);
            }, false);
            divScope.findIndex = function (parent) {
                for (var i = 0; i < divScope.popupRefData_show.length; i++) {
                    if (divScope.popupRefData_show[i].name == parent['name']) {
                        return i;
                    }
                }
            }
            divScope.getParentName = function (branch, name) {
                var parent = divScope.my_tree.get_parent_branch(branch);
                if (parent) {
                    name += "," + parent.name;
                    return divScope.getParentName(parent, name);
                } else {
                    return name;
                }
            }
            divScope.getParent = function (branch) {
                var parent = divScope.my_tree.get_parent_branch(branch);
                if (parent) {
                    return divScope.getParent(parent);
                } else {
                    return branch;
                }
            }
            divScope.selectBranch = function (object, newVal) {
                if (object.name.indexOf(newVal) != -1) {
                    return object;
                }
                return divScope.selectBranch(divScope.my_tree.get_next_branch(object), newVal);
            }
            divScope.requestGridData = function (page, num) {
                if (divScope.countNum < page && num == 0) {
                    return;
                }
                if (page < 1 && num != 1) {
                    return;
                }
                divScope.pageNow = page;
                if (divScope.url) {
                    var url = divScope.$parent.url;
                    if (typeof url == 'function') {
                        url = url();
                    }
                    var ifHttp=url.indexOf("http");
                    if (divScope.$root.basePath&&ifHttp==-1) {
                        url = divScope.$root.basePath + url;
                    }
                    var data = {page: divScope.pageNow, pageSize: 5,current:divScope.pageNow,size: 5};
                    if (!divScope.$parent.popupModelValue) divScope.$parent.popupModelValue = {};
                    if(divScope.$parent.ngSearchField){
                        divScope.$parent.popupModelValue[divScope.$parent.ngSearchField] = divScope.popupSearch;
                    }else{
                        divScope.$parent.popupModelValue['name'] = divScope.popupSearch;
                    }
                    var caxun = divScope.$parent.popupModelValue;
                    data['data'] = angular.toJson(caxun);
                    data['params'] = angular.toJson(caxun);
                    layer.load(2)
                    if (divScope.data) {
                        divScope.popupRefData_show = divScope.data;
                        divScope.showRef(event);
                    } else {
                        $http.post(url, data)
                            .success(function (response) {
                                if (response.code == 200) {
                                    //@zhangwj 新增支持mybatis plus 原生分页查询结果
                                    var responseResult = {Rows:null,Total:null};
                                    if(response.result){
                                        responseResult.Rows = response.result.Rows;
                                        responseResult.Total = response.result.Total;
                                    }
                                    if(response.data){
                                        responseResult.Rows = response.data.records;
                                        responseResult.Total = response.data.total;
                                    }
                                    //@zhangwj 参照增加字段Filter
                                    for (let i = 0; i < divScope.$parent.columnDefs.length; i++) {
                                        //如果增加cellFilter参数则数据过滤
                                        if(divScope.$parent.columnDefs[i].cellFilter && "" != divScope.$parent.columnDefs[i].cellFilter && divScope.$parent.columnDefs[i].cellFilter.indexOf("SELECT_") >= 0){
                                            var types = getSelectOptionData[divScope.$parent.columnDefs[i].cellFilter.replace('SELECT_', '')];
                                            for (let j = 0; j < responseResult.Rows.length; j++) {
                                                for (let k = 0; k < types.length; k++) {
                                                    let key = divScope.$parent.columnDefs[i].field.replace("_ref","");
                                                    if(types[k].id == responseResult.Rows[j][key]){
                                                        responseResult.Rows[j][divScope.$parent.columnDefs[i].field] = types[k].name;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    //放入数据
                                    divScope.popupRefData = responseResult;
                                    divScope.popupRefData_show = responseResult.Rows
                                    divScope.countNum = Math.ceil(responseResult.Total / 5);
                                    divScope.pagination.total = responseResult.Total
                                    layer.closeAll('loading');
                                    //scope.popupRefData = response.result;
                                    if (response.columnDefs) {
                                        divScope.columnDefs = response.columnDefs;
                                    }
                                    if (page >= divScope.countNum) {
                                        divScope.pageNow = divScope.countNum;
                                        divScope.generatePagination(divScope.countNum);
                                    } else {
                                        divScope.generatePagination(page);
                                    }
                                }
                                layer.closeAll('loading');


                                divScope.showRef(event);
                            }).error(function (error) {
                            layer.closeAll('loading');
                            divScope.showRef(event);
                        });
                    }

                }
            }
            divScope.addCustomer = function () {
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: 'base/customer/stateGridCustomer/addCustomerForm.html',
                    className: 'ngdialog-theme-formInfo',
                    scope: $scope,
                    preCloseCallback: function (value) {
                        return true;
                    }
                }).then(function (value) {
                    if (value != null) {
                        $scope.selectRow(value,null)
                    }
                }, function (reason) {

                });
            }
        },
        link: function (scope, element, attrs, ngModelCtrl) {
            var config = scope.uiPopupRef;
            var tree;
            if (!config) {
                config = {};
            }
            var columnDefs = scope.columnDefs;
            if (!columnDefs) return;
            var parentDom = getScopeDomById(scope.$parent.$id);
            var divScope = scope.divScope;
            //获取滚动条DOM的主键
            //var parent=attrs.$$element.context.parentElement;
            //if(parent.style !=null &&　angular.isDefined(parent.style)){
            //    while(parent.style.overflowY!='auto'){
            //        parent=parent.parentElement;
            //    }
            //}
            var uiPopupRefId;
            if (scope.popupIsNgGrid) {
                var dom = document.getElementById('uiPopupRefId');
                if (angular.isDefined(dom) && dom != null && dom != '') {
                    dom.parentNode.removeChild(dom);
                }
                uiPopupRefId = ' id="uiPopupRefId" ';
            } else {
                var id = new Date().getTime() + Math.floor(Math.random())
                uiPopupRefId = ' id="' + id + '"';

                divScope.popupRefId = id;
            }

            divScope.my_tree = tree = {};
            divScope.popupRefData_show = [];
            divScope.popupRefShow = true;


            var divClass = angular.isDefined(config.divClass) ? config.divClass : '';
            var tableClass = angular.isDefined(config.tableClass) ? config.tableClass : 'table table-striped';
            var tableStyle = config.tableStyle ? config.tableStyle : ('width:' + columnDefs.length * 190 + 'px');//'height:280px;width:600px';
            var divStyle = angular.isDefined(config.divStyle) ? config.divStyle : 'min-width:550px;background-color:#fff;position: absolute;z-index:1000';

            //var html = '<div ng-mouseleave="" '+ uiPopupRefId +' ng-show="popupRefShow" style="'+divStyle+'" class="'+divClass+'" >' +
            //    '<table class="'+tableClass+'" ng-grid="pubRefSelect"  style="'+tableStyle+'" > </table>' +
            //    '</div>';
            /*var html = '<div   ng-mouseenter="mousein=true"  ng-mouseleave="mousein=false" ' + uiPopupRefId + ' ng-show="popupRefShow" style="' + divStyle + '" class="' + divClass + '" >' +
             '<input id="searchData" placeholder="请输入过滤条件" ng-blur="hidepopup()" type="text" ng-model="searchData" size="25" style="width:{{input_width}}px;height:{{input_height}}px;float:{{float}}"/>' +
             '<div style="width:400px; height:300px; overflow:auto; border:1px solid #eaeff0;">' +
             '<table  st-table="popupRefData" class="' + tableClass + '" style="' + tableStyle + '">' +
             '<thead>' +
             '<tr>';*/


            //判断是不是树形参照
            if (divScope.isTree) {
                var html = '<div ng-mouseenter="mousein=true"  ng-mouseleave="mousein=false"  class="lr-ref" ' + uiPopupRefId + ' style="' + divStyle + '">' +
                    '<div class="panel-heading" style="border-bottom: solid 1px #DDDDDD;"><span style="float: left">请选择{{titlename}}</span> <span style="float: right;"><button class="btn w-xs fa fa-times" type="button" style="background: #fff" ng-click="close(0)"></button></span>' +
                    '</div>' +
                    '<div>' +
                    /*'<div ng-show="isSearch" style="padding: 5px;"><input class="form-control" ng-model="popupSearch" placeholder="请输入关键字查询" style="display: inline-block;border-radius:0px;"></div>' +*/
                    '<div class="lr-ref-body-table"     style="padding: 5px 5px 0px 5px;height: 300px;overflow-y: auto">';
                var htmlTemp = '<abn-tree tree-data = "popupRefData_show" tree-control = "my_tree" on-select = "my_tree_handler(branch)" ng-click="my_tree_click()" initial-selection="my_tree_selected"  expand-level = "0" icon-leaf = "fa fa-file-o" icon-expand = "fa fa-plus" icon-collapse ="fa fa-minus"></abn-tree>';
                html = html + htmlTemp;
            }
            else {
                var html = '<div ng-mouseenter="mousein=true"  ng-mouseleave="mousein=false"  class="lr-ref" ' + uiPopupRefId + ' style="' + divStyle + '">' +
                    '<div class="panel-heading" style="border-bottom: solid 1px #DDDDDD;"><span style="float: left">请选择{{titlename}}</span> <span style="float: right;"><button class="btn w-xs fa fa-times" type="button" style="background: #fff" ng-click="close(0)"></button></span>' +
                    '</div>' +
                    '<div>' +
                    '<div ng-show="isSearch" style="padding: 5px 0px 0px 5px;" ><input class="form-control" id="inputId"  ng-model="popupSearch" placeholder="请输入关键字查询" ng-blur="closes()" style="width: 70%;display: inline-block;border-radius:0px;"><span style="vertical-align: baseline;margin-left: 10px"><button class="btn w-xs fa fa-search" style="padding: 9px 13px 9px 13px;border-bottom: solid 1px #ccc;border-top: solid 1px #ccc;border-right: solid 1px #ccc;border-left: solid 1px #ccc;" ng-click="requestGridData(pageNow,1)"></button></span></div>' +
                    '<div class="lr-ref-body-table"     style="padding: 5px 5px 0px 5px;">' +
                    '<table class="table table-hover table-bordered" id="popuptable"><thead><tr>';
                var radioth = "";
                var radiotd = "";
                if (divScope.isMultiple) {
                    radioth = '<th style="width:20px"><div class="checkbox clip-check check-info checkbox-inline"> <input type="checkbox" id="checkboxPopup" ng-click="popupClickAll()"> <label for="checkboxPopup"> </label> </div></th>';
                    radiotd = '<td><div class="checkbox clip-check check-info checkbox-inline"> <input type="checkbox" id="{{$index}}" value="{{row}}"> <label for="{{$index}}"> </label> </div></td>';
                }
                var td = '<tr ng-repeat="row in popupRefData_show" ng-click="selectRow(row,$index)">';
                for (var i = 0; i < columnDefs.length; i++) {
                    var columnDef = columnDefs[i];
                    var th = '<th><span>' + columnDef.displayName + '</span></th>';
                    if (i == columnDefs.length - 1) {
                        html = html + th + radioth + '</tr></thead><tbody id="popuptbody">';
                        td = td + '<td style="min-width: 100px;">{{row.' + columnDef.field + '}}</td>' + radiotd + '</tr></tbody></table></div>' +
                            '<div ng-show=" popupRefData_show == null || popupRefData_show.length == 0 " class="center" style="padding: 10px 10px 20px"><span style="font-size: 12px; color: #8e8e93"><i class="fa fa-smile-o"></i>暂无数据';
                        if (divScope.openCustomerMore){
                            td = td + '<p><button ng-click="addCustomer()">点击添加企业信息</button></p>'
                        }
                        td = td + '</span></div>' +
                            ' <div class="panel-footer" ng-show=" popupRefData_show != null ">' +
                            '<div class="row">' +
                            '<div class="col-sm-9 pad">' +
                            '<ul class="pagination pagination-sm m-t-none m-b-none">' +
                            '<li><a ng-click="requestGridData(pageNow-1,0)"><i class="fa fa-chevron-left"></i></a></li>' +
                            '<li><a href id="pageNumNow" ng-bind-html="pageNow"></a></li>' +
                            '<li><a ng-click="requestGridData(1,0)" >首页</a></li>' +
                            ' <li ng-repeat="page in pages"><a ng-click="requestGridData(page.number,0)"> {{page.number}} </a></li>' +
                            '<li><a ng-click="requestGridData(countNum,0)" >尾页</a></li>' +
                            '<li><a ng-click="requestGridData(pageNow+1,0)"><i class="fa fa-chevron-right"></i></a></li>' +
                            '</ul>' +
                            '</div>' +
                            '<div class="approvalbut col-sm-3">' +
                            '<button ng-show="divScope.isMultiple" type="button" class="btn w-xs" ng-click="multiple()"> 确认</button>' +
                            '<button type="button" class="btn w-xs" ng-click="close(1)"> 清空</button>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '</div></div>';
                    } else {
                        html = html + th;
                        if (columnDef.cellFilter) {
                            td = td + '<td  style="min-width: {{row.' + columnDef.field + '.length > 4 ? (row.' + columnDef.field + '.length * 5) : 50}}px"><div>{{row.' + columnDef.field + ' | ' + columnDef.cellFilter + '}}</div></td>';
                        } else {
                            td = td + '<td  style="min-width: {{row.' + columnDef.field + '.length > 4 ? (row.' + columnDef.field + '.length * 5) : 50}}px"><div>{{row.' + columnDef.field + '}}</div></td>';
                        }
                    }
                    //生成表体html
                }
                html = html + td;
            }
            var newElm = $compile(html)(divScope);

            parentDom.append(newElm);

            $("#" + divScope.popupRefId).hide().mouseleave(function () {
                // $(this).hide();
                divScope.mousein = false;
            });

            divScope.showRef = function (event) {
                /*                if(divScope.isTree){
                 divScope.popupRefData_show.forEach(function(value,index,array){
                 array[index].selected = false;    //初始化树形参照不选中
                 });
                 }*/
                //scope.filterDate('');
                // var offset=$("#content").scrollTop();
                var e = event.currentTarget;
                var x = e.offsetLeft;
                var y = e.offsetTop;
                var offsetheight = e.offsetHeight;
                var offsetWidth = e.offsetWidth;
                while (e = e.offsetParent) {
                    x += e.offsetLeft;
                    y += e.offsetTop;
                }

                e = parentDom[0];
                var x2 = 0;
                var y2 = 0;

                while (e = e.offsetParent) {
                    x2 += e.offsetLeft;
                    y2 += e.offsetTop;
                    offsetheight++;
                }

                if (x > window.screen.width * 0.6) {
                    divScope.float = "right";
                    newElm.css("top", y - y2 + offsetheight + "px");
                    newElm.css("left", x - x2 - 550 + offsetWidth + "px");
                }
                else {
                    divScope.float = "left";
                    newElm.css("top", y - y2 + offsetheight + "px");
                    newElm.css("left", x - x2 + "px");
                }


                /* if(divScope.popupRefShow==null||divScope.popupRefShow==false){
                 divScope.popupRefShow=true;
                 }else{
                 divScope.popupRefShow=false;
                 }*/

                // divScope.popupRefShow = !divScope.popupRefShow;

                divScope.input_width = event.currentTarget.offsetWidth;
                divScope.input_height = event.currentTarget.offsetHeight;

                var queryID = "#" + divScope.popupRefId;
                $(queryID).show();


                //angular.element("#searchData").focus();

            };


            // if(scope.ngChange) element.bind("change",scope.ngChange);
            // element.bind("blur", function (event) {
            //     // divScope.hidepopup(event);
            //     if (!divScope.mousein) {
            //         $("#" + divScope.popupRefId).hide();
            //     }
            // });
            // document.body.addEventListener('click',function (event) {
            //     if(event.target.parentElement.id != divScope.popupRefId){
            //         $("#" + divScope.popupRefId).hide();
            //     }
            // })

            element.bind({
                blur: function () {
                    if (!divScope.mousein) {
                        $("#" + divScope.popupRefId).hide();
                    }
                },
                change: function () {
                    if (!scope.ngModel) {
                        divScope.selectRow(null);
                    } else {
                        // var row = scope.popupModel[scope.popupModelField];
                        // var value = scope.valueName?row[scope.valueName]:row['name'];
                        // if(value != scope.ngModel){
                        //
                        // }
                        divScope.selectRow(divScope.value);
                    }
                },
                focus: function (event) {
                    if (divScope.popupModelValue) {
                        divScope.$parent.popupModel[divScope.$parent.popupModelField] = "";
                    }

                    divScope.pageNow = 1;
                    divScope.popupSearch = "";
                    if (divScope.url) {
                        var url = divScope.$parent.url;
                        if (typeof url == 'function') {
                            url = url();
                        }
                        var ifHttp=url.indexOf("http");
                        if (divScope.$root.basePath&&ifHttp==-1) {
                            url = divScope.$root.basePath + url;
                        }
                        var data = {page: divScope.pageNow, pageSize: 5,current:divScope.pageNow,size: 5};
                        if (divScope.popupModelValue) data['data'] = angular.toJson(divScope.popupModelValue);
                        if (divScope.popupModelValue) data['params'] = angular.toJson(divScope.popupModelValue);
                        divScope.titlename = event.target.parentNode.parentElement.firstChild.innerText;
                        if (divScope.$parent.popupModelValue) data['data'] = angular.toJson(divScope.$parent.popupModelValue);
                        if (divScope.$parent.popupModelValue) data['params'] = angular.toJson(divScope.$parent.popupModelValue);
                        divScope.titlename = event.target.parentNode.parentElement.firstChild.innerText;
                        if (divScope.data) {
                            divScope.popupRefData_show = divScope.data;
                            divScope.showRef(event);
                        } else {

                            layer.load(2);
                            $http.post(url, data)
                                .success(function (response) {
                                    if (response.code == 200) {

                                        //@zhangwj 新增支持mybatis plus 原生分页查询结果
                                        var responseResult = {Rows:null,Total:null};
                                        if(response.result){
                                            responseResult.Rows = response.result.Rows;
                                            responseResult.Total = response.result.Total;
                                        }
                                        if(response.data){
                                            responseResult.Rows = response.data.records;
                                            responseResult.Total = response.data.total;
                                        }
                                        //@zhangwj 参照增加字段Filter
                                        for (let i = 0; i < divScope.$parent.columnDefs.length; i++) {
                                            //如果增加cellFilter参数则数据过滤
                                            if(divScope.$parent.columnDefs[i].cellFilter && "" != divScope.$parent.columnDefs[i].cellFilter && divScope.$parent.columnDefs[i].cellFilter.indexOf("SELECT_") >= 0){
                                                var types = getSelectOptionData[divScope.$parent.columnDefs[i].cellFilter.replace('SELECT_', '')];
                                                for (let j = 0; j < responseResult.Rows.length; j++) {
                                                    for (let k = 0; k < types.length; k++) {
                                                        let key = divScope.$parent.columnDefs[i].field.replace("_ref","");
                                                        if(types[k].id == responseResult.Rows[j][key]){
                                                            responseResult.Rows[j][divScope.$parent.columnDefs[i].field] = types[k].name;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        //放入数据
                                        divScope.popupRefData = responseResult;
                                        divScope.popupRefData_show = responseResult.Rows
                                        divScope.countNum = Math.ceil(responseResult.Total / 5);
                                        divScope.pagination.total = responseResult.Total
                                        //scope.popupRefData = response.result;
                                        if (divScope.$parent.isMultiple) {
                                            divScope.isMultiple = divScope.$parent.isMultiple;
                                        }
                                        if (response.columnDefs) {
                                            divScope.columnDefs = response.columnDefs;
                                        }
                                    }
                                    layer.closeAll('loading');

                                    divScope.generatePagination(1);

                                    divScope.showRef(event);
                                }).error(function (error) {
                                layer.closeAll('loading');
                                divScope.showRef(event);
                            });
                        }
                    }
                    else {
                        showRef(event);
                    }
                }
            });


        }
    }
});


pub.directive("uiPopupRefInsurance", function ($compile, $filter, $http) {
    return {
        scope: {
            uiPopupRef: '=',//配置 里面必须带parentScope 哪个controller调用就传哪个
            popupModel: '=',//文本框存放的上层对象
            popupModelField: '=',//model对象的属性名称 文本框本身的.namecolumnDefs
            url: '=',
            popupModelValue: '=',//联动
            isSearch: '=',                  //是否需要查询
            isMultiple: '=',        //是否多选
            popupInit: '=',        //是否多选
            ngModel: '='


        },
        controller: function ($scope,ngDialog) {
            if ($scope.popupInit) $scope.popupModel[$scope.popupModelField] = angular.copy($scope.popupInit);
            //根据scopeId获取scope
            var config = $scope.uiPopupRef;
            var parentScope = $scope;
            var divScope = parentScope.$new(true);
            divScope.maxPageSize = 5;
            $scope.divScope = divScope;
            // 定义多选数组
            divScope.arr = [];
            // divScope.popupRefData = config.data;
            $scope.columnDefs = [
                {
                    field: 'code',
                    displayName: '编号'
                },
                {
                    field: 'name',
                    displayName: '名称'

                }
            ];
            if (config) {
                $scope.columnDefs = config.columnDefs;
            }

            divScope.pagination = {
                total: 0,
                current: 1
            }

            divScope.url = $scope.url;
            divScope.popupModelValue = $scope.popupModelValue;
            divScope.mousein = false;

            divScope.selectRow = function (row, num) {
                if (divScope.isMultiple) {
                    if ($("#" + num).prop('checked')) {
                        $("#" + num).prop('checked', false);
                    } else {
                        $("#" + num).prop('checked', true);
                    }
                } else {
                    if (row && row.$$hashKey) {
                        // divScope.hashKey = angular.copy(row.$$hashKey);
                        delete row.$$hashKey
                    }

                    $scope.popupModel[$scope.popupModelField] = row;
                    // $scope.$apply();//需要手动刷新
                    $scope.ngModel;
                    divScope.value = angular.copy(row);
                    divScope.popupRefShow = false;
                    $("#" + divScope.popupRefId).hide();
                }

            };

            divScope.hidepopup = function (event) {
                divScope.popupRefShow = false;
            }
            divScope.searchDataFocus = function () {
                this.searchData = null;
            };
            divScope.filterData = function () {
                var newVal = this.searchData;
                var data = [];
                angular.copy(divScope.popupRefData, data);
                if (!newVal || newVal == null || newVal == "") {
                    //$scope.popupModel[$scope.popupModelField]={};
                    divScope.popupRefData_show = data;
                } else {
                    var newData = [];
                    for (var i = 0; i < data.length; i++) {
                        var isAdd = false;
                        if (data[i] != null && data[i] != undefined) {
                            for (var col in data[i]) {
                                if (col == '_id' || col == 'pk') continue;
                                var value = data[i][col] == null || angular.isUndefined(data[i][col]) ? '' : data[i][col].toString();
                                if (value.indexOf(newVal) != -1) {
                                    isAdd = true;
                                    break;
                                }
                            }
                        }

                        if (isAdd) {
                            newData.push(data[i]);
                        }
                    }
                    divScope.popupRefData_show = newData;
                    // divScope.popupRefShow=false;
                }
            };

            function makePage(number, isActive) {
                return {
                    number: number,
                    isActive: isActive
                }
            }


            divScope.generatePagination = function (current) {
                var _total = divScope.pagination.total;

                var _totalPage = Math.ceil(_total / 5);

                var _startPage = (current - 2) <= 0 ? 1 : (current - 2);
                var _endPage = _startPage + 4 > _totalPage ? _totalPage : _startPage + 4;
                if (_endPage == _totalPage) {
                    _startPage = _endPage - 4 <= 0 ? 1 : _endPage - 4;
                }

                divScope.pages = [];

                for (var number = _startPage; number <= _endPage; number++) {
                    var page = makePage(number, number === current);

                    divScope.pages.push(page);
                }

            }

            divScope.close = function (num) {
                if (num == 1) {
                    $scope.popupModel[$scope.popupModelField] = "";
                }

                $("#" + divScope.popupRefId).hide();
            }
            divScope.popupClickAll = function () {
                if ($("#popuptable input:eq(0)").prop('checked')) {
                    $("#popuptable input").prop('checked', true);
                } else {
                    $("#popuptable input").prop('checked', false);
                }
            }
            divScope.multiple = function () {
                divScope.arr = [];
                var obj = $("#popuptbody :checked");
                for (var i = 0; i < obj.length; i++) {
                    divScope.arr.push(obj[i].value);
                    alert(obj[i].value);
                }
            }
            if ($scope.isSearch == undefined) {
                divScope.isSearch = true;
            } else {
                divScope.isSearch = $scope.isSearch;
            }
            if (divScope.isMultiple) {
                divScope.isMultiple = $scope.isMultiple;
            } else {
                divScope.isMultiple = false;
            }
            divScope.requestGridData = function (page, num) {
                if (divScope.countNum < page && num == 0) {
                    return;
                }
                if (page < 1) {
                    return;
                }
                divScope.pageNow = page;
                if (divScope.url) {
                    var url = divScope.$parent.url;
                    if (typeof url == 'function') {
                        url = url();
                    }
                    var ifHttp=url.indexOf("http");
                    if (divScope.$root.basePath&&ifHttp==-1) {
                        url = divScope.$root.basePath + url;
                    }
                    var data = {page: page, pageSize: !divScope.maxPageSize ? 5 : divScope.maxPageSize};
                    if (!divScope.$parent.popupModelValue) divScope.$parent.popupModelValue = {};
                    divScope.$parent.popupModelValue['name'] = divScope.popupSearch;
                    data['data'] = angular.toJson(divScope.$parent.popupModelValue);
                    // layer.load(2)
                    $http.post(url, data)
                        .success(function (response) {
                            if (response.code == 200) {
                                //@zhangwj 新增支持mybatis plus 原生分页查询结果
                                if(response.result){
                                    divScope.popupRefData = response.result;
                                    divScope.popupRefData_show = response.result.Rows;
                                    divScope.countNum = Math.ceil(response.result.Total / 5);
                                    divScope.pagination.total = response.result.Total;
                                }
                                if(response.data){
                                    divScope.popupRefData = response.data;
                                    divScope.popupRefData_show = response.data.records;
                                    divScope.countNum = Math.ceil(response.data.total / 5);
                                    divScope.pagination.total = response.data.total;
                                }
                                if (response.columnDefs) {
                                    divScope.columnDefs = response.columnDefs;
                                }
                                if (page >= divScope.countNum) {
                                    divScope.pageNow = divScope.countNum;
                                    divScope.generatePagination(divScope.countNum);
                                } else {
                                    divScope.generatePagination(page);
                                }
                            }
                            layer.closeAll('loading');


                            divScope.showRef(event);
                        }).error(function (error) {
                        layer.closeAll('loading');
                        divScope.showRef(event);
                    });
                }
            },
                divScope.addCustomer = function () {
                    ngDialog.openConfirm({
                        showClose: true,
                        closeByDocument: true,
                        template: 'base/customer/stateGridCustomer/addCustomerForm.html',
                        className: 'ngdialog-theme-formInfo',
                        scope: $scope,
                        preCloseCallback: function (value) {
                            return true;
                        }
                    }).then(function (value) {
                        if (value != null) {
                            $scope.selectRow(value,null)
                        }
                    }, function (reason) {

                    });
                }
        },
        link: function (scope, element, attrs, ngModelCtrl) {
            var config = scope.uiPopupRef;
            if (!config) {
                config = {};
            }
            var columnDefs = scope.columnDefs;
            if (!columnDefs) return;
            var parentDom = getScopeDomById(scope.$parent.$id);
            var divScope = scope.divScope;
            divScope.maxPageSize = 5;
            //获取滚动条DOM的主键
            //var parent=attrs.$$element.context.parentElement;
            //if(parent.style !=null &&　angular.isDefined(parent.style)){
            //    while(parent.style.overflowY!='auto'){
            //        parent=parent.parentElement;
            //    }
            //}
            var uiPopupRefId;
            if (scope.popupIsNgGrid) {
                var dom = document.getElementById('uiPopupRefId');
                if (angular.isDefined(dom) && dom != null && dom != '') {
                    dom.parentNode.removeChild(dom);
                }
                uiPopupRefId = ' id="uiPopupRefId" ';
            } else {
                var id = new Date().getTime() + Math.floor(Math.random())
                uiPopupRefId = ' id="' + id + '"';

                divScope.popupRefId = id;
            }

            divScope.popupRefShow = false;

            var divClass = angular.isDefined(config.divClass) ? config.divClass : '';
            var tableClass = angular.isDefined(config.tableClass) ? config.tableClass : 'table table-striped';
            var tableStyle = config.tableStyle ? config.tableStyle : ('width:' + columnDefs.length * 190 + 'px');//'height:280px;width:600px';
            var divStyle = angular.isDefined(config.divStyle) ? config.divStyle : 'min-width:550px;background-color:#fff;position: absolute;z-index:1000';

            //var html = '<div ng-mouseleave="" '+ uiPopupRefId +' ng-show="popupRefShow" style="'+divStyle+'" class="'+divClass+'" >' +
            //    '<table class="'+tableClass+'" ng-grid="pubRefSelect"  style="'+tableStyle+'" > </table>' +
            //    '</div>';
            /*var html = '<div   ng-mouseenter="mousein=true"  ng-mouseleave="mousein=false" ' + uiPopupRefId + ' ng-show="popupRefShow" style="' + divStyle + '" class="' + divClass + '" >' +
             '<input id="searchData" placeholder="请输入过滤条件" ng-blur="hidepopup()" type="text" ng-model="searchData" size="25" style="width:{{input_width}}px;height:{{input_height}}px;float:{{float}}"/>' +
             '<div style="width:400px; height:300px; overflow:auto; border:1px solid #eaeff0;">' +
             '<table  st-table="popupRefData" class="' + tableClass + '" style="' + tableStyle + '">' +
             '<thead>' +
             '<tr>';*/


            var html = '<div ng-mouseenter="mousein=true"  ng-mouseleave="mousein=false"  class="lr-ref" ' + uiPopupRefId + ' style="' + divStyle + '">' +
                '<div class="panel-heading" style="border-bottom: solid 1px #DDDDDD;"><span style="float: left">请选择{{titlename}}</span> <span style="float: right;"><button class="btn w-xs fa fa-times" type="button" style="background: #fff" ng-click="close(0)"></button></span>' +
                '</div>' +
                '<div>' +
                '<div ng-show="isSearch" style="padding: 5px 0px 0px 5px;"><input class="form-control" ng-model="popupSearch" placeholder="请输入关键字查询" style="width: 70%;display: inline-block;border-radius:0px;"><span style="vertical-align: text-bottom;"><button class="btn w-xs fa fa-search" style="padding: 9px 13px 9px 13px;border-bottom: solid 1px #ccc;border-top: solid 1px #ccc;border-right: solid 1px #ccc;" ng-click="requestGridData(pageNow,1)"></button></span></div>' +
                '<div class="lr-ref-body-table"     style="padding: 5px 5px 0px 5px;">' +
                '<table class="table table-hover table-bordered" id="popuptable"><thead><tr>';
            var radioth = "";
            var radiotd = "";
            if (divScope.isMultiple) {
                radioth = '<th style="width:20px"><div class="checkbox clip-check check-info checkbox-inline"> <input type="checkbox" id="checkboxPopup" ng-click="popupClickAll()"> <label for="checkboxPopup"> </label> </div></th>';
                radiotd = '<td><div class="checkbox clip-check check-info checkbox-inline"> <input type="checkbox" id="{{$index}}" value="{{row}}"> <label for="{{$index}}"> </label> </div></td>';
            }
            var td = '<tr ng-repeat="row in popupRefData_show" ng-click="selectRow(row,$index)">';
            for (var i = 0; i < columnDefs.length; i++) {
                var columnDef = columnDefs[i];
                var th = '<th><span>' + columnDef.displayName + '</span></th>';
                if (i == columnDefs.length - 1) {
                    html = html + th + radioth + '</tr></thead><tbody id="popuptbody">';
                    td = td + '<td style="min-width: 100px;">{{row.' + columnDef.field + '}}</td>' + radiotd + '</tr></tbody></table></div>' +
                        '<div ng-show=" popupRefData_show == null " class="center" style="padding: 10px 10px 20px"><span style="font-size: 12px; color: #8e8e93"><i class="fa fa-smile-o"></i>暂无数据</span></div>' +
                        ' <div class="panel-footer" ng-show=" popupRefData_show != null ">' +
                        '<div class="row">' +
                        '<div class="col-sm-9 pad">' +
                        '<ul class="pagination pagination-sm m-t-none m-b-none">' +
                        '<li><a ng-click="requestGridData(pageNow-1,0)"><i class="fa fa-chevron-left"></i></a></li>' +
                        '<li><a href id="pageNumNow" ng-bind-html="pageNow"></a></li>' +
                        '<li><a ng-click="requestGridData(1,0)" >首页</a></li>' +
                        ' <li ng-repeat="page in pages"><a ng-click="requestGridData(page.number,0)"> {{page.number}} </a></li>' +
                        '<li><a ng-click="requestGridData(countNum,0)" >尾页</a></li>' +
                        '<li><a ng-click="requestGridData(pageNow+1,0)"><i class="fa fa-chevron-right"></i></a></li>' +
                        '</ul>' +
                        '</div>' +
                        '<div class="approvalbut col-sm-3">' +
                        '<button ng-show="divScope.isMultiple" type="button" class="btn w-xs" ng-click="multiple()"> 确认</button>' +
                        '<select style="width: 50px;height: 30px;" ng-model="maxPageSize" ng-change="requestGridData(pageNow,0)"> ' +
                        '<option value="5">5</option> ' +
                        '<option value="10">10</option> ' +
                        '<option value="15">15</option> ' +
                        '</select> ' +
                        '<button type="button" class="btn w-xs" ng-click="close(1)"> 清空</button>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div></div>';
                } else {
                    html = html + th;
                    if (columnDef.cellFilter) {
                        td = td + '<td  style="min-width: {{row.' + columnDef.field + '.length > 4 ? (row.' + columnDef.field + '.length * 20) : 100}}px"><div>{{row.' + columnDef.field + ' | ' + columnDef.cellFilter + '}}</div></td>';
                    } else {
                        td = td + '<td  style="min-width: {{row.' + columnDef.field + '.length > 4 ? (row.' + columnDef.field + '.length * 20) : 100}}px"><div>{{row.' + columnDef.field + '}}</div></td>';
                    }
                }
                //生成表体html
            }
            html = html + td;
            var newElm = $compile(html)(divScope);

            parentDom.append(newElm);

            $("#" + divScope.popupRefId).hide().mouseleave(function () {
                // $(this).hide();
                divScope.mousein = false;
            });

            divScope.showRef = function (event) {
                //scope.filterDate('');
                // var offset=$("#content").scrollTop();
                var e = event.currentTarget;
                var x = e.offsetLeft;
                var y = e.offsetTop;
                var offsetheight = e.offsetHeight;
                var offsetWidth = e.offsetWidth;
                while (e = e.offsetParent) {
                    x += e.offsetLeft;
                    y += e.offsetTop;
                }

                e = parentDom[0];
                var x2 = 0;
                var y2 = 0;

                while (e = e.offsetParent) {
                    x2 += e.offsetLeft;
                    y2 += e.offsetTop;
                    offsetheight++;
                }

                if (x > window.screen.width * 0.6) {
                    divScope.float = "right";
                    newElm.css("top", y - y2 + offsetheight + "px");
                    newElm.css("left", x - x2 - 550 + offsetWidth + "px");
                }
                else {
                    divScope.float = "left";
                    newElm.css("top", y - y2 + offsetheight + "px");
                    newElm.css("left", x - x2 + "px");
                }


                /* if(divScope.popupRefShow==null||divScope.popupRefShow==false){
                 divScope.popupRefShow=true;
                 }else{
                 divScope.popupRefShow=false;
                 }*/

                // divScope.popupRefShow = !divScope.popupRefShow;

                divScope.input_width = event.currentTarget.offsetWidth;
                divScope.input_height = event.currentTarget.offsetHeight;

                var queryID = "#" + divScope.popupRefId;
                $(queryID).show();


                //angular.element("#searchData").focus();

            };
            // if(scope.ngChange) element.bind("change",scope.ngChange);
            element.bind("blur", function (event) {
                // divScope.hidepopup(event);
                if (!divScope.mousein) {
                    $("#" + divScope.popupRefId).hide();
                }
            });
            // document.body.addEventListener('click',function (event) {
            //     if(event.target.parentElement.id != divScope.popupRefId){
            //         $("#" + divScope.popupRefId).hide();
            //     }
            // })

            element.bind("focus", function (event) {
                if (divScope.$parent.popupModelValue) {
                    divScope.$parent.popupModel[divScope.$parent.popupModelField] = "";
                }

                divScope.pageNow = 1;
                divScope.popupSearch = "";
                if (divScope.url) {
                    var url = divScope.$parent.url;
                    if (typeof url == 'function') {
                        url = url();
                    }
                    if (divScope.$root.basePath) {
                        url = divScope.$root.basePath + url;
                    }
                    var data = {page: divScope.pageNow, pageSize: !divScope.maxPageSize ? 5 : divScope.maxPageSize};
                    if (divScope.$parent.popupModelValue) data['data'] = angular.toJson(divScope.$parent.popupModelValue);
                    divScope.titlename = event.target.parentNode.parentElement.firstChild.innerText;
                    layer.load(2);
                    $http.post(url, data)
                        .success(function (response) {
                            if (response.code == 200) {

                                //@zhangwj 新增支持mybatis plus 原生分页查询结果
                                if(response.result){
                                    divScope.popupRefData = response.result;
                                    divScope.popupRefData_show = response.result.Rows;
                                    divScope.countNum = Math.ceil(response.result.Total / 5);
                                    divScope.pagination.total = response.result.Total;
                                }
                                if(response.data){
                                    divScope.popupRefData = response.data;
                                    divScope.popupRefData_show = response.data.records;
                                    divScope.countNum = Math.ceil(response.data.total / 5);
                                    divScope.pagination.total = response.data.total;
                                }
                                if (divScope.$parent.isMultiple) {
                                    divScope.isMultiple = divScope.$parent.isMultiple;
                                }
                                if (response.columnDefs) {
                                    divScope.columnDefs = response.columnDefs;
                                }
                            }
                            layer.closeAll('loading');

                            divScope.generatePagination(1);

                            divScope.showRef(event);
                        }).error(function (error) {
                        layer.closeAll('loading');
                        divScope.showRef(event);
                    });
                }
                else {
                    showRef(event);
                }

            });
        }
    }
});
pub.directive("uiPopupRefMultiple", function ($compile, $filter, $http) {
    return {
        scope: {
            uiPopupRef: '=',//配置 里面必须带parentScope 哪个controller调用就传哪个
            popupModel: '=',//文本框存放的上层对象
            popupModelField: '=',//model对象的属性名称 文本框本身的.namecolumnDefs
            url: '=',
            popupModelValue: '=',//联动
            isSearch: '=',                  //是否需要查询

        },
        controller: function ($scope,ngDialog) {
            //根据scopeId获取scope
            var config = $scope.uiPopupRefMultiple;
            var parentScope = $scope;
            var divScope = parentScope.$new(true);
            $scope.divScope = divScope;
            // 定义多选数组
            divScope.arr = [];
            // divScope.popupRefData = config.data;
            $scope.columnDefs = [
                {
                    field: 'code',
                    displayName: '编号'
                },
                {
                    field: 'name',
                    displayName: '名称'

                }
            ];
            if (config) {
                $scope.columnDefs = config.columnDefs;
            }

            divScope.pagination = {
                total: 0,
                current: 1
            }

            divScope.url = $scope.url;

            divScope.mousein = true;

            divScope.selectRow = function (row, num) {
                if (true) {
                    if ($("#" + num).prop('checked')) {
                        $("#" + num).prop('checked', false);
                    } else {
                        $("#" + num).prop('checked', true);
                    }
                } else {
                    if (row.$$hashKey) {
                        delete row.$$hashKey
                    }
                    $scope.popupModel[$scope.popupModelField] = row;
                    divScope.popupRefShow = false;
                    $("#" + divScope.popupRefId).hide();
                }

            };

            divScope.hidepopup = function (event) {
                divScope.popupRefShow = false;
            }
            divScope.searchDataFocus = function () {
                this.searchData = null;
            };
            divScope.filterData = function () {
                var newVal = this.searchData;
                var data = [];
                angular.copy(divScope.popupRefData, data);
                if (!newVal || newVal == null || newVal == "") {
                    //$scope.popupModel[$scope.popupModelField]={};
                    divScope.popupRefData_show = data;
                } else {
                    var newData = [];
                    for (var i = 0; i < data.length; i++) {
                        var isAdd = false;
                        if (data[i] != null && data[i] != undefined) {
                            for (var col in data[i]) {
                                if (col == '_id' || col == 'pk') continue;
                                var value = data[i][col] == null || angular.isUndefined(data[i][col]) ? '' : data[i][col].toString();
                                if (value.indexOf(newVal) != -1) {
                                    isAdd = true;
                                    break;
                                }
                            }
                        }

                        if (isAdd) {
                            newData.push(data[i]);
                        }
                    }
                    divScope.popupRefData_show = newData;
                    // divScope.popupRefShow=false;
                }
            };

            function makePage(number, isActive) {
                return {
                    number: number,
                    isActive: isActive
                }
            }


            divScope.generatePagination = function (current) {
                var _total = divScope.pagination.total;

                var _totalPage = Math.ceil(_total / 5);

                var _startPage = (current - 2) <= 0 ? 1 : (current - 2);
                var _endPage = _startPage + 4 > _totalPage ? _totalPage : _startPage + 4;
                if (_endPage == _totalPage) {
                    _startPage = _endPage - 4 <= 0 ? 1 : _endPage - 4;
                }

                divScope.pages = [];

                for (var number = _startPage; number <= _endPage; number++) {
                    var page = makePage(number, number === current);

                    divScope.pages.push(page);
                }

            }

            divScope.close = function (num) {
                if (num == 1) {
                    $scope.popupModel[$scope.popupModelField] = "";
                }
                $("#" + divScope.popupRefId).hide();
            }
            divScope.popupClickAll = function () {
                if ($("#popupTable input:eq(0)").prop('checked')) {
                    $("#popupTable input").prop('checked', true);
                } else {
                    $("#popupTable input").prop('checked', false);
                }
            }
            divScope.multiple = function () {
                divScope.arr = [];
                var obj = $("#popuptbody :checked");
                for (var i = 0; i < obj.length; i++) {
                    divScope.arr.push(obj[i].value);
                }
                var temp = angular.fromJson(divScope.arr[0]);
                var kiVO = null;
                for (var c = 1; c < divScope.arr.length; c++) {
                    kiVO = angular.fromJson(divScope.arr[c])
                    temp.pk = kiVO.pk + ";" + temp.pk;
                    temp.name = kiVO.name + ";" + temp.name;
                    temp.code = kiVO.code + ";" + temp.code;
                }
                $scope.popupModel[$scope.popupModelField] = temp;
                divScope.popupRefShow = false;
                $("#" + divScope.popupRefId).hide();
            }
            if ($scope.isSearch == undefined) {
                divScope.isSearch = true;
            } else {
                divScope.isSearch = $scope.isSearch;
            }
            divScope.requestGridData = function (page, num) {
                if (divScope.countNum < page && num == 0) {
                    return;
                }
                if (page < 1) {
                    return;
                }
                divScope.pageNow = page;
                if (divScope.url) {
                    var url = divScope.$parent.url;
                    if (typeof url == 'function') {
                        url = url();
                    }
                    var ifHttp=url.indexOf("http");
                    if (divScope.$root.basePath&&ifHttp==-1) {
                        url = divScope.$root.basePath + url;
                    }
                    var data = {page: page, pageSize: 5};
                    if (!divScope.$parent.popupModelValue) divScope.$parent.popupModelValue = {};
                    divScope.$parent.popupModelValue['name'] = divScope.popupSearch;
                    data['data'] = angular.toJson(divScope.$parent.popupModelValue);
                    // layer.load(2)
                    $http.post(url, data)
                        .success(function (response) {
                            if (response.code == 200) {

                                //@zhangwj 新增支持mybatis plus 原生分页查询结果
                                if(response.result){
                                    divScope.popupRefData = response.result;
                                    divScope.popupRefData_show = response.result.Rows;
                                    divScope.countNum = Math.ceil(response.result.Total / 5);
                                    divScope.pagination.total = response.result.Total;
                                }
                                if(response.data){
                                    divScope.popupRefData = response.data;
                                    divScope.popupRefData_show = response.data.records;
                                    divScope.countNum = Math.ceil(response.data.total / 5);
                                    divScope.pagination.total = response.data.total;
                                }
                                if (response.columnDefs) {
                                    divScope.columnDefs = response.columnDefs;
                                }
                                if (page >= divScope.countNum) {
                                    divScope.pageNow = divScope.countNum;
                                    divScope.generatePagination(divScope.countNum);
                                } else {
                                    divScope.generatePagination(page);
                                }
                            }
                            layer.closeAll('loading');


                            divScope.showRef(event);
                        }).error(function (error) {
                        layer.closeAll('loading');
                        divScope.showRef(event);
                    });
                }
            }
            divScope.addCustomer = function () {
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: 'base/customer/stateGridCustomer/addCustomerForm.html',
                    className: 'ngdialog-theme-formInfo',
                    scope: $scope,
                    preCloseCallback: function (value) {
                        return true;
                    }
                }).then(function (value) {
                    if (value != null) {
                        $scope.selectRow(value,null)
                    }
                }, function (reason) {

                });
            }
        },
        link: function (scope, element, attrs, ngModelCtrl) {
            var config = scope.uiPopupRef;
            if (!config) {
                config = {};
            }
            var columnDefs = scope.columnDefs;
            if (!columnDefs) return;
            var parentDom = getScopeDomById(scope.$parent.$id);
            var divScope = scope.divScope;
            //获取滚动条DOM的主键
            //var parent=attrs.$$element.context.parentElement;
            //if(parent.style !=null &&　angular.isDefined(parent.style)){
            //    while(parent.style.overflowY!='auto'){
            //        parent=parent.parentElement;
            //    }
            //}
            var uiPopupRefId;
            if (scope.popupIsNgGrid) {
                var dom = document.getElementById('uiPopupRefId');
                if (angular.isDefined(dom) && dom != null && dom != '') {
                    dom.parentNode.removeChild(dom);
                }
                uiPopupRefId = ' id="uiPopupRefId" ';
            } else {
                var id = new Date().getTime() + Math.floor(Math.random())
                uiPopupRefId = ' id="' + id + '"';

                divScope.popupRefId = id;
            }

            divScope.popupRefShow = false;

            var divClass = angular.isDefined(config.divClass) ? config.divClass : '';
            var tableClass = angular.isDefined(config.tableClass) ? config.tableClass : 'table table-striped';
            var tableStyle = config.tableStyle ? config.tableStyle : ('width:' + columnDefs.length * 190 + 'px');//'height:280px;width:600px';
            var divStyle = angular.isDefined(config.divStyle) ? config.divStyle : 'min-width:550px;background-color:#fff;position: absolute;z-index:1000';

            //var html = '<div ng-mouseleave="" '+ uiPopupRefId +' ng-show="popupRefShow" style="'+divStyle+'" class="'+divClass+'" >' +
            //    '<table class="'+tableClass+'" ng-grid="pubRefSelect"  style="'+tableStyle+'" > </table>' +
            //    '</div>';
            /*var html = '<div   ng-mouseenter="mousein=true"  ng-mouseleave="mousein=false" ' + uiPopupRefId + ' ng-show="popupRefShow" style="' + divStyle + '" class="' + divClass + '" >' +
             '<input id="searchData" placeholder="请输入过滤条件" ng-blur="hidepopup()" type="text" ng-model="searchData" size="25" style="width:{{input_width}}px;height:{{input_height}}px;float:{{float}}"/>' +
             '<div style="width:400px; height:300px; overflow:auto; border:1px solid #eaeff0;">' +
             '<table  st-table="popupRefData" class="' + tableClass + '" style="' + tableStyle + '">' +
             '<thead>' +
             '<tr>';*/


            var html = '<div ng-mouseenter="mousein=true"  ng-mouseleave="mousein=false"  class="lr-ref" ' + uiPopupRefId + ' style="' + divStyle + '">' +
                '<div class="panel-heading" style="border-bottom: solid 1px #DDDDDD;"><span style="float: left">请选择{{titlename}}</span> <span style="float: right;"><button class="btn w-xs fa fa-times" type="button" style="background: #fff" ng-click="close(0)"></button></span>' +
                '</div>' +
                '<div>' +
                '<div ng-show="isSearch" style="padding: 5px 0px 0px 5px;"><input class="form-control" ng-model="popupSearch" placeholder="请输入关键字查询" style="width: 70%;display: inline-block;border-radius:0px;"><span style="vertical-align: text-bottom;"><button class="btn w-xs fa fa-search" style="padding: 9px 13px 9px 13px;border-bottom: solid 1px #ccc;border-top: solid 1px #ccc;border-right: solid 1px #ccc;" ng-click="requestGridData(pageNow,1)"></button></span></div>' +
                '<div class="lr-ref-body-table"     style="padding: 5px 5px 0px 5px;">' +
                '<table class="table table-hover table-bordered" id="popupTable"><thead><tr>';
            var radioth = '<th style="width:20px"><div class="checkbox clip-check check-info checkbox-inline"> <input type="checkbox" id="checkboxPopup" ng-click="popupClickAll()"> <label for="checkboxPopup"> </label> </div></th>';
            var radiotd = '<td><div class="checkbox clip-check check-info checkbox-inline"> <input type="checkbox" id="{{$index}}" value="{{row}}"> <label for="{{$index}}"> </label> </div></td>';
            var td = '<tr ng-repeat="row in popupRefData_show" >';
            for (var i = 0; i < columnDefs.length; i++) {
                var columnDef = columnDefs[i];
                var th = '<th><span>' + columnDef.displayName + '</span></th>';
                if (i == columnDefs.length - 1) {
                    html = html + th + '</tr></thead><tbody id="popuptbody">';
                    td = td + '<td style="min-width: 100px;">{{row.' + columnDef.field + '}}</td></tr></tbody></table></div>' +
                        '<div ng-show=" popupRefData_show == null " class="center" style="padding: 10px 10px 20px"><span style="font-size: 12px; color: #8e8e93"><i class="fa fa-smile-o"></i> 暂无数据</span></div>' +
                        ' <div class="panel-footer" ng-show=" popupRefData_show != null ">' +
                        '<div class="row">' +
                        '<div class="col-sm-9 pad">' +
                        '<ul class="pagination pagination-sm m-t-none m-b-none">' +
                        '<li><a ng-click="requestGridData(pageNow-1,0)"><i class="fa fa-chevron-left"></i></a></li>' +
                        '<li><a href id="pageNumNow" ng-bind-html="pageNow"></a></li>' +
                        '<li><a ng-click="requestGridData(1,0)" >首页</a></li>' +
                        ' <li ng-repeat="page in pages"><a ng-click="requestGridData(page.number,0)"> {{page.number}} </a></li>' +
                        '<li><a ng-click="requestGridData(countNum,0)" >尾页</a></li>' +
                        '<li><a ng-click="requestGridData(pageNow+1,0)"><i class="fa fa-chevron-right"></i></a></li>' +
                        '</ul>' +
                        '</div>' +
                        '<div class="approvalbut col-sm-3">' +
                        '<button type="button" class="btn w-xs" ng-click="multiple()"> 确认</button>' +
                        '<button type="button" class="btn w-xs" ng-click="close(1)"> 清空</button>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div></div>';
                } else {
                    html = html + radioth + th;
                    if (columnDef.cellFilter) {
                        td = td + '<td  style="min-width: {{row.' + columnDef.field + '.length > 4 ? (row.' + columnDef.field + '.length * 20) : 100}}px"><div>{{row.' + columnDef.field + ' | ' + columnDef.cellFilter + '}}</div></td>';
                    } else {
                        td = td + radiotd + '<td  style="min-width: {{row.' + columnDef.field + '.length > 4 ? (row.' + columnDef.field + '.length * 20) : 100}}px"><div>{{row.' + columnDef.field + '}}</div></td>';
                    }
                }
                //生成表体html
            }
            html = html + td;
            var newElm = $compile(html)(divScope);

            parentDom.append(newElm);

            $("#" + divScope.popupRefId).hide().mouseleave(function () {
                // $(this).hide();
                divScope.mousein = false;
            });

            divScope.showRef = function (event) {
                //scope.filterDate('');
                // var offset=$("#content").scrollTop();
                var e = event.currentTarget;
                var x = e.offsetLeft;
                var y = e.offsetTop;
                var offsetheight = e.offsetHeight;
                var offsetWidth = e.offsetWidth;
                while (e = e.offsetParent) {
                    x += e.offsetLeft;
                    y += e.offsetTop;
                }

                e = parentDom[0];
                var x2 = 0;
                var y2 = 0;

                while (e = e.offsetParent) {
                    x2 += e.offsetLeft;
                    y2 += e.offsetTop;
                    offsetheight++;
                }

                if (x > window.screen.width * 0.6) {
                    divScope.float = "right";
                    newElm.css("top", y - y2 + offsetheight + "px");
                    newElm.css("left", x - x2 - 550 + offsetWidth + "px");
                }
                else {
                    divScope.float = "left";
                    newElm.css("top", y - y2 + offsetheight + "px");
                    newElm.css("left", x - x2 + "px");
                }


                /* if(divScope.popupRefShow==null||divScope.popupRefShow==false){
                 divScope.popupRefShow=true;
                 }else{
                 divScope.popupRefShow=false;
                 }*/

                // divScope.popupRefShow = !divScope.popupRefShow;

                divScope.input_width = event.currentTarget.offsetWidth;
                divScope.input_height = event.currentTarget.offsetHeight;

                var queryID = "#" + divScope.popupRefId;
                $(queryID).show();


                //angular.element("#searchData").focus();

            };
            // if(scope.ngChange) element.bind("change",scope.ngChange);
            element.bind("blur", function (event) {
                // divScope.hidepopup(event);
                if (!divScope.mousein) {
                    $("#" + divScope.popupRefId).hide();
                }
            });
            // document.body.addEventListener('click',function (event) {
            //     if(event.target.parentElement.id != divScope.popupRefId){
            //         $("#" + divScope.popupRefId).hide();
            //     }
            // })

            element.bind("focus", function (event) {
                if (divScope.$parent.popupModelValue) {
                    divScope.$parent.popupModel[divScope.$parent.popupModelField] = "";
                }

                divScope.pageNow = 1;
                divScope.popupSearch = "";
                if (divScope.url) {
                    var url = divScope.$parent.url;
                    if (typeof url == 'function') {
                        url = url();
                    }
                    var ifHttp=url.indexOf("http");
                    if (divScope.$root.basePath&&ifHttp==-1) {
                        url = divScope.$root.basePath + url;
                    }
                    var data = {page: divScope.pageNow, pageSize: 5};
                    if (divScope.$parent.popupModelValue) data['data'] = angular.toJson(divScope.$parent.popupModelValue);
                    divScope.titlename = event.target.parentNode.parentElement.firstChild.innerText;
                    layer.load(2);
                    $http.post(url, data)
                        .success(function (response) {
                            if (response.code == 200) {

                                //@zhangwj 新增支持mybatis plus 原生分页查询结果
                                if(response.result){
                                    divScope.popupRefData = response.result;
                                    divScope.popupRefData_show = response.result.Rows;
                                    divScope.countNum = Math.ceil(response.result.Total / 5);
                                    divScope.pagination.total = response.result.Total;
                                }
                                if(response.data){
                                    divScope.popupRefData = response.data;
                                    divScope.popupRefData_show = response.data.records;
                                    divScope.countNum = Math.ceil(response.data.total / 5);
                                    divScope.pagination.total = response.data.total;
                                }
                                if (response.columnDefs) {
                                    divScope.columnDefs = response.columnDefs;
                                }
                            }
                            layer.closeAll('loading');

                            divScope.generatePagination(1);

                            divScope.showRef(event);
                        }).error(function (error) {
                        layer.closeAll('loading');
                        divScope.showRef(event);
                    });
                }
                else {
                    showRef(event);
                }

            });
        }
    }
});
pub.directive("uiPopupGridRef", function ($compile, $filter, $http, $timeout) {
    return {
        scope: true,
        controller: function ($scope,ngDialog) {
            //if($scope.uiPopupRef) return;
            //根据scopeId获取scope
            var config = $scope.grid.appScope[$scope.col.colDef.uiPopupRef];
            if (!config) {
                var col = $scope.col;
                $scope.popupModelField = col.colDef.popupModelField;
                $scope.popupModel = $scope.row.entity;
                $scope.modelData = col.colDef.modelData;
                $scope.uiPopupRef = $scope.grid.appScope[$scope.col.colDef.uiPopupRef];
                config = col.colDef.uiPopupRef;
                if (config) {
                    $scope.url = config.url;
                }
                if (col.colDef.url) {
                    $scope.url = col.colDef.url;
                }
                $scope.uiPopupRef = config;
            } else {
                var col = $scope.col;
                $scope.popupModelField = col.colDef.popupModelField;
                $scope.popupModel = $scope.row.entity;
                $scope.modelData = col.colDef.modelData;
                $scope.uiPopupRef = $scope.grid.appScope[$scope.col.colDef.uiPopupRef];
                $scope.url = col.colDef.url;
            }
            var parentScope = $scope.grid.appScope;
            var divScope = parentScope.$new(true);
            $scope.divScope = divScope;
            divScope.url = $scope.url;
            if (col.colDef.isTree) {
                divScope.isTree = true;
            } else {
                divScope.isTree = false;
            }
            if (col.colDef.openCustomerMore) {
                divScope.openCustomerMore = true;
            } else {
                divScope.openCustomerMore = false;
            }
            if ($scope.isSearch == undefined) {
                divScope.isSearch = true;
            } else {
                divScope.isSearch = $scope.isSearch;
            }
            var params = $scope.col.colDef.params || {};

            var v;
            var findValue = function (keys, obj) {
                if (keys.length > 1) {
                    v = findValue(keys.slice(1), obj[keys[0]])
                } else {
                    v = obj[keys[0]];
                }

                return v;
            }

            for (var fieldName in params) {
                var value = '';
                if (params.hasOwnProperty(fieldName)) {
                    if (params[fieldName].startsWith("$")) {
                        var row = $scope.row.entity;

                        var tmps = params[fieldName].split(".");

                        value = findValue(tmps.slice(1), row);

                    } else {
                        value = params[fieldName];
                    }
                }

                var url = divScope.url;
                if (url.indexOf("?") != -1) {
                    url = url + "&" + fieldName + "=" + value;
                } else {
                    url = url + "?" + fieldName + "=" + value;
                }

                divScope.url = url;

                $scope.newUrl = url;

                console.log(url)
            }

            divScope.pagination = {
                total: 0,
                current: 1
            }


            $scope.columnDefs = [
                {
                    field: 'code',
                    displayName: '编号'
                },
                {
                    field: 'name',
                    displayName: '名称'

                }
            ];
            if (config) {
                $scope.columnDefs = config.columnDefs;
            }

            if (!!$scope.col.colDef.columnDefs) {
                $scope.columnDefs = $scope.col.colDef.columnDefs;
            }


            divScope.mousein = true;

            divScope.selectRow = function (row, num) {
                if (false) {
                    if ($("#" + num).prop('checked')) {
                        $("#" + num).prop('checked', false);
                    } else {
                        $("#" + num).prop('checked', true);
                    }
                } else {
                    if (row.$$hashKey) {
                        delete row.$$hashKey
                    }
                    $scope.popupModel[$scope.popupModelField] = row;
                    divScope.popupRefShow = false;

                    $("#" + divScope.popupRefId).hide();
                }
            };
            var isWatch = false;
            var isClick = false;
            divScope.my_tree_click = function () {
                if (isClick) {
                    isClick = false;
                    $("#" + divScope.popupRefId).hide();
                }
            }
            divScope.my_tree_handler = function (row) {
                if (row.children && row.children.length != 0) {
                    return;
                }
                divScope.popupRefShow = false;
                var object = row;
                $scope.popupModel[$scope.popupModelField] = object;
                if ($scope.popupModel[$scope.popupModelField]) {
                    $scope.popupModel[$scope.popupModelField].parentName = divScope.getParentName($scope.popupModel[$scope.popupModelField], $scope.popupModel[$scope.popupModelField].name);
                }
                if (isWatch) {
                    isWatch = false;
                    isClick = true;
                    return;

                }
                $("#" + divScope.popupRefId).hide();
            };
            divScope.hidepopup = function (event) {
                divScope.popupRefShow = divScope.mousein | false;
            }

            divScope.filterData = function (newVal) {
                var data = [];
                angular.copy(divScope.popupRefData, data);
                if (!newVal || newVal == null || newVal == "") {
                    //$scope.popupModel[$scope.popupModelField]={};
                    divScope.popupRefData_show = data;
                } else {
                    var newData = [];
                    for (var i = 0; i < data.length; i++) {
                        var isAdd = false;
                        if (data[i] != null && data[i] != undefined) {
                            for (var col in data[i]) {
                                if (col == '_id' || col == 'pk') continue;
                                var value = data[i][col] == null || angular.isUndefined(data[i][col]) ? '' : data[i][col].toString();
                                if (value.indexOf(newVal) != -1) {
                                    isAdd = true;
                                    break;
                                }
                            }
                        }

                        if (isAdd) {
                            newData.push(data[i]);
                        }
                    }
                    divScope.popupRefData_show = newData;
                    // divScope.popupRefShow=false;
                }
            };
            divScope.$watch("popupSearch", function (newVal, oldVal, scope) {
                if (newVal === oldVal || !divScope.isTree) return;
                var branch = divScope.selectBranch(divScope.popupRefData_show[0], newVal);
                if (branch == null || branch == undefined) return;
                var parent = divScope.getParent(branch);
                var first = divScope.popupRefData_show[0];
                divScope.popupRefData_show[divScope.findIndex(parent)] = first;
                divScope.popupRefData_show[0] = parent;
                isWatch = true;
                $timeout(function () {
                    var array = document.getElementsByClassName('lr-ref-body-table');
                    for (var k = 0, length = array.length; k < length; k++) {
                        array[k].scrollTop = 0;
                    }
                    isClick = true;
                    divScope.my_tree.select_branch(branch);
                    $scope.$apply();
                }, 2);
            }, false);
            divScope.findIndex = function (parent) {
                for (var i = 0; i < divScope.popupRefData_show.length; i++) {
                    if (divScope.popupRefData_show[i].name == parent['name']) {
                        return i;
                    }
                }
            }
            divScope.getParentName = function (branch, name) {
                var parent = divScope.my_tree.get_parent_branch(branch);
                if (parent) {
                    name += "," + parent.name;
                    return divScope.getParentName(parent, name);
                } else {
                    return name;
                }
            }
            divScope.getParent = function (branch) {
                var parent = divScope.my_tree.get_parent_branch(branch);
                if (parent) {
                    return divScope.getParent(parent);
                } else {
                    return branch;
                }
            }
            divScope.selectBranch = function (object, newVal) {
                if (object.name.indexOf(newVal) != -1) {
                    return object;
                }
                return divScope.selectBranch(divScope.my_tree.get_next_branch(object), newVal);
            }
            var timer;
            divScope.$watch('searchData', function (newVal) {
                //divScope.filterText = newVal;
                if (timer) {
                    clearTimeout(timer);
                }
                timer = setTimeout(divScope.filterData(newVal), 1000);
            }, true);


            function makePage(number, isActive) {
                return {
                    number: number,
                    isActive: isActive
                }
            }

            divScope.generatePagination = function (current) {
                var _total = divScope.pagination.total;

                var _totalPage = Math.ceil(_total / 5);

                var _startPage = (current - 2) <= 0 ? 1 : (current - 2);
                var _endPage = _startPage + 4 > _totalPage ? _totalPage : _startPage + 4;
                if (_endPage == _totalPage) {
                    _startPage = _endPage - 4 < 0 ? 1 : _endPage - 4;
                }


                divScope.pages = [];

                for (var number = _startPage; number <= _endPage; number++) {
                    var page = makePage(number, number === current);

                    divScope.pages.push(page);
                }

            }

            divScope.close = function (num) {
                if (num == 1) {
                    $scope.popupModel[$scope.popupModelField] = "";
                }
                isWatch = false;
                isClick = false;
                $("#" + divScope.popupRefId).hide();
            }

            divScope.popupClickAll = function () {
                if ($("#popupgrid input:eq(0)").prop('checked')) {
                    $("#popupgrid input").prop('checked', true);
                } else {
                    $("#popupgrid input").prop('checked', false);
                }
            }

            divScope.multiple = function () {
                divScope.arr = [];
                var obj = $("#popuptbody :checked");
                for (var i = 0; i < obj.length; i++) {
                    divScope.arr.push(obj[i].value);
                    alert(obj[i].value);
                }
            }

            divScope.requestGridData = function (page, num) {
                if (divScope.countNum < page && num == 0) {
                    return;
                }
                var pageCount = false;
                if (divScope.countNum == page) {
                    pageCount = true;
                }
                if (page < 1 && num != 1) {
                    return;
                }
                divScope.pageNow = page;
                if (divScope.url) {
                    var url = divScope.url;
                    if (typeof url == 'function') {
                        url = url();
                    }
                    var ifHttp=url.indexOf("http");
                    if (divScope.$root.basePath&&ifHttp==-1) {
                        url = divScope.$root.basePath + url;
                    }
                    var data = {page: page, pageSize: 5};
                    if (divScope.popupSearch) {
                        data.data = angular.toJson({name: divScope.popupSearch});
                    }
                    // layer.load(2)
                    $http.post(url, data)
                        .success(function (response) {
                            if (response.code == 200) {
                                //@zhangwj 新增支持mybatis plus 原生分页查询结果
                                if(response.result){
                                    divScope.popupRefData = response.result;
                                    divScope.popupRefData_show = response.result.Rows;
                                    divScope.countNum = Math.ceil(response.result.Total / 5);
                                    divScope.pagination.total = response.result.Total;
                                }
                                if(response.data){
                                    divScope.popupRefData = response.data;
                                    divScope.popupRefData_show = response.data.records;
                                    divScope.countNum = Math.ceil(response.data.total / 5);
                                    divScope.pagination.total = response.data.total;
                                }
                                if (response.columnDefs) {
                                    divScope.columnDefs = response.columnDefs;
                                }
                            }
                            layer.closeAll('loading');
                            if (num == 4) {
                                divScope.generatePagination(divScope.countNum);
                            } else {
                                divScope.generatePagination(page);
                            }


                            divScope.showRef(event);
                        }).error(function (error) {
                        layer.closeAll('loading');
                        divScope.showRef(event);
                    });
                }
            }
            divScope.addCustomer = function () {
                ngDialog.openConfirm({
                    showClose: true,
                    closeByDocument: true,
                    template: 'base/customer/stateGridCustomer/addCustomerForm.html',
                    className: 'ngdialog-theme-formInfo',
                    scope: $scope,
                    preCloseCallback: function (value) {
                        return true;
                    }
                }).then(function (value) {
                    if (value != null) {
                        $scope.selectRow(value,null)
                    }
                }, function (reason) {

                });
            }
        },
        link: function (scope, element, attrs, ngModelCtrl) {
            var config = scope.uiPopupRef;
            var tree;
            if (!config) {
                config = {};
            }
            var columnDefs = scope.columnDefs;
            if (!columnDefs) return;
            var parentDom = angular.element(scope.grid.element[0].parentElement);
            var divScope = scope.divScope;
            //获取滚动条DOM的主键
            //var parent=attrs.$$element.context.parentElement;
            //if(parent.style !=null &&　angular.isDefined(parent.style)){
            //    while(parent.style.overflowY!='auto'){
            //        parent=parent.parentElement;
            //    }
            //}
            var uiPopupRefId;
            if (scope.popupIsNgGrid) {
                var dom = document.getElementById('uiPopupRefId');
                if (angular.isDefined(dom) && dom != null && dom != '') {
                    dom.parentNode.removeChild(dom);
                }
                uiPopupRefId = ' id="uiPopupRefId" ';
            } else {
                var id = new Date().getTime() + Math.floor(Math.random())
                uiPopupRefId = ' id="' + id + '"';

                divScope.popupRefId = id;
            }
            divScope.my_tree = tree = {};
            divScope.popupRefData_show = [];
            divScope.popupRefShow = false;
            divScope.rowRenderIndex = scope.rowRenderIndex;

            var divClass = angular.isDefined(config.divClass) ? config.divClass : '';
            var tableClass = angular.isDefined(config.tableClass) ? config.tableClass : 'table table-striped';
            var tableStyle = config.tableStyle ? config.tableStyle : ('width:' + columnDefs.length * 190 + 'px');//'height:280px;width:600px';
            var divStyle = angular.isDefined(config.divStyle) ? config.divStyle : 'min-width:550px;background-color:#fff;position: absolute;z-index:100000';

            //var html = '<div ng-mouseleave="" '+ uiPopupRefId +' ng-show="popupRefShow" style="'+divStyle+'" class="'+divClass+'" >' +
            //    '<table class="'+tableClass+'" ng-grid="pubRefSelect"  style="'+tableStyle+'" > </table>' +
            //    '</div>';


            //判断是不是树形参照
            if (divScope.isTree) {
                var html = '<div ng-mouseenter="mousein=true"  ng-mouseleave="mousein=false"  class="lr-ref" ' + uiPopupRefId + ' style="' + divStyle + '">' +
                    '<div class="panel-heading" style="border-bottom: solid 1px #DDDDDD;"><span style="float: left">请选择{{titlename}}</span> <span style="float: right;"><button class="btn w-xs fa fa-times" type="button" style="background: #fff" ng-click="close(0)"></button></span>' +
                    '</div>' +
                    '<div>' +
                    '<div ng-show="isSearch" style="padding: 5px;"><input class="form-control" ng-model="popupSearch" placeholder="请输入关键字查询" style="display: inline-block;border-radius:0px;"></div>' +
                    '<div class="lr-ref-body-table"     style="padding: 5px 5px 0px 5px;height: 300px;overflow-y: auto">';
                var htmlTemp = '<abn-tree tree-data = "popupRefData_show" tree-control = "my_tree" on-select = "my_tree_handler(branch)" ng-click="my_tree_click()" initial-selection="my_tree_selected" expand-level = "0" icon-leaf = "fa fa-file-o" icon-expand = "fa fa-plus" icon-collapse ="fa fa-minus"></abn-tree>';
                html = html + htmlTemp;
            } else {
                var html = '<div ng-mouseenter="mousein=true"  ng-mouseleave="mousein=false"  class="lr-ref" ' + uiPopupRefId + ' style="' + divStyle + '">' +
                    '<div class="panel-heading" style="border-bottom: solid 1px #DDDDDD;"><span style="float: left">请选择{{titlename}}</span> <span style="float: right;"><button class="btn w-xs fa fa-times" type="button" style="background: #fff" ng-click="close(0)"></button></span>' +
                    '</div>' +
                    '<div>' +
                    '<div style="padding: 5px 0px 0px 5px;"><input id = '+ 'refsearch-'+scope.rowRenderIndex +'-'+divScope.popupRefId +' class="form-control" ng-model="popupSearch" placeholder="请输入关键字查询" style="width: 70%;display: inline-block;border-radius:0px;"><span style="vertical-align: baseline;margin-left: 10px"><button class="btn w-xs fa fa-search" style="padding: 9px 13px 9px 13px;border-bottom: solid 1px #ccc;border-top: solid 1px #ccc;border-right: solid 1px #ccc;border-left: solid 1px #ccc;" ng-click="requestGridData(pageNow,1)"></button></span></div>' +
                    '<div class="lr-ref-body-table" style="padding: 5px 5px 0px 5px;">' +
                    '<table class="table table-hover table-bordered" id="popupgrid"><thead><tr>';
                var radioth = "";
                var radiotd = "";
                if (false) {
                    radioth = '<th style="width:20px"><div class="checkbox clip-check check-info checkbox-inline"> <input type="checkbox" id="checkboxPopup" ng-click="popupClickAll()"> <label for="checkboxPopup"> </label> </div></th>';
                    radiotd = '<td><div class="checkbox clip-check check-info checkbox-inline"> <input type="checkbox" id="{{$index}}" value="{{row}}"> <label for="{{$index}}"> </label> </div></td>';
                }
                var td = '<tr ng-repeat="row in popupRefData_show" ng-click="selectRow(row,$index)">';
                for (var i = 0; i < columnDefs.length; i++) {
                    var columnDef = columnDefs[i];
                    var th = '<th><span>' + columnDef.displayName + '</span></th>';
                    if (i == columnDefs.length - 1) {
                        html = html + th + radioth + '</tr></thead><tbody>';
                        td = td + '<td style="min-width: 100px;">{{row.' + columnDef.field + '}}</td>' + radiotd + '</tr></tbody></table></div>' +
                            '<div ng-show=" popupRefData_show == null || popupRefData_show.length == 0 " class="center" style="padding: 10px 10px 20px"><span style="font-size: 12px; color: #8e8e93"><i class="ti-face-sad"></i>暂无数据</span>';
                        // debugger
                        if (divScope.openCustomerMore){
                            td = td + '<p><button ng-click="addCustomer()">点击添加企业信息</button></p>'
                        }
                        td = td + '</div> <div class="panel-footer" ng-show=" popupRefData_show != null ">' +
                            // '<ul class="pagination">' +
                            // ' <li ng-class="{active: page.isActive}" ng-repeat="page in pages"><a ng-click="requestGridData(page.number)"> {{page.number}} </a></li>' +
                            // '</ul>' +
                            '<div class="row">' +
                            '<div class="col-sm-9 pad">' +
                            '<ul class="pagination pagination-sm m-t-none m-b-none">' +
                            '<li><a ng-click="requestGridData(pageNow-1,0)"><i class="fa fa-chevron-left"></i></a></li>' +
                            '<li><a href id="pageNumNow" ng-bind-html="pageNow"></a></li>' +
                            '<li><a ng-click="requestGridData(1,0)" >首页</a></li>' +
                            ' <li ng-repeat="page in pages"><a ng-click="requestGridData(page.number,0)"> {{page.number}} </a></li>' +
                            '<li><a ng-click="requestGridData(countNum,4)" >尾页</a></li>' +
                            '<li><a ng-click="requestGridData(pageNow+1,0)"><i class="fa fa-chevron-right"></i></a></li>' +
                            '</ul>' +
                            '</div>' +
                            '<div class="approvalbut col-sm-3">' +
                            '<button ng-show="false" type="button" class="btn w-xs btn-info" ng-click="multiple()"> 确认</button>' +
                            '<button type="button" class="btn w-xs" ng-click="close(1)"> 清空</button>' +
                            '</div>' +
                            '</div>' +
                            '</div>' +
                            '</div></div>';
                    } else {
                        html = html + th;
                        if (columnDef.cellFilter) {
                            td = td + '<td  style="min-width: {{row.' + columnDef.field + '.length > 4 ? (row.' + columnDef.field + '.length * 5) : 50}}px"><div>{{row.' + columnDef.field + ' | ' + columnDef.cellFilter + '}}</div></td>';
                        } else {
                            td = td + '<td  style="min-width: {{row.' + columnDef.field + '.length > 4 ? (row.' + columnDef.field + '.length * 5) : 50}}px"><div>{{row.' + columnDef.field + '}}</div></td>';
                        }
                    }
                    //生成表体html
                }
                html = html + td;
            }

            var newElm = $compile(html)(divScope);
            parentDom.append(newElm);

            $("#" + divScope.popupRefId).hide().mouseleave(function () {
                // $(this).hide();
                divScope.mousein = false;
            });
            divScope.showRef = function showRef(event) {
                //scope.filterDate('');
                // var offset=$("#content").scrollTop();
                var e = event.currentTarget;
                var x = e.offsetLeft;
                var y = e.offsetTop;
                var offsetheight = e.offsetHeight;
                var offsetWidth = e.offsetWidth;
                while (e = e.offsetParent) {
                    x += e.offsetLeft;
                    y += e.offsetTop;
                }

                e = parentDom[0];
                var x2 = 0;
                var y2 = 0;

                while (e = e.offsetParent) {
                    x2 += e.offsetLeft;
                    y2 += e.offsetTop;
                }

                if (x > window.screen.width * 0.6) {
                    divScope.float = "right";
                    newElm.css("top", y - y2 + offsetheight + "px");
                    newElm.css("left", x - x2 - 550 + offsetWidth + "px");
                }
                else {
                    divScope.float = "left";
                    newElm.css("top", y - y2 + offsetheight + "px");
                    newElm.css("left", x - x2 + "px");
                }


                /* if(divScope.popupRefShow==null||divScope.popupRefShow==false){
                 divScope.popupRefShow=true;
                 }else{
                 divScope.popupRefShow=false;
                 }*/

                // divScope.popupRefShow = !divScope.popupRefShow;

                divScope.input_width = event.currentTarget.offsetWidth;
                divScope.input_height = event.currentTarget.offsetHeight;

                var queryID = "#" + divScope.popupRefId;
                $(queryID).show();


                //angular.element("#searchData").focus();

            };
            element.bind("blur", function (event) {
                if (!divScope.mousein) {
                    $("#" + divScope.popupRefId).hide();
                }
            });
            element.bind("focus", function (event) {
                if (scope.modelData == undefined) {
                    divScope.pageNow = 1;
                    if (divScope.url) {
                        var url = scope.newUrl || scope.url;
                        if (typeof url == 'function') {
                            url = url();
                        }
                        var ifHttp=url.indexOf("http");
                        if (divScope.$root.basePath&&ifHttp==-1) {
                            url = divScope.$root.basePath + url;
                        }
                        // divScope.titlename = event.target.parentNode.parentElement.firstChild.innerText;
                        layer.load(2);
                        $http.post(url, {page: 1, pageSize: 5})
                            .success(function (response) {
                                if (response.code == 200) {
                                    //@zhangwj 新增支持mybatis plus 原生分页查询结果
                                    if(response.result){
                                        divScope.popupRefData = response.result;
                                        divScope.popupRefData_show = response.result.Rows;
                                        divScope.countNum = Math.ceil(response.result.Total / 5);
                                        divScope.pagination.total = response.result.Total;
                                    }
                                    if(response.data){
                                        divScope.popupRefData = response.data;
                                        divScope.popupRefData_show = response.data.records;
                                        divScope.countNum = Math.ceil(response.data.total / 5);
                                        divScope.pagination.total = response.data.total;
                                    }

                                    //scope.popupRefData = response.result;
                                    if (response.columnDefs) {
                                        divScope.columnDefs = response.columnDefs;
                                    }
                                }
                                layer.closeAll('loading');

                                divScope.generatePagination(1);

                                divScope.showRef(event);
                            }).error(function (error) {
                            layer.closeAll('loading');
                            divScope.showRef(event);
                        });
                    }
                    else {
                        divScope.showRef(event);
                    }
                } else {
                    var array = scope.modelData.split("|");
                    scope.result = "";
                    for (var i = 0; i < array.length; i++) {
                        if (scope.result != "") {
                            scope.result = scope.result[array[i]];
                        } else {
                            scope.result = scope.row.entity[array[i]];
                        }
                    }
                    divScope.popupRefData = scope.result;

                    divScope.popupRefData_show = scope.result;

                    divScope.countNum = Math.ceil(scope.result.length / 5);

                    divScope.pagination.total = scope.result.length;

                    layer.closeAll('loading');

                    divScope.generatePagination(1);

                    divScope.showRef(event);
                }
            });
        }
    }
});

function getScopeDomById(id) {
    var elem;
    //$('.ng-scope')
    angular.element(document.getElementsByClassName('ng-scope')).each(function () {
        var s = angular.element(this).scope(),
            sid = s.$id;
        if (sid == id) {
            elem = this;
            return false; // stop looking at the rest
        }
    });
    return angular.element(elem);
};
function getScopeById(id) {
    return getScopeDomById(id).data().$scope;
}

pub.directive('wdatePickerGrid', function ($timeout) {
    return {
        scope: true,
        controller: function ($scope) {
            var parentScope = $scope;
            var divScope = parentScope.$new(true);
            $scope.divScope = divScope;
            divScope.selectRow = function (value) {
                $timeout(function () {
                    if ($scope.row) {
                        $scope.row.entity[$scope.col.name] = value;
                        $scope.$apply();
                    }
                }, 5);
            }
        },
        link: function (scope, element, attr, ngModel) {
            var divScope = scope.divScope;

            function onpicked(dom) {
                element.change()
                divScope.selectRow($(element, element).val());
            }

            element.bind('click', function () {
                WdatePicker({
                    el: this,
                    onpicked: onpicked,
                    dateFmt: 'yyyy-MM-dd'
                })
            });
        }
    };
});
pub.directive('wdatePicker', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            ngModel: "=",
            dateConfig: "@",//支持my97的参数属性
            onpickedCall: "&",//选择之后回调
            onclearedCall: "&"//清除之后回调
        },
        controller: ['$scope', '$http', '$timeout', '$window', '$location', '$filter', function ($scope, $http, $timeout, $window, $location, $filter) {
            //时间格式化过滤
            $scope.$watch("ngModel", function (newValue, oldValue) {
                $scope.ngModel = $filter('date')(newValue, $scope.dateFmt);
            });
        }],
        link: function (scope, element, attr, ngModel) {
            scope.dateFmt = (attr.datefmt || 'yyyy-MM-dd');
            element.val(ngModel.$viewValue);
            function onpicking(dp) {
                var date = dp.cal.getNewDateStr();
                ngModel.$setViewValue(date);
                if (typeof scope.onpickedCall == 'function') {
                    scope.onpickedCall();
                }
            }

            function oncleared() {
                ngModel.$setViewValue("");
                if (typeof scope.oncleared == 'function') {
                    scope.oncleared();
                }
            }

            element.bind('click', function () {
                init97Date(this);
            });

            function init97Date(value) {
                try {
                    //my97 基本数据配置
                    var wdateConfig = {
                        el: value,
                        onpicking: onpicking,
                        oncleared: oncleared,
                        dateFmt: scope.dateFmt
                    };
                    var config = "{" + scope.dateConfig + "}";
                    var configObj = (new Function("return " + config))();
                    if (configObj['onpicking']) {
                        delete configObj['onpicking'];
                    }
                    if (configObj['onpicking']) {
                        delete configObj['oncleared'];
                    }
                    //扩展my97属性
                    wdateConfig = $.extend(wdateConfig, configObj);
                    WdatePicker(wdateConfig)
                } catch (e) {
                    if (console) {
                        console.log(e);
                    }
                }
            }
        }
    };
});

pub.directive('wdatePickers', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            ngModel: "=",
            dateConfig: "@",//支持my97的参数属性
            onpickedCall: "&",//选择之后回调
            onclearedCall: "&"//清除之后回调
        },
        controller: ['$scope', '$http', '$timeout', '$window', '$location', '$filter', function ($scope, $http, $timeout, $window, $location, $filter) {
            //时间格式化过滤
            $scope.$watch("ngModel", function (newValue, oldValue) {
                $scope.ngModel = $filter('date')(newValue, $scope.dateFmt);
            });
        }],
        link: function (scope, element, attr, ngModel) {
            scope.dateFmt = (attr.datefmt || 'yyyy-MM');
            element.val(ngModel.$viewValue);
            function onpicking(dp) {
                var date = dp.cal.getNewDateStr();
                ngModel.$setViewValue(date);
                if (typeof scope.onpickedCall == 'function') {
                    scope.onpickedCall();
                }
            }

            function oncleared() {
                ngModel.$setViewValue("");
                if (typeof scope.oncleared == 'function') {
                    scope.oncleared();
                }
            }

            element.bind('click', function () {
                init97Date(this);
            });

            function init97Date(value) {
                try {
                    //my97 基本数据配置
                    var wdateConfig = {
                        el: value,
                        onpicking: onpicking,
                        oncleared: oncleared,
                        dateFmt: scope.dateFmt
                    };
                    var config = "{" + scope.dateConfig + "}";
                    var configObj = (new Function("return " + config))();
                    if (configObj['onpicking']) {
                        delete configObj['onpicking'];
                    }
                    if (configObj['onpicking']) {
                        delete configObj['oncleared'];
                    }
                    //扩展my97属性
                    wdateConfig = $.extend(wdateConfig, configObj);
                    WdatePicker(wdateConfig)
                } catch (e) {
                    if (console) {
                        console.log(e);
                    }
                }
            }
        }
    };
});

pub.directive('keyDown', function ($timeout, $rootScope) {
    return {
        scope: true,
        controller: function ($scope) {
            var parentScope = $scope;
            var divScope = parentScope.$new(true);
            $scope.divScope = divScope;
            divScope.selectRow = function (value) {
                if (value.replace(/\s/g, '^&^').split("^&^").length > 1) {
                    if ($scope.row.grid.options) {
                        var dataOne = [];
                        var dataTwo = [];
                        var dataThree = [];
                        var dataIsRight = false;
                        var oldData = $scope.row.grid.options.data;
                        for (var i = 0; i < oldData.length; i++) {
                            if ($scope.row.grid.options.data[i] == $scope.row.entity) {
                                dataIsRight = true;
                            } else {
                                if (dataIsRight) {
                                    dataThree.push(oldData[i]);
                                } else {
                                    dataOne.push(oldData[i]);
                                }
                            }
                        }
                        var indexName = $scope.col.name;
                        var index = false;
                        var names = [];
                        var array = $scope.row.grid.options.columnDefs;
                        for (var i = 0; i < array.length; i++) {
                            if (index) {
                                names.push(array[i].name);
                            } else {
                                if (array[i].name == indexName) {
                                    index = true;
                                    names.push(array[i].name);
                                }
                            }
                        }
                        var str = value.split(' ');
                        for (var k = 0; k < str.length; k++) {
                            var values = str[k].replace(/\s/g, '^&^').split("^&^");
                            var object = {};
                            for (var i = 0; i < names.length; i++) {
                                object[names[i]] = values[i];
                            }
                            dataTwo.push(object);
                        }
                    }
                    $timeout(function () {
                        $scope.row.grid.options.data.length = 0;
                        var data = dataOne.concat(dataTwo.concat(dataThree));
                        for (var i = 0; i < data.length; i++) {
                            data[i].pkOperator = $rootScope.userVO;
                            data[i].operateDate = new Date().format("yyyy-MM-dd");
                            data[i].pkDept = $rootScope.deptVO;
                            data[i].pkOrg = $rootScope.orgVO
                            $scope.row.grid.options.data.push(data[i]);
                        }
                        $scope.$apply();
                    }, 5);
                }
            }
        },
        link: function (scope, element, attr, ngModel) {
            var divScope = scope.divScope;
            $(element).on("keydown", function (event) {
                if (event.ctrlKey == true) {
                    if (event.keyCode == 86) {
                        element.bind('change', function () {
                            if (this.value) {
                                divScope.selectRow(this.value);
                            }
                        });
                        element.bind('keydown', function () {
                            if (this.value) {
                                divScope.selectRow(this.value);
                            }
                        });
                    }
                }
            })
        }
    };
})
app.controller('addCustomerCtrl', function ($rootScope, $scope, $sce, $http, $stateParams, ngVerify, uiGridConstants, ngDialog) {
    $scope.initRef = function () {

    }
    $scope.initData = function () {
        $scope.initVO = function () {
            return {
                pkOperator: $rootScope.userVO,
                pkOrg: $rootScope.orgVO,
                pkDept: $rootScope.deptVO,
                operateDate: new Date().format("yyyy-MM-dd"),
                operateTime: new Date().format("yyyy-MM-dd HH:mm:ss"),
                isContinue: 0,
                dr: 0,
            };
        };
        $scope.VO = $scope.initVO();
    }

    $scope.initFunction = function () {
        /**
         * 保存
         */
        $scope.onSave = function () {
            ngVerify.check('addCustomerForm', function (errEls) {
                if (errEls && errEls.length) {
                    return layer.alert(errEls[0].ngVerify.OPTS.message,
                        {skin: 'layui-layer-lan', closeBtn: 1});
                } else {
                    $scope.onSaveVO();
                }
            }, true)
        };

        $scope.onCancel = function () {
            ngDialog.close();
        };

        $scope.searchCustomer = function () {
            if (!$scope.VO.c0Name || $scope.VO.c0Name == "") {
                layer.alert("请输入客户名称", {skin: 'layui-layer-lan', closeBtn: 1});
                return;
            }
            layer.load(2);
            $http.post($rootScope.basePath + "customerRef/searchCustomer", {name: $scope.VO.c0Name}).success(function (response) {
                layer.closeAll('loading');
                if (response && response.code == "200") {
                    $scope.VO = response.result;
                } else {

                }
            });
        };

        /*
         * 保存VO
         * */
        $scope.onSaveVO = function () {
            layer.load(2);
            $http.post($rootScope.basePath + "stateGridCustomer/save", {data: angular.toJson($scope.VO), funCode:$scope.funCode})
                .success(function (response) {
                    if (response && response.code == 200) {
                        $scope.VO = response.result;
                        $scope.$parent.confirm($scope.VO);
                        ngDialog.close();
                    }
                    if (response&&response.msg) {
                        if (response.code == 200){
                            layer.alert("保存成功，请重新选择！", {skin: 'layui-layer-lan', closeBtn: 1});
                        }else {
                            // e.g. 字符转换为Entity Name
                            response.msg = response.msg.replace(/(\D{1})/g, function (matched) {
                                var rs = asciiChartSet_c2en[matched];
                                return rs == undefined ? matched : rs;
                            });
                            layer.alert(response.msg, {skin: 'layui-layer-lan', closeBtn: 1});
                        }
                    }
                });
        };
    };

    $scope.initData();
    $scope.initRef();
    $scope.initFunction();
});