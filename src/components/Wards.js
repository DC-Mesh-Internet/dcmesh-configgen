import React, { useState, useEffect } from "react";

function Wards({ wards, wardValues, onChange, options }) {
  // Safely ensure props are always valid
  const safeTags = Array.isArray(wards) ? wards : [];
  const safeTagValues = wardValues || {};
  const safeOptions = options || {};

  // State to track the selected "Category" (first dropdown) for each ward
  const [firstLevel, setFirstLevel] = useState({});

  // Sync state: if wardValues or options change, find which Category the current value belongs to
  useEffect(() => {
    if (!safeOptions || !safeTagValues || safeTags.length === 0) return;

    const newLevels = {};
    safeTags.forEach((ward) => {
      if (ward === "wardnumber") return;
      const currentValue = safeTagValues[ward];
      const foundKey = Object.keys(safeOptions).find((key) =>
        safeOptions[key] && Array.isArray(safeOptions[key]) && safeOptions[key].includes(currentValue)
      );
      newLevels[ward] = foundKey || Object.keys(safeOptions)[0];
    });
    setFirstLevel(newLevels);
  }, [safeTagValues, safeOptions, safeTags]);

  if (safeTags.length === 0) return null;

  return safeTags.map((ward) => {
    const label = getLabel(ward);
    const value = safeTagValues[ward] || "";

    // Always get the category and sub-options
    const category = firstLevel[ward] || (Object.keys(safeOptions).length > 0 ? Object.keys(safeOptions)[0] : "");
    const subOptions = safeOptions[category] || [];

    const handleValueChange = ({ target }) => {
      console.log("Saving result from Box 2:", target.value); // ← Check console
      onChange(ward, target.value);
    };
    const handleCategoryChange = ({ target }) => {
      setFirstLevel((prev) => ({ ...prev, [ward]: target.value }));
      onChange(ward, ""); // Reset value when category changes
    };

    return (
      <div key={ward} className="w-100 flex items-center justify-between mt2">
        <label htmlFor={label}>{label}</label>

        {/* ALWAYS RENDER TWO DROPDOWNS - No text input fallback */}
        <div className="flex w-100 ml3 mw5">
          {/* First Dropdown: Category */}
          <select
            id={label}
            name={label}
            value={category}
            onChange={handleCategoryChange}
            className="flex-1 mr1"
          >
            {Object.keys(safeOptions).map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
          
          {/* Second Dropdown: Value */}
          <select
            id="ward"
            name="ward"
            required
            value={value}
            onChange={handleValueChange}
            className="flex-1"
          >
            <option value="">Select...</option>
            {subOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>
    );
  });
}

function getLabel(ward) {
  if (ward === "wardnumber") return "ward number";
  return ward;
}

export default Wards;