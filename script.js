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
    description: 'Twin-turbo V8 power, a comfortable ride, and classic BMW SUV driving feel. Strong performance with a well-kept interior.',
    note: 'Known smoke-at-idle condition previously disclosed; it goes away during normal driving and the vehicle was reported to pass smog. Sold as-is. Confirm current availability before publishing.'
  }
];

const grid = document.querySelector('#inventory-grid');
const template = document.querySelector('#vehicle-template');
const dialog = document.querySelector('#vehicle-dialog');

vehicles.forEach((vehicle, index) => {
  const card = template.content.cloneNode(true);
  card.querySelector('.status').textContent = vehicle.status;
  card.querySelector('.vehicle-kicker').textContent = `${vehicle.year} ${vehicle.make}`;
  card.querySelector('.vehicle-name').textContent = `${vehicle.model} ${vehicle.trim}`;
  card.querySelector('.vehicle-price').textContent = vehicle.price;
  card.querySelector('.vehicle-desc').textContent = vehicle.description;
  const specs = card.querySelector('.specs');
  [vehicle.miles, vehicle.title, vehicle.drivetrain].forEach(text => {
    const span = document.createElement('span'); span.textContent = text; specs.appendChild(span);
  });
  card.querySelector('.details-button').addEventListener('click', () => openVehicle(index));
  grid.appendChild(card);
});

function openVehicle(index) {
  const v = vehicles[index];
  dialog.querySelector('.dialog-kicker').textContent = `${v.year} ${v.make}`;
  dialog.querySelector('.dialog-name').textContent = `${v.model} ${v.trim} — ${v.price}`;
  dialog.querySelector('.dialog-desc').textContent = v.description;
  dialog.querySelector('.dialog-note').textContent = v.note;
  const specs = dialog.querySelector('.dialog-specs'); specs.innerHTML = '';
  [v.miles, v.title, v.drivetrain].forEach(text => { const span = document.createElement('span'); span.textContent = text; specs.appendChild(span); });
  dialog.showModal();
}

dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.querySelector('#dialog-contact').addEventListener('click', () => dialog.close());
document.querySelector('.menu-toggle').addEventListener('click', e => {
  const nav = document.querySelector('#nav'); nav.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', nav.classList.contains('open'));
});
document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => document.querySelector('#nav').classList.remove('open')));
document.querySelector('#year').textContent = new Date().getFullYear();
