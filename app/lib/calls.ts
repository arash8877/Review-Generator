import { PhoneCall, Tone } from "./types";

type CallTemplate = Omit<PhoneCall, "id" | "status" | "urgency" | "createdAt" | "recommendedTone">;

const baseCallTemplates: CallTemplate[] = [
  {
    callerName: "Anne Jensen",
    productModel: "TV-Model 2",
    sentiment: "negative",
    intent: "Screen flicker after firmware update",
    durationMinutes: 7,
    transcript: `Agent: DanTV support, Alex speaking. How can I help today?
Customer: Hi Alex, my TV-Model 2 started flickering right after last night's firmware update. It's pretty bad.
Agent: Thanks for letting me know. Have you tried a power cycle yet?
Customer: Yes, and I swapped HDMI cables too. It still flashes every few seconds.
Agent: Understood. I'll create a case and push the rollback package while we're on the call.`,
    summary:
      "Customer sees persistent flickering on TV-Model 2 after a firmware update. Already tried power cycle and HDMI swap. Expecting a fix or replacement.",
    history: [
      "Firmware update triggered severe flicker",
      "Tried power cycle and HDMI swap already",
      "Case opened; sending rollback steps now",
    ],
    riskFlags: ["Churn risk if unresolved", "Warranty expectation", "Recent firmware regression"],
    nextActions: [
      "Send firmware rollback steps via SMS within 10 minutes",
      "Escalate to video engineering if rollback fails",
      "Offer courtesy month of DanTV+ if the issue persists",
    ],
    followUpChannel: "sms",
    highlightMoments: [
      "Customer already attempted basic troubleshooting (power cycle, HDMI swap)",
      "Issue started immediately after firmware update",
      "Customer mentioned they'll return the TV if it keeps flickering",
    ],
  },
  {
    callerName: "Mads Nyholm",
    productModel: "TV-Model 3",
    sentiment: "neutral",
    intent: "Audio delay over ARC",
    durationMinutes: 11,
    transcript: `Agent: Welcome to DanTV support, this is Lea. What can I help with?
Customer: My soundbar over HDMI ARC is slightly delayed compared to the picture on TV-Model 3.
Agent: Got it. Have you tried enabling lip-sync or eARC in settings?
Customer: I see eARC on, but I'm not sure about lip-sync adjustment.
Agent: I'll walk you through it and send a checklist after the call.`,
    summary:
      "Lip-sync delay on TV-Model 3 when using a soundbar over HDMI ARC. Customer unsure about lip-sync calibration.",
    history: [
      "Reported lip-sync delay over ARC",
      "eARC on; walked through lip-sync menu",
      "Drafting calibration checklist to send",
    ],
    riskFlags: ["Experience friction", "May call back if not resolved"],
    nextActions: [
      "Send lip-sync calibration steps",
      "Schedule 24-hour follow-up check-in via SMS",
      "Capture soundbar model for compatibility note",
    ],
    followUpChannel: "sms",
    highlightMoments: [
      "Customer open to trying steps live",
      "Has eARC enabled already",
      "Unsure about lip-sync adjustment menu",
    ],
  },
  {
    callerName: "Julie Kirkegaard",
    productModel: "TV-Model 1",
    sentiment: "positive",
    intent: "Picture preset guidance",
    durationMinutes: 5,
    transcript: `Agent: Thanks for calling DanTV, I'm Mads. What can I do for you?
Customer: I love the TV-Model 1 but want your recommended cinema preset.
Agent: Absolutely. Do you watch mostly streaming or Blu-ray?
Customer: Streaming, mostly films at night.
Agent: I'll send the cinema preset and HDR toggle steps in an email after this call.`,
    summary:
      "Caller requested a cinema picture preset for TV-Model 1; wants streaming-optimized settings. Call concluded positively.",
    history: [
      "Requested cinema preset for TV-Model 1",
      "Mostly streams at night",
      "Sending preset + HDR steps via email",
    ],
    riskFlags: [],
    nextActions: [
      "Email the cinema preset and HDR toggle steps",
      "Tag account with 'picture preset provided'",
      "Invite feedback on the settings after 48 hours",
    ],
    followUpChannel: "email",
    highlightMoments: [
      "Customer is happy with the TV and wants to optimize",
      "Prefers evening/streaming configuration",
      "Open to sharing feedback after trying preset",
    ],
  },
  {
    callerName: "Nikolaj Holm",
    productModel: "TV-Model 2",
    sentiment: "negative",
    intent: "Dead pixels after unboxing",
    durationMinutes: 9,
    transcript: `Agent: DanTV support, Mia speaking. How can I assist?
Customer: I unboxed TV-Model 2 yesterday and found dead pixels in the top right corner.
Agent: I'm sorry about that. Did you notice any impact on dark scenes?
Customer: Yes, it's visible on black backgrounds.
Agent: I'll open a warranty case and share replacement steps.`,
    summary:
      "Dead pixels on newly purchased TV-Model 2. Customer expects replacement under warranty.",
    history: [
      "New TV unboxed with dead pixels",
      "Most visible on dark scenes",
      "Opening warranty case; collecting details",
    ],
    riskFlags: ["High replacement expectation", "Churn risk if delayed"],
    nextActions: [
      "Verify purchase date and serial",
      "Issue advanced replacement if eligible",
      "Send return shipping label",
    ],
    followUpChannel: "email",
    highlightMoments: [
      "Defect discovered within 24 hours",
      "Visible on dark scenes (high impact)",
      "Customer wants clear warranty confirmation",
    ],
  },
  {
    callerName: "Ditte Nissen",
    productModel: "TV-Model 4",
    sentiment: "neutral",
    intent: "Remote pairing steps",
    durationMinutes: 6,
    transcript: `Agent: Hi, this is Noah from DanTV. What's happening with the remote?
Customer: The remote won't pair after I changed batteries.
Agent: Understood. Are you seeing any blinking LEDs?
Customer: Just a slow blink.
Agent: I'll guide you through pairing and share the step-by-step via SMS.`,
    summary: "Remote for TV-Model 4 not pairing after battery change; needs pairing guide.",
    history: [
      "Remote won't pair after battery swap",
      "LED shows slow blink",
      "Running guided pairing steps now",
    ],
    riskFlags: ["May escalate if pairing fails"],
    nextActions: [
      "Send pairing steps via SMS",
      "Confirm LED pattern during steps",
      "Offer replacement remote if still failing",
    ],
    followUpChannel: "sms",
    highlightMoments: [
      "Remote LED slow blink noted",
      "Customer ready to try steps live",
      "Open to replacement if pairing fails",
    ],
  },
  {
    callerName: "Rikke Hjort",
    productModel: "TV-Model 1",
    sentiment: "negative",
    intent: "Wi-Fi drops every evening",
    durationMinutes: 10,
    transcript: `Agent: DanTV support, Amir speaking. Tell me what's happening.
Customer: TV-Model 1 drops Wi-Fi around 9 PM daily. Other devices are fine.
Agent: Thanks for the detail. Is the TV near a microwave or thick wall?
Customer: It's in the living room, nothing unusual.
Agent: I'll send a 5GHz/2.4GHz checklist and schedule a follow-up.`,
    summary:
      "Wi-Fi disconnects nightly on TV-Model 1; other devices unaffected. Needs network checklist and potential firmware check.",
    history: [
      "Nightly Wi-Fi drops around 9 PM",
      "Other devices fine; placement normal",
      "Collecting router details; prepping checklist",
    ],
    riskFlags: ["Frustration building", "May blame firmware"],
    nextActions: [
      "Send channel interference checklist",
      "Capture router model and firmware",
      "Schedule 24-hour follow-up to confirm stability",
    ],
    followUpChannel: "sms",
    highlightMoments: [
      "Issue time-boxed to nightly pattern",
      "Other devices unaffected (likely TV-side)",
      "Customer willing to try settings adjustments",
    ],
  },
  {
    callerName: "Lea Axelsen",
    productModel: "TV-Model 4",
    sentiment: "positive",
    intent: "Accessibility captions setup",
    durationMinutes: 8,
    transcript: `Agent: Hello, DanTV support. How can I help today?
Customer: I need help enabling captions for my dad on TV-Model 4.
Agent: Happy to help. Do you want them default-on for HDMI too?
Customer: Yes, please.
Agent: I'll send steps and a quick video after this call.`,
    summary:
      "Customer wants captions default-enabled across inputs on TV-Model 4 for accessibility.",
    history: [
      "Needs captions always on for accessibility",
      "Wants default-on across HDMI/inputs",
      "Sending steps and short video guide",
    ],
    riskFlags: [],
    nextActions: [
      "Send captions setup guide",
      "Share 30s video walk-through",
      "Check back in 2 days for accessibility feedback",
    ],
    followUpChannel: "email",
    highlightMoments: [
      "Accessibility need clearly stated",
      "Wants captions on by default for HDMI",
      "Appreciates short video tutorial",
    ],
  },
  {
    callerName: "Daniel Bay",
    productModel: "TV-Model 2",
    sentiment: "negative",
    intent: "Shipping delay on TV order",
    durationMinutes: 4,
    transcript: `Agent: DanTV logistics desk, Sara speaking. What's the issue?
Customer: My TV-Model 2 was due Friday. Tracking hasn't moved.
Agent: Let me check the carrier. Do you have the order number?
Customer: Yes, it's 4829.
Agent: I'll chase the carrier and update you via SMS today.`,
    summary: "Shipping delay for TV-Model 2; customer wants same-day status update.",
    history: [
      "Reported shipping delay past promised date",
      "Provided order number 4829",
      "Chasing carrier; will send ETA today",
    ],
    riskFlags: ["Delivery frustration", "Refund risk"],
    nextActions: [
      "Contact carrier for status",
      "Send SMS with ETA within 2 hours",
      "Offer voucher if delay exceeds 48 hours",
    ],
    followUpChannel: "sms",
    highlightMoments: [
      "Customer shared order number",
      "Needs same-day status",
      "At risk of canceling if delayed further",
    ],
  },
  {
    callerName: "Sebastian Rahbek",
    productModel: "TV-Model 4",
    sentiment: "negative",
    intent: "HDR looks washed out",
    durationMinutes: 12,
    transcript: `Agent: DanTV support, Chloe here. Tell me more.
Customer: HDR on TV-Model 4 looks washed out on movies.
Agent: Do you have dynamic tone mapping enabled?
Customer: Not sure, I'm on the default mode.
Agent: I'll send a calibration preset and stay on the line while you try it.`,
    summary:
      "HDR picture looks washed out on TV-Model 4. Needs quick calibration preset and tone mapping guidance.",
    history: [
      "HDR looks washed out on TV-Model 4",
      "On default mode; unsure about tone mapping",
      "Sending quick calibration preset",
    ],
    riskFlags: ["Perceived product quality risk"],
    nextActions: [
      "Share HDR calibration preset",
      "Confirm dynamic tone mapping setting",
      "Offer technician call if still washed out",
    ],
    followUpChannel: "email",
    highlightMoments: [
      "Customer on default mode",
      "Open to adjusting settings live",
      "Concerned about HDR quality",
    ],
  },
  {
    callerName: "Soren Brask",
    productModel: "TV-Model 4",
    sentiment: "neutral",
    intent: "Voice control not responding",
    durationMinutes: 6,
    transcript: `Agent: DanTV support, Leo speaking. How can I help?
Customer: Voice control stopped responding on TV-Model 4.
Agent: Understood. Any recent updates?
Customer: It auto-updated last night.
Agent: I'll guide you through mic permission reset and push a hotfix if needed.`,
    summary:
      "Voice control stopped working on TV-Model 4 after an overnight update. Needs mic permission reset and potential hotfix.",
    history: [
      "Voice control stopped after overnight update",
      "Confirmed recent auto-update",
      "Guiding mic reset; hotfix ready if needed",
    ],
    riskFlags: ["Feature regression concern"],
    nextActions: [
      "Guide mic permission reset",
      "Send hotfix package if reset fails",
      "Check back in 12 hours to confirm",
    ],
    followUpChannel: "sms",
    highlightMoments: [
      "Issue started after automatic update",
      "Customer willing to try reset steps",
      "May need hotfix deployment",
    ],
  },
];

