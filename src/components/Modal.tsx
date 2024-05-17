import React from "react";
import { createPortal } from "react-dom";

const Modal = ({ children, isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }
  return createPortal(
    <div className="modal">
      <div className="modal-content">{children}</div>
      <div className="modal-back-close"></div>
    </div>,
    document.getElementById("bulkMessenger")
  );
};

export default Modal;
