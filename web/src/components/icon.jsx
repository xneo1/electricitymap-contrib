import React, { memo } from 'react';

const path = window.isCordova ? resolvePath('images/icon-sprite.svg') : '/images/icon-sprite.svg';

/**
 * To add a new icon to the SVG sprite, open the icons SVG file and copy the the <svg> element.
 * Then paste the the <svg> element and rename it to <symbol> in the file 'icon-sprite.svg' and give it a unique id.
 *
 * Example <symbol> element:
 *   <symbol xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="info">
 *     <path d="M0 0h24v24H0z" fill="none"></path>
 *     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
 *   </symbol>
 */

const Icon = memo(({ iconName, size = 24, color }) => {
  return (
    <svg height={size} width={size} fill={color}>
      <use href={`${path}#${iconName}`} />
    </svg>
  );
});

export default Icon;
