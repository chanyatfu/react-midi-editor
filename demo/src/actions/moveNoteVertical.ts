import { getSelectedNotes, getUnselectedNotes, sortNotes } from "@/utils/notes";
import { PianoRollData } from "@midi-editor/react";

export function moveNoteVertical(semitone: number) {
  return function (data: PianoRollData, set: (notes: Partial<PianoRollData>) => void) {
    const selectedNotes = sortNotes(getSelectedNotes(data));
    const unselectedNotes = getUnselectedNotes(data);
    selectedNotes.forEach((_, i) => {
      selectedNotes[i].noteNumber = selectedNotes[i].noteNumber + semitone;
    });
    set({ notes: [...unselectedNotes, ...selectedNotes] });
  };
}

export const downOctave = moveNoteVertical(-12);
export const upOctave = moveNoteVertical(12);
