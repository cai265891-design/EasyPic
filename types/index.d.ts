import { User } from "@prisma/client";
import type { Icon } from "lucide-react";

import { Icons } from "@/components/shared/icons";

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  mailSupport: string;
  links: {
    twitter: string;
    github: string;
  };
};

export type NavItem = {
  title: string;
  href: string;
  badge?: number;
  disabled?: boolean;
  external?: boolean;
  authorizeOnly?: UserRole;
  icon?: keyof typeof Icons;
};

export type MainNavItem = NavItem;

export type MarketingConfig = {
  mainNav: MainNavItem[];
};

export type SidebarNavItem = {
  title: string;
  items: NavItem[];
  authorizeOnly?: UserRole;
  icon?: keyof typeof Icons;
};

export type DocsConfig = {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
};

// subcriptions
export type SubscriptionPlan = {
  title: string;
  description: string;
  benefits: string[];
  limitations: string[];
  prices: {
    monthly: number;
    yearly: number;
  };
  stripeIds: {
    monthly: string | null;
    yearly: string | null;
  };
};

export type UserSubscriptionPlan = SubscriptionPlan &
  Pick<User, "stripeCustomerId" | "stripeSubscriptionId" | "stripePriceId"> & {
    stripeCurrentPeriodEnd: number;
    isPaid: boolean;
    interval: "month" | "year" | null;
    isCanceled?: boolean;
  };

// compare plans
export type ColumnType = string | boolean | null;
export type PlansRow = { feature: string; tooltip?: string } & {
  [key in (typeof plansColumns)[number]]: ColumnType;
};

// landing sections
export type InfoList = {
  icon: keyof typeof Icons;
  title: string;
  description: string;
};

export type InfoLdg = {
  title: string;
  image: string;
  description: string;
  list: InfoList[];
};

export type FeatureLdg = {
  title: string;
  description: string;
  link: string;
  icon: keyof typeof Icons;
};

export type TestimonialType = {
  name: string;
  job: string;
  image: string;
  review: string;
};

// Amazon Image Generator Types
export type TaskStatus = 'pending' | 'analyzing' | 'writing' | 'generating' | 'completed' | 'failed';

export type ImageType = 'original' | 'main' | 'lifestyle' | 'detail' | 'dimension' | 'feature';
export type GeneratedImageType = 'main' | 'lifestyle' | 'detail' | 'dimension' | 'feature';

export interface ImageItem {
  id: string;
  type: ImageType;
  url: string;
  width: number;
  height: number;
  fileSize: number;
}

export interface Copywriting {
  title: string;
  bulletPoints: string[];
  description: string;
  language: string; // 'en' | 'de' | 'fr' ...
}

export interface Project {
  id: string;
  name: string;
  status: TaskStatus;
  createdAt: string;
  images: ImageItem[];
  copywriting?: Copywriting;
  analysis?: Record<string, any>;
}

export interface CreateProjectPayload {
  name: string;
  files?: File[];
  options?: {
    productName?: string;
    keyFeatures?: string;
    specs?: string;
    category?: string;
    style?: string;
    language?: string;
  };
}
