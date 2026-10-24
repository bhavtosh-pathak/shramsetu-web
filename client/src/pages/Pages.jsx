import { useCallback, useEffect, useState,useMemo } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, CheckCircle2, ClipboardList, Clock3,FileText, MapPin, Plus, Search,  UserRound, Wallet, RefreshCw, Save,Users, Mail,Phone,MessageCircle,User,Trash2, IndianRupee, PencilLine, XCircle, CircleCheck, CircleX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { getError } from '../services/api';
import { EmptyState, JobCard, LogoMark, Notice, StatCard, StatusPill } from '../components/UI';

function useNotice(initial = null) { const [notice, setNotice] = useState(initial); useEffect(() => { if (!notice) return; const t = window.setTimeout(() => setNotice(null), 5000); return () => window.clearTimeout(t); }, [notice]); const show = useCallback((message, type = 'success') => setNotice({ message, type }), []); const clear = useCallback(() => setNotice(null), []); return { notice, show, clear }; }
function PageHeading({ eyebrow, title, subtitle, action }) { return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>; }
function LoadingState() { return <div className="loading-state" role="status"><span className="spinner"/><span>Loading your workspace…</span></div>; }
function SectionTitle({ title, subtitle, action }) { return <div className="section-title"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>; }

export function DashboardPage() {
  const { user } = useAuth(); const navigate = useNavigate(); const hirer = user.role === 'hirer'; const [jobs, setJobs] = useState([]); const [applications, setApplications] = useState([]); const [loading, setLoading] = useState(true); const { notice, show, clear } = useNotice();
  const load = useCallback(async () => { setLoading(true); try { if (hirer) { const { data } = await api.get('/jobs?mine=true'); setJobs(data.jobs); const counts = await Promise.all(data.jobs.map(j => api.get(`/applications/job/${j._id}`).then(r => r.data.applications.map(a => ({ ...a, job: j }))).catch(() => []))); setApplications(counts.flat()); } else { const [jobRes, appRes] = await Promise.all([api.get('/jobs'), api.get('/applications/mine')]); setJobs(jobRes.data.jobs); setApplications(appRes.data.applications); } } catch (e) { show(getError(e), 'error'); } finally { setLoading(false); } }, [hirer]); useEffect(() => { load(); }, [load]);
  const appliedCount = hirer ? applications.length : applications.length; const recentJobs = hirer ? jobs.slice(0, 3) : jobs.slice(0, 3); const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
  return <><Notice notice={notice} onClose={clear}/><PageHeading eyebrow={hirer ? 'HIRER WORKSPACE' : 'WORKER WORKSPACE'} title={`${greeting}, ${user.fullName.split(' ')[0]}!`} subtitle={hirer ? 'Build your team, one great connection at a time.' : 'Your next opportunity could be just around the corner.'} action={<button className="button button-quiet" onClick={load}><RefreshCw size={16}/> Refresh</button>}/><div className="welcome-banner"><div className="welcome-copy"><span className="welcome-kicker"><span className="live-dot"/> YOUR SHRAMSETU SPACE</span><h2>{hirer ? 'Find the right people for the work.' : 'Let’s find work that works for you.'}</h2><p>{hirer ? 'Post a job, meet local talent, and keep every application in one place.' : 'Explore local jobs, apply with confidence, and track your applications from here.'}</p><Link className="banner-link" to={hirer ? '/post-job' : '/jobs'}>{hirer ? 'Post your first job' : 'Explore available jobs'} <ArrowRight size={17}/></Link></div><div className="welcome-art" aria-hidden="true"><LogoMark size={190}/></div></div>{loading ? <LoadingState/> : <><div className="stats-grid">{hirer ? <><StatCard icon={BriefcaseBusiness} label="Jobs posted" value={jobs.length} tone="orange"/><StatCard icon={Users} label="Applications" value={applications.length} tone="green"/><StatCard icon={Clock3} label="Open positions" value={jobs.filter(j => j.status === 'open').length} tone="blue"/><StatCard icon={CheckCircle2} label="Accepted" value={applications.filter(a => a.status === 'accepted').length} tone="purple"/></> : <><StatCard icon={BriefcaseBusiness} label="Available jobs" value={jobs.length} tone="orange"/><StatCard icon={ClipboardList} label="Applications sent" value={applications.length} tone="green"/><StatCard icon={Clock3} label="Awaiting response" value={applications.filter(a => a.status === 'pending').length} tone="blue"/><StatCard icon={CheckCircle2} label="Accepted" value={applications.filter(a => a.status === 'accepted').length} tone="purple"/></>}</div><section className="content-section"><SectionTitle title={hirer ? 'Your recent job posts' : 'Recently added opportunities'} subtitle={hirer ? 'Keep track of the work you have shared.' : 'A few opportunities to get you started.'} action={<Link className="section-action" to={hirer ? '/my-jobs' : '/jobs'}>{hirer ? 'View all jobs' : 'Browse all jobs'} <ArrowRight size={15}/></Link>}/>{recentJobs.length ? <div className="job-grid">{recentJobs.map(job => <JobCard key={job._id} job={job} onViewApplicants={hirer ? j => navigate(`/applicants/${j._id}`) : undefined} onApply={!hirer ? j => navigate(`/jobs?apply=${j._id}`) : undefined}/>)}</div> : <EmptyState icon={BriefcaseBusiness} title={hirer ? 'Your first job starts here' : 'New opportunities are on their way'} body={hirer ? 'Post a job and connect with workers in your area.' : 'Check back soon, or explore all available jobs.'} action={<Link className="button button-primary button-small" to={hirer ? '/post-job' : '/jobs'}>{hirer ? 'Post a job' : 'Find work'} <ArrowRight size={16}/></Link>}/>}</section></>}</>;
}

