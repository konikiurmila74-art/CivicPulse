import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FilePlus, ListChecks, FolderCog, LogOut, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/issues/new', label: 'Report Issue', icon: FilePlus },
  { to: '/issues', label: 'Manage Issues', icon: ListChecks },
  { to: '/categories', label: 'Categories', icon: FolderCog, adminOnly: true },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const items = navItems.filter((i) => !i.adminOnly || user?.role === 'admin');

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-slate-900 text-slate-300">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500">
          <Activity className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-base font-bold text-white leading-tight">CivicPulse</h1>
          <p className="text-[11px] text-slate-400 leading-tight">Issue Reporting</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 px-3 py-4">
        <div className="px-3 pb-3">
          <p className="text-sm font-medium text-white truncate">{user?.name}</p>
          <p className="text-[11px] text-slate-400 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
