import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ApplicationModal from '../ApplicationModal'
import './HeaderMobile.css'

const HeaderMobile: React.FC = () => {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleApplyClick = () => {
    setMenuOpen(false)
    setIsModalOpen(true)
  }

  return (
    <>
      <header className="header-mobile">
        <div className="header-mobile-content">
          <div className="logo-mobile">
            <img src="/logo.png" alt="FluidJobs.ai" className="logo-image-mobile" />
          </div>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        {menuOpen && (
          <nav className="nav-mobile">
            <a href="https://fluid.live" className="nav-link-mobile">Home</a>
            <Link to="/careers" className={`nav-link-mobile ${location.pathname === '/careers' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>View Openings</Link>
            <a href="https://fluid.live/about/#contact" className="nav-link-mobile">Contact Us</a>
            <button className="apply-unlisted-btn-mobile" onClick={handleApplyClick}>
              Apply For Any Job Not Listed Here
            </button>
          </nav>
        )}
      </header>
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isGeneralApplication={true}
      />
    </>
  )
}

export default HeaderMobile
