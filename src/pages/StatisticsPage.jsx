import CampaignReport from "../components/campaignsreport/campaignsreport.jsx";
import StatisticsDashboard from "../components/Staticstics/StatisticsDashboard.jsx";

const StatisticsPage = () => {
  return (
    <div className="px-4 md:px-6 lg:px-12 mt-8 md:ml-60 max-w-[95%]">
      <h1
        className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-4
        text-gray-900 dark:text-gray-100 tracking-tight leading-tight"
      >
        Statistics Dashboard
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-sm md:text-base">
        Analyze your campaign performance, revenue, and key metrics with
        clarity.
      </p>
      <CampaignReport />

      <StatisticsDashboard />
    </div>
  );
};

export default StatisticsPage;
