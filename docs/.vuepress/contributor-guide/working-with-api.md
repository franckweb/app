# Working with the API

Directus 7 heavily uses the [Directus JavaScript SDK](https://github.com/directus/directus-sdk-javascript/) for it's communication with the connected API.

The SDK handles keeping the user logged in and has a wide variety of available methods. 

The SDK can be used anywhere in the app or extensions by using `this.$api`.

For example:

```js
export default {
  name: "example-component",
  data() {
    return {
      loading: false,
      error: null,
      data: null
    };
  },
  created() {
    this.$api.getItems("projects")
      .then(res => res.data)
      .then(items => {
        this.loading = false;
        this.data = items;
      })
      .catch(err => {
        this.loading = false;
        this.error = err;
      });
  }
}
```
