import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, saveUsers, uid } from '../lib/db';
import '../styles/DashboardPage.css';

const emptyForm = { id: null, fullname: '', username: '', password: '', role: 'receptionist' };

export default function AdminUsers() {
  const { user: session } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const editing = !!form.id;

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  function resetForm() {
    setForm(emptyForm);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.fullname.trim() || !form.username.trim()) {
      setError('Full name and username are required.');
      return;
    }
    if (!editing && !form.password) {
      setError('Password is required for new users.');
      return;
    }

    const current = getUsers();
    const usernameTaken = current.some(
      (u) => u.username.toLowerCase() === form.username.trim().toLowerCase() && u.id !== form.id
    );
    if (usernameTaken) {
      setError('Username has already been taken. Please choose a different one.');
      return;
    }

    let next;
    if (editing) {
      next = current.map((u) =>
        u.id === form.id
          ? {
              ...u,
              fullname: form.fullname.trim(),
              username: form.username.trim(),
              role: u.id === session.id ? u.role : form.role, // can't self-promote/demote here
              password: form.password ? form.password : u.password,
            }
          : u
      );
      setSuccess('User information updated successfully.');
    } else {
      next = [
        ...current,
        {
          id: uid('u'),
          fullname: form.fullname.trim(),
          username: form.username.trim(),
          password: form.password,
          role: form.role,
          created_at: new Date().toISOString(),
        },
      ];
      setSuccess('User added successfully.');
    }

    saveUsers(next);
    setUsers(next);
    resetForm();
  }

  function handleEdit(u) {
    setForm({ id: u.id, fullname: u.fullname, username: u.username, password: '', role: u.role });
    setError('');
    setSuccess('');
  }

  function handleRoleChange(target, newRole) {
    setError('');
    setSuccess('');

    if (target.id === session.id) {
      setError('Unable to change your own role.');
      return;
    }

    const admins = users.filter((x) => x.role === 'admin');
    if (target.role === 'admin' && newRole !== 'admin' && admins.length <= 1) {
      setError('Unable to delete the last admin.');
      return;
    }

    const next = users.map((x) => (x.id === target.id ? { ...x, role: newRole } : x));
    saveUsers(next);
    setUsers(next);
    setSuccess('Role updated successfully.');
  }

  function handleDelete(target) {
    setError('');
    setSuccess('');

    if (target.id === session.id) {
      setError('Unable to delete your own account.');
      return;
    }

    const admins = users.filter((x) => x.role === 'admin');
    if (target.role === 'admin' && admins.length <= 1) {
      setError('Unable to delete the last admin.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${target.fullname}?`)) return;

    const next = users.filter((x) => x.id !== target.id);
    saveUsers(next);
    setUsers(next);
    setSuccess('User deleted successfully.');
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="welcome-section">
          <h1> Manage Users</h1>
          <p>Add receptionists, promote admins, or remove accounts</p>
        </div>

        <div className="admin-section-panel">
          <div className="panel-header-row">
            <h2>{editing ? 'Edit User' : 'Add New User'}</h2>
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
                placeholder=" Enter full name of the user"
              />
            </div>
            <div className="form-group">
              <label>Username </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="Enter username for the user"
              />
            </div>
            <div className="form-group">
              <label>{editing ? 'New Password (leave blank to keep current)' : 'Password '}</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Enter password for the user"
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                disabled={editing && form.id === session.id}
              >
                <option value="receptionist">Receptionist</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="dashboard-actions">
              <button type="submit" className="action-btn primary">
                {editing ? ' Update User' : ' Add User'}
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
            <h2>All Users</h2>
            <span>{users.length} Total</span>
          </div>

          <div className="admin-section-table-wrap">
            <table className="admin-section-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const isSelf = u.id === session.id;
                  return (
                    <tr key={u.id}>
                      <td>{i + 1}</td>
                      <td>{u.fullname}</td>
                      <td>{u.username}</td>
                      <td>
                        <select
                          value={u.role}
                          disabled={isSelf}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                        >
                          <option value="receptionist">Receptionist</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="mini-action-button" onClick={() => handleEdit(u)}>
                             Edit
                          </button>
                          <button
                            className="mini-action-button danger"
                            disabled={isSelf}
                            onClick={() => handleDelete(u)}
                          >
                             Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
