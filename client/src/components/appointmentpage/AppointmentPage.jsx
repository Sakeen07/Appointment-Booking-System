import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import TextField from '@mui/material/TextField';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { createAppointment, updateAppointment, deleteAppointment, getBookedTimes } from '../../api-helpers/api-helpers';
import './AppointmentPage.css';
import Header from './Header';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

function AppointmentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const today = dayjs(new Date());
    
    const isEditing = Boolean(location.state?.isEditing);
    const appointmentData = location.state?.appointmentData || null;

    const [selectedDate, setSelectedDate] = useState(() => {
        if (isEditing && appointmentData?.date) {
            const date = dayjs(appointmentData.date);
            return date.isValid() ? date : today;
        }
        return today;
    });

    const [selectedTime, setSelectedTime] = useState(() => {
        if (isEditing && appointmentData?.time) {
            const time = dayjs(appointmentData.time, 'HH:mm');
            return time.isValid() ? time : null;
        }
        return null;
    });

    const [formData, setFormData] = useState({
        description: isEditing && appointmentData ? appointmentData.description || '' : '',
        personName: isEditing && appointmentData ? appointmentData.personName || '' : ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookedTimes, setBookedTimes] = useState([]);
    const [isLoadingTimes, setIsLoadingTimes] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const checkAuthentication = () => {
        const userData = localStorage.getItem('user');
        const adminData = localStorage.getItem('admin');
        return !!(userData || adminData);
    };

    useEffect(() => {
        if (!checkAuthentication()) {
            navigate('/login');
            return;
        }
        if (isEditing && !appointmentData) {
            navigate('/portal');
        }
    }, [isEditing, appointmentData, navigate]);

    useEffect(() => {
        const adminData = localStorage.getItem('admin');
        setIsAdmin(!!adminData);
    }, []);

    useEffect(() => {
        if (isEditing && !appointmentData?.id) {
            navigate('/portal');
        }
    }, [isEditing, appointmentData, navigate]);


    const fetchBookedTimes = async (date) => {
        if (!date) return;
        
        setIsLoadingTimes(true);
        try {
            const formattedDate = date.format('YYYY-MM-DD');
            const times = await getBookedTimes(formattedDate);
            
            const filteredTimes = times.filter(timeObj => {
                if (!isEditing) return true;
                return timeObj.appointmentId !== appointmentData?.id;
            });

            setBookedTimes(filteredTimes);
        } catch {
            setBookedTimes([]);
        } finally {
            setIsLoadingTimes(false);
        }
    };

    useEffect(() => {
        if (selectedDate) {
            fetchBookedTimes(selectedDate);
        }
    }, [selectedDate, isEditing, appointmentData?.id]);

    const handleInputChange = (event) => {
        const { id, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            if (!formData.description || !formData.personName || !selectedTime) {
                setError('Please fill in all fields and select a time');
                return;
            }

            const formattedDate = selectedDate.format('YYYY-MM-DD');
            // Format time as HH:mm and append :00 for seconds
            const formattedTime = selectedTime.format('HH:mm') + ':00';

            const appointmentPayload = {
                description: formData.description,
                personName: formData.personName,
                date: formattedDate,
                time: formattedTime
            };

            let result;
            if (isEditing && appointmentData?.id) {
                result = await updateAppointment(appointmentData.id, appointmentPayload);
            } else {
                result = await createAppointment(appointmentPayload);
            }

            if (result) {
                if (isAdmin){
                    navigate('/admin-portal');
                } else{
                    navigate('/portal');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} appointment`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!isEditing || !appointmentData?.id) return;

        const confirmed = window.confirm('Are you sure you want to delete this appointment?');
        if (!confirmed) return;

        try {
            setLoading(true);
            setError('');

            // Check if admin or user is logged in
            const adminData = localStorage.getItem('admin');
            const userData = localStorage.getItem('user');

            if (!adminData && !userData) {
                setError('Authentication required');
                return;
            }

            const result = await deleteAppointment(appointmentData.id);

            if (result) {
                // Redirect based on user type
                if (adminData) {
                    navigate('/admin-portal');
                } else {
                    navigate('/portal');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete appointment');
        } finally {
            setLoading(false);
        }
    };

    const shouldDisableTime = (time) => {
        if (!time || !time.isValid()) return false;
        
        const timeString = time.format('HH:mm');
        const now = dayjs();
        const selectedDateTime = selectedDate.hour(time.hour()).minute(time.minute());
        
        // Check if the date is today and time is in the past
        if (selectedDate.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')) {
            if (selectedDateTime.isBefore(now)) {
                return true;
            }
        }
        
        // Check if any booked time matches (comparing only hours and minutes)
        const isBooked = bookedTimes.some(bookedTime => {
            const bookedTimeString = dayjs(bookedTime.time, 'HH:mm:ss').format('HH:mm');
            return bookedTimeString === timeString;
        });
    
        return isBooked;
    };
    
    // Add this function to disable past dates
    const shouldDisableDate = (date) => {
        return date.isBefore(dayjs(), 'day');
    };


    return (
        <>
            <Header/>
            <div className='appointment-container'>
                <h1>{isEditing ? 'Edit Appointment' : 'New Appointment'}</h1>
                {error && <div className="error-message" style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
                <div className='appointment-form'>
                    <div className="form-fields">
                        <TextField 
                            id="description" 
                            label="Description" 
                            variant="standard" 
                            value={formData.description}
                            onChange={handleInputChange}
                            error={!!error && !formData.description}
                            helperText={!!error && !formData.description ? 'Description is required' : ''}
                            fullWidth
                            disabled={isAdmin}
                            InputProps={{
                                readOnly: isAdmin,
                            }}
                        />
                        <TextField 
                            id="personName" 
                            label="Company or Person Name" 
                            variant="standard" 
                            value={formData.personName}
                            onChange={handleInputChange}
                            error={!!error && !formData.personName}
                            helperText={!!error && !formData.personName ? 'Person name is required' : ''}
                            fullWidth
                            disabled={isAdmin}
                            InputProps={{
                                readOnly: isAdmin,
                            }}
                        />
                    </div>
                    <div className='portal-body-datepicker'>
                        <p>Date Selection: </p>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['StaticDatePicker']}>
                                <StaticDatePicker 
                                    value={selectedDate}
                                    onChange={(newValue) => {
                                        if (newValue && newValue.isValid()) {
                                            setSelectedDate(newValue);
                                            setSelectedTime(null);
                                        }
                                    }}
                                    shouldDisableDate={shouldDisableDate}
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
                        <p>Time Selection:</p>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['TimePicker']}>
                                <TimePicker 
                                    label={isLoadingTimes ? "Loading times..." : "Click Here"}
                                    value={selectedTime}
                                    onChange={(newValue) => {
                                        if (newValue && newValue.isValid()) {
                                            setSelectedTime(newValue);
                                        }
                                    }}
                                    shouldDisableTime={shouldDisableTime}
                                    views={['hours', 'minutes']}
                                    format="HH:mm"
                                    disabled={!selectedDate || isLoadingTimes}
                                    slotProps={{
                                        textField: {
                                            helperText: isLoadingTimes 
                                                ? 'Loading available times...' 
                                                : 'Select an available time slot'
                                        }
                                    }}
                                />
                            </DemoContainer>
                        </LocalizationProvider>
                        <div className="button-group" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            marginTop: '20px',
                            width: '100%'
                        }}>
                            <button 
                                className='add-button' 
                                onClick={handleSubmit}
                                disabled={loading || !formData.description || !formData.personName || !selectedTime}
                                style={{
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    width: '40%',
                                    alignSelf: 'center'
                                }}
                            >
                                {loading ? 'Processing...' : isEditing ? 'Update' : 'Add'}
                            </button>

                            {isEditing && (
                                <button 
                                    className='delete-button'
                                    onClick={handleDelete}
                                    disabled={loading}
                                    style={{
                                        backgroundColor: '#dc3545',
                                        color: 'white',
                                        padding: '10px 20px',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        width: '40%',
                                        alignSelf: 'center'
                                    }}
                                >
                                    {loading ? 'Processing...' : 'Delete'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AppointmentPage;