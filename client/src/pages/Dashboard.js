import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    materials: 0,
    suppliers: 0,
    lowStock: 0,
    receipts: 0,
    issues: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [receiptsByMonth, setReceiptsByMonth] = useState([]);
  const [issuesByMonth, setIssuesByMonth] = useState([]);
  const [materialsByCategory, setMaterialsByCategory] = useState([]);
  const [inventoryByProject, setInventoryByProject] = useState([]);
  const [projectsByStatus, setProjectsByStatus] = useState([]);
  const [topMaterials, setTopMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#c2410c', '#9a3412', '#7c2d12', '#dc2626', '#ef4444'];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('Fetching stats from:', api.defaults.baseURL);
      
      const [
        projectsRes,
        materialsRes,
        suppliersRes,
        lowStockRes,
        receiptsRes,
        issuesRes,
        receiptsByMonthRes,
        issuesByMonthRes,
        materialsByCategoryRes,
        inventoryByProjectRes,
        projectsByStatusRes,
        topMaterialsRes
      ] = await Promise.all([
        api.get('/projects'),
        api.get('/materials'),
        api.get('/suppliers'),
        api.get('/inventory/low-stock'),
        api.get('/receipts'),
        api.get('/issues'),
        api.get('/stats/receipts-by-month'),
        api.get('/stats/issues-by-month'),
        api.get('/stats/materials-by-category'),
        api.get('/stats/inventory-by-project'),
        api.get('/stats/projects-by-status'),
        api.get('/stats/top-materials'),
      ]);

      console.log('Data received:', {
        projects: projectsRes.data.length,
        materials: materialsRes.data.length,
        suppliers: suppliersRes.data.length,
        receipts: receiptsRes.data.length,
        issues: issuesRes.data.length,
      });

      setStats({
        projects: projectsRes.data.length,
        materials: materialsRes.data.length,
        suppliers: suppliersRes.data.length,
        lowStock: lowStockRes.data.length,
        receipts: receiptsRes.data.length,
        issues: issuesRes.data.length,
      });
      setLowStockItems(lowStockRes.data.slice(0, 10));
      
      // Convert và format data cho charts
      setReceiptsByMonth((receiptsByMonthRes.data || []).map(item => ({
        month: item.month,
        count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0),
        total_amount: typeof item.total_amount === 'string' ? parseFloat(item.total_amount) : (item.total_amount || 0)
      })));
      
      setIssuesByMonth((issuesByMonthRes.data || []).map(item => ({
        month: item.month,
        count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0)
      })));
      
      setMaterialsByCategory((materialsByCategoryRes.data || []).map(item => ({
        category: item.category,
        count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0),
        name: item.category
      })));
      
      setInventoryByProject((inventoryByProjectRes.data || []).map(item => ({
        ...item,
        material_count: typeof item.material_count === 'string' ? parseInt(item.material_count) : (item.material_count || 0),
        total_quantity: typeof item.total_quantity === 'string' ? parseInt(item.total_quantity) : (item.total_quantity || 0)
      })));
      
      setProjectsByStatus((projectsByStatusRes.data || []).map(item => ({
        status: item.status,
        count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0)
      })));
      
      setTopMaterials((topMaterialsRes.data || []).map(item => ({
        ...item,
        total_issued: typeof item.total_issued === 'string' ? parseInt(item.total_issued) : (item.total_issued || 0),
        name: item.name || item.code
      })));
      
      console.log('Chart data loaded:', {
        receiptsByMonth: receiptsByMonthRes.data?.length || 0,
        issuesByMonth: issuesByMonthRes.data?.length || 0,
        materialsByCategory: materialsByCategoryRes.data?.length || 0,
        projectsByStatus: projectsByStatusRes.data?.length || 0,
        inventoryByProject: inventoryByProjectRes.data?.length || 0,
        topMaterials: topMaterialsRes.data?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      // Set empty arrays để tránh crash
      setReceiptsByMonth([]);
      setIssuesByMonth([]);
      setMaterialsByCategory([]);
      setInventoryByProject([]);
      setProjectsByStatus([]);
      setTopMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  // Format số tiền
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value || 0);
  };

  // Format tháng
  const formatMonth = (month) => {
    if (!month) return '';
    const [year, mon] = month.split('-');
    return `${mon}/${year}`;
  };

  if (loading) {
    return <div className="dashboard-loading">Đang tải...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Điều hành công trình</h1>
        <p>Tổng quan tiến độ, vật tư và luồng nhập xuất</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.projects}</h3>
            <p>Công Trình</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.materials}</h3>
            <p>Hạng Mục & Vật Tư</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.suppliers}</h3>
            <p>Nhà Thầu/Cung Ứng</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-info">
            <h3>{stats.lowStock}</h3>
            <p>Cảnh Báo Tồn Kho</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.receipts}</h3>
            <p>Phiếu Nhập Kho</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.issues}</h3>
            <p>Phiếu Xuất Kho</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Chart 1: Phiếu nhập/xuất theo tháng - Area Chart */}
        <div className="chart-card">
          <h3>Luồng nhập/xuất vật tư theo tháng</h3>
          {receiptsByMonth.length > 0 || issuesByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={(() => {
                // Merge receipts và issues by month
                const allMonths = new Set([
                  ...receiptsByMonth.map(r => r.month),
                  ...issuesByMonth.map(i => i.month)
                ]);
                const monthMap = new Map();
                
                receiptsByMonth.forEach(r => {
                  monthMap.set(r.month, { month: r.month, receipts: r.count, issues: 0 });
                });
                
                issuesByMonth.forEach(i => {
                  if (monthMap.has(i.month)) {
                    monthMap.get(i.month).issues = i.count;
                  } else {
                    monthMap.set(i.month, { month: i.month, receipts: 0, issues: i.count });
                  }
                });
                
                return Array.from(monthMap.values())
                  .sort((a, b) => a.month.localeCompare(b.month))
                  .map(item => ({
                    month: formatMonth(item.month),
                    'Phiếu Nhập': item.receipts,
                    'Phiếu Xuất': item.issues,
                  }));
              })()}>
                <defs>
                  <linearGradient id="colorReceipts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ea580c',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="Phiếu Nhập" stroke="#ea580c" fillOpacity={1} fill="url(#colorReceipts)" strokeWidth={2} />
                <Area type="monotone" dataKey="Phiếu Xuất" stroke="#f97316" fillOpacity={1} fill="url(#colorIssues)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 2: Giá trị phiếu nhập theo tháng - Column Chart với gradient */}
        <div className="chart-card">
          <h3>Giá trị nhập kho theo tháng</h3>
          {receiptsByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={receiptsByMonth.map(item => ({
                month: formatMonth(item.month),
                'Giá trị (triệu VNĐ)': item.total_amount / 1000000 || 0,
              }))}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#c2410c" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  formatter={(value) => `${formatCurrency(value * 1000000)} đ`}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ea580c',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="Giá trị (triệu VNĐ)" fill="url(#colorValue)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 3: Vật tư theo loại - Donut Chart */}
        <div className="chart-card">
          <h3>Phân bố vật tư theo danh mục</h3>
          {materialsByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={materialsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={90}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {materialsByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ea580c',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [`${value} loại`, name]}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span style={{ color: '#374151' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 4: Công trình theo trạng thái - Horizontal Bar Chart */}
        <div className="chart-card">
          <h3>Công trình theo trạng thái</h3>
          {projectsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={projectsByStatus.map(item => ({
                  ...item,
                  name: item.status === 'active' ? 'Đang thi công' : item.status === 'completed' ? 'Hoàn thành' : item.status,
                  count: typeof item.count === 'string' ? parseInt(item.count) : (item.count || 0)
                }))}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="name" type="category" width={120} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ea580c',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#ea580c" radius={[0, 8, 8, 0]}>
                  {projectsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 5: Tồn kho theo công trình - Stacked Area Chart */}
        <div className="chart-card">
          <h3>Tồn kho trên từng công trình</h3>
          {inventoryByProject.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={inventoryByProject.slice(0, 8)}>
                <defs>
                  <linearGradient id="colorMaterialCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorTotalQuantity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="project_name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  stroke="#6b7280"
                  interval={0}
                />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ea580c',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="material_count" 
                  stackId="1"
                  stroke="#ea580c" 
                  fillOpacity={1} 
                  fill="url(#colorMaterialCount)" 
                  name="Số loại vật tư"
                />
                <Area 
                  type="monotone" 
                  dataKey="total_quantity" 
                  stackId="2"
                  stroke="#f97316" 
                  fillOpacity={1} 
                  fill="url(#colorTotalQuantity)" 
                  name="Tổng số lượng"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>

        {/* Chart 6: Top vật tư được sử dụng - Column Chart với gradient */}
        <div className="chart-card">
          <h3>Top 10 vật tư đang dùng nhiều nhất</h3>
          {topMaterials.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topMaterials.slice(0, 10)}>
                <defs>
                  <linearGradient id="colorTopMaterials" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#c2410c" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  stroke="#6b7280"
                  interval={0}
                />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #ea580c',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="total_issued" fill="url(#colorTopMaterials)" radius={[8, 8, 0, 0]} name="Số lượng đã xuất" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">Chưa có dữ liệu</div>
          )}
        </div>
      </div>

      {/* Low Stock Items */}
      {lowStockItems.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Vật tư cần bổ sung sớm</h2>
            <Link to="/inventory" className="view-all-link">Xem tất cả →</Link>
          </div>
          <div className="low-stock-table">
            <table>
              <thead>
                <tr>
                  <th>Mã Vật Tư</th>
                  <th>Tên Vật Tư</th>
                  <th>Đơn Vị</th>
                  <th>Công Trình</th>
                  <th>Tồn Kho</th>
                  <th>Tồn Tối Thiểu</th>
                  <th>Vị Trí</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.code}</td>
                    <td>{item.material_name}</td>
                    <td>{item.unit}</td>
                    <td>{item.project_name || 'Kho chung'}</td>
                    <td className="low-stock-quantity">{item.quantity}</td>
                    <td>{item.min_stock}</td>
                    <td>{item.location || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
