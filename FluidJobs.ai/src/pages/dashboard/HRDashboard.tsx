const HRDashboard = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">HR Dashboard</h1>
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white p-4 rounded shadow">Candidates: 80</div>
      <div className="bg-white p-4 rounded shadow">Jobs: 20</div>
      <div className="bg-white p-4 rounded shadow">Applications: 150</div>
      <div className="bg-white p-4 rounded shadow">Interviews: 10</div>
    </div>
    <div className="mb-6">
      <h2 className="font-semibold mb-2">Recent Activity</h2>
      <ul className="bg-white p-4 rounded shadow">
        <li>Candidate Alice applied for Developer</li>
        <li>Interview scheduled for Bob</li>
        <li>Job "Designer" posted</li>
      </ul>
    </div>
    <div className="flex gap-4">
      <a href="/candidates" className="bg-primary text-white px-4 py-2 rounded">View Candidates</a>
      <a href="/jobs" className="bg-accent text-white px-4 py-2 rounded">View Jobs</a>
    </div>
  </div>
);
export default HRDashboard;
