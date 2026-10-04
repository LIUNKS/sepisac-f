import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Quotation } from '../types';

// Opcional: Puedes registrar fuentes personalizadas aquí
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, borderBottomWidth: 2, borderBottomColor: '#0f172a', paddingBottom: 10 },
    logoText: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
    companyInfo: { fontSize: 9, color: '#64748b', textAlign: 'right' },
    titleSection: { marginBottom: 20 },
    docTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 5 },
    grid2: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    infoBox: { width: '48%', padding: 10, backgroundColor: '#f8fafc', borderRadius: 4, borderWidth: 1, borderColor: '#e2e8f0' },
    label: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', marginBottom: 3 },
    value: { fontSize: 10, fontWeight: 'bold', color: '#0f172a' },
    table: { width: '100%', marginBottom: 20 },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderBottomWidth: 1, borderBottomColor: '#cbd5e1', padding: 6, fontWeight: 'bold' },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', padding: 6 },
    col1: { width: '45%' },
    col2: { width: '20%', textAlign: 'center' },
    col3: { width: '15%', textAlign: 'right' },
    col4: { width: '20%', textAlign: 'right' },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', marginTop: 15, marginBottom: 10, color: '#0f172a', backgroundColor: '#e2e8f0', padding: 4 },
    summaryBox: { width: '40%', alignSelf: 'flex-end', marginTop: 20, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 6, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    summaryTotal: { flexDirection: 'row', justifyContent: 'space-between', padding: 8, backgroundColor: '#0f172a', color: 'white', fontWeight: 'bold' },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#94a3b8', textAlign: 'center', borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10 },
});

interface QuotationPDFProps {
    quotation: Quotation;
}

export const QuotationPDF = ({ quotation }: QuotationPDFProps) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.logoText}>SEPISAC</Text>
                        <Text style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>Servicios y Proyectos Industriales</Text>
                    </View>
                    <View style={styles.companyInfo}>
                        <Text>Cotización Nº: {quotation.quotationNumber}</Text>
                        <Text>Fecha: {new Date(quotation.createdAt).toLocaleDateString('es-PE')}</Text>
                        <Text>Empresa: {quotation.companyName}</Text>
                    </View>
                </View>

                {/* Info Boxes */}
                <View style={styles.titleSection}>
                    <Text style={styles.docTitle}>Cotización Comercial</Text>
                    <Text style={{ fontSize: 10 }}>Referencia: {quotation.serviceType}</Text>
                </View>

                <View style={styles.grid2}>
                    <View style={styles.infoBox}>
                        <Text style={styles.label}>Cliente Solicitante</Text>
                        <Text style={styles.value}>{quotation.clientName}</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.label}>Detalles Comerciales</Text>
                        <Text style={styles.value}>Moneda: {quotation.currency}</Text>
                        <Text style={styles.value}>T/C: {quotation.exchangeRate}</Text>
                    </View>
                </View>

                {/* Materiales / Insumos */}
                {quotation.details && quotation.details.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>1. Materiales e Insumos</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.col1}>Descripción</Text>
                                <Text style={styles.col2}>Cant.</Text>
                                <Text style={styles.col3}>P.Unit</Text>
                                <Text style={styles.col4}>Subtotal</Text>
                            </View>
                            {quotation.details.map((item, i) => (
                                <View style={styles.tableRow} key={item.id || i}>
                                    <Text style={styles.col1}>{item.itemDescription}</Text>
                                    <Text style={styles.col2}>{item.quantity}</Text>
                                    <Text style={styles.col3}>{item.unitPrice.toFixed(2)}</Text>
                                    <Text style={styles.col4}>{item.subtotal.toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Mano de Obra */}
                {quotation.laborRequirements && quotation.laborRequirements.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>2. Requerimientos Laborales</Text>
                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.col1}>Especialidad</Text>
                                <Text style={styles.col2}>Personal x Horas</Text>
                                <Text style={styles.col3}>Costo/H</Text>
                                <Text style={styles.col4}>Subtotal</Text>
                            </View>
                            {quotation.laborRequirements.map((labor, i) => (
                                <View style={styles.tableRow} key={labor.id || i}>
                                    <Text style={styles.col1}>{labor.specialtyNeeded}</Text>
                                    <Text style={styles.col2}>{labor.quantityRequired} pers. x {labor.estimatedHours}h</Text>
                                    <Text style={styles.col3}>{labor.lockedHourlyCost.toFixed(2)}</Text>
                                    <Text style={styles.col4}>{labor.subtotal.toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Summary Box */}
                <View style={styles.summaryBox}>
                    <View style={styles.summaryRow}>
                        <Text>Costo Directo Base</Text>
                        <Text>{quotation.currency} {quotation.subtotalCosts.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text>Margen Comercial</Text>
                        <Text>{quotation.profitMarginPercentage.toFixed(2)}%</Text>
                    </View>
                    <View style={styles.summaryTotal}>
                        <Text>MONTO TOTAL</Text>
                        <Text>{quotation.currency} {quotation.totalAmount.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Esta cotización tiene una validez de 15 días desde su emisión.</Text>
                    <Text>Generado automáticamente por el Sistema ERP de SEPISAC.</Text>
                </View>
            </Page>
        </Document>
    );
};
