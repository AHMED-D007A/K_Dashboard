import {
  ChartArea,
  History,
  // Home,
  // ChartPie,
  // Grid2X2,
  // ChartLine,
  // ShoppingBag,
  // BookA,
  // Forklift,
  // Mail,
  // MessageSquare,
  // Calendar,
  // Kanban,
  // ReceiptText,
  // Users,
  // Lock,
  // Fingerprint,
  // SquareArrowUpRight,
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

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: ChartArea,
      },
    ],
  },
  {
    id: 2,
    label: "History",
    items: [
      {
        title: "History",
        url: "/history",
        icon: History,
      },
    ],
  },
];
