import { useCallback, useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { isKeyHotkey } from 'is-hotkey';
import { EventTimeline, MatrixEvent } from 'matrix-js-sdk';

import {
  getTimelineAndBaseIndex,
  getTimelineRelativeIndex,
  getTimelineEvent,
} from './roomTimelineUtils';

type ItemIndex = number;

export type TimelineSelectableItem = {
  eventId: string;
  itemIndex: ItemIndex;
};

export type TimelineSelectionAction = {
  hotkey: string;
  requiresSelection?: boolean;
  clearsSelection?: boolean;
  exitsNav?: boolean;
  handler: (eventId?: string) => void;
};

/**
 * Keyboard navigation/selection helper for room timelines.
 *
 * Notes:
 * - `getItems` must return absolute item indices that align with `linkedTimelines`.
 * - `shouldRenderEvent` should match the render logic, or selection may land on hidden events.
 * - `scrollToItem` is expected to support `align: 'center'` and `behavior: 'instant'`.
 */
type TimelineSelectionContext = {
  timelineNavMode: boolean;
  getItems: () => ItemIndex[];
  linkedTimelines: EventTimeline[];
  shouldRenderEvent: (mEvent: MatrixEvent) => boolean;
  scrollToItem: (
    itemIndex: ItemIndex,
    opts: { behavior: ScrollBehavior; align: string; stopInView: boolean }
  ) => void;
  onExitTimelineNav: () => void;
  isEditableActive?: () => boolean;
  /**
   * Increment when timeline contents change without a new linkedTimelines reference
   * (e.g. redactions/edits that cause in-place updates).
   */
  timelineRevision?: number;
};

const getSelectableItems = (
  getItems: TimelineSelectionContext['getItems'],
  linkedTimelines: TimelineSelectionContext['linkedTimelines'],
  shouldRenderEvent: TimelineSelectionContext['shouldRenderEvent']
): TimelineSelectableItem[] => {
  const items = getItems();
  const selectable: TimelineSelectableItem[] = [];

  items.forEach((itemIndex) => {
    const [eventTimeline, baseIndex] = getTimelineAndBaseIndex(linkedTimelines, itemIndex);
    if (!eventTimeline) return;
    const mEvent = getTimelineEvent(
      eventTimeline,
      getTimelineRelativeIndex(itemIndex, baseIndex)
    );
    const mEventId = mEvent?.getId();
    if (!mEvent || !mEventId) return;
    if (!shouldRenderEvent(mEvent)) return;
    selectable.push({ eventId: mEventId, itemIndex });
  });

  return selectable;
};

export const useRoomTimelineNav = (
  context: TimelineSelectionContext,
  actions: TimelineSelectionAction[]
) => {
  const {
    timelineNavMode,
    getItems,
    linkedTimelines,
    shouldRenderEvent,
    scrollToItem,
    onExitTimelineNav,
    isEditableActive,
    timelineRevision,
  } = context;
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();

  const selectableItems = useMemo(
    () => getSelectableItems(getItems, linkedTimelines, shouldRenderEvent),
    [getItems, linkedTimelines, shouldRenderEvent, timelineRevision]
  );

  useEffect(() => {
    if (!selectedEventId) return;
    if (!selectableItems.some((item) => item.eventId === selectedEventId)) {
      setSelectedEventId(undefined);
    }
  }, [selectableItems, selectedEventId]);

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent | ReactKeyboardEvent) => {
      const hotkeyEvent = 'nativeEvent' in evt ? evt.nativeEvent : evt;
      if (hotkeyEvent.metaKey || hotkeyEvent.ctrlKey || hotkeyEvent.altKey) return;
      if (!timelineNavMode && !selectedEventId) return;

      if (isKeyHotkey(['arrowup', 'arrowdown'], hotkeyEvent)) {
        if (selectableItems.length === 0) return;
        const moveUp = isKeyHotkey('arrowup', hotkeyEvent);
        const currentIndex = selectedEventId
          ? selectableItems.findIndex((item) => item.eventId === selectedEventId)
          : -1;
        const nextIndex =
          currentIndex === -1
            ? moveUp
              ? selectableItems.length - 1
              : 0
            : Math.min(
                Math.max(currentIndex + (moveUp ? -1 : 1), 0),
                selectableItems.length - 1
              );
        const nextItem = selectableItems[nextIndex];

        if (nextItem) {
          setSelectedEventId(nextItem.eventId);
          scrollToItem(nextItem.itemIndex, {
            behavior: 'instant',
            align: 'center',
            stopInView: true,
          });
          if (timelineNavMode) onExitTimelineNav();
        }

        evt.preventDefault();
        evt.stopPropagation();
        return;
      }

      const action = actions.find(
        ({ hotkey, requiresSelection }) =>
          isKeyHotkey(hotkey, hotkeyEvent) && (!requiresSelection || !!selectedEventId)
      );
      if (action) {
        evt.preventDefault();
        evt.stopPropagation();
        action.handler(selectedEventId);
        if (action.clearsSelection) setSelectedEventId(undefined);
        if (action.exitsNav) onExitTimelineNav();
        return;
      }

      if (selectedEventId && isEditableActive?.()) {
        setSelectedEventId(undefined);
      }
    },
    [
      actions,
      isEditableActive,
      onExitTimelineNav,
      scrollToItem,
      selectableItems,
      selectedEventId,
      timelineNavMode,
    ]
  );

  return {
    selectedEventId,
    setSelectedEventId,
    handleKeyDown,
  };
};
