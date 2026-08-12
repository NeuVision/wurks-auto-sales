// Set featured: true on the 3 or 4 vehicles you want shown on the homepage.
// All vehicles stay visible on inventory.html unless you remove them from this list.
const vehicles = [
  {
    year: 2020,
    make: 'Subaru',
    model: 'Forester',
    trim: 'Base',
    miles: '118,600 miles',
    title: 'Clean title',
    drivetrain: 'AWD',
    price: '$14,995 OTD',
    status: 'Available',
    featured: true,
    description: 'Practical, comfortable, and built for Northern Nevada weather. Subaru symmetrical AWD, roomy interior, and excellent everyday usability.',
    note: 'Overall in great condition. Center armrest shows wear. Mileage may change from normal driving.'
  },
  {
    year: 2019,
    make: 'Subaru',
    model: 'Forester',
    trim: 'Sport',
    miles: '90,000 miles',
    title: 'Clean title',
    drivetrain: 'AWD',
    price: 'Contact for price',
    status: 'Available',
    featured: true,
    description: 'Forester Sport styling with Subaru AWD, useful cargo space, and the confidence that makes these vehicles popular in Northern Nevada.',
    note: 'Clean title and no reported accidents based on current dealership information.'
  },
  {
    year: 2010,
    make: 'Volkswagen',
    model: 'CC',
    trim: '3.6 VR6 4Motion',
    miles: '96,400 miles',
    title: 'Clean title',
    drivetrain: 'AWD',
    price: 'Contact for price',
    status: 'Example listing',
    featured: true,
    description: 'A rare enthusiast-oriented CC with the 3.6-liter VR6 and 4Motion all-wheel drive. Comfortable, distinctive, and more interesting than the average sedan.',
    note: 'Previously described as having no mechanical issues and only minimal cosmetic imperfections. Confirm current availability before publishing.'
  },
  {
    year: 2013,
    make: 'BMW',
    model: 'X5',
    trim: 'xDrive50i',
    miles: '140,014 miles',
    title: 'Clean title',
    drivetrain: 'AWD',
    price: 'Contact for price',
    status: 'Example listing',
    featured: true,
    description: 'Twin-turbo V8 power, a comfortable ride, and classic BMW SUV driving feel. Strong performance with a well-kept interior.',
    note: 'Known smoke-at-idle condition previously disclosed; it goes away during normal driving and the vehicle was reported to pass smog. Sold as-is. Confirm current availability before publishing.'
  }
];

const template = document.querySelector('#vehicle-template');
const dialog = document.querySelector('#vehicle-dialog');

function buildVehicleCard(vehicle) {
  const card = template.content.cloneNode(true);
  card.querySelector('.status').textContent = vehicle.status;
  card.querySelector('.vehicle-kicker').textContent = `${vehicle.year} ${vehicle.make}`;
  card.querySelector('.vehicle-name').textContent = `${vehicle.model} ${vehicle.trim}`;
  card.querySelector('.vehicle-price').textContent = vehicle.price;
  card.querySelector('.vehicle-desc').textContent = vehicle.description;

  const specs = card.querySelector('.specs');
  [vehicle.miles, vehicle.title, vehicle.drivetrain].forEach(text => {
    const span = document.createElement('span');
    span.textContent = text;
    specs.appendChild(span);
  });

  card.querySelector('.details-button').addEventListener('click', () => openVehicle(vehicle));
  return card;
}

function renderVehicles(target, vehicleList) {
  target.innerHTML = '';
  vehicleList.forEach(vehicle => target.appendChild(buildVehicleCard(vehicle)));
}

function openVehicle(vehicle) {
  dialog.querySelector('.dialog-kicker').textContent = `${vehicle.year} ${vehicle.make}`;
  dialog.querySelector('.dialog-name').textContent = `${vehicle.model} ${vehicle.trim} — ${vehicle.price}`;
  dialog.querySelector('.dialog-desc').textContent = vehicle.description;
  dialog.querySelector('.dialog-note').textContent = vehicle.note;
  const specs = dialog.querySelector('.dialog-specs');
  specs.innerHTML = '';
  [vehicle.miles, vehicle.title, vehicle.drivetrain].forEach(text => {
    const span = document.createElement('span');
    span.textContent = text;
    specs.appendChild(span);
  });
  dialog.showModal();
}

const featuredGrid = document.querySelector('#featured-grid');
if (featuredGrid) {
  renderVehicles(featuredGrid, vehicles.filter(vehicle => vehicle.featured).slice(0, 4));
}

const inventoryGrid = document.querySelector('#inventory-grid');
const makeFilter = document.querySelector('#make-filter');
const inventorySearch = document.querySelector('#inventory-search');
const inventoryCount = document.querySelector('#inventory-count');
const noResults = document.querySelector('#no-results');
const clearFilters = document.querySelector('#clear-filters');

if (inventoryGrid && makeFilter) {
  const makes = [...new Set(vehicles.map(vehicle => vehicle.make))].sort();
  makes.forEach(make => {
    const option = document.createElement('option');
    option.value = make;
    option.textContent = make;
    makeFilter.appendChild(option);
  });

  function applyFilters() {
    const selectedMake = makeFilter.value;
    const query = inventorySearch.value.trim().toLowerCase();

    const filtered = vehicles.filter(vehicle => {
      const makeMatches = selectedMake === 'all' || vehicle.make === selectedMake;
      const searchable = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} ${vehicle.drivetrain} ${vehicle.miles}`.toLowerCase();
      const searchMatches = !query || searchable.includes(query);
      return makeMatches && searchMatches;
    });

    renderVehicles(inventoryGrid, filtered);
    inventoryCount.textContent = filtered.length;
    noResults.hidden = filtered.length !== 0;
    inventoryGrid.hidden = filtered.length === 0;
  }

  makeFilter.addEventListener('change', applyFilters);
  inventorySearch.addEventListener('input', applyFilters);
  clearFilters.addEventListener('click', () => {
    makeFilter.value = 'all';
    inventorySearch.value = '';
    applyFilters();
  });

  applyFilters();
}

if (dialog) {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('#dialog-contact').addEventListener('click', () => dialog.close());
}

const menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
  menuToggle.addEventListener('click', event => {
    const nav = document.querySelector('#nav');
    nav.classList.toggle('open');
    event.currentTarget.setAttribute('aria-expanded', nav.classList.contains('open'));
  });
}

document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => {
  document.querySelector('#nav')?.classList.remove('open');
}));

document.querySelector('#year').textContent = new Date().getFullYear();
