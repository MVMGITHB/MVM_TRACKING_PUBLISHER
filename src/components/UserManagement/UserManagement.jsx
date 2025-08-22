import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Plus, Trash, Edit, User, Mail, Shield, Loader2 } from "lucide-react";
import api from "../baseurl/baseurl"; // ✅ using api instance

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [editingUser, setEditingUser] = useState(null);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users/getAllUser"); // ✅ use api
      setUsers(data);
    } catch (err) {
      toast.error("Failed to fetch users ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add or Update User
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, form); // ✅ use api
        toast.success("User updated ✅");
      } else {
        await api.post("/users/register", form); // ✅ use api
        toast.success("User registered 🎉");
      }
      setForm({ name: "", email: "", password: "" });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong ❌");
    }
  };

  // Delete User
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/users/${id}`); // ✅ use api
      toast.success("User deleted 🗑️");
      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete ❌");
    }
  };

  // Edit User
  const editUser = (user) => {
    setForm({ name: user.name, email: user.email, password: "" });
    setEditingUser(user);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        👤 User Management
      </h1>

      {/* User Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-6 mb-8 border"
      >
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          {editingUser ? "✏️ Edit User" : "➕ Add New User"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Name"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-400"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editingUser}
          />
        </div>

        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            className="bg-orange-500 text-white px-6 py-2 rounded-lg shadow hover:bg-orange-600 transition flex items-center gap-2"
          >
            <Plus size={18} />
            {editingUser ? "Update User" : "Add User"}
          </button>
          {editingUser && (
            <button
              type="button"
              onClick={() => {
                setForm({ name: "", email: "", password: "" });
                setEditingUser(null);
              }}
              className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* User List */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          📋 User List
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border">#</th>
                  <th className="p-3 border">Name</th>
                  <th className="p-3 border">Email</th>
                  <th className="p-3 border">Role</th>
                  <th className="p-3 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr
                      key={user._id}
                      className="hover:bg-orange-50 transition"
                    >
                      <td className="p-3 border">{index + 1}</td>
                      <td className="p-3 border flex items-center gap-2">
                        <User className="text-orange-500" size={18} />
                        {user.name}
                      </td>
                      <td className="p-3 border flex items-center gap-2">
                        <Mail className="text-gray-500" size={18} />
                        {user.email}
                      </td>
                      <td className="p-3 border flex items-center gap-2">
                        <Shield className="text-gray-500" size={18} />
                        {user.role || "User"}
                      </td>
                      <td className="p-3 border flex justify-center gap-3">
                        <button
                          onClick={() => editUser(user)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-gray-500 py-6">
                      No users found 😢
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
