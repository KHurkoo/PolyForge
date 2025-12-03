# PolyForge

# PolyForge 3D Editor

![PolyForge Screenshot](https://user-images.githubusercontent.com/12345678/1234567890-example-screenshot.png)  
*A lightweight, beautiful, single-file 3D scene editor powered by Three.js — no installation required.*


## Features

- **100% self-contained** — Just one HTML file (copy-paste and run!)
- Full **transform gizmo** (Translate / Rotate / Scale) with W/E/R hotkeys
- Real-time **properties panel** (position, rotation, scale, material, lights)
- **Scene hierarchy** (outliner) with click-to-select
- Add **primitives** (Cube, Sphere, Plane, Torus) and **Point Lights**
- Change **material color**, toggle **wireframe**
- Adjust **light color & intensity** with live helpers
- **Save / Load** scenes using LocalStorage
- Delete, rename, toggle visibility
- Clean dark UI with Tailwind CSS + Font Awesome
- Fully responsive & mobile-friendly
- Proper memory cleanup on delete
- Toast notifications


No server, no build tools, no npm — works offline after first load.

## Keyboard Shortcuts

| Key       | Action                     |
|----------|----------------------------|
| `W`      | Translate mode             |
| `E`      | Rotate mode                |
| `R`      | Scale mode                 |
| `Delete` | Delete selected object     |
| Click    | Select object              |
| Click background | Deselect        |

## Saving & Loading

- Click **Save** → scene is stored in your browser’s LocalStorage
- Click **Load** → restores your last saved scene
- Click **New** → clears everything (with confirmation)

Perfect for quick prototyping, learning Three.js, or teaching 3D concepts.

## Roadmap / Planned Features

- [ ] GLTF/GLB export & import
- [ ] Undo/Redo (Ctrl+Z / Ctrl+Y)
- [ ] Multi-select (Shift/Ctrl click)
- [ ] Duplicate (Ctrl+D) & Copy/Paste
- [ ] Directional & Spot lights
- [ ] Snap to grid (Ctrl + drag)
- [ ] Background / environment map selector
- [ ] Dark ↔ Light theme toggle
- [ ] Installable PWA (Add to Home Screen)



Originally crafted with ❤️ as a single-file weekend project.

## License

MIT License – feel free to use, modify, and share!



**PolyForge** — Because sometimes you just need a tiny 3D editor that works everywhere.

Made with passion by [KHurkoo](https://github.com/KHurkoo))  
December 2025
