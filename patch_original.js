import fs from 'fs';

const token = '5f587b99-5372-40a0-be38-256e26a7eba0';
const scenarioId = 5260209;

// Read the original exported scenario json file
const originalBpRaw = fs.readFileSync('scenario_5260209.json', 'utf8').trim().replace(/^\uFEFF/, '');
const originalBp = JSON.parse(originalBpRaw);

const payload = {
  blueprint: JSON.stringify(originalBp)
};

async function patchOriginal() {
  console.log(`Sending PATCH request with original blueprint to Scenario ${scenarioId}...`);
  try {
    const res = await fetch(`https://us2.make.com/api/v2/scenarios/${scenarioId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const status = res.status;
    const bodyText = await res.text();
    console.log(`Response Status: ${status}`);
    console.log("Response Body:", bodyText);
  } catch (err) {
    console.error("Error in fetch:", err);
  }
}

patchOriginal();
