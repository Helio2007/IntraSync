import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: any) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onError }) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [loading, setLoading] = useState(true);
  const uniqueId = 'qr-reader-' + Math.random().toString(36).substr(2, 9);

  useEffect(() => {
    let isMounted = true;
    if (qrRef.current) {
      const html5QrCode = new Html5Qrcode(uniqueId);
      html5QrCodeRef.current = html5QrCode;
      html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          if (isMounted && decodedText) {
            onScan(decodedText);
            if (html5QrCode.getState() === 2) {
              html5QrCode.stop().catch(() => {});
            }
          }
        },
        (error) => {
          // Only call onError for real errors, not for NotFoundException (no QR code found)
          if (typeof error === 'string' && error.includes('NotFoundException')) {
            // Do nothing, keep scanning
            return;
          }
          if (onError) onError(error);
        }
      ).then(() => {
        if (isMounted) setLoading(false);
      }).catch((err) => {
        if (onError) onError(err);
        if (isMounted) setLoading(false);
      });
      return () => {
        isMounted = false;
        if (html5QrCode.getState() === 2) {
          html5QrCode.stop().then(() => {
            html5QrCode.clear();
          }).catch(() => {});
        } else {
          html5QrCode.clear();
        }
      };
    }
  }, [onScan, onError, uniqueId]);

  return (
    <div style={{ width: 300, height: 300, margin: '0 auto' }}>
      <div id={uniqueId} ref={qrRef} style={{ width: '100%', height: '100%' }} />
      {loading && <div style={{ textAlign: 'center', marginTop: 16 }}>Ngarkim kamera...</div>}
    </div>
  );
};

export default QRScanner; 