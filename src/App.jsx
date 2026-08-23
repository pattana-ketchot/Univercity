import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import FindMajor from './pages/FindMajor'
import FindMajorStep2 from './pages/FindMajorStep2'
import FindMajorStep3 from './pages/FindMajorStep3'
import FindMajorStep4 from './pages/FindMajorStep4'
import AllCourses from './pages/AllCourses'
import CourseDetail from './pages/CourseDetail'
import CompareCourses from './pages/CompareCourses'
import CompareResult from './pages/CompareResult'
import Careers from './pages/Careers'
import ChatAdvisor from './pages/ChatAdvisor'
import Register from './pages/Register'
import Login from './pages/Login'
import AdminLogin from './pages/Admin/Login'
import AdminDashboard from './pages/Admin/Dashboard'
import CourseForm from './pages/Admin/CourseForm'
import NewsForm from './pages/Admin/NewsForm'
import UserManagement from './pages/Admin/UserManagement'

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
          <Route path="/courses" element={<AllCourses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/compare" element={<CompareCourses />} />
          <Route path="/compare/result" element={<CompareResult />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/chat" element={<ChatAdvisor />} />
        </Route>

        {/* Routes without Header & Footer (Login/Register pages) */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/courses/create" element={<CourseForm />} />
        <Route path="/admin/courses/edit/:id" element={<CourseForm />} />
        <Route path="/admin/news/create" element={<NewsForm />} />
        <Route path="/admin/news/edit/:id" element={<NewsForm />} />
      </Routes>
    </Router>
  )
}

export default App
