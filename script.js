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
  card.querySelector('.vehicle-name').textContent = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ' ' + vehicle.trim : ''}`;
  const mileageLine = card.querySelector('.vehicle-mileage');
  if (mileageLine) {
    mileageLine.innerHTML = `<span>${formatMiles(vehicle.miles).replace(' miles', ' mi')}</span><span class="meta-dot">•</span><span>${vehicle.title || '—'}</span>`;
  }
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

  if (cardContext === 'inventory' || cardContext === 'featured') {
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
        const drive = String(text || '').toUpperCase();
        const frontDriven = drive === 'FWD' || drive === 'AWD';
        const rearDriven = drive === 'RWD' || drive === 'AWD';
        icon.innerHTML = `<span class="drivetrain-pictogram">
          <svg viewBox="0 0 44 36" aria-hidden="true">
            <rect x="2" y="2" width="9" height="12" rx="3" class="${frontDriven ? 'wheel-driven' : 'wheel-idle'}"></rect>
            <rect x="33" y="2" width="9" height="12" rx="3" class="${frontDriven ? 'wheel-driven' : 'wheel-idle'}"></rect>
            <rect x="2" y="22" width="9" height="12" rx="3" class="${rearDriven ? 'wheel-driven' : 'wheel-idle'}"></rect>
            <rect x="33" y="22" width="9" height="12" rx="3" class="${rearDriven ? 'wheel-driven' : 'wheel-idle'}"></rect>
            <path d="M11 8h22M11 28h22M22 8v20" class="drive-line"></path>
            <circle cx="22" cy="8" r="3.3" class="drive-node"></circle>
            <circle cx="22" cy="18" r="2.6" class="drive-node"></circle>
            <circle cx="22" cy="28" r="3.3" class="drive-node"></circle>
          </svg>
          <b>${drive || '—'}</b>
        </span>`;
      } else {
        const icons = {
          title: '<svg class="inventory-icon document-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 2.5h9l4 4v15H5.5z" fill="currentColor"></path><path d="M14.5 2.5v4.5H19" fill="none" stroke="#15181d" stroke-width="1.5" stroke-linejoin="round"></path><path d="M8.5 11h7M8.5 14h7M8.5 17h5" fill="none" stroke="#15181d" stroke-width="1.4" stroke-linecap="round"></path></svg>',
          engine: '<svg class="inventory-icon engine-icon" viewBox="0 0 28 24" aria-hidden="true"><path d="M6.2 7.2h11.5l2.2 2.1h3.2v7.3H20l-2.2 2.2H7.1l-2.2-2.2H1.8V9.3h3.1z" fill="currentColor"></path><rect x="8.1" y="4" width="3.2" height="3.5" rx=".55" fill="currentColor"></rect><rect x="13.6" y="4" width="3.2" height="3.5" rx=".55" fill="currentColor"></rect><path d="M23 10.4h3v5.1h-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path></svg>',
          transmission: '<svg class="inventory-icon gear-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10.2 1.8h3.6l.7 2.2c.6.2 1.1.4 1.6.7l2.1-1 2.6 2.6-1 2.1c.3.5.5 1 .7 1.6l2.2.7v3.6l-2.2.7c-.2.6-.4 1.1-.7 1.6l1 2.1-2.6 2.6-2.1-1c-.5.3-1 .5-1.6.7l-.7 2.2h-3.6l-.7-2.2c-.6-.2-1.1-.4-1.6-.7l-2.1 1-2.6-2.6 1-2.1c-.3-.5-.5-1-.7-1.6L1.3 14.3v-3.6l2.2-.7c.2-.6.4-1.1.7-1.6l-1-2.1 2.6-2.6 2.1 1c.5-.3 1-.5 1.6-.7z" fill="currentColor"></path><circle cx="12" cy="12.5" r="3.25" fill="#15181d"></circle></svg>',
          fuel: '<svg class="inventory-icon fuel-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.8 2.5h10.5v19H4.8z" fill="currentColor"></path><rect x="7.1" y="5.1" width="5.8" height="5" rx=".55" fill="#15181d"></rect><path d="M15.3 7.4h2.1l2.2 2.2v7.2c0 1 .5 1.6 1.3 1.6.8 0 1.3-.6 1.3-1.6v-5.4l-1.9-1.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><rect x="4" y="21" width="12" height="1.4" rx=".7" fill="currentColor"></rect></svg>'
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
    const breadcrumbName = document.querySelector('#detail-breadcrumb-name');
    if (breadcrumbName) breadcrumbName.textContent = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
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
