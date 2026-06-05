export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'admin' | 'trabajador' | string;
  password?: string;
}

export interface Client {
  id: number;
  nombre: string;
  direccion: string;
  lat?: number;
  lng?: number;
}

export interface RouteStop {
  id_cliente: number;
  nombre?: string;
  direccion?: string;
  lat?: number;
  lng?: number;
  orden: number;
}

export interface Route {
  id: number;
  nombre: string;
  paradas?: RouteStop[];
}

export interface Pause {
  inicio: string;
  fin?: string;
  minutos?: number;
}

export interface Visit {
  id_cliente: number;
  nombre: string;
  direccion: string;
  orden: number;
  lat?: number;
  lng?: number;
  llegada?: string;
  salida?: string;
  minutos_visita?: number;
}

export interface Journey {
  id: number;
  fecha: string;
  estado: string;
  nombre_ruta?: string;
  inicio_plan?: string;
  fin_plan?: string;
  incidencia?: string;
  alerta_descanso_exceso?: boolean;
  total_min_descanso?: number;
  pausa_activa?: boolean;
  pausas?: Pause[];
  visitas?: Visit[];
}
