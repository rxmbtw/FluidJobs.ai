import React, { useState } from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, Navigate, RouterProvider, useNavigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import CandidateRegistrationPage from './pages/auth/CandidateRegistrationPage';
import AcceptInvite from './pages/auth/AcceptInvite';
import ComingSoon from './components/ComingSoonPage';
import AuthCallback from './pages/AuthCallback';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import SuperAdminDefaultView from './pages/super-admin/SuperAdminDefaultView';
import SuperAdminApprovals from './pages/super-admin/approvals/SuperAdminApprovals';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOverview from './pages/admin/views/AdminOverview';
import AdminJobs from './pages/admin/views/AdminJobs';
import AdminCreateJob from './pages/admin/views/AdminCreateJob';
import AdminCandidates from './pages/admin/views/AdminCandidates';
import AdminCreateCandidate from './pages/admin/views/AdminCreateCandidate';
import AdminSendInvite from './pages/admin/views/AdminSendInvite';
import AdminBulkImport from './pages/admin/views/AdminBulkImport';
import AdminAccounts from './pages/admin/views/AdminAccounts';
import AdminSettings from './pages/admin/views/AdminSettings';
import AdminProfileSettings from './pages/admin/views/AdminProfileSettings';
import AdminCreateUser from './pages/admin/views/AdminCreateUser';
import RecruitersDashboard from './pages/admin/RecruitersDashboard';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import AIMentor from './components/new-dashboard/AIMentor';
// Public Careers Pages
import JobListings from './pages/public-careers/JobListings';
import JobDetails from './pages/public-careers/JobDetails';
import JobListingsMobile from './pages/public-careers/mobile/JobListingsMobile';
import JobDetailsMobile from './pages/public-careers/mobile/JobDetailsMobile';
import { useDeviceType } from './hooks/useDeviceType';
import './App.css';

// Wrapper component to handle navigation logic that was previously in AppContent
const AppLayout: React.FC = () => {
  return (
    <>
      {/* 
        This is a placeholder layout if we need global providers or logic.
        The actual routing is handled by the RouterProvider now.
        UseOutlet or Outlet isn't needed here if defined in router elements.
      */}
    </>
  );
};

// We need to move the AppContent logic (handleNavigateTo...) into a wrapper component
// or handle it differently.
// The LoginPage uses these callbacks.
// Let's create a wrapper for LoginPage to provide these callbacks using hooks.

const LoginPageWrapper = () => {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleNavigateHome = () => {
    setShowComingSoon(false);
    navigate('/');
  };

  const handleNavigateToDashboard = () => {
    navigate('/candidate-dashboard');
  };

  const handleNavigateToAdminDashboard = () => {
    navigate('/company-dashboard');
  };

  const handleNavigateToComingSoon = () => {
    setShowComingSoon(true);
  };

  if (showComingSoon) {
    return <ComingSoon title="Coming Soon" />;
  }

  return (
    <LoginPage
      onNavigateHome={handleNavigateHome}
      onNavigateToDashboard={handleNavigateToDashboard}
      onNavigateToAdminDashboard={handleNavigateToAdminDashboard}
      onNavigateToComingSoon={handleNavigateToComingSoon}
    />
  );
};

// Public careers page wrappers — responsive desktop/mobile switching
const CareersPageWrapper = () => {
  const deviceType = useDeviceType();
  return deviceType === 'mobile' ? <JobListingsMobile /> : <JobListings />;
};

