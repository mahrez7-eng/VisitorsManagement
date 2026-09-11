import { useEffect, useState } from 'react';
import { getExperts, saveExperts, getVisitors, refreshExperts, uid } from '../lib/db';
import '../styles/DashboardPage.css';

const emptyForm = { id: null, fullname: '', department: '' };

export default function AdminExperts() {
  const [experts, setExperts] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const editing = !!form.id;

  useEffect(() => {
    Promise.all([refreshExperts(), Promise.resolve(getVisitors())]).then(([loadedExperts, loadedVisitors]) => {
      setExperts(loadedExperts);
      setVisitors(loadedVisitors);
    });
  }, []);

  function resetForm() {
    setForm(emptyForm);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.fullname.trim()) {
      setError('Full name is required.');
      return;
    }

    const current = getExperts();
    let next;

    if (editing) {
      next = current.map((x) =>
        x.id === form.id
          ? { ...x, fullname: form.fullname.trim(), department: form.department.trim() }
          : x
      );
      setSuccess('Expert updated successfully.');
    } else {
      next = [
        ...current,
        { id: uid('e'), fullname: form.fullname.trim(), department: form.department.trim() },
      ];
      setSuccess('Expert added successfully.');
    }

    saveExperts(next);
    setExperts(next);
    resetForm();
  }

  function handleEdit(exp) {
    setForm({ id: exp.id, fullname: exp.fullname, department: exp.department || '' });
    setError('');
    setSuccess('');
  }

  function handleDelete(exp) {
    setError('');
    setSuccess('');

    const hasVisitors = visitors.some((v) => v.expertId === exp.id);
    if (hasVisitors) {
      setError(`Unable to delete: ${exp.fullname} has visitor records in the system.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete ${exp.fullname}?`)) return;

    const next = getExperts().filter((x) => x.id !== exp.id);
    saveExperts(next);
    setExperts(next);
    setSuccess('Expert deleted successfully.');
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="welcome-section">
          <h1> Manage Experts</h1>
          <p>Add, edit, or remove the experts which visitors can meet</p>
        </div>

        <div className="admin-section-panel">
          <div className="panel-header-row">
            <h2>{editing ? 'Edit Expert' : 'Add New Expert'}</h2>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-banner">{success}</div>}

          <form onSubmit={handleSubmit} className="receptionist-form">
            <div className="form-group">
              <label>Full Name </label>
              <input
                type="text"
                value={form.fullname}
                onChange={(e) => setForm((f) => ({ ...f, fullname: e.target.value }))}
                placeholder=" Enter full name of the expert"
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                placeholder=" Enter department of the expert"
              />
            </div>
            <div className="dashboard-actions">
              <button type="submit" className="action-btn primary">
                {editing ? ' Update Expert' : ' Add Expert'}
              </button>
              {editing && (
                <button type="button" className="action-btn secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="admin-section-panel admin-inline-section">
          <div className="panel-header-row">
            <h2>All Experts</h2>
            <span>{experts.length} Total</span>
          </div>

          {experts.length === 0 ? (
            <div className="empty-state">No experts added yet.</div>
          ) : (
            <div className="admin-section-table-wrap">
              <table className="admin-section-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Department</th>
                    <th>Visitors Seen</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {experts.map((exp, i) => (
                    <tr key={exp.id}>
                      <td>{i + 1}</td>
                      <td>{exp.fullname}</td>
                      <td>{exp.department || '-'}</td>
                      <td>{visitors.filter((v) => v.expertId === exp.id).length}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="mini-action-button" onClick={() => handleEdit(exp)}>
                             Edit
                          </button>
                          <button className="mini-action-button danger" onClick={() => handleDelete(exp)}>
                             Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
