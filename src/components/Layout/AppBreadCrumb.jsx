import { ObjectUtils } from "primereact/utils";
import React, { useContext, useEffect, useRef, useState } from "react";
import { LayoutContext } from "../../store/layoutContext";
import { useLocation } from "react-router-dom";

const AppBreadcrumb = () => {
  const [searchActive, setSearchActive] = useState(false);
  const location = useLocation();
  const { pathname } = location;
  const [breadcrumb, setBreadcrumb] = useState(null);
  const { breadcrumbs, showSidebar } = useContext(LayoutContext);
  const searchInput = useRef(null);

  useEffect(() => {
    if (breadcrumbs.length === 0) return;
    const filteredBreadcrumbs = breadcrumbs?.find((crumb) => {
      const lastPathSegment = crumb?.to?.split("/").pop();
      //console.log("lastPathSegment value", lastPathSegment);
      //console.log("pathname value", pathname);
      const lastRouterSegment = pathname.split("/").pop();
      //console.log("lastRouterSegment value", lastRouterSegment);
      if (
        lastRouterSegment?.startsWith("[") &&
        !isNaN(Number(lastPathSegment))
      ) {
        return (
          pathname.split("/").slice(0, -1).join("/") ===
          crumb.to?.split("/").slice(0, -1).join("/")
        );
      }
      return crumb.to === pathname;
    });
    //console.log("filteredBreadcrumbs value", filteredBreadcrumbs);
    setBreadcrumb(filteredBreadcrumbs);
  }, [pathname, breadcrumbs]);

  const activateSearch = () => {
    setSearchActive(true);
    setTimeout(() => {
      (searchInput?.current).focus();
    }, 100);
  };

  const deactivateSearch = () => {
    setSearchActive(false);
  };

  const onSidebarButtonClick = () => {
    showSidebar();
  };

  return (
    <div className="layout-breadcrumb flex align-items-center relative h-3rem">
      <nav className="layout-breadcrumb">
        <ol>
          {ObjectUtils.isNotEmpty(breadcrumb) && pathname !== "/" ? (
            breadcrumb?.labels?.map((label, index) => {
              return (
                <React.Fragment key={index}>
                  {index !== 0 && (
                    <li className="layout-breadcrumb-chevron"> / </li>
                  )}
                  <li key={index}>{label}</li>
                </React.Fragment>
              );
            })
          ) : (
            <>
              {pathname === "/" && <li key={"home"}>Ajantha Home Dashbaord</li>}
            </>
          )}
        </ol>
      </nav>
    </div>
  );
};

export default AppBreadcrumb;
