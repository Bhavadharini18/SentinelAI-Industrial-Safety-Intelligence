import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, KeyRound, Mail, User, AlertCircle, Shield } from 'lucide-react';

const Login = () => {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@sentinel.ai');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState('Worker');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    let res;
    if (isRegistering) {
      res = await register(name, email, password, role);
    } else {
      res = await login(email, password);
    }
    
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error);
    }
  };

  const loadRoleDemo = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
    setIsRegistering(false);
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    if (!isRegistering) {
      setName('');
      setEmail('');
      setPassword('');
      setRole('Worker');
    } else {
      setEmail('admin@sentinel.ai');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-brand-darkest flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Visual background grid / overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

      <div className="w-full max-w-md bg-brand-darker border border-brand-border p-8 rounded-2xl shadow-2xl relative z-10">
        
        {/* Logo and Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-brand-dark border border-brand-teal mb-4 pulse-teal">
            <ShieldAlert className="h-10 w-10 text-brand-teal" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-textBright">SentinelAI</h2>
          <p className="text-sm text-brand-textMuted mt-1">Industrial Safety Intelligence Command Center</p>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="mb-6 bg-brand-red bg-opacity-10 border border-brand-red border-opacity-40 text-brand-red p-3.5 rounded-xl text-sm flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-textMuted mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-textMuted">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-brand-darkest border border-brand-border rounded-xl text-brand-textBright placeholder-brand-textMuted focus:border-brand-teal focus:outline-none transition-colors text-sm"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-textMuted mb-2">Security ID / Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-textMuted">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-brand-darkest border border-brand-border rounded-xl text-brand-textBright placeholder-brand-textMuted focus:border-brand-teal focus:outline-none transition-colors text-sm"
                placeholder="operator@sentinel.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-textMuted mb-2">Access Key / Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-textMuted">
                <KeyRound className="h-5 w-5" />
              </span>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-brand-darkest border border-brand-border rounded-xl text-brand-textBright placeholder-brand-textMuted focus:border-brand-teal focus:outline-none transition-colors text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-textMuted mb-2">Operational Role</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-brand-textMuted">
                  <Shield className="h-5 w-5" />
                </span>
                <select
                  className="w-full pl-10 pr-4 py-3 bg-brand-darkest border border-brand-border rounded-xl text-brand-textBright focus:border-brand-teal focus:outline-none transition-colors text-sm appearance-none"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="Worker">Worker</option>
                  <option value="Safety Officer">Safety Officer</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-brand-teal hover:bg-opacity-90 active:scale-[0.98] text-brand-textBright font-semibold rounded-xl text-sm transition-all duration-150 flex items-center justify-center space-x-2 shadow-glow-teal border border-brand-teal border-opacity-35"
          >
            {isSubmitting ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              <span>{isRegistering ? 'REGISTER OPERATOR' : 'ESTABLISH SECURE ACCESS'}</span>
            )}
          </button>
        </form>

        {/* Toggle Mode Link */}
        <div className="mt-4 text-center">
          <button 
            onClick={toggleMode}
            className="text-xs text-brand-teal hover:underline font-semibold"
          >
            {isRegistering ? 'Already have credentials? Log In' : 'Need new operator credentials? Sign Up'}
          </button>
        </div>

        {/* Hackathon Fast Seeder Shortcuts */}
        {!isRegistering && (
          <div className="mt-6 pt-6 border-t border-brand-border">
            <p className="text-[10px] uppercase tracking-wider text-brand-textMuted text-center font-bold mb-3">Hackathon Quick-Login Profiles</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => loadRoleDemo('admin@sentinel.ai')}
                className="py-1 px-2 text-[10px] bg-brand-dark text-brand-textBright border border-brand-border rounded hover:border-brand-teal transition-all truncate"
                title="Elena Rostova (Admin)"
              >
                Admin
              </button>
              <button
                onClick={() => loadRoleDemo('officer@sentinel.ai')}
                className="py-1 px-2 text-[10px] bg-brand-dark text-brand-textBright border border-brand-border rounded hover:border-brand-teal transition-all truncate"
                title="Marcus Vance (Safety Officer)"
              >
                Safety Officer
              </button>
              <button
                onClick={() => loadRoleDemo('supervisor@sentinel.ai')}
                className="py-1 px-2 text-[10px] bg-brand-dark text-brand-textBright border border-brand-border rounded hover:border-brand-teal transition-all truncate"
                title="Karthik Rao (Supervisor)"
              >
                Supervisor
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
