import fs from 'fs';

const token = '5f587b99-5372-40a0-be38-256e26a7eba0';
const scenarioId = 5260209;

try {
  // Load original blueprint
  const originalBpRaw = fs.readFileSync('scenario_5260209.json', 'utf8').trim().replace(/^\uFEFF/, '');
  const bp = JSON.parse(originalBpRaw);

  // Find modules by ID
  const mod1 = bp.flow.find(m => m.id === 1);
  const mod2 = bp.flow.find(m => m.id === 2);
  const mod5 = bp.flow.find(m => m.id === 5);

  if (!mod1 || !mod2 || !mod5) {
    throw new Error("Could not find original modules with IDs 1, 2, or 5 in blueprint.");
  }

  // 1. Modify Module 1 (Trigger) to Custom Webhook
  mod1.module = "gateway:CustomWebHook";
  mod1.parameters = {
    hook: 2395810,
    maxResults: 1
  };
  mod1.metadata.restore = {
    parameters: {
      hook: {
        data: { editable: "true" },
        label: "Oido_ShopDigital."
      }
    }
  };
  // Remove interface array if present to let Make auto-generate it
  delete mod1.metadata.interface;
  delete mod1.metadata.parameters;

  // 2. Modify Module 2 (Gemini) mapper variables and add filter
  if (mod2.mapper && mod2.mapper.contents) {
    mod2.mapper.contents.forEach(content => {
      if (content.parts) {
        content.parts.forEach(part => {
          if (part.text && part.text.includes("{{1.messages[].text.body}}")) {
            part.text = part.text.replace("{{1.messages[].text.body}}", "{{1.entry[].changes[].value.messages[].text.body}}");
          }
        });
      }
    });
  }

  // Filter: Only proceed if entry exists (this prevents errors during Meta GET verification)
  mod2.filter = {
    label: "Only on message",
    conditions: [
      [
        {
          a: "{{1.entry}}",
          o: "exists"
        }
      ]
    ]
  };

  // 3. Modify Module 5 (WhatsApp) mapper variables
  if (mod5.mapper) {
    if (mod5.mapper.to && mod5.mapper.to.includes("{{1.messages[].from}}")) {
      mod5.mapper.to = mod5.mapper.to.replace("{{1.messages[].from}}", "{{1.entry[].changes[].value.messages[].from}}");
    }
  }

  // 4. Create Module 6 (Webhook Respond)
  const mod6 = {
    id: 6,
    module: "gateway:WebhookRespond",
    version: 1,
    parameters: {},
    mapper: {
      status: "200",
      body: '{{1.query.`hub.challenge`}}'
    },
    metadata: {
      designer: {
        x: mod1.metadata.designer.x + 150,
        y: mod1.metadata.designer.y
      }
    }
  };

  // 5. Reconstruct flow array in execution order: 1 -> 6 -> 2 -> 5
  bp.flow = [mod1, mod6, mod2, mod5];

  console.log("Constructed new flow structure successfully.");
  console.log("Module 1 mapping:", JSON.stringify(mod1, null, 2));
  console.log("Module 6 mapping:", JSON.stringify(mod6, null, 2));

  // Perform the PATCH request
  const payload = {
    blueprint: JSON.stringify(bp)
  };

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
  console.error("Error transitioning scenario:", err);
}
