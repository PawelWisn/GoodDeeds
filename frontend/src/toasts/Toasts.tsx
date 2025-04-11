import { Toaster } from "react-hot-toast";

function Toasts() {
	return (
		<Toaster
			position="top-center"
			toastOptions={{
				className: "",
				style: {
					padding: "4px 10px",
					margin: "0",
					borderRadius: "10px",
					background: "#333",
					color: "#fff",
				},
			}}
		/>
	);
}

export default Toasts;
