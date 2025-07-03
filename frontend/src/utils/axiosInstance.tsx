import axios from "axios";
import Cookies from "js-cookie";

const axiosClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,

	headers: {
		"Content-Type": "application/json",
	},
});

const csrftoken = Cookies.get("csrftoken");
if (csrftoken) {
	axiosClient.defaults.headers.common["X-CSRFToken"] = csrftoken;
}

export default axiosClient;
