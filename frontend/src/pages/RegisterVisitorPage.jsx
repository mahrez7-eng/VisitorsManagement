import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getVisitors, refreshExperts, saveVisitors, uid } from '../lib/db';
import '../styles/RegisterVisitorPage.css';

export default function RegisterVisitorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [experts, setExperts] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    idType: 'NIDA',
    idNumber: '',
    expertId: '',
    purpose: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    refreshExperts().then(setExperts);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.phone || !formData.expertId || !formData.purpose) {
      setError('Please fill in all required fields');
      return;
    }

    const expert = experts.find((x) => x.id === formData.expertId);

    const visitors = getVisitors();
    const newVisitor = {
      id: uid('v'),
      ...formData,
      personToVisit: expert ? expert.fullname : '',
      recordedBy: user?.name || '',
      checkInDate: new Date().toISOString(),
      checkOutDate: null,
    };

    saveVisitors([...visitors, newVisitor]);

    setSubmitted(true);
    setTimeout(() => {
      navigate('/visitors');
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="register-container">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>Visitor Registered!</h2>
          <p>{formData.fullName} has been successfully registered</p>
          <p className="redirect-text">Redirecting to list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-form-wrapper">
        <div className="form-header">
          <h1> Register New Visitor</h1>
          <p>Please enter visitor details</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group full-width">
              <label>Full Name </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+255 000 000 000"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>ID Type</label>
              <select name="idType" value={formData.idType} onChange={handleChange}>
                <option value="NIDA">NIDA</option>
                <option value="Passport">Passport</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Driving License">Driving License</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>ID Number</label>
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder="ID/Passport Number"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Company/Organization</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Company name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Expert to Visit </label>
              <select name="expertId" value={formData.expertId} onChange={handleChange}>
                <option value="">-- Select an expert --</option>
                {experts.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.fullname} {exp.department ? `(${exp.department})` : ''}
                  </option>
                ))}
              </select>
              {experts.length === 0 && (
                <small style={{ color: '#c33' }}>
                  No experts available yet. Ask an admin to add one first.
                </small>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label>Purpose of Visit </label>
              <select name="purpose" value={formData.purpose} onChange={handleChange}>
                <option value="">-- Select purpose --</option>
                <option value="meeting">Business Meeting</option>
                <option value="delivery">Delivery</option>
                <option value="interview">Interview</option>
                <option value="service">Service</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn-submit">
               Register Visitor
            </button>
            <button type="button" className="btn-cancel" onClick={() => navigate('/visitors')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
