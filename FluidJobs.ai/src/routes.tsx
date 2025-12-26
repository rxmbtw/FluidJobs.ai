import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import PremiumLandingPage from './components/PremiumLandingPage';
import NewLandingPage from './new-landing/App';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobsOpportunities from './components/JobsOpportunities';
import Candidates from './pages/Candidates';
import Companies from './pages/Companies';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ResponsiveEditProfile from './components/mobile/ResponsiveEditProfile';
import ResumesPage from './pages/ResumesPage';
import Settings from './pages/Settings';
import Interviews from './pages/Interviews';
import SavedJobsComponent from './components/SavedJobs';
import JobOpenings from './pages/JobOpenings';
import JobDetailPage from './pages/JobDetailPage';
import JobApplicationPage from './pages/JobApplicationPage';
import Contact from './pages/Contact';
import Signup from './pages/Signup';
import LoginAuthPage from './components/LoginAuthPage';
import Unauthorized from './pages/Unauthorized';
import CandidateRegistration from './pages/CandidateRegistration';
import CompanyDashboard from './components/CompanyDashboard';
import ChangePassword from './pages/ChangePassword';
import AuthCallback from './pages/AuthCallback';
import ManageCandidates from './components/ManageCandidates';
import ForgotPassword from './pages/ForgotPassword';
import MyJobs from './pages/MyJobs';
import MyResume from './pages/MyResume';

import DashboardRouter from './components/DashboardRouter';


const AppRoutes = () => (
	<Router>
		<Routes>
			<Route path="/" element={<PremiumLandingPage />} />
			<Route path="/new-landing" element={<NewLandingPage />} />
			<Route path="/careers" element={<JobOpenings />} />
			<Route path="/careers/:jobId" element={<JobDetailPage />} />
			<Route path="/careers/:jobId/apply" element={<JobApplicationPage />} />
			<Route path="/login" element={<LoginAuthPage />} />
			<Route path="/forgot-password" element={<ForgotPassword />} />
			<Route path="/auth/callback" element={<AuthCallback />} />

			<Route path="/dashboard-redirect" element={<DashboardRouter />} />
			<Route path="/signup" element={<Signup />} />
			<Route path="/candidate-registration" element={<CandidateRegistration />} />
			<Route path="/unauthorized" element={<Unauthorized />} />
			<Route element={<PrivateRoute />}>
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/admin-dashboard" element={<CompanyDashboard />} />
				{/* Alias for backwards compatibility / canonical admin entry */}
				<Route path="/company-dashboard" element={<CompanyDashboard />} />
				<Route path="/candidates" element={<Candidates />} />
				<Route path="/manage-candidates" element={<ManageCandidates />} />
				<Route path="/companies" element={<Companies />} />
				<Route path="/applications" element={<Applications />} />
				<Route path="/profile" element={<ProfilePage />} />
				<Route path="/edit-profile" element={<ResponsiveEditProfile />} />
				<Route path="/resumes" element={<ResumesPage />} />
				<Route path="/settings" element={<Settings />} />
				<Route path="/contact" element={<Contact />} />
				<Route path="/change-password" element={<ChangePassword />} />
				<Route path="/interviews" element={<Interviews />} />
				<Route path="/saved-jobs" element={<SavedJobsComponent />} />
				<Route path="/my-jobs" element={<MyJobs />} />
				<Route path="/my-resume" element={<MyResume />} />
				{/* Admin and HR access job management */}
				<Route element={<RoleRoute allowedRoles={["Admin", "HR"]} />}>
					<Route path="/job-management" element={<Jobs />} />
				</Route>
				{/* Candidates access job opportunities */}
				<Route element={<RoleRoute allowedRoles={["Candidate"]} />}>
					<Route path="/jobs" element={<JobsOpportunities />} />
				</Route>
			</Route>
		</Routes>
	</Router>
);

export default AppRoutes;
