import { afternoonRows, morningRows, subjects } from '../data/schoolData'

function Subject({ id }) {
  return <span className={`subject ${id}`}>{subjects[id]}</span>
}

function TimetableTable() {
  return (
    <div className="timetable">
      <div className="table-row table-head">
        <span>Buổi</span>
        <span>Tiết</span>
        <span>Thứ Hai</span>
        <span>Thứ Ba</span>
        <span>Thứ Tư</span>
        <span>Thứ Năm</span>
        <span>Thứ Sáu</span>
      </div>
      {morningRows.map((row, index) => (
        <div className="table-row" key={`morning-${index}`}>
          {index === 0 && <span className="session" style={{ gridRow: `span ${morningRows.length}` }}>SÁNG<br />(7:30 - 11:00)</span>}
          <span>{index + 1}</span>
          {row.map((key, cellIndex) => <Subject key={`${key}-${cellIndex}`} id={key} />)}
        </div>
      ))}
      <div className="lunch">Nghỉ trưa và Bán trú tại trường (11:00 - 13:45)</div>
      {afternoonRows.map((row, index) => (
        <div className="table-row" key={`afternoon-${index}`}>
          {index === 0 && <span className="session" style={{ gridRow: `span ${afternoonRows.length}` }}>CHIỀU<br />(14:00 - 16:30)</span>}
          <span>{index + 1}</span>
          {row.map((key, cellIndex) => (key ? <Subject key={`${key}-${cellIndex}`} id={key} /> : <span className="empty-cell" key={cellIndex}>-</span>))}
        </div>
      ))}
    </div>
  )
}

function TimetablePage() {
  return (
    <>
      <section className="section page-center">
        <h1>🗓 Thời Khóa Biểu Cấp Trường</h1>
        <p>Phụ huynh vui lòng chọn Khối và Lớp để xem lịch học chi tiết của các con.</p>
        <div className="filter-panel">
          <label>
            Khối học
            <select defaultValue="Khối 1">
              <option>Khối 1</option>
              <option>Khối 2</option>
              <option>Khối 3</option>
              <option>Khối 4</option>
              <option>Khối 5</option>
            </select>
          </label>
          <label>
            Lớp học
            <select defaultValue="Lớp 1A1">
              <option>Lớp 1A1</option>
              <option>Lớp 1A2</option>
              <option>Lớp 2A1</option>
            </select>
          </label>
          <label>
            Tuần học
            <select defaultValue="Tuần 1 (01/09 - 05/09)">
              <option>Tuần 1 (01/09 - 05/09)</option>
              <option>Tuần 2 (08/09 - 12/09)</option>
            </select>
          </label>
          <button className="primary-button" type="button">Xem lịch học</button>
        </div>
      </section>

      <section className="timetable-wrap">
        <div className="container">
          <div className="timetable-card">
            <div className="table-heading">
              <h2>Lớp 1A1 - Giáo viên Chủ nhiệm: Cô Trần Thị B</h2>
              <button className="primary-button small" type="button">In thời khóa biểu</button>
            </div>
            <TimetableTable />
            <p className="note">Lưu ý: Phụ huynh vui lòng đón con đúng giờ. Học sinh tham gia CLB ngoại khóa vào chiều Thứ Sáu sẽ tan học lúc 17:00.</p>
          </div>
        </div>
      </section>
    </>
  )
}

export default TimetablePage
