<template>
  <section class="list-wrapper">
    <vue-progress-bar></vue-progress-bar>
    <button 
      type="button" 
      class="confirm-btn btn btn-medium btn-primary" 
      @click="confirm"
    >Confirm</button>
    <div class="chosen-ingridents">
      <h5>Chosen Recipe/s</h5>
      <div class="meal-products-lists">
        <div class="meal-product-be" 
          v-for="(product, index) in selectedPlanRecipes" 
          :key="index"
        >
          <div>
            <button 
              class="delete-product" 
              type="button" 
              @click="removeChosenProduct(product)"
            >
              x
            </button>
            <label 
              class="qty-product" 
              for="quantity"
            >
              {{product.serving}}x
            </label>
            <div class="image-buttons">
              <div class="meal-list-img">
                <img v-if="product.image" :src="baseUrl + product.image" alt="no img" width="50" />
                <img v-if="!product.image" :src="baseUrl + defaultImg" alt="no img" />
              </div>
            </div>
            <h5>{{ product.title }}</h5>
          </div>
        </div>
      </div>
    </div>

    <!-- recommended items -->
    <div class="meal-recommend" style="overflow: hidden;">
      <div>
        <div class="pull-left">
          <label>Recipe Category</label><br />
          <select 
            class="meal-cat-list" 
            v-model="selected.category" 
          >
            <option :value="0">All Recipes</option>
            <optgroup 
              v-for="cat in recipeCategories" 
              :label="cat.title"
            >
              <option 
                v-for="c in cat.child"
                :value="c.id"
              >
                {{c.title}}
              </option>
            </optgroup>
          </select>
        </div>
        <div>
          <input 
            v-model="keyword"
            type="search" 
            class="pull-right"
            style="margin-top: 28px" 
            placeholder="Press enter to search ..."
            v-on:keydown.enter.prevent 
            @input="searchProduct" 
          />
        </div>
      </div>
      <div class="clearfix"></div>
      <div class="recommend-container" style="margin-top: 20px; min-height: 400px;">
        <div>
          <div><h5>Search Recipes</h5></div>
        </div>                  
        <br />
        <div class="row" v-if="products.length > 0">
          <div class="col-md-3" v-for="product in products">
            <selectable-recipe
              :products="selectedPlanRecipes"
              :product="product"
              @addProduct="addProduct"
              @removeProduct="removeProduct" 
            />
          </div>
        </div>
      </div>
      <div style="margin-top: 10px">
        <b-pagination
          v-model="currentPage"
          :total-rows="rows"
          :per-page="perPage"
          aria-controls="my-table"
          @change="paginateProduct"
        ></b-pagination>
      </div>
    </div>
  </section>
</template>

<script>
  import _ from 'lodash';
  import axios from 'axios';
  import SelectableRecipe from './SelectableRecipe.vue'

  export default {
    name: 'ProductLists',
    components: {
      'selectable-recipe': SelectableRecipe,
    },
    props: {
      mealPlanProducts: {
        type: Array,
      },
    },
    data() {
      return {
        baseUrl: window.middleware_base_url,
        search: false,
        // default
        defaultImg: '/images/placeholder-200x200.png',
        // pagination
        currentPage: 1,
        rows: 0,
        perPage: 8,
        // Selected products for specific meal plan
        selectedPlanRecipes: [],
        // Search keyword and fetched products
        keyword: '',
        products: [],
        // categories
        recipeCategories: [],
        selected: {
          category: 0,
        },
      }
    },
    mounted() {
      const products = _.clone(this.mealPlanProducts)
      
      // Show only recipe product type
      this.selectedPlanRecipes = products.filter((product) => {
        return product.type === 'recipe'
      })
    },
    methods: {
      // Search recipe products
      searchProduct: _.debounce(function() {
        if(!this.keyword) {
          return
        }

        this.currentPage = 1
        this.products = []

        axios.get(`${window.middleware_base_url}/api/meal-plan/recipes/search/${this.keyword}/${this.selected.category}?page=${this.currentPage}`)
          .then((res) => {
            this.search = true
            this.rows = res.data.data.total
            this.products = res.data.data.data
          })
      }, 500),
      // Fetch paginated page records
      paginateProduct(page) {
        if(!this.keyword) {
          return
        }

        this.products = []
        
        axios.get(`${window.base_url}/api/meal-plan/recipes/search/${this.keyword}/${this.selected.category}?page=${page}`)
          .then((res) => {
            this.rows = res.data.data.total
            this.products = res.data.data.data
          })
      },
      /**
       * Add product to chosen ingrident list
       * 
       * @param {[type]} product [description]
       */
      addProduct(product) {
        let index = _.findIndex(this.selectedPlanRecipes, (p) => {
          return p.id === product.id
        })

        if(index == -1) {
          this.selectedPlanRecipes.push(product)
        } else {
          this.selectedPlanRecipes[index].qty += product.qty
        }
      },
      /**
       * Remove selected product from chosen ingridents tab
       * 
       * @param  {[type]} product [description]
       * @return {[type]}         [description]
       */
      removeProduct(product) {
        let index = _.findIndex(this.selectedPlanRecipes, product)
        this.selectedPlanRecipes.splice(index, 1)
      },
      /**
       * Remove chosen product
       * 
       * @param  {[type]} product [description]
       * @return {[type]}         [description]
       */
      removeChosenProduct(product) {
        this.removeProduct(product)
        this.$events.fire('removeFromSearchList', product)
        this.$events.fire('removeFromMaxPotential', product)
      },
      /**
       * Save selected meals to plan
       * 
       * @return {[type]} [description]
       */
      confirm() {
        let products = this.selectedPlanRecipes
        
        // filter out maximize product
        let maxPotentialProduct = _.filter(this.selectedPlanRecipes, (recipe) => {
          recipe.max_potential -= 1;
          return (recipe.type == 'recipe' && recipe.new == true);
        });
        
        this.$events.fire('addMaxPotentialItem', maxPotentialProduct)
        this.$emit('confirm', products)

        // this.$toasted.show('Day meal plan recipes updated');
      },
    }
  }
</script>