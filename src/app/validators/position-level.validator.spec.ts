import { FormControl } from '@angular/forms';
import {
  POSITION_LEVELS,
  findPositionLevel,
  positionLevelValidator,
} from './position-level.validator';

describe('position level validator', () => {
  it('detects every listed level as a prefix', () => {
    for (const level of POSITION_LEVELS) {
      expect(findPositionLevel(`${level} QA Engineer`)).toBe(level);
    }
  });

  it('matches case-insensitively and anywhere in the title', () => {
    expect(findPositionLevel('middle qa engineer')).toBe('middle');
    expect(findPositionLevel('QA Engineer (Senior)')).toBe('Senior');
    expect(findPositionLevel('Software Engineer, SENIOR')).toBe('SENIOR');
  });

  it('handles abbreviations and compound forms', () => {
    expect(findPositionLevel('Sr. Developer')).toBe('Sr');
    expect(findPositionLevel('Jr. Designer')).toBe('Jr');
    expect(findPositionLevel('Mid-level Developer')).toBe('Mid');
    expect(findPositionLevel('Middle+ Developer')).toBe('Middle');
    expect(findPositionLevel('Strong Junior Developer')).toBe('Strong');
  });

  it('ignores levels embedded inside other words', () => {
    expect(findPositionLevel('Middleware Engineer')).toBeNull();
    expect(findPositionLevel('Seniority Analyst')).toBeNull();
    expect(findPositionLevel('Internal Auditor')).toBeNull();
    expect(findPositionLevel('Midstream Analyst')).toBeNull();
  });

  it('accepts plain job titles and empty values', () => {
    expect(findPositionLevel('QA Engineer')).toBeNull();
    expect(findPositionLevel('Team Lead')).toBeNull();
    expect(findPositionLevel('')).toBeNull();
    expect(findPositionLevel(null)).toBeNull();
  });

  it('reports the offending level as a positionLevel error', () => {
    expect(positionLevelValidator(new FormControl('Middle QA Engineer'))).toEqual({
      positionLevel: { level: 'Middle' },
    });
    expect(positionLevelValidator(new FormControl('QA Engineer'))).toBeNull();
  });
});
