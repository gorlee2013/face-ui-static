import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

export default function CumulativeChart({ results }) {
  // Build cumulative arrays
  let you = 0;
  let model = 0;

  const youScores = [];
  const modelScores = [];

  results.forEach((r) => {
    if (r.studentCorrect) you++;
    if (r.modelCorrect) model++;

    youScores.push(you);
    modelScores.push(model);
  });

  const labels = results.map((_, i) => `Image ${i + 1}`);

  const data = {
    labels,
    datasets: [
      {
        label: "You",
        data: youScores,
        borderColor: "rgb(34, 197, 94)", // green-500
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        borderWidth: 3,
        pointRadius: 5,
        tension: 0.3,
      },
      {
        label: "Model",
        data: modelScores,
        borderColor: "rgb(59, 130, 246)", // blue-500
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderWidth: 3,
        pointRadius: 5,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-10">
      <Line data={data} options={options} />
    </div>
  );
}
