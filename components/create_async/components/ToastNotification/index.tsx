import React from "react";
const ToastNotification = ({ message, type, onClose }) => (
  <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg ${type === "success" ? "bg-green-500" : "bg-red-500"} text-white`}>
    {message}
    <button onClick={onClose} className="ml-2">✕</button>
  </div>
);
export default ToastNotification;
