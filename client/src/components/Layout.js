import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', label: 'Tổng quan' },
    { path: '/projects', label: 'Công trình' },
    { path: '/materials', label: 'Hạng mục & vật tư' },
    { path: '/inventory', label: 'Kho công trình' },
    { path: '/receipts', label: 'Phiếu nhập' },
    { path: '/issues', label: 'Phiếu xuất' },
    { path: '/suppliers', label: 'Nhà thầu' },
  ];

  return (
    <div className="layout">
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <h2>Quản Lý Công Trình</h2>
            <p>Kiểm soát tiến độ & vật tư</p>
          </div>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? 'Thu gọn' : 'Mở'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-bullet" />
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            {sidebarOpen ? 'Đăng xuất' : 'Thoát'}
          </button>
        </div>
      </div>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;

