// 初始化下拉数据
var getSelectOptionData =  {
        ACCEPTYPE: [{id: 1, name: "独立承保"}, {id: 2, name: "主承保"}, {id: 3, name: "参与共保"},],
        ACCOUNTTYPE: [{id: 1, name: "保险费"}, {id: 2, name: "经纪佣金"}, {id: 3, name: "咨询费"},],
        ADVISEDOCUMENTTYPE: [{id: 1, name: "保险建议书"}, {id: 3, name: "其他"},],
        AFFIRMACCESSORYTYPE: [{id: 1, name: "客户签章保险方案确认函"}, {id: 2, name: "保险方案确认函"}, {id: 3, name: "其他"},],
        AGENCYCOMPTYPE: [{id: 1, name: "保险公估公司"}, {id: 2, name: "保险代理公司"}, {id: 3, name: "保险经纪公司"}, {
            id: 4,
            name: "保险销售服务公司"
        }, {id: 5, name: "保险中介集团"}, {id: 6, name: "其他"},],
        AGENTSCOPE: [{id: 1, name: "产险"}, {id: 2, name: "寿险"}, {id: 3, name: "全面"},],
        ALEADREAD: [{id: 0, name: "已阅"}, {id: 1, name: "未阅"},],
        APPRAISALTYPE: [{id: 0, name: "月度"}, {id: 1, name: "年度"},],
        ARRANGEDOUCUMENTTYPE: [{id: 0, name: "招标/询价/竞争性谈判文件"}, {id: 1, name: "保险公司报价文件、投标文件"}, {
            id: 2,
            name: "询价分析报告和评标报告等"
        }, {id: 3, name: "中选通知"}, {id: 4, name: "未中选通知"}, {id: 5, name: "中标通知"}, {id: 6, name: "未中标通知"}, {
            id: 7,
            name: "其他"
        },],
        ARRANGEWAYTYPE: [{id: 0, name: "保险询价"}, {id: 1, name: "保险招标"}, {id: 2, name: "竞争性谈判"}, {
            id: 3,
            name: "直接安排"
        }, {id: 4, name: "单一来源采购文件"},],
        ASSESSORREPORTTYPE: [{id: 1, name: "初期公估报告"}, {id: 2, name: "中期公估报告"}, {id: 3, name: "终期公估报告"},],
        AUDITRESULT: [{id: 0, name: "同意"}, {id: 8, name: "转公司领导"}, {id: 2, name: "退回"}, {id: 10, name: "提交总部"}, {
            id: 4,
            name: "送会签"
        }, {id: 6, name: "转上级领导"},],
        AUDITSTATE: [{id: 0, name: "未审批"}, {id: 1, name: "已审批"},],
        AUDITTYPE: [{id: 0, name: "审批"}, {id: 1, name: "会签"},],
        BLANKETTYPE: [{id: 1, name: "统保"}, {id: 3, name: "非统保"},],
        BUSIINSURANCETYPE: [{id: 0, name: "完全匹配"}, {id: 1, name: "保单号匹配不上"}, {id: 2, name: "投保人名称不一致"}, {
            id: 3,
            name: "保险金额赔偿限额不一致;"
        }, {id: 4, name: "保险期限不一致"}, {id: 5, name: "险种不一致;"}, {id: 6, name: "签单保费不一致;"}, {id: 7, name: "1;"},],
        BUSINESSEXAMINEDOCTYPE: [{id: 1, name: "风险评估报告"}, {id: 3, name: "保险建议书"}, {id: 5, name: "保险方案"}, {
            id: 7,
            name: "保险询价文件"
        }, {id: 9, name: "保险竞争性谈判文件"}, {id: 11, name: "保险招标文件"}, {id: 13, name: "保险经纪人投标文件"}, {
            id: 14,
            name: "单一来源采购文件"
        },],
        AGAINBUSINESSEXAMINEDOCTYPE: [{id: 5, name: "再保险方案"},{id: 13, name: "保险经纪人投标文件"},{id: 15, name: "再保条"},{id: 16, name: "再保账单"}],
        BUSINESSTYPE: [{id: 0, name: "国内经纪业务"}, {id: 1, name: "国际经纪业务"}, {id: 2, name: "电子商务业务"},],
        BUSIYEAR: [{id: 2025, name: "2025"}, {id: 2024, name: "2024"}, {id: 2023, name: "2023"}, {
            id: 2022,
            name: "2022"
        }, {id: 2021, name: "2021"}, {id: 2020, name: "2020"}, {id: 2019, name: "2019"}, {
            id: 2018,
            name: "2018"
        }, {id: 2017, name: "2017"}, {id: 2016, name: "2016"}, {id: 2015, name: "2015"}, {
            id: 2014,
            name: "2014"
        }, {id: 2013, name: "2013"}, {id: 2012, name: "2012"}, {id: 2011, name: "2011"}, {
            id: 2010,
            name: "2010"
        }, {id: 2009, name: "2009"}, {id: 2008, name: "2008"}, {id: 2007, name: "2007"}],
        PURCHASE: [{id: 1, name: "公开招标"}, {id: 2, name: "竞争谈判"}, {id: 3, name: "单一来源"}, {id: 4, name: "询价"}],
        CASETYPE: [{id: 1, name: "是"}, {id: 2, name: "否"}, {id: 3, name: "不详"},],
        CEASEREASONTYPE: [{id: 1, name: "建工险转财产险"}, {id: 2, name: "客户流失"}, {id: 3, name: "其它"},],
        CERTCODETYPE: [{id: 1, name: "身份证"}, {id: 2, name: "驾照"}, {id: 3, name: "护照"}, {id: 4, name: "军官证"}, {
            id: 5,
            name: "公估资格证"
        },],
        CHANGEBILLCHECKTYPE: [{id: 1, name: "保险公司批单"}, {id: 2, name: "公司内部批改"}, {id: 3, name: "合同变更"}, {
            id: 4,
            name: "其他（财务资料）"
        }],
        CHANGEBILLCHECKTYPE1: [{id: 1, name: "保险公司批单"}, {id: 2, name: "公司内部批改"}],
        CORRECTINGREASONSTYPE: [{id: 1, name: "发票冲销"}, {id: 2, name: "保单录入错误"}, {id: 3, name: "保险期间延长"}, {
            id: 4,
            name: "退保"
        }, {id: 5, name: "增加被保险人"}, {id: 6, name: "汇率变更"}, {id: 7, name: "其它"}, {id: 8, name: "保费变更"}, {
            id: 9,
            name: "尾差调整"
        }],
        CLEARINGINFOSTYPE: [{id: 0, name: "代收保费通知书"}, {id: 1, name: "代付保费通知书"}, {id: 2, name: "保险收据扫描件"}, {
            id: 3,
            name: "业务收入确认书"
        }, {id: 4, name: "发票开具申请书"}, {id: 5, name: "资金到账通知书"}, {id: 6, name: "催收记录"},],
        COLLABORATIVETYPE: [{id: 1, name: "国内经纪协同业务"}, {id: 2, name: "国际经纪协同业务"}, {id: 3, name: "管理咨询协同业务"}, {
            id: 4,
            name: "公估协同业务"
        }, {id: 5, name: "电子商务协同业务"},],
        COMMITTARGETTYPE: [{id: 0, name: "客户"}, {id: 1, name: "保险公司"},],
        COMMITTYPE: [{id: 0, name: "寄送"}, {id: 1, name: "当面提交"}, {id: 2, name: "电子邮件"}, {id: 3, name: "传真"}, {
            id: 4,
            name: "其他"
        },],
        COMMUNICATIONWAY: [{id: 0, name: "电话沟通"}, {id: 1, name: "当面沟通"},],
        CONFIRMBILLSTATUS: [{id: 28, name: "未完成"}, {id: 45, name: "已完成"}, {id: 46, name: "退回修改"},],
        CONFIRMTYPE: [{id: 0, name: "未提交"}, {id: 4, name: "已确认"},],
        CONSULTTYPE: [{id: 1, name: "产险咨询"}, {id: 2, name: "寿险咨询"}, {id: 3, name: "风险咨询"}, {
            id: 4,
            name: "企业年金"
        }, {id: 5, name: "服务咨询"}],
        CONSULTTYPE_OTHER: [{id: 5, name: "公估费"}, {id: 6, name: "其它营销"}, {id: 7, name: "协助索赔咨询"}],
        CONTRACTBILLSTATUS: [{id: 70, name: "未签署"}, {id: 71, name: "已签署"},],
        CONTRACTMODULE: [{id: 0, name: "其他"}, {id: 1, name: "保险经纪业务委托合同"}, {id: 2, name: "三方合同"}, {
            id: 3,
            name: "合作协议"
        }, {id: 4, name: "授权委托书"},],
        CONTRACTTYPE: [{id: 1, name: "保险经纪业务委托合同"}, {id: 2, name: "三方保险合同"}, {id: 3, name: "保险经纪业务合作协议"}, {
            id: 4,
            name: "保险经纪业务授权委托书"
        }, {id: 5, name: "保险经纪业务合作合同"}, {id: 6, name: "其他业务合作合同"},],
        // COOPERATIONTYPE:[{id:0,name:"非协同业务"},{id:1,name:"国内经纪协同业务"},{id:2,name:"国际经纪协同业务"},{id:3,name:"管理咨询协同业务"},{id:4,name:"公估协同业务"},{id:5,name:"电子商务协同业务"},],
        COOPERATIONTYPE: [{id: 0, name: "非协同业务"}, {id: 6, name: "协同业务"},],
        CUSCHANGETYPE: [{id: 0, name: "信息变更"}, {id: 1, name: "封存"}, {id: 2, name: "启用"},],
        CUSTOMERBILLSTATUS: [{id: 0, name: "未提交"}, {id: 24, name: "被合并"}, {id: 40, name: "提交待复核"}, {
            id: 1,
            name: "已复核"
        }, {id: 2, name: "复核未通过"}, {id: 23, name: "封存"},],
        CUSTOMERCHANGEBILLSTATUS: [{id: 0, name: "未提交"}, {id: 24, name: "被合并"}, {id: 40, name: "提交待复核"}, {
            id: 1,
            name: "已复核"
        }, {id: 2, name: "复核未通过"}, {id: 23, name: "封存"},],
        CUSTOMERFLAG: [{id: 1, name: "股东集团客户"}, {id: 2, name: "市场集团客户"}, {id: 3, name: "单一大客户"}, {
            id: 4,
            name: "单一小客户"
        },],
        CUSTOMERGROUPETYPE: [{id: 1, name: "国网客户"}, {id: 2, name: "市场客户"},],
        CUSTOMERHISTYPE: [{id: 2, name: "封存"}, {id: 3, name: "启用"}, {id: 4, name: "变更"}, {id: 5, name: "被合并"},],
        CUSTOMERLEVELTYPE: [{id: -1, name: "未设置"}, {id: 0, name: "一级"}, {id: 1, name: "二级"}, {
            id: 2,
            name: "三级"
        }, {id: 3, name: "四级"}, {id: 4, name: "五级"},],
        CUSTOMERSTATUS: [{id: 1, name: "目标客户"}, {id: 9, name: "流失客户"}, {id: 3, name: "立项客户"}, {
            id: 5,
            name: "签约客户"
        }, {id: 7, name: "签单客户"},],
        CUSTOMERTRAINCHANGETYPE: [{id: 0, name: "新增"}, {id: 1, name: "变更"},],
        CUSTOMERTRAINTYPE: [{id: 0, name: "财产损失保险"}, {id: 1, name: "人身保险"}, {id: 2, name: "责任保险"}, {
            id: 3,
            name: "信用保证保险"
        },],

        PRACTICE_REGISTRATION_STATUS:[{id: 'Y', name: "有效"}, {id: 'N', name: "无效"},],
        CUSTOMERTYPE: [{id: 1, name: "国网客户"}, {id: 6, name: "市场客户"}, {id: 9, name: "分公司客户"}, {
            id: 2,
            name: "个人客户"
        }, {id: 3, name: "保险公司"}, {id: 4, name: "中介公司"}, {id: 5, name: "其他合作公司"}, {id: 10, name: "客户"}],
        CUSTOMERUNITEBILLSTATUS: [{id: 0, name: "未提交"}, {id: 40, name: "提交待复核"}, {id: 1, name: "已复核"}, {
            id: 2,
            name: "复核未通过"
        }, {id: 23, name: "封存"},],
        DATAREVICESTATUS: [{id: 0, name: "数据接收成功"}, {id: 1, name: "数据接收失败"},],
        DATASENDSTATUS: [{id: 0, name: "数据发送成功"}, {id: 1, name: "数据发送失败"},],
        DEPARTCUSTOMERTYPE: [{id: 1, name: "国网客户"}, {id: 3, name: "保险公司"}, {id: 4, name: "中介公司"},],
        DOCTYPE: [{id: 16, name: "市场调研报告模板"}, {id: 1, name: "风险评估报告"}, {id: 17, name: "下发编制营销计划通知模板"}, {
            id: 18,
            name: "制定营销方案模板"
        }, {id: 3, name: "保险建议书"}, {id: 5, name: "保险方案"}, {id: 7, name: "保险询价文件"}, {id: 9, name: "保险竞争性谈判文件"}, {
            id: 11,
            name: "保险招标文件"
        }, {id: 13, name: "保险投标文件"}, {id: 15, name: "共保协议"},],
        DOCUMENTRESULTSTYPE: [{id: 1, name: "风险评估报告"}, {id: 3, name: "其他"},],
        DOUCUMENTTYPE: [{id: 1, name: "合作合同扫描件"}, {id: 2, name: "保费缴纳通知书"}, {id: 5, name: "其他"}, {
            id: 3,
            name: "文本文档"
        },],
        DRSTATUS: [{id: 0, name: "正常"}, {id: 1, name: "已删除"},],
        EDUCATIONTYPE: [{id: 1, name: "大专"}, {id: 2, name: "本科"}, {id: 3, name: "硕士"}, {id: 4, name: "博士"}, {
            id: 5,
            name: "博士后"
        },],
        ENDTRAINREASONTYPE: [{id: 1, name: "客户推迟培训时间"}, {id: 2, name: "其他"},],
        ENTKINDTYPE: [{id: 1, name: "国有企业"}, {id: 2, name: "集体企业"}, {id: 3, name: "有限责任公司"}, {
            id: 4,
            name: "股份有限公司"
        }, {id: 5, name: "私营企业"}, {id: 6, name: "中外合资企业"}, {id: 7, name: "外商投资企业"},],
        FEEDBACKRESULT: [{id: 0, name: "同意"}, {id: 1, name: "不同意"},],
        FILETYPE: [{id: 0, name: "客户服务计划"}, {id: 1, name: "客户服务手册"}, {id: 2, name: "客户服务工作报告"}, {
            id: 3,
            name: "保险公司服务质量评价"
        }, {id: 4, name: "客户服务质量进度"},],
        FLOWSTATUS: [{id: 0, name: "待复核"}, {id: 1, name: "审批完成"}, {id: 33, name: "待填写执行结果"}, {
            id: 2,
            name: "作废"
        }, {id: 34, name: "待审阅执行结果"}, {id: 3, name: "复核通过"}, {id: 35, name: "执行结果审阅不通过"}, {
            id: 4,
            name: "总部经办人退回"
        }, {id: 6, name: "复核未通过"}, {id: 9, name: "总部经办人待审批"}, {id: 10, name: "退回到总部经办人"}, {
            id: 12,
            name: "总部副负责人待审批"
        }, {id: 15, name: "总部负责人待审批"}, {id: 18, name: "会签"}, {id: 19, name: "会签已完成"}, {
            id: 21,
            name: "公司领导待审批"
        }, {id: 24, name: "总部经办人待汇总意见"}, {id: 90, name: "总部处理中"}, {id: 30, name: "审批不通过"},],
        FORMALITYSUBMITTYPE: [{id: 0, name: "承保确认函"}, {id: 1, name: "保险公司签章承保确认函"}, {id: 2, name: "暂保承诺函"}, {
            id: 3,
            name: "保险公司签章暂保承诺函"
        }, {id: 4, name: "暂保单"}, {id: 5, name: "保单"}, {id: 6, name: "投保单"}, {id: 7, name: "出单通知"}, {
            id: 8,
            name: "保险公司签章出单通知"
        }, {id: 9, name: "佣金支付确认书"}, {id: 10, name: "保险公司签章佣金支付确认书"}, {id: 11, name: "共保协议"}, {
            id: 12,
            name: "编制三方保险合同"
        },],
        FREQUENCYTYPE: [{id: 0, name: "每年"}, {id: 1, name: "在服务期限内"},],
        GROUPCUSTOMERTYPE: [{id: 1, name: "国网客户"}, {id: 2, name: "市场客户"},],
        GWCHANGETYPE: [{id: 0, name: "信息变更"}, {id: 8, name: "国网转市场"}, {id: 1, name: "封存"}, {id: 2, name: "启用"},],
        INCOMETYPE: [{id: 1, name: "10万以下"}, {id: 2, name: "10万（含）-100万"}, {id: 3, name: "100万（含）-500万 "}, {
            id: 4,
            name: "500万（含）以上"
        },],
        INPUTROLETYPE: [{id: 1, name: "分公司填报"}, {id: 2, name: "总部考核"},],
        INSTANCYTYPE: [{id: 1, name: "一般"}, {id: 2, name: "急"}, {id: 3, name: "较急"}, {id: 4, name: "特急"},],
        INSURADV: [{id: 1, name: "财产险类"}, {id: 2, name: "人身险类"},],
        INSURANCEBILLKIND: [{id: 0, name: "新增"}, {id: 1, name: "续保"}, {id: 2, name: "扩展"},],
        INSURANCEBILLSTATUSTYPE: [{id: 32, name: "已上报"}, {id: 33, name: "审批中"}, {id: 34, name: "审批通过"}, {
            id: 35,
            name: "审批不通过"
        }, {id: 36, name: "驳回修改"}, {id: 37, name: "暂存"}, {id: 46, name: "退回修改"}, {id: 31, name: "未上报"},],
        INSURANCEBILLTYPE: [{id: 1, name: "unlife"}, {id: 2, name: "grouplife"}, {id: 3, name: "groupcar"}, {
            id: 4,
            name: "singlelife"
        }, {id: 5, name: "personallife"}, {id: 6, name: "personalcar"}, {id: 7, name: "relife"},],
        INSURANCEBILLTYPENAME: [{id: "unlife", name: "财产险"}, {id: "grouplife", name: "寿险"}, {
            id: "groupcar",
            name: "车险"
        }, {id: "singlelife", name: "个人寿险"}, {id: "personallife", name: "个人寿险"}, {
            id: 6,
            name: "personalcar"
        }, {id: "relife", name: "再保险"},],

        INSURANCETYPE: [{id: 0, name: "新增"}, {id: 1, name: "续保"}, {id: 2, name: "扩展"}, {id: 3, name: "unlife"}, {
            id: 4,
            name: "grouplife"
        }, {id: 5, name: "groupcar"}, {id: 6, name: "singlelife"},],
        INSURECOMPTYPE: [{id: 1, name: "财产险公司"}, {id: 2, name: "人寿险公司"}, {id: 3, name: "健康保险公司"}, {
            id: 4,
            name: "养老保险公司"
        }, {id: 5, name: "责任险公司"}, {id: 6, name: "再保险公司"}, {id: 7, name: "农业保险公司"}, {id: 8, name: "信用保险公司"}, {
            id: 9,
            name: "汽车保险公司"
        }, {id: 10, name: "其它"},],
        INSUREFREQUENCYTYPE: [{id: 0, name: "每年"}, {id: 1, name: "在保险期限内"},],
        ISEQUALZERO: [{id: 0, name: "是"}, {id: 1, name: "否"},],
        KNOWLEGEFILETYPE: [{id: 1, name: "总部模板"}, {id: 2, name: "分公司模板"},],
        LINKMANTYPE: [{id: 1, name: "业务安排"}, {id: 2, name: "协助索赔"}, {id: 3, name: "其他"},],
        MARBILLSTATUS: [{id: 0, name: "未上报"}, {id: 1, name: "首次上报"}, {id: 2, name: "首次批复"}, {
            id: 3,
            name: "第二次上报"
        }, {id: 4, name: "第二次批复"}, {id: 5, name: "第三次上报"}, {id: 6, name: "第三次批复"},],
        MARCHANGETYPE: [{id: 0, name: "信息变更"}, {id: 1, name: "封存"}, {id: 9, name: "市场转国网"}, {id: 2, name: "启用"},],
        MARDATASTATUS: [{id: 0, name: "正式"}, {id: 1, name: "删除"}, {id: 2, name: "草稿"},],
        MARFUNDSTYPE: [{id: 0, name: "计划账款"}, {id: 1, name: "应收账款"},],
        MARKETTYPE: [{id: 0, name: "产险业务"}, {id: 1, name: "寿险业务"},],
        MARMONTH: [{id: 1, name: "一月"}, {id: 2, name: "二月"}, {id: 3, name: "三月"}, {id: 4, name: "四月"}, {
            id: 5,
            name: "五月"
        }, {id: 6, name: "六月"}, {id: 7, name: "七月"}, {id: 8, name: "八月"}, {id: 9, name: "九月"}, {
            id: 10,
            name: "十月"
        }, {id: 11, name: "十一月"}, {id: 12, name: "十二月"},],
        MARPLANTYPE: [{id: 0, name: "股东业务财产险计划"}, {id: 1, name: "股东业务人身险计划"}, {id: 2, name: "市场业务财产险计划"}, {
            id: 3,
            name: "市场业务人身险计划"
        },],
        MARPROTYPE: [{id: 1, name: "未上报"}, {id: 2, name: "审批中"}, {id: 3, name: "审核完成"},],
        MARSURTYPE: [{id: 1, name: "1.政策调研拜访"}, {id: 2, name: "2.市场分析拜访在京单位"}, {id: 3, name: "3.市场分析拜访非在京单位"}, {
            id: 4,
            name: "4.走访在京单位"
        }, {id: 5, name: "5.走访非在京单位"}, {id: 6, name: "6.购买政策研究资料（套数）"}, {id: 7, name: "7.购买市场分析资料(套数)"}, {
            id: 8,
            name: "8.建立保险经纪人招标信息资料库（个）"
        }, {id: 9, name: "9.建立保险产品资料库（次）"}, {id: 10, name: "10.建立保险相关信息资料库（次）"}, {id: 11, name: "11.调研客户需求"}, {
            id: 12,
            name: "12.保险公司拜访"
        }, {id: 13, name: "13.其他"},],
        MARTYPE: [{id: 1, name: "股东业务"}, {id: 2, name: "非股东业务"},],
        MARKETING: [{id: 0, name: "创新一部"}, {id: 1, name: "创新二部"}, {id: 2, name: "金融创新中心"}],
        PARAMSHOWTYPE: [{id: 0, name: "文本"}, {id: 1, name: "枚举"}, {id: 2, name: "中文"},],
        PAYMETHODTYPE: [{id: 0, name: "期交"}, {id: 1, name: "趸交"}, {id: 2, name: "年缴"}, {id: 3, name: "不定期"}, {
            id: 4,
            name: "限期（）年缴"
        }, {id: 5, name: "半年缴"}, {id: 6, name: "季缴"}, {id: 7, name: "月缴"},],
        PERFAPPRAISALTYPE: [{id: 0, name: "投标文件"}, {id: 1, name: " 签订保险经纪业务委托合同"}, {id: 2, name: "客户服务计划"}, {
            id: 3,
            name: "客户服务手册"
        }, {id: 4, name: "保险建议书"}, {id: 5, name: "三方保险合同"}, {id: 6, name: "保险方案"}, {id: 7, name: "保险安排文件"}, {
            id: 8,
            name: "保险经纪业务合作协议"
        }, {id: 9, name: "业务档案管理"}, {id: 10, name: "业务信息系统录入情况"}, {id: 11, name: "重大业务事项上报"}, {
            id: 12,
            name: "风险评估报告"
        }, {id: 13, name: "业务立项"}, {id: 14, name: "客户服务工作报告"}, {id: 15, name: "客户回访"}, {id: 17, name: "客户投诉"}, {
            id: 18,
            name: "客户培训"
        }, {id: 19, name: "市场调研情况"}, {id: 20, name: "立项数"}, {id: 21, name: "立项规模"}, {id: 22, name: "规模成功率"}, {
            id: 23,
            name: "业务协同率"
        }, {id: 24, name: "市场业务贡献率"}, {id: 25, name: "业务管理综合评价"},],
        PERSONCOUNTTYPE: [{id: 1, name: "50人以下"}, {id: 2, name: "50人(含)-100人"}, {id: 3, name: "100人(含)-500人"}, {
            id: 4,
            name: "500人(含)-1000人"
        }, {id: 5, name: "1000人(含)-5000人"}, {id: 6, name: "5000人(含)-20000人"}, {id: 7, name: "20000人(含)以上"},],
        PHOTOTYPE: [{id: 1, name: "身份证"}, {id: 2, name: "劳动合同"}, {id: 3, name: "社保证明"}, {id: 4, name: "毕业证书"}, {
            id: 5,
            name: "资格证书"
        }, {id: 6, name: "其他"},],
        PROCESSSTATUSTYPE: [{id: 76, name: "已结案"}, {id: 75, name: "未结案"},],
        PROJECTBUSITYPE: [{id: 1, name: "佣金业务"}, {id: 2, name: "咨询费业务"},],
        PROJECTCUSTOMERTYPE: [{id: 4, name: "中介公司"}, {id: 1, name: "客户信息"}, {id: 3, name: "保险公司"},],
        PROCUSTOMERTYPE: [{id: 1, name: "客户信息"}, {id: 3, name: "保险公司"},],
        PROJECTPROPERTIESTYPE: [{id: 0, name: "新增立项"}, {id: 1, name: "续立项"},],
        PROJECTROLE: [{id: 1, name: "项目经理"}, {id: 2, name: "项目成员"},],
        PROJECTTYPE: [{id: 0, name: "个人业务立项"}, {id: 1, name: "团体客户经纪业务立项"},],
        PROPERTYMEDIUMTYPE: [{id: 1, name: "公估公司"}, {id: 2, name: "代理公司"}, {id: 3, name: "咨询公司"},],
        PROYEAR: [{id: 1, name: "2011"}, {id: 2, name: "2012"}, {id: 3, name: "2013"},],
        QUOTATYPE: [{id: 0, name: "营销"}, {id: 1, name: "业务管理"}, {id: 2, name: "客户服务"},],
        RECORDBILLSTATUS: [{id: 0, name: "未提交"}, {id: 40, name: "提交待复核"}, {id: 1, name: "已复核"}, {
            id: 2,
            name: "复核未通过"
        }, {id: 46, name: "退回修改"},],
        RECORDDOCTYPE: [{id: 1, name: "传真"}, {id: 2, name: "函件"}, {id: 3, name: "会议纪要"}, {id: 4, name: "其他"},],
        REFERRALSTYPE: [{id: 0, name: "一般业务"}, {id: 2, name: "投标业务"},],
        REINSURANCEBUSINESSTYPE: [{id: 0, name: "再保险经纪业务"}, {id: 1, name: "转分保业务"},],
        REINSURANCETYPE: [{id: 0, name: "合约业务"}, {id: 1, name: "临分业务"}, {id: 2, name: "比例业务"}, {id: 3, name: "非比例业务"},],
        REPORTSTATUSTYPE: [{id: 32, name: "已上报"}, {id: 33, name: "审批中"}, {id: 34, name: "审批通过"}, {
            id: 35,
            name: "审批不通过"
        }, {id: 36, name: "驳回修改"}, {id: 31, name: "未上报"}, {id: 8, name: "审核未通过"}, {id: 37, name: "暂存"}],
        REPORTTYPE: [{id: 1, name: "业务协调"}, {id: 2, name: "技术支持申请"}, {id: 3, name: "重大业务事项上报"}, {
            id: 4,
            name: "重大案件技术支持"
        }, {id: 5, name: "其他"}, {id: 6, name: "保单录入延时说明"}, {id: 7, name: "档案变更"}],
        AGAINREPORTTYPE: [{id: 6, name: "保单录入延时说明"},],
        ROLETYPE: [{id: 1, name: "负责人"}, {id: 2, name: "业务人员"},],
        SERVICEINDEX: [{id: 1, name: "承保服务指标"}, {id: 2, name: "理赔服务指标"}, {id: 3, name: "防灾防损指标"}, {
            id: 4,
            name: "培训及其它指标"
        }, {id: 5, name: "综合评价指标"},],
        SEXTYPE: [{id: 1, name: "男"}, {id: 2, name: "女"}, {id: 3, name: "不详"},],
        SIGNMODE: [{id: 0, name: "寄送"}, {id: 1, name: "当面签署"},],
        SOURCETYPE: [{id: 1, name: "新数据"}, {id: 2, name: "迁移数据"},],
        SPREADRESULTTYPE: [{id: 1, name: "正在推介"}, {id: 2, name: "推介成功"},],
        SPREADTYPE: [{id: 1, name: "客户告知书"}, {id: 2, name: "ppt"}, {id: 3, name: "宣传册或宣传光盘"}, {
            id: 4,
            name: "推介文件"
        }, {id: 5, name: "宣传品"}, {id: 6, name: "保险建议书"}, {id: 7, name: "保险方案"}, {id: 8, name: "保险经纪人投标文件"}, {
            id: 9,
            name: "其他"
        }, {id: 11, name: "国网公司关于保险管理工作相关文件"}, {id: 13, name: "会议纪要"}, {id: 14, name: "续保总结文件"}, {
            id: 15,
            name: "投标工作总结文件"
        },],
        STYLE: [{id: 1, name: "内部专家"}, {id: 2, name: "外部专家"},],
        SUBMITTYPE: [{id: 0, name: "保费付款通知书、保费发票"}, {id: 1, name: "批改申请书"}, {id: 2, name: "保险到期提示函"},],
        SURSTATUSTYPE: [{id: 1, name: "未完成"}, {id: 2, name: "已完成"},],
        SURTYPE: [{id: 1, name: "市场调研报告"}, {id: 2, name: "制定营销方案"}, {id: 3, name: "下发编制营销计划通知"},],
        TASKSTATE: [{id: 0, name: "未执行"}, {id: 1, name: "已执行"},],
        TEMPLATETYPE: [{id: 1, name: "业务方案签报模板"}, {id: 2, name: "会议纪要模板"}, {id: 3, name: "传真模板"},],
        TIMEENUMTYPE: [{id: 1, name: "0:00"}, {id: 2, name: "0:30"}, {id: 3, name: "1:00"}, {
            id: 4,
            name: "1:30"
        }, {id: 5, name: "2:00"}, {id: 6, name: "2:30"}, {id: 7, name: "3:00"}, {id: 8, name: "3:30"}, {
            id: 9,
            name: "4:00"
        }, {id: 10, name: "4:30"}, {id: 11, name: "5:00"}, {id: 12, name: "5:30"}, {id: 13, name: "6:00"}, {
            id: 14,
            name: "6:30"
        }, {id: 15, name: "7:00"}, {id: 16, name: "7:30"}, {id: 17, name: "8:00"}, {id: 18, name: "8:30"}, {
            id: 19,
            name: "9:00"
        }, {id: 20, name: "9:30"}, {id: 21, name: "10:00"}, {id: 22, name: "10:30"}, {id: 23, name: "11:00"}, {
            id: 24,
            name: "11:30"
        }, {id: 25, name: "12:00"}, {id: 26, name: "12:30"}, {id: 27, name: "13:00"}, {id: 28, name: "13:30"}, {
            id: 29,
            name: "14:00"
        }, {id: 30, name: "14:30"}, {id: 31, name: "15:00"}, {id: 32, name: "15:30"}, {id: 33, name: "16:00"}, {
            id: 34,
            name: "16:30"
        }, {id: 35, name: "17:00"}, {id: 36, name: "17:30"}, {id: 37, name: "18:00"}, {id: 38, name: "18:30"}, {
            id: 39,
            name: "19:00"
        }, {id: 40, name: "19:30"}, {id: 41, name: "20:00"}, {id: 42, name: "20:30"}, {id: 43, name: "21:00"}, {
            id: 44,
            name: "21:30"
        }, {id: 45, name: "22:00"}, {id: 46, name: "22:30"}, {id: 47, name: "23:00"}, {id: 48, name: "23:30"},],
        TRAINBILLSTATUSTYPE: [{id: 31, name: "未上报"}, {id: 32, name: "已上报"}, {id: 33, name: "审批中"}, {
            id: 34,
            name: "审批通过"
        }, {id: 35, name: "审批不通过"}, {id: 36, name: "驳回修改"}, {id: 37, name: "暂存"}],
        BUSSINESFILESSTATUS: [{id: 0, name: "未整理"}, {id: 1, name: "整理中"}, {id: 2, name: "档案封存"}],
        BUSSINESSSTATUS: [{id: 1, name: "正常"}, {id: 2, name: "终止"}],
        TRAINCONTENTTYPE: [{id: 1, name: "报到"}, {id: 3, name: "风险管理"}, {id: 5, name: "保险知识讲解"}, {
            id: 7,
            name: "保险合同讲解"
        }, {id: 9, name: "条款讲解"}, {id: 11, name: "保险索赔流程讲解"}, {id: 13, name: "保险案例讲解"}, {
            id: 15,
            name: "重大案件讲解"
        }, {id: 17, name: "大面积灾害讲解"}, {id: 19, name: "座谈"}, {id: 21, name: "研讨"}, {id: 23, name: "知识竞赛"}, {
            id: 25,
            name: "问题答疑"
        }, {id: 27, name: "结束"},],
        TRAINEXECUTETYPE: [{id: 1, name: "未执行"}, {id: 2, name: "执行中"}, {id: 3, name: "已执行"}, {id: 4, name: "培训终止"},],
        TRAINTYPE: [{id: 1, name: "讲授"}, {id: 2, name: "座谈"}, {id: 3, name: "研讨"}, {id: 4, name: "技能竞赛"}, {
            id: 6,
            name: "实地讲解"
        }, {id: 5, name: "其他"},],
        TYPEBUSINESS: [{id: 1, name: "保单"}, {id: 2, name: "批单"}, {id: 3, name: "营销"},],
        AGAINTYPEBUSINESS: [{id: 1, name: "保单"}, {id: 2, name: "批单"},],
        TYPECOMPANY: [{id: 0, name: "客户"}, {id: 1, name: "保险公司"}, {id: 2, name: "合作伙伴"},],
        TYPEMONEY: [{id: 1, name: "应收保费"}, {id: 2, name: "解付保费"}, {id: 3, name: "应收佣金"}, {id: 4, name: "应收咨询费"}, {
            id: 5,
            name: "应付咨询费"
        }, {id: 6, name: "应收其它费用"}, {id: 7, name: "应收交强险佣金"}, {id: 8, name: "应收公估费"}, {id: 9, name: "应收再保险费"}, {
            id: 10,
            name: "应付再保险费"
        }, {id: 11, name: "应收分保佣金"},],
        ITEMTYPE: [{id: 3, name: "应收佣金"}, {id: 2, name: "解付保费"}, {id: 1, name: "应收保费"}, {id: 4, name: "应收咨询费"}, {
            id: 8,
            name: "应收公估费"
        }],
        URGEDTYPE: [{id: 1, name: "电话催收"}, {id: 2, name: "上门催收"},],
        VDEF10: [{id: 0, name: "统括保单"}, {id: 1, name: "分散保单"},],
        VISITPERIOD: [{id: 1, name: "年"}, {id: 2, name: "月"}, {id: 3, name: "季度"}, {id: 4, name: "半年"},],
        VISITSCOPETYPE: [{id: 1, name: "考核范围"}, {id: 2, name: "非考核范围"},],
        VISITTYPE: [{id: 1, name: "当面拜访"}, {id: 2, name: "电话"}, {id: 3, name: "信函"},],
        VSETTLE: [{id: 1, name: "已发送应收凭证"}, {id: 2, name: "已生成应收凭证"}, {id: 3, name: "已生成凭证"}, {
            id: 4,
            name: "未结算"
        }, {id: 5, name: "已到账"}, {id: 6, name: "未发送凭证"}, {id: 7, name: "已记账"}, {id: 8, name: "已发送实收凭证"},],

        BILLSTATUS: [{id: 0, name: "未提交"}, {id: 1, name: "已复核"}, {id: 2, name: "复核未通过"},
            {id: 3, name: "已作废"}, {id: 4, name: "已确认"}, {id: 5, name: "已启动"},
            {id: 6, name: "已下发"}, {id: 7, name: "已入账"}, {id: 8, name: "审核未通过"},
            {id: 9, name: "审核通过"}, {id: 10, name: "已收益入账"}, {id: 11, name: "已制单"},
            {id: 12, name: "已退回"}, {id: 13, name: "已生成指令"}, {id: 14, name: "已完毕"},
            {id: 15, name: "审批同意"}, {id: 16, name: "审批不同意"}, {id: 17, name: "处理中"},
            {id: 18, name: "指令生效"}, {id: 19, name: "处理完成"}, {id: 20, name: "初始"},
            {id: 21, name: "审核作废"}, {id: 22, name: "已处理"}, {id: 23, name: "封存"},
            {id: 24, name: "被合并"}, {id: 25, name: "未提交"}, {id: 26, name: "已复核"}, {
                id: 27, name: "复核未通过"
            }, {id: 28, name: "未完成"}, {id: 29, name: "完成待审核"},
            {id: 31, name: "未上报"}, {id: 32, name: "已上报"}, {id: 33, name: "审批中"},
            {id: 34, name: "审批通过"}, {id: 35, name: "审批不通过"}, {id: 36, name: "驳回修改"},
            {id: 37, name: "暂存"}, {id: 40, name: "提交待复核"}, {id: 41, name: "已指派"},
            {id: 42, name: "提交联合下发"}, {id: 45, name: "已完成"}, {id: 46, name: "退回修改"},
            {id: 50, name: "待审阅执行结果"}, {id: 53, name: "未打分"}, {id: 54, name: "打分完毕"},
            {id: 60, name: "数据不完整"}, {id: 61, name: "数据完整"}, {id: 70, name: "未签署"},
            {id: 71, name: "已签署"}, {id: 75, name: "未结案"}, {id: 76, name: "已结案"},
            {id: 105, name: "已汇总"}, {id: 111, name: "已生成"}, {id: 112, name: "已上报"},
            {id: 113, name: "匹配完成"},],

        BUSINESSTYPES: [{id: 1, name: "已结案"}, {id: 2, name: "已结案"}, {id: 3, name: "已结案"}, {id: 4, name: "已结案"}, {
            id: 5,
            name: "已结案"
        },],
        COSTTYPEENUM: [{id: 1, name: "差旅费"}, {id: 2, name: "办公费"}, {id: 3, name: "招待费"}, {id: 4, name: "车辆使用费"}, {
            id: 5,
            name: "会议费"
        }, {id: 6, name: "其他费用"},],
        DATARANGE: [{id: 0, name: "本人数据"}, {id: 1, name: "本部门"}, {id: 2, name: "本单位"}, {id: 3, name: "全部"},],
        DATASTATUS: [{id: 0, name: "初始化"}, {id: 1, name: "正常"}, {id: 2, name: "冻结"}, {id: 3, name: "作废"},],
        DECIMALPROCESS: [{id: 0, name: "四舍五入"}, {id: 1, name: "舍尾"}, {id: 2, name: "进位"},],
        DEPTTYPE: [{id: 1, name: "总部部门"}, {id: 2, name: "分公司"}, {id: 3, name: "控股公司"},],
        END_STATUS: [{id: 0, name: "日结"}, {id: 1, name: "初始"}, {id: 2, name: "正常"}, {id: 3, name: "日结中"},],
        FILETYPENUM: [{id: 1, name: "1"}, {id: 2, name: "2"},],
        FLAG: [{id: 0, name: "无效"}, {id: 1, name: "有效"},],
        GENDER: [{id: 0, name: "男"}, {id: 1, name: "女"},],
        GROUPTYPE: [{id: 0, name: "单据"}, {id: 1, name: "机构"}, {id: 2, name: "计划"}, {id: 3, name: "企业计划"}, {
            id: 4,
            name: "组合"
        }, {id: 5, name: "个人"}, {id: 6, name: "已下发"},],
        INSURANCELEVEL: [{id: 1, name: "集团公司"}, {id: 2, name: "总公司"}, {id: 3, name: "省级公司"}, {id: 4, name: "省级以下公司"},],
        INVEST_STATUS: [{id: 0, name: "业务正常处理中"}, {id: 1, name: "日终前备份数据库"}, {id: 2, name: "数据校验"}, {
            id: 3,
            name: "批量入账"
        }, {id: 4, name: "日终后备份数据库"}, {id: 5, name: "切换工作日"}, {id: 6, name: "批量业务处理"}, {id: 7, name: "生成报表"}, {
            id: 8,
            name: "日终处理完毕"
        }, {id: 9, name: "正在执行中"},],
        MONEYTYPE: [{id: 1, name: "应收保费"}, {id: 2, name: "解付保费"}, {id: 3, name: "应收佣金"},],
        NATURETYPES: [{id: 1, name: "公司业务"}, {id: 2, name: "市场业务"}, {id: 3, name: "协同业务"},],
        ORGTYPE: [{id: 0, name: "总部"}, {id: 1, name: "控股公司"},],
        ORG_LEVEL: [{id: 0, name: "总行"}, {id: 1, name: "一级分行"}, {id: 2, name: "二级分行"}, {id: 3, name: "支行"},],
        ORG_STATUS: [{id: 0, name: "正常"}, {id: 1, name: "已锁定"},],
        POWERALTERTYPE: [{id: 0, name: "机构权限"}, {id: 1, name: "用户权限"}, {id: 2, name: "用户组权限"}, {id: 3, name: "授权分配"},],
        POWERALTER_REASON: [{id: 0, name: "机构权限分配"}, {id: 1, name: "用户权限分配"}, {id: 2, name: "用户组权限分配"}, {
            id: 3,
            name: "授权分配"
        },],
        POWERLEVEL: [{id: 0, name: "紧急消息"}, {id: 1, name: "普通消息"},],
        SAPTYPE: [{id: 1, name: "SAP凭证正在冲销"}, {id: 2, name: "SAP凭证已冲销"}, {id: 3, name: "SAP凭证已到账"}, {
            id: 4,
            name: "已生成SAP凭证"
        }, {id: 0, name: "未知"}],
        WEBSAPTYPE: [{id: 1, name: "SAP凭证正在冲销"}, {id: 2, name: "SAP凭证已冲销"}, {id: 3, name: "SAP凭证已到账"}, {
            id: 4,
            name: "已生成SAP凭证"
        }, {id: -1, name: "未知"}],
        SYSTEM_TASK_STATUS: [{id: 0, name: "未处理"}, {id: 1, name: "正在处理中"}, {id: 2, name: "处理完成"}, {
            id: 3,
            name: "处理失败"
        },],
        TRADE_STATUS: [{id: 0, name: "待确认"}, {id: 1, name: "处理中"}, {id: 2, name: "已确认"}, {id: 3, name: "已返回"},],
        TRANSITION_TYPE: [{id: 0, name: "单签"}, {id: 1, name: "会签"}, {id: 2, name: "退回"}, {id: 3, name: "终结"}, {
            id: 4,
            name: "会签汇总"
        }, {id: 5, name: "撤销"}, {id: 6, name: "起动"}, {id: 7, name: "驳回"}, {id: 8, name: "流程汇总"}, {
            id: 9,
            name: "提交驳回人"
        }, {id: 10, name: "撤回"}, {id: 11, name: "完成"},],
        TYPECOMPANY: [{id: 1, name: "客户"}, {id: 2, name: "保险公司"},],
        UNIT: [{id: 0, name: "金额法"}, {id: 1, name: "份额法"},],
        USER_ROLE: [{id: 0, name: "系统管理员"}, {id: 1, name: "业务用户"}, {id: 2, name: "分公司用户"}, {
            id: 3,
            name: "审计管理员"
        }, {id: 4, name: "业务配置员"},],
        USER_TYPE: [{id: 0, name: "长期用户"}, {id: 1, name: "临时用户"},],
        USER_STATUS: [{id: 0, name: "启用"}, {id: 1, name: "禁用"}, {id: 2, name: "超期失效"}, {id: 3, name: "休眠"}, {
            id: 4,
            name: "冻结"
        }, {id: 5, name: "锁定"},],
        WEEKDAY: [{id: 0, name: "星期天"}, {id: 1, name: "星期一"}, {id: 2, name: "星期二"}, {id: 3, name: "星期三"}, {
            id: 4,
            name: "星期四"
        }, {id: 5, name: "星期五"}, {id: 6, name: "星期六"},],
        WORKDAY_STATUS: [{id: 0, name: "非工作日"}, {id: 1, name: "工作日"}, {id: 2, name: "当前工作日"},],
        WORKFLOW_STATUS: [{id: 0, name: "未定义"}, {id: 1, name: "已定义"}, {id: 2, name: "待修改"},],
        YESNO: [{id: 'Y', name: "是"}, {id: 'N', name: "否"},],
        YESNORELIFE: [{id: 'Y', name: "再保险业务"}, {id: 'N', name: "其他业务"},],
        YESNONUM: [{id: 0, name: "否"}, {id: 1, name: "是"},],
        YESNOBOOLEAN: [{id: false, name: "否"}, {id: true, name: "是"},],
        YESNONUMNEW: [{id: 1, name: "是"}, {id: 2, name: "否"},],
        WORKFLOW_PROCESS_STATUS: [{id: 0, name: "未处理"}, {id: 1, name: "已处理"}],

        //中英文切换
        CN_EN: [{id: 1, name: "中文"}, {id: 2, name: "English"}],
        ATTACHMENT_SOURCE: [{id: 0, name: "系统生成"}, {id: 1, name: "手动上传"}, {id: 2, name: "系统生成被修改"}, {
            id: 3,
            name: "手动上传被修改"
        }],
        INSURANCENAME: [{id: "insurancename1", name: "一级险种"}, {
            id: "insurancename2",
            name: "二级险种"
        }, {id: "insurancename3", name: "三级险种"}, {id: "deptname", name: "部门"}, {
            id: "duallevel1_name",
            name: "一级业务来源"
        }, {id: "duallevel2_name", name: "二级业务来源"}, {id: "duallevel3_name", name: "三级业务来源"}, {
            id: "insuranceman",
            name: "保险公司"
        }, {id: "insurancemantopname", name: "上级保险机构"}, {
            id: "tradetypefirstdocname",
            name: "一级行业"
        }, {id: "tradetypeseconddocname", name: "二级行业"}, {id: "estimatename", name: "投保人"}, {
            id: "insurancebillkind",
            name: "保单性质"
        }, {id: "signmode", name: "签单方式"}, {id: "month", name: "月"}],
        INSURANCEBILLKIND1: [{id: "新增", name: "新增"}, {id: "续保", name: "续保"}, {id: "扩展", name: "扩展"}],
        RECONCILIATIONTYPE: [{id: 001, name: "科目发生额"}, {id: 002, name: "科目明细"}],
        HKONT: [{id: 001, name: "经纪业务收入"}, {id: 002, name: "咨询费业务收入"}, {id: 005, name: "收其他主营收入"}, {
            id: 006,
            name: "客户资金户"
        }, {id: 007, name: "预收转收入"}],
        MONTH: [{id: "01", name: "一月"}, {id: "02", name: "二月"}, {id: "03", name: "三月"}, {
            id: "04",
            name: "四月"
        }, {id: "05", name: "五月"}, {id: "06", name: "六月"}, {id: "07", name: "七月"}, {id: "08", name: "八月"}, {
            id: "09",
            name: "九月"
        }, {id: "10", name: "十月"}, {id: "11", name: "十一月"}, {id: "12", name: "十二月"},],
        //YEAR:[{id:2007,name:"2007"},{id:2008,name:"2008"},{id:2009,name:"2009"},{id:2010,name:"2010"},{id:2011,name:"2011"},{id:2012,name:"2012"},{id:2013,name:"2013"},{id:2014,name:"2014"},{id:2015,name:"2015"},{id:2016,name:"2016"},{id:2017,name:"2017"},{id:2018,name:"2018"},{id:2019,name:"2019"}],
        VDEF11: [{id: "统括保单", name: "统括保单"}, {id: "分散保单", name: "分散保单"},],
        FILE_TYPE: [{id: 2, name: "合同信息导入"}],
        FILE_STATUS: [{id: 0, name: "待处理"}, {id: 1, name: "成功"}, {id: 2, name: "失败"}, {id: 3, name: "作废"}],
        FINDTYPE: [{id: 1, name: "场次"}, {id: 2, name: "人数"}],

        SURTYPE_SURRECORD: [{id: 1, name: "1.政策调研拜访"}, {id: 2, name: "2.市场分析拜访在京单位"}, {
            id: 3,
            name: "3.市场分析拜访非在京单位"
        }, {id: 4, name: "4.走访在京单位"}, {id: 5, name: "5.走访非在京单位"}, {id: 6, name: "6.购买政策研究资料（套数）"}, {
            id: 7,
            name: "7.购买市场分析资料(套数)"
        }, {id: 8, name: "8.建立保险经纪人招标信息资料库（个）"}, {id: 9, name: "9.建立保险产品资料库（次）"}, {id: 10, name: "10.建立保险相关信息资料库（次）"},],

        PK_CUS: {PK_CUS_DEPT: "1002AA10000000000365"},
        TRAINPLANBILLSTATUS: [{id: 0, name: "未提交"}, {id: 1, name: "已复核"}, {id: 2, name: "复核未通过"}, {
            id: 40,
            name: "提交待复核"
        }, {id: 46, name: "退回修改"}],
        OPERATE: [{id: 0, name: "新增"}, {id: 1, name: "修改"}, {id: 2, name: "删除"}, {id: 3, name: "登陆"}, {
            id: 4,
            name: "提交"
        }, {id: 5, name: "审核"}, {id: 6, name: "退回修改"}, {id: 7, name: "修改密码"}, {id: 8, name: "查询"}, {
            id: 9,
            name: "导出数据"
        }, {id: 10, name: "密码重置"}, {id: 11, name: "驳回修改"},
            {id: 12, name: "审批不通过"}, {id: 13, name: "分配角色"}, {id: 14, name: "越权"}, {id: 15, name: "告警"}, {
                id: 16,
                name: "退出"
            }],
        EVENT_TYPE: [{name: "系统事件"}, {name: "业务事件"}],
        SORT_RULE_TYPE: [{name: "时间升序"}, {name: "时间降序"}, {name: "用户名升序"}, {name: "用户名降序"}, {name: "操作类型升序"}, {name: "操作类型降序"}],
        EXERESULT_TYPE: [{name: "成功"}, {name: "失败"}],
        EXPORT_TYPE: [{id: 0, name: "EXCEL格式"}, {id: 1, name: "PDF格式"}],
        TEMPORARY_PLAN: [{id: 0, name: "电网业务"}, {id: 1, name: "电力能源业务"}, {id: 2, name: "社会市场业务"}, {
            id: 3,
            name: "互联网业务"
        }, {id: 4, name: "国际业务"}, {id: 5, name: "风险管理咨询业务"}, {id: 6, name: "市场创新业务"}, {id: 7, name: "公估业务"},],

        PAYTYPE: [{id: 1, name: "退保金"}, {id: 2, name: "保险金"},],
        AREATYPE: [{id: 1, name: "本部"}, {id: 2, name: "全部"},],
        BDTYPE: [{id: "gdzc", name: "固定资产"}, {id: "zjgc", name: "在建工程"}, {id: "cunhuo", name: "存货"}],
        CBFS: [{id: 1, name: "分区域共保"}, {id: 2, name: "不分区域共保"}, {id: 3, name: "分区域独家承保"}, {id: 4, name: "不分区域独家承保"}],
        //DWZCINSURANCETYPE:[{id:"caicyqx",name:"财产一切险"},{id:"jianzazgcyqx",name:"建筑安装工程一切险"},{id:"guzzrx",name:"雇主责任险"},{id:"jiqshx",name:"机器损坏险"},{id:"anzgcyqx",name:"安装工程一切险"},{id:"jianagcx",name:"建筑工程一切险"},{id:"gongdzrx",name:"供电责任险"},{id:"gongzzrx",name:"公众责任险"},{id:"kehxyx",name:"客户信用险"},{id:"yingyzdx",name:"营业中断险"},{id:"anqsczrx",name:"安全生产责任险"},{id:"huanjwrzrx",name:"环境污染责任保险"},{id:"chongdzzhbx",name:"充（换）电站综合保险"}],
        DWZCINSURANCETYPE: [{id: "caicyqx", name: "财产一切险"}, {id: "jianzazgcyqx", name: "建筑安装工程一切险"}, {
            id: "guzzrx",
            name: "雇主责任险"
        }, {id: "jiqshx", name: "机器损坏险"}, {id: "anzgcyqx", name: "安装工程一切险"}, {
            id: "jianagcx",
            name: "建筑工程一切险"
        }, {id: "constructionPay", name: "建设工程合同款支付保证保险"}, {id: "gongdzrx", name: "供电责任险"}, {
            id: "gongzzrx",
            name: "公众责任险"
        }, {id: "kehxyx", name: "客户信用险"}, {id: "yingyzdx", name: "营业中断险"}, {
            id: "anqsczrx",
            name: "安全生产责任险"
        }, {id: "huanjwrzrx", name: "环境污染责任保险"}, {id: "chongdzzhbx", name: "充（换）电站综合保险"}, {
            id: "canycszrbx",
            name: "餐饮场所责任保险"
        }, {id: "chuanbwrzrbx", name: "船舶污染责任保险"}, {id: "chuanbx", name: "船舶险"}, {
            id: "feijdcdszzrx",
            name: "非机动车第三者责任险"
        }, {id: "jisyqxjzrx", name: "机身一切险及责任险"}, {id: "huoyx", name: "货运险"}, {
            id: "susbqzrbx", name: "诉讼财产保全责任保险"
        }, {id: "wanglaqbx", name: "网络安全保险"}, {id: "gongysyqyjyzrbx",name: "公用事业企业经营责任保险"},{
            id: "diaozzrbx", name:  "吊装责任险"}
            // {id: "tuantywx", name: "团体人身意外伤害保险"},
        ],
        PBDSHIPIN: [{id: "jqr.mp4", name: "团体车险保单录入机器人录屏"}],
        ZBDSHIPIN: [{id: "zbd.mp4", name: "暂保单-教学视频"}],
        CDSHIPIN: [{id: "cd.mp4", name: "出单通知书-教学视频"}],
        BXFASHIPIN: [{id: "cyq.mp4", name: "财一切-教学视频"}, {id: "gg.mp4", name: "公众责任险-教学视频"}, {
            id: "gz.mp4",
            name: "雇主责任险-教学视频"
        }, {id: "jz.mp4", name: "建工安装一切险-教学视频"}],
        CDFILETYPE: [{id: "0", name: "出单通知书"}, {id: "1", name: "中标结果"}, {id: "2", name: "其它"}],
        CONTSULT_TYPE: [{id: 1, name: "业务开发咨询项目"}, {id: 2, name: "业务维护咨询项目"}, {id: 3, name: "风险管理咨询外委项目"}, {
            id: 4,
            name: "职能建设咨询项目"
        }],

        CONTSULT_PROJECT_STATUS: [{id: 1, name: "未立项"}, {id: 2, name: "项目立项"}, {id: 3, name: "合同签订"}, {
            id: 4,
            name: "项目执行"
        }, {id: 5, name: "项目验收"}, {id: 6, name: "项目储备"}, {id: 7, name: "终止"}],
        CONTSULT_ATTACHMENT: [{id: 1, name: "立项建议书"}, {id: 2, name: "费用估算表"}, {id: 3, name: "立项评审意见书扫描件"}, {
            id: 21,
            name: "费用估算表"
        }, {id: 22, name: "立项建议书"}, {id: 23, name: "立项评审意见书"}, {id: 24, name: "签报"},
            {id: 25, name: "总办会纪要"}, {id: 26, name: "立项评审意见书的电子版"}, {id: 31, name: "采购评审报告"}, {
                id: 32,
                name: "采购决策文件"
            }, {id: 33, name: "中标通知书"}, {id: 34, name: "合同扫描件"},
            {id: 40, name: "验收申请表"}, {id: 41, name: "项目成果或成效及支撑材料"}, {id: 42, name: "项目经费决算表"}, {
                id: 43,
                name: "验收意见书"
            }, {id: 44, name: "专家评审意见"},
            {id: 99, name: "其他材料"},],
        LAUNCH: [{id: 1, name: "自行开展"}, {id: 2, name: "总部管控"},],
        CHANGEBILLTYPE: [{id: "0", name: "修改金额"}, {id: "1", name: "修改保险人"}, {id: "2", name: "修改保单号"}],
        CUSTOMERTYPENEW: [{id: 1, name: "国网客户"}, {id: 2, name: "市场客户"}],
        SCHEMENAME: [{id: 1, name: "A"}, {id: 2, name: "B"}, {id: 3, name: "其它"}],
        INSURED: [{id: "高危作业人员", name: "高危作业人员"}, {id: "因公出差人员", name: "因公出差人员"}, {id: "其它", name: "其它"}],
        INSUREDTYPE: [{id: "英大人寿电力行业团体意外伤害保险", name: "英大人寿电力行业团体意外伤害保险"}, {
            id: "英大人寿附加意外伤害团体医疗保险",
            name: "英大人寿附加意外伤害团体医疗保险"
        }, {id: "英大顺和交通工具团体意外伤害保险B款", name: "英大顺和交通工具团体意外伤害保险B款"}, {id: "其它", name: "其它"}],
        INSURANCELIABILITY: [{id: 1, name: "工作原因意外伤害"}, {id: 2, name: "意外医疗责任"}, {id: 3, name: "航空意外责任"}, {
            id: 4,
            name: "轮船意外责任"
        }, {id: 5, name: "轨道交通意外责任"}, {id: 6, name: "营运汽车意外责任"}, {id: 7, name: "自驾车意外责任"}, {id: 8, name: "其他"}],
        GLIFEDWZCINSURANCETYPE: [{id: "tuantywx", name: "团体人身意外伤害保险"}],
        FILETYPE1FORPA: [{id: 1, name: "暂保单"}, {id: 2, name: "出单通知书"}, {id: 3, name: "保险方案"},{id: 4, name: "暂保申请"},{id: 5, name: "保单批改申请书"},{id: 6, name: "保险单"}],
        FILETYPE1: [{id: 1, name: "客户告知书"}, {id: 2, name: "保险方案确认函"}, {id: 3, name: "保险到期提示函"}, {id: 4, name: "中标通知书"},{id: 5, name: "暂保申请"},{id: 6, name: "保单批改申请书"},{id: 7, name: "保险单"},{id:8,name:"账单"}],
        FILETYPE2: [{id: 1, name: "保险公司结算单"}, {id: 2, name: "业务收入确认书"}, {id: 3, name: "发票开具申请单"}, {id: 4,name: "发票扫描件"},{id: 5,name: "保费缴纳通知书"},{id: 6,name: "资金到账通知书"}],
        FILETYPE3: [{id: 1, name: "领取报酬情况表"}, {id: 2, name: "其他附件"}, {id: 3, name: "装盒照片"}, {id: 4, name: "保险公司合作谈判文件"},{id: 5, name: "风险合规会审查材料"}],
        FILETYPE4: [{id: 1, name: "经纪业务委托合同"}, {id: 2, name: "经纪业务合作协议"}, {id: 3, name: "经纪业务三方协议"},],
        RELATIONCONTRACTTYPE: [{id: "其他类", name: "其他类"}, {id: "全部", name: "全部"},],
        ZYZTYPE: [{id: 1, name: "保险经纪从业人员执业证书"}, {id: 2, name: "保险中介从业人员继续教育培训证书"}, {
            id: 3,
            name: "保险公估从业人员资格证书"
        }, {id: 4, name: "保险从业资格证书"}, {id: 5, name: "中国寿险理财规划师"},],
        PROJECTINFORMATIONSTATETYPE: [{id: 1, name: "服务中"}, {id: 2, name: "终止"}, {id: 3, name: "待更新"}],
        ENUMTRAINTYPE: [{id: 1, name: "现场培训"}, {id: 2, name: "网络培训"}],
        ENUMTRAINMODELTYPE:[{id:1,name:"集中培训"},{id:2,name:"点对点培训"}],
        WORKRECORDKIND: [{id: 1, name: "现场勘察"}, {id: 2, name: "出险通知书"}, {id: 3, name: "支付赔款"}, {
            id: 4,
            name: "谈判"
        }, {id: 5, name: "其他"}, {id: 6, name: "撤案"}, {id: 7, name: "结案"}],
        WORKRECORDKINDSHOW: [{id: 0, name: "服务中"}, {id: 6, name: "撤案"}, {id: 7, name: "结案"}],
        SERVICETYPEFILE: [{id: 1, name: "手册宣传"}, {id: 2, name: "邮件或通知"}, {id: 3, name: "照片"}, {
            id: 4,
            name: "报告"
        }, {id: 5, name: "风险提示函"}, {id: 6, name: "其他"}],
        SERVICETYPE: [{id: 1, name: "手册宣传"}, {id: 2, name: "风险预警"}, {id: 3, name: "隐患排查"}, {
            id: 4,
            name: "防灾演练"
        }, {id: 5, name: "其他"}],
        LOCALIZEDTRAINTRANSLATEFILETYPE: [{id: 1, name: "工作计划"}, {id: 2, name: "培训签到表"}, {
            id: 3,
            name: "培训反馈意见表"
        }, {id: 4, name: "培训课件"}, {id: 5, name: "培训照片"}, {id: 6, name: "培训通知"}],
        CASERECORDTYPE: [{id: 1, name: "现场勘查记录"}, {id: 2, name: "出险通知书"}, {id: 3, name: "谈判纪要"}, {
            id: 4,
            name: "赔款协议"
        }, {id: 5, name: "支付赔款凭证"}, {id: 6, name: "其他"}],
        PRINTlIST: [{id: 1, name: "培训服务"}, {id: 2, name: "日常咨询"}, {id: 3, name: "保单维护"}, {id: 4, name: "防灾防损"}, {
            id: 5,
            name: "协助索赔"
        }],
        LOSSOCCURREDREASONSHORTHAND: [{id: 1, name: "雷击"}, {id: 2, name: "暴雨"}, {id: 3, name: "洪水"}, {
            id: 4,
            name: "暴风"
        }, {id: 5, name: "龙卷风"}, {id: 6, name: "冰雹"}, {id: 7, name: "台风"}, {id: 8, name: "飓风"}, {
            id: 9,
            name: "沙尘暴"
        }, {id: 10, name: "暴雪"}, {id: 11, name: "冰凌"}, {id: 12, name: "突发性滑坡"}, {id: 13, name: "崩塌"}, {
            id: 14,
            name: "泥石流"
        }, {id: 15, name: "地面突然下沉下陷"}, {id: 16, name: "地震"}, {id: 17, name: "海啸"}, {id: 18, name: "其他自然灾害"}, {
            id: 19,
            name: "火灾"
        }, {id: 20, name: "爆炸"}, {id: 21, name: "盗窃抢劫"}, {id: 22, name: "其他意外事故"}],
        COMMISSIONINQUIRYCONDITIONS: [{id: 0, name: "全部"}, {id: 1, name: "佣金收入<=10万元项目"}, {
            id: 2,
            name: "10万元项目<佣金收入<=20万元项目"
        }, {id: 3, name: "20万元项目<佣金收入<=30万元项目"}, {id: 4, name: "佣金收入>30万元项目"}],
        SELECTPROJECTINFORMATIONSTATETYPE: [{id: 1, name: "服务中"}, {id: 2, name: "终止"}],
        ALLMONTH: [{id: "01", name: "01"}, {id: "02", name: "02"}, {id: "03", name: "03"}, {
            id: "04",
            name: "04"
        }, {id: "05", name: "05"}, {id: "06", name: "06"}, {id: "07", name: "07"}, {id: "08", name: "08"}, {
            id: "09",
            name: "09"
        }, {id: "10", name: "10"}, {id: "11", name: "11"}, {id: "12", name: "12"}],
        REINSURANCEFILETYPE1: [{id: 1, name: "再保险方案"}, {id: 2, name: "再保账单"}, {id: 3, name: "业务立项批复单"}],
        REINSURANCEFILETYPE2: [{id: 1, name: "代收代付保费通知书"}, {id: 2, name: "代收代付赔款"}, {id: 3, name: "业务收入确认书"}, {id: 4,name: "发票开具申请单"}, {id: 5, name: "发票扫描件"},{id: 6, name: "资金到账通知书"}],
        REINSURANCEFILETYPE3: [{id: 1, name: "经纪业务合作协议"}, {id: 2, name: "经纪业务三方协议"}],
        REINSURANCEFILETYPE4: [{id: 1, name: "其他档案"}, {id: 2, name: "分保协议"}, {id: 3, name: "领取报酬情况表"}],
        MATCHINGSTATE: [{id: "0", name: "匹配完成"}, {id: "1", name: "匹配中"}, {id: "2", name: "未匹配"}],
        TRANSACTIONTYPE: [{id: "0", name: "佣金"}, {id: "1", name: "保费"}],
        REVISETYPE: [{id: 1, name: "修改数据"}, {id: 2, name: "数据作废"}],
        CORRECTINGREASONSTYPE_1: [{id: 8, name: "保费变更"}, {id: 3, name: "保险期间延长"}, {id: 4, name: "退保"}, {
            id: 7,
            name: "其它"
        }],
        CORRECTINGREASONSTYPE_2: [{id: 1, name: "发票冲销"}, {id: 2, name: "保单录入错误"}, {id: 6, name: "汇率变更"}, {
            id: 9,
            name: "尾差调整"
        }],
        PAYTYPES: [{id: 'alipayAcc', name: "支付宝支付"}, {id: 'unionPay', name: "云闪付支付"}, {id: 'weichatAcc', name: "微信支付"}],
        CONSULTFILETYPE1: [{id: 1, name: "业务收入确认书"}, {id: 2, name: "发票开具申请单"}, {id: 3, name: "发票扫描件"}, {
            id: 4,
            name: "资金到账通知书"
        }],
        CONSULTFILETYPE2: [{id: 1, name: "咨询合同"}],
        CONSULTFILETYPE3: [{id: 1, name: "咨询附件"}],
        CONSULTFILETYPE4: [{id: 1, name: "其他档案"}, {id: 2, name: "咨询成果"}, {id: 3, name: "领取报酬情况表"}, {
            id: 4,
            name: "业务立项签报及批复"
        }],
        CLEARINGDOUCUMENTTYPE: [{id: 0, name: "三方协议"}, {id: 1, name: "支付代收保费通知书"}],
        STAFFTYPE: [{id: 1, name: "在职"}, {id: 2, name: "离职"}],
        TYPEOFCONTRACT: [{id: 1, name: "合同信息"}, {id: 2, name: "财务信息"}, {id: 3, name: "其他"}],
        CLEARING_STATUS: [{id: "1", name: "待结算"}, {id: "2", name: "结算中"}, {id: "3", name: "结算完成"}],
        WITHDRAWAL_STATUS: [{id: "1", name: "待提现"}, {id: "3", name: "提现完成"}],
        BUSI_NAME: [{id: "订单", name: "订单"}, {id: "在线充值", name: "在线充值"}, {id: "线下充值", name: "线下充值"}, {
            id: "线下提现",
            name: "线下提现"
        }],
        SYSTEM_TYPE: [{id: "tra", name: "疗休养"}, {id: "caej", name: "长安一家"}],
        PRODUCT_NAME: [{id: "投标", name: "投标保证保险"}, {id: "履约", name: "履约保证保险"}],
        // ACCOUNTTYPE: [{id: '1', name: "佣金账户"}, {id: '2', name: "保费账户"}, {id: '3', name: "资金归集账户"}, {id: '4', name: "内部封闭结算账户"}, {id: '5', name: "保费专户"}],
        ACCOUNTTYPE: [{id: 1, name: "佣金账户"}, {id: 2, name: "保费账户"}, {id: 5, name: "保费专户"}, {id: 7, name: "基本账户"}, {id: 8, name: "美元账户"}],
        PINSURANCEFILETYPE1: [{id: 1, name: "保险公司结算单"}, {id: 2, name: "业务收入确认书"}, {id: 3, name: "发票开具申请单"}, {id: 4,name: "发票扫描件"}, {id: 5,name: "保费缴纳通知书"},{id: 6,name: "资金到账通知书"}],
        PINSURANCEFILETYPE2: [{id: 1, name: "保险公司合作协议"}],
        PINSURANCEFILETYPE3: [{id: 1, name: "领取报酬情况表"}, {id: 2, name: "其他档案"}, {id: 3, name: "装盒照片"}, {id: 4,name: "客户授权委托书"}],
        OUTSIDECHECH: [{id: 1, name: "一致"}, {id: 2, name: "不一致"}],
        ACCOUNTTYPESUB: [{id: 1, name: "佣金账户"}, {id: 7, name: "基本账户"}],
        ACCOUNTTYPESUB_AGAIN: [{id: 1, name: "佣金账户"}, {id: 7, name: "基本账户"}, {id: 8, name: "美元账户"}],
        PRODUCTTYPE: [{id: 1, name: "惠民保"}, {id: 2, name: "疗休养"}, {id: 3, name: "钱包"}, {id: 4, name: "投标履约"}, {
            id: 5,
            name: "长安一家"
        }],
        WEB_DATA_TYPE: [{id: 0, name: "保单"}, {id: 1, name: "批单"},],
        SUBSCRIPTIONTYPE: [{id: 1, name: "保费类型"}, {id: 2, name: "疗休养保费类型"}],
        TAX_RATE: [{id: 0.06, name: "6%"}, {id: 0.03, name: "3%"}, {id: 0.01, name: "1%"}],
        ORDER_BUSI_TYPE: [{id: 1, name: "订单"}, {id: 2, name: "充值"}, {id: 3, name: "提现"}, {id: 4, name: "退保"}, {
            id: 5,
            name: "划拨"
        }, {id: 6, name: "退款"}],
        PAYMODE: [{id: 1, name: "支付宝支付"}, {id: 2, name: "微信支付"}, {id: 3, name: "银联支付"}, {id: 4, name: "余额支付"}, {
            id: 5,
            name: "线下支付"
        }],
        ENDORSEMENTTYPE: [{id: 1, name: "互联网批单"}, {id: 2, name: "疗休养批单"}],
        CURRENCY: [{id: "CNY", name: "人民币 (CNY)"},{id: "USD", name: "美元 (USD)"},
            {id: "EUR", name: "欧元 (EUR)"},{id: "AUD", name: "澳元 (AUD)"},
            {id: "GBP", name: "英镑 (GBP)"}, {id: "CAD", name: "加元 (CAD)"},
            {id: "JPY", name: "日元 (JPY)"},{id: "CHF", name: "瑞士法郎 (CHF)"},
            {id: "NZD", name: "纽西兰元 (NZD)"},
            {id: "PKR", name: "巴基斯坦卢比 (PKR)"},{id: "BRL", name: "巴西雷亚尔 (BRL)"},
            {id: "HKD", name: "港币 (HKD)"}],
        CURRENCYCLEAR: [{id: "CNY", name: "人民币 (CNY)"},{id: "USD", name: "美元 (USD)"}],
        INTERNETCUSTOMERTYPE: [{id: 1, name: "渠道业务"}, {id: 2, name: "团体法人"}, {id: 3, name: "个人业务"}],
        INTERNETCUSTOMERTYPE_T: [{id: 1, name: "渠道业务"}, {id: 2, name: "团体法人"}],
        INTERNETCUSTOMERTYPE_G: [{id: 3, name: "个人业务"}],
        RECHARGETYPE: [{id: 1, name: "线上"}, {id: 2, name: "线下"}],
        CLEARINGAUDITSOURCETYPE: [{id: 1, name: "经纪业务"}, {id: 2, name: "互联网业务"}],
        AGENTTYPE: [{id: 1, name: "公司内部人员"}, {id: 2, name: "代理制业务人员"}, {id: 3, name: "劳务派遣人员"}],
        AGENTTYPE_Y: [{id: 1, name: "公司内部人员"}],
        AGENTTYPE_N: [{id: 2, name: "代理制业务人员"}, {id: 3, name: "劳务派遣人员"}],
        REWARDPUNISHMENTTYPE: [{id: 1, name: "奖励"}, {id: 2, name: "惩罚"}],
        YESNO_ANY: [{id: '1', name: "是"}, {id: '2', name: "否"}, {id: '3', name: "不限"},],
        INSURANCE_STATUS: [{id: '1', name: "保单有效"}, {id: '2', name: "保单终止"},],
        PERSONNELRELATIONS:[{id:1,name:"本人"},{id:2,name:"配偶"},{id:3,name:"父子"},{id:4,name:"父女"},{id:5,name:"母子"},{id:6,name:"母女"},{id:7,name:"其他"}],
        BENEFICIARYTYPE:[{id:1,name:"法定受益人"},{id:2,name:"指定受益人"}],
        STAFFCONTRACTTYPE:[{id:1,name:"代理合同"},{id:2,name:"非全日制用工"},{id:3,name:"劳动合同"},{id:4,name:"劳务派遣"}],
        DATASTATETYPE:[{id:1,name:"生效中"},{id:2,name:"已失效"},{id:3,name:"已过期"}],
        AGENTFILETYPE:[{id:1,name:"岗前考试记录"},{id:2,name:"代理解除协议"},{id:3,name:"其它说明文件"},{id:4,name:"签署版合同"}],
        INSURANCE_TYPE:[{id:1,name:"财产险"},{id:2,name:"人身险"},{id:3,name:"车险"}],
        ENCOAGREEMENTFILETYPE:[{id:1,name:"签署版合同"},{id:2,name:"其它说明文件"}],
        TRAGREEMENTFILETYPE:[{id:1,name:"签署版合同"},{id:2,name:"其它说明文件"},{id:3,name:"合同流转单"},{id:4,name:"三方协议"}],
        INTERNETQUERYTYPE:[{id:"tra",name:"疗休养"},{id:2,name:"亿家保"},{id:3,name:"自营个险"},{id:"caej",name:"投标保证保险"},{id:5,name:"电维保"},{id:"hmb",name:"惠民保"}],
        CUSTOMERAGREEMENTTYPE: [{id: 1, name: "国网客户"}, {id: 2, name: "市场客户"}, {id: 3, name: "保险公司"}, {id: 4, name: "中介公司"}, {id: 5, name: "其他合作公司"}],
        PRODUCTDATAFILETYPE: [{id: 1, name: "保险经纪委托协议"}, {id: 2, name: "客户告知书"}, {id: 3, name: "投保人声明"},{id:4,name:"保险条款"},{id:5,name:"其他"}],
        PRODUCTDATABILLSTATUSTYPE: [{id: 1, name: "未生效"}, {id: 2, name: "生效中"}, {id: 3, name: "已失效"}],
        DWBSFILETYPE: [{id: 1, name: "外部要求"}, {id: 2, name: "报送文件"}],
        ACCTYPE: [{id: 2, name: "保费户"}, {id: 3, name: "佣金户"}],
        CUSTOMERSERVICETYPE: [{id: 1, name: "客户服务计划表"}, {id: 2, name: "客户服务工作报告"}, {id: 3, name: "客户培训资料"},{id: 4, name: "协助索赔资料"}],
        LOCALIZEDPERSONTYPE: [{id: 1, name: "项目联系人"}, {id: 2, name: "中建联系人"}, {id: 3, name: "保险公司联系人"}],
        LOCALIZEDBILLSTATUS: [{id: 34, name: "生效"}, {id: 37, name: "暂存"}],
        BILLCHECKBYSELFSTATETYPE: [{id: 0, name: "待自查"}, {id: 1, name: "自查通过"}, {id: 2, name: "自查不通过"}],
};

