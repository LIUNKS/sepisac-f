import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User, Pencil, Key, Lock, Users as UsersIcon, UserCheck, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const kpisData = [
    { title: 'Total de Usuarios', value: '32', trend: '+2 este mes', trendType: 'success', icon: UsersIcon, color: 'primary' },
    { title: 'Usuarios Activos', value: '31', trend: 'En plataforma', trendType: 'success', icon: UserCheck, color: 'success' },
    { title: 'Administradores', value: '3', trend: 'Con acceso total', trendType: 'info', icon: ShieldCheck, color: 'info' },
];

const usersData = [
    { id: 'USR-001-A', name: 'Gerencia SEPI', userId: 'USR-001', role: 'Administrador General', email: 'gerencia@sepisac.com', lastAccess: 'Hoy, 08:30 AM', status: 'Activo' },
    { id: 'USR-001-B', name: 'Yohann Camiloaga', userId: 'USR-001', role: 'Ingeniero de Proyectos', email: 'ycamiloaga@sepisac.com', lastAccess: 'Hoy, 14:25 AM', status: 'Activo' },
    { id: 'USR-002', name: 'Luis Tello', userId: 'USR-002', role: 'Ingeniero de Proyectos', email: 'ltello@sepisac.com', lastAccess: 'Hoy, 09:15 AM', status: 'Activo' },
    { id: 'USR-003-A', name: 'Mayra Yaranga', userId: 'USR-003', role: 'Ingeniero de Proyectos', email: 'myaranga@sepisac.com', lastAccess: 'Ayer, 15:10 AM', status: 'Activo' },
    { id: 'USR-003-B', name: 'Renzo Gutiérrez', userId: 'USR-003', role: 'Ingeniero de Proyectos', email: 'rgutierrez@sepisac.com', lastAccess: 'Ayer, 18:45 PM', status: 'Activo' },
    { id: 'USR-008', name: 'Juan Pérez', userId: 'USR-008', role: 'Técnico Electricista', email: 'jperez@sepisac.com', lastAccess: '28 Ago 2026', status: 'Activo' },
    { id: 'USR-012', name: 'Miguel Torres', userId: 'USR-012', role: 'Operario de Maestranza', email: 'mtorres@sepisac.com', lastAccess: '15 Jul 2026', status: 'Inactivo' },
];

export const UsuariosPage = () => {
    const [activeTab, setActiveTab] = useState('Todos');

    const tabs = [
        { id: 'Todos', label: 'Todos', count: 32 },
        { id: 'Administradores', label: 'Administradores', count: 3 },
        { id: 'Ingenieros', label: 'Ingenieros' },
        { id: 'Técnicos', label: 'Técnicos / Operarios' },
    ];

    return (
        <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpisData.map((kpi, idx) => (
                    <Card key={idx} className="border-border shadow-sm relative overflow-hidden">
                        <CardContent className="p-6">
                            <p className="text-sm font-semibold text-muted-foreground mb-2">{kpi.title}</p>
                            <h3 className="text-3xl font-bold text-foreground mb-2">{kpi.value}</h3>
                            <div className={`text-xs font-medium flex items-center gap-1.5 ${
                                kpi.trendType === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                            }`}>
                                <span>{kpi.trend}</span>
                            </div>
                            
                            <div className={`absolute top-6 right-6 w-10 h-10 rounded-xl flex items-center justify-center ${
                                kpi.color === 'primary' ? 'bg-secondary text-muted-foreground' : 
                                kpi.color === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                            }`}>
                                <kpi.icon className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table Card */}
            <Card className="border-border shadow-sm">
                <CardHeader className="p-0 border-b border-border">
                    <div className="flex justify-between items-center px-6 mt-4">
                        <div className="flex gap-6">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-4 text-sm font-medium transition-colors border-b-2 -mb-[1px] flex items-center gap-2 ${
                                        activeTab === tab.id 
                                            ? 'border-primary text-primary' 
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            activeTab === tab.id 
                                                ? 'bg-primary/10 text-primary dark:bg-primary/20' 
                                                : 'bg-secondary text-muted-foreground'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10 mb-3 h-8 text-sm">
                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                            Permisos Globales
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/50 hover:bg-transparent bg-secondary/20">
                                <TableHead className="text-muted-foreground font-semibold px-6">Usuario</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Cargo / Rol</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Correo Electrónico</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Último Acceso</TableHead>
                                <TableHead className="text-muted-foreground font-semibold">Estado</TableHead>
                                <TableHead className="text-muted-foreground font-semibold text-right px-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usersData.map((user) => (
                                <TableRow key={user.id} className="border-border/50 hover:bg-muted/50">
                                    <TableCell className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                                                {user.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                                            </div>
                                            <div>
                                                <div className={`font-semibold ${user.status === 'Inactivo' ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                    {user.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">ID: {user.userId}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`font-medium text-sm ${
                                            user.name === 'Luis Tello' ? 'text-primary' : 
                                            user.status === 'Inactivo' ? 'text-muted-foreground' : 'text-foreground'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                    <TableCell className="text-muted-foreground">{user.lastAccess}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant="secondary" 
                                            className={`gap-1.5 ${
                                                user.status === 'Activo' 
                                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20' 
                                                    : 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20'
                                            }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                user.status === 'Activo' ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-red-600 dark:bg-red-400'
                                            }`}></span>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="outline" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                                                <User className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            {user.status === 'Activo' ? (
                                                <Button variant="outline" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
                                                    <Key className="w-4 h-4" />
                                                </Button>
                                            ) : (
                                                <Button variant="outline" size="icon" className="w-8 h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 border-red-200 dark:border-red-500/20">
                                                    <Lock className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
