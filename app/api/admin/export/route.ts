import { NextResponse } from 'next/server';
import { getOrdersWithItems } from '@/lib/db';
import { cookies } from 'next/headers';
import * as XLSX from 'xlsx';

async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get('admin_session');
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const ordersWithItems = await getOrdersWithItems();

    // Flatten orders with their items for Excel export
    const flattenedData = ordersWithItems.flatMap((order) =>
      order.items.length > 0
        ? order.items.map((item) => ({
            'Order Number': order.order_number,
            'Customer Name': order.customer_name,
            'Customer Company': order.customer_company,
            'Phone': order.customer_phone,
            'Delivery Address': order.delivery_address,
            'Status': order.status,
            'Order Date': new Date(order.order_date).toLocaleDateString(),
            'Total Amount': `$${order.total_amount.toFixed(2)}`,
            'Notes': order.notes || '',
          }))
        : [
            {
              'Order Number': order.order_number,
              'Customer Name': order.customer_name,
              'Customer Company': order.customer_company,
              'Phone': order.customer_phone,
              'Delivery Address': order.delivery_address,
              'Status': order.status,
              'Order Date': new Date(order.order_date).toLocaleDateString(),
              'Total Amount': `$${order.total_amount.toFixed(2)}`,
              'Notes': order.notes || '',
            },
          ]
    );

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Generate buffer
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Return file as response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="orders_${new Date().getTime()}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting orders:', error);
    return NextResponse.json(
      { error: 'Failed to export orders' },
      { status: 500 }
    );
  }
}
