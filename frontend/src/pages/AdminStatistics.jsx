import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import AnimatedCounter from '../components/AnimatedCounter';
import { API_BASE_URL } from '../config/api';
import {
    Inbox, LoaderCircle, CheckCircle2, RotateCcw,
    BarChart3, TrendingUp, RefreshCw
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

/* ─── Stat Card ──────────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, accentColor, accentBg, sub, subIcon: SubIcon, delay = 0, bottomBorder }) => (
    <div
        style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: '24px',
            borderRadius: '18px',
            border: '1px solid rgba(255,255,255,0.08)',
            borderBottom: bottomBorder ? `3px solid ${accentColor}` : undefined,
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
            cursor: 'default',
            animation: `statsCardEnter 0.5s cubic-bezier(0.4,0,0.2,1) ${delay}s both`,
            fontFamily: "'Poppins','Inter',sans-serif",
        }}
        onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = `0 12px 36px ${accentColor}33`;
        }}
        onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)';
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
                <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    {label}
                </p>
                <h3 style={{ fontSize: '2.6rem', fontWeight: '800', lineHeight: '1', marginTop: '8px', color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                    <AnimatedCounter end={value} />
                </h3>
            </div>
            <div style={{
                width: '46px', height: '46px', borderRadius: '13px',
                background: accentBg, color: accentColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 12px ${accentColor}40`,
            }}>
                <Icon size={22} />
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.83rem', fontWeight: '600', color: accentColor }}>
            {SubIcon && <SubIcon size={13} />}
            {sub}
        </div>
    </div>
);

/* ─── Main Page ──────────────────────────────────────────────── */
const AdminStatistics = () => {
    const { token } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchAllComplaints = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/complaints`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setComplaints(data.data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchAllComplaints();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const stats = {
        new: complaints.filter(c => c.status === 'New').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length,
        reopened: complaints.filter(c => c.status === 'Reopened').length,
    };
    const total = complaints.length;
    const resolutionRate = total > 0 ? Math.round((stats.resolved / total) * 100) : 0;

    /* ── Bar chart ── */
    const barData = {
        labels: ['New', 'In Progress', 'Resolved', 'Reopened'],
        datasets: [{
            label: 'Complaints by Status',
            data: [stats.new, stats.inProgress, stats.resolved, stats.reopened],
            backgroundColor: [
                'rgba(99,102,241,0.8)',
                'rgba(245,158,11,0.8)',
                'rgba(16,185,129,0.8)',
                'rgba(239,68,68,0.8)',
            ],
            borderRadius: 8,
            borderWidth: 0,
        }],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#94a3b8', font: { family: 'Poppins', size: 12 } }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1, color: '#64748b', font: { family: 'Poppins' } },
                grid: { color: 'rgba(255,255,255,0.06)' },
            },
            x: {
                ticks: { color: '#64748b', font: { family: 'Poppins' } },
                grid: { display: false },
            },
        },
    };

    /* ── Doughnut chart ── */
    const doughnutData = {
        labels: ['New', 'In Progress', 'Resolved', 'Reopened'],
        datasets: [{
            data: [stats.new, stats.inProgress, stats.resolved, stats.reopened],
            backgroundColor: [
                'rgba(99,102,241,0.85)',
                'rgba(245,158,11,0.85)',
                'rgba(16,185,129,0.85)',
                'rgba(239,68,68,0.85)',
            ],
            borderWidth: 0,
            hoverOffset: 8,
        }],
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#94a3b8', font: { family: 'Poppins', size: 12 }, padding: 16 }
            },
        },
    };

    return (
        <DashboardLayout>
            {/* ── Page Header ── */}
            <div style={{ marginBottom: '32px', animation: 'statsCardEnter 0.45s ease both', fontFamily: "'Poppins','Inter',sans-serif" }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-0.5px',
                        }}>
                            Overall Statistics
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.92rem' }}>
                            Live overview of all complaint activity across the university.
                        </p>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={fetchAllComplaints}
                        disabled={loading}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px',
                            borderRadius: '12px',
                            border: '1.5px solid rgba(99,102,241,0.3)',
                            background: 'rgba(99,102,241,0.08)',
                            color: '#818cf8',
                            cursor: loading ? 'wait' : 'pointer',
                            fontFamily: "'Poppins','Inter',sans-serif",
                            fontWeight: '600',
                            fontSize: '0.88rem',
                            transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(99,102,241,0.18)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
                {lastUpdated && (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '8px', opacity: 0.7 }}>
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </p>
                )}
            </div>

            {/* ── Stat Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                <StatCard
                    label="New Complaints" value={stats.new}
                    icon={Inbox}
                    accentColor="#6366f1" accentBg="rgba(99,102,241,0.15)"
                    sub="Pending review"
                    subIcon={() => <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', animation: 'badge-pulse 2s ease infinite' }} />}
                    delay={0.05}
                />
                <StatCard
                    label="In Progress" value={stats.inProgress}
                    icon={LoaderCircle}
                    accentColor="#f59e0b" accentBg="rgba(245,158,11,0.15)"
                    sub="Being handled" subIcon={RotateCcw}
                    delay={0.1}
                />
                <StatCard
                    label="Resolved" value={stats.resolved}
                    icon={CheckCircle2}
                    accentColor="#10b981" accentBg="rgba(16,185,129,0.15)"
                    sub="Completed" subIcon={CheckCircle2}
                    bottomBorder
                    delay={0.15}
                />
                <StatCard
                    label="Reopened" value={stats.reopened}
                    icon={RotateCcw}
                    accentColor="#ef4444" accentBg="rgba(239,68,68,0.15)"
                    sub="Needs attention"
                    subIcon={() => <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>!</span>}
                    delay={0.2}
                />
            </div>

            {/* ── Charts Row ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>

                {/* Bar Chart */}
                <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '18px',
                    padding: '28px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                    animation: 'statsCardEnter 0.55s 0.25s ease both',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '10px', borderRadius: '12px' }}>
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: "'Poppins','Inter',sans-serif" }}>
                                Overview Analytics
                            </h2>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: "'Poppins','Inter',sans-serif" }}>
                                Complaint volume by status
                            </p>
                        </div>
                    </div>
                    <div style={{ height: '280px' }}>
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>

                {/* Doughnut Chart */}
                <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '18px',
                    padding: '28px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                    animation: 'statsCardEnter 0.55s 0.3s ease both',
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <div style={{ background: 'rgba(6,182,212,0.15)', color: '#22d3ee', padding: '10px', borderRadius: '12px' }}>
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: "'Poppins','Inter',sans-serif" }}>
                                Distribution
                            </h2>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: "'Poppins','Inter',sans-serif" }}>
                                Status breakdown
                            </p>
                        </div>
                    </div>
                    <div style={{ flex: 1, minHeight: '220px' }}>
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                </div>
            </div>

            {/* ── Summary Row: Total + Resolution Rate ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', animation: 'statsCardEnter 0.55s 0.35s ease both' }}>

                {/* Total Complaints */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))',
                    borderRadius: '18px',
                    padding: '28px',
                    border: '1px solid rgba(99,102,241,0.2)',
                    boxShadow: '0 4px 24px rgba(99,102,241,0.12)',
                    fontFamily: "'Poppins','Inter',sans-serif",
                }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#818cf8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                        Total Complaints
                    </p>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1', marginTop: '12px', letterSpacing: '-2px' }}>
                        <AnimatedCounter end={total} />
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '10px' }}>
                        All complaints submitted through the ERP system.
                    </p>
                </div>

                {/* Resolution Rate */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.12))',
                    borderRadius: '18px',
                    padding: '28px',
                    border: '1px solid rgba(16,185,129,0.2)',
                    boxShadow: '0 4px 24px rgba(16,185,129,0.12)',
                    fontFamily: "'Poppins','Inter',sans-serif",
                }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#34d399', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                        Resolution Rate
                    </p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginTop: '12px' }}>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1', letterSpacing: '-2px' }}>
                            <AnimatedCounter end={resolutionRate} />
                        </h2>
                        <span style={{ fontSize: '1.8rem', fontWeight: '700', color: '#34d399', marginBottom: '6px' }}>%</span>
                    </div>
                    {/* Progress Bar */}
                    <div style={{ marginTop: '14px', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${resolutionRate}%`,
                            background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                            borderRadius: '99px',
                            transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
                        }} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '10px' }}>
                        {stats.resolved} of {total} complaints resolved.
                    </p>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
                @keyframes statsCardEnter {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes badge-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%       { opacity: 0.5; transform: scale(1.5); }
                }
            `}</style>
        </DashboardLayout>
    );
};

export default AdminStatistics;
