import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Wrench, Activity, Trash2, Edit3, Save, Plus, 
  MapPin, CheckCircle, AlertTriangle, AlertCircle 
} from 'lucide-react';

const Machines = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    type: '',
    status: 'Operational',
    healthScore: 100,
    currentZone: 'Zone A'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const res = await axios.get('/machines');
      if (res.data.success) {
        setMachines(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load machinery:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'healthScore' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        // Update
        const res = await axios.put(`/machines/${editingId}`, form);
        if (res.data.success) {
          setMachines(prev => prev.map(m => m._id === editingId ? res.data.data : m));
          clearForm();
        }
      } else {
        // Create
        // Assign random map location coordinates
        const newForm = {
          ...form,
          location: {
            x: Math.floor(Math.random() * 80) + 10,
            y: Math.floor(Math.random() * 80) + 10
          }
        };
        const res = await axios.post('/machines', newForm);
        if (res.data.success) {
          setMachines(prev => [res.data.data, ...prev]);
          clearForm();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed. Verify machine code is unique.');
    }
  };

  const handleEditClick = (machine) => {
    setEditingId(machine._id);
    setForm({
      name: machine.name,
      code: machine.code,
      type: machine.type,
      status: machine.status,
      healthScore: machine.healthScore,
      currentZone: machine.currentZone || 'Zone A'
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this equipment from telemetry catalog?')) return;
    try {
      const res = await axios.delete(`/machines/${id}`);
      if (res.data.success) {
        setMachines(prev => prev.filter(m => m._id !== id));
      }
    } catch (err) {
      console.error('Delete machine failed:', err);
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      code: '',
      type: '',
      status: 'Operational',
      healthScore: 100,
      currentZone: 'Zone A'
    });
    setError('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Operational':
        return <span className="bg-brand-teal bg-opacity-10 border border-brand-teal border-opacity-35 text-brand-teal text-[10px] px-2 py-0.5 rounded font-mono font-bold">OPERATIONAL</span>;
      case 'Maintenance':
        return <span className="bg-brand-amber bg-opacity-10 border border-brand-amber border-opacity-35 text-brand-amber text-[10px] px-2 py-0.5 rounded font-mono font-bold">MAINTENANCE</span>;
      case 'Failing':
        return <span className="bg-brand-red bg-opacity-10 border border-brand-red border-opacity-35 text-brand-red text-[10px] px-2 py-0.5 rounded font-mono font-bold pulse-red">CRIT_FAIL</span>;
      default:
        return <span className="bg-brand-dark border border-brand-border text-brand-textMuted text-[10px] px-2 py-0.5 rounded font-mono font-bold">OFFLINE</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
          <p className="text-brand-textMuted text-xs font-mono">LOADING_MACHINERY_REGISTRY...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Machinery Cards Grid */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
        {machines.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-brand-textMuted text-xs font-mono">
            NO_MACHINERY_REGISTERED
          </div>
        ) : (
          machines.map((machine) => (
            <div key={machine._id} className="glass-card p-6 flex flex-col justify-between space-y-4 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-brand-darkest border border-brand-border rounded-xl text-brand-amber">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-textBright">{machine.name}</h4>
                    <p className="text-[10px] text-brand-textMuted font-mono uppercase">
                      {machine.code} • {machine.type}
                    </p>
                  </div>
                </div>
                {getStatusBadge(machine.status)}
              </div>

              {/* Specs & Health */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-2 bg-brand-darkest rounded border border-brand-border">
                  <span className="block text-[8px] text-brand-textMuted">HEALTH_VALUE</span>
                  <span className={`font-bold ${machine.healthScore >= 85 ? 'text-brand-teal' : machine.healthScore >= 60 ? 'text-brand-amber' : 'text-brand-red'}`}>
                    {machine.healthScore}%
                  </span>
                </div>
                <div className="p-2 bg-brand-darkest rounded border border-brand-border">
                  <span className="block text-[8px] text-brand-textMuted">ZONE_LOC</span>
                  <span className="font-bold text-brand-textBright flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-brand-teal" />
                    <span>{machine.currentZone}</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-brand-border pt-3.5 flex items-center justify-end space-x-2">
                <button
                  onClick={() => handleEditClick(machine)}
                  className="px-3 py-1.5 bg-brand-dark border border-brand-border hover:border-brand-teal hover:text-brand-teal text-brand-textMuted rounded text-xs font-semibold font-mono flex items-center space-x-1.5 transition-all"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>EDIT</span>
                </button>
                <button
                  onClick={() => handleDelete(machine._id)}
                  className="px-3 py-1.5 bg-brand-dark border border-brand-border hover:border-brand-red hover:text-brand-red text-brand-textMuted rounded text-xs font-semibold font-mono flex items-center space-x-1.5 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>RM</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Editor Panel */}
      <div className="glass-card p-6 h-fit">
        <div className="border-b border-brand-border pb-3 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-teal">
            {editingId ? 'Modify Equipment' : 'Catalog Equipment'}
          </h4>
          {editingId && (
            <button 
              onClick={clearForm}
              className="text-[10px] text-brand-textMuted hover:text-white uppercase font-bold"
            >
              Cancel
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-brand-red bg-opacity-10 border border-brand-red text-brand-red p-3 rounded-lg text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1.5">Machine name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Flare Vent Compressor"
              className="w-full bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright p-2.5 focus:outline-none focus:border-brand-teal"
              value={form.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1.5">Machine Code</label>
              <input
                type="text"
                name="code"
                required
                placeholder="MCH-FLR02"
                className="w-full bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright p-2.5 focus:outline-none focus:border-brand-teal"
                value={form.code}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1.5">Type / Class</label>
              <input
                type="text"
                name="type"
                required
                placeholder="Boiler / Compressor"
                className="w-full bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright p-2.5 focus:outline-none focus:border-brand-teal"
                value={form.type}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1.5">Floor Zone</label>
              <select
                name="currentZone"
                className="w-full bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright p-2.5 focus:outline-none focus:border-brand-teal"
                value={form.currentZone}
                onChange={handleInputChange}
              >
                <option value="Zone A">Zone A</option>
                <option value="Zone B">Zone B</option>
                <option value="Zone C">Zone C</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1.5">Status</label>
              <select
                name="status"
                className="w-full bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright p-2.5 focus:outline-none focus:border-brand-teal"
                value={form.status}
                onChange={handleInputChange}
              >
                <option value="Operational">Operational</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Failing">Failing</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1.5 flex justify-between">
              <span>Health Score Value</span>
              <span className="font-mono text-brand-teal">{form.healthScore}%</span>
            </label>
            <input
              type="range"
              name="healthScore"
              min="0"
              max="100"
              className="w-full bg-brand-darkest accent-brand-teal"
              value={form.healthScore}
              onChange={handleInputChange}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-brand-teal hover:bg-opacity-95 text-brand-textBright font-bold rounded-lg text-xs flex items-center justify-center space-x-2 transition-all mt-4 border border-brand-teal border-opacity-35 shadow-glow-teal"
          >
            <Save className="h-4 w-4" />
            <span>{editingId ? 'APPLY CONFIG CHANGES' : 'COMMIT CATALOG RECORD'}</span>
          </button>
        </form>
      </div>

    </div>
  );
};

export default Machines;
