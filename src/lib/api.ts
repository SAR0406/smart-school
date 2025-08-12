import type { Class, Period, WeekSchedule, SearchResult } from './types';

// Use a relative path for API calls, which will be handled by a Next.js proxy.
const API_BASE = '/api'; 
const DEFAULT_CLASS = '10a'; // Default class to use if none is selected

async function fetchAPI(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${API_BASE}${endpoint}`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:9002');
  
  // Get selected class from localStorage if available
  const savedClass = typeof window !== 'undefined' ? localStorage.getItem('selectedClass') : null;
  const classParam = savedClass || params.class || DEFAULT_CLASS;
  
  // Add class param to all requests that need it
  if (!params.class && endpoint !== '/get_all_classes') {
      params.class = classParam;
  }
  
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  
  const res = await fetch(url.toString());
  if (!res.ok) {
    console.error(`API Error: ${res.status} ${res.statusText} for ${url}`);
    const errorBody = await res.text();
    console.error('Error Body:', errorBody);
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  return res.json();
}

// /get_all_classes
export const getAllClasses = async (): Promise<Class[]> => {
  const data = await fetchAPI('/get_all_classes');
  // The backend returns a list of strings, we need to map it to the Class interface
  return data.classes.map((className: string) => ({
      id: className.toLowerCase().replace(' ', '-'),
      name: className
  }));
};

// /get_current_period
export const getCurrentPeriod = async (): Promise<Period> => {
  const data = await fetchAPI('/get_current_period');
  // Map backend response to frontend Period type
  const { current_subject, message, time } = data;
  
  let subject = 'Break';
  let status: 'ongoing' | 'break' | 'finished' = 'break';

  if(current_subject){
    subject = current_subject;
    status = 'ongoing';
  } else if (message?.toLowerCase().includes('over') || message?.toLowerCase().includes('enjoy')) {
    status = 'finished';
    subject = 'School Day Finished';
  }
  
  return {
    subject: subject,
    teacher: 'N/A', // Not provided by this endpoint
    time: time,
    room: 'N/A', // Not provided by this endpoint
    status: status,
    message: message
  };
};

const mapPeriods = (periods: any[]): Period[] => {
    if (!periods || periods.length === 0) return [];
    // Handle the "Holiday" case
    if (periods[0]?.subject === "Holiday") {
      return [{ subject: "Holiday", time: "All Day", teacher: "-", room: "-" }];
    }
    return periods.map(p => ({
        subject: p.subject,
        teacher: 'N/A', // Teacher info not in your backend response
        time: `${p.start_time} - ${p.end_time}`,
        room: 'N/A' // Room info not in your backend response
    }))
}

// /get_day_schedule
export const getDaySchedule = async (): Promise<Period[]> => {
  const data = await fetchAPI('/get_day_schedule');
  return mapPeriods(data.timetable);
};

// /get_full_week
export const getFullWeekSchedule = async (): Promise<WeekSchedule> => {
    const data = await fetchAPI('/get_full_week');
    const schedule: Partial<WeekSchedule> = {};
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    
    for (const day of days) {
        const backendDay = day.charAt(0).toUpperCase() + day.slice(1);
        if (data.week_schedule[backendDay]) {
            schedule[day as keyof WeekSchedule] = mapPeriods(data.week_schedule[backendDay]);
        } else {
             schedule[day as keyof WeekSchedule] = [];
        }
    }
    return schedule as WeekSchedule;
}

// /search_periods_by_subject
export const searchPeriodsBySubject = async (query: string): Promise<SearchResult> => {
    if (!query) return {};
    try {
        const data = await fetchAPI('/search_periods_by_subject', { subject: query });
        const results: SearchResult = {};
        
        // Group results by day
        data.results.forEach((item: any) => {
            const dayKey = item.day.toLowerCase();
            if (!results[dayKey]) {
                results[dayKey] = [];
            }
            results[dayKey].push({
                subject: item.subject,
                time: `${item.start_time} - ${item.end_time}`,
                teacher: 'N/A',
                room: 'N/A'
            });
        });

        return results;
    } catch(error: any) {
        // If the API returns 404, it means no results were found. Return empty object.
        if (error.message.includes('404')) {
            return {};
        }
        // Re-throw other errors
        throw error;
    }
}