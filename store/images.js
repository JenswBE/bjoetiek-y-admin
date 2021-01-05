export const actions = {
  async upload(context, image) {
    console.debug('Store images/upload', 'Dispatched');

    // Build form data
    let formData = new FormData();
    formData.append('image', image.file);

    this.$axios
      .put(`/images/${image.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(({ data }) => {
        return data;
      })
      .catch((e) => {
        const msg = `Foto uploaden mislukt: ${e.message}`;
        context.commit(
          'general/SET_ALERT',
          { type: 'error', message: msg },
          { root: true }
        );
      });
  },
};
