import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Scissors } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import './BarberSelectPage.css'

const barbers = [
  {
    id: 1,
    name: 'Hıdır Yasin Gökçeoğlu',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    experience: '15+ Yıl Deneyim',
    specialty: 'Klasik & Modern Kesimler'
  },
  {
    id: 2,
    name: 'Emir Gökçeoğlu',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    experience: '10+ Yıl Deneyim',
    specialty: 'Fade & Sakal Tasarımı'
  }
]

function BarberSelectPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()

  const handleBarberSelect = (barberId) => {
    navigate(`/randevu/${barberId}`)
  }

  return (
    <div className="barber-select-page">
      <header className="barber-select-header">
        <div className="container">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            {t('booking.back')}
          </button>
          <h1>Usta Seçin</h1>
        </div>
      </header>

      <main className="barber-select-main">
        <div className="container">
          <div className="barber-select-content">
            <p className="select-description">Randevu almak için bir usta seçin</p>
            
            <div className="barbers-grid">
              {barbers.map((barber) => (
                <div
                  key={barber.id}
                  className="barber-card greek-key-corner"
                  onClick={() => handleBarberSelect(barber.id)}
                >
                  <div className="barber-image-wrapper">
                    <img src={barber.image} alt={barber.name} />
                    <div className="barber-overlay">
                      <Scissors size={32} />
                    </div>
                  </div>
                  <div className="barber-info">
                    <h3>{barber.name}</h3>
                    <p className="barber-experience">{barber.experience}</p>
                    <p className="barber-specialty">{barber.specialty}</p>
                  </div>
                  <button className="select-barber-btn">
                    Randevu Al
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default BarberSelectPage

