export interface Class {
  id: string;
  name: string;
}

export interface Period {
  subject: string;
  teacher: string;
  time: string;
  room: string;
  status?: 'ongoing' | 'break' | 'finished';
}

export interface WeekSchedule {
  monday: Period[];
  tuesday: Period[];
  wednesday: Period[];
  thursday: Period[];
  friday: Period[];
  saturday: Period[];
  sunday: Period[];
}

export interface SearchResult {
    [day: string]: Period[];
}
