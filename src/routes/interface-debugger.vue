<template>
  <div class="interface-debugger">
    <v-header-bar :breadcrumb="links" />

    <div
      :style="{ width: width + 'px' }"
      class="interface">
      <v-interface
        v-model="value"
        :id="id"
        :name="id"
        :type="type"
        :length="length"
        :readonly="readonly"
        :required="required"
        :loading="loading"
        :options="options"
        :new-item="newItem"
        :relationship="relationship"
        :fields="fields"
        :values="values" />
    </div>

    <form @submit.prevent>
      <fieldset>
        <legend>Output</legend>

        <label for="value">Value</label>
        <v-input
          v-model="value"
          id="value"
          type="text"
          class="value" />

        <label>Listing</label>
        <div class="listing">
          <v-readonly
            v-model="value"
            :interface-type="id"
            :name="id"
            :type="type"
            :length="length"
            :readonly="readonly"
            :required="required"
            :loading="loading"
            :options="options"
            :new-item="newItem"
            :relationship="relationship" />
        </div>
      </fieldset>
      <fieldset>
        <legend>Settings</legend>

        <div class="settings">
          <label for="type">Type</label>
          <select
            id="type"
            v-model="type">
            <option
              v-for="(length, type) in extension.datatypes"
              :key="type"
              :value="type"
            >{{ type }}</option>
          </select>
        </div>

        <div class="settings">
          <label for="length">Length</label>
          <v-input
            id="length"
            v-model="length"
            type="number"
            class="length"
            :min="0" />
        </div>

        <div class="settings">
          <v-checkbox
            id="readonly"
            v-model="readonly"
            value="readonly"
            class="checkbox"
            type="checkbox" /> <label for="readonly" class="inline">Read only</label>
        </div>

        <div class="settings">
          <v-checkbox
            id="required"
            v-model="required"
            value="required"
            class="checkbox"
            type="checkbox" /> <label for="required" class="inline">Required</label>
        </div>

        <div class="settings">
          <v-checkbox
            id="loading"
            v-model="loading"
            value="loading"
            class="checkbox"
            type="checkbox" /> <label for="loading" class="inline">Loading</label>
        </div>

        <div class="settings">
          <label for="related">Related Collection</label>
          <v-input
            id="related"
            type="text"
            v-model="relatedCollection" />
        </div>

        <div class="settings">
          <label for="related-pk">Related Collection Primary Key Field</label>
          <v-input
            id="related-pk"
            type="text"
            v-model="relatedCollectionPrimaryKey" />
        </div>
      </fieldset>
      <fieldset>
        <legend>Options</legend>
        <div
          v-for="(option, optionID) in extension.options"
          class="options"
          :key="optionID">
          <label :for="optionID">{{ option.name }}</label>
          <p>{{ option.comment }}</p>
          <v-interface
            v-model="options[optionID]"
            :id="option.interface"
            :name="optionID"
            :type="option.type"
            :length="option.length"
            :readonly="option.readonly"
            :required="option.required"
            :loading="option.loading"
            :options="option.options" />
        </div>
      </fieldset>
      <fieldset>
        <legend>Misc.</legend>

        <div class="misc">
          <v-checkbox
            id="new"
            v-model="newItem"
            value="newItem"
            class="checkbox"
            type="checkbox" /> <label for="new" class="inline">New item</label>
        </div>

        <div class="misc">
          <label for="fields">Fields</label>
          <v-interface
            :value="JSON.stringify(fields)"
            @input="fields = JSON.parse($event)"
            id="json"
            name="fields" />
          <label for="values">Values</label>
          <v-interface
            :value="JSON.stringify(values)"
            @input="values = JSON.parse($event)"
            id="json"
            name="value s" />
      </div>
      </fieldset>
    </form>
  </div>
</template>

<script>
export default {
  name: "interface-debugger",
  metaInfo() {
    return {
      title: "Interface Debugger"
    };
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      type: null,
      length: null,
      value: null,
      readonly: false,
      required: false,
      loading: false,
      options: {},
      width: 1000,
      newItem: false,
      relatedCollection: "",
      relatedCollectionPrimaryKey: "",
      fields: {
        name: {
          collection: "movies",
          default_value: null,
          field: "name",
          group: null,
          hidden_input: false,
          hidden_list: false,
          id: 154,
          interface: "text-input",
          length: "100",
          locked: false,
          managed: true,
          name: "Name",
          note: null,
          options: null,
          primary_key: false,
          readonly: false,
          relationship: null,
          required: false,
          signed: null,
          sort: "10",
          translation: null,
          type: "VARCHAR",
          validation: null,
          view_width: 4
        },
        director: {
          collection: "movies",
          default_value: null,
          field: "director",
          group: null,
          hidden_input: false,
          hidden_list: false,
          id: 161,
          interface: "text-input",
          length: "100",
          locked: false,
          managed: true,
          name: "Director",
          note: null,
          options: null,
          primary_key: false,
          readonly: false,
          relationship: null,
          required: false,
          signed: null,
          sort: "9",
          translation: null,
          type: "VARCHAR",
          validation: null,
          view_width: 4
        }
      },
      values: {
        name: "Directus The Movie",
        director: "Ben Spielberg"
      }
    };
  },
  computed: {
    links() {
      return [
        {
          name: "Interfaces",
          path: "/interfaces"
        },
        {
          name: this.extension.name,
          path: `/interfaces/${this.id}`
        }
      ];
    },
    extension() {
      return this.$store.state.extensions.interfaces[this.id];
    },
    relationship() {
      if (
        this.relatedCollection.length > 0 &&
        this.relatedCollectionPrimaryKey.length > 0
      ) {
        return {
          collection: this.relatedCollection,
          field: this.relatedCollectionPrimaryKey
        };
      }

      return null;
    }
  },
  watch: {
    id() {
      this.hydrate();
    },
    type() {
      this.length = this.extension.datatypes[this.type];
    }
  },
  created() {
    this.hydrate();
  },
  methods: {
    hydrate() {
      // Set type to the first datatype available in the meta info
      this.type = Object.keys(this.extension.datatypes)[0];

      // Populate the options with the default values
      const defaults = this.$lodash.mapValues(
        this.extension.options,
        settings => settings.default || null
      );
      this.options = defaults;
    }
  }
};
</script>

<style scoped lang="scss">
.interface-debugger {
  padding: var(--page-padding);
}

.checkbox {
  width: auto;
  display: inline-block;
  vertical-align: middle;
  padding-right: 5px;
}

.interface {
  margin-bottom: 40px;
  max-width: 100%;
}

.value {
  margin-bottom: 20px;
  max-width: 400px;
}

.listing {
  margin-bottom: 40px;
  max-width: 100%;
}

.length {
  max-width: 100px;
}

.inline {
  display: inline-block;
}

label {
  margin-bottom: 5px;
  width: max-content;
}

fieldset {
  border-top: 1px solid var(--lighter-gray);
  padding: 10px 0 20px;

  legend {
    padding: 10px;
    text-align: center;
  }

  p {
    color: var(--light-gray);
    padding-bottom: 10px;
    font-style: italic;
  }

  .settings,
  .options,
  .misc {
    margin-bottom: 40px;
  }
}

output {
  background-color: white;
  padding: 10px;
  margin: 10px 0;
  font-family: monospace;
  display: block;
}
</style>
