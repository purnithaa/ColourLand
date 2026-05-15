import { createClient } from './supabase/server';

export interface Company {
  id: string;
  name: string;
  created_at: string;
}

export interface UniformSize {
  id: string;
  company_id: string;
  size_name: string;
  price: number;
  description?: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  company_id: string;
  customer_name: string;
  customer_phone: string;
  customer_company: string;
  delivery_address: string;
  order_date: string;
  status: string;
  total_amount: number;
  notes?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  uniform_size_id: string | null;
  item_name: string;
  size_name: string | null;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface OrderWithCompany extends Order {
  companies?: { name: string } | null;
}

// Company queries
export async function getCompanies(): Promise<Company[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

// Uniform size queries
export async function getUniformSizesByCompany(companyId: string): Promise<UniformSize[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('uniform_sizes')
    .select('*')
    .eq('company_id', companyId)
    .order('size_name');

  if (error) throw error;
  return data || [];
}

// Order queries
export async function createOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOrders(limit = 100, offset = 0): Promise<OrderWithCompany[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*, companies(name)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteOrder(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Order items queries
export type CreateOrderItemInput = {
  order_id: string;
  uniform_size_id?: string | null;
  item_name: string;
  size_name?: string | null;
  quantity: number;
  unit_price: number;
};

export async function createOrderItems(items: CreateOrderItemInput[]): Promise<OrderItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('order_items')
    .insert(items)
    .select();

  if (error) throw error;
  return data || [];
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (error) throw error;
  return data || [];
}

export async function getCompanyByName(name: string): Promise<Company | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .ilike('name', name)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function getOrdersWithItems(limit = 100, offset = 0): Promise<(OrderWithCompany & { items: OrderItem[] })[]> {
  const orders = await getOrders(limit, offset);
  
  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await getOrderItems(order.id);
      return { ...order, items };
    })
  );

  return ordersWithItems;
}
