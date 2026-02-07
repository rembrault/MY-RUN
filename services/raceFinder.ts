
import { Distance } from '../types';

export interface Race {
    id: string;
    name: string;
    date: string; // YYYY-MM-DD
    distance: Distance;
    country: string;
    elevation: number; // in meters
}

const mockRaces: Race[] = [
    { id: 'parismarathon', name: 'Marathon de Paris', date: '2025-04-13', distance: Distance.Marathon, country: 'France', elevation: 225 },
    { id: 'berlinmarathon', name: 'Marathon de Berlin', date: '2025-09-28', distance: Distance.Marathon, country: 'Germany', elevation: 75 },
    { id: 'nycmarathon', name: 'Marathon de New York', date: '2025-11-02', distance: Distance.Marathon, country: 'USA', elevation: 810 },
    { id: 'londonmarathon', name: 'Marathon de Londres', date: '2025-04-27', distance: Distance.Marathon, country: 'UK', elevation: 125 },
    { id: 'utmb', name: 'UTMB', date: '2025-09-01', distance: Distance.Marathon, country: 'France', elevation: 10000 },
    
    { id: 'parissemimarathon', name: 'Semi-Marathon de Paris', date: '2025-03-09', distance: Distance.HalfMarathon, country: 'France', elevation: 120 },
    { id: 'valenciasemimarathon', name: 'Semi-Marathon de Valencia', date: '2025-10-26', distance: Distance.HalfMarathon, country: 'Spain', elevation: 30 },
    { id: 'praguesemimarathon', name: 'Semi-Marathon de Prague', date: '2025-04-05', distance: Distance.HalfMarathon, country: 'Czech Republic', elevation: 60 },

    { id: 'paris10k', name: '10km de Paris Centre', date: '2025-10-15', distance: Distance.TenK, country: 'France', elevation: 50 },
    { id: 'prague10k', name: '10km de Prague', date: '2025-09-06', distance: Distance.TenK, country: 'Czech Republic', elevation: 25 },
];


export const searchRaces = (query: string, distanceFilter: Distance): Promise<Race[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (!query) {
                resolve([]);
                return;
            }
            const lowerCaseQuery = query.toLowerCase();
            const results = mockRaces.filter(race => 
                race.distance === distanceFilter &&
                race.name.toLowerCase().includes(lowerCaseQuery)
            );
            resolve(results);
        }, 500); // Simulate network delay
    });
};
    