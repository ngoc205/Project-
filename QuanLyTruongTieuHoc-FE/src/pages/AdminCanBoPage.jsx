import { useEffect, useState } from 'react'
import api from '../api/axiosClient'
import { useNotification } from '../components/NotificationProvider'

export default function AdminCanBoPage() {
  const { showSuccess, showError, showConfirm } = useNotification()
  const [list, setList] = useState([])
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    TenDangNhap: '',
    MatKhau: '',
    HoTen: '',
    SoDienThoai: '',
    ChucVu: '',
  })

  const loadData = async () => {
    const res = await api.get('/can-bo')
    setList(res.data)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSearch = async (keyword) => {
    setSearch(keyword)

    if (keyword.trim() === '') {
      loadData()
      return
    }

    const res = await api.get(`/can-bo/search?keyword=${keyword}`)

    setList(res.data)
  }

  const handleSubmit = async () => {
    try {
      if (editId) {
        await api.patch(`/can-bo/${editId}`, form)
        setEditId(null)
        showSuccess('Cập nhật cán bộ thành công!')
      } else {
        await api.post('/can-bo', form)
        showSuccess('Thêm cán bộ thành công!')
      }

      setForm({
        TenDangNhap: '',
        MatKhau: '',
        HoTen: '',
        SoDienThoai: '',
        ChucVu: '',
      })

      loadData()
    } catch (err) {
      showError(err.response?.data?.message || 'Lưu cán bộ thất bại!')
    }
  }

  const handleEdit = (item) => {
    setEditId(item.CanBoID)
    setForm({
      TenDangNhap: item.TenDangNhap || '',
      MatKhau: item.MatKhau || '',
      HoTen: item.HoTen || '',
      SoDienThoai: item.SoDienThoai || '',
      ChucVu: item.ChucVu || '',
    })
  }

  const handleDelete = async (id) => {
    const confirmed = await showConfirm({
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc muốn xóa cán bộ này không?',
      confirmText: 'Xóa',
      danger: true,
    })
    if (!confirmed) return

    try {
      await api.delete(`/can-bo/${id}`)
      await loadData()
      showSuccess('Xóa cán bộ thành công!')
    } catch (err) {
      showError(err.response?.data?.message || 'Xóa cán bộ thất bại!')
    }
  }

  return (
    <div style={{ padding: 30, background: '#f4f6fb', minHeight: '100vh' }}>

      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 5, color: '#1a365d' }}>
           Quản lý Cán bộ
        </h2>
        <p style={{ color: '#666' }}>
          Thêm, sửa, xóa và tìm kiếm cán bộ trong hệ thống
        </p>
      </div>

      {/* SEARCH */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="🔍 Tìm kiếm cán bộ..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            padding: 10,
            width: '100%',
            maxWidth: 400,
            borderRadius: 8,
            border: '1px solid #ccc',
            outline: 'none'
          }}
        />
      </div>

      {/* FORM CARD */}
      <div style={{
        background: 'white',
        padding: 20,
        borderRadius: 10,
        marginBottom: 30,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ marginBottom: 15 }}>
          {editId ? '✏️ Cập nhật cán bộ' : ' Thêm cán bộ'}
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10
        }}>

          <input placeholder="Tên đăng nhập"
            value={form.TenDangNhap}
            onChange={(e) => setForm({ ...form, TenDangNhap: e.target.value })}
            style={inputStyle}
          />

          <input placeholder="Mật khẩu"
            value={form.MatKhau}
            onChange={(e) => setForm({ ...form, MatKhau: e.target.value })}
            style={inputStyle}
          />

          <input placeholder="Họ tên"
            value={form.HoTen}
            onChange={(e) => setForm({ ...form, HoTen: e.target.value })}
            style={inputStyle}
          />

          <input placeholder="SĐT"
            value={form.SoDienThoai}
            onChange={(e) => setForm({ ...form, SoDienThoai: e.target.value })}
            style={inputStyle}
          />

          <input placeholder="Chức vụ"
            value={form.ChucVu}
            onChange={(e) => setForm({ ...form, ChucVu: e.target.value })}
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleSubmit}
          style={{
            marginTop: 15,
            padding: '10px 15px',
            background: '#1a365d',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer'
          }}
        >
          {editId ? '💾 Cập nhật' : ' Thêm mới'}
        </button>
      </div>

      {/* TABLE */}
      <div style={{
        background: 'white',
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#1a365d', color: 'white' }}>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Họ tên</th>
              <th style={th}>SĐT</th>
              <th style={th}>Chức vụ</th>
              <th style={th}>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {list.map((item) => (
              <tr key={item.CanBoID} style={{ borderBottom: '1px solid #eee' }}>
                <td style={td}>{item.CanBoID}</td>
                <td style={td}>{item.HoTen}</td>
                <td style={td}>{item.SoDienThoai}</td>
                <td style={td}>{item.ChucVu}</td>
                <td style={td}>
                  <button onClick={() => handleEdit(item)} style={btnEdit}>
                    Sửa
                  </button>

                  <button onClick={() => handleDelete(item.CanBoID)} style={btnDelete}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}

/* STYLE */
const inputStyle = {
  padding: 10,
  borderRadius: 8,
  border: '1px solid #ccc',
  outline: 'none'
}

const th = {
  padding: 12,
  textAlign: 'left'
}

const td = {
  padding: 12
}

const btnEdit = {
  marginRight: 8,
  padding: '6px 10px',
  background: '#3182ce',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer'
}

const btnDelete = {
  padding: '6px 10px',
  background: '#e53e3e',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer'
}
