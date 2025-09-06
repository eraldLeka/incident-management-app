import { useEffect, useState, useRef } from "react";
import { getIncidents, searchIncidents, updateIncidentStatus } from "../../services/incidentService";
import SearchBar from "../SearchBar";
import "./IncidentList.css";
import { useAuth } from "../../contexts/AuthContext";
import { ChevronDownCircleIcon } from "lucide-react";
import DatePicker from "react-datepicker";


export default function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ status: [], priority: [], category: "", createdAt: "" });
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilterModal, setShowFilterModal] = useState({ status: false, priority: false });
  const itemsPerPage = 10;

  const inputRef = useRef(null);
  const { user } = useAuth();
  const isSectorAdmin = user?.role?.startsWith("admin_") && user.role !== "admin_system";

  // Toggle filter modal
  const toggleFilterModal = (type) => {
    setShowFilterModal(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Toggle multi-select
  const togglePriority = (priority) => {
    setFilters(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority]
    }));
  };

  const toggleStatus = (status) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const loadIncidents = async () => {
    try {
      setLoading(true);
      let data;
      if (query) {
        data = await searchIncidents(query, 0, itemsPerPage);
        setCurrentPage(0);
      } else {
        data = await getIncidents({
        page: currentPage + 1,
        pageSize: itemsPerPage,
        status: filters.status.length ? filters.status : undefined,   //  array
        priority: filters.priority.length ? filters.priority : undefined, 
        startDate: filters.createdAt || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      }
      setIncidents(data);
      setError("");
      inputRef.current?.focus();
    } catch (err) {
      console.error(err);
      setError("Failed to load incidents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      loadIncidents();
    }, 300);
    return () => clearTimeout(handler);
  }, [query, currentPage, filters, sortBy, sortOrder]);

  const hasNextPage = !query && incidents.length === itemsPerPage;

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      const updated = await updateIncidentStatus(incidentId, newStatus);
      setIncidents(prev =>
        prev.map(i => (i.id === incidentId ? { ...i, status: updated.status } : i))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="incident-list-container">
      <div className="users-header">
        <div className="search-bar-container">
          <SearchBar query={query} setQuery={setQuery} inputRef={inputRef} />
        </div>
      </div>

      {loading && <p>Loading incidents...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="incident-table-wrapper">
        <table className="incident-table">
          <thead>
            <tr>
              <th colSpan={8} className="table-title">Reported Incidents</th>
            </tr>
            <tr>
              <th>No</th>
              <th>Title</th>
              <th>Description</th>
              <th>Category</th>

              {/* Priority Column */}
              <th>
                Priority
                <ChevronDownCircleIcon
                  size={16}
                  style={{ marginLeft: 5, cursor: "pointer" }}
                  onClick={() => toggleFilterModal("priority")}
                />
                {showFilterModal.priority && (
                  <div className="filter-modal">
                    <div className="filter-modal-content">
                      <p><strong>Filter Priority</strong></p>
                      {["low", "medium", "high", "critical"].map(p => (
                        <div key={p}>
                          <input type="checkbox"
                                 checked={filters.priority.includes(p)}
                                 onChange={() => togglePriority(p)} />
                          <label>{p}</label>
                        </div>
                      ))}
                      <button onClick={() => setShowFilterModal({})}>Apply</button>
                    </div>
                  </div>
                )}
              </th>

              {/* Status Column */}
              <th>
                Status
                <ChevronDownCircleIcon
                  size={16}
                  style={{ marginLeft: 5, cursor: "pointer" }}
                  onClick={() => toggleFilterModal("status")}
                />
                {showFilterModal.status && (
                  <div className="filter-modal">
                    <div className="filter-modal-content">
                      <p><strong>Filter Status</strong></p>
                      {["open", "in_progress", "solved"].map(s => (
                        <div key={s}>
                          <input type="checkbox"
                                 checked={filters.status.includes(s)}
                                 onChange={() => toggleStatus(s)} />
                          <label>{s.replace("_"," ")}</label>
                        </div>
                      ))}
                      <button onClick={() => setShowFilterModal({})}>Apply</button>
                    </div>
                  </div>
                )}
              </th>

              {/* Created At */}
              <th>
                Created At
                <ChevronDownCircleIcon
                  size={16}
                  style={{ marginLeft: 5, cursor: "pointer" }}
                  onClick={() => {
                    setSortBy("created_at");
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  }}
                />
              </th>

              {isSectorAdmin && <th>Update</th>}
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident, index) => (
              <tr key={incident.id}
                  className={`${incident.status}-row`}
                  style={{
                    opacity: 0,
                    animation: `fadeIn 0.5s forwards`,
                    animationDelay: `${index * 0.1}s`
                  }}>
                <td>{currentPage * itemsPerPage + index + 1}</td>
                <td>{incident.title}</td>
                <td>{incident.description}</td>
                <td>{incident.category}</td>
                <td>
                  <span className={`priority-badge ${incident.priority.toLowerCase()}`}>
                    {incident.priority.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${incident.status}`}>
                    {incident.status.replace("_"," ").toUpperCase()}
                  </span>
                </td>
                <td>{new Date(incident.created_at).toLocaleString()}</td>
                {isSectorAdmin && (
                  <td>
                    <select
                      value={incident.status}
                      onChange={(e) => handleStatusChange(incident.id, e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">Processing</option>
                      <option value="solved">Solved</option>
                    </select>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!query && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(p => Math.max(p-1,0))} disabled={currentPage===0}>Previous</button>
          <span> Page {currentPage+1} </span>
          <button onClick={() => hasNextPage && setCurrentPage(p=>p+1)} disabled={!hasNextPage}>Next</button>
        </div>
      )}
    </div>
  );
}
