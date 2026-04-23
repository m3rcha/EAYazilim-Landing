import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { LogOut, LayoutDashboard, CheckCircle, Users } from 'lucide-react';

export default function Dashboard() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [needsReset, setNeedsReset] = useState(false);
  const [roleError, setRoleError] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
    checkRole();
  }, []);

  const checkRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data, error } = await supabase.from('admin_roles').select('*').eq('user_id', user.id).single();
    if (error) {
      console.error('Rol çekme hatası:', error);
      setRoleError(error.message);
    }
    if (data) {
      console.log('Admin rol verisi:', data);
      setUserRole(data.role);
      if (data.force_password_reset) {
         setNeedsReset(true);
      }
    }
  };

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
  
  const markAsRead = async (id) => {
    try {
      const { error } = await supabase.from('contacts').update({ is_read: true }).eq('id', id);
      if (error) throw error;
      setContacts(contacts.map(c => c.id === id ? { ...c, is_read: true } : c));
    } catch (error) {
       console.error(error);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('admin_roles').update({ force_password_reset: false }).eq('user_id', user.id);
      
      setNeedsReset(false);
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  // Render reset form if needed instead of signing out
  if (needsReset) {
      return (
        <div className="auth-wrapper">
          <div className="auth-card">
             <h2 style={{marginBottom: '0.5rem'}}>Güvenlik Uyarısı</h2>
             <p className="text-muted" style={{marginBottom: '2rem', fontSize: '0.875rem'}}>Hesabınızın güvenliği için lütfen varsayılan şifrenizi değiştirin.</p>
             {resetError && <div className="error-message">{resetError}</div>}
             <form onSubmit={handleReset}>
               <div className="form-group">
                  <label className="form-label">Yeni Şifre</label>
                  <input type="password" required className="form-input" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
               </div>
               <button type="submit" disabled={resetLoading} className="btn btn-primary" style={{width: '100%'}}>
                  {resetLoading ? <div className="loader"></div> : 'Şifreyi Güncelle'}
               </button>
             </form>
          </div>
        </div>
      );
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="brand">EA Yazılım</div>
        <div className="nav-links">
          <Link to="/" className="nav-item active">
            <LayoutDashboard size={18} />
            Talepler
          </Link>
          {userRole === 'super_admin' && (
            <Link to="/admins" className="nav-item">
              <Users size={18} />
              Yöneticiler
            </Link>
          )}
          <button onClick={handleSignOut} className="nav-item">
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </nav>

      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1 style={{marginBottom: '0.5rem'}}>Gelen Talepler</h1>
            <p className="text-muted">Web sitesi üzerinden gönderilen iletişim formları.</p>
          </div>
        </div>

        {roleError && (
          <div className="error-message" style={{marginBottom: '2rem'}}>
            <strong>Rol Kontrol Hatası:</strong> {roleError} <br/>
            Lütfen Supabase veritabanında <code>admin_roles</code> tablosunda UUID'nizin doğru eşleştiğinden ve <code>super_admin</code> yazdığından emin olun.
          </div>
        )}

        <div className="card table-container">
          {loading ? (
            <div className="empty-state">
              <div className="loader loader-dark"></div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="empty-state">
              Henüz bir form gönderilmemiş.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Durum</th>
                  <th>Tarih</th>
                  <th>Ad Soyad</th>
                  <th>İşletme Adı</th>
                  <th>Telefon</th>
                  <th>Paket</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>
                      {contact.is_read ? (
                        <span className="badge badge-read">Okundu</span>
                      ) : (
                        <span className="badge badge-new">Yeni</span>
                      )}
                    </td>
                    <td>{new Date(contact.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{fontWeight: 500}}>{contact.full_name}</td>
                    <td>{contact.business_name}</td>
                    <td>{contact.phone}</td>
                    <td>{contact.interested_package}</td>
                    <td>
                      {!contact.is_read && (
                        <button onClick={() => markAsRead(contact.id)} className="btn btn-sm btn-primary" style={{padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem'}}>
                          <CheckCircle size={14} /> Okundu İşaretle
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
