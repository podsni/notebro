import { mdiClose } from "@mdi/js";
import { useState } from "react";
import Modal from "react-modal";
import { iconButtonLabel } from "@/components/icons/IconButton";

Modal.setAppElement("#root");

export function QuickCaptureModal({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string, tags: string[]) => void;
}) {
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  function handleSave() {
    if (!content.trim()) return;
    const tags = tagsInput
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);
    onSave(content, tags);
    setContent("");
    setTagsInput("");
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      onClose();
    }
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className="app-modal quick-capture-modal" overlayClassName="modal-overlay">
      <div className="modal-header">
        <h2>✨ Quick Capture</h2>
        {iconButtonLabel("Close", mdiClose, onClose)}
      </div>

      <div className="quick-capture-content">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type or paste your note here...&#10;&#10;Press Ctrl+Enter to save"
          autoFocus
          rows={10}
        />

        <div className="quick-capture-footer">
          <input
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="Tags (comma separated)"
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
          />

          <div className="quick-capture-actions">
            <button type="button" className="secondary-action" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="primary-action" onClick={handleSave} disabled={!content.trim()}>
              Save Note
            </button>
          </div>
        </div>

        <div className="quick-capture-hint">
          <kbd>Ctrl+Enter</kbd> to save • <kbd>Esc</kbd> to close
        </div>
      </div>
    </Modal>
  );
}
