import {
  ChartArea,
  History,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

// export const sidebarItems: NavGroup[] = [
//   {
//     id: 1,
//     label: "Dashboards",
//     items: [
//       // {
//       //   title: "Dashboard",
//       //   url: "/dashboard",
//       //   icon: ChartArea,
//       // },
//     ],
//   },
//   {
//     id: 2,
//     label: "History",
//     items: [
//       // {
//       //   title: "History",
//       //   url: "/history",
//       //   icon: History,
//       // },
//     ],
//   },
// ];
