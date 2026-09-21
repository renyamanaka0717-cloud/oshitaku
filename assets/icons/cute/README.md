# Icons8 "Cute Color" icons

Drop Icons8 **Cute Color** style PNGs (https://icons8.com/icons/dusk--author-made-by-made)
into this folder, then register each one in `src/theme/cuteIcons.ts` by
adding a `require('@/assets/icons/cute/<file>.png')` line for its key in
`CUTE_ICON_SOURCES`.

Nothing else needs to change — every place in the app that shows an icon
already renders through `<CuteIcon>`, which automatically switches from
its current emoji/vector fallback to the registered image the moment a
key is added.

## Suggested file names (match the keys in `cuteIcons.ts`)

Task icons:
- `wash-face.png`
- `toothbrush.png`
- `breakfast.png`
- `get-dressed.png`
- `school-bag.png`
- `shoes.png`
- `toilet.png`
- `pajamas.png`
- `homework.png`
- `water-bottle.png`
- `handkerchief.png`
- `tomorrow-clothes.png`
- `bath.png`
- `hair-dryer.png`

Menu icons:
- `morning-prep.png`
- `evening-prep.png`
- `chores.png`
- `rewards.png`
- `calendar.png`
- `points.png`
- `home.png`
- `stats.png`
- `settings.png`
