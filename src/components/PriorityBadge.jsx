const priorityConfig = {
  Low: { bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-200' },
  Medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-200' },
  High: { bg: 'bg-orange-100', text: 'text-orange-800', ring: 'ring-orange-200' },
  Critical: { bg: 'bg-red-100', text: 'text-red-800', ring: 'ring-red-200' },
};

export default function PriorityBadge({ priority }) {
  const cfg = priorityConfig[priority] || priorityConfig['Medium'];
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text} ring-1 ${cfg.ring}`}>
      {priority}
    </span>
  );
}
