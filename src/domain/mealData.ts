import type { Goal, MealWeek, MealDay, MealSlot, MealItem, NutritionPlan, WeeklyCalendar, DayKey } from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const mi = (name: string, g: number, k: number, p: number, c: number, f: number): MealItem =>
  ({ name, grams: g, kcal: k, protein: p, carbs: c, fat: f });

const sl = (label: string, ...items: MealItem[]): MealSlot => ({ label, items });

const dy = (day: string, ...slots: MealSlot[]): MealDay => ({
  day,
  meals: slots.map(s => `${s.label}: ${s.items.map(x => x.name).join(", ")}`).join(" · "),
  slots,
});

// ─── Gender / calorie scaling ────────────────────────────────────────────────
const GENDER_FACTOR: Record<string, number> = { masculino: 1, femenino: 0.82 };

const scaleItem = (item: MealItem, f: number): MealItem => ({
  ...item,
  grams: Math.round(item.grams * f),
  kcal: Math.round(item.kcal * f),
  protein: Math.round(item.protein * f),
  carbs: Math.round(item.carbs * f),
  fat: Math.round(item.fat * f),
});

const scaleWeek = (w: MealWeek, f: number): MealWeek => ({
  ...w,
  days: w.days.map(d => ({
    ...d,
    meals: d.meals,
    slots: d.slots?.map(s => ({ ...s, items: s.items.map(x => scaleItem(x, f)) })),
  })),
});

const dominantMacro = (item: MealItem): "protein" | "carb" | "fat" => {
  const proteinEnergy = item.protein * 4;
  const carbEnergy = item.carbs * 4;
  const fatEnergy = item.fat * 9;
  if (fatEnergy >= proteinEnergy && fatEnergy >= carbEnergy) return "fat";
  if (proteinEnergy >= carbEnergy) return "protein";
  return "carb";
};

const scaleItemForNutrition = (item: MealItem, calorieFactor: number, nutrition: NutritionPlan): MealItem => {
  const macro = dominantMacro(item);
  const macroBias =
    macro === "protein" ? nutrition.proteinBias :
    macro === "carb" ? nutrition.carbBias :
    nutrition.fatBias;
  const factor = Math.max(0.75, Math.min(1.3, calorieFactor * macroBias));
  return scaleItem(item, factor);
};

const rebuildMealsText = (slots?: MealSlot[]): string =>
  slots?.map(s => `${s.label}: ${s.items.map(x => x.name).join(", ")}`).join(" · ") || "";

const WEEK_KEYS: DayKey[] = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];

