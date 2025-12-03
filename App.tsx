import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home'));
const Marketplace = React.lazy(() => import('./pages/Marketplace'));
const MarketItemDetail = React.lazy(() => import('./pages/MarketItemDetail'));
const Jobs = React.lazy(() => import('./pages/Jobs'));
const JobDetail = React.lazy(() => import('./pages/JobDetail'));
const Guide = React.lazy(() => import('./pages/Guide'));
const GuideDetail = React.lazy(() => import('./pages/GuideDetail'));
const Community = React.lazy(() => import('./pages/Community'));
const PostDetail = React.lazy(() => import('./pages/PostDetail'));
const Map = React.lazy(() => import('./pages/Map'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));

// Admin Pages
const AdminLayout = React.lazy(() => import('./components/AdminLayout'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers = React.lazy(() => import('./pages/admin/Users'));
const AdminMarketItems = React.lazy(() => import('./pages/admin/MarketItems'));
const AdminJobs = React.lazy(() => import('./pages/admin/Jobs'));
const AdminPosts = React.lazy(() => import('./pages/admin/Posts'));
const AdminGuides = React.lazy(() => import('./pages/admin/Guides'));
const AdminSettings = React.lazy(() => import('./pages/admin/Settings'));

// User Pages
const UserLayout = React.lazy(() => import('./components/UserLayout'));
const UserDashboard = React.lazy(() => import('./pages/user/Dashboard'));
const MyMarketItems = React.lazy(() => import('./pages/user/MyMarketItems'));
const MyJobs = React.lazy(() => import('./pages/user/MyJobs'));
const MyPosts = React.lazy(() => import('./pages/user/MyPosts'));
const Profile = React.lazy(() => import('./pages/user/Profile'));

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-phayao-blue border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium">กำลังโหลด...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><Home /></main>
                <Footer />
              </div>
            } />
            <Route path="/market" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><Marketplace /></main>
                <Footer />
              </div>
            } />
            <Route path="/market/:id" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><MarketItemDetail /></main>
                <Footer />
              </div>
            } />
            <Route path="/jobs" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><Jobs /></main>
                <Footer />
              </div>
            } />
            <Route path="/jobs/:id" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><JobDetail /></main>
                <Footer />
              </div>
            } />
            <Route path="/guide" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><Guide /></main>
                <Footer />
              </div>
            } />
            <Route path="/guide/:id" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><GuideDetail /></main>
                <Footer />
              </div>
            } />
            <Route path="/community" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><Community /></main>
                <Footer />
              </div>
            } />
            <Route path="/community/:id" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><PostDetail /></main>
                <Footer />
              </div>
            } />
            <Route path="/map" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow"><Map /></main>
                <Footer />
              </div>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Routes */}
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<UserDashboard />} />
              <Route path="market-items" element={<MyMarketItems />} />
              <Route path="jobs" element={<MyJobs />} />
              <Route path="posts" element={<MyPosts />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="market-items" element={<AdminMarketItems />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="guides" element={<AdminGuides />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default App;