import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Trash2, Eye, FilePlus } from 'lucide-react';
import { issueService } from '../services';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const statuses = ['', 'Reported', 'Assigned', 'In Progress', 'Resolved'];
const priorities = ['', 'Low', 'Medium', 'High', 'Critical'];

export default function ManageIssues() {
  const { user } = useAuth();
  const [data, setData] = useState({ items: [], page: 1, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', page: 1, limit: 10, sortBy: 'createdAt', order: 'desc' });
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchIssues = useCallback(() => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    issueService
      .list(params)
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchIssues, 250);
    return () => clearTimeout(t);
  }, [fetchIssues]);

  function handleFilterChange(key, value) {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await issueService.remove(deleteId);
      setDeleteId(null);
      fetchIssues();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  function canDelete(issue) {
    return user?.role === 'admin' || issue.reportedBy?._id === user?._id;
  }

  const inputClass = 'rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manage Issues</h2>
          <p className="text-sm text-slate-500">{data.total} total issue(s)</p>
        </div>
        <Link
          to="/issues/new"
          className="flex items-center gap-1.5 rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <FilePlus size={16} /> New Report
        </Link>
      </div>

      <div className="rounded-lg bg-white border border-slate-200 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <div className="relative sm:col-span-1 lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search title, tracking ID, address…"
              className={`${inputClass} w-full pl-9`}
            />
          </div>
          <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)} className={inputClass}>
            {statuses.map((s) => (
              <option key={s} value={s}>{s || 'All statuses'}</option>
            ))}
          </select>
          <select value={filters.priority} onChange={(e) => handleFilterChange('priority', e.target.value)} className={inputClass}>
            {priorities.map((p) => (
              <option key={p} value={p}>{p || 'All priorities'}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">{error}</div>
      )}

      <div className="rounded-lg bg-white border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center"><Spinner size={28} /></div>
        ) : data.items.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-slate-400">
            No issues found. Try adjusting your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="px-4 py-3">Tracking ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((issue) => (
                  <tr key={issue._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">{issue.trackingId}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">{issue.title}</td>
                    <td className="px-4 py-3 text-slate-600">{issue.category}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[150px] truncate">{issue.address}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={issue.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={issue.status} /></td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/issues/${issue._id}`}
                          className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-teal-600" title="View">
                          <Eye size={16} />
                        </Link>
                        {canDelete(issue) && (
                          <button onClick={() => setDeleteId(issue._id)}
                            className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && data.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500">
              Page {data.page} of {data.pages} · {data.total} total
            </p>
            <div className="flex gap-1">
              <button
                disabled={data.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                className="rounded p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={data.page >= data.pages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                className="rounded p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete this issue?"
        message="This action cannot be undone. The issue record will be permanently removed."
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
