<template>

  <head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@5.8.55/css/materialdesignicons.min.css">
  </head>
  <main>
    <section class="section has-text-centered">
      <h1 class="title">Spreadsheet Image to CSV </h1>
      <h2 class="subtitle">
        Convert an image containing typed or handwritten data in a spreadsheet format to a csv file using a large language model
      </h2>
    </section>

    <section>
      <ImageUpload @image-uploaded="handleImageUpload"/>
    </section>

    <!--
    <section class="section">
      <b-field label="Prompt">
        <b-input type="textarea" v-model="message"></b-input>
      </b-field>
    </section>
    -->

    <div v-if="imageData" class="mt-4 mb-4 has-text-centered">
      <button class="button is-primary" v-bind:class="{ 'is-loading': isProcessing }" @click="processImage">Process Image</button>
    </div>

    <template v-if="processingComplete">
      <section>
        <CSVTable :csv-file="csvFile"/>
      </section>
      <section>
        <article class="message">
          <div class="message-body" style="white-space: pre-wrap;">
            {{ notes }}
          </div>
        </article>
      </section>
      <section>
        <div class="has-text-centered mt-3 mb-5">
          <button class="button is-primary" @click="downloadCSV">Download CSV</button>
        </div>
      </section>
    </template>

  </main>

</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ImageUpload from "@/components/ImageUpload.vue";
import CSVTable from "@/components/CSVTable.vue";

export default defineComponent({
  components: {CSVTable, ImageUpload},
  setup() {
    const file = ref<File | null>(null);
    const imageData = ref(null);
    const isProcessing = ref(false);
    const processingComplete = ref(false);
    const csvFile = ref<string>();
    const notes = ref<string>();

    const handleImageUpload = (data) => {
      if (data) {
        console.log('Image uploaded');
        console.log(data);
        imageData.value = data;
      } else {
        // Handle the case when no image is uploaded
        console.log('No image uploaded');
        imageData.value = null;
      }
    };

    const processImage = async () => {
      if (imageData.value) {
        isProcessing.value = true;
        console.log('Process image');
        // Extract base64 data and media type from image data
        const [mediaType, base64Data] = imageData.value.split(',');
        const mimeType = mediaType.split(':')[1].split(';')[0];
        console.log(mimeType);
        console.log(base64Data);

        // read prompt text from text file
        const prompt = await fetch('/prompt.txt');
        const promptText = await prompt.text();
        console.log(promptText);

        // can't use anthropic typescript sdk because of CORS issues
        // need to specify proxy url
        const requestBody = {
          model: 'claude-3-opus-20240229',
          max_tokens: 1024,
          //temperature: 0.2,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mimeType,
                    data: base64Data,
                  },
                },
                {
                  type: 'text',
                  text: promptText,
                },
              ],
            },
          ],
        };

        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            origin: 'http://localhost:3000'
          },
          body: JSON.stringify(requestBody)
        };

        // make anthropic api call using cors-anywhere proxy
        try {
          const response = await fetch('http://localhost:3000/https://api.anthropic.com/v1/messages', options);
          const data = await response.json();
          console.log(data);
          const outputString = data.content[0].text;

          // parse output based on --CSV_END-- delimiter
          const [csvFileStr, notesStr] = outputString.split('--CSV-END--');
          csvFile.value = csvFileStr;
          notes.value = notesStr.trim();

          console.log(csvFile.value);
          console.log(notes.value);

        } catch (err) {
          console.error(err);
        }

        isProcessing.value = false;
        processingComplete.value = true;
      }
    };

    const downloadCSV = () => {
      const blob = new Blob([csvFile.value!], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return {
      file,
      imageData,
      isProcessing,
      processingComplete,
      csvFile,
      notes,
      handleImageUpload,
      processImage,
      downloadCSV,
    };
  }
});
</script>