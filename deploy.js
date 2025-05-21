const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to generate a secure random secret
const generateSecret = () => crypto.randomBytes(32).toString("hex");

// Function to prompt for input with a default value
const prompt = (question, defaultValue) => {
  return new Promise((resolve) => {
    rl.question(`${question} (default: ${defaultValue}): `, (answer) => {
      resolve(answer || defaultValue);
    });
  });
};

async function main() {
  console.log("\n🚀 DDS Portal Production Deployment Setup\n");

  // Get production URLs and settings
  const nextAuthUrl = await prompt(
    "Enter production NEXTAUTH_URL",
    "https://your-production-domain.com"
  );
  const backendUrl = await prompt(
    "Enter production NEXT_PUBLIC_BACKEND_URL",
    "https://your-backend-api-domain.com"
  );

  // Generate or use provided secret
  let secret;
  const useGeneratedSecret = await prompt(
    "Generate a random NEXTAUTH_SECRET? (yes/no)",
    "yes"
  );

  if (useGeneratedSecret.toLowerCase() === "yes") {
    secret = generateSecret();
    console.log(`\n✅ Generated secure NEXTAUTH_SECRET: ${secret}`);
  } else {
    secret = await prompt(
      "Enter your NEXTAUTH_SECRET",
      "production-secret-key-replace-this"
    );
  }

  // Create production env file
  const envContent = `# Production environment settings
NEXTAUTH_URL=${nextAuthUrl}
NEXTAUTH_SECRET=${secret}
NEXT_PUBLIC_BACKEND_URL=${backendUrl}
`;

  fs.writeFileSync(path.join(__dirname, ".env.production"), envContent);

  console.log("\n✅ Created .env.production file with your settings");
  console.log("\n📝 Next steps:");
  console.log('1. Run "npm run build" to build the production version');
  console.log(
    "2. Deploy the .next folder, public folder, package.json, and .env.production to your server"
  );
  console.log('3. Run "npm install --production" on your server');
  console.log('4. Start the application with "npm start"\n');

  rl.close();
}

main().catch(console.error);
