import React, { useState } from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import SchoolIcon from "@mui/icons-material/School";
import LinkIcon from "@mui/icons-material/Link";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import CheckIcon from "@mui/icons-material/Check";
import "./userProfile.css";

// Small helper to avoid crashing on missing/zero totals
function pct(solved, total) {
  if (!total) return 0;
  return Math.min(100, Math.round((solved / total) * 100));
}

function DifficultyBar({ label, solved, total, colorClass }) {
  return (
    <div className="diff-row">
      <div className="diff-label">
        <span className={`diff-dot ${colorClass}`}></span>
        <span>{label}</span>
      </div>
      <div className="diff-bar-track">
        <div
          className={`diff-bar-fill ${colorClass}`}
          style={{ width: `${pct(solved, total)}%` }}
        ></div>
      </div>
      <div className="diff-numbers">
        {solved ?? 0}
        <span className="diff-total"> / {total ?? "—"}</span>
      </div>
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="stat-tile">
      <div className="stat-value">{value ?? "—"}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function UserProfile({ data, isFriend, onAddFriend }) {
  const [adding, setAdding] = useState(false);

  if (!data) return null;

  async function handleAddFriend() {
    if (!onAddFriend || adding || isFriend) return;
    setAdding(true);
    try {
      await onAddFriend(data.username);
    } finally {
      setAdding(false);
    }
  }

  const profile = data.profile || {};
  const contest = data.contestRanking || null;
  const skillTags = profile.skillTags || [];
  const websites = profile.websites || [];

  const initials = (profile.realName || data.username || "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="profile-card">
      {/* ---------- Header ---------- */}
      <div className="profile-header">
        <div className="profile-avatar-wrap">
          {profile.userAvatar ? (
            <img
              className="profile-avatar"
              src={profile.userAvatar}
              alt={`${data.username} avatar`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="profile-avatar profile-avatar-fallback">
              {initials}
            </div>
          )}
        </div>

        <div className="profile-header-info">
          <div className="profile-name-row">
            <h2 className="profile-name">{profile.realName || data.username}</h2>
            {onAddFriend && (
              <button
                className={`add-friend-btn ${isFriend ? "add-friend-btn-added" : ""}`}
                onClick={handleAddFriend}
                disabled={adding || isFriend}
                title={isFriend ? "Already in your friends list" : "Add to friends"}
              >
                {isFriend ? (
                  <>
                    <CheckIcon fontSize="inherit" /> Added
                  </>
                ) : (
                  <>
                    <PersonAddAlt1Icon fontSize="inherit" /> {adding ? "Adding..." : "Add friend"}
                  </>
                )}
              </button>
            )}
          </div>
          <p className="profile-username">@{data.username}</p>

          <div className="profile-meta-row">
            {profile.location && (
              <span className="profile-meta-item">
                <LocationOnIcon fontSize="inherit" /> {profile.location}
              </span>
            )}
            {profile.company && (
              <span className="profile-meta-item">
                <BusinessIcon fontSize="inherit" /> {profile.company}
              </span>
            )}
            {profile.school && (
              <span className="profile-meta-item">
                <SchoolIcon fontSize="inherit" /> {profile.school}
              </span>
            )}
          </div>

          {websites.length > 0 && (
            <div className="profile-links-row">
              {websites.map((site, i) => (
                <a
                  key={i}
                  href={site}
                  target="_blank"
                  rel="noreferrer"
                  className="profile-link"
                >
                  <LinkIcon fontSize="inherit" />
                  {site.replace(/^https?:\/\//, "")}
                </a>
              ))}
            </div>
          )}
        </div>

        {typeof profile.ranking !== "undefined" && (
          <div className="profile-rank-badge">
            <span className="rank-label">Global Rank</span>
            <span className="rank-value">#{data.ranking ?? profile.ranking}</span>
          </div>
        )}
      </div>

      {profile.aboutMe && <p className="profile-about">“{profile.aboutMe}”</p>}

      {/* ---------- Top-level stats ---------- */}
      <div className="stat-grid">
        <StatTile label="Solved" value={data.totalSolved} />
        <StatTile label="Ranking" value={data.ranking && `#${data.ranking}`} />
        <StatTile label="Contribution Pts" value={data.contributionPoints} />
        <StatTile label="Reputation" value={data.reputation} />
      </div>

      {/* ---------- Difficulty breakdown ---------- */}
      <div className="profile-section">
        <h3 className="section-title">Problems Solved</h3>
        <DifficultyBar
          label="Easy"
          solved={data.easySolved}
          total={data.totalEasy}
          colorClass="diff-easy"
        />
        <DifficultyBar
          label="Medium"
          solved={data.mediumSolved}
          total={data.totalMedium}
          colorClass="diff-medium"
        />
        <DifficultyBar
          label="Hard"
          solved={data.hardSolved}
          total={data.totalHard}
          colorClass="diff-hard"
        />
      </div>

      {/* ---------- Contest ranking ---------- */}
      {contest && (
        <div className="profile-section">
          <h3 className="section-title">
            <EmojiEventsIcon fontSize="inherit" /> Contest Ranking
          </h3>
          <div className="stat-grid">
            <StatTile label="Rating" value={Math.round(contest.rating || 0)} />
            <StatTile
              label="Global Rank"
              value={contest.globalRanking && `#${contest.globalRanking}`}
            />
            <StatTile label="Contests Attended" value={contest.attendedContestsCount} />
            <StatTile
              label="Top %"
              value={contest.topPercentage && `${contest.topPercentage}%`}
            />
          </div>
          {contest.badge?.name && (
            <div className="contest-badge">
              <MilitaryTechIcon fontSize="inherit" />
              {contest.badge.name}
            </div>
          )}
        </div>
      )}

      {/* ---------- Skill tags ---------- */}
      {skillTags.length > 0 && (
        <div className="profile-section">
          <h3 className="section-title">Skills</h3>
          <div className="skill-tags">
            {skillTags.map((tag, i) => (
              <span className="skill-tag" key={i}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
