import DashboardCards from "../components/Dashboard/dashboard.jsx";

const Dashboard = () => {
  return (
    <div className="p-6 md:ml-72">
      <h1 className="text-5xl md:text-6xl font-serif font-extrabold text-center mb-10 mt-10 text-gray-900 drop-shadow-md tracking-tight">
        📊 Dashboard
      </h1>
      <DashboardCards />
    </div>
  );
};

export default Dashboard;
