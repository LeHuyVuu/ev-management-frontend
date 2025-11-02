import { useState } from 'react';
import { Send, Mail, User, MessageSquare } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ===== Config =====
const EMAIL_API = 'https://prn232.freeddns.org/utility-service/api/Email/send';
const DEST_EMAIL = 'evm.system.fpt@gmail.com'; // <-- đổi thành email nhận phản hồi của bạn

function Feedbacks() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const payload = {
        toEmail: DEST_EMAIL,
        subject: formData.subject,
        content: `
          <p><b>Tên:</b> ${formData.name}</p>
          <p><b>Email:</b> ${formData.email}</p>
          <p><b>Nội dung:</b></p>
          <p>${(formData.message || '').replace(/\n/g, '<br/>')}</p>
        `
      };

      const res = await fetch(EMAIL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let msg = 'Gửi email thất bại';
        try {
          const j = await res.json();
          if (j && j.message) msg = j.message;
        } catch {}
        throw new Error(msg);
      }

      toast.success('📧 Gửi email thành công! Chúng tôi sẽ phản hồi sớm nhất.');
      setSubmitted(true);
    } catch (err) {
      toast.error('❌ ' + (err?.message || 'Gửi email thất bại. Vui lòng thử lại!'));
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      {/* Toastify container */}
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />

      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 hover:shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <Mail className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">Gửi Ý Kiến & Khiếu Nại</h1>
            <p className="text-center text-blue-100">Chúng tôi luôn lắng nghe ý kiến của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2 group">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 mr-2 text-blue-600" />
                Họ và Tên
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 group-hover:border-gray-300"
                placeholder="Nhập họ tên của bạn"
              />
            </div>

            <div className="space-y-2 group">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 group-hover:border-gray-300"
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2 group">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                Tiêu Đề
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 group-hover:border-gray-300"
                placeholder="Tiêu đề ý kiến/khiếu nại"
              />
            </div>

            <div className="space-y-2 group">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                Nội Dung
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 resize-none group-hover:border-gray-300"
                placeholder="Mô tả chi tiết ý kiến hoặc khiếu nại của bạn..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || submitted}
              className={`w-full py-4 rounded-lg font-semibold text-white flex items-center justify-center space-x-2 transition-all duration-300 transform ${
                submitted
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:scale-[1.02] active:scale-[0.98]'
              } disabled:opacity-70 shadow-lg hover:shadow-xl`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : submitted ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Đã gửi thành công!</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Gửi Ý Kiến</span>
                </>
              )}
            </button>
          </form>

          {submitted && (
            <div className="px-8 pb-8 -mt-2">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center animate-pulse">
                <p className="text-green-700 font-medium">
                  Cảm ơn bạn đã gửi ý kiến! Chúng tôi sẽ phản hồi sớm nhất.
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Mọi thông tin của bạn sẽ được bảo mật tuyệt đối
        </p>
      </div>
    </div>
  );
}

export default Feedbacks;
