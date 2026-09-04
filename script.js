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
  const vehicleNameEl = card.querySelector('.vehicle-name');
  if (vehicleNameEl) {
    const mainVehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim();

    if ((cardContext === 'inventory' || cardContext === 'featured') && vehicle.trim) {
      vehicleNameEl.textContent = mainVehicleName;
      const trimSpan = document.createElement('span');
      trimSpan.className = 'vehicle-trim';
      trimSpan.textContent = ` ${vehicle.trim}`;
      vehicleNameEl.appendChild(trimSpan);
    } else {
      vehicleNameEl.textContent = `${mainVehicleName}${vehicle.trim ? ' ' + vehicle.trim : ''}`;
    }
  }
  const mileageLine = card.querySelector('.vehicle-mileage');
  if (mileageLine) {
    mileageLine.textContent = formatMiles(vehicle.miles);
  }
  card.querySelector('.vehicle-price').textContent = vehicle.price;

  const vinRow = card.querySelector('.vehicle-vin-row');
  const vinValue = card.querySelector('.vehicle-vin');
  if (vinRow && vinValue) {
    const vin = String(vehicle.vin || '').trim().toUpperCase();
    if (vin) {
      vinValue.textContent = vin;
      vinRow.hidden = false;
    } else {
      vinRow.hidden = true;
    }
  }

    card.querySelector('.vehicle-desc').textContent = vehicle.description;

  if (images.length) {
    photo.classList.add('has-image');
    photo.style.backgroundImage = `url("${images[0]}")`;
    photo.querySelector('.photo-placeholder')?.remove();

    // Homepage highlights and Inventory cards intentionally share the same photo controls.
    if (cardContext === 'inventory' || cardContext === 'featured') {
      const count = document.createElement('span');
      count.className = 'photo-count';
      const updateCardPhotoCount = currentIndex => {
        count.innerHTML = `<svg class="photo-count-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 7.5h3l1.4-2h6.2l1.4 2h3A2.5 2.5 0 0 1 22 10v7.5A2.5 2.5 0 0 1 19.5 20h-15A2.5 2.5 0 0 1 2 17.5V10a2.5 2.5 0 0 1 2.5-2.5Z"></path><circle cx="12" cy="13.5" r="3.5"></circle></svg><span>${currentIndex + 1} / ${images.length}</span>`;
        count.setAttribute('aria-label', `Photo ${currentIndex + 1} of ${images.length}`);
      };
      updateCardPhotoCount(0);
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
        previous.innerHTML = '<svg class="photo-arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"></path></svg>';
        next.innerHTML = '<svg class="photo-arrow-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"></path></svg>';

        const showImage = index => {
          currentImage = (index + images.length) % images.length;
          photo.style.backgroundImage = `url("${images[currentImage]}")`;
          updateCardPhotoCount(currentImage);
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
    const drivetrainNames = {
      FWD: 'FWD (Front-Wheel Drive)',
      AWD: 'AWD (All-Wheel Drive)',
      RWD: 'RWD (Rear-Wheel Drive)'
    };
    const drivetrainLabel = (cardContext === 'inventory' || cardContext === 'featured')
      ? (drivetrainNames[drivetrainValue] || vehicle.drivetrain || '—')
      : (['FWD','AWD','RWD'].includes(drivetrainValue) ? drivetrainValue : (vehicle.drivetrain || '—'));

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
        const drive = drivetrainValue || String(text || '').trim().toUpperCase();
        const frontDriven = drive.startsWith('FWD') || drive.startsWith('AWD');
        const rearDriven = drive.startsWith('RWD') || drive.startsWith('AWD');
        icon.innerHTML = `<span class="ref-drivetrain">
          <svg viewBox="0 0 52 52" aria-hidden="true">
            <rect x="4" y="2" width="11" height="15" rx="1.8" class="${frontDriven ? 'ref-wheel-driven-fill' : 'ref-wheel-fill'}"></rect>
            <rect x="37" y="2" width="11" height="15" rx="1.8" class="${frontDriven ? 'ref-wheel-driven-fill' : 'ref-wheel-fill'}"></rect>
            <rect x="4" y="35" width="11" height="15" rx="1.8" class="${rearDriven ? 'ref-wheel-driven-fill' : 'ref-wheel-fill'}"></rect>
            <rect x="37" y="35" width="11" height="15" rx="1.8" class="${rearDriven ? 'ref-wheel-driven-fill' : 'ref-wheel-fill'}"></rect>
            <rect x="14.2" y="8" width="23.6" height="4.2" rx="1.2" class="ref-drive-body"></rect>
            <circle cx="26" cy="10.1" r="3.6" class="ref-drive-body"></circle>
            <rect x="23.95" y="13.4" width="4.1" height="25.5" rx="1.2" class="ref-drive-body"></rect>
            <rect x="21.2" y="37.9" width="9.6" height="3.9" rx="0.8" class="ref-drive-body"></rect>
            <rect x="14.2" y="41.5" width="23.6" height="4.2" rx="1.2" class="ref-drive-body"></rect>
          </svg>
        </span>`;
      } else {
        const icons = {
          title: '<img class="ref-title-img" src="data:image/png;base64,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" alt="" aria-hidden="true">',
          engine: '<img class="ref-engine-img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAg0AAAFhCAYAAADzxpkoAABEF0lEQVR4nO3d+b88V13n8Vff5bvmm29C9p0lLEkggCBbWGUZZQAF13EEGXBwEAXEv0NgiAyKyghGBxEVURAUiYGEiLIIhGQgkIQEskK27zf5Lvfe7vnh05+p06eruqurq051db+fj0c/+t5eqk5vdT51ls/pDQYDRERERKZZa7sAIiIi0g0KGkRERKQUBQ0iIiJSykbbBZCV9iHg8cAJwDr2fdwY/r0G9ILH+t+D6Dq83y9r0XWPxTeI/u4z/hrdpNcz6TlF7+ms4m0UbTP8O69cswyo8seG70v8nsW3T7vuB88L/w4vR4FjwBHgQeD+4fWbZyi7yNLoaSCkJPSnwBOAM4D9wO7hZT14TPiFnLVyLHp8F4KGWFHQkPdapgVU/piuBFCThMEB2OuJA4ZBcF8s77ZBsB0KrsOLuxe4E7gZ+IXSr0CkwxQ0SArXAucDJ2FBgp/1ymRlA6hJz00RJMSVbC+6nvScMqq+9nm2EesPL74tDzL6wBZwGLgN+CLwljn3JbKwFDRIk64AXgicRtaasF74aJH55LW0zNq6ktftFW873KYHE+vD60PAj4ALZ9inSGcoaJCmfBh4GbCPbJwCZGdr3tIw6QtY5Uw1rxm5i2ap7MKm9UnqeF/iVoS2ujzyxjMUtXj430XlnPa+5LWMFQUmO1jLwzeBp0/YpkgnKWiQJnwKeAmwjXVHhPwAHR/Aiyq++EwvfmxeRdDPuW3RVa3Qw6byMs8v03VQZf9tyhvPUPa9mPZd8m2FrzNvXEW8XW99aPu9EamVggZpwm3AKWSzIeJR9E0fSJehpaEL6g5A6tL259/DWhx2sEGSF7VYFpFaaTCa1O1G4BHAJtmU3nkG9Il0Tfh9vwC4vK2CiNRNeRqkTh/EBj320XdLVtsaFjwcB57fcllEaqMDu9TpOYwPGlMrg6wi/x1sAKe3XBaR2qh7QurkUyv3DP9PMX5BZBENyAZC7gP+qN3iiNRDQYPU5T1YsBDmYVjUgXIiTfEWBh+MuQvrrnt0m4USqYu6J6Qu52ODH3fID0ZTBg6LMA1Q2rMIn3+4zscGNjhYpPPU0iB12WQ814KmPcqqCjNG9rDfh0jnKWiQuhQlslHgIKsqTGQWJzkT6SQFDVKXYyhAEAmFvwetuSJLQUGD1OVesvTNYVretvuWRdoSfve3WyuFSI2URlrq5K0N62iQrQjYwOCjwPeAS1oui8jc1NIgddrBgoadtgsisiC8W2Kr1VKI1ERBg9TpG9jBMWxl8CCij8Y8yOrZwX4PN7VdEJE6qHtC6nY/lgHPp5gdJ5tZoTEOsiwmZTv1+44O/38AODNFoUSappYGqds3GW1p2IUFDWGyG5Gum/Rd9nwlfWwA5LVJSiSSgFoapAm3YEsCiyy7/vCyxuhJ2Pbw9i9jC7mJLAUFDdKU27HV/TQ/XZaZj9fpMZrg7ChwHfDjLZVLpBHqnpCmnI0N/jpOlr9BpEjXzl68+2GdLIW6Owp8AQUMsoQUNEiTHgfcgYIGGbdsa5T4IN8jwL8BL263OCLNUPeEpPBB4FnAWdjMCm/SXWd0ZsUi20FdLXUKZx/4Gg1rwf+hXnT7ILo9vj9+XlP8e3wMuA34V+ANDe9TpFUKGiS1v8eW0T4J2D+8bFB8gC9aBKuoovDbir7YkwKUabkk1skyXkp9PJeHz7CJgwh/TPj5FH3uoR7jU33j/+Pt5j3WH7c9vOwMr3+EZXpUq4KsDAUN0ra/xFof1rDgYYOsBcKnasJ4Rb875zaYXKn4doqeVxRs9IBHDC++X3Xt1WcLq4g9t8GdwGFsPMw29l5vMn156fizC7874eceTv8dkAWtfbLWA//7yPByGMtB8gDw9plencgSUdAgUt4VwDOAc7HgQYHD/I5igcGDwFeAV7ZbHBGZREGDyOy+CFxM1kIis/MDz8PAPcCjWiyLiJSkoEGkmm8C55EFDos+kHPRDLBm/+PAyS2XRURK0lmSSDVXMdoHLuUNgEPDv7/TZkFEZDZqaRCp7ovAUxkdsCnTeSvDADih5bKIyAx0oBOp7iH0G6pqA+uaEJEO0QFPpLoH6UZiqkW0jg2CFJEOUdAgUt3htgvQYWtYF4WIdIiCBpHqtlmOdRPaMMDSL4tIhyhoEKlujemppyXfzvAiIh2ioEGkOq1BUZ2v4SAiHbLRdgFEOswX25JqDrZdABGZjVoaRKo7C82cqKoHnNh2IURkNgoaRKo7s+0CdNgalj7699ouiIiUp6BBpJoPk62ZoNaG2fjS4n3gJ1oui4jMQEGDSDXPwQZCauZENetY8HAO8Octl0VESlLQIDKbdwG3AKcCe1ArwzzWsffwJcBHWi6LiJSgBatEynk/8DLgDGATmzK4gZbFrqqPvXd+ADoK3AlcA7y2rUKJyGQKGiS13wUuxAYRHgTOBXbnPG5AVhlPu05pwGiXhNaeqMaDhi1G378BFpRBlgDKlx5fIwvUwu34Y9aYrfV0wPjn6UGgXwbDbft+doL/bwfuAm4FXj/DfkU6S0GDNO0DwNOxQYP7hpc90WPCA3cvuC38v+2KeRBdu0UpX1fEFXX4OYcXovuhuffYy1Pms4zL7wm+jgE/wgKJO4FX1l9MkfYpaJAmfAR4MjbIbe/wtvgMMD7Di+8rEh/Q8w70szx/ln3n3a+gYTZxwJAXFPh1UatBUSAxz8GsaDt52/TH9oP/w7IOsBU87wCuA149R7lEFoqCBqnTVcDjgQNYE/Pm5Ifnnr33mNzqUKZyLmoVCLc57bllKWiYTVHQEL6P87ynkz77osfH37OyrRtha0P8uAHWlbENHAK+BTyvZJlEFpaCBqnDp4BnMJoWuErfcqzq7J6iM8VpldGk1o8iChpmkxc05AUMBLelLle432mtVh7kFpVzC+u68FU97wKeOFdJRVqkoEHm8T6s6fVkrFXBV3xcJxswts70hZ3yKut5BhgWVf4KGto3LWiI9Qr+bkLc6hHenhcYlG21CgOQHjbu4cvAq6oVU6Q9ChqkqiuAl2LrB+whG2XuAYKPMO9hAYQHE3lNuXVT0LC48gZBuqKgoex7W/VgVmZchFf4ZQKFohk2/txj2G/jFuDiGcsq0ioFDVLFPwMvovz4gn7wf94IeVldRWf3XRR3i8UBpd/my4JvYvkp3g/8dqIyisxFQYPM6pPAc7H58nunPFZExvkgyTXgfuAB4NFtFkikLKWRlln8FXAZdoYU51oQkfI2htf7gVOA77ZYFpHS1NIgs/ghNp1yV9sFEemocLyDp9HexsY53Atc0FK5REpRS4OU9S3srEgBg8j8dobXPazlbi9wFvCN1kokUoKCBinjauA8siZVyHLxi0h5ntdhk2xsQ3j7+cCV7RRNZDoFDVLGo8kW8vHpk5MS2ohIvgFZt4TPItoa/r+BdVU8AXhPWwUUmURjGmSa27FmU+e5F0BBg8i84jEOIf2+ZOGopUEm+WPghOi2cOlgEZmPL3YVH4u3gL9MXxyRyRQ0yCQvxJay3m65HCKrIGz27QM/1lZBRIooaJAiHwHOZHztCPVniTQjbL1bB04C/qydoojkU9AgRZ5H9v1IuWiQiFjQsB+4tO2CiIQ2pj9EVtCfAI9AQaVIauGsil3AOe0WR2SUKgXJ83xsIR19P0TSilv1TgI+1E5RRMappUFiHwTOBnaTJZ5ZppUIRbriGHaMfmbbBRFxOpOU2AVkwWS4pK+IpONZI/tocThZIAoaJPYobBBWn/yBkCLSvPD3dwD43RbLIvL/qXtCQn+A9aH6YKy4hUGpo0WaFf/m1rBcKY9toSwiY9TSIKHnMJoXP1xQB9RNIZKCz57ok+VJOb/VEokMKWgQ90FsJctNsu9Ff3itBapE0vDfmC8M505roSwiY9Q9Ie4ZwF5sbjhkQYK3PNQdYMatFgpIREZb+fy3B+NrwIi0QqtcCsCtWBIZbw4NZ030aKaVIfzi+ba3h5cd4KHhpWi/Vb+4KYOTeDXQaWVehh9j3liY8D6X6rXm7WcQXA+w730f+971sJOpPVir2x4smPYZDOEAxSaFvzkvo07ypHX6Eq62PwFeAJxM/kp7TS6B7dv0pbYfxOalfwf4CvCbDexTpIq/BX4cOIVsZtGA0TVZ6hYneVJXsiwEtTSspr8AnkKWonaTrFsitR2sdeE2NEJcFttngWfTTt6EJroIRWamoKFZ78ZWijwInIq17GxgZygbZGf3+xlt9QnP8MNLWQNgi6ypfzDc/m4sONg9LEPbmR4HwHHgYWytC5FF11bgoKBBFoK6J+r1D1iegwPAicPLPux97keP9b7fuO8yfkx4XYXvA0bHK8y73Tp4cPORlsshUtZPADcAjxv+n7Iify/wloT7ExnTdtDwv7AKdjdwF/Bb7Ranks9izep7h5d17EDi/ZB+UPG+0NAgusD42X/ZVob4cf5/uO1JUk+p9BwQtwD/I+F+Reb1eeCRZK2FqSidtLQuddDwN8AlwBnYWXjoCPBG4E7gU8BvpC3azL4NXIhVfH3GxwTElXAYDPjt4QGnT37lXrYiLwoupj0/HDUO460RTRlg3Sf/nGBfInV6E/BqbABxSk0OvBQpJdWYhvcB/w0bcBdXSF5ZbmBN1ZvD2+/CxgMsmh9hXRCxJmcazCtv7EI4nTKe/ljXa8ibVglZkHIYG+8h0jVXYqtP7k20vz7WqvnSRPsTyZWiae0fgddiXRCTKqMdsoABbGDcD4B3Nle0mfwDFjDsb7sgFeQFAmGQsxZcUgU9A+BQon2J1O0I6fNqtN2dLNJ40PBV4DIsYIDiCikvIcwmljr1l5op2ky+DjwXa2HYnPxQyZH3uQ+AH6YuiEhNDjE+RqlpGtMgrWsqaPgD4PvYCONdZOlQJ/XZr5FlZnPrWEKV7zZUzmk+gLV2PJ6sa8XPxhexG6JLBlgXlEgXtRE0dLGVU5ZME81dV2KzCU4jOyv3XAFe2RYFK/Hta1jgcB7wGeAldRd2gr/FWhfCHAphk74SXMxPQYN01VHSHwMUNEjr6g4aPoGlW9093La3LmxgI+WL+tbDpWDXyJISefm2sUFHqXwBayXZPyzPFllLiBKs1GMAvK7tQohUtE36loZUgy5FCtVZAX4CeB5Z5rJtrLL1IMHnNE9q1g9XVPSpf+vYj2UA/J8ayzvJE7HxCx78eHk8iFErQ3lF4xn0HkqXFU2RbpLGU0nr6goa/hWbCrSbrIJfY3yKZTzlL5wKmJcN0VsfwM76n11TeYu8F2vhOCEqkwczO0HZpJyiA+vNSUshUq93YKuwptLDjkt/l3CfImPq6J74GNaUv40NeiwKDIoUBQvh/76dpkcPX4YFBp5Epe21GZaRB18azyBdl7p7YoC1goq0Zt6Whr/GcrHvJ5slUWWBpWm88t4LvKvG7Yb+BpslsYGChCZtYYtUfbvtgojMKWXQ0MOOsWcCVyfcr8iIeYKGPwd+Ejv736TZqYhezl3AuQ1sH6yVQQFD/QZkB1efQfMglopXpMt2pj+kVuvYMfApwOcS71sEqN498T4sYPDuiLiibWqA0AaWt6FuV2NLV+9g3SyaIVEv75JYx95fjWeQZZC6ewLs2LQH66a4Y3i5E/ge8OYWyiMrpmrQ8CvYD2ZSzoW6+UyKJuYqP3G4/Q3gGAoa6hIu+e1nZUeBr7VTHJFapWxpiMdXnTjc/wHg0djMtdcFj/UWvn7wd974sbyF9cLn72Bdig9jLYQPYANAf7aelyVdUyVo+CbWHbEb65teJxs4eIxmpgWFX/a6c0t8mSzNteeUkGr8YNOL/vcFqo4OL7/ZSulE6uUVcVMLvoV8m32y4613V8BoHpy4DGHAEJY1DiLC365vI+xejI/1D2KZf7+IlrdfGbNWkNdggwX9y7TO6Fl5uDx0nT+cHllUX3crwOOCbXprhmZNVBdm/oRsuuoGdvD5l3aKJVK7BxhfKTaePp53dh9ez6roeZOO5XUcM+OWil1YLptTsTEWv46l+78O+Jka9icLapYv07uBc7CIFrIKNp4e2eS6DJ6Oui5XMDlHhMwmDLr87GR7+P9xbCzDL7dTNJHaHWe0tSG8NKWt45LXFXGr7w7Zb/0xwMuBG4HfS1c0SWmWoOGngTNYrhkGT2G0KV3qES6zvY4dVA4DF7VZKJGaHWM0UJi3FWGR5AU/azm3rQe3+wnCBcCvYqscy5IpGzRcBTwSG7Ubty502XnkD+ZUmuPq+mStUWDv72HSpQAXSSVctCrloPAUwjENvhYQZK8x7q7wgeTeRb0JXIKtBvovDZdVEirzJb8cOyOPpa5U6w5UrgD2kZ0VhyOMFTBUF3bt9IEjwMfR4EdZPg+TzVCIu2aX4TgSB0Th73rSawtz9uzFFhv8ZkNllMTKBA0/i1Wurs0fQp37voTR0cB506eW4Yefkvdt7mBnYXcCHwXe0FqJRJrj3RPLLO/1xdM54+Okz+rYwKZr9rFW3R8B72mysNK8abMnPgOcNfzbo2mvGFIPFqx7X6eQNaltDy/xeI1l6YapUzyvO+TLiPewgOFRqQol0oItst9DOAPLdT2gCLsowtflXdQeOExavdjXC/LA4lXAW5sorKQxraXhOWTJPfyL4c35kHZ5WP/y1pVH4cRo2+vR/woY8hW9L8expC93Y90RChhk2b0Jm3Z5fPh/3Mc/qTLtkqKMvz4IMpx2WlQn+PtxwfD+v26kpNK4SRXwlVh/FNiHHTZFLUOlGpbfxzR0/TXNoijYK/se9IPLDnAL8C3g1XOXTKQ7jmFZGVfl+JGXwya8rcx78DCWwVI6aFLQcMnwOuyWaPtHUVerxu/S/msJVR07Mek5k15fUT+lH/jyMsWFqaB3sGxwdwC3ArcDv1WivCLL5l7gdOz4GB9Pu949AeMniuHxIe8YUyZ42oO9X3eQdX9LRxQFDX+CpVb26TbhmfgyTCs6mfSvI5yy5O/rNnamch+jiavy5nvXEeTEqWTDa78cHZbFF+/aDv6+CwsWNBNCxNwMPIH8LJDLEjRMG7cQKvOYNawVew/wJeDplUsnyRUFDU8ma1nwvv64Cb/LP4iTyc9k2bQtbP7yfcDXsYWb3pFgvyLSjNdgeUjCMVHL1FWRl/l3Xr5+Rh9L4//nKFNsZxQFDWcH94Vn5IsQKNTx5T3IeEtDkz/yAdaisIHlZ398g/sSkbR2KE4QtwzBg7+W+DX6QnSzttqG69LsAy6bq3SSVN6H/UfYwB5fYMhzi7ed+KjO/e6d/pDa7cH6/hUwiCyXMAOqHzNhObpy4xlz8X15Y6Am8UAj/P9s4BNVCyhp5X0RHju8PWxp8C9H/HdXpxTldUc0+Tp2sPEAmoYosnz+Cet6hNE8NpAdJ8PjZRePmaHwtc36euI6x5NA/VQN5ZIEiiLhRRvwWPdUz7xtNN09cU+D2xeR9vwSNo3QBzP7GICuBwdNmPSeXJGsFFLZIgUGKc3apFaHLyben4ikcy3ZKo+rcFxtIiDSLIoO6MqXexEGYM5jgGWPE5Hl9AosZ4NUd17bBZDpuhI0dF3Xgx4Rme6fWY1FrJrQw6ajf6HtgshkRSNipV46iIgsv9diuVd8ZUeZ3ePaLoBMlpenQUGDiEg1zwMOYbMCXJx5FYqzvRat6VDFtCny86wf0YQecFJL+5aS8loaPLPZMp8dp54qejThvkSkXQewjK/HgCPkz/zy9MxhDpzYvBV43tT4+LZwhco28/C4HnBNy2WQCdQ90Zy2f3wi0p4nA5/B1mrxtVzATsrCS5xx1x9bdPzoB4+ZFnSEJi3VvcboMtdt8YUR97dYBplCAyFFRJrxCuBM4GosT8vx6P645SFcFLCo8vYK3iv5WZPseXARZ/ktG3w0bQc4seUyyASTlsYWEZH5/cTw+kPARcD5wAnY8XeD0cWuQh5E9IP/w+swUChaSyfscgj/jpcF8GBkEVoaDrRYBplCQYOISBqvi/7/AHABcC5wCtYsv8l4eua8xbCgXJK6eLxC2JIRri3k92/QXjeFv+bdLexbStLsCRGRdrxhyv2XY2fd+7GK1FsnwvV/XN5gR7eHLBhYi7axDwtUwtva4stw70x7oLRHLQ1ptN1PKCLd81sJ9/Uh4BLgkcBBirtMmhZ2x8gCyhsI6c1jRRe1RIiILJfXAU/Dukn+F3ATNmW0DbvRUtkLS90TzVuEuc8iImW9dXj5D2zqaKhPs90Yda5m3KT3YrM8TgFOxrqRdg1v20v+cug+BmUHW9zML33gVuB24AHgVxO+jpmpe0JERPI8BZsqejJZd0XTAUPT+6jqg8CFwNnA6dhYkLyEWD59NS+x1iSnAJcO//5ZbHruUay15zrglXO/gpooaBARkSI3AM/GKsJU3dNe2bbtL4EnAOdgXSa+qNYaWXCQF+hUCbB8+i3DfYQJrs4B7gMexoK4G4Gfn+2l1EdBg4iIFPky1kWxB2t+94qyyYGSPouiLZ/FBoV6C0s4tTVMux2WMQwi8rqkw5YHf3y83aIptptYt8cBrJXjscAdwP1Yyu1fm/kVzkFBg4iIFPlt4JewfvpUsxriKaOpXA1cjFXOcaIrr+C9cu8H//v9swQ6eTk2wu3F4um1u7AA4izgJcC/k6j1YRGagEREZLFtYpWaZ45sShtjGX4XuBe4DGtd8JwVsTgD57xlDRNtFY2NCAO1LWzgpOfaWMO6Mc7GxjzcArxrzjJNldfSoNYHERFx38YG6vlJZlMzKMIWhlQntF/CppqGfPxGKr3oOq/LwrN1xvy2HeA8LLfHC4Afq7+YRi0NIiIyiWdojNez6PpU8muApw7/3hpeT1tltClxV0gclOXdFj9/Cwt4LgS+1UAZAQUNIiIyWRuVaNO+gLUw+EwIv4Zu1otrWBdSH5vp8UjgZuD3mtiRiIhIke3h9aLlTqjqKuBZZE37fga/E/zdxSApHm9yOvBfsKmjte6kS7r4QYqIdNk2k0f2d8nfAU8nm+2wTdaSErY0dK1uDKfC7hpe9g4vLwU+VteOuvbGiIhIWtvTH9IJ7wKex+jS296y4GfoR+nm6y2qy3djr+3lwP9uckeLTK0NIiLpDILrLh9/f47RsQsw2nqyiSWx6mKLik/RDHk3ywlYIPSf6thRV4KGcOToZk3bExGR6e7A6oow42G/4LKogcV1WD6DPWRjGbzLJU6c1GY2yirC1xHXbetki2SdhKWgnktXggYREWlPVwcHulOBh9ouREPCPA9xgijnMyvOAj45z866lshpUaNYEZFV0bUA4gtY5sR4auWyDO4Mxbkd3AAb3zDAVi+tTC0NIiKyzB49vD6B8QWoVkE40HMHOAh8rurGFDSIiMiy+jxWSe5i/My7iVTYiyTungALHjaxhbkq6UrQEH64y/whi4hIfcf5c8mW9XZhEqdlF86o2Bhe1rFWl69U2WBXggao9wNOtcSriIiUFy7WNK/3YGMZXJjZskt1X1VhS0MfW5vCX/sx4FFVNtq1N65PPdNhfJlXEREpL5z+vpZzqesMvo5tvBo4Lfg/TBu9CsLMlp6uwOu9E4EDwE1VNioiIrJs9pLfqrwqQUMor3u/B+ybdUNdCxrqalbq2usWEVkFdXVP/AFWIapFebL9wB/P8oSuVJ4eLfqCHPPqyusWEZHZXUSWDVHGeQbPTWwBr9K6UnmG5awjjXReuk0REWlXXcfl89BxvkiYChzgzFme3JWgIVRX0CAiIsvpZKyloWvrSKQQDmKFGd+jrlWePs90Xoo+RUQWT7wKZRWXYymTmzjO+xl6vHBX15Y46GF16Ro2FfWvyj4xL2gYlLi0ZRObJnLtnNs5FYuumlilbVmWkRURgdFpljB5pct5j3s9slTHVb0AS+jUJH8v/DXvUD5I6WMV9c6Ux6Swjr3XTyr7hK4tWNXD3sxz59jG76MBMiIii2yeboU9NLcYVV524rCsvt8B8CC2subx4QWszvXugQ1shofP8vAxGOuk6wXwlp3dZZ/QtaDBnYJNqfn1Cs99PNZioS4KEZHFM2C+sWv7qC8RYCw82fQmfrBWg3XgYeBm4HrgF0tu8wPApcDjyJawjtfKaFrpfA1dGtPgH9Y69kE9t+J2HkW20pmIiCyWuoKGuoXdMnE3zHHgfuCjWFN/2YAB4A3YtMd/AA5hXRdH5i9uaWtYIqzLyz64K7zJx5tvzgc+NuM2Pg+cjoIGEZFFNWB0galZefdEE8KZB16HbGGV/GeA18+x7V/E6qd7scBk0piHOm0OL2eXeXBXgoYwavQPbTfw/Bm2cQXWBLSLbNSoiIgsnqpd5++m+e7ncEDocWzxpxuBn69p++cDh7FgJAWvC0+e5cGhRRwg6BFXn+wDW8O+HHdgfUKTXAG8CAs0wn6uVVkeVUSkK3yQYBUHaW4godcX3jWxg1XsR6m4zPQE/5dysyzqMsC6KKbKe2OP1VuWWqxF15CtCX4q8Frgh8AXGM2jfS/2pv8X4CzGR4jmrdamQEJEJF9Tq1yGJ6vrWBfDX1bYzouDsjUlfP0DrJ75jZr38SJs5kWKuugY9jpKzUrsShO9tw7kvYGe8OkRwNOwfqEHsOadfYzPMRYRkcUSHp89ALl4xm28H5tZF7ZIN61Hc90It9NsKuxwMGfpdZ260j1Rhs9z3SDr0wrXEm9T2/sXEemCLbLZCWcBn5zhuT85vE5Zh62T5WCo23dpLt9EGCyskU3zfN+0J3alpaEMDxjWsRe/h/bzUChYEBGZzs9614LrPcAzKJfi+GtYazOMJ1tq0hrNBQ3fIwui6hS2MPhsxB5Wb5417clFQUNXWxsgCxy8WWdSquwmKWAQESnHs/36IlM+y+1E4KXAV4E/yXneR4Fbsa6MDcbTRzc9i2KN5ron3oGNN/CgoY46K28ba9h7vkmJFS/bPhOfRxgphf+Ht016XgpdDr5ERFIKF6vqYZWYpzi+FHgiNq3x2PD+PWT5HLaYIRVyTbysTa4TcYzRWQ11dleE29rAXscp056UFzR0qaLz7FzhNBj/P2X+7mnU6iAiXeXHVciOq030tftx/ChZRenN5pB1QYf3udQBA2RjL5oMGuLpluH7Hn8Gs3wm3rITr58xNZ10XqV6JLh9kVa4zOPNQ+H0H++eyHvzyrZGzFsmv1awICJdl3r552n5AsoeW5su7w4W4DSZ8vnbw324sKuiymuLp8z2ovumjmnocktD3pdm2hfJI9nUFDyISJeFo+2bPCGqc7tNT1X0QKqpgZCQfxJfl/j9KfW55rU0pJzj2ga1AIiISFVhADXAFplqyv2M1tNxywAT/p+VP/+9kx60KH3+y6wrLTciIjKbAXBPg9v/UfR/uHBjUyYOhiyajqgzcRERkXFeb65jLfPvaHBfbyEbDOn5K5qmoEFEROamemGUZ1JsWjiDIhyX19TnceKkO4vGNKhJXUREIDuRXKRp7G3z9yTFCpTbCfYRmjh7Je8L8CDZG1G0ipmIiKyGt5JlaxSzg82a+HqCfd04vE5V9z5q0p15QcMPyZbKFBERSdEM3xU72PuxDbwswf7i+rjVE/e8oOEtWDIJfUlERASazUXQRX1sOmQKD5F+ue/Li+4s6p86hIIGERExD2Bn2GqBtrpxDVtEK4UHGQ8amv4cTi26oyhouAMFDSIiYu7GmuMVNNj78BDwM4n2F5/Ep2hxOK3ojqKg4bukGRUqIiKLT0HDqK8l3NfDTD6Jr/sz6QEnFd1ZFDS8roGCiIhINz3IatUJ8WsN133YBbw4YVnCE/gBzXcTDZgw7bI3GBTu+3vAycD+4f+anztd3pvZx5qXTk5cFhGROt0NHAD2tF2QFuyQrQz5v4E3JN7/97GkS/vJckQ0VSf77JBdeXdO2ukFwQZERGS13UG65bEXzQCbVXgr6QMGGG9taLqlodC0SOX64fU2GhgpIrLKvoxVXn4muqziStNnLhwBPpW+OIDVwUWrXSY1qXvC/QAbFOHNFblNFgKoe0JEltttwOlYdshlzhDpQdEAy1ExAP4NeFFL5bkBOB/YPfy/yezM3kiwO+/OMn0if4GN3tyFUkiLiKyyb2KVyrJ3W3vduIO93ltoL2AAywoZ1r9N1sXe/fG+vDvLBA3vAD6JvXGpFugQEZHF85PYTIpVsIZV1vcDl7RbFLaCv1OdvOe2jpcdffmrWH/WBsvdJCUiIpPdg9UFsa4OkvSVnfPKfgD4dNri5DrWwj5zp13OMmXj+cB7sNGj8SCYLn5RRERkdpdifexHaacyq8sgug7P4B/Cpjn2gP+eslAFwvWgvJxx+evi0zkvyrtz1nmeb8O6Ko5j3RRbkx8uIiJL6BpsPYpwYHyPbo1762EV7jrj4zTuBc5ro1AFPBtn3vtb93vun2Nur0KV5BBvBv4eOIwFDf5C1NogIrIafh2bfngYOwvu6gmkV7gbw7+PAzdiMxUWTao61t+Tzbw7q2aU+nlsjIMnvCiKgEREZDm9HvhrrCl/i6wFumsnkD5D4mHgSuBx7Randd4IMHNGyGleDNyEfVm6+EVpQo/uNdGJiFT1emwZ5bux5Eddqwd8EOQdwB9is0NWnddfuUFD3gjYWVwK3InlIi/sA1lR6rIRkVXxKGycw0XYqPsurE9xBOteuRp4TctlmSb1yeiAgvigjgUvvoVFJFrQSkRkdV2GjXN4mMU+YfLplV/GslsuesAAVr96FkgPHpoOInK3X0dF/wKsm+IIo6k3B8P//dLVObzziKfGiIgss18GTgEuB74E3AXchyWEOsp8XdlxnRLWLeH94fa3sDT+9wM/BK4DrsDqvudVLEcb1knb0rAOnICt6Dli3u4J9zXgTOyDWMXgQEREMm8L/n431n1xKnAOcJCsO9svnhsgL1VyPEMvb0Epv30nutw+vNwGvHG+l9SqsKUhlT45MyjqChpegy1stRcFDCIiknn7hPveiY1/2MQWSPKpjzDeFB9XmH6Cuj68PkY2TuG3ayj3KvNAbWzRqrqCBrAFPU4lfTNKFyiQEhEZ9462C9ARbdSpA3JSSdc5ePEGujnlRkRERDLeitNo0PBrWJIPBQ0iIiLd5fX42NTZuqdJHkZBg4iISJ18TEfK+rVHToKnuoOGa7DAQUREROrhM07CGSVNBhA+U+PUvDvqdD9qaRAREalT3uyRft4Da97nWJbnuoOGd6CgQUREpAmp6lePDRoPGqD56KdrNP1URES6xMdPJAka1NIwTu+JiIjMI65Hmjwh9W0nCxqKXsyqnXUrpbaIiNQl9UqXYzFCnRkhXZ/RF1ZnpTkp0iraT9uBSuolTUVEZLn0GF+cq2m5DQBNBA3xTqGeijN8Ab6a2TrwALaS2h3A3ViCqR0sQjoDOBdb/vQAsH/OMlSl1gYREalqk2xVT8gW+GraWPdEE0FDGCg0UVn2gW0sMPgB8NiSz/sq8CTSvdlOrQwiIjIPX0EaJg8BqFNu93rKyrMqX+7U3yRPOnET5QMGgKdi67tvYUFHEwFN3pusVgYREZlHWwtWjVn0oMEr4Xga5yHgiRW29yzg+4z2DTUh3LZaGkREZB5+shxnhEw+2H7RgwYYH8F5HLhxju1dT3MtDSIiInWLTz5bm5nXRNCQd2Zd9QX6+APf5g5wFLiuWtEAeBUWeChoEBGRLsibKZiiDhurz5sOGupomg8HLq5jsyN+bc5tHkaZK0VEpBvCrgk/kfaT8aRd4Km7J+aJjHawQYyHaijHfXOWRUREJJUNsjprndHAoakxerkzDbvQ0uDC+anzUsAgIiJdEXbTw2hLQ5OSd0+E/6uiFhERmZ3X1SnHM+RqOiOkiIiIzCcMGlodj5dq9gSopUFERKSKMGhodSHEVC0NChhERESqiWdMtKapoCH5NBAREZElFfcK9ILrpmZB5gYoTQQNHg01tWBVHZoqV94g0EV9D0REpBt2MZrssMzK0fOevCcLGkRERKQZZYOGeXV2lUsREZFV1lT+o5kpaBAREVlsvei6NQoaREREuqPVcXIKGkRERCSWGx8oaBAREVlc76R4eYYm5Q62XNWgQVMhRUSkC9aDv1ONaRgM9zuWsnpVgwYREZEu2CD9AEhvZdCUy5aoVUNERKpYn/6QRvSAnfhGBQ0iIiKLq616egBsxzd2MWjQWbuIiKwKr6fb6KJQS0MLNOhSRESqarOeVtAgIiLSIbMsUlUXP9HtfNAwIGcKSMXtpHzz1dIgIiJVnIgNhpw1cKijjjsa39C1oAFUAYuIyOqIg4WUJ7zH4xu7GDR0kQIdERGpoo2BkF5nPRzfoaBBRERkcbW1smUPBQ0iIiKd0uZy2GNBw0YbpRAREQHeD5wE7B9e7w3um7ZIkw8y75M/SH4AfAf4lXqK2po2kzuNDYRU0CAiIk37U+DJwKOAE6L7vP8874x6kPN30W3x333gUrKKbwcb2HcUOAZ8Gvj1WV5ES9oIGnyG4VZ8x6oGDUq4JCLSrE8BTwdOmfI4DxaKpqf7/UWV57Rp7X7fBrAbODD8/03DyzHgJuAq4M1TytqGvdMfUrttLGD45fgOjWkQEZE6/SNwG3AZ1uWwQ06SoBb1sLqvj1WOA+ACrBvjFizYWSRtdk+MWdWWBhERqdcVwIuwQGGTrLLzjIaLIK9VYxfZOgtnAecAdwPXAj+duoA52ggaPKgao6BBRETm9RXgQmAf7SQimlU4cNIr5Q2yvvzTgFcB1wMXJy/dqDaChtzFqqCZwizql0REROp3E3AJNlZgndG1EhZN2MKwjrWI+O19rMzhGfa5wK3A5akKmKOtlobcoEEtDSIiUtVd2HRJr3x9+mPcJTFphkRKvehvb1kIg5xBcPuB4fWrsfEPv52spJmVamkIZym0/WVp0yq/dhFZTndiiyn51Lw+VqesB48ZYJWPBxPTZjr0ci5l5D2vl3Of/z+pNWQ9uv0EbJxGW+MbUtcfRXkvgDQtDYvYv7VDM2Up+jHE85JFRLrsOuCM4P945eCiv/P+n3b7NCnqlf1YjomUKyS7g0yejppXpnnK6bNKbsq7U2MamreofXsiIlX8MTbLIDQpEFgLLqmPhZNaIKr60LyFmlHq98wDlLEU0qA8DSm0EZmKiDTlhdiZ96p6VuL9tVV/3Jd3o4KGNBQ0iMgy+CvgTFa77jgLy0mRSur32ltj7sm7s6nCKEXzuL9ruwAiInN6MpYMaX3aA5dYD8t2mUobQQPAb+Xd2cRAyC4EDKnL2MPmMYuIdNX7sFaGVQ4YwCrxM6Y+qt79LYxVbWmYNu2nCfuxZWBFRLroWUxIL7xCdmHvwZWJ9tfGlMvCtUKaamlY9KDB56HWrejD3QWcTrZi2Jsa2LeISJMez+iaEqtqHdgDPDPR/janP6RWA+BQ0Z1NfPh565svmmOkL9sA+7K9BvhY4n2LiMxrjcU9pqfk70Gq4Cl1kNYHHiq6c1UjxodoZ1zDbiyz2EuAG4FPAu9OXA4RkVl9iGxdhlUPHMJsiX+eYH9tDIR8oOjOVe2eOET6Mu5gLQ3rwF5s/fZzsTnPv0K2WMokcStOnJo1fE3xjzt+3LTPyfu1wst9wIPYVJw3TymriCyPx5C1NChhXfY+PCbBvtp4r+8tuqPJNNKLnNToMOkH84QjjsPsaAOs9WGWaHJawBO+93mPnXTbpGDC7zsO/AwWfB3C3s8XTCmTiHTX2YwGDavO34sUsyhSL8PQI3HQ0IUvVW56zIblvS++/GhYUZeJ4tt+f/diq7+dSpan/EGs2+e7wHPbK5qINOAA2bisVdfD6s4d7FiYYn+pPVh0R1MtDXmrW7Zd0YWOMt5M7z+GJlfl7Ed/r5F+ZGxdvLUEbHYIwD7gNGyg6U3Ap2hnKVkRqdcGdsxS0DBaNzT9fryLdsYeHi26o6nZE3nrqC+S32G0iyKszJsqb9yCsIz9gj5mYxfwBODt2JK5H2yxTCIyvxQrIneFn2j2sKmXTTqV0cCkaOnv2Dx1y/0UZIOEZoKGcEDfIg+KfAhrVvdV2CA7+2+qMg9XfIvXbF9Wa8DPAd9suyAiMpdFPZa3qQdc3uD2N0h/gjmx+77poMEtYvBwKxY0wHjXhNRnDeu2uBgbXPPxdosjIhUt4nE8tbj7eoBNpW9K2MKTKnC4f9KdTSZ3WvSz6JdiTefbjCbrCGcRSL1OAl4MfK3lcojIbHycmo6L4+9Bk4Mh2xhD8qNJdzbV0uBjBBY9cLiXLAcBZOVd9dzqTemRjXe4A/hwu8URkRkoaBgd5O8UNNQgTCwUD9qoqokA5GZGgxypnyeh8sBsAwscTgF+GsuKKSKLrcmxXl3l9VqTgyHbmDlRmA0SmilQ2IxVV8DgAUjdKUy/N2FfUg8f/BlHzJvYj+3ZpFstTkSqCRPSpTbAupG3sMRyx4aX48Pb8lZkbLJVJJy1sEazYxpSDpj3E7zCdSeguaChbmEAUph0ooI3YqmRPc/AtEyKUr99WCrtf2+5HCKS7w+H13lBQ9m09FX0sbPeK7GTjF1YBb1neNk9vO29wG1BeXbIZsaF5exHl6rlXYv+brI14DzqbcmY9jkdZ0punabGNPh28/p/qvDthQuF1OXT2BsFWWCiprh01rHI9kLgX9otiojkCFsZUh4Xt4HPYYOnJ3kbcD5wO3Ys75Mur0SPZhP0pRzTsIPlL5qoiaDhOM1NufR1D+r0RvK7KRQ0pLEO7MfOGp6MuipEVlHeCeF/AK+aYRsfxjIZetdFihU5BzQboOyi3tdQVK/5hICJgyChmaDhYUZbBuqufA/VvD2AzwJH0IDItgywJri9wDOAz7RbHBFJLE6y9zBw7Yzb+B2stcHPzlN0NfdptqVhXwPbzKuTt7Gg4c5pT24iaAgr9TDnQR2zJwbYssx1+x/AN7DoVGMZ0grHq2xg38mnocBBZFUNsBaDt1d47ncY715uclBk00HDXpo9mfX3ZXt4mVq/NhE0+MjLeAbFvPzFvbGGbeV5JhZl+aqTkoavkgl2hrB7eHk+6qoQWUU9pkz7m+BGsiR9OzTfetzkyp/vIlsorCle1/l7dd+0JzQRNBwJ/q57hcumvwA3oAQmqa1hPwzvg+xh0fUm8BTgqtZKJiJQfPyuOxdP2DJddeza75AFDeFaQnmXecsJza5UfAajWYrrFvYA+H4mTrf0B9bt1dgIzLq3vQ1cX/M2Yy/HRvBvBxdpln9pNxlPVXsQa3G4poVyiYg5cXidN1WxzjFrXtH3mO/Y64MTw8We6ggc8gZr7sUS1TXhBVira1MtGeF7sBvLkDxxuiU0N7/0u9TbKrCNRZ5fqnGbRV4G3IRFXE1M8ZR8RUu+HgEuAf65pXKJSDp15HzIWzSxTp5sCqxZfzfwFzXv47PYWj15ifHmUfTermOzTqZqKmh4KpaEaWv4v7/JZccLhIk4toaXe4C31F7SfBcBX2d0MStJy993T+DyY2iMg4hMl/JEz8dhPbnGbf4+drzbTbO5McJMy1BiPAM0m8nqa1iQcIQsO9csL/44NoJ2C3tRj6m7gFM8H0sscnhYFnVVpBP3Ge7Fph79OBaBi4gUiRcgrEvYEhpWuOvA6cA/1bCPPwReg3UJNZ3YKXwN25SYbgnNBg0vxpIm5a1FMY03L3nq0LbOMH8S+DiW8MIDB3VXpBMOhtrAvg9PQ2McRKRY3loUdfH6a4PRes3X0fn8HNv+LPBK4MA8BSzJy+2t+seAH5R5Ym8waLz1/QbgLOxscdeUx0LWJbAG3A98G3hOU4WbwfVYHvDdNDsvVyY7gn0/rsOmyYpIsz6KrUjr0wvDs+06z+bDQZbXA5dW3M59WMWbajkAP8kdYJXvw8D3ga8Ab5jy3D8CzsW6xM8e3uYBSVPrODkv83Esv9JpZTaQIj/3RdhiIgdneE4P65r4d+CnmihUBRdjg/Geif1w2liytAnhtKlZ7ktlgHVReaC2BzuTuBjLGPfslsolsirqmlKZircI+8lnE8fqsFIPz9jXsbruAPBY4LVkU8p9iYVdTD7xDHMn1N1FEX+Gnp+h1CBISLeox3nD628AZ2Jvmmf/8yQc61igcDd2Fvlzico2C1845RPYwJczSLt0ad3ikbRl5mOn5t1U4Y90AwsengX8X+AJLZRLZFWEAcNadHvd+4H514y4G6u04/EH8TbnCYTi53lw4sdUzz8D2QJamznPm7TtFItVed17d9knpAoa3JOCv/8nNtjDF+R4GHhT4vJU9Z+H1x/AEhCdg0WX64wnzAh/ZOFUoFm+rGHfWXx7nrL7KPpRxc8f5NyXUt6Pu48FmadjLVI/nrpQIivC14Xoykyy+xhPIy3jPLg5ig0FKCV10BB6W4v7rkvYX/VerMn8IDa/9iA24t9bIvwDCgegzFq5591eh2k/sEVrmvT3chdWrouxFfGe0l6RRGROk1oFZnEbdhKRqhV4kY6Ns/BZjWC5lUpJMRBylb0f68I4iJ0R78K+yBvBZQ1rai/KVFY04KjqjysMVPIuW2RnFos4biN+vd4KsgV8CwUOInX7G+BnaG5wXsjz83yT+X7LD2At2ZMSRTVxMpR6f/PYwQKHY8ww5rDNloZVsMjdLf8T62PbjQUtPjjnbOwLdDJwAtlIXsgGgLb9xQ+7SjywWcMGHn2D0W4wEVk9HjRIsXXsZKv0eAZQ0LDKynYPfRK4EGsx8RUo2xS3wkA2mGc31lXxA2yciYjUo2tN0veSDcCXceFsj6/O8kQFDTLNy4O/b8VyboR9hfEASW/CrDros4x435ClKO8Dp2IJuZpaSEZklXiXQV63KbTf8pjnweDvSYO9m7Ao78ekmXE7ZOtm/MIsG13EPmtZXOdjXRjXMrrefd7BJNUBxfsJfQyGjxN5BJaRVETmE/fTD6Lb+8Fl3sWm6vJ8bNFBH+wXl7UpRWPF2hrPMOnz2EWF7LoKGqSKy7AZItdjU2Xzlsv171aTB5Bwamu4zx52sDgZG+MgItX57zu8njeXQgr3MJrzoMdoRstFaRFoQpgvYo3x1Npr2HiG5866YQUNMo9LgH/BWh22sS9h2MIwiC6peIvDXuDR2IqlIlLNorQezOoGbGaAZ4hcYzQJ0zKLp9HHXbnb2BINM1PQIPN6BXAF8EPsixiuBpp6pkXYBAkWOOzDZlV8OWE5RKR9L8fGNnjW4VUTtvZ6dklvITpMxVlmChqkDm/Fpmr+kPGc6m00AYbfax+Y+RhmHCUsIp33feyY5JWmr7WwSnWfn7yF6a1vmmdjInU5H/uRHqedfs843a1f78ZaHJ6EDeIUkfLaTiM/j3/Fxl35cSFs/Vz2LoqYt7YcZY60+woapG7nYU2CYcpsj3I9ym/aGha4hAc7Hwx0IXYgEZFyfExAOFMpvF7kgYVvBW5ndP0ePxasQtDgr3E7+H+uWWUKGqQJp2ErlR4ja3HwH2nRgaXuqVu+LkWYhnsTW/3umcDn5ti2yCr5FUYr2XiK9SJMLZzksWSLWPnZdrxY37IKZ5htY7PJ5loVWEGDNOVJWL/ZUeAI9uPcYPSA0vS87vAg5mdFm8PyXAJ8vKH9iiybsIVwUYODSb6AtT42lXBukQ2wE7h7gCfPuzEFDdKkJ2EtDpvkZx/1rGQpp3T5QKD9wLOw5c1FZLm9EvgadrZ9nHRdpYvAW28/VcfGFDRI054JfAfL4bAd3ZciAVSeMHB4aeJ9i3TRMpyZPxNbAnqb0fFWyyoMkD5DTQsoKmiQFC7Bfqzr2Jc41MaP1rPC7cHSTd/SQhlEumRZKteLgbtYjdwNO9jMkX/CljavhYIGSeUS4D/IBkXGA5LCv1McoNaGZdmHreB5CHhfgv2KSLEUv/3HYIHDsgcNh7AWhlfUuVEFDZLSj2Fn9b6Ou6d09VHM4cDIpvLch/2Y68P/dwEnAP8V+KOa9iOyTMKZBk1PV/RVcpt0PrZ8dryfMKPsILrNx0HErz1ezKsfXXaYfhwrel64zzj/TJEB1jXxWeDnpzx2ZgoaJLWLgH/EggaXN6LZE0S5vB9V3mXaoMr4TCZc6Go38FrgY6VeicjqOEb+tOi6ecrjePxTE84Brgbux5rxfYq453EIX+OkZabj+/3/MDdEL7o977GxuOXVA4lQGFwcx2arXY8NPv/FnG3OTUGDtOE/AV/B8p/7AMl1RlsdNhk9u6lL3hxztzEszwuBK2ver0hXvQsbNLxJ1jrYtFRdBy8A/h5LgX+U0W7T+NgTr94b5q2Ig4IwWAiTYYXHuDgQiaeIh4+H8QDEb9vGppHfA3waeGLpV1+BggZpywuBz2PRcfg99OVr21jsag0bHLkLeDo2XVRk1T2GLIiH5uuNsIsghdcCF2C5HH6ItTh4ABEmpZt0wkHwuLCyn9T1mhd4xAFI2EXhx8XQNpaB91rgXGoc8FhEQYO06T9ji0gdwYKHsEkyZba2vNUx17FltW8F/jpROUQW0UWMB/ZN1h3e/ZHay7Eui08CD5B1U3ga7WnHo7xkcuH/kJ2cxIFF0fZ8ppe3KHgQcQwLFj4PnA68bJYXOo/eYLDsWTSlAz4HPGP49+7htf9IZ21tqJrxLR58GQYtu7BcE9cAr59xuyJdd5Tsd9k0Dxi+gHUdtOn/AJcCj8SOAd51EVb68SDI8Lgza2AVHoPC/YT7PYwdi74IvHnG7ddCQYMsiquAp2B9pz4YKqy4y35R50kTGw40Cs8CdrCxDkexQVNXAf+twvZFuuZarKvOxxk1zZvirwFelGB/ZX0Ia3E5DTgFm6rt4mNU2E1RxxTyO4Ebga8DvznntuamoEEWyVeApzK63n08sMj/jptLY1V+qAPG9wdZk2B4EHgQCx5+tsJ+RLrioeH1JlmXwTpZUF837wq4GnhxA9uvy4exxe9OxhLEHcDGQ/k07nCsgnd3hmO1/ARlm6zbwbsc7gZ+gE0BXzgKGmTRfBpb6/0g49ONnFfg0wKHeZTtU/Wm1K8Cb6+5DCJt+WPgp7DEZy5cHjsewe/maekbYK15A+CvgNdV2IY0TEGDLKKrsERQvtCVN/WFSWXqavqbJDxbyJtL7bevYYM578emPd2Gpc1+W4NlE2nK1djyyQfIX2hukjqChh3gT4HfqLANaZiCBllU/wg8n6xZzytnb9bz5tFU0zKLgoZ4fra3fuxgB8AfYOlcj2BNvYfJEslM+vGFB+x4pPU+ioOmML9FOGp70oju+P/w9cTTw7zMedPG4tcTJ+gKTUrCtcV4E2+8n1kPXPH0tkniqXVFj5n2/Ssq47T9x2fuRX3moSOMJkzzxw2w79tWQXlOAE7CWhTOHl7vwb6/8aj/MuYdU3QM+96cVOH5koCCBllkX8IGH20ML2GFXOagXadpFZUP4FpjdBBnXtIXgvvyyl9USRRljQuvw8dWnXnifxdVst4nG4/2jh8/aWpe0XtZNBo9fv3xfX496T0ts89Zby/6XCZ9V2YJNPLee78OP/O8fcSvOQ7CwPrT/fcF9t0NH1/UylakjqDhYeDUCs+XBGZtehJJ6enAl4EnMTo4MlWgUFZccYYBQfh/1YRV8eDMRciv4pVLUStDHQFdXiU3aYrbPBVWlXLN85iiMk56XpmWklmCRR+klzdrqC090qSQlooUNMiiexrW4vAERs8kFyFwyGvW93EX3lURtzRM2ta0/cxiUqvErM9rYj9lTAsIpp2Vh2Z5bFnTPrO6t1mVtwjFPNgNcw7kDTxOyVuxZEGpe0K64utYi8MxRhPNxH3VTQUTk/qn426IvFwP4Xb6wf3hdvL2OcvrKeouCPdRdDY+7cy3aExA3FQfXtdxcMkbaxHf35R4wbTYLGMTqjwv7oooOyajTDni7qxJZajyOVb5XDwfyj3YKpSygNTSIF1xKbaI1JMYnSfuA7x2DR+X14dbxrSm7VnOKtcn3OeVYJmAoErLQBykzHLwjh9bNKYgZSvPpJaFJhV1fcxiEVob8r5ncRfatDKk+rw9H8qVifYnFailQbrmGmxw5O7hpc9opro4BXRZqfrDRdqU1zK0KI5iMycOtl0QKbYIA6pEZnEZ1lXhOerj1LZ+u6JhkXGLNCYoz6G2CyCTKWiQLnoh8G1satZxiqeWiUg3eHfJzW0XRCZT0CBd9TTgFuxgc5xsqlaV/AQi0r4j2EwpWWAa0yBd920sk50vBhNnPZx1yqMCDpH0Bljq9ce2XRCZTC0N0nWPA+7FUt/6nHMXjwDP+3+R+3dFlsm0M9S7k5RC5qKWBlkWPqviABYErBc8LlypT0QWwyHgxLYLIdOppUGWxWXAt7D16IsW5wEFCyKLZhv4j7YLIeWopUGWzWeAZwB7yU9e1kaCIhExPlA5bPG7Bzi9zUJJeWppkGXzEuCr2DLU4UI8oIBBpG3+21vDWhiOY4vSSUeopUGW1UeAn8IGSE4a4yAi6flU6R8Aj2m5LDIDtTTIsvoF4IPYAKu4xUFE2jXAfpt/23ZBZDZqaZBl907g9cDJUx4X97X6bSEF2SLT5a2ympcH5Qbg4iQlktooaJBV8ffYCpmnYYMk82wzuhTzvMsDrzIly1pdHoD7UtebZN2DnrX168DTWymdzEVnTrIqXgF8HEsE9RC2boV3WXhAsIH9JuIFrxQwiJTngWIfCxYGWLDgi8ndgAKGzlJLg6yifwIuJZuW6YMl+8P7PXAIx0J4mmopRy0NAqMBdx/4V+C5LZVFaqCgQVbZV4EnALuH/8fdE97ioHTTs1PQsHqKFovbwn5b/4atUCsdpjMnWWVPBT4K3IW1KHhrggcL62RdFqr8RKbz384ACxYOAw8Af4MChqWglgYR82fAi4FTsWDBuyfClgdY7PEN8dl93ij2tsoiq2MLODq8vgN4YrvFkTopaBAZ9UngKcCZw//DLou8qZgDqrdExD++pivY1PtbZanWPpl2AJ93f0VdDtMcwwYe/8Kc+5cFo6BBpNgngMdirQ9hnodwrENI3X3Lr+oBs65gwZv+Z9l+E4HDgKw1Dqx77wjWHfFR4B1z7lMWlIIGkXKuBM4ADmLLb+8ly9+wzvKcteetz1FUUfnj8l57m10j86qjAp70umf9rsRJkoo+Iwrum2d/8d9ha9sxLKvj/cDNWNp2WXIKGkSq+TPgbOAkrCtjL9nAyQ2qBxJlfpCTKvFp24orlaIyxsFAUTN1UcDgZ6JFZV3UA0/8evIq3zKf66TXPCmgmtSFFO8/7/OJnz9PvhGfhnwcCxCODv/ewoKEm4G3zLhN6TgFDSLNeiejYx7yzg6J7uth00DXottDRT/czYLHFz2nl3PJux3GA4m4bPGYDw+cZm29aNukyrdqS8OA+YMpT5BUtN3wQrCfI6i7QGqioEFERERK0cAtERERKUVBg4iIiJSioEFERERK+X+M+ANOcaq2gwAAAABJRU5ErkJggg==" alt="" aria-hidden="true">',
          transmission: '<img class="ref-gear-img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgwAAAIMCAYAAACZhvQPAAAVmUlEQVR42u3d23IjN7IF0EZF/f8v57zY43ZbF5IiqvKyVsR5m9MmE4nELpCSVkT8AgD4yqEEAIDAAAAIDACAwAAACAwAQAWnEkBKU398aVl6EBgAIeGZGggPIDAAAsLT9REgQGAAQYGH6yY4gMAAggKCAwgMICggOEBJfqwShIUONVZnEBjAIYZwBgIDOLhQe0jPdxjAYdV1HXy3Ad7IDQMIC9YEEBjAwWRtAIEBHEhYIxAYwEGEtQKBARxAWDMQGMDBg7UDgQEcOFhDEBgAAAQG8GRqLQGBARwwWFMQGACEBhAYwKECIDCAsIA1BoEBABAYwJMn1hoEBgAAgQE8cWLNQWAAAAQGgF3cMoDAAA4NgFedSgClLSEMEBiAiuHg0deeNURE8VqDwABDn4S7Hl4reXAAfuM7DFDvybzje/REDwID4BAVjkBgAByc/d67j0lAYACHhNAACAzgsAQQGEBYUAtAYAAABAaAh919y+A7LSAwQLrDwRU8IDAAAAIDwC5uXkBgAByKgMAAALThr1UCfM6fuv6nDn9SF4GBIZv9O0t9wJz4wf9eoBAYGHLweaIAs+Jd/w2zQ2Bg2NOxAcAd1i+3QBXnhdkhMDB40xsAew5DmDAzzA6BgaGb/qPXZfODefHsazQ3ivBjlXU2fnid4OBt+JrNjSLcMNj0058aDCrMjFyv3Y2DwMCwg8zmB/PC7GjERxI5N0t4P/AvDo8ZYWHC+xIYsEFsfocg9pX3JzBgY3iPkGsvxaD3isDAwA3hIwrsUfPCexYYsBFKvW9DCGHb+0dg0PxqAAK2WiAwaHj1YJplf6AmAoNGJ4atg5+QqNmjV96KuYEzS1Pxi5s0eMb6LGtAob289Omt6yB8X8QNg7AwpVae1qhwE6BPzda03DBo6Ow1W+pOwX2+9OvltXfTsJkbBmGhY/08pZGhb2Nzn6OGAoMG5sU6Cgr9rYK9G3rWzO3ARxIat1o9V4M6uzrVv2bE3lrbYwKDsMD/h4EaYzYgNFzIRxIGghoD5gQCgwYFMJMRGDQmAGazwKAhgf/w2TRmtMCgEXHYAWa1wKABATCzBQaNB4DZLTCg4SALH+3cV/cOtTfDX+AXN81qtGUDOeTgDT3b4Teu+uVOAoOw8OJB5VfWAq+G21V0dggNT/CRRO+w8Or14bKJaHiosX/vV1wTD0gCg7BgIDvc4IaHBKFBYBAWhh5ObhuEBbVVQ6EBgUFYMJhx4KmddREaBAZhwQBwmKkzH9drWRehQWAQFjoMGocY6t2jTkKDwCAsDB+UhrP6qHu92izrIjQIDMLCtAFkKGMNah3YQoPAICzYgIazQyr1mix18FqEhjcsXoRaCAs2lrBkv+tNa2CvCwwaV00NDqb16VJ/e//d/C0JDbvrNYa6U2hNQ5+aE3yzYMNvGMIwUGNBgSY9u9RbnQUGTVq9SdUavatnzQiBQXNqzhY1FxKo2L9LjdX+KoeNrykvfB/L60L/mg1N3s+4p+1pgUFY8J4EBar3TefetScFBmycNO9NUKByH60htfUQmnFhBn2HIWyY0esiJFC9l5d6mtl3csOg8bq/XzcKXNnLSw+bhW0XZMgNgx+NmrdOhg3V+1kPm9+p+E2Pmi1jDUINabanQx//qI5+I2SGhRhwwxBFNgSvr536Ubm/9a9ZXsKpwTSY2oD+LlIvNw038qVHAwPAzJzzkCowaHwAsxOBoVvS0/AAZqjAgEYHGDpL234sITBocAAzlbGBITQ2gNCAwKChAcg6Y1t+LCEwCAsAZi0CgwYGMHMRGD4SGhdAaEBg0LAAmMECAwAgMEi2APSfxe1+UkJgAAAEhmGJFgAEBgDwECcwAAACAwAgMAAAAgMAIDAAQDehBAIDACAwAAACQ1+uvwDM41+/Gv4OCIEBABAYBqZaAHMYgQEAEBjeIcPnRtItgPkrMKBpAcxdgQEAhIXXtfwrmQKDtAsAAoPQAGDOIjB8ZmlmAGHB+SMwAAACQ8uU55YBwFwVGNDcAMPn6epccIEBAGGB8YFhaXQAhp43AoN0DGB+IjBMSX2aHqDH3FwTiu+GAQAQGJKnP7cMALXn5ZqyAJNuGIQGAGFBWBAYABAWEBh6p0EbAsB5IjAgNACYiwKDVGhzAEyah2vigky9YVj2IgDOD4Gh8qK7ZQCm81MRAgNCA4D5JzDU46MJAGHBeSEwlG4CKRvAOZHGqQTp07ZGJXsI1aN4SJqQmiKsUYFmNZCp2Mv6FvO3ETcM/24K6QmDdu9rM3ypdi7wdzHcMJQZwBqX7AFBX2PmNuaGAQzTTO/PkIasCcoNg8SL/tPv6HW99x03DJ83i6GNwZmnJgY4woLAAA5FHq6TYQ4CQ8qUmW2Y+70MQoLaeRJk79znE37To+bh2sNOWFBPzHuBQROBg019Med78pEE7D3IuL7ehj9s4IZB+sQTr/pjviMwaCpuesrFWqBPWvGRhKZCf0xYF4EfBAYQFBAcYDcfSdQ6FAw7fYE162TpizrcMIDhMnX9BHB4ghsGhwP6wVqCfhAYGvE0ZKBgTc02buMjCXCoWF8HF3zLDUONg8Ig0wNY6858+VFgAAcI1hwEBoNjUvKetvYODuvPzFln7QUGMCzQCyAwgAMCPVGdWwaBwZAovnmsOXoDBAZwICgBeiQND0oCg8Fg01hv9ArWW2AAAwE9AwIDl3K7YPCjd8zAHGv9+/+N5ldDGwDW20BWw9fev2Bvdox6yFsRYbElaz0gGKiv/Wq/6o8vnZoMw8cBtvG/HwN6SmjgmZlTtl+q3zB0G0YGj17p3DfWAH1TuIdOTYOBY7jc8JqjYY8JDbxrTqXspbNI8YBeB9Ky1+Hh8y/F3s/0kcT0oeHpRF9N7w1rhfMhcX+dGgFDxnBI9n6jeM8JDeyeabf02JngjYP+8pTaKTgIDbQMDueNbxQHBPqgc3Dgvb2gD24ODsdNbw70mbDQuTZmHe367bjwzdhAGNQfH4bCQs86mXmC49X9trXnDpvGJhAWrL2a6UnMwe+cNgo49IrWz4yBz8/ft8+ZY+OLBU9ywoJamof2T5O+O2wOzW9jWG97SI9iNl4dGGwK+PhQExbUF0qHhiPji/JkRKO+s85qbUbaUy1677ARwGBTcxAarggMwgKe2Bxcam9eWuPmM/PQ/JpdWLC+9pjexezcHRgAYcFaYH0H+ElgkJI1uSc0a2u/mZ/Wd8gMPTS75sbaWhusr9CwIzAIC5rak5m1tf969rL15a2BAc0MYM4OewA7dv7jaOIBT2TW117s1tPV19ie3MQNg8ZFWLBmdJ2/1vuNofXc8Y9qVAY8iVnn2ns0kvW2frpurzrLXnQqgUMDwNweHSQeCq3nE/+YJgO90GkNzTUEiWcKFPFQLULTcHP61R/oLfTOjT14Di2KzQnAjjOk7QP2OXhRkeL1Epk+mvDlx75nTosQcTZfJNBfVAoNzJgfWfvty9B6NlsEAKhydpUKqt/94qasv1nPL+SYIZJtbuY8AU7vea49z1oEBpsaAJxtZQKDGwVsZKw1+m+/eCUwuA4mZdOC3kdouN6heKD/sOZQPTAAgNAqMEj66D+sPVTghoGMfIaLPYDQKjBI+ABQjRsGEFjRAyAwAAACA/347BbsBQQGSM9VNHoB/VckMNikACAwAAACA9Tldgs9AQIDBfiSF9gTCAwAgMAAAAgM0JzPqtEbIDAAAAIDACAwMIJvg4O9gcAAAAgMAIDAAM35Fjx6BAQGAEBgAAAEBgBAYAAABAYAQGAAAAQGAACBAQAQGAAAgQEAEBgAAIEBABAYAACBAQAQGAAABAb4XSgBegQEBgBAYAAABAamWEoA9gYCAwAgMAAAAgP051vw6A0QGAAAgQEAEBgYw7fBwZ5AYID0fFaNngCBAQAQGAAAgQEu4goavYD+KxIYbNLZfMkL7AUScsMAAAgM8AK3XOgBEBgAAIGBDnx2iz3AZClvuA7FAj2ItYeqgQEABFaBQcrHxsWaQyVuGMjKZ7jofQRWgUHaxwbGWkPC/luvBIaliACw/Ywrcc4dCkpiQiue7tB3AoPBDcDYoJDxPPsysJ4P/D9HwkJL4tzRd3rOUx6M7bGz0QIY5j1lCq1Cg0F+29Md+klg2L9QNiEAgoHA8NLCChG1uGWg+9DXU3okfQ+eD/4jMaQJbFqEBgcB+oEXA4OmcTgACAZ9PXTGrYhQ6M1Fpu1mt/76SB9Z6zFnmRuG9zejzT9r/a23AwRrPOLB99jxj2pWv5ly0JOYdXaQdOtpa8yPAwOaFyDzgxobA+ux8x9HIw95IrO+wnuXXra2vC0woKmxvtYGazvw4eu44j+C5h7yZGZ9rYk5StsZemh2Awzray2wvsLCrsAgNOAJzSBzmJid1ncQ32HQ7EKDNba/9Cxm5vbAoPlBaFBzGPCAdWR4EQYbjfvPOqu1WWlPtei9w0aASwacIae+UDqoHhlflKRM096z3nNraj7aQ+X77rApsDEMPIeH3sRMvDow2Bzw2EEnOKgflAqpR6UX6ymJZn1n7fvXzCy0X67ut209d1R94dAoNBiEPetk/tGq3w6bBhvH05Pa6EFKz7tL+u3o9oYMRDxFqwdmpIejuoFB6sYTnoNyyvs352j5EH5MeaMStNDg4PR+9RyCwuvOBBvLQcnuPqveY9H8MIpGvYb+aNtbZ6JCaAp4fHCuRu8FKBA+V0TafRsaBf3UqmesAXqmcP+chQroiYSf9lPXHsp88xBDegva98tZvMhCBELD13ti3fzfN/wRDLq8ocQfSUweWoaQ/sjeY2pon9qnw/rgHLSRDTh+74/p/WA/OCSw5s8VoOkNQ4fBaSA5NLE37U1rncapBL5cOXztrTcOEHjAoQRpB4KDzAGAXpnI7YLAAA4C9AgIDIZD56RtzdEbTJp51lxgAEMCPQECQ89B4ZbBAYFemMDtQnJ+SgI+HxjCmqAA/MUNg+SNgwNrbsYhMBge6AGsNXpAYJDAuWqIGCTWFwQGJE70gjVl+MOQXhAYwFDBWoLAMGuw+FgiTz84bKwfZprAAHhCtWboCwQGiRxPq9YJEBgkUBxIWBfMdoEBDB+sBQgMBhCealF/EBhq8/0BHFzqTa95aq4LDJoKB5n6gvkuMICDTT3Vs/r6CQ2F+PPWGol7B6Xeqn3IwBhuGIQFPCWrE5j333LDAPmenA2t/9YErgwNek9gaJE2NbLwICTQab0FZIFBWIANB2g0f3+QZf7rzT83a4RzsVBY0MBUD7Z6GDO3KDcM0O8JPRK/NqgWZPSxwCDpMipE7Oxtvck7esh1t8AgLIDQCWVDg1uGv/g9DDXCgmYFcD4IDAgLAOadwCA9AlA9NIw/JwQGH0UAmH1Cg8BgwwAgNAgMXRdeWAA8NCEwCAsAFA4NI8+PqYHB9xYAEBoEBmkawFxEYJAKAYQG54nAYEMAgMAgDQoLAF3m5JhbBjcMNgGAeSk0CAwTUyCA0IDA0CssaHwA54zAgLAAYH4KDAAgNAgMbYRGB2DoeSMwSMUA5qkSCAxd057mBjBXBQYAGB4a2n4sITBIwQAwOjBkSnnCAoA5KzCgiQHM25QPrAIDACAwSLsAmLsCg6YFwPwVGAAAgaEAf8oaYDa3DAKDRgXAg6vAAAAIDAO4XQBAYAAABAYA6MKNr8AAAAgMAPBzfsReYAAABAaJFgAEBgBo/vDW7guXAgMAMDYw3J3sfCwBYAYLDGhYAAQGAPCwhsCgcQHM3I1a/oZJgUFoADBrERg0MoAZi8DwlaWhAYQFBAaNDWCmelgVGDQ4AGapwDA76Wl0ADNUYEDDAwycnatz4QUGjQ9gZiIwFEh8NgDMPfzsf7OyjFMJ0myEpQw/GhbqR9XeDb3cIiy0X7cVERpOw3VbM3Wkw8zRx2Z3Km4Y8m0MQ+LnAyIMXBoccPrYxxC5UtGgG4ZKzTd1QISaonf1r3md07Sfklg2ytj37AtmVO6raf1rrwoM2DC3v1fBgcp9FOaBh9Db3uywjyQ0pHUYveFpNTuW+qr/ldww2EDT35cbB6r2STSsMZkT0tAbhorNudRdrdGrTfvVPC5g8g3DsqG8h0JPk1j/rv0qLFR544NvGDSrOhsSdArkHoTUV2DQtKWbtmODCQ/2vR41dwUGw0PzGsiGiH2uN62Dff4nPyVRtyEi+WubMph938E6mRHCgsAgNBgInuAcSNbF+xcWEBiEBoNZHazDnHp4DcKCwKBRbt+IBrOaqL0QJSwIDEKDIWk4e8pVb4FKWBAYEBoMZwNTjdXLuggLAoPQYAgAN4R+YUFgEBoGhwa3CkKW2qqfsCAwIDQYyjA4NMQb/y2zXWAQGoaGBmFBHdVUPYWF4U4leKnBouAAWAM2P3DPzKg4K4SFZwvmb0mMe7JZjd+bQWUPck3f+uuzA7lh+FnDVdw0hiwweXYICy/yHQaNB2BmIzBoQADMaoFBIwJgRgsMGpKWfI9EDTGbBQaNCYCZLDCgQQHMYoEBjQpgBiMwaFg1hrt7duldc0FgQONeX1vDl0pBwXwwc+sW16+GvoQiXzsQotF7of/6mg/2UwluGDRyxzq6deDuPl0b//eYsbfwtySubWhPEtcOg05/LIf+B5YZISyk5oZBY0+pmac4dvXnSvzvmQ8IDBpcrQxkGgUFc0KNBAY0etJDXXCoKQb0pjmhNgIDGl5dUh1+CM9mBAKDxjcYwaxQBwQGG0ANQKg2JxAYbATvXe3Rq3rWPhUYsCE8LYF54b0KDNgY3icb+JLovNBtVggMDN0gbhUcgpgZZoXAgM3iSQHMDLNCYMDGMciwF71Os0JgwCYyZMHM8Hr5jL9WWe/wjUKvFTAzzAmBAUPAAOAyvhz6nn0ZyV4PAgODhoDN/57DUB3p/MChvwUGhoYHmx/6zIxdc8OcEBgYGB5sfOyp2e8xzAQEBoOOf2rlc3IwS/iEH6sEAAQGoDw3PyAwAA5FQGAAAAQGgOZ82Q8EBkh3OPhYQk1AYAAABAbAE7VagMAAICyAwAA4LPmTLzyCwADpD4nJoUFgAoEBcHB6z1CRPz4FNQ7QNeR9AgIDIDiUCQq+vwACAzx0WGQ9yKLw4eYWAQQGwEEMdOZLjwCAwAAv8hm2tQcEBgBAYABPmlhzEBgAAIEBPHFirUFgAAAEBvDkiTUGgQFAWACBAXCoAAgMIDRgTUFgABAWQGAAhwyAwABCA9YQBAZw4GDtQGAABw/WDAQGwAFkrUBgABxE1ggQGMCBZG0AgQEcTFgT2OZUAthyQIVSCArQiRsGcGCpPSAwgINLzYGf85EEXHOA+YhCUACBARAcBAUQGADBQVAAgQEQHAQFQGCASgegACEggMAAPHVAhhoAAgPg4ATK8HsYAACBAQAQGAAAgQEAEBgAgBL+B4rLd7nRZXIrAAAAAElFTkSuQmCC" alt="" aria-hidden="true">',
          fuel: '<svg class="ref-icon ref-fuel" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 2.8h9.2v18.4H5.5z"></path><path d="M7.6 5.2h5v4.6h-5z"></path><path d="M14.7 7.4h2.1l2.1 2.2v7c0 1 .5 1.7 1.4 1.7.8 0 1.3-.6 1.3-1.7v-5.2l-1.8-1.9"></path><path d="M4.5 21.2h11.2"></path></svg>'
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

  // Homepage highlight cards use the clean image-first layout and remain fully clickable.
  if (cardContext === 'featured' && article) {
    const detailHref = details.href;
    article.setAttribute('role', 'link');
    article.setAttribute('tabindex', '0');
    article.setAttribute('aria-label', `View details for ${vehicleName(vehicle)}`);
    const openDetails = (event) => {
      if (event && event.target && event.target.closest && event.target.closest('.card-photo-arrow')) return;
      window.location.href = detailHref;
    };
    article.addEventListener('click', openDetails);
    article.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openDetails(event);
      }
    });
  }
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

// Use the first highlighted vehicle as the homepage hero image when possible.
const heroVehicleImage = document.querySelector('#hero-vehicle-image');
if (heroVehicleImage) {
  const heroVehicle = vehicles.find(v => v.featured && vehicleImages(v).length) || vehicles.find(v => vehicleImages(v).length);
  const heroImages = heroVehicle ? vehicleImages(heroVehicle) : [];
  if (heroImages.length) {
    heroVehicleImage.style.backgroundImage = `url("${heroImages[0]}")`;
    heroVehicleImage.classList.add('has-hero-image');
    heroVehicleImage.querySelector('.hero-vehicle-fallback')?.setAttribute('hidden', '');
  }
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
      const searchable = `${v.year} ${v.make} ${v.model} ${v.trim} ${v.vin || ''} ${v.drivetrain} ${v.engine || ''} ${v.transmission || ''} ${v.fuelEconomy || ''} ${formatMiles(v.miles)} ${v.title}`.toLowerCase();
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
    const detailName = document.querySelector('#detail-name');
    if (detailName) {
      detailName.textContent = vehicle.model || '';
      if (vehicle.trim) {
        const detailTrim = document.createElement('span');
        detailTrim.className = 'detail-trim';
        detailTrim.textContent = ` ${vehicle.trim}`;
        detailName.appendChild(detailTrim);
      }
    }
    const breadcrumbName = document.querySelector('#detail-breadcrumb-name');
    if (breadcrumbName) breadcrumbName.textContent = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    document.querySelector('#detail-price').textContent = vehicle.price;
    document.querySelector('#detail-description').textContent = vehicle.description;
    document.querySelector('#detail-note').textContent = vehicle.note;
    document.querySelector('#detail-miles').textContent = formatMiles(vehicle.miles);
    document.querySelector('#detail-title').textContent = vehicle.title;
    document.querySelector('#detail-drive').textContent = vehicle.drivetrain || '—';
    const detailVinWrap = document.querySelector('#detail-vin-wrap');
    const detailVin = document.querySelector('#detail-vin');
    const vinText = String(vehicle.vin || '').trim().toUpperCase();
    if (detailVinWrap && detailVin) {
      if (vinText) {
        detailVin.textContent = vinText;
        detailVinWrap.hidden = false;
      } else {
        detailVinWrap.hidden = true;
      }
    }
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

      const detailPhotoCount = document.createElement('span');
      detailPhotoCount.className = 'detail-photo-count';
      mainPhoto.appendChild(detailPhotoCount);

      const updateDetailPhotoCount = currentIndex => {
        detailPhotoCount.innerHTML = `<svg class="photo-count-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 7.5h3l1.4-2h6.2l1.4 2h3A2.5 2.5 0 0 1 22 10v7.5A2.5 2.5 0 0 1 19.5 20h-15A2.5 2.5 0 0 1 2 17.5V10a2.5 2.5 0 0 1 2.5-2.5Z"></path><circle cx="12" cy="13.5" r="3.5"></circle></svg><span>${currentIndex + 1} / ${images.length}</span>`;
        detailPhotoCount.setAttribute('aria-label', `Photo ${currentIndex + 1} of ${images.length}`);
      };

      const showDetailImage = index => {
        currentDetailImage = (index + images.length) % images.length;
        mainPhoto.style.backgroundImage = `url("${images[currentDetailImage]}")`;
        thumbnails.querySelectorAll('.thumb').forEach((thumb, i) => thumb.classList.toggle('active', i === currentDetailImage));
        updateDetailPhotoCount(currentDetailImage);
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
