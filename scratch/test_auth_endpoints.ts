import axios from "axios";
import { PrismaClient } from "@prisma/client";

const BASE_URL = "http://localhost:3000/api";
const REGULAR_USER_ID = "59ee4958-7c37-4e2a-a68e-e760b6182572";
const ADMIN_USER_ID = "75c9da4d-19f6-4bcc-b3c2-2aaf2e0d780e";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== STARTING ROLE-BASED ACCESS CONTROL API TESTS ===");

  // 1. Create a temporary report for testing approve/reject actions
  console.log("\n[Setup] Creating a temporary pending report...");
  const tempReport = await prisma.report.create({
    data: {
      title: "Test Report for Auth check",
      description: "Temporary report",
      category: "PHISHING",
      userId: REGULAR_USER_ID,
      entityId: "bb460d5a-b006-4148-afde-2e5e38ffebb2",
      status: "PENDING",
    },
  });
  console.log(`[Setup] Report created with ID: ${tempReport.id}`);

  const endpoints = [
    { method: "GET", path: "/admin/dashboard", expectGuest: 401, expectUser: 403, expectAdmin: 200 },
    { method: "GET", path: "/admin/reports/pending", expectGuest: 401, expectUser: 403, expectAdmin: 200 },
    { method: "PATCH", path: `/admin/reports/${tempReport.id}/reject`, expectGuest: 401, expectUser: 403, expectAdmin: 200 },
    { method: "PATCH", path: `/admin/reports/${tempReport.id}/approve`, expectGuest: 401, expectUser: 403, expectAdmin: 200 },
  ];

  let allPassed = true;

  // 2. Guest access (no header)
  console.log("\n--- TEST 1: GUEST ACCESS (EXPECT 401) ---");
  for (const ep of endpoints) {
    try {
      const response = await axios({
        method: ep.method,
        url: `${BASE_URL}${ep.path}`
      });
      console.log(`❌ FAIL: ${ep.method} ${ep.path} returned ${response.status} (expected ${ep.expectGuest})`);
      allPassed = false;
    } catch (error: any) {
      if (error.response && error.response.status === ep.expectGuest) {
        console.log(`✅ PASS: ${ep.method} ${ep.path} returned ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else {
        console.log(`❌ FAIL: ${ep.method} ${ep.path} failed with: ${error.response ? error.response.status : error.message}`);
        allPassed = false;
      }
    }
  }

  // 3. Regular user access (role = USER)
  console.log("\n--- TEST 2: REGULAR USER ACCESS (EXPECT 403) ---");
  for (const ep of endpoints) {
    try {
      const response = await axios({
        method: ep.method,
        url: `${BASE_URL}${ep.path}`,
        headers: {
          Authorization: `Bearer ${REGULAR_USER_ID}`
        }
      });
      console.log(`❌ FAIL: ${ep.method} ${ep.path} returned ${response.status} (expected ${ep.expectUser})`);
      allPassed = false;
    } catch (error: any) {
      if (error.response && error.response.status === ep.expectUser) {
        console.log(`✅ PASS: ${ep.method} ${ep.path} returned ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else {
        console.log(`❌ FAIL: ${ep.method} ${ep.path} failed with: ${error.response ? error.response.status : error.message}`);
        allPassed = false;
      }
    }
  }

  // 4. Admin user access (role = ADMIN)
  console.log("\n--- TEST 3: ADMIN ACCESS (EXPECT 200/400) ---");
  // We'll test GET /admin/dashboard and GET /admin/reports/pending
  for (const ep of endpoints.slice(0, 2)) {
    try {
      const response = await axios({
        method: ep.method,
        url: `${BASE_URL}${ep.path}`,
        headers: {
          Authorization: `Bearer ${ADMIN_USER_ID}`
        }
      });
      if (response.status === ep.expectAdmin) {
        console.log(`✅ PASS: ${ep.method} ${ep.path} returned ${response.status}`);
      } else {
        console.log(`❌ FAIL: ${ep.method} ${ep.path} returned ${response.status} (expected ${ep.expectAdmin})`);
        allPassed = false;
      }
    } catch (error: any) {
      console.log(`❌ FAIL: ${ep.method} ${ep.path} failed: ${error.message}`);
      allPassed = false;
    }
  }

  // We'll test reject first, which should update status to REJECTED.
  const rejectEp = endpoints[2];
  try {
    const response = await axios({
      method: rejectEp.method,
      url: `${BASE_URL}${rejectEp.path}`,
      headers: {
        Authorization: `Bearer ${ADMIN_USER_ID}`
      }
    });
    if (response.status === rejectEp.expectAdmin) {
      console.log(`✅ PASS: ${rejectEp.method} ${rejectEp.path} returned ${response.status}`);
      // Verify in DB that it is REJECTED
      const updatedReport = await prisma.report.findUnique({ where: { id: tempReport.id } });
      if (updatedReport?.status === "REJECTED") {
        console.log(`✅ PASS: Report status is REJECTED in database`);
      } else {
        console.log(`❌ FAIL: Report status in database is ${updatedReport?.status} (expected REJECTED)`);
        allPassed = false;
      }
    } else {
      console.log(`❌ FAIL: ${rejectEp.method} ${rejectEp.path} returned ${response.status}`);
      allPassed = false;
    }
  } catch (error: any) {
    console.log(`❌ FAIL: ${rejectEp.method} ${rejectEp.path} failed: ${error.message}`);
    allPassed = false;
  }

  // Approve should now fail since the status is REJECTED (status 400 or similar, but wait, let's see how our approve/route.ts handles it)
  // Let's run a test on approve: it should either return 200 or 400 depending on implementation. Wait, approve checks:
  // if (report.status === "APPROVED") { return 400; }
  // Since it is REJECTED, it might succeed or fail. But we want to check if ADMIN can access it.
  const approveEp = endpoints[3];
  try {
    const response = await axios({
      method: approveEp.method,
      url: `${BASE_URL}${approveEp.path}`,
      headers: {
        Authorization: `Bearer ${ADMIN_USER_ID}`
      }
    });
    console.log(`✅ PASS: ${approveEp.method} ${approveEp.path} returned ${response.status}`);
    // Verify in DB that it is now APPROVED
    const updatedReport = await prisma.report.findUnique({ where: { id: tempReport.id } });
    if (updatedReport?.status === "APPROVED") {
      console.log(`✅ PASS: Report status is APPROVED in database`);
    } else {
      console.log(`❌ FAIL: Report status in database is ${updatedReport?.status} (expected APPROVED)`);
      allPassed = false;
    }
  } catch (error: any) {
    console.log(`❌ FAIL: ${approveEp.method} ${approveEp.path} failed: ${error.message}`);
    allPassed = false;
  }

  // 5. Cleanup
  console.log("\n[Cleanup] Deleting temporary report...");
  await prisma.report.delete({
    where: {
      id: tempReport.id,
    },
  });
  console.log("[Cleanup] Deleted temporary report.");

  await prisma.$disconnect();

  if (allPassed) {
    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉");
  } else {
    console.log("\n❌ SOME TESTS FAILED. ❌");
    process.exit(1);
  }
}

runTests().catch(async (e) => {
  console.error("Test execution failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
