import ScoreTracker from "../components/ScoreTracker";
import CumulativeChart from "../components/CumulativeChart";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";

export default function Results() {
  let results = [];

  try {
    results = JSON.parse(localStorage.getItem("full_results") || "[]");
    if (!Array.isArray(results)) results = [];
  } catch {
    results = [];
  }

  const [width, height] = useWindowSize();

  if (results.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">No results found.</h1>
        <button
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg"
          onClick={() => {
            localStorage.removeItem("answers_temp");
            localStorage.removeItem("full_results");
            window.location.href = "/";
          }}
        >
          Restart
        </button>
      </div>
    );
  }

  const studentCorrect = results.filter(r => r.studentCorrect).length;
  const modelCorrect   = results.filter(r => r.modelCorrect).length;
  const total = results.length;

  let message = "";
  let color = "";

  if (studentCorrect > modelCorrect) {
    message = "You beat the AI! 🏆";
    color = "text-green-600";
  } else if (studentCorrect < modelCorrect) {
    message = "The AI beat you 🤖";
    color = "text-red-600";
  } else {
    message = "Tie game! 😐";
    color = "text-blue-600";
  }

  return (
    <>
      <ScoreTracker />

      {/* Confetti when student wins */}
      {studentCorrect > modelCorrect && (
        <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />
      )}

      <div className="flex flex-col items-center mt-16 text-center px-4">

        <h1 className={`text-4xl font-bold mb-6 ${color} ${modelCorrect > studentCorrect ? "shake" : ""}`}>
          {message}
        </h1>

        <p className="text-xl mb-8">
          <b>Your Score:</b> {studentCorrect} / {total} <br />
          <b>Model Score:</b> {modelCorrect} / {total}
        </p>

        <div className="w-full max-w-3xl">
          <CumulativeChart results={results} />
        </div>

        <button
          className="mt-12 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => {
            localStorage.removeItem("answers_temp");
            localStorage.removeItem("full_results");
            window.location.href = "/";
          }}
        >
          Restart
        </button>

      </div>
    </>
  );
}