export function JobsPage() {
  const [jobs, setJobs] = useState([]); const [applied, setApplied] = useState([]); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(true); const [busyId, setBusyId] = useState(''); const { notice, show, clear } = useNotice(); const params = new URLSearchParams(window.location.search); const preselect = params.get('apply'); const [applyId, setApplyId] = useState(preselect || '');
  const load = useCallback(async () => { setLoading(true); try { const [j, a] = await Promise.all([api.get('/jobs', { params: { search: search || undefined } }), api.get('/applications/mine')]); setJobs(j.data.jobs); setApplied(a.data.applications.map(x => x.job?._id).filter(Boolean)); } catch (e) { show(getError(e), 'error'); } finally { setLoading(false); } }, [search]); useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer); }, [load]);
  const apply = async job => { setBusyId(job._id); try { await api.post('/applications', { jobId: job._id }); setApplied(prev => [...prev, job._id]); show('Application submitted successfully.'); } catch (e) { show(getError(e), 'error'); } finally { setBusyId(''); setApplyId(''); } };
  return <><Notice notice={notice} onClose={clear}/><PageHeading eyebrow="FIND YOUR NEXT OPPORTUNITY" title="Available jobs" subtitle="Discover local work opportunities and take your next step."/><div className="search-panel"><div className="search-input-wrap"><Search size={19}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by job title, location, or keyword…"/><kbd>Search</kbd></div><span className="search-count">{loading ? 'Searching…' : `${jobs.length} ${jobs.length === 1 ? 'opportunity' : 'opportunities'}`}</span></div>{loading ? <LoadingState/> : jobs.length ? <div className="job-grid job-grid-large">{jobs.map(job => <div key={job._id} className={applyId === job._id ? 'highlight-job' : ''}><JobCard job={job} applied={applied.includes(job._id)} onApply={apply}/>{busyId === job._id && <p className="inline-feedback">Submitting your application…</p>}</div>)}</div> : <EmptyState icon={Search} title="No jobs found" body="Try another keyword or check back later for new opportunities." action={search && <button className="button button-secondary button-small" onClick={() => setSearch('')}>Clear search</button>}/>}</>;
}

