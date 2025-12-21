type LogoProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
};

const sizeMap = {
  xs: { box: 'w-6 h-6', text: 'text-sm' },
  sm: { box: 'w-8 h-8', text: 'text-xl' },
  md: { box: 'w-10 h-10', text: 'text-2xl' },
  lg: { box: 'w-12 h-12', text: 'text-3xl' },
};

export default function Logo({ size = 'md', showText = false, className = '' }: LogoProps) {
  const s = sizeMap[size] ?? sizeMap.md;
  return (
    <div className={`flex items-center gap-3 min-w-0 ${className}`}>
      <div className={`relative ${s.box} rounded-lg overflow-hidden`}>        
        <div className="absolute -inset-1 bg-linear-to-br from-green-400/40 via-purple-500/40 to-purple-600/40 blur-md"></div>
        <div className="relative flex items-center justify-center w-full h-full bg-slate-900/90 border border-white/30 rounded-lg">
          <span className="font-black text-accentLime drop-shadow-[0_0_6px_rgba(74,222,128,0.7)]" style={{ fontFamily: 'Press Start 2P, monospace', letterSpacing: '-0.02em' }}>愛</span>
        </div>
      </div>
      {showText && (
        <span
          className="min-w-0 text-lg sm:text-xl md:text-2xl font-black bg-linear-to-r from-green-300 via-purple-400 to-purple-500 bg-clip-text text-transparent leading-tight"
          style={{ fontFamily: 'Press Start 2P, monospace' }}
        >
          Sugoi<wbr />Hub
        </span>
      )}
    </div>
  );
}
