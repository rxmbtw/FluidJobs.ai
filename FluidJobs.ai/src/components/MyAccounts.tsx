import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const MyAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    const filtered = accounts.filter(account =>
      account.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAccounts(filtered);
    setCurrentPage(1);
  }, [searchQuery, accounts]);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/my-accounts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch accounts');
      
      const data = await response.json();
      const transformedAccounts = data.map((account: any) => ({
        name: account.account_name,
        locations: account.locations || 'N/A',
        openings: account.active_jobs || 0,
        completed: account.completed_jobs || 0,
        status: account.status || 'Active',
        users: account.assigned_users || 0
      }));
      
      setAccounts(transformedAccounts);
      setFilteredAccounts(transformedAccounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAccounts = filteredAccounts.slice(startIndex, endIndex);
  const showingStart = filteredAccounts.length > 0 ? startIndex + 1 : 0;
  const showingEnd = Math.min(endIndex, filteredAccounts.length);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="p-8" style={{ fontFamily: 'Poppins', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl p-8 mb-6 shadow-sm">
          <h1 className="text-3xl font-bold text-center mb-2">My Accounts</h1>
          <p className="text-center text-gray-600">Manage client accounts.</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search accounts by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ fontFamily: 'Poppins' }}
            />
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filteredAccounts.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              {searchQuery ? 'No accounts found matching your search.' : 'No accounts found. Create a job to see accounts here.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-6 font-semibold text-gray-900" style={{ fontFamily: 'Poppins' }}>Account Name</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900" style={{ fontFamily: 'Poppins' }}>Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900" style={{ fontFamily: 'Poppins' }}>Location</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900" style={{ fontFamily: 'Poppins' }}>No of Openings</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900" style={{ fontFamily: 'Poppins' }}>Complete Openings</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900" style={{ fontFamily: 'Poppins' }}>Users Assigned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentAccounts.map((account, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-4 px-6 text-gray-900" style={{ fontFamily: 'Poppins' }}>{account.name}</td>
                        <td className="py-4 px-6">
                          <span className="inline-block px-4 py-1 rounded-full text-sm font-medium" style={{
                            backgroundColor: account.status === 'Active' ? '#86efac' : '#fca5a5',
                            color: account.status === 'Active' ? '#166534' : '#991b1b',
                            fontFamily: 'Poppins'
                          }}>
                            {account.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-700" style={{ fontFamily: 'Poppins' }}>{account.locations}</td>
                        <td className="py-4 px-6 text-gray-700" style={{ fontFamily: 'Poppins' }}>{String(account.openings).padStart(2, '0')}</td>
                        <td className="py-4 px-6 text-gray-700" style={{ fontFamily: 'Poppins' }}>{String(account.completed).padStart(2, '0')}</td>
                        <td className="py-4 px-6 text-gray-700" style={{ fontFamily: 'Poppins' }}>{String(account.users).padStart(2, '0')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600" style={{ fontFamily: 'Poppins' }}>
                  Showing {showingStart} to {showingEnd} of {filteredAccounts.length} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAccounts;
