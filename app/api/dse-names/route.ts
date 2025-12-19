import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Fetch all unique dse_name values from dse_attendance table
    const { data, error } = await supabase
      .from('dse_attendance')
      .select('dse_name')
      .not('dse_name', 'is', null)
      .order('dse_name', { ascending: true });

    if (error) {
      console.error('Error fetching dse_name values:', error);
      return NextResponse.json(
        { error: 'Failed to fetch dse_name values', details: error.message },
        { status: 500 }
      );
    }

    // Get unique dse_name values
    const uniqueNames = [...new Set(data.map(item => item.dse_name).filter(Boolean))];

    return NextResponse.json({
      success: true,
      total: uniqueNames.length,
      dse_names: uniqueNames,
      // Also return raw data with counts
      raw_data: data
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

