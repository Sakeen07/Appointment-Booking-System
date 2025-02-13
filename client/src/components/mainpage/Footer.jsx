import { Globe, Github, Linkedin, Instagram } from 'lucide-react';
import './MainPage.css';

function Footer() {
  return (
    <div className='footer'>
                <hr/>
                <div className='footer-header'>
                    <div className='footer-header-left'>
                        <Globe size={18} className="text-white" />
                        <p>United States (English)</p>
                    </div>
                    <div className='footer-header-right'>
                        <a href="https://github.com/sakeen07" target="_blank" rel="noopener noreferrer" className="social-link">
                        <Github size={20} />
                        </a>
                        <a href="https://linkedin.com/in/jaleel-sakeen-722285231" target="_blank" rel="noopener noreferrer" className="social-link">
                        <Linkedin size={20} />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                        <Instagram size={20} />
                        </a>
                    </div>
                </div>
                    <hr/>

                <div className='footer-footer'>
                    <div className='footer-footer-left'>
                        <p>© 2025 Appointment System</p>
                    </div>
                    <div className='footer-footer-right'>
                        <p>Privacy Policy</p>
                        <p>Service</p>
                        <p>Terms of Use</p>
                    </div>
                </div>
            </div>
  )
}

export default Footer