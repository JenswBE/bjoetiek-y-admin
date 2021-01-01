<template>
  <v-container>
    <v-row>
      <v-col>
        <v-data-table
          :headers="headers"
          :items="categoriesList"
          sort-by="sort_order"
          class="elevation-1"
          :search="search"
          hide-default-footer
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-text-field
                v-model="search"
                append-icon="mdi-magnify"
                label="Search"
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
                    Categorie toevoegen
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
                            v-model="activeCategory.name"
                            label="Naam"
                            placeholder="Bv. Gelaatsverzorging"
                            clearable
                            @keydown.enter.prevent="saveCategory"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-textarea
                            v-model="activeCategory.description"
                            label="Beschrijving"
                          ></v-textarea>
                        </v-col>
                        <v-col cols="12">
                          <v-text-field
                            v-model="activeCategory.image_url"
                            label="Foto"
                            clearable
                            @keydown.enter.prevent="saveCategory"
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
                    <v-btn color="blue darken-1" text @click="saveCategory">
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
                      @click="confirmDeleteCategory"
                      >OK</v-btn
                    >
                    <v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="editCategory(item)">
              mdi-pencil
            </v-icon>
            <v-icon small @click="deleteCategory(item.id)"> mdi-delete </v-icon>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  head: { title: 'Categorieën' },

  data: () => ({
    search: '',
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
        value: 'image_url',
      },
      { text: 'Acties', value: 'actions', sortable: false },
    ],
    activeID: '',
    activeCategory: {
      name: '',
      description: '',
      image_url: '',
      sort_order: 999,
    },
    defaultCategory: {
      name: '',
      description: '',
      image_url: '',
      sort_order: 999,
    },
  }),

  computed: {
    ...mapState('categories', ['categories']),
    ...mapGetters('categories', ['categoriesList']),

    formTitle() {
      return this.activeID === '' ? 'Categorie toevoegen' : 'Categorie bewerken'
    },
  },

  watch: {
    formOpen(val) {
      val || this.closeForm()
    },
    confirmDeleteOpen(val) {
      val || this.closeConfirmDelete()
    },
  },

  mounted() {
    this.$store.dispatch('categories/list')
  },

  methods: {
    increaseSortOrder(category) {
      this.$store.dispatch('categories/increaseSortOrder', category.id)
    },

    decreaseSortOrder(category) {
      this.$store.dispatch('categories/decreaseSortOrder', category.id)
    },

    editCategory(category) {
      this.activeID = category.id
      this.activeCategory = Object.assign({}, category)
      this.formOpen = true
    },

    saveCategory() {
      if (this.activeID === '') {
        this.$store.dispatch('categories/add', this.activeCategory)
      } else {
        this.$store.dispatch('categories/update', this.activeCategory)
      }
      this.closeForm()
    },

    closeForm() {
      this.formOpen = false
      this.$nextTick(() => {
        this.activeID = ''
        this.activeCategory = Object.assign({}, this.defaultCategory)
      })
    },

    deleteCategory(category_id) {
      this.activeID = category_id
      this.confirmDeleteOpen = true
    },

    confirmDeleteCategory() {
      this.$store.dispatch('categories/delete', this.activeID)
      this.closeConfirmDelete()
    },

    closeConfirmDelete() {
      this.confirmDeleteOpen = false
      this.$nextTick(() => {
        this.activeID = ''
      })
    },
  },
}
</script>