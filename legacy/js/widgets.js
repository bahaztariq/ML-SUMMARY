/**
 * Interactive Widgets:
 * 1. Confusion Matrix & Metrics Lab
 * 2. Side-by-Side Model Comparison Matrix
 */

import { concepts } from '../../content/index.js';
import { showToast } from './modal.js';

let compareSelection = [];

export function initWidgets() {
  initMetricsLab();
  initCompareDock();
}

/* =========================================================================
   1. Interactive Confusion Matrix & Metrics Lab
   ========================================================================= */
export function initMetricsLab() {
  const labModal = document.getElementById('metricsLabModal');
  const openLabBtn = document.getElementById('openMetricsLabBtn');
  const closeLabBtn = document.getElementById('closeLabBtn');

  if (openLabBtn && labModal) {
    openLabBtn.addEventListener('click', () => {
      labModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      updateMetricsCalculations();
    });
  }

  if (closeLabBtn && labModal) {
    closeLabBtn.addEventListener('click', () => {
      labModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (labModal) {
    labModal.addEventListener('click', (e) => {
      if (e.target === labModal) {
        labModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Setup inputs & sliders
  ['tp', 'fp', 'fn', 'tn'].forEach(key => {
    const slider = document.getElementById(`${key}Slider`);
    const numInput = document.getElementById(`${key}Input`);

    if (slider && numInput) {
      slider.addEventListener('input', (e) => {
        numInput.value = e.target.value;
        updateMetricsCalculations();
      });

      numInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 0) val = 0;
        slider.value = val;
        updateMetricsCalculations();
      });
    }
  });

  // Preset Buttons (Medical Screening vs Spam Filter)
  const presetMedical = document.getElementById('presetMedical');
  const presetSpam = document.getElementById('presetSpam');
  const presetBalanced = document.getElementById('presetBalanced');

  if (presetMedical) {
    presetMedical.addEventListener('click', () => {
      setMatrixValues(85, 40, 2, 873); // High recall critical: FN must be tiny!
      showToast('Loaded Medical Diagnostic Scenario (High Recall focus)');
    });
  }

  if (presetSpam) {
    presetSpam.addEventListener('click', () => {
      setMatrixValues(150, 1, 35, 814); // High precision critical: FP must be close to 0!
      showToast('Loaded Spam Filter Scenario (High Precision focus)');
    });
  }

  if (presetBalanced) {
    presetBalanced.addEventListener('click', () => {
      setMatrixValues(120, 20, 25, 335);
      showToast('Loaded Balanced Dataset Scenario');
    });
  }
}

function setMatrixValues(tp, fp, fn, tn) {
  const setVal = (k, v) => {
    const s = document.getElementById(`${k}Slider`);
    const i = document.getElementById(`${k}Input`);
    if (s) s.value = v;
    if (i) i.value = v;
  };
  setVal('tp', tp);
  setVal('fp', fp);
  setVal('fn', fn);
  setVal('tn', tn);
  updateMetricsCalculations();
}

function updateMetricsCalculations() {
  const tp = parseInt(document.getElementById('tpInput')?.value || 100, 10);
  const fp = parseInt(document.getElementById('fpInput')?.value || 20, 10);
  const fn = parseInt(document.getElementById('fnInput')?.value || 15, 10);
  const tn = parseInt(document.getElementById('tnInput')?.value || 365, 10);

  const total = tp + fp + fn + tn;
  const accuracy = total > 0 ? (tp + tn) / total : 0;
  const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
  const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
  const specificity = (tn + fp) > 0 ? tn / (tn + fp) : 0;
  const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  // Update text & progress bars
  const renderMetric = (id, val) => {
    const textEl = document.getElementById(`${id}Val`);
    const barEl = document.getElementById(`${id}Bar`);
    const pct = (val * 100).toFixed(1);
    if (textEl) textEl.textContent = `${pct}%`;
    if (barEl) barEl.style.width = `${pct}%`;
  };

  renderMetric('accuracy', accuracy);
  renderMetric('precision', precision);
  renderMetric('recall', recall);
  renderMetric('specificity', specificity);
  renderMetric('f1', f1);

  // Update Total counter
  const totalCountEl = document.getElementById('matrixTotalCount');
  if (totalCountEl) totalCountEl.textContent = `Total Samples: ${total.toLocaleString()}`;
}

/* =========================================================================
   2. Side-by-Side Model Comparison Engine
   ========================================================================= */
export function initCompareDock() {
  const dock = document.getElementById('comparisonDock');
  const launchCompareBtn = document.getElementById('launchCompareBtn');
  const clearCompareBtn = document.getElementById('clearCompareBtn');
  const compareModal = document.getElementById('compareModal');
  const closeCompareBtn = document.getElementById('closeCompareBtn');

  if (launchCompareBtn) {
    launchCompareBtn.addEventListener('click', () => {
      if (compareSelection.length < 2) {
        showToast('Please select 2 models to compare side-by-side');
        return;
      }
      openCompareModal();
    });
  }

  if (clearCompareBtn) {
    clearCompareBtn.addEventListener('click', () => {
      clearAllComparisons();
    });
  }

  if (closeCompareBtn && compareModal) {
    closeCompareBtn.addEventListener('click', () => {
      compareModal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (compareModal) {
    compareModal.addEventListener('click', (e) => {
      if (e.target === compareModal) {
        compareModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

export function toggleCompareSelection(conceptId) {
  const idx = compareSelection.indexOf(conceptId);
  if (idx >= 0) {
    compareSelection.splice(idx, 1);
  } else {
    if (compareSelection.length >= 2) {
      showToast('You can compare a maximum of 2 concepts at once');
      return false;
    }
    compareSelection.push(conceptId);
  }

  updateCompareDockUI();
  return true;
}

export function isCompared(conceptId) {
  return compareSelection.includes(conceptId);
}

function clearAllComparisons() {
  compareSelection = [];
  updateCompareDockUI();
  // Uncheck all compare checkboxes in UI
  document.querySelectorAll('.compare-toggle-input').forEach(input => {
    input.checked = false;
  });
}

function updateCompareDockUI() {
  const dock = document.getElementById('comparisonDock');
  const slot1 = document.getElementById('compareSlot1');
  const slot2 = document.getElementById('compareSlot2');
  const launchBtn = document.getElementById('launchCompareBtn');

  if (!dock) return;

  if (compareSelection.length > 0) {
    dock.classList.add('active');
  } else {
    dock.classList.remove('active');
  }

  const c1 = concepts.find(c => c.id === compareSelection[0]);
  const c2 = concepts.find(c => c.id === compareSelection[1]);

  if (slot1) {
    if (c1) {
      slot1.className = 'dock-slot';
      slot1.innerHTML = `<span>${c1.name}</span><button class="dock-remove" data-id="${c1.id}">×</button>`;
    } else {
      slot1.className = 'dock-slot dock-slot-empty';
      slot1.innerHTML = '<span>Slot 1: Select model</span>';
    }
  }

  if (slot2) {
    if (c2) {
      slot2.className = 'dock-slot';
      slot2.innerHTML = `<span>${c2.name}</span><button class="dock-remove" data-id="${c2.id}">×</button>`;
    } else {
      slot2.className = 'dock-slot dock-slot-empty';
      slot2.innerHTML = '<span>Slot 2: Select model</span>';
    }
  }

  if (launchBtn) {
    launchBtn.disabled = compareSelection.length < 2;
    launchBtn.style.opacity = compareSelection.length < 2 ? '0.5' : '1';
  }

  // Handle remove clicks inside dock
  dock.querySelectorAll('.dock-remove').forEach(btn => {
    btn.onclick = (e) => {
      const id = btn.getAttribute('data-id');
      toggleCompareSelection(id);
      const cb = document.querySelector(`.compare-toggle-input[data-id="${id}"]`);
      if (cb) cb.checked = false;
    };
  });
}

function openCompareModal() {
  const c1 = concepts.find(c => c.id === compareSelection[0]);
  const c2 = concepts.find(c => c.id === compareSelection[1]);
  const modal = document.getElementById('compareModal');
  const body = document.getElementById('compareModalBody');

  if (!c1 || !c2 || !modal || !body) return;

  body.innerHTML = `
    <div class="compare-grid">
      <!-- Headers -->
      <div class="compare-row-label">Feature / Dimension</div>
      <div class="compare-cell compare-model-card-header">
        <span class="badge badge-${c1.track}">${c1.track}</span>
        <h3 style="margin-top: 0.5rem; font-size: 1.4rem;">${c1.name}</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted);">${c1.category}</p>
      </div>
      <div class="compare-cell compare-model-card-header model-2">
        <span class="badge badge-${c2.track}">${c2.track}</span>
        <h3 style="margin-top: 0.5rem; font-size: 1.4rem;">${c2.name}</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted);">${c2.category}</p>
      </div>

      <!-- Intuition -->
      <div class="compare-row-label">Core Intuition</div>
      <div class="compare-cell" style="font-style: italic; color: #cbd5e1;">"${c1.intuition}"</div>
      <div class="compare-cell" style="font-style: italic; color: #cbd5e1;">"${c2.intuition}"</div>

      <!-- Best Use Cases -->
      <div class="compare-row-label">When To Use</div>
      <div class="compare-cell">${c1.whenToUse}</div>
      <div class="compare-cell">${c2.whenToUse}</div>

      <!-- When To Avoid -->
      <div class="compare-row-label">When To Avoid</div>
      <div class="compare-cell" style="color: #f87171;">${c1.whenToAvoid || 'N/A'}</div>
      <div class="compare-cell" style="color: #f87171;">${c2.whenToAvoid || 'N/A'}</div>

      <!-- Scaling Required -->
      <div class="compare-row-label">Needs Scaling?</div>
      <div class="compare-cell">
        <strong>${c1.requirements?.scalingRequired ? '⚠️ Yes (Strict)' : '🛡️ No (Invariant)'}</strong>
      </div>
      <div class="compare-cell">
        <strong>${c2.requirements?.scalingRequired ? '⚠️ Yes (Strict)' : '🛡️ No (Invariant)'}</strong>
      </div>

      <!-- Outlier Sensitivity -->
      <div class="compare-row-label">Outlier Sensitivity</div>
      <div class="compare-cell">
        <span>${c1.requirements?.outlierSensitive ? '⚠️ High Sensitivity' : '🛡️ Resistant / Robust'}</span>
      </div>
      <div class="compare-cell">
        <span>${c2.requirements?.outlierSensitive ? '⚠️ High Sensitivity' : '🛡️ Resistant / Robust'}</span>
      </div>

      <!-- Top Hyperparameters -->
      <div class="compare-row-label">Key Parameters</div>
      <div class="compare-cell">
        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
          ${(c1.parameters || []).slice(0, 3).map(p => `<code>${p.name}</code> (${p.default})`).join('')}
        </div>
      </div>
      <div class="compare-cell">
        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
          ${(c2.parameters || []).slice(0, 3).map(p => `<code>${p.name}</code> (${p.default})`).join('')}
        </div>
      </div>

      <!-- Top Pros -->
      <div class="compare-row-label">Key Strengths</div>
      <div class="compare-cell">
        <ul style="list-style: none; padding-left: 0; font-size: 0.85rem;">
          ${(c1.pros || []).slice(0, 2).map(p => `<li style="margin-bottom: 0.35rem;">✓ ${p}</li>`).join('')}
        </ul>
      </div>
      <div class="compare-cell">
        <ul style="list-style: none; padding-left: 0; font-size: 0.85rem;">
          ${(c2.pros || []).slice(0, 2).map(p => `<li style="margin-bottom: 0.35rem;">✓ ${p}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
