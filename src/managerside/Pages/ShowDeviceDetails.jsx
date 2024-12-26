import React, { useEffect, useState } from "react";
import axios from "axios";
import TaskAssign from "./TaskAssign";
// import TaskassignModel from "./TaskassignModel";

const ShowDeviceDetails = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const apiUrl = process.env.REACT_APP_IP;

  const fetchData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/devicedetails_get/`);
      const devicesData = response.data;
      setDevices(devicesData);
      console.log("API Response:", devicesData);
      
      // Automatically select the first device if available
      if (devicesData.length > 0) {
        setSelectedDevice(devicesData[0]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Run only once when the component mounts

  return (
    <div className="flex  p-4">
      {/* Device List */}
      <div className="flex flex-col gap-4 w-48 p-2 overflow-y-auto border re">
        {devices.length > 0 ? (
          devices.map((device, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-2 bg-white border-b-2 h-24 cursor-pointer hover:bg-blue-200 hover:scale-105 transform transition-all"
              onClick={() => setSelectedDevice(device)}
            >
              <img
                src={`${apiUrl}${device.image}`}
                alt={device.name}
                className="w-12 h-12 object-cover rounded-full"
              />
              <p className="text-sm font-medium text-center mt-1 mb-1">
                {device.name}
              </p>
            </div>
          ))
        ) : (
          <p>No devices found.</p>
        )}
      </div>

      {/* Device Detail */}
      <div className="flex-grow rounded-lg ml-4 h-full">
        {selectedDevice ? (
          <TaskAssign deviceName={selectedDevice.name} devices={devices} />
        ) : (
          <p className="text-gray-500">Loading......</p>
        )}
      </div>
    </div>
  );
};

export default ShowDeviceDetails;
