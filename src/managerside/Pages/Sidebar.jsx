import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link } from "react-router-dom";
import axios from "axios";

const Sidebar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const URL = process.env.REACT_APP_IP  ;
  const  mob  =7585349545;

  // 7585349545

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    
  };

  // Fetch cluster data from backend
  const fetchClusters = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${URL}/admin_cluster_view/${mob}/`);        
      console.log(response.data);
      
      setClusters(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch cluster data. Please try again later.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
  }, []); // Fetch data when the component mounts

  return (
    <aside className="h-full">                                                          
      {/* Cluster Dropdown */}
      <div className="w-40 h-full bg-white shadow-2xl flex flex-col items-center mt-4">
        <div className="bg-sky-100 w-full rounded-t-lg">
          <button
            className="w-full flex items-center justify-between p-6 rounded-lg bg-sky-100"
            onClick={toggleDropdown}
          >
            <div className="flex items-center">
              <i className="bi bi-diagram-3-fill text-xl mr-2"></i>
              <span className="font-bold text-sm">Kavoor</span>
            </div>
            <i className={`bi ${dropdownOpen ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
          </button>
        </div>

        <div className="w-full text-center">
          {loading ? (
            <p className="text-gray-500 mt-2">Loading clusters...</p>
          ) : error ? (
            <p className="text-red-500 mt-2">{error}</p>
          ) : (
            dropdownOpen && (
              <div className="mt-2 w-full">
                {clusters.map((cluster) => (
                  <Link key={cluster.id} to={`/clusterview/${cluster.id}`}>
                    <div className="p-2 hover:bg-sky-200 text-sm cursor-pointer">
                      {cluster.Name}
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
