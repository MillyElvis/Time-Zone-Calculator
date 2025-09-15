export interface Weather {
  temperature: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Partly Cloudy';
}

export interface Timezone {
  iana: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}