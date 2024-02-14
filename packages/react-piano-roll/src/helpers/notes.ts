import { TrackNoteEvent } from "@/types/TrackNoteEvent";
import { useStore } from "@/hooks/useStore";

export function focusNote(e: Event, id: string) {
  const componentRef = e.currentTarget as HTMLDivElement;
  const childElement = componentRef.querySelector(`[data-note-id="${id}"] input`) as HTMLInputElement;
  console.log(childElement);
  console.log;
  childElement!.focus();
}

// export function focusNote<T extends HTMLElement>(noteElement: T): void {
//   const inputElement = noteElement.querySelector("&+input") as HTMLInputElement;
//   console.log(noteElement);
//   console.log(inputElement);
//   noteElement.focus();
// }

export function useNotes() {
  const { pianoRollStore } = useStore();
  return pianoRollStore.notes;
}

export function getStartingTickFromNotes(notes: TrackNoteEvent[]): number {
  const startTick = notes.reduce((min, note) => Math.min(min, note.tick), Infinity);
  return startTick;
}

export function getEndingTickFromNotes(notes: TrackNoteEvent[]) {
  const endTick = notes.reduce((max, note) => Math.max(max, note.tick + note.duration), -Infinity);
  return endTick;
}

export function getSelectionRangeWithSelectedNotes(
  selectedNotes: TrackNoteEvent[],
  selectionRange: [number, number] | null,
): [number, number] {
  if (selectionRange === null) {
    return [getStartingTickFromNotes(selectedNotes), getEndingTickFromNotes(selectedNotes)];
  }
  const startingNoteTick = getStartingTickFromNotes(selectedNotes);
  const endingNoteTick = getEndingTickFromNotes(selectedNotes);
  return [Math.min(startingNoteTick, selectionRange[0]), Math.max(endingNoteTick, selectionRange[1])];
}
