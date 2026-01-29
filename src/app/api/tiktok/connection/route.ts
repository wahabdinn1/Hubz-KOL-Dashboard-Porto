import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE() {
    try {
        const supabase = await createClient();
        
        const { error } = await supabase
            .from('integrations')
            .delete()
            .eq('platform', 'tiktok_shop');

        if (error) {
             console.error("DB Error disconnecting:", error);
             return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Disconnect API Error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
