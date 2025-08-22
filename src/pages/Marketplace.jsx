import React from "react";
import OffersTable from "../components/offerslist/offerslist";

const Marketplace = () => {
  return (
    <div className="p-6 md:ml-72 max-w-7xl mx-auto">
      {/* Page Heading */}
      <h1 className="text-5xl md:text-6xl font-serif font-extrabold text-center mb-12 mt-12 text-gray-900 drop-shadow-md tracking-tight">
        🛒 Marketplace
      </h1>

      {/* Offers Table */}
      <OffersTable />
    </div>
  );
};

export default Marketplace;
