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