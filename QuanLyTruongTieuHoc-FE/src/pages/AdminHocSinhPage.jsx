import { useEffect, useState } from 'react'
import api from '../api/axiosClient'
import { useNotification } from '../components/NotificationProvider'

export default function AdminHocSinhPage() {
  const { showSuccess, showError } = useNotification()
  const [list, setList] = useState([])
  const [editId, setEditId] = useState(null)
  const [search, setSearch] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmAction, setConfirmAction] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [importingExcel, setImportingExcel] = useState(false)
  const itemsPerPage = 5

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
    setCurrentPage(1)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSearch = async (keyword) => {
    setSearch(keyword)
    setCurrentPage(1)

    if (keyword.trim() === '') {
      loadData()
      return
    }

    const res = await api.get(`/hoc-sinh/search?keyword=${keyword}`)

    setList(res.data)
  }

  const handleSubmit = async () => {
    if (editId) {
      setConfirmAction({
        type: 'update',
        title: 'Xác nhận cập nhật',
        message: 'Bạn có chắc muốn lưu thay đổi thông tin học sinh này không?',
        confirmText: 'Cập nhật',
      })
      return
    }

    try {
      await api.post('/hoc-sinh', form)
      resetForm()
      await loadData()
      showSuccess('Thêm học sinh thành công!')
    } catch (err) {
      showError(err.response?.data?.message || 'Thêm học sinh thất bại!')
    }
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
      showError(err.response?.data?.message || 'Upload ảnh thất bại!')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleExcelImport = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportingExcel(true)
    try {
      const text = await file.text()
      const normalizedText = text.replace(/\r/g, '').trim()
      if (!normalizedText) {
        throw new Error('File trống. Vui lòng chọn file có dữ liệu.')
      }

      const rows = normalizedText
        .split('\n')
        .map((row) => row.split(/;|,|\t/).map((cell) => cell.trim()))
        .filter((row) => row.some(Boolean))

      if (rows.length < 2) {
        throw new Error('File mẫu không hợp lệ. Vui lòng dùng mẫu có ít nhất 1 dòng dữ liệu.')
      }

      const headers = rows[0].map((header) => header.toLowerCase())
      const nameIndex = headers.findIndex((header) => ['tenhocsinh', 'ten', 'họ tên', 'hoten'].includes(header))
      const dobIndex = headers.findIndex((header) => ['ngaysinh', 'ngay sinh', 'dob', 'birthday'].includes(header))
      const genderIndex = headers.findIndex((header) => ['gioitinh', 'giới tính', 'sex', 'gender'].includes(header))
      const addressIndex = headers.findIndex((header) => ['diachi', 'địa chỉ', 'address'].includes(header))

      if (nameIndex === -1) {
        throw new Error('File phải có cột tên học sinh.')
      }

      const payload = rows.slice(1).map((row) => ({
        TenHocSinh: row[nameIndex] || '',
        NgaySinh: row[dobIndex] || null,
        GioiTinh: row[genderIndex] || 'Nam',
        DiaChi: row[addressIndex] || '',
      })).filter((student) => student.TenHocSinh)

      if (!payload.length) {
        throw new Error('Không có học sinh hợp lệ để nhập.')
      }

      await api.post('/hoc-sinh/bulk', payload)
      await loadData()
      showSuccess(`Đã nhập thành công ${payload.length} học sinh từ file.`)
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Nhập học sinh từ Excel thất bại!')
    } finally {
      setImportingExcel(false)
      event.target.value = ''
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

  const handleDelete = (item) => {
    setConfirmAction({
      type: 'delete',
      id: item.HocSinhID,
      title: 'Xác nhận xóa',
      message: `Bạn có chắc muốn xóa học sinh "${item.TenHocSinh}" không?`,
      confirmText: 'Xóa',
    })
  }

  const closeConfirm = () => {
    if (processing) return
    setConfirmAction(null)
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return

    setProcessing(true)
    try {
      if (confirmAction.type === 'update') {
        await api.patch(`/hoc-sinh/${editId}`, form)
        setEditId(null)
        resetForm()
        await loadData()
        showSuccess('Cập nhật học sinh thành công!')
      }

      if (confirmAction.type === 'delete') {
        await api.delete(`/hoc-sinh/${confirmAction.id}`)
        await loadData()
        showSuccess('Xóa học sinh thành công!')
      }

      setConfirmAction(null)
    } catch (err) {
      const fallbackMessage = confirmAction.type === 'delete'
        ? 'Xóa học sinh thất bại!'
        : 'Cập nhật học sinh thất bại!'
      showError(err.response?.data?.message || fallbackMessage)
    } finally {
      setProcessing(false)
    }
  }

  const totalPages = Math.ceil(list.length / itemsPerPage)
  const currentStudents = list.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div style={{ padding: 30, background: '#f4f6fb', minHeight: '100vh' }}>

      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: '#1a365d', marginBottom: 5 }}>
          🎓 Quản lý Học sinh
        </h2>
        <p style={{ color: '#666' }}>
          Thêm, sửa, xóa, tìm kiếm và nhập hàng loạt học sinh từ file Excel
        </p>
      </div>

      <div style={{
        background: 'white',
        padding: 20,
        borderRadius: 10,
        marginBottom: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <strong>Nhập hàng loạt từ file Excel/CSV:</strong>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleExcelImport}
            disabled={importingExcel}
            style={{ ...inputStyle, padding: '8px 10px' }}
          />
          {importingExcel && <span style={{ color: '#64748b' }}>Đang nhập...</span>}
        </div>
        <p style={{ margin: '0 0 10px', color: '#64748b', fontSize: 13 }}>
          File nên có các cột: Tên học sinh, Ngày sinh, Giới tính, Địa chỉ. Có thể dùng dấu phẩy, chấm phẩy hoặc tab.
        </p>
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
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #e2e8f0' }}>
          <input
            placeholder="🔍 Tìm kiếm học sinh..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              padding: 10,
              width: '100%',
              borderRadius: 8,
              border: '1px solid #ccc',
              outline: 'none',
              boxSizing: 'border-box',
              fontSize: 15,
            }}
          />
        </div>
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
            {currentStudents.map((item) => (
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
                <td style={td}>{formatDateView(item.NgaySinh)}</td>
                <td style={td}>{item.GioiTinh}</td>
                <td style={td}>{item.DiaChi || '-'}</td>
                <td style={td}>
                  <button onClick={() => handleEdit(item)} style={btnEdit}>
                    Sửa
                  </button>

                  <button onClick={() => handleDelete(item)} style={btnDelete}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan="7" style={{ ...td, textAlign: 'center', color: '#64748b' }}>
                  Không tìm thấy học sinh.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />

      {confirmAction && (
        <ConfirmDialog
          action={confirmAction}
          processing={processing}
          onCancel={closeConfirm}
          onConfirm={handleConfirmAction}
        />
      )}

    </div>
  )
}

/* STYLE */
function resolveImageSrc(value) {
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) return value
  return `/images/${value}`
}

