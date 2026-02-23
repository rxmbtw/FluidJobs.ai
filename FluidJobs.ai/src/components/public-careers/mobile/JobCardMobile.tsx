import React from 'react'
import { Link } from 'react-router-dom'
import './JobCardMobile.css'

interface JobCardMobileProps {
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

const JobCardMobile: React.FC<JobCardMobileProps> = ({ job }) => {
  return (
    <div className="job-card-mobile">
      <div className="job-image-placeholder-mobile">
        {job.image && <img src={job.image} alt={job.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div className="job-content-mobile">
        <div className="job-posted-mobile">Posted on: {job.postedDate}</div>
        <h3 className="job-title-mobile">{job.title}</h3>
        <div className="job-details-mobile">
          <div className="job-detail-item-mobile">
            <span className="job-label-mobile">JOB TYPE</span>
            <span className="job-value-mobile">{job.jobType}</span>
          </div>
          <div className="job-detail-item-mobile">
            <span className="job-label-mobile">JOB MODE</span>
            <span className="job-value-mobile">{job.jobMode}</span>
          </div>
          <div className="job-detail-item-mobile">
            <span className="job-label-mobile">LOCATION</span>
            <span className="job-value-mobile">{job.location}</span>
          </div>
          <div className="job-detail-item-mobile">
            <span className="job-label-mobile">CTC</span>
            <span className="job-value-mobile">{job.ctc}</span>
          </div>
        </div>
        <Link to={`/careers/job/${job.id}`} className="view-opening-link-mobile">View the opening →</Link>
      </div>
    </div>
  )
}

export default JobCardMobile