function formatCreatedAt(date: Date, hoursAgo: number) {
  const dayLabel = hoursAgo < 24 ? "Today" : "Yesterday";
  const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${dayLabel}, ${time}`;
}

function recommendedToneFor(sentiment: PhoneCall["sentiment"]): Tone {
  if (sentiment === "negative") return "Apologetic";
  if (sentiment === "positive") return "Friendly";
  return "Neutral/Professional";
}

export function buildRecentCalls(count = 70): PhoneCall[] {
  // Use a fixed base time to ensure stable timestamps across renders
  const baseTime = new Date('2024-12-01T12:00:00Z').getTime();
  const nowBucketMs = Math.floor(baseTime / 3_600_000) * 3_600_000;

  return Array.from({ length: count }, (_, idx) => {
    const template = baseCallTemplates[idx % baseCallTemplates.length];
    const hoursAgo = Math.min(47, Math.floor((idx / Math.max(1, count - 1)) * 47));
    const minuteSkew = (idx % 6) * 5; // small variance for timestamps
    const createdDate = new Date(nowBucketMs - hoursAgo * 3_600_000 - minuteSkew * 60_000);

    const status = idx % 9 === 0 ? "live" : idx % 4 === 0 ? "resolved" : "open";
    const urgency = idx % 7 === 0 ? "high" : idx % 3 === 0 ? "medium" : "low";

    return {
      ...template,
      id: `call-${idx + 1}`,
      status,
      urgency,
      recommendedTone: recommendedToneFor(template.sentiment),
      createdAt: formatCreatedAt(createdDate, hoursAgo),
    };
  });
}

export const phoneCalls = buildRecentCalls(70);
