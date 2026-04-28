import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToXLSX = (data: any[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = (data: any[], filename: string, title: string) => {
  const doc = new jsPDF() as any;
  const headers = Object.keys(data[0] || {}).map(h => h.toUpperCase());
  const body = data.map(item => Object.values(item));

  doc.text(title, 14, 15);
  doc.autoTable({
    head: [headers],
    body: body,
    startY: 20,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [29, 185, 117] } // Primary green color
  });
  doc.save(`${filename}.pdf`);
};

export const getGoogleCalendarUrl = (task: { title: string; location: string; description?: string; date?: Date }): string => {
  const startTime = task.date || new Date();
  const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

  const formatDate = (date: Date) => date.toISOString().replace(/-|:|\\.\\d+/g, '');

  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', task.title);
  url.searchParams.append('dates', `${formatDate(startTime)}/${formatDate(endTime)}`);
  url.searchParams.append('details', task.description || `Volunteer mission: ${task.title} at ${task.location}`);
  url.searchParams.append('location', task.location);
  url.searchParams.append('trp', 'true');

  return url.toString();
};

export const addToGoogleCalendar = (task: { title: string; location: string; description?: string; date?: Date }) => {
  const startTime = task.date || new Date();
  const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // Default to 2 hours
  
  const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
  
  const url = new URL('https://calendar.google.com/calendar/render');
  url.searchParams.append('action', 'TEMPLATE');
  url.searchParams.append('text', task.title);
  url.searchParams.append('dates', `${formatDate(startTime)}/${formatDate(endTime)}`);
  url.searchParams.append('details', task.description || `Volunteer mission: ${task.title} at ${task.location}`);
  url.searchParams.append('location', task.location);
  url.searchParams.append('trp', 'true');
  
  window.open(url.toString(), '_blank');
};
