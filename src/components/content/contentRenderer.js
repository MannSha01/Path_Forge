// ===================================================
// PATH FORGE - UNIVERSAL SHARED CONTENT RENDERER
// High-fidelity structured content rendering engine
// Shared 100% identically between Admin Live Preview & Student Module Pages
// ===================================================

/**
 * Escapes HTML characters for safe code & text rendering.
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Formats inline Markdown-like tokens (bold, italic, inline code, links) safely.
 * @param {string} text
 * @returns {string}
 */
export function formatInlineText(text) {
  if (!text) return "";
  let html = escapeHTML(text);

  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong class="font-bold text-white">$1</strong>');

  // Italic: *text* or _text_
  html = html.replace(/\*([^*]+?)\*/g, '<em class="italic text-slate-200">$1</em>');
  html = html.replace(/_([^_]+?)_/g, '<em class="italic text-slate-200">$1</em>');

  // Inline Code: `code`
  html = html.replace(/`([^`]+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs">$1</code>');

  // Links: [label](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-300 underline font-medium">$1</a>');

  return html;
}

/**
 * ContentRenderer class
 */
export class ContentRenderer {
  /**
   * Renders a complete list of structured content blocks.
   * @param {Array<object>} blocks
   * @param {object} [options]
   * @returns {string}
   */
  static render(blocks = [], options = {}) {
    if (!Array.isArray(blocks) || blocks.length === 0) {
      return `
        <div class="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
          No content blocks added yet. Use the editor to add text, diagrams, code, and images.
        </div>
      `;
    }

    // Sort by order
    const sorted = [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return `
      <div class="pf-content-stream space-y-6 ${options.className || ""}">
        ${sorted.map((block, idx) => ContentRenderer.renderBlock(block, idx)).join("\n")}
      </div>
    `;
  }

  /**
   * Dispatches block rendering based on type.
   * @param {object} block
   * @param {number} index
   * @returns {string}
   */
  static renderBlock(block, index = 0) {
    if (!block || !block.type) return "";

    switch (block.type) {
      case "text":
        return ContentRenderer.renderTextBlock(block.data || {}, index);
      case "image":
        return ContentRenderer.renderImageBlock(block.data || {}, index);
      case "flowchart":
        return ContentRenderer.renderFlowchartBlock(block.data || {}, index);
      case "code":
        return ContentRenderer.renderCodeBlock(block.data || {}, index);
      case "callout":
        return ContentRenderer.renderCalloutBlock(block.data || {}, index);
      case "table":
        return ContentRenderer.renderTableBlock(block.data || {}, index);
      default:
        return `<div class="text-xs text-slate-500">[Unknown block type: ${escapeHTML(block.type)}]</div>`;
    }
  }

  /**
   * 1. TEXT BLOCK
   */
  static renderTextBlock(data, index) {
    const heading = data.heading || "";
    const level = data.level || "h3";
    const rawContent = data.content || "";

    // Parse paragraphs and bullet / numbered lists
    const lines = rawContent.split("\n");
    const formattedBlocks = [];
    let currentList = null;
    let listType = null;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (currentList) {
          formattedBlocks.push(ContentRenderer._flushList(currentList, listType));
          currentList = null;
          listType = null;
        }
        return;
      }

      // Check unordered list item
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
        if (currentList && listType !== "ul") {
          formattedBlocks.push(ContentRenderer._flushList(currentList, listType));
          currentList = null;
        }
        if (!currentList) {
          currentList = [];
          listType = "ul";
        }
        currentList.push(trimmed.substring(2));
        return;
      }

      // Check ordered list item (e.g. 1. )
      const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (orderedMatch) {
        if (currentList && listType !== "ol") {
          formattedBlocks.push(ContentRenderer._flushList(currentList, listType));
          currentList = null;
        }
        if (!currentList) {
          currentList = [];
          listType = "ol";
        }
        currentList.push(orderedMatch[2]);
        return;
      }

