import React from 'react';

const MyAccounts: React.FC = () => {
  const accounts = [
    {
      name: 'BGIC - Bajaj General Insurance',
      created: 'October 2025',
      locations: 'Pune',
      openings: 5,
      completed: 2,
      status: 'Active',
      users: 3,
      lastActivity: '20/11/2025 : 01:45PM'
    },
    {
      name: 'BGIC - Bajaj General Insurance',
      created: 'October 2025',
      locations: 'Pune | Mumbai | Delhi',
      openings: 5,
      completed: 2,
      status: 'Inactive',
      users: 3,
      lastActivity: '20/11/2025 : 01:45PM'
    }
  ];

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
