// Registers the Chart.js pieces used across the dashboard — imported once (in
// Dashboard.jsx) so every chart component can just `import { Bar, Line, Doughnut, Pie }`.
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

export default ChartJS;
