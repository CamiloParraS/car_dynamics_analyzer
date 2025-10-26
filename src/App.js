import React, { useState, useEffect } from "react";
import vehiclesData from "./data/vehicles.json";


export default function CarComparisonApp() {
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState([]);

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Comparador de Vehículos
      </h1>

      {/* === Tabla de comparación (máx 4 columnas) === */}
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
                    <td className="p-1 font-medium text-gray-600">F0</td>
                    <td className="p-1 text-right">{v.F0} N</td>
                  </tr>
                  <tr>
                    <td className="p-1 font-medium text-gray-600">c</td>
                    <td className="p-1 text-right">{v.c}</td>
                  </tr>
                  <tr>
                    <td className="p-1 font-medium text-gray-600">kd</td>
                    <td className="p-1 text-right">{v.kd}</td>
                  </tr>
                  <tr>
                    <td className="p-1 font-medium text-gray-600">kz</td>
                    <td className="p-1 text-right">{v.kz}</td>
                  </tr>
                  <tr>
                    <td className="p-1 font-medium text-gray-600">cz</td>
                    <td className="p-1 text-right">{v.cz}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}

        {/* === Espacio para agregar nuevos vehículos === */}
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
    </div>
  );
}