import React from "react";
import AffiliateGeneral from "../components/postbackintegration/AffiliateGenral";

const Settings = () => {
  return (
    <div className="px-4 md:px-6 lg:px-12 mt-10 max-w-[95%] mx-auto">
      {/* Heading */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-4 text-gray-900 dark:text-black tracking-tight leading-tight">
        ⚙️ Postback Generation
      </h1>
      <p className="text-center text-black dark:text-black mb-8 max-w-2xl mx-auto text-sm md:text-base">
        Manage and generate postbacks for your affiliate campaigns with
        precision.
      </p>

      {/* Component */}
      <AffiliateGeneral />
    </div>
  );
};

export default Settings;
