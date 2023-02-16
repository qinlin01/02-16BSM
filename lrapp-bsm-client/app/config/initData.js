// 初始化下拉数据
var getSelectOptionData = function () {
    return {
        USER_ROLE: [{id: 0, name: "系统管理员"}, {id: 1, name: "业务用户"}, {id: 2, name: "分公司用户"}, {
            id: 3, name: "审计管理员"
        }, {id: 4, name: "业务配置员"},],
        USER_TYPE: [{id: 0, name: "长期用户"}, {id: 1, name: "临时用户"},],
        USER_STATUS: [{id: 0, name: "启用"}, {id: 1, name: "禁用"}, {id: 2, name: "超期失效"}, {id: 3, name: "休眠"}, {
            id: 4, name: "冻结"
        }, {id: 5, name: "锁定"},],
        VIEW_PLACE: [{id: 1, name: "列表"}, {id: 2, name: "详情页"}, {id: 3, name: "编辑页"}, {id: -1, name: "不限制"}],
        DRSTATUS: [{id: 0, name: "正常"}, {id: 1, name: "已删除"},],
        BILLSTATUS: [
            {id: 10, name: "未完成"}, {id: 11, name: "已完成"},
            {id: 31, name: "未上报"}, {id: 32, name: "已上报"},
            {id: 34, name: "审批通过"}, {id: 35, name: "审批不通过"}, {id: 33, name: "驳回修改"},
            {id: 37, name: "暂存"}],
        YESNO: [{id: 'Y', name: "是"}, {id: 'N', name: "否"},],
        YESNONUM: [{id: 0, name: "否"}, {id: 1, name: "是"},],
        LOG_TYPE:[{id: 0, name: "正常"}, {id: 9, name: "异常"}],
        LOG_EXCEPTION:[{id: 0, name: "业务异常"}, {id: 9, name: "系统级异常"}],
        OPERATE: [{id: 0, name: "新增"}, {id: 1, name: "修改"}, {id: 2, name: "删除"}, {id: 3, name: "登陆"}, { id: 4, name: "提交"
        }, {id: 5, name: "审核"}, {id: 6, name: "退回修改"}, {id: 7, name: "修改密码"}, {id: 8, name: "查询"}, {  id: 9,  name: "导出数据" }, {id: 10, name: "密码重置"}, {id: 11, name: "驳回修改"}, {id: 12, name: "审批不通过"}, {id: 13, name: "分配角色"}, {id: 14, name: "越权"}, {id: 15, name: "告警"}, { id: 16, name: "退出" }],
        EVENT_TYPE: [{name: "系统事件"}, {name: "业务事件"}],
        SORT_RULE_TYPE: [{name: "时间升序"}, {name: "时间降序"}, {name: "用户名升序"}, {name: "用户名降序"}, {name: "操作类型升序"}, {name: "操作类型降序"}],
        EXERESULT_TYPE: [{name: "成功"}, {name: "失败"}],


        PROJECT_TYPE: [{id: 0, name: "研究咨询项目"}, {id: 1, name: "服务外包项目"}],
        PROJECT_EPIBOLY_TYPE: [{id: 0, name: "普通项目"}, {id: 1, name: "框架项目"}, {id: 2, name: "主项目"}],
        PROJECT_CLASS: [{id: 0, name: "限下项目"}, {id: 1, name: "限上项目"}],
        EXAMINIE_OPTION: [{id: 0, name: "驳回修改"}, {id: 1, name: "同意"}, {id: -1, name: "不同意"}, {id: -9, name: "未审查"}],
        PURCHASE: [{id: 1, name: "公开招标"}, {id: 2, name: "竞争谈判"}, {id: 3, name: "单一来源"}, {id: 4, name: "询价"}],
        CHANGE_TYPE: [{id: 0, name: "信息变更"}, {id: 1, name: "项目终止"}],
        CONTRACT_TYPE: [{id: 0, name: "普通合同"}, {id: 1, name: "框架合同"}],
        INVOICE_TYPE: [{id: 0, name: "增值税专用发票"}, {id: 1, name: "增值税普通发票"}],
        TAX_RATE: [{id: 0.06, name: "6%"}, {id: 0.03, name: "3%"}, {id: 0.01, name: "1%"}, {id: 0, name: "0%"}],
        CREDIT_STATUS: [{id: 0, name: "未处理"}, {id: 1, name: "挂账未付款"}, {id: 2, name: "已处理"}],
        PAY_STATUS: [{id: 0, name: "未处理"}, {id: 1, name: "部分付款"}, {id: 2, name: "已付清"}],
        CLEARING_TYPE: [{id: 0, name: "预付款"}, {id: 1, name: "挂账"}, {id: 2, name: "付款"}, {id: 3, name: "清挂账"}],
        UNIT_ACCOUNT: [{id: 0, name: "万元/人·月"}, {id: 1, name: "万元/人·天"}],
        UNIT_MONTH: [{id: 0, name: "人·月"}, {id: 1, name: "人·天"}],
        APPLY_TYPE: [{id: 0, name: "集中申报"}, {id: 1, name: "临时申报"}],
        QUARTER: [{id: 0, name: "第一季度"}, {id: 1, name: "第二季度"}, {id: 3, name: "第三季度"}, {id: 4, name: "第四季度"}],

        PROJECT_STATUS: [{id: 0, name: "已完成需求申报，尚未开始立项评审"},
            {id: 1, name: "已完成立项评审，尚未开始项目采购"},
            {id: 2, name: "完成专业评审、待立项评审"},
            {id: 8, name: "项目采购中"},
            {id: 3, name: "完成立项评审，待项目批复"},
            {id: 4, name: "完成项目批复，待签订合同"},
            {id: 5, name: "已支付进度款"},
            {id: 6, name: "项目验收、待支付尾款"},
            {id: 7, name: "已支付为空、项目结项"},
            {id: -1, name: "项目终止"},
        ],
    };
};

