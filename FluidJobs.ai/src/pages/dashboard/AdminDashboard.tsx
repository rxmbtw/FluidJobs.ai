const AdminDashboard = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
    {/* Stat Cards */}
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white p-4 rounded shadow">Users: 120</div>
      <div className="bg-white p-4 rounded shadow">Jobs: 45</div>
      <div className="bg-white p-4 rounded shadow">Companies: 12</div>
      <div className="bg-white p-4 rounded shadow">Applications: 300</div>
    </div>
    {/* Activity Feed */}
    <div className="mb-6">
      <h2 className="font-semibold mb-2">Recent Activity</h2>
      <ul className="bg-white p-4 rounded shadow">
        <li>User John added a new job</li>
        <li>Company XYZ registered</li>
        <li>HR Anna reviewed 5 applications</li>
      </ul>
    </div>
    {/* Shortcut Links */}
    <div className="flex gap-4">
      <a href="/jobs" className="bg-primary text-white px-4 py-2 rounded">Go to Jobs</a>
      <a href="/companies" className="bg-accent text-white px-4 py-2 rounded">Go to Companies</a>
    </div>
  </div>
);
export default AdminDashboard;
