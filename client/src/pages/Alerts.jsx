import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { socket } from '../services/websocket';
import { 
  Bell, AlertTriangle, ShieldCheck, CheckCircle2, 
  MapPin, Clock, ShieldAlert, Cpu, HardHat 
} from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');

  useEffect(() => {
    fetchAlerts();

    socket.on('new_alert', (newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
    });

    socket.on('alert_updated', (updated) => {
      setAlerts(prev => prev.map(a => a._id === updated._id ? updated : a));
    });

    return () => {
      socket.off('new_alert');
      socket.off('alert_updated');
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('/alerts');
      if (res.data.success) {
        setAlerts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load safety alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      const res = await axios.put(`/alerts/${id}/acknowledge`);
      if (res.data.success) {
        setAlerts(prev => prev.map(a => a._id === id ? res.data.data : a));
      }
    } catch (err) {
      console.error('Acknowledge alert failed:', err);
    }
  };

  const handleResolve = async (id) => {
    try {
      const res = await axios.put(`/alerts/${id}/resolve`);
      if (res.data.success) {
        setAlerts(prev => prev.map(a => a._id === id ? res.data.data : a));
      }
    } catch (err) {
      console.error('Resolve alert failed:', err);
    }
  };

  // Filter list
  const filteredAlerts = alerts.filter(alert => {
    const matchesStatus = statusFilter === 'All' || alert.status === statusFilter;
    const matchesSeverity = severityFilter === 'All' || alert.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return <span className="bg-brand-red bg-opacity-20 border border-brand-red text-brand-red text-[9px] font-bold px-2 py-0.5 rounded tracking-wide animate-pulse">CRITICAL</span>;
      case 'High':
        return <span className="bg-brand-orange bg-opacity-10 border border-brand-orange text-brand-orange text-[9px] font-bold px-2 py-0.5 rounded tracking-wide">HIGH</span>;
      case 'Medium':
        return <span className="bg-brand-amber bg-opacity-10 border border-brand-amber text-brand-amber text-[9px] font-bold px-2 py-0.5 rounded tracking-wide">MEDIUM</span>;
      default:
        return <span className="bg-brand-dark border border-brand-border text-brand-textMuted text-[9px] font-bold px-2 py-0.5 rounded tracking-wide">LOW</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
          <p className="text-brand-textMuted text-xs font-mono">LOADING_SAFETY_ALARM_MATRIX...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Filters header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-4">
        <div>
          <h3 className="text-sm font-bold text-brand-textBright">Active Threats Registry</h3>
          <p className="text-xs text-brand-textMuted font-mono">INCIDENT_ALERT_LOGGING_GATEWAY</p>
        </div>

        {/* Multi-tier Filter controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          
          {/* Status selector */}
          <div className="flex items-center space-x-1.5 bg-brand-darker px-2 py-1 rounded-lg border border-brand-border">
            <span className="text-[10px] uppercase font-bold text-brand-textMuted font-mono">Status:</span>
            {['All', 'Active', 'Acknowledged', 'Resolved'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  statusFilter === st 
                    ? 'bg-brand-teal text-brand-textBright' 
                    : 'text-brand-textMuted hover:text-brand-textBright'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Severity selector */}
          <div className="flex items-center space-x-1.5 bg-brand-darker px-2 py-1 rounded-lg border border-brand-border">
            <span className="text-[10px] uppercase font-bold text-brand-textMuted font-mono">Severity:</span>
            {['All', 'Critical', 'High', 'Medium', 'Low'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  severityFilter === sev 
                    ? 'bg-brand-teal text-brand-textBright' 
                    : 'text-brand-textMuted hover:text-brand-textBright'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Alarm Log list */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-16 bg-brand-darker border border-brand-border rounded-xl text-brand-textMuted text-xs font-mono">
            NO_ACTIVE_ALARMS_MATCHING_CRITERIA
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div 
              key={alert._id} 
              className={`glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                alert.status === 'Active' && alert.severity === 'Critical' 
                  ? 'border-brand-red bg-brand-red bg-opacity-[0.03] shadow-glow-red' 
                  : ''
              }`}
            >
              
              {/* Alert Meta Description */}
              <div className="flex items-start space-x-4 flex-1 min-w-0">
                <div className={`p-3 rounded-xl border ${
                  alert.status === 'Resolved' 
                    ? 'bg-brand-teal bg-opacity-5 border-brand-teal border-opacity-25 text-brand-teal' 
                    : alert.severity === 'Critical' 
                    ? 'bg-brand-red bg-opacity-20 border-brand-red text-brand-red pulse-red' 
                    : 'bg-brand-dark border-brand-border text-brand-amber'
                }`}>
                  {alert.status === 'Resolved' ? (
                    <ShieldCheck className="h-6 w-6" />
                  ) : alert.severity === 'Critical' ? (
                    <ShieldAlert className="h-6 w-6" />
                  ) : (
                    <AlertTriangle className="h-6 w-6" />
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {getSeverityBadge(alert.severity)}
                    <span className="text-sm font-extrabold text-brand-textBright truncate">{alert.title}</span>
                  </div>
                  <p className="text-xs text-brand-textMuted leading-relaxed max-w-2xl">{alert.description}</p>
                  
                  {alert.recommendations && (
                    <div className="bg-brand-darkest bg-opacity-65 border border-brand-border rounded px-3 py-1.5 text-[11px] text-brand-teal font-mono">
                      RECOMMENDED_ACTION: {alert.recommendations}
                    </div>
                  )}

                  {/* Footnotes */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-brand-textMuted font-mono pt-1">
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-brand-teal" />
                      <span>{alert.zone}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    </span>
                    {alert.sensor && (
                      <span className="flex items-center space-x-1">
                        <Cpu className="h-3.5 w-3.5 text-brand-teal" />
                        <span>Sensor: {alert.sensor.code} ({alert.sensor.name})</span>
                      </span>
                    )}
                    {alert.machine && (
                      <span className="flex items-center space-x-1">
                        <HardHat className="h-3.5 w-3.5" />
                        <span>Machine: {alert.machine.code}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status / Command controls */}
              <div className="flex md:flex-col gap-2 flex-shrink-0 w-full md:w-fit border-t md:border-t-0 border-brand-border pt-4 md:pt-0">
                {alert.status === 'Active' && (
                  <button
                    onClick={() => handleAcknowledge(alert._id)}
                    className="w-full md:w-32 py-2 bg-brand-dark hover:bg-brand-darker border border-brand-teal hover:border-opacity-100 text-brand-teal font-bold rounded-lg text-xs font-mono transition-all uppercase"
                  >
                    Acknowledge
                  </button>
                )}

                {alert.status !== 'Resolved' && (
                  <button
                    onClick={() => handleResolve(alert._id)}
                    className="w-full md:w-32 py-2 bg-brand-teal hover:bg-opacity-95 text-brand-textBright font-bold rounded-lg text-xs font-mono transition-all uppercase glow-teal border border-brand-teal border-opacity-35"
                  >
                    Resolve
                  </button>
                )}

                {alert.status === 'Resolved' && (
                  <div className="text-right space-y-1">
                    <span className="text-[10px] uppercase font-bold text-brand-teal font-mono flex items-center space-x-1 justify-end">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>RESOLVED</span>
                    </span>
                    {alert.resolvedBy && (
                      <span className="block text-[8px] text-brand-textMuted font-mono">
                        BY: {alert.resolvedBy.name}
                      </span>
                    )}
                    {alert.resolvedAt && (
                      <span className="block text-[8px] text-brand-textMuted font-mono">
                        AT: {new Date(alert.resolvedAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Alerts;
