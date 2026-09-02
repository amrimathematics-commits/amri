import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Research from './pages/Research.jsx'
import Programs from './pages/Programs.jsx'
import Events from './pages/Events.jsx'
import Membership from './pages/Membership.jsx'
import MembershipPayment from './pages/MembershipPayment.jsx'
import MembershipRenewal from './pages/MembershipRenewal.jsx'
import Innovation from './pages/Innovation.jsx'
import Contact from './pages/Contact.jsx'
import Register from './pages/Register.jsx'
import NotFound from './pages/NotFound.jsx'

import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/admin/ProtectedRoute.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'

import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import ResearchManager from './pages/admin/ResearchManager.jsx'
import EventsManager from './pages/admin/EventsManager.jsx'
import InnovationsManager from './pages/admin/InnovationsManager.jsx'
import ProgramsManager from './pages/admin/ProgramsManager.jsx'
import MembershipManager from './pages/admin/MembershipManager.jsx'
import AdminProfile from './pages/admin/AdminProfile.jsx'


function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}


function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  )
}


export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />

      <Routes>
        {/* =====================================================
            PUBLIC WEBSITE
        ===================================================== */}

        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />

        <Route
          path="/about"
          element={
            <PublicLayout>
              <About />
            </PublicLayout>
          }
        />

        <Route
          path="/research"
          element={
            <PublicLayout>
              <Research />
            </PublicLayout>
          }
        />

        <Route
          path="/programs"
          element={
            <PublicLayout>
              <Programs />
            </PublicLayout>
          }
        />

        <Route
          path="/events"
          element={
            <PublicLayout>
              <Events />
            </PublicLayout>
          }
        />

        <Route
          path="/membership"
          element={
            <PublicLayout>
              <Membership />
            </PublicLayout>
          }
        />

        {/* =====================================================
            MEMBERSHIP PAYMENT PAGE
            Example:
            /membership/payment/68a96c7db382ed83f6e90fe94
        ===================================================== */}

        <Route
          path="/membership/payment/:id"
          element={
            <PublicLayout>
              <MembershipPayment />
            </PublicLayout>
          }
        />

            <Route
              path="/membership/renew"
              element={
                <PublicLayout>
                  <MembershipRenewal />
                </PublicLayout>
              }
            />

        <Route
          path="/innovation"
          element={
            <PublicLayout>
              <Innovation />
            </PublicLayout>
          }
        />

        <Route
          path="/contact"
          element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          }
        />

        <Route
          path="/register"
          element={
            <PublicLayout>
              <Register />
            </PublicLayout>
          }
        />

        {/* =====================================================
            ADMIN LOGIN
        ===================================================== */}

        <Route path="/admin/login" element={<AdminLogin />} />

        {/* =====================================================
            PROTECTED ADMIN
        ===================================================== */}

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            <Route path="/admin/research" element={<ResearchManager />} />

            <Route path="/admin/events" element={<EventsManager />} />

            <Route path="/admin/innovations" element={<InnovationsManager />} />

            <Route path="/admin/programs" element={<ProgramsManager />} />

            <Route path="/admin/membership" element={<MembershipManager />} />

            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* =====================================================
            404
        ===================================================== */}

        <Route
          path="*"
          element={
            <PublicLayout>
              <NotFound />
            </PublicLayout>
          }
        />
      </Routes>
    </AuthProvider>
  );
}