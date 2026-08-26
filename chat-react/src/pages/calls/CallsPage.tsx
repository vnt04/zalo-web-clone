import { Outlet } from "react-router-dom";
import { CallsSidebar } from "../../components/sidebars/calls/CallsSidebar";

export const CallsPage = () => {
  return (
    <>
      <CallsSidebar />
      <Outlet />
    </>
  );
};
