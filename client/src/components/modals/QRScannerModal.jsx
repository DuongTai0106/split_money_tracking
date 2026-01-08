import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { X, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const QRScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState("");
  const codeReader = useRef(new BrowserMultiFormatReader());
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Bắt đầu scan
      setScanning(true);
      codeReader.current
        .decodeFromVideoDevice(null, videoRef.current, (result, err) => {
          if (result) {
            // Success
            console.log("QR Code:", result.getText());
            setScanning(false);
            onScanSuccess(result.getText());
            codeReader.current.reset(); // Stop camera
            onClose();
          }
          if (err && !(err instanceof NotFoundException)) {
            // Ignore NotFoundException (scanning...)
            console.error(err);
          }
        })
        .catch((err) => {
          console.error("Camera Error:", err);
          setError("Không thể truy cập Camera. Vui lòng cấp quyền!");
        });
    } else {
      // Tắt camera khi đóng modal
      setScanning(false);
      codeReader.current.reset();
    }

    // Cleanup
    return () => {
      codeReader.current.reset();
    };
  }, [isOpen, onClose, onScanSuccess]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-md h-full md:h-auto flex flex-col bg-black md:bg-[#1c2e26] md:rounded-3xl overflow-hidden"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Camera size={20} className="text-[#34d399]" />
                Quét mã QR
              </h3>
              <button
                onClick={onClose}
                className="p-2 bg-black/40 rounded-full text-white hover:bg-black/60"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative flex-1 bg-black flex items-center justify-center">
              {error ? (
                <div className="text-red-500 text-center px-4">
                  <p>{error}</p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-[#2d4a3e] rounded-lg text-white"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    style={{ transform: "none" }} // Fix inverted camera
                  />
                  {/* Overlay Frame */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-[#34d399] rounded-xl relative">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#34d399] -mt-1 -ml-1"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#34d399] -mt-1 -mr-1"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#34d399] -mb-1 -ml-1"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#34d399] -mb-1 -mr-1"></div>
                      {/* Scanning Line Animation */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#34d399] animate-scan opacity-50 shadow-[0_0_10px_#34d399]"></div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Prompt */}
            <div className="p-6 bg-[#0b1411] text-center border-t border-[#2d4a3e]">
              <p className="text-gray-400 text-sm">
                Di chuyển camera đến mã QR của nhóm để quét
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QRScannerModal;
