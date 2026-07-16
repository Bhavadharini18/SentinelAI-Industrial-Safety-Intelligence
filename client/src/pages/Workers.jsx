import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Users, HardHat, Phone, Plus, Trash2, Edit3, 
  MapPin, CheckCircle, XCircle, Search, Save, AlertCircle 
} from 'lucide-react';

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State for Add / Edit
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    employeeId: '',
    department: '',
    role: '',
    phone: '',
    currentZone: 'Zone A',
    online: true,
    status: 'Active'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await axios.get('/workers');
      if (res.data.success) {
        setWorkers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch workers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (editingId) {
        // Edit worker
        const res = await axios.put(`/workers/${editingId}`, form);
        if (res.data.success) {
          setWorkers(prev => prev.map(w => w._id === editingId ? res.data.data : w));
          setEditingId(null);
          clearForm();
        }
      } else {
        // Create worker
        // Add random map coords
        const newForm = {
          ...form,
          location: {
            x: Math.floor(Math.random() * 80) + 10,
            y: Math.floor(Math.random() * 80) + 10
          }
        };
        const res = await axios.post('/workers', newForm);
        if (res.data.success) {
          setWorkers(prev => [res.data.data, ...prev]);
          clearForm();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed. Verify employee ID is unique.');
    }
  };

  const handleEditClick = (worker) => {
    setEditingId(worker._id);
    setForm({
      name: worker.name,
      employeeId: worker.employeeId,
      department: worker.department,
      role: worker.role,
      phone: worker.phone || '',
      currentZone: worker.currentZone || 'Zone A',
      online: worker.online,
      status: worker.status || 'Active'
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this worker from register?')) return;
    try {
      const res = await axios.delete(`/workers/${id}`);
      if (res.data.success) {
        setWorkers(prev => prev.filter(w => w._id !== id));
      }
    } catch (err) {
      console.error('Delete worker failed:', err);
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setForm({
      name: '',
      employeeId: '',
      department: '',
      role: '',
      phone: '',
      currentZone: 'Zone A',
      online: true,
      status: 'Active'
    });
    setError('');
  };

  // Filter list
  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
          <p className="text-brand-textMuted text-xs font-mono">RETRIEVING_WORKER_ROSTER...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Workers List Table */}
      <div className="lg:col-span-2 space-y-4">
        
        {/* Search header */}
        <div className="flex items-center justify-between gap-4 bg-brand-darker border border-brand-border p-4 rounded-xl">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-textMuted">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by name, ID, role..."
              className="w-full pl-10 pr-4 py-2 bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright placeholder-brand-textMuted focus:outline-none focus:border-brand-teal"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table/List view */}
        <div className="glass-card overflow-hidden">
          <table className="min-w-full divide-y divide-brand-border text-left">
            <thead className="bg-brand-darkest text-brand-textMuted font-mono text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Personnel</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-xs text-brand-textMuted">
              {filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 font-mono text-brand-textMuted">
                    NO_MATCHING_PERSONNEL_FOUND
                  </td>
                </tr>
              ) : (
                filteredWorkers.map(w => (
                  <tr key={w._id} className="hover:bg-brand-dark hover:bg-opacity-30 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg border ${
                          w.online ? 'bg-brand-teal bg-opacity-10 border-brand-teal text-brand-teal' : 'bg-brand-dark border-brand-border text-brand-textMuted'
                        }`}>
                          <HardHat className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-brand-textBright">{w.name}</p>
                          <p className="text-[10px] text-brand-textMuted font-mono uppercase">{w.employeeId} • {w.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5 font-mono text-[11px] text-brand-textBright">
                        <MapPin className="h-3.5 w-3.5 text-brand-teal" />
                        <span>{w.currentZone}</span>
                      </div>
                      <span className="text-[9px] text-brand-textMuted font-mono">Coords: X:{Math.round(w.location?.x || 50)} Y:{Math.round(w.location?.y || 50)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex w-fit items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          w.online ? 'bg-brand-teal bg-opacity-10 text-brand-teal' : 'bg-brand-dark text-brand-textMuted'
                        }`}>
                          <span>{w.online ? 'ONLINE' : 'OFFLINE'}</span>
                        </span>
                        <span className="text-[9px] font-mono">{w.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => handleEditClick(w)}
                        className="p-1.5 hover:text-brand-teal bg-brand-dark border border-brand-border hover:border-brand-teal rounded transition-all"
                        title="Edit Worker details"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(w._id)}
                        className="p-1.5 hover:text-brand-red bg-brand-dark border border-brand-border hover:border-brand-red rounded transition-all"
                        title="Remove worker"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Editor / Add Panel */}
      <div className="glass-card p-6 h-fit">
        <div className="border-b border-brand-border pb-3 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-teal">
            {editingId ? 'Modify Personnel' : 'Register Personnel'}
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

        <form onSubmit={handleAddSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. John Doe"
              className="w-full bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright p-2.5 focus:outline-none focus:border-brand-teal"
              value={form.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1.5">Employee ID</label>
              <input
                type="text"
                name="employeeId"
                required
                placeholder="EMP-005"
                className="w-full bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright p-2.5 focus:outline-none focus:border-brand-teal"
                value={form.employeeId}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1.5">Phone Contact</label>
              <input
                type="text"
                name="phone"
                placeholder="+1-555-xxxx"
                className="w-full bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright p-2.5 focus:outline-none focus:border-brand-teal"
                value={form.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1.5">Department</label>
              <input
                type="text"
                name="department"
                required
                placeholder="Refinement"
                className="w-full bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright p-2.5 focus:outline-none focus:border-brand-teal"
                value={form.department}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1.5">Job Role</label>
              <input
                type="text"
                name="role"
                required
                placeholder="Operator"
                className="w-full bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright p-2.5 focus:outline-none focus:border-brand-teal"
                value={form.role}
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
              <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1.5">Shift Status</label>
              <select
                name="status"
                className="w-full bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright p-2.5 focus:outline-none focus:border-brand-teal"
                value={form.status}
                onChange={handleInputChange}
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="online"
              name="online"
              className="h-4 w-4 bg-brand-darkest border-brand-border text-brand-teal rounded focus:ring-brand-teal focus:ring-offset-brand-darkest"
              checked={form.online}
              onChange={handleInputChange}
            />
            <label htmlFor="online" className="text-xs text-brand-textBright font-semibold cursor-pointer">
              Set online (Simulate geolocation telemetry)
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-brand-teal hover:bg-opacity-95 text-brand-textBright font-bold rounded-lg text-xs flex items-center justify-center space-x-2 transition-all mt-4 border border-brand-teal border-opacity-35 shadow-glow-teal"
          >
            <Save className="h-4 w-4" />
            <span>{editingId ? 'APPLY CHANGES' : 'COMMIT REGISTRATION'}</span>
          </button>
        </form>
      </div>

    </div>
  );
};

export default Workers;
