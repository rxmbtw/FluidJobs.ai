import React, { useState, useEffect } from 'react'
import JobCard from './JobCard'
import './JobGrid.css'

interface Job {
  id: number
  postedDate: string
  title: string
  jobType: string
  jobMode: string
  location: string
  ctc: string
  image?: string
}

const DEFAULT_JOB_IMAGE = 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=250&fit=crop'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api'

const JobGrid: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPublishedJobs = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/jobs-enhanced/published`)
        const data = await response.json()

        if (data.success && data.jobs) {
          const formatted: Job[] = data.jobs.map((job: any) => {
            let ctc = ''
            if (job.showSalaryToCandidate) {
              const formatMoney = (amount: number) => new Intl.NumberFormat('en-IN').format(amount);

              if (job.jobType === 'Internship') {
                if (job.minSalary && job.maxSalary) {
                  ctc = `INR ${formatMoney(job.minSalary)} - INR ${formatMoney(job.maxSalary)} /month`
                } else if (job.minSalary) {
                  ctc = `INR ${formatMoney(job.minSalary)} /month`
                }
              } else {
                if (job.minSalary && job.maxSalary) {
                  ctc = `INR ${formatMoney(job.minSalary)} - INR ${formatMoney(job.maxSalary)} per annum`
                } else if (job.minSalary) {
                  ctc = `INR ${formatMoney(job.minSalary)} per annum`
                }
              }
            }

            return {
              id: job.id,
              postedDate: job.postedDate || new Date().toLocaleDateString('en-GB'),
              title: job.title || 'Job Opening',
              jobType: job.jobType || 'Full-Time',
              jobMode: job.modeOfJob || 'On-site',
              location: job.location || 'Remote',
              ctc,
              image: job.selectedImage || DEFAULT_JOB_IMAGE
            }
          })
          setJobs(formatted)
        }
      } catch (err) {
        console.error('Error fetching published jobs:', err)
        setError('Failed to load job openings. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchPublishedJobs()
  }, [])

  if (loading) {
    return (
      <div className="job-grid-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #4f46e5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="job-grid-container">
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="job-grid-container">
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
          <p>No job openings available at the moment. Check back soon!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="job-grid-container">
      <div className="job-grid">
        {jobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}

export default JobGrid
