export interface HeroTextStyle {
  fontFamily: string;
  fontWeight: number;
  fontSize: string;
  mobileFontSize: string;
  tabletFontSize: string;
  desktopFontSize: string;
  color: string;
  gradient: string;
  letterSpacing: string;
  lineHeight: string;
  alignment: "left" | "center" | "right";
  textShadow: string;
  animation: "fade" | "slide" | "zoom" | "none";
}

export interface HeroButtonStyle extends HeroTextStyle {
  text: string;
  href: string;
  visible: boolean;
  icon: string;
  iconPosition: "left" | "right";
  backgroundColor: string;
  backgroundGradient: string;
  borderColor: string;
  borderRadius: string;
  shadow: string;
  hoverAnimation: "scale" | "glow" | "slide" | "none";
  size: "sm" | "md" | "lg";
  padding: string;
}

export interface HeroImageSettings {
  src: string;
  mobileSrc: string;
  tabletSrc: string;
  desktopSrc: string;
  alt: string;
  position: string;
  scale: number;
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  blur: number;
  rotate: number;
  flipX: boolean;
  flipY: boolean;
  overlayColor: string;
  gradientOverlay: string;
  overlayOpacity: number;
  borderRadius: string;
  parallax: boolean;
  backgroundSize: string;
  backgroundRepeat: string;
  backgroundAttachment: string;
  animation: "float" | "zoom" | "fade" | "none";
  preload: boolean;
}

export interface HeroLogoSettings {
  src: string;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
  borderRadius: string;
  shadow: string;
  glow: string;
  background: string;
  visible: boolean;
  margin: string;
  padding: string;
  positionDesktop: string;
  positionTablet: string;
  positionMobile: string;
}

export interface HeroBookingBarFieldLabels {
  checkIn: string;
  checkOut: string;
  guests: string;
  children: string;
  room: string;
}

export interface HeroBookingBarColors {
  label: string;
  value: string;
  divider: string;
  border: string;
  buttonText: string;
  buttonGradientFrom: string;
  buttonGradientTo: string;
}

export interface HeroBookingBarIcons {
  checkIn: string;
  checkOut: string;
  guests: string;
  children: string;
  room: string;
}

export interface HeroBookingBarAnimationSettings {
  entrance: boolean;
  float: boolean;
  buttonGlow: boolean;
  hoverGlow: boolean;
  buttonLift: boolean;
}

export interface HeroBookingBarResponsiveSettings {
  desktopBottom: string;
  desktopMaxWidth: string;
  desktopWidth: string;
  desktopMinWidth: string;
  mobileBottom: string;
  mobileHorizontalInset: string;
  mobileRadius: string;
  mobilePadding: string;
}

export interface HeroBookingBarDefaults {
  guests: string;
  children: string;
  rooms: string;
}

export interface HeroBookingBarSettings {
  enabled: boolean;
  fixedPosition: boolean;
  background: string;
  /** Soft gold frame border around the whole booking bar. */
  borderColor: string;
  defaults: HeroBookingBarDefaults;
  glassEffect: boolean;
  blur: number;
  shadow: string;
  borderRadius: string;
  height: string;
  maxWidth: string;
  padding: string;
  margin: string;
  gap: string;
  buttonText: string;
  buttonGradient: string;
  buttonColor: string;
  buttonHeight: string;
  buttonWidth: string;
  buttonBorderRadius: string;
  buttonShadow: string;
  fieldBorderRadius: string;
  fieldPadding: string;
  labelFontSize: string;
  valueFontSize: string;
  labelLetterSpacing: string;
  spacing: string;
  colors: HeroBookingBarColors;
  labels: HeroBookingBarFieldLabels;
  icons: HeroBookingBarIcons;
  animations: HeroBookingBarAnimationSettings;
  responsive: HeroBookingBarResponsiveSettings;
  fields: {
    checkIn: boolean;
    checkOut: boolean;
    guests: boolean;
    children: boolean;
    room: boolean;
  };
}

export interface HeroEffectsSettings {
  goldenGlow: boolean;
  creamGlow: boolean;
  orangeGlow: boolean;
  greenGlow: boolean;
  lightRays: boolean;
  fog: boolean;
  floatingLeaves: boolean;
  floatingShapes: boolean;
  particles: boolean;
  blur: number;
  gradient: string;
}

export interface HeroFloatingSettings {
  shapeCount: number;
  shapeSize: number;
  rotation: number;
  speed: number;
  opacity: number;
  animation: "float" | "drift" | "pulse" | "none";
  randomMovement: boolean;
}

export interface HeroAnimationSettings {
  entrance: "fade" | "slide" | "zoom" | "scale";
  scrollReveal: boolean;
  mouseParallax: boolean;
  transitionDuration: number;
  easing: string;
}

export interface HeroResponsiveSettings {
  desktopPadding: string;
  tabletPadding: string;
  mobilePadding: string;
  imageSizeDesktop: number;
  imageSizeTablet: number;
  imageSizeMobile: number;
  contentAlignment: "left" | "center";
}

export interface HeroSeoSettings {
  heroTitle: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  twitterImage: string;
  altText: string;
  schemaEnabled: boolean;
}

export interface HeroColorSettings {
  cream: string;
  lightCream: string;
  royalGreen: string;
  premiumGold: string;
  softOrange: string;
  accent: string;
  green: string;
  white: string;
  dark: string;
  champagne: string;
}

export interface HeroFeatureItem {
  id: string;
  /** Lucide icon name (e.g. "map-pin", "badge-check", "headphones"). */
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
}

export type HeroMediaMode = "none" | "image" | "video";

export interface HeroBuilderSettings {
  schemaVersion: 2;
  layout: "premium" | "classic";
  type: "animated" | "image" | "video" | "premium";
  /**
   * Hero background media: "none" = clean luxury gradient (default),
   * "image" = image.src cover, "video" = videoSrc cover.
   */
  mediaMode: HeroMediaMode;
  videoAutoplay: boolean;
  videoLoop: boolean;
  videoMuted: boolean;
  desktopHeight: string;
  mobileHeight: string;
  bookingPosition: string;
  showTitle: boolean;
  welcomeText: string;
  title: string;
  subtitle: string;
  description: string;
  videoSrc: string;
  imageSrc: string;
  poster: string;
  overlayOpacity: number;
  overlayColor: string;
  height: "screen" | "large" | "medium";
  animation: "particles" | "gradient" | "both";
  showBookingBar: boolean;
  showScrollIndicator: boolean;
  primaryButton: HeroButtonStyle;
  secondaryButton: HeroButtonStyle;
  /** Feature icon row rendered above the booking bar (Prime Location, etc). */
  features: HeroFeatureItem[];
  showFeatures: boolean;
  /** Last replaced hero media, for one-click restore in Orbit. */
  previousMedia: { imageSrc: string; videoSrc: string };
  colors: HeroColorSettings;
  image: HeroImageSettings;
  logo: HeroLogoSettings;
  titleStyle: HeroTextStyle;
  subtitleStyle: HeroTextStyle;
  descriptionStyle: HeroTextStyle;
  welcomeStyle: HeroTextStyle;
  bookingBar: HeroBookingBarSettings;
  effects: HeroEffectsSettings;
  floating: HeroFloatingSettings;
  animations: HeroAnimationSettings;
  responsive: HeroResponsiveSettings;
  seo: HeroSeoSettings;
}
