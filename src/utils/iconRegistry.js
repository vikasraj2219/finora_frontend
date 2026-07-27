// Maps the small, fixed set of icon-name strings used by the seeded category/type
// taxonomy (see categoryTaxonomy.js on the backend) to their MUI icon components.
// Anything not in this map — a custom category/type someone adds — falls back to a
// generic label icon rather than needing a full icon-picker UI.
import WorkIcon from '@mui/icons-material/WorkOutline';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenterOutlined';
import AccountBalanceIcon from '@mui/icons-material/AccountBalanceOutlined';
import HomeWorkIcon from '@mui/icons-material/HomeWorkOutlined';
import PaymentsIcon from '@mui/icons-material/PaymentsOutlined';
import ReplayIcon from '@mui/icons-material/ReplayOutlined';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcardOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoneyOutlined';
import RestaurantIcon from '@mui/icons-material/RestaurantOutlined';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCarOutlined';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBagOutlined';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import BoltIcon from '@mui/icons-material/BoltOutlined';
import SubscriptionsIcon from '@mui/icons-material/SubscriptionsOutlined';
import FavoriteIcon from '@mui/icons-material/FavoriteBorderOutlined';
import SchoolIcon from '@mui/icons-material/SchoolOutlined';
import FlightIcon from '@mui/icons-material/FlightOutlined';
import MovieIcon from '@mui/icons-material/MovieOutlined';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroomOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUpOutlined';
import ShieldIcon from '@mui/icons-material/ShieldOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLongOutlined';
import CategoryIcon from '@mui/icons-material/CategoryOutlined';
import LabelIcon from '@mui/icons-material/LabelOutlined';
import AccountTreeIcon from '@mui/icons-material/AccountTreeOutlined';
import TuneIcon from '@mui/icons-material/TuneOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHorizOutlined';

const REGISTRY = {
  work: WorkIcon,
  business_center: BusinessCenterIcon,
  account_balance: AccountBalanceIcon,
  home_work: HomeWorkIcon,
  payments: PaymentsIcon,
  replay: ReplayIcon,
  card_giftcard: CardGiftcardIcon,
  attach_money: AttachMoneyIcon,
  restaurant: RestaurantIcon,
  shopping_cart: ShoppingCartIcon,
  directions_car: DirectionsCarIcon,
  shopping_bag: ShoppingBagIcon,
  home: HomeIcon,
  bolt: BoltIcon,
  subscriptions: SubscriptionsIcon,
  favorite: FavoriteIcon,
  school: SchoolIcon,
  flight: FlightIcon,
  movie: MovieIcon,
  family_restroom: FamilyRestroomIcon,
  account_balance_wallet: AccountBalanceWalletIcon,
  trending_up: TrendingUpIcon,
  shield: ShieldIcon,
  receipt_long: ReceiptLongIcon,
  category: CategoryIcon,
  label: LabelIcon,
  account_tree: AccountTreeIcon,
  tune: TuneIcon,
  swap_horiz: SwapHorizIcon,
};

export const getIconComponent = (name) => REGISTRY[name] || LabelIcon;
