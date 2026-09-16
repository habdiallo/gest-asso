const fs = require('node:fs');

const endpoint = process.argv[2] || 'http://127.0.0.1:9333';
const targetUrl = `file://${process.cwd()}/index.html`;

async function main() {
  const targets = await fetch(`${endpoint}/json/list`).then((response) => response.json());
  const target = targets.find((item) => item.type === 'page' && item.url === 'about:blank') || targets.find((item) => item.type === 'page');
  if (!target) throw new Error('Aucune page Chrome disponible.');

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  const pending = new Map();
  let sequence = 0;
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  };
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });

  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });

  await command('Page.enable');
  await command('Runtime.enable');
  await command('Emulation.setDeviceMetricsOverride', {
    width: 440,
    height: 956,
    deviceScaleFactor: 2,
    mobile: true,
    screenWidth: 440,
    screenHeight: 956,
  });
  await command('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await command('Page.navigate', { url: `${targetUrl}#dashboard` });
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const screens = [
    ['dashboard'], ['members'], ['member'], ['campaigns'],
    ['campaign', 'members'], ['campaign', 'categories'], ['campaign', 'payments'],
    ['payments'], ['pots'], ['pot'], ['users'], ['categories'], ['account'],
    ['member-form'], ['campaign-form'], ['campaign-amounts'], ['payment-form'],
    ['pot-form'], ['contribution-form'], ['operator'], ['category-form'],
  ];
  const results = [];
  for (const [route, tab] of screens) {
    const expression = `(() => {
      state.modalRoute = null;
      state.route = ${JSON.stringify(route)};
      if (${JSON.stringify(Boolean(tab))}) state.campaignTab = ${JSON.stringify(tab || 'members')};
      render();
      const visible = [...document.querySelectorAll('body *')].filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.position !== 'fixed' &&
          (rect.left < -1 || rect.right > innerWidth + 1);
      }).map((element) => {
        const rect = element.getBoundingClientRect();
        return { tag: element.tagName, className: element.className?.toString().slice(0, 80), left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) };
      }).slice(0, 12);
      return { route: ${JSON.stringify(route)}, tab: ${JSON.stringify(tab || '')}, innerWidth, documentWidth: document.documentElement.scrollWidth, overflow: visible };
    })()`;
    const evaluated = await command('Runtime.evaluate', { expression, returnByValue: true });
    results.push(evaluated.result.value);
  }

  await command('Runtime.evaluate', { expression: 'state.route="dashboard";state.modalRoute=null;render()' });
  const dashboard = await command('Page.captureScreenshot', { format: 'png', fromSurface: true });
  fs.writeFileSync('/tmp/contribo-440-dashboard.png', Buffer.from(dashboard.data, 'base64'));
  await command('Runtime.evaluate', { expression: 'state.route="campaign";state.campaignTab="members";render()' });
  const campaign = await command('Page.captureScreenshot', { format: 'png', fromSurface: true });
  fs.writeFileSync('/tmp/contribo-440-campaign.png', Buffer.from(campaign.data, 'base64'));

  const selectRoutes = ['dashboard', 'member-form', 'campaign-form', 'payment-form', 'pot-form', 'contribution-form', 'operator'];
  for (const route of selectRoutes) {
    const evaluated = await command('Runtime.evaluate', {
      expression: `(async () => {
        state.modalRoute = null; state.route = ${JSON.stringify(route)}; render();
        const audits = [];
        for (const trigger of document.querySelectorAll('[data-select-trigger]')) {
          trigger.scrollIntoView({ block: 'center' });
          toggleCustomSelect(trigger);
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          const menu = trigger.closest('[data-custom-select]').querySelector('.select-menu');
          const t = trigger.getBoundingClientRect(); const m = menu.getBoundingClientRect();
          audits.push({
            label: trigger.getAttribute('aria-label'),
            direction: trigger.closest('[data-custom-select]').classList.contains('open-up') ? 'up' : 'down',
            aligned: Math.abs(t.left - m.left) <= 1 && Math.abs(t.right - m.right) <= 1,
            insideViewport: m.left >= -1 && m.right <= innerWidth + 1 && m.top >= -1 && m.bottom <= innerHeight + 1,
            trigger: { left: Math.round(t.left), right: Math.round(t.right), top: Math.round(t.top), bottom: Math.round(t.bottom) },
            menu: { left: Math.round(m.left), right: Math.round(m.right), top: Math.round(m.top), bottom: Math.round(m.bottom) }
          });
          closeCustomSelects();
        }
        return { route: ${JSON.stringify(route)}, selects: audits };
      })()`,
      awaitPromise: true,
      returnByValue: true,
    });
    results.push(evaluated.result.value);
  }

  const scopeChange = await command('Runtime.evaluate', {
    expression: `(() => {
      state.route = 'dashboard'; state.dashboardCampaignScope = 'Toutes les campagnes ouvertes'; state.dashboardPotScope = 'Mariage de Fanta & Sékou'; render();
      return {
        campaign: document.querySelector('[data-dashboard-scope="campaign"] .select-value')?.textContent,
        pot: document.querySelector('[data-dashboard-scope="pot"] .select-value')?.textContent,
        values: [...document.querySelectorAll('.stat-value')].map(node => node.textContent),
        scopes: [...document.querySelectorAll('.stat-scope')].map(node => node.textContent)
      };
    })()`,
    returnByValue: true,
  });
  results.push({ route: 'dashboard-scope-change', ...scopeChange.result.value });

  await command('Runtime.evaluate', {
    expression: `(async () => {
      state.theme = 'light'; document.documentElement.dataset.theme = 'light';
      state.modalRoute = null; state.route = 'payment-form'; render();
      const trigger = [...document.querySelectorAll('[data-select-trigger]')].at(-1);
      const initial = trigger.getBoundingClientRect();
      window.scrollTo(0, Math.max(0, window.scrollY + initial.top - 770));
      await new Promise(resolve => requestAnimationFrame(resolve));
      toggleCustomSelect(trigger);
      await new Promise(resolve => setTimeout(resolve, 220));
    })()`,
    awaitPromise: true,
  });
  const select = await command('Page.captureScreenshot', { format: 'png', fromSurface: true });
  fs.writeFileSync('/tmp/contribo-440-select.png', Buffer.from(select.data, 'base64'));

  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false, screenWidth: 1440, screenHeight: 900 });
  await command('Runtime.evaluate', { expression: `state.theme='light';state.route='dashboard';state.modalRoute=null;state.dashboardCampaignScope='Solidarité septembre';state.dashboardPotScope='Toutes les cagnottes ouvertes';document.documentElement.dataset.theme='light';render();scrollTo(0,0)` });
  await new Promise((resolve) => setTimeout(resolve, 180));
  const desktop = await command('Page.captureScreenshot', { format: 'png', fromSurface: true });
  fs.writeFileSync('/tmp/contribo-dashboard-desktop.png', Buffer.from(desktop.data, 'base64'));
  await command('Runtime.evaluate', { expression: 'scrollTo(0,document.documentElement.scrollHeight)' });
  await new Promise((resolve) => setTimeout(resolve, 120));
  const desktopLower = await command('Page.captureScreenshot', { format: 'png', fromSurface: true });
  fs.writeFileSync('/tmp/contribo-dashboard-desktop-lower.png', Buffer.from(desktopLower.data, 'base64'));

  console.log(JSON.stringify(results, null, 2));
  socket.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
