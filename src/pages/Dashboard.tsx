import React, { useEffect, useState } from 'react';
import '../index.css';

interface SurveyResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  line_id: string;
  university: string;
  year_of_study: string;
  graduated_major: string;
  interested_major: string;
  pdf_file_path: string | null;
}

function Dashboard() {
  const [data, setData] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Define the correct 4-digit PIN here
  const CORRECT_PIN = '9996';

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === CORRECT_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
      fetchDashboardData();
    } else {
      setPinError(true);
      setPin('');
    }
  };

  const fetchDashboardData = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/survey')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(responseData => {
        if (responseData.success) {
          setData(responseData.data);
        } else {
          setError(responseData.message || 'Failed to fetch data');
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // Wait for user to authenticate first
  }, []);

  const openPdf = (path: string) => {
    // path typically looks like "uploads\pdf_file-169...pdf"
    // Adjust to forward slashes for matching the url
    const normalizedPath = path.replace(/\\/g, '/');
    window.open(`http://localhost:5000/${normalizedPath}`, '_blank');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <form onSubmit={handlePinSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 max-w-sm w-full animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">เข้าสู่ระบบ Dashboard</h2>
            <p className="text-sm text-slate-500 mt-2">กรุณาใส่รหัสผ่าน 4 หลัก เพื่อเข้าดูข้อมูล</p>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ''); // Allow only numbers
                  setPin(val);
                  setPinError(false);
                }}
                className={`w-full text-center tracking-[1em] text-2xl bg-slate-50 border ${pinError ? 'border-red-500 focus:ring-red-500/30' : 'border-slate-300 focus:ring-blue-500/30 focus:border-blue-500'} rounded-xl px-4 py-4 focus:outline-none focus:ring-2 transition-all shadow-sm`}
                placeholder="••••"
                autoFocus
              />
              {pinError && <p className="text-red-500 text-sm text-center mt-2 animate-bounce">รหัสผ่านไม่ถูกต้อง</p>}
            </div>
            <button
              type="submit"
              disabled={pin.length !== 4}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ยืนยันรหัสผ่าน
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-xl text-slate-600 font-semibold animate-pulse">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-200">
          <h2 className="text-lg font-bold mb-1">เกิดข้อผิดพลาด</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-12 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-slate-500">สรุปข้อมูลผู้ตอบแบบสำรวจ</p>
          </div>
          <div className="bg-white px-6 py-4 sm:py-3 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center w-full sm:w-auto">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-0">จำนวนผู้ตอบทั้งหมด</span>
            <span className="text-4xl sm:text-3xl font-black text-slate-800">{data.length} <span className="text-xl sm:text-lg font-medium text-slate-400">คน</span></span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          
          {/* Mobile & Tablet Card View (< lg) */}
          <div className="lg:hidden divide-y divide-slate-100">
            {data.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                ยังไม่มีข้อมูลผู้ตอบแบบสำรวจ
              </div>
            ) : (
              data.map((item) => (
                <div key={item.id} className="p-5 sm:p-6 flex flex-col gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div>
                      <div className="font-bold text-slate-800 text-lg sm:text-lg">{item.first_name} {item.last_name} <span className="text-sm font-normal text-slate-500 ml-2">ID: {item.id}</span></div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 whitespace-nowrap self-start">
                      {item.interested_major}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm bg-white sm:bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm sm:shadow-none">
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase mb-1.5">การศึกษา</span>
                      <div className="text-slate-800 font-medium">{item.university}</div>
                      <div className="text-slate-500 text-xs mt-0.5">ชั้นปีที่ {item.year_of_study}</div>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase mb-1.5">การติดต่อ</span>
                      <div className="text-slate-700 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          <span className="break-all">{item.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                          <span>{item.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#00B900] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.101.258.048.66.023.931-.039.408-.256 1.542-.314 1.849-.079.418.358.587.654.402 1.579-1.025 5.558-3.957 8.019-6.99.103-.12.21-.242.316-.367C22.695 14.155 24 12.356 24 10.304z" /></svg>
                          <span>{item.line_id}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    {item.pdf_file_path ? (
                      <button
                        onClick={() => openPdf(item.pdf_file_path as string)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition-colors shadow-sm w-full sm:w-auto"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        ดูไฟล์ PDF
                      </button>
                    ) : (
                      <span className="text-sm text-slate-400 italic py-2 w-full sm:w-auto text-center">ไม่มีไฟล์เอกสาร</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (>= lg) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-sm">
                  <th className="py-4 px-6 font-semibold">ID</th>
                  <th className="py-4 px-6 font-semibold">ชื่อ - นามสกุล</th>
                  <th className="py-4 px-6 font-semibold">การศึกษา</th>
                  <th className="py-4 px-6 font-semibold">อีเมล</th>
                  <th className="py-4 px-6 font-semibold">เบอร์โทร</th>
                  <th className="py-4 px-6 font-semibold">Line ID</th>
                  <th className="py-4 px-6 font-semibold">สาขาที่สนใจ</th>
                  <th className="py-4 px-6 font-semibold text-center">เอกสาร PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      ยังไม่มีข้อมูลผู้ตอบแบบสำรวจ
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-6 text-sm text-slate-500 font-medium">
                        {item.id}
                      </td>
                      <td className="py-3 px-6">
                        <div className="font-semibold text-slate-800">{item.first_name} {item.last_name}</div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="text-sm text-slate-800">{item.university}</div>
                        <div className="text-xs text-slate-500 mt-0.5">ปี {item.year_of_study}</div>
                      </td>
                      <td className="py-3 px-6 text-sm text-slate-800">
                        {item.email}
                      </td>
                      <td className="py-3 px-6 text-sm text-slate-800">
                        {item.phone}
                      </td>
                      <td className="py-3 px-6 text-sm text-slate-800">
                        {item.line_id}
                      </td>
                      <td className="py-3 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.interested_major}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        {item.pdf_file_path ? (
                          <button
                            onClick={() => openPdf(item.pdf_file_path as string)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View PDF
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">ไม่มีไฟล์แนบ</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
