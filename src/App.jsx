import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import SEO from './components/SEO.jsx'

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


function PublicLayout({
  children,
  title,
  description,
  keywords,
  noIndex = false,
}) {
  return (
    <div className="min-h-screen flex flex-col">

      <SEO
        title={title}
        description={description}
        keywords={keywords}
        noIndex={noIndex}
      />

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

        {/* HOME */}
        <Route
          path="/"
          element={
            <PublicLayout
              title="AMRI — Association for Mathematics, Research and Innovation"
              description="AMRI — Association for Mathematics, Research and Innovation. Advancing mathematics, research, education and innovation through collaboration among students, researchers, faculty and professionals."
              keywords="AMRI, Association for Mathematics Research and Innovation, mathematics research, mathematical research, mathematics education, mathematics innovation, research and innovation"
            >
              <Home />
            </PublicLayout>
          }
        />

        {/* ABOUT */}
        <Route
          path="/about"
          element={
            <PublicLayout
              title="About AMRI — Association for Mathematics, Research and Innovation"
              description="Learn about AMRI — Association for Mathematics, Research and Innovation, its mission, vision and commitment to mathematics, research, education and innovation."
              keywords="About AMRI, Association for Mathematics Research and Innovation, AMRI mission, AMRI vision, mathematics research organization, mathematics innovation"
            >
              <About />
            </PublicLayout>
          }
        />

        {/* RESEARCH */}
        <Route
          path="/research"
          element={
            <PublicLayout
              title="AMRI Research — Mathematics Research & Innovation"
              description="Explore mathematical research and research initiatives at AMRI, connecting students, researchers, faculty and professionals through collaboration and innovation."
              keywords="AMRI research, mathematics research, mathematical research, research innovation, mathematics researchers, mathematical sciences research"
            >
              <Research />
            </PublicLayout>
          }
        />

        {/* PROGRAMS */}
        <Route
          path="/programs"
          element={
            <PublicLayout
              title="AMRI Programs — Mathematics Education & Research"
              description="Discover AMRI programs focused on mathematics education, research, professional development, emerging technologies and academic collaboration."
              keywords="AMRI programs, mathematics programs, mathematics education, research programs, mathematics training, mathematics FDP, mathematical sciences"
            >
              <Programs />
            </PublicLayout>
          }
        />

        {/* EVENTS */}
        <Route
          path="/events"
          element={
            <PublicLayout
              title="AMRI Events — Mathematics Workshops, FDPs & Conferences"
              description="Explore AMRI mathematics workshops, faculty development programs, conferences and academic events in mathematics, research and emerging technologies."
              keywords="AMRI events, mathematics events, mathematics workshop, mathematics conference, mathematics FDP, faculty development program, research workshop"
            >
              <Events />
            </PublicLayout>
          }
        />

        {/* MEMBERSHIP */}
        <Route
          path="/membership"
          element={
            <PublicLayout
              title="AMRI Membership — Join the Association"
              description="Join AMRI — Association for Mathematics, Research and Innovation and become part of a collaborative community of students, researchers, faculty and professionals."
              keywords="AMRI membership, mathematics membership, join AMRI, mathematics association membership, research membership, mathematics researchers"
            >
              <Membership />
            </PublicLayout>
          }
        />

        {/* MEMBERSHIP PAYMENT
            Payment pages should not normally appear in Google search.
        */}
        <Route
          path="/membership/payment/:id"
          element={
            <PublicLayout
              title="AMRI Membership Payment"
              description="AMRI membership payment page."
              noIndex={true}
            >
              <MembershipPayment />
            </PublicLayout>
          }
        />

        {/* MEMBERSHIP RENEWAL */}
        <Route
          path="/membership/renew"
          element={
            <PublicLayout
              title="Renew AMRI Membership"
              description="Renew your AMRI — Association for Mathematics, Research and Innovation membership."
              keywords="AMRI membership renewal, renew AMRI membership, mathematics membership renewal"
            >
              <MembershipRenewal />
            </PublicLayout>
          }
        />

        {/* INNOVATION */}
        <Route
          path="/innovation"
          element={
            <PublicLayout
              title="AMRI Innovations — Mathematics & Emerging Technology"
              description="Discover innovation initiatives at AMRI connecting mathematics, research, technology and emerging fields."
              keywords="AMRI innovation, mathematics innovation, mathematical innovation, emerging technology, mathematics and AI, research innovation"
            >
              <Innovation />
            </PublicLayout>
          }
        />

        {/* CONTACT */}
        <Route
          path="/contact"
          element={
            <PublicLayout
              title="Contact AMRI — Association for Mathematics, Research and Innovation"
              description="Contact AMRI — Association for Mathematics, Research and Innovation for information about research, programs, events, membership and collaboration."
              keywords="Contact AMRI, AMRI contact, Association for Mathematics Research and Innovation contact, mathematics research contact"
            >
              <Contact />
            </PublicLayout>
          }
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={
            <PublicLayout
              title="Register for AMRI Events & Programs"
              description="Register for AMRI workshops, faculty development programs, conferences and other mathematics and research events."
              keywords="AMRI registration, mathematics event registration, mathematics workshop registration, mathematics conference registration, AMRI programs"
            >
              <Register />
            </PublicLayout>
          }
        />


        {/* =====================================================
            ADMIN LOGIN
        ===================================================== */}

        <Route
          path="/admin/login"
          element={
            <AdminLogin />
          }
        />


        {/* =====================================================
            PROTECTED ADMIN
        ===================================================== */}

        <Route element={<ProtectedRoute />}>

          <Route element={<AdminLayout />}>

            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/research"
              element={<ResearchManager />}
            />

            <Route
              path="/admin/events"
              element={<EventsManager />}
            />

            <Route
              path="/admin/innovations"
              element={<InnovationsManager />}
            />

            <Route
              path="/admin/programs"
              element={<ProgramsManager />}
            />

            <Route
              path="/admin/membership"
              element={<MembershipManager />}
            />

            <Route
              path="/admin/profile"
              element={<AdminProfile />}
            />

          </Route>

        </Route>


        {/* =====================================================
            404
        ===================================================== */}

        <Route
          path="*"
          element={
            <PublicLayout
              title="Page Not Found — AMRI"
              description="The requested AMRI page could not be found."
              noIndex={true}
            >
              <NotFound />
            </PublicLayout>
          }
        />

      </Routes>

    </AuthProvider>
  )
}