import { useEffect, useState, useRef } from "react";
import { getIncidents, searchIncidents, updateIncidentStatus } from "../../services/incidentService";
import SearchBar from "../SearchBar";
import "./IncidentList.css";
import { useAuth } from "../../contexts/AuthContext";
import { ChevronDownCircleIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useClickOutside from "../../hooks/useClickOutside";

export default function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ status: [], priority: [], category: [], createdAt: null });
  const [tempFilters, setTempFilters] = useState(filters);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilterModal, setShowFilterModal] = useState({ status: false, priority: false, category: false, createdAt: false });
  const itemsPerPage = 10;

  const inputRef = useRef(null);
  const { user } = useAuth();
  const isSectorAdmin = user?.role?.startsWith("admin_") && user.role !== "admin_system";
  const isSystemAdmin = user?.role === "admin_system";

  const allCategories = ["hardware", "software", "network", "security"];

  const statusModalRef = useRef(null);
  const priorityModalRef = useRef(null);
  const categoryModalRef = useRef(null);
  const createdAtModalRef = useRef(null);

  useClickOutside(statusModalRef, () => setShowFilterModal(prev => ({ ...prev, status: false })));
  useClickOutside(priorityModalRef, () => setShowFilterModal(prev => ({ ...prev, priority: false })));
  useClickOutside(categoryModalRef, () => setShowFilterModal(prev => ({ ...prev, category: false })));
  useClickOutside(createdAtModalRef, () => setShowFilterModal(prev => ({ ...prev, createdAt: false })));

  const toggleFilterModal = (type) => {
    setTempFilters(filters);
    setShowFilterModal(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const toggleTempPriority = (priority) => {
    setTempFilters(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority]
    }));
  };

  const toggleTempStatus = (status) => {
    setTempFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const toggleTempCategory = (category) => {
    setTempFilters(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
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
        const formattedDate = filters.createdAt
          ? `${filters.createdAt.getFullYear()}-${(filters.createdAt.getMonth() + 1).toString().padStart(2,"0")}-${filters.createdAt.getDate().toString().padStart(2,"0")}`
          : undefined;

        data = await getIncidents({
          page: currentPage + 1,
          pageSize: itemsPerPage,
          status: filters.status.length ? filters.status : undefined,
          priority: filters.priority.length ? filters.priority : undefined,
          startDate: formattedDate,
          sort_by: sortBy,
          sort_order: sortOrder,
          category: filters.category.length ? filters.category : undefined
        });
      }

      setIncidents(data.map(i => ({ ...i, animate: false })));
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
        prev.map(i => {
          if (i.id === incidentId) {
            const updatedIncident = { ...i, status: updated.status, animate: true };
            setTimeout(() => {
              setIncidents(prev2 =>
                prev2.map(ii => ii.id === incidentId ? { ...ii, animate: false } : ii)
              );
            }, 500);
            return updatedIncident;
          }
          return i;
        })
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
              <th colSpan={isSectorAdmin ? 8 : 7} className="table-title">Reported Incidents</th>
            </tr>
            <tr>
              <th>No</th>
              <th>Title</th>
              <th>Description</th>
              {isSystemAdmin && <th>Category
                <ChevronDownCircleIcon
                  size={16}
                  style={{ marginLeft: 5, cursor: "pointer" }}
                  onClick={() => toggleFilterModal("category")}
                />
                {showFilterModal.category && (
                  <div className="filter-modal" ref={categoryModalRef}>
                    <div className="filter-modal-content">
                      <button className="close-modal" onClick={() => setShowFilterModal(prev => ({ ...prev, category: false }))}>×</button>
                      <p><strong>Filter Category</strong></p>
                      {allCategories.map(c => (
                        <div key={c}>
                          <input type="checkbox" checked={tempFilters.category.includes(c)} onChange={() => toggleTempCategory(c)} />
                          <label>{c}</label>
                        </div>
                      ))}
                      <div className="modal-buttons">
                        <button className="clear-btn" onClick={() => setTempFilters({ ...tempFilters, category: [] })}>Clear</button>
                        <button className="apply-btn" onClick={() => { setFilters(tempFilters); setShowFilterModal({}); }}>Apply</button>
                      </div>
                    </div>
                  </div>
                )}
              </th>}
              <th>
                Priority
                <ChevronDownCircleIcon
                  size={16}
                  style={{ marginLeft: 5, cursor: "pointer" }}
                  onClick={() => toggleFilterModal("priority")}
                />
                {showFilterModal.priority && (
                  <div className="filter-modal" ref={priorityModalRef}>
                    <div className="filter-modal-content">
                      <button className="close-modal" onClick={() => setShowFilterModal(prev => ({ ...prev, priority: false }))}>×</button>
                      <p><strong>Filter Priority</strong></p>
                      {["low", "medium", "high", "critical"].map(p => (
                        <div key={p}>
                          <input type="checkbox" checked={tempFilters.priority.includes(p)} onChange={() => toggleTempPriority(p)} />
                          <label>{p}</label>
                        </div>
                      ))}
                      <div className="modal-buttons">
                        <button className="clear-btn" onClick={() => setTempFilters({ status: [], priority: [], category: [], createdAt: null })}>Clear</button>
                        <button className="apply-btn" onClick={() => { setFilters(tempFilters); setShowFilterModal({}); }}>Apply</button>
                      </div>
                    </div>
                  </div>
                )}
              </th>
              <th>
                Status
                <ChevronDownCircleIcon
                  size={16}
                  style={{ marginLeft: 5, cursor: "pointer" }}
                  onClick={() => toggleFilterModal("status")}
                />
                {showFilterModal.status && (
                  <div className="filter-modal" ref={statusModalRef}>
                    <div className="filter-modal-content">
                      <button className="close-modal" onClick={() => setShowFilterModal(prev => ({ ...prev, status: false }))}>×</button>
                      <p><strong>Filter Status</strong></p>
                      {["open", "in_progress", "solved"].map(s => (
                        <div key={s}>
                          <input type="checkbox" checked={tempFilters.status.includes(s)} onChange={() => toggleTempStatus(s)} />
                          <label>{s.replace("_"," ")}</label>
                        </div>
                      ))}
                      <div className="modal-buttons">
                        <button className="clear-btn" onClick={() => setTempFilters({ status: [], priority: [], category: [], createdAt: null })}>Clear</button>
                        <button className="apply-btn" onClick={() => { setFilters(tempFilters); setShowFilterModal({}); }}>Apply</button>
                      </div>
                    </div>
                  </div>
                )}
              </th>
              <th>
                Created At
                <ChevronDownCircleIcon
                  size={16}
                  style={{ marginLeft: 5, cursor: "pointer" }}
                  onClick={() => setShowFilterModal(prev => ({ ...prev, createdAt: !prev.createdAt }))}
                />
                {showFilterModal.createdAt && (
                  <div className="filter-modal" ref={createdAtModalRef}>
                    <div className="filter-modal-content">
                      <button className="close-modal" onClick={() => setShowFilterModal(prev => ({ ...prev, createdAt: false }))}>×</button>
                      <p><strong>Select Date</strong></p>
                      <DatePicker
                        selected={tempFilters.createdAt}
                        onChange={(date) => setTempFilters(prev => ({ ...prev, createdAt: date }))}
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Click to select a date"
                        isClearable
                      />
                      <div className="modal-buttons">
                        <button className="clear-btn" onClick={() => { setTempFilters(prev => ({ ...prev, createdAt: null })); setFilters(prev => ({ ...prev, createdAt: null })); }}>Clear</button>
                        <button className="apply-btn" onClick={() => { setFilters(prev => ({ ...prev, createdAt: tempFilters.createdAt })); setShowFilterModal({}); }}>Apply</button>
                      </div>
                    </div>
                  </div>
                )}
              </th>
              {isSectorAdmin && <th>Update</th>}
            </tr>
          </thead>

          <tbody>
            {incidents.map((incident, index) => (
              <tr key={incident.id} className={`${incident.status}-row`} style={{ opacity: 0, animation: `fadeIn 0.5s forwards`, animationDelay: `${index * 0.1}s` }}>
                <td>{currentPage * itemsPerPage + index + 1}</td>
                <td>{incident.title}</td>
                <td>{incident.description}</td>
                {isSystemAdmin && <td>{incident.category}</td>}
                <td>
                  <span className={`priority-badge ${incident.priority.toLowerCase()} ${incident.animate ? "updated" : ""}`}>
                    {incident.priority.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${incident.status} ${incident.animate ? "updated" : ""}`}>
                    {incident.status.replace("_"," ").toUpperCase()}
                  </span>
                </td>
                <td>{new Date(incident.created_at).toLocaleString()}</td>
                {isSectorAdmin && (
                  <td>
                    <div className="badge-select">
                      <select value={incident.status} onChange={(e) => handleStatusChange(incident.id, e.target.value)}>
                        <option value="open" className="open">Open</option>
                        <option value="in_progress" className="in_progress">Processing</option>
                        <option value="solved" className="solved">Solved</option>
                      </select>
                    </div>
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
