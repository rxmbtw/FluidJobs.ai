import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDashboardHeader } from './NewDashboardContainer';
import { JobStage } from './types';
import { Info, FileText, CheckSquare, DollarSign, Users, ClipboardList, Trash2, Calendar, MapPin, Briefcase, Upload, Sparkles, X, Plus, ChevronUp, ChevronDown, Edit3, GripVertical, Image, AlertCircle, Check, Bold, Italic, Underline, Strikethrough } from 'lucide-react';
import SuccessModal from '../SuccessModal';
import ImagePickerModal from '../common/ImagePickerModal';
import { formatJobTitle, getDuplicateTitleError } from '../../utils/jobTitleUtils';

const domainSuggestions = [
  // Tech & Engineering
  'Software Engineering', 'Frontend Development', 'Backend Development', 'Full Stack Development',
  'Mobile Development', 'DevOps & SRE', 'Cloud Computing', 'Data Science', 'Machine Learning',
  'Artificial Intelligence', 'Data Engineering', 'Cybersecurity', 'IT & Systems',
  'Quality Assurance (QA)', 'Blockchain & Web3', 'Game Development', 'AR/VR/XR',
  'Embedded Systems', 'Network Engineering', 'Database Administration',

  // Product & Design
  'Product Management', 'Project Management', 'UI/UX Design', 'Product Design',
  'Graphic Design', 'Technical Writing', 'Scrum & Agile',

  // Business & Operations
  'Digital Marketing', 'Sales & Business Development', 'Human Resources (HR)',
  'Talent Acquisition', 'Finance & Accounting', 'Operations', 'Customer Success',
  'Legal & Compliance', 'Strategy & Consulting', 'Supply Chain & Logistics'
];

