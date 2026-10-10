import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, User as UserIcon, Tag, Edit3, Save, X,
  History, Trash2, ImageIcon,
} from 'lucide-react';
import { issueService, categoryService } from '../services';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const statuses = ['Reported', 'Assigned', 'In Progress', 'Resolved'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    issueService
      .getById(id)
      .then((data) => {
        setIssue(data);
        setNewStatus(data.status);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    categoryService.list().then(setCategories).catch(() => {});
  }, []);

  const isOwner = issue?.reportedBy?._id === user?._id;
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const canEdit = isOwner || isAdmin || isStaff;
  const canDelete = isOwner || isAdmin;
  const canChangeStatus = isAdmin || isStaff || isOwner;

  function startEdit() {
    setEditForm({
      title: issue.title,
      description: issue.description,
      category: issue.category,
      address: issue.address,
      latitude: issue.latitude || '',
      longitude: issue.longitude || '',
      imageUrl: issue.imageUrl || '',
      priority: issue.priority,
    });
    setEditing(true);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const payload = {
        ...editForm,
        latitude: editForm.latitude ? parseFloat(editForm.latitude) : undefined,
        longitude: editForm.longitude ? parseFloat(editForm.longitude) : undefined,
        imageUrl: editForm.imageUrl || undefined,
      };
      const updated = await issueService.update(issue._id, payload);
      setIssue(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusUpdate() {
    if (newStatus === issue.status && !statusNote) return;
    setStatusUpdating(true);
    try {
      const updated = await issueService.updateStatus(issue._id, { status: newStatus, note: statusNote });
      setIssue(updated);
      setStatusNote('');
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusUpdating(false);
    }
  }

  async function confirmDelete() {
    try {
      await issueService.remove(issue._id);
      navigate('/issues');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="flex h-full items-center justify-center"><Spinner size={28} /></div>;
  if (error) return <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">{error}</div>;
  if (!issue) return <p className="text-sm text-slate-500">Issue not found.</p>;

  const inputClass = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none';

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link to="/issues" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={16} /> Back to Issues
        </Link>
        {canDelete && !editing && (
          <button onClick={() => setShowDelete(true)}
            className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
            <Trash2 size={15} /> Delete
          </button>
        )}
      </div>

      <div className="rounded-lg bg-white border border-slate-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {editing ? (
              <input name="title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className={`${inputClass} text-lg font-bold mb-2`} />
            ) : (
              <h2 className="text-lg font-bold text-slate-900">{issue.title}</h2>
            )}
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <span className="font-mono text-xs text-slate-500">{issue.trackingId}</span>
              <PriorityBadge priority={editing ? editForm.priority : issue.priority} />
              <StatusBadge status={issue.status} />
            </div>
          </div>
          {canEdit && !editing && (
            <button onClick={startEdit} className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <Edit3 size={15} /> Edit
            </button>
          )}
          {editing && (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <X size={15} /> Cancel
              </button>
              <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5 rounded-md bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
                {saving ? <Spinner size={15} className="text-white" /> : <Save size={15} />} Save
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Tag size={15} className="text-slate-400" />
            {editing ? (
              <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className={inputClass}>
                {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            ) : (
              <span>{issue.category}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={15} className="text-slate-400" />
            {editing ? (
              <input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className={inputClass} />
            ) : (
              <span>{issue.address}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <UserIcon size={15} className="text-slate-400" />
            <span>Reported by {issue.reportedBy?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar size={15} className="text-slate-400" />
            <span>{new Date(issue.createdAt).toLocaleString()}</span>
          </div>
          {issue.assignedTo && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <UserIcon size={15} className="text-slate-400" />
              <span>Assigned to {issue.assignedTo?.name}</span>
            </div>
          )}
          {issue.resolvedAt && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <Calendar size={15} />
              <span>Resolved {new Date(issue.resolvedAt).toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-1">Description</h3>
          {editing ? (
            <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={4} className={inputClass} />
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed">{issue.description}</p>
          )}
        </div>

        {(editing ? editForm.imageUrl : issue.imageUrl) && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Image</h3>
            {editing ? (
              <input value={editForm.imageUrl || ''} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} className={inputClass} placeholder="https://..." />
            ) : (
              <img src={issue.imageUrl} alt="Issue" className="max-h-64 rounded-md border border-slate-200" onError={(e) => { e.target.style.display = 'none'; }} />
            )}
          </div>
        )}

        {editing && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Priority</label>
              <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })} className={inputClass}>
                {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Latitude</label>
              <input type="number" step="any" value={editForm.latitude} onChange={(e) => setEditForm({ ...editForm, latitude: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Longitude</label>
              <input type="number" step="any" value={editForm.longitude} onChange={(e) => setEditForm({ ...editForm, longitude: e.target.value })} className={inputClass} />
            </div>
          </div>
        )}

        {issue.resolutionNotes && (
          <div className="mt-4 rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-emerald-800">Resolution Notes</h3>
            <p className="mt-1 text-sm text-emerald-700">{issue.resolutionNotes}</p>
          </div>
        )}
      </div>

      {canChangeStatus && (
        <div className="rounded-lg bg-white border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Update Status</h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">New Status</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none">
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">Note (optional)</label>
              <input value={statusNote} onChange={(e) => setStatusNote(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none" placeholder="Add a note..." />
            </div>
            <button onClick={handleStatusUpdate} disabled={statusUpdating || (newStatus === issue.status && !statusNote)}
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
              {statusUpdating ? <Spinner size={16} className="text-white" /> : 'Update'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-white border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <History size={16} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900">Status History</h3>
        </div>
        <div className="space-y-3">
          {issue.statusHistory.length === 0 && <p className="text-sm text-slate-400">No history available.</p>}
          {issue.statusHistory.map((entry, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`h-2.5 w-2.5 rounded-full ${entry.newStatus === 'Resolved' ? 'bg-emerald-500' : entry.newStatus === 'In Progress' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                {idx < issue.statusHistory.length - 1 && <div className="h-6 w-px bg-slate-200" />}
              </div>
              <div className="pb-1">
                <p className="text-sm font-medium text-slate-800">
                  {entry.previousStatus && <span className="text-slate-500">{entry.previousStatus} → </span>}
                  {entry.newStatus}
                </p>
                <p className="text-xs text-slate-400">
                  {entry.changedBy?.name || 'System'} · {new Date(entry.changedAt).toLocaleString()}
                </p>
                {entry.note && <p className="text-xs text-slate-500 mt-0.5">{entry.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete this issue?"
        message="This action cannot be undone. The issue record will be permanently removed."
        onConfirm={confirmDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
