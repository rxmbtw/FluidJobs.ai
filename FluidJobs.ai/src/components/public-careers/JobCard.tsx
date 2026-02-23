import React from 'react'
import { Link } from 'react-router-dom'
import './JobCard.css'

interface JobCardProps {
  job: {
    id: number
    postedDate: string
    title: string
    jobType: string
    jobMode: string
    location: string
    ctc: string
    image?: string
  }
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <div className="job-card">
      <div className="job-image-placeholder">
        {job.image && <img src={job.image} alt={job.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div className="job-content">
        <div className="job-posted">Posted on: {job.postedDate}</div>
        <h3 className="job-title">{job.title}</h3>
        <div className="job-details">
          <div className="job-detail-row">
            <span className="job-label">JOB TYPE</span>
            <span className="job-value">{job.jobType}</span>
            <span className="job-label">JOB MODE</span>
            <span className="job-value">{job.jobMode}</span>
          </div>
          <div className="job-detail-row">
            <span className="job-label">LOCATION</span>
            <span className="job-value">{job.location}</span>
            <span className="job-label">CTC</span>
            <span className="job-value">{job.ctc}</span>
          </div>
        </div>
        <Link to={`/careers/job/${job.id}`} className="view-opening-link">View the opening →</Link>
      </div>
    </div>
  )
}

export default JobCard
