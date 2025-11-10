import { useState, useEffect, useMemo } from 'react';
import { Send, Mail, User, MessageSquare } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ===== Config =====
const EMAIL_API = 'https://prn232.freeddns.org/utility-service/api/Email/send';
const DEST_EMAIL = 'evm.system.fpt@gmail.com'; // <-- đổi thành email nhận phản hồi của bạn

/** ---------- React Bits Background ----------
 *  - Aurora gradient mờ chạy chậm (CSS only)
 *  - "Bits" là các hạt tròn lơ lửng, nhẹ, ko tốn CPU
 *  - Không cần lib ngoài, không TypeScript
 */
function ReactBitsBackground({ bits = 24 }) {
  const items = useMemo(() => {
    // random vị trí/kích thước/tốc độ cho mỗi "bit"
    return Array.from({ length: bits }).map((_, i) => ({
      id: i,
      size: Math.floor(Math.random() * 28) + 12, // 12 - 40 px
      top: Math.random() * 100, // %
      left: Math.random() * 100, // %
      // mỗi bit có 1 thời lượng & độ trễ animation khác nhau
      duration: 18 + Math.random() * 16, // 18 - 34s
      delay: Math.random() * 8, // 0 - 8s
      blur: Math.random() > 0.6 ? 6 : 0 // một phần có blur nhẹ
    }));
  }, [bits]);

  // CSS động cho keyframes, chèn một lần
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes floaty {
        0%   { transform: translateY(0px) translateX(0px) scale(1);   }
        50%  { transform: translateY(-30px) translateX(10px) scale(1.06); }
        100% { transform: translateY(0px) translateX(0px) scale(1);   }
      }
      @keyframes sway {
        0%   { transform: translateX(-10px) }
        50%  { transform: translateX(10px) }
        100% { transform: translateX(-10px) }
      }
      @keyframes auroraShift {
        0% { transform: translate(-10%, -10%) rotate(0deg); }
        50% { transform: translate(10%, 10%) rotate(15deg); }
        100% { transform: translate(-10%, -10%) rotate(0deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Aurora layers */}
      <div
        className="absolute -inset-40 opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(60% 60% at 15% 10%, rgba(56,189,248,0.35), transparent 60%), radial-gradient(50% 50% at 85% 10%, rgba(59,130,246,0.35), transparent 60%), radial-gradient(60% 60% at 20% 90%, rgba(34,197,94,0.25), transparent 60%), radial-gradient(55% 55% at 90% 85%, rgba(168,85,247,0.28), transparent 60%)',
          animation: 'auroraShift 22s ease-in-out infinite'
        }}
      />
      {/* Grid subtle */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(2,6,23,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(2,6,23,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      {/* Bits */}
      {items.map(bit => (
        <span
          key={bit.id}
          className="absolute rounded-full bg-gradient-to-br from-cyan-300/70 to-blue-500/70 dark:from-cyan-200/60 dark:to-blue-400/60"
          style={{
            width: bit.size,
            height: bit.size,
            top: `${bit.top}%`,
            left: `${bit.left}%`,
            filter: bit.blur ? `blur(${bit.blur}px)` : 'none',
            animation: `floaty ${bit.duration}s ease-in-out ${bit.delay}s infinite`,
            boxShadow: '0 0 12px rgba(59,130,246,0.35), inset 0 0 8px rgba(255,255,255,0.25)'
          }}
        />
      ))}
      {/* Glow footer */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-blue-50/70 to-transparent dark:from-slate-900/60" />
    </div>
  );
}

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

    // giả lập chờ nhẹ như code gốc
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
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* React Bits Background */}
      <ReactBitsBackground bits={28} />

      {/* Toastify container */}
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />

      <div className="relative w-full max-w-2xl">
        {/* card shadow glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-indigo-500/20 blur-xl rounded-3xl" />
        <div className="relative bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white relative overflow-hidden">
            {/* gentle beams */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 6px)'
              }}
            />
            <div className="relative flex items-center justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <Mail className="w-8 h-8" />
              </div>
            </div>
            <h1 className="relative text-3xl font-bold text-center mb-2 drop-shadow-sm">
              Gửi Ý Kiến & Khiếu Nại
            </h1>
            <p className="relative text-center text-blue-100">
              Chúng tôi luôn lắng nghe ý kiến của bạn
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2 group">
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <User className="w-4 h-4 mr-2 text-blue-600" />
                Họ và Tên
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-white/10 rounded-lg bg-white/60 dark:bg-slate-900/40 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none transition-all duration-300 group-hover:border-gray-300 dark:placeholder:text-slate-400"
                placeholder="Nhập họ tên của bạn"
              />
            </div>

            <div className="space-y-2 group">
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <Mail className="w-4 h-4 mr-2 text-blue-600" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-white/10 rounded-lg bg-white/60 dark:bg-slate-900/40 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none transition-all duration-300 group-hover:border-gray-300 dark:placeholder:text-slate-400"
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2 group">
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                Tiêu Đề
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-white/10 rounded-lg bg-white/60 dark:bg-slate-900/40 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none transition-all duration-300 group-hover:border-gray-300 dark:placeholder:text-slate-400"
                placeholder="Tiêu đề ý kiến/khiếu nại"
              />
            </div>

            <div className="space-y-2 group">
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                Nội Dung
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-white/10 rounded-lg bg-white/60 dark:bg-slate-900/40 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none transition-all duration-300 resize-none group-hover:border-gray-300 dark:placeholder:text-slate-400"
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
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
              <div className="bg-green-50/80 dark:bg-emerald-900/30 border-2 border-green-200/70 dark:border-emerald-700/40 rounded-lg p-4 text-center animate-pulse">
                <p className="text-green-700 dark:text-emerald-200 font-medium">
                  Cảm ơn bạn đã gửi ý kiến! Chúng tôi sẽ phản hồi sớm nhất.
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
          Mọi thông tin của bạn sẽ được bảo mật tuyệt đối
        </p>
      </div>
    </div>
  );
}

export default Feedbacks;
