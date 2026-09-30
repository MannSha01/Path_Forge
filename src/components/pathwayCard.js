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
    "glass-card p-6 rounded-2xl text-left transition-all duration-300 hover:-translate-y-1 bg-[#ebe7e0] border border-[#d8d3c8] hover:border-[#b8b0a2] hover:bg-[#e2ddd4] shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 group cursor-pointer";

  card.innerHTML = `
    <div>
      <div class="w-10 h-10 rounded-xl bg-[#ded9cf] border border-[#cec7bc] text-stone-800 flex items-center justify-center mb-3 group-hover:scale-110 transition shadow-2xs">
        <i data-lucide="${role.icon || 'compass'}" class="w-5 h-5"></i>
      </div>
      <h3 class="text-lg font-black text-black group-hover:text-stone-950 transition tracking-tight">${role.title}</h3>
      <p class="text-xs text-slate-800 mt-1.5 leading-relaxed font-medium">${role.tagline}</p>
    </div>

    <div class="flex items-center justify-between pt-2 border-t border-[#d8d3c8] w-full text-xs">
      <span class="text-slate-700 font-semibold">${role.steps ? role.steps.length : 0} Milestones</span>
      <span class="text-stone-900 font-extrabold flex items-center gap-1 group-hover:translate-x-0.5 group-hover:text-black transition">
        View Path <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
      </span>
    </div>
  `;

  if (typeof onSelect === "function") {
    card.addEventListener("click", () => onSelect(role));
  }

  return card;
}
