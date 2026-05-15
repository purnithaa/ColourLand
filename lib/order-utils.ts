import type { OrderItem, OrderWithCompany } from './db';

export type OrderMetadata = {
  email?: string;
  branch?: string;
  city?: string;
  state?: string;
  pin?: string;
  catalogue?: string;
  time?: string;
  logo?: { name?: string; placement?: string; remarks?: string; dataUrl?: string };
  template?: { name?: string; rowCount?: number; dataUrl?: string };
};

export function parseOrderNotes(notes?: string | null): OrderMetadata {
  if (!notes) return {};
  try {
    return JSON.parse(notes) as OrderMetadata;
  } catch {
    return {};
  }
}

export function formatStatusForUi(status: string): string {
  const map: Record<string, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
  };
  return map[status.toLowerCase()] || status;
}

export function formatStatusForDb(status: string): string {
  const map: Record<string, string> = {
    Pending: 'pending',
    'In Progress': 'in_progress',
    Completed: 'completed',
  };
  return map[status] || status.toLowerCase().replace(/\s+/g, '_');
}

export function formatOrderForAdmin(
  order: OrderWithCompany & { items: OrderItem[] }
) {
  const meta = parseOrderNotes(order.notes);
  const companyName =
    meta.catalogue ||
    (order.companies && 'name' in order.companies
      ? order.companies.name
      : '') ||
    '';

  const orderDate = new Date(order.order_date);

  return {
    id: order.order_number,
    dbId: order.id,
    name: order.customer_name,
    email: meta.email || '',
    phone: order.customer_phone,
    companyName: order.customer_company,
    branch: meta.branch || '',
    address: order.delivery_address.split(',')[0]?.trim() || order.delivery_address,
    city: meta.city || '',
    state: meta.state || '',
    pin: meta.pin || '',
    fullAddress: order.delivery_address,
    company: companyName,
    items: order.items.map((item) => ({
      name: item.item_name,
      size: item.size_name || '',
      qty: item.quantity,
    })),
    logo: meta.logo || null,
    template: meta.template || null,
    date: orderDate.toLocaleDateString('en-IN'),
    time: meta.time || '',
    dateRaw: orderDate.toISOString().split('T')[0],
    status: formatStatusForUi(order.status),
  };
}
