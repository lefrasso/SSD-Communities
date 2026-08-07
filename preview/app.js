'use strict';

const playbook = window.SSD_PLAYBOOK;
const readinessItems = playbook.readinessItems;

function sampleMetrics(index) {
  return {
    Participation: [38 + index * 2, 50 + index * 2],
    Contribution: [27 + index * 2, 36 + index * 2],
    Responsiveness: [24 - index, 17 - Math.floor(index / 2)],
    'Knowledge reuse': [30 + index * 2, 41 + index * 2],
    Belonging: [64 + index, 70 + index],
    'Cross-pollination': [16 + index * 2, 24 + index * 3]
  };
}

const data = {
  communities: playbook.communities,
  roles: playbook.communities.flatMap((community) => [
    { communityKey: community.key, name: 'Community Lead', role: '1 accountable position', status: 'Nomination required' },
    { communityKey: community.key, name: 'Subject Matter Expert', role: '1–5 positions, based on community needs', status: 'Nomination required' }
  ]),
  ipCatalog: playbook.communities.flatMap((community) => community.alignedIps.map((title) => ({
    title,
    communityKey: community.key,
    description: community.crossCommunity
      ? 'Common capability or reusable core curated across all domain communities.'
      : 'Delivery IP aligned to this community and reviewed at each quarterly checkpoint.'
  }))),
  metrics: Object.fromEntries(playbook.communities.map((community, index) => [community.key, sampleMetrics(index)]))
};

const charter = {
  status: 'Draft',
  interactionModel: 'Monthly community session, weekly asynchronous exchange, and scheduled office hours.',
  cadence: 'Monthly session; weekly office hours',
  readinessPlan: 'Maintain role-based readiness paths and publish reusable delivery IP each quarter.',
  version: '1.0',
  readiness: new Set([
    'Theme and scope are approved, with overlap reviewed',
    'Community Lead and one to five Subject Matter Experts are nominated'
  ]),
  signatures: { 'Community Lead': false, 'Program Manager': false, 'Subject Matter Expert': false }
};

