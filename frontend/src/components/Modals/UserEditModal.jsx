import React, { useRef, useState } from "react";
import styles from "./UserEditModal.module.css";
import useClickOutside from "../../hooks/useClickOutside";

const UserEditModal = ({ formData, setFormData, onSave, onCancel }) => {
  const modalRef = useRef();
  const [repeatPassword, setRepeatPassword] = useState("");

  // close modal
  useClickOutside(modalRef, onCancel);

  const handleSave = () => {
    if (formData.password && formData.password !== repeatPassword) {
      alert("Passwords do not match");
      return;
    }
    onSave();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.overlay}>
      <div ref={modalRef} className={styles.modal}>
        <h2 className={styles.title}>Edit User</h2>

        {/* Name + Email */}
        <div className={styles.row}>
          <label className={styles.label}>
            Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
            />
          </label>
        </div>

        {/* Password + Repeat Password */}
        <div className={styles.row}>
          <label className={styles.label}>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Repeat Password
            <input
              type="password"
              name="repeatPassword"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              className={styles.input}
            />
          </label>
        </div>

        {/* Role + Sector */}
        <div className={styles.row}>
          <label className={styles.label}>
            Role
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label className={styles.label}>
            Sector
            <select
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">Choose a sector</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Network">Network</option>
              <option value="Security">Security</option>
            </select>
          </label>
        </div>

        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.primary}`} onClick={handleSave}>
            Save
          </button>
          <button className={`${styles.btn} ${styles.secondary}`} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;
