import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  Building2,
  Briefcase,
  TrendingUp,
  Scale,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function Sidebar({
  activePage,
  onNavigate,
  collapsed,
  setCollapsed,
  isMobileOpen,
  onCloseMobile
}) {
  const menuItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'state', path: '/state-analysis', label: 'State Analysis', icon: MapPin },
    { id: 'district', path: '/district-analysis', label: 'District Analysis', icon: Building2 },
    { id: 'trade', path: '/trade-analysis', label: 'Trade & Skill Intel', icon: Briefcase },
    { id: 'forecast', path: '/forecast', label: 'AI Demand Forecast', icon: TrendingUp, badge: 'ML' },
    { id: 'gap', path: '/skill-gap', label: 'Skill Gap Engine', icon: Scale },
    { id: 'alerts', path: '/alerts', label: 'Early Warnings', icon: AlertTriangle, alertCount: 120 },
    { id: 'methodology', path: '/methodology', label: 'Data & Methodology', icon: FileText },
  ];

  const handleItemClick = (path, id) => {
    if (onNavigate) onNavigate(path, id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-govNavy-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Main Element */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out bg-govNavy-900 border-r border-govNavy-800 flex flex-col justify-between text-white shadow-xl ${
          // Desktop collapse state
          collapsed ? 'lg:w-20' : 'lg:w-72'
        } ${
          // Mobile responsive slide-over
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Branding Section */}
        <div>
          <div className="flex items-center justify-between px-4 py-4 border-b border-govNavy-800/80">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-govNavy-800 to-govNavy-950 border border-govCyan-500/30 flex items-center justify-center text-govCyan-400 font-extrabold shrink-0 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-govCyan-400" />
              </div>
              {(!collapsed || isMobileOpen) && (
                <div className="truncate">
                  <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                    LMIS India
                    <span className="text-[9px] uppercase tracking-wider bg-govCyan-500/20 text-govCyan-400 px-1.5 py-0.5 rounded-full font-bold border border-govCyan-500/30">
                      MSDE
                    </span>
                  </div>
                  <div className="text-[11px] text-govSlate-400 font-medium truncate">
                    National Labour Market Intel
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-govSlate-400 hover:text-white hover:bg-govNavy-800 transition-colors cursor-pointer"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-govSlate-400 hover:text-white hover:bg-govNavy-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id || activePage === item.path.replace('/', '');
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.path, item.id)}
                  className={`w-full flex items-center px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-govCyan-600 to-govNavy-800 text-white shadow-md border-l-4 border-govCyan-400 font-bold'
                      : 'text-govSlate-300 hover:bg-govNavy-800/80 hover:text-white'
                  } ${collapsed && !isMobileOpen ? 'justify-center' : 'justify-between'}`}
                  title={collapsed && !isMobileOpen ? item.label : undefined}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-govSlate-400 group-hover:text-govCyan-400'
                    }`} />
                    {(!collapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
                  </div>

                  {(!collapsed || isMobileOpen) && (
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {item.badge && (
                        <span className="text-[9px] bg-govCyan-500/20 text-govCyan-300 border border-govCyan-500/30 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}
                      {item.alertCount && (
                        <span className="text-[10px] bg-govRed-500 text-white font-extrabold px-1.5 py-0.5 rounded-full min-w-5 text-center shadow-xs">
                          {item.alertCount}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Profile & Information */}
        <div className="p-3 border-t border-govNavy-800/80 bg-govNavy-950/70">
          {(!collapsed || isMobileOpen) ? (
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-govNavy-800 border border-govNavy-700 flex items-center justify-center font-bold text-xs text-govCyan-400 shrink-0">
                  AV
                </div>
                <div className="truncate text-left">
                  <div className="text-xs font-bold text-white truncate">Dr. A. Verma</div>
                  <div className="text-[10px] text-govSlate-400 truncate">MSDE Planning Admin</div>
                </div>
              </div>
              <button
                onClick={() => handleItemClick('/methodology', 'methodology')}
                className="text-govSlate-400 hover:text-govCyan-400 transition p-1"
                title="Methodology & Documentation"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-1">
              <div className="w-8 h-8 rounded-full bg-govNavy-800 text-govCyan-400 font-bold text-xs flex items-center justify-center border border-govNavy-700">
                AV
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
