import React, { useState } from 'react';
import { registerUser } from '../../services/authService';
import "./RegisterForm.css";

const RegisterForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    sector: '',
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {

    console.log("Input changed:", e.target.name, e.target.value);

    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Register form submitted with:", formData);
    setError(null);

    let finalRole = formData.role; //map role and sector to final role that backend accepts
    if (formData.role === 'admin') {
      const roleMap = {
        Hardware: "admin_hardware",
        Software: "admin_software",
        Network: "admin_network",
        Security: "admin_security",
      };
      finalRole = roleMap[formData.sector] || 'admin_system';
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: finalRole,
      sector: formData.sector,
    };

    console.log("Payload to send: ", payload);

    try {
      await registerUser(payload);
      console.log("User registered successfully!", response);
      onClose();
    } catch (err) {
      console.error("Error registering user:", err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Registration failed'
      );
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add user</h2>
        <form onSubmit={handleSubmit}>

          <label>
            Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Role
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <label>
            Sector
            <select
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              required
            >
              <option value="">Choose a sector you work in</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Network">Network</option>
              <option value="Security">Security</option>
            </select>
          </label>

          {error && (
            <div style={{ color: "red", fontWeight: "bold" }}>
              {Array.isArray(error) ? error.map((e, i) => <p key={i}>{e.msg}</p>) : <p>{error}</p>}
            </div>
          )}

          <div className="modal-actions">
            <button type="submit">Create</button>
            <button type="button" onClick={() => { console.log("Cancel clicked"); onClose(); }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
