/**
 * ML & Data Engineering Hub - Main Application
 * Coordinates rendering, multi-dimensional filtering, global search, and interactions.
 */

import { concepts } from '../../content/index.js';
import { initModal, openConceptModal } from './modal.js';
import { initWidgets, toggleCompareSelection, isCompared } from './widgets.js';
import { initViews } from './views.js';
import { tracks } from '../../content/tracks.js';
import { visualizerIds } from './visualizers.js';
import { isLearned, onProgressChange } from './progress.js';

// Application State
const state = {
  activeTrack: 'all',
  activeTag: 'all',
  searchQuery: '',
  noScalingOnly: false,
  handlesMissingOnly: false
};

document.addEventListener('DOMContentLoaded', () => {
  initModal();
  initWidgets();
  initStats();
  initSearch();
  initFilters();
  initViews();
  renderCards();
  onProgressChange(renderCards);
});

/* Calculate and populate hero statistics: total, one stat per track, parameters cataloged */
function initStats() {
  const statsEl = document.getElementById('heroStats');
  const paramCount = concepts.reduce((acc, curr) => acc + (curr.parameters ? curr.parameters.length : 0), 0);

  if (statsEl) {
    const stat = (value, label, color) => `
      <div class="stat-item">
        <div class="stat-number" ${color ? `style="color: ${color}"` : ''}>${value}</div>
        <div class="stat-label">${label}</div>
      </div>`;
    statsEl.innerHTML = [
      stat(concepts.length, 'Total Concepts'),
      ...tracks.map(t => stat(concepts.filter(c => c.track === t.id).length, t.label, t.color)),
      stat(paramCount, 'Params Cataloged')
    ].join('');
  }

  // Update track tab counts
  updateTabCounts();
}

function updateTabCounts() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    const track = tab.getAttribute('data-track');
    const countEl = tab.querySelector('.tab-count');
    if (!countEl) return;

    if (track === 'all') {
      countEl.textContent = concepts.length;
    } else {
      const count = concepts.filter(c => c.track === track).length;
      countEl.textContent = count;
    }
  });
}

/* Setup Search Bar with Hotkey */
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('searchClearBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      if (clearBtn) {
        if (state.searchQuery.length > 0) {
          clearBtn.classList.add('visible');
        } else {
          clearBtn.classList.remove('visible');
        }
      }
      renderCards();
    });

    // Shortcut Cmd+K or Ctrl+K
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      state.searchQuery = '';
      clearBtn.classList.remove('visible');
      renderCards();
      searchInput.focus();
    });
  }
}

/* Setup Track and Sub-Filter Listeners */
function initFilters() {
  // Track Tabs
  const trackTabs = document.querySelectorAll('.tab-btn');
  trackTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      trackTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeTrack = tab.getAttribute('data-track');
      renderCards();
    });
  });

  // Sub-tag pills
  const tagPills = document.querySelectorAll('.tag-pill');
  tagPills.forEach(pill => {
    pill.addEventListener('click', () => {
      tagPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeTag = pill.getAttribute('data-tag');
      renderCards();
    });
  });

  // Fast Checkbox Toggles
  const noScalingCb = document.getElementById('toggleNoScaling');
  if (noScalingCb) {
    noScalingCb.addEventListener('change', (e) => {
      state.noScalingOnly = e.target.checked;
      renderCards();
    });
  }

  const missingCb = document.getElementById('toggleMissing');
  if (missingCb) {
    missingCb.addEventListener('change', (e) => {
      state.handlesMissingOnly = e.target.checked;
      renderCards();
    });
  }

  // Global Expand / Collapse All Toggle
  let allExpanded = false;
  const expandAllBtn = document.getElementById('toggleExpandAllBtn');
  const expandAllIcon = document.getElementById('expandAllIcon');
  const expandAllText = document.getElementById('expandAllText');

  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      allExpanded = !allExpanded;
      const cards = document.querySelectorAll('.concept-card');
      cards.forEach(c => {
        if (allExpanded) {
          c.classList.add('is-expanded');
        } else {
          c.classList.remove('is-expanded');
        }
      });
      if (expandAllIcon) expandAllIcon.textContent = allExpanded ? '⊟' : '⊞';
      if (expandAllText) expandAllText.textContent = allExpanded ? 'Collapse All' : 'Expand All';
    });
  }
}

/* Filter concepts based on state */
function getFilteredConcepts() {
  return concepts.filter(concept => {
    // 1. Track filter
    if (state.activeTrack !== 'all' && concept.track !== state.activeTrack) {
      return false;
    }

    // 2. Tag filter
    if (state.activeTag !== 'all') {
      const tasks = concept.task || [];
      const match = tasks.some(t => t.toLowerCase().includes(state.activeTag.toLowerCase())) ||
                    concept.category.toLowerCase().includes(state.activeTag.toLowerCase());
      if (!match) return false;
    }

    // 3. Checkbox toggles
    if (state.noScalingOnly && concept.requirements?.scalingRequired !== false) {
      return false;
    }
    if (state.handlesMissingOnly && !concept.requirements?.handlesMissing) {
      return false;
    }

    // 4. Search Query across Name, Category, Intuition, and Parameters
    if (state.searchQuery) {
      const q = state.searchQuery;
      const nameMatch = concept.name.toLowerCase().includes(q);
      const categoryMatch = concept.category.toLowerCase().includes(q);
      const summaryMatch = concept.summary.toLowerCase().includes(q);
      const intuitionMatch = concept.intuition.toLowerCase().includes(q);
      const paramMatch = (concept.parameters || []).some(p => p.name.toLowerCase().includes(q));
      const taskMatch = (concept.task || []).some(t => t.toLowerCase().includes(q));

      if (!nameMatch && !categoryMatch && !summaryMatch && !intuitionMatch && !paramMatch && !taskMatch) {
        return false;
      }
    }

    return true;
  });
}

