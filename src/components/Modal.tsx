import React from "react";
import { createPortal } from "react-dom";

const Modal = ({ children, isOpen, onClose, type }) => {
  if (!isOpen) {
    return null;
  }
  return createPortal(
    <div className="modal">
      <div className="modal-content">
        {children}
        {type === "view" && (
          <button className="close-btn" onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-x"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>
      <div className="modal-back-close"></div>
    </div>,
    document.getElementById("bulkMessenger")
  );
};

export default Modal;
