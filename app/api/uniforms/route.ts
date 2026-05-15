import { NextResponse } from 'next/server';
import { getUniformSizesByCompany } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    const uniforms = await getUniformSizesByCompany(companyId);
    return NextResponse.json(uniforms);
  } catch (error) {
    console.error('Error fetching uniforms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch uniforms' },
      { status: 500 }
    );
  }
}
