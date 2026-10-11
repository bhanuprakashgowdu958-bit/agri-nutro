// Comprehensive Automated Verification Suite for Gemini AI Integration
// Tests 6 diverse, out-of-the-box categories to verify real-time dynamic generation.

const http = require('http');
const fs = require('fs');
const path = require('path');

const testCases = [
  {
    id: 1,
    category: "Unusual / Exotic Livestock",
    prompt: "Can ostriches or emus be raised on standard broiler starter crumbles, or what are the risks of perosis and slipped tendon?",
    expectedFocus: "Ratite leg growth, Calcium/Phosphorus balance, Manganese, avoids overly rapid broiler weight gain"
  },
  {
    id: 2,
    category: "Emergency Veterinary Nutrition",
    prompt: "My dairy cow has acute frothy bloat after grazing lush green legumes. What immediate feeding and rumen buffering action is needed?",
    expectedFocus: "Rumen surfactant/oil, poloxalene, rumen pH, bloat mitigation, transition"
  },
  {
    id: 3,
    category: "Indian Summer Heat Stress Protocol",
    prompt: "During May-June heatwaves in Haryana (44°C), my Murrah buffaloes drop 30% milk yield. How should I adjust bypass fat, potassium, and night feeding?",
    expectedFocus: "Dietary cation-anion difference (DCAD), bypass fat/energy density, night feeding, metabolic heat"
  },
  {
    id: 4,
    category: "Conversational Identity & Farmer Guidance",
    prompt: "Who are you and what specific scientific benchmarks does NutriAgro use for commercial feed formulation?",
    expectedFocus: "Dr. Thorne persona, Crude Protein, NIR spectrophotometry, FCR targets, NutriAgro benchmarks"
  },
  {
    id: 5,
    category: "Mathematical Herd Ration & Feed Consumption",
    prompt: "I have 500 Cobb-500 broilers in Week 4 (Day 22-28). How much feed will they eat daily in kg, and what is their corresponding water requirement?",
    expectedFocus: "Broiler intake calculations (approx. 120-150g/bird/day), 2:1 water ratio, total daily kg"
  },
  {
    id: 6,
    category: "Agronomy / Plant Science",
    prompt: "Explain why harvesting alfalfa/lucerne at the early bloom (10% bloom) stage gives the best balance of Crude Protein versus stem lignification.",
    expectedFocus: "Leaf-to-stem ratio, lignin buildup in cell walls, NDF/ADF digestibility vs yield"
  }
];

function sendQuery(tc) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const payload = JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: tc.prompt }] }],
      generationConfig: {
        temperature: 0.6,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    });

    const req = http.request('http://localhost:8080/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        const elapsedMs = Date.now() - startTime;
        try {
          const json = JSON.parse(data);
          const candidate = json.candidates?.[0];
          const text = candidate?.content?.parts?.[0]?.text;
          const finishReason = candidate?.finishReason;
          const tokens = json.usageMetadata?.totalTokenCount;

          if (text) {
            resolve({
              id: tc.id,
              category: tc.category,
              prompt: tc.prompt,
              success: true,
              elapsedMs,
              tokens,
              finishReason,
              snippet: text.substring(0, 250) + "...",
              fullText: text
            });
          } else {
            resolve({
              id: tc.id,
              category: tc.category,
              prompt: tc.prompt,
              success: false,
              elapsedMs,
              error: json.error?.message || 'Empty candidate parts',
              raw: data.substring(0, 300)
            });
          }
        } catch (e) {
          resolve({
            id: tc.id,
            category: tc.category,
            prompt: tc.prompt,
            success: false,
            elapsedMs,
            error: e.message,
            raw: data.substring(0, 300)
          });
        }
      });
    });

    req.on('error', (e) => {
      resolve({
        id: tc.id,
        category: tc.category,
        prompt: tc.prompt,
        success: false,
        elapsedMs: Date.now() - startTime,
        error: e.message
      });
    });

    req.write(payload);
    req.end();
  });
}

async function runSuite() {
  console.log("================================================================");
  console.log("🌾 STARTING GEMINI AI AGENT OUT-OF-THE-BOX VERIFICATION SUITE");
  console.log("================================================================\n");

  const results = [];

  for (const tc of testCases) {
    console.log(`[Test #${tc.id}] Testing category: "${tc.category}"...`);
    console.log(`  Question: "${tc.prompt}"`);
    const res = await sendQuery(tc);
    results.push(res);
    if (res.success) {
      console.log(`  ✅ SUCCESS (${res.elapsedMs}ms, ${res.tokens || 'N/A'} tokens)`);
      console.log(`  Answer preview: ${res.snippet.replace(/\n/g, ' ')}\n`);
    } else {
      console.log(`  ❌ FAILED (${res.elapsedMs}ms): ${res.error}\n`);
    }
  }

  const successCount = results.filter(r => r.success).length;
  console.log("================================================================");
  console.log(`SUMMARY: ${successCount} / ${results.length} PASSED`);
  console.log("================================================================");

  // Save report to JSON for review
  const reportPath = path.join(__dirname, 'gemini_agent_verification_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`Detailed verification report saved to: ${reportPath}`);
}

runSuite();
