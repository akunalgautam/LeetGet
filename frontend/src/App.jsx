import React from "react";
import Navbar from "./components/Navbar";
import LoginSignup from "./components/LOGIN/LoginSignup";
import UserProfile from "./components/PROFILE/UserProfile";
import FriendsSidebar from "./components/FRIENDS/FriendsSidebar";
import AdminPanel from "./components/ADMIN/AdminPanel";
import ProtectedRoute from "./components/ROUTING/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import api from "./api/client";
import getErrorMessage from "./api/getErrorMessage";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function HomePage() {
  const { user } = useAuth();

  // ---- LeetCode lookup state (available to everyone) ----
  const [username, setUserName] = React.useState("");
  const [data, setData] = React.useState(null);
  const [details, setDetails] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // ---- Friends list state (only meaningful when logged in) ----
  const [friends, setFriends] = React.useState([]);
  const [friendsLoading, setFriendsLoading] = React.useState(false);
  const [friendsError, setFriendsError] = React.useState("");

  React.useEffect(() => {
    if (!user) {
      setFriends([]);
      return;
    }
    let cancelled = false;
    async function loadFriends() {
      setFriendsLoading(true);
      setFriendsError("");
      try {
        const { data } = await api.get("/api/friends");
        if (!cancelled) setFriends(data.friends);
      } catch (err) {
        if (!cancelled) setFriendsError(getErrorMessage(err, "Couldn't load your friends list."));
      } finally {
        if (!cancelled) setFriendsLoading(false);
      }
    }
    loadFriends();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function fetchProfile(rawUsername) {
    const target = rawUsername.trim();
    if (!target) return;

    setLoading(true);
    setError("");
    setDetails(false);

    try {
      const response = await api.post("/submit", { username: target });
      const result = response.data;

      if (!result || typeof result !== "object" || !result.username) {
        setError(`Couldn't find a LeetCode user named "${target}".`);
        setData(null);
      } else {
        setData(result);
        setDetails(true);
        setUserName(target);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Something went wrong while fetching that profile."));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    fetchProfile(username);
  }

  function handleChange(event) {
    setUserName(event.target.value);
  }

  function handleSelectFriend(friendUsername) {
    setUserName(friendUsername);
    fetchProfile(friendUsername);
  }

  async function handleAddFriend(leetcodeUsername) {
    const { data } = await api.post("/api/friends", { leetcodeUsername });
    setFriends((prev) => [...prev, data.friend]);
  }

  async function handleRemoveFriend(friendId) {
    const prev = friends;
    setFriends((list) => list.filter((f) => f.id !== friendId));
    try {
      await api.delete(`/api/friends/${friendId}`);
    } catch (err) {
      setFriends(prev);
      setFriendsError(getErrorMessage(err, "Couldn't remove that friend."));
    }
  }

  const isCurrentProfileFriend =
    !!data && friends.some((f) => f.leetcode_username === data.username);

  const searchArea = (
    <>
      <div className="form-container">
        <form onSubmit={handleSubmit} method="POST">
          <input
            name="username"
            type="text"
            placeholder="Enter LeetCode username"
            onChange={handleChange}
            value={username}
            className="user-input"
          />
          <button type="submit" className="user-button" disabled={loading}>
            {loading ? "..." : "GET"}
          </button>
        </form>
        {error && <p className="form-error">{error}</p>}
      </div>

      {details && data && (
        <UserProfile
          data={data}
          isFriend={isCurrentProfileFriend}
          onAddFriend={user ? handleAddFriend : null}
        />
      )}
    </>
  );

  if (!user) {
    return searchArea;
  }

  return (
    <div className="app-layout">
      <FriendsSidebar
        friends={friends}
        loading={friendsLoading}
        error={friendsError}
        onAdd={handleAddFriend}
        onRemove={handleRemoveFriend}
        onSelectFriend={handleSelectFriend}
        activeUsername={details ? data?.username : null}
      />
      <div className="main-content">{searchArea}</div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div>
        <Navbar />
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginSignup mode="login" />} />
        <Route path="/register" element={<LoginSignup mode="register" />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
