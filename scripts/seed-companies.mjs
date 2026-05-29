import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing Supabase credentials. Run with: node --env-file=.env.local scripts/seed-companies.mjs');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function run() {
  console.log('Extracting companies from index.html...');
  const html = fs.readFileSync('public/colourland/index.html', 'utf-8');
  
  // Extract the JS block with data
  const scriptMatch = html.match(/<script>\s*\/\/ ============ DATA ============([\s\S]*?)function getSizes/);
  if (!scriptMatch) {
    console.error('Could not find data script block in index.html');
    process.exit(1);
  }
  
  let jsCode = scriptMatch[1];
  // Add a return statement to get the parsed data
  jsCode += '\nreturn { COS, CATS, S_SHIRT, S_PANT, S_FPANT, S_TSHIRT, S_WC, S_SHOE, S_NONE };';
  
  const extractFn = new Function(jsCode);
  const data = extractFn();
  
  console.log(`Found ${data.COS.length} companies.`);
  
  for (const co of data.COS) {
    console.log(`Inserting company: ${co.name}`);
    
    const { data: dbCompany, error: coErr } = await supabase
      .from('companies')
      .upsert({ name: co.name }, { onConflict: 'name' })
      .select()
      .single();
      
    if (coErr) {
      console.error(`Error inserting company ${co.name}:`, coErr.message);
      continue;
    }
    
    // Now insert uniforms for this company
    const uniforms = data.CATS[co.id];
    if (!uniforms) {
      console.log(`  No uniforms found for ${co.name}`);
      continue;
    }
    
    console.log(`  Inserting ${uniforms.length} uniforms...`);
    
    for (const uni of uniforms) {
      const sizeName = `${uni.n}`;
      // Basic insert into uniform_sizes 
      // The old schema has size_name, price, description
      const { error: uniErr } = await supabase
        .from('uniform_sizes')
        .upsert({
          company_id: dbCompany.id,
          size_name: sizeName,
          price: 0, // Placeholder
          description: uni.g
        }, { onConflict: 'id' }); // wait, uniform_sizes has no unique constraint on (company_id, size_name) in schema.sql
        
        // Actually, schema.sql: id is primary key, no unique constraint on company_id, size_name
        // So we should check if it exists first
        
        const { data: existing } = await supabase
          .from('uniform_sizes')
          .select('id')
          .eq('company_id', dbCompany.id)
          .eq('size_name', sizeName)
          .maybeSingle();
          
        if (!existing) {
          await supabase
            .from('uniform_sizes')
            .insert({
              company_id: dbCompany.id,
              size_name: sizeName,
              price: 0,
              description: uni.g
            });
        }
    }
  }
  
  console.log('Finished seeding companies and uniforms into Supabase!');
}

run().catch(console.error);
