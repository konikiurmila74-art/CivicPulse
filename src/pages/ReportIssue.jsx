import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Copy } from 'lucide-react';
import { issueService, categoryService } from '../services';
import Spinner from '../components/Spinner';

const priorities = ['Low', 'Medium', 'High', 'Critical'];

export default function ReportIssue() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    address: '',
    latitude: '',
    longitude: '',
    imageUrl: '',
    priority: 'Medium',
  });
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    categoryService
      .list()
      .then((cats) => {
        setCategories(cats);
        if (cats.length > 0 && !form.category) {
          setForm((f) => ({ ...f, category: cats[0].name }));
        }
      })
      .catch(() => {})
      .finally(() => setCatLoading(false));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        imageUrl: form.imageUrl || undefined,
      };
      const issue = await issueService.create(payload);
      setSuccess(issue);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyTrackingId() {
    navigator.clipboard.writeText(success.trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (success) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-md w-full rounded-lg bg-white border border-slate-200 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="text-emerald-600" size={28} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Issue Reported Successfully</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your issue has been submitted. Save this tracking ID to check its status later.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 rounded-md bg-slate-100 px-4 py-3">
            <code className="text-sm font-mono font-semibold text-slate-800">{success.trackingId}</code>
            <button onClick={copyTrackingId} className="text-slate-500 hover:text-slate-700">
              {copied ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />}
            </button>
          </div>
          <div className="mt-6 flex gap-2 justify-center">
            <button
              onClick={() => navigate(`/issues/${success._id}`)}
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              View Issue
            </button>
            <button
              onClick={() => {
                setSuccess(null);
                setForm({ title: '', description: '', category: categories[0]?.name || '', address: '', latitude: '', longitude: '', imageUrl: '', priority: 'Medium' });
              }}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Report Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none';

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-slate-900">Report an Issue</h2>
      <p className="text-sm text-slate-500">Fill in the details below to report a city issue.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4 rounded-lg bg-white border border-slate-200 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Title *</label>
          <input name="title" value={form.title} onChange={handleChange} required maxLength={150}
            className={inputClass} placeholder="Brief title, e.g. Pothole on Main Street" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} required minLength={10} rows={4}
            className={inputClass} placeholder="Describe the issue in detail..." />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Category *</label>
            {catLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400"><Spinner size={16} /> Loading…</div>
            ) : (
              <select name="category" value={form.category} onChange={handleChange} required className={inputClass}>
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} className={inputClass}>
              {priorities.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Address / Locality *</label>
          <input name="address" value={form.address} onChange={handleChange} required maxLength={300}
            className={inputClass} placeholder="e.g. Main St & 5th Ave" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Latitude (optional)</label>
            <input name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange}
              className={inputClass} placeholder="12.9716" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Longitude (optional)</label>
            <input name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange}
              className={inputClass} placeholder="77.5946" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Image URL (optional)</label>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange}
            className={inputClass} placeholder="https://..." />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">{error}</div>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => navigate('/dashboard')}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
            {loading && <Spinner size={16} className="text-white" />}
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
}
