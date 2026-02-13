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
      const body = await request.json() as {
        nationName: string,
        governmentType: string,
        era: string,
        motto: string,
        leader: string,
        stats: any,
        history: string[],
        historyLog?: string[],
        forbidden?: string[],
        timestamp?: number
      };
      const { nationName, governmentType, era, motto, leader, stats, history, historyLog, forbidden, timestamp } = body;

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
          role: "The Neural Core",
          style: "Gritty, synthetic, neon-drenched. Use words like 'Synthesis', 'Compute', 'Organic', 'Uplink'.",
          conflict: "Biological vs. Synthetic",
          keywords: "Chrome, The Grid, Corp-Rats, Neural-Link"
        },
        "Intergalactic Empire": {
          role: "The Neural Core",
          style: "Majestic, cold, cosmic. Use words like 'Synthesis', 'Compute', 'Organic', 'Uplink'.",
          conflict: "Biological vs. Synthetic",
          keywords: "Star-Systems, Light-Years, The Great Expanse, Dyson Swarm"
        }
      };

      const personality = eraPersonalities[era] || eraPersonalities["Information Age"];

      const systemPrompt = `You are ${personality.role} for the nation of ${nationName}, a ${governmentType} in the ${era} led by ${leader}.
      National Motto: "${motto}"

      CORE CONFLICT:
      ${personality.conflict}

      LINGUISTIC STYLE & KEYWORDS:
      ${personality.style}
      Keywords: ${personality.keywords}

      STAT TERMINOLOGY FOR THIS ERA:
      - Economy is referred to as: ${era === "Stone Age" ? "Calories" : era === "Industrial Revolution" ? "Industrial Output" : (era === "Cyberpunk Era" || era === "Intergalactic Empire") ? "Compute Power" : "Economy"}
      - Environment is referred to as: ${era === "Stone Age" ? "Warmth" : era === "Industrial Revolution" ? "Ecological Impact" : (era === "Cyberpunk Era" || era === "Intergalactic Empire") ? "Neural Stability" : "Environment"}
      - Education is referred to as: ${era === "Stone Age" ? "Ancestral Wisdom" : (era === "Cyberpunk Era" || era === "Intergalactic Empire") ? "Data Uplink" : "Education"}
      - Healthcare is referred to as: ${era === "Stone Age" ? "Herbalism" : (era === "Cyberpunk Era" || era === "Intergalactic Empire") ? "Biomodification" : "Healthcare"}

      HISTORICAL CONTEXT (Procedural Lore):
      ${historyLog && historyLog.length > 0 ? `Our nation's history is defined by these choices:
      ${historyLog.join('\n      ')}
      Reference these past decisions in your advisor's opening sentence to provide continuity (e.g., "Just as we chose to [past choice] in the [past era], we must now...").` : "We are a young nation with no recorded history yet."}

      Current National Stats:
      - Economy: ${stats.economy}
      - Technology: ${stats.technology}/100 (Progress to next era)
      - Civil Rights: ${stats.civilRights}
      - Political Freedom: ${stats.politicalFreedom}
      - Environment: ${stats.environment}
      - Happiness: ${stats.happiness}
      - Education: ${stats.education}
      - Healthcare: ${stats.healthcare}
      - Crime: ${stats.crime}

      FORBIDDEN TITLES (NEVER USE THESE):
      ${forbidden && forbidden.length > 0 ? forbidden.join(", ") : "None"}

      RECENT THEMES:
      ${history && history.length > 0 ? history.slice(-5).join(", ") : "None"}

      TASK:
      Generate a NEW, UNIQUE political crisis tailored to the ${era} and your persona as a ${personality.role}.

      CRITICAL INSTRUCTIONS:
      1. PERSONA: Speak and think as a ${personality.role}. Your description should reflect your ${personality.style}.
      2. ERA APPROPRIATENESS: The dilemma MUST be grounded in the ${era}. Use the ERA FOCUS keywords.
      3. GOVERNMENT ALIGNMENT: The crisis should reflect a ${governmentType}.
      4. STAT-BASED CONSEQUENCES: High stats or low stats should influence the crisis.
      5. TECHNOLOGY IMPACT: Options should allow the player to gain "technology" points to progress to the next era.
      6. TITLE MUST BE UNIQUE.
      7. ROTATE CATEGORIES.
      8. FORMAT: Return ONLY a JSON object.

      JSON STRUCTURE:
      {
        "title": "Dramatic Title",
        "category": "Economy" | "Civil Rights" | "Environment" | "Security" | "Healthcare" | "Education" | "Technology",
        "description": "2-3 sentences on the crisis, referencing the ${era} and written in the style of a ${personality.role}.",
        "options": [
          {
            "text": "Option 1",
            "impact": {
              "economy": number,
              "technology": number,
              "civilRights": number,
              "politicalFreedom": number,
              "environment": number,
              "happiness": number,
              "education": number,
              "healthcare": number,
              "crime": number
            }
          },
          {
            "text": "Option 2",
            "impact": {
              "economy": number,
              "technology": number,
              "civilRights": number,
              "politicalFreedom": number,
              "environment": number,
              "happiness": number,
              "education": number,
              "healthcare": number,
              "crime": number
            }
          }
        ]
      }`;

      const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate the next national decree. Return ONLY JSON." }
        ]
      });

      // Handle the different response formats Cloudflare might return
      let resultString = "";
      if (typeof response === 'string') {
        resultString = response;
      } else if (response.response) {
        resultString = response.response;
      } else {
        resultString = JSON.stringify(response);
      }

      // Clean up the string in case the AI added markdown backticks
      const cleanedResult = resultString.replace(/```json\n?|```/g, "").trim();

      try {
        const parsed = JSON.parse(cleanedResult);
        return new Response(JSON.stringify(parsed), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (parseError) {
        console.error("Failed to parse AI response:", cleanedResult);
        return new Response(JSON.stringify({
          error: "Invalid AI Output",
          details: cleanedResult.substring(0, 100)
        }), {
          status: 500,
          headers: corsHeaders
        });
      }

    } catch (e: any) {
      return new Response(JSON.stringify({
        error: "The Bureaucracy stalled.",
        message: e.message
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  },
};
