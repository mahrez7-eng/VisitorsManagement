import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshVisitors, saveVisitors } from '../lib/db';
import '../styles/VisitorsPage.css';

export default function VisitorsPage() {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const parseDateTime = (value) => {
    const text = String(value || '');
    return new Date(/(?:Z|[+-]\d{2}:?\d{2})$/.test(text) ? text : `${text.replace(' ', 'T')}+03:00`);
  };

  // Helper function to format date with time
  const formatDateTime = (dateString) => {
    const date = parseDateTime(dateString);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    return date.toLocaleString('en-US', { ...options, timeZone: 'Africa/Dar_es_Salaam' });
  };

  const filteredVisitors = (() => {
    let result = visitors;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(v =>
        v.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.phone.includes(searchTerm) ||
        (v.personToVisit || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus === 'active') {
      result = result.filter(v => !v.checkOutDate);
    } else if (filterStatus === 'checked-out') {
      result = result.filter(v => v.checkOutDate);
    }

    return [...result].reverse();
  })();

  useEffect(() => {
    refreshVisitors().then(setVisitors);
  }, []);

  const handleCheckOut = (id) => {
    const updated = visitors.map(v => {
      if (v.id === id) {
        return { ...v, checkOutDate: new Date().toISOString() };
      }
      return v;
    });
    setVisitors(updated);
    saveVisitors(updated);
    setSelectedVisitor(null);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this visitor?')) {
      const updated = visitors.filter(v => v.id !== id);
      setVisitors(updated);
      saveVisitors(updated);
      setSelectedVisitor(null);
    }
  };

  return (
    <div className="visitors-container">
      <div className="visitors-header">
        <h1> Visitors List</h1>
        <button
          className="btn-new"
          onClick={() => navigate('/register')}
        >
           New Visitor
        </button>
      </div>

      <div className="visitors-controls">
        <input
          type="text"
          className="search-box"
          placeholder="Search by name, phone, or expert..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({visitors.length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            Active ({visitors.filter(v => !v.checkOutDate).length})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'checked-out' ? 'active' : ''}`}
            onClick={() => setFilterStatus('checked-out')}
          >
            Checked Out ({visitors.filter(v => v.checkOutDate).length})
          </button>
        </div>
      </div>

      {filteredVisitors.length === 0 ? (
        <div className="no-data-message">
          <p> No visitors found</p>
        </div>
      ) : (
        <div className="visitors-list">
          {filteredVisitors.map(visitor => (
            <div key={visitor.id} className={`visitor-card ${!visitor.checkOutDate ? 'active' : 'checked-out'}`}>
              <div className="visitor-card-header">
                <div className="visitor-name-section">
                  <h3>{visitor.fullName}</h3>
                  <span className={`status-badge ${!visitor.checkOutDate ? 'in' : 'out'}`}>
                    {!visitor.checkOutDate ? '✅ Active' : '⏸️ Checked Out'}
                  </span>
                </div>
                <button
                  className="details-btn"
                  onClick={() => setSelectedVisitor(selectedVisitor?.id === visitor.id ? null : visitor)}
                >
                  {selectedVisitor?.id === visitor.id ? '▼' : '▶'}
                </button>
              </div>

              <div className="visitor-info-brief">
                <span>📞 {visitor.phone}</span>
                <span> {visitor.personToVisit || 'N/A'}</span>
              </div>

              {selectedVisitor?.id === visitor.id && (
                <div className="visitor-details">
                  <div className="detail-row">
                    <span className="label">Phone:</span>
                    <span className="value">{visitor.phone}</span>
                  </div>
                  {visitor.email && (
                    <div className="detail-row">
                      <span className="label">Email:</span>
                      <span className="value">{visitor.email}</span>
                    </div>
                  )}
                  {visitor.company && (
                    <div className="detail-row">
                      <span className="label">Company:</span>
                      <span className="value">{visitor.company}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="label">Visiting (Expert):</span>
                    <span className="value">{visitor.personToVisit || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Purpose:</span>
                    <span className="value">{visitor.purpose}</span>
                  </div>
                  {visitor.idNumber && (
                    <div className="detail-row">
                      <span className="label">ID:</span>
                      <span className="value">{visitor.idType ? `${visitor.idType} - ` : ''}{visitor.idNumber}</span>
                    </div>
                  )}
                  {visitor.recordedBy && (
                    <div className="detail-row">
                      <span className="label">Recorded by:</span>
                      <span className="value">{visitor.recordedBy}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="label">Check-in:</span>
                    <span className="value">{formatDateTime(visitor.checkInDate)}</span>
                  </div>
                  {visitor.checkOutDate && (
                    <div className="detail-row">
                      <span className="label">Check-out:</span>
                      <span className="value">{formatDateTime(visitor.checkOutDate)}</span>
                    </div>
                  )}

                  <div className="visitor-actions">
                    {!visitor.checkOutDate && (
                      <button
                        className="btn-checkout"
                        onClick={() => handleCheckOut(visitor.id)}
                      >
                        ✔️ Mark as Checked Out
                      </button>
                    )}
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(visitor.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
