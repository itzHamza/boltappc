import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { AdminHeader } from './components/layout/AdminHeader';
import { HomePage } from './pages/HomePage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { YearPage } from './pages/YearPage';
import { ModulePage } from './pages/ModulePage';
import { CoursePage } from './pages/CoursePage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <div className="min-h-screen bg-gray-100">
              <AdminHeader />
              <main className="lg:ml-64 p-8">
                <div className="container mx-auto">
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/login" element={<AdminLoginPage />} />
                  </Routes>
                </div>
              </main>
            </div>
          }
        />

        {/* Public Routes */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="lg:ml-64 p-8">
                <div className="container mx-auto">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/year/:yearId" element={<YearPage />} />
                    <Route path="/module/:moduleId" element={<ModulePage />} />
                    <Route path="/course/:courseId" element={<CoursePage />} />
                  </Routes>
                </div>
              </main>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App