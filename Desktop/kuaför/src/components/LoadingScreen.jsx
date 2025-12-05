import React from 'react'
import { Scissors } from 'lucide-react'
import './LoadingScreen.css'

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <div className="logo-icon-wrapper">
            <Scissors className="logo-icon" />
          </div>
          <div className="logo-text">
            <h1>Hairlogy Yasin</h1>
            <span className="logo-premium">Premium</span>
          </div>
        </div>
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-text">Yükleniyor...</p>
      </div>
    </div>
  )
}

export default LoadingScreen
