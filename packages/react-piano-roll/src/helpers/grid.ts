import { basePixelsPerBeat, minGridPixel, ticksPerBeat } from "@/constants";
import { ceilToNearestPowerOfTwo, floorToNearestPowerOfTwo } from "./number";

export function getNumOfGrid(baseCanvasWidth: number) {
  const numberOfBarGrids = Math.ceil(baseCanvasWidth / (basePixelsPerBeat * 4));
  const numberOfHalfBarGrids = Math.ceil(baseCanvasWidth / (basePixelsPerBeat * 2));
  const numberOfQuarterGrids = Math.ceil(baseCanvasWidth / basePixelsPerBeat);
  const numberOfQuaversGrids = Math.ceil(baseCanvasWidth / basePixelsPerBeat);
  return {
    bar: numberOfBarGrids,
    halfBar: numberOfHalfBarGrids,
    quarter: numberOfQuarterGrids,
    quavers: numberOfQuaversGrids,
  };
}

export function getGridSeparationFactor(scaleX: number) {
  const barGridSeparationFactor = ceilToNearestPowerOfTwo(minGridPixel / (scaleX * basePixelsPerBeat * 4));
  const halfBarGridSeparationFactor = ceilToNearestPowerOfTwo(minGridPixel / (scaleX * basePixelsPerBeat * 2));
  const quarterGridSeparationFactor = ceilToNearestPowerOfTwo(minGridPixel / (scaleX * basePixelsPerBeat));
  const quaversGridSeparationFactor = floorToNearestPowerOfTwo((scaleX * basePixelsPerBeat) / minGridPixel);
  return {
    bar: barGridSeparationFactor,
    halfBar: halfBarGridSeparationFactor,
    quarter: quarterGridSeparationFactor,
    quavers: quaversGridSeparationFactor,
  };
}

export function getGridBaseSeparation(gridSeparationFactor: ReturnType<typeof getGridSeparationFactor>) {
  return {
    bar: 4,
    halfBar: 2,
    quarter: 1,
    quavers: 1 / gridSeparationFactor.quavers,
  };
}

export function getTickInGrid(scaleX: number) {
  let pixelsPerBeat = basePixelsPerBeat * scaleX;
  let ticksInGrid = ticksPerBeat;
  if (pixelsPerBeat < minGridPixel) {
    while (pixelsPerBeat < minGridPixel) {
      pixelsPerBeat *= 2;
      ticksInGrid *= 2;
    }
  } else if (pixelsPerBeat / 2 >= minGridPixel) {
    while (pixelsPerBeat / 2 >= minGridPixel) {
      pixelsPerBeat /= 2;
      ticksInGrid /= 2;
    }
  }
  return ticksInGrid;
}

export function getNearestGridTick(ticks: number, scaleX: number) {
  const ticksInGrid = getTickInGrid(scaleX);
  const upperGridTick = Math.ceil(ticks / ticksInGrid) * ticksInGrid;
  const lowerGridTick = Math.floor(ticks / ticksInGrid) * ticksInGrid;
  const upperGridTickDiff = upperGridTick - ticks;
  const lowerGridTickDiff = ticks - lowerGridTick;

  return upperGridTickDiff < lowerGridTickDiff ? upperGridTick : lowerGridTick;
}

export function getNearestGridTickWithOffset(ticks: number, scaleX: number, offset: number) {
  const ticksInGrid = getTickInGrid(scaleX);
  let upperGridTick;
  let lowerGridTick;
  const gridTickAnchor = Math.floor(ticks / ticksInGrid) * ticksInGrid + offset;
  if (ticks < gridTickAnchor) {
    upperGridTick = gridTickAnchor;
    lowerGridTick = gridTickAnchor - ticksInGrid;
  } else {
    upperGridTick = gridTickAnchor + ticksInGrid;
    lowerGridTick = gridTickAnchor;
  }
  const upperGridTickDiff = upperGridTick - ticks;
  const lowerGridTickDiff = ticks - lowerGridTick;

  return upperGridTickDiff < lowerGridTickDiff ? upperGridTick : lowerGridTick;
}

export function getNearestAnchor(ticks: number, scaleX: number, offset: number) {
  const ticksInGrid = getTickInGrid(scaleX);
  const nearestGridTick = getNearestGridTick(ticks, scaleX);
  const nearestGridTickWithOffset = getNearestGridTickWithOffset(ticks, scaleX, offset);
  const nearestGridTickDiff = Math.abs(nearestGridTick - ticks);
  const nearestGridTickWithOffsetDiff = Math.abs(nearestGridTickWithOffset - ticks);
  const anchor = nearestGridTickDiff < nearestGridTickWithOffsetDiff ? nearestGridTick : nearestGridTickWithOffset;

  return {
    anchor: anchor,
    proximity: Math.abs(anchor - ticks) / ticksInGrid < 0.4 ? true : false,
  };
}

export function getGridOffsetOfTick(ticks: number, scaleX: number) {
  const ticksInGrid = getTickInGrid(scaleX);
  const offset = ticks - Math.floor(ticks / ticksInGrid) * ticksInGrid;
  return offset;
}