const CareersJobDetailWrapper = () => {
  const deviceType = useDeviceType();
  return deviceType === 'mobile' ? <JobDetailsMobile /> : <JobDetails />;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Routes */}
      <Route path="/" element={<LoginPageWrapper />} />
      <Route path="/login" element={<LoginPageWrapper />} />

      {/* Public Careers Routes (no auth required) */}
      <Route path="/careers" element={<CareersPageWrapper />} />
      <Route path="/careers/job/:id" element={<CareersJobDetailWrapper />} />

      {/* Singular aliases for better UX */}
      <Route path="/career" element={<CareersPageWrapper />} />
      <Route path="/career/job/:id" element={<CareersJobDetailWrapper />} />

      {/* OAuth Callback Route */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/candidate-registration" element={<CandidateRegistrationPage />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      {/* Public Dashboard Routes (temporarily) */}
      <Route path="/candidate-dashboard" element={<CandidateDashboard />} />

      {/* Admin Routes */}
      {/* Super Admin Routes */}
      <Route path="/superadmin-dashboard" element={<SuperAdminDashboard />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<SuperAdminDefaultView />} />

        {/* Approvals - Nested Routes */}
        <Route path="approvals" element={<Navigate to="pending" replace />} />
        <Route path="approvals/:status" element={<SuperAdminApprovals />} />

        <Route path="accounts" element={<SuperAdminDefaultView />} />

        {/* Jobs - Nested Routes */}
        <Route path="jobs" element={<Navigate to="all" replace />} />
        <Route path="jobs/:status" element={<SuperAdminDefaultView />} />
        {/* Job Dashboard Route within Super Admin */}
        <Route path="jobs/job-dashboard/:jobSlug" element={<SuperAdminDefaultView />} />
        <Route path="jobs/job-dashboard/:jobSlug/:view" element={<SuperAdminDefaultView />} />

        <Route path="candidates" element={<SuperAdminDefaultView />} />
        <Route path="candidates/:candidateId" element={<SuperAdminDefaultView />} />
        <Route path="users" element={<SuperAdminDefaultView />} />

        {/* Create Candidate - Nested Routes */}
        <Route path="create-candidate" element={<SuperAdminDefaultView />} />
        <Route path="create-candidate/invite" element={<SuperAdminDefaultView />} />
        <Route path="create-candidate/import" element={<SuperAdminDefaultView />} />

        <Route path="create-job" element={<SuperAdminDefaultView />} />
        <Route path="create-user" element={<SuperAdminDefaultView />} />
        <Route path="create-account" element={<SuperAdminDefaultView />} />

        {/* Recruiters Analytics Dashboard */}
        <Route path="recruiters" element={<RecruitersDashboard />} />

        {/* AI Mentor */}
        <Route path="ai-mentor" element={<AIMentor />} />

        {/* Legacy routes mappings (can be removed or kept for safety if external links exist) */}
        <Route path="send-invitation" element={<Navigate to="create-candidate/invite" replace />} />
        <Route path="bulk-import" element={<Navigate to="create-candidate/import" replace />} />

        <Route path="settings/*" element={<SuperAdminDefaultView />} />
        <Route path="profile" element={<SuperAdminDefaultView />} />
        <Route path="*" element={<SuperAdminDefaultView />} />
      </Route>

      {/* Legacy Redirects */}
      <Route path="/super-admin" element={<Navigate to="/superadmin-dashboard" replace />} />
      <Route path="/superadmin/dashboard" element={<Navigate to="/superadmin-dashboard" replace />} />

      {/* Admin Dashboard Routes */}
      {/* Admin Dashboard Routes */}
      <Route path="/admin-dashboard" element={<AdminDashboard />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<AdminOverview />} />

        {/* Jobs Routes */}
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="jobs/:status" element={<AdminJobs />} />

        <Route path="create-job" element={<AdminCreateJob />} />
        <Route path="candidates" element={<AdminCandidates />} />
        <Route path="candidates/:candidateId" element={<AdminCandidates />} />

        {/* Create Candidate Routes */}
        <Route path="create-candidate">
          <Route index element={<AdminCreateCandidate />} />
          <Route path="send-invitation" element={<AdminSendInvite />} />
          <Route path="bulk-import" element={<AdminBulkImport />} />
        </Route>

        <Route path="accounts" element={<AdminAccounts />} />
        <Route path="ai-mentor" element={<AIMentor />} />
        <Route path="recruiters" element={<RecruitersDashboard />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile-settings" element={<AdminProfileSettings />} />
        <Route path="create-user" element={<AdminCreateUser />} />
      </Route>
      <Route path="/company-dashboard" element={<Navigate to="/admin-dashboard" replace />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<RoleRoute allowedRoles={["Admin", "HR", "Sales"]} />}>
          {/* Additional protected routes can go here */}
        </Route>
      </Route>
    </>
  )
);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
