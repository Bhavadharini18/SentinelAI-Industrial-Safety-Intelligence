import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { socket } from '../services/websocket';
import { 
  ShieldAlert, Users, Wrench, AlertCircle, TrendingUp, 
  Play, StopCircle, RefreshCw, PlusCircle 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, Cell 
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [safetyScore, setSafetyScore] = useState(100);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [riskTrend, setRiskTrend] = useState([]);
  const [triggeringZone, setTriggeringZone] = useState('Zone B');
  const [emergencySimActive, setEmergencySimActive] = useState(false);

  useEffect(() => {
    // 1. Fetch initial statistics
    fetchDashboardData();

    // 2. Setup socket listeners
    socket.on('global_safety_score', (data) => {
      setSafetyScore(data.safetyScore);
      setRiskTrend(prev => {
        const next = [...prev];
        next.shift();
        const now = new Date();
        const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
        next.push({ name: timeStr, risk: 100 - data.safetyScore });
        return next;
      });
    });

    socket.on('new_alert', (newAlert) => {
      setRecentAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
      // Increment alert count
      setStats(prev => {
        if (!prev) return null;
        return {
          ...prev,
          alerts: {
            ...prev.alerts,
            active: prev.alerts.active + 1,
            critical: newAlert.severity === 'Critical' ? prev.alerts.critical + 1 : prev.alerts.critical
          }
        };
      });
    });

    socket.on('alert_updated', (updated) => {
      setRecentAlerts(prev => prev.map(a => a._id === updated._id ? updated : a));
    });

    socket.on('emergency_triggered', (data) => {
      setEmergencySimActive(true);
      setTriggeringZone(data.zone);
    });

    socket.on('emergency_cleared', () => {
      setEmergencySimActive(false);
    });

    return () => {
      socket.off('global_safety_score');
      socket.off('new_alert');
      socket.off('alert_updated');
      socket.off('emergency_triggered');
      socket.off('emergency_cleared');
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/dashboard');
      if (res.data.success) {
        const d = res.data.data;
        setStats(d);
        setSafetyScore(d.safetyScore);
        setRecentAlerts(d.recentAlerts);
        setRecentIncidents(d.recentIncidents);
        setRiskTrend(d.riskTrend);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateEmergency = async () => {
    try {
      const res = await axios.post('/simulate/emergency', { zone: triggeringZone });
      if (res.data.success) {
        setEmergencySimActive(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearEmergency = async () => {
    try {
      const res = await axios.post('/simulate/clear');
      if (res.data.success) {
        setEmergencySimActive(false);
        fetchDashboardData(); // Refresh state
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
          <p className="text-brand-textMuted text-xs font-mono">LOADING_INTELLIGENCE_METRICS...</p>
        </div>
      </div>
    );
  }

  // Safety Score color calculation
  const getSafetyScoreColor = (score) => {
    if (score >= 80) return 'text-brand-teal';
    if (score >= 50) return 'text-brand-amber';
    return 'text-brand-red';
  };

  const getSafetyScoreBg = (score) => {
    if (score >= 80) return 'bg-brand-teal';
    if (score >= 50) return 'bg-brand-amber';
    return 'bg-brand-red';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Safety Score */}
        <div className="glass-card p-6 flex items-center justify-between shadow-glow-teal">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-textMuted">Operational Safety Score</p>
            <p className={`text-4xl font-extrabold font-mono ${getSafetyScoreColor(safetyScore)}`}>
              {safetyScore}%
            </p>
            <p className="text-[10px] text-brand-textMuted">Compound probability index</p>
          </div>
          <div className="relative h-14 w-14">
            <svg className="w-full h-full transform -rotate-95" viewBox="0 0 36 36">
              <path
                className="text-brand-dark"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${getSafetyScoreColor(safetyScore)}`}
                strokeWidth="3.5"
                strokeDasharray={`${safetyScore}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldAlert className={`h-6 w-6 ${getSafetyScoreColor(safetyScore)}`} />
            </div>
          </div>
        </div>

        {/* Workers Online */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-textMuted">Personnel Online</p>
            <p className="text-4xl font-extrabold text-brand-textBright font-mono">
              {stats?.workers?.online || 0}
              <span className="text-sm font-medium text-brand-textMuted font-sans"> / {stats?.workers?.total || 0}</span>
            </p>
            <p className="text-[10px] text-brand-textMuted">Geolocated on factory map</p>
          </div>
          <div className="bg-brand-dark p-3 rounded-xl border border-brand-border">
            <Users className="h-6 w-6 text-brand-teal" />
          </div>
        </div>

        {/* Active Alerts */}
        <div className={`glass-card p-6 flex items-center justify-between ${stats?.alerts?.critical > 0 ? 'border-brand-red bg-brand-red bg-opacity-5' : ''}`}>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-textMuted">Active Hazards</p>
            <p className={`text-4xl font-extrabold font-mono ${stats?.alerts?.active > 0 ? 'text-brand-orange' : 'text-brand-textBright'}`}>
              {stats?.alerts?.active || 0}
            </p>
            <p className="text-[10px] text-brand-textMuted">
              {stats?.alerts?.critical || 0} critical emergency evacuations
            </p>
          </div>
          <div className={`p-3 rounded-xl border ${stats?.alerts?.critical > 0 ? 'bg-brand-red bg-opacity-20 border-brand-red animate-pulse' : 'bg-brand-dark border-brand-border'}`}>
            <AlertCircle className={`h-6 w-6 ${stats?.alerts?.critical > 0 ? 'text-brand-red' : 'text-brand-amber'}`} />
          </div>
        </div>

        {/* Active Machines */}
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-textMuted">Machinery Active</p>
            <p className="text-4xl font-extrabold text-brand-textBright font-mono">
              {stats?.machines?.active || 0}
              <span className="text-sm font-medium text-brand-textMuted font-sans"> / {stats?.machines?.total || 0}</span>
            </p>
            <p className="text-[10px] text-brand-textMuted">Under load telemetry</p>
          </div>
          <div className="bg-brand-dark p-3 rounded-xl border border-brand-border">
            <Wrench className="h-6 w-6 text-brand-teal" />
          </div>
        </div>

      </div>

      {/* Main Charts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Trend Chart */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-brand-textBright">Zone Threat Level Tracking</h3>
              <p className="text-xs text-brand-textMuted">Real-time aggregate hazard level (100% - Safety Index)</p>
            </div>
            <TrendingUp className="h-5 w-5 text-brand-teal" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F1626', borderColor: '#1F2937', color: '#F8FAFC' }}
                  labelStyle={{ color: '#94A3B8', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="risk" stroke="#0D9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Control Room Simulator */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-brand-textBright mb-1">Command Control Room</h3>
            <p className="text-xs text-brand-textMuted mb-4">Simulate compound hazards to trigger SentinelAI automated actions.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1">Target Zone For Leak Simulation</label>
                <select 
                  className="w-full bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright p-2.5 focus:outline-none focus:border-brand-teal"
                  value={triggeringZone}
                  onChange={(e) => setTriggeringZone(e.target.value)}
                  disabled={emergencySimActive}
                >
                  <option value="Zone A">Zone A (Nitrogen Gen / Gas Detector A1)</option>
                  <option value="Zone B">Zone B (Boiler System / Temp probe B1)</option>
                  <option value="Zone C">Zone C (Catalytic Reformer)</option>
                </select>
              </div>

              {emergencySimActive ? (
                <div className="p-3.5 bg-brand-red bg-opacity-10 border border-brand-red rounded-lg text-xs text-brand-red text-center font-bold animate-pulse">
                  Emergency simulated in {triggeringZone.toUpperCase()}. Telemetry is spiking rapidly.
                </div>
              ) : (
                <div className="p-3.5 bg-brand-teal bg-opacity-5 border border-brand-border rounded-lg text-xs text-brand-textMuted text-center font-mono">
                  ALL_SYSTEMS_NOMINAL
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {!emergencySimActive ? (
              <button
                onClick={handleSimulateEmergency}
                className="col-span-2 py-3 bg-brand-orange hover:bg-opacity-95 text-brand-textBright font-bold rounded-lg text-xs flex items-center justify-center space-x-2 transition-all"
              >
                <Play className="h-4 w-4" />
                <span>TRIGGER LEAK SIMULATOR</span>
              </button>
            ) : (
              <button
                onClick={handleClearEmergency}
                className="col-span-2 py-3 bg-brand-teal hover:bg-opacity-95 text-brand-textBright font-bold rounded-lg text-xs flex items-center justify-center space-x-2 transition-all glow-teal"
              >
                <StopCircle className="h-4 w-4" />
                <span>RESOLVE & VENT GAS</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Alerts and Incidents Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Alerts */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-brand-textBright">Recent Safety Alarms</h3>
            <span className="text-[10px] font-mono text-brand-teal">Live telemetry</span>
          </div>

          <div className="space-y-3.5">
            {recentAlerts.length === 0 ? (
              <p className="text-xs text-brand-textMuted text-center py-6">No alarms active. System is secure.</p>
            ) : (
              recentAlerts.map(alert => (
                <div 
                  key={alert._id} 
                  className={`p-3 bg-brand-darkest bg-opacity-40 border border-brand-border rounded-lg flex items-start justify-between space-x-4 ${alert.status === 'Active' && alert.severity === 'Critical' ? 'border-brand-red border-opacity-40' : ''}`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${
                        alert.severity === 'Critical' ? 'bg-brand-red text-white' :
                        alert.severity === 'High' ? 'bg-brand-orange text-white' :
                        alert.severity === 'Medium' ? 'bg-brand-amber text-brand-darkest' :
                        'bg-brand-dark text-brand-textMuted border border-brand-border'
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs font-semibold text-brand-textBright truncate">{alert.title}</span>
                    </div>
                    <p className="text-[11px] text-brand-textMuted line-clamp-1">{alert.description}</p>
                    <p className="text-[9px] text-brand-textMuted font-mono">Zone: {alert.zone} • {new Date(alert.timestamp).toLocaleTimeString()}</p>
                  </div>
                  
                  {alert.status === 'Active' ? (
                    <span className="h-2 w-2 rounded-full bg-brand-orange animate-ping flex-shrink-0 mt-1" />
                  ) : (
                    <span className="text-[9px] uppercase font-mono text-brand-teal bg-brand-teal bg-opacity-10 px-2 py-0.5 rounded border border-brand-teal border-opacity-25 flex-shrink-0">
                      {alert.status}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-brand-textBright">Incident History Log</h3>
            <span className="text-[10px] font-mono text-brand-textMuted">Audited records</span>
          </div>

          <div className="space-y-3.5">
            {recentIncidents.length === 0 ? (
              <p className="text-xs text-brand-textMuted text-center py-6">No historical safety breaches logged.</p>
            ) : (
              recentIncidents.map(inc => (
                <div key={inc._id} className="p-3 bg-brand-darkest bg-opacity-40 border border-brand-border rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-textBright">{inc.title}</span>
                    <span className="text-[10px] text-brand-textMuted font-mono">{new Date(inc.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[11px] text-brand-textMuted leading-relaxed">{inc.description}</p>
                  <div className="flex items-center justify-between text-[9px] text-brand-textMuted font-mono pt-1">
                    <span>Root Cause: {inc.rootCause}</span>
                    <span className="text-brand-orange">Severity: {inc.severity}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
