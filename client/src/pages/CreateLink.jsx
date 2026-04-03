import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Copy, Check, Link2, PlusCircle } from 'lucide-react';

export default function CreateLink() {
  const { authFetch } = useAuth();
  const [form, setForm] = useState({
    url: '',
    customAlias: '',
    title: '',
    description: '',
    funnelContent: '',
    redirectDelay: 3,
    expiresAt: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Bulk mode
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkUrls, setBulkUrls] = useState('');
  const [bulkResults, setBulkResults] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await authFetch('/links', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setForm({ url: '', customAlias: '', title: '', description: '', funnelContent: '', redirectDelay: 3, expiresAt: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBulkResults(null);
    setLoading(true);

    try {
      const urls = bulkUrls.split('\n').map(u => u.trim()).filter(Boolean);
      if (urls.length === 0) throw new Error('Enter at least one URL');

      const res = await authFetch('/links/bulk', {
        method: 'POST',
        body: JSON.stringify({ urls })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBulkResults(data.results);
      setBulkUrls('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Create Short Link</h1>
        <p>Shorten a URL and customize the funnel landing page</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          className={`btn ${!bulkMode ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setBulkMode(false)}
        >
          <Link2 size={16} /> Single Link
        </button>
        <button
          className={`btn ${bulkMode ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setBulkMode(true)}
        >
          <PlusCircle size={16} /> Bulk Create
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', background: '#fee', color: '#e74c3c',
          borderRadius: '10px', marginBottom: '20px', fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {!bulkMode ? (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Destination URL *</label>
              <input
                name="url"
                type="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://example.com/your-long-url"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Custom Alias (optional)</label>
                <input
                  name="customAlias"
                  value={form.customAlias}
                  onChange={handleChange}
                  placeholder="my-custom-link"
                />
              </div>
              <div className="form-group">
                <label>Redirect Delay (seconds)</label>
                <input
                  name="redirectDelay"
                  type="number"
                  min="0"
                  max="10"
                  value={form.redirectDelay}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Landing Page Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Continue to your destination"
                />
              </div>
              <div className="form-group">
                <label>Expiration Date (optional)</label>
                <input
                  name="expiresAt"
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Landing Page Description</label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Click the button below to proceed"
              />
            </div>

            <div className="form-group">
              <label>Funnel Content (optional blog-style text)</label>
              <textarea
                name="funnelContent"
                value={form.funnelContent}
                onChange={handleChange}
                placeholder="Add engaging content that visitors will see before redirecting..."
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <><PlusCircle size={16} /> Create Short Link</>}
            </button>
          </form>

          {result && (
            <div className="result-box">
              <div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Your short link:</div>
                <div className="url">{result.shortUrl}</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => copyUrl(result.shortUrl)}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <form onSubmit={handleBulkSubmit}>
            <div className="form-group">
              <label>URLs (one per line, max 50)</label>
              <textarea
                value={bulkUrls}
                onChange={e => setBulkUrls(e.target.value)}
                placeholder={"https://example.com/page-1\nhttps://example.com/page-2\nhttps://example.com/page-3"}
                style={{ minHeight: '200px' }}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <><PlusCircle size={16} /> Create All Links</>}
            </button>
          </form>

          {bulkResults && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ marginBottom: '12px' }}>Created {bulkResults.filter(r => r.shortUrl).length} links:</h3>
              {bulkResults.map((r, i) => (
                <div key={i} style={{
                  padding: '12px', background: r.error ? '#fee' : '#f0f4ff',
                  borderRadius: '8px', marginBottom: '8px', fontSize: '14px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  {r.error ? (
                    <span style={{ color: '#e74c3c' }}>{r.url} — {r.error}</span>
                  ) : (
                    <>
                      <span style={{ color: '#667eea', fontWeight: 600 }}>{r.shortUrl}</span>
                      <button className="copy-btn" onClick={() => copyUrl(r.shortUrl)}>
                        <Copy size={14} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
