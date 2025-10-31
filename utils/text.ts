import { TextElement, DesignData, TextSpan, RectElement } from '../types';

interface TextLayout {
  spans: TextSpan[];
  requiredHeight: number;
}

export const createTextBoxes = (obj: TextElement, currentDesignData: DesignData): TextLayout => {
  const linkedRect = currentDesignData[obj.linkedObj!] as RectElement;
  if (!linkedRect || !linkedRect.width) return { spans: [], requiredHeight: 0 };

  const textToProcess = obj.rawText || '';
  const fontSize = obj.fontSize || 20;
  const fontFamily = obj.fontFamily || 'Arial';
  const lineHeight = fontSize * 1.2;
  const padding = 10;
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return { spans: [], requiredHeight: 0 };
  context.font = `${fontSize}px ${fontFamily}`;
  const spaceWidth = context.measureText(' ').width;

  const containerX = linkedRect.x;
  const containerY = linkedRect.y;
  const maxWidth = linkedRect.width - padding * 2;
  if (maxWidth <= 0) return { spans: [], requiredHeight: linkedRect.height };

  const spans: TextSpan[] = [];
  let currentY = containerY + fontSize + padding / 2;

  const paragraphs = textToProcess.split('\n');

  for (const paragraph of paragraphs) {
    const words = paragraph.split(' ').filter(w => w.length > 0);
    if (words.length === 0 && paragraph === '') {
        currentY += lineHeight;
        continue;
    }

    let currentLineWords: string[] = [];
    
    for (const word of words) {
        const testLineWords = [...currentLineWords, word];
        const testLine = testLineWords.join(' ');
        const { width: testWidth } = context.measureText(testLine);

        if (testWidth > maxWidth && currentLineWords.length > 0) {
            let currentX = containerX + padding;
            for(const w of currentLineWords) {
                const wordWidth = context.measureText(w).width;
                // FIX: Replaced non-existent `fontColor` with correct `fill`, `stroke`, and `strokeWidth` properties from the TextElement.
                spans.push({ text: w, x: currentX, y: currentY, width: wordWidth, height: fontSize, fontSize, fontFamily, fill: obj.fill, stroke: obj.stroke, strokeWidth: obj.strokeWidth });
                currentX += wordWidth + spaceWidth;
            }
            currentLineWords = [word];
            currentY += lineHeight;
        } else {
            currentLineWords.push(word);
        }
    }

    let currentX = containerX + padding;
    for(const w of currentLineWords) {
        const wordWidth = context.measureText(w).width;
        // FIX: Replaced non-existent `fontColor` with correct `fill`, `stroke`, and `strokeWidth` properties from the TextElement.
        spans.push({ text: w, x: currentX, y: currentY, width: wordWidth, height: fontSize, fontSize, fontFamily, fill: obj.fill, stroke: obj.stroke, strokeWidth: obj.strokeWidth });
        currentX += wordWidth + spaceWidth;
    }

    currentY += lineHeight;
  }
  
  const requiredHeight = (currentY - containerY - lineHeight) + padding * 1.5;

  return { spans, requiredHeight: Math.max(fontSize + padding * 2, requiredHeight) };
};