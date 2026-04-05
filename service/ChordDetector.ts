import {
    chordDb,
    formatChord,
    sharpNames,
    flatNames,
    getNoteDistance,
    midiToPitchClassFromA0,
    setDifference,
} from "./utils.ts";
import type { ChordMatch } from "./utils.ts";

function uniqueSorted(values: number[]): number[] {
    return Array.from(new Set(values)).sort((a, b) => a - b);
}

function compareChords(a: ChordMatch, b: ChordMatch): number {
    if (a.numAccidentals !== b.numAccidentals) return a.numAccidentals - b.numAccidentals;
    if (a.root !== b.root) return a.root - b.root;
    return a.baseName.localeCompare(b.baseName);
}

function insertBestChordForRoot(root: number, intervals: number[], result: ChordMatch[]): void {
    const candidates: ChordMatch[] = [];

    for (const template of chordDb) {
        const omitted = setDifference(template.notes, intervals);
        const extra = setDifference(intervals, template.notes);
        candidates.push({
            root,
            baseName: template.name,
            omittedTones: omitted,
            extraTones: extra,
            numAccidentals: omitted.length + extra.length,
        });
    }

    if (candidates.length === 0) return;
    candidates.sort(compareChords);
    result.push(candidates[0]);
}

export function detectChordsFromMidi(midiNotes: number[]): ChordMatch[] {
    if (!Array.isArray(midiNotes) || midiNotes.length === 0) {
        return [];
    }

    const pitchClasses = uniqueSorted(midiNotes.map(midiToPitchClassFromA0));
    const result: ChordMatch[] = [];

    for (const root of pitchClasses) {
        const intervals: number[] = [];
        for (const other of pitchClasses) {
            if (other === root) continue;
            intervals.push(getNoteDistance(root, other));
        }
        insertBestChordForRoot(root, uniqueSorted(intervals), result);
    }

    result.sort(compareChords);
    if (result.length === 0) return [];

    const bassPitchClass = midiToPitchClassFromA0(Math.min(...midiNotes));
    const bestAccidentals = result[0].numAccidentals;
    const best = result.filter((c) => c.numAccidentals === bestAccidentals);

    for (const chord of best) {
        chord.bass = bassPitchClass;
    }

    return best;
}

export function detectChordNameFromMidi(midiNotes: number[], useSharps = true): string {
    const chords = detectChordsFromMidi(midiNotes);
    if (chords.length === 0) {
        return "";
    }
    const chord = chords[0];
    if (chord.numAccidentals === 0 && ["maj", "sus2", "sus4"].includes(chord.baseName)) {
        const names = useSharps ? sharpNames : flatNames;
        const base = names[chord.root];
        if (chord.bass !== undefined && chord.bass !== chord.root) {
            return `${base}/${names[chord.bass]}`;
        }
        return base;
    }
    return formatChord(chord, useSharps);
}
