require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const { createReadStream } = require('fs');
const { parse } = require('csv-parse');
const path = require('path');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const CSV_PATH = path.join(__dirname, 'credentials.csv');

async function importAgencies() {
  const records = [];
  await new Promise((resolve, reject) => {
    createReadStream(CSV_PATH)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row) => records.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`\n📋 ${records.length} agences à importer...\n`);
  let success = 0;
  let errors = 0;

  for (const row of records) {
    const { nom_agence, email, password } = row;

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (authError) { console.error(`❌ Auth [${email}]: ${authError.message}`); errors++; continue; }

    const userId = authData.user.id;

    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .insert({ name: nom_agence, billing_email: email })
      .select('id').single();
    if (agencyError) { console.error(`❌ Agency [${nom_agence}]: ${agencyError.message}`); errors++; continue; }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: userId, full_name: nom_agence, email, role: 'admin_agence', agency_id: agencyData.id });
    if (profileError) { console.error(`❌ Profile [${nom_agence}]: ${profileError.message}`); errors++; continue; }

    success++;
    console.log(`✅ [${success}] ${nom_agence} — ${email}`);
  }
  console.log(`\n🎉 Terminé : ${success} succès | ${errors} erreurs\n`);
}

importAgencies().catch(console.error);