function formatDateView(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('vi-VN')
}

function Pagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) return null

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
      <button disabled={currentPage === 1} onClick={() => onChange(currentPage - 1)}>◀</button>
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          onClick={() => onChange(index + 1)}
          style={{
            padding: '8px 12px',
            background: currentPage === index + 1 ? '#2b6cb0' : '#fff',
            color: currentPage === index + 1 ? '#fff' : '#000',
            border: '1px solid #64748b',
            cursor: 'pointer',
          }}
        >
          {index + 1}
        </button>
      ))}
      <button disabled={currentPage === totalPages} onClick={() => onChange(currentPage + 1)}>▶</button>
    </div>
  )
}

function ConfirmDialog({ action, processing, onCancel, onConfirm }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1500,
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        background: 'rgba(15, 23, 42, 0.45)',
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-confirm-title"
        style={{
          width: 'min(430px, 100%)',
          background: 'white',
          borderRadius: 10,
          padding: 22,
          boxShadow: '0 24px 50px rgba(15, 23, 42, 0.28)',
        }}
      >
        <h3 id="student-confirm-title" style={{ margin: '0 0 10px', color: '#1a365d' }}>
          {action.title}
        </h3>
        <p style={{ margin: '0 0 20px', color: '#475569', lineHeight: 1.6 }}>
          {action.message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={onCancel} disabled={processing} style={btnCancel}>
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={processing}
            style={action.type === 'delete' ? btnConfirmDanger : btnConfirmPrimary}
          >
            {processing ? 'Đang xử lý...' : action.confirmText}
          </button>
        </div>
      </section>
    </div>
  )
}

const buttonPrimaryStyle = {
  border: 'none',
  borderRadius: 8,
  padding: '10px 16px',
  backgroundColor: '#1f5aa6',
  color: 'white',
  fontWeight: 700,
  cursor: 'pointer',
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

const btnCancel = {
  padding: '9px 14px',
  background: 'white',
  color: '#334155',
  border: '1px solid #94a3b8',
  borderRadius: 7,
  cursor: 'pointer',
  fontWeight: 700,
}

const btnConfirmPrimary = {
  padding: '9px 14px',
  background: '#1a365d',
  color: 'white',
  border: 'none',
  borderRadius: 7,
  cursor: 'pointer',
  fontWeight: 700,
}

const btnConfirmDanger = {
  ...btnConfirmPrimary,
  background: '#b91c1c',
}
