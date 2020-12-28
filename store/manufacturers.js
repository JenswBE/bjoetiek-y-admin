export const state = () => ({
  manufacturers: [],
})

export const mutations = {
  SET_MANUFACTURERS(state, manufacturers) {
    state.manufacturers = manufacturers
  },
}

export const actions = {
  async get(context) {
    this.$axios
      .get(`/manufacturers`)
      .then(({ data }) => {
        context.commit('SET_MANUFACTURERS', data)
      })
      .catch((e) => {
        const msg = `Unable to fetch manufacturers: ${e.message}`
        context.commit(
          'general/SET_ALERT',
          { type: 'error', message: msg },
          { root: true }
        )
      })
  },
}
