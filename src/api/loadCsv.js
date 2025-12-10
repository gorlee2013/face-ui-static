import Papa from "papaparse";

export async function loadCsv() {
  return new Promise((resolve, reject) => {
    Papa.parse("/labels.csv", {
      download: true,
      header: true,
      complete: (results) => {
        // Convert into usable format
        const formatted = results.data.map(row => ({
          src: "/" + row.id,
          label: Number(row.label),
          model_label: Number(row.model_label),
          confidence: Number(row.confidence),
          prob_real: Number(row.prob_real),
          prob_fake: Number(row.prob_fake),
        }));

        resolve(formatted);
      },
      error: reject
    });
  });
}

