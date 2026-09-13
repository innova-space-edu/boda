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
document.addEventListener("DOMContentLoaded", function () {
  const script = document.createElement("script");
  script.src = window.location.pathname.endsWith("/admin.html") ? "admin-extra.js" : "invitation-extra.js";
  document.body.appendChild(script);
});
`;

fs.writeFileSync(path.join(out, "supabase-config.js"), config);

["admin-extra.js", "invitation-extra.js"].forEach((file) => {
  fs.copyFileSync(path.join(process.cwd(), file), path.join(out, file));
});

console.log("Supabase config generada.");
