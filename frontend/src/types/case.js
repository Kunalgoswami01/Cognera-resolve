/**
 * @typedef {Object} CaseShape
 * @property {string} id - Unique identifier (UUID)
 * @property {string} title - Case dispute title
 * @property {string} company_name - Company / Merchant under dispute
 * @property {string} issue_category - Category (retail, utilities, telecom, financial, other)
 * @property {string} status - Case lifecycle status (draft, analyzing, collecting, ready, resolved)
 * @property {string} current_step - Fine-grained status indicator (case_created, intake_processed, evidence_collected)
 * @property {number} readiness_score - Completeness score percentage (0-100)
 * @property {string|null} summary - Detailed AI / user summary of the issue
 * @property {number|null} amount - Disputed financial amount
 * @property {string|null} purchase_date - Date of transaction / purchase (ISO or date string)
 * @property {string} created_at - Timestamp of creation (ISO string)
 * @property {string} updated_at - Timestamp of last modification (ISO string)
 */

/**
 * Returns a default empty case structure to prevent undefined rendering errors
 * @returns {CaseShape}
 */
export const createDefaultCase = () => ({
  id: '',
  title: '',
  company_name: '',
  issue_category: 'other',
  status: 'draft',
  current_step: 'case_created',
  readiness_score: 0,
  summary: null,
  amount: null,
  purchase_date: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

/**
 * Validates if the given object matches the case shape requirements
 * @param {Object} caseObj
 * @returns {boolean}
 */
export const isValidCase = (caseObj) => {
  return (
    caseObj &&
    typeof caseObj.id === 'string' &&
    typeof caseObj.title === 'string' &&
    typeof caseObj.company_name === 'string' &&
    typeof caseObj.readiness_score === 'number'
  );
};
