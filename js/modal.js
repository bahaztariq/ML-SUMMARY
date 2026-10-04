/**
 * Modal & Detail Drawer Controller
 * Handles rendering concept profiles, tab switching, and clipboard actions.
 */

import { conceptById, getDependents } from './data.js';
import { renderDiagram, mermaidLabel } from './diagrams.js';
import { renderVisualizer, visualizerIds, destroyVisualizer } from './visualizers.js';
import { isLearned, toggleLearned, onProgressChange } from './progress.js';

let activeConcept = null;

export function initModal() {
  const modalBackdrop = document.getElementById('conceptModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const tabBtns = document.querySelectorAll('.modal-tab-btn');
  const learnedBtn = document.getElementById('modalLearnedBtn');

  if (learnedBtn) {
    learnedBtn.addEventListener('click', () => {
      if (activeConcept) toggleLearned(activeConcept.id);
    });
  }
  onProgressChange(updateLearnedButton);

  // Close modal when clicking close button
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Close modal when clicking backdrop
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });
  }

  // Global keydown: Escape closes whichever overlay is on top
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('conceptModal')?.classList.contains('active')) {
      closeModal();
      return;
    }
    document.querySelectorAll('.metrics-lab-modal.active, .compare-modal-backdrop.active').forEach(el => el.classList.remove('active'));
    document.body.style.overflow = '';
  });

  // Modal Tab navigation
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchModalTab(targetTab);
    });
  });

  // Delegate copy button event
  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.code-copy-btn');
    if (copyBtn) {
      const codeBlock = copyBtn.closest('.code-container').querySelector('.code-content');
      if (codeBlock) {
        navigator.clipboard.writeText(codeBlock.innerText).then(() => {
          showToast('Code copied to clipboard!');
          const origHtml = copyBtn.innerHTML;
          copyBtn.innerHTML = '<span>✓ Copied</span>';
          setTimeout(() => { copyBtn.innerHTML = origHtml; }, 2000);
        });
      }
    }
  });
}

export function openConceptModal(conceptId) {
  const concept = conceptById.get(conceptId);
  if (!concept) return;

  activeConcept = concept;
  const modal = document.getElementById('conceptModal');
  if (!modal) return;

  // Set Modal Accent Color
  const trackColors = {
    'fundamentals': 'var(--color-track-fundamentals)',
    'data-eng': 'var(--color-track-de)',
    'ml-core': 'var(--color-track-ml-core)',
    'ml-models': 'var(--color-track-models)',
    'deep-learning': 'var(--color-track-dl)',
    'mlops': 'var(--color-track-mlops)'
  };
  modal.style.setProperty('--modal-accent', trackColors[concept.track] || 'var(--accent-indigo)');

  // Populate Header
  document.getElementById('modalTrackBadge').className = `badge badge-${concept.track}`;
  document.getElementById('modalTrackBadge').textContent = concept.track.replace('-', ' ');
  document.getElementById('modalCategory').textContent = concept.category;
  document.getElementById('modalTitle').textContent = concept.name;

  // Render Tabs Content
  renderOverviewTab(concept);
  renderParametersTab(concept);
  renderMathTab(concept);
  renderProsConsTab(concept);
  renderCodeTab(concept);
  renderLinksTab(concept);
  updateLearnedButton();

  const interactiveBtn = document.querySelector('.modal-tab-btn[data-tab="interactive"]');
  const hasVisualizer = visualizerIds.includes(concept.id);
  if (interactiveBtn) interactiveBtn.hidden = !hasVisualizer;
  if (hasVisualizer) renderVisualizer(concept.id, document.getElementById('tab-interactive'));

  // Switch to first tab by default
  switchModalTab('overview');
  document.querySelector('#conceptModal .modal-body')?.scrollTo(0, 0);

  // Display modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function closeModal() {
  const modal = document.getElementById('conceptModal');
  if (modal) {
    modal.classList.remove('active');
  }
  document.body.style.overflow = '';
  destroyVisualizer();
}

