export enum AppState {
  IDLE = 'IDLE',
  CAMERA = 'CAMERA',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  ERROR = 'ERROR'
}

export interface MacroNutrients {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface MicroNutrients {
  sugar_g: number;
  fiber_g: number;
  sodium_mg?: number;
}

export interface FoodAnalysis {
  is_food: boolean;
  food_name: string;
  serving_size_estimate: string;
  calories_kcal: number;
  macronutrients: MacroNutrients;
  micronutrients: MicroNutrients;
  health_score: number; // 0-100
  short_description: string;
  confidence: number;
  alternatives?: string[];
}

export interface ScanResult {
  imageUri: string;
  data: FoodAnalysis;
}