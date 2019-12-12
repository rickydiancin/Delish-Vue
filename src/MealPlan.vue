<template>
	<section v-if="plan != null" class="meal-plan-wrapper" style="margin-top: 5px; margin-left: 10px; margin-right: 10px;">
		<div class="meal-plan-container" style="margin-left: 60px; margin-right: 60px;">
			<div class="row">
				<div class="col-lg-4 col-md-12">
					<h2>DIY meal plan</h2>
				</div>
				<div class="col-lg-8 col-md-12">
					<div class="diy-mp-right">
						<span>Name of Meal Plans</span>
						<input type="text" v-model="mealPlanName" />
						<label class="meal-plan-purchase-btn btn btn-yellow btn-large">
							<button type="button" @click="purchaseMealPlan">Purchase Meal Plan</button>
							<span>${{_.reduce(totalPrice, function(sum, item) {return sum + item.price; }, 0)}} AUD</span>
						</label>
					</div>
				</div>
			</div>
			<div class="row">
				<div class="col-md-12">
					<div class="meal-plan-maximize-container">
						<div class="meal-plan-maximize-wrapper">
							<h3>Maximise my value</h3>
							<label>You have ingridents in your recipes that may go to waste. <span>Drop and Drag</span> in more servings to get maximum value.</label>
							<div :key="maxRecipeKey">
								<draggable
								id="max-potential-contain"
								v-model="maxPotentialItems"
								:group="{name: 'people', pull: 'clone'}"
								@start="drag=true"
								@remove="onMaximizeRecipeDropEnd"
								class="maximize-draggable-zone"
								>
								<div
								class="btn-drag-yellow btn-drag"
								v-for="(product, index) in maxPotentialItems"
								:key="index"
								:id="product.id"
								style="margin-right: 10px;"
								>
								{{product.title}} <span v-if="product.max_potential"> x {{ parseInt(product.remain_max_potential)}}</span>
							</div>
						</draggable>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<table border="1" class="meal-plan-table">
	<tr>
		<td></td>
		<td
		v-for="day in 7"
		@click="onDaySelect(day)"
		:class="[checkIfDayIsSelected(day),{'inactive':!isInactiveColumn.columns[day]}]"
		>
		<h4 class="meal-day-tag">Day {{day}}</h4>
		<span class="pull-right trash-and-clone">
			<button
			class="btn-meal-action btn-meal-delete"
			type="button"
			title="Delete"
			@click="deleteMealBy(day,'column')"
			>
			<img src="https://cdn2.shopify.com/s/files/1/0060/1204/3337/files/delete1.svg?253746" />
		</button>
		<button
		class="btn-meal-action btn-meal-copy"
		type="button"
		href="javascript:void(0)"
		data-toggle="modal"
		title="Copy"
		data-target="#copy_meal_plan"
		@click="copyMealPlan(day)"
		>
		<img src="https://cdn2.shopify.com/s/files/1/0060/1204/3337/files/copy2.svg?253746" />
	</button>
</span>
<br />
<div class="span">{{ (totalPrice[day].cal_p).toFixed(2) }}% of target calories</div>
<div class="progress" style="height: 6px;" v-bind:class=" { 'progress-green-border' : ((totalPrice[day].cal_p > 0) && (totalPrice[day].cal_p < 100)) }" >
	<div class="progress-bar progress-bar-success"
	v-bind:class=" { 'progress-bar-danger' : (totalPrice[day].cal_p > 100) }"
	role="progressbar"
	aria-valuemin="0"
	aria-valuemax="100"
	v-bind:style="{ width: totalPrice[day].cal_p + '%' }"
	></div>
