import './MainPage.css';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function MainPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const featuresRef = useRef(null);
    const faqRef = useRef(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    }

    const scrollToSection = (elementRef) => {
        elementRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const Slideshow = () => {
        const images = [
            '/assets/60edd0ca12f4f.image.jpg',
            '/assets/header-image_schedule-appointment-1920x1080.webp',
            '/assets/premium_photo-1663013439760-cb73ca606ae1.jpeg'
        ]

        const [index, setIndex] = useState(0)

        useEffect(() => {
            const interval = setInterval(() => {
                setIndex((prevIndex) =>
                    prevIndex === images.length - 1 ? 0 : prevIndex + 1);
            }, 5000)

            return () => clearInterval(interval);
        }, [images.length]);

        return (
            <div>
                <img src={images[index]} alt='slideshow' className='slideshow'/>
            </div>
        );
    };

    return (
        <div>
            <Header isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} onFeaturesClick={() => scrollToSection(featuresRef)} onFaqClick={() => scrollToSection(faqRef)}/>

            <div className='main-header' style={{ marginTop: isMenuOpen ? '150px' : '0' }}>
                <div className='main-header-image'>
                    <Slideshow/>
                </div>
                <div className='main-header-image-text'>
                    <h1>Appointment System</h1>
                    <p>Book Appointments With Ease</p>
                    <Link to='/login' className='main-header-image-text-button'>Get Started</Link>
                </div>
            </div>

            <div className='main-body'>
                <div className='main-body-features' ref={featuresRef}>
                    <div className='main-body-features-title'>
                        <h1>Features</h1>
                        <p>Tools Designed To Fit Your Schedule</p>
                        <hr/>
                    </div>
                    <div className='main-body-features-list'>
                        <div className='main-body-features-list1'>
                            <img src='/assets/PD01924_-_USEN_free_online_booking.avif' alt='feature1'/>
                            <h2>Easy Scheduling</h2>
                            <p>Book appointments with ease</p>
                        </div>
                        <div className='main-body-features-list2'>
                            <img src='/assets/PD01924_-_USEN_automated_email_and_text_reminders.avif' alt='feature2'/>
                            <h2>Reminder Emails</h2>
                            <p>Receive reminder emails</p>
                        </div>
                        <div className='main-body-features-list3'>
                            <img src='/assets/PD01924_-_USEN_customer_profiles_and_notes.avif' alt='feature3'/>
                            <h2>Customization</h2>
                            <p>Customize your appointments</p>
                        </div>
                        <div className='main-body-features-list4'>
                            <img src='/assets/PD01924_-_USEN_unlimited_sets_of_permissions.avif' alt='feature4'/>
                            <h2>Secure</h2>
                            <p>Secure appointments</p>
                        </div>
                    </div>
                </div>
                <div className='main-body-faq' ref={faqRef}>
                    <div className='main-body-faq-title'>
                        <h1>FAQ</h1>
                        <p>Question you might have, answered all in one place</p>
                        <hr/>
                    </div>
                    <div className='main-body-faq-list'>
                        <div className='main-body-faq-list1'>
                            <h2>How do I book an appointment?</h2>
                            <p>Simply click on the &apos;Get Started&apos; button on the homepage and follow the instructions.</p>
                        </div>
                        <div className='main-body-faq-list2'>
                            <h2>How do I cancel an appointment?</h2>
                            <p>Click on the &apos;Cancel Appointment&apos; button on the homepage and follow the instructions.</p>
                        </div>
                        <div className='main-body-faq-list3'>
                            <h2>How do I receive a reminder email?</h2>
                            <p>When you book an appointment, you will be asked to provide an email address. A reminder email will be sent to that email address.</p>
                        </div>
                        <div className='main-body-faq-list4'>
                            <h2>Is my information secure?</h2>
                            <p>Yes, your information is secure. We do not share your information with any third party.</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div>
    )
}

export default MainPage;