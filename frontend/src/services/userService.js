import api from "./api";

export const getUsers = async ({ skip = 0, limit = 10 } = {}) => {
  console.log("getUsers called with skip:", skip, "limit:", limit);
  try {
    const response = await api.get("/users/", { params: { skip, limit } });
    console.log("getUsers response:", response.data);
    return response.data;
  } catch (err) {
    console.error("getUsers error:", err);
    throw err;
  }
};

export const updateUser = async (id, data) => {
  console.log("updateUser called with id:", id, "data:", data);
  try {
    const response = await api.put(`/users/${id}`, data);
    console.log("updateUser response:", response.data);
    return response.data;
  } catch (err) {
    console.error("updateUser error:", err);
    throw err;
  }
};

export const createUser = async (new_user) => {
  console.log("createUser called with data:", new_user);
  try {
    const response = await api.post(`/users/create`);
    console.log("createUser response:", response.data);
    return response.data;
  } catch (err) {
    console.error("createUser error:", err);
    throw err;
  }
};

export const searchUsers = async (q, skip = 0, limit = 10) => {
  console.log("searchUsers called with query:", q, "skip:", skip, "limit:", limit);
  try {
    const response = await api.get(`/users/search`, {
      params: { q, skip, limit },
    });
    console.log("searchUsers response:", response.data);
    return response.data;
  } catch (err) {
    console.error("searchUsers error:", err);
    throw err;
  }
};
export const deleteUser = async(id)=>{
  console.log("deleteUser called with id:",id);
  try{
    const response = await api.delete(`/users/${id}`);
    console.log("deleteuser response:", response.data);
    return response.data;
  }catch(err){
    console.error("deleteUser error:",err);
    throw err;
  }
};
