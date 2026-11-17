import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Seniority levels that company policy forbids in signatures: the signature
 * shows only the job title ("QA Engineer", not "Middle QA Engineer").
 * "Mid" also covers "Mid-level"; "Strong" covers "Strong Junior/Middle".
 */
export const POSITION_LEVELS = [
  'Intern',
  'Trainee',
  'Junior',
  'Jr',
  'Middle',
  'Mid',
  'Senior',
  'Sr',
  'Strong',
] as const;

// Whole-word, case-insensitive match. Avoids lookbehind, which older Safari
// cannot parse (a regex literal syntax error would break the whole app).
const POSITION_LEVEL_PATTERN = new RegExp(
  `(^|[^\\p{L}\\p{N}])(${POSITION_LEVELS.join('|')})(?=$|[^\\p{L}\\p{N}])`,
  'iu',
);

/**
 * Returns the level as typed (e.g. "middle", "Sr") if the title contains one,
 * otherwise null.
 */
export function findPositionLevel(title: string | null | undefined): string | null {
  if (!title) {
    return null;
  }
  const match = POSITION_LEVEL_PATTERN.exec(title);
  return match ? match[2] : null;
}

export const positionLevelValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const level = findPositionLevel(control.value);
  return level ? { positionLevel: { level } } : null;
};
