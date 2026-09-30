import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { CompanyResponseDTO } from '../types';

interface CompaniesTableProps {
    companies: CompanyResponseDTO[];
    isLoading: boolean;
}

export const CompaniesTable = ({ companies, isLoading }: CompaniesTableProps) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48 border rounded-md bg-card">
                <span className="text-muted-foreground animate-pulse">Cargando empresas...</span>
            </div>
        );
    }

    if (companies.length === 0) {
        return (
            <div className="flex justify-center items-center h-48 border rounded-md bg-card">
                <span className="text-muted-foreground">No se encontraron empresas.</span>
            </div>
        );
    }

    return (
        <div className="border rounded-md bg-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>RUC</TableHead>
                        <TableHead>Razón Social</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha de Creación</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {companies.map((company) => (
                        <TableRow key={company.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium text-foreground">{company.ruc}</TableCell>
                            <TableCell>{company.businessName}</TableCell>
                            <TableCell>
                                <Badge 
                                    variant={
                                        company.subscriptionStatus === 'ACTIVE' ? 'default' : 
                                        company.subscriptionStatus === 'TRIAL' ? 'secondary' : 'destructive'
                                    }
                                >
                                    {company.subscriptionStatus === 'ACTIVE' ? 'Activo' : 
                                     company.subscriptionStatus === 'TRIAL' ? 'Prueba' : 'Suspendido'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {new Date(company.createdAt).toLocaleDateString('es-PE', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
