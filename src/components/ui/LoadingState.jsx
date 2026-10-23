import { LoaderCircle } from 'lucide-react';
export default function LoadingState({ label = 'Loading' }) { return <div className="loading-state" role="status"><LoaderCircle size={20} className="loading-state__icon"/><span>{label}</span></div>; }
