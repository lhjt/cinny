import { style } from '@vanilla-extract/css';
import { color, config } from 'folds';

export const ThreadSelectorContainer = style({
  paddingTop: config.space.S100,
});

export const ThreadSelector = style({
  padding: config.space.S200,
  borderRadius: config.radii.R400,
});

export const ThreadSectorOutlined = style({
  borderWidth: config.borderWidth.B300,
});

export const ThreadRepliesCount = style({
  color: color.Primary.Main,
  flexShrink: 0,
});
