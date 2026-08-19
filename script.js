    const iconMarkup = {
      title: '<svg class="icon-document" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2.75h8.3L19 7.45V21.25H6V2.75Z" fill="currentColor"/><path d="M14 2.75v5h5" fill="none" stroke="#111418" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 12h7M9 15h7M9 18h5" fill="none" stroke="#111418" stroke-width="1.35" stroke-linecap="round"/></svg>',
      engine: '<svg class="icon-engine" viewBox="0 0 28 24" aria-hidden="true"><path d="M6.2 7.2h11.4l2.4 2.2h3.1v7.2h-3.2l-2.1 2.3H7.1l-2.2-2.3H1.8V9.4h3l1.4-2.2Z" fill="currentColor"/><rect x="8.2" y="4" width="3" height="3.5" rx=".6" fill="currentColor"/><rect x="13.5" y="4" width="3" height="3.5" rx=".6" fill="currentColor"/><path d="M23.1 10.5h2.8v4.8h-2.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
      transmission: '<svg class="icon-gear" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.2 2h3.6l.7 2.2c.5.2 1 .4 1.5.7l2.1-1 2.5 2.5-1 2.1c.3.5.5 1 .7 1.5l2.2.7v3.6l-2.2.7c-.2.5-.4 1-.7 1.5l1 2.1-2.5 2.5-2.1-1c-.5.3-1 .5-1.5.7l-.7 2.2h-3.6l-.7-2.2c-.5-.2-1-.4-1.5-.7l-2.1 1-2.5-2.5 1-2.1c-.3-.5-.5-1-.7-1.5L1.5 14v-3.6l2.2-.7c.2-.5.4-1 .7-1.5l-1-2.1 2.5-2.5 2.1 1c.5-.3 1-.5 1.5-.7L10.2 2Z" fill="currentColor"/><circle cx="12" cy="12" r="3.2" fill="#111418"/></svg>',
      fuel: '<svg class="icon-fuel" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 2.5h10v19H5v-19Z" fill="currentColor"/><rect x="7.2" y="5" width="5.6" height="5" rx=".5" fill="#111418"/><path d="M15 7.5h2.2l2.3 2.3v7.1c0 .9.5 1.5 1.2 1.5s1.3-.6 1.3-1.5v-5.2l-1.9-1.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><rect x="4" y="21" width="12" height="1.5" rx=".75" fill="currentColor"/></svg>'
    };

    function drivetrainIcon(type) {
      const drive = String(type || '').toUpperCase();
      const frontDriven = drive === 'FWD' || drive === 'AWD';
      const rearDriven = drive === 'RWD' || drive === 'AWD';
      return `<span class="drivetrain-pictogram ${drive.toLowerCase()}">
        <svg viewBox="0 0 40 24" aria-hidden="true">
          <rect x="4" y="2" width="7" height="5" rx="1.5" class="${frontDriven ? 'wheel-driven' : 'wheel-idle'}"/>
          <rect x="29" y="2" width="7" height="5" rx="1.5" class="${frontDriven ? 'wheel-driven' : 'wheel-idle'}"/>
          <rect x="4" y="17" width="7" height="5" rx="1.5" class="${rearDriven ? 'wheel-driven' : 'wheel-idle'}"/>
          <rect x="29" y="17" width="7" height="5" rx="1.5" class="${rearDriven ? 'wheel-driven' : 'wheel-idle'}"/>
          <path d="M11 4.5h18M11 19.5h18M20 4.5v15" class="drive-line"/>
          <circle cx="20" cy="12" r="3.2" class="drive-center"/>
        </svg>
        <b>${drive || '—'}</b>
      </span>`;
    }

    const items = [
      ['title', vehicle.title || '—'],
      ['drive', drivetrainLabel],
      ['engine', vehicle.engine || '—'],
      ['transmission', vehicle.transmission || '—'],
      ['fuel', vehicle.fuelEconomy || '—']
    ];

    items.forEach(([type, text]) => {
      const span = document.createElement('span');
      span.className = `inventory-spec-item spec-${type}`;

      const icon = document.createElement('span');
      icon.className = 'spec-icon';
      icon.innerHTML = type === 'drive' ? drivetrainIcon(text) : (iconMarkup[type] || '');

      const txt = document.createElement('span');
      txt.className = 'spec-text';
      txt.textContent = text;

      span.append(icon, txt);
      specs.appendChild(span);
    });
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

  const rawStatus = String(vehicle.status || '').trim();
  const normalizedDisplayStatus = rawStatus.toLowerCase().includes('example') ? 'Coming Soon' : rawStatus;
  status.textContent = normalizedDisplayStatus;
  status.classList.toggle('coming-soon-status', String(vehicle.status || '').trim().toLowerCase() === 'coming soon');
  const normalizedStatus = normalizedDisplayStatus.trim().toLowerCase();
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
  const cardSpecs = [
    formatMiles(vehicle.miles),
    vehicle.title,
    vehicle.drivetrain
  ];

  if (cardContext === 'inventory') {
    specs.classList.add('inventory-specs');

    const drivetrainValue = String(vehicle.drivetrain || '').trim().toUpperCase();
    const drivetrainLabel = ['FWD','AWD','RWD'].includes(drivetrainValue) ? drivetrainValue : (vehicle.drivetrain || '—');

    const mileage = document.createElement('span');
    mileage.className = 'inventory-spec-item';
    mileage.textContent = formatMiles(vehicle.miles);
    specs.appendChild(mileage);

    const items = [
      ['title', vehicle.title || '—'],
      ['drive', drivetrainLabel],
      ['engine', vehicle.engine || '—'],
      ['transmission', vehicle.transmission || '—'],
      ['fuel', vehicle.fuelEconomy || '—']
    ];

    items.forEach(([type, text]) => {
      const span = document.createElement('span');
      span.className = `inventory-spec-item spec-${type}`;
      const icon = document.createElement('span');
      icon.className = 'spec-icon';

      if (type === 'drive') {
        icon.innerHTML = `<span class="drive-icon">${text}</span>`;
      } else {
        const icons = {
          title: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6z"></path><path d="M15 3v4h4"></path></svg>',
          engine: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8h8l2 2h2v6h-2l-2 2H7l-2-2H3V10h2z"></path><path d="M9 5v3M13 5v3"></path></svg>',
          transmission: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"></path></svg>',
          fuel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8v18H6z"></path><path d="M8 6h4v4H8zM14 8h2l2 2v7a2 2 0 0 0 4 0v-6l-2-2"></path></svg>'
        };
        icon.innerHTML = icons[type] || '';
      }

      const txt = document.createElement('span');
      txt.className = 'spec-text';
      txt.textContent = text;
      span.append(icon, txt);
      specs.appendChild(span);
    });
  } else {
    cardSpecs.forEach(text => {
      const span = document.createElement('span');
      span.textContent = text || '—';
      specs.appendChild(span);
    });
  }

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
      const searchable = `${v.year} ${v.make} ${v.model} ${v.trim} ${v.drivetrain} ${v.engine || ''} ${v.transmission || ''} ${v.fuelEconomy || ''} ${formatMiles(v.miles)} ${v.title}`.toLowerCase();
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
    document.querySelector('#detail-drive').textContent = vehicle.drivetrain || '—';
    document.querySelector('#detail-engine').textContent = vehicle.engine || '—';
    document.querySelector('#detail-transmission').textContent = vehicle.transmission || '—';
    document.querySelector('#detail-fuel-economy').textContent = vehicle.fuelEconomy || '—';
    const detailContact = document.querySelector('#detail-contact');
    const detailKeepShopping = document.querySelector('#detail-keep-shopping');
    const detailIsSold = String(vehicle.status || '').trim().toLowerCase() === 'sold';

    if (detailContact) {
      if (detailIsSold) {
        detailContact.textContent = 'View Available Inventory';
        detailContact.href = 'inventory.html';
        detailContact.removeAttribute('data-open-inquiry');
      } else {
        detailContact.textContent = 'Ask About This Vehicle';
        detailContact.href = '#vehicle-inquiry';
        detailContact.setAttribute('data-open-inquiry', 'true');
      }
    }

    if (detailKeepShopping && detailIsSold) {
      detailKeepShopping.remove();
    }

    const inquiryVehicleLabel = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ' ' + vehicle.trim : ''}`;
    const inquiryVehicleText = document.querySelector('#vehicle-inquiry-vehicle');
    const inquiryVehicleInput = document.querySelector('#vehicle-inquiry-listing');
    if (inquiryVehicleText) inquiryVehicleText.textContent = inquiryVehicleLabel;
    if (inquiryVehicleInput) inquiryVehicleInput.value = inquiryVehicleLabel;

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


// v5.9 vehicle-detail inquiry modal.
const vehicleInquiryModal = document.querySelector('#vehicle-inquiry-modal');
const vehicleInquiryClose = document.querySelector('#vehicle-inquiry-close');
const vehicleInquiryForm = document.querySelector('#vehicle-inquiry-form');
const vehicleInquiryComments = document.querySelector('#vehicle-inquiry-comments');
const vehicleInquiryCount = document.querySelector('#vehicle-inquiry-count');

function openVehicleInquiryModal() {
  const modal = document.querySelector('#vehicle-inquiry-modal');
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add('modal-open');
  document.querySelector('#vehicle-inquiry-first')?.focus();
}

function closeVehicleInquiryModal() {
  const modal = document.querySelector('#vehicle-inquiry-modal');
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove('modal-open');
}

document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-open-inquiry="true"]');
  if (trigger) {
    event.preventDefault();
    openVehicleInquiryModal();
  }
});

vehicleInquiryClose?.addEventListener('click', closeVehicleInquiryModal);

vehicleInquiryModal?.addEventListener('click', event => {
  if (event.target === vehicleInquiryModal || event.target.classList.contains('vehicle-inquiry-backdrop')) {
    closeVehicleInquiryModal();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && vehicleInquiryModal && !vehicleInquiryModal.hidden) {
    closeVehicleInquiryModal();
  }
});

if (vehicleInquiryComments && vehicleInquiryCount) {
  const updateVehicleInquiryCount = () => {
    vehicleInquiryCount.textContent = String(vehicleInquiryComments.value.length);
  };
  vehicleInquiryComments.addEventListener('input', updateVehicleInquiryCount);
  updateVehicleInquiryCount();
}

if (vehicleInquiryForm) {
  vehicleInquiryForm.addEventListener('submit', async event => {
    event.preventDefault();

    if (!vehicleInquiryForm.reportValidity()) return;

    const submitButton = document.querySelector('#vehicle-inquiry-submit');
    const defaultLabel = 'Send Inquiry';

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.remove('sent-success', 'send-error');
      submitButton.textContent = 'Sending...';
    }

    const formData = new FormData(vehicleInquiryForm);
    const payload = {
      _subject: `Vehicle Inquiry — ${formData.get('Vehicle') || 'Wurks Auto Sales'}`,
      _template: 'table'
    };

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

      if (submitButton) {
        submitButton.textContent = "Message Sent — We'll Reach Out Soon";
        submitButton.classList.add('sent-success');
      }

      setTimeout(() => {
        closeVehicleInquiryModal();
        const vehicleValue = document.querySelector('#vehicle-inquiry-listing')?.value || '';
        vehicleInquiryForm.reset();
        const vehicleInput = document.querySelector('#vehicle-inquiry-listing');
        if (vehicleInput) vehicleInput.value = vehicleValue;
        if (vehicleInquiryComments) {
          vehicleInquiryComments.value = "I'm interested in this vehicle. Please contact me with more information.";
          vehicleInquiryComments.dispatchEvent(new Event('input'));
        }
        if (submitButton) {
          submitButton.textContent = defaultLabel;
          submitButton.classList.remove('sent-success');
          submitButton.disabled = false;
        }
      }, 3500);
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
