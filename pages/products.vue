<template>
  <v-container>
    <v-row>
      <v-col>
        <v-data-table
          :headers="headers"
          :items="productsList"
          sort-by="name"
          class="elevation-1"
          :search="search"
          hide-default-footer
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Zoeken"
                single-line
                hide-details
              ></v-text-field>
              <v-spacer></v-spacer>
              <v-dialog v-model="formOpen" max-width="500px">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    color="primary"
                    dark
                    class="mb-2"
                    v-bind="attrs"
                    v-on="on"
                  >
                    Product toevoegen
                  </v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    <span class="headline">{{ formTitle }}</span>
                  </v-card-title>

                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col cols="12">
                          <v-text-field
                            v-model="activeProduct.name"
                            label="Naam"
                            placeholder="Bv. Deep care handcrème"
                            append-icon="mdi-close"
                            @click:append="activeProduct.name = ''"
                            @keydown.enter.prevent="saveProduct"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="activeProduct.price"
                            label="Prijs"
                            placeholder="Bv. 15.00"
                            prefix="€"
                            type="number"
                            step="0.01"
                            min="0"
                            @keydown.enter.prevent="saveProduct"
                            :rules="[
                              () =>
                                !!activeProduct.price || 'Geen geldig bedrag',
                            ]"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-select
                            v-model="activeProduct.manufacturer_id"
                            :items="manufacturersList"
                            item-text="name"
                            item-value="id"
                            label="Fabrikant"
                            append-icon="mdi-close"
                            @click:append="activeProduct.manufacturer_id = ''"
                          ></v-select>
                        </v-col>
                        <v-col cols="12">
                          <v-select
                            v-model="activeProduct.manufacturer_id"
                            :items="categoriesList"
                            item-text="name"
                            item-value="id"
                            label="Categorieën"
                            chips
                            multiple
                          ></v-select>
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="activeProduct.stock_count"
                            label="In voorraad"
                            type="number"
                            min="0"
                            @keydown.enter.prevent="saveProduct"
                            :rules="[
                              () =>
                                !!activeProduct.stock_count ||
                                'Geen geldig getal',
                            ]"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="closeForm">
                      Annuleren
                    </v-btn>
                    <v-btn color="blue darken-1" text @click="saveProduct">
                      Opslaan
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog v-model="confirmDeleteOpen" max-width="500px">
                <v-card>
                  <v-card-title class="headline">Ben je zeker?</v-card-title>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                      color="blue darken-1"
                      text
                      @click="closeConfirmDelete"
                      >Annuleren</v-btn
                    >
                    <v-btn
                      color="blue darken-1"
                      text
                      @click="confirmDeleteProduct"
                      >OK</v-btn
                    >
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:item.logo_url="{ item }">
            <img
              :src="`${backendURL}/images/${item.id}-100-100-fit.png?cache=${cacheKey}`"
              class="ma-1"
              style="cursor: pointer"
              @click="selectImage(item)"
            />
          </template>
          <template v-slot:item.website_url="{ item }">
            <p>
              <a :href="item.website_url" target="_blank">{{
                item.website_url
              }}</a>
            </p>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="editProduct(item)">
              mdi-pencil
            </v-icon>
            <v-icon small class="mr-2" @click="selectImage(item)">
              mdi-image-plus
            </v-icon>
            <v-icon small @click="deleteProduct(item.id)"> mdi-delete </v-icon>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <input
      ref="imageUploader"
      class="d-none"
      type="file"
      accept="image/*"
      @change="uploadImage"
    />
  </v-container>
</template>

<script>
import cloneDeep from 'lodash.clonedeep';
import { mapGetters, mapState } from 'vuex';

export default {
  head: { title: 'Producten' },

  data: () => ({
    search: '',
    cacheKey: '',
    formOpen: false,
    confirmDeleteOpen: false,
    headers: [
      {
        text: 'Naam',
        sortable: true,
        value: 'name',
      },
      {
        text: 'Foto',
        sortable: false,
        value: 'photo',
      },
      {
        text: 'Prijs',
        sortable: false,
        value: 'price',
      },
      {
        text: 'Fabrikant',
        sortable: false,
        value: 'manufacturer_id',
      },
      {
        text: 'In voorraad',
        sortable: false,
        value: 'stock_count',
      },
      {
        text: 'Status',
        sortable: false,
        value: 'status',
      },
      { text: 'Acties', value: 'actions', sortable: false },
    ],
    activeID: '',
    activeProduct: {
      name: '',
      created_at: '',
      updated_at: '',
      name: '',
      slug: '',
      description_short: '',
      description_long: '',
      price: 0,
      manufacturer_id: '',
      status: '',
      stock_count: 0,
    },
    defaultProduct: {
      name: '',
      created_at: '',
      updated_at: '',
      name: '',
      slug: '',
      description_short: '',
      description_long: '',
      price: 0,
      manufacturer_id: '',
      status: '',
      stock_count: 0,
    },
  }),

  computed: {
    ...mapState('products', ['products']),
    ...mapGetters('categories', ['categoriesList']),
    ...mapGetters('manufacturers', ['manufacturersList']),
    ...mapGetters('products', ['productsList']),

    backendURL() {
      return this.$axios.defaults.baseURL + '/..';
    },

    formTitle() {
      return this.activeID === '' ? 'Product toevoegen' : 'Product bewerken';
    },
  },

  watch: {
    formOpen(val) {
      val || this.closeForm();
    },
    confirmDeleteOpen(val) {
      val || this.closeConfirmDelete();
    },
  },

  mounted() {
    this.bumpCacheKey();
    this.$store.dispatch('products/list');
    this.$store.dispatch('categories/list');
    this.$store.dispatch('manufacturers/list');
  },

  methods: {
    editProduct(product) {
      this.activeID = product.id;
      this.activeProduct = cloneDeep(product);
      this.formOpen = true;
    },

    saveProduct() {
      if (this.activeID === '') {
        this.$store.dispatch('products/add', this.activeProduct);
      } else {
        this.$store.dispatch('products/update', this.activeProduct);
      }
      this.closeForm();
    },

    closeForm() {
      this.formOpen = false;
      this.$nextTick(() => {
        this.activeID = '';
        this.activeProduct = cloneDeep(this.defaultProduct);
      });
    },

    selectImage(product) {
      this.activeID = product.id;
      this.$refs.imageUploader.click();
    },

    async uploadImage(e) {
      const file = e.target.files[0];
      await this.$store.dispatch('images/upload', { id: this.activeID, file });
      setTimeout(this.bumpCacheKey, 2000);
    },

    bumpCacheKey() {
      this.cacheKey = Date.now();
    },

    deleteProduct(product_id) {
      this.activeID = product_id;
      this.confirmDeleteOpen = true;
    },

    confirmDeleteProduct() {
      this.$store.dispatch('products/delete', this.activeID);
      this.closeConfirmDelete();
    },

    closeConfirmDelete() {
      this.confirmDeleteOpen = false;
      this.$nextTick(() => {
        this.activeID = '';
      });
    },
  },
};
</script>