import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIncident } from "../../services/incidentService";
import './IncidentForm.css';

export default function IncidentForm() {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('hardware');
  const [priority, setPriority] = useState('low');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      setError("Ju lutem logohuni për të krijuar incident.");
      return;
    }

    if (!title.trim()) {
      setError("Titulli është i detyrueshëm");
      return;
    }

    try {
      const payload = { title, description, category, priority, reporter_id: user.id };
      await createIncident(payload);
      setSuccess("Incidenti u krijua me sukses!");
      setError(null);
      setTitle('');
      setDescription('');
      setCategory('hardware');
      setPriority('low');
      navigate("/my-incidents");
    } catch (err) {
      setError('Gabim gjatë krijimit të incidentit');
      setSuccess(null);
    }
  };

  return (
    <div className="incident-form-page">
      <div className="incident-form-container">
        <form className="incident-form" onSubmit={handleSubmit}>
          <h2>Report New Incident</h2>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="hardware">Hardware</option>
            <option value="software">Software</option>
            <option value="network">Network</option>
            <option value="security">Security</option>
            <option value="other">Other</option>
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <button type="submit">Submit Incident</button>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </form>
      </div>
    </div>
  );
}
