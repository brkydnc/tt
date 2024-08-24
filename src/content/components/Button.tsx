import React from "react";
import { Position } from "./Content";

export interface ButtonProps {
  position: Position,
  onClick: () => void,
}

const clamp = (n: number, l: number, h: number) => Math.min(Math.max(n, l), h);

// Repositions the given rectangle so that it fits the page.
// The top-left corner of the web page is assumed to be the origin.
function reposition(
  x: number,
  y: number,
  width: number,
  height: number,
  offsetX: number = 10,
  offsetY: number = 10,
  horizontalMargin: number = 20,
  verticalMargin: number = 20
): Position {
  const pageWidth = window.innerWidth
    || document.documentElement.clientWidth
    || document.body.clientWidth;

  const pageHeight = window.innerHeight
    || document.documentElement.clientHeight
    || document.body.clientHeight;

  return {
    x: clamp(x + offsetX, horizontalMargin, pageWidth - horizontalMargin - width),
    y: clamp(y + offsetY, verticalMargin, pageHeight - verticalMargin - height),
  }
}

export function Button({ position, onClick }: ButtonProps): JSX.Element {
  return (
    <div onMouseDown={onClick}>
      Tureng Translate Button
    </div>
  );
}