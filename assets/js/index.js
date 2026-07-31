document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.app-section');

    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();

            const targetSectionId = link.getAttribute('data-section');

            sections.forEach(section => {
                if (section.id === targetSectionId || section.getAttribute('data-section') === targetSectionId) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });

            navLinks.forEach(nav => {
                nav.classList.remove('bg-blue-500/10', 'text-blue-400');
                nav.classList.add('text-slate-300', 'hover:bg-slate-800');
            });

            link.classList.remove('text-slate-300', 'hover:bg-slate-800');
            link.classList.add('bg-blue-500/10', 'text-blue-400');
        });
    });

    setupDatePicker();
    getTodayInSpace();
    getUpcomingLaunches();
    getPlanetsData();
});

const NASA_API_KEY = 'JLLY7GpzypLAbt045Q7WNszxFcwFKomhOKNIc4xd';
const NASA_BASE_URL = 'https://api.nasa.gov/planetary/apod';
const SPACEDEVS_BASE_URL = 'https://lldev.thespacedevs.com/2.3.0/launches/upcoming/?limit=10&format=json';
const PLANETS_API_URL = 'https://solar-system-opendata-proxy.vercel.app/api/planets';

let planetsData = [];
let selectedPlanetId = 'uranus';

const planetOrder = [
    'uranus',
    'neptune',
    'jupiter',
    'mars',
    'mercury',
    'saturn',
    'earth',
    'venus'
];

const planetColors = {
    mercury: '#64748b',
    venus: '#fb923c',
    earth: '#3b82f6',
    mars: '#ef4444',
    jupiter: '#fdba74',
    saturn: '#fde047',
    uranus: '#22d3ee',
    neptune: '#2563eb'
};

const planetDescriptions = {
    mercury: "Mercury is the smallest planet in the Solar System and the closest to the Sun. Its orbit around the Sun takes 87.97 Earth days, the shortest of all the planets in the Solar System.",
    venus: "Venus is the second planet from the Sun. It is named after the Roman goddess of love and beauty. As the second-brightest natural object in the night sky after the Moon, Venus can cast shadows.",
    earth: "Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 29% of Earth's surface is land consisting of continents and islands. The remaining 71% is covered with water.",
    mars: 'Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System. Named after the Roman god of war, it is often referred to as the "Red Planet" due to its reddish appearance.',
    jupiter: "Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets combined.",
    saturn: "Saturn is the sixth planet from the Sun and the second-largest in the Solar System. It is a gas giant with an average radius about nine times that of Earth, and is best known for its extensive ring system.",
    uranus: "Uranus is the seventh planet from the Sun. It has the third-largest planetary radius and fourth-largest planetary mass in the Solar System. Uranus is unique in that it rotates on its side.",
    neptune: "Neptune is the eighth and farthest known planet from the Sun in the Solar System. It is the fourth-largest planet by diameter and the third-most-massive planet."
};

const modernPlanetData = {
    jupiter: { moons: 115 },
    saturn: { moons: 293 },
    uranus: { moons: 29 },
    neptune: { moons: 16 }
};

function setupDatePicker() {
    const dateInput = document.getElementById('apod-date-input');
    const loadBtn = document.getElementById('load-date-btn');
    const todayBtn = document.getElementById('today-apod-btn');

    const today = new Date().toISOString().split('T')[0];

    dateInput.max = today;
    dateInput.value = today;

    loadBtn.addEventListener('click', () => {
        const selectedDate = dateInput.value;

        if (selectedDate) {
            getTodayInSpace(selectedDate);
        }
    });

    todayBtn.addEventListener('click', () => {
        dateInput.value = today;
        getTodayInSpace();
    });
}