      // Check blockquote (> )
      if (trimmed.startsWith("> ")) {
        if (currentList) {
          formattedBlocks.push(ContentRenderer._flushList(currentList, listType));
          currentList = null;
          listType = null;
        }
        formattedBlocks.push(`
          <blockquote class="p-3.5 my-2 border-l-4 border-indigo-500/80 bg-indigo-950/20 rounded-r-xl text-xs sm:text-sm text-indigo-200 italic">
            ${formatInlineText(trimmed.substring(2))}
          </blockquote>
        `);
        return;
      }

      // Regular paragraph line
      if (currentList) {
        formattedBlocks.push(ContentRenderer._flushList(currentList, listType));
        currentList = null;
        listType = null;
      }

      formattedBlocks.push(`<p class="leading-relaxed text-xs sm:text-sm text-slate-300">${formatInlineText(trimmed)}</p>`);
    });

    if (currentList) {
      formattedBlocks.push(ContentRenderer._flushList(currentList, listType));
    }

    let headingHtml = "";
    if (heading) {
      if (level === "h1") {
        headingHtml = `<h2 class="text-xl sm:text-2xl font-black text-white tracking-tight border-b border-slate-800 pb-2">${escapeHTML(heading)}</h2>`;
      } else if (level === "h2") {
        headingHtml = `<h3 class="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">${escapeHTML(heading)}</h3>`;
      } else {
        headingHtml = `
          <h4 class="text-base font-bold text-white flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center border border-indigo-500/30">${index + 1}</span>
            <span>${escapeHTML(heading)}</span>
          </h4>
        `;
      }
    }

    return `
      <div class="pf-block pf-block-text p-5 sm:p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3.5 transition">
        ${headingHtml}
        <div class="space-y-2.5">
          ${formattedBlocks.join("\n")}
        </div>
      </div>
    `;
  }

  static _flushList(items, type) {
    if (type === "ol") {
      return `
        <ol class="space-y-1.5 pl-5 list-decimal text-xs sm:text-sm text-slate-300 my-2 marker:text-indigo-400 marker:font-bold">
          ${items.map((it) => `<li>${formatInlineText(it)}</li>`).join("")}
        </ol>
      `;
    }
    return `
      <ul class="space-y-1.5 pl-2 text-xs sm:text-sm text-slate-300 my-2">
        ${items.map((it) => `
          <li class="flex items-start gap-2">
            <span class="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
            <span>${formatInlineText(it)}</span>
          </li>
        `).join("")}
      </ul>
    `;
  }

  /**
   * 2. IMAGE BLOCK
   */
  static renderImageBlock(data) {
    const url = data.url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60";
    const alt = data.alt || "PathForge Educational Diagram";
    const caption = data.caption || "";
    const alignment = data.alignment || "center"; // center | left | right
    const size = data.size || "medium"; // small | medium | full

    let alignClass = "mx-auto";
    if (alignment === "left") alignClass = "mr-auto";
    if (alignment === "right") alignClass = "ml-auto";

    let sizeClass = "max-w-2xl";
    if (size === "small") sizeClass = "max-w-md";
    if (size === "full") sizeClass = "w-full max-w-none";

    return `
      <div class="pf-block pf-block-image p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2.5">
        <div class="${alignClass} ${sizeClass} overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 shadow-xl group relative">
          <img 
            src="${escapeHTML(url)}" 
            alt="${escapeHTML(alt)}" 
            loading="lazy"
            class="w-full h-auto object-cover max-h-[500px] transition-transform duration-300 group-hover:scale-[1.01]"
            onerror="this.onerror=null; this.src='https://placehold.co/800x400/0f172a/6366f1?text=Image+Not+Found';"
          />
        </div>
        ${
          caption
            ? `<p class="text-center text-[11px] text-slate-400 font-medium italic">${formatInlineText(caption)}</p>`
            : ""
        }
      </div>
    `;
  }

  /**
   * 3. FLOWCHART BLOCK
   */
  static renderFlowchartBlock(data) {
    const title = data.title || "Logic & Process Flow";
    const nodes = Array.isArray(data.nodes) ? data.nodes : [];
    const connections = Array.isArray(data.connections) ? data.connections : [];

    // Fallback if no nodes specified
    if (nodes.length === 0) {
      return `
        <div class="pf-block pf-block-flowchart p-5 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
              <i data-lucide="git-merge" class="w-4 h-4 text-indigo-400"></i> ${escapeHTML(title)}
            </h4>
          </div>
          <div class="py-6 text-center text-xs text-slate-500">Flowchart nodes empty</div>
        </div>
      `;
    }

    // Render nodes in a clean structured sequence / grid diagram
    return `
      <div class="pf-block pf-block-flowchart p-5 sm:p-6 rounded-2xl bg-slate-950/90 border border-indigo-500/30 space-y-4 shadow-xl overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <i data-lucide="git-merge" class="w-4 h-4"></i>
            </div>
            <h4 class="text-xs sm:text-sm font-bold text-white tracking-wide">
              ${escapeHTML(title)}
            </h4>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
            Interactive Diagram
          </span>
        </div>

        <!-- Visual Graph Container -->
        <div class="pf-flowchart-canvas p-4 sm:p-6 rounded-xl bg-slate-900/50 border border-slate-800/60 overflow-x-auto flex flex-col items-center justify-center gap-3">
          ${nodes
            .map((node, i) => {
              const nodeType = node.type || "process";
              const outgoingConns = connections.filter((c) => c.from === node.id || c.from === String(i));

              let nodeBadgeStyle = "bg-slate-800 text-slate-200 border-slate-700";
              let shapeClass = "rounded-xl";
              let icon = "activity";

              if (nodeType === "start" || nodeType === "end") {
                nodeBadgeStyle = "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
                shapeClass = "rounded-full px-6";
                icon = nodeType === "start" ? "play-circle" : "check-circle";
              } else if (nodeType === "decision") {
                nodeBadgeStyle = "bg-amber-500/10 text-amber-300 border-amber-500/30";
                shapeClass = "rounded-2xl border-2";
                icon = "help-circle";
              } else if (nodeType === "io") {
                nodeBadgeStyle = "bg-cyan-500/10 text-cyan-300 border-cyan-500/30 skew-x-[-6deg]";
                shapeClass = "rounded-lg";
                icon = "terminal";
              } else {
                nodeBadgeStyle = "bg-indigo-500/10 text-indigo-200 border-indigo-500/30";
                shapeClass = "rounded-xl";
                icon = "cpu";
              }

              return `
                <div class="flex flex-col items-center group/node">
                  <!-- Node Body -->
                  <div class="pf-flow-node p-3 sm:p-4 text-xs sm:text-sm font-semibold border shadow-lg flex items-center gap-2.5 transition-all duration-300 hover:scale-105 ${nodeBadgeStyle} ${shapeClass} min-w-[160px] max-w-xs text-center justify-center">
                    <i data-lucide="${icon}" class="w-4 h-4 shrink-0"></i>
                    <span>${escapeHTML(node.text || `Step ${i + 1}`)}</span>
                  </div>

                  <!-- Outgoing Connectors / Arrows -->
                  ${
                    i < nodes.length - 1 || outgoingConns.length > 0
                      ? `
                    <div class="flex flex-col items-center my-1 text-slate-500">
                      ${
                        outgoingConns.length > 0 && outgoingConns[0].label
                          ? `<span class="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 my-0.5 shadow-sm">${escapeHTML(outgoingConns[0].label)}</span>`
                          : ""
                      }
                      <div class="w-0.5 h-5 bg-gradient-to-b from-indigo-500 to-cyan-400"></div>
                      <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-cyan-400 -mt-1.5 animate-bounce"></i>
                    </div>
                  `
                      : ""
                  }
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  /**
   * 4. CODE BLOCK
   */
  static renderCodeBlock(data) {
    const code = data.code || "// Write code here";
    const language = (data.language || "javascript").toLowerCase();
    const filename = data.filename || data.description || "";
    const codeId = `code_${Math.random().toString(36).substring(2, 9)}`;

    return `
      <div class="pf-block pf-block-code rounded-2xl bg-slate-950 border border-cyan-500/30 overflow-hidden shadow-2xl space-y-0">
        <!-- Code Header Toolbar -->
        <div class="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <div class="flex gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            </div>
            ${
              filename
                ? `<span class="text-xs font-mono font-bold text-slate-300 pl-1.5 border-l border-slate-700">${escapeHTML(filename)}</span>`
                : ""
            }
          </div>

          <div class="flex items-center gap-2">
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
              ${escapeHTML(language)}
            </span>
            <button 
              onclick="navigator.clipboard.writeText(document.getElementById('${codeId}').textContent).then(()=>{ const b=this; const t=b.innerHTML; b.innerHTML='Copied!'; setTimeout(()=>b.innerHTML=t, 2000); });"
              class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold rounded-lg border border-slate-700 transition cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <i data-lucide="copy" class="w-3 h-3"></i>
              <span>Copy</span>
            </button>
          </div>
        </div>

        <!-- Code Content -->
        <pre class="p-4 sm:p-5 bg-slate-950 font-mono text-xs sm:text-[13px] text-cyan-100 overflow-x-auto leading-relaxed selection:bg-cyan-500 selection:text-slate-950"><code id="${codeId}">${escapeHTML(code)}</code></pre>
      </div>
    `;
  }

  /**
   * 5. CALLOUT BLOCK
   */
  static renderCalloutBlock(data) {
    const type = data.type || "note"; // note | tip | warning | important
    const title = data.title || "";
    const content = data.content || "";

    const typesMap = {
      note: {
        border: "border-indigo-500/40",
        bg: "bg-indigo-950/20",
        text: "text-indigo-200",
        titleColor: "text-indigo-300",
        icon: "info",
        defaultTitle: "Note"
      },
      tip: {
        border: "border-emerald-500/40",
        bg: "bg-emerald-950/20",
        text: "text-emerald-200",
        titleColor: "text-emerald-300",
        icon: "lightbulb",
        defaultTitle: "Pro Tip"
      },
      warning: {
        border: "border-amber-500/40",
        bg: "bg-amber-950/20",
        text: "text-amber-200",
        titleColor: "text-amber-300",
        icon: "alert-triangle",
        defaultTitle: "Common Pitfall"
      },
      important: {
        border: "border-rose-500/40",
        bg: "bg-rose-950/20",
        text: "text-rose-200",
        titleColor: "text-rose-300",
        icon: "alert-circle",
        defaultTitle: "Key Principle"
      }
    };

    const cfg = typesMap[type] || typesMap.note;

    return `
      <div class="pf-block pf-block-callout p-4 sm:p-5 rounded-2xl ${cfg.bg} border ${cfg.border} space-y-2 relative shadow-lg">
        <div class="flex items-center gap-2">
          <i data-lucide="${cfg.icon}" class="w-4 h-4 ${cfg.titleColor} shrink-0"></i>
          <h4 class="text-xs font-bold uppercase tracking-wider ${cfg.titleColor}">
            ${escapeHTML(title || cfg.defaultTitle)}
          </h4>
        </div>
        <div class="text-xs sm:text-sm ${cfg.text} leading-relaxed pl-6 whitespace-pre-line">
          ${formatInlineText(content)}
        </div>
      </div>
    `;
  }

  /**
   * 6. TABLE BLOCK
   */
  static renderTableBlock(data) {
    const title = data.title || "";
    const headers = Array.isArray(data.headers) ? data.headers : ["Column 1", "Column 2"];
    const rows = Array.isArray(data.rows) ? data.rows : [["Data 1", "Data 2"]];

    return `
      <div class="pf-block pf-block-table p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 shadow-xl">
        ${
          title
            ? `<h4 class="text-xs font-bold uppercase tracking-wider text-slate-300">${escapeHTML(title)}</h4>`
            : ""
        }
        <div class="overflow-x-auto rounded-xl border border-slate-800">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-900/80 border-b border-slate-800 text-[11px] uppercase font-bold text-slate-200">
              <tr>
                ${headers.map((h) => `<th class="p-3 font-bold">${formatInlineText(h)}</th>`).join("")}
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-medium">
              ${rows
                .map(
                  (row) => `
                <tr class="hover:bg-slate-900/40 transition">
                  ${(Array.isArray(row) ? row : [row])
                    .map((cell) => `<td class="p-3 leading-relaxed">${formatInlineText(cell)}</td>`)
                    .join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}
