import React, { useEffect, useState } from 'react';
import IncidentList from '../components/IncidentList/IncidentList';
import { getMyIncidents } from '../services/incidentService';
import './MyIncidentsPage.css';

export default function MyIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    setLoading(true);
    const data = await getMyIncidents();
    setIncidents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  return (
    <div className="my-incidents-page">
      <IncidentList incidents={incidents} loading={loading} />
    </div>
  );
}
