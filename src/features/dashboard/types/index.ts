import type { Project } from '@/features/projects/types';

export interface ChartData {
    name: string;
    ingresos: number;
    egresos: number;
}

export interface PieData {
    name: string;
    value: number;
    color: string;
}

export interface DashboardData {
    ingresosMensuales: number;
    ingresosTrend: number;
    egresosMensuales: number;
    egresosTrend: number;
    cotizacionesAprobadas: number;
    cotizacionesTrend: number;
    proyectosActivos: number;
    proyectosTerminanPronto: number;
    ingresosVsEgresos: ChartData[];
    estadoProyectos: PieData[];
    proyectosRecientes: Project[];
}
