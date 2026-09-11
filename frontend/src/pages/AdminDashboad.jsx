import { useEffect, useState } from 'react';
import { getVisitors, getUsers, getExperts } from '../lib/db';
import '../styles/DashboardPage.css';

function parseDateTime(value) {
  const text = String(value || '');
  return new Date(/(?:Z|[+-]\d{2}:?\d{2})$/.test(text) ? text : `${text.replace(' ', 'T')}+03:00`);
}

function formatTime(iso) {
  if (!iso) return '-';
  const date = parseDateTime(iso);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Dar_es_Salaam',
  });
}

export default function AdminDashboad() {
  const [visitors, setVisitors] = useState([]);
  const [users, setUsers] = useState([]);
  const [experts, setExperts] = useState([]);

  useEffect(() => {
    setVisitors(getVisitors());
    setUsers(getUsers());
    setExperts(getExperts());
  }, []);

  const receptionistCount = users.filter((u) => u.role === 'receptionist').length;
  const activeNow = visitors.filter((v) => !v.checkOutDate).length;

  const cards = [
    {title: 'Visitors', value: String(visitors.length), description: 'Total Visitors' },
    {title: 'Receptionist', value: String(receptionistCount), description: 'Active Staff' },
    {title: 'Experts', value: String(experts.length), description: 'Available Experts' },
    {title: 'Inside', value: String(activeNow), description: 'Currently Checked In' },
  ];

  const recent = [...visitors]
    .sort((a, b) => parseDateTime(b.checkInDate) - parseDateTime(a.checkInDate))
    .slice(0, 3);

  return (
    <div className="admin-dashboard-shell">
      <main className="admin-main-panel">
        <div className="dashboard-container admin-dashboard-container">
          <div className="dashboard-content">
            <div className="welcome-section">
              <h1>Welcome, Admin! </h1>
              <p>Admin Dashboard</p>
            </div>

            <div className="stats-grid">
              {cards.map((card) => (
                <div className="stat-card" key={card.title}>
                  <div className="stat-icon">{card.icon}</div>
                  <div className="stat-info">
                    <h3>{card.value}</h3>
                    <p>{card.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="recent-section">
              <h2>Recent Activity</h2>
              {recent.length === 0 ? (
                <p className="no-data">No visitors registered yet</p>
              ) : (
                <div className="recent-list">
                  {recent.map((v) => (
                    <div className="recent-item" key={v.id}>
                      <div className="visitor-info">
                        <strong>{v.fullName}</strong>
                        <span className="phone">{v.phone}</span>
                      </div>
                      <div className="visitor-date">{formatTime(v.checkInDate)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
