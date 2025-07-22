import React, { useState } from "react";
import { PrimeReactProvider } from "primereact/api";

export const LayoutContext = React.createContext({});

export const LayoutProvider = (props) => {
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [layoutConfig, setLayoutConfig] = useState({
    ripple: true,
    inputStyle: "outlined",
    menuMode: "static",
    colorScheme: "light",
    theme: "teal",
    scale: 14,
    menuTheme: "light",
    topbarTheme: "transparent",
  });

  const [layoutState, setLayoutState] = useState({
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    configSidebarVisible: false,
    profileSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
    rightMenuActive: false,
    topbarMenuActive: false,
    sidebarActive: false,
    anchored: false,
    overlaySubmenuActive: false,
    menuProfileActive: false,
    resetMenu: false,
  });

  const onMenuProfileToggle = () => {
    setLayoutState((prevLayoutState) => ({
      ...prevLayoutState,
      menuProfileActive: !prevLayoutState.menuProfileActive,
    }));
  };

  const isSidebarActive = () =>
    layoutState.overlayMenuActive ||
    layoutState.staticMenuMobileActive ||
    layoutState.overlaySubmenuActive;

  const onMenuToggle = () => {
    if (isOverlay()) {
      setLayoutState((prevLayoutState) => ({
        ...prevLayoutState,
        overlayMenuActive: !prevLayoutState.overlayMenuActive,
      }));
    }

    if (isDesktop()) {
      setLayoutState((prevLayoutState) => ({
        ...prevLayoutState,
        staticMenuDesktopInactive: !prevLayoutState.staticMenuDesktopInactive,
      }));
    } else {
      setLayoutState((prevLayoutState) => ({
        ...prevLayoutState,
        staticMenuMobileActive: !prevLayoutState.staticMenuMobileActive,
      }));
    }
  };

  const isOverlay = () => {
    return layoutConfig.menuMode === "overlay";
  };

  const isSlim = () => {
    return layoutConfig.menuMode === "slim";
  };

  const isSlimPlus = () => {
    return layoutConfig.menuMode === "slim-plus";
  };

  const isHorizontal = () => {
    return layoutConfig.menuMode === "horizontal";
  };

  const isDesktop = () => {
    return window.innerWidth > 991;
  };
  const onTopbarMenuToggle = () => {
    setLayoutState((prevLayoutState) => ({
      ...prevLayoutState,
      topbarMenuActive: !prevLayoutState.topbarMenuActive,
    }));
  };
  const showRightSidebar = () => {
    setLayoutState((prevLayoutState) => ({
      ...prevLayoutState,
      rightMenuActive: true,
    }));
  };
  const showConfigSidebar = () => {
    setLayoutState((prevLayoutState) => ({
      ...prevLayoutState,
      configSidebarVisible: true,
    }));
  };
  const showSidebar = () => {
    setLayoutState((prevLayoutState) => ({
      ...prevLayoutState,
      sidebarActive: true,
    }));
  };

  const value = {
    layoutConfig,
    setLayoutConfig,
    layoutState,
    setLayoutState,
    onMenuToggle,
    isSlim,
    isSlimPlus,
    isHorizontal,
    isDesktop,
    isSidebarActive,
    breadcrumbs,
    setBreadcrumbs,
    onMenuProfileToggle,
    onTopbarMenuToggle,
    showRightSidebar,
    showConfigSidebar,
    showSidebar,
  };

  return (
    <PrimeReactProvider>
      <LayoutContext.Provider value={value}>
        {props.children}
      </LayoutContext.Provider>
    </PrimeReactProvider>
  );
};