const state = {
  view: 'overview',
  selectedCommunity: 'azure',
  joined: new Set(['azure']),
  search: '',
  family: '',
  role: '',
  period: 'Q2 FY27'
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

function renderBulletList(items, className = 'content-list') {
  return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderOverview() {
  const meta = playbook.meta;
  app.innerHTML = `
    <section class="programme-hero">
      <div class="hero-copy">
        <div class="eyebrow">${escapeHtml(meta.organisation)} · ${escapeHtml(meta.fiscalYear)}</div>
        <h1>${escapeHtml(meta.title)}</h1>
        <p>${escapeHtml(playbook.vision)}</p>
        <div class="hero-meta">
          <span><strong>Executive Sponsor</strong>${escapeHtml(meta.executiveSponsor)}</span>
          <span><strong>Version</strong>${escapeHtml(meta.version)}</span>
          <span><strong>Status</strong>${escapeHtml(meta.status)}</span>
        </div>
      </div>
      <div class="portfolio-mark" aria-label="Eight communities: six domain communities plus Cross-Training and internal AI readiness">
        <strong>${playbook.communities.length}</strong>
        <span>governed communities</span>
        <small>6 domain + 2 cross-community</small>
      </div>
    </section>

    <section class="section intro-grid">
      <div>
        <div class="section-kicker">Purpose</div>
        <h2>Why this initiative exists</h2>
        <p class="lead-copy">${escapeHtml(playbook.purpose.summary)}</p>
        <p class="muted">${escapeHtml(playbook.purpose.context)}</p>
        <div class="button-row">
          <button class="button" type="button" data-view="portfolio">Explore the portfolio</button>
          <button class="button-secondary" type="button" data-view="activation">Review the launch model</button>
        </div>
      </div>
      <aside class="principle-panel">
        <div class="section-kicker">Definition</div>
        <h3>A community is voluntary and peer-led</h3>
        <p>${escapeHtml(playbook.communityDefinition)}</p>
      </aside>
    </section>

    <section class="section">
      <div class="section-heading">
        <div><div class="section-kicker">Four objectives</div><h2>What success must achieve</h2></div>
        <p>Every activity and measure should trace back to one of these outcomes.</p>
      </div>
      <div class="objective-grid">
        ${playbook.objectives.map((objective, index) => `
          <article class="objective">
            <span class="number-mark">0${index + 1}</span>
            <h3>${escapeHtml(objective.title)}</h3>
            <p>${escapeHtml(objective.description)}</p>
            <div class="proof-line"><strong>Evidence</strong>${escapeHtml(objective.signal)}</div>
          </article>`).join('')}
      </div>
    </section>

    <section class="section two-column scope-grid">
      <div class="surface">
        <div class="section-kicker">Included</div>
        <h3>What the playbook governs</h3>
        ${renderBulletList(playbook.purpose.inScope)}
      </div>
      <div class="surface boundary-panel">
        <div class="section-kicker">Boundaries</div>
        <h3>What remains outside the initiative</h3>
        ${renderBulletList(playbook.purpose.outOfScope)}
      </div>
    </section>

    <section class="section">
      <div class="section-heading">
        <div><div class="section-kicker">Delivery approach</div><h2>Four mechanics make the model operational</h2></div>
      </div>
      <div class="mechanics-grid">
        ${playbook.deliveryMechanics.map((mechanic, index) => `
          <article class="mechanic">
            <span>${index + 1}</span>
            <div><h3>${escapeHtml(mechanic.title)}</h3><p>${escapeHtml(mechanic.description)}</p></div>
          </article>`).join('')}
      </div>
    </section>

    <section class="leadership-band">
      <div>
        <div class="section-kicker">Standing Leadership Team asks</div>
        <h2>Three decisions unlock the programme</h2>
      </div>
      <ol>${playbook.leadershipAsks.map((ask) => `<li>${escapeHtml(ask)}</li>`).join('')}</ol>
    </section>`;
}

function renderPortfolio() {
  const domainCommunities = playbook.communities.filter((community) => !community.crossCommunity);
  const crossCommunities = playbook.communities.filter((community) => community.crossCommunity);
  app.innerHTML = pageHeader(
    'Community portfolio',
    'Six delivery-aligned domain communities supported by Cross-Training and an internal AI readiness community.'
  ) + `
    <section class="portfolio-architecture" aria-label="Community portfolio structure">
      <div class="domain-row">
        ${domainCommunities.map((community) => `
          <button type="button" data-open-community="${community.key}">
            <strong>${escapeHtml(community.title)}</strong>
            <span>${escapeHtml(community.summary)}</span>
          </button>`).join('')}
      </div>
      <div class="connector" aria-hidden="true"></div>
      <div class="cross-row">
        ${crossCommunities.map((community) => `
          <button class="cross-community" type="button" data-open-community="${community.key}">
            <span class="badge green">${community.internalOnly ? 'Internal readiness' : 'Connective tissue'}</span>
            <strong>${escapeHtml(community.title)}</strong>
            <span>${escapeHtml(community.areas.join(' · '))}</span>
          </button>`).join('')}
      </div>
    </section>

    <section class="section">
      <div class="section-heading">
        <div><div class="section-kicker">Eight-community model</div><h2>Clear domains, explicit boundaries</h2></div>
        <p>Each vertical deepens expertise; Cross-Training spreads delivery practice; AI drives internal readiness without offering ownership.</p>
      </div>
      <div class="portfolio-grid">
        ${playbook.communities.map((community) => `
          <article class="portfolio-card ${community.crossCommunity ? 'cross' : ''}">
            <div class="portfolio-card-head">
              <div><span>${escapeHtml(community.category)}</span><h3>${escapeHtml(community.title)}</h3></div>
              <span class="badge">${community.alignedIps.length ? `${community.alignedIps.length} aligned IPs` : 'No offerings aligned'}</span>
            </div>
            <p>${escapeHtml(community.summary)}</p>
            ${community.areas ? `<div class="tag-row">${community.areas.map((area) => `<span>${escapeHtml(area)}</span>`).join('')}</div>` : ''}
            <button class="text-action" type="button" data-open-community="${community.key}">View scope and ownership →</button>
          </article>`).join('')}
      </div>
    </section>

    <section class="section">
      <div class="section-heading">
        <div><div class="section-kicker">IP alignment</div><h2>Focused ownership with reusable common cores</h2></div>
      </div>
      <div class="callout"><strong>Build once, share everywhere.</strong><span>${escapeHtml(playbook.sharedIpPrinciple)}</span></div>
      <div class="table-wrap ip-table"><table>
        <thead><tr><th>Community</th><th>Aligned delivery IP</th><th>Ownership model</th></tr></thead>
        <tbody>${playbook.communities.map((community) => `<tr>
          <td><strong>${escapeHtml(community.title)}</strong><div class="muted">${escapeHtml(community.category)}</div></td>
          <td>${community.alignedIps.length ? `<div class="tag-row">${community.alignedIps.map((ip) => `<span>${escapeHtml(ip)}</span>`).join('')}</div>` : '<span class="no-offerings">No offerings aligned</span>'}</td>
          <td>${community.internalOnly ? 'Internal AI readiness; no offering ownership' : community.key === 'cross-training' ? 'Delivery Excellence; no offering ownership' : 'Domain-specific ownership and variant'}</td>
        </tr>`).join('')}</tbody>
      </table></div>
    </section>`;
}

function renderOperating() {
  app.innerHTML = pageHeader(
    'Roles and governance',
    'Lightweight accountability that keeps eight communities connected without turning them into another reporting structure.'
  ) + `
    <section class="section">
      <div class="section-heading">
        <div><div class="section-kicker">Accountability model</div><h2>Ownership before tooling</h2></div>
        <p>Communities fail more often from absent ownership than from absent technology.</p>
      </div>
      <div class="role-grid">
        ${playbook.roles.map((role) => `
          <article class="role-card">
            <div class="role-card-head"><span>${escapeHtml(role.scope)}</span><h3>${escapeHtml(role.title)}</h3></div>
            <p class="role-holder">${escapeHtml(role.holder)}</p>
            ${renderBulletList(role.accountabilities)}
          </article>`).join('')}
      </div>
    </section>

    <section class="focus-band">
      <div class="focus-number">1</div>
      <div><div class="section-kicker">Single-community principle</div><h2>Depth of contribution over breadth of enrolment</h2><p>${escapeHtml(playbook.singleCommunityPrinciple)}</p></div>
    </section>

    <section class="section">
      <div class="section-heading">
        <div><div class="section-kicker">Channel governance</div><h2>Three surfaces, three distinct jobs</h2></div>
      </div>
      <div class="channel-grid">
        ${playbook.channels.map((channel) => `
          <article class="channel">
            <h3>${escapeHtml(channel.title)}</h3>
            <strong>${escapeHtml(channel.rule)}</strong>
            <p>${escapeHtml(channel.content)}</p>
          </article>`).join('')}
      </div>
    </section>

    <section class="section two-column">
      <div class="surface">
        <div class="section-kicker">Autonomy inside guardrails</div>
        <h3>Decisions each community owns</h3>
        ${renderBulletList(playbook.communityOwnedDecisions)}
      </div>
      <div class="decision-test">
        <div class="section-kicker">Governance test</div>
        <blockquote>${escapeHtml(playbook.governanceTest)}</blockquote>
      </div>
    </section>`;
}

function renderActivation() {
  app.innerHTML = pageHeader(
    'Launch and rhythm of business',
    'Seed communities at birth, prove value in the first interaction, and build trust through a reliable cadence.'
  ) + `
    <section class="section">
      <div class="section-heading">
        <div><div class="section-kicker">Activation model</div><h2>Four stages from intent to sustained practice</h2></div>
        <p>Activation runs in parallel with the portal build so community success never depends on platform timing.</p>
      </div>
      <ol class="stage-flow">
        ${playbook.launchStages.map((stage) => `<li>
          <span>${stage.number}</span>
          <div><h3>${escapeHtml(stage.title)}</h3><p>${escapeHtml(stage.description)}</p></div>
        </li>`).join('')}
      </ol>
    </section>

    <section class="section activation-grid">
      <div class="surface readiness-panel">
        <div class="section-kicker">Launch gate</div>
        <h2>Minimum readiness before a community opens</h2>
        <ul class="readiness-list">${readinessItems.map((item, index) => `<li><span>${index + 1}</span>${escapeHtml(item)}</li>`).join('')}</ul>
        <button class="button" type="button" data-view="charter">Open Charter Editor</button>
      </div>
      <aside class="critical-mass">
        <div class="section-kicker">Critical mass check</div>
        <h3>Do not launch an empty room</h3>
        <p>${escapeHtml(playbook.criticalMass)}</p>
      </aside>
    </section>

    <section class="section">
      <div class="section-heading">
        <div><div class="section-kicker">Rhythm of business</div><h2>A common portfolio rhythm with local flexibility</h2></div>
      </div>
      <div class="rhythm-list">
        ${playbook.rhythm.map((ritual) => `<article>
          <div><h3>${escapeHtml(ritual.title)}</h3><span>${escapeHtml(ritual.cadence)}</span></div>
          <p>${escapeHtml(ritual.purpose)}</p>
        </article>`).join('')}
      </div>
    </section>`;
}

function renderRoadmap() {
  app.innerHTML = pageHeader(
    'Roadmap and risk management',
    'The FY27 delivery sequence, evidence checkpoints and principal risks for the programme.'
  ) + `
    <section class="section">
      <div class="section-heading">
        <div><div class="section-kicker">FY27 roadmap</div><h2>Foundation first, then scale</h2></div>
      </div>
      <div class="roadmap-grid">
        ${playbook.roadmap.map((phase) => `<article>
          <span>${escapeHtml(phase.period)}</span>
          <h3>${escapeHtml(phase.title)}</h3>
          ${renderBulletList(phase.deliverables)}
        </article>`).join('')}
      </div>
      <div class="checkpoint-line">
        ${playbook.checkpoints.map((checkpoint) => `<article>
          <span>${escapeHtml(checkpoint.date)}</span>
          <h3>${escapeHtml(checkpoint.label)}</h3>
          <p>${escapeHtml(checkpoint.purpose)}</p>
        </article>`).join('')}
      </div>
    </section>

    <section class="section">
      <div class="section-heading">
        <div><div class="section-kicker">Risk management</div><h2>Four failure modes with built-in mitigations</h2></div>
      </div>
      <div class="risk-grid">
        ${playbook.risks.map((item, index) => `<article>
          <span>R${index + 1}</span>
          <div><h3>${escapeHtml(item.risk)}</h3><p>${escapeHtml(item.consequence)}</p><strong>Mitigation</strong><p>${escapeHtml(item.mitigation)}</p></div>
        </article>`).join('')}
      </div>
    </section>`;
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

  app.innerHTML = pageHeader('Technical community directory', 'Find the one community where your interests and delivery work can create the greatest value.', `<span class="badge">${playbook.communities.length} governed communities</span>`) + `
    <div class="context-strip">
      <div><strong>Choose for genuine interest</strong><span>${escapeHtml(playbook.singleCommunityPrinciple)}</span></div>
      <button class="text-action" type="button" data-view="portfolio">Understand the eight-community model →</button>
    </div>
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
          <span class="muted">${escapeHtml(community.category)} · ${escapeHtml(community.serviceFamily)}</span>
          <h2 class="card-title">${escapeHtml(community.title)}</h2>
          <p class="card-copy"><strong>${escapeHtml(community.summary)}</strong><br>${escapeHtml(community.scopeInScope)}</p>
          <div class="card-facts"><span>${community.targetRoles.length} target roles</span><span>${community.alignedIps.length ? `${community.alignedIps.length} aligned IPs` : 'No offerings aligned'}</span></div>
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
    community.summary,
    `<span class="badge">${community.status}</span>`
  ) + `
    <div class="detail-intro">
      <div><span class="section-kicker">Community type</span><strong>${escapeHtml(community.category)}</strong></div>
      <div><span class="section-kicker">Target audience</span><div class="tag-row">${community.targetRoles.map((role) => `<span>${escapeHtml(role)}</span>`).join('')}</div></div>
      <div><span class="section-kicker">Membership principle</span><p>${escapeHtml(playbook.singleCommunityPrinciple)}</p></div>
    </div>
    <section class="section detail-purpose">
      <div>
        <div class="section-kicker">Purpose and value</div>
        <h2>Why this community exists</h2>
        <p class="lead-copy">${escapeHtml(community.purpose)}</p>
      </div>
      <aside class="surface outcome-panel">
        <h3>Expected outcomes</h3>
        ${renderBulletList(community.outcomes)}
      </aside>
    </section>
    <section class="section">
      <h2>Scope</h2>
      <div class="two-column">
        <div class="surface"><h3>In scope</h3><p class="muted">${escapeHtml(community.scopeInScope)}</p></div>
        <div class="surface"><h3>Out of scope</h3><p class="muted">${escapeHtml(community.scopeOutOfScope)}</p></div>
      </div>
    </section>
    <section class="section">
      <h2>Community roles</h2>
      <p class="section-intro">Each community has one accountable Community Lead and between one and five Subject Matter Experts. All appointments are based on nomination and community need.</p>
      <div class="surface">
        ${roles.length ? `<ul class="role-list">${roles.map((role) => `
          <li><strong>${escapeHtml(role.name)}</strong><span>${escapeHtml(role.role)}</span><span class="muted">${escapeHtml(role.status)}</span></li>`).join('')}</ul>` : '<p class="muted">No role holders are recorded.</p>'}
      </div>
    </section>
    <section class="section">
      <h2>Owned IP</h2>
      <p class="section-intro">${ips.length ? 'The community connects practitioners to its aligned delivery offerings and provides focused feedback to the relevant IP Leads.' : 'This community does not own or align to delivery offerings or IP.'}</p>
      <div class="surface">
        ${ips.length ? `<ul class="plain-list">${ips.map((item) => `<li><strong>${escapeHtml(item.title)}</strong><div class="muted">${escapeHtml(item.description)}</div></li>`).join('')}</ul>` : `<p class="muted">${escapeHtml(community.noOfferingsMessage || 'No offerings aligned.')}</p>`}
      </div>
    </section>
    <section class="section">
      <h2>Community channels</h2>
      <p class="section-intro">Viva Engage preserves knowledge; chat handles fast support; this portal remains the operating record.</p>
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
    <div class="callout"><strong>Focused membership</strong><span>${escapeHtml(playbook.singleCommunityPrinciple)}</span></div>
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
    `${community.title} working model, launch readiness and three-way sign-off by the Program Manager, Community Lead and one nominated SME.`,
    `<span class="badge ${readOnly ? 'green' : ''}">${charter.status}</span>`
  ) + `
    <div class="context-strip">
      <div><strong>Stage 1 · Charter</strong><span>${escapeHtml(playbook.launchStages[0].description)}</span></div>
      <button class="text-action" type="button" data-view="activation">Review all launch stages →</button>
    </div>
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
  const measures = Object.keys(data.metrics[data.communities[0].key]);
  const periodIndex = state.period === 'Baseline' ? 0 : 1;
  app.innerHTML = pageHeader('Community health', 'Baseline at launch, report at every quarterly checkpoint, and govern with evidence.', '<span class="badge warning">Illustrative preview data</span>') + `
    <section class="section">
      <div class="section-heading">
        <div><div class="section-kicker">Measurement model</div><h2>Six dimensions define minimum community health</h2></div>
        <p>Headcount alone is not a health signal. The portfolio measures participation, contribution, support, reuse, belonging and connection.</p>
      </div>
      <div class="measure-definition-grid">
        ${playbook.healthMeasures.map((measure) => `<article>
          <h3>${escapeHtml(measure.dimension)}</h3>
          <strong>${escapeHtml(measure.metric)}</strong>
          <p>${escapeHtml(measure.why)}</p>
          <span>${escapeHtml(measure.direction)}</span>
        </article>`).join('')}
      </div>
    </section>
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

const renderers = {
  overview: renderOverview,
  portfolio: renderPortfolio,
  operating: renderOperating,
  activation: renderActivation,
  roadmap: renderRoadmap,
  directory: renderDirectory,
  detail: renderDetail,
  mine: renderMine,
  charter: renderCharter,
  health: renderHealth
};

function render() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === state.view);
    if (button.dataset.view === state.view) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  renderers[state.view]();
}

function focusViewStart() {
  window.scrollTo(0, 0);
  app.focus({ preventScroll: true });
}

document.addEventListener('click', (event) => {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) {
    state.view = viewButton.dataset.view;
    render();
    focusViewStart();
    return;
  }

  const communityButton = event.target.closest('[data-open-community]');
  if (communityButton) {
    state.selectedCommunity = communityButton.dataset.openCommunity;
    state.view = 'detail';
    render();
    focusViewStart();
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