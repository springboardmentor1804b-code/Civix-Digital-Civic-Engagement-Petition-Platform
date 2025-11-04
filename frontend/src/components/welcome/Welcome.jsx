import Login from "./Login";
import Register from "./Register";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function Welcome() {
    const [page, setPage] = useState("login");
    const { login, register } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData, type) => {
        setLoading(true);
        try {
            if (type === 'login') {
                await login(formData);
            } else {
                const { name, email, password, location, role } = formData;
                await register({ name, email, password, location, role });
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {(page === "login") ?
                <Login setPage={setPage} onSubmit={handleSubmit} loading={loading} /> :
                <Register setPage={setPage} onSubmit={handleSubmit} loading={loading} />}
        </>
    )
}
export default Welcome;