// Wurks Auto Sales inventory data.
// Add images by placing files in an "images" folder and setting image / gallery paths below.
const vehicles = window.WURKS_INVENTORY || [];

const moneyFormatter = new Intl.NumberFormat('en-US');
function formatMiles(miles) { return `${moneyFormatter.format(miles)} miles`; }
function vehicleName(v) { return `${v.year} ${v.make} ${v.model}`; }

function vehicleImages(vehicle) {
  if (Array.isArray(vehicle.images) && vehicle.images.length) {
    return vehicle.images.filter(Boolean);
  }
  return [vehicle.image, ...(vehicle.gallery || [])].filter(Boolean);
}

const template = document.querySelector('#vehicle-template');

function buildVehicleCard(vehicle, cardContext = 'inventory') {
  const card = template.content.cloneNode(true);
  const article = card.querySelector('.vehicle-card');
  const photo = card.querySelector('.vehicle-photo');
  const status = card.querySelector('.status');
  const images = vehicleImages(vehicle);

  status.textContent = vehicle.status;
  status.classList.toggle('example-status', vehicle.status.toLowerCase().includes('example'));
  const normalizedStatus = String(vehicle.status || '').trim().toLowerCase();
  status.classList.toggle('sold-status', normalizedStatus === 'sold');
  status.setAttribute('data-status', normalizedStatus);
  card.querySelector('.vehicle-kicker').textContent = `${vehicle.year} ${vehicle.make}`;
  card.querySelector('.vehicle-name').textContent = `${vehicle.model} ${vehicle.trim}`;
  card.querySelector('.vehicle-price').textContent = vehicle.price;
  card.querySelector('.vehicle-desc').textContent = vehicle.description;

  if (cardContext === 'featured') {
    const badge = document.createElement('span');
    badge.className = 'featured-badge';
    badge.textContent = 'Wurks Highlight';
    photo.appendChild(badge);
  }

  if (images.length) {
    photo.classList.add('has-image');
    photo.style.backgroundImage = `url("${images[0]}")`;
    photo.querySelector('.photo-placeholder')?.remove();

    // Keep featured/homepage cards intentionally simple. Inventory cards get browsing controls.
    if (cardContext === 'inventory') {
      const count = document.createElement('span');
      count.className = 'photo-count';
      count.innerHTML = `<span aria-hidden="true">▣</span> ${images.length}`;
      count.setAttribute('aria-label', `${images.length} photos`);
      photo.appendChild(count);

      if (images.length > 1) {
        let currentImage = 0;
        const previous = document.createElement('button');
        const next = document.createElement('button');
        previous.type = 'button';
        next.type = 'button';
        previous.className = 'card-photo-arrow card-photo-prev';
        next.className = 'card-photo-arrow card-photo-next';
        previous.setAttribute('aria-label', `Previous photo of ${vehicleName(vehicle)}`);
        next.setAttribute('aria-label', `Next photo of ${vehicleName(vehicle)}`);
        previous.textContent = '‹';
        next.textContent = '›';

        const showImage = index => {
          currentImage = (index + images.length) % images.length;
          photo.style.backgroundImage = `url("${images[currentImage]}")`;
        };
        previous.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          showImage(currentImage - 1);
        });
        next.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          showImage(currentImage + 1);
        });
        photo.append(previous, next);
      }
    }
  } else {
    photo.querySelector('.photo-placeholder').innerHTML = `<span>${vehicle.year}</span><strong>${vehicle.make}</strong><small>Photo coming soon</small>`;
  }

  const specs = card.querySelector('.specs');
  [formatMiles(vehicle.miles), vehicle.title, vehicle.drivetrain].forEach(text => {
    const span = document.createElement('span');
    span.textContent = text;
    specs.appendChild(span);
  });

  const details = card.querySelector('.details-button');
  details.href = `vehicle.html?id=${encodeURIComponent(vehicle.id)}`;
  article.setAttribute('data-make', vehicle.make);
  return card;
}

