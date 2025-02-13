import './MainPage.css';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

function Header({ isMenuOpen, toggleMenu, onFeaturesClick, onFaqClick }) {
    const location = useLocation();
    const isMainPage = location.pathname === '/';

    const handleNavClick = (e, callback) => {
        e.preventDefault();
        if (isMainPage) {
            callback();
        }
    };

    return (
        <>
            <div className='header'>
                <div className='header-title'>
                    <h1>Appointment System</h1>
                </div>
                <div className='header-menu'>
                    <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                        Get Started
                    </Link>
                    <a 
                        href="#features" 
                        onClick={(e) => handleNavClick(e, onFeaturesClick)}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        Features
                    </a>
                    <a 
                        href="#faq" 
                        onClick={(e) => handleNavClick(e, onFaqClick)}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        FAQ
                    </a>
                </div>

                <div className='header-menu-mobile' onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <div className='header-buttons'>
                    <Link to="/signup" className='header-buttons-signup'>Sign Up</Link>
                    <Link to="/login" className='header-buttons-login'>Log In</Link>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className='header-menu-mobile-dropdown'>
                    <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
                        Get Started
                    </Link>
                    <a 
                        href="#features" 
                        onClick={(e) => handleNavClick(e, onFeaturesClick)}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        Features
                    </a>
                    <a 
                        href="#faq" 
                        onClick={(e) => handleNavClick(e, onFaqClick)}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        FAQ
                    </a>
                </div>
            )}
        </>
    );
}

Header.propTypes = {
    isMenuOpen: PropTypes.bool.isRequired,
    toggleMenu: PropTypes.func.isRequired,
    onFeaturesClick: PropTypes.func.isRequired,
    onFaqClick: PropTypes.func.isRequired,
};

export default Header;