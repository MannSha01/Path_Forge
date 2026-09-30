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
    "glass-card p-6 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 bg-emerald-50/70 border border-teal-200/90 hover:border-teal-500 hover:bg-emerald-100/60 shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 group cursor-pointer";

  card.innerHTML = `
    <div>
      <div class="w-10 h-10 rounded-xl bg-teal-100/90 border border-teal-200 text-teal-800 flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-xs">
        <i data-lucide="${role.icon || 'compass'}" class="w-5 h-5"></i>
      </div>
      <h3 class="text-lg font-black text-black group-hover:text-teal-950 transition tracking-tight">${role.title}</h3>
      <p class="text-xs text-slate-800 mt-1.5 leading-relaxed font-medium">${role.tagline}</p>
    </div>

    <div class="flex items-center justify-between pt-2 border-t border-teal-200/80 w-full text-xs">
      <span class="text-slate-700 font-semibold">${role.steps ? role.steps.length : 0} Milestones</span>
      <span class="text-teal-800 font-extrabold flex items-center gap-1 group-hover:translate-x-0.5 group-hover:text-black transition">
        View Path <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
      </span>
    </div>
  `;

  if (typeof onSelect === "function") {
    card.addEventListener("click", () => onSelect(role));
  }

  return card;
}
