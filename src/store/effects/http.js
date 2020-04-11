import axios from "axios";
import * as jwt from "./jwt";

// axios.defaults.baseURL = getBaseUrl();
axios.defaults.headers.common["Authorization"] = jwt.get()
  ? `Bearer ${jwt.get()}`
  : "";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.timeout = 5000;

export default {
  get: axios.get,
  post: axios.post,
  path: axios.patch,
  delete: axios.delete,
  put: axios.put,
  request: axios.request
};
