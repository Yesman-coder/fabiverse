# Design Spec: El Misterio de la Piscina "Temperada"

**Project:** FABIVERSE
**Date:** 2026-06-24
**Stack:** Phaser 3 + Vite + Vercel (static)
**Language:** Spanish (default) with English toggle

---

## 1. Project Overview

A 2D retro platformer adventure game for the web. The player chooses one of three school kids and explores *Colegio Los Hipocampitos* to recover the stolen "Cristal de Fuego" from a mischievous monkey. Gameplay philosophy: 80s/90s-era playability first — tight controls, clear rules, immediate feedback, low graphical complexity.

---

## 2. Project Structure

```
FABIVERSE/
├── public/
│   └── assets/
│       ├── sprites/       ← character + NPC + item PNGs
│       ├── backgrounds/   ← 6 level backgrounds
│       ├── audio/         ← music + SFX
│       └── ui/            ← dialogue box, inventory slot, HUD icons
├── src/
│   ├── main.js            ← Phaser config, scene list, responsive scaling
│   ├── GameState.js       ← singleton: character, inventory, flags
│   ├── i18n/
│   │   ├── es.js          ← all Spanish strings
│   │   └── en.js          ← all English strings
│   ├── entities/
│   │   ├── Player.js      ← movement, jump, interact, ability
│   │   ├── NPC.js         ← static NPC with dialogue trigger
│   │   ├── Professor.js   ← patrol + vision cone
│   │   └── Monkey.js      ← flee behavior + trade interaction
│   ├── systems/
│   │   ├── DialogueBox.js ← bottom-screen text box, advance with E or Space
│   │   └── InventoryUI.js ← HUD item strip + trade picker (Level 6)
│   └── scenes/
│       ├── Boot.js
│       ├── CharacterSelect.js
│       ├── Level1_Guardia.js
│       ├── Level2_Salones.js
│       ├── Level3_Cantina.js
│       ├── Level4_Canchas.js
│       ├── Level5_Piscina.js
│       ├── Level6_Barranquito.js
│       └── Victory.js
├── index.html
├── package.json
└── vercel.json
```

---

## 3. Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Phaser 3 | ^3.87 | Game engine (physics, scenes, input, audio) |
| Vite | ^6.0 | Dev server + production bundler |
| Vercel | static | Hosting (`vite build` → `/dist`) |

No runtime dependencies beyond Phaser. No plugins.

---

## 4. GameState

Stored in the Phaser game registry (`this.registry`) so every scene can read and write it without imports.

```js
{
  character: 'fabi' | 'sara' | 'milan',   // set in CharacterSelect
  inventory: string[],                     // item keys, e.g. ['empanada', 'llave_dorada']
  abilityUsed: boolean,                    // reset to false on each level start
  lang: 'es' | 'en',                       // default 'es'
  currentLevel: number                     // 1–6, updated on each transition
}
```

---

## 5. Scene Flow

```
Boot
  └─► CharacterSelect
        └─► Level1_Guardia
              └─► Level2_Salones
                    └─► Level3_Cantina
                          └─► Level4_Canchas
                                └─► Level5_Piscina
                                      └─► Level6_Barranquito
                                            └─► Level5_Piscina (victoryMode: true)
                                                  └─► Victory
```

- `Boot` preloads all assets and shows a pixel-art loading bar, then starts `CharacterSelect`.
- Each level scene reads `GameState` on `create()` and writes to it before transitioning.
- `Level5_Piscina` accepts a `victoryMode` flag via `scene.start('Level5_Piscina', { victoryMode: true })`. When true, it skips the puzzle and plays the ice-melting cutscene, then transitions to `Victory`.

---

## 6. Player System

### Physics
- Arcade physics, gravity Y: 800
- Physics body: 32×48px
- Coyote time: 80ms (allows jumping just after walking off a ledge)
- Jump buffer: 100ms (registers jump input just before landing)

### Controls
| Input | Action |
|-------|--------|
| Arrow Left / A | Move left |
| Arrow Right / D | Move right |
| Space / Arrow Up / W | Jump |
| E | Interact (nearest interactable within 60px) |
| Q | Use ability (once per level) |

### Interact (E key)
Scans within 60px radius for interactables. Priority: items > NPCs > doors. Shows a small `interact_prompt.png` icon floating above the nearest valid target when in range. Player cannot move during active dialogue.

