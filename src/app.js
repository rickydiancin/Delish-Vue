import Vue from 'vue';
import MealPlan from './MealPlan.vue';

if(document.getElementById('mea-plan-app')) {
	new Vue({
		el: "#mea-plan-app",
		render: h => h(MealPlan),
	});
}