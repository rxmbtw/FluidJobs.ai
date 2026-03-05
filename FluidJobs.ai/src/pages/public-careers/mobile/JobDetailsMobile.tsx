import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import HeaderMobile from '../../../components/public-careers/mobile/HeaderMobile'
import FooterMobile from '../../../components/public-careers/mobile/FooterMobile'
import ApplicationForm from '../../../components/public-careers/ApplicationForm'
import './JobDetailsMobile.css'

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
  image?: string
}

const DEFAULT_JOB_IMAGE = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop'

const JobDetailsMobile: React.FC = () => {
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
              description: found.description || found.job_description || '',
              skills: Array.isArray(found.skills) ? found.skills : [],
              qualifications: found.qualifications || [`${found.min_experience || 0}-${found.max_experience || 0} years of experience`],
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
      <div className="job-details-page-mobile">
        <HeaderMobile />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <div style={{
            width: '32px', height: '32px',
            border: '3px solid #e5e7eb', borderTop: '3px solid #4f46e5',
            borderRadius: '50%', animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
        <FooterMobile />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="job-details-page-mobile">
        <HeaderMobile />
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
          <h2>Job Not Found</h2>
          <Link to="/careers" style={{ color: '#4f46e5' }}>← Back to openings</Link>
        </div>
        <FooterMobile />
      </div>
    )
  }

  return (
    <div className="job-details-page-mobile">
      <HeaderMobile />
      <div className="job-details-container-mobile">
        <div className="breadcrumb-mobile">
          <Link to="/careers" className="breadcrumb-link-mobile">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            View Openings
          </Link>
          <span className="breadcrumb-separator-mobile">/</span>
          <span className="breadcrumb-current-mobile">{job.title}</span>
        </div>

        <div
          className="job-hero-mobile"
          style={job.image ? {
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${job.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white'
          } : {}}
        >
          <div className="job-hero-content-mobile">
            <div className="job-posted-date-mobile" style={job.image ? { color: '#e5e7eb' } : {}}>Posted on: {job.postedDate}</div>
            <h1 className="job-details-title-mobile" style={job.image ? { color: 'white' } : {}}>{job.title}</h1>
          </div>
        </div>

        <div className="job-info-bar-mobile">
          <div className="job-info-item-mobile">
            <span className="job-info-label-mobile">JOB TYPE</span>
            <span className="job-info-value-mobile">{job.jobType}</span>
          </div>
          <div className="job-info-item-mobile">
            <span className="job-info-label-mobile">JOB MODE</span>
            <span className="job-info-value-mobile">{job.jobMode}</span>
          </div>
          <div className="job-info-item-mobile">
            <span className="job-info-label-mobile">LOCATION</span>
            <span className="job-info-value-mobile">{job.location}</span>
          </div>
          <div className="job-info-item-mobile">
            <span className="job-info-label-mobile">CTC</span>
            <span className="job-info-value-mobile">{job.ctc}</span>
          </div>
          <div className="job-info-item-mobile">
            <span className="job-info-label-mobile">INDUSTRY</span>
            <span className="job-info-value-mobile">{job.industry}</span>
          </div>
        </div>

        <div className="job-description-section-mobile">
          {job.description && (
            <>
              <h2 className="section-title-mobile">DESCRIPTION</h2>
              <div className="description-content-mobile">
                <p style={{ whiteSpace: 'pre-line', marginBottom: '16px' }}>{job.description}</p>
              </div>
            </>
          )}

          {job.skills.length > 0 && (
            <div className="description-content-mobile">
              <h3 className="subsection-title-mobile">Required Skills</h3>
              <ul className="description-list-mobile">
                {job.skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {job.qualifications.length > 0 && (
            <div className="description-content-mobile">
              <h3 className="subsection-title-mobile">Qualifications</h3>
              <ul className="description-list-mobile">
                {job.qualifications.map((qual, index) => (
                  <li key={index}>{qual}</li>
                ))}
              </ul>
            </div>
          )}

          {!showForm && (
            <button className="apply-button-mobile" onClick={handleApplyClick}>
              Apply Now
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L18 10L12 16M18 10H2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {showForm && <ApplicationForm onClose={() => setShowForm(false)} />}
        </div>
      </div>
      <FooterMobile />
    </div>
  )
}

export default JobDetailsMobile
