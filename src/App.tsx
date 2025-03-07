import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import { Header } from "./components/layout/Header";
import { AdminHeader } from "./components/layout/AdminHeader";
import { HomePage } from "./pages/HomePage";
import {AdminDashboard} from "./pages/admin/AdminDashboard";
import AdminLessons from "./pages/admin/AdminLessons";
import EditCourse from "./pages/admin/EditCourse";
import FlashcardsManager from "./pages/admin/AdminFlashcards";
import EditDeleteFlashcards from "./pages/admin/EditDeleteFlashcards";
import { YearPage } from "./pages/YearPage";
import { ModulePage } from "./pages/ModulePage";
import { CoursePage } from "./pages/CoursePage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage"; // ✅ Correct Import
import PDFViewerPage from "./pages/PDFViewerPage"; 

function App() {
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const checkAdminSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setAdminUser(data.session.user);
      } else {
        setAdminUser(null);
      }
    };

    checkAdminSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAdminUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* 🔹 Fix: Pass `onLogin` to AdminLoginPage */}
        <Route
          path="/admin/login"
          element={<AdminLoginPage onLogin={setAdminUser} />}
        />

        <Route
          path="/admin/*"
          element={
            adminUser ? (
              <div className="min-h-screen bg-gray-100">
                <AdminHeader />
                <main className="lg:ml-64">
                  <div className="container mx-auto">
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/lessons" element={<AdminLessons />} />
                      <Route path="/edit" element={<EditCourse />} />
                      <Route path="/flashcards" element={<FlashcardsManager />} />
                      <Route path="/editflashcards" element={<EditDeleteFlashcards />} />
                    </Routes>
                  </div>
                </main>
              </div>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />

        {/* 🔹 Public Routes */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="lg:ml-64 pt-14 p-0 m:p-8 ">
                <div className="w-full mx-auto max-w-full sm:max-w-screen-lg sm:px-0">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/year/:yearId" element={<YearPage />} />
                    <Route path="/module/:moduleId" element={<ModulePage />} />
                    <Route path="/course/:courseId" element={<CoursePage />} />
                    <Route path="/pdf-viewer/:pdfUrl" element={<PDFViewerPage />} />
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

export default App;
