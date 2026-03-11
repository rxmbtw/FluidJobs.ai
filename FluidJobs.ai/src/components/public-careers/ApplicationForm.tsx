import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import CustomSelect from './CustomSelect'
import { jobService } from '../../services/jobService'
import './ApplicationForm.css'

interface ApplicationFormProps {
  onClose: () => void
  isGeneralApplication?: boolean
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ onClose, isGeneralApplication = false }) => {
  const { id: routeJobId } = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    gender: '',
    maritalStatus: '',
    jobProfile: '',
    experience: '',
    currentlyWorking: '',
    expectedCTC: '',
    currentCity: '',
    workMode: '',
    cv: null as File | null,
    // Fields for "Yes" (currently working)
    currentCompany: '',
    noticePeriod: '',
    currentCTC: '',
    // Fields for "No" (not currently working)
    lastCompany: '',
    joiningDate: '',
    lastCTC: '',
    linkedinUrl: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds the 10MB limit. Please upload a smaller file.');
        e.target.value = '';
        return;
      }
      setFormData(prev => ({ ...prev, cv: file }));
    }
  }

  const handlePreviewFile = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    window.open(fileUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await jobService.publicApply(routeJobId, formData)

      if (response.success) {
        alert('Thank you! Your application has been submitted successfully.')
        onClose()
      } else {
        alert(response.message || 'Failed to submit application. Please try again.')
      }
    } catch (err) {
      console.error('Submission error:', err)
      alert('An error occurred while submitting your application. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ]

  const maritalStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' }
  ]

  const noticePeriodOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: '15-days', label: '15 Days' },
    { value: '1-month', label: '1 Month' },
    { value: '2-months', label: '2 Months' },
    { value: '3-months', label: '3 Months' }
  ]

  const workModeOptions = [
    { value: 'work-from-office', label: 'Work from Office' },
    { value: 'work-from-home', label: 'Work from Home' },
    { value: 'hybrid', label: 'Hybrid' }
  ]

  return (
    <div className="application-form-container">
      <form className="application-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="form-section-title">1. Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone No *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <CustomSelect
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={genderOptions}
                placeholder="Select Gender"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="maritalStatus">Marital Status *</label>
              <CustomSelect
                id="maritalStatus"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                options={maritalStatusOptions}
                placeholder="Select Status"
                required
              />
            </div>
            <div className="form-group form-group-full">
              <label htmlFor="linkedinUrl">LinkedIn Profile URL (Optional)</label>
              <input
                type="url"
                id="linkedinUrl"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/your-profile"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">2. Experience Details</h3>
          <div className="form-grid">
            {isGeneralApplication && (
              <div className="form-group form-group-full">
                <label htmlFor="jobProfile">Job Profile Applying for? *</label>
                <input
                  type="text"
                  id="jobProfile"
                  name="jobProfile"
                  value={formData.jobProfile}
                  onChange={handleChange}
                  required
                  placeholder="Enter the job profile you're applying for"
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="experience">Your total work experience relevant to the profile applied for? (in years) *</label>
              <input
                type="number"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                placeholder="e.g. 3"
                min="0"
                step="0.5"
              />
            </div>
            <div className="form-group">
              <label htmlFor="currentlyWorking">Are you currently working anywhere? *</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="currentlyWorking"
                    value="yes"
                    checked={formData.currentlyWorking === 'yes'}
                    onChange={handleChange}
                    required
                  />
                  <span>Yes</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="currentlyWorking"
                    value="no"
                    checked={formData.currentlyWorking === 'no'}
                    onChange={handleChange}
                    required
                  />
                  <span>No</span>
                </label>
              </div>
            </div>

            {formData.currentlyWorking === 'yes' && (
              <>
                <div className="form-group">
                  <label htmlFor="currentCompany">What is the name of your current company or organisation? *</label>
                  <input
                    type="text"
                    id="currentCompany"
                    name="currentCompany"
                    value={formData.currentCompany}
                    onChange={handleChange}
                    required
                    placeholder="Enter your current company name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="noticePeriod">What is your notice period with the current organisation? *</label>
                  <CustomSelect
                    id="noticePeriod"
                    name="noticePeriod"
                    value={formData.noticePeriod}
                    onChange={handleChange}
                    options={noticePeriodOptions}
                    placeholder="Select Notice Period"
                    required
                  />
                </div>
                <div className="form-group form-group-full">
                  <label htmlFor="currentCTC">What is your current Annual CTC package? *</label>
                  <input
                    type="text"
                    id="currentCTC"
                    name="currentCTC"
                    value={formData.currentCTC}
                    onChange={handleChange}
                    required
                    placeholder="Full value CTC per year in ₹ Rupees e.g. 3,50,000 | Do not write 3.5"
                  />
                </div>
              </>
            )}

            {formData.currentlyWorking === 'no' && (
              <>
                <div className="form-group">
                  <label htmlFor="lastCompany">What is the name of your last company or organisation? *</label>
                  <input
                    type="text"
                    id="lastCompany"
                    name="lastCompany"
                    value={formData.lastCompany}
                    onChange={handleChange}
                    required
                    placeholder="Enter your last company name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="joiningDate">Earliest Date by which you can join Fluid.Live? (if you are selected through interview process) *</label>
                  <input
                    type="date"
                    id="joiningDate"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group form-group-full">
                  <label htmlFor="lastCTC">What was your Annual CTC package in last job? *</label>
                  <input
                    type="text"
                    id="lastCTC"
                    name="lastCTC"
                    value={formData.lastCTC}
                    onChange={handleChange}
                    required
                    placeholder="Full value CTC per year in ₹ Rupees e.g. 3,50,000 | Do not write 3.5"
                  />
                </div>
              </>
            )}

            <div className="form-group form-group-full">
              <label htmlFor="expectedCTC">What is your expected Annual CTC package in new job? *</label>
              <input
                type="text"
                id="expectedCTC"
                name="expectedCTC"
                value={formData.expectedCTC}
                onChange={handleChange}
                required
                placeholder="Full value CTC per year in ₹ Rupees e.g. 3,50,000 | Do not write 3.5"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">3. Workability Assessment</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="currentCity">Which city are you currently in? *</label>
              <input
                type="text"
                id="currentCity"
                name="currentCity"
                value={formData.currentCity}
                onChange={handleChange}
                required
                placeholder="Enter your current city"
              />
            </div>
            <div className="form-group">
              <label htmlFor="workMode">Your Work Mode in your current job/last job *</label>
              <CustomSelect
                id="workMode"
                name="workMode"
                value={formData.workMode}
                onChange={handleChange}
                options={workModeOptions}
                placeholder="Select Work Mode"
                required
              />
            </div>
            <div className="form-group form-group-full">
              <label htmlFor="cv">Please Upload Your CV *</label>
              <input
                type="file"
                id="cv"
                name="cv"
                onChange={handleFileChange}
                required={!formData.cv}
                accept=".pdf,.doc,.docx"
                className="file-input"
              />
              {formData.cv && (
                <div style={{ marginTop: '8px' }}>
                  <span
                    className="file-name"
                    onClick={() => handlePreviewFile(formData.cv as File)}
                    style={{
                      cursor: 'pointer',
                      color: '#4f46e5',
                      textDecoration: 'underline',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Click to preview file"
                  >
                    📄 {formData.cv.name}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                    ({(formData.cv.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form >
    </div >
  )
}

export default ApplicationForm
