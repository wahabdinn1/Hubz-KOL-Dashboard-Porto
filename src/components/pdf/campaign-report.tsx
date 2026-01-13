"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { Campaign, KOL } from '@/lib/static-data';
import { calculateROI, calculateER, formatIDR } from '@/lib/analytics';

// Register standard fonts
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v1/1PTSg8zYS_SKfqw6DQS4YZA.ttf' }, // Regular
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v1/1PTSg8zYS_SKfqw6DQS4YZA.ttf', fontWeight: 'bold' }, // Bold (simulated for simplicity or provide real URL)
    ]
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#000000',
        paddingBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 10,
        color: '#666666',
        marginTop: 4,
    },
    section: {
        margin: 10,
        padding: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        paddingBottom: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    metricCard: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        padding: 10,
        marginRight: 10,
        borderRadius: 4,
    },
    metricLabel: {
        fontSize: 9,
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    metricValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 4,
        color: '#111827',
    },
    table: {
        display: "flex",
        width: "auto",
        borderStyle: "solid",
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderColor: '#E5E7EB',
        marginTop: 10,
    },
    tableRow: {
        margin: "auto",
        flexDirection: "row",
    },
    tableColHeader: {
        width: "20%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#E5E7EB',
        backgroundColor: '#F3F4F6',
        padding: 5,
    },
    tableCol: {
        width: "20%",
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#E5E7EB',
        padding: 5,
    },
    tableCellHeader: {
        fontSize: 8,
        fontWeight: 'bold',
    },
    tableCell: {
        fontSize: 8,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#9CA3AF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
    }
});

interface CampaignReportProps {
    campaign: Campaign;
    kols: KOL[];
}

export const CampaignReport = ({ campaign, kols }: CampaignReportProps) => {
    // Recalculate metrics for PDF
    let totalSpend = 0;
    let totalRevenue = 0;
    let totalViews = 0;
    let totalEngagements = 0;

    const deliverables = campaign.deliverables.map(del => {
        const kol = kols.find(k => k.id === del.kolId);
        if (!kol) return null;

        const rate = campaign.platform === 'Instagram' ? (kol.rateCardReels || 0) : (kol.rateCardTiktok || 0);
        const cost = rate * del.videosCount;
        totalSpend += cost;
        totalRevenue += del.salesGenerated;
        totalViews += del.totalViews;
        totalEngagements += del.totalEngagements;

        return {
            name: kol.name,
            views: del.totalViews,
            engagements: del.totalEngagements,
            sales: del.salesGenerated,
            cost: cost
        };
    }).filter(item => item !== null);

    const roi = calculateROI(totalRevenue, totalSpend);
    const costPerView = totalViews > 0 ? totalSpend / totalViews : 0;

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>{campaign.name}</Text>
                        <Text style={styles.subtitle}>Generated Report • {new Date().toLocaleDateString()}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 10, color: '#666' }}>Objective: {campaign.objective}</Text>
                        <Text style={{ fontSize: 10, color: '#666' }}>Platform: {campaign.platform}</Text>
                    </View>
                </View>

                {/* Executive Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Performance Summary</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Total Spend</Text>
                            <Text style={styles.metricValue}>{formatIDR(totalSpend)}</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Total Revenue</Text>
                            <Text style={styles.metricValue}>{formatIDR(totalRevenue)}</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>ROI</Text>
                            <Text style={{ ...styles.metricValue, color: roi > 0 ? '#10B981' : '#EF4444' }}>
                                {roi.toFixed(1)}%
                            </Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Total Views</Text>
                            <Text style={styles.metricValue}>
                                {new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(totalViews)}
                            </Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Engagements</Text>
                            <Text style={styles.metricValue}>
                                {new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(totalEngagements)}
                            </Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricLabel}>Cost / View</Text>
                            <Text style={styles.metricValue}>{formatIDR(costPerView)}</Text>
                        </View>
                    </View>
                </View>

                {/* Influencer Table */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Influencer Breakdown</Text>
                    <View style={styles.table}>
                        {/* Table Header */}
                        <View style={styles.tableRow}>
                            <View style={{ ...styles.tableColHeader, width: '30%' }}>
                                <Text style={styles.tableCellHeader}>Name</Text>
                            </View>
                            <View style={styles.tableColHeader}>
                                <Text style={styles.tableCellHeader}>Views</Text>
                            </View>
                            <View style={styles.tableColHeader}>
                                <Text style={styles.tableCellHeader}>Sales</Text>
                            </View>
                            <View style={styles.tableColHeader}>
                                <Text style={styles.tableCellHeader}>Cost</Text>
                            </View>
                        </View>
                        {/* Table Rows */}
                        {deliverables.map((item, idx) => (
                            <View style={styles.tableRow} key={idx}>
                                <View style={{ ...styles.tableCol, width: '30%' }}>
                                    <Text style={styles.tableCell}>{item?.name}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>{new Intl.NumberFormat('en-US').format(item?.views || 0)}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>{formatIDR(item?.sales || 0)}</Text>
                                </View>
                                <View style={styles.tableCol}>
                                    <Text style={styles.tableCell}>{formatIDR(item?.cost || 0)}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    Hubz Porto KOL Dashboard • Confidential Report • {new Date().getFullYear()}
                </Text>
            </Page>
        </Document>
    );
};
