import React, { useState } from 'react';
import '../index.css';

function SurveyForm() {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    line_id: '',
    university: '',
    year_of_study: '',
    graduated_major: '',
    interested_major: '',
    other_interested_major: ''
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Process phone number input to only allow digits and max 10 chars
    if (name === 'phone') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, [name]: digitsOnly });
      if (errors[name]) setErrors({ ...errors, [name]: '' });
      return;
    }

    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) newErrors.first_name = 'กรุณากรอกชื่อจริง';
    if (!formData.last_name.trim()) newErrors.last_name = 'กรุณากรอกนามสกุล';
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'กรุณากรอกเบอร์ติดต่อ';
    } else if (formData.phone.length !== 10) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก';
    }
    
    if (!formData.line_id.trim()) newErrors.line_id = 'กรุณากรอก Line ID';
    
    if (!formData.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    
    if (!formData.university.trim()) newErrors.university = 'กรุณากรอกมหาวิทยาลัยที่ศึกษา';
    if (!formData.year_of_study) newErrors.year_of_study = 'กรุณาเลือกระดับชั้นปี';
    
    if (!formData.interested_major) {
      newErrors.interested_major = 'กรุณาเลือกสาขาที่สนใจ';
    } else if (formData.interested_major === 'other' && !formData.other_interested_major.trim()) {
      newErrors.other_interested_major = 'กรุณาระบุสาขาที่คุณสนใจ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'interested_major' && value === 'other') {
           submitData.append(key, formData.other_interested_major);
        } else if (key !== 'other_interested_major') {
           submitData.append(key, value);
        }
      });
      if (pdfFile) {
        submitData.append('pdf_file', pdfFile);
      }

      const response = await fetch('http://localhost:5000/api/survey', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitting(false);
        setIsSuccess(true);
        // Reset after 3 seconds
        setTimeout(() => setIsSuccess(false), 3000);
        
        (e.target as HTMLFormElement).reset();
        setPdfFile(null);
        setFormData({
          email: '',
          first_name: '',
          last_name: '',
          phone: '',
          line_id: '',
          university: '',
          year_of_study: '',
          graduated_major: '',
          interested_major: '',
          other_interested_major: ''
        });
      } else {
        throw new Error(data.message || 'Failed to submit survey');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit the form. Please make sure the server is running and try again.');
      setIsSubmitting(false);
    }
  };

  const getInputClass = (fieldName: string) => {
    const base = "w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all shadow-sm";
    if (errors[fieldName]) {
      return `${base} bg-red-50 border border-red-500 text-red-900 focus:ring-red-200 placeholder-red-300`;
    }
    return `${base} bg-slate-50 border border-slate-300 text-slate-800 focus:ring-blue-500/30 focus:border-blue-500 placeholder-slate-400 hover:border-slate-400`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-100 text-slate-800 font-sans selection:bg-blue-200 selection:text-blue-900 relative">
      <div className="w-full max-w-4xl relative">
        
        {/* Shadow behind the card */}
        <div className="absolute -inset-1 bg-slate-200 rounded-3xl blur-md opacity-50"></div>

        <div className="relative bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 border-b-2 border-slate-200 inline-block pb-2 px-6">
              แบบสำรวจ
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              กรุณากรอกข้อมูลของท่านเพื่อดำเนินการต่อ
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {/* Group: Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">ชื่อ <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={getInputClass('first_name')}
                  placeholder="ชื่อจริง"
                />
                {errors.first_name && <p className="text-red-500 text-xs ml-1">{errors.first_name}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">นามสกุล <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={getInputClass('last_name')}
                  placeholder="นามสกุล"
                />
                {errors.last_name && <p className="text-red-500 text-xs ml-1">{errors.last_name}</p>}
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">เบอร์ติดต่อ <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={getInputClass('phone')}
                  placeholder="เบอร์โทรศัพท์ (10 หลัก)"
                />
                {errors.phone && <p className="text-red-500 text-xs ml-1">{errors.phone}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">Line ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="line_id"
                  value={formData.line_id}
                  onChange={handleChange}
                  className={getInputClass('line_id')}
                  placeholder="ไอดีไลน์"
                />
                {errors.line_id && <p className="text-red-500 text-xs ml-1">{errors.line_id}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">อีเมล <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={getInputClass('email')}
                  placeholder="อีเมลของคุณ"
                />
                {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email}</p>}
              </div>
            </div>

            {/* University */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">มหาวิทยาลัยที่ศึกษา <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className={getInputClass('university')}
                placeholder="ชื่อมหาวิทยาลัย"
              />
              {errors.university && <p className="text-red-500 text-xs ml-1">{errors.university}</p>}
            </div>

            {/* Year of study */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Year of study */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">ชั้นปีที่ศึกษา <span className="text-red-500">*</span></label>
                <select
                  name="year_of_study"
                  value={formData.year_of_study}
                  onChange={handleChange}
                  className={getInputClass('year_of_study')}
                >
                  <option value="" disabled>เลือกระดับชั้นปี</option>
                  <option value="1">ปีที่ 1</option>
                  <option value="2">ปีที่ 2</option>
                  <option value="3">ปีที่ 3</option>
                  <option value="4">ปีที่ 4 / ปีที่ 5</option>
                  <option value="graduated">จบการศึกษาแล้ว</option>
                  <option value="other">อื่นๆ</option>
                </select>
                {errors.year_of_study && <p className="text-red-500 text-xs ml-1">{errors.year_of_study}</p>}
              </div>

              {/* Graduated Major */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">สาขาที่จบมา <span className="text-gray-400 font-normal">(ถ้ามี)</span></label>
                <input
                  type="text"
                  name="graduated_major"
                  value={formData.graduated_major}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder-slate-400 text-slate-800 shadow-sm hover:border-slate-400"
                  placeholder="เช่น วิทยาการคอมพิวเตอร์"
                />
              </div>
            </div>

            {/* Interested Major */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 ml-1">สาขาที่สนใจทำ <span className="text-red-500">*</span></label>
                <select
                  name="interested_major"
                  value={formData.interested_major}
                  onChange={handleChange}
                  className={getInputClass('interested_major')}
                >
                  <option value="" disabled>เลือกสาขาที่สนใจ</option>
                  <option value="บัญชี">บัญชี</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="Web Developer">Web Developer (Dev web)</option>
                  <option value="other">อื่นๆ (โปรดระบุ)</option>
                </select>
                {errors.interested_major && <p className="text-red-500 text-xs ml-1">{errors.interested_major}</p>}
              </div>

              {formData.interested_major === 'other' && (
                <div className="space-y-1 animate-fade-in pl-1">
                  <label className="text-sm font-semibold text-gray-700 ml-1">ระบุสาขาที่สนใจ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="other_interested_major"
                    value={formData.other_interested_major}
                    onChange={handleChange}
                    className={getInputClass('other_interested_major')}
                    placeholder="ระบุสาขาที่คุณสนใจ"
                  />
                  {errors.other_interested_major && <p className="text-red-500 text-xs ml-1">{errors.other_interested_major}</p>}
                </div>
              )}
            </div>

            {/* PDF Upload */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 ml-1">อัพโหลดไฟล์ (PDF เท่านั้น) <span className="text-gray-400 font-normal">(ถ้ามี)</span></label>
              <input
                type="file"
                name="pdf_file"
                accept="application/pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setPdfFile(e.target.files[0]);
                  } else {
                    setPdfFile(null);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 text-slate-800 shadow-sm hover:border-slate-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 bg-slate-800 hover:bg-slate-900 text-white font-bold tracking-wide py-4 px-4 rounded-xl shadow-md shadow-slate-800/20 transform transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex justify-center items-center"
            >
              {isSubmitting ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'ส่งแบบสำรวจ'
              )}
            </button>

          </form>

        </div>
      </div>

      {/* Success Modal Overlay */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full border border-slate-100 relative">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200 shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-xl font-bold text-center text-green-600 mb-2">ส่งข้อมูลสำเร็จ!</h2>
            <p className="text-center text-slate-600 text-sm mb-6">บันทึกข้อมูลแบบสำรวจของคุณเรียบร้อยแล้ว ขอขอบคุณที่ให้ความร่วมมือครับ</p>
            <button 
              onClick={() => setIsSuccess(false)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* Error Modal Overlay */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full border border-slate-100 relative">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 mb-2">ข้อมูลไม่ครบถ้วน</h3>
            <p className="text-center text-slate-600 text-sm mb-6">กรุณาตรวจสอบและกรอกข้อมูลในช่องสีแดงให้ครบถ้วนและถูกต้อง</p>
            <button 
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-xl transition-colors"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SurveyForm;
