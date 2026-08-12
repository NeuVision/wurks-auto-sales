WURKS AUTO SALES WEBSITE — VERSION 3

FILES TO UPLOAD TO THE ROOT OF YOUR GITHUB REPOSITORY:
- index.html
- inventory.html
- vehicle.html   (NEW)
- styles.css
- script.js

WHAT'S NEW
- Dedicated vehicle detail page instead of a popup.
- Better inventory card styling and featured-vehicle badges.
- Photo-ready cards and a multi-photo gallery on detail pages.
- Manufacturer filtering and text search remain automatic.
- Improved mobile layout and clearer vehicle disclosures.

ADDING VEHICLE PHOTOS
1. In your GitHub repository, create or upload an "images" folder.
2. Put your vehicle images in that folder, for example:
   images/2020-forester-1.jpg
   images/2020-forester-2.jpg
3. Open script.js and find that vehicle.
4. Set:
   image: 'images/2020-forester-1.jpg',
   gallery: ['images/2020-forester-2.jpg', 'images/2020-forester-3.jpg'],

The first image appears on the inventory card and as the main detail photo.
Gallery images appear as clickable thumbnails on the vehicle page.

FEATURED VEHICLES
Set featured: true to show the vehicle on the homepage. The homepage displays up to four.

IMPORTANT
Replace the placeholder phone number and email in index.html with your actual business contact information before publicizing the site.
