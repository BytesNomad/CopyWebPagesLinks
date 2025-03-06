// 初始化UI文本
function initializeI18n() {
  document.getElementById('configTitle').textContent = chrome.i18n.getMessage('configTitle');
  document.getElementById('domain').placeholder = chrome.i18n.getMessage('domainPlaceholder');
  document.getElementById('filterInput').placeholder = chrome.i18n.getMessage('filterRulePlaceholder');
  document.getElementById('saveRule').textContent = chrome.i18n.getMessage('addRule');
}

let currentFilters = new Set();

function updateFilterTags() {
  const container = document.getElementById('filterTags');
  container.innerHTML = '';
  currentFilters.forEach(filter => {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `
      ${filter}
      <span onclick="removeFilter('${filter}')">&times;</span>
    `;
    container.appendChild(tag);
  });
}

function removeFilter(filter) {
  currentFilters.delete(filter);
  updateFilterTags();
}

function addFilter(filter) {
  if (filter && !currentFilters.has(filter)) {
    currentFilters.add(filter);
    updateFilterTags();
  }
}

function displaySavedRules(rules) {
  const container = document.getElementById('rulesList');
  container.innerHTML = '';
  
  Object.entries(rules).forEach(([domain, filters]) => {
    const ruleDiv = document.createElement('div');
    ruleDiv.className = 'rule-container';
    ruleDiv.innerHTML = `
      <div class="rule-header">
        <strong>${domain}</strong>
        <button class="btn btn-danger" onclick="deleteRule('${domain}')">${chrome.i18n.getMessage('deleteRule')}</button>
      </div>
      <div class="filter-items">
        ${filters.map(f => `<div class="filter-tag">${f}</div>`).join('')}
      </div>
    `;
    container.appendChild(ruleDiv);
  });
}

function deleteRule(domain) {
  chrome.storage.sync.get('filterRules', (data) => {
    const rules = data.filterRules || {};
    delete rules[domain];
    chrome.storage.sync.set({ filterRules: rules }, () => {
      displaySavedRules(rules);
    });
  });
}

document.getElementById('filterInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && e.target.value.trim()) {
    addFilter(e.target.value.trim());
    e.target.value = '';
  }
});

document.getElementById('saveRule').addEventListener('click', () => {
  const domain = document.getElementById('domain').value.trim();
  
  if (!domain || currentFilters.size === 0) {
    alert(chrome.i18n.getMessage('validationError'));
    return;
  }

  chrome.storage.sync.get('filterRules', (data) => {
    const rules = data.filterRules || {};
    rules[domain] = Array.from(currentFilters);
    
    chrome.storage.sync.set({ filterRules: rules }, () => {
      alert(chrome.i18n.getMessage('saveSuccess'));
      displaySavedRules(rules);
      // 清空输入
      document.getElementById('domain').value = '';
      currentFilters.clear();
      updateFilterTags();
    });
  });
});

// 初始化多语言支持
initializeI18n();

// 初始加载已保存的规则
chrome.storage.sync.get('filterRules', (data) => {
  displaySavedRules(data.filterRules || {});
});