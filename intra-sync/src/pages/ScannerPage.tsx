import { useState } from "react";
import QRScanner from "@/components/QRScanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleScan = async (result: string) => {
    setScanResult(result);
    setScanning(false);
    setError("");
    // Here you can add check-in/out logic if needed
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen p-4 flex flex-col">
      <Button variant="ghost" className="w-fit mb-4" onClick={() => navigate("/")}>{"<- Back"}</Button>
      <Card className="mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-center text-blue-500">Position the QR code within the frame to scan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <div className="relative mx-auto w-72 h-72 bg-black rounded-2xl overflow-hidden mb-4">
              {/* Styled frame */}
              <div className="absolute inset-4 border-2 border-white rounded-xl">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-lg"></div>
              </div>
              {/* QR Scanner */}
              {scanning && (
                <div className="absolute inset-0 z-10">
                  <QRScanner onScan={handleScan} onError={setError} />
                </div>
              )}
            </div>
            <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 mb-2" onClick={() => setScanning(true)}>
              Start Scanning
            </Button>
            {scanResult && <div className="text-center text-green-600 mt-2">QR Result: {scanResult}</div>}
            {error && <div className="text-center text-red-600 mt-2">{error}</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 