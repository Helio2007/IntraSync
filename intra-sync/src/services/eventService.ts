import axios from 'axios';

const API_URL = 'http://localhost:4000/api/events';

export interface Event {
  _id?: string;
  title: string;
  time: string;
  type: string;
  status: string;
}

export const getEvents = async (): Promise<Event[]> => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const addEvent = async (event: Event): Promise<Event> => {
  const res = await axios.post(API_URL, event);
  return res.data;
};

export const updateEvent = async (id: string, event: Event): Promise<Event> => {
  const res = await axios.put(`${API_URL}/${id}`, event);
  return res.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

export interface CompanyEvent {
  _id?: string;
  title: string;
  date: string;
  time: string;
  type: string;
  createdBy?: string;
  createdAt?: string;
}

const COMPANY_API_URL = 'http://localhost:4000/api/company-events';

export const getCompanyEvents = async (token: string): Promise<CompanyEvent[]> => {
  const res = await axios.get(COMPANY_API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const addCompanyEvent = async (event: CompanyEvent, token: string): Promise<CompanyEvent> => {
  const res = await axios.post(COMPANY_API_URL, event, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const updateCompanyEvent = async (id: string, event: CompanyEvent, token: string): Promise<CompanyEvent> => {
  const res = await axios.put(`${COMPANY_API_URL}/${id}`, event, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const deleteCompanyEvent = async (id: string, token: string): Promise<void> => {
  await axios.delete(`${COMPANY_API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}; 