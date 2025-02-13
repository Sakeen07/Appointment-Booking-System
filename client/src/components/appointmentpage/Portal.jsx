import './Portal.css'
import Footer from '../mainpage/Footer'
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { getAppointment } from '../../api-helpers/api-helpers';

function Portal() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    fetchAppointments();
  }, [navigate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const result = await getAppointment();
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

  const handleAppointmentClick = (appointment) => {
    // Log the appointment data being passed
    console.log('Clicking appointment:', appointment);
    
    navigate('/appointment', {
      state: {
        isEditing: true,
        appointmentData: {
          id: appointment.AppointmentID,
          description: appointment.Description,
          personName: appointment.PersonName,
          date: appointment.Date,
          time: appointment.Time
        }
      }
    });
  };

  const upcomingAppointments = appointments.filter(apt => 
    dayjs(`${apt.Date} ${apt.Time}`).isAfter(dayjs())
  );

  const pastAppointments = appointments.filter(apt => 
    dayjs(`${apt.Date} ${apt.Time}`).isBefore(dayjs())
  );

  const renderAppointment = (appointment) => (
    <div 
      className='portal-body-appointments-upcoming1' 
      key={appointment.AppointmentID}
      onClick={() => handleAppointmentClick(appointment)}
      style={{ cursor: 'pointer' }}
    >
      <div className='portal-body-appointments-upcoming1-left'>
        <h2>{appointment.Description}</h2>
        <p>{appointment.PersonName}</p>
      </div>
      <div className='portal-body-appointments-upcoming1-right'>
        <p>{appointment.Time}</p>
        <p>{appointment.Date}</p>
      </div>
    </div>
  );

  if (loading) return <div>Loading appointments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div> 
      <Header />
      <div className='portal-body'>
        <div className='portal-body-datepicker'>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['StaticDatePicker']}>
              <StaticDatePicker 
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slots={{
                  actionBar: () => null
                }}
                sx={{
                  '& .MuiPickersLayout-root': {
                    '& .MuiPickersToolbar-root': {
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '8px 0',
                    },
                    '& .MuiTypography-root': {
                      textAlign: 'center',
                    },
                    '& .MuiPickersCalendarHeader-root': {
                      '& .MuiTypography-root': {
                        fontSize: '0.875rem',
                      },
                    },
                  },
                }}
                slotProps={{
                  toolbar: {
                    toolbarTitle: "",
                    hidden: false,
                  }
                }}
              />
            </DemoContainer>
          </LocalizationProvider>
          <a href='/appointment' className='new-appointment-button'>Add New Appointment</a>
        </div>
        <div className='portal-body-appointments-upcoming'>
          <h1>Upcoming Appointments ({upcomingAppointments.length})</h1>
          <hr/>
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(appointment => renderAppointment(appointment))
          ) : (
            <p>No upcoming appointments</p>
          )}
        </div>
        <div className='portal-body-appointments-past'>
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

export default Portal;