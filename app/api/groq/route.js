import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is missing in .env.local. Restart dev server after adding it.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      satelliteName = 'CARTOSAT-3 (NORAD 44804)',
      collisionProbability = '1.84e-2',
      timeToImpact = '00h 42m 18s',
      surfaceHazard = 'Cyclone Dana-II (155 km/h over Bay of Bengal)',
    } = body;

    const systemPrompt = `You are the automated Crisis Telemetry AI at ISRO Telemetry, Tracking and Command Network (ISTRAC) / Project NETRA in Bengaluru.
Analyze the orbital conjunction telemetry and surface cyclone interference, and output ONLY raw valid JSON (no markdown, no backticks, no extra commentary) with these exact keys:
{
  "severity": "CRITICAL",
  "alert": "A 45-to-50-word technical ISRO flight-dynamics crisis alert using terms like TCA, Pc, radial/in-track miss distance, delta-V burn, and ISTRAC/NETRA.",
  "recommendedManeuver": "One concise 10-word thruster command",
  "groundImpact": "One concise 8-word ground-link status"
}`;

    const userPrompt = `ORBITAL & SURFACE TELEMETRY:
- Target Satellite: ${satelliteName}
- Collision Probability (Pc): ${collisionProbability}
- Time to Closest Approach (TCA): ${timeToImpact}
- Active Surface Weather Hazard: ${surfaceHazard}

Return ONLY the raw JSON object now.`;

    // Discover active chat models enabled on your Groq API key
    let availableModels = [];
    try {
      const list = await groq.models.list();
      availableModels = (list.data || [])
        .map((m) => m.id)
        .filter((id) => !/whisper|guard|tts|embed|vision/i.test(id));
    } catch {
      availableModels = [];
    }

    const preferredOrder = [
      'openai/gpt-oss-20b',
      'openai/gpt-oss-120b',
      'qwen/qwen3-32b',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
    ];

    const modelsToTry = [
      ...preferredOrder.filter((id) => availableModels.includes(id)),
      ...availableModels.filter((id) => !preferredOrder.includes(id)),
      ...preferredOrder,
    ];

    let completion = null;
    let lastError = null;

    for (const modelId of [...new Set(modelsToTry)]) {
      try {
        completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          model: modelId,
          temperature: 0.35,
          max_tokens: 1200,
        });
        if (completion?.choices?.[0]?.message?.content) {
          break;
        }
      } catch (err) {
        lastError = err;
        continue;
      }
    }

    if (!completion) {
      throw lastError || new Error('No accessible Groq chat models found on this API key.');
    }

    const rawContent = completion.choices?.[0]?.message?.content || '{}';
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    let parsed;

    try {
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
    } catch {
      parsed = {
        severity: 'CRITICAL',
        alert: rawContent.replace(/```json|```/g, '').trim().slice(0, 320),
        recommendedManeuver: 'Execute +0.35 m/s radial-out avoidance burn immediately.',
        groundImpact: 'SDSC SHAR coastal telemetry experiencing severe cyclone attenuation.',
      };
    }

    return NextResponse.json({
      severity: parsed.severity || 'HIGH',
      alert:
        parsed.alert ||
        'ISTRAC NETRA ALERT: High-probability conjunction detected. Execute immediate delta-V avoidance maneuver.',
      recommendedManeuver:
        parsed.recommendedManeuver || 'Execute +0.38 m/s prograde burn prior to TCA.',
      groundImpact:
        parsed.groundImpact || 'Bay of Bengal cyclone degrading coastal S-band uplink.',
      timestamp: new Date().toISOString(),
      telemetry: { satelliteName, collisionProbability, timeToImpact },
    });
  } catch (error) {
    console.error('Groq API Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate ISRO crisis transmission.' },
      { status: 500 }
    );
  }
}
