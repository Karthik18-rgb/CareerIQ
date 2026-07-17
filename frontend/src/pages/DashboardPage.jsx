import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { analysisApi } from '../services/api';
import Layout from '../components/Layout';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avgScore: '—', coverLetters: 0 });

  useEffect(() => {
    analysisApi
      .history(0, 100)
      .then(({ data }) => {
        const list = data.analyses || [];
        setRecentAnalyses(list.slice(0, 5));
        const total = list.length;
        const avg = total > 0 ? Math.round(list.reduce((s, a) => s + (a.ats_score || 0), 0) / total) : '—';
        const cl = list.filter((a) => a.cover_letter).length;
        setStats({ total, avgScore: avg, coverLetters: cl });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const quickActions = [
    { title: 'New Analysis', desc: 'Upload resume + job description', path: '/upload', color: 'from-cyan-500 to-blue-600' },
    { title: 'View History', desc: 'Browse your past analyses', path: '/history', color: 'from-blue-500 to-indigo-600' },
    { title: 'Edit Profile', desc: 'Update your account details', path: '/profile', color: 'from-indigo-500 to-purple-600' },
  ];

  const statCards = [
    { label: 'Total Analyses', value: stats.total, color: 'text-cyan-400' },
    { label: 'Avg ATS Score', value: stats.avgScore, color: 'text-blue-400' },
    { label: 'Cover Letters', value: stats.coverLetters, color: 'text-indigo-400' },
  ];

  return (
    <Layout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Welcome */}
        <motion.div variants={item} className="glass-card p-6 lg:p-8 bg-gradient-to-br from-white/[0.08] to-white/[0.02] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h2 className="text-2xl lg:text-3xl font-bold text-white">
              Welcome back, <span className="premium-gradient-text">{user?.full_name || user?.username || 'User'}</span>!
            </h2>
            <p className="text-gray-400 mt-2 max-w-xl">
              Upload a resume and job description to get AI-powered ATS scoring, missing skills analysis, cover letters, interview questions, and more.
            </p>
            <Link to="/upload" className="btn-primary inline-flex items-center gap-2 mt-6">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              New Analysis
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="glass-card p-5 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
              <p className={`text-3xl font-extrabold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((qa) => (
              <Link key={qa.path} to={qa.path} className="glass-card-hover p-5 group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${qa.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </div>
                <h4 className="text-white font-medium">{qa.title}</h4>
                <p className="text-gray-500 text-sm mt-0.5">{qa.desc}</p>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Analyses */}
        <motion.div variants={item} className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-white">Recent Analyses</h3>
            {recentAnalyses.length > 0 && (
              <Link to="/history" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">View all</Link>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16" />
              ))}
            </div>
          ) : recentAnalyses.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-gray-400">No analyses yet.</p>
              <Link to="/upload" className="text-cyan-400 hover:text-cyan-300 font-medium text-sm mt-1 inline-block">
                Upload your first resume
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAnalyses.map((a) => (
                <Link key={a.id} to={`/analysis/${a.id}`} className="block glass-card-hover p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium truncate">{a.job_title || 'Untitled'}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {a.company ? `${a.company} · ` : ''}{new Date(a.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 shrink-0">
                      <span className={`text-lg font-bold ${(a.ats_score || 0) >= 70 ? 'text-green-400' : (a.ats_score || 0) >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {a.ats_score != null ? `${Math.round(a.ats_score)}%` : '—'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </Layout>
  );
}