const stateNutritionMultiplier = (state: string): { calories: number; carb: number; protein: number; fat: number; label: string } => {
  if (state === "entreno") {
    return { calories: 1.06, carb: 1.14, protein: 1.03, fat: 0.96, label: "Dia alto en carbohidrato" };
  }
  if (state === "recuperacion") {
    return { calories: 0.98, carb: 0.96, protein: 1.01, fat: 1.01, label: "Dia medio de recuperacion" };
  }
  return { calories: 0.9, carb: 0.82, protein: 1.02, fat: 1.08, label: "Dia bajo en carbohidrato" };
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUERZA  (~2700 kcal/día base masculino – superávit ligero, alta proteína)
// ═══════════════════════════════════════════════════════════════════════════════
const FUERZA_OMNI: MealWeek = {
  title: "Fuerza – Semana completa",
  type: "omni",
  baseCal: 2700,
  days: [
    dy("Lunes",
      sl("Desayuno", mi("Copos de avena",80,300,10,53,6), mi("Plátano",120,107,1,27,0), mi("Leche entera",300,183,10,14,10)),
      sl("Almuerzo", mi("Yogur griego",170,165,16,6,11), mi("Nueces",30,196,5,4,19)),
      sl("Comida", mi("Pechuga de pollo",220,363,68,0,8), mi("Arroz blanco cocido",180,234,5,50,1), mi("Ensalada mixta con aceite",160,118,2,5,11)),
      sl("Merienda", mi("Pan integral",80,200,7,35,2), mi("Pavo en lonchas",60,62,13,1,1), mi("Manzana",150,78,0,21,0)),
      sl("Cena", mi("Salmón a la plancha",200,416,40,0,26), mi("Patata cocida",250,193,5,43,0), mi("Brócoli al vapor",150,51,4,7,1))
    ),
    dy("Martes",
      sl("Desayuno", mi("Tostadas integrales",100,250,9,44,3), mi("Huevos revueltos (3)",180,279,23,2,20), mi("Tomate natural",100,18,1,4,0)),
      sl("Almuerzo", mi("Queso fresco",120,209,13,4,16), mi("Pan integral",40,100,4,18,1)),
      sl("Comida", mi("Ternera magra",200,300,52,0,10), mi("Pasta integral cocida",180,223,9,45,1), mi("Verduras salteadas con aceite",160,148,3,10,12)),
      sl("Merienda", mi("Leche entera",250,153,8,12,8), mi("Avena",40,150,5,27,3), mi("Crema de cacahuete",15,88,4,2,7)),
      sl("Cena", mi("Merluza al horno",250,205,45,0,2), mi("Boniato asado",300,258,5,60,0), mi("Judías verdes",150,47,3,7,0))
    ),
    dy("Miércoles",
      sl("Desayuno", mi("Porridge de avena",80,300,10,53,6), mi("Frutos rojos",100,43,1,10,0), mi("Miel",15,49,0,13,0), mi("Leche",200,122,6,10,7)),
      sl("Almuerzo", mi("Tortitas de arroz",40,156,3,34,1), mi("Crema de cacahuete",25,147,7,4,12)),
      sl("Comida", mi("Pavo al horno",220,229,48,2,2), mi("Quinoa cocida",180,216,8,38,3), mi("Calabacín con aceite",160,114,2,5,10)),
      sl("Merienda", mi("Yogur natural",150,93,8,5,5), mi("Plátano",120,107,1,27,0), mi("Almendras",20,116,4,4,10)),
      sl("Cena", mi("Atún fresco a la plancha",200,288,46,0,10), mi("Arroz blanco cocido",150,195,4,42,1), mi("Ensalada verde con aceite",150,108,1,4,10))
    ),
    dy("Jueves",
      sl("Desayuno", mi("Pan integral",100,250,9,44,3), mi("Aguacate",80,128,2,7,12), mi("Huevos cocidos (2)",120,186,15,1,13)),
      sl("Almuerzo", mi("Fruta variada",200,100,1,25,0), mi("Nueces",25,163,4,3,16)),
      sl("Comida", mi("Muslo de pollo al horno",200,352,40,0,20), mi("Lentejas cocidas",180,209,16,36,1), mi("Zanahoria rallada",100,41,1,10,0)),
      sl("Merienda", mi("Requesón",150,162,17,5,8), mi("Miel",15,49,0,13,0), mi("Avena",30,113,4,20,2)),
      sl("Cena", mi("Lubina al horno",200,194,36,0,5), mi("Patata asada",250,193,5,43,0), mi("Espárragos con aceite",150,118,3,5,10))
    ),
    dy("Viernes",
      sl("Desayuno", mi("Avena",80,300,10,53,6), mi("Leche entera",300,183,10,14,10), mi("Manzana troceada",150,78,0,21,0)),
      sl("Almuerzo", mi("Jamón serrano",40,84,12,0,4), mi("Pan integral",50,125,5,22,2)),
      sl("Comida", mi("Salmón al horno",200,416,40,0,26), mi("Couscous cocido",180,206,7,41,1), mi("Brócoli con aceite",150,139,4,7,11)),
      sl("Merienda", mi("Yogur griego",150,145,14,5,10), mi("Granola",30,130,3,19,5)),
      sl("Cena", mi("Pollo a la plancha",200,330,62,0,7), mi("Arroz blanco",150,195,4,42,1), mi("Pimiento asado",150,57,2,12,1))
    ),
    dy("Sábado",
      sl("Desayuno", mi("Tortilla francesa (3 huevos)",180,279,23,2,20), mi("Pan integral",80,200,7,35,2), mi("Tomate natural",100,18,1,4,0)),
      sl("Almuerzo", mi("Fruta variada",200,100,1,25,0), mi("Yogur natural",125,78,6,4,4)),
      sl("Comida", mi("Carne magra de cerdo",200,290,50,0,9), mi("Patatas al horno",300,231,6,51,0), mi("Ensalada completa con aceite",200,148,3,7,12)),
      sl("Merienda", mi("Tostada integral",50,125,5,22,2), mi("Queso fresco",80,139,9,2,10), mi("Kiwi",100,61,1,15,1)),
      sl("Cena", mi("Emperador a la plancha",200,236,40,0,8), mi("Boniato asado",250,215,4,50,0), mi("Judías verdes con aceite",150,135,3,7,10))
    ),
    dy("Domingo",
      sl("Desayuno", mi("Pancakes de avena y plátano",200,380,14,60,10), mi("Miel",15,49,0,13,0), mi("Leche",200,122,6,10,7)),
      sl("Almuerzo", mi("Frutos secos variados",35,210,6,6,20), mi("Fruta de temporada",150,75,1,19,0)),
      sl("Comida", mi("Pollo asado",220,363,68,0,8), mi("Arroz con verduras",280,274,6,55,1), mi("Ensalada con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Batido: leche, avena, plátano",350,310,14,42,10)),
      sl("Cena", mi("Tortilla de patatas (3 huevos)",250,370,20,25,22), mi("Ensalada verde con aceite",150,108,1,4,10))
    ),
  ],
};

const FUERZA_VEGANA: MealWeek = {
  title: "Fuerza – Semana vegana",
  type: "vegana",
  baseCal: 2700,
  days: [
    dy("Lunes",
      sl("Desayuno", mi("Porridge con bebida de soja",80,300,12,50,7), mi("Plátano",120,107,1,27,0), mi("Bebida de soja",300,132,11,7,6)),
      sl("Almuerzo", mi("Yogur vegetal de soja",150,120,6,12,5), mi("Nueces",30,196,5,4,19)),
      sl("Comida", mi("Tofu firme a la plancha",250,190,20,5,12), mi("Arroz integral cocido",180,200,5,42,2), mi("Ensalada mixta con aceite",160,118,2,5,11)),
      sl("Merienda", mi("Pan integral",80,200,7,35,2), mi("Hummus",60,100,4,7,6), mi("Manzana",150,78,0,21,0)),
      sl("Cena", mi("Tempeh a la plancha",180,346,36,14,20), mi("Patata cocida",250,193,5,43,0), mi("Brócoli al vapor",150,51,4,7,1))
    ),
    dy("Martes",
      sl("Desayuno", mi("Tostadas integrales",100,250,9,44,3), mi("Tofu revuelto",150,114,12,3,7), mi("Tomate natural",100,18,1,4,0)),
      sl("Almuerzo", mi("Edamame",120,151,14,11,6), mi("Crackers integrales",30,115,3,21,2)),
      sl("Comida", mi("Seitán a la plancha",180,226,46,5,2), mi("Pasta integral cocida",180,223,9,45,1), mi("Verduras salteadas con aceite",160,148,3,10,12)),
      sl("Merienda", mi("Bebida de soja",250,110,9,6,5), mi("Avena",40,150,5,27,3), mi("Crema de cacahuete",15,88,4,2,7)),
      sl("Cena", mi("Garbanzos estofados",200,328,18,54,5), mi("Arroz integral",150,167,4,35,1), mi("Espinacas salteadas con aceite",150,111,4,5,10))
    ),
    dy("Miércoles",
      sl("Desayuno", mi("Avena con bebida de almendra",80,300,10,53,6), mi("Frutos rojos",100,43,1,10,0), mi("Bebida de almendra",250,65,2,6,4)),
      sl("Almuerzo", mi("Frutos secos mix",35,210,6,6,20), mi("Plátano",120,107,1,27,0)),
      sl("Comida", mi("Heura al horno",200,280,40,11,9), mi("Quinoa cocida",180,216,8,38,3), mi("Calabacín con aceite",160,114,2,5,10)),
      sl("Merienda", mi("Yogur vegetal",150,120,6,12,5), mi("Almendras",20,116,4,4,10)),
      sl("Cena", mi("Lentejas guisadas",220,255,19,44,1), mi("Boniato asado",250,215,4,50,0), mi("Ensalada con aceite",150,108,1,4,10))
    ),
    dy("Jueves",
      sl("Desayuno", mi("Pan integral",100,250,9,44,3), mi("Aguacate",80,128,2,7,12), mi("Tomate",100,18,1,4,0)),
      sl("Almuerzo", mi("Hummus",80,133,5,9,8), mi("Palitos de zanahoria",100,41,1,10,0)),
      sl("Comida", mi("Tofu marinado al horno",250,190,20,5,12), mi("Arroz basmati cocido",180,234,5,50,1), mi("Verduras al wok con aceite",160,148,3,10,12)),
      sl("Merienda", mi("Tostada integral",50,125,5,22,2), mi("Crema de cacahuete",20,118,5,3,10)),
      sl("Cena", mi("Alubias estofadas",200,260,18,44,1), mi("Couscous cocido",150,172,6,34,1), mi("Brócoli al vapor",150,51,4,7,1))
    ),
    dy("Viernes",
      sl("Desayuno", mi("Porridge con soja",80,300,12,50,7), mi("Manzana troceada",150,78,0,21,0), mi("Bebida de soja",250,110,9,6,5)),
      sl("Almuerzo", mi("Tortitas de arroz",40,156,3,34,1), mi("Crema de almendras",20,116,4,4,10)),
      sl("Comida", mi("Tempeh al curry con verduras",200,384,40,16,22), mi("Quinoa cocida",180,216,8,38,3), mi("Ensalada con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Yogur vegetal",150,120,6,12,5), mi("Granola vegana",30,130,3,19,5)),
      sl("Cena", mi("Soja texturizada con tomate",200,280,42,24,2), mi("Patata cocida",250,193,5,43,0), mi("Espárragos al vapor",150,30,3,5,0))
    ),
    dy("Sábado",
      sl("Desayuno", mi("Tofu revuelto con especias",200,152,16,4,10), mi("Pan integral",80,200,7,35,2), mi("Tomate natural",100,18,1,4,0)),
      sl("Almuerzo", mi("Fruta variada",200,100,1,25,0), mi("Yogur vegetal",125,100,5,10,4)),
      sl("Comida", mi("Heura salteada",200,280,40,11,9), mi("Patatas al horno",300,231,6,51,0), mi("Ensalada completa con aceite",200,148,3,7,12)),
      sl("Merienda", mi("Hummus",60,100,4,7,6), mi("Pan integral",50,125,5,22,2), mi("Kiwi",100,61,1,15,1)),
      sl("Cena", mi("Garbanzos con espinacas",250,350,20,50,8), mi("Boniato asado",200,172,3,40,0))
    ),
    dy("Domingo",
      sl("Desayuno", mi("Pancakes veganos (avena y plátano)",200,350,10,60,8), mi("Sirope de agave",15,45,0,12,0), mi("Bebida de soja",250,110,9,6,5)),
      sl("Almuerzo", mi("Frutos secos variados",35,210,6,6,20), mi("Fruta de temporada",150,75,1,19,0)),
      sl("Comida", mi("Seitán al horno con verduras",200,251,51,5,3), mi("Arroz con verduras",280,274,6,55,1), mi("Ensalada con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Batido vegetal: soja, avena, plátano",350,280,14,38,8)),
      sl("Cena", mi("Lentejas con arroz integral",300,340,22,58,2), mi("Ensalada con aceite",150,108,1,4,10))
    ),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// PÉRDIDA  (~2050 kcal/día base masculino – déficit moderado, alta proteína)
// ═══════════════════════════════════════════════════════════════════════════════
const PERDIDA_OMNI: MealWeek = {
  title: "Pérdida de peso – Semana completa",
  type: "omni",
  baseCal: 2050,
  days: [
    dy("Lunes",
      sl("Desayuno", mi("Yogur griego",150,145,14,5,10), mi("Frutos rojos",80,34,1,8,0), mi("Avena",40,150,5,27,3)),
      sl("Almuerzo", mi("Almendras",20,116,4,4,10), mi("Manzana",150,78,0,21,0)),
      sl("Comida", mi("Pechuga de pollo a la plancha",220,363,68,0,8), mi("Ensalada grande con aceite",250,165,3,8,14), mi("Arroz integral cocido",80,89,2,18,1)),
      sl("Merienda", mi("Pavo en lonchas",60,62,13,1,1), mi("Pan integral",40,100,4,18,1), mi("Kiwi",100,61,1,15,1)),
      sl("Cena", mi("Salmón a la plancha",180,374,36,0,23), mi("Verduras al vapor",200,68,4,12,1), mi("Patata cocida pequeña",120,92,2,21,0))
    ),
    dy("Martes",
      sl("Desayuno", mi("Huevos cocidos (2)",120,186,15,1,13), mi("Tostada integral",50,125,5,22,2), mi("Tomate natural",100,18,1,4,0)),
      sl("Almuerzo", mi("Queso fresco desnatado",80,100,12,3,5), mi("Palitos de apio",80,11,0,2,0)),
      sl("Comida", mi("Ternera magra a la plancha",200,300,52,0,10), mi("Verduras salteadas con aceite",200,165,4,13,11), mi("Quinoa cocida",80,96,4,17,1)),
      sl("Merienda", mi("Yogur griego",125,121,12,4,8), mi("Frutos rojos",80,34,1,8,0)),
      sl("Cena", mi("Merluza al horno",220,180,40,0,2), mi("Espárragos con aceite",150,118,3,5,10), mi("Boniato",150,129,2,30,0))
    ),
    dy("Miércoles",
      sl("Desayuno", mi("Avena",40,150,5,27,3), mi("Leche semidesnatada",200,92,7,10,3), mi("Frutos rojos",100,43,1,10,0)),
      sl("Almuerzo", mi("Jamón cocido bajo en grasa",50,55,10,1,2), mi("Pepino",100,15,1,3,0)),
      sl("Comida", mi("Pavo a la plancha",200,208,44,2,2), mi("Ensalada grande con aceite",250,165,3,8,14), mi("Lentejas cocidas",100,116,9,20,0)),
      sl("Merienda", mi("Requesón desnatado",120,98,14,5,2), mi("Manzana",150,78,0,21,0)),
      sl("Cena", mi("Lubina al horno",200,194,36,0,5), mi("Brócoli al vapor",200,68,4,9,1), mi("Aceite de oliva",5,44,0,0,5))
    ),
    dy("Jueves",
      sl("Desayuno", mi("Tostada integral",60,150,5,26,2), mi("Aguacate",50,80,1,4,7), mi("Huevo cocido",60,93,8,1,7)),
      sl("Almuerzo", mi("Nueces",15,98,2,2,10), mi("Pera",150,86,1,21,0)),
      sl("Comida", mi("Pollo al horno",200,330,62,0,7), mi("Arroz integral",80,89,2,18,1), mi("Ensalada de tomate y pepino",200,45,2,8,1)),
      sl("Merienda", mi("Pavo en lonchas",50,52,11,1,1), mi("Kiwi",100,61,1,15,1)),
      sl("Cena", mi("Atún fresco a la plancha",180,259,41,0,9), mi("Judías verdes al vapor",200,62,4,9,0), mi("Aceite de oliva",5,44,0,0,5))
    ),
    dy("Viernes",
      sl("Desayuno", mi("Yogur griego",150,145,14,5,10), mi("Avena",30,113,4,20,2), mi("Plátano pequeño",80,71,1,18,0)),
      sl("Almuerzo", mi("Queso fresco",60,104,7,2,8), mi("Tomates cherry",100,18,1,4,0)),
      sl("Comida", mi("Salmón al horno",180,374,36,0,23), mi("Verduras asadas con aceite",200,165,3,13,11), mi("Patata cocida",120,92,2,21,0)),
      sl("Merienda", mi("Almendras",15,87,3,3,8), mi("Manzana",150,78,0,21,0)),
      sl("Cena", mi("Tortilla francesa (2 huevos)",120,186,15,1,13), mi("Ensalada grande con aceite",250,165,3,8,14))
    ),
    dy("Sábado",
      sl("Desayuno", mi("Huevos revueltos (2)",120,186,15,1,13), mi("Tostada integral",50,125,5,22,2), mi("Tomate natural",80,14,1,3,0)),
      sl("Almuerzo", mi("Yogur natural desnatado",125,57,7,7,0), mi("Frutos rojos",80,34,1,8,0)),
      sl("Comida", mi("Carne magra de cerdo",180,261,45,0,8), mi("Ensalada completa con aceite",250,165,3,8,14), mi("Boniato",120,103,2,24,0)),
      sl("Merienda", mi("Pan integral",30,75,3,13,1), mi("Pavo",40,42,9,0,1)),
      sl("Cena", mi("Merluza a la plancha",200,164,36,0,2), mi("Espinacas salteadas con aceite",200,120,5,5,9), mi("Zanahoria cocida",100,35,1,8,0))
    ),
    dy("Domingo",
      sl("Desayuno", mi("Porridge avena",40,150,5,27,3), mi("Leche semidesnatada",200,92,7,10,3), mi("Manzana",120,62,0,17,0)),
      sl("Almuerzo", mi("Frutos secos",15,90,2,2,9), mi("Kiwi",100,61,1,15,1)),
      sl("Comida", mi("Pollo asado sin piel",200,330,62,0,7), mi("Arroz integral",80,89,2,18,1), mi("Ensalada con aceite",200,148,2,6,12)),
      sl("Merienda", mi("Yogur griego",125,121,12,4,8), mi("Fruta de temporada",100,50,0,13,0)),
      sl("Cena", mi("Emperador a la plancha",180,213,36,0,7), mi("Verduras al vapor",200,68,4,12,1), mi("Aceite de oliva",5,44,0,0,5))
    ),
  ],
};

const PERDIDA_VEGANA: MealWeek = {
  title: "Pérdida de peso – Semana vegana",
  type: "vegana",
  baseCal: 2050,
  days: [
    dy("Lunes",
      sl("Desayuno", mi("Yogur vegetal de soja",150,120,6,12,5), mi("Frutos rojos",80,34,1,8,0), mi("Avena",40,150,5,27,3)),
      sl("Almuerzo", mi("Almendras",20,116,4,4,10), mi("Manzana",150,78,0,21,0)),
      sl("Comida", mi("Tofu firme a la plancha",220,168,18,4,10), mi("Ensalada grande con aceite",250,165,3,8,14), mi("Arroz integral",80,89,2,18,1)),
      sl("Merienda", mi("Hummus",50,83,3,6,5), mi("Palitos de zanahoria",100,41,1,10,0), mi("Kiwi",100,61,1,15,1)),
      sl("Cena", mi("Lentejas estofadas",180,209,16,36,1), mi("Verduras al vapor",200,68,4,12,1), mi("Aceite de oliva",5,44,0,0,5))
    ),
    dy("Martes",
      sl("Desayuno", mi("Tofu revuelto con cúrcuma",130,99,10,3,6), mi("Tostada integral",50,125,5,22,2), mi("Tomate natural",100,18,1,4,0)),
      sl("Almuerzo", mi("Edamame",100,126,12,9,5), mi("Pepino",100,15,1,3,0)),
      sl("Comida", mi("Seitán a la plancha",150,188,38,4,2), mi("Verduras salteadas con aceite",200,165,4,13,11), mi("Quinoa cocida",80,96,4,17,1)),
      sl("Merienda", mi("Yogur vegetal",125,100,5,10,4), mi("Frutos rojos",80,34,1,8,0)),
      sl("Cena", mi("Garbanzos con espinacas",200,280,16,40,6), mi("Boniato asado",120,103,2,24,0))
    ),
    dy("Miércoles",
      sl("Desayuno", mi("Avena con bebida de soja",40,150,5,27,3), mi("Bebida de soja",200,88,7,5,4), mi("Frutos rojos",100,43,1,10,0)),
      sl("Almuerzo", mi("Nueces",15,98,2,2,10), mi("Pera",150,86,1,21,0)),
      sl("Comida", mi("Heura a la plancha",180,252,36,10,8), mi("Ensalada grande con aceite",250,165,3,8,14), mi("Lentejas cocidas",80,93,7,16,0)),
      sl("Merienda", mi("Crema de cacahuete",15,88,4,2,7), mi("Manzana",150,78,0,21,0)),
      sl("Cena", mi("Tempeh al vapor",150,288,30,12,17), mi("Brócoli al vapor",200,68,4,9,1), mi("Aceite de oliva",5,44,0,0,5))
    ),
    dy("Jueves",
      sl("Desayuno", mi("Tostada integral",60,150,5,26,2), mi("Aguacate",50,80,1,4,7), mi("Tomate",100,18,1,4,0)),
      sl("Almuerzo", mi("Hummus",60,100,4,7,6), mi("Palitos de pepino",80,12,1,2,0)),
      sl("Comida", mi("Tofu marinado",200,152,16,4,10), mi("Arroz integral",80,89,2,18,1), mi("Ensalada con aceite",200,148,2,6,12)),
      sl("Merienda", mi("Edamame",80,101,10,7,4), mi("Kiwi",100,61,1,15,1)),
      sl("Cena", mi("Alubias con verduras",200,250,16,42,2), mi("Calabacín al vapor",150,26,2,5,0), mi("Aceite de oliva",5,44,0,0,5))
    ),
    dy("Viernes",
      sl("Desayuno", mi("Yogur vegetal",150,120,6,12,5), mi("Avena",30,113,4,20,2), mi("Plátano pequeño",80,71,1,18,0)),
      sl("Almuerzo", mi("Almendras",15,87,3,3,8), mi("Fruta variada",150,75,1,19,0)),
      sl("Comida", mi("Seitán con verduras asadas",180,253,38,8,8), mi("Quinoa cocida",80,96,4,17,1), mi("Ensalada con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Yogur vegetal",100,80,4,8,3), mi("Frutos rojos",80,34,1,8,0)),
      sl("Cena", mi("Garbanzos al curry suave",200,295,16,49,5), mi("Espinacas al vapor",150,35,4,4,0))
    ),
    dy("Sábado",
      sl("Desayuno", mi("Tofu revuelto",130,99,10,3,6), mi("Tostada integral",50,125,5,22,2), mi("Tomate",80,14,1,3,0)),
      sl("Almuerzo", mi("Yogur vegetal",125,100,5,10,4), mi("Frutos rojos",80,34,1,8,0)),
      sl("Comida", mi("Tempeh a la plancha",150,288,30,12,17), mi("Ensalada completa con aceite",250,165,3,8,14), mi("Boniato",100,86,2,20,0)),
      sl("Merienda", mi("Hummus",40,67,3,5,4), mi("Zanahoria",80,33,1,8,0)),
      sl("Cena", mi("Lentejas al curry",180,209,16,36,1), mi("Brócoli al vapor",200,68,4,9,1), mi("Aceite de oliva",5,44,0,0,5))
    ),
    dy("Domingo",
      sl("Desayuno", mi("Porridge de avena con soja",40,150,5,27,3), mi("Bebida de soja",200,88,7,5,4), mi("Manzana",120,62,0,17,0)),
      sl("Almuerzo", mi("Frutos secos",15,90,2,2,9), mi("Kiwi",100,61,1,15,1)),
      sl("Comida", mi("Heura al horno con verduras",200,280,40,11,9), mi("Arroz integral",80,89,2,18,1), mi("Ensalada con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Yogur vegetal",125,100,5,10,4), mi("Fruta de temporada",100,50,0,13,0)),
      sl("Cena", mi("Alubias con espinacas",200,260,18,44,1), mi("Verduras al vapor",200,68,4,12,1))
    ),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// CARDIO  (~2550 kcal/día base masculino – alto carbohidrato, energía)
// ═══════════════════════════════════════════════════════════════════════════════
const CARDIO_OMNI: MealWeek = {
  title: "Cardio – Semana completa",
  type: "omni",
  baseCal: 2550,
  days: [
    dy("Lunes",
      sl("Desayuno", mi("Avena",70,263,9,46,5), mi("Plátano",120,107,1,27,0), mi("Leche semidesnatada",250,115,8,12,4)),
      sl("Almuerzo", mi("Fruta variada",200,100,1,25,0), mi("Yogur natural",125,78,6,4,4)),
      sl("Comida", mi("Pechuga de pollo",200,330,62,0,7), mi("Pasta integral cocida",200,248,10,50,1), mi("Ensalada con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Pan integral",60,150,5,26,2), mi("Plátano",100,89,1,23,0), mi("Miel",10,33,0,9,0)),
      sl("Cena", mi("Merluza al horno",200,164,36,0,2), mi("Arroz blanco cocido",180,234,5,50,1), mi("Judías verdes",150,47,3,7,0))
    ),
    dy("Martes",
      sl("Desayuno", mi("Tostadas integrales",80,200,7,35,2), mi("Huevos revueltos (2)",120,186,15,1,13), mi("Zumo de naranja natural",200,86,2,20,0)),
      sl("Almuerzo", mi("Granola",35,152,4,22,6), mi("Yogur natural",125,78,6,4,4)),
      sl("Comida", mi("Pavo a la plancha",200,208,44,2,2), mi("Arroz basmati cocido",200,260,6,56,1), mi("Calabacín con aceite",150,114,2,5,10)),
      sl("Merienda", mi("Tostada integral",50,125,5,22,2), mi("Jamón cocido",40,44,8,1,1), mi("Manzana",150,78,0,21,0)),
      sl("Cena", mi("Salmón a la plancha",180,374,36,0,23), mi("Patata cocida",250,193,5,43,0), mi("Brócoli al vapor",150,51,4,7,1))
    ),
    dy("Miércoles",
      sl("Desayuno", mi("Porridge de avena",70,263,9,46,5), mi("Frutos rojos",100,43,1,10,0), mi("Miel",15,49,0,13,0), mi("Leche",200,122,6,10,7)),
      sl("Almuerzo", mi("Tortitas de arroz",30,117,2,26,1), mi("Crema de cacahuete",15,88,4,2,7)),
      sl("Comida", mi("Pollo al horno",200,330,62,0,7), mi("Couscous cocido",200,229,8,46,1), mi("Ensalada mixta con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Fruta variada",200,100,1,25,0), mi("Nueces",20,131,3,3,13)),
      sl("Cena", mi("Atún fresco",180,259,41,0,9), mi("Boniato asado",250,215,4,50,0), mi("Espárragos",150,30,3,5,0))
    ),
    dy("Jueves",
      sl("Desayuno", mi("Pan integral",80,200,7,35,2), mi("Aguacate",60,96,1,5,9), mi("Huevo cocido",60,93,8,1,7)),
      sl("Almuerzo", mi("Yogur griego",150,145,14,5,10), mi("Plátano",100,89,1,23,0)),
      sl("Comida", mi("Ternera magra",180,270,47,0,9), mi("Lentejas cocidas",180,209,16,36,1), mi("Zanahoria y tomate",150,41,2,9,0)),
      sl("Merienda", mi("Batido: leche, avena, plátano",300,275,13,37,10)),
      sl("Cena", mi("Lubina al horno",200,194,36,0,5), mi("Arroz blanco",150,195,4,42,1), mi("Pimiento asado",150,57,2,12,1))
    ),
    dy("Viernes",
      sl("Desayuno", mi("Avena",70,263,9,46,5), mi("Leche semidesnatada",250,115,8,12,4), mi("Manzana troceada",150,78,0,21,0)),
      sl("Almuerzo", mi("Jamón serrano",30,63,9,0,3), mi("Pan integral",40,100,4,18,1)),
      sl("Comida", mi("Salmón al horno",200,416,40,0,26), mi("Pasta integral",180,223,9,45,1), mi("Verduras con aceite",150,148,3,10,12)),
      sl("Merienda", mi("Yogur natural",125,78,6,4,4), mi("Granola",25,108,3,16,4)),
      sl("Cena", mi("Pollo a la plancha",180,297,56,0,6), mi("Patata cocida",200,154,4,34,0), mi("Ensalada verde con aceite",150,108,1,4,10))
    ),
    dy("Sábado",
      sl("Desayuno", mi("Tortilla francesa (2 huevos)",120,186,15,1,13), mi("Pan integral",80,200,7,35,2), mi("Zumo de naranja",200,86,2,20,0)),
      sl("Almuerzo", mi("Fruta variada",200,100,1,25,0), mi("Almendras",15,87,3,3,8)),
      sl("Comida", mi("Carne magra de cerdo",180,261,45,0,8), mi("Arroz con verduras",280,274,6,55,1), mi("Ensalada con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Tostada integral",50,125,5,22,2), mi("Queso fresco",60,104,7,2,8)),
      sl("Cena", mi("Emperador a la plancha",200,236,40,0,8), mi("Boniato",250,215,4,50,0), mi("Espinacas con aceite",150,111,4,5,10))
    ),
    dy("Domingo",
      sl("Desayuno", mi("Pancakes de avena",180,342,13,54,9), mi("Miel",15,49,0,13,0), mi("Leche",200,122,6,10,7)),
      sl("Almuerzo", mi("Frutos secos mix",30,180,5,5,17), mi("Fruta de temporada",150,75,1,19,0)),
      sl("Comida", mi("Pollo asado",200,330,62,0,7), mi("Patatas al horno",300,231,6,51,0), mi("Ensalada completa con aceite",200,148,3,7,12)),
      sl("Merienda", mi("Yogur griego",150,145,14,5,10), mi("Plátano",100,89,1,23,0)),
      sl("Cena", mi("Tortilla de verduras (3 huevos)",200,310,21,8,22), mi("Pan integral",50,125,5,22,2))
    ),
  ],
};

const CARDIO_VEGANA: MealWeek = {
  title: "Cardio – Semana vegana",
  type: "vegana",
  baseCal: 2550,
  days: [
    dy("Lunes",
      sl("Desayuno", mi("Avena con bebida de soja",70,263,9,46,5), mi("Plátano",120,107,1,27,0), mi("Bebida de soja",250,110,9,6,5)),
      sl("Almuerzo", mi("Fruta variada",200,100,1,25,0), mi("Yogur vegetal",125,100,5,10,4)),
      sl("Comida", mi("Tofu firme salteado",220,168,18,4,10), mi("Pasta integral",200,248,10,50,1), mi("Ensalada con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Pan integral",60,150,5,26,2), mi("Hummus",50,83,3,6,5), mi("Plátano",100,89,1,23,0)),
      sl("Cena", mi("Garbanzos estofados con verduras",250,369,20,60,6), mi("Arroz integral",150,167,4,35,1))
    ),
    dy("Martes",
      sl("Desayuno", mi("Tostadas integrales",80,200,7,35,2), mi("Tofu revuelto",130,99,10,3,6), mi("Zumo de naranja",200,86,2,20,0)),
      sl("Almuerzo", mi("Granola vegana",35,152,4,22,6), mi("Yogur vegetal",125,100,5,10,4)),
      sl("Comida", mi("Seitán a la plancha",180,226,46,5,2), mi("Arroz basmati cocido",200,260,6,56,1), mi("Verduras salteadas con aceite",150,148,3,10,12)),
      sl("Merienda", mi("Tostada integral",50,125,5,22,2), mi("Crema de cacahuete",15,88,4,2,7), mi("Manzana",150,78,0,21,0)),
      sl("Cena", mi("Tempeh al horno con verduras",180,346,36,14,20), mi("Patata cocida",200,154,4,34,0))
    ),
    dy("Miércoles",
      sl("Desayuno", mi("Porridge de avena",70,263,9,46,5), mi("Frutos rojos",100,43,1,10,0), mi("Bebida de almendra",250,65,2,6,4)),
      sl("Almuerzo", mi("Tortitas de arroz",30,117,2,26,1), mi("Crema de almendras",15,87,3,3,8)),
      sl("Comida", mi("Heura al horno",200,280,40,11,9), mi("Couscous cocido",200,229,8,46,1), mi("Ensalada con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Fruta variada",200,100,1,25,0), mi("Nueces",20,131,3,3,13)),
      sl("Cena", mi("Lentejas guisadas",200,232,18,40,1), mi("Boniato asado",250,215,4,50,0), mi("Espárragos",150,30,3,5,0))
    ),
    dy("Jueves",
      sl("Desayuno", mi("Pan integral",80,200,7,35,2), mi("Aguacate",60,96,1,5,9), mi("Tomate",100,18,1,4,0)),
      sl("Almuerzo", mi("Yogur vegetal",150,120,6,12,5), mi("Plátano",100,89,1,23,0)),
      sl("Comida", mi("Tofu marinado",220,168,18,4,10), mi("Lentejas cocidas",180,209,16,36,1), mi("Zanahoria y tomate",150,41,2,9,0)),
      sl("Merienda", mi("Batido vegetal: soja, avena, plátano",300,260,14,33,8)),
      sl("Cena", mi("Alubias con verduras estofadas",200,260,18,44,1), mi("Arroz integral",150,167,4,35,1), mi("Calabacín al vapor",150,26,2,5,0))
    ),
    dy("Viernes",
      sl("Desayuno", mi("Avena con soja",70,263,9,46,5), mi("Bebida de soja",250,110,9,6,5), mi("Manzana",150,78,0,21,0)),
      sl("Almuerzo", mi("Hummus",50,83,3,6,5), mi("Pan integral",40,100,4,18,1)),
      sl("Comida", mi("Tempeh al curry con verduras",200,384,40,16,22), mi("Pasta integral",180,223,9,45,1), mi("Ensalada con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Yogur vegetal",125,100,5,10,4), mi("Granola vegana",25,108,3,16,4)),
      sl("Cena", mi("Soja texturizada con tomate",180,252,38,22,2), mi("Patata cocida",200,154,4,34,0), mi("Brócoli al vapor",150,51,4,7,1))
    ),
    dy("Sábado",
      sl("Desayuno", mi("Tofu revuelto",150,114,12,3,7), mi("Pan integral",80,200,7,35,2), mi("Zumo de naranja",200,86,2,20,0)),
      sl("Almuerzo", mi("Fruta variada",200,100,1,25,0), mi("Almendras",15,87,3,3,8)),
      sl("Comida", mi("Heura salteada",200,280,40,11,9), mi("Arroz con verduras",280,274,6,55,1), mi("Ensalada con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Tostada integral",50,125,5,22,2), mi("Crema de cacahuete",15,88,4,2,7)),
      sl("Cena", mi("Garbanzos con espinacas",250,350,20,50,8), mi("Boniato asado",200,172,3,40,0))
    ),
    dy("Domingo",
      sl("Desayuno", mi("Pancakes veganos",180,320,10,54,8), mi("Sirope de agave",15,45,0,12,0), mi("Bebida de soja",200,88,7,5,4)),
      sl("Almuerzo", mi("Frutos secos mix",30,180,5,5,17), mi("Fruta de temporada",150,75,1,19,0)),
      sl("Comida", mi("Seitán al horno",200,251,51,5,3), mi("Patatas al horno",300,231,6,51,0), mi("Ensalada con aceite",200,148,3,7,12)),
      sl("Merienda", mi("Yogur vegetal",150,120,6,12,5), mi("Plátano",100,89,1,23,0)),
      sl("Cena", mi("Lentejas con arroz integral",300,340,22,58,2), mi("Ensalada con aceite",150,108,1,4,10))
    ),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// TONO  (~2400 kcal/día base masculino – recomposición equilibrada)
// ═══════════════════════════════════════════════════════════════════════════════
const TONO_OMNI: MealWeek = {
  title: "Tonificación – Semana completa",
  type: "omni",
  baseCal: 2400,
  days: [
    dy("Lunes",
      sl("Desayuno", mi("Avena",60,225,8,40,4), mi("Leche semidesnatada",250,115,8,12,4), mi("Frutos rojos",100,43,1,10,0)),
      sl("Almuerzo", mi("Yogur griego",150,145,14,5,10), mi("Almendras",15,87,3,3,8)),
      sl("Comida", mi("Pechuga de pollo",200,330,62,0,7), mi("Arroz integral cocido",150,167,4,35,1), mi("Ensalada con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Pan integral",50,125,5,22,2), mi("Pavo en lonchas",50,52,11,1,1), mi("Manzana",150,78,0,21,0)),
      sl("Cena", mi("Salmón a la plancha",180,374,36,0,23), mi("Verduras al vapor",200,68,4,12,1), mi("Patata cocida",150,116,3,26,0))
    ),
    dy("Martes",
      sl("Desayuno", mi("Tostadas integrales",80,200,7,35,2), mi("Huevos revueltos (2)",120,186,15,1,13), mi("Tomate",100,18,1,4,0)),
      sl("Almuerzo", mi("Queso fresco",80,139,9,2,10), mi("Kiwi",100,61,1,15,1)),
      sl("Comida", mi("Ternera magra",180,270,47,0,9), mi("Pasta integral",160,198,8,40,1), mi("Verduras salteadas con aceite",150,148,3,10,12)),
      sl("Merienda", mi("Yogur natural",125,78,6,4,4), mi("Avena",30,113,4,20,2), mi("Plátano pequeño",80,71,1,18,0)),
      sl("Cena", mi("Merluza al horno",200,164,36,0,2), mi("Boniato",200,172,3,40,0), mi("Espárragos con aceite",150,118,3,5,10))
    ),
    dy("Miércoles",
      sl("Desayuno", mi("Porridge de avena",60,225,8,40,4), mi("Manzana",150,78,0,21,0), mi("Leche semidesnatada",200,92,7,10,3)),
      sl("Almuerzo", mi("Jamón serrano",30,63,9,0,3), mi("Pan integral",40,100,4,18,1)),
      sl("Comida", mi("Pavo al horno",200,208,44,2,2), mi("Quinoa cocida",150,180,7,32,3), mi("Calabacín con aceite",150,114,2,5,10)),
      sl("Merienda", mi("Requesón",120,130,14,4,6), mi("Frutos rojos",80,34,1,8,0)),
      sl("Cena", mi("Atún fresco",180,259,41,0,9), mi("Arroz blanco",120,156,3,34,1), mi("Ensalada verde con aceite",150,108,1,4,10))
    ),
    dy("Jueves",
      sl("Desayuno", mi("Pan integral",80,200,7,35,2), mi("Aguacate",60,96,1,5,9), mi("Huevo cocido",60,93,8,1,7)),
      sl("Almuerzo", mi("Fruta variada",200,100,1,25,0), mi("Nueces",20,131,3,3,13)),
      sl("Comida", mi("Pollo al horno",200,330,62,0,7), mi("Lentejas cocidas",150,174,13,30,1), mi("Zanahoria y tomate",150,41,2,9,0)),
      sl("Merienda", mi("Yogur griego",125,121,12,4,8), mi("Granola",20,87,2,13,3)),
      sl("Cena", mi("Lubina al horno",200,194,36,0,5), mi("Patata asada",200,154,4,34,0), mi("Brócoli con aceite",150,139,4,7,11))
    ),
    dy("Viernes",
      sl("Desayuno", mi("Avena",60,225,8,40,4), mi("Plátano",100,89,1,23,0), mi("Leche semidesnatada",250,115,8,12,4)),
      sl("Almuerzo", mi("Queso fresco",80,139,9,2,10), mi("Tomates cherry",100,18,1,4,0)),
      sl("Comida", mi("Salmón al horno",180,374,36,0,23), mi("Couscous cocido",150,172,6,34,1), mi("Ensalada con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Pan integral",40,100,4,18,1), mi("Pavo",40,42,9,0,1), mi("Manzana",120,62,0,17,0)),
      sl("Cena", mi("Pollo a la plancha",180,297,56,0,6), mi("Verduras asadas con aceite",200,165,3,13,11), mi("Arroz integral",100,111,3,23,1))
    ),
    dy("Sábado",
      sl("Desayuno", mi("Tortilla francesa (2 huevos)",120,186,15,1,13), mi("Pan integral",60,150,5,26,2), mi("Tomate",100,18,1,4,0)),
      sl("Almuerzo", mi("Yogur natural",125,78,6,4,4), mi("Fruta variada",150,75,1,19,0)),
      sl("Comida", mi("Carne magra de cerdo",180,261,45,0,8), mi("Patatas al horno",250,193,5,43,0), mi("Ensalada completa con aceite",200,148,3,7,12)),
      sl("Merienda", mi("Almendras",15,87,3,3,8), mi("Kiwi",100,61,1,15,1)),
      sl("Cena", mi("Emperador a la plancha",180,213,36,0,7), mi("Boniato",200,172,3,40,0), mi("Judías verdes con aceite",150,135,3,7,10))
    ),
    dy("Domingo",
      sl("Desayuno", mi("Pancakes de avena",160,304,11,48,8), mi("Miel",10,33,0,9,0), mi("Leche",200,122,6,10,7)),
      sl("Almuerzo", mi("Frutos secos mix",25,150,4,4,14), mi("Fruta de temporada",150,75,1,19,0)),
      sl("Comida", mi("Pollo asado",200,330,62,0,7), mi("Arroz con verduras",250,245,5,49,1), mi("Ensalada con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Yogur griego",150,145,14,5,10), mi("Frutos rojos",80,34,1,8,0)),
      sl("Cena", mi("Tortilla de verduras (2 huevos)",180,250,16,8,17), mi("Pan integral",50,125,5,22,2), mi("Ensalada",150,20,1,4,0))
    ),
  ],
};

const TONO_VEGANA: MealWeek = {
  title: "Tonificación – Semana vegana",
  type: "vegana",
  baseCal: 2400,
  days: [
    dy("Lunes",
      sl("Desayuno", mi("Avena con soja",60,225,8,40,4), mi("Frutos rojos",100,43,1,10,0), mi("Bebida de soja",250,110,9,6,5)),
      sl("Almuerzo", mi("Yogur vegetal",150,120,6,12,5), mi("Almendras",15,87,3,3,8)),
      sl("Comida", mi("Tofu firme a la plancha",200,152,16,4,10), mi("Arroz integral",150,167,4,35,1), mi("Ensalada con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Pan integral",50,125,5,22,2), mi("Hummus",50,83,3,6,5), mi("Manzana",150,78,0,21,0)),
      sl("Cena", mi("Tempeh a la plancha",150,288,30,12,17), mi("Verduras al vapor",200,68,4,12,1), mi("Patata cocida",150,116,3,26,0))
    ),
    dy("Martes",
      sl("Desayuno", mi("Tostadas integrales",80,200,7,35,2), mi("Tofu revuelto",130,99,10,3,6), mi("Tomate",100,18,1,4,0)),
      sl("Almuerzo", mi("Edamame",80,101,10,7,4), mi("Kiwi",100,61,1,15,1)),
      sl("Comida", mi("Seitán a la plancha",150,188,38,4,2), mi("Pasta integral",160,198,8,40,1), mi("Verduras con aceite",150,148,3,10,12)),
      sl("Merienda", mi("Yogur vegetal",125,100,5,10,4), mi("Avena",30,113,4,20,2), mi("Plátano pequeño",80,71,1,18,0)),
      sl("Cena", mi("Lentejas guisadas",200,232,18,40,1), mi("Boniato asado",200,172,3,40,0), mi("Espinacas con aceite",150,111,4,5,10))
    ),
    dy("Miércoles",
      sl("Desayuno", mi("Porridge con bebida vegetal",60,225,8,40,4), mi("Manzana",150,78,0,21,0), mi("Bebida de avena",200,80,2,14,3)),
      sl("Almuerzo", mi("Crema de cacahuete",15,88,4,2,7), mi("Pan integral",40,100,4,18,1)),
      sl("Comida", mi("Heura al horno",180,252,36,10,8), mi("Quinoa cocida",150,180,7,32,3), mi("Calabacín con aceite",150,114,2,5,10)),
      sl("Merienda", mi("Hummus",50,83,3,6,5), mi("Palitos de zanahoria",80,33,1,8,0)),
      sl("Cena", mi("Garbanzos con espinacas",200,280,16,40,6), mi("Arroz integral",120,133,3,28,1))
    ),
    dy("Jueves",
      sl("Desayuno", mi("Pan integral",80,200,7,35,2), mi("Aguacate",60,96,1,5,9), mi("Tomate",100,18,1,4,0)),
      sl("Almuerzo", mi("Fruta variada",200,100,1,25,0), mi("Nueces",20,131,3,3,13)),
      sl("Comida", mi("Tofu marinado al horno",200,152,16,4,10), mi("Lentejas cocidas",150,174,13,30,1), mi("Zanahoria y tomate",150,41,2,9,0)),
      sl("Merienda", mi("Yogur vegetal",125,100,5,10,4), mi("Granola vegana",20,87,2,13,3)),
      sl("Cena", mi("Alubias con verduras",200,260,18,44,1), mi("Patata asada",200,154,4,34,0), mi("Brócoli al vapor",150,51,4,7,1))
    ),
    dy("Viernes",
      sl("Desayuno", mi("Avena con soja",60,225,8,40,4), mi("Plátano",100,89,1,23,0), mi("Bebida de soja",250,110,9,6,5)),
      sl("Almuerzo", mi("Hummus",50,83,3,6,5), mi("Tomates cherry",100,18,1,4,0)),
      sl("Comida", mi("Tempeh al curry",150,288,30,12,17), mi("Couscous cocido",150,172,6,34,1), mi("Ensalada con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Pan integral",40,100,4,18,1), mi("Crema de cacahuete",15,88,4,2,7), mi("Manzana",120,62,0,17,0)),
      sl("Cena", mi("Soja texturizada con verduras",180,252,38,22,2), mi("Arroz integral",100,111,3,23,1), mi("Espárragos al vapor",150,30,3,5,0))
    ),
    dy("Sábado",
      sl("Desayuno", mi("Tofu revuelto con especias",150,114,12,3,7), mi("Pan integral",60,150,5,26,2), mi("Tomate",100,18,1,4,0)),
      sl("Almuerzo", mi("Yogur vegetal",125,100,5,10,4), mi("Fruta variada",150,75,1,19,0)),
      sl("Comida", mi("Heura salteada",180,252,36,10,8), mi("Patatas al horno",250,193,5,43,0), mi("Ensalada con aceite",200,148,3,7,12)),
      sl("Merienda", mi("Almendras",15,87,3,3,8), mi("Kiwi",100,61,1,15,1)),
      sl("Cena", mi("Lentejas con verduras",200,232,18,40,1), mi("Boniato",200,172,3,40,0), mi("Judías verdes",150,47,3,7,0))
    ),
    dy("Domingo",
      sl("Desayuno", mi("Pancakes veganos",160,285,9,48,7), mi("Sirope de agave",10,30,0,8,0), mi("Bebida de soja",200,88,7,5,4)),
      sl("Almuerzo", mi("Frutos secos mix",25,150,4,4,14), mi("Fruta de temporada",150,75,1,19,0)),
      sl("Comida", mi("Seitán al horno con verduras",200,251,51,5,3), mi("Arroz con verduras",250,245,5,49,1), mi("Ensalada con aceite",150,108,1,4,10)),
      sl("Merienda", mi("Yogur vegetal",150,120,6,12,5), mi("Frutos rojos",80,34,1,8,0)),
      sl("Cena", mi("Garbanzos al curry suave",200,295,16,49,5), mi("Espinacas al vapor",150,35,4,4,0), mi("Pan integral",40,100,4,18,1))
    ),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Template registry
// ═══════════════════════════════════════════════════════════════════════════════
const MEAL_WEEKLY_TEMPLATES: Record<Goal, MealWeek[]> = {
  fuerza: [FUERZA_OMNI, FUERZA_VEGANA],
  perdida: [PERDIDA_OMNI, PERDIDA_VEGANA],
  cardio: [CARDIO_OMNI, CARDIO_VEGANA],
  tono: [TONO_OMNI, TONO_VEGANA],
};

// ═══════════════════════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════════════════════

/** Returns weekly meal examples for a given goal, scaled by gender. */
export const getWeeklyMealExamples = (goal?: Goal | string, gender?: string): MealWeek[] => {
  const base = MEAL_WEEKLY_TEMPLATES[(goal as Goal)] || MEAL_WEEKLY_TEMPLATES.fuerza;
  const factor = GENDER_FACTOR[gender || "masculino"] ?? 1;
  return factor === 1 ? base : base.map(w => scaleWeek(w, factor));
};

/** Keeps backwards compatibility for simple calorie labels. */
export const adaptMealWeekByCalories = (week: MealWeek, calories: number): MealWeek & { calorieLabel: string } => {
  const tier = calories < 1900 ? "low" : calories > 2600 ? "high" : "mid";
  const labels: Record<string, string> = {
    low: "Porciones moderadas - prioriza verdura y proteina",
    mid: "Porciones estandar de mantenimiento",
    high: "Anade snack pre/post entreno y racion extra de carbohidrato",
  };
  return { ...week, calorieLabel: labels[tier] };
};

/** Scales the weekly diet towards the calculated calories and macro emphasis from the current plan. */
export const adaptMealWeekByNutrition = (
  week: MealWeek,
  nutrition: NutritionPlan,
  weeklyCalendar?: WeeklyCalendar,
): MealWeek & { calorieLabel: string; strategyLabel: string } => {
  const baseCal = week.baseCal || nutrition.calories;
  const calorieFactor = Math.max(0.82, Math.min(1.18, nutrition.calories / Math.max(baseCal, 1)));
  const scaledDays = week.days.map((day, index) => {
    const calendarKey = WEEK_KEYS[index];
    const cycle = stateNutritionMultiplier(weeklyCalendar?.[calendarKey] || "descanso");
    const slots = day.slots?.map(slot => ({
      ...slot,
      items: slot.items.map(item => {
        const macro = dominantMacro(item);
        const macroBias =
          macro === "protein"
            ? nutrition.proteinBias * cycle.protein
            : macro === "carb"
              ? nutrition.carbBias * cycle.carb
              : nutrition.fatBias * cycle.fat;
        return scaleItemForNutrition(item, calorieFactor * cycle.calories * macroBias, {
          ...nutrition,
          carbBias: 1,
          proteinBias: 1,
          fatBias: 1,
        });
      }),
    }));
    return {
      ...day,
      slots,
      meals: rebuildMealsText(slots),
      strategyLabel: cycle.label,
    };
  });

  const calorieLabel =
    calorieFactor < 0.94
      ? `Porciones ajustadas a ~${nutrition.calories} kcal/dia, recortando sobre todo almidones y grasas.`
      : calorieFactor > 1.06
        ? `Porciones ampliadas a ~${nutrition.calories} kcal/dia, priorizando carbohidrato util alrededor del entreno.`
        : `Porciones centradas en ~${nutrition.calories} kcal/dia con distribucion equilibrada.`;

  return {
    ...week,
    days: scaledDays,
    calorieLabel,
    strategyLabel: `${nutrition.mealStrategy} Ciclo semanal: entreno alto en carbohidrato, descanso mas contenido.`,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// Day-specific snack recommendations
// ═══════════════════════════════════════════════════════════════════════════════

export interface SnackSuggestion {
  name: string;
  timing: string;
  macroHint: string;
}

export interface DaySnackRecommendation {
  preWorkout: SnackSuggestion | null;
  postWorkout: SnackSuggestion | null;
  dayLabel: string;
  tipText: string;
}

export type ShoppingCategory =
  | "Proteínas animales"
  | "Proteínas vegetales"
  | "Lácteos y huevos"
  | "Cereales y legumbres"
  | "Frutas"
  | "Verduras"
  | "Grasas y frutos secos"
  | "Otros";

export interface WeeklyShoppingItem {
  name: string;
  totalGrams: number;
  totalKcal: number;
  appearances: number;
  category: ShoppingCategory;
}

const PROTEIN_ANIMAL_KEYWORDS = ["pollo", "pechuga", "ternera", "cerdo", "salmon", "merluza", "atun", "lubina", "pavo", "jamon", "serrano", "emperador", "salmón", "bandrow", "muslo", "lomo"];
const PROTEIN_VEG_KEYWORDS = ["tofu", "tempeh", "seitan", "seitán", "heura", "soja texturizada", "edamame", "proteina vegetal"];
const DAIRY_KEYWORDS = ["leche", "yogur", "queso", "huevo", "requesón", "requesón", "kefir", "clara"];
const GRAIN_KEYWORDS = ["arroz", "avena", "pasta", "pan", "tostada", "tortita", "couscous", "quinoa", "lentejas", "garbanzos", "alubias", "boniato", "patata", "batata", "granola", "crackers", "copos", "pancake"];
const FRUIT_KEYWORDS = ["plátano", "platano", "manzana", "fruta", "naranja", "kiwi", "frutos rojos", "pera", "dátil", "mandarina", "uva", "fresa", "arándano"];
const VEGGIE_KEYWORDS = ["brócoli", "brocoli", "espinaca", "zanahoria", "pimiento", "tomate", "calabacín", "calabacin", "judía", "judia", "espárrago", "esparrago", "pepino", "ensalada", "verdura", "lechuga", "apio", "cebolla", "ajo", "champiñón"];
const FAT_KEYWORDS = ["aceite", "aguacate", "nuez", "almendra", "frutos secos", "cacahuete", "mantequilla", "crema de", "semilla", "chia", "lino"];

const classifyShoppingItem = (name: string): ShoppingCategory => {
  const lc = name.toLowerCase();
  if (PROTEIN_VEG_KEYWORDS.some(k => lc.includes(k))) return "Proteínas vegetales";
  if (PROTEIN_ANIMAL_KEYWORDS.some(k => lc.includes(k))) return "Proteínas animales";
  if (DAIRY_KEYWORDS.some(k => lc.includes(k))) return "Lácteos y huevos";
  if (VEGGIE_KEYWORDS.some(k => lc.includes(k))) return "Verduras";
  if (FRUIT_KEYWORDS.some(k => lc.includes(k))) return "Frutas";
  if (GRAIN_KEYWORDS.some(k => lc.includes(k))) return "Cereales y legumbres";
  if (FAT_KEYWORDS.some(k => lc.includes(k))) return "Grasas y frutos secos";
  return "Otros";
};

export const getDaySnackRecommendation = (
  dayState: string,
  dominantStimulus: "fuerza" | "cardio" | "mixto",
  goal: string,
): DaySnackRecommendation => {
  if (dayState === "descanso") {
    return {
      preWorkout: null,
      postWorkout: null,
      dayLabel: "Dia de descanso",
      tipText:
        goal === "perdida"
          ? "Sin entreno hoy. Reducir carbohidratos y priorizar verduras, proteina magra e hidratacion."
          : "Sin entreno. Come ligero y prioriza la recuperacion muscular con proteinas de calidad y grasas saludables.",
    };
  }

  if (dayState === "recuperacion") {
    return {
      preWorkout: null,
      postWorkout:
        dominantStimulus === "fuerza"
          ? { name: "Yogur griego con frutos rojos", timing: "30-60 min despues del entreno", macroHint: "~20 g proteina, carbohidrato de indice glucemico medio para reponer glucogeno" }
          : { name: "Batido de platano con leche o bebida vegetal", timing: "30 min despues del entreno", macroHint: "~15-20 g proteina, carbohidrato rapido para reponer energia" },
      dayLabel: "Dia de recuperacion activa",
      tipText: "Entreno suave. Incluye alimentos antiinflamatorios (frutos rojos, salmon, jengibre) y asegurate de llegar a tu objetivo de proteina diario.",
    };
  }

  // dayState === "entreno"
  if (dominantStimulus === "fuerza") {
    return {
      preWorkout: {
        name:
          goal === "perdida"
            ? "Yogur griego con avena (pequeña porcion)"
            : "Avena con leche y platano",
        timing: "60-90 min antes del entreno",
        macroHint:
          goal === "perdida"
            ? "~25 g proteina, ~30 g carbohidrato lento – energia sostenida sin exceso calorico"
            : "~15 g proteina, ~50 g carbohidrato complejo – glucogeno muscular optimo",
      },
      postWorkout: {
        name:
          goal === "perdida"
            ? "Pechuga de pavo o clara de huevo con arroz integral"
            : "Batido de proteinas o yogur griego con fruta",
        timing: "Dentro de los 30-45 min tras el entreno",
        macroHint:
          goal === "perdida"
            ? "~35-40 g proteina, ~25 g carbohidrato – sintesis muscular sin superavit"
            : "~30-40 g proteina, ~40-60 g carbohidrato rapido – ventana anabolica",
      },
      dayLabel: "Dia de fuerza",
      tipText:
        goal === "fuerza"
          ? "Dia clave. Maximiza proteina total (1.8-2.2 g/kg) y no saltarte el snack post-entreno en los primeros 45 minutos."
          : "Dia de fuerza. Ajusta porciones de carbohidratos al esfuerzo y prioriza la proteina post-entreno para preservar musculo.",
    };
  }

  if (dominantStimulus === "cardio") {
    return {
      preWorkout: {
        name:
          goal === "perdida"
            ? "Platano pequeno o puñado de datliles"
            : "Tostada integral con mermelada o miel",
        timing: "45-60 min antes del entreno",
        macroHint:
          goal === "perdida"
            ? "~25-30 g carbohidrato rapido – energia para el esfuerzo sin lastrar la digestion"
            : "~40-50 g carbohidrato, bajo en grasa – combustible rapido para rendimiento cardiovascular",
      },
      postWorkout: {
        name:
          goal === "perdida"
            ? "Pechuga de pollo con ensalada y una pieza de fruta"
            : "Arroz con atun o batido de recuperacion (proteina + carbohidrato)",
        timing: "Dentro de los 45 min tras el entreno",
        macroHint:
          goal === "perdida"
            ? "~30 g proteina, ~20-30 g carbohidrato – recuperacion con control calorico"
            : "~20-25 g proteina, ~50-70 g carbohidrato – reponer glucogeno y reducir cortisol",
      },
      dayLabel: "Dia de cardio",
      tipText:
        goal === "cardio"
          ? "Dia de resistencia. Carga bien de carbohidratos antes y repone con una combinacion proteina+carbohidrato nada mas acabar."
          : "Sesion cardiovascular. Hidratate bien (0.5 L extra) y recuerda el snack post-cardio para evitar catabolismo muscular.",
    };
  }

  // mixto
  return {
    preWorkout: {
      name: goal === "perdida" ? "Yogur griego con avena y frutos rojos" : "Avena, platano y una cucharada de crema de cacahuete",
      timing: "60-90 min antes del entreno",
      macroHint: "Carbohidrato complejo + proteina moderada + algo de grasa – energia estable para sesion combinada",
    },
    postWorkout: {
      name: goal === "perdida" ? "Tortilla de claras con boniato" : "Arroz integral con pollo o tofu y aguacate",
      timing: "30-45 min despues del entreno",
      macroHint: "~30-40 g proteina, ~40-50 g carbohidrato, grasas saludables – recuperacion completa para estimulo mixto",
    },
    dayLabel: "Dia mixto (fuerza + cardio)",
    tipText:
      "Sesion combinada. Aumenta ligeramente las raciones de carbohidrato respecto a un dia de fuerza puro y asegurate de hidratarte bien durante el entrenamiento.",
  };
};

/** Builds a weekly shopping list by aggregating repeated foods across all days. */
export const buildWeeklyShoppingList = (week: MealWeek): WeeklyShoppingItem[] => {
  const acc = new Map<string, WeeklyShoppingItem>();

  for (const day of week.days) {
    for (const slot of day.slots || []) {
      for (const item of slot.items) {
        const key = item.name.trim().toLowerCase();
        const current = acc.get(key);
        if (current) {
          current.totalGrams += item.grams;
          current.totalKcal += item.kcal;
          current.appearances += 1;
        } else {
          acc.set(key, {
            name: item.name,
            totalGrams: item.grams,
            totalKcal: item.kcal,
            appearances: 1,
            category: classifyShoppingItem(item.name),
          });
        }
      }
    }
  }

  return Array.from(acc.values()).sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category, "es");
    if (b.totalGrams !== a.totalGrams) return b.totalGrams - a.totalGrams;
    return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
  });
};
