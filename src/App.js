import React, { useState, useEffect, useMemo } from "react";
import vehiclesData from "./data/vehicles.json";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// === Funciones físicas ===
function calcVelocity(t, { m, F0, c }) {
  const v_inf = F0 / c;
  const tau = m / c;
  return v_inf * (1 - Math.exp(-t / tau));
}

function calcDownforce(v, { kd }) {
  return kd * v * v;
}

function downforcePercent(D, { m }) {
  return (D / (m * 9.81)) * 100;
}

function generateData(vehicle, dt = 0.2) {
  const data = [];
  const v_inf = vehicle.F0 / vehicle.c; // max theoretical speed
  for (let t = 0; t <= 160; t += dt) {
    const v = calcVelocity(t, vehicle);
    if (v >= v_inf) break; //
    const D = calcDownforce(v, vehicle);
    const p = downforcePercent(D, vehicle);
    data.push({ t, v, D, p });
  }
  return data;
}

// === Paleta de colores automática ===
const COLORS = ["#e63946", "#457b9d", "#2a9d8f", "#ffb703"];

export default function CarComparisonApp() {
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [unit, setUnit] = useState("m/s"); // 'm/s' or 'km/h'

  useEffect(() => {
    setVehicles(vehiclesData.vehicles);
    if (vehiclesData.vehicles.length > 0) {
      setSelected([vehiclesData.vehicles[0].name]);
    }
  }, []);

  const addVehicle = (name) => {
    if (selected.length < 4 && !selected.includes(name)) {
      setSelected([...selected, name]);
    }
  };

  const removeVehicle = (name) => {
    setSelected(selected.filter((v) => v !== name));
  };

  const getVehicle = (name) => vehicles.find((v) => v.name === name);
  const available = vehicles.filter((v) => !selected.includes(v.name));

  const chartData = useMemo(() => {
    const all = {};
    let globalMaxSpeed = 0;
    const vehicleMap = new Map();
    selected.forEach((name) => {
      const v = vehicles.find((x) => x.name === name);
      if (!v) {
        console.warn(`Vehicle not found: ${name}`);
        return;
      }
      vehicleMap.set(name, v);
      const v_inf = v.F0 / v.c;
      if (v_inf > globalMaxSpeed) globalMaxSpeed = v_inf;
    });
    const maxTime = Math.max(
      ...selected.map((name) => {
        const v = vehicleMap.get(name);
        if (!v) return 0;
        const tau = v.m / v.c;
        return -tau * Math.log(0.001);
      }),
    );
    selected.forEach((name) => {
      const v = vehicleMap.get(name);
      if (v) all[name] = generateData(v, 0.5, maxTime);
    });
    return { all, globalMaxSpeed };
  }, [selected, vehicles]);

  // Prepare display data depending on selected unit (m/s or km/h).
  // We keep the raw data in chartData.all (v in m/s) and produce v_disp for plotting/tooltip.
  const displayChartData = useMemo(() => {
    const all = {};
    const globalMaxSpeed =
      chartData && chartData.globalMaxSpeed
        ? chartData.globalMaxSpeed * (unit === "km/h" ? 3.6 : 1)
        : 0;
    Object.keys(chartData.all || {}).forEach((name) => {
      const arr = chartData.all[name] || [];
      all[name] = arr.map((p) => ({
        ...p,
        v_disp: unit === "km/h" ? p.v * 3.6 : p.v,
      }));
    });
    return { all, globalMaxSpeed };
  }, [chartData, unit]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Comparador de Vehículos
      </h1>

      {/* === Tabla de comparación === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {selected.map((name) => {
          const v = getVehicle(name);
          if (!v) return null;
          return (
            <div
              key={v.name}
              className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center relative"
            >
              <button
                onClick={() => removeVehicle(v.name)}
                className="absolute top-2 right-3 text-red-500 text-lg"
              >
                ✕
              </button>
              {v.image ? (
                <img
                  src={v.image}
                  alt={v.name}
                  className="h-32 object-cover rounded-lg mb-3"
                />
              ) : (
                <div className="h-32 w-full bg-gray-200 rounded-lg mb-3 flex items-center justify-center text-gray-500">
                  Sin imagen
                </div>
              )}
              <h2 className="font-semibold text-center mb-3">{v.name}</h2>
              <table className="text-sm w-full border-t border-gray-200">
                <tbody>
                  <tr>
                    <td className="p-1 font-medium text-gray-600">Masa</td>
                    <td className="p-1 text-right">{v.m} kg</td>
                  </tr>
                  <tr>
                    <td className="p-1 font-medium text-gray-600">F₀</td>
                    <td className="p-1 text-right">{v.F0} N</td>
                  </tr>
                  <tr>
                    <td className="p-1 font-medium text-gray-600">c</td>
                    <td className="p-1 text-right">{v.c}</td>
                  </tr>
                  <tr>
                    <td className="p-1 font-medium text-gray-600">kₙ</td>
                    <td className="p-1 text-right">{v.kd}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}

        {/* === Añadir nuevo vehículo === */}
        {selected.length < 4 && (
          <div className="bg-gray-100 rounded-2xl shadow-inner p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Añadir vehículo
            </h3>
            <select
              className="border rounded-lg p-2 w-full text-center mb-3"
              onChange={(e) => {
                if (e.target.value) addVehicle(e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">Seleccionar...</option>
              {available.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
            <div className="text-gray-400 text-sm text-center">
              Puedes comparar hasta 4 vehículos.
            </div>
          </div>
        )}
      </div>

      {/* === Gráfica combinada optimizada === */}
      <div className="bg-white rounded-2xl shadow-md p-6 mt-12">
        <h3 className="text-lg font-semibold text-center mb-4">
          Comparación de Downforce (N)
        </h3>

        {/* Unit toggle */}
        <div className="flex justify-center mb-4">
          <button
            className={`px-4 py-1 rounded-full border ${unit === "m/s" ? "bg-blue-500 text-white" : "bg-white text-gray-800"}`}
            onClick={() => setUnit((u) => (u === "m/s" ? "km/h" : "m/s"))}
            aria-label="Toggle speed unit"
          >
            {unit === "m/s" ? "m/s" : "km/h"}
          </button>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="t"
              type="number"
              domain={[0, "auto"]}
              label={{
                value: "Tiempo (s)",
                position: "insideBottom",
                dy: 10,
              }}
            />
            <YAxis
              yAxisId="speed"
              label={{
                value: `Velocidad (${unit})`,
                angle: -90,
                position: "insideLeft",
              }}
            />
            <YAxis
              yAxisId="downforce"
              orientation="right"
              label={{
                value: "Downforce (N)",
                angle: 90,
                position: "insideRight",
              }}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name && name.includes("Velocidad")) {
                  return [`${Number(value).toFixed(4)} ${unit}`, name];
                }
                return [Number(value).toFixed(4), name];
              }}
            />
            <Legend />
            {selected.map((name, idx) => (
              <>
                <Line
                  key={`${name}-v`}
                  yAxisId="speed"
                  type="monotone"
                  data={displayChartData.all[name]}
                  dataKey="v_disp"
                  name={`${name} Velocidad`}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  key={`${name}-D`}
                  yAxisId="downforce"
                  type="monotone"
                  data={displayChartData.all[name]}
                  dataKey="D"
                  name={`${name} Downforce`}
                  stroke={COLORS[(idx + 2) % COLORS.length]} // Offset color for distinction
                  strokeWidth={2}
                  dot={false}
                />
              </>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
