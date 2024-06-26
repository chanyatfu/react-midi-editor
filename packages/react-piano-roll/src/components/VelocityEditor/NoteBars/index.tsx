import useVelocityEditorMouseHandlers from "./handlers/useVelocityEditorMouseHandlers";
import styles from "./index.module.scss";
import { getOffsetXFromTick } from "@/helpers/conversion";
import { useScaleX } from "@/contexts/ScaleXProvider";
import { useAtom, useAtomValue } from "jotai";
import { notesAtom, selectedNoteIdsAtom } from "@/store/note";
import { useRef } from "react";

type Props = {
  isDragging: boolean;
};
const NoteBars: React.FC<Props> = ({ isDragging }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useVelocityEditorMouseHandlers(containerRef);
  const notes = useAtomValue(notesAtom);
  const { scaleX } = useScaleX();
  const [selectedNoteIds] = useAtom(selectedNoteIdsAtom);

  return (
    <div className={styles["note-bar-container"]} ref={containerRef}>
      {notes.map((note) => (
        <div
          key={note.id}
          className={styles["marker-container"]}
          style={
            {
              "--marker-left": `${getOffsetXFromTick(scaleX, note.tick)}px`,
              "--marker-top": `${1 - note.velocity / 128}`,
              "--marker-width": `${getOffsetXFromTick(scaleX, note.duration)}px`,
              "--marker-color": "var(--note-background-color)",
              "--cursor": isDragging ? "grabbing" : "grab",
            } as React.CSSProperties
          }
          data-note-id={note.id}
          data-velocity={note.velocity}
        >
          <div className={styles["velocity-marker"]} data-note-id={note.id} />
          <div
            className={styles["length-marker"]}
            data-note-id={note.id}
            style={{
              outline: selectedNoteIds.has(note.id) ? `3px solid #ffffff33` : "none",
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default NoteBars;
