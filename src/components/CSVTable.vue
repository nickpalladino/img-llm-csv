<template>
  <div>
    <b-table :data="tableData" narrowed>
      <b-table-column v-for="column in columns" :key="column.field" :field="column.field" :label="column.label" :numeric="column.numeric">
        <template v-slot="props">
          <span :class="{ 'has-background-warning': isUncertain(props.row, column.field) }">
            {{ props.row[column.field] }}
          </span>
        </template>
      </b-table-column>
    </b-table>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Papa from 'papaparse';

export default {
  props: {
    csvFile: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const csvData = ref(null);
    const tableData = ref([]);
    const columns = ref([]);

    onMounted(() => {
      parseCSVData(props.csvFile);
    });

    const parseCSVData = (csvText) => {
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          csvData.value = results.data;
          extractTableData();
          extractColumnDefinitions();
        },
      });
    };

    const extractTableData = () => {
      tableData.value = csvData.value.map((row) => {
        const rowData = {};
        for (const key in row) {
          if (!key.endsWith('_uncertainty')) {
            rowData[key] = row[key];
          }
        }
        return rowData;
      });
    };

    const extractColumnDefinitions = () => {
      const headerRow = csvData.value[0];
      columns.value = Object.keys(headerRow)
          .filter((key) => !key.endsWith('_uncertainty'))
          .map((key) => ({
            field: key,
            label: key,
            numeric: !isNaN(headerRow[key]),
          }));
    };

    const isUncertain = (row, field) => {
      const originalRow = csvData.value.find((item) => item[field] === row[field]);
      const uncertaintyField = `${field}_uncertainty`;
      return originalRow[uncertaintyField] === 'true';
    };

    return {
      tableData,
      columns,
      isUncertain,
    };
  },
};
</script>