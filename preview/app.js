'use strict';

const readinessItems = [
  'Scope approved',
  'Community roles assigned',
  'Viva Engage and chat channels ready',
  'Interaction model and cadence agreed',
  'Readiness plan agreed',
  'Health baseline captured'
];

const data = {
  communities: [
    {
      key: 'azure-platform',
      title: 'Azure Platform',
      serviceFamily: 'Azure',
      scopeInScope: 'Azure infrastructure, landing zones, resilience, and platform engineering.',
      scopeOutOfScope: 'Application architecture and data platform implementation.',
      targetRoles: ['Community Lead', 'Family Owner (SME)', 'Invited Expert'],
      status: 'Active',
      crossCommunity: false
    },
    {
      key: 'data-ai',
      title: 'Data & AI',
      serviceFamily: 'Data & AI',
      scopeInScope: 'Analytics, data platforms, machine learning, and responsible AI delivery.',
      scopeOutOfScope: 'Core infrastructure operations and end-user productivity.',
      targetRoles: ['Community Lead', 'Family Owner (SME)', 'Invited Expert'],
      status: 'Active',
      crossCommunity: false
    },
    {
      key: 'cross-training',
      title: 'Cross-community Exchange',
      serviceFamily: 'Cross-community',
      scopeInScope: 'Cross-pollination, reusable IP, and shared readiness across technical communities.',
      scopeOutOfScope: 'Domain-specific governance owned by an individual community.',
      targetRoles: ['Invited Expert'],
      status: 'Active',
      crossCommunity: true
    }
  ],
  roles: [
    { communityKey: 'azure-platform', name: 'Alex Morgan', role: 'Community Lead', zone: 'AMER' },
    { communityKey: 'azure-platform', name: 'Priya Shah', role: 'Family Owner (SME)', zone: 'EMEA' },
    { communityKey: 'azure-platform', name: 'Kenji Sato', role: 'Family Owner (SME)', zone: 'APAC' },
    { communityKey: 'data-ai', name: 'Nora Mensah', role: 'Community Lead', zone: 'EMEA' },
    { communityKey: 'data-ai', name: 'Taylor Reed', role: 'Family Owner (SME)', zone: 'AMER' },
    { communityKey: 'cross-training', name: 'Marisol Vega', role: 'Community Lead', zone: 'AMER' }
  ],
  ipCatalog: [
    {
      title: 'Landing zone review checklist',
      communityKey: 'azure-platform',
      description: 'Reusable review prompts for platform governance and operational readiness.'
    },
    {
      title: 'Responsible AI delivery canvas',
      communityKey: 'data-ai',
      description: 'A shared canvas for risk, evaluation, and operational readiness.'
    }
  ],
  metrics: {
    'azure-platform': {
      Participation: [45, 58], Contribution: [32, 41], Responsiveness: [18, 12],
      'Knowledge reuse': [28, 39], Belonging: [68, 74], 'Cross-pollination': [16, 24]
    },
    'data-ai': {
      Participation: [51, 64], Contribution: [39, 52], Responsiveness: [20, 14],
      'Knowledge reuse': [34, 47], Belonging: [72, 77], 'Cross-pollination': [21, 31]
    },
    'cross-training': {
      Participation: [30, 43], Contribution: [24, 33], Responsiveness: [26, 19],
      'Knowledge reuse': [46, 59], Belonging: [63, 70], 'Cross-pollination': [38, 55]
    }
  },
  retirements: [
    { title: 'Legacy Azure delivery DL', disposition: 'Migrate', target: 'azure-platform', completed: false },
    { title: 'AI practitioner chat', disposition: 'Merge', target: 'data-ai', completed: true },
    { title: 'Platform office hours channel', disposition: 'Close', target: 'azure-platform', completed: false },
    { title: 'Cross-solution readiness forum', disposition: 'Merge', target: 'cross-training', completed: true }
  ]
};

