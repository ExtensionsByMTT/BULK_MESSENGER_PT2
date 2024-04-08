import React from "react";
import { createPortal } from "react-dom";

const Modal = ({ children, isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }
  return createPortal(
    <div className="modal">
      <div className="modal-content">{children}</div>
      <button className="close-modal" onClick={onClose}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-x"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
      <div className="modal-back-close" onClick={onClose}></div>
    </div>,
    document.getElementById("bulkMessenger")
  );
};

export default Modal;
