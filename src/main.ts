//import './assets/scss/main.scss';
//import 'bulma/css/bulma.css';
import '@ntohq/buefy-next/dist/buefy.css';
// TODO: figure out if latest bulma can be used with buefy, want dark mode but breaks some component styling

import { createApp } from 'vue'
import App from './App.vue'
import Buefy from '@ntohq/buefy-next';

const app = createApp(App);
app.use(Buefy);
app.mount('#app')



