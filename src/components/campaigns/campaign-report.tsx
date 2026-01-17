"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Campaign, KOL } from '@/lib/static-data';
import { format } from 'date-fns';

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
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
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold', // Helvetica bold is standardized
        textTransform: 'uppercase',
    },
    date: {
        fontSize: 10,
        color: '#666',
    },
    section: {
        margin: 10,
        padding: 10,
    },
    statGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        backgroundColor: '#f4f4f5',
        padding: 15,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#000000',
    },
    statBox: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 10,
        color: '#666',
        textTransform: 'uppercase',
        marginTop: 4,
    },
    table: {
        display: "flex",
        width: "auto",
        borderStyle: "solid",
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderColor: '#000000',
        marginTop: 20,
    },
    tableRow: {
        margin: "auto",
        flexDirection: "row",
        borderBottomColor: '#000000',
        borderBottomWidth: 1,
    },
    tableColHeader: {
        width: "25%",
        borderStyle: "solid",
        borderRightWidth: 1,
        borderRightColor: '#000000',
        paddingLeft: 5,
        paddingTop: 5,
        backgroundColor: '#e4e4e7',
    },
    tableCol: {
        width: "25%",
        borderStyle: "solid",
        borderRightWidth: 1,
        borderRightColor: '#000000',
        paddingLeft: 5,
        paddingTop: 5,
        paddingBottom: 5,
    },
    tableCellHeader: {
        margin: "auto",
        marginTop: 5,
        fontSize: 10,
        fontWeight: 'bold',
    },
    tableCell: {
        margin: "auto",
        marginTop: 5,
        fontSize: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 10,
        color: '#999',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
});

interface CampaignReportProps {
    campaign: Campaign;
    kols: KOL[];
}

export const CampaignReport = ({ campaign, kols }: CampaignReportProps) => {
    // Filter KOLs belonging to this campaign
    const campaignKOLs = kols.filter(k =>
        campaign.deliverables.some(d => d.kolId === k.id)
    );

    const calculateTotal = (field: 'totalViews' | 'totalEngagements' | 'salesGenerated') => {
        return campaign.deliverables.reduce((acc, curr) => acc + (curr[field] || 0), 0);
    };

    const totalViews = calculateTotal('totalViews');
    const totalEngagements = calculateTotal('totalEngagements');
    const salesGenerated = calculateTotal('salesGenerated');

    // Format IDR
    const formatIDR = (num: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={{ fontSize: 10, marginBottom: 4, color: '#666' }}>CAMPAIGN REPORT</Text>
                        <Text style={styles.title}>{campaign.name}</Text>
                    </View>
                    <Text style={styles.date}>Generated: {format(new Date(), 'MMM d, yyyy')}</Text>
                </View>

                {/* High Level Stats */}
                <View style={styles.statGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{new Intl.NumberFormat('en-US', { notation: "compact" }).format(totalViews)}</Text>
                        <Text style={styles.statLabel}>Total Views</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{new Intl.NumberFormat('en-US', { notation: "compact" }).format(totalEngagements)}</Text>
                        <Text style={styles.statLabel}>Engagements</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{formatIDR(salesGenerated)}</Text>
                        <Text style={styles.statLabel}>Sales</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{campaignKOLs.length}</Text>
                        <Text style={styles.statLabel}>Active KOLs</Text>
                    </View>
                </View>

                {/* Campaign Info */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5 }}>Campaign Details</Text>
                    <Text style={{ fontSize: 10, marginBottom: 3 }}>Platform: {campaign.platform}</Text>
                    <Text style={{ fontSize: 10, marginBottom: 3 }}>Objective: {campaign.objective}</Text>
                    <Text style={{ fontSize: 10, marginBottom: 3 }}>Budget: {formatIDR(campaign.budget)}</Text>
                </View>

                {/* KOL Table */}
                <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 10 }}>Top Performers</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>KOL Name</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Role</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Views</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Status</Text></View>
                    </View>
                    {campaignKOLs.map(kol => {
                        const del = campaign.deliverables.find(d => d.kolId === kol.id);
                        return (
                            <View style={styles.tableRow} key={kol.id}>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>{kol.name}</Text></View>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>{kol.type}</Text></View>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>{new Intl.NumberFormat('en-US').format(del?.totalViews || 0)}</Text></View>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>{del?.status || '-'}</Text></View>
                            </View>
                        );
                    })}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Hubz KOL Management Platform • Confidential Report</Text>
                </View>
            </Page>
        </Document>
    );
};