function renderVehicles(target, vehicleList, cardContext = 'inventory') {
  target.innerHTML = '';
  vehicleList.forEach(vehicle => target.appendChild(buildVehicleCard(vehicle, cardContext)));
}

const featuredGrid = document.querySelector('#featured-grid');
if (featuredGrid) {
  renderVehicles(featuredGrid, vehicles.filter(v => v.featured).slice(0, 4), 'featured');
}

const inventoryGrid = document.querySelector('#inventory-grid');
const makeFilter = document.querySelector('#make-filter');
const inventorySearch = document.querySelector('#inventory-search');
const inventoryCount = document.querySelector('#inventory-count');
const noResults = document.querySelector('#no-results');
const clearFilters = document.querySelector('#clear-filters');

if (inventoryGrid && makeFilter) {
  const makes = [...new Set(vehicles.map(v => v.make))].sort();
  makes.forEach(make => {
    const option = document.createElement('option');
    option.value = make;
    option.textContent = make;
    makeFilter.appendChild(option);
  });

  function applyFilters() {
    const selectedMake = makeFilter.value;
    const query = inventorySearch.value.trim().toLowerCase();
    const filtered = vehicles.filter(v => {
      const makeMatches = selectedMake === 'all' || v.make === selectedMake;
      const searchable = `${v.year} ${v.make} ${v.model} ${v.trim} ${v.drivetrain} ${formatMiles(v.miles)} ${v.title}`.toLowerCase();
      return makeMatches && (!query || searchable.includes(query));
    });

    renderVehicles(inventoryGrid, filtered);
    inventoryCount.textContent = filtered.length;
    noResults.hidden = filtered.length !== 0;
    inventoryGrid.hidden = filtered.length === 0;
  }

  makeFilter.addEventListener('change', applyFilters);
  inventorySearch.addEventListener('input', applyFilters);
  clearFilters?.addEventListener('click', () => {
    makeFilter.value = 'all';
    inventorySearch.value = '';
    applyFilters();
  });
  applyFilters();
}

// Dedicated vehicle details page.
const detailRoot = document.querySelector('#vehicle-detail');
if (detailRoot) {
  const params = new URLSearchParams(window.location.search);
  const vehicle = vehicles.find(v => v.id === params.get('id'));

  if (!vehicle) {
    detailRoot.innerHTML = `<div class="detail-not-found"><p class="eyebrow">Vehicle not found</p><h1>This listing is no longer available.</h1><a class="button primary" href="inventory.html">Back to Inventory</a></div>`;
  } else {
    document.title = `${vehicleName(vehicle)} | Wurks Auto Sales`;
    document.querySelector('#detail-kicker').textContent = `${vehicle.year} ${vehicle.make}`;
    const detailStatusBanner = document.querySelector('#detail-status-banner');
    if (detailStatusBanner) {
      const isSold = String(vehicle.status || '').trim().toLowerCase() === 'sold';
      detailStatusBanner.textContent = isSold ? 'SOLD' : '';
      detailStatusBanner.hidden = !isSold;
    }
    document.querySelector('#detail-name').textContent = `${vehicle.model} ${vehicle.trim}`;
    document.querySelector('#detail-price').textContent = vehicle.price;
    document.querySelector('#detail-description').textContent = vehicle.description;
    document.querySelector('#detail-note').textContent = vehicle.note;
    document.querySelector('#detail-miles').textContent = formatMiles(vehicle.miles);
    document.querySelector('#detail-title').textContent = vehicle.title;
    document.querySelector('#detail-drive').textContent = vehicle.drivetrain;
    document.querySelector('#detail-contact').href = `index.html#contact`;

    const mainPhoto = document.querySelector('#detail-main-photo');
    const thumbnails = document.querySelector('#detail-thumbnails');
    const images = vehicleImages(vehicle);

    if (images.length) {
      mainPhoto.classList.add('has-image');
      let currentDetailImage = 0;
      const prevDetail = document.querySelector('#detail-photo-prev');
      const nextDetail = document.querySelector('#detail-photo-next');

      const showDetailImage = index => {
        currentDetailImage = (index + images.length) % images.length;
        mainPhoto.style.backgroundImage = `url("${images[currentDetailImage]}")`;
        thumbnails.querySelectorAll('.thumb').forEach((thumb, i) => thumb.classList.toggle('active', i === currentDetailImage));
      };

      images.forEach((src, i) => {
        const button = document.createElement('button');
        button.className = `thumb${i === 0 ? ' active' : ''}`;
        button.style.backgroundImage = `url("${src}")`;
        button.setAttribute('aria-label', `View photo ${i + 1}`);
        button.addEventListener('click', () => showDetailImage(i));
        thumbnails.appendChild(button);
      });

      showDetailImage(0);
      if (images.length > 1) {
        prevDetail?.addEventListener('click', () => showDetailImage(currentDetailImage - 1));
        nextDetail?.addEventListener('click', () => showDetailImage(currentDetailImage + 1));
      } else {
        prevDetail?.remove();
        nextDetail?.remove();
      }
    } else {
      document.querySelector('#detail-photo-prev')?.remove();
      document.querySelector('#detail-photo-next')?.remove();
      mainPhoto.innerHTML = `<div class="detail-placeholder"><span>${vehicle.year}</span><strong>${vehicle.make}</strong><small>Vehicle photos can be added here</small></div>`;
      thumbnails.hidden = true;
    }
  }
}

const menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
  menuToggle.addEventListener('click', event => {
    const nav = document.querySelector('#nav');
    nav.classList.toggle('open');
    event.currentTarget.setAttribute('aria-expanded', nav.classList.contains('open'));
  });
}
document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => document.querySelector('#nav')?.classList.remove('open')));
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();


// Contact form comment counter.
const contactComments = document.querySelector('#contact-comments');
const commentCount = document.querySelector('#comment-count');
if (contactComments && commentCount) {
  const updateCommentCount = () => { commentCount.textContent = String(contactComments.value.length); };
  contactComments.addEventListener('input', updateCommentCount);
  updateCommentCount();
}

// v5.6 Contact form AJAX submission with button confirmation.
const wurksContactForm = document.querySelector('#contact-form');

if (wurksContactForm) {
  wurksContactForm.addEventListener('submit', async event => {
    event.preventDefault();

    if (!wurksContactForm.reportValidity()) return;

    const submitButton = wurksContactForm.querySelector('button[type="submit"]');
    const defaultLabel = 'Send';

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.remove('sent-success', 'send-error');
      submitButton.textContent = 'Sending...';
    }

    const formData = new FormData(wurksContactForm);
    const payload = {};
    formData.forEach((value, key) => {
      if (key !== '_honey') payload[key] = value;
    });

    try {
      const response = await fetch('https://formsubmit.co/ajax/adolfowurksauto@outlook.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Submission failed');
      }

      wurksContactForm.reset();
      const count = document.querySelector('#comment-count');
      if (count) count.textContent = '0';

      if (submitButton) {
        submitButton.textContent = "Message Sent — We'll Reach Out Soon";
        submitButton.classList.add('sent-success');

        setTimeout(() => {
          submitButton.textContent = defaultLabel;
          submitButton.classList.remove('sent-success');
          submitButton.disabled = false;
        }, 7000);
      }
    } catch (error) {
      if (submitButton) {
        submitButton.textContent = 'Message Not Sent — Try Again';
        submitButton.classList.add('send-error');
        submitButton.disabled = false;

        setTimeout(() => {
          submitButton.textContent = defaultLabel;
          submitButton.classList.remove('send-error');
        }, 5000);
      }
    }
  });
}
