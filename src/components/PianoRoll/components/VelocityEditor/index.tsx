
import React, { useState } from "react";
import { usePianoRollNotes } from "../../helpers/notes";
import useStore from "../../hooks/useStore";
import styles from './index.module.scss'
import LaneGrids from "../LaneGrids";
import useVelocityEditorMouseHandlers from "../../handlers/useVelocityEditorMouseHandlers";
import useTheme from "../../hooks/useTheme";

export default function VelocityEditor() {
  const { pianoRollStore } = useStore();
  const theme = useTheme();
  const pianoRollNotes = usePianoRollNotes();
  const [isDragging, setIsDragging] = useState(false)

  const [containerHeight, setContainerHeight] = useState(200)
  const [resizeBuffer, setResizeBuffer] = useState({
    initY: 0,
    initHeight: 0,
  })

  const mouseHandlers = useVelocityEditorMouseHandlers(containerHeight);

  const handlePointerDown: React.PointerEventHandler = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsDragging(true)
    setResizeBuffer({
      initY: event.clientY,
      initHeight: containerHeight
    })
  }

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (isDragging) {
      setContainerHeight(resizeBuffer.initHeight - (event.clientY - resizeBuffer.initY))
    }
  }

  const handlePointerUp: React.PointerEventHandler = (event) => {
    setIsDragging(false)
  }

  return (
    <div className={styles['container']}
      style={{
        '--container-height': `${containerHeight}px`
      } as React.CSSProperties}
    >
      <div className={styles['resize-bar']}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <div className={styles['note-bar-container']} {...mouseHandlers}>
      {pianoRollNotes.map(note =>
        <div className={styles['marker-container']}
          style={{
            '--marker-left': `${pianoRollStore.getOffsetXFromTick(note.tick)}px`,
            '--marker-top': `${1 - (note.velocity / 128)}`,
            '--marker-width': `${pianoRollStore.getOffsetXFromTick(note.duration)}px`,
            '--marker-color': note.isSelected? theme.note.noteSelectedBackgroundColor : theme.note.noteBackgroundColor,
            '--cursor': isDragging? 'grabbing' : 'grab'
          } as React.CSSProperties}
        >
          <div className={styles['velocity-marker']} />
          <div className={styles['length-marker']} />
        </div>
      )}
      </div>
      <LaneGrids style={{ zIndex: -100 }} />
    </div>
  )
}