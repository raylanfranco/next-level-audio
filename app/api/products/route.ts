import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Product } from '@/types/product';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured', products: [] },
        { status: 200 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse query parameters for filtering
    const search = searchParams.get('search') || undefined;
    const source = searchParams.get('source') || undefined; // 'clover' | 'affiliate' | 'shopify'
    const availability = searchParams.get('availability') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const category = searchParams.get('category') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`);
    }

    if (source) {
      query = query.eq('source', source);
    }

    if (availability) {
      query = query.eq('availability', availability);
    }

    if (brand) {
      query = query.eq('brand', brand);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (featured !== undefined) {
      query = query.eq('featured', featured);
    }

    // Apply pagination and ordering
    query = query
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products', details: error.message, products: [] },
        { status: 500 }
      );
    }

    // Transform database format to Product type
    const products: Product[] = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      price: parseFloat(row.price),
      currency: row.currency,
      images: row.images || [],
      source: row.source,
      availability: row.availability,
      cloverItemId: row.clover_item_id,
      stockQuantity: row.stock_quantity,
      affiliateUrl: row.affiliate_url,
      affiliateBrand: row.affiliate_brand,
      affiliateCommission: row.affiliate_commission ? parseFloat(row.affiliate_commission) : undefined,
      estimatedDelivery: row.estimated_delivery,
      category: row.category,
      brand: row.brand,
      sku: row.sku,
      featured: row.featured,
      handle: row.handle,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({
      products,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', products: [] },
      { status: 500 }
    );
  }
}

// POST endpoint to create new products (for admin)
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.price || !body.source) {
      return NextResponse.json(
        { error: 'Missing required fields: title, price, source' },
        { status: 400 }
      );
    }

    // Transform Product type to database format
    const productData = {
      title: body.title,
      description: body.description,
      price: body.price,
      currency: body.currency || 'USD',
      source: body.source,
      availability: body.availability || (body.source === 'affiliate' ? 'special-order' : 'in-stock'),
      clover_item_id: body.cloverItemId,
      stock_quantity: body.stockQuantity,
      affiliate_url: body.affiliateUrl,
      affiliate_brand: body.affiliateBrand,
      affiliate_commission: body.affiliateCommission,
      estimated_delivery: body.estimatedDelivery,
      category: body.category,
      brand: body.brand,
      sku: body.sku,
      featured: body.featured || false,
      handle: body.handle,
      images: body.images || [],
    };

    const query = supabase.from('products') as any;
    const { data, error } = await query
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create product', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
