import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import { Copy, Trash2, BarChart3, ExternalLink, Edit3, Check, X } from 'lucide-react';

export default function LinksPage() {
  const { authFetch } = useAuth();
  const [links, setLinks] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async (page = 1) => {
    setLoading(true);
    try {
      const res = await authFetch(`/links?page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard!', 'success');
  };

  const deleteLink = async (id) => {
    if (!confirm('Delete this link? This cannot be undone.')) return;
    try {
      const res = await authFetch(`/links/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLinks(links.filter(l => l._id !== id));
        showToast('Link deleted', 'success');
      }
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const toggleActive = async (link) => {
    try {
      const res = await authFetch(`/links/${link._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !link.isActive })
      });
      if (res.ok) {
        setLinks(links.map(l => l._id === link._id ? { ...l, isActive: !l.isActive } : l));
        showToast(link.isActive ? 'Link disabled' : 'Link enabled', 'success');
      }
    } catch (err) {
      showToast('Failed to update', 'error');
    }
  };

  const startEdit = (link) => {
    setEditingId(link._id);
    setEditForm({
      title: link.title || '',
      description: link.description || '',
      originalUrl: link.originalUrl,
      redirectDelay: link.redirectDelay
    });
  };

  const saveEdit = async () => {
    try {
      const res = await authFetch(`/links/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        const updated = await res.json();
        setLinks(links.map(l => l._id === editingId ? { ...l, ...updated } : l));
        setEditingId(null);
        showToast('Link updated', 'success');
      }
    } catch (err) {
      showToast('Failed to update', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <div className="loading-page">Loading links...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>My Links</h1>
        <p>{pagination.total || 0} total links</p>
      </div>

      <div className="card">
        {links.length > 0 ? (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Short Code</th>
                    <th>Destination</th>
                    <th>Clicks</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map(link => (
                    <tr key={link._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ color: '#667eea' }}>{link.shortCode}</strong>
                          <button className="copy-btn" onClick={() => copyUrl(link.shortUrl)} title="Copy short URL">
                            <Copy size={14} />
                          </button>
                        </div>
                      </td>
                      <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {link.originalUrl}
                          <ExternalLink size={12} />
                        </a>
                      </td>
                      <td><strong>{link.clicks}</strong></td>
                      <td>
                        <button
                          className={`badge ${link.isActive ? 'badge-green' : 'badge-red'}`}
                          onClick={() => toggleActive(link)}
                          style={{ cursor: 'pointer', border: 'none' }}
                          title="Click to toggle"
                        >
                          {link.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td style={{ fontSize: '13px', color: '#888' }}>
                        {new Date(link.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => startEdit(link)} title="Edit">
                            <Edit3 size={14} />
                          </button>
                          <RouterLink to={`/analytics/${link._id}`} className="btn btn-secondary btn-sm" title="Analytics">
                            <BarChart3 size={14} />
                          </RouterLink>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteLink(link._id)} title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm ${pagination.page === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => loadLinks(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
            No links yet. <RouterLink to="/create" style={{ color: '#667eea', fontWeight: 600 }}>Create your first link</RouterLink>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="modal-overlay" onClick={() => setEditingId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Edit Link</h2>
              <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div className="form-group">
              <label>Destination URL</label>
              <input
                value={editForm.originalUrl}
                onChange={e => setEditForm({ ...editForm, originalUrl: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Landing Page Title</label>
              <input
                value={editForm.title}
                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                value={editForm.description}
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Redirect Delay (seconds)</label>
              <input
                type="number"
                min="0"
                max="10"
                value={editForm.redirectDelay}
                onChange={e => setEditForm({ ...editForm, redirectDelay: parseInt(e.target.value) })}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" onClick={saveEdit}>
                <Check size={16} /> Save Changes
              </button>
              <button className="btn btn-secondary" onClick={() => setEditingId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
