import React, { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import api from "../../api/client";
import getErrorMessage from "../../api/getErrorMessage";
import { useAuth } from "../../context/AuthContext";
import "./adminPanel.css";

export default function AdminPanel() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [friendsByUser, setFriendsByUser] = useState({});
  const [friendsLoadingId, setFriendsLoadingId] = useState(null);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/admin/users");
      setUsers(data.users);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load users."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function toggleExpand(id) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!friendsByUser[id]) {
      setFriendsLoadingId(id);
      try {
        const { data } = await api.get(`/api/admin/users/${id}/friends`);
        setFriendsByUser((prev) => ({ ...prev, [id]: data.friends }));
      } catch (err) {
        setFriendsByUser((prev) => ({ ...prev, [id]: [] }));
      } finally {
        setFriendsLoadingId(null);
      }
    }
  }

  async function toggleAdmin(u) {
    const prev = users;
    setUsers((list) =>
      list.map((x) => (x.id === u.id ? { ...x, is_admin: !x.is_admin } : x))
    );
    try {
      await api.patch(`/api/admin/users/${u.id}`, { isAdmin: !u.is_admin });
    } catch (err) {
      setUsers(prev);
      setError(getErrorMessage(err, "Couldn't update that user."));
    }
  }

  async function deleteUser(u) {
    if (!window.confirm(`Delete ${u.username}? This can't be undone.`)) return;
    const prev = users;
    setUsers((list) => list.filter((x) => x.id !== u.id));
    try {
      await api.delete(`/api/admin/users/${u.id}`);
    } catch (err) {
      setUsers(prev);
      setError(getErrorMessage(err, "Couldn't delete that user."));
    }
  }

  return (
    <div className="admin-panel">
      <h2 className="admin-title">
        <AdminPanelSettingsIcon fontSize="inherit" /> Admin — Users
      </h2>

      {loading && <p className="admin-status">Loading users...</p>}
      {error && <p className="admin-error">{error}</p>}

      {!loading && !error && (
        <div className="admin-table">
          <div className="admin-row admin-row-head">
            <span>Username</span>
            <span>Email</span>
            <span>Role</span>
            <span>Joined</span>
            <span>Actions</span>
          </div>

          {users.map((u) => (
            <React.Fragment key={u.id}>
              <div className="admin-row" onClick={() => toggleExpand(u.id)}>
                <span className="admin-cell-user">
                  {expandedId === u.id ? (
                    <ExpandLessIcon fontSize="inherit" />
                  ) : (
                    <ExpandMoreIcon fontSize="inherit" />
                  )}
                  {u.username}
                </span>
                <span className="admin-cell-email">{u.email}</span>
                <span>
                  {u.is_admin ? (
                    <span className="admin-badge">Admin</span>
                  ) : (
                    <span className="admin-badge admin-badge-muted">User</span>
                  )}
                </span>
                <span className="admin-cell-date">
                  {new Date(u.created_at).toLocaleDateString()}
                </span>
                <span className="admin-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="admin-action-btn"
                    onClick={() => toggleAdmin(u)}
                    disabled={u.id === currentUser?.id}
                    title={
                      u.id === currentUser?.id
                        ? "You can't change your own role"
                        : u.is_admin
                        ? "Demote to regular user"
                        : "Promote to admin"
                    }
                  >
                    {u.is_admin ? "Demote" : "Promote"}
                  </button>
                  <button
                    className="admin-action-btn admin-action-danger"
                    onClick={() => deleteUser(u)}
                    disabled={u.id === currentUser?.id}
                    title={u.id === currentUser?.id ? "You can't delete yourself" : "Delete user"}
                  >
                    <DeleteOutlineIcon fontSize="inherit" />
                  </button>
                </span>
              </div>

              {expandedId === u.id && (
                <div className="admin-friends-panel">
                  {friendsLoadingId === u.id && <p className="admin-status">Loading friends...</p>}
                  {friendsLoadingId !== u.id && friendsByUser[u.id]?.length === 0 && (
                    <p className="admin-status">This user has no friends saved.</p>
                  )}
                  {friendsLoadingId !== u.id && friendsByUser[u.id]?.length > 0 && (
                    <ul className="admin-friends-list">
                      {friendsByUser[u.id].map((f) => (
                        <li key={f.id}>{f.display_name || f.leetcode_username}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
