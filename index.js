import { registerRootComponent } from 'expo';
import App from './App.jsx';

const app = express();
app.set('trust proxy', 1); // confía en el primer proxy (Render)

registerRootComponent(App);
