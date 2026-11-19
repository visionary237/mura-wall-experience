import type { Pt } from '@/lib/homography';

export interface Room {
  id: string; label: string; available: boolean; src?: string; occlusion?: string; width?: number; height?: number;
  wall?: Pt[]; wallWidthM?: number; wallHeightM?: number; aiGenerated?: boolean;
}

/** Seul le salon existe (frame 0 de la vidéo fournie). Les autres sont à produire — prompts dans docs/06-assets-manquants.md */
export const rooms: Room[] = [
  {
    id: 'salon', label: 'Salon', available: true, src: '/media/rooms/salon-blank.jpg', occlusion: '/media/rooms/salon-occlusion.png',
    width: 1280, height: 720, wall: [{ x: 202, y: 88 }, { x: 1112, y: 88 }, { x: 1112, y: 520 }, { x: 202, y: 520 }],
    wallWidthM: 4.2, wallHeightM: 2, aiGenerated: true,
  },
  ...['Chambre', 'Cuisine', 'Salle de jeux', 'Bureau', 'Restaurant', 'Hôtel', 'École', 'Crèche', 'Piscine', 'Hôpital', 'Espace commercial'].map(
    (label) => ({ id: label.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-'), label, available: false }),
  ),
];
