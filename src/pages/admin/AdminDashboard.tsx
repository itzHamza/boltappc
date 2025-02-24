import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export function AdminDashboard() {
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newModule, setNewModule] = useState({
    title: "",
    description: "",
    year_id: "",
  });

  useEffect(() => {
    fetchModules();
  }, []);

  async function fetchModules() {
    setLoading(true);
    const { data, error } = await supabase.from("modules").select("*");
    if (error) console.error("Error fetching modules:", error);
    else setModules(data);
    setLoading(false);
  }

  async function fetchLessons(moduleId) {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("module_id", moduleId);
    if (error) console.error("Error fetching lessons:", error);
    else setLessons(data);
    setSelectedModule(moduleId);
    setLoading(false);
  }

  async function addModule() {
    if (!newModule.title || !newModule.year_id) {
      return alert("Module title and Year ID are required!");
    }

    const moduleData = {
      id: crypto.randomUUID(), // ✅ Ensure a unique ID
      title: newModule.title,
      description: newModule.description || null, // ✅ Allow NULL descriptions
      year_id: parseInt(newModule.year_id), // ✅ Convert to INTEGER
      course_count: 0, // Default value
    };

    const { data, error } = await supabase.from("modules").insert([moduleData]);

    if (error) {
      console.error("Error adding module:", error.message);
      alert(`Error adding module: ${error.message}`);
    } else {
      setNewModule({ title: "", description: "", year_id: "" });
      fetchModules();
    }
  }

  async function deleteModule(id) {
    await supabase.from("modules").delete().eq("id", id);
    fetchModules();
  }

  async function deleteLesson(id) {
    await supabase.from("courses").delete().eq("id", id);
    fetchLessons(selectedModule);
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      {/* Add New Module */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Add Module</h2>
        <input
          type="text"
          placeholder="Module Title"
          value={newModule.title}
          onChange={(e) =>
            setNewModule({ ...newModule, title: e.target.value })
          }
          className="p-2 border w-full mb-2"
        />
        <textarea
          placeholder="Module Description (Optional)"
          value={newModule.description}
          onChange={(e) =>
            setNewModule({ ...newModule, description: e.target.value })
          }
          className="p-2 border w-full mb-2"
        />
        <input
          type="number"
          placeholder="Year ID (Must Exist in 'years' Table)"
          value={newModule.year_id}
          onChange={(e) =>
            setNewModule({ ...newModule, year_id: e.target.value })
          }
          className="p-2 border w-full mb-2"
        />
        <button
          onClick={addModule}
          className="px-4 py-2 bg-green-500 text-white rounded-lg"
        >
          Add Module
        </button>
      </div>

      {/* Modules Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Modules</h2>
        {loading ? <p>Loading...</p> : null}
        {modules.map((module) => (
          <div key={module.id} className="p-4 bg-gray-100 rounded-lg mb-2">
            <div className="flex justify-between items-center">
              <h3 className="text-xl">{module.title}</h3>
              <div>
                <button
                  onClick={() => fetchLessons(module.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg mr-2"
                >
                  View Lessons
                </button>
                <button
                  onClick={() => deleteModule(module.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lessons Section */}
      {selectedModule && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Lessons in {selectedModule}
          </h2>
          {lessons.map((lesson) => (
            <div key={lesson.id} className="p-4 bg-gray-200 rounded-lg mb-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xl">{lesson.title}</h3>
                <button
                  onClick={() => deleteLesson(lesson.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
