async function loadSite() {
  let data = window.SITE_DATA;

  if (!data) {
    const res = await fetch('./data/site-data.json');
    data = await res.json();
  }

  renderHeroStats(data.heroStats || []);
  renderQuote(data.framingQuote || 'Mechanism first. Everything else is a story trying to outrun the biology.');
  renderScoreboard(data.scoreboard || []);
  renderEvidenceLegend(data.evidenceLegend || []);
  renderKnownConstraints(data.knownConstraints || []);
  renderUpdates(data.updates || []);
  renderIssueTracks(data.issueTracks || [], data.repository || {});
  renderPathways(data.priorityPathways || []);
  renderDiagnosticSignals(data.diagnosticSignals || []);
  renderRiskAccelerants(data.riskAccelerants || []);
  renderInterventionLandscape(data.interventionLandscape || []);
  renderResearchQuestions(data.researchQuestions || []);
  renderPromotionRules(data.promotionRules || []);
  renderSourceDigest(data.sourceDigest || []);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeUrl(value) {
  if (!value) {
    return '';
  }

  try {
    const url = new URL(String(value).trim(), window.location.href);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return '';
    }
    return url.href;
  } catch {
    return '';
  }
}

function normalizeRepoUrl(value) {
  return safeUrl(value).replace(/\/$/, '');
}

function setHtml(id, html) {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  el.innerHTML = html;
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  el.textContent = text;
}

function renderHeroStats(items) {
  setHtml('hero-stats', items.map(item => `
    <article class="stat-card">
      <div class="stat-label">${escapeHtml(item.label)}</div>
      <div class="stat-value">${escapeHtml(item.value)}</div>
      <div class="stat-note">${escapeHtml(item.note)}</div>
    </article>
  `).join(''));
}

function renderQuote(text) {
  setText('framing-quote', text);
}

function bandClass(level) {
  switch ((level || '').toLowerCase()) {
    case 'high': return 'band-high';
    case 'medium': return 'band-mid';
    default: return 'band-low';
  }
}

function tierBandClass(tier) {
  const match = String(tier || '').match(/(\d+)/);
  const value = match ? Number(match[1]) : 3;

  if (value <= 1) {
    return 'band-high';
  }
  if (value === 2) {
    return 'band-mid';
  }
  return 'band-low';
}

function renderScoreboard(items) {
  setHtml('scoreboard-grid', items.map(item => `
    <article class="score-card">
      <div class="score-band ${bandClass(item.priority)}">${escapeHtml(item.priority)} priority</div>
      <div class="score-label">${escapeHtml(item.label)}</div>
      <div class="score-value">${escapeHtml(item.value)}</div>
      <div class="score-note">${escapeHtml(item.note)}</div>
    </article>
  `).join(''));
}

function renderEvidenceLegend(items) {
  setHtml('evidence-legend', items.map(item => `
    <article class="legend-card">
      <div class="score-band ${bandClass(item.level)}">${escapeHtml(item.level)} evidence</div>
      <p>${escapeHtml(item.meaning)}</p>
    </article>
  `).join(''));
}

function renderKnownConstraints(items) {
  setHtml('known-constraints', items.map(item => `
    <article class="constraint-card">
      <h4>${escapeHtml(item.label)}</h4>
      <p>${escapeHtml(item.note)}</p>
    </article>
  `).join(''));
}

function renderUpdates(items) {
  setHtml('updates-list', items.map(item => `
    <article class="update-card">
      <div class="update-top">
        <div class="update-date">${escapeHtml(item.date)}</div>
        <div class="score-band ${bandClass(item.signal)}">${escapeHtml(item.signal)} signal</div>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.body)}</p>
      <div class="update-tags">
        ${(item.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
      </div>
    </article>
  `).join(''));
}

function inferGitHubPagesRepoUrl() {
  const { hostname, pathname } = window.location;

  if (!hostname.endsWith('.github.io')) {
    return '';
  }

  const owner = hostname.replace(/\.github\.io$/, '');
  const parts = pathname.split('/').filter(Boolean);
  const repo = parts[0] || `${owner}.github.io`;

  return `https://github.com/${owner}/${repo}`;
}

function resolveRepositoryUrl(repository) {
  const explicitUrl = repository && repository.url ? normalizeRepoUrl(repository.url) : '';
  return explicitUrl || inferGitHubPagesRepoUrl();
}

function buildIssueTemplateUrl(repoUrl, template) {
  const cleanRepoUrl = normalizeRepoUrl(repoUrl);
  if (!cleanRepoUrl) {
    return '';
  }
  return `${cleanRepoUrl}/issues/new?template=${encodeURIComponent(template)}`;
}

