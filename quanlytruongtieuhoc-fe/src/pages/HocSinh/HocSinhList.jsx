import React, { useEffect, useState } from 'react';

function HocSinhList() {
  const [hocSinhList, setHocSinhList] = useState([]);

  const loadData = () => {
    fetch('http://localhost:3001/hoc-sinh')
      .then((res) => res.json())
      .then((data) => setHocSinhList(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div
      style={{
        background: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0,0,0,.1)',
      }}
    >
      <h2>🎓 Quản lý học sinh</h2>

      <p>
        Tổng học sinh:
        <b> {hocSinhList.length}</b>
      </p>

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
            background: '#4caf50',
            color: 'white',
          }}
        >
          <tr>
            <th>Mã HS</th>
            <th>Họ tên</th>
            <th>Giới tính</th>
            <th>Ngày sinh</th>
          </tr>
        </thead>

        <tbody>
          {hocSinhList.map((hs) => (
            <tr key={hs.MaHocSinh}>
              <td>{hs.MaHocSinh}</td>
              <td>{hs.HoTen}</td>
              <td>{hs.GioiTinh}</td>
              <td>{hs.NgaySinh}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HocSinhList;