<template>
  <div
    ref="container"
    :style="{ minWidth: totalWidth + 'px' }"
    class="v-table" @scroll="onScroll">
    <div class="toolbar" :class="{ shadow: scrolled }">
      <div
        v-if="selectable"
        class="select cell">
        <v-checkbox
          id="select-all"
          :checked="allSelected"
          name="select-all"
          value="all"
          @change="selectAll" />
      </div>
      <div
        v-for="({field, name}, index) in columns"
        :key="field"
        :style="{
          flexBasis: widths && widths[field] ?
            widths[field] + 'px' :
            null
        }"
        class="cell">

        <button
          v-if="sortable"
          :class="{ active: sortVal.field === field }"
          class="sort style-4 no-wrap"
          @click="updateSort(field)">{{ name }}<i
            v-if="sortVal.field === field"
            class="material-icons">{{ sortVal.asc ? 'arrow_downward' : 'arrow_upward' }}</i>
        </button>

        <span
          v-else
          class="style-4">{{ name }}</span>

        <div
          v-if="resizeable && index !== columns.length - 1"
          class="drag-handle"
          draggable
          @drag="drag(field, $event)"
          @dragstart="hideDragImage"
          @dragend="dragEnd">
          <div class="drag-handle-line" />
        </div>

      </div>
    </div>
    <div class="body" :class="{ loading }">
      <template v-if="link">
        <div
          v-for="row in items"
          :key="row[primaryKeyField]"
          :style="{ height: rowHeight + 'px' }"
          :class="{ selected: selection && selection.includes(row[primaryKeyField])}"
          class="link row"
          tabindex="0"
          role="link"
          @click.stop="$router.push(row[link])"
          @keyup.enter.stop="$router.push(row[link])">
          <div
            v-if="selectable"
            class="cell select"
            @click.stop>
            <v-checkbox
              :id="'check-' + row[primaryKeyField]"
              :value="row[primaryKeyField]"
              :checked="selection.includes(row[primaryKeyField])"
              @change="toggleCheckbox(row[primaryKeyField])" />
          </div>
          <div
            v-for="{field, fieldInfo} in columns"
            :key="field"
            :style="{
              flexBasis: widths && widths[field] ?
                widths[field] + 'px' :
                null
            }"
            class="cell">
            <div
              v-if="row[field] === '' || $lodash.isNil(row[field])"
              class="empty">--</div>
            <v-readonly
              v-else-if="useInterfaces && !$lodash.isNil(row[field])"
              :interface-type="fieldInfo.interface"
              :name="field"
              :type="fieldInfo.type"
              :options="fieldInfo.options"
              :value="row[field]" />
            <template v-else>{{ row[field] }}</template>
          </div>
        </div>
      </template>

      <template v-else>
        <div
          v-for="row in items"
          :key="row[primaryKeyField]"
          :style="{ height: rowHeight + 'px' }"
          class="row">
          <div
            v-if="selectable"
            class="select"
            @click.stop>
            <v-checkbox
              :id="'check-' + row[primaryKeyField]"
              :value="row[primaryKeyField]"
              :checked="selection.includes(row[primaryKeyField])"
              @change="toggleCheckbox(row[primaryKeyField])" />
          </div>
          <div
            v-for="{field, fieldInfo} in columns"
            :key="field"
            :style="{
              flexBasis: widths && widths[field] ?
                widths[field] + 'px' :
                null
            }"
            class="cell">
              <div
                v-if="row[field] === '' || $lodash.isNil(row[field])"
                class="empty">--</div>
              <v-readonly
                v-else-if="useInterfaces && !$lodash.isNil(row[field])"
                :interface-type="fieldInfo.interface"
                :name="field"
                :type="fieldInfo.type"
                :options="fieldInfo.options"
                :value="row[field]" />
              <template v-else>{{ row[field] }}</template>
          </div>
        </div>
      </template>
      <transition name="fade">
        <div v-if="lazyLoading" class="lazy-loader">
          <v-spinner />
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  name: "v-table",
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    lazyLoading: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      required: true
    },
    height: {
      type: Number,
      default: null
    },
    columns: {
      type: Array,
      required: true
    },
    link: {
      type: String,
      default: null
    },
    selection: {
      type: Array,
      default: null
    },
    sortVal: {
      type: Object,
      default: null
    },
    primaryKeyField: {
      type: String,
      required: true
    },
    rowHeight: {
      type: Number,
      default: 40
    },
    columnWidths: {
      type: Object,
      default: null
    },
    useInterfaces: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      widths: {},
      lastDragXPosition: null,
      windowHeight: 0,
      scrolled: false
    };
  },
  computed: {
    allSelected() {
      const primaryKeyFields = this.items
        .map(item => item[this.primaryKeyField])
        .sort();
      const selection = [...this.selection];
      selection.sort();
      return (
        this.selection.length > 0 &&
        this.$lodash.isEqual(primaryKeyFields, selection)
      );
    },
    selectable() {
      return Array.isArray(this.selection);
    },
    sortable() {
      return this.$lodash.isObject(this.sortVal);
    },
    resizeable() {
      return this.$lodash.isObject(this.columnWidths);
    },
    totalWidth() {
      return (
        Object.keys(this.widths)
          .map(field => this.widths[field])
          .reduce((acc, val) => acc + val, 0) +
        30 +
        40
      );
    }
  },
  created() {
    this.initWidths();
  },
  watch: {
    columnWidths() {
      this.initWidths();
    },
    columns() {
      this.initWidths();
    }
  },
  methods: {
    selectAll() {
      if (this.allSelected) {
        return this.$emit("select", []);
      }

      const primaryKeyFields = this.items.map(
        item => item[this.primaryKeyField]
      );
      return this.$emit("select", primaryKeyFields);
    },
    updateSort(field) {
      const newSortVal = {
        field,
        asc: field === this.sortVal.field ? !this.sortVal.asc : "ASC"
      };
      this.$emit("sort", newSortVal);
    },
    toggleCheckbox(primaryKeyField) {
      const selection = [...this.selection];

      if (this.selection.includes(primaryKeyField)) {
        selection.splice(selection.indexOf(primaryKeyField), 1);
      } else {
        selection.push(primaryKeyField);
      }

      this.$emit("select", selection);
    },
    drag(field, event) {
      const { screenX } = event;

      if (screenX !== 0 && this.lastDragXPosition) {
        const delta = screenX - this.lastDragXPosition;

        const newPos = this.widths[field] + delta;
        this.widths[field] = newPos;
      }

      this.lastDragXPosition = screenX;
    },
    dragEnd() {
      this.lastDragXPosition = 0;
      this.$emit("widths", this.widths);
    },
    hideDragImage(event) {
      const img = document.createElement("img");
      img.src =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      event.dataTransfer.setDragImage(img, 0, 0);
      event.dataTransfer.effectAllowed = "move";
    },
    initWidths() {
      const widths = {};

      this.columns.forEach(({ field }) => {
        widths[field] = (this.columnWidths && this.columnWidths[field]) || 200;
      });

      this.widths = widths;
    },
    onScroll(event) {
      const { scrollHeight, clientHeight, scrollTop } = event.srcElement;
      const totalScroll = scrollHeight - clientHeight;
      const delta = totalScroll - scrollTop;
      if (delta <= 500) this.$emit("scroll-end");
      this.scrolled = scrollTop > 0;
    }
  }
};
</script>

