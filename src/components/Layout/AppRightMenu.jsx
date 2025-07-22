import { Sidebar } from "primereact/sidebar";
import { useContext } from "react";
import { LayoutContext } from "../../store/layoutContext";
import { Button } from "primereact/button";

import sunImg from "../../assets/images/rightpanel/icon-sun.svg";
import bgImg from "../../assets/images/rightpanel/asset-weather.png";

const AppProfileSidebar = () => {
  const { layoutState, setLayoutState, layoutConfig } =
    useContext(LayoutContext);

  const onRightMenuHide = () => {
    setLayoutState((prevLayoutState) => ({
      ...prevLayoutState,
      rightMenuActive: false,
    }));
  };

  return (
    <Sidebar
      visible={layoutState.rightMenuActive}
      onHide={onRightMenuHide}
      baseZIndex={1000}
      position="right"
      showCloseIcon={false}
    >
      <div className="p-0 py-3weather-section">
        <div className="flex align-items-center justify-content-between mb-3">
          <h6 className="m-0">Today</h6>
        </div>
        <div
          className="weather flex align-items-center py-3 px-4 bg-center bg-no-repeat bg-cover border-round-lg"
          style={{
            boxShadow: "0px 10px 40 rgba(#293241, 6%)",
            backgroundImage: `url(${bgImg})`,
          }}
        >
          <img src={sunImg} alt="freya-layout" style={{ height: "60px" }} />
          <div className="ml-3">
            <h6 className="m-0 mb-1" style={{ color: "rgb(83 88 99)" }}>
              Bangalore, 04-03
            </h6>
            <h1 className="m-0" style={{ color: "rgb(83 88 99)" }}>
              24º
            </h1>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default AppProfileSidebar;
