import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scissors, Clock, Instagram, Facebook, Star, Globe } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import './HomePage.css'

const barbers = [
  {
    id: 1,
    name: 'Hıdır Yasin Gökçeoğlu',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
  },
  {
    id: 2,
    name: 'Emir Gökçeoğlu',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
  }
]

const services = [
  { id: 1, name: 'Saç Kesimi', duration: 30, price: 150 },
  { id: 2, name: 'Saç ve Sakal', duration: 45, price: 200 },
  { id: 3, name: 'Sakal', duration: 20, price: 100 },
  { id: 4, name: 'Çocuk Tıraşı', duration: 25, price: 120 },
  { id: 5, name: 'Bakım/Mask', duration: 30, price: 180 }
]

const galleryImages = [
  { id: 1, image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop', title: 'Modern Kesim' },
  { id: 2, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop', title: 'Fade Tasarımı' },
  { id: 3, image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop', title: 'Klasik Tıraş' },
  { id: 4, image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop', title: 'Sakal Tasarımı' },
  { id: 5, image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop', title: 'Premium Hizmet' },
  { id: 6, image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=400&fit=crop', title: 'Özel Kesim' }
]


function HomePage() {
  const navigate = useNavigate()
  const { language, changeLanguage, t } = useLanguage()
  const [socialMediaOpen, setSocialMediaOpen] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const sectionsRef = useRef([])

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    }, observerOptions)

    sectionsRef.current.forEach(section => {
      if (section) observer.observe(section)
    })

    return () => {
      sectionsRef.current.forEach(section => {
        if (section) observer.unobserve(section)
      })
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show header when at top or scrolling up
      if (currentScrollY < 50) {
        setHeaderVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Hide header when scrolling down past 100px
        setHeaderVisible(false)
      } else if (currentScrollY < lastScrollY) {
        // Show header when scrolling up
        setHeaderVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  const handleWhatsAppClick = () => {
    const phoneNumber = '905551234567'
    const message = encodeURIComponent(t('whatsapp.message'))
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
  }

  const handleLanguageChange = (lang) => {
    changeLanguage(lang)
  }

  return (
    <div className="home-page">
      {/* Header */}
      <header className={`header ${headerVisible ? 'visible' : 'hidden'}`}>
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon-wrapper">
                <Scissors className="logo-icon" />
              </div>
              <div className="logo-text">
                <h1>{t('header.title')}</h1>
                <span className="logo-premium">{t('header.premium')}</span>
              </div>
            </div>
            <div className="header-actions">
              <button 
                className="book-appointment-btn"
                onClick={() => navigate('/berber-sec')}
              >
                {t('header.bookAppointment')}
              </button>
              <div className="language-selector">
                <button
                  className={`lang-btn ${language === 'tr' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('tr')}
                >
                  TR
                </button>
                <button
                  className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                  onClick={() => handleLanguageChange('en')}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Barbers */}
      <section 
        id="ustalar" 
        className="hero-barbers-section greek-key-bg"
        ref={el => sectionsRef.current[0] = el}
      >
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                {t('hero.title')} <span className="hero-accent">{t('hero.titleAccent')}</span> {t('hero.subtitle')}
              </h1>
              <p className="hero-description">
                {t('hero.description')}
              </p>
            </div>
          </div>
          
          <div className="barbers-showcase">
            {barbers.map((barber, index) => (
              <div 
                key={barber.id} 
                className={`barber-showcase-card ${index % 2 === 0 ? 'left-align' : 'right-align'}`}
                onClick={() => navigate(`/randevu/${barber.id}`)}
              >
                <div className="barber-showcase-image">
                  <img src={barber.image} alt={barber.name} />
                  <div className="barber-showcase-overlay"></div>
                  <div className="barber-showcase-number">0{barber.id}</div>
                </div>
                <div className="barber-showcase-content">
                  <div className="barber-showcase-name-wrapper">
                    <h3 className="barber-showcase-name">{barber.name}</h3>
                    <div className="barber-showcase-line"></div>
                  </div>
                  <p className="barber-showcase-role">{t('hero.barberRole')}</p>
                  <button 
                    className="barber-showcase-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/randevu/${barber.id}`)
                    }}
                  >
                    <span>{t('hero.bookAppointment')}</span>
                    <Scissors size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campaigns & Working Hours Combined */}
      <section className="info-showcase-section">
        <div className="container">
          <div className="info-showcase-grid">
            <div className="working-hours-card">
              <div className="working-hours-header">
                <Clock size={32} />
                <h3>{t('workingHours.title')}</h3>
              </div>
              <div className="working-hours-list">
                <div className="working-hours-item">
                  <span className="working-hours-day">{t('workingHours.weekdays')}</span>
                  <span className="working-hours-time">09:00 - 20:00</span>
                </div>
                <div className="working-hours-item">
                  <span className="working-hours-day">{t('workingHours.weekend')}</span>
                  <span className="working-hours-time closed">{t('workingHours.closed')}</span>
                </div>
                <div className="working-hours-break">
                  <span>{t('workingHours.lunchBreak')}</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Testimonials Section - Slanted Design */}
      <section 
        id="yorumlar" 
        className="testimonials-modern-section"
        ref={el => sectionsRef.current[1] = el}
      >
        <div className="container">
          <div className="testimonials-modern-header">
            <h2 className="testimonials-modern-title">{t('testimonials.title')}</h2>
            <p className="testimonials-modern-subtitle">{t('testimonials.subtitle')}</p>
          </div>
          <div className="testimonials-modern-grid">
            {t('testimonialsData').map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className={`testimonial-modern-card ${index % 2 === 0 ? 'testimonial-slant-left' : 'testimonial-slant-right'}`}
              >
                <div className="testimonial-modern-quote">"</div>
                <div className="testimonial-modern-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} fill="#FFD700" color="#FFD700" />
                  ))}
                </div>
                <p className="testimonial-modern-comment">{testimonial.comment}</p>
                <div className="testimonial-modern-author">
                  <div className="testimonial-modern-author-info">
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        id="iletisim" 
        className="contact-section"
        ref={el => sectionsRef.current[2] = el}
      >
        <div className="container">
          <h2 className="section-title">{t('contact.title')}</h2>
          <div className="contact-grid">
            <div className="contact-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.424742123456!2d28.9784!3d41.0082!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAwJzI5LjUiTiAyOMKwNTgnNDIuMiJF!5e0!3m2!1str!2str!4v1234567890123!5m2!1str!2str"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>{t('footer.copyright')}</p>
        </div>
      </footer>

      {/* WhatsApp Button */}
      <button className="whatsapp-button" onClick={handleWhatsAppClick}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </button>

      {/* Social Media Sidebar */}
      <div className={`social-sidebar ${socialMediaOpen ? 'open' : ''}`}>
        <div className="social-sidebar-content">
          <div className="social-sidebar-header">
            <h3>{t('socialMedia.title')}</h3>
          </div>
          <a 
            href="https://www.instagram.com" 
            className="social-sidebar-link" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <Instagram size={24} />
            <span>Instagram</span>
          </a>
          <a 
            href="https://www.facebook.com" 
            className="social-sidebar-link" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Facebook"
          >
            <Facebook size={24} />
            <span>Facebook</span>
          </a>
          <a 
            href="https://www.tiktok.com" 
            className="social-sidebar-link" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="TikTok"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
            <span>TikTok</span>
          </a>
        </div>
        <button 
          className="social-sidebar-toggle" 
          onClick={() => setSocialMediaOpen(!socialMediaOpen)}
          aria-label="Toggle Social Media"
        >
          <div className="social-toggle-content">
            <Instagram size={18} />
            <Facebook size={18} />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
          </div>
        </button>
      </div>
    </div>
  )
}

export default HomePage