<style lang="scss" scoped>
.v-table {
  width: 100%;
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
  position: relative;
  max-height: calc(100vh - var(--header-height));
  padding-bottom: var(--page-padding-bottom);
}

.toolbar,
.row {
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid var(--lightest-gray);
  box-sizing: content-box;
}

.toolbar {
  position: sticky;
  height: var(--header-height);
  left: 0;
  top: 0;
  z-index: +1;
  background-color: var(--white);
  transition: box-shadow var(--fast) var(--transition-out);

  &.shadow {
    box-shadow: var(--box-shadow);
    transition: box-shadow var(--medium) var(--transition-in);
  }
}

.body {
  position: relative;
  transition: opacity var(--medium) var(--transition-out);
  opacity: 1;
  height: calc(100% - var(--header-height));
  overflow: scroll;
  -webkit-overflow-scrolling: touch;

  &.loading {
    transition: opacity var(--medium) var(--transition-in);
    opacity: 0.4;
  }
}

.drag-handle {
  width: 8px;
  height: 100%;
  cursor: col-resize;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  right: 10px;
  opacity: 0;
  transition: opacity var(--fast) var(--transition-out);
}

.drag-handle-line {
  background-color: var(--lightest-gray);
  width: 1px;
  height: 60%;
  transition: background-color var(--fast) var(--transition);
}

.drag-handle:hover .drag-handle-line {
  background-color: var(--gray);
}

.toolbar:hover .drag-handle {
  opacity: 1;
  transition: opacity var(--medium) var(--transition-in);
}

.row {
  opacity: 1;
  background-color: var(--white);
  box-sizing: border-box;
}

.row.link:hover {
  background-color: var(--highlight);
  cursor: pointer;
}

.row.selected {
  background-color: var(--highlight);
}

.sort.active {
  color: var(--gray);
}

.cell {
  flex-shrink: 0;
  flex-basis: 200px;
  padding-right: 20px;
  position: relative;
  overflow: hidden;
  max-height: 100%;
}

.cell:last-of-type {
  flex-grow: 1;
}

.empty {
  color: var(--lighter-gray);
}

.toolbar .cell:not(.select) {
  height: 100%;
  display: flex;
  align-items: center;
}

.sort {
  width: 100%;
  height: 100%;
  text-align: left;
  transition: color var(--fast) var(--transition);
  position: relative;
}

.sort:hover {
  color: var(--gray);
}

.sort > i {
  font-size: 12px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 5px;
}

.select {
  flex-basis: 30px;
  padding: 0;
  margin-left: -3px; /* Shift to accomodate material design icons checkbox */
  margin-right: 8px;
}

.lazy-loader {
  pointer-events: none;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  max-width: calc(100vw - var(--nav-sidebar-width));
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 1),
    rgba(255, 255, 255, 0)
  );
  opacity: 1;
}

.fade-enter-active {
  transition: var(--slow) var(--transition-in);
}

.fade-leave-active {
  transition: var(--slow) var(--transition-out);
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
