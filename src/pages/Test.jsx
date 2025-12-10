import { useState, useEffect } from "react";
import { loadCsv } from "../api/loadCsv";
import { useSearchParams } from "react-router-dom";
import ScoreTracker from "../components/ScoreTracker";


export default function Test() {
  // Must define this FIRST
  const [query] = useSearchParams();
  const startIndex = Number(query.get("index") || 0);

  const saved = JSON.parse(localStorage.getItem("answers_temp") || "[]");

  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(startIndex);
  const [answers, setAnswers] = useState(saved);

  // Fisher–Yates shuffle
  function shuffle(array) {
    let arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  useEffect(() => {
    loadCsv().then((allImages) => {
      // Separate real (1) and fake (0)
      const realImages = allImages.filter(img => img.label === 0);  // 0 = real
      const fakeImages = allImages.filter(img => img.label === 1);  // 1 = fake


      if (realImages.length === 0 || fakeImages.length === 0) {
        console.error("Dataset must contain at least one real and one fake image.");
        return;
      }

      // Pick one real + one fake
      const guaranteed = [
        realImages[Math.floor(Math.random() * realImages.length)],
        fakeImages[Math.floor(Math.random() * fakeImages.length)],
      ];

      // Shuffle everything
      const shuffled = shuffle(allImages);

      // Remove the guaranteed ones from the pool
      const remaining = shuffled.filter(
        img => img.src !== guaranteed[0].src && img.src !== guaranteed[1].src
      );

      // Build final 10-image set
      const finalSet = shuffle([
        ...guaranteed,
        ...remaining.slice(0, 8)
      ]);

      setImages(finalSet);
    });
  }, []);

  if (images.length === 0) {
    return <p className="mt-20 text-gray-600 text-xl">Loading images...</p>;
  }

  function choose(choice) {
    const realLabel = images[index].label === 0 ? "real" : "fake";
    const correct = choice === realLabel;

    const updated = [...answers, { choice, correct }];
    setAnswers(updated);

    localStorage.setItem("answers_temp", JSON.stringify(updated));

    // Go to feedback page
    const img = images[index];

    const params = new URLSearchParams({
      correct: String(correct),
      src: img.src,
      label: realLabel,
      next: index + 1,
      total: images.length,

      // NEW — model info (precomputed)
      model_label: String(img.model_label),        // 0 or 1
      confidence: String(img.confidence),
      prob_real: String(img.prob_real),
      prob_fake: String(img.prob_fake),
    });


    window.location.href = "/feedback?" + params.toString();
  }

    return (
    <>
        {/* Score tracker floating in the top-right corner */}
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