export function PostJobPage() {
  const navigate = useNavigate(); const [form, setForm] = useState({ title: '', location: '', wages: '', duration: '', description: '' }); const [busy, setBusy] = useState(false); const { notice, show, clear } = useNotice(); const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => { e.preventDefault(); setBusy(true); try { const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])); await api.post('/jobs', payload); navigate('/my-jobs', { replace: true, state: { message: 'Your job has been published successfully.' } }); } catch (err) { show(getError(err), 'error'); } finally { setBusy(false); } };
  return <><Notice notice={notice} onClose={clear}/><PageHeading eyebrow="CREATE AN OPPORTUNITY" title="Post a new job" subtitle="Share the details and connect with workers who are ready to help."/><div className="form-page-layout"><form className="panel form-panel" onSubmit={submit}><div className="panel-heading"><span className="panel-heading-icon"><BriefcaseBusiness size={21}/></span><div><h2>Job details</h2><p>Fields marked with * are required.</p></div></div><div className="form-stack"><label>Job title *<input name="title" value={form.title} onChange={change} required maxLength={120} placeholder="e.g. Construction helper"/></label><div className="form-two-col"><label>Work location *<input name="location" value={form.location} onChange={change} required placeholder="City, area, or village"/></label><label>Wages / payment *<input name="wages" value={form.wages} onChange={change} required placeholder="e.g. ₹600 per day"/></label></div><label>Duration *<input name="duration" value={form.duration} onChange={change} required placeholder="e.g. 5 days, full-time"/></label><label>Job description *<textarea name="description" value={form.description} onChange={change} required minLength={10} maxLength={3000} rows={5} placeholder="Describe the work, requirements, timings, and any tools or skills needed…"/></label><div className="form-actions"><button type="button" className="button button-quiet" onClick={() => navigate(-1)}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? 'Publishing…' : 'Publish job'} <ArrowUpRight size={17}/></button></div></div></form><aside className="posting-tips"><span className="tips-icon"><CheckCircle2 size={22}/></span><h3>A good job post goes a long way.</h3><p>Clear details help workers understand the opportunity and apply with confidence.</p><ul><li>Use a specific job title.</li><li>Be clear about wages and duration.</li><li>Include the exact work location.</li><li>Explain daily responsibilities.</li></ul><div className="tips-note">Your job will be visible to workers as soon as you publish it.</div></aside></div></>;
}