function switchModalTab(tabId) {
  const tabBtns = document.querySelectorAll('.modal-tab-btn');
  const panes = document.querySelectorAll('.modal-pane');

  tabBtns.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  panes.forEach(pane => {
    if (pane.id === `tab-${tabId}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  // Diagrams render lazily the first time their tab is shown for a concept.
  if (tabId === 'links' && activeConcept) renderLinksDiagrams(activeConcept);
}

function renderOverviewTab(concept) {
  const container = document.getElementById('tab-overview');
  if (!container) return;

  // Build requirements tags
  let reqsHtml = '';
  if (concept.requirements) {
    reqsHtml = `
      <div class="requirements-grid">
        ${Object.entries(concept.requirements).map(([key, val]) => `
          <div class="req-item">
            <span class="req-icon">${val ? '⚡' : '🛡️'}</span>
            <div>
              <div class="req-label">${formatKey(key)}</div>
              <div class="req-value" style="color: ${val ? '#34d399' : '#94a3b8'}">${val === true ? 'Yes / Required' : (val === false ? 'No / Optional' : val)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="overview-grid">
      <div class="callout-box intuition">
        <div class="callout-title">💡 The Intuition & Analogy</div>
        <p class="callout-text">${concept.intuition}</p>
      </div>

      <div class="callout-box">
        <div class="callout-title">🎯 Goal & Purpose</div>
        <p class="callout-text">${concept.summary}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div class="callout-box use-case" style="margin-bottom: 0;">
          <div class="callout-title" style="color: #34d399;">✅ When To Choose This</div>
          <p class="callout-text">${concept.whenToUse}</p>
        </div>
        <div class="callout-box" style="margin-bottom: 0; border-color: #ef4444; background: rgba(239, 68, 68, 0.05);">
          <div class="callout-title" style="color: #f87171;">⚠️ When To Avoid</div>
          <p class="callout-text">${concept.whenToAvoid || 'When other simpler models suffice.'}</p>
        </div>
      </div>

      <div style="margin-top: 1rem;">
        <h4 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem;">Data & Operational Requirements</h4>
        ${reqsHtml}
      </div>
    </div>
  `;
}

function renderParametersTab(concept) {
  const container = document.getElementById('tab-parameters');
  if (!container) return;

  if (!concept.parameters || concept.parameters.length === 0) {
    container.innerHTML = `<p style="color: var(--text-muted);">No hyperparameter configuration required for this concept.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="params-table-wrapper">
      <table class="params-table">
        <thead>
          <tr>
            <th>Parameter / Hyperparameter</th>
            <th>Type</th>
            <th>Default</th>
            <th>Impact & Tuning Recommendation</th>
          </tr>
        </thead>
        <tbody>
          ${concept.parameters.map(p => `
            <tr>
              <td><span class="param-name">${p.name}</span></td>
              <td><code style="color: #94a3b8; font-size: 0.8rem;">${p.type || 'any'}</code></td>
              <td><span class="param-default">${p.default || 'None'}</span></td>
              <td class="param-impact">
                <div>${p.impact || ''}</div>
                ${p.tuningTip ? `<div style="margin-top: 0.35rem; color: #a5b4fc; font-size: 0.8rem;">💡 <strong>Tuning Tip:</strong> ${p.tuningTip}</div>` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderMathTab(concept) {
  const container = document.getElementById('tab-math');
  if (!container) return;

  if (!concept.math) {
    container.innerHTML = `<p style="color: var(--text-muted);">No mathematical formula specified for this concept.</p>`;
    return;
  }

  container.innerHTML = `
    <div class="math-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <h4 style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">Core Mathematical Equation</h4>
        <span class="badge" style="background: rgba(99, 102, 241, 0.15); color: #a5b4fc;">${concept.math.loss || 'Objective'}</span>
      </div>
      <div class="math-formula-box">${concept.math.formula}</div>
      <div class="math-explanation">
        <h5 style="color: #e2e8f0; margin-bottom: 0.5rem; font-size: 0.95rem;">Intuition Behind The Math:</h5>
        <p>${concept.math.explanation}</p>
      </div>
    </div>
  `;
}

function renderProsConsTab(concept) {
  const container = document.getElementById('tab-pros-cons');
  if (!container) return;

  container.innerHTML = `
    <div class="pros-cons-grid">
      <div class="pros-box">
        <div class="pros-title">🌟 Strengths & Advantages</div>
        <ul class="pros-list">
          ${(concept.pros || []).map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <div class="cons-box">
        <div class="cons-title">⚠️ Weaknesses & Gotchas</div>
        <ul class="cons-list">
          ${(concept.cons || []).map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

function renderCodeTab(concept) {
  const container = document.getElementById('tab-code');
  if (!container) return;

  container.innerHTML = `
    <div class="code-container">
      <div class="code-header">
        <span class="code-lang-tag">Python / Executable Blueprint</span>
        <button class="code-copy-btn">
          <span>📋 Copy Code</span>
        </button>
      </div>
      <pre class="code-content"><code>${escapeHtml(concept.codeSnippet || '# No code snippet available')}</code></pre>
    </div>
  `;
}

function updateLearnedButton() {
  const btn = document.getElementById('modalLearnedBtn');
  if (!btn || !activeConcept) return;
  const learned = isLearned(activeConcept.id);
  btn.classList.toggle('is-learned', learned);
  btn.setAttribute('aria-pressed', String(learned));
  btn.textContent = learned ? '✓ Learned' : 'Mark as learned';
}

function conceptChips(ids) {
  const valid = ids.filter(id => conceptById.has(id));
  if (valid.length === 0) return '<span class="links-empty">None</span>';
  return valid.map(id => {
    const c = conceptById.get(id);
    return `<button class="concept-chip" data-open="${id}"><span class="badge badge-${c.track}">${c.track.replace('-', ' ')}</span>${c.name}${isLearned(id) ? ' <span class="chip-check">✓</span>' : ''}</button>`;
  }).join('');
}

function renderLinksTab(concept) {
  const container = document.getElementById('tab-links');
  if (!container) return;
  const dependents = getDependents(concept.id).map(c => c.id);

  container.innerHTML = `
    ${concept.diagram ? `
      <div class="links-section">
        <h4 class="links-heading">🗺️ How it works</h4>
        <div class="diagram-panel" id="conceptDiagram"></div>
      </div>` : ''}

    <div class="links-section">
      <h4 class="links-heading">🧬 Where it fits — learning chain</h4>
      <p class="links-hint">Prerequisites flow into this concept, which unlocks the ones on the right. Click a box to jump.</p>
      <div class="diagram-panel" id="chainDiagram"></div>
    </div>

    <div class="links-columns">
      <div class="links-section">
        <h4 class="links-heading">📚 Learn first</h4>
        <div class="chip-row">${conceptChips(concept.prerequisites)}</div>
      </div>
      <div class="links-section">
        <h4 class="links-heading">🔗 Related</h4>
        <div class="chip-row">${conceptChips(concept.related)}</div>
      </div>
      <div class="links-section">
        <h4 class="links-heading">🔓 Unlocks</h4>
        <div class="chip-row">${conceptChips(dependents)}</div>
      </div>
    </div>
  `;
  container.dataset.diagramsFor = '';

  container.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => openConceptModal(btn.dataset.open));
  });
}

function renderLinksDiagrams(concept) {
  const container = document.getElementById('tab-links');
  if (!container || container.dataset.diagramsFor === concept.id) return;
  container.dataset.diagramsFor = concept.id;

  const diagramHost = container.querySelector('#conceptDiagram');
  if (diagramHost) renderDiagram(diagramHost, concept.diagram);

  const chain = learningChain(concept);
  renderDiagram(container.querySelector('#chainDiagram'), chain.source, {
    links: chain.links,
    highlight: chain.current,
    onNodeClick: openConceptModal
  });
}

// Prerequisites two levels up, the concept itself, and what it unlocks one level down.
function learningChain(concept) {
  const lines = ['flowchart LR'];
  const links = {};
  const key = id => 'c_' + id.replace(/[^a-zA-Z0-9]/g, '_');
  const edges = new Set();
  const declare = (id) => {
    const k = key(id);
    if (!links[k]) {
      links[k] = id;
      const c = conceptById.get(id);
      lines.push(`  ${k}["${mermaidLabel(c.name)}${isLearned(id) ? ' ✓' : ''}"]`);
    }
    return k;
  };
  const edge = (from, to) => {
    const e = `  ${declare(from)} --> ${declare(to)}`;
    if (!edges.has(e)) edges.add(e);
  };

  declare(concept.id);
  const walkUp = (id, depth) => {
    if (depth === 0) return;
    for (const pre of conceptById.get(id).prerequisites.filter(p => conceptById.has(p) && p !== concept.id)) {
      edge(pre, id);
      walkUp(pre, depth - 1);
    }
  };
  walkUp(concept.id, 2);
  for (const dep of getDependents(concept.id)) edge(concept.id, dep.id);

  // The current concept is highlighted, not clickable.
  const current = key(concept.id);
  delete links[current];
  return { source: [...lines, ...edges].join('\n'), links, current };
}

function formatKey(str) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

function escapeHtml(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>✨</span><span>${message}</span>`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}
