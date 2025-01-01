import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const TaskAssign = ({ devices }) => {
  const [ponds, setPonds] = useState([]);
  const { id } = useParams();
  const apiUrl = process.env.REACT_APP_IP;
  const [pondDevices, setPondDevices] = useState([]);
  const [maxTimeColumns, setMaxTimeColumns] = useState(1);

  const fetchPonds = async () => {
    try {
      const res = await axios.get(`${apiUrl}/adminpond_view/${id}/`);
      setPonds(res.data);
      const initialPondDevices = res.data.map((pond) => ({
        pondId: pond.id,
        pondName: pond.name,
        devices: devices.map((device) => ({
          deviceName: device.name,
          times: [
            {
              from: "",
              to: "",
              quantity: "",
              probiotics: "", // Ensure probiotics is initialized
            },
          ],
        })),
      }));
      setPondDevices(initialPondDevices);
    } catch (error) {
      console.error("Error fetching ponds:", error);
    }
  };

  useEffect(() => {
    fetchPonds();
  }, []);

  const addTimeColumn = (pondIndex, deviceIndex) => {
    const updatedPondDevices = [...pondDevices];
    const device = updatedPondDevices[pondIndex].devices[deviceIndex];
    device.times.push({
      from: "",
      to: "",
      quantity: "",
      probiotics: "", // Ensure probiotics is initialized
    });
    const maxColumns = Math.max(
      ...updatedPondDevices.flatMap((pond) =>
        pond.devices.map((device) => device.times.length)
      )
    );
    setMaxTimeColumns(maxColumns);
    setPondDevices(updatedPondDevices);
  };

  const updateTimeField = (pondIndex, deviceIndex, timeIndex, field, value) => {
    const updatedPondDevices = [...pondDevices];
    updatedPondDevices[pondIndex].devices[deviceIndex].times[timeIndex][field] = value;
    setPondDevices(updatedPondDevices);
  };

  const updateQuantity = (pondIndex, deviceIndex, timeIndex, value) => {
    const updatedPondDevices = [...pondDevices];
    updatedPondDevices[pondIndex].devices[deviceIndex].times[timeIndex].quantity = value;
    setPondDevices(updatedPondDevices);
  };

  const updateProbiotics = (pondIndex, deviceIndex, timeIndex, value) => {
    const updatedPondDevices = [...pondDevices];
    updatedPondDevices[pondIndex].devices[deviceIndex].times[timeIndex].probiotics = value;
    setPondDevices(updatedPondDevices);
  };

  const addCheckTrayRow = (pondIndex) => {
    const updatedPondDevices = [...pondDevices];

    // Find the index of the first "Check Tray"
    const checkTrayIndex = updatedPondDevices[pondIndex].devices.findIndex(
      (device) => device.deviceName.startsWith("Check Tray")
    );

    // Count existing Check Tray rows
    const checkTrayCount = updatedPondDevices[pondIndex].devices.filter((device) =>
      device.deviceName.startsWith("Check Tray")
    ).length;

    // Insert a new Check Tray row right after the first Check Tray
    const newCheckTray = {
      deviceName: `Check Tray ${checkTrayCount + 1}`,
      times: [{ from: "", to: "", quantity: "" }],
    };

    updatedPondDevices[pondIndex].devices.splice(checkTrayIndex + checkTrayCount, 0, newCheckTray);

    setPondDevices(updatedPondDevices);
  };

  const submitData = async (pondIndex, deviceIndex) => {
    const pond = pondDevices[pondIndex];
    const device = pond.devices[deviceIndex];
    const tasks = [
      device.deviceName,
      device.times.map((time) => [time.from, time.to]),
      pond.pondName,
      pond.pondId,
      device.times.map((time) => time.quantity || null),
      device.times.map((time) => time.probiotics || null), // Include probiotics in tasks
    ];
    console.log(tasks);
    try {
      const response = await axios.post(`${apiUrl}/work_assign/`, { tasks });
      console.log("Submission successful:", response.data);
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  return (
    <div className="container mx-full">
      {pondDevices.map((pond, pondIndex) => (
        <div key={pondIndex} className="flex justify-between items-start mb-6">
          <div className="w-[550px] overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 mb-4">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">Device</th>
                  <th colSpan={maxTimeColumns} className="border border-gray-300 p-2">
                    <div className="flex space-x-2 overflow-x-auto w-full">
                      {[...Array(maxTimeColumns)].map((_, timeIndex) => (
                        <div
                          key={timeIndex}
                          className="flex-shrink-0 w-[350px] border-r last:border-0 px-2"
                        >
                          <div className="text-center font-medium">Time {timeIndex + 1}</div>
                        </div>
                      ))}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pond.devices.map((device, deviceIndex) => (
                  <tr key={deviceIndex}>
                    <td className="border border-gray-300 p-2 flex items-center justify-between h-[65px]">
                      {device.deviceName}
                      {device.deviceName === "Check Tray" && (
                        <button
                          onClick={() => addCheckTrayRow(pondIndex)}
                          className="bg-transparent text-green-700 hover:text-black p-2 rounded-full transition-colors"
                          title="Add Check Tray"
                        >
                          <i className="bi bi-plus-circle"></i>
                        </button>
                      )}
                    </td>
                    <td colSpan={maxTimeColumns} className="border border-gray-300 p-1">
                      <div className="flex space-x-2 overflow-x-auto">
                        {[...Array(maxTimeColumns)].map((_, timeIndex) => (
                          <div
                            key={timeIndex}
                            className="flex-shrink-0 w-[350px] border-r last:border-0"
                          >
                            {device.times[timeIndex] ? (
                              <div className="flex space-x-2 mt-0">
                                <div>
                                  <label className="text-sm font-medium text-gray-700 flex justify-center">
                                    Start Time
                                  </label>
                                  <input
                                    type="time"
                                    value={device.times[timeIndex].from}
                                    onChange={(e) =>
                                      updateTimeField(
                                        pondIndex,
                                        deviceIndex,
                                        timeIndex,
                                        "from",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded px-1 py-1 bg-green-400"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700 flex justify-center">
                                    End Time
                                  </label>
                                  <input
                                    type="time"
                                    value={device.times[timeIndex].to}
                                    onChange={(e) =>
                                      updateTimeField(
                                        pondIndex,
                                        deviceIndex,
                                        timeIndex,
                                        "to",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded px-2 py-1 bg-red-400"
                                  />
                                </div>
                                {device.deviceName === "Feeding" && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-700 flex justify-center">
                                      Feed qt.
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={device.times[timeIndex].quantity || ""}
                                      onChange={(e) =>
                                        updateQuantity(
                                          pondIndex,
                                          deviceIndex,
                                          timeIndex,
                                          e.target.value
                                        )
                                      }
                                      className="w-full border border-gray-300 rounded px-2 py-1 bg-yellow-400"
                                    />
                                  </div>
                                )}
                                {device.deviceName === "Feeding" && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-700 flex justify-center">
                                      Probiotics
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Enter probiotics (comma-separated)"
                                      value={device.times[timeIndex].probiotics || ""}
                                      onChange={(e) =>
                                        updateProbiotics(
                                          pondIndex,
                                          deviceIndex,
                                          timeIndex,
                                          e.target.value
                                        )
                                      }
                                      className="w-full border border-gray-300 rounded px-2 py-1 bg-purple-400"
                                    />
                                  </div>
                                )}
                                {device.deviceName.startsWith("Check Tray") && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-700 flex justify-center">
                                      Quantity
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={device.times[timeIndex].quantity || ""}
                                      onChange={(e) =>
                                        updateQuantity(
                                          pondIndex,
                                          deviceIndex,
                                          timeIndex,
                                          e.target.value
                                        )
                                      }
                                      className="w-full border border-gray-300 rounded px-2 py-1 bg-yellow-400"
                                    />
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="w-auto flex flex-col items-center justify-start border ms-2">
            <div className="w-full text-center py-1 font-semibold text-lg">Actions</div>
            <table className="w-full mt-1">
              <tbody>
                {pond.devices.map((device, deviceIndex) => (
                  <tr key={deviceIndex}>
                    <td className="border p-3 text-center">
                      <button
                        onClick={() => addTimeColumn(pondIndex, deviceIndex)}
                        className="bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-700"
                      >
                        Add Time
                      </button>
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        onClick={() => submitData(pondIndex, deviceIndex)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Submit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="w-1/4 flex items-center justify-center border h-[240px] ms-5 bg-blue-100">
            <div className="bg-blue-300 border border-gray-300 p-4 text-center rounded-lg shadow-md text-xl font-bold">
              {pond.pondName}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskAssign;
