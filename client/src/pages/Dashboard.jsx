import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import { BarChart3, Link2, MousePointerClick, TrendingUp, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topLinks, setTopLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, chartRes, topRes] = await Promise.all([
        authFetch('/admin/stats'),
        authFetch('/admin/clicks-chart?days=7'),
        authFetch('/admin/top-links?limit=5')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (chartRes.ok) {
        const data = await chartRes.json();
        setChartData(data.map(d => ({
          date: d._id.slice(5),
          clicks: d.count
        })));
      }
      if (topRes.ok) setTopLinks(await topRes.json());
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-page">Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your link performance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f0fe' }}>
            <Link2 size={24} color="#3b82f6" />
          </div>
          <div className="stat-value">{stats?.totalLinks || 0}</div>
          <div className="stat-label">Total Links</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e6f9f0' }}>
            <TrendingUp size={24} color="#27ae60" />
          </div>
          <div className="stat-value">{stats?.activeLinks || 0}</div>
          <div className="stat-label">Active Links</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3e2' }}>
            <MousePointerClick size={24} color="#f59e0b" />
          </div>
          <div className="stat-value">{stats?.totalClicks || 0}</div>
          <div className="stat-label">Total Clicks</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e8ff' }}>
            <BarChart3 size={24} color="#8b5cf6" />
          </div>
          <div className="stat-value">{stats?.recentClicks || 0}</div>
          <div className="stat-label">Clicks (24h)</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Clicks (Last 7 Days)</h3>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="clicks" fill="#667eea" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
            No click data yet. Create your first link to get started!
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Top Performing Links</h3>
          <RouterLink to="/links" className="btn btn-secondary btn-sm">View All</RouterLink>
        </div>
        {topLinks.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Short Code</th>
                  <th>Original URL</th>
                  <th>Clicks</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {topLinks.map(link => (
                  <tr key={link._id}>
                    <td style={{ fontWeight: 600 }}>{link.shortCode}</td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {link.originalUrl}
                    </td>
                    <td><strong>{link.clicks}</strong></td>
                    <td>
                      <span className={`badge ${link.isActive ? 'badge-green' : 'badge-red'}`}>
                        {link.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <RouterLink to={`/analytics/${link._id}`} className="btn btn-secondary btn-sm">
                        <BarChart3 size={14} /> Stats
                      </RouterLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
            No links yet. <RouterLink to="/create" style={{ color: '#667eea', fontWeight: 600 }}>Create your first link</RouterLink>
          </div>
        )}
      </div>
    </div>
  );
}
