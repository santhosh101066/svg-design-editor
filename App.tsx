
import React from 'react';
import { DesignProvider } from './context/DesignContext';
import Editor from './components/editor/Editor';
import GoogleFonts from './components/editor/GoogleFonts';

export default function App(): React.JSX.Element {
  return (
    <DesignProvider>
      <GoogleFonts />
      <Editor />
    </DesignProvider>
  );
}
