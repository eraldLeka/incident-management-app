// src/services/incidentService.js
import api from './api';

// ----------------------------
// Get Incidents me filtra
// ----------------------------
export const getIncidents = async ({ page = 1, pageSize = 10, status, priority, startDate, endDate, sort_by, sort_order } = {}) => {
  try {
    const response = await api.get("/incidents/", {
      params: {
        page,
        page_size: pageSize,
        status,    // <-- lë array direkt
        priority,  // <-- lë array direkt
        start_date: startDate,
        end_date: endDate,
        sort_by,
        sort_order,
      },
      paramsSerializer: params => {
        // Axios nuk serializon array automatikisht për FastAPI
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          if (Array.isArray(params[key])) {
            params[key].forEach(val => searchParams.append(key, val));
          } else if (params[key] !== undefined && params[key] !== null) {
            searchParams.append(key, params[key]);
          }
        });
        return searchParams.toString();
      },
    });
    return response.data;
  } catch (err) {
    console.error("getIncidents error:", err);
    throw err;
  }
};


// Search Incidents
export const searchIncidents = async (q, skip = 0, limit = 10) => {
  try {
    const response = await api.get("/incidents/search", {
      params: { q, skip, limit },
    });
    return response.data;
  } catch (err) {
    console.error("searchIncidents error:", err);
    throw err;
  }
};

// Update Incident Status
export const updateIncidentStatus = async (id, newStatus) => {
  try {
    const response = await api.patch(`/incidents/${id}/status`, null, {
      params: { new_status: newStatus } // lowercase nga frontend
    });
    return response.data;
  } catch (err) {
    console.error("updateIncidentStatus error:", err);
    throw err;
  }
};

// Get Incident by ID
export const getIncidentById = async (id) => {
  try {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  } catch (err) {
    console.error("getIncidentById error:", err);
    throw err;
  }
};

// Create Incident
export const createIncident = async (incidentData) => {
  try {
    const response = await api.post("/incidents/", incidentData);
    return response.data;
  } catch (err) {
    console.error("createIncident error:", err);
    throw err;
  }
};


// Delete Incident
export const deleteIncident = async (id) => {
  try {
    const response = await api.delete(`/incidents/${id}`);
    return response.data;
  } catch (err) {
    console.error("deleteIncident error:", err);
    throw err;
  }
};
// Get My Incidents
export const getMyIncidents = async () => {
  try {
    const response = await api.get("/incidents/");
    return response.data;
  } catch (err) {
    console.error("getMyIncidents error:", err);
    throw err;
  }
};
