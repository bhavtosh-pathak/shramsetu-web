import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, ClipboardCheck, Hammer, ShieldCheck, Smartphone, Users } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Brand } from './components/UI';
import { BridgeScene } from './components/Illustrations';
import { AppLayout } from './components/Layout';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from './pages/AuthPages';
import { DashboardPage, JobsPage, PostJobPage, MyJobsPage, ApplicationsPage, ApplicantsPage, WorkersPage, ProfilePage, NotFoundPage } from './pages/Pages';
import './styles.css';

function LandingPage() {
  const { user } = useAuth();
  const trust = [
    { icon: Users, title: 'Two clear roles', text: 'Separate tools for workers and hirers.' },
    { icon: ClipboardCheck, title: 'Track every step', text: 'Applications and statuses in one place.' },
    { icon: ShieldCheck, title: 'Secure sign-in', text: 'Passwords are encrypted, sessions are protected.' },
    { icon: Smartphone, title: 'Works on any phone', text: 'Simple pages that fit every screen.' }
  ];
  const workerPoints = ['Browse open jobs and search by title or location', 'Apply quickly and track every application', 'Build a profile with your skills and experience'];
  const hirerPoints = ['Post a job with wages, duration and location', 'Review applicants and accept or reject them', 'Browse worker profiles to find the right fit'];
  const steps = [
    { title: 'Create your account', text: 'Join as a worker or as a hirer. It only takes a minute.' },
    { title: 'Find or post work', text: 'Workers explore jobs. Hirers share openings with clear details.' },
    { title: 'Connect and get started', text: 'Apply, review applicants and keep everything organised.' }
  ];
  return <div className="landing-page">
    <header className="landing-header"><Brand/><nav className="landing-nav" aria-label="Main"><a href="#for-you">For workers & hirers</a><a href="#how-it-works">How it works</a></nav>
      <div className="landing-actions">{user ? <Link to="/dashboard" className="button button-primary button-small">Open workspace <ArrowRight size={16}/></Link> : <><Link to="/login" className="landing-signin">Sign in</Link><Link to="/register" className="button button-primary button-small">Get started</Link></>}</div></header>
    <main>
      <section className="landing-section landing-hero">
        <div><span className="eyebrow"><span className="live-dot"/> The bridge between work and workers</span>
          <h1>Connecting skilled hands with <em>honest work.</em></h1>
          <p className="landing-lead">ShramSetu helps people who want to work meet the people who need work done. Find jobs near you, or post a job and hear from workers directly.</p>
          <div className="landing-cta">{user ? <Link to="/dashboard" className="button button-primary">Go to your dashboard <ArrowRight size={18}/></Link> : <><Link to="/register?role=worker" className="button button-primary"><Hammer size={18}/> I’m looking for work</Link><Link to="/register?role=hirer" className="button button-accent"><BriefcaseBusiness size={18}/> I want to hire</Link></>}</div>
          {!user && <p className="landing-note">Already have an account? <Link to="/login">Sign in</Link></p>}</div>
        <BridgeScene className="landing-scene"/>
      </section>
      <section className="trust-strip" aria-label="Why people trust ShramSetu"><div className="trust-grid">{trust.map(({ icon: Icon, title, text }) => <div className="trust-item" key={title}><Icon size={22}/><div><strong>{title}</strong><span>{text}</span></div></div>)}</div></section>
      <section className="landing-section" id="for-you">
        <div className="center-heading"><span className="eyebrow">Choose your path</span><h2>Built for both sides of the bridge</h2><p>Whether you need work or need workers, ShramSetu gives you the right tools.</p></div>
        <div className="path-grid">
          <article className="path-card">
            <span className="path-icon"><Hammer size={26}/></span>
            <h3>For workers</h3>
            <p>Find work that fits your skills and your area.</p>
            <ul className="path-list">{workerPoints.map(t => <li key={t}><CheckCircle2 size={18}/>{t}</li>)}</ul>
            <Link className="button button-primary" to="/register?role=worker">Join as a worker <ArrowRight size={17}/></Link>
          </article>
          <article className="path-card hirer">
            <span className="path-icon"><BriefcaseBusiness size={26}/></span>
            <h3>For hirers</h3>
            <p>Reach workers who are ready to start.</p>
            <ul className="path-list">{hirerPoints.map(t => <li key={t}><CheckCircle2 size={18}/>{t}</li>)}</ul>
            <Link className="button button-accent" to="/register?role=hirer">Join as a hirer <ArrowRight size={17}/></Link>
          </article>
        </div>
      </section>
      <section className="landing-section how-section" id="how-it-works"><div className="how-inner">
        <div className="center-heading"><span className="eyebrow">How it works</span><h2>Three simple steps</h2></div>
        <div className="how-grid">{steps.map((st, n) => <article className="how-card" key={st.title}><span className="how-number">{n + 1}</span><h3>{st.title}</h3><p>{st.text}</p></article>)}</div></div></section>
      <section className="landing-cta-band"><div className="cta-inner"><div><h2>Ready to cross the bridge?</h2><p>Create your ShramSetu account and take the first step today.</p></div><Link to={user ? '/dashboard' : '/register'} className="button button-white">{user ? 'Open workspace' : 'Create your account'} <ArrowRight size={17}/></Link></div></section>
    </main>
    <footer className="landing-footer"><Brand compact/><nav className="footer-links" aria-label="Footer"><Link to="/login">Sign in</Link><Link to="/register">Create account</Link><a href="mailto:support@shramsetu.example">Contact support</a></nav><span>© {new Date().getFullYear()} ShramSetu</span></footer>
  </div>;
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="global-loading" role="status"><span className="spinner"/><p>Getting your workspace ready…</p></div>;
  if (!user) return <Navigate to="/login" replace/>;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace/>;
  return <AppLayout>{children}</AppLayout>;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="global-loading" role="status"><span className="spinner"/></div>;
  return user ? <Navigate to="/dashboard" replace/> : children;
}

function AppRoutes() {
  return <Routes>
    <Route path="/" element={<LandingPage/>}/>
    <Route path="/login" element={<GuestRoute><LoginPage/></GuestRoute>}/>
    <Route path="/register" element={<GuestRoute><RegisterPage/></GuestRoute>}/>
    <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage/></GuestRoute>}/>
    <Route path="/reset-password/:token" element={<ResetPasswordPage/>}/>
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage/></ProtectedRoute>}/>
    <Route path="/jobs" element={<ProtectedRoute roles={['worker']}><JobsPage/></ProtectedRoute>}/>
    <Route path="/applications" element={<ProtectedRoute roles={['worker']}><ApplicationsPage/></ProtectedRoute>}/>
    <Route path="/post-job" element={<ProtectedRoute roles={['hirer']}><PostJobPage/></ProtectedRoute>}/>
    <Route path="/my-jobs" element={<ProtectedRoute roles={['hirer']}><MyJobsPage/></ProtectedRoute>}/>
    <Route path="/applicants/:jobId" element={<ProtectedRoute roles={['hirer']}><ApplicantsPage/></ProtectedRoute>}/>
    <Route path="/workers" element={<ProtectedRoute roles={['hirer']}><WorkersPage/></ProtectedRoute>}/>
    <Route path="/profile" element={<ProtectedRoute><ProfilePage/></ProtectedRoute>}/>
    <Route path="*" element={<NotFoundPage/>}/>
  </Routes>;
}

export default function App() {
  return <BrowserRouter><AuthProvider><AppRoutes/></AuthProvider></BrowserRouter>;
}