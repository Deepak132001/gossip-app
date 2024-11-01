import { Button, Text } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import useLogout from "../hooks/useLogout";

export const SettingsPage = () => {
	const showToast = useShowToast();
	const logout = useLogout();

	const freezeAccount = async () => {
		if (!window.confirm("Sei sicuro di voler congelare il tuo account?")) return;

		try {
			const res = await fetch("/api/users/freeze", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
			});
			const data = await res.json();

			if (data.error) {
				return showToast("Error", data.error, "error");
			}
			if (data.success) {
				await logout();
				showToast("Success", "Il tuo account è stato congelato", "success");
			}
		} catch (error) {
			showToast("Error", error.message, "error");
		}
	};

	return (
		<>
			<Text my={1} fontWeight={"bold"}>
				Freeze Your Account
			</Text>
			<Text my={1}>Puoi sbloccare il tuo account in qualsiasi momento effettuando accesso.</Text>
			<Button size={"sm"} colorScheme='red' onClick={freezeAccount}>
				Freeze
			</Button>
		</>
	);
};
