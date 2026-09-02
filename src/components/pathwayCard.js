// ===================================================
// PATH FORGE - PATHWAY CARD COMPONENT
// Renders an individual role card for the roles grid
// ===================================================

/**
 * Creates a role card button element.
 *
 * @param {object} role
 * @param {(role: object) => void} onSelect
 * @returns {HTMLButtonElement}
 */
export function createPathwayCard(role, onSelect) {
  const card = document.createElement("button");
  card.className =
    "glass-card p-6 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 border border-slate-800 hover:border-indigo-500/50 flex flex-col justify-between space-y-4 group cursor-pointer";

  card.innerHTML = `
    <div>
      <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
        <i data-lucide="${role.icon || 'compass'}" class="w-5 h-5"></i>
      </div>
      <h3 class="text-lg font-bold text-white group-hover:text-indigo-300 transition">${role.title}</h3>
      <p class="text-xs text-slate-400 mt-1.5 leading-relaxed">${role.tagline}</p>
    </div>

    <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 w-full text-xs">
      <span class="text-slate-500 font-medium">${role.steps ? role.steps.length : 0} Milestones</span>
      <span class="text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition">
        View Path <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
      </span>
    </div>
  `;

  if (typeof onSelect === "function") {
    card.addEventListener("click", () => onSelect(role));
  }

  return card;
}
