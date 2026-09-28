import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Warehouse,
  BellRing,
  UserCog,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useState } from "react";

const menu = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Products", path: "/products", icon: Package },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Sales", path: "/sales", icon: ShoppingCart },
  { name: "Inventory", path: "/inventory", icon: Warehouse },
  { name: "Reminders", path: "/reminders", icon: BellRing },
  { name: "Staff", path: "/staff", icon: UserCog },
  { name: "Reports", path: "/reports", icon: BarChart3 },
  { name: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="mobile-menu-button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div
        className={`sidebar-overlay ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-brand">
            <div className="sidebar-logo-icon">
              <LayoutDashboard size={21} />
            </div>

            <div>
              <div className="sidebar-title">
                Komal Customer Care
              </div>

              <div className="sidebar-subtitle">
                Management System
              </div>
            </div>
          </div>

          <button
            className="header-icon-button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">
            Main Menu
          </div>

          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}