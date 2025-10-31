
import React from 'react';
import { GOOGLE_FONTS } from '../../constants';

const GoogleFonts: React.FC = () => {
  const fontFamilies = GOOGLE_FONTS
    .filter(f => f !== 'Arial') // Arial is a system font
    .map(f => f.replace(/ /g, '+'))
    .join('|');
  
  const fontUrl = `https://fonts.googleapis.com/css?family=${fontFamilies}&display=swap`;

  return (
    <style>
      {`@import url('${fontUrl}');`}
    </style>
  );
};

export default GoogleFonts;
