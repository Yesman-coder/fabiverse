# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**FABIVERSE** is a 2D retro platformer adventure game titled *"El Misterio de la Piscina 'Temperada'"*.

- **Genre:** 2D Platformer Adventure
- **Visual Style:** 16-bit Pixel Art (colorful, bright)
- **Platform:** Web (JavaScript/HTML5) — primary target; Python/Pygame as alternative
- **Language:** Spanish (all dialogue, UI, and copy is in Spanish)
- **School setting:** Colegio Los Hipocampitos

---

## Tech Stack Decision

The project targets **Web (JS/HTML5)** using a lightweight game library such as:
- [Phaser 3](https://phaser.io/) — recommended (scene management, tilemaps, physics, input, audio all built-in)
- Vanilla Canvas/JS — fallback if keeping zero dependencies

If switching to Python: use **Pygame** with `pygame.sprite`, scene state machine, and JSON-based level data.

---

## Game Architecture

### State Machine / Scene Flow

```
Boot → CharacterSelect → Level1_Guardi → Level2_Salones → Level3_Cantina
     → Level4_Canchas  → Level5_Piscina → Level6_Barranquito → VictoryScreen
```

Each level is a self-contained scene/module. The game uses a **global GameState** object passed between scenes:

```js
GameState = {
  character: 'fabi' | 'sara' | 'milan',
  inventory: [],          // e.g. ['empanada', 'llave_dorada', 'cristal_fuego']
  abilityUsed: false,
}
```

### Characters & Abilities

| Character | Ability | Mechanical Effect |
|-----------|---------|-------------------|
| Fabi | Pista Divina | Highlights hidden path/object temporarily |
| Sara | Sigilo de Gato | Reduces Professor NPC vision cone by ~40% in Level 2 |
| Milan | Super Salto | Jump height +20% (helps reach Dojo top platform in Level 4) |

### Level Summaries

| # | Zone | Core Mechanic | Exit Condition |
|---|------|---------------|----------------|
| 1 | Zona de Guardi | Walk right, read NPC dialogue | Reach right edge |
| 2 | Salones | Stealth — avoid Professor's vision cone | Reach far door |
| 3 | Cantina | NPC dialogue → auto-receive `empanada` | Exit right |
| 4 | Canchas / Dojo | Platform jumps → collect `llave_dorada` | Exit right with key |
| 5 | Piscina | Use `llave_dorada` on padlock (press E) | Follow leaf trail right |
| 6 | Barranquito | Use `empanada` on Monkey (press E) → get `cristal_fuego` | Return triggers auto-win |

**Victory:** Returning to Level 5 with `cristal_fuego` triggers the win cutscene — ice melts, pool steams.

### Key Interaction System

- **`E` key** = interact with nearest interactable (NPC, door, object)
- Interaction opens dialogue box OR inventory picker (Level 6 monkey trade)
- Inventory is a simple array; items added automatically (empanada) or on pickup (keys, crystal)

### NPC / Vision Cone (Level 2)

The Professor patrols left↔right. Vision cone = a forward-facing rectangle in the walk direction.
- Default cone width: ~200px
- Sara's ability shrinks it to ~120px
- Collision with cone → teleport player to level start + show dialogue

---

## Asset Reference

All visual assets are Pixel Art 16-bit style. Key sprites needed:

| Asset | Description |
|-------|-------------|
| `fabi.png` | Sprite sheet — school uniform, dark hair, notebook |
| `sara.png` | Sprite sheet — school uniform, blonde, ninja pose |
| `milan.png` | Sprite sheet — school uniform + blue baseball cap |
| `monkey.png` | Brown mischievous monkey, holding shiny object |
| `cristal_fuego.png` | Large faceted ruby with red glow |
| `empanada.png` | Golden warm empanada |
| `llave_dorada.png` | Simple golden key |
| `bg_guardi.png` | School exterior, tropical mountain, parking lot |
| `bg_salones.png` | School hallway, numbered doors, pillars |
| `bg_piscina_frozen.png` | Pool with ice blocks, locked metal door |
| `bg_barranquito.png` | Jungle hillside, mossy rocks, exotic vegetation |

---

## Development Commands

> Update this section once the tech stack is scaffolded.

### Phaser 3 (Web) — expected setup
```bash
npm install          # install dependencies
npm run dev          # start local dev server (Vite or Parcel)
npm run build        # production build to /dist
```

### Python/Pygame — expected setup
```bash
pip install pygame
python main.py       # run the game
```

---

## File Structure (Planned)

```
FABIVERSE/
├── src/
│   ├── scenes/          # One file per level + Boot, CharacterSelect, Victory
│   ├── entities/        # Player, NPC, Professor, Monkey classes
│   ├── systems/         # Inventory, DialogueBox, VisionCone
│   └── data/            # Level configs, dialogue strings (Spanish)
├── assets/
│   ├── sprites/
│   ├── backgrounds/
│   ├── audio/
│   └── ui/
├── index.html
└── package.json
```
