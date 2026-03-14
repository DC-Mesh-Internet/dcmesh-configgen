import React, { useState, useEffect } from "react";

function Wards({ wards, wardValues, onChange, options }) {
  // Safely ensure wards is always an array
  const safeTags = Array.isArray(wards) ? wards : [];
  const safeTagValues = wardValues || {};
  const safeOptions = options || {};

  // State to track the selected "Category" (first dropdown) for each ward
  const [firstLevel, setFirstLevel] = useState({});

  // When wardValues or options change, try to find which Category the current value belongs to
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

    // --- Logic for Dropdowns (if options provided and not wardnumber) ---
    const isDropdown = Object.keys(safeOptions).length > 0 && ward !== "wardnumber";
    const category = firstLevel[ward] || (Object.keys(safeOptions).length > 0 ? Object.keys(safeOptions)[0] : "");
    const subOptions = isDropdown ? (safeOptions[category] || []) : [];

    const handleChange = ({ target }) => {
      const { value } = target;
      if (ward === "wardnumber") {
        const inRange = value > 0 && value <= 8000;
        const isValid = !isNaN(value) && inRange;
        if (value && !isValid) {
          alert("Network numbers must be between 1 and 8000!");
          return;
        }
      }
      onChange(ward, value);
    };

    const handleCategoryChange = ({ target }) => {
      setFirstLevel((prev) => ({ ...prev, [ward]: target.value }));
      onChange(ward, "");
    };

    return (
      <div key={ward} className="w-100 flex items-center justify-between mt2">
        <label htmlFor={ward}>{label}</label>

        {isDropdown ? (
          <div className="flex w-100 ml3 mw5">
            <select
              value={category}
              onChange={handleCategoryChange}
              className="flex-1 mr1"
            >
              {Object.keys(safeOptions).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
            <select
              required
              value={value}
              onChange={handleChange}
              className="flex-1"
            >
              <option value="">Select...</option>
              {subOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ) : (
          <input
            required
            value={value}
            spellCheck={false}
            className="flex w-100 ml3 mw5"
            onChange={handleChange}
          />
        )}
      </div>
    );
  });
}

function getLabel(ward) {
  if (ward === "wardnumber") return "ward number";
  return ward;
}

export default Wards;