import React, { useRef } from "react";
import useClickOutside from "../../hooks/useClickOutside";
import "./UserEditModal.css";

function UserEditModal({ formData, setFormData, onSave, onCancel }) {
  const modalRef = useRef();

  // Mbyll modalin kur klikoj jashtë tij
  useClickOutside(modalRef, () => {
    console.log("Clicked outside modal, cancelling...");
    onCancel();
  });

  return (
    <div className="modal-backdrop">
      <div ref={modalRef} className="modal">
        <h2>Edit User</h2>
        <label>
          Name:
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </label>
        <label>
          Role:
          <input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />
        </label>
        <label>
          Sector:
          <input
            type="text"
            value={formData.sector}
            onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
          />
        </label>
        <label>
          Password (optional):
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </label>
        <div className="modal-actions">
          <button onClick={onSave}>Save</button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserEditModal;
