import React, { useEffect, useState } from 'react';

function CanBoList() {
  const [canBoList, setCanBoList] = useState([]);
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    HoTen: '',
    NgaySinh: '',
    GioiTinh: '',
    SoDienThoai: '',
    Email: '',
    ChucVu: '',
  });

  const loadData = () => {
    fetch('http://localhost:3001/can-bo')
      .then((res) => res.json())
      .then((data) => setCanBoList(data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async () => {
    if (!search) {
      loadData();
      return;
    }

    const res = await fetch(
      `http://localhost:3001/can-bo/search?keyword=${search}`
    );

    const data = await res.json();

    setCanBoList(data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa?')) {
      return;
    }

    await fetch(
      `http://localhost:3001/can-bo/${id}`,
      {
        method: 'DELETE',
      }
    );

    loadData();
  };

  const openAddForm = () => {
    setEditingId(null);

    setFormData({
      HoTen: '',
      NgaySinh: '',
      GioiTinh: '',
      SoDienThoai: '',
      Email: '',
      ChucVu: '',
    });

    setShowForm(true);
  };

  const openEditForm = (cb) => {
    setEditingId(cb.MaCanBo);

    setFormData({
      HoTen: cb.HoTen || '',
      NgaySinh: cb.NgaySinh || '',
      GioiTinh: cb.GioiTinh || '',
      SoDienThoai: cb.SoDienThoai || '',
      Email: cb.Email || '',
      ChucVu: cb.ChucVu || '',
    });

    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.HoTen) {
      alert('Nhập họ tên');
      return;
    }

    if (editingId) {
      await fetch(
        `http://localhost:3001/can-bo/${editingId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );
    } else {
      await fetch(
        'http://localhost:3001/can-bo',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );
    }

    setShowForm(false);

    loadData();
  };

  return (
    <div>

      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
        }}
      >
        <div className="card">
          <h3>👨‍🏫 Tổng cán bộ</h3>
          <h2>{canBoList.length}</h2>
        </div>

        <div className="card">
          <h3>👨 Nam</h3>
          <h2>
            {
              canBoList.filter(
                (x) => x.GioiTinh === 'Nam'
              ).length
            }
          </h2>
        </div>

        <div className="card">
          <h3>👩 Nữ</h3>
          <h2>
            {
              canBoList.filter(
                (x) => x.GioiTinh === 'Nữ'
              ).length
            }
          </h2>
        </div>
      </div>

      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow:
            '0 0 10px rgba(0,0,0,.1)',
        }}
      >
        <h2>Quản lý cán bộ</h2>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <button onClick={openAddForm}>
            ➕ Thêm cán bộ
          </button>

          <input
            placeholder="Tìm theo tên..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button onClick={handleSearch}>
            🔍 Tìm
          </button>

          <button onClick={loadData}>
            🔄 Làm mới
          </button>
        </div>

        <table
          border="1"
          cellPadding="10"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead
            style={{
              background: '#1976d2',
              color: 'white',
            }}
          >
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Chức vụ</th>
              <th>Email</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {canBoList.map((cb) => (
              <tr key={cb.MaCanBo}>
                <td>{cb.MaCanBo}</td>
                <td>{cb.HoTen}</td>
                <td>{cb.ChucVu}</td>
                <td>{cb.Email}</td>

                <td>
                  <button
                    onClick={() =>
                      openEditForm(cb)
                    }
                  >
                    ✏️ Sửa
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(
                        cb.MaCanBo
                      )
                    }
                  >
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}
  >
    <div
      style={{
        width: '650px',
        background: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1976d2, #0d47a1)',
          color: 'white',
          padding: '20px 25px',
        }}
      >
        <h2 style={{ margin: 0 }}>
          {editingId
            ? '✏️ Cập nhật cán bộ'
            : '➕ Thêm cán bộ mới'}
        </h2>

        <p
          style={{
            marginTop: '8px',
            opacity: 0.9,
            fontSize: '14px',
          }}
        >
          Nhập đầy đủ thông tin cán bộ
        </p>
      </div>

      {/* Body */}
      <div
        style={{
          padding: '25px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
        }}
      >
        <div>
          <label>Họ tên</label>
          <input
            style={inputStyle}
            placeholder="Nguyễn Văn A"
            value={formData.HoTen}
            onChange={(e) =>
              setFormData({
                ...formData,
                HoTen: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label>Ngày sinh</label>
          <input
            style={inputStyle}
            type="date"
            value={formData.NgaySinh}
            onChange={(e) =>
              setFormData({
                ...formData,
                NgaySinh: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label>Giới tính</label>
          <select
            style={inputStyle}
            value={formData.GioiTinh}
            onChange={(e) =>
              setFormData({
                ...formData,
                GioiTinh: e.target.value,
              })
            }
          >
            <option value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>

        <div>
          <label>Số điện thoại</label>
          <input
            style={inputStyle}
            placeholder="09xxxxxxxx"
            value={formData.SoDienThoai}
            onChange={(e) =>
              setFormData({
                ...formData,
                SoDienThoai: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label>Email</label>
          <input
            style={inputStyle}
            placeholder="example@gmail.com"
            value={formData.Email}
            onChange={(e) =>
              setFormData({
                ...formData,
                Email: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label>Chức vụ</label>
          <input
            style={inputStyle}
            placeholder="Giáo viên"
            value={formData.ChucVu}
            onChange={(e) =>
              setFormData({
                ...formData,
                ChucVu: e.target.value,
              })
            }
          />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '20px 25px',
          borderTop: '1px solid #eee',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
        }}
      >
        <button
          onClick={() => setShowForm(false)}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            background: '#e5e7eb',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          ❌ Hủy
        </button>

        <button
          onClick={handleSave}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            background: '#1976d2',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          💾 Lưu dữ liệu
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginTop: '6px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

export default CanBoList;