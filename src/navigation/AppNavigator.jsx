import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen.jsx';
import LoadingScreen from '../screens/LoadingScreen.jsx';
import LoginScreen from '../screens/LoginScreen.jsx';
import RegisterScreen from '../screens/RegisterScreen.jsx';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen.jsx';
import VerificationScreen from '../screens/VerificationScreen.jsx';
import NewPasswordScreen from '../screens/NewPasswordScreen.jsx';

import HomeScreen from '../screens/HomeScreen.jsx';
import EnterLocationScreen from '../screens/EnterLocationScreen.jsx';
import MapLocationScreen from '../screens/MapLocationScreen.jsx';
import LocationSuccessScreen from '../screens/LocationSuccessScreen.jsx';
import AddressListScreen from '../screens/AddressListScreen.jsx';
import WishlistScreen from '../screens/WishlistScreen.jsx';

import ProductsScreen from '../screens/ProductsScreen.jsx';
import ProductDetailScreen from '../screens/ProductDetailScreen.jsx';
import SaveProductScreen from '../screens/SaveProductScreen.jsx';
import CartScreen from '../screens/CartScreen.jsx';
import PaymentScreen from '../screens/PaymentScreen.jsx';
import OrderConfirmedScreen from '../screens/OrderConfirmedScreen.jsx';
import ProfileScreen from '../screens/ProfileScreen.jsx';
import EditProfileScreen from '../screens/EditProfileScreen.jsx';
import OrdersScreen from '../screens/OrdersScreen.jsx';
import OrderDetailScreen from '../screens/OrderDetailScreen.jsx';
import ManageCardsScreen from '../screens/ManageCardsScreen.jsx';
import EditCardScreen from '../screens/EditCardScreen.jsx';
import EditLocationScreen from '../screens/EditLocationScreen.jsx';
import LoyaltyPointsScreen from '../screens/LoyaltyPointsScreen.jsx';

const Stack = createNativeStackNavigator();

// navegacin de toda la appautenticación va primero
// despuesdel  login  entra a Home y de ahí en adelante
// las pantallas de macetas por el momento que las he dejdo as 
export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
<Stack.Screen name="Loading" component={LoadingScreen} />

<Stack.Screen name="Login" component={LoginScreen} />
<Stack.Screen name="Register" component={RegisterScreen} />
<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
<Stack.Screen name="Verification" component={VerificationScreen} />
<Stack.Screen name="NewPassword" component={NewPasswordScreen} />

<Stack.Screen name="Home" component={HomeScreen} />
<Stack.Screen name="Products" component={ProductsScreen} />
<Stack.Screen name="ProductDetail" component={ProductDetailScreen} />

<Stack.Screen name="Wishlist" component={WishlistScreen} />
<Stack.Screen name="SaveProduct" component={SaveProductScreen} />

<Stack.Screen name="Cart" component={CartScreen} />
<Stack.Screen name="Payment" component={PaymentScreen} />
<Stack.Screen name="OrderConfirmed" component={OrderConfirmedScreen} />

<Stack.Screen name="EnterLocation" component={EnterLocationScreen} />
<Stack.Screen name="AddressList" component={AddressListScreen} />
<Stack.Screen name="MapLocation" component={MapLocationScreen} />
<Stack.Screen name="LocationSuccess" component={LocationSuccessScreen} />
<Stack.Screen name="EditLocation" component={EditLocationScreen} />

<Stack.Screen name="Profile" component={ProfileScreen} />
<Stack.Screen name="EditProfile" component={EditProfileScreen} />
<Stack.Screen name="Orders" component={OrdersScreen} />
<Stack.Screen name="OrderDetail" component={OrderDetailScreen} />

<Stack.Screen name="ManageCards" component={ManageCardsScreen} />
<Stack.Screen name="EditCard" component={EditCardScreen} />

<Stack.Screen name="LoyaltyPoints" component={LoyaltyPointsScreen} />
    </Stack.Navigator>
  );
}
