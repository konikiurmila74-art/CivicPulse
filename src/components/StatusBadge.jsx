const statusConfig = {
  Reported: { bg: 'bg-amber-100', text: 'text-amber-800', ring: 'ring-amber-200', dot: 'bg-amber-500' },
  Assigned: { bg: 'bg-sky-100', text: 'text-sky-800', ring: 'ring-sky-200', dot: 'bg-sky-500' },
  'In Progress': { bg: 'bg-blue-100', text: 'text-blue-800', ring: 'ring-blue-200', dot: 'bg-blue-500' },
  Resolved: { bg: 'bg-emerald-100', text: 'text-emerald-800', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
};

export default function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig['Reported'];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text} ring-1 ${cfg.ring}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}
