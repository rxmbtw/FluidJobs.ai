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
            const minSalary = job.min_salary ? (job.min_salary / 100000).toFixed(1) : null
            const maxSalary = job.max_salary ? (job.max_salary / 100000).toFixed(1) : null
            const ctc = minSalary && maxSalary ? `Rs.${minSalary}L-Rs.${maxSalary}L` : 'Not Specified'

            return {
              id: job.id || job.job_id,
              postedDate: job.created_at
                ? new Date(job.created_at).toLocaleDateString('en-GB')
                : new Date().toLocaleDateString('en-GB'),
              title: job.job_title || job.title,
              jobType: job.workplace || job.job_type || 'Full-Time',
              jobMode: job.mode_of_job || 'On-site',
              location: Array.isArray(job.locations)
                ? job.locations.join(', ')
                : typeof job.locations === 'string'
                  ? job.locations.replace(/[{}"]/g, '').split(',').map((l: string) => l.trim()).join(', ')
                  : 'Remote',
              ctc,
              image: job.selectedImage || job.selected_image || DEFAULT_JOB_IMAGE
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
