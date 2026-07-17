import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { analysisApi } from '../services/api';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const limit = 20;

  const fetch = (s) => {
    setLoading(true); setError('');
    analysisApi.history(s, limit)
      .then(({ data }) => { setAnalyses(data.analyses || []); setTotal(data.total || 0); })
      .catch(() => setError('Failed to load history.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(0); }, []);

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Analysis History</h2>
          <Link to="/upload" className="btn-primary text-sm">+ New Analysis</Link>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>}

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-20" />)}</div>
        ) : analyses.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <p className="text-gray-400">No analyses yet.</p>
            <Link to="/upload" className="text-cyan-400 hover:text-cyan-300 font-medium text-sm mt-2 inline-block">Upload your first resume</Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {analyses.map((a) => (
                <Link key={a.id} to={`/analysis/${a.id}`} className="glass-card-hover p-5 block">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{a.job_title || 'Untitled'}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {a.company ? `${a.company} · ` : ''}{a.resume_filename} · {new Date(a.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="ml-4 shrink-0 text-right">
                      <span className={`text-lg font-bold ${(a.ats_score || 0) >= 70 ? 'text-green-400' : (a.ats_score || 0) >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {a.ats_score != null ? `${Math.round(a.ats_score)}%` : '—'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500">Showing {skip + 1}–{Math.min(skip + limit, total)} of {total}</p>
              <div className="flex gap-2">
                <button onClick={() => { const n = Math.max(0, skip - limit); setSkip(n); fetch(n); }} disabled={skip === 0} className="btn-secondary text-sm disabled:opacity-30">Previous</button>
                <button onClick={() => { const n = skip + limit; setSkip(n); fetch(n); }} disabled={skip + limit >= total} className="btn-secondary text-sm disabled:opacity-30">Next</button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </Layout>
  );
}
