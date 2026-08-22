// FCO (Fertilizer Control Order) norms for Fermented Organic Manure (FOM)
// These are the threshold values a digestate batch must meet to be "compliant"
const FCO_NORMS = {
  organicCarbon: { min: 12 },      // % — minimum organic carbon content
  nitrogen: { min: 0.5 },          // % N — minimum
  phosphorus: { min: 0.5 },        // % P2O5 — minimum
  potassium: { min: 0.5 },         // % K2O — minimum
  ph: { min: 6.5, max: 8.5 },      // pH must fall in this range
  moisture: { max: 25 },           // % — maximum allowed moisture
  cnRatio: { max: 20 },            // C:N ratio — maximum
};

function checkCompliance(labValues) {
  const violations = [];

  // Each check below compares one lab value against its FCO threshold.
  // If it fails, we push a small object describing exactly what went wrong —
  // this becomes useful later for showing farmers/buyers *why* a batch failed.

  if (labValues.organicCarbon < FCO_NORMS.organicCarbon.min) {
    violations.push({
      parameter: "organicCarbon",
      value: labValues.organicCarbon,
      expected: `>= ${FCO_NORMS.organicCarbon.min}%`,
    });
  }

  if (labValues.nitrogen < FCO_NORMS.nitrogen.min) {
    violations.push({
      parameter: "nitrogen",
      value: labValues.nitrogen,
      expected: `>= ${FCO_NORMS.nitrogen.min}%`,
    });
  }

  if (labValues.phosphorus < FCO_NORMS.phosphorus.min) {
    violations.push({
      parameter: "phosphorus",
      value: labValues.phosphorus,
      expected: `>= ${FCO_NORMS.phosphorus.min}%`,
    });
  }

  if (labValues.potassium < FCO_NORMS.potassium.min) {
    violations.push({
      parameter: "potassium",
      value: labValues.potassium,
      expected: `>= ${FCO_NORMS.potassium.min}%`,
    });
  }

  if (labValues.ph < FCO_NORMS.ph.min || labValues.ph > FCO_NORMS.ph.max) {
    violations.push({
      parameter: "ph",
      value: labValues.ph,
      expected: `${FCO_NORMS.ph.min} - ${FCO_NORMS.ph.max}`,
    });
  }

  if (labValues.moisture > FCO_NORMS.moisture.max) {
    violations.push({
      parameter: "moisture",
      value: labValues.moisture,
      expected: `<= ${FCO_NORMS.moisture.max}%`,
    });
  }

  if (labValues.cnRatio > FCO_NORMS.cnRatio.max) {
    violations.push({
      parameter: "cnRatio",
      value: labValues.cnRatio,
      expected: `<= ${FCO_NORMS.cnRatio.max}`,
    });
  }

  return {
    isCompliant: violations.length === 0,
    violations,
  };
}

module.exports = { checkCompliance, FCO_NORMS };