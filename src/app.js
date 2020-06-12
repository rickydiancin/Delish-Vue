import Vue from 'vue';
import MealPlan from './MealPlan.vue';
import SeasonalBox from './SeasonalBox.vue';
import VueLodash from 'vue-lodash';
import VueEvents from 'vue-events'
import Toasted from 'vue-toasted';
import VueProgressBar from 'vue-progressbar'
import Donut from 'vue-css-donut-chart';
import 'vue-css-donut-chart/dist/vcdonut.css';
import BootstrapVue from 'bootstrap-vue'
import VuejsDialog from 'vuejs-dialog';

import 'vuejs-dialog/dist/vuejs-dialog.min.css';

window.middleware_base_url = 'https://shopify.draftserver.com/delish-deliveries/public/';
window.default_image = window.middleware_base_url + 'images/placeholder-200x200.png';

Vue.use(VuejsDialog);
Vue.use(VueLodash);
Vue.use(BootstrapVue)
Vue.use(VueEvents);
Vue.use(Donut);

Vue.use(Toasted, {
	theme: "toasted-primary",
	position: "bottom-right",
	duration : 3000
});

Vue.use(VueProgressBar, {
	color: 'rgba(0, 184, 254, 1)',
	failedColor: 'red',
	thickness: '3px',
});

if(document.getElementById('mea-plan-app')) {
	console.log('loading app...');
	new Vue({
		el: "#mea-plan-app",
		render: h => h(MealPlan),
	});
	console.log('app loaded...');
}


if(document.getElementById('seasonal-box')) {
	new Vue({
		el: "#seasonal-box",
		components: {
			SeasonalBox
		},
		data: {
			products: custom_products
		},
	});
}