### Character Abilities
| Character | Ability | Effect |
|-----------|---------|--------|
| Fabi | Pista Divina | Press Q → nearest interactable pulses with a golden glow for 3 seconds |
| Sara | Sigilo de Gato | Passive — Professor vision cone width reduced from 200px to 120px in Level 2 |
| Milan | Super Salto | Passive — jump velocity multiplied by 1.2 |

---

## 7. Level Designs

### Level 1 — Zona de Guardia
- **Width:** 800px (static camera)
- **Background:** `bg_guardia.png`
- **Mechanics:** Walk right. Mud tracks (`mud_track.png`) on the floor pointing right. Guard NPC near start triggers auto-dialogue on approach (within 80px).
- **Exit:** Right edge of screen triggers transition to Level 2.
- **Guard dialogue:** "¡Rápido, algo se robó el calor de la piscina! Vi algo verde yendo hacia los salones."

### Level 2 — Los Salones
- **Width:** 1600px (camera follows player)
- **Background:** `bg_salones.png` (wide)
- **Mechanics:** Stealth. Professor NPC patrols between two X markers. Vision cone is a physics rectangle positioned in front of the professor matching his walk direction.
  - Default cone: 200px wide × 80px tall
  - Sara's cone: 120px wide × 80px tall
  - On player overlap with cone: dialogue "¡Vuelve a clase!" → player teleports to X=100 (level start)
  - Three pillars placed at regular intervals. If player's X is within ±20px of a pillar's center AND the professor is on the opposite side of the pillar → cone overlap is ignored (player is hidden)
- **Exit:** Door at X=1550. Activates on reach.

### Level 3 — La Cantina
- **Width:** 800px (static camera)
- **Background:** `bg_cantina.png`
- **Mechanics:** Walk to Cantina Lady NPC. Press E to trigger dialogue. After dialogue ends, `empanada` is auto-added to inventory and a pickup SFX plays.
- **Cantina Lady dialogue:** "¡Vino un mono corriendo y me robó una empanada! Fue hacia las canchas."
- **Exit:** Right edge of screen.

### Level 4 — Las Canchas y el Dojo
- **Width:** 1400px (camera follows player)
- **Background:** `bg_canchas.png`
- **Mechanics:** Platform jumping.
  - Ground level: Y=400px
  - Basketball hoops as mid platforms: Y=280px, spaced across the level
  - Dojo wooden beams as high platforms: Y=160px
  - `llave_dorada` floats with a sine-wave tween at X=1300, Y=130px (above highest beam)
  - Milan's 1.2× jump multiplier makes the top beam easily reachable; others require precise platforming
- **Exit:** Right edge after collecting `llave_dorada`. Collecting the key auto-exits after a 1-second pause with collect SFX.

### Level 5 — La Piscina "Temperada"
- **Width:** 800px (static camera)
- **Background:** `bg_piscina_frozen.png`
- **Mechanics:**
  - Padlock object on the machine room door. Press E near it.
  - If `llave_dorada` is in inventory → door opens (unlock SFX), leaf trail appears on the right, exit becomes active.
  - If no key → dialogue "Necesitas algo para abrir este candado."
  - **Victory mode:** Ice blocks replaced with animated water (blue shimmer tween), steam particle effect, then transition to `Victory`.
- **Exit:** Right edge (only after door opened).

### Level 6 — El Barranquito
- **Width:** 800px (static camera)
- **Background:** `bg_barranquito.png`
- **Mechanics:**
  - Monkey sits on a high rock (unreachable by jump, Y=100px).
  - On approach within 100px → Monkey faces player, short idle animation.
  - Press E near Monkey's rock → opens `InventoryUI` trade picker.
  - Player selects `empanada` → Monkey tosses `cristal_fuego` (projectile arc tween from rock to ground), runs off-screen.
  - Player walks to `cristal_fuego` on the ground and presses E to collect it.
  - On collect → `scene.start('Level5_Piscina', { victoryMode: true })`.
  - If `empanada` not in inventory → dialogue "El monito te mira con curiosidad... quizás quiere algo."

---

## 8. i18n System

Two locale files export plain objects. A single `t(key)` utility reads `GameState.lang` and returns the string.

```js
// src/i18n/es.js
export default {
  guard_dialogue_1: "¡Rápido, algo se robó el calor de la piscina!",
  guard_dialogue_2: "Vi algo verde yendo hacia los salones.",
  professor_caught: "¡Vuelve a clase!",
  cantina_dialogue_1: "¡Vino un mono corriendo y me robó una empanada!",
  cantina_dialogue_2: "Fue hacia las canchas.",
  no_key: "Necesitas algo para abrir este candado.",
  monkey_no_item: "El monito te mira con curiosidad... quizás quiere algo.",
  victory_title: "¡Victoria!",
  victory_subtitle: "El Colegio Los Hipocampitos te agradece.",
}
```

