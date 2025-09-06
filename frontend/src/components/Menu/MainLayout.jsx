import { Outlet } from "react-router-dom";
import Menu from "./Menu";
import "./MainLayout.css";

export default function MainLayout() {
  console.log("Main layout rendered.");
  return (
    <div>
      <Menu />
      <main>
        <Outlet /> {}
      </main>
    </div>
  );
}
