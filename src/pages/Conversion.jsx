

import React from "react";

import ConversionReport from "../components/conversion/ConversionReport";

const Conversion = () => {
  return (
    <div className="p-6 md:ml-72 max-w-7xl mx-auto">
      {/* Page Heading */}
      <h1 className="text-5xl md:text-6xl font-serif font-extrabold text-center mb-12  text-gray-900 drop-shadow-md tracking-tight">
        🛒 Conversion
      </h1>

      {/* Offers Table */}
      <ConversionReport />
    </div>
  );
};

export default Conversion;
