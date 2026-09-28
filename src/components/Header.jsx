import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="header">
      <div className="search-box">
        <Search size={17} color="#98a2b3" />

        <input
          type="text"
          placeholder="Search anything..."
        />
      </div>

      <div className="header-actions">
        <button
          className="header-icon-button"
          aria-label="Notifications"
        >
          <Bell size={18} />

          <span className="notification-dot" />
        </button>

        <div className="profile">
          <div className="profile-avatar">
            KC
          </div>

          <div className="profile-info">
            <div className="profile-name">
              Admin
            </div>

            <div className="profile-role">
              Administrator
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}