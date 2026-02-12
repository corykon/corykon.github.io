import React from 'react';

// Import all type icons
import bugIcon from '../../assets/type-icons/bug.svg';
import darkIcon from '../../assets/type-icons/dark.svg';
import dragonIcon from '../../assets/type-icons/dragon.svg';
import electricIcon from '../../assets/type-icons/electric.svg';
import fairyIcon from '../../assets/type-icons/fairy.svg';
import fightingIcon from '../../assets/type-icons/fighting.svg';
import fireIcon from '../../assets/type-icons/fire.svg';
import flyingIcon from '../../assets/type-icons/flying.svg';
import ghostIcon from '../../assets/type-icons/ghost.svg';
import grassIcon from '../../assets/type-icons/grass.svg';
import groundIcon from '../../assets/type-icons/ground.svg';
import iceIcon from '../../assets/type-icons/ice.svg';
import normalIcon from '../../assets/type-icons/normal.svg';
import poisonIcon from '../../assets/type-icons/poison.svg';
import psychicIcon from '../../assets/type-icons/psychic.svg';
import rockIcon from '../../assets/type-icons/rock.svg';
import steelIcon from '../../assets/type-icons/steel.svg';
import waterIcon from '../../assets/type-icons/water.svg';

// Type icon mapping
const typeIcons = {
  bug: bugIcon,
  dark: darkIcon,
  dragon: dragonIcon,
  electric: electricIcon,
  fairy: fairyIcon,
  fighting: fightingIcon,
  fire: fireIcon,
  flying: flyingIcon,
  ghost: ghostIcon,
  grass: grassIcon,
  ground: groundIcon,
  ice: iceIcon,
  normal: normalIcon,
  poison: poisonIcon,
  psychic: psychicIcon,
  rock: rockIcon,
  steel: steelIcon,
  water: waterIcon
};

// Type color mapping (matching existing CSS type badge colors)
const typeColors = {
  bug: { bg: '#9FB93C', text: '#000000' },
  dark: { bg: '#3A2F6B', text: '#FFFFFF' },
  dragon: { bg: '#D6AF3F', text: '#000000' },
  electric: { bg: '#F6D64A', text: '#000000' },
  fairy: { bg: '#F0A8C0', text: '#000000' },
  fighting: { bg: '#4A3F3F', text: '#FFFFFF' },
  fire: { bg: '#F0802A', text: '#000000' },
  flying: { bg: '#7DB6D6', text: '#000000' },
  ghost: { bg: '#7A64A8', text: '#FFFFFF' },
  grass: { bg: '#6FC24A', text: '#000000' },
  ground: { bg: '#B0813A', text: '#FFFFFF' },
  ice: { bg: '#6BC7C7', text: '#000000' },
  normal: { bg: '#9A9AA0', text: '#000000' },
  poison: { bg: '#9B4AA3', text: '#FFFFFF' },
  psychic: { bg: '#453075', text: '#FFFFFF' },
  rock: { bg: '#6B5555', text: '#FFFFFF' },
  steel: { bg: '#C4C6DD', text: '#000000' },
  water: { bg: '#2B63C6', text: '#FFFFFF' }
};

/**
 * TypeBadge Component
 * @param {string} type - The Pokemon type name
 * @param {string} variant - 'full' (icon + text), 'mini' (icon only), 'circular' (small circular icon)
 * @param {string} size - 'small', 'medium', 'large' (for different icon sizes)
 */
function TypeBadge({ type, variant = 'full', size = 'medium' }) {
  const typeInfo = typeColors[type.toLowerCase()];
  const icon = typeIcons[type.toLowerCase()];
  
  if (!typeInfo || !icon) {
    console.warn(`Unknown type: ${type}`);
    return null;
  }

  const iconSizes = {
    small: '12px',
    medium: '16px',
    large: '20px'
  };

  const iconSize = iconSizes[size];

  if (variant === 'circular') {
    return (
      <div 
        className="type-badge-circular"
        style={{ 
          backgroundColor: typeInfo.bg,
          width: iconSize === '12px' ? '18px' : iconSize === '16px' ? '24px' : '30px',
          height: iconSize === '12px' ? '18px' : iconSize === '16px' ? '24px' : '30px',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2px'
        }}
        title={type.charAt(0).toUpperCase() + type.slice(1)}
      >
        <img 
          src={icon} 
          alt={type}
          style={{
            width: iconSize,
            height: iconSize,
            filter: typeInfo.text === '#000000' ? 
              'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)' :
              'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)'
          }}
        />
      </div>
    );
  }

  if (variant === 'mini') {
    return (
      <span 
        className="type-badge-mini"
        style={{ 
          backgroundColor: typeInfo.bg,
          color: typeInfo.text,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px',
          borderRadius: '6px',
          minWidth: iconSize === '12px' ? '20px' : iconSize === '16px' ? '26px' : '32px',
          height: iconSize === '12px' ? '20px' : iconSize === '16px' ? '26px' : '32px'
        }}
        title={type.charAt(0).toUpperCase() + type.slice(1)}
      >
        <img 
          src={icon} 
          alt={type}
          style={{
            width: iconSize,
            height: iconSize,
            filter: typeInfo.text === '#000000' ? 
              'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)' :
              'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)'
          }}
        />
      </span>
    );
  }

  // Full variant - icon + text
  return (
    <span 
      className="type-badge-full"
      style={{ 
        backgroundColor: typeInfo.bg,
        color: typeInfo.text,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'capitalize'
      }}
    >
      <img 
        src={icon} 
        alt={type}
        style={{
          width: iconSize,
          height: iconSize,
          filter: typeInfo.text === '#000000' ? 
            'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)' :
            'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)'
        }}
      />
      {type}
    </span>
  );
}

export default TypeBadge;