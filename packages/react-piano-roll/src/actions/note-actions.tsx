import { TrackNoteEvent, VibratoMode } from "@/types";
import { PianoRollStore } from "@/store/pianoRollStore";
import { v4 as uuidv4 } from "uuid";
import { PianoRollHistoryItemType, getChoppedHistoryAfterHead } from "./history-action";
import _ from "lodash";
import { clampDuration, clampNoteNumber, clampTick, clampVelocity } from "@/helpers/number";
import { defaultNoteLyric } from "@/constants";

export type NoteAction =
  | AddNoteAction
  | AddNotesAction
  | ModifyingNotesAction
  | DeleteSelectedNotesAction
  | UpdateNoteLyricAction
  | ToggleSelectedNoteVibratoModeAction
  | VibratoDepthDelayChangeSelectedNoteAction
  | VibratoRateChangeSelectedNoteAction
  | MoveNoteAsLatestModifiedAction
  | SetNoteModificationBufferWithSelectedNoteAction
  | SetNoteModificationBufferWithAllNoteAction
  | SetBpmAction
  | SetLastModifiedVelocityAction
  | SetLastModifiedDurationAction;

export function createNote(state: PianoRollStore, ticks: number, noteNum: number): TrackNoteEvent {
  return {
    id: uuidv4(),
    tick: ticks,
    noteNumber: noteNum,
    velocity: state.lastModifiedVelocity,
    lyric: defaultNoteLyric,
    duration: state.lastModifiedDuration,
    isSelected: true,
    isActive: true,
    vibratoDepth: 10,
    vibratoRate: 30,
    vibratoDelay: state.lastModifiedDuration * 0.3,
    vibratoMode: VibratoMode.Normal,
  };
}

type AddNoteAction = {
  type: "ADD_NOTE";
  payload: { ticks: number; noteNum: number };
};
export function addNote(state: PianoRollStore, action: AddNoteAction) {
  const newNote = createNote(state, action.payload.ticks, action.payload.noteNum);
  return {
    ...state,
    notes: [...state.notes, newNote],
    notesHistory: {
      head: state.notesHistory.head + 1,
      history: [
        ...getChoppedHistoryAfterHead(state.notesHistory),
        { type: PianoRollHistoryItemType.ADD_NOTE, note: [newNote] },
      ],
    },
  };
}

type AddNotesAction = {
  type: "ADD_NOTES";
  payload: { notes: TrackNoteEvent[] };
};
export function addNotes(state: PianoRollStore, action: AddNotesAction) {
  const newNotes = action.payload.notes.map((note) => ({
    ...note,
    id: uuidv4(),
  }));
  return {
    ...state,
    notes: [...state.notes, ...newNotes],
    notesHistory: {
      head: state.notesHistory.head + 1,
      history: [
        ...getChoppedHistoryAfterHead(state.notesHistory),
        { type: PianoRollHistoryItemType.ADD_NOTE, note: newNotes },
      ],
    },
  };
}

type ModifyingNotesAction = {
  type: "MODIFYING_NOTES";
  payload: { notes: TrackNoteEvent[] };
};
export function modifyingNotes(state: PianoRollStore, action: ModifyingNotesAction) {
  const { history, head } = state.notesHistory;
  const prevHistory = history[head]?.note;
  const notesIdsToBeModified = action.payload.notes.map((note) => note.id);
  const notesNotModified = state.notes.filter((note) => !notesIdsToBeModified.includes(note.id));
  const notesModifiedWithClampValue = action.payload.notes.map((note) => ({
    ...note,
    noteNumber: clampNoteNumber(note.noteNumber),
    velocity: clampVelocity(note.velocity),
    tick: clampTick(note.tick),
    duration: clampDuration(note.duration),
  }));
  const newStateWithoutHistory = {
    ...state,
    notes: [...notesNotModified, ...notesModifiedWithClampValue],
  };
  if (_.isEqual(prevHistory, state.noteModificationBuffer.notesSelected)) {
    return {
      ...newStateWithoutHistory,
    };
  } else {
    return {
      ...newStateWithoutHistory,
      notesHistory: {
        head: state.notesHistory.head + 1,
        history: [
          ...getChoppedHistoryAfterHead(state.notesHistory),
          {
            type: PianoRollHistoryItemType.MODIFY_NOTE,
            note: state.noteModificationBuffer.notesSelected,
          },
        ],
      },
    };
  }
}

type DeleteSelectedNotesAction = { type: "DELETE_SELECTED_NOTES" };
export function deleteSelectedNotes(state: PianoRollStore, action: DeleteSelectedNotesAction) {
  const notesToBeDeleted = state.notes.filter((note) => note.isSelected);
  return {
    ...state,
    notes: state.notes.filter((note) => !note.isSelected),
    notesHistory: {
      head: state.notesHistory.head + 1,
      history: [
        ...getChoppedHistoryAfterHead(state.notesHistory),
        { type: PianoRollHistoryItemType.DELETE_NOTE, note: notesToBeDeleted },
      ],
    },
    selectionRange: null,
  };
}

