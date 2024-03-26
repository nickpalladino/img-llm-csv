<template>
  <div>
    <b-field class="file is-primary is-centered" :class="{'has-name': !!file}">
      <b-upload v-model="file" accept="image/*" @input="onFileChange" class="file-label">
        <span class="file-cta">
            <b-icon class="file-icon" icon="upload"></b-icon>
            <span class="file-label">Upload image</span>
        </span>
        <span class="file-name" v-if="file">
            {{ file.name }}
        </span>
      </b-upload>
    </b-field>

    <div v-if="imageUrl" class="has-text-centered">
      <img :src="imageUrl" alt="Uploaded Image" class="preview-image" />
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  emits: ['image-uploaded'],
  setup(props, { emit }) {
    const file = ref(null);
    const imageUrl = ref(null);

    const onFileChange = (event) => {
      file.value = event.target.files[0];
    };

    watch(file, (newFile) => {
      if (newFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          imageUrl.value = event.target.result;
          emit('image-uploaded', imageUrl.value);
        };
        reader.readAsDataURL(newFile);
      } else {
        imageUrl.value = null;
        emit('image-uploaded', null);
      }
    });

    return {
      file,
      imageUrl,
      onFileChange,
    };
  },
};
</script>

<style scoped>
.preview-image {
  max-width: 500px;
}
</style>