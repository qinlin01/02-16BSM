app.controller('submitDialogCtrl', function ($rootScope, $scope, $http, uiGridConstants, ngDialog) {
    $scope.initData = function () {

        $scope.approvalMessages = null;
        /**
         * 获取常用审批语
         */
        $scope.getMsg = function () {
            $http.post($scope.basePath + "sys/flow/approvalMessages", {id: ""}).success(function (response) {
                $scope.approvalMessages = response.data;
            });
        };

        /**
         * 获得审批历史
         */
        $scope.getHistoryNoImg = function () {
            $http.post($scope.basePath + "sys/flow/getHistoryNoImg", {id: $scope.VO.id, funcCode: $scope.funcCode}).success(function (response) {
                if (response.code == 200) {
                    $scope.tasks = response.data.tasks;
                }
            });
        };


        $scope.submitVO = $scope.initVO();

        $scope.PASSES = $scope.submitData;
        if ($scope.PASSES && $scope.PASSES.length > 0) {
            for (var i = 0; i < $scope.PASSES.length; i++) {
                //type==3 审核通过,现在有审核通过默认审核通过
                if ($scope.PASSES[i] && ($scope.PASSES[i].transitionType == 0 || $scope.PASSES[i].transitionType == 6 || $scope.PASSES[i].transitionType == 1 || $scope.PASSES[i].transitionType == 3)) {
                    $scope.submitVO.pass = $scope.PASSES[i].transitionCode;
                    if ($scope.PASSES[i].transitionType == 6) {
                        $scope.connmitDisable = true;
                        $scope.comment = "";
                    }
                    break;
                }
            }
        }
        $scope.submitView = true;
        if ($scope.submitData.type) {
            $scope.isAudit = true;
        } else {
            $scope.isAudit = false;
        }
    };
    $scope.initFunction = function () {

        /**
         * 保存
         */
        $scope.onSubmitConfirm = function () {
            // if($scope.isAudit){
            //     $scope.submitVO.rightSelects = [$scope.RIGHT_DATA[0]];
            // } else {
            //     $scope.submitVO.rightSelects = [$scope.LEFT_DATA[0]];
            // }
            if (!$scope.submitVO.msg && $scope.comment != "") {
                layer.alert('请填写审批意见!', {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
            if (!$scope.submitVO.pass) {
                layer.alert('请选择处理方式!', {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
            if ($scope.submitVO.pass.indexOf("_pass") >= 0 && ($scope.RIGHT_DATA == null || $scope.RIGHT_DATA.length != 1)) {
                layer.alert('只能选择一个用户进行提交!', {skin: 'layui-layer-lan', closeBtn: 1});
                return false;
            }
            var selectUsers = [];
            for (var i = 0; i < $scope.RIGHT_DATA.length; i++) {
                var user = {};
                user.code = $scope.RIGHT_DATA[i].code;
                user.name = $scope.RIGHT_DATA[i].name;
                selectUsers.push(user);
            }

            $scope.submitVO.rightSelects = selectUsers;
            return true;
        };

        $scope.onSubmitCancel = function () {
            angular.assignData($scope.appVO, $scope.initVO());
            ngDialog.close();
            layer.closeAll('loading');
        };

        $scope.getSubmitView = function () {
            return $scope.submitVO.pass && ($scope.submitVO.pass.transitionType == 0 || $scope.submitVO.pass.transitionType == 6 || $scope.PASSES[i].transitionType == 1);
        };

    };
    $scope.setMsg = function (value) {
        console.log($scope.approvalMessages.length);
        $scope.submitVO.msg = value;
    }
    $scope.initWatch = function () {
        // $scope.$watch('approvalMessages', function (newVal, oldVal) {
        //     if (null != newVal && newVal != oldVal && oldVal !=null) {
        //         $scope.submitVO.msg = newVal;
        //     }
        // });
        $scope.$watch('submitVO.pass', function (newVal, oldVal) {
            if (newVal == undefined || newVal == null) return;
            if (!newVal) {
                $scope.submitView = false;
            } else {
                for (var i = 0; i < $scope.PASSES.length; i++) {
                    if (newVal == $scope.PASSES[i].transitionCode) {
                        // 是否有候选人
                        if ($scope.PASSES[i].forceAssigees.length == 0) {
                            $scope.submitView = false;
                        } else {
                            $scope.submitView = true;
                        }
                        // 如果左侧只要一个候选人就自动默认到右侧
                        if ($scope.PASSES[i].forceAssigees.length == 1) {
                            $scope.RIGHT_DATA = $scope.PASSES[i].forceAssigees;
                            $scope.LEFT_DATA = [];
                        } else {
                            $scope.LEFT_DATA = $scope.PASSES[i].forceAssigees;
                            $scope.RIGHT_DATA = [];
                        }
                        $scope.submitVO.auditResult = $scope.PASSES[i];
                    }
                }
                $scope.submitVO.rightSelects = $scope.RIGHT_DATA;
            }
        });
    };
    $scope.initClick = function () {
        $scope.onToRight = function () {
            if (!$scope.submitVO.leftSelects || $scope.submitVO.leftSelects.length != 1) {
                return layer.alert("请选择一个用户!", {skin: 'layui-layer-lan', closeBtn: 1});
            }
            ;
            var select = $scope.submitVO.leftSelects[0];
            for (var i = 0; i < $scope.LEFT_DATA.length; i++) {
                if (select == $scope.LEFT_DATA[i].id) {
                    $scope.RIGHT_DATA.push($scope.LEFT_DATA[i]);
                    $scope.LEFT_DATA.splice(i, 1);
                    $scope.submitVO.leftSelects = [];
                    break;
                }
            }
        };
        $scope.onToRightAll = function () {
            if (!$scope.LEFT_DATA || $scope.LEFT_DATA.length == 0) {
                return;
            }
            ;
            for (var i = 0; i < $scope.LEFT_DATA.length; i++) {
                $scope.RIGHT_DATA.push($scope.LEFT_DATA[i]);
                $scope.LEFT_DATA.splice(i, 1);
            }
        };
        $scope.onToLeft = function () {
            if (!$scope.submitVO.rightSelects || $scope.submitVO.rightSelects.length != 1) {
                return layer.alert("请选择一个用户!", {skin: 'layui-layer-lan', closeBtn: 1});
            }
            ;
            var select = $scope.submitVO.rightSelects[0];
            for (var i = 0; i < $scope.RIGHT_DATA.length; i++) {
                if (select == $scope.RIGHT_DATA[i].id) {
                    $scope.LEFT_DATA.push($scope.RIGHT_DATA[i]);
                    $scope.RIGHT_DATA.splice(i, 1);
                    $scope.submitVO.rightSelects = [];
                    break;
                }
            }
        };
        $scope.onToLeftAll = function () {
            if (!$scope.RIGHT_DATA || $scope.RIGHT_DATA.length == 0) {
                return;
            }
            ;
            for (var i = 0; i < $scope.RIGHT_DATA.length; i++) {
                $scope.LEFT_DATA.push($scope.RIGHT_DATA[i]);
                $scope.RIGHT_DATA.splice(i, 1);
            }
        };
    };

    $scope.initData();
    $scope.initFunction();
    $scope.initWatch();
    $scope.initClick();
    $scope.getMsg();
    $scope.getHistoryNoImg();
});