function renderIssueTracks(items, repository) {
  const noteEl = document.getElementById('issue-repo-note');
  const repoUrl = resolveRepositoryUrl(repository);

  if (noteEl) {
    noteEl.textContent = repoUrl
      ? `Issue forms will open in ${repoUrl}.`
      : 'Set repository.url in data/site-data.json or publish on GitHub Pages to enable the issue links.';
  }

  setHtml('issue-track-list', items.map(item => {
    const href = buildIssueTemplateUrl(repoUrl, item.template);
    const buttonHtml = href
      ? `<a class="btn btn-secondary" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">Open [${escapeHtml(item.tag)}] issue</a>`
      : '<span class="btn btn-disabled" aria-disabled="true">Configure repo URL</span>';

    return `
      <article class="issue-track-card">
        <div class="issue-track-top">
          <span class="score-band">[${escapeHtml(item.tag)}]</span>
          <span class="issue-track-template">${escapeHtml(item.template)}</span>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
        <ul class="requirement-list">
          ${(item.requirements || []).map(requirement => `<li>${escapeHtml(requirement)}</li>`).join('')}
        </ul>
        ${buttonHtml}
      </article>
    `;
  }).join(''));
}

function renderPathways(items) {
  setHtml('pathway-list', items.map(item => `
    <article class="pathway-card">
      <div class="pathway-tier">${escapeHtml(item.tier)}</div>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.description)}</p>
    </article>
  `).join(''));
}

function renderDiagnosticSignals(items) {
  setHtml('diagnostic-signal-list', items.map(item => `
    <article class="signal-card">
      <div class="card-top">
        <div class="score-band ${bandClass(item.strength)}">${escapeHtml(item.strength)} utility</div>
        <div class="card-kicker">${escapeHtml(item.role)}</div>
      </div>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.note)}</p>
      <div class="detail-row"><strong>Limit:</strong> ${escapeHtml(item.limit)}</div>
    </article>
  `).join(''));
}

function renderRiskAccelerants(items) {
  setHtml('risk-accelerant-list', items.map(item => `
    <article class="accelerant-card">
      <div class="card-top">
        <div class="score-band ${bandClass(item.strength)}">${escapeHtml(item.strength)} signal</div>
        <div class="card-kicker">${escapeHtml(item.layer)}</div>
      </div>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.note)}</p>
      <div class="detail-row"><strong>Mechanism:</strong> ${escapeHtml(item.mechanism)}</div>
    </article>
  `).join(''));
}

function renderInterventionLandscape(items) {
  setHtml('intervention-list', items.map(item => `
    <article class="intervention-card">
      <div class="card-top">
        <div class="score-band ${bandClass(item.evidence)}">${escapeHtml(item.evidence)} evidence</div>
        <div class="card-kicker">${escapeHtml(item.status)}</div>
      </div>
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.role)}</p>
      <div class="detail-row"><strong>Ceiling:</strong> ${escapeHtml(item.ceiling)}</div>
    </article>
  `).join(''));
}

function renderResearchQuestions(items) {
  setHtml('research-question-list', items.map(item => `
    <article class="question-card">
      <div class="score-band ${tierBandClass(item.tier)}">${escapeHtml(item.tier)}</div>
      <h3>${escapeHtml(item.question)}</h3>
      <p>${escapeHtml(item.whyItMatters)}</p>
    </article>
  `).join(''));
}

function renderPromotionRules(items) {
  setHtml('promotion-rule-list', items.map(item => `
    <article class="constraint-card">
      <h4>${escapeHtml(item.label)}</h4>
      <p>${escapeHtml(item.note)}</p>
    </article>
  `).join(''));
}

function renderSourceDigest(items) {
  setHtml('source-digest', items.map(item => {
    const href = safeUrl(item.url);
    const linkHtml = href
      ? `<a class="source-link" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">Open source</a>`
      : '';

    return `
      <article class="source-card">
        <div class="source-top">
          <div>
            <div class="source-topic">${escapeHtml(item.topic)}</div>
            <div class="source-citation">${escapeHtml(item.citation)}</div>
          </div>
          <div class="source-meta">
            <span class="score-band">${escapeHtml(item.kind)}</span>
            <span class="source-date">${escapeHtml(item.date)}</span>
          </div>
        </div>
        <p>${escapeHtml(item.takeaway)}</p>
        ${linkHtml}
      </article>
    `;
  }).join(''));
}

loadSite().catch(err => {
  console.error(err);
  document.body.insertAdjacentHTML(
    'beforeend',
    '<div style="position:fixed;bottom:16px;left:16px;background:#3a1020;color:#fff;padding:12px 14px;border-radius:14px;border:1px solid #ff7f96;z-index:1000;">Failed to load site data. Check <code>data/site-data.js</code> or <code>data/site-data.json</code> for syntax/path issues.</div>'
  );
});
