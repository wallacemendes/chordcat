export type ChordTemplate = {
    name: string;
    notes: number[];
};

export type ChordMatch = {
    root: number;
    baseName: string;
    extraTones: number[];
    omittedTones: number[];
    numAccidentals: number;
    bass?: number;
};

export const degrees = ["root", "♭2", "2", "♭3", "3", "4", "♭5", "5", "♭6", "6", "♭7", "7"];
export const compoundIntervalLabels = [
    "octave",
    "♭9",
    "9",
    "♭10",
    "10",
    "11",
    "♯11",
    "5",
    "♭13",
    "13",
    "♭7",
    "7",
];

export const sharpNames = ["A", "A♯", "B", "C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯"];
export const flatNames = ["A", "B♭", "B", "C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭"];

export const chordDb: ChordTemplate[] = [
    { name: "maj", notes: [4, 7] },
    { name: "7", notes: [4, 7, 10] },
    { name: "9", notes: [4, 7, 10, 2] },
    { name: "11", notes: [4, 7, 10, 2, 5] },
    { name: "13", notes: [4, 7, 10, 2, 5, 9] },
    { name: "min", notes: [3, 7] },
    { name: "m7", notes: [3, 7, 10] },
    { name: "m9", notes: [3, 7, 10, 2] },
    { name: "m11", notes: [3, 7, 10, 2, 5] },
    { name: "m13", notes: [3, 7, 10, 2, 5, 9] },
    { name: "maj7", notes: [4, 7, 11] },
    { name: "maj9", notes: [4, 7, 11, 2] },
    { name: "maj11", notes: [4, 7, 11, 2, 5] },
    { name: "maj13", notes: [4, 7, 11, 2, 5, 9] },
    { name: "mMaj7", notes: [3, 7, 11] },
    { name: "mMaj9", notes: [3, 7, 11, 2] },
    { name: "mMaj11", notes: [3, 7, 11, 2, 5] },
    { name: "mMaj13", notes: [3, 7, 11, 2, 5, 9] },
    { name: "sus2", notes: [2, 7] },
    { name: "7sus2", notes: [2, 7, 10] },
    { name: "maj7sus2", notes: [2, 7, 11] },
    { name: "sus4", notes: [5, 7] },
    { name: "7sus4", notes: [5, 7, 10] },
    { name: "9sus4", notes: [5, 7, 10, 2] },
    { name: "maj7sus4", notes: [5, 7, 11] },
    { name: "maj9sus4", notes: [5, 7, 11, 2] },
    { name: "dim", notes: [3, 6] },
    { name: "dim7", notes: [3, 6, 9] },
    { name: "dim9", notes: [3, 6, 9, 2] },
    { name: "dim11", notes: [3, 6, 9, 2, 5] },
    { name: "ø", notes: [3, 6, 10] },
    { name: "aug", notes: [4, 8] },
    { name: "aug7", notes: [4, 8, 10] },
    { name: "aug9", notes: [4, 8, 10, 2] },
    { name: "aug11", notes: [4, 8, 10, 2, 5] },
    { name: "aug13", notes: [4, 8, 10, 2, 5, 9] },
    { name: "augMaj7", notes: [4, 8, 11] },
    { name: "augMaj9", notes: [4, 8, 11, 2] },
    { name: "augMaj11", notes: [4, 8, 11, 2, 5] },
    { name: "augMaj13", notes: [4, 8, 11, 2, 5, 9] },
    { name: "6", notes: [4, 7, 9] },
    { name: "m6", notes: [3, 7, 9] },
];

export function mod12(value: number): number {
    return ((value % 12) + 12) % 12;
}

export function midiToPitchClassFromA0(midiNote: number): number {
    return mod12(midiNote - 21);
}

export function getNoteDistance(root: number, other: number): number {
    if (root > other) {
        return 12 + mod12(other - root);
    }
    return mod12(other - root);
}

export function setDifference(a: number[], b: number[]): number[] {
    const bSet = new Set(b);
    return a.filter((v) => !bSet.has(v));
}

export function formatChord(chord: ChordMatch, useSharps = true): string {
    const names = useSharps ? sharpNames : flatNames;
    let result = `${names[chord.root]}${chord.baseName}`;
    let remaining = chord.numAccidentals;

    if (remaining > 0) {
        result += "(";
    }

    for (const tone of chord.omittedTones) {
        remaining -= 1;
        result += `no${degrees[tone % 12]}${remaining === 0 ? ")" : ","}`;
    }

    for (const tone of chord.extraTones) {
        remaining -= 1;
        result += `${compoundIntervalLabels[tone % 12]}${remaining === 0 ? ")" : ","}`;
    }

    if (chord.bass !== undefined && chord.bass !== chord.root) {
        result += `/${names[chord.bass]}`;
    }

    return result;
}
