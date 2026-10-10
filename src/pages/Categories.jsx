import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { categoryService } from '../services';
import Spinner from '../components/Spinner';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  function fetchCategories() {
    setLoading(true);
    categoryService
      .list({ includeInactive: 'true' })
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function startCreate() {
    setForm({ name: '', description: '' });
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(cat) {
    setForm({ name: cat.name, description: cat.description || '' });
    setEditingId(cat._id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await categoryService.update(editingId, form);
      } else {
        await categoryService.create(form);
      }
      setShowForm(false);
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    try {
      await categoryService.remove(deleteId);
      setDeleteId(null);
      fetchCategories();
    } catch (err) {
      setError(err.message);
    }
  }

  const inputClass = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none';

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Categories</h2>
          <p className="text-sm text-slate-500">Manage issue categories.</p>
        </div>
        <button onClick={startCreate}
          className="flex items-center gap-1.5 rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg bg-white border border-slate-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">{editingId ? 'Edit Category' : 'New Category'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className={inputClass} placeholder="e.g. Potholes" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass} placeholder="Optional description" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-1.5 rounded-md bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
              {saving ? <Spinner size={15} className="text-white" /> : <Save size={15} />} Save
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg bg-white border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex h-32 items-center justify-center"><Spinner size={24} /></div>
        ) : categories.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-slate-400">No categories yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <div key={cat._id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900">{cat.name}</p>
                    {!cat.active && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">Inactive</span>
                    )}
                  </div>
                  {cat.description && <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(cat)}
                    className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-teal-600" title="Edit">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => setDeleteId(cat._id)}
                    className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600" title="Deactivate">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Deactivate this category?"
        message="The category will be marked as inactive and won't appear in dropdowns. Existing issues will keep their category."
        confirmLabel="Deactivate"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
