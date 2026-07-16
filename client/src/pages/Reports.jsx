import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FileText, Download, Plus, Calendar, ShieldCheck, 
  AlertOctagon, CheckSquare, Save, AlertCircle 
} from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'Daily Shift',
    dateStart: '',
    dateEnd: '',
    summary: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get('/reports');
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load safety reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await axios.post('/reports', form);
      if (res.data.success) {
        setReports(prev => [res.data.data, ...prev]);
        setShowForm(false);
        setForm({
          title: '',
          type: 'Daily Shift',
          dateStart: '',
          dateEnd: '',
          summary: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = (id, title) => {
    // Open a new tab or trigger direct download
    const url = `http://localhost:5000/api/reports/${id}/export`;
    // Create an anchor element and click it programmatically
    const link = document.createElement('a');
    link.href = url;
    
    // Inject auth token if available, but since we are using headers, we can fetch it via axios and generate blob
    // This is much safer as it respects Authorization headers!
    axios.get(`/reports/${id}/export`, { responseType: 'blob' })
      .then(res => {
        const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
        link.href = blobUrl;
        link.setAttribute('download', `sentinel_report_${title.replace(/\s+/g, '_').toLowerCase()}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(err => console.error('Export failed:', err));
  };

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
          <p className="text-brand-textMuted text-xs font-mono">LOADING_SAFETY_ARCHIVE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Reports List Table */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-brand-textBright">Operational Audits Catalog</h3>
            <p className="text-xs text-brand-textMuted">Generated system audits containing safety score metrics and live logs</p>
          </div>
          
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="py-2 px-3 bg-brand-teal hover:bg-opacity-95 text-brand-textBright font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-all glow-teal border border-brand-teal border-opacity-35"
            >
              <Plus className="h-4 w-4" />
              <span>GENERATE AUDIT</span>
            </button>
          )}
        </div>

        {/* List Grid */}
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-16 bg-brand-darker border border-brand-border rounded-xl text-brand-textMuted text-xs font-mono">
              NO_AUDIT_REPORTS_GENERATED
            </div>
          ) : (
            reports.map(report => (
              <div key={report._id} className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* Meta Description */}
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                  <div className="p-3 bg-brand-darkest border border-brand-border rounded-xl text-brand-teal">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="bg-brand-dark border border-brand-border text-brand-teal text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase">
                        {report.type}
                      </span>
                      <h4 className="text-sm font-bold text-brand-textBright truncate">{report.title}</h4>
                    </div>
                    <p className="text-xs text-brand-textMuted leading-relaxed max-w-xl">{report.summary}</p>
                    
                    {/* Calculated index indicator */}
                    <div className="flex items-center space-x-4 text-[10px] text-brand-textMuted font-mono pt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      </span>
                      <span>GEN_BY: {report.generatedBy?.name || 'Operator'}</span>
                      {report.data?.safetyScore !== undefined && (
                        <span className={`font-bold ${report.data.safetyScore >= 80 ? 'text-brand-teal' : 'text-brand-orange'}`}>
                          SAFETY_INDEX: {report.data.safetyScore}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Export controls */}
                <button
                  onClick={() => handleExport(report._id, report.title)}
                  className="px-3.5 py-2 bg-brand-dark hover:bg-brand-darker border border-brand-border hover:border-brand-teal hover:text-brand-teal text-brand-textBright rounded-lg text-xs font-semibold font-mono flex items-center space-x-2 transition-all"
                  title="Export report to JSON"
                >
                  <Download className="h-4 w-4" />
                  <span>EXPORT_JSON</span>
                </button>

              </div>
            ))
          )}
        </div>

      </div>

      {/* Generator Form */}
      {showForm ? (
        <div className="glass-card p-6 h-fit">
          <div className="border-b border-brand-border pb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-teal">Assemble Safety Audit</h4>
            <button 
              onClick={() => setShowForm(false)}
              className="text-[10px] text-brand-textMuted hover:text-white uppercase font-bold"
            >
              Close
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-brand-red bg-opacity-10 border border-brand-red text-brand-red p-3 rounded-lg text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1.5">Audit Document Title</label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Q3 Plant A Maintenance Review"
                className="w-full bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright p-2.5 focus:outline-none focus:border-brand-teal"
                value={form.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1.5">Audit Type</label>
                <select
                  name="type"
                  className="w-full bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright p-2.5 focus:outline-none focus:border-brand-teal"
                  value={form.type}
                  onChange={handleInputChange}
                >
                  <option value="Daily Shift">Daily Shift</option>
                  <option value="Weekly Audit">Weekly Audit</option>
                  <option value="Incident Summary">Incident Summary</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1.5">Date Span End</label>
                <input
                  type="date"
                  name="dateEnd"
                  className="w-full bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright p-2 px-2.5 focus:outline-none focus:border-brand-teal"
                  value={form.dateEnd}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-brand-textMuted uppercase mb-1.5">Optional Custom Remarks</label>
              <textarea
                name="summary"
                rows="3"
                placeholder="Remarks regarding exhaust fans calibration, valve testing, etc."
                className="w-full bg-brand-darkest border border-brand-border rounded-lg text-xs text-brand-textBright p-2.5 focus:outline-none focus:border-brand-teal resize-none"
                value={form.summary}
                onChange={handleInputChange}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-brand-teal hover:bg-opacity-95 text-brand-textBright font-bold rounded-lg text-xs flex items-center justify-center space-x-2 transition-all mt-4 border border-brand-teal border-opacity-35 shadow-glow-teal"
            >
              {isSubmitting ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>COMPILE AUDIT METRICS</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="glass-card p-6 h-fit text-center flex flex-col items-center justify-center py-12">
          <FileText className="h-10 w-10 text-brand-textMuted mb-2 opacity-50" />
          <h5 className="text-xs font-bold text-brand-textBright uppercase">Digital Archives</h5>
          <p className="text-[10px] text-brand-textMuted mt-1 mb-4 max-w-xs">
            Generate compiled snapshots of all sensor values, machine records, and unresolved safety alarms to export as offline JSON records.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="py-2 px-4 bg-brand-teal hover:bg-opacity-95 text-brand-textBright font-bold rounded-lg text-xs transition-all glow-teal border border-brand-teal border-opacity-35"
          >
            COMPILE NEW AUDIT
          </button>
        </div>
      )}

    </div>
  );
};

export default Reports;
