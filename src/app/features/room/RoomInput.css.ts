import { style } from '@vanilla-extract/css';
import { color, config } from 'folds';

export const RoomInputFrame = style({
  outline: 'none',
});

export const RoomInputFrameActive = style({
  selectors: {
    '&:focus-within': {
      outline: `2px solid ${color.Primary.ContainerActive}`,
      outlineOffset: config.space.S100,
      borderRadius: config.radii.R400,
    },
  },
});
