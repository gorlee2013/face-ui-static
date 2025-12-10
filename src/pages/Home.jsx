import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl font-bold mb-4">Real or AI?</h1>

      <p className="text-lg text-gray-600 mb-8 max-w-xl">
        Can you identify AI-generated images better than a deepfake detection model?
      </p>

      <Link to="/test">
        <button className="px-8 py-4 text-xl bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
          Start Test
        </button>
      </Link>
    </div>
  );
}
