import React, { useState } from "react";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import GroupIcon from "@mui/icons-material/Group";
import "./friendsSidebar.css";

export default function FriendsSidebar({
  friends,
  loading,
  error,
  onAdd,
  onRemove,
  onSelectFriend,
  activeUsername,
}) {
  const [newUsername, setNewUsername] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  async function handleAdd(event) {
    event.preventDefault();
    const trimmed = newUsername.trim();
    if (!trimmed) return;

    setAdding(true);
    setAddError("");
    try {
      await onAdd(trimmed);
      setNewUsername("");
    } catch (err) {
      setAddError(err?.response?.data?.message || "Couldn't add that friend.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <aside className="friends-sidebar">
      <div className="friends-sidebar-header">
        <GroupIcon fontSize="inherit" />
        <span>Friends</span>
      </div>

      <form className="friends-add-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="LeetCode username"
          value={newUsername}
          onChange={(e) => {
            setNewUsername(e.target.value);
            if (addError) setAddError("");
          }}
          className="friends-add-input"
        />
        <button type="submit" className="friends-add-button" disabled={adding}>
          <PersonAddAlt1Icon fontSize="inherit" />
        </button>
      </form>
      {addError && <p className="friends-error">{addError}</p>}

      <div className="friends-list">
        {loading && <p className="friends-status">Loading...</p>}
        {!loading && error && <p className="friends-error">{error}</p>}
        {!loading && !error && friends.length === 0 && (
          <p className="friends-status">No friends yet. Add a LeetCode username above.</p>
        )}
        {!loading &&
          friends.map((friend) => (
            <div
              key={friend.id}
              className={`friend-item ${
                activeUsername === friend.leetcode_username ? "friend-item-active" : ""
              }`}
              onClick={() => onSelectFriend(friend.leetcode_username)}
            >
              <span className="friend-name">
                {friend.display_name || friend.leetcode_username}
              </span>
              <button
                className="friend-remove"
                title="Remove friend"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(friend.id);
                }}
              >
                <DeleteOutlineIcon fontSize="inherit" />
              </button>
            </div>
          ))}
      </div>
    </aside>
  );
}
