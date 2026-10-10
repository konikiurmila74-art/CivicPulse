import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 20, className = '' }) {
  return (
    <Loader2 className={`animate-spin text-teal-600 ${className}`} size={size} />
  );
}
