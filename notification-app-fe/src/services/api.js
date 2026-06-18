import axios from 'axios';

// ─── Rich dummy notifications for demo when live API is unavailable ───
const DUMMY_NOTIFICATIONS = [
  { ID: 'p1', Type: 'Placement', Message: 'Google is visiting campus! Pre-Placement Talk on June 25th at 10:00 AM in Auditorium A.', Timestamp: '2026-06-18 09:30:00' },
  { ID: 'p2', Type: 'Placement', Message: 'Amazon SDE Internship applications are now open. Apply before June 22nd via the placement portal.', Timestamp: '2026-06-18 08:15:00' },
  { ID: 'p3', Type: 'Placement', Message: 'Microsoft has released the shortlist for Round 2. Check your email for details.', Timestamp: '2026-06-17 17:45:00' },
  { ID: 'p4', Type: 'Placement', Message: 'Infosys Power Programmer test scheduled for June 23rd. Admit cards released on portal.', Timestamp: '2026-06-17 14:00:00' },
  { ID: 'p5', Type: 'Placement', Message: 'Deloitte is hiring Data Analysts. Minimum 7.5 CGPA required. Last date to register: June 20th.', Timestamp: '2026-06-16 10:00:00' },
  { ID: 'p6', Type: 'Placement', Message: 'Adobe internship results declared! Congratulations to all selected candidates.', Timestamp: '2026-06-15 18:00:00' },
  { ID: 'p7', Type: 'Placement', Message: 'Advanced Micro Devices (AMD) campus drive — 8 LPA package. Walk-in registration open now.', Timestamp: '2026-06-14 11:30:00' },
  { ID: 'r1', Type: 'Result', Message: 'Semester 6 final examination results have been published on the student portal. Check now!', Timestamp: '2026-06-18 07:00:00' },
  { ID: 'r2', Type: 'Result', Message: 'Mid-Semester Exam marks updated. Data Structures: Average 72/100. View detailed breakdown.', Timestamp: '2026-06-17 20:00:00' },
  { ID: 'r3', Type: 'Result', Message: 'Project Phase 2 review grades uploaded. Check your grade sheet in the academic portal.', Timestamp: '2026-06-17 15:30:00' },
  { ID: 'r4', Type: 'Result', Message: 'Assignment 3 (Operating Systems) has been evaluated. Average score: 88%. View feedback.', Timestamp: '2026-06-16 16:00:00' },
  { ID: 'r5', Type: 'Result', Message: 'Re-evaluation results for Mathematics IV are now available. Contact HOD for discrepancies.', Timestamp: '2026-06-15 12:00:00' },
  { ID: 'r6', Type: 'Result', Message: 'Hackathon 2026 final results announced! Top 3 teams to be awarded at the closing ceremony.', Timestamp: '2026-06-14 19:00:00' },
  { ID: 'e1', Type: 'Event', Message: 'TechFest 2026 registrations are open! Participate in Hackathon, Robo Wars & Coding Blitz.', Timestamp: '2026-06-18 06:30:00' },
  { ID: 'e2', Type: 'Event', Message: 'Guest Lecture on AI & the Future of Work by Mr. Ravi Shankar (Ex-Google). June 21, 3 PM.', Timestamp: '2026-06-17 11:00:00' },
  { ID: 'e3', Type: 'Event', Message: 'Annual Sports Day registration closes tomorrow! Sign up for Cricket, Football, Chess & more.', Timestamp: '2026-06-17 09:00:00' },
  { ID: 'e4', Type: 'Event', Message: 'Alumni Meet 2026 — Network with 500+ industry professionals. Register by June 22nd.', Timestamp: '2026-06-16 13:00:00' },
  { ID: 'e5', Type: 'Event', Message: 'Blood Donation Drive on June 24th. Volunteers required. Free breakfast provided.', Timestamp: '2026-06-16 08:00:00' },
  { ID: 'e6', Type: 'Event', Message: 'Library will be closed on June 20th (Public Holiday). Plan your study sessions accordingly.', Timestamp: '2026-06-15 17:00:00' },
  { ID: 'e7', Type: 'Event', Message: 'Farewell party for final year students — June 27th at 6 PM, Open Air Theatre.', Timestamp: '2026-06-14 10:00:00' },
];

// ─── Axios instance ───────────────────────────────────────────────────
const api = axios.create({
  baseURL: 'http://4.224.186.213',
  timeout: 10000,
});

// Logging Middleware — logs every request and response (Interceptors)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`%c[API REQUEST] ${config.method.toUpperCase()} ${config.url}`, 'color: #4338ca; font-weight: bold', { params: config.params });
  return config;
}, (error) => {
  console.error('[API REQUEST ERROR]', error);
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  console.log(`%c[API RESPONSE] ${response.status} ${response.config.url}`, 'color: #10b981; font-weight: bold', response.data);
  return response;
}, (error) => {
  console.warn(`%c[API RESPONSE ERROR] ${error.response?.status} — Falling back to demo data.`, 'color: #f59e0b; font-weight: bold');
  return Promise.reject(error);
});

// ─── Fetch Notifications (with smart fallback to dummy data) ──────────
export const fetchNotifications = async (page = 1, limit = 20, notificationType = '') => {
  try {
    const params = { page, limit };
    if (notificationType && notificationType !== 'All') {
      params.notification_type = notificationType;
    }
    const response = await api.get('/evaluation-service/notifications', { params });
    const data = Array.isArray(response.data) ? response.data : (response.data.notifications || []);
    return data;
  } catch (error) {
    // API is unavailable — return filtered demo data for showcase
    console.log('[Demo Mode] Showing sample notifications.');
    let data = DUMMY_NOTIFICATIONS;
    if (notificationType && notificationType !== 'All') {
      data = data.filter(n => n.Type === notificationType);
    }
    const start = (page - 1) * limit;
    return data.slice(start, start + limit);
  }
};

export default api;