</div>
</td>
</tr>
<tr v-for="(meal, mealName) in plan">
	<td :class="['day-meal-toggle', 'day-meal-selected', { open : mealTable.meal[mealName].hide }, {'inactive':!isInactiveColumn.rows[mealName]}]">
		<!-- v-bind:class="{ collapsed : mealTable.meal[mealName].hide }" -->
		<!-- logo images -->
		<inline-svg
		src="https://cdn.shopify.com/s/files/1/0060/1204/3337/files/breakfast.svg?268211"
		class="svg"
		fill="black"
		aria-label="Breakfast"
		v-if="mealName == 'breakfast'"
		></inline-svg>
		<inline-svg
		src="https://cdn.shopify.com/s/files/1/0060/1204/3337/files/snack.svg?268211"
		class="svg"
		fill="black"
		aria-label="AM Snack"
		v-if="mealName == 'am_snack'"
		></inline-svg>
		<inline-svg
		src="https://cdn.shopify.com/s/files/1/0060/1204/3337/files/snack.svg?268211"
		class="svg"
		fill="black"
		aria-label="PM Snack"
		v-if="mealName == 'pm_snack'"
		></inline-svg>
		<inline-svg
		src="https://cdn.shopify.com/s/files/1/0060/1204/3337/files/lunch.svg?268211"
		class="svg"
		fill="black"
		aria-label="Lunch"
		v-if="mealName == 'lunch'"
		></inline-svg>
		<inline-svg
		src="https://cdn.shopify.com/s/files/1/0060/1204/3337/files/dinner.svg?268211"
		class="svg"
		fill="black"
		aria-label="Dinner"
		v-if="mealName == 'dinner'"
		></inline-svg>

		<label :class="'meal-for-day ' + 'meal-' + mealName">{{ mealTable.meal[mealName].name }}</label>
		<button type="button" @click="expandMeal(mealName)">
			<span
			class="cs-font clever-icon-arrow-left arrow-icon"
			v-if="mealTable.meal[mealName].hide === true"
			></span>
			<span
			class="cs-font clever-icon-arrow-right arrow-icon"
			v-if="mealTable.meal[mealName].hide === false"
			></span>
		</button>
	</td>
	<td
	v-for="(products, day) in meal"
	@click="onDaySelect(day)"
	:class="[checkIfDayIsSelected(day), { open : mealTable.meal[mealName].hide }]"
	>
	<div v-if="mealTable.meal[mealName].hide">
		<draggable
		v-model="plan[mealName][day]"
		:group="{name: 'people'}"
		@start="drag=true"
		@end="drag=false"
		:move="onMove"
		>
		<div
		v-for="(product, index) in products"
		:key="index"
		class="btn-drag"
		:class="product.type == 'recipe' ? 'btn-drag-green recipe-drag' : 'btn-drag-purple product-drag'"
		>{{product.title}}</div>
		{{displayFamilyProduct(products)}}
	</draggable>
</div>
<button
v-if="products.length > 0"
type="button"
@click="copyMealPlan(day, mealName)"
class="btn-meal-day-action"
>+ copy plan to another day</button>
<button
v-if="products.length > 0"
type="button"
class="btn-meal-day-action"
@click="openModal(plan[mealName][day], mealName, day)"
>+ Add more</button>
<button
v-if="products.length <= 0"
type="button"
class="btn-drag"
@click="openModal(plan[mealName][day], mealName, day)"
>Add a recipes/products</button>
</td>
</tr>
<tr>
	<td></td>
	<td v-for="day in 7">
		<div class="chart">
			<vc-donut
			:sections="chart[day]"
			background="white"
			foreground="grey"
			:size="200"
			unit="px"
			:thickness="40"
			has-legend
			legend-placement="bottom"
			:total="100"
			:start-angle="0"
			>
			Day {{day}}<br> Macro Graph
		</vc-donut>
	</div>
	<div class="chart-details">
		<p>Total:</p>
		<ul class="daily-bdown">
			<li class="calories">Calories <span>{{(totalPrice[day].cal).toFixed(2)}} cal</span></li>
			<li class="fat">Fat <span>{{(totalPrice[day].fat).toFixed(2)}}g</span></li>
			<li class="protein">Protein <span>{{(totalPrice[day].protein).toFixed(2)}}g</span></li>
			<li class="carbs">Carbs <span>{{(totalPrice[day].carbs).toFixed(2)}}g</span></li>
		</ul>
		<div class="meal-daily-total">
			<p>Daily Total: <span>${{(totalPrice[day].price).toFixed(2)}}</span></p>
		</div>
	</div>
</td>
</tr>
</table>

<br />
<br />

<div v-if="modal">
	<Modal
	:products="selectedProducts"
	:open="modal"
	@closeModal="modal = false"
	@saveMeal="productsToMealPlan"
	/>
</div>
<CopyMealPlan
:day="copy.day"
:copy="copy"
:showModal="copy.showModal"
@selected="copyMealPlanTo"
@closeModal="closeCopyMealPlan"
/>
</section>
</template>

