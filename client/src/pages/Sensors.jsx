import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { socket } from '../services/websocket';
import { Cpu, Thermometer, Gauge, Wind, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

const Sensors = () => {
  const [sensors, setSensors] = useState([]);
  const [selectedZone, setSelectedZone] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSensors();

    socket.on('sensor_updates', (data) => {
      // If we filtered by zone, we still receive all sensors, but we display filtered ones in render
      setSensors(data);
    });

    return () => {
      socket.off('sensor_updates');
    };
  }, []);

  const fetchSensors = async () => {
    try {
      const res = await axios.get('/sensors');
      if (res.data.success) {
        setSensors(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load sensors:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSensorIcon = (type) => {
    switch (type) {
      case 'Temperature': return <Thermometer className="h-6 w-6 text-brand-orange" />;
      case 'Pressure': return <Gauge className="h-6 w-6 text-blue-400" />;
      case 'Gas': return <Wind className="h-6 w-6 text-brand-teal" />;
      case 'Smoke': return <AlertCircle className="h-6 w-6 text-brand-red" />;
      default: return <Cpu className="h-6 w-6 text-brand-textMuted" />;
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Active') return <span className="bg-brand-teal bg-opacity-10 border border-brand-teal border-opacity-35 text-brand-teal text-[10px] px-2 py-0.5 rounded font-mono font-bold">ONLINE</span>;
    return <span className="bg-brand-dark border border-brand-border text-brand-textMuted text-[10px] px-2 py-0.5 rounded font-mono font-bold">OFFLINE</span>;
  };

  // Filtered sensors
  const displaySensors = selectedZone === 'All' 
    ? sensors 
    : sensors.filter(s => s.currentZone === selectedZone);

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
          <p className="text-brand-textMuted text-xs font-mono">LOADING_TELEMETRY_GATES...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Zone Filters */}
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div>
          <h3 className="text-sm font-bold text-brand-textBright">Live Sensors Stream</h3>
          <p className="text-xs text-brand-textMuted">Individual telemetry nodes operating within industrial thresholds</p>
        </div>

        <div className="flex items-center space-x-2 bg-brand-darker p-1 rounded-lg border border-brand-border text-xs">
          {['All', 'Zone A', 'Zone B', 'Zone C'].map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1.5 rounded transition-all font-semibold ${
                selectedZone === zone 
                  ? 'bg-brand-teal text-brand-textBright' 
                  : 'text-brand-textMuted hover:text-brand-textBright'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displaySensors.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-brand-textMuted text-xs font-mono">
            NO_ACTIVE_SENSORS_IN_SELECTED_ZONE
          </div>
        ) : (
          displaySensors.map((sensor) => {
            // Chart data preparation
            const chartData = sensor.history?.map((pt, idx) => ({
              index: idx,
              value: pt.value,
              time: new Date(pt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            })) || [];

            return (
              <div key={sensor._id} className="glass-card p-6 flex flex-col justify-between space-y-6">
                
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-brand-darkest border border-brand-border rounded-xl">
                      {getSensorIcon(sensor.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-brand-textBright">{sensor.name}</h4>
                      <p className="text-[10px] text-brand-textMuted font-mono uppercase">
                        {sensor.code} • {sensor.currentZone}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(sensor.status)}
                </div>

                {/* Main Gauge Telemetry */}
                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="col-span-1 space-y-1">
                    <span className="block text-[10px] font-bold text-brand-textMuted uppercase tracking-wider">Live Value</span>
                    <span className="text-3xl font-extrabold text-brand-textBright font-mono">
                      {sensor.currentValue}
                    </span>
                    <span className="text-xs text-brand-teal font-semibold font-mono block">
                      {sensor.unit}
                    </span>
                  </div>

                  {/* Sparkline line-chart */}
                  <div className="col-span-2 h-16 bg-brand-darkest bg-opacity-40 rounded-lg border border-brand-border p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={
                            sensor.type === 'Gas' && sensor.currentValue >= 50 ? '#DC2626' :
                            sensor.type === 'Temperature' && sensor.currentValue >= 70 ? '#EA580C' :
                            '#0D9488'
                          } 
                          strokeWidth={1.8} 
                          dot={false} 
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0A0E17', borderColor: '#1F2937', fontSize: 10 }}
                          labelStyle={{ display: 'none' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Calibration Details Footer */}
                <div className="border-t border-brand-border pt-3.5 flex items-center justify-between text-[10px] text-brand-textMuted font-mono">
                  <span>THRESHOLD_OK: NORMAL_BOUNDS</span>
                  <span>LAST_GATEWAY_POLL: {new Date(sensor.lastUpdated).toLocaleTimeString()}</span>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default Sensors;
