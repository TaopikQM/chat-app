import React from "react";

export const ContainerAw = ({ children }) => {
  return (
    <div className="w-full min-h-screen bg-[#f3f3f3] flex justify-center items-start py-10">
      <div className="w-full max-w-7xl bg-white p-10 rounded-lg shadow-lg">
        {children}
       
      </div>
    </div>
  );
};

export default ContainerAw;
