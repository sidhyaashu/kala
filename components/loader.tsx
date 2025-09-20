// File: components/loader.tsx
import { Sun } from 'lucide-react';

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative">
        <Sun className="h-24 w-24 text-amber-400 animate-[spin_3s_linear_infinite]" />
        <Sun className="absolute top-0 left-0 h-24 w-24 text-amber-400 animate-[ping_2s_ease-out_infinite]" />
      </div>
      <p className="mt-8 text-xl font-semibold text-white tracking-widest animate-pulse">
        Preparing Your Workshop...
      </p>
    </div>
  );
}