import './AdminLogin.css';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';
import { adminLogin } from '../../api-helpers/admin-api-helpers';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    submit: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    let newValue = value;
    let error = '';

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        error = 'Please enter a valid email address';
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    setErrors(prev => ({
      ...prev,
      [name]: error,
      submit: ''
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
        const result = await adminLogin({
            email: formData.email,
            password: formData.password
        });

        if (result) {
            console.log("Admin login successful");
            navigate('/admin-portal');
        }
    } catch (error) {
        setErrors(prev => ({
            ...prev,
            submit: error.message || 'Login failed. Please try again.'
        }));
    } finally {
        setLoading(false);
    }
};

  const isFormValid = () => {
    const isEmailValid = formData.email && !errors.email;
    const isPasswordEntered = formData.password.length > 0;
    return isEmailValid && isPasswordEntered;
  };

  return (
    <div className='admin-login-container'>
      <h1>Admin Login</h1>
      {errors.submit && (
        <div className="error-message">
          {errors.submit}
        </div>
      )}
      <form className='admin-login-form' onSubmit={handleSubmit}>
        <div className="form-fields">
          <TextField 
            id="email" 
            name="email"
            label="Admin Email" 
            variant="standard" 
            fullWidth
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            autoComplete="email"
          />
          <TextField 
            id="password" 
            name="password"
            label="Admin Password" 
            variant="standard"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </div>
        <Button 
          variant="contained" 
          color="primary" 
          type="submit"
          disabled={loading || !isFormValid()}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </div>
  );
}

export default AdminLogin;