import './SignupPage.css';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';
import { signup } from '../../api-helpers/api-helpers';
import { Link, useNavigate } from 'react-router-dom';

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({
    username: '',
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

    switch (name) {
      case 'username':
        newValue = value.replace(/\s/g, '');
        if (newValue.length > 0 && newValue.length < 3) {
          error = 'Username must be at least 3 characters';
        }
        break;

      case 'email':
        {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (value && !emailRegex.test(value)) {
            error = 'Please enter a valid email address';
          }
        }
        break;

      case 'password':
        newValue = value.replace(/\s/g, '');
        if (newValue.length > 0 && newValue.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        break;

      default:
        break;
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

    if (!formData.username || !formData.email || !formData.password) {
      setErrors(prev => ({
        ...prev,
        submit: 'All fields are required'
      }));
      setLoading(false);
      return;
    }

    try {
      const result = await signup(formData);
      if (result) {
        console.log("User registered successfully:", result);
        navigate('/login');
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: error.response?.data?.message || 'Registration failed. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='signup-container'>
      <h1>Create Account</h1>
      {errors.submit && <div className='error'>{errors.submit}</div>}
      <form className='signup-form' onSubmit={handleSubmit}>
        <div className="form-fields">
          <TextField 
            id="username" 
            name="username"
            label="Username" 
            variant="standard" 
            fullWidth
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
            autoComplete="username"
          />
          <TextField 
            id="email" 
            name="email"
            label="Email Address" 
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
            label="Password" 
            variant="standard"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
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
          disabled={loading || !formData.username || !formData.email || !formData.password}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </Button>
        <div className="login-link" style={{ marginTop: '20px', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
}

export default SignupPage;