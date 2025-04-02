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
import AdminAddModuleUnite from "./pages/admin/AdminDashboard";
import AdminLessons from "./pages/admin/AdminLessons";
import EditCourse from "./pages/admin/EditCourse";
import FlashcardsManager from "./pages/admin/AdminFlashcards";
import EditDeleteFlashcards from "./pages/admin/EditDeleteFlashcards";
import EditCourseOrder from "./pages/admin/EditCourseOrder";
import ManageUniteModules from "./pages/admin/ManageUniteModules";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage"; // ✅ Correct Import
import { YearPage } from "./pages/YearPage";
import { ModulePage } from "./pages/ModulePage";
import { UnitePage } from "./pages/UnitePage";
import { CoursePage } from "./pages/CoursePage";
import PDFViewerPage from "./pages/PDFViewerPage";
import { GradeCalculatorPage } from "./pages/gradecalc";
import { HelmetProvider } from "react-helmet-async";
import { AboutPage } from "./pages/AboutPage";
import IslamicNotification from "./components/Notification";

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
    <HelmetProvider>
      <IslamicNotification />
      <Router>
        <Routes>
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
                        <Route path="/" element={<AdminAddModuleUnite />} />
                        <Route path="/lessons" element={<AdminLessons />} />
                        <Route path="/edit" element={<EditCourse />} />
                        <Route
                          path="/flashcards"
                          element={<FlashcardsManager />}
                        />
                        <Route
                          path="/editflashcards"
                          element={<EditDeleteFlashcards />}
                        />
                        <Route
                          path="/editcourseorder"
                          element={<EditCourseOrder />}
                        />
                        <Route
                          path="/editunitemodules"
                          element={<ManageUniteModules />}
                        />
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
          <Route path="/pdf-viewer/:pdfUrl" element={<PDFViewerPage />} />
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="lg:ml-64 pt-14 p-0 m:p-8 ">
                  <div className="w-full mx-auto max-w-full sm:max-w-screen-lg sm:px-0">
                    <Routes>
                      {/* الصفحة الرئيسية */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/calc" element={<GradeCalculatorPage />} />

                      {/* صفحة السنة الدراسية */}
                      <Route path="/year/:yearId" element={<YearPage />} />

                      {/* صفحة الوحدة */}
                      <Route path="/unite/:uniteId" element={<UnitePage />} />

                      {/* صفحة المقياس */}
                      <Route
                        path="/module/:moduleId"
                        element={<ModulePage />}
                      />

                      {/* صفحة الدرس */}
                      <Route
                        path="/course/:courseId"
                        element={<CoursePage />}
                      />

                      {/* صفحة عرض PDF */}
                      <Route
                        path="/pdf-viewer/:pdfUrl"
                        element={<PDFViewerPage />}
                      />
                    </Routes>
                  </div>
                </main>
              </div>
            }
          />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
