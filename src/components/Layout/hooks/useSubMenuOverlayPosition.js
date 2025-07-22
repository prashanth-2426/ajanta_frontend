import { useEventListener } from "primereact/hooks";
import { DomHandler } from "primereact/utils";
import { useContext, useEffect } from "react";
import { LayoutContext } from "../../../store/layoutContext";
import { MenuContext } from "../../../store/menuContext";

export const useSubmenuOverlayPosition = ({
  target,
  overlay,
  container,
  when,
}) => {
  const { isSlim, isSlimPlus, isHorizontal, setLayoutState } =
    useContext(LayoutContext);
  const { activeMenu } = useContext(MenuContext);

  const handleScroll = () => {
    setLayoutState((prevLayoutState) => ({
      ...prevLayoutState,
      overlayMenuActive: false,
      overlaySubmenuActive: false,
      staticMenuMobileActive: false,
      menuHoverActive: false,
      resetMenu: true,
    }));
  };

  const [bindScrollListener, unbindScrollListener] = useEventListener({
    type: "scroll",
    target: container,
    listener: handleScroll,
  });

  const calculatePosition = () => {
    if (overlay && target) {
      const { left, top } = target.getBoundingClientRect();
      const { width: vWidth, height: vHeight } = DomHandler.getViewport();
      const [oWidth, oHeight] = [overlay.offsetWidth, overlay.offsetHeight];
      const scrollbarWidth = DomHandler.calculateScrollbarWidth(container);
      const topbarEl = document.querySelector(".layout-topbar");
      const topbarHeight = topbarEl?.offsetHeight || 0;

      // reset
      overlay.style.top = overlay.style.left = "";

      if (isHorizontal()) {
        const width = left + oWidth + scrollbarWidth;
        overlay.style.left =
          vWidth < width ? `${left - (width - vWidth)}px` : `${left}px`;
      } else if (isSlim() || isSlimPlus()) {
        const topOffset = top - topbarHeight;
        const height = topOffset + oHeight + topbarHeight;
        overlay.style.top =
          vHeight < height
            ? `${topOffset - (height - vHeight)}px`
            : `${topOffset}px`;
      }
    }
  };

  useEffect(() => {
    if (when) {
      bindScrollListener();
    }

    return () => {
      unbindScrollListener();
    };
  }, [when]);

  useEffect(() => {
    if (when) {
      calculatePosition();
    }
  }, [when, activeMenu]);
};
