import React from 'react'
import Header from '../../components/public-careers/Header'
import JobGrid from '../../components/public-careers/JobGrid'
import Footer from '../../components/public-careers/Footer'

const JobListings: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <JobGrid />
      <Footer />
    </div>
  )
}

export default JobListings
