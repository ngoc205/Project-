import { useEffect, useMemo, useState } from 'react'
import api from '../api/axiosClient'

const subjectPalette = [
  'viewer-subject-blue',
  'viewer-subject-pink',
  'viewer-subject-mint',
  'viewer-subject-yellow',
  'viewer-subject-lavender',
  'viewer-subject-teal',
  'viewer-subject-slate',
]

function subjectClass(monHocId) {
  return subjectPalette[Number(monHocId || 0) % subjectPalette.length]
}

function makeKey(thuId, tietHocId) {
  return `${thuId}-${tietHocId}`
}

function getSession(tiet) {
  const text = `${tiet.TenTiet || ''}`.toLowerCase()
  if (text.includes('chiều') || Number(tiet.TietSo) >= 6) return 'CHIỀU\n(14:00 - 16:30)'
  return 'SÁNG\n(7:30 - 11:00)'
}

function TimetableTable({ thuList, tietHocList, entries }) {
  const entryMap = useMemo(() => {
    const map = new Map()
    entries.forEach((entry) => map.set(makeKey(entry.ThuID, entry.TietHocID), entry))
    return map
  }, [entries])

  const sessionRows = useMemo(() => {
    const groups = []
    tietHocList.forEach((tiet) => {
      const session = getSession(tiet)
      const lastGroup = groups[groups.length - 1]
      if (!lastGroup || lastGroup.session !== session) {
        groups.push({ session, rows: [tiet] })
      } else {
        lastGroup.rows.push(tiet)
      }
    })
    return groups
  }, [tietHocList])

  return (
    <div className="viewer-timetable-shell">
      <table className="viewer-timetable">
        <thead>
          <tr>
            <th>Buổi</th>
            <th>Tiết</th>
            {thuList.map((thu) => <th key={thu.ThuID}>{thu.TenThu}</th>)}
          </tr>
        </thead>
        <tbody>
          {sessionRows.map((group, groupIndex) => (
            group.rows.map((tiet, rowIndex) => (
              <tr key={tiet.TietHocID}>
                {rowIndex === 0 && (
                  <td className="viewer-session" rowSpan={group.rows.length}>
                    {group.session.split('\n').map((line) => <span key={line}>{line}</span>)}
                  </td>
                )}
                <td className="viewer-period">{rowIndex + 1}</td>
                {thuList.map((thu) => {
                  const entry = entryMap.get(makeKey(thu.ThuID, tiet.TietHocID))
                  return (
                    <td key={thu.ThuID}>
                      {entry?.TenMonHoc ? (
                        <span className={`viewer-subject ${subjectClass(entry.MonHocID)}`}>{entry.TenMonHoc}</span>
                      ) : (
                        <span className="viewer-empty">-</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            )).concat(groupIndex === 0 && sessionRows.length > 1 ? [
              <tr className="viewer-lunch-row" key="lunch-row">
                <td colSpan={thuList.length + 2}>Nghỉ trưa và Bán trú tại trường (11:00 - 13:45)</td>
              </tr>,
            ] : [])
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TimetablePage() {
  const [options, setOptions] = useState({ khoi: [], lop: [], thu: [], tietHoc: [] })
  const [selectedKhoiId, setSelectedKhoiId] = useState('')
  const [selectedLopId, setSelectedLopId] = useState('')
  const [classInfo, setClassInfo] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(false)

  const filteredClasses = useMemo(() => {
    if (!selectedKhoiId) return []
    return options.lop.filter((lop) => Number(lop.KhoiID) === Number(selectedKhoiId))
  }, [options.lop, selectedKhoiId])

  useEffect(() => {
    api.get('/thoi-khoa-bieu/options')
      .then((res) => {
        setOptions(res.data)
        const firstKhoi = res.data.khoi?.[0]?.KhoiID || ''
        const firstClass = res.data.lop?.find((lop) => Number(lop.KhoiID) === Number(firstKhoi))
        setSelectedKhoiId(firstKhoi)
        setSelectedLopId(firstClass?.LopID || '')
      })
      .catch((err) => console.error('Lỗi tải dữ liệu thời khóa biểu', err))
  }, [])

  const handleKhoiChange = (value) => {
    setSelectedKhoiId(value)
    const firstClass = options.lop.find((lop) => Number(lop.KhoiID) === Number(value))
    setSelectedLopId(firstClass?.LopID || '')
    setClassInfo(null)
    setEntries([])
  }

  useEffect(() => {
    if (selectedLopId) {
      viewTimetable(selectedLopId)
    }
  }, [selectedLopId])

  const viewTimetable = async (lopId = selectedLopId) => {
    if (!lopId) {
      setClassInfo(null)
      setEntries([])
      return
    }
    setLoading(true)
    try {
      const res = await api.get(`/thoi-khoa-bieu?lopId=${lopId}`)
      setClassInfo(res.data.lop)
      setEntries(res.data.entries)
    } catch (err) {
      alert(err.response?.data?.message || 'Không xem được thời khóa biểu!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="section page-center viewer-filter-section">
        <div className="filter-panel viewer-filter-panel">
          <label>
            Khối học
            <select value={selectedKhoiId} onChange={(e) => handleKhoiChange(e.target.value)}>
              <option value="">Chọn khối</option>
              {options.khoi.map((khoi) => <option key={khoi.KhoiID} value={khoi.KhoiID}>{khoi.TenKhoi}</option>)}
            </select>
          </label>
          <label>
            Lớp học
            <select value={selectedLopId} onChange={(e) => { setSelectedLopId(e.target.value); setClassInfo(null); setEntries([]) }}>
              <option value="">Chọn lớp</option>
              {filteredClasses.map((lop) => <option key={lop.LopID} value={lop.LopID}>Lớp {lop.TenLop}</option>)}
            </select>
          </label>
        </div>
      </section>

      {classInfo && (
        <section className="viewer-timetable-wrap">
          <div className="container">
            <div className="viewer-timetable-card">
              <div className="viewer-table-heading">
                <h2>Lớp {classInfo.TenLop} - Giáo viên Chủ nhiệm: {classInfo.TenGiaoVien || 'Chưa phân công'}</h2>
                <button className="primary-button small" type="button" onClick={() => window.print()}>In thời khóa biểu</button>
              </div>
              {loading ? <p className="viewer-loading">Đang tải thời khóa biểu...</p> : <TimetableTable thuList={options.thu} tietHocList={options.tietHoc} entries={entries} />}
              <p className="viewer-note">Lưu ý: Phụ huynh vui lòng theo dõi thời khóa biểu được cập nhật từ nhà trường.</p>
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default TimetablePage
