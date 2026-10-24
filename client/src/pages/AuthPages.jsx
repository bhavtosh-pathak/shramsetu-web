import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CheckCircle2, Eye, EyeOff, Handshake, ShieldCheck, Users } from 'lucide-react';
import { Brand, Notice } from '../components/UI';
import { BridgeScene } from '../components/Illustrations';
import { useAuth } from '../context/AuthContext';
import api, { getError } from '../services/api';

function AuthShell({ children, mode = 'login' }) { return <div className="auth-page"><div className="auth-art"><div className="auth-art-top"><Brand/></div><div className="auth-art-content"><span className="eyebrow light-eyebrow">WORK. GROW. THRIVE.</span><h1>Good work deserves<br/><em>good connections.</em></h1><p>ShramSetu brings workers and hirers together, making every opportunity a little closer.</p><div className="auth-perks"><span><CheckCircle2 size={17}/> Find trusted work</span><span><CheckCircle2 size={17}/> Connect locally</span><span><CheckCircle2 size={17}/> Grow together</span></div><BridgeScene className="auth-scene"/></div><div className="auth-art-footer">Made for the people who make things happen.</div></div><div className="auth-form-side"><Link to="/" className="back-home"><ArrowLeft size={16}/> Back to home</Link><div className="auth-form-wrap">{children}</div><p className="auth-legal">By continuing, you agree to our <a href="mailto:support@shramsetu.example">Terms</a> and <a href="mailto:support@shramsetu.example">Privacy Policy</a>.</p></div></div>; }
function PasswordField({ value, onChange, required = true, autoComplete = 'current-password' }) { const [show, setShow] = useState(false); return <div className="password-wrap"><input type={show ? 'text' : 'password'} value={value} onChange={onChange} minLength={8} required={required} placeholder="At least 8 characters" autoComplete={autoComplete}/><button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>; }
export function LoginPage() { const { user, login } = useAuth(); const navigate = useNavigate(); const [form, setForm] = useState({ email: '', password: '' }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); if (user) return <Navigate to="/dashboard" replace/>; const change = e => setForm({ ...form, [e.target.name]: e.target.value }); const submit = async e => { e.preventDefault(); setError(''); setBusy(true); try { await login(form); navigate('/dashboard'); } catch (err) { setError(getError(err)); } finally { setBusy(false); } }; return <AuthShell><span className="eyebrow">WELCOME BACK</span><h2>Sign in to ShramSetu</h2><p className="auth-subtitle">Pick up where you left off.</p><Notice notice={error ? { type: 'error', message: error } : null}/><form className="form-stack" onSubmit={submit}><label>Email address<input name="email" type="email" value={form.email} onChange={change} required autoComplete="email" placeholder="you@example.com"/></label><label>Password<PasswordField value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/></label><div className="form-inline"><span></span><Link to="/forgot-password">Forgot password?</Link></div><button className="button button-primary button-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <ArrowRight size={18}/></button></form><div className="auth-switch">New to ShramSetu? <Link to="/register">Create an account</Link></div><div className="secure-note"><ShieldCheck size={17}/> Your information is protected.</div></AuthShell>; }
export function RegisterPage() { const { user, register } = useAuth(); const navigate = useNavigate(); const [form, setForm] = useState({ fullName: '', email: '', mobile: '', age: '', password: '', role: new URLSearchParams(window.location.search).get('role') === 'hirer' ? 'hirer' : 'worker' }); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); if (user) return <Navigate to="/dashboard" replace/>; const change = e => setForm({ ...form, [e.target.name]: e.target.value }); const submit = async e => { e.preventDefault(); setError(''); setBusy(true); try { await register({ ...form, age: form.age ? Number(form.age) : undefined }); navigate('/dashboard'); } catch (err) { setError(getError(err)); } finally { setBusy(false); } }; return <AuthShell mode="register"><span className="eyebrow">YOUR NEXT CHAPTER</span><h2>Create your account</h2><p className="auth-subtitle">Join a community built around opportunity.</p><Notice notice={error ? { type: 'error', message: error } : null}/><form className="form-stack register-form" onSubmit={submit}><label>Full name<input name="fullName" value={form.fullName} onChange={change} required maxLength={100} placeholder="Your full name" autoComplete="name"/></label><div className="form-two-col"><label>Mobile number<input name="mobile" type="tel" value={form.mobile} onChange={change} placeholder="10-digit number" autoComplete="tel"/></label><label>Age<input name="age" type="number" min="18" max="100" value={form.age} onChange={change} placeholder="18+"/></label></div><label>Email address<input name="email" type="email" value={form.email} onChange={change} required autoComplete="email" placeholder="you@example.com"/></label><label>Password<PasswordField autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/><small className="field-hint">Use at least 8 characters.</small></label><fieldset className="role-picker"><legend>I want to join as</legend><div className="role-options"><button type="button" className={`role-option ${form.role === 'worker' ? 'selected' : ''}`} aria-pressed={form.role === 'worker'} onClick={() => setForm({ ...form, role: 'worker' })}><span className="role-option-icon worker-role"><Users size={20}/></span><span><b>Worker</b><small>Find work opportunities</small></span><span className="role-radio"/></button><button type="button" className={`role-option ${form.role === 'hirer' ? 'selected' : ''}`} aria-pressed={form.role === 'hirer'} onClick={() => setForm({ ...form, role: 'hirer' })}><span className="role-option-icon hirer-role"><BriefcaseBusiness size={20}/></span><span><b>Hirer</b><small>Hire skilled workers</small></span><span className="role-radio"/></button></div></fieldset><button className="button button-primary button-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'} <ArrowRight size={18}/></button></form><div className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></div></AuthShell>; }

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async e => {
    e.preventDefault(); setNotice(null); setBusy(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setNotice({ type: 'success', message: data.message }); setSent(true);
    } catch (err) { setNotice({ type: 'error', message: getError(err) }); }
    finally { setBusy(false); }
  };
  return <AuthShell><span className="eyebrow">ACCOUNT RECOVERY</span><h2>Forgot your password?</h2><p className="auth-subtitle">Enter your registered email. We will send you a link to set a new password.</p><form className="form-stack" onSubmit={submit}><label>Email address<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/></label><button className="button button-primary button-full" disabled={busy}>{busy ? 'Sending…' : sent ? 'Send again' : 'Send reset link'} <ArrowRight size={18}/></button></form><Notice notice={notice} onClose={() => setNotice(null)}/><div className="auth-switch"><Link to="/login">Back to sign in</Link></div></AuthShell>;
}

export function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const submit = async e => {
    e.preventDefault(); setNotice(null);
    if (password !== confirm) return setNotice({ type: 'error', message: 'Passwords do not match.' });
    setBusy(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      setNotice({ type: 'success', message: data.message }); setDone(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) { setNotice({ type: 'error', message: getError(err) }); }
    finally { setBusy(false); }
  };
  return <AuthShell><span className="eyebrow">ACCOUNT RECOVERY</span><h2>Set a new password</h2><p className="auth-subtitle">Choose a strong password you have not used before.</p><Notice notice={notice} onClose={() => setNotice(null)}/><form className="form-stack" onSubmit={submit}><label>New password<PasswordField autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)}/></label><label>Confirm password<PasswordField autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)}/></label><button className="button button-primary button-full" disabled={busy || done}>{busy ? 'Saving…' : 'Update password'} <ArrowRight size={18}/></button></form><div className="auth-switch"><Link to="/login">Back to sign in</Link></div></AuthShell>;
}