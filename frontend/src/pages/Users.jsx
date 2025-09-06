import { useEffect, useState } from "react";
import { getUsers, updateUser, searchUsers } from "../services/userService";
import SearchBar from "../components/SearchBar";
import UserEditModal from "../components/Modals/UserEditModal";
import RegisterForm from "../components/Forms/RegisterForm";
import { Edit, UserPlus } from "lucide-react";
import "./Users.css";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "", sector: "", password: "" });
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const USERS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(0);

  // debounce për searchQuery
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch users ose search users kur ndryshon debouncedQuery ose currentPage
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const skip = currentPage * USERS_PER_PAGE;
        const data = debouncedQuery === ""
          ? await getUsers({ skip, limit: USERS_PER_PAGE })
          : await searchUsers(debouncedQuery, skip, USERS_PER_PAGE);
        setUsers(data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedQuery, currentPage]);

  useEffect(() => {
    const handleReset = () => {
      setSearchQuery("");
      setCurrentPage(0);
    };
    window.addEventListener("resetUsers", handleReset);
    return () => window.removeEventListener("resetUsers", handleReset);
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
      sector: user.sector || "",
      password: "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const updatedUser = await updateUser(selectedUser.id, formData);
      setUsers(users.map(u => (u.id === selectedUser.id ? updatedUser : u)));
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update user");
    }
  };

  const hasNextPage = users.length === USERS_PER_PAGE;

  return (
    <div className="users-container" style={{ position: "relative" }}>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <div className="users-header">
        <div className="addUser" onClick={() => setIsRegisterOpen(true)}>
          <div className="addUserPlus"><UserPlus className="plus" /></div>
          <p>Add New User</p>
        </div>
        <div className="search-bar-container">
          <SearchBar query={searchQuery} setQuery={setSearchQuery} />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <table>
        <thead>
          <tr><th colSpan={6} className="table-title">Users List</th></tr>
          <tr>
            <th>No</th><th>Name</th><th>Email</th><th>Role</th><th>Sector</th><th>Created at</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>
                <Edit size={16} className="cursor-pointer text-blue-500" onClick={() => handleEdit(user)} />
                {index + 1 + currentPage * USERS_PER_PAGE}
              </td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.sector}</td>
              <td>{new Date(user.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))} disabled={currentPage === 0}>Previous</button>
        <span> Page {currentPage + 1} </span>
        <button onClick={() => hasNextPage && setCurrentPage(prev => prev + 1)} disabled={!hasNextPage}>Next</button>
      </div>

      {isEditModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <UserEditModal formData={formData} setFormData={setFormData} onSave={handleEditSubmit} onCancel={() => setIsEditModalOpen(false)} />
          </div>
        </div>
      )}

      {isRegisterOpen && (
        <div className="modal-backdrop" onClick={() => setIsRegisterOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <RegisterForm onClose={() => setIsRegisterOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