const JobSettings: React.FC<{ onDirtyChange?: (isDirty: boolean) => void; onSaveSuccess?: () => void }> = ({ onDirtyChange, onSaveSuccess }) => {
  const { setHeaderActions } = useDashboardHeader();
  const currentUser = JSON.parse(sessionStorage.getItem('fluidjobs_user') || localStorage.getItem('superadmin') || '{}');
  const isRecruiterRole = currentUser.role?.toLowerCase() === 'recruiter';
  const isReadonlyStatus = currentUser.role?.toLowerCase() !== 'admin' && currentUser.role?.toLowerCase() !== 'superadmin';

  const { jobSlug } = useParams<{ jobSlug?: string }>();
  const jobId = jobSlug ? jobSlug.match(/^(\d+)/)?.[1] : null;

  const [jobDetails, setJobDetails] = useState({
    title: 'AI Lead',
    domain: 'Software Development',
    location: 'Remote',
    type: 'Full-time',
    minExperience: '3',
    maxExperience: '7',
    numberOfOpenings: '2',
    modeOfJob: 'Remote',
    description: '',
    requirements: [] as string[],
    skills: [] as string[],
    salary: {
      min: 0,
      max: 0,
      currency: 'INR',
      showToCandidate: true
    },
    registrationOpeningDate: '',
    registrationClosingDate: '',
    status: 'Active',
    hiringManager: '',
    recruiters: [] as string[],
    primaryRecruiterId: '',
    // Populated from DB on mount via useEffect below
    interviewStages: [] as JobStage[]
  });

  const [activeSection, setActiveSection] = useState('basic');
  const [selectedLocations, setSelectedLocations] = useState(['Mumbai', 'Bangalore']);
  const [locationInput, setLocationInput] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [newStageInput, setNewStageInput] = useState('');
  const [currentStageType, setCurrentStageType] = useState<'standard' | 'custom'>('standard');
  const [showNewStageInput, setShowNewStageInput] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<number | undefined>(undefined);
  const [users, setUsers] = useState<any[]>([]);
  const [teamAssignments, setTeamAssignments] = useState<{ [userId: string]: string[] }>({});
  // occupiedStages: stage name -> count of candidates currently in that stage
  const [occupiedStages, setOccupiedStages] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [titleWarning, setTitleWarning] = useState('');
  const [isCheckingTitle, setIsCheckingTitle] = useState(false);
  const [showDomainSuggestions, setShowDomainSuggestions] = useState(false);
  const [apiDomainSuggestions, setApiDomainSuggestions] = useState<string[]>([]);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState<'Paused' | 'Closed' | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [activeCandidatesCount, setActiveCandidatesCount] = useState<number>(0);
  const [jobActivityLog, setJobActivityLog] = useState<any[]>([]);

  const editorRef = useRef<HTMLDivElement>(null);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [isGeneratingFromPdf, setIsGeneratingFromPdf] = useState(false);
  const [uploadedPdfFile, setUploadedPdfFile] = useState<File | null>(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState('');
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const validateSection = (sectionId: string) => {
    let newErrors: { [key: string]: string } = {};

    switch (sectionId) {
      case 'basic':
        if (!jobDetails.title.trim()) newErrors.title = 'Job title is required';
        else if (titleWarning) newErrors.title = getDuplicateTitleError(titleWarning);
        if (!jobDetails.domain) newErrors.domain = 'Job domain is required';
        if (!jobDetails.minExperience) newErrors.minExperience = 'Min experience is required';
        if (!jobDetails.maxExperience) newErrors.maxExperience = 'Max experience is required';
        if (!jobDetails.numberOfOpenings || parseInt(jobDetails.numberOfOpenings) < 1) newErrors.numberOfOpenings = 'Valid number of openings is required';
        break;
      case 'image':
        if (!selectedImage) newErrors.selectedImage = 'Job posting image is required';
        break;
      case 'timeline':
        if (!jobDetails.registrationOpeningDate) newErrors.registrationOpeningDate = 'Registration opening date is required';
        if (!jobDetails.registrationClosingDate) newErrors.registrationClosingDate = 'Registration closing date is required';
        break;
      case 'location':
        if (selectedLocations.length === 0) newErrors.locations = 'At least one location is required';
        if (!jobDetails.modeOfJob) newErrors.modeOfJob = 'Mode of job is required';
        break;
      case 'description':
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = jobDetails.description;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        if (!textContent.trim()) newErrors.description = 'Job description is required';
        break;
      case 'requirements':
        if (jobDetails.skills.length === 0) newErrors.skills = 'At least one skill is required';
        break;
      case 'compensation':
        if (!jobDetails.salary.min && jobDetails.salary.min !== 0) newErrors.minSalary = 'Min salary is required';
        if (!jobDetails.salary.max && jobDetails.salary.max !== 0) newErrors.maxSalary = 'Max salary is required';
        break;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };
  const [blockedStageName, setBlockedStageName] = useState<string | null>(null); // for locked-stage tooltip modal

  // --- Confirmation popup states ---
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNavigationWarningModal, setShowNavigationWarningModal] = useState(false);
  const [pendingSectionId, setPendingSectionId] = useState<string | null>(null);
  // Snapshot of original data to detect dirty state
  const originalJobDetails = useRef(JSON.stringify(jobDetails));
  const originalLocations = useRef(JSON.stringify(selectedLocations));
  const originalCoverImage = useRef<string | null>(null);

  const isDirty = () => {
    return JSON.stringify(jobDetails) !== originalJobDetails.current ||
      JSON.stringify(selectedLocations) !== originalLocations.current ||
      selectedImage !== originalCoverImage.current;
  };

  // Load real hiring stages AND selected image from DB for this job on mount
  useEffect(() => {
    if (!jobId) return;
    const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('superadmin_token') || localStorage.getItem('token');
    fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/${jobId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) { console.warn('[JobSettings] Could not fetch job', jobId); return; }
        // API returns interview_stages (mapped from hiring_process), also check hiring_process directly
        const rawStages: any[] = data.interview_stages || data.hiring_process || data.stages || [];
        console.log('[JobSettings] raw stages from API for job', jobId, rawStages);
        if (Array.isArray(rawStages) && rawStages.length > 0) {
          const loaded: JobStage[] = rawStages.map((s: any, idx: number) => ({
            id: s.id || `stage_${idx}`,
            name: s.name || String(s),
            type: (s.type as 'standard' | 'custom') || 'standard',
            isMandatory: s.isMandatory ?? false,
            remarksRequired: s.remarksRequired ?? false,
            order: s.order || idx + 1
          }));
          setJobDetails(prev => ({ ...prev, interviewStages: loaded }));
          // Sync snapshot safely — don't crash if ref empty
          try {
            const snap = originalJobDetails.current ? JSON.parse(originalJobDetails.current) : {};
            originalJobDetails.current = JSON.stringify({ ...snap, interviewStages: loaded });
          } catch (_) {
            originalJobDetails.current = JSON.stringify({ interviewStages: loaded });
          }
        }

        // Load the main job details
        setJobDetails(prev => ({
          ...prev,
          title: data.title || prev.title,
          domain: data.industry || data.job_domain || prev.domain,
          location: data.location || prev.location,
          type: data.jobType || data.type || prev.type,
          minExperience: data.minExperience || data.min_experience || prev.minExperience,
          maxExperience: data.maxExperience || data.max_experience || prev.maxExperience,
          numberOfOpenings: data.noOfOpenings || data.no_of_openings || prev.numberOfOpenings,
          modeOfJob: data.modeOfJob || data.mode_of_job || prev.modeOfJob,
          description: data.description || prev.description,
          skills: data.skills || prev.skills,
          requirements: Array.isArray(data.requirements) ? data.requirements : prev.requirements,
          status: data.status ? (data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase()) : prev.status,
          salary: {
            ...prev.salary,
            min: data.minSalary || data.min_salary || prev.salary.min,
            max: data.maxSalary || data.max_salary || prev.salary.max,
            showToCandidate: data.showSalaryToCandidate !== undefined ? data.showSalaryToCandidate : prev.salary.showToCandidate
          },
          registrationOpeningDate: data.registrationOpeningDate || data.registration_opening_date ? new Date(data.registrationOpeningDate || data.registration_opening_date).toISOString().split('T')[0] : prev.registrationOpeningDate,
          registrationClosingDate: data.registrationClosingDate || data.registration_closing_date ? new Date(data.registrationClosingDate || data.registration_closing_date).toISOString().split('T')[0] : prev.registrationClosingDate,
        }));

        // Refresh snapshot with FULL data
        setTimeout(() => {
          setJobDetails(latest => {
            originalJobDetails.current = JSON.stringify(latest);
            return latest;
          });
        }, 100);

        // Load selected cover image
        if (data.selectedImage || data.selected_image) {
          setSelectedImage(data.selectedImage || data.selected_image);
          originalCoverImage.current = data.selectedImage || data.selected_image;
        }

        // ── Load team assignments ────────────────────────────────────────────
        if (data.team_assignments && typeof data.team_assignments === 'object') {
          setTeamAssignments(data.team_assignments);
        }
        if (data.primary_recruiter_id) {
          setJobDetails(prev => ({ ...prev, primaryRecruiterId: String(data.primary_recruiter_id) }));
        }
      })
      .catch(err => { console.error('[JobSettings] Error loading stages:', err); });

    // Fetch job activity log
    const fetchActivityLog = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/${jobId}/activity`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const logData = await res.json();
          setJobActivityLog(logData.activity || []);
        }
      } catch (e) {
        console.error('[JobSettings] Error fetching activity log:', e);
      }
    };
    fetchActivityLog();

    // Fetch used images across account
    const fetchUsedImages = async () => {
      try {
        const accountId = 1; // Placeholder
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/account-used-images?account_id=${accountId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const uData = await res.json();
          // setUsedImages(uData.usedImages || []); // REMOVED unused state variable from previous image selector logic
        }
      } catch (e) {
        console.error('[JobSettings] Error fetching used images:', e);
      }
    };
    fetchUsedImages();
  }, [jobId]); // run once on mount

  // Report dirty state to parent (NewDashboardContainer) for tab/route navigation protection
  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty());
    }
  }, [jobDetails, selectedLocations, onDirtyChange]);

  // Browser close/refresh warning when dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  });

  // Filter local tech domains based on user input
  useEffect(() => {
    const term = jobDetails.domain?.trim().toLowerCase() || '';
    if (!term) {
      setApiDomainSuggestions([]);
      return;
    }

    const matched = domainSuggestions.filter(domain =>
      domain.toLowerCase().includes(term)
    );

    setApiDomainSuggestions(matched.slice(0, 8));
  }, [jobDetails.domain]);

  // Debounced job title duplicate check
  useEffect(() => {
    if (!jobDetails.title?.trim()) {
      setTitleWarning('');
      return;
    }
    const timer = setTimeout(async () => {
      setIsCheckingTitle(true);
      try {
        const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        let url = `${baseUrl}/api/jobs-enhanced/check-title?title=${encodeURIComponent(jobDetails.title)}`;
        if (jobId) url += `&exclude_job_id=${jobId}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success && data.exists) {
          setTitleWarning('⚠️ A different job with this title already exists. Using a unique title is strongly recommended to avoid confusion on the Jobs and Careers pages.');
        } else {
          setTitleWarning('');
        }
      } catch (err) {
        console.warn('[check-title] Failed:', err);
        setTitleWarning('');
      } finally {
        setIsCheckingTitle(false);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [jobDetails.title, jobId]);

  const handleCancelClick = () => {
    if (isDirty()) {
      setShowDiscardModal(true);
    }
    // If not dirty, nothing to discard
  };

  const handleStatusClick = async (newStatus: string) => {
    if (isReadonlyStatus) return;
    if ((jobDetails.status || '').toLowerCase() === newStatus.toLowerCase()) return;

    if (newStatus === 'Active') {
      await confirmStatusChange('Active', 'Re-activated job');
    } else {
      if (newStatus === 'Closed') {
        const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('superadmin_token') || localStorage.getItem('token');
        try {
          const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/${jobId}/active-candidates-count`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          if (res.ok) {
            const data = await res.json();
            setActiveCandidatesCount(data.count || 0);
          }
        } catch (e) {
          console.error('Error fetching candidates count:', e);
        }
      }
      setStatusAction(newStatus as 'Paused' | 'Closed');
      setStatusReason('');
      setShowStatusModal(true);
    }
  };

  const confirmStatusChange = async (status: string, reason: string) => {
    if (!jobId) return;
    setIsChangingStatus(true);
    const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('superadmin_token') || localStorage.getItem('token');

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          status,
          reason,
          isReactivation: status === 'Active' && jobDetails.status === 'Paused'
        })
      });

      if (res.ok) {
        setJobDetails(prev => ({ ...prev, status }));
        const currentSnap = originalJobDetails.current ? JSON.parse(originalJobDetails.current) : {};
        originalJobDetails.current = JSON.stringify({ ...currentSnap, status });

        // Refresh activity log
        const logRes = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/${jobId}/activity`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (logRes.ok) {
          const logData = await logRes.json();
          setJobActivityLog(logData.activity || []);
        }

        setShowStatusModal(false);
        if (onSaveSuccess) onSaveSuccess(); // Refresh parent dashboards
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to update job status');
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Error updating job status.');
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleConfirmDiscard = () => {
    // Reset to original snapshot
    setJobDetails(JSON.parse(originalJobDetails.current));
    setSelectedLocations(JSON.parse(originalLocations.current));
    setShowDiscardModal(false);
  };

  // Guard internal section switching
  const handleSectionClick = (sectionId: string) => {
    if (!validateSection(activeSection)) {
      return; // prevent navigation if current section is invalid
    }

    if (isDirty()) {
      setPendingSectionId(sectionId);
      setShowNavigationWarningModal(true);
    } else {
      setActiveSection(sectionId);
    }
  };

  const handleConfirmSectionNavigation = () => {
    // Discard changes and navigate to pending section
    setJobDetails(JSON.parse(originalJobDetails.current));
    setSelectedLocations(JSON.parse(originalLocations.current));
    setShowNavigationWarningModal(false);
    if (pendingSectionId) {
      setActiveSection(pendingSectionId);
      setPendingSectionId(null);
    }
  };

  const handleCancelSectionNavigation = () => {
    setShowNavigationWarningModal(false);
    setPendingSectionId(null);
  };

  const SECTION_ORDER = ['basic', 'image', 'timeline', 'location', 'requirements', 'compensation', 'description', 'process', 'team'];

  const handleNextSection = () => {
    const currentIndex = SECTION_ORDER.indexOf(activeSection);
    if (currentIndex < SECTION_ORDER.length - 1) {
      setActiveSection(SECTION_ORDER[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevSection = () => {
    const currentIndex = SECTION_ORDER.indexOf(activeSection);
    if (currentIndex > 0) {
      setActiveSection(SECTION_ORDER[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const handleSaveClick = () => {
    if (titleWarning) {
      // Don't allow saving when a duplicate title exists
      setErrors(prev => ({ ...prev, title: getDuplicateTitleError(titleWarning) }));
      return;
    }
    if (isDirty()) {
      if (isRecruiterRole) {
        setShowApprovalModal(true);
      } else {
        setShowSaveModal(true);
      }
    }
  };

  const handleConfirmApprovalRequest = async () => {
    try {
      setIsSaving(true);

      const payload = {
        job_id: jobId || 1, // Fallback to 1 if no valid slug
        changes_json: {
          ...jobDetails,
          locations: selectedLocations
        }
      };

      const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('superadmin_token') || localStorage.getItem('token');

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/edit-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit edit request');
      }

      setIsSaving(false);
      setShowApprovalModal(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);

      originalJobDetails.current = JSON.stringify(jobDetails);
      originalLocations.current = JSON.stringify(selectedLocations);
      // Explicitly notify parent that dirty state is cleared after save
      if (onDirtyChange) onDirtyChange(false);
    } catch (error) {
      console.error('Error submitting edit request:', error);
      setIsSaving(false);
      setShowApprovalModal(false);
      alert('Failed to submit edit request. Please try again.');
    }
  };

  const handleConfirmSave = async () => {
    try {
      setIsSaving(true);

      const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('superadmin_token') || localStorage.getItem('token');
      if (jobId && token) {
        // Save hiring stages
        const stagesRes = await fetch(
          `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/update-stages/${jobId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ interview_stages: jobDetails.interviewStages })
          }
        );
        if (!stagesRes.ok) {
          const err = await stagesRes.json().catch(() => ({}));
          throw new Error(err.error || `Server error ${stagesRes.status}`);
        }

        // Save team assignments
        if (Object.keys(teamAssignments).length > 0 || jobDetails.primaryRecruiterId) {
          await fetch(
            `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/${jobId}/team`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                team_assignments: teamAssignments,
                primary_recruiter_id: jobDetails.primaryRecruiterId ? Number(jobDetails.primaryRecruiterId) : null
              })
            }
          ).catch(err => console.warn('[JobSettings] Team save failed (non-blocking):', err));
        }

        // Save selected image if changed
        if (selectedImage) {
          await fetch(
            `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/update-image/${jobId}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ selected_image: selectedImage, cover_image_id: selectedImageId })
            }
          ).catch(() => { }); // non-blocking
        }
      }

      // Update the snapshot to the new saved state
      originalJobDetails.current = JSON.stringify(jobDetails);
      originalLocations.current = JSON.stringify(selectedLocations);
      originalCoverImage.current = selectedImage;

      // Explicitly clear dirty flag in parent
      if (onDirtyChange) onDirtyChange(false);
      // Notify parent to refresh pipeline stages
      if (onSaveSuccess) onSaveSuccess();

      setIsSaving(false);
      setShowSaveModal(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      console.error('Error saving job settings:', error);
      setIsSaving(false);
      setShowSaveModal(false);
      alert('Failed to save job settings. Please try again.');
    }
  };

  // Predefined stage options for quick selection — must match InterviewStage enum values
  const predefinedStages = [
    'CV Shortlist',
    'HM Review',
    'Assignment',
    'L1 Technical',
    'L2 Technical',
    'L3 Technical',
    'L4 Technical',
    'HR Round',
    'Management Round',
    'Offer Extended',
    'Reference Check',
    'Background Verification'
  ];

  // Stage name → responsibility key mapping (mirrors PipelineBoard)
  const STAGE_TO_RESPONSIBILITY: Record<string, { value: string; label: string }> = {
    'Screening': { value: 'screening_reviewer', label: 'Screening Reviewer' },
    'CV Shortlist': { value: 'cv_shortlist_reviewer', label: 'CV Shortlist Reviewer' },
    'HM Review': { value: 'hiring_manager', label: 'Hiring Manager' },
    'Assignment': { value: 'assignment_reviewer', label: 'Assignment Reviewer' },
    'L1 Technical': { value: 'l1_technical_interviewer', label: 'L1 Technical Interviewer' },
    'L2 Technical': { value: 'l2_technical_interviewer', label: 'L2 Technical Interviewer' },
    'L3 Technical': { value: 'l3_technical_interviewer', label: 'L3 Technical Interviewer' },
    'L4 Technical': { value: 'l4_technical_interviewer', label: 'L4 Technical Interviewer' },
    'HR Round': { value: 'hr_round', label: 'HR Round' },
    'Management Round': { value: 'management_round', label: 'Management Round' },
  };

  // Returns responsibility list derived from the currently configured interview stages
  const getResponsibilitiesForStages = (stages: any[]) => {
    const result: { value: string; label: string }[] = [];
    stages.forEach(stage => {
      const resp = STAGE_TO_RESPONSIBILITY[stage.name];
      if (resp && !result.find(r => r.value === resp.value)) result.push(resp);
    });
    return result;
  };

  // Options
  const domainOptions = [
    'Software Development', 'Data Science', 'Machine Learning', 'Web Development',
    'Mobile Development', 'DevOps', 'Quality Assurance', 'UI/UX Design',
    'Product Management', 'Digital Marketing', 'Sales', 'Human Resources', 'Finance', 'Operations'
  ];

  const experienceOptions = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'];
  const openingsOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '10+'];
  const modeOptions = ['Remote', 'Hybrid', 'On-site'];

  const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
    'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
    'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
    'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad'
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field === 'title' && typeof value === 'string') {
      // Auto-format: title-case + preserve known abbreviations (AI, ML, UI, etc.)
      setJobDetails(prev => ({
        ...prev,
        title: formatJobTitle(value)
      }));
    } else {
      setJobDetails(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const execEditorCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setIsUserEditing(true);
      handleInputChange('description', editorRef.current.innerHTML);
      if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
    }
  };

  useEffect(() => {
    if (editorRef.current && !isUserEditing) {
      // Sync DB/State data to contentEditable div when loaded/updated externally
      editorRef.current.innerHTML = jobDetails.description || '';
    }
  }, [jobDetails.description, isUserEditing]);

  const generateDescription = async () => {
    if (uploadedPdfFile) {
      setIsGeneratingFromPdf(true);
      try {
        const formDataGenerate = new FormData();
        formDataGenerate.append('jdFile', uploadedPdfFile);

        const generateResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/generate-jd-from-pdf`, {
          method: 'POST',
          body: formDataGenerate
        });
        const generateData = await generateResponse.json();

        if (generateData.success && generateData.jobDescription) {
          setIsUserEditing(false);
          handleInputChange('description', generateData.jobDescription);
          if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
          setShowSuccessModal(true);
        } else {
          alert('Failed to generate description from PDF');
        }
      } catch (error) {
        console.error('Error generating from PDF:', error);
        alert('Failed to generate description from PDF');
      } finally {
        setIsGeneratingFromPdf(false);
      }
    } else {
      const description = `We are looking for a talented ${jobDetails.title} to join our team.

<div><br></div>
<p><strong>Key Responsibilities:</strong></p>
<ul>
<li>Develop and maintain high-quality solutions</li>
<li>Collaborate with cross-functional teams</li>
<li>Participate in discussions</li>
<li>Contribute to architectural decisions</li>
</ul>
<div><br></div>
<p><strong>Requirements:</strong></p>
<ul>
<li>${jobDetails.minExperience}-${jobDetails.maxExperience} years of experience</li>
<li>Strong technical skills and problem-solving abilities</li>
<li>Excellent communication and teamwork skills</li>
</ul>
<div><br></div>
<p><strong>What We Offer:</strong></p>
<ul>
<li>Competitive salary package</li>
<li>Flexible working arrangements</li>
<li>Growth opportunities</li>
</ul>`;

      setIsUserEditing(false);
      handleInputChange('description', description);
      if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
    }
  };

  const handleSalaryChange = (field: string, value: number | string | boolean) => {
    setJobDetails(prev => ({
      ...prev,
      salary: {
        ...prev.salary,
        [field]: value
      }
    }));
  };

  const addRequirement = () => {
    setJobDetails(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setJobDetails(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const removeRequirement = (index: number) => {
    setJobDetails(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addLocation = (city: string) => {
    if (!selectedLocations.includes(city)) {
      setSelectedLocations([...selectedLocations, city]);
      setLocationInput('');
      setShowLocationSuggestions(false);
      if (errors.locations) setErrors(prev => ({ ...prev, locations: '' }));
    }
  };

  const removeLocation = (city: string) => {
    setSelectedLocations(selectedLocations.filter(loc => loc !== city));
  };

  const addSkill = () => {
    if (skillInput.trim() && !jobDetails.skills.includes(skillInput.trim())) {
      setJobDetails(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
      if (errors.skills) setErrors(prev => ({ ...prev, skills: '' }));
    }
  };

  const removeSkill = (skill: string) => {
    setJobDetails(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };



  const addHiringStage = (stageName?: string) => {
    const nameToAdd = stageName || newStageInput;
    if (nameToAdd.trim()) {
      const newStage: JobStage = {
        id: `stage_${Date.now()}`,
        name: nameToAdd.trim(),
        type: currentStageType,
        isMandatory: false,
        remarksRequired: true,
        order: jobDetails.interviewStages.length + 1
      };

      setJobDetails(prev => ({
        ...prev,
        interviewStages: [...prev.interviewStages, newStage]
      }));
      setNewStageInput('');
      setShowNewStageInput(false);
    }
  };

  const removeHiringStage = (index: number) => {
    const stage = jobDetails.interviewStages[index];
    if (stage.isMandatory) return; // Prevent removing mandatory stages

    // Block removal if candidates are currently in this stage
    const count = occupiedStages[stage.name] || 0;
    if (count > 0) {
      setBlockedStageName(stage.name);
      return;
    }

    setJobDetails(prev => ({
      ...prev,
      interviewStages: prev.interviewStages.filter((_, i) => i !== index)
    }));
  };

  const moveStageUp = (index: number) => {
    if (index > 0) {
      const newStages = [...jobDetails.interviewStages];
      [newStages[index - 1], newStages[index]] = [newStages[index], newStages[index - 1]];
      // Update order
      newStages.forEach((s, i) => s.order = i + 1);
      setJobDetails(prev => ({ ...prev, interviewStages: newStages }));
    }
  };

  const moveStageDown = (index: number) => {
    if (index < jobDetails.interviewStages.length - 1) {
      const newStages = [...jobDetails.interviewStages];
      [newStages[index], newStages[index + 1]] = [newStages[index + 1], newStages[index]];
      // Update order
      newStages.forEach((s, i) => s.order = i + 1);
      setJobDetails(prev => ({ ...prev, interviewStages: newStages }));
    }
  };

  const updateStageName = (index: number, newName: string) => {
    setJobDetails(prev => ({
      ...prev,
      interviewStages: prev.interviewStages.map((stage, i) =>
        i === index ? { ...stage, name: newName } : stage
      )
    }));
  };

  const toggleStageRemarks = (index: number) => {
    setJobDetails(prev => ({
      ...prev,
      interviewStages: prev.interviewStages.map((stage, i) =>
        i === index ? { ...stage, remarksRequired: !stage.remarksRequired } : stage
      )
    }));
  };

  // Fetch occupied stages: how many candidates are currently in each stage for this job
  useEffect(() => {
    const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('superadmin_token') || localStorage.getItem('token');
    if (!jobId || !token) return;
    fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/pipeline-stages/${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.success && Array.isArray(data.stages)) {
          const counts: Record<string, number> = {};
          data.stages.forEach((s: any) => {
            const stage = s.current_stage || '';
            if (stage) counts[stage] = (counts[stage] || 0) + 1;
          });
          setOccupiedStages(counts);
        }
      })
      .catch(() => { });
  }, [jobId]);

  // Fetch users for team assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('superadmin_token');
        if (!token) return;

        // TODO: Replace with actual account_id from job details or props
        const accountId = 1; // Placeholder - should come from job data

        const isSuperAdmin = !!localStorage.getItem('superadmin_token');
        const endpoint = isSuperAdmin
          ? `http://localhost:8000/api/superadmin/users?account_id=${accountId}`
          : `http://localhost:8000/api/auth/users?account_id=${accountId}`;

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('[JobSettings] Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    setHeaderActions(
      <div className="flex gap-2">
        <button
          onClick={handleCancelClick}
          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveClick}
          disabled={!!titleWarning || isCheckingTitle}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </div>
    );
    return () => setHeaderActions(null);
  }, [setHeaderActions, jobDetails, selectedLocations]);

  const sections = [
    { id: 'basic', label: 'Basic Information', icon: Info },
    { id: 'image', label: 'Job Image', icon: Image },
    { id: 'timeline', label: 'Timeline & Dates', icon: Calendar },
    { id: 'location', label: 'Location & Mode', icon: MapPin },
    { id: 'requirements', label: 'Requirements & Skills', icon: CheckSquare },
    { id: 'compensation', label: 'Compensation', icon: DollarSign },
    { id: 'description', label: 'Job Description', icon: FileText },
    { id: 'process', label: 'Hiring Process', icon: ClipboardList },
    { id: 'team', label: 'Team & Recruiters', icon: Users },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}


      {/* Job Status Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Status</h3>
          <p className="text-sm text-gray-600 mb-4">Control the current state of this job posting. Active jobs are visible, paused jobs are temporarily hidden, and closed jobs are archived.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {([
              {
                value: 'Active',
                label: 'Active',
                description: 'Accepting applications',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                activeColor: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20',
                activeDot: 'bg-emerald-500',
                activeText: 'text-emerald-700',
                activeIcon: 'text-emerald-600',
                inactiveColor: 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'
              },
              {
                value: 'Paused',
                label: 'Paused',
                description: 'Temporarily on hold',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                activeColor: 'border-amber-500 bg-amber-50 ring-2 ring-amber-500/20',
                activeDot: 'bg-amber-500',
                activeText: 'text-amber-700',
                activeIcon: 'text-amber-600',
                inactiveColor: 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
              },
              {
                value: 'Closed',
                label: 'Closed',
                description: 'No longer accepting',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                ),
                activeColor: 'border-red-500 bg-red-50 ring-2 ring-red-500/20',
                activeDot: 'bg-red-500',
                activeText: 'text-red-700',
                activeIcon: 'text-red-600',
                inactiveColor: 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/50'
              }
            ] as const).map((option) => {
              const isSelected = (jobDetails.status || '').toLowerCase() === option.value.toLowerCase();
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleStatusClick(option.value)}
                  disabled={isReadonlyStatus || isChangingStatus}
                  title={
                    option.value === 'Paused' ? 'Temporarily hide this job from the careers page.' :
                      option.value === 'Closed' ? 'Permanently close this job opening.' :
                        'Make this job active and visible.'
                  }
                  className={`relative flex flex-col items-center justify-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${isReadonlyStatus
                    ? (isSelected ? option.activeColor : 'border-gray-100 bg-gray-50 opacity-60 cursor-default')
                    : (isSelected ? option.activeColor : option.inactiveColor + ' cursor-pointer')
                    } ${isChangingStatus ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {/* Selection indicator dot */}
                  <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full transition-all duration-200 ${isSelected ? `${option.activeDot} scale-100` : 'bg-gray-300 scale-75'
                    }`}>
                    {isSelected && (
                      <div className={`absolute inset-0 rounded-full ${option.activeDot} animate-ping opacity-40`} />
                    )}
                  </div>

                  {/* Icon */}
                  <div className={`transition-colors duration-200 ${isSelected ? option.activeIcon : 'text-gray-400'
                    }`}>
                    {option.icon}
                  </div>

                  {/* Label */}
                  <span className={`text-sm font-semibold transition-colors duration-200 ${isSelected ? option.activeText : 'text-gray-700'
                    }`}>
                    {option.label}
                  </span>

                  {/* Description */}
                  <span className={`text-xs text-center transition-colors duration-200 ${isSelected ? option.activeText + ' opacity-80' : 'text-gray-500'
                    }`}>
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Job Activity Log */}
      {jobActivityLog.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-gray-500" />
            Job Activity Log
          </h3>
          <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
            {jobActivityLog.map((log) => (
              <div key={log.id} className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${log.action === 'Created' ? 'bg-blue-500' :
                  log.action === 'Active' ? 'bg-emerald-500' :
                    log.action === 'Paused' ? 'bg-amber-500' :
                      log.action === 'Re-activated' ? 'bg-indigo-500' :
                        'bg-red-500'
                  }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {log.action} <span className="text-gray-500 font-normal">by {log.performedBy}</span>
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {log.reason && (
                    <p className="text-sm text-gray-600 mt-1 italic">"{log.reason}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${activeSection === section.id
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {activeSection === 'basic' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jobDetails.title}
                      onChange={(e) => {
                        handleInputChange('title', e.target.value);
                        if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    {isCheckingTitle && !errors.title && (
                      <p className="text-gray-400 text-xs mt-1">Checking title availability...</p>
                    )}
                    {titleWarning && !errors.title && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-400 rounded-md flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <span className="text-red-600 text-sm font-medium">⚠️ This job title already exists. Please choose another name.</span>
                      </div>
                    )}
                    {!titleWarning && !isCheckingTitle && jobDetails.title.trim() && !errors.title && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 text-sm font-medium">This job title is available!</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Domain <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={jobDetails.domain}
                        onChange={(e) => {
                          handleInputChange('domain', e.target.value);
                          if (errors.domain) setErrors(prev => ({ ...prev, domain: '' }));
                        }}
                        onFocus={() => setShowDomainSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowDomainSuggestions(false), 200)}
                        placeholder="Ex. Software Development"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.domain ? 'border-red-500' : 'border-gray-300'}`}
                        autoComplete="off"
                      />
                      {errors.domain && <p className="text-red-500 text-sm mt-1">{errors.domain}</p>}
                      {showDomainSuggestions && apiDomainSuggestions.length > 0 && (
                        <div className="dropdown-content absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-50 transition-all duration-300 ease-in-out">
                          <div className="p-2">
                            {apiDomainSuggestions.map((domain, index) => (
                              <div
                                key={index}
                                onClick={() => {
                                  // Update domain
                                  // Can't directly call handleInputChange since we pass the value manually instead of event
                                  setJobDetails(prev => ({ ...prev, domain }));
                                  setShowDomainSuggestions(false);
                                  if (errors.domain) setErrors(prev => ({ ...prev, domain: '' }));
                                }}
                                className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm rounded text-gray-900 bg-white mb-1 transition-colors duration-200"
                              >
                                {domain}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
                    <select
                      value={jobDetails.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Experience (Years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={jobDetails.minExperience}
                      onChange={(e) => {
                        handleInputChange('minExperience', e.target.value);
                        if (errors.minExperience) setErrors(prev => ({ ...prev, minExperience: '' }));
                      }}
                      placeholder="e.g. 2"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.minExperience ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.minExperience && <p className="text-red-500 text-sm mt-1">{errors.minExperience}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Experience (Years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={jobDetails.maxExperience}
                      onChange={(e) => {
                        handleInputChange('maxExperience', e.target.value);
                        if (errors.maxExperience) setErrors(prev => ({ ...prev, maxExperience: '' }));
                      }}
                      placeholder="e.g. 5"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.maxExperience ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.maxExperience && <p className="text-red-500 text-sm mt-1">{errors.maxExperience}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Openings <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={jobDetails.numberOfOpenings}
                      onChange={(e) => {
                        handleInputChange('numberOfOpenings', e.target.value);
                        if (errors.numberOfOpenings) setErrors(prev => ({ ...prev, numberOfOpenings: '' }));
                      }}
                      min="1"
                      placeholder="Enter number of openings"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.numberOfOpenings ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.numberOfOpenings && <p className="text-red-500 text-sm mt-1">{errors.numberOfOpenings}</p>}
                  </div>
                </div>


                <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleNextSection}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'image' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Job Opening Image</h3>

                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Select an attractive image for your job opening to make it stand out to candidates.
                  </div>

                  {/* Current cover image */}
                  {selectedImage ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-indigo-400 ring-2 ring-indigo-100 max-w-2xl">
                      <img
                        src={selectedImage}
                        alt="Current job cover"
                        className="w-full aspect-[2/1] object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Current Cover
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-sm text-gray-500">No cover image selected</p>
                      </div>
                    </div>
                  )}

                  {/* Image Selection Button */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm transition-all flex items-center gap-2"
                    >
                      <Image className="w-4 h-4" />
                      {selectedImage ? 'Change Cover Image' : 'Select Image'}
                    </button>
                  </div>

                  {/* Image Guidelines */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Image Guidelines</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Recommended size: 1200x600 pixels</li>
                      <li>• Formats: JPG, PNG, WebP</li>
                      <li>• Maximum file size: 2MB</li>
                      <li>• Use professional, relevant imagery</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handlePrevSection}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSection}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'timeline' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Timeline & Dates</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Opening Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={jobDetails.registrationOpeningDate}
                      onChange={(e) => {
                        handleInputChange('registrationOpeningDate', e.target.value);
                        if (errors.registrationOpeningDate) setErrors(prev => ({ ...prev, registrationOpeningDate: '' }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.registrationOpeningDate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.registrationOpeningDate && <p className="text-red-500 text-sm mt-1">{errors.registrationOpeningDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Closing Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={jobDetails.registrationClosingDate}
                      onChange={(e) => {
                        handleInputChange('registrationClosingDate', e.target.value);
                        if (errors.registrationClosingDate) setErrors(prev => ({ ...prev, registrationClosingDate: '' }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.registrationClosingDate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.registrationClosingDate && <p className="text-red-500 text-sm mt-1">{errors.registrationClosingDate}</p>}
                  </div>
                </div>

                <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handlePrevSection}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSection}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'location' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Location & Work Mode</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mode of Job <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={jobDetails.modeOfJob}
                    onChange={(e) => {
                      handleInputChange('modeOfJob', e.target.value);
                      if (errors.modeOfJob) setErrors(prev => ({ ...prev, modeOfJob: '' }));
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.modeOfJob ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    {modeOptions.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                  {errors.modeOfJob && <p className="text-red-500 text-sm mt-1">{errors.modeOfJob}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Locations <span className="text-red-500">*</span>
                  </label>

                  {selectedLocations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedLocations.map(location => (
                        <span key={location} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {location}
                          <button
                            type="button"
                            onClick={() => removeLocation(location)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => {
                        setLocationInput(e.target.value);
                        setShowLocationSuggestions(true);
                      }}
                      onFocus={() => setShowLocationSuggestions(true)}
                      placeholder="Search and add cities..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {showLocationSuggestions && locationInput && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {indianCities
                          .filter(city =>
                            city.toLowerCase().includes(locationInput.toLowerCase()) &&
                            !selectedLocations.includes(city)
                          )
                          .slice(0, 10)
                          .map(city => (
                            <div
                              key={city}
                              onClick={() => addLocation(city)}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                            >
                              {city}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {errors.locations && <p className="text-red-500 text-sm mt-2">{errors.locations}</p>}
                </div>

                <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handlePrevSection}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSection}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'description' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Job Description</h3>
                  <button
                    type="button"
                    onClick={generateDescription}
                    disabled={isGeneratingFromPdf}
                    className={`flex items-center gap-2 px-4 py-2 ${isGeneratingFromPdf
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : uploadedPdfFile
                        ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      } rounded-lg text-sm font-medium transition-all`}
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGeneratingFromPdf ? 'Generating...' : uploadedPdfFile ? 'Generate from PDF' : 'Generate Description'}
                  </button>
                </div>

                <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Description PDF <span className="text-gray-500 font-normal">(Optional context)</span></label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploadingPdf(true);
                          try {
                            const formDataPdf = new FormData();
                            formDataPdf.append('jdFile', file);
                            const token = sessionStorage.getItem('fluidjobs_token') || localStorage.getItem('superadmin_token') || localStorage.getItem('token');

                            const uploadResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/jobs-enhanced/upload-jd-pdf`, {
                              method: 'POST',
                              headers: { 'Authorization': `Bearer ${token}` },
                              body: formDataPdf
                            });

                            const uploadData = await uploadResponse.json();
                            if (uploadData.success) {
                              setUploadedPdfUrl(uploadData.filename);
                              setPdfFileName(uploadData.originalName);
                              setUploadedPdfFile(file);
                            } else {
                              alert('Failed to upload PDF');
                            }
                          } catch (error) {
                            console.error('Error uploading PDF:', error);
                            alert('Failed to upload PDF');
                          } finally {
                            setIsUploadingPdf(false);
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="text-gray-500">
                      {isUploadingPdf ? <span className="text-sm">🔄 Uploading...</span> : <Upload className="w-5 h-5" />}
                    </div>
                  </div>
                  {pdfFileName && <p className="text-sm text-green-600 mt-2 font-medium">✓ {pdfFileName} uploaded. Click "Generate from PDF" to extract text.</p>}
                </div>

                <div className="rich-text-editor">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                  <div className={`border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}>
                    <div className="rich-text-toolbar flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-300 rounded-t-lg flex-wrap">
                      <select
                        onChange={(e) => execEditorCommand('formatBlock', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none"
                        defaultValue="p"
                      >
                        <option value="p">Paragraph</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                      </select>

                      <div className="w-px h-6 bg-gray-300"></div>

                      <button type="button" onClick={() => execEditorCommand('bold')} className="p-2 text-gray-700 hover:bg-gray-200 rounded" title="Bold">
                        <Bold className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => execEditorCommand('italic')} className="p-2 text-gray-700 hover:bg-gray-200 rounded" title="Italic">
                        <Italic className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => execEditorCommand('underline')} className="p-2 text-gray-700 hover:bg-gray-200 rounded" title="Underline">
                        <Underline className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => execEditorCommand('strikeThrough')} className="p-2 text-gray-700 hover:bg-gray-200 rounded" title="Strikethrough">
                        <Strikethrough className="w-4 h-4" />
                      </button>

                      <div className="w-px h-6 bg-gray-300"></div>

                      <button type="button" onClick={() => execEditorCommand('insertUnorderedList')} className="px-3 py-1 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium" title="Bullet List">
                        • List
                      </button>
                      <button type="button" onClick={() => execEditorCommand('insertOrderedList')} className="px-3 py-1 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium" title="Numbered List">
                        1. List
                      </button>

                      <div className="w-px h-6 bg-gray-300"></div>

                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt('Enter URL:');
                          if (url) execEditorCommand('createLink', url);
                        }}
                        className="px-3 py-1 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium"
                      >
                        Link
                      </button>
                      <button
                        type="button"
                        onClick={() => execEditorCommand('unlink')}
                        className="px-3 py-1 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium"
                      >
                        Unlink
                      </button>

                      <div className="flex-1"></div>
                      <button
                        type="button"
                        onClick={() => {
                          if (editorRef.current) {
                            editorRef.current.innerHTML = '';
                            handleInputChange('description', '');
                          }
                        }}
                        className="px-3 py-1 hover:bg-red-50 border border-transparent hover:border-red-200 rounded text-sm text-red-600 transition-colors"
                      >
                        Clear
                      </button>
                    </div>

                    <div
                      ref={editorRef}
                      contentEditable
                      onInput={handleEditorChange}
                      className="min-h-[250px] max-h-[500px] overflow-y-auto p-4 focus:outline-none bg-white rounded-b-lg text-sm text-gray-800"
                      style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                      data-placeholder="Enter job description here..."
                    />
                  </div>
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
              </div>
            )}

            {activeSection === 'requirements' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Requirements & Skills</h3>
                </div>

                {/* Requirements */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">Requirements</label>
                    <button
                      onClick={addRequirement}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all"
                    >
                      Add Requirement
                    </button>
                  </div>

                  <div className="space-y-3">
                    {jobDetails.requirements.map((req, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={req}
                          onChange={(e) => updateRequirement(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter requirement..."
                        />
                        <button
                          onClick={() => removeRequirement(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Skills <span className="text-red-500">*</span>
                  </label>

                  {jobDetails.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {jobDetails.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-gray-800 text-white rounded-full text-sm"
                        >
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="hover:text-gray-300">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="Add a skill and press Enter"
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.skills ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                      Add
                    </button>
                  </div>
                  {errors.skills && <p className="text-red-500 text-sm mt-2">{errors.skills}</p>}
                </div>

                <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handlePrevSection}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSection}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'compensation' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Compensation</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Salary</label>
                    <input
                      type="number"
                      value={jobDetails.salary.min}
                      onChange={(e) => {
                        handleSalaryChange('min', parseInt(e.target.value));
                        if (errors.minSalary) setErrors(prev => ({ ...prev, minSalary: '' }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.minSalary ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.minSalary && <p className="text-red-500 text-sm mt-1">{errors.minSalary}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Salary</label>
                    <input
                      type="number"
                      value={jobDetails.salary.max}
                      onChange={(e) => {
                        handleSalaryChange('max', parseInt(e.target.value));
                        if (errors.maxSalary) setErrors(prev => ({ ...prev, maxSalary: '' }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.maxSalary ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.maxSalary && <p className="text-red-500 text-sm mt-1">{errors.maxSalary}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={jobDetails.salary.currency}
                      onChange={(e) => handleSalaryChange('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={jobDetails.salary.showToCandidate}
                      onChange={(e) => handleSalaryChange('showToCandidate', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Show salary to candidates</span>
                  </label>
                </div>

                <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handlePrevSection}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSection}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'team' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Assign Hiring Team</h3>
                  <p className="text-sm text-gray-500 mt-1">Select responsibilities for each team member for this specific job opening.</p>
                </div>

                {/* Primary Sourcing Recruiter Selection */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Primary Sourcing Recruiter
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select the main recruiter responsible for sourcing and candidate pipelines for this role.
                  </p>
                  <select
                    value={jobDetails.primaryRecruiterId}
                    onChange={(e) => setJobDetails({ ...jobDetails, primaryRecruiterId: e.target.value })}
                    className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">-- Select Primary Recruiter --</option>
                    {users.filter(u => ['Recruiter', 'HR', 'Admin', 'Interviewer', 'Sales', 'SuperAdmin'].includes(u.role)).map(user => (
                      <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                    ))}
                  </select>
                </div>

                {users.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <svg className="w-12 h-12 text-yellow-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm font-medium text-yellow-800">No users found for this account</p>
                    <p className="text-xs text-yellow-600 mt-1">Please add users to your account before assigning team roles.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.map(user => {
                      const userAssignments = teamAssignments[user.id] || [];
                      const hasAssignments = userAssignments.length > 0;

                      return (
                        <div
                          key={user.id}
                          className={`p-4 rounded-lg border transition-all ${hasAssignments
                            ? 'bg-blue-50/30 border-blue-200'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          {/* User Info Section */}
                          <div className="flex items-start gap-3 mb-3">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                              {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                            </div>

                            {/* Name, Role, and Email */}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-900 truncate">{user.name || 'Unknown User'}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                  {user.role || 'User'}
                                </span>
                                <span className="text-xs text-gray-400 truncate">{user.email}</span>
                              </div>
                            </div>
                          </div>

                          {/* Assigned Responsibilities Section */}
                          {userAssignments.length > 0 && (
                            <div className="mb-3 pb-3 border-b border-gray-200">
                              <div className="text-xs font-medium text-gray-500 mb-2">Assigned Responsibilities:</div>
                              <div className="flex flex-wrap gap-1.5">
                                {userAssignments.map(responsibility => (
                                  <span
                                    key={responsibility}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium"
                                  >
                                    {responsibility.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setTeamAssignments(prev => ({
                                          ...prev,
                                          [user.id]: prev[user.id].filter(r => r !== responsibility)
                                        }));
                                      }}
                                      className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                    >
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                      </svg>
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Hidden Select for Form Compatibility */}
                          <select
                            multiple
                            value={userAssignments}
                            onChange={(e) => {
                              const selected = Array.from(e.target.selectedOptions, option => option.value);
                              setTeamAssignments(prev => ({
                                ...prev,
                                [user.id]: selected
                              }));
                            }}
                            className="hidden"
                            id={`responsibilities-${user.id}`}
                          >
                            {getResponsibilitiesForStages(jobDetails.interviewStages).map(r => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>

                          {/* Add Responsibility Dropdown */}
                          <div className="relative">
                            <details className="group">
                              <summary className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer font-medium list-none flex items-center gap-1">
                                <span>+ Add responsibility</span>
                                <svg className="w-3 h-3 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </summary>
                              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                <div className="p-1">
                                  {(() => {
                                    const allResponsibilities = getResponsibilitiesForStages(jobDetails.interviewStages);

                                    const isAdminOrSuperAdmin = user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'superadmin';
                                    const allResponsibilityValues = allResponsibilities.map(r => r.value);
                                    const hasAllResponsibilities = allResponsibilityValues.every(value => userAssignments.includes(value));

                                    return (
                                      <>
                                        {isAdminOrSuperAdmin && (
                                          <>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setTeamAssignments(prev => {
                                                  return {
                                                    ...prev,
                                                    [user.id]: hasAllResponsibilities ? [] : allResponsibilityValues
                                                  };
                                                });
                                              }}
                                              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors flex items-center gap-2 ${hasAllResponsibilities ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                                }`}
                                            >
                                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${hasAllResponsibilities ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                                }`}>
                                                {hasAllResponsibilities && (
                                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                  </svg>
                                                )}
                                              </div>
                                              All responsibilities
                                            </button>
                                            <div className="border-t border-gray-200 my-1"></div>
                                          </>
                                        )}
                                        {allResponsibilities.map(option => {
                                          const isSelected = userAssignments.includes(option.value);
                                          return (
                                            <button
                                              key={option.value}
                                              type="button"
                                              onClick={() => {
                                                setTeamAssignments(prev => {
                                                  const current = prev[user.id] || [];
                                                  return {
                                                    ...prev,
                                                    [user.id]: isSelected
                                                      ? current.filter(r => r !== option.value)
                                                      : [...current, option.value]
                                                  };
                                                });
                                              }}
                                              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors flex items-center gap-2 ${isSelected ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                                }`}
                                            >
                                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                                }`}>
                                                {isSelected && (
                                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                  </svg>
                                                )}
                                              </div>
                                              {option.label}
                                            </button>
                                          );
                                        })}
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </details>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Summary */}
                {Object.keys(teamAssignments).filter(userId => teamAssignments[userId].length > 0).length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">
                          {Object.keys(teamAssignments).filter(userId => teamAssignments[userId].length > 0).length} team member(s) assigned
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          These assignments will determine stage ownership and notification routing in the hiring pipeline.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage coverage checklist */}
                {(() => {
                  const required = getResponsibilitiesForStages(jobDetails.interviewStages);
                  const allAssigned = Object.values(teamAssignments).flat();
                  const uncovered = required.filter(r => !allAssigned.includes(r.value));
                  return (
                    <div className={`mt-4 p-4 rounded-lg border ${uncovered.length === 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                      <p className={`text-sm font-semibold mb-2 ${uncovered.length === 0 ? 'text-green-800' : 'text-amber-800'}`}>
                        {uncovered.length === 0 ? '✅ All stages have assigned owners' : `⚠️ ${uncovered.length} stage(s) still need an owner`}
                      </p>
                      <div className="space-y-1">
                        {required.map(r => {
                          const isCovered = allAssigned.includes(r.value);
                          return (
                            <div key={r.value} className="flex items-center gap-2 text-xs">
                              <span className={isCovered ? 'text-green-600' : 'text-amber-600'}>{isCovered ? '✓' : '✗'}</span>
                              <span className={isCovered ? 'text-green-700' : 'text-amber-700 font-medium'}>{r.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handlePrevSection}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSection}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'process' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Hiring Process</h3>
                  <span className="text-sm text-gray-500">{jobDetails.interviewStages.length} stages</span>
                </div>

                <div className="space-y-3">
                  {jobDetails.interviewStages.map((stage, index) => {
                    const occupiedCount = occupiedStages[stage.name] || 0;
                    const isOccupied = occupiedCount > 0;
                    return (
                      <div key={index} className="group flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
                        {/* Drag Handle */}
                        <div className="flex flex-col gap-1 opacity-40 group-hover:opacity-60 cursor-move">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                        </div>

                        {/* Stage Number */}
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${stage.isMandatory ? 'bg-amber-100 text-amber-700' : isOccupied ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-600'}`}>
                          {index + 1}
                        </span>

                        {/* Stage Name - Editable or Display */}
                        <div className="flex-1">
                          {stage.isMandatory ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{stage.name}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 uppercase tracking-wide">
                                Mandatory
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={stage.name}
                                onChange={(e) => updateStageName(index, e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-700 focus:bg-white focus:border focus:border-blue-300 focus:rounded px-2 py-1 transition-all"
                                placeholder="Enter stage name..."
                              />
                              {isOccupied && (
                                <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-semibold">
                                  🔒 {occupiedCount} candidate{occupiedCount > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Move Up */}
                          <button
                            onClick={() => moveStageUp(index)}
                            disabled={index === 0 || stage.isMandatory || jobDetails.interviewStages[index - 1].isMandatory}
                            className={`p-1 transition-colors ${index === 0 || stage.isMandatory || jobDetails.interviewStages[index - 1].isMandatory ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600'}`}
                            title={stage.isMandatory || jobDetails.interviewStages[index - 1]?.isMandatory ? "Cannot reorder mandatory stages" : "Move up"}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>

                          {/* Move Down */}
                          <button
                            onClick={() => moveStageDown(index)}
                            disabled={index === jobDetails.interviewStages.length - 1 || stage.isMandatory || jobDetails.interviewStages[index + 1].isMandatory}
                            className={`p-1 transition-colors ${index === jobDetails.interviewStages.length - 1 || stage.isMandatory || jobDetails.interviewStages[index + 1].isMandatory ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-blue-600'}`}
                            title={stage.isMandatory || jobDetails.interviewStages[index + 1]?.isMandatory ? "Cannot reorder mandatory stages" : "Move down"}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>

                          {/* Remove — locked if candidates are in this stage */}
                          {isOccupied ? (
                            <button
                              onClick={() => setBlockedStageName(stage.name)}
                              className="p-1 text-orange-400 hover:text-orange-600 transition-colors"
                              title={`${occupiedCount} candidate(s) in this stage — move them first`}
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => removeHiringStage(index)}
                              disabled={stage.isMandatory}
                              className={`p-1 transition-colors ${stage.isMandatory ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600'}`}
                              title={stage.isMandatory ? "Cannot remove mandatory stage" : "Remove stage"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add New Stage */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="space-y-3">
                      {/* Custom Stage Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newStageInput}
                          onChange={(e) => setNewStageInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addHiringStage(newStageInput);
                            }
                          }}
                          placeholder="Enter custom stage name..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <button
                          onClick={() => addHiringStage(newStageInput)}
                          disabled={!newStageInput.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>

                      {/* Quick Add Buttons */}
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Quick add common stages:</p>
                        <div className="flex flex-wrap gap-2">
                          {predefinedStages
                            .filter(stage => !jobDetails.interviewStages.some(s => s.name === stage))
                            .slice(0, 6)
                            .map(stage => (
                              <button
                                key={stage}
                                onClick={() => addHiringStage(stage)}
                                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-blue-100 hover:text-blue-700 transition-all"
                              >
                                + {stage}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Help Text */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Customize your hiring process</p>
                        <ul className="text-xs space-y-1 text-blue-700">
                          <li>• Click on stage names to edit them</li>
                          <li>• Use ↑↓ arrows to reorder stages</li>
                          <li>• Add custom stages or use quick-add buttons</li>
                          <li>• Remove stages you don't need with the trash icon</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handlePrevSection}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
                  >
                    ← Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSection}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Selection Modal */}
      <ImagePickerModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        currentImageId={selectedImageId}
        onSelect={(imageUrl, imageId) => {
          setSelectedImage(imageUrl);
          setSelectedImageId(imageId);
          setShowImageModal(false);
          if (errors.selectedImage) {
            setErrors(prev => ({ ...prev, selectedImage: '' }));
          }
        }}
      />

      {/* Discard Changes Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-500">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Discard Changes?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to discard your changes? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDiscardModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Keep Editing
                </button>
                <button
                  onClick={handleConfirmDiscard}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-500">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Changes for Approval?</h3>
              <p className="text-sm text-gray-500 mb-6">
                As a Recruiter, updates to active job postings require Admin approval. Would you like to submit an edit request now?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApprovalRequest}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] transition-all font-medium text-sm flex items-center justify-center"
                >
                  {isSaving ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </span>
                  ) : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Changes Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-500">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Changes?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to save the changes to the job settings?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSave}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        message="Job settings updated successfully."
      />

      {/* Unsaved Changes Warning Modal (for internal section navigation) */}
      {showNavigationWarningModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-500">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unsaved Changes</h3>
              <p className="text-sm text-gray-500 mb-6">
                You have unsaved changes. Are you sure you want to leave this section? Your changes will be lost.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCancelSectionNavigation}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Stay on Page
                </button>
                <button
                  onClick={handleConfirmSectionNavigation}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Discard & Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Blocked Stage Modal */}
      {blockedStageName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Stage Has Active Candidates</h3>
                <p className="text-xs text-gray-500 mt-0.5">Cannot remove this stage</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              The <span className="font-semibold text-orange-700">{blockedStageName}</span> stage currently has{' '}
              <span className="font-semibold">{occupiedStages[blockedStageName] || 0} candidate(s)</span> in it.
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Please move or reject all candidates in this stage in the Hiring Pipeline before removing it.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setBlockedStageName(null)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Change Status Modal (Pause / Close) */}
      {showStatusModal && statusAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${statusAction === 'Closed' ? 'bg-red-100' : 'bg-amber-100'
                }`}>
                <AlertCircle className={`w-6 h-6 ${statusAction === 'Closed' ? 'text-red-600' : 'text-amber-600'
                  }`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {statusAction === 'Closed' ? 'Close Job Opening' : 'Pause Job Opening'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {statusAction === 'Closed' ? 'This job will be moved to the Closed tab.' : 'This job will be hidden from the careers page.'}
                </p>
              </div>
            </div>

            {/* Warning for existing candidates if closing */}
            {statusAction === 'Closed' && activeCandidatesCount > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">
                  <span className="font-semibold block mb-0.5">Warning: Active Candidates</span>
                  There are currently {activeCandidatesCount} active candidates in the pipeline. Closing this job will not reject them, but you will not be able to accept new applications.
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for {statusAction === 'Closed' ? 'closing' : 'pausing'} this job <span className="text-red-500">*</span>
              </label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder={statusAction === 'Closed' ? "e.g., Filled position, Budget pause..." : "e.g., Temporarily reviewing existing applicants..."}
                className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                required
              />
            </div>

            <div className="flexjustify-end gap-3 flex">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setStatusAction(null);
                  setStatusReason('');
                }}
                disabled={isChangingStatus}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmStatusChange(statusAction, statusReason)}
                disabled={!statusReason.trim() || isChangingStatus}
                className={`flex items-center gap-2 px-6 py-2 text-sm font-medium text-white rounded-lg transition-all ${!statusReason.trim() || isChangingStatus
                  ? 'bg-gray-400 cursor-not-allowed'
                  : statusAction === 'Closed'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                  }`}
              >
                {isChangingStatus ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating...
                  </>
                ) : (
                  `Confirm ${statusAction}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div >
  );
};

export default JobSettings;