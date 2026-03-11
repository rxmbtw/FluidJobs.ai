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
            let ctcDisplay = 'Not Specified';
            if (found.showSalaryToCandidate) {
              const formatMoney = (amount: number) => new Intl.NumberFormat('en-IN').format(amount);

              if (found.jobType === 'Internship') {
                if (found.minSalary && found.maxSalary) {
                  ctcDisplay = `INR ${formatMoney(found.minSalary)} - INR ${formatMoney(found.maxSalary)} /month`;
                } else if (found.minSalary) {
                  ctcDisplay = `INR ${formatMoney(found.minSalary)} /month`;
                }
              } else {
                if (found.minSalary && found.maxSalary) {
                  ctcDisplay = `INR ${formatMoney(found.minSalary)} - INR ${formatMoney(found.maxSalary)} per annum`;
                } else if (found.minSalary) {
                  ctcDisplay = `INR ${formatMoney(found.minSalary)} per annum`;
                }
              }
            }

            setJob({
              id: String(found.id),
              title: found.title || 'Job Opening',
              postedDate: found.postedDate || new Date().toLocaleDateString('en-GB'),
              jobType: found.jobType || 'Full-Time',
              jobMode: found.modeOfJob || 'On-site',
              location: found.location || 'Remote',
              ctc: ctcDisplay,
              industry: found.industry || 'Technology',
              description: found.description || '',
              skills: found.skills || [],
              qualifications: found.experienceRange ? [found.experienceRange] : [],
              image: found.selectedImage || DEFAULT_JOB_IMAGE
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

  const formRef = React.useRef<HTMLDivElement>(null)

  const handleApplyClick = () => {
    setShowForm(true)
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
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
                <div
                  className="rich-text-content"
                  style={{ marginBottom: '16px' }}
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </div>
            </>
          )}


          {!showForm && (
            <button className="apply-button-mobile" onClick={handleApplyClick}>
              Apply Now
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L18 10L12 16M18 10H2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {showForm && (
            <div ref={formRef}>
              <ApplicationForm onClose={() => setShowForm(false)} />
            </div>
          )}
        </div>
      </div>
      <FooterMobile />
    </div>
  )
}

export default JobDetailsMobile
