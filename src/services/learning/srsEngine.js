// ===================================================
// PATH FORGE - SPACED REPETITION ENGINE (SM-2)
// SuperMemo-2 algorithm for long-term interview concept retention
// ===================================================

import { LocalStorageService } from "../storage/localStorageService.js";

const DEFAULT_EASE_FACTOR = 2.5;

/**
 * Baseline concept flashcards automatically loaded for preparation.
 */
const BASELINE_FLASHCARDS = [
  {
    id: "srs_fe_1",
    topicId: "tech-fe-1",
    category: "Frontend Architecture",
    front: "What is the primary difference between Virtual DOM and Shadow DOM?",
    back: "Virtual DOM is an in-memory lightweight JavaScript tree used by libraries (like React) for reconciliation and batching updates. Shadow DOM is a native browser specification providing true scoped CSS and DOM encapsulation in Web Components."
  },
  {
    id: "srs_fe_2",
    topicId: "tech-fe-2",
    category: "Web Performance",
    front: "What is the Critical Rendering Path and what causes Layout Thrashing?",
    back: "The Critical Rendering Path is: HTML -> DOM + CSSOM -> Render Tree -> Layout -> Paint. Layout Thrashing happens when JavaScript repeatedly queries geometric properties (like offsetHeight) immediately after mutating styles, forcing synchronous reflows."
  },
  {
    id: "srs_be_1",
    topicId: "tech-be-1",
    category: "Backend & Systems",
    front: "Explain the CAP Theorem and why pure CA distributed databases do not exist across WANs.",
    back: "Consistency, Availability, Partition Tolerance. Network partitions (P) are an unavoidable physical reality across networks. When a partition occurs, an architecture MUST choose between Consistency (refusing stale writes) or Availability (accepting stale reads/writes)."
  },
  {
    id: "srs_be_2",
    topicId: "tech-be-2",
    category: "Database Engineering",
    front: "What is the difference between Optimistic vs. Pessimistic Locking?",
    back: "Pessimistic locking holds database-level record locks (SELECT FOR UPDATE) preventing concurrent access. Optimistic locking allows concurrent reads, validating a version counter or timestamp upon commit, rolling back if a conflict is detected."
  },
  {
    id: "srs_algo_1",
    topicId: "tech-algo-1",
    category: "System Design",
    front: "How does a Bloom Filter work and what is its false positive/negative guarantee?",
    back: "A space-efficient probabilistic data structure using multiple hash functions over a bit array. It guarantees: NO FALSE NEGATIVES (if it says an element is absent, it is 100% absent), but may have FALSE POSITIVES (if it says present, it might not be)."
  },
  {
    id: "srs_algo_2",
    topicId: "tech-algo-2",
    category: "Distributed Systems",
    front: "What is Idempotency in API design and how do you implement it for payment processing?",
    back: "An idempotent operation produces the exact same side-effect regardless of how many times it is executed. Implemented by client-generated Idempotency-Keys (UUIDs) cached in Redis/DB with unique constraints, returning the stored response for duplicate requests."
  }
];

export const srsEngine = {
  /**
   * SuperMemo-2 (SM-2) Next Interval Calculation.
   *
   * @param {object} card - The flashcard object
   * @param {number} quality - Rating from 1 (blackout) to 5 (perfect recall)
   * @returns {object} Updated card properties { repetitions, intervalDays, easeFactor, nextReviewDate }
   */
  calculateSM2(card = {}, quality = 3) {
    const q = Math.max(1, Math.min(5, quality));
    let repetitions = card.repetitions || 0;
    let intervalDays = card.intervalDays || 1;
    let easeFactor = card.easeFactor || DEFAULT_EASE_FACTOR;

    // Quality < 3 indicates failure/blackout -> reset repetitions
    if (q < 3) {
      repetitions = 0;
      intervalDays = 1;
    } else {
      if (repetitions === 0) {
        intervalDays = 1;
      } else if (repetitions === 1) {
        intervalDays = q === 5 ? 6 : 4;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
      repetitions += 1;
    }

    // New Ease Factor calculation (clamped to minimum 1.3)
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    easeFactor = Math.max(1.3, Number(easeFactor.toFixed(2)));

    const nextReviewDate = new Date(Date.now() + intervalDays * 86400000).toISOString();

    return {
      repetitions,
      intervalDays,
      easeFactor,
      nextReviewDate,
      lastReviewedAt: new Date().toISOString(),
      totalReviews: (card.totalReviews || 0) + 1
    };
  },

  /**
   * Gets all flashcards for a user, initializing baseline cards if none exist.
   * @param {string} userId
   * @returns {object[]}
   */
  getCards(userId = "default") {
    const key = `srs_cards_${userId}`;
    let cards = LocalStorageService.get(key, null);

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      cards = BASELINE_FLASHCARDS.map((c) => ({
        ...c,
        repetitions: 0,
        intervalDays: 1,
        easeFactor: DEFAULT_EASE_FACTOR,
        nextReviewDate: new Date(Date.now() - 60000).toISOString(), // Due immediately
        lastReviewedAt: null,
        totalReviews: 0
      }));
      LocalStorageService.set(key, cards);
    }

    return cards;
  },

  /**
   * Returns cards due for review today.
   * @param {string} userId
   * @param {number} [limit=10]
   * @returns {object[]}
   */
  getDueCards(userId = "default", limit = 10) {
    const cards = this.getCards(userId);
    const now = new Date();

    const due = cards.filter((c) => {
      if (!c.nextReviewDate) return true;
      return new Date(c.nextReviewDate) <= now;
    });

    return due.slice(0, limit);
  },

  /**
   * Records a user's review for a flashcard and updates the schedule.
   *
   * @param {string} userId
   * @param {string} cardId
   * @param {number} quality - 1 (Again), 2 (Hard), 3 (Good), 5 (Easy)
   * @returns {object | null}
   */
  recordReview(userId = "default", cardId, quality) {
    const key = `srs_cards_${userId}`;
    const cards = this.getCards(userId);
    const cardIdx = cards.findIndex((c) => c.id === cardId);

    if (cardIdx === -1) return null;

    const updatedProps = this.calculateSM2(cards[cardIdx], quality);
    cards[cardIdx] = {
      ...cards[cardIdx],
      ...updatedProps
    };

    LocalStorageService.set(key, cards);
    return cards[cardIdx];
  },

  /**
   * Adds new flashcards extracted from a completed lesson.
   *
   * @param {string} userId
   * @param {object[]} newCards
   */
  addCards(userId = "default", newCards = []) {
    if (!newCards || newCards.length === 0) return;
    const key = `srs_cards_${userId}`;
    const cards = this.getCards(userId);

    newCards.forEach((nc) => {
      if (!cards.some((c) => c.front === nc.front)) {
        cards.push({
          id: `srs_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          repetitions: 0,
          intervalDays: 1,
          easeFactor: DEFAULT_EASE_FACTOR,
          nextReviewDate: new Date().toISOString(),
          lastReviewedAt: null,
          totalReviews: 0,
          ...nc
        });
      }
    });

    LocalStorageService.set(key, cards);
  }
};
