const ClientDashboard = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Client Dashboard</h1>
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white p-4 rounded shadow">Jobs Posted: 8</div>
      <div className="bg-white p-4 rounded shadow">Companies: 2</div>
      <div className="bg-white p-4 rounded shadow">Applications: 40</div>
      <div className="bg-white p-4 rounded shadow">Interviews: 3</div>
    </div>
    <div className="mb-6">
      <h2 className="font-semibold mb-2">Recent Activity</h2>
      <ul className="bg-white p-4 rounded shadow">
        <li>Job "Backend Developer" posted</li>
        <li>Interview scheduled for "QA Analyst"</li>
        <li>Company DEF registered</li>
      </ul>
    </div>
    <div className="flex gap-4">
      <a href="/jobs" className="bg-primary text-white px-4 py-2 rounded">Manage Jobs</a>
      <a href="/companies" className="bg-accent text-white px-4 py-2 rounded">Manage Companies</a>
    </div>
  </div>
);
export default ClientDashboard;
