import { useEffect, useState } from "react";
import {
  getAllCanBo,
  createCanBo,
} from "../api/canBoApi";

function CanBoPage() {
  const [canBos, setCanBos] = useState([]);

  const [formData, setFormData] = useState({
    HoTen: "",
    NgaySinh: "",
    SoDienThoai: "",
    ChucVu: "",
    TenDangNhap: "",
    MatKhau: "",
  });

  const loadData = async () => {
    try {
      const res = await getAllCanBo();
      setCanBos(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createCanBo(formData);

      alert("Thêm cán bộ thành công");

      setFormData({
        HoTen: "",
        NgaySinh: "",
        SoDienThoai: "",
        ChucVu: "",
        TenDangNhap: "",
        MatKhau: "",
      });

      loadData();
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra");
    }
  };

  return (
    <div style={container}>
      <h1 style={title}>👔 Quản lý cán bộ</h1>

      {/* FORM CARD */}
      <div style={card}>
        <form onSubmit={handleSubmit} style={formGrid}>
          <input
            name="HoTen"
            placeholder="Họ tên"
            value={formData.HoTen}
            onChange={handleChange}
            style={input}
          />

          <input
            type="date"
            name="NgaySinh"
            value={formData.NgaySinh}
            onChange={handleChange}
            style={input}
          />

          <input
            name="SoDienThoai"
            placeholder="Số điện thoại"
            value={formData.SoDienThoai}
            onChange={handleChange}
            style={input}
          />

          <input
            name="ChucVu"
            placeholder="Chức vụ"
            value={formData.ChucVu}
            onChange={handleChange}
            style={input}
          />

          <input
            name="TenDangNhap"
            placeholder="Tên đăng nhập"
            value={formData.TenDangNhap}
            onChange={handleChange}
            style={input}
          />

          <input
            type="password"
            name="MatKhau"
            placeholder="Mật khẩu"
            value={formData.MatKhau}
            onChange={handleChange}
            style={input}
          />

          <button type="submit" style={btnPrimary}>
            Thêm cán bộ
          </button>
        </form>
      </div>

      {/* TABLE */}
      <div style={card}>
        <h2 style={{ marginBottom: 10 }}>Danh sách cán bộ</h2>

        <table style={table}>
          <thead>
            <tr style={theadRow}>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Điện thoại</th>
              <th>Chức vụ</th>
            </tr>
          </thead>

          <tbody>
            {canBos.map((item) => (
              <tr key={item.CanBoID} style={row}>
                <td>{item.CanBoID}</td>
                <td>{item.HoTen}</td>
                <td>{item.SoDienThoai}</td>
                <td>{item.ChucVu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CanBoPage;

/* ================= UI STYLE ================= */

const container = {
  padding: 25,
  fontFamily: "Arial",
  background: "#f4f6f9",
  minHeight: "100vh",
};

const title = {
  marginBottom: 20,
  color: "#1a237e",
};

const card = {
  background: "white",
  padding: 20,
  borderRadius: 12,
  marginBottom: 20,
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 10,
};

const input = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
};

const btnPrimary = {
  gridColumn: "span 2",
  padding: 12,
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: "bold",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const theadRow = {
  background: "#e3f2fd",
};

const row = {
  borderBottom: "1px solid #eee",
};