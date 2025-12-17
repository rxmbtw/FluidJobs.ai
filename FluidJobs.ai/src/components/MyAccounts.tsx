import React, { useState, useEffect } from 'react';

const MyAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token from localStorage:', token ? 'Present' : 'Missing');
      
      if (!token) {
        console.error('❌ No token found in localStorage');
        return;
      }
      
      const url = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}/api/auth/my-accounts`;
      console.log('📡 Fetching accounts from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response not OK:', response.status, errorText);
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Received data:', data);
      
      // Transform data to match component format
      const transformedAccounts = data.map((account: any) => ({
        name: account.account_name,
        created: new Date(account.created_at).toLocaleDateString(),
        locations: account.locations || 'N/A',
        openings: account.active_jobs || 0,
        completed: account.completed_jobs || 0,
        status: account.status || 'Active',
        users: account.assigned_users || 0,
        lastActivity: account.last_activity_at ? new Date(account.last_activity_at).toLocaleDateString() : 'N/A'
      }));
      
      console.log('✅ Transformed accounts:', transformedAccounts);
      setAccounts(transformedAccounts);
    } catch (error) {
      console.error('❌ Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading accounts...</div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>No accounts found. Create a job to see accounts here.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'Poppins', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {accounts.map((account, index) => (
          <div key={index} style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: '10px',
            padding: '30px 34px',
            position: 'relative'
          }}>
            <h2 style={{
              fontFamily: 'Poppins',
              fontWeight: 600,
              fontSize: '23px',
              lineHeight: '34px',
              color: '#000000',
              margin: '0 0 10px 0'
            }}>
              {account.name}
            </h2>

            <p style={{
              fontFamily: 'Poppins',
              fontWeight: 500,
              fontSize: '13px',
              lineHeight: '20px',
              color: '#363636',
              margin: '0 0 30px 0'
            }}>
              Account Created: {account.created}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '18px',
                    lineHeight: '27px',
                    color: '#363636',
                    marginRight: '10px'
                  }}>
                    Locations:
                  </span>
                  <span style={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: '18px',
                    lineHeight: '27px',
                    color: '#363636'
                  }}>
                    {account.locations}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '18px',
                    lineHeight: '27px',
                    color: '#363636',
                    marginRight: '10px'
                  }}>
                    No. of Openings:
                  </span>
                  <span style={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: '18px',
                    lineHeight: '27px',
                    color: '#363636'
                  }}>
                    {account.openings}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '18px',
                    lineHeight: '27px',
                    color: '#363636',
                    marginRight: '10px'
                  }}>
                    No. of Completed Openings:
                  </span>
                  <span style={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: '18px',
                    lineHeight: '27px',
                    color: '#363636'
                  }}>
                    {account.completed}
                  </span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '18px',
                    lineHeight: '27px',
                    color: '#363636',
                    marginRight: '10px'
                  }}>
                    Account Status:
                  </span>
                  <span style={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: '18px',
                    lineHeight: '27px',
                    color: account.status === 'Active' ? '#28860B' : '#FF0000',
                    background: account.status === 'Active' ? 'rgba(59, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.1)',
                    borderRadius: '20px',
                    padding: '6px 23px'
                  }}>
                    {account.status}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <span style={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '18px',
                    lineHeight: '27px',
                    color: '#363636',
                    marginRight: '10px'
                  }}>
                    User Assigned:
                  </span>
                  <span style={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: '18px',
                    lineHeight: '27px',
                    color: '#363636'
                  }}>
                    {account.users}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'Poppins',
                    fontWeight: 600,
                    fontSize: '18px',
                    lineHeight: '27px',
                    color: '#363636',
                    marginRight: '10px'
                  }}>
                    Last Activity:
                  </span>
                  <span style={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: '18px',
                    lineHeight: '27px',
                    color: '#363636'
                  }}>
                    {account.lastActivity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAccounts;
