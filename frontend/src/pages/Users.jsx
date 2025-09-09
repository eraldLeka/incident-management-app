import { useEffect, useState } from "react";
import { getUsers, updateUser, searchUsers, deleteUser } from "../services/userService";
import SearchBar from "../components/SearchBar";
import UserEditModal from "../components/Modals/UserEditModal";
import RegisterForm from "../components/Forms/RegisterForm";
import { Edit, UserPlus } from "lucide-react";
import "./Users.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from 'react-router-dom';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    sector: "",
    password: "",
  });

  const USERS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loaction = useLocation();

  // Debounce për searchQuery
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch users ose search users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const skip = currentPage * USERS_PER_PAGE;

        const data =
          debouncedQuery === ""
            ? await getUsers({ skip, limit: USERS_PER_PAGE + 1 })
            : await searchUsers(debouncedQuery, skip, USERS_PER_PAGE + 1);

        setHasNextPage(data.length > USERS_PER_PAGE);
        setUsers(data.slice(0, USERS_PER_PAGE));
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedQuery, currentPage, location.pathname]);

  // Reset global
  useEffect(() => {
    const handleReset = () => {
      setSearchQuery("");
      setCurrentPage(0);
    };
    window.addEventListener("resetUsers", handleReset);
    return () => window.removeEventListener("resetUsers", handleReset);
  }, []);

  // Options Modal
  const handleOptions = (user) => {
    setSelectedUser(user);
    setIsOptionsModalOpen(true);
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    setFormData({
      name: selectedUser.name || "",
      email: selectedUser.email || "",
      role: selectedUser.role || "",
      sector: selectedUser.sector || "",
      password: "",
    });
    setIsOptionsModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setIsOptionsModalOpen(false);
      setSelectedUser(null);
      toast.success("User deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
  };

  const handleEditSubmit = async () => {
    try {
      const updatedUser = await updateUser(selectedUser.id, formData);
      setUsers(users.map((u) => (u.id === selectedUser.id ? updatedUser : u)));
      setIsEditModalOpen(false);
      setSelectedUser(null);
      toast.success("User updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    }
  };

  const Modal = ({ isOpen, onClose, children }) => {
    useEffect(() => {
      const handleEsc = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="users-container" style={{ position: "relative" }}>
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      <div className="users-header">
        <div className="addUser" onClick={() => setIsRegisterOpen(true)}>
          <div className="addUserPlus">
            <UserPlus className="plus" />
          </div>
          <p>Add New User</p>
        </div>
        <div className="search-bar-container">
          <SearchBar query={searchQuery} setQuery={setSearchQuery} />
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <table>
        <thead>
          <tr>
            <th colSpan={6} className="table-title">
              Users List
            </th>
          </tr>
          <tr>
            <th>No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Sector</th>
            <th>Created at</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && !loading ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center" }}>
                No users found
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr key={user.id} className="user-row" style={{ animationDelay: `${index * 50}ms` }}>
                <td>
                  <Edit
                    size={16}
                    className="cursor-pointer text-blue-500"
                    onClick={() => handleOptions(user)}
                  />
                  {index + 1 + currentPage * USERS_PER_PAGE}
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.sector}</td>
                <td>{new Date(user.created_at).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        >
          Previous
        </button>
        <span> Page {currentPage + 1} </span>
        <button
          onClick={() => hasNextPage && setCurrentPage((prev) => prev + 1)}
          disabled={!hasNextPage}
        >
          Next
        </button>
      </div>

      {!hasNextPage && users.length > 0 && (
        <p style={{ textAlign: "center", marginTop: "10px", color: "gray" }}>
          No more users
        </p>
      )}

      {/* Register Modal */}
      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)}>
        <RegisterForm onClose={() => setIsRegisterOpen(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <UserEditModal
          formData={formData}
          setFormData={setFormData}
          onSave={handleEditSubmit}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Options Modal */}
      <Modal isOpen={isOptionsModalOpen} onClose={() => setIsOptionsModalOpen(false)}>
        <div className="options-modal-backdrop">
          <div className="options-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Choose an action</h2>
            <div className="options-buttons">
              <button onClick={handleEdit}>Edit User</button>
              <button className="delete-btn" onClick={handleDelete}>
                Delete User
              </button>
              <button onClick={() => setIsOptionsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
}
