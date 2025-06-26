const axios = require("axios");

// Backend URL
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

async function testBackendConnection() {
  console.log(`Testing connection to backend at: ${BACKEND_URL}`);

  try {
    // Test CSRF endpoint
    console.log("Testing CSRF endpoint...");
    const csrfResponse = await axios.get(`${BACKEND_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    console.log("CSRF Response Status:", csrfResponse.status);
    console.log("CSRF Response Headers:", csrfResponse.headers);
    console.log("✓ CSRF endpoint working correctly");

    // Test login with hard-coded credentials
    console.log("\nTesting login endpoint...");

    // Use CSRF token if available
    const csrfToken = csrfResponse.headers["set-cookie"]
      ?.find((cookie) => cookie.includes("XSRF-TOKEN"))
      ?.split(";")[0]
      ?.split("=")[1];

    const loginResponse = await axios.post(
      `${BACKEND_URL}/api/token-login`,
      {
        email: "dadsdevteam@example.com",
        password: "dds2024",
      },
      {
        withCredentials: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...(csrfToken && { "X-XSRF-TOKEN": csrfToken }),
        },
      }
    );

    console.log("Login Response Status:", loginResponse.status);
    console.log("Login Response Data:", loginResponse.data);
    console.log("✓ Login endpoint working correctly");

    // Test user endpoint
    console.log("\nTesting user endpoint...");
    const userResponse = await axios.get(`${BACKEND_URL}/api/user`, {
      withCredentials: true,
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(csrfToken && { "X-XSRF-TOKEN": csrfToken }),
      },
    });

    console.log("User Response Status:", userResponse.status);
    console.log("User Response Data:", userResponse.data);
    console.log("✓ User endpoint working correctly");

    console.log("\n✓ All backend endpoints are working correctly!");
    process.exit(0);
  } catch (error) {
    console.error("\n✗ Error testing backend connection:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received from backend.");
      console.error("Is the backend server running?");
    } else {
      console.error("Error:", error.message);
    }

    process.exit(1);
  }
}

testBackendConnection();
