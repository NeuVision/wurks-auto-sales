Wurks Auto Sales v5.0 — Inventory Split

WHAT CHANGED
- script.js now contains only website functionality.
- inventory.js contains only vehicle listing data.
- The USB Inventory Manager now edits/exports inventory.js only.
- Future website feature updates can replace script.js without overwriting inventory.

NORMAL WORKFLOW
1. Open Wurks_Inventory_Manager_USB_v5_0.html.
2. Load your Wurks_Inventory_Backup.json if needed.
3. Add/edit/delete vehicles and photo filenames.
4. Save Inventory Backup.
5. Download inventory.js.
6. Upload inventory.js to the ROOT of the GitHub repository, replacing the old inventory.js.
7. Upload any new photos separately into the images folder.
8. Commit changes and let GitHub Pages deploy.

IMPORTANT
Do not replace script.js when making ordinary inventory changes anymore.
