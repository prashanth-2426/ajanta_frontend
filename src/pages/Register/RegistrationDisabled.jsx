import { Button } from "primereact/button";

const RegistrationDisabled = () => {
  return (
    <div className="flex align-items-center justify-content-center h-screen">
      <div className="text-center p-5 shadow-2 border-round">
        <h2>Registration Disabled</h2>
        <p>This portal is restricted to authorized users only.</p>
        <Button
          label="Go to Login"
          icon="pi pi-sign-in"
          onClick={() => (window.location.href = "/login")}
        />
      </div>
    </div>
  );
};

export default RegistrationDisabled;
