import { useState, useEffect } from "react";
import { loadCsv } from "../api/loadCsv";
import { useSearchParams, useNavigate } from "react-router-dom";
import ScoreTracker from "../components/ScoreTracker";

export default function Test() {
  const navigate = useNavigate();

  // Read index from query params
  const [query] = useSearchParams();
  const startIndex = Number(query.get("index") || 0);

  const saved = JSON.parse(localStorage.getItem("answers_temp") || "[]");

  const [images, setImages] = useState([]);
  const [index] = useState(startIndex);
  const [answers, setAnswers] = useState(saved);

  // Fisher–Yates shuffle
  function shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Load images from CSV
  useEffect(() => {
    loadCsv().then((allImages) => {
      const realImages = allImages.filter((img) => img.label === 0);
      const fakeImages = allImages.filter((img) => img.label === 1);

      if (realImages.length === 0 || fakeImages.length === 0) {
        console.error("Dataset must contain at least one real and one fake image.");
        return;
      }

      // Guarantee at least one real + one fake
      const guaranteed = [
        realImages[Math.floor(Math.random() * realImages.length)],
        fakeImages[Math.floor(Math.random() * fakeImages.length)],
      ];

      const shuffled = shuffle(allImages);

      const remaining = shuffled.filter(
        (img) =>
          img.src !== guaranteed[0].src &&
          img.src !== guaranteed[1].src
      );

      const finalSet = shuffle([
        ...guaranteed,
        ...remaining.slice(0, 8),
      ]);

      setImages(finalSet);
    });
  }, []);

  if (images.length === 0) {
    return <p className="mt-20 text-gray-600 text-xl">Loading images...</p>;
  }

  function choose(choice) {
    const img = images[index];
    const realLabel = img.label === 0 ? "real" : "fake";
    const correct = choice === realLabel;

    const updated = [...answers, { choice, correct }];
    setAnswers(updated);
    localStorage.setItem("answers_temp", JSON.stringify(updated));

    const params = new URLSearchParams({
      correct: String(correct),
      src: img.src,
      label: realLabel,
      next: index + 1,
      total: images.length,

      // Precomputed model info
      model_label: String(img.model_label),
      confidence: String(img.confidence),
      prob_real: String(img.prob_real),
      prob_fake: String(img.prob_fake),
    });

    // SPA-safe navigation (works on GitHub Pages)
    navigate(`/feedback?${params.toString()}`);
  }

  return (
    <>
      <ScoreTracker />

      <div className="flex flex-col items-center mt-12">
        <img
          src={images[index].src}
          className="w-80 h-80 object-cover rounded-xl shadow"
        />

        <div className="flex gap-6 mt-10">
          <button
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            onClick={() => choose("real")}
          >
            Real
          </button>

          <button
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            onClick={() => choose("fake")}
          >
            AI
          </button>
        </div>

        <p className="mt-6 text-gray-600 text-lg">
          Image {index + 1} / {images.length}
        </p>
      </div>
    </>
  );
}
