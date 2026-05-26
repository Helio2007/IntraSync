"use client";

import { useState, useEffect } from "react";
import { Bell, Calendar, Home, QrCode, Settings, User, Clock, MapPin, Users, Plus, ChevronRight, Edit, Check, Trash2, Calendar as CalendarIcon, CheckCircle, Coffee, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Routes, Route, useNavigate } from "react-router-dom";
import CheckInPage from "@/pages/CheckInPage";
import ScannerPage from "@/pages/ScannerPage";
import QRScanner from "@/components/QRScanner";
import AuthModal from "@/components/ui/auth-modal";
import { getEvents, addEvent, updateEvent, deleteEvent } from "@/services/eventService";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";

function tagCompanyEvents(list: any[]) {
  return (list || []).map(e => ({
    ...e,
    isCompanyEvent: true,
    status: e.status || "scheduled",
  }));
}

function sortByTimeThenCompanyFirst(a: any, b: any) {
  if (!!a.isCompanyEvent !== !!b.isCompanyEvent) return a.isCompanyEvent ? -1 : 1;
  return (a.time || "").localeCompare(b.time || "");
}

function EventRow({ event, compact = false }: { event: any; compact?: boolean }) {
  const isCompany = !!event.isCompanyEvent;
  const isCompanyCompleted = isCompany && event.status === "completed";
  const bg = isCompany
    ? "bg-amber-50 border-2 border-amber-400"
    : event.type === "meeting"
      ? "bg-blue-50 border border-blue-100"
      : event.type === "task"
        ? "bg-green-50 border border-green-100"
        : "bg-purple-50 border border-purple-100";
  const bar = isCompany
    ? "bg-amber-500"
    : event.type === "meeting"
      ? "bg-blue-500"
      : event.type === "task"
        ? "bg-green-500"
        : "bg-purple-500";

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg ${bg}`}>
      <div className={`w-2 h-8 rounded flex-shrink-0 ${bar}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`font-medium ${isCompanyCompleted ? "line-through text-gray-500" : ""}`}>{event.title}</p>
          {isCompany && (
            <>
              <Badge className="bg-amber-600 text-white text-[10px] px-1.5 py-0">
                <Building2 className="w-3 h-3 mr-0.5 inline" />
                Company
              </Badge>
              {isCompanyCompleted && (
                <Badge className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0">Completed</Badge>
              )}
            </>
          )}
        </div>
        <p className="text-sm text-gray-600">{event.time}</p>
        {isCompany && event.location && (
          <p className="text-xs text-amber-800 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            {event.location}
          </p>
        )}
      </div>
      {!isCompany && event.type === "meeting" && <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      {!isCompany && event.type === "task" && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
      {!isCompany && event.type === "break" && <Coffee className="w-4 h-4 text-purple-500 flex-shrink-0" />}
      {isCompany && <Building2 className="w-5 h-5 text-amber-700 flex-shrink-0" />}
    </div>
  );
}

