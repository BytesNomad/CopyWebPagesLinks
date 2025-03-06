// 创建右键菜单的函数
function createContextMenus() {
  // 使用Promise包装确保执行顺序
  return new Promise((resolve) => {
    chrome.contextMenus.removeAll(resolve);
  }).then(() => {
    // 创建页面右键菜单
    chrome.contextMenus.create({
      id: "copyPageLinks",
      title: chrome.i18n.getMessage("copyLinks"),
      contexts: ["page"],
      documentUrlPatterns: ["<all_urls>"]
    });

    // 创建链接右键菜单
    chrome.contextMenus.create({
      id: "copySelectedLink",
      title: chrome.i18n.getMessage("copySelectedLink"),
      contexts: ["link"],
      documentUrlPatterns: ["<all_urls>"]
    });
  }).catch((error) => {
    console.error('菜单创建失败:', error);
  });
}

// 在扩展安装或更新时初始化
chrome.runtime.onInstalled.addListener(() => {

  // 设置默认的过滤规则
  chrome.storage.sync.get('filterRules', (data) => {
    const defaultRules = {
      'bilibili.com': ['com/video/'],
      'youtube.com': ['watch?v=']
    };
    
    // 如果还没有设置过规则，则使用默认规则
    if (!data.filterRules) {
      chrome.storage.sync.set({ filterRules: defaultRules }, () => {
        console.log('已设置默认过滤规则');
      });
    }
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "copyPageLinks") {
    console.log('页面右键菜单被点击');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "copyLinks" }, function(response) {
        console.log('消息已发送到content script');
      });
    });
  } else if (info.menuItemId === "copySelectedLink") {
    console.log('链接右键菜单被点击');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "copySelectedLink", linkUrl: info.linkUrl }, function(response) {
        console.log('消息已发送到content script');
      });
    });
  }
});

// 在扩展启动时创建右键菜单
createContextMenus();

console.log('background script 已加载');
