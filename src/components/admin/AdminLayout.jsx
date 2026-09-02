import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FlaskConical,
  CalendarDays,
  Lightbulb,
  GraduationCap,
  Users,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/research",
    label: "Research",
    icon: FlaskConical,
  },
  {
    to: "/admin/events",
    label: "Events",
    icon: CalendarDays,
  },
  {
    to: "/admin/innovations",
    label: "Innovations",
    icon: Lightbulb,
  },
  {
    to: "/admin/programs",
    label: "Programs",
    icon: GraduationCap,
  },
  {
    to: "/admin/membership",
    label: "Membership",
    icon: Users,
  },
  {
    to: "/admin/profile",
    label: "Profile",
    icon: UserCircle,
  },
];

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-paper">
      <aside className="w-64 shrink-0 bg-[#101c4d] text-white flex flex-col">

        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <p className="font-serif text-xl tracking-tight">
            AMRI
          </p>

          <p className="font-mono text-[11px] uppercase tracking-widest text-[#f2a223] mt-1">
            Admin Console
          </p>
        </div>


        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">

          {navItems.map(
            ({
              to,
              label,
              icon: Icon,
            }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#f2a223] text-[#101c4d]"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon
                  size={18}
                  strokeWidth={1.75}
                />

                {label}
              </NavLink>
            )
          )}

        </nav>


        {/* Admin Account */}
        <div className="px-3 py-4 border-t border-white/10">

          <div className="px-3 pb-3">

            <p className="text-sm font-medium truncate">
              {admin?.name}
            </p>

            <p className="font-mono text-[11px] text-white/50 truncate">
              {admin?.email}
            </p>

          </div>


          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut
              size={18}
              strokeWidth={1.75}
            />

            Logout
          </button>

        </div>

      </aside>


      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">

        <div className="min-h-screen paper-grid">

          <div className="max-w-6xl mx-auto px-8 py-8">
            <Outlet />
          </div>

        </div>

      </main>

    </div>
  );
};

export default AdminLayout;