export enum VoiceCategory {
  AmericanFemale = "American Female 🇺🇸 👩",
  AmericanMale = "American Male 🇺🇸 👨",
  British = "British 🇬🇧",
}

export enum VoiceId {
  AfAlloy = "af_alloy",
  AfAoede = "af_aoede",
  AfBella = "af_bella",
  AfKore = "af_kore",
  AfNicole = "af_nicole",
  AfNova = "af_nova",
  AfSarah = "af_sarah",
  AfSky = "af_sky",
  AmFenrir = "am_fenrir",
  AmMichael = "am_michael",
  AmPuck = "am_puck",
  BfEmma = "bf_emma",
  BfIsabella = "bf_isabella",
  BmFable = "bm_fable",
  BmGeorge = "bm_george",
}

export interface VoiceOption {
  id: VoiceId;
  name: string;
}

export const voices: Record<VoiceCategory, VoiceOption[]> = {
  [VoiceCategory.AmericanFemale]: [
    { id: VoiceId.AfAlloy, name: "Alloy" },
    { id: VoiceId.AfAoede, name: "Aoede" },
    { id: VoiceId.AfBella, name: "Bella 🔥" },
    { id: VoiceId.AfKore, name: "Kore" },
    { id: VoiceId.AfNicole, name: "Nicole" },
    { id: VoiceId.AfNova, name: "Nova" },
    { id: VoiceId.AfSarah, name: "Sarah" },
    { id: VoiceId.AfSky, name: "Sky" },
  ],
  [VoiceCategory.AmericanMale]: [
    { id: VoiceId.AmFenrir, name: "Fenrir" },
    { id: VoiceId.AmMichael, name: "Michael" },
    { id: VoiceId.AmPuck, name: "Puck" },
  ],
  [VoiceCategory.British]: [
    { id: VoiceId.BfEmma, name: "Emma" },
    { id: VoiceId.BfIsabella, name: "Isabella" },
    { id: VoiceId.BmFable, name: "Fable" },
    { id: VoiceId.BmGeorge, name: "George" },
  ],
};