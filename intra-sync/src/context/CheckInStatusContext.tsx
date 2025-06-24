import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CheckInStatus {
  checkedIn: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
}

interface CheckInStatusContextType extends CheckInStatus {
  setStatus: (status: CheckInStatus) => void;
  refreshStatus: () => Promise<void>;
}

const CheckInStatusContext = createContext<CheckInStatusContextType | undefined>(undefined);

export const CheckInStatusProvider = ({ children }: { children: ReactNode }) => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);

  const setStatus = (status: CheckInStatus) => {
    setCheckedIn(status.checkedIn);
    setCheckInTime(status.checkInTime);
    setCheckOutTime(status.checkOutTime);
  };

  const refreshStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not logged in');
      const res = await fetch('/api/checkin/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStatus({
        checkedIn: data.checkedIn,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
      });
    } catch {
      setStatus({ checkedIn: false, checkInTime: null, checkOutTime: null });
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  return (
    <CheckInStatusContext.Provider value={{ checkedIn, checkInTime, checkOutTime, setStatus, refreshStatus }}>
      {children}
    </CheckInStatusContext.Provider>
  );
};

export const useCheckInStatus = () => {
  const ctx = useContext(CheckInStatusContext);
  if (!ctx) throw new Error('useCheckInStatus must be used within CheckInStatusProvider');
  return ctx;
}; 