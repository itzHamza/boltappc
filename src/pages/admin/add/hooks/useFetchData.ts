// hooks/useFetchData.ts
import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { toast } from "sonner";

interface Year {
  id: string | number;
  title: string;
}

interface Unite {
  id: string;
  title: string;
}

interface Module {
  id: string;
  title: string;
  course_count?: number;
}

export function useFetchData() {
  const [years, setYears] = useState<Year[]>([]);
  const [unites, setUnites] = useState<Unite[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | number>("");
  const [selectedUniteId, setSelectedUniteId] = useState<string>("");

  // Fetch school years
  const fetchYears = async () => {
    const { data, error } = await supabase.from("years").select("id, title");
    if (error) {
      toast.error("Error fetching years:", error);
    } else {
      console.log("السنوات التي تم جلبها:", data);
      setYears(data);
    }
  };

  // Fetch units and modules when selected year changes
  const fetchUnitesAndModules = async (yearId: string | number) => {
    setSelectedYear(yearId);
    setSelectedUniteId("");
    setUnites([]);
    setModules([]);

    if (!yearId) return;

    // Fetch units for the selected year
    const { data: unites, error: uniteError } = await supabase
      .from("unites")
      .select("id, title")
      .eq("year_id", yearId);

    if (uniteError) toast.error("Error fetching unites:", uniteError);
    else setUnites(unites);

    // Fetch modules directly linked to the year (without a unit)
    const { data: modules, error: moduleError } = await supabase
      .from("modules")
      .select("id, title")
      .eq("year_id", yearId)
      .is("unite_id", null);

    if (moduleError) toast.error("Error fetching modules:", moduleError);
    else setModules(modules);
  };

  // Fetch modules linked to the selected unit
  const fetchModulesByUnite = async (uniteId: string) => {
    setSelectedUniteId(uniteId);
    setModules([]);

    const { data, error } = await supabase
      .from("modules")
      .select("id, title")
      .eq("unite_id", uniteId);

    if (error) toast.error("Error fetching modules:", error);
    else setModules(data);
  };

  // Calculate order for new lesson
  const getNextOrder = async (moduleId: string) => {
    const { data, error } = await supabase
      .from("courses")
      .select("order")
      .eq("module_id", moduleId)
      .order("order", { ascending: false })
      .limit(1);

    if (error) {
      toast.error("Error getting course count:", error);
      return 0;
    }

    if (data && data.length > 0 && data[0].order !== null) {
      return data[0].order + 1;
    }

    return 0;
  };

  useEffect(() => {
    fetchYears();
  }, []);

  return {
    years,
    unites,
    modules,
    selectedYear,
    selectedUniteId,
    fetchUnitesAndModules,
    fetchModulesByUnite,
    getNextOrder,
  };
}

export default useFetchData;
