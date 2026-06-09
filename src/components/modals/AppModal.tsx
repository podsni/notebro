import { mdiClose } from "@mdi/js";
import type { ReactNode } from "react";
import Modal from "react-modal";
import { iconButtonLabel } from "@/components/icons/IconButton";

Modal.setAppElement("#root");

export function AppModal({ isOpen, onClose, title, children, className = "" }: { isOpen: boolean; onClose: () => void; title: string; children: ReactNode; className?: string }) {
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className={`app-modal ${className}`} overlayClassName="modal-overlay">
      <div className="modal-header">
        <h2>{title}</h2>
        {iconButtonLabel("Close", mdiClose, onClose)}
      </div>
      {children}
    </Modal>
  );
}
