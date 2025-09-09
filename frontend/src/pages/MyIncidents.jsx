import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import IncidentList from '../components/IncidentList/IncidentList';
import { getMyIncidents } from '../services/incidentService';
import './MyIncidentsPage.css';

export default function MyIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  const fetchIncidents = async () => {
    setLoading(true);
    const data = await getMyIncidents();
    setIncidents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchIncidents();
  }, [location]);

  return (
    <div className="my-incidents-page">
      {loading && (
        <div className="loadin-overlay">
          <div className="spinner"></div>
          </div>
      )}
      <IncidentList incidents={incidents} loading={loading} />
    </div>
  );
}
