import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, AlertCircle, Clock, CheckCircle2, Flame, TrendingUp, Activity } from 'lucide-react';
import { dashboardService } from '../services';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

function KpiCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-lg bg-white border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

const statusColors = {
  Reported: '#f59e0b',
  Assigned: '#0ea5e9',
  'In Progress': '#3b82f6',
  Resolved: '#10b981',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService
      .stats()
      .then((data) => setStats(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={28} />
      </div>
    );

  if (error)
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      </div>
    );

  const c = stats.counts;
  const maxCat = Math.max(...stats.byCategory.map((x) => x.count), 1);
  const maxStatus = Math.max(...stats.byStatus.map((x) => x.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500">
          Welcome back, {user?.name}. Here's an overview of city issues.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard icon={ClipboardList} label="Total Reports" value={c.total} color="bg-slate-700" />
        <KpiCard icon={AlertCircle} label="Reported" value={c.reported} color="bg-amber-500" />
        <KpiCard icon={Clock} label="In Progress" value={c.inProgress} color="bg-blue-500" />
        <KpiCard icon={CheckCircle2} label="Resolved" value={c.resolved} color="bg-emerald-500" />
        <KpiCard icon={Flame} label="High Priority" value={c.highPriority} color="bg-red-500" />
        <KpiCard icon={TrendingUp} label="Resolution Rate" value={`${stats.resolutionRate}%`} color="bg-teal-600" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-white border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Issues by Status</h3>
          <div className="space-y-3">
            {stats.byStatus.length === 0 && (
              <p className="text-sm text-slate-400">No data yet.</p>
            )}
            {stats.byStatus.map((s) => (
              <div key={s.status}>
                <div className="flex items-center justify-between mb-1">
                  <StatusBadge status={s.status} />
                  <span className="text-sm font-medium text-slate-700">{s.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(s.count / maxStatus) * 100}%`,
                      backgroundColor: statusColors[s.status] || '#94a3b8',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-white border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Issues by Category</h3>
          <div className="space-y-3">
            {stats.byCategory.length === 0 && (
              <p className="text-sm text-slate-400">No data yet.</p>
            )}
            {stats.byCategory.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">{cat.category}</span>
                  <span className="text-sm text-slate-500">{cat.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-teal-500 transition-all"
                    style={{ width: `${(cat.count / maxCat) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Recent Reports</h3>
          <Link to="/issues" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recent.length === 0 && (
            <div className="px-5 py-8 text-center">
              <Activity className="mx-auto text-slate-300" size={32} />
              <p className="mt-2 text-sm text-slate-400">No issues reported yet.</p>
            </div>
          )}
          {stats.recent.map((issue) => (
            <Link
              key={issue._id}
              to={`/issues/${issue._id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">{issue.title}</p>
                <p className="text-xs text-slate-500">
                  {issue.trackingId} · {issue.category} · {issue.address}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={issue.priority} />
                <StatusBadge status={issue.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {stats.avgResolutionHours > 0 && (
        <div className="rounded-lg bg-teal-50 border border-teal-200 px-5 py-3">
          <p className="text-sm text-teal-800">
            <span className="font-semibold">Average resolution time:</span> {stats.avgResolutionHours} hours
          </p>
        </div>
      )}
    </div>
  );
}
