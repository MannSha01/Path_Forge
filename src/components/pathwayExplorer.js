// ===================================================
// PATH FORGE - PATHWAY EXPLORER COMPONENT
// Domain selection (Tech vs Non-Tech) and Role Grid view
// ===================================================

import { $, show, hide, refreshLucide } from "../utils/dom.js";
import { createPathwayCard } from "./pathwayCard.js";

/**
 * Initialize the pathway explorer views and controls.
 *
 * @param {object} options
 * @param {Record<string, { categoryName: string, roles: Array<any> }>} options.pathwaysData
 * @param {(categoryKey: string) => void} options.onSelectCategory
 * @param {(role: object) => void} options.onSelectRole
 */
export function initPathwayExplorer({ pathwaysData, onSelectCategory, onSelectRole }) {
  const techBtn = $("#btn-select-tech");
  const nonTechBtn = $("#btn-select-non-tech");

  if (techBtn) {
    techBtn.addEventListener("click", () => onSelectCategory("tech"));
  }

  if (nonTechBtn) {
    nonTechBtn.addEventListener("click", () => onSelectCategory("non-tech"));
  }
}

/**
 * Render the roles grid for a selected domain category.
 *
 * @param {string} categoryKey
 * @param {Record<string, { categoryName: string, roles: Array<any> }>} pathwaysData
 * @param {(role: object) => void} onSelectRole
 */
export function renderRolesGrid(categoryKey, pathwaysData, onSelectRole) {
  const categoryData = pathwaysData[categoryKey];
  if (!categoryData) return;

  const roleCategoryBadge = $("#role-category-badge");
  const roleCategoryTitle = $("#role-category-title");
  const rolesGrid = $("#roles-grid");

  if (roleCategoryBadge) {
    roleCategoryBadge.textContent = `Category: ${categoryData.categoryName}`;
  }

  if (roleCategoryTitle) {
    roleCategoryTitle.textContent = `Select Your ${categoryData.categoryName} Role`;
  }

  if (rolesGrid) {
    rolesGrid.innerHTML = "";
    categoryData.roles.forEach((role) => {
      const card = createPathwayCard(role, onSelectRole);
      rolesGrid.appendChild(card);
    });
  }

  refreshLucide();
}
