const fs = require("fs");
const path = require("path");

// Load environment variables from .env
try {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");
    envFile.split("\n").forEach((line) => {
      const parts = line.split("=");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        let value = parts.slice(1).join("=").trim();
        // remove quotes if any
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error("Error loading .env", e);
}

const { PrismaClient } = require("C:/Users/USER/Desktop/ProofMe/src/generated/prisma/client");
const prisma = new PrismaClient();

async function main() {
  const reportId = "827aff1c-f023-40d3-9daf-4022404f5b82"; // Fake Vendor report ID (PENDING)
  const entityId = "c061c953-c070-4c6b-827e-599b3ff602ae"; // 08123456789 entity ID

  console.log("1. Generating test image buffer (1x1 PNG)...");
  const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  const imageBuffer = Buffer.from(base64Png, 'base64');
  
  // Create Blob/File from the buffer
  const blob = new Blob([imageBuffer], { type: 'image/png' });
  
  console.log("2. Sending POST request to /api/reports/[id]/evidence via multipart/form-data...");
  const formData = new FormData();
  formData.append('file', blob, 'test-pixel.png');

  const uploadUrl = `http://localhost:3000/api/reports/${reportId}/evidence`;
  console.log(`URL: ${uploadUrl}`);

  const res = await fetch(uploadUrl, {
    method: 'POST',
    body: formData
  });

  const uploadResult = await res.json();
  console.log("Upload Response status:", res.status);
  console.log("Upload Response body:", JSON.stringify(uploadResult, null, 2));

  if (!res.ok) {
    throw new Error(`Upload failed: ${JSON.stringify(uploadResult)}`);
  }

  const fileUrl = uploadResult.evidence.fileUrl;
  console.log("Uploaded Cloudinary URL:", fileUrl);

  console.log("\n3. Verifying that the Evidence record exists in the Prisma database...");
  const dbEvidence = await prisma.evidence.findFirst({
    where: {
      reportId: reportId,
      fileUrl: fileUrl
    }
  });

  if (dbEvidence) {
    console.log("✓ Success: Evidence found in database:", JSON.stringify(dbEvidence, null, 2));
  } else {
    throw new Error("✗ Failure: Evidence not found in database!");
  }

  console.log("\n4. Checking if evidence is returned when fetching the Entity Profile before approval...");
  const entityResBefore = await fetch(`http://localhost:3000/api/entities/${entityId}`);
  const entityProfileBefore = await entityResBefore.json();
  
  const allEvidenceBefore = (entityProfileBefore.reports || []).flatMap(r => r.evidence || []);
  console.log(`Number of evidence files on Entity before approval: ${allEvidenceBefore.length}`);

  console.log("\n5. Approving the report via PATCH /api/admin/reports/[id]/approve...");
  const approveRes = await fetch(`http://localhost:3000/api/admin/reports/${reportId}/approve`, {
    method: 'PATCH'
  });
  const approveData = await approveRes.json();
  console.log("Approve Response:", JSON.stringify(approveData, null, 2));

  console.log("\n6. Fetching the Entity Profile again after approval...");
  const entityResAfter = await fetch(`http://localhost:3000/api/entities/${entityId}`);
  const entityProfileAfter = await entityResAfter.json();
  
  const allEvidenceAfter = (entityProfileAfter.reports || []).flatMap(r => r.evidence || []);
  console.log(`Number of evidence files on Entity after approval: ${allEvidenceAfter.length}`);
  console.log("Evidence files on Entity after approval:");
  console.log(JSON.stringify(allEvidenceAfter, null, 2));

  if (allEvidenceAfter.some(e => e.fileUrl === fileUrl)) {
    console.log("✓ Success: The uploaded Cloudinary URL is returned in the evidence array on the Entity Profile!");
  } else {
    throw new Error("✗ Failure: Uploaded evidence is missing from the Entity Profile!");
  }
}

main()
  .catch(err => {
    console.error("Test error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
