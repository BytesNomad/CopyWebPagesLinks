chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request);
  if (request.action === "copyLinks") {
    const currentDomain = window.location.hostname;
    console.log('当前域名:', currentDomain);
    
    chrome.storage.sync.get('filterRules', (data) => {
      const rules = data.filterRules || {};
      console.log('获取到的规则:', rules);
      
      // 获取所有链接并去重
      let links = Array.from(new Set(Array.from(document.links).map(link => link.href)));

      // 应用所有匹配当前域名的过滤规则
      const domainRules = Object.entries(rules)
        .filter(([domain]) => currentDomain.includes(domain))
        .map(([_, rule]) => rule);
      
      console.log('当前域名的所有过滤规则:', domainRules);
      
      // 如果存在过滤规则，则应用过滤
      if (domainRules.length > 0) {
        links = links.filter(href => {
          // 只要满足任一规则即可保留该链接
          return domainRules.some(rule => href.includes(rule));
        });
        console.log('过滤后的链接:', links);
      }

      if (links.length === 0) {
        showNotification(chrome.i18n.getMessage('noLinksFound'), 'error');
        return;
      }

      const text = links.join('\n');
      navigator.clipboard.writeText(text).then(() => {
        showNotification(chrome.i18n.getMessage('copySuccess', [links.length]), 'success');
      }).catch(err => {
        console.error('复制错误:', err);
        showNotification(chrome.i18n.getMessage('copyError', [err]), 'error');
      });
    });
  }
  return true;
});

// 创建通知样式
const style = document.createElement('style');
style.textContent = `
  .custom-notification {
    position: fixed;
    left: 50%;
    top: 20px;
    transform: translateX(-50%);
    padding: 16px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    z-index: 10000;
    opacity: 0;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .custom-notification.show {
    opacity: 1;
  }
  .custom-notification.success {
    background-color: #52c41a;
  }
  .custom-notification.error {
    background-color: #ff4d4f;
  }
`;
document.head.appendChild(style);

// 显示通知的函数
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `custom-notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  // 触发动画
  setTimeout(() => notification.classList.add('show'), 10);

  // 3秒后移除通知
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// 添加初始化日志
console.log('content script 已加载');