import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || '', username: user?.username || '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage({ type: '', text: '' });
    try {
      await authApi.updateProfile({ full_name: form.full_name.trim() || null, username: form.username.trim() || null });
      window.location.reload();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile.' });
    } finally { setSaving(false); }
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-white">Profile</h2>

        {/* User Info */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full premium-gradient flex items-center justify-center text-2xl font-bold text-white">
              {(user?.full_name || user?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{user?.full_name || user?.username || 'User'}</h3>
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Username</p>
              <p className="text-white font-medium mt-1">{user?.username || '—'}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Member Since</p>
              <p className="text-white font-medium mt-1">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Edit Profile</h3>
          {message.text && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${message.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-300' : 'bg-green-500/10 border border-green-500/20 text-green-300'}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <input name="full_name" type="text" value={form.full_name} onChange={handleChange} className="input-field" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
              <input name="username" type="text" value={form.username} onChange={handleChange} className="input-field" placeholder="username" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      </motion.div>
    </Layout>
  );
}
