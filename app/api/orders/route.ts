import { NextResponse } from 'next/server';
import { createOrder, createOrderItems, getCompanyById } from '@/lib/db';
import { generateRandomOrderNumber } from '@/lib/utils';

type OrderItemInput = {
  uniform_size_id?: string;
  item_name: string;
  size_name?: string;
  quantity: number;
  unit_price?: number;
};

type OrderMetadata = {
  email?: string;
  branch?: string;
  city?: string;
  state?: string;
  pin?: string;
  catalogue?: string;
  time?: string;
  logo?: { name?: string; placement?: string; remarks?: string };
  template?: { name?: string; rowCount?: number };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      company_id,
      customer_name,
      customer_phone,
      customer_company,
      delivery_address,
      notes,
      metadata,
      items,
    } = body as {
      company_id: string;
      customer_name: string;
      customer_phone: string;
      customer_company: string;
      delivery_address: string;
      notes?: string;
      metadata?: OrderMetadata;
      items: OrderItemInput[];
    };

    if (
      !company_id ||
      !customer_name ||
      !customer_phone ||
      !customer_company ||
      !delivery_address
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let orderItems = items || [];
    if (orderItems.length === 0 && metadata?.template) {
      orderItems = [
        {
          item_name: `Employee template: ${metadata.template.name || 'uploaded'}`,
          size_name: null,
          quantity: 1,
          unit_price: 0,
        },
      ];
    }

    if (orderItems.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    const company = await getCompanyById(company_id);
    if (!company) {
      return NextResponse.json({ error: 'Invalid company' }, { status: 400 });
    }

    const notesPayload = {
      ...(metadata || {}),
      catalogue: metadata?.catalogue || company.name,
    };

    const total_amount = orderItems.reduce(
      (sum, item) => sum + (item.unit_price ?? 0) * item.quantity,
      0
    );

    const order = await createOrder({
      order_number: generateRandomOrderNumber(),
      company_id,
      customer_name,
      customer_phone,
      customer_company,
      delivery_address,
      total_amount,
      notes: notes || JSON.stringify(notesPayload),
      status: 'pending',
      order_date: new Date().toISOString(),
    });

    const savedItems = await createOrderItems(
      orderItems.map((item) => ({
        order_id: order.id,
        uniform_size_id: item.uniform_size_id ?? null,
        item_name: item.item_name,
        size_name: item.size_name ?? null,
        quantity: item.quantity,
        unit_price: item.unit_price ?? 0,
      }))
    );

    return NextResponse.json({ order, items: savedItems }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
