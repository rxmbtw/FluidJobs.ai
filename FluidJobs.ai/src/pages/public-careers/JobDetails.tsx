import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '../../components/public-careers/Header'
import Footer from '../../components/public-careers/Footer'
import ApplicationForm from '../../components/public-careers/ApplicationForm'
import './JobDetails.css'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'

interface JobData {
  id: string
  title: string
  postedDate: string
  jobType: string
  jobMode: string
  location: string
  ctc: string
  industry: string
  description: string
  skills: string[]
  qualifications: string[]
  education: string[]
  image?: string
}

const DEFAULT_JOB_IMAGE = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop'

const JobDetails: React.FC = () => {
  const { id } = useParams()
  const [showForm, setShowForm] = useState(false)
  const [job, setJob] = useState<JobData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/jobs-enhanced/published`)
        const data = await response.json()

        if (data.success && data.jobs) {
          const found = data.jobs.find((j: any) => String(j.id || j.job_id) === String(id))
          if (found) {
            const locations = Array.isArray(found.locations)
              ? found.locations.join(', ')
              : typeof found.locations === 'string'
                ? found.locations.replace(/[{}"]/g, '').split(',').map((l: string) => l.trim()).join(', ')
                : 'Remote'

            const minSalary = found.min_salary ? (found.min_salary / 100000).toFixed(1) : null
            const maxSalary = found.max_salary ? (found.max_salary / 100000).toFixed(1) : null
            const ctc = minSalary && maxSalary ? `Rs.${minSalary}L-Rs.${maxSalary}L` : 'Not Specified'

            // Parse description for skills/qualifications
            const desc = found.description || found.job_description || ''
            const skills = Array.isArray(found.skills) ? found.skills : []
            const responsibilities = found.responsibilities || []
            const qualifications = found.qualifications || []

            setJob({
              id: String(found.id || found.job_id),
              title: found.job_title || found.title || 'Job Opening',
              postedDate: found.created_at
                ? new Date(found.created_at).toLocaleDateString('en-GB')
                : new Date().toLocaleDateString('en-GB'),
              jobType: found.workplace || found.job_type || 'Full-Time',
              jobMode: found.mode_of_job || found.jobMode || 'On-site',
              location: locations,
              ctc,
              industry: found.job_domain || 'Technology',
              description: desc,
              skills: skills.length > 0 ? skills : responsibilities,
              qualifications: qualifications.length > 0 ? qualifications : [`${found.min_experience || 0}-${found.max_experience || 0} years of experience`],
              education: ['Bachelor\'s Degree or equivalent'],
              image: found.selectedImage || found.selected_image || DEFAULT_JOB_IMAGE
            })
          }
        }
      } catch (err) {
        console.error('Error fetching job details:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [id])

  const handleApplyClick = () => {
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="job-details-page">
        <Header />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{
            width: '40px', height: '40px',
            border: '3px solid #e5e7eb', borderTop: '3px solid #4f46e5',
            borderRadius: '50%', animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
        <Footer />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="job-details-page">
        <Header />
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6b7280' }}>
          <h2>Job Not Found</h2>
          <p>This job opening may no longer be available.</p>
          <Link to="/careers" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
            ← Back to all openings
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="job-details-page">
      <Header />
      <div className="job-details-container">
        <div className="breadcrumb">
          <Link to="/careers" className="breadcrumb-link">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            View Openings
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{job.title}</span>
        </div>

        <div
          className="job-hero"
          style={job.image ? {
            backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${job.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white'
          } : {}}
        >
          <div className="job-hero-content">
            <div className="job-posted-date" style={job.image ? { color: '#e5e7eb' } : {}}>Posted on: {job.postedDate}</div>
            <h1 className="job-details-title" style={job.image ? { color: 'white' } : {}}>{job.title}</h1>
          </div>
        </div>

        <div className="job-info-bar">
          <div className="job-info-item">
            <span className="job-info-label">JOB TYPE</span>
            <span className="job-info-value">{job.jobType}</span>
          </div>
          <div className="job-info-item">
            <span className="job-info-label">JOB MODE</span>
            <span className="job-info-value">{job.jobMode}</span>
          </div>
          <div className="job-info-item">
            <span className="job-info-label">LOCATION</span>
            <span className="job-info-value">{job.location}</span>
          </div>
          <div className="job-info-item">
            <span className="job-info-label">CTC</span>
            <span className="job-info-value">{job.ctc}</span>
          </div>
          <div className="job-info-item">
            <span className="job-info-label">INDUSTRY</span>
            <span className="job-info-value">{job.industry}</span>
          </div>
        </div>

        <div className="job-description-section">
          {job.description && (
            <>
              <h2 className="section-title">DESCRIPTION</h2>
              <div className="description-content">
                <p style={{ whiteSpace: 'pre-line', marginBottom: '20px' }}>{job.description}</p>
              </div>
            </>
          )}

          {job.skills.length > 0 && (
            <div className="description-content">
              <h3 className="subsection-title">Required Skills</h3>
              <ul className="description-list">
                {job.skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {job.qualifications.length > 0 && (
            <div className="description-content">
              <h3 className="subsection-title">Qualifications</h3>
              <ul className="description-list">
                {job.qualifications.map((qual, index) => (
                  <li key={index}>{qual}</li>
                ))}
              </ul>
            </div>
          )}

          {!showForm && (
            <button className="apply-button" onClick={handleApplyClick}>
              Apply Now
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L18 10L12 16M18 10H2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {showForm && <ApplicationForm onClose={() => setShowForm(false)} />}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default JobDetails