type ToggleSelectedNoteVibratoModeAction = {
  type: "TOGGLE_SELECTED_NOTE_VIBRATO_MODE";
};
export function toggleSelectedNoteVibratoMode(state: PianoRollStore, action: ToggleSelectedNoteVibratoModeAction) {
  return {
    ...state,
    notes: state.notes.map((note) => ({
      ...note,
      vibratoMode: note.isSelected ? (note.vibratoMode + 1) % 2 : note.vibratoMode,
    })),
  };
}

type VibratoDepthDelayChangeSelectedNoteAction = {
  type: "VIBRATO_DEPTH_DELAY_CHANGE_SELECTED_NOTE";
  payload: { depthOffset: number; delayOffset: number };
};
export function vibratoDepthDelayChangeSelectedNote(
  state: PianoRollStore,
  action: VibratoDepthDelayChangeSelectedNoteAction,
) {
  return {
    ...state,
    notes: state.notes.map((note) => {
      if (note.isSelected) {
        const newVibratoDepth = note.vibratoDepth + 0.6 * action.payload.depthOffset;
        const newVibratoDelay = note.vibratoDelay - 4 * action.payload.delayOffset;
        return {
          ...note,
          vibratoDelay: Math.max(Math.min(newVibratoDelay, note.duration * 0.9), 0),
          vibratoDepth: Math.min(Math.max(newVibratoDepth, 0), 200),
        };
      } else {
        return note;
      }
    }),
  };
}

type VibratoRateChangeSelectedNoteAction = {
  type: "VIBRATO_RATE_CHANGE_SELECTED_NOTE";
  payload: { rateOffset: number };
};
export function vibratoRateChangeSelectedNote(state: PianoRollStore, action: VibratoRateChangeSelectedNoteAction) {
  return {
    ...state,
    notes: state.notes.map((note) => {
      if (note.isSelected) {
        const newVibratoRate = note.vibratoRate - 0.15 * action.payload.rateOffset;
        return {
          ...note,
          vibratoRate: Math.min(Math.max(newVibratoRate, 5), 200),
        };
      } else {
        return note;
      }
    }),
  };
}

type UpdateNoteLyricAction = {
  type: "UPDATE_NOTE_LYRIC";
  payload: { noteId: string; lyric: string };
};
export function updateNoteLyric(state: PianoRollStore, action: UpdateNoteLyricAction) {
  return {
    ...state,
    notes: state.notes.map((note) => {
      if (note.id === action.payload.noteId) {
        return { ...note, lyric: action.payload.lyric };
      } else {
        return note;
      }
    }),
  };
}

type MoveNoteAsLatestModifiedAction = {
  type: "MOVE_NOTE_AS_LATEST_MODIFIED";
  payload: { noteId: string };
};
export function moveNoteAsLatestModified(state: PianoRollStore, action: MoveNoteAsLatestModifiedAction) {
  return {
    ...state,
    notes: state.notes
      .filter((note) => note.id !== action.payload.noteId)
      .concat(state.notes.filter((note) => note.id === action.payload.noteId)),
  };
}

type SetNoteModificationBufferWithSelectedNoteAction = {
  type: "SET_NOTE_MODIFICATION_BUFFER_WITH_SELECTED_NOTE";
  payload: { initX: number; initY: number };
};
export function setNoteModificationBufferWithSelectedNote(
  state: PianoRollStore,
  action: SetNoteModificationBufferWithSelectedNoteAction,
) {
  return {
    ...state,
    noteModificationBuffer: {
      notesSelected: state.notes.filter((note) => note.isSelected),
      initX: action.payload.initX,
      initY: action.payload.initY,
    },
  };
}

type SetNoteModificationBufferWithAllNoteAction = {
  type: "SET_NOTE_MODIFICATION_BUFFER_WITH_ALL_NOTE";
  payload: { initX: number; initY: number };
};
export function setNoteModificationBufferWithAllNote(
  state: PianoRollStore,
  action: SetNoteModificationBufferWithAllNoteAction,
) {
  return {
    ...state,
    noteModificationBuffer: {
      notesSelected: state.notes,
      initX: action.payload.initX,
      initY: action.payload.initY,
    },
  };
}

type SetBpmAction = {
  type: "SET_BPM";
  payload: { bpm: number };
};
export function setBpm(state: PianoRollStore, action: SetBpmAction) {
  return {
    ...state,
    bpm: action.payload.bpm,
  };
}

type SetLastModifiedVelocityAction = {
  type: "SET_LAST_MODIFIED_VELOCITY";
  payload: { velocity: number };
};
export function setLastModifiedVelocity(state: PianoRollStore, action: SetLastModifiedVelocityAction) {
  return {
    ...state,
    lastModifiedVelocity: action.payload.velocity,
  };
}

type SetLastModifiedDurationAction = {
  type: "SET_LAST_MODIFIED_DURATION";
  payload: { duration: number };
};
export function setLastModifiedDuration(state: PianoRollStore, action: SetLastModifiedDurationAction) {
  return {
    ...state,
    lastModifiedDuration: action.payload.duration,
  };
}