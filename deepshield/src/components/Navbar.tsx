import { Shield } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b border-white/10 bg-navy-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-electric-blue" />
            <span className="text-xl font-bold tracking-wide text-white">DeepShield</span>
          </div>
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-electric-blue/10 text-electric-blue border border-electric-blue/20">
              AI-Powered Security
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
