const fs = require("fs");
const path = require("path");

const out = path.join(process.cwd(), "out");

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "";

const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

const config = `window.SUPABASE_URL = ${JSON.stringify(supabaseUrl)};
window.SUPABASE_ANON_KEY = ${JSON.stringify(supabaseAnonKey)};
`;

fs.writeFileSync(path.join(out, "supabase-config.js"), config);

console.log("Supabase config generada.");
