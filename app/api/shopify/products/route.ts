import { NextRequest, NextResponse } from 'next/server';
import { storefrontClient } from '@/lib/shopify/client';
import { PRODUCTS_QUERY } from '@/lib/shopify/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const first = parseInt(searchParams.get('first') || '20');
    const after = searchParams.get('after') || undefined;
    
    const response = await storefrontClient.request(PRODUCTS_QUERY, {
      variables: {
        first,
        after,
      },
    });
    
    if (response.errors) {
      console.error('Shopify API errors:', response.errors);
      return NextResponse.json(
        { error: 'Failed to fetch products', details: response.errors },
        { status: 500 }
      );
    }
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