const charter = {
  status: 'Draft',
  interactionModel: 'Monthly community session, weekly asynchronous exchange, and scheduled office hours.',
  cadence: 'Monthly session; weekly office hours',
  readinessPlan: 'Maintain role-based readiness paths and publish reusable delivery IP each quarter.',
  version: '1.0',
  readiness: new Set(['Scope approved', 'Community roles assigned']),
  signatures: { Lead: false, 'Program Manager': false, 'Family Owner': false }
};

const state = {
  view: 'directory',
  selectedCommunity: 'azure-platform',
  joined: new Set(['azure-platform']),
  search: '',
  family: '',
  role: '',
  period: 'Q2 FY27',
  disposition: ''
};

const app = document.getElementById('app');
const toast = document.getElementById('toast');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function communityByKey(key) {
  return data.communities.find((community) => community.key === key) || data.communities[0];
}

function notify(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => { toast.hidden = true; }, 2600);
}

function pageHeader(title, subtitle, aside = '') {
  return `
    <header class="page-header">
      <div>
        <div class="eyebrow">SSD Technical Communities</div>
        <h1>${escapeHtml(title)}</h1>
        <p class="subtitle">${escapeHtml(subtitle)}</p>
      </div>
      ${aside}
    </header>`;
}

function renderDirectory() {
  const families = [...new Set(data.communities.map((item) => item.serviceFamily))];
  const roles = [...new Set(data.communities.flatMap((item) => item.targetRoles))];
  const search = state.search.trim().toLowerCase();
  const visible = data.communities.filter((community) => {
    const haystack = `${community.title} ${community.serviceFamily} ${community.scopeInScope}`.toLowerCase();
    return (!search || haystack.includes(search)) &&
      (!state.family || community.serviceFamily === state.family) &&
      (!state.role || community.targetRoles.includes(state.role));
  });

  app.innerHTML = pageHeader('Technical communities', 'Find the community aligned to your work, scope, and role.') + `
    <div class="controls" role="search">
      <div class="field">
        <label for="search">Search</label>
        <input id="search" type="search" value="${escapeHtml(state.search)}" placeholder="Community or scope">
      </div>
      <div class="field">
        <label for="family">Service family</label>
        <select id="family">
          <option value="">All service families</option>
          ${families.map((value) => `<option ${state.family === value ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label for="role">Target role</label>
        <select id="role">
          <option value="">All target roles</option>
          ${roles.map((value) => `<option ${state.role === value ? 'selected' : ''}>${escapeHtml(value)}</option>`).join('')}
        </select>
      </div>
    </div>
    ${visible.length ? `<div class="cards">${visible.map((community) => `
      <article class="card">
        <div class="card-body">
          <span class="muted">${escapeHtml(community.serviceFamily)}</span>
          <h2 class="card-title">${escapeHtml(community.title)}</h2>
          <p class="card-copy">${escapeHtml(community.scopeInScope)}</p>
          <div class="card-footer">
            <span class="badge">${escapeHtml(community.status)}</span>
            <button class="button-secondary" type="button" data-open-community="${community.key}">View community</button>
          </div>
        </div>
      </article>`).join('')}</div>` : '<div class="surface empty">No communities match the current filters.</div>'}`;

  document.getElementById('search').addEventListener('input', (event) => {
    state.search = event.target.value;
    renderDirectory();
    document.getElementById('search').focus();
  });
  document.getElementById('family').addEventListener('change', (event) => {
    state.family = event.target.value;
    renderDirectory();
  });
  document.getElementById('role').addEventListener('change', (event) => {
    state.role = event.target.value;
    renderDirectory();
  });
}

function renderDetail() {
  const community = communityByKey(state.selectedCommunity);
  const roles = data.roles.filter((role) => role.communityKey === community.key);
  const ips = data.ipCatalog.filter((item) => item.communityKey === community.key);
  const joined = state.joined.has(community.key);
  app.innerHTML = pageHeader(
    community.title,
    'Scope, named roles, reusable IP, and community channels.',
    `<span class="badge">${community.status}</span>`
  ) + `
    <section class="section">
      <h2>Scope</h2>
      <div class="two-column">
        <div class="surface"><h3>In scope</h3><p class="muted">${escapeHtml(community.scopeInScope)}</p></div>
        <div class="surface"><h3>Out of scope</h3><p class="muted">${escapeHtml(community.scopeOutOfScope)}</p></div>
      </div>
    </section>
    <section class="section">
      <h2>Community roles</h2>
      <div class="surface">
        ${roles.length ? `<ul class="role-list">${roles.map((role) => `
          <li><strong>${escapeHtml(role.name)}</strong><span>${escapeHtml(role.role)}</span><span class="muted">${escapeHtml(role.zone)}</span></li>`).join('')}</ul>` : '<p class="muted">No role holders are recorded.</p>'}
      </div>
    </section>
    <section class="section">
      <h2>Owned IP</h2>
      <div class="surface">
        ${ips.length ? `<ul class="plain-list">${ips.map((item) => `<li><strong>${escapeHtml(item.title)}</strong><div class="muted">${escapeHtml(item.description)}</div></li>`).join('')}</ul>` : '<p class="muted">No owned IP is recorded.</p>'}
      </div>
    </section>
    <section class="section">
      <h2>Community channels</h2>
      <div class="surface button-row">
        <button class="button-secondary" type="button" data-action="engage">Open Viva Engage</button>
        ${joined
          ? '<span class="badge green">You are a member</span><button class="button-secondary" type="button" data-action="chat">Open support chat</button>'
          : '<button class="button" type="button" data-action="join">Join community</button>'}
      </div>
    </section>`;
}

function renderMine() {
  const communities = data.communities.filter((community) => state.joined.has(community.key));
  app.innerHTML = pageHeader('My communities', 'Your memberships and direct links to community channels.') + `
    <div class="profile-band">
      <span class="avatar">AM</span>
      <div><strong>Alex Morgan</strong><div class="muted">Cloud Solution Architect</div></div>
    </div>
    ${communities.length ? `<div class="cards">${communities.map((community) => `
      <article class="card">
        <div class="card-body">
          <span class="muted">${escapeHtml(community.serviceFamily)}</span>
          <h2 class="card-title">${escapeHtml(community.title)}</h2>
          <p class="card-copy">${escapeHtml(community.scopeInScope)}</p>
          <div class="card-footer">
            <span class="badge green">Member</span>
            <button class="button-secondary" type="button" data-open-community="${community.key}">Open</button>
          </div>
        </div>
      </article>`).join('')}</div>` : '<div class="surface empty">No community memberships found.</div>'}`;
}

function renderCharter() {
  const community = communityByKey(state.selectedCommunity);
  const allSigned = Object.values(charter.signatures).every(Boolean);
  if (allSigned && charter.status === 'In review') charter.status = 'Signed off';
  const readOnly = charter.status === 'Signed off';
  app.innerHTML = pageHeader(
    'Community charter',
    `${community.title} working model, launch readiness, and three-way sign-off.`,
    `<span class="badge ${readOnly ? 'green' : ''}">${charter.status}</span>`
  ) + `
    <div class="charter-layout">
      <form id="charter-form" class="form-stack">
        <section class="surface"><h3>I. Community</h3><strong>${escapeHtml(community.title)}</strong><div class="muted">${escapeHtml(community.serviceFamily)}</div></section>
        <section class="surface"><h3>II. Scope</h3><p class="muted">${escapeHtml(community.scopeInScope)}</p></section>
        <section class="surface field"><label for="interaction">III. Interaction model</label><textarea id="interaction" ${readOnly ? 'disabled' : ''}>${escapeHtml(charter.interactionModel)}</textarea></section>
        <section class="surface field"><label for="cadence">IV. Cadence and office hours</label><input id="cadence" value="${escapeHtml(charter.cadence)}" ${readOnly ? 'disabled' : ''}></section>
        <section class="surface field"><label for="plan">V. Readiness plan</label><textarea id="plan" ${readOnly ? 'disabled' : ''}>${escapeHtml(charter.readinessPlan)}</textarea></section>
        <section class="surface">
          <h3>VII. Workflow</h3>
          <div class="two-column">
            <div class="field"><label>Status</label><input value="${charter.status}" disabled></div>
            <div class="field"><label for="version">Charter version</label><input id="version" value="${escapeHtml(charter.version)}" ${readOnly ? 'disabled' : ''}></div>
          </div>
        </section>
        <section class="surface">
          <h3>VIII. Sign-offs</h3>
          <div class="signatures">
            ${Object.entries(charter.signatures).map(([role, signed]) => `
              <div class="signature">
                <strong>${escapeHtml(role)}</strong>
                <span class="muted">${signed ? 'Alex Morgan · 6 Aug 2026' : 'Not signed'}</span>
                ${charter.status === 'In review' && !signed ? `<button class="button-secondary" type="button" data-sign="${escapeHtml(role)}">Sign</button>` : ''}
              </div>`).join('')}
          </div>
        </section>
        <section class="surface"><h3>IX. Audit record</h3><span class="muted">Last modified 6 Aug 2026 · Alex Morgan</span></section>
        ${readOnly ? '' : `<div class="button-row">
          <button class="button-secondary" type="submit">Save draft</button>
          ${charter.status === 'Draft' ? '<button class="button" type="button" data-action="submit-charter">Submit for review</button>' : '<button class="button-secondary" type="button" data-action="request-changes">Request changes</button>'}
        </div>`}
      </form>
      <aside class="surface checklist">
        <h3>VI. Launch readiness</h3>
        ${readinessItems.map((item) => `<label class="check"><input type="checkbox" value="${escapeHtml(item)}" ${charter.readiness.has(item) ? 'checked' : ''} ${readOnly ? 'disabled' : ''}><span>${escapeHtml(item)}</span></label>`).join('')}
      </aside>
    </div>`;
}

function renderHealth() {
  const measures = Object.keys(data.metrics['azure-platform']);
  const periodIndex = state.period === 'Baseline' ? 0 : 1;
  app.innerHTML = pageHeader('Community health', 'Six governance measures compared with each community launch baseline.') + `
    <div class="controls" style="grid-template-columns:minmax(180px,280px)">
      <div class="field"><label for="period">Reporting period</label><select id="period"><option ${state.period === 'Baseline' ? 'selected' : ''}>Baseline</option><option ${state.period === 'Q2 FY27' ? 'selected' : ''}>Q2 FY27</option></select></div>
    </div>
    ${data.communities.map((community) => `
      <section class="section">
        <h2>${escapeHtml(community.title)}</h2>
        <div class="metric-grid">
          ${measures.map((measure) => {
            const values = data.metrics[community.key][measure];
            const current = values[periodIndex];
            const delta = current - values[0];
            const lowerIsBetter = measure === 'Responsiveness';
            const favorable = lowerIsBetter ? delta < 0 : delta > 0;
            return `<article class="metric" tabindex="0">
              <span class="muted">${escapeHtml(measure)}</span>
              <div class="metric-value">${current}${measure === 'Responsiveness' ? 'h' : '%'}</div>
              <div class="muted">Baseline: ${values[0]}</div>
              <div class="${delta === 0 ? 'muted' : favorable ? 'delta-up' : 'delta-down'}">Change: ${delta > 0 ? '+' : ''}${delta}</div>
            </article>`;
          }).join('')}
        </div>
      </section>`).join('')}`;
  document.getElementById('period').addEventListener('change', (event) => {
    state.period = event.target.value;
    renderHealth();
  });
}

function renderRetirement() {
  const visible = data.retirements.filter((item) => !state.disposition || item.disposition === state.disposition);
  const completed = data.retirements.filter((item) => item.completed).length;
  const ratio = completed / data.retirements.length;
  app.innerHTML = pageHeader('Forum retirement register', 'Track migration, merge, and closure of legacy forums and channels.') + `
    <div class="progress-band">
      <div><div class="progress-value">${completed} / ${data.retirements.length}</div><span class="muted">Forums completed</span></div>
      <div><div class="progress-track"><span style="width:${ratio * 100}%"></span></div><div class="muted" style="margin-top:6px">${Math.round(ratio * 100)}%</div></div>
    </div>
    <div class="register-toolbar">
      <div class="field" style="min-width:220px"><label for="disposition">Disposition</label><select id="disposition"><option value="">All dispositions</option>${['Migrate', 'Merge', 'Close'].map((value) => `<option ${state.disposition === value ? 'selected' : ''}>${value}</option>`).join('')}</select></div>
      <button class="button" type="button" data-action="add-forum">Add forum</button>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Forum</th><th>Disposition</th><th>Target community</th><th>State</th><th></th></tr></thead>
      <tbody>${visible.map((item) => `<tr>
        <td>${escapeHtml(item.title)}</td>
        <td>${escapeHtml(item.disposition)}</td>
        <td>${escapeHtml(communityByKey(item.target).title)}</td>
        <td><span class="badge ${item.completed ? 'green' : 'warning'}">${item.completed ? 'Completed' : 'Pending'}</span></td>
        <td><button class="button-secondary" type="button" data-toggle-retirement="${escapeHtml(item.title)}">${item.completed ? 'Reopen' : 'Complete'}</button></td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  document.getElementById('disposition').addEventListener('change', (event) => {
    state.disposition = event.target.value;
    renderRetirement();
  });
}

const renderers = {
  directory: renderDirectory,
  detail: renderDetail,
  mine: renderMine,
  charter: renderCharter,
  health: renderHealth,
  retirement: renderRetirement
};

function render() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === state.view);
    if (button.dataset.view === state.view) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  renderers[state.view]();
}

document.addEventListener('click', (event) => {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) {
    state.view = viewButton.dataset.view;
    render();
    app.focus();
    return;
  }

  const communityButton = event.target.closest('[data-open-community]');
  if (communityButton) {
    state.selectedCommunity = communityButton.dataset.openCommunity;
    state.view = 'detail';
    render();
    app.focus();
    return;
  }

  const actionButton = event.target.closest('[data-action]');
  if (actionButton) {
    const action = actionButton.dataset.action;
    if (action === 'join') {
      state.joined.add(state.selectedCommunity);
      notify(`Joined ${communityByKey(state.selectedCommunity).title}`);
      renderDetail();
    } else if (action === 'engage') {
      notify('Viva Engage link opened in the deployed portal.');
    } else if (action === 'chat') {
      notify('Support chat link opened in the deployed portal.');
    } else if (action === 'submit-charter') {
      charter.status = 'In review';
      notify('Charter submitted for review.');
      renderCharter();
    } else if (action === 'request-changes') {
      charter.status = 'Draft';
      Object.keys(charter.signatures).forEach((role) => { charter.signatures[role] = false; });
      notify('Charter returned to Draft.');
      renderCharter();
    } else if (action === 'add-forum') {
      data.retirements.push({ title: `Legacy forum ${data.retirements.length + 1}`, disposition: 'Migrate', target: state.selectedCommunity, completed: false });
      notify('Forum added to the register.');
      renderRetirement();
    }
    return;
  }

  const signButton = event.target.closest('[data-sign]');
  if (signButton) {
    charter.signatures[signButton.dataset.sign] = true;
    notify(`${signButton.dataset.sign} sign-off recorded.`);
    renderCharter();
    return;
  }

  const retirementButton = event.target.closest('[data-toggle-retirement]');
  if (retirementButton) {
    const item = data.retirements.find((candidate) => candidate.title === retirementButton.dataset.toggleRetirement);
    item.completed = !item.completed;
    notify(item.completed ? 'Forum marked complete.' : 'Forum reopened.');
    renderRetirement();
  }
});

document.addEventListener('submit', (event) => {
  if (event.target.id !== 'charter-form') return;
  event.preventDefault();
  charter.interactionModel = document.getElementById('interaction').value;
  charter.cadence = document.getElementById('cadence').value;
  charter.readinessPlan = document.getElementById('plan').value;
  charter.version = document.getElementById('version').value;
  charter.readiness = new Set([...document.querySelectorAll('.check input:checked')].map((input) => input.value));
  notify('Charter draft saved.');
});

render();