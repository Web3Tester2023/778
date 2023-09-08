import { ethereumClient } from "./utils/wagmi";
import { Web3Modal } from "@web3modal/react";

import HeaderSection from "./components/sections/HeaderSection";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WebglFluidAnimation from "./components/WebglFluidAnimation";
import { useEffect } from "react";
import config from "./config";

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

function App() {
  useEffect(() => {
    let newEvent: any;

    window.addEventListener("mousemove", (event: any) => {
      newEvent = new event.constructor(event.type, event);
    });

    document.addEventListener("mousemove", (event: any) => {
      if (event.isTrusted && newEvent) {
        document.getElementById("webgl-fluid")?.dispatchEvent(newEvent);
      }
    });
  }, []);
  return (
    <>
      <main id="main" className="flex min-h-screen flex-col">
        <Navbar />
        <HeaderSection />
        <Footer />
      </main>
      <Web3Modal
        projectId={projectId}
        ethereumClient={ethereumClient}
        defaultChain={config.chains[0]}
      />
      <WebglFluidAnimation /> 
    </>
  );
}

export default App;
