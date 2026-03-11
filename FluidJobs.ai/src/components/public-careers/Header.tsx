import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ApplicationModal from './ApplicationModal'
import './Header.css'

const Header: React.FC = () => {
  const location = useLocation()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <img src="/images/Fluidlive Official logo.png" alt="FluidJobs.ai" className="logo-image" />
          </div>
          <nav className="nav">
            <Link to="/careers" className={`nav-link ${location.pathname === '/careers' ? 'active' : ''}`}>View Openings</Link>
            <a href="https://fluid.live/about/#contact" className="nav-link">Contact Us</a>
            <button className="apply-unlisted-btn" onClick={() => setIsModalOpen(true)}>
              Apply For Any Job Not Listed Here
            </button>
          </nav>
        </div>
      </header>
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isGeneralApplication={true}
      />
    </>
  )
}

export default Header
