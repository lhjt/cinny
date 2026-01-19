import React, { ReactNode } from 'react';
import classNames from 'classnames';
import { Box, ContainerColor, as, color } from 'folds';
import * as css from './layout.css';

type BubbleArrowProps = {
  variant: ContainerColor;
};
function BubbleLeftArrow({ variant }: BubbleArrowProps) {
  return (
    <svg
      className={css.BubbleLeftArrow}
      width="9"
      height="8"
      viewBox="0 0 9 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.00004 8V0H4.82847C3.04666 0 2.15433 2.15428 3.41426 3.41421L8.00004 8H9.00004Z"
        fill={color[variant].Container}
      />
    </svg>
  );
}

function BubbleRightArrow({ variant }: BubbleArrowProps) {
  return (
    <svg
      className={css.BubbleRightArrow}
      width="9"
      height="8"
      viewBox="0 0 9 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.00004 8V0H4.82847C3.04666 0 2.15433 2.15428 3.41426 3.41421L8.00004 8H9.00004Z"
        fill={color[variant].Container}
      />
    </svg>
  );
}

type BubbleLayoutProps = {
  hideBubble?: boolean;
  before?: ReactNode;
  header?: ReactNode;
  align?: 'left' | 'right';
};

export const BubbleLayout = as<'div', BubbleLayoutProps>(
  ({ className, hideBubble, before, header, align = 'left', children, ...props }, ref) => {
    const alignVariant = align === 'right' ? 'right' : 'left';
    const arrowClass =
      before && alignVariant === 'right'
        ? css.BubbleContentArrowRight
        : before
          ? css.BubbleContentArrowLeft
          : undefined;

    return (
      <Box
        className={classNames(css.BubbleLayout, css.BubbleLayoutAlign[alignVariant], className)}
        gap="300"
        {...props}
        ref={ref}
      >
        <Box
          className={classNames(css.BubbleBefore, css.BubbleBeforeAlign[alignVariant])}
          shrink="No"
        >
          {before}
        </Box>
        <Box
          className={classNames(css.BubbleBody, css.BubbleBodyAlign[alignVariant])}
          grow={alignVariant === 'right' ? 'No' : 'Yes'}
          direction="Column"
        >
          {header}
          {hideBubble ? (
            children
          ) : (
            <Box>
              <Box
                className={classNames(css.BubbleContent, arrowClass)}
                direction="Column"
              >
                {before ? (
                  alignVariant === 'right' ? (
                    <BubbleRightArrow variant="SurfaceVariant" />
                  ) : (
                    <BubbleLeftArrow variant="SurfaceVariant" />
                  )
                ) : null}
                {children}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  }
);
