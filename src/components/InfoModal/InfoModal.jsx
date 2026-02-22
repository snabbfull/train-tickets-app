import React from "react";
import "./InfoModal.css";

const DEFAULT_MESSAGE =
  "Таким образом консультация с широким активом в значительной степени обуславливает создание модели развития. Повседневная практика показывает, что сложившаяся структура организации играет важную роль в формировании существенных финансовых и административных";

const InfoModal = ({ isOpen, onClose, message = DEFAULT_MESSAGE }) => {
  if (!isOpen) return null;

  return (
    <div
      className="info-modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div className="info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="info-modal-header">
          <div className="info-modal-header-icon" />
        </div>
        <hr className="info-modal-divider" />
        <div className="info-modal-body">
          <p className="info-modal-text">{message}</p>
        </div>
        <div className="info-modal-footer">
          <hr className="info-modal-footer-divider" />
          <button type="button" className="info-modal-btn" onClick={onClose}>
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
