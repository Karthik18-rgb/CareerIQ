import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { analysisApi } from '../services/api';

function ScoreBar({ label, score, color }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm text-gray-300 mb-1">
        <span>{label}</span>
        <span className="font-medium">{Math.round(score)}%</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(score, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-2.5 rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function Section({ title, children, className = '' }) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function AnalysisResultPage() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    analysisApi.getById(id)
      .then(({ data }) => setAnalysis(data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load analysis.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center py-20">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30" />
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin" />
        </div>
      </div>
    </Layout>
  );

  if (error) return (
    <Layout><div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">{error}</div></Layout>
  );

  if (!analysis) return (
    <Layout><p className="text-gray-400">Analysis not found.</p></Layout>
  );

  const breakdown = analysis.ats_breakdown || {};
  const scoreColor = (analysis.ats_score || 0) >= 70 ? 'text-green-400' : (analysis.ats_score || 0) >= 40 ? 'text-yellow-400' : 'text-red-400';

  return (
    <Layout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{analysis.job_title || 'Untitled Analysis'}</h2>
            {analysis.company && <p className="text-gray-400 text-sm">{analysis.company}</p>}
          </div>
          <Link to="/upload" className="btn-primary text-sm">+ New Analysis</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-6">
            {/* ATS Score */}
            <Section>
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">ATS Score</p>
                <motion.p
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className={`text-5xl font-extrabold ${scoreColor}`}
                >
                  {analysis.ats_score != null ? Math.round(analysis.ats_score) : '—'}
                </motion.p>
                <p className="text-gray-500 text-sm mt-1">out of 100</p>
              </div>
            </Section>

            {/* Breakdown */}
            <Section title="Breakdown">
              {breakdown.keyword_match != null && <ScoreBar label="Keyword Match" score={breakdown.keyword_match} color="bg-cyan-500" />}
              {breakdown.skills_alignment != null && <ScoreBar label="Skills Alignment" score={breakdown.skills_alignment} color="bg-blue-500" />}
              {breakdown.experience_relevance != null && <ScoreBar label="Experience Relevance" score={breakdown.experience_relevance} color="bg-indigo-500" />}
              {breakdown.format_quality != null && <ScoreBar label="Format Quality" score={breakdown.format_quality} color="bg-purple-500" />}
            </Section>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Missing Skills */}
            {analysis.missing_skills?.length > 0 && (
              <Section title="Missing Skills">
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_skills.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg text-sm">{s}</span>
                  ))}
                </div>
              </Section>
            )}

            {/* Resume Suggestions */}
            {analysis.resume_suggestions?.length > 0 && (
              <Section title="Resume Improvement Suggestions">
                <ul className="space-y-3">
                  {analysis.resume_suggestions.map((s, i) => (
                    <li key={i} className="flex gap-3 text-gray-300 text-sm">
                      <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</span>
                      <span className="pt-0.5">{s}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Strengths */}
            {breakdown.strengths?.length > 0 && (
              <Section title="Strengths">
                <ul className="space-y-2">
                  {breakdown.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-green-300 text-sm">
                      <span>✅</span><span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Keyword Suggestions */}
            {breakdown.keyword_suggestions?.length > 0 && (
              <Section title="Keyword Suggestions">
                <div className="flex flex-wrap gap-2">
                  {breakdown.keyword_suggestions.map((k, i) => (
                    <span key={i} className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-lg text-sm">{k}</span>
                  ))}
                </div>
              </Section>
            )}

            {/* Cover Letter */}
            {analysis.cover_letter && (
              <Section title="Cover Letter">
                <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{analysis.cover_letter}</div>
                <button onClick={() => navigator.clipboard.writeText(analysis.cover_letter)} className="btn-secondary mt-4 text-sm">📋 Copy to Clipboard</button>
              </Section>
            )}

            {/* Career Suggestions */}
            {analysis.career_suggestions?.length > 0 && (
              <Section title="Career Suggestions">
                <ul className="space-y-2">
                  {analysis.career_suggestions.map((s, i) => (
                    <li key={i} className="flex gap-2 text-gray-300 text-sm"><span className="text-indigo-400">•</span><span>{s}</span></li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Learning Roadmap */}
            {analysis.learning_roadmap?.length > 0 && (
              <Section title="Learning Roadmap">
                <ul className="space-y-2">
                  {analysis.learning_roadmap.map((s, i) => (
                    <li key={i} className="flex gap-2 text-gray-300 text-sm"><span className="text-cyan-400 font-medium">{i + 1}.</span><span>{s}</span></li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Interview Questions */}
            {analysis.interview_questions?.length > 0 && (
              <Section title="Interview Questions">
                <ol className="space-y-3">
                  {analysis.interview_questions.map((q, i) => (
                    <li key={i} className="flex gap-3 text-gray-300 text-sm">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</span>
                      <span className="pt-0.5">{q}</span>
                    </li>
                  ))}
                </ol>
              </Section>
            )}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
