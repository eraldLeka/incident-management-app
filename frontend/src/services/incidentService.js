// src/services/incidentService.js
import api from './api';

export const getIncidents = async ({
  page = 1,
  pageSize = 10,
  status,
  priority,
  category,
  startDate,
  endDate,
  sort_by = "created_at",
  sort_order = "desc",
} = {}) => {
  try {
    const response = await api.get("/incidents/", {
      params: {
        page,
        page_size: pageSize,
        status,
        priority,
        category,
        startDate,
        endDate,
        sortBy: sort_by,
        sortOrder: sort_order,
      },
      paramsSerializer: params => {
        const searchParams = new URLSearchParams();
        Object.keys(params).forEach(key => {
          const value = params[key];
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v));
          } else if (value !== undefined && value !== null) {
            searchParams.append(key, value);
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

export const updateIncidentStatus = async (id, newStatus) => {
  try {
    const response = await api.patch(`/incidents/${id}/status`, null, {
      params: { new_status: newStatus }
    });
    return response.data;
  } catch (err) {
    console.error("updateIncidentStatus error:", err);
    throw err;
  }
};

export const getIncidentById = async (id) => {
  try {
    const response = await api.get(`/incidents/${id}`);
    return response.data;
  } catch (err) {
    console.error("getIncidentById error:", err);
    throw err;
  }
};

export const createIncident = async (incidentData) => {
  try {
    const response = await api.post("/incidents/", incidentData);
    return response.data;
  } catch (err) {
    console.error("createIncident error:", err);
    throw err;
  }
};

export const deleteIncident = async (id) => {
  try {
    const response = await api.delete(`/incidents/${id}`);
    return response.data;
  } catch (err) {
    console.error("deleteIncident error:", err);
    throw err;
  }
};

export const getMyIncidents = async () => {
  try {
    const response = await api.get("/incidents/");
    return response.data;
  } catch (err) {
    console.error("getMyIncidents error:", err);
    throw err;
  }
};
