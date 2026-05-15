import { NextResponse } from 'next/server';
import { createOrder, createOrderItems } from '@/lib/db';
import { generateRandomOrderNumber } from '@/lib/utils';

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
      items,
    } = body;

    // Validate required fields
    if (
      !company_id ||
      !customer_name ||
      !customer_phone ||
      !customer_company ||
      !delivery_address ||
      !items ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const total_amount = items.reduce(
      (sum: number, item: { unit_price: number; quantity: number }) =>
        sum + item.unit_price * item.quantity,
      0
    );

    // Create order
    const order = await createOrder({
      order_number: generateRandomOrderNumber(),
      company_id,
      customer_name,
      customer_phone,
      customer_company,
      delivery_address,
      total_amount,
      notes: notes || '',
      status: 'pending',
      order_date: new Date().toISOString(),
    });

    // Create order items
    const orderItems = await createOrderItems(
      items.map(
        (item: { uniform_size_id: string; quantity: number; unit_price: number }) => ({
          order_id: order.id,
          uniform_size_id: item.uniform_size_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })
      )
    );

    return NextResponse.json({ order, items: orderItems }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
