import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MousePointerClick, Monitor, Smartphone, Tablet } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#667eea', '#764ba2', '#f59e0b', '#27ae60', '#e74c3c', '#3b82f6', '#8b5cf6'];

export default function AnalyticsPage() {
  const { linkId } = useParams();
  const { authFetch } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [linkId]);

  const loadAnalytics = async () => {
    try {
      const res = await authFetch(`/admin/analytics/${linkId}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-page">Loading analytics...</div>;
  if (!data) return <div className="loading-page">Link not found</div>;

  const { link, totalClicks, deviceStats, browserStats, osStats, clicksOverTime, recentClicks } = data;

  const chartData = clicksOverTime.map(d => ({
    date: d._id.slice(5),
    clicks: d.count
  }));

  const deviceData = deviceStats.map(d => ({ name: d._id, value: d.count }));
  const browserData = browserStats.map(d => ({ name: d._id, value: d.count }));

  const deviceIcon = (type) => {
    switch (type) {
      case 'mobile': return <Smartphone size={16} />;
      case 'tablet': return <Tablet size={16} />;
      default: return <Monitor size={16} />;
    }
  };

  return (
    <div>
      <div className="page-header">
        <RouterLink to="/links" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#667eea', fontSize: '14px', marginBottom: '12px' }}>
          <ArrowLeft size={16} /> Back to Links
        </RouterLink>
        <h1>Analytics: {link.shortCode}</h1>
        <p style={{ wordBreak: 'break-all' }}>{link.originalUrl}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f0fe' }}>
            <MousePointerClick size={24} color="#3b82f6" />
          </div>
          <div className="stat-value">{totalClicks}</div>
          <div className="stat-label">Total Clicks</div>
        </div>
        {deviceStats.map(d => (
          <div className="stat-card" key={d._id}>
            <div className="stat-icon" style={{ background: '#f3e8ff' }}>
              {deviceIcon(d._id)}
            </div>
            <div className="stat-value">{d.count}</div>
            <div className="stat-label">{d._id} clicks</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '20px' }}>Clicks Over Time</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="clicks" fill="#667eea" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No data yet</div>
          )}
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '20px' }}>Device Breakdown</h3>
          {deviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No data yet</div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '20px' }}>Browser Breakdown</h3>
        {browserData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={browserData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {browserData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No data yet</div>
        )}
      </div>

      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '20px' }}>Recent Clicks</h3>
        {recentClicks.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Device</th>
                  <th>Browser</th>
                  <th>OS</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {recentClicks.map(click => (
                  <tr key={click._id}>
                    <td style={{ fontSize: '13px' }}>{new Date(click.createdAt).toLocaleString()}</td>
                    <td>
                      <span className="badge badge-blue">{click.device}</span>
                    </td>
                    <td>{click.browser}</td>
                    <td>{click.os}</td>
                    <td style={{ fontSize: '13px', color: '#888' }}>{click.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No clicks recorded yet</div>
        )}
      </div>
    </div>
  );
}
