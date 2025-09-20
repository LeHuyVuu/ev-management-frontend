import React, { useState } from "react";

export default function ContractViewer() {
    const [showViewer, setShowViewer] = useState(false);
    const [fileContent, setFileContent] = useState("");

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setFileContent(ev.target.result);
                setShowViewer(true);
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
            {/* Upload + View controls */}
            <div className="flex gap-3">
                <label className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                    Upload File
                    <input
                        type="file"
                        accept=".txt,.doc,.docx,.pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                </label>
                <button
                    onClick={() => setShowViewer(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
                >
                    View
                </button>
            </div>

            {/* Contract Viewer */}
            {showViewer && (
                <div className="mt-6 w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-gray-200">
                    <div className="flex justify-between items-center px-4 py-2 border-b">
                        <h2 className="text-lg font-semibold">Nội dung hợp đồng</h2>
                        <button
                            onClick={() => setShowViewer(false)}
                            className="text-sm text-red-500 hover:text-red-700"
                        >
                            Đóng
                        </button>
                    </div>
                    <div className="p-4 h-[70vh] overflow-y-auto whitespace-pre-wrap text-sm text-gray-800">
                        {fileContent || "Nội dung hợp đồng sẽ hiển thị ở đây sau khi tải lên hoặc bấm View."}
                    </div>
                    <div className="flex justify-end gap-2 px-4 py-2 border-t">
                        <button className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300">Xem</button>
                        <button className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300">Tải xuống</button>
                        <button className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300">In</button>
                    </div>
                </div>
            )}
        </div>
    );
}
