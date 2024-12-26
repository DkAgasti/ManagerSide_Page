import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SetTime from './managerside/SetTime'
import Nav from './managerside/Pages/Nav'
import Sidebar from './managerside/Pages/Sidebar'
import ClusterviewDetails from './managerside/Pages/ClusterviewDetails';


const App = () => {
  return (
    <Router>
    <div className="flex flex-col h-screen">
      <Nav />

      <div className="flex flex-1">  
        <Sidebar />

        <div className="flex-1 p-4 overflow-y-auto">
          <Routes>
            <Route path="/" element={<SetTime />} />
            <Route path="/clusterview/:id" element={<ClusterviewDetails />} />
        
          </Routes>
        </div>
      </div>
    </div>
  </Router>
  )
}

export default App
