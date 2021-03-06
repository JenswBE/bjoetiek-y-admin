<template>
  <v-container>
    <v-row>
      <v-col>
        <v-data-table
          :headers="headers"
          :items="manufacturersList"
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
                    Merk toevoegen
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
                            v-model="activeManufacturer.name"
                            label="Naam"
                            placeholder="Bv. Nivea"
                            append-icon="mdi-close"
                            @click:append="activeManufacturer.name = ''"
                            @keydown.enter.prevent="saveManufacturer"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="activeManufacturer.website_url"
                            label="Website"
                            placeholder="Bv. https://nivea.be"
                            append-icon="mdi-close"
                            @click:append="activeManufacturer.website_url = ''"
                            @keydown.enter.prevent="saveManufacturer"
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
                    <v-btn color="blue darken-1" text @click="saveManufacturer">
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
                      @click="confirmDeleteManufacturer"
                      >OK</v-btn
                    >
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:item.logo="{ item }">
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
            <v-icon small class="mr-2" @click="editManufacturer(item)">
              mdi-pencil
            </v-icon>
            <v-icon small class="mr-2" @click="selectImage(item)">
              mdi-image-plus
            </v-icon>
            <v-icon small @click="deleteManufacturer(item.id)">
              mdi-delete
            </v-icon>
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
  head: { title: 'Merken' },

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
        text: 'Logo',
        sortable: false,
        value: 'logo',
      },
      {
        text: 'Website',
        sortable: false,
        value: 'website_url',
      },
      { text: 'Acties', value: 'actions', sortable: false },
    ],
    activeID: '',
    activeManufacturer: {
      name: '',
      website_url: '',
    },
    defaultManufacturer: {
      name: '',
      website_url: '',
    },
  }),

  computed: {
    ...mapState('manufacturers', ['manufacturers']),
    ...mapGetters('manufacturers', ['manufacturersList']),

    backendURL() {
      return this.$axios.defaults.baseURL + '/..';
    },

    formTitle() {
      return this.activeID === '' ? 'Merk toevoegen' : 'Merk bewerken';
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
    this.$store.dispatch('manufacturers/list');
  },

  methods: {
    editManufacturer(manufacturer) {
      this.activeID = manufacturer.id;
      this.activeManufacturer = cloneDeep(manufacturer);
      this.formOpen = true;
    },

    saveManufacturer() {
      const website_url = this.activeManufacturer.website_url;
      if (website_url.length > 0 && !website_url.startsWith('http')) {
        this.activeManufacturer.website_url = 'https://' + website_url;
      }

      if (this.activeID === '') {
        this.$store.dispatch('manufacturers/add', this.activeManufacturer);
      } else {
        this.$store.dispatch('manufacturers/update', this.activeManufacturer);
      }
      this.closeForm();
    },

    closeForm() {
      this.formOpen = false;
      this.$nextTick(() => {
        this.activeID = '';
        this.activeManufacturer = cloneDeep(this.defaultManufacturer);
      });
    },

    selectImage(manufacturer) {
      this.activeID = manufacturer.id;
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

    deleteManufacturer(manufacturer_id) {
      this.activeID = manufacturer_id;
      this.confirmDeleteOpen = true;
    },

    confirmDeleteManufacturer() {
      this.$store.dispatch('manufacturers/delete', this.activeID);
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