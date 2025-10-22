import Login from "./Login";
import Register from "./Register";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function Welcome() {
    const [page, setPage] = useState("login");
    const { login, register } = useAuth();

    const handleSubmit = async (formData, type) => {
        try {
            if (type === 'login') {
                await login(formData);
            } else {
                const { name, email, password, location, role } = formData;
                await register({ name, email, password, location, role });
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <>
            {(page === "login") ?
                <Login setPage={setPage} onSubmit={handleSubmit} /> :
                <Register setPage={setPage} onSubmit={handleSubmit} />}
        </>
    )
}
export default Welcome;