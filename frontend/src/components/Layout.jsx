import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="min-h-screen min-h-[100svh]">
      <div className="flex min-h-[100svh]">
        {showSidebar && <Sidebar />}

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar />

          <main
            className={`min-w-0 flex-1 ${
              showSidebar ? "pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0" : ""
            }`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
export default Layout;
