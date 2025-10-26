import React, { useState } from 'react';
import vehiclesData from './data/vehicles.json';

const App = () => {
  const vehicles = vehiclesData.vehicles;
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  const handleSelect = (vehicleName) => {
    if (selectedVehicles.includes(vehicleName)) {
      setSelectedVehicles(selectedVehicles.filter(name => name !== vehicleName));
    } else {
      setSelectedVehicles([...selectedVehicles, vehicleName]);
    }
  };

  const getVehicleDetails = (name) => {
    return vehicles.find(v => v.name === name);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Simulador de Downforce</h1>
      
      {/* Lista de vehículos */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Selecciona Vehículos</h2>
        <ul className="space-y-2">
          {vehicles.map((vehicle) => (
            <li key={vehicle.name} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedVehicles.includes(vehicle.name)}
                onChange={() => handleSelect(vehicle.name)}
                className="mr-2"
              />
              <span>{vehicle.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Información de vehículos seleccionados */}
      {selectedVehicles.length > 0 && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {selectedVehicles.map((name) => {
            const details = getVehicleDetails(name);
            return (
              <div key={name} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">{name}</h3>
                <ul className="space-y-1">
                  <li>Masa (m): {details.m} kg</li>
                  <li>Fuerza Motor (F0): {details.F0} N</li>
                  <li>Coef. Resistencia (c): {details.c} N·s/m</li>
                  <li>Const. Downforce (kd): {details.kd} N·s²/m²</li>
                  <li>Rigidez Susp. (kz): {details.kz} N/m</li>
                  <li>Amortiguamiento (cz): {details.cz} N·s/m</li>
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Sección para comparaciones (placeholder por ahora) */}
      {selectedVehicles.length > 1 && (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Comparaciones</h2>
          <p className="text-gray-600">Aquí irán las gráficas de v(t), D(t) y z(t) para los vehículos seleccionados. En el próximo paso, integraremos las simulaciones.</p>
          {/* Aquí agregarás las gráficas más adelante */}
        </div>
      )}
    </div>
  );
};

export default App;