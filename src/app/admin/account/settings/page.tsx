'use client'

import { useEffect, useState } from 'react'
import {
  User,
  Mail,
  Shield,
  Settings,
  Moon,
  Bell,
  Globe,
  Lock,
  Key,
  ShieldCheck,
  Trash2,
  Check,
  X
} from 'lucide-react'
import { toast } from 'react-toastify'

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [language, setLanguage] = useState('English')
  const [user, setUser] = useState<{ name: string; email: string; role: string }>({
    name: '',
    email: '',
    role: '' // Static role for now
  })

useEffect(() => {
  const fetchUser = async () => {
    try {
      console.log("📡 Fetching user for settings...")
      const res = await fetch('/api/user/profile', {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to fetch user')
      }

      const data = await res.json()
      console.log("✅ Settings user data:", data)

      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role?.name || 'User',
      })
    } catch (err) {
      console.error("❌ Settings fetch error:", err)
      toast.error('Failed to load user data.')
    }
  }

  fetchUser()
}, [])


  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean) => {
    setter(!value)
  }

  return (
    <div style={{ backgroundColor: '#F5F6FA', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            color: '#1A1A1A', 
            fontSize: '2rem', 
            fontWeight: '600',
            margin: '0 0 0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Settings size={32} />
            Account Settings
          </h1>
          <p style={{ color: '#4B4B4B', fontSize: '1rem', margin: 0 }}>
            Manage your account preferences and security settings
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Account Summary */}
          <section style={{ 
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid #E5E9F0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{ 
              color: '#1A1A1A', 
              fontSize: '1.25rem', 
              fontWeight: '600',
              margin: '0 0 1.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <User size={20} />
              Your Account
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#F5F6FA',
                borderRadius: '8px'
              }}>
                <User size={16} style={{ color: '#4B4B4B' }} />
                <div>
                  <p style={{ color: '#4B4B4B', fontSize: '0.8rem', margin: 0 }}>Name</p>
                  <p style={{ color: '#1A1A1A', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>{user?.name}</p>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#F5F6FA',
                borderRadius: '8px'
              }}>
                <Mail size={16} style={{ color: '#4B4B4B' }} />
                <div>
                  <p style={{ color: '#4B4B4B', fontSize: '0.8rem', margin: 0 }}>Email</p>
                  <p style={{ color: '#1A1A1A', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>{user?.email}</p>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#F5F6FA',
                borderRadius: '8px'
              }}>
                <Shield size={16} style={{ color: '#4B4B4B' }} />
                <div>
                  <p style={{ color: '#4B4B4B', fontSize: '0.8rem', margin: 0 }}>Role</p>
                  <p style={{ color: '#1A1A1A', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>{user?.role || 'User'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Permissions */}
          <section style={{ 
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid #E5E9F0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{ 
              color: '#1A1A1A', 
              fontSize: '1.25rem', 
              fontWeight: '600',
              margin: '0 0 1.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ShieldCheck size={20} />
              Permissions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {[
                { text: 'Access Admin Dashboard', allowed: true },
                { text: 'View and Edit Profile', allowed: true },
                { text: 'Access Settings', allowed: true },
                { text: 'Create/Delete Super Admins', allowed: true }
              ].map((permission, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: permission.allowed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                  borderRadius: '8px',
                  border: `1px solid ${permission.allowed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                }}>
                  {permission.allowed ? (
                    <Check size={16} style={{ color: '#10B981' }} />
                  ) : (
                    <X size={16} style={{ color: '#EF4444' }} />
                  )}
                  <span style={{ 
                    color: '#1A1A1A', 
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    {permission.text}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Preferences */}
          <section style={{ 
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid #E5E9F0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{ 
              color: '#1A1A1A', 
              fontSize: '1.25rem', 
              fontWeight: '600',
              margin: '0 0 1.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Settings size={20} />
              Preferences
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Dark Mode */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: '#F5F6FA',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Moon size={18} style={{ color: '#4B4B4B' }} />
                  <div>
                    <p style={{ color: '#1A1A1A', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>Dark Mode</p>
                    <p style={{ color: '#4B4B4B', fontSize: '0.8rem', margin: 0 }}>Switch to dark theme</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(setDarkMode, darkMode)}
                  style={{
                    width: '48px',
                    height: '24px',
                    backgroundColor: darkMode ? '#3B82F6' : '#E5E9F0',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: darkMode ? '26px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}></div>
                </button>
              </div>

              {/* Email Notifications */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: '#F5F6FA',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Bell size={18} style={{ color: '#4B4B4B' }} />
                  <div>
                    <p style={{ color: '#1A1A1A', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>Email Notifications</p>
                    <p style={{ color: '#4B4B4B', fontSize: '0.8rem', margin: 0 }}>Receive email updates</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(setEmailNotifications, emailNotifications)}
                  style={{
                    width: '48px',
                    height: '24px',
                    backgroundColor: emailNotifications ? '#3B82F6' : '#E5E9F0',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: emailNotifications ? '26px' : '2px',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}></div>
                </button>
              </div>

              {/* Language */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '1rem',
                backgroundColor: '#F5F6FA',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Globe size={18} style={{ color: '#4B4B4B' }} />
                  <div>
                    <p style={{ color: '#1A1A1A', fontSize: '0.9rem', fontWeight: '500', margin: 0 }}>Language</p>
                    <p style={{ color: '#4B4B4B', fontSize: '0.8rem', margin: 0 }}>Select your preferred language</p>
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #E5E9F0',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    backgroundColor: '#FFFFFF',
                    color: '#1A1A1A',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>French</option>
                </select>
              </div>
            </div>
          </section>

          {/* Security */}
          <section style={{ 
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid #E5E9F0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{ 
              color: '#1A1A1A', 
              fontSize: '1.25rem', 
              fontWeight: '600',
              margin: '0 0 1.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Lock size={20} />
              Security
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  disabled
                  style={{
                    backgroundColor: '#4B4B4B',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: 0.6
                  }}
                >
                  <Key size={16} />
                  Change Password
                </button>
                <button
                  disabled
                  style={{
                    backgroundColor: '#4B4B4B',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: 0.6
                  }}
                >
                  <ShieldCheck size={16} />
                  Enable 2FA
                </button>
              </div>
              <div style={{
                padding: '1rem',
                backgroundColor: '#F5F6FA',
                borderRadius: '8px',
                borderLeft: '4px solid #3B82F6'
              }}>
                <p style={{ color: '#4B4B4B', fontSize: '0.8rem', margin: 0 }}>
                  <strong>Last login:</strong> June 25, 2025 at 11:45 AM
                </p>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section style={{ 
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '2rem',
            border: '1px solid #EF4444',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.04)'
          }}>
            <h2 style={{ 
              color: '#EF4444', 
              fontSize: '1.25rem', 
              fontWeight: '600',
              margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Trash2 size={20} />
              Danger Zone
            </h2>
            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <p style={{ color: '#4B4B4B', fontSize: '0.9rem', margin: 0 }}>
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>
            <button
              disabled
              style={{
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: 0.6
              }}
            >
              <Trash2 size={16} />
              Delete My Account
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}