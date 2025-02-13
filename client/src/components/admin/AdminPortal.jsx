import { CircleUser, House } from 'lucide-react';
import './AdminPortal.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getAllAppointments, adminLogout } from '../../api-helpers/admin-api-helpers';
import { Link } from 'react-router-dom';
import Footer from '../mainpage/Footer';

function AdminPortal() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      navigate('/admin/login');
      return;
    }

    const admin = JSON.parse(adminData);
    setAdminName(admin.Admin_Name || 'Admin');

    fetchAllAppointments();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const result = await adminLogout();
      if (result) {
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Logout failed. Please try again.');
    }
  };

  const fetchAllAppointments = async () => {
    try {
      setLoading(true);
      const result = await getAllAppointments();
      if (result) {
        const sorted = result.sort((a, b) => {
          return dayjs(`${a.Date} ${a.Time}`).diff(dayjs(`${b.Date} ${b.Time}`));
        });
        setAppointments(sorted);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    dayjs(`${apt.Date} ${apt.Time}`).isAfter(dayjs())
  );

  const pastAppointments = appointments.filter(apt => 
    dayjs(`${apt.Date} ${apt.Time}`).isBefore(dayjs())
  );

  const handleAppointmentClick = (appointment) => {
    navigate('/appointment', {
      state: {
        isEditing: true,
        appointmentData: {
          id: appointment.AppointmentID,
          description: appointment.Description,
          personName: appointment.PersonName,
          date: dayjs(appointment.Date).format('YYYY-MM-DD'),
          time: appointment.Time
        }
      }
    });
  };

  const renderAppointment = (appointment) => (
    <div 
      className='portal-admin-body-appointments-upcoming1' 
      key={appointment.AppointmentID}
      onClick={() => handleAppointmentClick(appointment)}
      style={{ cursor: 'pointer' }}
    >
      <div className='portal-admin-body-appointments-upcoming1-left'>
        <h2>{appointment.Username}</h2>
        <h2>{appointment.Description}</h2>
        <p>{appointment.PersonName}</p>
      </div>
      <div className='portal-admin-body-appointments-upcoming1-right'>
        <p>{appointment.Time}</p>
        <p>{appointment.Date}</p>
      </div>
    </div>
  );

  if (loading) return <div>Loading appointments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="portal-admin-header">
        <div className="portal-admin-header-left">
            <CircleUser />
            <p>Welcome Admin, {adminName}</p>
        </div>
        <div className="portal-admin-header-right">
        <Link to='/admin-portal'>
          <House />
          </Link>
            <button 
                className="logout-button"
                onClick={handleLogout}
                style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'background-color 0.2s ease'
                }}
            >
                Log Out
            </button>
        </div>
      </div>
      <div className="portal-admin-body">
        <div className='portal-admin-body-appointments-upcoming'>
          <h1>Upcoming Appointments ({upcomingAppointments.length})</h1>
          <hr/>
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(appointment => renderAppointment(appointment))
          ) : (
            <p>No upcoming appointments</p>
          )}
        </div>
        <div className='portal-admin-body-appointments-past'>
          <h1>Past Appointments ({pastAppointments.length})</h1>
          <hr/>
          {pastAppointments.length > 0 ? (
            pastAppointments.map(appointment => renderAppointment(appointment))
          ) : (
            <p>No past appointments</p>
          )}
        </div>
      </div>
      <Footer/>  
    </div>
  );
}

export default AdminPortal;
