export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-8 border-t border-slate-800">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="text-white font-headline font-black tracking-widest uppercase text-xl">
            TrustedPlot
          </div>
          <p className="text-xs leading-relaxed opacity-70">
            The Digital Architect Ledger. Institutional-grade verification for the next generation of real estate assets.
          </p>
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
