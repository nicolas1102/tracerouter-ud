const continentListElement = document.querySelector('#continent');
const continentSelectorElement = document.querySelector('#continent-selector');
const serverListElement = document.querySelector('#server');
const serverSelectorElement = document.querySelector('#server-selector');
const addressListElement = document.querySelector('#address');
const addressSelectorElement = document.querySelector('#address-selector');
const btnElement = document.querySelector('#btn');
const routePElement = document.querySelector('#route');
const initialAddressPElement = document.querySelector('#initial-address');
const breakNumberPElement = document.querySelector('#break-number');
const IPAddressPElement = document.querySelector('#ip-address');
const averageResTimePElement = document.querySelector('#average-res-time');
const finalAddressPElement = document.querySelector('#final-address');
const deadBreaksNumberPElement = document.querySelector('#dead-breaks-number');
const routeListElement = document.querySelector('#route-list');

let continent;
let server;
let address;
let IPAddress = '';
let breaks = [];
let lat = '';
let lon = '';
let latArray = [];
let lonArray = [];
let statusF = true;

//  ------- INITIAL PAGE CONFIGURATION -------
function getContinentsOptions() {
    // creating the default
    let option = document.createElement("option");
    option.value = '-1';
    option.text = '----- Seleccione un continente -----';
    option.selected = true;
    option.disabled = true;
    option.hidden = true;
    continentSelectorElement.appendChild(option);

    let continents = Object.keys(routes);
    for (let i = 0; i < continents.length; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.text = continents[i];
        continentSelectorElement.appendChild(option);
    }
}
getContinentsOptions();
//initial Position map
let map = L.map('map').setView([4.639386, -74.082412], 6);
//show map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);



function updateServers() {
    serverListElement.style.display = 'none';
    addressListElement.style.display = 'none';
    btnElement.style.display = 'none';
    routePElement.style.display = 'none';

    continent = continentSelectorElement.value;

    // deleting previous servers options
    for (let i = (serverSelectorElement.options.length - 1); i >= 1; i--) {
        serverSelectorElement.remove(i);
    }
    // creating the default
    let option = document.createElement("option");
    option.value = '-1';
    option.text = '----- Seleccione un sevidor -----';
    option.selected = true;
    option.disabled = true;
    option.hidden = true;
    serverSelectorElement.appendChild(option);

    let servers = Object.values(routes);
    servers = Object.keys(servers[continent]);
    for (let i = 0; i < servers.length; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.text = servers[i];
        serverSelectorElement.appendChild(option);
    }
    serverListElement.style.display = 'block';
}

function updateAddress() {
    addressListElement.style.display = 'none';
    btnElement.style.display = 'none';
    routePElement.style.display = 'none';

    server = serverSelectorElement.value;

    // deleting previous address options
    for (let i = (addressSelectorElement.options.length - 1); i >= 1; i--) {
        addressSelectorElement.remove(i);
    }

    // creating the default
    let option = document.createElement("option");
    option.value = '-1';
    option.text = '----- Seleccione una direccion -----';
    option.selected = true;
    option.disabled = true;
    option.hidden = true;
    addressSelectorElement.appendChild(option);

    let continents = Object.values(routes);
    let servers = continents[continent];
    let addresses = Object.values(servers);
    addresses = Object.keys(addresses[server]);
    for (let i = 0; i < addresses.length; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.text = addresses[i];
        addressSelectorElement.appendChild(option);
    }
    addressListElement.style.display = 'block';
}

function showButton() {
    routePElement.style.display = 'none';
    btnElement.style.display = 'block';
}

function changeMapPosition(option) {
    routePElement.style.display = 'block';

    address = addressSelectorElement.value;

    let continents = Object.values(routes);
    let servers = Object.values(continents[continent]);
    let addresses = Object.values(servers[server]);

    address = addresses[address];

    IPAddress = address.IPAddress;
    breaks = address.breaks;

    initialAddressPElement.textContent = address.breaks[0];
    breakNumberPElement.textContent = address.breaks.length;
    IPAddressPElement.textContent = address.IPAddress;
    averageResTimePElement.textContent = address.averageResponseTime;
    finalAddressPElement.textContent = address.breaks[address.breaks.length - 1];

    // deleting previous breaks list options
    for (let i = (routeListElement.children.length - 1); i >= 1; i--) {
        routeListElement.children[i].remove();
    }
    // deadBreaksNumberPElement.textContent = 0;

    for (let i = 0; i < address.breaks.length; i++) {
        let liElement = document.createElement("li");
        let pElement = document.createElement("p");
        if (address.breaks[i] === "") {
            deadBreaksNumberPElement.textContent = +deadBreaksNumberPElement.textContent + 1;
            pElement.textContent = '------ Punto Muerto ------';
        } else {
            pElement.textContent = address.breaks[i];
        }
        liElement.appendChild(pElement);
        routeListElement.appendChild(liElement);
    }

    map.off();
    map.remove();
    map = L.map('map').setView([4.639386, -74.082412], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    convertDirectionToCoordinates();
}

async function convertDirectionToCoordinates() {
    await getAddress(IPAddress);
    if (statusF == true) {
        let coordenadas = [lat, lon];
        map.flyTo(coordenadas, 6);
        await drawBreaks();
    } else {
        alert('Something went wrong!');
    }
};

async function drawBreaks() {
    for (i = 0; i < breaks.length; i++) {
        await getAddress(breaks[i]);
        console.log(statusF);
        if (statusF == true) {
            latArray.push(lat);
            lonArray.push(lon);
            console.log(latArray, lonArray);
            L.marker([lat, lon]).addTo(map);
            L.marker([lat, lon]).addTo(map).bindPopup(`Nodo: ${i}`);
            if (i != 0) {
                if (breaks[i - 1] != 0) {
                    let coord_camino = [
                        [latArray[i - 1], lonArray[i - 1]],
                        [latArray[i], lonArray[i]]
                    ];
                    L.polyline(coord_camino, { color: 'orange' }).addTo(map);
                }
            }
        } else {
            breaks[i] = 0;
            latArray.push(0);
            lonArray.push(0);
        }
    }
    IPAddress = '';
    breaks = [];
    lat = '';
    lon = '';
    latArray = [];
    lonArray = [];
    statusF = true;
}

async function getAddress(direccion) {
    let res;
    let data;
    try {
        res = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=1478f5f05d424869940ce62a7df9950e&ip=${direccion}`);
        data = await res.json();
        console.log(data.latitude);
        console.log(data.longitude);
        lat = data.latitude;
        lon = data.longitude;
        console.log('Valores del API:' + lat + " " + lon);
        if (lat == undefined || lon == undefined) {
            statusF = false;
        } else {
            statusF = true;
        }
    } catch (error) {
        console.log(error);
        alert('Something went wrong, cannot get the address!');
        statusF = false;
    }
}

continentSelectorElement.addEventListener('change', updateServers);
serverSelectorElement.addEventListener('change', updateAddress);
addressSelectorElement.addEventListener('change', showButton);
btnElement.addEventListener('click', changeMapPosition);