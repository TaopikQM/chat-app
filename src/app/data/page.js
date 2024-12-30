
"use client";

import React, { useState } from 'react';

import ContainerAw from '../components/containerAw';
import Navbar from '../components/Navbar';
import AddFiles from '../components/AddFiles';
import FilesList from '../components/FilesList';

const addFiles = () => {
  const [showForm, setShowForm] = useState(false);
  const [isDayMode, setIsDayMode] = useState(true); // State for day/night mode

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  const toggleDayNightMode = () => {
    setIsDayMode(prev => !prev);
  };

  return (
    <div className={isDayMode ? 'bg-white text-black' : 'bg-gray-800 text-white'}> {/* Conditional class names */}
      <ContainerAw>
        <div className="flex items-center justify-between mb-4">
          <button
  type="button"
  className={`py-2 px-4 rounded ${showForm ? 'bg-red-700 hover:bg-red-800 focus:ring-red-300' : isDayMode ? 'bg-blue-500 hover:bg-blue-700' : 'bg-blue-700 hover:bg-blue-500'} focus:outline-none text-white font-medium text-sm`}
  onClick={toggleForm}
>
  {showForm ? 'Back' : 'Add Files'}
</button>
          
              <div className="flex items-center">
            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isDayMode} 
                onChange={toggleDayNightMode} 
                className="sr-only" 
              />
              <div className="w-12 h-6 bg-gray-200 rounded-full dark:bg-gray-600 transition-colors duration-300 ease-in-out"></div>
              <div className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ease-in-out ${isDayMode ? 'translate-x-6' : ''}`}></div>
            </label>
            {/* Icons for day/night mode */}
            <span className="ml-2 text-sm">
              {isDayMode ? '☀️' : '🌙'}
            </span>
          </div>
           
        </div>
        
        {showForm && <AddFiles />}
        <br />
        <FilesList isDayMode={isDayMode} /> {/* Pass isDayMode prop */}
      </ContainerAw>
    </div>

  );
};

export default addFiles;



// "use client";

// import React, { useState } from 'react';

// import ContainerAw from '../components/containerAw';

// import Navbar from '../components/Navbar';

// import AddFiles from '../components/AddFiles';
// import FilesList from '../components/FilesList';


// const addFiles = () => {

//     const [showForm, setShowForm] = useState(false);

//   const toggleForm = ({ Component, pageProps }) => {
//     setShowForm(!showForm);
//   };
//   // Your component logic here
//   return (
    
//      <div>
//      <ContainerAw>

//             <div className="flex items-center justify-center">
//                 <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={toggleForm}>Add Files</button>
//             </div>
//             {showForm && <AddFiles />}
//             <br/>
//           <FilesList/>
       
//         </ContainerAw>
   
//    </div>
//   );
// };

// export default addFiles;
