import Vue from 'vue';
import MealPlan from './MealPlan.vue';
import VueLodash from 'vue-lodash';

Vue.use(VueLodash);

if(document.getElementById('mea-plan-app')) {
	new Vue({
		el: "#mea-plan-app",
		render: h => h(MealPlan),
	});
}