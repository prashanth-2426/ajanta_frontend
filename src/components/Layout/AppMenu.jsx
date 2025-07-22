import AppSubMenu from "./AppSubMenu";
import { useSelector } from "react-redux";

const AppMenu = () => {
  const user = useSelector((state) => state.auth.user);
  console.log("User Info:", user);
  const role = user?.role;
  console.log("User Role:", role);
  const isAdmin = role === "admin";
  const isVendor = role === "vendor";
  const isBuyer = role === "user";

  const model = [
    {
      label: "Dashboards",
      icon: "pi pi-home",
      items: [
        {
          label: "Home",
          icon: "pi pi-fw pi-home",
          to: "/",
        },
        {
          label: "Analytics",
          icon: "pi pi-fw pi-image",
          items: [
            {
              label: "RFQ Analytics",
              icon: "pi pi-fw pi-image",
              to: "/media/list",
            },
            {
              label: "Auction Analytics",
              icon: "pi pi-fw pi-list",
              to: "/media/detail",
            },
            {
              label: "Road Transport Analytics",
              icon: "pi pi-fw pi-pencil",
              to: "/media/edit",
            },
            {
              label: "Ocean Freight Analytics",
              icon: "pi pi-fw pi-image",
              to: "/media/list",
            },
            {
              label: "Air Freight Analytics",
              icon: "pi pi-fw pi-list",
              to: "/media/detail",
            },
            {
              label: "Export as PDF",
              icon: "pi pi-fw pi-pencil",
              to: "/media/edit",
            },
          ],
        },
        ...(isBuyer
          ? [
              {
                label: "RFQ",
                icon: "pi pi-fw pi-home",
                to: "/createrfq",
              },
            ]
          : []),
        {
          label: "RFQ - Auction List",
          icon: "pi pi-fw pi-home",
          to: "/rfqs",
        },
        ...(isBuyer
          ? [
              {
                label: "Quotes Summary",
                icon: "pi pi-fw pi-home",
                to: "/quotesummary",
              },
            ]
          : []),
      ],
    },
    ...(isBuyer
      ? [
          {
            label: "Auctions",
            icon: "pi pi-image",
            items: [
              {
                label: "Forward Auction",
                icon: "pi pi-fw pi-file-edit",
                to: "/createrfq?source=forward",
              },
              {
                label: "Reverse Auction",
                icon: "pi pi-fw pi-file-edit",
                to: "/createrfq?source=reverse",
              },
            ],
          },
        ]
      : []),

    ...(isBuyer
      ? [
          {
            label: "Invoice Management",
            icon: "pi pi-link",
            items: [
              // {
              //   label: "LMS",
              //   icon: "pi pi-fw pi-tags",
              //   to: "/links",
              // },
              // {
              //   label: "CREA",
              //   icon: "pi pi-fw pi-link",
              //   to: "/crea",
              // },
            ],
          },
        ]
      : []),
    ...(isBuyer
      ? [
          {
            label: "Admin Panel",
            icon: "pi pi-th-large",
            items: [
              {
                label: "Add User",
                icon: "pi pi-fw pi-calendar",
                to: "/users/add",
              },
              {
                label: "User Management",
                icon: "pi pi-fw pi-calendar",
                to: "/users/usermanagement",
              },
              {
                label: "Vendor Management",
                icon: "pi pi-fw pi-calendar",
                to: "/vendormanagement",
              },
            ],
          },
        ]
      : []),
  ];

  return <AppSubMenu model={model} />;
};

export default AppMenu;
