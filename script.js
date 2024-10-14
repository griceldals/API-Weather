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

// Inicialización de funciones
document.addEventListener('DOMContentLoaded', () => {
    mostrarCiudadGuardada(); //la funcion muestra ciudad guardada en el localstorage
    mostrarCiudadesPredefinidas();//la funcion muestra las default
    mostrarCiudadMasCaliente();//la funcion muestra la más caliente
});

// Función para obtener los datos del clima
//async await = función asíncrona
async function obtenerClima(ciudad) { //envía solicitud a la api con el nombre de la ciudad
    const response = await fetch(`${apiUrl}?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`); //manda la temperatura y los datos en español
    const data = await response.json(); //y devuelve los datos en formato json
    return data;
}

// Función para manejar el formulario y consultar el clima de la ciudad ingresada
document.getElementById('cityForm').addEventListener('submit', async (e) => {
    e.preventDefault(); //evita que el form recargue la pag.
    const cityInput = document.getElementById('cityInput').value; //selecciona el input con el id cityInput y extrae lo que el usuario ingresó y guarda este valor para volver a ser usado.

    const data = await obtenerClima(cityInput);

    if (data.cod === 200) { //si la ciudad existe (200) la guarda, actualiza y oculta el form si no, entra la condición no encontrada.
        localStorage.setItem('ciudad', cityInput);
        mostrarCiudadGuardada();
        ocultarFormulario();  // Ocultar el formulario cuando la ciudad es válida
    } else {
        alert('Ciudad no encontrada');
    }

    document.getElementById('cityInput').value = ''; //limpia el input
});

// Función para mostrar la ciudad guardada en localStorage y su clima
function mostrarCiudadGuardada() {
    const ciudad = localStorage.getItem('ciudad'); //busca en localstorage la ciudad que ya fue guardada.

    if (ciudad) { //si existe la ciudad, obtiene los datos y los muestra en el mensaje de bienvenida, es decir al incio
        obtenerClima(ciudad).then(data => {
            document.getElementById('welcomeMessage').textContent = `Bienvenido, el clima en tu ciudad (${ciudad}) es ${data.main.temp}°C con ${data.weather[0].description}.`;
            ocultarFormulario();  // Oculta el formulario si ya hay una ciudad guardada
        });
    } else {
        document.getElementById('welcomeMessage').textContent = '';
        mostrarFormulario();  //si no se cumple muestra el formulario
    }
}

// Función para borrar la ciudad guardada y limpiar el localStorage
document.getElementById('clearCity').addEventListener('click', () => {
    localStorage.removeItem('ciudad');
    document.getElementById('welcomeMessage').textContent = '';
    mostrarFormulario();  // Mostrar el formulario de nuevo
    location.reload(); // Recargar la página para aplicar los cambios
});

// Función para mostrar el clima de las ciudades default
async function mostrarCiudadesPredefinidas() {
    const citiesList = document.getElementById('defaultCities');
    citiesList.innerHTML = ''; // Limpia la lista

    // Carga las ciudades desde el localStorage
    let ciudadesGuardadas = JSON.parse(localStorage.getItem('defaultCities')) || defaultCities;

    //aquí se asegura que están ordenadas alfabéticamente
    const ciudadesOrdenadas = ciudadesGuardadas.sort((a, b) => a.localeCompare(b));

    //obtiene el clima de las ciudades ya organizadas en orden alfabético y las muestra
    for (const city of ciudadesOrdenadas) {
        const data = await obtenerClima(city);
        const li = document.createElement('li');
        li.textContent = `El clima en ${city} es ${data.main.temp}°C ${data.weather[0].description}`;
        citiesList.appendChild(li);
    }
}

// Función para agregar una nueva ciudad
document.getElementById('addCityButton').addEventListener('click', () => { //se activa el botón cuando se da click
    const newCity = document.getElementById('newCityInput').value.trim(); //se obtiene el valor ingresado con el id newCityInput con *trim elimina los espacios en blanco

    if (newCity && !defaultCities.includes(newCity)) { //verifica si está vacio newCity y verifica que la ciudad no esté en el arreglo con !defaultCities
        defaultCities.push(newCity); //si se cumple la condición el valor newCity añade al arreglo defaultCities a través de *push
        localStorage.setItem('defaultCities', JSON.stringify(defaultCities)); //lo guarda y lo convierte en cadena Json ya que localstorage sólo acepta cadenas de texto
        mostrarCiudadesPredefinidas(); // actualiza la lista
        location.reload(); // recarga la página para reflejar los cambios
    } else {
        alert('Ciudad ya existente o entrada vacía.');
    }

    document.getElementById('newCityInput').value = '';
});

// Función para la ciudad más caliente de las default
async function mostrarCiudadMasCaliente() { //función asíncrona
    let hottestCity = '';
    let highestTemp = -Infinity; //*infinity es el valor más bajo en JS, así que aqui funciona para que cualquier temperatura obtenida sea mayor que la inicial; facilita la comparación.

    // Obtenemos el clima de todas las ciudades y buscamos la más caliente
    for (const city of defaultCities) { // va iterando y almacenando en city
        const data = await obtenerClima(city); //llama a la API y obtiene datos
        const temp = data.main.temp; //accede a la temp actual
        if (temp > highestTemp) { //comparación; si *temp actual es mayor que highestTemp la ciudad actual es la más caliente.
            highestTemp = temp;
            hottestCity = city;
        }
    }

    document.getElementById('hottestCity').textContent = `La ciudad más caliente es ${hottestCity} con ${highestTemp}°C.`; //textContent se actualiza para mostrar un msj con el nombre de la ciudad mas caliente y su temp
}

// Función para ocultar el formulario
function ocultarFormulario() {
    document.getElementById('cityForm').classList.add('hidden');
}

// Función para mostrar el formulario
function mostrarFormulario() {
    document.getElementById('cityForm').classList.remove('hidden');
}
