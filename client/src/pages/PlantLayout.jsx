import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { socket } from '../services/websocket';
import { 
  Map, Shield, AlertTriangle, User, HardHat, 
  Cpu, Wrench, Thermometer, Gauge, Flame 
} from 'lucide-react';

const PlantLayout = () => {
  const [sensors, setSensors] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [zoneRisks, setZoneRisks] = useState({
    'Zone A': { risk_score: 12, severity: 'LOW' },
    'Zone B': { risk_score: 15, severity: 'LOW' },
    'Zone C': { risk_score: 8, severity: 'LOW' }
  });
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [activeEmergencyZone, setActiveEmergencyZone] = useState(null);

  useEffect(() => {
    fetchInitialMapData();

    // Check emergency status
    axios.get('/simulate/status')
      .then(res => {
        if (res.data.success && res.data.activeEmergencyZone) {
          setActiveEmergencyZone(res.data.activeEmergencyZone);
        }
      });

    // Socket updates
    socket.on('sensor_updates', (updatedSensors) => {
      setSensors(updatedSensors);
    });

    socket.on('zone_risks', (risks) => {
      setZoneRisks(risks);
    });

    socket.on('emergency_triggered', (data) => {
      setActiveEmergencyZone(data.zone);
    });

    socket.on('emergency_cleared', () => {
      setActiveEmergencyZone(null);
    });

    // Periodic worker movement simulation to showcase map reactivity
    const movementTimer = setInterval(() => {
      setWorkers(prev => prev.map(w => {
        if (!w.online) return w;
        // Jitter coords slightly
        const dx = (Math.random() - 0.5) * 3;
        const dy = (Math.random() - 0.5) * 3;
        return {
          ...w,
          location: {
            x: Math.max(5, Math.min(95, w.location.x + dx)),
            y: Math.max(5, Math.min(95, w.location.y + dy))
          }
        };
      }));
    }, 5000);

    return () => {
      socket.off('sensor_updates');
      socket.off('zone_risks');
      socket.off('emergency_triggered');
      socket.off('emergency_cleared');
      clearInterval(movementTimer);
    };
  }, []);

  const fetchInitialMapData = async () => {
    try {
      const [sRes, wRes, mRes] = await Promise.all([
        axios.get('/sensors'),
        axios.get('/workers'),
        axios.get('/machines')
      ]);
      if (sRes.data.success) setSensors(sRes.data.data);
      if (wRes.data.success) setWorkers(wRes.data.data);
      if (mRes.data.success) setMachines(mRes.data.data);
    } catch (err) {
      console.error('Error fetching plant layout data:', err);
    }
  };

  const getZoneColor = (zoneName) => {
    if (activeEmergencyZone === zoneName) return 'stroke-brand-red fill-brand-red fill-opacity-10';
    const risk = zoneRisks[zoneName]?.risk_score || 0;
    if (risk >= 80) return 'stroke-brand-red fill-brand-red fill-opacity-5';
    if (risk >= 50) return 'stroke-brand-orange fill-brand-orange fill-opacity-5';
    if (risk >= 25) return 'stroke-brand-amber fill-brand-amber fill-opacity-5';
    return 'stroke-brand-border fill-brand-darkest fill-opacity-40';
  };

  const getSensorColorClass = (sensor) => {
    if (sensor.status !== 'Active') return 'bg-brand-dark border-brand-textMuted';
    if (sensor.type === 'Gas' && sensor.currentValue >= 60.0) return 'bg-brand-red border-brand-textBright pulse-red text-white';
    if (sensor.type === 'Temperature' && sensor.currentValue >= 75.0) return 'bg-brand-orange border-brand-textBright pulse-red text-white';
    if (sensor.type === 'Pressure' && sensor.currentValue >= 120.0) return 'bg-brand-orange border-brand-textBright pulse-red text-white';
    return 'bg-brand-teal border-brand-border text-brand-textBright';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[80vh]">
      
      {/* Visual SVG Plant Layout Grid */}
      <div className="lg:col-span-3 glass-card p-6 flex flex-col justify-between relative overflow-hidden select-none">
        
        {/* Header bar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-brand-textBright">Plant Floor Plan Blueprint</h3>
            <p className="text-xs text-brand-textMuted">Interactive spatial mapping tracking assets, sensors & risk overlays</p>
          </div>
          
          {/* Key */}
          <div className="flex items-center space-x-4 text-[10px] uppercase font-bold text-brand-textMuted font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-teal" />
              <span>Sensor</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded bg-amber-500" />
              <span>Machine</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-3 w-3 rounded-full bg-blue-500 border border-white flex items-center justify-center text-[8px] text-white">W</span>
              <span>Worker</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-2.5 w-6 border border-brand-red border-dashed bg-brand-red bg-opacity-5" />
              <span>Restricted Zone B</span>
            </div>
          </div>
        </div>

        {/* SVG Blueprint */}
        <div className="flex-1 bg-[#090C12] border border-brand-border rounded-xl relative p-4 flex items-center justify-center">
          <svg className="w-full h-full max-h-[55vh]" viewBox="0 0 100 60">
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#1f2937" strokeWidth="0.1" />
              </pattern>
            </defs>
            <rect width="100" height="60" fill="url(#grid)" />

            {/* Sub-Zones */}
            {/* Zone A: Left Room */}
            <rect 
              x="2" y="2" width="30" height="56" 
              rx="1" strokeWidth="0.4"
              className={`${getZoneColor('Zone A')} transition-colors duration-500`}
            />
            <text x="5" y="6" className="text-[2px] font-bold fill-brand-textMuted uppercase tracking-wider font-mono">Zone A - Chemical Feed</text>

            {/* Zone B: Middle Room (Restricted Area) */}
            <rect 
              x="34" y="2" width="36" height="56" 
              rx="1" strokeWidth="0.4"
              className={`${getZoneColor('Zone B')} transition-colors duration-500`}
            />
            {/* Striped outline warning for restricted Zone B */}
            <rect 
              x="35" y="3" width="34" height="54" 
              rx="1" strokeWidth="0.25" strokeDasharray="1 1"
              className="stroke-brand-orange fill-none"
            />
            <text x="37" y="6" className="text-[2px] font-bold fill-brand-orange uppercase tracking-wider font-mono">Zone B - High Pressure Reactor (Restricted)</text>

            {/* Zone C: Right Room */}
            <rect 
              x="72" y="2" width="26" height="56" 
              rx="1" strokeWidth="0.4"
              className={`${getZoneColor('Zone C')} transition-colors duration-500`}
            />
            <text x="75" y="6" className="text-[2px] font-bold fill-brand-textMuted uppercase tracking-wider font-mono">Zone C - Catalytic Reformer</text>

            {/* Physical doorways/connectors */}
            <rect x="31" y="25" width="4" height="6" fill="#090C12" stroke="#1f2937" strokeWidth="0.2" />
            <rect x="69" y="30" width="4" height="6" fill="#090C12" stroke="#1f2937" strokeWidth="0.2" />

            {/* Render Machinery (Represented as boxes) */}
            {machines.map(m => (
              <g 
                key={m._id} 
                className="cursor-pointer"
                onClick={() => setSelectedEntity({ type: 'machine', data: m })}
              >
                <rect 
                  x={m.location?.x ? (m.location.x / 100) * 100 : 50} 
                  y={m.location?.y ? (m.location.y / 100) * 60 : 30} 
                  width="7" height="6" 
                  rx="0.5"
                  fill="#1E293B" 
                  stroke={m.status === 'Failing' ? '#DC2626' : m.status === 'Maintenance' ? '#D97706' : '#0D9488'} 
                  strokeWidth="0.3"
                  className="hover:fill-brand-dark transition-all"
                />
                <text 
                  x={m.location?.x ? (m.location.x / 100) * 100 + 1 : 51} 
                  y={m.location?.y ? (m.location.y / 100) * 60 + 4 : 34} 
                  className="text-[1.3px] fill-brand-textBright font-mono font-bold"
                >
                  {m.code.split('-')[1] || 'MCH'}
                </text>
              </g>
            ))}

            {/* Render Sensors (Represented as glowing triangles/dots) */}
            {sensors.map(s => {
              const sx = s.location?.x ? (s.location.x / 100) * 100 : 50;
              const sy = s.location?.y ? (s.location.y / 100) * 60 : 30;
              const isAlerting = s.type === 'Gas' && s.currentValue >= 60.0;
              return (
                <g 
                  key={s._id} 
                  className="cursor-pointer"
                  onClick={() => setSelectedEntity({ type: 'sensor', data: s })}
                >
                  <circle 
                    cx={sx} 
                    cy={sy} 
                    r="1.8" 
                    fill={s.status !== 'Active' ? '#475569' : isAlerting ? '#DC2626' : '#0D9488'}
                    className={isAlerting ? 'animate-ping' : ''}
                    opacity={isAlerting ? 0.6 : 0.2}
                  />
                  <circle 
                    cx={sx} 
                    cy={sy} 
                    r="1" 
                    fill={s.status !== 'Active' ? '#475569' : isAlerting ? '#DC2626' : '#0D9488'}
                    stroke="#F8FAFC"
                    strokeWidth="0.1"
                  />
                </g>
              );
            })}

            {/* Render Geolocated Workers (Blue helmets) */}
            {workers.filter(w => w.online).map(w => {
              const wx = w.location?.x ? (w.location.x / 100) * 100 : 50;
              const wy = w.location?.y ? (w.location.y / 100) * 60 : 30;
              return (
                <g 
                  key={w._id} 
                  className="cursor-pointer"
                  onClick={() => setSelectedEntity({ type: 'worker', data: w })}
                >
                  <circle 
                    cx={wx} 
                    cy={wy} 
                    r="1.1" 
                    fill="#3B82F6"
                    stroke="#F8FAFC"
                    strokeWidth="0.15"
                  />
                  <text 
                    x={wx - 0.5} 
                    y={wy + 0.3} 
                    className="text-[1px] fill-white font-black font-mono pointer-events-none"
                  >
                    W
                  </text>
                </g>
              );
            })}

          </svg>
        </div>
      </div>

      {/* Detail Inspector Panel */}
      <div className="glass-card p-6 flex flex-col justify-between h-full">
        {selectedEntity ? (
          <div className="space-y-6 flex-1">
            <div className="border-b border-brand-border pb-3 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-teal">Asset Inspector</h4>
              <button 
                onClick={() => setSelectedEntity(null)} 
                className="text-[10px] text-brand-textMuted hover:text-white uppercase font-bold"
              >
                Clear
              </button>
            </div>

            {/* Machine Entity details */}
            {selectedEntity.type === 'machine' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-brand-dark border border-brand-border rounded-lg text-brand-amber">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-brand-textBright">{selectedEntity.data.name}</h5>
                    <p className="text-[10px] text-brand-textMuted font-mono">{selectedEntity.data.code}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-2.5 bg-brand-darkest rounded border border-brand-border">
                    <span className="block text-[8px] text-brand-textMuted">HEALTH_INDEX</span>
                    <span className="font-bold text-brand-teal">{selectedEntity.data.healthScore}%</span>
                  </div>
                  <div className="p-2.5 bg-brand-darkest rounded border border-brand-border">
                    <span className="block text-[8px] text-brand-textMuted">STATUS</span>
                    <span className={`font-bold ${
                      selectedEntity.data.status === 'Operational' ? 'text-brand-teal' : 'text-brand-orange'
                    }`}>{selectedEntity.data.status}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-brand-darkest rounded-lg border border-brand-border space-y-1.5 text-xs text-brand-textMuted">
                  <p>Zone: <strong className="text-brand-textBright">{selectedEntity.data.currentZone}</strong></p>
                  <p>Last Inspection: <span className="font-mono">{new Date(selectedEntity.data.lastMaintenance).toLocaleDateString()}</span></p>
                  <p>Next Service: <span className="font-mono">{new Date(selectedEntity.data.nextMaintenance).toLocaleDateString()}</span></p>
                </div>
              </div>
            )}

            {/* Sensor Entity details */}
            {selectedEntity.type === 'sensor' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-brand-dark border border-brand-border rounded-lg text-brand-teal">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-brand-textBright">{selectedEntity.data.name}</h5>
                    <p className="text-[10px] text-brand-textMuted font-mono">{selectedEntity.data.code}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-2.5 bg-brand-darkest rounded border border-brand-border">
                    <span className="block text-[8px] text-brand-textMuted">TELEMETRY_VALUE</span>
                    <span className="font-bold text-brand-teal">{selectedEntity.data.currentValue} {selectedEntity.data.unit}</span>
                  </div>
                  <div className="p-2.5 bg-brand-darkest rounded border border-brand-border">
                    <span className="block text-[8px] text-brand-textMuted">SENSOR_TYPE</span>
                    <span className="font-bold text-brand-textBright">{selectedEntity.data.type}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-brand-darkest rounded-lg border border-brand-border space-y-1.5 text-xs text-brand-textMuted">
                  <p>Zone: <strong className="text-brand-textBright">{selectedEntity.data.currentZone}</strong></p>
                  <p>Position: <span className="font-mono">X:{selectedEntity.data.location.x} Y:{selectedEntity.data.location.y}</span></p>
                  <p>Status: <span className="text-brand-teal font-bold uppercase">{selectedEntity.data.status}</span></p>
                </div>
              </div>
            )}

            {/* Worker Entity details */}
            {selectedEntity.type === 'worker' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-brand-dark border border-brand-border rounded-lg text-blue-400">
                    <HardHat className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-brand-textBright">{selectedEntity.data.name}</h5>
                    <p className="text-[10px] text-brand-textMuted font-mono">{selectedEntity.data.employeeId}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-brand-darkest rounded-lg border border-brand-border space-y-2 text-xs text-brand-textMuted">
                  <p>Role: <strong className="text-brand-textBright">{selectedEntity.data.role}</strong></p>
                  <p>Department: <strong className="text-brand-textBright">{selectedEntity.data.department}</strong></p>
                  <p>Current Zone: <strong className="text-brand-teal">{selectedEntity.data.currentZone}</strong></p>
                  <p>Location Coordinates: <span className="font-mono">X:{Math.round(selectedEntity.data.location.x)} Y:{Math.round(selectedEntity.data.location.y)}</span></p>
                  <p>Phone: <span className="font-mono">{selectedEntity.data.phone}</span></p>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <Map className="h-10 w-10 text-brand-textMuted mb-2 opacity-55" />
            <h5 className="text-xs font-bold text-brand-textBright uppercase">Telemetry Inspector</h5>
            <p className="text-[10px] text-brand-textMuted mt-1">Click on any machine, worker node or sensor on the blueprint map to load real-time inspect panel.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default PlantLayout;
