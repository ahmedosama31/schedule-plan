import { SchedulePreferences } from './preferences';
import { CourseSelection, Section, SectionType } from './types';
import {
    compareScheduleOptions,
    enumerateScheduleOptions,
    ScheduleOption,
    scheduleOptionSignature,
} from './optimizer';

export type FriendOptimizationMode = 'maximum-matches' | 'balanced';

export interface FriendStudentInput {
    selections: CourseSelection[];
    preferences: SchedulePreferences;
}

export interface MatchedSection {
    courseCode: string;
    type: SectionType.Lecture | SectionType.Tutorial;
    section: Section;
}

export interface FriendSearchMetadata {
    student1Checked: number;
    student2Checked: number;
    student1Candidates: number;
    student2Candidates: number;
    pairsCompared: number;
    searchWasLimited: boolean;
}

export interface FriendScheduleOption {
    student1: ScheduleOption;
    student2: ScheduleOption;
    matchedSections: MatchedSection[];
    matchCount: number;
    matchableCount: number;
    matchRatio: number;
    pairQuality: number;
    balancedScore: number;
}

export interface FriendOptimizationResult {
    options: FriendScheduleOption[];
    metadata: FriendSearchMetadata;
}

interface CandidateInfo {
    option: ScheduleOption;
    matchKeys: string[];
    matchKeySet: Set<string>;
    quality: number;
}

const MAX_INDIVIDUAL_CANDIDATES = 500;
const MAX_SIGNATURE_CANDIDATES = 1000;

function matchKey(courseCode: string, section: Section): string {
    return `${courseCode}|${section.type}|${section.id}`;
}

function getMatchSections(option: ScheduleOption, commonCodes: Set<string>): MatchedSection[] {
    const sections: MatchedSection[] = [];
    for (const choice of option.choices) {
        if (!commonCodes.has(choice.course.code)) continue;
        for (const section of choice.sections) {
            if (section.type !== SectionType.Lecture && section.type !== SectionType.Tutorial) continue;
            sections.push({
                courseCode: choice.course.code,
                type: section.type,
                section,
            });
        }
    }
    return sections.sort((a, b) => matchKey(a.courseCode, a.section).localeCompare(matchKey(b.courseCode, b.section)));
}

function createCandidatePool(options: ScheduleOption[], commonCodes: Set<string>): CandidateInfo[] {
    const sorted = [...options].sort(compareScheduleOptions);
    const selected = new Map<string, ScheduleOption>();

    for (const option of sorted.slice(0, MAX_INDIVIDUAL_CANDIDATES)) {
        selected.set(scheduleOptionSignature(option), option);
    }

    const bestByMatchSignature = new Map<string, ScheduleOption>();
    for (const option of sorted) {
        const signature = getMatchSections(option, commonCodes)
            .map(item => matchKey(item.courseCode, item.section))
            .join('||');
        if (!bestByMatchSignature.has(signature)) bestByMatchSignature.set(signature, option);
    }

    for (const option of Array.from(bestByMatchSignature.values()).slice(0, MAX_SIGNATURE_CANDIDATES)) {
        selected.set(scheduleOptionSignature(option), option);
    }

    const pool = Array.from(selected.values()).sort(compareScheduleOptions);
    const denominator = Math.max(1, pool.length - 1);
    return pool.map((option, index) => {
        const matchKeys = getMatchSections(option, commonCodes).map(item => matchKey(item.courseCode, item.section));
        return {
            option,
            matchKeys,
            matchKeySet: new Set(matchKeys),
            quality: pool.length === 1 ? 1 : 1 - index / denominator,
        };
    });
}

function getMatchableCount(student1: CourseSelection[], student2: CourseSelection[]): number {
    const courses2 = new Map(student2.map(selection => [selection.course.code, selection.course]));
    let count = 0;

    for (const { course } of student1) {
        const other = courses2.get(course.code);
        if (!other) continue;
        for (const type of [SectionType.Lecture, SectionType.Tutorial]) {
            if (course.sections.some(section => section.type === type) && other.sections.some(section => section.type === type)) {
                count++;
            }
        }
    }
    return count;
}

