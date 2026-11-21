/**
 * The site's icons: Solar (https://solar-icons.dev), Outline by default and Bold when `active` (Qorelly design rule:
 * Bold for the active state, Outline for inactive). Exported under the names the components already use, so a
 * component only imports from here. Brand logos (GitHub, GitLab, Instagram, LinkedIn) have no Solar version and
 * stay brand marks. Size and colour work as before: Tailwind classes (h-4 w-4, text-primary) and currentColor.
 */
import { forwardRef, type ComponentType, type ForwardRefExoticComponent, type RefAttributes, type SVGProps } from "react";
import {
  AddIcon as AddIconOutline,
  AltArrowDownIcon as AltArrowDownIconOutline,
  AltArrowLeftIcon as AltArrowLeftIconOutline,
  AltArrowRightIcon as AltArrowRightIconOutline,
  AltArrowUpIcon as AltArrowUpIconOutline,
  ArrowDownIcon as ArrowDownIconOutline,
  ArrowLeftIcon as ArrowLeftIconOutline,
  ArrowRightIcon as ArrowRightIconOutline,
  ArrowRightUpIcon as ArrowRightUpIconOutline,
  ArrowUpFromLineIcon as ArrowUpFromLineIconOutline,
  ArrowUpIcon as ArrowUpIconOutline,
  AtomIcon as AtomIconOutline,
  BankIcon as BankIconOutline,
  Book2Icon as Book2IconOutline,
  BotIcon as BotIconOutline,
  BoxIcon as BoxIconOutline,
  BoxMinimalisticIcon as BoxMinimalisticIconOutline,
  BugIcon as BugIconOutline,
  Buildings2Icon as Buildings2IconOutline,
  BusIcon as BusIconOutline,
  CalendarDateIcon as CalendarDateIconOutline,
  CalendarIcon as CalendarIconOutline,
  CalendarMarkIcon as CalendarMarkIconOutline,
  CameraIcon as CameraIconOutline,
  CartLargeIcon as CartLargeIconOutline,
  CaseIcon as CaseIconOutline,
  ChatRoundIcon as ChatRoundIconOutline,
  ChatSquare2Icon as ChatSquare2IconOutline,
  ChatSquareLineIcon as ChatSquareLineIconOutline,
  ChatSquareQuoteIcon as ChatSquareQuoteIconOutline,
  CheckCircleIcon as CheckCircleIconOutline,
  CheckIcon as CheckIconOutline,
  CircleDotIcon as CircleDotIconOutline,
  CircleIcon as CircleIconOutline,
  ClockCircleIcon as ClockCircleIconOutline,
  CloseIcon as CloseIconOutline,
  CloudIcon as CloudIconOutline,
  CodeIcon as CodeIconOutline,
  CodeSquareIcon as CodeSquareIconOutline,
  CompassIcon as CompassIconOutline,
  CopyIcon as CopyIconOutline,
  DangerCircleIcon as DangerCircleIconOutline,
  DangerTriangleIcon as DangerTriangleIconOutline,
  DatabaseIcon as DatabaseIconOutline,
  DownloadMinimalisticIcon as DownloadMinimalisticIconOutline,
  EyeClosedIcon as EyeClosedIconOutline,
  EyeIcon as EyeIconOutline,
  FileCodeIcon as FileCodeIconOutline,
  FileDownloadIcon as FileDownloadIconOutline,
  FileSendIcon as FileSendIconOutline,
  FileTextIcon as FileTextIconOutline,
  FlagIcon as FlagIconOutline,
  FlaskIcon as FlaskIconOutline,
  FolderGitIcon as FolderGitIconOutline,
  FolderIcon as FolderIconOutline,
  GalleryAddIcon as GalleryAddIconOutline,
  GitBranchIcon as GitBranchIconOutline,
  GitForkIcon as GitForkIconOutline,
  GitPullRequestIcon as GitPullRequestIconOutline,
  GlobalIcon as GlobalIconOutline,
  GraphUpIcon as GraphUpIconOutline,
  GripVerticalIcon as GripVerticalIconOutline,
  HamburgerMenuIcon as HamburgerMenuIconOutline,
  HandHeartIcon as HandHeartIconOutline,
  HandIcon as HandIconOutline,
  HeartIcon as HeartIconOutline,
  HomeIcon as HomeIconOutline,
  JusticeScaleIcon as JusticeScaleIconOutline,
  KeyIcon as KeyIconOutline,
  LayersIcon as LayersIconOutline,
  LetterIcon as LetterIconOutline,
  LightbulbIcon as LightbulbIconOutline,
  LinkCircleIcon as LinkCircleIconOutline,
  LoaderIcon as LoaderIconOutline,
  LockIcon as LockIconOutline,
  LogoutIcon as LogoutIconOutline,
  MagnifierIcon as MagnifierIconOutline,
  MapIcon as MapIconOutline,
  MapPointIcon as MapPointIconOutline,
  MaximizeIcon as MaximizeIconOutline,
  MedalRibbonStarIcon as MedalRibbonStarIconOutline,
  MegaphoneIcon as MegaphoneIconOutline,
  MentionCircleIcon as MentionCircleIconOutline,
  MenuDotsIcon as MenuDotsIconOutline,
  MoonIcon as MoonIconOutline,
  NotebookIcon as NotebookIconOutline,
  PaletteIcon as PaletteIconOutline,
  Pen2Icon as Pen2IconOutline,
  PenIcon as PenIconOutline,
  PhoneIcon as PhoneIconOutline,
  PinIcon as PinIconOutline,
  PlaneIcon as PlaneIconOutline,
  PlayIcon as PlayIconOutline,
  PlugIcon as PlugIconOutline,
  QrCodeIcon as QrCodeIconOutline,
  QuoteIcon as QuoteIconOutline,
  RestartIcon as RestartIconOutline,
  RocketIcon as RocketIconOutline,
  RssIcon as RssIconOutline,
  ServerIcon as ServerIconOutline,
  ShareIcon as ShareIconOutline,
  ShieldCheckIcon as ShieldCheckIconOutline,
  SidebarMinimalisticIcon as SidebarMinimalisticIconOutline,
  SledgehammerIcon as SledgehammerIconOutline,
  SmartphoneIcon as SmartphoneIconOutline,
  SparklesIcon as SparklesIconOutline,
  SpeedometerMiddleIcon as SpeedometerMiddleIconOutline,
  SquareAcademicCapIcon as SquareAcademicCapIconOutline,
  StarIcon as StarIconOutline,
  StructureIcon as StructureIconOutline,
  SunIcon as SunIconOutline,
  TagIcon as TagIconOutline,
  TargetIcon as TargetIconOutline,
  TrashBinMinimalisticIcon as TrashBinMinimalisticIconOutline,
  UndoLeftIcon as UndoLeftIconOutline,
  UserIcon as UserIconOutline,
  UserRoundedIcon as UserRoundedIconOutline,
  UsersGroupRoundedIcon as UsersGroupRoundedIconOutline,
  VerifiedCheckIcon as VerifiedCheckIconOutline,
  VideocameraIcon as VideocameraIconOutline,
  WalletIcon as WalletIconOutline,
  Widget2Icon as Widget2IconOutline,
  WindowFrameIcon as WindowFrameIconOutline,
  WrenchIcon as WrenchIconOutline,
} from "@solar-icons/react/outline";
import {
  AddIcon as AddIconBold,
  AltArrowDownIcon as AltArrowDownIconBold,
  AltArrowLeftIcon as AltArrowLeftIconBold,
  AltArrowRightIcon as AltArrowRightIconBold,
  AltArrowUpIcon as AltArrowUpIconBold,
  ArrowDownIcon as ArrowDownIconBold,
  ArrowLeftIcon as ArrowLeftIconBold,
  ArrowRightIcon as ArrowRightIconBold,
  ArrowRightUpIcon as ArrowRightUpIconBold,
  ArrowUpFromLineIcon as ArrowUpFromLineIconBold,
  ArrowUpIcon as ArrowUpIconBold,
  AtomIcon as AtomIconBold,
  BankIcon as BankIconBold,
  Book2Icon as Book2IconBold,
  BotIcon as BotIconBold,
  BoxIcon as BoxIconBold,
  BoxMinimalisticIcon as BoxMinimalisticIconBold,
  BugIcon as BugIconBold,
  Buildings2Icon as Buildings2IconBold,
  BusIcon as BusIconBold,
  CalendarDateIcon as CalendarDateIconBold,
  CalendarIcon as CalendarIconBold,
  CalendarMarkIcon as CalendarMarkIconBold,
  CameraIcon as CameraIconBold,
  CartLargeIcon as CartLargeIconBold,
  CaseIcon as CaseIconBold,
  ChatRoundIcon as ChatRoundIconBold,
  ChatSquare2Icon as ChatSquare2IconBold,
  ChatSquareLineIcon as ChatSquareLineIconBold,
  ChatSquareQuoteIcon as ChatSquareQuoteIconBold,
  CheckCircleIcon as CheckCircleIconBold,
  CheckIcon as CheckIconBold,
  CircleDotIcon as CircleDotIconBold,
  CircleIcon as CircleIconBold,
  ClockCircleIcon as ClockCircleIconBold,
  CloseIcon as CloseIconBold,
  CloudIcon as CloudIconBold,
  CodeIcon as CodeIconBold,
  CodeSquareIcon as CodeSquareIconBold,
  CompassIcon as CompassIconBold,
  CopyIcon as CopyIconBold,
  DangerCircleIcon as DangerCircleIconBold,
  DangerTriangleIcon as DangerTriangleIconBold,
  DatabaseIcon as DatabaseIconBold,
  DownloadMinimalisticIcon as DownloadMinimalisticIconBold,
  EyeClosedIcon as EyeClosedIconBold,
  EyeIcon as EyeIconBold,
  FileCodeIcon as FileCodeIconBold,
  FileDownloadIcon as FileDownloadIconBold,
  FileSendIcon as FileSendIconBold,
  FileTextIcon as FileTextIconBold,
  FlagIcon as FlagIconBold,
  FlaskIcon as FlaskIconBold,
  FolderGitIcon as FolderGitIconBold,
  FolderIcon as FolderIconBold,
  GalleryAddIcon as GalleryAddIconBold,
  GitBranchIcon as GitBranchIconBold,
  GitForkIcon as GitForkIconBold,
  GitPullRequestIcon as GitPullRequestIconBold,
  GlobalIcon as GlobalIconBold,
  GraphUpIcon as GraphUpIconBold,
  GripVerticalIcon as GripVerticalIconBold,
  HamburgerMenuIcon as HamburgerMenuIconBold,
  HandHeartIcon as HandHeartIconBold,
  HandIcon as HandIconBold,
  HeartIcon as HeartIconBold,
  HomeIcon as HomeIconBold,
  JusticeScaleIcon as JusticeScaleIconBold,
  KeyIcon as KeyIconBold,
  LayersIcon as LayersIconBold,
  LetterIcon as LetterIconBold,
  LightbulbIcon as LightbulbIconBold,
  LinkCircleIcon as LinkCircleIconBold,
  LoaderIcon as LoaderIconBold,
  LockIcon as LockIconBold,
  LogoutIcon as LogoutIconBold,
  MagnifierIcon as MagnifierIconBold,
  MapIcon as MapIconBold,
  MapPointIcon as MapPointIconBold,
  MaximizeIcon as MaximizeIconBold,
  MedalRibbonStarIcon as MedalRibbonStarIconBold,
  MegaphoneIcon as MegaphoneIconBold,
  MentionCircleIcon as MentionCircleIconBold,
  MenuDotsIcon as MenuDotsIconBold,
  MoonIcon as MoonIconBold,
  NotebookIcon as NotebookIconBold,
  PaletteIcon as PaletteIconBold,
  Pen2Icon as Pen2IconBold,
  PenIcon as PenIconBold,
  PhoneIcon as PhoneIconBold,
  PinIcon as PinIconBold,
  PlaneIcon as PlaneIconBold,
  PlayIcon as PlayIconBold,
  PlugIcon as PlugIconBold,
  QrCodeIcon as QrCodeIconBold,
  QuoteIcon as QuoteIconBold,
  RestartIcon as RestartIconBold,
  RocketIcon as RocketIconBold,
  RssIcon as RssIconBold,
  ServerIcon as ServerIconBold,
  ShareIcon as ShareIconBold,
  ShieldCheckIcon as ShieldCheckIconBold,
  SidebarMinimalisticIcon as SidebarMinimalisticIconBold,
  SledgehammerIcon as SledgehammerIconBold,
  SmartphoneIcon as SmartphoneIconBold,
  SparklesIcon as SparklesIconBold,
  SpeedometerMiddleIcon as SpeedometerMiddleIconBold,
  SquareAcademicCapIcon as SquareAcademicCapIconBold,
  StarIcon as StarIconBold,
  StructureIcon as StructureIconBold,
  SunIcon as SunIconBold,
  TagIcon as TagIconBold,
  TargetIcon as TargetIconBold,
  TrashBinMinimalisticIcon as TrashBinMinimalisticIconBold,
  UndoLeftIcon as UndoLeftIconBold,
  UserIcon as UserIconBold,
  UserRoundedIcon as UserRoundedIconBold,
  UsersGroupRoundedIcon as UsersGroupRoundedIconBold,
  VerifiedCheckIcon as VerifiedCheckIconBold,
  VideocameraIcon as VideocameraIconBold,
  WalletIcon as WalletIconBold,
  Widget2Icon as Widget2IconBold,
  WindowFrameIcon as WindowFrameIconBold,
  WrenchIcon as WrenchIconBold,
} from "@solar-icons/react/bold";
export { Github, Gitlab, Instagram, Linkedin } from "lucide-react";

