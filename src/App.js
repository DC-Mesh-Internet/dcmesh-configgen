import React, { useState, useEffect } from "react";
import Mustache from "mustache";
import qs from "qs";

import Options from "./components/Options";
import Tags from "./components/Tags";
import Wards from "./components/Wards";
import Neighborhoods from "./components/Neighborhoods";
import Script from "./components/Script";
import InfoText from "./components/InfoText";

import { fetchVersions, fetchDevices, fetchTemplates } from "./api/github";

function App() {
  const [versions, setVersions] = useState();
  const [devices, setDevices] = useState();
  const [templates, setTemplates] = useState();

  const [selectedVersion, setSelectedVersion] = useState();
  const [selectedDevice, setSelectedDevice] = useState();
  const [selectedTemplate, setSelectedTemplate] = useState();

  const [tagValues, setTagValues] = useState({});
  const [wardValues, setWardValues] = useState({});
  const [locationValues, setLocationValues] = useState({});

  const params = qs.parse(window.location.search.replace("?", ""));

  // Fetch versions
  useEffect(() => {
    asyncFunc();
    async function asyncFunc() {
      const versions = await fetchVersions();
      setVersions(versions);
      const paramVersion = versions.filter((v) => v === params.version)[0];
      setSelectedVersion(paramVersion || versions[0]);
    }
  }, []);

  // Fetch devices for selected version
  useEffect(() => {
    if (!selectedVersion) return;
    asyncFunc();
    async function asyncFunc() {
      const devices = await fetchDevices(selectedVersion);
      setDevices(devices);
      const paramDevice = devices.filter((d) => d.name === params.device)[0];
      setSelectedDevice(paramDevice || devices[0]);
    }
  }, [selectedVersion]);

  // Fetch templates for selected device and version
  useEffect(() => {
    if (!selectedVersion || !selectedDevice) return;
    asyncFunc();
    async function asyncFunc() {
      const templates = await fetchTemplates(selectedVersion, selectedDevice);
      const paramTemplate = templates.filter(
        (t) => t.name === params.template
      )[0];
      setTemplates(templates);
      setSelectedTemplate(paramTemplate || templates[0]);
    }
  }, [selectedVersion, selectedDevice]);

  // Parse template variables ONCE
  const allVars = selectedTemplate
    ? Mustache.parse(selectedTemplate.content).reduce(
        (acc, i) =>
          !acc.includes(i[1]) && i[0] === "name" ? acc.concat(i[1]) : acc,
        []
      )
    : null;

  // Split: ward-related variables go to Wards, rest go to Tags
  const wards = allVars?.filter(v => v.includes("ward")) || null;
  const tags = allVars?.filter(v => v.includes("tag")) || null;
  const locations = allVars?.filter(v => v.includes("location")) || null;

  const onVersionSelected = (version) => {
    setSelectedVersion(version);
    setSelectedDevice();
    setSelectedTemplate();
    setDevices();
    setTemplates();
    setQuery({ version });
  };

  const onDeviceSelected = (device) => {
    setSelectedDevice(device);
    setSelectedTemplate();
    setTemplates();
    setQuery({ version: selectedVersion, device: device.name });
  };

  const onTemplateSelected = (template) => {
    setSelectedTemplate(template);
    setQuery({
      version: selectedVersion,
      device: selectedDevice.name,
      template: template.name,
    });
  };

  const onTagChange = (key, value) => {
    setTagValues(prev => ({ ...prev, [key]: value }));
  };

  const onWardChange = (key, value) => {
    setWardValues(prev => ({ ...prev, [key]: value }));
  };

  const onLocationChange = (key, value) => {
    setLocationValues(prev => ({ ...prev, [key]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    downloadConfig(selectedTemplate, tagValues, wardValues, locationValues);
  };

  const wardOptions = {
        "Ward 1" : [ "1a", "1b", "1c", "1d", "1e"],
        "Ward 2" : [ "2a", "2b", "2c", "2d", "2e", "2f", "2g" ],
        "Ward 3" : [ "3a", "3b", "3c", "3d", "3e", "3f", "3g" ],
        "Ward 4" : [ "4a", "4b", "4c", "4d", "4e", "4f", "4g" ],
        "Ward 5" : [ "5a", "5b", "5c", "5d", "5e", "5f" ],
        "Ward 6" : [ "6a", "6b", "6c", "6d", "6e", "6f" ],
        "Ward 7" : [ "7a", "7b", "7c", "7d", "7e", "7f" ],
        "Ward 8" : [ "8a", "8b", "8c", "8d", "8e", "8f" ]
    }

  const locationOptions = {
        "Adams Morgan" : "admo",
        "Columbia Heights" : "cohi",
        "Kalorama Triangle" : "katr",
        "Lanier Heights" : "lahi",
        "LeDroit Park" : "dprk",
        "Meridian Hill" : "mehi",
        "Mount Pleasant" : "mntp",
        "Park View" : "prkv",
        "Pleasant Plains" : "plpl",
        "U Street Corridor" : "ustc",
        "Woodley Park" : "wprk",
        "Burleith" : "burl",
        "Chinatown" : "ctwn",
        "Downtown" : "dtwn",
        "Dupont Circle" : "duci",
        "Foggy Bottom" : "fobo",
        "Georgetown" : "gtwn",
        "Sheridan-Kalorama" : "shka",
        "Logan Circle" : "loci",
        "Mount Vernon Square" : "mvsq"
    }

  console.log("allVars:", allVars);      // Should show all variables
  console.log("wards:", wards);          // Should show only ward variables
  console.log("tags:", tags);            // Should show only non-ward variables
  console.log("wardOptions:", wardOptions); // Should be a nested object
  console.log("locationOptions:", locationOptions); // Should be a nested object
  console.log("wardValues:", wardValues);   // Should be a nested object
  console.log("tagValues:", tagValues);   // Should be a nested object
  console.log("locationValues:", locationValues);   // Should be a nested object

  return (
    <div className="vh-100-l flex flex-row-l flex-column f5">
      <div className="bg-near-white measure-l w-100 pa4 unselectable br b--light-gray">
        <form id="fill" className="flex flex-column items-end" onSubmit={onSubmit}>
          <Options
            versions={versions}
            devices={devices}
            templates={templates}
            selectedVersion={selectedVersion}
            selectedDevice={selectedDevice}
            selectedTemplate={selectedTemplate}
            onVersionSelected={onVersionSelected}
            onDeviceSelected={onDeviceSelected}
            onTemplateSelected={onTemplateSelected}
          />

          <Wards wards={wards || []}   wardValues={wardValues || {}} options={wardOptions} onChange={onWardChange} />
          <Neighborhoods locations={locations || ""}   locationValues={locationValues || {}} options={locationOptions} onChange={onLocationChange} />
          <Tags tags={tags} tagValues={tagValues} onChange={onTagChange} />

          {selectedVersion && selectedDevice && selectedTemplate && (
            <input
              type="submit"
              value="Download config"
              className="mt3 pa2 pointer"
            />
          )}
        </form>
        {selectedVersion && selectedDevice && selectedTemplate && <InfoText />}
      </div>
      <div className="w-100 h-100 overflow-y-scroll">
        <Script template={selectedTemplate} tagValues={tagValues} wardValues={wardValues} locationValues={locationValues}/>
      </div>
    </div>
  );
}

export default App;

function setQuery(params) {
  window.history.replaceState(
    null,
    null,
    window.location.pathname + "?" + qs.stringify(params)
  );
}

function downloadConfig(template, tags, wards, locations) {
  if (!template || !tags || !wards || !locations) return null;

  const { name, content } = template;
  const fileName = name
    ? name.replace("nnnn", tags.nodenumber).replace("wwww", wards.wardnumber).replace("llll", locations.neighborhood).replace(".tmpl", "")
    : "config.txt";
  const configText = Mustache.render(content, tags, wards);
  var blob = new Blob([configText], {
    type: "text/csv;charset=utf8;", // Why csv??
  });

  var element = document.createElement("a");
  document.body.appendChild(element);
  element.setAttribute("href", window.URL.createObjectURL(blob));
  element.setAttribute("download", fileName);
  element.style.display = "";
  element.click();
  document.body.removeChild(element);
}
