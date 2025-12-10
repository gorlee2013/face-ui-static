import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function Feedback() {
  const [params] = useSearchParams();

  // STUDENT INFO
  const correct = params.get("correct") === "true";
  const src = params.get("src");
  const label = params.get("label");   // "real" or "fake"
  const nextIndex = Number(params.get("next"));
  const total = Number(params.get("total"));

  // MODEL INFO (FROM CSV)
  const modelLabelNum = Number(params.get("model_label")); // 0 or 1
  const confidence = Number(params.get("confidence"));
  const probReal = Number(params.get("prob_real"));
  const probFake = Number(params.get("prob_fake"));

  const modelLabel = modelLabelNum === 0 ? "real" : "fake";
  const modelCorrect = modelLabel === label;

  // SAVE RESULTS (ONCE)
  useEffect(() => {
    const entry = {
      studentCorrect: correct,
      modelPred: modelLabel,
      modelCorrect: modelCorrect,
      confidence: confidence,
      trueLabel: label,
      image: src,
    };

    const prev = JSON.parse(localStorage.getItem("full_results") || "[]");
    prev.push(entry);
    localStorage.setItem("full_results", JSON.stringify(prev));
  }, []); 

  // NAVIGATION
  function goNext() {
    if (nextIndex >= total) {
      window.location.href = "/results";
    } else {
      window.location.href = "/test?index=" + nextIndex;
    }
  }

  // RENDER
  return (
    <div className="flex flex-col items-center mt-12 text-center">

      {/* Student correctness */}
      <h1 className={`text-4xl font-bold ${correct ? "text-green-600" : "text-red-600"}`}>
        {correct ? "Correct!" : "Incorrect"}
      </h1>

      <p className="text-lg text-gray-600 mt-2">
        This image was <b>{label.toUpperCase()}</b>.
      </p>

      {/* Image */}
      <img
        src={src}
        className="w-80 h-80 object-cover rounded-xl shadow mt-6"
        alt="Test image"
      />

      {/* Model prediction */}
      <div className="mt-8 text-gray-700 text-lg">
        <p>
          <b>Model prediction:</b> {modelLabel.toUpperCase()}
        </p>
        <p>
          <b>Confidence:</b> {(confidence * 100).toFixed(1)}%
        </p>

        <p className="mt-2 text-sm text-gray-500">
          (Model thinks: real = {(probReal * 100).toFixed(1)}%, 
          fake = {(probFake * 100).toFixed(1)}%)
        </p>
      </div>

      {/* Next button */}
      <button
        className="mt-10 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        onClick={goNext}
      >
        Next
      </button>
    </div>
  );
}
