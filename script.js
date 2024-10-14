// URL base de la API de OpenWeatherMap con tu API Key
const apiKey = 'a9d931b9cb3d60ad7348aae9e5666981';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

// Ciudades por defecto
let defaultCities = [
    'Ciudad de México',
    'Nogales',
    'Arizona',
    'Buenos Aires',
    'Mexicali'
];

// Cargar ciudades predefinidas del localStorage si existen, si no, guardarlas
if (!localStorage.getItem('defaultCities')) {
    localStorage.setItem('defaultCities', JSON.stringify(defaultCities));
} else {
    defaultCities = JSON.parse(localStorage.getItem('defaultCities'));
}

// Inicialización de eventos cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    mostrarCiudadGuardada();
    mostrarCiudadesPredefinidas();
    mostrarCiudadMasCaliente();
});

// Función para obtener los datos del clima de una ciudad usando la API
async function obtenerClima(ciudad) {
    const response = await fetch(`${apiUrl}?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`);
    const data = await response.json();
    return data;
}

// Función para manejar el formulario y consultar el clima de la ciudad ingresada
document.getElementById('cityForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const cityInput = document.getElementById('cityInput').value;
    
    const data = await obtenerClima(cityInput);
    
    if (data.cod === 200) {
        localStorage.setItem('ciudad', cityInput);
        mostrarCiudadGuardada();
        ocultarFormulario();  // Ocultar el formulario cuando la ciudad es válida
    } else {
        alert('Ciudad no encontrada');
    }

    document.getElementById('cityInput').value = '';
});

// Función para mostrar la ciudad guardada en localStorage y su clima
function mostrarCiudadGuardada() {
    const ciudad = localStorage.getItem('ciudad');
    
    if (ciudad) {
        obtenerClima(ciudad).then(data => {
            document.getElementById('welcomeMessage').textContent = `Bienvenido, el clima en tu ciudad (${ciudad}) es ${data.main.temp}°C con ${data.weather[0].description}.`;
            ocultarFormulario();  // Ocultar el formulario si ya hay una ciudad guardada
        });
    } else {
        document.getElementById('welcomeMessage').textContent = '';
        mostrarFormulario();  // Mostrar el formulario si no hay ciudad guardada
    }
}

// Función para borrar la ciudad guardada y limpiar el localStorage
document.getElementById('clearCity').addEventListener('click', () => {
    localStorage.removeItem('ciudad');
    document.getElementById('welcomeMessage').textContent = '';
    mostrarFormulario();  // Mostrar el formulario de nuevo
    location.reload(); // Recargar la página para aplicar los cambios
});

// Función para mostrar el clima de las ciudades predefinidas
async function mostrarCiudadesPredefinidas() {
    const citiesList = document.getElementById('defaultCities');
    citiesList.innerHTML = ''; // Limpiar la lista antes de agregar nuevos elementos
    
    // Cargamos las ciudades desde el localStorage y nos aseguramos de que estén ordenadas alfabéticamente
    let ciudadesGuardadas = JSON.parse(localStorage.getItem('defaultCities')) || defaultCities;

    // Aseguramos que estén ordenadas alfabéticamente
    const ciudadesOrdenadas = ciudadesGuardadas.sort((a, b) => a.localeCompare(b));

    // Obtener clima para las ciudades en orden alfabético y mostrarlas
    for (const city of ciudadesOrdenadas) {
        const data = await obtenerClima(city);
        const li = document.createElement('li');
        li.textContent = `El clima en ${city} es ${data.main.temp}°C con ${data.weather[0].description}`;
        citiesList.appendChild(li);
    }
}

// Función para agregar una nueva ciudad al arreglo y guardarla en localStorage
document.getElementById('addCityButton').addEventListener('click', () => {
    const newCity = document.getElementById('newCityInput').value.trim();
    
    if (newCity && !defaultCities.includes(newCity)) {
        defaultCities.push(newCity);
        localStorage.setItem('defaultCities', JSON.stringify(defaultCities));
        mostrarCiudadesPredefinidas(); // Actualizar la lista
        location.reload(); // Recargar la página para reflejar los cambios
    } else {
        alert('Ciudad ya existente o entrada vacía.');
    }

    document.getElementById('newCityInput').value = '';
});

// Función para encontrar la ciudad más caliente de las predefinidas
async function mostrarCiudadMasCaliente() {
    let hottestCity = '';
    let highestTemp = -Infinity;

    // Obtenemos el clima de todas las ciudades y buscamos la más caliente
    for (const city of defaultCities) {
        const data = await obtenerClima(city);
        const temp = data.main.temp;
        if (temp > highestTemp) {
            highestTemp = temp;
            hottestCity = city;
        }
    }

    document.getElementById('hottestCity').textContent = `La ciudad más caliente es ${hottestCity} con ${highestTemp}°C.`;
}

// Función para ocultar el formulario
function ocultarFormulario() {
    document.getElementById('cityForm').classList.add('hidden');
}

// Función para mostrar el formulario
function mostrarFormulario() {
    document.getElementById('cityForm').classList.remove('hidden');
}
