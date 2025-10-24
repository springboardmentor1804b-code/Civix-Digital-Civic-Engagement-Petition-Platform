import { useState } from "react";

const RoleSelect = ({ onSelect }) => {
  const [role, setRole] = useState("citizen");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSelect(role);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <input
          type="radio"
          name="role"
          value="citizen"
          checked={role === "citizen"}
          onChange={() => setRole("citizen")}
        />
        Citizen
      </label>
      <label>
        <input
          type="radio"
          name="role"
          value="official"
          checked={role === "official"}
          onChange={() => setRole("official")}
        />
        Official
      </label>
      <button type="submit">Select Role</button>
    </form>
  );
};

export default RoleSelect;
