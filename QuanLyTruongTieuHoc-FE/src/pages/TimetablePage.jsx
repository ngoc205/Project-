import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosClient';

function cellKey(thuId, tietHocId) {
  return `${thuId}-${tietHocId}`;
}

function buildGrid(entries = []) {
  const grid = {};
  entries.forEach((entry) => {
    grid[cellKey(entry.ThuID, entry.TietHocID)] = entry;
  });
  return grid;
}

function classOptionLabel(lop) {
  return `${lop.TenLop}${lop.TenGiaoVien ? ` - ${lop.TenGiaoVien}` : ' - Chưa phân công'}`;
}

const subjectColorClasses = [
  'blue',
  'pink',
  'mint',
  'yellow',
  'lavender',
  'teal',
  'rose',
  'lime',
  'cyan',
  'peach',
  'indigo',
  'olive',
  'coral',
  'gray',
];

function TimetablePage() {
  const [options, setOptions] = useState({ khoi: [], lop: [], thu: [], tietHoc: [], monHoc: [] });
  const [selectedKhoiId, setSelectedKhoiId] = useState('');
  const [selectedLopId, setSelectedLopId] = useState('');
  const [classInfo, setClassInfo] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const filteredClasses = useMemo(() => {
    if (!selectedKhoiId) return [];
    return options.lop.filter((lop) => Number(lop.KhoiID) === Number(selectedKhoiId));
  }, [options.lop, selectedKhoiId]);

  const grid = useMemo(() => buildGrid(entries), [entries]);
  const subjectColorMap = useMemo(() => {
    const names = [
      ...options.monHoc.map((subject) => subject.TenMonHoc),
      ...entries.map((entry) => entry.TenMonHoc),
    ]
      .filter(Boolean)
      .map((name) => name.trim());

    return [...new Set(names)].reduce((map, name, index) => {
      map[name.toLowerCase()] = subjectColorClasses[index % subjectColorClasses.length];
      return map;
    }, {});
  }, [entries, options.monHoc]);

  useEffect(() => {
    api.get('/thoi-khoa-bieu/options')
      .then((res) => {
        setOptions(res.data);
        const firstKhoi = res.data.khoi?.[0]?.KhoiID || '';
        const firstClass = res.data.lop?.find((lop) => Number(lop.KhoiID) === Number(firstKhoi));
        setSelectedKhoiId(firstKhoi);
        setSelectedLopId(firstClass?.LopID || '');
      })
      .catch((err) => {
        console.error('Lỗi tải bộ lọc thời khóa biểu', err);
      });
  }, []);

  useEffect(() => {
    if (!selectedLopId) {
      setClassInfo(null);
      setEntries([]);
      return;
    }

    setLoading(true);
    api.get(`/thoi-khoa-bieu?lopId=${selectedLopId}`)
      .then((res) => {
        setClassInfo(res.data.lop);
        setEntries(res.data.entries || []);
      })
      .catch((err) => {
        console.error('Lỗi tải thời khóa biểu', err);
        setClassInfo(null);
        setEntries([]);
      })
      .finally(() => setLoading(false));
  }, [selectedLopId]);

  const handleKhoiChange = (value) => {
    setSelectedKhoiId(value);
    const firstClass = options.lop.find((lop) => Number(lop.KhoiID) === Number(value));
    setSelectedLopId(firstClass?.LopID || '');
  };

  return (
    <>
      <section className="section page-center viewer-filter-section">
        <h1>Thời Khóa Biểu</h1>
        <p>Phụ huynh chọn khối và lớp để xem lịch học đã được cập nhật từ hệ thống quản trị.</p>

        <div className="filter-panel viewer-filter-panel">
          <label>
            Khối học
            <select value={selectedKhoiId} onChange={(e) => handleKhoiChange(e.target.value)}>
              <option value="">Chọn khối</option>
              {options.khoi.map((khoi) => (
                <option key={khoi.KhoiID} value={khoi.KhoiID}>{khoi.TenKhoi}</option>
              ))}
            </select>
          </label>

          <label>
            Lớp học
            <select value={selectedLopId} onChange={(e) => setSelectedLopId(e.target.value)}>
              <option value="">Chọn lớp</option>
              {filteredClasses.map((lop) => (
                <option key={lop.LopID} value={lop.LopID}>{classOptionLabel(lop)}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="viewer-timetable-wrap">
        <div className="container">
          <div className="viewer-timetable-card">
            <div className="viewer-table-heading">
              <div>
                <h2>{classInfo ? `Thời khóa biểu lớp ${classInfo.TenLop}` : 'Chưa chọn lớp'}</h2>
                {classInfo && (
                  <p style={{ color: '#64748b', marginTop: '6px' }}>
                    {classInfo.TenKhoi} - Giáo viên chủ nhiệm: {classInfo.TenGiaoVien || 'Chưa phân công'}
                  </p>
                )}
              </div>
              <button className="primary-button small" type="button" onClick={() => window.print()}>
                In thời khóa biểu
              </button>
            </div>

            {loading ? (
              <div className="viewer-loading">Đang tải thời khóa biểu...</div>
            ) : (
              <div className="viewer-timetable-shell">
                <table className="viewer-timetable">
                  <thead>
                    <tr>
                      <th>Tiết</th>
                      {options.thu.map((thu) => (
                        <th key={thu.ThuID}>{thu.TenThu}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {options.tietHoc.map((tiet) => (
                      <tr key={tiet.TietHocID}>
                        <td className="viewer-period">{tiet.TenTiet}</td>
                        {options.thu.map((thu) => {
                          const entry = grid[cellKey(thu.ThuID, tiet.TietHocID)];
                          const colorClass = subjectColorMap[entry?.TenMonHoc?.trim().toLowerCase()] || 'gray';
                          return (
                            <td key={thu.ThuID}>
                              {entry?.TenMonHoc ? (
                                <div className={`viewer-subject viewer-subject-${colorClass}`}>
                                  {entry.TenMonHoc}
                                </div>
                              ) : (
                                <div className="viewer-empty">Trống tiết</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && classInfo && entries.length === 0 && (
              <p className="viewer-note">Lớp này chưa có thời khóa biểu. Vui lòng quay lại sau khi nhà trường cập nhật.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default TimetablePage;
