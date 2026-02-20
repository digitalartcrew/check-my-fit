export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  OutfitDetail: { outfitId: string };
  PublicProfile: { userId: string };
  AISuggestion: { outfitId: string };
};

export type TabParamList = {
  Feed: undefined;
  Upload: undefined;
  Profile: undefined;
};
