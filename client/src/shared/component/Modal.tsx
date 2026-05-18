import React, { forwardRef } from "react";

interface ModalProps {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  saveText?: string; // Add dynamic save text prop
  saveClassName?: string; // Add dynamic save class prop
  showFooter?: boolean; // Add prop to control footer visibility
  className?: string;
  children: React.ReactNode;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ title, isOpen, onClose, onSave, saveText, saveClassName, showFooter = true, children, className = "" }, ref) => {
    if (!isOpen) return null; // don't render if not open

    return (
      <div
        ref={ref}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      >
        <div
          className={`bg-white rounded-lg shadow-lg w-full mx-4 ${className}`}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 rounded-full p-1"
            >
              ✕
            </button>
          </div>

          {/* Body (renders passed children) */}
          <div className="p-4">{children}</div>

          {/* Footer - conditionally rendered */}
          {showFooter && (
            <div className="flex justify-end border-t p-4 space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs rounded-md border  bg-gray-200 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                className={`px-4 py-2 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-400 ${saveClassName || ''}`}
              >
                {saveText || 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default Modal;
