export interface RageFace {
  id: string;
  type: keyof typeof import('./constants').RAGE_FACES;
  x: number;
  rotation: number;
  width: number;
  height: number;
}