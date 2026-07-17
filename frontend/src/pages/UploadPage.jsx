import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { analysisApi } from '../services/api';

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ job_title: '', company: '', job_description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith('.pdf')) { setError('Only PDF files are accepted.'); setFile(null); return; }
    if (selected.size > 10 * 1024 * 1024) { setError('File size must be under 10 MB.'); setFile(null); return; }
    setError(''); setFile(selected);
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a PDF resume.'); return; }
    if (!form.job_description.trim()) { setError('Job description is required.'); return; }
    setLoading(true); setError('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('job_title', form.job_title.trim());
    fd.append('company', form.company.trim());
    fd.append('job_description', form.job_description.trim());
    try {
      const { data } = await analysisApi.upload(fd);
      navigate(`/analysis/${data.id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-2">Resume Analysis</h2>
          <p className="text-gray-400 text-sm">Upload your resume (PDF) and paste a job description to get an ATS score, missing skills, resume suggestions, a tailored cover letter, and interview questions — all powered by AI.</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="glass-card p-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">Resume (PDF) <span className="text-red-400">*</span></label>
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-xl p-8 lg:p-12 text-center cursor-pointer hover:border-cyan-500/50 hover:bg-white/[0.02] transition-all duration-300">
              {file ? (
                <div>
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="text-cyan-400 font-medium">{file.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <p className="text-gray-400">Click to select a PDF file</p>
                  <p className="text-gray-600 text-xs mt-1">Max 10 MB</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
          </div>

          <div className="glass-card p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="job_title" className="block text-sm font-medium text-gray-300 mb-1.5">Job Title</label>
                <input id="job_title" name="job_title" type="text" value={form.job_title} onChange={handleChange} className="input-field" placeholder="e.g., Senior Software Engineer" />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1.5">Company</label>
                <input id="company" name="company" type="text" value={form.company} onChange={handleChange} className="input-field" placeholder="e.g., Google" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <label htmlFor="job_description" className="block text-sm font-medium text-gray-300 mb-1.5">Job Description <span className="text-red-400">*</span></label>
            <textarea id="job_description" name="job_description" rows={8} value={form.job_description} onChange={handleChange} className="input-field resize-y" placeholder="Paste the full job description here…" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full text-lg py-3.5">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Analysing with AI…
              </span>
            ) : 'Analyse Resume'}
          </button>
        </form>
      </motion.div>
    </Layout>
  );
}
