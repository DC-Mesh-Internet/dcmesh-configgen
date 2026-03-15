import React, { useState } from "react";

function Wards({ wards, wardValues, onChange, options }) {
  const safeTags = Array.isArray(wards) ? wards : [];
  const safeTagValues = wardValues || {};
  const safeOptions = options || {};

  // Track only user-initiated category selections, not derived values
  const [userSelectedCategory, setUserSelectedCategory] = useState({});

  if (safeTags.length === 0) return null;

  return safeTags.map((ward) => {
    if (ward === "wardnumber") return null;

    const label = getLabel(ward);
    const value = safeTagValues[ward] || "";

    // Compute category: use user selection if exists, otherwise derive from current value
    const getCategoryForValue = (val) => {
      if (!val) return Object.keys(safeOptions)[0] || "";
      return (
        Object.keys(safeOptions).find((key) =>
          safeOptions[key]?.includes(val)
        ) || Object.keys(safeOptions)[0] || ""
      );
    };

    const category =
      userSelectedCategory[ward] !== undefined
        ? userSelectedCategory[ward]
        : getCategoryForValue(value);

    const subOptions = safeOptions[category] || [];

    const handleValueChange = ({ target }) => {
      onChange(ward, target.value);
    };

    const handleCategoryChange = ({ target }) => {
      setUserSelectedCategory((prev) => ({ ...prev, [ward]: target.value }));
      onChange(ward, ""); // Reset value when category changes
    };

    return (
      <div key={ward} className="w-100 flex items-center justify-between mt2">
        <label htmlFor={label}>{label}</label>

        <div className="flex w-100 ml3 mw5">
          <select
            id={`${label}-category`}
            name={`${label}-category`}
            value={category}
            onChange={handleCategoryChange}
            className="flex-1 mr1"
          >
            {Object.keys(safeOptions).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>

          <select
            id={label}
            name={label}
            required
            value={value}
            onChange={handleValueChange}
            className="flex-1"
          >
            <option value="">Select...</option>
            {subOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
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