<script>
	import CopyMealPlan from './components/CopyMealPlan.vue';
	import draggable from 'vuedraggable';
	import Modal from './components/SearchProductModal.vue';
	import axios from 'axios';
	import InlineSvg from 'vue-inline-svg'
	import getParameter from 'get-parameter';

	let mealplanPath = 'https://shopify.draftserver.com/delish-deliveries/public/api/meal-plan/product/info/';

	export default {
		components: {
			draggable,
			CopyMealPlan,
			Modal,
			InlineSvg,
		},
		data() {
			return {
				partialCopy: false,
				baseUrl: 'http://shopify.draftserver.com/delish-deliveries/public/api/',
				maxRecipeKey: 0,
				mealPlanName: '',
				mealPlanId: null,
				maxPotentialItems: [],
				modal: false,
				selectedProducts: null,
				selected: {
					meal: null,
					day: null,
				},
				plan: null,
				max_calorie: 0,
				chart: {
					1 : [{ label: 'Fat', value: 0}, { label: 'Calorie', value: 0}, { label: 'Protien', value: 0}],
					2 : [{ label: 'Fat', value: 0}, { label: 'Calorie', value: 0}, { label: 'Protien', value: 0}],
					3 : [{ label: 'Fat', value: 0}, { label: 'Calorie', value: 0}, { label: 'Protien', value: 0}],
					4 : [{ label: 'Fat', value: 0}, { label: 'Calorie', value: 0}, { label: 'Protien', value: 0}],
					5 : [{ label: 'Fat', value: 0}, { label: 'Calorie', value: 0}, { label: 'Protien', value: 0}],
					6 : [{ label: 'Fat', value: 0}, { label: 'Calorie', value: 0}, { label: 'Protien', value: 0}],
					7 : [{ label: 'Fat', value: 0}, { label: 'Calorie', value: 0}, { label: 'Protien', value: 0}],
				},
				copy: {
					day: null,
					showModal: false,
					mealtype: '',
				},
				mealTable: {
					meal: {
						breakfast: {
							hide: true,
							name: 'Breakfast',
						},
						am_snack: {
							name: 'AM Snack',
							hide: true,
						},
						lunch: {
							name: 'Lunch',
							hide: true,
						},
						pm_snack: {
							name: 'PM Snack',
							hide: true,
						},
						dinner: {
							name: 'Dinner',
							hide: true,
						}
					},
					total: {},
				},
				dayActive: [
				{
					day: 1,
					active: false,
				},
				{
					day: 2,
					active: false,
				},
				{
					day: 3,
					active: false,
				},
				{
					day: 4,
					active: false,
				},
				{
					day: 5,
					active: false,
				},
				{
					day: 6,
					active: false,
				},
				{
					day: 7,
					active: false,
				}
				]
			}
		},
		computed: {
			totalPrice: function () {
				let self = this;
				/**
				 * Reset Total
				 */
				 let total = {
				 	1: {cal: 0, fat: 0, protein: 0, carbs: 0, cal_p: 0, price: 0},
				 	2: {cal: 0, fat: 0, protein: 0, carbs: 0, cal_p: 0, price: 0},
				 	3: {cal: 0, fat: 0, protein: 0, carbs: 0, cal_p: 0, price: 0},
				 	4: {cal: 0, fat: 0, protein: 0, carbs: 0, cal_p: 0, price: 0},
				 	5: {cal: 0, fat: 0, protein: 0, carbs: 0, cal_p: 0, price: 0},
				 	6: {cal: 0, fat: 0, protein: 0, carbs: 0, cal_p: 0, price: 0},
				 	7: {cal: 0, fat: 0, protein: 0, carbs: 0, cal_p: 0, price: 0},
				 };

				 _.map(this.plan, function(val, key){
				 	for (var i = 1; i <= 7; i++) {
				 		total[i].cal += _.sumBy(val[i], function(item) { return parseFloat(item.cal) * parseInt(item.qty); });
				 		total[i].protein += _.sumBy(val[i], function(item) { return parseFloat(item.protein) * parseInt(item.qty); });
				 		total[i].fat += _.sumBy(val[i], function(item) { return parseFloat(item.fat) * parseInt(item.qty); });
				 		total[i].carbs += _.sumBy(val[i], function(item) { return parseFloat(item.carbs) * parseInt(item.qty); });
				 		total[i].price += _.sumBy(val[i], function(item) { return parseFloat(item.price) * parseInt(item.qty); });
				 		total[i].cal_p = ( typeof self.max_calorie == "number" && self.max_calorie > 0 ) ? parseFloat( (total[i].cal * 100) / self.max_calorie ) : 0;
				 	}
				 });

				/**
				 * Update informat for the Chart
				 */
				 this.updateTargetMacro(total);

				 return total;
				},
				isInactiveColumn: function(){
					let _columns = {1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false};
					let _rows = {'breakfast': false, 'am_snack': false, 'pm_snack': false, 'lunch': false, 'dinner': false};
					_.map(this.plan, function(val, key){
						for (var i = 1; i <= 7; i++) {
							if(val[i] !== undefined && val[i].length > 0 ){
								_columns[i] = true;
								_rows[key] = true;
							}
						}
					});
					return {columns: _columns, rows: _rows};
				}
		},
			mounted() {
				if(window.location.pathname == '/pages/create-meal-plan') {
					this.plan = {
						breakfast: {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []},
						am_snack: {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []},
						lunch: {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []},
						pm_snack: {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []},
						dinner: {1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []},
					};
				} else {
					var id = getParameter('customer_meal_plan_id');

					// if the meal plan is custom made by client, fetch that meal plan data
					if(id) {
						axios.get(window.middleware_base_url + `api/customer-meal-plan/plan/${id}`)
						.then((r) => {
							const m = r.data.data;
							this.mealPlanId = m.id;
							this.mealPlanName = m.name;
							this.plan = m.plan;
							this.max_calorie = 0;
						});
					} else {
						console.log('meal plan loaded created by admin');
						axios.get(`${mealplanPath}${this.getMealPlanHandle()}`)
							.then((res) => {
								console.log(res);
								const r = res.data;
								this.mealPlanId = r.id;
								this.mealPlanName = r.title;
								this.plan = r.plan;
								this.max_calorie = parseFloat(r.max_calorie);
							});
					}
				}

				this.$events.listen('addMaxPotentialItem', (recipes) => {
					_.each(recipes, (recipe) => {
						if(recipe.new != true) {
							return;
						}

						let index = _.findIndex(this.maxPotentialItems, {id: recipe.id});

						if(index != -1) {
							this.maxPotentialItems[index].remain_max_potential += recipe.remain_max_potential;
						} else {
							this.maxPotentialItems.push(recipe);
						}
					});
				});

				this.$events.listen('removeFromMaxPotential', (recipe) => {
					const index = _.findIndex(this.maxPotentialItems, {id: recipe.id});
					this.maxPotentialItems = this.maxPotentialItems.splice(index, 0);
				});
			},
		methods: {
			onDaySelect(day) {
				this.dayActive = _.map(this.dayActive, (row) => {
					if(row.day == parseInt(day)) {
						row.active = true;
					} else {
						row.active = false;
					}
					return row;
				});
			},
			checkIfDayIsSelected(day) {
				let x = '';

				_.each(this.dayActive, (row) => {
					if(row.day === parseInt(day) && row.active === true) {
						x = 'day-selected';
					}
				});

				return x;
			},
			displayFamilyProduct() {
				//
			},
			purchaseMealPlan() {
				if(this.mealPlanName == '') {
					this.$toasted.show('Please enter a meal plan name', {
						theme: 'bubble',
					});
					return;
				} else if(_.reduce(this.totalPrice, (sum, item) => sum + item.price, 0) <= 0) {
					this.$toasted.show('Please add some products to plan', {
						theme: 'bubble',
					});
					return;
				}

				// Three cases for purchase meal plan
				// 1. When user create from scratch
				// 2. When user create from scratch but for a partner
				// 3. When user edit pre defined meals
				let productHandle;
				let formData = {};

				if(window.location.pathname == '/pages/create-meal-plan') {
					productHandle = 'customer-meal-plan';

					formData = {
						customer_id: loggedCustomerId, // value comes from liquid (parent page shopify)
						product_handle: productHandle,
						name: this.mealPlanName,
						meal_plan: JSON.stringify(this.plan),
					};
				} else {
					const url = window.location.pathname.split('/');
					productHandle = url[2];

					formData = {
						customer_id: loggedCustomerId,
						product_handle: productHandle,
						name: this.mealPlanName,
						meal_plan: JSON.stringify(this.plan),
						// meal_plan_id: this.mealPlanId,
						// for_partner: false,
					};
				}

				// save price of meal plan and meal plan table to the storage
				const mealPlan = {
					customerId: loggedCustomerId,
					product_handle: productHandle,
					name: this.mealPlanName,
					price: _.reduce(this.totalPrice, function(sum, item) {return sum + item.price; }, 0),
					plan: this.plan,
				};

				axios.post(this.baseUrl + 'customer-meal-plan', formData)
				.then((res) => {
					sessionStorage.setItem('meal-plan', JSON.stringify(mealPlan));
					window.location.href = `/pages/purchase-meal-plan?handle=${productHandle}`;
				})
				.catch(() => {
							//
						});
			},
			// When user drops recipe from maximize section
			onMaximizeRecipeDropEnd(e) {
				let index = _.findIndex(this.maxPotentialItems, {id: parseInt(e.clone.id)});

				if(index != -1) {
					this.maxPotentialItems[index].remain_max_potential -= 1;

					if(this.maxPotentialItems[index].remain_max_potential <= 0) {
						this.$delete(this.maxPotentialItems, index);
					}
				}
				this.maxRecipeKey++;
			},
			onMove(e) {
				if(e.to.id == 'max-potential-contain') {
					return false;
				}
			},
			expandMeal(mealName) {
				this.mealTable.meal[mealName].hide = this.mealTable.meal[mealName].hide === true ? false : true;
			},
			updateTargetMacro(x) {
				let self = this;

				_.each(x, function(val,key) {
					let _total = parseFloat(val.carbs) + parseFloat(val.fat) + parseFloat(val.protein);
					let fat_p = parseFloat(((val.fat * 100 ) / _total ));
					let protein_p = parseFloat(((val.protein * 100 ) / _total ));
					let carbs_p = parseFloat(((val.carbs * 100 ) / _total ));

					self.chart[key] = [
					{ label: 'Fat', value: !Number.isNaN(fat_p) ? fat_p : 0, color: '#319d48' },
					{ label: 'Protein', value: !Number.isNaN(protein_p) ? protein_p : 0, color: '#FCF500' },
					{ label: 'Carbs', value: !Number.isNaN(carbs_p) ? carbs_p : 0, color: '#81C241' },
					];
				});
			},
			copyMealPlan(i, mealtype = '') {
				if(mealtype != '') {
					this.partialCopy = true;
				} else {
					this.partialCopy = false;
				}

				this.copy.day = parseInt(i);
				this.copy.mealtype = mealtype;
				this.copy.showModal = true;
			},
			copyMealPlanTo(from, to) {
				if(this.partialCopy) {
					switch(this.copy.mealtype) {
						case 'am_snack':
						this.plan['am_snack'][to]  = this.plan['am_snack'][from.day];
						break;

						case 'breakfast':
						this.plan['breakfast'][to] = this.plan['breakfast'][from.day];
						break;

						case 'dinner':
						this.plan['dinner'][to]  = this.plan['dinner'][from.day];
						break;

						case 'lunch':
						this.plan['lunch'][to]   = this.plan['lunch'][from.day];
						break;

						case 'pm_snack':
						this.plan['pm_snack'][to]  = this.plan['pm_snack'][from.day];
						break;
					}
				} else {
					this.plan['am_snack'][to]  = this.plan['am_snack'][from.day];
					this.plan['breakfast'][to] = this.plan['breakfast'][from.day];
					this.plan['dinner'][to]  = this.plan['dinner'][from.day];
					this.plan['lunch'][to]   = this.plan['lunch'][from.day];
					this.plan['pm_snack'][to]  = this.plan['pm_snack'][from.day];
				}
				this.copy.showModal = false;
			},
			closeCopyMealPlan(){
				this.copy.showModal = false;
			},
			deleteMealBy(day,type){
				// let _msg = ( type == 'column' ) ? `Do you really want to reset for Day ${day}?` : `Do you really want to reset for ${this.mealTable.meal[day].name} row?`;
				if( type == 'column' ) {
					this.plan['am_snack'][day] = [];
					this.plan['breakfast'][day] = [];
					this.plan['dinner'][day] = [];
					this.plan['lunch'][day] = [];
					this.plan['pm_snack'][day] = [];
				} else if( type == 'row' ) {
					this.plan[day] = {1 : [], 2 : [], 3 : [], 4 : [], 5 : [], 6 : [], 7 : []};
				}
			},
			openModal(products, meal, day) {
				this.selected.meal = meal;
				this.selected.day = day;

				this.selectedProducts = products;
				this.modal = true;
			},
			getMealPlanHandle(){
				var pageURL = window.location.href;
				var lastURLSegment = pageURL.substr(pageURL.lastIndexOf('/') + 1);
				return lastURLSegment;
			},
			/**
			 * Update the selected day meal plan to the products selected on popup modal
			 * @param
			 * @return
			 */
			 productsToMealPlan(data) {
			 	const meal = this.selected.meal;
			 	const day = this.selected.day;

			 	const products = _.clone(data);
			 	this.plan[meal][day] = products;

			 	this.selectedProducts = data;
			 }
			}
		}
	</script>
