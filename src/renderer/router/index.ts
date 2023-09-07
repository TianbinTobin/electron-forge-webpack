import { createRouter, createWebHashHistory } from 'vue-router';

import AboutPage from '../pages/about/About.vue';
import HeaderPage from '../pages/header/Header.vue';
import PrivatePage from '../pages/privatization/Private.vue';
import UpdaterPage from '../pages/updater/Updater.vue';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/about', component: AboutPage },
    { path: '/header', component: HeaderPage },
    { path: '/updater', component: UpdaterPage },
    { path: '/private', component: PrivatePage },
  ],
});
