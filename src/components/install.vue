<template>
  <v-modal :buttons="buttons" @next="nextTab" action-required>

    <div class="tabs">
      <button
        :class="{ active: activeTab === 'project' }"
        @click="activeTab = 'project'">{{ $t('project') }}</button>
      <button
        :class="{ active: activeTab === 'database' }"
        @click="activeTab = 'database'"
        :disabled="databaseDisabled">{{ $t('database') }}</button>
      <button
        :class="{ active: activeTab === 'schema' }"
        @click="activeTab = 'schema'"
        :disabled="schemaDisabled">{{ $t('schema') }}</button>
    </div>

    <div class="tab" v-show="activeTab === 'project'">
      <h1 class="style-0">{{ $t("project_info") }}</h1>
      <p>
        {{ $t("project_info_copy" )}}
      </p>
    </div>

    <div class="tab" v-show="activeTab === 'database'">
      <h1 class="style-0">{{ $t("database_connection") }}</h1>
      <p>{{ $t("database_connection_copy") }}</p>
    </div>

    <div class="tab" v-show="activeTab === 'schema'">
      <h1 class="style-0">{{ $t("initial_schema") }}</h1>
      <p>{{ $t("initial_schema_copy") }}</p>
    </div>

  </v-modal>
</template>

<script>
export default {
  name: "v-install",
  data() {
    return {
      activeTab: "project",
      saving: false,

      values: {}
    };
  },
  computed: {
    databaseDisabled() {
      return true;
    },
    schemaDisabled() {
      return true;
    },
    buttons() {
      let disabled = false;

      if (this.activeTab === "project" && !this.interfaceName)
        disabled = true;

      if (this.activeTab === "database" && !this.field) disabled = true;

      return {
        next: {
          disabled,
          text:
            this.activeTab === "schema" ? this.$t("save") : this.$t("next"),
          loading: this.saving
        }
      };
    }
  },
  methods: {
    nextTab() {
      switch (this.activeTab) {
        case "projectj":
          this.activeTab = "database";
          break;
        case "database":
          this.activeTab = "schema";
          break;
        case "schema":
        default:
          this.save();
          break;
      }
    },
    save() {
      this.$emit("install", this.values);
    }
  }
};
</script>

<style lang="scss" scoped>
.tab {
  padding: 30px;

  .style-0 {
    max-width: 80%;
    margin-bottom: 30px;
  }

  p {
    line-height: 2;
    max-width: 70%;
  }
}

.tabs {
  display: flex;
  padding: 0;
  list-style: none;
  justify-content: center;
  border-bottom: 1px solid var(--lightest-gray);
  position: sticky;
  top: 0;
  background-color: var(--white);
  z-index: +1;

  button {
    flex-grow: 1;
    flex-shrink: 1;
    max-width: 120px;
    flex-basis: 120px;
    height: 50px;
    position: relative;
    color: var(--gray);

    text-decoration: none;
    text-transform: uppercase;
    font-size: 12px;
    font-weight: 700;
    position: relative;

    &:hover {
      color: var(--darker-gray);
    }

    &::after {
      content: "";
      display: block;
      width: 100%;
      position: absolute;
      height: 3px;
      bottom: -2px;
      background-color: var(--accent);
      transform: scaleY(0);
      transition: transform var(--fast) var(--transition-out);
    }

    &.active {
      color: var(--accent);

      &::after {
        transform: scaleY(1);
        transition: transform var(--fast) var(--transition-in);
      }
    }

    &[disabled] {
      color: var(--lighter-gray);
      cursor: not-allowed;
    }
  }
}
</style>
