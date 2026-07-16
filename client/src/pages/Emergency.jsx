import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { socket } from '../services/websocket';
import { 
  ShieldAlert, ShieldCheck, Flame, Radio, 
  Map, Navigation, LogOut, RotateCcw, AlertTriangle 
} from 'lucide-react';

const Emergency = () => {
  const [activeZone, setActiveZone] = useState(null);
  const [selectedZone, setSelectedZone] = useState('Zone B');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Check initial simulation status
    axios.get('/simulate/status')
      .then(res => {
        if (res.data.success && res.data.activeEmergencyZone) {
          setActiveZone(res.data.activeEmergencyZone);
          addLog(`System loaded. Active simulation running in ${res.data.activeEmergencyZone}.`);
        } else {
          addLog("System loaded. Monitoring environment. All zones normal.");
        }
      });

    socket.on('emergency_triggered', (data) => {
      setActiveZone(data.zone);
      addLog(`⚠️ EMERGENCY BROKEN: Evacuation routing calculated for ${data.zone.toUpperCase()}.`);
    });

    socket.on('emergency_cleared', () => {
      setActiveZone(null);
      addLog("✅ ALL CLEAR: Emergency conditions cleared. Environment normal.");
    });

    return () => {
      socket.off('emergency_triggered');
      socket.off('emergency_cleared');
    };
  }, []);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 14)]);
  };

  const handleSimulate = async () => {
    try {
      const res = await axios.post('/simulate/emergency', { zone: selectedZone });
      if (res.data.success) {
        setActiveZone(selectedZone);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = async () => {
    try {
      const res = await axios.post('/simulate/clear');
      if (res.data.success) {
        setActiveZone(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
      
      {/* Simulation Controls Panel */}
      <div className="glass-card p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-brand-textBright">Crisis Control Center</h3>
            <p className="text-xs text-brand-textMuted">Trigger and manage simulated emergency protocols</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1.5">Simulation Target Zone</label>
              <select
                className="w-full bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright p-2.5 focus:outline-none focus:border-brand-teal"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                disabled={!!activeZone}
              >
                <option value="Zone A">Zone A - Chemical Feed</option>
                <option value="Zone B">Zone B - High Pressure Reactor</option>
                <option value="Zone C">Zone C - Catalytic Reformer</option>
              </select>
            </div>

            {activeZone ? (
              <div className="p-4 bg-brand-red bg-opacity-10 border border-brand-red text-brand-red rounded-xl text-center space-y-2">
                <AlertTriangle className="h-6 w-6 text-brand-red mx-auto animate-bounce" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Hazard Simulation Running</h4>
                <p className="text-[10px] text-brand-textMuted leading-relaxed">
                  FastAPI AI predicts high explosion chance. Evacuation route generated. Exhaust fans set to maximum vent load.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-brand-teal bg-opacity-5 border border-brand-teal border-opacity-20 text-brand-teal rounded-xl text-center space-y-2">
                <ShieldCheck className="h-6 w-6 text-brand-teal mx-auto pulse-teal rounded-full" />
                <h4 className="text-xs font-bold uppercase tracking-wider">All Systems Nominal</h4>
                <p className="text-[10px] text-brand-textMuted leading-relaxed">
                  No simulations running. SentinelAI AI engine continues passive analysis of telemetry inputs.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-6 border-t border-brand-border">
          {!activeZone ? (
            <button
              onClick={handleSimulate}
              className="w-full py-2.5 bg-brand-orange hover:bg-opacity-90 text-brand-textBright font-bold rounded-lg text-xs flex items-center justify-center space-x-2 transition-all border border-brand-orange border-opacity-35"
            >
              <Flame className="h-4 w-4" />
              <span>SIMULATE GAS LEAK & PRESSURE VENT FAILURE</span>
            </button>
          ) : (
            <button
              onClick={handleClear}
              className="w-full py-2.5 bg-brand-teal hover:bg-opacity-90 text-brand-textBright font-bold rounded-lg text-xs flex items-center justify-center space-x-2 transition-all glow-teal border border-brand-teal border-opacity-35"
            >
              <RotateCcw className="h-4 w-4" />
              <span>CLEAR ALARMS & INITIATE VENTILATION</span>
            </button>
          )}
        </div>
      </div>

      {/* Evacuation Route Visualization */}
      <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden">
        <div>
          <h3 className="text-sm font-bold text-brand-textBright">Evacuation Routing Grid</h3>
          <p className="text-xs text-brand-textMuted">Dynamically computed evacuation exits based on hazard locations</p>
        </div>

        {/* Route Graph */}
        <div className="flex-1 bg-brand-darkest border border-brand-border rounded-xl my-4 relative p-4 flex items-center justify-center min-h-[40vh]">
          
          {/* Exit Indicator */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-1">
            <span className="bg-brand-teal text-white text-[9px] font-bold px-2 py-0.5 rounded font-mono flex items-center space-x-1 shadow-glow-teal">
              <LogOut className="h-3 w-3" />
              <span>PRIMARY_EXIT</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-8 w-full max-w-md font-mono text-center">
            
            {/* Zone A Card */}
            <div className={`p-4 rounded-xl border relative ${
              activeZone === 'Zone A' ? 'border-brand-red bg-brand-red bg-opacity-5 animate-pulse' : 'border-brand-border bg-brand-darker'
            }`}>
              <span className="block text-[9px] text-brand-textMuted mb-2">ZONE A</span>
              {activeZone === 'Zone A' ? (
                <span className="text-brand-red font-bold text-xs">HAZARD!</span>
              ) : (
                <span className="text-brand-teal font-bold text-xs">SAFE</span>
              )}
              {/* Arrow Indicator */}
              <div className="absolute right-[-24px] top-1/2 transform -translate-y-1/2 text-xs">
                {activeZone === 'Zone A' ? (
                  <Navigation className="h-4 w-4 text-brand-red transform rotate-90 animate-bounce" />
                ) : (
                  <Navigation className="h-4 w-4 text-brand-teal transform rotate-90" />
                )}
              </div>
            </div>

            {/* Zone B Card */}
            <div className={`p-4 rounded-xl border relative ${
              activeZone === 'Zone B' ? 'border-brand-red bg-brand-red bg-opacity-5 animate-pulse' : 'border-brand-border bg-brand-darker'
            }`}>
              <span className="block text-[9px] text-brand-textMuted mb-2">ZONE B</span>
              {activeZone === 'Zone B' ? (
                <span className="text-brand-red font-bold text-xs">HAZARD!</span>
              ) : (
                <span className="text-brand-teal font-bold text-xs font-mono">SAFE</span>
              )}
              
              {/* Dynamic evacuation redirect arrow! */}
              <div className="absolute right-[-24px] top-1/2 transform -translate-y-1/2 text-xs">
                {activeZone === 'Zone B' ? (
                  /* Blocked arrow */
                  <XCircleIcon />
                ) : (
                  <Navigation className="h-4 w-4 text-brand-teal transform rotate-90" />
                )}
              </div>
            </div>

            {/* Zone C Exit Gate */}
            <div className={`p-4 rounded-xl border relative ${
              activeZone === 'Zone C' ? 'border-brand-red bg-brand-red bg-opacity-5 animate-pulse' : 'border-brand-border bg-brand-darker'
            }`}>
              <span className="block text-[9px] text-brand-textMuted mb-2">ZONE C</span>
              {activeZone === 'Zone C' ? (
                <span className="text-brand-red font-bold text-xs">HAZARD!</span>
              ) : (
                <span className="text-brand-teal font-bold text-xs">EXIT OPEN</span>
              )}
            </div>

          </div>
        </div>

        <div className="text-[10px] text-brand-textMuted font-mono text-center">
          {activeZone === 'Zone B' ? (
            <span className="text-brand-orange animate-pulse">WARNING: ZONE B ACCESS GATES SEALED. ALL PERSONNEL ROUTED THROUGH ZONE A FOR EXITING.</span>
          ) : activeZone === 'Zone A' ? (
            <span className="text-brand-red animate-pulse">CRITICAL: ZONE A CORRIDORS CLEARING. PERSONNEL IMMEDIATE EVAC TO ZONE B &rarr; EXIT.</span>
          ) : (
            <span>ENVIRONMENT NOMINAL. EXITS CLEAR FOR DEPARTURE.</span>
          )}
        </div>
      </div>

      {/* Simulator Event Logs */}
      <div className="glass-card p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-brand-textBright mb-3">Gateway Console Logs</h3>
          <div className="bg-brand-darkest border border-brand-border rounded-xl p-4 h-[60vh] overflow-y-auto font-mono text-[10px] text-brand-teal space-y-2">
            {logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed border-b border-brand-border border-opacity-5 pb-1 select-text">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-red animate-pulse mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

export default Emergency;
