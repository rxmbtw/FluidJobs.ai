import React from 'react'
import HeaderMobile from '../../../components/public-careers/mobile/HeaderMobile'
import JobGridMobile from '../../../components/public-careers/mobile/JobGridMobile'
import FooterMobile from '../../../components/public-careers/mobile/FooterMobile'
import './JobListingsMobile.css'

const JobListingsMobile: React.FC = () => {
  return (
    <div className="app-mobile">
      <HeaderMobile />
      <JobGridMobile />
      <FooterMobile />
    </div>
  )
}

export default JobListingsMobile
