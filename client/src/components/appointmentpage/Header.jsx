import { CircleUser, House } from 'lucide-react';
import './Portal.css';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Header() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    const userDataLocal = localStorage.getItem('user');

    if (adminData) {
      setIsAdmin(true);
      setUserData(JSON.parse(adminData));
    } else if (userDataLocal) {
      setIsAdmin(false);
      setUserData(JSON.parse(userDataLocal));
    }
  }, []);

  const handleLogout = () => {
    if (isAdmin) {
      localStorage.removeItem('admin');
      navigate('/admin/login');
    } else {
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  return (
    <div>
        <div className='portal-header'>
        <div className='portal-header-left'>
          <CircleUser />
          <p>{isAdmin ? (userData.Admin_Name || 'Admin') : (userData.Username || 'User')}</p>
        </div>
        <div className='portal-header-right'>
          <Link to={isAdmin ? '/admin-portal' : '/portal'}>
            <House />
          </Link>
          <button 
            onClick={handleLogout} 
            className='logout-button'
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Header;