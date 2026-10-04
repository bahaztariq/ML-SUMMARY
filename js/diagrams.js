/**
 * Mermaid diagram rendering (loaded lazily from the CDN on first use).
 * Nodes can be wired to open a concept: pass { nodeId: conceptId } as `links`.
 */

const MERMAID_URL = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

let mermaidPromise = null;
let renderCounter = 0;

function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import(MERMAID_URL).then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        suppressErrorRendering: true,
        theme: 'base',
        fontFamily: 'Inter, sans-serif',
        flowchart: { curve: 'basis', htmlLabels: true, useMaxWidth: true },
        themeVariables: {
          darkMode: true,
          background: '#0d0d10',
          primaryColor: '#161618',
          primaryTextColor: '#f8fafc',
          primaryBorderColor: '#6366f1',
          secondaryColor: '#0c0c0e',
          tertiaryColor: '#0c0c0e',
          lineColor: '#64748b',
          textColor: '#cbd5e1',
          clusterBkg: '#0c0c0e',
          clusterBorder: 'rgba(255,255,255,0.15)',
          edgeLabelBackground: '#0d0d10',
          fontSize: '14px'
        }
      });
      return mermaid;
    });
  }
  return mermaidPromise;
}

/**
 * Render `source` into `container`. Returns true on success.
 * `links` maps Mermaid node ids to concept ids; `onNodeClick(conceptId)` is called on click.
 */
export async function renderDiagram(container, source, { links = {}, onNodeClick, highlight } = {}) {
  container.classList.add('diagram-host');
  container.innerHTML = '<div class="diagram-loading">Rendering diagram…</div>';

  try {
    const mermaid = await loadMermaid();
    const { svg } = await mermaid.render(`mmd-${++renderCounter}`, source);
    container.innerHTML = svg;
  } catch (err) {
    container.innerHTML = `
      <div class="diagram-error">
        <strong>Diagram could not be rendered</strong> — ${navigator.onLine ? 'syntax error in the diagram source.' : 'you appear to be offline (Mermaid loads from a CDN).'}
        <pre>${escapeHtml(source)}</pre>
      </div>`;
    console.warn('Mermaid render failed:', err);
    return false;
  }

  const svgEl = container.querySelector('svg');
  if (svgEl) {
    // Keep wide diagrams legible: never shrink below ~75% of natural size; the panel scrolls instead.
    const natural = parseFloat(svgEl.style.maxWidth) || svgEl.viewBox?.baseVal?.width || 0;
    svgEl.removeAttribute('height');
    if (natural) svgEl.style.minWidth = `${Math.round(natural * 0.75)}px`;
  }

  for (const nodeEl of container.querySelectorAll('g.node')) {
    const nodeId = mermaidNodeId(nodeEl);
    const conceptId = links[nodeId];
    if (nodeId && nodeId === highlight) nodeEl.classList.add('diagram-node-current');
    if (!conceptId || !onNodeClick) continue;
    nodeEl.classList.add('diagram-node-link');
    nodeEl.setAttribute('tabindex', '0');
    nodeEl.setAttribute('role', 'button');
    nodeEl.addEventListener('click', () => onNodeClick(conceptId));
    nodeEl.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onNodeClick(conceptId);
      }
    });
  }
  return true;
}

// Mermaid renders node "A" as <g id="…flowchart-A-12"> (and data-id="A" in newer versions).
function mermaidNodeId(nodeEl) {
  if (nodeEl.dataset.id) return nodeEl.dataset.id;
  const match = /flowchart-(.+)-\d+$/.exec(nodeEl.id || '');
  return match ? match[1] : null;
}

/* Quote text for use inside a Mermaid ["label"]. */
export function mermaidLabel(text) {
  return String(text).replace(/"/g, '#quot;').replace(/</g, '‹').replace(/>/g, '›');
}

function escapeHtml(string) {
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
