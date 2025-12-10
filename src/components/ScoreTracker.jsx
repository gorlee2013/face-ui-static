export default function ScoreTracker() {
  const results = JSON.parse(localStorage.getItem("full_results") || "[]");

  const studentCorrect = results.filter(r => r.studentCorrect).length;
  const modelCorrect   = results.filter(r => r.modelCorrect).length;

  // Determine colors
  const youColor =
    studentCorrect > modelCorrect
      ? "text-green-600 font-bold"
      : studentCorrect < modelCorrect
      ? "text-red-600 font-bold"
      : "text-gray-700 font-semibold";

  const modelColor =
    modelCorrect > studentCorrect
      ? "text-green-600 font-bold"
      : modelCorrect < studentCorrect
      ? "text-red-600 font-bold"
      : "text-gray-700 font-semibold";

  return (
    <div className="fixed top-4 right-4 bg-white shadow-lg px-4 py-2 rounded-lg border text-sm z-50">
      <p className={youColor}>
        You: {studentCorrect}
      </p>
      <p className={modelColor}>
        Model: {modelCorrect}
      </p>
    </div>
  );
}
