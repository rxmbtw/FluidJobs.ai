const CandidateDashboard = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Candidate Dashboard</h1>
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white p-4 rounded shadow">My Applications: 5</div>
      <div className="bg-white p-4 rounded shadow">Jobs Available: 30</div>
      <div className="bg-white p-4 rounded shadow">Interviews: 2</div>
      <div className="bg-white p-4 rounded shadow">Offers: 1</div>
    </div>
    <div className="mb-6">
      <h2 className="font-semibold mb-2">Recent Activity</h2>
      <ul className="bg-white p-4 rounded shadow">
        <li>Interview scheduled for "Frontend Developer"</li>
        <li>Offer received from Company ABC</li>
        <li>Application submitted for "UI Designer"</li>
      </ul>
    </div>
    <div className="flex gap-4">
      <a href="/applications" className="bg-primary text-white px-4 py-2 rounded">My Applications</a>
      <a href="/jobs" className="bg-accent text-white px-4 py-2 rounded">Browse Jobs</a>
    </div>
  </div>
);
export default CandidateDashboard;
