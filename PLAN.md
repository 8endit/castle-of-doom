# Castle of Doom — Verbesserungsplan

## Identifizierte Probleme

| # | Problem | Ursache |
|---|---------|---------|
| 1 | Turm deckt Bild ab beim Voranschreiten | Bugfix: `tx = frac * W * 0.2` sollte `frac * W` sein → alle Türme clustern in erste 20% der Welt |
| 2 | Zu viele Gegner spawnen direkt | Alle Feinde werden in `create()` sofort aktiviert, kein Proximity-Check |
| 3 | Sprungbereiche unerreichbar | Max. Sprunghöhe ist ~120px (3.75 Tiles), aber Plattformabstände zu groß |
| 4 | Kein Lives-System | Tod → sofort GameOverScene, kein Respawn |
| 5 | Inventar nicht nutzbar | Slots existieren im Code, aber kein Menü zum Ansehen/Verwalten |
| 6 | Keine Verbrauchsgegenstände | Nur Equipment-Drops, kein Heilungsitem |

---

## Änderungen

### A — Hintergrund-Bug Fix (1 Datei)
**`GameScene.js` → `_buildBackground()`**

```
VORHER: var tx = frac * W * 0.2;
NACHHER: var tx = frac * W;
```
Türme werden über die gesamte Weltbreite verteilt, Parallax-Effekt (scrollFactor 0.2) sorgt für Tiefenwirkung ohne Überlappung.
Zusätzlich: Türme leicht transparenter (alpha 0.5) damit Spielfeld sichtbar bleibt.

---

### B — Lives-System + Respawn (3 Dateien)
**Neues globales Objekt `GameState` (in `main.js`):**
```js
window.GameState = { lives: 3, currentLevel: null };
```

**`Player.js` → `_die()`:**
- Statt direkt `GameOverScene` starten: `lives--`
- lives > 0 → Kurze "YOU DIED" Einblendung (1.5s) → GameScene mit gleichem Level neu starten
- lives = 0 → GameOverScene wie bisher
- Beim Level-Wechsel: Lives bleiben erhalten (kein Reset)

**`UIScene.js`:**
- ♥ Herz-Icons neben HP-Bar (oben links)
- Herz rot = Leben verfügbar, dunkel = verbraucht
- Animation: verlorenes Herz blinkt rot → wird dunkel

**`GameOverScene.js`:**
- Keine Änderung — wird nur noch bei lives=0 angezeigt

---

### C — Proximity Spawning (1 Datei)
**`GameScene.js` → `create()` + `update()`**

Gegner beim Start deaktiviert spawnen, erst aktivieren wenn Spieler sich nähert:

```
create():
  - Jeden Feind mit setActive(false) + setVisible(false) starten
  - Feind-Array statt Phaser-Gruppe verwalten (für einfachen Proximity-Check)

update():
  - Für jeden inaktiven Feind: if (Math.abs(enemy.x - player.x) < 550) → aktivieren
  - Aktivierungs-Animation: scale 0→1 über 300ms + flash weiß
```

Ergebnis: Spieler sieht maximal 1-2 Gegner gleichzeitig, schwierigere Gegner erscheinen erst wenn man wirklich voranschreitet.

---

### D — Level-Redesign (3 Dateien)
**Physikalische Grenzen (unveränderlich):**
- Max. Sprunghöhe: 380² / (2 × 600) ≈ **120px = 3 Tiles**
- Max. Sprungweite bei 180px/s: ≈ **228px = 7 Tiles horizontal**
- Doppelsprung: +80% Höhe → gesamt ~5 Tiles vertikal erreichbar

**Level 1 — Castle Courtyard (Redesign):**
- Flacher Einstieg: erste 10 Tiles nur Boden, keine Gegner → Tutorial-Zone
- Plattformen: max. 3 Tiles hoch, max. 6 Tiles Lücke horizontal
- Gegner-Grupppen: je 1-2 Feinde pro Zone, 5-6 Zonen über 60 Tiles
- Boss erst bei x=1700+ sichtbar (war bei 1760 — okay)
- Sicherheits-Plattform unter jedem Sprungbereich (kein sofortiger Pit-Tod)

