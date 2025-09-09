import React, { useState } from "react";
import { registerUser } from "../../services/authService";
import styles from "./RegisterForm.module.css";

const RegisterForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
    role: "user",
    sector: "",
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    let finalRole = formData.role;
    if (formData.role === "admin") {
      const roleMap = {
        Hardware: "admin_hardware",
        Software: "admin_software",
        Network: "admin_network",
        Security: "admin_security",
      };
      finalRole = roleMap[formData.sector] || "admin_system";
    }

    const payload = { ...formData, role: finalRole };

    try {
      await registerUser(payload);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Registration failed"
      );
    }
  };

  return (
    <div className={styles.overlay}>
      <form className={styles.modal} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Add User</h2>

        {/* Row Name + Email */}
        <div className={styles.row}>
          <label className={styles.label}>
            Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
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
              required
              className={styles.input}
            />
          </label>
        </div>

        {/* Row Password + Repeat Password */}
        <div className={styles.row}>
          <label className={styles.label}>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Repeat Password
            <input
              type="password"
              name="repeatPassword"
              value={formData.repeatPassword}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </label>
        </div>

        {/* Row Role + Sector */}
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
              required
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

        {error && <p className={styles.error}>{error}</p>}

        {/* Buttons */}
        <div className={styles.actions}>
          <button type="submit" className={`${styles.btn} ${styles.primary}`}>
            Add
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.secondary}`}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
