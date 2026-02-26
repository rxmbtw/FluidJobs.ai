import React, { useState, useEffect, useMemo } from 'react';
import { Download, Users } from 'lucide-react';
import { useDashboardHeader } from './NewDashboardContainer';
import { Candidate, InterviewStage } from './types';

/* ─── CSS keyframes injected once ─────────────────────────────────────────── */
const STYLES = `
  @keyframes slideUpFade {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cardFloat {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .funnel-layer {
    transition: filter 0.2s ease;
    cursor: default;
  }
  .funnel-layer:hover {
    filter: brightness(1.12);
  }
  .stat-card {
    transition: box-shadow 0.2s ease;
  }
  .stat-card:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  }
  .stage-detail-row {
    transition: border-color 0.2s ease;
  }
  .stage-detail-row:hover {
    border-color: #c7d2fe !important;
  }
`;

interface StageData {
  stage: string;
  stageLabel: string;
  appeared: number;
  selected: number;
  rejected: number;
  dropOff: number;
  avgDuration: number;
  avgScore: number;
}

/* ─── Pyramid layer colours: index 0 = Management (top/apex) ─────────────── */
const LAYER_CONFIGS = [
  { gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', glow: 'rgba(245,158,11,0.45)', label: 'amber' },
  { gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)', glow: 'rgba(99,102,241,0.45)', label: 'indigo' },
  { gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)', glow: 'rgba(59,130,246,0.45)', label: 'blue' },
  { gradient: 'linear-gradient(135deg,#334155,#1e293b)', glow: 'rgba(71,85,105,0.45)', label: 'slate' },
  { gradient: 'linear-gradient(135deg,#2563eb,#1d4ed8)', glow: 'rgba(37,99,235,0.45)', label: 'blue2' },
  { gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', glow: 'rgba(59,130,246,0.45)', label: 'blue3' },
];

const StageAnalytics: React.FC = () => {
  const { setHeaderActions } = useDashboardHeader();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  /* ── helpers ── */
  const getPositionFromEmail = (email: string | null | undefined) => {
    const positions = ['Software Engineer', 'Senior Software Engineer', 'Frontend Developer',
      'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer'];
    if (!email) return positions[0];
    return positions[email.length % positions.length];
  };

  const getRandomStage = () => {
    const stages = [
      InterviewStage.SCREENING, InterviewStage.CV_SHORTLISTED,
      InterviewStage.L1, InterviewStage.L2, InterviewStage.L3, InterviewStage.L4,
      InterviewStage.HR_ROUND, InterviewStage.MANAGEMENT_ROUND,
      InterviewStage.OFFER_EXTENDED, InterviewStage.JOINED, InterviewStage.REJECTED,
    ];
    return stages[Math.floor(Math.random() * stages.length)];
  };

  /* ── fetch ── */
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/candidates?page=1&limit=1000`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.data?.candidates?.length > 0) {
          const formatted = data.data.candidates.map((c: any) => ({
            id: c.candidate_id,
            name: c.full_name,
            email: c.email,
            phone: c.phone_number || '',
            jobTitle: getPositionFromEmail(c.email),
            department: 'Engineering',
            source: 'Database',
            currentStage: getRandomStage(),
            appliedDate: new Date(Date.now() - Math.random() * 30 * 86400000).toLocaleDateString('en-GB'),
            lastUpdateDate: new Date(Date.now() - Math.random() * 7 * 86400000).toLocaleDateString('en-GB'),
            experience: `${parseFloat(c.experience_years) || 0} Years`,
            location: c.location || 'Not specified',
            cvStatusRecruiter: Math.random() > 0.3 ? 'Shortlisted' as const : 'Pending' as const,
            cvStatusHM: Math.random() > 0.4 ? 'Shortlisted' as const : 'Pending' as const,
            interviews: {
              l1: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
              l2: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
              l3: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
              l4: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
              hr: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
              management: { interviewer: '', date: '', feedbackDate: '', status: 'Pending' as const },
            },
            ctc: { current: parseFloat(c.current_ctc) || 0, expected: parseFloat(c.expected_ctc) || 0, currency: 'INR' },
            noticePeriod: c.notice_period || 'Not specified',
            comments: [],
            resumeUrl: c.resume_link || '',
            applicationDate: new Date(Date.now() - Math.random() * 30 * 86400000).toLocaleDateString('en-GB'),
            gender: c.gender || 'Male',
            position: getPositionFromEmail(c.email),
            experienceYears: parseFloat(c.experience_years) || 0,
            currentlyEmployed: c.currently_employed || 'No',
            currentCompany: c.current_company || 'Not specified',
            currentSalary: c.current_ctc ? `₹${parseFloat(c.current_ctc).toLocaleString('en-IN')}` : 'Not specified',
            expectedSalary: c.expected_ctc ? `₹${parseFloat(c.expected_ctc).toLocaleString('en-IN')}` : 'Not specified',
            maritalStatus: c.marital_status || 'Not specified',
            resumeScore: c.resume_score || Math.floor(Math.random() * 40) + 60,
            skills: ['React', 'JavaScript', 'Node.js', 'Python'].slice(0, Math.floor(Math.random() * 4) + 1),
            isRestricted: Math.random() > 0.9,
            candidateJobStatuses: [],
          }));
          setCandidates(formatted);
        }
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCandidates(); }, []);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  useEffect(() => {
    setHeaderActions(
      <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border"
        style={{ background: '#fff', borderColor: '#e2e8f0', color: '#475569' }}>
        <Download className="w-3.5 h-3.5" /> Export Report
      </button>
    );
    return () => setHeaderActions(null);
  }, [setHeaderActions]);

  /* ── stage metrics ── */
  const stageMetrics = useMemo((): StageData[] => {
    if (!candidates.length) return [];
    const stageOrder = [
      InterviewStage.L1, InterviewStage.L2, InterviewStage.L3,
      InterviewStage.L4, InterviewStage.HR_ROUND, InterviewStage.MANAGEMENT_ROUND,
    ];
    const stageLabels: Record<string, string> = {
      [InterviewStage.L1]: 'L1 Tech',
      [InterviewStage.L2]: 'L2 Tech',
      [InterviewStage.L3]: 'L3 Tech',
      [InterviewStage.L4]: 'L4 Tech',
      [InterviewStage.HR_ROUND]: 'HR Round',
      [InterviewStage.MANAGEMENT_ROUND]: 'Management Round',
    };
    const stageCounts = candidates.reduce((acc, c) => {
      acc[c.currentStage] = (acc[c.currentStage] || 0) + 1; return acc;
    }, {} as Record<string, number>);

    return stageOrder.map((stage, index) => {
      const appeared = stageCounts[stage] || 0;
      const baseCount = Math.max(appeared, Math.floor(candidates.length * (0.8 - index * 0.13)));
      const selected = Math.floor(baseCount * (0.6 + Math.random() * 0.2));
      const rejected = Math.floor(baseCount * (0.2 + Math.random() * 0.1));
      const dropOff = baseCount - selected - rejected;
      return {
        stage,
        stageLabel: stageLabels[stage] || stage,
        appeared: baseCount,
        selected,
        rejected,
        dropOff,
        avgDuration: 3 + index,
        avgScore: parseFloat((3.5 + Math.random()).toFixed(1)),
      };
    });
  }, [candidates]);

  /* Reverse so index 0 = Management (top of pyramid visual) */
  const pyramidLayers = useMemo(() => [...stageMetrics].reverse(), [stageMetrics]);

  const summaryStats = useMemo(() => {
    if (!stageMetrics.length) return { total: 0, finalSelections: 0, conversionRate: 0, avgDays: 0 };
    const total = stageMetrics[0]?.appeared || 0;
    const finalSelections = stageMetrics[stageMetrics.length - 1]?.selected || 0;
    const conversionRate = total > 0 ? (finalSelections / total) * 100 : 0;
    const avgDays = stageMetrics.reduce((s, m) => s + m.avgDuration, 0);
    return { total, finalSelections, conversionRate: parseFloat(conversionRate.toFixed(1)), avgDays };
  }, [stageMetrics]);

  /* ── loading ── */
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          border: '3px solid rgba(99,102,241,0.2)',
          borderTopColor: '#6366f1',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── helpers for pyramid ── */
  const maxAppeared = pyramidLayers.length > 0 ? Math.max(...pyramidLayers.map(l => l.appeared)) : 1;
  /* width fraction for each layer: narrowest = top (Management), widest = bottom (L1) */
  const getLayerWidth = (appeared: number) => {
    const MIN = 18; const MAX = 96;
    return MIN + ((appeared / maxAppeared) * (MAX - MIN));
  };

  /* ─────────────────────────────── RENDER ──────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 48 }}>
      <style>{STYLES}</style>

      {/* ── Summary Cards ─────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {[
          {
            label: 'Candidates Started', value: summaryStats.total.toLocaleString(),
            grad: 'linear-gradient(135deg,#3b82f6,#2563eb)', delay: 0
          },
          {
            label: 'Final Selections', value: summaryStats.finalSelections.toLocaleString(),
            grad: 'linear-gradient(135deg,#6366f1,#4f46e5)', delay: 60
          },
          {
            label: 'Overall Conversion', value: `${summaryStats.conversionRate}%`,
            grad: 'linear-gradient(135deg,#2563eb,#1d4ed8)', delay: 120
          },
          {
            label: 'Days to Complete', value: summaryStats.avgDays,
            grad: 'linear-gradient(135deg,#475569,#334155)', delay: 180
          },
        ].map((card, i) => (
          <div key={i} className="stat-card" style={{
            background: card.grad, borderRadius: 16, padding: '22px 24px',
            color: '#fff',
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
            animation: mounted ? `cardFloat 0.45s ease ${card.delay}ms both` : 'none',
          }}>
            <p style={{ fontSize: 32, fontWeight: 800, lineHeight: 1, margin: '0 0 6px' }}>{card.value}</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* ── Pyramid Funnel ────────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        borderRadius: 20, padding: '32px 36px 36px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Interview Stage Conversion Funnel
            </h3>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0' }}>
              {candidates.length} candidates · {stageMetrics.length} stages
            </p>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#6366f1' }}>
            {summaryStats.conversionRate}% overall conversion
          </span>
        </div>

        {stageMetrics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Users style={{ width: 48, height: 48, color: '#cbd5e1', margin: '0 auto 12px' }} />
            <p style={{ color: '#64748b', fontSize: 15 }}>No interview data available</p>
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Data will appear as candidates progress through stages</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, width: '100%' }}>
            {pyramidLayers.map((data, visIdx) => {
              /* visIdx 0 = APEX (Management Round), last = BASE (L1 Tech) */
              const layerCount = pyramidLayers.length;
              const dataIdx = layerCount - 1 - visIdx; // 0=L1, last=Management in original stageMetrics order
              const cfg = LAYER_CONFIGS[dataIdx] || LAYER_CONFIGS[0];
              const widthPct = getLayerWidth(data.appeared);
              const selRate = data.appeared > 0 ? ((data.selected / data.appeared) * 100).toFixed(1) : '0.0';
              const isApex = visIdx === 0;        // Management Round
              const isBase = visIdx === layerCount - 1; // L1 Tech

              /* trapezoid: top narrower than bottom for each non-apex layer */
              const topExtra = isBase ? 0 : 3;
              const clipPath = isApex
                ? `polygon(${topExtra}% 0%, ${100 - topExtra}% 0%, 97% 100%, 3% 100%)`
                : `polygon(${topExtra}% 0%, ${100 - topExtra}% 0%, 100% 100%, 0% 100%)`;

              const animDelay = visIdx * 90 + 100; // apex first

              return (
                <div key={data.stage} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* row = label | bar | stats */}
                  <div style={{
                    display: 'flex', alignItems: 'center', width: '100%', gap: 16,
                    animation: mounted ? `slideUpFade 0.55s ease ${animDelay}ms both` : 'none',
                  }}>
                    {/* left label */}
                    <div style={{ width: 130, textAlign: 'right', flexShrink: 0 }}>
                      <p style={{
                        fontSize: 13, fontWeight: 800, margin: 0,
                        color: isApex ? '#b45309' : '#1e293b',
                        letterSpacing: isApex ? '0.02em' : 'normal',
                      }}>
                        {data.stageLabel}
                      </p>
                      <p style={{ fontSize: 10, color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>
                        Stage {dataIdx + 1}
                      </p>
                    </div>

                    {/* pyramid bar */}
                    <div style={{
                      flex: 1, display: 'flex', justifyContent: 'center',
                      paddingTop: isApex ? 0 : 0,
                    }}>
                      <div className="funnel-layer" style={{
                        width: `${widthPct}%`,
                        height: isApex ? 52 : 56,
                        background: cfg.gradient,
                        clipPath,
                        boxShadow: `0 4px 20px ${cfg.glow}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0 20px',
                        position: 'relative',
                        zIndex: layerCount - visIdx,
                        borderRadius: isApex ? '6px 6px 2px 2px' : (isBase ? '2px 2px 6px 6px' : '1px'),
                      }}>

                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)', zIndex: 1 }}>
                          {data.appeared.toLocaleString()} candidates
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.85)', zIndex: 1 }}>
                          {selRate}% pass
                        </span>
                      </div>
                    </div>

                    {/* right stats */}
                    <div style={{ width: 100, flexShrink: 0, textAlign: 'center' }}>
                      <p style={{ fontSize: 20, fontWeight: 800, margin: 0, color: isApex ? '#b45309' : '#0f172a' }}>
                        {data.selected.toLocaleString()}
                      </p>
                      <p style={{ fontSize: 10, color: '#64748b', margin: 0, fontWeight: 600 }}>Selected</p>

                    </div>
                  </div>

                  {/* connector between layers (not after base) */}
                  {!isBase && (
                    <div style={{
                      width: 2, height: 8, margin: '0 auto',
                      background: 'linear-gradient(to bottom,rgba(148,163,184,0.5),rgba(148,163,184,0.1))',
                      animation: mounted ? `slideUpFade 0.4s ease ${animDelay + 60}ms both` : 'none',
                    }} />
                  )}
                </div>
              );
            })}


          </div>
        )}

        {/* ── Stage Detail Row ──────────────────────────────────────── */}
        {stageMetrics.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ height: 1, flex: 1, background: '#e2e8f0' }} />
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em' }}>
                STAGE DETAILS
              </span>
              <div style={{ height: 1, flex: 1, background: '#e2e8f0' }} />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${stageMetrics.length}, 1fr)`,
              gap: 10,
            }}>
              {stageMetrics.map((data, idx) => {
                const cfg = LAYER_CONFIGS[idx] || LAYER_CONFIGS[0];
                const selRate = data.appeared > 0 ? ((data.selected / data.appeared) * 100).toFixed(0) : '0';
                return (
                  <div key={data.stage} className="stage-detail-row" style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderTop: `3px solid ${cfg.gradient.includes('#f59e0b') ? '#f59e0b' : cfg.gradient.includes('#6366f1') ? '#6366f1' : '#3b82f6'}`,
                    borderRadius: 12, padding: '14px 12px', textAlign: 'center',
                    animation: mounted ? `cardFloat 0.45s ease ${idx * 60 + 300}ms both` : 'none',
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#64748b', margin: '0 0 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {data.stageLabel}
                    </p>
                    <div style={{ height: 4, background: '#f1f5f9', borderRadius: 99, marginBottom: 10, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${selRate}%`,
                        background: cfg.gradient, borderRadius: 99,
                        transition: 'width 1s ease',
                      }} />
                    </div>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>{selRate}%</p>
                    <p style={{ fontSize: 10, color: '#94a3b8', margin: '2px 0 0' }}>pass rate</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StageAnalytics;