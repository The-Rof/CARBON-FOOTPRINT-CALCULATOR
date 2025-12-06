// Constants based on research
const CONSUMPTION_RATES = {
    carro: 1.0,       // Gallons/hour
    bus: 3.5,         // Gallons/hour
    moto: 0.3,        // Gallons/hour
    camioneta: 3.0,   // Gallons/hour
    lancha: 5.0,      // Gallons/hour
    avion: 8.0        // Gallons/hour/passenger
};

const EMISSION_FACTORS = {
    carro: 8.89,      // Kg CO2/Gal (Gasoline)
    bus: 10.18,       // Kg CO2/Gal (Diesel)
    moto: 8.89,       // Gasoline
    camioneta: 10.18, // Diesel/Gasoline Mix
    lancha: 8.89,     // Gasoline
    avion: 9.75       // Jet Fuel
};

const TREE_ABSORPTION_YEAR = 21; // Kg CO2 per tree per year

// Thresholds for Monthly CO2 (Kg)
const THRESHOLDS = {
    BLUE: 10,
    GREEN: 200,
    YELLOW: 600
};

let currentStep = 1;
const totalSteps = 7;
let userName = '';

function startQuiz() {
    const nameInput = document.getElementById('userName');
    userName = nameInput.value.trim();

    if (!userName) {
        nameInput.style.borderColor = '#ef4444';
        nameInput.focus();
        return;
    }

    // Hide welcome screen
    document.getElementById('welcomeScreen').style.display = 'none';

    // Show app header and quiz
    const appHeader = document.getElementById('appHeader');
    const quizContainer = document.getElementById('carbonQuiz');

    appHeader.classList.add('visible');
    quizContainer.classList.add('visible');

    // Update user name display
    document.getElementById('userNameDisplay').textContent = userName;

    updateProgressBar();
}

