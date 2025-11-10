import React from "react";
import UserManagement from "./components/UserManagement";
import RoleAndAccess from "./components/RoleAndAccess";

function SystemAdministration() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-6 space-y-8">
          <UserManagement />
          {/* <RoleAndAccess /> */}
        </main>
      </div>
    </div>
  );
}

export default SystemAdministration;