function formatInputDate(dateText) {
    const dateObj = new Date(dateText);

    return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function showApodError(message) {
    const imageContainer = document.getElementById('apod-image-container');

    document.getElementById('apod-title').textContent = 'No data available';
    document.getElementById('apod-date').textContent = 'Astronomy Picture of the Day';
    document.getElementById('apod-explanation').textContent = message;
    document.getElementById('apod-date-detail').innerHTML = '<i class="far fa-calendar mr-2"></i>No date';
    document.getElementById('apod-date-info').textContent = 'No date';
    document.getElementById('apod-media-type').textContent = 'Unknown';
    document.getElementById('apod-copyright').innerHTML = '&copy; NASA';

    if (imageContainer) {
        imageContainer.innerHTML =
            '<div class="text-center"><i class="fas fa-rocket text-6xl text-slate-600 mb-4"></i><p class="text-slate-400">No image available</p></div>';
    }
}

async function getTodayInSpace(date = '') {
    const imageContainer = document.getElementById('apod-image-container');
    const datePickerSpan = document.querySelector('.date-input-wrapper span');

    if (imageContainer) {
        imageContainer.innerHTML =
            '<div class="text-center"><i class="fas fa-spinner fa-spin text-4xl text-blue-400 mb-4"></i><p class="text-slate-400">Loading image...</p></div>';
    }

    try {
        let fetchUrl = `${NASA_BASE_URL}?api_key=${NASA_API_KEY}`;

        if (date !== '') {
            fetchUrl += `&date=${date}`;
        }

        const response = await fetch(fetchUrl);
        const data = await response.json();

        if (data.title === undefined || data.url === undefined) {
            if (data.msg !== undefined) {
                showApodError(data.msg);
            } else if (data.error !== undefined) {
                showApodError(data.error.message);
            } else {
                showApodError('NASA APOD data is not available.');
            }

            return;
        }

        document.getElementById('apod-title').textContent = data.title;
        document.getElementById('apod-date').textContent = `Astronomy Picture of the Day - ${data.date}`;
        document.getElementById('apod-explanation').textContent = data.explanation;
        document.getElementById('apod-date-detail').innerHTML = `<i class="far fa-calendar mr-2"></i>${data.date}`;
        document.getElementById('apod-date-info').textContent = data.date;
        document.getElementById('apod-media-type').textContent = data.media_type;
        document.getElementById('apod-date-input').value = data.date;

        if (datePickerSpan) {
            datePickerSpan.textContent = formatInputDate(data.date);
        }

        const copyrightElement = document.getElementById('apod-copyright');

        if (data.copyright) {
            copyrightElement.innerHTML = `&copy; ${data.copyright}`;
        } else {
            copyrightElement.innerHTML = '&copy; NASA';
        }

        if (imageContainer) {
            if (data.media_type === 'image') {
                imageContainer.innerHTML =
                    `<img id="apod-image" class="w-full h-full object-cover" src="${data.url}" alt="${data.title}">`;
            } else if (data.media_type === 'video') {
                imageContainer.innerHTML =
                    `<iframe class="w-full h-full" src="${data.url}" allowfullscreen></iframe>`;
            } else {
                showApodError('NASA APOD media is not available.');
            }
        }
    } catch (error) {
        console.error('Error fetching APOD:', error);
        showApodError('Failed to load space data.');
    }
}

function getLaunchImage(launch) {
    if (launch.image === null || launch.image === undefined || launch.image === '') {
        return './assets/images/launch-placeholder.png';
    }

    if (typeof launch.image === 'string') {
        return launch.image;
    }

    if (launch.image.image_url !== null && launch.image.image_url !== undefined) {
        return launch.image.image_url;
    }

    return './assets/images/launch-placeholder.png';
}

function getLaunchStatus(launch) {
    if (launch.status !== null && launch.status !== undefined) {
        if (launch.status.abbrev !== null && launch.status.abbrev !== undefined) {
            return launch.status.abbrev;
        }

        if (launch.status.name !== null && launch.status.name !== undefined) {
            return launch.status.name;
        }
    }

    return 'TBD';
}

function getLaunchProvider(launch) {
    if (launch.launch_service_provider !== null && launch.launch_service_provider !== undefined) {
        return launch.launch_service_provider.name;
    }

    return 'Unknown';
}

function getLaunchRocket(launch) {
    if (launch.rocket !== null && launch.rocket !== undefined) {
        if (launch.rocket.configuration !== null && launch.rocket.configuration !== undefined) {
            return launch.rocket.configuration.name;
        }
    }

    return 'Unknown';
}

function getLaunchLocation(launch) {
    if (launch.pad !== null && launch.pad !== undefined) {
        if (launch.pad.location !== null && launch.pad.location !== undefined) {
            if (launch.pad.location.name !== null && launch.pad.location.name !== undefined) {
                return launch.pad.location.name;
            }
        }

        if (launch.pad.name !== null && launch.pad.name !== undefined) {
            return launch.pad.name;
        }
    }

    return 'Unknown';
}

function getLaunchCountry(launch) {
    if (launch.pad !== null && launch.pad !== undefined) {
        if (launch.pad.location !== null && launch.pad.location !== undefined) {
            if (launch.pad.location.country !== null && launch.pad.location.country !== undefined) {
                if (launch.pad.location.country.name !== undefined) {
                    return launch.pad.location.country.name;
                }

                return launch.pad.location.country;
            }

            if (launch.pad.location.country_code !== null && launch.pad.location.country_code !== undefined) {
                return launch.pad.location.country_code;
            }
        }
    }

    return 'Unknown';
}

function getLaunchDescription(launch) {
    if (launch.mission !== null && launch.mission !== undefined) {
        if (launch.mission.description !== null && launch.mission.description !== undefined) {
            return launch.mission.description;
        }
    }

    return 'No mission description available.';
}

function getShortLaunchDate(dateText) {
    if (dateText === null || dateText === undefined) {
        return 'TBD';
    }

    return new Date(dateText).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function getLongLaunchDate(dateText) {
    if (dateText === null || dateText === undefined) {
        return 'TBD';
    }

    return new Date(dateText).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
    });
}

