const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Generate a random 32-character hex string for NEXTAUTH_SECRET
const generateSecret = () => crypto.randomBytes(16).toString("hex");

// Create .env.local file
const envContent = `NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${generateSecret()}
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
`;

fs.writeFileSync(path.join(__dirname, ".env.local"), envContent);

console.log(
  "\x1b[32m%s\x1b[0m",
  "✓ Created .env.local file with required environment variables."
);
console.log(
  "\x1b[36m%s\x1b[0m",
  "You can now start the development server with: npm run dev"
);
