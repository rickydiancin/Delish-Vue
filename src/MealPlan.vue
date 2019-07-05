<template>
  <section v-if="plan != null" style="margin-top: 50px; margin-left: 70px; margin-right: 70px;">
    <div class="">
      <div class="row">
        <div class="col-md-6">
          <h2>DIY meal plan</h2>
        </div>
        <div class="col-md-6">
          <div class="pull-right">
            <span>Name of Meal Plan</span>
            <input type="text" :value="'Tom Meal Plan'" />
            <label class="meal-plan-purchase-btn">
              <button type="button">Purchase Meal Plan</button>
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
              <label>You have ingridents in your recipes that may go to waste.Drop and drag in more servings to get maximum value.</label>
              <div>
                <draggable 
                v-model="maxPotentialItems" 
                :group="{name: 'people', pull: 'clone'}" 
                @start="drag=true"
                @clone="test" 
                @end="drag=false" 
                class="maximize-draggable-zone"
                >
                <div v-for="(product, index) in maxPotentialItems" :key="index">{{product.title}} x {{product.max_potential}}</div>
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
      <td v-for="day in 7">
        <h2>Day {{day}} 
          <span class="pull-right trash-and-clone">
            <button type="button" @click="deleteMealBy(day,'column')">DEL</button>
            <a 
            href="javascript:void(0)" 
            data-toggle="modal" 
            data-target="#copy_meal_plan" 
            @click="copyMealPlan(day)"
            >
            COPY
          </a>
        </span>
      </h2>
      <div class="span">{{ (totalPrice[day].cal_p).toFixed(2) }}% of target calories</div>
      <div class="progress" style="height: 6px;">
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
    <td>
      {{ mealTable.meal[mealName].name }} 
      <button type="button" @click="expandMeal(mealName)">^</button>
    </td>
    <td v-for="(products, day) in meal">
      <div v-if="mealTable.meal[mealName].hide">
        <draggable v-model="plan[mealName][day]" :group="{name: 'people'}" @start="drag=true" @end="drag=false" style="min-height: 100px;">
          <div 
          v-for="(product, index) in products" 
          :key="index" 
          class="meal-table-product"
          >{{product.title}}</div>
        </draggable>
      </div>
      <button type="button" @click="copyMealPlan(day,mealName)">+ copy plan to another day</button>
      <button type="button" @click="openModal(plan[mealName][day], mealName, day)">Add a Recipe / Product</button>
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
      <h4>Total:</h4>
      <ul class="daily-bdown">
        <li>Calories <span>{{(totalPrice[day].cal).toFixed(2)}} cal</span></li>
        <li>Fat <span>{{(totalPrice[day].fat).toFixed(2)}}g</span></li>
        <li>Protein <span>{{(totalPrice[day].protein).toFixed(2)}}g</span></li>
        <li>Carbs <span>{{(totalPrice[day].carbs).toFixed(2)}}g</span></li>
      </ul>
      <h3>Daily Total: <span>${{(totalPrice[day].price).toFixed(2)}}</span></h3>
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
  import CopyMealPlan from './components/CopyMealPlan.vue'
  import draggable from 'vuedraggable'
  import Modal from './components/SearchProductModal.vue'
  let mealplanPath = 'https://shopify.draftserver.com/delish-deliveries/public/api/meal-plan/product/info/';

  export default {
    components: {
      draggable,
      CopyMealPlan,
      Modal,
    },
    data() {
      return {
        maxPotentialItems: [],
        modal: false,
        selectedProducts: null,
        selected: {
          meal: null,
          day: null,
        },
        maximizeProducts: [],
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
            total[i].cal += _.sumBy(val[i], function(item) { return parseFloat(item.cal); });
            total[i].protein += _.sumBy(val[i], function(item) { return parseFloat(item.protein); });
            total[i].fat += _.sumBy(val[i], function(item) { return parseFloat(item.fat); });
            total[i].carbs += _.sumBy(val[i], function(item) { return parseFloat(item.carbs); });
            total[i].price += _.sumBy(val[i], function(item) { return parseFloat(item.price); });
            total[i].cal_p = ( typeof self.max_calorie == "number" && self.max_calorie > 0 ) ? parseFloat( (total[i].cal * 100)/self.max_calorie ) : 3;
          }
        });

        /**
         * Update informat for the Chart
         */
         this.updateTargetMacro(total);

         return total;
       }
     },
     mounted() {
      fetch(`${mealplanPath}${this.getMealPlanHandle()}`)
      .then(res => res.json())
      .then((r) => {
        this.plan = r.plan;
        this.max_calorie = parseFloat(r.max_calorie);
      });

      this.$events.listen('addMaxPotentialItem', (recipe) => {
        this.maxPotentialItems = _.concat(this.maxPotentialItems, recipe);
      });

      this.$events.listen('removeFromMaxPotential', (recipe) => {
        const index = _.findIndex(this.maxPotentialItems, {id: recipe.id});
        this.maxPotentialItems = this.maxPotentialItems.splice(index, 0);
      });
    },
    methods: {
      test(x) {
        console.log(x);        
      },
      expandMeal(mealName) {
        this.mealTable.meal[mealName].hide = this.mealTable.meal[mealName].hide === true ? false : true;
      },
      updateTargetMacro(x) {
        let self = this;

        _.each(x, function(val,key) {
          let _total = parseFloat(val.carbs) + parseFloat(val.fat) + parseFloat(val.protein);
          let fat_p = parseFloat(((val.fat * 100 ) / _total ).toFixed(0));
          let protein_p = parseFloat(((val.protein * 100 ) / _total ).toFixed(0));
          let carbs_p = parseFloat(((val.carbs * 100 ) / _total ).toFixed(0));

          self.chart[key] = [
          { label: 'Fat', value: !Number.isNaN(fat_p) ? fat_p : 0, color: '#319d48' },
          { label: 'Protein', value: !Number.isNaN(protein_p) ? protein_p : 0, color: '#FCF500' },
          { label: 'Carbs', value: !Number.isNaN(carbs_p) ? carbs_p : 0, color: '#81C241' },
          ];
        });
      },
      copyMealPlan(i,mealtype = ''){
        this.copy.day = parseInt(i);
        this.copy.mealtype = mealtype;
        this.copy.showModal = true;
      },
      copyMealPlanTo(from, to){
        this.plan['am_snack'][to]  = this.plan['am_snack'][from.day];
        this.plan['breakfast'][to] = this.plan['breakfast'][from.day];
        this.plan['dinner'][to]  = this.plan['dinner'][from.day];
        this.plan['lunch'][to]   = this.plan['lunch'][from.day];
        this.plan['pm_snack'][to]  = this.plan['pm_snack'][from.day];
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