function getLaunchTime(dateText) {
    if (dateText === null || dateText === undefined) {
        return 'TBD';
    }

    return new Date(dateText).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
    }) + ' UTC';
}

function updateFeaturedLaunch(launch) {
    const featuredContainer = document.getElementById('featured-launch');

    if (!featuredContainer) {
        return;
    }

    const launchImage = getLaunchImage(launch);
    const statusAbbrev = getLaunchStatus(launch);
    const providerName = getLaunchProvider(launch);
    const rocketName = getLaunchRocket(launch);
    const locationName = getLaunchLocation(launch);
    const countryName = getLaunchCountry(launch);
    const description = getLaunchDescription(launch);
    const launchDate = getLongLaunchDate(launch.net);
    const launchTime = getLaunchTime(launch.net);

    featuredContainer.innerHTML = `
    <div class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">
      <div class="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
        <div class="flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-6 mb-6">
              <span class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2">
                <i class="fas fa-star"></i> Featured Launch
              </span>
              <span class="text-green-400 text-sm font-semibold">${statusAbbrev}</span>
            </div>

            <h3 class="text-3xl font-bold mb-3 leading-tight">${launch.name}</h3>

            <div class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400">
              <div class="flex items-center gap-2">
                <i class="fas fa-building"></i>
                <span>${providerName}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fas fa-rocket"></i>
                <span>${rocketName}</span>
              </div>
            </div>

            <div class="grid xl:grid-cols-2 gap-4 mb-6">
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-calendar"></i> Launch Date</p>
                <p class="font-semibold">${launchDate}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-clock"></i> Launch Time</p>
                <p class="font-semibold">${launchTime}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-map-marker-alt"></i> Location</p>
                <p class="font-semibold text-sm line-clamp-1">${locationName}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p class="text-xs text-slate-400 mb-1 flex items-center gap-2"><i class="fas fa-globe"></i> Country</p>
                <p class="font-semibold line-clamp-1">${countryName}</p>
              </div>
            </div>

            <p class="text-slate-300 leading-relaxed mb-6">${description}</p>
          </div>

          <div class="flex flex-col md:flex-row gap-3">
            <button class="flex-1 self-start md:self-center px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2">
              <i class="fas fa-info-circle"></i> View Full Details
            </button>
            <button class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
              <i class="far fa-heart"></i>
            </button>
            <button class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
              <i class="fas fa-bell"></i>
            </button>
          </div>
        </div>

        <div class="relative">
          <div class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50">
            <img src="${launchImage}" alt="${launch.name}" class="absolute inset-0 w-full h-full object-cover" onerror="this.onerror=null;this.src='./assets/images/launch-placeholder.png';">
            <div class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function getUpcomingLaunches() {
    try {
        const response = await fetch(SPACEDEVS_BASE_URL);
        const data = await response.json();

        if (data.results === undefined) {
            throw new Error('Invalid launches data.');
        }

        const launches = data.results.slice(0, 10);
        const launchesGrid = document.getElementById('launches-grid');
        const launchesCount = document.getElementById('launches-count');
        const launchesCountMobile = document.getElementById('launches-count-mobile');

        launchesGrid.innerHTML = '';

        if (launchesCount) {
            launchesCount.textContent = launches.length + ' Launches';
        }

        if (launchesCountMobile) {
            launchesCountMobile.textContent = launches.length;
        }

        if (launches.length > 0) {
            updateFeaturedLaunch(launches[0]);
        }

        for (let i = 1; i < launches.length; i++) {
            const launch = launches[i];
            const card = document.createElement('div');

            const launchImage = getLaunchImage(launch);
            const launchDate = getShortLaunchDate(launch.net);
            const launchTime = getLaunchTime(launch.net);
            const statusAbbrev = getLaunchStatus(launch);
            const providerName = getLaunchProvider(launch);
            const rocketName = getLaunchRocket(launch);
            const locationName = getLaunchLocation(launch);

            card.className = 'bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer';

            card.innerHTML = `
        <div class="relative h-48 bg-slate-900/50 flex items-center justify-center overflow-hidden">
          <img src="${launchImage}" alt="${launch.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.onerror=null;this.src='./assets/images/launch-placeholder.png';">
          <div class="absolute top-3 right-3">
            <span class="px-3 py-1 text-white backdrop-blur-sm rounded-full text-xs font-semibold">
              ${statusAbbrev}
            </span>
          </div>
        </div>

        <div class="p-5">
          <div class="mb-3">
            <h4 class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">${launch.name}</h4>
            <p class="text-sm text-slate-400 flex items-center gap-2">
              <i class="fas fa-building text-xs"></i>
              ${providerName}
            </p>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2 text-sm">
              <i class="fas fa-calendar text-slate-500 w-4"></i>
              <span class="text-slate-300">${launchDate}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <i class="fas fa-clock text-slate-500 w-4"></i>
              <span class="text-slate-300">${launchTime}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <i class="fas fa-rocket text-slate-500 w-4"></i>
              <span class="text-slate-300 line-clamp-1">${rocketName}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <i class="fas fa-map-marker-alt text-slate-500 w-4"></i>
              <span class="text-slate-300 line-clamp-1">${locationName}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-4 border-t border-slate-700">
            <button class="flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm font-semibold">Details</button>
            <button class="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
              <i class="far fa-heart"></i>
            </button>
          </div>
        </div>
      `;

            card.addEventListener('click', () => {
                updateFeaturedLaunch(launch);
                document.getElementById('launches').scrollIntoView({ behavior: 'smooth' });
            });

            launchesGrid.appendChild(card);
        }
    } catch (error) {
        console.error('Error fetching launches:', error);

        document.getElementById('launches-grid').innerHTML =
            '<div class="col-span-full text-center py-12"><i class="fas fa-triangle-exclamation text-4xl text-red-400 mb-4"></i><p class="text-slate-400">Failed to load launches</p></div>';
    }
}

async function getPlanetsData() {
    try {
        const response = await fetch(PLANETS_API_URL);
        const data = await response.json();

        let planets = data;

        if (data.bodies !== undefined) {
            planets = data.bodies;
        } else if (data.results !== undefined) {
            planets = data.results;
        } else if (data.data !== undefined) {
            planets = data.data;
        }

        if (!Array.isArray(planets)) {
            throw new Error('Invalid planets data.');
        }

        planetsData = getOrderedPlanets(planets);

        setupPlanetCards(planetsData);
        populatePlanetsTable(planetsData);
        selectPlanet('uranus');
    } catch (error) {
        console.error('Error fetching planets:', error);

        const planetsGrid = document.getElementById('planets-grid');

        if (planetsGrid) {
            planetsGrid.innerHTML =
                '<div class="col-span-full text-center py-12"><i class="fas fa-triangle-exclamation text-4xl text-red-400 mb-4"></i><p class="text-slate-400">Failed to load planets</p></div>';
        }
    }
}

function getOrderedPlanets(planets) {
    const result = [];

    planetOrder.forEach(planetId => {
        const planet = planets.find(item => item.englishName.toLowerCase() === planetId);

        if (planet) {
            result.push(planet);
        }
    });

    return result;
}

function setupPlanetCards(planets) {
    const planetsGrid = document.getElementById('planets-grid');

    if (!planetsGrid) {
        return;
    }

    planetsGrid.innerHTML = '';

    planets.forEach(planet => {
        const planetId = planet.englishName.toLowerCase();
        const card = document.createElement('div');

        card.className = 'planet-card bg-slate-800/50 border rounded-2xl p-4 transition-all cursor-pointer group';
        card.setAttribute('data-planet-id', planetId);
        card.style.borderColor = planetId === selectedPlanetId ? planetColors[planetId] : '#334155';

        card.innerHTML = `
      <div class="relative mb-3 h-24 flex items-center justify-center">
        <img class="w-20 h-20 object-contain group-hover:scale-110 transition-transform" src="./assets/images/${planetId}.png" alt="${planet.englishName}">
      </div>
      <h4 class="font-semibold text-center text-sm">${planet.englishName}</h4>
      <p class="text-xs text-slate-400 text-center">${getDistanceAu(planet)} AU</p>
    `;

        card.addEventListener('click', () => {
            selectPlanet(planetId);
        });

        card.addEventListener('mouseover', () => {
            card.style.borderColor = planetColors[planetId];
        });

        card.addEventListener('mouseout', () => {
            if (planetId === selectedPlanetId) {
                card.style.borderColor = planetColors[planetId];
            } else {
                card.style.borderColor = '#334155';
            }
        });

        planetsGrid.appendChild(card);
    });
}

function selectPlanet(planetId) {
    selectedPlanetId = planetId;

    const selectedPlanet = planetsData.find(planet => planet.englishName.toLowerCase() === planetId);

    if (!selectedPlanet) {
        return;
    }

    const cards = document.querySelectorAll('.planet-card');

    cards.forEach(card => {
        const cardPlanetId = card.getAttribute('data-planet-id');

        if (cardPlanetId === planetId) {
            card.style.borderColor = planetColors[planetId];
        } else {
            card.style.borderColor = '#334155';
        }
    });

    displayPlanetDetails(selectedPlanet);
}

function displayPlanetDetails(planet) {
    const planetId = planet.englishName.toLowerCase();

    document.getElementById('planet-detail-name').textContent = planet.englishName;
    document.getElementById('planet-detail-description').textContent = planetDescriptions[planetId];

    const imageEl = document.getElementById('planet-detail-image');

    if (imageEl) {
        imageEl.src = `./assets/images/${planetId}.png`;
        imageEl.alt = planet.englishName;
    }

    document.getElementById('planet-distance').textContent = getMillionKm(planet.semimajorAxis);
    document.getElementById('planet-radius').textContent = Math.round(planet.meanRadius) + ' km';
    document.getElementById('planet-mass').textContent = getMassText(planet);
    document.getElementById('planet-density').textContent = getValue(planet.density) + ' g/cm³';
    document.getElementById('planet-orbital-period').textContent = getOrbitalPeriodDaysText(planet.sideralOrbit);
    document.getElementById('planet-rotation').textContent = getValue(planet.sideralRotation) + ' hours';
    document.getElementById('planet-moons').textContent = getMoonsCount(planet);
    document.getElementById('planet-gravity').textContent = getValue(planet.gravity) + ' m/s²';

    document.getElementById('planet-discoverer').textContent = getDiscoverer(planet);
    document.getElementById('planet-discovery-date').textContent = getDiscoveryDate(planet);
    document.getElementById('planet-body-type').textContent = planet.bodyType || 'Planet';
    document.getElementById('planet-volume').textContent = getVolumeText(planet);

    document.getElementById('planet-perihelion').textContent = getMillionKm(planet.perihelion);
    document.getElementById('planet-aphelion').textContent = getMillionKm(planet.aphelion);
    document.getElementById('planet-eccentricity').textContent = getValue(planet.eccentricity);
    document.getElementById('planet-inclination').textContent = getValue(planet.inclination) + '°';
    document.getElementById('planet-axial-tilt').textContent = getValue(planet.axialTilt) + '°';
    document.getElementById('planet-temp').textContent = getTemperatureText(planet.avgTemp);
    document.getElementById('planet-escape').textContent = getEscapeText(planet.escape);

    displayPlanetFacts(planet);
}

function displayPlanetFacts(planet) {
    const planetFacts = document.getElementById('planet-facts');

    if (!planetFacts) {
        return;
    }

    planetFacts.innerHTML = `
    <li class="flex items-start">
      <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
      <span class="text-slate-300">Mass: ${getMassText(planet)}</span>
    </li>
    <li class="flex items-start">
      <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
      <span class="text-slate-300">Surface gravity: ${getValue(planet.gravity)} m/s²</span>
    </li>
    <li class="flex items-start">
      <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
      <span class="text-slate-300">Density: ${getValue(planet.density)} g/cm³</span>
    </li>
    <li class="flex items-start">
      <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
      <span class="text-slate-300">Axial tilt: ${getValue(planet.axialTilt)}°</span>
    </li>
  `;
}

function populatePlanetsTable(planets) {
    const tbody = document.getElementById('planet-comparison-tbody');

    if (!tbody) {
        return;
    }

    tbody.innerHTML = '';

    planets.forEach(planet => {
        const planetId = planet.englishName.toLowerCase();
        const planetType = getPlanetType(planetId);
        const planetTypeColor = getPlanetTypeColor(planetType);

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-800/30 transition-colors';

        tr.innerHTML = `
      <td class="px-4 md:px-6 py-3 md:py-4 sticky left-0 bg-slate-800 z-10">
        <div class="flex items-center space-x-2 md:space-x-3">
          <div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0" style="background-color:${planetColors[planetId]}"></div>
          <span class="font-semibold text-sm md:text-base whitespace-nowrap">${planet.englishName}</span>
        </div>
      </td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${getDistanceAu(planet)}</td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${formatNumber(planet.meanRadius * 2)}</td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${getMassComparedToEarth(planet)}</td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${getOrbitalPeriodText(planet.sideralOrbit)}</td>
      <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${getMoonsCount(planet)}</td>
      <td class="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
        <span class="px-2 py-1 rounded text-xs" style="background-color:${planetTypeColor.background}; color:${planetTypeColor.color}">
          ${planetType}
        </span>
      </td>
    `;

        tbody.appendChild(tr);
    });
}

function getDistanceAu(planet) {
    const au = planet.semimajorAxis / 149597870.7;

    return au.toFixed(2);
}

function getMillionKm(value) {
    if (value === null || value === undefined) {
        return 'N/A';
    }

    return (value / 1000000).toFixed(1) + 'M km';
}

function getMassText(planet) {
    if (planet.mass === null || planet.mass === undefined) {
        return 'N/A';
    }

    return planet.mass.massValue + ' × 10^' + planet.mass.massExponent + ' kg';
}

function getVolumeText(planet) {
    if (planet.vol === null || planet.vol === undefined) {
        return 'N/A';
    }

    return planet.vol.volValue + ' × 10^' + planet.vol.volExponent + ' km³';
}

function getMassNumber(planet) {
    if (planet.mass === null || planet.mass === undefined) {
        return 0;
    }

    return planet.mass.massValue * Math.pow(10, planet.mass.massExponent);
}

function getMassComparedToEarth(planet) {
    const earthMass = 5.97237 * Math.pow(10, 24);
    const mass = getMassNumber(planet);

    if (mass === 0) {
        return 'N/A';
    }

    return (mass / earthMass).toFixed(3);
}

function getMoonsCount(planet) {
    const planetId = planet.englishName.toLowerCase();

    if (modernPlanetData[planetId] !== undefined) {
        return modernPlanetData[planetId].moons;
    }

    if (planet.moons === null || planet.moons === undefined) {
        return 0;
    }

    return planet.moons.length;
}

function getDiscoverer(planet) {
    if (planet.discoveredBy === null || planet.discoveredBy === undefined || planet.discoveredBy === '') {
        return 'Known since antiquity';
    }

    return planet.discoveredBy;
}

function getDiscoveryDate(planet) {
    if (planet.discoveryDate === null || planet.discoveryDate === undefined || planet.discoveryDate === '') {
        return 'Ancient';
    }

    return planet.discoveryDate;
}

function getTemperatureText(value) {
    if (value === null || value === undefined) {
        return 'N/A';
    }

    return Math.round(value) + '°C';
}

function getEscapeText(value) {
    if (value === null || value === undefined) {
        return 'N/A';
    }

    return (value / 1000).toFixed(2) + ' km/s';
}

function getOrbitalPeriodText(value) {
    if (value === null || value === undefined) {
        return 'N/A';
    }

    if (value >= 365) {
        return (value / 365.25).toFixed(1) + ' years';
    }

    return Math.round(value) + ' days';
}

function getOrbitalPeriodDaysText(value) {
    if (value === null || value === undefined) {
        return 'N/A';
    }

    return Number(value).toFixed(2) + ' days';
}

function getValue(value) {
    if (value === null || value === undefined) {
        return 'N/A';
    }

    return value;
}

function formatNumber(value) {
    if (value === null || value === undefined) {
        return 'N/A';
    }

    return Math.round(value).toLocaleString('en-US');
}

function getPlanetType(planetId) {
    if (planetId === 'jupiter' || planetId === 'saturn') {
        return 'Gas Giant';
    } else if (planetId === 'uranus' || planetId === 'neptune') {
        return 'Ice Giant';
    } else {
        return 'Terrestrial';
    }
}

function getPlanetTypeColor(planetType) {
    if (planetType === 'Gas Giant') {
        return {
            background: '#6d28d9',
            color: '#d8b4fe'
        };
    } else if (planetType === 'Ice Giant') {
        return {
            background: '#2563eb',
            color: '#bfdbfe'
        };
    } else {
        return {
            background: '#9a3412',
            color: '#fdba74'
        };
    }
}