function updateProgressBar() {
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

function nextStep(step) {
    document.querySelector(`.quiz-step[data-step="${currentStep}"]`).classList.remove('active');
    currentStep = step;
    document.querySelector(`.quiz-step[data-step="${currentStep}"]`).classList.add('active');
    updateProgressBar();

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(step) {
    document.querySelector(`.quiz-step[data-step="${currentStep}"]`).classList.remove('active');
    currentStep = step;
    document.querySelector(`.quiz-step[data-step="${currentStep}"]`).classList.add('active');
    updateProgressBar();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getRadioValue(name) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    return selected ? parseInt(selected.value) : 0;
}

function getInputValue(id) {
    const val = parseFloat(document.getElementById(id).value);
    return isNaN(val) ? 0 : val;
}

function calculateEmissions() {
    let totalEmissions = 0;
    const breakdown = [];

    // 1. Carro
    const hoursCarro = getInputValue('horas_carro');
    const daysCarro = getRadioValue('dias_carro');
    const emissionsCarro = hoursCarro * daysCarro * 4 * CONSUMPTION_RATES.carro * EMISSION_FACTORS.carro;
    if (emissionsCarro > 0) {
        totalEmissions += emissionsCarro;
        breakdown.push({ label: 'Carro', value: emissionsCarro });
    }

    // 2. Bus (divided by average passengers)
    const hoursBus = getInputValue('horas_bus');
    const daysBus = getRadioValue('dias_bus');
    const busPassengerFactor = 20;
    const emissionsBus = (hoursBus * daysBus * 4 * CONSUMPTION_RATES.bus * EMISSION_FACTORS.bus) / busPassengerFactor;
    if (emissionsBus > 0) {
        totalEmissions += emissionsBus;
        breakdown.push({ label: 'Bus', value: emissionsBus });
    }

    // 3. Moto
    const hoursMoto = getInputValue('horas_moto');
    const daysMoto = getRadioValue('dias_moto');
    const emissionsMoto = hoursMoto * daysMoto * 4 * CONSUMPTION_RATES.moto * EMISSION_FACTORS.moto;
    if (emissionsMoto > 0) {
        totalEmissions += emissionsMoto;
        breakdown.push({ label: 'Moto', value: emissionsMoto });
    }

    // 4. Camioneta
    const hoursCamioneta = getInputValue('horas_camioneta');
    const daysCamioneta = getRadioValue('dias_camioneta');
    const emissionsCamioneta = hoursCamioneta * daysCamioneta * 4 * CONSUMPTION_RATES.camioneta * EMISSION_FACTORS.camioneta;
    if (emissionsCamioneta > 0) {
        totalEmissions += emissionsCamioneta;
        breakdown.push({ label: 'Camioneta', value: emissionsCamioneta });
    }

    // 5. Avión (Monthly direct)
    const hoursAvion = getInputValue('horas_avion');
    const emissionsAvion = hoursAvion * CONSUMPTION_RATES.avion * EMISSION_FACTORS.avion;
    if (emissionsAvion > 0) {
        totalEmissions += emissionsAvion;
        breakdown.push({ label: 'Avión', value: emissionsAvion });
    }

    // 6. Lancha (Monthly direct)
    const hoursLancha = getInputValue('horas_lancha');
    const emissionsLancha = hoursLancha * CONSUMPTION_RATES.lancha * EMISSION_FACTORS.lancha;
    if (emissionsLancha > 0) {
        totalEmissions += emissionsLancha;
        breakdown.push({ label: 'Lancha', value: emissionsLancha });
    }

    return { total: totalEmissions, breakdown: breakdown };
}

function displayResults(data) {
    const { total, breakdown } = data;

    // Hide Quiz, Show Dashboard
    document.getElementById('carbonQuiz').classList.remove('visible');
    document.getElementById('carbonQuiz').classList.add('hidden');
    document.getElementById('resultado').classList.remove('hidden');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Animate Score
    animateValue('score-value', 0, total.toFixed(1), 1500);

    // Traffic Light Logic
    resetLights();
    const banner = document.getElementById('classification-banner');

    if (total <= THRESHOLDS.BLUE) {
        activateLight('blue');
        banner.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
        banner.style.color = '#3b82f6';
        banner.style.borderColor = '#3b82f6';
        banner.innerHTML = `🌟 ¡Increíble, ${userName}! Huella Cero/Neutral`;
    } else if (total <= THRESHOLDS.GREEN) {
        activateLight('green');
        banner.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
        banner.style.color = '#059669';
        banner.style.borderColor = '#10b981';
        banner.innerHTML = `🌿 ¡Muy bien, ${userName}! Huella Baja`;
    } else if (total <= THRESHOLDS.YELLOW) {
        activateLight('yellow');
        banner.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
        banner.style.color = '#d97706';
        banner.style.borderColor = '#f59e0b';
        banner.innerHTML = `⚠️ ${userName}, tienes una Huella Media - Puedes mejorar`;
    } else {
        activateLight('red');
        banner.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
        banner.style.color = '#dc2626';
        banner.style.borderColor = '#ef4444';
        banner.innerHTML = `🚨 ${userName}, tu Huella es Alta - ¡Considera vehículos eléctricos!`;
    }

    // Trees Calculation
    const yearlyEmissions = total * 12;
    const treesNeeded = Math.ceil(yearlyEmissions / TREE_ABSORPTION_YEAR);

    animateValue('trees-text', 0, treesNeeded, 1500, ' árboles/año');

    // Tree Visuals
    const treeContainer = document.getElementById('tree-visual');
    treeContainer.innerHTML = '';
    const visualTreeCount = Math.min(treesNeeded, 10);
    for (let i = 0; i < visualTreeCount; i++) {
        const span = document.createElement('span');
        span.textContent = '🌳';
        span.style.animation = `fadeIn 0.5s ease ${i * 0.1}s forwards`;
        span.style.opacity = '0';
        treeContainer.appendChild(span);
    }
    if (treesNeeded > 10) {
        const plus = document.createElement('span');
        plus.textContent = `+${treesNeeded - 10}`;
        plus.style.fontSize = '1.2rem';
        plus.style.fontWeight = '700';
        plus.style.color = 'var(--primary)';
        treeContainer.appendChild(plus);
    }

    // Breakdown List
    const list = document.getElementById('breakdown-list');
    list.innerHTML = '';
    if (breakdown.length === 0) {
        list.innerHTML = '<li><span>Sin emisiones registradas</span> <strong>0 kg</strong></li>';
    } else {
        breakdown.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${item.label}</span> <strong>${item.value.toFixed(1)} kg</strong>`;
            li.style.animation = 'fadeIn 0.5s ease';
            list.appendChild(li);
        });
    }

    // EV Savings Calculation (70% reduction estimate)
    const evSavings = (total * 0.7).toFixed(1);
    document.getElementById('ev-savings').textContent = evSavings;

    // Initialize Map with emissions data
    setTimeout(() => {
        initializeMap(total);
    }, 500);

    // Automatically log user data to CSV
    setTimeout(() => {
        logUserDataToCSV(data);
    }, 1000);
}

function calcularHuellaMensual() {
    const data = calculateEmissions();
    displayResults(data);
}

function resetQuiz() {
    document.getElementById('resultado').classList.add('hidden');
    document.getElementById('carbonQuiz').classList.remove('hidden');
    document.getElementById('carbonQuiz').classList.add('visible');

    // Reset inputs
    document.querySelectorAll('input[type="number"]').forEach(input => input.value = '');
    document.querySelectorAll('input[type="radio"][value="0"]').forEach(radio => radio.checked = true);

    // Go to step 1
    document.querySelector(`.quiz-step[data-step="${currentStep}"]`).classList.remove('active');
    currentStep = 1;
    document.querySelector(`.quiz-step[data-step="1"]`).classList.add('active');
    updateProgressBar();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Helper: Animate Numbers
function animateValue(id, start, end, duration, suffix = '') {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const val = Math.floor(progress * (end - start) + start);
        obj.innerHTML = val + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end + suffix;
        }
    };
    window.requestAnimationFrame(step);
}

// Helper: Traffic Light
function resetLights() {
    document.querySelectorAll('.light').forEach(l => l.classList.remove('active'));
}

function activateLight(color) {
    document.getElementById(`light-${color}`).classList.add('active');
}

// Map Functionality
let impactMap = null;

function initializeMap(emissions) {
    // Default to Bogotá, Colombia coordinates
    const defaultLat = 4.7110;
    const defaultLng = -74.0721;

    // Remove existing map if any
    if (impactMap) {
        impactMap.remove();
    }

    // Create map centered on Colombia
    impactMap = L.map('impactMap').setView([defaultLat, defaultLng], 6);

    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(impactMap);

    // Determine marker color based on emissions
    let markerColor = 'green';
    let impactLevel = 'Bajo';

    if (emissions > THRESHOLDS.YELLOW) {
        markerColor = 'red';
        impactLevel = 'Alto';
    } else if (emissions > THRESHOLDS.GREEN) {
        markerColor = 'orange';
        impactLevel = 'Medio';
    } else if (emissions > THRESHOLDS.BLUE) {
        markerColor = 'green';
        impactLevel = 'Bajo';
    } else {
        markerColor = 'blue';
        impactLevel = 'Muy Bajo';
    }

    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                // Store location for CSV export
                userLocation = { lat: userLat, lng: userLng };

                // Center map on user location
                impactMap.setView([userLat, userLng], 12);

                // Add marker at user location
                const marker = L.marker([userLat, userLng]).addTo(impactMap);
                marker.bindPopup(`
                    <div style="text-align: center; padding: 10px;">
                        <strong>Tu Ubicación</strong><br>
                        <span style="color: ${markerColor}; font-weight: bold;">Impacto: ${impactLevel}</span><br>
                        ${emissions.toFixed(1)} kg CO₂/mes
                    </div>
                `).openPopup();

                // Add circle to show impact radius
                const circleRadius = Math.min(emissions * 10, 5000); // Scale based on emissions
                L.circle([userLat, userLng], {
                    color: markerColor,
                    fillColor: markerColor,
                    fillOpacity: 0.2,
                    radius: circleRadius
                }).addTo(impactMap);
            },
            (error) => {
                // If geolocation fails, use default location (Bogotá)
                console.log('Geolocation error:', error);
                addDefaultMarker(defaultLat, defaultLng, emissions, markerColor, impactLevel);
            }
        );
    } else {
        // Geolocation not supported, use default location
        addDefaultMarker(defaultLat, defaultLng, emissions, markerColor, impactLevel);
    }
}

function addDefaultMarker(lat, lng, emissions, markerColor, impactLevel) {
    const marker = L.marker([lat, lng]).addTo(impactMap);
    marker.bindPopup(`
        <div style="text-align: center; padding: 10px;">
            <strong>Colombia</strong><br>
            <span style="color: ${markerColor}; font-weight: bold;">Impacto: ${impactLevel}</span><br>
            ${emissions.toFixed(1)} kg CO₂/mes
        </div>
    `).openPopup();

    // Add circle to show impact radius
    const circleRadius = Math.min(emissions * 10, 5000);
    L.circle([lat, lng], {
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.2,
        radius: circleRadius
    }).addTo(impactMap);
}

// Automatic data logging function
let userLocation = { lat: null, lng: null };

function logUserDataToCSV(data) {
    const now = new Date();
    const date = now.toLocaleDateString('es-CO');
    const time = now.toLocaleTimeString('es-CO');

    const evSavings = (data.total * 0.7).toFixed(2);
    const trees = Math.ceil((data.total * 12) / TREE_ABSORPTION_YEAR);

    // Determine classification
    let classification = '';
    if (data.total <= THRESHOLDS.BLUE) {
        classification = 'Muy Bajo (Azul)';
    } else if (data.total <= THRESHOLDS.GREEN) {
        classification = 'Bajo (Verde)';
    } else if (data.total <= THRESHOLDS.YELLOW) {
        classification = 'Medio (Amarillo)';
    } else {
        classification = 'Alto (Rojo)';
    }

    // Get breakdown values
    const getBreakdownValue = (label) => {
        const item = data.breakdown.find(b => b.label === label);
        return item ? item.value.toFixed(2) : '0.00';
    };

    // Location string
    const location = userLocation.lat && userLocation.lng
        ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
        : 'Bogotá, Colombia (Aproximada)';

    // Build CSV row
    let csvRow = '';
    csvRow += `${date},`;
    csvRow += `${time},`;
    csvRow += `"${userName}",`;
    csvRow += `${getInputValue('horas_carro')},`;
    csvRow += `${getRadioValue('dias_carro')},`;
    csvRow += `${getInputValue('horas_bus')},`;
    csvRow += `${getRadioValue('dias_bus')},`;
    csvRow += `${getInputValue('horas_moto')},`;
    csvRow += `${getRadioValue('dias_moto')},`;
    csvRow += `${getInputValue('horas_camioneta')},`;
    csvRow += `${getRadioValue('dias_camioneta')},`;
    csvRow += `${getInputValue('horas_avion')},`;
    csvRow += `${getInputValue('horas_lancha')},`;
    csvRow += `${getRadioValue('dias_cero')},`;
    csvRow += `${data.total.toFixed(2)},`;
    csvRow += `"${classification}",`;
    csvRow += `${trees},`;
    csvRow += `${getBreakdownValue('Carro')},`;
    csvRow += `${getBreakdownValue('Bus')},`;
    csvRow += `${getBreakdownValue('Moto')},`;
    csvRow += `${getBreakdownValue('Camioneta')},`;
    csvRow += `${getBreakdownValue('Avión')},`;
    csvRow += `${getBreakdownValue('Lancha')},`;
    csvRow += `"${location}",`;
    csvRow += `${evSavings}\n`;

    // Store in localStorage
    const storedData = localStorage.getItem('carbonFootprintData') || '';
    localStorage.setItem('carbonFootprintData', storedData + csvRow);

    // Trigger automatic download
    downloadDataCSV(csvRow);
}

function downloadDataCSV(newRow) {
    // Get existing data from localStorage
    const storedData = localStorage.getItem('carbonFootprintData') || '';

    // CSV Headers
    const headers = 'Fecha,Hora,Nombre,Carro Horas/dia,Carro Dias/sem,Bus Horas/dia,Bus Dias/sem,Moto Horas/dia,Moto Dias/sem,Camioneta Horas/dia,Camioneta Dias/sem,Avion Horas/mes,Lancha Horas/mes,Transporte Limpio Dias/sem,Total Emisiones kg CO2/mes,Clasificacion Semaforo,Arboles Necesarios,Desglose Carro,Desglose Bus,Desglose Moto,Desglose Camioneta,Desglose Avion,Desglose Lancha,Ubicacion,Ahorro con EV kg CO2/mes\n';

    // Full CSV content with BOM for Excel UTF-8 support
    const csvContent = "\uFEFF" + headers + storedData;

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "User_Data_Electric_Calculator.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
