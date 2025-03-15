import { supabase } from "@/lib/supabase";

export interface City {
  id: string;
  name: string;
  state?: string;
  country: string;
  population?: number;
}

/**
 * Search for cities based on a query string
 * @param query The search query
 * @returns A list of cities matching the query
 */
export const searchCities = async (
  query: string
): Promise<{ data: City[] | null; error: any }> => {
  try {
    // In a real app, this would query a cities database table
    // For now, we'll filter the popular cities
    const filteredCities = getPopularCities().filter(
      (city) =>
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        (city.state &&
          city.state.toLowerCase().includes(query.toLowerCase())) ||
        city.country.toLowerCase().includes(query.toLowerCase())
    );

    return { data: filteredCities, error: null };
  } catch (error) {
    console.error("Error searching cities:", error);
    return { data: null, error };
  }
};

/**
 * Get a list of popular cities
 * @returns A list of popular cities
 */
export const getPopularCities = (): City[] => {
  return [
    {
      id: "1",
      name: "New York",
      state: "NY",
      country: "United States",
      population: 8804190,
    },
    {
      id: "2",
      name: "Los Angeles",
      state: "CA",
      country: "United States",
      population: 3898747,
    },
    {
      id: "3",
      name: "Chicago",
      state: "IL",
      country: "United States",
      population: 2746388,
    },
    {
      id: "4",
      name: "Houston",
      state: "TX",
      country: "United States",
      population: 2304580,
    },
    {
      id: "5",
      name: "London",
      country: "United Kingdom",
      population: 8982000,
    },
    {
      id: "6",
      name: "Tokyo",
      country: "Japan",
      population: 13960000,
    },
    {
      id: "7",
      name: "Paris",
      country: "France",
      population: 2161000,
    },
    {
      id: "8",
      name: "Berlin",
      country: "Germany",
      population: 3645000,
    },
    {
      id: "9",
      name: "Sydney",
      country: "Australia",
      population: 5312000,
    },
    {
      id: "10",
      name: "Toronto",
      state: "ON",
      country: "Canada",
      population: 2930000,
    },
  ];
};
