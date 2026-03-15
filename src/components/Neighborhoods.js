import React from "react";

function Neighborhoods({ locations, locationValues, onChange, options }) {
  // Safety checks for props
  const safeLocations = Array.isArray(locations) ? locations : [];
  const safeValues = locationValues || {};
  const safeOptions = options || {}; // Expecting simple dict: { "Key": "Value" }

  if (safeLocations.length === 0) return null;

  return safeLocations.map((location) => {
    const label = getLabel(location);
    const currentValue = safeValues[location] || "";

    const handleChange = ({ target }) => {
      // target.value is the KEY from the dictionary
      const selectedKey = target.value;
      // Look up the VALUE associated with that key
      const returnValue = safeOptions[selectedKey];
      
      // Send the VALUE back to the parent
      onChange(location, returnValue);
    };

    return (
      <div key={location} className="w-100 flex items-center justify-between mt2">
        <label htmlFor={label}>{location}</label>
        
        {/* Single Dropdown showing Keys */}
        <select
          id={label}
          name={label}
          required
          value={currentValue ? Object.keys(safeOptions).find(key => safeOptions[key] === currentValue) : ""}
          onChange={handleChange}
          className="flex w-100 ml3 mw5"
        >
          <option value="">Select...</option>
          {Object.keys(safeOptions).map((key) => (
            <option key={key} value={key}>
              {key} {/* Display the Key to the user */}
            </option>
          ))}
        </select>
      </div>
    );
  });
}

function getLabel(location) {
  if (location === "neighborhood") return "neighborhood location";
  return location;
}

export default Neighborhoods;