function comparePairQuality(a: FriendScheduleOption, b: FriendScheduleOption): number {
    const aDays = a.student1.dayCount + a.student2.dayCount;
    const bDays = b.student1.dayCount + b.student2.dayCount;
    if (aDays !== bDays) return aDays - bDays;

    const aGaps = a.student1.gapScore + a.student2.gapScore;
    const bGaps = b.student1.gapScore + b.student2.gapScore;
    if (aGaps !== bGaps) return aGaps - bGaps;

    const aHealth = a.student1.healthScore + a.student2.healthScore;
    const bHealth = b.student1.healthScore + b.student2.healthScore;
    if (aHealth !== bHealth) return bHealth - aHealth;

    const aSignature = `${scheduleOptionSignature(a.student1)}##${scheduleOptionSignature(a.student2)}`;
    const bSignature = `${scheduleOptionSignature(b.student1)}##${scheduleOptionSignature(b.student2)}`;
    return aSignature.localeCompare(bSignature);
}

function compareFriendOptions(mode: FriendOptimizationMode, a: FriendScheduleOption, b: FriendScheduleOption): number {
    if (mode === 'balanced' && a.balancedScore !== b.balancedScore) {
        return b.balancedScore - a.balancedScore;
    }
    if (a.matchCount !== b.matchCount) return b.matchCount - a.matchCount;
    return comparePairQuality(a, b);
}

export function optimizeFriendSchedules(
    student1: FriendStudentInput,
    student2: FriendStudentInput,
    mode: FriendOptimizationMode,
    topN = 5,
): FriendOptimizationResult {
    if (student1.selections.length === 0 || student2.selections.length === 0) {
        return {
            options: [],
            metadata: {
                student1Checked: 0,
                student2Checked: 0,
                student1Candidates: 0,
                student2Candidates: 0,
                pairsCompared: 0,
                searchWasLimited: false,
            },
        };
    }

    const codes1 = new Set(student1.selections.map(selection => selection.course.code));
    const commonCodes = new Set(student2.selections.map(selection => selection.course.code).filter(code => codes1.has(code)));

    const search1 = enumerateScheduleOptions(
        student1.selections.map(selection => selection.course),
        student1.preferences,
        student1.selections,
    );
    const search2 = enumerateScheduleOptions(
        student2.selections.map(selection => selection.course),
        student2.preferences,
        student2.selections,
    );

    const pool1 = createCandidatePool(search1.options, commonCodes);
    const pool2 = createCandidatePool(search2.options, commonCodes);
    const matchableCount = getMatchableCount(student1.selections, student2.selections);
    const best: FriendScheduleOption[] = [];
    let pairsCompared = 0;

    for (const candidate1 of pool1) {
        for (const candidate2 of pool2) {
            pairsCompared++;
            const smaller = candidate1.matchKeys.length <= candidate2.matchKeys.length ? candidate1 : candidate2;
            const larger = smaller === candidate1 ? candidate2 : candidate1;
            const matchCount = smaller.matchKeys.reduce(
                (count, key) => count + (larger.matchKeySet.has(key) ? 1 : 0),
                0,
            );
            const matchRatio = matchableCount > 0 ? matchCount / matchableCount : 0;
            const pairQuality = (candidate1.quality + candidate2.quality) / 2;
            const option: FriendScheduleOption = {
                student1: candidate1.option,
                student2: candidate2.option,
                matchedSections: [],
                matchCount,
                matchableCount,
                matchRatio,
                pairQuality,
                balancedScore: 0.5 * matchRatio + 0.5 * pairQuality,
            };

            best.push(option);
            best.sort((a, b) => compareFriendOptions(mode, a, b));
            if (best.length > topN) best.pop();
        }
    }

    for (const option of best) {
        const student2Keys = new Set(getMatchSections(option.student2, commonCodes).map(item => matchKey(item.courseCode, item.section)));
        option.matchedSections = getMatchSections(option.student1, commonCodes)
            .filter(item => student2Keys.has(matchKey(item.courseCode, item.section)));
    }

    return {
        options: best,
        metadata: {
            student1Checked: search1.checkedCount,
            student2Checked: search2.checkedCount,
            student1Candidates: pool1.length,
            student2Candidates: pool2.length,
            pairsCompared,
            searchWasLimited: search1.limited || search2.limited,
        },
    };
}
