import React from "react";

function Wards({ wards, wardValues, onChange }) {
  if (!wards) return null;
  return wards.map((ward) => {
    const label = getWard(ward);
    const value = wardValues[ward] || "";
    const handleChange = ({ target }) => {
      const { value } = target;
      if (ward === "wardnumber") {
        const inRange = value > 0 && value <= 8;
        const isValid = !isNaN(value) && inRange;
        if (value && !isValid) {
          alert("Ward numbers must be between 1 and 8!");
          return;
        }
      }
      onChange(ward, value);
    };

    return (
      <div key={ward} className="w-100 flex items-center justify-between mt2">
        <label htmlFor={ward}>{label}</label>
        <input
          required
          value={value}
          spellCheck={false}
          className="flex w-100 ml3 mw5"
          onChange={handleChange}
        />
      </div>
    );
  });
}

function getWard(ward) {
  if (ward === "wardnumber") return "ward selection";
  if (ward === "1") return "ward1";
  if (ward === "2") return "ward2";
  if (ward === "3") return "ward3";
  if (ward === "4") return "ward4";
  if (ward === "5") return "ward5";
  if (ward === "6") return "ward6";
  if (ward === "7") return "ward7";
  if (ward === "8") return "ward8";
  return ward;
}

export default Wards;
