# Mobile Playability Plan

## Goal

Make Armor of God comfortable to play on a phone without changing its core
bidirectional platforming or the Stone Golem encounter. Gameplay is landscape
only; menus and every non-gameplay screen work in either orientation.

Mobile support must not regress the desktop experience. Keyboard and mouse
controls, layouts, visual presentation, and existing gameplay should continue
to work as they do today. Small shared adjustments are acceptable only when
their desktop impact is neutral or improves the experience.

The default touch layout will use three familiar platformer controls: left and
right movement on the lower left, plus a large hold-to-jump button on the lower
right. This keeps the existing variable jump height and avoids redesigning the
levels around auto-run.

## Phase 0: Set expectations while mobile support is in progress

- Detect phone-sized/touch-first mobile devices.
- Until the touch build is ready, show a clear message: **“Mobile is not
  supported, play on your laptop!”**
- Do not block desktop or tablet play. Remove this temporary notice when the
  acceptance criteria in this plan are met.

## Phase 1: Make the site responsive outside of gameplay

- Reflow the main menu for portrait and landscape phones; reduce title art and
  type as necessary, and keep pet selection, level selection, Start, How to
  Play, Credits, and Hall of Heroes reachable and tappable.
- Ensure How to Play, credits, leaderboard, level-intro, level-cleared,
  game-over, cutscene, and dialogs work in both orientations. Stack columns or
  reduce decorative content when horizontal space is limited.
- Add explicit, visible touch buttons for:
  - skipping the cutscene;
  - previous/next credit section and skipping credits;
  - pausing during gameplay.
- Remove visible references to keyboard keys from the touch UI, including the
  existing pause reminder and Enter/Escape-style continue/skip prompts.
- Update How to Play to use touch-control artwork and wording. Keep the game
  rules the same; remove the “or Space bar” wording rather than duplicating
  keyboard instructions.
- Preserve keyboard control on desktop, but do not present it as the primary
  instruction on a phone.

## Phase 2: Landscape-only gameplay shell

- Enter gameplay in a landscape-oriented layout. Do not require or attempt to
  force the device OS orientation.
- If the player enters or rotates gameplay into portrait, pause input and show
  a full-screen reorientation panel with circular arrows and a concise request
  to rotate the device. Resume only once landscape space is available.
- Keep the canvas and controls inside the visible viewport, accounting for
  browser UI and device safe areas. Prevent browser scroll/zoom gestures from
  interfering with the game surface.
- Recompute canvas display scale and touch targets after resize/orientation
  changes, while retaining the game’s internal coordinate system.

## Phase 3: Touch-control prototype

Place controls below the gameplay canvas so they do not hide hazards, enemies,
or boss tells.

- Lower left: separate large hold buttons for **Move Left** and **Move Right**.
  They must work independently and allow immediate direction changes.
- Lower right: a larger **Jump** hold button. Pointer/touch press begins the
  jump and pointer/touch release ends it, mapping directly to the current
  variable-jump input so short and full jumps remain possible.
- Below Jump: a smaller **Duck** hold button.
- Use Pointer Events with cancellation/lost-pointer handling, so controls are
  reliably released if a finger leaves the screen, a call interrupts, the game
  pauses, or orientation changes.
- Keep the current keyboard input path unchanged and route touch state through
  the same input states, so desktop behavior and physics do not diverge.
- Consider, but do not ship as the default in this first pass: swipe-up for a
  fixed maximum jump and swipe-down for a fixed one-second duck. Test whether
  these conflict with simultaneous left/right movement and only add them if
  playtesting proves they improve accessibility.

## Phase 4: Real-device validation and tuning

- Test Level 1 pits/platforms, Level 2 and 3 elevated sections, and the full
  Stone Golem fight on at least one iPhone-sized and one Android-sized device
  (or equivalent browser emulation before physical-device testing).
- Verify that a player can run, reverse, short-jump, full-jump, duck, pause,
  restart, and interact with all menus using touch only.
- Tune button size, gaps, opacity, and canvas/control proportions based on
  thumb reach and accidental presses.
- Verify audio unlock behavior after the first touch, no accidental page
  scrolling, no stuck movement/jump state, and usable text at small widths.
- Run a desktop regression pass after responsive or shared-input changes:
  keyboard movement, variable jumps, ducking, pause/restart, menus, cutscenes,
  credits, and the boss must remain fully functional and visually intact.

## Definition of done

- A first-time phone visitor can understand how to rotate, start a level, and
  use every required control without seeing a keyboard instruction.
- All non-gameplay screens are usable in both portrait and landscape.
- Gameplay is touch-only playable in landscape, including the boss fight, with
  bidirectional movement and variable-height jumps.
- Desktop keyboard/mouse controls and existing game behavior continue to work
  without a negative visual, usability, or gameplay impact.