function HomePage({ isCheckedIn, checkInTime, hoursToday, error, onCheckInClick, events = [], companyEvents = [], setActiveTab, workStats }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysCompany = companyEvents.filter(e => e.date === todayStr).sort((a, b) => a.time.localeCompare(b.time));
  const todaysPersonal = events.filter(e => e.date === todayStr).sort((a, b) => a.time.localeCompare(b.time));
  const todaysAll = [...todaysCompany, ...todaysPersonal];

  const allForRecent = [...tagCompanyEvents(companyEvents), ...events];
  const recentEvent = allForRecent.length > 0
    ? [...allForRecent].sort((a, b) => {
        const ta = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
        const tb = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
        return tb - ta;
      })[0]
    : null;
  // For check-in/out, you may want to use a real check-in log if available. For now, show check-in status and time.

  return (
    <div className="p-4 space-y-6">
      <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{isCheckedIn ? "Checked In" : "Checked Out"}</h2>
              <p className="text-emerald-100">{isCheckedIn && checkInTime ? `Since ${new Date(checkInTime).toLocaleTimeString()}` : "Ready to start your day?"}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{hoursToday}</div>
              <div className="text-emerald-100">Hours Today</div>
            </div>
          </div>
          <Button
            className="w-full mt-4 bg-white text-emerald-600 hover:bg-gray-100"
            onClick={onCheckInClick}
          >
            {isCheckedIn ? "Check Out" : "Check In"}
          </Button>
          {error && <div className="text-red-200 mt-2 text-sm">{error}</div>}
        </CardContent>
      </Card>

      {/* Compact statistics bar */}
      {workStats && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-slate-50">
            <CardContent className="py-3 px-3">
              <p className="text-xs text-gray-500">Hours this week</p>
              <p className="text-sm font-semibold">
                {(workStats.hoursThisWeek?.hours ?? 0) > 0 &&
                  `${workStats.hoursThisWeek.hours}h `}
                {`${workStats.hoursThisWeek?.minutes ?? 0}m`}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-50">
            <CardContent className="py-3 px-3">
              <p className="text-xs text-gray-500">Days present</p>
              <p className="text-sm font-semibold">
                {workStats.daysPresent ?? 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-50">
            <CardContent className="py-3 px-3">
              <p className="text-xs text-gray-500">Tasks done</p>
              <p className="text-sm font-semibold">
                {workStats.tasksCompleted ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("scanner")}> 
          <CardContent className="p-4 text-center">
            <QrCode className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="font-medium">QR Scanner</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("agenda")}> 
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="font-medium">My Agenda</p>
          </CardContent>
        </Card>
      </div>

      {/* Company events today — highlighted for all employees */}
      {todaysCompany.length > 0 && (
        <Card className="border-2 border-amber-400 shadow-sm">
          <CardHeader className="pb-2 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardTitle className="flex items-center justify-between text-amber-900">
              <span className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-700" />
                Company events today
              </span>
              <Badge className="bg-amber-600 text-white">{todaysCompany.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            {todaysCompany.map((event, idx) => (
              <EventRow key={`co-${event._id || idx}`} event={event} compact />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Today's Schedule (personal + summary) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Today's Schedule
            <Badge variant="secondary">{todaysAll.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {todaysAll.length === 0 ? (
            <div className="text-center text-gray-400 italic">No events scheduled for today.</div>
          ) : (
            todaysAll.map((event, idx) => (
              <EventRow key={event._id || `ev-${idx}`} event={event} />
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{isCheckedIn ? 'Checked in' : 'Checked out'}</p>
              <p className="text-sm text-gray-600">{checkInTime ? `Today at ${new Date(checkInTime).toLocaleTimeString()}` : 'No recent check-in'}</p>
            </div>
          </div>
          {recentEvent && (
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${recentEvent.isCompanyEvent ? "bg-amber-100" : "bg-blue-100"}`}>
                {recentEvent.isCompanyEvent ? (
                  <Building2 className="w-4 h-4 text-amber-700" />
                ) : (
                  <Calendar className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium flex items-center gap-2 flex-wrap">
                  {recentEvent.title}
                  {recentEvent.isCompanyEvent && (
                    <>
                      <Badge className="bg-amber-600 text-white text-[10px]">Company</Badge>
                      {recentEvent.status === "completed" && (
                        <Badge className="bg-green-100 text-green-800 text-[10px]">Completed</Badge>
                      )}
                    </>
                  )}
                </p>
                <p className="text-sm text-gray-600">{recentEvent.date} at {recentEvent.time}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function renderScannerScreen(handleQRScan, scannerSuccess, scannerMessage) {
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-2 text-center">QR Code Scanner</h2>
      <div className="flex justify-center">
        {scannerSuccess ? (
          <div className="text-green-600 text-lg font-semibold flex items-center justify-center h-80">
            {scannerMessage}
          </div>
        ) : (
          <QRScanner onScan={handleQRScan} />
        )}
      </div>
    </div>
  );
}

function renderProfileScreen({ isAuthenticated, user, logout, isAuthModalOpen, setAuthModalOpen, workStats, setActiveTab }) {
  if (!isAuthenticated) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center mb-4">
          <User className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
        <p className="text-gray-600 mb-6 text-center">Sign in or create an account to access your profile and settings.</p>
        <Button className="w-full max-w-xs" onClick={() => setAuthModalOpen(true)}>
          Login / Register
        </Button>
        <AuthModal open={isAuthModalOpen} onOpenChange={setAuthModalOpen} />
      </div>
    );
  }
  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mx-auto mb-4 flex items-center justify-center">
          <User className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{user?.name || "User"}</h2>
        <p className="text-gray-600">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Member"}</p>
        <Badge className="mt-2 bg-green-100 text-green-800">Active</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Work Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Hours This Week</span>
            <span className="font-bold">
              {workStats.hoursThisWeek.hours > 0 && `${workStats.hoursThisWeek.hours}h `}
              {workStats.hoursThisWeek.minutes > 0 || workStats.hoursThisWeek.hours === 0 ? `${workStats.hoursThisWeek.minutes}m` : ""}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Days Present</span>
            <span className="font-bold">{workStats.daysPresent}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Meetings Attended</span>
            <span className="font-bold">{workStats.meetingsAttended}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tasks Completed</span>
            <span className="font-bold">{workStats.tasksCompleted}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
            onClick={() => setActiveTab?.("notifications")}
          >
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <span>Notifications</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-gray-600" />
              <span>Preferences</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-600" />
              <span>Account</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
          {(user?.role === 'admin' || user?.role === 'ceo') && (
            <div
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
              onClick={() => setActiveTab?.("admin")}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-600" />
                <span>Admin Panel</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          )}
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer text-red-600 font-semibold" onClick={logout}>
            <span>Logout</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  const { token, user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hoursToday, setHoursToday] = useState("0:00");
  const [scannerSuccess, setScannerSuccess] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("");
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  // Work stats state
  const [workStats, setWorkStats] = useState({ hoursThisWeek: { hours: 0, minutes: 0 }, daysPresent: 0, meetingsAttended: 0, tasksCompleted: 0 });
  // Agenda state (personal + company)
  const [events, setEvents] = useState([]);
  const [companyEvents, setCompanyEvents] = useState<any[]>([]);
  const [agendaLoading, setAgendaLoading] = useState(false);
  const [agendaError, setAgendaError] = useState("");
  const [addEventOpen, setAddEventOpen] = useState(false);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [newEvent, setNewEvent] = useState({ title: "", time: "", date: todayStr, type: "meeting" });
  const [addEventError, setAddEventError] = useState("");
  const [addEventLoading, setAddEventLoading] = useState(false);
  const [agendaView, setAgendaView] = useState("day");
  const [showAllEvents, setShowAllEvents] = useState(false);

  // Notifications state (in-app)
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const unreadCount = notifications.filter(n => !n.read).length;

  // Admin: employees + quick meeting creation
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState("");
  const [adminMeeting, setAdminMeeting] = useState({
    title: "",
    date: new Date().toISOString().slice(0, 10),
    time: "",
    location: "",
    type: "meeting",
  });
  const [adminMeetingSubmitting, setAdminMeetingSubmitting] = useState(false);
  const [adminMeetingError, setAdminMeetingError] = useState("");
  const [adminMeetingSuccess, setAdminMeetingSuccess] = useState("");

  // Event type options with icons and labels
  const eventTypeOptions = [
    { value: "meeting", label: "Meeting", icon: <CalendarIcon className="inline w-4 h-4 mr-1 text-blue-600" /> },
    { value: "task", label: "Task", icon: <CheckCircle className="inline w-4 h-4 mr-1 text-green-600" /> },
    { value: "break", label: "Break", icon: <Coffee className="inline w-4 h-4 mr-1 text-purple-600" /> },
  ];

  // Fetch check-in status
  const fetchStatus = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/checkin/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIsCheckedIn(!!data.checkedIn);
      setCheckInTime(data.checkInTime || null);
    } catch {
      setError("Failed to fetch check-in status");
    }
  };

  useEffect(() => {
    fetchStatus();
    // eslint-disable-next-line
  }, [token]);

  // Timer updates every second
  useEffect(() => {
    if (!isCheckedIn || !checkInTime) {
      setHoursToday("0:00");
      return;
    }
    const updateTimer = () => {
      const start = new Date(checkInTime).getTime();
      const now = Date.now();
      const diff = now - start;
      const hours = Math.floor(diff / 1000 / 60 / 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      setHoursToday(`${hours}:${minutes.toString().padStart(2, "0")}`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTime]);

  // Fetch work stats when profile tab is active and logged in
  const fetchWorkStats = () => {
    if (isAuthenticated && token) {
      fetch("/api/checkin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setWorkStats(data))
        .catch(() => setWorkStats({ hoursThisWeek: { hours: 0, minutes: 0 }, daysPresent: 0, meetingsAttended: 0, tasksCompleted: 0 }));
    }
  };

  useEffect(() => {
    if (activeTab === "profile") {
      fetchWorkStats();
    }
  }, [activeTab, isAuthenticated, token]);

  const fetchNotifications = async () => {
    if (!token) return;
    setNotificationsError("");
    setNotificationsLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (err: any) {
      setNotificationsError(err?.message || "Failed to load notifications");
    } finally {
      setNotificationsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (!token) return;
    setEmployeesError("");
    setEmployeesLoading(true);
    try {
      const res = await fetch("/api/admin/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load employees");
      const data = await res.json();
      setEmployees(data);
    } catch (err: any) {
      setEmployeesError(err?.message || "Failed to load employees");
    } finally {
      setEmployeesLoading(false);
    }
  };

  const markAllNotificationsRead = async () => {
    if (!token) return;
    try {
      await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchNotifications();
    } catch {
      // ignore
    }
  };

  const fetchSchedule = async () => {
    setAgendaError("");
    setAgendaLoading(true);
    try {
      const personalPromise = getEvents();
      const companyPromise =
        token
          ? fetch("/api/company-events", { headers: { Authorization: `Bearer ${token}` } }).then(res =>
              res.ok ? res.json() : []
            )
          : Promise.resolve([]);
      const [personal, company] = await Promise.all([personalPromise, companyPromise]);
      setEvents(personal);
      setCompanyEvents(tagCompanyEvents(company));
    } catch {
      setAgendaError("Failed to load events");
    } finally {
      setAgendaLoading(false);
    }
  };

  // Fetch personal + company events for Home and Agenda
  useEffect(() => {
    if (activeTab !== "agenda" && activeTab !== "home") return;
    fetchSchedule();
    // Keep schedule fresh while the user is on the home/agenda screens.
    const interval = setInterval(fetchSchedule, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token]);

  useEffect(() => {
    if (activeTab === "notifications") {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "admin") {
      fetchEmployees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  function renderNotificationsScreen() {
    if (!isAuthenticated) {
      return (
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              Please log in to see your notifications.
            </CardContent>
          </Card>
        </div>
      );
    }
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Notifications</h2>
          <Button variant="outline" onClick={markAllNotificationsRead} disabled={unreadCount === 0}>
            Mark all read
          </Button>
        </div>
        {notificationsLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : notificationsError ? (
          <div className="text-center text-red-500">{notificationsError}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-400 italic py-8">No notifications yet.</div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n: any) => (
              <Card key={n._id} className={n.read ? "" : "border-purple-300"}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`font-medium ${n.read ? "text-gray-800" : "text-purple-700"}`}>{n.title}</p>
                      <p className="text-sm text-gray-600 mt-1 break-words">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</p>
                    </div>
                    {!n.read && <span className="mt-1 w-2 h-2 rounded-full bg-purple-600 flex-shrink-0" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderAdminScreen() {
    if (!isAuthenticated || !(user?.role === "admin" || user?.role === "ceo")) {
      return (
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              You are not authorized to view this page.
            </CardContent>
          </Card>
        </div>
      );
    }

    const submitAdminMeeting = async (e: any) => {
      e?.preventDefault?.();
      if (!token) return;
      setAdminMeetingError("");
      setAdminMeetingSuccess("");
      if (!adminMeeting.title || !adminMeeting.date || !adminMeeting.time) {
        setAdminMeetingError("Please fill title, date and time.");
        return;
      }
      setAdminMeetingSubmitting(true);
      try {
        const res = await fetch("/api/company-events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: adminMeeting.title,
            date: adminMeeting.date,
            time: adminMeeting.time,
            type: adminMeeting.type,
            location: adminMeeting.location,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || "Failed to create event");
        }
        setAdminMeetingSuccess("Meeting created and notifications sent.");
        setAdminMeeting({
          title: "",
          date: new Date().toISOString().slice(0, 10),
          time: "",
          location: "",
          type: "meeting",
        });
        await fetchSchedule();
      } catch (err: any) {
        setAdminMeetingError(err?.message || "Failed to create meeting");
      } finally {
        setAdminMeetingSubmitting(false);
      }
    };

    const completeCompanyEvent = async (id: string) => {
      if (!token) return;
      try {
        await fetch(`/api/company-events/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "completed" }),
        });
        await fetchSchedule();
      } catch {
        // ignore for now
      }
    };

    const activeCompany = companyEvents.filter(e => e.status !== "completed");
    const completedCompany = companyEvents.filter(e => e.status === "completed");

    return (
      <div className="p-4 space-y-4">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
        <Card>
          <CardHeader>
            <CardTitle>Create company meeting</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={submitAdminMeeting}>
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-purple-400"
                  value={adminMeeting.title}
                  onChange={e => setAdminMeeting({ ...adminMeeting, title: e.target.value })}
                  placeholder="e.g. Daily Standup"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-purple-400"
                    value={adminMeeting.date}
                    onChange={e => setAdminMeeting({ ...adminMeeting, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <input
                    type="time"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-purple-400"
                    value={adminMeeting.time}
                    onChange={e => setAdminMeeting({ ...adminMeeting, time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-purple-400"
                  value={adminMeeting.location}
                  onChange={e => setAdminMeeting({ ...adminMeeting, location: e.target.value })}
                  placeholder="e.g. Floor 2 • Meeting room A"
                />
              </div>
              {adminMeetingError && <div className="text-sm text-red-600">{adminMeetingError}</div>}
              {adminMeetingSuccess && <div className="text-sm text-green-700">{adminMeetingSuccess}</div>}
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={adminMeetingSubmitting}>
                {adminMeetingSubmitting ? "Creating..." : "Create & notify everyone"}
              </Button>
              <p className="text-xs text-gray-500">
                This creates a company event and sends an in-app notification to all employees.
              </p>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Company events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {companyEvents.length === 0 ? (
              <div className="text-sm text-gray-400 italic">No company events yet.</div>
            ) : (
              <>
                {activeCompany.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Upcoming</p>
                    {activeCompany.map((ev: any) => (
                      <div key={ev._id} className="border border-amber-200 rounded-lg p-3 flex items-start justify-between gap-3 bg-amber-50">
                        <div className="min-w-0">
                          <p className="font-medium flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-amber-700" />
                            {ev.title}
                          </p>
                          {ev.location && (
                            <p className="text-xs text-amber-800 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{ev.location}</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-600 mt-1">
                            {ev.date} · {ev.time}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className="bg-amber-600 text-white text-[10px]">Scheduled</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-2 py-1 h-auto"
                            onClick={() => completeCompanyEvent(ev._id)}
                          >
                            Mark completed
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {completedCompany.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Completed</p>
                    {completedCompany.map((ev: any) => (
                      <div key={ev._id} className="border border-gray-200 rounded-lg p-3 flex items-start justify-between gap-3 bg-gray-50 opacity-80">
                        <div className="min-w-0">
                          <p className="font-medium line-through flex items-center gap-2 text-gray-600">
                            <Building2 className="w-4 h-4 text-gray-500" />
                            {ev.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {ev.date} · {ev.time}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 text-[10px] self-start">Completed</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{employees.length} employees</span>
              <Button variant="outline" size="sm" onClick={fetchEmployees} disabled={employeesLoading}>
                Refresh
              </Button>
            </div>
            {employeesLoading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : employeesError ? (
              <div className="text-center text-red-500">{employeesError}</div>
            ) : employees.length === 0 ? (
              <div className="text-center text-gray-400 italic">No employees found.</div>
            ) : (
              <div className="space-y-2">
                {employees.map((emp: any) => (
                  <div key={emp._id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{emp.name}</p>
                        <p className="text-xs text-gray-500 truncate">{emp.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="secondary">{emp.role}</Badge>
                          <Badge className={emp.checkInStatus?.checkedIn ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"}>
                            {emp.checkInStatus?.checkedIn ? "Checked in" : "Checked out"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">This week</p>
                        <p className="text-sm font-semibold">
                          {(emp.stats?.hoursThisWeek?.hours ?? 0)}h {(emp.stats?.hoursThisWeek?.minutes ?? 0)}m
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Days: {emp.stats?.daysPresent ?? 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Add event handler
  const handleAddEvent = async (e) => {
    e.preventDefault();
    setAddEventError("");
    setAddEventLoading(true);
    try {
      if (!newEvent.title || !newEvent.time || !newEvent.type || !newEvent.date) {
        setAddEventError("Please fill all fields");
        setAddEventLoading(false);
        return;
      }
      await addEvent({ ...newEvent, status: "pending" });
      setAddEventOpen(false);
      setNewEvent({ title: "", time: "", date: todayStr, type: "meeting" });
      await fetchSchedule();
    } catch (err) {
      setAddEventError("Failed to add event");
    } finally {
      setAddEventLoading(false);
    }
  };

  // Scanner logic
  const handleQRScan = async (result: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not logged in");
      // Fetch current status
      const statusRes = await fetch("/api/checkin/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statusData = await statusRes.json();
      const checkedIn = !!statusData.checkedIn;
      // Call backend for check-in or check-out
      const endpoint = checkedIn ? "/api/checkin/out" : "/api/checkin/in";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(checkedIn ? "Check-out failed" : "Check-in failed");
      setScannerMessage(checkedIn ? "Check-out successful!" : "Check-in successful!");
      setScannerSuccess(true);
      // Always update status and go home after scan
      await fetchStatus();
      fetchWorkStats(); // <-- Refetch stats after check-in/out
      setTimeout(() => {
        setScannerSuccess(false);
        setActiveTab("home");
      }, 2000);
    } catch (err: any) {
      setScannerMessage(err.message || "Scan failed");
      setScannerSuccess(true);
      setTimeout(() => setScannerSuccess(false), 2000);
    }
  };

  // Add these handlers inside App
  const handleEditEvent = (event) => {
    setNewEvent({ ...event });
    setAddEventOpen(true);
  };

  const handleCompleteEvent = async (event) => {
    try {
      await updateEvent(event._id, { ...event, status: "completed" });
      await fetchSchedule();
    } catch (err) {
      setAgendaError("Failed to complete event");
    }
  };

  const handleRemoveEvent = async (event) => {
    try {
      await deleteEvent(event._id);
      setEvents(events.filter(e => e._id !== event._id));
    } catch (err) {
      setAgendaError("Failed to remove event");
    }
  };

  function renderAgendaScreen() {
    const eventTypeColors = {
      meeting: "border-l-blue-500 bg-blue-50 text-blue-800",
      task: "border-l-green-500 bg-green-50 text-green-800",
      break: "border-l-purple-500 bg-purple-50 text-purple-800",
      checkin: "border-l-orange-500 bg-orange-50 text-orange-800",
      checkout: "border-l-orange-500 bg-orange-50 text-orange-800",
      company: "border-l-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-200",
    };
    const eventTypeIcons = {
      meeting: <CalendarIcon className="w-5 h-5 text-blue-600 mr-2" />,
      task: <CheckCircle className="w-5 h-5 text-green-600 mr-2" />,
      break: <Coffee className="w-5 h-5 text-purple-600 mr-2" />,
    };
    const mergedEvents = [...companyEvents, ...events];
    // Filter out events with invalid or missing dates
    const validEvents = mergedEvents.filter(e => e.date && !isNaN(Date.parse(e.date)));
    let filteredEvents = validEvents;
    if (!showAllEvents) {
      if (agendaView === "day") {
        filteredEvents = validEvents.filter(e => e.date === selectedDate);
      } else if (agendaView === "week") {
        const weekStart = startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(parseISO(selectedDate), { weekStartsOn: 1 });
        filteredEvents = validEvents.filter(e => {
          if (!e.date) return false;
          const d = parseISO(e.date);
          return isWithinInterval(d, { start: weekStart, end: weekEnd });
        });
      } else if (agendaView === "month") {
        const monthStart = startOfMonth(parseISO(selectedDate));
        const monthEnd = endOfMonth(parseISO(selectedDate));
        filteredEvents = validEvents.filter(e => {
          if (!e.date) return false;
          const d = parseISO(e.date);
          return isWithinInterval(d, { start: monthStart, end: monthEnd });
        });
      }
    }
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">My Agenda</h2>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={() => { setNewEvent({ title: '', time: '', date: todayStr, type: 'meeting' }); setAddEventOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" />
            Add personal
          </Button>
        </div>
        <p className="text-xs text-gray-500 -mt-4">
          <Building2 className="w-3 h-3 inline mr-1 text-amber-600" />
          Amber cards are company-wide events from admin.
        </p>
        <div className="flex bg-slate-100 rounded-xl p-1 mb-2 ring-1 ring-slate-200">
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 rounded-md font-semibold transition-colors ${
              agendaView === "day"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-slate-200"
                : "text-slate-700 hover:bg-white/70 hover:text-gray-900"
            }`}
            onClick={() => setAgendaView("day")}
          >
            Day
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 rounded-md font-semibold transition-colors ${
              agendaView === "week"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-slate-200"
                : "text-slate-700 hover:bg-white/70 hover:text-gray-900"
            }`}
            onClick={() => setAgendaView("week")}
          >
            Week
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 rounded-md font-semibold transition-colors ${
              agendaView === "month"
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-slate-200"
                : "text-slate-700 hover:bg-white/70 hover:text-gray-900"
            }`}
            onClick={() => setAgendaView("month")}
          >
            Month
          </Button>
        </div>
        {/* Date picker for Day/Week/Month */}
        <div className="mb-2 flex items-center gap-2">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">{agendaView.charAt(0).toUpperCase() + agendaView.slice(1)} view date</label>
            <input
              type="date"
              className="border rounded px-3 py-1 focus:outline-none focus:ring focus:border-blue-400"
              value={selectedDate}
              onChange={e => {
                const val = e.target.value;
                if (val && !isNaN(Date.parse(val))) {
                  setSelectedDate(val);
                } else {
                  setSelectedDate(todayStr);
                }
              }}
            />
          </div>
          <Button
            className="ml-2 bg-black text-white hover:bg-gray-900"
            onClick={() => setShowAllEvents(!showAllEvents)}
          >
            {showAllEvents ? "Show Filtered" : "Show All Events"}
          </Button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{showAllEvents ? "All Events" : agendaView === 'day' ? format(parseISO(selectedDate), 'PPP') : agendaView === 'week' ? `Week of ${format(startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 }), 'PPP')}` : format(parseISO(selectedDate), 'LLLL yyyy')}</h3>
            <Badge variant="outline">{filteredEvents.length} events</Badge>
          </div>
          {agendaLoading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : agendaError ? (
            <div className="text-center text-red-500">{agendaError}</div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center text-gray-400 italic py-8">No events for this {showAllEvents ? "list" : agendaView}.</div>
          ) : (
            <div className="space-y-3">
              {[...filteredEvents].sort(sortByTimeThenCompanyFirst).map((event, idx) => {
                const isCompany = !!event.isCompanyEvent;
                const isCompanyCompleted = isCompany && event.status === "completed";
                const cardClass = isCompany
                  ? eventTypeColors.company
                  : eventTypeColors[event.type] || "border-l-gray-400 bg-gray-50";
                return (
                <Card key={`${isCompany ? "co" : "pe"}-${event._id || idx}`} className={`border-l-4 ${cardClass} ${isCompanyCompleted ? "opacity-70" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center mb-1 flex-wrap gap-2">
                          {isCompany ? (
                            <Building2 className="w-5 h-5 text-amber-700 mr-1" />
                          ) : (
                            eventTypeIcons[event.type]
                          )}
                          <h4 className={`font-medium ${isCompanyCompleted ? "line-through text-gray-500" : ""}`}>{event.title}</h4>
                          {isCompany && (
                            <>
                              <Badge className="bg-amber-600 text-white">Company event</Badge>
                              {isCompanyCompleted && (
                                <Badge className="bg-green-100 text-green-800 ml-2">Completed</Badge>
                              )}
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 flex items-center">
                          {isCompany ? (
                            <span className="text-amber-800 font-medium">Company-wide · {eventTypeOptions.find(opt => opt.value === event.type)?.label || event.type}</span>
                          ) : (
                            <>
                              {eventTypeIcons[event.type]}
                              {eventTypeOptions.find(opt => opt.value === event.type)?.label || event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </>
                          )}
                        </p>
                        {isCompany && event.location && (
                          <p className="text-sm text-amber-800 mt-1 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {event.location}
                          </p>
                        )}
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {event.time}
                          <span className="ml-4">
                            <CalendarIcon className="w-4 h-4 mr-1 inline" />
                            {event.date && !isNaN(Date.parse(event.date))
                              ? format(parseISO(event.date), 'PPP')
                              : <span className="text-gray-400">No date</span>
                            }
                          </span>
                        </div>
                      </div>
                      {!isCompany && (
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex space-x-1">
                          <button title="Edit" className="p-1 hover:bg-gray-200 rounded" onClick={() => handleEditEvent(event)}>
                            <Edit className="w-4 h-4 text-blue-600" />
                          </button>
                          <button title="Complete" className="p-1 hover:bg-gray-200 rounded" onClick={() => handleCompleteEvent(event)} disabled={event.status === 'completed'}>
                            <Check className={`w-4 h-4 ${event.status === 'completed' ? 'text-gray-400' : 'text-green-600'}`} />
                          </button>
                          <button title="Remove" className="p-1 hover:bg-gray-200 rounded" onClick={() => handleRemoveEvent(event)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                        {event.status === 'completed' && <Badge className="bg-green-100 text-green-800">Completed</Badge>}
                      </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
              })}
            </div>
          )}
        </div>
        <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
          <DialogContent>
            <DialogTitle>{newEvent && newEvent._id ? 'Edit Event' : 'Add Event'}</DialogTitle>
            <form className="space-y-4" onSubmit={handleAddEvent}>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="event-title">Event Title</label>
                <input
                  id="event-title"
                  type="text"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                  placeholder="e.g. Team Standup"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter a short, descriptive title for your event.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="event-date">Date</label>
                <input
                  id="event-date"
                  type="date"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                  value={newEvent.date}
                  onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Select the date for your event.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="event-time">Time</label>
                <input
                  id="event-time"
                  type="time"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                  placeholder="e.g. 09:30"
                  value={newEvent.time}
                  onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Select the time for your event.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="event-type">Type</label>
                <select
                  id="event-type"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                  value={newEvent.type}
                  onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                  required
                >
                  {eventTypeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Choose the type of event. This will affect the color and icon shown in your agenda.</p>
              </div>
              {addEventError && <div className="text-red-500 text-sm">{addEventError}</div>}
              <Button type="submit" className="w-full" disabled={addEventLoading}>
                {addEventLoading ? (newEvent && newEvent._id ? "Saving..." : "Adding...") : (newEvent && newEvent._id ? "Save Changes" : "Add Event")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-purple-900 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="text-xl font-bold">IntraSync</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="relative"
              onClick={() => setActiveTab("notifications")}
              aria-label="Notifications"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center" onClick={() => setActiveTab("profile")} role="button" tabIndex={0}>
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pb-20">
        {activeTab === "home" && (
          <HomePage
            isCheckedIn={isCheckedIn}
            checkInTime={checkInTime}
            hoursToday={hoursToday}
            error={error}
            onCheckInClick={() => setActiveTab("scanner")}
            events={events}
            companyEvents={companyEvents}
            setActiveTab={setActiveTab}
            workStats={workStats}
          />
        )}
        {activeTab === "scanner" && renderScannerScreen(handleQRScan, scannerSuccess, scannerMessage)}
        {activeTab === "agenda" && renderAgendaScreen()}
        {activeTab === "profile" && renderProfileScreen({ isAuthenticated, user, logout, isAuthModalOpen, setAuthModalOpen, workStats, setActiveTab })}
        {activeTab === "notifications" && renderNotificationsScreen()}
        {activeTab === "admin" && renderAdminScreen()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center p-2 ${activeTab === "home" ? "text-purple-600" : "text-gray-400"}`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex flex-col items-center p-2 ${
              activeTab === "scanner" ? "text-purple-600" : "text-gray-400"
            }`}
          >
            <QrCode className="w-6 h-6" />
            <span className="text-xs mt-1">Scanner</span>
          </button>
          <button
            onClick={() => setActiveTab("agenda")}
            className={`flex flex-col items-center p-2 ${activeTab === "agenda" ? "text-purple-600" : "text-gray-400"}`}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs mt-1">Agenda</span>
          </button>
          {(user?.role === "admin" || user?.role === "ceo") && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex flex-col items-center p-2 ${activeTab === "admin" ? "text-purple-600" : "text-gray-400"}`}
            >
              <Users className="w-6 h-6" />
              <span className="text-xs mt-1">Admin</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center p-2 ${
              activeTab === "profile" ? "text-purple-600" : "text-gray-400"
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
