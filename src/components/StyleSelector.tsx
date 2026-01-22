import React from 'react';

export type ArtStyle = 
  | 'Watercolor' 
  | 'Crayon' 
  | 'Oil Painting' 
  | 'Paper Cutout' 
  | 'Pencil Sketch' 
  | 'Pencil Line Art' 
  | '3D Cartoon';

interface StyleSelectorProps {
  selectedStyle: ArtStyle;
  onSelect: (style: ArtStyle) => void;
}

export const STYLES: { label: ArtStyle; modifier: string; swatchClass: string }[] = [
  { 
    label: 'Watercolor', 
    modifier: 'watercolor painting style, soft colors, artistic, wet on wet technique',
    swatchClass: 'bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 opacity-80' 
  },
  { 
    label: 'Crayon', 
    modifier: 'crayon drawing style, child art texture, vibrant, wax texture',
    swatchClass: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-400 via-red-400 to-orange-400'
  },
  { 
    label: 'Oil Painting', 
    modifier: 'oil painting style, textured brush strokes, masterpiece, impasto',
    swatchClass: 'bg-gradient-to-tr from-blue-800 via-indigo-600 to-purple-800 border border-white/20'
  },
  { 
    label: 'Paper Cutout', 
    modifier: 'paper cutout craft style, layered paper texture, depth, shadow',
    swatchClass: 'bg-kid-green border-b-4 border-r-4 border-green-700'
  },
  { 
    label: 'Pencil Sketch', 
    modifier: 'pencil sketch, black and white, rough lines, shading, graphite',
    swatchClass: 'bg-gray-200 bg-[url("https://www.transparenttextures.com/patterns/graphy.png")] grayscale'
  },
  { 
    label: 'Pencil Line Art', 
    modifier: 'clean line art, black and white, coloring page style, no shading, distinct lines',
    swatchClass: 'bg-white border-2 border-black'
  },
  { 
    label: '3D Cartoon', 
    modifier: '3D cartoon render, cute, plasticine style, blender 3d, soft lighting',
    swatchClass: 'bg-gradient-to-br from-cyan-300 to-blue-500 shadow-[inset_2px_2px_6px_rgba(255,255,255,0.6)]'
  },
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-3 py-2">
      {STYLES.map((style) => (
        <button
          key={style.label}
          onClick={() => onSelect(style.label)}
          className={`
            group relative pl-12 pr-4 py-3 rounded-2xl text-sm font-bold border transition-all duration-200 shadow-sm overflow-hidden text-left
            ${selectedStyle === style.label
              ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-100 shadow-md transform scale-105'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
            }
          `}
          title={`Chọn phong cách ${style.label}`}
        >
          {/* Visual Swatch */}
          <span className={`
            absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg shadow-inner
            ${style.swatchClass}
            ${selectedStyle === style.label ? 'ring-2 ring-white shadow-lg' : ''}
          `} />
          
          {style.label}
        </button>
      ))}
    </div>
  );
};