export function MyJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const location = useLocation();
  const { notice, show, clear } = useNotice(location.state?.message ? { message: location.state.message, type: 'success' } : null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    api.get('/jobs?mine=true')
      .then(({ data }) => active && setJobs(data.jobs))
      .catch(e => active && show(getError(e), 'error'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [refresh, show]);

  const toggle = async job => {
    try {
      await api.patch(`/jobs/${job._id}`, { status: job.status === 'closed' ? 'open' : 'closed' });
      show('Job status updated.');
      setRefresh(n => n + 1);
    } catch (e) { show(getError(e), 'error'); }
  };

  const remove = async job => {
    if (!window.confirm(`Delete “${job.title}”? Its applications will also be removed.`)) return;
    try {
      await api.delete(`/jobs/${job._id}`);
      show('Job deleted.');
      setRefresh(n => n + 1);
    } catch (e) { show(getError(e), 'error'); }
  };

  const counts = useMemo(() => ({
    all: jobs.length,
    open: jobs.filter(j => j.status !== 'closed').length,
    closed: jobs.filter(j => j.status === 'closed').length,
  }), [jobs]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs
      .filter(j => filter === 'all' || (filter === 'closed' ? j.status === 'closed' : j.status !== 'closed'))
      .filter(j => !q || `${j.title} ${j.location}`.toLowerCase().includes(q));
  }, [jobs, filter, query]);

  const stats = [
    { key: 'all', label: 'Total jobs', icon: BriefcaseBusiness, tone: 'blue' },
    { key: 'open', label: 'Open', icon: CheckCircle2, tone: 'green' },
    { key: 'closed', label: 'Closed', icon: XCircle, tone: 'grey' },
  ];

  return (
    <>
      <Notice notice={notice} onClose={clear} />

      <section className="apps-hero">
        <div>
          <span className="apps-hero-eyebrow">HIRER WORKSPACE</span>
          <h1>My posted jobs</h1>
          <p>Manage your opportunities and keep applications moving.</p>
        </div>
        <Link to="/post-job" className="button button-primary"><Plus size={17} /> Post a job</Link>
      </section>

      <div className="stats-grid stats-grid-3">
        {stats.map(({ key, label, icon: Icon, tone }) => (
          <button key={key} className={`stat-card tone-${tone} ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
            <div className="stat-icon"><Icon size={20} /></div>
            <div>
              <strong>{counts[key]}</strong>
              <span>{label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="apps-toolbar">
        <span className="muted">{visible.length} {visible.length === 1 ? 'job' : 'jobs'} shown</span>
        <div className="apps-controls">
          <label className="apps-search">
            <Search size={16} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search job or city" />
          </label>
          <button className="icon-button" onClick={() => setRefresh(n => n + 1)} aria-label="Refresh" title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {loading ? <LoadingState /> : visible.length ? (
        <div className="application-list">
          {visible.map(job => {
            const closed = job.status === 'closed';
            const applicants = job.applicantsCount ?? job.applicantCount ?? job.applicationsCount;
            return (
              <article className={`job-row ${closed ? 'is-closed' : ''}`} key={job._id}>
                <div className="application-icon"><BriefcaseBusiness size={22} /></div>

                <div className="application-main">
                  <div className="application-title-row">
                    <h3>{job.title}</h3>
                    <StatusPill status={job.status} />
                  </div>

                  <div className="app-chips">
                    <span><MapPin size={14} />{job.location || 'Location unavailable'}</span>
                    <span><IndianRupee size={14} />{formatWage(job.wages)}</span>
                    {job.duration && <span><Clock size={14} />{job.duration}</span>}
                  </div>

                  {job.description && <p className="job-description">{job.description}</p>}

                  <div className="application-footer">
                    <small>Posted {formatDate(job.createdAt)}</small>
                    <div className="job-row-actions">
                      <button className="button button-secondary button-small" onClick={() => navigate(`/applicants/${job._id}`)}>
                        <Users size={15} /> Applicants
                        {applicants !== undefined && <span className="count-badge">{applicants}</span>}
                      </button>
                      <button className="button button-quiet button-small" onClick={() => toggle(job)}>
                        {closed ? 'Reopen job' : 'Close job'}
                      </button>
                      <button className="icon-button icon-danger" onClick={() => remove(job)} aria-label="Delete job" title="Delete job">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BriefcaseBusiness}
          title={jobs.length ? 'No jobs in this filter' : "You haven't posted a job yet"}
          body={jobs.length ? 'Try a different filter or search term.' : 'Create your first post and start connecting with local workers.'}
          action={<Link to="/post-job" className="button button-primary button-small"><Plus size={16} /> Post a job</Link>}
        />
      )}
    </>
  );
}

// import { useEffect, useMemo, useState } from 'react';
// import { Link } from 'react-router-dom';
// import {
//   ArrowRight, BriefcaseBusiness, CheckCircle2, ClipboardList, Clock,
//   FileText, MapPin, Phone, Search, User, Wallet, XCircle,
// } from 'lucide-react';

const TABS = ['all', 'pending', 'accepted', 'rejected'];

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const formatWage = (w) => (w ? (/^\d+$/.test(String(w)) ? `₹${w} / day` : w) : 'Wage not listed');

function Timeline({ status }) {
  const review = status === 'pending' ? 'active' : 'done';
  const decision = status === 'accepted' ? 'success' : status === 'rejected' ? 'danger' : '';
  return (
    <ol className="app-timeline">
      <li className="done"><span /> Applied</li>
      <li className={review}><span /> Under review</li>
      <li className={decision}><span /> {status === 'rejected' ? 'Rejected' : status === 'accepted' ? 'Accepted' : 'Decision'}</li>
    </ol>
  );
}

export function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const { notice, show, clear } = useNotice();

  useEffect(() => {
    api.get('/applications/mine')
      .then(({ data }) => setApps(data.applications))
      .catch((e) => show(getError(e), 'error'))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => ({
    all: apps.length,
    pending: apps.filter((a) => a.status === 'pending').length,
    accepted: apps.filter((a) => a.status === 'accepted').length,
    rejected: apps.filter((a) => a.status === 'rejected').length,
  }), [apps]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps
      .filter((a) => tab === 'all' || a.status === tab)
      .filter((a) => !q || `${a.job?.title} ${a.job?.location}`.toLowerCase().includes(q))
      .sort((a, b) => (sort === 'newest'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)));
  }, [apps, tab, query, sort]);

  const stats = [
    { key: 'all', label: 'Total applied', icon: FileText, tone: 'blue' },
    { key: 'pending', label: 'Pending', icon: Clock, tone: 'amber' },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle2, tone: 'green' },
    { key: 'rejected', label: 'Rejected', icon: XCircle, tone: 'red' },
  ];

  return (
    <>
      <Notice notice={notice} onClose={clear} />

      <section className="apps-hero">
        <div>
          <span className="apps-hero-eyebrow">YOUR ACTIVITY</span>
          <h1>My applications</h1>
          <p>Every application, all in one place. Keep an eye on your progress.</p>
        </div>
        <Link to="/jobs" className="button button-primary button-small">
          Find more work <ArrowRight size={16} />
        </Link>
      </section>

      <div className="stats-grid">
        {stats.map(({ key, label, icon: Icon, tone }) => (
          <button key={key} className={`stat-card tone-${tone} ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            <div className="stat-icon"><Icon size={20} /></div>
            <div>
              <strong>{counts[key]}</strong>
              <span>{label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="apps-toolbar">
        <div className="apps-tabs">
          {TABS.map((t) => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)} <em>{counts[t]}</em>
            </button>
          ))}
        </div>
        <div className="apps-controls">
          <label className="apps-search">
            <Search size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search job or city" />
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {loading ? <LoadingState /> : visible.length ? (
        <div className="application-list">
          {visible.map((app) => {
            const hirer = app.job?.postedBy;
            return (
              <article className={`application-card status-${app.status}`} key={app._id}>
                <div className="application-icon"><BriefcaseBusiness size={22} /></div>

                <div className="application-main">
                  <div className="application-title-row">
                    <h3>{app.job?.title || 'Job no longer available'}</h3>
                    <StatusPill status={app.status} />
                  </div>

                  <div className="app-chips">
                    <span><MapPin size={14} />{app.job?.location || 'Location unavailable'}</span>
                    <span><Wallet size={14} />{formatWage(app.job?.wages)}</span>
                    {hirer?.name && <span><User size={14} />{hirer.name}</span>}
                  </div>

                  <Timeline status={app.status} />

                  {app.status === 'accepted' && (
  <div className="accepted-box">
    <div>
      <strong>Congratulations, you've been selected!</strong>
      <p>The hirer has accepted your application. Contact them to confirm the work details, timing and location.</p>
    </div>
    {hirer?.phone && (
      <a href={`tel:${hirer.phone}`} className="button button-primary button-small">
        <Phone size={15} /> Call hirer
      </a>
    )}
  </div>
)}

                  {app.status === 'rejected' && (
  <div className="rejected-box">
    <div>
      <strong>Application not selected</strong>
      <p>The hirer has chosen another candidate for this role. Keep applying, new jobs are posted every day.</p>
    </div>
    {/* <Link to="/jobs" className="button button-secondary button-small">
      Browse jobs <ArrowRight size={15} />
    </Link> */}
  </div>
)}

                  <div className="application-footer">
                    <small>Applied On {formatDate(app.createdAt)}</small>
                    {/* {app.job?._id && <Link to={`/jobs/${app.job._id}`} className="link-more">View job <ArrowRight size={14} /></Link>} */}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
  icon={ClipboardList}
  title={apps.length ? 'No applications in this filter' : 'No applications yet'}
  body={apps.length ? 'Try a different tab or search term.' : 'When you apply for a job, it will show up here with its current status.'}
  action={<Link to="/jobs" className="button button-primary button-small">Find work <ArrowRight size={16} /></Link>}
/>
      )}
    </>
  );
}

export function ApplicantsPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState('');
  const { notice, show, clear } = useNotice();

  useEffect(() => {
    let active = true;
    Promise.all([api.get(`/jobs/${jobId}`), api.get(`/applications/job/${jobId}`)])
      .then(([j, a]) => { if (active) { setJob(j.data.job); setApps(a.data.applications); } })
      .catch(e => show(getError(e), 'error'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [jobId, show]);

  const update = async (app, status) => {
    setBusy(app._id);
    try {
      const { data } = await api.patch(`/applications/${app._id}/status`, { status });
      setApps(prev => prev.map(a => a._id === app._id ? { ...a, status: data.application.status } : a));
      show(`Application ${status}.`);
    } catch (e) { show(getError(e), 'error'); } finally { setBusy(''); }
  };

  const counts = useMemo(() => ({
    all: apps.length,
    pending: apps.filter(a => a.status === 'pending').length,
    accepted: apps.filter(a => a.status === 'accepted').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  }), [apps]);

  const visible = useMemo(
    () => apps.filter(a => filter === 'all' || a.status === filter),
    [apps, filter]
  );

  const stats = [
    { key: 'all', label: 'Total applicants', icon: Users, tone: 'blue' },
    { key: 'pending', label: 'Pending', icon: Clock3, tone: 'amber' },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle2, tone: 'green' },
    { key: 'rejected', label: 'Rejected', icon: XCircle, tone: 'red' },
  ];

  return (
    <>
      <Notice notice={notice} onClose={clear} />

      <section className="apps-hero">
        <div>
          <span className="apps-hero-eyebrow">HIRING MANAGEMENT</span>
          <h1>Applicants</h1>
          <p>{job ? `Applications for ${job.title} · ${job.location}` : 'Review people who have applied to your job.'}</p>
        </div>
        <Link to="/my-jobs" className="button button-primary button-small">Back to jobs</Link>
      </section>

      <div className="stats-grid">
        {stats.map(({ key, label, icon: Icon, tone }) => (
          <button key={key} className={`stat-card tone-${tone} ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
            <div className="stat-icon"><Icon size={20} /></div>
            <div>
              <strong>{counts[key]}</strong>
              <span>{label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="apps-toolbar">
        <span className="muted">{visible.length} {visible.length === 1 ? 'applicant' : 'applicants'} shown</span>
      </div>

      {loading ? <LoadingState /> : visible.length ? (
        <div className="application-list">
          {visible.map(app => {
  const w = app.worker;
  const prof = w?.profile || app.profile || {};
  const skills = prof.skills || w?.skills || [];
  const mobile = w?.mobile;
  const isNew = app.status === 'pending' && Date.now() - new Date(app.createdAt).getTime() < 86400000;
  return (
    <article className={`application-card applicant-row status-${app.status}`} key={app._id}>
      <div className="avatar applicant-avatar-lg">{w?.fullName?.charAt(0)?.toUpperCase() || 'W'}</div>

      <div className="application-main">
        <div className="application-title-row">
          <h3>{w?.fullName || 'Worker'}{isNew && <span className="new-badge">New</span>}</h3>
          <StatusPill status={app.status} />
        </div>

        <div className="app-chips">
          {w?.email && <span><Mail size={14} />{w.email}</span>}
          {mobile && <span><Phone size={14} />{mobile}</span>}
          {prof.location && <span><MapPin size={14} />{prof.location}</span>}
          {prof.experience && <span><BriefcaseBusiness size={14} />{prof.experience}</span>}
        </div>

        {skills.length > 0 && (
          <div className="skill-list">
            {skills.slice(0, 4).map(s => <span key={s}>{s}</span>)}
            {skills.length > 4 && <span className="skill-more">+{skills.length - 4}</span>}
          </div>
        )}

        {prof.bio && <p className="worker-bio">{prof.bio}</p>}

        {app.status === 'accepted' && (
          <div className="accepted-box">
            <div>
              <strong>Applicant accepted</strong>
              <p>Contact them to confirm the work details, timing and location.</p>
            </div>
          </div>
        )}

        <div className="application-footer">
          <small>Applied {timeAgo(app.createdAt)} · {formatDate(app.createdAt)}</small>
          <div className="job-row-actions">
            {app.status === 'pending' && (
              <>
                <button className="button button-small accept-button" disabled={busy === app._id} onClick={() => update(app, 'accepted')}>
                  <CircleCheck size={15} /> Accept
                </button>
                <button className="button button-small reject-button" disabled={busy === app._id} onClick={() => update(app, 'rejected')}>
                  <CircleX size={15} /> Reject
                </button>
              </>
            )}
            {w?.email && <a className="icon-button contact-icon" href={`mailto:${w.email}`} aria-label="Email" title="Email"><Mail size={16} /></a>}
            {mobile && (
              <>
                <a className="button button-primary button-small" href={`tel:${mobile}`}><Phone size={15} /> Call</a>
                <a className="button button-secondary button-small" href={waLink(mobile)} target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
})}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title={apps.length ? 'No applicants in this filter' : 'No applicants yet'}
          body={apps.length ? 'Try a different filter.' : 'When workers apply for this job, their details will appear here.'}
        />
      )}
    </>
  );
}
const waLink = (mobile) => {
  const d = String(mobile).replace(/\D/g, '');
  return `https://wa.me/${d.length === 10 ? '91' + d : d}`;
};
const timeAgo = (d) => {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  const days = Math.floor(h / 24); if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return formatDate(d);
};
const availabilityTone = (a) => (a === 'Busy' ? 'pending' : a === 'Not available' ? 'closed' : 'open');

export function WorkersPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { notice, show, clear } = useNotice();

  useEffect(() => {
    api.get('/profile/workers')
      .then(({ data }) => setProfiles(data.profiles))
      .catch(e => show(getError(e), 'error'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return profiles.filter(p =>
      `${p.user?.fullName ?? ''} ${p.location ?? ''} ${(p.skills || []).join(' ')}`.toLowerCase().includes(q)
    );
  }, [profiles, search]);

  return (
    <>
      <Notice notice={notice} onClose={clear} />

      <section className="apps-hero">
        <div>
          <span className="apps-hero-eyebrow">LOCAL TALENT</span>
          <h1>Available workers</h1>
          <p>Discover worker profiles and find the right fit for your next job.</p>
        </div>
      </section>

      <div className="apps-toolbar">
        <span className="muted">
          {loading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'profile' : 'profiles'}`}
        </span>
        <div className="apps-controls">
          <label className="apps-search">
            <Search size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, skill, or location…" />
          </label>
        </div>
      </div>

      {loading ? <LoadingState /> : filtered.length ? (
        <div className="worker-grid">
          {filtered.map(p => {
            const skills = p.skills || [];
            const mobile = p.user?.mobile;
            return (
              <article className="worker-card" key={p._id}>
                <div className="worker-card-top">
                  <div className="avatar worker-avatar">{p.user?.fullName?.charAt(0)?.toUpperCase() || 'W'}</div>
                  <span className={`status-pill ${availabilityTone(p.availability)}`}>
                    <span className="pill-dot" />{p.availability || 'Available'}
                  </span>
                </div>

                <h3>{p.user?.fullName || 'Worker'}</h3>

                <div className="app-chips">
                  <span><MapPin size={14} />{p.location || 'Location not added'}</span>
                  {p.experience && <span><BriefcaseBusiness size={14} />{p.experience}</span>}
                </div>

                {p.bio && <p className="worker-bio">{p.bio}</p>}

                {skills.length > 0 && (
                  <div className="skill-list">
                    {skills.slice(0, 3).map(skill => <span key={skill}>{skill}</span>)}
                    {skills.length > 3 && <span className="skill-more">+{skills.length - 3}</span>}
                  </div>
                )}

                <div className="worker-contact">
                  {p.user?.email && (
                    <a className="contact-row" href={`mailto:${p.user.email}`}><Mail size={15} />{p.user.email}</a>
                  )}
                  {mobile && (
                    <a className="contact-row" href={`tel:${mobile}`}><Phone size={15} />{mobile}</a>
                  )}
                  {mobile && (
                    <div className="contact-actions">
                      <a className="button button-primary button-small" href={`tel:${mobile}`}><Phone size={15} /> Call</a>
                      <a className="button button-secondary button-small" href={waLink(mobile)} target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={Users} title="No worker profiles found" body="Workers will appear here after they create profiles. Try a different search." />
      )}
    </>
  );
}

export function ProfilePage() {
  const { user, setUser } = useAuth(); const [form, setForm] = useState({ fullName: user.fullName || '', mobile: user.mobile || '', age: user.age || '', bio: '', skills: '', experience: '', location: '', availability: 'Available' }); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const { notice, show, clear } = useNotice();
  useEffect(() => { api.get('/profile/me').then(({ data }) => setForm(f => ({ ...f, fullName: data.user.fullName || '', mobile: data.user.mobile || '', age: data.user.age || '', bio: data.profile?.bio || '', skills: (data.profile?.skills || []).join(', '), experience: data.profile?.experience || '', location: data.profile?.location || '', availability: data.profile?.availability || 'Available' }))).catch(e => show(getError(e), 'error')).finally(() => setLoading(false)); }, []);
  const change = e => setForm({ ...form, [e.target.name]: e.target.value }); const submit = async e => { e.preventDefault(); setBusy(true); try { const { data } = await api.patch('/profile/me', { ...form, age: form.age === '' ? undefined : Number(form.age), skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) }); setUser({ id: user.id, fullName: data.user.fullName, email: data.user.email, mobile: data.user.mobile, age: data.user.age, role: data.user.role }); show('Profile updated successfully.'); } catch (e) { show(getError(e), 'error'); } finally { setBusy(false); } };
  if (loading) return <LoadingState/>;
  return <><Notice notice={notice} onClose={clear}/><PageHeading eyebrow="YOUR PERSONAL SPACE" title="My profile" subtitle="Keep your information up to date so connections start on the right foot."/><form className="profile-layout" onSubmit={submit}><div className="panel profile-summary"><div className="profile-avatar avatar">{form.fullName?.charAt(0)?.toUpperCase() || 'S'}</div><h2>{form.fullName}</h2><span className="role-label">{user.role === 'hirer' ? 'Hirer account' : 'Worker account'}</span><p>{user.email}</p><div className="profile-divider"/><div className="profile-fact"><span>Account type</span><strong>{user.role === 'hirer' ? 'Hiring partner' : 'Worker'}</strong></div></div><div className="panel profile-edit-panel"><div className="panel-heading"><span className="panel-heading-icon"><PencilLine size={20}/></span><div><h2>Personal information</h2><p>Update your details below.</p></div></div><div className="form-stack"><div className="form-two-col"><label>Full name<input name="fullName" value={form.fullName} onChange={change} required/></label><label>Mobile number<input name="mobile" value={form.mobile} onChange={change} type="tel"/></label></div><div className="form-two-col"><label>Email address<input value={user.email} disabled/><small className="field-hint">Email changes are not available here.</small></label><label>Age<input name="age" value={form.age} onChange={change} type="number" min="18" max="100"/></label></div>{user.role === 'worker' && <><div className="form-two-col"><label>Location<input name="location" value={form.location} onChange={change} placeholder="City or area"/></label><label>Experience<input name="experience" value={form.experience} onChange={change} placeholder="e.g. 2 years"/></label></div><label>Skills <small className="field-hint inline-hint">Separate each skill with a comma.</small><input name="skills" value={form.skills} onChange={change} placeholder="Masonry, painting, plumbing…"/></label><label>About you<textarea name="bio" value={form.bio} onChange={change} rows={4} maxLength={1500} placeholder="Share a little about your experience and the work you do…"/></label><label>Availability<select name="availability" value={form.availability} onChange={change}><option>Available</option><option>Busy</option><option>Not available</option></select></label></>}<div className="form-actions"><button className="button button-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'} <Save size={17}/></button></div></div></div></form></>;
}

export function NotFoundPage() { return <div className="not-found"><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>This path seems to have wandered off.</h1><p>Let’s get you back to your ShramSetu workspace.</p><Link className="button button-primary" to="/dashboard">Back to dashboard <ArrowRight size={17}/></Link></div>; }
