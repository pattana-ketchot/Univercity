import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import FindMajor from './pages/FindMajor'
import FindMajorStep2 from './pages/FindMajorStep2'
import FindMajorStep3 from './pages/FindMajorStep3'
import FindMajorStep4 from './pages/FindMajorStep4'
import FindMajorResult from './pages/FindMajorResult'
import AllCourses from './pages/AllCourses'
import CourseDetail from './pages/CourseDetail'
import CompareCourses from './pages/CompareCourses'
import CompareResult from './pages/CompareResult'
import Careers from './pages/Careers'
import ChatAdvisor from './pages/ChatAdvisor'
import SciConnectAll from './pages/SciConnectAll'
import SciConnectDetail from './pages/SciConnectDetail'
import AdminLogin from './pages/Admin/Login'
import AdminRegister from './pages/Admin/Register'
import AdminResetPassword from './pages/Admin/ResetPassword'
import AdminDashboard from './pages/Admin/Dashboard'
import CourseForm from './pages/Admin/CourseForm'
import NewsForm from './pages/Admin/NewsForm'
import UserManagement from './pages/Admin/UserManagement'
import Profile from './pages/Admin/Profile'
import AiSettings from './pages/Admin/AiSettings'
import AdminSettings from './pages/Admin/Settings'
import AdminLogs from './pages/Admin/Logs'
import KnowledgeBase from './pages/Admin/KnowledgeBase'
import KnowledgeForm from './pages/Admin/KnowledgeForm'
import ProtectedAdminRoute from './components/admin/auth/ProtectedAdminRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes with Header & Footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/find-major" element={<FindMajor />} />
          <Route path="/find-major/step2" element={<FindMajorStep2 />} />
          <Route path="/find-major/step3" element={<FindMajorStep3 />} />
          <Route path="/find-major/step4" element={<FindMajorStep4 />} />
          <Route path="/find-major/result" element={<FindMajorResult />} />
          <Route path="/courses" element={<AllCourses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/compare" element={<CompareCourses />} />
          <Route path="/compare/result" element={<CompareResult />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/chat" element={<ChatAdvisor />} />
          <Route path="/sci-connect" element={<SciConnectAll />} />
          <Route path="/sci-connect/:slug" element={<SciConnectDetail />} />
        </Route>

        {/* Public Admin auth routes (no guard) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        {/* ปลายทางของลิงก์ที่ /auth/admin/reset-link ออกให้ — ไม่มีด่าน เพราะคนที่ใช้คือคนที่เข้าสู่ระบบไม่ได้ */}
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />

        {/* Protected Admin Routes — ต้องล็อกอินเป็นผู้ดูแลระบบที่อนุมัติแล้ว */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<Profile />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/ai-settings" element={<AiSettings />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          <Route path="/admin/courses/create" element={<CourseForm />} />
          <Route path="/admin/courses/edit/:id" element={<CourseForm />} />
          <Route path="/admin/news/create" element={<NewsForm />} />
          <Route path="/admin/news/edit/:id" element={<NewsForm />} />
          <Route path="/admin/knowledge" element={<KnowledgeBase />} />
          <Route path="/admin/knowledge/create" element={<KnowledgeForm />} />
          <Route path="/admin/knowledge/edit/:id" element={<KnowledgeForm />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