export type IconProps = SVGProps<SVGSVGElement> & {
  /** Bold style for the active state (selected tab, current page). Outline otherwise. */
  active?: boolean;
  strokeWidth?: number | string;
  /** Width and height in px, like Lucide's size prop. */
  size?: number | string;
};
export type Icon = ForwardRefExoticComponent<Omit<IconProps, "ref"> & RefAttributes<SVGSVGElement>>;
/** Kept so existing `LucideIcon` type annotations keep working. */
export type LucideIcon = Icon;

type SolarComponent = ComponentType<SVGProps<SVGSVGElement> & { ref?: unknown }>;

const solar = (outline: SolarComponent, bold: SolarComponent, name: string): Icon => {
  const C = forwardRef<SVGSVGElement, IconProps>(({ active, size, strokeWidth: _strokeWidth, ...props }, ref) => {
    const Svg = active ? bold : outline;
    const dims = size === undefined ? {} : { width: size, height: size };
    return <Svg ref={ref} aria-hidden {...dims} {...props} />;
  });
  C.displayName = name;
  return C;
};

export const AlertCircle = solar(DangerCircleIconOutline, DangerCircleIconBold, "AlertCircle");
export const AlertTriangle = solar(DangerTriangleIconOutline, DangerTriangleIconBold, "AlertTriangle");
export const ArrowDown = solar(ArrowDownIconOutline, ArrowDownIconBold, "ArrowDown");
export const ArrowLeft = solar(ArrowLeftIconOutline, ArrowLeftIconBold, "ArrowLeft");
export const ArrowRight = solar(ArrowRightIconOutline, ArrowRightIconBold, "ArrowRight");
export const ArrowUp = solar(ArrowUpIconOutline, ArrowUpIconBold, "ArrowUp");
export const ArrowUpFromDot = solar(ArrowUpFromLineIconOutline, ArrowUpFromLineIconBold, "ArrowUpFromDot");
export const ArrowUpRight = solar(ArrowRightUpIconOutline, ArrowRightUpIconBold, "ArrowUpRight");
export const AtSign = solar(MentionCircleIconOutline, MentionCircleIconBold, "AtSign");
export const Atom = solar(AtomIconOutline, AtomIconBold, "Atom");
export const Award = solar(MedalRibbonStarIconOutline, MedalRibbonStarIconBold, "Award");
export const BadgeCheck = solar(VerifiedCheckIconOutline, VerifiedCheckIconBold, "BadgeCheck");
export const BookOpen = solar(Book2IconOutline, Book2IconBold, "BookOpen");
export const Bot = solar(BotIconOutline, BotIconBold, "Bot");
export const Box = solar(BoxIconOutline, BoxIconBold, "Box");
export const Braces = solar(CodeIconOutline, CodeIconBold, "Braces");
export const Briefcase = solar(CaseIconOutline, CaseIconBold, "Briefcase");
export const Bug = solar(BugIconOutline, BugIconBold, "Bug");
export const Building2 = solar(Buildings2IconOutline, Buildings2IconBold, "Building2");
export const Bus = solar(BusIconOutline, BusIconBold, "Bus");
export const Calendar = solar(CalendarIconOutline, CalendarIconBold, "Calendar");
export const CalendarClock = solar(CalendarMarkIconOutline, CalendarMarkIconBold, "CalendarClock");
export const CalendarDays = solar(CalendarDateIconOutline, CalendarDateIconBold, "CalendarDays");
export const Camera = solar(CameraIconOutline, CameraIconBold, "Camera");
export const Check = solar(CheckIconOutline, CheckIconBold, "Check");
export const CheckCircle2 = solar(CheckCircleIconOutline, CheckCircleIconBold, "CheckCircle2");
export const ChevronDown = solar(AltArrowDownIconOutline, AltArrowDownIconBold, "ChevronDown");
export const ChevronLeft = solar(AltArrowLeftIconOutline, AltArrowLeftIconBold, "ChevronLeft");
export const ChevronRight = solar(AltArrowRightIconOutline, AltArrowRightIconBold, "ChevronRight");
export const ChevronUp = solar(AltArrowUpIconOutline, AltArrowUpIconBold, "ChevronUp");
export const Circle = solar(CircleIconOutline, CircleIconBold, "Circle");
export const Clock = solar(ClockCircleIconOutline, ClockCircleIconBold, "Clock");
export const Cloud = solar(CloudIconOutline, CloudIconBold, "Cloud");
export const Code2 = solar(CodeIconOutline, CodeIconBold, "Code2");
export const Compass = solar(CompassIconOutline, CompassIconBold, "Compass");
export const Copy = solar(CopyIconOutline, CopyIconBold, "Copy");
export const Database = solar(DatabaseIconOutline, DatabaseIconBold, "Database");
export const Dot = solar(CircleDotIconOutline, CircleDotIconBold, "Dot");
export const Download = solar(DownloadMinimalisticIconOutline, DownloadMinimalisticIconBold, "Download");
export const Expand = solar(MaximizeIconOutline, MaximizeIconBold, "Expand");
export const ExternalLink = solar(ArrowRightUpIconOutline, ArrowRightUpIconBold, "ExternalLink");
export const Eye = solar(EyeIconOutline, EyeIconBold, "Eye");
export const EyeOff = solar(EyeClosedIconOutline, EyeClosedIconBold, "EyeOff");
export const FileCode = solar(FileCodeIconOutline, FileCodeIconBold, "FileCode");
export const FileDown = solar(FileDownloadIconOutline, FileDownloadIconBold, "FileDown");
export const FileText = solar(FileTextIconOutline, FileTextIconBold, "FileText");
export const FileUp = solar(FileSendIconOutline, FileSendIconBold, "FileUp");
export const Flag = solar(FlagIconOutline, FlagIconBold, "Flag");
export const FlaskConical = solar(FlaskIconOutline, FlaskIconBold, "FlaskConical");
export const Folder = solar(FolderIconOutline, FolderIconBold, "Folder");
export const FolderGit2 = solar(FolderGitIconOutline, FolderGitIconBold, "FolderGit2");
export const Gauge = solar(SpeedometerMiddleIconOutline, SpeedometerMiddleIconBold, "Gauge");
export const GitBranch = solar(GitBranchIconOutline, GitBranchIconBold, "GitBranch");
export const GitFork = solar(GitForkIconOutline, GitForkIconBold, "GitFork");
export const GitPullRequest = solar(GitPullRequestIconOutline, GitPullRequestIconBold, "GitPullRequest");
export const Globe = solar(GlobalIconOutline, GlobalIconBold, "Globe");
export const GraduationCap = solar(SquareAcademicCapIconOutline, SquareAcademicCapIconBold, "GraduationCap");
export const GripVertical = solar(GripVerticalIconOutline, GripVerticalIconBold, "GripVertical");
export const Hammer = solar(SledgehammerIconOutline, SledgehammerIconBold, "Hammer");
export const Hand = solar(HandIconOutline, HandIconBold, "Hand");
export const Heart = solar(HeartIconOutline, HeartIconBold, "Heart");
export const HeartHandshake = solar(HandHeartIconOutline, HandHeartIconBold, "HeartHandshake");
export const Home = solar(HomeIconOutline, HomeIconBold, "Home");
export const ImagePlus = solar(GalleryAddIconOutline, GalleryAddIconBold, "ImagePlus");
export const KeyRound = solar(KeyIconOutline, KeyIconBold, "KeyRound");
export const Landmark = solar(BankIconOutline, BankIconBold, "Landmark");
export const Layers = solar(LayersIconOutline, LayersIconBold, "Layers");
export const LayoutDashboard = solar(Widget2IconOutline, Widget2IconBold, "LayoutDashboard");
export const LayoutTemplate = solar(WindowFrameIconOutline, WindowFrameIconBold, "LayoutTemplate");
export const Lightbulb = solar(LightbulbIconOutline, LightbulbIconBold, "Lightbulb");
export const Loader2 = solar(LoaderIconOutline, LoaderIconBold, "Loader2");
export const Lock = solar(LockIconOutline, LockIconBold, "Lock");
export const LogOut = solar(LogoutIconOutline, LogoutIconBold, "LogOut");
export const Mail = solar(LetterIconOutline, LetterIconBold, "Mail");
export const Map = solar(MapIconOutline, MapIconBold, "Map");
export const MapPin = solar(MapPointIconOutline, MapPointIconBold, "MapPin");
export const Maximize2 = solar(MaximizeIconOutline, MaximizeIconBold, "Maximize2");
export const Megaphone = solar(MegaphoneIconOutline, MegaphoneIconBold, "Megaphone");
export const Menu = solar(HamburgerMenuIconOutline, HamburgerMenuIconBold, "Menu");
export const MessageCircle = solar(ChatRoundIconOutline, ChatRoundIconBold, "MessageCircle");
export const MessageSquareQuote = solar(ChatSquareQuoteIconOutline, ChatSquareQuoteIconBold, "MessageSquareQuote");
export const MessageSquareText = solar(ChatSquareLineIconOutline, ChatSquareLineIconBold, "MessageSquareText");
export const MessagesSquare = solar(ChatSquare2IconOutline, ChatSquare2IconBold, "MessagesSquare");
export const Moon = solar(MoonIconOutline, MoonIconBold, "Moon");
export const MoreHorizontal = solar(MenuDotsIconOutline, MenuDotsIconBold, "MoreHorizontal");
export const NotebookPen = solar(NotebookIconOutline, NotebookIconBold, "NotebookPen");
export const Package = solar(BoxMinimalisticIconOutline, BoxMinimalisticIconBold, "Package");
export const Palette = solar(PaletteIconOutline, PaletteIconBold, "Palette");
export const PanelLeft = solar(SidebarMinimalisticIconOutline, SidebarMinimalisticIconBold, "PanelLeft");
export const PenLine = solar(Pen2IconOutline, Pen2IconBold, "PenLine");
export const Pencil = solar(PenIconOutline, PenIconBold, "Pencil");
export const Phone = solar(PhoneIconOutline, PhoneIconBold, "Phone");
export const Pin = solar(PinIconOutline, PinIconBold, "Pin");
export const Play = solar(PlayIconOutline, PlayIconBold, "Play");
export const Plug = solar(PlugIconOutline, PlugIconBold, "Plug");
export const Plus = solar(AddIconOutline, AddIconBold, "Plus");
export const QrCode = solar(QrCodeIconOutline, QrCodeIconBold, "QrCode");
export const Quote = solar(QuoteIconOutline, QuoteIconBold, "Quote");
export const Rocket = solar(RocketIconOutline, RocketIconBold, "Rocket");
export const RotateCcw = solar(RestartIconOutline, RestartIconBold, "RotateCcw");
export const Rss = solar(RssIconOutline, RssIconBold, "Rss");
export const Scale = solar(JusticeScaleIconOutline, JusticeScaleIconBold, "Scale");
export const Search = solar(MagnifierIconOutline, MagnifierIconBold, "Search");
export const Send = solar(PlaneIconOutline, PlaneIconBold, "Send");
export const Server = solar(ServerIconOutline, ServerIconBold, "Server");
export const Share2 = solar(ShareIconOutline, ShareIconBold, "Share2");
export const ShieldCheck = solar(ShieldCheckIconOutline, ShieldCheckIconBold, "ShieldCheck");
export const ShoppingCart = solar(CartLargeIconOutline, CartLargeIconBold, "ShoppingCart");
export const Smartphone = solar(SmartphoneIconOutline, SmartphoneIconBold, "Smartphone");
export const Sparkles = solar(SparklesIconOutline, SparklesIconBold, "Sparkles");
export const Star = solar(StarIconOutline, StarIconBold, "Star");
export const Sun = solar(SunIconOutline, SunIconBold, "Sun");
export const Tag = solar(TagIconOutline, TagIconBold, "Tag");
export const Target = solar(TargetIconOutline, TargetIconBold, "Target");
export const Terminal = solar(CodeSquareIconOutline, CodeSquareIconBold, "Terminal");
export const Trash2 = solar(TrashBinMinimalisticIconOutline, TrashBinMinimalisticIconBold, "Trash2");
export const TrendingUp = solar(GraphUpIconOutline, GraphUpIconBold, "TrendingUp");
export const Undo2 = solar(UndoLeftIconOutline, UndoLeftIconBold, "Undo2");
export const User = solar(UserIconOutline, UserIconBold, "User");
export const UserRound = solar(UserRoundedIconOutline, UserRoundedIconBold, "UserRound");
export const Users = solar(UsersGroupRoundedIconOutline, UsersGroupRoundedIconBold, "Users");
export const Video = solar(VideocameraIconOutline, VideocameraIconBold, "Video");
export const Wallet = solar(WalletIconOutline, WalletIconBold, "Wallet");
export const Webhook = solar(LinkCircleIconOutline, LinkCircleIconBold, "Webhook");
export const Workflow = solar(StructureIconOutline, StructureIconBold, "Workflow");
export const Wrench = solar(WrenchIconOutline, WrenchIconBold, "Wrench");
export const X = solar(CloseIconOutline, CloseIconBold, "X");
export { Map as MapIcon };
