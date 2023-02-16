/**
 * 生成随机的盐值方法
 * @returns 返回随机的16位盐值
 */
function generateSalt(){
	  var s= '';
	  var randomchar=function(){
	   var n= Math.floor(Math.random()*62);
	   if(n<10) return n; 
	   if(n<36) return String.fromCharCode(n+55);
	   return String.fromCharCode(n+61); 
	  }
	  while(s.length< 16) s+= randomchar();
	  return s;
}

/**
 * 进行国密SM3加盐摘要
 * @param plainText 需要加密数据
 * @param salt 盐值(不传入该参数的情况下默认使用generateSalt()函数生成盐值)
 * @returns 返回加盐后的摘要数据
 */
function SM3Encrypt(plainText,salt){
	if(undefined == salt){
	  salt = generateSalt()
	}
	return SG_sm3encrypt(plainText+','+salt)
}

/**
 * 采用SM4的EBC模式加密口令/数据和盐；
 * @param plainText 需要加密的数据
 * @param key 加密使用的密钥
 * @param salt 加密的盐值(不传入该参数的情况下默认使用generateSalt()函数生成盐值)
 * @returns 返回加密后的数据
 */
function SM4Encrypt(plainText,key,salt)
{
	if(undefined == salt){
		salt = generateSalt()
	}
	return SG_sm4encrypt(plainText+','+salt+SG_sm3encrypt(plainText+','+salt),key)
}

/**
 * 采用SM2公钥数据对数据进行加密，返回加密的字符串
 * @param plainText 需要加密的数据
 * @param salt 盐值(不传入该参数的情况下默认使用generateSalt()函数生成盐值)
 * @param pubKey 国密SM2算法的公钥
 * @returns 返回加密的数据
 */
function SM2Encrypt(plainText,salt)
{
    var pubKey = '047097a1ece104af026b37e5b469f794f5dc5aa3853892e046dc76fa195face55bd0a2670aa22aa34661044614440fbb44f45a6d3852cf6fa2b622f5df7254272d';
	if(undefined == salt){
		salt = generateSalt();
	}
	return SG_sm2Encrypt(plainText+','+salt+SG_sm3encrypt(plainText+','+salt), pubKey);
}

function SM2EncryptOnlinePreview(plainText,salt)
{
	var pubKey = '04856c127a7d321143814a652603c56d9ac127f0b598d7248a3c7de54d32349873ca0c7de7867bbcd9c7c81d2449a678f765a3611e59e56336c0ba8415497ffbff';
	if(undefined == salt){
		salt = generateSalt()
	}
	return SG_sm2Encrypt(plainText+','+salt+SG_sm3encrypt(plainText+','+salt), pubKey)
}

function SM2Decrypt(plainText)
{
	var pri = 'ae6ed4830189ccb74ce3a72d0ad8e0427c42c1b1548b5a8bd16838498937866d';
	return SG_sm2Decrypt(plainText, pri);
}

