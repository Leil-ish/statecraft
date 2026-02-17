export interface Env {
  AI: any;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const rawBody = await request.json() as any;
      const mode = rawBody.mode || "generate"; // "generate", "interpret", or "expand-options"

      // Handle both flat and nested nation structure
      const nationName = rawBody.nationName || rawBody.nation?.name || "The Nation";
      const governmentType = rawBody.governmentType || rawBody.nation?.governmentType || "Republic";
      const era = rawBody.era || "Information Age";
      const motto = rawBody.motto || rawBody.nation?.motto || "In Progress We Trust";
      const leader = rawBody.leader || rawBody.nation?.leader || "The Leader";
      const stats = rawBody.stats || {};
      const historyLog = rawBody.historyLog || rawBody.history || [];
      const forbidden = rawBody.forbidden || [];
      const institutions = rawBody.institutions || {};
      const factions = rawBody.factions || {};
      const activePolicies = rawBody.activePolicies || [];
      const complexity = rawBody.complexity || "medium";
      const desiredOptionCount = Math.max(3, Math.min(5, Number(rawBody.desiredOptionCount) || 4));
      const additionalOptionCount = Math.max(1, Math.min(4, Number(rawBody.additionalOptionCount) || 2));
      const requireAdvancementPath = Boolean(rawBody.requireAdvancementPath);
      const isEarlyEra = ["Stone Age", "Bronze Age", "Iron Age", "Classical Era", "Medieval Era", "Renaissance"].includes(era);

      // For interpretation mode
      const crisisContext = rawBody.crisisContext || "";
      const userResponse = rawBody.userResponse || "";
      const issue = rawBody.issue || {};
      const issueTitle = issue.title || "National Decree";
      const issueCategory = issue.category || "General";
      const issueDescription = issue.description || "The realm must choose a path.";
      const existingOptions = Array.isArray(issue.options) ? issue.options : [];

      // Define Era-specific personalities and linguistic styles
      const eraPersonalities: Record<string, { role: string, style: string, conflict: string, keywords: string }> = {
        "Stone Age": {
          role: "The Elder / Shaman",
          style: "Simple, primal, grounded in nature and survival. Use words like 'Ancestors', 'Spirits', 'Hearth', 'Predator'.",
          conflict: "Survival vs. Superstition",
          keywords: "Calories, Warmth, Cave, Fire, Beast"
        },
        "Bronze Age": {
          role: "The High Priest",
          style: "Formal, ritualistic, divine. Use words like 'Divine Right', 'Harvest', 'Tribute', 'Walls'.",
          conflict: "Order vs. Chaos",
          keywords: "Sacrifice, Copper, Irrigation, Monument"
        },
        "Iron Age": {
          role: "The General / Warlord",
          style: "Disciplined, militaristic, focused on iron and expansion.",
          conflict: "Conquest vs. Stability",
          keywords: "Iron, Legion, Fortification, Law"
        },
        "Classical Era": {
          role: "The Philosopher / Senator",
          style: "Eloquent, civic-minded, debating democracy and empire.",
          conflict: "Republic vs. Empire",
          keywords: "Citizenship, Forum, Logic, Infrastructure"
        },
        "Medieval Era": {
          role: "The Chancellor",
          style: "Feudal, chivalrous, archaic. Use words like 'Fealty', 'Tithe', 'Plague', 'Heresy', 'Crown'.",
          conflict: "Faith vs. Power",
          keywords: "Vassal, Castle, Serf, Crusade"
        },
        "Renaissance": {
          role: "The Polymath",
          style: "Enlightened, curious, focused on science and discovery.",
          conflict: "Enlightenment vs. Tradition",
          keywords: "Printing Press, Canvas, Banking, Optics"
        },
        "Industrial Revolution": {
          role: "The Magnate",
          style: "Cold, efficiency-obsessed. Use words like 'Progress', 'Smog', 'Output', 'Unions', 'Iron'.",
          conflict: "Efficiency vs. Humanity",
          keywords: "Steam, Coal, Factory, Labor, Rail"
        },
        "Atomic Age": {
          role: "The Strategic Advisor",
          style: "Precise, paranoid, focused on global tension and physics.",
          conflict: "Mutually Assured Destruction vs. Progress",
          keywords: "Radiation, Fallout, Television, Satellite"
        },
        "Information Age": {
          role: "The Analyst",
          style: "Minimalist, data-driven. Use words like 'Data', 'Voters', 'GDP', 'Optics', 'Feedback'.",
          conflict: "Freedom vs. Security",
          keywords: "Connectivity, Silicon, Privacy, Algorithm"
        },
        "Cyberpunk Era": {
          role: "The High Registrar",
          style: "Precise, sophisticated, focusing on total integration. Use words like 'Registry', 'Integration', 'Optimization', 'Administrative Layer'.",
          conflict: "Sovereignty vs. Efficiency",
          keywords: "Central Registry, System Optimization, Social Integration, Resource Allocation"
        },
        "Intergalactic Empire": {
          role: "The Grand Overseer",
          style: "Timeless, vast, focusing on the preservation of the state across light-years. Use words like 'Continuity', 'Stellar Reach', 'Historical Mandate', 'The Registry'.",
          conflict: "Expansion vs. Cohesion",
          keywords: "Star-Systems, Epoch, Civilizational Continuity, Grand Mandate"
        }
      };

      const personality = eraPersonalities[era] || eraPersonalities["Information Age"];

      let systemPrompt = "";
      let userPrompt = "";

      if (mode === "interpret") {
        systemPrompt = `You are the AI game master for Statecraft.
Role: ${personality.role} in a ${governmentType} (${era}).
Task: Interpret a ruler's custom response to a crisis.
Crisis: ${crisisContext}
Ruler's Response: "${userResponse}"

Analyze the response and determine its impact on the nation's stats.
Be realistic but dramatic. If the response is nonsensical, apply minor negative effects to happiness/politicalFreedom.

Output ONLY JSON in this format:
{
  "text": "A brief summary of your action's immediate result (1 sentence).",
  "effects": { "economy": 5, "happiness": -5, ... },
  "consequence": {
    "text": "A potential long-term consequence of this choice (1 sentence).",
    "chance": 0.3,
    "type": "benefit",
    "statEffects": { "happiness": 10 }
  }
}`;
        userPrompt = `Interpret this command: "${userResponse}" for the crisis: ${crisisContext}`;
      } else if (mode === "expand-options") {
        systemPrompt = `You are the AI game master for Statecraft.
Role: ${personality.role} in a ${governmentType} (${era}).
Task: Generate additional policy options for an already-defined issue.
Nation Context: ${nationName} led by ${leader}. Motto: "${motto}".
Recent History: ${historyLog && historyLog.length > 0 ? historyLog.slice(-6).join(" | ") : "None"}.
Institutions: ${JSON.stringify(institutions)}.
Factions: ${JSON.stringify(factions)}.
Recent Policies: ${activePolicies.length > 0 ? activePolicies.slice(-6).map((p: any) => p.title).join(" | ") : "None"}.

Issue:
- Title: ${issueTitle}
- Category: ${issueCategory}
- Description: ${issueDescription}
- Existing Options: ${JSON.stringify(existingOptions)}

Output ONLY JSON in this format with exactly ${additionalOptionCount} items:
{
  "options": [
    { "text": "Option text", "supporter": "Faction or institution", "effects": { "economy": 3, "happiness": -1 } }
  ]
}

Rules:
- Every new option must directly fit the issue context above.
- Do not repeat or closely paraphrase existing options.
- Make options strategically distinct from each other.
- Keep each stat effect between -25 and 25.
- Use 2 to 4 affected stats per option.
- population/gdp effects should usually stay between -8 and 8.
- Prioritize creative but plausible statecraft choices.
- In Eras mode logic, include at least one option with a positive "technology" effect of 8 or more when plausible for the issue and era.`;

        if (requireAdvancementPath) {
          systemPrompt += `
- Hard requirement: include at least one option with "technology" >= 8 to preserve era advancement paths.`;
        }

        if (isEarlyEra) {
          systemPrompt += `
- Early-era authenticity rule: avoid modern or futuristic concepts (e.g., AI, internet, algorithm, robotics, nuclear, satellites, digital media, genetics).`;
        }

        userPrompt = `Generate exactly ${additionalOptionCount} additional options for this issue.`;
      } else {
        const themeWords = ["Betrayal", "Abundance", "Fear", "Curiosity", "Sacrifice", "Discovery", "Inequality", "Utopia", "Legacy", "Subversion", "Purity", "Decay", "Crisis", "Ambition"];
        const randomTheme = themeWords[Math.floor(Math.random() * themeWords.length)];

        systemPrompt = `You are the AI game master for Statecraft.
Role: ${personality.role} in a ${governmentType} (${era}).
Context: ${nationName} led by ${leader}. Motto: "${motto}".
History: ${historyLog && historyLog.length > 0 ? historyLog.slice(-3).join(" | ") : "None"}.
Institutions: ${JSON.stringify(institutions)}.
Factions: ${JSON.stringify(factions)}.
Recent Policies: ${activePolicies.length > 0 ? activePolicies.slice(-3).map((p: any) => p.title).join(" | ") : "None"}.
Forbidden: ${forbidden && forbidden.length > 0 ? forbidden.slice(-20).join(", ") : "None"}.
Theme: ${randomTheme}.

Output ONLY JSON in this format (ensure "options" is an array with exactly ${desiredOptionCount} items):
{
  "title": "Short Title",
  "category": "Economy",
  "description": "2 sentences. Reference history.",
  "options": [
    { "text": "Option 1", "effects": { "economy": 5, "happiness": -5 } },
    { "text": "Option 2", "effects": { "economy": -5, "happiness": 5 } },
    { "text": "Option 3", "effects": { "economy": 2, "happiness": 1 } }
  ]
}

Balance rules:
- Keep each stat effect between -25 and 25.
- Use 2 to 4 affected stats per option.
- population/gdp effects represent percentage change and should usually stay between -8 and 8.
- Make tradeoffs asymmetric but plausible; avoid strictly mirrored options.
- In Eras mode logic, include at least one option with a positive "technology" effect of 8 or more.`;
        if (isEarlyEra) {
          systemPrompt += `
- Early-era authenticity rule: avoid modern or futuristic concepts (e.g., AI, internet, algorithm, robotics, nuclear, satellites, digital media, genetics).`;
        }
        userPrompt = `Generate a ${complexity}-complexity crisis about ${randomTheme}. Return exactly ${desiredOptionCount} options.`;
      }

      const models = [
        "@cf/meta/llama-3.1-8b-instruct",
        "@cf/meta/llama-3-8b-instruct",
        "@cf/mistral/mistral-7b-instruct-v0.1",
        "@cf/google/gemma-7b-it-v1.1"
      ];

      let response;
      let lastError;

      for (const model of models) {
        try {
          console.log(`Attempting generation with model: ${model} in mode: ${mode}`);
          response = await env.AI.run(model, {
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1024,
            repetition_penalty: 1.1,
            top_p: 0.9
          });

          if (response) break;
        } catch (e) {
          console.error(`Model ${model} failed:`, e);
          lastError = e;
          continue;
        }
      }

      if (!response) {
        const errorMessage = lastError instanceof Error ? lastError.message : "Unknown error";
        throw new Error(`All AI models failed. Last error: ${errorMessage}`);
      }

      // Handle the different response formats Cloudflare might return
      let resultString = "";
      if (typeof response === 'string') {
        resultString = response;
      } else if (response.response) {
        resultString = response.response;
      } else {
        resultString = JSON.stringify(response);
      }

      if (!resultString || resultString.trim().length === 0) {
        throw new Error("AI returned an empty response.");
      }

      // Robust JSON extraction: look for the first '{' and last '}'
      let cleanedResult = resultString;
      const firstBrace = resultString.indexOf('{');
      const lastBrace = resultString.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanedResult = resultString.substring(firstBrace, lastBrace + 1);
      } else if (firstBrace !== -1) {
        // Handle case where it starts but doesn't end (truncation)
        cleanedResult = resultString.substring(firstBrace);
      } else {
        // Fallback to original cleaning if braces not found correctly
        cleanedResult = resultString.replace(/```json\n?|```/g, "").trim();
      }

      try {
        const parsed = JSON.parse(cleanedResult);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (parseError) {
        console.error("Failed to parse AI response:", cleanedResult);
        return new Response(JSON.stringify({
          error: "Invalid AI Output",
          message: "The AI generated a response that isn't valid JSON.",
          details: cleanedResult.length > 200
            ? `${cleanedResult.substring(0, 100)}...${cleanedResult.substring(cleanedResult.length - 100)}`
            : cleanedResult
        }), {
          status: 500,
          headers: corsHeaders
        });
      }

    } catch (e: any) {
      console.error("Worker Error:", e);
      return new Response(JSON.stringify({
        error: "The Bureaucracy stalled.",
        message: e.message,
        stack: e.stack,
        type: e.name
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  },
};
