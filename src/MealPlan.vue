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
              <span>$119.90 AUD</span>
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
        <td v-for="day in 7">Day {{day}}</td>        
      </tr>
      <tr v-for="(meal, mealName) in plan">
        <td>
          {{labels[mealName]}}
          <button type="button" @click="expandMeal(mealName)">^</button>
        </td>
        <td v-for="(products, day) in meal">
          <div v-if="active[mealName]">
            <draggable v-model="plan[mealName][day]" group="people" @start="drag=true" @end="drag=false" style="min-height: 100px;">
              <div v-for="(product, index) in products" :key="index" class="meal-table-product">{{product.title}}</div>
            </draggable>
          </div>
          <button type="button">Add a Recipe / Product</button>
        </td>
      </tr>      
    </table>
    <br />
    <br />
  </section>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  components: {
    draggable,
  },
  data() {
    return {
      maximizeProducts: [],
      plan: null,
      active: {
        breakfast: 0,
        am_snack: 0,
        lunch: 0,
        pm_snack: 0,
        dinner: 0,
      },
      labels: {
        breakfast: 'Breakfast',
        am_snack: 'AM Snack',
        lunch: 'Lunch',
        pm_snack: 'PM Snack',
        dinner: 'Dinner',
      }
    }
  },
  mounted() {
    fetch('https://shopify.draftserver.com/delish-deliveries/public/api/meal-plan/product/info/awesome-meal-101')
      .then(res => res.json())
      .then(r => this.plan = r.plan);
  },
  methods: {
    expandMeal(mealName) {
      this.active[mealName] = this.active[mealName] === 1 ? 0 : 1;
    }
  }
}
</script>
