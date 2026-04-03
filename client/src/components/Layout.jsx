import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, Link2, LogOut, Menu, X } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <button className="mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Link2 size={24} />
          LinkFunnel
        </div>
        <nav>
          <ul className="sidebar-nav">
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
                <LayoutDashboard size={18} />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/create" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
                <PlusCircle size={18} />
                Create Link
              </NavLink>
            </li>
            <li>
              <NavLink to="/links" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
                <Link2 size={18} />
                My Links
              </NavLink>
            </li>
          </ul>
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ padding: '8px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '10px', width: '100%',
              background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)',
              border: 'none', fontSize: '14px', cursor: 'pointer'
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