Language toggle button (text: "ES / EN") is rendered as a HUD overlay, visible in all game scenes.

---

## 9. Systems

### DialogueBox
- Renders at bottom of screen (Y=380, full width)
- Uses `dialogue_box.png` as nineslice background
- Shows speaker name (bold) + dialogue text
- Multi-line text split into pages; advance with E or Space
- Player movement disabled while dialogue is open
- Emits a `dialogueComplete` event on close so scenes can react

### InventoryUI
- Horizontal strip of `inventory_slot.png` frames in top-right HUD
- Each collected item shows its icon inside a slot
- **Trade mode** (Level 6): slots become clickable, selected item highlighted in gold, confirm with E
- Emits `itemSelected` event with the item key

---

## 10. Audio

| File | Type | When |
|------|------|------|
| `music_menu.ogg` | Loop | CharacterSelect |
| `music_school.ogg` | Loop | Levels 1–3 |
| `music_action.ogg` | Loop | Levels 4–6 |
| `music_victory.ogg` | One-shot | Victory screen |
| `sfx_jump.ogg` | SFX | Every jump |
| `sfx_collect.ogg` | SFX | Item pickup |
| `sfx_interact.ogg` | SFX | E on NPC or door |
| `sfx_caught.ogg` | SFX | Professor catches player |
| `sfx_ability.ogg` | SFX | Q ability used |
| `sfx_unlock.ogg` | SFX | Padlock opened |
| `sfx_victory.ogg` | SFX | Crystal inserted into machine |

Music crossfades (500ms) when transitioning between level groups. All audio loaded in `Boot`.

---

## 11. Sprite Asset List

All sprites: **PNG, transparent background, pixel art 16-bit style.**

### Characters (spritesheet per character)
Each character needs 3 rows: idle (1 frame), walk (4 frames), jump (1 frame). Frame size: **32×48px**.

| File | Character | Notes |
|------|-----------|-------|
| `fabi.png` | Fabi | Dark hair, white shirt, dark pants, notebook |
| `sara.png` | Sara | Blonde hair, white shirt, dark skirt |
| `milan.png` | Milan | Brown hair, blue baseball cap, white shirt, dark pants |

### NPCs (spritesheet, 32×48px)

| File | NPC | Frames needed |
|------|-----|---------------|
| `guard.png` | Guard | idle, talking (2 frames) |
| `professor.png` | Professor | walk-left, walk-right (2 frames each) |
| `cantina_lady.png` | Cantina Lady | idle, talking (2 frames) |
| `monkey.png` | Monkey | idle, holding crystal, flee (3 frames) |

### Items (individual PNGs, 32×32px)

| File | Description |
|------|-------------|
| `empanada.png` | Golden warm empanada |
| `llave_dorada.png` | Simple golden key |
| `cristal_fuego.png` | Faceted red ruby with glow |
| `mud_track.png` | Green mud footprint (Level 1) |
| `leaf_trail.png` | Exotic leaf cluster (Level 5) |

### Backgrounds (PNG)

| File | Size | Level |
|------|------|-------|
| `bg_guardia.png` | 800×450 | Level 1 |
| `bg_salones.png` | 1600×450 | Level 2 |
| `bg_cantina.png` | 800×450 | Level 3 |
| `bg_canchas.png` | 1400×450 | Level 4 |
| `bg_piscina_frozen.png` | 800×450 | Level 5 |
| `bg_barranquito.png` | 800×450 | Level 6 |

### UI (PNG)

| File | Size | Purpose |
|------|------|---------|
| `dialogue_box.png` | 780×100 | Nineslice dialogue panel |
| `inventory_slot.png` | 40×40 | Item slot frame |
| `interact_prompt.png` | 24×24 | "E" prompt icon above interactables |

---

## 12. Deployment

```json
// vercel.json
{
  "outputDirectory": "dist",
  "buildCommand": "npm run build",
  "framework": null
}
```

Push to GitHub → Vercel auto-deploys on every commit to `main`. Preview deployments on all other branches.

---

## 13. Victory Condition

1. Player collects `cristal_fuego` in Level 6
2. Scene transitions to `Level5_Piscina` with `{ victoryMode: true }`
3. Ice blocks animate out, water shimmer plays, steam particles rise
4. After 3 seconds, transition to `Victory` scene
5. Victory scene shows: large title text, subtitle, confetti particle effect, `music_victory.ogg`
