import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import PremiumLandingPage from './components/PremiumLandingPage';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobsOpportunities from './components/JobsOpportunities';
import Candidates from './pages/Candidates';
import Companies from './pages/Companies';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ResumesPage from './pages/ResumesPage';
import Settings from './pages/Settings';
import Interviews from './pages/Interviews';
import SavedJobs from './pages/SavedJobs';
import JobOpenings from './pages/JobOpenings';
import JobDetailPage from './pages/JobDetailPage';
import JobApplicationPage from './pages/JobApplicationPage';
import Contact from './pages/Contact';
import Signup from './pages/Signup';
import PremiumAuthPage from './components/PremiumAuthPage';
import Unauthorized from './pages/Unauthorized';
import CandidateRegistration from './pages/CandidateRegistration';
import UnifiedJobDashboard from './components/UnifiedJobDashboard';
import ChangePassword from './pages/ChangePassword';
import AuthCallback from './pages/AuthCallback';

import DashboardRouter from './components/DashboardRouter';


const AppRoutes = () => (
	<Router>
		<Routes>
			<Route path="/" element={<PremiumLandingPage />} />
			<Route path="/careers" element={<JobOpenings />} />
			<Route path="/careers/:jobId" element={<JobDetailPage />} />
			<Route path="/careers/:jobId/apply" element={<JobApplicationPage />} />
			<Route path="/login" element={<PremiumAuthPage />} />
			<Route path="/auth/callback" element={<AuthCallback />} />

			<Route path="/dashboard-redirect" element={<DashboardRouter />} />
			<Route path="/signup" element={<Signup />} />
			<Route path="/candidate-registration" element={<CandidateRegistration />} />
			<Route path="/unauthorized" element={<Unauthorized />} />
			<Route path="/contact" element={<Contact />} />
			<Route element={<PrivateRoute />}>
				<Route path="/dashboard" element={<Dashboard />} />
				<Route path="/admin-dashboard" element={<UnifiedJobDashboard />} />
				{/* Alias for backwards compatibility / canonical admin entry */}
				<Route path="/main-unified-dashboard" element={<UnifiedJobDashboard />} />
				<Route path="/candidates" element={<Candidates />} />
				<Route path="/companies" element={<Companies />} />
				<Route path="/applications" element={<Applications />} />
				<Route path="/profile" element={<ProfilePage />} />
				<Route path="/edit-profile" element={<EditProfilePage />} />
				<Route path="/resumes" element={<ResumesPage />} />
				<Route path="/settings" element={<Settings />} />
				<Route path="/change-password" element={<ChangePassword />} />
				<Route path="/interviews" element={<Interviews />} />
				<Route path="/saved-jobs" element={<SavedJobs />} />
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
