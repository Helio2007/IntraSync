import { useEffect, useState } from "react";
import QRScanner from "@/components/QRScanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCheckInStatus } from "@/context/CheckInStatusContext";
import { useNavigate } from "react-router-dom";

const COOLDOWN_SECONDS = 5;

export default function CheckInPage() {
  const { checkedIn, checkInTime, checkOutTime, setStatus, refreshStatus } = useCheckInStatus();
  const [error, setError] = useState("");
  const [qrResult, setQrResult] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    refreshStatus();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleScan = async (result: string) => {
    if (cooldown > 0) return;
    setQrResult(result);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not logged in");
      const endpoint = checkedIn ? "/api/checkin/out" : "/api/checkin/in";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Check-in/out failed");
      const data = await res.json();
      setStatus({ checkedIn: !!data.checkedIn, checkInTime: data.checkInTime, checkOutTime: data.checkOutTime });
      setCooldown(COOLDOWN_SECONDS);
      refreshStatus();
    } catch (err: any) {
      setError(err.message || "QR check-in/out failed");
      refreshStatus();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen p-4 flex flex-col">
      <Button variant="ghost" className="w-fit mb-4" onClick={() => navigate("/")}>{"<- Back"}</Button>
      <Card className="mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-center text-blue-500">QR Check-In/Out</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600 mb-4">Scan the QR code below to {checkedIn ? "check out" : "check in"}.</p>
          {cooldown > 0 ? (
            <div className="text-center text-sm text-blue-600 mb-2">Please wait {cooldown} second{cooldown !== 1 ? "s" : ""} before scanning again.</div>
          ) : (
            <QRScanner onScan={handleScan} />
          )}
          {checkedIn && checkInTime && (
            <div className="text-center text-green-600 mt-2">You are checked in since {new Date(checkInTime).toLocaleTimeString()}.</div>
          )}
          {!checkedIn && checkOutTime && (
            <div className="text-center text-gray-500 mt-2">Last checked out at {new Date(checkOutTime).toLocaleTimeString()}.</div>
          )}
          {qrResult && <div className="text-center text-blue-600 mt-2">QR Result: {qrResult}</div>}
          {error && <div className="text-center text-red-600 mt-2">{error}</div>}
        </CardContent>
      </Card>
    </div>
  );
} 