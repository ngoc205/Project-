import React, { useEffect, useState } from 'react'
import api from '../api/axiosClient'

export default function AdminHocSinhPage() {
  const [list, setList] = useState([])
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)

  const [form, setForm] = useState({
    TenHocSinh: '',
    NgaySinh: '',
    GioiTinh: '',
    DiaChi: '',
    AnhDaiDien: '',
  })

  const resetForm = () => {
    setForm({
      TenHocSinh: '',
      NgaySinh: '',
      GioiTinh: '',
      DiaChi: '',
      AnhDaiDien: '',
    })
  }

  const loadData = async () => {
    const res = await api.get('/hoc-sinh')
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

    const res = await api.get(`/hoc-sinh/search?keyword=${keyword}`)

    setList(res.data)
  }

  const handleSubmit = async () => {
    if (editId) {
      await api.patch(`/hoc-sinh/${editId}`, form)
      setEditId(null)
    } else {
      await api.post('/hoc-sinh', form)
    }

    resetForm()

    loadData()
  }

  const uploadImageFile = async (file) => {
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)
    setUploadingImage(true)

    try {
      const res = await api.post('/upload/image', formData)
      setForm((current) => ({ ...current, AnhDaiDien: res.data.filename }))
    } catch (err) {
      alert(err.response?.data?.message || 'Upload ảnh thất bại!')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleEdit = (item) => {
    setEditId(item.HocSinhID)
    setForm({
      TenHocSinh: item.TenHocSinh || '',
      NgaySinh: item.NgaySinh ? new Date(item.NgaySinh).toISOString().slice(0, 10) : '',
      GioiTinh: item.GioiTinh || '',
      DiaChi: item.DiaChi || '',
      AnhDaiDien: item.AnhDaiDien || '',
    })
  }

  const handleDelete = async (id) => {
    await api.delete(`/hoc-sinh/${id}`)
    loadData()
  }

  return (
    <div style={{ padding: 30, background: '#f4f6fb', minHeight: '100vh' }}>

      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: '#1a365d', marginBottom: 5 }}>
          🎓 Quản lý Học sinh
        </h2>
        <p style={{ color: '#666' }}>
          Thêm, sửa, xóa và tìm kiếm học sinh
        </p>
      </div>

      {/* SEARCH */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="🔍 Tìm kiếm học sinh..."
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
          {editId ? '✏️ Cập nhật học sinh' : '➕ Thêm học sinh'}
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10
        }}>

          <input
            placeholder="Tên học sinh"
            value={form.TenHocSinh}
            onChange={(e) =>
              setForm({ ...form, TenHocSinh: e.target.value })
            }
            style={inputStyle}
          />

          <input
            type="date"
            value={form.NgaySinh}
            onChange={(e) =>
              setForm({ ...form, NgaySinh: e.target.value })
            }
            style={inputStyle}
          />

          <select
            value={form.GioiTinh}
            onChange={(e) =>
              setForm({ ...form, GioiTinh: e.target.value })
            }
            style={inputStyle}
          >
            <option value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>

          <input
            placeholder="Địa chỉ"
            value={form.DiaChi}
            onChange={(e) =>
              setForm({ ...form, DiaChi: e.target.value })
            }
            style={inputStyle}
          />

          <input
            placeholder="Ảnh đại diện (vd: bao_hs.png)"
            value={form.AnhDaiDien}
            onChange={(e) =>
              setForm({ ...form, AnhDaiDien: e.target.value })
            }
            style={inputStyle}
          />

          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => uploadImageFile(e.target.files?.[0])}
              style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
            />
            {uploadingImage && <div style={{ marginTop: 6, color: '#64748b' }}>Đang tải ảnh...</div>}
            {form.AnhDaiDien && (
              <img
                src={resolveImageSrc(form.AnhDaiDien)}
                alt="Xem trước ảnh học sinh"
                onError={(e) => {
                  e.currentTarget.src = '/images/hocsinh1.jpg'
                }}
                style={{ display: 'block', marginTop: 10, width: 72, height: 72, objectFit: 'cover', borderRadius: '50%', border: '1px solid #dbe3ef' }}
              />
            )}
          </div>
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
          {editId ? '💾 Cập nhật' : '➕ Thêm mới'}
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
              <th style={th}>Ảnh</th>
              <th style={th}>Tên</th>
              <th style={th}>Ngày sinh</th>
              <th style={th}>Giới tính</th>
              <th style={th}>Địa chỉ</th>
              <th style={th}>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {list.map((item) => (
              <tr key={item.HocSinhID} style={{ borderBottom: '1px solid #eee' }}>
                <td style={td}>{item.HocSinhID}</td>
                <td style={td}>
                  {item.AnhDaiDien ? (
                    <img
                      src={resolveImageSrc(item.AnhDaiDien)}
                      alt={item.TenHocSinh}
                      onError={(e) => {
                        e.currentTarget.src = '/images/hocsinh1.jpg'
                      }}
                      style={{ width: 46, height: 46, objectFit: 'cover', borderRadius: '50%', border: '1px solid #dbe3ef' }}
                    />
                  ) : (
                    <span style={{ color: '#94a3b8' }}>-</span>
                  )}
                </td>
                <td style={td}>{item.TenHocSinh}</td>
                <td style={td}>{item.NgaySinh}</td>
                <td style={td}>{item.GioiTinh}</td>
                <td style={td}>{item.DiaChi || '-'}</td>
                <td style={td}>
                  <button onClick={() => handleEdit(item)} style={btnEdit}>
                    Sửa
                  </button>

                  <button onClick={() => handleDelete(item.HocSinhID)} style={btnDelete}>
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
function resolveImageSrc(value) {
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) return value
  return `/images/${value}`
}

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
