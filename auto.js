# [rewrite_local]
# 加藤视频VIP解锁脚本（自动获取配置）
^https?:\/\/.*\/shorter\/anime\/tbookchapter0\/info\?bookId.* url script-request-header auto_fetch_vip_unlock.js
^https?:\/\/.*\/shorter\/(video\/longvideoinfo|resource\/adInfoPageList\?adSpaceId|user\/getUser|resource\/getWindowNotice|tabIconConfigView|user\/getVipPvg|video\/home|video\/search).* url script-response-body auto_fetch_vip_unlock.js

# [mitm]
hostname = 5jsd6q7.jnfkdtm.xyz,yw4pk9h.7fw2snb.xyz,m3pkeg2.v4l0p7y.xyz,ip6vu33.im0684h.xyz,bor4lch.8l6ldmz.xyz,zqlhcn.kl9117.xyz,hkg2zx.stejnu.xyz,zvqldx.xv8gvn.xyz,kuhikr.1t3vwf.xyz,s4788x.taqndh.xyz,xkewutdekf873sr.chairsr.com,103.85.254.233,omfnmh.x2b3w6.xyz,sgwitxgwit231sr.xunwxc.com,ssgwew231s.uzqew4qi.info,ykofye.qklmoq.xyz,pmmqls.gregdoro.com,rdxijq.vo9ugl.xyz,bpitbu.ouxf9g.live,tjactb.xk2nsy.live,us6tp7.dkr9cv.live,qsukip.9jts57.live,wkqyx6.qdokqj.live,fqohbx.bkljtx.live,zihjyv.jajrc1.live,y7uyqg.hl8dbl.live,qrdure.youngnoble.cn,kpoe2e.x8w7t3.live,fceyeg.johjxe.com,*.vo9ugl.xyz,bsxqtd.xk8q7w.xyz,grvgdq.81fbg2.xyz,vcryyw.uc86fy.xyz,xospby.mldo9k.xyz,roa6fi.lyr6if.live,gp1wpm.xcg3zr.xyz,nfmq0v.lknlqz.xyz,nhppjkb.z5x6pzr.xyz,fwroeor.revxcvx.xyz,uetuys234ls.pbog5txn.app,hrp27mr.1ugq1uf.xyz,zd7uwox.8ewxvhz.xyz,lieeys42jdi2kd.cx4c5mv7.info,fjboni.jn6588.xyz,rylzit.wqws5z.xyz,riwnkx.sw05uv.xyz,bsxqtd.xk8q7w.xyz,grvgdq.81fbg2.xyz,Lieeys42jdi2kd.cx4c5mv7.info,pmmqls.gregdoro.com,103.85.254.233,omfnmh.x2b3w6.xyz,rdxijq.vo9ugl.xyz,bpitbu.ouxf9g.live,tjactb.xk2nsy.live,us6tp7.dkr9cv.live

/*
 * auto_fetch_vip_unlock.js
 * 脚本功能：自动获取配置并执行视频VIP解锁、付费视频解锁、下载、会员线路、去广告
 * 支持：Quantumult X、Surge/Loon、Shadowrocket 模块
 * 配置项保存在脚本环境的持久存储（Quantumult X 使用 $prefs，Surge/Loon/Shadowrocket 使用 $persistentStore 或 $environment）
 */

// ======= 工具函数：统一获取配置 =======
function getConfig(key) {
  // Quantumult X
  if (typeof $prefs !== 'undefined') {
    return $prefs.valueForKey(key) || '';
  }
  // Surge、Loon、Shadowrocket
  if (typeof $persistentStore !== 'undefined') {
    return $persistentStore.read(key) || '';
  }
  // Shadowrocket 环境变量
  if (typeof $environment !== 'undefined') {
    if (typeof $environment.valueForKey === 'function') {
      return $environment.valueForKey(key) || '';
    }
    return $environment[key] || '';
  }
  return '';
}

// ======= 工具函数：统一存储配置（仅 Surge/Loon/Shadowrocket 支持） =======
function setConfig(key, value) {
  if (typeof $persistentStore !== 'undefined') {
    $persistentStore.write(value, key);
  }
}

// ======= 获取鉴权信息 =======
function getAuth() {
  return {
    userId: getConfig('jtsp_userId'),
    accessToken: getConfig('jtsp_accessToken'),
    device: getConfig('jtsp_device') || 'iPhone12,1'
  };
}

// ======= 请求阶段：补全参数 =======
if (typeof $request !== 'undefined' && typeof $response === 'undefined') {
  const url = $request.url;
  if (/\/shorter\/anime\/tbookchapter0\/info\?bookId/.test(url)) {
    const auth = getAuth();
    const newUrl = url
      .replace(/([?&]userId=)\d*/, `$1${auth.userId}`)
      .replace(/([?&]accessToken=)\w*/, `$1${auth.accessToken}`)
      .replace(/([?&]device=[^&]*)/, `$1${auth.device}`);
    $done({ url: newUrl });
    return;
  }
  $done({});
  return;
}

// ======= 响应阶段：解锁与去广告 =======
if (typeof $response !== 'undefined') {
  const url = $request.url;
  let body = $response.body;
  let obj;
  try {
    obj = JSON.parse(body);
  } catch (e) {
    $done({ body });
    return;
  }

  // 1. 广告拦截
  if (/(getAdInfoBySpaceId|bySpaceId|game\/moreList|adInfoPageList)/.test(url)) {
    $done({ body: '{}' });
    return;
  }

  // 2. 视频列表与搜索
  if (/\/shorter\/video\/(home|search)/.test(url)) {
    const list = obj.data?.list;
    if (Array.isArray(list)) {
      list.forEach(item => {
        item.isPurchase = 1;
        item.userVip = 2;
        item.trySeeSecond = 0;
      });
    }
    $done({ body: JSON.stringify(obj) });
    return;
  }

  // 3. 单视频详情
  if (/\/shorter\/video\/longvideoinfo/.test(url)) {
    const videos = obj.data?.sections?.[0]?.videos || [];
    videos.forEach(v => {
      v.isPurchase = 1;
      v.userVip = 2;
      if (v.trySeeSecond !== undefined) v.trySeeSecond = 0;
      if (Array.isArray(v.videoUrls)) {
        v.videoUrls = v.videoUrls.map(u => u.replace(/try\.m3u8/, '.m3u8'));
      }
    });
    $done({ body: JSON.stringify(obj) });
    return;
  }

  // 4. 用户 VIP 信息
  if (/\/shorter\/user\/(getVipPvg|getUser)/.test(url)) {
    if (obj.data) {
      obj.data.vipLevel = 2;
      obj.data.vipExpire = '2099-12-31T23:59:59Z';
    }
    $done({ body: JSON.stringify(obj) });
    return;
  }

  // 默认返回原始数据
  $done({ body });
}
