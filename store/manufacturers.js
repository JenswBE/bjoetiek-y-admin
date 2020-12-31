export const state = () => ({
  manufacturers: [],
})

export const mutations = {
  SET_MANUFACTURERS(state, manufacturers) {
    state.manufacturers = manufacturers
  },

  ADD_MANUFACTURER(state, manufacturer) {
    this.$set(state.manufacturers, manufacturer.id, cloneDeep(manufacturer));
  },

  UPDATE_MANUFACTURER(state, manufacturer) {
    this.$set(state.manufacturers, manufacturer.id, cloneDeep(manufacturer));
  },

  DELETE_MANUFACTURER(state, manufacturer_id) {
    this.$delete(state.manufacturers, manufacturer_id);
  },
}

export const actions = {
  async get(context) {
    this.$axios
      .get(`/manufacturers`)
      .then(({ data }) => {
        manufacturers = data.reduce((result, item) => {
          result[item.id] = item;
          return result;
        }, {});
        context.commit('SET_MANUFACTURERS', manufacturers)
      })
      .catch((e) => {
        const msg = `Merken ophalen mislukt: ${e.message}`
        context.commit(
          'general/SET_ALERT',
          { type: 'error', message: msg },
          { root: true }
        )
      })
  },

  async add(context, manufacturer) {
    this.$axios
      .post(`/manufacturers`, manufacturer)
      .then(({ data }) => {
        context.commit('ADD_MANUFACTURER', data)
      })
      .catch((e) => {
        const msg = `Merk toevoegen mislukt: ${e.message}`
        context.commit(
          'general/SET_ALERT',
          { type: 'error', message: msg },
          { root: true }
        )
      })
  },

  async update(context, manufacturer) {
    this.$axios
      .put(`/manufacturers/${manufacturer.id}`, manufacturer)
      .then(({ data }) => {
        context.commit('UPDATE_MANUFACTURER', data)
      })
      .catch((e) => {
        const msg = `Merk bijwerken mislukt: ${e.message}`
        context.commit(
          'general/SET_ALERT',
          { type: 'error', message: msg },
          { root: true }
        )
      })
  },

  async delete(context, manufacturer) {
    this.$axios
      .delete(`/manufacturers/${manufacturer.id}`)
      .then(({ data }) => {
        context.commit('DELETE_MANUFACTURER', data)
      })
      .catch((e) => {
        const msg = `Merk verwijderen mislukt: ${e.message}`
        context.commit(
          'general/SET_ALERT',
          { type: 'error', message: msg },
          { root: true }
        )
      })
  },
}
