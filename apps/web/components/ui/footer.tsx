export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-4 md:px-8 border-t border-slate-800">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Logo mark */}
          <div className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 30 30" fill="none" className="text-white shrink-0" aria-hidden="true">
              <path d="M15 2L3 8v9c0 6.6 4.8 12.8 12 14.9C22.2 29.8 27 23.6 27 17V8L15 2z"
                fill="white" fillOpacity="0.12" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M10 15.5l3.5 3.5L21 11.5"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-white font-headline font-black tracking-tighter text-xl">TrustedPlot</span>
          </div>
          <p className="text-xs leading-relaxed opacity-70">
            The Digital Architect Ledger. Institutional-grade verification for the next generation of real estate assets.
          </p>
          {/* Trust badges */}
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              <span className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>verified</span>
              <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider">C of O</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              <span className="material-symbols-outlined text-emerald-400 text-sm" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>lock</span>
              <span className="text-[10px] text-white/70 font-bold uppercase tracking-wider">Escrow</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm">Ecosystem</h4>
          <nav className="flex flex-col gap-2">
            <a className="text-slate-400 hover:text-white transition-colors text-xs" href="/listings">Listings</a>
            <a className="text-slate-400 hover:text-white transition-colors text-xs" href="#">Escrow Protocol</a>
            <a className="text-slate-400 hover:text-white transition-colors text-xs" href="#">Verification Flow</a>
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm">Legal</h4>
          <nav className="flex flex-col gap-2">
            <a className="text-slate-400 hover:text-white transition-colors text-xs" href="#">Terms of Service</a>
            <a className="text-slate-400 hover:text-white transition-colors text-xs" href="#">Privacy Policy</a>
            <a className="text-slate-400 hover:text-white transition-colors text-xs" href="#">C of O Verification</a>
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm">Support</h4>
          <nav className="flex flex-col gap-2">
            <a className="text-slate-400 hover:text-white transition-colors text-xs" href="#">Digital Vault Help</a>
            <a className="text-slate-400 hover:text-white transition-colors text-xs" href="#">Contact</a>
            <a className="text-slate-400 hover:text-white transition-colors text-xs" href="#">Escrow Support</a>
          </nav>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs tracking-wide opacity-50">© 2024 TrustedPlot. The Digital Architect Ledger.</p>
        <div className="flex gap-6 opacity-80">
          <span className="material-symbols-outlined text-sm hover:text-amber-400 cursor-pointer">public</span>
          <span className="material-symbols-outlined text-sm hover:text-amber-400 cursor-pointer">shield</span>
          <span className="material-symbols-outlined text-sm hover:text-amber-400 cursor-pointer">verified_user</span>
        </div>
      </div>
    </footer>
  );
}
