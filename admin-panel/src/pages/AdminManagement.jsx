import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, LayoutDashboard, Users, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkRole();
  }, []);

  const checkRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return navigate('/login');
    
    const { data } = await supabase.from('admin_roles').select('*').eq('user_id', user.id).single();
    if (data?.role !== 'super_admin') {
      navigate('/');
    } else {
      fetchAdmins();
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('*');
        
      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    const generatedPassword = generatePassword();

    try {
      // Call Supabase Edge Function to securely create the user
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: { email: email, password: generatedPassword }
      });

      if (error) throw error;
      
      setCreatedUser({ email, password: generatedPassword });
      setEmail('');
      fetchAdmins();
    } catch (err) {
      alert('Kullanıcı oluşturulurken bir hata oluştu: ' + err.message + '\nLütfen Edge Function kurulu olduğundan emin olun.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="brand">EA Yazılım</div>
        <div className="nav-links">
          <Link to="/" className="nav-item">
            <LayoutDashboard size={18} />
            Talepler
          </Link>
          <Link to="/admins" className="nav-item active">
            <Users size={18} />
            Yöneticiler
          </Link>
          <button onClick={handleSignOut} className="nav-item">
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </nav>

      <main className="main-content">
        <div className="dashboard-header">
          <div>
            <h1 style={{marginBottom: '0.5rem'}}>Yönetici Yönetimi</h1>
            <p className="text-muted">Sisteme yeni yöneticiler ekleyin ve yetkilerini yönetin.</p>
          </div>
        </div>

        <div className="card" style={{padding: '2rem', marginBottom: '2rem'}}>
          <h2 style={{fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <UserPlus size={20} /> Yeni Yönetici Ekle
          </h2>
          
          {createdUser && (
             <div style={{background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #bbf7d0'}}>
                <strong>Başarılı!</strong> Yönetici oluşturuldu.<br/>
                E-posta: <strong>{createdUser.email}</strong><br/>
                Şifre: <strong style={{background: '#fff', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #ccc', marginLeft: '0.5rem'}}>{createdUser.password}</strong>
                <p style={{fontSize: '0.875rem', marginTop: '0.5rem'}}>Lütfen bu şifreyi kopyalayın. Bir daha gösterilmeyecektir. Kullanıcı ilk girişinde şifresini değiştirmeye zorlanacaktır.</p>
             </div>
          )}

          <form onSubmit={handleCreateAdmin} style={{display: 'flex', gap: '1rem', alignItems: 'flex-end'}}>
            <div className="form-group" style={{marginBottom: 0, flex: 1}}>
              <label className="form-label">E-posta Adresi</label>
              <input 
                type="email" 
                required 
                className="form-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yeni.admin@eayazilim.tr"
              />
            </div>
            <button type="submit" disabled={isCreating} className="btn btn-primary" style={{height: '42px'}}>
              {isCreating ? <div className="loader"></div> : 'Oluştur'}
            </button>
          </form>
        </div>

        <div className="card table-container">
          {loading ? (
            <div className="empty-state"><div className="loader loader-dark"></div></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Kullanıcı ID</th>
                  <th>Rol</th>
                  <th>Kayıt Tarihi</th>
                  <th>Şifre Sıfırlama Gerekli mi?</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.user_id}>
                    <td style={{fontFamily: 'monospace', fontSize: '0.875rem'}}>{admin.user_id}</td>
                    <td>
                       <span className={`badge ${admin.role === 'super_admin' ? 'badge-new' : 'badge-read'}`}>
                         {admin.role}
                       </span>
                    </td>
                    <td>{new Date(admin.created_at).toLocaleDateString('tr-TR')}</td>
                    <td>{admin.force_password_reset ? 'Evet' : 'Hayır'}</td>
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