**Level 2 — The Catacombs (Redesign):**
- Gruben nur 2-3 Tiles breit (war 3 breit — okay, aber Übergang besser)
- Plattform-Brücken: immer Alternativ-Route über obere Plattform
- Gegner stehen NICHT auf dem letzten Tile vor Gruben

**Level 3 — The Throne Room (keine Änderung nötig):**
- Arena-Stil funktioniert gut, nur Boss-Kampf

---

### E — Inventar-Bildschirm (1 neue Datei)
**Neue Scene: `InventoryScene.js`**

Taste `I` oder Inventar-Button (Mobile) öffnet/schließt Overlay:

```
Layout:
┌─────────────────────────────────────┐
│  INVENTORY                     [X]  │
│                                     │
│  [⚔ WEAPON]   Eisenschwert         │
│               +12 DMG               │
│                                     │
│  [🪖 HELM]    Lederhelm            │
│               +3 DEF, +10 HP        │
│                                     │
│  [🛡 KÖRPER]  Kettenhemd           │
│               +5 DEF, +25 HP        │
│                                     │
│  [💍 RING]    leer                 │
│                                     │
│  GESAMT-STATS: ATK 22 | DEF 8 | HP 135│
└─────────────────────────────────────┘
```

- Klick/Tap auf Slot: zeigt Item-Details + "ABLEGEN" Button
- Abgelegtes Item fällt in GameScene zu Boden (wie bisher bei Auto-Equip)
- ESC / I / Tap außerhalb: schließt Menü
- Mobile: Inventar-Icon Button in `MobileScene` (oben rechts)

---

### F — Verbrauchsgegenstände (2 Dateien)
**`LootSystem.js`:**
- Neuer Typ: `potion` — heilt 30-50 HP
- Farbe: hellrot (0xff3333), Icon: ❤
- Drop-Chance: 25% von normalen Gegnern (zusätzlich zu Equipment)
- Potions stacken nicht — maximal 2 Slots

**`Player.js` + `UIScene.js`:**
- 2 Consumable-Quick-Slots unten in UIScene (neben Herzen)
- Taste `Q` oder Trank-Button (Mobile): benutzt erste verfügbare Trank
- Animation: grüner Heilungs-Partikel-Burst + HP-Bar füllt sich sichtbar

---

### G — Checkpoint-System (2 Dateien)
**`GameScene.js` + Level-Daten:**
- Checkpoints als unsichtbare Trigger-Zone in Level-Daten eingetragen
- Spieler berührt Checkpoint → Position gespeichert in `GameState.checkpoint`
- Bei Respawn (lives > 0): Start am letzten Checkpoint statt Level-Beginn
- Visuell: kleines Lagerfeuer-Sprite (oder einfacher Marker)

---

## Reihenfolge der Implementierung

1. **Hintergrund-Bugfix** (5 min) — sofort sichtbarer Effekt
2. **Lives-System** (45 min) — Grundlage für gutes Spielgefühl
3. **Proximity Spawning** (30 min) — macht das Spiel sofort fairer
4. **Level-Redesign** (60 min) — erfordert sorgfältiges Tile-Mapping
5. **Inventar-Screen** (45 min) — UI-Arbeit
6. **Consumables/Potions** (30 min) — LootSystem + Player-Erweiterung
7. **Checkpoints** (20 min) — einfachste der komplexen Features

---

## Nicht geändert (funktioniert gut)
- Touch-Controls (links/rechts/jump/attack) ✓
- Equipment Auto-Equip ✓
- Boss-System ✓
- Story-Cutscenes ✓
- Phaser-Skalierung für Mobile ✓
