
import { Distance } from '../types';
import { supabase } from '../supabase';

export interface Race {
    id: string;
    name: string;
    date: string; // YYYY-MM-DD
    distance: Distance | string;
    city: string;
    country: string;
    country_code: string;
    elevation: number;
}

// Mapping distance enum → valeur en base
const distanceToDBValue: Record<Distance, string> = {
    [Distance.FiveK]: '5km',
    [Distance.TenK]: '10km',
    [Distance.HalfMarathon]: 'Semi-Marathon',
    [Distance.Marathon]: 'Marathon',
};

export const searchRaces = async (query: string, distanceFilter: Distance): Promise<Race[]> => {
    if (!query || query.length < 2) return [];

    const today = new Date().toISOString().split('T')[0];
    const dbDistance = distanceToDBValue[distanceFilter];

    try {
        const { data, error } = await supabase
            .from('races')
            .select('id, name, date, distance, city, country, country_code, elevation')
            .eq('distance', dbDistance)
            .gte('date', today)
            .or(`name.ilike.%${query}%,city.ilike.%${query}%`)
            .order('date', { ascending: true })
            .limit(10);

        if (error) {
            console.error('Race search error:', error);
            return [];
        }

        return (data || []).map(r => ({
            id: r.id,
            name: r.name,
            date: r.date,
            distance: r.distance,
            city: r.city,
            country: r.country,
            country_code: r.country_code,
            elevation: r.elevation || 0,
        }));
    } catch {
        return [];
    }
};
