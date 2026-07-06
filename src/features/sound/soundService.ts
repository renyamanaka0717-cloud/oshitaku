// Lightweight stub for sound effects. No audio library is bundled yet, so
// this currently no-ops. Swapping in expo-audio later only means filling in
// the body of playSound — call sites never need to change.
export type SoundEffect = 'check' | 'complete' | 'stamp' | 'reward';

export async function playSound(_effect: SoundEffect): Promise<void> {
  // Intentionally empty until audio assets are added.
}
