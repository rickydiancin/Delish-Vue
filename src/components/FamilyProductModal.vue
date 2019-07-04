<template>
  <section class="list-wrapper">
    <vue-progress-bar></vue-progress-bar>
    <button 
      type="button" 
      class="confirm-btn btn btn-medium btn-primary" 
      @click="confirm"
    >Confirm Ingredients</button>
    <div class="chosen-ingridents">
      <h5>Chosen Ingredients</h5>
      <div class="meal-products-lists">
          <div class="meal-product-be"
            v-for="(product, index) in selectedPlanProducts" 
            :key="index"
          >
            <div :key="componentKey">
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
                {{product.qty}}
              </label>
              
              <div class="image-buttons">
                <div class="meal-list-img">
                  <img v-if="product.image" :src="baseUrl + product.image" alt="no img" width="50" />
                  <img v-if="!product.image" :src="baseUrl + defaultImg" alt="no img" />
                </div>
                <div class="meal-image-wrap">
                  <button 
                    class="product-delete" 
                    type="button"
                    @click="minusIngrident(index, product)"
                  >-</button>
                  <input 
                    type="text" 
                    class="product-input-qty" 
                    :value="product.qty" 
                    disabled
                  />
                  <button 
                    class="product-add" 
                    type="button"
                    @click="addIngrident(index, product)"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <h5>{{ product.title }}</h5>
          </div>
      </div>
    </div>

    <!-- recommended items -->
    <div class="meal-recommend">
      <div>
        <div class="pull-left product-cat-dropdown">
          <label>Product Category</label><br />
          <select 
            class="meal-cat-list" 
            v-model="selected.category" 
          >
            <option :value="0">All Products</option>
            <optgroup 
              v-for="cat in productCategories" 
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
          <div><h5>Search Family Products</h5></div>
          <center>
            <h4 v-if="search === true && products.length <= 0">No Products Found</h4>
          </center>
        </div>                  
        <br />
        <div class="row" v-if="products.length > 0">
          <div class="col-3" v-for="product in products">
            <selectable-product
              :products="selectedPlanProducts"
              :product="product"
              @addProduct="addProduct"
              @removeProduct="removeProduct" 
              @qtyChange="updateSelectedProduct"
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
  import SelectableProduct from './SelectableProduct.vue'

  export default {
    name: 'ProductLists',
    components: {
      'selectable-product': SelectableProduct,
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
        componentKey: 0,
        // pagination
        currentPage: 1,
        rows: 0,
        perPage: 8,
        // Selected products for specific meal plan
        selectedPlanProducts: [],
        // Search keyword and fetched products
        keyword: '',
        products: [],
        // categories
        productCategories: [],
        selected: {
          category: 0,
        },
      }
    },
    mounted() {
      // create copy of products prop
      const products = _.clone(this.mealPlanProducts)
      
      // Show only family product 
      this.selectedPlanProducts = products.filter((product) => {
        return product.type === 'product'
      })

      // Collections/categories
      axios.get(`${window.middleware_base_url}/api/meal-plan/categories/all`)
        .then((res) => {
          this.productCategories = res.data.data
        })
    },
    methods: {
      searchProduct: _.debounce(function() {
        if(!this.keyword) {
          return
        }

        this.search = true
        this.currentPage = 1
        this.products = []

        this.$Progress.start()
        axios.get(`${window.middleware_base_url}/api/meal-plan/family-product/search/${this.keyword}/${this.selected.category}?page=${this.currentPage}`)
          .then((res) => {
            this.rows = res.data.data.total
            this.products = res.data.data.data
            this.$Progress.finish()
          })
      }, 500),
      paginateProduct(page) {
        if(!this.keyword) {
          return
        }

        this.products = []
        
        axios.get(`${window.base_url}/api/meal-plan/family-product/search/${this.keyword}/${this.selected.category}?page=${page}`)
          .then((res) => {
            this.products = res.data.data.data
          })
      },
      /**
       * Add product to chosen ingrident list
       * 
       * @param {[type]} product [description]
       */
      addProduct(product) {
        let index = _.findIndex(this.selectedPlanProducts, (p) => {
          return p.id === product.id
        })

        if(index == -1) {
          this.selectedPlanProducts.push(product)
        } else {
          this.selectedPlanProducts[index].qty += product.qty
        }

        this.componentKey += 1
      },
      /**
       * Remove selected product from chosen ingridents tab
       * 
       * @param  {[type]} product [description]
       * @return {[type]}         [description]
       */
      removeProduct(product) {
        let index = _.findIndex(this.selectedPlanProducts, product)
        this.selectedPlanProducts.splice(index, 1)
      },
      /**
       * Method is triggered when searched product qty is updated
       * from <selected-product @qtyChange /> event
       * 
       * @param  {[type]} product [description]
       * @param  {[type]} qty     [description]
       * @return {[type]}         [description]
       */
      updateSelectedProduct(product, qty) {
        let index = _.findIndex(this.selectedPlanProducts, product)
        
        if(index != -1) {
          this.selectedPlanProducts[index].qty = qty
          this.componentKey += 1
        }
      },
      // remove product from chosen list
      removeChosenProduct(product) {
        this.removeProduct(product)
        this.$events.fire('removeFromSearchList', product)
      },
      // Decrease product qty
      minusIngrident(i, product) {
        if(this.selectedPlanProducts[i].qty <= 1) {
          return
        }
        
        this.selectedPlanProducts[i].qty -= 1
        this.componentKey += 1

        // Event is listened in SelectableProduct.vue
        this.$events.fire('minusChosenIngrident', product)
      },
      // Increase product qty
      addIngrident(i, product) {
        if(this.selectedPlanProducts[i].qty >= 99) {
          return
        }

        this.selectedPlanProducts[i].qty += 1
        this.componentKey += 1

        // Event is listened in SelectableProduct.vue
        this.$events.fire('addChosenIngrident', product)
      },
      /**
       * Save selected meals to plan
       * 
       * @return {[type]} [description]
       */
      confirm() {
        let products = this.selectedPlanProducts

        this.$emit('confirm', products)
        // this.$toasted.show('Day meal plan products updated');
      },
    }
  }
</script>
