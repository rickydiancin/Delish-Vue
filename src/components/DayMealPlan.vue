<template>
  <div class="day-meal-plan">
    <div class="macro-graph-2">
      <h4>{{ label }}:</h4>
      <span v-text="total.cal">0</span> cal |
      Fat <span v-text="total.fat">0</span>g |
      Protein <span v-text="total.protein">0</span>g |
      Carbs <span v-text="total.carbs">0</span>g
    </div>
    <div class="meal-toggle" v-bind:class="{ 'm--hide': hide }">
      <ul class="day-items" v-if="products">
        <li  v-for="(product, productkey) in products"  v-bind:class="product.type">
          {{product.title}}
        </li>
      </ul>
      <div style="margin-top: 10px;">
        <button @click="triggerModalOpen" class="btn btn-primary btn-block" type="button" data-toggle="modal" data-target="#myModal">+</button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'DayMealPlan',
    props: {
      meal: {
        type: String,
      },
      label: {
        type: String,
      },
      products: {
        type: [Object,Array],
      },
      day: {
        type: [Number,String],
      },
      hide: {
        type: Boolean,
      },
    },
    data() {
      return {
        total: {
          cal: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          price: 0
        }
      }
    },
    watch: {
      products: function (val) {
        this.calculateCalorie();
      },
    },
    mounted() {
      this.calculateCalorie();
    },
    methods: {
      triggerModalOpen() {
        this.$emit('openmodal', this.meal, this.day)
      },
      /**
       * Calculate total
       */
       calculateCalorie() {
        var arr = _.values(this.products);

        this.total.cal     = (_.sumBy(arr, item => Number(item.cal) * item.qty)).toFixed(3);
        this.total.protein = (_.sumBy(arr, item => Number(item.protein) * Number(item.qty))).toFixed(3);
        this.total.carbs   = (_.sumBy(arr, item => Number(item.carbs) * Number(item.qty))).toFixed(3);
        this.total.fat     = (_.sumBy(arr, item => Number(item.fat) * Number(item.qty))).toFixed(3);
        this.total.price   = (_.sumBy(arr, item => Number(item.price) * Number(item.qty))).toFixed(3);
        
        this.$emit('on-total-change',{'total': this.total, 'meal': this.meal, 'day': this.day});
      },
    },
  }
</script>
