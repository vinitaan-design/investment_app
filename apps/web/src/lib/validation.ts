import { z } from "zod";

const trimmed = (max: number, label: string) =>
  z.string().trim().max(max, `${label} must be ${max} characters or fewer.`);

export const onboardingSchema = z.object({
  fullName: trimmed(200, "Name").min(1, "Enter your name."),
  adult: z.literal("on", { error: "Confirm you are 18 or older to continue." }),
  privacy: z.literal("on", { error: "Accept the privacy notice to continue." }),
  next: z.string().optional(),
});

export const advisorApplicationSchema = z.object({
  displayName: trimmed(200, "Name").min(1, "Enter the name clients will see."),
  credentialType: z.enum(["SEBI RIA", "CFP", "IRDAI agent", "Other"], {
    error: "Choose your credential.",
  }),
  registrationNumber: trimmed(100, "Registration number").min(3, "Enter your registration number."),
  bio: trimmed(2000, "About you").optional(),
  languages: trimmed(200, "Languages").optional(),
});

/** "English, Malayalam ,  " → ["English", "Malayalam"] (max 10, each ≤ 40 chars). */
export function parseLanguages(raw: string | undefined): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && l.length <= 40),
    ),
  ).slice(0, 10);
}

export const uuid = z.uuid({ error: "That item no longer exists." });

export const bookingRequestSchema = z.object({
  advisorId: uuid,
  topic: trimmed(200, "Topic").min(1, "Say briefly what you'd like to discuss."),
  note: trimmed(2000, "Note").optional(),
});

export const confirmBookingSchema = z.object({
  bookingId: uuid,
  startsAt: z.iso
    .datetime({ error: "Choose a date and time." })
    .refine((v) => new Date(v).getTime() > Date.now(), {
      message: "Choose a time in the future.",
    }),
});

export const saveGoalSchema = z.object({
  name: trimmed(120, "Goal name").min(1, "Give your goal a name."),
  presentCost: z.coerce.number().positive("Enter a goal cost above ₹0.").max(1e12),
  years: z.coerce.number().gt(0).lte(60),
  inflation: z.coerce.number().min(0).max(30),
  growth: z.coerce.number().min(0).max(30),
  currentSavings: z.coerce.number().min(0).max(1e12).default(0),
});
