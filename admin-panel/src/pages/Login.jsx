import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [needsReset, setNeedsReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Check if user needs to reset password
      const { data: roleData, error: roleError } = await supabase
        .from('admin_roles')
        .select('force_password_reset')
        .eq('user_id', data.user.id)
        .single();
        
      if (roleData && roleData.force_password_reset) {
        setNeedsReset(true);
      }
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      
      // Update role table
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('admin_roles').update({ force_password_reset: false }).eq('user_id', user.id);
      
      setNeedsReset(false);
      window.location.reload(); // Refresh to go to dashboard
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (needsReset) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
           <h2 style={{marginBottom: '0.5rem'}}>Güvenlik Uyarısı</h2>
           <p className="text-muted" style={{marginBottom: '2rem', fontSize: '0.875rem'}}>Hesabınızın güvenliği için lütfen varsayılan şifrenizi değiştirin.</p>
           {error && <div className="error-message">{error}</div>}
           <form onSubmit={handleReset}>
             <div className="form-group">
                <label className="form-label">Yeni Şifre</label>
                <input type="password" required className="form-input" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
             </div>
             <button type="submit" disabled={loading} className="btn btn-primary" style={{width: '100%'}}>
                {loading ? <div className="loader"></div> : 'Şifreyi Güncelle'}
             </button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <div className="brand" style={{marginBottom: '0.5rem', fontSize: '1.75rem'}}>EA Yazılım Admin</div>
          <p className="text-muted" style={{fontSize: '0.875rem'}}>Lütfen yönetici bilgilerinizle giriş yapın.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">E-posta / Kullanıcı Adı</label>
            <input 
              type="email" 
              className="form-input" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ege.ozten@eayazilim.tr"
            />
          </div>
          
          <div className="form-group" style={{marginBottom: '2rem'}}>
            <label className="form-label">Şifre</label>
            <input 
              type="password" 
              className="form-input" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{width: '100%'}}
            disabled={loading}
          >
            {loading ? <div className="loader"></div> : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
