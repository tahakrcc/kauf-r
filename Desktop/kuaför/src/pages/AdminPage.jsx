import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Calendar, Users, DollarSign, CheckCircle, XCircle, Clock, Trash2, Filter, Send, Phone, MessageSquare } from 'lucide-react'
import { adminAPI } from '../services/api'
import './AdminPage.css'

function AdminPage() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [showAllBookings, setShowAllBookings] = useState(false)
  const [showMobileView, setShowMobileView] = useState(false)
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({
    status: '',
    barberId: '',
    date: ''
  })
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [closedDates, setClosedDates] = useState([])
  const [showClosedDateForm, setShowClosedDateForm] = useState(false)
  const [closedDateForm, setClosedDateForm] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      // Check backend connection first
      checkBackendConnection().then(() => {
        loadBookings()
        loadStats()
        loadClosedDates()
      })

      // Auto-refresh bookings and stats every 5 seconds when page is visible
      const interval = setInterval(() => {
        if (!document.hidden) {
          loadBookings()
          loadStats()
        }
      }, 5000)

      // Refresh when page becomes visible
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          loadBookings()
          loadStats()
        }
      }

      // Refresh when window gains focus
      const handleFocus = () => {
        loadBookings()
        loadStats()
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('focus', handleFocus)

      return () => {
        clearInterval(interval)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('focus', handleFocus)
      }
    }
  }, [isAuthenticated])

  // Reload bookings when filters change
  useEffect(() => {
    if (isAuthenticated) {
      loadBookings()
    }
  }, [filters, showAllBookings])

  const checkBackendConnection = async () => {
    try {
      const response = await fetch('/api/health')
      if (!response.ok) {
        throw new Error('Backend health check failed')
      }
      const data = await response.json()
      console.log('Backend connection OK:', data)
    } catch (error) {
      console.error('Backend connection failed:', error)
      alert('Backend sunucusuna bağlanılamıyor!\n\nLütfen backend\'in çalıştığından emin olun:\ncd server && npm start')
    }
  }

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken')
    const username = localStorage.getItem('adminUsername')
    const barberId = localStorage.getItem('adminBarberId')
    if (token) {
      setIsAuthenticated(true)
      if (username) {
        setCurrentUser(username)
      }
      // Set default filter to user's barber_id if exists and showAllBookings is false
      if (barberId) {
        const showAll = localStorage.getItem('showAllBookings') === 'true'
        setShowAllBookings(showAll)
        if (!showAll) {
          setFilters(prev => ({ ...prev, barberId: String(barberId) }))
        }
      }
    }
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await adminAPI.login(loginForm.username, loginForm.password)
      localStorage.setItem('adminToken', response.data.token)
      localStorage.setItem('adminUsername', response.data.username)
      if (response.data.barber_id) {
        localStorage.setItem('adminBarberId', response.data.barber_id)
        // Set default filter to user's barber_id (only if showAllBookings is false)
        if (!showAllBookings) {
          setFilters(prev => ({ ...prev, barberId: String(response.data.barber_id) }))
        }
      }
      setCurrentUser(response.data.username)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Giriş başarısız'
      const errorStatus = error.response?.status
      
      console.error('Login error details:', {
        message: errorMessage,
        status: errorStatus,
        code: error.code,
        response: error.response?.data
      })
      
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        alert('Backend sunucusuna bağlanılamıyor.\n\nLütfen backend\'in çalıştığından emin olun:\ncd server && npm start')
      } else if (errorStatus === 401) {
        alert('Kullanıcı adı veya şifre hatalı.\n\nKullanıcılar: yasin/admin123 veya emir/admin123')
      } else {
        alert(`Giriş hatası: ${errorMessage}\n\nStatus: ${errorStatus || 'N/A'}`)
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUsername')
    localStorage.removeItem('adminBarberId')
    setCurrentUser(null)
    setShowAllBookings(false)
    setIsAuthenticated(false)
    setBookings([])
    setStats(null)
  }

  const loadBookings = async (showAll = showAllBookings) => {
    try {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.barberId) params.barberId = filters.barberId
      if (filters.date) params.date = filters.date
      if (showAll) params.showAll = 'true'

      const response = await adminAPI.getBookings(params)
      setBookings(response.data)
    } catch (error) {
      console.error('Load bookings error:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      })
      
      if (error.response?.status === 401) {
        handleLogout()
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        alert('Backend sunucusuna bağlanılamıyor. Lütfen backend\'in çalıştığından emin olun.\n\nHata: ' + error.message)
      } else {
        const errorMsg = error.response?.data?.error || error.message || 'Bilinmeyen hata'
        alert('Randevular yüklenirken hata oluştu:\n\n' + errorMsg)
      }
    }
  }

  const loadStats = async () => {
    try {
      const response = await adminAPI.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Load stats error:', error)
      console.error('Stats error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
    }
  }

  const loadClosedDates = async () => {
    try {
      const response = await adminAPI.getClosedDates()
      setClosedDates(response.data)
    } catch (error) {
      console.error('Load closed dates error:', error)
    }
  }

  const handleCreateClosedDate = async (e) => {
    e.preventDefault()
    try {
      const response = await adminAPI.createClosedDate(closedDateForm)
      console.log('Closed date created:', response.data)
      setClosedDateForm({ start_date: '', end_date: '', reason: '' })
      setShowClosedDateForm(false)
      loadClosedDates()
      alert('Kapalı tarih aralığı başarıyla eklendi')
    } catch (error) {
      console.error('Create closed date error:', error)
      console.error('Error response:', error.response?.data)
      const errorMsg = error.response?.data?.error || error.message || 'Bilinmeyen hata'
      const overlaps = error.response?.data?.overlaps
      if (overlaps && overlaps.length > 0) {
        alert(`Kapalı tarih eklenirken hata oluştu:\n\n${errorMsg}\n\nÇakışan tarih aralıkları:\n${overlaps.map(o => `${o.start_date} - ${o.end_date}`).join('\n')}`)
      } else {
        alert(`Kapalı tarih eklenirken hata oluştu:\n\n${errorMsg}`)
      }
    }
  }

  const handleDeleteClosedDate = async (id) => {
    if (!confirm('Bu kapalı tarih aralığını silmek istediğinize emin misiniz?')) {
      return
    }
    try {
      await adminAPI.deleteClosedDate(id)
      loadClosedDates()
      alert('Kapalı tarih aralığı başarıyla silindi')
    } catch (error) {
      alert('Kapalı tarih silinirken hata oluştu')
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminAPI.updateBooking(id, newStatus)
      loadBookings()
      loadStats()
    } catch (error) {
      alert('Durum güncellenirken hata oluştu')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu randevuyu silmek istediğinize emin misiniz?')) {
      return
    }
    try {
      await adminAPI.deleteBooking(id)
      loadBookings()
      loadStats()
    } catch (error) {
      alert('Randevu silinirken hata oluştu')
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Bu randevuyu iptal etmek istediğinize emin misiniz?')) {
      return
    }
    try {
      await adminAPI.updateBooking(id, 'cancelled')
      loadBookings()
      loadStats()
      alert('Randevu iptal edildi')
    } catch (error) {
      alert('Randevu iptal edilirken hata oluştu')
    }
  }

  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`
  }

  const handleMessage = (phone) => {
    // WhatsApp mesajı gönder
    const message = encodeURIComponent('Merhaba, randevunuz hakkında bilgilendirme yapmak istiyoruz.')
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank')
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Beklemede', color: 'warning', icon: Clock },
      confirmed: { label: 'Onaylandı', color: 'info', icon: CheckCircle },
      completed: { label: 'Tamamlandı', color: 'success', icon: CheckCircle },
      cancelled: { label: 'İptal', color: 'error', icon: XCircle }
    }
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
      <span className={`status-badge ${config.color}`}>
        <Icon size={14} />
        {config.label}
      </span>
    )
  }

  if (loading) {
    return <div className="admin-loading">Yükleniyor...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <h1>Admin Girişi</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Kullanıcı Adı</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                autoComplete="username"
                required
              />
            </div>
            <div className="form-group">
              <label>Şifre</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button type="submit" className="login-btn">Giriş Yap</button>
          </form>
          <p className="login-note">Kullanıcılar: yasin/admin123 veya emir/admin123</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container">
          <div>
            <h1>Admin Paneli</h1>
            {currentUser && <p className="admin-user-info">Giriş: {currentUser}</p>}
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      </header>

      <main className="admin-main">
        <div className="container">
          {stats && (
            <div className="stats-grid">
              <div className="stat-card greek-key-corner">
                <Calendar className="stat-icon" />
                <div>
                  <h3>{stats.totalBookings}</h3>
                  <p>Toplam Randevu</p>
                </div>
              </div>
              <div className="stat-card greek-key-corner">
                <Clock className="stat-icon" />
                <div>
                  <h3>{stats.todayBookings}</h3>
                  <p>Bugünkü Randevular</p>
                </div>
              </div>
              <div className="stat-card greek-key-corner">
                <DollarSign className="stat-icon" />
                <div>
                  <h3>{stats.totalRevenue.toFixed(2)}₺</h3>
                  <p>Toplam Gelir</p>
                </div>
              </div>
              <div className="stat-card greek-key-corner">
                <Users className="stat-icon" />
                <div>
                  <h3>{stats.bookingsByStatus?.find(s => s.status === 'pending')?.count || 0}</h3>
                  <p>Bekleyen Randevular</p>
                </div>
              </div>
            </div>
          )}

          {/* Gelir Trend Tablosu */}
          {stats?.revenueByBarber && (
            <div className="bookings-section revenue-section" style={{ marginTop: '30px' }}>
              <div className="section-header">
                <h2>Gelir Trend Analizi</h2>
              </div>
              
              <div className="revenue-grid">
                {[1, 2].map((barberId) => {
                  const barberData = stats.revenueByBarber[barberId];
                  if (!barberData) return null;
                  
                  const trends = barberData.trends || [];
                  const last7Days = trends.slice(-7);
                  const previous7Days = trends.slice(-14, -7);
                  
                  const last7Total = last7Days.reduce((sum, day) => sum + day.revenue, 0);
                  const previous7Total = previous7Days.reduce((sum, day) => sum + day.revenue, 0);
                  const change = last7Total - previous7Total;
                  const changePercent = previous7Total > 0 ? ((change / previous7Total) * 100).toFixed(1) : 0;
                  
                  return (
                    <div key={barberId} className="revenue-card">
                      <h3 className="revenue-card-title">{barberData.name}</h3>
                      
                      <div className="revenue-stats-grid">
                        <div className="revenue-stat-item">
                          <div className="revenue-stat-label">Toplam Gelir</div>
                          <div className="revenue-stat-value">{barberData.total.toFixed(2)}₺</div>
                        </div>
                        <div className="revenue-stat-item">
                          <div className="revenue-stat-label">Son 7 Gün Değişim</div>
                          <div className={`revenue-stat-change ${change >= 0 ? 'positive' : 'negative'}`}>
                            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}₺ ({changePercent}%)
                          </div>
                        </div>
                      </div>
                      
                      {/* Desktop Table */}
                      <div className="bookings-table-container desktop-view">
                        <table className="bookings-table revenue-table">
                          <thead>
                            <tr>
                              <th>Tarih</th>
                              <th>Gelir</th>
                              <th>Değişim</th>
                            </tr>
                          </thead>
                          <tbody>
                            {last7Days.length === 0 ? (
                              <tr>
                                <td colSpan="3" className="no-data">Veri bulunamadı</td>
                              </tr>
                            ) : (
                              last7Days.map((day, index) => {
                                const prevDay = index > 0 ? last7Days[index - 1] : null;
                                const dayChange = prevDay ? day.revenue - prevDay.revenue : 0;
                                const dayChangePercent = prevDay && prevDay.revenue > 0 
                                  ? ((dayChange / prevDay.revenue) * 100).toFixed(1) 
                                  : 0;
                                
                                return (
                                  <tr key={day.date}>
                                    <td>{new Date(day.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}</td>
                                    <td><strong>{day.revenue.toFixed(2)}₺</strong></td>
                                    <td className={dayChange >= 0 ? 'positive' : 'negative'}>
                                      {prevDay ? (
                                        <>
                                          {dayChange >= 0 ? '↑' : '↓'} {Math.abs(dayChange).toFixed(2)}₺ ({dayChangePercent}%)
                                        </>
                                      ) : '-'}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile List */}
                      <div className="revenue-mobile-list mobile-view">
                        {last7Days.length === 0 ? (
                          <div className="no-data-mobile">Veri bulunamadı</div>
                        ) : (
                          last7Days.map((day, index) => {
                            const prevDay = index > 0 ? last7Days[index - 1] : null;
                            const dayChange = prevDay ? day.revenue - prevDay.revenue : 0;
                            const dayChangePercent = prevDay && prevDay.revenue > 0 
                              ? ((dayChange / prevDay.revenue) * 100).toFixed(1) 
                              : 0;
                            
                            return (
                              <div key={day.date} className="revenue-mobile-item">
                                <div className="revenue-mobile-date">
                                  {new Date(day.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long' })}
                                </div>
                                <div className="revenue-mobile-amount">{day.revenue.toFixed(2)}₺</div>
                                {prevDay && (
                                  <div className={`revenue-mobile-change ${dayChange >= 0 ? 'positive' : 'negative'}`}>
                                    {dayChange >= 0 ? '↑' : '↓'} {Math.abs(dayChange).toFixed(2)}₺ ({dayChangePercent}%)
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bookings-section">
            <div className="section-header">
              <h2>Randevular</h2>
              <div className="header-actions-group">
                <label className="show-all-toggle">
                  <input
                    type="checkbox"
                    checked={showAllBookings}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setShowAllBookings(checked)
                      localStorage.setItem('showAllBookings', checked ? 'true' : 'false')
                      // If unchecking "show all", set filter to user's barber_id
                      if (!checked) {
                        const barberId = localStorage.getItem('adminBarberId')
                        if (barberId) {
                          setFilters(prev => ({ ...prev, barberId: String(barberId) }))
                        }
                      } else {
                        // If checking "show all", clear barber filter
                        setFilters(prev => ({ ...prev, barberId: '' }))
                      }
                      loadBookings(checked)
                    }}
                  />
                  <span>Tüm Randevuları Göster</span>
                </label>
                <button 
                  onClick={() => setShowMobileView(!showMobileView)} 
                  className="refresh-btn"
                  style={{ marginLeft: '10px' }}
                >
                  {showMobileView ? 'Tablo Görünümü' : 'Kart Görünümü'}
                </button>
                <button onClick={() => loadBookings(showAllBookings)} className="refresh-btn">Yenile</button>
              </div>
            </div>

            <div className="filters">
              <div className="filter-group">
                <Filter size={18} />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">Tüm Durumlar</option>
                  <option value="pending">Beklemede</option>
                  <option value="confirmed">Onaylandı</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal</option>
                </select>
              </div>
              <div className="filter-group">
                <select
                  value={filters.barberId}
                  onChange={(e) => setFilters({ ...filters, barberId: e.target.value })}
                >
                  <option value="">Tüm Berberler</option>
                  <option value="1">Hıdır Yasin Gökçeoğlu</option>
                  <option value="2">Emir Gökçeoğlu</option>
                </select>
              </div>
              <div className="filter-group">
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                />
              </div>
            </div>

            {/* Desktop Table View */}
            <div className={`bookings-table-container desktop-view ${showMobileView ? 'hidden' : ''}`}>
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Müşteri</th>
                    <th>Berber</th>
                    <th>Hizmet</th>
                    <th>Tarih</th>
                    <th>Saat</th>
                    <th>Fiyat</th>
                    <th>Oluşturulma</th>
                    <th>Durum</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="no-data">Randevu bulunamadı</td>
                    </tr>
                  ) : (
                    bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <div>
                            <strong>{booking.customer_name}</strong>
                            <br />
                            <small>{booking.customer_phone}</small>
                          </div>
                        </td>
                        <td>{booking.barber_name}</td>
                        <td>{booking.service_name}</td>
                        <td>{booking.appointment_date}</td>
                        <td>{booking.appointment_time}</td>
                        <td>{booking.service_price}₺</td>
                        <td>
                          {booking.created_at ? (
                            <div>
                              <div>{new Date(booking.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                              <small style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                {new Date(booking.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                              </small>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>{getStatusBadge(booking.status)}</td>
                        <td>
                          <div className="action-buttons">
                            {booking.status !== 'cancelled' && (
                              <>
                                <button
                                  onClick={() => handleCall(booking.customer_phone)}
                                  className="btn-call"
                                  title="Ara"
                                >
                                  <Phone size={16} />
                                </button>
                                <button
                                  onClick={() => handleMessage(booking.customer_phone)}
                                  className="btn-message"
                                  title="Mesaj Gönder"
                                >
                                  <MessageSquare size={16} />
                                </button>
                              </>
                            )}
                            {booking.status !== 'cancelled' && (
                              <button
                                onClick={() => handleCancel(booking.id)}
                                className="btn-cancel"
                                title="İptal Et"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(booking.id)}
                              className="btn-delete"
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Compact List View */}
            <div className={`bookings-mobile-list mobile-view ${showMobileView ? 'desktop-mobile-view' : ''}`}>
              {bookings.length === 0 ? (
                <div className="no-data-mobile">
                  <p>Randevu bulunamadı</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="booking-mobile-item">
                    <div className="booking-mobile-main">
                      <div className="booking-mobile-top">
                        <div className="booking-mobile-customer-info">
                          <div className="booking-mobile-customer-name">{booking.customer_name}</div>
                          <div className="booking-mobile-customer-phone">{booking.customer_phone}</div>
                        </div>
                        <div className="booking-mobile-status-badge">{getStatusBadge(booking.status)}</div>
                      </div>
                      
                      <div className="booking-mobile-details">
                        <div className="booking-mobile-detail-row">
                          <span className="booking-mobile-icon">👤</span>
                          <span>{booking.barber_name}</span>
                        </div>
                        <div className="booking-mobile-detail-row">
                          <span className="booking-mobile-icon">✂️</span>
                          <span>{booking.service_name}</span>
                          <span className="booking-mobile-price">{booking.service_price}₺</span>
                        </div>
                        <div className="booking-mobile-detail-row">
                          <span className="booking-mobile-icon">📅</span>
                          <span>{new Date(booking.appointment_date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}</span>
                          <span className="booking-mobile-time">{booking.appointment_time}</span>
                        </div>
                        {booking.created_at && (
                          <div className="booking-mobile-created">
                            Oluşturulma: {new Date(booking.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })} {new Date(booking.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="booking-mobile-actions-compact">
                      {booking.status !== 'cancelled' && (
                        <>
                          <button
                            onClick={() => handleCall(booking.customer_phone)}
                            className="btn-mobile-action btn-call"
                            title="Ara"
                          >
                            <Phone size={16} />
                          </button>
                          <button
                            onClick={() => handleMessage(booking.customer_phone)}
                            className="btn-mobile-action btn-message"
                            title="Mesaj"
                          >
                            <MessageSquare size={16} />
                          </button>
                        </>
                      )}
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="btn-mobile-action btn-cancel"
                          title="İptal"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="btn-mobile-action btn-delete"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Kapalı Tarihler Bölümü */}
          <div className="bookings-section closed-dates-section" style={{ marginTop: '30px' }}>
            <div className="section-header">
              <h2>Kapalı Tarih Aralıkları</h2>
              <button 
                onClick={() => setShowClosedDateForm(!showClosedDateForm)}
                className="refresh-btn"
              >
                {showClosedDateForm ? 'İptal' : 'Yeni Tarih Aralığı Ekle'}
              </button>
            </div>

            {showClosedDateForm && (
              <form onSubmit={handleCreateClosedDate} className="closed-date-form">
                <div className="closed-date-form-grid">
                  <div className="form-group">
                    <label>Başlangıç Tarihi</label>
                    <input
                      type="date"
                      value={closedDateForm.start_date}
                      onChange={(e) => setClosedDateForm({ ...closedDateForm, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Bitiş Tarihi</label>
                    <input
                      type="date"
                      value={closedDateForm.end_date}
                      onChange={(e) => setClosedDateForm({ ...closedDateForm, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Sebep (Opsiyonel)</label>
                  <input
                    type="text"
                    value={closedDateForm.reason}
                    onChange={(e) => setClosedDateForm({ ...closedDateForm, reason: e.target.value })}
                    placeholder="Örn: Tatil, Özel Etkinlik..."
                  />
                </div>
                <button type="submit" className="login-btn closed-date-submit-btn">
                  Kaydet
                </button>
              </form>
            )}

            {closedDates.length === 0 ? (
              <div className="no-closed-dates">
                <p>Kapalı tarih aralığı bulunamadı</p>
              </div>
            ) : (
              <div className="closed-dates-list">
                {closedDates.map((closedDate) => (
                  <div key={closedDate.id} className="closed-date-card">
                    <div className="closed-date-info">
                      <div className="closed-date-dates">
                        <div className="closed-date-item">
                          <span className="closed-date-label">Başlangıç:</span>
                          <span className="closed-date-value">{new Date(closedDate.start_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div className="closed-date-item">
                          <span className="closed-date-label">Bitiş:</span>
                          <span className="closed-date-value">{new Date(closedDate.end_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        </div>
                      </div>
                      {closedDate.reason && (
                        <div className="closed-date-reason">
                          <span className="closed-date-label">Sebep:</span>
                          <span className="closed-date-value">{closedDate.reason}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteClosedDate(closedDate.id)}
                      className="btn-delete closed-date-delete-btn"
                      title="Sil"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminPage

