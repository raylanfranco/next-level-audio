import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ProductImage } from '@/types/product';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Database update type matching the products table schema (snake_case)
type ProductUpdate = {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  source?: 'clover' | 'affiliate' | 'shopify';
  availability?: 'in-stock' | 'special-order' | 'low-stock' | 'out-of-stock';
  clover_item_id?: string;
  stock_quantity?: number;
  affiliate_url?: string;
  affiliate_brand?: string;
  affiliate_commission?: number;
  estimated_delivery?: string;
  category?: string;
  brand?: string;
  sku?: string;
  featured?: boolean;
  handle?: string;
  images?: ProductImage[];
};

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { id } = await params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PUT/PATCH update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Transform camelCase to snake_case for database
    const updateData: ProductUpdate = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.source !== undefined) updateData.source = body.source;
    if (body.availability !== undefined) updateData.availability = body.availability;
    if (body.cloverItemId !== undefined) updateData.clover_item_id = body.cloverItemId;
    if (body.stockQuantity !== undefined) updateData.stock_quantity = body.stockQuantity;
    if (body.affiliateUrl !== undefined) updateData.affiliate_url = body.affiliateUrl;
    if (body.affiliateBrand !== undefined) updateData.affiliate_brand = body.affiliateBrand;
    if (body.affiliateCommission !== undefined) updateData.affiliate_commission = body.affiliateCommission;
    if (body.estimatedDelivery !== undefined) updateData.estimated_delivery = body.estimatedDelivery;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.brand !== undefined) updateData.brand = body.brand;
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.featured !== undefined) updateData.featured = body.featured;
    if (body.handle !== undefined) updateData.handle = body.handle;
    if (body.images !== undefined) updateData.images = body.images;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { error: 'Failed to update product', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ product: data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { id } = await params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete product', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
