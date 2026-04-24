type ProfileUser = {
  id: number;
  name: string;
  email: string;
  bio?: string;
  avatar: string | null;
  hasOpenRouterConnection: boolean;
  openRouterKeyLabel: string | null;
  openRouterConnectedAt: Date | null;
  createdAt: Date;
};
export type ProfilePageClientProps = { user: ProfileUser };