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
import AddCourse from "./pages/admin/AddCourse";
import EditCourse from "./pages/admin/EditCourse";
import FlashcardsManager from "./pages/admin/AdminFlashcards";
import EditDeleteFlashcards from "./pages/admin/EditDeleteFlashcards";
import EditCourseOrder from "./pages/admin/EditCourseOrder";
import ManageUniteModules from "./pages/admin/ManageUniteModules";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { YearPage } from "./pages/YearPage";
import { ModulePage } from "./pages/ModulePage";
import { UnitePage } from "./pages/UnitePage";
import { CoursePage } from "./pages/CoursePage";
import { CalcHomePage } from "./pages/calcHome";
import PDFViewerPage from "./pages/PDFViewerPage";
import { AboutPage } from "./pages/AboutPage";
import IslamicNotification from "./components/Notification";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";

// Import calculator pages for different wilayas
import { AlgerFirstYearCalculator } from "./pages/calculator/alger/firstyear/firstyear";
import { AlgerSecondYearCalculator } from "./pages/calculator/alger/secondyear/secondyear";
import OranFirstYearCalculator from "./pages/calculator/oran/firstyear";
import ConstantineMedicineCalculator from "./pages/calculator/costantine/firstyear";
import { TiziFirstYearCalculator } from "./pages/calculator/tizi/firstyear";


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
      <Toaster
        position="top-right"
        toastOptions={{
          className: "bg-slate-800 text-white font-(family-name:--my-font)",
        }}
      />
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
                        <Route path="/lessons" element={<AddCourse />} />
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

          {/* Public Routes */}
          <Route path="/pdf-viewer/:pdfUrl" element={<PDFViewerPage />} />
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="p-0 lg:ml-64 pt-14 m:p-8 ">
                  <div className="w-full max-w-full mx-auto sm:max-w-screen-lg sm:px-0">
                    <Routes>
                      {/* Home Page */}
                      <Route path="/" element={<HomePage />} />
                      <Route path="/about" element={<AboutPage />} />

                      {/* Calculator Routes */}
                      <Route path="/calc" element={<CalcHomePage />} />

                      {/* Alger Routes */}
                      <Route
                        path="/calc/alger/firstyear"
                        element={<AlgerFirstYearCalculator />}
                      />
                      <Route
                        path="/calc/alger/secondyear"
                        element={<AlgerSecondYearCalculator />}
                      />

                      {/* oran Routes */}
                      <Route
                        path="/calc/oran/firstyear"
                        element={<OranFirstYearCalculator />}
                      />
                      {/* costantine Routes */}
                      <Route
                        path="/calc/costantine/firstyear"
                        element={<ConstantineMedicineCalculator />}
                      />
                      {/* Tizi Ouzou Routes */}
                      <Route
                        path="/calc/tizi/firstyear"
                        element={<TiziFirstYearCalculator />}
                      />

                      {/* Study Content Routes */}
                      <Route path="/year/:yearId" element={<YearPage />} />
                      <Route path="/unite/:uniteId" element={<UnitePage />} />
                      <Route
                        path="/module/:moduleId"
                        element={<ModulePage />}
                      />
                      <Route
                        path="/course/:courseId"
                        element={<CoursePage />}
                      />
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
