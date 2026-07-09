import { useEffect, useState } from 'react';
import api from '../api/axiosClient';
import { useNotification } from '../components/NotificationProvider';

const selectStyle = { width: '100%', padding: '11px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', boxSizing: 'border-box' };

export default function AdminLenLopPage({ onBack, onCompleted }) {
  const { showError, showSuccess } = useNotification();
  const [terms, setTerms] = useState([]);
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [creatingYear, setCreatingYear] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState(null);
  const schoolYearStart = (term) => Number(String(term?.TenNam || '').match(/\d{4}/)?.[0]);
  const isHocKy1 = (term) => String(term?.TenKy || '').includes('1');
  const isHocKy2 = (term) => String(term?.TenKy || '').includes('2');
  const sourceTerms = terms.filter((term) => isHocKy2(term));
  const selectedSource = terms.find((term) => String(term.ThoiGianID) === String(sourceId));
  const targetTerms = terms.filter((term) => selectedSource && isHocKy1(term) && schoolYearStart(term) === schoolYearStart(selectedSource) + 1);
  const statLabels = [['Tổng học sinh', preview?.totals.tongSo, '#1a365d'], ['Đủ điều kiện lên lớp', preview?.totals.duDieuKien, '#166534'], ['Ở lại lớp', preview?.totals.oLaiLop, '#b45309'], ['Hoàn thành tiểu học', preview?.totals.totNghiep, '#6b21a8']];
  const tableHeaders = ['Lớp nguồn', 'Khối', 'Sĩ số', 'Lên lớp', 'Ở lại', 'Hoàn thành'];

  const loadPreview = async (source = sourceId, target = targetId) => {
    if (!source || !target || source === target) return setPreview(null);
    setLoading(true);
    try {
      const response = await api.get(`/api/len-lop/preview?sourceThoiGianId=${source}&targetThoiGianId=${target}`);
      setPreview(response.data);
    } catch (error) {
      setPreview(null);
      showError(error.response?.data?.message || 'Không tải được dữ liệu lên lớp.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/api/len-lop/options').then((response) => {
      const items = response.data.thoiGian;
      setTerms(items);
      const current = items.find((item) => item.IsCurrent && isHocKy2(item)) || items.find((item) => isHocKy2(item));
      const next = items.find((item) => isHocKy1(item) && schoolYearStart(item) === schoolYearStart(current) + 1);
      setSourceId(String(current?.ThoiGianID || ''));
      setTargetId(String(next?.ThoiGianID || ''));
      if (current && next) loadPreview(String(current.ThoiGianID), String(next.ThoiGianID));
      else setLoading(false);
    }).catch((error) => { showError(error.response?.data?.message || 'Không tải được danh sách năm học.'); setLoading(false); });
  }, []);

  const promote = async () => {
    setProcessing(true);
    try {
      const response = await api.post('/api/len-lop', { sourceThoiGianId: Number(sourceId), targetThoiGianId: Number(targetId) });
      setResult(response.data);
      setConfirming(false);
      setPreview(null);
      showSuccess(response.data.message);
      onCompleted?.();
    } catch (error) {
      showError(error.response?.data?.message || 'Lên lớp thất bại. Không có dữ liệu nào được thay đổi.');
    } finally {
      setProcessing(false);
    }
  };

  const createNextSchoolYear = async () => {
    if (!sourceId) return showError('Vui lòng chọn Học kỳ 2 nguồn trước.');
    if (!isHocKy2(selectedSource)) return showError('Chỉ tạo năm học kế tiếp khi đang chọn Học kỳ 2.');
    setCreatingYear(true);
    try {
      const response = await api.post('/api/len-lop/tao-nam-hoc', { sourceThoiGianId: Number(sourceId) });
      const optionsResponse = await api.get('/api/len-lop/options');
      const items = optionsResponse.data.thoiGian;
      setTerms(items);
      const nextTerm = items.find((term) => term.TenNam === response.data.nextSchoolYear && String(term.TenKy || '').includes('1'));
      setTargetId(String(nextTerm?.ThoiGianID || ''));
      if (nextTerm) loadPreview(sourceId, String(nextTerm.ThoiGianID));
      showSuccess(response.data.message);
    } catch (error) {
      showError(error.response?.data?.message || 'Không thể tạo năm học kế tiếp.');
    } finally {
      setCreatingYear(false);
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-start', marginBottom: '22px' }}>
        <div><h2 style={{ color: '#1a365d', margin: 0 }}>Lên lớp</h2><p style={{ color: '#64748b', margin: '8px 0 0' }}>Xét lên lớp từ Học kỳ 2 của năm học hiện tại sang Học kỳ 1 của năm học kế tiếp.</p></div>
        <button type="button" onClick={onBack} style={{ padding: '10px 16px', border: '1px solid #2b6cb0', borderRadius: '8px', background: 'white', color: '#1f5aa6', fontWeight: 700, cursor: 'pointer' }}>← Quay lại</button>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(240px, 340px))', gap: '16px', padding: '18px', background: '#f8fafc', border: '1px solid #dbe3ef', borderRadius: '10px' }}>
        <label style={{ display: 'grid', gap: '7px', color: '#334155', fontWeight: 700 }}>Học kỳ nguồn<select value={sourceId} onChange={(event) => { setSourceId(event.target.value); setTargetId(''); setPreview(null); }} style={selectStyle}><option value="">Chọn Học kỳ 2</option>{sourceTerms.map((term) => <option key={term.ThoiGianID} value={term.ThoiGianID}>{term.TenNam} - {term.TenKy}</option>)}</select></label>
        <label style={{ display: 'grid', gap: '7px', color: '#334155', fontWeight: 700 }}>Học kỳ đích<select value={targetId} onChange={(event) => { setTargetId(event.target.value); loadPreview(sourceId, event.target.value); }} style={selectStyle}><option value="">Chọn Học kỳ 1 năm kế tiếp</option>{targetTerms.map((term) => <option key={term.ThoiGianID} value={term.ThoiGianID}>{term.TenNam} - {term.TenKy}</option>)}</select></label>
      </section>
      <div style={{ marginTop: '12px' }}><button type="button" onClick={createNextSchoolYear} disabled={creatingYear || !isHocKy2(selectedSource)} style={{ padding: '10px 15px', border: '1px solid #7c3aed', borderRadius: '8px', color: '#6d28d9', background: 'white', fontWeight: 700, cursor: creatingYear ? 'wait' : 'pointer', opacity: isHocKy2(selectedSource) ? 1 : 0.6 }}>{creatingYear ? 'Đang tạo...' : 'Tạo năm học kế tiếp'}</button></div>

      {loading ? <p style={{ color: '#64748b' }}>Đang kiểm tra điều kiện lên lớp...</p> : !preview && <p style={{ color: '#64748b', marginTop: '20px' }}>Chọn Học kỳ 1 của năm học kế tiếp để xem toàn bộ lớp thuộc Học kỳ 2 nguồn.</p>}{preview && <>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))', gap: '14px', margin: '20px 0' }}>
          {statLabels.map(([label, value, color]) => <div key={label} style={{ border: '1px solid #dbe3ef', borderRadius: '10px', padding: '16px', background: 'white' }}><div style={{ color: '#64748b', fontSize: '13px' }}>{label}</div><strong style={{ display: 'block', color, fontSize: '25px', marginTop: '4px' }}>{value}</strong></div>)}
        </section>
        <div style={{ border: '1px solid #dbe3ef', borderRadius: '10px', overflow: 'hidden', background: 'white' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#eef5ff', color: '#1a365d' }}>{tableHeaders.map((text) => <th key={text} style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dbe3ef' }}>{text}</th>)}</tr></thead><tbody>{preview.classes.map((item) => <tr key={item.LopID}><td style={{ padding: '12px', borderBottom: '1px solid #edf2f7', fontWeight: 700 }}>{item.TenLop}</td><td style={{ padding: '12px', borderBottom: '1px solid #edf2f7' }}>{item.TenKhoi}</td><td style={{ padding: '12px', borderBottom: '1px solid #edf2f7' }}>{item.TongSo}</td><td style={{ padding: '12px', borderBottom: '1px solid #edf2f7', color: '#166534' }}>{item.DuDieuKien || 0}</td><td style={{ padding: '12px', borderBottom: '1px solid #edf2f7', color: '#b45309' }}>{item.OLaLop || 0}</td><td style={{ padding: '12px', borderBottom: '1px solid #edf2f7' }}>{item.TotNghiep || 0}</td></tr>)}</tbody></table></div>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}><button type="button" onClick={() => setConfirming(true)} disabled={!preview.totals.tongSo} style={{ padding: '12px 20px', border: 'none', borderRadius: '8px', background: '#1f5aa6', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: preview.totals.tongSo ? 1 : 0.6 }}>Lên lớp toàn bộ học sinh</button></div>
      </>}

      {result && <section style={{ marginTop: '20px', padding: '18px', borderRadius: '10px', background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#166534' }}><strong>{result.message}</strong><p style={{ marginBottom: 0 }}>Đã lên lớp: {result.promoted} · Ở lại: {result.retained} · Hoàn thành: {result.graduated} · Lớp mới tạo: {result.createdClasses} · Lớp cũ đã xóa: {result.deletedOldClasses || 0}</p></section>}
      {confirming && <div style={{ position: 'fixed', inset: 0, zIndex: 1500, display: 'grid', placeItems: 'center', padding: '20px', background: 'rgba(15,23,42,0.45)' }}><section role="dialog" aria-modal="true" style={{ width: 'min(480px, 100%)', padding: '24px', borderRadius: '12px', background: 'white', boxShadow: '0 24px 50px rgba(15,23,42,0.3)' }}><h3 style={{ marginTop: 0, color: '#1a365d' }}>Xác nhận lên lớp</h3><p style={{ color: '#475569', lineHeight: 1.6 }}>Hệ thống sẽ tạo lớp của năm học mới, sao lưu lớp cũ vào học bạ và chuyển học sinh có điểm trung bình chung từ <strong>5.0</strong> trở lên. Thao tác này không thể hoàn tác tự động.</p><div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}><button type="button" onClick={() => setConfirming(false)} disabled={processing} style={{ padding: '10px 15px', border: '1px solid #94a3b8', background: 'white', borderRadius: '7px', cursor: 'pointer' }}>Hủy</button><button type="button" onClick={promote} disabled={processing} style={{ padding: '10px 15px', border: 'none', background: '#b91c1c', color: 'white', borderRadius: '7px', cursor: 'pointer', fontWeight: 700 }}>{processing ? 'Đang thực hiện...' : 'Xác nhận lên lớp'}</button></div></section></div>}
    </div>
  );
}
