/**
 * jobTitleUtils.ts
 *
 * Shared utilities for job title formatting and uniqueness validation.
 * Used by JobCreationForm and JobSettings.
 */

/**
 * Words / abbreviations that should always appear in ALL-CAPS,
 * regardless of how the user typed them.
 */
export const ALWAYS_UPPERCASE: string[] = [
    'AI', 'ML', 'UI', 'UX', 'HR', 'API', 'APIs',
    'SRE', 'QA', 'QC', 'VR', 'AR', 'MR',
    'iOS', 'CTO', 'CEO', 'CFO', 'COO', 'CMO', 'CXO', 'VP',
    'IT', 'SQL', 'PHP', 'JS', 'TS', 'CSS', 'HTML',
    'AWS', 'GCP', 'Azure',
    'B2B', 'B2C', 'B2G', 'D2C',
    'SEO', 'SEM', 'CRM', 'ERP', 'LMS', 'CMS',
    'DevOps', 'MLOps', 'DataOps', 'FinOps',
    'IoT', 'SaaS', 'PaaS', 'IaaS',
    'NLP', 'CV', 'BI',
];

// Build a lowercase → canonical lookup for O(1) matching
const UPPERCASE_MAP: Record<string, string> = {};
ALWAYS_UPPERCASE.forEach(abbr => {
    UPPERCASE_MAP[abbr.toLowerCase()] = abbr;
});

/**
 * Format a raw job title string:
 *  1. Trims leading/trailing whitespace.
 *  2. Collapses multiple internal spaces to a single space.
 *  3. Title-cases each word (first letter upper, rest lower).
 *  4. Restores known abbreviations (AI, ML, UI, …) to their canonical form.
 *
 * This function is designed to be called on every keystroke — it is
 * intentionally idempotent and non-destructive.
 *
 * @param raw - The value directly from the input element.
 * @returns  The formatted title.
 */
export function formatJobTitle(raw: string): string {
    if (!raw) return '';

    // Collapse internal whitespace but preserve trailing space while the user is
    // still typing (so we don't prevent them from typing the next word).
    const trailingSpace = raw.endsWith(' ');
    const words = raw.trim().replace(/\s+/g, ' ').split(' ');

    const formatted = words.map(word => {
        if (!word) return '';

        // Check abbreviation lookup (case-insensitive)
        const canonical = UPPERCASE_MAP[word.toLowerCase()];
        if (canonical) return canonical;

        // Regular title-case: first letter uppercase, rest lowercase
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    return formatted.join(' ') + (trailingSpace ? ' ' : '');
}

/**
 * Returns an error message if the detected state is a duplicate;
 * empty string otherwise.
 */
export function getDuplicateTitleError(titleWarning: string): string {
    return titleWarning
        ? 'This job title already exists. Please choose another name.'
        : '';
}
