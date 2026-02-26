import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AppointmentSearchWidget() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState("doctor");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedHospital, setSelectedHospital] = useState("");

  const { data: departments = [] } = useQuery({
    queryKey: ["widget-departments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("departments")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
  });

  const { data: hospitals = [] } = useQuery({
    queryKey: ["widget-hospitals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("hospitals")
        .select("id, name, city")
        .eq("status", "approved")
        .order("name");
      return data || [];
    },
  });

  const cities = Array.from(new Set(hospitals.map((h) => h.city).filter(Boolean)));

  const handleSearch = () => {
    if (searchType === "doctor") {
      const params = new URLSearchParams();
      if (selectedDepartment) params.set("department", selectedDepartment);
      if (selectedCity) params.set("location", selectedCity);
      navigate(`/doctors${params.toString() ? `?${params}` : ""}`);
    } else if (searchType === "hospital") {
      navigate("/departments");
    } else {
      navigate("/ambulance");
    }
  };

  return (
    <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-2xl">
      <h2 className="font-display text-xl font-bold text-foreground">
        Get Appointment
      </h2>

      <RadioGroup
        value={searchType}
        onValueChange={setSearchType}
        className="mt-4 flex gap-6"
      >
        {[
          { value: "doctor", label: "Doctor" },
          { value: "hospital", label: "Hospital" },
          { value: "ambulance", label: "Ambulance" },
        ].map((opt) => (
          <div key={opt.value} className="flex items-center gap-1.5">
            <RadioGroupItem value={opt.value} id={`type-${opt.value}`} />
            <Label
              htmlFor={`type-${opt.value}`}
              className="cursor-pointer text-sm font-medium text-foreground"
            >
              {opt.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="mt-5 space-y-3">
        {searchType !== "ambulance" && (
          <>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city!}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {searchType === "doctor" && (
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Doctor Speciality" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {searchType === "hospital" && (
              <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Hospital" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals
                    .filter((h) => !selectedCity || h.city === selectedCity)
                    .map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </>
        )}

        <Button
          variant="hero"
          className="w-full"
          size="lg"
          onClick={handleSearch}
        >
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>
    </div>
  );
}
