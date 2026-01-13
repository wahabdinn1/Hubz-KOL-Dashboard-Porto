"use client";

import { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CampaignReport } from './campaign-report';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { Campaign, KOL } from '@/lib/static-data';

export const CampaignDownloadButton = ({ campaign, kols }: { campaign: Campaign, kols: KOL[] }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <Button variant="outline" size="sm" disabled>
                <FileDown className="h-4 w-4 mr-2" />
                Export PDF
            </Button>
        );
    }

    return (
        <PDFDownloadLink
            document={<CampaignReport campaign={campaign} kols={kols} />}
            fileName={`report-${campaign.name.toLowerCase().replace(/\s+/g, '-')}.pdf`}
        >
            {/* @ts-ignore */}
            {({ blob, url, loading, error }) => (
                <Button variant="outline" size="sm" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
                    {loading ? 'Generating...' : 'Export PDF'}
                </Button>
            )}
        </PDFDownloadLink>
    );
};
