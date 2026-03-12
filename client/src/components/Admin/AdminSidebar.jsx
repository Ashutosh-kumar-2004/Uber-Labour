import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/admin",            label: "Dashboard",   icon: "", end: true },
  { to: "/admin/workers",    label: "Verification", icon: "", end: true },
  { to: "/admin/workers/all",label: "All Workers",  icon: "" },
  { to: "/admin/users",      label: "Users",        icon: "" },
  { to: "/admin/tasks",      label: "Tasks",        icon: "" },
  { to: "/admin/categories", label: "Categories",   icon: "" },
  { to: "/admin/reviews",    label: "Reviews",      icon: "" },
  { to: "/admin/reports",    label: "Reports",      icon: "" },
  { to: "/admin/rejections", label: "Rejections",   icon: "" },
  { to: "/admin/finance",    label: "Finance",      icon: "" },
];

const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-white flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-slate-700 flex items-center gap-3">
        <span className="text-xl"></span>
        <span className="font-bold text-lg tracking-tight">Admin Panel</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive
                ? "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white"
                : "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            }
          >
            <span className="text-base leading-none">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
        >
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
