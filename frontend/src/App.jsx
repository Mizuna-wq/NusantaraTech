import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import Home from './pages/public/Home.jsx';
import Careers from './pages/public/Careers.jsx';
import JobDetail from './pages/public/JobDetail.jsx';
import ApplyJob from './pages/public/ApplyJob.jsx';
import Login from './pages/public/Login.jsx';
import Register from './pages/public/Register.jsx';
import About from './pages/public/About.jsx';
import Blog from './pages/public/Blog.jsx';
import Contact from './pages/public/Contact.jsx';
import NotFound from './pages/public/NotFound.jsx';
import Settings from './pages/Settings.jsx';

import CandidateDashboard from './pages/candidate/CandidateDashboard.jsx';
import CandidateProfile from './pages/candidate/CandidateProfile.jsx';
import CandidateCV from './pages/candidate/CandidateCV.jsx';
import CandidateApplications from './pages/candidate/CandidateApplications.jsx';
import CandidateApplicationDetail from './pages/candidate/CandidateApplicationDetail.jsx';

import HRMonitorDashboard from './pages/hr/HRMonitorDashboard.jsx';
import HRMonitorJobs from './pages/hr/HRMonitorJobs.jsx';
import HRMonitorJobForm from './pages/hr/HRMonitorJobForm.jsx';
import HRMonitorApplicants from './pages/hr/HRMonitorApplicants.jsx';
import HRMonitorApplicantDetail from './pages/hr/HRMonitorApplicantDetail.jsx';
import HRMonitorCompany from './pages/hr/HRMonitorCompany.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminJobs from './pages/admin/AdminJobs.jsx';
import AdminJobForm from './pages/admin/AdminJobForm.jsx';
import AdminApplicants from './pages/admin/AdminApplicants.jsx';
import AdminApplicantDetail from './pages/admin/AdminApplicantDetail.jsx';
import AdminCompany from './pages/admin/AdminCompany.jsx';

export default function App() {
  return (
    <Routes>
      {/* Halaman publik */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/karir" element={<Careers />} />
        <Route path="/karir/:id" element={<JobDetail />} />
        <Route path="/tentang-kami" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/kontak" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Form lamaran: hanya kandidat yang sudah login */}
        <Route element={<ProtectedRoute role="candidate" />}>
          <Route path="/karir/:id/lamar" element={<ApplyJob />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Dashboard kandidat (pelamar) */}
      <Route element={<ProtectedRoute role="candidate" />}>
        <Route element={<DashboardLayout role="candidate" />}>
          <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
          <Route path="/candidate/profile" element={<CandidateProfile />} />
          <Route path="/candidate/cv" element={<CandidateCV />} />
          <Route path="/candidate/applications" element={<CandidateApplications />} />
          <Route path="/candidate/applications/:id" element={<CandidateApplicationDetail />} />
          <Route path="/candidate/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Dashboard HRD (perusahaan) */}
      <Route element={<ProtectedRoute role="hr" />}>
        <Route element={<DashboardLayout role="hr" />}>
          <Route path="/hr/dashboard" element={<HRMonitorDashboard />} />
          <Route path="/hr/jobs" element={<HRMonitorJobs />} />
          <Route path="/hr/jobs/new" element={<HRMonitorJobForm />} />
          <Route path="/hr/jobs/:id/edit" element={<HRMonitorJobForm />} />
          <Route path="/hr/applicants" element={<HRMonitorApplicants />} />
          <Route path="/hr/applicants/:id" element={<HRMonitorApplicantDetail />} />
          <Route path="/hr/company" element={<HRMonitorCompany />} />
          <Route path="/hr/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Dashboard admin platform (semua perusahaan) */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<DashboardLayout role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/jobs/new" element={<AdminJobForm />} />
          <Route path="/admin/jobs/:id/edit" element={<AdminJobForm />} />
          <Route path="/admin/applicants" element={<AdminApplicants />} />
          <Route path="/admin/applicants/:id" element={<AdminApplicantDetail />} />
          <Route path="/admin/company" element={<AdminCompany />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}