/* Render Cards into DOM */
function renderCards() {
  const grid = document.getElementById('conceptsGrid');
  if (!grid) return;

  const filtered = getFilteredConcepts();

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3 class="empty-state-title">No matching concepts found</h3>
        <p>Try loosening your search query or unchecking active filters.</p>
        <button class="btn btn-secondary" style="margin-top: 1rem;" id="resetFiltersBtn">Reset All Filters</button>
      </div>
    `;
    const resetBtn = document.getElementById('resetFiltersBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetAllFilters);
    }
    return;
  }

  grid.innerHTML = filtered.map(concept => {
    const isChecked = isCompared(concept.id);
    const difficultyClass = `difficulty-${concept.difficulty.toLowerCase()}`;
    const previewParams = (concept.parameters || []).slice(0, 3);

    return `
      <article class="concept-card ${isLearned(concept.id) ? 'is-learned' : ''}" data-id="${concept.id}" data-track="${concept.track}">
        <!-- Clickable Header Area to Toggle Collapse/Expand -->
        <div class="card-header-toggle">
          <div class="card-top">
            <span class="card-category">${concept.category}</span>
            <div class="card-top-right">
              ${isLearned(concept.id) ? '<span class="card-flag card-flag-learned" title="You marked this as learned">✓</span>' : ''}
              ${visualizerIds.includes(concept.id) ? '<span class="card-flag" title="Has an interactive visualizer">🎮</span>' : ''}
              <span class="card-difficulty ${difficultyClass}">${concept.difficulty}</span>
              <button class="card-expand-toggle-btn" aria-label="Toggle card expansion" title="Click to expand/collapse">▼</button>
            </div>
          </div>

          <div class="card-title">
            <span>${concept.name}</span>
            <span class="badge badge-${concept.track}">${concept.track.replace('-', ' ')}</span>
          </div>

          <p class="card-tagline">${concept.summary}</p>
        </div>

        <!-- Expandable Content: Collapsed by Default -->
        <div class="card-expandable-content">
          <div class="card-intuition">
            <span class="card-intuition-label">Intuition</span>
            ${concept.intuition}
          </div>

          <!-- Specs Matrix Preview -->
          <div class="card-specs">
            <div class="spec-chip">
              <span>Scaling:</span>
              <strong>${concept.requirements?.scalingRequired ? 'Required' : 'Not needed'}</strong>
            </div>
            <div class="spec-chip">
              <span>Outliers:</span>
              <strong>${concept.requirements?.outlierSensitive ? 'Sensitive' : 'Robust'}</strong>
            </div>
          </div>

          <!-- Parameter Pills Preview -->
          ${previewParams.length > 0 ? `
            <div class="card-params-preview">
              ${previewParams.map(p => `<span class="param-pill">${p.name}</span>`).join('')}
              ${(concept.parameters?.length || 0) > 3 ? `<span class="param-pill" style="color: var(--text-muted);">+${concept.parameters.length - 3} more</span>` : ''}
            </div>
          ` : ''}

          <div class="card-actions">
            <button class="card-view-btn" data-id="${concept.id}">
              <span>Deep Dive & Code</span>
              <span>→</span>
            </button>

            <label class="compare-checkbox-label" onclick="event.stopPropagation();">
              <input type="checkbox" class="toggle-checkbox compare-toggle-input" data-id="${concept.id}" ${isChecked ? 'checked' : ''}>
              <span>Compare</span>
            </label>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Attach card event listeners
  grid.querySelectorAll('.concept-card').forEach(card => {
    const id = card.getAttribute('data-id');
    const headerToggle = card.querySelector('.card-header-toggle');
    const viewBtn = card.querySelector('.card-view-btn');
    const compareInput = card.querySelector('.compare-toggle-input');

    // Clicking header toggles collapsed/expanded state
    if (headerToggle) {
      headerToggle.addEventListener('click', () => {
        card.classList.toggle('is-expanded');
      });
    }

    // Clicking "Deep Dive & Code" button opens full modal
    if (viewBtn) {
      viewBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openConceptModal(id);
      });
    }

    // Handle compare checkbox
    if (compareInput) {
      compareInput.addEventListener('change', (e) => {
        e.stopPropagation();
        const success = toggleCompareSelection(id);
        if (!success) {
          compareInput.checked = false;
        }
      });
    }
  });
}

function resetAllFilters() {
  state.activeTrack = 'all';
  state.activeTag = 'all';
  state.searchQuery = '';
  state.noScalingOnly = false;
  state.handlesMissingOnly = false;

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';

  const clearBtn = document.getElementById('searchClearBtn');
  if (clearBtn) clearBtn.classList.remove('visible');

  document.querySelectorAll('.tab-btn').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-track') === 'all');
  });

  document.querySelectorAll('.tag-pill').forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-tag') === 'all');
  });

  const cb1 = document.getElementById('toggleNoScaling');
  if (cb1) cb1.checked = false;
  const cb2 = document.getElementById('toggleMissing');
  if (cb2) cb2.checked = false;

  renderCards();
}
