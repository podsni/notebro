import { useState } from "react";
import { AppModal } from "@/components/modals/AppModal";
import type { CanvasEngine } from "@/lib/noteLogic";

type CanvasEngineModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (engine: CanvasEngine) => void;
};

export function CanvasEngineModal({ isOpen, onClose, onSelect }: CanvasEngineModalProps) {
  const [selected, setSelected] = useState<CanvasEngine>("tldraw");

  const handleCreate = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <AppModal isOpen={isOpen} onClose={onClose} title="Choose Canvas Engine">
      <div className="modal-stack">
        <p>Select which drawing tool you want to use for your canvas:</p>

        <div className="canvas-engine-options">
          <button
            type="button"
            className={`engine-option ${selected === "tldraw" ? "selected" : ""}`}
            onClick={() => setSelected("tldraw")}
          >
            <div className="engine-header">
              <strong>tldraw</strong>
              {selected === "tldraw" && <span className="check-badge">✓</span>}
            </div>
            <p className="engine-description">
              Modern whiteboard with shapes, arrows, text, and collaboration features.
              Great for diagrams and visual thinking.
            </p>
            <div className="engine-notice">
              ⚠️ Requires license for production use
            </div>
          </button>

          <button
            type="button"
            className={`engine-option ${selected === "excalidraw" ? "selected" : ""}`}
            onClick={() => setSelected("excalidraw")}
          >
            <div className="engine-header">
              <strong>Excalidraw</strong>
              {selected === "excalidraw" && <span className="check-badge">✓</span>}
            </div>
            <p className="engine-description">
              Hand-drawn style whiteboard. Open source and free.
              Perfect for sketches, wireframes, and brainstorming.
            </p>
            <div className="engine-notice engine-notice-success">
              ✓ Free and open source
            </div>
          </button>
        </div>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="secondary-action">
            Cancel
          </button>
          <button type="button" onClick={handleCreate} className="primary-action">
            Create Canvas
          </button>
        </div>
      </div>
    </AppModal>
  );
}
