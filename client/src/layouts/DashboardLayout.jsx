import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { socket, connectSocket, disconnectSocket } from '../services/websocket';
import { 
  LayoutDashboard, Map, Cpu, Users, Wrench, Bell, 
  FileText, LogOut, Activity, ShieldAlert, Radio, AlertTriangle 
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [activeEmergency, setActiveEmergency] = useState(null);

  useEffect(() => {
    connectSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    
    // Check if simulation emergency is active
    fetch('http://localhost:5000/api/simulate/status')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.activeEmergencyZone) {
          setActiveEmergency(data.activeEmergencyZone);
        }
      })
      .catch(err => console.warn('Could not fetch simulation status', err));

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    
    socket.on('emergency_triggered', (data) => {
      setActiveEmergency(data.zone);
    });

    socket.on('emergency_cleared', () => {
      setActiveEmergency(null);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('emergency_triggered');
      socket.off('emergency_cleared');
      disconnectSocket();
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Plant Layout', path: '/layout', icon: Map },
    { name: 'Sensors Telemetry', path: '/sensors', icon: Cpu },
    { name: 'Personnel', path: '/workers', icon: Users },
    { name: 'Machinery', path: '/machines', icon: Wrench },
    { name: 'Safety Alerts', path: '/alerts', icon: Bell },
    { name: 'Safety Reports', path: '/reports', icon: FileText },
    { name: 'Evac & Simulation', path: '/emergency', icon: Radio },
  ];

  return (
    <div className="flex h-screen bg-brand-darkest font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-darker border-r border-brand-border flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-brand-border flex items-center space-x-3">
            <ShieldAlert className="h-8 w-8 text-brand-teal pulse-teal rounded-full" />
            <div>
              <h1 className="font-extrabold text-lg tracking-wider text-brand-textBright">SentinelAI</h1>
              <p className="text-[10px] text-brand-teal uppercase tracking-widest font-semibold">Predict • Prevent</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-brand-dark border-l-4 border-brand-teal text-brand-textBright' 
                        : 'text-brand-textMuted hover:bg-brand-dark hover:text-brand-textBright'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-brand-border bg-brand-darkest bg-opacity-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-brand-dark flex items-center justify-center font-bold text-brand-teal border border-brand-border">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate text-brand-textBright">{user?.name || 'User'}</p>
                <p className="text-xs text-brand-textMuted truncate">{user?.role || 'Operator'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              title="Logout" 
              className="text-brand-textMuted hover:text-brand-red p-1.5 rounded-lg hover:bg-brand-dark transition-all"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-brand-darker border-b border-brand-border px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold tracking-tight text-brand-textBright">
              {navItems.find(item => item.path === location.pathname)?.name || 'Platform'}
            </h2>
            
            {/* Live Indicator */}
            <div className="flex items-center space-x-2 bg-brand-darkest px-3 py-1 rounded-full border border-brand-border">
              <Activity className="h-4 w-4 text-brand-teal animate-pulse" />
              <span className="text-[11px] text-brand-textMuted font-mono">Live Telemetry Feed</span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Emergency Banner inside Header if Active */}
            {activeEmergency && (
              <div className="flex items-center space-x-2 bg-brand-red bg-opacity-20 border border-brand-red text-brand-red px-4 py-1.5 rounded-lg text-xs font-bold pulse-red">
                <AlertTriangle className="h-4 w-4" />
                <span>ACTIVE GAS LEAK / HAZARD IN {activeEmergency.toUpperCase()}</span>
              </div>
            )}

            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-brand-teal pulse-teal' : 'bg-brand-red animate-pulse'}`} />
              <span className="text-xs text-brand-textMuted font-medium font-mono">
                {isConnected ? 'SOC_CONN_ESTABLISHED' : 'SOC_CONN_ERR'}
              </span>
            </div>
          </div>
        </header>

        {/* Evacuation Broadcast Banner (Catastrophic warning overlay banner) */}
        {activeEmergency && (
          <div className="bg-brand-red text-white py-3 px-8 text-center text-sm font-black flex items-center justify-center space-x-3 select-none animate-pulse">
            <Radio className="h-5 w-5 animate-bounce" />
            <span>CRITICAL ALERT: EXHAUST VENTILATION STAGE 4 TRIGGERED. EMERGENCY EVACUATION ACTIVE FOR {activeEmergency.toUpperCase()}. SECURE ALL PERSONNEL.</span>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
