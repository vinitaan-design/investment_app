// Foundations
export { cn } from "./lib/cn";
export { formatINR } from "./lib/format";

// Actions
export {
  Button,
  buttonClasses,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from "./components/button";

// Form controls
export { Input, type InputProps } from "./components/input";
export { Select, type SelectOption, type SelectProps } from "./components/select";
export { Checkbox, type CheckboxProps } from "./components/checkbox";
export { RadioGroup, type RadioGroupProps, type RadioOption } from "./components/radio-group";
export { Switch, type SwitchProps } from "./components/switch";

// Feedback
export { Alert, type AlertProps, type AlertTone } from "./components/alert";
export { Badge, type BadgeProps, type BadgeTone } from "./components/badge";
export {
  BookingStatusBadge,
  bookingStatusDisplay,
  type BookingStatus,
} from "./components/booking-status-badge";
export { ProgressBar, toPercent, type ProgressBarProps } from "./components/progress-bar";
export { Skeleton, type SkeletonProps } from "./components/skeleton";
export { EmptyState, type EmptyStateProps } from "./components/empty-state";

// Overlays
export { Dialog, type DialogProps } from "./components/dialog";

// Layout and navigation
export { Card, type CardElevation, type CardProps } from "./components/card";
export { Tabs, type TabItem, type TabsProps } from "./components/tabs";

// Data display
export { Avatar, initials, type AvatarProps, type AvatarSize } from "./components/avatar";
export { StatCard, type StatCardProps, type StatTrend } from "./components/stat-card";
export { GoalCard, type GoalCardProps, type GoalStatus } from "./components/goal-card";

// App structure
export {
  AppShell,
  SideNav,
  activeIndex,
  isActivePath,
  type AppShellProps,
  type LinkLikeProps,
  type NavItem,
  type SideNavProps,
} from "./components/app-shell";
export { DataTable, type DataTableColumn, type DataTableProps } from "./components/data-table";
export { List, ListRow, type ListRowProps } from "./components/list-row";
export { ConsultantCard, type ConsultantCardProps } from "./components/consultant-card";
