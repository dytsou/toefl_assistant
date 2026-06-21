export interface KeyDef {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const KEY_W = 40;
const KEY_H = 40;
const KEY_GAP = 4;
const ROW_GAP = 6;

function row(y: number, keys: string[], offsetX = 0): KeyDef[] {
  return keys.map((label, index) => ({
    id: label === ' ' ? 'Space' : label,
    label: label === ' ' ? 'Space' : label,
    x: offsetX + index * (KEY_W + KEY_GAP),
    y,
    width: label === ' ' ? KEY_W * 6 + KEY_GAP * 5 : KEY_W,
    height: KEY_H,
  }));
}

const row0 = row(0, ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='], 0);
const row1 = row(KEY_H + ROW_GAP, ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'], KEY_W * 0.5);
const row2 = row((KEY_H + ROW_GAP) * 2, ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"], KEY_W);
const row3 = row((KEY_H + ROW_GAP) * 3, ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'], KEY_W * 1.5);
const row4: KeyDef[] = [
  { id: 'Backspace', label: 'Backspace', x: 0, y: (KEY_H + ROW_GAP) * 4, width: KEY_W * 2 + KEY_GAP, height: KEY_H },
  { id: 'Space', label: 'Space', x: KEY_W * 3, y: (KEY_H + ROW_GAP) * 4, width: KEY_W * 8 + KEY_GAP * 7, height: KEY_H },
  { id: 'Paste', label: 'Paste', x: KEY_W * 12, y: (KEY_H + ROW_GAP) * 4, width: KEY_W * 2 + KEY_GAP, height: KEY_H },
];

export const QWERTY_KEYS: KeyDef[] = [...row0, ...row1, ...row2, ...row3, ...row4];

export const KEYBOARD_VIEWBOX = {
  width: 640,
  height: (KEY_H + ROW_GAP) * 5,
};

export const KEY_ID_SET = new Set(QWERTY_KEYS.map((key) => key.id));
