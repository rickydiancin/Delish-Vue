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
            <select>
              <option> Tom's Meal Plan</option>
            </select>
            <label class="meal-plan-purchase-btn">
              <button type="button">Purchase Meal Plan</button>
              <span>${{ _.sumBy(totalPrice,'cal') }} AUD</span>
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
                <draggable v-model="maximizeProducts" group="people" @start="drag=true" @end="drag=false" class="maximize-draggable-zone">
                  <div v-for="(product, index) in maximizeProducts" :key="index">{{product.title}}</div>
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
          Day {{day}}
          <div class="progress" style="height: 6px;">
            <div class="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: 60%;"></div>
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
            <draggable v-model="plan[mealName][day]" group="people" @start="drag=true" @end="drag=false" style="min-height: 100px;">
              <div 
              v-for="(product, index) in products" 
              :key="index" 
              class="meal-table-product"
              >{{product.title}}</div>
            </draggable>
          </div>
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
</section>
</template>

<script>

  import draggable from 'vuedraggable'
  import Modal from './components/SearchProductModal.vue'
  let mealplanPath = 'https://shopify.draftserver.com/delish-deliveries/public/api/meal-plan/product/info/';

  export default {
    components: {
      draggable,
      Modal,
    },
    data() {
      return {
        modal: false,
        selectedProducts: null,
        selected: {
          meal: null,
          day: null,
        },
        maximizeProducts: [],
        plan: null,
        active: {
          breakfast: 0,
          am_snack: 0,
          lunch: 0,
          pm_snack: 0,
          dinner: 0,
        },
        chart: {
          1 : [{ label: 'Fat', value: 0}, { label: 'Calorie', value: 0}, { label: 'Protien', value: 0}],
          2 : [{ label: 'Fat', value: 0}, { label: 'Calorie', value: 0}, { label: 'Protien', value: 0}],
          3 : [{ label: 'Fat', value: 0}, { label: 'Calorie', value: 0}, { label: 'Protien', value: 0}],
          4 : [{ label: 'Fat', value: 0}, { label: 'Calorie', value: 0}, { label: 'Protien', value: 0}],
          5 : [{ label: 'Fat', value: 0}, { label: 'Calorie', value: 0}, { label: 'Protien', value: 0}],
          6 : [{ label: 'Fat', value: 0}, { label: 'Calorie', value: 0}, { label: 'Protien', value: 0}],
          7 : [{ label: 'Fat', value: 0}, { label: 'Calorie', value: 0}, { label: 'Protien', value: 0}],
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
          }
        });
        this.updateTargetMacro(total);
        return total;
      }
    },
    mounted() {
      fetch(`${mealplanPath}${this.getMealPlanHandle()}`)
      .then(res => res.json())
      .then(r => this.plan = r.plan);
    },
    methods: {
      expandMeal(mealName) {
        this.mealTable.meal[mealName].hide = this.mealTable.meal[mealName].hide === true ? false : true;
        // this.active[mealName] = this.active[mealName] === 1 ? 0 : 1;
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